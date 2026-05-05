import type { DSVRowString } from "d3";
import { displayLong } from "./carbon-format";

const CARBON_CSV = "data/part4/4a.csv";

interface CarbonRow {
  activity: string;
  min: number;
  max: number;
  anchor: string;
  display: string;
}

export async function runExp01(): Promise<void> {
  const row = (d: DSVRowString): Omit<CarbonRow, "display"> => ({
    activity: d.Activity ?? "",
    min: +String(d.CO2e_min_g),
    max: +String(d.CO2e_max_g),
    anchor: d.Human_anchor ?? "",
  });

  try {
    const raw = await d3.csv(CARBON_CSV, row);
    const rawData: CarbonRow[] = raw.map((d) => ({
      ...d,
      display: displayLong(d),
    }));

    const margin = { top: 20, right: 130, bottom: 50, left: 210 };
    const barHeight = 28;
    const barPad = 18;
    const containerEl = document.getElementById("chart-01");
    if (!containerEl) return;
    const containerWidth = containerEl.clientWidth || 860;
    const width = containerWidth - margin.left - margin.right;
    const innerH = rawData.length * (barHeight + barPad);
    const totalH = innerH + margin.top + margin.bottom;

    const svg = d3
      .select("#chart-01")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${totalH}`)
      .attr("height", totalH);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLog().domain([0.0001, 1_200_000]).range([0, width]).nice();
    const yScale = d3
      .scaleBand()
      .domain(rawData.map((d) => d.activity))
      .range([0, innerH])
      .paddingInner(0.45)
      .paddingOuter(0.2);

    const colorScale = d3.scaleLog<string>().domain([0.0001, 1_200_000]).range(["#a8edea", "#ff6b8a"]);

    const tickVals = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000];

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickValues(tickVals).tickSize(-innerH).tickFormat(() => ""))
      .selectAll(".tick line")
      .attr("stroke", "#1e2130")
      .attr("stroke-dasharray", "3 4");

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(tickVals)
          .tickFormat((d) => (Number(d) >= 1000 ? d3.format(".2s")(Number(d)) + " g" : d3.format("~g")(Number(d)) + " g")),
      )
      .selectAll("text")
      .attr("dy", "1.2em");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", innerH + 44)
      .attr("text-anchor", "middle")
      .attr("fill", "#3a4050")
      .attr("font-size", "11px")
      .text("CO₂e per activity (log scale)");

    const rowG = g
      .selectAll<SVGGElement, CarbonRow>(".row")
      .data(rawData)
      .join("g")
      .attr("class", "row")
      .attr("transform", (d) => `translate(0, ${yScale(d.activity)})`);

    rowG.append("rect").attr("class", "bar-bg").attr("width", width).attr("height", yScale.bandwidth()).attr("rx", 4);

    rowG
      .append("rect")
      .attr("class", "bar-fill")
      .attr("width", (d) => xScale(d.min) - xScale(0.0001))
      .attr("height", yScale.bandwidth())
      .attr("rx", 4)
      .attr("fill", (d) => colorScale(d.min))
      .attr("opacity", 0.85);

    rowG
      .filter((d) => d.min !== d.max)
      .append("line")
      .attr("x1", (d) => xScale(d.min))
      .attr("x2", (d) => xScale(d.max))
      .attr("y1", yScale.bandwidth() / 2)
      .attr("y2", yScale.bandwidth() / 2)
      .attr("stroke", (d) => colorScale(d.max))
      .attr("stroke-width", 3)
      .attr("stroke-linecap", "round");

    rowG
      .filter((d) => d.min !== d.max)
      .append("line")
      .attr("x1", (d) => xScale(d.max))
      .attr("x2", (d) => xScale(d.max))
      .attr("y1", yScale.bandwidth() * 0.2)
      .attr("y2", yScale.bandwidth() * 0.8)
      .attr("stroke", (d) => colorScale(d.max))
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round");

    rowG
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => xScale(d.max) + 8)
      .attr("y", yScale.bandwidth() / 2)
      .text((d) => d.display);

    g.selectAll<SVGTextElement, CarbonRow>(".activity-label")
      .data(rawData)
      .join("text")
      .attr("class", "activity-label")
      .attr("x", -12)
      .attr("y", (d) => yScale(d.activity)! + yScale.bandwidth() / 2)
      .text((d) => d.activity);

    const tooltip = d3.select("#tooltip");

    rowG
      .append("rect")
      .attr("width", width)
      .attr("height", yScale.bandwidth())
      .attr("fill", "transparent")
      .on("mousemove", function (event, d) {
        const [mx, my] = d3.pointer(event, document.body);
        tooltip
          .style("opacity", 1)
          .style("left", mx + 18 + "px")
          .style("top", my - 10 + "px")
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
      .on("mouseleave", () => tooltip.style("opacity", "0"));

    rowG
      .on("mouseenter", function () {
        d3.select(this).select(".bar-fill").attr("opacity", 1);
      })
      .on("mouseleave", function () {
        d3.select(this).select(".bar-fill").attr("opacity", 0.85);
      });
  } catch (err) {
    console.error("Failed to load carbon data:", err);
    d3.select("#chart-01").append("p").attr("class", "text-muted text-sm").text("Could not load dataset (data/part4/4a.csv).");
  }
}
