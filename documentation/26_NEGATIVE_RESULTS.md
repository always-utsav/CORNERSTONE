# 26: Negative Results

Transparency in reporting null or contradictory findings is a core tenet of the CAPTAIN/CELA project.

## 1. C3 Statistical Insignificance (A5 vs B1)
CELA-full (A5) does not achieve a statistically significantly higher `causal_f1` than the random baseline (B1), yielding a p-value of `0.1156` (after Holm-Bonferroni correction). This suggests that the controlled synthetic scenarios may be too simple for the full CELA pipeline to demonstrate a statistically significant advantage over random selection in this specific metric.

## 2. Replay Convergence is Trivially True
The observation that Counterfactual Effect Estimate (CEE) converges to 1.0 with a confidence interval of 0.0 across all replay counts is a direct artifact of using a deterministic MockLLM. It is mathematically guaranteed in a deterministic system and does not constitute evidence of stochastic convergence.

## 3. Real-LLM Validation is Not End-to-End
The Real-LLM experiment is purely a sanity check on the premise of evidence-dependence. It was conducted with handcrafted prompts on a single model (Gemini-3.6-flash) and does not involve the full CAPTAIN agent, evidence graph, or replay engine.

## 4. V2 Executed Experiments and Design Limitations
The three experiments previously flagged as unimplemented in V1 were implemented and executed in V2:
- **Pathway stress test** ([`research/raw/pathway_stress.json`](file:///c:/Users/utsav/Desktop/CAPTAIN/research/raw/pathway_stress.json)): Executed with 25 entries across 5 benchmark families (BF-A through BF-E). Results demonstrate sensitivity to pathway topology: single-cause BF-A achieved recall@1 = 1.0, failure prevention = 1.0, and causal F1 = 1.0, whereas multi-pathway redundant families (e.g., BF-B) exhibited recall@1 = 0.0.
- **Cascade/joint intervention test** ([`research/raw/cascade_experiment.json`](file:///c:/Users/utsav/Desktop/CAPTAIN/research/raw/cascade_experiment.json)): Executed with 10 entries across 2 families (BF-B and BF-C). Individual and joint CEE both evaluated to 0.0 due to a design limitation with MockLLM deterministic keyword propagation in OR-redundant scenarios.
- **Cost/utility sweep test** ([`research/raw/cost_utility_sweep.json`](file:///c:/Users/utsav/Desktop/CAPTAIN/research/raw/cost_utility_sweep.json)): Executed across 5 budget levels on BF-F, showing a clean budget-threshold at cost=5 where prevention transitions from 0.0 (insufficient budget) to 1.0 (sufficient budget).

## 5. Conceptual Mismatches in Benchmarks
- **BF-H**: Labeled "branching" but is topologically convergent.
- **BF-J**: Tests parallel independent sources, not a true root-vs-symptom cycle.
- **BF-K**: Tests downstream persistence of a failure rather than a genuine but ineffective repair attempt.
