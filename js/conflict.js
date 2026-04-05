/**
 * conflict.js
 * Sección "El Conflicto Actual"
 * - IntersectionObserver por bloque → dispara updateMap(step)
 * - Bloques con mapa: columna derecha transparente
 * - Bloques sin mapa: updateMap('off') + fondo sólido tapa visualmente
 * - Scroll reveal, barras animadas, Chart.js
 */

const BLOCK_MAP_STEPS = {
  'cf-block-01': 'c01',   // Contexto: Ucrania → Golfo (vista amplia)
  'cf-block-04': null,    // Dependencia energética — barras, sin mapa
  'cf-block-05': null,    // Guerra de desgaste — chart, sin mapa
  'cf-block-06': null,    // China — sin mapa
  'cf-block-09': null,    // Cadena económica — sin mapa
  'cf-block-10': null,    // Escenarios — sin mapa
  // Bloque 03 migrado a strategy section (st-screen-03)
  // Bloques 02, 07, 08 migrados a strategy section
}

let _updateMap = null

export function initConflict(updateMapFn) {
  const section = document.getElementById("conflict-section")
  if (!section) return

  _updateMap = updateMapFn

  initBlockObserver()
  initHeaderMap()
  initScrollReveal()
  initCostBars()
  initDepBars()
  initCharts()
}


// ── Activa el mapa cuando el header full-width entra en viewport ──────────
function initHeaderMap() {
  const header = document.querySelector('.cf-header')
  if (!header || !_updateMap) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      // Vista global: Oriente Medio visible, centrado
      _updateMap('off')
      // Pequeño delay para que el fade del mapa se vea
      setTimeout(() => {
        const mapEl = document.getElementById('map')
        if (mapEl) mapEl.style.opacity = '1'
        // Llamar flyTo directamente via window._updateMap con step especial
        if (_updateMap) _updateMap('c01')
      }, 300)
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.3 })

  observer.observe(header)
}

// ── Observer: detecta bloque activo y dispara el mapa ────────────────────
function initBlockObserver() {
  const blocks = document.querySelectorAll(".cf-block[data-block]")
  if (!blocks.length) return

  function activateBlock(blockId) {
    if (!_updateMap) return
    const mapStep = BLOCK_MAP_STEPS[blockId]
    _updateMap(mapStep != null ? mapStep : 'off')
  }

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => {
        const aC = Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - window.innerHeight / 2)
        const bC = Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - window.innerHeight / 2)
        return aC - bC
      })
    if (visible.length > 0) activateBlock(visible[0].target.dataset.block)
  }, {
    threshold: [0.2, 0.4, 0.6],
    rootMargin: '0px 0px 0px 0px'
  })

  blocks.forEach(b => observer.observe(b))

  // Verificar bloques ya visibles al iniciar (el scroll ya pudo haber pasado)
  requestAnimationFrame(() => {
    const vh = window.innerHeight
    let closest = null
    let closestDist = Infinity
    blocks.forEach(b => {
      const rect = b.getBoundingClientRect()
      if (rect.top >= vh || rect.bottom <= 0) return
      const dist = Math.abs(rect.top + rect.height / 2 - vh / 2)
      if (dist < closestDist) { closestDist = dist; closest = b }
    })
    if (closest) activateBlock(closest.dataset.block)
  })
}

// ── Scroll reveal de bloques ──────────────────────────────────────────────
function initScrollReveal() {
  const blocks = document.querySelectorAll(".cf-block")
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.10 })
  blocks.forEach(b => observer.observe(b))
}

// ── Barras de costo (Bloque 02) ───────────────────────────────────────────
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

// ── Barras de dependencia (Bloque 04) ────────────────────────────────────
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

// ── Charts ────────────────────────────────────────────────────────────────
function initCharts() {
  const tryInit = () => {
    if (typeof Chart === "undefined") { setTimeout(tryInit, 120); return }
    buildAttritionChart()
    buildProxyChart()
  }
  tryInit()
}

function buildAttritionChart() {
  const canvas = document.getElementById("cf-attrition-chart")
  if (!canvas || canvas._built) return
  canvas._built = true

  const cream = "rgba(245,240,232,"
  const gold  = "#d4a017"
  const red   = "#c0392b"
  const blue  = "rgba(30,80,160,0.85)"
  const ctx   = canvas.getContext("2d")

  const gradUSA = ctx.createLinearGradient(0, 0, 0, 260)
  gradUSA.addColorStop(0, "rgba(30,80,160,0.2)")
  gradUSA.addColorStop(1, "rgba(30,80,160,0.0)")

  const gradIran = ctx.createLinearGradient(0, 0, 0, 260)
  gradIran.addColorStop(0, "rgba(192,57,43,0.2)")
  gradIran.addColorStop(1, "rgba(192,57,43,0.0)")

  new Chart(canvas, {
    type: "line",
    data: {
      labels: ['1m','2m','3m','4m','6m','9m','12m','18m','2a','3a','4a','5a'],
      datasets: [
        {
          label: "Costo acumulado EE.UU. ($B)",
          data: [8,18,35,55,85,130,190,310,450,700,950,1200],
          borderColor: blue, borderWidth: 2,
          backgroundColor: gradUSA, fill: true,
          tension: 0.4, pointRadius: 0, pointHoverRadius: 4,
          yAxisID: "y"
        },
        {
          label: "Cap. operativa Irán (índice)",
          data: [100,88,78,68,58,50,45,40,37,33,31,29],
          borderColor: red, borderWidth: 2,
          backgroundColor: gradIran, fill: true,
          tension: 0.4, pointRadius: 0, pointHoverRadius: 4,
          borderDash: [6,4], yAxisID: "y1"
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: true, aspectRatio: 2,
      animation: { duration: 1600, easing: "easeInOutQuart" },
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: true, labels: { color: cream+"0.5)", font:{size:10}, boxWidth:20, padding:12 } },
        tooltip: { backgroundColor:"rgba(13,13,13,0.95)", borderColor:"rgba(212,160,23,0.3)", borderWidth:1, titleColor:gold, bodyColor:cream+"0.7)", padding:10 }
      },
      scales: {
        x: { grid:{color:"rgba(255,255,255,0.04)"}, ticks:{color:cream+"0.3)",font:{size:9}} },
        y: { position:"left", grid:{color:"rgba(255,255,255,0.04)"}, ticks:{color:cream+"0.3)",font:{size:9},callback:v=>`$${v}B`}, min:0 },
        y1: { position:"right", grid:{display:false}, ticks:{color:cream+"0.3)",font:{size:9}}, min:0, max:110 }
      }
    }
  })
}

function buildProxyChart() {
  const canvas = document.getElementById("cf-proxy-chart")
  if (!canvas || canvas._built) return
  canvas._built = true

  const cream = "rgba(245,240,232,"
  const gold  = "#d4a017"

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Hezbollah","Houthis","Kataib Hezb.","Hamas","Res. Iraq"],
      datasets: [
        {
          label: "Nivel de actividad",
          data: [82,75,68,90,71],
          backgroundColor: ["rgba(230,126,34,0.7)","rgba(212,160,23,0.65)","rgba(192,57,43,0.6)","rgba(192,57,43,0.75)","rgba(212,160,23,0.5)"],
          borderWidth:1, borderRadius:2
        },
        {
          label: "Costo estratégico EE.UU.",
          data: [65,55,42,88,48],
          backgroundColor:"rgba(30,80,160,0.3)",
          borderColor:"rgba(80,130,255,0.4)",
          borderWidth:1, borderRadius:2
        }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:true, aspectRatio:1.6,
      animation:{duration:1400,easing:"easeInOutQuart"},
      plugins: {
        legend:{display:true,labels:{color:cream+"0.5)",font:{size:9},boxWidth:16,padding:10}},
        tooltip:{backgroundColor:"rgba(13,13,13,0.95)",borderColor:"rgba(212,160,23,0.3)",borderWidth:1,titleColor:gold,bodyColor:cream+"0.7)",padding:10}
      },
      scales: {
        x:{grid:{display:false},ticks:{color:cream+"0.35)",font:{size:9},maxRotation:0}},
        y:{grid:{color:"rgba(255,255,255,0.04)"},ticks:{color:cream+"0.3)",font:{size:9},callback:v=>v+"%"},min:0,max:100}
      }
    }
  })
}