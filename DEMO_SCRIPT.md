# CodeCity AI — 3-Minute Live Demonstration Script (`DEMO_SCRIPT.md`)

> **Elevator Pitch**: *"CodeCity AI transforms any Python Git repository into a cinematic 3D cyber-metropolis, illuminating where code will break next and what upstream callers break with it."*

---

## ⏱️ Minute 0:00 – 0:30 • The Cyber-Metropolis & Core Hotspot

1. **Open the App**:
   - Navigate to `http://127.0.0.1:5173`.
   - The default view loads `atharvmaheshagowda/AGENTA-WORKSPACE` (7 files), reproducing the pixel-perfect 1:1 cyber diorama:
     - Obsidian wet asphalt terrain with reflective cyan coordinate grid.
     - Central towering hero skyscraper `seed_db.py` pulsing with crimson warning beacon (`91% Defect Risk`).
     - Floating in-scene 3D billboard pins for `seed_db.py`, `models.py`, `schemas.py`, `test.py`, `utils.py`, `tenfo.py`, and the floating district badge `root / 7 files`.
     - Luminous parabolic cyan skybridges flowing energy packets to dependent buildings.

2. **File Drawer Deep Dive**:
   - Notice the right drawer automatically focused on `seed_db.py`:
     - **Circular Defect Gauge**: 91% Defect Risk with $\pm 4.2\%$ tree uncertainty band.
     - **90-Day Risk Trajectory**: 4-point SVG sparkline with pulsing `RAPID RISE (+32%)` badge.
     - **TreeSHAP Attribution**: Horizontal bars showing that cyclomatic complexity (+0.42), recent churn (+0.28), and LOC (+0.17) drive the risk, while file age (-0.06) mitigates it.
     - **Uncovered Danger Zone Alert**: Flags high risk with 0 covering tests.

---

## ⏱️ Minute 0:30 – 1:15 • Traceback-to-Blast-Radius & Breaking Changes

1. **Trigger Traceback Analysis (P0)**:
   - Click the **"Insights"** button in the top navbar (or press `I`) to open the analytical dock.
   - On the **Impact** tab, click **"Load Crash Sample"** and click **"Trace Impact"**.
   - *Visual Event*: The crashed module flashes vivid alarm red (`#ef4444`) with an expanding shockwave ring; dependent callers flash in staggered sequence by hop depth.

2. **Breaking-Change Signature Tester (P1)**:
   - In the same Impact tab, scroll to **"Breaking-Change Signature Tester"**.
   - Click **"Preset: Add Required Arg"** (`def init_app(app, db, strict=True) -> def init_app(app, db, engine, strict=True)`).
   - Click **"Simulate Signature Change"**.
   - *Visual Event*: Instantly parses the AST, identifies calling modules lacking the new argument, lists broken call sites, and highlights callers in strobing orange (`#f97316`) in the 3D city!

---

## ⏱️ Minute 1:15 – 1:45 • Hidden Co-Change Coupling & Architectural Smells

1. **Switch to Multi-Month Repository**:
   - In the top navbar repo selector, choose **`pallets/flask`** (15 modules, 180-day history).
   - The 3D metropolis expands into an intricate multi-district skyline with distinct architectural archetypes (Gateways, Tests, Data Vaults, Fortified Configs).

2. **Hidden Coupling Tunnels**:
   - In the Insights dock, click the **"Coupling"** tab.
   - Examine pairs of files that frequently co-change in Git commits despite lacking direct AST import statements.
   - Toggle the **"Hidden Coupling Tunnels"** layer: glowing violet arches connect building basements across districts!

3. **Architecture Smells & Circular Dependencies**:
   - Switch to the **"Smells"** tab.
   - Highlights circular dependency cycles (Tarjan SCCs) with looped crimson arcs overhead, and points out god files and architectural debt.

---

## ⏱️ Minute 1:45 – 2:30 • 4D Time-Lapse & Knapsack Review Planner

1. **4D History Time-Lapse Player (P1)**:
   - In the Insights dock, click the **"Time"** tab.
   - Drag the month scrubber or click **"Play Time-Lapse"**:
     - Month 1 (Scaffold): Only initial modules exist; unborn buildings appear as dark wireframe foundations.
     - Month 3 (Feature Expansion): Blueprints and context towers grow in real-time.
     - Month 6 (Today): Full architecture stands tall with flaring defect hotspots!

2. **Knapsack Review Budget Planner (P1)**:
   - Click the **"Plan"** tab.
   - Adjust the **Review Budget** slider to `16 Hours` with a team of `2 Reviewers`.
   - The knapsack algorithm maximizes defect risk mitigated given review reading speeds ($\approx 140$ LOC/hr).
   - View the prioritized checklist, check off completed reviews, or click **"Focus 3D"** to fly directly to any target module.

---

## ⏱️ Minute 2:30 – 3:00 • Privacy Bus-Factor & Autonomous Exhibition Attract Mode

1. **Privacy-Preserving Bus Factor (P2)**:
   - Open the right file drawer and click the **"Metrics"** tab.
   - Observe the **Bus-Factor Concentration Card**:
     - *"Primary contributor authored 88% of revisions across 24 commits."*
     - Strictly complies with the **Privacy Rule**: File-level concentration only; zero individual names, emails, or personal scores.
   - In the bottom HUD, click **Layers** and toggle **"Bus-Factor Concentration"**: files where 1 author has $>80\%$ share AND risk $>0.50$ pulse in rose-amber!

2. **Exhibition Attract Mode (P2)**:
   - In the top navbar, click **"Exhibition"** (or press `P`).
   - The camera begins a continuous cinematic 3D orbit around the software metropolis.
   - The projector HUD spotlights the repository's top hotspots, auto-cycling every 7.5 seconds with an animated countdown timer and interactive stepper pills.
   - Conclude: *"100% offline, zero data leakage, zero API keys—deterministic software intelligence engineered for modern engineering organizations."*

