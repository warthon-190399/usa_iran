/**
 * graph.js — Capítulo V
 * Visualización de red de influencia iraní con D3 v7
 * Con filtrado interactivo por tipo de relación desde la leyenda
 */

// ── Paleta coherente con el sistema de diseño ──────────────────────────────
const NODE_COLOR = {
  state:        "#c0392b",
  organization: "#d4a017",
  militia:      "#7f8c8d",
  target:       "#2980b9"
}

const EDGE_COLOR = {
  sanctions_attacks:      "#c0392b",
  military_attacks:       "#c0392b",
  airstrikes:             "#c0392b",
  attacks:                "#c0392b",
  terrorist_designation:  "#e74c3c",
  funds_trains:           "#d4a017",
  funds_supplies:         "#d4a017",
  funds:                  "#d4a017",
  recruits_trains:        "#d4a017",
  controls:               "#d4a017",
  ally:                   "#2ecc71",
  military_ally:          "#2ecc71",
  regional_alliance:      "#2ecc71",
  abraham_accords:        "#2ecc71",
  strategic_cooperation:  "#95a5a6",
  rival:                  "#95a5a6",
  military_support:       "#95a5a6",
  operates_within:        "#95a5a6"
}

// ── Categorías de relaciones para el filtro ────────────────────────────────
const RELATION_CATEGORIES = [
  {
    id:       "attacks",
    label:    "Ataques / Sanciones",
    color:    "#c0392b",
    dashed:   false,
    relations: ["sanctions_attacks", "military_attacks", "airstrikes", "attacks", "terrorist_designation"]
  },
  {
    id:       "funding",
    label:    "Financia / Entrena",
    color:    "#d4a017",
    dashed:   true,
    relations: ["funds_trains", "funds_supplies", "funds", "recruits_trains", "controls"]
  },
  {
    id:       "alliance",
    label:    "Alianza / Acuerdo",
    color:    "#2ecc71",
    dashed:   false,
    relations: ["ally", "military_ally", "regional_alliance", "abraham_accords"]
  },
  {
    id:       "cooperation",
    label:    "Cooperación / Rival",
    color:    "#95a5a6",
    dashed:   true,
    relations: ["strategic_cooperation", "rival", "military_support", "operates_within"]
  }
]

function getCategory(relation) {
  for (const cat of RELATION_CATEGORIES) {
    if (cat.relations.includes(relation)) return cat.id
  }
  return null
}

function edgeDash(relation) {
  if (relation.includes("funds") || relation.includes("trains") ||
      relation.includes("recruits") || relation.includes("controls") ||
      relation === "strategic_cooperation" || relation === "rival" ||
      relation === "military_support" || relation === "operates_within") {
    return "5,3"
  }
  return null
}

// ── Nodos fijos para los actores principales ──────────────────────────────
const FIXED = {
  "United States":    { fx: null, fy: null, _anchor: [-0.42, -0.22] },
  "Iran":             { fx: null, fy: null, _anchor: [ 0.18,  0.0 ] },
  "Israel":           { fx: null, fy: null, _anchor: [-0.25,  0.28] },
  "Saudi Arabia":     { fx: null, fy: null, _anchor: [ 0.0,   0.32] },
  "IRGC-Quds Force":  { fx: null, fy: null, _anchor: [ 0.42,  0.0 ] }
}

export async function initGraph(jsonPath) {
  const wrap = document.getElementById("graph-svg")
  if (!wrap) return

  let data
  try {
    const res = await fetch(jsonPath)
    data = await res.json()
  } catch (e) {
    console.error("graph.js: no se pudo cargar", jsonPath, e)
    return
  }

  injectGraphFilterCSS()

  const ro = new ResizeObserver(() => {
    ro.disconnect()
    renderGraph(data)
  })
  ro.observe(wrap)
}

// ── Inyectar CSS para los controles de filtro ─────────────────────────────
function injectGraphFilterCSS() {
  if (document.getElementById('graph-filter-css')) return
  const style = document.createElement('style')
  style.id = 'graph-filter-css'
  style.textContent = `
    /* Legend filter controls */
    #graph-filter-legend {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.07);
    }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: rgba(245,240,232,0.55);
      font-family: 'Source Serif 4', serif;
      font-weight: 300;
      cursor: pointer;
      padding: 5px 8px;
      border-radius: 3px;
      border: 1px solid transparent;
      transition: all 0.25s ease;
      user-select: none;
    }

    .filter-item:hover {
      background: rgba(255,255,255,0.04);
      color: rgba(245,240,232,0.85);
    }

    .filter-item.active {
      border-color: rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.05);
      color: rgba(245,240,232,0.9);
    }

    .filter-item.dimmed {
      opacity: 0.38;
    }

    .filter-swatch {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }

    .filter-toggle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid currentColor;
      margin-left: auto;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    }

    .filter-item.active .filter-toggle::after {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      display: block;
    }

    /* Filter mode indicator */
    #filter-mode-badge {
      margin-top: 10px;
      font-size: 10px;
      font-family: 'Source Serif 4', serif;
      font-style: italic;
      color: rgba(212,160,23,0.6);
      letter-spacing: 0.05em;
      min-height: 16px;
      transition: opacity 0.3s ease;
    }

    /* Reset button */
    #filter-reset {
      margin-top: 8px;
      padding: 5px 12px;
      background: transparent;
      border: 1px solid rgba(212,160,23,0.3);
      border-radius: 2px;
      color: rgba(212,160,23,0.6);
      font-family: 'Source Serif 4', serif;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s ease;
      display: none;
    }

    #filter-reset:hover {
      border-color: rgba(212,160,23,0.7);
      color: rgba(212,160,23,0.9);
      background: rgba(212,160,23,0.06);
    }

    #filter-reset.visible { display: block; }

    /* Edge transition */
    .links line {
      transition: stroke-opacity 0.35s ease, stroke-width 0.35s ease;
    }
  `
  document.head.appendChild(style)
}

function renderGraph(data) {
  const svgEl  = document.getElementById("graph-svg")
  const W      = svgEl.clientWidth  || svgEl.parentElement.clientWidth  || 700
  const H      = svgEl.clientHeight || svgEl.parentElement.clientHeight || 560
  const CX     = W / 2
  const CY     = H / 2

  const tooltip = document.getElementById("graph-tooltip")

  // ── Inyectar panel de filtros en la columna editorial ─────────────────
  buildFilterPanel()

  const svg = d3.select(svgEl)
    .attr("width", W)
    .attr("height", H)

  const defs = svg.append("defs")

  defs.append("radialGradient")
    .attr("id", "graph-bg-grad")
    .attr("cx", "50%").attr("cy", "50%").attr("r", "60%")
    .selectAll("stop").data([
      { offset: "0%",   color: "rgba(30,15,5,0.0)" },
      { offset: "100%", color: "rgba(10,5,2,0.35)" }
    ]).join("stop")
      .attr("offset", d => d.offset)
      .attr("stop-color", d => d.color)

  svg.append("rect")
    .attr("width", W).attr("height", H)
    .attr("fill", "url(#graph-bg-grad)")

  // Marcadores de flecha por color
  const arrowColors = [...new Set(Object.values(EDGE_COLOR))]
  arrowColors.forEach(color => {
    const safeid = color.replace("#", "arrow-")
    defs.append("marker")
      .attr("id", safeid)
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 5)
      .attr("markerHeight", 5)
      .attr("orient", "auto")
      .append("path")
        .attr("d", "M0,-4L8,0L0,4")
        .attr("fill", color)
        .attr("opacity", 0.8)
  })

  // Nodos con posiciones ancla
  const nodes = data.nodes.map(n => {
    const node = { ...n }
    if (FIXED[n.id]) {
      const [ax, ay] = FIXED[n.id]._anchor
      node.fx = CX + ax * W * 0.38
      node.fy = CY + ay * H * 0.55
    }
    return node
  })

  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]))
  const links = data.edges.map(e => ({
    ...e,
    source: nodeById[e.source],
    target: nodeById[e.target],
    category: getCategory(e.relation)
  })).filter(e => e.source && e.target)

  // ── Simulación ────────────────────────────────────────────────────────
  const simulation = d3.forceSimulation(nodes)
    .force("link",   d3.forceLink(links).id(d => d.id).distance(d => {
      const isMain = n => FIXED[n.id] !== undefined
      return isMain(d.source) && isMain(d.target) ? 160 : 90
    }).strength(0.5))
    .force("charge", d3.forceManyBody().strength(-280))
    .force("center", d3.forceCenter(CX, CY).strength(0.08))
    .force("x",      d3.forceX(CX).strength(0.03))
    .force("y",      d3.forceY(CY).strength(0.04))
    .force("collide",d3.forceCollide().radius(d => nodeRadius(d) + 12))
    .alphaDecay(0.025)

  // ── Grupo contenedor (zoom) ────────────────────────────────────────────
  const g = svg.append("g").attr("class", "graph-g")

  svg.call(
    d3.zoom()
      .scaleExtent([0.35, 2.8])
      .on("zoom", evt => g.attr("transform", evt.transform))
  )

  // ── Aristas ────────────────────────────────────────────────────────────
  const link = g.append("g").attr("class", "links")
    .selectAll("line")
    .data(links)
    .join("line")
      .attr("stroke", d => EDGE_COLOR[d.relation] || "#555")
      .attr("stroke-width", d => d.relation.includes("attack") || d.relation.includes("sanction") ? 2 : 1.2)
      .attr("stroke-opacity", 0.55)
      .attr("stroke-dasharray", d => edgeDash(d.relation) || null)
      .attr("marker-end", d => {
        const col = EDGE_COLOR[d.relation] || "#555"
        return `url(#${col.replace("#","arrow-")})`
      })
      .attr("data-category", d => d.category)

  // ── Nodos ────────────────────────────────────────────────────────────
  const node = g.append("g").attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .join("g")
      .attr("class", "node-g")
      .style("cursor", "pointer")
      .call(drag(simulation))

  // Glow filter
  const glow = defs.append("filter").attr("id", "glow")
  glow.append("feGaussianBlur").attr("stdDeviation","3").attr("result","blur")
  const feMerge = glow.append("feMerge")
  feMerge.append("feMergeNode").attr("in","blur")
  feMerge.append("feMergeNode").attr("in","SourceGraphic")

  node.append("circle")
    .attr("r", d => nodeRadius(d) + 5)
    .attr("fill", "none")
    .attr("stroke", d => NODE_COLOR[d.type] || "#555")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.2)

  node.append("circle")
    .attr("r", d => nodeRadius(d))
    .attr("fill", d => NODE_COLOR[d.type] || "#555")
    .attr("fill-opacity", 0.85)
    .attr("stroke", d => NODE_COLOR[d.type] || "#555")
    .attr("stroke-width", 1.5)
    .attr("filter", d => FIXED[d.id] ? "url(#glow)" : null)

  node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", d => nodeRadius(d) + 13)
    .attr("font-family", "'Source Serif 4', serif")
    .attr("font-size", d => FIXED[d.id] ? "11px" : "9px")
    .attr("font-weight", d => FIXED[d.id] ? "400" : "300")
    .attr("fill", d => FIXED[d.id] ? "#f5f0e8" : "rgba(245,240,232,0.6)")
    .attr("pointer-events", "none")
    .text(d => shortLabel(d.id))

  // ── Estado de filtros ──────────────────────────────────────────────────
  const activeFilters = new Set()  // vacío = todo visible

  // ── Interacción: hover / click ─────────────────────────────────────────
  let selected = null

  node.on("mouseenter", function(event, d) {
    if (selected) return
    highlight(d, 0.12)
    showTooltip(event, d)
  })
  .on("mousemove", function(event) {
    positionTooltip(event)
  })
  .on("mouseleave", function(event, d) {
    if (selected) return
    resetHighlight()
    hideTooltip()
  })
  .on("click", function(event, d) {
    event.stopPropagation()
    if (selected === d) {
      selected = null
      resetHighlight()
      hideTooltip()
    } else {
      selected = d
      highlight(d, 0.08)
      showTooltip(event, d)
    }
  })

  svg.on("click", () => {
    selected = null
    resetHighlight()
    hideTooltip()
  })

  // ── FILTRADO POR CATEGORÍA ─────────────────────────────────────────────
  function applyFilter() {
    const hasFilter = activeFilters.size > 0

    // Mostrar / ocultar reset
    const resetBtn = document.getElementById("filter-reset")
    if (resetBtn) resetBtn.classList.toggle("visible", hasFilter)

    // Badge de modo
    const badge = document.getElementById("filter-mode-badge")
    if (badge) {
      badge.textContent = hasFilter
        ? `Mostrando ${activeFilters.size} tipo${activeFilters.size > 1 ? 's' : ''} de relación`
        : ''
    }

    // Resetear highlight de nodo si había uno seleccionado
    selected = null
    hideTooltip()

    // Aplicar visibilidad a aristas
    link
      .attr("stroke-opacity", d => {
        if (!hasFilter) return 0.55
        return activeFilters.has(d.category) ? 0.85 : 0.04
      })
      .attr("stroke-width", d => {
        if (!hasFilter) return d.relation.includes("attack") ? 2 : 1.2
        if (!activeFilters.has(d.category)) return 0.5
        return d.relation.includes("attack") ? 2.5 : 1.5
      })

    // Calcular qué nodos tienen aristas visibles
    const visibleNodeIds = new Set()
    if (hasFilter) {
      links.forEach(l => {
        if (activeFilters.has(l.category)) {
          visibleNodeIds.add(l.source.id)
          visibleNodeIds.add(l.target.id)
        }
      })
    }

    // Dim nodos sin conexiones visibles
    node.select("circle:nth-child(2)")
      .attr("fill-opacity", d => {
        if (!hasFilter) return 0.85
        return visibleNodeIds.has(d.id) ? 0.90 : 0.15
      })
    node.select("circle:first-child")
      .attr("stroke-opacity", d => {
        if (!hasFilter) return 0.2
        return visibleNodeIds.has(d.id) ? 0.3 : 0.05
      })
    node.select("text")
      .attr("fill", d => {
        if (!hasFilter) return FIXED[d.id] ? "#f5f0e8" : "rgba(245,240,232,0.6)"
        if (visibleNodeIds.has(d.id)) return "#f5f0e8"
        return "rgba(245,240,232,0.15)"
      })
  }

  // ── Conectar botones de filtro ─────────────────────────────────────────
  document.querySelectorAll(".filter-item[data-cat]").forEach(el => {
    el.addEventListener("click", () => {
      const cat = el.dataset.cat
      if (activeFilters.has(cat)) {
        activeFilters.delete(cat)
        el.classList.remove("active")
      } else {
        activeFilters.add(cat)
        el.classList.add("active")
      }
      // Dimmed: ítems no activos cuando hay selección
      document.querySelectorAll(".filter-item[data-cat]").forEach(item => {
        item.classList.toggle("dimmed",
          activeFilters.size > 0 && !activeFilters.has(item.dataset.cat))
      })
      applyFilter()
    })
  })

  document.getElementById("filter-reset")?.addEventListener("click", () => {
    activeFilters.clear()
    document.querySelectorAll(".filter-item[data-cat]").forEach(el => {
      el.classList.remove("active", "dimmed")
    })
    applyFilter()
  })

  // ── Highlight por nodo ─────────────────────────────────────────────────
  function highlight(d, dimOpacity) {
    const connected = new Set()
    connected.add(d.id)
    links.forEach(l => {
      if (l.source.id === d.id) connected.add(l.target.id)
      if (l.target.id === d.id) connected.add(l.source.id)
    })

    const hasFilter = activeFilters.size > 0

    node.select("circle:nth-child(2)")
      .attr("fill-opacity", n => connected.has(n.id) ? 0.95 : dimOpacity)
      .attr("stroke-opacity", n => connected.has(n.id) ? 1 : dimOpacity)

    node.select("text")
      .attr("fill", n => connected.has(n.id)
        ? "#f5f0e8"
        : `rgba(245,240,232,${dimOpacity * 3})`)

    link
      .attr("stroke-opacity", l => {
        const catOk = !hasFilter || activeFilters.has(l.category)
        const connOk = l.source.id === d.id || l.target.id === d.id
        if (!catOk) return 0.04
        return connOk ? 0.95 : dimOpacity
      })
      .attr("stroke-width", l => {
        const connOk = l.source.id === d.id || l.target.id === d.id
        return connOk ? 2.5 : 0.8
      })
  }

  function resetHighlight() {
    applyFilter()
  }

  // ── Tooltip ────────────────────────────────────────────────────────────
  function showTooltip(event, d) {
    const hasFilter = activeFilters.size > 0
    const outgoing = links.filter(l => l.source.id === d.id && (!hasFilter || activeFilters.has(l.category)))
    const incoming = links.filter(l => l.target.id === d.id && (!hasFilter || activeFilters.has(l.category)))

    const rows = [
      ...outgoing.map(l => `<div class="tt-row tt-out">→ <em>${l.target.id}</em> <span>${relLabel(l.relation)}</span></div>`),
      ...incoming.map(l => `<div class="tt-row tt-in">← <em>${l.source.id}</em> <span>${relLabel(l.relation)}</span></div>`)
    ].join("")

    tooltip.innerHTML = `
      <div class="tt-name">${d.id}</div>
      <div class="tt-type">${typeLabel(d.type)}</div>
      <div class="tt-rels">${rows || '<span style="opacity:0.5">Sin relaciones visibles</span>'}</div>
    `
    tooltip.classList.add("visible")
    positionTooltip(event)
  }

  function positionTooltip(event) {
    const wrap  = document.querySelector(".graph-canvas-wrap")
    const rect  = wrap.getBoundingClientRect()
    const tx    = event.clientX - rect.left + 16
    const ty    = event.clientY - rect.top  - 10
    tooltip.style.left = Math.min(tx, rect.width - 260) + "px"
    tooltip.style.top  = Math.max(ty, 8) + "px"
  }

  function hideTooltip() {
    tooltip.classList.remove("visible")
  }

  // ── Tick ────────────────────────────────────────────────────────────────
  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)

    node.attr("transform", d => `translate(${d.x},${d.y})`)
  })
}

// ── Construir panel de filtros en el HTML editorial ───────────────────────
function buildFilterPanel() {
       const editorial = document.querySelector(".graph-editorial")
       const canvasWrap = document.querySelector(".graph-canvas-wrap")
       if (!editorial || !canvasWrap) return
 
       const existingLegends = editorial.querySelectorAll(".graph-legend")
       existingLegends.forEach(l => l.remove())
       const existingHint = editorial.querySelector(".graph-hint")
 
       // Leyenda de nodos — ENCIMA del grafo (horizontal)
       const nodeLegend = document.createElement("div")
       nodeLegend.className = "graph-legend graph-legend--top"
       nodeLegend.innerHTML = `
         <div class="graph-legend-item">
           <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#c0392b" opacity="0.9"/></svg>
           Estado
         </div>
         <div class="graph-legend-item">
           <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#d4a017" opacity="0.9"/></svg>
           Organización
         </div>
         <div class="graph-legend-item">
           <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#7f8c8d" opacity="0.9"/></svg>
           Milicia
         </div>
         <div class="graph-legend-item">
           <svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="#2980b9" opacity="0.7"/></svg>
           Objetivo
         </div>
       `
       // Insertar encima del canvas
       canvasWrap.insertBefore(nodeLegend, canvasWrap.firstChild)
 
       // Panel de filtros — mantener en editorial
       const filterPanel = document.createElement("div")
       filterPanel.id = "graph-filter-legend"
       filterPanel.innerHTML = `
         <div style="font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(212,160,23,0.7);margin-bottom:4px;font-family:'Source Serif 4',serif;">
           Filtrar conexiones
         </div>
         ${RELATION_CATEGORIES.map(cat => `
           <div class="filter-item" data-cat="${cat.id}" title="Clic para activar/desactivar">
             <div class="filter-swatch">
               <svg width="30" height="8">
                 <line x1="0" y1="4" x2="30" y2="4"
                   stroke="${cat.color}"
                   stroke-width="2.5"
                   ${cat.dashed ? 'stroke-dasharray="5,3"' : ''}/>
               </svg>
             </div>
             <span style="flex:1">${cat.label}</span>
             <div class="filter-toggle" style="color:${cat.color};border-color:${cat.color};"></div>
           </div>
         `).join("")}
         <div id="filter-mode-badge"></div>
         <button id="filter-reset">✕ Mostrar todo</button>
       `
 
       if (existingHint) {
         editorial.insertBefore(filterPanel, existingHint)
       } else {
         editorial.appendChild(filterPanel)
       }
     }

// ── Helpers ────────────────────────────────────────────────────────────────
function nodeRadius(d) {
  if (d.id === "Iran" || d.id === "United States") return 18
  if (d.id === "IRGC-Quds Force" || d.id === "Israel" || d.id === "Saudi Arabia") return 13
  return 7
}

function shortLabel(id) {
  const MAP = {
    "United States":               "EE.UU.",
    "Iran":                        "Irán",
    "Israel":                      "Israel",
    "Saudi Arabia":                "Arabia Saudí",
    "IRGC-Quds Force":             "Quds Force",
    "Hezbollah":                   "Hezbollah",
    "Houthis":                     "Houthis",
    "Hamas":                       "Hamas",
    "Russia":                      "Rusia",
    "Syria":                       "Siria",
    "Iraq":                        "Irak",
    "United Arab Emirates":        "EAU",
    "Bahrain":                     "Bahrein",
    "Morocco":                     "Marruecos",
    "Red Sea Shipping":            "Rutas Mar Rojo",
    "Islamic Resistance in Iraq":  "Res. Islámica Iraq",
    "Kataib Hezbollah":            "Kataib Hezb.",
    "Asaib Ahl al-Haq":            "Asaib AH",
    "Fatemiyoun":                  "Fatemiyoun",
    "Palestinian Islamic Jihad":   "PIJ",
    "Harakat Hezbollah al Nujaba": "HH Nujaba",
    "Badr Organization":           "Org. Badr",
    "Kataib Sayyid al Shuhada":    "K. Sayyid",
    "Zaynabiyoun Brigade":         "Zaynabiyoun",
    "Saraya al-Mukhtar":           "S. Mukhtar",
    "Promised Day Brigade":        "P. Day Brigade"
  }
  return MAP[id] || id
}

function typeLabel(t) {
  return { state:"Estado", organization:"Organización", militia:"Milicia / Proxy", target:"Objetivo" }[t] || t
}

function relLabel(r) {
  const M = {
    sanctions_attacks:"Sanciones / Ataques", military_attacks:"Ataques militares",
    airstrikes:"Ataques aéreos", attacks:"Ataques", terrorist_designation:"Designación terrorista",
    funds_trains:"Financia y entrena", funds_supplies:"Financia y abastece",
    funds:"Financia", recruits_trains:"Recluta y entrena",
    controls:"Controla", ally:"Aliado", military_ally:"Aliado militar",
    regional_alliance:"Alianza regional", abraham_accords:"Acuerdos Abraham",
    strategic_cooperation:"Cooperación estratégica", rival:"Rival",
    military_support:"Apoyo militar", operates_within:"Opera en"
  }
  return M[r] || r
}

function drag(simulation) {
  return d3.drag()
    .on("start", (event, d) => {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x; d.fy = d.y
    })
    .on("drag", (event, d) => {
      d.fx = event.x; d.fy = event.y
    })
    .on("end", (event, d) => {
      if (!event.active) simulation.alphaTarget(0)
      if (!FIXED[d.id]) { d.fx = null; d.fy = null }
    })
}