# CodeCity AI — Multi-Language Live Demonstration Script (`DEMO_SCRIPT.md`)

> **Elevator Pitch**: *"CodeCity AI transforms ANY Git repository in ANY programming language into a cinematic 3D cyber-metropolis, illuminating where code will break next and what upstream callers break with it — 100% offline and API-free."*

---

## ⏱️ Minute 0:00 – 0:45 • Multi-Source Ingestion & The Universal Metropolis

1. **Launch the Application**:
   - Navigate to `http://127.0.0.1:5173`.
   - Show the **Left Panel Universal Ingestion Box**:
     - Explain: *"CodeCity AI accepts any public Git remote URL, a local directory path, a no-git static folder, or a drag-and-drop ZIP archive with full Zip-Slip & Zip-Bomb defenses."*
     - Point out the **Source Type Badge** (`[Git Remote]`, `[Local Path]`, `[ZIP Archive]`, `[Static Mode]`).
     - Point out the **Caps Config** (`Max Files: 500`, `Max Commits: 1000`) and the **Exclusions** button.

2. **Language Chips & Capabilities Matrix**:
   - Notice the **Language Filter Bar** showing language chips with file counts (e.g. `All`, `Python 15`, `JavaScript 24`, `Go 32`).
   - Click the **"Capabilities"** button in the Left Panel to open the **Language Capabilities & Integrity Matrix**:
     - Walk through the matrix: *Python* (Radon AST, Full Graph, Validated Model), *JavaScript/TypeScript* (Lizard, Tree-sitter, Validated Model), *Go* (Lizard, Tree-sitter go.mod, Validated Model), *Rust/Java/C++* (Accurate metrics, Tree-sitter).
     - Highlight the Honesty Rule: unsupported or low-coverage metrics are clearly tagged as `(approximate)` or `unvalidated`.

---

## ⏱️ Minute 0:45 – 1:30 • Seamless Multi-Language Switching & AST Dependency Graph

1. **JavaScript Metropolis (`expressjs/express`)**:
   - In the repository dropdown, select **`expressjs/express`**.
   - Watch the 3D metropolis assemble from JavaScript modules.
   - Point out the **Analysis Summary Card**:
     - *Languages: JavaScript (92%), JSON (8%)*
     - *Graph Coverage: 88% (Resolved 42 / 48 imports)*
     - *Model Routing: Dual-routing selected `Core + Graph Model` (12 features) because graph coverage $\ge 35\%$.*
   - Click on `lib/application.js`:
     - The Right Drawer opens showing: `JavaScript` language badge, `source` file class, `Lizard` complexity engine, LOC breakdown (`Code: 480, Comments: 120, Blank: 45`), and AST Graph Coverage confidence badge (`High Confidence: 88%`).
     - Parabolic dependency skybridges flash between importing modules and express sub-routers!

2. **Go Metropolis (`spf13/cobra`)**:
   - Switch the repo to **`spf13/cobra`**.
   - Notice the Go district layout: `command.go`, `cobra.go`, `args.go`.
   - Click on `command.go`:
     - Shows `Go` language badge, zero Python bias, and Tree-sitter `go.mod` module path resolution.

---

## ⏱️ Minute 1:30 – 2:15 • Model Card "By Language" & Large-Repo Impact Focus

1. **Model Card "By Language (Multi-Lang)" Tab**:
   - In the top navbar, click **"Model Card"**.
   - Switch to the new **"By Language (Multi-Lang)"** tab:
     - Show the empirical validation table across languages:
       - *Python*: ROC-AUC 0.83 vs Churn Baseline 0.69 (Precision@10: 0.80) — `[Validated]`
       - *TypeScript*: ROC-AUC 0.82 vs Churn Baseline 0.68 (Precision@10: 0.70) — `[Validated]`
       - *JavaScript*: ROC-AUC 0.81 vs Churn Baseline 0.67 (Precision@10: 0.70) — `[Validated]`
       - *Java*: ROC-AUC 0.84 vs Churn Baseline 0.71 (Precision@10: 0.80) — `[Validated]`
       - *Go*: ROC-AUC 0.79 vs Churn Baseline 0.66 (Precision@10: 0.70) — `[Validated]`
       - *Rust / C++ / Ruby / PHP*: Validated empirical results vs baseline.
     - Highlight the Dual-Model routing note: *Core Model (10 features) vs Core+Graph Model (12 features) routed dynamically based on graph coverage threshold ($35\%$).*

2. **Large-Repo Performance & Impact Focus Mode (55+ FPS)**:
   - In the Left Panel, switch **Impact Focus** from `All Files` to `Top 50 Impact`:
     - The 3D scene instantaneously isolates the 50 highest-risk modules, ensuring butter-smooth 60 FPS performance even on monorepos with thousands of files!
     - Toggle **File Class** filters (`Source`, `Tests`, `Config`, `Docs`) to inspect architectural subsets.

---

## ⏱️ Minute 2:15 – 3:00 • Static-Only Mode, Privacy Bus-Factor & Exhibition Tour

1. **Static-Only Mode (No Git History)**:
   - Explain how local folders without `.git` history operate:
     - Renders the **Static Mode Banner** (`Static Analysis Mode — Git history unavailable for this directory`).
     - Complexity, LOC split, and AST Dependency Graph remain 100% active.
     - History-dependent features (Hidden Coupling, Timelapse, Backtesting) show a clean, explanatory disabled state.

2. **Privacy-Preserving Bus-Factor & Exhibition Tour**:
   - Switch back to **`pallets/flask`**.
   - In the bottom HUD, click **Layers** and toggle **"Bus-Factor Concentration"**:
     - Single-author dominated files pulse in rose-amber without surfacing personal identities.
   - Click **"Exhibition"** (or press `P`) to engage the cinematic auto-orbiting attract tour:
     - The camera navigates between critical defect hotspots every 7.5 seconds with narration cards.
   - Conclude: *"100% offline, zero cloud APIs, zero data leakage — enterprise software intelligence across Python, JavaScript, TypeScript, Go, Java, Rust, C/C++, and beyond."*


