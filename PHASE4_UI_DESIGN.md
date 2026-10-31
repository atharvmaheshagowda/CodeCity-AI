# CodeCity AI — Phase 4: Premium Mission Control UI Design System Specification

## 1. Design Vision & Philosophy

CodeCity AI combines the analytical precision of Linear, the typographical clarity of Vercel, the refined optical depth of visionOS frosted glass, and the immersive identity of a futuristic cybernetic mission control center.

The 3D procedural metropolis is the visual centerpiece of the software. All UI chrome (navigation bars, side panels, diagnostic drawers, and bottom HUDs) exists as lightweight, translucent spatial surfaces that frame and illuminate the city without competing with it for visual dominance.

---

## 2. Design Tokens

### A. Color Palette
```scss
// Primary Canvas & Atmosphere
$bg-canvas: #030712;         // Near-black abyss (99% darkness)
$bg-surface-glass: rgba(11, 19, 41, 0.85); // Frosted mission glass
$bg-surface-solid: #090e1a;   // Deep navy solid
$bg-card-glass: rgba(15, 23, 42, 0.75);    // Card tier-2 surface

// Hairline Borders & Dividers
$border-glass: rgba(255, 255, 255, 0.10); // Standard subtle edge
$border-glass-hover: rgba(56, 189, 248, 0.40); // Cyan edge highlight
$border-active: rgba(56, 189, 248, 0.70); // Focused element border

// Signature Accents
$accent-cyan: #38bdf8;       // Primary interactive accent (Sky 400)
$accent-cyan-glow: rgba(56, 189, 248, 0.35);
$accent-teal: #14b8a6;       // Secondary data flow
$accent-violet: #a855f7;     // Multi-repo / compare accent

// Semantic Risk Indicators
$risk-critical: #f43f5e;     // Rose 500 (Risk >= 50% / Hotspot)
$risk-warning: #f59e0b;      // Amber 500 (CC > 10 / Churn alert)
$risk-stable: #10b981;       // Emerald 500 (Clean, low risk)

// Typographic Neutral Hierarchy
$text-primary: #f8fafc;      // Slate 50 (High contrast headers)
$text-secondary: #cbd5e1;    // Slate 300 (Body text & metrics)
$text-muted: #94a3b8;        // Slate 400 (Labels & captions)
$text-faint: #64748b;        // Slate 500 (Shortcuts & metadata)
```

### B. Typography Scale
- **Display / Brand**: `Space Grotesk`, sans-serif, bold weight for top-level headers.
- **Data & Identifiers**: `JetBrains Mono`, monospace, tabular numbers, for filenames, code metrics, and telemetry counters.
- **Interface Body**: `Inter`, sans-serif, regular/medium for readable explanations and labels.

| Scale Token | Font Size | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `text-2xs` | 10px | 14px | +0.02em | Badges, keyboard shortcuts, sparkline labels |
| `text-xs` | 11px | 16px | +0.01em | Compact cards, HUD pills, secondary metadata |
| `text-sm` | 12px | 18px | normal | Primary sidebar items, button labels |
| `text-base` | 14px | 20px | normal | Card titles, drawer headers |
| `text-lg` | 18px | 24px | -0.01em | Metric KPIs, gauge values |
| `text-xl` | 24px | 30px | -0.02em | Prominent statistics |

### C. Surface & Glass Treatments
- **Standard Glass Panel**:
  - `background: rgba(3, 7, 18, 0.88);`
  - `backdrop-filter: blur(24px) saturate(180%);`
  - `border: 1px solid rgba(255, 255, 255, 0.10);`
  - `box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.08);`
- **Active / Selected Glass Card**:
  - `background: rgba(8, 47, 73, 0.40);`
  - `border: 1px solid rgba(56, 189, 248, 0.50);`
  - `box-shadow: 0 0 16px rgba(56, 189, 248, 0.20), inset 0 1px 0 rgba(56, 189, 248, 0.30);`

### D. Layering & Z-Index Conventions
| Z-Index | Component | Description |
| :--- | :--- | :--- |
| `z-0` | 3D Canvas | React Three Fiber WebGL viewport |
| `z-10` | In-Scene Overlays | Billboarded 3D badges and floating indicators |
| `z-20` | Spatial Sidebars | LeftPanel, RightDrawer, BottomHUD |
| `z-30` | Navigation & Banners | Top Navbar, Simulation Alert Banner |
| `z-40` | Context Menus & Popups | Radial Context Menu, Floating Tooltips |
| `z-50` | Full Modals & Palettes | Command Palette, Graph Modal, Model Card |

---

## 3. Component Architecture & Polish Plan

### 1. Top Navigation Bar (`Navbar.tsx`)
- **Single-Row Compact Control**: Eliminate duplicate color mode buttons (which belong in the bottom HUD) so the navbar never collides or wraps on 1366×768 displays.
- **Brand Identity**: Clean logo, "CodeCity AI", "v1.0" badge, pulsing green "Offline Ready" indicator, and subtle subtitle tooltip.
- **Repository Selector**: Compact pill with total file count.
- **Right Action Bar**: Icon + text pills for `Insights`, `Matrix`, `Compare`, `Terminal`, `Exhibition`, `Model Card`, `Settings`, and `Theme`.

### 2. Left Intelligence Sidebar (`LeftPanel.tsx`)
- **KPI Metrics**: 4 compact cards with real sparkline paths for total LOC, average risk, critical files count, and model ROC-AUC.
- **Ranked Hotspot List**: Clean rank numbers, file icons, monospace filenames, severity badges, and mini risk bars.
- **Smooth Collapse**: Collapses to edge with smooth spring transition to maximize 3D viewport.

### 3. Right Diagnostic Drawer (`RightDrawer.tsx`)
- **File Header & Risk Gauge**: Circular SVG risk gauge with dynamic drop shadow glow and plain-English risk explanation.
- **Dynamic File Diagnostics**: Line-level failure cause and contributing SHAP feature bars.
- **Action Buttons**: Direct "Blast Radius" and "Simulate Failure" buttons.

### 4. Bottom HUD (`BottomHUD.tsx`)
- **Real Radar Minimap**: Replaces the hardcoded diorama with a live 2D radar projection of `currentRepo.files`, district boundaries, real building color codes, and selection target reticle.
- **Color Mode Selector**: Sliding indicator pill (`layoutId="activeModePill"`) and continuous risk gradient legend.
- **Controls & Low Power**: Reset camera, layers menu, fullscreen, and low power mode toggle.

### 5. Dependency Graph Modal (`DependencyGraphModal.tsx`)
- Callers on left, target module in center, downstream dependencies on right, and a dedicated graceful section for external standard library and third-party packages.

