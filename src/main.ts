import { renderNav } from "./lib/nav";
import { renderA3Main } from "./pages/a3/page";
import { runA3Explore } from "./pages/a3/explore";
import { runA3Charts } from "./pages/a3/a3-charts";
import { renderRawDataMain } from "./pages/rawdata/page";
import { renderIteration1Main } from "./pages/iteration1/page";
import { runExp01 } from "./pages/iteration1/exp01";
import { runExp02 } from "./pages/iteration1/exp02";

function getView(): "iteration1" | "a3" | "rawdata" {
  const v = new URLSearchParams(window.location.search).get("view");
  if (v === "a3") return "a3";
  if (v === "rawdata") return "rawdata";
  return "iteration1";
}

const root = document.getElementById("root");
if (!root) throw new Error("#root missing");

const view = getView();

if (view === "a3") {
  document.title = "Exploratory Data Analysis · 511 viz";
  root.innerHTML = renderNav("a3") + renderA3Main();
  void runA3Charts();
} else if (view === "rawdata") {
  document.title = "Raw Data · 511 viz";
  root.innerHTML = renderNav("rawdata") + renderRawDataMain();
  runA3Explore();
} else {
  document.title = "Interactions · 511 viz";
  root.innerHTML = renderNav("iteration1") + renderIteration1Main();
  void runExp01();
  void runExp02();
}
