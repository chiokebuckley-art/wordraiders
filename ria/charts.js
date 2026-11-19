// Small accessible SVG charts for the Academy dashboard. Every mark that carries a value has a data-tip (shown on
// hover and keyboard focus by app.js), every chart has a table view, and colours follow series identity in a fixed
// order (validated for the dark chart surface #132a40: lightness band, chroma, colour-blind separation, contrast).
export const COLORS = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#0ca30c', '#9085e9', '#e66767'];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const W = 640, H = 260, M = { t: 16, r: 92, b: 36, l: 44 };
const fmt = v => v == null || !Number.isFinite(v) ? '–' : Math.round(v);
function frame(title, svg, table, note){
 return `<figure class="chart"><figcaption>${esc(title)}</figcaption><div class="chart-box">${svg}<div class="tip" role="tooltip" hidden></div></div>${note ? `<p class="chart-note">${note}</p>` : ''}<details class="chart-table"><summary>Show as a table</summary>${table}</details></figure>`;
}
const tableOf = (head, rows) => `<table><thead><tr>${head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const empty = (title, why) => `<figure class="chart"><figcaption>${esc(title)}</figcaption><p class="chart-empty">${esc(why)}</p></figure>`;
function axes(yMax, yLabel, yTicks = [0, 25, 50, 75, 100]){
 const y = v => M.t + (H - M.t - M.b) * (1 - v / yMax);
 return { y, svg: yTicks.map(t => `<line x1="${M.l}" x2="${W - M.r}" y1="${y(t)}" y2="${y(t)}" class="grid"/><text x="${M.l - 6}" y="${y(t) + 4}" text-anchor="end" class="tick">${t}${yLabel === '%' ? '%' : ''}</text>`).join('') };
}

/** Line chart. series: [{ name, points: [{ x: label, y, n, lo, hi }] }] with shared x labels. */
export function lineChart(title, series, { yMax = 100, yLabel = '%', note = '', minN = 1 } = {}){
 const xs = [...new Set(series.flatMap(s => s.points.map(p => p.x)))].sort();
 if (!xs.length) return empty(title, 'No data yet.');
 const { y, svg: grid } = axes(yMax, yLabel), step = xs.length > 1 ? (W - M.l - M.r) / (xs.length - 1) : 0, x = k => M.l + (xs.length > 1 ? xs.indexOf(k) * step : (W - M.l - M.r) / 2);
 const labelEvery = Math.ceil(xs.length / 7);
 let body = grid + xs.map((k, i) => i % labelEvery ? '' : `<text x="${x(k)}" y="${H - 12}" text-anchor="middle" class="tick">${esc(String(k).slice(5) || k)}</text>`).join('');
 series.forEach((s, si) => {
  const c = COLORS[si % COLORS.length], pts = s.points.filter(p => p.y != null && (p.n ?? minN) >= minN);
  if (pts.length > 1) body += `<polyline fill="none" stroke="${c}" stroke-width="2" points="${pts.map(p => `${x(p.x)},${y(p.y)}`).join(' ')}"/>`;
  for (const p of pts) {
   if (p.lo != null) body += `<line x1="${x(p.x)}" x2="${x(p.x)}" y1="${y(p.lo)}" y2="${y(p.hi)}" stroke="${c}" stroke-width="1.5" opacity=".55"/>`;
   body += `<circle cx="${x(p.x)}" cy="${y(p.y)}" r="4.5" fill="${c}" stroke="#132a40" stroke-width="2"/><circle cx="${x(p.x)}" cy="${y(p.y)}" r="12" class="hit" tabindex="0" data-tip="${esc(`${s.name} · ${p.x}: ${fmt(p.y)}${yLabel}${p.n != null ? ` (n = ${p.n}${p.lo != null ? `, 95% ${fmt(p.lo)}–${fmt(p.hi)}` : ''})` : ''}`)}" aria-label="${esc(`${s.name}, ${p.x}: ${fmt(p.y)}`)}"/>`;
  }
  const last = pts[pts.length - 1]; if (last && series.length <= 4) body += `<text x="${x(last.x) + 8}" y="${y(last.y) + 4}" class="dlabel">${esc(s.name.slice(0, 14))}</text>`;
 });
 const legend = series.length >= 2 ? `<div class="legend">${series.map((s, i) => `<span><i style="background:${COLORS[i % COLORS.length]}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
 const svg = `${legend}<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${body}</svg>`;
 const table = tableOf(['Series', 'Period', 'Value', 'n', '95% interval'], series.flatMap(s => s.points.map(p => [s.name, p.x, fmt(p.y), p.n ?? '', p.lo != null ? `${fmt(p.lo)}–${fmt(p.hi)}` : ''])));
 return frame(title, svg, table, note);
}
/** Dots with interval whiskers over categories (e.g. accuracy by passage level). rows: [{ x, y, n, lo, hi }] */
export function dotChart(title, rows, { yMax = 100, xLabel = '', note = '' } = {}){
 const r = rows.filter(p => p.y != null); if (!r.length) return empty(title, 'No data yet.');
 const { y, svg: grid } = axes(yMax, '%'), step = (W - M.l - M.r) / r.length, x = i => M.l + step * (i + 0.5);
 let body = grid;
 r.forEach((p, i) => {
  if (p.lo != null) body += `<line x1="${x(i)}" x2="${x(i)}" y1="${y(p.lo)}" y2="${y(p.hi)}" stroke="${COLORS[0]}" stroke-width="2" opacity=".6"/>`;
  body += `<circle cx="${x(i)}" cy="${y(p.y)}" r="5" fill="${COLORS[0]}" stroke="#132a40" stroke-width="2"/><circle cx="${x(i)}" cy="${y(p.y)}" r="14" class="hit" tabindex="0" data-tip="${esc(`${xLabel} ${p.x}: ${fmt(p.y)}% (n = ${p.n}${p.lo != null ? `, 95% ${fmt(p.lo)}–${fmt(p.hi)}` : ''})`)}" aria-label="${esc(`${xLabel} ${p.x}: ${fmt(p.y)} percent`)}"/>`;
  body += `<text x="${x(i)}" y="${H - 12}" text-anchor="middle" class="tick">${esc(p.x)}</text><text x="${x(i)}" y="${y(p.y) - 10}" text-anchor="middle" class="dlabel small">n=${p.n}</text>`;
 });
 return frame(title, `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${body}<text x="${(W - M.r + M.l) / 2}" y="${H}" text-anchor="middle" class="tick">${esc(xLabel)}</text></svg>`, tableOf([xLabel || 'Group', 'Value %', 'n', '95% interval'], r.map(p => [p.x, fmt(p.y), p.n, p.lo != null ? `${fmt(p.lo)}–${fmt(p.hi)}` : ''])), note);
}
/** Horizontal bars for counts (one hue: magnitude). rows: [{ label, value }] */
export function barChart(title, rows, { note = '', unit = '' } = {}){
 if (!rows.length) return empty(title, 'No data yet.');
 const max = Math.max(...rows.map(r => r.value)) || 1, bh = 22, gap = 6, h = rows.length * (bh + gap) + 8, lw = 190, bw = W - lw - 60;
 const body = rows.map((r, i) => { const yy = 4 + i * (bh + gap), w = Math.max(2, bw * r.value / max); return `<text x="${lw - 8}" y="${yy + bh / 2 + 4}" text-anchor="end" class="tick big">${esc(r.label)}</text><rect x="${lw}" y="${yy}" width="${w}" height="${bh}" rx="4" fill="${COLORS[0]}"/><rect x="${lw}" y="${yy}" width="${bw}" height="${bh}" class="hit" tabindex="0" data-tip="${esc(`${r.label}: ${r.value}${unit}`)}" aria-label="${esc(`${r.label}: ${r.value}`)}"/><text x="${lw + w + 6}" y="${yy + bh / 2 + 4}" class="dlabel">${r.value}${unit}</text>`; }).join('');
 return frame(title, `<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(title)}">${body}</svg>`, tableOf(['Category', 'Count'], rows.map(r => [r.label, r.value])), note);
}
/** Scatter (x, y numeric). points: [{ x, y, label }] */
export function scatter(title, points, { xLabel, yLabel, xMax, yMin = -50, yMax = 50, note = '' } = {}){
 if (!points.length) return empty(title, 'No data yet.');
 const xm = xMax || Math.max(...points.map(p => p.x)) * 1.1 || 1, X = v => M.l + (W - M.l - M.r) * v / xm, Y = v => M.t + (H - M.t - M.b) * (1 - (v - yMin) / (yMax - yMin));
 let body = [yMin, (yMin + yMax) / 2, yMax].map(t => `<line x1="${M.l}" x2="${W - M.r}" y1="${Y(t)}" y2="${Y(t)}" class="grid"/><text x="${M.l - 6}" y="${Y(t) + 4}" text-anchor="end" class="tick">${t > 0 ? '+' : ''}${t}</text>`).join('');
 body += [0, xm / 2, xm].map(t => `<text x="${X(t)}" y="${H - 12}" text-anchor="middle" class="tick">${Math.round(t)}</text>`).join('');
 body += points.map(p => `<circle cx="${X(p.x)}" cy="${Y(Math.max(yMin, Math.min(yMax, p.y)))}" r="5" fill="${COLORS[0]}" stroke="#132a40" stroke-width="2"/><circle cx="${X(p.x)}" cy="${Y(Math.max(yMin, Math.min(yMax, p.y)))}" r="13" class="hit" tabindex="0" data-tip="${esc(`${p.label}: ${xLabel} ${Math.round(p.x)}, ${yLabel} ${p.y > 0 ? '+' : ''}${Math.round(p.y)}`)}" aria-label="${esc(p.label)}"/>`).join('');
 return frame(title, `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${body}<text x="${(W - M.r + M.l) / 2}" y="${H}" text-anchor="middle" class="tick">${esc(xLabel)}</text></svg>`, tableOf(['Point', xLabel, yLabel], points.map(p => [p.label, Math.round(p.x), Math.round(p.y)])), note);
}
