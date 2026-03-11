/**
 * graph.js — Capítulo V
 * Visualización de red de influencia iraní con D3 v7
 * Usa force-directed layout con colores y estilos del sistema de diseño
 */

// ── Paleta coherente con el sistema de diseño ──────────────────────────────
const NODE_COLOR = {
  state:        "#c0392b",   // rojo
  organization: "#d4a017",   // dorado
  militia:      "#7f8c8d",   // gris muted
  target:       "#2980b9"    // azul
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

function edgeDash(relation) {
  if (relation.includes("funds") || relation.includes("trains") ||
      relation.includes("recruits") || relation.includes("controls")) {
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

  // Esperar a que el elemento tenga dimensiones reales
  const ro = new ResizeObserver(() => {
    ro.disconnect()
    renderGraph(data)
  })
  ro.observe(wrap)
}

function renderGraph(data) {
  const svgEl  = document.getElementById("graph-svg")
  const W      = svgEl.clientWidth  || svgEl.parentElement.clientWidth  || 700
  const H      = svgEl.clientHeight || svgEl.parentElement.clientHeight || 560
  const CX     = W / 2
  const CY     = H / 2

  const tooltip = document.getElementById("graph-tooltip")

  const svg = d3.select(svgEl)
    .attr("width", W)
    .attr("height", H)

  // Fondo sutil con gradiente radial
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

  // Marcador de flecha por color de relación
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

  // Construir nodes con posiciones ancla para los principales
  const nodes = data.nodes.map(n => {
    const node = { ...n }
    if (FIXED[n.id]) {
      const [ax, ay] = FIXED[n.id]._anchor
      node.fx = CX + ax * W * 0.38
      node.fy = CY + ay * H * 0.55
    }
    return node
  })

  // Construir links con referencias a objetos
  const nodeById = Object.fromEntries(nodes.map(n => [n.id, n]))
  const links = data.edges.map(e => ({
    ...e,
    source: nodeById[e.source],
    target: nodeById[e.target]
  })).filter(e => e.source && e.target)

  // ── Simulación ────────────────────────────────────────────────────────
  const simulation = d3.forceSimulation(nodes)
    .force("link",   d3.forceLink(links).id(d => d.id).distance(d => {
      // Mayor distancia para nodos principales
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

  // Círculo exterior (aura)
  node.append("circle")
    .attr("r", d => nodeRadius(d) + 5)
    .attr("fill", "none")
    .attr("stroke", d => NODE_COLOR[d.type] || "#555")
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.2)

  // Círculo principal
  node.append("circle")
    .attr("r", d => nodeRadius(d))
    .attr("fill", d => NODE_COLOR[d.type] || "#555")
    .attr("fill-opacity", 0.85)
    .attr("stroke", d => NODE_COLOR[d.type] || "#555")
    .attr("stroke-width", 1.5)
    .attr("filter", d => FIXED[d.id] ? "url(#glow)" : null)

  // Etiqueta de texto
  node.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", d => nodeRadius(d) + 13)
    .attr("font-family", "'Source Serif 4', serif")
    .attr("font-size", d => FIXED[d.id] ? "11px" : "9px")
    .attr("font-weight", d => FIXED[d.id] ? "400" : "300")
    .attr("fill", d => FIXED[d.id] ? "#f5f0e8" : "rgba(245,240,232,0.6)")
    .attr("pointer-events", "none")
    .text(d => shortLabel(d.id))

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

  // Funciones de highlight
  function highlight(d, dimOpacity) {
    const connected = new Set()
    connected.add(d.id)
    links.forEach(l => {
      if (l.source.id === d.id) connected.add(l.target.id)
      if (l.target.id === d.id) connected.add(l.source.id)
    })

    node.select("circle:last-of-type")
      .attr("fill-opacity", n => connected.has(n.id) ? 0.95 : dimOpacity)
      .attr("stroke-opacity", n => connected.has(n.id) ? 1 : dimOpacity)

    node.select("text")
      .attr("fill", n => connected.has(n.id)
        ? "#f5f0e8"
        : `rgba(245,240,232,${dimOpacity * 3})`)

    link
      .attr("stroke-opacity", l =>
        l.source.id === d.id || l.target.id === d.id ? 0.9 : dimOpacity)
      .attr("stroke-width", l =>
        l.source.id === d.id || l.target.id === d.id ? 2.5 : 0.8)
  }

  function resetHighlight() {
    node.select("circle:last-of-type")
      .attr("fill-opacity", 0.85)
      .attr("stroke-opacity", 1)
    node.select("text")
      .attr("fill", d => FIXED[d.id] ? "#f5f0e8" : "rgba(245,240,232,0.6)")
    link
      .attr("stroke-opacity", 0.55)
      .attr("stroke-width", d => d.relation.includes("attack") ? 2 : 1.2)
  }

  // Tooltip
  function showTooltip(event, d) {
    const outgoing = links.filter(l => l.source.id === d.id)
    const incoming = links.filter(l => l.target.id === d.id)

    const rows = [
      ...outgoing.map(l => `<div class="tt-row tt-out">→ <em>${l.target.id}</em> <span>${relLabel(l.relation)}</span></div>`),
      ...incoming.map(l => `<div class="tt-row tt-in">← <em>${l.source.id}</em> <span>${relLabel(l.relation)}</span></div>`)
    ].join("")

    tooltip.innerHTML = `
      <div class="tt-name">${d.id}</div>
      <div class="tt-type">${typeLabel(d.type)}</div>
      <div class="tt-rels">${rows || '<span style="opacity:0.5">Sin relaciones registradas</span>'}</div>
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
      // Liberar si no es nodo principal fijo
      if (!FIXED[d.id]) { d.fx = null; d.fy = null }
    })
}