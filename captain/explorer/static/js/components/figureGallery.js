/**
 * CORNERSTONE Scientific Figure Gallery
 * Module 3 Component
 * Publication-Quality Figure Inspection and Deep-Dive Modal
 */

class FigureGallery {
  constructor(containerId = 'figure-gallery-container') {
    this.container = document.getElementById(containerId);
    this.figures = [];
    this.activeFilter = 'ALL';
    this.activeModalFigure = null;
  }

  async init() {
    if (!this.container) return;
    this.renderLoading();
    try {
      const data = await window.cornerstoneApi.getResearchFiguresCatalog();
      this.figures = data.figures || [];
      this.render();
      this.initModal();
    } catch (err) {
      this.renderError(err.message);
    }
  }

  renderLoading() {
    this.container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading Publication Figures (9 Figures)...</p>
      </div>
    `;
  }

  renderError(msg) {
    this.container.innerHTML = `
      <div class="error-banner">
        <span class="error-icon">⚠️</span>
        <span>Failed to load scientific figures: ${msg}</span>
      </div>
    `;
  }

  render() {
    const categories = ['ALL', ...new Set(this.figures.map(f => f.category))];
    const filtered = this.activeFilter === 'ALL'
      ? this.figures
      : this.figures.filter(f => f.category === this.activeFilter);

    this.container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <!-- Controls & Categories -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
          <div style="display: flex; gap: var(--space-2); flex-wrap: wrap;">
            ${categories.map(cat => `
              <button class="btn btn-sm ${this.activeFilter === cat ? 'btn-primary' : 'btn-secondary'} filter-btn" data-cat="${cat}">
                ${cat}
              </button>
            `).join('')}
          </div>
          <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary);">
            Showing ${filtered.length} of ${this.figures.length} Publication Figures
          </div>
        </div>

        <!-- Grid -->
        <div class="figure-gallery-grid">
          ${filtered.map(fig => this.renderFigureCard(fig)).join('')}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderFigureCard(fig) {
    const svgUrl = window.cornerstoneApi.getFigureUrl(fig.filename_svg);
    return `
      <div class="figure-card" data-fig-id="${fig.id}">
        <div class="figure-preview" onclick="window.cornerstoneFigureGallery.openModal('${fig.id}')">
          <img src="${svgUrl}" alt="${fig.title}" loading="lazy" />
        </div>
        <div class="figure-card-body">
          <div class="figure-card-tag">${fig.category}</div>
          <div class="figure-card-title">${fig.title}</div>
          <div class="figure-card-desc">${fig.description}</div>
          <div style="margin-top: var(--space-2); padding: var(--space-2); background: rgba(0, 240, 255, 0.05); border-radius: var(--radius-sm); border: 1px solid rgba(0, 240, 255, 0.15); font-size: 11px; color: var(--primary-cyan); font-family: var(--font-mono);">
            ⭐ ${fig.metric_highlight}
          </div>
          <div class="figure-card-footer">
            <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${fig.filename_svg}</span>
            <button class="btn btn-secondary btn-sm" onclick="window.cornerstoneFigureGallery.openModal('${fig.id}')">
              🔍 Inspect High-Res
            </button>
          </div>
        </div>
      </div>
    `;
  }

  initModal() {
    let modalEl = document.getElementById('figure-inspector-modal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'figure-inspector-modal';
      modalEl.className = 'figure-modal-backdrop';
      modalEl.innerHTML = `
        <div class="figure-modal">
          <div class="figure-modal-header">
            <div>
              <span id="modal-fig-tag" class="figure-card-tag" style="margin-bottom: 4px; display: inline-block;"></span>
              <h3 id="modal-fig-title" style="font-family: var(--font-display); font-size: var(--text-base); color: var(--text-bright);"></h3>
            </div>
            <button id="modal-close-btn" class="btn btn-secondary btn-sm" style="font-size: 16px; padding: 4px 12px;">✕</button>
          </div>
          <div class="figure-modal-body">
            <img id="modal-fig-img" class="figure-modal-img" src="" alt="Figure Zoom" />
            <div style="width: 100%; display: flex; flex-direction: column; gap: var(--space-3); background: var(--bg-surface); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
              <div style="font-size: var(--text-sm); color: var(--text-normal);" id="modal-fig-desc"></div>
              <div style="font-size: var(--text-xs); color: #10b981; font-family: var(--font-mono);" id="modal-fig-takeaway"></div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-3) var(--space-6); background: var(--bg-surface); border-top: 1px solid var(--border-subtle);">
            <span id="modal-fig-metric" style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--primary-cyan);"></span>
            <div style="display: flex; gap: var(--space-3);">
              <a id="modal-download-svg" href="" download class="btn btn-secondary btn-sm">⬇ SVG</a>
              <a id="modal-download-png" href="" download class="btn btn-secondary btn-sm">⬇ PNG</a>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);

      modalEl.querySelector('#modal-close-btn').addEventListener('click', () => {
        modalEl.classList.remove('open');
      });

      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) modalEl.classList.remove('open');
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalEl.classList.contains('open')) {
          modalEl.classList.remove('open');
        }
      });
    }
  }

  openModal(figId) {
    const fig = this.figures.find(f => f.id === figId);
    if (!fig) return;
    this.populateAndShowModal(fig);
  }

  openModalByFilename(filename) {
    const fig = this.figures.find(f => f.filename_svg === filename || f.filename_png === filename);
    if (fig) {
      this.populateAndShowModal(fig);
    } else {
      window.cornerstoneApp.switchView('view-figures');
    }
  }

  populateAndShowModal(fig) {
    const modalEl = document.getElementById('figure-inspector-modal');
    if (!modalEl) return;

    const svgUrl = window.cornerstoneApi.getFigureUrl(fig.filename_svg);
    const pngUrl = window.cornerstoneApi.getFigureUrl(fig.filename_png);

    modalEl.querySelector('#modal-fig-tag').textContent = fig.category;
    modalEl.querySelector('#modal-fig-title').textContent = fig.title;
    modalEl.querySelector('#modal-fig-img').src = svgUrl;
    modalEl.querySelector('#modal-fig-desc').textContent = fig.description;
    modalEl.querySelector('#modal-fig-takeaway').textContent = `💡 Key Takeaway: ${fig.key_takeaway}`;
    modalEl.querySelector('#modal-fig-metric').textContent = `Metric: ${fig.metric_highlight}`;

    const svgLink = modalEl.querySelector('#modal-download-svg');
    svgLink.href = svgUrl;
    svgLink.download = fig.filename_svg;

    const pngLink = modalEl.querySelector('#modal-download-png');
    pngLink.href = pngUrl;
    pngLink.download = fig.filename_png;

    modalEl.classList.add('open');
  }

  bindEvents() {
    this.container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.getAttribute('data-cat');
        this.render();
      });
    });
  }
}

window.cornerstoneFigureGallery = new FigureGallery();
