const TOTAL_MAP_STEPS = 4   // pasos 1-4 controlan el mapa
const TOTAL_STEPS     = 5   // paso 5 = grafo

export function initScroll(updateMap) {
  const sections      = document.querySelectorAll("section[data-step]")
  const progressBar   = document.getElementById("progress-bar")
  const hero          = document.getElementById("hero")
  const counter       = document.getElementById("chapter-counter")

  // Construir dots (1 por cada capítulo real)
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const dot = document.createElement("div")
    dot.className   = "counter-dot"
    dot.dataset.step = i
    dot.addEventListener("click", () => {
      const target = document.querySelector(`section[data-step="${i}"]`)
      if (target) target.scrollIntoView({ behavior: "smooth" })
    })
    counter.appendChild(dot)
  }

  function setCounterDot(step) {
    document.querySelectorAll(".counter-dot").forEach((dot, i) => {
      dot.classList.toggle("active", i + 1 === step)
    })
  }

  function setActiveCard(step) {
    document.querySelectorAll(".card").forEach(c => c.classList.remove("active"))
    if (step >= 1 && step <= TOTAL_MAP_STEPS) {
      const card = document.getElementById(`card-${step}`)
      if (card) card.classList.add("active")
    }
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      const step = parseInt(entry.target.dataset.step)

      // Barra de progreso — normalizada sobre todos los pasos
      progressBar.style.width = step === 0
        ? "0%"
        : (step / TOTAL_STEPS) * 100 + "%"

      // Hero y contador
      if (step === 0) {
        hero.classList.remove("hidden")
        counter.classList.remove("visible")
      } else {
        hero.classList.add("hidden")
        counter.classList.add("visible")
      }

      // El mapa solo reacciona a pasos 0-4
      if (step <= TOTAL_MAP_STEPS) {
        updateMap(step)
      }

      setActiveCard(step)
      setCounterDot(step)
    })
  }, { threshold: 0.55 })

  sections.forEach(s => observer.observe(s))
}