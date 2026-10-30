"""
Risk Contagion Diffusion Engine for CodeCity AI (B3).

Computes Personalized-PageRank style risk diffusion through the software architecture,
modeling how upstream library defects propagate downstream to caller modules.
"""

from typing import Dict, List, Any
import networkx as nx
import numpy as np

def compute_risk_contagion(
    files_list: List[Dict[str, Any]],
    G: nx.DiGraph,
    damping: float = 0.85
) -> Dict[str, Any]:
    """
    Propagates defect risk along dependency edges using a Personalized PageRank diffusion process.
    - If module A imports module B, edge is A -> B.
    - If B contains a defect, risk diffuses from B back to A (along reversed edges).
    """
    if not files_list:
        return {"scores": {}, "attributions": {}}

    file_paths = [f["path"] for f in files_list]
    risk_dict = {f["path"]: max(0.01, float(f.get("risk_probability", 0.15))) for f in files_list}

    # Ensure all nodes exist in G
    G_full = G.copy()
    for p in file_paths:
        if p not in G_full:
            G_full.add_node(p)

    # In G, A -> B means A imports B.
    # Risk flows from B (imported file) to A (dependent importer).
    # Therefore, we diffuse on G.reverse()!
    G_rev = G_full.reverse()

    # Total risk for personalization normalization
    total_risk = sum(risk_dict.values())
    if total_risk <= 0:
        total_risk = 1.0

    personalization = {p: risk_dict.get(p, 0.01) / total_risk for p in file_paths}

    # Compute Personalized PageRank diffusion
    try:
        raw_pr = nx.pagerank(
            G_rev,
            alpha=damping,
            personalization=personalization,
            max_iter=200,
            tol=1e-6
        )
    except Exception:
        # Fallback to local 1-hop diffusion if graph is degenerate
        raw_pr = {}
        for p in file_paths:
            base = risk_dict.get(p, 0.15)
            # Add 25% of imported dependencies' risk
            imported = list(G_full.successors(p)) if p in G_full else []
            imported_risk = sum(risk_dict.get(dep, 0.1) for dep in imported)
            raw_pr[p] = base + 0.25 * imported_risk

    # Normalize contagion scores to [0.05, 0.98] range anchored around original risk scale
    values = np.array([raw_pr.get(p, 0.0) for p in file_paths])
    min_v, max_v = float(values.min()), float(values.max())
    range_v = max(1e-6, max_v - min_v)

    # Blend original risk (60%) with diffusion score (40%) to prevent artificial inflation
    contagion_scores: Dict[str, float] = {}
    for p in file_paths:
        orig = risk_dict.get(p, 0.15)
        diff_norm = (raw_pr.get(p, 0.0) - min_v) / range_v
        # Blended contagion score
        blended = 0.55 * orig + 0.45 * diff_norm
        contagion_scores[p] = round(float(np.clip(blended, 0.02, 0.98)), 3)

    # Compute explainable neighbor contributions
    attributions: Dict[str, List[Dict[str, Any]]] = {}
    for f in files_list:
        p = f["path"]
        # In G, successors are the files p imports (dependencies)
        imported_deps = list(G_full.successors(p)) if p in G_full else []
        
        contribs = []
        for dep in imported_deps:
            dep_risk = risk_dict.get(dep, 0.1)
            contribs.append({
                "neighbor": dep,
                "neighbor_name": dep.split("/")[-1],
                "base_risk": round(dep_risk, 3),
                "relationship": "imported_dependency"
            })

        # Predecessors are the files importing p (dependents)
        dependents = list(G_full.predecessors(p)) if p in G_full else []
        for dep in dependents:
            dep_risk = risk_dict.get(dep, 0.1)
            contribs.append({
                "neighbor": dep,
                "neighbor_name": dep.split("/")[-1],
                "base_risk": round(dep_risk, 3),
                "relationship": "dependent_caller"
            })

        contribs.sort(key=lambda x: x["base_risk"], reverse=True)
        attributions[p] = contribs[:5]

    return {
        "damping_factor": damping,
        "contagion_scores": contagion_scores,
        "attributions": attributions
    }

