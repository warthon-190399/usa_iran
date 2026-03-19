let _map = null

// ── Animated polyline factory (geodésica) ────────────────────────────────
function animatedRoute(waypoints, color, label, delay = 0) {
  const group = L.layerGroup()

  const base = {
    color,
    steps: 50,
    wrap: false,
    interactive: false,
    smoothFactor: 1
  }

  L.geodesic(waypoints, { ...base, weight: 10, opacity: 0.10 }).addTo(group)
  L.geodesic(waypoints, { ...base, weight: 2,  opacity: 0.30 }).addTo(group)
  L.geodesic(waypoints, {
    ...base,
    weight: 3,
    opacity: 0.90,
    dashArray: '12, 18',
    dashOffset: '0',
    className: `route-animated route-delay-${delay}`
  }).addTo(group)

  const mid = waypoints[Math.floor(waypoints.length / 2)]
  L.marker(mid, {
    icon: L.divIcon({
      className: '',
      html: `<div class="route-label" style="--rc:${color};">${label}</div>`,
      iconAnchor: [60, 10]
    }),
    interactive: false
  }).addTo(group)

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

// ── Línea de comando proxy (más delgada, diferente dash) ─────────────────
function proxyLine(from, to, color, delay = 0) {
  const group = L.layerGroup()

  const base = { color, steps: 40, wrap: false, interactive: false }

  // Glow
  L.geodesic([from, to], { ...base, weight: 8, opacity: 0.08 }).addTo(group)
  // Track
  L.geodesic([from, to], { ...base, weight: 1.5, opacity: 0.25 }).addTo(group)
  // Animated dash
  L.geodesic([from, to], {
    ...base,
    weight: 2,
    opacity: 0.75,
    dashArray: '6, 10',
    dashOffset: '0',
    className: `route-animated route-delay-${delay}`
  }).addTo(group)

  // Punto destino pulsante
  L.circleMarker(to, {
    radius: 6,
    color,
    fillColor: color,
    fillOpacity: 0.85,
    weight: 1.5,
    interactive: false,
    className: 'proxy-pulse-dot'
  }).addTo(group)

  return group
}

// ── Marcador de objetivo (target) ─────────────────────────────────────────
function targetMarker(latlng, icon, label, color, popupContent) {
  const group = L.layerGroup()

  // Radio de amenaza
  L.circle(latlng, {
    color,
    weight: 1,
    opacity: 0.25,
    fillColor: color,
    fillOpacity: 0.05,
    radius: 220000,
    interactive: false
  }).addTo(group)

  // Marcador
  const marker = L.marker(latlng, {
    icon: L.divIcon({
      className: '',
      html: `<div class="target-marker" style="--tc:${color};">
               <div class="target-marker-ring"></div>
               <div class="target-marker-core">${icon}</div>
             </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    })
  })

  if (popupContent) {
    marker.bindPopup(`
      <b style="color:#d4a017;font-size:14px;">${label}</b><br>
      <span style="color:rgba(245,240,232,0.7);font-size:12px;">${popupContent}</span>
    `)
  }

  marker.addTo(group)
  return group
}

// ── Marcador de instalación iraní (subterránea / militar) ─────────────────
function iranFacilityMarker(latlng, label, sublabel) {
  return L.marker(latlng, {
    icon: L.divIcon({
      className: '',
      html: `<div class="iran-facility">
               <div class="iran-facility-core"></div>
               <div class="iran-facility-label">
                 <span class="ifl-name">${label}</span>
                 <span class="ifl-sub">${sublabel}</span>
               </div>
             </div>`,
      iconSize: [130, 36],
      iconAnchor: [8, 18]
    }),
    interactive: false
  })
}

// ── Inject CSS ─────────────────────────────────────────────────────────────
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
    .route-delay-3 path { animation-delay: -0.5s; }

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

    /* Target markers (bloque 03) */
    @keyframes targetPulse {
      0%   { transform: scale(1);   opacity: 0.8; }
      50%  { transform: scale(1.5); opacity: 0;   }
      100% { transform: scale(1);   opacity: 0;   }
    }
    .target-marker {
      position: relative;
      width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center;
    }
    .target-marker-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 1.5px solid var(--tc, #c0392b);
      animation: targetPulse 2.2s ease-out infinite;
    }
    .target-marker-core {
      position: relative;
      z-index: 1;
      width: 24px; height: 24px;
      background: rgba(13,13,13,0.88);
      border: 1.5px solid var(--tc, #c0392b);
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      backdrop-filter: blur(6px);
      box-shadow: 0 0 10px rgba(0,0,0,0.6);
    }

    /* Proxy pulse dot */
    @keyframes proxyPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(212,160,23,0.6); }
      50%       { box-shadow: 0 0 0 8px rgba(212,160,23,0); }
    }
    .proxy-pulse-dot {
      animation: proxyPulse 2s ease-in-out infinite;
    }

    /* Iran facility markers */
    .iran-facility {
      display: flex;
      align-items: center;
      gap: 8px;
      pointer-events: none;
    }
    .iran-facility-core {
      width: 10px; height: 10px;
      border-radius: 50%;
      background: #c0392b;
      border: 1.5px solid rgba(255,100,100,0.8);
      box-shadow: 0 0 8px rgba(192,57,43,0.8);
      flex-shrink: 0;
    }
    .iran-facility-label {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .ifl-name {
      font-family: 'Source Serif 4', serif;
      font-size: 10px;
      font-weight: 400;
      color: rgba(245,240,232,0.85);
      white-space: nowrap;
      text-shadow: 0 1px 6px #000, 0 0 12px #000;
    }
    .ifl-sub {
      font-family: 'Source Serif 4', serif;
      font-size: 9px;
      font-weight: 300;
      color: rgba(245,240,232,0.4);
      white-space: nowrap;
      text-shadow: 0 1px 4px #000;
    }

    /* Proxy zone label */
    .proxy-zone-label {
      background: rgba(13,13,13,0.85);
      border: 1px solid var(--pzc, #d4a017);
      border-radius: 2px;
      color: var(--pzc, #d4a017);
      font-family: 'Source Serif 4', serif;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 3px 8px;
      white-space: nowrap;
      backdrop-filter: blur(6px);
    }

    /* Ukraine highlight */
    .ukraine-label {
      background: rgba(13,13,13,0.85);
      border: 1px solid rgba(100,140,200,0.5);
      border-radius: 2px;
      color: rgba(100,160,220,0.9);
      font-family: 'Source Serif 4', serif;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding: 3px 8px;
      white-space: nowrap;
    }

    /* Map fade transition */
    #map {
      transition: opacity 0.6s ease;
    }
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

  /* ── Capas base de países ── */
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
    // Nuevos para bloque 01
    ukraine:     { iso: 'UKR', color: '#5580b0', fillColor: '#4a70a0', fillOpacity: 0.30, weight: 1.2, opacity: 0.7 },
    russia:      { iso: 'RUS', color: '#666',    fillColor: '#555',    fillOpacity: 0.20, weight: 0.8, opacity: 0.5 },
    syria:       { iso: 'SYR', color: '#8a5040', fillColor: '#7a4535', fillOpacity: 0.28, weight: 0.8, opacity: 0.5 },
    lebanon:     { iso: 'LBN', color: '#c06030', fillColor: '#b05528', fillOpacity: 0.35, weight: 1.0, opacity: 0.7 },
    yemen:       { iso: 'YEM', color: '#c0a030', fillColor: '#b09025', fillOpacity: 0.32, weight: 1.0, opacity: 0.7 },
    israel:      { iso: 'ISR', color: '#4a80c0', fillColor: '#3a70b0', fillOpacity: 0.30, weight: 1.0, opacity: 0.7 },
  }

  const iranPoly  = L.layerGroup()
  const neighbors = L.layerGroup()

  // Capas nuevas para conflict section
  const ukrainePoly  = L.layerGroup()
  const russiaPoly   = L.layerGroup()
  const proxyCountries = L.layerGroup() // líbano, yemen, siria, israel

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
        features: allData.features.filter(f => f.properties['ISO3166-1-Alpha-3'] === iso)
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
      if (key === 'iran')                              iranPoly.addLayer(layer)
      else if (key === 'ukraine')                      ukrainePoly.addLayer(layer)
      else if (key === 'russia')                       russiaPoly.addLayer(layer)
      else if (['lebanon','yemen','syria','israel'].includes(key)) proxyCountries.addLayer(layer)
      else                                             neighbors.addLayer(layer)
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

  /* ── Rutas petroleras ── */
  const routeAsia = animatedRoute(
    [ L.latLng(26.5,56.5), L.latLng(12.0,44.0), L.latLng(1.3,103.8), L.latLng(35.6,139.6) ],
    '#f39c12', 'Asia-Pacífico · 43%', 0
  )
  const routeEurope = animatedRoute(
    [ L.latLng(26.5,56.5), L.latLng(12.0,44.0), L.latLng(29.9,32.5), L.latLng(36.5,15.0), L.latLng(41.0,9.0) ],
    '#e74c3c', 'Europa-Mediterráneo · 28%', 1
  )
  const routeAmerica = animatedRoute(
    [ L.latLng(26.5,56.5), L.latLng(12.0,44.0), L.latLng(-34.4,18.5), L.latLng(0.0,-25.0), L.latLng(25.0,-80.0) ],
    '#3498db', 'Norteamérica · 18%', 2
  )

  /* ── Hormuz ── */
  const hormuzSVG = L.marker([26.5, 56.5], {
    icon: L.divIcon({
      className: 'hormuz-pulse',
      html: `<svg width="90" height="90" style="overflow:visible;margin-left:-45px;margin-top:-45px;">
               <defs><radialGradient id="hgrd" cx="50%" cy="50%" r="50%">
                 <stop offset="0%"   stop-color="#c0392b" stop-opacity="0.9"/>
                 <stop offset="100%" stop-color="#c0392b" stop-opacity="0"/>
               </radialGradient></defs>
               <circle class="ring"  cx="45" cy="45" r="14" fill="none" stroke="#c0392b" stroke-width="1.5" opacity="0.8"/>
               <circle class="ring2" cx="45" cy="45" r="14" fill="none" stroke="#c0392b" stroke-width="1"   opacity="0.6"/>
               <circle cx="45" cy="45" r="8" fill="#c0392b" stroke="#ff6b6b" stroke-width="1.5" opacity="0.95"/>
               <circle cx="45" cy="45" r="4" fill="#ff9999" opacity="0.9"/>
             </svg>`,
      iconSize: [90, 90], iconAnchor: [45, 45]
    }),
    interactive: true
  }).bindPopup(`<b style="color:#d4a017;font-size:15px;">Estrecho de Ormuz</b><br>
    <span style="color:rgba(245,240,232,0.8);font-size:13px;">
      <b style="color:#c0392b;">~20%</b> del gas mundial<br>
      <b style="color:#c0392b;">+17</b> países afectados
    </span>`)

  const hormuzLabel = L.marker([26.9, 57.2], {
    icon: L.divIcon({
      className: '',
      html: `<div style="color:#e74c3c;font-family:'Playfair Display',serif;font-weight:700;
             font-size:12px;text-shadow:0 2px 8px #000;white-space:nowrap;">ESTRECHO DE ORMUZ</div>`,
      iconSize: [190, 20], iconAnchor: [0, 10]
    }),
    interactive: false
  })

  const volumeBadge = L.marker([25.0, 58.0], {
    icon: L.divIcon({
      className: '',
      html: `<div style="background:rgba(192,57,43,0.15);border:1px solid rgba(192,57,43,0.5);
        border-radius:3px;padding:6px 10px;font-family:'Source Serif 4',serif;font-size:11px;
        color:rgba(245,240,232,0.8);white-space:nowrap;backdrop-filter:blur(8px);">
        <span style="color:#d4a017;font-family:'Playfair Display',serif;font-size:16px;font-weight:700;">21M</span>
        <span style="display:block;opacity:0.6;font-size:10px;letter-spacing:0.1em;text-transform:uppercase;">barriles/día</span>
      </div>`,
      iconSize: [100, 50], iconAnchor: [50, 0]
    }),
    interactive: false
  })

  const hormuz = L.layerGroup([hormuzSVG, hormuzLabel, volumeBadge])
  const routes = L.layerGroup([routeAsia, routeEurope, routeAmerica])

  /* ══════════════════════════════════════════════════
     CAPAS EXCLUSIVAS DE LA CONFLICT SECTION
     ══════════════════════════════════════════════════ */

  // ── BLOQUE C01: Dos teatros (Ucrania + Golfo) ────────────────────────────
  const warUkraine = animatedRoute(
    [ L.latLng(55.75, 37.6), L.latLng(50.45, 30.52) ],  // Moscú → Kiev
    '#5580b0', 'Frente Ucrania', 0
  )

  const ukraineLabel = L.marker([49.5, 31.0], {
    icon: L.divIcon({
      className: '',
      html: `<div class="ukraine-label">Ucrania · frente activo</div>`,
      iconSize: [160, 20], iconAnchor: [80, 10]
    }),
    interactive: false
  })

  // Vacío estratégico: área difusa sobre Siria/Iraq/Líbano
  const strategicVoid = L.circle([34.0, 38.0], {
    color: 'rgba(212,160,23,0.15)',
    weight: 1,
    fillColor: 'rgba(212,160,23,0.04)',
    fillOpacity: 1,
    radius: 900000,
    interactive: false
  })

  const voidLabel = L.marker([35.0, 38.5], {
    icon: L.divIcon({
      className: '',
      html: `<div style="color:rgba(212,160,23,0.5);font-family:'Source Serif 4',serif;
             font-size:10px;letter-spacing:0.25em;text-transform:uppercase;
             text-shadow:0 1px 6px #000;white-space:nowrap;">Vacío estratégico</div>`,
      iconSize: [160, 16], iconAnchor: [80, 8]
    }),
    interactive: false
  })

  const conflictC01 = L.layerGroup([
    ukrainePoly, russiaPoly, warUkraine, ukraineLabel,
    strategicVoid, voidLabel
  ])

  // ── BLOQUE C03: Objetivos iraníes en el Golfo ────────────────────────────
  const targetDesalinization = L.layerGroup([
    targetMarker([27.0, 49.6],  '💧', 'Jubail (Saudi)', '#c0392b',
      'Mayor planta desalinizadora del mundo. 3M m³/día.'),
    targetMarker([25.07, 55.13],'💧', 'Jebel Ali (EAU)', '#c0392b',
      'Abastece al 98% de Dubai. Crítica para 3M personas.'),
    targetMarker([25.28, 51.53],'💧', 'Ras Abu Fontas (Qatar)', '#c0392b',
      'Única fuente de agua potable de Qatar.'),
  ])

  const targetOil = L.layerGroup([
    targetMarker([26.0, 49.97], '⛽', 'Abqaiq (Saudi)', '#d4a017',
      '7% del petróleo mundial pasa por esta instalación.'),
    targetMarker([24.47, 54.37],'⛽', 'Ruwais (EAU)', '#d4a017',
      'Refinería más grande de Oriente Medio fuera de Arabia.'),
  ])

  // Rango de misiles iraníes desde Bushehr
  const iranMissileRange = L.circle([28.97, 50.84], {
    color: 'rgba(192,57,43,0.2)',
    weight: 1,
    fillColor: 'rgba(192,57,43,0.04)',
    fillOpacity: 1,
    radius: 1500000,
    dashArray: '6,6',
    interactive: false
  })

  const rangeLabel = L.marker([28.97, 50.84], {
    icon: L.divIcon({
      className: '',
      html: `<div style="color:rgba(192,57,43,0.6);font-family:'Source Serif 4',serif;
             font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
             text-shadow:0 1px 6px #000;white-space:nowrap;">Radio de alcance · 1500 km</div>`,
      iconSize: [160, 14], iconAnchor: [80, 7]
    }),
    interactive: false
  })

  const conflictC03 = L.layerGroup([
    iranPoly, neighbors,
    iranMissileRange, rangeLabel,
    targetDesalinization, targetOil,
    hormuzSVG
  ])

  // ── BLOQUE C07: Irán por dentro ──────────────────────────────────────────
  // Zonas montañosas estratégicas (polígonos aproximados)
  const zagros = L.polygon([
    [34.5, 46.0],[33.0, 47.5],[31.0, 49.5],[29.0, 50.5],
    [28.0, 56.0],[30.0, 57.5],[32.0, 55.0],[34.0, 52.0],[36.0, 48.5]
  ], {
    color: 'rgba(100,80,60,0.4)',
    weight: 0,
    fillColor: 'rgba(80,60,40,0.22)',
    fillOpacity: 1,
    interactive: false,
    smoothFactor: 2
  })

  const alborz = L.polygon([
    [36.8, 49.0],[37.2, 51.0],[36.5, 53.0],[36.0, 56.0],
    [37.5, 56.5],[38.5, 54.0],[38.0, 50.0],[37.5, 48.5]
  ], {
    color: 'rgba(100,80,60,0.4)',
    weight: 0,
    fillColor: 'rgba(80,60,40,0.22)',
    fillOpacity: 1,
    interactive: false,
    smoothFactor: 2
  })

  const mountainLabel = L.marker([32.0, 48.5], {
    icon: L.divIcon({
      className: '',
      html: `<div style="color:rgba(180,150,100,0.6);font-family:'Source Serif 4',serif;
             font-size:9px;letter-spacing:0.2em;text-transform:uppercase;
             text-shadow:0 1px 6px #000;white-space:nowrap;">Zagros · terreno montañoso</div>`,
      iconSize: [180, 14], iconAnchor: [0, 7]
    }),
    interactive: false
  })

  const facilities = L.layerGroup([
    iranFacilityMarker([33.72, 51.72], 'Natanz', 'Enriquecimiento uraniо'),
    iranFacilityMarker([32.82, 51.52], 'Isfahan', 'Centro nuclear'),
    iranFacilityMarker([28.81, 50.89], 'Bushehr', 'Reactor nuclear'),
    iranFacilityMarker([34.88, 48.84], 'Fordow',  'Instalación subterránea'),
    iranFacilityMarker([35.69, 51.39], 'Teherán', 'HQ IRGC'),
  ])

  const conflictC07 = L.layerGroup([
    iranPoly,
    zagros, alborz, mountainLabel,
    facilities
  ])

  // ── BLOQUE C08: Red de proxies ───────────────────────────────────────────
  const irgcOrigin = L.circleMarker([35.69, 51.39], {
    radius: 10,
    color: '#c0392b',
    fillColor: '#c0392b',
    fillOpacity: 0.9,
    weight: 2,
    interactive: false
  })

  // Líneas de comando desde Teherán
  const lineHezbollah    = proxyLine(L.latLng(35.69,51.39), L.latLng(33.88,35.50), '#e67e22', 0)
  const lineHouthis      = proxyLine(L.latLng(35.69,51.39), L.latLng(15.35,44.20), '#d4a017', 1)
  const lineIraqMilitias = proxyLine(L.latLng(35.69,51.39), L.latLng(33.32,44.36), '#c0392b', 2)
  const lineHamas        = proxyLine(L.latLng(35.69,51.39), L.latLng(31.50,34.46), '#e84040', 3)

  // Labels de zona proxy
  function proxyZoneLabel(latlng, text, color) {
    return L.marker(latlng, {
      icon: L.divIcon({
        className: '',
        html: `<div class="proxy-zone-label" style="--pzc:${color};">${text}</div>`,
        iconSize: [140, 20], iconAnchor: [70, 10]
      }),
      interactive: false
    })
  }

  const proxyLabels = L.layerGroup([
    proxyZoneLabel([34.5,  35.0], 'Hezbollah',  '#e67e22'),
    proxyZoneLabel([14.5,  44.5], 'Houthis',    '#d4a017'),
    proxyZoneLabel([32.5,  43.5], 'Milicias',   '#c0392b'),
    proxyZoneLabel([31.2,  34.0], 'Hamas',      '#e84040'),
  ])

  const conflictC08 = L.layerGroup([
    iranPoly, proxyCountries,
    irgcOrigin,
    lineHezbollah, lineHouthis, lineIraqMilitias, lineHamas,
    proxyLabels
  ])

  /* ── Store ── */
  _map._layers_store = {
    iranPoly, neighbors, bases, baseRanges, routes, hormuz,
    // conflict
    conflictC01, conflictC03, conflictC07, conflictC08
  }
  _map._currentStep = -1

  return _map
}

// ── updateMap: pasos originales (0-4) + pasos conflicto (c01,c03,c07,c08) ─

// ── flyOffset: compensa la columna editorial (~50% izq) desplazando el centro ──
// Mueve el punto de interés hacia la columna derecha usando paddingTopLeft
function flyOffset(map, latlng, zoom, options = {}) {
  const colWidth = Math.round(window.innerWidth * 0.50)
  const point = map.project(L.latLng(latlng), zoom)
  // Desplazar medio ancho de columna hacia la izquierda en píxeles de mapa
  const shifted = L.point(point.x - colWidth / 2, point.y)
  const shiftedLatLng = map.unproject(shifted, zoom)
  map.flyTo(shiftedLatLng, zoom, { duration: options.duration || 1.8, easeLinearity: 0.35 })
}

export function updateMap(step) {
  if (!_map) return
  if (step === _map._currentStep) return
  _map._currentStep = step

  const {
    iranPoly, neighbors, bases, baseRanges, routes, hormuz,
    conflictC01, conflictC03, conflictC07, conflictC08
  } = _map._layers_store

  const mapEl = document.getElementById('map')

  // Todas las capas posibles
  const allLayers = [
    iranPoly, neighbors, bases, baseRanges, routes, hormuz,
    conflictC01, conflictC03, conflictC07, conflictC08
  ]
  allLayers.forEach(l => { if (_map.hasLayer(l)) _map.removeLayer(l) })

  // ── Pasos originales ─────────────────────────────────────────────────────
  if (step === 0) {
    mapEl.style.opacity = '1'
    _map.flyTo([28, 50], 3, { duration: 1.6 })
  }
  if (step === 1) {
    mapEl.style.opacity = '1'
    _map.addLayer(neighbors)
    _map.addLayer(iranPoly)
    _map.flyTo([32, 53], 3, { duration: 1.6 })
  }
  if (step === 2) {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(bases)
    _map.addLayer(baseRanges)
    _map.flyTo([30, 50], 4.5, { duration: 1.6 })
  }
  if (step === 3) {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(routes)
    _map.addLayer(hormuz)
    _map.flyTo([10, 60], 3, { duration: 1.8 })
  }
  if (step === 4) {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(hormuz)
    _map.flyTo([26.5, 56.5], 7, { duration: 1.8 })
  }

  // ── Sin mapa: fade out ───────────────────────────────────────────────────
  if (step === 'off') {
    mapEl.style.opacity = '0'
  }

  // ── Pasos conflict section ───────────────────────────────────────────────
  if (step === 'c01') {
    mapEl.style.opacity = '1'
    _map.addLayer(conflictC01)
    _map.addLayer(iranPoly)
    // Vista amplia Europa+Oriente Medio: centrar en área visible (col derecha ~50%)
    // Desplazamos el centro hacia la izquierda para que el interés quede en col derecha
    flyOffset(_map, [38, 52], 3.9, { duration: 2.0 })
  }
  if (step === 'c03') {
    mapEl.style.opacity = '1'
    _map.addLayer(conflictC03)
    // Golfo Pérsico: el Golfo debe quedar en la mitad derecha
    flyOffset(_map, [30, 95], 4.7, { duration: 1.8 })
  }
  if (step === 'c07') {
    mapEl.style.opacity = '1'
    _map.addLayer(conflictC07)
    // Irán completo: centrar Irán en la columna derecha
    flyOffset(_map, [32.5, 56], 5.5, { duration: 1.8 })
  }
  if (step === 'c08') {
    mapEl.style.opacity = '1'
    _map.addLayer(conflictC08)
    // Levante + Golfo: la red proxy debe quedar en col derecha
    flyOffset(_map, [30, 97], 4.5, { duration: 2.0 })
  }
}