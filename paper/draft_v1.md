# CAPTAIN/CELA: Provenance-Defined Evidence-Flow Interventions for Selective Causal Analysis of Autonomous-Agent Failures

## Abstract

Autonomous AI agents process information through interconnected tool calls, intermediate artifacts, memory operations, reasoning steps, and generated outputs. When an agent fails, identifying the execution event associated with the failure does not necessarily identify which information pathway was responsible. In particular, a single execution event may produce multiple evidence artifacts that subsequently contribute to different downstream behaviors. Intervening on the entire event can therefore modify both failure-relevant and unrelated evidence.

We present CAPTAIN, the Counterfactual Analysis Platform for Trace-based Investigation of Autonomous Agent Cascades, and CELA, its provenance-aware causal analysis framework. CELA represents evidence lineage explicitly and supports interventions at the evidence-flow channel level. By comparing factual executions with counterfactual executions under controlled interventions, the framework estimates changes in downstream failure probability using the Counterfactual Evidence Effect (CEE), an operationalization of intervention-based causal effect estimation for agent evidence flows.

We evaluate the framework using controlled synthetic scenarios spanning multiple failure mechanisms, including redundant and complementary evidence, distractors, cascades, and shared-source pathways. The primary experiment compares artifact-level channel intervention with source-event-level intervention when a single execution event produces multiple evidence artifacts. The evaluation examines intervention selectivity, preservation of unrelated evidence, collateral modification, causal attribution, and failure prevention. Additional experiments investigate pathway-count sensitivity, joint interventions, and cost-aware intervention selection.

The results must be interpreted within the scope of the evaluated benchmarks and reference agent. The initial evaluation does not establish universal superiority over existing failure-attribution systems, and the reported comparison between the full CELA pipeline and a random baseline did not achieve statistical significance. Real-LLM validation is limited to a controlled sanity check rather than end-to-end evaluation of the complete platform. We discuss these limitations and identify the evidence required for broader validation.

## 1. Introduction

Autonomous AI agents increasingly combine language-model reasoning with tools, memory, external information, and multi-step execution. Their failures can propagate: an incorrect observation may be stored in memory, influence subsequent reasoning, trigger an inappropriate tool call, and ultimately produce an incorrect response or action.

Failure attribution is therefore not merely a question of identifying where an execution went wrong. It is also a question of identifying which information pathways contributed to the failure and whether an intervention can interrupt those pathways without unnecessarily disturbing useful information.

Existing work on agent failure attribution, counterfactual replay, and intervention-driven debugging provides important foundations for investigating these questions. However, attribution resolution and intervention resolution are not necessarily identical. A method may identify a suspicious execution event without distinguishing the individual evidence artifacts produced by that event.

Consider an execution event that produces two evidence artifacts. One artifact contributes to a failure, while the other carries useful information. An intervention on the entire event may affect both artifacts. An intervention on the provenance-defined channel associated with the first artifact may permit a more selective modification.

This motivates the central research question:

**Can evidence-flow channel interventions provide more selective causal localization than source-event interventions when multiple evidence pathways originate from the same execution event?**

We investigate this question using CAPTAIN/CELA, a trace-based platform and evidence-lineage analysis framework. Our emphasis is on controlled intervention and measurable selectivity rather than claiming universal superiority in agent debugging.

### Contributions

The paper investigates four contributions:

1. **Provenance-defined evidence-flow representation:** an explicit representation of evidence artifacts and their lineage through agent execution.
2. **Channel-level counterfactual intervention:** an operational mechanism for targeting a particular evidence artifact or flow rather than modifying its entire producing event.
3. **Controlled selectivity evaluation:** a shared-source benchmark that measures affected evidence, preserved evidence, and collateral modification under channel-level and source-event-level interventions.
4. **Reproducible experimental framework:** benchmark mechanisms, baselines, statistical analyses, raw results, and evidence-linked research claims.

These contributions concern the representation, implementation, and controlled evaluation of intervention granularity. They do not establish that CEE is a fundamentally new causal estimand or that CELA outperforms every existing system.

## 2. Related Work

The related-work section will examine five areas:

1. Agent failure attribution and error localization.
2. Counterfactual replay and intervention-based debugging.
3. Causal analysis of multi-agent systems and cascading failures.
4. Data provenance, information lineage, and program analysis.
5. Agent benchmarks, controlled fault injection, and multimodal evaluation.

Relevant systems include Who&When, Who&When Pro, Causal Agent Replay (CAR), CausalFlow, CHIEF, DoVer, AgenTracer, AgentRx, RAFFLES, SAFARI, AgenticRAG-FP, and other verified related work.

The comparison will distinguish intervention units, evidence representations, replay methods, ground-truth availability, and experimental objectives. Where external systems cannot be reproduced under equivalent conditions, comparisons will be explicitly identified as conceptual or literature-based rather than direct experimental comparisons.

## 3. Problem Definition

Let an agent execution be represented by a temporally ordered trace containing events, artifacts, and provenance relationships.

An execution may contain multiple evidence-flow pathways. A failure may depend on one pathway, several complementary pathways, or interactions between pathways.

We distinguish:

- **Execution event:** an operation performed during agent execution.
- **Evidence artifact:** information produced, consumed, stored, or transformed.
- **Evidence-flow channel:** a provenance-defined relationship through which evidence contributes to downstream execution.
- **Intervention:** a controlled modification of a specified artifact, channel, or source event.
- **Failure outcome:** an evaluator-defined binary outcome indicating whether the specified failure occurred.

The central problem is to determine whether an intervention on a particular evidence-flow channel changes the failure outcome while preserving unrelated evidence and useful downstream behavior.

## 4. Methodology

### 4.1 CAPTAIN architecture

CAPTAIN provides the execution tracing, provenance extraction, graph construction, intervention, counterfactual replay, and experiment infrastructure.

The pipeline proceeds from an agent execution trace to artifacts and provenance relationships, constructs an evidence-flow representation, identifies candidate intervention targets, executes controlled counterfactual interventions, and evaluates resulting outcomes.

### 4.2 CELA evidence-flow analysis

CELA uses the evidence-flow representation to define candidate channels for intervention. The framework distinguishes structural relationships from effects estimated through controlled interventions.

A provenance edge alone does not establish causality. Causal interpretation depends on the intervention design, replay assumptions, evaluator, and experimental evidence.

### 4.3 Counterfactual Evidence Effect

Let $Y$ be a binary failure indicator, where $Y=1$ denotes failure.

For evidence channel $e$, define the operationalized effect:

$$
\operatorname{CEE}(e)
=
P(Y=1)
-
P(Y=1\mid \operatorname{do}(C_e=\varnothing)).
$$

Here, $C_e=\varnothing$ represents the specified channel-blocking intervention. A positive CEE indicates that failure probability decreases under that intervention, subject to the validity of the experimental design and estimation procedure.

For deterministic reference-agent experiments, this quantity may reduce to an observed outcome difference rather than a reliable estimate of a population probability. Such results must not be interpreted as establishing stochastic robustness.

### 4.4 Selectivity experiment

The primary experiment compares two intervention granularities:

- **Channel-level intervention:** modifies a targeted evidence artifact.
- **Source-event-level intervention:** modifies the producing tool-result event and may consequently affect multiple artifacts.

The shared-source scenario is designed to measure whether targeting one artifact preserves an unrelated artifact produced by the same event.

## 5. Experimental Design

### 5.1 Controlled benchmark

The initial benchmark contains 275 controlled scenario instances across 11 mechanism families, with five seeds and five instances per family and seed.

These instances are designed to isolate specific causal mechanisms, not to compete directly with large-scale collections of naturally occurring failed trajectories. Their purpose is to enable controlled intervention comparisons with known synthetic mechanism structure.

### 5.2 Baselines

The evaluation includes random selection, provenance-only selection, individual CEE ranking, structural or cost-oriented baselines, and CELA variants. Oracle-based selection is interpreted as an upper-bound reference using post-hoc ground truth, not as a deployable method.

### 5.3 Metrics

The paper will report metrics appropriate to each experiment, including:

- Causal attribution precision, recall, and F1.
- Recall@1 and Recall@K.
- Failure prevention and prevention-set recovery.
- CEE for individual and joint interventions.
- Preserved evidence and collateral modification.
- Intervention cost, replay count, and computational cost.
- Cost-adjusted utility where applicable.

Metrics will not be combined into an unsupported overall superiority claim.

### 5.4 Statistical analysis

The paper will document the unit of analysis, sample sizes, confidence intervals, paired comparisons, multiple-comparison correction, effect sizes, and sensitivity analyses. The analysis will reflect the actual statistical implementation and its limitations.

## 6. Results

This section will contain only results verified against the frozen V2 raw data.

The primary result will report the shared-source intervention comparison, including affected evidence, preserved evidence, collateral modification, and outcome changes.

The additional V2 experiments will report pathway-stress, cascade, and cost/utility findings only after their exact configurations, sample sizes, metrics, and statistical analyses have been verified.

The initial result that the full CELA pipeline did not significantly outperform the random baseline on causal F1 will be retained and discussed. It will not be hidden or reframed as a positive result.

## 7. Discussion

The principal question is whether finer intervention granularity provides a measurable advantage when an execution event carries multiple evidence pathways.

If the shared-source results support greater selectivity, this establishes a controlled result for that experimental setting. It does not by itself establish better real-world failure attribution, improved outcomes across all agent architectures, or superiority over systems that were not tested under equivalent conditions.

The paper will also discuss the relationship between intervention selectivity and useful behavior preservation, as well as the additional requirements for stochastic and real-agent validation.

## 8. Limitations and Threats to Validity

The current evidence has important limitations:

1. Most benchmark experiments use a deterministic scripted reference agent.
2. The real-LLM experiment is a limited sanity check, not end-to-end CAPTAIN evaluation.
3. The benchmark is smaller than large-scale real-agent trajectory collections.
4. Some mechanism families simplify the behavior of real agent systems.
5. Statistical conclusions are constrained by the experimental sample sizes and available variation.
6. Several external systems are compared conceptually rather than through direct reproduction.
7. Results depend on intervention validity, replay consistency, correct provenance, and evaluator reliability.

These limitations constrain the scope of the conclusions and motivate future experiments.

## 9. Conclusion

CAPTAIN/CELA investigates whether provenance-defined evidence-flow channels can serve as more selective intervention targets than source events in autonomous-agent failure analysis. Its central evaluation examines a shared-source setting in which a single execution event produces multiple evidence artifacts.

The contribution is the operationalization and controlled evaluation of evidence-channel intervention, supported by explicit provenance, counterfactual execution, and evidence-linked experimental reporting. The scope of the conclusions must remain bounded by the tested mechanisms, baselines, and agent implementations.

Future work should extend validation to stochastic agents, broader real-agent trajectories, multimodal evidence pathways, and direct comparisons with compatible external methods.
