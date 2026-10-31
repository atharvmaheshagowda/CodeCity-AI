"""
Language Registry, Capabilities Mapping, File Classification, and Exclusion Filtering.

Supports detection and capabilities tracking for 30+ programming languages,
classifies files into architectural roles (source, test, config, docs, other),
and applies configurable exclusion filters (respecting .gitignore, minified code,
generated headers, binaries, and oversized files).
"""

import os
import re
from dataclasses import dataclass, field
from typing import Dict, List, Set, Optional, Tuple, Any

try:
    import pathspec
except ImportError:
    pathspec = None


@dataclass
class LanguageDefinition:
    name: str  # canonical id: e.g. "python", "javascript", "typescript", "go"
    display_name: str
    extensions: List[str]
    shebang_patterns: List[str] = field(default_factory=list)
    capabilities: Dict[str, str] = field(default_factory=lambda: {
        "complexity": "no",
        "graph": "no",
        "model": "unvalidated"
    })
    color: str = "#94a3b8"  # Slate accent by default


LANGUAGE_DEFINITIONS: List[LanguageDefinition] = [
    LanguageDefinition(
        name="python",
        display_name="Python",
        extensions=[".py", ".pyi", ".pyw"],
        shebang_patterns=[r"python3?"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#38bdf8"
    ),
    LanguageDefinition(
        name="javascript",
        display_name="JavaScript",
        extensions=[".js", ".jsx", ".mjs", ".cjs"],
        shebang_patterns=[r"node", r"nodejs"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#facc15"
    ),
    LanguageDefinition(
        name="typescript",
        display_name="TypeScript",
        extensions=[".ts", ".tsx", ".mts", ".cts"],
        shebang_patterns=[r"ts-node", r"deno", r"bun"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#60a5fa"
    ),
    LanguageDefinition(
        name="java",
        display_name="Java",
        extensions=[".java"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#f97316"
    ),
    LanguageDefinition(
        name="kotlin",
        display_name="Kotlin",
        extensions=[".kt", ".kts"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#a855f7"
    ),
    LanguageDefinition(
        name="go",
        display_name="Go",
        extensions=[".go"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#06b6d4"
    ),
    LanguageDefinition(
        name="rust",
        display_name="Rust",
        extensions=[".rs"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#fb923c"
    ),
    LanguageDefinition(
        name="ruby",
        display_name="Ruby",
        extensions=[".rb", ".rake", ".gemspec"],
        shebang_patterns=[r"ruby"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#ef4444"
    ),
    LanguageDefinition(
        name="php",
        display_name="PHP",
        extensions=[".php", ".phtml", ".php3", ".php4", ".php5", ".php7"],
        shebang_patterns=[r"php"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#818cf8"
    ),
    LanguageDefinition(
        name="c",
        display_name="C",
        extensions=[".c", ".h"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#94a3b8"
    ),
    LanguageDefinition(
        name="cpp",
        display_name="C++",
        extensions=[".cpp", ".hpp", ".cc", ".hh", ".cxx", ".hxx", ".c++", ".h++"],
        capabilities={"complexity": "yes", "graph": "yes", "model": "validated"},
        color="#3b82f6"
    ),
    LanguageDefinition(
        name="csharp",
        display_name="C#",
        extensions=[".cs"],
        capabilities={"complexity": "yes", "graph": "partial", "model": "validated"},
        color="#22c55e"
    ),
    LanguageDefinition(
        name="swift",
        display_name="Swift",
        extensions=[".swift"],
        capabilities={"complexity": "yes", "graph": "no", "model": "unvalidated"},
        color="#f43f5e"
    ),
    LanguageDefinition(
        name="scala",
        display_name="Scala",
        extensions=[".scala", ".sc"],
        capabilities={"complexity": "yes", "graph": "no", "model": "unvalidated"},
        color="#dc2626"
    ),
    LanguageDefinition(
        name="shell",
        display_name="Shell",
        extensions=[".sh", ".bash", ".zsh", ".ksh"],
        shebang_patterns=[r"bash", r"sh", r"zsh"],
        capabilities={"complexity": "approx", "graph": "no", "model": "unvalidated"},
        color="#10b981"
    ),
    LanguageDefinition(
        name="html",
        display_name="HTML",
        extensions=[".html", ".htm"],
        capabilities={"complexity": "no", "graph": "no", "model": "unvalidated"},
        color="#ea580c"
    ),
    LanguageDefinition(
        name="css",
        display_name="CSS",
        extensions=[".css", ".scss", ".sass", ".less"],
        capabilities={"complexity": "no", "graph": "no", "model": "unvalidated"},
        color="#38bdf8"
    ),
    LanguageDefinition(
        name="sql",
        display_name="SQL",
        extensions=[".sql"],
        capabilities={"complexity": "approx", "graph": "no", "model": "unvalidated"},
        color="#eab308"
    ),
    LanguageDefinition(
        name="r",
        display_name="R",
        extensions=[".r", ".R"],
        shebang_patterns=[r"Rscript"],
        capabilities={"complexity": "approx", "graph": "no", "model": "unvalidated"},
        color="#2563eb"
    ),
    LanguageDefinition(
        name="dart",
        display_name="Dart",
        extensions=[".dart"],
        capabilities={"complexity": "yes", "graph": "no", "model": "unvalidated"},
        color="#0284c7"
    ),
    LanguageDefinition(
        name="lua",
        display_name="Lua",
        extensions=[".lua"],
        shebang_patterns=[r"lua"],
        capabilities={"complexity": "yes", "graph": "no", "model": "unvalidated"},
        color="#3b82f6"
    ),
    LanguageDefinition(
        name="perl",
        display_name="Perl",
        extensions=[".pl", ".pm"],
        shebang_patterns=[r"perl"],
        capabilities={"complexity": "approx", "graph": "no", "model": "unvalidated"},
        color="#64748b"
    ),
    LanguageDefinition(
        name="other",
        display_name="Other",
        extensions=[],
        capabilities={"complexity": "approx", "graph": "no", "model": "unvalidated"},
        color="#64748b"
    ),
]


class LanguageRegistry:
    def __init__(self, definitions: Optional[List[LanguageDefinition]] = None):
        self.definitions = definitions or LANGUAGE_DEFINITIONS
        self.by_name: Dict[str, LanguageDefinition] = {d.name: d for d in self.definitions}
        self.ext_to_lang: Dict[str, LanguageDefinition] = {}
        for d in self.definitions:
            for ext in d.extensions:
                self.ext_to_lang[ext.lower()] = d

    def detect_language(self, filepath: str, content: Optional[str] = None) -> str:
        """
        Detects language by extension first, then shebang if extension is ambiguous or unknown.
        """
        lower = filepath.lower()
        # Check compound extensions e.g. .test.js, .min.js first
        for ext, d in self.ext_to_lang.items():
            if lower.endswith(ext):
                return d.name

        # Fallback to shebang
        if content:
            first_line = content.split("\n", 1)[0].strip()
            if first_line.startswith("#!"):
                for d in self.definitions:
                    for pat in d.shebang_patterns:
                        if re.search(pat, first_line):
                            return d.name

        return "other"

    def get_definition(self, lang_name: str) -> Optional[LanguageDefinition]:
        return self.by_name.get(lang_name)

    def get_capabilities(self, lang_name: str) -> Dict[str, str]:
        d = self.get_definition(lang_name)
        if d:
            return d.capabilities
        return {"complexity": "approx", "graph": "no", "model": "unvalidated"}

    def get_color(self, lang_name: str) -> str:
        d = self.get_definition(lang_name)
        return d.color if d else "#64748b"

    def all_languages(self) -> List[LanguageDefinition]:
        return self.definitions


# Global registry instance
REGISTRY = LanguageRegistry()


# ==============================================================
# FILE CLASSIFICATION (Source, Test, Config, Docs, Other)
# ==============================================================

TEST_PATH_PATTERNS = [
    re.compile(r"(^|[/\\])(tests?|__tests__|spec|specs|t|testing)([/\\]|$)"),
    re.compile(r"(^|[/\\])(test_[^/\\]+|[^/\\]+[-_.]test|[^/\\]+[-_.]spec)\.[a-zA-Z0-9]+$"),
    re.compile(r"(^|[/\\])(Test[A-Z0-9][a-zA-Z0-9]*|[A-Z0-9][a-zA-Z0-9]*Tests?)\.[a-zA-Z0-9]+$"),
]

CONFIG_FILENAMES = {
    "package.json", "tsconfig.json", "jsconfig.json", "go.mod", "go.sum",
    "cargo.toml", "cargo.lock", "pom.xml", "build.gradle", "settings.gradle",
    "build.gradle.kts", "settings.gradle.kts", "pyproject.toml", "setup.cfg",
    "setup.py", "pipfile", "pipfile.lock", "makefile", "cmakelists.txt",
    "dockerfile", "docker-compose.yml", "docker-compose.yaml", ".gitignore",
    ".gitattributes", ".editorconfig", "vite.config.ts", "vite.config.js",
    "webpack.config.js", "tailwind.config.js", "tailwind.config.ts",
    "postcss.config.js", ".eslintrc.json", ".eslintrc.js", ".prettierrc",
    "requirements.txt", "gemfile", "gemfile.lock"
}

CONFIG_EXTENSIONS = {
    ".json", ".yaml", ".yml", ".toml", ".ini", ".cfg", ".conf",
    ".xml", ".properties", ".plist", ".env", ".env.example"
}

DOCS_EXTENSIONS = {".md", ".markdown", ".rst", ".txt", ".adoc", ".pdf"}
DOCS_FILENAMES = {
    "readme", "readme.md", "license", "license.txt", "license.md",
    "changelog", "changelog.md", "contributing", "contributing.md",
    "authors", "notice", "code_of_conduct.md"
}


def classify_file(filepath: str) -> str:
    """
    Classifies a file path into one of: 'source', 'test', 'config', 'docs', 'other'.
    """
    norm = filepath.replace("\\", "/").lower()
    fname = norm.split("/")[-1]
    name_no_ext, ext = os.path.splitext(fname)

    # 1. Tests
    for pat in TEST_PATH_PATTERNS:
        if pat.search(norm):
            return "test"

    # 2. Config
    if fname in CONFIG_FILENAMES or fname.startswith(".env") or fname.startswith("tsconfig"):
        return "config"
    if fname.startswith("dockerfile") or fname.startswith("makefile"):
        return "config"
    if ext in CONFIG_EXTENSIONS and not (norm.startswith("docs/") or norm.startswith("doc/")):
        return "config"

    # 3. Docs
    if norm.startswith("docs/") or norm.startswith("doc/") or "/docs/" in norm or "/doc/" in norm:
        return "docs"
    if fname in DOCS_FILENAMES or name_no_ext in DOCS_FILENAMES:
        return "docs"
    if ext in DOCS_EXTENSIONS:
        return "docs"

    # 4. Source (known language extension)
    lang = REGISTRY.detect_language(filepath)
    if lang != "other":
        return "source"

    return "other"


# ==============================================================
# EXCLUSION RULES & GITIGNORE
# ==============================================================

DEFAULT_EXCLUDE_DIRS = {
    ".git", "node_modules", "vendor", "dist", "build", "target", "out",
    ".venv", "venv", "__pycache__", "coverage", ".next", ".nuxt", ".idea",
    ".vscode", ".pytest_cache", ".tox", ".mypy_cache", ".turbo", "bin",
    "obj", ".gradle", ".cargo", "target"
}

DEFAULT_EXCLUDE_EXTS = {
    ".lock", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
    ".woff", ".woff2", ".ttf", ".eot", ".otf", ".mp3", ".wav", ".mp4",
    ".mov", ".zip", ".tar", ".gz", ".7z", ".rar", ".exe", ".dll", ".so",
    ".dylib", ".class", ".pyc", ".pyo", ".pyd", ".o", ".obj", ".bin",
    ".wasm", ".map", ".min.js", ".min.css", ".bundle.js", ".chunk.js"
}

DEFAULT_EXCLUDE_FILENAMES = {
    "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "cargo.lock",
    "go.sum", "composer.lock", "poetry.lock", "gemfile.lock"
}

MAX_FILE_SIZE_BYTES = 1024 * 1024  # 1 MB


def is_minified_or_generated(content: str, filename: str) -> Tuple[bool, str]:
    """
    Checks if a file appears to be minified or machine-generated.
    Returns (is_excluded, reason).
    """
    lower_fn = filename.lower()
    if lower_fn.endswith(".min.js") or lower_fn.endswith(".min.css"):
        return True, "minified_filename"

    if not content:
        return False, ""

    lines = content.splitlines()
    if not lines:
        return False, ""

    # Check for extremely long lines typical of minified or bundled code
    for line in lines[:30]:
        if len(line) > 1500:
            return True, "minified_long_line"

    # Check first 15 lines for generated code markers
    header = "\n".join(lines[:15]).lower()
    generated_markers = [
        "code generated by",
        "generated by",
        "do not edit",
        "@generated",
        "autogenerated",
        "auto-generated",
        "this file is generated",
        "automatically generated",
        "protobuf"
    ]
    for marker in generated_markers:
        if marker in header:
            return True, f"generated_header ({marker})"

    return False, ""


class FileExclusionEngine:
    def __init__(self, repo_root: str, custom_excludes: Optional[List[str]] = None, respect_gitignore: bool = True):
        self.repo_root = os.path.abspath(repo_root) if repo_root else ""
        self.custom_excludes = custom_excludes or []
        self.respect_gitignore = respect_gitignore
        self.gitignore_spec = self._load_gitignore() if (respect_gitignore and pathspec and self.repo_root) else None

    def _load_gitignore(self) -> Optional[Any]:
        gi_path = os.path.join(self.repo_root, ".gitignore")
        if not os.path.exists(gi_path):
            return None
        try:
            with open(gi_path, "r", encoding="utf-8", errors="ignore") as f:
                lines = [line.strip() for line in f if line.strip() and not line.strip().startswith("#")]
            return pathspec.PathSpec.from_lines("gitwildmatch", lines)
        except Exception:
            return None

    def should_exclude(self, rel_path: str, full_path: Optional[str] = None, check_content: bool = True) -> Tuple[bool, str]:
        """
        Determines whether a file should be excluded from analysis.
        Returns (should_exclude, reason).
        """
        norm = rel_path.replace("\\", "/").lstrip("/")
        parts = norm.split("/")
        filename = parts[-1]
        lower_fn = filename.lower()

        # 1. Directory exclusion
        for part in parts[:-1]:
            if part in DEFAULT_EXCLUDE_DIRS or part.startswith("."):
                return True, f"excluded_directory ({part})"

        # 2. Filename exclusion
        if lower_fn in DEFAULT_EXCLUDE_FILENAMES:
            return True, f"excluded_lockfile ({lower_fn})"

        # 3. Custom user excludes
        for pat in self.custom_excludes:
            clean_pat = pat.strip()
            if clean_pat and (clean_pat in norm or norm.startswith(clean_pat)):
                return True, f"custom_exclude ({clean_pat})"

        # 4. Extension exclusion
        _, ext = os.path.splitext(lower_fn)
        if ext in DEFAULT_EXCLUDE_EXTS:
            return True, f"excluded_extension ({ext})"

        # 5. Gitignore check
        if self.gitignore_spec and self.gitignore_spec.match_file(norm):
            return True, "gitignore"

        # 6. File size & content inspection
        if full_path and os.path.exists(full_path):
            try:
                sz = os.path.getsize(full_path)
                if sz > MAX_FILE_SIZE_BYTES:
                    return True, f"oversized_file ({sz // 1024}KB > {MAX_FILE_SIZE_BYTES // 1024}KB)"

                if check_content and sz > 0:
                    with open(full_path, "r", encoding="utf-8", errors="ignore") as f:
                        sample = f.read(8192)
                    is_gen, gen_reason = is_minified_or_generated(sample, filename)
                    if is_gen:
                        return True, gen_reason
            except Exception:
                pass

        return False, ""
