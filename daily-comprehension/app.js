// Daily Comprehension (Phase 1 of the Reading Comprehension Engine handoff): one short text a day.
// Read → understand it (meaning, show it) → hide it and answer again ("Show again" allowed) → fact / fair guess /
// not in the text → finish with skill feedback. Texts are Sentence Decoder sentences and Grade Journey practice and
// listening stories (never Grade Journey's unit-check stories). Progress is kept on this device (wr-dailycomp.<id>).
import {STAGES, EXTRAS} from './content.js?v=dc-1';
import * as E from './engine.js?v=dc-1';
import {ITEMS} from '../sentence-decoder/items.js?v=dc-1';
import {panel} from '../sentence-decoder/art.js?v=fs-1';
import {PASSAGES as G1} from '../grade-journey/content-g1.js?v=gj-2';
import {PASSAGES as G2} from '../grade-journey/content-g2.js?v=gj-2';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=3';

const app = document.querySelector('#app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);
const TODAY = () => E.dayKey();
const SD = Object.fromEntries(ITEMS.map(x => [x.id, x])), GJ = Object.fromEntries([...G1, ...G2].map(p => [p.id, p]));

// ---------- player + saves ----------
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
function player(){ const r = read('wordraiders.players.v1'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Reader' }; }
const P = player(), KEY = `wr-dailycomp.${P.id}`, BUDGET = `wr-today-budget.${P.id}`;
let S = { ...E.fresh(), ...(read(KEY) || {}) }; S.settings = { read: true, ...(S.settings || {}) };
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const GJS = read(`wr-grade.${P.id}`), FS = read(`wr-firststeps.${P.id}`), SC = read(`wr-soundcode.${P.id}`);
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }

// ---------- voice ----------
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); if (!el) return; el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 3500); }
function say(t, force){ if (!t || (!force && !S.settings.read)) return; const why = voiceBlocked(); if (why) { if (force) flash(why); return; } speak(t); }
const SPK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
const hear = (t, label = 'Hear it') => `<button class="hear-btn" data-act="say" data-text="${esc(t)}" aria-label="${esc(label)}">${SPK}</button>`;

// ---------- texts ----------
function textOf(id){
 if (SD[id]) return { id, kind: 'sentence', title: '', text: SD[id].sentences.map(s => s.text).join(' '), sd: SD[id] };
 const p = GJ[id]; if (!p) return null;
 return { id, kind: p.pool === 'listening' ? 'listening' : 'passage', title: p.title, text: p.text, p };
}
const available = id => !!EXTRAS[id] && !!textOf(id);
/** Passage questions: one about a key detail is kept back for hide & answer, the next two are asked with the text. */
function passageQs(p){
 const qs = p.questions.map((q, i) => ({ ...q, i }));
 const r = qs.find(q => ['literal', 'sequence', 'why'].includes(q.type) && q.evidence) || qs[qs.length - 1];
 return { construct: qs.filter(q => q !== r && q.type !== 'feature').slice(0, 2), retrieve: r };
}
const MODEL = { text: 'The dog chases the duck.', who: 'dog', does: 'chases', what: 'duck' };

// ---------- session ----------
let RUN = null;
function startSession(extra){
 E.startStage(S, GJS);
 const today = TODAY(), id = E.pickText(S, (STAGES[S.stage] || []).filter(available), today);
 if (!id) { flash('No texts left at this stage yet.'); return; }
 const t = textOf(id), steps = [];
 const rev = extra ? null : E.dueReview(S, today, id);
 if (rev && available(rev)) steps.push({ k: 'review', id: rev });
 if (S.stage !== 'S3' && !extra) steps.push({ k: 'model' });
 steps.push({ k: 'read' });
 if (t.kind === 'sentence') steps.push({ k: 'meaning' }, { k: 'show' });
 else passageQs(t.p).construct.forEach((q, n) => steps.push({ k: 'pq', q, n }));
 steps.push({ k: 'hide' }, { k: 'm5' }, { k: 'finish' });
 RUN = { t, steps, i: 0, fresh: E.isFresh(S, id, today), audio: t.kind === 'listening', meaning: [], show: null, retrieve: null, replays: 0, inference: null, confidence: null, extra: !!extra, q: null, revealed: false, started: Date.now() };
 if (!S.days[today]) S.days[today] = { done: false, texts: [] };
 enter();
}
const step = () => RUN.steps[RUN.i];
function enter(){
 const s = step(); RUN.q = null; RUN.revealed = false; RUN.m5 = null;
 const rng = E.seeded(`${S.seed}:${RUN.t.id}:${RUN.i}:${S.history.length}`);
 if (s.k === 'meaning') { const m = RUN.t.sd.meaning; RUN.q = qOf([{ x: m.correct, ok: true }, { x: m.literal.text, hint: m.literal.hint, kind: 'literal' }, { x: m.role.text, hint: m.role.hint, kind: 'role' }], rng, 'meaning'); }
 if (s.k === 'show') { const sd = RUN.t.sd, last = sd.panels[sd.panels.length - 1]; RUN.q = qOf([{ pic: last, ok: true }, { pic: sd.distractor, hint: 'Look again: who is doing it?' }], rng, 'show'); }
 if (s.k === 'pq') RUN.q = qOf(s.q.options.map((x, j) => ({ x, ok: j === s.q.answer })), rng, 'pq', s.q);
 if (s.k === 'hide') {
  if (RUN.t.kind === 'sentence') { const r = EXTRAS[RUN.t.id].retrieve; RUN.q = qOf(r.options.map((x, j) => ({ x, ok: j === r.answer })), rng, 'retrieve', { q: r.q, evidence: r.span }); }
  else { const r = passageQs(RUN.t.p).retrieve; RUN.q = qOf(r.options.map((x, j) => ({ x, ok: j === r.answer })), rng, 'retrieve', r); }
 }
 if (s.k === 'review') { const t = textOf(s.id); if (t.kind === 'sentence') { const r = EXTRAS[s.id].retrieve; RUN.q = qOf(r.options.map((x, j) => ({ x, ok: j === r.answer })), rng, 'review', { q: r.q, evidence: r.span }); } else { const r = passageQs(t.p).retrieve; RUN.q = qOf(r.options.map((x, j) => ({ x, ok: j === r.answer })), rng, 'review', r); } RUN.revT = t; }
 if (s.k === 'm5') { const m = EXTRAS[RUN.t.id].m5; RUN.m5 = { items: E.shuffle([{ kind: 'fact', x: m.fact }, { kind: 'guess', x: m.guess }, { kind: 'notThere', x: m.notThere }], rng), picks: {}, checked: false, first: null }; }
 if (s.k === 'finish') finish();
 render(); speakScreen(); window.scrollTo(0, 0);
}
function qOf(opts, rng, kind, src){ const order = E.shuffle(opts, rng); return { kind, src, order, right: order.findIndex(o => o.ok), picked: null, first: null, done: false, retry: false, at: Date.now() }; }
function onPick(pos){
 const q = RUN.q; if (!q || q.done) return;
 const ok = pos === q.right;
 if (q.first === null) {
  q.first = ok;
  E.logAttempt(S, { at: Date.now(), contentId: q.kind === 'review' ? step().id : RUN.t.id, version: 1, skills: q.kind === 'meaning' || q.kind === 'pq' ? ['M1'] : q.kind === 'show' ? ['M2'] : ['M4'], promptType: q.kind, response: `choice:${pos}`, shownOrder: q.order.map(o => o.x || o.pic?.alt), correct: ok, firstTry: true, hinted: false, audioAssisted: RUN.audio, replayCount: q.kind === 'retrieve' ? RUN.replays : 0, latencyMs: Date.now() - q.at, evidenceSpan: q.src?.evidence || null });
  if (q.kind === 'meaning' || q.kind === 'pq') RUN.meaning.push(ok);
  if (q.kind === 'show') RUN.show = ok;
  if (q.kind === 'retrieve') RUN.retrieve = ok;
  if (q.kind === 'review') { E.recordReview(S, step().id, ok, TODAY()); }
  persist();
 }
 q.picked = pos;
 const o = q.order[pos];
 if (ok) { q.done = true; render(); say(q.first ? 'Yes!' : 'That’s it.'); return; }
 q.retry = true; render(); say(`Not quite. ${o.hint || ''} Tap the green one.`);
}
function m5Pick(n, kind){ if (RUN.m5.checked) return; RUN.m5.picks[n] = kind; render(); }
function m5Check(){
 const M = RUN.m5; if (Object.keys(M.picks).length < 3) return;
 const ok = M.items.every((it, n) => M.picks[n] === it.kind);
 if (M.first === null) { M.first = ok; RUN.inference = ok; E.logAttempt(S, { at: Date.now(), contentId: RUN.t.id, version: 1, skills: ['M5'], promptType: 'fact-guess-not', response: JSON.stringify(M.picks), correct: ok, firstTry: true, hinted: false, audioAssisted: RUN.audio, confidence: RUN.confidence }); persist(); }
 M.checked = true; render(); say(ok ? 'Yes! You sorted all three.' : 'Look at the green labels to see where each one goes.');
}
function next(){ RUN.i++; if (RUN.i >= RUN.steps.length) { RUN = null; render(); return; } enter(); }
function finish(){
 if (RUN.recorded) return;
 const res = E.recordText(S, { id: RUN.t.id, stage: S.stage, kind: RUN.t.kind, fresh: RUN.fresh, audio: RUN.audio, hinted: false, meaning: RUN.meaning, show: RUN.show, retrieve: !!RUN.retrieve, retrieveReplays: RUN.replays, inference: !!RUN.inference, confidence: RUN.confidence }, TODAY());
 RUN.recorded = res; const d = S.days[TODAY()]; d.texts.push(RUN.t.id);
 if (!d.done) { d.done = true; addXp(10); }
 setTodayLabel(); persist();
}
function setTodayLabel(){ const d = S.days[TODAY()]; S.today = { date: TODAY(), label: d?.done ? 'done' : S.stage === 'S1' ? '1 sentence' : '1 story' }; }

// ---------- screens ----------
function bar(title){ const inside = !!RUN; return `<header class="bar"><a href="${inside ? '#' : '../#/home'}" data-act="${inside ? 'home' : ''}" class="back">${inside ? '← Daily Comprehension' : '← WordRaiders'}</a><span class="title">${esc(title)}</span><button class="readto" data-act="readto" aria-pressed="${S.settings.read}" aria-label="Read to me">${S.settings.read ? SPK : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m22 9-6 6M16 9l6 6"/></svg>'}</button></header>`; }
function dots(){ const n = RUN.steps.length; return `<div class="steps" aria-label="Step ${RUN.i + 1} of ${n}">${RUN.steps.map((s, i) => `<span class="${i < RUN.i ? 'done' : i === RUN.i ? 'now' : ''}"></span>`).join('')}</div>`; }
const STAGE_NAME = { S1: 'Stage 1 · one sentence', S2: 'Stage 2 · sentences and short stories', S3: 'Stage 3 · longer stories' };
function homeView(){
 const ok = E.unlocked(GJS, FS, SC);
 if (!ok) return bar('Daily Comprehension') + `<main><p class="eyebrow">DAILY COMPREHENSION</p><h1>Coming soon for you</h1><p class="lead">Daily Comprehension opens once you start the Grade Journey, reach “Who Did What?” in First Steps, or start Sound Code.</p><div class="row"><a class="primary" href="../grade-journey/">Grade Journey ▸</a><a class="btn" href="../#/home">Back to Home</a></div></main>`;
 E.startStage(S, GJS); setTodayLabel(); persist();
 const d = S.days[TODAY()], rev = E.dueReview(S, TODAY(), null);
 const lastH = S.history.filter(h => !h.review).slice(-8), pct = (f) => lastH.length ? Math.round(lastH.reduce((a, h) => a + f(h), 0) / lastH.length * 100) + '%' : '–';
 return bar('Daily Comprehension') + `<main><p class="eyebrow">DAILY COMPREHENSION · ${esc(STAGE_NAME[S.stage].toUpperCase())}</p>
 ${d?.done ? `<h1>Done for today! 🎉</h1><p class="lead">See you tomorrow for a new ${S.stage === 'S1' ? 'sentence' : 'story'}${rev ? ' and a quick memory check' : ''}.</p><div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a><button class="btn" data-act="extra">One more</button></div>`
  : `<h1>Today: who did what, and what you can prove.</h1><p class="lead">Read one ${S.stage === 'S1' ? 'sentence' : 'short story'}, show what it means, then answer with it hidden. About 5 minutes.${rev ? ' First, a quick question about one you read before.' : ''}</p><button class="primary big" data-act="start">▶ Start</button>`}
 <div class="stats"><div><b>${pct(h => h.meaning ?? 0)}</b><span>meaning (last 8)</span></div><div><b>${pct(h => h.retrieve ? 1 : 0)}</b><span>hide &amp; answer</span></div><div><b>${pct(h => h.inference ? 1 : 0)}</b><span>fact or guess</span></div></div>
 <p class="small muted">Timeline stories (following a story sentence by sentence) unlock later.</p>
 <details class="about"><summary>For grown-ups</summary>
  <p>Each day: one new text at your child’s stage (S1 simple sentences; S2 harder sentences and short Grade 1 stories; S3 two-sentence items, Grade 2 stories and listening stories). Steps: read it; show what it means (choose the meaning and the right picture, or answer two questions with the story in view); then the text is hidden and they answer again. “Show again” is allowed as often as needed, is counted, and never lowers the score. Last, they sort three statements: the text says it, a fair guess from the text, or not in the text, and can say how sure they are (not scored). Yesterday’s text comes back as a quick memory question.</p>
  <p>Only first answers on a new text, with “Read it to me” off, count toward moving up. Read-aloud texts count as listening. The stage moves up after 8 such texts on 2+ different days with 80% or more on meaning and hide &amp; answer, and drops one stage if accuracy falls below 70%. These are practice rules for the app, not a diagnosis. Grade Journey’s unit-check stories are never used here.</p>
  <p><b>Today list time budget.</b> Home shows the most useful daily tasks first and marks the rest as extra once about this many minutes are planned: <select id="budget">${[20, 30, 45, 60, 0].map(m => `<option value="${m}" ${String(m) === String(budgetVal()) ? 'selected' : ''}>${m ? m + ' minutes' : 'No limit'}</option>`).join('')}</select></p>
  <div class="row"><button class="btn" data-act="export">Download a CSV of answers</button>${Object.keys(S.hidden).length ? '<button class="btn" data-act="unhide">Show reported texts again</button>' : ''}</div>
  <label class="tog"><input type="checkbox" data-act="read-box" ${S.settings.read ? 'checked' : ''}> Read questions aloud</label>
 </details></main>`;
}
function budgetVal(){ try { const v = localStorage.getItem(BUDGET); return v == null ? 30 : Number(v); } catch { return 30; } }
function textBlock(t, { hidden = false } = {}){
 if (hidden) return `<div class="hidden-box"><span>Text hidden</span></div>`;
 const body = esc(t.text);
 return `<article class="passage">${t.title ? `<h2 class="ptitle">${esc(t.title)}</h2>` : ''}<div class="ptext ${t.kind === 'sentence' ? 'one' : ''}">${body}</div></article>`;
}
function optsHTML(q){
 const cls = pos => { if (q.picked === null) return ''; if (pos === q.right && (q.done || q.retry)) return 'right'; if (pos === q.picked && pos !== q.right) return 'wrong'; return ''; };
 const tag = pos => cls(pos) === 'right' ? '✓' : cls(pos) === 'wrong' ? '✗' : '';
 const pics = q.order.some(o => o.pic);
 return `<div class="opts ${pics ? 'pics' : ''}">${q.order.map((o, pos) => o.pic ? `<button class="opt pic-opt ${cls(pos)}" data-act="pick" data-pos="${pos}" ${q.done ? 'disabled' : ''} aria-label="${esc(o.pic.alt)}"><span class="tag">${tag(pos) || pos + 1}</span>${panel(o.pic, { size: 300, label: o.pic.alt })}</button>` : `<button class="opt ${cls(pos)}" data-act="pick" data-pos="${pos}" ${q.done ? 'disabled' : ''}><span class="tag">${tag(pos)}</span>${esc(o.x)}</button>`).join('')}</div>`;
}
function fbHTML(q){
 if (!q.done && !q.retry) return '';
 const o = q.order[q.picked], ev = q.src?.evidence;
 if (q.done) return `<p class="fb ok">${q.first ? 'Yes! ' : ''}${ev ? `The ${RUN.t.kind === 'sentence' ? 'sentence' : 'story'} says: “${esc(ev)}”` : ''}</p><button class="primary big" data-act="next">Next ▸</button>`;
 return `<p class="fb try">Not quite. ${esc(o.hint || '')} <b>Tap the green one.</b></p>`;
}
function view(){
 const s = step(), t = RUN.t, q = RUN.q;
 if (s.k === 'review') { const rt = RUN.revT; return bar('Remember?') + `<main class="round">${dots()}<section class="card"><p class="eyebrow">REMEMBER THIS ONE?</p><p class="lead">You read ${rt.kind === 'sentence' ? 'this sentence' : `“${esc(rt.title)}”`} before. Answer from memory.</p>${textBlock(rt, { hidden: true })}<p class="q">${esc(q.src.q)} ${hear(`${q.src.q} ${q.order.map(o => o.x).join('? ')}?`, 'Hear the question')}</p>${optsHTML(q)}${fbHTML(q)}</section></main>`; }
 if (s.k === 'model') return bar('How it works') + `<main class="round">${dots()}<section class="card"><p class="eyebrow">TODAY: WHO DID WHAT</p><h1>Find who did what, then prove it.</h1>
  <p class="ptext one model">The <mark class="who">dog</mark> <mark class="does">chases</mark> the <mark class="what">duck</mark>.</p>
  <div class="roles"><span><b class="who">Who?</b> dog</span><span><b class="does">Does what?</b> chases</span><span><b class="what">To what?</b> duck</span></div>
  <button class="primary big" data-act="next">Start ▸</button></section></main>`;
 if (s.k === 'read') return bar('Read') + `<main class="round">${dots()}<section class="card"><p class="eyebrow">${t.kind === 'listening' ? 'LISTEN' : 'READ'}</p>
  ${t.kind === 'listening' && !RUN.showListen ? `<div class="hidden-box"><button class="primary" data-act="listen">▶ Listen to the story</button><button class="linkish" data-act="show-listen">Show the words</button></div>` : textBlock(t)}
  ${t.kind !== 'listening' ? `<button class="linkish small" data-act="tts">${RUN.audio ? '🔊 Read it to me (used: counts as listening)' : '🔊 Read it to me'}</button>` : ''}
  <button class="primary big" data-act="next">${t.kind === 'listening' ? 'I listened ▸' : 'I read it ▸'}</button><p class="small muted center"><button class="linkish" data-act="report">⚑ Report this text (grown-up)</button></p></section></main>`;
 if (s.k === 'meaning') return bar('What does it mean?') + `<main class="round">${dots()}<section class="card">${textBlock(t)}<p class="q">What does it mean? ${hear(`What does it mean? ${q.order.map(o => o.x).join('? ')}?`, 'Hear the question')}</p>${optsHTML(q)}${fbHTML(q)}</section></main>`;
 if (s.k === 'show') return bar('Show it') + `<main class="round">${dots()}<section class="card">${textBlock(t)}<p class="q">Which picture shows it? ${hear('Which picture shows it?', 'Hear the question')}</p>${optsHTML(q)}${fbHTML(q)}</section></main>`;
 if (s.k === 'pq') return bar(`Question ${s.n + 1}`) + `<main class="round">${dots()}${textBlock(t)}<section class="card"><p class="q">${esc(s.q.q)} ${hear(`${s.q.q} ${q.order.map(o => o.x).join('? ')}?`, 'Hear the question')}</p>${optsHTML(q)}${fbHTML(q)}</section></main>`;
 if (s.k === 'hide') {
  const head = `<p class="eyebrow">HIDE &amp; ANSWER</p>`;
  if (RUN.revealed) return bar('Hide & answer') + `<main class="round">${dots()}<section class="card">${head}${textBlock(t)}<button class="primary big" data-act="ready">I’m ready ▸</button></section></main>`;
  return bar('Hide & answer') + `<main class="round">${dots()}<section class="card">${head}${textBlock(t, { hidden: true })}
  ${q.first === null ? `<button class="btn wide" data-act="reveal">Show again (${RUN.replays})</button>` : ''}
  <p class="q">${esc(q.src.q)} ${hear(`${q.src.q} ${q.order.map(o => o.x).join('? ')}?`, 'Hear the question')}</p>${optsHTML(q)}${fbHTML(q)}</section></main>`;
 }
 if (s.k === 'm5') {
  const M = RUN.m5, m = EXTRAS[t.id].m5;
  const LAB = { fact: 'The text says it', guess: 'Fair guess', notThere: 'Not in the text' }, IC = { fact: '✓', guess: '?', notThere: '✗' };
  const why = { fact: `The text says: “${m.factSpan}”`, guess: `Clue: “${m.guessSpan}”. The text doesn’t say it, but you can work it out.`, notThere: 'The text never says that.' };
  const rows = M.items.map((it, n) => { const pick = M.picks[n], right = M.checked && pick === it.kind, wrong = M.checked && pick !== it.kind;
   return `<li class="m5row ${right ? 'right' : wrong ? 'wrong' : ''}"><p class="stmt">${esc(it.x)} ${hear(it.x, 'Hear it')}</p><div class="m5btns">${['fact', 'guess', 'notThere'].map(k => `<button class="m5b ${pick === k ? 'on' : ''} ${M.checked && it.kind === k ? 'key' : ''}" data-act="m5" data-n="${n}" data-k="${k}" ${M.checked ? 'disabled' : ''}><span aria-hidden="true">${IC[k]}</span> ${LAB[k]}</button>`).join('')}</div>${M.checked ? `<p class="why">${esc(why[it.kind])}</p>` : ''}</li>`; }).join('');
  return bar('Fact or guess?') + `<main class="round">${dots()}${textBlock(t)}<section class="card"><p class="q">Fact, fair guess, or not there? ${hear('Is it a fact the text says, a fair guess, or not in the text?', 'Hear the question')}</p><ul class="m5list">${rows}</ul>
  ${!M.checked ? `<div class="conf"><span>How sure are you?</span>${['sure', 'not sure'].map(c => `<button class="chipbtn ${RUN.confidence === c ? 'on' : ''}" data-act="conf" data-c="${c}">${c === 'sure' ? 'Sure' : 'Not sure'}</button>`).join('')}<small class="muted">(optional)</small></div><button class="primary big" data-act="m5check" ${Object.keys(M.picks).length < 3 ? 'disabled' : ''}>Check</button>` : `<p class="fb ${M.first ? 'ok' : 'try'}">${M.first ? 'Yes! All three sorted.' : 'The green labels show where each one goes.'}</p><button class="primary big" data-act="next">Next ▸</button>`}</section></main>`;
 }
 if (s.k === 'finish') {
  const r = RUN.recorded || {}, lines = [];
  lines.push(RUN.meaning.every(Boolean) && RUN.meaning.length ? '✅ You got who did what.' : '🌱 Meaning: we’ll practise this kind again.');
  if (RUN.show != null) lines.push(RUN.show ? '✅ You picked the right picture.' : '🌱 Picture: look for who is doing the action.');
  lines.push(RUN.retrieve ? `✅ You remembered it with the text hidden${RUN.replays ? ` (after ${RUN.replays} look${RUN.replays > 1 ? 's' : ''} back)` : ''}.` : '🌱 Hide & answer needs another day.');
  lines.push(RUN.inference ? '✅ You can tell a fact from a fair guess.' : '🌱 Fact or guess: we’ll try more of these.');
  const tough = /\b(because|although|unless|but|so)\b/i.test(t.text) && (!RUN.retrieve || !RUN.meaning.every(Boolean));
  return bar('Done') + `<main class="round"><section class="card result"><div class="burst">🎉</div><h1>Done for today!</h1><ul class="skills">${lines.map(l => `<li>${esc(l)}</li>`).join('')}</ul>
  <p class="small muted">We’ll ask about this ${t.kind === 'sentence' ? 'sentence' : 'story'} again tomorrow.${r.moved === 'up' ? ` 🎉 You moved up to ${esc(STAGE_NAME[S.stage])}!` : r.moved === 'down' ? ' Next time we’ll practise a little easier, then move up again.' : ''}</p>
  ${tough ? `<p class="tip">Joining words like because, but and unless can be tricky. <a href="../connecting-words/">Practise in Connecting Words ▸</a></p>` : ''}
  ${!RUN.meaning.every(Boolean) && RUN.t.kind === 'sentence' ? `<p class="tip">Word meanings help. <a href="../little-words/">Little Words ▸</a> <a href="../daily-definitions/">Daily Definitions ▸</a></p>` : ''}
  <div class="row center"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a></div></section></main>`;
 }
 return '';
}
function render(){ app.innerHTML = RUN ? view() : homeView(); }
function speakScreen(){
 const s = step(), q = RUN.q;
 if (s.k === 'read' && RUN.t.kind === 'listening') return say(`${RUN.t.title}. ${RUN.t.text}`, true);
 if (s.k === 'model') return say('Find who did what. The dog chases the duck. Who? The dog. Does what? Chases. To what? The duck.');
 if (q && q.src?.q) return say(`${q.src.q} ${q.order.map(o => o.x).join('? ')}?`);
 if (s.k === 'meaning') return say('What does it mean?');
 if (s.k === 'show') return say('Which picture shows it?');
 if (s.k === 'm5') return say('Is it a fact the text says, a fair guess, or not in the text?');
}
function exportCSV(){
 const rows = [['date', 'content', 'prompt', 'skills', 'correct', 'first_try', 'read_aloud', 'show_again', 'confidence', 'latency_ms']];
 S.attempts.forEach(a => rows.push([E.dayKey(a.at), a.contentId, a.promptType, (a.skills || []).join(' '), a.correct, a.firstTry, a.audioAssisted, a.replayCount ?? '', a.confidence ?? '', a.latencyMs ?? '']));
 const csv = rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
 const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `wordraiders-daily-comprehension-${P.name}.csv`; document.body.appendChild(a); a.click(); a.remove();
}

// ---------- events ----------
app.addEventListener('change', e => {
 if (e.target.id === 'budget') { try { localStorage.setItem(BUDGET, e.target.value); } catch {} flash('Saved. Home will use the new time budget.'); }
 if (e.target.dataset.act === 'read-box') { S.settings.read = e.target.checked; persist(); }
});
app.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled || b.tagName === 'INPUT') return; const a = b.dataset.act;
 if (a === 'say') { say(b.dataset.text, true); return; }
 if (a === 'readto') { S.settings.read = !S.settings.read; persist(); if (!S.settings.read) speechSynthesis?.cancel?.(); render(); return; }
 if (a === 'home') { e.preventDefault(); RUN = null; render(); return; }
 if (a === 'start') { startSession(false); return; }
 if (a === 'extra') { startSession(true); return; }
 if (a === 'export') { exportCSV(); return; }
 if (a === 'unhide') { S.hidden = {}; persist(); render(); return; }
 if (!RUN) return;
 if (a === 'next') { next(); return; }
 if (a === 'pick') { onPick(+b.dataset.pos); return; }
 if (a === 'tts') { RUN.audio = true; say(RUN.t.text, true); render(); return; }
 if (a === 'listen') { say(`${RUN.t.title}. ${RUN.t.text}`, true); return; }
 if (a === 'show-listen') { RUN.showListen = true; render(); return; }
 if (a === 'reveal') { RUN.replays++; RUN.revealed = true; render(); return; }
 if (a === 'ready') { RUN.revealed = false; render(); speakScreen(); return; }
 if (a === 'm5') { m5Pick(+b.dataset.n, b.dataset.k); return; }
 if (a === 'conf') { RUN.confidence = b.dataset.c; render(); return; }
 if (a === 'm5check') { m5Check(); return; }
 if (a === 'report') { if (confirm('Hide this text on this device? (It will also be flagged for the next build.)')) { S.hidden[RUN.t.id] = { at: TODAY() }; persist(); RUN = null; render(); } return; }
});
if (QS.has('test')) window.__dc = { S: () => S, RUN: () => RUN, E, EXTRAS, STAGES, textOf, start: startSession };
render();
if (QS.has('today') && E.unlocked(GJS, FS, SC) && !S.days[TODAY()]?.done) startSession(false);
