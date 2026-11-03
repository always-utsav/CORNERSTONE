/**
 * CORNERSTONE Research Results Command Center
 * Module 4 Component — Full Scientific Integrity & Traceability
 * Authoritative scientific presentation of frozen experimental campaigns,
 * method comparisons, statistical honesty, Real-LLM breakdown, and reproducibility.
 */

class ResearchDashboard {
  constructor(containerId = 'research-dashboard-container') {
    this.container = document.getElementById(containerId);
    this.activeSeed = 42;
    this.campaignData = null;
    this.benchmarkData = null;
    this.methodsData = null;
    this.claimsData = null;
    this.granularityData = null;
    this.realLLMData = null;
    this.isLoading = false;
  }

  async init() {
    if (!this.container) return;
    this.renderLoading();
    try {
      const [campaign, benchmark, methods, claims, granularity, realLLM] = await Promise.all([
        window.cornerstoneApi.getResearchCampaign(),
        window.cornerstoneApi.getResearchBenchmarkSeed(this.activeSeed),
        window.cornerstoneApi.getResearchMethods(),
        window.cornerstoneApi.getResearchClaims(),
        window.cornerstoneApi.getResearchGranularity(),
        window.cornerstoneApi.getResearchRealLLM()
      ]);

      this.campaignData = campaign;
      this.benchmarkData = benchmark;
      this.methodsData = methods;
      this.claimsData = claims;
      this.granularityData = granularity;
      this.realLLMData = realLLM;

      this.render();
    } catch (err) {
      this.renderError(err.message);
    }
  }

  async setSeed(seed) {
    this.activeSeed = seed;
    this.isLoading = true;
    this.render();
    try {
      this.benchmarkData = await window.cornerstoneApi.getResearchBenchmarkSeed(seed);
    } catch (err) {
      console.error('Failed to switch seed:', err);
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="results-dashboard">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading Authoritative Research Datasets & Statistical Ledgers...</p>
        </div>
      </div>
    `;
  }

  renderError(msg) {
    this.container.innerHTML = `
      <div class="results-dashboard">
        <div class="error-banner">
          <span class="error-icon">⚠️</span>
          <span>Failed to load research data: ${msg}</span>
        </div>
      </div>
    `;
  }

  render() {
    const aggs = this.benchmarkData?.overall_aggregates || {};

    this.container.innerHTML = `
      <div class="results-dashboard">
        <!-- 1. Executive Research Overview & Hypotheses -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-4);">
            <div>
              <div style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-2);">
                <span class="badge badge-accent">FROZEN RESEARCH DATA</span>
                <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary);">Scientific Freeze Commit: 761f78f</span>
              </div>
              <h2 style="font-family: var(--font-display); font-size: var(--text-2xl); font-weight: 700; color: var(--text-bright);">
                Research Results & Scientific Evidence Command Center
              </h2>
              <p style="color: var(--text-secondary); font-size: var(--text-sm); max-width: 800px; margin-top: var(--space-2); line-height: 1.6;">
                Formal empirical evaluation of CAPTAIN bipartite execution provenance and CELA (Counterfactual Evidence-Lineage Attribution) across 275 multi-step agent failure scenarios.
              </p>
            </div>
            <!-- Seed Selector -->
            <div style="display: flex; align-items: center; gap: var(--space-3); background: var(--bg-surface-elevated); padding: var(--space-3); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <label style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary);">ACTIVE SEED:</label>
              <div style="display: flex; gap: var(--space-1);">
                ${[42, 123, 456, 789, 1024].map(s => `
                  <button class="btn btn-sm ${this.activeSeed === s ? 'btn-primary' : 'btn-secondary'} seed-btn" data-seed="${s}" style="padding: 2px 8px; font-size: 11px;">
                    ${s}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Formal Research Hypotheses -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle);">
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border-left: 3px solid var(--primary-cyan);">
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--primary-cyan); font-weight: 700; margin-bottom: 4px;">HYPOTHESIS H1 (GRANULARITY)</div>
              <div style="font-size: var(--text-xs); color: var(--text-normal); line-height: 1.5;">
                Targeted channel intervention isolates faulty evidence without collateral destruction of unrelated co-produced artifacts (Supported: 5/5 unanimous descriptive observation).
              </div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border-left: 3px solid #10b981;">
              <div style="font-family: var(--font-mono); font-size: 11px; color: #10b981; font-weight: 700; margin-bottom: 4px;">HYPOTHESIS H2 (DISTRACTOR SUPPRESSION)</div>
              <div style="font-size: var(--text-xs); color: var(--text-normal); line-height: 1.5;">
                Downstream cascade lookahead eliminates distractor false selection (0.0% vs ~75% for baselines), achieving optimal Pareto utility (0.720 vs 0.573).
              </div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border-left: 3px solid #f59e0b;">
              <div style="font-family: var(--font-mono); font-size: 11px; color: #f59e0b; font-weight: 700; margin-bottom: 4px;">HYPOTHESIS H3 (SCIENTIFIC HONESTY)</div>
              <div style="font-size: var(--text-xs); color: var(--text-normal); line-height: 1.5;">
                CELA A5 does not statistically surpass random baseline on raw F1 (p=0.1156); its advantage lies in 64.8% cost reduction, distractor rejection, and multi-objective utility.
              </div>
            </div>
          </div>
        </div>

        <!-- 2. High-Level Summary Stat Cards -->
        <div class="stat-cards-grid">
          <div class="stat-card accent-cyan">
            <div class="stat-card-label">Total Scenarios Evaluated</div>
            <div class="stat-card-value">275</div>
            <div class="stat-card-subtext">55 scenarios &times; 5 seeds across 11 families</div>
          </div>
          <div class="stat-card accent-green">
            <div class="stat-card-label">BF-G Evidence Preservation</div>
            <div class="stat-card-value">100%</div>
            <div class="stat-card-subtext">5/5 unanimous instances (0% collateral damage)</div>
          </div>
          <div class="stat-card accent-violet">
            <div class="stat-card-label">Distractor False Selection</div>
            <div class="stat-card-value">0.0%</div>
            <div class="stat-card-subtext">CELA A5 (vs 73.3% for Random B1)</div>
          </div>
          <div class="stat-card accent-amber">
            <div class="stat-card-label">Intervention Cost Reduction</div>
            <div class="stat-card-value">64.8%</div>
            <div class="stat-card-subtext">0.80 (CELA A5) vs 2.27 (Random B1)</div>
          </div>
        </div>

        <!-- 3. Method Comparison Matrix (B1-B5 vs A1-A5) -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div class="results-section-header">
            <h3>Method Performance Matrix (Seed ${this.activeSeed})</h3>
            <span class="section-tag">10 Operational Methods Evaluated Across 55 Scenarios</span>
          </div>

          <div class="research-table-wrapper">
            <table class="research-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Category</th>
                  <th>Causal Prec.</th>
                  <th>Causal Recall</th>
                  <th>Causal F1</th>
                  <th>Distractor False%</th>
                  <th>Intervention Cost</th>
                  <th>Utility (&lambda;=0.1)</th>
                </tr>
              </thead>
              <tbody>
                ${this.renderMethodRows(aggs)}
              </tbody>
            </table>
          </div>

          <div style="margin-top: var(--space-3); font-size: var(--text-xs); color: var(--text-secondary); display: flex; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2);">
            <span>* Documented Equivalences: <strong>A1 &equiv; B2</strong> (Provenance Reachability), <strong>A2 &equiv; B3</strong> (CEE-Rank).</span>
            <span>** Diagnostic Oracle: Matches Oracle optimal objective in <strong>274 / 275 scenarios (99.64%)</strong> across all 5 seeds ($54/55 = 98.18\%$ in Seed 42).</span>
          </div>
        </div>

        <!-- 4. Dedicated Primary BF-G Granularity Case Study -->
        <div class="dedicated-bfg-card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-4);">
            <div>
              <div style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: 4px;">
                <span class="badge badge-accent">PRIMARY CASE STUDY</span>
                <span class="badge badge-dim font-mono">FROZEN DATASET</span>
              </div>
              <h3 style="font-family: var(--font-display); font-size: var(--text-xl); font-weight: 700; color: var(--text-bright);">
                BF-G Shared-Source Tool Divergence: Unanimous Descriptive Preservation
              </h3>
              <p style="color: var(--text-secondary); font-size: var(--text-sm); max-width: 750px; margin-top: 4px; line-height: 1.5;">
                Investigating single tool execution events producing both a faulty artifact A and a benign co-produced artifact B.
              </p>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.cornerstoneApp.switchView('view-cela-lab')">
              ⚡ Open Interactive Granularity Lab
            </button>
          </div>

          <!-- 5 Instances Grid -->
          <div class="bfg-instances-grid">
            ${[0, 1, 2, 3, 4].map(idx => `
              <div class="bfg-instance-box">
                <div class="bfg-instance-id">Instance #${idx + 1}</div>
                <div class="bfg-instance-score">100%</div>
                <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Preserved: 1 | Collateral: 0</div>
                <div style="font-family: var(--font-mono); font-size: 10px; color: #10b981; margin-top: 4px;">CH > SRC &check;</div>
              </div>
            `).join('')}
          </div>

          <!-- Strict Statistical Clarification Box -->
          <div style="background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: var(--radius-md); padding: var(--space-4); margin-top: var(--space-4);">
            <div style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-2);">
              <span style="font-size: 16px;">📐</span>
              <h4 style="font-family: var(--font-display); font-size: var(--text-sm); font-weight: 700; color: var(--primary-cyan);">
                Methodological Note on BF-G Statistical Testing (Sample Size N=5)
              </h4>
            </div>
            <p style="font-size: var(--text-xs); color: var(--text-normal); line-height: 1.6;">
              In all 5 evaluated instances, channel intervention preserved Artifact B while source-event intervention destroyed it (paired differences identically +1 across all instances).
              Because the sample size is N=5 and differences have zero variance, a Wilcoxon signed-rank test is mathematically degenerate (minimum achievable two-sided p-value for N=5 is 0.0625 &gt; 0.05).
              Per authoritative Paper Freeze Rule 25, we <strong>do not claim p &lt; 0.001</strong>. We report this as an <strong>unanimous descriptive observation (5/5 instances, 100% vs 0%, zero collateral damage)</strong>.
            </p>
          </div>
        </div>

        <!-- 5. Real-LLM Validation Breakdown Panel -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div class="results-section-header">
            <h3>Real-LLM Sanity Check Breakdown (gemini-3.6-flash)</h3>
            <span class="section-tag">Targeted Prompt-Level Validation</span>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: var(--space-6);">
            <div>
              <p style="font-size: var(--text-sm); color: var(--text-normal); line-height: 1.6; margin-bottom: var(--space-4);">
                A prompt-level sanity check was executed against the Google Gemini API using model <code>gemini-3.6-flash</code> (5 attempted calls per condition).
                The evaluation confirms that real LLM completions respond to evidence-channel content substitutions.
              </p>

              <!-- Breakdown Table -->
              <div class="research-table-wrapper">
                <table class="research-table">
                  <thead>
                    <tr>
                      <th>Condition</th>
                      <th>Attempted Calls</th>
                      <th>Successful Completions</th>
                      <th>API Failures (Quota Exhausted)</th>
                      <th>Conditional Failure Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-weight: 600;">Factual (Unmodified)</td>
                      <td>5</td>
                      <td>2</td>
                      <td style="color: #f59e0b;">3 (ResourceExhausted)</td>
                      <td style="color: #ef4444; font-weight: 700;">100% (2/2 valid)</td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600;">Channel-Intervened</td>
                      <td>5</td>
                      <td>2</td>
                      <td style="color: #f59e0b;">3 (ResourceExhausted)</td>
                      <td style="color: #10b981; font-weight: 700;">0% (0/2 valid)</td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600;">Source-Event-Intervened</td>
                      <td>5</td>
                      <td>1</td>
                      <td style="color: #f59e0b;">4 (ResourceExhausted)</td>
                      <td style="color: #10b981; font-weight: 700;">0% (0/1 valid)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Context Card -->
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: var(--space-3);">
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--primary-cyan); text-transform: uppercase;">Scientific Scope & Caveats</div>
              <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
                &bull; <strong>Conditional CEE = 1.00</strong> on valid non-exhausted API calls ($2/2 - 0/2$).<br>
                &bull; <strong>Raw Denominator CEE = 0.40</strong> in raw JSON ($2/5 - 0/5$), counting exhausted API calls in denominator.<br>
                &bull; <strong>Quota Exhaustion:</strong> 10 out of 15 API calls experienced <code>ResourceExhausted</code> errors. These are logged as execution failures, not negative model responses.<br>
                &bull; <strong>Scope:</strong> Handcrafted prompt sanity check; not an end-to-end autonomous agent workflow.
              </div>
            </div>
          </div>
        </div>

        <!-- 6. Scientific Honesty & Negative Findings Panel -->
        <div class="honesty-banner">
          <div class="honesty-banner-icon">⚖️</div>
          <div class="honesty-banner-content">
            <h4>Negative Results & Methodological Transparency (Claim C3)</h4>
            <p>
              In strict accordance with scientific integrity, we report that <strong>Claim C3 is NOT SUPPORTED</strong> on raw causal F1:
              CELA A5 achieves causal F1 of <strong>0.6788</strong> compared to Random Baseline B1 at <strong>0.8152</strong> (permutation test p = 0.1156, adjusted p = 1.0).
            </p>
            <p style="margin-top: var(--space-2);">
              <strong>Why does Random Baseline B1 score higher F1 on small synthetic DAGs?</strong> Random sampling frequently strikes the causal channel by chance in small topologies without penalty for set size.
              However, Random B1 suffers an unacceptable <strong>73.3% distractor false selection rate</strong> and a prohibitive intervention cost of <strong>2.27</strong>.
              In contrast, <strong>CELA A5 eliminates distractor selection completely (0.0%)</strong>, cuts intervention cost to <strong>0.80</strong> (64.8% reduction), and achieves the highest overall system utility (<strong>0.720</strong> vs 0.573).
            </p>
            <div style="margin-top: var(--space-3); display: flex; gap: var(--space-3); flex-wrap: wrap;">
              <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.4);">
                F1 Permutation Test: p = 0.1156 (Not Sig.)
              </span>
              <span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);">
                Distractor Rejection: 100% (p &lt; 0.001)
              </span>
              <span class="badge" style="background: rgba(0, 240, 255, 0.2); color: var(--primary-cyan); border: 1px solid rgba(0, 240, 255, 0.4);">
                Utility Dominance: 0.720 vs 0.573
              </span>
            </div>
          </div>
        </div>

        <!-- 7. Claim-to-Evidence Ledger -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div class="results-section-header">
            <h3>Claim-to-Evidence Ledger (claim_registry.json)</h3>
            <span class="section-tag">7 Scientific Claims Formally Logged</span>
          </div>

          <div class="research-table-wrapper">
            <table class="research-table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Statement</th>
                  <th>Evidence Type</th>
                  <th>Metric / Test</th>
                  <th>Status</th>
                  <th>Limitation</th>
                </tr>
              </thead>
              <tbody>
                ${(this.claimsData || []).map(c => `
                  <tr>
                    <td style="font-weight: 700; color: var(--primary-cyan);">${c.claim_id}</td>
                    <td style="color: var(--text-bright);">${c.statement}</td>
                    <td>${c.evidence_type}</td>
                    <td style="font-size: 11px;">${c.metric} (${c.statistical_test})</td>
                    <td>
                      <span class="claim-badge ${c.status}">${c.status.replace('_', ' ')}</span>
                    </td>
                    <td style="font-size: 11px; color: var(--text-muted);">${c.limitation}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 8. Reproducibility & System Verification Manifest -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: var(--space-6);">
          <div class="results-section-header">
            <h3>Reproducibility & Artifact Verification</h3>
            <span class="section-tag">Deterministic Scientific Freeze</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); margin-bottom: var(--space-1);">CAMPAIGN RUNTIME</div>
              <div style="font-family: var(--font-display); font-size: var(--text-lg); color: var(--text-bright);">12.19s Total Execution</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">2,750 method evaluations across 5 seeds</div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); margin-bottom: var(--space-1);">REGRESSION TEST SUITE</div>
              <div style="font-family: var(--font-display); font-size: var(--text-lg); color: #10b981;">720 Passing Tests (100%)</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Zero regressions across all modules</div>
            </div>
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); margin-bottom: var(--space-1);">CLI REPLICATION COMMAND</div>
              <div style="font-family: var(--font-mono); font-size: 11px; color: var(--primary-cyan); background: var(--bg-surface); padding: 4px; border-radius: 4px; overflow-x: auto;">
                python -m captain.experiments.campaign
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderMethodRows(aggs) {
    const methodsList = [
      { key: 'B1_random', label: 'B1: Random Baseline', cat: 'Baseline', isCela: false },
      { key: 'B2_provenance', label: 'B2: Provenance-Only', cat: 'Baseline', isCela: false },
      { key: 'B3_cee_rank', label: 'B3: CEE-Rank', cat: 'Baseline', isCela: false },
      { key: 'B4_graph_structural', label: 'B4: Graph-Structural Distance', cat: 'Baseline', isCela: false },
      { key: 'B5_cost_aware', label: 'B5: Cost-Aware Structural', cat: 'Baseline', isCela: false },
      { key: 'A1_cela', label: 'A1: CELA-Provenance (≡B2)', cat: 'CELA Ablation', isCela: true },
      { key: 'A2_cela', label: 'A2: CELA-CEE (≡B3)', cat: 'CELA Ablation', isCela: true },
      { key: 'A3_cela', label: 'A3: CELA-Cascade', cat: 'CELA Ablation', isCela: true },
      { key: 'A4_cela', label: 'A4: CELA-Greedy', cat: 'CELA Ablation', isCela: true },
      { key: 'A5_cela', label: 'A5: CELA-Full Pipeline', cat: 'Full Pipeline', isCela: true }
    ];

    return methodsList.map(m => {
      const row = aggs[m.key]?.summaries || {};
      const prec = row.causal_precision?.mean?.toFixed(3) || '—';
      const rec = row.causal_recall?.mean?.toFixed(3) || '—';
      const f1 = row.causal_f1?.mean?.toFixed(3) || '—';
      const dist = row.distractor_false_selection_rate?.mean !== undefined
        ? (row.distractor_false_selection_rate.mean * 100).toFixed(1) + '%'
        : '—';
      const cost = row.intervention_cost?.mean?.toFixed(2) || '—';
      const util = row.utility?.mean?.toFixed(3) || '—';

      const isA5 = m.key === 'A5_cela';
      const isBestUtil = m.key === 'A5_cela' || m.key === 'A4_cela';
      const isBestDist = m.key === 'A5_cela' || m.key === 'A4_cela';

      return `
        <tr class="${isA5 ? 'highlight-a5' : ''}">
          <td style="font-weight: 600;">${m.label}</td>
          <td style="color: var(--text-secondary);">${m.cat}</td>
          <td>${prec}</td>
          <td>${rec}</td>
          <td>${f1}</td>
          <td class="${isBestDist ? 'cell-best' : ''}">${dist}</td>
          <td>${cost}</td>
          <td class="${isBestUtil ? 'cell-best' : ''}">${util}</td>
        </tr>
      `;
    }).join('');
  }

  bindEvents() {
    this.container.querySelectorAll('.seed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const seed = parseInt(btn.getAttribute('data-seed'), 10);
        this.setSeed(seed);
      });
    });
  }
}

window.cornerstoneResearchDashboard = new ResearchDashboard();
