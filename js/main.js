// ── Estilos (Vite los empaqueta en un solo CSS; el orden importa) ────────
import '../styles/main.css'
import 'leaflet/dist/leaflet.css'
import '../styles/timeline.css'
import '../styles/bridge.css'
import '../styles/strategy.css'
import '../styles/ormuz.css'
import '../styles/economic.css'
import '../styles/actors.css'
import '../styles/scenarios.css'
import '../styles/conclusions.css'
import '../styles/hero-cta.css'
import '../styles/mobile.css'
import '../styles/map.css'
import '../styles/graph.css'

// ── Módulos ───────────────────────────────────────────────────────────────
import { initMap, updateMap } from './map/index.js'
import { initScroll } from './scroll.js'
import { initReveals } from './reveals.js'
import { initTimeline } from './timeline.js'
import { initGraph } from './graph.js'
import { initEconomic } from './economic.js'
import { initChapterIndex } from './chapters.js'

initMap()
initScroll(updateMap)   // pasos data-map-step → mapa
initReveals()           // animaciones de aparición
initTimeline()
initGraph()
initEconomic()
initChapterIndex()
