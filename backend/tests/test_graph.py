"""
Known-fixture Dependency Graph Test:
Validates AST import parsing, alias resolution, relative imports, and DiGraph edges.
"""

import os
import shutil
import tempfile
import pytest
from graph.dep_graph import build_dependency_graph, compute_graph_metrics

def test_ast_known_fixture_graph():
    temp_dir = tempfile.mkdtemp(prefix="codecity_graph_fixture_")
    try:
        # Create known package layout:
        # pkg/
        #   __init__.py
        #   base.py         (no internal dependencies)
        #   service.py      (imports base.py)
        #   controller.py   (imports service.py and base.py)
        #   helper.py       (relative import from .base import ...)
        os.makedirs(os.path.join(temp_dir, "pkg"), exist_ok=True)

        with open(os.path.join(temp_dir, "pkg", "__init__.py"), "w") as f:
            f.write("# pkg\n")

        with open(os.path.join(temp_dir, "pkg", "base.py"), "w") as f:
            f.write("class BaseModel:\n    def save(self):\n        return True\n")

        with open(os.path.join(temp_dir, "pkg", "service.py"), "w") as f:
            f.write("from pkg.base import BaseModel\n\ndef get_service():\n    return BaseModel()\n")

        with open(os.path.join(temp_dir, "pkg", "controller.py"), "w") as f:
            f.write("from pkg.service import get_service\nfrom pkg.base import BaseModel\n\ndef run():\n    return get_service()\n")

        with open(os.path.join(temp_dir, "pkg", "helper.py"), "w") as f:
            f.write("from .base import BaseModel\n\ndef assist():\n    return BaseModel()\n")

        G = build_dependency_graph(temp_dir)

        # Expected nodes
        expected_nodes = {"pkg/__init__.py", "pkg/base.py", "pkg/service.py", "pkg/controller.py", "pkg/helper.py"}
        assert expected_nodes.issubset(set(G.nodes)), f"Expected nodes {expected_nodes}, got {set(G.nodes)}"

        # Verify dependency edges (A depends on B means edge A -> B)
        assert G.has_edge("pkg/service.py", "pkg/base.py"), "service.py must depend on base.py"
        assert G.has_edge("pkg/controller.py", "pkg/service.py"), "controller.py must depend on service.py"
        assert G.has_edge("pkg/controller.py", "pkg/base.py"), "controller.py must depend on base.py"
        assert G.has_edge("pkg/helper.py", "pkg/base.py"), "helper.py relative import must depend on base.py"

        # Verify graph metrics
        # base.py is depended on by service.py, controller.py, and helper.py => fan_in = 3
        base_metrics = compute_graph_metrics(G, "pkg/base.py")
        assert base_metrics["fan_in"] == 3, f"Expected base.py fan_in == 3, got {base_metrics['fan_in']}"
        assert base_metrics["fan_out"] == 0, f"Expected base.py fan_out == 0, got {base_metrics['fan_out']}"

        # controller.py depends on service.py and base.py => fan_out = 2
        ctrl_metrics = compute_graph_metrics(G, "pkg/controller.py")
        assert ctrl_metrics["fan_out"] == 2, f"Expected controller.py fan_out == 2, got {ctrl_metrics['fan_out']}"
        assert ctrl_metrics["fan_in"] == 0, f"Expected controller.py fan_in == 0, got {ctrl_metrics['fan_in']}"

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)
