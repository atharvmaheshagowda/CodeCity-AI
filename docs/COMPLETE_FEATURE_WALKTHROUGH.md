# CodeCity AI — Complete Feature & Operations Walkthrough Manual

> **"See where your code will break next, and what breaks with it."**

This document serves as the complete operational guide for exploring, demonstrating, and evaluating every single feature of **CodeCity AI**.

A pixel-perfect, professionally styled PDF version of this manual has also been compiled and saved to:  
**[`CodeCity_AI_Complete_Feature_Walkthrough.pdf`](file:///c:/Users/Atharv%20mahesha%20gowda/Desktop/Projects/CodeCity%20AI/CodeCity_AI_Complete_Feature_Walkthrough.pdf)**

---

## Table of Contents
1. [System Architecture & Quickstart](#1-system-architecture--quickstart)
2. [3D Cyber-City Navigation & Spatial Controls](#2-3d-cyber-city-navigation--spatial-controls)
3. [Repository Switching & Offline Demo Datasets](#3-repository-switching--offline-demo-datasets)
4. [Scanning Any Public GitHub or Local Repository](#4-scanning-any-public-github-or-local-repository)
5. [Five Visualization Color Modes](#5-five-visualization-color-modes)
6. [Defect Hotspot Ranking & Bidirectional Sync](#6-defect-hotspot-ranking--bidirectional-sync)
7. [Blast Radius: The Signature Dependency Moment](#7-blast-radius-the-signature-dependency-moment)
8. [Slide-In Right Drawer & Explainable SHAP Diagnostics](#8-slide-in-right-drawer--explainable-shap-diagnostics)
9. [2D Radar Minimap & Command Palette](#9-2d-radar-minimap--command-palette)
10. [Model Evaluation Card (Honest Zero-Leakage Metrics)](#10-model-evaluation-card-honest-zero-leakage-metrics)
11. [Exhibition Mode & Inactivity Attract Kiosk](#11-exhibition-mode--inactivity-attract-kiosk)
12. [Eco / Low-Power Rendering Mode](#12-eco--low-power-rendering-mode)
13. [Complete Master Shortcut Cheat Sheet](#13-complete-master-shortcut-cheat-sheet)
14. [3-Minute Live Demonstration Walkthrough Script](#14-3-minute-live-demonstration-walkthrough-script)

---

## 1. System Architecture & Quickstart

CodeCity AI transforms any Python Git repository into a real-time, interactive 3D cyber-metropolis. The application operates in a completely decoupled client-server architecture:

- **Backend (FastAPI & ML Engine)**: Traverses repository Git commit logs via PyDriller, parses Python Abstract Syntax Trees (`ast`) with NetworkX, computes cyclomatic complexity using Radon, and infers future bug probabilities via a pre-trained XGBoost model.
- **Frontend (React + Three.js)**: Renders hundreds of architectural buildings at 60 FPS using GPU instancing (`InstancedMesh`), procedural GLSL window facades, dynamic parabolic blast-radius tubes, and a cybernetic glassmorphism HUD.

### Launching the Application
- **Input**: Double-click `start.bat` in the project root, or execute:
  ```bash
  python run.py dev
  ```
- **Output**:
  - FastAPI backend activates at `http://127.0.0.1:8000`
  - React/Three.js frontend activates at `http://127.0.0.1:5173`
  - Automatically loads the bundled offline demonstration repository.

---

## 2. 3D Cyber-City Navigation & Spatial Controls

The 3D canvas occupies the entire viewport as the hero experience. Code architecture maps directly into physical metropolitan urban structures:

| Code Element | Metropolitan Visual Representation | Design Logic |
| :--- | :--- | :--- |
| **Directories** | City Districts & Glass Plates | Squarified treemap partition with floating 3D billboard labels. |
| **Files (.py)** | Architectural Skyscrapers | Chamfered corners, emissive rooftops, and procedural facade windows. |
| **Lines of Code (LOC)** | Building Footprint (Width & Depth) | Larger modules occupy larger physical plots in the city. |
| **Cyclomatic Complexity** | Building Height | Log-scaled vertical growth ($H \propto \ln(1 + \text{CC})$). |
| **Defect Probability** | Facade Emissive Color | Emerald Green (Safe) $\to$ Amber (Moderate) $\to$ Crimson (Critical). |

### Navigation Controls
- **Left-Click Drag**: Orbit camera around city center.
- **Right-Click Drag / Two-Finger Pan**: Pan camera across districts.
- **Mouse Wheel / Pinch**: Zoom in and out smoothly.
- **Hover Building**: Triggers cyan wireframe bracket and reveals tooltip with filename, LOC, and risk.
- **Click Building**: Selects building, smoothly flies camera, opens Right Drawer, and triggers the Blast Radius.
- `Esc`: Clears selection and returns camera to default overview.

---

## 3. Repository Switching & Offline Demo Datasets

CodeCity AI bundles four pre-mined demonstration repositories for instantaneous offline analysis with zero waiting time:

| Repository | Files | Architectural Characteristics | Recommended Exploration Goal |
| :--- | :--- | :--- | :--- |
| `pallets/flask` | 10 files | Dense web framework core; high fan-in on `app.py` and `helpers.py`. | Examine cascading blast radius from `app.py` to dependent modules. |
| `pallets/click` | 14 files | Command-line interface builder with deep parser and formatting modules. | Inspect cyclomatic complexity hotspots in `core.py` and `formatting.py`. |
| `psf/requests` | 17 files | HTTP library with intricate session, adapter, and model dependencies. | Test 2-hop and 3-hop reverse reachability from `models.py`. |
| `ecotrace-ai` | 4 files | Sparse repository demonstrating intelligent dynamic layout scaling ($2.4\times$). | Observe how small codebases appear intentional and grand rather than empty. |

### How to Switch
- **Input**: Click the repository dropdown in the top bar (ID: `nav-repo-select`), or press `Ctrl+K` and type the repository name.
- **Output**: Sub-second city reload, new district plates, real-time minimap update, and recalculation of KPIs and defect hotspots.

---

## 4. Scanning Any Public GitHub or Local Repository

Users can analyze external public Python repositories or local project directories:

### Step-by-Step Instructions
1. In the Left Panel, locate the **Analyze Python Repository** card.
2. Input a public Python GitHub URL (e.g. `https://github.com/psf/requests`) or local folder path.
3. Click **Scan** or press `Enter`.
4. **Output Pipeline**:
   - Submits asynchronous job to `/api/analyze`.
   - Radar progress animation tracks: Cloning (0-20%) $\to$ Git mining (20-60%) $\to$ AST dependencies (60-85%) $\to$ XGBoost inference (85-100%).
   - Instantly renders the generated 3D metropolis upon completion.
   - *Guardrails*: 150MB repository size ceiling and 2,000 commit limit to prevent server timeouts.

---

## 5. Five Visualization Color Modes

CodeCity AI provides five distinct visual lenses to inspect different dimensions of code health:

| Mode | Key | Data Source & Calculation | Color Spectrum & Tiers |
| :--- | :--- | :--- | :--- |
| **1. Defect Risk** | `1` | XGBoost ML predicted defect probability ($0.0 \to 1.0$). | Emerald Green (&lt;30%) &bull; Amber (30-60%) &bull; Hot Crimson (&gt;60%) |
| **2. Complexity** | `2` | Radon cyclomatic branching complexity (max CC score). | Cyan (&le;4 Simple) &bull; Indigo (5-10) &bull; Magenta (11-15) &bull; Rose (&gt;15 Extreme) |
| **3. 90-Day Churn** | `3` | Number of commit edits touching the file in prior 90 days. | Teal (&le;5 Low) &bull; Orange (6-20 Moderate) &bull; Rose (&gt;20 Hot) |
| **4. File Age** | `4` | Days since file was originally created in Git history. | Emerald (&le;30d Fresh) &bull; Violet (&gt;180d Mature) |
| **5. Impact Score** | `5` | $\text{Risk Probability} \times (1 + \ln(1 + \text{BlastRadius}))$. | Sky Cyan (&lt;1.0) &bull; Amber (1.0-3.0) &bull; Neon Rose (&gt;3.0 Severe) |

### How to Switch
- Press keyboard keys `1`, `2`, `3`, `4`, or `5`.
- Click any of the mode pills in the center of the Bottom HUD.
- Use `Ctrl+K` Command Palette.

---

## 6. Defect Hotspot Ranking & Bidirectional Sync

The Left Panel features an interactive ranked list of the top highest-risk files in the active repository.

- **Hovering Hotspot**: Instantly renders a cyan scanning bracket and highlights the corresponding 3D building in the city.
- **Clicking Hotspot**: Camera smoothly flies and frames the selected file; Right Drawer opens with detailed diagnostics; Blast Radius arcs illuminate.
- **Clicking Building in 3D City**: Automatically scrolls and highlights the corresponding file in the Left Panel hotspot list.

---

## 7. Blast Radius: The Signature Dependency Moment

The blast radius answers: **"What breaks when this file fails?"**
Using an AST-derived directed dependency graph, CodeCity AI computes exact reverse-reachability up to 3 hops.

### Trigger & Visual Output
- **Trigger**: Click any high-impact file (e.g. `app.py` in `pallets/flask`).
- **Outputs**:
  1. **Shockwave Ring**: An expanding cyan shockwave emits across the wet asphalt from the building's base.
  2. **Parabolic Tubes**: Glowing 3D tubular arches rise and connect the selected module to dependent files.
  3. **Glowing Data Packets**: Luminous particles stream along the tubes from origin to dependents.
  4. **Hop-Depth Chromatic Coding**:
     - **Hop 1 (Direct Importers)**: Neon Cyan tubes (`#00f0ff`).
     - **Hop 2 (Transitive Callers)**: Electric Violet tubes (`#a855f7`).
     - **Hop 3 (Distant Cascades)**: Cyber Rose tubes (`#f43f5e`).
  5. **Contextual Dimming**: Unrelated buildings dim to 20% opacity.

---

## 8. Slide-In Right Drawer & Explainable SHAP Diagnostics

Selecting any building opens the Right Drawer with transparent, zero-hallucination model diagnostics:

- **Animated Circular Risk Gauge**: SVG gauge tweening from 0% to the exact predicted probability (e.g., **96% Defect Risk**).
- **Architectural Impact Score**: Numerical impact factoring risk and dependent count: $\text{Risk} \times (1 + \ln(1 + \text{BlastRadius}))$.
- **AI Defect Diagnosis**: Deterministic plain-English synthesis explaining the top drivers (e.g. *“High defect likelihood (96.2%). Driven primarily by large codebase footprint and intricate branching complexity.”*).
- **SHAP Feature Contributions**:
  - **Positive Forces (Red)**: Increases defect risk (e.g. Lines of Code +1.58, Max CC +1.51).
  - **Mitigating Forces (Cyan)**: Decreases defect risk (e.g. File Age -0.22, Low Churn -0.53).
- **Dependent Files List**: Interactive clickable list of direct and indirect callers affected by this file.

---

## 9. 2D Radar Minimap & Command Palette

### 2D Radar Minimap (Bottom HUD)
- Displays a real-time 2D scatter projection of all repository files.
- The active selected building pulses with a bright cyan beacon.
- Clicking the **Center** button smoothly recenters the 3D camera.

### Command Palette (`Ctrl+K` / `Cmd+K`)
- Press `Ctrl+K` or click **Command ⌘K** in the top navbar.
- Type any keyword (e.g., `risk`, `flask`, `eco`, `model`, `exhibition`).
- Navigate with `↑` `↓` arrow keys and press `Enter`.
- Press `Esc` to dismiss.

---

## 10. Model Evaluation Card (Honest Zero-Leakage Metrics)

Clicking **Model Card** in the top bar opens an exhaustive evaluation modal displaying genuine machine learning performance:

- **ROC-AUC**: `0.667` on strictly held-out repositories (`httpie/cli`).
- **Precision @ 10**: `0.500` (5 out of the top 10 flagged files experienced verified future defect commits).
- **Recall @ 10%**: `0.450` (captures nearly half of all future defects in the top 10% riskiest files).
- **Baseline Comparison**: Outperforms naive commit frequency ranking (`+0.12 ROC-AUC` over Churn baseline).
- **Zero Data Leakage Protocol**: Strict temporal cutoff at time $T$. Historical features extracted strictly before $T$. Defect labels identified via bug-fix commit regex in $(T, T + 90\text{ days}]$.

---

## 11. Exhibition Mode & Inactivity Attract Kiosk

Designed for kiosk displays, project exhibitions, and conference booths:

- **Activation**: Press `P`, click **Exhibition** in the top navbar, or leave the keyboard/mouse idle for **45 seconds** (Attract Mode).
- **Experience**:
  - Continuous cinematic auto-orbit around the city.
  - Auto-cycles through top 5 defect hotspots every 8 seconds.
  - Automatically demonstrates real blast-radius arcs and flowing packet particles for each hotspot.
  - Projector-ready typography readable from 10+ feet away.
  - **Instant Wakeup**: Any user touch, mouse movement, or keypress instantly resumes interactive mode.

---

## 12. Eco / Low-Power Rendering Mode

- **How to Toggle**: Click **Eco** in the top navbar (`nav-eco-toggle`) or use `Ctrl+K`.
- **Effect**: Bypasses expensive multi-pass postprocessing bloom shaders, reducing GPU fillrate load while preserving all 3D geometries and data interactions. Ensures 60 FPS on older laptops and battery power.

---

## 13. Complete Master Shortcut Cheat Sheet

| Key / Gesture | Feature Triggered | Operational Effect |
| :--- | :--- | :--- |
| **Left-Click Drag** | Camera Orbit | Rotates the 3D metropolis around the central urban core. |
| **Right-Click Drag** | Camera Pan | Pans across districts and neighboring modules. |
| **Mouse Wheel** | Camera Zoom | Smoothly moves closer to inspect building facades and rooftops. |
| **Click Building** | Select & Blast Radius | Focal camera fly-to, Right Drawer opening, shockwave & dependency tubes. |
| `Ctrl+K` / `Cmd+K` | Command Palette | Opens instant fuzzy-searchable launcher for repos, modes, and actions. |
| `Esc` | Deselect / Close | Closes drawers/modals, clears active building selection, resets camera. |
| `F` | Focus Search | Instantly jumps cursor into the Left Panel file search bar. |
| `1` | Risk Mode | Colors city buildings by XGBoost ML defect probability ($0.0 \to 1.0$). |
| `2` | Complexity Mode | Colors city buildings by Radon cyclomatic branching complexity. |
| `3` | Churn Mode | Colors city buildings by 90-day Git commit edit frequency. |
| `4` | Age Mode | Colors city buildings by file creation age (Fresh vs Matured). |
| `5` | Impact Mode | Colors city buildings by Architectural Impact score. |
| `P` | Exhibition Mode | Toggles hands-free cinematic auto-orbit and rotating hotspot showcase. |

---

## 14. 3-Minute Live Demonstration Walkthrough Script

1. **The Hook (0:00 - 0:30)**: Open `pallets/flask`. Show the full-screen 3D metropolis at night. Explain: *"This is an interactive digital twin of a Python codebase. Directories are districts, files are buildings, and height is cyclomatic complexity."*
2. **The Prediction (0:30 - 1:15)**: Point to the top hotspot (`app.py`). Explain: *"Our XGBoost model predicts a 96% defect likelihood in the upcoming release cycle based on historical commit churn, complexity, and graph topology."*
3. **The Signature Blast Radius (1:15 - 2:00)**: Click `app.py`. Watch the shockwave emit and 3D parabolic conduits arc to dependent modules. Show the glowing data packets flowing across the city. Highlight: *"It has an Architectural Impact score of 2.02 because 2 critical modules break if app.py fails."*
4. **Explainability & Zero Data Leakage (2:00 - 2:30)**: Inspect Right Drawer SHAP bars. Show why it's risky (LOC +1.58, Max CC +1.51). Open the **Model Card** to prove ROC-AUC 0.667 on held-out data with zero leakage.
5. **Exhibition Kiosk Mode (2:30 - 3:00)**: Press `P` to trigger Exhibition Mode. Let the camera orbit smoothly while explaining: *"The platform includes an automatic attract mode that self-demonstrates at exhibition booths."*
