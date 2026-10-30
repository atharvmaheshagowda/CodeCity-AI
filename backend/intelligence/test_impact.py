"""
Test Impact & Coverage Mapping Engine for CodeCity AI (A4).

Identifies unit test files, maps source modules covered by tests via dependency graph,
and pinpoints "Uncovered Danger Zones" (high architectural impact, 0 covering tests).
"""

from typing import Dict, List, Any, Set
import networkx as nx

def analyze_test_coverage_and_impact(
    repo_files: List[Dict[str, Any]],
    G: nx.DiGraph
) -> Dict[str, Any]:
    """
    Computes test coverage map, covering test files per module, and detects uncovered danger zones.
    """
    file_map = {f["path"]: f for f in repo_files}

    # Identify test files vs source files
    test_files = []
    source_files = []

    for f in repo_files:
        p = f["path"].lower()
        fname = f["filename"].lower()
        if "test" in p or fname.startswith("test_") or fname.endswith("_test.py"):
            test_files.append(f)
        else:
            source_files.append(f)

    test_paths = {f["path"] for f in test_files}

    # Map each source file to tests that import / depend on it
    # In G, if test_app.py imports app.py, edge is test_app.py -> app.py.
    # Therefore, predecessors of source_file in G that are in test_paths cover source_file!
    covered_sources: Dict[str, List[str]] = {}
    danger_zones: List[Dict[str, Any]] = []

    for sf in source_files:
        spath = sf["path"]
        covering = []
        if spath in G:
            # Direct test callers (predecessors in G)
            for pred in G.predecessors(spath):
                if pred in test_paths:
                    covering.append(pred)

        covered_sources[spath] = covering
        test_count = len(covering)
        impact = sf.get("impact_score", 0.5)
        risk = sf.get("risk_probability", 0.2)

        # Danger zone: High impact (>= 1.0) or High Risk (>= 0.5) with ZERO covering tests
        if test_count == 0 and (impact >= 1.0 or risk >= 0.50):
            danger_zones.append({
                "path": spath,
                "filename": sf["filename"],
                "impact_score": impact,
                "risk_probability": risk,
                "loc": sf.get("loc", 0),
                "dependents_count": len(sf.get("blast_radius", {}).get("hops", {}).get("1", [])),
                "severity": "critical" if impact >= 2.0 or risk >= 0.70 else "high",
                "reason": f"High architectural blast radius ({impact:.2f}) with 0 automated tests protecting it."
            })

    # Sort danger zones by impact score descending
    danger_zones.sort(key=lambda x: x["impact_score"], reverse=True)

    total_sources = max(1, len(source_files))
    covered_count = sum(1 for sf in source_files if len(covered_sources.get(sf["path"], [])) > 0)
    coverage_ratio = round(covered_count / total_sources, 3)

    return {
        "total_source_files": len(source_files),
        "total_test_files": len(test_files),
        "covered_files_count": covered_count,
        "coverage_ratio": coverage_ratio,
        "coverage_percentage": round(coverage_ratio * 100, 1),
        "uncovered_danger_zones_count": len(danger_zones),
        "danger_zones": danger_zones,
        "test_mappings": [
            {
                "source_file": sf["path"],
                "source_filename": sf["filename"],
                "is_covered": len(covered_sources.get(sf["path"], [])) > 0,
                "covering_tests": covered_sources.get(sf["path"], []),
                "covering_tests_count": len(covered_sources.get(sf["path"], [])),
                "impact_score": sf.get("impact_score", 0.5),
                "risk_probability": sf.get("risk_probability", 0.2),
            }
            for sf in source_files
        ]
    }

