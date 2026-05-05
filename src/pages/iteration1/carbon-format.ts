export interface CarbonMinMax {
  min: number;
  max: number;
}

function fmtComponent(v: number) {
  if (v >= 100000) return d3.format(",~g")(v);
  if (v >= 1000) return d3.format("~g")(v);
  if (v >= 1) return d3.format("~g")(v);
  if (v >= 0.01) return d3.format("~g")(v);
  return d3.format(",.5~g")(v);
}

export function displayLong(d: CarbonMinMax) {
  const lo = d.min;
  const hi = d.max;
  if (lo === hi) return fmtComponent(lo) + " g";
  return fmtComponent(lo) + "–" + fmtComponent(hi) + " g";
}

export function displayShort(d: CarbonMinMax) {
  const lo = d.min;
  const hi = d.max;
  function compact(v: number) {
    if (v >= 100000) return d3.format(".3s")(v);
    if (v >= 1000) return d3.format(".2s")(v);
    if (v >= 1) return d3.format("~g")(v);
    if (v >= 0.01) return d3.format("~g")(v);
    return d3.format(",.5~g")(v);
  }
  if (lo === hi) {
    const mid = compact(lo);
    const prefix = lo >= 10 && Math.abs(lo - 18) < 0.01 ? "~" : "";
    return prefix + mid + " g";
  }
  return compact(lo) + "–" + compact(hi) + " g";
}
