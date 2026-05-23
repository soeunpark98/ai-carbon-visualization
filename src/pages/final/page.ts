const BASE = import.meta.env.BASE_URL;

export function renderFinalMain(): string {
  return `
  <header
    id="final-hero"
    class="-mx-5 w-[calc(100%+2.5rem)] shrink-0 text-center bg-black z-10 mt-12 px-5 py-[120px]"
  >
    <h1 class="text-[3rem] font-bold text-white/90">The Hidden Cost of AI</h1>
  </header>

  <div
    id="final-main"
    class="w-full max-w-[1100px] space-y-16 [&>*]:pt-16"
  >
    
    <section class="space-y-5">
      <div class="flex items-baseline gap-5">
        <div class="flex flex-col gap-4">
          <h1 class="text-3xl font-semibold text-[#ff6b9d]">1. The AI Value Chain</h1>
          <p class="text-[14px] text-gray-400 leading-relaxed max-w-2xl">
            The map at the top gives a regional overview by highlighting electricity consumption across different parts of the world. Users can switch between the buttons on the top right to view actual electricity consumption data from 2020, 2023, and 2024, or projected values for 2030.
            Since it's difficult to understand growth trends from the map alone, we added the line chart below to show how electricity demand changes over time by region. This makes it easier to compare trends year by year. 
          </p>
        </div>
      </div>
    </section>

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4">
        <div class="flex flex-col gap-4">
          <h1 class="text-3xl font-semibold text-[#ff6b9d]">2. Hardware: The Physical Cost of AI</h1>
          <p class="text-sm text-gray-400 leading-relaxed max-w-2xl">
            The map at the top gives a regional overview by highlighting electricity consumption across different parts of the world. Users can switch between the buttons on the top right to view actual electricity consumption data from 2020, 2023, and 2024, or projected values for 2030.
            Since it's difficult to understand growth trends from the map alone, we added the line chart below to show how electricity demand changes over time by region. This makes it easier to compare trends year by year. 
          </p>
        </div>
      </div>
      <div id="final-q2-line" class="min-h-[220px] w-full mb-8"></div>
    </section>

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4">
        <div class="flex flex-col gap-4">
          <h1 class="text-3xl font-semibold text-[#ff6b9d]">3. Software: The Cost of Training AI</h1>
          <p class="text-sm text-gray-400 leading-relaxed max-w-2xl">
            The map at the top gives a regional overview by highlighting electricity consumption across different parts of the world. Users can switch between the buttons on the top right to view actual electricity consumption data from 2020, 2023, and 2024, or projected values for 2030.
            Since it's difficult to understand growth trends from the map alone, we added the line chart below to show how electricity demand changes over time by region. This makes it easier to compare trends year by year. 
          </p>
        </div>
      </div>
      <div id="final-q3" class="min-h-[380px] w-full overflow-x-auto"></div>
    </section>

    <section class="space-y-6">
      <div class="flex items-baseline gap-5">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold text-soft tracking-tight">Visualization 3</h1>
          <p class="text-lg font-semibold text-soft tracking-tight">3-1. <span class="text-[#ff6b9d]">Bar Chart:</span> Comparing the Carbon Footprint of Everyday Digital Activities</p>
          <p class="text-sm text-muted leading-relaxed max-w-3xl">
            This chart compares the estimated carbon emissions of AI-related activities with other everyday digital and physical actions. The x-axis uses a logarithmic scale to show a very wide range of CO2e values, from tiny emissions like a Visa transaction to much larger activities like streaming video or driving.          </p>
        </div>
      </div>
      <div id="final-q1" class="min-h-[200px] w-full"></div>
      <p class="text-[11px] text-rim leading-relaxed">Bars use midpoint CO₂e (g) where ranges exist; log-scaled axis. AI-related actions are highlighted.</p>

      <div class="h-px w-full bg-surface !my-12"></div>

      <div class="flex flex-col gap-2">
        <p class="text-lg font-semibold text-soft tracking-tight">3-2. <span class="text-[#ff6b9d]">Interactive Scale Calculator:</span> From Your Query to Global Impact</p>
        <p class="text-sm text-muted leading-relaxed max-w-3xl">
          This interactive calculator helps users understand how their everyday AI usage adds up over time. Users can select an AI tool, adjust the number of daily queries, and choose different query lengths to estimate their annual CO2 emissions.
        </p>
        <p class="text-sm text-muted leading-relaxed max-w-3xl">
          The global carbon footprint section at the bottom shows how small individual AI usage can scale up globally. For example, if 100 million users send 5 short ChatGPT queries every day, the annual carbon emissions would be equivalent to driving about 487 million km, which is roughly the same as traveling between Earth and the Sun <span class="text-soft font-semibold">3.3 times</span>.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-xl border border-surface bg-[#0f1117] p-6">
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-3">AI tool</p>
          <div id="final-q4-tools" class="flex flex-col gap-2">
            <button data-tool="chatgpt" class="q4-tool-btn text-left px-4 py-2.5 rounded-lg text-sm font-medium border border-surface text-muted transition-all">ChatGPT</button>
            <button data-tool="gemini"  class="q4-tool-btn text-left px-4 py-2.5 rounded-lg text-sm font-medium border border-surface text-muted transition-all">Gemini</button>
            <button data-tool="claude"  class="q4-tool-btn text-left px-4 py-2.5 rounded-lg text-sm font-medium border border-surface text-muted transition-all">Claude</button>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-3">Queries per day</p>
          <div class="flex flex-col gap-3">
            <span id="final-q4-freq-val" class="text-4xl font-bold text-soft tabular-nums">10</span>
            <input type="range" id="final-q4-freq" min="1" max="50" value="10"
              class="w-full cursor-pointer accent-[#a8edea]">
            <div class="flex justify-between text-xs text-dim"><span>1×</span><span>50×</span></div>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wider text-dim mb-3">Query length</p>
          <div id="final-q4-lengths" class="flex flex-col gap-2">
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

      <div id="final-q4-result" class="min-h-[72px]"></div>
      <div id="final-q4-chart" class="w-full"></div>

      <div id="final-q4-global" class="mt-8 rounded-xl border border-surface bg-[#0f1117] p-6 space-y-4"></div>

      <div class="h-px w-full bg-surface !my-12"></div>
  </div>`;
}
