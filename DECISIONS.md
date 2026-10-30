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
