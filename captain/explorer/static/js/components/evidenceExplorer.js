/**
 * CORNERSTONE Evidence Flow Explorer Component
 * Interactive Bipartite Execution Graph (Vis.js), Node Inspector,
 * Provenance Lineage Traversal, and Failure Region Filtering.
 */

class EvidenceExplorerComponent {
  constructor(api, state) {
    this.api = api;
    this.state = state;
    this.network = null;
    this.currentRunId = null;
    this.graphData = { nodes: [], edges: [] };
    this.failureData = null;
    this.filterNodeType = 'all'; // 'all', 'event', 'artifact'
    this.filterStage = 'all';
    this.highlightFailureOnly = false;
  }

  mount() {
    this._bindControls();

    this.state.subscribe('runChanged', ({ value }) => {
      if (value && value !== this.currentRunId) {
        this.loadGraph(value);
      }
    });

    this.state.subscribe('sectionChanged', ({ sectionId }) => {
      if (sectionId === 'evidence-explorer') {
        setTimeout(() => this.network?.fit(), 150);
      }
    });

    const initialRunId = this.state.get('currentRunId');
    if (initialRunId) {
      this.loadGraph(initialRunId);
    }
  }

  _bindControls() {
    document.getElementById('btn-graph-fit')?.addEventListener('click', () => this.network?.fit());
    document.getElementById('btn-graph-zoomin')?.addEventListener('click', () => {
      if (this.network) {
        const scale = this.network.getScale();
        this.network.moveTo({ scale: scale * 1.3 });
      }
    });
    document.getElementById('btn-graph-zoomout')?.addEventListener('click', () => {
      if (this.network) {
        const scale = this.network.getScale();
        this.network.moveTo({ scale: scale * 0.7 });
      }
    });

    const physicsBtn = document.getElementById('btn-graph-physics');
    physicsBtn?.addEventListener('click', () => {
      if (this.network) {
        const isEnabled = this.network.physics.physicsEnabled;
        this.network.setOptions({ physics: { enabled: !isEnabled } });
        physicsBtn.classList.toggle('active', !isEnabled);
      }
    });

    const filterType = document.getElementById('select-graph-filter-type');
    filterType?.addEventListener('change', (e) => {
      this.filterNodeType = e.target.value;
      this._applyFilters();
    });

    const failureToggle = document.getElementById('btn-toggle-failure-path');
    failureToggle?.addEventListener('click', () => {
      this.highlightFailureOnly = !this.highlightFailureOnly;
      failureToggle.classList.toggle('active', this.highlightFailureOnly);
      this._applyFilters();
    });

    const runSelector = document.getElementById('select-graph-run');
    runSelector?.addEventListener('change', (e) => {
      const rid = e.target.value;
      if (rid) {
        this.state.set('currentRunId', rid);
      }
    });
  }

  async loadGraph(runId) {
    this.currentRunId = runId;
    const container = document.getElementById('vis-network-canvas');
    if (!container) return;

    try {
      // 1. Fetch graph and failure data
      const [graphRes, failureRes] = await Promise.all([
        this.api.getGraph(runId),
        this.api.getFailure(runId).catch(() => null)
      ]);

      this.graphData = graphRes.graph;
      this.failureData = failureRes;

      // Update Run Selector dropdown if present
      this._updateRunSelector(runId);

      // 2. Build Vis DataSet
      this._renderVisGraph(container);
    } catch (err) {
      console.error('Failed to load execution graph:', err);
    }
  }

  _renderVisGraph(container) {
    const nodes = this.graphData.nodes.map(n => {
      const isEvent = n.node_type === 'event' || n.group === 'event';
      const isFailureCandidate = this._isCausalCandidate(n.id);

      return {
        id: n.id,
        label: n.label,
        shape: isEvent ? 'box' : 'ellipse',
        color: {
          background: isFailureCandidate ? '#2d121e' : (isEvent ? '#0b162a' : '#141830'),
          border: isFailureCandidate ? '#f43f5e' : (isEvent ? '#00e5ff' : '#8b5cf6'),
          highlight: {
            background: isFailureCandidate ? '#f43f5e' : (isEvent ? '#00e5ff' : '#8b5cf6'),
            border: '#ffffff'
          }
        },
        font: {
          color: '#f8fafc',
          face: 'JetBrains Mono',
          size: 11
        },
        borderWidth: isFailureCandidate ? 2.5 : 1.5,
        margin: 10,
        nodeType: isEvent ? 'event' : 'artifact',
        raw: n
      };
    });

    const edges = this.graphData.edges.map(e => ({
      id: e.id,
      from: e.from,
      to: e.to,
      label: e.label,
      arrows: 'to',
      color: {
        color: '#2a3d63',
        highlight: '#00e5ff'
      },
      font: {
        color: '#64748b',
        size: 9,
        face: 'JetBrains Mono'
      },
      smooth: { type: 'cubicBezier' }
    }));

    const data = {
      nodes: new vis.DataSet(nodes),
      edges: new vis.DataSet(edges)
    };

    const options = {
      layout: {
        hierarchical: {
          direction: 'LR',
          sortMethod: 'directed',
          levelSeparation: 140,
          nodeSpacing: 100
        }
      },
      physics: {
        enabled: false
      },
      interaction: {
        hover: true,
        tooltipDelay: 100
      }
    };

    if (this.network) {
      this.network.destroy();
    }

    this.network = new vis.Network(container, data, options);

    // Event listeners
    this.network.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        this._inspectNode(nodeId);
      }
    });

    // Auto-select first node
    if (nodes.length > 0) {
      this._inspectNode(nodes[0].id);
    }
  }

  _isCausalCandidate(nodeId) {
    if (!this.failureData || !this.failureData.candidates) return false;
    return this.failureData.candidates.some(c => c.source === nodeId || c.target === nodeId || c.id === nodeId);
  }

  _applyFilters() {
    if (!this.network) return;
    const allNodes = this.network.body.data.nodes;

    allNodes.forEach(node => {
      let isVisible = true;

      // Filter by type
      if (this.filterNodeType !== 'all') {
        if (node.nodeType !== this.filterNodeType) isVisible = false;
      }

      // Filter failure path
      if (this.highlightFailureOnly) {
        if (!this._isCausalCandidate(node.id)) isVisible = false;
      }

      allNodes.update({ id: node.id, hidden: !isVisible });
    });
  }

  async _inspectNode(nodeId) {
    const inspector = document.getElementById('graph-inspector-body');
    if (!inspector) return;

    const nodeMeta = this.graphData.nodes.find(n => n.id === nodeId);
    const isEvent = nodeMeta && (nodeMeta.node_type === 'event' || nodeMeta.group === 'event');

    try {
      let detailsHtml = '';

      if (isEvent) {
        const evtDetail = await this.api.getEvent(this.currentRunId, nodeId);
        detailsHtml = `
          <div class="inspector-field">
            <span class="inspector-field-label">Node Type</span>
            <span class="badge badge-live">EXECUTION EVENT</span>
          </div>
          <div class="inspector-field">
            <span class="inspector-field-label">Event ID</span>
            <span class="font-mono inspector-field-val" style="color:var(--cyan-primary);">${evtDetail.event_id}</span>
          </div>
          <div class="inspector-field">
            <span class="inspector-field-label">Component & Sequence</span>
            <span class="inspector-field-val">${evtDetail.component} &bull; #${evtDetail.sequence_number}</span>
          </div>
          <div class="inspector-field">
            <span class="inspector-field-label">Payload</span>
            <pre class="sim-event-payload">${JSON.stringify(evtDetail.payload, null, 2)}</pre>
          </div>
        `;
      } else {
        const artDetail = await this.api.getArtifact(this.currentRunId, nodeId);
        detailsHtml = `
          <div class="inspector-field">
            <span class="inspector-field-label">Node Type</span>
            <span class="badge badge-measured">EVIDENCE ARTIFACT</span>
          </div>
          <div class="inspector-field">
            <span class="inspector-field-label">Artifact ID</span>
            <span class="font-mono inspector-field-val" style="color:var(--violet-primary);">${artDetail.artifact_id}</span>
          </div>
          <div class="inspector-field">
            <span class="inspector-field-label">Artifact Type</span>
            <span class="inspector-field-val font-mono">${artDetail.artifact_type}</span>
          </div>
          <div class="inspector-field">
            <span class="inspector-field-label">Artifact Content Value</span>
            <pre class="sim-event-payload">${artDetail.value || 'None'}</pre>
          </div>
          <div class="inspector-field">
            <span class="inspector-field-label">Producer Event</span>
            <span class="font-mono" style="color:var(--cyan-hover);">${artDetail.producer_event_id || 'Initial Input'}</span>
          </div>
          <div class="inspector-field">
            <span class="inspector-field-label">Consumers (${artDetail.consumers?.length || 0})</span>
            <div class="font-mono" style="font-size:10px; color:var(--text-dim);">${artDetail.consumers?.join(', ') || 'Terminal'}</div>
          </div>
        `;
      }

      inspector.innerHTML = detailsHtml;
    } catch (err) {
      inspector.innerHTML = `<div style="color:var(--text-dim);">Selected: ${nodeId}</div>`;
    }
  }

  _updateRunSelector(activeRunId) {
    const sel = document.getElementById('select-graph-run');
    if (!sel) return;
    const runs = this.state.get('cachedRuns') || [];
    sel.innerHTML = '';
    runs.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r.run_id;
      opt.textContent = `${r.run_id.slice(0, 12)}... (${r.event_count} events)`;
      if (r.run_id === activeRunId) opt.selected = true;
      sel.appendChild(opt);
    });
  }
}

window.EvidenceExplorerComponent = EvidenceExplorerComponent;
