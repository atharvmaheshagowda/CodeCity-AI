"""
Blast Radius Reverse BFS & Impact Score Test:
Validates multi-hop blast radius traversal (hop 1, hop 2, hop 3) and impact formula.
"""

import math
import networkx as nx
import pytest
from graph.dep_graph import compute_blast_radius, compute_impact_score

def test_blast_radius_multi_hop_bfs():
    # Construct a known chain and branching tree:
    # Core (database.py) <- Hop 1 (repository.py) <- Hop 2 (service.py) <- Hop 3 (controller.py)
    # Also: database.py <- Hop 1 (cache.py)
    # Edge A -> B means A depends on B.
    G = nx.DiGraph()
    G.add_edge("repository.py", "database.py")
    G.add_edge("cache.py", "database.py")
    G.add_edge("service.py", "repository.py")
    G.add_edge("controller.py", "service.py")
    G.add_edge("cli.py", "service.py")
    G.add_edge("isolated.py", "other.py")

    # Blast radius of database.py (everything that breaks if database.py breaks)
    res = compute_blast_radius(G, "database.py", max_depth=3)

    assert res["target"] == "database.py"
    # Hop 1: direct dependents (repository.py, cache.py)
    assert set(res["hops"][1]) == {"repository.py", "cache.py"}
    # Hop 2: dependents of Hop 1 (service.py depends on repository.py)
    assert set(res["hops"][2]) == {"service.py"}
    # Hop 3: dependents of Hop 2 (controller.py and cli.py depend on service.py)
    assert set(res["hops"][3]) == {"controller.py", "cli.py"}

    # Total dependents = 2 + 1 + 2 = 5
    assert res["total_count"] == 5
    assert set(res["all_dependents"]) == {"repository.py", "cache.py", "service.py", "controller.py", "cli.py"}
    assert "isolated.py" not in res["all_dependents"]

def test_blast_radius_leaf_node():
    # If a top-level controller breaks, nothing depends on it
    G = nx.DiGraph()
    G.add_edge("controller.py", "service.py")
    res = compute_blast_radius(G, "controller.py", max_depth=3)
    assert res["total_count"] == 0
    assert res["hops"][1] == []
    assert res["hops"][2] == []
    assert res["hops"][3] == []

def test_impact_score_formula():
    # Formula: impact = risk_probability * (1 + ln(1 + dependents))
    risk = 0.8
    deps = 5
    expected = 0.8 * (1.0 + math.log(1.0 + 5.0))
    actual = compute_impact_score(risk, deps)
    assert abs(actual - expected) < 1e-3

    # Zero dependents
    zero_deps = compute_impact_score(0.5, 0)
    assert abs(zero_deps - 0.5) < 1e-3
