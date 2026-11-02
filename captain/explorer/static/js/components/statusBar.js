/**
 * CORNERSTONE Top Status Bar Component
 * Mission Control Header, Live Telemetry, UTC Clock, Presentation Trigger
 */

class StatusBarComponent {
  constructor(api, state) {
    this.api = api;
    this.state = state;
    this._clockTimer = null;
  }

  mount() {
    this._initClock();
    this._initPresentationToggle();
    this._fetchTelemetry();

    // Listen for state changes
    this.state.subscribe('presentationToggled', ({ active }) => {
      const btn = document.getElementById('btn-toggle-presentation');
      if (btn) {
        btn.classList.toggle('active', active);
        btn.querySelector('.btn-label').textContent = active ? 'Exit Presentation' : 'Presentation Mode';
      }
    });

    this.state.subscribe('runChanged', ({ value }) => {
      this._updateActiveRunPill(value);
    });
  }

  _initClock() {
    const clockEl = document.getElementById('utc-clock-ticker');
    if (!clockEl) return;

    const update = () => {
      const now = new Date();
      clockEl.textContent = now.toUTCString().slice(17, 25) + ' UTC';
    };

    update();
    this._clockTimer = setInterval(update, 1000);
  }

  _initPresentationToggle() {
    const btn = document.getElementById('btn-toggle-presentation');
    if (btn) {
      btn.addEventListener('click', () => {
        this.state.togglePresentation();
      });
    }

    const exitBtn = document.getElementById('btn-exit-presentation');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => {
        this.state.togglePresentation(false);
      });
    }
  }

  async _fetchTelemetry() {
    try {
      const status = await this.api.getSystemStatus();
      this.state.set('systemStatus', status);

      const totalRunsEl = document.getElementById('telemetry-total-runs');
      if (totalRunsEl) {
        totalRunsEl.textContent = `${status.total_runs} Runs`;
      }

      const seedEl = document.getElementById('telemetry-active-seed');
      if (seedEl) {
        seedEl.textContent = `SEED: ${status.demo_seed}`;
      }
    } catch (err) {
      console.warn('Telemetry load failed, using default state:', err);
    }
  }

  _updateActiveRunPill(runId) {
    const pill = document.getElementById('active-run-pill');
    if (pill) {
      if (runId) {
        pill.textContent = `RUN: ${runId.slice(0, 12)}...`;
        pill.style.display = 'inline-flex';
      } else {
        pill.style.display = 'none';
      }
    }
  }
}

window.StatusBarComponent = StatusBarComponent;
