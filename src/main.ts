import { renderNav } from "./lib/nav";
import { renderA3Main } from "./pages/a3/page";
import { runA3Explore } from "./pages/a3/explore";
import { runA3Charts } from "./pages/a3/a3-charts";
import { renderFinalMain } from "./pages/final/page";
import { runFinalCharts } from "./pages/final/final-charts";
import { renderRawDataMain } from "./pages/rawdata/page";
import { renderIteration1Main } from "./pages/iteration1/page";
import { runExp01 } from "./pages/iteration1/exp01";
import { runExp02 } from "./pages/iteration1/exp02";

function getView(): "iteration1" | "a3" | "final" | "rawdata" {
  const v = new URLSearchParams(window.location.search).get("view");
  if (v === "a3") return "a3";
  if (v === "final") return "final";
  if (v === "rawdata") return "rawdata";
  return "iteration1";
}

const root = document.getElementById("root");
if (!root) throw new Error("#root missing");

const ROOT_CLASS_DEFAULT =
  "flex flex-col items-center px-5 pt-24 pb-16 w-full min-h-screen";
const ROOT_CLASS_FINAL =
  "flex flex-col items-center px-5 pt-0 pb-16 w-full min-h-screen";

const view = getView();

if (view === "a3") {
  document.title = "Exploratory Data Analysis · 511 viz";
  root.className = ROOT_CLASS_DEFAULT;
  root.innerHTML = renderNav("a3") + renderA3Main();
  void runA3Charts();
} else if (view === "final") {
  document.title = "Final · 511 viz";
  root.className = ROOT_CLASS_FINAL;
  root.innerHTML = renderNav("final") + renderFinalMain();
  void runFinalCharts();
} else if (view === "rawdata") {
  document.title = "Raw Data · 511 viz";
  root.className = ROOT_CLASS_DEFAULT;
  root.innerHTML = renderNav("rawdata") + renderRawDataMain();
  runA3Explore();
} else {
  document.title = "Interactions · 511 viz";
  root.className = ROOT_CLASS_DEFAULT;
  root.innerHTML = renderNav("iteration1") + renderIteration1Main();
  void runExp01();
  void runExp02();
}
