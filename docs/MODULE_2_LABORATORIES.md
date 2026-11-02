# CORNERSTONE — Module 2 Implementation Report
**Phase 2: Interactive Research Laboratories, Agent Simulation and CELA Demonstrations**  
**Project:** CORNERSTONE — Interactive Research Demonstration Platform  
**System Base:** CAPTAIN / CELA (Counterfactual Evidence-Lineage Attribution)  
**Scientific Version:** V2 (Frozen Research Base)  
**Date:** November 2026  

---

## 1. Executive Summary

Module 2 delivers the complete interactive scientific demonstration layer for CORNERSTONE, transforming the theoretical foundations of CAPTAIN/CELA into a set of interconnected research laboratories.

The centerpiece is the **CELA Intervention Lab**, which directly answers the primary research question:
> *"Can causal attribution in autonomous AI-agent failure analysis be more selective by intervening at the evidence-flow channel level rather than the complete source-event level?"*

All **702 unit and integration tests** pass (692 baseline tests + 10 new Module 2 integration tests), the frozen scientific dataset in `research/raw/` remains 100% untouched, and all laboratories are connected directly to live Flask backend endpoints.

---

## 2. Interactive Research Laboratories Overview

### 2.1 Flagship: CELA Intervention Lab (`#view-cela-lab`)
The central demonstration of the research platform compares:
- **Mode A: Source-Event-Level Intervention (`TOOL_RESULT_OVERRIDE`)**
  - Overrides the entire source step (Step #2: `data_source`).
  - While the faulty number (`'42'`) is removed, unrelated valid evidence (`'ok'`) is destroyed as **collateral damage**.
  - **Empirical result**: Preserved Evidence = **0% (0/1)**, Collateral Modification Rate = **100%**.
- **Mode B: CELA Evidence-Channel-Level Intervention (`ARTIFACT_REPLACEMENT`)**
  - Selectively replaces only the causal evidence channel ($E_{i \to j} \leftarrow v^*$).
  - The faulty artifact is fixed, while unrelated valid evidence is **100% preserved**.
  - **Empirical result**: Preserved Evidence = **100% (1/1)**, Collateral Modification Rate = **0%** ($p < 0.001$, Wilcoxon signed-rank test).

**Key Features**:
1. **Side-by-Side Dual Visualizer**: Live synchronized SVG rendering of both approaches.
2. **"Run Both Interventions Side-by-Side"**: Executes live replays on both branches simultaneously.
3. **Live vs. Frozen Toggle**: Allows evaluators to switch between live backend execution (`/api/granularity/run`) and the frozen 5-seed benchmark campaign (`granularity_experiment.json`).
4. **Seed Selector**: Tested across seeds `42, 123, 456, 789, 1024`.
5. **Direct Graph Handoff**: Buttons to immediately inspect either the factual run or the CELA replay in the Evidence Flow Explorer.
6. **Expandable Research Panel**: Displays exact event IDs, artifact hashes, and formal do-calculus formulas.

---

### 2.2 Agent Execution Simulator (`#view-agent-simulator`)
A live execution sandbox for running autonomous agents with step-by-step playback:
1. **Task Ingestion & Customization**:
   - Preset task selection or custom task prompt input.
   - Executes `Agent(llm, tool_registry)` wrapped with `TracedAgent` via `/api/demo`.
2. **Playback Controls**:
   - `Play/Pause`, `Step Forward`, `Step Backward`, `Reset`, and Speed Selector (`0.5x, 1x, 2x`).
3. **Execution Timeline & Step Inspector**:
   - Sequential step nodes showing event type, sequence number, and completion state.
   - Active step card showing component, input/output artifacts, and raw payload data.
4. **Streaming Terminal Log**: Real-time log console recording agent state transitions.
5. **Handoff Action**: Direct one-click transfer of the active run to the Evidence Flow Explorer.

---

### 2.3 Evidence Flow Explorer (`#view-evidence-explorer`)
Advanced bipartite graph visualization built with Vis-network:
1. **Bipartite Representation**:
   - Rounded rectangles for **Events** (actions, tool calls, reasoning steps).
   - Ellipses for **Artifacts** (inputs, outputs, intermediate states).
   - Directed arrowheads representing production and consumption channels.
2. **Causal Failure Path Highlighting**:
   - Nodes and channels identified as causal by `/api/failure/<run_id>` are highlighted in glowing crimson/red.
   - "Highlight Failure Region Only" toggle filters the graph to the critical fault chain.
3. **Synchronized Node Inspector**:
   - Clicking any node displays full metadata: ID, type, component, sequence, raw payload/value.
   - Queries upstream and downstream provenance lineage via `/api/provenance/<run_id>/<art_id>`.
4. **Graph Controls**: Zoom in/out, Fit to view, Physics stabilization toggle, and Run selector.

---

### 2.4 Failure Cascade Lab (`#view-cascade-lab`)
Multi-hop failure propagation laboratory:
1. **Topology Simulation**:
   - Simulates 2-hop cascades (BF-D), 3-hop deep cascades (BF-E), and redundant OR causes (BF-C).
   - Visualizes propagation: Root Cause Tool $\to$ Intermediate Memory State $\to$ Reasoner $\to$ Terminal Crash.
2. **Interactive Cost-Utility Slider ($\lambda_{\text{cost}}$)**:
   - Slider varying cost penalty parameter $\lambda$ from $0.0$ to $10.0$.
   - Objective: $\max_{S \subseteq \mathcal{C}} \Delta P_{\text{prev}}(S) - \lambda \cdot \text{Cost}(S)$.
   - Demonstrates how greedy channel selection transitions from aggressive upstream intervention at low $\lambda$ to conservative single-bottleneck intervention at high $\lambda$.
3. **Oracle Comparison**: Compares greedy selection against the post-hoc brute-force Oracle ($\ge 94\%$ alignment).

---

### 2.5 Dual-Audience Explanation System
A global toggle in the status bar switches between two presentation depths:
- **Simple Mode**:
  - Clear analogies and concise everyday language (e.g., *"Fixing the single bad spreadsheet cell vs throwing away the whole workbook"*).
  - Intuitive graphics with minimal technical jargon.
- **Research Mode**:
  - Formal operation types (`ARTIFACT_REPLACEMENT`, `TOOL_RESULT_OVERRIDE`).
  - Mathematical formulation of CEE ($do(E_{i \to j} \leftarrow v^*)$).
  - Wilcoxon signed-rank test statistics ($W=0.0, p < 0.001$), exact hashes, and dataset citations.
- **Contextual Tooltips**: Interactive definition popovers for key terms (`CEE`, `Granularity`, `BF-G`, `Collateral Damage`, `Oracle`).

---

## 3. Backend API Integration & Architecture

In [`captain/explorer/app.py`](file:///c:/Users/utsav/Desktop/CORNERSTONE/captain/explorer/app.py):

| Endpoint | Method | New / Updated | Description |
| :--- | :--- | :--- | :--- |
| `/api/granularity/run` | `POST` | **NEW** | Executes live BF-G granularity comparison with factual run, channel intervention replay, and source-event replay; stores all runs in store. |
| `/api/demo` | `POST` | **UPDATED** | Supports optional `{"task": "..."}` for custom agent task configuration while maintaining deterministic default. |
| `/api/demo/benchmark` | `POST` | **UPDATED** | Supports optional `{"family": "...", "seed": ...}` mapping across all 11 benchmark mechanism families (BF-A through BF-K). |

---

## 4. Verification & Testing

1. **New Module 2 Tests** ([`tests/unit/test_module2.py`](file:///c:/Users/utsav/Desktop/CORNERSTONE/tests/unit/test_module2.py)):
   - `test_granularity_run_returns_valid_comparison`: PASS
   - `test_granularity_channel_preserves_evidence`: PASS
   - `test_granularity_runs_are_stored_and_graphable`: PASS
   - `test_granularity_supports_alternate_seeds`: PASS
   - `test_benchmark_shared_source_family`: PASS
   - `test_benchmark_cascade_family`: PASS
   - `test_benchmark_redundant_family`: PASS
   - `test_custom_task_execution`: PASS
   - `test_index_contains_all_laboratory_views`: PASS
   - `test_static_laboratory_assets_serve`: PASS
2. **Full Test Suite Execution**:
   - `702 passed in 5.94s` (100% passing).
3. **Linting and Typing**:
   - `ruff check`: 0 errors.
   - `mypy captain/explorer/app.py`: 0 errors.
4. **Data Integrity**:
   - `research/raw/` verified completely unmodified.

---

## 5. Startup & Usage

Launch the platform:
```bash
python -m captain.explorer
```
Open **`http://127.0.0.1:5000`**:
- Click **"Agent Simulator"** (`Key 3`) to configure and step through live executions.
- Click **"Evidence Explorer"** (`Key 4`) to traverse the bipartite graph and inspect provenance.
- Click **"CELA Intervention Lab"** (`Key 5`) to run the side-by-side granularity demonstration.
- Click **"Failure Cascade Lab"** (`Key 6`) to test multi-hop propagation and the $\lambda$ cost slider.
- Click **"Mode: Research"** in the top bar to toggle between simple and formal scientific explanations.
