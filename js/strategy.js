/**
 * strategy.js
 * Bloque 3 — Estrategia Militar y Modelo de Guerra
 * Maneja: scroll reveal, mapa por pantalla, animaciones de barras y tabla de costos
 */

const SCREEN_MAP_STEPS = {
  'st-screen-01': null,    // Doctrinas — sin mapa, tabla de costos
  'st-screen-02': 'c07',   // Arquitectura defensiva — mapa Irán interior
  'st-screen-03': 'c03',   // La respuesta iraní: guerra indirecta — objetivos en el Golfo
  'st-screen-04': 'c08',   // Eje de Resistencia — mapa red de proxies
}

let _updateMap = null

export function initStrategy(updateMapFn) {
  const section = document.getElementById('strategy-section')
  if (!section) return

  _updateMap = updateMapFn

  initScreenObserver()
  initScrollReveal()
  initCostTable()
  initEnduranceBars()
}

// ── Observer: activa mapa según pantalla visible ──────────────────────────
function initScreenObserver() {
  const screens = document.querySelectorAll('.st-screen[data-screen]')
  if (!screens.length) return

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => {
        const aC = Math.abs(a.boundingClientRect.top + a.boundingClientRect.height / 2 - window.innerHeight / 2)
        const bC = Math.abs(b.boundingClientRect.top + b.boundingClientRect.height / 2 - window.innerHeight / 2)
        return aC - bC
      })

    if (visible.length > 0 && _updateMap) {
      const screenId = visible[0].target.dataset.screen
      const mapStep  = SCREEN_MAP_STEPS[screenId]
      _updateMap(mapStep !== undefined && mapStep !== null ? mapStep : 'off')
    }
  }, {
    threshold: [0.3, 0.5],
    rootMargin: '0px 0px 0px 0px'
  })

  screens.forEach(s => observer.observe(s))
}

// ── Scroll reveal de pantallas ────────────────────────────────────────────
function initScrollReveal() {
  const screens = document.querySelectorAll('.st-screen')
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

// ── Tabla de costos (Pantalla 1) — aparición en cascada ──────────────────
function initCostTable() {
  const rows = document.querySelectorAll('.st-cost-row')
  if (!rows.length) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        rows.forEach(r => r.classList.add('visible'))
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.3 })

  // Observar el contenedor padre
  const table = document.querySelector('.st-cost-table')
  if (table) observer.observe(table)
}

// ── Barras de resistencia/desgaste (Pantalla 4) ──────────────────────────
function initEnduranceBars() {
  const fills = document.querySelectorAll('.st-endurance-fill')
  if (!fills.length) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        fills.forEach(f => f.classList.add('animated'))
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.4 })

  const endurance = document.querySelector('.st-endurance')
  if (endurance) observer.observe(endurance)
}