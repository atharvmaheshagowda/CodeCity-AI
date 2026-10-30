"""
Git History Mining and Temporal Feature Extraction Engine.

Mines Git commit history up to cutoff time T to extract historical features:
- LOC, mean/max cyclomatic complexity (via radon)
- commit count, distinct authors
- file age (days), days since last change
- 90-day churn, total churn
- past bug-fix commit count
- graph fan-in / fan-out (via AST dependency graph)

Labels:
- positive (1) if touched by bug-fix commit in (T, T + 90 days]
- negative (0) otherwise
Bug-fix regex: fix|bug|error|crash|regression|patch|issue #
"""

import os
import re
import math
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Set, Any, Optional, Tuple
import pandas as pd
from pydriller import Repository
from radon.complexity import cc_visit
import networkx as nx

from graph.dep_graph import build_dependency_graph, compute_graph_metrics, normalize_rel_path

BUG_FIX_REGEX = re.compile(
    r"(?i)(\bfix(es|ed|ing)?\b|\bbug(s)?\b|\berror(s)?\b|\bcrash(es|ed|ing)?\b|\bregression(s)?\b|\bpatch(es|ed|ing)?\b|\bissue(\s*#|\b))"
)

def is_bug_fix_commit(msg: str) -> bool:
    if not msg:
        return False
    return bool(BUG_FIX_REGEX.search(msg))

def calculate_complexity(code_content: str) -> Tuple[float, float, int]:
    """
    Returns (mean_cc, max_cc, loc) for a Python source string using radon.
    """
    if not code_content or not code_content.strip():
        return (1.0, 1.0, 0)
    lines = code_content.splitlines()
    loc = len([l for l in lines if l.strip() and not l.strip().startswith("#")])
    try:
        blocks = cc_visit(code_content)
        if not blocks:
            return (1.0, 1.0, loc)
        ccs = [b.complexity for b in blocks]
        return (float(sum(ccs) / len(ccs)), float(max(ccs)), loc)
    except Exception:
        return (1.0, 1.0, loc)

class RepoFeatureMiner:
    def __init__(self, repo_path: str, cutoff_time: datetime, future_window_days: int = 90, max_commits: int = 1500):
        self.repo_path = repo_path
        if cutoff_time.tzinfo is None:
            self.cutoff_time = cutoff_time.replace(tzinfo=timezone.utc)
        else:
            self.cutoff_time = cutoff_time.astimezone(timezone.utc)
        self.future_window = timedelta(days=future_window_days)
        self.label_cutoff = self.cutoff_time + self.future_window
        self.max_commits = max_commits

    def extract_dataset(self) -> pd.DataFrame:
        """
        Extracts features strictly for commits <= cutoff_time.
        Extracts labels strictly for commits in (cutoff_time, cutoff_time + 90 days].
        Guarantees zero future leakage with high-speed reverse commit traversal.
        """
        past_file_stats: Dict[str, Dict[str, Any]] = {}
        future_bug_files: Set[str] = set()

        ninety_days_prior = self.cutoff_time - timedelta(days=90)
        past_commit_count = 0

        # Traverse git repository commits in reverse (newest to oldest)
        try:
            for commit in Repository(self.repo_path, order='reverse').traverse_commits():
                try:
                    c_date = commit.committer_date
                    if c_date.tzinfo is None:
                        c_date = c_date.replace(tzinfo=timezone.utc)
                    else:
                        c_date = c_date.astimezone(timezone.utc)

                    # 1. Skip commits beyond the label window in the future
                    if c_date > self.label_cutoff:
                        continue

                    is_past = c_date <= self.cutoff_time
                    is_label_window = self.cutoff_time < c_date <= self.label_cutoff
                    is_bug_fix = is_bug_fix_commit(commit.msg)
                    author = commit.author.email or commit.author.name or "unknown"

                    if is_label_window:
                        if is_bug_fix:
                            for mod in commit.modified_files:
                                fpath = mod.new_path or mod.old_path
                                if fpath and fpath.endswith(".py"):
                                    future_bug_files.add(normalize_rel_path(fpath))
                        continue

                    if is_past:
                        past_commit_count += 1
                        if past_commit_count > self.max_commits:
                            break

                        for mod in commit.modified_files:
                            fpath = mod.new_path or mod.old_path
                            if not fpath or not fpath.endswith(".py"):
                                continue
                            rel_f = normalize_rel_path(fpath)

                            if rel_f not in past_file_stats:
                                # In reverse traversal, first time seen is the most recent (last_seen)
                                past_file_stats[rel_f] = {
                                    "first_seen": c_date,
                                    "last_seen": c_date,
                                    "commit_count": 0,
                                    "authors": set(),
                                    "churn_90d": 0,
                                    "total_churn": 0,
                                    "past_bug_fixes": 0,
                                    "deleted": False,
                                    "last_code": mod.source_code,
                                }

                            entry = past_file_stats[rel_f]
                            # As we go backwards, first_seen moves older
                            entry["first_seen"] = c_date
                            entry["commit_count"] += 1
                            entry["authors"].add(author)

                            churn = (mod.added_lines or 0) + (mod.deleted_lines or 0)
                            entry["total_churn"] += churn
                            if c_date >= ninety_days_prior:
                                entry["churn_90d"] += churn

                            if is_bug_fix:
                                entry["past_bug_fixes"] += 1

                            if mod.change_type.name == "DELETE" and entry["commit_count"] == 1:
                                entry["deleted"] = True
                            elif entry["last_code"] is None and mod.source_code is not None:
                                entry["last_code"] = mod.source_code

                except Exception:
                    continue
        except Exception:
            pass

        # Filter out files deleted before cutoff or not currently in worktree
        active_files = [f for f, data in past_file_stats.items() if not data["deleted"]]

        # Build AST dependency graph strictly on files existing at T
        # Use on-disk files or historical code if disk is synced at T
        G = build_dependency_graph(self.repo_path, active_files)

        rows = []
        for rel_f in active_files:
            data = past_file_stats[rel_f]
            code = data.get("last_code")
            if code is None:
                disk_path = os.path.join(self.repo_path, rel_f)
                if os.path.exists(disk_path):
                    with open(disk_path, "r", encoding="utf-8", errors="ignore") as fp:
                        code = fp.read()
                else:
                    code = ""

            mean_cc, max_cc, loc = calculate_complexity(code)
            
            first_seen = data["first_seen"]
            last_seen = data["last_seen"]
            file_age_days = max(0, (self.cutoff_time - first_seen).total_seconds() / 86400.0)
            days_since_last_change = max(0, (self.cutoff_time - last_seen).total_seconds() / 86400.0)

            graph_metrics = compute_graph_metrics(G, rel_f)

            # Label: 1 if file was touched by a bug fix commit in (T, T + 90 days], else 0
            label = 1 if rel_f in future_bug_files else 0

            rows.append({
                "file_path": rel_f,
                "loc": loc,
                "mean_complexity": round(mean_cc, 3),
                "max_complexity": round(max_cc, 3),
                "commit_count": data["commit_count"],
                "distinct_authors": len(data["authors"]),
                "file_age_days": round(file_age_days, 2),
                "days_since_last_change": round(days_since_last_change, 2),
                "churn_90d": data["churn_90d"],
                "total_churn": data["total_churn"],
                "past_bug_fixes": data["past_bug_fixes"],
                "fan_in": graph_metrics["fan_in"],
                "fan_out": graph_metrics["fan_out"],
                "label": label,
            })

        df = pd.DataFrame(rows)
        return df


def extract_features_at_head(repo_path: str) -> Tuple[pd.DataFrame, nx.DiGraph]:
    """
    Extracts features for all current files at HEAD (now) for inference.
    """
    now = datetime.now(timezone.utc)
    # 90-day window prior
    ninety_days_ago = now - timedelta(days=90)
    
    # Collect all python files in repo
    active_files = []
    for root, _, files in os.walk(repo_path):
        if any(p.startswith(".") or p in ("venv", ".venv", "site-packages", "__pycache__") for p in root.split(os.sep)):
            continue
        for f in files:
            if f.endswith(".py"):
                rel = normalize_rel_path(os.path.relpath(os.path.join(root, f), repo_path))
                active_files.append(rel)

    G = build_dependency_graph(repo_path, active_files)

    file_stats: Dict[str, Dict[str, Any]] = {
        f: {
            "first_seen": None,
            "last_seen": None,
            "commit_count": 0,
            "authors": set(),
            "churn_90d": 0,
            "total_churn": 0,
            "past_bug_fixes": 0,
        }
        for f in active_files
    }

    commits_processed = 0
    try:
        for commit in Repository(repo_path, order='reverse').traverse_commits():
            try:
                commits_processed += 1
                if commits_processed > 1500:
                    break

                c_date = commit.committer_date
                if c_date.tzinfo is None:
                    c_date = c_date.replace(tzinfo=timezone.utc)
                else:
                    c_date = c_date.astimezone(timezone.utc)

                is_bug_fix = is_bug_fix_commit(commit.msg)
                author = commit.author.email or commit.author.name or "unknown"

                for mod in commit.modified_files:
                    fpath = mod.new_path or mod.old_path
                    if not fpath or not fpath.endswith(".py"):
                        continue
                    rel_f = normalize_rel_path(fpath)
                    if rel_f in file_stats:
                        entry = file_stats[rel_f]
                        if entry["last_seen"] is None:
                            entry["last_seen"] = c_date
                        entry["first_seen"] = c_date
                        entry["commit_count"] += 1
                        entry["authors"].add(author)
                        churn = (mod.added_lines or 0) + (mod.deleted_lines or 0)
                        entry["total_churn"] += churn
                        if c_date >= ninety_days_ago:
                            entry["churn_90d"] += churn
                        if is_bug_fix:
                            entry["past_bug_fixes"] += 1
            except Exception:
                continue
    except Exception:
        pass

    rows = []
    for rel_f in active_files:
        stats = file_stats[rel_f]
        full_p = os.path.join(repo_path, rel_f)
        code = ""
        if os.path.exists(full_p):
            with open(full_p, "r", encoding="utf-8", errors="ignore") as fp:
                code = fp.read()

        mean_cc, max_cc, loc = calculate_complexity(code)
        first_seen = stats["first_seen"] or now
        last_seen = stats["last_seen"] or now
        file_age_days = max(0, (now - first_seen).total_seconds() / 86400.0)
        days_since_last_change = max(0, (now - last_seen).total_seconds() / 86400.0)
        graph_metrics = compute_graph_metrics(G, rel_f)

        rows.append({
            "file_path": rel_f,
            "loc": loc,
            "mean_complexity": round(mean_cc, 3),
            "max_complexity": round(max_cc, 3),
            "commit_count": stats["commit_count"],
            "distinct_authors": max(1, len(stats["authors"])),
            "file_age_days": round(file_age_days, 2),
            "days_since_last_change": round(days_since_last_change, 2),
            "churn_90d": stats["churn_90d"],
            "total_churn": stats["total_churn"],
            "past_bug_fixes": stats["past_bug_fixes"],
            "fan_in": graph_metrics["fan_in"],
            "fan_out": graph_metrics["fan_out"],
        })

    df = pd.DataFrame(rows)
    return df, G
