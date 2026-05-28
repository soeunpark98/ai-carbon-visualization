const activities = [
  {
    id: "visa",
    name: "Visa transaction",
    valueLabel: "0.00045 g",
    anchor: "Invisible to human senses",
    grams: 0.00045,
    tier: "tiny",
    band: "low",
    icon: "credit_card",
    emoji: "👁️",
    emojiScale: 0.7,
    sceneTitle: "A card tap is nearly weightless.",
    sceneBody:
      "At about 0.00045 grams of CO2e, a Visa transaction is so small it is almost impossible to imagine physically.",
  },
  {
    id: "search",
    name: "Google search",
    valueLabel: "0.2 g",
    anchor: "About 1 second of an LED bulb",
    grams: 0.2,
    tier: "tiny",
    band: "low",
    icon: "search",
    emoji: "💡",
    emojiScale: 1,
    sceneTitle: "Searches are tiny, but frequent.",
    sceneBody:
      "One Google search is still small at about 0.2 grams, yet it is the kind of action people repeat all day.",
  },
  {
    id: "email",
    name: "Plain email",
    valueLabel: "0.3 g",
    anchor: "About 1 second of an LED bulb",
    grams: 0.3,
    tier: "tiny",
    band: "low",
    icon: "mail",
    emoji: "💡",
    emojiScale: 1,
    sceneTitle: "An email edges a little higher.",
    sceneBody:
      "A plain email sits close to a search, which helps show how ordinary communication quietly contributes to the total.",
  },
  {
    id: "netflix",
    name: "Netflix, 30 min",
    valueLabel: "~18 g",
    anchor: "Driving about 100 meters by car",
    grams: 18,
    tier: "mid",
    band: "middle",
    icon: "play_circle",
    emoji: "🚗",
    emojiScale: 1,
    sceneTitle: "Streaming changes the scale quickly.",
    sceneBody:
      "Just 30 minutes of Netflix is already much larger than the tiny actions at the start of the story.",
  },
  {
    id: "zoom",
    name: "Zoom, 1 hr HD",
    valueLabel: "150-1,000 g",
    anchor: "Driving about 1 to 7 km by car",
    grams: 575,
    tier: "high",
    band: "middle",
    icon: "videocam",
    emoji: "🚗",
    emojiScale: 1,
    sceneTitle: "Video calls push into the heavy tier.",
    sceneBody:
      "HD Zoom for an hour can leap into the hundreds of grams, far beyond typical browsing or messaging.",
  },
  {
    id: "bitcoin",
    name: "Bitcoin transaction",
    valueLabel: "400,000-750,000 g",
    anchor: "Driving about 2,000 to 4,000 km by car",
    grams: 575000,
    tier: "high",
    band: "middle",
    icon: "currency_bitcoin",
    emoji: "🚗",
    emojiScale: 1,
    sceneTitle: "Bitcoin overwhelms the rest of the chart.",
    sceneBody:
      "One Bitcoin transaction is such an outlier that it reshapes the whole story, dwarfing the other activities entirely.",
  },
  {
    id: "chatgpt-combined",
    name: "ChatGPT queries at daily scale",
    valueLabel: "400,000-4,000,000 g / day",
    anchor: "About 2,200 to 22,000 km of driving by car",
    grams: 4000000,
    tier: "mid",
    band: "high",
    icon: "mode_heat",
    emoji: "🚗",
    emojiScale: 1,
    sceneTitle: "Combined ChatGPT use rises quickly at daily scale.",
    sceneBody:
      "A single ChatGPT query can range from about 0.4 to 4 g of CO2e. If 500,000 people each make 2 AI queries in a day, the total becomes 400,000 to 4,000,000 g, roughly comparable to about 2,200 to 22,000 km of driving by car.",
  },
  {
    id: "image",
    name: "AI image generation at daily scale",
    valueLabel: "900,000-3,600,000 g / day",
    anchor: "About 5,000 to 20,000 km of driving by car",
    grams: 3600000,
    tier: "mid",
    band: "high",
    icon: "image",
    emoji: "🚗",
    emojiScale: 1,
    sceneTitle: "At scale, AI image generation becomes a heavy daily load.",
    sceneBody:
      "A single AI image can be relatively small, but if 600,000 people each generate 3 images in a day, the total reaches 900,000 to 3,600,000 g of CO2e, roughly comparable to about 5,000 to 20,000 km of driving by car.",
  },
  {
    id: "gemini",
    name: "Gemini queries at daily scale",
    valueLabel: "6,000,000 g / day",
    anchor: "About 33,000 km of driving by car",
    grams: 6000000,
    tier: "high",
    band: "high",
    icon: "auto_awesome",
    emoji: "🚗",
    emojiScale: 1,
    sceneTitle: "At scale, Gemini prompts become the largest number here.",
    sceneBody:
      "A lightweight Gemini query is only 0.03 g, but if 10 million people each make 20 AI queries in a day, the total becomes 6,000,000 g of CO2e, roughly comparable to about 33,000 km of driving by car.",
  },
];

const storyRail = document.getElementById("story-rail");
const showcaseStep = document.getElementById("showcase-step");
const showcaseName = document.getElementById("showcase-name");
const showcaseIllustration = document.getElementById("showcase-illustration");
const showcaseValue = document.getElementById("showcase-value");
const showcaseAnchor = document.getElementById("showcase-anchor");
const showcaseTier = document.getElementById("showcase-tier");
const visualDivider = document.getElementById("visual-divider");

const colorForTier = {
  tiny: "var(--tiny)",
  mid: "var(--mid)",
  high: "var(--high)",
};

const colorForBand = {
  low: "var(--low-band)",
  middle: "var(--middle-band)",
  high: "var(--high-band)",
};

const tierLabel = {
  tiny: "Tiny traces",
  mid: "Noticeable habits",
  high: "Heavy digital events",
};

function iconMarkup(type) {
  return `<span class="showcase-icon" aria-hidden="true">${type}</span>`;
}

function emojiMarkup(symbol) {
  return `<span class="showcase-emoji" aria-hidden="true">${symbol}</span>`;
}

function sizeForValue(grams) {
  const minLog = Math.log10(0.00045);
  const maxLog = Math.log10(750000);
  const valueLog = Math.log10(grams);
  const normalized = (valueLog - minLog) / (maxLog - minLog);
  return 110 + normalized * 210;
}

function buildStory() {
  const fragment = document.createDocumentFragment();

  activities.forEach((activity, index) => {
    const article = document.createElement("article");
    article.className = `step${index === 0 ? " is-active" : ""}`;
    article.dataset.scene = activity.id;
    article.innerHTML = `
      <p class="step-label">${String(index + 1).padStart(2, "0")}</p>
      <h3>${activity.sceneTitle}</h3>
      <p>${activity.sceneBody}</p>
    `;
    fragment.appendChild(article);
  });

  storyRail.appendChild(fragment);
}

function renderActivity(activity, stepIndex) {
  const size = sizeForValue(activity.grams);

  showcaseStep.textContent = String(stepIndex + 1).padStart(2, "0");
  showcaseName.textContent = activity.name;
  showcaseValue.textContent = activity.valueLabel;
  showcaseAnchor.textContent = activity.anchor;
  showcaseTier.textContent = tierLabel[activity.tier];

  showcaseIllustration.className = `showcase-illustration showcase-tier-${activity.tier}`;
  showcaseIllustration.innerHTML = `
    <div class="showcase-bubble" style="background:${colorForBand[activity.band]}; width:${size}px; height:${size}px; margin:auto; --emoji-scale:${activity.emojiScale || 1};">
      ${emojiMarkup(activity.emoji)}
    </div>
  `;
  visualDivider.className = `visual-divider severity-${activity.band}`;

  requestAnimationFrame(() => {
    showcaseIllustration.classList.add("is-visible");
  });
}

buildStory();

const steps = [...document.querySelectorAll(".step")];
renderActivity(activities[0], 0);
let activeStepId = activities[0].id;
let rafId = null;

function activateStep(step) {
  const sceneId = step.dataset.scene;
  if (sceneId === activeStepId) return;

  const activityIndex = activities.findIndex((item) => item.id === sceneId);
  const activity = activities[activityIndex];
  activeStepId = sceneId;

  steps.forEach((item) => item.classList.toggle("is-active", item === step));
  showcaseIllustration.classList.remove("is-visible");

  window.setTimeout(() => {
    renderActivity(activity, activityIndex);
  }, 120);
}

function updateActiveStep() {
  const viewportMiddle = window.innerHeight / 2;
  let bestStep = steps[0];
  let bestDistance = Number.POSITIVE_INFINITY;

  steps.forEach((step) => {
    const rect = step.getBoundingClientRect();
    const stepMiddle = rect.top + rect.height / 2;
    const distance = Math.abs(stepMiddle - viewportMiddle);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestStep = step;
    }
  });

  activateStep(bestStep);
}

function requestStepUpdate() {
  if (rafId !== null) return;
  rafId = window.requestAnimationFrame(() => {
    rafId = null;
    updateActiveStep();
  });
}

window.addEventListener("scroll", requestStepUpdate, { passive: true });
window.addEventListener("resize", requestStepUpdate);
window.addEventListener("load", requestStepUpdate);

requestStepUpdate();
