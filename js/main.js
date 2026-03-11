import { initMap, updateMap } from "./map.js"
import { initScroll } from "./scroll.js"

const map = initMap()

initScroll(updateMap)