// Experiment 02 — Scale at a Glance (annotated dot plot, zoomable)
(function () {
  const data = [
    { activity: "Visa transaction",  min: 0.00045, max: 0.00045, co2: "0.00045 g",   anchor: "invisible to senses",   emoji: "🫥", labelH: 150, anchorH: 50 },
    { activity: "Gemini query",      min: 0.03,    max: 0.03,    co2: "0.03 g",      anchor: "< a Google search",     emoji: "🔍", labelH: 95,  anchorH: 35 },
    { activity: "Google search",     min: 0.2,     max: 0.2,     co2: "0.2 g",       anchor: "≈ 1 sec, LED bulb",     emoji: "💡", labelH: 155, anchorH: 55 },
    { activity: "Plain email",       min: 0.3,     max: 0.3,     co2: "0.3 g",       anchor: "same as Google search", emoji: "💡", labelH: 80,  anchorH: 35 },
    { activity: "ChatGPT (low)",     min: 0.4,     max: 0.4,     co2: "~0.4 g",      anchor: "2× Google search",      emoji: "🔍🔍", labelH: 130, anchorH: 60 },
    { activity: "AI image gen.",     min: 0.5,     max: 2.0,     co2: "0.5–2 g",     anchor: "1–10 Google searches",  emoji: "🖼️",  labelH: 65,  anchorH: 40 },
    { activity: "ChatGPT (high)",    min: 2.0,     max: 4.0,     co2: "2–4 g",       anchor: "boils 5 ml water",      emoji: "♨️",  labelH: 115, anchorH: 35 },
    { activity: "Netflix 30 min",    min: 18,      max: 18,      co2: "~18 g",       anchor: "drives 100 m by car",   emoji: "🚗", labelH: 155, anchorH: 55 },
    { activity: "Zoom 1 hr HD",      min: 150,     max: 1000,    co2: "150–1k g",    anchor: "drives 1–7 km by car",  emoji: "🛣️",  labelH: 90,  anchorH: 40 },
    { activity: "Bitcoin tx",        min: 400000,  max: 750000,  co2: "400k–750k g", anchor: "drives 2k–4k km",       emoji: "🌍", labelH: 150, anchorH: 50 },
  ];

  data.forEach(d => {
    d.dotVal = d.min === d.max
      ? d.min
      : Math.exp((Math.log(d.min) + Math.log(d.max)) / 2);
  });

  const containerEl = document.getElementById("chart-02");
  const cW  = containerEl.clientWidth || 860;
  const mL  = 50, mR = 50;
  const W   = cW - mL - mR;
  const axisY = 180;
  const totalH = axisY + 115;

  const svg = d3.select("#chart-02").append("svg")
    .attr("viewBox", `0 0 ${cW} ${totalH}`)
    .attr("height", totalH);

  // ── Defs ────────────────────────────────────────────────────────────────────
  const defs = svg.append("defs");

  defs.append("clipPath").attr("id", "clip02")
    .append("rect")
      .attr("x", 0).attr("y", -(axisY + 20))
      .attr("width", W).attr("height", totalH + axisY + 40);

  const filt = defs.append("filter").attr("id", "glow02")
    .attr("x", "-60%").attr("y", "-60%").attr("width", "220%").attr("height", "220%");
  filt.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
  const fm = filt.append("feMerge");
  fm.append("feMergeNode").attr("in", "blur");
  fm.append("feMergeNode").attr("in", "SourceGraphic");

  // ── Scales ───────────────────────────────────────────────────────────────────
  const xBase = d3.scaleLog().domain([0.00005, 2_500_000]).range([0, W]);
  const colorScale = d3.scaleLog().domain([0.00005, 2_500_000]).range(["#a8edea", "#ff6b8a"]);
  const rScale = d3.scaleLog().domain([0.0001, 1_000_000]).range([4, 11]).clamp(true);

  const g = svg.append("g").attr("transform", `translate(${mL},0)`);

  // ── Axis ─────────────────────────────────────────────────────────────────────
  g.append("line")
    .attr("x1", 0).attr("x2", W)
    .attr("y1", axisY).attr("y2", axisY)
    .attr("stroke", "#2a2f42").attr("stroke-width", 1.5);

  const tickVals = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000];
  const tickG = g.append("g");

  function renderAxis(x) {
    tickG.selectAll("*").remove();
    tickVals.forEach(v => {
      const px = x(v);
      if (px < -10 || px > W + 10) return;
      tickG.append("line")
        .attr("x1", px).attr("x2", px)
        .attr("y1", axisY - 4).attr("y2", axisY + 4)
        .attr("stroke", "#2a2f42");
      tickG.append("text")
        .attr("x", px).attr("y", axisY + 95)
        .attr("text-anchor", "middle").attr("fill", "#3a4050").attr("font-size", "10px")
        .text(v >= 1000 ? d3.format(".0s")(v) : d3.format("~g")(v));
    });
    tickG.append("text")
      .attr("x", W / 2).attr("y", axisY + 108)
      .attr("text-anchor", "middle").attr("fill", "#2a2f42").attr("font-size", "10px")
      .text("CO₂e (grams, log scale)");
  }

  // ── Clipped content group ─────────────────────────────────────────────────
  const cg = g.append("g").attr("clip-path", "url(#clip02)");

  // Range bars
  const rangeSel = cg.selectAll(".rng").data(data.filter(d => d.min !== d.max)).join("line")
    .attr("class", "rng")
    .attr("y1", axisY).attr("y2", axisY)
    .attr("stroke-width", 2.5).attr("stroke-linecap", "round").attr("opacity", 0.4)
    .attr("stroke", d => colorScale(d.dotVal));

  const capsData = data.filter(d => d.min !== d.max)
    .flatMap(d => [{ val: d.min, c: colorScale(d.dotVal) }, { val: d.max, c: colorScale(d.dotVal) }]);
  const capsSel = cg.selectAll(".cap").data(capsData).join("line")
    .attr("class", "cap")
    .attr("y1", axisY - 5).attr("y2", axisY + 5)
    .attr("stroke-width", 2).attr("opacity", 0.5)
    .attr("stroke", d => d.c);

  // Leader lines (up / down)
  const lUpSel = cg.selectAll(".lup").data(data).join("line")
    .attr("class", "lup")
    .attr("stroke-width", 1).attr("stroke-dasharray", "3 3").attr("opacity", 0.3)
    .attr("stroke", d => colorScale(d.dotVal));

  const lDownSel = cg.selectAll(".ldown").data(data).join("line")
    .attr("class", "ldown")
    .attr("stroke", "#ffb8c6").attr("stroke-width", 1)
    .attr("stroke-dasharray", "3 3").attr("opacity", 0.25);

  // Dots
  const dotSel = cg.selectAll(".dot").data(data).join("circle")
    .attr("class", "dot").attr("cy", axisY)
    .attr("fill", d => colorScale(d.dotVal))
    .attr("r", d => rScale(d.dotVal))
    .attr("filter", "url(#glow02)").attr("opacity", 0.9);

  // Activity labels (above)
  const labGSel = cg.selectAll(".labg").data(data).join("g").attr("class", "labg");
  labGSel.append("text").attr("class", "act-name")
    .attr("text-anchor", "middle").attr("fill", "#c8cfd9")
    .attr("font-size", "11px").attr("font-weight", "600")
    .text(d => d.activity);
  labGSel.append("text").attr("class", "co2-val")
    .attr("text-anchor", "middle").attr("y", 14)
    .attr("fill", d => colorScale(d.dotVal)).attr("font-size", "10px")
    .text(d => d.co2);

  // Emojis (below axis) — no text
  const emojiSel = cg.selectAll(".emoj").data(data).join("text")
    .attr("class", "emoj")
    .attr("text-anchor", "middle").attr("dominant-baseline", "hanging")
    .attr("font-size", "17px").style("cursor", "default")
    .text(d => d.emoji);

  // ── Tooltip on emoji hover ────────────────────────────────────────────────
  const tooltip = d3.select("#tooltip");

  // Hit circles sit on top of zoom rect → rendered after it (see end of file)
  const hitG = svg.append("g").attr("transform", `translate(${mL},0)`);
  const hitSel = hitG.selectAll(".hit").data(data).join("circle")
    .attr("class", "hit")
    .attr("r", 14).attr("fill", "transparent").style("cursor", "help")
    .on("mousemove", function (event, d) {
      const [mx, my] = d3.pointer(event, document.body);
      tooltip.style("opacity", 1)
        .style("left", (mx + 14) + "px").style("top", (my - 12) + "px")
        .html(`<span style="font-size:18px;vertical-align:middle">${d.emoji}</span>
               <span style="margin-left:8px;color:#ffb8c6;font-style:italic">${d.anchor}</span>`);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));

  // ── Position update ───────────────────────────────────────────────────────
  function positionAll(x) {
    rangeSel.attr("x1", d => x(d.min)).attr("x2", d => x(d.max));
    capsSel.attr("x1", d => x(d.val)).attr("x2", d => x(d.val));

    lUpSel
      .attr("x1", d => x(d.dotVal)).attr("x2", d => x(d.dotVal))
      .attr("y1", d => axisY - rScale(d.dotVal) - 2)
      .attr("y2", d => axisY - d.labelH + 22);
    lDownSel
      .attr("x1", d => x(d.dotVal)).attr("x2", d => x(d.dotVal))
      .attr("y1", d => axisY + rScale(d.dotVal) + 2)
      .attr("y2", d => axisY + d.anchorH - 3);

    dotSel.attr("cx", d => x(d.dotVal));
    labGSel.attr("transform", d => `translate(${x(d.dotVal)},${axisY - d.labelH})`);
    emojiSel.attr("x", d => x(d.dotVal)).attr("y", d => axisY + d.anchorH);
    hitSel.attr("cx", d => x(d.dotVal)).attr("cy", d => axisY + d.anchorH + 10);
  }

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const zoom = d3.zoom()
    .scaleExtent([1, 40])
    .on("zoom", function (event) {
      const newX = event.transform.rescaleX(xBase);
      renderAxis(newX);
      positionAll(newX);
    });

  // Zoom hint
  g.append("text")
    .attr("x", W).attr("y", -10)
    .attr("text-anchor", "end").attr("fill", "#3a4050").attr("font-size", "10px")
    .text("scroll to zoom · drag to pan");

  // Zoom capture rect (below hit areas in DOM → hit areas capture events first)
  svg.insert("rect", ".hit")
    .attr("x", mL).attr("y", 0)
    .attr("width", W).attr("height", totalH)
    .attr("fill", "none").attr("pointer-events", "all")
    .style("cursor", "ew-resize")
    .call(zoom);

  // Initial render
  renderAxis(xBase);
  positionAll(xBase);
})();
