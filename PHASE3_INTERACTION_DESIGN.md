# CodeCity AI — Phase 3: Advanced Interactions, Dependency Visualization & Failure Simulation Design

## 1. System Overview & Philosophy

Phase 3 establishes an advanced, tactile, and highly informative interaction layer for CodeCity AI. The 3D miniature metropolis ceases to be merely a static visual model; it becomes an interactive physical manifestation of the repository's living dependency network, software risk profile, and failure propagation pathways.

Every interaction is grounded in actual static analysis (AST dependency graph, defect risk predictions, cyclomatic complexity, churn metrics, and cascade failure simulations).

---

## 2. Interaction State Architecture

The interaction engine adheres strictly to a single source of truth within `useCityStore`:

```
┌────────────────────────────────────────────────────────┐
│                      useCityStore                      │
├──────────────────────────┬─────────────────────────────┤
│ Primary Focus State:     │ - selectedFile (FileNode)   │
│                          │ - hoveredFile (FileNode)    │
├──────────────────────────┼─────────────────────────────┤
│ Simulation State:        │ - simulatedFailedFile       │
│                          │ - simulateResult (Cascade)  │
│                          │ - tracebackResult (Trace)   │
├──────────────────────────┼─────────────────────────────┤
│ Viewport & Graph State:  │ - maxHopDepth (1..3)        │
│                          │ - activeLayers (Skybridges) │
│                          │ - colorMode (Risk/CC/etc.)  │
│                          │ - isDependencyGraphOpen     │
│                          │ - cameraResetTrigger        │
└──────────────────────────┴─────────────────────────────┘
```

### State Precedence & Layering
1. **Simulation Overlay** (highest precedence): When `simulatedFailedFile` or `simulateResult` is active, failure propagation highlights take visual priority with a persistent HUD banner to exit.
2. **Selection & Blast Radius Overlay**: When `selectedFile` is present, the selected building, its multi-hop dependents, and its connecting conduits are highlighted, while unrelated elements dim cleanly into the nocturnal background.
3. **Underlying Metric Encoding**: When no file is selected, or for unaffected elements, buildings display their true metric color (`colorMode`: Risk, Complexity, Churn, Age, Impact).
4. **Hover Accent**: Adds a gentle luminance lift ($+0.35$ Lightness offset) and a vertical spring lift ($+0.4\text{m}$) without mutating store selection.

---

## 3. Building Hover & Selection System

### A. Hover Dynamics
- **Building Response**:
  - Building elevates $+0.4\text{m}$ with a physics spring.
  - Facade edges sharpen with an emissive boost.
  - Hover audio tick plays via `soundFx.playHoverTick()`.
- **Tooltip HUD**:
  - Concise glass pill positioned at screen bottom, displaying filename, archetype, risk percentage, LOC, complexity, and impact.
  - Seamlessly tracks hovered state and disappears on `pointerout`.
- **Bidirectional Sync**:
  - Hovering a card in `LeftPanel` highlights the building in the 3D scene.
  - Hovering a 3D building highlights the card in `LeftPanel`.

### B. Selection Dynamics
- **Building Response**:
  - Origin building glows in vivid cyan (or crimson if risk $\ge 50\%$).
  - Ground reticle and holographic column appear below the structure (`SelectionMarker.tsx`).
  - Left panel scrolls to and highlights the active file card.
  - Right diagnostic drawer opens with detailed breakdown (SHAP factors, line failures, single-developer risk).
- **Camera Focus**:
  - Smooth 620ms cubic-eased camera glide centering the target building while accounting for the ~320px left HUD drawer offset.
- **Selection Clearing**:
  - Clicking empty canvas space (`onPointerMissed`), pressing `Escape`, or clicking the close button in the drawer smoothly clears selection and returns the camera to the repository overview.

---

## 4. Multi-Wave Blast Radius Visualization

When a building is selected, or when "Show Blast Radius" is clicked:

### A. Shockwave Ring
- A luminous expanding cyan/crimson ring deploys from the building's ground base ($R: 1.0\text{m} \to 25.0\text{m}$, duration 1.6s).
- Fades out smoothly as it reaches repository boundaries.

### B. Staggered Multi-Wave Dependent Highlighting
Dependents are highlighted in discrete temporal waves based on dependency hop distance:
1. **Wave 1 (Direct Dependents, Hop 1)**:
   - Color: **Sky Cyan** (`#38bdf8`) / Amber warning.
   - Timing: Immediate ($t = 0\text{ms}$).
   - Conduits: Bright soaring parabolic arcs with high-speed data packets.
2. **Wave 2 (Indirect Dependents, Hop 2)**:
   - Color: **Electric Violet** (`#c084fc`).
   - Timing: Delayed by $250\text{ms}$.
   - Conduits: Arcs connecting Hop 1 to Hop 2 nodes illuminate with violet data packets.
3. **Wave 3 (Transitive Dependents, Hop 3)**:
   - Color: **Rose Crimson** (`#fb7185`).
   - Timing: Delayed by $500\text{ms}$.
   - Conduits: Extended reach with lower particle density.

### C. Unrelated Element Attenuation
- Unrelated buildings lerp $90\%$ towards deep midnight obsidian (`#030712`).
- Unrelated skybridges dim to $0.08$ opacity.
- Preserves high contrast and eliminates visual clutter.

---

## 5. Cascading Failure Simulation System

Connecting the 3D scene directly to the backend failure analysis engine (`POST /api/simulate-failure`):

### A. Activation Triggers
- Radial Context Menu: "Simulate Failure"
- Dependency Graph Modal: "Simulate Cascade Wave"
- Insights Dock: "Run Cascade Simulation"
- Traceback Analyzer: Crash reproduction

### B. Visual Propagation Sequence
1. **Failed Origin**:
   - Pulses with a red strobe alarm ring and vertical hazard beacon.
   - Ground reticle turns bright crimson with flashing hazard markings.
2. **Cascade Waves**:
   - Direct callers fail first, turning glowing amber-red.
   - Indirect dependents follow sequentially with traveling shockwave packets.
3. **Interactive Simulation HUD**:
   - Fixed top-center holographic glass banner:
     - Shows failed file name, total affected dependents, and at-risk automated tests.
     - Includes a prominent "Exit Simulation [Esc]" button to immediately restore the city.
4. **Zero Destructive Side Effects**:
   - Purely a visualization of calculated AST failure propagation; repository files are untouched.

---

## 6. Living Dependency Skybridges

### A. Directed Flow & Conduit Arcs
- **Upward Parabolic Elevation**:
  $$\text{midPoint.y} = \max(p_1.y, p_2.y) + \min(7.5, 2.2 + \text{dist} \times 0.20)$$
  Ensures skybridges soar above building crowns.
- **Directional Energy Packets**:
  Holographic light beads travel along the curve from dependency provider to consumer, indicating call direction.
- **Distance-Aware Opacity**:
  Conduits beyond $90\text{m}$ smoothly attenuate opacity, preventing distant clutter.

---

## 7. Bidirectional 3D City & Dependency Graph Modal Integration

- **Graph to 3D Navigation**:
  Clicking any module inside `DependencyGraphModal` sets `selectedFile`, centers the camera in the 3D canvas, highlights its 3D skybridges, and synchronizes the diagnostic drawer.
- **External Dependencies & Stdlib**:
  External libraries (e.g. `pytest`, `requests`, `sqlalchemy`, `os`) that are imported but are not repository files are grouped in a dedicated "External Packages (Stdlib / Third-Party)" section with a non-interactive badge, preventing fake 3D building creation.

---

## 8. Performance & Accessibility Guarantees

- **FPS Target**: $\ge 55$ FPS on all repositories (145 FPS measured on Flask).
- **Reduced Motion (`prefers-reduced-motion`)**:
  - Bypasses camera fly-to animations with immediate positioning.
  - Replaces animated particle flows with static illuminated conduits.
- **Low-Power Mode**:
  - Limits particles to 1 per conduit.
  - Drops postprocessing bloom and heavy shaders.
- **Keyboard Shortcuts**:
  - `Escape`: Deselect building / Exit simulation / Close modals.
  - `1..5`: Switch color modes.
  - `P`: Toggle Presentation Mode.
  - `F`: Focus search bar.
  - `Ctrl/Cmd + K`: Open Command Palette.
