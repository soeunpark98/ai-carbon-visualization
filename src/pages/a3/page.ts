export function renderA3Main(): string {
  return `
  <header class="text-center mb-14 max-w-3xl">
    <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">A3: Exploratory Data Analysis</p>
    <h1 class="text-[2rem] font-bold tracking-tight bg-gradient-to-br from-[#a8edea] to-[#fed6e3] bg-clip-text text-transparent">The Hidden Cost of AI</h1>
    <p class="text-sm text-muted mt-4 leading-relaxed max-w-2xl mx-auto">
      Four views derived from assignment datasets — comparative intensity, grid-scale trajectories, training footprint vs model size, and population-scale AI emissions.
    </p>
  </header>

  <div class="w-full max-w-[1100px] space-y-20">

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4 border-b border-surface">
        <span class="text-[2.5rem] font-extrabold text-rim/80 leading-none select-none min-w-[56px] text-right">Q1</span>
        <div>
          <p class="text-lg font-semibold text-soft tracking-tight">Comparative — CO₂e per use</p>
          <p class="text-sm text-muted mt-1 leading-relaxed max-w-3xl">
            Which digital activities produce the most CO₂e per single use, and how do AI queries compare to streaming, search, and finance?
            <span class="text-rim">·</span> Dataset: <code class="text-xs text-soft">part4/4a.csv</code>
          </p>
        </div>
      </div>
      <div id="a3-q1" class="min-h-[200px] w-full"></div>
      <p class="text-[11px] text-rim leading-relaxed">Bars use midpoint CO₂e (g) where ranges exist; log-scaled axis. AI-related actions are highlighted.</p>
    </section>

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4 border-b border-surface">
        <span class="text-[2.5rem] font-extrabold text-rim/80 leading-none select-none min-w-[56px] text-right">Q2</span>
        <div>
          <p class="text-lg font-semibold text-soft tracking-tight">Time + geography — data center electricity</p>
          <p class="text-sm text-muted mt-1 leading-relaxed max-w-3xl">
            How total demand evolved from 2020 to 2024 and how a 2030 baseline projection compares; regional breakdown for major markets (regions do not sum to “World” — different accounting scopes).
            <span class="text-rim">·</span> Datasets: <code class="text-xs text-soft">part2/2a.csv</code>, <code class="text-xs text-soft">part2/2b.csv</code>
          </p>
        </div>
      </div>
      <div id="a3-q2-line" class="min-h-[220px] w-full mb-8"></div>
      <div id="a3-q2-regions" class="min-h-[280px] w-full"></div>
    </section>

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4 border-b border-surface">
        <span class="text-[2.5rem] font-extrabold text-rim/80 leading-none select-none min-w-[56px] text-right">Q3</span>
        <div>
          <p class="text-lg font-semibold text-soft tracking-tight">Correlation — model size vs training CO₂e</p>
          <p class="text-sm text-muted mt-1 leading-relaxed max-w-3xl">
            Relationship between parameter count and estimated training CO₂e for models with release years 2012–2025 (log scales).
            <span class="text-rim">·</span> Dataset: <code class="text-xs text-soft">part3/3a.csv</code>
          </p>
        </div>
      </div>
      <div id="a3-q3" class="min-h-[380px] w-full overflow-x-auto"></div>
    </section>

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4 border-b border-surface">
        <span class="text-[2.5rem] font-extrabold text-rim/80 leading-none select-none min-w-[56px] text-right">Q4</span>
        <div>
          <p class="text-lg font-semibold text-soft tracking-tight">Scale — millions of users over time</p>
          <p class="text-sm text-muted mt-1 leading-relaxed max-w-3xl">
            When per-query AI emissions are multiplied by daily active users, cumulative annual tonnes and car-km equivalents; plus per-person annual footprint by usage tier.
            <span class="text-rim">·</span> Datasets: <code class="text-xs text-soft">part4/4b.csv</code>, <code class="text-xs text-soft">part4/4c.csv</code>
          </p>
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-2">Scenario totals (1 year)</p>
          <div id="a3-q4b" class="min-h-[280px] w-full"></div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-2">Per-person annual footprint by tier</p>
          <div id="a3-q4c" class="min-h-[280px] w-full"></div>
        </div>
      </div>
    </section>

    <div class="h-px w-full bg-gradient-to-r from-transparent via-surface to-transparent my-4"></div>

    <section class="w-full space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end gap-4 pb-4 border-b border-surface">
        <div class="flex-1 min-w-0">
          <label for="a3-dataset" class="block text-xs uppercase tracking-wider text-dim mb-2">Raw dataset preview</label>
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
