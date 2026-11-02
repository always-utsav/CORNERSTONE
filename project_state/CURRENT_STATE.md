# CAPTAIN -- Current State

**Implementation Stage**: 18 (COMPLETE -- FINAL)

**Research Version**: V2 (FROZEN FOR PAPER WRITING)

All 18 planned implementation stages are complete.
V2 Research Consolidation executed, audited, and frozen.

## Version History

| Tag | Commit | Description |
|-----|--------|-------------|
| CAPTAIN-CELA-RESEARCH-FREEZE-V1 | 27ed11a | V1 baseline (682 tests, 6 experiments) |
| CAPTAIN-CELA-RESEARCH-FREEZE-V2 | b620f9b | V2 consolidation (692 tests, 9 experiments) |

## Research Status

- 275 controlled scenario instances across 11 benchmark families
- 9 experiment types (6 from V1 + 3 new in V2)
- 66 documentation files in `documentation/`
- 12 competitor systems analyzed
- Evidence package with SHA-256 checksums for 30 files
- See `documentation/V2_FINAL_SCIENTIFIC_FREEZE.md`

## Verification

- 692 tests passing
- ruff check: clean
- mypy captain: clean
- No API keys in repository

## Key Commits

```
b620f9b  V2 Research Consolidation
27ed11a  V1 Project state documentation
50d13cc  Final scientific closure
d5b4a24  Stage 2 campaign
98e6366  Stage 1.1-B baseline
```

## Commands

```bash
# One-command demo
python -m captain.demo

# Launch Explorer (includes /research endpoint)
python -m captain.explorer

# Run tests
python -m pytest tests/ -q

# Regenerate V1 campaign results (deterministic)
python research/run_campaign.py

# Regenerate V2 manifest
python research/generate_manifest_v2.py

# Evidence integrity check
python research/evidence/generate_checksums.py
```
