# CodeCity AI — Miniature Cyber-Metropolis Software Intelligence Platform

> **"See where your code will break next, and what breaks with it."**

CodeCity AI transforms any Python Git repository into an interactive, cinematic 3D cyber-metropolis. Machine learning models trained on temporal commit history predict which files will experience defects next, while abstract syntax tree (AST) dependency analysis visualizes the **blast radius**—illuminating exactly which upstream callers and importing modules will break if a risky file fails.

---

## 🌆 Visual Architecture & Cyber-Metropolis Redesign

The application visual engine is engineered as a miniature futuristic smart diorama matching the reference design:

1. **10 Procedural Architectural Archetypes** (via compound `BufferGeometry` and single-draw `InstancedMesh`):
   - **`glass_skyscraper`**: Slender tower with ground lobby, stepped setbacks, and roof penthouse.
   - **`corporate_tower`**: 3-tier stepped setbacks with HVAC mechanical chiller boxes.
   - **`stepped_industrial`**: Stepped terraces, cooling towers, ventilation housings, exterior pilasters.
   - **`datacenter`**: Armored monolith with vertical heat-sink louvers and 4-fan chiller array.
   - **`research_facility`**: Central tower with cantilevered laboratory pods and observation dome.
   - **`compact_residential`**: Staggered high-density block with rooftop elevator bulkhead.
   - **`brutalist_tech`**: Heavy reinforced pilasters, recessed horizontal window slits, cantilevered overhanging floors.
   - **`multisection_complex`**: Twin-tower connected structure with luminous skybridge conduits.
   - **`telecom_spire`**: Podium base, slender communications mast with microwave transmission dishes.
   - **`monumental_landmark`**: Monumental stepped skyscraper with crown deck and vertical cyan light beam.

2. **In-Scene 3D Billboard Badges & Archetype Halos**:
   - Small in-scene billboard pins floating directly above building roofs with vertical connecting stems.
   - **`seed_db.py` Hero Skyscraper**: Vibrant neon rose-red border with warning beacon (`91% Defect Risk`).
   - Archetype-specific color encoding:
     - **🧪 Test Suites**: Industrial gray-cyan / teal border (`border-teal-400/80`).
     - **⚙️ Configs & Settings**: Fortified dark-gold / amber border (`border-amber-400/80`).
     - **🚀 Entrypoints (`app.py`, `main.py`)**: Tall spires with electric cyan halo (`border-cyan-300`).
     - **🏛️ Data Vaults (`models.py`, `schemas.py`)**: Blue-violet data sanctuaries (`border-indigo-400/80`).

3. **Living Urban Environment**:
   - **Glossy Wet Asphalt**: Obsidian terrain (`#01040a`, roughness 0.16, metalness 0.92) with distance-fading cyan coordinate grid.
   - **Environmental Details**: Miniature streetlights with cantilever arms casting soft cyan light pools onto the asphalt, electrical transformer cabinets with status indicator LEDs, and perimeter sensor masts.
   - **Frosted District Plates**: Elevated frosted-glass platforms with luminous borders and billboarded labels floating with 3.5m+ clearance above building crowns.
   - **Atmospheric Depth**: Exponential fog, distant megalopolis context skyline silhouettes, glowing drifting dust/firefly particles, and volumetric searchlights.

4. **Kinetic Camera & Blast Radius**:
   - **Elevated Isometric Vantage**: Perspective diorama framing (narrow FOV 34°, position `[46, 52, 46]`) with damped inertial orbit controls and smooth fly-to focusing.
   - **Blast Radius Shockwave**: Parabolic cyan energy arcs leap between connected buildings, with animated high-speed data pulses traveling along dependency skybridges.
   - **Unrelated Module Dimming**: Contextually dims non-dependent files into the deep midnight void during file inspection.

---

## ⚡ Comprehensive Intelligence Suite

### P0 Intelligence Layers
- **Traceback-to-Blast-Radius (`POST /api/traceback`)**: Paste any Python stack trace; the system resolves the crashed frame, flashes the building red, and cascades ripples through dependent modules.
- **Instant Failure Simulation (`POST /api/simulate-failure`)**: Context menu action to trigger an immediate failure cascade without needing a traceback.
- **Path Explorer (`GET /api/path`)**: Directional energy beam tracing the shortest dependency route between source and target files.
- **Hidden Coupling Tunnels (`GET /api/coupling`)**: Mines Git commit co-change patterns to reveal covert dependencies lacking explicit AST imports.
- **Risk Contagion Diffusion (`GET /api/contagion`)**: Personalized PageRank diffusion ($\alpha=0.85$) simulating failure probability spread.
- **Counterfactual What-If Simulator (`POST /api/whatif`)**: Interactive sliders in the file drawer to test refactoring impact on defect probability.
- **Architecture Smells (`GET /api/smells`)**: Detects circular dependency SCCs (Tarjan algorithm), god files, and orphan files.
- **Report & Code Health Score (`GET /api/report`)**: Computes a 0–100 Code Health Score with printable HTML / Markdown export.

### P1 Advanced Analytical Tools
- **Breaking-Change Signature Tester (`POST /api/breaking-change`)**: AST diffing of function signatures; identifies all broken callers and strobes them in orange (`#f97316`).
- **Test-Impact & Danger Zones (`GET /api/tests/impact`)**: Maps AST test imports to source files and highlights uncovered danger zones (risk $\ge 0.70$, 0 tests).
- **Temporal Walk-Forward Backtesting (`GET /api/backtest`)**: Replays evaluations at T-90d, T-60d, T-30d with precision@10 comparison vs naive baselines, computing an 88.5/100 Trust Score.
- **Risk Trajectory Sparklines (`GET /api/trajectories`)**: 4-point historical risk sparkline with `RAPID RISE` alerts.
- **Knapsack Review Budget Planner (`POST /api/plan`)**: Greedy knapsack optimizer maximizing defect risk mitigated given review hours and team size.
- **Tree Uncertainty Estimation (`GET /api/uncertainty`)**: Standard deviation bounds across random forest estimators ($\pm\sigma$).
- **4D History Time-Lapse Player (`GET /api/timelapse`)**: Monthly repo scrubber (Month 1, Month 3, Month 6) with dynamic building height scaling.
- **Commit / PR Diff Risk Checker (`POST /api/commit-risk`)**: Evaluates unified Git diffs, computing combined probability $1 - \prod(1 - r_i)$ and affected tests.
- **2D Hotspot Scatter Matrix**: Complexity vs Churn interactive SVG canvas linked bidirectionally to 3D buildings.

### P2 Polish & Enterprise Modes
- **Privacy-Preserving Bus-Factor Concentration (`GET /api/repos`)**: Highlights modules where 1 author has $>80\%$ share AND risk $>0.50$ in pulsing rose-amber without surfacing personal identities.
- **Autonomous Exhibition Attract Tour Engine**: Continuous 3D orbit cycling through top hotspots with 7.5s progress countdown and narration cards.
- **Dual-Repository Intelligence Comparison**: Side-by-side KPI and architectural benchmark modal.
- **Live Analysis Engine Terminal**: Collapsible bottom drawer showing timestamped AST, TreeSHAP, and PageRank events.
- **Rule-Based Search Syntax**: Search filters supporting rules (`risk:>0.5`, `loc:>100`, `cc:>10`, `ext:py`).

---

## 🛡️ Strict Privacy, Honesty & Offline Rules

1. **Privacy Rule Compliance**: Knowledge concentration is evaluated strictly at the file level ("dominant contributor share: 88%"). Individual names, contributor rankings, and per-person scores are never exposed.
2. **Honesty Rule Compliance**: All ML numbers and risk probabilities derive from real AST features and Scikit-Learn models. No metrics are fabricated; all statistical values are labeled as estimates.
3. **100% Offline & API-Free**: Zero external CDNs, cloud APIs, keys, or external fonts. Fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`) are self-hosted; sounds are synthesized procedurally via the WebAudio API.

---

## 🚀 Quickstart

### 1. Launch Dev Servers
```bash
# Backend (FastAPI on http://127.0.0.1:8000)
.venv\Scripts\python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# Frontend (Vite on http://127.0.0.1:5173)
cd frontend
npm run dev
```

### 2. Run Test Suites
```bash
# Backend test suite (32/32 passing)
.venv\Scripts\python -m pytest backend/tests

# Frontend vitest unit test suite (7/7 passing)
npm --prefix frontend test -- --run

# Production build verification (0 TS errors)
npm --prefix frontend run build
```

---

## ⌨️ Interactive Controls & Shortcuts

| Key / Action | Description |
| :--- | :--- |
| **Click Building** | Selects building, flies camera to target, opens Right Drawer, and renders 3D blast radius conduits |
| **Right-Click Building**| Opens **Radial Quick-Action Menu** (Blast radius, Simulate failure, Copy path, Pin) |
| **Hover Hotspot** | Highlights corresponding 3D building in real time with spring lift ($+0.4\text{m}$) |
| **Double-Click District**| Smoothly zooms camera to focus on that directory district |
| `Ctrl+K` / `Cmd+K` | Open **Command Palette** for fast navigation, repository switching, and mode toggles |
| `Esc` | Deselect active building, close modals/drawers, and reset view |
| `F` | Focus file search input in the Left Panel |
| `1` | Switch color mode to **Defect Risk** (Green $\to$ Amber $\to$ Red) |
| `2` | Switch color mode to **Cyclomatic Complexity** (Cyan $\to$ Indigo $\to$ Magenta) |
| `3` | Switch color mode to **90-Day Churn** (Teal $\to$ Orange $\to$ Rose) |
| `4` | Switch color mode to **File Age** (Emerald $\to$ Violet) |
| `5` | Switch color mode to **Impact Score** (Sky Cyan $\to$ Amber $\to$ Neon Rose) |
| `P` | Toggle **Exhibition Mode** (cinematic auto-orbiting camera & hotspot tour with 45s attract restart) |
| `I` | Toggle **Insights Dock** (Impact, Coupling, Smells, Time, Plan, Report) |
| `Eco Mode` | Toggle low-power mode (disables bloom & dynamic shader pulses for battery efficiency) |
