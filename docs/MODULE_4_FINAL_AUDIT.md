# CORNERSTONE Module 4 — Final Scientific Integrity & Repository Consistency Audit

**Audit Timestamp:** 2026-11-02T23:25:00+05:30  
**Scope:** Complete repository inspection of frozen raw research data, baseline definitions, statistical claims, API endpoints, frontend UI, presentation mode, speaker notes, and test coverage.  
**Authoritative Reference Sources:**
- `research/raw/*.json` (V2 Scientific Freeze)
- `documentation/PAPER_STYLE_AND_CONSTRAINTS.md` (Mandatory Scientific Writing Rules)
- `documentation/22_BASELINES.md` (Baselines & Method Definitions)
- `documentation/30_REAL_LLM_VALIDATION.md` (Real-LLM Protocol & Constraints)
- `captain/benchmarks/baselines.py` (Canonical Python Method Implementations)

---

## 1. Executive Summary of Audit Findings

| ID | Location | Observed Issue | Authoritative Reference | Severity | Correction Strategy |
|:---|:---|:---|:---|:---|:---|
| **AUD-01** | `README.md`, `index.html`, `app.py`, `presentationController.js`, `MODULE_3_FINAL_REPORT.md` | Model labeled as `Gemini 2.5 Flash` | `research/raw/real_llm_validation.json` lines 3-4 explicitly record `gemini-3.6-flash`. Also confirmed in `table_07_real_llm.md` and `30_REAL_LLM_VALIDATION.md`. | **HIGH** | Replace all references with `gemini-3.6-flash`. |
| **AUD-02** | `real_llm_validation.json` trial interpretation across UI/reports | Trials presented as 15 successful evaluations; failure rates ($0.4$) include failed API calls | 10 of 15 API trials suffered `ResourceExhausted` errors (3/5 factual, 3/5 channel, 4/5 source-event). Naive division by 5 distorted true rate. | **CRITICAL** | Disclose attempted (5), successful (2, 2, 1), and failed (3, 3, 4) calls separately. Clarify prompt-level sanity check scope. Treat exhaustion as execution failure. |
| **AUD-03** | `documentation/22_BASELINES.md` vs `captain/benchmarks/baselines.py` & frozen JSON | `22_BASELINES.md` draft listed B4 as "Cost-only" and B5 as "Oracle". Code and frozen benchmarks implement B4 as `B4_graph_structural` and B5 as `B5_cost_aware`, with Oracle as an evaluation-only module. | `captain/benchmarks/baselines.py` lines 281 & 338; `benchmark_seed_*.json`; `campaign_full.json`. | **HIGH** | Synchronize `22_BASELINES.md`, UI, slides, notes, and API to canonical names: B4=Graph-Structural, B5=Cost-Aware, Oracle=Evaluation-Only. |
| **AUD-04** | `claim_registry.json` metadata for C1/C2 vs UI/Text | `claim_registry.json` contains `statistical_test: "wilcoxon_signed_rank"` despite zero-variance $N=5$ sample | `PAPER_STYLE_AND_CONSTRAINTS.md` Rules 25 & 26 explicitly prohibit Wilcoxon significance claims. Raw registry is immutable. | **HIGH** | Maintain raw JSON integrity. Ensure all UI, tables, slides, notes, and tooltips explicitly state: $N=5$, zero variance, degenerate test, unanimous descriptive observation ($5/5$). |
| **AUD-05** | Slide 7 in `presentationController.js` and stale UI references | Stale reference in older slide note text mentioned `p < 0.001` | Paper Freeze Rule 25: *"Do not claim Wilcoxon significance for BF-G selectivity... Report as a unanimous descriptive observation (5/5 instances)."* | **MEDIUM** | Scrub all remaining slide notes and text for any lingering `p < 0.001` or inferential significance language for BF-G. |
| **AUD-06** | Cost-Utility & Utility Claim Verification | A5 Utility ($0.720$), B1 Utility ($0.573$), Cost ($0.80$ vs $2.27$), $64.8\%$ reduction | `benchmark_seed_42.json` `overall_aggregates`. Formula: $U = \text{CEE} - \lambda \cdot \text{Cost}$ with $\lambda = 0.1$. | **VERIFIED** | Traceability confirmed. Explicitly document formula and operating point $\lambda=0.1$ across documentation. |
| **AUD-07** | Oracle Alignment Claim ($\ge 94\%$) | "$\ge 94\%$ Oracle alignment" was cited in Module 2/3 without exact numerator/denominator | `benchmark_seed_*.json`: $274 / 275$ scenarios ($99.64\%$) across all 5 seeds have zero regret ($54/55 = 98.18\%$ in Seed 42). | **MEDIUM** | Document exact numerator and denominator: $274/275$ ($99.64\%$) zero regret across all 5 seeds; $54/55$ ($98.18\%$) for Seed 42. |
| **AUD-08** | Provenance Badging | Some view cards lacked explicit classification badges | Principle 5: Clearly distinguish Frozen Research Data, Live Backend Execution, Illustrative Demonstration, and Conceptual Explanation. | **MEDIUM** | Add explicit semantic provenance badges to all interactive view components. |
| **AUD-09** | Test count discrepancy | Some legacy docs refer to 692 or 702 tests; current count is 720 tests | `tests/unit/test_module2.py` (10 tests) + `tests/unit/test_module3.py` (18 tests) = 720 tests. | **LOW** | Update all badges and documentation to reflect exact count: 720 tests (and 720+ after Module 4 tests). |

---

## 2. In-Depth Technical Analysis of Critical Items

### 2.1 AUD-01 & AUD-02: Real-LLM Validation (`real_llm_validation.json`)
Inspection of `research/raw/real_llm_validation.json` reveals:
- **Provider:** `google_gemini`
- **Model:** `gemini-3.6-flash` (NOT Gemini 2.5 Flash)
- **Model Version:** `gemini-3.6-flash`
- **Trial-by-Trial Data:**
  - `factual_trials` (5 attempts):
    - Trial 0: `failure_detected=True`, `runtime_s=5.291` (SUCCESSFUL API CALL)
    - Trial 1: `failure_detected=True`, `runtime_s=4.673` (SUCCESSFUL API CALL)
    - Trial 2: `[GEMINI_ERROR: ResourceExhausted]`, `failure_detected=False`, `runtime_s=0.478` (API FAILURE)
    - Trial 3: `[GEMINI_ERROR: ResourceExhausted]`, `failure_detected=False`, `runtime_s=0.485` (API FAILURE)
    - Trial 4: `[GEMINI_ERROR: ResourceExhausted]`, `failure_detected=False`, `runtime_s=0.490` (API FAILURE)
    - *Actual completions:* 2 successful calls out of 5 attempts. Both detected failure ($2/2 = 100\%$).
    - *Recorded rate:* $2 / 5 = 0.40$ (caused by treating error string as non-failure).
  - `channel_trials` (5 attempts):
    - Trial 0: `failure_detected=False`, `runtime_s=4.812` (SUCCESSFUL API CALL)
    - Trial 1: `failure_detected=False`, `runtime_s=4.301` (SUCCESSFUL API CALL)
    - Trial 2: `[GEMINI_ERROR: ResourceExhausted]` (API FAILURE)
    - Trial 3: `[GEMINI_ERROR: ResourceExhausted]` (API FAILURE)
    - Trial 4: `[GEMINI_ERROR: ResourceExhausted]` (API FAILURE)
    - *Actual completions:* 2 successful calls out of 5 attempts. Neither failed ($0/2 = 0\%$).
    - *Recorded rate:* $0 / 5 = 0.00$.
  - `source_event_trials` (5 attempts):
    - Trial 0: `failure_detected=False`, `runtime_s=4.120` (SUCCESSFUL API CALL)
    - Trials 1, 2, 3, 4: `[GEMINI_ERROR: ResourceExhausted]` (API FAILURE)
    - *Actual completions:* 1 successful call out of 5 attempts ($0/1 = 0\%$).
    - *Recorded rate:* $0 / 5 = 0.00$.
- **Scientific Implication:**
  The recorded CEE of $0.40$ is an artifact of dividing the 2 observed failures by the 5 attempted queries ($2/5 - 0/5 = 0.40$).
  On valid non-exhausted API completions, factual failure rate was $2/2 = 1.00$ and channel failure rate was $0/2 = 0.00$, yielding an empirical conditional effect of $1.00$ on valid queries ($N=2$).
  The platform must **transparently report the quota exhaustion**, report attempted vs successful calls, and state that this was a targeted prompt-level sanity check on `gemini-3.6-flash`, not an end-to-end autonomous agent execution.

### 2.2 AUD-03: Baseline Definitions & Canonical Naming
Inspection of `captain/benchmarks/baselines.py` and all 5 `benchmark_seed_*.json` files confirms:
- **B1**: `B1_random` — Random Baseline (Deterministic Monte Carlo draws)
- **B2**: `B2_provenance` — Provenance-Only Baseline (Structural provenance scoring)
- **B3**: `B3_cee_rank` — CEE-Rank Baseline (Single-channel CEE ranking without cascade lookahead)
- **B4**: `B4_graph_structural` — Graph-Structural Baseline (Minimum graph distance to failure symptom)
- **B5**: `B5_cost_aware` — Cost-Aware Structural Baseline (Screening score penalized by intervention cost: $S / C$)
- **A1**: `A1_cela` — CELA-Provenance (≡ B2)
- **A2**: `A2_cela` — CELA-CEE (≡ B3)
- **A3**: `A3_cela` — CELA-Cascade (Restricted subset lookahead)
- **A4**: `A4_cela` — CELA-Greedy (Submodular marginal-gain cascade selector)
- **A5**: `A5_cela` — CELA-Full Pipeline (Greedy cascade + cost-utility knapsack)
- **Oracle**: `ExhaustiveOracle` — Combinatorial search evaluated purely for computing diagnostic regret. It is NOT a baseline method.

### 2.3 AUD-04: BF-G Sample Size & Degenerate Rank Test
- All 5 scenario instances of BF-G (`bf_g_42`, `bf_g_123`, `bf_g_456`, `bf_g_789`, `bf_g_1024`) exhibit identical paired differences:
  $$\Delta_{\text{preservation}} = +1, \quad \Delta_{\text{collateral}} = -1$$
- For sample size $N = 5$, the minimum possible two-sided Wilcoxon $p$-value with non-zero variance is $2 \times (1/2)^5 = 0.0625 > 0.05$.
- With zero variance across all differences, ranks are degenerate. No valid inferential $p$-value can be calculated.
- Authoritative Rule 25 strictly forbids claiming Wilcoxon significance.
- It must be reported solely as an **unanimous descriptive observation (5/5 instances)**.

### 2.4 AUD-06 & AUD-07: Cost-Utility & Oracle Traceability
- In `benchmark_seed_42.json`, `overall_aggregates`:
  - `B1_random`: Mean Utility = $0.5727$, Mean Cost = $2.2727$, Mean CEE = $0.8000$
  - `A5_cela`: Mean Utility = $0.7200$, Mean Cost = $0.8000$, Mean CEE = $0.8000$
  - Cost reduction: $(2.2727 - 0.8000) / 2.2727 = 64.80\%$
  - Net Utility Formula: $\mathcal{U}(S) = \text{CEE}(S) - \lambda \cdot \text{Cost}(S)$ with operating parameter $\lambda = 0.1$.
    - B1: $0.80 - 0.1 \times 2.2727 = 0.5727$
    - A5: $0.80 - 0.1 \times 0.80 = 0.7200$
- In `benchmark_seed_*.json`:
  - Mean Regret across all 5 seeds ($275$ scenarios):
    - Seed 1024: $55/55$ ($100\%$) Zero Regret
    - Seed 123: $55/55$ ($100\%$) Zero Regret
    - Seed 42: $54/55$ ($98.18\%$) Zero Regret
    - Seed 456: $55/55$ ($100\%$) Zero Regret
    - Seed 789: $55/55$ ($100\%$) Zero Regret
  - Total: **$274 / 275$ scenarios ($99.64\%$) matched the Oracle optimal objective value exactly**.

---

## 3. Corrective Action Plan for Phases 2–8

1. **Phase 2 (Real-LLM Evidence):**
   - Update `app.py`, `researchDashboard.js`, `presentationController.js`, `index.html`, and `README.md` to reference `gemini-3.6-flash`.
   - Update UI cards and modal to display the trial breakdown: Attempted (5), Successful (2, 2, 1), and ResourceExhausted (3, 3, 4).
   - Add unit tests verifying API exhaustion is not counted as semantic model success.
2. **Phase 3 (Baselines Matrix):**
   - Update `documentation/22_BASELINES.md` to reflect canonical B1–B5 definitions and Oracle status.
   - Synchronize `/api/research/methods` in `app.py` and `researchDashboard.js`.
   - Add tests verifying canonical method names.
3. **Phase 4 (BF-G Significance Language):**
   - Verify every UI card, slide, speaker note, and tooltip has zero inferential significance claims for BF-G.
   - Add tests checking rendered HTML for banned phrases (`p < 0.001` on BF-G).
4. **Phase 5 (Cost-Utility & Oracle):**
   - Document the exact formula $\mathcal{U} = \text{CEE} - \lambda \cdot \text{Cost}$ ($\lambda = 0.1$) and the $274/275$ ($99.64\%$) exact Oracle match.
5. **Phase 6 (Full Platform Consistency & Provenance):**
   - Audit all provenance badges: Frozen Research Data, Live Backend Execution, Illustrative Demonstration, Conceptual Explanation.
   - Update test counts to 720+.
6. **Phase 7 & 8 (Testing & Security):**
   - Author `tests/unit/test_module4.py`.
   - Run complete pytest suite, Ruff, and Mypy.
