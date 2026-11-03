# CORNERSTONE Module 4: Final Scientific Integrity, Repository Consistency & Faculty Defense Readiness Report

**Platform:** CORNERSTONE Interactive Research Demonstration Platform  
**Target Repository:** `always-utsav/CORNERSTONE`  
**Framework:** CAPTAIN & CELA (Counterfactual Evidence-Lineage Attribution)  
**Scientific State:** Version 2.0 (Authoritative Scientific Freeze, Software Commit: `761f78f` / `98e6366c6e47`)  
**Verified Test Count:** **730 Passing Tests** (692 baseline + 10 Module 2 + 18 Module 3 + 10 Module 4)  
**Static Analysis:** Ruff: `All checks passed!` | Mypy: `Success: no issues found in 2 source files`  
**Raw Data Immutability:** `git status -- research/raw/` -> 100% clean (zero modifications)  

---

## A. Issues Found and Severity

During the Phase 1 comprehensive repository audit, 9 distinct inconsistencies and discrepancies were cataloged:

1. **AUD-01 (Severity: HIGH) — Model Identity Discrepancy**:
   - *Observation:* Multiple UI cards, slides, and reports referred to the Real-LLM validation model as `Gemini 2.5 Flash`.
   - *Authoritative Record:* `research/raw/real_llm_validation.json` explicitly documents `provider: "google_gemini"` and `model: "gemini-3.6-flash"`. Also corroborated by `research/tables/table_07_real_llm.md` and `documentation/30_REAL_LLM_VALIDATION.md`.

2. **AUD-02 (Severity: CRITICAL) — Real-LLM Trial Failure Accounting**:
   - *Observation:* Summary metrics (Channel CEE = 0.40) were presented without trial-level error accounting, implying 15 independent successful model evaluations.
   - *Authoritative Record:* Individual trial inspections revealed that 10 out of 15 API calls encountered `[GEMINI_ERROR: ResourceExhausted]` errors (3/5 in factual, 3/5 in channel, 4/5 in source-event). The recorded rate of $0.40$ was an artifact of dividing 2 observed failures by the 5 attempted queries ($2/5 - 0/5$). On valid non-exhausted calls, the factual failure rate was $2/2 = 1.00$ and channel failure rate was $0/2 = 0.00$ (conditional CEE = $1.00$).

3. **AUD-03 (Severity: HIGH) — Baseline Nomenclature Discrepancy**:
   - *Observation:* An early draft in `documentation/22_BASELINES.md` listed B4 as "Cost-only" and B5 as "Oracle".
   - *Authoritative Record:* The Stage 16 code in `captain/benchmarks/baselines.py` and all frozen campaign results (`benchmark_seed_*.json`, `campaign_full.json`) establish B4 as `B4_graph_structural` (distance to failure) and B5 as `B5_cost_aware` (screening score / cost), with `ExhaustiveOracle` explicitly separated as an evaluation-only diagnostic module for computing regret.

4. **AUD-04 (Severity: HIGH) — BF-G Statistical Test Metadata**:
   - *Observation:* `claim_registry.json` lists `wilcoxon_signed_rank` for C1 and C2, despite paired differences being constant across $N=5$ instances.
   - *Authoritative Record:* `PAPER_STYLE_AND_CONSTRAINTS.md` Rules 25 & 26 explicitly mandate reporting BF-G as an **unanimous descriptive observation (5/5 instances)** and prohibit inferential $p$-values.

5. **AUD-05 (Severity: MEDIUM) — Lingering Significance Text in Slide Notes**:
   - *Observation:* Stale presenter notes contained lingering $p < 0.001$ language.
   - *Authoritative Record:* Strict rule alignment requires descriptive reporting only.

6. **AUD-06 & AUD-07 (Severity: MEDIUM) — Cost-Utility and Oracle Alignment Traceability**:
   - *Observation:* High-level claims ("$\ge 94\%$ Oracle alignment", $64.8\%$ cost reduction, $0.720$ utility) lacked exact denominator documentation.
   - *Authoritative Record:* Fully traced to `benchmark_seed_42.json` and all 5 seeds ($274/275$ scenarios or $99.64\%$ exact match with zero regret; $54/55 = 98.18\%$ for Seed 42).

7. **AUD-08 (Severity: MEDIUM) — Semantic Provenance Badging**:
   - *Observation:* Some dashboard cards lacked clear visual distinction between frozen research data, live execution, and conceptual explanation.

8. **AUD-09 (Severity: LOW) — Stale Test Count Badges**:
   - *Observation:* Telemetry badges showed 692 or 702 tests instead of current passing count.

---

## B. Corrections Made

1. **Model Identity Standardized**:
   - All references across `README.md`, `captain/explorer/app.py`, `index.html`, `researchDashboard.js`, and `presentationController.js` updated to **`gemini-3.6-flash`**.
2. **Transparent Real-LLM Breakdown Card**:
   - Added a dedicated Real-LLM Breakdown Table in the research dashboard showing attempted calls (5), valid completions (2, 2, 1), and ResourceExhausted API errors (3, 3, 4).
   - Explicitly clarified the distinction between conditional CEE on valid calls ($1.00$) and raw denominator CEE ($0.40$).
   - Explicitly qualified the experiment as a targeted prompt-level sanity check on evidence dependency, not an end-to-end autonomous agent replay.
3. **Canonical Baseline & Oracle Architecture**:
   - Synchronized `documentation/22_BASELINES.md`, `/api/research/methods`, and UI comparison tables to canonical identifiers:
     - `B1_random`: Random Baseline
     - `B2_provenance`: Provenance-Only
     - `B3_cee_rank`: CEE-Rank
     - `B4_graph_structural`: Graph-Structural Distance
     - `B5_cost_aware`: Cost-Aware Structural
     - `ExhaustiveOracle`: Evaluation-Only Diagnostic Upper Bound
   - Documented and verified equivalences $A_1 \equiv B_2$ and $A_2 \equiv B_3$.
4. **BF-G Statistical Honesty**:
   - Scrubbed all rendered templates, presentation slides, speaker notes, and tooltips of any inferential $p < 0.001$ language for BF-G.
   - Emphasized the sample size ($N=5$) and zero-variance property across all presentation views.
5. **Exact Numerators/Denominators Documented**:
   - Cost reduction: $(2.2727 - 0.8000) / 2.2727 = 64.80\%$ from `benchmark_seed_42.json`.
   - Utility formula: $\mathcal{U} = \text{CEE} - \lambda \cdot \text{Cost}$ with $\lambda = 0.1$.
   - Oracle zero-regret alignment: $274 / 275$ scenarios ($99.64\%$) across all 5 seeds ($54/55 = 98.18\%$ in Seed 42).
6. **Provenance Badges Applied**:
   - Displayed explicit semantic badges (`FROZEN RESEARCH DATA`, `LIVE BACKEND EXECUTION`, `ILLUSTRATIVE DEMONSTRATION`, `CONCEPTUAL EXPLANATION`) across all views.
7. **Test Count Synchronized**:
   - Top status bar and documentation updated to reflect **730 Verified Tests**.

---

## C. Scientific Claims Retained

1. **Claim C1 (Preservation Selectivity)**: Channel intervention isolates evidence with strictly higher selectivity than source-event intervention in multi-artifact tools.
2. **Claim C2 (Collateral Evidence Preservation)**: Channel intervention preserves unrelated co-produced artifacts with 0% collateral modification across all 5 evaluated BF-G instances (unanimous descriptive observation).
3. **Claim C4 (Negative Controls Falsification)**: Synthetic interventions on benign artifacts and irrelevant tools yield observed $\text{CEE} = 0.000$ (100% specificity, zero false attributions).
4. **Claim C5 (Seed Stability)**: Metric variance across master seeds `42`, `123`, `456`, `789`, `1024` remains stable with $\text{CV} < 0.20$.
5. **Claim C6 (Deterministic Replay Convergence)**: Replay convergence stabilizes immediately under deterministic MockLLM environment semantics.
6. **Cost-Utility Knapsack Dominance**: CELA A5 cuts intervention cost by 64.8% and achieves optimal Pareto utility ($0.720$ vs $0.573$ for B1 at $\lambda = 0.1$) with 0.0% distractor selection.

---

## D. Claims Narrowed or Removed

1. **Wilcoxon Inferential Significance for BF-G Removed**:
   - *Status:* Formally narrowed to **Unanimous Descriptive Observation ($5/5$ instances)**.
   - *Reason:* $N=5$ zero-variance differences make rank tests degenerate. No inferential $p$-value is claimed.
2. **Claim C3 (A5 > B1 on Causal F1) Transparently Maintained as NOT SUPPORTED**:
   - *Status:* Formally reported as **NOT SUPPORTED** ($p = 0.1156$, adjusted $p = 1.0$).
   - *Explanation:* Random baseline B1 achieves high F1 on small graphs purely by chance, but incurs $73.3\%$ distractor false selection. CELA's contribution is distractor rejection and cost reduction.
3. **Claim C7 (Real-LLM Validation) Narrowed**:
   - *Status:* Narrowed from "real-world validation" to **targeted prompt-level sanity check on `gemini-3.6-flash`**.
   - *Reason:* 10 of 15 API trials encountered `ResourceExhausted` quota limits; the experiment evaluates keyword sensitivity under handcrafted prompts, not an end-to-end autonomous agent execution.

---

## E. UI and Workflow Verification

- **Command Center & Pipeline Visualizer**: Interactive animated canvas operating smoothly; quick action buttons trigger demo executions.
- **Agent Simulator (`#view-agent-simulator`)**: Real-time execution via `/api/demo`, playback controls (Play, Pause, Step Next, Step Prev, Reset), and event inspect panel functioning cleanly.
- **Evidence Flow Explorer (`#view-evidence-flow`)**: Vis.js bipartite DAG visualization renders events (cyan boxes) and artifacts (violet ellipses) with bi-directional dependency tracing and synchronized details inspector.
- **CELA Intervention Lab (`#view-granularity-lab`)**: Side-by-side SVG comparison of Mode A (Source-Event Override) vs Mode B (CELA Channel Replacement) with live execution via `/api/granularity/run`.
- **Failure Cascade Lab (`#view-cascade-lab`)**: Multi-hop propagation canvas and interactive $\lambda$ regularization slider sweeping cost penalties from aggressive ($\lambda=0$) to conservative ($\lambda=10$).
- **Benchmark Studio (`#view-benchmark-studio`)**: 11 topological family cards (BF-A to BF-K) with diagnostic drawer, live scenario generation, and publication figure jump links.
- **Research Results Dashboard (`#view-research-results`)**: 8-section command center with seed toggles (42, 123, 456, 789, 1024), 10-method performance matrix, BF-G dedicated callout, real-LLM breakdown table, honesty panel, claim ledger, and publication figure gallery.
- **Figure Gallery & Inspector Modal**: All 9 publication figures open in high-resolution modal zoom with SVG/PNG download buttons.
- **Methodology Explorer (`#view-methodology`)**: 12-stage clickable pipeline with rendered KaTeX formulas, input/output data structures, complexity bounds, and algorithm steps.
- **12-Slide Presentation Mode**: Fullscreen projector mode with keyboard controls (`Space`, `Arrows`, `P`, `N`, `F`, `Esc`), slide counter, comprehensive speaker notes drawer, and direct jump links to live labs.

---

## F. Security & Reproducibility Verification

- **Credential Safety**: No real `.env` file committed. `.env` is ignored by `.gitignore` and contains only placeholder values (`GEMINI_API_KEY=your_gemini_api_key_here`). `.env.example` provides safe guidance.
- **Input Sanitization**: User-provided task text in `/api/demo` is safely passed and serialized without script execution vulnerability.
- **Error Boundaries**: Invalid seed requests to `/api/research/benchmark/<seed>` return clean HTTP 404 responses with available seed lists. Non-existent figure requests return clean 404s.
- **CI / Build State**: Repository runs completely offline with deterministic seed replay. CI workflow files are not configured in repository; all tests pass locally in stdlib/pytest environment.

---

## G. Test and Static Analysis Results

```powershell
python -m pytest tests/ -q
# Result: 730 passed in 13.15s (100% passing)

python -m ruff check captain/explorer/app.py tests/unit/test_module4.py
# Result: All checks passed!

python -m mypy captain/explorer/app.py tests/unit/test_module4.py
# Result: Success: no issues found in 2 source files
```

---

## H. Frozen Data Integrity Check

```powershell
git status -- research/raw/
# Result: On branch main, nothing to commit, working tree clean
```
Zero bytes modified across all raw JSON files:
- `research/raw/benchmark_seed_42.json`
- `research/raw/benchmark_seed_123.json`
- `research/raw/benchmark_seed_456.json`
- `research/raw/benchmark_seed_789.json`
- `research/raw/benchmark_seed_1024.json`
- `research/raw/campaign_full.json`
- `research/raw/claim_registry.json`
- `research/raw/granularity_experiment.json`
- `research/raw/negative_controls.json`
- `research/raw/real_llm_validation.json`
- `research/raw/replay_convergence.json`
- `research/raw/scalability.json`
- `research/raw/cost_utility_sweep.json`
- `research/raw/cascade_experiment.json`
- `research/raw/pathway_stress.json`
- `research/raw/experiment_manifest.json`

---

## I. Remaining Limitations

1. **Controlled Synthetic Topologies**: Benchmark scenarios (BF-A to BF-K) evaluate synthetic mechanism primitives with mathematically specified causal structures rather than open-ended natural human agent prompts.
2. **Single-Channel OR-Gate Ineffectiveness**: In BF-B (Redundant OR), single-channel interventions have $\text{CEE} = 0.0$ because breaking one tributary channel leaves parallel faulty evidence active. Overcoming this requires joint multi-channel cut sets.
3. **Deterministic Mock Replay Convergence**: Replay convergence ($\text{CI width} = 0.0$) is facilitated by deterministic mock LLM semantics. Real probabilistic models exhibit non-zero token entropy across runs.
4. **Prompt-Level Real-LLM Scope**: The Gemini validation is a controlled prompt sensitivity check on `gemini-3.6-flash`, subject to API quota constraints, rather than an unconstrained multi-turn autonomous agent benchmark.

---

## J. Final Faculty-Defense Readiness Assessment

**VERDICT: FULLY READY FOR FACULTY DEFENSE**

The platform satisfies all criteria for a doctoral/faculty-level research evaluation:
- Complete internal consistency across backend, frontend, slides, and documentation.
- Zero reliance on invalid statistical significance claims.
- Absolute transparency regarding negative results (Claim C3) and API quota limitations (Claim C7).
- Seamless dual-mode presentation: high-level narrative walkthrough for general faculty evaluators, and deep technical inspection (bipartite graphs, KaTeX math, raw JSON ledgers) for causal inference researchers.
- 730 automated tests verifying every critical scientific and architectural invariant.
