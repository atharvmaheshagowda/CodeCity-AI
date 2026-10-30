# CodeCity AI — Miniature Cyber-Metropolis Master Tracker (`TODO.md`)

## 1. Milestones

- [x] **Milestone 1: 10 Procedural Architectural Archetypes & Facade Shader**
  - [x] Implement 10 distinct, sharp modern architectural archetypes using merged compound `BufferGeometry`:
    1. `glass_skyscraper`: Slender tower with ground lobby, chamfered setbacks, and roof penthouse.
    2. `corporate_tower`: 3-tier stepped setbacks with HVAC mechanical chillers.
    3. `stepped_industrial`: Stepped terraces, cooling towers, ventilation housings, exterior pilasters.
    4. `datacenter`: Armored vault structure with vertical heat-sink louvers/cooling fins and 4-fan chiller array.
    5. `research_facility`: Central tower with cantilevered laboratory pods and observation dome.
    6. `compact_residential`: Staggered setbacks with rooftop terraces and elevator bulkhead.
    7. `brutalist_tech`: Heavy reinforced pilasters, recessed horizontal window slits, cantilevered overhanging floors.
    8. `multisection_complex`: Twin-tower connected complex with skyway conduit.
    9. `telecom_spire`: Podium base, slender communications mast with microwave transmission dishes.
    10. `monumental_landmark`: Flagship monumental stepped skyscraper with crown deck and vertical cyan beacon.
  - [x] Custom procedural facade shader with dual-temperature lighting (warm golden windows + cool cyan workstation lighting), dark tinted glass, structural mullions, subtle flicker, crimson pulse on high risk, Fresnel rim lighting, and vertical gradient.

- [x] **Milestone 2: City Environment, Ground, Illuminated Pathways & Environmental Details**
  - [x] Deep midnight-navy wet reflective ground plane (`CyberCityGround.tsx`) with subtle procedural roughness, puddles, and cyan illuminated road/circuit lines.
  - [x] Create `EnvironmentalDetails.tsx`: Small decorative industrial structures, electrical transformer cabinets, miniature streetlights with soft cyan light pools, and communication masts at district edges.
  - [x] Frosted-glass district plates with glowing borders and billboarded labels floating with clean vertical separation (3.5m+ clearance above building crowns).
  - [x] Atmospheric depth: Exponential fog, distant context skyline silhouettes, glowing drifting dust/firefly particles, and volumetric searchlights.

- [x] **Milestone 3: Cyan Dependency Pathways, Isometric Camera Rig & Living Interactions**
  - [x] Realistic AST dependency pathways (`DependencySkybridges.tsx`) with glowing connection nodes and animated cyan data particles streaming along conduits.
  - [x] Elevated isometric camera framing (narrower FOV 34°, angled diorama vantage point `[46, 52, 46]`) with damped inertial orbit controls and smooth fly-to focusing.
  - [x] Interactive hover spring lift ($+0.4\text{m}$), cursor-following spring lag card, right-click radial quick-action menu, double-click district zoom, and signature blast-radius shockwave + parabolic arcs.

- [x] **Milestone 4: Motion-Driven UI Chrome & Spatial Panels**
  - [x] Compact single-row top navigation bar with brand badge, repository selector, `⌘K` command palette trigger, camera reset, WebAudio toggle, Eco mode toggle, Exhibition mode toggle, and Model Card button.
  - [x] Floating collapsible left panel (280px) with animated SVG sparklines on KPI cards, scanner, and ranked hotspots with bidirectional 3D hover sync.
  - [x] Slide-in right drawer with animated circular risk gauge, plain-English SHAP explanation, feature contribution bars, and blast radius trajectory drilldown.
  - [x] Bottom HUD with real-time 2D radar minimap, sliding mode pills (`layoutId="activeColorModePill"`), and skyline toggle.
  - [x] Pinned comparison dock, self-drawing animated SVG ROC curve in Model Card modal, and Command Palette.

- [x] **Milestone 5: Motion Polish, Procedural WebAudio & Exhibition Mode**
  - [x] 100% offline WebAudio sound synthesizer for micro-ticks, clicks, whooshes, and blast waves.
  - [x] Exhibition mode with automatic camera orbit, rotating hotspot showcase, large projector typography, and 45-second inactivity attract restart.

- [x] **Milestone 6: Performance Optimization, Testing & 5-Round Screenshot Critique Loop**
  - [x] 60+ FPS performance via InstancedMesh batching, shared geometries, and procedural shaders.
  - [x] Comprehensive testing: pytest backend suites (11/11 passed), vitest frontend tests (3/3 passed), TypeScript typecheck (0 errors), and production build (`tsc -b && vite build` built cleanly).
  - [x] 5-Round Screenshot Critique Loop across 1920×1080 and 1366×768 on dense (`flask`, `requests`) and sparse (`ecotrace-ai`) repositories.
  - [x] Updated documentation in `README.md` and `DECISIONS.md`.
