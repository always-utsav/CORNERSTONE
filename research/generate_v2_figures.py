"""Generate figures for V2 experiments: pathway stress, cascade, cost/utility."""
from __future__ import annotations

import json
from pathlib import Path

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    HAS_MPL = True
except ImportError:
    HAS_MPL = False


def generate_v2_figures() -> None:
    """Generate SVG figures for V2 experiments."""
    raw = Path("research/raw")
    out = Path("research/figures")
    out.mkdir(exist_ok=True)

    if not HAS_MPL:
        print("matplotlib not available — generating text-based summaries instead")
        _text_summaries(raw, out)
        return

    # Figure: Pathway stress
    with open(raw / "pathway_stress.json") as f:
        ps = json.load(f)

    from collections import defaultdict
    fam_data: dict[str, list[dict]] = defaultdict(list)
    for entry in ps:
        fam_data[entry["family"]].append(entry)

    families = sorted(fam_data.keys())
    avg_f1 = [
        sum(e["causal_f1"] for e in fam_data[fam]) / len(fam_data[fam])
        for fam in families
    ]
    avg_prev = [
        sum(e["failure_prevention_rate"] for e in fam_data[fam]) / len(fam_data[fam])
        for fam in families
    ]

    fig, ax = plt.subplots(figsize=(10, 5))
    x = range(len(families))
    width = 0.35
    ax.bar([i - width / 2 for i in x], avg_f1, width, label="Causal F1")
    ax.bar([i + width / 2 for i in x], avg_prev, width, label="Prevention Rate")
    ax.set_xlabel("Benchmark Family")
    ax.set_ylabel("Score")
    ax.set_title("Pathway Stress: CELA Performance by Family")
    ax.set_xticks(list(x))
    ax.set_xticklabels(families)
    ax.legend()
    ax.set_ylim(0, 1.1)
    fig.tight_layout()
    fig.savefig(out / "fig_pathway_stress.svg", format="svg")
    fig.savefig(out / "fig_pathway_stress.png", format="png", dpi=150)
    plt.close(fig)
    print("  fig_pathway_stress.svg/png")

    # Figure: Cost/utility sweep
    with open(raw / "cost_utility_sweep.json") as f:
        cu = json.load(f)

    budgets = []
    prevention_rates = []
    for budget_str, vals in sorted(cu.items(), key=lambda x: float(x[0])):
        b = float(budget_str)
        if b == float("inf"):
            b = 15.0  # cap for display
        budgets.append(b)
        prevention_rates.append(vals.get("prevention_rate", 0))

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.step(budgets, prevention_rates, where="post", linewidth=2, color="#e94560")
    ax.set_xlabel("Budget")
    ax.set_ylabel("Prevention Rate")
    ax.set_title("Cost/Utility Sweep: Prevention vs Budget (BF-F)")
    ax.set_ylim(-0.05, 1.1)
    ax.axhline(y=1.0, color="gray", linestyle="--", alpha=0.5, label="100%")
    ax.axvline(x=5.0, color="gray", linestyle=":", alpha=0.5, label="Threshold")
    ax.legend()
    fig.tight_layout()
    fig.savefig(out / "fig_cost_utility.svg", format="svg")
    fig.savefig(out / "fig_cost_utility.png", format="png", dpi=150)
    plt.close(fig)
    print("  fig_cost_utility.svg/png")

    print(f"V2 figures generated in {out}/")


def _text_summaries(raw: Path, out: Path) -> None:
    """Fallback: write text summaries when matplotlib unavailable."""
    with open(raw / "pathway_stress.json") as f:
        ps = json.load(f)
    summary = f"Pathway stress: {len(ps)} entries across "
    families = {e["family"] for e in ps}
    summary += f"{len(families)} families\n"
    with open(out / "fig_pathway_stress_summary.txt", "w") as f:
        f.write(summary)

    with open(raw / "cost_utility_sweep.json") as f:
        cu = json.load(f)
    summary = f"Cost/utility: {len(cu)} budget levels\n"
    for b, v in sorted(cu.items(), key=lambda x: float(x[0])):
        summary += f"  Budget {b}: prevention={v.get('prevention_rate', 0)}\n"
    with open(out / "fig_cost_utility_summary.txt", "w") as f:
        f.write(summary)
    print("  Text summaries written (matplotlib not available)")


if __name__ == "__main__":
    generate_v2_figures()
