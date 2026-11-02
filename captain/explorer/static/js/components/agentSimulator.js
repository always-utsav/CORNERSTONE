/**
 * CORNERSTONE Agent Execution Simulator Component
 * Highly interactive step-by-step playback, event inspector, live execution via Flask backend,
 * and direct handoff to the Evidence Flow Explorer.
 */

class AgentSimulatorComponent {
  constructor(api, state) {
    this.api = api;
    this.state = state;
    this.currentRun = null;
    this.events = [];
    this.artifacts = [];
    this.currentStepIdx = 0;
    this.isPlaying = false;
    this.timer = null;
    this.playbackSpeedMs = 1500;
  }

  mount() {
    this._bindControls();
    this._loadInitialRun();

    this.state.subscribe('runChanged', ({ value }) => {
      if (value && (!this.currentRun || this.currentRun.run_id !== value)) {
        this.loadRun(value);
      }
    });
  }

  _bindControls() {
    const startBtn = document.getElementById('btn-sim-start');
    startBtn?.addEventListener('click', () => this.executeAgent());

    const playBtn = document.getElementById('btn-sim-play');
    playBtn?.addEventListener('click', () => this.togglePlay());

    const prevBtn = document.getElementById('btn-sim-prev');
    prevBtn?.addEventListener('click', () => this.stepTo(this.currentStepIdx - 1));

    const nextBtn = document.getElementById('btn-sim-next');
    nextBtn?.addEventListener('click', () => this.stepTo(this.currentStepIdx + 1));

    const resetBtn = document.getElementById('btn-sim-reset');
    resetBtn?.addEventListener('click', () => this.reset());

    const speedSelect = document.getElementById('select-sim-speed');
    speedSelect?.addEventListener('change', (e) => {
      const sp = parseFloat(e.target.value);
      this.playbackSpeedMs = Math.round(1500 / sp);
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });

    const presetSelect = document.getElementById('select-sim-preset');
    const taskInput = document.getElementById('input-sim-task');
    presetSelect?.addEventListener('change', (e) => {
      if (taskInput) {
        taskInput.value = e.target.value;
      }
    });

    const inspectBtn = document.getElementById('btn-sim-inspect-graph');
    inspectBtn?.addEventListener('click', () => {
      if (this.currentRun) {
        this.state.set('currentRunId', this.currentRun.run_id);
        this.state.setSection('evidence-explorer');
      }
    });
  }

  async _loadInitialRun() {
    const existingId = this.state.get('currentRunId');
    if (existingId) {
      await this.loadRun(existingId);
    } else {
      // Load latest runs from API
      try {
        const runs = await this.api.getRuns();
        if (runs.length > 0) {
          await this.loadRun(runs[0].run_id);
        }
      } catch (err) {
        console.warn('Initial run load skipped:', err);
      }
    }
  }

  async executeAgent() {
    const taskInput = document.getElementById('input-sim-task');
    const taskText = taskInput ? taskInput.value.trim() : 'What is 6 times 7? Use the calculator.';
    const startBtn = document.getElementById('btn-sim-start');

    try {
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerHTML = '<span class="telemetry-indicator busy"></span> Executing...';
      }
      this._appendTerminal(`[AGENT START] Ingesting task: "${taskText.slice(0, 60)}..."`, 'cyan');

      const runSummary = await this.api.runDemo(taskText);
      this.state.set('currentRunId', runSummary.run_id);
      await this.loadRun(runSummary.run_id);

      this._appendTerminal(`[AGENT SUCCESS] Trace completed: ${runSummary.event_count} events generated.`, 'green');
      this.play();
    } catch (err) {
      this._appendTerminal(`[EXECUTION ERROR] ${err.message}`, 'red');
    } finally {
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.innerHTML = '<span>▶</span> Run Execution';
      }
    }
  }

  async loadRun(runId) {
    try {
      const runDetail = await this.api.getRun(runId);
      this.currentRun = runDetail;
      this.events = runDetail.events || [];
      this.artifacts = runDetail.artifacts || [];
      this.currentStepIdx = 0;

      // Update Run ID Badge
      const idBadge = document.getElementById('sim-current-run-id');
      if (idBadge) idBadge.textContent = runDetail.run_id;

      this._renderTimeline();
      this.stepTo(0);
    } catch (err) {
      console.error('Failed to load run detail:', err);
    }
  }

  _renderTimeline() {
    const timelineEl = document.getElementById('sim-timeline-strip');
    if (!timelineEl) return;

    timelineEl.innerHTML = '';
    this.events.forEach((evt, idx) => {
      const stepNode = document.createElement('div');
      stepNode.className = `timeline-step-node ${idx === 0 ? 'active' : ''}`;
      stepNode.id = `sim-step-${idx}`;
      stepNode.innerHTML = `
        <span>#${evt.sequence_number}</span>
        <span>${evt.event_type}</span>
      `;
      stepNode.addEventListener('click', () => {
        this.pause();
        this.stepTo(idx);
      });
      timelineEl.appendChild(stepNode);
    });
  }

  stepTo(idx) {
    if (this.events.length === 0) return;
    const bounded = Math.max(0, Math.min(this.events.length - 1, idx));
    this.currentStepIdx = bounded;

    // Update timeline node classes
    this.events.forEach((_, i) => {
      const node = document.getElementById(`sim-step-${i}`);
      if (node) {
        node.classList.toggle('active', i === bounded);
        node.classList.toggle('completed', i < bounded);
      }
    });

    // Scroll active timeline node into view
    const activeNode = document.getElementById(`sim-step-${bounded}`);
    activeNode?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    // Render Event Inspector
    this._renderActiveEvent(this.events[bounded]);

    // Update Counter
    const counter = document.getElementById('sim-step-counter');
    if (counter) counter.textContent = `Step ${bounded + 1} of ${this.events.length}`;

    // If at end during play, pause
    if (bounded === this.events.length - 1 && this.isPlaying) {
      this.pause();
    }
  }

  _renderActiveEvent(evt) {
    const container = document.getElementById('sim-active-event-container');
    if (!container || !evt) return;

    const payloadStr = typeof evt.payload === 'object'
      ? JSON.stringify(evt.payload, null, 2)
      : String(evt.payload || 'No payload');

    container.innerHTML = `
      <div class="sim-event-card">
        <div class="sim-event-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge badge-live">EVENT #${evt.sequence_number}</span>
            <span class="font-mono" style="font-weight:700; color:var(--cyan-primary);">${evt.event_type}</span>
          </div>
          <span class="font-mono" style="font-size:10px; color:var(--text-dim);">${evt.event_id}</span>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:10px;">
          <div>
            <div class="inspector-field-label">Component</div>
            <div class="font-mono" style="color:var(--text-secondary);">${evt.component || 'core.agent'}</div>
          </div>
          <div>
            <div class="inspector-field-label">Inputs</div>
            <div class="font-mono" style="color:var(--text-secondary);">${evt.input_artifact_ids?.length || 0} Artifact(s)</div>
          </div>
          <div>
            <div class="inspector-field-label">Outputs</div>
            <div class="font-mono" style="color:var(--text-secondary);">${evt.output_artifact_ids?.length || 0} Artifact(s)</div>
          </div>
        </div>

        <div>
          <div class="inspector-field-label">Payload Data</div>
          <div class="sim-event-payload">${payloadStr}</div>
        </div>
      </div>
    `;

    // Append terminal line
    this._appendTerminal(`[EVENT #${evt.sequence_number}] ${evt.component} -> ${evt.event_type}`);
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.currentStepIdx >= this.events.length - 1) {
      this.currentStepIdx = 0;
    }
    this.isPlaying = true;
    const playBtn = document.getElementById('btn-sim-play');
    if (playBtn) playBtn.innerHTML = '<span>❚❚</span> Pause';

    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.currentStepIdx < this.events.length - 1) {
        this.stepTo(this.currentStepIdx + 1);
      } else {
        this.pause();
      }
    }, this.playbackSpeedMs);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) clearInterval(this.timer);
    const playBtn = document.getElementById('btn-sim-play');
    if (playBtn) playBtn.innerHTML = '<span>▶</span> Play';
  }

  reset() {
    this.pause();
    this.stepTo(0);
    this._appendTerminal('[SIMULATOR] Reset timeline to step #0.');
  }

  _appendTerminal(msg, color = 'dim') {
    const term = document.getElementById('sim-terminal-log');
    if (!term) return;

    const line = document.createElement('div');
    line.className = `sim-terminal-line ${color}`;
    const timestamp = new Date().toTimeString().slice(0, 8);
    line.textContent = `[${timestamp}] ${msg}`;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  }
}

window.AgentSimulatorComponent = AgentSimulatorComponent;
