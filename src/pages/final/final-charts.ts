/** D3 is provided globally via index.html (d3.v7). */
import { initGlobalScene } from "../a3/global-scene";

type RowQ1 = {
  activity: string;
  mid: number;
  isAi: boolean;
  min: number;
  max: number;
  isRef?: boolean;
};

export async function runFinalCharts(): Promise<void> {
  await Promise.all([
    runQ1Comparative(),
    runQ2Datacenter(),
    runQ3Correlation(),
  ]);
  runQ4Calculator();
  runQ4Global();
}

async function runQ1Comparative(): Promise<void> {
  const mount = "#final-q1";
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
  const lineMount = "#final-q2-line";
  const barMount = "#final-q2-regions";
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
      .q2dc-card{background:#0f1117;border:0.5px solid #2e3448;border-radius:12px;padding:1.5rem 1.25rem;margin-bottom:1.5rem}
      .q2dc-row-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem}
      .q2dc-sec-title{font-size:16px;font-weight:500;color:#fffff}
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
        36, 50, 96, 104, 116, 356, 360, 392, 410, 418, 458, 496, 524, 554, 586,
        598, 608, 702, 704, 764,
      ],
    },
  };
  const DATA: Record<string, Record<number, number>> = {
    us: { 2020: 108, 2023: 154, 2024: 183, 2030: 426 },
    eu: { 2020: 57, 2023: 66, 2024: 68, 2030: 113 },
    cn: { 2020: 62, 2023: 84, 2024: 102, 2030: 277 },
    ap: { 2020: 93, 2023: 128, 2024: 150, 2030: 378 },
  };
  const GLOBAL_COLOR = "#e879f9";
  const GLOBAL_TREND: { x: number; y: number }[] = [
    { x: 2020, y: 269 },
    { x: 2024, y: 416 },
    { x: 2030, y: 946 },
  ];
  const MAP_FILL_LOW = "#0c0e14";
  const MAP_FILL_HIGH = "#b8fff8";
  const MAP_COLOR_YEAR = 2030;
  const MAP_MAX_TWH = Math.max(
    ...Object.values(DATA).flatMap((byYear) => Object.values(byYear))
  );
  /** EU TWh is lower than US/AP — floor keeps it readable on the shared scale. */
  const MAP_VISUAL_FLOOR: Partial<Record<string, number>> = { eu: 0.5 };
  const ID_TO_RK: Record<number, string> = {};
  Object.entries(REGIONS).forEach(([k, v]) =>
    v.ids.forEach((id) => {
      ID_TO_RK[id] = k;
    })
  );

  /** Mainland bounds — overseas territories (e.g. French Guiana, Falklands) stay uncolored. */
  const REGION_MAINLAND: Record<
    string,
    { minLon: number; maxLon: number; minLat: number; maxLat: number }
  > = {
    us: { minLon: -170, maxLon: -66, minLat: 18, maxLat: 72 },
    eu: { minLon: -12, maxLon: 42, minLat: 35, maxLat: 72 },
    cn: { minLon: 73, maxLon: 135, minLat: 18, maxLat: 54 },
    ap: { minLon: 60, maxLon: 180, minLat: -50, maxLat: 55 },
  };

  function inMainland(
    lon: number,
    lat: number,
    box: { minLon: number; maxLon: number; minLat: number; maxLat: number }
  ) {
    return (
      lon >= box.minLon &&
      lon <= box.maxLon &&
      lat >= box.minLat &&
      lat <= box.maxLat
    );
  }

  function explodeMapFeatures(features: any[]): any[] {
    const out: any[] = [];
    for (const f of features) {
      const g = f.geometry;
      if (!g) continue;
      if (g.type === "MultiPolygon") {
        for (const coords of g.coordinates) {
          out.push({
            ...f,
            geometry: { type: "Polygon", coordinates: coords },
          });
        }
      } else {
        out.push(f);
      }
    }
    return out;
  }

  function regionForFeature(f: any): string | undefined {
    const rk = ID_TO_RK[+f.id];
    if (!rk) return undefined;
    const box = REGION_MAINLAND[rk];
    if (!box) return rk;
    const [lon, lat] = d3.geoCentroid(f);
    if (!inMainland(lon, lat, box)) return undefined;
    return rk;
  }

  function getMapFeatures(): any[] {
    const topo = (window as any).topojson;
    const countries = topo.feature(worldData, worldData.objects.countries);
    return explodeMapFeatures((countries as any).features);
  }

  function computeLabelCentroids(
    mapFeatures: any[],
    proj: (coords: [number, number]) => [number, number] | null
  ): Record<string, [number, number]> {
    const pts: Record<string, [number, number][]> = {};
    for (const f of mapFeatures) {
      const rk = regionForFeature(f);
      if (!rk) continue;
      const p = proj(d3.geoCentroid(f));
      if (!p) continue;
      (pts[rk] ||= []).push(p);
    }
    const out: Record<string, [number, number]> = {};
    Object.entries(pts).forEach(([rk, list]) => {
      out[rk] = [d3.mean(list, (p) => p[0])!, d3.mean(list, (p) => p[1])!];
    });
    return out;
  }

  // ── State ──────────────────────────────────────────────────────────────
  let selYear = 2030;
  const dimmed: Record<string, boolean> = {};
  let dimmedGlobal = false;
  let trendChartInst: any = null;
  let compareChartInst: any = null;
  let worldData: any = null;
  let labelCentroids: Record<string, [number, number]> = {};

  // ── HTML ───────────────────────────────────────────────────────────────
  root.innerHTML = `
    <div class="q2dc-card" style="position:relative">
      <div class="q2dc-row-header">
        <span class="q2dc-sec-title">2-1. Regional Data Center Electricity Consumption Map</span>
        <div class="q2dc-ytabs" id="q2dc-ytabs">
          <button class="q2dc-ytab" data-year="2020">2020</button>
          <button class="q2dc-ytab" data-year="2023">2023</button>
          <button class="q2dc-ytab" data-year="2024">2024</button>
          <button class="q2dc-ytab on" data-year="2030">2030 proj.</button>
        </div>
      </div>
      <div id="q2dc-map-wrap" style="position:relative;width:100%;background:#1e2130;border-radius:8px;overflow:hidden"></div>
      <div id="q2dc-map-tt" class="q2dc-tt"></div>
    </div>
    <div class="q2dc-card" style="position:relative">
      <div class="q2dc-row-header">
        <span class="q2dc-sec-title">2-2. Global and Regional Data Center Electricity Consumption Trends</span>
      </div>
      <p class="text-xs text-dim mb-2 mt-1">Trend</p>
      <div style="position:relative;height:220px">
        <canvas id="q2dc-trend-chart"></canvas>
      </div>
      <div class="q2dc-legend-row" id="q2dc-chart-legend"></div>
    </div>
    <div class="q2dc-card" style="position:relative">
      <div class="q2dc-row-header">
        <span class="q2dc-sec-title">2-3. Regional Data Center Electricity Consumption Breakdown</span>
      </div>
      <div style="position:relative;height:220px">
        <canvas id="q2dc-compare-chart"></canvas>
      </div>
      <div class="q2dc-legend-row" id="q2dc-chart-legend"></div>
    </div>
  `;

  // ── Helpers ────────────────────────────────────────────────────────────
  /** Map color fixed to 2030 TWh; year tabs only change labels/tooltips. */
  function getMapFill(rk: string | undefined): string {
    if (!rk || dimmed[rk]) return "#2a2f42";
    let tRaw = DATA[rk][MAP_COLOR_YEAR] / MAP_MAX_TWH;
    const floor = MAP_VISUAL_FLOOR[rk];
    if (floor != null) tRaw = Math.max(tRaw, floor);
    const gamma = rk === "eu" ? 1.8 : 1.35;
    const t = Math.pow(tRaw, gamma);
    return d3.interpolateHcl(MAP_FILL_LOW, MAP_FILL_HIGH)(t) as string;
  }

  const LABEL_FALLBACK: Record<
    string,
    (W: number, H: number) => [number, number]
  > = {
    us: (W, H) => [W * 0.22, H * 0.38],
    eu: (W, H) => [W * 0.52, H * 0.32],
    cn: (W, H) => [W * 0.74, H * 0.4],
    ap: (W, H) => [W * 0.78, H * 0.58],
  };

  function drawLabels(layer: any, W: number, H: number) {
    layer.selectAll(".rlabel").remove();
    const fs = Math.max(10, Math.round(W / 55));
    Object.entries(REGIONS).forEach(([rk]) => {
      if (dimmed[rk]) return;
      const [cx, cy] = labelCentroids[rk] ?? LABEL_FALLBACK[rk](W, H);
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
    const mapFeatures = getMapFeatures();
    labelCentroids = computeLabelCentroids(mapFeatures, proj);

    mapLayer
      .selectAll("path")
      .data(mapFeatures)
      .join("path")
      .attr("d", path as any)
      .attr("fill", (d: any) => getMapFill(regionForFeature(d)))
      .attr("stroke", "rgba(255,255,255,0.08)")
      .attr("stroke-width", 0.4)
      .style("cursor", (d: any) =>
        regionForFeature(d) ? "pointer" : "default"
      )
      .on("mousemove", (event: MouseEvent, d: any) => {
        const rk = regionForFeature(d);
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
      .attr("fill", (d: any) => getMapFill(regionForFeature(d)));
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
    const el = document.getElementById("q2dc-chart-legend");
    if (!el) return;
    el.innerHTML = "";
    const globalItem = document.createElement("div");
    globalItem.className = "q2dc-leg" + (dimmedGlobal ? " dim" : "");
    globalItem.innerHTML = `<span class="q2dc-lsq" style="background:${GLOBAL_COLOR}"></span>Global`;
    globalItem.onclick = () => {
      dimmedGlobal = !dimmedGlobal;
      buildLegend();
      rebuildCharts();
    };
    el.appendChild(globalItem);
    Object.entries(REGIONS).forEach(([k, v]) => {
      const item = document.createElement("div");
      item.className = "q2dc-leg" + (dimmed[k] ? " dim" : "");
      item.innerHTML = `<span class="q2dc-lsq" style="background:${v.color}"></span>${v.name}`;
      item.onclick = () => {
        dimmed[k] = !dimmed[k];
        buildLegend();
        updateMap();
        rebuildCharts();
      };
      el.appendChild(item);
    });
  }

  const GRID_C = "rgba(255,255,255,0.07)";
  const TEXT_C = "#576070";
  const YEARS = [2020, 2023, 2024, 2030];
  const YEAR_X_MIN = 2019.6;
  const YEAR_X_MAX = 2030.4;

  function chartXScale() {
    return {
      type: "linear" as const,
      min: YEAR_X_MIN,
      max: YEAR_X_MAX,
      grid: { color: GRID_C },
      ticks: {
        color: TEXT_C,
        font: { size: 11 },
        autoSkip: false,
        callback: (value: number | string) => {
          const y = Math.round(Number(value));
          return YEARS.includes(y) ? String(y) : "";
        },
      },
      afterBuildTicks: (axis: { ticks: { value: number }[] }) => {
        axis.ticks = YEARS.map((y) => ({ value: y }));
      },
    };
  }

  function yearFromTrendClick(els: { datasetIndex: number; index: number }[]) {
    if (!els.length || !trendChartInst) return;
    const pt =
      trendChartInst.data.datasets[els[0].datasetIndex].data[els[0].index];
    const year =
      pt && typeof pt === "object" && "x" in pt
        ? Math.round(Number(pt.x))
        : null;
    if (year != null && YEARS.includes(year)) setYear(year);
  }

  function chartTooltipOpts() {
    return {
      backgroundColor: "#0f1117",
      borderColor: GRID_C,
      borderWidth: 1,
      titleColor: "#c8cfd9",
      bodyColor: TEXT_C,
    };
  }

  function rebuildTrendChart() {
    if (trendChartInst) {
      trendChartInst.destroy();
      trendChartInst = null;
    }
    const canvas = document.getElementById(
      "q2dc-trend-chart"
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ChartJS = (window as any).Chart;
    if (!ChartJS) return;
    const ttOpts = chartTooltipOpts();
    const regionalDatasets = Object.entries(REGIONS)
      .filter(([k]) => !dimmed[k])
      .map(([k, v]) => ({
        label: v.name,
        data: YEARS.map((y) => ({ x: y, y: DATA[k][y] })),
        borderColor: v.color,
        backgroundColor: "transparent",
        borderWidth: 1.5,
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: v.color,
        order: 1,
      }));
    const globalDataset = dimmedGlobal
      ? []
      : [
          {
            label: "Global",
            data: GLOBAL_TREND,
            borderColor: GLOBAL_COLOR,
            backgroundColor: "transparent",
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: GLOBAL_COLOR,
            order: 0,
          },
        ];

    trendChartInst = new ChartJS(canvas.getContext("2d")!, {
      type: "line",
      data: { datasets: [...globalDataset, ...regionalDatasets] },
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
          x: chartXScale(),
          y: {
            grid: { color: GRID_C },
            ticks: {
              color: TEXT_C,
              font: { size: 10 },
              callback: (v: number) => v + " TWh",
            },
            min: 0,
            max: 1000,
          },
        },
        onClick(_e: any, els: any[]) {
          yearFromTrendClick(els);
        },
      },
    });
  }

  function rebuildCompareChart() {
    if (compareChartInst) {
      compareChartInst.destroy();
      compareChartInst = null;
    }
    const canvas = document.getElementById(
      "q2dc-compare-chart"
    ) as HTMLCanvasElement | null;
    if (!canvas) return;
    const ChartJS = (window as any).Chart;
    if (!ChartJS) return;
    const ttOpts = chartTooltipOpts();

    compareChartInst = new ChartJS(canvas.getContext("2d")!, {
      type: "bar",
      data: {
        labels: YEARS.map(String),
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
            min: 0,
            max: 500,
          },
        },
        onClick(_e: any, els: any[]) {
          if (els.length) setYear(YEARS[els[0].index]);
        },
      },
    });
  }

  function rebuildCharts() {
    rebuildTrendChart();
    rebuildCompareChart();
  }

  // ── Event listeners ────────────────────────────────────────────────────
  document
    .getElementById("q2dc-ytabs")
    ?.querySelectorAll<HTMLButtonElement>("[data-year]")
    .forEach((btn) =>
      btn.addEventListener("click", () => setYear(+btn.dataset.year!))
    );

  buildLegend();
  rebuildCharts();
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
  const mount = "#final-q3";
  const root = document.querySelector<HTMLElement>(mount);
  if (!root) return;
  d3.select(mount).html(`
    <div class="mb-3 flex flex-wrap items-center justify-between gap-4">
      <div class="text-xs text-dim">Scroll/drag to zoom and pan. Double-click to reset.</div>
      <span class="inline-flex items-center gap-2 text-xs text-muted">
        <span>Year</span>
        <input id="final-q3-year-slider" type="range" min="2012" max="2025" step="1" value="2025" class="w-44 accent-[#a8edea]" />
        <span id="final-q3-year-label" class="text-soft font-medium tabular-nums">2025</span>
      </span>
    </div>
    <div id="final-q3-panel-single"></div>
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

    let activeYear = 2025;
    const yearSlider = document.getElementById(
      "final-q3-year-slider"
    ) as HTMLInputElement | null;
    const yearLabel = document.getElementById("final-q3-year-label");

    const panelSingle = document.querySelector("#final-q3-panel-single");
    if (!panelSingle) return;
    const svg = d3
      .select(panelSingle)
      .append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("width", "100%")
      .attr("height", h)
      .style("border", "1px solid #2e3448")
      .style("border-radius", "10px")
      .style("background", "#0f1117");

    const chartYearTitle = svg
      .append("text")
      .attr("id", "final-q3-chart-year")
      .attr("x", w / 2)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#e8eaf0")
      .attr("font-size", "36px")
      .attr("font-weight", "600")
      .attr("font-family", "Geist, system-ui, sans-serif")
      .text(String(activeYear));

    const clipId = `final-q3-clip-${Date.now()}`;
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

    function setActiveYear(year: number) {
      activeYear = year;
      chartYearTitle.text(String(activeYear));
      if (yearLabel) yearLabel.textContent = String(activeYear);
      renderPoints();
    }

    let xCurrent = xBase.copy();
    let yCurrent = yBase.copy();
    const dotsLayer = g.append("g").attr("clip-path", `url(#${clipId})`);
    const tip = d3
      .select("body")
      .selectAll<HTMLDivElement, null>("div#final-q3-tip")
      .data([null])
      .join("div")
      .attr("id", "final-q3-tip")
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
      const filtered = data.filter((d) => d.year === activeYear);
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
        .attr("fill", "#e8eaf0")
        .attr("stroke", "#0f1117")
        .attr("stroke-width", 0.6)
        .attr("opacity", 0.85);

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
            .attr("r", 3.5)
            .attr("fill", "#e8eaf0");
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

    if (yearSlider) {
      yearSlider.addEventListener("input", () => {
        setActiveYear(+yearSlider.value);
      });
    }
  } catch (e) {
    console.error(e);
    d3.select(mount)
      .append("p")
      .attr("class", "text-muted text-sm")
      .text("Could not load 3a.csv.");
  }
}

function runQ4Calculator(): void {
  if (!document.querySelector("#final-q4-result")) return;

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

  const freqInput = document.querySelector<HTMLInputElement>("#final-q4-freq");
  const freqVal = document.querySelector<HTMLElement>("#final-q4-freq-val");
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

    d3.select("#final-q4-result").html(`
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
    d3.select("#final-q4-chart").html("");
    const root = document.querySelector<HTMLElement>("#final-q4-chart")!;
    const w = Math.max(500, root.clientWidth || 800);
    const h = 100;
    const m = { top: 36, right: 32, bottom: 28, left: 32 };
    const iw = w - m.left - m.right;

    const refs = [100, 250, 500];
    const domainMax = Math.max(carKm * 1.5, 550);
    const x = d3.scaleLinear().domain([0, domainMax]).range([0, iw]);

    const svg = d3
      .select("#final-q4-chart")
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
  const mount = "#final-q4-global";
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
    <div id="final-q4-three-canvas" style="width:100%;border-radius:12px;overflow:hidden;"></div>
    <p class="text-[10px] text-dim mt-2">drag to rotate</p>
  `);

  const canvasContainer = document.getElementById("final-q4-three-canvas")!;
  initGlobalScene(canvasContainer, annualKm);
}
