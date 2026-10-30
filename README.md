# CodeCity AI — Miniature Cyber-Metropolis Software Intelligence Platform

> **"See where your code will break next, and what breaks with it."**

CodeCity AI transforms any Python Git repository into an interactive, cinematic 3D cyber-metropolis. An XGBoost machine learning model trained on temporal commit history predicts which files will experience defects next, while an AST-driven dependency graph visualizes the **blast radius**—illuminating exactly which upstream callers and importing modules will break if a risky file fails.

---

## 🌆 Visual Architecture & Cyber-Metropolis Redesign

The application visual engine is engineered as a miniature futuristic smart diorama:

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

2. **Procedural Facade Shader**:
   - **Dual-Temperature Lighting**: Warm golden incandescent interior illumination (`#fef08a`) + cool cyan terminal glow (`#38bdf8`) separated by dark tinted glass spandrels and structural mullions.
   - **Dynamic Lighting**: Subtle window flicker on ~4% of lit windows and slow crimson pulse on high-risk modules.
   - **Silhouette Legibility**: Fresnel edge rim lighting and soft vertical gradients ensure instant readability against dark night environments.

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

## 🧠 Zero Data Leakage ML Pipeline

- **Temporal Cutoff Protocol**: Strict temporal split at time $T$.
- **Historical Features**: LOC, churn, cyclomatic complexity, author diversity, past bug fixes, and graph fan-in/fan-out extracted strictly before $T$.
- **Defect Labels**: Identified via bug-fix commit regex (`fix|bug|error|crash|regression|patch|issue #`) in the future window $(T, T + 90\text{ days}]$.
- **Held-Out Evaluation**: Evaluated on a strictly held-out repository (`httpie/cli`) and benchmarked honestly against a naive churn baseline with complete metrics reported in the in-app Model Card.

---

## ⚡ AST Dependency Graph & Blast Radius

- Parses Python abstract syntax trees (`ast`) for direct imports, from-imports, alias mappings, and function call sites into a NetworkX directed graph.
- Computes reverse BFS blast radius up to 3 hops (immediate importers, transitive callers).
- Computes architectural impact score:
  $$\text{Impact Score} = \text{Risk Probability} \times (1 + \ln(1 + \text{Dependents}))$$

---

## 🛡️ Strict Offline & API-Free Architecture

- Zero external APIs, zero LLMs, zero telemetry, zero CDN assets.
- Self-hosted local fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`) via `@fontsource`.
- 100% offline procedural WebAudio sound synthesizer for micro-ticks, clicks, whooshes, and blast waves.
- Bundled offline demo repositories (`pallets/click`, `pallets/flask`, `psf/requests`, `atharvmaheshagowda/ecotrace-ai`) with sub-second load times.

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
# Backend tests (pytest - 11/11 passed)
.venv\Scripts\python -m pytest backend/tests

# Frontend tests (vitest - 3/3 passed)
cd frontend
npm test

# Production build verification
cd frontend
npm run build
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
| `Eco Mode` | Toggle low-power mode (disables bloom & dynamic shader pulses for battery efficiency) |

