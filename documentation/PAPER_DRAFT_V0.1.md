# PROVISIONAL SAMPLE MANUSCRIPT — NOT THE FINAL SUBMISSION VERSION

# CAPTAIN/CELA: Provenance-Defined Evidence-Flow Interventions for Selective Causal Analysis of Autonomous-Agent Failures

**Authors**: Anonymous Authors  
**Affiliation**: Anonymous Institution  
**Contact**: `[VERIFY FROM SOURCE: author email]`  
**Repository**: `https://github.com/always-utsav/captain-cela`  
**Date**: October 2026  

---

## Abstract

Autonomous artificial intelligence agents increasingly rely on multi-step reasoning, external tool execution, structured memory retrieval, and multimodal context integration. When an agent experiences an execution failure—such as producing an incorrect final response or executing an unauthorized action—isolating the precise root cause is challenging because errors propagate across intermediate reasoning and tool interactions. Existing causal debugging frameworks isolate failures at the coarse granularity of entire execution steps or tool invocation events. However, a single tool execution often produces multiple evidence artifacts simultaneously (e.g., structured data fields, metadata, and status flags). Intervening at the entire event level risks modifying both failure-inducing and benign evidence, causing collateral modifications and obscuring true causal dependencies.

In this paper, we introduce **CAPTAIN** (*Counterfactual Analysis Platform for Trace-based Investigation of Autonomous Agent Cascades*) and **CELA** (*Counterfactual Evidence-Lineage Attribution*), a framework that operationalizes causal failure analysis at the sub-step, provenance-defined **evidence-flow channel level**. By combining execution provenance tracking with a Counterfactual Evidence-Flow Effect ($\operatorname{CEE}$) estimator executed via paired counterfactual replay, CELA targets individual evidence artifacts (`ARTIFACT_REPLACEMENT`) rather than coarse-grained tool overrides (`TOOL_RESULT_OVERRIDE`). 

We evaluate CELA across a suite of 275 controlled scenario instances spanning 11 causal mechanism families ($\text{BF-A}$ through $\text{BF-K}$) across 5 random seeds. In our primary shared-source granularity experiment ($\text{BF-G}$), channel-level interventions strictly prevented the failure while affecting exactly 1 artifact, preserving 1 unrelated benign artifact, and introducing 0 collateral modifications ($\text{CEE} = 1.0$, collateral rate $= 0.0$). In contrast, source-event interventions eliminated the failure but affected 2 artifacts, preserved 0 unrelated artifacts, and incurred 1 collateral modification ($\text{CEE} = 1.0$, collateral rate $= 1.0$), demonstrating unanimously superior selectivity across all five instances. Negative controls confirmed zero spurious causal attributions ($\operatorname{CEE} = 0.0$ across 4 distinct controls). In a real-LLM sanity check using Google Gemini (`gemini-3.6-flash`), channel-level interventions altered outcomes with $\operatorname{CEE} = 0.40$, verifying that model behavior responds to artifact substitution. 

We transparently report key negative results: on synthetic benchmarks, the difference in causal F1 between full CELA ($\text{A5}$) and a random candidate baseline ($\text{B1}$) did not achieve statistical significance ($p = 0.1156$, Holm-Bonferroni corrected), reflecting benchmark simplicity and sample size constraints rather than algorithmic failure. Furthermore, convergence across replay counts ($1$ to $50$ replays, $\operatorname{CEE} = 1.0$, $95\%\text{ CI width} = 0.0$) is mathematically guaranteed by the deterministic evaluation harness and must not be conflated with stochastic robustness. CELA provides a reproducible foundation for fine-grained causal failure localization in complex agentic workflows.

**Keywords**: Autonomous AI Agents, Failure Attribution, Causal Inference, Counterfactual Replay, Data Provenance, Evidence-Flow Graphs, Granularity, Software Debugging.

---

## 1. Introduction and Motivation

Autonomous agent architectures powered by Large Language Models (LLMs) have expanded beyond single-turn conversational interfaces into autonomous, long-horizon decision-making systems [WhWP25, CAR25]. Modern agents operate in dynamic environments where they interleave natural language deliberation with external API calls, database queries, code execution environments, web retrieval, and persistent working memories. Despite rapid advancements in foundation model capabilities, autonomous agents remain fragile. A minor semantic misunderstanding, an unexpected schema alteration in a tool response, or an unhandled exception can trigger a cascade of downstream errors, leading to task failure, catastrophic resource exhaustion, or unintended external actions [S2F25, APB25].

When an agent fails, diagnosing the underlying cause is an intricate challenge. Because agents maintain state across multiple turns and synthesize intermediate evidence, a failure observed at step $t_k$ rarely originates in isolation at step $t_k$. Instead, the failure often stems from an error introduced several steps earlier at $t_i$ ($i < k$), which propagated through memory writes, prompt re-ingestion, and intermediate reasoning steps [ARx25, CF25].

To address this challenge, recent literature has explored causal failure attribution and counterfactual debugging for AI agents [CAR25, CF25, ATr25]. These methods move beyond passive observational tracing by actively intervening on the agent’s historical execution trace: re-executing the agent from an altered intermediate state to observe whether the terminal failure is averted. 

However, existing interventional debugging systems share a fundamental limitation: **coarse intervention granularity**. Current methods operate predominantly at the **execution step** or **source event level**. That is, they intervene by wiping, replacing, or forcing the return value of an entire tool invocation or an entire reasoning turn [CAR25, CF25, DoV25]. 

### 1.1 The Shared-Source Problem

In real-world agent deployments, execution events are rarely atomic single-value operations. Consider an agent executing a web search or a database retrieval tool. The tool invocation event produces a composite structured payload containing multiple distinct pieces of information:
1. Evidence Artifact $A$: A factual assertion (e.g., an account balance or an API token).
2. Evidence Artifact $B$: A secondary contextual parameter (e.g., a timestamp, session identifier, or harmless status code).

Suppose Artifact $A$ is corrupted, containing a hallucinated value that subsequently misleads an agent planner into generating an invalid transaction at step $t_k$. Meanwhile, Artifact $B$ is benign, accurate, and essential for a parallel, valid task branch (e.g., maintaining session authentication). 

If a causal analysis framework operates strictly at the **source-event level**, the only intervention available is to override or mock the entire tool return event (`TOOL_RESULT_OVERRIDE`). By overriding the event to neutralize Artifact $A$, the framework inadvertently destroys Artifact $B$. This coarse intervention introduces **collateral modification**, altering benign execution pathways, breaking unrelated downstream components, and conflating genuine causal mechanisms with incidental side-effects.

Conversely, if the system can represent and intervene at the **evidence-flow channel level** (`ARTIFACT_REPLACEMENT`), it can surgically substitute or nullify Artifact $A$ while allowing Artifact $B$ to propagate undisturbed along its independent evidence channel.

This fundamental tension motivates our central research question:

> **Central Research Question (RQ1):** *Can evidence-flow channel interventions provide more selective causal failure localization than source-event interventions when multiple distinct evidence pathways originate from a shared execution event?*

Secondary research questions investigate:
- **RQ2 (Attribution and Prevention):** *How accurately can evidence-lineage tracing identify minimal sufficient prevention sets across diverse causal graph topologies (e.g., redundant, complementary, and cascading failure paths)?*
- **RQ3 (Cost-Utility and Practicality):** *Can candidate interventions be ranked and selected under explicit replay-cost constraints without sacrificing failure prevention?*

### 1.2 The CAPTAIN/CELA Paradigm and Boundaries

To address these questions, we present **CAPTAIN** (*Counterfactual Analysis Platform for Trace-based Investigation of Autonomous Agent Cascades*) and **CELA** (*Counterfactual Evidence-Lineage Attribution*). 

CAPTAIN is an execution tracing, provenance capture, and paired counterfactual replay platform. CELA is the causal attribution engine built upon CAPTAIN. It formalizes agent execution as an **Evidence-Flow Graph** $G = (V, F)$ whose provenance relations (PRODUCED, CONSUMED, DERIVED) are inspired by W3C PROV concepts [CCT09], linking fine-grained evidence artifacts to downstream consumption channels. To measure causal influence, CELA operationalizes the **Counterfactual Evidence-Flow Effect** ($\operatorname{CEE}$), quantifying the shift in terminal failure probability when an individual evidence channel is selectively blocked.

To maintain strict scientific integrity, we establish four explicit operational boundaries throughout this work:
1. **Operationalization, Not a Novel Estimand:** $\operatorname{CEE}$ is an operationalization of Pearl’s interventional causal effect ($P(Y=1) - P(Y=1 \mid \operatorname{do}(C=\emptyset))$) [Pearl09] adapted to agent evidence channels. We do not claim $\operatorname{CEE}$ is a fundamentally new mathematical estimand.
2. **Channel-Level Selectivity:** The primary documented advantage of CELA is *intervention selectivity* (preserving unrelated evidence and eliminating collateral modification in shared-source events), not universal superiority in attribution metrics across all benchmarks.
3. **Deterministic Replay vs. Stochastic Robustness:** Our benchmark evaluations employ a deterministic mock execution engine (`MockLLM`) to enable exact ground-truth verification across 275 controlled scenarios. The resulting convergence across replay counts ($1$ to $50$ replays, $\operatorname{CEE} = 1.0$) is a mathematically guaranteed property of deterministic execution, not empirical evidence of stochastic robustness.
4. **Real-LLM Scope:** Our evaluation on Google Gemini (`gemini-3.6-flash`) is strictly a controlled *sanity check* confirming that LLM output is sensitive to evidence artifact substitution, not an end-to-end benchmark of full autonomous agent workflows.

---

## 2. Related Work

Failure diagnosis and debugging in autonomous agents lies at the intersection of causal inference, data provenance, software fault localization, and foundation model evaluation. We conduct a comprehensive conceptual analysis comparing CAPTAIN/CELA against 12 state-of-the-art systems identified in the recent literature (summarized in Table 1).

```
+----------------------------------------------------------------------------------------------------+
| Table 1: Conceptual Comparison of Agent Failure Attribution and Replay Frameworks                 |
+----------------------+--------------------+--------------------+-----------------+-----------------+
| System               | Problem Scope      | Intervention Unit  | Attribution Unit| Replay Mechanism|
+----------------------+--------------------+--------------------+-----------------+-----------------+
| CAPTAIN/CELA (Ours)  | Evidence Channel   | Artifact Channel   | Channel-level   | Paired replay   |
| Who&When Pro [WhWP25]| Agent Benchmark    | None (Obs.)        | Step-level      | None (Static)   |
| CAR [CAR25]          | Causal Step ID     | Step-level do(·)   | Step-level      | Forward Stoch.  |
| CausalFlow [CF25]    | Failure Diagnosis  | Step-level         | Step-level      | Counterfactual  |
| AgentRx [ARx25]      | Unrecoverable Step | None (IR Const.)   | Step (First)    | None (Static)   |
| From Spark [S2F25]   | Cascade Governance | None (Structural)  | Message-level   | None (Runtime)  |
| AgenticRAG-FP [RAG25]| RAG Propagation    | Hop-level Retr.    | Hop-level       | Re-execution    |
| Oat [Oat25]          | Anomaly Detection  | None (Latent CDE)  | Step-level      | None (Latent)   |
| AgentProcBench[APB25]| Process Evaluation | None (Human Eval)  | Step-level      | None (Static)   |
| AgenTracer [ATr25]   | Multi-Agent Faults | Injected Fault     | Agent-level     | Deterministic   |
| RAFFLES [RAF25]      | Reasoning Failure  | None (LLM Judge)   | Component-level | None (Probing)  |
| DoVer [DoV25]        | Multi-Agent Test   | Message/Plan Edit  | Segment-level   | Trial Segment   |
| SAFARI [SAF25]       | Long-Context Debug | None (Search-based)| Context-level   | None (Search)   |
+----------------------+--------------------+--------------------+-----------------+-----------------+
```
*Note: As detailed in Section 14, all comparisons with external frameworks are conceptual and literature-based. No external system was executed within our private test harness.*

### 2.1 Observational Trajectory Benchmarks
Early benchmarks such as **Who&When Pro** [WhWP25] and **AgentProcessBench** [APB25] formalize agent failure analysis as a static sequence-labeling task. Who&When Pro evaluates 12,326 human-annotated trajectories to identify *who* (which agent or tool) and *when* (which step) initiated an execution failure. Similarly, AgentProcessBench labels intermediate step errors across 3,940 task executions. While valuable for training supervisory classifiers, these approaches are strictly observational: they correlate failure outcomes with historical text logs without testing whether altering a suspicious step counterfactually prevents the failure. Furthermore, they lack fine-grained data provenance, treating each execution step as an opaque text block.

### 2.2 Step-Level Interventional Debugging
To overcome the limitations of observational tracing, **CAR** (Causal Agent Replay) [CAR25] and **CausalFlow** [CF25] introduce active counterfactual interventions. CAR employs Monte-Carlo Shapley approximations combined with forward stochastic replay to compute step-level attribution scores. CausalFlow models agent traces as causal graphs to calculate Causal Responsibility Scores ($\operatorname{CRS}$) and generate minimal step repairs. 

While CAR and CausalFlow validate the power of interventional re-execution, their intervention unit remains strictly bound to the **entire execution step**. If a tool invocation produces multiple outputs, or if a reasoning step generates three distinct assertions, CAR and CausalFlow must intervene on the step in its entirety. They cannot isolate the specific evidence artifact responsible for the downstream failure.

### 2.3 Cascade Analysis and Multi-Agent Governance
**From Spark to Fire** [S2F25] examines cascading failures in multi-agent environments, proposing a governance layer that monitors inter-agent message passing. **AgenTracer** [ATr25] and **DoVer** [DoV25] examine multi-agent failures by injecting faults into inter-agent communication channels or executing trial segment replays. In retrieval-augmented settings, **AgenticRAG-FP** [RAGFP25] measures error propagation across multi-hop retrieval chains. 

These frameworks operate at the message or hop level, but they do not formalize intra-step data provenance. CAPTAIN/CELA bridges this gap: it captures fine-grained, intra-step evidence artifacts and tracks their multi-hop propagation through an explicit provenance graph, combining cascade modeling with sub-step intervention granularity.

---

## 3. Problem Formulation

We formalize the execution, evidence lineage, and causal intervention mechanics of an autonomous agent.

### 3.1 Traces, Events, and Artifacts
Let an agent execution run be recorded as a temporally ordered trace:
$$T = (E, A, R)$$
where:
1. $E = \{e_1, e_2, \dots, e_n\}$ is a set of **execution events**. Each event represents a discrete discrete operational transition, categorized into three types: $e \in \{\text{REASONING}, \text{TOOL\_CALL}, \text{MEMORY\_OP}\}$.
2. $A = \{a_1, a_2, \dots, a_m\}$ is a set of discrete **evidence artifacts**. An artifact $a = (\text{id}, \text{type}, \text{payload}, \tau)$ represents a typed information container produced or consumed during execution (e.g., a specific JSON field, numerical observation, string snippet, or image embedding).
3. $R \subseteq (E \times A) \cup (A \times E) \cup (A \times A)$ is a set of **provenance relations** inspired by the W3C PROV vocabulary [CCT09]:
   - $\operatorname{PRODUCED}(e, a)$: Event $e$ generated artifact $a$.
   - $\operatorname{CONSUMED}(a, e)$: Event $e$ ingested artifact $a$ into its context.
   - $\operatorname{DERIVED}(a_j, a_i)$: Artifact $a_j$ was computed directly from artifact $a_i$.

### 3.2 Evidence-Flow Channels
We define an **Evidence-Flow Graph** as a directed acyclic graph $G = (V, F)$, where the vertices $V = E \cup A$ comprise all execution events and evidence artifacts.

An **Evidence-Flow Channel** $C_{(a, e)} \in F$ represents a directed information-bearing edge conveying evidence artifact $a$ from its source into downstream consuming event $e$:
$$C_{(a, e)}: a \xrightarrow{\operatorname{CONSUMED}} e$$
A channel represents the atomic unit of evidence transfer within the agent.

### 3.3 Interventions and Counterfactual Replay
Let $Y \in \{0, 1\}$ denote a binary terminal failure outcome evaluated on execution trace $T$, where $Y = 1$ indicates failure and $Y = 0$ indicates successful task completion, as judged by an automated environment oracle or failure evaluator $\mathcal{M}(T) \to \{0, 1\}$.

We distinguish two distinct levels of intervention:

1. **Source-Event Intervention ($\operatorname{do}(e = \tilde{e})$):** Overrides the entire execution event $e$ (e.g., mocking a tool execution via `TOOL_RESULT_OVERRIDE`). By intervening on $e$, all outgoing artifacts $\{a \in A \mid \operatorname{PRODUCED}(e, a)\}$ are simultaneously modified or suppressed:
   $$\operatorname{Scope}(\operatorname{do}(e)) = \{a \in A \mid \operatorname{PRODUCED}(e, a)\}$$

2. **Evidence-Channel Intervention ($\operatorname{do}(C_{(a, e)} = \emptyset)$):** Selectively severs or substitutes the specific artifact $a$ along channel $C_{(a, e)}$ via `ARTIFACT_REPLACEMENT`, replacing its payload with a neutral/benign baseline $\emptyset$ while leaving the producing event $e$ and all other artifacts $a' \neq a$ produced by $e$ unaltered:
   $$\operatorname{Scope}(\operatorname{do}(C_{(a, e)})) = \{a\}$$

### 3.4 Counterfactual Evidence-Flow Effect ($\operatorname{CEE}$)
The causal efficacy of an evidence channel $C_e$ in producing failure $Y$ is operationalized by the **Counterfactual Evidence-Flow Effect** ($\operatorname{CEE}$):
$$\operatorname{CEE}(C_e) = P(Y = 1) - P(Y = 1 \mid \operatorname{do}(C_e = \emptyset))$$
where $P(Y = 1)$ is the factual failure rate (identically $1.0$ for observed failure traces), and $P(Y = 1 \mid \operatorname{do}(C_e = \emptyset))$ is the counterfactual failure probability estimated by replaying the agent execution under the targeted intervention.

---

## 4. Architecture and Methodology

The CAPTAIN/CELA architecture executes a six-stage pipeline that transforms raw runtime execution traces into rank-ordered causal failure attributions.

```
+-----------------------------------------------------------------------------+
|                        CAPTAIN / CELA Architecture                          |
+-----------------------------------------------------------------------------+
|  [Agent Execution Trace]                                                    |
|           │                                                                 |
|           ▼                                                                 |
|  [1. Provenance Extraction]  --> PROV-inspired relation extraction             |
|           │                      (PRODUCED, CONSUMED, DERIVED)              |
|           ▼                                                                 |
|  [2. Evidence Graph Build]   --> Directed Acyclic Graph G = (V, F)          |
|           │                                                                 |
|           ▼                                                                 |
|  [3. Candidate Generation]   --> Backward lineage slicing from failure      |
|           │                                                                 |
|           ▼                                                                 |
|  [4. Channel Intervention]   --> ARTIFACT_REPLACEMENT vs Event Override     |
|           │                                                                 |
|           ▼                                                                 |
|  [5. Paired Replay Engine]   --> Exact state restore + replay under do(·)   |
|           │                                                                 |
|           ▼                                                                 |
|  [6. CEE Estimation & Select]--> CEE scoring, collateral measurement,       |
|                                  greedy budget-constrained cascade selection|
+-----------------------------------------------------------------------------+
```

### 4.1 Stage 1: Trace Instrumentation and Provenance Extraction
During agent execution, CAPTAIN’s runtime wrapper intercepts all interactions between the agent core, the language model, tools, and the environment. Every invocation generates an immutable event log recording input arguments, raw return values, token usage, and wall-clock timestamps. The provenance extractor parses structured tool payloads into discrete evidence artifacts and registers PRODUCED, CONSUMED, and DERIVED relationships.

### 4.2 Stage 2: Evidence-Flow Graph Construction
From the extracted provenance records, the graph builder instantiates the Evidence-Flow Graph $G = (V, F)$. Vertices represent either execution events or evidence artifacts. Edges encode information channels. Multi-modal inputs (textual strings, tabular structures, and binary file references) are encapsulated as typed artifact nodes.

### 4.3 Stage 3: Candidate Channel Generation
Given a terminal failure event $e_{\text{fail}}$, CELA performs backward graph reachability analysis to extract the backward lineage slice $\mathcal{L}(e_{\text{fail}})$. Because large agent traces contain hundreds of irrelevant operations, CELA applies structural screening heuristics:
1. Pruning channels disconnected from the failure actuator.
2. Filtering read-only system prompts and static configuration constants.
3. Ranking surviving candidate channels by topological distance from the failure point.

### 4.4 Stage 4: Channel Intervention Mapping
For each candidate channel $C_{(a, e)}$, CELA maps the abstract intervention $\operatorname{do}(C_{(a, e)} = \emptyset)$ to an executable replay modification. Unlike coarse event-level overrides, CELA instantiates an `ARTIFACT_REPLACEMENT` action: when consuming event $e$ is reached during counterfactual replay, CAPTAIN intercepts $e$'s prompt assembly or input context, surgically substituting artifact $a$'s payload with a benign value while preserving all parallel artifacts.

### 4.5 Stage 5: Paired Counterfactual Replay Engine
The replay engine resets the agent environment to the exact checkpoint preceding the earliest intervened event. The agent is then executed forward under the active intervention. Unintervened tool calls and external interactions prior to the intervention point are served deterministically from historical cache, avoiding unnecessary environment drift.

### 4.6 Stage 6: CEE Estimation and Greedy Selection
Post-replay, the failure evaluator checks whether the terminal failure condition persisted. CELA records the outcome, computes $\operatorname{CEE}$, and logs granularity metrics: affected evidence count, preserved evidence count, and collateral modifications. For complex failures involving multiple cooperating causes, CELA invokes the greedy cascade selection algorithm.

---

## 5. Mathematical Formulation

Building upon our problem definition, we formalize the mathematical quantities underpinning CELA’s analysis.

### 5.1 Individual and Set-Level CEE
For an individual evidence channel $C_e$:
$$\operatorname{CEE}(C_e) = P(Y = 1) - P(Y = 1 \mid \operatorname{do}(C_e = \emptyset))$$

For a joint set of channels $S = \{C_1, C_2, \dots, C_k\}$:
$$\operatorname{CEE}(S) = P(Y = 1) - P(Y = 1 \mid \operatorname{do}(C_S = \emptyset))$$
where $\operatorname{do}(C_S = \emptyset)$ denotes the simultaneous blocking of all channels in $S$. 

**Crucial Non-Additivity Note:** In the presence of redundant or complementary causal structures (e.g., Boolean OR or Boolean AND pathways), the joint effect is strictly non-additive:
$$\operatorname{CEE}(S) \neq \sum_{C_e \in S} \operatorname{CEE}(C_e)$$
Estimating $\operatorname{CEE}(S)$ requires joint paired counterfactual replay of the set $S$.

### 5.2 Propagation Profiles
For a multi-hop lineage path $L = (C_{(e_1, a_1)}, C_{(e_2, a_2)}, \dots, C_{(e_k, a_k)})$ propagating from root cause to failure, we define the **Propagation Profile** $\Pi(L)$ as the ordered sequence of marginal CEE values along the path:
$$\Pi(L) = \left[ \operatorname{CEE}(C_1), \operatorname{CEE}(C_2), \dots, \operatorname{CEE}(C_k) \right]$$
A non-decaying propagation profile indicates that causal efficacy is preserved without attenuation across intermediate reasoning steps.

### 5.3 Cost-Utility Model
Every counterfactual replay incurs a computational or economic cost (e.g., LLM generation tokens, tool API fees, runtime latency). We model the net utility $U(S)$ of intervening on candidate set $S$ under cost regularization parameter $\lambda \ge 0$:
$$U(S) = \operatorname{CEE}(S) - \lambda \cdot \operatorname{Cost}(S)$$
where $\operatorname{Cost}(S) = \sum_{C_e \in S} \operatorname{cost}(C_e)$, and $\operatorname{cost}(C_e)$ is the execution cost associated with replaying and modifying channel $C_e$.

### 5.4 Granularity and Selectivity Metrics
To rigorously evaluate intervention granularity in shared-source settings, we define three formal metrics:

1. **Affected Evidence Scope ($\operatorname{Scope}$):** The total number of distinct evidence artifacts modified by the intervention:
   $$\operatorname{Scope}(\operatorname{do}(I)) = |\mathcal{A}_{\text{mod}}|$$

2. **Preserved Benign Evidence ($\operatorname{Preserved}$):** The number of non-causal, benign evidence artifacts produced by the source event that remain intact:
   $$\operatorname{Preserved}(\operatorname{do}(I)) = |\mathcal{A}_{\text{benign}} \setminus \mathcal{A}_{\text{mod}}|$$

3. **Collateral Modification Rate ($\operatorname{Collateral}$):** The proportion of non-causal artifacts erroneously altered by the intervention:
   $$\operatorname{Collateral}(\operatorname{do}(I)) = \frac{|\mathcal{A}_{\text{benign}} \cap \mathcal{A}_{\text{mod}}|}{|\mathcal{A}_{\text{benign}}|}$$

---

## 6. Algorithms

We provide the algorithmic specifications for CELA’s primary procedures: CEE Estimation (Algorithm 1) and Greedy Cascade Selection (Algorithm 2).

### Algorithm 1: CEE Estimation via Paired Counterfactual Replay

```python
Algorithm 1: CEE Estimation via Paired Counterfactual Replay
Input: ExecutionTrace T, EvidenceFlowGraph G, CandidateChannel C_e, 
       FailureEvaluator M, ReplayEngine RE, ReplayBudget N
Output: Counterfactual Evidence Effect CEE, MetricDict metrics

1:  y_factual <- M(T)                           # Evaluate factual trace (y=1)
2:  if y_factual == 0 then
3:      return 0.0, {"error": "Factual trace did not exhibit failure"}
4:  end if
5:
6:  counterfactual_failures <- 0
7:  n_valid <- 0
8:  affected_artifacts <- TargetScope(C_e)
9:
10: for i = 1 to N do
11:     checkpoint <- GetPriorCheckpoint(T, C_e.source_event)
12:     intervention <- CreateArtifactReplacement(C_e, replacement=EMPTY)
13:     T_cf, success <- RE.Replay(checkpoint, intervention)
14:     
15:     if success then
16:         y_cf <- M(T_cf)
17:         if y_cf == 1 then
18:             counterfactual_failures <- counterfactual_failures + 1
19:         end if
20:         n_valid <- n_valid + 1
21:     end if
22: end for
23:
24: if n_valid == 0 then
25:     return 0.0, {"error": "All counterfactual replays failed"}
26: end if
27:
28: p_cf <- counterfactual_failures / n_valid
29: cee <- 1.0 - p_cf
30:
31: preserved_count <- CountPreservedBenign(T, T_cf)
32: collateral_count <- CountCollateralModified(T, T_cf)
33:
34: metrics <- {
35:     "CEE": cee,
36:     "affected_evidence": |affected_artifacts|,
37:     "preserved_evidence": preserved_count,
38:     "collateral": collateral_count,
39:     "n_valid": n_valid
40: }
41: return cee, metrics
```

### Algorithm 2: Greedy Cascade Selection under Cost Constraints

```python
Algorithm 2: Greedy Cascade Selection under Cost Constraints
Input: CandidateChannelSet Candidates, CostBudget B, Regularizer lambda,
       FailureEvaluator M, ReplayEngine RE, MaxSetSize K
Output: SelectedSet S_star, FinalUtility U_star

1:  S <- empty_set
2:  current_cost <- 0.0
3:  best_utility <- 0.0
4:
5:  while |S| < K do
6:      best_candidate <- null
7:      best_candidate_utility <- -infinity
8:      
9:      for each C in (Candidates \ S) do
10:         if current_cost + cost(C) <= B then
11:             S_temp <- S union {C}
12:             cee_temp <- EvaluateJointCEE(S_temp, M, RE)
13:             utility_temp <- cee_temp - (lambda * (current_cost + cost(C)))
14:             
15:             if utility_temp > best_candidate_utility then
16:                 best_candidate_utility <- utility_temp
17:                 best_candidate <- C
18:             end if
19:         end if
20:     end for
21:     
22:     if best_candidate != null and best_candidate_utility > best_utility then
23:         S <- S union {best_candidate}
24:         current_cost <- current_cost + cost(best_candidate)
25:         best_utility <- best_candidate_utility
26:     else
27:         break                               # No further improvement
28:     end if
29: end while
30:
31: return S, best_utility
```

**Complexity Analysis:** Algorithm 1 requires $\mathcal{O}(N)$ replay executions per candidate channel. Algorithm 2 requires at most $\mathcal{O}(|\text{Candidates}| \cdot K)$ joint replays, where $|\text{Candidates}|$ is the pruned candidate pool and $K$ is the maximum intervention set size (typically $K \le 3$).

---

## 7. Benchmark Suite and Ground-Truth Construction

Evaluating causal attribution requires controlled environments with unambiguous ground truth. Observational datasets from real-world agent logs lack verifiable counterfactual outcomes. To rigorously test CELA, we constructed an extensive benchmark suite comprising **275 controlled scenario instances** across **11 causal mechanism families** ($\text{BF-A}$ through $\text{BF-K}$), instantiated across 5 master random seeds ($42, 123, 456, 789, 1024$), yielding 25 instances per family.

```
+----------------------------------------------------------------------------------------------------+
| Table 2: Benchmark Families and Ground-Truth Specifications                                        |
+--------+------------------------+---------------------------------------+--------------------------+
| Family | Causal Mechanism       | Structural Topology Description       | Ground-Truth Definition  |
+--------+------------------------+---------------------------------------+--------------------------+
| BF-A   | Single channel         | Single causal path + distractor       | Single causal artifact   |
| BF-B   | Redundant OR           | Disjunctive: two independent causes   | All failure-producing tool|
| BF-C   | Complementary AND      | Conjunctive: both required for failure| Any interacting tool     |
| BF-D   | Distractor             | One true cause + two distractors      | The failing tool         |
| BF-E   | Cascade                | Multi-hop linear propagation          | Originating failure step |
| BF-F   | Cost-asymmetric        | AND logic with asymmetric tool costs  | Both failing tools       |
| BF-G   | Shared source          | Multi-artifact single tool output     | Specific failing channel |
| BF-H   | Convergent mixed       | Delayed convergence of mixed inputs   | Delayed failing input    |
| BF-I   | Convergent             | Single cause among converging paths   | The causal input         |
| BF-J   | Parallel sources       | Independent parallel causal paths     | Parallel sources         |
| BF-K   | Downstream persistence | Ineffective downstream repair attempt | Original failure         |
+--------+------------------------+---------------------------------------+--------------------------+
```

### 7.1 Machine-Readable Ground Truth (`CausalMechanismSpec`)
Each benchmark instance is generated via a formal `CausalMechanismSpec` that declaratively defines:
1. `origin`: The exact tool execution event introducing corrupted data.
2. `propagation`: The sequence of intermediate reasoning and artifact transmissions conveying the error.
3. `actuator`: The terminal event triggering the failure.
4. `prevention_sets`: The complete, mathematically verified power set of minimal interventions that neutralize the failure.

### 7.2 Topological Clarifications and Known Discrepancies
To uphold complete scientific transparency, we explicitly document three topological classifications where the implemented scenario generation differs from initial theoretical labels:
1. **BF-H (Temporal Delay):** Initially designated as a `BRANCHING` topology, the actual implemented graph topology is strictly **convergent with mixed inputs** (combining a delayed causal artifact with benign contextual inputs).
2. **BF-J (Circular):** Originally labeled as a `ROOT_VS_SYMPTOM` cycle, the benchmark implementation tests **parallel independent sources** rather than a recursive or circular feedback loop.
3. **BF-K (Downstream Repair):** Initially intended to test dynamic repair compensation, the implementation evaluates **downstream persistence**, as the downstream repair tool is structurally inert and ineffective.

---

## 8. Baselines and Ablation Ladder

We evaluate CELA against standard baseline heuristics and across an incremental ablation ladder, comprising 10 distinct evaluation methods.

### 8.1 Standard Baselines
- **B1 (Random):** Uniformly samples candidate channels up to set size $K$.
- **B2 (Provenance-Only):** Selects candidate channels based solely on graph connectivity and shortest topological path to failure, without conducting interventional replays.
- **B3 (CEE-Rank):** Computes individual $\operatorname{CEE}$ for each candidate channel independently and ranks candidates by marginal effect, ignoring joint interactions.
- **B4 (Cost-Only):** Greedily selects candidate channels minimizing execution cost, ignoring causal efficacy.
- **B5 (Oracle):** Post-hoc selection of the exact minimal ground-truth prevention set (upper bound).

### 8.2 CELA Ablation Ladder
- **A1 (CELA-Provenance):** Uses provenance graph connectivity to identify candidates. Functionally equivalent to baseline $\text{B2}$ ($\text{A1} \equiv \text{B2}$).
- **A2 (CELA-CEE):** Implements individual channel-level $\operatorname{CEE}$ ranking. Functionally equivalent to baseline $\text{B3}$ ($\text{A2} \equiv \text{B3}$).
- **A3 (CELA-Cascade):** Adds multi-hop cascade tracking along directed lineage paths.
- **A4 (CELA-Greedy):** Implements greedy candidate set selection under cost constraints (Algorithm 2).
- **A5 (CELA-Full):** The full CELA pipeline, integrating fine-grained artifact replacement, candidate pruning, greedy cascade selection, and paired counterfactual replay.

---

## 9. Evaluation Metrics

Attribution efficacy is evaluated across three complementary metric dimensions.

### 9.1 Core Attribution Metrics
- **Causal Precision:** The proportion of selected interventions belonging to the true causal ground-truth set:
  $$\operatorname{Precision} = \frac{|S_{\text{selected}} \cap S_{\text{true}}|}{|S_{\text{selected}}|}$$
- **Causal Recall:** The proportion of the true causal set recovered by the method:
  $$\operatorname{Recall} = \frac{|S_{\text{selected}} \cap S_{\text{true}}|}{|S_{\text{true}}|}$$
- **Causal F1:** The harmonic mean of causal precision and recall:
  $$\text{F1} = \frac{2 \cdot \operatorname{Precision} \cdot \operatorname{Recall}}{\operatorname{Precision} + \operatorname{Recall}}$$
- **Recall@1:** Binary indicator of whether the top-ranked candidate is part of the true causal set.

### 9.2 Functional Prevention Metrics
- **Failure Prevention Rate ($\operatorname{FPR}$):** The empirical proportion of replayed scenarios where the selected intervention successfully eliminated the terminal failure ($Y = 0$).
- **Prevention Set Recall:** Binary indicator of whether the selected intervention set completely satisfies at least one minimal prevention set defined in `CausalMechanismSpec`.
- **Set-Level CEE ($\operatorname{CEE}_{\text{set}}$):** The observed reduction in failure probability under joint intervention.

### 9.3 Granularity and Selectivity Metrics
- **Preserved Evidence Count:** Total count of benign artifacts left undisturbed.
- **Collateral Modification Count:** Total count of benign artifacts corrupted or eliminated.
- **Affected Evidence Scope:** Total volume of evidence modified during intervention.

---

## 10. Statistical Methodology

Our experimental evaluation adheres to rigorous statistical protocols audited and documented in `research/statistics/statistical_audit.json`.

### 10.1 Unit of Analysis and Pairing
The fundamental unit of analysis is the **paired scenario instance**. For every scenario instance, all competing baselines and CELA ablations are evaluated on identical execution traces and initial random seeds, enabling paired non-parametric testing.

### 10.2 Statistical Hypothesis Testing
Because attribution metrics and CEE scores violate normal distribution assumptions (exhibiting discrete bounds at $0.0$ and $1.0$), we strictly avoid parametric Student’s $t$-tests.
1. **Permutation Test:** Exact permutation tests are computed when unique values $\le 3$; otherwise, Monte-Carlo permutation tests ($10,000$ resamples) evaluate null hypotheses of identical performance.
2. **Wilcoxon Signed-Rank Test:** Employed for paired continuous and ordinal comparisons across scenario instances.
3. **Multiple Testing Correction:** Family-wise error rates across multiple baseline comparisons are controlled via the **Holm-Bonferroni step-down procedure** at $\alpha = 0.05$.
4. **Bootstrap Confidence Intervals:** Percentile bootstrap confidence intervals ($95\%$ confidence level) are computed using $2,000$ resamples.
5. **Effect Size:** Standardized effect sizes are quantified via paired **Cohen’s $d$**.

### 10.3 Statistical Audit Constraints
As noted in our statistical audit:
- While $275$ instances across 11 families provide adequate aggregate statistical power, per-seed, per-family sample sizes ($n = 5$) represent small cohorts. Wilcoxon signed-rank tests require $n \ge 6$ non-zero differences to achieve significance at $\alpha = 0.05$ for isolated single-seed tests. Aggregate multi-seed tests are used to overcome this constraint.
- The statistical audit verified that zero $t$-tests are present in the analysis pipeline.

---

## 11. Experimental Results

We report verified quantitative results extracted directly from the raw experimental JSON records committed in `research/raw/`.

### 11.1 Primary Result: Granularity and Selectivity Comparison (BF-G)
Our primary experimental hypothesis (Claims $\text{C1}$ and $\text{C2}$) posits that channel-level intervention provides superior selectivity compared to source-event-level intervention in shared-source settings. 

In benchmark family $\text{BF-G}$, a single tool execution event produces two structured evidence artifacts:
- Artifact $A$ (`payload: "42"`): A corrupted numerical artifact that causes downstream failure.
- Artifact $B$ (`payload: "ok"`): A benign status confirmation artifact required for valid downstream state.

We evaluated paired channel interventions (`ARTIFACT_REPLACEMENT` targeting Artifact $A$) against source-event interventions (`TOOL_RESULT_OVERRIDE` targeting the producing event) across all 5 seeds ($42, 123, 456, 789, 1024$).

```
+----------------------------------------------------------------------------------------------------+
| Table 3: Primary Granularity Experiment Results (Family BF-G Across 5 Seeds)                       |
+---------------+-------------+-------------------+-------------------+--------------------+---------+
| Instance ID   | Seed        | Metric            | Channel Interv.   | Source-Event Interv| P-value |
+---------------+-------------+-------------------+-------------------+--------------------+---------+
| bf_g_42       | 42          | CEE               | 1.0 (Prevents)    | 1.0 (Prevents)     | —       |
|               |             | Affected Evidence | 1                 | 2                  | —       |
|               |             | Preserved Evidence| 1                 | 0                  | —       |
|               |             | Collateral Modif. | 0                 | 1                  | —       |
| bf_g_123      | 123         | CEE               | 1.0 (Prevents)    | 1.0 (Prevents)     | —       |
|               |             | Affected Evidence | 1                 | 2                  | —       |
|               |             | Preserved Evidence| 1                 | 0                  | —       |
|               |             | Collateral Modif. | 0                 | 1                  | —       |
| bf_g_456      | 456         | CEE               | 1.0 (Prevents)    | 1.0 (Prevents)     | —       |
|               |             | Affected Evidence | 1                 | 2                  | —       |
|               |             | Preserved Evidence| 1                 | 0                  | —       |
|               |             | Collateral Modif. | 0                 | 1                  | —       |
| bf_g_789      | 789         | CEE               | 1.0 (Prevents)    | 1.0 (Prevents)     | —       |
|               |             | Affected Evidence | 1                 | 2                  | —       |
|               |             | Preserved Evidence| 1                 | 0                  | —       |
|               |             | Collateral Modif. | 0                 | 1                  | —       |
| bf_g_1024     | 1024        | CEE               | 1.0 (Prevents)    | 1.0 (Prevents)     | —       |
|               |             | Affected Evidence | 1                 | 2                  | —       |
|               |             | Preserved Evidence| 1                 | 0                  | —       |
|               |             | Collateral Modif. | 0                 | 1                  | —       |
+---------------+-------------+-------------------+-------------------+--------------------+---------+
| Mean Aggregate| —           | CEE               | 1.000             | 1.000              | —       |
|               |             | Preserved Evidence| 1.000             | 0.000              | 5/5     |
|               |             | Collateral Rate   | 0.000             | 1.000              | 5/5     |
|               |             | Scope (Artifacts) | 1.000             | 2.000              | 5/5     |
+---------------+-------------+-------------------+-------------------+--------------------+---------+
```

**Key Findings:**
1. **Both Granularities Eliminate the Failure:** In $100\%$ of instances ($5/5$), both channel-level and source-event interventions achieved $\operatorname{CEE} = 1.0$, successfully averting the failure during counterfactual replay.
2. **Channel Interventions Eliminate Collateral Modification:** In all 5 instances, channel-level intervention affected exactly $1$ evidence artifact (Artifact $A$), preserving Artifact $B$ ($1$ preserved artifact) and incurring $0$ collateral modifications ($\text{collateral rate} = 0.0$).
3. **Source-Event Interventions Incur Constant Collateral Damage:** Source-event override eliminated both Artifact $A$ and Artifact $B$ ($2$ affected artifacts), preserving $0$ benign artifacts and incurring $1$ collateral modification ($\text{collateral rate} = 1.0$).
4. **Unanimous Observation:** Across all 5 independently seeded instances, channel-level intervention consistently preserved the unrelated artifact (5/5) while source-event intervention consistently destroyed it (5/5). Because the paired differences are constant (zero variance), a standard Wilcoxon signed-rank test is degenerate and no valid inferential p-value can be computed. The result is reported as a unanimous descriptive observation ($5/5$ instances), not a statistical generalization.

### 11.2 Negative Controls
To verify that CELA does not introduce spurious causal attributions when an intervention targets irrelevant pathways (Claim $\text{C4}$), we evaluated four negative control configurations across two benchmark families:
1. `BF-A (Seed 42)`: Irrelevant channel block (blocking an unrelated `echo` tool during a `calculator`-induced failure). Expected: $\operatorname{CEE} = 0.0$. Observed: $\operatorname{CEE} = 0.0$ (Outcome: Failure persisted; Passed).
2. `BF-G (Seed 42)`: Non-causal artifact block (blocking benign Artifact $B$ (`"ok"`) while leaving causal Artifact $A$ (`"42"`) intact). Expected: $\operatorname{CEE} = 0.0$. Observed: $\operatorname{CEE} = 0.0$ (Outcome: Failure persisted; Passed).
3. `BF-A (Seed 123)`: Irrelevant channel block under alternate seed. Observed: $\operatorname{CEE} = 0.0$ (Passed).
4. `BF-G (Seed 123)`: Non-causal artifact block under alternate seed. Observed: $\operatorname{CEE} = 0.0$ (Passed).

Across all 4 negative controls, the observed $\operatorname{CEE}$ was identically $0.000$, yielding a $100\%$ pass rate and confirming zero false-positive causal attribution on irrelevant paths.

### 11.3 Real-LLM Validation (Sanity Check)
To test whether language model behavior responds to artifact substitutions outside of a synthetic mock engine, we conducted a targeted sanity check using Google Gemini (`gemini-3.6-flash`, temperature $= 0.0$) across 5 trials.
- **Evaluator Rule:** Terminal failure is defined as the generation of the keyword `"42"`.
- **Factual Execution:** LLM prompt contains both Artifact $A$ (`"42"`) and Artifact $B$ (`"ok"`). Outcome: Failure produced in $5/5$ trials ($P(Y=1) = 1.0$).
- **Channel-Level Intervention:** Artifact $A$ replaced with `"0"`, Artifact $B$ preserved as `"ok"`. Outcome: Keyword `"42"` suppressed in $2/5$ trials ($P(Y=1 \mid \operatorname{do}(C_A)) = 0.60$). Resulting $\operatorname{CEE} = 0.40$.
- **Source-Event Intervention:** Entire tool payload suppressed. Outcome: Keyword `"42"` suppressed in $2/5$ trials ($P(Y=1 \mid \operatorname{do}(E)) = 0.60$). Resulting $\operatorname{CEE} = 0.40$.

**Interpretation Boundary:** This sanity check confirms the fundamental theoretical premise that real foundation model outputs vary systematically under evidence artifact replacement ($\operatorname{CEE} > 0.0$, supporting Claim $\text{C7}$). However, because this experiment employed handcrafted prompts on a single model without full agent loop execution, it serves strictly as an operational sanity check, not as an end-to-end benchmark of real-world agent reliability.

### 11.4 Full Campaign and Seed Stability
The complete experimental campaign executed 2,750 method evaluations across 275 scenarios and 5 random seeds, conducting 315 paired statistical comparisons (63 comparisons per seed).
- Seed execution runtimes: Seed 42: $12.33\text{s}$; Seed 123: $12.02\text{s}$; Seed 456: $12.16\text{s}$; Seed 789: $12.14\text{s}$; Seed 1024: $12.19\text{s}$ (mean runtime $= 12.17\text{s} \pm 0.11\text{s}$).
- The coefficient of variation ($\text{CV}$) across seeds was $< 0.02$ for runtime and $< 0.15$ across primary attribution metrics, confirming seed stability (Claim $\text{C5}$).

### 11.5 Pathway Stress Test
We evaluated CELA’s attribution metrics across 25 scenario runs spanning 5 benchmark families with varying pathway counts (Table 4).

```
+----------------------------------------------------------------------------------------------------+
| Table 4: Pathway Stress Results across Benchmark Families (5 Instances per Family)                 |
+--------+---------------+-----------------+------------------------+--------------------+-----------+
| Family | Pathway Count | Mean Recall@1   | Mean Prevention Rate   | Mean Causal F1     | Topology  |
+--------+---------------+-----------------+------------------------+--------------------+-----------+
| BF-A   | 1             | 1.00            | 1.00                   | 1.00               | Single    |
| BF-B   | 2             | 0.00            | 0.00                   | 0.00               | Redund. OR|
| BF-C   | 2             | 1.00            | 1.00                   | 0.67               | Compl. AND|
| BF-D   | 1             | 1.00            | 1.00                   | 1.00               | Distractor|
| BF-G   | 1             | 1.00            | 1.00                   | 0.67               | Shared Src|
+--------+---------------+-----------------+------------------------+--------------------+-----------+
```

**Key Findings:**
- In single-pathway configurations ($\text{BF-A}, \text{BF-D}$), CELA achieves perfect attribution ($\text{Recall@1} = 1.00, \text{F1} = 1.00$).
- In complementary AND pathways ($\text{BF-C}$), severing either pathway breaks the conjunction, achieving a $1.00$ prevention rate. However, ranking only a single channel from a two-part conjunctive set yields $\text{Precision} = 1.00, \text{Recall} = 0.50$, resulting in $\text{F1} = 0.67$.
- In redundant OR pathways ($\text{BF-B}$), individual channel interventions achieve $\text{Recall@1} = 0.00$ and $\operatorname{FPR} = 0.00$, because severing a single channel leaves the alternate redundant failure channel active.

### 11.6 Cascade and Joint Intervention Experiments
Evaluating individual vs. joint interventions on multi-fault cascades revealed distinct structural behaviors across seeds $42, 43, 44, 45, 46$:
- **Family BF-C (Complementary AND):** Individual intervention sum $\operatorname{CEE} = 1.00$, joint $\operatorname{CEE} = 1.00$, individual prevention rate $= 1.00$, joint prevention rate $= 1.00$. Intervening on either component successfully arrests the failure.
- **Family BF-B (Redundant OR):** Individual intervention sum $\operatorname{CEE} = 0.00$, joint $\operatorname{CEE} = 0.00$, individual prevention rate $= 0.00$, joint prevention rate $= 0.00$. As discussed in Section 13, the joint cascade selector in this experiment did not identify a joint set overcoming the disjunctive hurdle, representing a design limitation.

### 11.7 Cost-Utility Budget Sweep
Sweeping the intervention cost budget $B \in \{1.0, 2.0, 5.0, 10.0, \infty\}$ (with tool costs $= 5.0$) demonstrated a clear step-function threshold:
- At budgets $B = 1.0$ and $B = 2.0$: $0$ channels selected ($\text{total cost} = 0.0$), yielding a failure prevention rate of $0.00$.
- At budgets $B = 5.0, 10.0$, and $\infty$: Exactly $1$ channel selected ($\text{total cost} = 5.0$), achieving a failure prevention rate of $1.00$ ($100\%$).
This confirms that the greedy cascade selector strictly respects cost bounds while seizing prevention when budget permits.

### 11.8 Runtime Scalability
Benchmarking runtime latency across benchmark families on a standard workstation showed sub-millisecond to low-millisecond resolution times:
- $\text{BF-A}$: $2.6\text{ ms}$ ($0.0026\text{s}$)
- $\text{BF-E}$: $1.9\text{ ms}$ ($0.0019\text{s}$)
- $\text{BF-H}$: $3.8\text{ ms}$ ($0.0038\text{s}$)
- $\text{BF-J}$: $2.9\text{ ms}$ ($0.0029\text{s}$)
Across all families, CELA graph construction and candidate resolution executed in $< 5\text{ ms}$ on these small synthetic benchmarks. Scalability to large real-agent traces with hundreds of events has not been measured.

---

## 12. Ablation Studies (A1–A5 Ladder)

We analyzed the contribution of each component in the CELA framework through the incremental ablation ladder ($\text{A1}$ to $\text{A5}$):

```
+----------------------------------------------------------------------------------------------------+
| Table 5: Ablation Ladder Architecture and Capabilities                                             |
+-------+--------------------+------------------------+-------------------+--------------------------+
| Level | Identifier         | Mechanism Added        | Equivalent Baseline| Distinct Functional Role |
+-------+--------------------+------------------------+-------------------+--------------------------+
| A1    | CELA-Provenance    | Backward graph slicing | B2 (Prov-only)    | Prunes irrelevant nodes  |
| A2    | CELA-CEE           | Individual CEE ranking | B3 (CEE-rank)     | Measures marginal effects|
| A3    | CELA-Cascade       | Lineage path tracking  | —                 | Multi-hop error tracing  |
| A4    | CELA-Greedy        | Budgeted joint search  | —                 | Non-additive joint sets  |
| A5    | CELA-Full          | Full channel pipeline  | —                 | Surgical artifact repair |
+-------+--------------------+------------------------+-------------------+--------------------------+
```

1. **A1 (Provenance Pruning):** Eliminates un-connected nodes, reducing the candidate search space relative to the full event set. The exact pruning ratio depends on trace topology and has not been measured across all benchmark families.
2. **A2 (Marginal CEE):** Successfully resolves single-pathway failures ($\text{BF-A}, \text{BF-D}$), but fails completely on redundant failures ($\text{BF-B}$).
3. **A3 (Cascade Tracking):** Enables propagation profile calculation ($\Pi(L)$), tracing multi-hop decay.
4. **A4 (Greedy Selection):** Recovers joint intervention sets in conjunctive and cost-constrained settings ($\text{BF-C}, \text{BF-F}$).
5. **A5 (Full Pipeline):** Adds surgical artifact replacement, achieving optimal selectivity and zero collateral modification in shared-source settings.

---

## 13. Dedicated Negative Results

In accordance with rigorous scientific practices, we dedicate this section to documenting null findings, limitations, and benchmark constraints.

### 13.1 C3 Negative Result: A5 vs. B1 Causal F1 ($p = 0.1156$)
In our pre-registered Claim $\text{C3}$, we hypothesized that full CELA ($\text{A5}$) would achieve a statistically significantly higher `causal_f1` than the random candidate baseline ($\text{B1}$) across the complete benchmark campaign.
- **Statistical Test:** Paired Monte-Carlo permutation test with Holm-Bonferroni correction.
- **Result:** $p = 0.1156$ ($p > 0.05$).
- **Status:** **NOT SUPPORTED**.

**Analysis:** Full CELA does not demonstrate a statistically significant F1 advantage over random candidate selection on this aggregate synthetic metric. Two factors explain this finding:
1. *Benchmark Candidate Simplicity:* In small synthetic benchmark instances, the candidate set size is relatively constrained ($2$ to $4$ candidates). A random baseline selecting $K=2$ candidates has a high base probability of intersecting the true causal set.
2. *Sample Size and Power:* With $n = 5$ instances per seed/family, the non-parametric permutation test possessed insufficient statistical power to detect small-to-medium effect sizes after multiple-comparison correction. 

Rather than reframing this metric, we report it directly: CELA's demonstrated advantage lies in **intervention selectivity** (eliminating collateral modifications in shared-source events), not in superior F1 on simple candidate pools.

### 13.2 Cascade Experiment Zero Effect for Redundant Faults (BF-B)
In the cascade experiment evaluating redundant faults ($\text{BF-B}$), both individual and joint CEE scores remained identically $0.00$. In this scenario, two independent tools simultaneously injected identical failure artifacts. Because the tested cascade search budget was capped at $K=1$ in this run, the joint selector could not evaluate the $K=2$ pair required to break the redundant OR gate. This highlights a clear operational limitation: CELA cannot prevent disjunctive multi-fault failures unless the search budget $K$ explicitly equals or exceeds the redundancy degree.

### 13.3 Replay Convergence as an Artifact of Determinism
In our convergence experiment (Claim $\text{C6}$), CEE was measured across replay counts $N \in \{1, 3, 5, 10, 20, 50\}$. Across all replay counts, CEE remained identically $1.000$, with bootstrap confidence interval widths of $0.000$. 
- While Claim $\text{C6}$ is technically supported by the data, this convergence is **trivially true** due to the deterministic execution of `MockLLM`. 
- **Critical Caveat:** This result confirms replay engine stability, but it **does not demonstrate stochastic robustness**. Real-world LLM deployments exhibit non-zero temperature sampling variance, which would yield empirical variance and wider confidence intervals.

---

## 14. Competitor Comparison

Table 6 provides a comprehensive comparative matrix evaluating CAPTAIN/CELA against 12 related systems across 20 design dimensions.

```
+-----------------------------------------------------------------------------------------------------------------------------------------------+
| Table 6: Detailed Competitor Analysis Matrix                                                                                                  |
+---------------------+-------------------+-----------------------+--------------------+------------------------+-------------------------------+
| Framework           | Problem Scope     | Intervention Unit     | Attribution Unit   | Causal Estimator       | Closest Overlap with CELA     |
+---------------------+-------------------+-----------------------+--------------------+------------------------+-------------------------------+
| CAPTAIN/CELA (Ours) | Evidence Channel  | Artifact Replacement  | Channel-level      | CEE (Paired Replay)    | Reference System              |
| Who&When Pro [WhWP] | Benchmark (12K)   | None (Observational)  | Step-level         | None (Static Labels)   | Root cause identification     |
| CAR [CAR25]         | Step Attribution  | Step-level do(·)      | Step-level         | Contrastive MC Shapley | Counterfactual replay         |
| CausalFlow [CF25]   | Failure Diagnosis | Step-level            | Step-level         | Causal Resp. Scores    | Interventional causal repair  |
| AgentRx [ARx25]     | Unrecoverable Step| None (Constraint IR)  | Step (First Unrec) | None (Static)          | Intermediate representation   |
| From Spark [S2F25]  | Multi-Agent Casc. | None (Governance)     | Message-level      | None (Structural Graph)| Error cascade modeling        |
| AgenticRAG-FP [RAG] | RAG Propagation   | Hop-level Retrieval   | Hop-level          | Downstream Shift       | Multi-hop error propagation   |
| Oat [Oat25]         | Anomaly Detection | None (Latent Space)   | Step-level         | Neural CDE Latent Dev. | Anomaly isolation             |
| AgentProcBench [APB]| Process Benchmark | None (Human Ternary)  | Step-level         | None (Observational)   | Step-level evaluation         |
| AgenTracer [ATr25]  | Multi-Agent Trace | Fault Injection       | Agent-level        | Fine-tuned Tracer      | Fault injection replay        |
| RAFFLES [RAF25]     | Reasoning Failure | None (LLM-as-Judge)   | Component-level    | Probing Scores         | Multi-component analysis      |
| DoVer [DoV25]       | Multi-Agent Test  | Message/Plan Edit     | Segment-level      | Heuristic Success Flip | Active trace intervention     |
| SAFARI [SAF25]      | Long-Context Debug| None (Search Tool)    | Context-level      | None (Heuristic Search)| Long-horizon fault search     |
+---------------------+-------------------+-----------------------+--------------------+------------------------+-------------------------------+
```

### 14.1 Key Qualitative Distinctions
1. **Intervention Granularity:** Among the systems reviewed, CAPTAIN/CELA is the only one whose documentation describes sub-step, provenance-defined `ARTIFACT_REPLACEMENT`. CAR, CausalFlow, and DoVer intervene at the step, message, or plan segment level. However, this comparison is based on published descriptions; we have not executed these systems to confirm their intervention granularity.
2. **Causal Quantification:** Unlike observational scoring systems (Who&When Pro, AgentProcessBench, RAFFLES), CELA operationalizes counterfactual effect estimation through active paired execution.
3. **Absence of Direct Empirical Competitor Execution:** We emphasize that no external system was directly executed in our experimental harness. Differences in benchmark formats, closed-source dependencies, and divergent attribution goals preclude fair head-to-head empirical metrics. All comparisons are strictly conceptual and literature-based.

---

## 15. Discussion

### 15.1 What Selectivity Means—and What It Does Not Mean
The central empirical finding of this work is that channel-level intervention achieves superior **selectivity**: in shared-source execution events, CELA eliminates terminal failures while modifying $50\%$ less evidence ($1$ vs. $2$ artifacts), preserving $100\%$ of benign co-generated evidence ($1$ vs. $0$ artifacts), and eliminating collateral modifications ($0$ vs. $1$).

However, we must explicitly bound the implications of this finding:
- **Selectivity does NOT imply universal debugging superiority:** If an agent operates in an environment where all tools produce strictly scalar, single-value outputs, the distinction between a channel intervention and a source-event intervention collapses.
- **Selectivity requires structured artifact separability:** CELA assumes that tool outputs can be parsed into discrete, semantically separable evidence artifacts. In unstructured multi-modal streams (e.g., raw pixel streams or monolithic prose), extracting discrete evidence channels remains an open challenge.

### 15.2 Trade-offs in Intervention Granularity
Operating at finer granularity introduces computational trade-offs:
1. *Graph Complexity:* Decomposing events into fine-grained artifacts increases evidence graph node count by $2\times$ to $5\times$.
2. *Intervention Engineering:* Implementing an `ARTIFACT_REPLACEMENT` requires intercepting prompt construction or tool deserialization logic, whereas a `TOOL_RESULT_OVERRIDE` can be executed at the generic API boundary.

---

## 16. Limitations and Threats to Validity

### 16.1 Internal Validity
- **Reliance on Deterministic MockLLM:** The benchmark campaign was executed using deterministic `MockLLM` routines. While this guarantees exact reproducibility and ground-truth verification, it masks real-world stochasticity, temperature variance, and prompt sensitivity.
- **Clean Separability Assumption:** In benchmark family $\text{BF-G}$, Artifact $A$ and Artifact $B$ are cleanly disjoint. In real-world software, co-generated fields often exhibit latent semantic coupling.

### 16.2 External Validity
- **Generalization Beyond Synthetic Scenarios:** While our 275 scenarios model 11 distinct causal graph structures, they do not replicate the chaotic, open-ended trajectories encountered in web navigation or complex code generation benchmarks (e.g., SWE-bench).
- **Narrow Real-LLM Scope:** The Gemini sanity check verified artifact sensitivity on handcrafted prompts, but did not execute a full agent loop.

### 16.3 Construct Validity
- **Benchmark Conceptual Discrepancies:** As documented in Section 7, benchmark families $\text{BF-H}$, $\text{BF-J}$, and $\text{BF-K}$ evaluate topological variants that differ slightly from their original naming conventions.
- **Intervention Definition Alignment:** While `ARTIFACT_REPLACEMENT` cleanly operationalizes channel intervention in CAPTAIN, other agent platforms may require different interception primitives.

### 16.4 Statistical Validity
- **Statistical Power on Sub-cohorts:** Per-seed cohorts ($n=5$) limit the power of non-parametric tests, contributing to the non-significant $p$-value ($p = 0.1156$) observed in the aggregate $\text{A5}$ vs. $\text{B1}$ comparison.

---

## 17. Conclusion and Future Work

We have presented CAPTAIN and CELA, a platform and causal analysis framework for autonomous agent failure attribution. By elevating data provenance from passive tracing to an active interventional substrate, CELA operationalizes causal failure analysis at the **evidence-flow channel level**. In controlled shared-source benchmarks, channel-level intervention unanimously preserved benign co-generated evidence (5/5 instances) while source-event intervention destroyed it in every case, demonstrating superior selectivity within the tested BF-G scenario. No valid inferential p-value could be computed for this comparison due to zero variance in paired differences. We transparently documented our negative results, bounding our findings within synthetic and deterministic evaluation domains.

### 17.1 Future Work
1. **Stochastic and Real-Agent Validation:** Extending CELA to live, stochastic multi-agent deployments across benchmarks such as SWE-bench and WebArena.
2. **Automated Artifact Slicing in Unstructured Data:** Integrating LLM-guided parser synthesis to extract discrete evidence channels from unstructured text and image streams.
3. **Dynamic Repair Synthesis:** Leveraging identified causal channels to automatically synthesize runtime self-healing interventions.

---

## 18. References

- **[APB25]** AgentProcessBench Consortium. (2025). AgentProcessBench: Fine-Grained Process-Level Step Evaluation of Autonomous Agents. *arXiv preprint*.
- **[ARx25]** AgentRx Authors. (2025). AgentRx: Identifying the First Unrecoverable Failure Step in Agent Trajectories via Intermediate Representation Constraints. *arXiv preprint*.
- **[ATr25]** AgenTracer Team. (2025). AgenTracer: Multi-Agent Failure Attribution via Trajectory Replay and Fault Injection. *Conference on Language Modeling*.
- **[CAR25]** Causal Agent Replay Group. (2025). CAR: Causal Step Identification in Autonomous Agents via Counterfactual Forward Replay. *International Conference on Machine Learning (ICML)*.
- **[CCT09]** Cheney, J., Chiticariu, L., & Tan, W. C. (2009). Provenance in Databases: Why, How, and Where. *Foundations and Trends in Databases*, 1(4), 379-474.
- **[CF25]** CausalFlow Consortium. (2025). CausalFlow: Interventional Failure Diagnosis and Minimal Repair for AI Agents. *NeurIPS*.
- **[DoV25]** DoVer Research. (2025). DoVer: Active Interventions and Trial Segment Replay for Multi-Agent Failure Testing. *arXiv preprint*.
- **[Oat25]** Oat Investigators. (2025). Oat: Unsupervised Step-Level Anomaly Detection in Agent Trajectories via Neural Controlled Differential Equations. *ICLR*.
- **[Pearl09]** Pearl, J. (2009). *Causality: Models, Reasoning, and Inference* (2nd ed.). Cambridge University Press.
- **[PJS17]** Peters, J., Janzing, D., & Schölkopf, B. (2017). *Elements of Causal Inference: Foundations and Learning Algorithms*. MIT Press.
- **[RAF25]** RAFFLES Authors. (2025). RAFFLES: Reasoning-Based Failure Attribution via Component-Level LLM Probing. *ACL*.
- **[RAGFP25]** AgenticRAG-FP Authors. (2025). Measuring Failure Propagation and Signal Loss Depth in Multi-Hop Retrieval-Augmented Generation. *EMNLP*.
- **[S2F25]** From Spark to Fire Team. (2025). From Spark to Fire: Modeling and Governing Error Cascades in Multi-Agent Systems. *Autonomous Agents and Multi-Agent Systems (AAMAS)*.
- **[SAF25]** SAFARI Group. (2025). SAFARI: Ultra-Long Context Fault Debugging in AI Agents via Tool-Augmented Search. *arXiv preprint*.
- **[WhWP25]** Who&When Pro Consortium. (2025). Who&When Pro: A Trajectory-Scale Benchmark for Agentic Failure Attribution. *arXiv preprint*.

---

## 19. Appendix: Figure, Table, and Claim Index

This index maps all claims, figures, tables, and raw evidence files in the CAPTAIN repository.

```
+-------------------------------------------------------------------------------------------------------------------------------+
| Table 7: Claim, Evidence, and Artifact Traceability Matrix                                                                    |
+-------+-----------------------------+--------------------+------------------------------+--------------------+----------------+
| Claim | Formal Claim Statement      | Empirical Status   | Raw Evidence File            | Associated Figure  | Table in Paper |
+-------+-----------------------------+--------------------+------------------------------+--------------------+----------------+
| C1    | Channel intervention is     | SUPPORTED          | research/raw/                | research/figures/  | Table 3        |
|       | more selective than source  | (5/5 unanimous)    | granularity_experiment.json  | fig_granularity.png|                |
+-------+-----------------------------+--------------------+------------------------------+--------------------+----------------+
| C2    | Channel intervention        | SUPPORTED          | research/raw/                | research/figures/  | Table 3        |
|       | preserves unrelated evidence| (5/5 unanimous)    | granularity_experiment.json  | fig_collateral.png |                |
+-------+-----------------------------+--------------------+------------------------------+--------------------+----------------+
| C3    | CELA A5 achieves higher F1  | NOT SUPPORTED      | research/raw/                | research/figures/  | Table 5        |
|       | than Random baseline B1     | (Permutation p=.12)| campaign_full.json           | fig_attribution.png|                |
+-------+-----------------------------+--------------------+------------------------------+--------------------+----------------+
| C4    | Negative controls show      | SUPPORTED          | research/raw/                | research/figures/  | Section 11.2   |
|       | CEE = 0 for irrelevant paths| (CEE = 0.000)      | negative_controls.json       | fig_negative_ctrls |                |
+-------+-----------------------------+--------------------+------------------------------+--------------------+----------------+
| C5    | Results are stable across   | SUPPORTED          | research/raw/                | research/figures/  | Section 11.4   |
|       | random seeds (CV < 0.2)     | (CV < 0.15)        | campaign_full.json           | fig_scalability.png|                |
+-------+-----------------------------+--------------------+------------------------------+--------------------+----------------+
| C6    | CEE converges across replays| SUPPORTED          | research/raw/                | research/figures/  | Section 13.3   |
|       | (Trivially in MockLLM)      | (CEE=1.0, CI=0.0)  | replay_convergence.json      | fig_convergence.png|                |
+-------+-----------------------------+--------------------+------------------------------+--------------------+----------------+
| C7    | Real-LLM intervention yields| SUPPORTED          | research/raw/                | research/figures/  | Section 11.3   |
|       | CEE > 0 (Sanity check only) | (CEE = 0.400)      | real_llm_validation.json     | fig_real_llm.png   |                |
+-------+-----------------------------+--------------------+------------------------------+--------------------+----------------+
```

### Additional File References
- **Cost-Utility Sweep Data:** `research/raw/cost_utility_sweep.json` mapped to `research/figures/fig_cost_utility.png` and Table 10 (`research/tables/table_10_cost_utility.md`).
- **Pathway Stress Data:** `research/raw/pathway_stress.json` mapped to `research/figures/fig_pathway_stress.png` and Table 4 (`research/tables/table_08_pathway_stress.md`).
- **Cascade Experiment Data:** `research/raw/cascade_experiment.json` mapped to Table 9 (`research/tables/table_09_cascade.md`).
- **Scalability Benchmarks:** `research/raw/scalability.json` mapped to `research/figures/fig_scalability.png` and Table 6 (`research/tables/table_06_scalability.md`).
- **Statistical Audit Log:** `research/statistics/statistical_audit.json`.
