"""
Impact Analysis Engine for CodeCity AI (A1, A2, A5).

Implements:
- A1: Python traceback parser -> AST node resolution -> cascading blast radius
- A2: Deterministic failure simulation cascade
- A5: Shortest dependency path explorer between arbitrary files
"""

import re
from typing import Dict, List, Any, Optional
import networkx as nx

def parse_traceback(traceback_text: str, repo_files: List[Dict[str, Any]], G: nx.DiGraph) -> Dict[str, Any]:
    """
    Parses a standard Python traceback string, extracts stack frames, matches
    the crashed frame to repository file paths, and computes the cascading blast radius.
    """
    if not traceback_text or not traceback_text.strip():
        raise ValueError("Traceback text cannot be empty.")

    # Match standard python traceback lines:
    # File "path/to/file.py", line 123, in func_name
    frame_pattern = re.compile(r'File\s+["\']([^"\']+)["\'],\s+line\s+(\d+)(?:,\s+in\s+([^\n\r]+))?')
    frames = []

    for match in frame_pattern.finditer(traceback_text):
        raw_path = match.group(1).replace("\\", "/")
        line_no = int(match.group(2))
        func_name = match.group(3).strip() if match.group(3) else "unknown"
        frames.append({
            "raw_path": raw_path,
            "line": line_no,
            "function": func_name
        })

    # Error message (usually the last line of traceback)
    error_msg = "Unknown Exception"
    lines = [line.strip() for line in traceback_text.strip().splitlines() if line.strip()]
    if lines:
        last_line = lines[-1]
        if not last_line.startswith("File "):
            error_msg = last_line

    if not frames:
        raise ValueError("No valid Python stack frames found in the provided traceback.")

    # Match frames to known repository files
    # Match from bottom of stack up (innermost crashed frame first)
    crashed_node = None
    crashed_frame_info = None

    file_map = {f["path"]: f for f in repo_files}
    filename_map = {}
    for f in repo_files:
        filename_map.setdefault(f["filename"], []).append(f)

    for frame in reversed(frames):
        p = frame["raw_path"]
        # Direct match or suffix match
        matched = None
        if p in file_map:
            matched = file_map[p]
        else:
            for k, node in file_map.items():
                if p.endswith(k) or k.endswith(p):
                    matched = node
                    break
        if not matched:
            # Match by filename
            fname = p.split("/")[-1]
            if fname in filename_map:
                matched = filename_map[fname][0]

        if matched:
            crashed_node = matched
            crashed_frame_info = frame
            break

    if not crashed_node:
        # Fallback to the first frame or raise informative error
        available_files = [f["filename"] for f in repo_files[:5]]
        raise ValueError(
            f"None of the traceback frames matched repository files. "
            f"Parsed files: {[f['raw_path'].split('/')[-1] for f in frames]}. "
            f"Known repo files include: {available_files}..."
        )

    # Compute cascade from crashed node
    crashed_path = crashed_node["path"]
    cascade = simulate_failure(crashed_path, G, repo_files)

    return {
        "status": "success",
        "error_message": error_msg,
        "crashed_file": crashed_path,
        "crashed_filename": crashed_node["filename"],
        "crashed_line": crashed_frame_info["line"],
        "crashed_function": crashed_frame_info["function"],
        "frames_detected": len(frames),
        "cascade": cascade
    }


def simulate_failure(file_path: str, G: nx.DiGraph, repo_files: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Simulates a failure cascading from file_path across all its dependents.
    Dependents are nodes that IMPORT file_path (i.e. predecessors in dependency graph if edge is u -> v where u imports v).
    """
    file_map = {f["path"]: f for f in repo_files}
    if file_path not in file_map and file_path not in G:
        # Try matching filename
        matched = next((f["path"] for f in repo_files if f["filename"] == file_path or f["path"].endswith(file_path)), None)
        if matched:
            file_path = matched
        else:
            raise ValueError(f"File '{file_path}' not found in repository dependency graph.")

    # In our dependency graph, edge u -> v means u imports v.
    # Therefore, if v crashes, u is directly affected!
    # Dependents of v are in_edges / predecessors of v.
    hops: Dict[int, List[Dict[str, Any]]] = {1: [], 2: [], 3: []}
    visited = {file_path}
    current_level = {file_path}

    for depth in range(1, 4):
        next_level = set()
        for node in current_level:
            if node in G:
                # Predecessors import node -> they depend on node!
                dependents = list(G.predecessors(node))
                for dep in dependents:
                    if dep not in visited:
                        visited.add(dep)
                        next_level.add(dep)
                        node_meta = file_map.get(dep, {"path": dep, "filename": dep.split("/")[-1], "risk_probability": 0.2})
                        hops[depth].append({
                            "path": dep,
                            "filename": node_meta.get("filename", dep.split("/")[-1]),
                            "risk": node_meta.get("risk_probability", 0.2),
                            "loc": node_meta.get("loc", 0),
                            "via": node
                        })
        current_level = next_level

    # Identify tests at risk
    all_affected_paths = [item["path"] for level in hops.values() for item in level]
    at_risk_tests = [
        p for p in all_affected_paths
        if "test" in p.lower() or p.split("/")[-1].startswith("test_")
    ]

    total_dependents = sum(len(h) for h in hops.values())
    crashed_meta = file_map.get(file_path, {})
    crashed_risk = crashed_meta.get("risk_probability", 0.5)
    crashed_impact = round(crashed_risk * (1 + 0.3 * total_dependents), 3)

    summary_text = (
        f"1 crashed file ({file_path.split('/')[-1]}), "
        f"{total_dependents} dependent{'s' if total_dependents != 1 else ''} at risk, "
        f"{len(at_risk_tests)} test{'s' if len(at_risk_tests) != 1 else ''} affected."
    )

    return {
        "crashed_file": file_path,
        "impact_score": crashed_impact,
        "total_dependents": total_dependents,
        "at_risk_tests_count": len(at_risk_tests),
        "at_risk_tests": at_risk_tests,
        "summary": summary_text,
        "hops": {
            "1": hops[1],
            "2": hops[2],
            "3": hops[3]
        }
    }


def find_shortest_path(source: str, target: str, G: nx.DiGraph, repo_files: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Finds the shortest dependency route between two files in the repository.
    Checks directed path first; if none exists, checks undirected graph to show the import chain.
    """
    file_map = {f["path"]: f for f in repo_files}
    
    # Resolve source and target
    def resolve(p: str) -> str:
        if p in file_map or p in G:
            return p
        m = next((f["path"] for f in repo_files if f["filename"] == p or f["path"].endswith(p)), None)
        if m:
            return m
        raise ValueError(f"File '{p}' not found in repository.")

    src = resolve(source)
    dst = resolve(target)

    if src == dst:
        return {
            "exists": True,
            "is_directed": True,
            "path": [src],
            "length": 0,
            "edges": [],
            "description": f"Source and target are the same file ({src.split('/')[-1]})."
        }

    # Try directed path in G (src -> dst or dst -> src)
    path = None
    is_directed = False
    direction_desc = ""

    if nx.has_path(G, src, dst):
        path = nx.shortest_path(G, src, dst)
        is_directed = True
        direction_desc = f"{src.split('/')[-1]} imports {dst.split('/')[-1]} across {len(path)-1} hops."
    elif nx.has_path(G, dst, src):
        path = nx.shortest_path(G, dst, src)
        is_directed = True
        direction_desc = f"{dst.split('/')[-1]} imports {src.split('/')[-1]} across {len(path)-1} hops."
    else:
        # Try undirected connection
        U = G.to_undirected()
        if nx.has_path(U, src, dst):
            path = nx.shortest_path(U, src, dst)
            is_directed = False
            direction_desc = f"Connected via indirect common dependency chain across {len(path)-1} hops."

    if not path:
        return {
            "exists": False,
            "is_directed": False,
            "path": [],
            "length": 0,
            "edges": [],
            "description": f"No dependency path exists between {src.split('/')[-1]} and {dst.split('/')[-1]}."
        }

    # Extract edge information
    edges = []
    for i in range(len(path) - 1):
        u, v = path[i], path[i+1]
        edge_data = G.get_edge_data(u, v) or G.get_edge_data(v, u) or {}
        edges.append({
            "from": u,
            "to": v,
            "type": edge_data.get("edge_type", "import"),
            "calls": edge_data.get("calls", [])
        })

    return {
        "exists": True,
        "is_directed": is_directed,
        "path": path,
        "length": len(path) - 1,
        "edges": edges,
        "description": direction_desc
    }

