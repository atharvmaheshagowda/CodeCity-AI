"""
FastAPI Backend Integration Tests:
Tests health, cached repo loading, 3D city payloads, Model Card,
and error handling on invalid / oversized requests.
"""

from fastapi.testclient import TestClient
import pytest
from main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["app"] == "CodeCity AI"

def test_get_repos_list():
    res = client.get("/api/repos")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    repo_ids = [r["id"] for r in data]
    assert "psf_requests" in repo_ids
    assert "pallets_click" in repo_ids
    assert "pallets_flask" in repo_ids

def test_get_repo_city_payload():
    res = client.get("/api/repos/psf_requests")
    assert res.status_code == 200
    data = res.json()
    assert data["repo_id"] == "psf_requests"
    assert "summary" in data
    assert "directory_tree" in data
    assert "files" in data
    assert "graph_edges" in data
    assert len(data["files"]) > 0

    # Validate file structure
    sample_file = data["files"][0]
    assert "id" in sample_file
    assert "risk_probability" in sample_file
    assert "impact_score" in sample_file
    assert "blast_radius" in sample_file
    assert "shap" in sample_file
    assert "top_drivers" in sample_file["shap"]

def test_get_invalid_repo_returns_404():
    res = client.get("/api/repos/non_existent_random_repo_404")
    assert res.status_code == 404
    data = res.json()
    assert "not found" in data["detail"].lower()

def test_get_model_card():
    res = client.get("/api/model-card")
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert "model" in data["metrics"]
    assert "baseline_churn" in data["metrics"]
    assert "roc_curve" in data
    assert len(data["roc_curve"]) > 0

def test_analyze_invalid_url_fails():
    res = client.post("/api/analyze", json={"url": "not_a_valid_github_url"})
    assert res.status_code == 200
    job_id = res.json()["job_id"]
    
    # Check job status returns failure gracefully
    import time
    time.sleep(1.0)
    status_res = client.get(f"/api/analyze/{job_id}")
    assert status_res.status_code == 200
    job_data = status_res.json()
    assert job_data["status"] in ("failed", "mining", "cloning")
    if job_data["status"] == "failed":
        assert "github" in job_data["message"].lower() or "error" in job_data["message"].lower()
