/** D3 is provided globally via index.html (d3.v7). */

type RowQ1 = { activity: string; mid: number; isAi: boolean; min: number; max: number; isRef?: boolean };

export async function runA3Charts(): Promise<void> {
  await Promise.all([runQ1Comparative(), runQ2Datacenter(), runQ3Correlation()]);
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
      { activity: "Charge smartphone (full)", mid: 8.22, isAi: false, min: 8.22, max: 8.22, isRef: true },
      { activity: "Boil water (1 cup)", mid: 21, isAi: false, min: 21, max: 21, isRef: true },
      { activity: "Drive 1 km (petrol car)", mid: 150, isAi: false, min: 120, max: 180, isRef: true },
    ];
    const data = [...raw.filter((r): r is RowQ1 => r != null && r.activity !== "Bitcoin transaction"), ...refs].sort((a, b) => b.mid - a.mid);

    const margin = { top: 16, right: 100, bottom: 48, left: 200 };
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

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLog().domain([d3.min(data, (d) => d.mid)! * 0.7, d3.max(data, (d) => d.mid)! * 1.15]).range([0, width]).nice();

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.activity))
      .range([0, innerH])
      .paddingInner(0.35);

    const tickVals = [1e-4, 1e-3, 1e-2, 1e-1, 1, 10, 100, 1e3, 1e6];

    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(x).tickValues(tickVals).tickSize(-innerH).tickFormat(() => ""))
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
          .tickFormat((v) => `${d3.format("~s")(+v)} g`),
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
      .attr("fill", (d) => (d.isRef ? "#8b95a8" : d.isAi ? "#ff6b9d" : "#a8edea"))
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

    const legend = svg.append("g").attr("transform", `translate(${margin.left}, 4)`);
    legend.append("rect").attr("width", 10).attr("height", 10).attr("rx", 2).attr("fill", "#ff6b9d");
    legend.append("text").attr("x", 16).attr("y", 9).attr("fill", "#576070").attr("font-size", "11px").text("AI-related");
    legend.append("rect").attr("x", 110).attr("width", 10).attr("height", 10).attr("rx", 2).attr("fill", "#a8edea");
    legend.append("text").attr("x", 126).attr("y", 9).attr("fill", "#576070").attr("font-size", "11px").text("Other activities");
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
    legend.append("text").attr("x", 270).attr("y", 9).attr("fill", "#576070").attr("font-size", "11px").text("Human scale reference");
  } catch (e) {
    console.error(e);
    d3.select(mount).append("p").attr("class", "text-muted text-sm").text("Could not load 4a.csv.");
  }
}

async function runQ2Datacenter(): Promise<void> {
  const lineMount = "#a3-q2-line";
  const barMount = "#a3-q2-regions";
  if (!document.querySelector(lineMount) || !document.querySelector(barMount)) return;
  d3.select(lineMount).html("");
  d3.select(barMount).html("");

  try {
    const rows2a = await d3.csv("data/part2/2a.csv", (d) => ({
      year: +String(d.Year),
      twh: +String(d.Total_TWh),
    }));

    const series = rows2a.filter((r) => Number.isFinite(r.year) && Number.isFinite(r.twh)).sort((a, b) => a.year - b.year);

    const lineRoot = document.querySelector(lineMount)!;
    const lw = Math.max(520, lineRoot.clientWidth || 900);
    const margin = { top: 24, right: 28, bottom: 44, left: 52 };
    const lh = 240;
    const innerW = lw - margin.left - margin.right;
    const innerH = lh - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain(d3.extent(series, (d) => d.year) as [number, number])
      .range([0, innerW])
      .nice();

    const y = d3
      .scaleLinear()
      .domain([0, (d3.max(series, (d) => d.twh) ?? 1) * 1.08])
      .range([innerH, 0])
      .nice();

    const line = d3
      .line<{ year: number; twh: number }>()
      .x((d) => x(d.year))
      .y((d) => y(d.twh))
      .curve(d3.curveMonotoneX);

    const svgL = d3
      .select(lineMount)
      .append("svg")
      .attr("viewBox", `0 0 ${lw} ${lh}`)
      .attr("width", "100%")
      .attr("height", lh);

    const gL = svgL.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    gL.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(() => "").ticks(5))
      .selectAll("line")
      .attr("stroke", "#1e2130")
      .attr("stroke-dasharray", "3 4");

    gL.append("path")
      .datum(series)
      .attr("fill", "none")
      .attr("stroke", "#a8edea")
      .attr("stroke-width", 2.5)
      .attr("d", line);

    gL.selectAll("circle.pt")
      .data(series)
      .join("circle")
      .attr("class", "pt")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.twh))
      .attr("r", 5)
      .attr("fill", "#0f1117")
      .attr("stroke", "#fed6e3")
      .attr("stroke-width", 2);

    gL.selectAll("text.lbl")
      .data(series)
      .join("text")
      .attr("class", "lbl")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.twh) - 12)
      .attr("text-anchor", "middle")
      .attr("fill", "#8b95a8")
      .attr("font-size", "10px")
      .text((d) => `${d.twh} TWh`);

    gL.append("g").attr("class", "axis").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(5));

    gL.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat((d) => `${d} TWh`));

    gL.append("text")
      .attr("x", innerW / 2)
      .attr("y", innerH + 36)
      .attr("text-anchor", "middle")
      .attr("fill", "#3a4050")
      .attr("font-size", "11px")
      .text("Year (global data-center electricity, 2a Total_TWh)");

    const rawB = await d3.csv("data/part2/2b.csv");
    const regions = ["United States", "Europe", "China", "Asia Pacific"];
    const years = [
      { key: "Elec_2020_TWh", y: 2020 },
      { key: "Elec_2023_TWh", y: 2023 },
      { key: "Elec_2024_TWh", y: 2024 },
      { key: "Elec_2030_TWh", y: 2030 },
    ] as const;

    type Cell = { region: string; year: number; twh: number };
    const cells: Cell[] = [];
    for (const r of rawB) {
      const name = r.Region ?? "";
      if (!regions.includes(name)) continue;
      for (const col of years) {
        const v = +String(r[col.key] ?? "");
        if (Number.isFinite(v)) cells.push({ region: name, year: col.y, twh: v });
      }
    }

    const barRoot = document.querySelector(barMount)!;
    const bw = Math.max(520, barRoot.clientWidth || 900);
    const mb = { top: 20, right: 20, bottom: 56, left: 44 };
    const bh = 320;
    const biw = bw - mb.left - mb.right;
    const bih = bh - mb.top - mb.bottom;

    const x0 = d3
      .scaleBand<number>()
      .domain(years.map((c) => c.y))
      .range([0, biw])
      .padding(0.22);

    const x1 = d3
      .scaleBand<string>()
      .domain(regions)
      .range([0, x0.bandwidth()])
      .padding(0.12);

    const yb = d3
      .scaleLinear()
      .domain([0, d3.max(cells, (d) => d.twh)! * 1.05])
      .range([bih, 0])
      .nice();

    const color = d3
      .scaleOrdinal<string, string>()
      .domain(regions)
      .range(["#7eb8da", "#a8edea", "#fed6e3", "#c4b5fd"]);

    const svgB = d3
      .select(barMount)
      .append("svg")
      .attr("viewBox", `0 0 ${bw} ${bh}`)
      .attr("width", "100%")
      .attr("height", bh);

    const gB = svgB.append("g").attr("transform", `translate(${mb.left},${mb.top})`);

    gB.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yb).tickSize(-biw).tickFormat(() => "").ticks(5))
      .selectAll("line")
      .attr("stroke", "#1e2130")
      .attr("stroke-dasharray", "3 4");

    const yearGroups = gB
      .selectAll<SVGGElement, (typeof years)[number]>("g.year")
      .data(years)
      .join("g")
      .attr("class", "year")
      .attr("transform", (d) => `translate(${x0(d.y) ?? 0},0)`);

    yearGroups.each(function (yearCol) {
      const gYear = d3.select(this);
      const yr = yearCol.y;
      regions.forEach((region) => {
        const twh = cells.find((c) => c.region === region && c.year === yr)?.twh ?? 0;
        gYear
          .append("rect")
          .attr("x", x1(region) ?? 0)
          .attr("y", yb(twh))
          .attr("width", x1.bandwidth())
          .attr("height", bih - yb(twh))
          .attr("fill", color(region))
          .attr("opacity", 0.92)
          .append("title")
          .text(`${region} · ${yr}: ${twh} TWh`);
      });
    });

    gB.append("g").attr("class", "axis").attr("transform", `translate(0,${bih})`).call(d3.axisBottom(x0).tickFormat(d3.format("d")));

    gB.append("g").attr("class", "axis").call(d3.axisLeft(yb).ticks(5).tickFormat((d) => `${d}`));

    gB.append("text")
      .attr("x", biw / 2)
      .attr("y", bih + 42)
      .attr("text-anchor", "middle")
      .attr("fill", "#3a4050")
      .attr("font-size", "11px")
      .text("Electricity (TWh) by region — 2b (selected regions)");

    const leg = svgB.append("g").attr("transform", `translate(${mb.left}, ${bh - 18})`);
    regions.forEach((r, i) => {
      const gx = i * 118;
      leg.append("rect").attr("x", gx).attr("width", 10).attr("height", 10).attr("rx", 2).attr("fill", color(r));
      leg.append("text").attr("x", gx + 14).attr("y", 9).attr("fill", "#576070").attr("font-size", "10px").text(r);
    });
  } catch (e) {
    console.error(e);
    d3.select(lineMount).append("p").attr("class", "text-muted text-sm").text("Could not load 2a/2b.");
  }
}

type PointQ3 = { model: string; year: number; params: number; co2: number };

async function runQ3Correlation(): Promise<void> {
  const mount = "#a3-q3";
  const root = document.querySelector(mount);
  if (!root) return;
  d3.select(mount).html("");

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

    const w = Math.max(640, Math.min(920, root.clientWidth || 900));
    const h = 400;
    const margin = { top: 20, right: 24, bottom: 52, left: 64 };
    const iw = w - margin.left - margin.right;
    const ih = h - margin.top - margin.bottom;

    const x = d3
      .scaleLog()
      .domain([d3.min(data, (d) => d.params)! * 0.8, d3.max(data, (d) => d.params)! * 1.2])
      .range([0, iw])
      .nice();

    const y = d3
      .scaleLog()
      .domain([d3.min(data, (d) => d.co2)! * 0.75, d3.max(data, (d) => d.co2)! * 1.25])
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
      .attr("height", h);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).tickSize(-iw).ticks(8, "~s").tickFormat(() => ""))
      .selectAll("line")
      .attr("stroke", "#1e2130")
      .attr("stroke-dasharray", "3 4");

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${ih})`)
      .call(d3.axisBottom(x).ticks(7, "~s"))
      .call((sel) => sel.append("text").attr("x", iw / 2).attr("y", 40).attr("fill", "#3a4050").attr("font-size", "11px").attr("text-anchor", "middle").text("Parameters (log)"));

    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(8, "~s"))
      .call((sel) =>
        sel
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -ih / 2)
          .attr("y", -48)
          .attr("fill", "#3a4050")
          .attr("font-size", "11px")
          .attr("text-anchor", "middle")
          .text("Training CO₂e (kg, log)"),
      );

    g.selectAll<SVGCircleElement, PointQ3>("circle.dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => x(d.params))
      .attr("cy", (d) => y(d.co2))
      .attr("r", 3.5)
      .attr("fill", (d) => color(d.year))
      .attr("stroke", "#0f1117")
      .attr("stroke-width", 0.6)
      .attr("opacity", 0.72)
      .append("title")
      .text(
        (d) =>
          `${d.model}\n${d.year} · ${d3.format(".3~s")(d.params)} params\n${d3.format(".3~s")(d.co2)} kg CO₂e`,
      );

    const legendW = 180;
    const legendH = 12;
    const lg = svg.append("g").attr("transform", `translate(${w - margin.right - legendW}, 8)`);
    const defs = svg.append("defs");
    const gradId = "a3-q3-grad";
    const grad = defs.append("linearGradient").attr("id", gradId).attr("x1", "0%").attr("x2", "100%");
    grad.append("stop").attr("offset", "0%").attr("stop-color", d3.interpolateViridis(0));
    grad.append("stop").attr("offset", "100%").attr("stop-color", d3.interpolateViridis(1));
    lg.append("rect").attr("width", legendW).attr("height", legendH).attr("rx", 4).attr("fill", `url(#${gradId})`);
    lg.append("text").attr("x", 0).attr("y", -6).attr("fill", "#576070").attr("font-size", "10px").text("Year");
    lg.append("text").attr("x", 0).attr("y", legendH + 14).attr("fill", "#576070").attr("font-size", "9px").text("2012");
    lg.append("text").attr("x", legendW).attr("y", legendH + 14).attr("fill", "#576070").attr("font-size", "9px").attr("text-anchor", "end").text("2025");
  } catch (e) {
    console.error(e);
    d3.select(mount).append("p").attr("class", "text-muted text-sm").text("Could not load 3a.csv.");
  }
}

function runQ4Calculator(): void {
  if (!document.querySelector("#a3-q4-result")) return;

  const CO2_G: Record<string, Record<string, number>> = {
    chatgpt: { short: 0.4,  medium: 1.5,  long: 3.0  },
    gemini:  { short: 0.03, medium: 0.15, long: 0.3  },
    claude:  { short: 0.3,  medium: 1.2,  long: 2.5  },
  };
  const CAR_G_PER_KM = 150;

  const TOOL_COLOR: Record<string, string> = {
    chatgpt: "#ff6b9d",
    gemini:  "#a8edea",
    claude:  "#c4b5fd",
  };

  const state = { tool: "chatgpt", len: "medium", freq: 10 };

  function setActive(selector: string, activeDataAttr: string, value: string, color: string) {
    document.querySelectorAll<HTMLButtonElement>(selector).forEach(btn => {
      const isActive = btn.dataset[activeDataAttr] === value;
      btn.style.background = isActive ? color : "";
      btn.style.color = isActive ? "#0f1117" : "";
      btn.style.borderColor = isActive ? color : "";
    });
  }

  document.querySelectorAll<HTMLButtonElement>(".q4-tool-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.tool = btn.dataset.tool!;
      setActive(".q4-tool-btn", "tool", state.tool, TOOL_COLOR[state.tool]);
      update();
    });
  });

  document.querySelectorAll<HTMLButtonElement>(".q4-len-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.len = btn.dataset.len!;
      setActive(".q4-len-btn", "len", state.len, TOOL_COLOR[state.tool]);
      update();
    });
  });

  const freqInput = document.querySelector<HTMLInputElement>("#a3-q4-freq");
  const freqVal   = document.querySelector<HTMLElement>("#a3-q4-freq-val");
  freqInput?.addEventListener("input", () => {
    state.freq = +(freqInput.value);
    if (freqVal) freqVal.textContent = String(state.freq);
    update();
  });

  function update() {
    const color = TOOL_COLOR[state.tool];
    setActive(".q4-tool-btn", "tool", state.tool, color);
    setActive(".q4-len-btn",  "len",  state.len,  color);

    const co2PerQuery = CO2_G[state.tool]?.[state.len] ?? 1;
    const annualG   = co2PerQuery * state.freq * 365;
    const annualKg  = annualG / 1000;
    const carKm     = annualG / CAR_G_PER_KM;

    const kgLabel = annualKg < 1
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
          <p class="text-4xl font-bold text-soft tabular-nums">${d3.format(",.0f")(carKm)} km</p>
        </div>
        <p class="text-xs text-dim self-end pb-1">
          ${d3.format(".3~g")(co2PerQuery)} g/query × ${state.freq}/day × 365 days
        </p>
      </div>
    `);

    drawBar(carKm, color);
  }

  function drawBar(carKm: number, color: string) {
    d3.select("#a3-q4-chart").html("");
    const root = document.querySelector<HTMLElement>("#a3-q4-chart")!;
    const w  = Math.max(500, root.clientWidth || 800);
    const h  = 100;
    const m  = { top: 36, right: 32, bottom: 28, left: 32 };
    const iw = w - m.left - m.right;

    const refs = [100, 500, 1000, 5000, 15000];
    const domainMax = Math.max(carKm * 1.5, refs[refs.length - 1] * 1.1);
    const x = d3.scaleLinear().domain([0, domainMax]).range([0, iw]);

    const svg = d3.select("#a3-q4-chart").append("svg")
      .attr("viewBox", `0 0 ${w} ${h}`)
      .attr("width", "100%")
      .attr("height", h);
    const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

    // track
    g.append("rect").attr("width", iw).attr("height", 16).attr("rx", 8).attr("fill", "#1e2130");

    // user bar
    g.append("rect")
      .attr("width", 0).attr("height", 16).attr("rx", 8)
      .attr("fill", color).attr("opacity", 0.85)
      .transition().duration(400)
      .attr("width", Math.min(x(carKm), iw));

    // reference ticks
    refs.forEach(km => {
      if (x(km) > iw) return;
      g.append("line")
        .attr("x1", x(km)).attr("x2", x(km))
        .attr("y1", -4).attr("y2", 22)
        .attr("stroke", "#3a4050").attr("stroke-width", 1);
      g.append("text")
        .attr("x", x(km)).attr("y", -8)
        .attr("text-anchor", "middle")
        .attr("fill", "#576070").attr("font-size", "10px")
        .text(`${d3.format("~s")(km)} km`);
    });

    // user label
    const ux = Math.min(x(carKm), iw);
    g.append("text")
      .attr("x", ux).attr("y", 32)
      .attr("text-anchor", ux > iw * 0.75 ? "end" : "middle")
      .attr("fill", color).attr("font-size", "11px").attr("font-weight", "600")
      .text(`you: ${d3.format(",.0f")(carKm)} km`);
  }

  update();
}

function runQ4Global(): void {
  const mount = "#a3-q4-global";
  if (!document.querySelector(mount)) return;

  // assumptions
  const DAU        = 100_000_000;   // ChatGPT daily active users
  const queriesDay = 5;
  const co2PerQ    = 0.4;           // g, short query
  const CAR_G_PER_KM = 150;

  const dailyG   = DAU * queriesDay * co2PerQ;
  const annualG  = dailyG * 365;
  const annualKm = annualG / CAR_G_PER_KM;

  // cosmic references (km)
  const MOON  = 384_400;
  const SUN   = 149_600_000;
  const MARS  = 225_000_000;

  const sunTimes  = (annualKm / SUN).toFixed(1);

  const root = document.querySelector<HTMLElement>(mount)!;
  const w    = Math.max(500, root.clientWidth || 800);
  const m    = { top: 28, right: 24, bottom: 28, left: 24 };
  const iw   = w - m.left - m.right;
  const h    = 110;

  // header
  d3.select(mount).html(`
    <p class="text-xs uppercase tracking-wider text-dim mb-1">At global scale</p>
    <p class="text-xs text-dim mb-4">
      100M daily users · 5 short queries/day · 0.4 g CO₂e per query (ChatGPT)
    </p>
    <div class="flex flex-wrap gap-10 mb-6">
      <div>
        <p class="text-xs text-dim mb-1">Annual CO₂e</p>
        <p class="text-3xl font-bold text-soft">${d3.format(",.0f")(annualG / 1e9)} M tonnes</p>
      </div>
      <div>
        <p class="text-xs text-dim mb-1">≈ driving a car</p>
        <p class="text-3xl font-bold" style="color:#ff6b9d">${d3.format(",.0f")(annualKm / 1e6)} M km</p>
      </div>
      <div class="self-end pb-0.5">
        <p class="text-sm text-muted">= Earth → Sun × <span class="text-soft font-semibold">${sunTimes}</span></p>
      </div>
    </div>
    <div id="a3-q4-global-chart"></div>
  `);

  // cosmic ruler
  const domainMax = MARS * 1.25;
  const x = d3.scaleLinear().domain([0, domainMax]).range([0, iw]);

  const svg = d3.select("#a3-q4-global-chart").append("svg")
    .attr("viewBox", `0 0 ${w} ${h}`)
    .attr("width", "100%")
    .attr("height", h);
  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  // track
  g.append("rect").attr("width", iw).attr("height", 14).attr("rx", 7).attr("fill", "#1e2130");

  // global bar
  g.append("rect")
    .attr("width", 0).attr("height", 14).attr("rx", 7)
    .attr("fill", "#ff6b9d").attr("opacity", 0.85)
    .transition().duration(600)
    .attr("width", Math.min(x(annualKm), iw));

  // cosmic reference ticks
  const cosmicRefs = [
    { km: MOON,  label: "Moon" },
    { km: SUN,   label: "Earth → Sun" },
    { km: MARS,  label: "Earth → Mars" },
  ];
  cosmicRefs.forEach(ref => {
    const px = x(ref.km);
    if (px > iw) return;
    g.append("line")
      .attr("x1", px).attr("x2", px)
      .attr("y1", -6).attr("y2", 20)
      .attr("stroke", "#3a4050").attr("stroke-width", 1);
    g.append("text")
      .attr("x", px).attr("y", -10)
      .attr("text-anchor", "middle")
      .attr("fill", "#576070").attr("font-size", "10px")
      .text(ref.label);
  });

  // global label
  const gx = Math.min(x(annualKm), iw);
  g.append("text")
    .attr("x", gx).attr("y", 32)
    .attr("text-anchor", gx > iw * 0.75 ? "end" : "middle")
    .attr("fill", "#ff6b9d").attr("font-size", "11px").attr("font-weight", "600")
    .text(`${d3.format(",.0f")(annualKm / 1e6)}M km/yr`);
}
