#!/usr/bin/env python3
"""
CodeCity AI - One-Command Cross-Platform Orchestrator
Usage:
  python run.py setup        - Install all backend and frontend dependencies
  python run.py train        - Train bug prediction model & export metrics.json
  python run.py demo-data    - Precompute and cache offline 3D city data for 3 demo repos
  python run.py dev          - Run both backend (port 8000) and frontend (port 5173)
  python run.py test         - Run both backend pytest and frontend vitest suites
  python run.py build        - Typecheck and build production frontend bundle
"""

import sys
import os
import subprocess
import shutil
import platform
import argparse

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
IS_WINDOWS = platform.system() == "Windows"

def get_venv_python():
    if IS_WINDOWS:
        candidate = os.path.join(ROOT_DIR, ".venv", "Scripts", "python.exe")
    else:
        candidate = os.path.join(ROOT_DIR, ".venv", "bin", "python")
    if os.path.exists(candidate):
        return candidate
    return sys.executable

def run_cmd(cmd, cwd=ROOT_DIR, env=None):
    print(f"\n[run.py] Running in {cwd}:\n  {' '.join(cmd) if isinstance(cmd, list) else cmd}", flush=True)
    proc_env = os.environ.copy()
    proc_env["PYTHONUNBUFFERED"] = "1"
    if env:
        proc_env.update(env)
    res = subprocess.run(cmd, cwd=cwd, env=proc_env, shell=isinstance(cmd, str))
    if res.returncode != 0:
        print(f"[run.py] Command failed with exit code {res.returncode}")
        sys.exit(res.returncode)

def setup_cmd():
    print("=== Step 1/2: Backend Setup ===")
    has_uv = shutil.which("uv") is not None
    venv_dir = os.path.join(ROOT_DIR, ".venv")
    if not os.path.exists(venv_dir):
        if has_uv:
            run_cmd(["uv", "venv", "--python", "3.12", ".venv"])
        else:
            run_cmd([sys.executable, "-m", "venv", ".venv"])

    python_bin = get_venv_python()
    req_file = os.path.join(BACKEND_DIR, "requirements.txt")
    if has_uv:
        run_cmd(["uv", "pip", "install", "--python", python_bin, "-r", req_file])
    else:
        run_cmd([python_bin, "-m", "pip", "install", "-r", req_file])

    print("\n=== Step 2/2: Frontend Setup ===")
    npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"
    run_cmd([npm_cmd, "install"], cwd=FRONTEND_DIR)
    print("\n[SUCCESS] Setup complete! You can now run 'python run.py dev' or 'python run.py train'.")

def train_cmd():
    python_bin = get_venv_python()
    train_script = os.path.join(BACKEND_DIR, "ml", "train.py")
    run_cmd([python_bin, train_script], cwd=BACKEND_DIR)

def demo_data_cmd():
    python_bin = get_venv_python()
    demo_script = os.path.join(BACKEND_DIR, "scripts", "cache_demo_repos.py")
    run_cmd([python_bin, demo_script], cwd=BACKEND_DIR)

def test_cmd():
    python_bin = get_venv_python()
    print("\n=== Running Backend Pytest ===")
    run_cmd([python_bin, "-m", "pytest", "tests", "-v"], cwd=BACKEND_DIR)

    print("\n=== Running Frontend Vitest ===")
    npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"
    run_cmd([npm_cmd, "run", "test"], cwd=FRONTEND_DIR)

def build_cmd():
    npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"
    run_cmd([npm_cmd, "run", "build"], cwd=FRONTEND_DIR)

def dev_cmd():
    python_bin = get_venv_python()
    npm_cmd = "npm.cmd" if IS_WINDOWS else "npm"
    
    print("\nStarting CodeCity AI Development Services...")
    print("  Backend API:  http://127.0.0.1:8000")
    print("  Frontend UI: http://127.0.0.1:5173\n")
    
    env = os.environ.copy()
    backend_proc = subprocess.Popen(
        [python_bin, "-m", "uvicorn", "main:app", "--reload", "--host", "127.0.0.1", "--port", "8000"],
        cwd=BACKEND_DIR,
        env=env
    )
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"],
        cwd=FRONTEND_DIR,
        env=env
    )
    
    try:
        backend_proc.wait()
        frontend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down dev servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        backend_proc.wait()
        frontend_proc.wait()

def main():
    parser = argparse.ArgumentParser(description="CodeCity AI Runner")
    parser.add_argument("command", choices=["setup", "train", "demo-data", "dev", "test", "build"],
                        help="Action to execute")
    args = parser.parse_args()

    if args.command == "setup":
        setup_cmd()
    elif args.command == "train":
        train_cmd()
    elif args.command == "demo-data":
        demo_data_cmd()
    elif args.command == "test":
        test_cmd()
    elif args.command == "build":
        build_cmd()
    elif args.command == "dev":
        dev_cmd()

if __name__ == "__main__":
    main()
