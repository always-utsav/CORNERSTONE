# PAPER_HANDOFF_README.md — ChatGPT→Claude Paper Workflow Guide

## Purpose

This package provides everything needed for a new ChatGPT conversation to audit the materials and create the final prompt for Claude to generate the LaTeX submission manuscript.

## Authoritative State

| Item | Value |
|------|-------|
| Repository | https://github.com/always-utsav/captain-cela |
| V2 Tag | `CAPTAIN-CELA-RESEARCH-FREEZE-V2` |
| V2 Commit | `761f78f` |
| V1 Tag | `CAPTAIN-CELA-RESEARCH-FREEZE-V1` |
| V1 Commit | `27ed11a` |
| Tests | 692 passing |
| Python | 3.11.9 |

## Recommended Reading Order

### Batch A — Essential (upload these first)

Read in this exact order:

| # | File | Purpose | Priority |
|---|------|---------|----------|
| 1 | `documentation/PAPER_STYLE_AND_CONSTRAINTS.md` | **Read first.** Mandatory writing rules. | CRITICAL |
| 2 | `documentation/PAPER_CLAIM_REGISTER.csv` | Every claim with exact values and permitted wording. | CRITICAL |
| 3 | `documentation/PAPER_DRAFT_V0.1.md` | The sample manuscript (~72KB) with all sections. | CRITICAL |
| 4 | `documentation/PAPER_EVIDENCE_PACKAGE.md` | Index of all evidence files. | CRITICAL |
| 5 | `documentation/V2_FINAL_SCIENTIFIC_FREEZE.md` | Authoritative freeze document. | HIGH |
| 6 | `documentation/12_MATHEMATICAL_FORMULATION.md` | CEE formula and mathematical definitions. | HIGH |
| 7 | `documentation/11_ALGORITHMS.md` | Algorithm descriptions. | HIGH |
| 8 | `documentation/20_BENCHMARKS.md` | 11 benchmark families. | HIGH |
| 9 | `documentation/22_BASELINES.md` | 10 methods (B1-B5, A1-A5). | HIGH |
| 10 | `documentation/23_METRICS.md` | Metric definitions. | HIGH |
| 11 | `documentation/31_COMPETITOR_COMPARISON.md` | 12 competitor systems. | HIGH |
| 12 | `documentation/45_REFERENCE_PAPERS.md` | Bibliography sources. | HIGH |
| 13 | `documentation/44_RESEARCH_PAPER_MAP.md` | Paper blueprint. | HIGH |
| 14 | `documentation/34_THREATS_TO_VALIDITY.md` | Threats to validity. | HIGH |
| 15 | `documentation/PAPER_PREPARATION_AUDIT.md` | What was checked and what issues were found. | MEDIUM |

### Batch B — Supporting Evidence (upload if needed)

| # | File | Purpose |
|---|------|---------|
| 1 | `research/raw/granularity_experiment.json` | PRIMARY result (5 instances) |
| 2 | `research/raw/claim_registry.json` | Claim statuses with p-values |
| 3 | `research/raw/negative_controls.json` | 4 negative controls |
| 4 | `research/raw/pathway_stress.json` | V2 pathway stress results |
| 5 | `research/raw/cascade_experiment.json` | V2 cascade results |
| 6 | `research/raw/cost_utility_sweep.json` | V2 cost/utility results |
| 7 | `research/raw/campaign_full.json` | Campaign summary |
| 8 | `research/raw/real_llm_validation.json` | Real-LLM sanity check |
| 9 | `research/raw/replay_convergence.json` | Convergence data |
| 10 | `research/raw/scalability.json` | Runtime data |
| 11 | `research/statistics/statistical_audit.json` | Statistical pipeline audit |
| 12 | `research/comparison/competitor_matrix.csv` | 12-system comparison matrix |
| 13 | `research/tables/table_*.md` | 12 publication tables |
| 14 | `research/V2_RESEARCH_MANIFEST.json` | Full V2 manifest |

### Figures (reference, not upload)

The 18 figure files in `research/figures/` can be referenced but are too large for chat upload. The sample manuscript identifies each figure by path and describes what it shows.

## Instructions for the ChatGPT Audit

The ChatGPT conversation should:

1. Read `PAPER_STYLE_AND_CONSTRAINTS.md` first and enforce all rules.
2. Read `PAPER_CLAIM_REGISTER.csv` and verify every claim.
3. Read `PAPER_DRAFT_V0.1.md` as the sample manuscript.
4. Cross-check the sample manuscript against the raw evidence files.
5. Identify any [VERIFY FROM SOURCE] markers and resolve them.
6. Create the detailed prompt for Claude that includes:
   - The complete paper structure
   - All verified numerical values
   - All mandatory constraints
   - LaTeX formatting requirements
   - Bibliography entries
   - Figure/table placement instructions

## Instructions for Claude LaTeX Generation

Claude should:

1. Generate a complete LaTeX manuscript with `\documentclass{article}`.
2. Include all sections from the sample manuscript.
3. Use only the numerical values provided in the prompt.
4. Follow all constraints from `PAPER_STYLE_AND_CONSTRAINTS.md`.
5. Include proper `\cite{}` references for all bibliography entries.
6. Place figures and tables at specified locations.
7. Mark the manuscript as a submission draft, not a final publication.

## Key Numbers (Quick Reference)

| Item | Value | Source |
|------|-------|--------|
| Benchmark instances | 275 (11 × 5 × 5) | experiment_manifest.json |
| Methods evaluated | 10 (B1-B5, A1-A5) | campaign.py |
| Granularity instances | 5 (BF-G, 5 seeds) | granularity_experiment.json |
| Channel affected evidence | 1 | granularity_experiment.json |
| Source-event affected evidence | 2 | granularity_experiment.json |
| Channel preserved evidence | 1 | granularity_experiment.json |
| Source-event preserved evidence | 0 | granularity_experiment.json |
| Channel collateral | 0 | granularity_experiment.json |
| Source-event collateral | 1 | granularity_experiment.json |
| Negative controls | 4, all CEE=0.0 | negative_controls.json |
| C3 p-value | 0.1156 (not significant) | claim_registry.json |
| Real-LLM CEE | 0.4 | real_llm_validation.json |
| Real-LLM model | gemini-3.6-flash | real_llm_validation.json |
| Tests | 692 | pytest output |
