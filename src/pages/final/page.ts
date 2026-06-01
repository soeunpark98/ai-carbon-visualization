const BASE = import.meta.env.BASE_URL;

function scaleIconPill(label: string, iconPath: string): string {
  return `
        <span class="inline-flex items-center gap-2 rounded-full border border-white/90 py-1.5 pl-3 pr-4 text-sm font-semibold text-[#e8eaf0]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-5 w-5 shrink-0 text-[#e8eaf0]" aria-hidden="true">
            <path d="${iconPath}"/>
          </svg>
          ${label}
        </span>`;
}

function sectionHead(n: number, title: string): string {
  const num = String(n).padStart(2, "0");
  return `
        <div class="final-section-head">
          <p class="final-section-eyebrow">Part ${num}</p>
          <h1 class="final-section-title">${title}</h1>
        </div>`;
}

export function renderFinalMain(): string {
  return `
  <header
    id="final-hero"
    class="-mx-5 flex min-h-[460px] w-[calc(100%+2.5rem)] shrink-0 flex-col z-10 mt-12 overflow-hidden px-5 pt-12 pb-12"
    style="background-image: url('${BASE}images/final-hero-bg.png')"
  >
    <div class="final-hero-vignette" aria-hidden="true"></div>
    <div class="final-hero-grid" aria-hidden="true"></div>
    <div class="final-hero-orb final-hero-orb--1" aria-hidden="true"></div>
    <div class="relative z-[1] mt-auto w-full max-w-[1100px] mx-auto">
      <div class="final-hero-copy">
        <p class="final-hero-eyebrow">HCDE 511 · Final project</p>
        <h1 class="final-hero-title">The Hidden<br />Cost of AI</h1>
        <p class="final-hero-lede">From data centers to your daily query — where carbon really adds up across the AI stack.</p>
      </div>
    </div>
  </header>

  <div
    id="final-main"
    class="w-full max-w-[1100px] space-y-16 [&>*]:pt-16"
  >
    
    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4">
        <div class="flex flex-col gap-8">
          ${sectionHead(1, "The AI Value Chain")}
          <p class="text-[14px] text-gray-400 leading-relaxed max-w-2xl">
            The map at the top gives a regional overview by highlighting electricity consumption across different parts of the world. Users can switch between the buttons on the top right to view actual electricity consumption data from 2020, 2023, and 2024, or projected values for 2030.
            Since it's difficult to understand growth trends from the map alone, we added the line chart below to show how electricity demand changes over time by region. This makes it easier to compare trends year by year. 
          </p>
        </div>
      </div>
    </section>

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4">
        <div class="flex flex-col gap-8">
          ${sectionHead(2, "Hardware: The Physical Cost of AI")}
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
        <div class="flex flex-col gap-8">
          ${sectionHead(3, "Software: The Cost of Training AI")}
          <p class="text-sm text-gray-400 leading-relaxed max-w-2xl">
            The map at the top gives a regional overview by highlighting electricity consumption across different parts of the world. Users can switch between the buttons on the top right to view actual electricity consumption data from 2020, 2023, and 2024, or projected values for 2030.
            Since it's difficult to understand growth trends from the map alone, we added the line chart below to show how electricity demand changes over time by region. This makes it easier to compare trends year by year. 
          </p>
        </div>
      </div>
      <div id="final-q3" class="min-h-[380px] w-full overflow-x-auto"></div>
    </section>

    <section class="space-y-5">
      <div class="flex items-baseline gap-5 pb-4">
        <div class="flex flex-col gap-8">
          ${sectionHead(4, "End user: Where does AI impact scale?")}
          <p class="text-sm text-gray-400 leading-relaxed max-w-2xl">
            This chart compares the estimated carbon emissions of AI-related activities with other everyday digital and physical actions. The x-axis uses a logarithmic scale to show a very wide range of CO2e values, from tiny emissions like a Visa transaction to much larger activities like streaming video or driving.
          </p>
        </div>
      </div>
      <div class="q2dc-card" style="position:relative">
        <div class="q2dc-row-header">
          <span class="q2dc-sec-title">4-1. Comparing the Carbon Footprint of Everyday Digital Activities</span>
        </div>
        <div id="final-q1" class="min-h-[200px] w-full"></div>
      </div>
    </section>

    <section class="flex flex-col gap-12">
      <div class="flex items-baseline gap-5 pb-4">
        <div class="flex flex-col gap-8">
          ${sectionHead(5, "From your query to global impact")}
        </div>
      </div>

      <div class="flex flex-col gap-5">
      <div class="max-w-2xl space-y-3 pb-2">
        ${scaleIconPill(
          "Individual",
          "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9.2V20h14v-1.2c0-2.34-4.67-3.5-7-3.5s-7 1.16-7 3.5z"
        )}
        <div class="space-y-2">
          <p class="text-xl font-semibold leading-snug tracking-tight text-[#e8eaf0]">The hidden cost starts small.</p>
          <p class="text-sm leading-relaxed text-gray-400">For an individual user, the impact of a few AI prompts can seem negligible.</p>
        </div>
      </div>

      <div class="overflow-hidden rounded-xl border border-[#2e3448] bg-[#0f1117] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div class="grid grid-cols-1 lg:grid-cols-3 items-stretch">
        <div class="flex flex-col gap-6 border-b border-[#2e3448] p-6 lg:col-span-1 lg:border-b-0 lg:border-r">
          <div class="flex flex-col gap-[20px]">
            <p class="text-sm font-medium text-soft">Which tool do you use?</p>
            <div class="grid grid-cols-3 gap-2">
              <button data-tool="chatgpt" class="q4-tool-btn text-center px-2 py-2.5 rounded-lg text-sm font-medium border border-surface text-muted transition-all">ChatGPT</button>
              <button data-tool="gemini" class="q4-tool-btn text-center px-2 py-2.5 rounded-lg text-sm font-medium border border-surface text-muted transition-all">Gemini</button>
              <button data-tool="claude" class="q4-tool-btn text-center px-2 py-2.5 rounded-lg text-sm font-medium border border-surface text-muted transition-all">Claude</button>
            </div>
          </div>

          <div class="flex flex-col gap-[20px]">
            <p class="text-sm font-medium text-soft">How long is each query?</p>
            <div class="grid grid-cols-3 gap-2">
              <button data-len="short" class="q4-len-btn text-center px-2 py-2.5 rounded-lg border border-surface text-sm transition-all">
                <span class="font-medium text-muted block">Short</span><span class="text-dim text-[10px] block">~50 words</span>
              </button>
              <button data-len="medium" class="q4-len-btn text-center px-2 py-2.5 rounded-lg border border-surface text-sm transition-all">
                <span class="font-medium text-muted block">Medium</span><span class="text-dim text-[10px] block">~200 words</span>
              </button>
              <button data-len="long" class="q4-len-btn text-center px-2 py-2.5 rounded-lg border border-surface text-sm transition-all">
                <span class="font-medium text-muted block">Long</span><span class="text-dim text-[10px] block">~500+ words</span>
              </button>
            </div>
          </div>

          <div class="flex flex-col gap-[20px]">
            <p class="text-sm font-medium text-soft">How many times per day?</p>
            <div class="flex flex-col gap-3">
              <span id="final-q4-freq-val" class="text-4xl font-bold text-soft tabular-nums">10</span>
              <input type="range" id="final-q4-freq" min="1" max="50" value="10"
                class="w-full cursor-pointer accent-[#a8edea]">
              <div class="flex justify-between text-xs text-dim"><span>1×</span><span>50×</span></div>
            </div>
          </div>
        </div>

        <div class="flex h-full min-h-[280px] flex-col justify-start gap-6 bg-[#1A1D28]/40 p-6 lg:col-span-2">
          <div id="final-q4-result" class="w-full shrink-0"></div>
          <div id="final-q4-chart" class="flex min-h-[88px] flex-1 w-full items-center justify-center border-t border-[#2e3448]/80 pt-5"></div>
        </div>
        </div>
      </div>
      </div>

      <div class="mt-8 flex flex-col gap-5">
      <div class="max-w-2xl space-y-3 pb-2">
        ${scaleIconPill(
          "Global",
          "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
        )}
        <div class="space-y-2">
          <p class="text-xl font-semibold leading-snug tracking-tight text-[#e8eaf0]">The hidden cost grows with scale.</p>
          <p class="text-sm leading-relaxed text-gray-400">Across millions of daily interactions worldwide, those small emissions compound into a massive environmental footprint.</p>
        </div>
      </div>

      <div id="final-q4-global" class="rounded-xl border border-surface bg-[#0f1117] p-6 space-y-4"></div>
      </div>
    </section>
  </div>`;
}
