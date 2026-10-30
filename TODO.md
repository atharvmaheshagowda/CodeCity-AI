# CodeCity AI — Advanced Intelligence & Graphics Extension Master Tracker (`TODO.md`)

## Priority Order: P0 -> P1 -> P2 -> Final Polish

---

### Step 0: Data Preparation & Offline Caches
- [x] Enrich synthetic repo generator (`backend/mining/synthetic_repo.py`) to produce deep 180-day commit histories, real co-change patterns, tests (`tests/test_*.py`), routes, and models for `pallets_flask`, `psf_requests`, and `pallets_click`.
- [x] Precompute and cache full analysis JSON in `backend/data/cached_demos/` so all new capabilities load offline in <50ms.
- [x] Implement graceful degradation ("Not enough history" empty states) for the 7-file reference repo (`atharvmaheshagowda_agenta-workspace`).

---

### Phase 1: Priority P0 Features (Core Impact, Coupling, Contagion, What-If, Smells & Report)
- [x] **A1: Traceback-to-blast-radius**:
  - [x] Backend: `POST /api/traceback` parser for Python stack traces, frame extraction, AST node resolution, and cascade traversal.
  - [x] Frontend: Traceback input panel inside Insights dock, building crash flash (`#ef4444`), staggered ripple animation, and impact summary ("1 crashed, N dependents, X tests at risk").
- [x] **A2: Simulate failure**:
  - [x] Context menu / drawer action to trigger instant failure simulation cascade without needing a traceback.
- [x] **A5: Path explorer**:
  - [x] Backend: `GET /api/path?source=...&target=...` shortest dependency path computation via NetworkX.
  - [x] Frontend: File picker in Insights dock, animated directional route beam highlighting through intermediate nodes.
- [x] **B1: Hidden coupling tunnels**:
  - [x] Backend: `GET /api/coupling` mining co-change from git history (support >= 2, confidence/Jaccard, excluding existing imports and bulk commits > 30 files).
  - [x] Frontend: 3D glowing underground/surface curved tunnels between coupled buildings, toggleable visual layer, ranked pair list with plain-English explanation.
- [x] **B3: Risk contagion**:
  - [x] Backend: `GET /api/contagion` personalized PageRank diffusion ($\alpha=0.85$) along dependency graph.
  - [x] Frontend: "Contagion" color mode pill, spreading heat halo shader, drawer neighbor attribution ("Contributed by X% from dependent Y").
- [x] **B4: Counterfactual what-if**:
  - [x] Backend: `POST /api/whatif` re-running ML model inference with user-adjusted complexity, churn, LOC, and bug fixes.
  - [x] Frontend: Drawer sliders for actionable features, real-time animated morphing of risk gauge, delta SHAP bars, and building height/color.
- [x] **C3: Architecture smells**:
  - [x] Backend: `GET /api/smells` detecting circular dependencies (Tarjan SCC), god files, and orphan files.
  - [x] Frontend: Smells tab in Insights dock, glowing circular dependency arcs, god file beacon, smells visual layer toggle.
- [x] **C4: Report export**:
  - [x] Backend: `GET /api/report` computing 0-100 Code Health Score with documented formula.
  - [x] Frontend: Report viewer tab, offline Markdown export, and print-friendly HTML report (`window.print()`).
- [x] **P0 Verification**:
  - [x] Pytest test suite for P0 endpoints (24/24 passing).
  - [x] Frontend Vitest tests (7/7 passing) and clean build (0 errors).
  - [x] 1920x1080 and 1366x768 screenshots & critique verified.

---

### Phase 2: Priority P1 Features (Breaking Changes, Test Impact, Backtest, Trajectory, Plan, Uncertainty, Timelapse, Diff Risk, Scatter & Model Card)
- [x] **A3: Breaking-change detector**:
  - [x] Backend: `POST /api/breaking-change` AST diffing of function signatures (params, defaults, *args/**kwargs), finding broken call sites across the codebase.
  - [x] Frontend: Breaking change editor in Insights dock, highlighted broken caller list and 3D building beacons.
- [x] **A4: Test-impact view**:
  - [x] Backend: `GET /api/tests/impact` detecting test files (`tests/`, `test_*.py`) and import/call edges.
  - [x] Frontend: Test coverage visual layer, "uncovered danger zones" (high impact, 0 covering tests) marked with amber caution stripes.
- [x] **B2: Backtest trust score**:
  - [x] Backend: Temporal backtest replay at historical cutoffs (T-90d, T-60d, T-30d), precision@10, ROC-AUC, capture rate vs churn baseline.
  - [x] Test: `test_leakage.py` expansion proving strict temporal split with zero future leakage.
  - [x] Frontend: Trust score badge in UI and detailed historical backtest panel in Model Card.
- [x] **B5: Risk trajectory**:
  - [x] Multi-cutoff model evaluation generating historical risk sparkline in file drawer with rapid-rise alert.
- [x] **B6: Review budget planner**:
  - [x] Backend: `POST /api/plan` greedy knapsack optimization (reviewers, hours, effort from LOC & CC) maximizing expected risk reduction.
  - [x] Frontend: Interactive budget planner tab, ordered file checklist, 3D target building highlight, plan export.
- [x] **B7: Uncertainty estimation**:
  - [x] Tree variance / bootstrap spread across forest $\rightarrow \pm$ confidence band in gauge, hazy halo in 3D.
- [x] **C1: Time-lapse visualizer**:
  - [x] Backend: `GET /api/timelapse` monthly repo snapshots.
  - [x] Frontend: Timeline scrub bar with Play/Pause, speed control, growing buildings and flaring bug-fix hotspots.
- [x] **C2: Commit/diff risk checker**:
  - [x] Backend: `POST /api/commit-risk` computing union blast radius, affected tests, and combined probability $1 - \prod (1 - r_i)$.
  - [x] Frontend: Commit selector and unified diff paste box with instant risk evaluation.
- [x] **C5: Hotspot scatter plot**:
  - [x] Interactive Complexity vs Churn SVG scatter plot linked bidirectionally to 3D buildings and camera framing.
- [x] **C6: Model Card upgrades**:
  - [x] Model comparison (RandomForest vs HistGradientBoosting vs Churn), calibration curve, walk-forward backtest, and permutation importances.
- [x] **P1 Verification**:
  - [x] Pytest test suite for P1 endpoints (32/32 passing).
  - [x] Vitest frontend tests and clean build.
  - [x] 1920x1080 and 1366x768 screenshots & critique.

---

### Phase 3: Priority P2 Features (Node Types, Analysis Log, Bus Factor, Repo Comparison, Leaderboard & Command Search)
- [x] **A6: Node types**:
  - [x] Detection of test suites, configs, entrypoints, and DB models $\rightarrow$ in-scene 3D badges with distinct halos and styles.
- [x] **A7: Live analysis log**:
  - [x] Terminal-style streaming log for analysis tasks, AST parsing, and graph operations.
- [x] **B8: Knowledge concentration layer**:
  - [x] File-level dominant contributor percentage ("Bus Factor Risk") color mode and layer without revealing author names.
- [x] **C7: Repo-vs-repo side-by-side comparison**:
  - [x] Dual-repo comparison modal comparing health scores, risk distributions, and architectural metrics.
- [x] **C8: Exhibition leaderboard & demo attract tour**:
  - [x] Continuous 3D orbit, autonomous hotspot tour with 7.5s progress timer, and interactive stepper pills.
- [x] **C9: Rule-based search syntax**:
  - [x] Query rules (`risk:>0.5`, `loc:>100`, `cc:>10`, `ext:py`) in file filter and command palette.
- [x] **P2 Verification**:
  - [x] Pytest test suite (32/32 passing).
  - [x] Vitest frontend unit tests (7/7 passing).
  - [x] Clean frontend production build (`dist/` generated with zero TS errors).
  - [x] Puppeteer full-HD suite (`p2_1` through `p2_5`) captured and visually verified.

---

### Phase 4: Final Polish, Documentation & Verification
- [x] Updated `README.md` with full feature walkthrough and offline commands.
- [x] Authored `DEMO_SCRIPT.md` with a 3-minute presenter guide.
- [x] Documented architectural decisions in `DECISIONS.md`.
