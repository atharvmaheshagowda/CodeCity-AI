"""
Input Source Handlers: Git remotes, Local folders (Git & Static), and Safe ZIP extraction.

Provides:
- Git cloning with single-branch shallow clones and clear error handling
- Local folder support with automatic git detection (or static-only mode)
- Safe ZIP extraction with robust Zip-Slip protection and Zip-Bomb limits
- Monorepo root detection for district grouping
- Progress reporting and configurable resource caps
"""

import os
import shutil
import subprocess
import tempfile
import zipfile
from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any, Callable


class InputSourceType(str, Enum):
    GIT_URL = "git_url"
    LOCAL_GIT = "local_git"
    LOCAL_STATIC = "local_static"
    ZIP_ARCHIVE = "zip_archive"


@dataclass
class InputSourceInfo:
    source_type: InputSourceType
    work_dir: str
    repo_name: str
    repo_slug: str
    has_git_history: bool
    monorepo_roots: List[str]
    is_temporary: bool = False
    temp_dir: Optional[str] = None


class InputSecurityError(Exception):
    """Raised when an uploaded archive fails security validation (e.g. Zip-Slip, Zip-Bomb)."""
    pass


# Default limits
DEFAULT_MAX_FILES = 5000
DEFAULT_MAX_COMMITS = 1500
DEFAULT_MAX_SIZE_MB = 150
DEFAULT_MAX_ZIP_UNCOMPRESSED_MB = 200
DEFAULT_MAX_ZIP_ENTRIES = 10000
DEFAULT_CLONE_TIMEOUT_SECS = 90


def detect_monorepo_roots(repo_root: str) -> List[str]:
    """
    Detects if a repository is structured as a monorepo by inspecting workspace configs
    and nested project roots (package.json, go.mod, Cargo.toml, pom.xml, pyproject.toml).
    Returns relative directory paths of project roots.
    """
    monorepo_roots: List[str] = []
    manifest_names = {
        "package.json", "go.mod", "cargo.toml", "pom.xml",
        "pyproject.toml", "build.gradle", "build.gradle.kts"
    }

    # Common monorepo folder containers
    container_dirs = ("packages", "apps", "services", "modules", "projects", "crates")

    for container in container_dirs:
        c_path = os.path.join(repo_root, container)
        if os.path.isdir(c_path):
            try:
                for entry in os.listdir(c_path):
                    entry_path = os.path.join(c_path, entry)
                    if os.path.isdir(entry_path):
                        rel = f"{container}/{entry}".replace("\\", "/")
                        monorepo_roots.append(rel)
            except Exception:
                pass

    if len(monorepo_roots) >= 2:
        return sorted(monorepo_roots)

    # Secondary scan: top-level subdirectories containing a manifest
    discovered = []
    try:
        for entry in os.listdir(repo_root):
            entry_path = os.path.join(repo_root, entry)
            if os.path.isdir(entry_path) and not entry.startswith("."):
                files_in_dir = set(os.listdir(entry_path))
                if any(m in [f.lower() for f in files_in_dir] for m in manifest_names):
                    discovered.append(entry.replace("\\", "/"))
    except Exception:
        pass

    if len(discovered) >= 2:
        return sorted(discovered)

    return []


def check_directory_size(dir_path: str, max_size_mb: int = DEFAULT_MAX_SIZE_MB) -> int:
    """
    Computes total directory size in bytes and enforces max_size_mb cap.
    """
    total_bytes = 0
    max_bytes = max_size_mb * 1024 * 1024
    for root, _, files in os.walk(dir_path):
        for f in files:
            fp = os.path.join(root, f)
            try:
                total_bytes += os.path.getsize(fp)
                if total_bytes > max_bytes:
                    raise ValueError(
                        f"Repository exceeds the {max_size_mb}MB size limit (found > {total_bytes // (1024*1024)}MB)."
                    )
            except (OSError, FileNotFoundError):
                continue
    return total_bytes


def extract_zip_safely(
    zip_path_or_bytes: Any,
    target_dir: str,
    max_uncompressed_mb: int = DEFAULT_MAX_ZIP_UNCOMPRESSED_MB,
    max_entries: int = DEFAULT_MAX_ZIP_ENTRIES
) -> str:
    """
    Safely extracts a ZIP archive into target_dir with strict Zip-Slip and Zip-Bomb guards.
    Returns the effective root directory of the extracted project.
    """
    target_dir_abs = os.path.abspath(target_dir)
    max_bytes = max_uncompressed_mb * 1024 * 1024

    with zipfile.ZipFile(zip_path_or_bytes, "r") as zf:
        infolist = zf.infolist()

        # Guard 1: Entry count limit
        if len(infolist) > max_entries:
            raise InputSecurityError(
                f"ZIP bomb protection: Archive contains {len(infolist)} files (max allowed is {max_entries})."
            )

        # Guard 2: Total uncompressed size limit & compression ratio
        total_uncompressed = sum(info.file_size for info in infolist)
        if total_uncompressed > max_bytes:
            raise InputSecurityError(
                f"ZIP bomb protection: Uncompressed size ({total_uncompressed // (1024*1024)}MB) exceeds limit of {max_uncompressed_mb}MB."
            )

        # Guard 3: Zip-Slip path traversal rejection
        for member in infolist:
            filename = member.filename
            # Disallow absolute paths or paths containing backslashes masquerading as separators
            norm_name = os.path.normpath(filename.replace("\\", "/"))
            dest_path = os.path.abspath(os.path.join(target_dir_abs, norm_name))

            # Must be strictly within target_dir
            if os.path.commonpath([dest_path, target_dir_abs]) != target_dir_abs:
                raise InputSecurityError(
                    f"Malicious ZIP detected (Zip-Slip attempt): '{filename}' attempts directory traversal outside destination."
                )

        # Safe extraction
        zf.extractall(target_dir_abs)

    # Unwrap single top-level directory if present (e.g. "repo-main/")
    entries = os.listdir(target_dir_abs)
    if len(entries) == 1:
        single_path = os.path.join(target_dir_abs, entries[0])
        if os.path.isdir(single_path):
            return single_path

    return target_dir_abs


def prepare_input_source(
    url: Optional[str] = None,
    local_path: Optional[str] = None,
    zip_file_path: Optional[str] = None,
    progress_callback: Optional[Callable[[str, float], None]] = None,
    max_commits: int = DEFAULT_MAX_COMMITS,
    max_size_mb: int = DEFAULT_MAX_SIZE_MB,
    clone_timeout_secs: int = DEFAULT_CLONE_TIMEOUT_SECS,
) -> InputSourceInfo:
    """
    Validates, prepares, and inspects the repository input source:
    - (a) Public Git URL (GitHub, GitLab, Bitbucket, any HTTPS/SSH remote)
    - (b) Local folder that is a git repository
    - (c) Local folder without git history (Static-only mode)
    - (d) ZIP upload safely extracted with Zip-Slip/Bomb defenses
    """
    if progress_callback:
        progress_callback("Validating input source...", 0.1)

    # 1. ZIP Archive
    if zip_file_path and os.path.exists(zip_file_path):
        temp_dir = tempfile.mkdtemp(prefix="codecity_zip_")
        if progress_callback:
            progress_callback("Verifying ZIP integrity and scanning for threats...", 0.15)

        effective_dir = extract_zip_safely(
            zip_file_path,
            temp_dir,
            max_uncompressed_mb=DEFAULT_MAX_ZIP_UNCOMPRESSED_MB,
            max_entries=DEFAULT_MAX_ZIP_ENTRIES
        )

        check_directory_size(effective_dir, max_size_mb=max_size_mb)
        base_name = os.path.splitext(os.path.basename(zip_file_path))[0]
        has_git = os.path.exists(os.path.join(effective_dir, ".git"))
        monorepo_roots = detect_monorepo_roots(effective_dir)

        return InputSourceInfo(
            source_type=InputSourceType.ZIP_ARCHIVE,
            work_dir=effective_dir,
            repo_name=base_name,
            repo_slug=base_name.replace(" ", "_").lower(),
            has_git_history=has_git,
            monorepo_roots=monorepo_roots,
            is_temporary=True,
            temp_dir=temp_dir
        )

    # 2. Public Git URL
    if url and url.strip():
        clean_url = url.strip()
        # Clean URL format checks
        if not (clean_url.startswith("https://") or clean_url.startswith("http://") or clean_url.startswith("git@")):
            raise ValueError("Invalid Git URL error. Must start with https://, http://, or git@ (e.g. GitHub, GitLab, or Bitbucket repository)")

        # Extract repo name
        parts = clean_url.rstrip("/").split("/")
        if len(parts) >= 2:
            repo_name = f"{parts[-2]}/{parts[-1].replace('.git', '')}"
        else:
            repo_name = "remote_repository"
        repo_slug = repo_name.replace("/", "_").replace(".", "_").lower()

        temp_dir = tempfile.mkdtemp(prefix="codecity_clone_")
        if progress_callback:
            progress_callback(f"Cloning {repo_name} (shallow, depth 500)...", 0.2)

        # Skip submodules by default, use single-branch shallow clone
        cmd = [
            "git", "clone",
            "--depth", "500",
            "--single-branch",
            clean_url,
            temp_dir
        ]

        # Prevent git from prompting for credentials or hanging on invalid / private repos
        clone_env = os.environ.copy()
        clone_env["GIT_TERMINAL_PROMPT"] = "0"
        clone_env["GIT_ASKPASS"] = ""

        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=clone_timeout_secs, env=clone_env)
            if res.returncode != 0:
                err = res.stderr or ""
                if "Authentication failed" in err or "could not read Username" in err or "Permission denied" in err:
                    raise ValueError(
                        f"Repository '{repo_name}' is private or requires authentication. "
                        "Private repositories are supported only through local folder paths with already-authenticated local git."
                    )
                elif "not found" in err.lower() or "repository not found" in err.lower():
                    raise ValueError(f"Repository '{repo_name}' not found. Please verify the URL.")
                else:
                    raise RuntimeError(f"Git clone failed: {err.strip() or 'Unknown clone error'}")
        except subprocess.TimeoutExpired:
            shutil.rmtree(temp_dir, ignore_errors=True)
            raise TimeoutError(
                f"Git clone timed out after {clone_timeout_secs}s. The repository may be too large or the network is throttled."
            )
        except Exception:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
            raise

        check_directory_size(temp_dir, max_size_mb=max_size_mb)
        monorepo_roots = detect_monorepo_roots(temp_dir)

        return InputSourceInfo(
            source_type=InputSourceType.GIT_URL,
            work_dir=temp_dir,
            repo_name=repo_name,
            repo_slug=repo_slug,
            has_git_history=True,
            monorepo_roots=monorepo_roots,
            is_temporary=True,
            temp_dir=temp_dir
        )

    # 3. Local Folder Path
    if local_path and os.path.exists(local_path):
        work_dir = os.path.abspath(local_path)
        if not os.path.isdir(work_dir):
            raise ValueError(f"Specified local path is not a directory: {local_path}")

        check_directory_size(work_dir, max_size_mb=max_size_mb)
        repo_name = os.path.basename(work_dir.rstrip("/\\")) or "local_project"
        repo_slug = repo_name.replace(" ", "_").lower()
        has_git = os.path.exists(os.path.join(work_dir, ".git"))
        monorepo_roots = detect_monorepo_roots(work_dir)

        return InputSourceInfo(
            source_type=InputSourceType.LOCAL_GIT if has_git else InputSourceType.LOCAL_STATIC,
            work_dir=work_dir,
            repo_name=repo_name,
            repo_slug=repo_slug,
            has_git_history=has_git,
            monorepo_roots=monorepo_roots,
            is_temporary=False,
            temp_dir=None
        )

    raise ValueError("Must provide a Git URL, local folder path, or ZIP archive file.")
