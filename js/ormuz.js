/**
 * ormuz.js — Capítulo III: El Estrecho de Ormuz
 * Maneja: scroll reveal, mapa por pantalla, animaciones
 */

const ORMUZ_SCREEN_MAP_STEPS = {
  'oz-screen-01': 'oz01',   // 33 km ancho + volumen básico — zoom Ormuz
  'oz-screen-02': 'oz01',   // 21M barriles + porcentajes — misma vista
  'oz-screen-03': 'oz02',   // Dependencia por país — vista Golfo + Asia
  'oz-screen-04': 'oz03',   // Peaje / Yuan — Ormuz heatmap
  'oz-screen-05': 'oz04',   // Kharg Island — zoom a isla Kharg
}

let _ozUpdateMap = null

export function initOrmuz(updateMapFn) {
  const section = document.getElementById('ormuz-section')
  if (!section) return

  _ozUpdateMap = updateMapFn

  initOzScreenObserver()
  initOzScrollReveal()
  initOzDepBars()
}

// ── Observer: activa mapa según pantalla visible ──────────────────────────
function initOzScreenObserver() {
  const screens = document.querySelectorAll('.oz-screen[data-screen]')
  if (!screens.length) return

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => {
        const aC = Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - window.innerHeight / 2)
        const bC = Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - window.innerHeight / 2)
        return aC - bC
      })

    if (visible.length > 0 && _ozUpdateMap) {
      const screenId = visible[0].target.dataset.screen
      const mapStep = ORMUZ_SCREEN_MAP_STEPS[screenId]
      _ozUpdateMap(mapStep !== undefined && mapStep !== null ? mapStep : 'off')
    }
  }, {
    threshold: [0.3, 0.5],
    rootMargin: '0px 0px 0px 0px'
  })

  screens.forEach(s => observer.observe(s))
}

// ── Scroll reveal ─────────────────────────────────────────────────────────
function initOzScrollReveal() {
  const screens = document.querySelectorAll('.oz-screen')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.10 })
  screens.forEach(s => observer.observe(s))
}

// ── Barras de dependencia por país ────────────────────────────────────────
function initOzDepBars() {
  const fills = document.querySelectorAll('.oz-dep-fill')
  if (!fills.length) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fills.forEach(f => f.classList.add('animated'))
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.4 })

  const depList = document.querySelector('.oz-dep-list')
  if (depList) observer.observe(depList)
}
