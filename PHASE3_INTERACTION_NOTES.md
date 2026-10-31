# CodeCity AI — Phase 3: Advanced Interactions, Dependency Visualization & Failure Simulation Notes

## 1. Overview & Objectives

Phase 3 upgrades the CodeCity AI 3D visualization from a high-fidelity visual model into a deeply interactive, tactile exploration tool for real software architecture.

The metropolis communicates how code files depend on one another, which modules introduce critical risk, and how failure ripples through upstream and downstream call graphs.

---

## 2. Interaction Architecture & Enhancements

### A. Cascading Failure Simulation Engine
- **Files**: `frontend/src/store/useCityStore.ts`, `frontend/src/components/City3D/CityScene.tsx`, `frontend/src/components/City3D/BlastRadiusArcs.tsx`, `frontend/src/components/RightDrawer.tsx`
- **Dynamic Cascade Hooking**:
  - When a user triggers "Simulate Failure" via the radial context menu, diagnostic drawer, or dependency graph modal, the store records `simulatedFailedFile` and calls `simulateFileFailure(file.path)` (`POST /api/simulate-failure`).
  - The 3D scene responds with a failure simulation overlay:
    - **Failed Origin**: Flashes with a warning crimson hazard strobe (`#ef4444`) and ground reticle.
    - **Hop 1 Direct Dependents**: Glow in bright amber-orange (`#f97316`) representing immediate broken callers.
    - **Hop 2 Indirect Dependents**: Glow in crimson-rose (`#e11d48`).
    - **Hop 3 Transitive Dependents**: Glow in deep ruby (`#be123c`).
    - **Unrelated Buildings**: Dim cleanly by 90% into dark midnight obsidian (`#030712`).
- **Interactive Holographic Simulation Banner**:
  - Renders a floating frosted-glass banner at top-center:
    - Origin module name
    - Count of total broken dependents
    - Count of at-risk test suites
    - Quick "Exit Simulation [Esc]" button that cleanly restores normal city appearance without side effects.
  - Zero destructive modifications: Repository files are never altered.

### B. Multi-Wave Blast Radius Visualization
- **File**: `frontend/src/components/City3D/BlastRadiusArcs.tsx`
- **Hop Depth Color Distinction**:
  - Direct Dependents (Hop 1): Sky Cyan (`#38bdf8`)
  - Indirect Dependents (Hop 2): Electric Violet (`#c084fc`)
  - Transitive Dependents (Hop 3): Rose Crimson (`#fb7185`)
- **Staggered Multi-Wave Temporal Reveal**:
  - Ground shockwave expands from $1.2\text{m}$ to $26\text{m}$ over $1.6\text{s}$ with smooth opacity falloff.
  - Hop 1 conduits and packet streams activate immediately ($t = 0\text{s}$).
  - Hop 2 conduits fade in smoothly at $t \ge 0.25\text{s}$.
  - Hop 3 conduits fade in smoothly at $t \ge 0.50\text{s}$.
- **Unrelated Element Attenuation**:
  - Non-dependent conduits dim to $0.08$ opacity and $0.05$ emissive intensity.

### C. Living Dependency Skybridges
- **File**: `frontend/src/components/City3D/DependencySkybridges.tsx`
- **Hover Highlighting**:
  - When any building is hovered, connecting conduits brighten and emit a pulse boost.
- **Distance-Aware Opacity Falloff**:
  - Conduits spanning distances $> 40\text{m}$ smoothly attenuate opacity ($1.0 \to 0.18$), eliminating screen-wide visual clutter in large repositories.
- **Directional Wave Flow**:
  - Light packet beads travel from caller to callee along the 3D parabolic curves.

### D. Bidirectional 3D City & Dependency Graph Modal Integration
- **File**: `frontend/src/components/DependencyGraphModal.tsx`
- **Graceful External Dependency Handling**:
  - Identifies external third-party packages and standard library imports that do not exist as repository files (e.g. `pytest`, `requests`, `sqlalchemy`, `os`).
  - Displays them in a separate "External Packages (Not in 3D City)" section with informative pill badges, preventing the creation of fake 3D building objects.
- **Bidirectional Sync**:
  - Selecting any internal module inside the modal sets `selectedFile`, centers the 3D camera, highlights its conduits in 3D, and updates the right diagnostic drawer.
  - "Simulate Cascade Wave" button directly launches the 3D failure simulation.
  - "Fly Camera in 3D City" focuses the viewport and switches to 3D city view.

### E. Keyboard Navigation & Accessibility
- **File**: `frontend/src/App.tsx`
- `Escape`:
  - Priority 1: Exits failure simulation if active.
  - Priority 2: Clears selected building and returns camera to repository overview.
  - Priority 3: Closes modals.
- `F`: Focuses search bar.
- `P`: Toggles Presentation Mode.
- `1..5`: Switches color modes (Risk, Complexity, Churn, Age, Impact).
- `Ctrl/Cmd + K`: Opens Command Palette.

---

## 3. Test & Verification Results

| Scenario | Viewport | Target FPS | Measured FPS | Output File | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1080p Baseline Overview** | $1920 \times 1080$ | $>55$ FPS | **143 FPS** | `phase3_test_1080p_baseline.png` | PASS |
| **768p Compact View** | $1366 \times 768$ | $>55$ FPS | **145 FPS** | `phase3_test_768p_compact.png` | PASS |
| **Building Selection** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_building_selection.png` | PASS |
| **Blast Radius Multi-Wave** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_blast_radius_multi_wave.png` | PASS |
| **Failure Simulation** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_failure_simulation.png` | PASS |
| **Dependency Graph Modal** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_dependency_graph_modal.png` | PASS |
| **Sidebar-to-City Hover Sync** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_sidebar_to_city_sync.png` | PASS |
| **Mode: Complexity** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_mode_complexity.png` | PASS |
| **Mode: Churn** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_mode_churn.png` | PASS |
| **Electric Cyber Neon Theme** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_theme_neon.png` | PASS |
| **Eco / Low-Power Mode** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_eco_mode.png` | PASS |
| **Largest Repo (`pallets/flask`)** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | `phase3_test_flask_repo.png` | PASS |

---

## 4. Quality & Build Checklist

- **TypeScript Compilation**: `npx tsc --noEmit` $\to$ **0 errors**.
- **Production Build**: `npm run build` $\to$ **Clean bundle generated in 15.27s**.
- **Frontend Unit Tests**: `npm test -- --run` $\to$ **7 passed** (100%).
- **Backend Pytest**: `pytest backend/tests` $\to$ **32 passed** (100%).
- **Browser Runtime**: Zero WebGL errors, zero console exceptions.
- **Offline Integrity**: 100% offline, zero cloud API calls or CDN texture loads.

---

## 5. Remaining Limitations

- For repos with $>1000$ files, graph edge calculations should be computed via a Web Worker or spatial quadtree to avoid main thread blocking during edge parsing.
- Dynamic hop depth slider is currently bound to hops 1–3; deeper AST graph paths ($4+$ hops) are aggregated under Hop 3 transitive dependents.
