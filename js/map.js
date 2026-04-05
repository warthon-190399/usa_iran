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
  L.geodesic(waypoints, { ...base, weight: 2, opacity: 0.30 }).addTo(group)
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



    /* Ormuz heatmap — círculos concéntricos de calor */
    @keyframes heatExpand {
      0%   { stroke-opacity: 0.7; stroke-width: 2; }
      100% { stroke-opacity: 0;   stroke-width: 0.5; }
    }
    @keyframes heatExpand2 {
      0%   { stroke-opacity: 0.5; stroke-width: 1.5; }
      100% { stroke-opacity: 0;   stroke-width: 0.5; }
    }
    .heat-ring-1 { animation: heatExpand  3.5s ease-out infinite; }
    .heat-ring-2 { animation: heatExpand  3.5s ease-out infinite; animation-delay: 0.7s; }
    .heat-ring-3 { animation: heatExpand2 3.5s ease-out infinite; animation-delay: 1.4s; }
    .heat-ring-4 { animation: heatExpand2 3.5s ease-out infinite; animation-delay: 2.1s; }
    .heat-ring-5 { animation: heatExpand2 3.5s ease-out infinite; animation-delay: 2.8s; }

    /* Fleet marker */
    @keyframes fleetPulse {
      0%   { transform: scale(1);   opacity: 0.7; }
      50%  { transform: scale(1.8); opacity: 0;   }
      100% { transform: scale(1);   opacity: 0;   }
    }
    .fleet-marker {
      position: relative;
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
    }
    .fleet-marker-ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 1.5px solid rgba(80,130,255,0.6);
      animation: fleetPulse 2.8s ease-out infinite;
    }
    .fleet-marker-ring--2 {
      animation-delay: 1.4s;
    }
    .fleet-marker-core {
      position: relative;
      z-index: 1;
      width: 28px; height: 28px;
      background: rgba(20,50,120,0.92);
      border: 2px solid rgba(80,130,255,0.8);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      box-shadow: 0 0 16px rgba(80,130,255,0.5), 0 0 32px rgba(80,130,255,0.2);
      backdrop-filter: blur(4px);
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
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false,
    dragging: false,
    doubleClickZoom: false,
    touchZoom: false,
    keyboard: false
  }).setView([28, 50], 4)

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    { maxZoom: 18 }
  ).addTo(_map)

  /* ── Capas base de países ── */
  const COUNTRY_LAYERS = {
    iran: { iso: 'IRN', color: '#e84040', fillColor: '#c0392b', fillOpacity: 0.35, weight: 1.8, opacity: 0.9 },
    iraq: { iso: 'IRQ', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.30, weight: 0.8, opacity: 0.5 },
    kuwait: { iso: 'KWT', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.30, weight: 0.8, opacity: 0.5 },
    saudi: { iso: 'SAU', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.25, weight: 0.8, opacity: 0.5 },
    qatar: { iso: 'QAT', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.32, weight: 0.8, opacity: 0.5 },
    uae: { iso: 'ARE', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.30, weight: 0.8, opacity: 0.5 },
    bahrain: { iso: 'BHR', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.33, weight: 0.8, opacity: 0.5 },
    oman: { iso: 'OMN', color: '#8a7040', fillColor: '#b8922a', fillOpacity: 0.28, weight: 0.8, opacity: 0.5 },
    turkmen: { iso: 'TKM', color: '#888', fillColor: '#999', fillOpacity: 0.22, weight: 0.6, opacity: 0.6 },
    afghanistan: { iso: 'AFG', color: '#888', fillColor: '#999', fillOpacity: 0.22, weight: 0.6, opacity: 0.6 },
    azerbaijan: { iso: 'AZE', color: '#888', fillColor: '#999', fillOpacity: 0.22, weight: 0.6, opacity: 0.6 },
    // Nuevos para bloque 01
    ukraine: { iso: 'UKR', color: '#5580b0', fillColor: '#4a70a0', fillOpacity: 0.30, weight: 1.2, opacity: 0.7 },
    russia: { iso: 'RUS', color: '#666', fillColor: '#555', fillOpacity: 0.20, weight: 0.8, opacity: 0.5 },
    syria: { iso: 'SYR', color: '#8a5040', fillColor: '#7a4535', fillOpacity: 0.28, weight: 0.8, opacity: 0.5 },
    lebanon: { iso: 'LBN', color: '#c06030', fillColor: '#b05528', fillOpacity: 0.35, weight: 1.0, opacity: 0.7 },
    yemen: { iso: 'YEM', color: '#c0a030', fillColor: '#b09025', fillOpacity: 0.32, weight: 1.0, opacity: 0.7 },
    israel: { iso: 'ISR', color: '#4a80c0', fillColor: '#3a70b0', fillOpacity: 0.30, weight: 1.0, opacity: 0.7 },
  }

  const iranPoly = L.layerGroup()
  const neighbors = L.layerGroup()

  // Capas nuevas para conflict section
  const ukrainePoly = L.layerGroup()
  const russiaPoly = L.layerGroup()
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
      if (key === 'iran') iranPoly.addLayer(layer)
      else if (key === 'ukraine') ukrainePoly.addLayer(layer)
      else if (key === 'russia') russiaPoly.addLayer(layer)
      else if (['lebanon', 'yemen', 'syria', 'israel'].includes(key)) proxyCountries.addLayer(layer)
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
    baseMarker([25.11, 51.31], 'Al Udeid Air Base', 'Qatar'),
    baseMarker([29.23, 47.45], 'Camp Arifjan', 'Kuwait'),
    baseMarker([33.79, 42.44], 'Ain al-Asad', 'Iraq'),
    baseMarker([26.08, 50.56], 'NSA Bahrain · 5ª Flota', 'Bahrain'),
    baseMarker([24.25, 54.65], 'Al Dhafra Air Base', 'Emiratos Árabes'),
    baseMarker([30.44, 47.78], 'Camp Buehring', 'Kuwait')
  ])

  const baseRanges = L.layerGroup([
    L.circle([25.11, 51.31], { color: 'rgba(80,130,255,0.3)', weight: 1, fillColor: 'rgba(80,130,255,0.05)', radius: 500000, interactive: false }),
    L.circle([29.23, 47.45], { color: 'rgba(80,130,255,0.3)', weight: 1, fillColor: 'rgba(80,130,255,0.05)', radius: 400000, interactive: false }),
    L.circle([33.79, 42.44], { color: 'rgba(80,130,255,0.3)', weight: 1, fillColor: 'rgba(80,130,255,0.05)', radius: 450000, interactive: false })
  ])

  /* ── Rutas petroleras ── */
  const routeAsia = animatedRoute(
    [L.latLng(26.5, 56.5), L.latLng(12.0, 44.0), L.latLng(1.3, 103.8), L.latLng(35.6, 139.6)],
    '#f39c12', 'Asia-Pacífico · 43%', 0
  )
  const routeEurope = animatedRoute(
    [L.latLng(26.5, 56.5), L.latLng(12.0, 44.0), L.latLng(29.9, 32.5), L.latLng(36.5, 15.0), L.latLng(41.0, 9.0)],
    '#e74c3c', 'Europa-Mediterráneo · 28%', 1
  )
  const routeAmerica = animatedRoute(
    [L.latLng(26.5, 56.5), L.latLng(12.0, 44.0), L.latLng(-34.4, 18.5), L.latLng(0.0, -25.0), L.latLng(25.0, -80.0)],
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
    [L.latLng(55.75, 37.6), L.latLng(50.45, 30.52)],  // Moscú → Kiev
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
    targetMarker([27.0, 49.6], '💧', 'Jubail (Saudi)', '#c0392b',
      'Mayor planta desalinizadora del mundo. 3M m³/día.'),
    targetMarker([25.07, 55.13], '💧', 'Jebel Ali (EAU)', '#c0392b',
      'Abastece al 98% de Dubai. Crítica para 3M personas.'),
    targetMarker([25.28, 51.53], '💧', 'Ras Abu Fontas (Qatar)', '#c0392b',
      'Única fuente de agua potable de Qatar.'),
  ])

  const targetOil = L.layerGroup([
    targetMarker([26.0, 49.97], '⛽', 'Abqaiq (Saudi)', '#d4a017',
      '7% del petróleo mundial pasa por esta instalación.'),
    targetMarker([24.47, 54.37], '⛽', 'Ruwais (EAU)', '#d4a017',
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
    [34.5, 46.0], [33.0, 47.5], [31.0, 49.5], [29.0, 50.5],
    [28.0, 56.0], [30.0, 57.5], [32.0, 55.0], [34.0, 52.0], [36.0, 48.5]
  ], {
    color: 'rgba(100,80,60,0.4)',
    weight: 0,
    fillColor: 'rgba(80,60,40,0.22)',
    fillOpacity: 1,
    interactive: false,
    smoothFactor: 2
  })

  const alborz = L.polygon([
    [36.8, 49.0], [37.2, 51.0], [36.5, 53.0], [36.0, 56.0],
    [37.5, 56.5], [38.5, 54.0], [38.0, 50.0], [37.5, 48.5]
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
    iranFacilityMarker([34.88, 48.84], 'Fordow', 'Instalación subterránea'),
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
  const lineHezbollah = proxyLine(L.latLng(35.69, 51.39), L.latLng(33.88, 35.50), '#e67e22', 0)
  const lineHouthis = proxyLine(L.latLng(35.69, 51.39), L.latLng(15.35, 44.20), '#d4a017', 1)
  const lineIraqMilitias = proxyLine(L.latLng(35.69, 51.39), L.latLng(33.32, 44.36), '#c0392b', 2)
  const lineHamas = proxyLine(L.latLng(35.69, 51.39), L.latLng(31.50, 34.46), '#e84040', 3)

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
    proxyZoneLabel([34.5, 35.0], 'Hezbollah', '#e67e22'),
    proxyZoneLabel([14.5, 44.5], 'Houthis', '#d4a017'),
    proxyZoneLabel([32.5, 43.5], 'Milicias', '#c0392b'),
    proxyZoneLabel([31.2, 34.0], 'Hamas', '#e84040'),
  ])

  const conflictC08 = L.layerGroup([
    iranPoly, proxyCountries,
    irgcOrigin,
    lineHezbollah, lineHouthis, lineIraqMilitias, lineHamas,
    proxyLabels
  ])

  /* ── Store ── */


  /* ── Ormuz Heatmap — calor de tráfico (step 2) ── */
  const ormuzHeat = L.layerGroup()

  // Círculos estáticos de relleno — gradiente de calor
  const heatFills = [
    { r: 40000, color: 'rgba(220,50,20,0.18)' },
    { r: 90000, color: 'rgba(210,70,10,0.12)' },
    { r: 160000, color: 'rgba(200,100,10,0.09)' },
    { r: 260000, color: 'rgba(190,130,20,0.07)' },
    { r: 400000, color: 'rgba(180,150,30,0.05)' },
    { r: 580000, color: 'rgba(160,160,40,0.04)' },
    { r: 800000, color: 'rgba(140,160,50,0.03)' },
  ]
  heatFills.forEach(({ r, color }) => {
    L.circle([26.5, 56.5], {
      radius: r,
      color: 'transparent',
      fillColor: color,
      fillOpacity: 1,
      weight: 0,
      interactive: false
    }).addTo(ormuzHeat)
  })

  // Anillos animados SVG superpuestos como marker
  const heatRingsSVG = L.marker([26.5, 56.5], {
    icon: L.divIcon({
      className: '',
      html: `<svg width="0" height="0" style="overflow:visible;" xmlns="http://www.w3.org/2000/svg">
        <circle class="heat-ring-1" cx="0" cy="0" r="60"  fill="none" stroke="#e83010" />
        <circle class="heat-ring-2" cx="0" cy="0" r="120" fill="none" stroke="#e85010" />
        <circle class="heat-ring-3" cx="0" cy="0" r="200" fill="none" stroke="#d47010" />
        <circle class="heat-ring-4" cx="0" cy="0" r="300" fill="none" stroke="#c49020" />
        <circle class="heat-ring-5" cx="0" cy="0" r="420" fill="none" stroke="#b4a030" />
      </svg>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    }),
    interactive: false
  })

  // Badge de tráfico central
  const heatBadge = L.marker([26.5, 56.5], {
    icon: L.divIcon({
      className: '',
      html: `<div style="
        background: rgba(180,40,20,0.92);
        border: 1.5px solid rgba(255,120,60,0.8);
        border-radius: 3px;
        padding: 8px 14px;
        font-family: 'Source Serif 4', serif;
        color: rgba(245,240,232,0.95);
        white-space: nowrap;
        backdrop-filter: blur(8px);
        box-shadow: 0 0 30px rgba(200,50,20,0.5), 0 4px 16px rgba(0,0,0,0.6);
        text-align: center;
        transform: translateX(-50%) translateY(-50%);
      ">
        <span style="font-family:'Playfair Display',serif;font-size:22px;font-weight:900;color:#fff;display:block;line-height:1;">21M</span>
        <span style="font-size:9px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.75;display:block;">barriles / día</span>
        <span style="font-size:9px;opacity:0.5;display:block;margin-top:2px;">20% del gas mundial</span>
      </div>`,
      iconSize: [130, 60],
      iconAnchor: [65, 30]
    }),
    interactive: false
  })

  // Label del estrecho
  const heatLabel = L.marker([27.2, 57.5], {
    icon: L.divIcon({
      className: '',
      html: `<div style="
        color: rgba(255,140,80,0.9);
        font-family: 'Playfair Display', serif;
        font-weight: 700;
        font-size: 11px;
        text-shadow: 0 2px 8px #000, 0 0 20px rgba(200,50,20,0.8);
        white-space: nowrap;
        letter-spacing: 0.08em;
      ">ESTRECHO DE ORMUZ</div>`,
      iconSize: [180, 16],
      iconAnchor: [0, 8]
    }),
    interactive: false
  })

  ormuzHeat.addLayer(heatRingsSVG)
  ormuzHeat.addLayer(heatBadge)
  ormuzHeat.addLayer(heatLabel)

  /* ── 5ª Flota Naval — marcador destacado ── */
  const fleetMarker = L.marker([26.08, 50.56], {
    icon: L.divIcon({
      className: '',
      html: `<div class="fleet-marker">
               <div class="fleet-marker-ring"></div>
               <div class="fleet-marker-ring fleet-marker-ring--2"></div>
               <div class="fleet-marker-core">⚓</div>
             </div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    }),
    interactive: true
  }).bindPopup(`
    <b style="color:#64a0ff;font-size:14px;">5ª Flota Naval · NSA Bahréin</b><br>
    <span style="opacity:0.5;font-size:10px;letter-spacing:0.12em;text-transform:uppercase;">
      Única flota permanente fuera de EE.UU.
    </span><br><br>
    <span style="color:rgba(245,240,232,0.8);font-size:12px;line-height:1.7;">
      <b style="color:#64a0ff;">2.5M km²</b> de área operativa<br>
      Cubre Golfo Pérsico, Mar Arábigo y Mar Rojo<br>
      Activada en <b style="color:#64a0ff;">1995</b> tras la Guerra del Golfo
    </span>
  `)

  // Radio de cobertura naval (mucho más grande que las bases aéreas)
  const fleetRange = L.circle([26.08, 50.56], {
    color: 'rgba(80,130,255,0.35)',
    weight: 1.5,
    fillColor: 'rgba(80,130,255,0.04)',
    fillOpacity: 1,
    radius: 1800000,
    dashArray: '4,8',
    interactive: false
  })

  // Label de la flota
  const fleetLabel = L.marker([27.5, 54.0], {
    icon: L.divIcon({
      className: '',
      html: `<div style="
        background: rgba(13,13,13,0.85);
        border: 1px solid rgba(80,130,255,0.4);
        border-radius: 2px;
        padding: 4px 10px;
        font-family: 'Source Serif 4', serif;
        font-size: 10px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: rgba(100,160,255,0.85);
        white-space: nowrap;
        backdrop-filter: blur(6px);
      ">5ª Flota Naval · Área de operación</div>`,
      iconSize: [210, 22],
      iconAnchor: [105, 11]
    }),
    interactive: false
  })

  const fleet = L.layerGroup([fleetRange, fleetMarker, fleetLabel])

  _map._layers_store = {
    iranPoly, neighbors, bases, baseRanges, routes, hormuz, fleet, ormuzHeat,
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
    iranPoly, neighbors, bases, baseRanges, routes, hormuz, fleet, ormuzHeat,
    conflictC01, conflictC03, conflictC07, conflictC08
  } = _map._layers_store

  const mapEl = document.getElementById('map')

  // Todas las capas posibles
  const allLayers = [
    iranPoly, neighbors, bases, baseRanges, routes, hormuz, fleet, ormuzHeat,
    conflictC01, conflictC03, conflictC07, conflictC08
  ]
  allLayers.forEach(l => { if (_map.hasLayer(l)) _map.removeLayer(l) })

  // ── Pasos originales ─────────────────────────────────────────────────────
  if (step === 0) {
    mapEl.style.opacity = '1'
    _map.flyTo([28, 50], 3, { duration: 1.6 })
  }

  // Step 1: Rutas comerciales — Irán + vecinos + rutas geodésicas
  if (step === 1) {
    mapEl.style.opacity = '1'
    _map.addLayer(neighbors)
    _map.addLayer(iranPoly)
    _map.addLayer(routes)
    _map.flyTo([15, 62], 3, { duration: 1.8 })
  }

  // Step 2: Ormuz — zoom cerrado + heatmap de tráfico (sin rutas)
  if (step === 2) {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(ormuzHeat)
    _map.flyTo([26.5, 56.5], 7, { duration: 2.0 })
  }

  // Step 3: Presencia militar EE.UU. + 5ª Flota destacada
  if (step === 3) {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(neighbors)
    _map.addLayer(bases)
    _map.addLayer(baseRanges)
    _map.addLayer(fleet)
    _map.flyTo([28, 50], 4.5, { duration: 1.6 })
  }

  // Step 4 eliminado — absorbido por step 2

  // ── Sin mapa: fade out ───────────────────────────────────────────────────
  if (step === 'off') {
    mapEl.style.opacity = '0'
  }

  // ── Paso estrategia s04: Ormuz heatmap (reutiliza ormuzHeat + step 2) ──
  if (step === 's04') {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(ormuzHeat)
    _map.flyTo([26.5, 51.5], 6, { duration: 2.0 })
  }

  // ── Pasos conflict section ───────────────────────────────────────────────
  if (step === 'c01') {
    mapEl.style.opacity = '1'
    _map.addLayer(conflictC01)
    _map.addLayer(iranPoly)
    // Vista amplia Europa+Oriente Medio: centrar en área visible (col derecha ~50%)
    // Desplazamos el centro hacia la izquierda para que el interés quede en col derecha
    flyOffset(_map, [38, 52], 3, { duration: 2.0 })
  }
  if (step === 'c03') {
    mapEl.style.opacity = '1'
    _map.addLayer(conflictC03)
    // Golfo Pérsico: el Golfo debe quedar en la mitad derecha
    flyOffset(_map, [26, 50], 5.5, { duration: 1.8 })
  }
  if (step === 'c07') {
    mapEl.style.opacity = '1'
    _map.addLayer(conflictC07)
    // Irán completo: centrar Irán en la columna derecha
    flyOffset(_map, [32.5, 54], 5.5, { duration: 1.8 })
  }
  if (step === 'c08') {
    mapEl.style.opacity = '1'
    _map.addLayer(conflictC08)
    // Levante + Golfo: la red proxy debe quedar en col derecha
    flyOffset(_map, [30, 46], 4, { duration: 2.0 })
  }

  // ── Pasos Capítulo Ormuz ─────────────────────────────────────────────────
  // oz01: Zoom cerrado Estrecho de Ormuz + heatmap de tráfico
  if (step === 'oz01') {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(ormuzHeat)
    _map.addLayer(hormuz)
    flyOffset(_map, [26.5, 56.5], 7.5, { duration: 2.0 })
  }

  // oz02: Vista media del Golfo — dependencia por país
  if (step === 'oz02') {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(neighbors)
    _map.addLayer(ormuzHeat)
    flyOffset(_map, [25, 54], 5, { duration: 2.0 })
  }

  // oz03: Heatmap con énfasis en Ormuz — contexto de peajes
  if (step === 'oz03') {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(ormuzHeat)
    _map.addLayer(hormuzSVG)
    flyOffset(_map, [26.8, 56.0], 7, { duration: 1.8 })
  }

  // oz04: Zoom a Isla Kharg (29.24°N, 50.32°E) — terminal exportación iraní
  if (step === 'oz04') {
    mapEl.style.opacity = '1'
    _map.addLayer(iranPoly)
    _map.addLayer(neighbors)
    // Punto especial: isla Kharg
    const khargLabel = L.marker([29.24, 50.32], {
      icon: L.divIcon({
        className: '',
        html: `<div style="
          background: rgba(192,57,43,0.92);
          border: 1.5px solid rgba(255,120,80,0.9);
          border-radius: 3px;
          padding: 8px 14px;
          font-family: 'Source Serif 4', serif;
          color: rgba(245,240,232,0.95);
          white-space: nowrap;
          backdrop-filter: blur(8px);
          box-shadow: 0 0 20px rgba(192,57,43,0.6);
          transform: translateX(-50%) translateY(-110%);
          text-align: center;
        ">
          <span style="font-family:'Playfair Display',serif;font-size:13px;font-weight:700;display:block;">🛢️ Isla Kharg</span>
          <span style="font-size:10px;opacity:0.75;letter-spacing:0.1em;text-transform:uppercase;">Terminal exportación iraní</span>
        </div>`,
        iconSize: [160, 50],
        iconAnchor: [80, 50]
      }),
      interactive: false
    })
    const khargDot = L.circleMarker([29.24, 50.32], {
      radius: 10,
      color: '#c0392b',
      fillColor: '#c0392b',
      fillOpacity: 0.9,
      weight: 2,
      interactive: true,
      className: 'proxy-pulse-dot'
    }).bindPopup(`<b style="color:#d4a017;">Isla Kharg</b><br>
      <span style="opacity:0.7;font-size:12px;">Principal terminal de exportación petrolera irań. 
      Gran parte del crudo iraní destinado a mercados internacionales sale por aquí.</span>`)

    const khargLayer = L.layerGroup([khargDot, khargLabel])
    _map.addLayer(khargLayer)
    flyOffset(_map, [28.5, 51.0], 7, { duration: 2.0 })
    // Limpiar la layer kharg cuando se cambie de paso
    _map._khargLayer = khargLayer
  } else if (_map._khargLayer) {
    if (_map.hasLayer(_map._khargLayer)) _map.removeLayer(_map._khargLayer)
    _map._khargLayer = null
  }
}