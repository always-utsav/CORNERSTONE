# Figure and Table Catalog

## Figures

| # | File | Caption | Source Data | Generation Script | Claims | Verified |
|---|------|---------|------------|-------------------|--------|:--------:|
| F1 | `research/figures/fig_attribution.{svg,png}` | Causal F1, Precision, Recall across methods | `benchmark_seed_*.json` | `captain/experiments/figures.py` | C3 | ✅ |
| F2 | `research/figures/fig_collateral.{svg,png}` | Collateral: Channel (0) vs Source-Event (1) | `granularity_experiment.json` | `captain/experiments/figures.py` | C2 | ✅ |
| F3 | `research/figures/fig_convergence.{svg,png}` | CEE stability across replay counts | `replay_convergence.json` | `captain/experiments/figures.py` | C6 | ✅ |
| F4 | `research/figures/fig_granularity.{svg,png}` | Preserved evidence: Channel (1) vs Source-Event (0) | `granularity_experiment.json` | `captain/experiments/figures.py` | C1 | ✅ |
| F5 | `research/figures/fig_negative_controls.{svg,png}` | Negative control CEE distributions (all 0.0) | `negative_controls.json` | `captain/experiments/figures.py` | C4 | ✅ |
| F6 | `research/figures/fig_real_llm.{svg,png}` | Gemini factual vs counterfactual failure rates | `real_llm_validation.json` | `captain/experiments/figures.py` | C7 | ✅ |
| F7 | `research/figures/fig_scalability.{svg,png}` | Runtime per benchmark family (<5ms) | `scalability.json` | `captain/experiments/figures.py` | — | ✅ |
| F8 | `research/figures/fig_pathway_stress.{svg,png}` | Performance by family (V2) | `pathway_stress.json` | `research/generate_v2_figures.py` | PS1 | ✅ |
| F9 | `research/figures/fig_cost_utility.{svg,png}` | Prevention rate vs budget threshold (V2) | `cost_utility_sweep.json` | `research/generate_v2_figures.py` | CU1 | ✅ |

**Total**: 9 unique figures × 2 formats = 18 files

## Tables

| # | File | Content | Source Data | Generation Script | Claims | Verified |
|---|------|---------|------------|-------------------|--------|:--------:|
| T1 | `research/tables/table_01_benchmark_families.md` | 11 families, mechanisms, instances | `documentation/20_BENCHMARKS.md` | `research/generate_tables.py` | — | ✅ |
| T2 | `research/tables/table_02_baselines.md` | 10 methods (B1-B5, A1-A5) | `documentation/22_BASELINES.md` | `research/generate_tables.py` | — | ✅ |
| T3 | `research/tables/table_03_claim_status.md` | C1-C7 statuses with p-values | `claim_registry.json` | `research/generate_tables.py` | All | ✅ |
| T4 | `research/tables/table_04_granularity.md` | Channel vs source-event metrics | `granularity_experiment.json` | `research/generate_tables.py` | C1, C2 | ✅ |
| T5 | `research/tables/table_05_negative_controls.md` | 4 controls, all CEE=0.0 | `negative_controls.json` | `research/generate_tables.py` | C4 | ✅ |
| T6 | `research/tables/table_06_scalability.md` | 4 families, runtime <5ms | `scalability.json` | `research/generate_tables.py` | — | ✅ |
| T7 | `research/tables/table_07_real_llm.md` | Gemini parameters and CEE | `real_llm_validation.json` | `research/generate_tables.py` | C7 | ✅ |
| T8 | `research/tables/table_08_pathway_stress.md` | 5 families, R@1, prevention, F1 | `pathway_stress.json` | `research/generate_tables.py` | PS1 | ✅ |
| T9 | `research/tables/table_09_cascade.md` | BF-B/BF-C individual vs joint | `cascade_experiment.json` | `research/generate_tables.py` | CS1 | ✅ |
| T10 | `research/tables/table_10_cost_utility.md` | 5 budget levels, prevention | `cost_utility_sweep.json` | `research/generate_tables.py` | CU1 | ✅ |
| T11 | `research/tables/table_11_competitors.md` | 7 systems, 5 dimensions | `competitor_matrix.csv` | `research/generate_tables.py` | — | ✅ |
| T12 | `research/tables/table_12_statistical_methods.md` | 6 methods, purposes | `statistics.py` | `research/generate_tables.py` | — | ✅ |

**Total**: 12 tables

## Comparison Type Key

All competitor comparisons in T11 are **literature-based conceptual comparisons**. No direct experimental or reproduction-based comparison was conducted.
