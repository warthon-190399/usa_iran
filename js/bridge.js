/**
 * bridge.js
 * Anima los hitos del bridge en cascada al entrar en viewport.
 * Import y llama initBridge() desde main.js
 */

export function initBridge() {
  const section = document.getElementById('bridge-section')
  if (!section) return

  const hitos = section.querySelectorAll('.bridge-hito')
  if (!hitos.length) return

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      // Activar todos los hitos en cascada (el delay lo maneja CSS)
      hitos.forEach(h => h.classList.add('visible'))
      observer.unobserve(entry.target)
    })
  }, { threshold: 0.3 })

  // Observar el contenedor de hitos
  const container = section.querySelector('.bridge-hitos')
  if (container) observer.observe(container)
}