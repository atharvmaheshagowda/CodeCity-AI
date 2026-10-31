# PHASE 5: ADVANCED SOFTWARE INTELLIGENCE & ARCHITECTURAL INSIGHTS DESIGN SPECIFICATION

## 1. Executive Summary & Architectural Scope
CodeCity AI provides an offline-first, interactive 3D spatial software intelligence platform that combines machine-learning defect risk forecasting, graph-theoretical dependency analytics, AST static analysis, and Git mining. Phase 5 elevates these individual analytical features into a cohesive, synchronized intelligence layer that guides engineering teams from high-level architectural overview down to line-level root-cause diagnostics and remediation actions.

---

## 2. Intelligence Engine Audit: Verified Implementations vs. Placeholders

| Capability | Current Implementation Status | Underlying Algorithm / Engine | Data Sources & Artifacts | Verified Limitations |
| :--- | :--- | :--- | :--- | :--- |
| **Defect-Risk Prediction** | **Production Implementation** | XGBoost Classifier (`scale_pos_weight`, strictly held-out evaluation on `httpie/cli`) | `backend/ml/train.py`, `backend/data/models/xgboost_model.joblib` | Probabilistic likelihood based on historical temporal patterns; does not guarantee runtime failure. |
| **SHAP Explanations** | **Production Implementation** | `shap.TreeExplainer` with deterministic plain-English narrative synthesis | `backend/ml/shap_explainer.py` | Local feature attribution relative to expected background value; explainable features only. |
| **Cyclomatic Complexity** | **Production Implementation** | Python AST parse via `radon.complexity.cc_visit` (mean CC and max CC per file) | `backend/mining/git_miner.py` | Python codebases only; does not account for runtime dynamic metaprogramming. |
| **Churn & File-Age Metrics** | **Production Implementation** | Reverse commit traversal mining 90-day churn, total churn, file age, days since change | `backend/mining/git_miner.py`, Git commit tree | Dependent on Git commit history depth; shallow clones limit historical range. |
| **Dependency Centrality & Blast Radius** | **Production Implementation** | NetworkX `DiGraph` import/call parser, reverse BFS multi-hop blast radius | `backend/graph/dep_graph.py` | Static imports and function calls; dynamic string imports (`importlib`) not statically resolved. |
| **Failure Diagnostics** | **Production Implementation** | Known failure signatures for flagship repos + AST vulnerability scanner | `backend/intelligence/line_diagnostics.py` | Heuristic vulnerability pattern matching (ZeroDivision, Subscript indexing, High-CC blocks). |
| **Code-Smell Detection** | **Production Implementation** | Tarjan SCC cycles, percentile-evaluated God files, unreferenced orphan files | `backend/intelligence/smells.py` | Structural anti-patterns based on graph cycles and percentile thresholds. |
| **Knowledge Concentration & Bus Factor** | **Production Implementation** | Author-anonymous commit distribution, dominant contributor share, distinct author count | `backend/mining/git_miner.py` | Measures commit frequency rather than lines retained or organizational context; anonymized. |
| **Breaking-Change Analysis** | **Production Implementation** | AST signature change detector parsing caller modules across repository | `backend/intelligence/breaking_change.py` | Evaluates function signature changes across static callers; requires source availability. |
| **Risk Contagion Diffusion** | **Production Implementation** | Personalized PageRank diffusion ($d = 0.85$) on reversed dependency graph | `backend/intelligence/contagion.py` | Modeled risk percolation; an upstream defect increases downstream risk but does not guarantee runtime error. |
| **Repository Comparison** | **Production Implementation** | Normalized and raw metric comparison across repositories | `frontend/src/components/RepoComparisonModal.tsx` | Comparative metrics against actual scanned repositories only; no fabricated industry baselines. |
| **Historical Risk & Change Analysis** | **Production Implementation** | Monthly time-lapse snapshots, walk-forward backtesting, file trajectory points | `backend/intelligence/timelapse.py`, `backtest.py` | Bounded by available commit history; requires explicit "Insufficient History" state for shallow repos. |

---

## 3. Architectural Health Model (Multidimensional Signal Synthesis)
Rather than condensing repository health into an arbitrary, scientifically unvalidated single score, CodeCity AI decomposes architectural health into eight transparent, orthogonal signals:

1. **Defect Hotspot**: $P(\text{defect}) \ge 0.50$ predicted by XGBoost.
2. **Branching Complexity Hotspot**: Maximum cyclomatic complexity $\ge 12.0$ or mean $\text{CC} \ge 6.0$.
3. **Change Instability**: 90-day churn in top $15\%$ of repository files.
4. **Centrality Bottleneck**: High combined degree ($\text{Fan-In} \ge 4$ or $\text{Betweenness Centrality} \ge 0.15$).
5. **God Component**: Disproportionate LOC ($\ge 85\text{th percentile}$), high CC, and high fan-in.
6. **Circular Import Ring**: File participates in a strongly connected component (Tarjan cycle).
7. **Hidden Logical Coupling**: Co-changes $\ge 3$ times with Jaccard index $\ge 0.20$ without direct import edge.
8. **Ownership Concentration (Bus Factor Risk)**: Single contributor authored $\ge 80\%$ of commits with $\le 2$ total contributors.

### Visual Representation in 3D City
- **Rooftop Signal Badges**: Restrained, geometric glyphs rendered only when the respective signal is active.
- **Selective Layer Toggles**: Users can toggle individual health signal filters in the HUD (`Hotspots`, `Bottlenecks`, `Cycles`, `Bus Factor`).
- **Synchronized Detail**: Selecting any building reveals the exact contributing metrics with zero obfuscation.

---

## 4. Controllable Risk Contagion & Propagation Specification
- **Origin Node**: The selected failure origin file (pulsing crimson beacon).
- **Direct Dependents (Hop 1)**: Immediate callers that directly import the origin (amber warning perimeter).
- **Indirect Dependents (Hop 2 & 3)**: Downstream cascading modules reached via transitive dependency paths.
- **Multi-Dependent Hotspots**: Modules that depend on 2 or more files currently exhibiting elevated defect risk.
- **Deterministic Reachability**: The UI explicitly states: *"This view illustrates static dependency reachability (blast radius). An import relationship indicates exposure to upstream interface changes or exceptions, not an unconditional runtime failure."*

---

## 5. Centrality & Graph Metrics Architecture
To ensure high-performance 60+ FPS rendering without frame drops during camera movement:
1. **Graph Metrics Computed Once at Analysis Time**:
   - `in_degree` (Fan-in / Dependents)
   - `out_degree` (Fan-out / Dependencies)
   - `pagerank` (Architectural importance / authority)
   - `betweenness_centrality` (Bridging role between architectural subsystems)
   - `blast_radius_count` (Reachable downstream nodes within 3 hops)
2. **Revision-Based Caching**:
   - Cached in memory keyed by `(repo_id, commit_hash)`. Invalidation occurs automatically if the repository is re-analyzed or files are modified.
3. **Plain-English Explanations**:
   - Every metric card includes tooltip explanations distinguishing structural centrality from runtime failure probability.

---

## 6. Anonymous Knowledge Concentration & Bus Factor
- **Ethical Integrity**: Contributor identities are strictly hashed/anonymized (e.g., `Contributor #1`, `Contributor #2`). No real names or emails are rendered in UI.
- **Explicit Caveats**: The panel clearly notes: *"Commit authorship is a proxy for code familiarity based on historical Git commits, not a direct assessment of individual developer capability or code quality."*
- **Focus Mode**: Clicking the "Concentrated Ownership" filter dims balanced modules and highlights single-maintainer critical files in amber.

---

## 7. Dedicated Advanced Insights Panel
The centralized Insights modal groups actionable findings into 7 structured categories:
1. **Critical Defect Hotspots** (High ML risk + high historical bug fixes)
2. **Architectural Bottlenecks** (High betweenness centrality + heavy downstream dependency)
3. **Change Instability** (Excessive recent churn + dormant past)
4. **Dependency Concentration** (Modules importing excessive external modules)
5. **Architectural Smells** (Circular import loops, God modules, Orphan files)
6. **Ownership Concentration** (High blast-radius modules maintained by a single contributor)
7. **Cascading Impact Risks** (Failure simulation scenarios with large downstream impact)

Each insight provides:
- Title & Severity tag (`CRITICAL`, `HIGH`, `MEDIUM`, `INFO`)
- Concrete Supporting Evidence (LOC, CC, Churn, Fan-In, Jaccard values)
- List of Affected Files
- Plain-English Root Cause & Remediation Suggestion
- Direct Navigation Action: *"Focus in 3D City"*, *"View in Graph"*, or *"Inspect Line Diagnostics"*.

---

## 8. Verification & Performance Criteria
- **Zero Cloud Calls / Zero Telemetry**: 100% offline self-contained operation.
- **Memory & Render Budgets**: All graph metrics cached; canvas framerate $\ge 60\text{ FPS}$ on baseline hardware.
- **Temporal Integrity**: All training and validation strictly respect temporal cutoffs with zero future data leakage.

