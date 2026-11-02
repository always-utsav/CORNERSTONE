/**
 * CORNERSTONE Explanation System
 * Toggles between Simple (Intuitive/Conceptual) and Research (Formal/Mathematical) modes
 * Manages contextual scientific tooltips and definitions
 */

class ExplanationSystem {
  constructor(state) {
    this.state = state;
    this._glossary = {
      'CEE': {
        title: 'Counterfactual Evidence-Flow Effect (CEE)',
        simple: 'A metric showing whether changing one piece of information actually stops the AI agent from failing.',
        research: 'The empirical causal estimand CEE(E_{i -> j}) = P(Failure | do(E = v_factual)) - P(Failure | do(E = v*)). Operationalizes Pearl do-calculus on evidence channels.'
      },
      'Granularity': {
        title: 'Intervention Granularity',
        simple: 'Whether you fix just the one wrong fact (channel) or throw away the whole computer program step (source-event).',
        research: 'The topological level of counterfactual intervention: Channel-level (ARTIFACT_REPLACEMENT) vs Source-Event-level (TOOL_RESULT_OVERRIDE).'
      },
      'BF-G': {
        title: 'Benchmark Family G (Shared Source)',
        simple: 'A scenario where one tool creates two different outputs—one has a bug, the other is completely correct and needed later.',
        research: 'Topological mechanism family testing joint output branching. Proves channel intervention selectivity by holding orthogonal artifact invariants constant.'
      },
      'Collateral Damage': {
        title: 'Collateral Evidence Modification',
        simple: 'Accidentally ruining or altering good facts while trying to fix bad facts.',
        research: 'The proportion of non-causal evidence artifacts modified by an intervention: Collateral = |Art_modified \\setminus Art_causal| / |Art_non_causal|.'
      },
      'Oracle': {
        title: 'Post-Hoc Evaluator (Oracle)',
        simple: 'A referee that knows the secret answer in advance, used strictly to grade how well our method performs.',
        research: 'Post-hoc ground-truth evaluator provided for metric calculation (causal F1, optimal channel set). Strict isolation prevents leakage into selection.'
      }
    };
  }

  mount() {
    this._bindToggleButton();
    this._bindTooltips();

    this.state.subscribe('explanationModeChanged', ({ mode }) => {
      this._updateUI(mode);
    });

    // Initial state
    const currentMode = this.state.get('explanationMode') || 'research';
    this._updateUI(currentMode);
  }

  _bindToggleButton() {
    const btn = document.getElementById('btn-toggle-explanation');
    if (btn) {
      btn.addEventListener('click', () => {
        this.state.toggleExplanationMode();
      });
    }
  }

  _bindTooltips() {
    // Delegate hover listeners for [data-term]
    document.addEventListener('mouseover', (e) => {
      const termEl = e.target.closest('[data-term]');
      if (!termEl) return;
      const termKey = termEl.getAttribute('data-term');
      const entry = this._glossary[termKey];
      if (!entry) return;

      this._showTooltip(termEl, entry);
    });

    document.addEventListener('mouseout', (e) => {
      const termEl = e.target.closest('[data-term]');
      if (termEl) {
        this._hideTooltip();
      }
    });
  }

  _updateUI(mode) {
    const btn = document.getElementById('btn-toggle-explanation');
    const badge = document.getElementById('explanation-mode-badge');
    if (btn) {
      btn.querySelector('.btn-label').textContent = mode === 'research' ? 'Mode: Research' : 'Mode: Simple';
    }
    if (badge) {
      badge.textContent = mode === 'research' ? 'RESEARCH / MATH' : 'SIMPLE / CONCEPT';
      badge.className = mode === 'research' ? 'badge explanation-badge-research' : 'badge explanation-badge-simple';
    }
  }

  _showTooltip(targetEl, entry) {
    let tooltip = document.getElementById('cornerstone-scientific-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'cornerstone-scientific-tooltip';
      tooltip.style.cssText = `
        position: fixed;
        z-index: 10000;
        background: rgba(13, 21, 39, 0.96);
        border: 1px solid var(--border-glow-cyan);
        box-shadow: 0 8px 24px rgba(0,0,0,0.6);
        padding: 12px 16px;
        border-radius: 6px;
        max-width: 320px;
        font-size: 11px;
        line-height: 1.5;
        color: var(--text-secondary);
        pointer-events: none;
        backdrop-filter: blur(8px);
      `;
      document.body.appendChild(tooltip);
    }

    const mode = this.state.get('explanationMode');
    const bodyContent = mode === 'research' ? entry.research : entry.simple;

    tooltip.innerHTML = `
      <div style="font-weight: 700; color: var(--cyan-primary); margin-bottom: 4px; font-family: var(--font-mono); text-transform: uppercase;">
        ${entry.title}
      </div>
      <div>${bodyContent}</div>
      <div style="margin-top: 6px; font-size: 9px; color: var(--text-dim); text-transform: uppercase;">
        Mode: ${mode} &bull; Toggle via header
      </div>
    `;

    const rect = targetEl.getBoundingClientRect();
    tooltip.style.top = `${rect.bottom + 8}px`;
    tooltip.style.left = `${Math.min(window.innerWidth - 340, Math.max(16, rect.left))}px`;
    tooltip.style.display = 'block';
  }

  _hideTooltip() {
    const tooltip = document.getElementById('cornerstone-scientific-tooltip');
    if (tooltip) {
      tooltip.style.display = 'none';
    }
  }
}

window.ExplanationSystem = ExplanationSystem;
