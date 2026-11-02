# PAPER_DRAFT_AUDIT.md — Final Consistency Correction Pass

**Date**: 2026-10-30
**Manuscript**: `documentation/PAPER_DRAFT_V0.1.md`
**HEAD**: `061e5fe` + uncommitted corrections (this pass)

---

## Correction Log

### 1. BF-G Wilcoxon References Removed

| Location | Before | After |
|----------|--------|-------|
| L19 (Abstract) | "demonstrating statistically verified superior selectivity" | "demonstrating unanimously superior selectivity across all five instances" (fixed in prior gate) |
| L493-496 (Table aggregate) | "p < 0.05" in 3 cells | "5/5" (fixed in prior gate) |
| L504 (Finding #4) | "Statistical Significance: Wilcoxon... W=0.0, p<0.05" | "Unanimous Observation: ... Wilcoxon test is degenerate ... 5/5 instances" (fixed in prior gate) |
| L694 (Conclusion) | "demonstrated statistically verified superior selectivity" | "unanimously preserved benign co-generated evidence (5/5 instances)... No valid inferential p-value could be computed" |
| L733-737 (Appendix Table) | "(Wilcoxon p<0.05)" for C1 and C2 | "(5/5 unanimous)" |

**Remaining Wilcoxon references (L441, L448, L504)**: These describe the statistical methodology toolkit and its n≥6 limitation. L504 explicitly states the test is degenerate for BF-G. These are correctly contextualized.

**Exact statistical result for BF-G**: No valid inferential test was performed. With n=5 and zero variance in paired differences, a Wilcoxon signed-rank test is degenerate. C1 and C2 are supported by a 5/5 unanimous descriptive observation. No p-value exists.

### 2. Conclusion De-Statisticized

L694: Replaced "demonstrated statistically verified superior selectivity" with explicit 5/5 observation, noted no valid p-value.

### 3. Rule 12 Cascade Correction

`PAPER_STYLE_AND_CONSTRAINTS.md` Rule 12 previously said "Individual and joint CEE are both 0 for OR-redundant and AND-complementary scenarios." This contradicted Rule 28 and the raw data.

**Corrected**: BF-B (OR-redundant) = 0.0 (design limitation). BF-C (AND-complementary) = 1.0 (blocking either input breaks conjunction).

Verified against `PAPER_CLAIM_REGISTER.csv` CS1 (corrected in prior gate) and Rules 28-29.

### 4. High-Risk Claims Audited

| Claim | Location | Evidence | Resolution |
|-------|----------|----------|-----------|
| "sole framework" for ARTIFACT_REPLACEMENT | L651 | Literature review only; no competitor code was executed | Narrowed to "only one whose documentation describes" with caveat about literature-based comparison |
| "scalability to large traces" | L568 | `scalability.json`: 4 families, 1 method each, single seed, all small synthetic scenarios | Qualified: "on these small synthetic benchmarks. Scalability to large real-agent traces with hundreds of events has not been measured." |
| "W3C PROV-compliant" | L61, L123, L164 | Code uses PRODUCED/CONSUMED/DERIVED inspired by PROV concepts but does not implement PROV-DM schema, PROV-O ontology, or PROV-N serialization | Changed to "inspired by W3C PROV concepts" (L61), "inspired by the W3C PROV vocabulary" (L123), "PROV-inspired relation extraction" (L164) |
| ">70% pruning" | L590 | No measurement exists | Removed (fixed in prior gate) |
| "2×–5× graph-size increase" | NOT FOUND | Not present in manuscript | No action needed |

### 5. Sections Checked

| Section | Issues Found |
|---------|-------------|
| Abstract (L13-22) | Fixed: "unanimously superior selectivity" ✅ |
| Introduction (L27-69) | Fixed: W3C PROV → "inspired by" ✅ |
| Problem Formulation (L113-150) | Fixed: "PROV-compliant" → "inspired by PROV vocabulary" ✅ |
| Architecture (L153-205) | Fixed: Pipeline diagram PROV label ✅ |
| Statistical Methods (L431-450) | Properly describes toolkit; notes n≥6 limitation ✅ |
| Results 11.1 (L457-504) | Fixed: No Wilcoxon p-value; unanimous observation ✅ |
| Results 11.6 (L551-554) | Correctly distinguishes BF-B=0 from BF-C=1 ✅ |
| Results 11.8 (L562-568) | Fixed: Scalability qualified ✅ |
| Ablation (L572-595) | Fixed: No >70% pruning ✅ |
| Negative Results 13.1 (L602-612) | C3 p=0.1156 preserved ✅ |
| Negative Results 13.2 (L614-615) | BF-B zero correctly explained ✅ |
| Negative Results 13.3 (L617-620) | Deterministic convergence caveat preserved ✅ |
| Competitor 14.1 (L650-653) | Fixed: "sole framework" → qualified literature comparison ✅ |
| Discussion (L657-668) | No unsupported stat claims ✅ |
| Limitations (L673-688) | L688: Correctly notes per-seed power limitation ✅ |
| Conclusion (L692-694) | Fixed: De-statisticized ✅ |
| Appendix (L723-761) | Fixed: C1/C2 "(5/5 unanimous)" not Wilcoxon ✅ |

### 6. Preserved Items

| Item | Status |
|------|--------|
| C3 not supported (p=0.1156) | Preserved ✅ |
| V1/V2 distinction | Preserved ✅ |
| Gemini = limited sanity check | Preserved ✅ |
| Deterministic replay ≠ stochastic robustness | Preserved ✅ |
| All competitor comparisons = literature-based | Preserved ✅ |

---

## Files Inspected

| File | Purpose |
|------|---------|
| `documentation/PAPER_DRAFT_V0.1.md` | Full manuscript text |
| `documentation/PAPER_STYLE_AND_CONSTRAINTS.md` | Rule 12, 28, 29 |
| `documentation/PAPER_CLAIM_REGISTER.csv` | CS1, C1, C2 |
| `research/raw/granularity_experiment.json` | BF-G raw data |
| `research/raw/cascade_experiment.json` | BF-B/BF-C raw data |
| `research/raw/claim_registry.json` | C1/C2 p=NONE |
| `research/raw/scalability.json` | 4 families, small benchmarks |
| `captain/provenance/model.py` | PRODUCED/CONSUMED/DERIVED enum |
| `captain/graph/builder.py` | Graph construction code |

## Unresolved Evidence Gaps

| Item | Status | Impact |
|------|--------|--------|
| No BF-G inferential p-value | **Cannot be resolved** — zero-variance differences make any paired test degenerate | Paper must state C1/C2 as descriptive observation, not statistical generalization |
| No pruning ratio measurement | Acknowledged in manuscript | Any future pruning claim requires benchmark data |
| No large-trace scalability test | Acknowledged in manuscript | Claims bounded to small synthetic benchmarks |
| W3C PROV compliance not formally verified | Changed to "inspired by" | Implementation uses PROV-like concepts but not full PROV-DM compliance |
| Reference metadata unverified | Citation keys [CCT09], [Pearl09], etc. exist in `45_REFERENCE_PAPERS.md` but exact BibTeX fields (venue, pages, DOI) not independently verified | LaTeX stage should verify |

## Final Search for Contradictory Claims

```
Wilcoxon p<0.05 for BF-G:        NONE REMAINING ✅
"statistically verified" for BF-G: NONE REMAINING ✅
"PROV-compliant":                  NONE REMAINING ✅
"sole framework":                  NONE REMAINING ✅
"scalability to large traces":     QUALIFIED ✅ (L568 now says "not been measured")
Cascade "all entries" = 0:         NONE REMAINING ✅
```
