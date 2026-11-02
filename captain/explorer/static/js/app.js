/**
 * CORNERSTONE Master Application Bootstrap
 * Orchestrates API, Reactive State, Components, Event Routing, and Live Telemetry
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[CORNERSTONE] Initializing Platform Architecture...');

  const api = window.cornerstoneApi;
  const state = window.cornerstoneState;

  // 1. Mount Status Bar
  const statusBar = new StatusBarComponent(api, state);
  statusBar.mount();

  // 2. Mount Navigation Controller
  const nav = new NavComponent(state);
  nav.mount();

  // 3. Mount Explanation System (Simple vs Research toggle & tooltips)
  const explanation = new ExplanationSystem(state);
  explanation.mount();

  // 4. Mount Interactive Agent Pipeline Visualizer on Command Center
  const pipelineVisualizer = new AgentPipelineVisualizer('hero-pipeline-container');
  pipelineVisualizer.mount();

  // 5. Mount Presentation Mode Controller
  const presentation = new PresentationController(state);
  presentation.mount();

  // 6. Mount Laboratory Components
  const agentSim = new AgentSimulatorComponent(api, state);
  agentSim.mount();

  const evidenceExp = new EvidenceExplorerComponent(api, state);
  evidenceExp.mount();

  const celaLab = new CELAInterventionLab(api, state);
  celaLab.mount();

  const cascadeLab = new FailureCascadeLab(api, state);
  cascadeLab.mount();

  // 7. Mount Module 3 Research & Benchmark Components
  if (window.cornerstoneBenchmarkStudio) {
    window.cornerstoneBenchmarkStudio.init();
  }
  if (window.cornerstoneFigureGallery) {
    window.cornerstoneFigureGallery.init();
  }
  if (window.cornerstoneResearchDashboard) {
    window.cornerstoneResearchDashboard.init();
  }
  if (window.cornerstoneMethodologyExplorer) {
    window.cornerstoneMethodologyExplorer.init();
  }

  // Expose global app helper
  window.cornerstoneApp = {
    switchView: (sectionId) => {
      const cleanId = sectionId.replace('view-', '');
      state.setSection(cleanId);
    }
  };

  // 8. Connect Command Center Quick Action Triggers
  _bindQuickActions(api, state);

  // 9. Bootstrap Initial Telemetry & Research Highlights
  await _bootstrapResearchHighlights(api, state);

  console.log('[CORNERSTONE] Platform Initialized Successfully.');
});

function _bindQuickActions(api, state) {
  // Live Agent Demo Trigger
  const demoBtn = document.getElementById('btn-action-run-demo');
  if (demoBtn) {
    demoBtn.addEventListener('click', async () => {
      const origText = demoBtn.innerHTML;
      try {
        demoBtn.disabled = true;
        demoBtn.innerHTML = '<span class="telemetry-indicator busy"></span> Executing Agent...';
        const result = await api.runDemo();
        state.set('currentRunId', result.run_id);
        _showToast(`Demo Run ${result.run_id.slice(0, 8)} completed with ${result.event_count} events!`);
        // Refresh runs list
        const runs = await api.getRuns();
        state.set('cachedRuns', runs);
      } catch (err) {
        _showToast(`Execution failed: ${err.message}`, 'error');
      } finally {
        demoBtn.disabled = false;
        demoBtn.innerHTML = origText;
      }
    });
  }

  // Benchmark Demo Trigger
  const benchBtn = document.getElementById('btn-action-benchmark-demo');
  if (benchBtn) {
    benchBtn.addEventListener('click', async () => {
      const origText = benchBtn.innerHTML;
      try {
        benchBtn.disabled = true;
        benchBtn.innerHTML = '<span class="telemetry-indicator busy"></span> Evaluating BF-A...';
        const result = await api.runBenchmarkDemo();
        state.set('currentScenarioId', result.scenario_id);
        _showToast(`Benchmark ${result.scenario_id} evaluated with ${result.candidates.length} candidates!`);
      } catch (err) {
        _showToast(`Benchmark failed: ${err.message}`, 'error');
      } finally {
        benchBtn.disabled = false;
        benchBtn.innerHTML = origText;
      }
    });
  }
}

async function _bootstrapResearchHighlights(api, state) {
  try {
    const claims = await api.getResearchClaims();
    state.set('cachedClaims', claims);

    // Populate claims count
    const claimsEl = document.getElementById('highlight-total-claims');
    if (claimsEl) claimsEl.textContent = `${claims.length} Registered`;

    // Populate runs
    const runs = await api.getRuns();
    state.set('cachedRuns', runs);
    if (runs.length > 0 && !state.get('currentRunId')) {
      state.set('currentRunId', runs[0].run_id);
    }
  } catch (err) {
    console.warn('Initial bootstrap non-critical error:', err);
  }
}

function _showToast(message, type = 'info') {
  let toastContainer = document.getElementById('cornerstone-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'cornerstone-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const isErr = type === 'error';
  toast.style.cssText = `
    background: ${isErr ? 'rgba(244,63,94,0.95)' : 'rgba(13,21,39,0.95)'};
    color: ${isErr ? '#fff' : 'var(--text-primary)'};
    border: 1px solid ${isErr ? '#f43f5e' : 'var(--border-glow-cyan)'};
    box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    font-family: var(--font-sans);
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: auto;
    animation: toastIn 0.25s ease;
  `;
  toast.innerHTML = `<span>${isErr ? '⚠' : 'ℹ'}</span> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
