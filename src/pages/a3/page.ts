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

    <section class="space-y-6">
      <div class="flex items-baseline gap-5 pb-4 border-b border-surface">
        <span class="text-[2.5rem] font-extrabold text-rim/80 leading-none select-none min-w-[56px] text-right">Q4</span>
        <div>
          <p class="text-lg font-semibold text-soft tracking-tight">Your AI carbon footprint</p>
          <p class="text-sm text-muted mt-1 leading-relaxed max-w-3xl">
            How does your daily AI usage add up over a year? Enter your habits and see the CO₂e — translated into driving distance.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border border-surface bg-[#0f1117] p-6">
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-3">AI tool</p>
          <div id="a3-q4-tools" class="flex flex-col gap-2">
            <button data-tool="chatgpt" class="q4-tool-btn text-left px-4 py-2.5 rounded-lg text-sm font-medium border border-surface text-muted transition-all">ChatGPT</button>
            <button data-tool="gemini"  class="q4-tool-btn text-left px-4 py-2.5 rounded-lg text-sm font-medium border border-surface text-muted transition-all">Gemini</button>
            <button data-tool="claude"  class="q4-tool-btn text-left px-4 py-2.5 rounded-lg text-sm font-medium border border-surface text-muted transition-all">Claude</button>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-3">Queries per day</p>
          <div class="flex flex-col gap-3">
            <span id="a3-q4-freq-val" class="text-4xl font-bold text-soft tabular-nums">10</span>
            <input type="range" id="a3-q4-freq" min="1" max="50" value="10"
              class="w-full cursor-pointer accent-[#a8edea]">
            <div class="flex justify-between text-xs text-dim"><span>1×</span><span>50×</span></div>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-3">Query length</p>
          <div id="a3-q4-lengths" class="flex flex-col gap-2">
            <button data-len="short"  class="q4-len-btn text-left px-4 py-2.5 rounded-lg border border-surface text-sm transition-all">
              <span class="font-medium text-muted">Short</span><span class="text-dim ml-2 text-xs">~50 words</span>
            </button>
            <button data-len="medium" class="q4-len-btn text-left px-4 py-2.5 rounded-lg border border-surface text-sm transition-all">
              <span class="font-medium text-muted">Medium</span><span class="text-dim ml-2 text-xs">~200 words</span>
            </button>
            <button data-len="long"   class="q4-len-btn text-left px-4 py-2.5 rounded-lg border border-surface text-sm transition-all">
              <span class="font-medium text-muted">Long</span><span class="text-dim ml-2 text-xs">~500+ words</span>
            </button>
          </div>
        </div>
      </div>

      <div id="a3-q4-result" class="min-h-[72px]"></div>
      <div id="a3-q4-chart" class="w-full"></div>

      <div id="a3-q4-global" class="mt-8 rounded-xl border border-surface bg-[#0f1117] p-6 space-y-4"></div>
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
