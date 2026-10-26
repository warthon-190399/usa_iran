// ── Estado ──────────────────────────────────────────────
  let allNews    = [];
  let filtered   = [];
  let categories   = [];
  let currentFilter = 'all';
  let openId     = null;

  // ── Fetch ──────────────────────────────────────────────
  async function init() {
    try {
    const res = await fetch('data/news.json');
    if (!res.ok) throw new Error('No se pudo cargar news.json');
    const data = await res.json();
    allNews = data.news || [];
    allNews.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));
    filtered = [...allNews];

    // Categorías únicas
    categories = [...new Set(allNews.map(n => n.category).filter(Boolean))].sort();

    renderFilters();
    renderList();
    } catch (e) {
    document.getElementById('timeline').innerHTML =
      `<p class="empty">Error cargando noticias: ${e.message}</p>`;
    }
  }

  // ── Filtros ────────────────────────────────────────────
  function renderFilters() {
    const bar = document.getElementById('filters');
    bar.innerHTML = '';

    const mkBtn = (label, value) => {
    const b = document.createElement('button');
    b.className = 'filter-btn' + (currentFilter === value ? ' active' : '');
    b.textContent = label;
    b.addEventListener('click', () => setFilter(value));
    return b;
    };

    bar.appendChild(mkBtn('Todas', 'all'));
    categories.forEach(c => bar.appendChild(mkBtn(c, c)));
  }

  function setFilter(value) {
    currentFilter = value;
    filtered = value === 'all'
    ? [...allNews]
    : allNews.filter(n => n.category === value);
    openId = null;
    renderFilters();
    renderList();
  }

  // ── Lista ──────────────────────────────────────────────
  function renderList() {
    const container = document.getElementById('timeline');
    const num     = document.getElementById('counter-num');
    const lbl     = document.getElementById('counter-label');

    num.textContent = filtered.length;
    lbl.textContent = filtered.length === 1 ? 'evento' : 'eventos';

    if (filtered.length === 0) {
    container.innerHTML = '<p class="empty">No hay eventos en esta categoría.</p>';
    return;
    }

    container.innerHTML = '';
    filtered.forEach(news => container.appendChild(buildCard(news)));
  }

  // ── Tarjeta ────────────────────────────────────────────
  function buildCard(news) {
    const article = document.createElement('article');
    const isOpen  = String(openId) === String(news.id);
    article.className = ['card', news.featured ? 'featured' : '', isOpen ? 'open' : '']
    .filter(Boolean).join(' ');
    article.dataset.id = news.id;

    const date = new Date(news.timestamp || news.date);
    const formattedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
    }).format(date);

    const statusMap = {
    breaking: '🔴 Breaking',
    urgent:   '⚠️ Urgente',
    update:   '↺ Actualización',
    analysis: '◎ Análisis'
    };

    const statusBadge = news.status
    ? `<span class="card-status ${news.status}">${statusMap[news.status] || news.status}</span>`
    : '';

    const tagsHtml = news.tags && news.tags.length
    ? `<div class="card-tags">${news.tags.map(t => `<span class="card-tag">${esc(t)}</span>`).join('')}</div>`
    : '';

    const imgHtml = news.image
    ? `<img src="${esc(news.image)}" alt="${esc(news.title)}" class="card-img" loading="lazy">`
    : '';

    article.innerHTML = `
    <div class="card-meta">
      <div class="card-meta-left">
      <time class="card-date" datetime="${news.date}">${formattedDate}</time>
      <span class="card-cat">${esc(news.category)}</span>
      ${statusBadge}
      </div>
      <button class="card-toggle" aria-label="Expandir">+</button>
    </div>
    <div class="card-body">
      <h2 class="card-title">${esc(news.title)}</h2>
      <p class="card-summary">${esc(news.summary)}</p>
    </div>
    <div class="card-expanded">
      <div class="card-content">${formatContent(news.content)}</div>
      ${imgHtml}
      ${tagsHtml}
    </div>
    `;

    // Click en la tarjeta o en el botón
    article.addEventListener('click', (e) => {
    if (e.target.closest('.card-tag')) return;
    toggle(news.id);
    });

    return article;
  }

  // ── Toggle in-place ────────────────────────────────────
  function toggle(id) {
    id = String(id);
    const prev = openId !== null ? String(openId) : null;

    if (prev !== null) {
    const prevCard = document.querySelector(`.card[data-id="${prev}"]`);
    if (prevCard) prevCard.classList.remove('open');
    }

    openId = prev === id ? null : id;

    if (openId !== null) {
    const card = document.querySelector(`.card[data-id="${openId}"]`);
    if (card) card.classList.add('open');
    }
  }

  // ── Helpers ────────────────────────────────────────────
  function formatContent(text) {
    if (!text) return '';
    return text.split('\n\n')
    .map(p => p.trim()).filter(p => p)
    .map(p => `<p>${esc(p)}</p>`).join('');
  }

  function esc(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  // ── Arrancar ───────────────────────────────────────────
  init();