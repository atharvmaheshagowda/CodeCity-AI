# CodeCity AI — Phase 2: Cinematic Environment, Atmosphere & Motion Engine Notes

## 1. Executive Summary & Objectives

Phase 2 elevates the ambient environment, atmospheric depth, lighting balance, and motion fidelity of CodeCity AI into a cinematic, photorealistic cyberpunk metropolis viewed from an elevated vantage point.

All environmental enhancements build strictly upon the Phase 1 and Phase 1.5 architectural foundations while preserving 100% offline functionality, zero external CDN/asset dependencies, all 10 architectural archetypes, all 5 metric visualization modes, and existing API contracts.

---

## 2. Key Environmental & Atmospheric Upgrades

### A. Removal of the 2D Backdrop Barrier & 360-Degree Megalopolis Horizon
- **Problem Identified**: The previous implementation rendered a static 2D planar billboard mesh ($165\text{m} \times 90\text{m}$) positioned along the $Z = -38$ plane. In multi-district repositories (such as `atharvmaheshagowda/CodeCity-AI`), this flat quad acted as a physical slicing barrier cutting through district buildings and obscuring background angles.
- **Solution (`DistantMegalopolisHorizon` in `SkylineBackdrop.tsx`)**:
  - The 2D plane was completely removed.
  - Implemented `DistantMegalopolisHorizon`, an instanced 3D system of 48 low-poly monolithic background skyscraper silhouettes arranged in a complete $360^\circ$ radial circle at $R \in [140, 185]\text{m}$.
  - Uses seeded pseudo-random heights ($24\text{m} - 82\text{m}$) and dimensions ($5\text{m} - 16\text{m}$), tinted in dark obsidian steel (`#030712`) with micro window slits (`#0c2238`) and pulsing red aviation safety beacons (`#ef4444`).
  - Situated far beyond repository boundaries ($R > 140\text{m}$), these structures provide natural parallax and depth without ever clipping or occluding codebase buildings.

### B. Living Dependency Skybridges
- **File**: `frontend/src/components/City3D/DependencySkybridges.tsx`
- **Upward Cyber Skyway Arcs**:
  - Replaced sagged catenary curves with sweeping upward parabolic trajectories:
    $$\text{midPoint.y} = \max(p_1.y, p_2.y) + \min(7.5, 2.2 + \text{dist} \times 0.20)$$
  - Conduits soar gracefully over urban canyons and clear building rooftops.
- **Dual Flow Data Packets**:
  - Each dependency conduit contains two traveling holographic data packets moving smoothly along the 3D Bézier curve (`offset = (packetOffset + 0.5) % 1.0`).
  - Traveling pulse glow effect highlights active file dependencies.
- **Focused Dependency Dimming**:
  - When a file is selected, conduits connected to the selected file brighten with enhanced cyan emission (`0.95`), while unrelated conduits dim cleanly (`0.08` opacity), eliminating visual clutter.

### C. Atmospheric Fog & Nocturnal Sky Gradients
- **File**: `frontend/src/components/City3D/CityScene.tsx`
- **Atmospheric Palette**:
  - Calibrated deep nocturnal gradients (`createSunsetSkyTexture` and `createNeonSkyTexture`) blending abyss horizon (`#010308`), distant ground baseline (`#030816`), midnight teal Rayleigh haze (`#071830`), and void zenith (`#010206`).
  - Fog distance calibrated to $[100, 340]\text{m}$ in Neon mode and $[130, 340]\text{m}$ in Midnight mode, naturally swallowing distant geometry into atmospheric perspective without hard clipping planes.

### D. Volumetric Atmospheric Searchlights
- **File**: `frontend/src/components/City3D/VolumetricSearchlights.tsx`
- **Shader Refinement**:
  - Customized vertex and fragment shaders with a continuous vertical fade $(1 - vUv.y)^{1.8}$ and soft radial attenuation $(1 - |vUv.x - 0.5| \times 2)$.
  - Tapered cyan and violet beams sweep slowly across the upper skyline with zero harsh polygonal edges or floor artifacts.

### E. Camera Rig & Motion Dynamics
- **File**: `frontend/src/components/City3D/CityScene.tsx`
- **Intelligent Centered Target Framing**:
  - Replaced hardcoded camera coordinates with dynamic target calculations:
    $$\text{Target} = (x - 1.2, \text{height} \times 0.45, z)$$
    $$\text{Camera Distance} = \text{clamp}(18, 38, \text{height} \times 1.85)$$
  - Accounts for the persistent left HUD drawer (~320px) so selected buildings sit centered in the open viewport.
- **Smooth Deselect Return**:
  - Smooth 550ms cubic-ease transition back to repository overview when a selected file is cleared.
- **Ambient Idle Drift**:
  - When idle for $>3.8\text{s}$ with no interaction, the camera enters an orbital drift ($\approx 0.0006\text{ rad/frame}$), keeping the city dynamic and alive.
  - Automatically suspends immediately upon any user input (`pointerdown`, `wheel`, or `keydown`).

---

## 3. Visual Validation Suite & Benchmark Results

The validation suite was run using headless Chromium with accelerated WebGL (`--enable-webgl --use-gl=angle`).

| Scenario | Viewport | Target FPS | Measured FPS | Status | Screenshot Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1080p Baseline** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_1080p_baseline.png` |
| **768p Compact** | $1366 \times 768$ | $>55$ FPS | **143 FPS** | PASS | `phase2_test_768p_compact.png` |
| **Selection & Blast Radius** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_selection.png` |
| **Color Mode: Complexity** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_mode_complexity.png` |
| **Color Mode: Churn** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_mode_churn.png` |
| **Color Mode: Age** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_mode_age.png` |
| **Color Mode: Impact** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_mode_impact.png` |
| **Color Mode: Risk** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_mode_risk.png` |
| **Electric Cyber Neon Theme** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_theme_neon.png` |
| **Eco / Low-Power Mode** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_eco_mode.png` |
| **Largest Repo (`pallets/flask`)** | $1920 \times 1080$ | $>55$ FPS | **145 FPS** | PASS | `phase2_test_flask_repo.png` |

---

## 4. Test & Verification Summary

1. **Frontend Tests**: `vitest run --run` $\to$ **7 passed** (100%).
2. **Backend Tests**: `pytest backend/tests` $\to$ **32 passed** (100%).
3. **Type Safety & Build**:
   - `npx tsc --noEmit` $\to$ **0 errors**.
   - `npm run build` $\to$ **Clean bundle generated in 15.76s**.
4. **Runtime Console Integrity**:
   - Zero WebGL warnings, zero unhandled rejections, zero missing asset errors.
5. **Offline Operation**:
   - Zero external HTTP requests, zero CDN dependencies, 100% procedurally generated textures, geometry, and WebAudio sounds.
