/**
 * CORNERSTONE Navigation Controller
 * Hierarchical Sidebar Navigation, Hash Routing & Keyboard Shortcuts
 */

class NavComponent {
  constructor(state) {
    this.state = state;
    this._keyMap = {
      '1': 'command-center',
      '2': 'research-story',
      '3': 'agent-simulator',
      '4': 'evidence-explorer',
      '5': 'cela-lab',
      '6': 'cascade-lab',
      '7': 'benchmark-studio',
      '8': 'research-results',
      '9': 'methodology',
      '0': 'about'
    };
  }

  mount() {
    this._bindNavLinks();
    this._bindHashRouting();
    this._bindKeyboardShortcuts();

    this.state.subscribe('sectionChanged', ({ sectionId }) => {
      this._updateActiveUI(sectionId);
    });

    // Initial route from URL hash or default
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(`view-${hash}`)) {
      this.state.setSection(hash);
    } else {
      this._updateActiveUI(this.state.get('activeSection'));
    }
  }

  _bindNavLinks() {
    const links = document.querySelectorAll('.nav-link[data-section]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = link.getAttribute('data-section');
        this.state.setSection(sectionId);
      });
    });

    // Also bind jump buttons with [data-jump]
    const jumpBtns = document.querySelectorAll('[data-jump]');
    jumpBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-jump');
        this.state.setSection(target);
      });
    });
  }

  _bindHashRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById(`view-${hash}`)) {
        this.state.setSection(hash);
      }
    });
  }

  _bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      // 'P' or 'p' toggles presentation mode
      if (e.key === 'p' || e.key === 'P') {
        if (!e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          this.state.togglePresentation();
          return;
        }
      }

      // Check numeric shortcuts 1-9, 0
      if (this._keyMap[e.key] && !this.state.get('presentationMode')) {
        this.state.setSection(this._keyMap[e.key]);
      }
    });
  }

  _updateActiveUI(sectionId) {
    // 1. Update nav links
    const links = document.querySelectorAll('.nav-link');
    links.forEach(l => {
      const isTarget = l.getAttribute('data-section') === sectionId;
      l.classList.toggle('active', isTarget);
    });

    // 2. Update view sections
    const views = document.querySelectorAll('.section-view');
    views.forEach(v => {
      const isTarget = v.id === `view-${sectionId}`;
      v.classList.toggle('active', isTarget);
    });

    // 3. Update breadcrumb or viewport title if present
    const titleEl = document.getElementById('current-section-title');
    if (titleEl) {
      const activeLink = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
      if (activeLink) {
        titleEl.textContent = activeLink.querySelector('.nav-label')?.textContent || sectionId;
      }
    }

    // Scroll to top of main viewport
    const viewport = document.querySelector('.main-viewport');
    if (viewport) {
      viewport.scrollTop = 0;
    }
  }
}

window.NavComponent = NavComponent;
