/**
 * CORNERSTONE Failure Cascade Lab Component
 * Multi-hop error propagation, interactive cost-utility trade-off slider (\lambda),
 * and greedy channel selection vs post-hoc oracle comparison.
 */

class FailureCascadeLab {
  constructor(api, state) {
    this.api = api;
    this.state = state;
    this.lambdaCost = 1.0;
    this.selectedFamily = 'BF-D'; // 2-hop cascade
    this.costUtilityData = null;
    this.cascadeData = null;
  }

  mount() {
    this._bindControls();
    this._loadData();
  }

  _bindControls() {
    const slider = document.getElementById('slider-lambda-cost');
    const valLabel = document.getElementById('label-lambda-val');
    slider?.addEventListener('input', (e) => {
      this.lambdaCost = parseFloat(e.target.value);
      if (valLabel) valLabel.textContent = `λ = ${this.lambdaCost.toFixed(1)}`;
      this._updateCascadeVisualization();
    });

    const familySelect = document.getElementById('select-cascade-family');
    familySelect?.addEventListener('change', (e) => {
      this.selectedFamily = e.target.value;
      this._updateCascadeVisualization();
    });

    const runBtn = document.getElementById('btn-run-cascade-analysis');
    runBtn?.addEventListener('click', async () => {
      try {
        runBtn.disabled = true;
        runBtn.innerHTML = '<span class="telemetry-indicator busy"></span> Optimizing...';
        await this.api.runBenchmarkDemo(this.selectedFamily, 42);
        this._updateCascadeVisualization();
      } catch (err) {
        console.error('Cascade run failed:', err);
      } finally {
        runBtn.disabled = false;
        runBtn.innerHTML = '<span>⚡</span> Evaluate Cascade Optimization';
      }
    });
  }

  async _loadData() {
    try {
      const [costRes, cascadeRes] = await Promise.all([
        this.api.getResearchCostUtility().catch(() => null),
        this.api.getResearchCascade().catch(() => null)
      ]);
      this.costUtilityData = costRes;
      this.cascadeData = cascadeRes;
      this._updateCascadeVisualization();
    } catch (err) {
      console.warn('Cascade data load skipped:', err);
    }
  }

  _updateCascadeVisualization() {
    const stage = document.getElementById('cascade-canvas-stage');
    if (!stage) return;

    // SVG showing multi-hop propagation
    const is3Hop = this.selectedFamily === 'BF-E';
    const xRoot = 60, yRoot = 120;
    const xHop1 = 180, yHop1 = 120;
    const xHop2 = 300, yHop2 = 120;
    const xHop3 = 420, yHop3 = 120;

    // Determine intervention status based on lambda
    // Low lambda -> early root intervention; High lambda -> late intervention
    const isRootIntervened = this.lambdaCost <= 2.0;

    let svgHtml = `
      <svg viewBox="0 0 480 240" style="width:100%; height:100%;">
        <defs>
          <marker id="casc-arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
          </marker>
          <marker id="casc-arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
          <marker id="casc-arr-violet" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
          </marker>
        </defs>

        <!-- Root Tool Event -->
        <rect x="${xRoot - 40}" y="${yRoot - 26}" width="80" height="52" rx="6" fill="#0d1527" stroke="${isRootIntervened ? '#8b5cf6' : '#f43f5e'}" stroke-width="${isRootIntervened ? 2.5 : 1.5}" />
        <text x="${xRoot}" y="${yRoot - 6}" font-family="var(--font-mono)" font-size="8" font-weight="700" fill="${isRootIntervened ? '#8b5cf6' : '#f43f5e'}" text-anchor="middle">ROOT CAUSE</text>
        <text x="${xRoot}" y="${yRoot + 10}" font-family="var(--font-sans)" font-size="8" fill="#cbd5e1" text-anchor="middle">${isRootIntervened ? '[CELA REPAIRED]' : 'Tool Fault'}</text>

        <!-- Connector Root -> Hop 1 -->
        <line x1="${xRoot + 40}" y1="${yRoot}" x2="${xHop1 - 40}" y2="${yHop1}" stroke="${isRootIntervened ? '#10b981' : '#f43f5e'}" stroke-width="2" marker-end="${isRootIntervened ? 'url(#casc-arr-green)' : 'url(#casc-arr-red)'}" />

        <!-- Hop 1: Intermediate Memory -->
        <ellipse cx="${xHop1}" cy="${yHop1}" rx="38" ry="24" fill="#111a2e" stroke="${isRootIntervened ? '#10b981' : '#f43f5e'}" stroke-width="1.5" />
        <text x="${xHop1}" y="${yHop1 - 3}" font-family="var(--font-mono)" font-size="8" font-weight="700" fill="${isRootIntervened ? '#10b981' : '#f43f5e'}" text-anchor="middle">HOP 1</text>
        <text x="${xHop1}" y="${yHop1 + 9}" font-family="var(--font-sans)" font-size="8" fill="#94a3b8" text-anchor="middle">Memory State</text>

        <!-- Connector Hop 1 -> Hop 2 -->
        <line x1="${xHop1 + 38}" y1="${yHop1}" x2="${xHop2 - 40}" y2="${yHop2}" stroke="${isRootIntervened ? '#10b981' : '#f43f5e'}" stroke-width="2" marker-end="${isRootIntervened ? 'url(#casc-arr-green)' : 'url(#casc-arr-red)'}" />

        <!-- Hop 2: Reasoner Transformation -->
        <rect x="${xHop2 - 40}" y="${yHop2 - 26}" width="80" height="52" rx="6" fill="#0d1527" stroke="${isRootIntervened ? '#10b981' : '#f43f5e'}" stroke-width="1.5" />
        <text x="${xHop2}" y="${yHop2 - 6}" font-family="var(--font-mono)" font-size="8" font-weight="700" fill="${isRootIntervened ? '#10b981' : '#f43f5e'}" text-anchor="middle">HOP 2</text>
        <text x="${xHop2}" y="${yHop2 + 10}" font-family="var(--font-sans)" font-size="8" fill="#cbd5e1" text-anchor="middle">Derived Artifact</text>

        <!-- Connector Hop 2 -> Terminal -->
        <line x1="${xHop2 + 40}" y1="${yHop2}" x2="${xHop3 - 40}" y2="${yHop3}" stroke="${isRootIntervened ? '#10b981' : '#f43f5e'}" stroke-width="2" marker-end="${isRootIntervened ? 'url(#casc-arr-green)' : 'url(#casc-arr-red)'}" />

        <!-- Terminal Output -->
        <rect x="${xHop3 - 40}" y="${yHop3 - 26}" width="80" height="52" rx="6" fill="#0d1527" stroke="${isRootIntervened ? '#10b981' : '#f43f5e'}" stroke-width="2" />
        <text x="${xHop3}" y="${yHop3 - 6}" font-family="var(--font-mono)" font-size="8" font-weight="700" fill="${isRootIntervened ? '#10b981' : '#f43f5e'}" text-anchor="middle">TERMINAL</text>
        <text x="${xHop3}" y="${yHop3 + 10}" font-family="var(--font-sans)" font-size="8" fill="#94a3b8" text-anchor="middle">${isRootIntervened ? 'SUCCESS' : 'CASCADE CRASH'}</text>
      </svg>
    `;

    stage.innerHTML = svgHtml;

    // Update Decision Summary
    const decisionEl = document.getElementById('cascade-decision-summary');
    if (decisionEl) {
      decisionEl.innerHTML = `
        <div class="inspector-field-label">Greedy Optimizer Selection (λ = ${this.lambdaCost.toFixed(1)})</div>
        <div style="font-size:12px; color:var(--text-primary); margin-top:4px;">
          ${isRootIntervened
            ? '<strong>Intervene on Root Cause Tool (Cost = 1.0):</strong> Prevents entire 3-hop cascade with maximum downstream utility.'
            : '<strong>High-Cost Penalty Mode:</strong> Conservative threshold prevents aggressive intervention on upstream root.'}
        </div>
      `;
    }
  }
}

window.FailureCascadeLab = FailureCascadeLab;
