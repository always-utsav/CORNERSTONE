# CORNERSTONE — Module 1 Architecture & Implementation Foundation
**Phase 1: Platform Architecture, Experience Design, and Interface Foundation**  
**Project:** CORNERSTONE — Interactive Research Demonstration Platform  
**System Base:** CAPTAIN / CELA (Counterfactual Evidence-Lineage Attribution)  
**Scientific Version:** V2 (Frozen Research Base)  
**Date:** November 2026  

---

## 1. Overview & Vision

Module 1 establishes the operational and aesthetic foundation for **CORNERSTONE**, an interactive scientific software demonstration platform designed for university faculty evaluations, external research presentations, and deep technical inspection.

The platform transforms the original CAPTAIN/CELA research prototype into an aerospace mission-control-inspired scientific visualization environment that visually communicates the full 13-stage causal journey:

$$\text{User Task} \longrightarrow \text{Agent Execution} \longrightarrow \text{Execution Trace} \longrightarrow \text{Artifacts \& Provenance} \longrightarrow \text{Evidence Graph} \longrightarrow \text{Failure Localization} \longrightarrow \text{Candidate Channels} \longrightarrow \text{Counterfactual Intervention} \longrightarrow \text{Replay} \longrightarrow \text{CEE Estimation} \longrightarrow \text{Propagation \& Cascade} \longrightarrow \text{Evaluation \& Oracle} \longrightarrow \text{Research Evidence}$$

---

## 2. Structural & Modular Architecture

### 2.1 Backend Architecture (`captain/explorer/app.py`)
The Flask application was preserved and enhanced with static file serving and extended research endpoints:
- **Static Assets Root**: Mounted at `/static` pointing directly to `captain/explorer/static/`.
- **Existing APIs**: 100% backwards compatibility maintained for `/api/demo`, `/api/runs`, `/api/run/<id>`, `/api/graph/<id>`, `/api/evidence/<id>`, `/api/failure/<id>`, `/api/counterfactual/<id>`, `/api/cascade/<id>`, `/api/experiment`, and `/research`.
- **New Scientific Endpoints**:
  - `/api/research/cascade`: Multi-step propagation cascade experiment dataset (`cascade_experiment.json`).
  - `/api/research/cost_utility`: $\lambda_{\text{cost}}$ trade-off sweep dataset (`cost_utility_sweep.json`).
  - `/api/research/pathway_stress`: Topological robustness data (`pathway_stress.json`).
  - `/api/research/scalability`: Runtime benchmark scaling metrics (`scalability.json`).
  - `/api/research/manifest`: Replication checksums and provenance ledger (`experiment_manifest.json`).
  - `/api/system/status`: Real-time platform status, verified test count (692), and execution statistics.

### 2.2 Modular Frontend Architecture

```
captain/explorer/
├── app.py                      # Flask factory (create_app) & REST API endpoints
├── templates/
│   ├── index.html              # Core application shell & Command Center
│   └── research.html           # Legacy/supplementary research website
└── static/
    ├── css/
    │   ├── theme.css           # Design tokens, midnight navy surfaces, contrast, typography
    │   ├── layout.css          # Top telemetry bar, persistent navigation sidebar, workspace
    │   ├── components.css      # Metric cards, scientific badges, precision buttons, tables
    │   ├── command-center.css  # Hero layout, central visualizer styling, laboratory launchpad
    │   └── presentation.css    # Scaled projector typography, presentation dock, notes drawer
    └── js/
        ├── api.js              # Type-safe client for all REST endpoints with error handling
        ├── state.js            # Central reactive state manager & observer bus
        ├── components/
        │   ├── statusBar.js    # Persistent top header (live UTC clock, telemetry, run pill)
        │   ├── nav.js          # Sidebar navigation, route hashing, numeric shortcuts (1-0)
        │   ├── agentPipelineVisualizer.js # Animated interactive canvas for evidence flow
        │   └── presentationController.js  # Projector slide deck controller & speaker notes
        └── app.js              # Master application bootstrap & quick-action triggers
```

---

## 3. Visual Design System

### 3.1 Color Palette & Semantics
- **Background Surfaces**: Deep Midnight Navy
  - Base: `#040711` / Deep Viewport: `#070c18`
  - Surfaces: `#0d1527` / Elevated Cards: `#121d34` / Active Items: `#1b2c4e`
- **Electric Cyan** (`#00e5ff`, `#38bdf8`): Information flow, active evidence channels, live telemetry.
- **Deep Violet** (`#8b5cf6`, `#a78bfa`): Analytical operations, causal reasoning, CEE estimation.
- **Crimson / Red** (`#f43f5e`): Failure propagation, corrupted evidence channels, collateral damage warnings.
- **Emerald Green** (`#10b981`): Preserved evidence, oracle ground truth, successful task recovery.
- **Amber** (`#f59e0b`): Warnings, baseline comparisons, non-supported findings.

### 3.2 Scientific Integrity Badges
Every piece of data rendered in the interface clearly distinguishes its provenance:
1. `badge-measured`: Verified frozen empirical research results (`research/raw/`).
2. `badge-live`: Real-time backend execution results generated on demand.
3. `badge-illustrative`: Interactive simulations and visual step walk-throughs.
4. `badge-conceptual`: Theoretical diagrams and mathematical formulations.

---

## 4. Main Navigation Hierarchy

The application shell provides persistent navigation partitioned into four logical groups:

| Group | Section | Route / Hash | Key Shortcut | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Executive & Overview** | Command Center | `#command-center` | `1` | Research opening, interactive pipeline visualizer, laboratory launchpad |
| | Research Story | `#research-story` | `2` | Narrative walkthrough for faculty and technical evaluators |
| **Interactive Laboratories** | Agent Simulator | `#agent-simulator` | `3` | Live task execution and event trace collection |
| | Evidence Explorer | `#evidence-explorer` | `4` | Bipartite graph inspection and provenance lineage |
| | CELA Intervention Lab | `#cela-lab` | `5` | Channel-level counterfactual intervention & CEE calculation |
| | Failure Cascade Lab | `#cascade-lab` | `6` | Multi-hop propagation analysis and cost-utility trade-offs |
| **Scientific Evidence** | Benchmark Studio | `#benchmark-studio` | `7` | 11 mechanism families (BF-A to BF-K) across 275 scenarios |
| | Research Results | `#research-results` | `8` | Frozen campaign metrics, confidence intervals, publication figures |
| **Foundations** | Methodology & Math | `#methodology` | `9` | Mathematical formulation of CEE and do-calculus channel intervention |
| | About the Research | `#about` | `0` | Authors, reproducibility protocol, version freeze details |

---

## 5. Command Center & Agent Pipeline Visualizer

The Command Center provides an animated, interactive SVG/Canvas visualization demonstrating:
1. **User Task Ingestion**: Task decomposition into planning events.
2. **Tool Execution**: Invocations of external tools (calculator, database, memory).
3. **Artifact Generation & Branching**: A single source step produces dual artifacts ($A_1$: corrupted formula; $A_2$: valid audited baseline).
4. **Channel Lineage**: Channel 1 carries $A_1$; Channel 2 carries $A_2$.
5. **Failure Localization**: Downstream failure triggered by Channel 1.
6. **Granularity Comparison Toggle**:
   - **Coarse Step-Level**: Re-executing Step #2 alters *both* $A_1$ and $A_2$, causing 100% collateral evidence loss.
   - **CELA Channel-Level**: Intervening specifically on Channel 1 repairs the fault while keeping $A_2$ 100% preserved.

---

## 6. Presentation Mode

Designed specifically for live research presentations and auditorium projectors:
- **Activation**: Toggle via topbar button or pressing `P` on the keyboard.
- **Controls**:
  - `ArrowRight` / `Space` / `PageDown`: Advance slide.
  - `ArrowLeft` / `PageUp`: Previous slide.
  - `F`: Toggle HTML5 full-screen.
  - `N`: Toggle speaker notes and technical talking points drawer.
  - `Esc`: Exit presentation mode.
- **10-Slide Research Narrative**:
  Covers the full story from problem motivation, mechanism topologies, granularity proofs, real-LLM validation, to transparent negative findings (Claim C3).

---

## 7. Security Cleanup

1. **Exposed Credentials Remediated**:
   - Scrubbed active `GEMINI_API_KEY` from disk in `.env`.
   - Populated `.env.example` with clear instructions on configuring real LLM validation safely.
   - Verified that `.env` is ignored by `.gitignore` and has never been committed in git history.
2. **Frontend Safety**:
   - Zero credentials or tokens are referenced in static JS or HTML files.

---

## 8. Working Startup Instructions

### 8.1 Launch the Interactive Demonstration Platform
From the repository root:
```bash
python -m captain.explorer
```
Or alternatively:
```bash
python scripts/launch_explorer.py
```
Open your browser to: **`http://127.0.0.1:5000`**

### 8.2 Run One-Command Deterministic Demo
```bash
python -m captain.demo
```

### 8.3 Run Verification Suite
```bash
python -m pytest tests/ -q
python -m ruff check captain/explorer/app.py
python -m mypy captain/explorer/app.py
```
**Verification status:** 692 passed tests (100% pass rate).
