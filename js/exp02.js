// Experiment 02 — Scale at a Glance (annotated dot plot)
(function () {
  const data = [
    { activity: "Visa transaction",  min: 0.00045, max: 0.00045, co2: "0.00045 g",   anchor: "invisible to senses",   emoji: "🫥", labelH: 150, anchorH: 80  },
    { activity: "Gemini query",      min: 0.03,    max: 0.03,    co2: "0.03 g",      anchor: "< a Google search",     emoji: "🔍", labelH: 95,  anchorH: 55  },
    { activity: "Google search",     min: 0.2,     max: 0.2,     co2: "0.2 g",       anchor: "≈ 1 sec, LED bulb",     emoji: "💡", labelH: 160, anchorH: 100 },
    { activity: "Plain email",       min: 0.3,     max: 0.3,     co2: "0.3 g",       anchor: "same as Google search", emoji: "💡", labelH: 75,  anchorH: 65  },
    { activity: "ChatGPT (low)",     min: 0.4,     max: 0.4,     co2: "~0.4 g",      anchor: "2× Google search",      emoji: "🔍🔍", labelH: 130, anchorH: 115 },
    { activity: "AI image gen.",     min: 0.5,     max: 2.0,     co2: "0.5–2 g",     anchor: "1–10 Google searches",  emoji: "🖼️",  labelH: 65,  anchorH: 75  },
    { activity: "ChatGPT (high)",    min: 2.0,     max: 4.0,     co2: "2–4 g",       anchor: "boils 5 ml water",      emoji: "♨️",  labelH: 115, anchorH: 55  },
    { activity: "Netflix 30 min",    min: 18,      max: 18,      co2: "~18 g",       anchor: "drives 100 m by car",   emoji: "🚗", labelH: 155, anchorH: 95  },
    { activity: "Zoom 1 hr HD",      min: 150,     max: 1000,    co2: "150–1k g",    anchor: "drives 1–7 km by car",  emoji: "🛣️",  labelH: 90,  anchorH: 60  },
    { activity: "Bitcoin tx",        min: 400000,  max: 750000,  co2: "400k–750k g", anchor: "drives 2k–4k km",       emoji: "🌍", labelH: 150, anchorH: 85  },
  ];

  data.forEach(d => {
    d.dotVal = d.min === d.max ? d.min : Math.exp((Math.log(d.min) + Math.log(d.max)) / 2);
  });

  const containerEl = document.getElementById("chart-02");
  const containerWidth = containerEl.clientWidth || 860;
  const mL = 50, mR = 50;
  const width = containerWidth - mL - mR;
  const axisY = 185;
  const totalH = axisY + 200;

  const svg = d3.select("#chart-02").append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${totalH}`)
    .attr("height", totalH);

  const defs = svg.append("defs");
  const f = defs.append("filter").attr("id", "glow02")
    .attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
  f.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
  const fm = f.append("feMerge");
  fm.append("feMergeNode").attr("in", "blur");
  fm.append("feMergeNode").attr("in", "SourceGraphic");

  const g = svg.append("g").attr("transform", `translate(${mL},0)`);

  const xScale = d3.scaleLog().domain([0.00005, 2_500_000]).range([0, width]);
  const colorScale = d3.scaleLog().domain([0.00005, 2_500_000]).range(["#a8edea", "#ff6b8a"]);
  const rScale = d3.scaleLog().domain([0.0001, 1_000_000]).range([4, 11]).clamp(true);

  // Axis line
  g.append("line")
    .attr("x1", 0).attr("x2", width)
    .attr("y1", axisY).attr("y2", axisY)
    .attr("stroke", "#2a2f42").attr("stroke-width", 1.5);

  // Tick marks + scale labels
  const tickVals = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000];
  tickVals.forEach(v => {
    const x = xScale(v);
    g.append("line")
      .attr("x1", x).attr("x2", x)
      .attr("y1", axisY - 5).attr("y2", axisY + 5)
      .attr("stroke", "#2a2f42");
    g.append("text")
      .attr("x", x).attr("y", axisY + 155)
      .attr("text-anchor", "middle").attr("fill", "#3a4050").attr("font-size", "10px")
      .text(v >= 1000 ? d3.format(".0s")(v) : d3.format("~g")(v));
  });

  g.append("text")
    .attr("x", width / 2).attr("y", axisY + 170)
    .attr("text-anchor", "middle").attr("fill", "#2a2f42").attr("font-size", "10px")
    .text("CO₂e (grams, log scale)");

  // Per-item rendering
  data.forEach(d => {
    const cx    = xScale(d.dotVal);
    const color = colorScale(d.dotVal);
    const r     = rScale(d.dotVal);
    const isRange = d.min !== d.max;

    if (isRange) {
      g.append("line")
        .attr("x1", xScale(d.min)).attr("x2", xScale(d.max))
        .attr("y1", axisY).attr("y2", axisY)
        .attr("stroke", color).attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round").attr("opacity", 0.45);
      [d.min, d.max].forEach(v =>
        g.append("line")
          .attr("x1", xScale(v)).attr("x2", xScale(v))
          .attr("y1", axisY - 5).attr("y2", axisY + 5)
          .attr("stroke", color).attr("stroke-width", 2).attr("opacity", 0.55)
      );
    }

    // Leader: dot → activity label (above)
    g.append("line")
      .attr("x1", cx).attr("x2", cx)
      .attr("y1", axisY - r - 2).attr("y2", axisY - d.labelH + 24)
      .attr("stroke", color).attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3").attr("opacity", 0.35);

    // Leader: dot → anchor (below)
    g.append("line")
      .attr("x1", cx).attr("x2", cx)
      .attr("y1", axisY + r + 2).attr("y2", axisY + d.anchorH - 14)
      .attr("stroke", "#ffb8c6").attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3").attr("opacity", 0.3);

    // Dot
    g.append("circle")
      .attr("cx", cx).attr("cy", axisY).attr("r", r)
      .attr("fill", color).attr("filter", "url(#glow02)").attr("opacity", 0.9);

    // Activity label + CO₂e (above)
    const lg = g.append("g").attr("transform", `translate(${cx},${axisY - d.labelH})`);
    lg.append("text")
      .attr("text-anchor", "middle").attr("fill", "#c8cfd9")
      .attr("font-size", "11px").attr("font-weight", "600")
      .text(d.activity);
    lg.append("text")
      .attr("text-anchor", "middle").attr("y", 14)
      .attr("fill", color).attr("font-size", "10px")
      .text(d.co2);

    // Emoji + anchor text (below) — always visible
    g.append("text")
      .attr("x", cx).attr("y", axisY + d.anchorH)
      .attr("text-anchor", "middle").attr("dominant-baseline", "hanging")
      .attr("font-size", "18px")
      .text(d.emoji);
    g.append("text")
      .attr("x", cx).attr("y", axisY + d.anchorH + 24)
      .attr("text-anchor", "middle").attr("dominant-baseline", "hanging")
      .attr("fill", "#ffb8c6").attr("font-size", "10px").attr("font-style", "italic")
      .text(d.anchor);
  });
})();
