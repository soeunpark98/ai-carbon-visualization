export function renderIteration1Main(): string {
  return `
  <header class="text-center mb-20 max-w-2xl">
    <p class="text-[11px] tracking-[0.2em] uppercase text-dim mb-3">HCDE 511 · Iteration 1</p>
    <h1 class="text-[2rem] font-bold tracking-tight bg-gradient-to-br from-[#a8edea] to-[#fed6e3] bg-clip-text text-transparent">D3 Visualization Experiments</h1>
  </header>

  <section class="w-full max-w-[900px] mb-24" id="exp-01">
    <div class="flex items-baseline gap-5 mb-7 pb-5 border-b border-surface">
      <span class="text-[3rem] font-extrabold text-surface leading-none select-none min-w-[68px] text-right">01</span>
      <div>
        <p class="text-xl font-semibold text-soft tracking-tight">Carbon Cost of Digital Activities</p>
        <p class="text-sm text-muted mt-1 leading-relaxed max-w-lg">
          Estimated CO₂ equivalent emissions per single action — from a Visa swipe to a Bitcoin
          transaction. Log scale reveals orders-of-magnitude differences. Hover for real-world anchors.
        </p>
      </div>
    </div>
    <div id="chart-01"></div>
    <div class="flex items-center gap-6 mt-5 text-xs text-muted flex-wrap">
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-[#a8edea] inline-block"></span>
        Point estimate
      </div>
      <div class="flex items-center gap-2">
        <svg width="28" height="10" class="overflow-visible">
          <line x1="0" y1="5" x2="28" y2="5" stroke="#8b95a8" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="0" y1="1" x2="0" y2="9" stroke="#8b95a8" stroke-width="2"/>
          <line x1="28" y1="1" x2="28" y2="9" stroke="#8b95a8" stroke-width="2"/>
        </svg>
        Reported range
      </div>
    </div>
    <p class="mt-3.5 text-[11px] text-rim">
      Sources: Google Sustainability Report, IEA, published AI energy estimates. Values are approximate.
    </p>
  </section>

  <div class="w-full max-w-[900px] h-px bg-gradient-to-r from-transparent via-surface to-transparent mb-24"></div>

  <section class="w-full max-w-[900px] mb-24" id="exp-02">
    <div class="flex items-baseline gap-5 mb-7 pb-5 border-b border-surface">
      <span class="text-[3rem] font-extrabold text-surface leading-none select-none min-w-[68px] text-right">02</span>
      <div>
        <p class="text-xl font-semibold text-soft tracking-tight">Scale at a Glance</p>
        <p class="text-sm text-muted mt-1 leading-relaxed max-w-lg">
          Same data, reframed as an annotated dot plot. Human-world comparisons are always
          visible — above each dot is the activity, below is what that carbon actually feels like.
        </p>
      </div>
    </div>
    <div id="chart-02"></div>
    <p class="mt-3.5 text-[11px] text-rim">
      Sources: Google Sustainability Report, IEA, published AI energy estimates. Values are approximate.
    </p>
  </section>

  <div id="tooltip"
    class="fixed pointer-events-none bg-surface border border-rim rounded-xl px-4 py-3.5
           text-[13px] max-w-[280px] shadow-[0_8px_32px_rgba(0,0,0,0.5)]
           opacity-0 transition-opacity duration-150 z-10">
  </div>`;
}
