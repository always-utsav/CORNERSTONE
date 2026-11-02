"""CAPTAIN Trace Explorer -- Flask application.

A lightweight local browser-based interface for inspecting CAPTAIN
execution traces, graphs, provenance, and artifacts.

Launch::

    python -m captain.explorer

Or::

    python scripts/launch_explorer.py
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from flask import Flask, jsonify, render_template, request, send_from_directory

from captain.adapters.llm import MockLLMProvider
from captain.agent.agent import Agent
from captain.agent.tools import create_default_tool_registry
from captain.agent.types import TaskInput
from captain.graph.analysis import GraphAnalyzer
from captain.graph.builder import ExecutionGraphBuilder
from captain.graph.validation import GraphValidator
from captain.models.execution import ExecutionRun
from captain.provenance.query import ProvenanceQuery
from captain.storage.store import FileTraceStore
from captain.tracing.traced_agent import TracedAgent

# Default storage directory
_DEFAULT_STORE_DIR = Path("./captain_traces")

# In-memory run cache (for demo runs not yet stored)
_run_cache: dict[str, ExecutionRun] = {}


def create_app(store_dir: Path | None = None) -> Flask:
    """Create and configure the Flask application."""
    template_dir = Path(__file__).parent / "templates"
    static_dir = Path(__file__).parent / "static"
    app = Flask(
        __name__,
        template_folder=str(template_dir),
        static_folder=str(static_dir),
        static_url_path="/static",
    )
    store_path = store_dir or _DEFAULT_STORE_DIR
    store = FileTraceStore(store_path)

    # --- Page routes --------------------------------------------------------

    @app.route("/")
    def index() -> str:
        return render_template("index.html")

    # --- API routes ---------------------------------------------------------

    @app.route("/api/demo", methods=["POST"])
    def run_demo() -> Any:
        """Run a deterministic demo execution and return the run."""
        req = request.get_json(silent=True) or {}
        task_text = req.get("task", "What is 6 times 7? Use the calculator.")
        llm = MockLLMProvider(
            responses=[
                "1. [TOOL:calculator] Compute 6*7\n"
                "2. [TOOL:echo] Report result\n"
                "3. Generate response",
                "Computation complete: 42",
                "Echo confirmed",
                f"The answer is 42. Computed for task: {task_text[:100]}",
            ]
        )
        registry = create_default_tool_registry()
        agent = Agent(llm=llm, tool_registry=registry)
        traced = TracedAgent(agent)
        _response, collector = traced.run(TaskInput.from_text(task_text))
        run = collector.get_run()

        # Store and cache
        store.save(run)
        _run_cache[run.run_id] = run

        return jsonify(_run_summary(run))

    @app.route("/api/runs")
    def list_runs() -> Any:
        """List all stored run IDs."""
        run_ids = store.list_runs()
        summaries = []
        for rid in run_ids:
            loaded = store.load(rid)
            if loaded:
                summaries.append(_run_summary(loaded))
        return jsonify(summaries)

    @app.route("/api/run/<run_id>")
    def get_run(run_id: str) -> Any:
        """Get full run details."""
        run = _get_run(run_id, store)
        if run is None:
            return jsonify({"error": "Run not found"}), 404
        return jsonify(_run_detail(run))

    @app.route("/api/graph/<run_id>")
    def get_graph(run_id: str) -> Any:
        """Get graph data for vis.js rendering."""
        run = _get_run(run_id, store)
        if run is None:
            return jsonify({"error": "Run not found"}), 404
        graph = ExecutionGraphBuilder.build(run)
        validation = GraphValidator.validate(graph)
        analyzer = GraphAnalyzer(graph)
        return jsonify(
            {
                "graph": _graph_to_vis(graph),
                "validation": {
                    "is_valid": validation.is_valid,
                    "errors": validation.error_count,
                    "warnings": validation.warning_count,
                },
                "analysis": analyzer.summary(),
            }
        )

    @app.route("/api/event/<run_id>/<event_id>")
    def get_event(run_id: str, event_id: str) -> Any:
        """Get event details."""
        run = _get_run(run_id, store)
        if run is None:
            return jsonify({"error": "Run not found"}), 404
        for evt in run.events:
            if evt.event_id == event_id:
                return jsonify(_event_detail(evt))
        return jsonify({"error": "Event not found"}), 404

    @app.route("/api/artifact/<run_id>/<artifact_id>")
    def get_artifact(run_id: str, artifact_id: str) -> Any:
        """Get artifact details with provenance."""
        run = _get_run(run_id, store)
        if run is None:
            return jsonify({"error": "Run not found"}), 404
        for art in run.artifacts:
            if art.artifact_id == artifact_id:
                pq = ProvenanceQuery(run)
                return jsonify(_artifact_detail(art, pq))
        return jsonify({"error": "Artifact not found"}), 404

    @app.route("/api/provenance/<run_id>/<artifact_id>")
    def get_provenance(run_id: str, artifact_id: str) -> Any:
        """Get full provenance lineage for an artifact."""
        run = _get_run(run_id, store)
        if run is None:
            return jsonify({"error": "Run not found"}), 404
        pq = ProvenanceQuery(run)
        return jsonify(
            {
                "artifact_id": artifact_id,
                "producer": pq.get_producer(artifact_id),
                "consumers": pq.get_consumers(artifact_id),
                "upstream": pq.trace_upstream(artifact_id),
                "downstream": pq.trace_downstream(artifact_id),
            }
        )

    # Stage 18 Caches
    _scenario_cache: dict[str, Any] = {}
    _experiment_cache: dict[str, Any] = {}

    @app.route("/api/demo/benchmark", methods=["POST"])
    def run_benchmark_demo() -> Any:
        try:
            from captain.benchmarks.runner import BenchmarkRunner
            from captain.benchmarks.scenarios import (
                generate_branching,
                generate_cascade,
                generate_complementary,
                generate_convergent,
                generate_cost_asymmetric,
                generate_distractor,
                generate_downstream_repair,
                generate_redundant,
                generate_root_vs_symptom,
                generate_shared_source,
                generate_single_cause,
            )
            from captain.models.ids import deterministic_ids
        except ImportError as e:
            return jsonify({"error": str(e)}), 500

        req = request.get_json(silent=True) or {}
        family = req.get("family", "BF-A")
        seed = int(req.get("seed", 42))

        from collections.abc import Callable

        family_map: dict[str, Callable[..., Any]] = {
            "BF-A": generate_single_cause,
            "BF-B": generate_redundant,
            "BF-C": generate_complementary,
            "BF-D": generate_distractor,
            "BF-E": generate_cascade,
            "BF-F": generate_cost_asymmetric,
            "BF-G": generate_shared_source,
            "BF-H": generate_branching,
            "BF-I": generate_convergent,
            "BF-J": generate_root_vs_symptom,
            "BF-K": generate_downstream_repair,
        }
        generator = family_map.get(family, generate_single_cause)

        with deterministic_ids(seed):
            scenario = generator(seed=seed)

        _scenario_cache[scenario.scenario_id] = scenario
        # Save scenario baseline run into store and cache
        store.save(scenario.run)
        _run_cache[scenario.run.run_id] = scenario.run

        runner = BenchmarkRunner(k=2, max_set_size=3, lambda_cost=0.1)
        result = runner.run([scenario], methods=None, run_oracle=True)

        gt = scenario.ground_truth
        candidates_summary = [
            {
                "id": c.intervention_id,
                "source": c.source_evidence_id,
                "target": c.target_evidence_id,
                "type": c.intervention_type.value
                if hasattr(c.intervention_type, "value")
                else str(c.intervention_type),
            }
            for c in scenario.candidates
        ]

        # Cache result for counterfactual/cascade views
        _scenario_cache[scenario.scenario_id + "_result"] = result

        return jsonify(
            {
                "scenario_id": scenario.scenario_id,
                "run_id": scenario.run.run_id,
                "family": gt.family,
                "ground_truth": {
                    "label": "POST-HOC EVALUATION ONLY",
                    "causal_channel_ids": gt.causal_channel_ids,
                    "evaluation_only": True,
                },
                "candidates": candidates_summary,
                "method_results": [
                    {
                        "method": mr.method_name,
                        "metrics": mr.metrics.model_dump(),
                    }
                    for mr in result.results
                ],
            }
        )

    @app.route("/api/granularity/run", methods=["POST"])
    def run_granularity_live() -> Any:
        """Execute a live shared-source granularity comparison (BF-G)."""
        try:
            from captain.analysis.estimator import channel_to_intervention
            from captain.benchmarks.scenarios import generate_shared_source, get_evaluator
            from captain.intervention.model import Intervention, InterventionSet, InterventionType
            from captain.models.enums import EventType
            from captain.models.ids import deterministic_ids
            from captain.replay.engine import CounterfactualReplayEngine, ReplayStatus
        except ImportError as e:
            return jsonify({"error": str(e)}), 500

        req = request.get_json(silent=True) or {}
        seed = int(req.get("seed", 42))

        with deterministic_ids(seed):
            scenario = generate_shared_source(seed=seed)

        evaluator = get_evaluator(scenario)
        factual_run = scenario.run
        factual_failed = evaluator(factual_run)
        store.save(factual_run)
        _run_cache[factual_run.run_id] = factual_run

        causal_ids = set(scenario.ground_truth.causal_channel_ids)
        causal = [c for c in scenario.candidates if c.intervention_id in causal_ids]
        if not causal:
            return jsonify({"error": "No causal candidate found"}), 500

        ci = causal[0]
        ch_intv = channel_to_intervention(ci, factual_run, scenario.evidence_graph)
        ch_iset = InterventionSet(baseline_run_id=factual_run.run_id, interventions=[ch_intv])
        ch_replay = CounterfactualReplayEngine().replay(factual_run, ch_iset)
        ch_ok = ch_replay.status == ReplayStatus.SUCCESS
        ch_run = ch_replay.counterfactual_run
        if ch_run:
            store.save(ch_run)
            _run_cache[ch_run.run_id] = ch_run

        ch_text = ""
        ch_a_present = False
        ch_b_present = False
        if ch_ok and ch_run:
            for evt in ch_run.events:
                if evt.payload:
                    ch_text += str(evt.payload)
            for art in ch_run.artifacts:
                if art.value:
                    ch_text += str(art.value)
            ch_a_present = "42" in ch_text
            ch_b_present = "ok" in ch_text.lower()

        ch_failed = evaluator(ch_run) if (ch_ok and ch_run) else True
        ch_cee = 1.0 if (factual_failed and not ch_failed) else 0.0
        ch_affected = (0 if ch_a_present else 1) + (0 if ch_b_present else 1)
        ch_preserved = 2 - ch_affected
        collateral_ch = max(0, ch_affected - 1)

        # Source event override
        source_evt = None
        for evt in factual_run.events:
            if evt.event_type == EventType.TOOL_RESULT:
                p = evt.payload if isinstance(evt.payload, dict) else {}
                if p.get("tool_name") == "data_source":
                    source_evt = evt
                    break

        st_cee = 0.0
        st_a_present = False
        st_b_present = False
        st_affected = 0
        st_run = None
        if source_evt:
            st_intv = Intervention(
                intervention_type=InterventionType.TOOL_RESULT_OVERRIDE,
                baseline_run_id=factual_run.run_id,
                target_id=source_evt.event_id,
                replacement_value="",
                description="Source-event-level override",
            )
            st_iset = InterventionSet(baseline_run_id=factual_run.run_id, interventions=[st_intv])
            st_replay = CounterfactualReplayEngine().replay(factual_run, st_iset)
            st_ok = st_replay.status == ReplayStatus.SUCCESS
            st_run = st_replay.counterfactual_run
            if st_run:
                store.save(st_run)
                _run_cache[st_run.run_id] = st_run

            st_text = ""
            if st_ok and st_run:
                for evt2 in st_run.events:
                    if evt2.payload:
                        st_text += str(evt2.payload)
                for art2 in st_run.artifacts:
                    if art2.value:
                        st_text += str(art2.value)
                st_a_present = "42" in st_text
                st_b_present = "ok" in st_text.lower()

            st_failed = evaluator(st_run) if (st_ok and st_run) else True
            st_cee = 1.0 if (factual_failed and not st_failed) else 0.0
            st_affected = (0 if st_a_present else 1) + (0 if st_b_present else 1)

        st_preserved = 2 - st_affected
        collateral_st = max(0, st_affected - 1)

        return jsonify(
            {
                "is_live": True,
                "seed": seed,
                "scenario_id": scenario.scenario_id,
                "family": "BF-G",
                "factual_failed": factual_failed,
                "factual_run_id": factual_run.run_id,
                "channel_run_id": ch_run.run_id if ch_run else None,
                "source_run_id": st_run.run_id if st_run else None,
                "channel_intervention": {
                    "type": ch_intv.intervention_type.value,
                    "target_id": ch_intv.target_id,
                    "cee": ch_cee,
                    "failure_prevented": not ch_failed,
                    "a_present": ch_a_present,
                    "b_present": ch_b_present,
                    "affected_count": ch_affected,
                    "preserved_count": ch_preserved,
                    "collateral_damage": collateral_ch,
                },
                "source_event_intervention": {
                    "type": "tool_result_override",
                    "target_id": source_evt.event_id if source_evt else None,
                    "cee": st_cee,
                    "failure_prevented": not st_failed if source_evt else False,
                    "a_present": st_a_present,
                    "b_present": st_b_present,
                    "affected_count": st_affected,
                    "preserved_count": st_preserved,
                    "collateral_damage": collateral_st,
                },
                "metrics": {
                    "channel_preservation_rate": ch_preserved / 2.0,
                    "source_preservation_rate": st_preserved / 2.0,
                    "channel_collateral_rate": collateral_ch / 1.0,
                    "source_collateral_rate": collateral_st / 1.0,
                    "channel_more_selective": (ch_preserved > st_preserved),
                },
            }
        )

    @app.route("/api/evidence/<run_id>")
    def get_evidence(run_id: str) -> Any:
        try:
            from captain.evidence.lineage import EvidenceLineageBuilder
        except ImportError as e:
            return jsonify({"error": str(e)}), 500
        run = _get_run(run_id, store)
        if not run:
            return jsonify({"error": "Not found"}), 404
        builder = EvidenceLineageBuilder(run)
        evidence_list, transformations = builder.build()

        nodes = []
        for n in evidence_list:
            nodes.append(
                {
                    "id": n.evidence_id,
                    "evidence_type": n.evidence_type.value
                    if hasattr(n.evidence_type, "value")
                    else str(n.evidence_type),
                    "artifact_id": n.artifact_id,
                    "producer": n.creation_event_id,
                    "sequence": n.sequence_number,
                }
            )

        edges = []
        for t in transformations:
            edges.append(
                {
                    "source": t.source_evidence_id,
                    "target": t.target_evidence_id,
                    "type": t.transformation_type.value
                    if hasattr(t.transformation_type, "value")
                    else str(t.transformation_type),
                    "event_id": t.event_id,
                    "provenance": t.provenance_method.value
                    if hasattr(t.provenance_method, "value")
                    else str(t.provenance_method),
                }
            )

        return jsonify(
            {
                "evidence": nodes,
                "transformations": edges,
                "count": len(nodes),
            }
        )

    @app.route("/api/failure/<run_id>")
    def get_failure(run_id: str) -> Any:
        try:
            from captain.evidence.graph import EvidenceFlowGraph
            from captain.evidence.lineage import EvidenceLineageBuilder
            from captain.failures.analyzer import FailureAnalyzer
            from captain.failures.model import Failure, FailureType
        except ImportError as e:
            return jsonify({"error": str(e)}), 500
        run = _get_run(run_id, store)
        if not run:
            return jsonify({"error": "Not found"}), 404

        builder = EvidenceLineageBuilder(run)
        evidence_list, transformations = builder.build()
        graph = EvidenceFlowGraph.from_lineage(evidence_list, transformations)

        failure = Failure(
            failure_id="f1",
            run_id=run_id,
            failure_type=FailureType.TASK_FAILURE,
            description="Demonstration failure analysis",
        )

        analyzer = FailureAnalyzer(graph, failure)
        candidates = analyzer.candidates()
        interventions = analyzer.interventions()

        return jsonify(
            {
                "failure": {
                    "failure_id": failure.failure_id,
                    "failure_type": failure.failure_type.value,
                    "description": failure.description,
                },
                "candidates": [
                    {
                        "id": c.candidate_id,
                        "source": c.source_evidence_id,
                        "target": c.target_evidence_id,
                        "score": c.screening_score,
                    }
                    for c in candidates
                ],
                "interventions": [
                    {
                        "id": ci.intervention_id,
                        "source": ci.source_evidence_id,
                        "target": ci.target_evidence_id,
                    }
                    for ci in interventions
                ],
            }
        )

    @app.route("/api/counterfactual/<scenario_id>")
    def get_counterfactual(scenario_id: str) -> Any:
        if scenario_id not in _scenario_cache:
            return jsonify({"error": "Not found"}), 404
        scenario = _scenario_cache[scenario_id]  # noqa: F841
        result_key = scenario_id + "_result"
        result = _scenario_cache.get(result_key)

        method_cees = []
        if result:
            for mr in result.results:
                method_cees.append(
                    {
                        "method": mr.method_name,
                        "causal_f1": mr.metrics.attribution.causal_f1
                        if mr.metrics.attribution
                        else None,
                        "cee_set": mr.metrics.prevention.cee_set
                        if mr.metrics.prevention
                        else None,
                    }
                )

        return jsonify(
            {
                "scenario_id": scenario_id,
                "factual": {
                    "label": "FACTUAL (OBSERVED)",
                    "failure": True,
                    "description": "Original execution with failure",
                },
                "counterfactual": {
                    "label": "COUNTERFACTUAL",
                    "description": "Execution with intervention applied",
                    "method_results": method_cees,
                },
            }
        )

    @app.route("/api/cascade/<scenario_id>")
    def get_cascade(scenario_id: str) -> Any:
        if scenario_id not in _scenario_cache:
            return jsonify({"error": "Not found"}), 404
        scenario = _scenario_cache[scenario_id]
        result_key = scenario_id + "_result"
        result = _scenario_cache.get(result_key)

        gt = scenario.ground_truth
        method_summaries = []
        if result:
            for mr in result.results:
                eff = mr.metrics.efficiency
                prev = mr.metrics.prevention
                method_summaries.append(
                    {
                        "method": mr.method_name,
                        "set_size": eff.set_size if eff else 0,
                        "cost": eff.intervention_cost if eff else 0,
                        "utility": eff.utility if eff else 0,
                        "prevention_rate": prev.failure_prevention_rate if prev else 0,
                    }
                )

        oracle_data = None
        if result and result.oracle_results:
            # Dict keyed by scenario_id
            first_key = next(iter(result.oracle_results))
            orc = result.oracle_results[first_key]
            oracle_data = {
                "label": "EVALUATION ONLY",
                "optimal_objective": orc.optimal_objective,
                "sets_evaluated": orc.sets_evaluated,
            }

        return jsonify(
            {
                "scenario_id": scenario_id,
                "family": gt.family,
                "method_cascade_results": method_summaries,
                "oracle": oracle_data,
                "ground_truth_label": "POST-HOC EVALUATION ONLY",
            }
        )

    @app.route("/api/experiment", methods=["POST"])
    def run_experiment() -> Any:
        try:
            from captain.experiments import ExperimentConfig, ExperimentRunner
        except ImportError as e:
            return jsonify({"error": str(e)}), 500
        req = request.json or {}
        config = ExperimentConfig(
            master_seed=req.get("master_seed", 42),
            instances_per_family=req.get("instances_per_family", 3),
            families=req.get("families", ["BF-A", "BF-B", "BF-C"]),
            methods=req.get("methods", ["B1", "B2", "A2", "A4"]),
            bootstrap_resamples=req.get("bootstrap_resamples", 200),
        )
        runner = ExperimentRunner(config)
        result = runner.run()
        _experiment_cache["last"] = result
        return jsonify(result.model_dump() if hasattr(result, "model_dump") else result)

    @app.route("/api/experiment/summary")
    def get_experiment_summary() -> Any:
        if "last" not in _experiment_cache:
            return jsonify({"message": "No experiment has been run"})
        result = _experiment_cache["last"]
        rows = []
        for mname, agg in result.overall_aggregates.items():
            f1 = agg.summaries.get("causal_f1")
            prev = agg.summaries.get("failure_prevention_rate")
            cee = agg.summaries.get("cee_set")
            cost = agg.summaries.get("intervention_cost")
            ci = agg.confidence_intervals.get("causal_f1")
            rows.append(
                {
                    "method": mname,
                    "causal_f1": f1.mean if f1 else None,
                    "prevention": prev.mean if prev else None,
                    "cee_set": cee.mean if cee else None,
                    "cost": cost.mean if cost else None,
                    "ci_lower": ci.ci_lower if ci else None,
                    "ci_upper": ci.ci_upper if ci else None,
                    "n_scenarios": agg.n_scenarios,
                }
            )
        return jsonify(
            {
                "summary": rows,
                "seed": result.metadata.master_seed,
                "total_scenarios": result.metadata.total_scenarios,
                "comparisons": len(result.comparisons),
            }
        )

    @app.route("/api/experiment/export", methods=["POST"])
    def export_experiment() -> Any:
        if "last" not in _experiment_cache:
            return jsonify({"error": "No experiment to export"}), 400
        result = _experiment_cache["last"]
        import uuid

        exp_id = uuid.uuid4().hex
        out_path = Path("captain_results") / f"experiment_{exp_id}.json"
        out_path.parent.mkdir(exist_ok=True)
        with open(out_path, "w") as f:
            f.write(
                result.model_dump_json() if hasattr(result, "model_dump_json") else str(result)
            )
        return jsonify({"path": str(out_path)})

    # --- Stage 2 Research Routes ---
    @app.route("/research")
    def research_page() -> str:
        return render_template("research.html")

    def _load_research_json(filename: str) -> Any:
        filepath = Path(__file__).parent.parent.parent / "research" / "raw" / filename
        try:
            with open(filepath, encoding="utf-8") as f:
                return json.load(f)
        except UnicodeDecodeError:
            with open(filepath, encoding="cp1252") as f:
                return json.load(f)

    @app.route("/api/research/campaign")
    def research_campaign() -> Any:
        return jsonify(_load_research_json("campaign_full.json"))

    @app.route("/api/research/granularity")
    def research_granularity() -> Any:
        return jsonify(_load_research_json("granularity_experiment.json"))

    @app.route("/api/research/negative_controls")
    def research_negative_controls() -> Any:
        return jsonify(_load_research_json("negative_controls.json"))

    @app.route("/api/research/convergence")
    def research_convergence() -> Any:
        return jsonify(_load_research_json("replay_convergence.json"))

    @app.route("/api/research/real_llm")
    def research_real_llm() -> Any:
        return jsonify(_load_research_json("real_llm_validation.json"))

    @app.route("/api/research/claims")
    def research_claims() -> Any:
        return jsonify(_load_research_json("claim_registry.json"))

    @app.route("/api/research/cascade")
    def research_cascade() -> Any:
        return jsonify(_load_research_json("cascade_experiment.json"))

    @app.route("/api/research/cost_utility")
    def research_cost_utility() -> Any:
        return jsonify(_load_research_json("cost_utility_sweep.json"))

    @app.route("/api/research/pathway_stress")
    def research_pathway_stress() -> Any:
        return jsonify(_load_research_json("pathway_stress.json"))

    @app.route("/api/research/scalability")
    def research_scalability() -> Any:
        return jsonify(_load_research_json("scalability.json"))

    @app.route("/api/research/manifest")
    def research_manifest() -> Any:
        return jsonify(_load_research_json("experiment_manifest.json"))

    @app.route("/api/system/status")
    def system_status() -> Any:
        run_ids = store.list_runs()
        return jsonify(
            {
                "platform": "CORNERSTONE",
                "framework": "CAPTAIN / CELA",
                "scientific_version": "V2 (FROZEN)",
                "status": "ONLINE",
                "total_runs": len(run_ids),
                "benchmark_families": 11,
                "benchmark_instances": 275,
                "verified_tests": 692,
                "demo_seed": 42,
            }
        )

    @app.route("/api/research/benchmark/<int:seed>")
    def research_benchmark_seed(seed: int) -> Any:
        valid_seeds = [42, 123, 456, 789, 1024]
        if seed not in valid_seeds:
            return jsonify(
                {
                    "error": f"Seed {seed} not found in frozen results.",
                    "available_seeds": valid_seeds,
                }
            ), 404
        return jsonify(_load_research_json(f"benchmark_seed_{seed}.json"))

    @app.route("/api/research/benchmarks/info")
    def research_benchmarks_info() -> Any:
        families = [
            {
                "id": "BF-A",
                "name": "Single Channel",
                "legacy_alias": None,
                "topology_type": "Linear Single-Path",
                "mechanism": (
                    "A single faulty evidence channel propagates directly from "
                    "tool output to downstream failure, alongside an independent "
                    "distractor channel."
                ),
                "causal_ground_truth": "Single target channel (k=1)",
                "primary_challenge": (
                    "Isolating the genuine causal channel from the benign distractor channel."
                ),
                "figure_key": "fig_attribution.svg",
            },
            {
                "id": "BF-B",
                "name": "Redundant OR",
                "legacy_alias": None,
                "topology_type": "Disjunctive Parallel Multi-Path",
                "mechanism": (
                    "Two independent channels both carry faulty evidence. The "
                    "downstream consumer fails if EITHER channel is active (OR "
                    "logic)."
                ),
                "causal_ground_truth": (
                    "Either channel individually or both jointly prevent failure"
                ),
                "primary_challenge": (
                    "Single-channel interventions fail to prevent failure if the "
                    "alternate redundant channel remains unblocked."
                ),
                "figure_key": "fig_attribution.svg",
            },
            {
                "id": "BF-C",
                "name": "Complementary AND",
                "legacy_alias": None,
                "topology_type": "Conjunctive Multi-Channel Interaction",
                "mechanism": (
                    "Two distinct channels must interact simultaneously to induce "
                    "failure (AND logic). Intervening on either one breaks the "
                    "conjunction."
                ),
                "causal_ground_truth": (
                    "Conjunctive pair where breaking either channel prevents failure"
                ),
                "primary_challenge": (
                    "Detecting interactive effects without over-intervening or "
                    "paying excessive cost."
                ),
                "figure_key": "fig_attribution.svg",
            },
            {
                "id": "BF-D",
                "name": "Distractor Noise",
                "legacy_alias": None,
                "topology_type": "High-Distractor Ratio",
                "mechanism": (
                    "A single true causal channel surrounded by multiple non-causal "
                    "distractor channels carrying irrelevant tool outputs."
                ),
                "causal_ground_truth": "Single causal channel among 2+ distractors",
                "primary_challenge": (
                    "Suppression of false positives; baselines suffer up to 75% "
                    "distractor false selection rate."
                ),
                "figure_key": "fig_attribution.svg",
            },
            {
                "id": "BF-E",
                "name": "Cascade Multi-Hop",
                "legacy_alias": None,
                "topology_type": "Deep 3-Hop Linear Propagation",
                "mechanism": (
                    "Failure originates at an upstream tool, passes through intermediate "
                    "transformation artifacts, and terminates at final agent state."
                ),
                "causal_ground_truth": "Earliest root cause vs intermediate transmission channels",
                "primary_challenge": (
                    "Distinguishing upstream root cause from downstream propagation "
                    "symptoms across 3 hops."
                ),
                "figure_key": "fig_attribution.svg",
            },
            {
                "id": "BF-F",
                "name": "Cost-Asymmetric AND",
                "legacy_alias": None,
                "topology_type": "Cost-Weighted Conjunctive",
                "mechanism": (
                    "Complementary failure requiring both channels, but the channels "
                    "have strongly asymmetric intervention costs (e.g., cost 1.0 "
                    "vs cost 5.0)."
                ),
                "causal_ground_truth": "Cheaper causal channel in the conjunctive cut",
                "primary_challenge": (
                    "Budget optimization; choosing the minimum-cost intervention "
                    "set that still successfully prevents failure."
                ),
                "figure_key": "fig_cost_utility.svg",
            },
            {
                "id": "BF-G",
                "name": "Shared Source Divergence",
                "legacy_alias": None,
                "topology_type": "Multi-Artifact Tool Output",
                "mechanism": (
                    "A single tool execution event produces two separate artifacts: "
                    "A (causal/faulty) and B (benign/unrelated)."
                ),
                "causal_ground_truth": "Channel A only (preserving Channel B)",
                "primary_challenge": (
                    "Demonstrating that channel intervention preserves unrelated "
                    "artifact B with zero collateral damage, whereas source-event "
                    "intervention destroys both."
                ),
                "figure_key": "fig_granularity.svg",
            },
            {
                "id": "BF-H",
                "name": "Convergent Mixed",
                "legacy_alias": "BRANCHING",
                "topology_type": "Mixed Causal and Benign Convergence",
                "mechanism": (
                    "A causal channel and an independent benign channel converge "
                    "into an intermediate aggregator before failure."
                ),
                "causal_ground_truth": "Causal tributary channel prior to aggregator",
                "primary_challenge": (
                    "Attribution before aggregation merges causal signal with benign information."
                ),
                "figure_key": "fig_attribution.svg",
            },
            {
                "id": "BF-I",
                "name": "Convergent Diamond",
                "legacy_alias": None,
                "topology_type": "Diamond Topology with Single Cause",
                "mechanism": (
                    "Execution branches from common source and converges downstream, "
                    "where only one branch carries failure semantics."
                ),
                "causal_ground_truth": "Active faulty branch channel",
                "primary_challenge": (
                    "Isolating which branch of the diamond graph actually transmits the failure."
                ),
                "figure_key": "fig_attribution.svg",
            },
            {
                "id": "BF-J",
                "name": "Parallel Independent Sources",
                "legacy_alias": "ROOT_VS_SYMPTOM",
                "topology_type": "Dual Independent Origin Sources",
                "mechanism": (
                    "Two separate initial root events generate independent failure "
                    "propagation paths."
                ),
                "causal_ground_truth": "Independent origin channels",
                "primary_challenge": (
                    "Root attribution when multiple upstream origins exist concurrently."
                ),
                "figure_key": "fig_attribution.svg",
            },
            {
                "id": "BF-K",
                "name": "Downstream Persistence",
                "legacy_alias": "DOWNSTREAM_REPAIR",
                "topology_type": "Ineffective Downstream Repair",
                "mechanism": (
                    "An intermediate repair or mitigation step attempts to fix "
                    "faulty evidence but fails, leaving the downstream error persistent."
                ),
                "causal_ground_truth": (
                    "Original upstream generator (repair channel is ineffective)"
                ),
                "primary_challenge": (
                    "Recognizing that the downstream repair was ineffective and "
                    "tracing back to the true upstream origin."
                ),
                "figure_key": "fig_attribution.svg",
            },
        ]
        return jsonify({"families": families, "total_families": len(families)})

    @app.route("/api/research/methods")
    def research_methods() -> Any:
        methods = [
            {
                "id": "B1_random",
                "code": "B1",
                "name": "Random Intervention",
                "category": "Baseline",
                "description": (
                    "Monte Carlo random sampling of candidate intervention channels "
                    "from upstream candidates."
                ),
                "theoretical_properties": "Uniform exploration; no causal heuristic.",
                "empirical_notes": (
                    "High F1 on small graphs purely by chance, but suffers high "
                    "distractor selection rate (73.3%) and high intervention cost "
                    "(2.27)."
                ),
                "is_ablation": False,
            },
            {
                "id": "B2_provenance",
                "code": "B2",
                "name": "Provenance-Only Reachability",
                "category": "Baseline",
                "description": (
                    "Selects all channels reachable in the upstream provenance "
                    "DAG from the failure symptom."
                ),
                "theoretical_properties": (
                    "Guaranteed reachability; equivalent to CELA Stage 1 (A1)."
                ),
                "empirical_notes": (
                    "Admits all upstream channels regardless of whether they actually "
                    "contributed to failure."
                ),
                "is_ablation": False,
                "equivalence": "A1_cela",
            },
            {
                "id": "B3_cee_rank",
                "code": "B3",
                "name": "CEE Ranking (Single-Channel)",
                "category": "Baseline",
                "description": (
                    "Ranks channels strictly by individual Counterfactual Execution "
                    "Effect without cascade analysis."
                ),
                "theoretical_properties": (
                    "Greedy single-channel screening; equivalent to CELA Stage 2 (A2)."
                ),
                "empirical_notes": (
                    "High recall (1.0), but cannot reason about conjunctive interactions "
                    "or downstream collateral damage."
                ),
                "is_ablation": False,
                "equivalence": "A2_cela",
            },
            {
                "id": "B4_graph_structural",
                "code": "B4",
                "name": "Graph-Structural Heuristic",
                "category": "Baseline",
                "description": (
                    "Non-interventional graph centrality ranking (degree, betweenness, "
                    "proximity to failure)."
                ),
                "theoretical_properties": "Zero replay cost; relies entirely on topology.",
                "empirical_notes": "Easily misled by benign hubs or high-degree distractor tools.",
                "is_ablation": False,
            },
            {
                "id": "B5_cost_aware",
                "code": "B5",
                "name": "Cost-Aware Greedy",
                "category": "Baseline",
                "description": (
                    "Intervenes on minimum-cost candidate channels without counterfactual "
                    "validation."
                ),
                "theoretical_properties": "Cost minimization heuristic.",
                "empirical_notes": (
                    "Low cost (1.82) but lower recall (0.87) due to ignoring actual causal power."
                ),
                "is_ablation": False,
            },
            {
                "id": "A1_cela",
                "code": "A1",
                "name": "CELA-Provenance",
                "category": "CELA Ablation",
                "description": "Stage 1 structural provenance filtering only.",
                "theoretical_properties": "Equivalent to baseline B2_provenance.",
                "empirical_notes": (
                    "Establishes baseline candidate set for subsequent counterfactual screening."
                ),
                "is_ablation": True,
                "equivalence": "B2_provenance",
            },
            {
                "id": "A2_cela",
                "code": "A2",
                "name": "CELA-CEE Screening",
                "category": "CELA Ablation",
                "description": (
                    "Stage 1 provenance + Stage 2 counterfactual replay screening "
                    "(CEE > threshold)."
                ),
                "theoretical_properties": "Equivalent to baseline B3_cee_rank.",
                "empirical_notes": (
                    "Filters non-causal candidates; achieves 1.0 recall and 0.82 prevention rate."
                ),
                "is_ablation": True,
                "equivalence": "B3_cee_rank",
            },
            {
                "id": "A3_cela",
                "code": "A3",
                "name": "CELA-Cascade Lookahead",
                "category": "CELA Ablation",
                "description": (
                    "Adds Stage 3 downstream cascade propagation analysis with uniform costs."
                ),
                "theoretical_properties": (
                    "Evaluates multi-hop downstream consequences before committing "
                    "to intervention."
                ),
                "empirical_notes": (
                    "Dramatic drop in distractor false selection rate from 58.3% down to 1.67%."
                ),
                "is_ablation": True,
            },
            {
                "id": "A4_cela",
                "code": "A4",
                "name": "CELA-Greedy Knapsack",
                "category": "CELA Ablation",
                "description": (
                    "Adds Stage 4 greedy cost-utility multi-objective optimization "
                    "with budget constraints."
                ),
                "theoretical_properties": (
                    "Approximates Pareto-optimal frontier under submodular utility assumptions."
                ),
                "empirical_notes": (
                    "Reduces intervention cost to 0.80 and distractor selection "
                    "to 0.0% with 0.72 utility."
                ),
                "is_ablation": True,
            },
            {
                "id": "A5_cela",
                "code": "A5",
                "name": "CELA-Full Pipeline",
                "category": "Full Framework",
                "description": (
                    "Complete end-to-end framework: Provenance -> CEE Screening "
                    "-> Cascade Analysis -> Pareto Cost-Utility Optimization."
                ),
                "theoretical_properties": (
                    "Full mathematical integration of all 4 pipeline stages."
                ),
                "empirical_notes": (
                    "Highest utility (0.720), 0.0% distractor selection, minimal "
                    "intervention cost (0.80). Causal F1 difference vs B1 is p=0.1156 "
                    "(honest negative finding: not statistically significant on "
                    "raw F1, but vastly superior in utility and distractor immunity)."
                ),
                "is_ablation": False,
            },
        ]
        return jsonify(
            {
                "methods": methods,
                "equivalences": {"A1_cela": "B2_provenance", "A2_cela": "B3_cee_rank"},
                "total_methods": len(methods),
            }
        )

    @app.route("/api/research/figures")
    def research_figures_catalog() -> Any:
        figures = [
            {
                "id": "fig_attribution",
                "filename_svg": "fig_attribution.svg",
                "filename_png": "fig_attribution.png",
                "title": "Attribution & Precision-Recall Comparison Across 11 Families",
                "category": "Main Results",
                "description": (
                    "Displays Causal Precision, Causal Recall, and F1 across methods "
                    "B1-B5 and A1-A5 across all 11 benchmark families."
                ),
                "key_takeaway": (
                    "CELA A3-A5 eliminate false positives in distractor-heavy "
                    "benchmarks while maintaining strong recall."
                ),
                "metric_highlight": "Precision: A3 (0.99) vs B1 (0.75)",
            },
            {
                "id": "fig_collateral",
                "filename_svg": "fig_collateral.svg",
                "filename_png": "fig_collateral.png",
                "title": "Collateral Evidence Modification vs Preserved State",
                "category": "Granularity",
                "description": (
                    "Compares channel intervention against coarse source-event "
                    "intervention in multi-artifact tool executions."
                ),
                "key_takeaway": (
                    "Channel intervention achieves 100% unrelated evidence preservation "
                    "vs 0% for source-event intervention."
                ),
                "metric_highlight": "Collateral Damage: 0% (Channel) vs 100% (Source-Event)",
            },
            {
                "id": "fig_granularity",
                "filename_svg": "fig_granularity.svg",
                "filename_png": "fig_granularity.png",
                "title": "Granularity Experiment (BF-G Shared Source Dedicated Analysis)",
                "category": "Granularity",
                "description": (
                    "Detailed multi-panel breakdown of the 5 BF-G scenario instances "
                    "evaluating artifact preservation, collateral rate, and selectivity."
                ),
                "key_takeaway": (
                    "Unanimous descriptive superiority (5/5 instances) for channel "
                    "intervention over source-event intervention."
                ),
                "metric_highlight": "5/5 Unanimous Descriptive Preservation",
            },
            {
                "id": "fig_convergence",
                "filename_svg": "fig_convergence.svg",
                "filename_png": "fig_convergence.png",
                "title": "Replay Convergence & Bootstrap Confidence Intervals",
                "category": "Convergence",
                "description": (
                    "Evaluates stability of CEE estimate as replay budget increases "
                    "from N=1 to N=50."
                ),
                "key_takeaway": (
                    "Under deterministic environment semantics, CEE estimates "
                    "stabilize immediately with zero variance."
                ),
                "metric_highlight": "Confidence Interval Width -> 0.0",
            },
            {
                "id": "fig_cost_utility",
                "filename_svg": "fig_cost_utility.svg",
                "filename_png": "fig_cost_utility.png",
                "title": "Cost-Utility Tradeoff & Pareto Frontiers",
                "category": "Optimization",
                "description": (
                    "Sweeps the lambda regularization parameter across [0.0, 1.0] "
                    "to demonstrate Pareto-optimal intervention set selection."
                ),
                "key_takeaway": (
                    "CELA A4/A5 dominate baselines by finding the optimal balance "
                    "between intervention cost and failure prevention."
                ),
                "metric_highlight": "Optimal Utility: 0.720 (lambda=0.1)",
            },
            {
                "id": "fig_negative_controls",
                "filename_svg": "fig_negative_controls.svg",
                "filename_png": "fig_negative_controls.png",
                "title": "Negative Controls & Falsification Validation",
                "category": "Scientific Honesty",
                "description": (
                    "Tests synthetic interventions on known benign artifacts and "
                    "irrelevant tools across BF-A and BF-G."
                ),
                "key_takeaway": (
                    "Every negative control yields CEE=0.0 with 100% falsification "
                    "success (0 false causal attributions)."
                ),
                "metric_highlight": "Observed CEE: 0.000 (Expected: 0.000)",
            },
            {
                "id": "fig_pathway_stress",
                "filename_svg": "fig_pathway_stress.svg",
                "filename_png": "fig_pathway_stress.png",
                "title": "Pathway Stress & Graph Complexity Scaling",
                "category": "Scalability",
                "description": (
                    "Evaluates candidate screening and replay overhead as graph "
                    "pathway count scales from 1 to 10."
                ),
                "key_takeaway": (
                    "Provenance filtering keeps candidate set compact even under "
                    "dense multi-path execution topologies."
                ),
                "metric_highlight": "Scales Sub-linearly with Replay Budget",
            },
            {
                "id": "fig_real_llm",
                "filename_svg": "fig_real_llm.svg",
                "filename_png": "fig_real_llm.png",
                "title": "Real-LLM Validation (Gemini 2.5 Flash Grounding)",
                "category": "Real-LLM Validation",
                "description": (
                    "Live prompt-level counterfactual intervention on real Gemini "
                    "API responses demonstrating non-zero CEE."
                ),
                "key_takeaway": (
                    "Confirms that channel intervention operates on real probabilistic "
                    "LLM completions, not just mock simulators."
                ),
                "metric_highlight": "Live CEE > 0 Observed",
            },
            {
                "id": "fig_scalability",
                "filename_svg": "fig_scalability.svg",
                "filename_png": "fig_scalability.png",
                "title": "Execution Latency & Computational Overhead",
                "category": "Performance",
                "description": "Wall-clock runtime per scenario across all benchmark families.",
                "key_takeaway": (
                    "Mean scenario evaluation completes in under 4ms per instance, "
                    "enabling fast interactive analysis."
                ),
                "metric_highlight": "Mean Runtime: 2.8ms per scenario",
            },
        ]
        return jsonify({"figures": figures, "total_figures": len(figures)})

    @app.route("/api/research/figures/<name>")
    def research_figures(name: str) -> Any:
        figs_dir = Path(__file__).parent.parent.parent / "research" / "figures"
        return send_from_directory(str(figs_dir), name)

    return app


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_run(run_id: str, store: FileTraceStore) -> ExecutionRun | None:
    """Get a run from cache or store."""
    if run_id in _run_cache:
        return _run_cache[run_id]
    return store.load(run_id)


def _run_summary(run: ExecutionRun) -> dict[str, Any]:
    """Minimal run summary for list view."""
    return {
        "run_id": run.run_id,
        "status": run.status.value,
        "started_at": run.started_at.isoformat(),
        "ended_at": run.ended_at.isoformat() if run.ended_at else None,
        "task_input": run.task_input[:200],
        "event_count": run.event_count,
        "artifact_count": run.artifact_count,
    }


def _run_detail(run: ExecutionRun) -> dict[str, Any]:
    """Full run details."""
    return {
        **_run_summary(run),
        "events": [_event_detail(e) for e in run.events],
        "artifacts": [_artifact_brief(a) for a in run.artifacts],
    }


def _event_detail(evt: Any) -> dict[str, Any]:
    """Event detail for inspection."""
    return {
        "event_id": evt.event_id,
        "event_type": evt.event_type.value,
        "sequence_number": evt.sequence_number,
        "timestamp": evt.timestamp.isoformat(),
        "component": evt.component,
        "payload": evt.payload,
        "input_artifact_ids": evt.input_artifact_ids,
        "output_artifact_ids": evt.output_artifact_ids,
        "parent_event_id": evt.parent_event_id,
        "metadata": evt.metadata,
    }


def _artifact_brief(art: Any) -> dict[str, Any]:
    """Artifact summary."""
    return {
        "artifact_id": art.artifact_id,
        "artifact_type": art.artifact_type.value,
        "has_value": art.value is not None,
        "has_reference": art.reference is not None,
        "producer_event_id": art.producer_event_id,
    }


def _artifact_detail(art: Any, pq: ProvenanceQuery) -> dict[str, Any]:
    """Artifact detail with provenance."""
    value_display = None
    if art.value is not None:
        if isinstance(art.value, str):
            value_display = art.value[:500]
        else:
            value_display = json.dumps(art.value, default=str)[:500]

    return {
        "artifact_id": art.artifact_id,
        "artifact_type": art.artifact_type.value,
        "value": value_display,
        "reference": art.reference,
        "producer_event_id": art.producer_event_id,
        "producer": pq.get_producer(art.artifact_id),
        "consumers": pq.get_consumers(art.artifact_id),
        "upstream": pq.trace_upstream(art.artifact_id),
        "downstream": pq.trace_downstream(art.artifact_id),
        "metadata": art.metadata,
        "created_at": art.created_at.isoformat(),
    }


def _graph_to_vis(graph: Any) -> dict[str, Any]:
    """Convert ExecutionGraph to vis.js compatible format."""
    from captain.graph.model import NodeType

    nodes = []
    edges = []

    graph_dict = graph.to_dict()

    for node_data in graph_dict["nodes"]:
        is_event = node_data["node_type"] == NodeType.EVENT.value
        nodes.append(
            {
                "id": node_data["node_id"],
                "label": (
                    f"{node_data['label'].upper()}\n#{node_data.get('sequence_number', '?')}"
                    if is_event
                    else f"{node_data['label'].upper()}\n{node_data['node_id'][-8:]}"
                ),
                "group": "event" if is_event else "artifact",
                "title": node_data["node_id"],
                "shape": "box" if is_event else "ellipse",
                "node_type": node_data["node_type"],
                "node_id": node_data["node_id"],
            }
        )

    for i, edge_data in enumerate(graph_dict["edges"]):
        edges.append(
            {
                "id": f"edge_{i}",
                "from": edge_data["source_id"],
                "to": edge_data["target_id"],
                "label": edge_data["edge_type"],
                "arrows": "to",
                "edge_type": edge_data["edge_type"],
            }
        )

    return {"nodes": nodes, "edges": edges}
