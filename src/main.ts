import { renderNav } from "./lib/nav";
import { renderA3Main } from "./pages/a3/page";
import { runA3Explore } from "./pages/a3/explore";
import { renderIteration1Main } from "./pages/iteration1/page";
import { runExp01 } from "./pages/iteration1/exp01";
import { runExp02 } from "./pages/iteration1/exp02";

function getView(): "iteration1" | "a3" {
  const v = new URLSearchParams(window.location.search).get("view");
  return v === "a3" ? "a3" : "iteration1";
}

const root = document.getElementById("root");
if (!root) throw new Error("#root missing");

const view = getView();

if (view === "a3") {
  document.title = "A3 · Data exploration · 511 viz";
  root.innerHTML = renderNav("a3") + renderA3Main();
  runA3Explore();
} else {
  document.title = "Iteration 1 · D3 Experiments · 511 viz";
  root.innerHTML = renderNav("iteration1") + renderIteration1Main();
  void runExp01();
  void runExp02();
}
