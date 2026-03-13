/**
 * timeline.js
 * Controla el comportamiento sticky + scroll del timeline histórico.
 * Las escenas se activan con IntersectionObserver al cruzar el 50% del viewport.
 */

const TL_SCENES = [
  { year: "1979",      label: "La revolución iraní",        shortDot: "Revolución" },
  { year: "1979–81",   label: "Crisis de los rehenes",       shortDot: "Rehenes" },
  { year: "1980–88",   label: "Guerra Irán–Irak",            shortDot: "Guerra Iraq" },
  { year: "2015",      label: "Acuerdo nuclear JCPOA",       shortDot: "JCPOA" },
  { year: "2020",      label: "Asesinato de Soleimani",      shortDot: "Soleimani" }
]

export function initTimeline() {
  const section = document.getElementById("timeline-section")
  if (!section) return

  const yearEl     = document.getElementById("tl-year")
  const eventEl    = document.getElementById("tl-event")
  const progressEl = document.getElementById("tl-progress")
  const dotsEl     = document.getElementById("tl-dots")
  const counterEl  = document.getElementById("tl-counter")
  const scenes     = document.querySelectorAll(".tl-scene[data-tl]")

  if (!yearEl || !scenes.length) return

  // ── Construir dots ──────────────────────────────────────────────────────
  TL_SCENES.forEach((sc, i) => {
    const dot = document.createElement("div")
    dot.className = "tl-dot" + (i === 0 ? " active" : "")
    dot.dataset.tl = i
    dot.innerHTML = `
      <div class="tl-dot-pip"></div>
      <span class="tl-dot-label">${sc.shortDot}</span>
    `
    dot.addEventListener("click", () => {
      const target = document.querySelector(`.tl-scene[data-tl="${i}"]`)
      if (target) target.scrollIntoView({ behavior: "smooth", block: "center" })
    })
    dotsEl.appendChild(dot)
  })

  // ── Activar escena ──────────────────────────────────────────────────────
  let currentScene = -1

  function activateScene(index) {
    if (index === currentScene) return
    currentScene = index

    const sc = TL_SCENES[index]
    if (!sc) return

    // Actualizar sticky
    yearEl.textContent  = sc.year
    eventEl.textContent = sc.label

    // Barra de progreso
    const pct = ((index + 1) / TL_SCENES.length) * 100
    progressEl.style.width = pct + "%"

    // Counter
    counterEl.textContent = `${index + 1} / ${TL_SCENES.length}`

    // Dots
    document.querySelectorAll(".tl-dot").forEach((d, i) => {
      d.classList.toggle("active", i === index)
    })

    // Escenas: activar la actual, atenuar las demás
    scenes.forEach(sc => {
      const i = parseInt(sc.dataset.tl)
      sc.classList.toggle("active", i === index)
    })
  }

  // ── IntersectionObserver ─────────────────────────────────────────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      const index = parseInt(entry.target.dataset.tl)
      activateScene(index)
    })
  }, {
    threshold: 0.45,
    rootMargin: "0px 0px -10% 0px"
  })

  scenes.forEach(sc => observer.observe(sc))

  // Activar la primera escena al init
  activateScene(0)
  scenes[0]?.classList.add("active")
}