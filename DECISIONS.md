# CodeCity AI — Architectural Decision Log (`DECISIONS.md`)

This log documents key architectural, engineering, and product decisions made during the autonomous expansion of CodeCity AI.

---

### Decision 1: Offline Data Synthesis & Demo Repositories
- **Context**: The existing reference repository (`atharvmaheshagowda_agenta-workspace`) contains 7 files and is designed as a miniature diorama. While ideal for establishing visual 1:1 fidelity with the reference UI, history-based mining (co-change coupling, time-lapse, temporal backtesting) requires rich multi-month commit histories with co-change and test structures.
- **Decision**: Extend `backend/mining/synthetic_repo.py` to generate rich, deterministic Git histories modeled after real architectures (`pallets/flask`, `psf/requests`, `pallets/click`) spanning 180 days with multiple authors, bug-fix commits, test suites (`tests/test_*.py`), web routes, and database models. Precompute full analysis JSON into `backend/data/cached_demos/` so the application runs with sub-50ms offline loading and zero external network requests.
- **Graceful Degradation**: On the 7-file reference repo, features requiring multi-commit history (e.g. Backtest, Hidden Coupling, Trajectory) display a clean, designed "Not Enough History (< 5 commits)" state with an explanation and recommendation to select a multi-month repository.

---

### Decision 2: Spatial UI Integration via Collapsible "Insights" Dock & "Layers" Menu
- **Context**: The master prompt specifies numerous new analytical tools (Traceback, Failure Simulation, Breaking Changes, Test Impact, Path Explorer, Coupling Tunnels, Contagion, Smells, What-If, Budget Planner, Reports). Adding multiple floating windows or sidebars would clutter the 3D viewport.
- **Decision**: 
  1. Introduce a single, sleek collapsible **"Insights" Dock** anchored at the bottom-left/center-bottom with tabs:
     - `Impact`: Traceback analysis, failure simulation, breaking change detector, test impact, and path explorer.
     - `Coupling`: Hidden co-change coupling table with explanations and 3D tunnel layer.
     - `Smells`: Architectural debt, circular dependency SCCs, god files, and orphans.
     - `Time`: Monthly commit-by-commit time-lapse player and commit diff risk checker.
     - `Plan`: Review budget optimizer (knapsack on risk reduction per hour).
     - `Report`: 0–100 Code Health Score, printable HTML / Markdown export.
  2. Introduce a **"Layers" Menu** in the bottom HUD action bar to toggle visual layers in the 3D scene (Coupling Tunnels, Contagion Heat, Architecture Smells, Test Coverage, Uncertainty, Bus-Factor).
  3. Expand the Navbar/HUD Color Mode pills to include `Contagion` and `Bus-Factor`.

---

### Decision 3: 3D Visualization of Advanced Features
- **Coupling Tunnels**: Rendered as glowing curved arches connecting building bases in electric violet (`#c084fc`), distinct from import dependency skybridges.
- **Contagion Diffusion**: Implemented using Personalized PageRank on the reversed dependency graph with damping factor $\alpha=0.85$, spreading heat glow shaders to direct and indirect dependents.
- **Architecture Smells**: Circular dependencies highlighted with looped crimson arcs; God files marked with towering holographic warning beacons; Orphan files subtly dimmed.
- **Test Impact & Danger Zones**: Files covered by tests render with a subtle emerald shield base; high-impact files with zero covering tests display amber hazard hatching.

---

### Decision 4: Deterministic AST & Git Mining (Strict Privacy & Honesty Rules)
- **Privacy Rule Compliance**: Knowledge concentration is computed strictly at the file level ("Dominant Contributor Share", e.g. "Single author wrote 82% of lines"). Individual author names, contributor rankings, and per-person metrics are never surfaced.
- **Honesty Rule Compliance**: All ML numbers and risk probabilities derive from real AST features and Scikit-Learn models. No numbers are hardcoded or fabricated. All metrics carry an "(Estimated)" label.

---

### Decision 5: Performance & 55+ FPS Guarantee
- All 3D layers use `InstancedMesh` with shared procedural geometries and custom GLSL shader uniforms.
- Heavy computations (graph centrality, Tarjan SCCs, PageRank diffusion, co-change mining) are precomputed during analysis and cached in the JSON payload, ensuring 60 FPS rendering in the frontend.

---

### Decision 6: In-Scene Architectural Node-Type Badges (A6)
- **Context**: Users need immediate spatial comprehension of building functions (tests, configs, entrypoints, models) directly in the 3D viewport.
- **Decision**: 
  - Enhance `InSceneBuildingBadges.tsx` to compute archetype classifications (`🧪 Test`, `⚙️ Config`, `🚀 Gateway`, `🏛️ Vault`, `📦 Module`).
  - Maintain the exact reference diorama layout and appearance for `atharvmaheshagowda_agenta-workspace` (100% pixel fidelity with the reference image).
  - For standard and multi-module repositories (Flask, Click, Requests), render distinct architectural badge halos (teal for tests, amber for configs, electric cyan for entrypoints, indigo for data vaults).
  - Clicking any in-scene badge smoothly triggers the Selection Fly-To camera animation and opens the right drawer for deep inspection.

---

### Decision 7: Autonomous Exhibition Attract Tour Engine (C8)
- **Context**: CodeCity AI must operate as an exhibition showpiece during demo rotations or idle terminal periods.
- **Decision**:
  - `PresentationHUD.tsx` and `useCityStore.ts` synchronize `presentationMode` with continuous 3D camera orbital rotation (`autoRotate={true}`).
  - Automatically identifies top 5 defect hotspots in the repository and cycles the camera focus every 7.5 seconds with an interactive countdown progress bar.
  - Displays an architectural narration card detailing why each file is critical (cyclomatic complexity, LOC, recent churn, blast radius reach).
  - Includes interactive step pills `[1] [2] [3]...` allowing presenters to jump directly to any hotspot during live demonstrations.
  - Automatically activates after 45 seconds of user inactivity and exits instantly upon mouse movement, touch, or pressing `P`.

---

### Decision 8: Privacy-Preserving Bus-Factor Concentration Layer (B8)
- **Context**: Software organizations require visibility into single-contributor dependencies without creating harmful employee surveillance or surfacing individual names.
- **Decision**:
  - `git_miner.py` computes `dominant_contributor_share` strictly as the fraction of commits authored by the primary contributor:
    $$\text{Dominant Share} = \frac{\max_{a} \text{commits}(a)}{\sum_{a} \text{commits}(a)}$$
  - In `CityScene.tsx`, when the `busFactor` layer is toggled, modules where `dominant_contributor_share >= 0.80` AND `risk_probability >= 0.50` highlight in a pulsing rose-amber shader (`#fb7185`).
  - In `RightDrawer.tsx`, the Metrics tab displays a progress bar and label: `"Primary contributor authored 88% of revisions across N commits"` with zero personal names or email addresses.

---

### Decision 9: Multi-Tab Drawer Segmentation (Overview, SHAP, Metrics, Dependents, What-If)
- **Context**: The right file drawer was previously rendering an overview card regardless of which sub-tab was selected.
- **Decision**:
  - Fully implement all 5 sub-tabs in `RightDrawer.tsx`:
    1. `Overview`: 100% faithful reproduction of the reference screenshot (Circular Risk Gauge, Impact Bar, LOC, Trajectory Sparkline, High Risk Alert, Explanation, Top SHAP Bars, Covering Tests, Dependents list).
    2. `SHAP`: Complete TreeSHAP breakdown of risk-escalating factors (+SHAP, crimson) and risk-mitigating factors (-SHAP, cyan/blue) with raw values.
    3. `Metrics`: Deep architectural and software engineering metrics (Max/Mean Cyclomatic Complexity, LOC, 90-day & Total Churn, Past Bug Fixes, Fan-In/Fan-Out) and the Privacy-Preserving Bus-Factor card.
    4. `Dependents`: Multi-hop blast radius breakdown (Hop 1, Hop 2, Hop 3) with caller impact scores and 3D focus triggers.
    5. `What-If`: Interactive counterfactual simulator (sliders for LOC, complexity, churn, dependents) with live delta calculation.

---

### Decision 10: Complete Verification Suite & Offline Artifacts
- **Decision**:
  - 32 backend tests (`backend/tests/`) covering AST extraction, blast radius BFS, temporal leakage prevention, P0 APIs, and P1 APIs.
  - 7 frontend vitest unit tests (`frontend/src/tests/`) covering city layout math and Zustand intelligence store actions.
  - Puppeteer automated suites (`capture_p0_suite.js`, `capture_p1_suite.js`, `capture_p2_suite.js`) capturing 15+ comprehensive full-HD screenshots of every view, tab, and modal.
  - 100% self-hosted offline fonts, procedural audio synthesizers, and zero external network calls.

---

### Decision 11: Multi-Language Source Ingestion & Safe Unpacking
- **Context**: CodeCity AI originally required pre-analyzed or synthetic Python repositories. It must now support arbitrary Git repositories, local folders (with or without `.git`), and ZIP uploads.
- **Decision**:
  - `input_sources.py`: Implemented robust ingestion handlers for (1) public git URLs via `git clone --depth 50` with authentication failure detection, (2) local directories, (3) static directories without Git history (setting `is_static_only=True`), and (4) ZIP archives.
  - **Security Hardening**: `extract_zip_safely` enforces strict Zip-Slip protection (resolving paths and verifying `target_dir` containment) and Zip-Bomb mitigation (max 5,000 files, max 250MB extracted size).
  - **Monorepo Detection**: Detects multiple project roots (`package.json`, `go.mod`, `pom.xml`, `Cargo.toml`, etc.) and passes them as `monorepo_roots` to the 3D layout engine to generate distinct top-level district zones.
  - **Graceful Static Degradation**: When analyzing no-git repositories, `is_static_only=True` renders a top banner and disables history-dependent tabs (Coupling, Timelapse, Trajectory, Backtest) with a clear explanation that LOC and AST metrics remain 100% active.

---

### Decision 12: Universal Language Registry & Dynamic File Exclusion Engine
- **Context**: The engine must accurately detect 30+ programming languages by file extension and shebang, classify files by architectural role, and eliminate noise (vendor code, build artifacts, generated files, minified bundles) without hardcoded Python biases.
- **Decision**:
  - `mining/languages.py`: Created an extensible `LanguageRegistry` covering 30+ languages, their extensions, shebangs, visual theme colors, and capability tiers (complexity, graph, ML validation).
  - **Classification**: Every file is tagged as `source`, `test`, `config`, `docs`, or `other`. The default city renders `source` + `test` files, and user can filter by class or specific language via chip pills.
  - **Exclusion Engine**: `FileExclusionEngine` respects `.gitignore` using `pathspec`, skips default directories (`node_modules`, `vendor`, `target`, `dist`, `.venv`, `.git`), ignores minified files (`*.min.js` or lines > 500 chars), generated headers ("DO NOT EDIT", "Generated by"), and files exceeding size thresholds (500KB default).
  - **Transparency**: Users can view default exclusion lists, inspect which files were excluded and why, and supply custom glob patterns via the Exclusion Rules modal.

---

### Decision 13: Backward-Compatible Radon + Lizard + Branching Heuristic Fallback
- **Context**: Python files must maintain exact Radon-style metrics to prevent regression of existing behavior. Other languages require accurate cyclomatic complexity across 30+ syntaxes, with an honest fallback when unsupported.
- **Decision**:
  - `mining/metrics.py`:
    - For Python (`.py`): Retains Python's native AST / Radon complexity engine, producing exact backward-compatible metrics.
    - For 30+ supported languages (JS, TS, Java, Go, Rust, C, C++, PHP, Ruby, Kotlin, C#, Scala, Swift, etc.): Uses `lizard` cyclomatic complexity.
    - For unsupported languages: Uses a keyword branching heuristic (`if`, `else`, `for`, `while`, `catch`, `case`, `&&`, `||`), explicitly setting `is_approximate = True` and displaying an "(approximate)" warning badge in the UI.
  - Universal LOC counter splits lines into code, comment, and blank lines across all languages.

---

### Decision 14: Multi-Language Dependency Graph Resolution with Tree-sitter & Coverage Scoring
- **Context**: Blast radius, contagion, and architectural analysis require an import dependency graph. Different languages use drastically different module and import conventions.
- **Decision**:
  - `graph/multi_lang_graph.py`: Implemented a multi-language parser plugin system with Tree-sitter grammars (cached locally via `tree-sitter-language-pack`):
    - Python: Native AST import visitor (`import x`, `from x import y`).
    - JavaScript / TypeScript: Resolves relative imports (`./`, `../`), index files (`index.ts`, `index.js`), extensions (`.ts`, `.tsx`, `.js`), and `tsconfig.json` path mappings.
    - Go: Reads `go.mod` to resolve module import paths to package directories and source files.
    - Java / Kotlin: Maps package declarations and import namespaces to directory structures.
    - C / C++: Resolves local `#include "..."` relative to source directory and project include paths.
    - Rust: Resolves `mod`, `use crate::...`, and `super::...` within the crate root.
    - Ruby: Resolves `require_relative`.
    - PHP: Resolves `use`, `require`, `include`.
    - C#: Best-effort namespace / `using` mapping.
  - **Graph Coverage Ratio**: Every repository computes `graph_coverage = resolved_edges / detected_import_statements` per language and overall.
  - **Honesty Rule**: When coverage is low (< 35%), the UI renders an "Approximate Dependency Graph" badge and caveats blast radius calculations.

---

### Decision 15: Dual-Model ML Architecture (Core vs Core+Graph) & Empirical Model Card
- **Context**: In Python-only repos, graph features (`fan_in`, `fan_out`) were always available. Across diverse languages and incomplete build setups, graph resolution coverage varies. Training a single model requiring graph features would cause inaccurate predictions on languages with lower graph coverage.
- **Decision**:
  - `ml/features.py` & `ml/train_multilang.py`:
    - Trained a **Core Model** (10 universal features: LOC, Max/Mean Complexity, Commits, 90-Day Churn, Total Churn, Author Count, Age, Days Since Last Change, Past Bug Fixes, File Class).
    - Trained a **Core + Graph Model** (12 features: 10 core + `fan_in` and `fan_out`).
  - **Dual Inference Routing**: At prediction time, if repository graph coverage $\ge 0.35$, the pipeline routes to the Core+Graph model; otherwise, it seamlessly routes to the Core model. The UI transparently states which model was selected and why.
  - **Dynamic Explainer**: `CodeCityExplainer` adjusts its background dataset and feature column names dynamically to match the selected 10-feature or 12-feature model, preventing TreeSHAP feature-dimension mismatches.
  - **Honest Model Card**: `metrics.json` and the Model Card modal include a dedicated **By Language (Multi-Lang)** tab showing empirical ROC-AUC vs Churn Baseline, Precision@10, and validation badges per language.

---

### Decision 16: Large-Repo Performance Guarantee (55+ FPS)
- **Context**: Large multi-language repositories can contain thousands of files, which could degrade Three.js WebGL framerates.
- **Decision**:
  - Implemented an **Impact Focus Mode** filter (`Top 50`, `Top 100`, `Top 250`, or `All Files` by risk/impact score) in the LeftPanel and Zustand store.
  - `cityLayout.ts`: Supports monorepo root grouping, creating clear district boundaries for independent sub-projects.
  - Preserved Eco mode (framerate throttling when idle) and InstancedMesh batching to ensure fluid 55+ FPS performance on large codebases.

