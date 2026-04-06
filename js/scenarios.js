/**
 * scenarios.js — Capítulo VI: Escenarios Posibles
 * Scroll reveal con animación en cascada
 */

export function initScenarios() {
  const section = document.getElementById('scenarios-section')
  if (!section) return

  // Reveal intro
  const introGrid = section.querySelector('.sc-intro-grid')
  const timelineSection = section.querySelector('.sc-timeline-section')

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        revealObs.unobserve(e.target)
      }
    })
  }, { threshold: 0.1 })

  if (introGrid) revealObs.observe(introGrid)
  if (timelineSection) revealObs.observe(timelineSection)

  // Reveal scenario cards en cascada
  const cards = section.querySelectorAll('.sc-scenario-card')
  const cardObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible')
        cardObs.unobserve(e.target)
      }
    })
  }, { threshold: 0.08 })

  cards.forEach(c => cardObs.observe(c))
}