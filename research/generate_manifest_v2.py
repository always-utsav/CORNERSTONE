"""Generate the V2 research manifest."""
from __future__ import annotations

import json
import platform
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


def main() -> None:
    try:
        r = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            capture_output=True,
            text=True,
            check=True,
        )
        commit = r.stdout.strip()
    except Exception:
        commit = "unknown"

    manifest = {
        "version": "V2",
        "generated_at": datetime.now(tz=timezone.utc).isoformat(),
        "commit": commit,
        "v1_commit": "27ed11a",
        "v1_tag": "CAPTAIN-CELA-RESEARCH-FREEZE-V1",
        "v2_tag": "CAPTAIN-CELA-RESEARCH-FREEZE-V2",
        "python_version": sys.version,
        "platform": platform.platform(),
        "research_question": (
            "Can causal attribution in autonomous AI-agent failure analysis "
            "be made more selective by intervening at the evidence-flow "
            "channel level rather than at the source-event level?"
        ),
        "hypotheses": {
            "H1": "Channel-level intervention provides more selective causal localization",
            "H2": "CELA can distinguish causal from non-causal channels",
            "H3": "Real LLM outputs depend on evidence content (sanity)",
        },
        "contributions": [
            "Evidence-flow channel as intervention unit",
            "Shared-source multi-artifact evidence isolation",
            "Controlled benchmark with machine-readable ground truth",
            "Empirical demonstration of selectivity advantage",
        ],
        "benchmark": {
            "families": 11,
            "seeds": [42, 123, 456, 789, 1024],
            "instances_per_family_per_seed": 5,
            "total_instances": 275,
            "methods": 10,
        },
        "experiments": {
            "benchmark_campaign": {"status": "executed", "result_files": [
                f"benchmark_seed_{s}.json" for s in [42, 123, 456, 789, 1024]
            ]},
            "granularity": {"status": "executed", "result_file": "granularity_experiment.json"},
            "negative_controls": {"status": "executed", "result_file": "negative_controls.json"},
            "replay_convergence": {"status": "executed", "result_file": "replay_convergence.json"},
            "scalability": {"status": "executed", "result_file": "scalability.json"},
            "real_llm": {"status": "executed", "result_file": "real_llm_validation.json"},
            "pathway_stress": {"status": "executed_v2", "result_file": "pathway_stress.json"},
            "cascade": {"status": "executed_v2", "result_file": "cascade_experiment.json"},
            "cost_utility": {"status": "executed_v2", "result_file": "cost_utility_sweep.json"},
        },
        "claims": {
            "C1": {"status": "supported", "type": "interventional"},
            "C2": {"status": "supported", "type": "interventional"},
            "C3": {"status": "not_supported", "type": "comparative", "p_value": 0.1156},
            "C4": {"status": "supported", "type": "interventional"},
            "C5": {"status": "supported", "type": "descriptive"},
            "C6": {"status": "supported", "type": "descriptive", "note": "trivially true with deterministic MockLLM"},
            "C7": {"status": "supported", "type": "interventional", "note": "sanity check only"},
        },
        "negative_results": [
            "C3: A5 vs B1 causal_f1 not significant (p=0.1156)",
            "Replay convergence trivially true with deterministic MockLLM",
            "AND-complementary single intervention CEE=0 (design limitation)",
            "Cascade individual CEE=0 for OR-redundant scenarios",
        ],
        "limitations": [
            "MockLLM-only controlled experiments",
            "Real-LLM is sanity check (1 model, 1 scenario)",
            "5 instances per family/seed (small sample)",
            "Stdlib-only statistics (no scipy)",
            "Shared-source blocking limitation",
            "No direct competitor comparison possible",
            "Serial replay (no parallelism)",
            "No multi-agent support",
        ],
        "raw_result_files": sorted(str(f.name) for f in Path("research/raw").glob("*.json")),
        "figure_files": sorted(str(f.name) for f in Path("research/figures").glob("*")),
        "documentation_count": len(list(Path("documentation").rglob("*.md"))),
        "test_count": 692,
        "reproducibility_commands": [
            "python research/run_campaign.py",
            "python captain/experiments/figures.py",
            "python captain/experiments/claims.py",
            "python research/evidence/generate_checksums.py",
            "python -m pytest tests/ -q",
        ],
    }

    out = Path("research/V2_RESEARCH_MANIFEST.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"V2 research manifest written to {out}")


if __name__ == "__main__":
    main()
