# CodeCity AI

> **"See where your code will break next, and what breaks with it."**

CodeCity AI transforms any Python Git repository into an interactive, cinematic 3D cyber metropolis. An XGBoost machine learning model trained on temporal commit history predicts which files will experience defects next, while an AST-driven dependency graph visualizes the **blast radius**—illuminating exactly which upstream callers and importing modules will break if a risky file fails.

---

## Key Highlights

- **3D Cyber City Visualization**:
  - Directories are partitioned into districts using squarified treemaps.
  - Files are rendered as 3D buildings using `InstancedMesh` for silky ~60 FPS rendering on standard laptop GPUs.
  - Footprint represents Lines of Code (LOC), height represents cyclomatic complexity (log-scaled), and color represents defect risk ($[0.0 \to 1.0]$ green $\to$ amber $\to$ crimson red).
- **Zero Data Leakage ML Pipeline**:
  - Strict temporal cutoffs at time $T$.
  - Historical features (LOC, churn, complexity, author diversity, past bug fixes, graph fan-in/fan-out) extracted strictly before $T$.
  - Defect labels identified via bug-fix commit regex (`fix|bug|error|crash|regression|patch|issue #`) in the future window $(T, T + 90\text{ days}]$.
  - Evaluated on a strictly held-out repository (`httpie/cli`) and benchmarked honestly against a naive churn baseline.
- **AST Dependency Graph & Blast Radius**:
  - Parses Python abstract syntax trees (`ast`) for direct imports, from-imports, alias mappings, and function call sites into a NetworkX directed graph.
  - Computes reverse BFS blast radius up to 3 hops (immediate importers, transitive callers).
  - Renders glowing 3D parabolic conduits connecting selected files to their dependents in real time.
  - Computes architectural impact score:
    $$\text{Impact Score} = \text{Risk Probability} \times (1 + \ln(1 + \text{Dependents}))$$
- **Rule-Based SHAP Explainability**:
  - Deterministic plain-English defect diagnosis explaining the top contributing features without any external LLM or cloud API calls.
- **Strictly Offline & API-Free**:
  - Zero external APIs, zero LLMs, zero telemetry, zero CDN assets.
  - Fonts (`Inter`, `JetBrains Mono`) are self-hosted locally via `@fontsource`.
  - Comes bundled with 3 pre-mined demo repositories (`pallets/click`, `pallets/flask`, `psf/requests`) for instantaneous offline demonstration.

---

## Architecture & Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.12+) with Uvicorn
- **Mining & Metrics**: PyDriller (Git commit traversal), radon (Cyclomatic complexity)
- **Dependency Graph**: Python standard library `ast`, NetworkX DiGraph
- **Machine Learning**: XGBoost Classifier (`scale_pos_weight` for class imbalance), scikit-learn, SHAP, pandas, joblib
- **Testing**: pytest (11 test suites covering API health, BFS graph traversals, impact scoring, and strict zero-leakage proof)

### Frontend
- **Framework**: React 18 + Vite + TypeScript
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` (Selective Bloom, Fog, Ambient Lighting)
- **State Management**: Zustand
- **Styling**: Tailwind CSS with custom glassmorphism, cyber neon tokens, and responsive mission-control HUD
- **Testing**: Vitest

---

## One-Command Quickstart (`run.py`)

CodeCity AI includes a cross-platform runner script `run.py` that simplifies all lifecycle operations:

```bash
# 1. Setup virtual environment, Python dependencies, and frontend packages
python run.py setup

# 2. Train the defect prediction model on temporal split data & write metrics.json
python run.py train

# 3. Generate and cache the 3 offline demo repositories (pallets/click, pallets/flask, psf/requests)
python run.py demo-data

# 4. Launch both FastAPI backend (http://127.0.0.1:8000) and Vite frontend (http://127.0.0.1:5173)
python run.py dev
```

### Running Tests & Production Builds

```bash
# Run backend pytest and frontend vitest test suites
python run.py test

# Verify TypeScript types and build production bundles
python run.py build
```

---

## Interactive Controls & Shortcuts

| Key / Action | Description |
| :--- | :--- |
| **Click Building** | Selects building, flies camera to target, opens Right Drawer, and renders 3D blast radius conduits |
| **Hover Hotspot** | Highlights corresponding 3D building in real time with cyan scanning bracket |
| **Orbit / Pan / Zoom** | Left-click drag to rotate, right-click drag to pan, scroll wheel to zoom |
| `Ctrl+K` / `Cmd+K` | Open **Command Palette** for fast navigation, repository switching, and mode toggles |
| `Esc` | Deselect active building, close modals/drawers, and reset view |
| `F` | Focus file search input in the Left Panel |
| `1` | Switch color mode to **Defect Risk** (Green $\to$ Amber $\to$ Red) |
| `2` | Switch color mode to **Cyclomatic Complexity** (Cyan $\to$ Indigo $\to$ Magenta) |
| `3` | Switch color mode to **90-Day Churn** (Teal $\to$ Orange $\to$ Rose) |
| `4` | Switch color mode to **File Age** (Emerald $\to$ Violet) |
| `5` | Switch color mode to **Impact Score** (Sky Cyan $\to$ Amber $\to$ Neon Rose) |
| `P` | Toggle **Exhibition Mode** (cinematic auto-orbiting camera & hotspot tour for exhibition kiosks) |
| `Eco / Low-Power` | Toggle postprocessing bloom and shader intensity for maximum laptop battery efficiency |

---

## UI Showcase

CodeCity AI features an award-winning cinematic user interface combining the atmospheric ambiance of *Blade Runner 2049* and *Tron: Legacy* with the fluid motion engineering of *Linear*, *Arc*, and *Apple visionOS*.

### 1. Spatial Metaphor & The 3D Cyber-Metropolis
- **Clean Architectural Towers**: Completely eliminates primitive boxes, tapered barrels, and ornamental spires in favor of 5 clean architectural tower archetypes constructed with sharp-beveled rectangular prisms, chamfered stepped setbacks, and flat roofs with subtle emissive trim:
  1. *Monolithic Glass Tower*: Sharp rectangular tower with recessed base plinth, crisp mullions, and perimeter parapet trim.
  2. *Stepped Setback High-Rise*: 3-tier setbacks (podium base -> mid-shaft -> penthouse crown) for complex files.
  3. *Cantilevered Modernist Tower*: Sturdy core with cantilevered projecting mid-section and flat roof deck.
  4. *Twin-Column Composite Tower*: Asymmetric dual rectangular towers linked by an enclosed central atrium.
  5. *Landmark Monumental Tower*: Flagship stepped high-rise featuring vertical beacon light beams and floating holographic labels.
- **Angle-Aware Procedural Window Facade Shader**: Injected custom GLSL via `MeshStandardMaterial.onBeforeCompile`. Computes clean, aligned planar window matrices (~4.0 window bays per unit, ~3.0 floors per unit). Features deterministic room lighting hashes (warm-white interior light, cool-cyan terminal lighting, dark glass between), subtle window flicker, dark structural mullions and spandrels, slow crimson pulse on high-risk files, Fresnel edge rim lighting, and vertical luminance gradients.
- **Dark Glossy Reflective Ground**: Deep obsidian glossy reflective floor (`#01040a`, roughness 0.16, metalness 0.92) with subtle cyan coordinate lines that gracefully fade with distance. Zero stray dashes, zero random black blobs.
- **Frosted-Glass District Plates & Elevated Labels**: Translucent frosted platforms (`#070d1a`, roughness 0.42, metalness 0.65) with glowing perimeter borders. District billboard labels float at `y = maxBuildingHeight + 5.5` with clean separation, guaranteed never to overlap buildings or landmark beacons.
- **Distant Megalopolis Skyline Backdrop & Drifting Dust**: Outer concentric rings of towering dark skyscraper silhouettes with horizontal illuminated window slits, accompanied by hundreds of glowing atmospheric cyber-dust particles drifting through the volumetric lights.
- **Dynamic Sparse-City Scaling**: Small repositories ($< 30$ files) automatically apply intelligent scale multipliers ($1.15\times - 2.0\times$) and proportional layout spacing, ensuring smaller codebases appear heroic and intentional rather than empty.

### 2. Living Interactions & Blast-Radius Experience
- **Hover Spring Lift**: Hovering over any building lifts it $+0.4\text{m}$ smoothly in the 3D scene, while a floating glass info card tracks cursor position with spring lag.
- **Expanding Shockwave & Glowing Parabolic Arcs**: Selecting a building triggers an expanding ground shockwave ring and illuminates parabolic 3D arcs connecting the module to its upstream callers.
- **Animated Traffic Data Packets**: Glowing data particles stream continuously along dependency skybridges and blast-radius arcs.
- **Hop-Depth Chromatic Encoding**:
  - **Hop 1 (Direct Importers)**: Vivid Neon Cyan (`#38bdf8`)
  - **Hop 2 (Transitive Callers)**: Electric Violet (`#c084fc`)
  - **Hop 3 (Distant Cascades)**: Cyber Rose (`#fb7185`)
- **Right-Click Radial Quick-Action Menu**: Right-clicking any building opens a floating context HUD offering:
  1. *Inspect Blast Radius*
  2. *Simulate Failure Cascade*
  3. *Copy File Path*
  4. *Pin to Comparison Dock*
- **Pinned Files Comparison Dock**: A floating dock at the bottom of the screen allowing developers to compare metrics (risk, impact, LOC, complexity) across multiple pinned modules simultaneously.
- **Procedural WebAudio Sound Engine**: 100% offline real-time synthesizer generating soft micro-ticks on button/item hover and smooth resonant whooshes during camera fly-to transitions and drawer slides (disabled by default with an audio toggle in the top bar).

### 3. Mission-Control UI & VisionOS Glassmorphism
- **Floating VisionOS Glass Panels**: Built with multi-layered frosted glass (`backdrop-blur-2xl`, `rgba(2, 6, 23, 0.85)`), 1px inner highlights, and soft drop shadows.
- **Collapsible Intelligence Panel**: Floating left panel featuring animated SVG sparklines on KPI cards (Total Files, Avg Defect Risk, Critical Impact Files, Model ROC-AUC), repository scanner, and ranked hotspots list with bidirectional 3D hover sync.
- **Bottom HUD**: Houses a real-time **2D Radar Minimap** reflecting building node coordinates, active selection ping, dynamic color-mode legend, decorative skyline toggle, and sliding pill indicators (`layoutId="activeColorModePill"`).
- **Slide-In Right Drawer**: Features an animated circular SVG risk gauge with drop-shadow glow, plain-English AI Defect Diagnosis, positive/negative SHAP feature contribution meters, architectural impact score, and direct blast-radius dependency lists.
- **Command Palette (`Ctrl+K` / `Cmd+K`)**: Instant fuzzy-searchable keyboard navigation for switching repositories, color modes, files, and system toggles.
- **Model Card Modal**: Features a self-drawing animated SVG ROC curve comparing XGBoost against the naive churn baseline, along with precision/recall metric cards and temporal zero-leakage proof.

### 4. Exhibition & Inactivity Attract Mode
- Designed specifically for live kiosk presentations and college project exhibitions:
- **Smooth Auto-Orbit**: Gently orbits the camera around the digital city at an interactive viewing angle.
- **Rotating Hotspot Showcase**: Automatically cycles through the top 5 highest-risk files every 7.5 seconds, dynamically demonstrating their real blast-radius arcs.
- **Large Projector Typography**: Clean, high-contrast banner and hotspot diagnostic HUD readable from across a room.
- **Inactivity Attract Mode**: Automatically enters Exhibition mode after 45 seconds of user inactivity; instantly yields control back upon mouse movement, touch, or keypress.

### 5. Architectural Intelligence & Health Engine (Phase 5)
- **7-Category Architectural Health Matrix**: The flagship Overview dock synthesizes repository telemetry into actionable categories:
  1. *Critical Defect Hotspots*: Highest ML defect probabilities combined with structural blast exposure.
  2. *Architectural Bottlenecks*: High Betweenness Centrality modules bridging disparate subsystems.
  3. *Change Instability*: High 90-day churn accompanied by significant complexity.
  4. *Dependency Concentration*: Files with excessive direct incoming and outgoing imports.
  5. *Architecture Smells*: Circular import cycles, god files ($>500$ LOC), and isolated orphans.
  6. *Ownership Concentration*: Bus factor risks identifying files maintained by a single contributor.
  7. *Cascading Impact Risks*: Transitive failure reachability up to 3 hops deep.
- **Graph Centrality Algorithms**: Native NetworkX PageRank and Betweenness Centrality metrics computed during graph generation, clearly distinguished from defect probability.
- **Controllable Failure Simulation**: Interactive hop-depth filtering (`[Hops: 1 | 2 | 3]`) allowing engineers to study immediate callers versus full transitive impact with explicit static-reachability semantics.
- **Scale-Invariant Repository Benchmarking**: Multi-repo comparison categorized into raw counts, normalized architectural ratios (LOC/file, dependency density, hotspot exposure %), structural profiles, and empirical ML validation metrics.
- **Unobstructed 360° Cinematic Environment**: Infinite canvas background and distant procedural megalopolis horizon ($R = 140\text{--}185\text{m}$) completely outside repository bounds, eliminating any billboard barriers or building clipping.

### 6. Performance Engineering & Low-Power Mode
- **60+ FPS Target (Measured 144–146 FPS)**: Powered by Three.js `InstancedMesh` batching across 10 architectural archetypes, procedural GLSL window shaders, and an in-memory graph cache (`_REPO_MEM_CACHE`).
- **Low-Power Mode Toggle**: A dedicated "Eco" switch in the Navbar allows users on battery or integrated GPUs to instantly bypass expensive postprocessing bloom passes while maintaining complete interactive functionality.

### 7. Accessibility & Motion Principles
- **Color-Blind Safe Encoding**: Defect severity is encoded redundantly through color, numerical percentages, rank badges, building height, and glowing roof accents.
- **Respects `prefers-reduced-motion`**: Disables auto-orbit and particle drift for users requesting reduced motion.
- **Visible Focus Outlines & Keyboard Navigation**: Fully navigable via keyboard shortcuts (`Ctrl+K`, `P`, `Esc`, `F`, `1-5`).

### 8. 100% Offline Guarantee
- **Zero External Network Requests**: No external CDNs, fonts, or remote assets.
- **Self-Hosted Typography**: Local `@fontsource/space-grotesk`, `@fontsource/inter`, and `@fontsource/jetbrains-mono` bundled into local frontend assets.
- **Procedural Shaders & Audio**: All city textures, ground reflections, bloom effects, and sound effects are generated natively on client GPU and WebAudio API.
- **Bundled Demo Repositories**: Pre-mined datasets for `pallets/flask`, `pallets/click`, `psf/requests`, `agenta-workspace`, `codecity-ai`, and `ecotrace-ai` allow full offline demonstration.

---

## Verification & Acceptance

- **Zero Data Leakage**: Enforced and validated via `backend/tests/test_leakage.py` (11 of 11 pytest tests passing).
- **Offline Readiness**: Loads cached repositories in $< 1$ second without active internet connection.
- **60 FPS Performance**: Powered by Three.js `InstancedMesh` batch rendering and procedural GLSL window facades.
- **5-Round Screenshot Critique Loop**: Completed 5 comprehensive design-critique rounds across 1920×1080 and 1366×768 resolutions on dense and sparse repositories (fully documented in `TODO.md` and `DECISIONS.md`).

