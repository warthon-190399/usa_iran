/**
 * economic.js — Capítulo IV: Impacto Económico Global
 * Gráfico histórico del Brent (1987–2025) + zoom 2025–2026
 * Scroll activa periodos en secuencia · highlight plugin integrado
 */

// ── Periodos históricos con narrativa ─────────────────────────────────────
const PERIODS = [
  {
    id: 'p1987',
    label: '1987–2003',
    title: 'Petróleo barato y estabilidad relativa',
    start: '1987-01',
    end:   '2002-12',
    color:  'rgba(100,160,100,0.18)',
    borderColor: 'rgba(100,180,100,0.55)',
    body: 'El Brent se mantiene principalmente entre 10 y 30 USD. Mercado dominado por la oferta de la OPEC. La demanda global aún no experimenta el gran impulso de las economías emergentes. Un pico temporal en 1990 por la <strong>Guerra del Golfo</strong> fue seguido de rápida normalización.',
  },
  {
    id: 'p2003',
    label: '2003–2008',
    title: 'El superciclo de commodities',
    start: '2003-01',
    end:   '2008-07',
    color:  'rgba(212,160,23,0.18)',
    borderColor: 'rgba(212,160,23,0.6)',
    body: 'El precio sube de ~30 USD a más de 130 USD. El crecimiento acelerado de la demanda energética en <strong>China e India</strong> y la fuerte expansión industrial global impulsan el consumo. El ciclo termina abruptamente con la <strong>Crisis Financiera Global de 2008</strong>.',
  },
  {
    id: 'p2011',
    label: '2011–2014',
    title: 'La era del petróleo caro',
    start: '2011-01',
    end:   '2014-07',
    color:  'rgba(192,57,43,0.16)',
    borderColor: 'rgba(192,57,43,0.5)',
    body: 'El Brent se mantiene en torno a 100–120 USD durante varios años. La inestabilidad política en Oriente Medio tras la <strong>Primavera Árabe</strong> eleva las primas de riesgo geopolítico. Un periodo de altos ingresos para los países exportadores.',
  },
  {
    id: 'p2014',
    label: '2014–2016',
    title: 'Revolución del shale y colapso',
    start: '2014-07',
    end:   '2016-01',
    color:  'rgba(80,130,255,0.15)',
    borderColor: 'rgba(80,130,255,0.5)',
    body: 'El petróleo cae de ~110 USD a cerca de 30 USD. La producción de <strong>shale en EE.UU.</strong> aumenta drásticamente la oferta global; tecnologías como el fracking cambian la estructura del mercado. Una de las caídas de precios más rápidas de la historia reciente.',
  },
  {
    id: 'p2020',
    label: '2020',
    title: 'Shock histórico de demanda',
    start: '2020-01',
    end:   '2020-09',
    color:  'rgba(150,50,150,0.16)',
    borderColor: 'rgba(180,80,180,0.5)',
    body: 'La pandemia de <strong>COVID-19</strong> paraliza el transporte y la actividad económica. La demanda mundial de petróleo colapsa. El Brent cae cerca de 20 USD. La industria energética enfrenta uno de sus mayores shocks de demanda de la historia.',
  },
  {
    id: 'p2022',
    label: '2022',
    title: 'Shock geopolítico energético',
    start: '2022-01',
    end:   '2022-12',
    color:  'rgba(192,57,43,0.20)',
    borderColor: 'rgba(192,57,43,0.65)',
    body: 'El Brent vuelve a superar 120 USD. Impacto directo de la <strong>invasión rusa de Ucrania</strong>. Sanciones energéticas y reconfiguración del comercio de petróleo y gas. Europa acelera la diversificación de proveedores energéticos.',
  },
  {
    id: 'p2023',
    label: '2023–2025',
    title: 'Nueva era de volatilidad estructural',
    start: '2023-01',
    end:   '2025-12',
    color:  'rgba(212,160,23,0.12)',
    borderColor: 'rgba(212,160,23,0.40)',
    body: 'El precio oscila entre 60 y 100 USD. Mercado influenciado por tensiones geopolíticas y ajustes de producción. Mayor peso de la <strong>transición energética</strong> en las decisiones de inversión. El petróleo entra en una fase de volatilidad estructural.',
  },
]

// ── Cards del zoom 2025–2026 ───────────────────────────────────────────────
const RECENT_CARDS = [
  {
    icon: '📈',
    color: 'var(--red)',
    title: 'Escalada de precios',
    body: 'En menos de un mes el crudo Brent subió de 72 a más de 120 dólares — un aumento del <strong>66%</strong>.',
  },
  {
    icon: '⚡',
    color: 'var(--gold)',
    title: 'Energía en Asia y Europa',
    body: 'El precio del GNL en Asia se disparó un <strong>140%</strong>. En Europa el índice de gas TTF casi se duplicó.',
  },
  {
    icon: '📉',
    color: 'rgba(80,130,255,0.9)',
    title: 'Mercados financieros en caída',
    body: 'El Dow Jones perdió más de 400 puntos. El KOSPI coreano se desplomó un <strong>7.2%</strong> en una jornada (la peor en 2 años). Wall Street perdió un billón de dólares en una sola jornada.',
  },
  {
    icon: '🌾',
    color: 'rgba(100,180,100,0.9)',
    title: 'Crisis alimentaria',
    body: 'El Golfo es proveedor clave de urea y amoníaco. Los fertilizantes han registrado subidas superiores al <strong>28%</strong>, con algunos productos clave como la urea mostrando incrementos cercanos al <strong>45%</strong>.',
  },
  {
    icon: '🌐',
    color: 'rgba(180,80,180,0.9)',
    title: 'Estanflación global',
    body: 'Alta inflación, bajo crecimiento y aumento del desempleo. El mundo enfrenta el escenario económico más adverso desde 2008.',
  },
]

// ── Helpers CSV ───────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split('\n').slice(1)
  return lines.map(line => {
    const cols = line.split(',')
    return { date: cols[cols.length - 2].trim(), price: parseFloat(cols[cols.length - 1]) }
  }).filter(d => d.date && !isNaN(d.price))
}

// ── Estado ────────────────────────────────────────────────────────────────
let _activePeriod     = null
let _historicData     = []
let _recentData       = []
let _historicCtx      = null
let _recentCtx        = null
let _historicChart    = null
let _recentChart      = null
let _pluginRegistered = false

// ── Init ──────────────────────────────────────────────────────────────────
export function initEconomic() {
  const section = document.getElementById('economic-section')
  if (!section) return

  loadData().then(() => {
    registerHighlightPlugin()
    renderHistoricChart()
    renderRecentChart()
    buildPeriodCards()
    buildRecentCards()
    initReveal()
    initPeriodObserver()
  })
}

async function loadData() {
  try {
    const [mRes, rRes] = await Promise.all([
      fetch('./data/brent_monthly.csv'),
      fetch('./data/brent_recent.csv'),
    ])
    _historicData = parseCSV(await mRes.text())
    _recentData   = parseCSV(await rRes.text())
  } catch (e) {
    console.warn('economic.js: no se pudieron cargar los CSV', e)
  }
}

// ── Plugin Chart.js: rectángulo de resaltado sobre el periodo activo ──────
function registerHighlightPlugin() {
  if (_pluginRegistered) return
  _pluginRegistered = true

  Chart.register({
    id: 'periodHighlight',
    beforeDraw(chart) {
      const range = chart._highlightRange
      if (!range) return
      const { ctx, chartArea, scales } = chart
      if (!chartArea) return

      const xScale = scales.x
      const x1 = xScale.getPixelForValue(range.startIdx)
      const x2 = xScale.getPixelForValue(range.endIdx)
      const top    = chartArea.top
      const bottom = chartArea.bottom

      ctx.save()

      // Relleno semitransparente
      ctx.fillStyle = range.color
      ctx.fillRect(x1, top, x2 - x1, bottom - top)

      // Línea de entrada (izquierda) — sólida
      ctx.strokeStyle = range.borderColor
      ctx.lineWidth = 2
      ctx.setLineDash([])
      ctx.beginPath()
      ctx.moveTo(x1, top)
      ctx.lineTo(x1, bottom)
      ctx.stroke()

      // Línea de salida (derecha) — punteada suave
      ctx.strokeStyle = range.borderColor.replace(/[\d.]+\)$/, m => {
        const alpha = parseFloat(m)
        return `${Math.max(alpha - 0.25, 0.1)})`
      })
      ctx.lineWidth = 1
      ctx.setLineDash([4, 5])
      ctx.beginPath()
      ctx.moveTo(x2, top)
      ctx.lineTo(x2, bottom)
      ctx.stroke()

      ctx.setLineDash([])
      ctx.restore()
    }
  })
}

// ── Gráfico histórico ─────────────────────────────────────────────────────
function renderHistoricChart() {
  const canvas = document.getElementById('ec-historic-canvas')
  if (!canvas || !_historicData.length) return

  _historicCtx = canvas.getContext('2d')
  const labels = _historicData.map(d => d.date)
  const data   = _historicData.map(d => d.price)

  _historicChart = new Chart(_historicCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: 'rgba(212,160,23,0.80)',
        borderWidth: 1.5,
        pointRadius: 0,
        fill: true,
        backgroundColor: createGradient(_historicCtx, canvas.offsetHeight || 300),
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 600 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,13,13,0.92)',
          borderColor: 'rgba(212,160,23,0.3)',
          borderWidth: 1,
          titleColor: 'rgba(245,240,232,0.9)',
          bodyColor: 'rgba(245,240,232,0.6)',
          callbacks: {
            title: items => items[0].label.substring(0, 7),
            label: item => `  $${item.raw.toFixed(1)} USD`,
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'rgba(245,240,232,0.3)',
            font: { family: "'Source Serif 4', serif", size: 9 },
            maxTicksLimit: 10,
            maxRotation: 0,
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: {
            color: 'rgba(245,240,232,0.3)',
            font: { family: "'Source Serif 4', serif", size: 9 },
            callback: v => '$' + v,
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        }
      }
    }
  })
}

// ── Gráfico reciente ──────────────────────────────────────────────────────
function renderRecentChart() {
  const canvas = document.getElementById('ec-recent-canvas')
  if (!canvas || !_recentData.length) return

  _recentCtx = canvas.getContext('2d')

  const filtered = _recentData.filter(d => d.date >= '2025-01-01')
  const labels   = filtered.map(d => d.date)
  const data     = filtered.map(d => d.price)

  const pointColors = data.map(v =>
    v > 100 ? 'rgba(192,57,43,0.9)' : v > 80 ? 'rgba(212,160,23,0.8)' : 'rgba(245,240,232,0.3)'
  )

  _recentChart = new Chart(_recentCtx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data,
        borderColor: ctx => {
          if (!ctx.chart.chartArea) return 'rgba(212,160,23,0.8)'
          return createRecentGradient(ctx, data)
        },
        borderWidth: 2,
        pointRadius: data.map((v, i) => (i === data.length - 1 ? 5 : v > 100 ? 2 : 0)),
        pointBackgroundColor: pointColors,
        fill: true,
        backgroundColor: createRecentFillGradient(_recentCtx, 300),
        tension: 0.3,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1000 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,13,13,0.95)',
          borderColor: 'rgba(192,57,43,0.4)',
          borderWidth: 1,
          titleColor: 'rgba(245,240,232,0.9)',
          bodyColor: 'rgba(245,240,232,0.6)',
          callbacks: {
            title: items => items[0].label,
            label: item => `  $${item.raw.toFixed(2)} USD`,
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'rgba(245,240,232,0.3)',
            font: { family: "'Source Serif 4', serif", size: 9 },
            maxTicksLimit: 8,
            maxRotation: 0,
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        },
        y: {
          ticks: {
            color: 'rgba(245,240,232,0.3)',
            font: { family: "'Source Serif 4', serif", size: 9 },
            callback: v => '$' + v,
          },
          grid: { color: 'rgba(255,255,255,0.04)' },
        }
      }
    }
  })
}

// ── Gradientes ────────────────────────────────────────────────────────────
function createGradient(ctx, height) {
  const grad = ctx.createLinearGradient(0, 0, 0, height || 300)
  grad.addColorStop(0,   'rgba(212,160,23,0.22)')
  grad.addColorStop(0.6, 'rgba(212,160,23,0.06)')
  grad.addColorStop(1,   'rgba(212,160,23,0.00)')
  return grad
}

function createRecentFillGradient(ctx, height) {
  const grad = ctx.createLinearGradient(0, 0, 0, height || 300)
  grad.addColorStop(0,   'rgba(192,57,43,0.25)')
  grad.addColorStop(0.5, 'rgba(192,57,43,0.08)')
  grad.addColorStop(1,   'rgba(192,57,43,0.00)')
  return grad
}

function createRecentGradient(ctx, data) {
  const { chartArea } = ctx.chart
  const grad = ctx.chart.ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0)
  const n = data.length
  data.forEach((v, i) => {
    const stop = i / Math.max(n - 1, 1)
    const col  = v > 100
      ? 'rgba(192,57,43,0.9)'
      : v > 80
        ? 'rgba(212,160,23,0.8)'
        : 'rgba(150,150,150,0.6)'
    grad.addColorStop(Math.min(stop, 1), col)
  })
  return grad
}

// ── Activar periodo: card + narración + highlight ─────────────────────────
function activatePeriod(id) {
  if (_activePeriod === id) return   // evitar re-renders innecesarios
  _activePeriod = id
  const period = PERIODS.find(p => p.id === id)
  if (!period) return

  // Cards
  document.querySelectorAll('.ec-period-card').forEach(c => {
    c.classList.toggle('active', c.dataset.period === id)
  })

  // Highlight en chart
  if (_historicChart && _historicData.length) {
    highlightPeriod(period)
  }

  // Narración con micro-fade
  const narration = document.getElementById('ec-narration')
  if (narration) {
    narration.classList.add('refreshing')
    setTimeout(() => {
      narration.innerHTML = `
        <span class="ec-narration-label">${period.label}</span>
        <h3 class="ec-narration-title">${period.title}</h3>
        <p class="ec-narration-body">${period.body}</p>
      `
      narration.classList.remove('refreshing')
    }, 180)
  }
}

function highlightPeriod(period) {
  if (!_historicChart) return
  const labels = _historicData.map(d => d.date)

  const startIdx = labels.findIndex(l => l >= period.start)
  const endIdx   = labels.findLastIndex(l => l <= period.end + '-31')
  if (startIdx < 0 || endIdx < 0) return

  _historicChart._highlightRange = {
    startIdx,
    endIdx,
    color:       period.color,
    borderColor: period.borderColor,
  }
  _historicChart.update('none')
}

// ── Cards de periodos ─────────────────────────────────────────────────────
function buildPeriodCards() {
  const container = document.getElementById('ec-period-cards')
  if (!container) return

  PERIODS.forEach(p => {
    const card = document.createElement('button')
    card.className = 'ec-period-card'
    card.dataset.period = p.id
    card.innerHTML = `
      <span class="ec-period-label">${p.label}</span>
      <span class="ec-period-title">${p.title}</span>
    `
    card.addEventListener('click', () => activatePeriod(p.id))
    container.appendChild(card)
  })

  activatePeriod(PERIODS[0].id)
}

// ── Cards recientes ───────────────────────────────────────────────────────
function buildRecentCards() {
  const container = document.getElementById('ec-recent-cards')
  if (!container) return

  RECENT_CARDS.forEach(c => {
    const el = document.createElement('div')
    el.className = 'ec-impact-card'
    el.style.setProperty('--ic', c.color)
    el.innerHTML = `
      <span class="ec-impact-icon">${c.icon}</span>
      <div class="ec-impact-body">
        <span class="ec-impact-title">${c.title}</span>
        <p class="ec-impact-text">${c.body}</p>
      </div>
    `
    container.appendChild(el)
  })
}

// ── Scroll reveal ─────────────────────────────────────────────────────────
function initReveal() {
  const els = document.querySelectorAll('.ec-screen, .ec-header')
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        obs.unobserve(e.target)
      }
    })
  }, { threshold: 0.05 })
  els.forEach(el => obs.observe(el))
}

// ── Scroll activa periodos en secuencia ───────────────────────────────────
// La sección #ec-screen-historic tiene min-height: 700vh (CSS).
// Dentro colocamos sentinels invisibles distribuidos en altura.
// Al scrollear, cada sentinel que entra al centro del viewport
// activa el periodo correspondiente.
function initPeriodObserver() {
  const historicSection = document.getElementById('ec-screen-historic')
  if (!historicSection) return

  // Contenedor de sentinels (position:absolute dentro de la sección)
  historicSection.style.position = 'relative'
  const sc = document.createElement('div')
  sc.setAttribute('aria-hidden', 'true')
  sc.style.cssText = `
    position: absolute;
    top: 0; left: 0;
    width: 1px; height: 100%;
    pointer-events: none;
  `
  historicSection.appendChild(sc)

  // Distribuir un sentinel por periodo, espaciados uniformemente
  PERIODS.forEach((p, i) => {
    const s = document.createElement('div')
    // Offset: deja un margen de 5% al inicio y al final
    const pct = 5 + (i / Math.max(PERIODS.length - 1, 1)) * 90
    s.style.cssText = `
      position: absolute;
      top: ${pct}%;
      left: 0;
      width: 1px; height: 1px;
    `
    s.dataset.periodIndex = i
    sc.appendChild(s)
  })

  const sentinels = sc.querySelectorAll('[data-period-index]')

  const obs = new IntersectionObserver((entries) => {
    // Elegir el sentinel más avanzado (mayor índice) que esté en el viewport
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) =>
        parseInt(b.target.dataset.periodIndex) - parseInt(a.target.dataset.periodIndex)
      )
    if (visible.length > 0) {
      const idx = parseInt(visible[0].target.dataset.periodIndex)
      activatePeriod(PERIODS[idx].id)
    }
  }, {
    threshold: 0,
    rootMargin: '-38% 0px -38% 0px',  // activa cuando el sentinel pasa por la franja central
  })

  sentinels.forEach(s => obs.observe(s))

  // ── Impact cards (pantalla reciente) ────────────────────────────────────
  const impactCards   = document.querySelectorAll('.ec-impact-card')
  const recentSection = document.getElementById('ec-screen-recent')

  if (recentSection && impactCards.length) {
    const cardObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          impactCards.forEach((c, i) => {
            setTimeout(() => c.classList.add('visible'), i * 130)
          })
          cardObs.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    cardObs.observe(recentSection)
  }
}