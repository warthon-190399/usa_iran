const TOTAL_MAP_STEPS = 3   // pasos 1-3 controlan el mapa
const TOTAL_STEPS     = 3   // dots: solo pasos con mapa

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

  // ── Bridge: oculta el hero cuando entra, no interfiere con el observer principal ──
  let bridgeVisible = false
  const bridgeSection = document.getElementById("bridge-section")
  if (bridgeSection) {
    const bridgeObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        bridgeVisible = entry.isIntersecting
        if (entry.isIntersecting) {
          hero.classList.add("hidden")
          counter.classList.add("visible")
          updateMap("off")
        }
      })
    }, { threshold: 0.1 })
    bridgeObs.observe(bridgeSection)
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      const step = parseInt(entry.target.dataset.step)

      // Barra de progreso
      progressBar.style.width = step === 0
        ? "0%"
        : (step / TOTAL_STEPS) * 100 + "%"

      // Hero y contador — solo mostrar hero en step 0 si bridge NO está visible
      if (step === 0) {
        if (!bridgeVisible) {
          hero.classList.remove("hidden")
          counter.classList.remove("visible")
        }
      } else {
        hero.classList.add("hidden")
        counter.classList.add("visible")
      }

      // El mapa reacciona a pasos 0-3
      if (step <= TOTAL_MAP_STEPS) {
        updateMap(step)
      }

      setActiveCard(step)
      setCounterDot(step)
    })
  }, { threshold: 0.55 })

  sections.forEach(s => observer.observe(s))
}