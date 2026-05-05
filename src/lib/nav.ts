export type NavKey = "iteration1" | "a3";

export function renderNav(active: NavKey): string {
  const i1 =
    active === "iteration1"
      ? "nav-active pb-0.5 inline-block"
      : "text-muted hover:text-soft transition-colors pb-0.5 border-b-2 border-transparent";
  const a3 =
    active === "a3"
      ? "nav-active pb-0.5 inline-block"
      : "text-muted hover:text-soft transition-colors pb-0.5 border-b-2 border-transparent";
  return `
  <nav class="fixed top-0 left-0 right-0 z-50 border-b border-rim bg-page/95 backdrop-blur-md">
    <div class="max-w-[1100px] mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-4">
      <a href="index.html" class="text-soft font-semibold tracking-tight hover:text-body transition-colors">HCDE 511 Skye & June</a>
      <ul class="flex items-center gap-6 text-sm">
        <li><a href="index.html" class="${i1}">Iteration 1</a></li>
        <li><a href="index.html?view=a3" class="${a3}">A3 data exploration</a></li>
      </ul>
    </div>
  </nav>`;
}
