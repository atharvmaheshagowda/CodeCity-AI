"""
Commit & Diff Risk Checker Engine for CodeCity AI (C2).

Evaluates Git commits or unified diff strings:
- Extracts modified files
- Computes union cascading blast radius
- Identifies all affected unit tests
- Computes combined joint failure probability: P = 1 - prod(1 - r_i)
"""

import re
from typing import Dict, List, Any
import networkx as nx

def parse_unified_diff(diff_text: str) -> List[str]:
    """
    Extracts modified file paths from standard Git unified diff format.
    Matches lines like: +++ b/src/flask/app.py
    """
    pattern = re.compile(r'^\+\+\+\s+b/(.+)$', re.MULTILINE)
    matches = pattern.findall(diff_text)
    return [m.replace("\\", "/").strip() for m in matches if m.endswith(".py")]


def evaluate_commit_or_diff_risk(
    modified_files: List[str],
    repo_files: List[Dict[str, Any]],
    G: nx.DiGraph
) -> Dict[str, Any]:
    """
    Calculates combined risk, union blast radius, and test impact for modified_files.
    """
    file_map = {f["path"]: f for f in repo_files}

    # Match files
    resolved_nodes = []
    for mf in modified_files:
        clean = mf.replace("\\", "/").strip()
        if clean in file_map:
            resolved_nodes.append(file_map[clean])
        else:
            match = next((f for f in repo_files if f["filename"] == clean or f["path"].endswith(clean)), None)
            if match:
                resolved_nodes.append(match)

    if not resolved_nodes:
        return {
            "is_valid": False,
            "message": "None of the modified files were found in the current repository.",
            "touched_files": [],
            "union_blast_radius_count": 0,
            "combined_failure_probability": 0.0,
            "affected_tests": []
        }

    # Combined failure probability: P = 1 - prod(1 - r_i)
    prob_no_defect = 1.0
    for node in resolved_nodes:
        r = float(node.get("risk_probability", 0.15))
        prob_no_defect *= (1.0 - r)
    combined_risk = round(1.0 - prob_no_defect, 4)

    # Union blast radius traversal across all touched files
    union_dependents = set()
    for node in resolved_nodes:
        p = node["path"]
        if p in G:
            # All predecessors in G import p (dependents)
            deps = list(G.predecessors(p))
            for d in deps:
                union_dependents.add(d)

    # Find affected tests in the union
    affected_tests = [
        d for d in union_dependents
        if "test" in d.lower() or d.split("/")[-1].startswith("test_")
    ]

    return {
        "is_valid": True,
        "touched_files_count": len(resolved_nodes),
        "touched_files": [n["path"] for n in resolved_nodes],
        "combined_failure_probability": combined_risk,
        "combined_risk_percentage": round(combined_risk * 100, 1),
        "union_blast_radius_count": len(union_dependents),
        "union_dependents": sorted(list(union_dependents)),
        "affected_tests_count": len(affected_tests),
        "affected_tests": sorted(affected_tests),
        "risk_level": "High" if combined_risk >= 0.70 else ("Moderate" if combined_risk >= 0.35 else "Low")
    }

