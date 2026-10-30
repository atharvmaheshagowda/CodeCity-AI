"""
Enriches all cached demo repositories with:
1. pagerank (calculated via networkx pagerank on graph_edges)
2. betweenness_centrality (calculated via networkx betweenness_centrality on graph_edges)
3. line_failure (calculated via diagnose_file_failure)
"""

import os
import sys
import json
import networkx as nx

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from intelligence.line_diagnostics import diagnose_file_failure

CACHED_DEMOS_DIR = os.path.join(BACKEND_DIR, "data", "cached_demos")

def enrich_all():
    if not os.path.exists(CACHED_DEMOS_DIR):
        print("Cached demos dir not found:", CACHED_DEMOS_DIR)
        return

    for fname in os.listdir(CACHED_DEMOS_DIR):
        if not fname.endswith(".json"):
            continue
        p = os.path.join(CACHED_DEMOS_DIR, fname)
        with open(p, "r", encoding="utf-8") as fp:
            data = json.load(fp)

        files = data.get("files", [])
        edges = data.get("graph_edges", [])

        G = nx.DiGraph()
        for f in files:
            G.add_node(f["path"])
        for e in edges:
            G.add_edge(e["source"], e["target"])

        try:
            pr_scores = nx.pagerank(G, alpha=0.85, max_iter=100)
        except Exception:
            pr_scores = {n: 1.0 / max(1, len(G)) for n in G.nodes()}

        try:
            betweenness_scores = nx.betweenness_centrality(G)
        except Exception:
            betweenness_scores = {n: 0.0 for n in G.nodes()}

        for f in files:
            fpath = f["path"]
            f["pagerank"] = round(float(pr_scores.get(fpath, 0.0)), 4)
            f["betweenness_centrality"] = round(float(betweenness_scores.get(fpath, 0.0)), 4)
            f["line_failure"] = diagnose_file_failure(fpath, f)

        with open(p, "w", encoding="utf-8") as fp:
            json.dump(data, fp, indent=2)

        print(f"Enriched {fname}: {len(files)} files with pagerank, betweenness_centrality, line_failure.")

if __name__ == "__main__":
    enrich_all()
