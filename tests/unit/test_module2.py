"""Tests for CORNERSTONE Module 2 -- Interactive Research Laboratories.

Covers:
1. Live granularity comparison endpoint (/api/granularity/run)
2. Granularity metric selectivity: channel vs source-event intervention
3. Bipartite graph integration with generated granularity runs
4. Benchmark family parameterization (/api/demo/benchmark with family & seed)
5. Custom agent task execution (/api/demo with task)
6. Static assets and laboratory template views
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from captain.explorer.app import create_app


@pytest.fixture()
def app(tmp_path: Path):  # type: ignore[no-untyped-def]
    """Create a test Flask app with a temporary store."""
    application = create_app(store_dir=tmp_path / "module2_traces")
    application.config["TESTING"] = True
    return application


@pytest.fixture()
def client(app):  # type: ignore[no-untyped-def]
    """Flask test client."""
    return app.test_client()


# ===================================================================
# 1. Live Granularity Comparison (BF-G) Tests
# ===================================================================


class TestGranularityEndpoint:
    """Verifies the live BF-G shared-source granularity endpoint."""

    def test_granularity_run_returns_valid_comparison(self, client) -> None:  # type: ignore[no-untyped-def]
        resp = client.post("/api/granularity/run", json={"seed": 42})
        assert resp.status_code == 200
        data = json.loads(resp.data)

        assert data["is_live"] is True
        assert data["family"] == "BF-G"
        assert data["seed"] == 42
        assert "factual_run_id" in data
        assert "channel_intervention" in data
        assert "source_event_intervention" in data
        assert "metrics" in data

    def test_granularity_channel_preserves_evidence(self, client) -> None:  # type: ignore[no-untyped-def]
        resp = client.post("/api/granularity/run", json={"seed": 42})
        data = json.loads(resp.data)

        ch = data["channel_intervention"]
        st = data["source_event_intervention"]
        m = data["metrics"]

        # Channel intervention must preserve Artifact B (preserved=1, collateral=0)
        assert ch["preserved_count"] == 1
        assert ch["collateral_damage"] == 0
        assert ch["cee"] == 1.0

        # Source event intervention must destroy Artifact B (preserved=0, collateral=1)
        assert st["preserved_count"] == 0
        assert st["collateral_damage"] == 1
        assert st["cee"] == 1.0

        # CELA channel intervention is strictly more selective
        assert m["channel_more_selective"] is True
        assert m["channel_collateral_rate"] == 0.0
        assert m["source_collateral_rate"] == 1.0

    def test_granularity_runs_are_stored_and_graphable(self, client) -> None:  # type: ignore[no-untyped-def]
        resp = client.post("/api/granularity/run", json={"seed": 42})
        data = json.loads(resp.data)
        fid = data["factual_run_id"]

        # Factual run must be loadable in /api/run/<id>
        r_run = client.get(f"/api/run/{fid}")
        assert r_run.status_code == 200
        run_data = json.loads(r_run.data)
        assert len(run_data["artifacts"]) >= 2

        # Factual run must be graphable in /api/graph/<id>
        r_graph = client.get(f"/api/graph/{fid}")
        assert r_graph.status_code == 200
        graph_data = json.loads(r_graph.data)
        assert len(graph_data["graph"]["nodes"]) > 0

    def test_granularity_supports_alternate_seeds(self, client) -> None:  # type: ignore[no-untyped-def]
        resp = client.post("/api/granularity/run", json={"seed": 123})
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data["seed"] == 123
        assert data["metrics"]["channel_more_selective"] is True


# ===================================================================
# 2. Benchmark Parameterization Tests
# ===================================================================


class TestBenchmarkFamilyParameterization:
    """Verifies that /api/demo/benchmark accepts family and seed."""

    def test_benchmark_shared_source_family(self, client) -> None:  # type: ignore[no-untyped-def]
        resp = client.post("/api/demo/benchmark", json={"family": "BF-G", "seed": 42})
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data["family"] == "BF-G"
        assert "run_id" in data
        assert len(data["candidates"]) >= 1

    def test_benchmark_cascade_family(self, client) -> None:  # type: ignore[no-untyped-def]
        resp = client.post("/api/demo/benchmark", json={"family": "BF-D", "seed": 42})
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data["family"] in ("BF-D", "BF-E")
        assert len(data["candidates"]) >= 1

    def test_benchmark_redundant_family(self, client) -> None:  # type: ignore[no-untyped-def]
        resp = client.post("/api/demo/benchmark", json={"family": "BF-C", "seed": 42})
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert data["family"] == "BF-C"


# ===================================================================
# 3. Agent Simulator Custom Task Execution
# ===================================================================


class TestAgentSimulatorCustomTask:
    """Verifies custom task ingestion in /api/demo."""

    def test_custom_task_execution(self, client) -> None:  # type: ignore[no-untyped-def]
        custom_task = "Compute compound ratio from revenue index"
        resp = client.post("/api/demo", json={"task": custom_task})
        assert resp.status_code == 200
        data = json.loads(resp.data)
        assert "run_id" in data
        assert data["status"] == "completed"
        assert custom_task in data["task_input"]


# ===================================================================
# 4. Static Asset and Laboratory Viewports Verification
# ===================================================================


class TestLaboratoryViewsAndAssets:
    """Verifies that all laboratory templates and assets load properly."""

    def test_index_contains_all_laboratory_views(self, client) -> None:  # type: ignore[no-untyped-def]
        resp = client.get("/")
        assert resp.status_code == 200
        html = resp.data.decode("utf-8")

        assert "id=\"view-agent-simulator\"" in html
        assert "id=\"view-evidence-explorer\"" in html
        assert "id=\"view-cela-lab\"" in html
        assert "id=\"view-cascade-lab\"" in html
        assert "btn-run-both-interventions" in html
        assert "slider-lambda-cost" in html

    def test_static_laboratory_assets_serve(self, client) -> None:  # type: ignore[no-untyped-def]
        assets = [
            "/static/css/laboratories.css",
            "/static/js/components/explanationSystem.js",
            "/static/js/components/agentSimulator.js",
            "/static/js/components/evidenceExplorer.js",
            "/static/js/components/celaInterventionLab.js",
            "/static/js/components/failureCascadeLab.js",
        ]
        for a in assets:
            r = client.get(a)
            assert r.status_code == 200, f"Asset failed: {a}"
