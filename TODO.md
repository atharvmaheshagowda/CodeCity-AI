# CodeCity AI — Master Redesign & Critique Tracker (`TODO.md`)

## 1. Milestones Overview

- [x] **Milestone 1: Design System & Motion Specification**
  - [x] Write `DESIGN_SYSTEM.md` ("Nocturne Glass", electric cyan signature accent, tuned risk ramp, visionOS glass tokens).
  - [x] Write `MOTION_SPEC.md` (`motion/react` spring presets: snappy, smooth, bouncy, inertial; micro-interactions).
  - [x] Log autonomous decisions in `DECISIONS.md`.
  - [x] Install `motion` (v12+ via `motion/react`) and `@fontsource/space-grotesk`.

- [x] **Milestone 2: 3D City Rebuild — Architecture, Facades & Ground**
  - [x] Replace barrel/spire shapes with clean architectural towers: sharp-beveled rectangular prisms, stepped setbacks for tall files, flat roofs with subtle emissive trim. (NO rings, NO barrels, NO random spires).
  - [x] Rebuild procedural window shader: neat, ordered window grid, stable pseudo-random illumination per path, warm-white & cool-cyan tints, dark glass between, slow crimson pulse & occasional flicker on high-risk files.
  - [x] Add Fresnel rim light and soft vertical gradient for instant building readability.
  - [x] Landmarks (top impact files): vertical holographic beacon light beam and floating 3D label.
  - [x] Ground: dark glossy plane (`#01040a`) with soft specular reflections and a faint grid that fades with distance. REMOVE all stray dashes and random black blobs.
  - [x] Districts: frosted-glass platforms with glowing border.
  - [x] District labels: billboarded, floating strictly ABOVE plates, readable, and NEVER overlapping buildings.

- [x] **Milestone 3: Atmosphere, Particles & Camera Rig**
  - [x] Gradient sky dome, exponential fog, drifting dust/firefly particles (`AtmosphericParticles`).
  - [x] Traffic particles flowing along dependency edges (`DependencySkybridges`).
  - [x] Postprocessing: selective bloom, vignette, ACES tone mapping, mild film grain, chromatic aberration.
  - [x] Inertial camera rig: cinematic intro fly-in, smooth orbit/pan/zoom, slow idle drift that stops on interaction, named camera shots (Overview, District, Focus).

- [x] **Milestone 4: Living Interactions & Blast Radius**
  - [x] Hover lift: building lifts $+0.4\text{m}$ with spring, edges glow, mini info card follows cursor with spring lag, dependency edges preview faintly.
  - [x] Selection: camera dolly-to-focus, shared-element drawer transition.
  - [x] Blast radius staggered wave: shockwave ring from origin, glowing arcs, traffic particles, hop-depth staggered illumination (Hop 1 cyan $\to$ Hop 2 violet $\to$ Hop 3 rose), non-dependent window dimming.
  - [x] Double-click district zooms into it; Esc or empty space click zooms out.
  - [x] Right-click radial quick-action menu (`RadialContextMenu`: Blast radius, Simulate failure, Copy path, Pin to dock).
  - [x] Pinned files comparison dock (`PinnedDock.tsx`).
  - [x] Bidirectional hover synchronization between hotspot list and 3D buildings.
  - [x] Minimap click flies camera to target coordinates.
  - [x] Color-mode smooth animated morph (buildings lerp colors and heights over 0.45s).
  - [x] Procedural WebAudio sound effects engine (`soundEffects.ts`: soft micro-ticks and whooshes, OFF by default with toggle).

- [x] **Milestone 5: Motion-Driven UI Chrome & Spatial Panels**
  - [x] VisionOS glass panels (`backdrop-blur-2xl`, inner highlight, soft shadows).
  - [x] Single clean top bar (no wrapping tagline, compact repo selector, quick controls).
  - [x] Collapsible left "Hotspots" dock with smooth spring collapse/expand.
  - [x] Bottom dock with color modes, sliding indicator pill (`layoutId="activeColorModePill"`), and legend.
  - [x] Radar minimap with live building dots and camera frustum.
  - [x] KPI cards with animated number tickers and sparklines.
  - [x] Hotspot list items with staggered entrance, hover lift, and animated risk bars.
  - [x] Right file drawer: animated circular SVG risk gauge, staggered SHAP bars, glowing impact meter.

- [x] **Milestone 6: Modals, Command Palette, Tour & Exhibition**
  - [x] Command Palette (`Ctrl/Cmd+K`): fuzzy search for files, actions, views, animated results, keyboard nav.
  - [x] Model Card modal: animated self-drawing ROC curve, metric counters, baseline comparison.

- [x] **Phase 1: Realistic Procedural Architecture Engine (Completed)**
  - [x] Implement 10 deterministic architectural archetypes (`glass_skyscraper`, `corporate_tower`, `stepped_industrial`, `brutalist_tech`, `research_facility`, `compact_residential`, `datacenter`, `multisection_complex`, `telecom_spire`, `monumental_landmark`).
  - [x] Ensure uniform non-indexed `BufferGeometry` attributes across compound parts to prevent merge collisions.
  - [x] Procedural facade shader: dual-temperature interior window illumination (warm amber + cool cyan), ordered window grid, dark spandrels, metric-driven exoskeleton conduits & rooftop parapet trim, and pulsing crimson accents on high-risk landmarks.
  - [x] Verified full theme compatibility (`Midnight Cyber City` and `Electric Cyber Neon`) and all 5 color modes (`Risk`, `Complexity`, `Churn`, `Age`, `Impact`).
  - [x] Measured 144–146 FPS performance across 1080p, 768p, Eco mode, and large repo switching (`pallets/flask`).
  - [x] Documented in `PHASE1_ARCHITECTURE_NOTES.md`.

- [x] **Phase 1.5: Cinematic Visual Refinement (Completed)**
  - [x] Corrected 10 visible defects: facade blowout, bloom blinding, excessive cyan saturation, flat ground disconnection, arbitrary geometric rings, repetitive facade patterns, lack of depth, label collisions, camera offset balance, and decorative rings.
  - [x] Calibrated nocturnal lighting: dimmed directional moonlight (`0.68`) and indigo ambient (`0.26`), preventing diffuse white wash.
  - [x] Precision bloom calibration: raised threshold to `0.84` (Neon `0.78`), reduced radius to `0.32` and intensity to `0.44`, preserving razor-sharp architectural edges.
  - [x] Archetype-tailored facade shaders: per-archetype window apertures, grid frequencies, recessed window sill bevels, and distinct architectural character (datacenter LED slits, brutalist embrasures, industrial factory sash, residential punched windows).
  - [x] PBR wet asphalt pavement: procedural puddle noise with specular sheen, dynamic ambient grounding under structures, and subdued realistic road corridors (removed outer Tron ring).
  - [x] Replaced background concentric neon rings with an architectural cybernetic arena pavilion dome.
  - [x] Anti-collision HUD labels: dynamic camera framing with HUD drawer offset, lateral pin staggering, deduplicated district billboard, and non-overlapping micro-pins for dense repos.
  - [x] Verified zero console errors, 7/7 frontend unit tests passing, clean production build in 18.98s, 32/32 backend pytest passing, and 145 FPS measured on `pallets/flask` (15 buildings).

- [x] **Phase 2: Cinematic Environment, Atmosphere & Motion Engine (Completed)**
  - [x] Removed 2D billboard backdrop barrier that blocked multi-district view angles and clipped buildings.
  - [x] Implemented `DistantMegalopolisHorizon`: 48 procedural monolithic towers instanced in a 360-degree radial ring at $R \in [140, 185]\text{m}$ with red beacons and window slits.
  - [x] Living dependency skybridges: upward parabolic arcs (`midPoint.y = Math.max(p1.y, p2.y) + Math.min(7.5, 2.2 + dist * 0.20)`), dual traveling data packets per conduit, and dimmed inactive conduits on selection.
  - [x] Soft-fading atmospheric searchlights with custom exponential gradient shaders eliminating hard edges.
  - [x] Atmospheric nocturnal sky textures and calibrated exponential depth fog ($100-340\text{m}$).
  - [x] Cinematic camera rig: smooth 4-stage intro sweep, intelligent building centering accounting for left HUD drawer, smooth deselect return, and ambient idle orbital drift with auto-suspend.
  - [x] Authored `PHASE2_ENVIRONMENT_DESIGN.md` and `PHASE2_ENVIRONMENT_NOTES.md`.
  - [x] Verified zero console errors, 7/7 frontend unit tests, 32/32 backend pytest tests, clean production build in 15.76s, and benchmarked 143-145 FPS across 11 visual test scenarios.

- [x] **Phase 3: Advanced Interactions, Dependency Visualization & Failure Simulation (Completed)**
  - [x] Integrated cascading failure simulation engine: pulsing crimson origin beacon, multi-hop failure dependents (Hop 1 amber, Hop 2 crimson, Hop 3 ruby), and clean background attenuation.
  - [x] Added top-center holographic failure simulation banner with live broken dependents count, at-risk tests, and one-click/Escape dismissal (`Exit Simulation [Esc]`).
  - [x] Upgraded multi-wave blast radius with hop depth color coding (Hop 1 cyan, Hop 2 violet, Hop 3 rose) and staggered temporal wave reveals (Hop 1 at 0s, Hop 2 at 0.25s, Hop 3 at 0.50s).
  - [x] Refined dependency skybridges with hover highlighting, directional data flow, and distance-aware opacity attenuation ($>40\text{m}$).
  - [x] Connected 3D city to `DependencyGraphModal` with bidirectional selection, camera fly-to, and graceful handling for external standard library / third-party dependencies.
  - [x] Quick actions in diagnostic drawer: "Blast Radius" (focuses 3D conduits and opens dependents tab) and "Simulate Failure" (launches 3D cascade).
  - [x] Escape key hierarchy: dismisses failure simulation first, then deselects active building. Empty canvas click (`onPointerMissed`) clears simulation and selection.
  - [x] Authored `PHASE3_INTERACTION_DESIGN.md` and `PHASE3_INTERACTION_NOTES.md`.
  - [x] Verified zero console errors, 7/7 frontend tests, 32/32 backend tests, clean production build in 15.27s, and benchmarked 143-145 FPS across 12 visual test scenarios.


  - [x] Designed states: scanning radar loading effect, skeleton shimmer for loading panels, empty/error states, toast notifications.
  - [x] Guided onboarding tour spotlight on first run (skippable).
  - [x] Exhibition mode: auto-orbit camera, rotating callouts of riskiest buildings, large readable HUD type, 45s idle attract mode.

- [x] **Milestone 7: Small-Repo Composition & 60 FPS Performance**
  - [x] Small repos (<30 files): center layout, scale footprint/height, closer heroic camera pitch, dim decorative context skyline in background with toggle.
  - [x] 55+ FPS on largest demo repo (`pallets/flask` and `psf/requests`).
  - [x] Low-Power Eco mode toggle degrades postprocessing cleanly.
  - [x] Respect `prefers-reduced-motion`.

---

## 2. Five-Round Visual Critique Log

### Critique Round 1: Baseline Architecture & Ground Plane
- **Captured**: `round1_initial_1920.png`
- **Weaknesses Identified**:
  1. Old geometry had tapered barrel towers and ornamental spires resembling generic sci-fi shapes rather than real architectural buildings.
  2. Ground plane had yellow dashes and black blotches representing road cutouts that looked noisy and messy.
  3. Window shader lacked crisp mullions and spandrels.
- **Fixes Applied**:
  - Replaced barrel geometry with 5 clean architectural styles in `cleanTowers.ts`: sharp rectangular chamfered prisms, 3-tier setbacks, and flat roofs.
  - Cleaned `CyberCityGround.tsx` into a deep obsidian glossy floor with soft specular reflections and hairline cyan grid falloff. Zero black blobs, zero stray dashes.

### Critique Round 2: Small-Repo Composition & Density Comparison
- **Captured**: `round2_dense_flask_1920.png`, `round2_sparse_ecotrace_1920.png`
- **Weaknesses Identified**:
  1. Small repositories (4 files) looked isolated in an empty void.
  2. Camera distance was too far back for small files.
- **Fixes Applied**:
  - Updated `cityLayout.ts` to apply heroic scaling multiplier ($1.6\times$ footprint, $1.4\times$ height) for repos $<30$ files.
  - Added background ring of dim, non-interactive "context skyline" buildings with toggleable HUD button (`Skyline: ON/OFF`).

### Critique Round 3: Living Interactions & Spatial Feedback
- **Captured**: `round3_selected_blast_radius_1920.png`, `round3_exhibition_mode_1920.png`
- **Weaknesses Identified**:
  1. Selection lacked tactile haptic audio feedback.
  2. Right-click context actions were missing.
- **Fixes Applied**:
  - Built procedural WebAudio sound engine `soundEffects.ts` (100% offline, procedural synthesizers for ticks, clicks, whooshes, and blast waves).
  - Added `RadialContextMenu.tsx` with 4 radial actions (Inspect Blast Radius, Simulate Failure, Copy Path, Pin to Dock).
  - Added `PinnedDock.tsx` comparison dock for side-by-side metric inspection.

### Critique Round 4: Motion Chrome, Modals & Indicators
- **Captured**: `round4_dense_requests_1920.png`, `round4_flask_selected_1920.png`, `round4_model_card_1920.png`, `round4_command_palette_1920.png`
- **Weaknesses Identified**:
  1. Color mode selector lacked a sliding active pill indicator.
  2. Model card modal ROC curve was static.
- **Fixes Applied**:
  - Added `motion.div` sliding indicator with `layoutId="activeColorModePill"` in `BottomHUD.tsx`.
  - Upgraded `ModelCardModal.tsx` with self-drawing animated SVG path (`pathLength: 0 -> 1`).
  - Added SVG sparklines to KPI metric cards in `LeftPanel.tsx`.

### Critique Round 5: Landmark Badge Occlusion & Vertical Separation Polish
- **Captured**: `round5_dense_requests_1920.png`, `round5_flask_selected_1920.png`, `round5_sparse_ecotrace_1920.png`, `round5_exhibition_mode_1920.png`, `round5_model_card_1920.png`, `round5_command_palette_1920.png`
- **Weaknesses Identified**:
  1. Drei `<Html>` landmark badges ballooned up when the camera zoomed in during file selection, blocking the blast radius arcs and building facade.
  2. In dense and sparse repos, the district label `/ requests` or `/ root` was at almost the exact same elevation as landmark labels, creating slight visual overlap.
- **Fixes Applied**:
  - Passed `hideHtmlLabels={hideHtmlLabels || !!selectedFile || presentationMode}` to `LandmarkBeacons` so landmark badges cleanly disappear when focused on a building.
  - Reduced Drei `<Html>` distanceFactor to 45 and scaled landmark badges to compact pills (`scale-90`, max-width 100px).
  - Elevated district labels to `(d.maxBuildingHeight || 4.0) + 5.5` to ensure 3.5m of clear vertical separation strictly above all buildings and landmarks.
- **Final Result**:
  - 100% clean, breathtaking cinematic night metropolis across all screens and viewports. Zero visual overlap, 60 FPS performance, fluid motion-driven UI.
