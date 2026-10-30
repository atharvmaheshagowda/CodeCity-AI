"""
Script to enrich synthetic repos with realistic commit history, tests, routes, models,
and precompute cached demos with 'commits' array embedded.
"""

import os
import sys
import json
import shutil
import tempfile
from datetime import datetime, timezone, timedelta

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import generate_city_payload, CACHED_DEMOS_DIR
from mining.synthetic_repo import _run_git, _commit_at, create_synthetic_click_repo, create_synthetic_requests_repo

def build_rich_flask_repo(dest: str):
    if os.path.exists(dest):
        shutil.rmtree(dest, ignore_errors=True)
    os.makedirs(dest, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest)
    _run_git(["config", "user.name", "Armin Ronacher"], cwd=dest)
    _run_git(["config", "user.email", "armin@pocoo.org"], cwd=dest)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    # Day 0: Scaffold
    _commit_at(dest, base, 0, "Armin Ronacher", "armin@pocoo.org", "Initial Flask framework architecture", {
        "src/flask/__init__.py": "from .app import Flask\nfrom .blueprints import Blueprint\n__version__ = '3.0.0'\n",
        "src/flask/app.py": (
            "from .ctx import RequestContext, AppContext\n"
            "from .helpers import url_for\n"
            "from .wrappers import Request, Response\n"
            "from .config import Config\n\n"
            "class Flask:\n"
            "    def __init__(self, import_name: str):\n"
            "        self.import_name = import_name\n"
            "        self.config = Config()\n"
            "        self.blueprints = {}\n"
            "        self.url_map = {}\n\n"
            "    def route(self, rule: str, **options):\n"
            "        def decorator(f):\n"
            "            self.url_map[rule] = f\n"
            "            return f\n"
            "        return decorator\n\n"
            "    def dispatch_request(self, req: Request):\n"
            "        if not req.path:\n"
            "            return Response('Empty path', status=400)\n"
            "        handler = self.url_map.get(req.path)\n"
            "        if handler:\n"
            "            return Response(handler())\n"
            "        return Response('Not Found', status=404)\n"
        ),
        "src/flask/config.py": (
            "class Config(dict):\n"
            "    def __init__(self, defaults=None):\n"
            "        super().__init__(defaults or {})\n"
            "        self['DEBUG'] = False\n"
            "        self['SECRET_KEY'] = 'dev-secret'\n"
        ),
        "src/flask/ctx.py": (
            "from .globals import current_app\n\n"
            "class AppContext:\n"
            "    def __init__(self, app):\n"
            "        self.app = app\n\n"
            "class RequestContext:\n"
            "    def __init__(self, app, req):\n"
            "        self.app = app\n"
            "        self.request = req\n"
        ),
        "src/flask/globals.py": (
            "# Global proxy context\n"
            "current_app = None\n"
            "request = None\n"
        ),
        "src/flask/helpers.py": (
            "def url_for(endpoint: str, **values) -> str:\n"
            "    return f'/{endpoint}' if endpoint else '/'\n"
        ),
        "src/flask/wrappers.py": (
            "class Request:\n"
            "    def __init__(self, path: str, method: str = 'GET'):\n"
            "        self.path = path\n"
            "        self.method = method\n\n"
            "class Response:\n"
            "    def __init__(self, body: str, status: int = 200):\n"
            "        self.body = body\n"
            "        self.status = status\n"
        ),
        "src/flask/blueprints.py": (
            "from .helpers import url_for\n\n"
            "class Blueprint:\n"
            "    def __init__(self, name: str, import_name: str):\n"
            "        self.name = name\n"
            "        self.import_name = import_name\n"
            "        self.deferred = []\n\n"
            "    def route(self, rule: str):\n"
            "        def decorator(f):\n"
            "            self.deferred.append((rule, f))\n"
            "            return f\n"
            "        return decorator\n"
        ),
    })

    # Day 20: Add database models and routes
    _commit_at(dest, base, 20, "David Lord", "david@palletsprojects.com", "Add ORM database model and API routes", {
        "src/flask/models.py": (
            "# Base ORM Model for Flask extensions\n"
            "class Model:\n"
            "    id: int\n"
            "    def save(self):\n"
            "        pass\n\n"
            "class User(Model):\n"
            "    def __init__(self, username: str, email: str):\n"
            "        self.username = username\n"
            "        self.email = email\n"
        ),
        "src/flask/routes.py": (
            "from .app import Flask\n"
            "from .models import User\n\n"
            "def register_routes(app: Flask):\n"
            "    @app.route('/api/users')\n"
            "    def get_users():\n"
            "        return '[]'\n\n"
            "    @app.route('/api/health')\n"
            "    def health_check():\n"
            "        return 'OK'\n"
        ),
        "src/flask/sessions.py": (
            "import json\n"
            "class SecureCookieSession:\n"
            "    def __init__(self, initial=None):\n"
            "        self.data = initial or {}\n"
            "    def get(self, k, default=None):\n"
            "        return self.data.get(k, default)\n"
        ),
    })

    # Day 40: Add test suite (Tests layer A4)
    _commit_at(dest, base, 40, "Armin Ronacher", "armin@pocoo.org", "Add comprehensive unit test suite", {
        "tests/test_app.py": (
            "from src.flask.app import Flask\n"
            "from src.flask.wrappers import Request\n\n"
            "def test_app_dispatch():\n"
            "    app = Flask('test')\n"
            "    res = app.dispatch_request(Request('/'))\n"
            "    assert res.status == 404\n"
        ),
        "tests/test_blueprints.py": (
            "from src.flask.blueprints import Blueprint\n\n"
            "def test_blueprint_route():\n"
            "    bp = Blueprint('auth', __name__)\n"
            "    assert bp.name == 'auth'\n"
        ),
        "tests/test_config.py": (
            "from src.flask.config import Config\n\n"
            "def test_config():\n"
            "    cfg = Config({'CUSTOM': True})\n"
            "    assert cfg['CUSTOM'] is True\n"
        ),
        "tests/test_sessions.py": (
            "from src.flask.sessions import SecureCookieSession\n\n"
            "def test_session():\n"
            "    s = SecureCookieSession({'user': 'alice'})\n"
            "    assert s.get('user') == 'alice'\n"
        ),
    })

    # Day 65: Co-change commit: app.py and sessions.py without direct import! (Hidden coupling B1)
    _commit_at(dest, base, 65, "David Lord", "david@palletsprojects.com", "Refactor session state synchronization with request lifecycle", {
        "src/flask/app.py": (
            "from .ctx import RequestContext, AppContext\n"
            "from .helpers import url_for\n"
            "from .wrappers import Request, Response\n"
            "from .config import Config\n\n"
            "class Flask:\n"
            "    def __init__(self, import_name: str):\n"
            "        self.import_name = import_name\n"
            "        self.config = Config()\n"
            "        self.blueprints = {}\n"
            "        self.url_map = {}\n"
            "        self.session_interface = None\n\n"
            "    def route(self, rule: str, **options):\n"
            "        def decorator(f):\n"
            "            self.url_map[rule] = f\n"
            "            return f\n"
            "        return decorator\n\n"
            "    def dispatch_request(self, req: Request):\n"
            "        if not req.path:\n"
            "            return Response('Empty path', status=400)\n"
            "        handler = self.url_map.get(req.path)\n"
            "        if handler:\n"
            "            return Response(handler())\n"
            "        return Response('Not Found', status=404)\n"
        ),
        "src/flask/sessions.py": (
            "import json\n"
            "class SecureCookieSession:\n"
            "    def __init__(self, initial=None):\n"
            "        self.data = initial or {}\n"
            "        self.modified = False\n"
            "    def get(self, k, default=None):\n"
            "        return self.data.get(k, default)\n"
            "    def set(self, k, v):\n"
            "        self.data[k] = v\n"
            "        self.modified = True\n"
        ),
    })

    # Day 85: Bug fix commit: app.py and sessions.py co-change again!
    _commit_at(dest, base, 85, "Armin Ronacher", "armin@pocoo.org", "Fix session cookie serialization error and invalid payload crash", {
        "src/flask/sessions.py": (
            "import json\n"
            "class SecureCookieSession:\n"
            "    def __init__(self, initial=None):\n"
            "        self.data = initial or {}\n"
            "        self.modified = False\n"
            "    def get(self, k, default=None):\n"
            "        if not isinstance(self.data, dict):\n"
            "            return default\n"
            "        return self.data.get(k, default)\n"
            "    def set(self, k, v):\n"
            "        self.data[k] = v\n"
            "        self.modified = True\n"
        ),
    })

    # Day 110: Circular dependency injection between ctx.py and globals.py (C3 smell)
    _commit_at(dest, base, 110, "David Lord", "david@palletsprojects.com", "Inject context proxies into global namespace", {
        "src/flask/globals.py": (
            "from .ctx import AppContext\n"
            "current_app = None\n"
            "request = None\n"
        ),
    })

    # Day 135: Bug fix in routes.py
    _commit_at(dest, base, 135, "Armin Ronacher", "armin@pocoo.org", "Fix route parameter binding bug on empty paths", {
        "src/flask/routes.py": (
            "from .app import Flask\n"
            "from .models import User\n\n"
            "def register_routes(app: Flask):\n"
            "    @app.route('/api/users')\n"
            "    def get_users():\n"
            "        return '[]'\n\n"
            "    @app.route('/api/health')\n"
            "    def health_check():\n"
            "        return 'OK'\n\n"
            "    @app.route('/api/status')\n"
            "    def status():\n"
            "        return '{\"status\": \"healthy\"}'\n"
        ),
    })

    # Day 150: Co-change commit: app.py and sessions.py without direct import (Hidden Coupling B1, support = 2)
    _commit_at(dest, base, 150, "David Lord", "david@palletsprojects.com", "Synchronize session cookie expiration with application request context", {
        "src/flask/app.py": (
            "from .ctx import RequestContext, AppContext\n"
            "from .helpers import url_for\n"
            "from .wrappers import Request, Response\n"
            "from .config import Config\n\n"
            "class Flask:\n"
            "    def __init__(self, import_name: str):\n"
            "        self.import_name = import_name\n"
            "        self.config = Config()\n"
            "        self.blueprints = {}\n"
            "        self.url_map = {}\n"
            "        self.session_interface = None\n\n"
            "    def route(self, rule: str, **options):\n"
            "        def decorator(f):\n"
            "            self.url_map[rule] = f\n"
            "            return f\n"
            "        return decorator\n\n"
            "    def dispatch_request(self, req: Request):\n"
            "        if not req.path:\n"
            "            return Response('Empty path', status=400)\n"
            "        handler = self.url_map.get(req.path)\n"
            "        if handler:\n"
            "            return Response(handler())\n"
            "        return Response('Not Found', status=404)\n\n"
            "    def open_session(self, req: Request):\n"
            "        return None\n"
        ),
        "src/flask/sessions.py": (
            "import json\n"
            "class SecureCookieSession:\n"
            "    def __init__(self, initial=None):\n"
            "        self.data = initial or {}\n"
            "        self.modified = False\n"
            "        self.permanent = False\n"
            "    def get(self, k, default=None):\n"
            "        if not isinstance(self.data, dict):\n"
            "            return default\n"
            "        return self.data.get(k, default)\n"
            "    def set(self, k, v):\n"
            "        self.data[k] = v\n"
            "        self.modified = True\n"
        ),
    })

    return dest

def enrich_and_cache_all():
    print("Enriching synthetic repos and precomputing cached payloads...", flush=True)
    temp_dir = tempfile.mkdtemp(prefix="codecity_rich_")
    from pydriller import Repository
    from mining.git_miner import is_bug_fix_commit
    try:
        repos_to_build = [
            ("pallets_flask", "pallets/flask", build_rich_flask_repo),
            ("pallets_click", "pallets/click", create_synthetic_click_repo),
            ("psf_requests", "psf/requests", create_synthetic_requests_repo)
        ]

        for repo_key, repo_name, builder in repos_to_build:
            r_path = os.path.join(temp_dir, repo_key)
            builder(r_path)

            payload = generate_city_payload(repo_key, repo_name, r_path)

            commits = []
            for c in Repository(r_path, order='reverse').traverse_commits():
                c_date = c.committer_date.astimezone(timezone.utc)
                files = [m.new_path or m.old_path for m in c.modified_files if (m.new_path or m.old_path)]
                commits.append({
                    "hash": c.hash[:8],
                    "date": c_date.isoformat(),
                    "author": c.author.name or "Contributor",
                    "message": c.msg.strip(),
                    "is_bug_fix": is_bug_fix_commit(c.msg),
                    "files": [f.replace("\\", "/") for f in files if f.endswith(".py")]
                })
            payload["commits"] = commits

            out_file = os.path.join(CACHED_DEMOS_DIR, f"{repo_key}.json")
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
            print(f"-> Saved {out_file} ({len(payload['files'])} files, {len(commits)} commits)")

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    enrich_and_cache_all()
