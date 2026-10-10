// Sound Code: learn to decode written English, a few minutes a day (for young readers and adults).
// Built from "Learning to Decode Written English" (blueprint part 1) and its starter item bank: a placement check,
// 16 modules from letter sounds to long words, a daily mixed session with spaced review, and mastery checks on
// words never practised. No timers, no speech recognition: tasks are scored by what the learner taps; reading
// aloud is self-checked, or scored by a helper with the blueprint's prompt levels.
import {MODULE_CONTENT as C} from './content.js?v=sc-1';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=1';
import {UNITS, MODULES, spell, taughtBy} from './inventory.js?v=sc-1';
import {fresh, modState, buildSession, checkSession, finishSession, probeItems, module0, letterPositions, shuffled, dayKey, addDays} from './engine.js?v=sc-1';

const app = document.querySelector('#app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);
const TODAY = () => dayKey();

// ---------- player + save ----------
function player(){ try { const r = JSON.parse(localStorage.getItem('wordraiders.players.v1') || 'null'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Reader' }; } catch { return { id: 'guest', name: 'Reader' }; } }
const P = player(), KEY = `wr-soundcode.${P.id}`;
let S; try { S = { ...fresh(), ...(JSON.parse(localStorage.getItem(KEY) || 'null') || {}) }; } catch { S = fresh(); }
function persist(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }
const kid = () => S.learner !== 'adult';

// ---------- speech: the same voice, speed and volume the player chose in WordRaiders (../wr-voice.js) ----------
const muted = () => !!voiceBlocked();
function say(t){ const why = voiceBlocked(); if (why) { flash(why); return; } speak(t); }
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); if (!el) return; el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 3500); }
const play = (text, label = 'Listen') => `<button class="play" data-act="say" data-text="${esc(text)}" aria-label="${esc(label)}">▶</button>`;

// ---------- content helpers ----------
const MOD = n => n === 0 ? module0() : C[n];
const word = (m, w) => MOD(m)?.words.find(x => x.w === w);
const unitLabel = u => u.replace(/^\+/, '-').replace(/:.*$/, '').replace(/^([aeiou])_e$/, '$1…e');
const anchorOf = u => { for (const k of Object.keys(UNITS)) if (u in UNITS[k]) return UNITS[k][u]; return null; };
function unitTip(u){
 const a = anchorOf(u), g = unitLabel(u);
 if (/^\+ed:t/.test(u)) return '-ed says “t” here, as in jumped.'; if (/^\+ed:d/.test(u)) return '-ed says “d” here, as in filled.'; if (/^\+ed:id/.test(u)) return '-ed is its own beat here, as in rested.';
 if (/_e$/.test(u)) return `${g}: the final e is silent and makes the vowel say its name, as in ${a}.`;
 if (u.length > 1 && !u.startsWith('+')) return `${g}: these letters work together for one sound, as in ${a}.`;
 return a ? `${g} sounds like the start of ${a}.` : '';
}
function targetUnit(w){ if (!w.units) return null; const us = w.units.split('.'); return us.find(u => u === w.fam) || us.find(u => w.fam && u.startsWith(w.fam)) || us.find(u => u.length > 1 && !/^[a-z]$/.test(u)) || null; }
function explain(w){ const u = targetUnit(w); return u ? unitTip(u) : w.beats ? `Beats: ${w.beats.split('.').join(' · ')}.` : w.tricky ? `In ${w.w}, “${w.tricky}” is the tricky part: it says ${w.trickySay}.` : ''; }
const highlight = (w, units) => { if (!units) return esc(w.w); const pos = letterPositions(units), tu = targetUnit({ ...w, units }); const on = new Set((pos.find(p => p.u === tu) || { at: [] }).at); return [...w.w].map((c, i) => on.has(i) ? `<b class="hl">${esc(c)}</b>` : esc(c)).join(''); };

// ---------- the round runner ----------
let V = { screen: 'home' };   // what is on screen
let RUN = null;               // { ses, i, results, task state }
function startSession(ses){ RUN = { ses, i: -1, results: [], lesson: ses.lesson ? 0 : null }; if (ses.lesson) { V = { screen: 'lesson' }; render(); return; } nextItem(); }
function nextItem(){
 RUN.i++; RUN.t = null;
 if (RUN.i >= RUN.ses.items.length) { endSession(); return; }
 const it = RUN.ses.items[RUN.i]; RUN.t = { it, tries: 0, picked: [], sel: [], cuts: [], built: [], done: false, msg: '' };
 if (it.task === 'read' || it.task === 'anchor') RUN.t.opts = null;
 V = { screen: 'item' }; render();
 if (['hear', 'spell', 'letter', 'stress'].includes(it.task)) setTimeout(() => sayItem(), 300);
}
const isCheck = () => RUN && (RUN.ses.kind === 'check' || RUN.ses.kind === 'probe');
function sayItem(){ if (!RUN || !RUN.t) return; const it = RUN.t.it; if (it.task === 'letter') say(word(0, it.w).anchorWord); else if (it.w) say(it.w); }
// answer: ok = right; in practice a wrong first answer gets a hint and one more try, then the answer is shown.
function answer(ok, wrongMsg, rightMsg){
 const t = RUN.t; if (t.done) return;
 if (ok) { t.done = true; t.ok = t.tries === 0; t.prompt = Math.min(t.tries, 3); t.msg = rightMsg || 'Yes!'; return; }
 t.tries++;
 if (isCheck()) { t.done = true; t.ok = false; t.prompt = 0; t.msg = ''; return; }   // checks: first answer only, feedback at the end
 if (t.tries === 1) { t.msg = wrongMsg || 'Not quite. Look again.'; t.hint = true; return; }
 t.done = true; t.ok = false; t.prompt = 3; t.msg = rightMsg ? 'Here it is. ' + rightMsg : 'Here is the answer.'; t.reveal = true;
}
function recordItem(){ const t = RUN.t; RUN.results.push({ m: t.it.m, w: t.it.w, task: t.it.task, tag: t.it.tag, ok: !!t.ok, prompt: t.prompt || 0, kind: t.it.task === 'sentence' || t.it.task === 'passage' ? 'sentence' : undefined, i: t.it.sentence ?? t.it.passage, q: t.qOk }); }

// ---------- item views ----------
function itemView(){
 const t = RUN.t, it = t.it, w = it.w != null ? word(it.m, it.w) : null;
 const n = RUN.ses.items.length, head = `<div class="prog"><span style="width:${Math.round(RUN.i / n * 100)}%"></span></div><p class="muted small">${RUN.ses.kind === 'check' ? `Check ${RUN.ses.form === 'keep' ? '(after a week)' : RUN.ses.form === 'A' ? '1' : '2'} · ` : RUN.ses.kind === 'probe' ? 'Starting check · ' : ''}${RUN.i + 1} of ${n}${it.tag === 'transfer' ? ' · a new word' : it.tag === 'unseen' ? ' · a word you haven’t practised' : ''}</p>`;
 let body = '';
 const T = it.task;
 const doneBar = () => t.done ? `${t.msg && !isCheck() ? `<p class="fb ${t.ok ? 'ok' : t.reveal ? 'shown' : ''}">${t.msg}</p>` : ''}<button class="primary" data-act="next">Next ▸</button>` : (t.msg ? `<p class="fb">${t.msg}</p>` : '');
 if (T === 'read') {
  if (!t.opts) t.opts = shuffled([w.w, ...w.audioFoils]);
  body = `<div class="big-word">${t.hint ? highlight(w, w.units) : esc(w.w)}</div><p class="q">${kid() ? 'Say it yourself first. Then listen to each one and pick the one that matches.' : 'Read it to yourself first. Then play each option and choose the one that matches the spelling.'}</p>
  <div class="opts">${t.opts.map((o, i) => `<div class="opt ${t.done && o === w.w ? 'right' : ''} ${t.picked.includes(i) ? 'no' : ''}"><button class="play big" data-act="say" data-text="${esc(o)}" aria-label="Play option ${i + 1}">▶ ${i + 1}</button><button class="pickbtn" data-act="pick" data-i="${i}" ${t.done || t.picked.includes(i) ? 'disabled' : ''}>This one</button></div>`).join('')}</div>` + doneBar();
 } else if (T === 'hear') {
  if (!t.opts) t.opts = shuffled([w.w, ...w.spellFoils]);
  body = `<div class="hear-row"><button class="play huge" data-act="sayitem" aria-label="Hear the word">🔊</button></div><p class="q">Which spelling matches what you hear?</p>
  <div class="choices">${t.opts.map((o, i) => `<button class="${t.done && o === w.w ? 'right' : ''}" data-act="pick" data-i="${i}" ${t.done || t.picked.includes(i) ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>` + doneBar();
 } else if (T === 'anchor') {
  const a = w.anchor; if (!t.opts) t.opts = shuffled([a.right, ...a.foils]);
  const pos = w.units ? letterPositions(w.units) : []; const on = new Set((pos.find(p => p.u === a.unit) || { at: [] }).at);
  body = `<div class="big-word">${[...w.w].map((c, i) => on.has(i) ? `<b class="hl">${esc(c)}</b>` : esc(c)).join('')}</div><p class="muted small">A made-up word — memory can’t help, only the letters can.</p><p class="q">The <b>${esc(unitLabel(a.unit))}</b> here sounds like the same part of which word?</p>
  <div class="opts">${t.opts.map((o, i) => `<div class="opt ${t.done && o === a.right ? 'right' : ''} ${t.picked.includes(i) ? 'no' : ''}"><button class="play big" data-act="say" data-text="${esc(o)}" aria-label="Play ${esc(o)}">▶</button><span class="optw">${esc(o)}</span><button class="pickbtn" data-act="pick" data-i="${i}" ${t.done || t.picked.includes(i) ? 'disabled' : ''}>This one</button></div>`).join('')}</div>` + doneBar();
 } else if (T === 'mark' || T === 'tricky') {
  const target = T === 'mark' ? new Set((letterPositions(w.units).find(p => p.u === (w.invented ? w.anchor.unit : targetUnit(w))) || { at: [] }).at) : new Set([...Array(w.tricky.length)].map((_, k) => w.w.indexOf(w.tricky) + k));
  t.target = target;
  const q = T === 'tricky' ? 'Tap the letters that don’t follow the usual sounds.' : target.size > 1 && /_e$/.test(targetUnit(w) || w.anchor?.unit || '') ? 'Tap the two letters that work together to make the vowel sound.' : 'Tap the letters that work together to make ONE sound.';
  body = `<div class="letters">${[...w.w].map((c, i) => `<button class="lt ${t.sel.includes(i) ? 'on' : ''} ${t.done && target.has(i) ? 'right' : ''}" data-act="lt" data-i="${i}" ${t.done ? 'disabled' : ''}>${esc(c)}</button>`).join('')}</div>${play(w.invented ? '' : w.w)}<p class="q">${q}</p>
  ${!t.done ? `<button class="primary" data-act="checkmark" ${t.sel.length ? '' : 'disabled'}>Check</button>` : ''}` + doneBar();
  if (w.invented) body = body.replace(play(''), '');
 } else if (T === 'spell') {
  const us = w.units.split('.'); if (!t.tiles) { const pool = Object.keys(taughtBy(it.m)).filter(u => !us.includes(u) && !u.startsWith('+') === !us[us.length - 1].startsWith('+')); t.tiles = shuffled([...us, ...shuffled(pool).slice(0, 2)]).map((u, k) => ({ u, k })); }
  body = `<div class="hear-row"><button class="play huge" data-act="sayitem" aria-label="Hear the word">🔊</button></div><p class="q">Build the word: one box for each sound.</p>
  <div class="boxes">${us.map((_, i) => `<span class="box ${t.done ? (t.built[i]?.u === us[i] ? 'right' : 'shown') : ''}">${t.done && !t.ok && t.reveal ? esc(unitLabel(us[i])) : t.built[i] ? esc(unitLabel(t.built[i].u)) : ''}</span>`).join('')}</div>
  <div class="tiles">${t.tiles.map(x => `<button class="tile-u" data-act="tile" data-k="${x.k}" ${t.done || t.built.includes(x) ? 'disabled' : ''}>${esc(unitLabel(x.u))}</button>`).join('')}</div>
  ${!t.done ? `<div class="row"><button class="btn" data-act="untile" ${t.built.length ? '' : 'disabled'}>↩ Undo</button><button class="primary" data-act="checkspell" ${t.built.length === us.length ? '' : 'disabled'}>Check</button></div>` : ''}` + doneBar();
 } else if (T === 'edsort') {
  const right = (w.units.match(/\+ed:(t|d|id)/) || [])[1]; t.right = right;
  const lab = { t: ['t', 'jumped'], d: ['d', 'filled'], id: ['id (an extra beat)', 'rested'] };
  body = `<div class="big-word">${esc(w.w)}</div><p class="q">What does <b>-ed</b> sound like in this word?</p><div class="opts">${['t', 'd', 'id'].map(k => `<div class="opt ${t.done && k === right ? 'right' : ''}"><button class="play big" data-act="say" data-text="${lab[k][1]}" aria-label="Hear ${lab[k][1]}">▶</button><span class="optw">“${lab[k][0]}” as in ${lab[k][1]}</span><button class="pickbtn" data-act="ed" data-k="${k}" ${t.done || t.picked.includes(k) ? 'disabled' : ''}>This one</button></div>`).join('')}</div>` + doneBar();
 } else if (T === 'beats' || T === 'parts') {
  const letters = [...w.w];
  body = `<div class="split">${letters.map((c, i) => `<span class="ltr">${esc(c)}</span>${i < letters.length - 1 ? `<button class="gap ${t.cuts.includes(i + 1) ? 'on' : ''}" data-act="cut" data-i="${i + 1}" ${t.done ? 'disabled' : ''} aria-label="cut after ${esc(letters.slice(0, i + 1).join(''))}">${t.cuts.includes(i + 1) ? '|' : ''}</button>` : ''}`).join('')}</div>${play(w.w)}
  <p class="q">${T === 'beats' ? 'Cut it into beats: each piece needs a vowel. Then read the pieces and join them.' : 'Does it have a real word part (like re-, un-, -ful)? Tap where the part joins — or say there’s none.'}</p>
  ${!t.done ? `<div class="row">${T === 'parts' ? `<button class="btn" data-act="noparts">No word part</button>` : ''}<button class="primary" data-act="checkcut" ${t.cuts.length || T === 'parts' ? '' : 'disabled'}>Check</button></div>` : ''}` + doneBar();
 } else if (T === 'stress') {
  const beats = w.beats.split('.');
  body = `<div class="hear-row"><button class="play huge" data-act="sayitem" aria-label="Hear the word">🔊</button></div><p class="q">Which beat is the strong one?</p><div class="beats">${beats.map((b, i) => `<button class="${t.done && b === b.toUpperCase() ? 'right' : ''}" data-act="beat" data-i="${i}" ${t.done || t.picked.includes(i) ? 'disabled' : ''}>${esc(b.toLowerCase())}</button>`).join('')}</div>` + doneBar();
 } else if (T === 'letter') {
  const W = word(0, it.w); if (!t.opts) t.opts = shuffled([it.w, ...shuffled(Object.keys(UNITS[1]).filter(l => l !== it.w)).slice(0, 2)]);
  body = `<div class="hear-row"><button class="play huge" data-act="sayitem" aria-label="Hear the word">🔊</button></div><p class="q">Which letter makes the first sound of the word you hear?</p><div class="choices letters3">${t.opts.map((o, i) => `<button class="${t.done && o === it.w ? 'right' : ''}" data-act="pick" data-i="${i}" ${t.done || t.picked.includes(i) ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>` + doneBar();
  void W;
 } else if (T === 'case') {
  if (!t.opts) t.opts = shuffled([it.w, ...shuffled(['b', 'd', 'p', 'q', 'n', 'm', 'h', 'u'].filter(l => l !== it.w)).slice(0, 2)]);
  body = `<div class="big-word">${esc(it.w.toUpperCase())}</div><p class="q">Which small letter matches?</p><div class="choices letters3">${t.opts.map((o, i) => `<button class="${t.done && o === it.w ? 'right' : ''}" data-act="pick" data-i="${i}" ${t.done || t.picked.includes(i) ? 'disabled' : ''}>${esc(o)}</button>`).join('')}</div>` + doneBar();
 } else if (T === 'sentence' || T === 'passage') {
  const M = MOD(it.m), s = T === 'sentence' ? M.sentences[it.sentence] : M.passages[it.passage], sup = new Set((s.support || []).map(x => x.toLowerCase()));
  const text = s.text.split(/(\s+)/).map(tok => { const bare = tok.toLowerCase().replace(/[^a-z']/g, ''); return sup.has(bare) ? `<button class="sup" data-act="say" data-text="${esc(bare)}" title="Support word: tap to hear">${esc(tok)}</button>` : esc(tok); }).join('');
  if (!t.stage) t.stage = 'read';
  const helperBtns = [['0', 'No help'], ['1', 'A reminder'], ['2', 'A clue'], ['3', 'Needed a model'], ['4', 'Words given']];
  body = `<div class="text-card ${T}">${text}</div>${sup.size ? `<p class="muted small">Underlined words are support words: tap to hear them.</p>` : ''}`;
  if (t.stage === 'read') body += S.helper
   ? `<p class="q">Read it aloud to your helper.</p><p class="muted small">Helper: how much help was needed?</p><div class="helper">${helperBtns.map(([k, l]) => `<button data-act="oral" data-k="${k}">${l}</button>`).join('')}</div>`
   : `<p class="q">Read it aloud. Then listen to check yourself.</p><div class="row">${play(s.text, 'Hear it read')}<button class="btn" data-act="oral" data-k="0">I read it all</button><button class="btn" data-act="oral" data-k="2">I needed help</button></div>`;
  else if (t.stage === 'q') body += `<p class="q">${esc(s.q)}</p><div class="row yn"><button class="primary" data-act="yn" data-v="1">Yes</button><button class="primary" data-act="yn" data-v="0">No</button></div>`;
  else body += `<p class="fb ${t.qOk ? 'ok' : ''}">${t.qOk ? 'Yes!' : `The answer is ${s.a ? 'yes' : 'no'}.`}</p><button class="primary" data-act="next">Next ▸</button>`;
 }
 return bar(RUN.ses.kind === 'check' ? 'Mastery check' : RUN.ses.kind === 'probe' ? 'Starting check' : `Module ${RUN.ses.m}`) + `<main class="round">${head}<section class="card">${body}</section></main>`;
}

// ---------- handlers ----------
function onPick(i){
 const t = RUN.t, it = t.it, w = word(it.m, it.w);
 const right = it.task === 'anchor' ? w.anchor.right : (it.task === 'letter' || it.task === 'case') ? it.w : w.w;
 const o = t.opts[i]; if (o !== right) t.picked.push(i);
 const ex = w && !w.letter ? explain(w) : '';
 if (it.task === 'read') answer(o === right, `That one was “${esc(o)}”. ${esc(ex)} Look at the letters and try again.`, `“${esc(w.w)}”. ${esc(ex)}`);
 else if (it.task === 'hear') answer(o === right, `Listen again and look at each letter. ${esc(ex)}`, `It’s spelled <b>${esc(w.w)}</b>. ${esc(ex)}`);
 else if (it.task === 'anchor') answer(o === right, `Look at the highlighted letters again. ${esc(unitTip(w.anchor.unit))}`, `${esc(unitTip(w.anchor.unit))}`);
 else if (it.task === 'letter') answer(o === right, `Listen to the very first sound of “${esc(word(0, it.w).anchorWord)}”.`, `${esc(it.w)} — as in ${esc(word(0, it.w).anchorWord)}.`);
 else answer(o === right, 'Look at the shape: which way does it face?', `${esc(it.w.toUpperCase())} and ${esc(it.w)}.`);
}
function onCheckMark(){ const t = RUN.t, w = word(t.it.m, t.it.w), sel = new Set(t.sel), ok = sel.size === t.target.size && [...sel].every(i => t.target.has(i));
 if (!ok) t.sel = []; const ex = t.it.task === 'tricky' ? `“${w.tricky}” says ${w.trickySay}.` : w.invented ? unitTip(w.anchor.unit) : explain(w);
 answer(ok, `Not quite. ${esc(ex)}`, esc(ex)); }
function onCheckSpell(){ const t = RUN.t, w = word(t.it.m, t.it.w), us = w.units.split('.'), ok = t.built.every((x, i) => x.u === us[i]);
 if (!ok) t.built = []; answer(ok, `Listen again, sound by sound. ${esc(explain(w))}`, `${esc(w.w)}: ${us.map(unitLabel).join(' · ')}`); }
function onCheckCut(noParts){
 const t = RUN.t, w = word(t.it.m, t.it.w), letters = w.w, cuts = [...t.cuts].sort((a, b) => a - b);
 if (t.it.task === 'beats') {
  const pieces = []; let a = 0; [...cuts, letters.length].forEach(c => { pieces.push(letters.slice(a, c)); a = c; });
  const want = w.beats.split('.').length, ok = pieces.length === want && pieces.every(p => /[aeiouy]/.test(p));
  if (!ok) t.cuts = []; answer(ok, `It has ${want} beats, and each piece needs a vowel. Try again.`, `One good way: ${esc(w.beats.toLowerCase().split('.').join(' · '))}${ok && pieces.join('.') !== w.beats.toLowerCase() ? ' (your cut works too)' : ''}.`);
 } else {
  const parts = w.parts || []; const bounds = []; let a = 0; parts.slice(0, -1).forEach(p => { a += p.replace(/-/g, '').length; bounds.push(a); });
  const ok = noParts ? parts.length === 0 : parts.length > 0 && cuts.length === bounds.length && cuts.every((c, i) => c === bounds[i]);
  if (!ok) t.cuts = []; answer(ok, parts.length ? 'Look for a part you know at the start or the end.' : 'Look again: is that really a part with a meaning here?', parts.length ? `${esc(parts.join(' + '))}` : `“${esc(w.w)}” has no real word part — the letters just look like one.`);
 }
}

// ---------- session end ----------
function endSession(){
 const ses = RUN.ses, today = TODAY();
 if (ses.kind === 'probe') { probeNext(); return; }
 const out = finishSession(S, C, ses, RUN.results, today); persist();
 addXp(ses.kind === 'check' ? 20 : 10);
 V = { screen: 'done', out }; render();
}

// ---------- placement ----------
let PL = null;
function startPlacement(){ PL = { m: 0, phase: 'one', log: [] }; probeRound(); }
function probeRound(){
 const all = probeItems(C, PL.m); if (!all.length) { placeAt(PL.m); return; }
 const items = PL.phase === 'one' ? all.slice(0, 1) : all.slice(1);
 RUN = { ses: { kind: 'probe', m: PL.m, items }, i: -1, results: [] }; nextItem();
}
function probeNext(){
 const res = RUN.results; PL.log.push(...res);
 const mres = PL.log.filter(r => r.m === PL.m);
 if (PL.phase === 'one' && res.every(r => r.ok)) return advanceProbe();
 if (PL.phase === 'one') { PL.phase = 'all'; return probeRound(); }
 const need = PL.m === 0 ? 2 : 3;   // 3 of 4 (module 0: 2 of 3)
 if (mres.filter(r => r.ok).length >= need) return advanceProbe();
 placeAt(PL.m);
}
function advanceProbe(){ const nx = PL.m + 1; if (nx > 15 || !(nx === 0 || C[nx])) { placeAt(Math.min(15, nx)); return; } PL.m = nx; PL.phase = 'one'; probeRound(); }
function placeAt(n){
 S.placed = { day: TODAY(), start: n }; S.module = n;
 for (let k = 0; k < n; k++) { const ms = modState(S, k); if (ms.state === 'practice') { ms.state = 'keep'; ms.keepDue = addDays(TODAY(), 7); ms.placedOut = true; } }
 persist(); RUN = null; V = { screen: 'placed', n }; render();
}

// ---------- screens ----------
function bar(title){ const inside = RUN || V.screen !== 'home'; return `<div class="bar"><a href="${inside ? '#' : '../#/home'}" data-act="${inside ? 'home' : ''}" class="back">${inside ? '← Sound Code' : '← WordRaiders'}</a><span class="title">${esc(title)}</span><span class="count">${esc(P.name)}</span></div>`; }
const STATE_LABEL = { practice: 'Practising', checkA: 'Ready for check 1', checkB: 'Check 2 next', keep: 'Secure · re-check due', mastered: 'Mastered ✓' };
function homeView(){
 if (!S.learner) return bar('Sound Code') + `<main><p class="eyebrow">SOUND CODE</p><h1>Crack the sound code</h1><p class="lead">Learn how written words turn into spoken words — a few minutes a day.</p><h2>Who is learning?</h2>
 <div class="who"><button class="lv" data-act="learner" data-v="kid"><b>A young reader</b><small>Short, simple steps</small></button><button class="lv" data-act="learner" data-v="adult"><b>An older reader or adult</b><small>Plain explanations, same practice</small></button></div></main>`;
 if (!S.placed) return bar('Sound Code') + `<main><p class="eyebrow">SOUND CODE</p><h1>Find your starting point</h1>
 <p class="lead">${kid() ? 'A quick game finds where to start. Some words are made up, so you can’t just remember them.' : 'This short check finds which parts are already working and which need building. Some items are invented words, so memory can’t do the work. It isn’t a test, there’s no timer, and you can stop any time.'}</p>
 <button class="primary big" data-act="place">▶ Start the check</button><button class="btn wide" data-act="skipplace">Start from the beginning instead</button>${settingsView()}</main>`;
 const today = TODAY(), d = S.days[today], ms = modState(S, S.module), M = MODULES[S.module];
 const keepDue = Object.entries(S.mods).find(([, m]) => m.state === 'keep' && m.keepDue && m.keepDue <= today);
 const what = keepDue ? `A one-week re-check of module ${keepDue[0]}` : ms.state === 'checkA' ? `Mastery check 1 for module ${S.module}` : ms.state === 'checkB' && ms.checkA?.day !== today ? `Mastery check 2 for module ${S.module}` : !ms.lessonDone ? `New: ${M.title}` : `Practice: ${M.title}`;
 const mods = MODULES.map(m => { const st = S.mods[m.n]; const cur = m.n === S.module; const avail = !!MOD(m.n); const acc = st && st.recent.length ? Math.round(st.recent.filter(Boolean).length / st.recent.length * 100) : null;
  return `<li class="mod ${cur ? 'cur' : ''} ${st?.state || ''}"><span class="mn">${m.n}</span><span class="mt"><b>${esc(m.title)}</b><small>${esc(m.short)}${st ? ` · ${STATE_LABEL[st.state]}${st.placedOut && st.state !== 'mastered' ? ' (from the starting check)' : ''}` : avail ? '' : ' · coming soon'}${acc != null && st.state === 'practice' ? ` · ${acc}% first try lately` : ''}</small></span></li>`; }).join('');
 return bar('Sound Code') + `<main><p class="eyebrow">SOUND CODE · TODAY</p>
 <section class="today ${d?.done ? 'done' : ''}">${d?.done ? `<h2>✓ Today’s session is done</h2><p class="muted">Come back tomorrow: spaced practice is what makes it stick.</p><div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><button class="btn" data-act="go">Practise more</button></div>` : `<h2>${esc(what)}</h2><p class="muted">About 6–8 minutes · no timer</p><button class="primary big" data-act="go">▶ Start today’s session</button>`}</section>
 <h2>Your path</h2><ol class="mods">${mods}</ol>
 <p class="small">Want lessons with more pictures? The <a href="../#/library" class="lnk">Phonics &amp; Decoding Academy</a> in the Library covers the same sounds.</p>
 ${settingsView()}${aboutView()}</main>`;
}
function settingsView(){
 return `<details class="about"><summary>Settings</summary>
 <label class="tog"><input type="checkbox" data-act="helper" ${S.helper ? 'checked' : ''}> A helper listens when I read aloud (they score how much help was needed)</label>
 <label class="tog">Learner: <select data-act="learner-sel"><option value="kid" ${kid() ? 'selected' : ''}>Young reader</option><option value="adult" ${!kid() ? 'selected' : ''}>Older reader or adult</option></select></label>
 ${S.placed ? `<button class="linkish" data-act="replace">Run the starting check again</button>` : ''}</details>`;
}
function aboutView(){
 return `<details class="about"><summary>How Sound Code works</summary>
 <p class="small">Each day: a short warm-up of older words, the current pattern, two brand-new words to test transfer, a spelling or two, and a sentence to read aloud. Words come back on a 1, 3, 7, 14, 30-day ladder. A module is mastered after two different 20-item checks on different days (19 of 20 right, 9 of 10 on words never practised, and no pattern missed twice) and a re-check a week later. Only the first answer counts in a check, and there is never a timer.</p>
 <p class="small">Reading aloud is never judged by a microphone. You check yourself against the voice — or a helper records how much help was needed (none, a reminder, a clue, a model, or the word given), as in the blueprint’s score sheet.</p>
 <p class="small muted">Based on the WordRaiders “Learning to Decode Written English” blueprint, which draws on the National Reading Panel (2000), the IES Foundational Skills practice guide (2016), Ehri (2014) on orthographic mapping, Castles, Rastle &amp; Nation (2018), and adult-literacy reviews (Kruidenier et al. 2010; Alamprese et al. 2011; National Research Council 2012). Its thresholds and schedule are design choices, not clinical cutoffs, and this is not a diagnosis of any reading difficulty.</p></details>`;
}
function lessonView(){
 const L = RUN.ses.lesson, M = MOD(RUN.ses.m), step = RUN.lesson;
 const models = L.models.map(x => word(RUN.ses.m, x.w) || { w: x.w });
 let body;
 if (step === 0) body = `<p class="eyebrow">NEW · MODULE ${RUN.ses.m}</p><h1>${esc(MODULES[RUN.ses.m].title)}</h1><p class="lead">${esc(kid() ? L.kid : L.idea)}</p>${kid() ? '' : `<p class="muted">${esc(L.limit)}</p>`}<div class="row">${play(kid() ? L.kid : L.idea + ' ' + L.limit, 'Hear this')}<button class="primary" data-act="lnext">Show me ▸</button></div>`;
 else { const x = L.models[step - 1], w = models[step - 1];
  body = `<p class="eyebrow">WATCH · ${step} of 2</p><div class="big-word">${w.units ? highlight(w, w.units) : esc(x.w)}</div>${w.units ? `<p class="units">${w.units.split('.').map(u => `<span>${esc(unitLabel(u))}</span>`).join('')}</p>` : w.beats ? `<p class="units">${w.beats.split('.').map(b => `<span>${esc(b)}</span>`).join('')}</p>` : ''}<p class="lead">${esc(x.think)}</p><div class="row">${play(x.think, 'Hear the explanation')}${play(x.w, 'Hear the word')}<button class="primary" data-act="lnext">${step === 2 ? 'Now you try ▸' : 'Next ▸'}</button></div>`; }
 return bar(`Module ${RUN.ses.m}`) + `<main class="round"><section class="card">${body}</section></main>`;
}
function doneView(){
 const o = V.out || {}, res = RUN?.results || [], ses = RUN?.ses, first = res.filter(r => r.ok).length;
 const missed = res.filter(r => !r.ok && r.w != null).map(r => word(r.m, r.w)).filter(Boolean);
 let head;
 if (ses?.kind === 'check') {
  const s = o.score;
  head = `<h1>${o.pass ? '✓ Check passed' : 'Check done'}</h1><p class="lead">${s.right} of ${s.total} right${s.unseen ? `, ${s.unseenRight} of ${s.unseen} on words you hadn’t practised` : ''}.</p>
  <p>${ses.form === 'keep' ? (o.pass ? `Module ${ses.m} is <b>mastered</b>. It still comes back now and then so it stays strong.` : 'A few slipped after a week — that’s normal. They’ll come back in practice, then another re-check in 3 days.') : o.pass ? (ses.form === 'A' ? 'Next time: check 2, with different words, on another day.' : `Module ${ses.m} is <b>secure</b>. A re-check comes in a week. On to the next module!`) : `Not yet — ${s.repeated.length ? `the pattern${s.repeated.length > 1 ? 's' : ''} ${s.repeated.map(f => `<b>${esc(unitLabel(f))}</b>`).join(', ')} needs more practice` : 'a little more practice first'}. You’ll get another check once practice is steady again.`}</p>`;
 } else head = `<h1>Session done</h1><p class="lead">${first} of ${res.length} right on the first try.</p>${o.ready ? `<p class="ok-line">Practice is steady: your next session is <b>mastery check 1</b>.</p>` : ''}`;
 const list = missed.length ? `<h2>Worth another look</h2><ul class="missed">${[...new Map(missed.map(w => [w.w, w])).values()].slice(0, 8).map(w => `<li>${play(w.letter ? w.anchorWord : w.invented ? '' : w.w)}<b>${esc(w.w)}</b> <span class="muted">${esc(w.letter ? `as in ${w.anchorWord}` : w.invented ? unitTip(w.anchor.unit) : explain(w))}</span></li>`).join('').replace(/<button class="play" data-act="say" data-text="" aria-label="Listen">▶<\/button>/g, '')}</ul>` : '';
 return bar('Sound Code') + `<main class="round"><section class="card result">${head}${list}<div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a><button class="btn" data-act="home">Sound Code</button></div></section></main>`;
}
function placedView(){
 const n = V.n, M = MODULES[n];
 return bar('Sound Code') + `<main><section class="card result"><h1>Your starting point</h1><p class="lead">Start with <b>module ${n}: ${esc(M.title)}</b>.</p><p class="muted">${n ? `Modules before it look secure. They’ll still get a quick re-check in a week, just to be sure.` : 'We’ll start with letters and their sounds.'}</p><button class="primary big" data-act="go">▶ Start today’s session</button></section></main>`;
}
function render(){
 app.innerHTML = V.screen === 'lesson' ? lessonView() : V.screen === 'item' ? itemView() : V.screen === 'done' ? doneView() : V.screen === 'placed' ? placedView() : homeView();
}

// ---------- events ----------
app.addEventListener('change', e => { const a = e.target.dataset.act;
 if (a === 'helper') S.helper = e.target.checked;
 if (a === 'learner-sel') S.learner = e.target.value;
 persist(); render(); });
app.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled || b.tagName === 'INPUT' || b.tagName === 'SELECT') return; const a = b.dataset.act;
 if (a === 'say') { if (b.dataset.text) say(b.dataset.text); return; }
 if (a === 'sayitem') { sayItem(); return; }
 if (a === 'home') { e.preventDefault(); RUN = null; PL = null; V = { screen: 'home' }; render(); window.scrollTo(0, 0); return; }
 if (a === 'learner') { S.learner = b.dataset.v; persist(); render(); return; }
 if (a === 'place' || a === 'replace') { startPlacement(); return; }
 if (a === 'skipplace') { S.placed = { day: TODAY(), start: 0, skipped: true }; S.module = 0; persist(); render(); return; }
 if (a === 'go') { const ses = buildSession(S, C, TODAY()); if (!ses) { flash('This module is still being written.'); return; } startSession(ses); window.scrollTo(0, 0); return; }
 if (a === 'lnext') { RUN.lesson++; if (RUN.lesson > 2) { RUN.lesson = null; nextItem(); } else render(); return; }
 if (!RUN || !RUN.t) return;
 const t = RUN.t;
 if (a === 'next') { recordItem(); nextItem(); window.scrollTo(0, 0); return; }
 if (a === 'pick') onPick(Number(b.dataset.i));
 else if (a === 'lt') { const i = Number(b.dataset.i); t.sel = t.sel.includes(i) ? t.sel.filter(x => x !== i) : [...t.sel, i]; }
 else if (a === 'checkmark') onCheckMark();
 else if (a === 'tile') { const x = t.tiles.find(y => y.k === Number(b.dataset.k)); if (x && t.built.length < word(t.it.m, t.it.w).units.split('.').length) t.built.push(x); }
 else if (a === 'untile') t.built.pop();
 else if (a === 'checkspell') onCheckSpell();
 else if (a === 'ed') { const k = b.dataset.k; if (k !== t.right) t.picked.push(k); answer(k === t.right, 'Say the word and listen to its very end.', { t: '-ed says “t” here.', d: '-ed says “d” here.', id: '-ed is its own beat here: “id”.' }[t.right]); }
 else if (a === 'cut') { const i = Number(b.dataset.i); t.cuts = t.cuts.includes(i) ? t.cuts.filter(x => x !== i) : [...t.cuts, i]; }
 else if (a === 'checkcut') onCheckCut(false);
 else if (a === 'noparts') onCheckCut(true);
 else if (a === 'beat') { const w = word(t.it.m, t.it.w), beats = w.beats.split('.'), i = Number(b.dataset.i), ok = beats[i] === beats[i].toUpperCase(); if (!ok) t.picked.push(i); answer(ok, 'Listen again: which beat is louder and longer?', `The strong beat: ${esc(beats.map(x => x === x.toUpperCase() ? x : x.toLowerCase()).join('-'))}.`); }
 else if (a === 'oral') { const k = Number(b.dataset.k); S.oral.reads++; S.oral.prompts[k] = (S.oral.prompts[k] || 0) + 1; t.ok = k === 0; t.prompt = k; t.done = true; t.stage = 'q'; }
 else if (a === 'yn') { const M = MOD(t.it.m), s = t.it.task === 'sentence' ? M.sentences[t.it.sentence] : M.passages[t.it.passage]; t.qOk = (b.dataset.v === '1') === s.a; t.stage = 'a'; }
 persist(); render();
});
// The Today list sends learners here with ?today=1: go straight into the day's session when there is one to do.
if (QS.has('today') && S.learner && S.placed && !S.days[TODAY()]?.done) { const ses = buildSession(S, C, TODAY()); if (ses) startSession(ses); else render(); }
else render();
if (QS.has('test')) window.__sc = { S: () => S, RUN: () => RUN, word };
