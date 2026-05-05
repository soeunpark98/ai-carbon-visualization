/** D3 is provided globally via index.html (d3.v7). */

type RowQ1 = { activity: string; mid: number; isAi: boolean; min: number; max: number };

export async function runA3Charts(): Promise<void> {
  await Promise.all([runQ1Comparative(), runQ2Datacenter(), runQ3Correlation(), runQ4Scale()]);
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
    const data = raw.filter((r): r is RowQ1 => r != null).sort((a, b) => b.mid - a.mid);

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

    const tickVals = [1e-4, 1e-3, 1e-2, 1e-1, 1, 10, 100, 1e3, 1e4, 1e5, 1e6];

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
      .attr("fill", "#1e2130");

    rows
      .append("rect")
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("rx", 4)
      .attr("fill", (d) => (d.isAi ? "#fed6e3" : "#a8edea"))
      .attr("opacity", 0.88)
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
      .attr("fill", "#c8cfd9")
      .attr("font-size", "12px")
      .text((d) => d.activity);

    rows
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => x(d.mid) + 8)
      .attr("y", y.bandwidth() / 2)
      .attr("dominant-baseline", "middle")
      .attr("fill", "#8b95a8")
      .attr("font-size", "11px")
      .text((d) => `${d3.format(",.3~g")(d.mid)} g`);

    const legend = svg.append("g").attr("transform", `translate(${margin.left}, 4)`);
    legend
      .append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", "#fed6e3");
    legend.append("text").attr("x", 16).attr("y", 9).attr("fill", "#576070").attr("font-size", "11px").text("AI-related");
    legend
      .append("rect")
      .attr("x", 110)
      .attr("width", 10)
      .attr("height", 10)
      .attr("rx", 2)
      .attr("fill", "#a8edea");
    legend.append("text").attr("x", 126).attr("y", 9).attr("fill", "#576070").attr("font-size", "11px").text("Other activities");
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

async function runQ4Scale(): Promise<void> {
  const mB = "#a3-q4b";
  const mC = "#a3-q4c";
  if (!document.querySelector(mB) || !document.querySelector(mC)) return;
  d3.select(mB).html("");
  d3.select(mC).html("");

  try {
    const rows4b = await d3.csv("data/part4/4b.csv", (d) => ({
      scenario: (d.Scenario ?? "").replace(/^"|"$/g, ""),
      tonnes: +String(d.Total_CO2e_tonnes ?? ""),
      period: (d.Period ?? "").trim(),
      carKm: +String(d.Equivalent_car_km ?? ""),
    }));

    const annual = rows4b.filter((r) => r.period === "1 year" && Number.isFinite(r.tonnes));

    const rootB = document.querySelector(mB)!;
    const wb = Math.max(400, rootB.clientWidth || 480);
    const hb = 300;
    const mb = { top: 16, right: 16, bottom: 120, left: 52 };
    const ibw = wb - mb.left - mb.right;
    const ibh = hb - mb.top - mb.bottom;

    const shortLabel = (s: string) =>
      s
        .replace(/\([^)]*\)/g, "")
        .replace(/"/g, "")
        .trim()
        .slice(0, 42);

    const x = d3
      .scaleBand()
      .domain(annual.map((d) => d.scenario))
      .range([0, ibw])
      .padding(0.28);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(annual, (d) => d.tonnes)! * 1.05])
      .range([ibh, 0])
      .nice();

    const svgB = d3
      .select(mB)
      .append("svg")
      .attr("viewBox", `0 0 ${wb} ${hb}`)
      .attr("width", "100%")
      .attr("height", hb);

    const gB = svgB.append("g").attr("transform", `translate(${mb.left},${mb.top})`);

    gB.selectAll("rect")
      .data(annual)
      .join("rect")
      .attr("x", (d) => x(d.scenario)!)
      .attr("y", (d) => y(d.tonnes))
      .attr("width", x.bandwidth())
      .attr("height", (d) => ibh - y(d.tonnes))
      .attr("rx", 4)
      .attr("fill", (d) => (d.scenario.includes("ChatGPT") ? "#fed6e3" : "#a8edea"))
      .attr("opacity", 0.9)
      .append("title")
      .text((d) => `${d.scenario}\n${d.tonnes.toLocaleString()} t CO₂e · ~${d.carKm.toLocaleString()} car-km`);

    gB.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${ibh})`)
      .call(d3.axisBottom(x).tickFormat((d) => shortLabel(String(d))))
      .selectAll("text")
      .attr("transform", "rotate(-38)")
      .style("text-anchor", "end")
      .attr("dx", "-0.35em")
      .attr("dy", "0.45em");

    gB.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat((v) => `${v}`));

    gB.append("text")
      .attr("x", -ibh / 2)
      .attr("y", -40)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("fill", "#3a4050")
      .attr("font-size", "11px")
      .text("Total CO₂e (tonnes / year)");

    const rows4c = await d3.csv("data/part4/4c.csv", (d) => ({
      tier: d.User_type ?? "",
      tool: d.AI_tool ?? "",
      km: +String(d.Equiv_car_km ?? ""),
    }));

    const tiers = ["Light user", "Medium user", "Heavy user"];
    const tools = ["Gemini", "ChatGPT"];
    const cells = rows4c.filter((r) => tiers.includes(r.tier) && tools.includes(r.tool));

    const rootC = document.querySelector(mC)!;
    const wc = Math.max(400, rootC.clientWidth || 480);
    const hc = 300;
    const mc = { top: 16, right: 16, bottom: 48, left: 48 };
    const icw = wc - mc.left - mc.right;
    const ich = hc - mc.top - mc.bottom;

    const x0 = d3.scaleBand<string>().domain(tiers).range([0, icw]).padding(0.25);
    const x1 = d3.scaleBand<string>().domain(tools).range([0, x0.bandwidth()]).padding(0.15);

    const yc = d3
      .scaleLinear()
      .domain([0, d3.max(cells, (d) => d.km)! * 1.08])
      .range([ich, 0])
      .nice();

    const svgC = d3
      .select(mC)
      .append("svg")
      .attr("viewBox", `0 0 ${wc} ${hc}`)
      .attr("width", "100%")
      .attr("height", hc);

    const gC = svgC.append("g").attr("transform", `translate(${mc.left},${mc.top})`);

    gC.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yc).tickSize(-icw).tickFormat(() => "").ticks(5))
      .selectAll("line")
      .attr("stroke", "#1e2130")
      .attr("stroke-dasharray", "3 4");

    const tg = gC
      .selectAll<SVGGElement, string>("g.tier")
      .data(tiers)
      .join("g")
      .attr("class", "tier")
      .attr("transform", (t) => `translate(${x0(t)},0)`);

    tg.selectAll<SVGRectElement, string>("rect")
      .data((tier) => tools.map((tool) => ({ tier, tool, km: cells.find((c) => c.tier === tier && c.tool === tool)?.km ?? 0 })))
      .join("rect")
      .attr("x", (d) => x1(d.tool)!)
      .attr("y", (d) => yc(d.km))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => ich - yc(d.km))
      .attr("rx", 3)
      .attr("fill", (d) => (d.tool === "ChatGPT" ? "#fed6e3" : "#a8edea"))
      .attr("opacity", 0.92);

    gC.append("g").attr("class", "axis").attr("transform", `translate(0,${ich})`).call(d3.axisBottom(x0));

    gC.append("g").attr("class", "axis").call(d3.axisLeft(yc).ticks(5).tickFormat((d) => d3.format("~s")(+d)));

    gC.append("text")
      .attr("x", -ich / 2)
      .attr("y", -36)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("fill", "#3a4050")
      .attr("font-size", "11px")
      .text("equiv. driving (km / year)");

    const leg = svgC.append("g").attr("transform", `translate(${mc.left}, ${hc - 14})`);
    leg.append("rect").attr("width", 10).attr("height", 10).attr("rx", 2).attr("fill", "#a8edea");
    leg.append("text").attr("x", 14).attr("y", 9).attr("fill", "#576070").attr("font-size", "10px").text("Gemini");
    leg.append("rect").attr("x", 72).attr("width", 10).attr("height", 10).attr("rx", 2).attr("fill", "#fed6e3");
    leg.append("text").attr("x", 86).attr("y", 9).attr("fill", "#576070").attr("font-size", "10px").text("ChatGPT");
  } catch (e) {
    console.error(e);
    d3.select(mB).append("p").attr("class", "text-muted text-sm").text("Could not load 4b.");
    d3.select(mC).append("p").attr("class", "text-muted text-sm").text("Could not load 4c.");
  }
}
