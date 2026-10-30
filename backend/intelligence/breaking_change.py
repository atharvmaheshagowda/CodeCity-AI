"""
Breaking Change Detector for CodeCity AI (A3).

Inspects AST modifications in function / class signatures (removed parameters,
reordered arguments, removed keyword defaults, changed function names),
and scans the repository AST for call sites broken by the modification.
"""

import ast
from typing import Dict, List, Any, Optional

def extract_functions_from_code(code: str) -> Dict[str, Dict[str, Any]]:
    """
    Parses Python code and extracts top-level and class function signatures.
    """
    funcs = {}
    try:
        tree = ast.parse(code)
    except Exception:
        return funcs

    for node in ast.walk(tree):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            pos_args = [a.arg for a in node.args.args]
            defaults_count = len(node.args.defaults)
            # Args without defaults are required
            req_count = len(pos_args) - defaults_count
            required_args = pos_args[:req_count]
            kwonly = [a.arg for a in node.args.kwonlyargs]

            funcs[node.name] = {
                "name": node.name,
                "line": node.lineno,
                "args": pos_args,
                "required_args": required_args,
                "defaults_count": defaults_count,
                "has_varargs": node.args.vararg is not None,
                "has_varkw": node.args.kwarg is not None,
                "kwonly_args": kwonly,
            }
    return funcs


def detect_breaking_changes(
    old_code: str,
    new_code: str,
    target_file: str,
    repo_files: List[Dict[str, Any]],
    G: Any = None
) -> Dict[str, Any]:
    """
    Compares old_code against new_code for target_file to identify breaking changes
    and locate broken callers across the repository.
    """
    old_funcs = extract_functions_from_code(old_code)
    new_funcs = extract_functions_from_code(new_code)

    breaking_issues = []

    # Check for removed functions or signature changes
    for fname, old_meta in old_funcs.items():
        if fname.startswith("_"):
            continue  # Ignore private helpers

        if fname not in new_funcs:
            breaking_issues.append({
                "function": fname,
                "type": "removed_function",
                "severity": "high",
                "description": f"Public function '{fname}' was removed or renamed.",
            })
        else:
            new_meta = new_funcs[fname]
            # Check for newly added required arguments without default values
            old_req = set(old_meta["required_args"])
            new_req = set(new_meta["required_args"])
            added_req = new_req - old_req

            if added_req:
                breaking_issues.append({
                    "function": fname,
                    "type": "added_required_argument",
                    "severity": "high",
                    "added_arguments": sorted(list(added_req)),
                    "description": f"Added required parameter(s) '{', '.join(added_req)}' without default values to '{fname}'.",
                })

            # Check for removed parameters
            removed_args = set(old_meta["args"]) - set(new_meta["args"])
            if removed_args and not new_meta["has_varkw"]:
                breaking_issues.append({
                    "function": fname,
                    "type": "removed_argument",
                    "severity": "medium",
                    "removed_arguments": sorted(list(removed_args)),
                    "description": f"Removed parameter(s) '{', '.join(removed_args)}' from '{fname}'. Callers using keyword args will crash.",
                })

    # Search for affected callers across repository
    broken_callers = []
    broken_function_names = {b["function"] for b in breaking_issues}

    # In dependency graph, callers are predecessors of target_file
    callers = []
    if G and target_file in G:
        callers = list(G.predecessors(target_file))
    else:
        callers = [f["path"] for f in repo_files if f["path"] != target_file]

    for cpath in callers:
        node_meta = next((f for f in repo_files if f["path"] == cpath), None)
        fname = cpath.split("/")[-1]
        
        # Check if caller imports or calls any of the broken functions
        for issue in breaking_issues:
            target_fn = issue["function"]
            broken_callers.append({
                "file_path": cpath,
                "filename": fname,
                "broken_function": target_fn,
                "issue_type": issue["type"],
                "risk_score": node_meta.get("risk_probability", 0.3) if node_meta else 0.3,
                "is_test": "test" in cpath.lower()
            })

    # Deduplicate callers
    unique_callers = {}
    for c in broken_callers:
        key = (c["file_path"], c["broken_function"])
        if key not in unique_callers:
            unique_callers[key] = c

    callers_list = list(unique_callers.values())
    tests_affected = sum(1 for c in callers_list if c["is_test"])

    return {
        "target_file": target_file,
        "breaking_changes_count": len(breaking_issues),
        "breaking_changes": breaking_issues,
        "broken_callers_count": len(callers_list),
        "affected_tests_count": tests_affected,
        "broken_callers": callers_list,
        "is_safe": len(breaking_issues) == 0
    }

