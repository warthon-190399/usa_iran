/**
 * actors.js — Capítulo V: Análisis e Intereses de Países
 * Scroll reveal de bloques
 */

export function initActors() {
  const section = document.getElementById('actors-section')
  if (!section) return

  // Scroll reveal
  const blocks = section.querySelectorAll('.ac-block')
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        obs.unobserve(e.target)
      }
    })
  }, { threshold: 0.08 })

  blocks.forEach(b => obs.observe(b))
}