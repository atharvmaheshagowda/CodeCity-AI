# CodeCity AI — Multi-Language Extension Master Tracker (`TODO.md`)

## Loop Protocol Milestones

---

### Milestone 1: Input Sources & File Filtering
- [x] Implement `backend/mining/languages.py`:
  - [x] Language registry (extension + shebang detection for 30+ languages, capabilities mapping)
  - [x] File classifier (`source`, `test`, `config`, `docs`, `other`)
  - [x] Exclusion engine (defaults: `.git`, `node_modules`, `vendor`, `dist`, `build`, `target`, `out`, `.venv`, `__pycache__`, `coverage`, `.next`, `.idea`, binary/image/font extensions, lockfiles, minified files, generated code headers, max file size)
  - [x] `.gitignore` parsing via `pathspec`
- [x] Implement `backend/mining/input_sources.py`:
  - [x] Support public git URLs (GitHub, GitLab, Bitbucket, any HTTPS/SSH remote) with shallow clone & error handling
  - [x] Support local folders with git history
  - [x] Support local folders WITHOUT git history (Static-only mode: LOC, complexity, graph; history features disabled)
  - [x] Support ZIP upload (`POST /api/upload-zip` and analyze flow) with Zip-Slip path traversal protection and Zip-Bomb size/entry limits
  - [x] Monorepo detection (multiple project roots: `package.json`, `go.mod`, `pom.xml`, `Cargo.toml`, `pyproject.toml`, `packages/*`, `apps/*`, etc.)
  - [x] Configurable caps (`max_files`, `max_commits`, `max_size_mb`) and progress streaming updates

---

### Milestone 2: Language-Agnostic Metrics Engine
- [x] Implement `backend/mining/metrics.py`:
  - [x] Generic line-of-code counter (code, comment, blank split for all languages)
  - [x] Cyclomatic complexity engine:
    - [x] Radon for Python (100% backward-compatible, identical metrics)
    - [x] Lizard for 30+ languages (JS, TS, Java, Go, Rust, Ruby, PHP, C, C++, C#, Kotlin, Swift, etc.)
    - [x] Keyword branching heuristic fallback for unsupported languages (marked as "approximate")
  - [x] Unit tests verifying complexity and LOC across Python, JS, TS, Java, Go, Rust, C/C++

---

### Milestone 3: Multi-Language Dependency Graph
- [x] Implement `backend/graph/multi_lang_graph.py`:
  - [x] Parser plugin interface: `extract_imports(file)` and `resolve_import(ref)`
  - [x] JavaScript / TypeScript resolver (relative imports, `require`, index files, extensions, `tsconfig.json` paths)
  - [x] Java / Kotlin resolver (package + import -> file)
  - [x] Go resolver (`go.mod` module path, package directory mapping)
  - [x] C / C++ resolver (local `#include "..."` with include directory resolution)
  - [x] Rust resolver (`mod`, `use crate::...`, `super::...`)
  - [x] Ruby resolver (`require_relative`, `require`)
  - [x] PHP resolver (`use`, `require`, `include`)
  - [x] C# resolver (namespace / `using` best-effort resolution)
  - [x] Python resolver (uses existing `ASTDependencyParser` preserving 100% behavior)
  - [x] Best-effort function-level call linking where feasible
  - [x] Graph coverage score calculation (`resolved_edges / detected_imports` per language and repo-wide)
  - [x] Confidence badge computation and blast radius "approximate" labeling for low coverage

---

### Milestone 4: History Mining Hardening
- [x] Update `backend/mining/git_miner.py`:
  - [x] Commit cap and time window enforcement
  - [x] Git rename tracking (`follow_renames`)
  - [x] Skip merge commits for churn calculation
  - [x] Skip bulk/format/vendor commits (> 30 files touched)
  - [x] Bound maximum diffs to prevent memory spikes (10,000 line cap)
  - [x] Multilingual bug-fix regex (`fix`, `bug`, `error`, `corrige`, `fallo`, `fehle`, `behebe`, `баг`, `исправ`, issue references `#\d+`)
  - [x] Multi-language file extraction at HEAD and historical cutoffs
  - [x] Fast incremental caching for re-analysis

---

### Milestone 5: Multi-Language Model Training & Inference
- [x] Update `backend/ml/features.py`:
  - [x] Core feature set (10 features available across all languages)
  - [x] Graph feature set (fan-in, fan-out)
- [x] Create `scripts/train_multilang.py`:
  - [x] Multi-language corpus training pipeline (JS, TS, Java, Go, Rust, Ruby, PHP, C/C++, Python)
  - [x] Strict temporal splits within repos, held-out evaluation repos
  - [x] Train `core_model` and `core_graph_model`
  - [x] Dual-model inference: use `core_graph_model` when graph coverage >= 0.35, else `core_model`
  - [x] Compute per-language ROC-AUC, precision@10, recall@top 10% vs churn baseline
  - [x] Save models and update `backend/data/metrics.json` with per-language metrics
  - [x] Add multi-language temporal leakage test in `backend/tests/test_multilang_leakage.py`

---

### Milestone 6: UI & 3D Visualizer Updates
- [x] Frontend input & source selection:
  - [x] Accept any Git URL, local path, or Drag-and-Drop ZIP upload
  - [x] Source-type indicator badges (Git URL, Local Folder, ZIP, Static Mode)
  - [x] Caps configuration and exclusion rules editor modal
- [x] Language & File-Class filtering:
  - [x] Language chips with file counts and capability badges
  - [x] "Capabilities" modal per language (Complexity: yes/approx/no, Graph: yes/partial/no, Model: validated/unvalidated)
  - [x] File-class filter pills (`All`, `Source`, `Tests`, `Config`, `Docs`)
  - [x] Analysis summary card (languages found, analyzed vs skipped, graph coverage, model used)
- [x] Static-only mode degradation:
  - [x] Warning banner and graceful disablement of history layers (coupling, timelapse, trajectory, backtest)
- [x] Model Card "By Language" tab:
  - [x] Per-language performance table vs Churn baseline, accuracy badges
- [x] Large repo performance:
  - [x] "Top N files by impact" focus mode (50, 100, 250, All)
  - [x] Level-of-detail and district aggregation blocks maintaining 55+ FPS

---

### Milestone 7: Tests & Verification
- [x] Backend test suite:
  - [x] Unit tests for language detection, classification, and exclusions
  - [x] Unit tests for multi-language metrics (Radon + Lizard + Heuristics)
  - [x] Unit tests for multi-language graph resolvers (JS, TS, Java, Go, Rust, Ruby, PHP, C, Python)
  - [x] Unit tests for static-only mode and ZIP upload / Zip-Slip rejection
  - [x] Leakage tests for multi-language training pipeline
  - [x] End-to-end integration tests analyzing fixture repos across languages
  - [x] Verify all 60 tests pass (100% passing)
- [x] Frontend test suite:
  - [x] Vitest unit tests for language filtering, capabilities, and file classes (13/13 passing)
  - [x] Clean TypeScript compilation (`tsc -b`) and production build

---

### Milestone 8: Cached Demos, Documentation & Verification
- [x] Generate rich multi-language cached demos in `backend/data/cached_demos/`:
  - [x] Python: `pallets_flask`, `psf_requests`, `pallets_click`, `agenta-workspace`
  - [x] JavaScript: `expressjs_express`
  - [x] TypeScript: `colinhacks_zod`
  - [x] Java: `google_gson`
  - [x] Go: `spf13_cobra`
  - [x] C/C++: `c_engine`
- [x] Run application, verify offline guarantee (0 runtime external network requests)
- [x] Capture browser screenshots at 1920x1080 and 1366x768 across multi-language workflows
- [x] Update `DECISIONS.md`, `README.md`, `DEMO_SCRIPT.md`

