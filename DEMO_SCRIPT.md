# CodeCity AI: 2-Minute Exhibition Booth Demo Script

**Target Audience**: Software Engineers, Engineering Managers, Conference Judges  
**Core Value Proposition**: *"See where your code will break next, and what breaks with it."*  
**Duration**: 120 Seconds  

---

### Phase 1: The Hook & 3D Spatial Overview (0:00 – 0:25)

**Action**:
- Ensure the application is open at `http://127.0.0.1:5173`.
- Press `P` to begin in **Presentation Mode** (camera is slowly orbiting the illuminated cyber city of `pallets/click`).

**Spoken Script**:
> *"Welcome to CodeCity AI. Most developer tooling treats source code as flat text files and dry dashboards. We asked a simple question: What if you could explore your entire repository as a living 3D metropolis—where building footprint is lines of code, building height is cyclomatic complexity, and building color is an ML prediction of where your next bug will appear?"*

**Action**:
- Press `P` or click `Exit Presentation` to reveal the mission-control HUD.

---

### Phase 2: Defect Risk & Hotspot Ranking (0:25 – 0:50)

**Action**:
- Direct attention to the Left Panel: **High-Risk Defect Hotspots**.
- Point out the top-ranked hotspot: `src/click/core.py` (98% risk).

**Spoken Script**:
> *"On the left, our XGBoost classifier has analyzed the temporal commit history of the repository strictly up to a cutoff time T, predicting defect likelihood over the subsequent 90 days. Notice that this isn't just counting recent churn—our pipeline extracts radon cyclomatic complexity, author entropy, past defect fixes, and architectural fan-in. In the hotspot ranking, `core.py` lights up as an urgent 98% defect risk."*

---

### Phase 3: The Blast Radius & 3D Parabolic Conduits (0:50 – 1:20)

**Action**:
- Click on `core.py` in the hotspot list.
- Watch the camera smoothly fly to `core.py`.
- Observe the glowing parabolic cyan tube conduits arcing through 3D space to `decorators.py` and `__init__.py`. Unrelated buildings dim to dark navy.

**Spoken Script**:
> *"Watch what happens when I click `core.py`. The camera flies to the building, but more importantly, look at the glowing cyan conduits arcing across the city. This is our AST Dependency Graph calculating the file's **Blast Radius** via reverse Breadth-First Search. If an engineer introduces a bug in `core.py`, it doesn't fail in isolation—everything that imports or calls it breaks transitively.
> We calculate an Impact Score: defect probability weighted by logarithmic dependent fan-in. So even if a small utility has high defect probability, a core module with 10 dependents has a far higher blast radius."*

**Action**:
- In the Right Drawer, click the **Hop Depth** buttons (`1`, `2`, `3`) to demonstrate filtering by dependency distance.

---

### Phase 4: Explainable AI & Model Honesty (1:20 – 1:45)

**Action**:
- Scroll down the Right Drawer to highlight the **AI Defect Diagnosis** card and the **SHAP Feature Contribution** bars.
- Click the **Model Card** button in the top navbar.

**Spoken Script**:
> *"Engineers don't trust black boxes. In the right drawer, we compute SHAP values for each individual file and translate them into a plain-English diagnosis—without calling any external LLM or cloud API.
> Now look at our Model Card: we report our numbers with complete scientific honesty. The model was evaluated on a strictly held-out repository that it never saw during training (`httpie/cli`), achieving an ROC-AUC of 0.667 and Precision@10 of 0.200—doubling the naive churn baseline. We enforce strict temporal boundaries with automated regression tests to guarantee zero data leakage."*

**Action**:
- Close the Model Card modal with `Esc` or the `Close` button.

---

### Phase 5: Live Scanning, Switching & Zero-Telemetry Guarantee (1:45 – 2:00)

**Action**:
- Use the navbar repository dropdown to switch from `pallets/click` to `psf/requests` or `pallets/flask` to demonstrate instant (< 500ms) offline caching.
- Point to the Left Panel "Analyze Python Repository" input.

**Spoken Script**:
> *"CodeCity AI runs 100% offline with zero cloud APIs, zero telemetry, and self-hosted fonts. You can analyze any public GitHub Python repository on the fly with live progress feedback, or load our pre-mined offline caches instantly.
> CodeCity AI gives engineering teams the superpower to see where their code will break next—and what breaks with it. Thank you!"*
