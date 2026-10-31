"""
Multi-Language AST Dependency Graph and Import Resolution Engine.

Implements:
- Abstract parser interface: extract_imports(file, code) and resolve_import(ref)
- High-performance Tree-Sitter parsing with robust regex fallbacks
- Resolvers for:
  - JavaScript / TypeScript (relative paths, index files, extension omissions, tsconfig paths)
  - Java / Kotlin (package declarations, wildcards, class to file mapping)
  - Go (go.mod module paths, package directories)
  - C / C++ (local #include "...", include directories)
  - Rust (mod declarations, crate:: and super:: use paths)
  - Ruby (require_relative, lib require)
  - PHP (use namespace, PSR-4 matching, require/include)
  - C# (using directives, namespace to directory matching)
  - Python (existing ASTDependencyParser for 100% backward compatibility)
- Best-effort function-level call linking across languages
- Graph coverage scoring per language and repo-wide
- Confidence badges and approximate labeling
"""

import os
import re
import json
from dataclasses import dataclass, field
from typing import Dict, List, Set, Tuple, Any, Optional
import networkx as nx

try:
    import tree_sitter_language_pack as tslp
except ImportError:
    tslp = None

from graph.dep_graph import normalize_rel_path, ASTDependencyParser, build_module_map, compute_blast_radius, compute_impact_score, compute_graph_metrics
from mining.languages import REGISTRY


@dataclass
class ImportRef:
    source_file: str          # e.g. "src/components/App.tsx"
    raw_path: str             # e.g. "./Button", "com.example.User", "github.com/foo/bar"
    symbols: List[str] = field(default_factory=list)
    is_relative: bool = False
    language: str = "other"


class BaseParser:
    def extract_imports(self, rel_path: str, code: str) -> List[ImportRef]:
        raise NotImplementedError

    def resolve_import(self, ref: ImportRef, all_files: Set[str], repo_root: str, context: Dict[str, Any]) -> Optional[str]:
        raise NotImplementedError

    def extract_functions_and_calls(self, code: str) -> Tuple[Set[str], Set[str]]:
        return set(), set()


# ==============================================================
# JAVASCRIPT / TYPESCRIPT PARSER
# ==============================================================

class JsTsParser(BaseParser):
    IMPORT_RE = re.compile(r"""(?:import\s+(?:(?:[\w*\s{},]+)\s+from\s+)?|export\s+(?:(?:[\w*\s{},]+)\s+from\s+)|require\s*\(\s*)['"]([^'"]+)['"]""")
    FUNC_RE = re.compile(r"""(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_$]+)\s*=>)""")
    CALL_RE = re.compile(r"""\b([a-zA-Z0-9_$]+)\s*\(""")

    def extract_imports(self, rel_path: str, code: str) -> List[ImportRef]:
        imports = []
        is_ts = rel_path.endswith((".ts", ".tsx", ".mts", ".cts"))
        lang_id = "typescript" if is_ts else "javascript"

        # Attempt tree-sitter first
        parsed = False
        if tslp is not None:
            try:
                parser = tslp.get_parser(lang_id)
                tree = parser.parse(code.encode("utf-8", errors="ignore"))
                cursor = tree.walk()

                def visit_node(node):
                    if node.type in ("import_statement", "export_statement"):
                        # Look for string child
                        for child in node.children:
                            if child.type == "string":
                                raw = child.text.decode("utf-8", errors="ignore").strip("'\"`")
                                is_rel = raw.startswith(("./", "../", "/"))
                                imports.append(ImportRef(
                                    source_file=rel_path,
                                    raw_path=raw,
                                    is_relative=is_rel,
                                    language="typescript" if is_ts else "javascript"
                                ))
                    elif node.type == "call_expression":
                        # Check require(...) or import(...)
                        fn_node = node.child_by_field_name("function")
                        if fn_node and fn_node.text.decode("utf-8", errors="ignore") in ("require", "import"):
                            args_node = node.child_by_field_name("arguments")
                            if args_node and args_node.children:
                                for arg in args_node.children:
                                    if arg.type == "string":
                                        raw = arg.text.decode("utf-8", errors="ignore").strip("'\"`")
                                        is_rel = raw.startswith(("./", "../", "/"))
                                        imports.append(ImportRef(
                                            source_file=rel_path,
                                            raw_path=raw,
                                            is_relative=is_rel,
                                            language="typescript" if is_ts else "javascript"
                                        ))
                    for child in node.children:
                        visit_node(child)

                visit_node(tree.root_node)
                parsed = True
            except Exception:
                parsed = False

        if not parsed:
            # Fallback to robust regex
            for m in self.IMPORT_RE.finditer(code):
                raw = m.group(1).strip()
                is_rel = raw.startswith(("./", "../", "/"))
                imports.append(ImportRef(
                    source_file=rel_path,
                    raw_path=raw,
                    is_relative=is_rel,
                    language="typescript" if is_ts else "javascript"
                ))

        return imports

    def resolve_import(self, ref: ImportRef, all_files: Set[str], repo_root: str, context: Dict[str, Any]) -> Optional[str]:
        raw = ref.raw_path
        src_dir = os.path.dirname(ref.source_file).replace("\\", "/")

        candidates = []
        extensions = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".d.ts"]

        if ref.is_relative or raw.startswith(("./", "../")):
            # Relative resolution
            base = os.path.normpath(os.path.join(src_dir, raw)).replace("\\", "/")
            for ext in extensions:
                candidates.append(base + ext)
            for ext in extensions:
                if ext:
                    candidates.append(f"{base}/index{ext}")
        else:
            # Check tsconfig paths if any (e.g. "@/..." -> "src/...")
            ts_paths = context.get("tsconfig_paths", {})
            for alias, target_prefixes in ts_paths.items():
                if alias.endswith("/*") and raw.startswith(alias[:-2]):
                    subpath = raw[len(alias[:-2]):].lstrip("/")
                    for target_prefix in target_prefixes:
                        prefix_clean = target_prefix.replace("/*", "").strip("./")
                        base = f"{prefix_clean}/{subpath}".strip("/") if prefix_clean else subpath
                        for ext in extensions:
                            candidates.append(base + ext)
                        for ext in extensions:
                            if ext:
                                candidates.append(f"{base}/index{ext}")

        for cand in candidates:
            norm_cand = normalize_rel_path(cand)
            if norm_cand in all_files and norm_cand != ref.source_file:
                return norm_cand

        return None

    def extract_functions_and_calls(self, code: str) -> Tuple[Set[str], Set[str]]:
        funcs = set()
        for m in self.FUNC_RE.finditer(code):
            fn = m.group(1) or m.group(2)
            if fn:
                funcs.add(fn)
        calls = set()
        for m in self.CALL_RE.finditer(code):
            calls.add(m.group(1))
        return funcs, calls


# ==============================================================
# JAVA / KOTLIN PARSER
# ==============================================================

class JavaKotlinParser(BaseParser):
    IMPORT_RE = re.compile(r"""^\s*import\s+(?:static\s+)?([a-zA-Z0-9_.*]+);?""", re.MULTILINE)
    PKG_RE = re.compile(r"""^\s*package\s+([a-zA-Z0-9_.]+);?""", re.MULTILINE)
    FUNC_RE = re.compile(r"""(?:public|protected|private|static|\s)+[\w<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*[{;]""")
    CALL_RE = re.compile(r"""\b([a-zA-Z0-9_]+)\s*\(""")

    def extract_imports(self, rel_path: str, code: str) -> List[ImportRef]:
        imports = []
        is_kt = rel_path.endswith((".kt", ".kts"))
        lang_id = "kotlin" if is_kt else "java"

        # Tree-sitter
        parsed = False
        if tslp is not None:
            try:
                parser = tslp.get_parser(lang_id)
                tree = parser.parse(code.encode("utf-8", errors="ignore"))
                for child in tree.root_node.children:
                    if child.type == "import_declaration":
                        text = child.text.decode("utf-8", errors="ignore")
                        m = self.IMPORT_RE.search(text)
                        if m:
                            raw = m.group(1).strip()
                            imports.append(ImportRef(source_file=rel_path, raw_path=raw, language=lang_id))
                parsed = True
            except Exception:
                parsed = False

        if not parsed:
            for m in self.IMPORT_RE.finditer(code):
                raw = m.group(1).strip()
                imports.append(ImportRef(source_file=rel_path, raw_path=raw, language=lang_id))

        return imports

    def resolve_import(self, ref: ImportRef, all_files: Set[str], repo_root: str, context: Dict[str, Any]) -> Optional[str]:
        raw = ref.raw_path
        # Exclude standard library Java packages
        if raw.startswith(("java.", "javax.", "org.junit.", "org.mockito.")):
            return None

        # Build / look up java class map: e.g. "com.example.service.UserService" -> "src/main/java/com/example/service/UserService.java"
        class_map = context.get("java_class_map")
        if class_map is None:
            class_map = {}
            for f in all_files:
                if f.endswith((".java", ".kt")):
                    # Map filename without extension
                    fname_no_ext = os.path.splitext(os.path.basename(f))[0]
                    # Also try full path dot conversion
                    parts = f.replace("\\", "/").split("/")
                    for i in range(len(parts)):
                        cand_mod = ".".join(parts[i:])
                        cand_mod_no_ext = os.path.splitext(cand_mod)[0]
                        class_map[cand_mod_no_ext] = f
                    class_map[fname_no_ext] = f
            context["java_class_map"] = class_map

        # Exact match
        if raw in class_map and class_map[raw] != ref.source_file:
            return class_map[raw]

        # Match class name (last segment)
        last_part = raw.split(".")[-1]
        if last_part != "*" and last_part in class_map and class_map[last_part] != ref.source_file:
            # Check if package prefix matches partially
            matched_f = class_map[last_part]
            raw_pkg = "/".join(raw.split(".")[:-1])
            if raw_pkg in matched_f:
                return matched_f

        return None

    def extract_functions_and_calls(self, code: str) -> Tuple[Set[str], Set[str]]:
        funcs = set()
        for m in self.FUNC_RE.finditer(code):
            funcs.add(m.group(1))
        calls = set()
        for m in self.CALL_RE.finditer(code):
            calls.add(m.group(1))
        return funcs, calls


# ==============================================================
# GO PARSER
# ==============================================================

class GoParser(BaseParser):
    IMPORT_RE = re.compile(r"""(?:import\s*\(\s*([^)]+)\s*\)|import\s+['"]([^'"]+)['"])""")
    FUNC_RE = re.compile(r"""func\s+(?:\([^)]+\)\s+)?([a-zA-Z0-9_]+)\s*\(""")
    CALL_RE = re.compile(r"""\b([a-zA-Z0-9_]+)\s*\(""")

    def extract_imports(self, rel_path: str, code: str) -> List[ImportRef]:
        imports = []
        parsed = False
        if tslp is not None:
            try:
                parser = tslp.get_parser("go")
                tree = parser.parse(code.encode("utf-8", errors="ignore"))
                for child in tree.root_node.children:
                    if child.type == "import_declaration":
                        for sub in child.children:
                            if sub.type == "import_spec":
                                path_node = sub.child_by_field_name("path")
                                if path_node:
                                    raw = path_node.text.decode("utf-8", errors="ignore").strip('"')
                                    imports.append(ImportRef(source_file=rel_path, raw_path=raw, language="go"))
                            elif sub.type == "import_spec_list":
                                for item in sub.children:
                                    if item.type == "import_spec":
                                        path_node = item.child_by_field_name("path")
                                        if path_node:
                                            raw = path_node.text.decode("utf-8", errors="ignore").strip('"')
                                            imports.append(ImportRef(source_file=rel_path, raw_path=raw, language="go"))
                parsed = True
            except Exception:
                parsed = False

        if not parsed:
            # Fallback regex
            for m in re.finditer(r"""['"]([a-zA-Z0-9_./\-]+)['"]""", code):
                raw = m.group(1).strip()
                if "/" in raw or raw.startswith("."):
                    imports.append(ImportRef(source_file=rel_path, raw_path=raw, language="go"))

        return imports

    def resolve_import(self, ref: ImportRef, all_files: Set[str], repo_root: str, context: Dict[str, Any]) -> Optional[str]:
        raw = ref.raw_path
        # Exclude standard library Go packages
        if not "/" in raw and not raw.startswith("."):
            return None

        go_module = context.get("go_module")
        if go_module is None:
            # Attempt to parse go.mod in repo root
            go_mod_path = os.path.join(repo_root, "go.mod")
            if os.path.exists(go_mod_path):
                try:
                    with open(go_mod_path, "r", encoding="utf-8", errors="ignore") as f:
                        for line in f:
                            if line.strip().startswith("module "):
                                go_module = line.strip().split()[1].strip()
                                break
                except Exception:
                    pass
            context["go_module"] = go_module or ""

        # Map package directory to files
        pkg_rel = raw
        if go_module and raw.startswith(go_module):
            pkg_rel = raw[len(go_module):].lstrip("/")

        # Check files inside package directory
        candidates = []
        for f in all_files:
            if f.endswith(".go") and f != ref.source_file:
                dir_part = os.path.dirname(f).replace("\\", "/")
                if dir_part == pkg_rel or dir_part.endswith("/" + pkg_rel):
                    candidates.append(f)

        if candidates:
            # Prefer file with same name as package or return first
            pkg_name = pkg_rel.split("/")[-1]
            for cand in candidates:
                if os.path.basename(cand) == f"{pkg_name}.go":
                    return cand
            return candidates[0]

        return None

    def extract_functions_and_calls(self, code: str) -> Tuple[Set[str], Set[str]]:
        funcs = set()
        for m in self.FUNC_RE.finditer(code):
            funcs.add(m.group(1))
        calls = set()
        for m in self.CALL_RE.finditer(code):
            calls.add(m.group(1))
        return funcs, calls


# ==============================================================
# C / C++ PARSER
# ==============================================================

class CppParser(BaseParser):
    INCLUDE_RE = re.compile(r"""^\s*#\s*include\s*["<]([^">]+)[">]""", re.MULTILINE)
    FUNC_RE = re.compile(r"""(?:[a-zA-Z0-9_:<>&*]+\s+)+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{""")
    CALL_RE = re.compile(r"""\b([a-zA-Z0-9_]+)\s*\(""")

    def extract_imports(self, rel_path: str, code: str) -> List[ImportRef]:
        imports = []
        for m in self.INCLUDE_RE.finditer(code):
            raw = m.group(1).strip()
            # Local include if quoted or contains local path
            is_local = '"' in m.group(0) or not ("<" in m.group(0) and ">" in m.group(0))
            imports.append(ImportRef(
                source_file=rel_path,
                raw_path=raw,
                is_relative=raw.startswith(("./", "../")),
                language="cpp" if rel_path.endswith((".cpp", ".hpp", ".cc", ".hh", ".cxx")) else "c"
            ))
        return imports

    def resolve_import(self, ref: ImportRef, all_files: Set[str], repo_root: str, context: Dict[str, Any]) -> Optional[str]:
        raw = ref.raw_path
        src_dir = os.path.dirname(ref.source_file).replace("\\", "/")

        # 1. Relative to source directory
        cand1 = normalize_rel_path(os.path.normpath(os.path.join(src_dir, raw)))
        if cand1 in all_files and cand1 != ref.source_file:
            return cand1

        # 2. Check include/ or src/ directories
        for f in all_files:
            if f.endswith((".h", ".hpp", ".hh", ".hxx", ".c", ".cpp")) and f != ref.source_file:
                if f == raw or f.endswith("/" + raw) or os.path.basename(f) == raw:
                    return f

        return None

    def extract_functions_and_calls(self, code: str) -> Tuple[Set[str], Set[str]]:
        funcs = set()
        for m in self.FUNC_RE.finditer(code):
            funcs.add(m.group(1))
        calls = set()
        for m in self.CALL_RE.finditer(code):
            calls.add(m.group(1))
        return funcs, calls


# ==============================================================
# RUST PARSER
# ==============================================================

class RustParser(BaseParser):
    MOD_RE = re.compile(r"""^\s*(?:pub\s+)?mod\s+([a-zA-Z0-9_]+)\s*;""", re.MULTILINE)
    USE_RE = re.compile(r"""^\s*(?:pub\s+)?use\s+([a-zA-Z0-9_:]+);?""", re.MULTILINE)
    FUNC_RE = re.compile(r"""fn\s+([a-zA-Z0-9_]+)\s*\(""")
    CALL_RE = re.compile(r"""\b([a-zA-Z0-9_]+)\s*\(""")

    def extract_imports(self, rel_path: str, code: str) -> List[ImportRef]:
        imports = []
        for m in self.MOD_RE.finditer(code):
            imports.append(ImportRef(source_file=rel_path, raw_path=f"mod::{m.group(1)}", language="rust"))
        for m in self.USE_RE.finditer(code):
            raw = m.group(1).strip()
            if raw.startswith(("crate::", "super::", "self::")):
                imports.append(ImportRef(source_file=rel_path, raw_path=raw, is_relative=not raw.startswith("crate::"), language="rust"))
        return imports

    def resolve_import(self, ref: ImportRef, all_files: Set[str], repo_root: str, context: Dict[str, Any]) -> Optional[str]:
        raw = ref.raw_path
        src_dir = os.path.dirname(ref.source_file).replace("\\", "/")

        if raw.startswith("mod::"):
            mod_name = raw[5:]
            cands = [
                normalize_rel_path(os.path.join(src_dir, f"{mod_name}.rs")),
                normalize_rel_path(os.path.join(src_dir, mod_name, "mod.rs"))
            ]
            for c in cands:
                if c in all_files and c != ref.source_file:
                    return c

        if raw.startswith("crate::"):
            mod_path = raw[7:].replace("::", "/")
            parts = mod_path.split("/")
            # Check src/parts...
            cands = [
                f"src/{mod_path}.rs",
                f"src/{mod_path}/mod.rs",
                f"src/{parts[0]}.rs",
                f"src/{parts[0]}/mod.rs",
            ]
            for c in cands:
                norm_c = normalize_rel_path(c)
                if norm_c in all_files and norm_c != ref.source_file:
                    return norm_c

        return None

    def extract_functions_and_calls(self, code: str) -> Tuple[Set[str], Set[str]]:
        funcs = set()
        for m in self.FUNC_RE.finditer(code):
            funcs.add(m.group(1))
        calls = set()
        for m in self.CALL_RE.finditer(code):
            calls.add(m.group(1))
        return funcs, calls


# ==============================================================
# RUBY PARSER
# ==============================================================

class RubyParser(BaseParser):
    REQ_RE = re.compile(r"""(?:require_relative|require)\s+['"]([^'"]+)['"]""")
    FUNC_RE = re.compile(r"""def\s+([a-zA-Z0-9_!?]+)""")
    CALL_RE = re.compile(r"""\b([a-zA-Z0-9_!?]+)\s*\(""")

    def extract_imports(self, rel_path: str, code: str) -> List[ImportRef]:
        imports = []
        for m in self.REQ_RE.finditer(code):
            raw = m.group(1).strip()
            is_rel = "require_relative" in m.group(0) or raw.startswith(("./", "../"))
            imports.append(ImportRef(source_file=rel_path, raw_path=raw, is_relative=is_rel, language="ruby"))
        return imports

    def resolve_import(self, ref: ImportRef, all_files: Set[str], repo_root: str, context: Dict[str, Any]) -> Optional[str]:
        raw = ref.raw_path
        src_dir = os.path.dirname(ref.source_file).replace("\\", "/")

        cands = [
            normalize_rel_path(os.path.normpath(os.path.join(src_dir, f"{raw}.rb"))),
            normalize_rel_path(os.path.normpath(os.path.join(src_dir, raw))),
            normalize_rel_path(f"lib/{raw}.rb"),
            normalize_rel_path(f"app/{raw}.rb"),
        ]
        for c in cands:
            if c in all_files and c != ref.source_file:
                return c

        return None

    def extract_functions_and_calls(self, code: str) -> Tuple[Set[str], Set[str]]:
        funcs = set()
        for m in self.FUNC_RE.finditer(code):
            funcs.add(m.group(1))
        calls = set()
        for m in self.CALL_RE.finditer(code):
            calls.add(m.group(1))
        return funcs, calls


# ==============================================================
# PHP PARSER
# ==============================================================

class PhpParser(BaseParser):
    USE_RE = re.compile(r"""^\s*use\s+([a-zA-Z0-9_\\]+);""", re.MULTILINE)
    REQ_RE = re.compile(r"""(?:require|require_once|include|include_once)\s*\(?\s*['"]([^'"]+)['"]""")
    FUNC_RE = re.compile(r"""function\s+([a-zA-Z0-9_]+)\s*\(""")
    CALL_RE = re.compile(r"""\b([a-zA-Z0-9_]+)\s*\(""")

    def extract_imports(self, rel_path: str, code: str) -> List[ImportRef]:
        imports = []
        for m in self.USE_RE.finditer(code):
            raw = m.group(1).strip().lstrip("\\")
            imports.append(ImportRef(source_file=rel_path, raw_path=raw, language="php"))
        for m in self.REQ_RE.finditer(code):
            raw = m.group(1).strip()
            imports.append(ImportRef(source_file=rel_path, raw_path=raw, is_relative=True, language="php"))
        return imports

    def resolve_import(self, ref: ImportRef, all_files: Set[str], repo_root: str, context: Dict[str, Any]) -> Optional[str]:
        raw = ref.raw_path
        src_dir = os.path.dirname(ref.source_file).replace("\\", "/")

        if ref.is_relative:
            cands = [
                normalize_rel_path(os.path.normpath(os.path.join(src_dir, raw))),
                normalize_rel_path(os.path.normpath(os.path.join(src_dir, f"{raw}.php")))
            ]
            for c in cands:
                if c in all_files and c != ref.source_file:
                    return c
        else:
            # PSR-4 namespace resolution
            path_conv = raw.replace("\\", "/")
            cands = [
                f"src/{path_conv}.php",
                f"app/{path_conv}.php",
                f"{path_conv}.php",
            ]
            for c in cands:
                norm_c = normalize_rel_path(c)
                if norm_c in all_files and norm_c != ref.source_file:
                    return norm_c

        return None

    def extract_functions_and_calls(self, code: str) -> Tuple[Set[str], Set[str]]:
        funcs = set()
        for m in self.FUNC_RE.finditer(code):
            funcs.add(m.group(1))
        calls = set()
        for m in self.CALL_RE.finditer(code):
            calls.add(m.group(1))
        return funcs, calls


# ==============================================================
# C# PARSER
# ==============================================================

class CSharpParser(BaseParser):
    USING_RE = re.compile(r"""^\s*using\s+(?:static\s+)?([a-zA-Z0-9_.]+);""", re.MULTILINE)
    FUNC_RE = re.compile(r"""(?:public|protected|private|internal|static|\s)+[a-zA-Z0-9_<>[\]]+\s+([a-zA-Z0-9_]+)\s*\(""")
    CALL_RE = re.compile(r"""\b([a-zA-Z0-9_]+)\s*\(""")

    def extract_imports(self, rel_path: str, code: str) -> List[ImportRef]:
        imports = []
        for m in self.USING_RE.finditer(code):
            raw = m.group(1).strip()
            # Ignore System namespaces
            if not raw.startswith(("System", "Microsoft")):
                imports.append(ImportRef(source_file=rel_path, raw_path=raw, language="csharp"))
        return imports

    def resolve_import(self, ref: ImportRef, all_files: Set[str], repo_root: str, context: Dict[str, Any]) -> Optional[str]:
        raw = ref.raw_path
        # Best effort namespace to folder or class matching
        last = raw.split(".")[-1]
        for f in all_files:
            if f.endswith(".cs") and f != ref.source_file:
                if os.path.basename(f) == f"{last}.cs":
                    return f
                dir_conv = raw.replace(".", "/")
                if dir_conv in f:
                    return f
        return None

    def extract_functions_and_calls(self, code: str) -> Tuple[Set[str], Set[str]]:
        funcs = set()
        for m in self.FUNC_RE.finditer(code):
            funcs.add(m.group(1))
        calls = set()
        for m in self.CALL_RE.finditer(code):
            calls.add(m.group(1))
        return funcs, calls


# Parser Registry
PARSERS: Dict[str, BaseParser] = {
    "javascript": JsTsParser(),
    "typescript": JsTsParser(),
    "java": JavaKotlinParser(),
    "kotlin": JavaKotlinParser(),
    "go": GoParser(),
    "c": CppParser(),
    "cpp": CppParser(),
    "rust": RustParser(),
    "ruby": RubyParser(),
    "php": PhpParser(),
    "csharp": CSharpParser(),
}


def load_tsconfig_paths(repo_root: str) -> Dict[str, List[str]]:
    """
    Parses tsconfig.json or jsconfig.json to extract compilerOptions.paths and baseUrl.
    """
    for config_name in ("tsconfig.json", "jsconfig.json"):
        p = os.path.join(repo_root, config_name)
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    # Strip comments
                    content_clean = re.sub(r"//.*$", "", content, flags=re.MULTILINE)
                    data = json.loads(content_clean)
                    paths = data.get("compilerOptions", {}).get("paths", {})
                    base_url = data.get("compilerOptions", {}).get("baseUrl", "")
                    normalized_paths = {}
                    for k, v in paths.items():
                        if isinstance(v, list):
                            normalized_paths[k] = [
                                os.path.join(base_url, item).replace("\\", "/") if base_url else item
                                for item in v
                            ]
                    if normalized_paths:
                        return normalized_paths
            except Exception:
                pass
    return {}


def build_multi_language_dependency_graph(
    repo_path: str,
    all_files: Optional[List[str]] = None
) -> Tuple[nx.DiGraph, Dict[str, Any]]:
    """
    Constructs a cross-language NetworkX DiGraph.
    Edge convention:
      A -> B represents that file A depends on file B (A imports or calls B).
      Therefore, when B changes or breaks, A is affected (reverse BFS = blast radius).

    Returns (Graph, CoverageReport) where CoverageReport contains:
      - per_language: {lang: {"detected": int, "resolved": int, "coverage": float, "confidence": str}}
      - overall_coverage: float (0.0 to 1.0)
      - confidence: "High" | "Moderate" | "Low" | "Unsupported"
    """
    G = nx.DiGraph()

    if all_files is None:
        all_files = []
        for root, _, files in os.walk(repo_path):
            for f in files:
                full = os.path.join(root, f)
                rel = normalize_rel_path(os.path.relpath(full, repo_path))
                all_files.append(rel)

    clean_files = [normalize_rel_path(f) for f in all_files]
    file_set = set(clean_files)

    for f in clean_files:
        G.add_node(f)

    # Context shared across resolutions
    context = {
        "tsconfig_paths": load_tsconfig_paths(repo_path)
    }

    # Separate Python files for existing ASTDependencyParser (100% backward compatibility)
    py_files = [f for f in clean_files if f.endswith((".py", ".pyi"))]
    if py_files:
        mod_to_file = build_module_map(py_files)
        py_defined_funcs: Dict[str, Set[str]] = {}
        py_called_funcs: Dict[str, Set[str]] = {}
        for rel_f in py_files:
            full_p = os.path.join(repo_path, rel_f)
            if not os.path.exists(full_p):
                continue
            try:
                import ast
                with open(full_p, "r", encoding="utf-8", errors="ignore") as fp:
                    code = fp.read()
                    tree = ast.parse(code, filename=rel_f)
                parser = ASTDependencyParser(rel_f, set(py_files), mod_to_file)
                parser.visit(tree)
                py_defined_funcs[rel_f] = parser.defined_functions
                py_called_funcs[rel_f] = parser.called_functions
                for imported_f in parser.imported_files:
                    if imported_f in file_set and imported_f != rel_f:
                        G.add_edge(rel_f, imported_f, edge_type="import")
            except Exception:
                continue

        for u, v, data in list(G.edges(data=True)):
            if u in py_files and v in py_files:
                common_calls = py_defined_funcs.get(v, set()).intersection(py_called_funcs.get(u, set()))
                if common_calls:
                    data["edge_type"] = "import+call"
                    data["calls"] = list(common_calls)

    # Coverage tracking
    stats_by_lang: Dict[str, Dict[str, int]] = {}
    file_defined_funcs: Dict[str, Set[str]] = {}
    file_called_funcs: Dict[str, Set[str]] = {}

    # Python coverage metrics
    if py_files:
        py_detected = len(py_files)  # proxy
        py_resolved = sum(1 for u, v in G.edges() if u in py_files)
        stats_by_lang["python"] = {
            "detected": max(py_detected, py_resolved),
            "resolved": py_resolved
        }

    # Process all non-python files via language-specific parsers
    for rel_f in clean_files:
        if rel_f.endswith((".py", ".pyi")):
            continue

        lang = REGISTRY.detect_language(rel_f)
        parser = PARSERS.get(lang)
        if not parser:
            # Unsupported language: gets no edges, and that is recorded
            continue

        full_p = os.path.join(repo_path, rel_f)
        if not os.path.exists(full_p):
            continue

        try:
            with open(full_p, "r", encoding="utf-8", errors="ignore") as fp:
                code = fp.read()

            imports = parser.extract_imports(rel_f, code)
            funcs, calls = parser.extract_functions_and_calls(code)
            file_defined_funcs[rel_f] = funcs
            file_called_funcs[rel_f] = calls

            if lang not in stats_by_lang:
                stats_by_lang[lang] = {"detected": 0, "resolved": 0}

            stats_by_lang[lang]["detected"] += len(imports)

            for imp in imports:
                target_f = parser.resolve_import(imp, file_set, repo_path, context)
                if target_f and target_f in file_set and target_f != rel_f:
                    stats_by_lang[lang]["resolved"] += 1
                    G.add_edge(rel_f, target_f, edge_type="import")
        except Exception:
            continue

    # Second pass: cross-file function call linking for non-Python
    for u, v, data in list(G.edges(data=True)):
        if data.get("edge_type") == "import":
            v_funcs = file_defined_funcs.get(v, set())
            u_calls = file_called_funcs.get(u, set())
            common = v_funcs.intersection(u_calls)
            if common:
                data["edge_type"] = "import+call"
                data["calls"] = list(common)

    # Compute coverage reports
    total_detected = sum(s["detected"] for s in stats_by_lang.values())
    total_resolved = sum(s["resolved"] for s in stats_by_lang.values())
    overall_coverage = round(total_resolved / total_detected, 3) if total_detected > 0 else (1.0 if clean_files else 0.0)

    if overall_coverage >= 0.70:
        overall_conf = "High"
    elif overall_coverage >= 0.40:
        overall_conf = "Moderate"
    elif overall_coverage > 0.0:
        overall_conf = "Low"
    else:
        overall_conf = "Unsupported"

    coverage_per_lang = {}
    for lang, s in stats_by_lang.items():
        det = s["detected"]
        res = s["resolved"]
        ratio = round(res / det, 3) if det > 0 else 1.0
        conf = "High" if ratio >= 0.70 else ("Moderate" if ratio >= 0.40 else ("Low" if ratio > 0 else "Unsupported"))
        coverage_per_lang[lang] = {
            "detected_imports": det,
            "resolved_edges": res,
            "coverage_ratio": ratio,
            "confidence": conf
        }

    coverage_report = {
        "overall_coverage": overall_coverage,
        "overall_confidence": overall_conf,
        "total_detected_imports": total_detected,
        "total_resolved_edges": total_resolved,
        "per_language": coverage_per_lang
    }

    return G, coverage_report
