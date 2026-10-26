/**
 * Animaciones de aparición de todo el artículo, en una sola tabla.
 * Antes vivían repartidas en bridge.js, strategy.js, ormuz.js, actors.js,
 * scenarios.js, conclusions.js y economic.js.
 */
import { reveal, revealGroup } from './lib/inview.js'

export function initReveals() {
  // Bridge: los hitos aparecen en cascada (el delay lo define el CSS)
  revealGroup('.bridge-hitos', '.bridge-hito', { threshold: 0.3 })

  // Cap. II — Estrategia
  reveal('.st-screen', 0.1)
  revealGroup('.st-cost-table', '.st-cost-row', { threshold: 0.3 })
  revealGroup('.st-endurance', '.st-endurance-fill', { threshold: 0.4, className: 'animated' })

  // Cap. III — Ormuz
  reveal('.oz-screen', 0.1)
  revealGroup('.oz-dep-list', '.oz-dep-fill', { threshold: 0.4, className: 'animated' })

  // Cap. IV — Economía (las impact cards se crean en economic.js)
  reveal('.ec-screen, .ec-header', 0.05)

  // Cap. V — Actores
  reveal('.ac-block', 0.08)

  // Cap. VI — Escenarios
  reveal('.sc-intro-grid, .sc-timeline-section', 0.1)
  reveal('.sc-scenario-card', 0.08)

  // Conclusiones y autor
  reveal('.cn-point, .cn-closing', 0.12)
  reveal('.au-inner', 0.15)
}
