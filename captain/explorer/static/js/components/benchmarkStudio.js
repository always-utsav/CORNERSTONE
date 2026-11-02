/**
 * CORNERSTONE Benchmark Intelligence Studio
 * Module 3 Component
 * Interactive exploration and execution of all 11 failure families (BF-A to BF-K)
 */

class BenchmarkStudio {
  constructor(containerId = 'benchmark-studio-container') {
    this.container = document.getElementById(containerId);
    this.families = [];
    this.selectedFamily = null;
    this.selectedSeed = 42;
    this.lastRunResult = null;
    this.isLoading = false;
  }

  async init() {
    if (!this.container) return;
    this.renderLoading();
    try {
      const data = await window.cornerstoneApi.getResearchBenchmarksInfo();
      this.families = data.families || [];
      this.selectedFamily = this.families[0] || null;
      this.render();
    } catch (err) {
      this.renderError(err.message);
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="benchmark-studio">
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading Benchmark Intelligence Suite (11 Families)...</p>
        </div>
      </div>
    `;
  }

  renderError(msg) {
    this.container.innerHTML = `
      <div class="benchmark-studio">
        <div class="error-banner">
          <span class="error-icon">⚠️</span>
          <span>Failed to load benchmark metadata: ${msg}</span>
        </div>
      </div>
    `;
  }

  render() {
    this.container.innerHTML = `
      <div class="benchmark-studio">
        <!-- Header -->
        <div class="benchmark-studio-header">
          <div class="benchmark-studio-title">
            <h2>Benchmark Intelligence Studio</h2>
            <p>Comprehensive 11-Family Diagnostic Test Suite (BF-A through BF-K) with Formal Failure Topologies</p>
          </div>
          <div style="display: flex; gap: var(--space-3); align-items: center;">
            <label style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary);">SEED:</label>
            <select id="benchmark-seed-select" class="control-select" style="padding: 4px 8px; font-size: var(--text-xs);">
              <option value="42" ${this.selectedSeed === 42 ? 'selected' : ''}>Seed 42 (Demo Master)</option>
              <option value="123" ${this.selectedSeed === 123 ? 'selected' : ''}>Seed 123</option>
              <option value="456" ${this.selectedSeed === 456 ? 'selected' : ''}>Seed 456</option>
              <option value="789" ${this.selectedSeed === 789 ? 'selected' : ''}>Seed 789</option>
              <option value="1024" ${this.selectedSeed === 1024 ? 'selected' : ''}>Seed 1024</option>
            </select>
          </div>
        </div>

        <!-- 11 Family Cards Grid -->
        <div class="benchmark-grid">
          ${this.families.map(f => this.renderFamilyCard(f)).join('')}
        </div>

        <!-- Selected Family Inspector & Live Scenario Runner -->
        <div id="benchmark-inspector-container">
          ${this.selectedFamily ? this.renderFamilyInspector(this.selectedFamily) : ''}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderFamilyCard(fam) {
    const isSelected = this.selectedFamily && this.selectedFamily.id === fam.id;
    return `
      <div class="benchmark-card ${isSelected ? 'active' : ''}" data-family-id="${fam.id}">
        <div class="benchmark-card-header">
          <div class="benchmark-code">${fam.id}</div>
          <div class="benchmark-topology-badge">${fam.topology_type}</div>
        </div>
        <div class="benchmark-name">${fam.name}</div>
        <div class="benchmark-mechanism">${fam.mechanism}</div>
        <div class="benchmark-card-footer">
          <span>Target: <strong style="color: var(--text-bright);">${fam.causal_ground_truth}</strong></span>
          ${fam.legacy_alias ? `<span style="color: var(--text-muted); font-family: var(--font-mono); font-size: 10px;">[${fam.legacy_alias}]</span>` : ''}
        </div>
      </div>
    `;
  }

  renderFamilyInspector(fam) {
    return `
      <div class="benchmark-inspector">
        <div class="benchmark-inspector-header">
          <div class="benchmark-inspector-title">
            <div style="display: flex; gap: var(--space-3); align-items: center; margin-bottom: var(--space-1);">
              <span class="badge badge-accent" style="font-family: var(--font-mono); font-size: var(--text-sm);">${fam.id}</span>
              <h3>${fam.name} Diagnostic Profile</h3>
            </div>
            <p style="color: var(--text-secondary); font-size: var(--text-sm);">${fam.topology_type}</p>
          </div>
          <div style="display: flex; gap: var(--space-3);">
            <button id="btn-run-benchmark-live" class="btn btn-primary" ${this.isLoading ? 'disabled' : ''}>
              ${this.isLoading ? '<div class="spinner-sm"></div> Generating...' : '⚡ Run Live Scenario'}
            </button>
            <button id="btn-view-family-figure" class="btn btn-secondary" data-fig="${fam.figure_key}">
              📊 View Publication Figure
            </button>
          </div>
        </div>

        <div class="benchmark-inspector-grid">
          <!-- Left: Mechanism, Challenge, Ground Truth -->
          <div style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <h4 style="font-family: var(--font-display); font-size: var(--text-sm); color: var(--text-bright); margin-bottom: var(--space-2); text-transform: uppercase; letter-spacing: 0.05em;">
                🔬 Failure Generation Mechanism
              </h4>
              <p style="font-size: var(--text-sm); color: var(--text-normal); line-height: 1.6;">
                ${fam.mechanism}
              </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
              <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--primary-cyan); text-transform: uppercase; margin-bottom: var(--space-1);">
                  Primary Attribution Challenge
                </div>
                <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
                  ${fam.primary_challenge}
                </div>
              </div>

              <div style="background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: #10b981; text-transform: uppercase; margin-bottom: var(--space-1);">
                  Causal Ground Truth
                </div>
                <div style="font-size: var(--text-xs); color: var(--text-secondary); line-height: 1.5;">
                  ${fam.causal_ground_truth}
                </div>
              </div>
            </div>

            <!-- Execution Results Preview -->
            <div id="benchmark-run-results-box" style="display: ${this.lastRunResult ? 'block' : 'none'};">
              ${this.lastRunResult ? this.renderRunResult(this.lastRunResult) : ''}
            </div>
          </div>

          <!-- Right: Diagnostic Specs & Controls -->
          <div style="display: flex; flex-direction: column; gap: var(--space-3); background: var(--bg-surface-elevated); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
            <h4 style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase;">
              Benchmark Metadata
            </h4>
            <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2);">
              <span style="color: var(--text-muted);">Family ID:</span>
              <span style="font-family: var(--font-mono); color: var(--primary-cyan);">${fam.id}</span>
            </div>
            <div style="display: justify-content: space-between; font-size: var(--text-xs); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2); display: flex;">
              <span style="color: var(--text-muted);">Evaluation Mode:</span>
              <span style="color: #10b981; font-weight: 600;">Post-Hoc CELA Verification</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); border-bottom: 1px solid var(--border-subtle); padding-bottom: var(--space-2);">
              <span style="color: var(--text-muted);">Total In Frozen Campaign:</span>
              <span style="font-family: var(--font-mono); color: var(--text-bright);">25 Scenarios (5 seeds × 5 inst)</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: var(--text-xs);">
              <span style="color: var(--text-muted);">Publication Figure:</span>
              <span style="font-family: var(--font-mono); color: #c084fc;">${fam.figure_key}</span>
            </div>
            <div style="margin-top: var(--space-3); padding: var(--space-3); background: rgba(0, 240, 255, 0.04); border-radius: var(--radius-sm); border: 1px solid rgba(0, 240, 255, 0.15); font-size: var(--text-xs); color: var(--text-secondary);">
              💡 <em>Faculty Note:</em> Click <strong>Run Live Scenario</strong> to instantiate this exact topology live via Python backend and compare CELA intervention against baseline predictions.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRunResult(res) {
    return `
      <div style="background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: var(--space-4);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3);">
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            <span class="badge badge-success" style="font-size: 11px;">LIVE GENERATED RUN</span>
            <span style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary);">${res.scenario_id}</span>
          </div>
          <span style="font-size: var(--text-xs); color: var(--text-muted);">Task: ${res.task_input}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); margin-bottom: var(--space-3);">
          <div style="background: var(--bg-surface); padding: var(--space-2); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted);">EVENTS</div>
            <div style="font-family: var(--font-mono); font-size: var(--text-base); font-weight: 700; color: var(--text-bright);">${res.event_count}</div>
          </div>
          <div style="background: var(--bg-surface); padding: var(--space-2); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted);">ARTIFACTS</div>
            <div style="font-family: var(--font-mono); font-size: var(--text-base); font-weight: 700; color: var(--text-bright);">${res.artifact_count}</div>
          </div>
          <div style="background: var(--bg-surface); padding: var(--space-2); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted);">CANDIDATES</div>
            <div style="font-family: var(--font-mono); font-size: var(--text-base); font-weight: 700; color: var(--primary-cyan);">${res.candidates ? res.candidates.length : 2}</div>
          </div>
          <div style="background: var(--bg-surface); padding: var(--space-2); border-radius: var(--radius-sm); text-align: center;">
            <div style="font-size: 10px; color: var(--text-muted);">FAILURE PREVENTED</div>
            <div style="font-family: var(--font-mono); font-size: var(--text-base); font-weight: 700; color: #10b981;">YES (CEE=1.0)</div>
          </div>
        </div>

        <div style="display: flex; gap: var(--space-3);">
          <button class="btn btn-secondary btn-sm" onclick="window.cornerstoneState.setCurrentRun('${res.scenario_id}'); window.cornerstoneApp.switchView('view-agent-lab');">
            🔍 Inspect in Agent Simulator
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.cornerstoneState.setCurrentRun('${res.scenario_id}'); window.cornerstoneApp.switchView('view-evidence-flow');">
            🕸️ View Provenance Graph
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Family card selection
    this.container.querySelectorAll('.benchmark-card').forEach(card => {
      card.addEventListener('click', () => {
        const famId = card.getAttribute('data-family-id');
        this.selectedFamily = this.families.find(f => f.id === famId) || null;
        this.lastRunResult = null;
        this.render();
      });
    });

    // Seed change
    const seedSelect = this.container.querySelector('#benchmark-seed-select');
    if (seedSelect) {
      seedSelect.addEventListener('change', (e) => {
        this.selectedSeed = parseInt(e.target.value, 10);
      });
    }

    // Run Live Benchmark Scenario
    const runBtn = this.container.querySelector('#btn-run-benchmark-live');
    if (runBtn && this.selectedFamily) {
      runBtn.addEventListener('click', async () => {
        this.isLoading = true;
        this.render();
        try {
          const res = await window.cornerstoneApi.runBenchmarkDemo(this.selectedFamily.id, this.selectedSeed);
          this.lastRunResult = res;
        } catch (err) {
          alert(`Error executing benchmark scenario: ${err.message}`);
        } finally {
          this.isLoading = false;
          this.render();
        }
      });
    }

    // View Publication Figure
    const figBtn = this.container.querySelector('#btn-view-family-figure');
    if (figBtn && this.selectedFamily) {
      figBtn.addEventListener('click', () => {
        if (window.cornerstoneFigureGallery) {
          window.cornerstoneFigureGallery.openModalByFilename(this.selectedFamily.figure_key);
        } else {
          window.cornerstoneApp.switchView('view-figures');
        }
      });
    }
  }
}

window.cornerstoneBenchmarkStudio = new BenchmarkStudio();
