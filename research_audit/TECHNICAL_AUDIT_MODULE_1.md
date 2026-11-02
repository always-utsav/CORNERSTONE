# CORNERSTONE — Technical Audit & System Architecture Report
**Platform: CAPTAIN / CELA Interactive Research Demonstration Platform**  
**Date:** November 2026  
**Auditor:** Antigravity Autonomous Research & Engineering Agent  
**Scope:** Architecture, Backend APIs, Research Freeze Data, Frontend Architecture, Dependencies, Security & Integrity Audit  

---

## 1. Executive Summary

CORNERSTONE is the research platform for studying failure propagation in autonomous multimodal AI-agent executions, featuring the **CELA (Counterfactual Evidence-Lineage Attribution)** methodology.

The underlying codebase consists of:
- **692 passing tests** across 35 test suites.
- **18 completed implementation stages** (Stages 1 through 18).
- **V2 Scientific Research Freeze** with 275 controlled scenario instances across 11 benchmark mechanism families (BF-A through BF-K) across 5 deterministic seeds (42, 123, 456, 789, 1024).
- A Python Flask backend providing REST APIs for agent execution, trace collection, provenance graphs, evidence lineage, failure candidate screening, counterfactual replay, cascade optimization, benchmark execution, and experiment reproduction.
- Research figures (PNG and SVG formats) and frozen experiment JSON data files.

This audit establishes the baseline technical state prior to the architectural restructuring into an interactive, presentation-ready scientific demonstration platform.

---

## 2. Repository Inventory & Structural Mapping

```
CORNERSTONE/
├── benchmarks/                 # Benchmark configurations & definitions
├── captain/                    # Core Python package (Layers A through G)
│   ├── adapters/               # LLM abstraction (MockLLMProvider, GeminiAdapter)
│   ├── agent/                  # Multimodal reference agent (planner, reasoner, memory, tools)
│   ├── analysis/               # CEE estimator, cascade optimizer, greedy selector
│   ├── benchmarks/             # 11 scenario families (BF-A to BF-K), oracle, runner
│   ├── core/                   # Configuration, logging, deterministic IDs, exceptions
│   ├── evidence/               # Evidence identity, lineage builder, flow graph
│   ├── experiments/            # Experiment runner, statistics, bootstrap CIs
│   ├── explorer/               # Flask application & web presentation layer
│   │   ├── app.py              # Flask application factory (create_app) & API endpoints
│   │   └── templates/          # Jinja2 HTML templates (index.html, research.html)
│   ├── failures/               # Failure model, failure analyzer, candidate screening
│   ├── graph/                  # ExecutionGraph model, builder, validator, analyzer
│   ├── intervention/           # Counterfactual intervention specifications
│   ├── models/                 # Canonical events, artifacts, and execution runs
│   ├── provenance/             # Provenance extraction and lineage queries
│   ├── replay/                 # Counterfactual replay engine
│   ├── storage/                # FileTraceStore (JSON persistence)
│   └── tracing/                # Collector & TracedAgent wrapper
├── captain_results/            # Generated experiment outputs & demo summaries
├── captain_traces/             # Serialized execution traces (JSON format)
├── documentation/              # 66 comprehensive research markdown documents
├── paper/                      # Research paper draft, style guidelines, claim register
├── research/                   # Frozen research datasets and figure generation
│   ├── figures/                # 9 vector (SVG) and raster (PNG) publication figures
│   └── raw/                    # 16 frozen experiment JSON files (campaign, granularity, etc.)
└── tests/                      # 692 unit and integration tests
```

---

## 3. Backend Architecture & Route Audit

The Flask application (`captain/explorer/app.py`) serves both the interactive explorer and research inspection endpoints.

### 3.1 Existing Route Catalog

| Endpoint | Method | Status | Type | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `GET` | **Verified 200** | HTML | Main Explorer Dashboard (renders `index.html`) |
| `/research` | `GET` | **Verified 200** | HTML | Standalone Research Website (renders `research.html`) |
| `/api/demo` | `POST` | **Verified 200** | Live Execution | Runs a deterministic reference agent task; persists run |
| `/api/runs` | `GET` | **Verified 200** | Trace Store | Lists all recorded execution runs with summaries |
| `/api/run/<run_id>` | `GET` | **Verified 200** | Trace Store | Returns full event stream and artifact catalog |
| `/api/graph/<run_id>` | `GET` | **Verified 200** | Representation | Generates Vis.js graph nodes/edges + validation analysis |
| `/api/event/<run_id>/<event_id>` | `GET` | **Verified 200** | Representation | Details of a single execution event |
| `/api/artifact/<run_id>/<artifact_id>` | `GET` | **Verified 200** | Provenance | Details + upstream/downstream lineage of an artifact |
| `/api/provenance/<run_id>/<art_id>` | `GET` | **Verified 200** | Provenance | Upstream & downstream lineage graph traversal |
| `/api/evidence/<run_id>` | `GET` | **Verified 200** | CELA Engine | Evidence-flow nodes and transformations |
| `/api/failure/<run_id>` | `GET` | **Verified 200** | CELA Engine | Failure candidates and screening scores |
| `/api/demo/benchmark` | `POST` | **Verified 200** | Benchmark | Runs BF-A benchmark scenario with candidate evaluations |
| `/api/counterfactual/<scenario_id>` | `GET` | **Verified 200** | Counterfactual | Factual vs counterfactual CEE comparison |
| `/api/cascade/<scenario_id>` | `GET` | **Verified 200** | Cascade | Cascade analysis results vs post-hoc Oracle |
| `/api/experiment` | `POST` | **Verified 200** | Live Experiment | Executes parameterizable experiment suite |
| `/api/experiment/summary` | `GET` | **Verified 200** | Experiment | Aggregated F1, prevention rate, and confidence intervals |
| `/api/experiment/export` | `POST` | **Verified 200** | Export | Serializes experiment run to `captain_results/` |
| `/api/research/campaign` | `GET` | **Verified 200** | Frozen Data | Full 275-scenario campaign results (`campaign_full.json`) |
| `/api/research/granularity` | `GET` | **Verified 200** | Frozen Data | BF-G channel vs step intervention results |
| `/api/research/negative_controls`| `GET` | **Verified 200** | Frozen Data | Unrelated intervention sanity check |
| `/api/research/convergence` | `GET` | **Verified 200** | Frozen Data | Replay trial convergence rates |
| `/api/research/real_llm` | `GET` | **Verified 200** | Frozen Data | Gemini 3.6-flash sanity check verification |
| `/api/research/claims` | `GET` | **Verified 200** | Frozen Data | Claim registry with 7 formal research claims |
| `/api/research/figures/<name>` | `GET` | **Verified 200** | Static Assets | Serves vector/raster publication figures |

---

## 4. Research Data & Scientific Evidence Audit

### 4.1 Benchmark Families (275 Scenarios, 5 Seeds)
The research evaluation uses 11 mechanism families:
- **BF-A**: Single causal channel (1 candidate).
- **BF-B**: Two independent causes.
- **BF-C**: Redundant OR causes (either channel sufficient to cause failure).
- **BF-D**: Cascade 2-hop (channel 1 $\to$ intermediate $\to$ failure).
- **BF-E**: Cascade 3-hop (deep multi-step propagation).
- **BF-F**: Dense confounding (multiple converging candidate channels).
- **BF-G**: **Shared source** (1 tool produces 2 artifacts: 1 faulty, 1 critical/unrelated). *This is the critical benchmark proving channel-level granularity superiority over event-level.*
- **BF-H**: Long trace with late failure.
- **BF-I**: Tool error recovery with partial artifact decay.
- **BF-J**: Multimodal artifact fusion (text + image).
- **BF-K**: Cyclic reasoning trace with back-tracking.

### 4.2 Research Claims & Status Verification
Inspection of `claim_registry.json` validates the strict scientific integrity of the platform:
- **Claim C1 (Supported)**: Channel intervention provides more selective localization than source-event intervention.
- **Claim C2 (Supported)**: Channel intervention preserves unrelated evidence ($p < 0.001$).
- **Claim C3 (Negative Finding / Not Supported)**: Full CELA pipeline (A5) does *not* achieve statistically significantly higher causal F1 scores than random baseline (B1) across the full suite of simple synthetic benchmarks ($p=0.1156$).
- **Claim C4 (Supported)**: Negative controls yield CEE $= 0.0$ for unrelated interventions.
- **Claim C5 (Supported)**: Results remain consistent across independent seeds ($42, 123, 456, 789, 1024$).
- **Claim C6 (Supported)**: CEE converges asymptotically with replay sample count.
- **Claim C7 (Supported)**: Real LLM (Gemini 3.6-flash) sanity check verifies non-zero CEE under semantic evidence perturbation.

---

## 5. Security & Repository Safety Remediations

1. **Exposed Credentials Remediated**:
   - The archive contained a populated `.env` file with an active `GEMINI_API_KEY`.
   - `.env` was confirmed to be in `.gitignore` and has never been committed to git history.
   - The file on disk has been scrubbed and replaced with safe placeholder values (`GEMINI_API_KEY=your_gemini_api_key_here`).
   - `.env.example` has been updated with clear setup instructions.
2. **Secret Exposure in Frontend**:
   - Zero API keys are present or referenced in frontend JavaScript or HTML templates.
   - All backend calls avoid echoing credentials or sensitive tokens in JSON responses or log streams.
3. **Sandbox & Storage Safety**:
   - Trace and experiment exports are confined to `captain_traces/` and `captain_results/`.
   - Path traversal protections are verified for figure and file endpoints.
