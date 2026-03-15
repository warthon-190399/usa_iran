/**
 * economic.js
 * Sección de impacto económico global.
 * Maneja: gráfico de petróleo (Chart.js), contadores animados, scroll reveals.
 */

// ── Datos: precio del crudo Brent ajustado (USD 2024) ────────────────────
// Puntos representativos por año, no datos diarios
const OIL_DATA = {
  labels: [
    1970,1971,1972,1973,1974,1975,1976,1977,1978,1979,
    1980,1981,1982,1983,1984,1985,1986,1987,1988,1989,
    1990,1991,1992,1993,1994,1995,1996,1997,1998,1999,
    2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,
    2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,
    2020,2021,2022,2023,2024
  ],
  values: [
    14, 14, 14, 22, 58, 56, 56, 57, 54, 94,
    110,103, 88, 82, 78, 72, 40, 42, 35, 38,
    52, 38, 35, 30, 28, 30, 34, 32, 20, 24,
    38, 34, 34, 40, 52, 68, 76, 90,105, 72,
    90,115,118,116, 99, 55, 48, 58, 75, 68,
    44, 80,105, 86, 82
  ]
}

// ── Eventos clave para anotaciones ───────────────────────────────────────
const OIL_EVENTS = [
  { year: 1979, label: "Revolución iraní" },
  { year: 1980, label: "Guerra Irán–Irak" },
  { year: 2015, label: "JCPOA" },
  { year: 2018, label: "Salida del JCPOA" },
  { year: 2020, label: "Soleimani" }
]

export function initEconomic() {
  const section = document.getElementById("economic-section")
  if (!section) return

  // Scroll reveal de los bloques
  initScrollReveal()

  // Gráfico (solo cuando el bloque entra en viewport)
  initOilChart()

  // Contadores (se activan al entrar en viewport)
  initCounters()
}

// ── Scroll reveal ─────────────────────────────────────────────────────────
function initScrollReveal() {
  const blocks = document.querySelectorAll(".eco-block")

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.15 })

  blocks.forEach(b => observer.observe(b))
}

// ── Gráfico de petróleo ───────────────────────────────────────────────────
function initOilChart() {
  const canvas = document.getElementById("oil-chart")
  if (!canvas) return

  // Esperar a Chart.js (cargado en index.html via CDN)
  const tryInit = () => {
    if (typeof Chart === "undefined") {
      setTimeout(tryInit, 100)
      return
    }
    buildChart(canvas)
  }
  tryInit()
}

function buildChart(canvas) {
  // Solo construir una vez
  if (canvas._chartBuilt) return
  canvas._chartBuilt = true

  const cream  = "rgba(245,240,232,"
  const gold   = "#d4a017"
  const red    = "#c0392b"

  Chart.defaults.color = cream + "0.4)"
  Chart.defaults.font.family = "'Source Serif 4', serif"

  const gradient = canvas.getContext("2d").createLinearGradient(0, 0, 0, 280)
  gradient.addColorStop(0,   "rgba(192,57,43,0.25)")
  gradient.addColorStop(0.6, "rgba(192,57,43,0.06)")
  gradient.addColorStop(1,   "rgba(192,57,43,0.0)")

  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: OIL_DATA.labels,
      datasets: [{
        data: OIL_DATA.values,
        borderColor: red,
        borderWidth: 1.8,
        backgroundColor: gradient,
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: red,
        pointHoverBorderColor: cream + "0.9)"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1800,
        easing: "easeInOutQuart"
      },
      interaction: {
        mode: "index",
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(13,13,13,0.95)",
          borderColor:     "rgba(212,160,23,0.35)",
          borderWidth: 1,
          titleColor: gold,
          bodyColor:  cream + "0.75)",
          padding: 10,
          callbacks: {
            title: ctx => ctx[0].label,
            label: ctx => ` $${ctx.parsed.y} / barril`
          }
        }
      },
      scales: {
        x: {
          grid:  { color: "rgba(255,255,255,0.04)", drawBorder: false },
          ticks: {
            color: cream + "0.3)",
            maxTicksLimit: 11,
            font: { size: 10 }
          }
        },
        y: {
          grid:  { color: "rgba(255,255,255,0.04)", drawBorder: false },
          ticks: {
            color: cream + "0.3)",
            font: { size: 10 },
            callback: v => `$${v}`
          },
          min: 0,
          suggestedMax: 130
        }
      }
    }
  })

  // Anotaciones verticales superpuestas como elementos DOM
  // (Chart.js sin plugin de anotaciones — lo hacemos con CSS absoluto)
  requestAnimationFrame(() => buildAnnotations(chart))
}

function buildAnnotations(chart) {
  const wrap = document.querySelector(".eco-chart-wrap")
  const container = document.getElementById("oil-annotations")
  if (!wrap || !container) return

  const meta   = chart.getDatasetMeta(0)
  const points  = meta.data

  OIL_EVENTS.forEach(ev => {
    const idx = OIL_DATA.labels.indexOf(ev.year)
    if (idx < 0 || !points[idx]) return

    const x   = points[idx].x
    const pct = (x / wrap.offsetWidth) * 100

    const ann = document.createElement("div")
    ann.className = "eco-annotation"
    ann.style.left = pct + "%"
    ann.innerHTML = `
      <div class="eco-annotation-line" style="height:${wrap.offsetHeight}px;"></div>
      <div class="eco-annotation-label">${ev.year} · ${ev.label}</div>
    `
    container.appendChild(ann)
  })
}

// ── Contadores animados ───────────────────────────────────────────────────
function initCounters() {
  const cards = document.querySelectorAll(".eco-counter-card[data-target]")

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const card = entry.target
      if (card.classList.contains("counted")) return
      card.classList.add("counted")
      animateCounter(card)
      observer.unobserve(card)
    })
  }, { threshold: 0.5 })

  cards.forEach(c => observer.observe(c))
}

function animateCounter(card) {
  const target   = parseFloat(card.dataset.target)
  const decimals = parseInt(card.dataset.decimals || "0")
  const numEl    = card.querySelector(".ecc-num")
  if (!numEl) return

  const duration = 1800
  const start    = performance.now()

  function step(now) {
    const elapsed  = now - start
    const progress = Math.min(elapsed / duration, 1)
    // Ease out cubic
    const eased    = 1 - Math.pow(1 - progress, 3)
    const current  = target * eased
    numEl.textContent = decimals > 0
      ? current.toFixed(decimals)
      : Math.round(current).toLocaleString()
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}