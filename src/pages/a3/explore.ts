const DATASETS: { path: string; label: string }[] = [
  { path: "data/part4/4a.csv", label: "Part 4 · Activity CO₂e (4a)" },
  { path: "data/part4/4b.csv", label: "Part 4 · User scenarios (4b)" },
  { path: "data/part4/4c.csv", label: "Part 4 · Usage tiers (4c)" },
  { path: "data/part2/2a.csv", label: "Part 2 · Data center by type (2a)" },
  { path: "data/part2/2b.csv", label: "Part 2 · Region electricity (2b)" },
  { path: "data/part2/2c.csv", label: "Part 2 · IT vs cooling (2c)" },
  {
    path: "data/part3/3a.csv",
    label: "Part 3 · Model training (3a) — large file",
  },
];

import type { DSVRowString } from "d3";

const PREVIEW_ROWS = 18;

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderTable(rows: DSVRowString[]) {
  const tableHost = document.getElementById("a3-table-wrap");
  if (!tableHost) return;
  if (!rows.length) {
    tableHost.innerHTML = '<p class="text-muted text-sm">No rows.</p>';
    return;
  }
  const cols = Object.keys(rows[0]);
  const slice = rows.slice(0, PREVIEW_ROWS);
  let thead = "<thead><tr>";
  cols.forEach((c) => {
    thead += `<th class="text-left font-medium text-soft whitespace-nowrap">${escapeHtml(
      c
    )}</th>`;
  });
  thead += "</tr></thead>";
  let tbody = "<tbody>";
  slice.forEach((row) => {
    tbody += '<tr class="border-t border-rim/60">';
    cols.forEach((c) => {
      const v = row[c] == null ? "" : String(row[c]);
      tbody += `<td class="py-2 pr-4 text-sm text-muted max-w-[240px] truncate" title="${escapeHtml(
        v
      )}">${escapeHtml(v)}</td>`;
    });
    tbody += "</tr>";
  });
  tbody += "</tbody>";
  tableHost.innerHTML = `
      <div class="overflow-x-auto rounded-lg border border-rim">
        <table class="w-full border-collapse text-[13px]">${thead}${tbody}</table>
      </div>
      ${
        rows.length > PREVIEW_ROWS
          ? `<p class="text-xs text-rim mt-2">Showing first ${PREVIEW_ROWS} of ${rows.length} rows.</p>`
          : ""
      }
    `;
}

export function runA3Explore(): void {
  const select = document.getElementById(
    "a3-dataset"
  ) as HTMLSelectElement | null;
  const statusEl = document.getElementById("a3-status");
  const metaEl = document.getElementById("a3-meta");
  if (!select || !statusEl || !metaEl) return;

  const status = statusEl;
  const meta = metaEl;

  DATASETS.forEach((d, i) => {
    const opt = document.createElement("option");
    opt.value = d.path;
    opt.textContent = d.label;
    if (i === 0) opt.selected = true;
    select.appendChild(opt);
  });

  function load(path: string) {
    status.textContent = "Loading…";
    meta.textContent = "";
    const wrap = document.getElementById("a3-table-wrap");
    if (wrap) wrap.innerHTML = "";
    d3.csv(path)
      .then((rows) => {
        status.textContent = "Ready";
        const n = rows.length;
        const cols = n ? Object.keys(rows[0]).length : 0;
        meta.textContent = `${n.toLocaleString()} rows · ${cols} columns`;
        renderTable(rows);
      })
      .catch((err: unknown) => {
        console.error(err);
        status.textContent = "Error";
        meta.textContent = err instanceof Error ? err.message : String(err);
        const tw = document.getElementById("a3-table-wrap");
        if (tw)
          tw.innerHTML =
            '<p class="text-sm text-muted">Could not load this file.</p>';
      });
  }

  select.addEventListener("change", () => load(select.value));
  load(select.value);
}
