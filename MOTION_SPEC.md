# CodeCity AI — Motion Specification (`MOTION_SPEC.md`)

This specification defines all animation physics, spring presets, timings, and interaction micro-motions using the `motion` library (`import { motion, AnimatePresence } from 'motion/react'`).

---

## 1. Spring Presets & Physics

All UI animations use physically modeled spring dynamics rather than synthetic cubic-bezier curves:

| Preset Name | Stiffness | Damping | Mass | Primary Use Case |
|:---|:---|:---|:---|:---|
| **`snappy`** | `400` | `28` | `1.0` | Button presses, segmented pills, micro-toggles, keyboard focus rings |
| **`smooth`** | `260` | `25` | `1.0` | Drawer slide-in/out, panel collapse, modal entrances, layout shifts |
| **`bouncy`** | `300` | `18` | `1.0` | Building hover lift, badge pops, notification toasts, shockwave trigger |
| **`inertial`**| `180` | `32` | `1.2` | Camera dolly-to-focus, minimap pan glide, idle drift transitions |

```ts
export const SPRING_PRESETS = {
  snappy: { type: 'spring', stiffness: 400, damping: 28 },
  smooth: { type: 'spring', stiffness: 260, damping: 25 },
  bouncy: { type: 'spring', stiffness: 300, damping: 18 },
  inertial: { type: 'spring', stiffness: 180, damping: 32 },
} as const;
```

---

## 2. Interaction Micro-Motions

### 2.1 Building Hover Lift & Cursor Lag Card
- When the cursor hovers over a building:
  - The building lifts slightly upward along the Y-axis by $+0.4\text{m}$ using spring interpolation.
  - Edges illuminate with a radiant cyan glow.
  - A mini floating info card follows the cursor with smooth spring damping:
    $$\Delta x = (x_{\text{target}} - x_{\text{current}}) \times 0.22$$
  - AST dependency conduits faintly illuminate at $25\%$ intensity to preview connections before clicking.

### 2.2 Building Selection & Blast-Radius Shockwave
- On building selection:
  - The camera dollies smoothly into optimal framing with depth-of-field focus.
  - A radiant shockwave ring expands outward across the ground platform ($1.6\text{s}$ sine ease-out).
  - High-intensity 3D parabolic conduits arch outward to dependent files.
  - Glowing elongated cyber data packet pods travel along the curves.
  - Direct dependents (Hop 1) illuminate first in Cyan ($t = 0.15\text{s}$).
  - Indirect dependents (Hop 2) illuminate next in Violet ($t = 0.35\text{s}$).
  - Distant callers (Hop 3) illuminate in Rose ($t = 0.55\text{s}$).
  - Non-dependent structures dim their windows to $18\%$ standby intensity.

### 2.3 Shared-Element Drawer Entrance
- When a building or hotspot is clicked:
  - The Right Drawer slides in with `SPRING_PRESETS.smooth` from the right viewport margin.
  - The circular SVG risk gauge animates from `0%` to target percentage ($0.7\text{s}$ duration).
  - SHAP feature contribution bars grow outward with a staggered delay ($0.05\text{s}$ per bar).

### 2.4 Right-Click Radial Context Menu
- Right-clicking any building spawns a visionOS-styled radial glass menu centered at the cursor coordinates:
  - 4 quick actions arranged at 90-degree radial increments:
    1. *Inspect Blast Radius*
    2. *Simulate Failure Cascade*
    3. *Copy File Path*
    4. *Pin to Comparison Dock*
  - Esc or outside click closes the radial menu with a snappy spring-out.

### 2.5 Animated Color-Mode Morph
- When switching between the 5 color modes (Risk, Complexity, Churn, Age, Impact):
  - Buildings do not snap colors instantly; they lerp smoothly over $0.45\text{s}$.
  - The segmented control in the bottom dock slides a glowing highlight pill to the active mode using `layoutId="activeModePill"`.

---

## 3. Accessibility & Reduced Motion

- All components evaluate `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- When reduced motion is requested:
  - Spring physics and camera auto-orbits are bypassed.
  - Opacity fade transitions ($0.15\text{s}$ linear) replace translate/scale animations.
  - Particle drift and searchlight sweeps are frozen to static ambient lighting.

