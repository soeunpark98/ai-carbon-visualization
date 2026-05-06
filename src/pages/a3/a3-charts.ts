/** D3 is provided globally via index.html (d3.v7). */
import { initGlobalScene } from "./global-scene";

type RowQ1 = {
  activity: string;
  mid: number;
  isAi: boolean;
  min: number;
  max: number;
  isRef?: boolean;
};

export async function runA3Charts(): Promise<void> {
  await Promise.all([
    runQ1Comparative(),
    runQ2Datacenter(),
    runQ3Correlation(),
  ]);
  runQ4Calculator();
  runQ4Global();
}

async function runQ1Comparative(): Promise<void> {
  const mount = "#a3-q1";
  const root = document.querySelector(mount);
  if (!root) return;
  d3.select(mount).html("");

  try {
    const raw = await d3.csv("data/part4/4a.csv", (d): RowQ1 | null => {
      const mid = +String(d.CO2e_mid_g ?? "");
      if (!Number.isFinite(mid) || mid <= 0) return null;
      return {
        activity: d.Activity ?? "",
        mid,
        isAi: String(d.Is_AI ?? "").toLowerCase() === "true",
        min: +String(d.CO2e_min_g ?? "0"),
        max: +String(d.CO2e_max_g ?? "0"),
      };
    });
    const refs: RowQ1[] = [
      {
        activity: "Charge smartphone (full)",
        mid: 8.22,
        isAi: false,
        min: 8.22,
        max: 8.22,
        isRef: true,
      },
      {
        activity: "Boil water (1 cup)",
        mid: 21,
        isAi: false,
        min: 21,
        max: 21,
        isRef: true,
      },
      {
        activity: "Drive 1 km (petrol car)",
        mid: 150,
        isAi: false,
        min: 120,
        max: 180,
        isRef: true,
      },
    ];
    const data = [
      ...raw.filter(
        (r): r is RowQ1 => r != null && r.activity !== "Bitcoin transaction"
      ),
      ...refs,
    ].sort((a, b) => b.mid - a.mid);

    const margin = { top: 36, right: 100, bottom: 48, left: 200 };
    const barH = 26;
    const pad = 12;
    const containerW = Math.max(640, root.clientWidth || 860);
    const innerH = data.length * (barH + pad);
    const width = containerW - margin.left - margin.right;
    const totalH = innerH + margin.top + margin.bottom;

    const svg = d3
      .select(mount)
      .append("svg")
      .attr("viewBox", `0 0 ${containerW} ${totalH}`)
      .attr("width", "100%")
      .attr("height", totalH);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleLog()
      .domain([
        d3.min(data, (d) => d.mid)! * 0.7,
        d3.max(data, (d) => d.mid)! * 1.15,
      ])
      .range([0, width])
      .nice();

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.activity))
      .range([0, innerH])
      .paddingInner(0.35);

    const tickVals = [1e-4, 1e-3, 1e-2, 1e-1, 1, 10, 100, 1e3, 1e6];

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(tickVals)
          .tickSize(-innerH)
          .tickFormat(() => "")
      )
      .selectAll(".tick line")
      .attr("stroke", "#1e2130")
      .attr("stroke-dasharray", "3 4");

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .tickValues(tickVals)
          .tickFormat((v) => `${d3.format("~s")(+v)} g`)
      )
      .selectAll("text")
      .attr("dy", "1.15em");

    g.append("text")
      .attr("x", width / 2)
      .attr("y", innerH + 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#3a4050")
      .attr("font-size", "11px")
      .text("CO₂e per action (grams, log scale)");

    const rows = g
      .selectAll<SVGGElement, RowQ1>("g.row")
      .data(data)
      .join("g")
      .attr("class", "row")
      .attr("transform", (d) => `translate(0,${y(d.activity)})`);

    rows
      .append("rect")
      .attr("width", width)
      .attr("height", y.bandwidth())
      .attr("rx", 4)
      .attr("fill", (d) => (d.isRef ? "#252836" : "#1e2130"))
      .attr("stroke", (d) => (d.isRef ? "#3a4050" : "none"))
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", (d) => (d.isRef ? "4 3" : "none"));

    rows
      .append("rect")
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("rx", 4)
      .attr("fill", (d) =>
        d.isRef ? "#8b95a8" : d.isAi ? "#ff6b9d" : "#a8edea"
      )
      .attr("opacity", (d) => (d.isRef ? 0.45 : 0.88))
      .attr("width", (d) => x(d.mid));

    rows
      .filter((d) => d.min !== d.max)
      .append("line")
      .attr("x1", (d) => x(d.min))
      .attr("x2", (d) => x(d.max))
      .attr("y1", y.bandwidth() / 2)
      .attr("y2", y.bandwidth() / 2)
      .attr("stroke", "#8b95a8")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round");

    rows
      .append("text")
      .attr("x", -10)
      .attr("y", y.bandwidth() / 2)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("fill", (d) => (d.isRef ? "#576070" : "#c8cfd9"))
      .attr("font-size", "12px")
      .attr("font-style", (d) => (d.isRef ? "italic" : "normal"))
      .text((d) => d.activity);

    rows
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => Math.max(x(d.mid), x(d.max)) + 10)
      .attr("y", y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#8b95a8")
      .attr("font-size", "11px")
      .text((d) => `${d3.format(",.3~g")(d.mid)} g`);

    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 4)`);
    legend
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", "#ff6b9d");
    legend
      .append("text")
      .attr("x", 16)
      .attr("y", 9)
      .attr("fill", "#576070")
      .attr("font-size", "11px")
      .text("AI-related");
    legend
      .append("rect")
      .attr("x", 110)
      .attr("width", 10)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", "#a8edea");
    legend
      .append("text")
      .attr("x", 126)
      .attr("y", 9)
      .attr("fill", "#576070")
      .attr("font-size", "11px")
      .text("Other activities");
    legend
      .append("rect")
      .attr("x", 254)
      .attr("width", 10)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", "#8b95a8")
      .attr("opacity", 0.45)
      .attr("stroke", "#3a4050")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4 3");
    legend
      .append("text")
      .attr("x", 270)
      .attr("y", 9)
      .attr("fill", "#576070")
      .attr("font-size", "11px")
      .text("Human scale reference");
  } catch (e) {
    console.error(e);
    d3.select(mount)
      .append("p")
      .attr("class", "text-muted text-sm")
      .text("Could not load 4a.csv.");
  }
}

async function runQ2Datacenter(): Promise<void> {
  const lineMount = "#a3-q2-line";
  const barMount = "#a3-q2-regions";
  const root = document.querySelector<HTMLElement>(lineMount);
  if (!root) return;
  d3.select(lineMount).html("");
  d3.select(barMount).html("");

  // ── CSS ────────────────────────────────────────────────────────────────
  if (!document.getElementById("q2dc-style")) {
    const s = document.createElement("style");
    s.id = "q2dc-style";
    s.textContent = `
      .q2dc-kpi-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-bottom:1rem}
      .q2dc-kpi{background:#1e2130;border-radius:8px;padding:.65rem 1rem}
      .q2dc-kpi-label{font-size:11px;color:#576070;margin-bottom:3px}
      .q2dc-kpi-val{font-size:18px;font-weight:500;color:#c8cfd9}
      .q2dc-kpi-sub{font-size:10px;color:#3a4050;margin-top:1px}
      .q2dc-card{background:#0f1117;border:0.5px solid #2e3448;border-radius:12px;padding:1rem 1.25rem;margin-bottom:.75rem}
      .q2dc-row-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem}
      .q2dc-sec-title{font-size:12px;font-weight:500;color:#576070}
      .q2dc-ytabs{display:flex;gap:3px}
      .q2dc-ytab{font-size:11px;padding:3px 9px;border-radius:5px;border:0.5px solid #2e3448;cursor:pointer;background:transparent;color:#576070;transition:all .12s}
      .q2dc-ytab.on{background:#1e2130;color:#c8cfd9;border-color:#3a4050}
      .q2dc-legend-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:.6rem;font-size:11px;color:#576070}
      .q2dc-leg{display:flex;align-items:center;gap:4px;cursor:pointer;user-select:none;transition:opacity .15s}
      .q2dc-leg.dim{opacity:.3}
      .q2dc-lsq{width:9px;height:9px;border-radius:2px;flex-shrink:0}
      .q2dc-tt{position:absolute;background:#0f1117;border:0.5px solid #3a4050;border-radius:8px;padding:7px 11px;font-size:11px;pointer-events:none;opacity:0;transition:opacity .12s;z-index:20;min-width:130px;white-space:nowrap;color:#c8cfd9}
      .q2dc-tt-title{font-weight:500;font-size:12px;margin-bottom:4px;color:#c8cfd9}
      .q2dc-tt-r{display:flex;justify-content:space-between;gap:14px;color:#576070}
      .q2dc-tt-v{color:#c8cfd9;font-weight:500}
      .q2dc-proj-label{font-size:10px;color:#3a4050;margin-top:5px;display:flex;align-items:center;gap:4px}
    `;
    document.head.appendChild(s);
  }

  // ── Data ───────────────────────────────────────────────────────────────
  const REGIONS: Record<
    string,
    { name: string; color: string; ids: number[] }
  > = {
    us: { name: "United States", color: "#378ADD", ids: [840] },
    eu: {
      name: "Europe",
      color: "#1D9E75",
      ids: [
        276, 250, 380, 724, 826, 56, 528, 756, 40, 752, 208, 246, 620, 372, 300,
        203, 616, 348, 642, 100, 191, 703, 705, 233, 428, 440,
      ],
    },
    cn: { name: "China", color: "#D85A30", ids: [156] },
    ap: {
      name: "Asia Pacific",
      color: "#7F77DD",
      ids: [
        392, 410, 36, 356, 458, 702, 764, 360, 704, 50, 144, 104, 608, 566, 124,
      ],
    },
  };
  const DATA: Record<string, Record<number, number>> = {
    us: { 2020: 109, 2023: 165, 2024: 190, 2030: 430 },
    eu: { 2020: 65, 2023: 75, 2024: 70, 2030: 115 },
    cn: { 2020: 55, 2023: 85, 2024: 105, 2030: 275 },
    ap: { 2020: 95, 2023: 130, 2024: 155, 2030: 370 },
  };
  const MAX_BY_RK: Record<string, number> = {
    us: 430,
    eu: 115,
    cn: 275,
    ap: 370,
  };
  const ID_TO_RK: Record<number, string> = {};
  Object.entries(REGIONS).forEach(([k, v]) =>
    v.ids.forEach((id) => {
      ID_TO_RK[id] = k;
    })
  );

  // ── State ──────────────────────────────────────────────────────────────
  let selYear = 2030;
  let chartMode: "line" | "bar" = "line";
  const dimmed: Record<string, boolean> = {};
  let chartInst: any = null;
  let worldData: any = null;

  // ── HTML ───────────────────────────────────────────────────────────────
  root.innerHTML = `
    <div class="q2dc-card" style="position:relative">
      <div class="q2dc-row-header">
        <span class="q2dc-sec-title">Regional electricity — map view</span>
        <div class="q2dc-ytabs" id="q2dc-ytabs">
          <button class="q2dc-ytab" data-year="2020">2020</button>
          <button class="q2dc-ytab" data-year="2023">2023</button>
          <button class="q2dc-ytab" data-year="2024">2024</button>
          <button class="q2dc-ytab on" data-year="2030">2030 proj.</button>
        </div>
      </div>
      <div id="q2dc-map-wrap" style="position:relative;width:100%;background:#1e2130;border-radius:8px;overflow:hidden"></div>
      <div class="q2dc-legend-row" id="q2dc-map-legend"></div>
      <div id="q2dc-map-tt" class="q2dc-tt"></div>
    </div>
    <div class="q2dc-card" style="position:relative">
      <div class="q2dc-row-header">
        <span class="q2dc-sec-title">Global trend + regional breakdown — click year to sync map</span>
        <div style="display:flex;gap:3px">
          <button class="q2dc-ytab on" id="q2dc-btn-line">Trend</button>
          <button class="q2dc-ytab" id="q2dc-btn-bar">Compare</button>
        </div>
      </div>
      <div style="position:relative;height:220px">
        <canvas id="q2dc-main-chart"></canvas>
      </div>
      <div class="q2dc-proj-label">
        <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke="#576070" stroke-width="1.5" stroke-dasharray="4 3"/></svg>
        dashed = 2030 baseline projection
      </div>
      <div class="q2dc-legend-row" id="q2dc-chart-legend"></div>
    </div>
  `;

  // ── Helpers ────────────────────────────────────────────────────────────
  function getColor(rk: string | undefined, year: number): string {
    if (!rk || dimmed[rk]) return "#2a2f42";
    const t = DATA[rk][year] / MAX_BY_RK[rk];
    return d3.interpolateRgb(
      "#1e2130",
      REGIONS[rk].color
    )(0.2 + t * 0.8) as string;
  }

  const LABEL_POS: Record<string, (W: number, H: number) => [number, number]> =
    {
      us: (W, H) => [W * 0.18, H * 0.37],
      eu: (W, H) => [W * 0.49, H * 0.28],
      cn: (W, H) => [W * 0.72, H * 0.38],
      ap: (W, H) => [W * 0.82, H * 0.48],
    };

  function drawLabels(layer: any, W: number, H: number) {
    layer.selectAll(".rlabel").remove();
    const fs = Math.max(10, Math.round(W / 55));
    Object.entries(REGIONS).forEach(([rk]) => {
      if (dimmed[rk]) return;
      const [cx, cy] = LABEL_POS[rk](W, H);
      layer
        .append("rect")
        .attr("class", "rlabel")
        .attr("x", cx - fs * 2.4)
        .attr("y", cy - fs * 0.9)
        .attr("width", fs * 4.8)
        .attr("height", fs * 1.7)
        .attr("rx", 3)
        .attr("fill", "rgba(15,17,23,0.85)");
      layer
        .append("text")
        .attr("class", "rlabel")
        .attr("x", cx)
        .attr("y", cy)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("font-size", fs)
        .attr("font-weight", "600")
        .attr("fill", "#c8cfd9")
        .text(`${DATA[rk][selYear]} TWh`);
    });
  }

  const mapWrap = document.getElementById("q2dc-map-wrap")!;
  const mapTt = document.getElementById("q2dc-map-tt")!;

  function drawMap() {
    if (!worldData) return;
    mapWrap.innerHTML = "";
    const W = mapWrap.clientWidth || 630;
    const H = Math.round(W * 0.5);
    const proj = d3
      .geoNaturalEarth1()
      .scale(W / 6.2)
      .translate([W / 2, H / 2]);
    const path = d3.geoPath(proj);
    const svg = d3
      .select(mapWrap)
      .append("svg")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${W} ${H}`);
    const mapLayer = svg.append("g").attr("class", "q2dc-map-layer");
    const labelLayer = svg.append("g").attr("class", "q2dc-label-layer");
    const topo = (window as any).topojson;
    const countries = topo.feature(worldData, worldData.objects.countries);

    mapLayer
      .selectAll("path")
      .data((countries as any).features)
      .join("path")
      .attr("d", path as any)
      .attr("fill", (d: any) => getColor(ID_TO_RK[+d.id], selYear))
      .attr("stroke", "rgba(255,255,255,0.08)")
      .attr("stroke-width", 0.4)
      .style("cursor", (d: any) => (ID_TO_RK[+d.id] ? "pointer" : "default"))
      .on("mousemove", (event: MouseEvent, d: any) => {
        const rk = ID_TO_RK[+d.id];
        if (!rk) {
          mapTt.style.opacity = "0";
          return;
        }
        const rect = mapWrap.getBoundingClientRect();
        mapTt.innerHTML = `<div class="q2dc-tt-title">${REGIONS[rk].name}</div>
          <div class="q2dc-tt-r"><span>${selYear}${
          selYear === 2030 ? " (proj.)" : ""
        }</span><span class="q2dc-tt-v">${DATA[rk][selYear]} TWh</span></div>
          <div class="q2dc-tt-r"><span>vs 2020</span><span class="q2dc-tt-v">+${Math.round(
            (DATA[rk][selYear] / DATA[rk][2020] - 1) * 100
          )}%</span></div>`;
        mapTt.style.left = event.clientX - rect.left + 10 + "px";
        mapTt.style.top = event.clientY - rect.top + 10 + "px";
        mapTt.style.opacity = "1";
      })
      .on("mouseleave", () => {
        mapTt.style.opacity = "0";
      });

    drawLabels(labelLayer, W, H);

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .translateExtent([
        [0, 0],
        [W, H],
      ])
      .on("zoom", (event) => {
        mapLayer.attr("transform", event.transform);
        labelLayer.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);
    svg.on("dblclick", () => {
      svg
        .transition()
        .duration(240)
        .call(zoomBehavior.transform, d3.zoomIdentity);
    });
  }

  function updateMap() {
    if (!worldData) return;
    const svg = d3.select(mapWrap).select("svg");
    if (svg.empty()) {
      drawMap();
      return;
    }
    const W = mapWrap.clientWidth || 630;
    const H = Math.round(W * 0.5);
    svg
      .selectAll("path")
      .attr("fill", (d: any) => getColor(ID_TO_RK[+d.id], selYear));
    drawLabels(svg.select(".q2dc-label-layer"), W, H);
  }

  function setYear(y: number) {
    selYear = y;
    document
      .querySelectorAll<HTMLButtonElement>(".q2dc-ytab[data-year]")
      .forEach((t) => t.classList.toggle("on", +t.dataset.year! === y));
    updateMap();
  }

  function buildLegend() {
    ["q2dc-map-legend", "q2dc-chart-legend"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.innerHTML = "";
      Object.entries(REGIONS).forEach(([k, v]) => {
        const item = document.createElement("div");
        item.className = "q2dc-leg" + (dimmed[k] ? " dim" : "");
        item.innerHTML = `<span class="q2dc-lsq" style="background:${v.color}"></span>${v.name}`;
        item.onclick = () => {
          dimmed[k] = !dimmed[k];
          buildLegend();
          updateMap();
          rebuildChart();
        };
        el.appendChild(item);
      });
    });
  }

  const GRID_C = "rgba(255,255,255,0.07)";
  const TEXT_C = "#576070";
  const YEARS = [2020, 2023, 2024, 2030];

  function rebuildChart() {
    if (chartInst) {
      chartInst.destroy();
      chartInst = null;
    }
    const canvas = document.getElementById(
      "q2dc-main-chart"
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ChartJS = (window as any).Chart;
    if (!ChartJS) return;
    const ctx = canvas.getContext("2d")!;
    const ttOpts = {
      backgroundColor: "#0f1117",
      borderColor: GRID_C,
      borderWidth: 1,
      titleColor: "#c8cfd9",
      bodyColor: TEXT_C,
    };

    if (chartMode === "line") {
      chartInst = new ChartJS(ctx, {
        type: "line",
        data: {
          labels: ["2020", "2023", "2024", "2030"],
          datasets: [
            {
              label: "Global actual",
              data: [269, null, 416, null],
              borderColor: "#1D9E75",
              backgroundColor: "rgba(29,158,117,0.08)",
              borderWidth: 2.5,
              fill: true,
              tension: 0.3,
              pointRadius: [5, 0, 5, 0],
              pointBackgroundColor: "#fff",
              pointBorderColor: "#1D9E75",
              pointBorderWidth: 2,
              yAxisID: "y",
            },
            {
              label: "Global projection",
              data: [null, null, 416, 946],
              borderColor: "#EF9F27",
              backgroundColor: "rgba(239,159,39,0.05)",
              borderWidth: 2,
              borderDash: [6, 4],
              fill: true,
              tension: 0.3,
              pointRadius: [0, 0, 0, 6],
              pointBackgroundColor: "#fff",
              pointBorderColor: "#EF9F27",
              pointBorderWidth: 2,
              yAxisID: "y",
            },
            ...Object.entries(REGIONS)
              .filter(([k]) => !dimmed[k])
              .map(([k, v]) => ({
                label: v.name,
                data: YEARS.map((y) => DATA[k][y]),
                borderColor: v.color,
                backgroundColor: "transparent",
                borderWidth: 1.5,
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: v.color,
                borderDash:
                  k === "eu"
                    ? [3, 3]
                    : k === "cn"
                    ? [5, 2]
                    : k === "ap"
                    ? [2, 4]
                    : [],
                yAxisID: "y2",
              })),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              ...ttOpts,
              callbacks: {
                label: (c: any) => ` ${c.dataset.label}: ${c.parsed.y} TWh`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: GRID_C },
              ticks: { color: TEXT_C, font: { size: 11 } },
            },
            y: {
              grid: { color: GRID_C },
              position: "left",
              ticks: {
                color: TEXT_C,
                font: { size: 10 },
                callback: (v: number) => v + " TWh",
              },
              min: 0,
              max: 1100,
              title: {
                display: true,
                text: "Global",
                color: TEXT_C,
                font: { size: 10 },
              },
            },
            y2: {
              grid: { display: false },
              position: "right",
              ticks: {
                color: TEXT_C,
                font: { size: 10 },
                callback: (v: number) => v + " TWh",
              },
              min: 0,
              max: 500,
              title: {
                display: true,
                text: "Regional",
                color: TEXT_C,
                font: { size: 10 },
              },
            },
          },
          onClick(_e: any, els: any[]) {
            if (els.length) setYear(YEARS[els[0].index]);
          },
        },
      });
    } else {
      chartInst = new ChartJS(ctx, {
        type: "bar",
        data: {
          labels: ["2020", "2023", "2024", "2030"],
          datasets: Object.entries(REGIONS)
            .filter(([k]) => !dimmed[k])
            .map(([k, v]) => ({
              label: v.name,
              data: YEARS.map((y) => DATA[k][y]),
              backgroundColor: v.color,
              borderRadius: 3,
            })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: ttOpts },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: TEXT_C, font: { size: 11 } },
            },
            y: {
              grid: { color: GRID_C },
              ticks: {
                color: TEXT_C,
                font: { size: 10 },
                callback: (v: number) => v + " TWh",
              },
            },
          },
          onClick(_e: any, els: any[]) {
            if (els.length) setYear(YEARS[els[0].index]);
          },
        },
      });
    }
  }

  // ── Event listeners ────────────────────────────────────────────────────
  document
    .getElementById("q2dc-ytabs")
    ?.querySelectorAll<HTMLButtonElement>("[data-year]")
    .forEach((btn) =>
      btn.addEventListener("click", () => setYear(+btn.dataset.year!))
    );
  document.getElementById("q2dc-btn-line")?.addEventListener("click", () => {
    chartMode = "line";
    document.getElementById("q2dc-btn-line")?.classList.add("on");
    document.getElementById("q2dc-btn-bar")?.classList.remove("on");
    rebuildChart();
  });
  document.getElementById("q2dc-btn-bar")?.addEventListener("click", () => {
    chartMode = "bar";
    document.getElementById("q2dc-btn-bar")?.classList.add("on");
    document.getElementById("q2dc-btn-line")?.classList.remove("on");
    rebuildChart();
  });

  buildLegend();
  rebuildChart();
  d3.json(
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"
  ).then((w: any) => {
    worldData = w;
    drawMap();
  });

  // ── (old CSV charts removed) ───────────────────────────────────────────
  try {
    // nothing – kept only for the outer try/catch shape
    void 0;
  } catch (_) {
    /* unused */
  }
}

type PointQ3 = { model: string; year: number; params: number; co2: number };

async function runQ3Correlation(): Promise<void> {
  const mount = "#a3-q3";
  const root = document.querySelector<HTMLElement>(mount);
  if (!root) return;
  d3.select(mount).html(`
    <div class="mb-3 flex items-center justify-between gap-4">
      <div class="text-xs text-dim">Scroll/drag to zoom and pan. Double-click to reset.</div>
      <div class="flex items-center gap-3 text-xs text-muted">
        <button id="a3-q3-mode-all" class="px-2 py-1 rounded border border-rim text-soft bg-surface">All</button>
        <button id="a3-q3-mode-year" class="px-2 py-1 rounded border border-rim text-muted">Year</button>
        <span>Year</span>
        <input id="a3-q3-year-slider" type="range" min="2012" max="2025" step="1" value="2025" class="w-44 accent-[#a8edea]" />
        <span id="a3-q3-year-label" class="text-soft font-medium tabular-nums">2025</span>
      </div>
    </div>
  `);

  try {
    const raw = await d3.csv("data/part3/3a.csv", (d): PointQ3 | null => {
      const year = +String(d.Year ?? "");
      const params = +String(d.Parameters ?? "");
      const co2 = +String(d["Estimated CO2e (kg)"] ?? "");
      if (!Number.isFinite(year) || year < 2012 || year > 2025) return null;
      if (!Number.isFinite(params) || params <= 0) return null;
      if (!Number.isFinite(co2) || co2 <= 0) return null;
      return {
        model: d.Model ?? "",
        year,
        params,
        co2,
      };
    });

    const data = raw.filter((r): r is PointQ3 => r != null);
    if (!data.length) return;

    const w = Math.max(640, root.clientWidth || 900);
    const h = 520;
    const margin = { top: 64, right: 24, bottom: 52, left: 64 };
    const iw = w - margin.left - margin.right;
    const ih = h - margin.top - margin.bottom;

    const xBase = d3
      .scaleLog()
      .domain([
        d3.min(data, (d) => d.params)! * 0.8,
        d3.max(data, (d) => d.params)! * 1.2,
      ])
      .range([0, iw])
      .nice();

    const yBase = d3
      .scaleLog()
      .domain([
        d3.min(data, (d) => d.co2)! * 0.75,
        d3.max(data, (d) => d.co2)! * 1.25,
      ])
      .range([ih, 0])
      .nice();

    const color = d3
      .scaleSequential(d3.interpolateViridis)
      .domain(d3.extent(data, (d) => d.year) as [number, number]);

    const svg = d3
      .select(mount)
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("width", "100%")
      .attr("height", h)
      .style("border", "1px solid #2e3448")
      .style("border-radius", "10px")
      .style("background", "#0f1117");
    const clipId = `a3-q3-clip-${Date.now()}`;
    svg
      .append("defs")
      .append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", iw)
      .attr("height", ih);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const gridY = g.append("g").attr("class", "grid");
    const axisX = g
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(xBase).ticks(7, "~s"))
      .call((sel) =>
        sel
          .append("text")
          .attr("x", iw / 2)
          .attr("y", 40)
          .attr("fill", "#3a4050")
          .attr("font-size", "11px")
          .attr("text-anchor", "middle")
          .text("Parameters (log)")
      );

    const axisY = g
      .append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yBase).ticks(8, "~s"))
      .call((sel) =>
        sel
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -ih / 2)
          .attr("y", -48)
          .attr("fill", "#3a4050")
          .attr("font-size", "11px")
          .attr("text-anchor", "middle")
          .text("Training CO₂e (kg, log)")
      );

    let activeYear = 2025;
    let yearOnlyMode = false;
    let xCurrent = xBase.copy();
    let yCurrent = yBase.copy();
    const dotsLayer = g.append("g").attr("clip-path", `url(#${clipId})`);
    const tip = d3
      .select("body")
      .selectAll<HTMLDivElement, null>("div#a3-q3-tip")
      .data([null])
      .join("div")
      .attr("id", "a3-q3-tip")
      .style("position", "fixed")
      .style("pointer-events", "none")
      .style("z-index", "70")
      .style("opacity", "0")
      .style("background", "#0f1117")
      .style("border", "1px solid #2e3448")
      .style("border-radius", "8px")
      .style("padding", "8px 10px")
      .style("font-size", "11px")
      .style("color", "#c8cfd9")
      .style("line-height", "1.35");

    function getLogTickValues(scale: { domain: () => number[] }): number[] {
      const [d0, d1] = scale.domain() as [number, number];
      const lo = Math.max(Math.min(d0, d1), Number.EPSILON);
      const hi = Math.max(d0, d1);
      const e0 = Math.floor(Math.log10(lo));
      const e1 = Math.ceil(Math.log10(hi));
      const values: number[] = [];
      for (let e = e0; e <= e1; e += 1) {
        const v = 10 ** e;
        if (v >= lo && v <= hi) values.push(v);
      }
      if (values.length < 2) return [lo, hi];
      return values;
    }

    function drawGrid() {
      const yTicks = getLogTickValues(yCurrent);
      gridY
        .call(
          d3
            .axisLeft(yCurrent)
            .tickSize(-iw)
            .tickValues(yTicks)
            .tickFormat(() => "")
        )
        .selectAll("line")
        .attr("stroke", "#1e2130")
        .attr("stroke-dasharray", "3 4");
    }

    function renderPoints() {
      const filtered = yearOnlyMode
        ? data.filter((d) => d.year === activeYear)
        : data;
      const dots = dotsLayer
        .selectAll<SVGCircleElement, PointQ3>("circle.dot")
        .data(
          filtered,
          (d: any) => `${d.model}-${d.year}-${d.params}-${d.co2}`
        );

      dots.exit().remove();

      const enter = dots
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("fill", (d) => color(d.year))
        .attr("stroke", "#0f1117")
        .attr("stroke-width", 0.6)
        .attr("opacity", 0.72);

      enter
        .merge(dots as any)
        .attr("cx", (d) => xCurrent(d.params))
        .attr("cy", (d) => yCurrent(d.co2))
        .style("cursor", "pointer");

      dotsLayer
        .selectAll<SVGCircleElement, PointQ3>("circle.dot")
        .on("mouseenter", function (event, d) {
          d3.select(this)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1.6)
            .attr("r", 5);
          tip.style("opacity", "1").html(
            `<div style="font-weight:600;color:#e8eaf0;margin-bottom:4px;max-width:260px;">${
              d.model
            }</div>
               <div style="display:flex;justify-content:space-between;gap:12px;color:#8b95a8;"><span>Year</span><span style="color:#c8cfd9;">${
                 d.year
               }</span></div>
               <div style="display:flex;justify-content:space-between;gap:12px;color:#8b95a8;"><span>Parameters</span><span style="color:#a8edea;">${d3.format(
                 ".3~s"
               )(d.params)}</span></div>
               <div style="display:flex;justify-content:space-between;gap:12px;color:#8b95a8;"><span>CO₂e</span><span style="color:#fed6e3;">${d3.format(
                 ".3~s"
               )(d.co2)} kg</span></div>`
          );
          tip
            .style("left", `${event.clientX + 14}px`)
            .style("top", `${event.clientY + 14}px`);
        })
        .on("mousemove", function (event) {
          tip
            .style("left", `${event.clientX + 14}px`)
            .style("top", `${event.clientY + 14}px`);
        })
        .on("mouseleave", function () {
          d3.select(this)
            .attr("stroke", "#0f1117")
            .attr("stroke-width", 0.6)
            .attr("r", 3.5);
          tip.style("opacity", "0");
        });
    }

    function renderAxesAndPoints() {
      const xTicks = getLogTickValues(xCurrent);
      const yTicks = getLogTickValues(yCurrent);
      axisX.call(
        d3.axisBottom(xCurrent).tickValues(xTicks).tickFormat(d3.format("~s"))
      );
      axisY.call(
        d3.axisLeft(yCurrent).tickValues(yTicks).tickFormat(d3.format("~s"))
      );
      drawGrid();
      renderPoints();
    }

    renderAxesAndPoints();

    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10])
      .translateExtent([
        [0, 0],
        [iw, ih],
      ])
      .extent([
        [0, 0],
        [iw, ih],
      ])
      .on("zoom", (event) => {
        xCurrent = event.transform.rescaleX(xBase);
        yCurrent = event.transform.rescaleY(yBase);
        renderAxesAndPoints();
      });

    svg.call(zoomBehavior);
    svg.on("dblclick", () => {
      svg
        .transition()
        .duration(220)
        .call(zoomBehavior.transform, d3.zoomIdentity);
    });

    const yearSlider = document.getElementById(
      "a3-q3-year-slider"
    ) as HTMLInputElement | null;
    const yearLabel = document.getElementById("a3-q3-year-label");
    const modeAllBtn = document.getElementById(
      "a3-q3-mode-all"
    ) as HTMLButtonElement | null;
    const modeYearBtn = document.getElementById(
      "a3-q3-mode-year"
    ) as HTMLButtonElement | null;

    function updateModeButtons() {
      if (!modeAllBtn || !modeYearBtn) return;
      modeAllBtn.className = yearOnlyMode
        ? "px-2 py-1 rounded border border-rim text-muted"
        : "px-2 py-1 rounded border border-rim text-soft bg-surface";
      modeYearBtn.className = yearOnlyMode
        ? "px-2 py-1 rounded border border-rim text-soft bg-surface"
        : "px-2 py-1 rounded border border-rim text-muted";
    }

    modeAllBtn?.addEventListener("click", () => {
      yearOnlyMode = false;
      updateModeButtons();
      renderPoints();
    });

    modeYearBtn?.addEventListener("click", () => {
      yearOnlyMode = true;
      updateModeButtons();
      renderPoints();
    });

    if (yearSlider && yearLabel) {
      yearSlider.addEventListener("input", () => {
        activeYear = +yearSlider.value;
        yearLabel.textContent = String(activeYear);
        yearOnlyMode = true;
        updateModeButtons();
        renderPoints();
      });
    }

    const legendW = 180;
    const legendH = 14;
    const lg = svg
      .append("g")
      .attr("transform", `translate(${w - margin.right - legendW}, 22)`);
    const defs = svg.append("defs");
    const gradId = "a3-q3-grad";
    const grad = defs
      .append("linearGradient")
      .attr("id", gradId)
      .attr("x1", "0%")
      .attr("x2", "100%");
    grad
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d3.interpolateViridis(0));
    grad
      .append("stop")
      .attr("offset", "33%")
      .attr("stop-color", d3.interpolateViridis(0.33));
    grad
      .append("stop")
      .attr("offset", "66%")
      .attr("stop-color", d3.interpolateViridis(0.66));
    grad
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", d3.interpolateViridis(1));
    lg.append("rect")
      .attr("width", legendW)
      .attr("height", legendH)
      .attr("rx", 4)
      .attr("fill", `url(#${gradId})`);
    lg.append("text")
      .attr("x", 0)
      .attr("y", -8)
      .attr("fill", "#576070")
      .attr("font-size", "10px")
      .text("Year");
    lg.append("text")
      .attr("x", 0)
      .attr("y", legendH + 14)
      .attr("fill", "#576070")
      .attr("font-size", "9px")
      .text("2012");
    lg.append("text")
      .attr("x", legendW)
      .attr("y", legendH + 14)
      .attr("fill", "#576070")
      .attr("font-size", "9px")
      .attr("text-anchor", "end")
      .text("2025");
  } catch (e) {
    console.error(e);
    d3.select(mount)
      .append("p")
      .attr("class", "text-muted text-sm")
      .text("Could not load 3a.csv.");
  }
}

function runQ4Calculator(): void {
  if (!document.querySelector("#a3-q4-result")) return;

  const CO2_G: Record<string, Record<string, number>> = {
    chatgpt: { short: 0.4, medium: 1.5, long: 3.0 },
    gemini: { short: 0.03, medium: 0.15, long: 0.3 },
    claude: { short: 0.3, medium: 1.2, long: 2.5 },
  };
  const CAR_G_PER_KM = 150;

  const TOOL_COLOR: Record<string, string> = {
    chatgpt: "#ff6b9d",
    gemini: "#a8edea",
    claude: "#c4b5fd",
  };

  const state = { tool: "chatgpt", len: "medium", freq: 10 };

  function setActive(
    selector: string,
    activeDataAttr: string,
    value: string,
    color: string
  ) {
    document.querySelectorAll<HTMLButtonElement>(selector).forEach((btn) => {
      const isActive = btn.dataset[activeDataAttr] === value;
      btn.style.background = isActive ? color : "";
      btn.style.color = isActive ? "#0f1117" : "";
      btn.style.borderColor = isActive ? color : "";
    });
  }

  document
    .querySelectorAll<HTMLButtonElement>(".q4-tool-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () => {
        state.tool = btn.dataset.tool!;
        setActive(".q4-tool-btn", "tool", state.tool, TOOL_COLOR[state.tool]);
        update();
      });
    });

  document.querySelectorAll<HTMLButtonElement>(".q4-len-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.len = btn.dataset.len!;
      setActive(".q4-len-btn", "len", state.len, TOOL_COLOR[state.tool]);
      update();
    });
  });

  const freqInput = document.querySelector<HTMLInputElement>("#a3-q4-freq");
  const freqVal = document.querySelector<HTMLElement>("#a3-q4-freq-val");
  freqInput?.addEventListener("input", () => {
    state.freq = +freqInput.value;
    if (freqVal) freqVal.textContent = String(state.freq);
    update();
  });

  function update() {
    const color = TOOL_COLOR[state.tool];
    setActive(".q4-tool-btn", "tool", state.tool, color);
    setActive(".q4-len-btn", "len", state.len, color);

    const co2PerQuery = CO2_G[state.tool]?.[state.len] ?? 1;
    const annualG = co2PerQuery * state.freq * 365;
    const annualKg = annualG / 1000;
    const carKm = annualG / CAR_G_PER_KM;

    const kgLabel =
      annualKg < 1
        ? `${d3.format(".2~f")(annualG)} g`
        : `${d3.format(".2~f")(annualKg)} kg`;

    d3.select("#a3-q4-result").html(`
      <div class="flex flex-wrap gap-10 items-end py-2">
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-1">Annual CO₂e</p>
          <p class="text-4xl font-bold tabular-nums" style="color:${color}">${kgLabel}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-1">≈ driving a car</p>
          <p class="text-4xl font-bold text-soft tabular-nums">${d3.format(
            ",.0f"
          )(carKm)} km</p>
        </div>
        <p class="text-xs text-dim self-end pb-1">
          ${d3.format(".3~g")(co2PerQuery)} g/query × ${
      state.freq
    }/day × 365 days
        </p>
      </div>
    `);

    drawBar(carKm, color);
  }

  function drawBar(carKm: number, color: string) {
    d3.select("#a3-q4-chart").html("");
    const root = document.querySelector<HTMLElement>("#a3-q4-chart")!;
    const w = Math.max(500, root.clientWidth || 800);
    const h = 100;
    const m = { top: 36, right: 32, bottom: 28, left: 32 };
    const iw = w - m.left - m.right;

    const refs = [100, 250, 500];
    const domainMax = Math.max(carKm * 1.5, 550);
    const x = d3.scaleLinear().domain([0, domainMax]).range([0, iw]);

    const svg = d3
      .select("#a3-q4-chart")
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("width", "100%")
      .attr("height", h);
    const g = svg
      .append("g")
      .attr("transform", `translate(${m.left},${m.top})`);

    // track
    g.append("rect")
      .attr("width", iw)
      .attr("height", 16)
      .attr("rx", 8)
      .attr("fill", "#1e2130");

    // user bar
    g.append("rect")
      .attr("width", 0)
      .attr("height", 16)
      .attr("rx", 8)
      .attr("fill", color)
      .attr("opacity", 0.85)
      .transition()
      .duration(400)
      .attr("width", Math.min(x(carKm), iw));

    // reference ticks
    refs.forEach((km) => {
      if (x(km) > iw) return;
      g.append("line")
        .attr("x1", x(km))
        .attr("x2", x(km))
        .attr("y1", -4)
        .attr("y2", 22)
        .attr("stroke", "#3a4050")
        .attr("stroke-width", 1);
      g.append("text")
        .attr("x", x(km))
        .attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("fill", "#576070")
        .attr("font-size", "10px")
        .text(`${d3.format("~s")(km)} km`);
    });

    // user label
    const ux = Math.min(x(carKm), iw);
    g.append("text")
      .attr("x", ux)
      .attr("y", 32)
      .attr("text-anchor", ux > iw * 0.75 ? "end" : "middle")
      .attr("fill", color)
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .text(`you: ${d3.format(",.0f")(carKm)} km`);
  }

  update();
}

function runQ4Global(): void {
  const mount = "#a3-q4-global";
  if (!document.querySelector(mount)) return;

  // assumptions
  const DAU = 100_000_000; // ChatGPT daily active users
  const queriesDay = 5;
  const co2PerQ = 0.4; // g, short query
  const CAR_G_PER_KM = 150;

  const dailyG = DAU * queriesDay * co2PerQ;
  const annualG = dailyG * 365;
  const annualKm = annualG / CAR_G_PER_KM;

  // cosmic reference (km)
  const SUN = 149_600_000;

  const sunTimes = (annualKm / SUN).toFixed(1);

  d3.select(mount).html(`
    <p class="text-xs uppercase tracking-wider text-white mb-1">At global scale</p>
    <p class="text-lg text-gray-500 mb-4">
      <span class="text-white font-semibold">100M</span> daily users · <span class="text-soft font-semibold">5</span> short queries/day · <span class="text-soft font-semibold">0.4g</span> CO₂e per query (ChatGPT)
    </p>
    <div class="flex flex-wrap gap-10 mb-6">
      <div>
        <p class="text-sm text-soft mb-1">Annual CO₂e</p>
        <p class="text-3xl font-bold text-soft">${d3.format(",.0f")(
          annualG / 1e9
        )} M tonnes</p>
      </div>
      <div>
        <p class="text-sm text-soft mb-1">≈ driving a car</p>
        <p class="text-3xl font-bold" style="color:#ff6b9d">${d3.format(",.0f")(
          annualKm / 1e6
        )} M km</p>
      </div>
      <div class="self-end pb-0.5"> =
        <p class="text-3xl font-bold" style="color:#ff6b9d""> Earth ↔︎ Sun<span class="text-soft font-semibold"> × ${sunTimes}</span></p>
      </div>
    </div>
    <div id="a3-q4-three-canvas" style="width:100%;border-radius:12px;overflow:hidden;"></div>
    <p class="text-[10px] text-dim mt-2">drag to rotate</p>
  `);

  const canvasContainer = document.getElementById("a3-q4-three-canvas")!;
  initGlobalScene(canvasContainer, annualKm);
}
