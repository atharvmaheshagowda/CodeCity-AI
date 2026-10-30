"""
Architecture Smells Detection Engine for CodeCity AI (C3).

Detects structural anti-patterns:
- Circular dependencies (Tarjan SCC / simple cycles)
- God files (disproportionate fan-in, LOC, and cyclomatic complexity)
- Orphan files (unreferenced non-entrypoint, non-test modules)
"""

from typing import Dict, List, Any, Set
import networkx as nx
import numpy as np

ENTRYPOINT_NAMES = {
    "main.py", "app.py", "wsgi.py", "asgi.py", "cli.py",
    "manage.py", "run.py", "setup.py", "__main__.py", "__init__.py"
}

def detect_architecture_smells(
    files_list: List[Dict[str, Any]],
    G: nx.DiGraph
) -> Dict[str, Any]:
    """
    Scans the repository file list and dependency graph for structural architecture smells.
    """
    if not files_list:
        return {"total_smells": 0, "smells": [], "summary": {}}

    smells: List[Dict[str, Any]] = []

    # 1. Circular Dependencies (Tarjan SCC and elementary cycles)
    sccs = [scc for scc in nx.strongly_connected_components(G) if len(scc) > 1]
    
    # Also find elementary cycles for precise path visualization
    detected_cycles: List[List[str]] = []
    try:
        # Limit to first 10 cycles to avoid exponential blowup on dense graphs
        simple_cycles = list(nx.simple_cycles(G))
        for c in simple_cycles[:10]:
            if len(c) > 1:
                detected_cycles.append(c + [c[0]]) # Close loop
    except Exception:
        pass

    for idx, scc in enumerate(sccs, 1):
        scc_list = sorted(list(scc))
        fnames = [p.split("/")[-1] for p in scc_list]
        smells.append({
            "id": f"smell_cycle_{idx}",
            "type": "circular_dependency",
            "title": f"Circular Dependency Loop ({len(scc_list)} modules)",
            "severity": "high",
            "affected_files": scc_list,
            "affected_filenames": fnames,
            "description": f"Mutually recursive import cycle detected between {', '.join(fnames)}. Prevents clean isolated testing and risks runtime ImportError / partial initialization.",
            "recommendation": "Extract common interface, abstract base class, or data types into an independent leaf module."
        })

    # 2. God Files (multi-factor percentile evaluation)
    locs = [f.get("loc", 0) for f in files_list]
    complexities = [f.get("max_complexity", 1.0) for f in files_list]
    fan_ins = [f.get("fan_in", 0) for f in files_list]

    loc_thresh = max(180, int(np.percentile(locs, 85))) if len(locs) >= 4 else 250
    cc_thresh = max(8.0, float(np.percentile(complexities, 85))) if len(complexities) >= 4 else 12.0
    fanin_thresh = max(2, int(np.percentile(fan_ins, 85))) if len(fan_ins) >= 4 else 3

    for f in files_list:
        loc = f.get("loc", 0)
        cc = f.get("max_complexity", 0.0)
        fan_in = f.get("fan_in", 0)

        # File exceeds all 3 thresholds or exceeds 2 by a wide margin
        is_god = (loc >= loc_thresh and cc >= cc_thresh and fan_in >= fanin_thresh) or \
                 (loc >= loc_thresh * 1.5 and cc >= cc_thresh * 1.4)

        if is_god:
            p = f["path"]
            fname = f["filename"]
            smells.append({
                "id": f"smell_god_{fname}",
                "type": "god_file",
                "title": f"God File Anti-Pattern ({fname})",
                "severity": "high" if cc >= 14 or fan_in >= 4 else "medium",
                "affected_files": [p],
                "affected_filenames": [fname],
                "description": (
                    f"'{fname}' centralizes excessive responsibilities: {loc} LOC, "
                    f"max complexity {cc:.1f}, imported by {fan_in} dependent files."
                ),
                "recommendation": "Decompose into cohesive single-responsibility submodules or helper strategies."
            })

    # 3. Orphan Files (In-degree == 0, not an entrypoint, not a test)
    for f in files_list:
        p = f["path"]
        fname = f["filename"]
        fan_in = f.get("fan_in", 0)
        
        is_entrypoint = fname in ENTRYPOINT_NAMES or fname.startswith("test_") or "test" in p.lower()
        if fan_in == 0 and not is_entrypoint:
            smells.append({
                "id": f"smell_orphan_{fname}",
                "type": "orphan_file",
                "title": f"Unreferenced Module ({fname})",
                "severity": "low",
                "affected_files": [p],
                "affected_filenames": [fname],
                "description": f"'{fname}' is never imported by any other module in the codebase and is not an entrypoint.",
                "recommendation": "Verify whether this is dead/deprecated code that can be retired, or add explicit tests."
            })

    # Group counts
    high_count = sum(1 for s in smells if s["severity"] == "high")
    med_count = sum(1 for s in smells if s["severity"] == "medium")
    low_count = sum(1 for s in smells if s["severity"] == "low")

    return {
        "total_smells": len(smells),
        "critical_count": high_count,
        "summary": {
            "high": high_count,
            "medium": med_count,
            "low": low_count,
            "circular_dependencies_count": len(sccs),
            "elementary_cycles": detected_cycles
        },
        "smells": smells
    }

