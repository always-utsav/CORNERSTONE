# V1 vs V2 Comparison — CAPTAIN/CELA

## Experiment Coverage

| Dimension | V1 | V2 | Change |
|-----------|----|----|--------|
| Benchmark campaign | 275 scenarios | 275 scenarios | unchanged |
| Granularity experiment | 5 instances | 5 instances | unchanged |
| Negative controls | 4 controls | 4 controls | unchanged |
| Replay convergence | 6 points | 6 points | unchanged |
| Scalability | 4 families | 4 families | unchanged |
| Real-LLM sanity | 5 trials | 5 trials | unchanged |
| **Pathway stress** | not implemented | 25 entries (5 families × 5) | **new** |
| **Cascade experiment** | not implemented | 10 entries (2 families × 5) | **new** |
| **Cost/utility sweep** | not implemented | 5 budget levels | **new** |

## Test Coverage

| Suite | V1 | V2 | Change |
|-------|----|----|--------|
| Total tests | 682 | 692 | +10 |
| Weakness audit | 0 | 10 | **new** |

## Documentation

| Category | V1 | V2 | Change |
|----------|----|----|--------|
| Research documents | 26 (in research_stage2/) | 66 (in documentation/) | +40 |
| Historical docs | 0 | 7 | **new** |
| Competitor analysis | informal | 12 systems, CSV matrix | **new** |
| Evidence checksums | none | 27 files | **new** |
| Statistical audit | none | 17 checks | **new** |

## Claim Status (Identical)

| Claim | V1 | V2 | Change |
|-------|----|----|--------|
| C1 (channel selectivity) | supported | supported | unchanged |
| C2 (collateral preservation) | supported | supported | unchanged |
| C3 (A5 > B1 causal_f1) | not_supported | not_supported | unchanged |
| C4 (negative controls) | supported | supported | unchanged |
| C5 (seed stability) | supported | supported | unchanged |
| C6 (replay stability) | supported | supported | unchanged |
| C7 (real-LLM CEE) | supported | supported | unchanged |

**No claim status changed between V1 and V2.**

## New Experiment Results

### Pathway Stress
- BF-A (1 pathway): recall@1=1.0, prevention=1.0, F1=1.0
- BF-B (2 OR): variable across instances
- BF-C (2 AND): variable across instances
- BF-D (1 causal + 2 distractor): variable
- BF-G (shared source): variable

### Cascade (Individual vs Joint)
- BF-B (OR): individual_cee_sum=0.0, joint_cee=0.0
  → DESIGN_LIMITATION: MockLLM OR-redundancy prevents individual CEE
- BF-C (AND): individual_cee_sum=0.0, joint_cee=0.0
  → Same limitation applies

### Cost/Utility Sweep (BF-F)
- Budget < 5: no intervention possible (cheapest costs 5)
- Budget ≥ 5: 1 intervention selected, 100% prevention
  → Clean budget-threshold behavior

## Regressions

**None.** All V1 experiments produce identical results.
V1 tag (`CAPTAIN-CELA-RESEARCH-FREEZE-V1`) remains reproducible.

## Summary

V2 adds experimental breadth (3 new experiments, 10 stress tests)
and documentation depth (66 documents, competitor analysis, evidence package)
without changing any V1 result or claim status.
