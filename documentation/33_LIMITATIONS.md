# 33: Limitations

The current evaluation of the CAPTAIN/CELA framework has several known limitations that contextualize the findings.

1. **MockLLM Reliance**: All benchmark experiments use a deterministic, scripted MockLLM. They do not reflect the stochasticity or reasoning failures of real LLMs.
2. **Real-LLM Scope**: The Real-LLM validation is merely a sanity check with handcrafted prompts on a single model (`gemini-3.6-flash`), not an end-to-end evaluation.
3. **Synthetic Scenarios**: The benchmark scenarios are strictly controlled synthetic environments that may lack the complexity of real-world agent trajectories.
4. **Statistical Methods**: Statistics are implemented using only the standard library (no `scipy`), necessitating non-standard implementations (though validated).
5. **Shared-Source Limitations**: The granularity (shared-source) experiments assume tool outputs can be perfectly decoupled, which is rarely true for opaque API calls.
6. **Benchmark Mismatches**: 
   - BF-H tests convergent topologies, not branching.
   - BF-J tests parallel sources, not true circular root-vs-symptom loops.
   - BF-K tests downstream persistence, not genuine repair behavior.
7. **Baseline Equivalences**: CELA variants A1 and A2 are functionally equivalent to baselines B2 and B3, respectively.
8. **V2 Experiment Execution and Design Limitations**: Pathway stress, cascade/joint intervention, and cost/utility sweep experiments were implemented and executed in V2 ([`research/raw/pathway_stress.json`](file:///c:/Users/utsav/Desktop/CAPTAIN/research/raw/pathway_stress.json), [`research/raw/cascade_experiment.json`](file:///c:/Users/utsav/Desktop/CAPTAIN/research/raw/cascade_experiment.json), [`research/raw/cost_utility_sweep.json`](file:///c:/Users/utsav/Desktop/CAPTAIN/research/raw/cost_utility_sweep.json)). However, several design limitations were identified:
   - In the cascade experiment, both individual and joint CEE evaluate to 0.0 due to a design limitation with MockLLM keyword propagation in OR-redundant scenarios.
   - In the cost/utility sweep, evaluation is restricted to a single scenario (BF-F) with a discrete step-level cost threshold (cost=5) rather than continuous cost curves.
   - The pathway stress test evaluates 5 benchmark families (25 entries) using synthetic MockLLM instances rather than stochastic multi-agent execution paths.
9. **No External Agent**: No external, third-party LLM agent framework was evaluated through the CAPTAIN pipeline.
