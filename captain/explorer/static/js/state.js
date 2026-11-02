/**
 * CORNERSTONE Reactive State Manager
 * Centralized Application State & Event Dispatcher
 */

class CornerstoneState {
  constructor() {
    this._state = {
      activeSection: 'command-center',
      explanationMode: 'research', // 'simple' or 'research'
      currentRunId: null,
      currentScenarioId: null,
      selectedNode: null,
      activeFilter: { nodeType: 'all', stage: 'all', failurePathOnly: false },
      presentationMode: false,
      presentationSlide: 1,
      totalSlides: 10,
      systemStatus: {
        platform: 'CORNERSTONE',
        status: 'ONLINE',
        scientific_version: 'V2 (FROZEN)',
        total_runs: 0,
        benchmark_families: 11,
        benchmark_instances: 275,
        verified_tests: 692,
        demo_seed: 42
      },
      cachedRuns: [],
      cachedClaims: []
    };

    this._listeners = new Map();
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    const prev = this._state[key];
    this._state[key] = value;
    this.emit(`${key}Changed`, { key, value, prev });
  }

  subscribe(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this._listeners.get(event)?.delete(callback);
  }

  emit(event, data) {
    const cbs = this._listeners.get(event);
    if (cbs) {
      cbs.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in state listener for ${event}:`, err);
        }
      });
    }
  }

  // --- Convenience Actions ---
  toggleExplanationMode(forceMode = null) {
    const next = forceMode || (this._state.explanationMode === 'research' ? 'simple' : 'research');
    this._state.explanationMode = next;
    document.body.classList.toggle('mode-simple', next === 'simple');
    document.body.classList.toggle('mode-research', next === 'research');
    this.emit('explanationModeChanged', { mode: next });
  }

  setSection(sectionId) {
    if (this._state.activeSection === sectionId) return;
    const prev = this._state.activeSection;
    this._state.activeSection = sectionId;
    window.location.hash = `#${sectionId}`;
    this.emit('sectionChanged', { sectionId, prev });
  }

  togglePresentation(forceState = null) {
    const newState = forceState !== null ? forceState : !this._state.presentationMode;
    this._state.presentationMode = newState;
    if (newState) {
      document.body.classList.add('presentation-mode');
    } else {
      document.body.classList.remove('presentation-mode');
    }
    this.emit('presentationToggled', { active: newState, slide: this._state.presentationSlide });
  }

  setSlide(slideIndex) {
    const bounded = Math.max(1, Math.min(this._state.totalSlides, slideIndex));
    if (this._state.presentationSlide === bounded) return;
    this._state.presentationSlide = bounded;
    this.emit('slideChanged', { slide: bounded });
  }

  nextSlide() {
    this.setSlide(this._state.presentationSlide + 1);
  }

  prevSlide() {
    this.setSlide(this._state.presentationSlide - 1);
  }
}

// Global State Singleton
window.cornerstoneState = new CornerstoneState();
