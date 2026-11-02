"""Tests for CORNERSTONE Module 3 -- Research Intelligence, Benchmark Studio,
Figures Gallery, Mathematical Methodology, and Scientific Honesty Verification.

Covers:
1. Benchmark Seed API (/api/research/benchmark/<seed>)
2. Benchmark Info Catalog (/api/research/benchmarks/info - all 11 families)
3. Method Matrix & Equivalences (/api/research/methods - B1-B5, A1-A5, A1=B2, A2=B3)
4. Figure Catalog & Asset Serving (/api/research/figures & /api/research/figures/<name>)
5. Scientific Honesty & Statistical Claim Verification (Claim C3 p=0.1156, BF-G N=5 descriptive)
6. Presentation Mode & Module 3 Template Viewports
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
    application = create_app(store_dir=tmp_path / "module3_traces")
    application.config["TESTING"] = True
    return application


@pytest.fixture()
def client(app: Any) -> Any:
    """Flask test client."""
    return app.test_client()


# ===================================================================
# 1. Benchmark Seed API Tests
# ===================================================================


class TestBenchmarkSeedEndpoint:
    """Verifies frozen benchmark seed results endpoint."""

    @pytest.mark.parametrize("seed", [42, 123, 456, 789, 1024])
    def test_benchmark_valid_seeds_return_data(self, client: Any, seed: int) -> None:
        resp = client.get(f"/api/research/benchmark/{seed}")
        assert resp.status_code == 200
        data = json.loads(resp.data)

        assert "overall_aggregates" in data
        assert "family_aggregates" in data
        assert "config" in data
        assert data["config"]["master_seed"] == seed
        assert len(data["family_aggregates"]) == 11

    def test_benchmark_invalid_seed_returns_404(self, client: Any) -> None:
        resp = client.get("/api/research/benchmark/999")
        assert resp.status_code == 404
        data = json.loads(resp.data)
        assert "error" in data
        assert "available_seeds" in data
        assert 42 in data["available_seeds"]


# ===================================================================
# 2. Benchmark Families Info API Tests
# ===================================================================


class TestBenchmarkInfoEndpoint:
    """Verifies the 11 failure family metadata catalog."""

    def test_all_11_families_present(self, client: Any) -> None:
        resp = client.get("/api/research/benchmarks/info")
        assert resp.status_code == 200
        data = json.loads(resp.data)

        assert data["total_families"] == 11
        families = data["families"]
        family_ids = [f["id"] for f in families]
        expected_ids = [
            "BF-A",
            "BF-B",
            "BF-C",
            "BF-D",
            "BF-E",
            "BF-F",
            "BF-G",
            "BF-H",
            "BF-I",
            "BF-J",
            "BF-K",
        ]
        assert family_ids == expected_ids

    def test_family_metadata_fields(self, client: Any) -> None:
        resp = client.get("/api/research/benchmarks/info")
        data = json.loads(resp.data)

        for fam in data["families"]:
            assert "id" in fam
            assert "name" in fam
            assert "topology_type" in fam
            assert "mechanism" in fam
            assert "causal_ground_truth" in fam
            assert "primary_challenge" in fam
            assert "figure_key" in fam

    def test_bf_g_shared_source_specs(self, client: Any) -> None:
        resp = client.get("/api/research/benchmarks/info")
        data = json.loads(resp.data)
        bf_g = next(f for f in data["families"] if f["id"] == "BF-G")

        assert "Shared Source" in bf_g["name"]
        assert "Multi-Artifact" in bf_g["topology_type"]
        assert "fig_granularity.svg" in bf_g["figure_key"]


# ===================================================================
# 3. Method Matrix & Equivalences Tests
# ===================================================================


class TestResearchMethodsEndpoint:
    """Verifies method matrix, baseline and CELA definitions, and equivalences."""

    def test_all_10_methods_present(self, client: Any) -> None:
        resp = client.get("/api/research/methods")
        assert resp.status_code == 200
        data = json.loads(resp.data)

        assert data["total_methods"] == 10
        codes = [m["code"] for m in data["methods"]]
        expected_codes = ["B1", "B2", "B3", "B4", "B5", "A1", "A2", "A3", "A4", "A5"]
        assert codes == expected_codes

    def test_documented_equivalences(self, client: Any) -> None:
        resp = client.get("/api/research/methods")
        data = json.loads(resp.data)
        eqs = data["equivalences"]

        assert eqs.get("A1_cela") == "B2_provenance"
        assert eqs.get("A2_cela") == "B3_cee_rank"

    def test_claim_c3_honesty_documented(self, client: Any) -> None:
        resp = client.get("/api/research/methods")
        data = json.loads(resp.data)
        a5 = next(m for m in data["methods"] if m["code"] == "A5")

        assert "p=0.1156" in a5["empirical_notes"]


# ===================================================================
# 4. Figures Catalog & Asset Serving Tests
# ===================================================================


class TestResearchFiguresCatalog:
    """Verifies that all 9 publication figures exist on disk and are served."""

    def test_figures_catalog_returns_9_items(self, client: Any) -> None:
        resp = client.get("/api/research/figures")
        assert resp.status_code == 200
        data = json.loads(resp.data)

        assert data["total_figures"] == 9
        figs = data["figures"]
        fig_ids = [f["id"] for f in figs]
        expected_ids = [
            "fig_attribution",
            "fig_collateral",
            "fig_granularity",
            "fig_convergence",
            "fig_cost_utility",
            "fig_negative_controls",
            "fig_pathway_stress",
            "fig_real_llm",
            "fig_scalability",
        ]
        assert fig_ids == expected_ids

    def test_all_figure_files_served_successfully(self, client: Any) -> None:
        resp = client.get("/api/research/figures")
        data = json.loads(resp.data)

        for fig in data["figures"]:
            # Test SVG endpoint
            resp_svg = client.get(f"/api/research/figures/{fig['filename_svg']}")
            assert resp_svg.status_code == 200
            assert "svg" in resp_svg.content_type.lower() or len(resp_svg.data) > 0

            # Test PNG endpoint
            resp_png = client.get(f"/api/research/figures/{fig['filename_png']}")
            assert resp_png.status_code == 200
            assert "png" in resp_png.content_type.lower() or len(resp_png.data) > 0


# ===================================================================
# 5. Scientific Honesty & Statistical Claim Verification
# ===================================================================


class TestScientificHonestyClaims:
    """Verifies that claims match authoritatively frozen data."""

    def test_claim_c3_is_marked_not_supported(self, client: Any) -> None:
        resp = client.get("/api/research/claims")
        assert resp.status_code == 200
        claims = json.loads(resp.data)

        c3 = next(c for c in claims if c["claim_id"] == "C3")
        assert c3["status"] == "not_supported"
        assert "MockLLM" in c3["limitation"]

    def test_negative_controls_all_zero_cee(self, client: Any) -> None:
        resp = client.get("/api/research/negative_controls")
        assert resp.status_code == 200
        controls = json.loads(resp.data)

        for ctrl in controls:
            assert ctrl["observed_cee"] == 0.0
            assert ctrl["passed"] is True

    def test_bf_g_5_instances_unanimous_in_granularity_data(self, client: Any) -> None:
        resp = client.get("/api/research/granularity")
        assert resp.status_code == 200
        gran = json.loads(resp.data)

        # 5 instances
        assert len(gran) == 5
        for item in gran:
            assert item["family"] == "BF-G"
            # Channel intervention has 0 collateral damage
            assert item["channel_intervention"]["collateral"] == 0
            assert item["channel_intervention"]["preserved_evidence"] == 1
            # Source event intervention has 1 collateral damage
            assert item["source_event_intervention"]["collateral"] == 1
            assert item["source_event_intervention"]["preserved_evidence"] == 0
            # Channel is strictly more selective
            assert item["granularity_metrics"]["channel_more_selective"] is True


# ===================================================================
# 6. Template & Presentation Mode Viewport Tests
# ===================================================================


class TestModule3TemplateIntegrity:
    """Verifies that index.html contains all 12 slides and Module 3 containers."""

    def test_index_html_renders_module3_elements(self, client: Any) -> None:
        resp = client.get("/")
        assert resp.status_code == 200
        html = resp.data.decode("utf-8")

        # Module 3 Viewport Containers
        assert 'id="benchmark-studio-container"' in html
        assert 'id="research-dashboard-container"' in html
        assert 'id="figure-gallery-container"' in html
        assert 'id="methodology-explorer-container"' in html

        # Presentation Stage & 12 Slides
        assert 'class="presentation-stage"' in html
        for s in range(1, 13):
            assert f'data-slide="{s}"' in html
        assert "SLIDE 1 OF 12" in html

        # Script tags for Module 3 components
        assert "benchmarkStudio.js" in html
        assert "figureGallery.js" in html
        assert "researchDashboard.js" in html
        assert "methodologyExplorer.js" in html

        # Scientific Honesty Check: No false p < 0.001 claim on BF-G
        assert "Channel preserves unrelated evidence (p < 0.001)" not in html
