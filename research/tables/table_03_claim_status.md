# Table 3: Claim Evaluation Results

| Claim | Description | Test | p-value | Status |
|-------|-------------|------|---------|--------|
| C1 | Channel more selective | Granularity comparison | N/A | **Supported** |
| C2 | Channel preserves evidence | Collateral comparison | N/A | **Supported** |
| C3 | A5 > B1 causal_f1 | Permutation test | 0.1156 | Not supported |
| C4 | Negative controls CEE=0 | 4 negative controls | N/A | **Supported** |
| C5 | Seed stability CV<0.2 | 5-seed CV analysis | N/A | **Supported** |
| C6 | Replay stability | 6-point convergence | N/A | **Supported** (trivially) |
| C7 | Real-LLM CEE>0 | Gemini sanity check | N/A | **Supported** |
