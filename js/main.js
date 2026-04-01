import { initMap, updateMap } from "./map.js"
import { initScroll }         from "./scroll.js"
import { initGraph }          from "./graph.js"
import { initTimeline }       from "./timeline.js"
import { initConflict }       from "./conflict.js"
import { initBridge }         from "./bridge.js"

// Inicializar mapa
const map = initMap()

// Scroll (pasos 0-3 controlan el mapa)
initScroll(updateMap)
initTimeline()
initBridge()
initConflict(updateMap)
initGraph("data/graph.json")

// Debug
window._updateMap = updateMap