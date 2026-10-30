"""
Pre-analyze and cache 3 demo repositories as full 3D City JSON.
Enables instant sub-3-second offline demo loading without internet access.
"""

import os
import sys
import json
import shutil
import tempfile
from datetime import datetime, timezone

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import generate_city_payload
from mining.synthetic_repo import create_synthetic_flask_repo, create_synthetic_click_repo, create_synthetic_requests_repo

CACHED_DEMOS_DIR = os.path.join(BACKEND_DIR, "data", "cached_demos")
os.makedirs(CACHED_DEMOS_DIR, exist_ok=True)

DEMOS = [
    {
        "id": "psf_requests",
        "name": "psf/requests",
        "creator": create_synthetic_requests_repo,
    },
    {
        "id": "pallets_click",
        "name": "pallets/click",
        "creator": create_synthetic_click_repo,
    },
    {
        "id": "pallets_flask",
        "name": "pallets/flask",
        "creator": create_synthetic_flask_repo,
    }
]

def precompute_demo_caches():
    print("\n=======================================================", flush=True)
    print("CodeCity AI: Precomputing Offline Demo Cache", flush=True)
    print("=======================================================", flush=True)

    temp_dir = tempfile.mkdtemp(prefix="codecity_demos_")
    try:
        for demo in DEMOS:
            repo_id = demo["id"]
            repo_name = demo["name"]
            print(f"Generating full 3D City JSON for {repo_name}...", flush=True)

            repo_path = os.path.join(temp_dir, repo_id)
            demo["creator"](repo_path)

            payload = generate_city_payload(repo_id, repo_name, repo_path)
            
            out_file = os.path.join(CACHED_DEMOS_DIR, f"{repo_id}.json")
            with open(out_file, "w", encoding="utf-8") as fp:
                json.dump(payload, fp, indent=2)

            file_size_kb = os.path.getsize(out_file) / 1024.0
            print(f"  -> Saved {out_file} ({payload['summary']['total_files']} files, {payload['summary']['total_loc']} LOC, {file_size_kb:.1f} KB)", flush=True)

        print("\n[SUCCESS] All 3 demo repositories cached successfully for offline use!", flush=True)
    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    precompute_demo_caches()
