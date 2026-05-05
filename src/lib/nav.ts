export type NavKey = "iteration1" | "a3" | "rawdata";

export function renderNav(active: NavKey): string {
  function cls(key: NavKey) {
    return active === key
      ? "nav-active pb-0.5 inline-block"
      : "text-muted hover:text-soft transition-colors pb-0.5 border-b-2 border-transparent";
  }
  return `
  <nav class="fixed top-0 left-0 right-0 z-50 border-b border-rim bg-page/95 backdrop-blur-md">
    <div class="max-w-[1100px] mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-4">
      <a href="index.html" class="text-soft font-semibold tracking-tight hover:text-body transition-colors">HCDE 511 Skye & June</a>
      <ul class="flex items-center gap-6 text-sm">
        <li><a href="index.html" class="${cls("iteration1")}">Interactions (04/29)</a></li>
        <li><a href="index.html?view=a3" class="${cls("a3")}">Exploratory Data Analysis (05/05)</a></li>
        <li><a href="index.html?view=rawdata" class="${cls("rawdata")}">Raw Data</a></li>
      </ul>
    </div>
  </nav>`;
}
