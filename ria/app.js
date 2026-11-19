// Reading Intelligence Academy. Observe → Measure → Diagnose → Intervene → Reassess → Retain → Transfer.
// Screens: Home (next step), Passage Lab (10 steps), Baseline / comparison check, follow-up checks (reassess, retention,
// transfer), guided practice, Dashboard (12 variables, skills, 8 graphs), Reports (periods, 30-day questions,
// interventions, projections) and Grown-ups (review written answers, export, delete, compare, other apps).
// Every scored response is one event in the shared store (../wr-learning.js); nothing is scored that is not recorded.
import * as L from '../wr-learning.js?v=ria-1';
import * as St from './stats.js?v=ria-1';
import * as Md from './model.js?v=ria-1';
import {scoreExplanation, VERDICT_TEXT} from './rubric.js?v=ria-1';
import * as C from './charts.js?v=ria-1';
import {importAll, mainAppTotals, engineeringQuest} from './ingest.js?v=ria-1';
import {PASSAGES} from './passages.js?v=ria-1';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=3';

const app = document.querySelector('#app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);
const EMBED = QS.has('embed') && window.parent !== window;
const host = () => { try { return window.parent.wrNotebook ? window.parent : null; } catch { return null; } };
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const DAY = 864e5, TODAY = () => Md.dayKey();
const P = L.activePlayer();
let M = L.meta(P.id);
const PBY = Object.fromEntries(PASSAGES.map(p => [p.id, p]));
const saveMeta = () => L.saveMeta(P.id, M);
M.settings = { confidence: true, readAloud: true, ...(M.settings || {}) };
if (!M.band) { const g = read(`wr-grade.${P.id}`)?.placedGrade; M.band = Md.bandFromGrade(g); M.conditions.push({ at: Date.now(), what: `Starting level ${M.band}${g ? ` (from Grade Journey grade ${g})` : ' (no grade set)'}` }); saveMeta(); }
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; };
function rng(seed){ let h = hash(String(seed)); return () => { h = h + 0x6d2b79f5 >>> 0; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const shuffle = (a, r) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------- evidence ----------
/** All events with grown-up corrections applied (the original verdict stays in explain.verdict). */
function events(){ return L.load(P.id).events.map(e => { const o = M.overrides[e.id]; return o ? { ...e, correct: o.verdict === 'correct', explain: { ...e.explain, override: o.verdict } } : e; }); }
const riaSeen = id => L.load(P.id).events.some(e => e.src === 'ria' && e.content === id);
function rec(e){ L.record(P.id, [{ src: 'ria', ...e }]); }

// ---------- voice ----------
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); if (!el) return; el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 3500); }
function say(t){ const why = voiceBlocked(); if (why) { flash(why); return; } speak(t); }

// ---------- item pools ----------
const REASON_SKILL = { cause: 'reason-cause', condition: 'reason-condition', consequence: 'reason-consequence', assumption: 'reason-assumption', evidence: 'reason-evidence', contradiction: 'reason-contradiction', missing: 'reason-missing', prediction: 'predict' };
const mc = (skill, it, extra = {}) => ({ type: 'mcq', skill, q: it.q, options: it.options, answer: it.answer, pi: !!it.pi, s: it.s, from: it.from, to: it.to, evidence: it.evidence, word: it.word, rel: it.type, ...extra });
function itemsFor(p, skill){
 switch (skill) {
  case 'vocab-context': return p.vocab.map(v => mc(skill, v));
  case 'sentence-structure': return p.units.map(u => ({ type: 'chunk', skill, s: u.s, chunks: u.chunks, verb: u.verb }));
  case 'who-did-what': return p.props.map(x => mc(skill, x));
  case 'pronoun': return p.pronouns.map(x => mc(skill, x, { word: x.pronoun }));
  case 'sentence-meaning': return p.meaning.map(x => mc(skill, x));
  case 'relation': return p.relations.map(x => mc(skill, x));
  case 'main-idea': return [mc(skill, p.main)];
  case 'big-idea-written': return [{ type: 'write', skill, prompt: p.central.prompt || 'In one or two sentences, what is the big idea of this passage?', rubric: p.central }];
  case 'model-order': return [{ type: 'order', skill, prompt: p.model.prompt || 'Put the steps in order.', steps: p.model.steps }];
  case 'model-parts': return p.model.questions.map(x => mc(skill, x));
  case 'predict': return [mc(skill, p.predict), ...p.reasoning.filter(r => r.kind === 'prediction').map(x => mc(skill, x))];
  case 'retell': return [{ type: 'write', skill, prompt: p.retell.prompt || 'Without looking, explain what this passage was about.', rubric: p.retell, hidden: true }];
  case 'recall': return p.recall.map(x => mc(skill, x, { hidden: true }));
  case 'transfer': return p.transfer.map(x => mc(skill, x, { scenario: x.scenario }));
  default: { const kind = Object.keys(REASON_SKILL).find(k => REASON_SKILL[k] === skill); return kind ? p.reasoning.filter(r => r.kind === kind).map(x => mc(skill, x)) : []; }
 }
}
const reasoningItems = p => p.reasoning.map(r => mc(REASON_SKILL[r.kind] || 'inference-q', r));

// ---------- runs ----------
// RUN = { mode, purpose, passage, steps: [{ n, title, intro, items, hidden }], si, ii, results, session, start, flagged, knew, help: Set }
let RUN = null, V = { screen: 'home' };
const STEP_TITLES = ['', 'Unfamiliar words', 'Break it into chunks', 'Who or what does it?', 'What each sentence means', 'How the sentences connect', 'The central meaning', 'Causes, conditions and assumptions', 'Build the model', 'Explain it without looking', 'Use it somewhere new'];
const STEP_INTRO = ['', 'Read the passage. Tap any word you do not know, then answer the word questions.', 'Long sentences are easier in chunks. Find the chunk that says what happens.', 'Find who or what does each action, and what the little words like “it” point to.', 'Say each sentence in other words.', 'Find the link between sentences: cause, contrast, condition, sequence…', 'What is the whole passage about? Then write the big idea yourself.', 'Why things happen, when they happen, and what the writer takes for granted.', 'Rebuild the process: the steps in order and its parts.', 'The passage is hidden now. Explain it in your own words.', 'A new situation. Use what you learned.'];
function labSteps(p){
 const S = [
  { n: 0, title: 'Before you read', items: [{ type: 'knew' }] },
  { n: 1, items: [{ type: 'flag' }, ...itemsFor(p, 'vocab-context')] },
  { n: 2, items: itemsFor(p, 'sentence-structure') },
  { n: 3, items: [...itemsFor(p, 'who-did-what'), ...itemsFor(p, 'pronoun')] },
  { n: 4, items: itemsFor(p, 'sentence-meaning') },
  { n: 5, items: itemsFor(p, 'relation') },
  { n: 6, items: [...itemsFor(p, 'main-idea'), ...itemsFor(p, 'big-idea-written')] },
  { n: 7, items: reasoningItems(p).filter(i => i.skill !== 'predict') },
  { n: 8, items: [...itemsFor(p, 'model-order'), ...itemsFor(p, 'model-parts'), mc('predict', p.predict)] },
  { n: 9, hidden: true, items: itemsFor(p, 'retell') },
  { n: 10, items: [itemsFor(p, 'transfer')[0]] },
 ];
 return S.filter(s => s.items.length).map(s => ({ title: STEP_TITLES[s.n] || s.title, intro: STEP_INTRO[s.n] || 'How much do you already know about this topic?', ...s }));
}
/** Baseline / comparison: the same balanced set of items on a form passage, no hints. */
function checkSteps(p){
 return [
  { n: 0, title: 'Before you read', items: [{ type: 'knew' }] },
  { n: 1, title: 'Words', intro: 'Read the passage carefully, then answer.', items: itemsFor(p, 'vocab-context') },
  { n: 3, title: 'Sentences', intro: 'Answer from the passage.', items: [...itemsFor(p, 'sentence-structure').slice(0, 1), ...itemsFor(p, 'who-did-what').slice(0, 1), ...itemsFor(p, 'pronoun').slice(0, 1), ...itemsFor(p, 'sentence-meaning')] },
  { n: 5, title: 'Connections', intro: 'How do the ideas connect?', items: [...itemsFor(p, 'relation'), ...itemsFor(p, 'main-idea'), ...reasoningItems(p)] },
  { n: 8, title: 'The model', intro: 'Rebuild what the passage describes.', items: [...itemsFor(p, 'model-order'), ...itemsFor(p, 'model-parts').slice(0, 1), mc('predict', p.predict)] },
  { n: 6, title: 'Big idea', intro: 'Write the big idea in your own words.', items: itemsFor(p, 'big-idea-written') },
  { n: 9, title: 'Explain without looking', intro: 'The passage is hidden. Explain it in your own words.', hidden: true, items: itemsFor(p, 'retell') },
  { n: 10, title: 'Somewhere new', intro: 'A new situation.', items: [itemsFor(p, 'transfer')[0]] },
 ].filter(s => s.items.length && s.items.every(Boolean));
}
function start(mode, p, steps, extra = {}){
 const purpose = { lab: 'practice', baseline: 'baseline', posttest: 'posttest', reassess: 'reassess', retention: 'retention', transfer: 'transfer', guided: 'intervention' }[mode];
 RUN = { mode, purpose, passage: p, steps, si: 0, ii: 0, results: [], session: `${mode}:${p.id}:${Date.now().toString(36)}`, start: Date.now(), flagged: [], knew: null, help: new Set(), familiar: riaSeen(p.id), ...extra };
 enter();
}
const step = () => RUN.steps[RUN.si], item = () => step().items[RUN.ii];
function enter(){ RUN.q = { picked: null, done: false, conf: null, at: Date.now(), order: [], sel: new Set(), shownAgain: false }; RUN.help = new Set(); V = { screen: 'run' }; render(); window.scrollTo(0, 0); }
function next(){
 RUN.ii++;
 if (RUN.ii >= step().items.length) { RUN.si++; RUN.ii = 0; }
 if (RUN.si >= RUN.steps.length) { finish(); return; }
 enter();
}
const assessing = () => ['baseline', 'posttest'].includes(RUN.mode);
/** Record one scored response. */
function score(it, correct, extra = {}){
 const p = RUN.passage, help = [...RUN.help], sk = Md.SKILLS[it.skill] || {};
 const e = { item: `${p.id}:${it.skill}:${it.s ?? ''}:${(it.q || it.prompt || '').slice(0, 40)}`, content: p.id, skill: it.skill, vars: sk.vars || [], phase: sk.phase ?? null, purpose: RUN.purpose,
  familiar: it.skill === 'transfer' ? false : RUN.mode === 'retention' ? true : RUN.familiar, band: p.band, difficulty: { fk: p.metrics?.fk, words: p.metrics?.words }, correct, firstTry: true,
  assisted: help.length > 0, help, rtMs: Date.now() - RUN.q.at, confidence: RUN.q.conf, session: RUN.session, delayDays: RUN.delayDays ?? null,
  cond: { mode: RUN.mode, pi: it.pi || undefined, hidden: !!(step().hidden || it.hidden), s: it.s ?? it.to ?? null, word: it.word ?? null, flagged: it.skill === 'vocab-context' ? RUN.flagged.some(f => norm(f.word) === norm(it.word || '')) : undefined, knew: RUN.knew, rel: it.rel }, ...extra };
 rec(e); RUN.results.push({ ...e, at: Date.now(), it });
 return e;
}
const norm = s => String(s || '').toLowerCase().replace(/[^a-z']/g, '');

// ---------- answering ----------
function pick(pos){ const Q = RUN.q, it = item(); if (Q.done) return; Q.picked = pos; if (!M.settings.confidence || RUN.mode === 'guided') commit(); else render(); }
function commit(){
 const Q = RUN.q, it = item(); if (Q.done || Q.picked == null) return;
 const ok = Q.picked === it.answer; Q.done = true; Q.ok = ok;
 const e = score(it, ok, ok ? {} : { error: null });
 if (!ok && !assessing()) { Q.diag = Md.diagnose({ ...it, rtMs: e.rtMs, hidden: e.cond.hidden }, { passage: RUN.passage.id, results: RUN.results, flagged: RUN.flagged, knew: RUN.knew }); const last = L.load(P.id); const x = last.events.find(z => z.id === RUN.results[RUN.results.length - 1].id); if (x) { x.error = Q.diag.hypotheses[0]?.factor || null; L.save(P.id, last); } }
 render();
}
function chunkPick(i){ const Q = RUN.q, it = item(); if (Q.done) return; Q.picked = i; Q.done = true; Q.ok = i === it.verb; score(it, Q.ok); render(); }
function orderTap(i){ const Q = RUN.q; if (Q.done || Q.order.includes(i)) return; Q.order.push(i); render(); }
function orderCheck(){
 const Q = RUN.q, it = item(), shown = Q.shown; if (Q.order.length !== it.steps.length) return;
 const seq = Q.order.map(i => shown[i]), ok = seq.every((s, k) => s === k);
 let pairs = 0; for (let k = 0; k + 1 < seq.length; k++) if (seq[k + 1] === seq[k] + 1) pairs++;
 Q.done = true; Q.ok = ok; score(it, ok, { score: pairs / (seq.length - 1) }); render();
}
function writeCheck(){
 const Q = RUN.q, it = item(), text = (document.querySelector('#write')?.value || '').trim(); if (!text) { flash('Write your answer first.'); return; }
 const r = scoreExplanation(text, it.rubric.ideas); Q.done = true; Q.write = r; Q.text = text; Q.ok = r.verdict === 'correct';
 score(it, Q.ok, { score: r.score, explain: { verdict: r.verdict, found: r.found, of: r.of, units: r.units.filter(u => u.found).map(u => u.id), text: text.slice(0, 600), method: 'rubric' } });
 render();
}

// ---------- finishing ----------
function finish(){
 const R = RUN.results, p = RUN.passage, ind = R.filter(e => e.assisted === false && e.correct != null), indAcc = ind.length ? ind.filter(e => e.correct).length / ind.length : null;
 const ms = Math.min(Date.now() - RUN.start, 90 * 60e3); M.sessions.push({ id: RUN.session, at: RUN.start, ms, mode: RUN.mode, passage: p.id, items: R.length }); if (M.sessions.length > 800) M.sessions.splice(0, M.sessions.length - 800);
 const out = { mode: RUN.mode, passage: p, results: R, indAcc, weak: [], move: null };
 if (RUN.mode === 'baseline') { M.baseline = { at: Date.now(), passage: p.id, band: p.band, form: p.form, session: RUN.session }; M.conditions.push({ at: Date.now(), what: `Baseline taken on “${p.title}” (form ${p.form}, level ${p.band})` }); }
 if (RUN.mode === 'posttest') { (M.posttests ||= []).push({ at: Date.now(), passage: p.id, band: p.band, form: p.form, session: RUN.session }); M.conditions.push({ at: Date.now(), what: `Comparison check on “${p.title}” (form ${p.form}, level ${p.band})` }); }
 if (RUN.mode === 'lab' || RUN.mode === 'reassess') {
  const missed = R.filter(e => e.correct === false && !e.assisted);
  const weak = [...new Set(missed.map(e => Md.diagnose({ ...e.it, rtMs: e.rtMs, hidden: e.cond?.hidden }, { passage: p.id, results: R, flagged: RUN.flagged, knew: RUN.knew }).target))].filter(s => s && itemsForAny(s));
  out.weak = weak;
  if (RUN.mode === 'lab') {
   Md.scheduleAfter(M, { passage: p.id, weak, today: TODAY(), band: p.band });
   (M.passageResults ||= []).push({ id: p.id, band: p.band, unfamiliar: !RUN.familiar, indAcc: indAcc ?? 0, at: Date.now() });
   const d = Md.bandDecision(M.passageResults, M.band); out.band = d;
   if (d.move) { const nb = Md.bandStep(M.band, d.move === 'up' ? 1 : -1); if (nb !== M.band) { M.conditions.push({ at: Date.now(), what: `Level ${M.band} → ${nb}: ${d.why}` }); M.band = nb; out.move = d.move; } }
  }
 }
 if (RUN.task) { const t = M.schedule.find(s => s.id === RUN.task); if (t) { t.doneAt = TODAY(); t.result = indAcc; } }
 if (RUN.mode === 'guided') { const iv = M.interventions.find(x => x.id === RUN.intervention); if (iv) iv.guided = { done: R.length, right: R.filter(e => e.correct).length }; }
 saveMeta(); V = { screen: 'done', out }; RUN = null; render(); window.scrollTo(0, 0);
}
const itemsForAny = skill => PASSAGES.some(p => p.form === 'lab' && itemsFor(p, skill).length);

// ---------- starting activities ----------
const labPassages = () => PASSAGES.filter(p => p.form === 'lab');
function formFor(kind){
 // Counterbalanced: half the learners start with form A, half with form B (by a hash of their id).
 const first = hash(P.id) % 2 ? 'B' : 'A', want = kind === 'baseline' ? first : first === 'A' ? 'B' : 'A';
 const band = kind === 'baseline' ? M.band : M.baseline?.band ?? M.band, pair = kind === 'baseline' ? 1 : Number(PBY[M.baseline?.passage]?.id.slice(-1)) || 1;
 return PASSAGES.find(p => p.band === band && p.form === want && p.id.endsWith(String(pair))) || PASSAGES.find(p => p.band === band && p.form === want) || PASSAGES.find(p => p.form === want);
}
function startBaseline(kind){ const p = formFor(kind); if (!p) { flash('No check passage at this level yet.'); return; } start(kind, p, checkSteps(p)); }
function startLab(id){ const p = PBY[id]; if (!p) return; start('lab', p, labSteps(p)); }
function startTask(t){
 const from = PBY[t.from];
 if (t.kind === 'retention' && from) { const first = L.load(P.id).events.find(e => e.src === 'ria' && e.content === from.id); start('retention', from, [{ title: `Remember “${from.title}”?`, intro: `You read this ${t.delay === 1 ? 'yesterday' : `${t.delay} days ago`}. The passage stays hidden.`, hidden: true, items: itemsFor(from, 'recall') }], { task: t.id, delayDays: first ? Math.max(1, Math.round((Date.now() - first.at) / DAY)) : t.delay }); return; }
 if (t.kind === 'transfer' && from) { const tr = itemsFor(from, 'transfer'); start('transfer', from, [{ title: 'Use it somewhere new', intro: `Think about “${from.title}”. Here is a new situation.`, items: [tr[1] || tr[0]] }], { task: t.id }); return; }
 if (t.kind === 'reassess') {
  const pool = labPassages().filter(p => itemsFor(p, t.skill).length && p.id !== t.from), fresh = pool.filter(p => !riaSeen(p.id)).sort((a, b) => Math.abs(a.band - (t.band || M.band)) - Math.abs(b.band - (t.band || M.band)));
  const p = fresh[0] || pool[0]; if (!p) { t.doneAt = TODAY(); saveMeta(); render(); return; }
  start('reassess', p, [{ title: `Check: ${Md.SKILLS[t.skill]?.label || t.skill}`, intro: 'A different passage. Read it, then answer.', items: itemsFor(p, t.skill).slice(0, 3) }], { task: t.id });
 }
}
function startGuided(skill, fromId){
 const pool = labPassages().filter(p => p.id !== fromId && itemsFor(p, skill).length && p.band <= M.band + 1), r = rng(skill + Date.now()), ps = shuffle(pool, r).slice(0, 2);
 if (!ps.length) { flash('No practice items for this skill yet.'); return; }
 const iv = { id: `iv:${skill}:${Date.now().toString(36)}`, at: Date.now(), skill, from: fromId, band: M.band }; M.interventions.push(iv); saveMeta();
 const items = ps.map(p => ({ ...itemsFor(p, skill)[0], guidedPassage: p.id }));
 start('guided', ps[0], [{ title: Md.TEACH[skill]?.title || 'Practice', intro: 'Learn the move, then try it with help.', items: [{ type: 'teach', skill }, ...items] }], { intervention: iv.id });
}

// ---------- screens ----------
const SPK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
function bar(title){ const inside = !!RUN; return `<header class="bar"><a href="${inside ? '#' : '../#/home'}" data-act="${inside ? 'quit' : EMBED ? 'close' : ''}" class="back">${inside ? '← Academy' : '← WordRaiders'}</a><span class="title">${esc(title)}</span><span></span></header>`; }
const pct = r => r && r.value != null ? `${Math.round(r.value)}%` : '–';
const ci = r => r && r.ci ? `<span class="ci">${Math.round(r.ci[0])}–${Math.round(r.ci[1])}%</span>` : '';
const nOf = r => r ? `<span class="n">n = ${r.n}</span>` : '';
function homeView(){
 const ev = events(), rcm = Md.recommend(M, ev, { today: TODAY(), passages: PASSAGES, band: M.band }), ph = Md.currentPhase(ev), due = Md.dueItems(M, TODAY());
 const ria = ev.filter(e => e.src === 'ria'), im = St.independentMastery(ria.filter(e => e.at > Date.now() - 30 * DAY));
 const label = { baseline: 'Take the starting check', lab: `Passage Lab: “${PBY[rcm.passage]?.title}”`, retention: 'Memory check', reassess: 'Re-check a skill', transfer: 'Use it somewhere new', posttest: 'Take the comparison check' }[rcm.kind];
 return bar('Reading Intelligence') + `<main><p class="eyebrow">READING INTELLIGENCE ACADEMY · LEVEL ${M.band}</p><h1>${esc(label)}</h1><p class="lead">${esc(rcm.why)}</p>
 <button class="primary big" data-act="go">▶ Start</button>
 <div class="phases" aria-label="Learning phases">${Md.PHASES.map(x => `<div class="ph ${x.n < ph ? 'done' : x.n === ph ? 'now' : ''}"><b>${x.n}</b><span>${esc(x.short)}</span></div>`).join('')}</div>
 <p class="small muted">Now working on phase ${ph}: ${esc(Md.PHASES[ph - 1].name)}. ${esc(Md.PHASES[ph - 1].blurb)}</p>
 ${due.length > 1 ? `<h2 class="sec">Due now · ${due.length}</h2><ul class="list">${due.map(t => `<li><span>${esc(t.kind === 'retention' ? `${t.delay}-day memory check · ${PBY[t.from]?.title}` : t.kind === 'transfer' ? `Transfer · ${PBY[t.from]?.title}` : `Re-check · ${Md.SKILLS[t.skill]?.label}`)}</span><button class="btn sm" data-act="task" data-id="${esc(t.id)}">Start</button></li>`).join('')}</ul>` : ''}
 <div class="tiles"><div><b>${pct(im)}</b><span>independent, last 30 days ${ci(im)} ${nOf(im)}</span></div><div><b>${ria.filter(e => e.purpose === 'practice').length ? new Set(ria.map(e => e.content)).size : 0}</b><span>passages studied</span></div></div>
 <nav class="menu"><button class="btn" data-act="screen" data-to="labs">📚 Passage Lab</button><button class="btn" data-act="screen" data-to="dash">📊 Dashboard</button><button class="btn" data-act="screen" data-to="reports">🗓 Reports</button><button class="btn" data-act="screen" data-to="grown">🔒 Grown-ups</button></nav>
 </main>`;
}
function labsView(){
 const by = {}; labPassages().forEach(p => (by[p.band] ||= []).push(p));
 return bar('Passage Lab') + `<main><p class="eyebrow">PASSAGE LAB</p><h1>Choose a passage</h1><p class="lead">Ten steps from words to transfer. New passages show real progress; passages you have seen are marked.</p>
 ${Object.keys(by).sort((a, b) => a - b).map(b => `<h2 class="sec">Level ${b}${Number(b) === M.band ? ' · your level' : ''}</h2><ul class="list">${by[b].map(p => `<li><span>${riaSeen(p.id) ? '✓ ' : ''}${esc(p.title)} <small class="muted">${esc(p.domain)}</small></span><button class="btn sm" data-act="lab" data-id="${p.id}">Open</button></li>`).join('')}</ul>`).join('')}</main>`;
}
function passageHTML(p, it){
 const hi = new Set([it?.s, it?.from, it?.to].filter(Boolean));
 return `<article class="passage"><h2 class="ptitle">${esc(p.title)} ${M.settings.readAloud ? `<button class="hear" data-act="tts" aria-label="Read the passage aloud (counts as help)">${SPK}</button>` : ''}</h2><p class="ptext">${p.sentences.map((s, i) => `<span class="sent ${hi.has(i + 1) ? 'hl' : ''}"><sup>${i + 1}</sup>${esc(s)}</span>`).join(' ')}</p></article>`;
}
function optsHTML(it){
 const Q = RUN.q;
 return `<div class="opts">${it.options.map((o, i) => { const cls = Q.done ? (i === it.answer ? 'right' : i === Q.picked ? 'wrong' : '') : Q.picked === i ? 'on' : ''; return `<button class="opt ${cls}" data-act="pick" data-i="${i}" ${Q.done ? 'disabled' : ''}><span class="tag">${Q.done && i === it.answer ? '✓' : Q.done && i === Q.picked ? '✗' : String.fromCharCode(65 + i)}</span>${esc(o)}</button>`; }).join('')}</div>`;
}
function feedbackHTML(it){
 const Q = RUN.q; if (!Q.done) return '';
 let h = `<div class="fb ${Q.ok ? 'ok' : 'try'}">${Q.ok ? '✓ Right.' : '✗ Not this time.'}${it.evidence ? ` The text says: “${esc(it.evidence)}”` : ''}</div>`;
 if (Q.diag) h += `<details class="diag" open><summary>Why it might have been hard</summary><p class="small"><b>What we saw:</b> ${Q.diag.observed.length ? Q.diag.observed.map(esc).join(' ') : 'Nothing else in this passage was missed.'}</p><p class="small"><b>Possible reasons (to test, not facts):</b> ${Q.diag.hypotheses.map(h => `${esc(h.factor)} — ${esc(h.why)}`).join(' · ')}</p></details>`;
 return h + `<button class="primary big" data-act="next">Next ▸</button>`;
}
function runView(){
 const S = step(), it = item(), p = RUN.passage, Q = RUN.q, total = RUN.steps.length;
 const head = `<div class="steps" aria-label="Step ${RUN.si + 1} of ${total}">${RUN.steps.map((_, i) => `<span class="${i < RUN.si ? 'done' : i === RUN.si ? 'now' : ''}"></span>`).join('')}</div><p class="eyebrow">${RUN.mode === 'lab' ? `STEP ${S.n} OF 10 · ` : ''}${esc(S.title.toUpperCase())}</p>${RUN.ii === 0 && S.intro ? `<p class="small muted">${esc(S.intro)}</p>` : ''}`;
 const showText = !(S.hidden || it.hidden) || Q.shownAgain;
 const text = it.type === 'teach' || it.type === 'flag' ? '' : it.scenario ? `<div class="scenario">${esc(it.scenario)}</div>` : it.guidedPassage ? passageHTML(PBY[it.guidedPassage], it) : showText ? passageHTML(p, it) : `<div class="hidden-box">Passage hidden${!Q.done ? ` <button class="linkish" data-act="showagain">Show it again (counts as help)</button>` : ''}</div>`;
 let body = '';
 if (it.type === 'knew') body = `<p class="q">How much do you already know about “${esc(p.title)}”?</p><div class="opts">${['a lot', 'a little', 'nothing'].map(k => `<button class="opt" data-act="knew" data-k="${k}">${k === 'a lot' ? 'A lot' : k === 'a little' ? 'A little' : 'Nothing yet'}</button>`).join('')}</div><p class="small muted">Not scored. It helps show whether knowing the topic makes a difference.</p>`;
 else if (it.type === 'flag') body = `<p class="q">Tap every word you don’t know. Tap again to undo.</p><p class="ptext flagtext">${p.sentences.map((s, si) => s.split(/(\s+)/).map(w => /\S/.test(w) ? `<button class="w ${RUN.flagged.some(f => f.s === si + 1 && f.word === w.replace(/[^\w'-]/g, '')) ? 'on' : ''}" data-act="flag" data-s="${si + 1}" data-w="${esc(w.replace(/[^\w'-]/g, ''))}">${esc(w)}</button>` : ' ').join('')).join(' ')}</p><button class="primary big" data-act="next">${RUN.flagged.length ? `Done (${RUN.flagged.length} marked) ▸` : 'I know them all ▸'}</button>`;
 else if (it.type === 'teach') { const T = Md.TEACH[it.skill] || { title: 'Practice', steps: [] }; body = `<h2>${esc(T.title)}</h2><ol class="teach">${T.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol><button class="primary big" data-act="next">Try it ▸</button>`; }
 else if (it.type === 'mcq') body = `<p class="q">${esc(it.q)} <button class="hear" data-act="hearq" aria-label="Read the question aloud">${SPK}</button></p>${optsHTML(it)}${!Q.done && Q.picked != null && M.settings.confidence && RUN.mode !== 'guided' ? `<div class="conf"><span>How sure are you?</span><button class="btn" data-act="conf" data-c="sure">I’m sure</button><button class="btn" data-act="conf" data-c="unsure">Not sure</button></div>` : ''}${!Q.done && !assessing() && RUN.mode !== 'guided' && !RUN.help.has('hint') ? `<button class="linkish small" data-act="hint">💡 Hint (counts as help)</button>` : RUN.help.has('hint') && !Q.done ? `<p class="hint">💡 ${esc((Md.TEACH[it.skill]?.steps || ['Look back at the passage.'])[0])}</p>` : ''}${feedbackHTML(it)}`;
 else if (it.type === 'chunk') body = `<p class="q">Sentence ${it.s}, in chunks. Which chunk tells the main action (what happens)?</p><div class="chunks">${it.chunks.map((c, i) => `<button class="chunk ${Q.done ? (i === it.verb ? 'right' : i === Q.picked ? 'wrong' : '') : ''}" data-act="chunk" data-i="${i}" ${Q.done ? 'disabled' : ''}>${esc(c)}</button>`).join('<span class="sep">|</span>')}</div>${feedbackHTML({})}`;
 else if (it.type === 'order') { Q.shown ||= shuffle(it.steps.map((_, i) => i), rng(RUN.session + it.steps[0])); body = `<p class="q">${esc(it.prompt)}</p><ol class="built">${Q.order.map(i => `<li>${esc(it.steps[Q.shown[i]])}</li>`).join('')}</ol><div class="opts">${Q.shown.map((k, i) => `<button class="opt ${Q.order.includes(i) ? 'used' : ''}" data-act="order" data-i="${i}" ${Q.done || Q.order.includes(i) ? 'disabled' : ''}>${esc(it.steps[k])}</button>`).join('')}</div>${Q.done ? `<div class="fb ${Q.ok ? 'ok' : 'try'}">${Q.ok ? '✓ Right order.' : '✗ Not quite. The right order:'}</div>${Q.ok ? '' : `<ol class="built">${it.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>`}<button class="primary big" data-act="next">Next ▸</button>` : `<div class="row"><button class="btn" data-act="undo" ${Q.order.length ? '' : 'disabled'}>↶ Undo</button><button class="primary" data-act="ordercheck" ${Q.order.length === it.steps.length ? '' : 'disabled'}>Check</button></div>`}`; }
 else if (it.type === 'write') body = `<p class="q">${esc(it.prompt)}</p>${Q.done ? writeResult(Q.write, Q.text, it.skill === 'big-idea-written' && RUN.steps.slice(RUN.si + 1).some(x => x.items.some(y => y.skill === 'retell'))) : `<textarea id="write" rows="5" placeholder="Write in your own words…"></textarea><button class="primary big" data-act="writecheck">Check my answer</button>`}`;
 return bar(RUN.mode === 'lab' ? 'Passage Lab' : RUN.mode === 'baseline' ? 'Starting check' : RUN.mode === 'posttest' ? 'Comparison check' : 'Practice') + `<main class="round">${head}${text}<section class="card">${body}</section></main>`;
}
function writeResult(r, text, holdBack){
 return `<div class="fb ${r.verdict === 'correct' ? 'ok' : 'try'}">${esc(VERDICT_TEXT[r.verdict])} (${r.found} of ${r.of} key ideas)</div><p class="small muted">Checked against a fixed list of key ideas (automatic rubric, not AI). A grown-up can review and correct it.</p>
 <ul class="units">${r.units.filter(u => u.found || !holdBack).map(u => `<li class="${u.found ? 'got' : 'miss'}">${u.found ? '✓' : '○'} ${esc(u.label)}${u.found ? ` <span class="ev">— you wrote: “${esc(u.evidence.sentence)}”</span>` : ''}</li>`).join('')}${holdBack && r.units.some(u => !u.found) ? `<li class="miss">○ ${r.units.filter(u => !u.found).length} key idea${r.units.filter(u => !u.found).length > 1 ? 's' : ''} still missing: keep reading closely; you will see them at the end.</li>` : ''}</ul><p class="small">Your answer: “${esc(text)}”</p><button class="primary big" data-act="next">Next ▸</button>`;
}
function doneView(){
 const { out } = V, R = out.results, scoredR = R.filter(e => e.correct != null), right = scoredR.filter(e => e.correct).length, p = out.passage;
 const bySkill = {}; for (const e of scoredR) { const k = Md.SKILLS[e.skill]?.label || e.skill; (bySkill[k] ||= [0, 0])[1]++; if (e.correct) bySkill[k][0]++; }
 const weak = out.weak || [];
 return bar('Done') + `<main><section class="card result"><div class="burst">${out.mode === 'baseline' ? '📏' : '🎉'}</div><h1>${right} of ${scoredR.length} right</h1>
 <p class="lead">${out.mode === 'baseline' ? 'Your starting point is saved. Later, a comparison check on a matched passage will show what changed.' : out.mode === 'posttest' ? 'Comparison saved. See the Dashboard for the change since your starting check.' : out.mode === 'guided' ? 'Practice done. A re-check on a new passage is waiting.' : `Independent: ${out.indAcc == null ? '–' : Math.round(out.indAcc * 100) + '%'} (answers without help).`}</p>
 <table class="mini"><tbody>${Object.entries(bySkill).map(([k, [a, b]]) => `<tr><td>${esc(k)}</td><td>${a}/${b}</td></tr>`).join('')}</tbody></table>
 ${out.move ? `<p class="tip">${out.move === 'up' ? '⬆ Your level went up' : '⬇ Next passages will be a little easier'}: ${esc(out.band.why)}</p>` : out.band ? `<p class="small muted">Level: ${esc(out.band.why)}</p>` : ''}
 ${weak.length ? `<h2 class="sec">Practise next</h2><ul class="list">${weak.map(s => `<li><span>${esc(Md.SKILLS[s]?.label || s)}</span><button class="btn sm" data-act="guided" data-skill="${s}" data-from="${p.id}">Learn it</button></li>`).join('')}</ul><p class="small muted">A re-check on a different passage, memory checks in 1 and 7 days, and a transfer task are scheduled.</p>` : out.mode === 'lab' ? '<p class="small muted">Memory checks in 1 and 7 days and a transfer task are scheduled.</p>' : ''}
 <div class="row center"><button class="primary" data-act="screen" data-to="home">Academy home</button>${EMBED ? '<button class="btn" data-act="close">Back to WordRaiders</button>' : '<a class="btn" href="../#/home">Back to WordRaiders</a>'}</div></section></main>`;
}

// ---------- dashboard ----------
function weeklySeries(evts){ return St.weekly(evts, 3).map(p => ({ x: p.week, y: p.value, n: p.n, lo: p.ci?.[0], hi: p.ci?.[1] })); }
function dashView(){
 const ev = events(), read = ev.filter(e => e.skill !== 'familiarity'), ind = St.independentMastery(read), acc = St.accuracy(read), dep = St.assistanceDependency(read);
 const base = M.baseline ? ev.filter(e => e.session === M.baseline.session) : [], post = (M.posttests || []).length ? ev.filter(e => e.session === M.posttests[M.posttests.length - 1].session) : [];
 const gain = St.learningGain(base, post), ti = St.transferIndex(read), cal = St.calibration(read), ret = St.retention(read), tr = St.transfer(read);
 const activeMs = M.sessions.reduce((a, s) => a + s.ms, 0), eff = St.learningEfficiency(gain, activeMs), growth = St.growthRate(read);
 const vars = Md.VARIABLES.map(v => Md.variableReport(ev, v.id));
 const skills = Object.entries(Md.SKILLS).map(([k, s]) => ({ k, s, m: Md.mastery(Md.forSkill(ev, k)), im: St.independentMastery(Md.forSkill(ev, k)) })).filter(x => x.m.status !== 'not started');
 const strong = skills.filter(x => x.im.n >= 5 && x.im.ci && x.im.ci[0] >= 70).sort((a, b) => b.im.ci[0] - a.im.ci[0]).slice(0, 5);
 const needs = skills.filter(x => x.im.n >= 5 && x.im.ci && x.im.ci[1] < 70).sort((a, b) => a.im.ci[1] - b.im.ci[1]).slice(0, 5);
 const ph = Md.currentPhase(ev), sel = V.skill || (skills[0]?.k ?? 'relation');
 const phaseSeries = Md.PHASES.map(x => ({ name: x.short, points: weeklySeries(read.filter(e => e.phase === x.n)) })).filter(s => s.points.length);
 const bins = [[1, 1, '1 day'], [2, 3, '2–3 days'], [4, 7, '4–7 days'], [8, 14, '8–14 days'], [15, 1e9, '15+ days']].map(([a, b, l]) => { const r = read.filter(e => e.purpose === 'retention' && e.correct != null && e.assisted === false && (e.delayDays ?? 0) >= a && (e.delayDays ?? 0) <= b); const x = St.rate(r.filter(e => e.correct).length, r.length); return { x: l, y: x.value, n: x.n, lo: x.ci?.[0], hi: x.ci?.[1] }; }).filter(r => r.n);
 const trU = weeklySeries(read.filter(e => e.familiar === false)), trP = weeklySeries(read.filter(e => e.familiar === true));
 const errs = Object.entries(St.countBy(read.filter(e => e.correct === false), e => e.error || Md.SKILLS[e.skill]?.label || e.skill)).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([label, value]) => ({ label, value }));
 const weeks = {}; for (const s of M.sessions) (weeks[St.weekKey(s.at)] ||= { ms: 0 }).ms += s.ms;
 const wk = St.weekly(read, 3), gainPts = wk.slice(1).map((p, i) => ({ label: p.week, x: (weeks[p.week]?.ms || 0) / 60e3, y: p.value - wk[i].value }));
 const calRows = [['I’m sure', cal.whenSure], ['Not sure', cal.whenUnsure]].map(([x, r]) => ({ x, y: r.value, n: r.n, lo: r.ci?.[0], hi: r.ci?.[1] })).filter(r => r.n);
 const skillOpts = skills.map(x => `<option value="${x.k}" ${x.k === sel ? 'selected' : ''}>${esc(x.s.label)}</option>`).join('');
 const row = (label, r, note = '') => `<tr><th scope="row">${esc(label)}</th><td>${pct(r)}</td><td>${r?.ci ? `${Math.round(r.ci[0])}–${Math.round(r.ci[1])}%` : '–'}</td><td>${r?.n ?? 0}</td><td class="small">${note}</td></tr>`;
 return bar('Dashboard') + `<main class="wide"><p class="eyebrow">READING INTELLIGENCE DASHBOARD · ${esc(P.name.toUpperCase())}</p><h1>What the evidence shows</h1>
 <p class="small muted">Every number shows how many answers it rests on (n) and a 95% range. “Independent” means first try, no read-aloud, hints or look-backs. Older answers from other pages whose help is unknown are shown but never count as independent.</p>
 <div class="tiles four"><div><b>${pct(ind)}</b><span>independent accuracy ${ci(ind)} ${nOf(ind)}</span></div><div><b>${pct(acc)}</b><span>all scored answers ${nOf(acc)}</span></div><div><b>${pct(dep)}</b><span>answers with help ${nOf(dep)}</span></div><div><b>${ph}</b><span>phase: ${esc(Md.PHASES[ph - 1].short)}</span></div></div>
 <h2 class="sec">Starting point vs now</h2>${gain.gain == null ? `<p class="small">${M.baseline ? `Starting check: ${pct(gain.pre)} independent (${gain.pre.n} answers, level ${M.baseline.band}, form ${M.baseline.form}). ${esc(gain.reason)}. The comparison check uses a matched passage (same level and structure).` : 'No starting check yet. Take it from Academy home.'}</p>` : `<p>Starting check ${pct(gain.pre)} (n ${gain.pre.n}) → comparison ${pct(gain.post)} (n ${gain.post.n}): <b>${gain.gain > 0 ? '+' : ''}${Math.round(gain.gain)} points</b> (95% range ${Math.round(gain.ci[0])} to ${Math.round(gain.ci[1])}). ${gain.significant ? 'The range excludes zero.' : 'The range includes zero, so the change is not yet clear.'} Same level, matched forms; one passage each, so treat this as a rough check.</p>`}
 <table class="stats"><thead><tr><th>Measure</th><th>Value</th><th>95% range</th><th>n</th><th>Notes</th></tr></thead><tbody>
 ${row('Independent mastery', ind, `excluded: ${ind.excludedAssisted} with help, ${ind.excludedUnknownHelp} help unknown, ${ind.excludedRetries} retries`)}
 ${row('Retention (≥1 day later)', ret, ret.medianDelayDays != null ? `median delay ${ret.medianDelayDays} days` : '')}
 ${row('Transfer (new situations)', tr, `${read.filter(e => e.purpose === 'transfer' && e.cond?.pi).length} of these could be answered from general knowledge`)}
 ${row('Error rate', St.errorRate(read))}
 ${row('Assistance dependency', dep, `help unknown for ${dep.unknownHelp}`)}
 <tr><th scope="row">Growth per week</th><td>${growth.value == null ? '–' : `${growth.value > 0 ? '+' : ''}${growth.value.toFixed(1)} pts`}</td><td>${growth.ci ? `${growth.ci[0].toFixed(1)} to ${growth.ci[1].toFixed(1)}` : '–'}</td><td>${growth.weeks} wk</td><td class="small">${esc(growth.reason || (growth.uncertain ? 'range includes zero: direction not yet clear' : 'weekly independent accuracy, least squares'))}</td></tr>
 <tr><th scope="row">Learning efficiency</th><td>${eff.value == null ? '–' : `${eff.value.toFixed(1)} pts/hour`}</td><td>${eff.ci ? `${eff.ci[0].toFixed(1)} to ${eff.ci[1].toFixed(1)}` : '–'}</td><td>${(activeMs / 36e5).toFixed(1)} h</td><td class="small">${esc(eff.reason || 'measured gain per hour of Academy practice')}</td></tr>
 <tr><th scope="row">Calibration</th><td colspan="3">${esc(cal.label)}</td><td class="small">sure: ${pct(cal.whenSure)} right (n ${cal.whenSure.n}); not sure: ${pct(cal.whenUnsure)} (n ${cal.whenUnsure.n})</td></tr>
 <tr><th scope="row">Reading Transfer Index</th><td>${ti.index == null ? '–' : ti.index.toFixed(2)}</td><td colspan="2">new: ${pct(ti.unfamiliar)} (n ${ti.unfamiliar.n}) · practised: ${pct(ti.practised)} (n ${ti.practised.n})</td><td class="small">${esc(ti.reason || '1.00 = as good on new material as on practised')}</td></tr>
 </tbody></table>
 <h2 class="sec">The 12 variables</h2><div class="vars">${vars.map(v => varCard(v)).join('')}</div>
 <h2 class="sec">Strengths and needs</h2><div class="two"><div><h3>Strengths</h3>${strong.length ? `<ul>${strong.map(x => `<li>${esc(x.s.label)} — ${pct(x.im)} ${ci(x.im)} ${nOf(x.im)}</li>`).join('')}</ul>` : '<p class="small muted">Needs at least 5 independent answers with a 95% range above 70%.</p>'}</div><div><h3>Needs intervention</h3>${needs.length ? `<ul>${needs.map(x => `<li>${esc(x.s.label)} — ${pct(x.im)} ${ci(x.im)} ${nOf(x.im)} <button class="btn sm" data-act="guided" data-skill="${x.k}" data-from="">Practise</button></li>`).join('')}</ul>` : '<p class="small muted">None clearly below 70% yet (needs 5+ independent answers).</p>'}</div></div>
 <h2 class="sec">Skills</h2><table class="stats"><thead><tr><th>Skill</th><th>Phase</th><th>Status</th><th>Independent</th><th>Evidence</th></tr></thead><tbody>${skills.map(x => `<tr><td>${esc(x.s.label)}</td><td>${x.s.phase}</td><td>${esc(Md.STATUS_TEXT[x.m.status])}</td><td>${pct(x.im)} <span class="n">n ${x.im.n}</span></td><td class="small">${x.m.evidence.passages} new passages, ${x.m.evidence.days} days, later checks ${x.m.evidence.laterOk ? '✓' : `${x.m.evidence.laterChecks} (none right yet)`}</td></tr>`).join('') || '<tr><td colspan="5">No skills yet.</td></tr>'}</tbody></table>
 <h2 class="sec">Graphs</h2>
 ${C.lineChart('1 · Skill mastery over time (weekly independent accuracy by phase)', phaseSeries, { note: 'Weeks with at least 3 independent answers. Bars show 95% ranges.' })}
 ${C.dotChart('2 · Accuracy by passage level', St.byBand(read).map(b => ({ x: b.band === '1' ? '1 (daily pages)' : b.band, y: b.value, n: b.n, lo: b.ci?.[0], hi: b.ci?.[1] })), { xLabel: 'Level' })}
 ${C.dotChart('3 · Retention: right answers by days since learning', bins, { xLabel: 'Time since first study' })}
 ${C.lineChart('4 · New vs practised material (weekly independent accuracy)', [{ name: 'New material', points: trU }, { name: 'Practised', points: trP }])}
 ${C.barChart('5 · What went wrong (likely reasons for misses)', errs, { note: 'Reasons are the diagnosis hypotheses for Academy misses; misses from other pages are grouped by skill.' })}
 ${C.scatter('6 · Practice time vs change in accuracy (per week)', gainPts, { xLabel: 'Academy minutes that week', yLabel: 'change in accuracy (points)', note: 'Shows association only: other things change too, so this is not proof that practice time caused a change.' })}
 ${C.dotChart('7 · Confidence vs accuracy', calRows, { xLabel: 'Said' })}
 <label class="sel">8 · Skill trajectory: <select data-act="skillsel">${skillOpts}</select></label>
 ${C.lineChart(`Weekly independent accuracy · ${Md.SKILLS[sel]?.label || sel}`, [{ name: Md.SKILLS[sel]?.label || sel, points: weeklySeries(Md.forSkill(read, sel)) }])}
 </main>`;
}
function varCard(v){
 const kind = Md.VAR[v.id].direct.length ? 'measured' : 'inferred only';
 return `<details class="var"><summary><span class="vn">${Md.VAR[v.id].n}</span><span class="vt">${esc(v.name)}</span><span class="vv">${v.independent.n ? pct(v.independent) : '–'}</span><span class="vk ${kind === 'measured' ? '' : 'inf'}">${kind}</span></summary>
 <p class="small">${esc(v.note)}</p>${v.independent.n ? `<p class="small">Independent: ${pct(v.independent)} ${ci(v.independent)} ${nOf(v.independent)} · last 30 days ${pct(v.recent)} (n ${v.recent.n}) · before ${pct(v.older)} (n ${v.older.n})</p>` : '<p class="small muted">No direct evidence yet.</p>'}
 ${v.inferred.map(i => `<p class="small"><b>${esc(i.label)} (inferred):</b> ${i.value == null ? 'not enough data' : esc(describe(i.value))}. <span class="muted">${esc(i.meaning)}</span></p>`).join('')}
 ${v.calibration ? `<p class="small"><b>Calibration:</b> ${esc(v.calibration.label)}; sure answers ${pct(v.calibration.whenSure)} right (n ${v.calibration.whenSure.n}), not-sure ${pct(v.calibration.whenUnsure)} (n ${v.calibration.whenUnsure.n}).</p>` : ''}
 ${v.oral ? `<p class="small"><b>Oral reading (grown-up scored):</b> ${v.oral.map(o => `${Math.round(o.score * 100)}% accurate, ${o.cond.wcpm} words a minute`).join('; ')}.</p>` : ''}
 ${v.retention ? `<p class="small">Retention ${pct(v.retention)} (n ${v.retention.n}); transfer ${pct(v.transfer)} (n ${v.transfer.n}).</p>` : ''}</details>`;
}
function describe(v){
 if (v.value !== undefined && v.n !== undefined) return `${Math.round(v.value)}% (n ${v.n})`;
 if (v.hidden) return `hidden ${pct(v.hidden)} (n ${v.hidden.n}) vs visible ${pct(v.visible)} (n ${v.visible.n})`;
 if (v.early) return `early ${pct(v.early)} vs late ${pct(v.late)} over ${v.sessions} sessions`;
 if (v.familiar) return `familiar topics ${pct(v.familiar)} (n ${v.familiar.n}) vs new ${pct(v.unfamiliar)} (n ${v.unfamiliar.n})`;
 if (v.flaggedRight) return `flagged words answered right ${pct(v.flaggedRight)} (n ${v.flaggedRight.n}) vs unflagged ${pct(v.unflaggedRight)} (n ${v.unflaggedRight.n})`;
 if (v.mean !== undefined) return `${Math.round(v.mean)}% of key ideas (n ${v.n})`;
 return JSON.stringify(v);
}

// ---------- reports ----------
const PERIODS = { week: 7, month: 30, quarter: 91, year: 365 };
function reportsView(){
 const ev = events(), per = V.period || 'month', d = PERIODS[per], now = Date.now(), cur = [now - d * DAY, now + 1], prev = [now - 2 * d * DAY, now - d * DAY];
 const rows = Md.VARIABLES.map(v => { const xs = Md.forVar(ev, v.id), c = St.comparePeriods(xs, prev, cur); return { v, c, label: St.trendLabel(c, 5) }; });
 const then = new Map(Object.keys(Md.SKILLS).map(k => [k, Md.mastery(Md.forSkill(ev.filter(e => e.at < now - 30 * DAY), k)).status])), nowS = new Map(Object.keys(Md.SKILLS).map(k => [k, Md.mastery(Md.forSkill(ev, k)).status]));
 const could = [...then].filter(([, s]) => s === 'mastered' || s === 'secure').map(([k]) => Md.SKILLS[k].label), can = [...nowS].filter(([, s]) => s === 'mastered' || s === 'secure').map(([k]) => Md.SKILLS[k].label);
 const groups = { improved: [], plateau: [], declined: [], 'not enough data': [], unclear: [] }; rows.forEach(r => groups[r.label].push(r));
 const ivs = M.interventions.slice(-12).reverse().map(iv => { const after = ev.filter(e => e.skill === iv.skill && e.at > iv.at && e.purpose === 'reassess'), before = ev.filter(e => e.skill === iv.skill && e.at < iv.at && e.at > iv.at - 30 * DAY); const conf = M.conditions.filter(c => c.at > iv.at - 7 * DAY && c.at < iv.at + 7 * DAY); return { iv, before: St.independentMastery(before), after: St.independentMastery(after), conf }; });
 const growth = St.growthRate(ev), last = growth.points?.[growth.points.length - 1];
 const proj = growth.value != null && last ? { mid: Math.max(0, Math.min(100, last.value + 4 * growth.value)), lo: Math.max(0, Math.min(100, last.value + 4 * growth.ci[0])), hi: Math.max(0, Math.min(100, last.value + 4 * growth.ci[1])) } : null;
 const ret = St.retention(ev), tr = St.transfer(ev), ti = St.transferIndex(ev);
 return bar('Reports') + `<main class="wide"><p class="eyebrow">REPORTS · ${esc(P.name.toUpperCase())}</p><h1>Progress report</h1>
 <div class="seg" role="group" aria-label="Period">${Object.keys(PERIODS).map(k => `<button class="${k === per ? 'on' : ''}" data-act="period" data-p="${k}">${k[0].toUpperCase() + k.slice(1)}ly</button>`).join('')}</div>
 <p class="small muted">Compares the last ${d} days with the ${d} days before, per variable, using independent answers only. “Improved” or “declined” is shown only when the 95% range of the change excludes zero.</p>
 <table class="stats"><thead><tr><th>Variable</th><th>Before</th><th>Now</th><th>Change</th><th>Result</th></tr></thead><tbody>${rows.map(r => `<tr><td>${esc(r.v.name)}</td><td>${pct(r.c.pre)} <span class="n">n ${r.c.pre.n}</span></td><td>${pct(r.c.post)} <span class="n">n ${r.c.post.n}</span></td><td>${r.c.gain == null ? '–' : `${r.c.gain > 0 ? '+' : ''}${Math.round(r.c.gain)} (${Math.round(r.c.ci[0])} to ${Math.round(r.c.ci[1])})`}</td><td>${esc(r.label)}</td></tr>`).join('')}</tbody></table>
 <h2 class="sec">30 days ago vs today</h2>
 <div class="two"><div><h3>Could do 30 days ago</h3>${could.length ? `<ul>${could.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : '<p class="small muted">No skill met the mastery rule yet.</p>'}</div><div><h3>Can do independently today</h3>${can.length ? `<ul>${can.map(s => `<li>${esc(s)}</li>`).join('')}</ul>` : '<p class="small muted">No skill meets the mastery rule yet (3 new passages, 2 days, 80% on the last 5, plus a later check).</p>'}</div></div>
 <ul class="small"><li><b>Improved:</b> ${groups.improved.map(r => esc(r.v.name)).join(', ') || 'none clearly'}</li><li><b>Plateaued:</b> ${groups.plateau.map(r => esc(r.v.name)).join(', ') || 'none'}</li><li><b>Declined:</b> ${groups.declined.map(r => esc(r.v.name)).join(', ') || 'none clearly'}</li><li><b>Not enough data:</b> ${groups['not enough data'].map(r => esc(r.v.name)).join(', ') || 'none'}</li></ul>
 <h2 class="sec">Retention and transfer</h2><p class="small">Retention ${pct(ret)} ${ci(ret)} (n ${ret.n}${ret.medianDelayDays != null ? `, median ${ret.medianDelayDays} days later` : ''}). Transfer ${pct(tr)} ${ci(tr)} (n ${tr.n}). Reading Transfer Index ${ti.index == null ? `– (${esc(ti.reason)})` : ti.index.toFixed(2)}.</p>
 <h2 class="sec">Interventions and what happened next</h2>${ivs.length ? `<table class="stats"><thead><tr><th>Date</th><th>Skill</th><th>Before (30 days)</th><th>Re-checks after</th><th>Other changes nearby</th></tr></thead><tbody>${ivs.map(x => `<tr><td>${new Date(x.iv.at).toLocaleDateString()}</td><td>${esc(Md.SKILLS[x.iv.skill]?.label || x.iv.skill)}</td><td>${pct(x.before)} <span class="n">n ${x.before.n}</span></td><td>${pct(x.after)} <span class="n">n ${x.after.n}</span></td><td class="small">${x.conf.map(c => esc(c.what)).join('; ') || '—'}</td></tr>`).join('')}</tbody></table><p class="small muted">Before/after comparisons do not prove the lesson caused a change: passages differ, and level or settings changes nearby are listed so they are not mistaken for the lesson’s effect.</p>` : '<p class="small muted">No lessons yet. They start after a missed Lab question.</p>'}
 <h2 class="sec">Projection (uncertain)</h2><p class="small">${proj ? `If the current weekly trend continued, independent accuracy in 4 weeks might be about ${Math.round(proj.mid)}%, with a plausible range of ${Math.round(proj.lo)}–${Math.round(proj.hi)}%. This is an estimate from ${growth.weeks} weeks of data, not a promise: trends often change.` : `No projection: ${esc(growth.reason)}.`}</p>
 <h2 class="sec">Conditions log</h2><ul class="small">${M.conditions.slice(-20).reverse().map(c => `<li>${new Date(c.at).toLocaleDateString()} — ${esc(c.what)}</li>`).join('') || '<li>—</li>'}</ul></main>`;
}

// ---------- grown-ups ----------
function grownView(){
 const ev = events(), writes = ev.filter(e => e.explain && e.src === 'ria').slice(-30).reverse(), totals = mainAppTotals(P.id), eq = engineeringQuest();
 const others = L.players().filter(x => x.id !== P.id).map(x => ({ x, M: L.meta(x.id) })).filter(o => o.M.baseline);
 const cmp = M.baseline ? others.filter(o => o.M.baseline.band === M.baseline.band && o.M.baseline.form === M.baseline.form) : [];
 return bar('Grown-ups') + `<main class="wide"><p class="eyebrow">GROWN-UPS · ${esc(P.name.toUpperCase())}</p><h1>Review, settings and data</h1>
 <h2 class="sec">Written answers (review and correct)</h2><p class="small muted">Scored by a fixed rubric (key ideas). Change the verdict if it is wrong; the original is kept and both are exported.</p>
 ${writes.length ? writes.map(e => `<div class="review"><p class="small"><b>${esc(PBY[e.content]?.title || e.content)}</b> · ${esc(Md.SKILLS[e.skill]?.label)} · ${new Date(e.at).toLocaleDateString()}</p><p>“${esc(e.explain.text || '')}”</p><p class="small">Rubric: ${esc(e.explain.verdict)} (${e.explain.found}/${e.explain.of} ideas${e.explain.units?.length ? `: ${esc(e.explain.units.join(', '))}` : ''})${e.explain.override ? ` · corrected to <b>${esc(e.explain.override)}</b>` : ''}</p><div class="row">${['correct', 'partial', 'incorrect'].map(v => `<button class="btn sm ${e.explain.override === v ? 'on' : ''}" data-act="override" data-id="${esc(e.id)}" data-v="${v}">${v}</button>`).join('')}${e.explain.override ? `<button class="linkish small" data-act="override" data-id="${esc(e.id)}" data-v="">undo</button>` : ''}</div></div>`).join('') : '<p class="small muted">No written answers yet.</p>'}
 <h2 class="sec">Settings</h2><label class="tog"><input type="checkbox" data-act="set" data-k="confidence" ${M.settings.confidence ? 'checked' : ''}> Ask “How sure are you?” (needed for calibration)</label><label class="tog"><input type="checkbox" data-act="set" data-k="readAloud" ${M.settings.readAloud ? 'checked' : ''}> Offer read-aloud of passages (always recorded as help)</label>
 <p class="small">Level: <b>${M.band}</b> <button class="btn sm" data-act="band" data-d="-1">Easier</button> <button class="btn sm" data-act="band" data-d="1">Harder</button> <span class="muted">(changes are logged so they are not mistaken for progress)</span></p>
 <h2 class="sec">Compare</h2>${!M.baseline ? '<p class="small muted">Comparisons need a starting check.</p>' : cmp.length ? `<p class="small">Learners with the same starting form and level (comparable conditions only):</p><ul class="small">${[{ x: P, M }, ...cmp].map(o => { const b = L.load(o.x.id).events.filter(e => e.session === o.M.baseline.session), r = St.independentMastery(b); return `<li>${esc(o.x.name)}: starting check ${pct(r)} (n ${r.n})</li>`; }).join('')}</ul><p class="small muted">Each child is best compared with their own earlier results; no ranking is shown.</p>` : '<p class="small muted">No other learner on this device took the same starting form at the same level, so no comparison is shown.</p>'}
 <h2 class="sec">Other WordRaiders practice and other apps</h2><p class="small">Main game (daily totals, not item-level): ${totals.answered} answers on ${totals.days} days, ${totals.answered ? Math.round(100 * totals.firstTryRight / totals.answered) : 0}% right first time; ${totals.repairs} Error Book topics open.</p>
 ${eq && eq.length ? `<p class="small">Engineering Quest on this device (math; separate evidence):</p><ul class="small">${eq.map(q => `<li>${esc(q.name)}: ${q.independent} independent answers (${q.independent ? Math.round(100 * q.correct / q.independent) : 0}% right) on ${q.days} days; transfer ${q.transfer ? Math.round(100 * q.transferOk / q.transfer) : 0}% (n ${q.transfer}); recall ${q.recall ? Math.round(100 * q.recallOk / q.recall) : 0}% (n ${q.recall}).</li>`).join('')}</ul><p class="small muted">Math and reading are different skills: these numbers can suggest questions (e.g. does reading word problems slow math?) but never prove reading mastery.</p>` : '<p class="small muted">No Engineering Quest learning data on this device.</p>'}
 <h2 class="sec">Data</h2><p class="small">Stored only on this device, per learner. Nothing is sent anywhere.</p><div class="row"><button class="btn" data-act="export" data-f="json">Download JSON</button><button class="btn" data-act="export" data-f="csv">Download CSV</button><button class="btn danger" data-act="delete">Delete ${esc(P.name)}’s Academy data</button></div>
 <p class="small muted">Question check: every question was answered by an independent checker with the passage (to confirm one right answer) and without it. Questions the checker could answer confidently without the passage do not count toward reading skills (they still count for vocabulary, prediction and transfer, where using what you know is the point). The checker was a strong adult reader, so this is strict for children.</p>
 <p class="small muted">Limits: no AI grading (rubrics instead); working memory, attention and background knowledge are inferred, never measured; passages are original but not educator-reviewed or normed; levels are approximate.</p></main>`;
}
function download(name, text, type){ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

// ---------- render + events ----------
function render(){
 app.innerHTML = RUN ? runView() : V.screen === 'done' ? doneView() : V.screen === 'labs' ? labsView() : V.screen === 'dash' ? dashView() : V.screen === 'reports' ? reportsView() : V.screen === 'grown' ? grownView() : homeView();
 const w = document.querySelector('#write'); if (w && !w.value && RUN?.q?.draft) w.value = RUN.q.draft;
}
function go(){
 const ev = events(), r = Md.recommend(M, ev, { today: TODAY(), passages: PASSAGES, band: M.band });
 if (r.kind === 'baseline' || r.kind === 'posttest') startBaseline(r.kind); else if (r.kind === 'lab') startLab(r.passage); else startTask(r.item);
}
app.addEventListener('input', e => { if (e.target.id === 'write' && RUN) RUN.q.draft = e.target.value; });
app.addEventListener('change', e => {
 const t = e.target; if (t.dataset.act === 'skillsel') { V.skill = t.value; render(); }
 if (t.dataset.act === 'set') { M.settings[t.dataset.k] = t.checked; M.conditions.push({ at: Date.now(), what: `Setting “${t.dataset.k}” ${t.checked ? 'on' : 'off'}` }); saveMeta(); }
});
app.addEventListener('click', e => {
 const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; const a = b.dataset.act;
 if (a === 'close') { e.preventDefault(); host()?.wrNotebook.close(); return; }
 if (a === 'quit') { e.preventDefault(); if (confirm('Stop here? Answers so far are saved.')) { RUN = null; V = { screen: 'home' }; render(); } return; }
 if (a === 'screen') { V = { screen: b.dataset.to }; render(); window.scrollTo(0, 0); return; }
 if (a === 'go') { go(); return; }
 if (a === 'lab') { startLab(b.dataset.id); return; }
 if (a === 'task') { const t = M.schedule.find(s => s.id === b.dataset.id); if (t) startTask(t); return; }
 if (a === 'guided') { startGuided(b.dataset.skill, b.dataset.from); return; }
 if (a === 'period') { V.period = b.dataset.p; render(); return; }
 if (a === 'override') { const id = b.dataset.id; if (b.dataset.v) M.overrides[id] = { verdict: b.dataset.v, at: Date.now() }; else delete M.overrides[id]; saveMeta(); render(); return; }
 if (a === 'band') { const nb = Md.bandStep(M.band, Number(b.dataset.d)); if (nb !== M.band) { M.conditions.push({ at: Date.now(), what: `Level ${M.band} → ${nb} (changed by a grown-up)` }); M.band = nb; saveMeta(); render(); } return; }
 if (a === 'export') { const f = b.dataset.f; download(`wordraiders-reading-${P.name}.${f}`, f === 'json' ? L.exportJSON(P.id) : L.exportCSV(P.id), f === 'json' ? 'application/json' : 'text/csv'); return; }
 if (a === 'delete') { if (confirm(`Delete all Reading Academy evidence for ${P.name} on this device? This cannot be undone.`) && confirm('Are you sure?')) { L.deleteEvidence(P.id); M = L.meta(P.id); M.settings = { confidence: true, readAloud: true }; flash('Deleted.'); render(); } return; }
 if (!RUN) return;
 const Q = RUN.q, it = item();
 if (a === 'next') { next(); return; }
 if (a === 'knew') { RUN.knew = b.dataset.k; rec({ item: `${RUN.passage.id}:familiarity`, content: RUN.passage.id, skill: 'familiarity', vars: ['background'], phase: null, purpose: RUN.purpose, band: RUN.passage.band, correct: null, assisted: false, session: RUN.session, cond: { knew: RUN.knew, mode: RUN.mode } }); next(); return; }
 if (a === 'flag') { const s = Number(b.dataset.s), w = b.dataset.w, k = RUN.flagged.findIndex(f => f.s === s && f.word === w); if (k >= 0) RUN.flagged.splice(k, 1); else if (w) RUN.flagged.push({ s, word: w }); render(); return; }
 if (a === 'pick') { pick(Number(b.dataset.i)); return; }
 if (a === 'conf') { Q.conf = b.dataset.c; commit(); return; }
 if (a === 'hint') { RUN.help.add('hint'); render(); return; }
 if (a === 'tts') { RUN.help.add('tts'); say(`${RUN.passage.title}. ${RUN.passage.sentences.join(' ')}`); return; }
 if (a === 'hearq') { RUN.help.add('tts'); say(`${it.q} ${it.options.map((o, i) => `${String.fromCharCode(65 + i)}: ${o}`).join('. ')}`); return; }
 if (a === 'showagain') { RUN.help.add('showagain'); Q.shownAgain = true; render(); return; }
 if (a === 'chunk') { chunkPick(Number(b.dataset.i)); return; }
 if (a === 'order') { orderTap(Number(b.dataset.i)); return; }
 if (a === 'undo') { Q.order.pop(); render(); return; }
 if (a === 'ordercheck') { orderCheck(); return; }
 if (a === 'writecheck') { writeCheck(); return; }
});
// Tooltips for chart marks (hover and keyboard focus).
function tip(el, show){ const box = el.closest('.chart-box'); const t = box?.querySelector('.tip'); if (!t) return; if (!show) { t.hidden = true; return; } t.textContent = el.dataset.tip; t.hidden = false; const r = el.getBoundingClientRect(), br = box.getBoundingClientRect(); t.style.left = Math.min(br.width - 200, Math.max(0, r.left - br.left + r.width / 2 - 100)) + 'px'; t.style.top = Math.max(0, r.top - br.top - 44) + 'px'; }
app.addEventListener('mouseover', e => { const el = e.target.closest('[data-tip]'); if (el) tip(el, true); });
app.addEventListener('mouseout', e => { const el = e.target.closest('[data-tip]'); if (el) tip(el, false); });
app.addEventListener('focusin', e => { const el = e.target.closest('[data-tip]'); if (el) tip(el, true); });
app.addEventListener('focusout', e => { const el = e.target.closest('[data-tip]'); if (el) tip(el, false); });
app.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.w')) { e.preventDefault(); e.target.click(); } });

// ---------- start ----------
if (QS.has('test')) window.__ria = { M: () => M, RUN: () => RUN, events, L, Md, St, PASSAGES, start, labSteps, checkSteps, startTask, render, setV: v => { V = v; render(); } };
(async () => {
 try { const evs = await importAll(P.id); if (evs.length) L.record(P.id, evs); M.imported = { at: Date.now(), n: evs.length }; saveMeta(); } catch (err) { console.warn('import', err); }
 render();
 if (QS.has('go')) go();
})();
render();
