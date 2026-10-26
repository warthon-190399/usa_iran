/**
 * news-timeline.js v5
 * Layout broadsheet vertical — línea de tiempo lateral
 */

class NewsTimeline {
  constructor(containerId = 'news-timeline', dataUrl = 'data/news.json') {
    this.container = document.getElementById(containerId);
    this.dataUrl = dataUrl;
    this.allNews = [];
    this.filteredNews = [];
    this.expandedId = null;
    this.currentFilter = 'all';

    if (!this.container) {
      console.error(`Container #${containerId} not found`);
      return;
    }

    this.init();
  }

  async init() {
    try {
      await this.loadNews();
      this.extractCategories();
      this.render();
    } catch (error) {
      console.error('Error initializing NewsTimeline:', error);
      this.container.innerHTML = '<p class="news-error">Error cargando noticias</p>';
    }
  }

  async loadNews() {
    const response = await fetch(this.dataUrl);
    if (!response.ok) throw new Error(`Failed to fetch ${this.dataUrl}`);

    const data = await response.json();
    this.allNews = data.news || [];
    this.filteredNews = [...this.allNews];
    this.sortNews();
  }

  sortNews() {
    this.filteredNews.sort((a, b) =>
      new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date)
    );
  }

  extractCategories() {
    const categories = new Set();
    this.allNews.forEach(n => { if (n.category) categories.add(n.category); });
    this.categories = Array.from(categories).sort();
  }

  /* ─────────────────────────────────────
     RENDER COMPLETO (solo al iniciar o filtrar)
  ───────────────────────────────────── */
  render() {
    this.container.innerHTML = '';

    this.container.appendChild(this.createHeader());
    this.container.appendChild(this.createToolbar());
    this.container.appendChild(this.createNewsGrid());
  }

  createHeader() {
    const header = document.createElement('div');
    header.className = 'news-header';

    header.innerHTML = `
      <div class="news-header-content">
        <span class="news-eyebrow">Documentación cronológica</span>
        <h2 class="news-title">Timeline de <em>Eventos</em></h2>
        <p class="news-subtitle">Conflicto EE.UU.–Irán — registro editorial de hechos clave</p>
      </div>
    `;

    return header;
  }

  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.className = 'news-toolbar';

    // Contador
    const counter = document.createElement('div');
    counter.className = 'news-counter';
    counter.innerHTML = `
      <span class="news-count">${this.filteredNews.length}</span>
      <span class="news-label">${this.filteredNews.length === 1 ? 'evento' : 'eventos'}</span>
    `;
    toolbar.appendChild(counter);

    // Filtros
    toolbar.appendChild(this.createFilterBar());

    return toolbar;
  }

  createFilterBar() {
    const bar = document.createElement('div');
    bar.className = 'news-filter-bar';

    const allBtn = document.createElement('button');
    allBtn.className = `news-filter-btn ${this.currentFilter === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'Todas';
    allBtn.dataset.filter = 'all';
    allBtn.addEventListener('click', () => this.setFilter('all'));
    bar.appendChild(allBtn);

    this.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = `news-filter-btn ${this.currentFilter === cat ? 'active' : ''}`;
      btn.textContent = cat;
      btn.dataset.filter = cat;
      btn.addEventListener('click', () => this.setFilter(cat));
      bar.appendChild(btn);
    });

    return bar;
  }

  createNewsGrid() {
    const grid = document.createElement('div');
    grid.className = 'news-grid';

    if (this.filteredNews.length === 0) {
      grid.innerHTML = '<p class="news-empty">No hay eventos en esta categoría</p>';
      return grid;
    }

    this.filteredNews.forEach(news => grid.appendChild(this.createNewsCard(news)));
    return grid;
  }

  createNewsCard(news) {
    const card = document.createElement('article');
    card.className = `news-card ${news.featured ? 'featured' : ''} ${this.expandedId === news.id ? 'expanded' : ''}`;
    card.dataset.id = news.id;

    const date = new Date(news.timestamp || news.date);
    const formattedDate = this.formatDate(date);
    const statusBadge = news.status
      ? `<span class="news-status ${news.status}">${this.getStatusLabel(news.status)}</span>`
      : '';

    card.innerHTML = `
      <div class="news-card-header">
        <div class="news-meta">
          <time class="news-date" datetime="${news.date}">${formattedDate}</time>
          <span class="news-category">${news.category}</span>
          ${statusBadge}
        </div>
        <button class="news-expand-btn" aria-label="Expandir noticia">
          <span class="expand-icon">+</span>
        </button>
      </div>

      <div class="news-card-body">
        <h3 class="news-card-title">${this.escapeHtml(news.title)}</h3>
        <p class="news-card-summary">${this.escapeHtml(news.summary)}</p>
      </div>

      <div class="news-card-expanded" style="display: ${this.expandedId === news.id ? 'block' : 'none'}">
        <div class="news-card-content">
          ${this.formatContent(news.content)}
        </div>
        ${news.image ? `<img src="${news.image}" alt="${this.escapeHtml(news.title)}" class="news-card-image" loading="lazy">` : ''}
        ${news.tags && news.tags.length > 0 ? `
          <div class="news-card-tags">
            ${news.tags.map(tag => `<span class="news-tag">${this.escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `;

    const expandBtn = card.querySelector('.news-expand-btn');
    expandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleExpanded(news.id);
    });

    card.addEventListener('click', (e) => {
      console.log('[NewsTimeline] card clicked, id:', news.id, 'target:', e.target.tagName);
      this.toggleExpanded(news.id);
    });

    return card;
  }

  /* ─────────────────────────────────────
     TOGGLE IN-PLACE (sin re-render)
  ───────────────────────────────────── */
  toggleExpanded(id) {
    // Normalizar a string para comparación con dataset (siempre string)
    id = String(id);
    const prevId = this.expandedId ? String(this.expandedId) : null;

    // Colapsar anterior
    if (prevId !== null) {
      const prevCard = this.container.querySelector(`.news-card[data-id="${prevId}"]`);
      if (prevCard) {
        prevCard.classList.remove('expanded');
        const expandedEl = prevCard.querySelector('.news-card-expanded');
        if (expandedEl) expandedEl.style.display = 'none';
      }
    }

    if (prevId === id) {
      this.expandedId = null;
    } else {
      this.expandedId = id;
      const card = this.container.querySelector(`.news-card[data-id="${id}"]`);
      if (card) {
        card.classList.add('expanded');
        const expandedEl = card.querySelector('.news-card-expanded');
        if (expandedEl) expandedEl.style.display = 'block';
      }
    }
  }

  setFilter(category) {
    this.currentFilter = category;
    this.filteredNews = category === 'all'
      ? [...this.allNews]
      : this.allNews.filter(n => n.category === category);
    this.sortNews();
    this.expandedId = null;
    this.render();
  }

  formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);
  }

  getStatusLabel(status) {
    return {
      'breaking': '🔴 Breaking',
      'urgent':   '⚠️ Urgente',
      'update':   '↺ Actualización',
      'analysis': '◎ Análisis'
    }[status] || status;
  }

  formatContent(content) {
    if (!content) return '';
    return content
      .split('\n\n')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => `<p>${this.escapeHtml(p)}</p>`)
      .join('');
  }

  escapeHtml(text) {
    if (!text) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

function initNewsTimeline() {
  const section = document.getElementById('news-timeline');
  if (!section) return;

  window.newsTimeline = new NewsTimeline('news-timeline', 'data/news.json');

  // Cuando el timeline es visible, desactivar pointer-events del mapa Leaflet
  // para que los clicks lleguen a las tarjetas
  const leafletControls = () => document.querySelectorAll(
    '.leaflet-top, .leaflet-bottom, .leaflet-pane, .leaflet-container'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const pe = entry.isIntersecting ? 'none' : '';
      leafletControls().forEach(el => el.style.pointerEvents = pe);
      // También desactivar el mapa completo
      const map = document.getElementById('map');
      if (map) map.style.pointerEvents = entry.isIntersecting ? 'none' : '';
    });
  }, { threshold: 0.05 });

  observer.observe(section);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNewsTimeline);
} else {
  initNewsTimeline();
}