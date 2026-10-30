# CodeCity AI — Design System & Visual Specification

**Visual Target**: Realistic miniature futuristic cyber-city / software metropolis inspired by the high-end industrial simulation diorama aesthetic (*Blade Runner 2049* atmospheric depth, *Tron: Legacy* illuminated pathways, and *Linear* / *visionOS* tactile glassmorphic precision).

---

## 1. Spatial Metaphor & Principles

1. **The Miniature City as Hero**: The 3D environment occupies 100% of the screen. Elevated isometric framing (FOV 32–34°) provides a diorama-like vantage point where every structure, street, and illuminated pathway reads with razor-sharp clarity.
2. **10 Architectural Archetypes**: Software files are never plain cubes. They are generated procedurally as distinct architectural structures (multi-story corporate buildings, glass towers, stepped high-rises, research facilities, industrial tech centers, datacenters, brutalist blocks, compact utilities, telecom masts, and monumental landmarks).
3. **Dual-Temperature Facade Lighting**: Windows glow with warm golden/amber interior light (~50%) mixed with cool cyan terminal lighting (~25%) framed by dark tinted glass spandrels, metallic mullions, and floor slabs. High-risk modules pulse with slow crimson warning light.
4. **Wet Terrain with Luminous Cyan Pathways**: Dark asphalt ground plane with subtle procedural roughness, puddles, glowing cyan conduit pathways, road markings, district boundaries, and small industrial utility equipment (electrical cabinets, streetlights).
5. **Strict Data Grounding**:
   - Building Footprint $\propto \sqrt{\text{LOC}}$
   - Building Height $\propto \ln(1 + \text{Complexity})$
   - Building Risk Tint $\propto \text{Defect Risk Probability } [0.0 \to 1.0]$
   - District = Python Directory Package
   - Illuminated Conduits = Real AST Import & Call Dependencies
   - Blast Radius = Reverse Reachability BFS Cascade

---

## 2. Color Palette & Semantic Tokens

| Semantic Token | Hex | RGBA | Usage |
|:---|:---|:---|:---|
| **`canvas-void`** | `#020612` | `rgba(2, 6, 18, 1.0)` | Deep midnight-blue atmospheric clear color |
| **`ground-wet`** | `#01040a` | `rgba(1, 4, 10, 1.0)` | Obsidian wet asphalt ground plane |
| **`accent-cyan`** | `#00f0ff` | `rgba(0, 240, 255, 1.0)` | Signature illuminated pathways, Hop 1 arcs, beacons |
| **`window-golden`** | `#fef08a` | `rgba(254, 240, 138, 1.0)`| Warm golden interior office window glow |
| **`window-cyan`** | `#38bdf8` | `rgba(56, 189, 248, 1.0)` | Cool cyber terminal workstation lighting |
| **`window-dark`** | `#070d18` | `rgba(7, 13, 24, 0.95)` | Tinted unlit glass / architectural spandrel |
| **`risk-emerald`** | `#10b981` | `rgba(16, 185, 129, 1.0)`| Low risk ($P < 0.35$), stable modules |
| **`risk-amber`** | `#f59e0b` | `rgba(245, 158, 11, 1.0)`| Medium risk ($0.35 \le P < 0.65$), attention |
| **`risk-crimson`** | `#ff1a40` | `rgba(255, 26, 64, 1.0)` | High risk ($P \ge 0.65$), critical defect hotspot |
| **`hop-1`** | `#38bdf8` | `rgba(56, 189, 248, 1.0)` | Direct importers (Hop 1 blast radius) |
| **`hop-2`** | `#c084fc` | `rgba(192, 132, 252, 1.0)`| Indirect callers (Hop 2 blast radius) |
| **`hop-3`** | `#fb7185` | `rgba(251, 113, 133, 1.0)`| Transitive cascades (Hop 3 blast radius) |

---

## 3. Glassmorphic Surface Specifications

```css
/* VisionOS Frosted Optical Glass Panel */
.glass-panel {
  background: rgba(2, 6, 20, 0.82);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 24px 48px -12px rgba(0, 0, 0, 0.8),
    0 4px 12px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* Elevated Glass Cards */
.glass-panel-elevated {
  background: rgba(8, 14, 30, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.09);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.55);
}
```

---

## 4. Typography Scale (100% Offline & Self-Hosted)

- **Display & Headlines**: `Space Grotesk` (`@fontsource/space-grotesk`, weights 600, 700)
- **UI Sans**: `Inter` (`@fontsource/inter`, weights 400, 500, 600, 700)
- **Code & Telemetry**: `JetBrains Mono` (`@fontsource/jetbrains-mono`, weights 500, 600, 700)

