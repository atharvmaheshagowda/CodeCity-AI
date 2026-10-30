"""
Unit and Integration Tests for CodeCity AI P1 Intelligence Features:
- A3: Breaking-Change Signature Detector & Broken Callers
- A4: Test Coverage & Uncovered Danger Zones
- B2: Temporal Backtest Trust Score & Replay
- B5: Multi-Cutoff Risk Trajectories & Rapid-Rise Alerts
- B6: Review Budget Knapsack Optimizer
- B7: Uncertainty Estimation Bands (+/- sigma)
- C1: Monthly Repository Time-Lapse Snapshots
- C2: Commit & Diff Risk Checker (Joint Probability & Union Blast Radius)
"""

from fastapi.testclient import TestClient
import pytest
from main import app

client = TestClient(app)

SAMPLE_OLD_CODE = """
def dispatch_request(req):
    return req.path

def url_for(endpoint):
    return '/' + endpoint
"""

SAMPLE_NEW_CODE_BREAKING = """
def dispatch_request(req, timeout): # Breaking: added required param without default
    return req.path

# url_for removed!
"""

SAMPLE_DIFF = """
--- a/src/flask/app.py
+++ b/src/flask/app.py
@@ -10,3 +10,4 @@
+    def new_feature(): pass
--- a/src/flask/sessions.py
+++ b/src/flask/sessions.py
@@ -5,3 +5,4 @@
+    def validate_cookie(): pass
"""

def test_breaking_change_detection():
    res = client.post("/api/breaking-change", json={
        "repo_id": "pallets_flask",
        "target_file": "src/flask/app.py",
        "old_code": SAMPLE_OLD_CODE,
        "new_code": SAMPLE_NEW_CODE_BREAKING
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["is_safe"] is False
    assert data["breaking_changes_count"] >= 2
    types = [b["type"] for b in data["breaking_changes"]]
    assert "added_required_argument" in types
    assert "removed_function" in types
    assert "broken_callers" in data

def test_test_impact_and_coverage():
    res = client.get("/api/tests/impact", params={"repo_id": "pallets_flask"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["total_source_files"] >= 5
    assert data["total_test_files"] >= 1
    assert 0.0 <= data["coverage_ratio"] <= 1.0
    assert "danger_zones" in data
    assert "test_mappings" in data

def test_temporal_backtest_replay():
    res = client.get("/api/backtest", params={"repo_id": "pallets_flask"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["zero_leakage_verified"] is True
    assert data["trust_score"] > 80.0
    assert len(data["cutoffs"]) == 3
    for c in data["cutoffs"]:
        assert c["model_roc_auc"] > c["churn_roc_auc"]

def test_risk_trajectories():
    res = client.get("/api/trajectories", params={"repo_id": "pallets_flask"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data) >= 5
    for path, traj in data.items():
        assert len(traj["points"]) == 4
        assert traj["status"] in ["rapid_rise", "stable", "declining"]

def test_uncertainty_bounds():
    res = client.get("/api/uncertainty", params={"repo_id": "pallets_flask"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert len(data) >= 5
    for path, u in data.items():
        assert u["lower_bound"] <= u["risk"] <= u["upper_bound"]
        assert u["sigma"] > 0

def test_review_budget_planner():
    res = client.post("/api/plan", json={
        "repo_id": "pallets_flask",
        "total_hours": 10.0,
        "team_reviewers": 2
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["budget_total_hours"] == 10.0
    assert data["allocated_hours"] <= 10.0
    assert data["planned_files_count"] >= 1
    assert data["risk_coverage_percentage"] > 0

def test_commit_risk_checker():
    res = client.post("/api/commit-risk", json={
        "repo_id": "pallets_flask",
        "diff_text": SAMPLE_DIFF
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["is_valid"] is True
    assert data["touched_files_count"] == 2
    assert 0.0 <= data["combined_failure_probability"] <= 1.0
    assert "union_dependents" in data
    assert "affected_tests" in data

def test_timelapse_snapshots():
    res = client.get("/api/timelapse", params={"repo_id": "pallets_flask"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["has_enough_history"] is True
    assert len(data["snapshots"]) >= 2
    for s in data["snapshots"]:
        assert "active_files_count" in s
        assert "total_loc" in s

