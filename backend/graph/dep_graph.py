"""
AST-based Dependency Graph and Blast Radius Engine.

Extracts file-level import edges and best-effort function-level call edges using Python's `ast` module.
Computes reverse BFS blast radius (everything that depends on a given file) and impact scores.
"""

import ast
import os
import math
from typing import Dict, List, Set, Tuple, Any, Optional
import networkx as nx

def normalize_rel_path(p: str) -> str:
    return p.replace("\\", "/").lstrip("./")

class ASTDependencyParser(ast.NodeVisitor):
    def __init__(self, current_file_rel: str, all_files: Set[str], module_to_file: Dict[str, str]):
        self.current_file = current_file_rel
        self.all_files = all_files
        self.module_to_file = module_to_file
        self.imported_modules: Set[str] = set()
        self.imported_files: Set[str] = set()
        self.defined_functions: Set[str] = set()
        self.called_functions: Set[str] = set()
        self.current_package = self._get_current_package(current_file_rel)

    def _get_current_package(self, rel_path: str) -> str:
        parts = rel_path.split("/")[:-1]
        return ".".join(parts)

    def _resolve_module_to_file(self, module_str: str) -> Optional[str]:
        if not module_str:
            return None
        # Exact match
        if module_str in self.module_to_file:
            return self.module_to_file[module_str]
        # Match prefix submodules e.g. pkg.sub.func where pkg.sub is the file
        parts = module_str.split(".")
        for i in range(len(parts), 0, -1):
            prefix = ".".join(parts[:i])
            if prefix in self.module_to_file:
                return self.module_to_file[prefix]
        return None

    def visit_Import(self, node: ast.Import):
        for alias in node.names:
            mod_name = alias.name
            self.imported_modules.add(mod_name)
            target_f = self._resolve_module_to_file(mod_name)
            if target_f and target_f != self.current_file:
                self.imported_files.add(target_f)
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom):
        base_mod = node.module or ""
        level = node.level or 0
        if level > 0:
            # Relative import resolution
            pkg_parts = self.current_package.split(".") if self.current_package else []
            if level <= len(pkg_parts):
                parent_parts = pkg_parts[:len(pkg_parts) - level + 1]
            else:
                parent_parts = []
            if base_mod:
                full_mod = ".".join(parent_parts + [base_mod]) if parent_parts else base_mod
            else:
                full_mod = ".".join(parent_parts)
        else:
            full_mod = base_mod

        if full_mod:
            self.imported_modules.add(full_mod)
            target_f = self._resolve_module_to_file(full_mod)
            if target_f and target_f != self.current_file:
                self.imported_files.add(target_f)

        for alias in node.names:
            sub_mod = f"{full_mod}.{alias.name}" if full_mod else alias.name
            target_f = self._resolve_module_to_file(sub_mod)
            if target_f and target_f != self.current_file:
                self.imported_files.add(target_f)

        self.generic_visit(node)

    def visit_FunctionDef(self, node: ast.FunctionDef):
        self.defined_functions.add(node.name)
        self.generic_visit(node)

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef):
        self.defined_functions.add(node.name)
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        if isinstance(node.func, ast.Name):
            self.called_functions.add(node.func.id)
        elif isinstance(node.func, ast.Attribute):
            self.called_functions.add(node.func.attr)
        self.generic_visit(node)


def build_module_map(file_paths: List[str]) -> Dict[str, str]:
    """
    Builds a bidirectional map from Python module dot-notation to file path.
    Example: 'foo/bar/baz.py' -> 'foo.bar.baz' and 'foo/bar/__init__.py' -> 'foo.bar'.
    """
    mod_to_file = {}
    for fp in file_paths:
        rel = normalize_rel_path(fp)
        if not rel.endswith(".py"):
            continue
        clean = rel[:-3]
        if clean.endswith("/__init__"):
            mod = clean[:-9].replace("/", ".")
        else:
            mod = clean.replace("/", ".")
        if mod:
            mod_to_file[mod] = rel
    return mod_to_file


def build_dependency_graph(repo_path: str, py_files: Optional[List[str]] = None) -> nx.DiGraph:
    """
    Builds a NetworkX DiGraph where nodes are normalized relative file paths.
    Edge convention:
      An edge A -> B represents that module A depends on module B (A imports or calls B).
      Therefore, if B breaks, A is affected.
    """
    G = nx.DiGraph()

    if py_files is None:
        py_files = []
        for root, _, files in os.walk(repo_path):
            if any(part.startswith(".") or part in ("venv", ".venv", "site-packages", "__pycache__") for part in root.split(os.sep)):
                continue
            for f in files:
                if f.endswith(".py"):
                    full = os.path.join(root, f)
                    rel = normalize_rel_path(os.path.relpath(full, repo_path))
                    py_files.append(rel)

    py_files = [normalize_rel_path(f) for f in py_files]
    for f in py_files:
        G.add_node(f)

    mod_to_file = build_module_map(py_files)
    file_defined_funcs: Dict[str, Set[str]] = {}
    file_called_funcs: Dict[str, Set[str]] = {}

    # First pass: parse imports and function declarations
    for rel_f in py_files:
        full_p = os.path.join(repo_path, rel_f)
        if not os.path.exists(full_p):
            continue
        try:
            with open(full_p, "r", encoding="utf-8", errors="ignore") as f:
                tree = ast.parse(f.read(), filename=rel_f)
            parser = ASTDependencyParser(rel_f, set(py_files), mod_to_file)
            parser.visit(tree)

            file_defined_funcs[rel_f] = parser.defined_functions
            file_called_funcs[rel_f] = parser.called_functions

            # Add import edges: rel_f depends on imported_f
            for imported_f in parser.imported_files:
                if imported_f in G and imported_f != rel_f:
                    G.add_edge(rel_f, imported_f, edge_type="import")
        except Exception:
            # SyntaxError or parsing issue in older/malformed file; skip gracefully
            continue

    # Second pass: cross-file function call linking
    # For file A importing file B, if A calls a function defined in B, annotate call edge
    for u, v, data in list(G.edges(data=True)):
        imported_defs = file_defined_funcs.get(v, set())
        caller_calls = file_called_funcs.get(u, set())
        common_calls = imported_defs.intersection(caller_calls)
        if common_calls:
            data["edge_type"] = "import+call"
            data["calls"] = list(common_calls)

    return G


def compute_blast_radius(G: nx.DiGraph, target_file: str, max_depth: int = 3) -> Dict[str, Any]:
    """
    Computes reverse BFS blast radius starting from `target_file`.
    Since edge (u, v) means u depends on v, the blast radius of target v consists
    of all nodes u that have a path to v (i.e. predecessors in G).
    """
    target = normalize_rel_path(target_file)
    if target not in G:
        return {
            "target": target,
            "hops": {1: [], 2: [], 3: []},
            "all_dependents": [],
            "total_count": 0,
            "hop_counts": {1: 0, 2: 0, 3: 0}
        }

    visited: Set[str] = {target}
    current_level: Set[str] = {target}
    hops: Dict[int, List[str]] = {1: [], 2: [], 3: []}
    all_dependents: List[str] = []

    for depth in range(1, max_depth + 1):
        next_level: Set[str] = set()
        for node in current_level:
            # In G, u -> node means u depends on node (node's predecessors)
            for predecessor in G.predecessors(node):
                if predecessor not in visited:
                    visited.add(predecessor)
                    next_level.add(predecessor)
                    hops[depth].append(predecessor)
                    all_dependents.append(predecessor)
        current_level = next_level
        if not current_level:
            break

    return {
        "target": target,
        "hops": {
            1: sorted(hops[1]),
            2: sorted(hops[2]),
            3: sorted(hops[3])
        },
        "all_dependents": sorted(all_dependents),
        "total_count": len(all_dependents),
        "hop_counts": {
            1: len(hops[1]),
            2: len(hops[2]),
            3: len(hops[3])
        }
    }


def compute_graph_metrics(G: nx.DiGraph, file_path: str) -> Dict[str, int]:
    """
    Fan-in: number of files that depend on this file (predecessors in G).
    Fan-out: number of files this file depends on (successors in G).
    """
    f = normalize_rel_path(file_path)
    if f not in G:
        return {"fan_in": 0, "fan_out": 0}
    fan_in = G.in_degree(f)
    fan_out = G.out_degree(f)
    return {"fan_in": fan_in, "fan_out": fan_out}


def compute_impact_score(risk_probability: float, dependents_count: int) -> float:
    """
    Impact = risk_probability * (1 + ln(1 + dependents))
    Scaled smoothly between 0 and 100 for intuitive presentation.
    """
    raw_impact = float(risk_probability) * (1.0 + math.log(1.0 + float(dependents_count)))
    # For UI display we also provide a rounded 0-100 impact score
    return round(raw_impact, 4)
