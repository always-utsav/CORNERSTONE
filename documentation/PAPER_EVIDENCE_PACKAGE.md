# PAPER_EVIDENCE_PACKAGE.md — Complete Evidence Artifact Index

**Authoritative Research Freeze**: `CAPTAIN-CELA-RESEARCH-FREEZE-V2` at `761f78f`

---

## Raw Experiment Results

| File | Purpose | Experiment | Entries | Authority |
|------|---------|-----------|---------|-----------|
| `research/raw/benchmark_seed_42.json` | 5-seed campaign, seed 42 | EXP-01 | 63 comparisons | V1 frozen |
| `research/raw/benchmark_seed_123.json` | 5-seed campaign, seed 123 | EXP-01 | 63 comparisons | V1 frozen |
| `research/raw/benchmark_seed_456.json` | 5-seed campaign, seed 456 | EXP-01 | 63 comparisons | V1 frozen |
| `research/raw/benchmark_seed_789.json` | 5-seed campaign, seed 789 | EXP-01 | 63 comparisons | V1 frozen |
| `research/raw/benchmark_seed_1024.json` | 5-seed campaign, seed 1024 | EXP-01 | 63 comparisons | V1 frozen |
| `research/raw/campaign_full.json` | Campaign summary | EXP-01 | aggregate | V1 frozen |
| `research/raw/granularity_experiment.json` | Channel vs source-event | EXP-02 | 5 instances | V1 frozen |
| `research/raw/negative_controls.json` | Negative controls CEE=0 | EXP-03 | 4 controls | V1 frozen |
| `research/raw/replay_convergence.json` | Replay trial convergence | EXP-04 | dict | V1 frozen |
| `research/raw/scalability.json` | Runtime per family | EXP-05 | dict | V1 frozen |
| `research/raw/real_llm_validation.json` | Gemini sanity check | EXP-06 | 1 model | V1 frozen |
| `research/raw/pathway_stress.json` | Pathway count sensitivity | EXP-07 | 25 entries | V2 |
| `research/raw/cascade_experiment.json` | Individual vs joint | EXP-08 | 10 entries | V2 |
| `research/raw/cost_utility_sweep.json` | Budget threshold | EXP-09 | 5 budgets | V2 |
| `research/raw/claim_registry.json` | C1-C7 statuses | all | 7 claims | V1 frozen |
| `research/raw/experiment_manifest.json` | Environment/parameters | all | 1 manifest | V1 frozen |

## Figures

| File | Claims | Source Data |
|------|--------|------------|
| `research/figures/fig_attribution.{svg,png}` | C3 | benchmark_seed_*.json |
| `research/figures/fig_collateral.{svg,png}` | C2 | granularity_experiment.json |
| `research/figures/fig_convergence.{svg,png}` | C6 | replay_convergence.json |
| `research/figures/fig_cost_utility.{svg,png}` | CU1 | cost_utility_sweep.json |
| `research/figures/fig_granularity.{svg,png}` | C1 | granularity_experiment.json |
| `research/figures/fig_negative_controls.{svg,png}` | C4 | negative_controls.json |
| `research/figures/fig_pathway_stress.{svg,png}` | PS1 | pathway_stress.json |
| `research/figures/fig_real_llm.{svg,png}` | C7 | real_llm_validation.json |
| `research/figures/fig_scalability.{svg,png}` | — | scalability.json |

## Tables

| File | Content | Source Data |
|------|---------|------------|
| `research/tables/table_01_benchmark_families.md` | 11 families | documentation/20_BENCHMARKS.md |
| `research/tables/table_02_baselines.md` | 10 methods | documentation/22_BASELINES.md |
| `research/tables/table_03_claim_status.md` | C1-C7 | claim_registry.json |
| `research/tables/table_04_granularity.md` | Channel vs source | granularity_experiment.json |
| `research/tables/table_05_negative_controls.md` | 4 controls | negative_controls.json |
| `research/tables/table_06_scalability.md` | 4 families runtime | scalability.json |
| `research/tables/table_07_real_llm.md` | Gemini sanity | real_llm_validation.json |
| `research/tables/table_08_pathway_stress.md` | 5 families | pathway_stress.json |
| `research/tables/table_09_cascade.md` | BF-B, BF-C | cascade_experiment.json |
| `research/tables/table_10_cost_utility.md` | 5 budgets | cost_utility_sweep.json |
| `research/tables/table_11_competitors.md` | 7 systems | competitor_matrix.csv |
| `research/tables/table_12_statistical_methods.md` | 6 methods | statistics.py |

## Statistical Outputs

| File | Purpose |
|------|---------|
| `research/statistics/statistical_audit.json` | 17 checks (14 correct, 2 limited, 1 acceptable) |
| `research/statistics/statistical_audit.py` | Audit generation script |

## Evidence Integrity

| File | Purpose |
|------|---------|
| `research/evidence/evidence_checksums.json` | SHA-256 for 30 files |
| `research/evidence/generate_checksums.py` | Checksum generation script |
| `research/evidence/README.md` | Evidence package documentation |

## Competitor Analysis

| File | Purpose |
|------|---------|
| `research/comparison/competitor_matrix.csv` | 12 systems, 20 dimensions |
| `research/comparison/comparison_protocol.md` | Why direct comparison is infeasible |

## Generation Scripts

| Script | Generates |
|--------|----------|
| `captain/experiments/figures.py` | V1 figures (7 × SVG+PNG) |
| `captain/experiments/claims.py` | claim_registry.json |
| `captain/experiments/campaign.py` | All experiment results |
| `research/generate_tables.py` | 12 tables |
| `research/generate_v2_figures.py` | V2 figures (2 × SVG+PNG) |
| `research/generate_manifest_v2.py` | V2_RESEARCH_MANIFEST.json |
| `research/run_campaign.py` | Full campaign execution |

## Reproducibility

```bash
# Full deterministic campaign (no API key)
python research/run_campaign.py

# V2 experiments
python -c "from captain.experiments.campaign import CampaignRunner; r=CampaignRunner(); r.run_pathway_stress(); r.run_cascade_experiment(); r.run_cost_utility_sweep()"

# Figures and tables
python captain/experiments/figures.py
python research/generate_v2_figures.py
python research/generate_tables.py

# Claims and statistics
python captain/experiments/claims.py
python research/statistics/statistical_audit.py

# Evidence integrity
python research/evidence/generate_checksums.py

# Tests
python -m pytest tests/ -q    # expects 692 passed
```

## Environment

- Python 3.11.9
- Windows-10-10.0.26200-SP0
- google-generativeai 0.8.6 (for real-LLM sanity check only)
- No external ML frameworks required for deterministic experiments
