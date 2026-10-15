// Little Words Daily: 50 little-word meanings a day, in 5 rounds of 10, each word with its picture.
// Words and pictures come from the Small Common Word Academy (../common-words/content.js and art.js); progress is
// kept separately here (wr-littlewords.<player>). Question types: what does it mean, which picture, fill the gap.
import {USES, sceneAt} from '../common-words/content.js?v=lw-1';
import {illustration} from '../common-words/art.js?v=lw-1';
import {KID} from './words.js?v=lw-1';
import * as E from './engine.js?v=lw-1';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=3';

const app = document.querySelector('#app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);
const TODAY = () => E.dayKey();
const BY = Object.fromEntries(USES.map((u, i) => [u.id, { ...u, idx: i }]));
const UNITS = ['Place words', 'Moving words', 'Pointing words', 'Joining words', 'Amount words', 'Time words'];

// ---------- player + save ----------
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
function player(){ const r = read('wordraiders.players.v1'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Reader' }; }
const P = player(), KEY = `wr-littlewords.${P.id}`;
let S = { ...E.fresh(), ...(read(KEY) || {}) }; S.settings = { read: true, ...(S.settings || {}) };
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }

// ---------- voice ----------
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); if (!el) return; el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 3500); }
function say(t, force){ if (!t || (!force && !S.settings.read)) return; const why = voiceBlocked(); if (why) { if (force) flash(why); return; } speak(t); }
const SPK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
const hear = (t, label = 'Hear it') => `<button class="hear-btn" data-act="say" data-text="${esc(t)}" aria-label="${esc(label)}">${SPK}</button>`;

// ---------- words, pictures, sentences ----------
const scene = u => sceneAt(BY[u.id].idx * 5);                     // one picture per word: the academy's first scene for it
const pic = (u, kind = u.scene) => illustration(scene(u), kind, { caption: false, legend: false });
const wrongUse = u => USES.find(x => x.id === u.wrong || x.scene === u.wrong) || null;
const sameUnit = u => USES.filter(x => x.unit === u.unit && x.id !== u.id);
const wordRe = u => new RegExp(`\\b${u.word.replace(/ /g, '\\s+')}\\b`, 'i');
const hasGap = u => wordRe(u).test(scene(u).sentence);
function gapSentence(u){ return scene(u).sentence.replace(wordRe(u), '___'); }
function markSentence(u){ return esc(scene(u).sentence).replace(wordRe(u), m => `<mark>${m}</mark>`); }
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- the day ----------
let RUN = null;   // { day, q }
function today(){ const d = S.days[TODAY()]; return d && !d.done ? d : null; }
function start(){
 let d = S.days[TODAY()];
 if (!d) { d = S.days[TODAY()] = E.planDay(S, USES, TODAY(), hasGap); persist(); }
 if (d.done) return;
 RUN = { phase: 'item' }; enter();
}
function cur(){ const d = S.days[TODAY()]; return d.items[d.i]; }
function enter(){
 const d = S.days[TODAY()], it = cur();
 RUN.teach = it.teach && !RUN.taught?.[it.id];
 RUN.q = RUN.teach ? null : makeQ(it, d);
 render(); speakScreen(); window.scrollTo(0, 0);
}
function makeQ(it, d){
 const u = BY[it.id], rng = E.seeded(`${S.seed}:${d.date}:${d.i}`), w = wrongUse(u), others = E.shuffle(sameUnit(u), rng);
 const q = { u, type: it.type, picked: null, first: null, done: false, retry: false };
 if (it.type === 'meaning') {
  const pool = [w && w.use !== u.use ? w : null, ...others].filter(Boolean).filter((x, k, a) => x.use !== u.use && a.findIndex(y => y.use === x.use) === k);
  q.opts = E.shuffle([{ key: u.id, label: u.use }, ...pool.slice(0, 2).map(x => ({ key: x.id, label: x.use }))], rng);
 } else if (it.type === 'picture') {
  const kinds = [u.wrong, ...others.map(x => x.scene)].filter((k, i, a) => k !== u.scene && a.indexOf(k) === i);
  q.opts = E.shuffle([{ key: u.id, kind: u.scene }, ...kinds.slice(0, 2).map(k => ({ key: 'x:' + k, kind: k }))], rng);
 } else {
  const pool = [w, ...others].filter(Boolean).filter((x, k, a) => x.word.toLowerCase() !== u.word.toLowerCase() && a.findIndex(y => y.word.toLowerCase() === x.word.toLowerCase()) === k);
  q.opts = E.shuffle([{ key: u.id, label: u.word }, ...pool.slice(0, 2).map(x => ({ key: x.id, label: x.word }))], rng);
 }
 q.right = q.opts.findIndex(o => o.key === u.id);
 return q;
}
function onPick(pos){
 const q = RUN.q; if (q.done) return;
 const ok = pos === q.right;
 if (q.first === null) {
  q.first = ok; const d = S.days[TODAY()];
  E.answer(S, q.u.id, ok, TODAY()); d.results.push({ id: q.u.id, type: q.type, ok });
  S.log.push({ day: TODAY(), id: q.u.id, type: q.type, shown: q.opts.map(o => o.key), pos: q.right, pick: pos, ok }); if (S.log.length > 600) S.log.splice(0, S.log.length - 600);
  persist();
 }
 q.picked = pos;
 if (ok) { q.done = true; render(); say(`${q.first ? 'Yes! ' : ''}${KID[q.u.id]}`); return; }
 q.retry = true; render(); say(`Not quite. ${KID[q.u.id]} Tap the green one.`);
}
function next(){
 const d = S.days[TODAY()];
 if (RUN.teach) { (RUN.taught ||= {})[cur().id] = true; enter(); return; }
 d.i++; persist();
 if (d.i >= d.items.length) { d.done = true; d.finishedAt = Date.now(); addXp(20); setTodayLabel(); persist(); RUN = { phase: 'done' }; render(); say(`Done for today! ${d.results.filter(r => r.ok).length} of ${d.items.length} right on the first try.`); return; }
 if (d.i % E.ROUND === 0) { addXp(5); setTodayLabel(); persist(); RUN = { phase: 'break' }; render(); say(`Round ${E.roundOf(d.i - 1)} done! Take a break, or keep going.`); return; }
 enter();
}
function setTodayLabel(){ const d = S.days[TODAY()]; S.today = { date: TODAY(), label: d?.done ? 'done' : d && d.i ? `round ${E.roundOf(d.i)} of ${E.ROUNDS}` : `${E.PER_DAY} today` }; }

// ---------- screens ----------
function bar(title){ const inside = RUN && RUN.phase === 'item'; return `<header class="bar"><a href="${inside ? '#' : '../#/home'}" data-act="${inside ? 'home' : ''}" class="back">${inside ? '← Little Words' : '← WordRaiders'}</a><span class="title">${esc(title)}</span><button class="readto" data-act="readto" aria-pressed="${S.settings.read}" aria-label="Read to me">${S.settings.read ? SPK : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/></svg>'}</button></header>`; }
function progress(){ const d = S.days[TODAY()], inRound = d.i % E.ROUND; return `<div class="prog-row"><div class="prog" aria-hidden="true"><span style="width:${Math.round(inRound / E.ROUND * 100)}%"></span></div><span class="small muted">Round ${E.roundOf(d.i)} · ${inRound + 1} of ${E.ROUND}</span></div>`; }
function roundBars(i, done){ return `<div class="rounds" aria-hidden="true">${Array.from({ length: E.ROUNDS }, (_, k) => `<span class="${done || k < Math.floor(i / E.ROUND) ? 'full' : ''}"></span>`).join('')}</div>`; }
function counts(){ const kn = USES.filter(u => E.known(S.words[u.id])).length, met = USES.filter(u => S.words[u.id]?.met).length; return { kn, learning: met - kn, fresh: USES.length - met }; }
function streak(){ let n = 0, d = TODAY(); if (!S.days[d]?.done) d = E.addDays(d, -1); while (S.days[d]?.done) { n++; d = E.addDays(d, -1); } return n; }
function homeView(){
 setTodayLabel(); persist();
 const d = S.days[TODAY()], c = counts(), st = streak();
 const plan = d ? d.items.map(x => x.id) : E.pickWords(S, USES, TODAY());
 const roundNo = d && !d.done ? E.roundOf(d.i) : 1, from = (roundNo - 1) * E.ROUND;
 const chips = plan.slice(from, from + E.ROUND).map(id => `<span class="chip ${S.words[id]?.met ? '' : 'new'}">${esc(BY[id].word)}</span>`).join('');
 const unitList = UNITS.map((name, k) => { const us = USES.filter(u => u.unit === k); return `<li><b>${esc(name)}</b><span>${us.map(u => `<span class="uw ${E.known(S.words[u.id]) ? 'known' : S.words[u.id]?.met ? 'learning' : ''}">${esc(u.word)}</span>`).join(' ')}</span></li>`; }).join('');
 const top = d?.done ? `<h1>Done for today! 🎉</h1><p class="lead">${d.results.filter(r => r.ok).length} of ${d.items.length} right on the first try.</p>${roundBars(0, true)}<div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a></div>`
  : `<h1>Today: ${E.PER_DAY} little words</h1><p class="lead">One picture and one quick question for each word. ${E.ROUNDS} rounds of ${E.ROUND}, about 12 minutes. Take a break between rounds.</p>${roundBars(d ? d.i : 0)}
   <section class="card"><p class="rt">Round ${roundNo} of ${E.ROUNDS}</p><div class="chips">${chips}</div><p class="small muted">New words get a picture and meaning first. Words you know get a quick question.</p></section>
   <button class="primary big" data-act="start">${d && d.i ? `Continue round ${roundNo}` : 'Start round 1'}</button>`;
 return bar('Little Words') + `<main><p class="eyebrow">LITTLE WORDS DAILY</p>${top}
 <div class="stats"><div><b>${c.kn}</b><span>words known</span></div><div><b>${c.learning}</b><span>still learning</span></div><div><b>${st} day${st === 1 ? '' : 's'}</b><span>in a row</span></div></div>
 <details class="about"><summary>All 60 little words</summary><p class="small muted">Gold = known (right on 3 different days) · white = learning · grey = not met yet.</p><ul class="units">${unitList}</ul></details>
 <details class="about"><summary>For grown-ups</summary>
  <p>Each day picks 50 of the 60 little words, weakest first: words not known yet, then words missed yesterday, then the ones seen longest ago. The first time a word comes up it gets a short card: the word, its picture, a kid-sized meaning and an example sentence. Then one quick question, with 3 choices in a shuffled order: what the word means, which picture shows it, or which word fills the gap. Only the first answer counts. A word is “known” after a right first answer on 3 different days; a miss brings it back the next day.</p>
  <p>The words and pictures come from the Small Common Word Academy (its 60 uses of small words, drawn as diagrams). Progress here is kept separately and doesn’t change the Academy.</p>
  <label class="tog"><input type="checkbox" data-act="read-box" ${S.settings.read ? 'checked' : ''}> Read every screen aloud</label>
 </details></main>`;
}
function teachView(){
 const it = cur(), u = BY[it.id], w = wrongUse(u);
 return bar('New word') + `<main class="round">${progress()}<section class="card"><p class="eyebrow">MEET THE WORD</p>
 <div class="big-word"><span>${esc(u.word)}</span>${hear(`${u.word}. ${KID[u.id]} ${scene(u).sentence}`, `Hear ${u.word}`)}</div>
 <div class="pic">${pic(u)}</div>
 <p class="meaning">${esc(KID[u.id])}</p>
 <p class="sent">${markSentence(u)}</p>
 ${w && w.word.toLowerCase() !== u.word.toLowerCase() ? `<p class="small muted center">Not the same as <b>${esc(w.word)}</b>: ${esc(KID[w.id].replace(/^[^ ]+( [a-z]+)? means /i, '').replace(/\.$/, ''))}.</p>` : ''}
 <button class="primary big" data-act="next">Got it ▸</button></section></main>`;
}
function itemView(){
 const q = RUN.q, u = q.u;
 const cls = pos => { if (q.picked === null) return ''; if (pos === q.right && (q.done || q.retry)) return 'right'; if (pos === q.picked && pos !== q.right) return 'wrong'; return ''; };
 const tag = pos => cls(pos) === 'right' ? '✓' : cls(pos) === 'wrong' ? '✗' : '';
 let head = '', body = '', opts = '';
 if (q.type === 'meaning') {
  head = `What does <span class="qw">${esc(u.word)}</span> mean?`;
  body = `<div class="pic">${pic(u)}</div><p class="sent">${markSentence(u)}</p>`;
  opts = `<div class="opts">${q.opts.map((o, pos) => `<button class="opt ${cls(pos)}" data-act="pick" data-pos="${pos}" ${q.done ? 'disabled' : ''}><span class="tag">${tag(pos)}</span>${esc(o.label)}</button>`).join('')}</div>`;
 } else if (q.type === 'picture') {
  head = `Which picture shows <span class="qw">${esc(u.word)}</span>?`;
  body = `<p class="sent">${markSentence(u)}</p>`;
  opts = `<div class="opts pics">${q.opts.map((o, pos) => `<button class="opt pic-opt ${cls(pos)}" data-act="pick" data-pos="${pos}" ${q.done ? 'disabled' : ''} aria-label="Picture ${pos + 1}"><span class="tag">${tag(pos) || pos + 1}</span>${illustration(scene(u), o.kind, { caption: false, legend: false })}</button>`).join('')}</div>`;
 } else {
  head = 'Which word fits?';
  body = `<div class="pic">${pic(u)}</div><p class="sent">${esc(q.done ? '' : gapSentence(u)).replace('___', '<span class="blank">___</span>')}${q.done ? markSentence(u) : ''}</p>`;
  opts = `<div class="opts words">${q.opts.map((o, pos) => `<button class="opt ${cls(pos)}" data-act="pick" data-pos="${pos}" ${q.done ? 'disabled' : ''}><span class="tag">${tag(pos)}</span>${esc(o.label)}</button>`).join('')}</div>`;
 }
 const fb = q.done ? `<p class="fb ok">${q.first ? 'Yes! ' : ''}${esc(KID[u.id])}</p><button class="primary big" data-act="next">Next ▸</button>` : q.retry ? `<p class="fb try">Not quite. ${esc(KID[u.id])}<br><b>Tap the green one.</b></p>` : '';
 return bar(`Round ${E.roundOf(S.days[TODAY()].i)}`) + `<main class="round">${progress()}<section class="card"><p class="q"><span>${head}</span>${hear(qSpeech(q), 'Hear the question')}</p>${body}${opts}${fb}</section></main>`;
}
function qSpeech(q){ const u = q.u; if (q.type === 'meaning') return `What does ${u.word} mean? ${scene(u).sentence} ${q.opts.map(o => o.label).join('? ')}?`; if (q.type === 'picture') return `Which picture shows ${u.word}? ${scene(u).sentence}`; return `Which word fits? ${gapSentence(u).replace('___', 'blank')} ${q.opts.map(o => o.label).join('? ')}?`; }
function breakView(){
 const d = S.days[TODAY()], rn = E.roundOf(d.i - 1), lastTen = d.results.slice(-E.ROUND), ok = lastTen.filter(r => r.ok).length;
 return bar('Little Words') + `<main class="round"><section class="card result"><div class="burst">⭐</div><h1>Round ${rn} done!</h1><p class="lead">${ok} of ${lastTen.length} right on the first try.</p>${roundBars(d.i)}
 <p>${E.ROUNDS - rn} round${E.ROUNDS - rn === 1 ? '' : 's'} left today. Take a break, or keep going.</p>
 <div class="row center"><button class="primary" data-act="start">Start round ${rn + 1} ▸</button><a class="btn" href="../#/home">Take a break</a></div></section></main>`;
}
function doneView(){
 const d = S.days[TODAY()], ok = d.results.filter(r => r.ok).length, missed = [...new Set(d.results.filter(r => !r.ok).map(r => r.id))], c = counts();
 return bar('Little Words') + `<main class="round"><section class="card result"><div class="burst">🎉</div><h1>Done for today!</h1><p class="lead"><b class="gold">${ok} of ${d.items.length}</b> right on the first try</p>${roundBars(0, true)}</section>
 ${missed.length ? `<p class="rt">Tricky today, coming back tomorrow:</p><div class="chips">${missed.map(id => `<span class="chip miss">${esc(BY[id].word)}</span>`).join('')}</div>` : '<p class="rt">Every word right the first time. Amazing!</p>'}
 <div class="stats"><div><b>${c.kn} of ${USES.length}</b><span>words known</span></div><div><b>+${20 + 5 * (E.ROUNDS - 1)} XP</b><span>for all ${E.ROUNDS} rounds</span></div></div>
 <div class="row"><a class="primary big" href="../?today=next#/home">Next task ▸</a><a class="btn wide" href="../#/home">Back to Home</a></div></main>`;
}
function render(){ app.innerHTML = !RUN ? homeView() : RUN.phase === 'done' ? doneView() : RUN.phase === 'break' ? breakView() : RUN.teach ? teachView() : itemView(); }
function speakScreen(){
 if (!RUN || RUN.phase !== 'item') return;
 const u = BY[cur().id];
 if (RUN.teach) say(`New word: ${u.word}. ${KID[u.id]} ${scene(u).sentence}`); else say(qSpeech(RUN.q));
}

// ---------- events ----------
app.addEventListener('change', e => { if (e.target.dataset.act === 'read-box') { S.settings.read = e.target.checked; persist(); render(); } });
app.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled || b.tagName === 'INPUT') return; const a = b.dataset.act;
 if (a === 'say') { say(b.dataset.text, true); return; }
 if (a === 'readto') { S.settings.read = !S.settings.read; persist(); if (!S.settings.read) speechSynthesis?.cancel?.(); render(); return; }
 if (a === 'home') { e.preventDefault(); RUN = null; render(); return; }
 if (a === 'start') { start(); return; }
 if (!RUN) return;
 if (a === 'next') { next(); return; }
 if (a === 'pick') onPick(+b.dataset.pos);
});
if (QS.has('test')) window.__lw = { S: () => S, RUN: () => RUN, E, BY, hasGap, gapSentence };
render();
if (QS.has('today') && !S.days[TODAY()]?.done) start();
