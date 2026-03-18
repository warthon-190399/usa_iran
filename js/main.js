import { initMap, updateMap } from "./map.js"
import { initScroll }         from "./scroll.js"
import { initGraph }          from "./graph.js"
import { initTimeline }       from "./timeline.js"
import { initEconomic } from "./economic.js"
import { initConflict }       from "./conflict.js"

// Inicializar mapa
const map = initMap()

// Inicializar scroll (pasos 0-4 controlan el mapa)
initScroll(updateMap)
initTimeline()

// Sección El Conflicto Actual (nuevo)
initConflict()

// Inicializar grafo D3 (Capítulo V, independiente del mapa)
initGraph("data/graph.json")
initEconomic()