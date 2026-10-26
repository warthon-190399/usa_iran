/**
 * map/index.js — Mapa de fondo controlado por el scroll.
 *
 * Cada paso (el valor de `data-map-step` en index.html) se describe en la
 * tabla STEPS: qué capas mostrar, a dónde volar y con qué zoom.
 *   center/zoom  destino del vuelo (sin center = no se mueve)
 *   offset       true → desplaza el punto hacia la columna derecha (el texto
 *                ocupa la izquierda)
 *   hidden       true → el mapa se desvanece
 */
import L from 'leaflet'
import { buildLayers } from './layers.js'

const STEPS = {
  // Intro
  0:    { layers: [], center: [28, 50], zoom: 3, duration: 1.6 },
  1:    { layers: ['neighbors', 'iranPoly', 'routes'], center: [15, 62], zoom: 3, duration: 1.8 },
  2:    { layers: ['iranPoly', 'ormuzHeat'], center: [26.5, 56.5], zoom: 7, duration: 2.0 },
  3:    { layers: ['iranPoly', 'neighbors', 'bases', 'baseRanges', 'fleet'], center: [28, 50], zoom: 4.5, duration: 1.6 },
  off:  { hidden: true },

  // Cap. II — Estrategia
  c07:  { layers: ['conflictC07'], center: [32.5, 54], zoom: 5.5, offset: true, duration: 1.8 },
  c03:  { layers: ['conflictC03'], center: [26, 55], zoom: 5.5, offset: true, duration: 1.8 },
  c08:  { layers: ['conflictC08'], center: [30, 46], zoom: 4, offset: true, duration: 2.0 },

  // Cap. III — Ormuz
  oz01: { layers: ['iranPoly', 'ormuzHeat', 'hormuz'], center: [26.5, 56.5], zoom: 7.5, offset: true, duration: 2.0 },
  oz02: { layers: ['iranPoly', 'neighbors', 'ormuzHeat'], center: [25, 54], zoom: 5, offset: true, duration: 2.0 },
  oz03: { layers: ['iranPoly', 'ormuzHeat', 'hormuzMarker'], center: [26.8, 56.0], zoom: 7, offset: true, duration: 1.8 },
  oz04: { layers: ['iranPoly', 'neighbors', 'kharg'], center: [28.5, 51.0], zoom: 7, offset: true, duration: 2.0 },
}

let map = null
let layers = null
let currentStep = null

export function initMap() {
  map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: false,
    doubleClickZoom: false,
    touchZoom: false,
    keyboard: false,
  }).setView([28, 50], 4)

  // CARTO exige una key gratuita (carto.com/basemaps/apikey); sin ella las
  // tiles salen con marca de agua. Se lee de .env → VITE_CARTO_KEY.
  const key = import.meta.env.VITE_CARTO_KEY
  if (!key) console.warn('Falta VITE_CARTO_KEY en .env: el mapa base saldrá con marca de agua')
  L.tileLayer(`https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png${key ? `?key=${key}` : ''}`, {
    maxZoom: 18,
    // CARTO pide mantener la atribución visible a cambio del plan gratuito
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  }).addTo(map)
  map.attributionControl.setPrefix(false)

  layers = buildLayers()
  return map
}

// Centra el punto de interés en la columna derecha (la izquierda es texto)
function shiftedCenter(latlng, zoom) {
  const colWidth = Math.round(window.innerWidth * 0.5)
  const p = map.project(L.latLng(latlng), zoom)
  return map.unproject(L.point(p.x - colWidth / 2, p.y), zoom)
}

export function updateMap(step) {
  if (!map || step === currentStep) return
  const cfg = STEPS[step]
  if (!cfg) return console.warn(`updateMap: paso desconocido "${step}"`)
  currentStep = step
  document.dispatchEvent(new CustomEvent('mapstep', { detail: step })) // útil para depurar

  Object.values(layers).forEach((l) => map.hasLayer(l) && map.removeLayer(l))

  const mapEl = document.getElementById('map')
  mapEl.style.opacity = cfg.hidden ? '0' : '1'
  if (cfg.hidden) return

  cfg.layers.forEach((name) => map.addLayer(layers[name]))

  if (cfg.center) {
    const target = cfg.offset ? shiftedCenter(cfg.center, cfg.zoom) : cfg.center
    map.flyTo(target, cfg.zoom, { duration: cfg.duration, ...(cfg.offset && { easeLinearity: 0.35 }) })
  }
}
