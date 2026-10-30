# CodeCity AI — Phase 1: Realistic Procedural Architecture Notes

## 1. Executive Summary & Architecture Overview

Phase 1 establishes a deterministic, high-fidelity procedural architecture engine for CodeCity AI. The 3D metropolis represents software repositories as a living cyberpunk miniature city at night, adhering to strict visual hierarchy and deterministic mappings.

### Core Mappings Preserved
- **Directory / Module $\to$ District Platform**: Frosted glass district foundations with neon boundary perimeters.
- **File $\to$ Building Structure**: Individual buildings procedurally instanced with custom compound geometries.
- **Lines of Code (LOC) $\to$ Building Footprint**: Base width and depth are scaled by volume of code.
- **Cyclomatic Complexity $\to$ Building Height**: Vertical elevation directly maps code complexity.
- **Risk & Health Metrics $\to$ Architectural Lighting & Conduits**: Dual-temperature windows, illuminated corner buttresses, mid-tower reveal bands, and rooftop parapet trims.
- **Imports $\to$ Glowing Skybridges & Conduits**: Data packet transit animated along dependency trajectories.

---

## 2. The Ten Architectural Archetypes

Each archetype features a unique structural massing silhouette, stepped setback logic, utility machinery, and rooftop communication gear. Geometries are created using normalized $[0..1]$ unit dimensions with uniform non-indexed `BufferGeometry` attributes to guarantee safe instancing and zero buffer collisions.

1. **Glass Skyscraper (`glass_skyscraper`)**
   - *Design*: High-rise corporate curtain-wall tower with stepped setback, vertical corner mullions, observation crown, and slender spire tip.
   - *Mapping*: High complexity core infrastructure (`max_complexity >= 8`, even index).
2. **Corporate Tower (`corporate_tower`)**
   - *Design*: Multi-tier office skyscraper with horizontal floor reveal divisions, stepped setbacks, and dual HVAC chiller units.
   - *Mapping*: High complexity core infrastructure (`max_complexity >= 8`, odd index).
3. **Stepped Industrial Hub (`stepped_industrial`)**
   - *Design*: Tiered ziggurat massing with visible structural frames, cooling towers, and rooftop exhaust vent stack.
   - *Mapping*: Test suites, mocks, fixtures, and verification modules (`test`, `mock`, `fixture`, `spec`, `bench`).
4. **Brutalist Technology Structure (`brutalist_tech`)**
   - *Design*: Heavy corner pilaster pylons, cantilevered mid-section overhangs, recessed ground plinth, and heavy parapet crown.
   - *Mapping*: Security, authentication, permissions, crypto, tokens (`auth`, `sec`, `crypt`, `token`, `guard`, `cert`).
5. **Modular Research Facility (`research_facility`)**
   - *Design*: Central core structure flanked by twin laboratory pods linked via mid-level enclosed skybridges and an observation dome bulkhead.
   - *Mapping*: Core algorithms, parsing, engines, ML pipelines (`graph`, `engine`, `core`, `ml`, `algo`, `parse`, `ast`).
6. **High-Density Residential Block (`compact_residential`)**
   - *Design*: Compact multi-floor low/mid-rise block with exterior service balconies and rooftop water storage tank.
   - *Mapping*: Utilities, helpers, configuration scripts, small modules (`loc < 90` or `utils`, `config`, `common`, `helpers`).
7. **Fortified Data Center Monolith (`datacenter`)**
   - *Design*: Heavy armored server vault with exterior heat-sink louvers and a 4-fan chiller bay array on the roof.
   - *Mapping*: Data persistence, schemas, databases, models, caches (`model`, `db`, `schema`, `store`, `sql`, `entity`, `cache`).
8. **Twin-Tower Multi-Section Complex (`multisection_complex`)**
   - *Design*: Asymmetric twin tower volumes anchored to a foundation base, linked by a high-altitude enclosed skybridge.
   - *Mapping*: Multi-component modules, blueprints, plugins, and large codebase files (`blueprint`, `session`, `plugin`, or `loc > 280`).
9. **Lattice Communications Mast (`telecom_spire`)**
   - *Design*: Sturdy plinth base with equipment mezzanine, microwave transmission dishes, and a slender communication needle.
   - *Mapping*: Telemetry, networking, routing, client interfaces, APIs, CLIs (`api`, `client`, `route`, `net`, `socket`, `connect`, `cli`).
10. **Monumental Critical Landmark (`monumental_landmark`)**
    - *Design*: Hero cyberpunk skyscraper with grand podium base, 4 vertical exoskeleton corner columns, mid-tower reveal terrace, penthouse deck, and illuminated crown helipad frame.
    - *Mapping*: Critical codebase hotspots and highest risk/impact modules (`seed_db.py`, top risk rank).

---

## 3. Procedural Facade Shader & Night Illumination

The custom GLSL shader injected into `MeshStandardMaterial.onBeforeCompile` implements cinematic cyberpunk night lighting:

- **Dual-Temperature Interior Window Illumination**:
  - Warm golden amber (`#ffd273`, $\sim 50\%$) interior office lighting.
  - Cool cyan/white (`#8ce0ff`, $\sim 25\%$) terminal/operations glow.
  - Dark non-reflective glass in unlit sections.
- **Ordered Facade Window Grid**:
  - Procedurally computed from normalized model coordinates $(vObjectPos)$ and world coordinates $(vWorldPos)$.
  - Crisp spandrels and vertical mullions framing each window unit.
- **Subtle Metric Color Harmonization**:
  - Rather than tinting all windows uniformly in solid monochrome colors, the active metric color (Risk, Complexity, Churn, Age, Impact) is blended subtly ($22\%$) into active windows while intensely illuminating:
    - Vertical corner buttress columns.
    - Mid-tower reveal bands.
    - Rooftop perimeter parapet crowns.
- **Pulsing Crimson Accent on Critical Files**:
  - High-risk hero landmarks (e.g. `seed_db.py`) feature a slow, sinister breathing pulse on exoskeleton conduits and roof parapets.
- **Fresnel Rim Lighting & Vertical Gradient**:
  - Micro-fresnel edge sheen renders crisp silhouette edges against the night sky.
  - Smooth ground plinth-to-crown vertical gradient anchors buildings to their districts.

---

## 4. Performance & Validation Benchmarks

Testing was performed under automated headless and interactive environments across standard desktop (1080p) and compact laptop (768p) viewports:

| Test Mode | Resolution | Target FPS | Measured FPS | Status |
| :--- | :--- | :--- | :--- | :--- |
| Baseline (Risk Mode, Midnight Theme) | $1920 \times 1080$ | $\ge 55$ FPS | **144 FPS** | PASS |
| Compact Viewport | $1366 \times 768$ | $\ge 55$ FPS | **145 FPS** | PASS |
| Selected Hero Skyscraper (`seed_db.py`) | $1920 \times 1080$ | $\ge 55$ FPS | **144 FPS** | PASS |
| Color Mode: Complexity | $1920 \times 1080$ | $\ge 55$ FPS | **144 FPS** | PASS |
| Color Mode: Churn | $1920 \times 1080$ | $\ge 55$ FPS | **144 FPS** | PASS |
| Color Mode: Age | $1920 \times 1080$ | $\ge 55$ FPS | **144 FPS** | PASS |
| Color Mode: Impact | $1920 \times 1080$ | $\ge 55$ FPS | **144 FPS** | PASS |
| Theme: Electric Cyber Neon | $1920 \times 1080$ | $\ge 55$ FPS | **144 FPS** | PASS |
| Low-Power / Eco Mode Enabled | $1920 \times 1080$ | $\ge 55$ FPS | **145 FPS** | PASS |
| Large Multi-File Repo Switch (`pallets/flask`) | $1920 \times 1080$ | $\ge 55$ FPS | **145 FPS** | PASS |

---

## 5. Automated Test Results
- **Frontend Test Suite**: 2 test files passed, 7 of 7 unit tests passed (`vitest`).
- **Production Build**: Zero TypeScript errors, bundled cleanly in 17.16s (`tsc -b && vite build`).
- **Backend Test Suite**: 32 of 32 tests passed (`pytest`).
- **Browser Runtime**: Zero WebGL context loss, zero console errors, zero unhandled rejections.

