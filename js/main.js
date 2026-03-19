import { initMap, updateMap } from "./map.js"
import { initScroll }         from "./scroll.js"
import { initGraph }          from "./graph.js"
import { initTimeline }       from "./timeline.js"
import { initEconomic }       from "./economic.js"
import { initConflict }       from "./conflict.js"

// Inicializar mapa
const map = initMap()

// Inicializar scroll (pasos 0-4 controlan el mapa)
initScroll(updateMap)
initTimeline()

// Sección conflicto — recibe updateMap para controlar el mapa por bloque
initConflict(updateMap)

// Grafo D3
initGraph("data/graph.json")
initEconomic()

// Exponer updateMap globalmente para debug y fallback
window._updateMap = updateMap