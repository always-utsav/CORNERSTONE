/**
 * CORNERSTONE Presentation Controller
 * Module 3 Component
 * Full-screen 12-slide presentation mode for university research defense
 * and external faculty evaluation.
 */

class PresentationController {
  constructor(state) {
    this.state = state;
    this.totalSlides = 12;
  }

  mount() {
    this._bindControls();
    this._bindKeyboard();

    this.state.subscribe('slideChanged', ({ slide }) => {
      this._renderSlide(slide);
    });

    this.state.subscribe('presentationToggled', ({ active, slide }) => {
      if (active) {
        this._renderSlide(slide);
      }
    });
  }

  _bindControls() {
    document.getElementById('dock-btn-prev')?.addEventListener('click', () => {
      this.state.prevSlide();
    });

    document.getElementById('dock-btn-next')?.addEventListener('click', () => {
      this.state.nextSlide();
    });

    document.getElementById('dock-btn-fullscreen')?.addEventListener('click', () => {
      this._toggleFullscreen();
    });

    document.getElementById('dock-btn-notes')?.addEventListener('click', () => {
      this._toggleNotes();
    });

    document.getElementById('dock-btn-exit')?.addEventListener('click', () => {
      this.state.togglePresentation(false);
    });

    document.getElementById('btn-close-notes')?.addEventListener('click', () => {
      this._toggleNotes(false);
    });
  }

  _bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      if (!this.state.get('presentationMode')) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        this.state.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.state.prevSlide();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.state.togglePresentation(false);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        this._toggleFullscreen();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        this._toggleNotes();
      }
    });
  }

  _renderSlide(slideIndex) {
    // 1. Update slides visibility
    const slides = document.querySelectorAll('.presentation-slide');
    slides.forEach((sl, idx) => {
      sl.classList.toggle('active', (idx + 1) === slideIndex);
    });

    // 2. Update slide counter in topbar and dock
    const counterTop = document.getElementById('pres-counter-top');
    const counterDock = document.getElementById('pres-counter-dock');
    const label = `SLIDE ${slideIndex} OF ${this.totalSlides}`;
    if (counterTop) counterTop.textContent = label;
    if (counterDock) counterDock.textContent = `${slideIndex} / ${this.totalSlides}`;

    // 3. Update buttons disabled states
    const prevBtn = document.getElementById('dock-btn-prev');
    const nextBtn = document.getElementById('dock-btn-next');
    if (prevBtn) prevBtn.disabled = slideIndex === 1;
    if (nextBtn) nextBtn.disabled = slideIndex === this.totalSlides;

    // 4. Update speaker notes for current slide
    this._updateSpeakerNotes(slideIndex);

    // 5. Render Math in slide if KaTeX present
    const activeSlide = document.querySelector('.presentation-slide.active');
    if (activeSlide && window.renderMathInElement) {
      window.renderMathInElement(activeSlide);
    }
  }

  _toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request denied:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  _toggleNotes(forceState = null) {
    const drawer = document.getElementById('speaker-notes-drawer');
    if (!drawer) return;
    if (forceState !== null) {
      drawer.classList.toggle('open', forceState);
    } else {
      drawer.classList.toggle('open');
    }
  }

  _updateSpeakerNotes(slideIndex) {
    const notesContent = document.getElementById('speaker-notes-content');
    if (!notesContent) return;

    const notesMap = {
      1: `
        <h5>Audience Talking Points: Slide 1 (Title)</h5>
        <p><strong>Anchor:</strong> Autonomous multi-step LLM agents are rapidly proliferating in high-stakes environments, yet failure attribution remains a black box.</p>
        <p><strong>Core Contribution:</strong> CAPTAIN and CELA provide the first formal bipartite evidence-provenance architecture and counterfactual channel-level failure isolation framework.</p>
        <p><strong>Defense Scope:</strong> 275 evaluated benchmark scenarios across 11 topological families, 10 methods, and 702 regression tests.</p>
      `,
      2: `
        <h5>Audience Talking Points: Slide 2 (Failure Crisis)</h5>
        <p><strong>The Dilemma:</strong> In an agent workflow, an early tool call generates flawed data. Three steps later, a synthesis prompt produces a hallucinated conclusion.</p>
        <p><strong>The Flaw of Existing Approaches:</strong> Step-level intervention assumes an entire tool execution is faulty. In reality, modern tools produce multiple structured artifacts simultaneously.</p>
      `,
      3: `
        <h5>Audience Talking Points: Slide 3 (Bipartite Architecture)</h5>
        <p><strong>Formal Model:</strong> Explain the directed bipartite graph $G = (V_E \\cup V_A, E_{\\text{prod}} \\cup E_{\\text{cons}})$.</p>
        <p><strong>Separation of Concerns:</strong> Events $V_E$ represent computational actions; Artifacts $V_A$ represent typed immutable data. Edges never connect Event-to-Event directly, enforcing pure evidence tracking.</p>
      `,
      4: `
        <h5>Audience Talking Points: Slide 4 (The Granularity Problem)</h5>
        <p><strong>Shared-Source Tool Calls (BF-G):</strong> When a tool generates both a faulty output $A$ and a benign output $B$, step-level replacement destroys both.</p>
        <p><strong>Collateral Modification:</strong> CELA channel intervention replaces only artifact $A$, allowing $B$ to propagate downstream with 100% preservation.</p>
      `,
      5: `
        <h5>Audience Talking Points: Slide 5 (The CELA Algorithm)</h5>
        <p>Walk through the 4 algorithmic stages: Provenance Reachability (A1) -> Counterfactual CEE Screening (A2) -> Cascade Lookahead (A3) -> Multi-Objective Knapsack (A4/A5).</p>
        <p>Explain CEE operationalization: $\\text{CEE}(c) = \\mathbb{E}[Y_{\\text{fact}}] - \\mathbb{E}[Y_{\\text{cf}} \\mid \\text{do}(c)]$.</p>
      `,
      6: `
        <h5>Audience Talking Points: Slide 6 (11 Benchmark Families)</h5>
        <p>Highlight families BF-A through BF-K: Single Channel, Redundant OR, Complementary AND, Distractors, Cascades, Shared Source, Convergent Mixed, etc.</p>
        <p>5 instances per family evaluated across 5 master random seeds (42, 123, 456, 789, 1024) = 275 scenarios.</p>
      `,
      7: `
        <h5>Audience Talking Points: Slide 7 (Main Results)</h5>
        <p>Compare CELA A5 against Baselines B1–B5.</p>
        <p>Key highlights: CELA cuts intervention cost by 64.8% (0.80 vs 2.27), eliminates distractor false selection (0.0% vs 73.3%), and achieves highest net utility (0.720).</p>
      `,
      8: `
        <h5>Audience Talking Points: Slide 8 (BF-G Granularity Study)</h5>
        <p><strong>Crucial Faculty Clarification:</strong> In all 5 instances, channel intervention preserves 100% of benign artifacts while source-event destroys them (0% preservation).</p>
        <p><strong>Statistical Honesty:</strong> Explicitly note that because all 5 differences are identically +1 (zero variance), a Wilcoxon test is degenerate. We report the exact unanimous descriptive observation (5/5 instances) without claiming p &lt; 0.001.</p>
      `,
      9: `
        <h5>Audience Talking Points: Slide 9 (Negative Findings & Claim C3)</h5>
        <p><strong>Intellectual Honesty:</strong> Explain why Claim C3 is marked NOT SUPPORTED on raw causal F1 ($p=0.1156$).</p>
        <p>Random baseline B1 achieves high F1 on small graphs purely by chance, but incurs catastrophic distractor selection (73.3%) and budget waste. CELA excels in utility and distractor immunity.</p>
      `,
      10: `
        <h5>Audience Talking Points: Slide 10 (Robustness & Falsification)</h5>
        <p>Negative controls on benign artifacts and irrelevant tools yield CEE = 0.000 across all tests (100% specificity).</p>
        <p>Seed stability coefficient of variation CV &lt; 0.20 confirms findings are not cherry-picked to seed 42.</p>
      `,
      11: `
        <h5>Audience Talking Points: Slide 11 (Real-LLM & Scalability)</h5>
        <p><strong>Sanity Check Model:</strong> Google Gemini API model <code>gemini-3.6-flash</code> (temperature=0.0).</p>
        <p><strong>Trial Breakdown:</strong> 5 attempted queries per condition. Due to API quota limits, 10 of 15 calls returned <code>ResourceExhausted</code> (3/5 in factual, 3/5 in channel, 4/5 in source-event). These are strictly accounted as API execution failures.</p>
        <p><strong>Effect Calculation:</strong> On valid completions, conditional CEE = 1.00 ($2/2 - 0/2$). Naive division over all 5 attempts yields CEE = 0.40 ($2/5 - 0/5$).</p>
        <p><strong>Scope Caveat:</strong> Targeted prompt-level sanity check on keyword sensitivity, not an end-to-end autonomous agent workflow.</p>
        <p><strong>Latency:</strong> Mean scenario evaluation latency is 2.8 ms per instance, demonstrating computational feasibility.</p>
      `,
      12: `
        <h5>Audience Talking Points: Slide 12 (Conclusion & Handoff)</h5>
        <p>Summarize contributions: bipartite evidence provenance, channel-level intervention, CEE metric, and distractor rejection.</p>
        <p>Invite committee members to inspect live interactive laboratories directly.</p>
      `
    };

    notesContent.innerHTML = notesMap[slideIndex] || '<p>No specific speaker notes for this slide.</p>';
  }
}

window.PresentationController = PresentationController;
