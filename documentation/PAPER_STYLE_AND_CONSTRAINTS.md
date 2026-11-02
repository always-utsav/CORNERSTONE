# PAPER_STYLE_AND_CONSTRAINTS.md — Mandatory Writing Rules

## Scientific Integrity Rules

1. **No fabricated findings or references.** Every numerical value must trace to a file in `research/raw/`.
2. **No unsupported novelty claims.** Do not call CEE a "fundamentally new estimand." It is an operationalization of intervention-based causal effect estimation applied to agent evidence flows.
3. **No unsupported superiority claims.** Do not claim CELA is universally better than any existing system. The evaluation compares channel-level vs source-event-level intervention on controlled scenarios.
4. **No "first" claims** without independently verified literature evidence.

## Terminology Rules

5. **Use "channel-level intervention"** not "step-level intervention." CELA targets evidence-flow channels, not execution steps.
6. **Use "source-event-level intervention"** for the comparison baseline that modifies the producing tool-result event.
7. **Describe the Gemini experiment as a "sanity check"** not "end-to-end validation" or "real-world evaluation." It uses one model, one scenario, and does not exercise the full CAPTAIN pipeline.
8. **Do not describe deterministic replay sensitivity as "stochastic robustness."** The MockLLM produces identical outputs given identical inputs. CEE convergence in this setting is trivially true.
9. **Use "controlled scenario instances"** not "dataset" or "trajectories." The 275 instances are synthetic mechanisms with known ground truth, not naturally occurring agent traces.

## Claim Categories

10. **Distinguish claim types:**
    - **Interventional**: Supported by controlled counterfactual experiments (C1, C2, C4, C7)
    - **Comparative**: Requires statistical testing between methods (C3 — NOT SUPPORTED)
    - **Descriptive**: Summarizes observed properties (C5, C6)

## Negative Results

11. **Preserve C3**: A5 vs B1 on causal_f1, p = 0.1156, not significant. Do not hide, minimize, or reframe as positive.
12. **Preserve cascade structural distinction**: BF-B (OR-redundant) has individual and joint CEE = 0.0 (design limitation: single-channel intervention cannot break OR gates). BF-C (AND-complementary) has individual and joint CEE = 1.0 (blocking either input breaks the conjunction). Do not conflate these two families.
13. **Preserve trivial convergence**: Replay convergence is trivially true with deterministic MockLLM.

## Competitor Comparison Rules

14. **No competitor was tested directly.** All comparisons in the paper are conceptual or literature-based.
15. **Do not infer missing capabilities from silence** in a competitor paper or repository.
16. **Distinguish comparison types:**
    - Direct experimental comparison: NONE available
    - Reproduction of published method: NONE available
    - Literature-based conceptual comparison: 12 systems
    - Not comparable: systems with incompatible evaluation units

## Citation Rules

17. **Use only verified citation metadata.** Do not fabricate BibTeX keys, authors, venues, or years.
18. **Source citations from** `documentation/45_REFERENCE_PAPERS.md` and `research/comparison/competitor_matrix.csv`.

## Evidence Linking Rules

19. **Every numerical value** in the paper must cite its raw evidence file path.
20. **Every figure/table** must reference its source data file and generation script.
21. **Every claim** must map to an entry in `PAPER_CLAIM_REGISTER.csv`.

## V1/V2 Rules

22. **Clearly separate V1 and V2 results.** V1 = benchmark campaign + granularity + negative controls + convergence + scalability + real-LLM. V2 = pathway stress + cascade + cost/utility.
23. **V1 raw results are immutable.** Do not modify files from the V1 freeze.
24. **Report the V2 tag commit** (`761f78f`) as the authoritative repository state for this paper.

## Statistical Rules

25. **Do not claim Wilcoxon significance for BF-G selectivity.** The paired differences are constant (zero variance); a Wilcoxon signed-rank test is degenerate and produces no valid p-value. Report as a unanimous descriptive observation (5/5 instances).
26. **Do not claim any inferential p-value for C1 or C2.** The claim registry lists these as `N/A (binary observation)`, not as statistically tested claims.
27. **Do not claim >70% pruning** or any specific pruning ratio without a measured benchmark. The pruning effect depends on trace topology and has not been quantified across all families.

## Cascade Rules

28. **Report BF-B and BF-C cascade results separately.** BF-B (OR-redundant): individual and joint CEE = 0.0. BF-C (AND-complementary): individual and joint CEE = 1.0. Do not describe "all entries" as having the same value.
29. **Explain the BF-B zero as a structural limitation**, not as a general system failure. Single-channel intervention cannot break OR-redundant gates unless the budget covers all redundant paths.
