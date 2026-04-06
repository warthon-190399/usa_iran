import { initMap, updateMap } from "./map.js"
import { initScroll }         from "./scroll.js"
import { initGraph }          from "./graph.js"
import { initTimeline }       from "./timeline.js"
import { initConflict }       from "./conflict.js"
import { initBridge }         from "./bridge.js"
import { initStrategy }       from "./strategy.js"
import { initOrmuz }          from "./ormuz.js"
import { initEconomic }       from "./economic.js"
import { initActors }         from "./actors.js"
import { initScenarios }      from "./scenarios.js"
import { initConclusions }    from "./conclusions.js"

// Inicializar mapa
const map = initMap()

// Scroll (pasos 0-3 controlan el mapa)
initScroll(updateMap)
initTimeline()
initBridge()
initStrategy(updateMap)
initConflict(updateMap)
initOrmuz(updateMap)
initEconomic()
initGraph("data/graph.json")
initActors()
initScenarios()
initConclusions()

// Debug
window._updateMap = updateMap