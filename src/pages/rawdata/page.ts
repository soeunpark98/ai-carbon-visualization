export function renderRawDataMain(): string {
  return `
  <header class="text-center mb-14 max-w-3xl">
    <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">A3: Exploratory Data Analysis</p>
    <h1 class="text-[2rem] font-bold tracking-tight bg-gradient-to-br from-[#a8edea] to-[#fed6e3] bg-clip-text text-transparent">Raw Data</h1>
    <p class="text-sm text-muted mt-4 leading-relaxed max-w-2xl mx-auto">
      Preview the source datasets used across all visualizations.
    </p>
  </header>

  <div class="w-full max-w-[1100px]">
    <section class="w-full space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end gap-4 pb-4 border-b border-surface">
        <div class="flex-1 min-w-0">
          <label for="a3-dataset" class="block text-xs uppercase tracking-wider text-dim mb-2">Dataset</label>
          <select id="a3-dataset"
            class="w-full max-w-xl bg-surface border border-rim rounded-lg px-3 py-2.5 text-sm text-body focus:outline-none focus:ring-2 focus:ring-[#a8edea]/40">
          </select>
        </div>
        <div class="text-sm">
          <span id="a3-status" class="text-muted">Loading…</span>
          <span class="text-rim mx-2">·</span>
          <span id="a3-meta" class="text-soft"></span>
        </div>
      </div>
      <div id="a3-table-wrap" class="min-h-[120px]"></div>
    </section>
  </div>`;
}
