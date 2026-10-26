/**
 * scroll.js — Director del scroll.
 *
 * Todo elemento con `data-map-step="..."` en el HTML es un paso: cuando cruza
 * la mitad de la pantalla, el mapa cambia a ese paso. Para mover el mapa basta
 * con editar el atributo en index.html (y la tabla STEPS en map/index.js).
 *
 * Los pasos de la intro (`data-step` 0-3) además controlan la barra de
 * progreso, los dots del contador y la tarjeta activa.
 */
import scrollama from 'scrollama'

const INTRO_STEPS = 3

export function initScroll(updateMap) {
  const hero = document.getElementById('hero')
  const counter = document.getElementById('chapter-counter')
  const progressBar = document.getElementById('progress-bar')
  let heroLocked = false

  // Dots del contador (uno por paso de la intro)
  for (let i = 1; i <= INTRO_STEPS; i++) {
    const dot = document.createElement('div')
    dot.className = 'counter-dot'
    dot.addEventListener('click', () =>
      document.querySelector(`section[data-step="${i}"]`)?.scrollIntoView({ behavior: 'smooth' }))
    counter.appendChild(dot)
  }

  function hideHero() {
    hero.classList.add('hidden')
    counter.classList.add('visible')
    heroLocked = true
  }

  function onIntroStep(step) {
    progressBar.style.width = `${(step / INTRO_STEPS) * 100}%`
    if (step === 0) {
      if (!heroLocked) {
        hero.classList.remove('hidden')
        counter.classList.remove('visible')
      }
    } else {
      hideHero()
    }
    document.querySelectorAll('.card').forEach((c) => c.classList.remove('active'))
    document.getElementById(`card-${step}`)?.classList.add('active')
    counter.querySelectorAll('.counter-dot').forEach((d, i) => d.classList.toggle('active', i + 1 === step))
  }

  scrollama()
    .setup({ step: '[data-map-step]', offset: 0.5 })
    .onStepEnter(({ element }) => {
      const raw = element.dataset.mapStep
      const step = /^\d+$/.test(raw) ? Number(raw) : raw
      updateMap(step)

      if (element.dataset.step !== undefined) onIntroStep(Number(element.dataset.step))
      else if (element.id === 'bridge-section') hideHero()
    })
}
