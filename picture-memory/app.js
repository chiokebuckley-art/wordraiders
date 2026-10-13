// Picture Memory: two picture-remembering games for WordRaiders' Picture Thinking.
// 1) Spot the change: look at an object, hide it, then pick the SAME object from versions that differ only in one
//    detail (colour, which way it faces, pattern, how many, a missing part). Harder levels show more versions and
//    stop saying which detail to watch.
// 2) Color it from memory: look at a coloured picture, hide it, then colour the blank outline from a box of crayons.
//    Every part right = "Perfect memory!". No timers anywhere.
// A day = 4 spot-the-change rounds + 3 colour pictures; finishing it ticks Picture Thinking on Today.
import {OBJECTS, OBJECT_IDS, PALETTE, HEX, draw} from './art.js?v=pm-1';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=3';

const app = document.querySelector('#app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);
const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const pick = xs => xs[Math.floor(Math.random() * xs.length)];
const shuffled = xs => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- player + save ----------
function player(){ try { const r = JSON.parse(localStorage.getItem('wordraiders.players.v1') || 'null'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Explorer' }; } catch { return { id: 'guest', name: 'Explorer' }; } }
const P = player(), KEY = `wr-picmem.${P.id}`;
const fresh = () => ({ v: 1, spot: { level: 1, streak: 0, misses: 0, played: 0, right: 0 }, color: { level: 1, streak: 0, misses: 0, played: 0, perfect: 0 }, days: {}, best: 0 });
let S; try { S = { ...fresh(), ...(JSON.parse(localStorage.getItem(KEY) || 'null') || {}) }; } catch { S = fresh(); }
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }
function say(t){ if (!t || voiceBlocked()) return; speak(t); }

// ---------- spot the change ----------
const COLORABLE = id => Object.keys(OBJECTS[id].parts);
function randomBase(id){
 const D = OBJECTS[id], used = new Set(), colors = {};
 for (const p of Object.keys(D.parts)) { const c = pick(PALETTE.filter(x => !used.has(x.id) && x.id !== 'white' && x.id !== 'black')).id; used.add(c); colors[p] = c; }
 const spec = { obj: id, colors };
 if (D.count) spec.count = pick(D.count.values);
 if (D.flip && Math.random() < .5) spec.flip = true;
 if (D.pattern && Math.random() < .3) spec.pattern = { part: D.pattern[0], kind: pick(['stripes', 'dots']) };
 if (D.time) spec.time = pick([3, 9, 6, 12]);
 if (D.light) spec.light = true;
 return spec;
}
const partWord = p => ({ cup: 'mug', fruit: 'apple', walls: 'walls', top: 'top', bottom: 'bottom', body: 'body', icing: 'icing', band: 'band', shirt: 'shirt', sock: 'sock', heel: 'heel', petals: 'petals', middle: 'middle', nose: 'nose', fins: 'fins', shade: 'shade', base: 'base', box: 'box', ribbon: 'ribbon', scoop: 'ice cream', cone: 'cone', bus: 'bus', wing: 'wing', pot: 'teapot', lid: 'lid', bag: 'bag', pocket: 'pocket', frame: 'frame', hull: 'boat', sail: 'sail', balloon: 'balloon', hat: 'hat', roof: 'roof', door: 'door', tail: 'tail' }[p] || p);
// every single-detail change possible for this object, grouped by kind
function changes(spec){
 const D = OBJECTS[spec.obj], out = [];
 for (const p of Object.keys(D.parts)) for (const c of PALETTE) if (c.id !== spec.colors[p] && !Object.values(spec.colors).includes(c.id)) out.push({ kind: 'color', part: p, apply: s => ({ ...s, colors: { ...s.colors, [p]: c.id } }), label: `${c.id} ${partWord(p)}` });
 if (D.flip) out.push({ kind: 'flip', apply: s => ({ ...s, flip: !s.flip }) });
 if (D.pattern) for (const kind of ['stripes', 'dots', 'plain']) { const cur = spec.pattern?.kind || 'plain'; if (kind !== cur) out.push({ kind: 'pattern', apply: s => ({ ...s, pattern: kind === 'plain' ? null : { part: D.pattern[0], kind } }) }); }
 if (D.count) for (const v of D.count.values) if (v !== spec.count) out.push({ kind: 'count', apply: s => ({ ...s, count: v }) });
 if (D.missing) for (const m of D.missing) out.push({ kind: 'missing', apply: s => ({ ...s, missing: (s.missing || []).includes(m) ? s.missing.filter(x => x !== m) : [...(s.missing || []), m] }) });
 if (D.light) out.push({ kind: 'light', apply: s => ({ ...s, light: !s.light }) });
 if (D.time) for (const t of [3, 6, 9, 12]) if (t !== spec.time) out.push({ kind: 'time', apply: s => ({ ...s, time: t }) });
 return out;
}
function watchWords(kind, spec, change){
 const D = OBJECTS[spec.obj];
 if (kind === 'color') return Object.keys(D.parts).length > 1 ? `the color of its ${partWord(change.part)}` : 'its color';
 if (kind === 'flip') return `which way its ${D.flip} points`;
 if (kind === 'pattern') return 'its pattern';
 if (kind === 'count') return `how many ${D.count.what} it has`;
 if (kind === 'missing') return `its ${D.missing[0]}`;
 if (kind === 'light') return 'whether its light is on';
 if (kind === 'time') return 'the time it shows';
 return 'it';
}
function makeSpot(){
 const L = S.spot.level, id = pick(OBJECT_IDS.filter(x => x !== S.lastObj)), base = randomBase(id), all = changes(base);
 S.lastObj = id;
 const kinds = [...new Set(all.map(c => c.kind))];
 let opts = [], hint = '';
 if (L <= 2) {   // one detail, named
  const multi = k => k === 'color' || all.filter(c => c.kind === k).length >= 2;   // level 2 needs two wrong versions of the same detail
  const kind = pick(L === 1 || !kinds.some(multi) ? kinds : kinds.filter(multi));
  let pool = all.filter(c => c.kind === kind);
  if (kind === 'color') { const part = pick([...new Set(pool.map(c => c.part))]); pool = pool.filter(c => c.part === part); }
  opts = shuffled(pool).slice(0, L === 1 ? 1 : 2); hint = watchWords(kind, base, opts[0]);
 } else {        // several details, not named
  const want = L === 3 ? 2 : 3, ks = shuffled(kinds).slice(0, want);
  opts = ks.map(k => pick(all.filter(c => c.kind === k)));
  while (opts.length < want) { const c = pick(all.filter(x => !opts.includes(x) && !(x.kind === 'color' && opts.some(o => o.kind === 'color' && o.part === x.part && o.label === x.label)))); if (!c) break; opts.push(c); }   // objects with few kinds of change still get 4 versions
 }
 const choices = shuffled([{ spec: base, right: true }, ...opts.map(c => ({ spec: c.apply(base), right: false }))]);
 const name = OBJECTS[id].name;
 return { game: 'spot', base, choices, name, hint, phase: 'look', level: L,
  teach: hint ? `Look at this ${name}. Notice ${hint}.` : `Look carefully at this ${name}. Remember everything about it.`, ask: `Tap the ${name} you saw.` };
}
function scoreSpot(ok){
 const g = S.spot; g.played++; if (ok) { g.right++; g.streak++; g.misses = 0; if (g.streak >= 4 && g.level < 4) { g.level++; g.streak = 0; return 'up'; } }
 else { g.streak = 0; g.misses++; if (g.misses >= 2 && g.level > 1) { g.level--; g.misses = 0; return 'down'; } }
 return null;
}

// ---------- color it from memory ----------
// level 1: an object with 2 parts · 2: 3 parts · 3: two objects (4-5 parts) · 4: two objects (5-6 parts)
function makeColor(){
 const L = S.color.level, n = id => COLORABLE(id).length;
 const one = k => pick(OBJECT_IDS.filter(id => n(id) === k && id !== S.lastObj));
 let objs;
 if (L === 1) objs = [one(2)];
 else if (L === 2) objs = [one(3)];
 else if (L === 3) objs = [one(2), pick(OBJECT_IDS.filter(id => n(id) <= 3 && id !== 'clock'))];
 else objs = [one(3), one(3)];
 objs = objs.map(id => id || pick(OBJECT_IDS)); S.lastObj = objs[0];
 const used = new Set();
 const pics = objs.map((id, k) => { const colors = {}; for (const p of COLORABLE(id)) { const c = pick(PALETTE.filter(x => !used.has(x.id) && x.id !== 'white')).id; used.add(c); colors[p] = c; } return { key: 'ab'[k], spec: { obj: id, colors, ...(OBJECTS[id].count ? { count: OBJECTS[id].count.values[0] } : {}) } }; });
 const regions = pics.flatMap(p => COLORABLE(p.spec.obj).map(part => ({ id: `${p.key}.${part}`, pic: p.key, part, want: p.spec.colors[part] })));
 return { game: 'color', pics, regions, paint: {}, crayon: null, phase: 'look', level: L, teach: pics.length > 1 ? `Look at the ${OBJECTS[pics[0].spec.obj].name} and the ${OBJECTS[pics[1].spec.obj].name}. Remember every color.` : `Look at this ${OBJECTS[pics[0].spec.obj].name}. Remember every color.` };
}
function scoreColor(right, total){
 const g = S.color; g.played++; const perfect = right === total;
 if (perfect) { g.perfect++; g.streak++; g.misses = 0; if (g.streak >= 2 && g.level < 4) { g.level++; g.streak = 0; return 'up'; } }
 else { g.streak = 0; if (right / total < .5) g.misses++; if (g.misses >= 2 && g.level > 1) { g.level--; g.misses = 0; return 'down'; } }
 return null;
}

// ---------- the day ----------
let RUN = null;
const DAY = ['spot', 'color', 'spot', 'color', 'spot', 'color', 'spot'];
function startDay(){ RUN = { i: 0, results: [], stars: 0, perfect: 0 }; nextRound(); }
function nextRound(){
 if (RUN.i >= DAY.length) return finishDay();
 RUN.r = DAY[RUN.i] === 'spot' ? makeSpot() : makeColor(); RUN.shownAt = Date.now(); render(); say(RUN.r.teach); window.scrollTo(0, 0);
}
function finishDay(){
 const today = dayKey(); S.days[today] = { done: true, at: Date.now(), stars: RUN.stars, perfect: RUN.perfect };
 persist(); addXp(15); RUN.finished = true; render(); say(`Great remembering! You got ${RUN.stars} stars today.`);
}

// ---------- views ----------
function bar(){ return `<header class="bar"><a href="${RUN ? '#' : '../#/home'}" data-act="${RUN ? 'home' : ''}" class="back">${RUN ? '← Picture Memory' : '← WordRaiders'}</a><span class="title">Picture Memory</span><span class="count">${RUN && !RUN.finished ? `${RUN.i + 1} / ${DAY.length}` : esc(P.name)}</span></header>`; }
function homeView(){
 const d = S.days[dayKey()];
 return bar() + `<main><p class="eyebrow">PICTURE THINKING</p><h1>${d?.done ? 'Done for today! 🎉' : 'Picture Memory'}</h1>
 <p class="lead">${d?.done ? `You earned ${d.stars} ⭐ today${d.perfect ? `, with ${d.perfect} perfect picture${d.perfect > 1 ? 's' : ''}` : ''}.` : 'Look closely, hide the picture, then show what you remember. 4 “spot the change” and 3 “color it from memory” — about 5 minutes, no timer.'}</p>
 ${d?.done ? `<div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a><button class="btn" data-act="start">Play again</button></div>` : `<button class="primary big" data-act="start">▶ Start</button>`}
 <div class="levels"><div class="lv-card"><b>🔍 Spot the change</b><small>Level ${S.spot.level} of 4</small></div><div class="lv-card"><b>🖍️ Color it from memory</b><small>Level ${S.color.level} of 4 · ${S.color.perfect} perfect</small></div></div>
 <p class="small">More ways to practise are in <a href="../#/library" class="lnk">Picture Thinking</a> in the Library.</p>
 <details class="about"><summary>For grown-ups</summary>
 <p>Spot the change always compares the <b>same</b> object, so the child has to remember the detail, not just what the thing was. Levels: 1 — two versions, the detail is named (“notice its handle”); 2 — three versions; 3 and 4 — three or four versions and the detail isn’t named. Four right in a row moves up; two misses in a row moves back down.</p>
 <p>Color it from memory starts with an object of two colours, then three, then two objects together (up to six colours). Ten fixed crayons are used (no colour wheel), so “all right” is fair. Two perfect pictures in a row move up a level.</p>
 <p>Some people don’t see pictures in their head. That’s fine: saying it out loud (“blue mug, handle on the right”) works just as well, and is a skill in itself.</p></details></main>`;
}
function spotView(){
 const r = RUN.r;
 if (r.phase === 'look') return bar() + `<main class="round"><section class="card"><p class="eyebrow">LOOK &amp; LEARN</p><p class="teach">${esc(r.teach)}</p><button class="btn hear-again" data-act="hear">🔊 Hear it again</button>
  <div class="pic-big">${draw(r.base, { size: 280 })}</div><button class="primary big" data-act="hide">I’m ready · hide the picture</button>
  <button class="linkish" data-act="tip">I don’t see a picture in my head</button>${RUN.tip ? `<p class="tip">That’s OK! Say it out loud instead: “${esc(spokenHint(r))}”.</p>` : ''}</section></main>`;
 const right = r.choices.findIndex(c => c.right);
 const cls = k => r.picked == null ? '' : k === right ? 'right' : k === r.picked ? 'wrong' : 'dim';
 return bar() + `<main class="round"><section class="card"><p class="eyebrow">YOUR TURN</p><p class="teach">${esc(r.ask)}</p><button class="btn hear-again" data-act="hear">🔊 Hear it again</button>
 <div class="choices ${r.choices.length > 2 ? 'many' : ''}">${r.choices.map((c, k) => `<button class="choice ${cls(k)}" data-act="spot" data-k="${k}" ${r.picked != null ? 'disabled' : ''} aria-label="Picture ${k + 1}">${draw(c.spec, { size: 240, label: `${r.name} ${k + 1}` })}<span class="tag">${cls(k) === 'right' ? '✓' : cls(k) === 'wrong' ? '✗' : k + 1}</span></button>`).join('')}</div>
 ${r.picked != null ? `<p class="fb ${r.ok ? 'ok' : ''}">${r.ok ? 'Yes! That’s the one you saw. ⭐' : `The one you saw is marked ✓. ${r.hint ? `Look at ${esc(r.hint)}.` : 'Look at what is different.'}`}</p>${r.moved === 'up' ? '<p class="up">⬆ Spot the change: next level!</p>' : ''}<button class="primary big" data-act="next">Next ▸</button>` : ''}</section></main>`;
}
function spokenHint(r){ const s = r.base, D = OBJECTS[s.obj]; const cols = Object.entries(s.colors).map(([p, c]) => Object.keys(D.parts).length > 1 ? `${c} ${partWord(p)}` : `${c} ${D.name}`).join(', '); return `${cols}${D.count ? `, ${s.count} ${D.count.what}` : ''}${D.flip ? `, ${D.flip} on the ${s.flip ? 'left' : 'right'}` : ''}${s.pattern ? `, ${s.pattern.kind}` : ''}`; }
function colorView(){
 const r = RUN.r;
 if (r.phase === 'look') return bar() + `<main class="round"><section class="card"><p class="eyebrow">LOOK &amp; REMEMBER</p><p class="teach">${esc(r.teach)}</p><button class="btn hear-again" data-act="hear">🔊 Hear it again</button>
  <div class="pics">${r.pics.map(p => `<div class="pic-big">${draw(p.spec, { size: r.pics.length > 1 ? 180 : 280 })}</div>`).join('')}</div><button class="primary big" data-act="hide">I’m ready · hide the picture</button>
  <button class="linkish" data-act="tip">I don’t see a picture in my head</button>${RUN.tip ? `<p class="tip">That’s OK! Say the colors out loud: “${esc(r.regions.map(g => `${g.want} ${partWord(g.part)}`).join(', '))}”.</p>` : ''}</section></main>`;
 const checked = r.phase === 'checked';
 const pics = r.pics.map(p => { const paint = Object.fromEntries(r.regions.filter(g => g.pic === p.key).map(g => [g.part, r.paint[g.id] ? HEX[r.paint[g.id]] : '#ffffff'])); return `<div class="paint ${checked ? '' : 'live'}" data-pic="${p.key}">${draw(p.spec, { size: r.pics.length > 1 ? 180 : 280, blank: true, paint })}</div>`; }).join('');
 const res = checked ? r.regions.map(g => `<li class="${r.paint[g.id] === g.want ? 'ok' : 'no'}">${r.paint[g.id] === g.want ? '✓' : '✗'} ${esc(partWord(g.part))}: ${r.paint[g.id] === g.want ? esc(g.want) : `it was <b>${esc(g.want)}</b>${r.paint[g.id] ? ` (you chose ${esc(r.paint[g.id])})` : ''}`}</li>`).join('') : '';
 const left = r.regions.filter(g => !r.paint[g.id]).length;
 return bar() + `<main class="round"><section class="card"><p class="eyebrow">${checked ? 'HOW DID YOU DO?' : 'COLOR IT FROM MEMORY'}</p><p class="teach">${checked ? (r.right === r.regions.length ? 'Perfect memory! ⭐⭐⭐' : `${r.right} of ${r.regions.length} colors right ${'⭐'.repeat(r.stars)}`) : 'Pick a crayon, then tap a part to color it.'}</p>
 <div class="pics">${pics}</div>
 ${checked ? `<div class="compare"><p class="small muted">The picture you saw:</p><div class="pics">${r.pics.map(p => draw(p.spec, { size: 110 })).join('')}</div></div><ul class="res">${res}</ul>${r.moved === 'up' ? '<p class="up">⬆ Color it from memory: next level!</p>' : ''}<button class="primary big" data-act="next">Next ▸</button>`
  : `<div class="crayons">${PALETTE.map(c => `<button class="crayon ${r.crayon === c.id ? 'on' : ''}" data-act="crayon" data-c="${c.id}" style="--c:${c.hex}" aria-label="${c.id}" aria-pressed="${r.crayon === c.id}"><span></span>${c.id}</button>`).join('')}</div>
   <button class="primary big" data-act="check" ${left ? 'disabled' : ''}>${left ? `Color ${left} more part${left > 1 ? 's' : ''}` : 'Check ▸'}</button>`}</section></main>`;
}
function doneView(){
 return bar() + `<main class="round"><section class="card result"><div class="burst">🎉</div><h1>Great remembering!</h1><p class="lead">You earned ${RUN.stars} ⭐ today${RUN.perfect ? ` and ${RUN.perfect} perfect picture${RUN.perfect > 1 ? 's' : ''}` : ''}.</p>
 <div class="row center"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a></div></section></main>`;
}
function render(){ app.innerHTML = !RUN ? homeView() : RUN.finished ? doneView() : RUN.r.game === 'spot' ? spotView() : colorView(); }

// ---------- events ----------
app.addEventListener('click', e => {
 // colouring: a tap inside a blank picture paints the part under the finger
 const pic = e.target.closest('.paint.live');
 if (pic && RUN?.r?.game === 'color') { const g = e.target.closest('[data-r]'); if (!g) return; const r = RUN.r; if (!r.crayon) { say('Pick a crayon first.'); return; } r.paint[`${pic.dataset.pic}.${g.dataset.r}`] = r.crayon; render(); return; }
 const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; const a = b.dataset.act;
 if (a === 'home') { e.preventDefault(); RUN = null; render(); return; }
 if (a === 'start') { startDay(); return; }
 if (!RUN) return; const r = RUN.r;
 if (a === 'hear') { say(r.phase === 'look' ? r.teach : r.ask || 'Pick a crayon, then tap a part to color it.'); return; }
 if (a === 'tip') { RUN.tip = !RUN.tip; render(); return; }
 if (a === 'hide') { if (Date.now() - RUN.shownAt < 1200) return; r.phase = r.game === 'spot' ? 'ask' : 'paint'; RUN.tip = false; render(); say(r.game === 'spot' ? r.ask : 'Now color it from memory. Pick a crayon, then tap a part.'); return; }
 if (a === 'spot') { const k = Number(b.dataset.k); r.picked = k; r.ok = r.choices[k].right; r.moved = scoreSpot(r.ok); if (r.ok) RUN.stars++; RUN.results.push(r.ok); persist(); render(); say(r.ok ? 'Yes! That’s the one you saw.' : `Not quite. The one you saw has a check mark.`); return; }
 if (a === 'crayon') { r.crayon = b.dataset.c; render(); return; }
 if (a === 'check') { r.right = r.regions.filter(g => r.paint[g.id] === g.want).length; const n = r.regions.length; r.stars = r.right === n ? 3 : r.right / n >= .66 ? 2 : 1; RUN.stars += r.stars; if (r.right === n) { RUN.perfect++; addXp(5); } r.moved = scoreColor(r.right, n); r.phase = 'checked'; persist(); render(); say(r.right === n ? 'Perfect memory! Every color is right!' : `${r.right} of ${n} colors right. Look at the picture you saw.`); return; }
 if (a === 'next') { RUN.i++; nextRound(); }
});
if (QS.has('test')) window.__pm = { S: () => S, RUN: () => RUN };
render();
if (QS.has('today') && !S.days[dayKey()]?.done) startDay();
