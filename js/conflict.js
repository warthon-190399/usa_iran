/**
 * conflict.js
 * Sección "El Conflicto Actual" — entre Timeline y Grafo
 * Maneja: scroll reveal, Chart.js (costos, petróleo, desgaste),
 *         barras animadas (dependencia energética, costo asimétrico),
 *         y activación progresiva de bloques.
 */

export function initConflict() {
  const section = document.getElementById("conflict-section")
  if (!section) return

  initBlockReveal()
  initCostBars()
  initDepBars()
  initCharts()
}

// ── Scroll reveal de bloques ──────────────────────────────────────────────
function initBlockReveal() {
  const blocks = document.querySelectorAll(".cf-block")
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })
  blocks.forEach(b => observer.observe(b))
}

// ── Barras animadas: costo asimétrico (Bloque 2) ─────────────────────────
function initCostBars() {
  const bars = document.querySelectorAll(".cf-cost-bar")
  if (!bars.length) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated")
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.5 })

  bars.forEach(b => observer.observe(b))
}

// ── Barras animadas: dependencia energética (Bloque 4) ───────────────────
function initDepBars() {
  const fills = document.querySelectorAll(".cf-dep-fill")
  if (!fills.length) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animated")
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.4 })

  fills.forEach(f => observer.observe(f))
}

// ── Charts Chart.js ───────────────────────────────────────────────────────
function initCharts() {
  const tryInit = () => {
    if (typeof Chart === "undefined") {
      setTimeout(tryInit, 120)
      return
    }
    buildWarAttritionChart()
    buildProxyFrontsChart()
  }
  tryInit()
}

// Bloque 5: Conflicto rápido vs Guerra de desgaste
function buildWarAttritionChart() {
  const canvas = document.getElementById("cf-attrition-chart")
  if (!canvas || canvas._built) return
  canvas._built = true

  const cream  = "rgba(245,240,232,"
  const red    = "#c0392b"
  const blue   = "rgba(30,80,160,0.85)"
  const gold   = "#d4a017"

  const months = [1,2,3,4,6,9,12,18,24,36,48,60]
  const labels = months.map(m => m < 12 ? `${m}m` : `${m/12}a`)

  // Costo acumulado EE.UU. (en miles de M$) — crece rápido al inicio, luego más lento
  const costUSA  = [8, 18, 35, 55, 85, 130, 190, 310, 450, 700, 950, 1200]
  // Capacidad operativa iraní (índice 100 → degradándose pero resiste)
  const capIran  = [100, 88, 78, 68, 58, 50, 45, 40, 37, 33, 31, 29]

  Chart.defaults.color = cream + "0.4)"
  Chart.defaults.font.family = "'Source Serif 4', serif"

  const ctx = canvas.getContext("2d")

  const gradUSA = ctx.createLinearGradient(0, 0, 0, 260)
  gradUSA.addColorStop(0, "rgba(30,80,160,0.2)")
  gradUSA.addColorStop(1, "rgba(30,80,160,0.0)")

  const gradIran = ctx.createLinearGradient(0, 0, 0, 260)
  gradIran.addColorStop(0, "rgba(192,57,43,0.2)")
  gradIran.addColorStop(1, "rgba(192,57,43,0.0)")

  new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Costo acumulado EE.UU. ($B)",
          data: costUSA,
          borderColor: blue,
          borderWidth: 2,
          backgroundColor: gradUSA,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          yAxisID: "y"
        },
        {
          label: "Capacidad operativa Irán (índice)",
          data: capIran,
          borderColor: red,
          borderWidth: 2,
          backgroundColor: gradIran,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          borderDash: [6, 4],
          yAxisID: "y1"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      animation: { duration: 1600, easing: "easeInOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: cream + "0.55)",
            font: { size: 10 },
            boxWidth: 20,
            padding: 14
          }
        },
        tooltip: {
          backgroundColor: "rgba(13,13,13,0.95)",
          borderColor: "rgba(212,160,23,0.3)",
          borderWidth: 1,
          titleColor: gold,
          bodyColor: cream + "0.7)",
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: { color: cream + "0.3)", font: { size: 9 } }
        },
        y: {
          position: "left",
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: cream + "0.3)",
            font: { size: 9 },
            callback: v => `$${v}B`
          },
          min: 0
        },
        y1: {
          position: "right",
          grid: { display: false },
          ticks: {
            color: cream + "0.3)",
            font: { size: 9 },
            callback: v => v
          },
          min: 0,
          max: 110
        }
      }
    }
  })
}

// Bloque 8: Frentes proxy — radar/bar de actividad
function buildProxyFrontsChart() {
  const canvas = document.getElementById("cf-proxy-chart")
  if (!canvas || canvas._built) return
  canvas._built = true

  const cream = "rgba(245,240,232,"
  const gold  = "#d4a017"

  const proxies = ["Hezbollah\n(Líbano)", "Houthis\n(Yemen)", "Kataib\nHezb.", "Hamas\n(Gaza)", "Res.Islámica\nIrak"]
  const actividad = [82, 75, 68, 90, 71]
  const costoUSA  = [65, 55, 42, 88, 48]

  const colors = [
    "rgba(192,57,43,0.75)",
    "rgba(212,160,23,0.65)",
    "rgba(149,165,166,0.6)",
    "rgba(192,57,43,0.6)",
    "rgba(212,160,23,0.5)"
  ]

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: proxies,
      datasets: [
        {
          label: "Nivel de actividad",
          data: actividad,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace("0.", "0.9").replace(",0.75)", ",1)").replace(",0.65)", ",1)").replace(",0.6)", ",1)").replace(",0.5)", ",0.9)")),
          borderWidth: 1,
          borderRadius: 2
        },
        {
          label: "Costo estratégico p/EE.UU.",
          data: costoUSA,
          backgroundColor: "rgba(30,80,160,0.25)",
          borderColor: "rgba(80,130,255,0.4)",
          borderWidth: 1,
          borderRadius: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.6,
      animation: { duration: 1400, easing: "easeInOutQuart" },
      plugins: {
        legend: {
          display: true,
          labels: {
            color: cream + "0.5)",
            font: { size: 9 },
            boxWidth: 16,
            padding: 10
          }
        },
        tooltip: {
          backgroundColor: "rgba(13,13,13,0.95)",
          borderColor: "rgba(212,160,23,0.3)",
          borderWidth: 1,
          titleColor: gold,
          bodyColor: cream + "0.7)",
          padding: 10
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: cream + "0.35)",
            font: { size: 8 },
            maxRotation: 0
          }
        },
        y: {
          grid: { color: "rgba(255,255,255,0.04)" },
          ticks: {
            color: cream + "0.3)",
            font: { size: 9 },
            callback: v => v + "%"
          },
          min: 0,
          max: 100
        }
      }
    }
  })
}