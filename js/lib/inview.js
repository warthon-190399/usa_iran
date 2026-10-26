/**
 * Utilidades de visibilidad — reemplazan los IntersectionObserver repetidos
 * en cada módulo.
 */

const toList = (targets) =>
  typeof targets === 'string' ? [...document.querySelectorAll(targets)]
  : targets instanceof Element ? [targets]
  : [...(targets || [])]

/** Ejecuta `cb(el)` una sola vez cuando cada elemento entra al viewport. */
export function onceInView(targets, cb, { threshold = 0.1, rootMargin = '0px' } = {}) {
  const els = toList(targets)
  if (!els.length) return
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return
      io.unobserve(e.target)
      cb(e.target)
    })
  }, { threshold, rootMargin })
  els.forEach((el) => io.observe(el))
}

/** Agrega una clase (por defecto `visible`) a cada elemento cuando aparece. */
export function reveal(targets, threshold = 0.1, className = 'visible') {
  onceInView(targets, (el) => el.classList.add(className), { threshold })
}

/**
 * Cuando `trigger` aparece, agrega la clase a todos los `items`
 * (opcionalmente en cascada con `stagger` ms entre cada uno).
 */
export function revealGroup(trigger, items, { threshold = 0.3, className = 'visible', stagger = 0 } = {}) {
  onceInView(trigger, () => {
    toList(items).forEach((el, i) => {
      if (stagger) setTimeout(() => el.classList.add(className), i * stagger)
      else el.classList.add(className)
    })
  }, { threshold })
}
