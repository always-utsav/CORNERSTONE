# 22: Baselines & Benchmark Methods

The evaluation compares 10 operational attribution methods, comprising 5 baseline heuristics (`B1`–`B5`) and 5 configurations of the CELA framework (`A1`–`A5`), evaluated alongside an exhaustive post-hoc diagnostic Oracle.

## Standard Baselines (Canonical Stage 16 & Frozen Campaign)

| Code | Canonical Identifier | Method Name | Description | Replay Cost |
|:---|:---|:---|:---|:---|
| **B1** | `B1_random` | Random Baseline | Deterministic pseudo-random candidate selection | Zero |
| **B2** | `B2_provenance` | Provenance-Only | Structural provenance graph reachability closure | Zero |
| **B3** | `B3_cee_rank` | CEE-Rank | Ranks channels strictly by single-channel CEE | $O(\|C\|)$ |
| **B4** | `B4_graph_structural` | Graph-Structural | Ranks by minimum directed graph distance to failure symptom | Zero |
| **B5** | `B5_cost_aware` | Cost-Aware Structural | Ranks by structural screening score penalized by cost ($S / C$) | Zero |

> [!NOTE]
> **Diagnostic Oracle (`ExhaustiveOracle`)**: The exhaustive brute-force oracle is **NOT** a baseline method. It evaluates all valid subsets via combinatorial replay to compute the optimal upper-bound objective. It is used strictly for post-hoc calculation of optimality regret ($\text{Regret} = \text{Obj}_{\text{oracle}} - \text{Obj}_{\text{method}}$). Across the 275 evaluated benchmark scenarios, CELA A5 matches the Oracle optimal objective in $274 / 275$ scenarios ($99.64\%$).
> In preliminary working drafts prior to Stage 16, B4/B5 were tentatively labeled "Cost-only" and "Oracle"; Stage 16 established the formal separation of the five operational baselines and the evaluation-only Oracle.

## CELA Framework Configurations

| Code | Canonical Identifier | Method Name | Pipeline Configuration | Description |
|:---|:---|:---|:---|:---|
| **A1** | `A1_cela` | CELA-Provenance | Stage 1 only | Structural provenance backward slicing ($\equiv B2$) |
| **A2** | `A2_cela` | CELA-CEE | Stages 1 + 2 | Provenance + single-channel CEE screening ($\equiv B3$) |
| **A3** | `A3_cela` | CELA-Cascade | Stages 1 + 2 + 3 | Restricted subset evaluation of top-CEE channels |
| **A4** | `A4_cela` | CELA-Greedy | Stages 1 + 2 + 3 | Greedy submodular cascade selector (marginal gain) |
| **A5** | `A5_cela` | CELA-Full Pipeline | Stages 1 + 2 + 3 + 4 | Full pipeline with multi-objective cost-utility knapsack |

### Verified Equivalences

- **A1 ≡ B2**: CELA-provenance is functionally and mathematically identical to the Provenance-only baseline (`b2.select(...)`).
- **A2 ≡ B3**: CELA-CEE is functionally and mathematically identical to the CEE-rank baseline (`b3.select(...)`).

