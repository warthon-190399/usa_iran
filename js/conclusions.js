/**
 * conclusions.js — Conclusiones + Autor + Índice de capítulos
 */

// ── Capítulos para el índice ──────────────────────────────────────────────
const CHAPTERS = [
  { id: 'hero',              label: 'Intro' },
  { id: 'bridge-section',   label: 'Cronología' },
  { id: 'timeline-section', label: 'Historia' },
  { id: 'strategy-section', label: 'Estrategia' },
  { id: 'conflict-section', label: 'Conflicto' },
  { id: 'ormuz-section',    label: 'Ormuz' },
  { id: 'economic-section', label: 'Economía' },
  { id: 'actors-section',   label: 'Actores' },
  { id: 'scenarios-section',label: 'Escenarios' },
  { id: 'conclusions-section', label: 'Conclusiones' },
]

export function initConclusions() {
  initConclusionsReveal()
  initAuthorReveal()
  buildChapterIndex()
}

// ── Reveal conclusiones ───────────────────────────────────────────────────
function initConclusionsReveal() {
  const points  = document.querySelectorAll('.cn-point')
  const closing = document.querySelector('.cn-closing')

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        obs.unobserve(e.target)
      }
    })
  }, { threshold: 0.12 })

  points.forEach(p => obs.observe(p))
  if (closing) obs.observe(closing)
}

// ── Reveal autor ──────────────────────────────────────────────────────────
function initAuthorReveal() {
  const inner = document.querySelector('.au-inner')
  if (!inner) return

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        obs.unobserve(e.target)
      }
    })
  }, { threshold: 0.15 })

  obs.observe(inner)
}

// ── Índice de capítulos ───────────────────────────────────────────────────
function buildChapterIndex() {
  const container = document.getElementById('chapter-index')
  if (!container) return

  // Construir items
  CHAPTERS.forEach(ch => {
    const item = document.createElement('div')
    item.className = 'ci-item'
    item.dataset.target = ch.id
    item.innerHTML = `
      <span class="ci-label">${ch.label}</span>
      <div class="ci-dot"></div>
    `
    item.addEventListener('click', () => {
      const target = document.getElementById(ch.id)
      if (target) target.scrollIntoView({ behavior: 'smooth' })
    })
    container.appendChild(item)
  })

  // Mostrar índice cuando el usuario baja de la pantalla inicial
  const showObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) {
        container.classList.add('visible')
      } else {
        container.classList.remove('visible')
      }
    })
  }, { threshold: 0.1 })

  const hero = document.getElementById('hero')
  if (hero) showObs.observe(hero)

  // Marcar el capítulo activo con IntersectionObserver
  const sectionEls = CHAPTERS
    .map(ch => document.getElementById(ch.id))
    .filter(Boolean)

  const activeObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id
        document.querySelectorAll('.ci-item').forEach(item => {
          item.classList.toggle('active', item.dataset.target === id)
        })
      }
    })
  }, {
    threshold: 0,
    rootMargin: '-40% 0px -40% 0px',
  })

  sectionEls.forEach(el => activeObs.observe(el))
}