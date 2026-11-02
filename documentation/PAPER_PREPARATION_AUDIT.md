# PAPER_PREPARATION_AUDIT.md — Phase 1 Audit Results

**Date**: 2026-10-24
**HEAD**: `fba7465`
**V1 Tag**: `CAPTAIN-CELA-RESEARCH-FREEZE-V1` → `27ed11aff073285333fcb05b62210c243ac2864a`
**V2 Tag**: `CAPTAIN-CELA-RESEARCH-FREEZE-V2` → `fba7465a53529326466b34ea938ffe93367a26c7`

## Audit Summary

| Category | A (verified) | B (incomplete) | C (inconsistent) | D (missing) |
|----------|:-:|:-:|:-:|:-:|
| Documentation (66 files) | 55 | 0 | 2 | 0 |
| Skeleton docs (thin but correct) | 9 | — | — | — |
| Raw results (16 files) | 16 | 0 | 0 | 0 |
| Figures (18 files) | 18 | 0 | 0 | 0 |
| Tables (12 files) | 9 | 2 | 1 | 0 |
| Evidence package | 3 | 0 | 0 | 0 |
| Statistics | 2 | 0 | 0 | 0 |
| Comparison | 2 | 0 | 0 | 0 |
| Improvements | 5 | 0 | 0 | 1 (03 missing) |
| Paper draft | 0 | 1 | 0 | 0 |

## Issues Found and Resolutions

### INCONSISTENCIES (C)

| # | File | Issue | Resolution |
|---|------|-------|-----------|
| 1 | `documentation/26_NEGATIVE_RESULTS.md` | Section 4 says pathway_stress/cascade/cost_utility NOT implemented | UPDATE: V2 executed them |
| 2 | `documentation/33_LIMITATIONS.md` | Point 8 says 3 experiments unexecuted | UPDATE: V2 executed them |
| 3 | `research/tables/table_04_granularity.md` | Values show "N/A" — generator bug | FIX: read from nested dict |
| 4 | `README.md` (root) | Test count shows 682 (V1) | UPDATE: 692 (V2) |

### INCOMPLETE (B)

| # | File | Issue | Resolution |
|---|------|-------|-----------|
| 5 | `research/tables/table_05_negative_controls.md` | Control names show "?" | FIX: read correct key |
| 6 | `research/tables/table_06_scalability.md` | Empty (0 rows) | FIX: unpack dict before list |
| 7 | `paper/draft_v1.md` | Section 6 (Results) is placeholder | CREATE: PAPER_DRAFT_V0.1.md |

### SKELETON (correct but thin)

| File | Lines of Prose |
|------|---------------|
| `04_RESEARCH_QUESTION.md` | ~5 |
| `10_METHODOLOGY.md` | ~7 |
| `14_PROVENANCE_MODEL.md` | ~4 |
| `15_EVIDENCE_FLOW_MODEL.md` | ~4 |
| `17_COUNTERFACTUAL_REPLAY.md` | ~6 |
| `18_CEE_ESTIMATION.md` | ~5 |
| `19_CASCADE_ANALYSIS.md` | ~5 |
| `28_ROBUSTNESS.md` | ~4 |
| `29_SCALABILITY.md` | ~4 |

These are accurate but concise. The sample manuscript will expand on them.

### MISSING

| # | Expected | Status |
|---|----------|--------|
| 1 | `research/improvements/03_IMPLEMENTED_IMPROVEMENTS.md` | Missing in sequence — content covered by 02 and 05 |
| 2 | `documentation/PAPER_HANDOFF_README.md` | Not yet created — Phase 4 |
| 3 | `documentation/PAPER_EVIDENCE_PACKAGE.md` | Not yet created — Phase 4 |
| 4 | `documentation/PAPER_CLAIM_REGISTER.csv` | Not yet created — Phase 4 |
| 5 | `documentation/PAPER_STYLE_AND_CONSTRAINTS.md` | Not yet created — Phase 4 |
| 6 | `documentation/PAPER_DRAFT_V0.1.md` | Not yet created — Phase 5 |
| 7 | `documentation/PAPER_DRAFT_AUDIT.md` | Not yet created — Phase 7 |

## Experiments Verified Against Raw Data

| ID | Experiment | Status | Raw File | Entries |
|----|-----------|--------|----------|---------|
| EXP-01 | Benchmark campaign | EXECUTED (V1) | benchmark_seed_{42..1024}.json | 315 comparisons |
| EXP-02 | Granularity comparison | EXECUTED (V1) | granularity_experiment.json | 5 instances |
| EXP-03 | Negative controls | EXECUTED (V1) | negative_controls.json | 4 controls |
| EXP-04 | Replay convergence | EXECUTED (V1) | replay_convergence.json | dict |
| EXP-05 | Scalability | EXECUTED (V1) | scalability.json | dict |
| EXP-06 | Real-LLM sanity | EXECUTED (V1) | real_llm_validation.json | 1 model |
| EXP-07 | Pathway stress | EXECUTED (V2) | pathway_stress.json | 25 entries |
| EXP-08 | Cascade | EXECUTED (V2) | cascade_experiment.json | 10 entries |
| EXP-09 | Cost/utility sweep | EXECUTED (V2) | cost_utility_sweep.json | 5 budgets |
