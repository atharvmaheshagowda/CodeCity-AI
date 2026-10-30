"""
Hidden Coupling Engine for CodeCity AI (B1).

Mines co-change patterns from Git history to identify files that frequently change
together despite having NO direct AST import relationship.
"""

from typing import Dict, List, Any, Set, Tuple
import networkx as nx

def mine_hidden_coupling(
    commit_history: List[Dict[str, Any]],
    G: nx.DiGraph,
    repo_files: List[Dict[str, Any]],
    min_support: int = 2,
    min_jaccard: float = 0.15,
    max_commit_files: int = 30
) -> Dict[str, Any]:
    """
    Analyzes historical commits to detect hidden logical coupling between files.
    Excludes files connected by direct AST import edges.
    """
    file_paths = {f["path"] for f in repo_files}
    file_map = {f["path"]: f for f in repo_files}

    # Minimum history threshold
    if len(commit_history) < 5:
        return {
            "has_enough_history": False,
            "message": "Not enough Git commit history (< 5 commits) to reliably detect co-change coupling.",
            "total_commits_analyzed": len(commit_history),
            "pairs": []
        }

    # Track commit frequency per file and co-occurrence per pair
    file_commit_counts: Dict[str, int] = {}
    pair_co_change_counts: Dict[Tuple[str, str], int] = {}
    pair_commit_messages: Dict[Tuple[str, str], List[str]] = {}

    filtered_commits = 0
    for commit in commit_history:
        changed_raw = commit.get("files", [])
        # Match only files that are python repo files
        changed = [f for f in changed_raw if f in file_paths]

        # Ignore bulk commits touching > 30 files
        if len(changed) > max_commit_files or len(changed) < 2:
            filtered_commits += 1
            continue

        for f in changed:
            file_commit_counts[f] = file_commit_counts.get(f, 0) + 1

        msg = commit.get("message", "Commit update").split("\n")[0]
        # Generate pairs
        sorted_changed = sorted(changed)
        for i in range(len(sorted_changed)):
            for j in range(i + 1, len(sorted_changed)):
                pair = (sorted_changed[i], sorted_changed[j])
                pair_co_change_counts[pair] = pair_co_change_counts.get(pair, 0) + 1
                pair_commit_messages.setdefault(pair, []).append(msg)

    # Direct import edges in G (directed or undirected)
    direct_edges = set()
    for u, v in G.edges():
        direct_edges.add((u, v))
        direct_edges.add((v, u))

    # Evaluate candidate pairs
    coupling_pairs: List[Dict[str, Any]] = []

    for (file_a, file_b), co_count in pair_co_change_counts.items():
        if co_count < min_support:
            continue

        # EXCLUDE direct import edges
        if (file_a, file_b) in direct_edges or (file_b, file_a) in direct_edges:
            continue

        count_a = file_commit_counts.get(file_a, co_count)
        count_b = file_commit_counts.get(file_b, co_count)

        union_count = count_a + count_b - co_count
        jaccard = round(co_count / max(1, union_count), 3)

        if jaccard < min_jaccard:
            continue

        conf_a = round(co_count / max(1, count_a), 3)
        conf_b = round(co_count / max(1, count_b), 3)

        # Generate explanatory narrative
        reasons = []
        if co_count >= 4:
            reasons.append(f"Changed together across {co_count} separate commits")
        else:
            reasons.append(f"Co-committed in {co_count} distinct updates")

        fname_a = file_a.split("/")[-1]
        fname_b = file_b.split("/")[-1]

        if "test" in file_a.lower() and "test" in file_b.lower():
            reasons.append("Parallel test suites updated simultaneously")
        elif "model" in file_a.lower() or "schema" in file_b.lower():
            reasons.append("Implicit data schema contract or state synchronization")
        else:
            reasons.append("Shared runtime configuration, data format, or event dependency without direct Python import")

        sample_msgs = pair_commit_messages.get((file_a, file_b), [])[:3]

        coupling_pairs.append({
            "source": file_a,
            "target": file_b,
            "file_a": file_a,
            "file_b": file_b,
            "source_name": fname_a,
            "target_name": fname_b,
            "fname_a": fname_a,
            "fname_b": fname_b,
            "support": co_count,
            "jaccard": jaccard,
            "jaccard_similarity": jaccard,
            "confidence_forward": conf_a,
            "confidence_backward": conf_b,
            "has_ast_edge": False,
            "explanation": " • ".join(reasons),
            "sample_commits": sample_msgs
        })

    # Sort by co-change support and Jaccard similarity descending
    coupling_pairs.sort(key=lambda x: (x["support"], x["jaccard_similarity"]), reverse=True)

    return {
        "has_enough_history": True,
        "total_commits_analyzed": len(commit_history),
        "mined_coupling_pairs_count": len(coupling_pairs),
        "pairs": coupling_pairs
    }
