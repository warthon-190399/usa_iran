let _map = null

// ── Animated polyline factory (geodésica) ────────────────────────────────
function animatedRoute(waypoints, color, label, delay = 0) {
  const group = L.layerGroup()

  const base = {
    color,
    steps: 50,       // suficientes puntos interpolados para curvas suaves
    wrap: false,     // permite cruzar el antimeridiano sin romper la línea
    interactive: false,
    smoothFactor: 1
  }

  // 1. Sombra / glow
  L.geodesic(waypoints, { ...base, weight: 10, opacity: 0.10 }).addTo(group)

  // 2. Track de fondo
  L.geodesic(waypoints, { ...base, weight: 2,  opacity: 0.30 }).addTo(group)

  // 3. Dash animado encima
  L.geodesic(waypoints, {
    ...base,
    weight: 3,
    opacity: 0.90,
    dashArray: '12, 18',
    dashOffset: '0',
    className: `route-animated route-delay-${delay}`
  }).addTo(group)

  // 4. Label en el waypoint central
  const mid = waypoints[Math.floor(waypoints.length / 2)]
  L.marker(mid, {
    icon: L.divIcon({
      className: '',
      html: `<div class="route-label" style="--rc:${color};">${label}</div>`,
      iconAnchor: [60, 10]
    }),
    interactive: false
  }).addTo(group)

  // 5. Punto de origen (Ormuz)
  L.circleMarker(waypoints[0], {
    radius: 5,
    color,
    fillColor: color,
    fillOpacity: 0.95,
    weight: 1.5,
    interactive: false
  }).addTo(group)

  return group
}

// ── Inject CSS for route animations ───────────────────────────────────────
function injectRouteCSS() {
  if (document.getElementById('route-anim-css')) return
  const style = document.createElement('style')
  style.id = 'route-anim-css'
  style.textContent = `
    @keyframes routeDash {
      to { stroke-dashoffset: -120; }
    }
    .route-animated path {
      animation: routeDash 3s linear infinite;
    }
    .route-delay-1 path { animation-delay: -1s; }
    .route-delay-2 path { animation-delay: -2s; }

    .route-label {
      background: rgba(13,13,13,0.82);
      border: 1px solid var(--rc, #f39c12);
      border-radius: 2px;
      color: var(--rc, #f39c12);
      font-family: 'Source Serif 4', serif;
      font-size: 10px;
      font-weight: 400;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      padding: 3px 8px;
      white-space: nowrap;
      backdrop-filter: blur(6px);
      box-shadow: 0 2px 12px rgba(0,0,0,0.6);
    }

    /* Hormuz pulse rings */
    @keyframes hormuzPulse {
      0%   { r: 14px; opacity: 0.8; }
      100% { r: 42px; opacity: 0;   }
    }
    .hormuz-pulse circle.ring {
      animation: hormuzPulse 2.4s ease-out infinite;
    }
    .hormuz-pulse circle.ring2 {
      animation: hormuzPulse 2.4s ease-out infinite;
      animation-delay: 1.2s;
    }

    /* Cargo ship dots animation */
    @keyframes shipFloat {
      0%, 100% { transform: translateY(0px); }
      50%       { transform: translateY(-3px); }
    }
    .ship-dot { animation: shipFloat 2s ease-in-out infinite; }
  `
  document.head.appendChild(style)
}

export function initMap() {
  injectRouteCSS()

  _map = L.map('map', {
    zoomControl:        false,
    attributionControl: false,
    scrollWheelZoom:    false,
    dragging:           false,
    doubleClickZoom:    false,
    touchZoom:          false,
    keyboard:           false
  }).setView([28, 50], 4)

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { maxZoom: 18 }
  ).addTo(_map)

  /* ── Capas de países ── */

  const COUNTRY_LAYERS = {
    iran:        { iso: 'IRN', color: '#e84040', fillColor: '#c0392b', fillOpacity: 0.35, weight: 1.8, opacity: 0.9 },
    iraq:        { iso: 'IRQ', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.30, weight: 0.8, opacity: 0.5 },
    kuwait:      { iso: 'KWT', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.30, weight: 0.8, opacity: 0.5 },
    saudi:       { iso: 'SAU', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.25, weight: 0.8, opacity: 0.5 },
    qatar:       { iso: 'QAT', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.32, weight: 0.8, opacity: 0.5 },
    uae:         { iso: 'ARE', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.30, weight: 0.8, opacity: 0.5 },
    bahrain:     { iso: 'BHR', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.33, weight: 0.8, opacity: 0.5 },
    oman:        { iso: 'OMN', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.28, weight: 0.8, opacity: 0.5 },
    turkmen:     { iso: 'TKM', color: '#888',    fillColor: '#999',    fillOpacity: 0.22, weight: 0.6, opacity: 0.6 },
    afghanistan: { iso: 'AFG', color: '#888',    fillColor: '#999',    fillOpacity: 0.22, weight: 0.6, opacity: 0.6 },
    azerbaijan:  { iso: 'AZE', color: '#888',    fillColor: '#999',    fillOpacity: 0.22, weight: 0.6, opacity: 0.6 },
  }

  const iranPoly  = L.layerGroup()
  const neighbors = L.layerGroup()

  // ── Cache: carga countries_gulf.geojson una sola vez ──────────────────
  let _geojsonCache = null

  async function loadGeoJSON() {
    if (_geojsonCache) return _geojsonCache
    const res = await fetch('./data/countries.geojson')
    if (!res.ok) throw new Error('No se pudo cargar countries.geojson')
    _geojsonCache = await res.json()
    return _geojsonCache
  }

  async function fetchCountry(key) {
    const { iso, color, fillColor, fillOpacity, weight, opacity } = COUNTRY_LAYERS[key]
    try {
      const allData = await loadGeoJSON()
      const filtered = {
        type: 'FeatureCollection',
        features: allData.features.filter(
          f => f.properties['ISO3166-1-Alpha-3'] === iso
        )
      }
      if (!filtered.features.length) return null
      return L.geoJSON(filtered, {
        style: { color, weight, opacity, fillColor, fillOpacity },
        interactive: false
      })
    } catch (e) {
      console.warn(`countries.geojson: no se pudo cargar ${iso}`, e)
      return null
    }
  }

  Promise.all(
    Object.keys(COUNTRY_LAYERS).map(key => fetchCountry(key).then(layer => ({ key, layer })))
  ).then(results => {
    results.forEach(({ key, layer }) => {
      if (!layer) return
      if (key === 'iran') iranPoly.addLayer(layer)
      else neighbors.addLayer(layer)
    })
    if (_map._currentStep >= 0) {
      const step = _map._currentStep
      _map._currentStep = -1
      updateMap(step)
    }
  })

  /* ── Bases militares ── */

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
    baseMarker([25.11, 51.31], 'Al Udeid Air Base',      'Qatar'),
    baseMarker([29.23, 47.45], 'Camp Arifjan',            'Kuwait'),
    baseMarker([33.79, 42.44], 'Ain al-Asad',             'Iraq'),
    baseMarker([26.08, 50.56], 'NSA Bahrain · 5ª Flota', 'Bahrain'),
    baseMarker([24.25, 54.65], 'Al Dhafra Air Base',      'Emiratos Árabes'),
    baseMarker([30.44, 47.78], 'Camp Buehring',           'Kuwait')
  ])

  const baseRanges = L.layerGroup([
    L.circle([25.11, 51.31], { color:'rgba(80,130,255,0.3)', weight:1, fillColor:'rgba(80,130,255,0.05)', radius:500000, interactive:false }),
    L.circle([29.23, 47.45], { color:'rgba(80,130,255,0.3)', weight:1, fillColor:'rgba(80,130,255,0.05)', radius:400000, interactive:false }),
    L.circle([33.79, 42.44], { color:'rgba(80,130,255,0.3)', weight:1, fillColor:'rgba(80,130,255,0.05)', radius:450000, interactive:false })
  ])

  /* ── Rutas geodésicas ── */

  // Ormuz → Asia-Pacífico: Bab-el-Mandeb → Malaca → Tokio
  const routeAsia = animatedRoute(
    [
      L.latLng( 26.5,  56.5),  // Estrecho de Ormuz
      L.latLng( 12.0,  44.0),  // Bab-el-Mandeb
      L.latLng(  1.3, 103.8),  // Estrecho de Malaca (Singapur)
      L.latLng( 35.6, 139.6),  // Tokio
    ],
    '#f39c12', 'Asia-Pacífico · 43%', 0
  )

  // Ormuz → Europa: Bab-el-Mandeb → Suez → Mediterráneo → Génova
  const routeEurope = animatedRoute(
    [
      L.latLng(26.5, 56.5),   // Estrecho de Ormuz
      L.latLng(12.0, 44.0),   // Bab-el-Mandeb
      L.latLng(29.9, 32.5),   // Canal de Suez
      L.latLng(36.5, 15.0),   // Mediterráneo central (Malta)
      L.latLng(41.0,  9.0),   // Liguria / Génova
    ],
    '#e74c3c', 'Europa-Mediterráneo · 28%', 1
  )

  // Ormuz → Norteamérica: Bab-el-Mandeb → Cabo de Buena Esperanza → Miami
  const routeAmerica = animatedRoute(
    [
      L.latLng( 26.5,  56.5), // Estrecho de Ormuz
      L.latLng( 12.0,  44.0), // Bab-el-Mandeb
      L.latLng(-34.4,  18.5), // Cabo de Buena Esperanza
      L.latLng(  0.0, -25.0), // Atlántico Sur abierto
      L.latLng( 25.0, -80.0), // Miami / Golfo de México
    ],
    '#3498db', 'Norteamérica · 18%', 2
  )

  /* ── Estrecho de Ormuz ── */

  const hormuzSVG = L.marker([26.5, 56.5], {
    icon: L.divIcon({
      className: 'hormuz-pulse',
      html: `
        <svg width="90" height="90" style="overflow:visible;margin-left:-45px;margin-top:-45px;">
          <defs>
            <radialGradient id="hgrd" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stop-color="#c0392b" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#c0392b" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <circle class="ring"  cx="45" cy="45" r="14" fill="none" stroke="#c0392b" stroke-width="1.5" opacity="0.8"/>
          <circle class="ring2" cx="45" cy="45" r="14" fill="none" stroke="#c0392b" stroke-width="1"   opacity="0.6"/>
          <circle cx="45" cy="45" r="8" fill="#c0392b" stroke="#ff6b6b" stroke-width="1.5" opacity="0.95"/>
          <circle cx="45" cy="45" r="4" fill="#ff9999" opacity="0.9"/>
        </svg>
      `,
      iconSize: [90, 90],
      iconAnchor: [45, 45]
    }),
    interactive: true
  }).bindPopup(`
    <b style="color:#d4a017;font-size:15px;">Estrecho de Ormuz</b><br>
    <span style="opacity:0.5;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;">Punto crítico global</span><br><br>
    <span style="color:rgba(245,240,232,0.8);font-size:13px;">
      <b style="color:#c0392b;">33 km</b> de ancho mínimo<br>
      <b style="color:#c0392b;">~20%</b> del gas mundial<br>
      <b style="color:#c0392b;">+17</b> países afectados
    </span>
  `)

  const hormuzLabel = L.marker([26.9, 57.2], {
    icon: L.divIcon({
      className: '',
      html: `<div style="color:#e74c3c;font-family:'Playfair Display',serif;font-weight:700;
             font-size:12px;text-shadow:0 2px 8px #000;white-space:nowrap;letter-spacing:0.05em;">
             ESTRECHO DE ORMUZ</div>`,
      iconSize: [190, 20], iconAnchor: [0, 10]
    }),
    interactive: false
  })

  const volumeBadge = L.marker([25.0, 58.0], {
    icon: L.divIcon({
      className: '',
      html: `<div style="
        background:rgba(192,57,43,0.15);
        border:1px solid rgba(192,57,43,0.5);
        border-radius:3px;
        padding:6px 10px;
        font-family:'Source Serif 4',serif;
        font-size:11px;
        color:rgba(245,240,232,0.8);
        white-space:nowrap;
        backdrop-filter:blur(8px);
        box-shadow:0 4px 16px rgba(0,0,0,0.5);
      ">
        <span style="color:#d4a017;font-family:'Playfair Display',serif;font-size:16px;font-weight:700;">21M</span>
        <span style="display:block;opacity:0.6;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">barriles/día</span>
      </div>`,
      iconSize: [100, 50], iconAnchor: [50, 0]
    }),
    interactive: false
  })

  const hormuz = L.layerGroup([hormuzSVG, hormuzLabel, volumeBadge])
  const routes = L.layerGroup([routeAsia, routeEurope, routeAmerica])

  _map._layers_store = { iranPoly, neighbors, bases, baseRanges, routes, hormuz }
  _map._currentStep = -1

  return _map
}

export function updateMap(step) {
  if (!_map) return
  if (step === _map._currentStep) return
  _map._currentStep = step

  const { iranPoly, neighbors, bases, baseRanges, routes, hormuz } = _map._layers_store
  const all = [iranPoly, neighbors, bases, baseRanges, routes, hormuz]
  all.forEach(l => { if (_map.hasLayer(l)) _map.removeLayer(l) })

  if (step === 0) {
    _map.flyTo([28, 50], 3, { duration: 1.6 })
  }
  if (step === 1) {
    _map.addLayer(neighbors)
    _map.addLayer(iranPoly)
    _map.flyTo([32, 53], 5, { duration: 1.6 })
  }
  if (step === 2) {
    _map.addLayer(iranPoly)
    _map.addLayer(bases)
    _map.addLayer(baseRanges)
    _map.flyTo([30, 50], 4.5, { duration: 1.6 })
  }
  if (step === 3) {
    _map.addLayer(iranPoly)
    _map.addLayer(routes)
    _map.addLayer(hormuz)
    _map.flyTo([10, 60], 3, { duration: 1.8 })
  }
  if (step === 4) {
    _map.addLayer(iranPoly)
    _map.addLayer(hormuz)
    _map.flyTo([26.5, 56.5], 7, { duration: 1.8 })
  }
}