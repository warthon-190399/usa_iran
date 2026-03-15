/**
 * timeline.js
 * Controla el comportamiento sticky + scroll del timeline histórico.
 * Las escenas se activan con IntersectionObserver al cruzar el 50% del viewport.
 */

const TL_SCENES = [
  { year: "1979",      label: "La revolución iraní",        shortDot: "Revolución",
    img: "images/cap_1_1.jpg", imgCaption: "El ayatolá Khomeini, líder de la revolución" },
  { year: "1979–81",   label: "Crisis de los rehenes",       shortDot: "Rehenes",
    img: "images/cap_2_1.jpg", imgCaption: "Operación Eagle Claw — el rescate fallido" },
  { year: "1980–88",   label: "Guerra Irán–Irak",            shortDot: "Guerra Iraq",
    img: "images/cap_3_1.jpg", imgCaption: "Saddam Hussein en el frente de guerra Irán–Irak" },
  { year: "2015",      label: "Acuerdo nuclear JCPOA",       shortDot: "JCPOA",
    img: "images/cap_4_1.jpg", imgCaption: "Firma del JCPOA en Viena, julio de 2015" },
  { year: "2020",      label: "Asesinato de Soleimani",      shortDot: "Soleimani",
    img: "images/cap_5_1.jpg", imgCaption: "Soleimani, líder de las fuerzas iraníes en Irak" }
]

// Galería por escena: imágenes y pies de foto
const TL_GALLERY = [
  [
    { img: "images/cap_1_1.jpg", caption: "El ayatolá Khomeini, figura central de la revolución islámica" },
    { img: "images/cap_1_2.jpg", caption: "Masas revolucionarias toman las calles de Teherán, 1979" }
  ],
  [
    { img: "images/cap_2_1.jpg", caption: "Restos del helicóptero en la Operación Eagle Claw, el rescate fallido" },
    { img: "images/cap_2_2.jpg", caption: "Los rehenes liberados abordan el avión rumbo a EE.UU., enero 1981" }
  ],
  [
    { img: "images/cap_3_1.jpg", caption: "Saddam Hussein junto a su estado mayor durante la guerra Irán–Irak" },
    { img: "images/cap_3_2.jpg", caption: "Tanque iraquí frente a pozos de petróleo en llamas, 1991" }
  ],
  [
    { img: "images/cap_4_1.jpg", caption: "Los cancilleres del P5+1 e Irán en la firma del JCPOA, Viena 2015" },
    { img: "images/cap_4_2.jpg", caption: "Zarif y Kerry se estrechan la mano tras semanas de negociaciones" }
  ],
  [
    { img: "images/cap_5_1.jpg", caption: "Soleimani, líder de las fuerzas iraníes en Irak" },
    { img: "images/cap_5_2.jpg", caption: "El asesinato de Soleimani desencadenó una crisis geopolítica" }
  ]
]

export function initTimeline() {
  const section = document.getElementById("timeline-section")
  if (!section) return

  const yearEl      = document.getElementById("tl-year")
  const eventEl     = document.getElementById("tl-event")
  const progressEl  = document.getElementById("tl-progress")
  const dotsEl      = document.getElementById("tl-dots")
  const counterEl   = document.getElementById("tl-counter")
  const stickyImgEl = document.getElementById("tl-sticky-img-el")
  const stickyCapEl = document.getElementById("tl-sticky-img-caption")
  const scenes      = document.querySelectorAll(".tl-scene[data-tl]")

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

  // ── Galería interactiva ─────────────────────────────────────────────────
  const galleryState = {} // { [sceneIdx]: currentImgIdx }

  document.querySelectorAll(".tl-gallery-main").forEach(gallery => {
    const sceneIdx = parseInt(gallery.dataset.scene)
    galleryState[sceneIdx] = 0

    gallery.querySelectorAll(".tl-gal-prev, .tl-gal-next").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation()
        const items = TL_GALLERY[sceneIdx]
        if (!items || items.length < 2) return

        const dir = btn.classList.contains("tl-gal-next") ? 1 : -1
        const cur = galleryState[sceneIdx]
        const next = (cur + dir + items.length) % items.length
        switchGalleryImage(gallery, sceneIdx, next)
      })
    })

    // Click en imagen para avanzar
    gallery.addEventListener("click", () => {
      const items = TL_GALLERY[sceneIdx]
      if (!items || items.length < 2) return
      const cur = galleryState[sceneIdx]
      const next = (cur + 1) % items.length
      switchGalleryImage(gallery, sceneIdx, next)
    })
  })

  function switchGalleryImage(gallery, sceneIdx, nextIdx) {
    const items = TL_GALLERY[sceneIdx]
    if (!items || !items[nextIdx]) return

    const imgs     = gallery.querySelectorAll(".tl-gallery-img")
    const captionEl = document.getElementById(`tl-gallery-caption-${sceneIdx}`)
    const counter  = gallery.querySelector(".tl-gal-cur")

    imgs.forEach((img, i) => {
      img.classList.toggle("active", i === nextIdx)
    })

    if (captionEl) captionEl.textContent = items[nextIdx].caption
    if (counter)   counter.textContent = nextIdx + 1

    galleryState[sceneIdx] = nextIdx

    // Sync sticky image if this is the currently active scene
    if (currentScene === sceneIdx && stickyImgEl) {
      updateStickyImage(sceneIdx, nextIdx)
    }
  }

  function updateStickyImage(sceneIdx, imgIdx = 0) {
    const items = TL_GALLERY[sceneIdx]
    const sc    = TL_SCENES[sceneIdx]
    if (!stickyImgEl) return

    const imgSrc  = (items && items[imgIdx]) ? items[imgIdx].img : sc.img
    const caption = (items && items[imgIdx]) ? items[imgIdx].caption : sc.imgCaption

    if (!imgSrc) {
      // No image for this scene
      stickyImgEl.parentElement.style.opacity = "0"
      return
    }

    stickyImgEl.parentElement.style.opacity = "1"
    stickyImgEl.style.opacity = "0"
    stickyImgEl.style.transform = "scale(1.05)"

    // Short delay for cross-fade
    setTimeout(() => {
      stickyImgEl.src = imgSrc
      stickyImgEl.onload = () => {
        stickyImgEl.style.opacity = "1"
        stickyImgEl.style.transform = "scale(1)"
      }
      if (stickyCapEl) stickyCapEl.textContent = caption
    }, 120)
  }

  // ── Activar escena ──────────────────────────────────────────────────────
  let currentScene = -1

  function activateScene(index) {
    if (index === currentScene) return
    currentScene = index

    const sc = TL_SCENES[index]
    if (!sc) return

    // Actualizar sticky header
    yearEl.textContent  = sc.year
    eventEl.textContent = sc.label

    // Sticky image — usa la imagen activa de la galería de esa escena
    const curImgIdx = galleryState[index] ?? 0
    updateStickyImage(index, curImgIdx)

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