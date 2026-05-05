import type { DSVRowString } from "d3";
import { displayShort } from "./carbon-format";

const CARBON_CSV = "data/part4/4a.csv";

const EMOJI: Record<string, string> = {
  "Visa transaction": "🫥",
  "Gemini query": "🔍",
  "Google search": "💡",
  "Plain email": "💡",
  "ChatGPT query (low)": "🔍🔍",
  "AI image generation": "🖼️",
  "ChatGPT query (high)": "♨️",
  "Netflix 30 min": "🚗",
  "Zoom 1hr HD": "🛣️",
  "Bitcoin transaction": "🌍",
};

const LAYOUT: Record<string, { labelH: number; anchorH: number }> = {
  "Visa transaction": { labelH: 150, anchorH: 80 },
  "Gemini query": { labelH: 95, anchorH: 55 },
  "Google search": { labelH: 160, anchorH: 100 },
  "Plain email": { labelH: 75, anchorH: 65 },
  "ChatGPT query (low)": { labelH: 130, anchorH: 115 },
  "AI image generation": { labelH: 65, anchorH: 75 },
  "ChatGPT query (high)": { labelH: 115, anchorH: 55 },
  "Netflix 30 min": { labelH: 155, anchorH: 95 },
  "Zoom 1hr HD": { labelH: 90, anchorH: 60 },
  "Bitcoin transaction": { labelH: 150, anchorH: 85 },
};

interface DotDatum {
  activity: string;
  min: number;
  max: number;
  anchor: string;
  co2: string;
  emoji: string;
  labelH: number;
  anchorH: number;
  dotVal: number;
}

export async function runExp02(): Promise<void> {
  const row = (d: DSVRowString) => ({
    activity: d.Activity ?? "",
    min: +String(d.CO2e_min_g),
    max: +String(d.CO2e_max_g),
    anchor: d.Human_anchor ?? "",
  });

  try {
    const rows = await d3.csv(CARBON_CSV, row);
    const data: DotDatum[] = rows.map((d) => {
      const layout = LAYOUT[d.activity] ?? { labelH: 120, anchorH: 85 };
      return {
        ...d,
        co2: displayShort(d),
        emoji: EMOJI[d.activity] ?? "•",
        labelH: layout.labelH,
        anchorH: layout.anchorH,
        dotVal: 0,
      };
    });

    data.forEach((d) => {
      d.dotVal = d.min === d.max ? d.min : Math.exp((Math.log(d.min) + Math.log(d.max)) / 2);
    });

    const containerEl = document.getElementById("chart-02");
    if (!containerEl) return;
    const containerWidth = containerEl.clientWidth || 860;
    const mL = 50;
    const mR = 50;
    const width = containerWidth - mL - mR;
    const axisY = 185;
    const totalH = axisY + 200;

    const svg = d3
      .select("#chart-02")
      .append("svg")
      .attr("viewBox", `0 0 ${containerWidth} ${totalH}`)
      .attr("height", totalH);

    const defs = svg.append("defs");
    const f = defs
      .append("filter")
      .attr("id", "glow02")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    f.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
    const fm = f.append("feMerge");
    fm.append("feMergeNode").attr("in", "blur");
    fm.append("feMergeNode").attr("in", "SourceGraphic");

    const g = svg.append("g").attr("transform", `translate(${mL},0)`);

    const xScale = d3.scaleLog().domain([0.00005, 2_500_000]).range([0, width]);
    const colorScale = d3.scaleLog<string>().domain([0.00005, 2_500_000]).range(["#a8edea", "#ff6b8a"]);
    const rScale = d3.scaleLog().domain([0.0001, 1_000_000]).range([4, 11]).clamp(true);

    g.append("line").attr("x1", 0).attr("x2", width).attr("y1", axisY).attr("y2", axisY).attr("stroke", "#2a2f42").attr("stroke-width", 1.5);

    const tickVals = [0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000, 100000, 1000000];
    tickVals.forEach((v) => {
      const x = xScale(v);
      g.append("line").attr("x1", x).attr("x2", x).attr("y1", axisY - 5).attr("y2", axisY + 5).attr("stroke", "#2a2f42");
      g.append("text")
        .attr("x", x)
        .attr("y", axisY + 155)
        .attr("text-anchor", "middle")
        .attr("fill", "#3a4050")
        .attr("font-size", "10px")
        .text(v >= 1000 ? d3.format(".0s")(v) : d3.format("~g")(v));
    });

    g.append("text")
      .attr("x", width / 2)
      .attr("y", axisY + 170)
      .attr("text-anchor", "middle")
      .attr("fill", "#2a2f42")
      .attr("font-size", "10px")
      .text("CO₂e (grams, log scale)");

    data.forEach((d) => {
      const cx = xScale(d.dotVal);
      const color = colorScale(d.dotVal);
      const r = rScale(d.dotVal);
      const isRange = d.min !== d.max;

      if (isRange) {
        g.append("line")
          .attr("x1", xScale(d.min))
          .attr("x2", xScale(d.max))
          .attr("y1", axisY)
          .attr("y2", axisY)
          .attr("stroke", color)
          .attr("stroke-width", 2.5)
          .attr("stroke-linecap", "round")
          .attr("opacity", 0.45);
        [d.min, d.max].forEach((v) =>
          g
            .append("line")
            .attr("x1", xScale(v))
            .attr("x2", xScale(v))
            .attr("y1", axisY - 5)
            .attr("y2", axisY + 5)
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("opacity", 0.55),
        );
      }

      g.append("line")
        .attr("x1", cx)
        .attr("x2", cx)
        .attr("y1", axisY - r - 2)
        .attr("y2", axisY - d.labelH + 24)
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3 3")
        .attr("opacity", 0.35);

      g.append("line")
        .attr("x1", cx)
        .attr("x2", cx)
        .attr("y1", axisY + r + 2)
        .attr("y2", axisY + d.anchorH - 14)
        .attr("stroke", "#ffb8c6")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3 3")
        .attr("opacity", 0.3);

      g.append("circle").attr("cx", cx).attr("cy", axisY).attr("r", r).attr("fill", color).attr("filter", "url(#glow02)").attr("opacity", 0.9);

      const lg = g.append("g").attr("transform", `translate(${cx},${axisY - d.labelH})`);
      lg.append("text").attr("text-anchor", "middle").attr("fill", "#c8cfd9").attr("font-size", "11px").attr("font-weight", "600").text(d.activity);
      lg.append("text").attr("text-anchor", "middle").attr("y", 14).attr("fill", color).attr("font-size", "10px").text(d.co2);

      g.append("text")
        .attr("x", cx)
        .attr("y", axisY + d.anchorH)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .attr("font-size", "18px")
        .text(d.emoji);
      g.append("text")
        .attr("x", cx)
        .attr("y", axisY + d.anchorH + 24)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .attr("fill", "#ffb8c6")
        .attr("font-size", "10px")
        .attr("font-style", "italic")
        .text(d.anchor);
    });
  } catch (err) {
    console.error("Failed to load carbon data:", err);
    d3.select("#chart-02").append("p").attr("class", "text-muted text-sm").text("Could not load dataset (data/part4/4a.csv).");
  }
}
