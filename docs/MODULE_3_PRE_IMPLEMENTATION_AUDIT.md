# CORNERSTONE — Module 3 Pre-Implementation Audit & Statistical Verification Report
**Project:** CORNERSTONE — Interactive Research Demonstration Platform  
**Phase:** Phase 3 — Research Intelligence, Scientific Evidence and Final Presentation Platform  
**Date:** November 2026  
**Auditor:** Antigravity Autonomous Research & Verification Agent  

---

## 1. Executive Audit Summary

Prior to constructing the final research dashboards, benchmark studio, and presentation views for Module 3, a rigorous verification of the frozen scientific evidence base (`research/raw/`, `research/figures/`, `documentation/`, and `tests/`) was conducted.

The repository baseline is **702 passing tests** (692 original test suite + 10 Module 2 integration tests). The frozen research dataset under `research/raw/` is verified immutable and intact.

---

## 2. Statistical Claims Verification & Discrepancy Resolution

### 2.1 The BF-G Selectivity Claim (C1 & C2)
- **Reported in Module 2 Summary**: "Wilcoxon signed-rank test $p < 0.001$ on the primary 5-instance BF-G comparison."
- **Mathematical & Empirical Audit**:
  1. **Sample Size**: The primary granularity experiment evaluates $N = 5$ paired scenario instances across seeds `[42, 123, 456, 789, 1024]`.
  2. **Mathematical Bound**: For an exact Wilcoxon signed-rank test with $N = 5$, the absolute theoretical minimum two-sided $p$-value (when all pairs have identical ranks and signs, $W = 15$) is:
     $$p_{\text{min}} = 2 \times \left(\frac{1}{2}\right)^5 = \frac{2}{32} = 0.0625 > 0.05$$
     Even for a one-sided test, $p_{\text{one-sided}} = 1/32 = 0.03125 \gg 0.001$. A $p$-value of $< 0.001$ is mathematically impossible for $N = 5$.
  3. **Zero Variance & Degeneracy**: Across all 5 instances in `granularity_experiment.json`, channel-level intervention preserves exactly 1 artifact (Artifact B), while source-event-level intervention preserves exactly 0 artifacts. The paired difference vector is identically $\Delta = [+1, +1, +1, +1, +1]$. Because the variance across differences is zero, the rank transformation is degenerate.
  4. **Authoritative Freeze Constraint**: The paper style guide (`documentation/PAPER_STYLE_AND_CONSTRAINTS.md`, Rule 25) explicitly mandates:
     > *"Do not claim Wilcoxon significance for BF-G selectivity. The paired differences are constant (zero variance); a Wilcoxon signed-rank test is degenerate and produces no valid p-value. Report as a unanimous descriptive observation (5/5 instances)."*
- **Resolution for Module 3**:
  - The erroneous $p < 0.001$ label will **NOT** be displayed in the scientific dashboard.
  - The comparison will be reported truthfully and rigorously as a **Unanimous Descriptive Observation ($5/5$ instances, $100\%$ preserved evidence vs $0\%$ preserved evidence, zero collateral damage)**.
  - The mathematical limitation of small sample size ($N = 5$) and constant differences will be clearly explained in the limitations section.

### 2.2 Oracle Alignment Verification
- In cascade and greedy selection evaluations (`cost_utility_sweep.json` and `benchmark_seed_*.json`), greedy submodular channel selection matches the brute-force Oracle optimal set in $\ge 94\%$ of benchmark comparisons where a non-empty causal set exists. At budget thresholds $\lambda \ge 5.0$, alignment reaches $100\%$.

### 2.3 Independent Seeds vs Scenario Instances
- The 275 benchmark scenarios comprise **11 families $\times$ 5 seeds $\times$ 5 instances**.
- For BF-G granularity, 5 distinct scenario instances were evaluated across seeds `42, 123, 456, 789, 1024`. These are 5 independent random initializations of the shared-source topology.

---

## 3. Authoritative Benchmark Definitions (BF-A through BF-K)

From `documentation/20_BENCHMARKS.md` and `captain/benchmarks/scenarios.py`:

| Identifier | Official Name | Mechanism | Topology & Flow Pattern | Analytical Challenge |
| :--- | :--- | :--- | :--- | :--- |
| **BF-A** | Single Channel | Single cause + distractor | Direct edge $e_{\text{tool}} \to e_{\text{out}}$ | Baseline isolation |
| **BF-B** | Redundant OR | Independent parallel causes | Two independent causal channels | Either channel sufficient to trigger failure |
| **BF-C** | Complementary AND | Interacting conjunct causes | Both channels required for failure | Joint intervention required to prevent failure |
| **BF-D** | Distractor | Single cause + two distractors | Spurious non-causal branches | Screening out high-degree distractors |
| **BF-E** | Cascade | Multi-hop propagation | 3-hop serial pipeline $e_1 \to e_2 \to e_3$ | Upstream vs downstream intervention |
| **BF-F** | Cost-Asymmetric | Budget-constrained AND logic | Parallel channels with asymmetric costs | Optimal selection under budget constraint |
| **BF-G** | Shared Source | Single tool produces dual artifacts | 1 tool $\to$ Artifact A (faulty) + Artifact B (valid) | Channel-level selectivity without collateral loss |
| **BF-H** | Convergent Mixed | Mixed causal + benign inputs | Convergent graph with temporal delay | Delayed failing input among benign evidence |
| **BF-I** | Convergent | Single cause among converging paths | Multiple tool outputs converging to reasoner | Path convergence disambiguation |
| **BF-J** | Parallel Sources | Independent causal sources | Parallel independent source tools | Multi-source causal attribution |
| **BF-K** | Downstream Persistence | Ineffective repair attempt | Upstream failure persists past inert repair | Distinguishing effective from inert repairs |

*Note on Historical Reclassifications*:
- **BF-H**: Initially labeled `BRANCHING`; topological structure is convergent with mixed inputs.
- **BF-J**: Initially labeled `ROOT_VS_SYMPTOM`; actual implementation tests parallel independent sources.
- **BF-K**: Initially labeled `DOWNSTREAM_REPAIR`; implementation tests downstream persistence since the simulated repair is structurally inert.

---

## 4. Attribution Methods & Documented Equivalences

From `documentation/22_BASELINES.md`:

| Method Code | Name | Category | Theoretical Principle | Documented Equivalence |
| :--- | :--- | :--- | :--- | :--- |
| **B1** | Random | Baseline | Uniform random candidate selection | Null heuristic |
| **B2** | Provenance-Only | Baseline | Lineage graph path connectivity | **$\equiv$ A1** |
| **B3** | CEE-Rank | Baseline | Individual counterfactual effect magnitude | **$\equiv$ A2** |
| **B4** | Cost-Only | Baseline | Lowest intervention cost priority | Cost heuristic |
| **B5** | Oracle | Baseline | Post-hoc ground-truth selection | Upper bound (post-hoc only) |
| **A1** | CELA-Provenance | CELA Variant | Graph reachability candidate filtering | **$\equiv$ B2** |
| **A2** | CELA-CEE | CELA Variant | Individual CEE channel ranking | **$\equiv$ B3** |
| **A3** | CELA-Cascade | CELA Variant | Multi-hop downstream propagation estimator | Cascade model |
| **A4** | CELA-Greedy | CELA Variant | Submodular greedy selection under budget | Greedy optimizer |
| **A5** | CELA-Full | CELA Variant | Full attribution pipeline with screening | Complete CELA pipeline |

---

## 5. Frozen Claim Registry Audit

From `research/raw/claim_registry.json`:

| ID | Formal Statement | Status | Supporting Experiment | Key Metric | Limitation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **C1** | Channel intervention provides more selective localization than source-event | **Supported** | `granularity_experiment.json` | Preserved Evidence | Assumes structural evidence mapping reflects dependency |
| **C2** | Channel intervention preserves unrelated evidence | **Supported** | `granularity_experiment.json` | Collateral Damage | Constant differences across $N=5$ (unanimous observation) |
| **C3** | CELA A5 achieves higher F1 than random baseline B1 | **Not Supported** | `benchmark_seed_42.json` | Causal F1 ($p=0.1156$) | Evaluated on simple synthetic benchmarks; no statistical edge |
| **C4** | Negative controls show CEE = 0 for irrelevant channels | **Supported** | `negative_controls.json` | Observed CEE ($0.0$) | Tested on 4 controlled synthetic topological controls |
| **C5** | Results are stable across independent random seeds | **Supported** | `campaign_full.json` | Metric CV ($< 0.20$) | Seed variance tested on deterministic synthetic traces |
| **C6** | CEE converges with replay count | **Supported** | `replay_convergence.json` | Replay CEE ($1.0$) | Trivially true under deterministic MockLLM environment |
| **C7** | Real-LLM intervention produces non-zero CEE | **Supported** | `real_llm_validation.json` | Output CEE ($0.40$) | Controlled prompt check (Gemini 3.6-flash); not full pipeline |

---

## 6. Research Figures Inventory

From `research/figures/` (available in both SVG vector and PNG raster formats):
1. `fig_granularity`: Primary granularity comparison (BF-G channel vs source-event collateral damage).
2. `fig_attribution`: Comparative causal attribution metrics (A5 vs baselines B1-B5).
3. `fig_collateral`: Collateral modification rate across benchmark families.
4. `fig_convergence`: Replay sample convergence curve.
5. `fig_cost_utility`: Cost-utility trade-off curve across varying budget penalty $\lambda$.
6. `fig_negative_controls`: Verification of zero spurious attribution on negative control channels.
7. `fig_pathway_stress`: Robustness and performance under increasing pathway complexity.
8. `fig_real_llm`: Gemini 3.6-flash semantic evidence dependency verification.
9. `fig_scalability`: Runtime resolution latency vs node/edge counts ($< 5\text{ms}$).
