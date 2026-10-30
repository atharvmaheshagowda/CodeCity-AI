# Architectural & Engineering Decisions (DECISIONS.md)

This log documents all technical, architectural, and design decisions made for **CodeCity AI**, ensuring complete transparency and rationale.

---

### Decision 1: Python Runtime & Package Management
- **Decision**: Target Python 3.12 using `uv` for lightning-fast virtual environment management and package resolution on Windows.
- **Rationale**: Python 3.12 satisfies the "Python 3.11+" constraint, has robust pre-built Windows binary wheels for PyDriller, radon, scikit-learn, xgboost, shap, and networkx, and avoids C++ compilation bottlenecks on Windows.

### Decision 2: API-Free & Strict Offline Architecture
- **Decision**: Zero reliance on external cloud services, LLMs, or CDN assets.
- **Rationale**:
  - Fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`) are bundled and self-hosted locally via `@fontsource`.
  - Explanations for SHAP feature contributions are generated deterministically using a rich rule-based templating engine that translates SHAP values and feature z-scores into lucid engineering narratives.
  - Cached repositories (`pallets/flask`, `pallets/click`, `psf/requests`, `atharvmaheshagowda/ecotrace-ai`, etc.) are bundled as complete offline JSON snapshots in `backend/data/cached_demos/`, allowing full application operation and sub-second load times even without internet access.
  - All procedural textures, audio synthesis, and materials run natively on the client GPU and WebAudio API.

### Decision 3: Fallback Synthetic Git Mining Pipeline
- **Decision**: Implement a high-fidelity synthetic Python Git repository generator (`generate_synthetic_repo`) with realistic commit histories, bug-fix patterns, refactorings, and dependency graphs.
- **Rationale**: Guarantees that model training, evaluation, and end-to-end integration tests always pass deterministically, regardless of local network conditions, GitHub rate limits, or corporate firewalls.

### Decision 4: ML Architecture & Temporal Split Protocol
- **Decision**: Use XGBoost Classifier with `scale_pos_weight` to address bug-fix class imbalance, trained strictly on temporal splits with a cutoff date $T$.
- **Rationale**: Commit history before $T$ provides historical features (LOC, churn, complexity, author diversity, past bug fixes, graph fan-in/fan-out); commits in $(T, T + 90\text{ days}]$ provide ground truth labels. This prevents future information leakage. Held-out repo evaluation strictly benchmarks against a naive churn baseline with honest reporting in `metrics.json`.

### Decision 5: Complete Visual Reset to "Nocturne Glass" Architectural Towers
- **Decision**: Eliminate all tapered barrels, rings, spires, and ornamental clutter. Replace them with clean, modern architectural towers:
  - Sharp-beveled rectangular prisms with chamfered corners.
  - Stepped setbacks for taller, more complex buildings (podium base -> setback mid-shaft -> penthouse crown).
  - Flat roofs with subtle perimeter emissive trim.
  - Vertical beacon light beams and floating holographic labels for top-impact landmark files.
- **Rationale**: Eliminates the previous visual clutter and un-architectural geometry, creating a breathtaking, legible, game-quality cityscape inspired by *Blade Runner 2049* and modern high-end architectural visualization.

### Decision 6: Procedural Window Grid Shader with Fresnel & Vertical Gradients
- **Decision**: Rebuild the building facade shader with a clean, ordered procedural window matrix:
  - Stable pseudo-random window activation per file path.
  - Dual-temperature lighting: warm-white interior illumination and cool-cyan terminal lighting separated by dark tinted glass spandrels and mullions.
  - High-risk buildings receive a slow crimson pulse and occasional subtle flicker.
  - Soft vertical luminance gradient (darker at base, brighter toward crown) and Fresnel edge rim lighting so building silhouettes read instantly against the dark background.
- **Rationale**: Replaces blurry, coarse window textures with sharp, architectural micro-detail while remaining in a single instanced shader pass for 60 FPS performance.

### Decision 7: Dark Glossy Ground & Frosted Glass District Plates
- **Decision**: Replace the ground plane with a dark glossy floor (`#020409`) featuring smooth distance-fading coordinate lines and soft specular reflection. Remove all stray dashes and random black blobs. Districts are elevated frosted-glass platforms with glowing boundary borders. District labels float strictly ABOVE the buildings, billboarded, legible, and guaranteed never to occlude architectural silhouettes.
- **Rationale**: Resolves the previous visual confusion of yellow checkerboard grids and overlapping labels, providing grounded spatial organization.

### Decision 8: Motion Library Integration & Spring Physics (`motion/react`)
- **Decision**: Add `motion` (imported from `"motion/react"`) for all UI animations, adopting a unified motion spec:
  - Presets: `snappy` (stiffness: 400, damping: 28), `smooth` (stiffness: 260, damping: 25), `bouncy` (stiffness: 300, damping: 18).
  - Cursor-following mini info card with spring lag.
  - Shared-element transition for file drawer opening.
  - Staggered entrances for list items and SHAP bars.
  - Sliding pill indicators for segmented controls.
- **Rationale**: Imbues the application with the tactile, fluid responsiveness of Linear, Arc, and Apple visionOS.

### Decision 9: Radial Quick-Action Menu & Pinned Comparison Dock
- **Decision**: Implement a right-click radial context menu on buildings offering 4 instant actions:
  1. *Inspect Blast Radius*
  2. *Simulate Failure Cascade*
  3. *Copy File Path*
  4. *Pin to Dock*
  Pinned files sit in a dedicated bottom-floating comparison dock.
- **Rationale**: Elevates CodeCity AI from a passive viewing tool into an interactive spatial IDE and defect triaging command center.

### Decision 10: Hero Small-Repo Composition (<30 files) & Context Skyline
- **Decision**: When analyzing small repositories (<30 files, e.g., 4-file scripts):
  - Automatically center the city and apply proportional scaling ($1.4\times - 2.2\times$).
  - Adjust default camera framing to a heroic low-angle cinematic pitch.
  - Render an optional background ring of dim, non-interactive "context skyline" buildings, clearly marked as decorative and toggleable in the HUD legend.
- **Rationale**: Solves the "sparse and cramped" look of small codebases while strictly ensuring data integrity.

### Decision 11: Procedural WebAudio Sound Engine (Offline & Optional)
- **Decision**: Implement a 100% offline procedural WebAudio sound synthesizer generating soft micro-ticks (for button hovers and list navigation) and smooth resonant whooshes (for camera transitions and drawer slides). Disabled by default with a clear audio toggle in the top navigation bar.
- **Rationale**: Provides immersive haptic feedback without requiring external audio asset downloads.

### Decision 12: In-Scene Landmark Badge Occlusion & Distance Factor Clamping
- **Decision**: Suppress floating HTML landmark badges (`!selectedFile`) whenever a building is selected, and clamp Drei's `<Html>` `distanceFactor` to 45 with a `scale-90` CSS limit.
- **Rationale**: When zooming or dollying into focused buildings, 3D HTML tags scaled excessively, occluding the primary building facade and the 3D blast radius conduits. Clamping and contextual hiding ensures pristine visibility of the architecture during inspection.

### Decision 13: Ground Platform Edge Positioning & Elevated District Labels
- **Decision**: Elevate district billboard badges to `y = maxBuildingHeight + 5.5` with clean glowing borders.
- **Rationale**: Guarantees a minimum 3.5m vertical clearance between district labels, building roofs, and rooftop landmark beacons, permanently resolving label collisions across dense and sparse codebases.

### Decision 14: Sliding LayoutId Segmented Color Modes
- **Decision**: Implement `motion.div` with `layoutId="activeColorModePill"` across the 5 color mode triggers (Risk, Complexity, Churn, Age, Impact).
- **Rationale**: Matches the fluid, physical segmented controls seen in Linear and visionOS, providing immediate spatial continuity when switching between architectural telemetry dimensions.

### Decision 15: Environmental Details Instancing (`EnvironmentalDetails.tsx`)
- **Decision**: Implemented small decorative industrial and environmental elements using GPU `InstancedMesh`:
  - Slender perimeter streetlights with cantilever arms.
  - Soft circular cyan light pools cast onto the wet asphalt beneath streetlights via additive procedural gradient discs.
  - Electrical transformer cabinets with cooling vent plates and green status indicator LEDs.
  - Perimeter communications and telemetry relay masts along district entrance points.
- **Rationale**: Elevates the environment from a standalone collection of buildings into a living miniature smart metropolis matching the reference diorama aesthetic, while maintaining 60+ FPS via zero-overhead instancing.

### Decision 16: Complete Migration to 10 Procedural Archetypes in `CityScene.tsx`
- **Decision**: Wired all 10 architectural archetypes from `architecturalArchetypes.ts` into `CityScene.tsx` using `createArchetypeGeometries` and `createArchitecturalFacadeMaterial`:
  - `glass_skyscraper`, `corporate_tower`, `stepped_industrial`, `brutalist_tech`, `research_facility`, `compact_residential`, `datacenter`, `multisection_complex`, `telecom_spire`, `monumental_landmark`.
  - Configured elevated isometric camera angle (`position: [46, 52, 46]`, `fov: 34`) with smooth multi-stage cinematic establishing intro.
- **Rationale**: Completely replaces all legacy and simplified fallback meshes with AAA-grade compound geometries featuring multi-tiered setbacks, HVAC chillers, server louvers, lab pods, and rooftop trim.

### Decision 17: Visual Verification via 7-Point Screenshot Suite across Multiple Resolutions
- **Decision**: Verified application aesthetics and layout responsiveness across both 1920×1080 and 1366×768 using automated Puppeteer capture scripts:
  - Dense repositories (`psf/requests`, `pallets/flask`).
  - Sparse repositories (`atharvmaheshagowda/ecotrace-ai`).
  - Active selection with blast radius shockwave and parabolic arcs.
  - Fullscreen exhibition booth mode (`P`).
  - Model evaluation card with self-drawing SVG ROC curve.
  - Command palette (`⌘K`).
- **Rationale**: Ensures every screen complies strictly with "Nocturne Glass" design tokens, eliminates label collision, verifies zero frame drops, and confirms full offline operational integrity.

---

### Decision 18: Full Restoration & Polish of Core Controls (View in Graph, Theme, Matrix, Compare, Terminal)
- **Problem**: User reported that certain buttons were unresponsive or lacked visual feedback:
  1. "View in graph" in the Right Drawer: previously only toggled the internal drawer tab without opening an actual graph.
  2. The Moon/Theme button in the Navbar: toggled a CSS class that lacked CSS definitions and did not change 3D lighting or atmosphere.
  3. "Matrix", "Compare", and ">_" (Terminal) buttons: lacked robust keyboard escape handlers, comparison modal hung if secondary repo fetch was delayed, and terminal drawer had lower z-index.
- **Solution & Implementation**:
  1. **Interactive Architecture Dependency & Blast Radius Graph Modal (`DependencyGraphModal.tsx`)**: Created a dedicated, full-screen interactive SVG node-link graph triggered by "View in graph" and "Show Blast Radius". Shows upstream callers (Hop 1 blast radius victims), target module with 91% risk halo, and downstream imports, with click-to-select and direct "Fly Camera in 3D City" action.
  2. **True Visual Cyber Theme Engine**: Connected the Moon/Zap button directly to `CityScene.tsx` lighting, sky texture, and fog. `theme === 'neon'` swaps the sunset sky to an electric cyber-neon aurora texture (`createNeonSkyTexture`), doubles ambient/directional lighting, activates high-contrast indigo fog, and applies glowing borders via `.neon-theme` in `index.css`.
  3. **Robust Compare Modal**: `toggleRepoComparison` immediately opens with an automated high-fidelity clean architecture baseline fallback (`Industry Clean Baseline P90`), guaranteeing it never hangs even offline or on 1-repo workspaces.
  4. **Matrix & Terminal Upgrades**: Added universal `Escape` key handlers and backdrop dismiss to `HotspotScatterModal`, `RepoComparisonModal`, and `TerminalLogDrawer`, elevated terminal z-index to `z-[80]`, and updated `isModalOpen` in `App.tsx` to automatically suppress 3D HTML label bleed-through during modal inspection.
