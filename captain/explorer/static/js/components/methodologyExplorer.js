/**
 * CORNERSTONE Methodology & Mathematical Explorer
 * Module 3 Component
 * 12-Stage Formal Pipeline with Mathematical Definitions, Complexity, & Code Symbols
 */

class MethodologyExplorer {
  constructor(containerId = 'methodology-explorer-container') {
    this.container = document.getElementById(containerId);
    this.activeStageIndex = 0;
    this.stages = [
      {
        id: 1,
        title: "1. Trace Capture",
        name: "Deterministic Trace Instrumentation",
        math: "T = \\langle e_1, e_2, \\dots, e_n \\rangle, \\quad e_i = (\\text{id}, \\tau, c, p, A_{\\text{in}}, A_{\\text{out}})",
        inputs: "Agent Execution Stream, Environment Sensors, Tool Wrappers",
        outputs: "ExecutionRun containing ordered Sequence of EventRecords",
        complexity: "O(n) time, O(n) space",
        description: "Captures every discrete action, LLM invocation, tool call, and environmental response as an immutable event record with millisecond timestamps and strictly deterministic UUIDs.",
        algorithm: "1. Wrap agent runtime hooks into ExecutionObserver.\n2. On tool dispatch, capture inputs, target URI, and call signature.\n3. On return, intercept raw payload, serialize to structured record.\n4. Persist to local JSON Lines storage with SHA-256 integrity hash."
      },
      {
        id: 2,
        title: "2. Artifact Hashing",
        name: "Artifact Extraction & Content Hashing",
        math: "a_j = (\\text{id}, \\text{type}, v, h(v)), \\quad h(v) = \\text{SHA-256}(\\text{canonical\\_json}(v))",
        inputs: "Raw Event outputs, memory states, environment files",
        outputs: "Canonical Artifact instances with invariant content digests",
        complexity: "O(m \\cdot |v|) time, where |v| is artifact byte length",
        description: "Deconstructs unstructured tool returns into typed, addressable evidence artifacts (SQL tables, JSON values, search snippets). Every artifact receives an invariant cryptographic hash to track downstream mutation.",
        algorithm: "1. For each event output, inspect MIME type and payload.\n2. Apply canonical JSON serialization (sorted keys, compact delimiters).\n3. Compute SHA-256 digest.\n4. Register artifact in Run manifest with producer event pointer."
      },
      {
        id: 3,
        title: "3. Bipartite Graph",
        name: "Bipartite Provenance Graph Construction",
        math: "G = (V_E \\cup V_A, E_{\\text{prod}} \\cup E_{\\text{cons}}), \\quad E_{\\text{prod}} \\subseteq V_E \\times V_A, \\quad E_{\\text{cons}} \\subseteq V_A \\times V_E",
        inputs: "Event sequence E, Artifact set A",
        outputs: "Directed Bipartite Execution Graph G with strict topological ordering",
        complexity: "O(|V| + |E|) time and memory",
        description: "Constructs a formal bipartite directed acyclic graph where event nodes connect to produced artifact nodes (E -> A), and artifact nodes connect to consuming event nodes (A -> E). Direct event-to-event edges are forbidden, ensuring pure evidence tracking.",
        algorithm: "1. Initialize bipartite graph G.\n2. Add vertex for every event e in E.\n3. Add vertex for every artifact a in A.\n4. For each a in e.outputs, add directed edge (e, a) with type 'produces'.\n5. For each a in e.inputs, add directed edge (a, e) with type 'consumes'."
      },
      {
        id: 4,
        title: "4. Provenance Reachability",
        name: "Upstream Ancestry & Symptom Backward Slicing",
        math: "\\text{Anc}(e_{\\text{fail}}) = \\{ v \\in V \\mid v \\rightsquigarrow e_{\\text{fail}} \\text{ in } G \\}",
        inputs: "Failure Event e_fail, Bipartite Graph G",
        outputs: "Sub-DAG G_upstream containing all causally reachabile ancestors",
        complexity: "O(|V| + |E|) via reverse Depth-First Search",
        description: "Identifies the complete backward slice of execution leading into the failure symptom. Prunes unconsumed artifacts and unrelated execution branches that occurred chronologically before failure but had no causal reachability.",
        algorithm: "1. Locate failure event node e_fail in G.\n2. Perform reverse BFS/DFS traversing incoming edges backwards.\n3. Collect all traversed event and artifact nodes into ancestor set.\n4. Construct induced subgraph G_upstream representing candidate search space."
      },
      {
        id: 5,
        title: "5. Channel Generation",
        name: "Evidence Channel Candidate Extraction",
        math: "C = \\{ (e_i, a_j) \\in E_{\\text{prod}} \\mid e_i \\in \\text{Anc}(e_{\\text{fail}}) \\land a_j \\in \\text{Anc}(e_{\\text{fail}}) \\}",
        inputs: "Ancestor Sub-DAG G_upstream",
        outputs: "Set of discrete candidate Evidence Channels C",
        complexity: "O(|C|) where |C| <= |E_prod|",
        description: "Formulates candidate intervention points at the channel granularity: a specific artifact produced by a specific tool execution. This distinguishes between co-produced artifacts from the same event, enabling sub-event precision.",
        algorithm: "1. For every producer edge in G_upstream, instantiate CandidateChannel.\n2. Assign channel_id = 'ch_{event_id}_{artifact_id}'.\n3. Calculate structural graph distance to e_fail.\n4. Initialize candidate screening priority."
      },
      {
        id: 6,
        title: "6. Environment Sandboxing",
        name: "Deterministic Replay Environment Sandboxing",
        math: "\\mathcal{E}_{\\text{replay}} \\sim \\text{Snapshot}(\\mathcal{E}_0, \\mathbf{S}_{\\text{seed}})",
        inputs: "Master Seed S_seed, Initial State Snapshot E_0",
        outputs: "Hermetic sandbox environment with isolated file system and mock tool dispatch",
        complexity: "O(1) initialization with copy-on-write snapshotting",
        description: "Spawns an isolated replay sandbox seeded with identical pseudorandom seeds, frozen external API mocks, and deterministic system clock to guarantee factual reproducibility.",
        algorithm: "1. Clone agent memory state at step t=0.\n2. Bind deterministic MockLLM provider with recorded completion cache.\n3. Mount in-memory volatile virtual filesystem.\n4. Verify deterministic baseline replay yields identical factual failure."
      },
      {
        id: 7,
        title: "7. Channel Intervention",
        name: "Targeted Counterfactual Channel Replacement",
        math: "\\text{do}(a_j \\leftarrow a_j^*), \\quad \\text{leaving } a_k \\text{ unchanged for } k \\neq j",
        inputs: "Candidate Channel c = (e_i, a_j), Counterfactual Value a_j*",
        outputs: "Intervened execution stream with localized evidence replacement",
        complexity: "O(1) intervention injection, O(k) replay steps",
        description: "The core innovation of CELA: rather than discarding the entire tool event (which causes collateral damage to other artifacts), CELA replaces only the specific target artifact value while allowing benign co-produced artifacts to propagate freely.",
        algorithm: "1. Intercept artifact production event e_i during replay.\n2. If output is target artifact a_j, substitute value with counterfactual replacement a_j*.\n3. If output is benign artifact a_k (k != j), preserve original value without modification.\n4. Resume autonomous agent execution from step t_i + 1."
      },
      {
        id: 8,
        title: "8. CEE Estimation",
        name: "Counterfactual Execution Effect (CEE) Computation",
        math: "\\text{CEE}(c) = \\mathbb{E}[Y_{\\text{factual}}] - \\mathbb{E}[Y_{\\text{counterfactual}} \\mid \\text{do}(c)] \\in [0, 1]",
        inputs: "Factual outcome Y_fact in {0, 1}, Replay outcome Y_cf in {0, 1}",
        outputs: "Normalized CEE scalar score and bootstrap confidence interval",
        complexity: "O(R) replays per channel (R in [1, 20])",
        description: "Quantifies the empirical causal necessity of the channel. If blocking or repairing channel c converts failure into success, CEE = 1.0. If the agent continues to fail, CEE = 0.0.",
        algorithm: "1. Execute R replay iterations under do(c).\n2. Record success rate of task completion.\n3. Compute mean prevention rate and empirical variance.\n4. If CEE < threshold (0.5), prune channel c from causal candidate pool."
      },
      {
        id: 9,
        title: "9. Cascade Analysis",
        name: "Downstream Propagation & Cascade Lookahead",
        math: "\\Delta_{\\text{downstream}}(c) = \\sum_{v \\in \\text{Desc}(c)} \\mathbb{I}[v_{\\text{cf}} \\neq v_{\\text{fact}}]",
        inputs: "Candidate channel c, Downstream artifact set Desc(c)",
        outputs: "Cascade tree with node-by-node state difference annotations",
        complexity: "O(|Desc(c)|) state comparisons",
        description: "Tracks how the intervention modifies downstream evidence as it propagates through subsequent tool calls. Differentiates between beneficial state corrections and unwanted collateral disruption.",
        algorithm: "1. Align factual and counterfactual execution traces by sequence number.\n2. Compare artifact hashes for all downstream nodes in Desc(c).\n3. Flag nodes where hash differs as mutated.\n4. Compute collateral damage ratio: (mutated benign artifacts) / (total benign artifacts)."
      },
      {
        id: 10,
        title: "10. Cost-Utility Optimization",
        name: "Multi-Objective Knapsack Formulation",
        math: "\\max_{S \\subseteq C} \\quad \\mathcal{U}(S) = \\text{CEE}(S) - \\lambda \\sum_{c \\in S} \\text{Cost}(c) \\quad \\text{s.t.} \\quad |S| \\le k",
        inputs: "Screened candidates C, Regularization lambda, Max set size k",
        outputs: "Pareto-optimal candidate sets ranked by net utility",
        complexity: "O(|C|^k) exhaustive or O(|C| log |C|) greedy approximation",
        description: "Formulates failure repair as an economic optimization: maximize failure prevention while minimizing total intervention cost and collateral disturbance.",
        algorithm: "1. For each candidate set S up to size k, evaluate joint CEE(S).\n2. Compute total intervention cost: Cost(S) = sum(cost(c) for c in S).\n3. Compute utility U(S) = CEE(S) - lambda * Cost(S).\n4. Sort candidate sets in descending order of utility."
      },
      {
        id: 11,
        title: "11. Pareto Set Selection",
        name: "CELA A5 Optimal Intervention Set Selection",
        math: "S^* = \\arg\\max_{S \\subseteq C, |S| \\le k} \\mathcal{U}(S)",
        inputs: "Ranked candidate sets",
        outputs: "Final selected CELA intervention set S* with confidence bounds",
        complexity: "O(1) post-ranking selection",
        description: "Extracts the optimal intervention set for presentation and automated repair. In benchmark evaluations, CELA A5 achieves 0.0% distractor selection and 0.80 cost.",
        algorithm: "1. Select top candidate set S* with highest utility.\n2. Verify that S* satisfies budget constraint and positive CEE.\n3. Output selected channels, predicted prevention rate, and regret metric."
      },
      {
        id: 12,
        title: "12. Verification & Ledger",
        name: "Evaluation & Claim Ledger Verification",
        math: "F_1 = \\frac{2 \\cdot P \\cdot R}{P + R}, \\quad \\text{Preservation} = \\frac{|A_{\\text{benign}} \\cap A_{\\text{retained}}|}{|A_{\\text{benign}}|}",
        inputs: "Selected intervention set S*, Ground Truth G_true",
        outputs: "Formal Precision, Recall, F1, Preservation Rate, and Hypothesis Verification",
        complexity: "O(|S*| + |G_true|)",
        description: "Final scientific validation against benchmark ground-truth annotations. Records precision, recall, F1, and updates the permanent claim registry.",
        algorithm: "1. Match S* against ground truth causal channels in G_true.\n2. Compute True Positives, False Positives, False Negatives.\n3. Calculate Causal F1, Distractor Selection Rate, and Collateral Rate.\n4. Log results to JSON research ledger for archival and verification."
      }
    ];
  }

  init() {
    if (!this.container) return;
    this.render();
  }

  setStage(index) {
    this.activeStageIndex = index;
    this.render();
  }

  render() {
    const stage = this.stages[this.activeStageIndex];

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Header -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4);">
            <div>
              <span class="badge badge-accent" style="margin-bottom: var(--space-2);">FORMAL SCIENTIFIC METHODOLOGY</span>
              <h2 style="font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 700; color: var(--text-bright);">
                The 12-Stage CAPTAIN & CELA Mathematical Pipeline
              </h2>
              <p style="color: var(--text-secondary); font-size: var(--text-sm); max-width: 800px; margin-top: var(--space-2); line-height: 1.6;">
                Click any stage in the execution flow below to inspect its formal mathematical formulations, input/output data types, computational complexity bounds, and algorithm steps.
              </p>
            </div>
            <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--primary-cyan); background: var(--bg-surface-elevated); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              STAGE ${stage.id} OF 12: <strong>${stage.title}</strong>
            </div>
          </div>
        </div>

        <!-- 12-Stage Clickable Flow Navigation -->
        <div class="pipeline-stages-nav">
          ${this.stages.map((st, idx) => `
            <button class="pipeline-stage-btn ${this.activeStageIndex === idx ? 'active' : ''}" data-idx="${idx}">
              ${st.title}
            </button>
          `).join('')}
        </div>

        <!-- Active Stage Card -->
        <div class="methodology-stage-card">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-4);">
            <div style="display: flex; gap: var(--space-3); align-items: center;">
              <span class="badge badge-accent" style="font-family: var(--font-mono); font-size: var(--text-base);">Stage ${stage.id}</span>
              <h3 style="font-family: var(--font-display); font-size: var(--text-xl); color: var(--text-bright);">${stage.name}</h3>
            </div>
            <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: #c084fc; background: rgba(147, 51, 234, 0.1); padding: 4px 10px; border-radius: 9999px; border: 1px solid rgba(147, 51, 234, 0.3);">
              Complexity: ${stage.complexity}
            </span>
          </div>

          <!-- Formal Math Equation Box -->
          <div>
            <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: var(--space-2); letter-spacing: 0.05em;">
              Formal Mathematical Formulation
            </div>
            <div class="math-equation-box">
              \\[ ${stage.math} \\]
            </div>
          </div>

          <!-- Inputs & Outputs -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px;">Input Data Structures</div>
              <div style="font-size: var(--text-sm); color: var(--text-bright); font-family: var(--font-mono);">${stage.inputs}</div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-family: var(--font-mono); font-size: 11px; color: #10b981; text-transform: uppercase; margin-bottom: 4px;">Output Data Structures</div>
              <div style="font-size: var(--text-sm); color: #10b981; font-family: var(--font-mono);">${stage.outputs}</div>
            </div>
          </div>

          <!-- Description & Algorithm -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <h4 style="font-family: var(--font-display); font-size: var(--text-sm); color: var(--text-bright); margin-bottom: var(--space-2);">
                Conceptual Significance
              </h4>
              <p style="font-size: var(--text-sm); color: var(--text-secondary); line-height: 1.6;">
                ${stage.description}
              </p>
            </div>

            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <h4 style="font-family: var(--font-display); font-size: var(--text-sm); color: var(--text-bright); margin-bottom: var(--space-2);">
                Algorithmic Implementation
              </h4>
              <pre style="font-family: var(--font-mono); font-size: 11px; color: var(--text-normal); line-height: 1.5; white-space: pre-wrap; margin: 0;">${stage.algorithm}</pre>
            </div>
          </div>

          <!-- Stage Pagination Buttons -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle);">
            <button id="btn-prev-stage" class="btn btn-secondary btn-sm" ${this.activeStageIndex === 0 ? 'disabled' : ''}>
              ← Previous Stage
            </button>
            <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-muted);">
              Use arrow keys or click buttons to navigate stages
            </span>
            <button id="btn-next-stage" class="btn btn-primary btn-sm" ${this.activeStageIndex === this.stages.length - 1 ? 'disabled' : ''}>
              Next Stage →
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    if (window.renderMathInElement) {
      window.renderMathInElement(this.container);
    }
  }

  bindEvents() {
    this.container.querySelectorAll('.pipeline-stage-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.setStage(idx);
      });
    });

    const prevBtn = this.container.querySelector('#btn-prev-stage');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.activeStageIndex > 0) this.setStage(this.activeStageIndex - 1);
      });
    }

    const nextBtn = this.container.querySelector('#btn-next-stage');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.activeStageIndex < this.stages.length - 1) this.setStage(this.activeStageIndex + 1);
      });
    }
  }
}

window.cornerstoneMethodologyExplorer = new MethodologyExplorer();
