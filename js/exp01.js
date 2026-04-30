// Experiment 01 — Carbon Cost of Digital Activities
(function () {
  const rawData = [
    { activity: "Visa transaction",          min: 0.00045, max: 0.00045, anchor: "invisible to human senses",      display: "0.00045 g" },
    { activity: "Gemini query",              min: 0.03,    max: 0.03,    anchor: "less than a Google search",      display: "0.03 g" },
    { activity: "Google search",             min: 0.2,     max: 0.2,     anchor: "1 sec of LED bulb",              display: "0.2 g" },
    { activity: "Plain email",               min: 0.3,     max: 0.3,     anchor: "1 sec of LED bulb",              display: "0.3 g" },
    { activity: "ChatGPT query (low est.)",  min: 0.4,     max: 0.4,     anchor: "~2× a Google search",           display: "~0.4 g" },
    { activity: "AI image generation",       min: 0.5,     max: 2.0,     anchor: "1–10 Google searches",          display: "0.5–2 g" },
    { activity: "ChatGPT query (high est.)", min: 2.0,     max: 4.0,     anchor: "boiling 5 ml of water",         display: "2–4 g" },
    { activity: "Netflix, 30 min",           min: 18,      max: 18,      anchor: "driving 100 m by car",          display: "~18 g" },
    { activity: "Zoom, 1 hr HD",             min: 150,     max: 1000,    anchor: "driving 1–7 km by car",         display: "150–1,000 g" },
    { activity: "Bitcoin transaction",       min: 400000,  max: 750000,  anchor: "driving 2,000–4,000 km by car", display: "400,000–750,000 g" },
  ];

  const margin = { top: 20, right: 130, bottom: 50, left: 210 };
  const barHeight = 28, barPad = 18;
  const containerEl = document.getElementById("chart-01");
  const containerWidth = containerEl.clientWidth || 860;
  const width  = containerWidth - margin.left - margin.right;
  const innerH = rawData.length * (barHeight + barPad);
  const totalH = innerH + margin.top + margin.bottom;

  const svg = d3.select("#chart-01").append("svg")
    .attr("viewBox", `0 0 ${containerWidth} ${totalH}`)
    .attr("height", totalH);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLog().domain([0.0001, 1_200_000]).range([0, width]).nice();
  const yScale = d3.scaleBand()
    .domain(rawData.map(d => d.activity))
    .range([0, innerH])
    .paddingInner(0.45).paddingOuter(0.2);

  const colorScale = d3.scaleLog()
    .domain([0.0001, 1_200_000])
    .range(["#a8edea", "#ff6b8a"]);

  const tickVals = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000];

  g.append("g").attr("class", "grid").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).tickValues(tickVals).tickSize(-innerH).tickFormat(""))
    .selectAll(".tick line").attr("stroke", "#1e2130").attr("stroke-dasharray", "3 4");

  g.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(xScale).tickValues(tickVals).tickFormat(d =>
      d >= 1000 ? d3.format(".2s")(d) + " g" : d3.format("~g")(d) + " g"
    ))
    .selectAll("text").attr("dy", "1.2em");

  g.append("text")
    .attr("x", width / 2).attr("y", innerH + 44)
    .attr("text-anchor", "middle").attr("fill", "#3a4050").attr("font-size", "11px")
    .text("CO₂e per activity (log scale)");

  const rowG = g.selectAll(".row").data(rawData).join("g")
    .attr("class", "row")
    .attr("transform", d => `translate(0, ${yScale(d.activity)})`);

  rowG.append("rect").attr("class", "bar-bg")
    .attr("width", width).attr("height", yScale.bandwidth()).attr("rx", 4);

  rowG.append("rect").attr("class", "bar-fill")
    .attr("width", d => xScale(d.min) - xScale(0.0001))
    .attr("height", yScale.bandwidth()).attr("rx", 4)
    .attr("fill", d => colorScale(d.min)).attr("opacity", 0.85);

  rowG.filter(d => d.min !== d.max).append("line")
    .attr("x1", d => xScale(d.min)).attr("x2", d => xScale(d.max))
    .attr("y1", yScale.bandwidth() / 2).attr("y2", yScale.bandwidth() / 2)
    .attr("stroke", d => colorScale(d.max)).attr("stroke-width", 3).attr("stroke-linecap", "round");

  rowG.filter(d => d.min !== d.max).append("line")
    .attr("x1", d => xScale(d.max)).attr("x2", d => xScale(d.max))
    .attr("y1", yScale.bandwidth() * 0.2).attr("y2", yScale.bandwidth() * 0.8)
    .attr("stroke", d => colorScale(d.max)).attr("stroke-width", 2.5).attr("stroke-linecap", "round");

  rowG.append("text").attr("class", "value-label")
    .attr("x", d => xScale(d.max) + 8).attr("y", yScale.bandwidth() / 2)
    .text(d => d.display);

  g.selectAll(".activity-label").data(rawData).join("text")
    .attr("class", "activity-label")
    .attr("x", -12).attr("y", d => yScale(d.activity) + yScale.bandwidth() / 2)
    .text(d => d.activity);

  const tooltip = d3.select("#tooltip");

  rowG.append("rect")
    .attr("width", width).attr("height", yScale.bandwidth()).attr("fill", "transparent")
    .on("mousemove", function (event, d) {
      const [mx, my] = d3.pointer(event, document.body);
      tooltip.style("opacity", 1)
        .style("left", (mx + 18) + "px").style("top", (my - 10) + "px")
        .html(`
          <div class="font-semibold text-sm text-body mb-2">${d.activity}</div>
          <div class="flex justify-between gap-4 mt-1">
            <span class="text-muted">CO₂e</span>
            <span class="text-[#a8edea] font-medium">${d.display}</span>
          </div>
          ${d.min !== d.max ? `
          <div class="flex justify-between gap-4 mt-1">
            <span class="text-muted">Low</span>
            <span class="text-[#a8edea] font-medium">${d3.format(",.4~g")(d.min)} g</span>
          </div>
          <div class="flex justify-between gap-4 mt-1">
            <span class="text-muted">High</span>
            <span class="text-[#a8edea] font-medium">${d3.format(",.4~g")(d.max)} g</span>
          </div>` : ""}
          <div class="mt-2.5 pt-2.5 border-t border-rim text-muted text-xs leading-relaxed">
            Real-world scale: <span class="text-[#fed6e3] font-medium">${d.anchor}</span>
          </div>
        `);
    })
    .on("mouseleave", () => tooltip.style("opacity", 0));

  rowG.on("mouseenter", function () { d3.select(this).select(".bar-fill").attr("opacity", 1); })
      .on("mouseleave", function () { d3.select(this).select(".bar-fill").attr("opacity", 0.85); });
})();
