# CodeCity AI — Design System ("Nocturne Glass")

**Archetype**: "Nocturne Glass" — High-End Spatial Software Intelligence meets Cinematic Cyberpunk Metropolis (Fluidity of Linear + Arc + Apple visionOS glass with Blade Runner 2049 atmospheric depth).

---

## 1. Brand Identity & Principles

### Core Promise
> **"See where your code will break next, and what breaks with it."**
Every spatial dimension, glass elevation, and spring transition directly reflects repository static analysis and machine-learning risk predictions.

### Principles
1. **The Metropolis is the Canvas**: The 3D scene occupies 100% of the viewport. Floating glass panels hover with optical blur and subtle specular highlights.
2. **Clean Architectural Silhouettes**: Replaced all barrels, rings, and random spires with clean architectural skyscraper towers: sharp-beveled rectangular prisms, stepped setbacks, and flat roofs with subtle emissive trim.
3. **Restrained Color Discipline**: Near-black navy canvas (`#020409`), ONE signature accent (electric cyan `#00f0ff`), and an honest risk gradient (emerald $\to$ amber $\to$ hot crimson).
4. **Accessible Redundancy**: Defect risk is redundantly encoded through color, pulse frequency (slow $\to$ rapid strobe), numerical percentage, and distinctive status icons.
5. **Fluid Motion Language**: Driven entirely by `motion/react` with spring physics, cursor reactivity, and zero abrupt layout snaps.

---

## 2. Color Palette & Semantic Tokens

| Token Name | Hex Value | RGBA Value | Purpose & Semantics |
|:---|:---|:---|:---|
| **`canvas-deep`** | `#020409` | `rgba(2, 4, 9, 1.0)` | Deepest navy ambient clear color |
| **`surface-glass`** | `#070c18` | `rgba(7, 12, 24, 0.72)` | Primary floating panels with 18px backdrop blur |
| **`surface-elevated`**| `#0e1628` | `rgba(14, 22, 40, 0.85)` | Active cards, search inputs, modal bodies |
| **`border-glass`** | `#ffffff` | `rgba(255, 255, 255, 0.08)` | 1px inner hairline highlight |
| **`border-active`** | `#00f0ff` | `rgba(0, 240, 255, 0.50)` | Focus rings, active tabs, selected states |
| **`accent-cyan`** | `#00f0ff` | `hsl(184, 100%, 50%)` | Primary brand signature, telemetry, Hop 1 arcs |
| **`risk-emerald`** | `#10b981` | `hsl(158, 64%, 52%)` | Low defect risk ($P < 0.35$), stable modules |
| **`risk-amber`** | `#f59e0b` | `hsl(38, 92%, 50%)` | Moderate defect risk ($0.35 \le P < 0.65$), warning |
| **`risk-crimson`** | `#ff1a40` | `hsl(350, 100%, 55%)` | High defect risk ($P \ge 0.65$), critical hotspot |
| **`hop-1`** | `#00f0ff` | `rgba(0, 240, 255, 1.0)` | Direct importers (Hop 1 blast conduit) |
| **`hop-2`** | `#a855f7` | `rgba(168, 85, 247, 1.0)` | Indirect callers (Hop 2 blast conduit) |
| **`hop-3`** | `#f43f5e` | `rgba(244, 63, 94, 1.0)` | Transitive callers (Hop 3 blast conduit) |
| **`window-warm`** | `#fff1d0` | `rgba(255, 241, 208, 0.9)` | Warm incandescent interior window |
| **`window-cyan`** | `#70f3ff` | `rgba(112, 243, 255, 0.9)` | Cool terminal workstation window |
| **`window-unlit`** | `#060b14` | `rgba(6, 11, 20, 0.95)` | Dark tinted standby glass |

---

## 3. Typography Scale (Self-Hosted via `@fontsource`)

- **Display & Section Titles**: `Space Grotesk` (Weights: 600, 700)
- **Primary UI Sans**: `Inter` (Weights: 400, 500, 600, 700)
- **Numbers, Telemetry & Code**: `JetBrains Mono` (Weights: 500, 600, 700)

| Role | Family | Size | Weight | Tracking | Usage |
|:---|:---|:---|:---|:---|:---|
| **Display Hero** | Space Grotesk | 26px (1.625rem) | 700 | -0.03em | Exhibition Mode HUD, Major Toplines |
| **Card Header** | Space Grotesk | 15px (0.9375rem)| 600 | -0.02em | Drawer titles, Modal headers |
| **UI Body** | Inter | 12px (0.75rem) | 400/500 | 0 | Descriptions, SHAP narratives |
| **Data Metric** | JetBrains Mono| 18px (1.125rem) | 700 | -0.02em | Risk gauges, KPI counters, LOC |
| **Code Micro** | JetBrains Mono| 10px (0.625rem) | 600 | +0.02em | File paths, badges, keyboard tags |

---

## 4. Glass Surface Specifications & CSS Tokens

```css
/* visionOS Frosted Optical Glass */
.glass-nocturne {
  background: rgba(7, 12, 24, 0.74);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 
    0 24px 48px -12px rgba(0, 0, 0, 0.75),
    0 4px 12px rgba(0, 0, 0, 0.40),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* Elevated Interactive Glass (Cards, Lists, Modals) */
.glass-nocturne-elevated {
  background: rgba(14, 22, 40, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.5);
}
```

---

## 5. 3D Architectural Tower Geometry & Shading

- **Building Form**: Clean rectangular towers with sharp beveled edges.
- **Stepped Setbacks**: Complex/taller files receive a 3-tier stepped setback (Base podium $\to$ mid shaft $\to$ penthouse crown).
- **Flat Roofs**: Dark metallic gravel roof decks with glowing perimeter parapet trim (`#00f0ff` or risk color).
- **Window Grid**: Procedural GLSL shader producing clean, aligned window bays with dark structural mullions and spandrels.
- **Fresnel Rim Light**: Grazing-angle rim illumination ensures building silhouettes read cleanly against the night sky.
- **Landmark Beacons**: Top-impact files emit a soft vertical light column and a floating holographic name badge.
