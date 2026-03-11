let _map = null

export function initMap() {
  _map = L.map('map', {
    zoomControl:       false,
    attributionControl: false,
    scrollWheelZoom:   false,
    dragging:          false,
    doubleClickZoom:   false,
    touchZoom:         false,
    keyboard:          false
  }).setView([28, 50], 4)

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { maxZoom: 18 }
  ).addTo(_map)

  /* ── Capas ── */

  // Irán highlight
  const iranPoly = L.circle([32, 53], {
    color: '#c0392b', weight: 2,
    fillColor: '#c0392b', fillOpacity: 0.2,
    radius: 780000
  })

  // Países vecinos
  const neighbors = L.layerGroup([
    L.circle([29, 48], { color:'#888', weight:1, fillColor:'#555', fillOpacity:0.12, radius:360000 }),
    L.circle([34, 43], { color:'#888', weight:1, fillColor:'#555', fillOpacity:0.12, radius:430000 }),
    L.circle([33, 66], { color:'#888', weight:1, fillColor:'#555', fillOpacity:0.12, radius:650000 }),
    L.circle([38, 59], { color:'#888', weight:1, fillColor:'#555', fillOpacity:0.12, radius:480000 }),
    L.circle([40, 48], { color:'#888', weight:1, fillColor:'#555', fillOpacity:0.12, radius:300000 })
  ])

  function makeLabel(latlng, text) {
    return L.marker(latlng, {
      icon: L.divIcon({
        className: '',
        html: `<div style="color:rgba(245,240,232,0.55);font-family:'Source Serif 4',serif;
               font-size:11px;letter-spacing:0.15em;text-transform:uppercase;
               text-shadow:0 1px 4px #000;white-space:nowrap;">${text}</div>`,
        iconAnchor: [40, 8]
      }),
      interactive: false
    })
  }

  const countryLabels = L.layerGroup([
    makeLabel([32, 53], 'IRÁN'),
    makeLabel([29, 47], 'KUWAIT'),
    makeLabel([25, 51], 'QATAR'),
    makeLabel([24, 54], 'E.A.U.'),
    makeLabel([26, 50], 'BAHREIN'),
    makeLabel([23, 58], 'OMÁN'),
    makeLabel([33, 44], 'IRAK'),
    makeLabel([24, 45], 'ARABIA S.'),
    makeLabel([32, 36], 'JORDANIA')
  ])

  function baseMarker(latlng, label, country) {
    return L.marker(latlng, {
      icon: L.divIcon({
        className: '',
        html: `<div style="background:rgba(30,80,160,0.9);border:2px solid rgba(100,150,255,0.9);
               border-radius:3px;width:14px;height:14px;
               box-shadow:0 0 10px rgba(80,130,255,0.7),0 0 20px rgba(80,130,255,0.3);"></div>`,
        iconSize: [14, 14], iconAnchor: [7, 7]
      })
    }).bindPopup(`<b style="color:#d4a017;">${label}</b><br>
                  <span style="opacity:0.7;font-size:12px;">${country}</span>`)
  }

  const bases = L.layerGroup([
    baseMarker([25.11, 51.31], 'Al Udeid Air Base', 'Qatar'),
    baseMarker([29.23, 47.45], 'Camp Arifjan', 'Kuwait'),
    baseMarker([33.79, 42.44], 'Ain al-Asad', 'Iraq'),
    baseMarker([26.08, 50.56], 'NSA Bahrain · 5ª Flota', 'Bahrain'),
    baseMarker([24.25, 54.65], 'Al Dhafra Air Base', 'Emiratos Árabes'),
    baseMarker([30.44, 47.78], 'Camp Buehring', 'Kuwait')
  ])

  const baseRanges = L.layerGroup([
    L.circle([25.11,51.31], { color:'rgba(80,130,255,0.3)', weight:1, fillColor:'rgba(80,130,255,0.05)', radius:500000, interactive:false }),
    L.circle([29.23,47.45], { color:'rgba(80,130,255,0.3)', weight:1, fillColor:'rgba(80,130,255,0.05)', radius:400000, interactive:false }),
    L.circle([33.79,42.44], { color:'rgba(80,130,255,0.3)', weight:1, fillColor:'rgba(80,130,255,0.05)', radius:450000, interactive:false })
  ])

  const routes = L.layerGroup([
    L.polyline([[26.5,56.5],[22,60],[17,63],[12,67],[6,72],[1,78],[-5,82]],
      { color:'#f39c12', weight:4, opacity:0.85, dashArray:'8,4' }),
    L.polyline([[26.5,56.5],[24,54],[20,50],[15,45],[10,40],[5,35],[2,30],[0,25],[-3,18]],
      { color:'#e74c3c', weight:4, opacity:0.85, dashArray:'8,4' }),
    L.polyline([[26.5,56.5],[22,52],[18,48],[14,40],[10,30],[5,20],[0,10],[-5,0]],
      { color:'#3498db', weight:4, opacity:0.85, dashArray:'8,4' })
  ])

  const hormuzCircle = L.circleMarker([26.5, 56.3], {
    radius:14, color:'#c0392b', weight:2,
    fillColor:'#c0392b', fillOpacity:0.8
  }).bindPopup('<b style="color:#d4a017;">Estrecho de Ormuz</b><br><span style="opacity:0.7;font-size:12px;">33 km · 20% del petróleo mundial</span>')

  const hormuz = L.layerGroup([
    hormuzCircle,
    L.circle([26.5, 56.3], { color:'#c0392b', weight:1, fillColor:'#c0392b', fillOpacity:0.1, radius:200000, interactive:false }),
    L.marker([26.5, 56.3], {
      icon: L.divIcon({
        className: '',
        html: `<div style="color:#e74c3c;font-family:'Playfair Display',serif;font-weight:700;
               font-size:13px;text-shadow:0 2px 8px #000;white-space:nowrap;
               margin-left:20px;margin-top:-6px;">Estrecho de Ormuz</div>`,
        iconSize: [180, 20], iconAnchor: [0, 10]
      }),
      interactive: false
    })
  ])

  // Guardar todas las capas accesibles en el módulo
  _map._layers_store = { iranPoly, neighbors, countryLabels, bases, baseRanges, routes, hormuz }
  _map._currentStep = -1

  return _map
}

export function updateMap(step) {
  if (!_map) return
  if (step === _map._currentStep) return
  _map._currentStep = step

  const { iranPoly, neighbors, countryLabels, bases, baseRanges, routes, hormuz } = _map._layers_store
  const all = [iranPoly, neighbors, countryLabels, bases, baseRanges, routes, hormuz]
  all.forEach(l => { if (_map.hasLayer(l)) _map.removeLayer(l) })

  if (step === 0) {
    _map.flyTo([28, 50], 3, { duration: 1.6 })
  }
  if (step === 1) {
    _map.addLayer(neighbors)
    _map.addLayer(iranPoly)
    _map.addLayer(countryLabels)
    _map.flyTo([32, 53], 5, { duration: 1.6 })
  }
  if (step === 2) {
    _map.addLayer(iranPoly)
    _map.addLayer(bases)
    _map.addLayer(baseRanges)
    _map.addLayer(countryLabels)
    _map.flyTo([30, 50], 4.5, { duration: 1.6 })
  }
  if (step === 3) {
    _map.addLayer(iranPoly)
    _map.addLayer(routes)
    _map.flyTo([18, 60], 3.5, { duration: 1.8 })
  }
  if (step === 4) {
    _map.addLayer(iranPoly)
    _map.addLayer(hormuz)
    _map.flyTo([26.5, 56.5], 7, { duration: 1.8 })
  }
}