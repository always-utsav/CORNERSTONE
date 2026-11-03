"""Tests for CORNERSTONE Module 4 -- Final Scientific Integrity & Consistency.

Covers:
1. Real-LLM validation error accounting (failed API calls cannot be counted as evaluations).
2. Model version verification (gemini-3.6-flash) and trial-level accounting.
3. Canonical baseline naming (B1-B5, A1-A5) and diagnostic Oracle verification.
4. Elimination of stale BF-G significance language across rendered views.
5. Exact traceability of cost-utility formulas, lambda operating points, and Oracle alignment.
6. Input sanitization and security boundary validation.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest

from captain.explorer.app import create_app


@pytest.fixture()
def app(tmp_path: Path) -> Any:
    """Create a test Flask app with a temporary store."""
    application = create_app(store_dir=tmp_path / "module4_traces")
    application.config["TESTING"] = True
    return application


@pytest.fixture()
def client(app: Any) -> Any:
    """Flask test client."""
    return app.test_client()


# ===================================================================
# 1. Real-LLM Evidence & Trial Error Accounting Tests
# ===================================================================


class TestRealLLMEvidenceAccounting:
    """Verifies that failed API calls are not counted as semantic model evaluations."""

    def test_recorded_model_version_is_gemini_3_6_flash(self, client: Any) -> None:
        resp = client.get("/api/research/real_llm")
        assert resp.status_code == 200
        data = json.loads(resp.data)

        assert data["provider"] == "google_gemini"
        assert data["model"] == "gemini-3.6-flash"
        assert data["model_version"] == "gemini-3.6-flash"

    def test_failed_api_calls_are_accounted_and_not_treated_as_semantic_success(
        self, client: Any
    ) -> None:
        resp = client.get("/api/research/real_llm")
        data = json.loads(resp.data)

        # 5 attempted trials per condition
        factual_trials = data["factual_trials"]
        channel_trials = data["channel_trials"]
        source_trials = data["source_event_trials"]

        assert len(factual_trials) == 5
        assert len(channel_trials) == 5
        assert len(source_trials) == 5

        # Check factual trials: exactly 2 valid, 3 ResourceExhausted errors
        valid_factual = [t for t in factual_trials if "ResourceExhausted" not in t["outcome_text"]]
        exhausted_factual = [t for t in factual_trials if "ResourceExhausted" in t["outcome_text"]]
        assert len(valid_factual) == 2
        assert len(exhausted_factual) == 3

        # All valid factual trials detected the failure keyword
        for t in valid_factual:
            assert t["failure_detected"] is True
            assert t["keyword_present"] is True

        # In a proper evaluation, exhausted calls must NOT be counted as non-failures
        # If naive denominator 5 is used: 2/5 = 0.40. If valid denominator 2 is used: 2/2 = 1.00
        conditional_factual_failure_rate = sum(
            1 for t in valid_factual if t["failure_detected"]
        ) / len(valid_factual)
        assert conditional_factual_failure_rate == 1.0

        # Check channel trials: 2 valid, 3 ResourceExhausted
        valid_channel = [t for t in channel_trials if "ResourceExhausted" not in t["outcome_text"]]
        assert len(valid_channel) == 2
        for t in valid_channel:
            assert t["failure_detected"] is False

        conditional_channel_failure_rate = sum(
            1 for t in valid_channel if t["failure_detected"]
        ) / len(valid_channel)
        assert conditional_channel_failure_rate == 0.0

        # Conditional CEE on valid non-exhausted calls is 1.0 (1.0 - 0.0)
        assert conditional_factual_failure_rate - conditional_channel_failure_rate == 1.0

    def test_real_llm_figure_catalog_references_correct_model(self, client: Any) -> None:
        resp = client.get("/api/research/figures")
        data = json.loads(resp.data)
        real_llm_fig = next(f for f in data["figures"] if f["id"] == "fig_real_llm")

        assert "gemini-3.6-flash" in real_llm_fig["title"]
        assert "Gemini 2.5" not in real_llm_fig["title"]
        assert "5 attempted" in real_llm_fig["description"]


# ===================================================================
# 2. Canonical Baseline Definitions & Method Matrix Tests
# ===================================================================


class TestCanonicalBaselinesMatrix:
    """Verifies baseline naming consistency across backend and documentation."""

    def test_canonical_method_names_in_api(self, client: Any) -> None:
        resp = client.get("/api/research/methods")
        assert resp.status_code == 200
        data = json.loads(resp.data)

        method_map = {m["id"]: m["name"] for m in data["methods"]}
        assert method_map["B1_random"] == "Random Intervention"
        assert method_map["B2_provenance"] == "Provenance-Only Reachability"
        assert method_map["B3_cee_rank"] == "CEE Ranking (Single-Channel)"
        assert method_map["B4_graph_structural"] == "Graph-Structural Distance"
        assert method_map["B5_cost_aware"] == "Cost-Aware Structural"

        # CELA methods
        assert method_map["A1_cela"] == "CELA-Provenance"
        assert method_map["A2_cela"] == "CELA-CEE Screening"
        assert method_map["A3_cela"] == "CELA-Cascade Lookahead"
        assert method_map["A4_cela"] == "CELA-Greedy Knapsack"
        assert method_map["A5_cela"] == "CELA-Full Pipeline"

    def test_oracle_is_designated_evaluation_only(self, client: Any) -> None:
        resp = client.get("/api/research/methods")
        data = json.loads(resp.data)

        assert "oracle" in data
        assert data["oracle"]["is_baseline"] is False
        assert "Evaluation-Only Diagnostic Upper Bound" in data["oracle"]["role"]
        assert "274/275" in data["oracle"]["exact_optimal_match"]


# ===================================================================
# 3. BF-G Statistical Honesty Tests
# ===================================================================


class TestBFGStatisticalHonesty:
    """Ensures no page, slide, or tooltip displays invalid significance claims for BF-G."""

    def test_no_invalid_wilcoxon_significance_in_template(self, client: Any) -> None:
        resp = client.get("/")
        html = resp.data.decode("utf-8")

        # Must NOT contain p < 0.001 claims on BF-G evidence preservation
        assert "Channel preserves unrelated evidence (p < 0.001)" not in html
        assert "p < 0.001" not in html
        assert "Unanimous Descriptive Observation" in html or "N=5" in html


# ===================================================================
# 4. Cost-Utility and Oracle Alignment Exact Traceability Tests
# ===================================================================


class TestCostUtilityAndOracleTraceability:
    """Verifies mathematical reproducibility of published utility and Oracle metrics."""

    def test_seed_42_cost_utility_exact_values(self, client: Any) -> None:
        resp = client.get("/api/research/benchmark/42")
        data = json.loads(resp.data)
        aggs = data["overall_aggregates"]

        b1 = aggs["B1_random"]["summaries"]
        a5 = aggs["A5_cela"]["summaries"]

        # Utility: U = CEE - lambda * Cost (lambda = 0.1)
        # B1: 0.80 - 0.1 * 2.2727 = 0.5727
        assert abs(b1["utility"]["mean"] - 0.5727) < 0.001
        assert abs(b1["intervention_cost"]["mean"] - 2.2727) < 0.001

        # A5: 0.80 - 0.1 * 0.80 = 0.7200
        assert abs(a5["utility"]["mean"] - 0.7200) < 0.001
        assert abs(a5["intervention_cost"]["mean"] - 0.8000) < 0.001

        # Cost reduction: (2.2727 - 0.80) / 2.2727 = 64.80%
        cost_reduction = (
            (b1["intervention_cost"]["mean"] - a5["intervention_cost"]["mean"])
            / b1["intervention_cost"]["mean"]
            * 100
        )
        assert abs(cost_reduction - 64.80) < 0.05

    def test_oracle_zero_regret_exact_scenarios_count(self, client: Any) -> None:
        seeds = [42, 123, 456, 789, 1024]
        total_scenarios = 0
        total_zero_regret = 0

        for seed in seeds:
            resp = client.get(f"/api/research/benchmark/{seed}")
            data = json.loads(resp.data)
            regret_vals = data["overall_aggregates"]["A5_cela"]["summaries"]["regret"]["values"]
            total_scenarios += len(regret_vals)
            total_zero_regret += sum(1 for v in regret_vals if v == 0.0)

        # 275 total scenarios across 5 seeds
        assert total_scenarios == 275
        # Exactly 274 scenarios achieved zero regret (exact match to Oracle optimal objective)
        assert total_zero_regret == 274
        alignment_rate = total_zero_regret / total_scenarios * 100
        assert abs(alignment_rate - 99.64) < 0.01


# ===================================================================
# 5. Security & Boundary Tests
# ===================================================================


class TestSecurityAndInputSanitization:
    """Verifies that endpoints cleanly reject invalid input and preserve boundaries."""

    def test_demo_endpoint_handles_string_payload_safely(self, client: Any) -> None:
        malicious_prompt = "<script>alert('xss')</script>"
        resp = client.post("/api/demo", json={"task": malicious_prompt})
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert "run_id" in data
        assert malicious_prompt in data["task_input"]

    def test_invalid_figure_name_returns_404(self, client: Any) -> None:
        resp = client.get("/api/research/figures/non_existent_figure.svg")
        assert resp.status_code == 404
