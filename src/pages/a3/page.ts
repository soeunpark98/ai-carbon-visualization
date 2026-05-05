export function renderA3Main(): string {
  return `
  <header class="text-center mb-12 max-w-2xl">
    <p class="text-[11px] tracking-[0.2em] uppercase text-dim mb-3">HCDE 511 · Assignment 3</p>
    <h1 class="text-[2rem] font-bold tracking-tight bg-gradient-to-br from-[#a8edea] to-[#fed6e3] bg-clip-text text-transparent">Data exploration</h1>
    <p class="text-sm text-muted mt-4 leading-relaxed">
      Preview course CSVs: pick a dataset to inspect columns and the first rows. Use this as a scratchpad before sketching charts for the write-up.
    </p>
  </header>

  <section class="w-full max-w-[1100px] space-y-6">
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
  </section>`;
}
