/**
 * CORNERSTONE Interactive Agent Pipeline Visualizer
 * Animated Canvas/SVG demonstrating Agent Task Flow, Evidence Lineage,
 * Failure Localization, and Channel-Level vs Step-Level Counterfactual Intervention.
 */

class AgentPipelineVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.step = 0;
    this.totalSteps = 6;
    this.isPlaying = true;
    this.timer = null;
    this.granularityMode = 'channel'; // 'channel' (CELA) or 'step' (Coarse)
    this.failureActive = true;
    this.speedMs = 2500;
  }

  mount() {
    if (!this.container) return;
    this._renderBase();
    this._bindControls();
    this.update();
    this.play();
  }

  _renderBase() {
    this.container.innerHTML = `
      <div class="pipeline-card-header">
        <div class="pipeline-title-group">
          <h3>
            <span class="telemetry-indicator online"></span>
            Live Agent Execution & Evidence Flow Visualizer
          </h3>
          <p>Tracing information lineage through execution steps to selective counterfactual channel repair</p>
        </div>
        <div class="pipeline-controls">
          <button class="btn btn-secondary btn-sm" id="btn-pipeline-prev" title="Previous Step">◀</button>
          <button class="btn btn-secondary btn-sm" id="btn-pipeline-play" title="Play/Pause">Pause ❚❚</button>
          <button class="btn btn-secondary btn-sm" id="btn-pipeline-next" title="Next Step">▶</button>
          <div class="dock-divider"></div>
          <button class="btn btn-sm ${this.granularityMode === 'channel' ? 'btn-primary' : 'btn-secondary'}" id="btn-toggle-granularity">
            Mode: ${this.granularityMode === 'channel' ? 'CELA Channel (Fine)' : 'Source-Step (Coarse)'}
          </button>
          <button class="btn btn-sm ${this.failureActive ? 'btn-secondary' : 'btn-primary'}" id="btn-toggle-failure">
            ${this.failureActive ? 'Fault Injected ⚠' : 'Pristine Run ✓'}
          </button>
        </div>
      </div>

      <div class="pipeline-canvas-wrap">
        <svg class="pipeline-svg" id="pipeline-svg-canvas" viewBox="0 0 960 300" preserveAspectRatio="xMidYMid meet">
          <!-- Defs for markers and glows -->
          <defs>
            <marker id="arrow-cyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#00e5ff" />
            </marker>
            <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
            </marker>
            <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker id="arrow-violet" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#8b5cf6" />
            </marker>
            <filter id="cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00e5ff" flood-opacity="0.6"/>
            </filter>
            <filter id="red-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#f43f5e" flood-opacity="0.6"/>
            </filter>
          </defs>

          <!-- SVG Visual Elements will be drawn dynamically -->
          <g id="pipeline-graphic-layer"></g>
        </svg>
      </div>

      <div class="pipeline-granularity-legend">
        <div class="legend-channel-item">
          <span class="legend-color-dot cyan"></span>
          <span>Preserved Evidence Channel</span>
        </div>
        <div class="legend-channel-item">
          <span class="legend-color-dot red"></span>
          <span>Fault Propagation Path</span>
        </div>
        <div class="legend-channel-item">
          <span class="legend-color-dot violet"></span>
          <span>CELA Counterfactual Channel Repair</span>
        </div>
        <div class="legend-channel-item">
          <span class="legend-color-dot green"></span>
          <span>Recovered Success Output</span>
        </div>
        <div id="pipeline-step-narrative" class="font-mono text-cyan" style="color: var(--cyan-hover); font-weight: 600;">
          Step 1/6: Task Ingestion & Plan Synthesis
        </div>
      </div>
    `;
  }

  _bindControls() {
    const playBtn = document.getElementById('btn-pipeline-play');
    playBtn?.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
        playBtn.textContent = 'Play ▶';
      } else {
        this.play();
        playBtn.textContent = 'Pause ❚❚';
      }
    });

    document.getElementById('btn-pipeline-prev')?.addEventListener('click', () => {
      this.pause();
      this.step = (this.step - 1 + this.totalSteps) % this.totalSteps;
      this.update();
    });

    document.getElementById('btn-pipeline-next')?.addEventListener('click', () => {
      this.pause();
      this.step = (this.step + 1) % this.totalSteps;
      this.update();
    });

    const granBtn = document.getElementById('btn-toggle-granularity');
    granBtn?.addEventListener('click', () => {
      this.granularityMode = this.granularityMode === 'channel' ? 'step' : 'channel';
      granBtn.textContent = `Mode: ${this.granularityMode === 'channel' ? 'CELA Channel (Fine)' : 'Source-Step (Coarse)'}`;
      granBtn.className = `btn btn-sm ${this.granularityMode === 'channel' ? 'btn-primary' : 'btn-secondary'}`;
      this.update();
    });

    const failBtn = document.getElementById('btn-toggle-failure');
    failBtn?.addEventListener('click', () => {
      this.failureActive = !this.failureActive;
      failBtn.textContent = this.failureActive ? 'Fault Injected ⚠' : 'Pristine Run ✓';
      failBtn.className = `btn btn-sm ${this.failureActive ? 'btn-secondary' : 'btn-primary'}`;
      this.update();
    });
  }

  play() {
    this.isPlaying = true;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.step = (this.step + 1) % this.totalSteps;
      this.update();
    }, this.speedMs);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) clearInterval(this.timer);
    const playBtn = document.getElementById('btn-pipeline-play');
    if (playBtn) playBtn.textContent = 'Play ▶';
  }

  update() {
    const layer = document.getElementById('pipeline-graphic-layer');
    const narrative = document.getElementById('pipeline-step-narrative');
    if (!layer) return;

    const narratives = [
      "Stage 1/6: User Task Ingestion — Multimodal agent decomposes goal into plan.",
      "Stage 2/6: Tool Execution — Step #2 executes Shared Source Tool producing 2 distinct artifacts.",
      "Stage 3/6: Artifact Lineage — Artifact A1 (Tax Formula) and Artifact A2 (Audited Baseline) branch into channels.",
      "Stage 4/6: Failure Propagation — Corruption detected in Channel 1 (A1); Downstream Task fails.",
      this.granularityMode === 'channel'
        ? "Stage 5/6: CELA Channel Intervention — Intervening ONLY on Channel 1 replaces faulty formula. Artifact A2 remains 100% PRESERVED!"
        : "Stage 5/6: Coarse Step-Level Intervention — Re-running Step #2 modifies BOTH A1 and A2. Unrelated evidence suffers COLLATERAL DAMAGE!",
      this.granularityMode === 'channel'
        ? "Stage 6/6: Counterfactual Success — Task succeeds with 0% collateral modification across unrelated evidence!"
        : "Stage 6/6: Compromised Recovery — Failure prevented, but downstream audit corrupted due to collateral erasure."
    ];

    if (narrative) {
      narrative.textContent = narratives[this.step];
    }

    // Dynamic SVG generation
    let svgHtml = '';

    // Coordinates
    const xTask = 80, yTask = 150;
    const xPlan = 220, yPlan = 150;
    const xTool = 380, yTool = 150;
    const xArt1 = 540, yArt1 = 90;
    const xArt2 = 540, yArt2 = 210;
    const xDownstream = 730, yDownstream = 150;
    const xOutput = 890, yOutput = 150;

    // Node 1: Task In
    svgHtml += `
      <g opacity="${this.step >= 0 ? 1 : 0.3}" style="transition: opacity 0.4s ease;">
        <rect x="${xTask - 45}" y="${yTask - 28}" width="90" height="56" rx="6" fill="#0d1527" stroke="#00e5ff" stroke-width="1.5" />
        <text x="${xTask}" y="${yTask - 6}" font-family="var(--font-mono)" font-size="10" font-weight="700" fill="#00e5ff" text-anchor="middle">USER TASK</text>
        <text x="${xTask}" y="${yTask + 12}" font-family="var(--font-sans)" font-size="9" fill="#94a3b8" text-anchor="middle">Audit & Ratio</text>
      </g>
    `;

    // Connector 1 -> 2
    if (this.step >= 1) {
      svgHtml += `<line x1="${xTask + 45}" y1="${yTask}" x2="${xPlan - 45}" y2="${yPlan}" stroke="#00e5ff" stroke-width="2" marker-end="url(#arrow-cyan)" />`;
    }

    // Node 2: Planner
    svgHtml += `
      <g opacity="${this.step >= 1 ? 1 : 0.3}" style="transition: opacity 0.4s ease;">
        <rect x="${xPlan - 45}" y="${yPlan - 28}" width="90" height="56" rx="6" fill="#0d1527" stroke="${this.step >= 1 ? '#00e5ff' : '#1e2d4a'}" stroke-width="1.5" />
        <text x="${xPlan}" y="${yPlan - 6}" font-family="var(--font-mono)" font-size="10" font-weight="700" fill="#f8fafc" text-anchor="middle">PLANNER</text>
        <text x="${xPlan}" y="${yPlan + 12}" font-family="var(--font-sans)" font-size="9" fill="#94a3b8" text-anchor="middle">Decompose</text>
      </g>
    `;

    // Connector 2 -> 3
    if (this.step >= 2) {
      svgHtml += `<line x1="${xPlan + 45}" y1="${yPlan}" x2="${xTool - 45}" y2="${yTool}" stroke="#00e5ff" stroke-width="2" marker-end="url(#arrow-cyan)" />`;
    }

    // Node 3: Shared Source Tool (Step #2)
    const isStepIntervened = (this.step >= 4 && this.granularityMode === 'step');
    svgHtml += `
      <g opacity="${this.step >= 2 ? 1 : 0.3}" style="transition: opacity 0.4s ease;">
        <rect x="${xTool - 55}" y="${yTool - 34}" width="110" height="68" rx="6" fill="${isStepIntervened ? 'rgba(244,63,94,0.15)' : '#0d1527'}" stroke="${isStepIntervened ? '#f43f5e' : (this.step >= 2 ? '#38bdf8' : '#1e2d4a')}" stroke-width="${isStepIntervened ? 2.5 : 1.5}" />
        <text x="${xTool}" y="${yTool - 12}" font-family="var(--font-mono)" font-size="10" font-weight="700" fill="#38bdf8" text-anchor="middle">SHARED TOOL</text>
        <text x="${xTool}" y="${yTool + 6}" font-family="var(--font-sans)" font-size="9" fill="#f8fafc" text-anchor="middle">Step #2 (Dual Out)</text>
        <text x="${xTool}" y="${yTool + 20}" font-family="var(--font-mono)" font-size="8" fill="${isStepIntervened ? '#f43f5e' : '#64748b'}" text-anchor="middle">${isStepIntervened ? '[STEP MODIFIED]' : 'ID: tool_step_2'}</text>
      </g>
    `;

    // Connectors Tool -> Artifacts
    if (this.step >= 2) {
      // Channel 1 path (Faulty)
      const ch1Color = (this.step >= 3 && this.failureActive) ? (this.step >= 4 && this.granularityMode === 'channel' ? '#8b5cf6' : '#f43f5e') : '#00e5ff';
      const ch1Marker = (this.step >= 3 && this.failureActive) ? (this.step >= 4 && this.granularityMode === 'channel' ? 'url(#arrow-violet)' : 'url(#arrow-red)') : 'url(#arrow-cyan)';
      svgHtml += `<path d="M ${xTool + 55} ${yTool} C ${xTool + 90} ${yTool}, ${xArt1 - 70} ${yArt1}, ${xArt1 - 50} ${yArt1}" stroke="${ch1Color}" stroke-width="${this.step >= 3 ? 2.5 : 1.5}" fill="none" marker-end="${ch1Marker}" />`;

      // Channel 2 path (Unrelated / Preserved)
      const ch2Color = (isStepIntervened) ? '#f43f5e' : '#10b981';
      const ch2Marker = (isStepIntervened) ? 'url(#arrow-red)' : 'url(#arrow-green)';
      svgHtml += `<path d="M ${xTool + 55} ${yTool} C ${xTool + 90} ${yTool}, ${xArt2 - 70} ${yArt2}, ${xArt2 - 50} ${yArt2}" stroke="${ch2Color}" stroke-width="2" fill="none" marker-end="${ch2Marker}" />`;
    }

    // Node 4A: Artifact 1 (Fault channel)
    const a1Color = (this.step >= 3 && this.failureActive) ? (this.step >= 4 && this.granularityMode === 'channel' ? '#8b5cf6' : '#f43f5e') : '#00e5ff';
    svgHtml += `
      <g opacity="${this.step >= 2 ? 1 : 0.3}" style="transition: opacity 0.4s ease;">
        <ellipse cx="${xArt1}" cy="${yArt1}" rx="48" ry="24" fill="#111a2e" stroke="${a1Color}" stroke-width="${this.step >= 3 ? 2.5 : 1.5}" />
        <text x="${xArt1}" y="${yArt1 - 3}" font-family="var(--font-mono)" font-size="9" font-weight="700" fill="${a1Color}" text-anchor="middle">ARTIFACT A1</text>
        <text x="${xArt1}" y="${yArt1 + 10}" font-family="var(--font-sans)" font-size="8" fill="#cbd5e1" text-anchor="middle">${this.step >= 4 && this.granularityMode === 'channel' ? 'Fixed: Ratio Coeff' : (this.step >= 3 && this.failureActive ? 'Corrupted Coeff' : 'Ratio Formula')}</text>
      </g>
    `;

    // Node 4B: Artifact 2 (Unrelated evidence channel)
    const a2Color = isStepIntervened ? '#f43f5e' : '#10b981';
    svgHtml += `
      <g opacity="${this.step >= 2 ? 1 : 0.3}" style="transition: opacity 0.4s ease;">
        <ellipse cx="${xArt2}" cy="${yArt2}" rx="48" ry="24" fill="#111a2e" stroke="${a2Color}" stroke-width="2" />
        <text x="${xArt2}" y="${yArt2 - 3}" font-family="var(--font-mono)" font-size="9" font-weight="700" fill="${a2Color}" text-anchor="middle">ARTIFACT A2</text>
        <text x="${xArt2}" y="${yArt2 + 10}" font-family="var(--font-sans)" font-size="8" fill="#cbd5e1" text-anchor="middle">${isStepIntervened ? 'Collateral Damage!' : 'Audit Baseline (Safe)'}</text>
      </g>
    `;

    // Connectors Artifacts -> Downstream
    if (this.step >= 3) {
      const downColor = (this.step >= 3 && this.failureActive && this.step < 4) ? '#f43f5e' : (this.step >= 4 ? '#10b981' : '#00e5ff');
      const downMarker = (this.step >= 3 && this.failureActive && this.step < 4) ? 'url(#arrow-red)' : 'url(#arrow-green)';
      svgHtml += `<path d="M ${xArt1 + 48} ${yArt1} C ${xArt1 + 80} ${yArt1}, ${xDownstream - 70} ${yDownstream - 10}, ${xDownstream - 50} ${yDownstream - 10}" stroke="${downColor}" stroke-width="2" fill="none" marker-end="${downMarker}" />`;
      svgHtml += `<path d="M ${xArt2 + 48} ${yArt2} C ${xArt2 + 80} ${yArt2}, ${xDownstream - 70} ${yDownstream + 10}, ${xDownstream - 50} ${yDownstream + 10}" stroke="${a2Color}" stroke-width="2" fill="none" marker-end="${isStepIntervened ? 'url(#arrow-red)' : 'url(#arrow-green)'}" />`;
    }

    // Node 5: Downstream Consumer Event
    const isDownstreamFail = (this.step === 3 && this.failureActive);
    svgHtml += `
      <g opacity="${this.step >= 3 ? 1 : 0.3}" style="transition: opacity 0.4s ease;">
        <rect x="${xDownstream - 50}" y="${yDownstream - 28}" width="100" height="56" rx="6" fill="#0d1527" stroke="${isDownstreamFail ? '#f43f5e' : (this.step >= 4 ? '#10b981' : '#1e2d4a')}" stroke-width="${isDownstreamFail ? 2.5 : 1.5}" />
        <text x="${xDownstream}" y="${yDownstream - 6}" font-family="var(--font-mono)" font-size="10" font-weight="700" fill="#f8fafc" text-anchor="middle">REASONER</text>
        <text x="${xDownstream}" y="${yDownstream + 12}" font-family="var(--font-sans)" font-size="9" fill="${isDownstreamFail ? '#f43f5e' : '#94a3b8'}" text-anchor="middle">${isDownstreamFail ? 'CALCULATION ERROR' : 'Synthesize Final'}</text>
      </g>
    `;

    // Connector Downstream -> Output
    if (this.step >= 4) {
      const outColor = (this.granularityMode === 'channel' || !this.failureActive) ? '#10b981' : '#f59e0b';
      const outMarker = (this.granularityMode === 'channel' || !this.failureActive) ? 'url(#arrow-green)' : 'url(#arrow-cyan)';
      svgHtml += `<line x1="${xDownstream + 50}" y1="${yDownstream}" x2="${xOutput - 45}" y2="${yOutput}" stroke="${outColor}" stroke-width="2" marker-end="${outMarker}" />`;
    }

    // Node 6: Final Outcome
    const outcomeSuccess = (this.step >= 4 && (this.granularityMode === 'channel' || !this.failureActive));
    const outcomeCompromised = (this.step >= 4 && this.granularityMode === 'step' && this.failureActive);
    svgHtml += `
      <g opacity="${this.step >= 4 ? 1 : 0.3}" style="transition: opacity 0.4s ease;">
        <rect x="${xOutput - 45}" y="${yOutput - 28}" width="90" height="56" rx="6" fill="#0d1527" stroke="${outcomeSuccess ? '#10b981' : (outcomeCompromised ? '#f59e0b' : '#1e2d4a')}" stroke-width="2" />
        <text x="${xOutput}" y="${yOutput - 6}" font-family="var(--font-mono)" font-size="9" font-weight="700" fill="${outcomeSuccess ? '#10b981' : '#f59e0b'}" text-anchor="middle">${outcomeSuccess ? 'RECOVERED' : (outcomeCompromised ? 'COMPROMISED' : 'PENDING')}</text>
        <text x="${xOutput}" y="${yOutput + 12}" font-family="var(--font-sans)" font-size="8" fill="#94a3b8" text-anchor="middle">${outcomeSuccess ? 'CEE Target Met' : (outcomeCompromised ? 'Side-effects' : 'Evaluating...')}</text>
      </g>
    `;

    layer.innerHTML = svgHtml;
  }
}

window.AgentPipelineVisualizer = AgentPipelineVisualizer;
