# CodeCity AI — Phase 2: Cinematic Environment & Atmosphere Design System (`PHASE2_ENVIRONMENT_DESIGN.md`)

## 1. Vision & Architectural Philosophy

Phase 2 engineers an atmospheric, living nocturnal cyberpunk environment around the CodeCity AI repository metropolis. Rather than treating the 3D ground and atmosphere as a flat empty stage, Phase 2 implements a coherent real-time world system:
- **Atmospheric Depth**: Exponential night fog transitioning seamlessly into a procedural gradient sky dome with distant, low-poly procedural megalopolis silhouettes positioned far beyond repository bounds.
- **Wet Asphalt Urban Ground**: Micro-puddle specular variation, subtle lane markings, and ambient contact grounding beneath buildings and district platforms.
- **Urban Lighting & Street Infrastructure**: Instanced futuristic streetlights with soft ground-light pools, telemetry junction boxes, and low-cost volumetric atmospheric searchlight sweeps.
- **Living Dependency Conduits**: Smooth luminous bezier skybridges with flowing energy packets and particle trails reflecting real import relationships and blast radius contagion.
- **Cinematic Camera Rig**: Gentle idle drift with automatic damping upon user interaction or selection, smooth dolly framing, and skippable intro fly-in.
- **100% Offline & Deterministic**: Zero external textures, zero CDN assets, zero remote HDRIs.

---

## 2. Design System Tokens & Parameters

### A. Environment Color Palette
| Token Name | Hex Code / Value | Usage & Meaning |
| :--- | :--- | :--- |
| `ENV_VOID_NAVY` | `#010308` | Horizon abyss, distant ground boundary, and void depth |
| `ENV_DEEP_INDIGO` | `#040916` | Twilight horizon base, midnight sky dome anchor |
| `ENV_ATMOS_TEAL` | `#082f49` | Mid-altitude atmospheric fog tint, nocturnal Rayleigh scatter |
| `ENV_NEON_VIOLET` | `#2e1065` | Electric Cyber Neon twilight horizon gradient accent |
| `INFRA_CYAN_CORE` | `#06b6d4` / `#38bdf8` | Technical infrastructure, road lane borders, telemetry nodes |
| `ENERGY_PACKET_CYAN` | `#22d3ee` | Active dependency packet pulses and data flow trajectories |
| `URBAN_AMBER_WARM` | `#f59e0b` / `#fbbf24` | Streetlight emitters, warm lobby reflections, residential spill |
| `CRITICAL_CRIMSON` | `#f43f5e` / `#ef4444` | High-risk building foundation wash and blast contagion waves |

### B. Atmospheric Fog & Sky Tokens
| Mode / Theme | Fog Near | Fog Far | Fog Color | Sky Zenith | Sky Horizon |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Midnight Cyber City** | 90m | 320m | `#040914` | `#010206` | `#07152d` (teal/navy twilight) |
| **Electric Cyber Neon** | 75m | 280m | `#070d24` | `#02040e` | `#170b3b` (violet/cyan twilight) |
| **Low-Power Mode** | 120m | 360m | `#02050c` | Flat `#02050c` | Flat `#02050c` |

### C. Ground & Urban Surface PBR Tokens
- **Asphalt Base**: `#02040a` PBR `MeshStandardMaterial` (`metalness: 0.85`, base `roughness: 0.35`).
- **Rain-Slick Puddles**: Procedural micro-noise in fragment shader reducing roughness to `0.08` in puddle depressions, creating realistic specular reflection of skybridges and building lights.
- **Urban Avenues**: Inter-district asphalt corridors with subdued cyan road edge markers (`intensity: 0.50`) and subtle coordinate reference lines (`intensity: 0.12`).
- **Contact Grounding**: Dynamic ambient occlusion contact darkening ($0.32$) directly under building plinths, complemented by soft warm/crimson foundation lighting spill.

### D. Urban Lighting & Infrastructure Tokens
- **Streetlight Luminaires**: Slender dark metallic poles (`#0f172a`) with compact emissive luminaire heads (`emissiveIntensity: 0.28`).
- **Ground Light Pools**: Subdued additive light circles (`opacity: 0.35`, radius: $3.6\text{m}$) projected beneath streetlights on asphalt.
- **Atmospheric Searchlights**: Low-cost inverted cone geometry with custom vertex-fade shader sweeping slowly across the sky ($0.04\text{ rad/s}$), strictly non-occluding (`opacity: 0.08`).

### E. Living Dependency Skybridges
- **Conduit Curves**: Quadratic / cubic Bezier spline arcs with distance-aware elevation ($h = \min(18, 3.5 + \text{dist} \times 0.28)$).
- **Idle State**: Subtle glowing line segments (`opacity: 0.32`, color `#0284c7`).
- **Active State (Selected / Hovered)**: Radiant cyan/violet conduits (`opacity: 0.88`, color `#38bdf8`) with traveling data packets.
- **Packet Transit**: Fast parametric instanced particle pulses traveling along curves with trailing decay tails.
- **Blast Contagion**: Hop-depth staggered illumination (Hop 1 cyan $\to$ Hop 2 violet $\to$ Hop 3 rose).

### F. Cinematic Camera & Motion Tokens
- **Idle Drift**: Slow sinusoidal orbital drift ($0.0012\text{ rad/s}$, max offset $\pm 1.8\text{m}$) that smoothly halts upon mouse drag, pan, or file selection. Resumes after $4.0\text{s}$ of inactivity.
- **Selection Dolly**: Contextual camera transition using smooth cubic Hermite easing ($650\text{ms}$) framing the target building and surrounding dependents with clearance for the left HUD panel.
- **Intro Fly-In**: 4-stage establishing fly-in ($2.4\text{s}$) with immediate `Skip Intro` capability.
- **Reduced Motion**: Respects `prefers-reduced-motion` and Eco Mode by disabling idle drift.

### G. Low-Power / Eco Quality Scaling
| Feature | Normal Mode | Eco / Low-Power Mode |
| :--- | :--- | :--- |
| **Postprocessing** | Selective Bloom (`0.44`), Vignette, Chromatic Aberration | Disabled (`EffectComposer` bypassed) |
| **Searchlights** | 2 animated volumetric sweeping beams | Disabled |
| **Ground Puddle Shaders** | Procedural puddle noise + dynamic ground spill | Basic matte asphalt (`MeshStandardMaterial`) |
| **Dependency Traffic** | Continuous traveling packets + particle trails | Static illuminated conduits |
| **Camera Idle Drift** | Enabled ($0.0012\text{ rad/s}$) | Disabled (static inertial controls) |
| **Framerate Target** | $\ge 60$ FPS (145 FPS measured) | Maximum battery savings ($> 145$ FPS) |
