const BASE = import.meta.env.BASE_URL;

export function renderA3Main(): string {
  return `
  <header class="text-center mb-14 max-w-3xl">
    <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">A3: Exploratory Data Analysis</p>
    <h1 class="text-[2rem] font-bold tracking-tight bg-gradient-to-br from-[#a8edea] to-[#fed6e3] bg-clip-text text-transparent">The Hidden Cost of AI</h1>
  </header>

  <div class="w-full max-w-[1100px] space-y-32 divide-y divide-white/50 [&>*]:pt-16 first:[&>*]:pt-0">

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4 border-b border-surface">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold text-soft tracking-tight">Visualization 1</h1>
          <p class="text-lg font-semibold text-soft tracking-tight"> <span class="text-[#ff6b9d]">Map + Line Chart:</span> Global and Regional Data Center Electricity Consumption (2020–2030)</p>
          <p class="text-sm text-muted leading-relaxed max-w-3xl">
            The map at the top gives a regional overview by highlighting electricity consumption across different parts of the world. Users can switch between the buttons on the top right to view actual electricity consumption data from 2020, 2023, and 2024, or projected values for 2030.
            Since it's difficult to understand growth trends from the map alone, we added the line chart below to show how electricity demand changes over time by region. This makes it easier to compare trends year by year. 
          </p>
        </div>
      </div>
      <div id="a3-q2-line" class="min-h-[220px] w-full mb-8"></div>
    </section>

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4 border-b border-surface">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold text-soft tracking-tight">Visualization 2</h1>
          <p class="text-lg font-semibold text-soft tracking-tight"><span class="text-[#ff6b9d]">Scatter Plot:</span> Model Size vs. Estimated Training CO₂e (2012–2025)</p>
          <p class="text-sm text-muted leading-relaxed max-w-3xl">
            This scatterplot shows the relationship between AI model size and estimated training carbon emissions over time. The x-axis represents the number of model parameters, while the y-axis shows estimated training CO2 emissions in kilograms. Each dot represents an AI model, and the color indicates the year the model was released, from earlier models in purple to more recent models in yellow. Users can zoom and pan to explore the distribution in more detail, and the year slider allows filtering models by release year.          </p>
        </div>
      </div>
      <div id="a3-q3" class="min-h-[380px] w-full overflow-x-auto"></div>
    </section>

    <section class="space-y-6">
      <div class="flex items-baseline gap-5 pb-4 border-b border-surface">
        <div class="flex flex-col gap-2">
          <h1 class="text-2xl font-bold text-soft tracking-tight">Visualization 3</h1>
          <p class="text-lg font-semibold text-soft tracking-tight">3-1. <span class="text-[#ff6b9d]">Bar Chart:</span> Comparing the Carbon Footprint of Everyday Digital Activities</p>
          <p class="text-sm text-muted leading-relaxed max-w-3xl">
            This chart compares the estimated carbon emissions of AI-related activities with other everyday digital and physical actions. The x-axis uses a logarithmic scale to show a very wide range of CO2e values, from tiny emissions like a Visa transaction to much larger activities like streaming video or driving.          </p>
        </div>
      </div>
      <div id="a3-q1" class="min-h-[200px] w-full"></div>
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

      <div class="h-px w-full bg-surface !my-12"></div>

      <div class="flex flex-col gap-2">
          <p class="text-lg font-semibold text-soft tracking-tight">3-3. <span class="text-[#ff6b9d]">Scrollytelling:</span> The Carbon Weight of Digital Life</p>
        <p class="text-sm text-muted leading-relaxed max-w-3xl">
        </p>
      </div>

      <a href="${BASE}digital-carbon/index.html"
        class="mt-10 flex items-center justify-between gap-4 rounded-xl border border-surface bg-[#0f1117] px-6 py-5 hover:border-[#a8edea]/40 hover:bg-[#131720] transition-all group">
        <div class="flex flex-col gap-1">
          <p class="text-base font-semibold text-soft group-hover:text-body transition-colors">The Carbon Weight of Digital Life →</p>
        </div>
        <span class="text-2xl text-dim group-hover:text-[#a8edea] transition-colors flex-shrink-0">↗</span>
      </a>

  </div>`;
}
