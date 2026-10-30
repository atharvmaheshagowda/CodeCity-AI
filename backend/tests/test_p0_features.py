"""
Unit and Integration Tests for CodeCity AI P0 Intelligence Features:
- A1: Traceback Parsing & Cascade Blast Radius
- A2: Failure Simulation
- A5: Shortest Path Routing
- B1: Hidden Co-change Coupling Mining
- B3: Personalized PageRank Risk Contagion
- B4: Counterfactual What-If Re-Inference
- C3: Architecture Smells (Cycles, God files, Orphans)
- C4: 0-100 Code Health Score & Report Export (JSON, Markdown, HTML)
"""

from fastapi.testclient import TestClient
import pytest
from main import app

client = TestClient(app)

SAMPLE_TRACEBACK = """
Traceback (most recent call last):
  File "src/flask/app.py", line 192, in dispatch_request
    handler = self.url_map.get(req.path)
  File "src/flask/helpers.py", line 81, in url_for
    return f'/{endpoint}'
KeyError: 'endpoint_not_found'
"""

def test_traceback_analysis_success():
    res = client.post("/api/traceback", json={
        "repo_id": "pallets_flask",
        "traceback": SAMPLE_TRACEBACK
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["status"] == "success"
    assert "helpers.py" in data["crashed_file"] or "app.py" in data["crashed_file"]
    assert "KeyError" in data["error_message"]
    assert data["frames_detected"] == 2
    assert "cascade" in data
    assert "hops" in data["cascade"]
    assert "total_dependents" in data["cascade"]
    assert "at_risk_tests_count" in data["cascade"]

def test_traceback_analysis_invalid():
    res = client.post("/api/traceback", json={
        "repo_id": "pallets_flask",
        "traceback": "Random error without any traceback frames"
    })
    assert res.status_code == 400

def test_simulate_failure():
    res = client.post("/api/simulate-failure", json={
        "repo_id": "pallets_flask",
        "file_path": "src/flask/helpers.py"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["crashed_file"] == "src/flask/helpers.py"
    assert "hops" in data
    assert "total_dependents" in data
    assert "at_risk_tests_count" in data
    assert "at_risk_tests" in data

def test_simulate_failure_not_found():
    res = client.post("/api/simulate-failure", json={
        "repo_id": "pallets_flask",
        "file_path": "non_existent_module.py"
    })
    assert res.status_code == 400

def test_shortest_path_success():
    res = client.get("/api/path", params={
        "repo_id": "pallets_flask",
        "source": "src/flask/app.py",
        "target": "src/flask/helpers.py"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["exists"] is True
    assert data["length"] >= 1
    assert data["path"][0] == "src/flask/app.py"
    assert data["path"][-1] == "src/flask/helpers.py"

def test_hidden_coupling_mining():
    res = client.get("/api/coupling", params={
        "repo_id": "pallets_flask",
        "min_support": 2,
        "min_jaccard": 0.10
    })
    assert res.status_code == 200
    data = res.json()
    assert "pairs" in data
    # Any returned pair must NOT have a direct import edge
    for p in data["pairs"]:
        assert p["jaccard"] >= 0.10
        assert p["support"] >= 2
        assert "file_a" in p and "file_b" in p
        assert "explanation" in p

def test_hidden_coupling_graceful_degradation():
    res = client.get("/api/coupling", params={
        "repo_id": "atharvmaheshagowda_agenta-workspace"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["has_enough_history"] is False
    assert "Not enough Git commit history" in data["message"]

def test_risk_contagion_diffusion():
    res = client.get("/api/contagion", params={
        "repo_id": "pallets_flask",
        "alpha": 0.85
    })
    assert res.status_code == 200
    data = res.json()
    assert "contagion_scores" in data
    assert len(data["contagion_scores"]) > 0
    for path, score in data["contagion_scores"].items():
        assert 0.0 <= score <= 1.0
    assert "attributions" in data

def test_counterfactual_whatif():
    res = client.post("/api/whatif", json={
        "repo_id": "pallets_flask",
        "file_path": "src/flask/app.py",
        "max_complexity": 5.0,
        "churn_90d": 30
    })
    assert res.status_code == 200
    data = res.json()
    assert "new_risk" in data
    assert "delta_risk" in data
    assert "shap" in data
    assert "top_impacts" in data["shap"]
    assert "explanation_text" in data["shap"]
    assert 0.0 <= data["new_risk"] <= 1.0

def test_architecture_smells():
    res = client.get("/api/smells", params={
        "repo_id": "pallets_flask"
    })
    assert res.status_code == 200
    data = res.json()
    assert "total_smells" in data
    assert "smells" in data
    assert "summary" in data
    # Circular dependencies should be detected in synthetic flask ctx <-> globals
    cycle_smells = [s for s in data["smells"] if s["type"] == "circular_dependency"]
    assert len(cycle_smells) >= 1

def test_code_health_report_json():
    res = client.get("/api/report", params={
        "repo_id": "pallets_flask",
        "format": "json"
    })
    assert res.status_code == 200
    data = res.json()
    assert "health" in data
    assert "score" in data["health"]
    assert 0 <= data["health"]["score"] <= 100
    assert "grade" in data["health"]
    assert "breakdown" in data["health"]
    assert "smells" in data

def test_code_health_report_markdown():
    res = client.get("/api/report", params={
        "repo_id": "pallets_flask",
        "format": "markdown"
    })
    assert res.status_code == 200
    assert "text/markdown" in res.headers["content-type"]
    text = res.text
    assert "# CodeCity AI" in text
    assert "Code Health Score" in text

def test_code_health_report_html():
    res = client.get("/api/report", params={
        "repo_id": "pallets_flask",
        "format": "html"
    })
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    html = res.text
    assert "<!DOCTYPE html>" in html
    assert "CodeCity AI - Health Report" in html
    assert "@media print" in html
