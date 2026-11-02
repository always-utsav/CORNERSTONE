# Table 2: Evaluation Methods

| ID | Name | Type | Description |
|----|------|------|-------------|
| B1 | Random | Baseline | Random channel selection |
| B2 | Provenance-all | Baseline | All provenance-connected channels |
| B3 | Provenance-top-k | Baseline | Top-k by provenance score |
| B4 | Provenance-random | Baseline | Random from provenance set |
| B5 | Oracle | Upper bound | Ground truth causal channels |
| A1 | CELA-1 | CELA | Provenance only (=B2) |
| A2 | CELA-2 | CELA | CEE estimation (=B3) |
| A3 | CELA-3 | CELA | CEE + bottleneck |
| A4 | CELA-4 | CELA | CEE + cascade |
| A5 | CELA-5 | CELA | Full pipeline |
