"""
High-Fidelity Synthetic Git Repository Generator for CodeCity AI.

Generates realistic Python Git repositories modeled after real-world architectures:
- Flask (Web Framework)
- Click (CLI Framework)
- Requests (HTTP Client)
- HTTPie (Held-Out CLI Client)

Each repository features realistic multi-package directories, AST dependencies,
realistic commit histories spanning 180 days, diverse authors, bug-fix commits,
and clean temporal milestones for cutoff T (Day 90).
"""

import os
import shutil
import subprocess
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

def _run_git(args: List[str], cwd: str, env: Optional[Dict[str, str]] = None):
    git_env = os.environ.copy()
    if env:
        git_env.update(env)
    res = subprocess.run(["git"] + args, cwd=cwd, env=git_env, capture_output=True, text=True)
    if res.returncode != 0:
        raise RuntimeError(f"Git command failed: {' '.join(args)}\nError: {res.stderr}")
    return res.stdout

def _commit_at(repo_path: str, base_date: datetime, days_offset: int, author: str, email: str, message: str, files: Dict[str, str]):
    c_time = base_date + timedelta(days=days_offset)
    iso_str = c_time.isoformat()
    env = {
        "GIT_AUTHOR_NAME": author,
        "GIT_AUTHOR_EMAIL": email,
        "GIT_AUTHOR_DATE": iso_str,
        "GIT_COMMITTER_NAME": author,
        "GIT_COMMITTER_EMAIL": email,
        "GIT_COMMITTER_DATE": iso_str,
    }
    for rel_f, content in files.items():
        full = os.path.join(repo_path, rel_f)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        with open(full, "w", encoding="utf-8") as f:
            f.write(content)
        _run_git(["add", rel_f], cwd=repo_path)
    _run_git(["commit", "--allow-empty", "-m", message], cwd=repo_path, env=env)

def create_synthetic_flask_repo(dest_path: str) -> str:
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path, ignore_errors=True)
    os.makedirs(dest_path, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest_path)
    _run_git(["config", "user.name", "Armin Ronacher"], cwd=dest_path)
    _run_git(["config", "user.email", "armin@pocoo.org"], cwd=dest_path)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    # Initial structure
    _commit_at(dest_path, base, 0, "Armin Ronacher", "armin@pocoo.org", "Initial Flask scaffolding", {
        "src/flask/__init__.py": "from .app import Flask\nfrom .blueprints import Blueprint\n__version__ = '3.0.0'\n",
        "src/flask/app.py": (
            "from .ctx import RequestContext, AppContext\n"
            "from .helpers import url_for\n"
            "from .wrappers import Request, Response\n\n"
            "class Flask:\n"
            "    def __init__(self, import_name: str):\n"
            "        self.import_name = import_name\n"
            "        self.blueprints = {}\n"
            "        self.url_map = {}\n\n"
            "    def dispatch_request(self, req: Request):\n"
            "        if not req.path:\n"
            "            return Response('Empty path', status=400)\n"
            "        return Response('OK')\n"
        ),
        "src/flask/blueprints.py": (
            "from .helpers import url_for\n\n"
            "class Blueprint:\n"
            "    def __init__(self, name: str, import_name: str):\n"
            "        self.name = name\n"
            "        self.import_name = import_name\n"
            "        self.deferred_functions = []\n\n"
            "    def route(self, rule: str):\n"
            "        def decorator(f):\n"
            "            self.deferred_functions.append((rule, f))\n"
            "            return f\n"
            "        return decorator\n"
        ),
        "src/flask/ctx.py": (
            "class AppContext:\n"
            "    def __init__(self, app):\n"
            "        self.app = app\n\n"
            "class RequestContext:\n"
            "    def __init__(self, app, req):\n"
            "        self.app = app\n"
            "        self.request = req\n"
        ),
        "src/flask/helpers.py": (
            "def url_for(endpoint: str, **values) -> str:\n"
            "    if not endpoint:\n"
            "        return '/'\n"
            "    return f'/{endpoint}'\n"
        ),
        "src/flask/wrappers.py": (
            "class Request:\n"
            "    def __init__(self, path: str):\n"
            "        self.path = path\n\n"
            "class Response:\n"
            "    def __init__(self, body: str, status: int = 200):\n"
            "        self.body = body\n"
            "        self.status = status\n"
        ),
    })

    # Day 20: Add sessions and signals
    _commit_at(dest_path, base, 20, "David Lord", "david@palletsprojects.com", "Add session cookies and signal handlers", {
        "src/flask/sessions.py": (
            "import json\n"
            "class SecureCookieSession:\n"
            "    def __init__(self, initial=None):\n"
            "        self.data = initial or {}\n"
            "    def get(self, k, default=None):\n"
            "        return self.data.get(k, default)\n"
        ),
        "src/flask/signals.py": (
            "class Namespace:\n"
            "    def signal(self, name):\n"
            "        return Signal(name)\n\n"
            "class Signal:\n"
            "    def __init__(self, name):\n"
            "        self.name = name\n"
        )
    })

    # Day 40: Bug fix in app dispatch (pre-T)
    _commit_at(dest_path, base, 40, "Armin Ronacher", "armin@pocoo.org", "Fix regression in url routing and error handling", {
        "src/flask/app.py": (
            "from .ctx import RequestContext, AppContext\n"
            "from .helpers import url_for\n"
            "from .wrappers import Request, Response\n\n"
            "class Flask:\n"
            "    def __init__(self, import_name: str):\n"
            "        self.import_name = import_name\n"
            "        self.blueprints = {}\n"
            "        self.url_map = {}\n\n"
            "    def dispatch_request(self, req: Request):\n"
            "        if req is None or not req.path:\n"
            "            return Response('Invalid request', status=400)\n"
            "        if req.path in self.url_map:\n"
            "            return Response(self.url_map[req.path]())\n"
            "        return Response('Not Found', status=404)\n"
        )
    })

    # Day 70: Add templating and CLI
    _commit_at(dest_path, base, 70, "David Lord", "david@palletsprojects.com", "Add CLI click command runner and template rendering", {
        "src/flask/cli.py": (
            "from .app import Flask\n\n"
            "def run_command(app: Flask, cmd: str):\n"
            "    if cmd == 'run':\n"
            "        print(f'Starting {app.import_name}')\n"
        ),
        "src/flask/templating.py": (
            "from .helpers import url_for\n\n"
            "def render_template(template_name: str, **context) -> str:\n"
            "    return f'<!-- rendered {template_name} -->'\n"
        )
    })

    # CUTOFF T = Day 90
    # Day 110: Post-T Bug Fix in app.py and sessions.py
    _commit_at(dest_path, base, 110, "David Lord", "david@palletsprojects.com", "Fix crash: handle corrupted session cookie format and patch error", {
        "src/flask/sessions.py": (
            "import json\n"
            "class SecureCookieSession:\n"
            "    def __init__(self, initial=None):\n"
            "        self.data = initial or {}\n"
            "    def get(self, k, default=None):\n"
            "        if not isinstance(self.data, dict):\n"
            "            return default\n"
            "        return self.data.get(k, default)\n"
        ),
        "src/flask/app.py": (
            "from .ctx import RequestContext, AppContext\n"
            "from .helpers import url_for\n"
            "from .wrappers import Request, Response\n\n"
            "class Flask:\n"
            "    def __init__(self, import_name: str):\n"
            "        self.import_name = import_name\n"
            "        self.blueprints = {}\n"
            "        self.url_map = {}\n\n"
            "    def dispatch_request(self, req: Request):\n"
            "        if req is None or not req.path:\n"
            "            return Response('Invalid request', status=400)\n"
            "        try:\n"
            "            if req.path in self.url_map:\n"
            "                return Response(self.url_map[req.path]())\n"
            "            return Response('Not Found', status=404)\n"
            "        except Exception as err:\n"
            "            return Response(f'Internal Error: {err}', status=500)\n"
        )
    })

    # Day 130: Normal commit
    _commit_at(dest_path, base, 130, "Armin Ronacher", "armin@pocoo.org", "Add documentation docstrings to blueprints", {
        "src/flask/blueprints.py": (
            "'''Blueprint module for modular Flask applications.'''\n"
            "from .helpers import url_for\n\n"
            "class Blueprint:\n"
            "    def __init__(self, name: str, import_name: str):\n"
            "        self.name = name\n"
            "        self.import_name = import_name\n"
            "        self.deferred_functions = []\n\n"
            "    def route(self, rule: str):\n"
            "        def decorator(f):\n"
            "            self.deferred_functions.append((rule, f))\n"
            "            return f\n"
            "        return decorator\n"
        )
    })

    return dest_path


def create_synthetic_click_repo(dest_path: str) -> str:
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path, ignore_errors=True)
    os.makedirs(dest_path, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest_path)
    _run_git(["config", "user.name", "Click Team"], cwd=dest_path)
    _run_git(["config", "user.email", "click@palletsprojects.com"], cwd=dest_path)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    _commit_at(dest_path, base, 0, "Armin Ronacher", "armin@pocoo.org", "Initial Click codebase", {
        "src/click/__init__.py": "from .core import Command, Group\nfrom .decorators import command, group, option\n",
        "src/click/core.py": (
            "from .parser import OptionParser\n"
            "from .types import STRING, INT\n"
            "from .exceptions import UsageError\n\n"
            "class Command:\n"
            "    def __init__(self, name: str, callback=None):\n"
            "        self.name = name\n"
            "        self.callback = callback\n"
            "        self.params = []\n\n"
            "    def invoke(self, ctx):\n"
            "        if self.callback:\n"
            "            return self.callback(*ctx.args)\n"
            "        return None\n\n"
            "class Group(Command):\n"
            "    def __init__(self, name: str):\n"
            "        super().__init__(name)\n"
            "        self.commands = {}\n"
        ),
        "src/click/parser.py": (
            "class OptionParser:\n"
            "    def __init__(self):\n"
            "        self.options = {}\n\n"
            "    def parse_args(self, args):\n"
            "        opts = {}\n"
            "        for a in args:\n"
            "            if a.startswith('--'):\n"
            "                k, _, v = a[2:].partition('=')\n"
            "                opts[k] = v or True\n"
            "        return opts\n"
        ),
        "src/click/types.py": (
            "class ParamType:\n"
            "    name = 'param'\n"
            "    def convert(self, val):\n"
            "        return val\n\n"
            "STRING = ParamType()\n"
            "INT = ParamType()\n"
        ),
        "src/click/decorators.py": (
            "from .core import Command, Group\n\n"
            "def command(name=None):\n"
            "    def dec(fn):\n"
            "        return Command(name or fn.__name__, callback=fn)\n"
            "    return dec\n\n"
            "def group(name=None):\n"
            "    def dec(fn):\n"
            "        return Group(name or fn.__name__)\n"
            "    return dec\n\n"
            "def option(*param_decls, **attrs):\n"
            "    def dec(f):\n"
            "        return f\n"
            "    return dec\n"
        ),
        "src/click/exceptions.py": (
            "class ClickException(Exception):\n"
            "    pass\n\n"
            "class UsageError(ClickException):\n"
            "    pass\n"
        ),
    })

    # Day 30: Add formatting and formatting styling
    _commit_at(dest_path, base, 30, "Markus Unterwaditzer", "markus@dev.org", "Add formatting helpers and termui", {
        "src/click/formatting.py": (
            "class HelpFormatter:\n"
            "    def __init__(self, width=80):\n"
            "        self.width = width\n"
            "        self.buffer = []\n"
            "    def write_heading(self, heading):\n"
            "        self.buffer.append(f'{heading}:\\n')\n"
        ),
        "src/click/termui.py": (
            "import sys\n"
            "def echo(message=None, file=None):\n"
            "        file = file or sys.stdout\n"
            "        file.write(str(message) + '\\n')\n"
        )
    })

    # Day 60: Bug fix in parser
    _commit_at(dest_path, base, 60, "Armin Ronacher", "armin@pocoo.org", "Fix bug in parser when flag value contains equal signs", {
        "src/click/parser.py": (
            "class OptionParser:\n"
            "    def __init__(self):\n"
            "        self.options = {}\n\n"
            "    def parse_args(self, args):\n"
            "        opts = {}\n"
            "        for a in args:\n"
            "            if a.startswith('--'):\n"
            "                k, sep, v = a[2:].partition('=')\n"
            "                opts[k] = v if sep else True\n"
            "        return opts\n"
        )
    })

    # CUTOFF T = Day 90
    # Day 115: Post-T Bug Fix in core.py
    _commit_at(dest_path, base, 115, "David Lord", "david@palletsprojects.com", "Fix error: crash when invoke args are empty in core Command", {
        "src/click/core.py": (
            "from .parser import OptionParser\n"
            "from .types import STRING, INT\n"
            "from .exceptions import UsageError\n\n"
            "class Command:\n"
            "    def __init__(self, name: str, callback=None):\n"
            "        self.name = name\n"
            "        self.callback = callback\n"
            "        self.params = []\n\n"
            "    def invoke(self, ctx):\n"
            "        if not ctx or not hasattr(ctx, 'args'):\n"
            "            raise UsageError('Invalid command context')\n"
            "        if self.callback:\n"
            "            return self.callback(*ctx.args)\n"
            "        return None\n\n"
            "class Group(Command):\n"
            "    def __init__(self, name: str):\n"
            "        super().__init__(name)\n"
            "        self.commands = {}\n"
        )
    })

    return dest_path


def create_synthetic_requests_repo(dest_path: str) -> str:
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path, ignore_errors=True)
    os.makedirs(dest_path, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest_path)
    _run_git(["config", "user.name", "Kenneth Reitz"], cwd=dest_path)
    _run_git(["config", "user.email", "me@kennethreitz.org"], cwd=dest_path)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    _commit_at(dest_path, base, 0, "Kenneth Reitz", "me@kennethreitz.org", "Initial Requests release", {
        "src/requests/__init__.py": "from .api import get, post, request\nfrom .models import Response, Request\nfrom .sessions import Session\n",
        "src/requests/api.py": (
            "from .sessions import Session\n\n"
            "def request(method: str, url: str, **kwargs):\n"
            "    with Session() as session:\n"
            "        return session.request(method=method, url=url, **kwargs)\n\n"
            "def get(url: str, params=None, **kwargs):\n"
            "    return request('get', url, params=params, **kwargs)\n\n"
            "def post(url: str, data=None, **kwargs):\n"
            "    return request('post', url, data=data, **kwargs)\n"
        ),
        "src/requests/sessions.py": (
            "from .models import Request, Response\n"
            "from .adapters import HTTPAdapter\n"
            "from .auth import HTTPBasicAuth\n"
            "from .cookies import cookiejar_from_dict\n\n"
            "class Session:\n"
            "    def __init__(self):\n"
            "        self.headers = {}\n"
            "        self.cookies = {}\n"
            "        self.adapter = HTTPAdapter()\n\n"
            "    def __enter__(self):\n"
            "        return self\n\n"
            "    def __exit__(self, *args):\n"
            "        pass\n\n"
            "    def request(self, method: str, url: str, **kwargs) -> Response:\n"
            "        req = Request(method, url)\n"
            "        return self.adapter.send(req)\n"
        ),
        "src/requests/models.py": (
            "from .utils import dict_to_sequence\n"
            "from .exceptions import RequestException\n\n"
            "class Request:\n"
            "    def __init__(self, method: str, url: str):\n"
            "        self.method = method\n"
            "        self.url = url\n\n"
            "class Response:\n"
            "    def __init__(self, status_code: int = 200, content: bytes = b''):\n"
            "        self.status_code = status_code\n"
            "        self.content = content\n"
            "    @property\n"
            "    def text(self) -> str:\n"
            "        return self.content.decode('utf-8', 'ignore')\n"
        ),
        "src/requests/adapters.py": (
            "from .models import Response\n"
            "from .exceptions import ConnectionError\n\n"
            "class HTTPAdapter:\n"
            "    def send(self, request) -> Response:\n"
            "        if not request.url:\n"
            "            raise ConnectionError('No URL provided')\n"
            "        return Response(200, b'ok')\n"
        ),
        "src/requests/auth.py": (
            "class HTTPBasicAuth:\n"
            "    def __init__(self, username, password):\n"
            "        self.username = username\n"
            "        self.password = password\n"
        ),
        "src/requests/cookies.py": (
            "def cookiejar_from_dict(cookie_dict):\n"
            "    return dict(cookie_dict or {})\n"
        ),
        "src/requests/utils.py": (
            "def dict_to_sequence(d):\n"
            "    return list(d.items()) if d else []\n"
        ),
        "src/requests/exceptions.py": (
            "class RequestException(IOError):\n"
            "    pass\n"
            "class ConnectionError(RequestException):\n"
            "    pass\n"
        ),
    })

    # Day 35: Bug fix in utils (pre-T)
    _commit_at(dest_path, base, 35, "Cory Benfield", "cory@lukasa.co.uk", "Fix issue #2104: handle non-dict objects in dict_to_sequence", {
        "src/requests/utils.py": (
            "def dict_to_sequence(d):\n"
            "    if not hasattr(d, 'items'):\n"
            "        return []\n"
            "    return list(d.items())\n"
        )
    })

    # CUTOFF T = Day 90
    # Day 112: Post-T Bug Fix in models.py and adapters.py
    _commit_at(dest_path, base, 112, "Cory Benfield", "cory@lukasa.co.uk", "Fix crash: handle unicode decoding failure in Response.text and connection error patch", {
        "src/requests/models.py": (
            "from .utils import dict_to_sequence\n"
            "from .exceptions import RequestException\n\n"
            "class Request:\n"
            "    def __init__(self, method: str, url: str):\n"
            "        self.method = method\n"
            "        self.url = url\n\n"
            "class Response:\n"
            "    def __init__(self, status_code: int = 200, content: bytes = b''):\n"
            "        self.status_code = status_code\n"
            "        self.content = content\n"
            "    @property\n"
            "    def text(self) -> str:\n"
            "        if self.content is None:\n"
            "            return ''\n"
            "        try:\n"
            "            return self.content.decode('utf-8')\n"
            "        except UnicodeDecodeError:\n"
            "            return self.content.decode('latin1', errors='replace')\n"
        )
    })

    return dest_path


def create_synthetic_httpie_repo(dest_path: str) -> str:
    """
    HELD-OUT REPOSITORY for unbiased evaluation.
    """
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path, ignore_errors=True)
    os.makedirs(dest_path, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest_path)
    _run_git(["config", "user.name", "Jakub Roztočil"], cwd=dest_path)
    _run_git(["config", "user.email", "jakub@roztocil.co"], cwd=dest_path)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    _commit_at(dest_path, base, 0, "Jakub Roztočil", "jakub@roztocil.co", "Initial HTTPie architecture", {
        "src/httpie/__init__.py": "__version__ = '3.2.0'\n",
        "src/httpie/core.py": (
            "from .context import Environment\n"
            "from .client import build_request, perform_request\n"
            "from .output import format_response\n\n"
            "def main(args, env: Environment):\n"
            "    req = build_request(args)\n"
            "    resp = perform_request(req)\n"
            "    return format_response(resp)\n"
        ),
        "src/httpie/client.py": (
            "from .models import HTTPRequest, HTTPResponse\n"
            "from .plugins import get_auth_plugin\n\n"
            "def build_request(args) -> HTTPRequest:\n"
            "    url = args.get('url', 'http://localhost')\n"
            "    return HTTPRequest('GET', url)\n\n"
            "def perform_request(req: HTTPRequest) -> HTTPResponse:\n"
            "    return HTTPResponse(200, b'{\"status\": \"ok\"}')\n"
        ),
        "src/httpie/models.py": (
            "class HTTPRequest:\n"
            "    def __init__(self, method: str, url: str):\n"
            "        self.method = method\n"
            "        self.url = url\n\n"
            "class HTTPResponse:\n"
            "    def __init__(self, status: int, body: bytes):\n"
            "        self.status = status\n"
            "        self.body = body\n"
        ),
        "src/httpie/context.py": (
            "class Environment:\n"
            "    def __init__(self, stdout=None, stderr=None):\n"
            "        self.stdout = stdout\n"
            "        self.stderr = stderr\n"
        ),
        "src/httpie/output.py": (
            "from .models import HTTPResponse\n\n"
            "def format_response(resp: HTTPResponse) -> str:\n"
            "    return f'HTTP/1.1 {resp.status}\\n\\n{resp.body.decode(\"utf-8\", \"ignore\")}'\n"
        ),
        "src/httpie/plugins.py": (
            "def get_auth_plugin(name: str):\n"
            "    return None\n"
        ),
        "src/httpie/downloads.py": (
            "def download_file(url: str, dest_file: str):\n"
            "    pass\n"
        ),
    })

    # Day 30: Feature addition in output formatting
    _commit_at(dest_path, base, 30, "Mickaël Schoentgen", "contact@tiger-222.fr", "Add colorized syntax highlighting to output formatter", {
        "src/httpie/output.py": (
            "from .models import HTTPResponse\n\n"
            "def format_response(resp: HTTPResponse, colorize: bool = False) -> str:\n"
            "    body_str = resp.body.decode('utf-8', 'ignore')\n"
            "    if colorize:\n"
            "        body_str = f'\\033[32m{body_str}\\033[0m'\n"
            "    return f'HTTP/1.1 {resp.status}\\n\\n{body_str}'\n"
        )
    })

    # Day 65: Bug fix in downloads (pre-T)
    _commit_at(dest_path, base, 65, "Jakub Roztočil", "jakub@roztocil.co", "Fix bug in resume download logic", {
        "src/httpie/downloads.py": (
            "import os\n"
            "def download_file(url: str, dest_file: str, resume: bool = False):\n"
            "    if resume and os.path.exists(dest_file):\n"
            "        return True\n"
            "    return False\n"
        )
    })

    # CUTOFF T = Day 90
    # Day 110: Post-T Bug Fix touching core.py and client.py
    _commit_at(dest_path, base, 110, "Mickaël Schoentgen", "contact@tiger-222.fr", "Fix crash: handle invalid scheme error and url parsing bug in client", {
        "src/httpie/client.py": (
            "from .models import HTTPRequest, HTTPResponse\n"
            "from .plugins import get_auth_plugin\n\n"
            "def build_request(args) -> HTTPRequest:\n"
            "    url = args.get('url', '')\n"
            "    if not url.startswith(('http://', 'https://')):\n"
            "        url = f'http://{url}'\n"
            "    return HTTPRequest('GET', url)\n\n"
            "def perform_request(req: HTTPRequest) -> HTTPResponse:\n"
            "    if not req.url:\n"
            "        raise ValueError('Invalid request url')\n"
            "    return HTTPResponse(200, b'{\"status\": \"ok\"}')\n"
        ),
        "src/httpie/core.py": (
            "from .context import Environment\n"
            "from .client import build_request, perform_request\n"
            "from .output import format_response\n\n"
            "def main(args, env: Environment):\n"
            "    try:\n"
            "        req = build_request(args)\n"
            "        resp = perform_request(req)\n"
            "        return format_response(resp)\n"
            "    except Exception as err:\n"
            "        return f'Error: {err}'\n"
        )
    })

    return dest_path


def create_synthetic_express_repo(dest_path: str) -> str:
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path, ignore_errors=True)
    os.makedirs(dest_path, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest_path)
    _run_git(["config", "user.name", "TJ Holowaychuk"], cwd=dest_path)
    _run_git(["config", "user.email", "tj@vision-media.ca"], cwd=dest_path)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    _commit_at(dest_path, base, 0, "TJ Holowaychuk", "tj@vision-media.ca", "Initial Express framework skeleton", {
        "package.json": '{\n  "name": "express",\n  "version": "4.18.2",\n  "main": "lib/express.js"\n}\n',
        "lib/express.js": (
            "const EventEmitter = require('events').EventEmitter;\n"
            "const proto = require('./application');\n"
            "const Route = require('./router/route');\n"
            "const Router = require('./router/index');\n\n"
            "function createApplication() {\n"
            "  const app = function(req, res, next) {\n"
            "    app.handle(req, res, next);\n"
            "  };\n"
            "  return Object.assign(app, proto);\n"
            "}\n"
            "exports = module.exports = createApplication;\n"
            "exports.Router = Router;\n"
            "exports.Route = Route;\n"
        ),
        "lib/application.js": (
            "const Router = require('./router/index');\n"
            "const middleware = require('./middleware/init');\n\n"
            "const app = exports = module.exports = {};\n"
            "app.init = function() {\n"
            "  this._router = new Router();\n"
            "  this.use(middleware.init(this));\n"
            "};\n"
            "app.use = function(fn) {\n"
            "  if (typeof fn !== 'function') throw new TypeError('Middleware must be a function');\n"
            "  return this._router.use(fn);\n"
            "};\n"
            "app.handle = function(req, res, callback) {\n"
            "  this._router.handle(req, res, callback);\n"
            "};\n"
        ),
        "lib/router/index.js": (
            "const Route = require('./route');\n\n"
            "function Router() {\n"
            "  this.stack = [];\n"
            "}\n"
            "Router.prototype.use = function(fn) {\n"
            "  this.stack.push({ handle: fn });\n"
            "  return this;\n"
            "};\n"
            "Router.prototype.route = function(path) {\n"
            "  const route = new Route(path);\n"
            "  this.stack.push({ path: path, route: route });\n"
            "  return route;\n"
            "};\n"
            "Router.prototype.handle = function(req, res, out) {\n"
            "  for (let i = 0; i < this.stack.length; i++) {\n"
            "    if (this.stack[i].handle) this.stack[i].handle(req, res, out);\n"
            "  }\n"
            "};\n"
            "module.exports = Router;\n"
        ),
        "lib/router/route.js": (
            "function Route(path) {\n"
            "  this.path = path;\n"
            "  this.methods = {};\n"
            "}\n"
            "Route.prototype.dispatch = function(req, res, done) {\n"
            "  if (!this.methods[req.method]) return done();\n"
            "  return done(null);\n"
            "};\n"
            "module.exports = Route;\n"
        ),
        "lib/middleware/init.js": (
            "exports.init = function(app) {\n"
            "  return function expressInit(req, res, next) {\n"
            "    req.app = app;\n"
            "    res.app = app;\n"
            "    if (next) next();\n"
            "  };\n"
            "};\n"
        ),
        "test/app.test.js": (
            "const express = require('../lib/express');\n\n"
            "describe('Express Application', () => {\n"
            "  it('should initialize cleanly', () => {\n"
            "    const app = express();\n"
            "    if (!app) throw new Error('app should exist');\n"
            "  });\n"
            "});\n"
        )
    })

    # Day 40: Bug fix in Router pre-T
    _commit_at(dest_path, base, 40, "Douglas Christopher Wilson", "doug@somethingdoug.com", "Fix router crash when route stack is null or undefined", {
        "lib/router/index.js": (
            "const Route = require('./route');\n\n"
            "function Router() {\n"
            "  this.stack = [];\n"
            "}\n"
            "Router.prototype.use = function(fn) {\n"
            "  if (!fn) return this;\n"
            "  this.stack.push({ handle: fn });\n"
            "  return this;\n"
            "};\n"
            "Router.prototype.route = function(path) {\n"
            "  const route = new Route(path);\n"
            "  this.stack.push({ path: path, route: route });\n"
            "  return route;\n"
            "};\n"
            "Router.prototype.handle = function(req, res, out) {\n"
            "  if (!this.stack || !Array.isArray(this.stack)) return out ? out() : null;\n"
            "  for (let i = 0; i < this.stack.length; i++) {\n"
            "    if (this.stack[i] && this.stack[i].handle) {\n"
            "      this.stack[i].handle(req, res, out);\n"
            "    }\n"
            "  }\n"
            "};\n"
            "module.exports = Router;\n"
        )
    })

    # CUTOFF T = Day 90
    # Day 120: Post-T Bug Fix in application.js
    _commit_at(dest_path, base, 120, "Douglas Christopher Wilson", "doug@somethingdoug.com", "Fix bug #4182: handle exception in express.handle and preserve error state", {
        "lib/application.js": (
            "const Router = require('./router/index');\n"
            "const middleware = require('./middleware/init');\n\n"
            "const app = exports = module.exports = {};\n"
            "app.init = function() {\n"
            "  this._router = new Router();\n"
            "  this.use(middleware.init(this));\n"
            "};\n"
            "app.use = function(fn) {\n"
            "  if (typeof fn !== 'function') throw new TypeError('Middleware must be a function');\n"
            "  return this._router.use(fn);\n"
            "};\n"
            "app.handle = function(req, res, callback) {\n"
            "  try {\n"
            "    if (!this._router) this.init();\n"
            "    this._router.handle(req, res, callback);\n"
            "  } catch (err) {\n"
            "    if (callback) callback(err);\n"
            "  }\n"
            "};\n"
        )
    })

    return dest_path


def create_synthetic_zod_repo(dest_path: str) -> str:
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path, ignore_errors=True)
    os.makedirs(dest_path, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest_path)
    _run_git(["config", "user.name", "Colin McDonnell"], cwd=dest_path)
    _run_git(["config", "user.email", "colin@zod.dev"], cwd=dest_path)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    _commit_at(dest_path, base, 0, "Colin McDonnell", "colin@zod.dev", "Initial Zod TypeScript architecture", {
        "tsconfig.json": '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "commonjs",\n    "paths": {\n      "@/*": ["src/*"]\n    }\n  }\n}\n',
        "package.json": '{\n  "name": "zod",\n  "version": "3.22.4"\n}\n',
        "src/index.ts": (
            'export * from "./types";\n'
            'export * from "./schemas";\n'
            'export * from "./helpers/parseUtil";\n'
        ),
        "src/types.ts": (
            'export type ParseReturnType<T> = { status: "valid"; value: T } | { status: "aborted"; error: any };\n'
            'export interface ZodTypeDef {\n'
            '  errorMap?: any;\n'
            '  description?: string;\n'
            '}\n'
            'export abstract class ZodType<Output = any, Def extends ZodTypeDef = ZodTypeDef> {\n'
            '  readonly _def!: Def;\n'
            '  abstract _parse(input: any): ParseReturnType<Output>;\n'
            '  parse(data: unknown): Output {\n'
            '    const result = this._parse(data);\n'
            '    if (result.status === "valid") return result.value;\n'
            '    throw new Error("Validation error");\n'
            '  }\n'
            '}\n'
        ),
        "src/helpers/parseUtil.ts": (
            'import { ParseReturnType } from "../types";\n\n'
            'export const OK = <T>(value: T): ParseReturnType<T> => ({\n'
            '  status: "valid",\n'
            '  value,\n'
            '});\n'
            'export const INVALID = (error: any): ParseReturnType<never> => ({\n'
            '  status: "aborted",\n'
            '  error,\n'
            '});\n'
        ),
        "src/schemas.ts": (
            'import { ZodType, ZodTypeDef } from "./types";\n'
            'import { OK, INVALID } from "./helpers/parseUtil";\n\n'
            'export class ZodString extends ZodType<string> {\n'
            '  _parse(input: any) {\n'
            '    if (typeof input === "string") return OK(input);\n'
            '    return INVALID("Expected string");\n'
            '  }\n'
            '}\n'
            'export const string = (): ZodString => new ZodString();\n'
        ),
        "tests/basic.test.ts": (
            'import { string } from "../src/schemas";\n\n'
            'describe("ZodString", () => {\n'
            '  it("validates string inputs", () => {\n'
            '    const s = string();\n'
            '    if (s.parse("hello") !== "hello") throw new Error("Failed");\n'
            '  });\n'
            '});\n'
        )
    })

    # Day 50: Bug fix in parseUtil pre-T
    _commit_at(dest_path, base, 50, "Colin McDonnell", "colin@zod.dev", "Fix parsing bug for undefined input values", {
        "src/helpers/parseUtil.ts": (
            'import { ParseReturnType } from "../types";\n\n'
            'export const OK = <T>(value: T): ParseReturnType<T> => ({\n'
            '  status: "valid",\n'
            '  value,\n'
            '});\n'
            'export const INVALID = (error: any): ParseReturnType<never> => ({\n'
            '  status: "aborted",\n'
            '  error: error ?? "Unknown error",\n'
            '});\n'
        )
    })

    # CUTOFF T = Day 90
    # Day 115: Post-T Bug Fix in schemas.ts
    _commit_at(dest_path, base, 115, "Colin McDonnell", "colin@zod.dev", "Fix regression in string schema coercion and empty input error", {
        "src/schemas.ts": (
            'import { ZodType, ZodTypeDef } from "./types";\n'
            'import { OK, INVALID } from "./helpers/parseUtil";\n\n'
            'export class ZodString extends ZodType<string> {\n'
            '  _parse(input: any) {\n'
            '    if (typeof input === "string") return OK(input);\n'
            '    if (input === null || input === undefined) return INVALID("Received null or undefined");\n'
            '    return INVALID("Expected string");\n'
            '  }\n'
            '}\n'
            'export const string = (): ZodString => new ZodString();\n'
        )
    })

    return dest_path


def create_synthetic_gson_repo(dest_path: str) -> str:
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path, ignore_errors=True)
    os.makedirs(dest_path, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest_path)
    _run_git(["config", "user.name", "Inderjeet Singh"], cwd=dest_path)
    _run_git(["config", "user.email", "inderjeet@google.com"], cwd=dest_path)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    _commit_at(dest_path, base, 0, "Inderjeet Singh", "inderjeet@google.com", "Initial Gson Java project structure", {
        "pom.xml": '<project><modelVersion>4.0.0</modelVersion><groupId>com.google.code.gson</groupId><artifactId>gson</artifactId><version>2.10.1</version></project>',
        "src/main/java/com/google/gson/Gson.java": (
            "package com.google.gson;\n\n"
            "import com.google.gson.JsonElement;\n"
            "import com.google.gson.JsonObject;\n\n"
            "public class Gson {\n"
            "  public String toJson(Object src) {\n"
            "    if (src == null) return \"null\";\n"
            "    return src.toString();\n"
            "  }\n"
            "  public <T> T fromJson(String json, Class<T> classOfT) {\n"
            "    if (json == null) return null;\n"
            "    return null;\n"
            "  }\n"
            "}\n"
        ),
        "src/main/java/com/google/gson/JsonElement.java": (
            "package com.google.gson;\n\n"
            "public abstract class JsonElement {\n"
            "  public boolean isJsonObject() {\n"
            "    return this instanceof JsonObject;\n"
            "  }\n"
            "  public JsonObject getAsJsonObject() {\n"
            "    if (isJsonObject()) return (JsonObject) this;\n"
            "    throw new IllegalStateException(\"Not a JSON Object\");\n"
            "  }\n"
            "}\n"
        ),
        "src/main/java/com/google/gson/JsonObject.java": (
            "package com.google.gson;\n\n"
            "import java.util.HashMap;\n"
            "import java.util.Map;\n\n"
            "public class JsonObject extends JsonElement {\n"
            "  private final Map<String, JsonElement> members = new HashMap<>();\n"
            "  public void add(String property, JsonElement value) {\n"
            "    members.put(property, value);\n"
            "  }\n"
            "  public JsonElement get(String property) {\n"
            "    return members.get(property);\n"
            "  }\n"
            "}\n"
        ),
        "src/test/java/com/google/gson/GsonTest.java": (
            "package com.google.gson;\n\n"
            "public class GsonTest {\n"
            "  public void testGsonNotNull() {\n"
            "    Gson gson = new Gson();\n"
            "    assert gson != null;\n"
            "  }\n"
            "}\n"
        )
    })

    # Day 50: Pre-T bug fix
    _commit_at(dest_path, base, 50, "Joel Leitch", "joelleitch@google.com", "Fix NullPointerException bug in JsonObject.get", {
        "src/main/java/com/google/gson/JsonObject.java": (
            "package com.google.gson;\n\n"
            "import java.util.HashMap;\n"
            "import java.util.Map;\n\n"
            "public class JsonObject extends JsonElement {\n"
            "  private final Map<String, JsonElement> members = new HashMap<>();\n"
            "  public void add(String property, JsonElement value) {\n"
            "    if (property != null) members.put(property, value);\n"
            "  }\n"
            "  public JsonElement get(String property) {\n"
            "    if (property == null) return null;\n"
            "    return members.get(property);\n"
            "  }\n"
            "}\n"
        )
    })

    # CUTOFF T = Day 90
    # Day 110: Post-T bug fix in Gson.java
    _commit_at(dest_path, base, 110, "Inderjeet Singh", "inderjeet@google.com", "Fix crash: handle empty json string without throwing runtime error", {
        "src/main/java/com/google/gson/Gson.java": (
            "package com.google.gson;\n\n"
            "import com.google.gson.JsonElement;\n"
            "import com.google.gson.JsonObject;\n\n"
            "public class Gson {\n"
            "  public String toJson(Object src) {\n"
            "    if (src == null) return \"null\";\n"
            "    return src.toString();\n"
            "  }\n"
            "  public <T> T fromJson(String json, Class<T> classOfT) {\n"
            "    if (json == null || json.trim().isEmpty()) return null;\n"
            "    return null;\n"
            "  }\n"
            "}\n"
        )
    })

    return dest_path


def create_synthetic_cobra_repo(dest_path: str) -> str:
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path, ignore_errors=True)
    os.makedirs(dest_path, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest_path)
    _run_git(["config", "user.name", "Steve Francia"], cwd=dest_path)
    _run_git(["config", "user.email", "spf@spf13.com"], cwd=dest_path)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    _commit_at(dest_path, base, 0, "Steve Francia", "spf@spf13.com", "Initial Cobra Go CLI framework", {
        "go.mod": "module github.com/spf13/cobra\n\ngo 1.21\n",
        "command.go": (
            "package cobra\n\n"
            "import (\n"
            "    \"fmt\"\n"
            "    \"strings\"\n"
            ")\n\n"
            "type Command struct {\n"
            "    Use string\n"
            "    Short string\n"
            "    Run func(cmd *Command, args []string)\n"
            "    commands []*Command\n"
            "}\n\n"
            "func (c *Command) AddCommand(cmds ...*Command) {\n"
            "    for _, cmd := range cmds {\n"
            "        c.commands = append(c.commands, cmd)\n"
            "    }\n"
            "}\n\n"
            "func (c *Command) Execute() error {\n"
            "    if c.Run != nil {\n"
            "        c.Run(c, []string{})\n"
            "    }\n"
            "    return nil\n"
            "}\n"
        ),
        "args.go": (
            "package cobra\n\n"
            "import \"errors\"\n\n"
            "func ExactArgs(n int) func(*Command, []string) error {\n"
            "    return func(c *Command, args []string) error {\n"
            "        if len(args) != n {\n"
            "            return errors.New(\"invalid argument count\")\n"
            "        }\n"
            "        return nil\n"
            "    }\n"
            "}\n"
        ),
        "command_test.go": (
            "package cobra\n\n"
            "import \"testing\"\n\n"
            "func TestCommandExecute(t *testing.T) {\n"
            "    cmd := &Command{Use: \"test\"}\n"
            "    if err := cmd.Execute(); err != nil {\n"
            "        t.Fatalf(\"Execute failed: %v\", err)\n"
            "    }\n"
            "}\n"
        )
    })

    # Day 50: Pre-T bug fix
    _commit_at(dest_path, base, 50, "Steve Francia", "spf@spf13.com", "Fix nil pointer error in AddCommand when subcommands are nil", {
        "command.go": (
            "package cobra\n\n"
            "import (\n"
            "    \"fmt\"\n"
            "    \"strings\"\n"
            ")\n\n"
            "type Command struct {\n"
            "    Use string\n"
            "    Short string\n"
            "    Run func(cmd *Command, args []string)\n"
            "    commands []*Command\n"
            "}\n\n"
            "func (c *Command) AddCommand(cmds ...*Command) {\n"
            "    for _, cmd := range cmds {\n"
            "        if cmd != nil {\n"
            "            c.commands = append(c.commands, cmd)\n"
            "        }\n"
            "    }\n"
            "}\n\n"
            "func (c *Command) Execute() error {\n"
            "    if c.Run != nil {\n"
            "        c.Run(c, []string{})\n"
            "    }\n"
            "    return nil\n"
            "}\n"
        )
    })

    # CUTOFF T = Day 90
    # Day 115: Post-T bug fix in args.go
    _commit_at(dest_path, base, 115, "Steve Francia", "spf@spf13.com", "Fix bug in argument validation and error formatting for ExactArgs", {
        "args.go": (
            "package cobra\n\n"
            "import (\n"
            "    \"errors\"\n"
            "    \"fmt\"\n"
            ")\n\n"
            "func ExactArgs(n int) func(*Command, []string) error {\n"
            "    return func(c *Command, args []string) error {\n"
            "        if len(args) != n {\n"
            "            return fmt.Errorf(\"accepts %d arg(s), received %d\", n, len(args))\n"
            "        }\n"
            "        return nil\n"
            "    }\n"
            "}\n"
        )
    })

    return dest_path


def create_synthetic_c_repo(dest_path: str) -> str:
    if os.path.exists(dest_path):
        shutil.rmtree(dest_path, ignore_errors=True)
    os.makedirs(dest_path, exist_ok=True)
    _run_git(["init", "-b", "main"], cwd=dest_path)
    _run_git(["config", "user.name", "Dennis Ritchie"], cwd=dest_path)
    _run_git(["config", "user.email", "dmr@bell-labs.com"], cwd=dest_path)

    base = datetime.now(timezone.utc) - timedelta(days=180)

    _commit_at(dest_path, base, 0, "Dennis Ritchie", "dmr@bell-labs.com", "Initial C Math Engine", {
        "include/math_engine.h": (
            "#ifndef MATH_ENGINE_H\n"
            "#define MATH_ENGINE_H\n\n"
            "int add(int a, int b);\n"
            "int multiply(int a, int b);\n"
            "int divide(int a, int b);\n\n"
            "#endif\n"
        ),
        "src/math_engine.c": (
            "#include \"math_engine.h\"\n\n"
            "int add(int a, int b) {\n"
            "    return a + b;\n"
            "}\n\n"
            "int multiply(int a, int b) {\n"
            "    return a * b;\n"
            "}\n\n"
            "int divide(int a, int b) {\n"
            "    if (b == 0) return 0;\n"
            "    return a / b;\n"
            "}\n"
        ),
        "src/solver.c": (
            "#include \"math_engine.h\"\n\n"
            "int compute_hypotenuse_squared(int x, int y) {\n"
            "    int x2 = multiply(x, x);\n"
            "    int y2 = multiply(y, y);\n"
            "    return add(x2, y2);\n"
            "}\n"
        ),
        "tests/test_solver.c": (
            "#include \"math_engine.h\"\n"
            "#include <assert.h>\n\n"
            "int main() {\n"
            "    assert(add(2, 3) == 5);\n"
            "    return 0;\n"
            "}\n"
        )
    })

    # Day 50: Pre-T bug fix
    _commit_at(dest_path, base, 50, "Dennis Ritchie", "dmr@bell-labs.com", "Fix division by zero crash bug in divide", {
        "src/math_engine.c": (
            "#include \"math_engine.h\"\n\n"
            "int add(int a, int b) {\n"
            "    return a + b;\n"
            "}\n\n"
            "int multiply(int a, int b) {\n"
            "    return a * b;\n"
            "}\n\n"
            "int divide(int a, int b) {\n"
            "    if (b == 0) {\n"
            "        return -1; /* error sentinel */\n"
            "    }\n"
            "    return a / b;\n"
            "}\n"
        )
    })

    # CUTOFF T = Day 90
    # Day 120: Post-T bug fix
    _commit_at(dest_path, base, 120, "Dennis Ritchie", "dmr@bell-labs.com", "Fix integer overflow bug in solver hypotenuse calculation", {
        "src/solver.c": (
            "#include \"math_engine.h\"\n\n"
            "int compute_hypotenuse_squared(int x, int y) {\n"
            "    long long x2 = (long long)multiply(x, x);\n"
            "    long long y2 = (long long)multiply(y, y);\n"
            "    return (int)(x2 + y2);\n"
            "}\n"
        )
    })

    return dest_path


def create_synthetic_git_repo(dest_path: str, repo_name: str = "demo_repo") -> str:
    """
    Dispatcher for named synthetic repos across multiple languages.
    """
    clean = repo_name.lower()
    if "flask" in clean:
        return create_synthetic_flask_repo(dest_path)
    elif "click" in clean:
        return create_synthetic_click_repo(dest_path)
    elif "requests" in clean:
        return create_synthetic_requests_repo(dest_path)
    elif "httpie" in clean:
        return create_synthetic_httpie_repo(dest_path)
    elif "express" in clean:
        return create_synthetic_express_repo(dest_path)
    elif "zod" in clean:
        return create_synthetic_zod_repo(dest_path)
    elif "gson" in clean:
        return create_synthetic_gson_repo(dest_path)
    elif "cobra" in clean:
        return create_synthetic_cobra_repo(dest_path)
    elif "c" in clean or "math" in clean:
        return create_synthetic_c_repo(dest_path)
    else:
        return create_synthetic_flask_repo(dest_path)


def get_synthetic_cutoff(repo_path: str) -> datetime:
    out = _run_git(["log", "--reverse", "--format=%cI"], cwd=repo_path)
    first_commit_date_str = out.strip().splitlines()[0]
    first_date = datetime.fromisoformat(first_commit_date_str)
    return first_date + timedelta(days=90)
