/**
 * CORNERSTONE API Client
 * Scientific REST Communication Layer for Flask Explorer Backend
 */

class CornerstoneAPI {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this._cache = new Map();
  }

  async _fetch(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMsg = errorBody.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (err) {
      console.error(`[API Error] ${options.method || 'GET'} ${endpoint}:`, err);
      throw err;
    }
  }

  // --- Live Agent Execution & Tracing ---
  async runDemo(taskText = null) {
    const body = taskText ? JSON.stringify({ task: taskText }) : undefined;
    return await this._fetch('/api/demo', {
      method: 'POST',
      body
    });
  }

  async getRuns() {
    return await this._fetch('/api/runs');
  }

  async getRun(runId) {
    return await this._fetch(`/api/run/${encodeURIComponent(runId)}`);
  }

  async getGraph(runId) {
    return await this._fetch(`/api/graph/${encodeURIComponent(runId)}`);
  }

  async getEvent(runId, eventId) {
    return await this._fetch(`/api/event/${encodeURIComponent(runId)}/${encodeURIComponent(eventId)}`);
  }

  async getArtifact(runId, artifactId) {
    return await this._fetch(`/api/artifact/${encodeURIComponent(runId)}/${encodeURIComponent(artifactId)}`);
  }

  async getProvenance(runId, artifactId) {
    return await this._fetch(`/api/provenance/${encodeURIComponent(runId)}/${encodeURIComponent(artifactId)}`);
  }

  // --- CELA Evidence & Failure Localizer ---
  async getEvidence(runId) {
    return await this._fetch(`/api/evidence/${encodeURIComponent(runId)}`);
  }

  async getFailure(runId) {
    return await this._fetch(`/api/failure/${encodeURIComponent(runId)}`);
  }

  // --- Benchmark Demo & Counterfactual Evaluation ---
  async runBenchmarkDemo(family = 'BF-A', seed = 42) {
    return await this._fetch('/api/demo/benchmark', {
      method: 'POST',
      body: JSON.stringify({ family, seed })
    });
  }

  // --- Live CELA Granularity Comparison (BF-G) ---
  async runGranularityLive(seed = 42) {
    return await this._fetch('/api/granularity/run', {
      method: 'POST',
      body: JSON.stringify({ seed })
    });
  }

  async getCounterfactual(scenarioId) {
    return await this._fetch(`/api/counterfactual/${encodeURIComponent(scenarioId)}`);
  }

  async getCascade(scenarioId) {
    return await this._fetch(`/api/cascade/${encodeURIComponent(scenarioId)}`);
  }

  // --- Controlled Live Experiments ---
  async runExperiment(config = {}) {
    return await this._fetch('/api/experiment', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  }

  async getExperimentSummary() {
    return await this._fetch('/api/experiment/summary');
  }

  async exportExperiment() {
    return await this._fetch('/api/experiment/export', { method: 'POST' });
  }

  // --- Frozen Research Datasets (V2 Scientific Freeze) ---
  async getResearchCampaign() {
    return await this._fetch('/api/research/campaign');
  }

  async getResearchGranularity() {
    return await this._fetch('/api/research/granularity');
  }

  async getResearchNegativeControls() {
    return await this._fetch('/api/research/negative_controls');
  }

  async getResearchConvergence() {
    return await this._fetch('/api/research/convergence');
  }

  async getResearchRealLLM() {
    return await this._fetch('/api/research/real_llm');
  }

  async getResearchClaims() {
    return await this._fetch('/api/research/claims');
  }

  async getResearchCascade() {
    return await this._fetch('/api/research/cascade');
  }

  async getResearchCostUtility() {
    return await this._fetch('/api/research/cost_utility');
  }

  async getResearchPathwayStress() {
    return await this._fetch('/api/research/pathway_stress');
  }

  async getResearchScalability() {
    return await this._fetch('/api/research/scalability');
  }

  async getResearchManifest() {
    return await this._fetch('/api/research/manifest');
  }

  async getResearchBenchmarkSeed(seed = 42) {
    return await this._fetch(`/api/research/benchmark/${seed}`);
  }

  async getResearchBenchmarksInfo() {
    return await this._fetch('/api/research/benchmarks/info');
  }

  async getResearchMethods() {
    return await this._fetch('/api/research/methods');
  }

  async getResearchFiguresCatalog() {
    return await this._fetch('/api/research/figures');
  }

  getFigureUrl(figureName) {
    return `/api/research/figures/${encodeURIComponent(figureName)}`;
  }

  // --- Platform Telemetry ---
  async getSystemStatus() {
    return await this._fetch('/api/system/status');
  }
}

// Global API Singleton
window.cornerstoneApi = new CornerstoneAPI();
