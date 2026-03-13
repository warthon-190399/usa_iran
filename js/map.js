let _map = null

// ── Animated polyline factory ─────────────────────────────────────────────
// Draws a route as a series of animated dashes flowing along the path
function animatedRoute(coords, color, label, delay = 0) {
  const group = L.layerGroup()

  // 1. Shadow / glow base line
  const shadow = L.polyline(coords, {
    color,
    weight: 10,
    opacity: 0.10,
    interactive: false,
    smoothFactor: 1.5
  })

  // 2. Thin background track
  const track = L.polyline(coords, {
    color,
    weight: 2,
    opacity: 0.30,
    interactive: false,
    smoothFactor: 1.5
  })

  // 3. Bright animated dash overlay (CSS animation via SVG filter trick)
  const dashes = L.polyline(coords, {
    color,
    weight: 3,
    opacity: 0.90,
    dashArray: '12, 18',
    dashOffset: '0',
    interactive: false,
    smoothFactor: 1.5,
    className: `route-animated route-delay-${delay}`
  })

  group.addLayer(shadow)
  group.addLayer(track)
  group.addLayer(dashes)

  // 4. Label at midpoint
  const mid = coords[Math.floor(coords.length / 2)]
  const labelMarker = L.marker(mid, {
    icon: L.divIcon({
      className: '',
      html: `<div class="route-label" style="--rc:${color};">${label}</div>`,
      iconAnchor: [60, 10]
    }),
    interactive: false
  })
  group.addLayer(labelMarker)

  // 5. Origin dot (Strait of Hormuz)
  const origin = L.circleMarker(coords[0], {
    radius: 5,
    color,
    fillColor: color,
    fillOpacity: 0.95,
    weight: 1.5,
    interactive: false
  })
  group.addLayer(origin)

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

  // ── RUTAS MEJORADAS ────────────────────────────────────────────────────
  // Punto de origen: Estrecho de Ormuz [26.5, 56.5]
  // Rutas con más puntos de control para curvas suaves y realistas

  const routeAsia = animatedRoute(
    [
      [26.5, 56.5],   // Ormuz
      [24.0, 59.0],   // Mar de Arabia norte
      [20.0, 62.0],
      [15.0, 66.5],   // Mar de Arabia centro
      [8.0,  72.0],
      [2.0,  76.0],   // Sur India
      [-1.0, 80.5],
      [-5.0, 84.0],   // Hacia Sri Lanka
      [-8.0, 88.0],
      [-5.0, 95.0],   // Golfo de Bengala
      [2.0, 102.0],   // Estrecho de Malaca
      [8.0, 108.0],   // Mar de China Sur
      [20.0, 118.0],  // Filipinas
      [30.0, 125.0],  // Japón/Corea
    ],
    '#f39c12',
    'Asia-Pacífico · 43%',
    0
  )

  const routeEurope = animatedRoute(
    [
      [26.5, 56.5],   // Ormuz
      [24.0, 52.0],   // Golfo de Omán oeste
      [20.0, 47.0],   // Mar Rojo norte
      [16.0, 43.0],
      [13.0, 42.5],   // Bab-el-Mandeb
      [10.0, 42.0],
      [4.0,  42.0],   // Cuerno de Africa
      [-2.0, 40.0],
      [-5.0, 36.0],   // Costa Africa Oriental
      [-10.0, 30.0],
      [-15.0, 20.0],
      [-18.0, 12.0],  // Africa Oeste
      [-15.0, 3.0],
      [-5.0, -5.0],   // Golfo de Guinea
      [5.0,  -8.0],   // Rodeando Africa (sin Suez para simplificar)
      [20.0, -5.0],
      [35.0, 0.0],    // Mediterráneo
      [38.0, 12.0],
      [41.0, 18.0],
    ],
    '#e74c3c',
    'Europa-Mediterráneo · 28%',
    1
  )

  const routeAmerica = animatedRoute(
    [
      [26.5, 56.5],   // Ormuz
      [24.5, 57.5],
      [22.0, 58.5],   // Sur Arabia
      [17.0, 55.0],
      [13.0, 51.0],
      [10.0, 47.0],   // Costa Somalia
      [5.0,  42.5],
      [0.0,  40.0],   // Cuerno de Africa
      [-8.0, 38.0],
      [-15.0, 35.0],
      [-20.0, 28.0],  // Madagáscar area
      [-28.0, 20.0],
      [-34.0, 18.0],  // Cabo de Buena Esperanza
      [-36.0, 10.0],
      [-35.0, 0.0],
      [-30.0, -10.0],
      [-20.0, -20.0],
      [-10.0, -30.0],
      [0.0,  -35.0],  // Atlántico Sur
      [10.0, -40.0],
      [20.0, -48.0],
      [30.0, -55.0],  // América del Sur
    ],
    '#3498db',
    'Norteamérica · 18%',
    2
  )

  // Estrecho de Ormuz mejorado con pulsos animados
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
          <!-- Pulse rings -->
          <circle class="ring"  cx="45" cy="45" r="14" fill="none" stroke="#c0392b" stroke-width="1.5" opacity="0.8"/>
          <circle class="ring2" cx="45" cy="45" r="14" fill="none" stroke="#c0392b" stroke-width="1"   opacity="0.6"/>
          <!-- Core dot -->
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

  // Volumen badge
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
    _map.addLayer(hormuz)
    _map.flyTo([10, 60], 3, { duration: 1.8 })
  }
  if (step === 4) {
    _map.addLayer(iranPoly)
    _map.addLayer(hormuz)
    _map.flyTo([26.5, 56.5], 7, { duration: 1.8 })
  }
}