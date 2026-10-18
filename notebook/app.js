// My Notebook: WordRaiders' wrong-answer notebook (错题本), the same habit as Engineering Quest's Notebook.
// Misses from the daily pages become cards (../wr-notebook.js). Today's page: fix up to 3 due cards (the one you
// missed, three like it, one twist); nothing due → a 5-question check-up from your own old mistakes. A week strip
// and a streak count every day with a fix or a check-up.
import * as N from '../wr-notebook.js?v=nb-2';
import {buildFix, cousin, whereOf} from './sources.js?v=nb-2';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=3';

const app = document.querySelector('#app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);
const TODAY = () => N.dayKey();
const P = N.activePlayer(), SKEY = `wr-notebook-settings.${P.id}`;
let B = N.load(P.id);
const persist = () => N.save(P.id, B);
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const SET = { read: true, ...(read(SKEY) || {}) };
const SEED = B.seed ||= Math.floor(Math.random() * 1e9);
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }

// ---------- voice ----------
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); if (!el) return; el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 3500); }
function say(t, force){ if (!t || (!force && !SET.read)) return; const why = voiceBlocked(); if (why) { if (force) flash(why); return; } speak(t.replace(/[«»]/g, '')); }
const SPK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
const MUTE = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="m23 9-6 6"/><path d="m17 9 6 6"/></svg>';
const hear = (t, label = 'Hear it') => `<button class="hear-btn" data-act="say" data-text="${esc(t)}" aria-label="${esc(label)}">${SPK}</button>`;

// ---------- runs ----------
// RUN = { mode: 'fix'|'checkup', card?, qs, i, results, q: {picked, tries, done, revealed, hidden}, chain }
let RUN = null, V = { screen: 'home' };
async function startFix(card, chain){
 const qs = await buildFix(card, SEED);
 if (!qs || !qs.length) { card.clearedAt = Date.now(); card.gone = true; persist(); flash('That question is no longer in the game, so the card was put away.'); render(); return; }
 RUN = { mode: 'fix', card, qs, i: 0, results: [], chain: !!chain }; enter();
}
async function startCheckup(){
 const today = TODAY(), healing = B.cards.filter(c => !c.clearedAt && c.due > today).sort((a, b) => b.lastAt - a.lastAt), cleared = B.cards.filter(c => c.clearedAt && !c.gone).sort((a, b) => b.clearedAt - a.clearedAt);
 const pick = [...healing.slice(0, 2), ...cleared.slice(0, 2), ...healing.slice(2), ...cleared.slice(2)], qs = [], seen = new Set();
 for (let round = 0; round < 3 && qs.length < N.CHECKUP_SIZE; round++) for (const c of pick) { if (qs.length >= N.CHECKUP_SIZE) break; const q = await cousin(c, `${SEED}:${today}`, round); const k = q && q.prompt + q.lead?.text; if (q && !seen.has(k)) { seen.add(k); qs.push(q); } }
 if (!qs.length) { flash('Nothing to check yet.'); return; }
 RUN = { mode: 'checkup', qs, i: 0, results: [], misses: 0 }; enter();
}
function enter(){ const q = RUN.qs[RUN.i]; RUN.q = { picked: null, sel: new Set(), seq: [], typed: '', tries: 0, done: false, first: null, hidden: !!q.lead?.hide, reading: !!q.lead?.hide, looks: 0 }; V = { screen: 'run' }; render(); speakScreen(); window.scrollTo(0, 0); }
function onPick(pos){ const q = RUN.qs[RUN.i]; if (RUN.q.done) return; RUN.q.picked = pos; answer(pos === q.right, optText(q, pos)); }
/** Tap questions: the tapped words must be exactly the answer words. Spell questions: exactly the word. */
function onCheck(){
 const q = RUN.qs[RUN.i], Q = RUN.q; if (Q.done) return;
 if (q.type === 'order') { if (!Q.seq.length) return; Q.picked = 0; const ok = Q.seq.length === q.answer.length && Q.seq.every((v, i) => v === q.answer[i]); answer(ok, Q.seq.map(i => q.tokens[i]).join(' ')); return; }
 if (q.type === 'tap') { const a = [...q.answer].sort((x, y) => x - y), b = [...Q.sel].sort((x, y) => x - y); if (!b.length) return; Q.picked = 0; answer(a.length === b.length && a.every((v, i) => v === b[i]), b.map(i => q.tokens[i]).join(' ')); return; }
 const typed = (document.querySelector('#spell')?.value || '').trim(); if (!typed) return; Q.typed = typed; Q.picked = 0;
 const norm = x => x.toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, '');
 answer(norm(typed) === norm(q.word), typed);
}
function answer(ok, given){
 const Q = RUN.q, q = RUN.qs[RUN.i]; Q.tries++;
 if (Q.first === null) { Q.first = ok; RUN.results.push(ok); if (!ok && RUN.mode === 'checkup') { RUN.misses++; N.addMiss(B, { ...q.meta, prompt: q.prompt, given, right: rightText(q) }); persist(); } }
 if (ok) { Q.done = true; render(); say(Q.tries === 1 ? 'Yes!' : 'That’s it.'); return; }
 if (Q.tries >= 2) { Q.done = true; Q.shown = true; render(); say(`The answer is ${rightText(q)}. ${q.explain || ''}`); return; }
 if (q.type === 'tap') Q.sel = new Set();
 if (q.type === 'order') Q.seq = [];
 render(); say(`Not yet. ${N.ERRORS[RUN.card?.kind || 'unknown'].advice} Try again.`);
}
const optText = (q, i) => q.opts[i]?.x ?? `picture ${i + 1}`;
const rightText = q => q.type === 'tap' || q.type === 'order' ? q.answer.map(i => q.tokens[i]).join(' ') : q.type === 'spell' ? q.word : optText(q, q.right);
function next(){
 RUN.i++;
 if (RUN.i < RUN.qs.length) { enter(); return; }
 if (RUN.mode === 'fix') { const out = N.applyFix(B, RUN.card.id, RUN.results); persist(); addXp(out.clean ? 6 : 3); V = { screen: 'fixed', out, card: RUN.card, results: RUN.results.slice(), chain: RUN.chain }; }
 else { N.applyCheckup(B); persist(); addXp(5); V = { screen: 'checked', right: RUN.results.filter(Boolean).length, n: RUN.results.length, misses: RUN.misses }; }
 RUN = null; render(); window.scrollTo(0, 0);
 if (V.screen === 'fixed') say(V.out.cleared ? 'Card cleared! You fixed it three times.' : V.out.clean ? 'Clean fix!' : 'Good try. This card comes back tomorrow.');
 else say(`Check-up done. ${V.right} of ${V.n} right.`);
}

// ---------- screens ----------
const fmtDay = k => { const t = TODAY(); if (k <= t) return 'today'; if (k === N.addDays(t, 1)) return 'tomorrow'; const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d, 12).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); };
function bar(title){ const inside = !!RUN; return `<header class="bar"><a href="${inside ? '#' : '../#/home'}" data-act="${inside ? 'home' : ''}" class="back">${inside ? '← Notebook' : '← WordRaiders'}</a><span class="title">${esc(title)}</span><button class="readto" data-act="readto" aria-pressed="${SET.read}" aria-label="Read to me">${SET.read ? SPK : MUTE}</button></header>`; }
const dotsOf = c => `<span class="cleandots" aria-label="${c.clean} of ${N.CLEAN_TO_CLEAR} clean fixes">${Array.from({ length: N.CLEAN_TO_CLEAR }, (_, i) => `<i class="${i < c.clean ? 'on' : ''}"></i>`).join('')}</span>`;
function cardHTML(c, today){
 const due = !c.clearedAt && c.due <= today, E = N.ERRORS[c.kind] || N.ERRORS.unknown;
 return `<li class="nbcard ${due ? 'due' : ''} ${c.clearedAt ? 'cleared' : ''}"><div class="nbhead"><span class="where">${esc(whereOf(c))}</span>${dotsOf(c)}</div>
 ${c.prompt ? `<p class="nbq">${esc(c.prompt)}</p>` : ''}
 <p class="nbans">${c.given ? `You chose: <s>${esc(c.given)}</s>` : ''}${c.right ? ` · Right: <b>${esc(c.right)}</b>` : ''}</p>
 <p class="nbkind"><span class="chip">${esc(E.label)}</span> ${esc(E.advice)}</p>
 <div class="nbfoot">${c.clearedAt ? `<span class="small muted">✅ Cleared${c.lapses ? ` after ${c.lapses} slip${c.lapses > 1 ? 's' : ''}` : ''}</span>` : due ? `<button class="primary" data-act="fix" data-id="${c.id}">Fix it ▸</button>` : `<span class="small muted">Next fix: ${esc(fmtDay(c.due))}</span>`}${c.lapses && !c.clearedAt ? `<span class="small muted"> · missed ${c.lapses + 1}×</span>` : ''}</div></li>`;
}
function errorBookCount(){ const s = read(`wordraiders.save.${P.id}`); return Object.values(s?.errorBook || {}).filter(e => e && !e.resolvedAt).length; }
function homeView(){
 const today = TODAY(), pg = N.page(B, today), open = N.activeCards(B), due = open.filter(c => c.due <= today), later = open.filter(c => c.due > today), cleared = B.cards.filter(c => c.clearedAt && !c.gone).sort((a, b) => b.clearedAt - a.clearedAt).slice(0, 8);
 const wk = `<div class="week" aria-label="This week">${pg.week.map(d => `<span class="${d.done ? 'on' : ''} ${d.today ? 'now' : ''}"><b>${d.label}</b><i>${d.done ? '✓' : ''}</i></span>`).join('')}</div>`;
 let top;
 if (pg.mode === 'empty') top = `<h1>Your notebook is empty.</h1><p class="lead">When you miss a question in the daily tasks or the Arcades, it lands here as a card. Fixing a card three times, spaced out over a week, clears it.</p>`;
 else if (pg.mode === 'fix') top = `<h1>Today’s page: fix ${pg.target - pg.fixed} card${pg.target - pg.fixed > 1 ? 's' : ''}.</h1><p class="lead">Each fix is the one you missed, three like it, and one twist. ${pg.fixed ? `${pg.fixed} done today.` : ''}</p><button class="primary big" data-act="go">▶ Fix the next card</button>`;
 else if (pg.mode === 'checkup') top = `<h1>Nothing to fix today!</h1><p class="lead">Do a quick check-up: ${N.CHECKUP_SIZE} questions like your old mistakes. Do they still hold?</p><button class="primary big" data-act="checkup">▶ Start the check-up</button>`;
 else top = `<h1>Today’s page is done! 🎉</h1><p class="lead">${pg.fixed ? `${pg.fixed} fix${pg.fixed > 1 ? 'es' : ''}` : 'Check-up'} done today.${due.length ? ' Extra fixes are welcome, but not needed.' : ''}</p><div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a></div>`;
 const eb = errorBookCount();
 return bar('My Notebook') + `<main><p class="eyebrow">MY NOTEBOOK · ${pg.streak ? `${pg.streak}-DAY STREAK` : 'START A STREAK TODAY'}</p>${top}${wk}
 ${due.length ? `<h2 class="sec">To fix today · ${due.length}</h2><ul class="nblist">${due.map(c => cardHTML(c, today)).join('')}</ul>` : ''}
 ${later.length ? `<h2 class="sec">Healing · ${later.length}</h2><p class="small muted">A clean fix sends a card away for 3 days, then 7 days. The third clean fix clears it.</p><ul class="nblist">${later.map(c => cardHTML(c, today)).join('')}</ul>` : ''}
 ${cleared.length ? `<details class="about"><summary>Cleared cards · ${B.cards.filter(c => c.clearedAt && !c.gone).length}</summary><ul class="nblist">${cleared.map(c => cardHTML(c, today)).join('')}</ul></details>` : ''}
 ${eb ? `<p class="tip">The main game’s Error Book also has ${eb} topic${eb > 1 ? 's' : ''} to repair. <a href="../#progress">Open Progress ▸</a></p>` : ''}
 <details class="about"><summary>For grown-ups</summary>
  <p>This is a wrong-answer notebook (错题本), the same habit as Engineering Quest’s Notebook. Every first-try miss in Little Words, Daily Symbols, Daily Comprehension, Grade Journey practice, and every wrong answer in the Arcades (Word Arcade, Sentence Arcade and its grammar skills, Spelling Arcade and Spelling lessons, Common Word Arcade) becomes a card showing the question, what your child chose, the right answer and the kind of mistake (look-alike mix-up, meaning, missed detail, forgot after hiding, fact or guess, big idea, wrong mark, sentence part, grammar, word form, spelling). Arcade cards are saved with questions of the same kind (the same word part, sentence part, grammar skill or spelling pattern), so fixes use the arcade’s own questions.</p>
  <p>A fix is the original question, three of the same kind (the same word or mark in new sentences, the same question type on another text) and one twist that changes the kind. It is clean when the original and the three are right the first time. Clean fixes are spaced: today, then 3 days, then 7 days; the third clears the card. An unclean fix brings the card back tomorrow, and missing the same question again counts as a slip on the same card. Home asks for up to 3 fixes a day; with nothing due it offers a 5-question check-up, and a check-up miss becomes a new card. Grade Journey unit checks and placement are never added, so those texts stay new.</p>
  <label class="tog"><input type="checkbox" data-act="read-box" ${SET.read ? 'checked' : ''}> Read questions aloud</label>
 </details></main>`;
}
function leadHTML(q){
 const Q = RUN.q, L = q.lead; if (!L) return q.pic ? `<div class="figpic">${q.pic}</div>` : '';
 if (Q.hidden && !Q.reading) return `<div class="hidden-box"><span>Text hidden</span></div>${Q.first === null ? `<button class="btn wide" data-act="reveal">Show again (${Q.looks})</button>` : ''}`;
 const body = esc(L.text).replace(/«([^»]*)»/g, '<mark>$1</mark>');
 return `<article class="passage">${L.title ? `<h2 class="ptitle">${esc(L.title)}</h2>` : ''}<div class="ptext ${L.text.length < 120 ? 'one' : ''}">${body}</div></article>${q.pic ? `<div class="figpic">${q.pic}</div>` : ''}`;
}
function optsHTML(q){
 const Q = RUN.q, cls = pos => { if (Q.picked === null) return ''; if (pos === q.right && Q.done) return 'right'; if (pos === Q.picked && pos !== q.right) return 'wrong'; return ''; };
 const tag = pos => cls(pos) === 'right' ? '✓' : cls(pos) === 'wrong' ? '✗' : '', pics = q.opts.some(o => o.pic);
 return `<div class="opts ${pics ? 'pics' : ''}">${q.opts.map((o, pos) => `<button class="opt ${o.pic ? 'pic-opt' : ''} ${cls(pos)}" data-act="pick" data-pos="${pos}" ${Q.done ? 'disabled' : ''} ${o.pic ? `aria-label="Picture ${pos + 1}"` : ''}><span class="tag">${tag(pos) || (o.pic ? pos + 1 : '')}</span>${o.pic ? o.pic : esc(o.x)}</button>`).join('')}</div>`;
}
function stepName(){ if (RUN.mode === 'checkup') return `CHECK-UP · ${RUN.i + 1} OF ${RUN.qs.length}`; const n = RUN.qs.length; return RUN.i === 0 ? 'THE ONE YOU MISSED' : RUN.i === n - 1 && n > 2 ? 'THE TWIST' : `ONE LIKE IT · ${RUN.i} OF ${n - 2}`; }
function runView(){
 const q = RUN.qs[RUN.i], Q = RUN.q, n = RUN.qs.length;
 const dots = `<div class="steps" aria-label="Question ${RUN.i + 1} of ${n}">${RUN.qs.map((_, i) => `<span class="${i < RUN.i ? (RUN.results[i] ? 'done' : 'miss') : i === RUN.i ? 'now' : ''}"></span>`).join('')}</div>`;
 const head = `<p class="eyebrow">${stepName()}</p>${RUN.mode === 'fix' && RUN.i === 0 ? `<p class="small muted">Last time you ${RUN.card.skill === 'spell' ? 'wrote' : 'chose'} “${esc(RUN.card.given)}”. ${esc(N.ERRORS[RUN.card.kind]?.advice || '')}</p>` : ''}`;
 if (Q.reading) return bar('Read it') + `<main class="round">${dots}<section class="card">${head}${leadHTML(q)}<p class="small muted">Read it, then it hides and you answer from memory.</p><button class="primary big" data-act="hide">I read it ▸</button></section></main>`;
 const fb = Q.done ? `<p class="fb ${Q.shown ? 'try' : 'ok'}">${Q.tries === 1 ? 'Yes! ' : Q.shown ? (q.type === 'spell' ? `It’s spelled ${esc(q.word)}. ` : q.type === 'tap' ? 'The green words are right. ' : q.type === 'order' ? 'Here is the right order. ' : 'The green one is right. ') : 'That’s it. '}${esc(q.explain)}</p><button class="primary big" data-act="next">${RUN.i + 1 < n ? 'Next ▸' : 'Finish ▸'}</button>`
  : Q.picked !== null ? `<p class="fb try">Not yet. Look again and try once more.</p>` : '';
 return bar(RUN.mode === 'fix' ? 'Fix it' : 'Check-up') + `<main class="round">${dots}<section class="card">${head}${leadHTML(q)}<p class="q">${esc(q.prompt)} ${hear(q.say, q.type === 'spell' ? 'Hear the word' : 'Hear the question')}</p>${q.type === 'tap' ? tapHTML(q) : q.type === 'order' ? orderHTML(q) : q.type === 'spell' ? spellHTML(q) : optsHTML(q)}${fb}</section></main>`;
}
function tapHTML(q){
 const Q = RUN.q, show = Q.done;
 return `<div class="taps">${q.tokens.map((t, i) => `<button class="tapw ${Q.sel.has(i) ? 'on' : ''} ${show && q.answer.includes(i) ? 'key' : ''}" data-act="tap" data-i="${i}" ${Q.done ? 'disabled' : ''}>${esc(t)}</button>`).join('')}</div>
 ${Q.done ? '' : `<button class="primary big" data-act="check" ${Q.sel.size ? '' : 'disabled'}>Check</button>`}`;
}
function orderHTML(q){
 const Q = RUN.q, built = Q.done ? q.answer : Q.seq;
 return `<div class="built">${built.length ? built.map(i => `<span>${esc(q.tokens[i])}</span>`).join(' ') : '<em>Tap the words in order</em>'}</div>
 <div class="taps">${q.tokens.map((t, i) => `<button class="tapw ${built.includes(i) ? 'used' : ''}" data-act="order" data-i="${i}" ${Q.done || built.includes(i) ? 'disabled' : ''}>${esc(t)}</button>`).join('')}</div>
 ${Q.done ? '' : `<div class="row"><button class="btn" data-act="undo" ${Q.seq.length ? '' : 'disabled'}>↶ Undo</button><button class="primary big" data-act="check" ${Q.seq.length === q.tokens.length ? '' : 'disabled'}>Check</button></div>`}`;
}
function spellHTML(q){
 const Q = RUN.q;
 return `${q.meaning ? `<p class="small muted">It means: ${esc(q.meaning)}</p>` : ''}${Q.done ? `<p class="spelled">${esc(q.word)}</p>` : `<input id="spell" class="spellin" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" inputmode="text" aria-label="Type the word" value="${esc(Q.typed)}"><button class="primary big" data-act="check">Check</button>`}`;
}
function fixedView(){
 const { out, card, chain } = V, pg = N.page(B), more = pg.mode === 'fix';
 const msg = out.cleared ? `<h1>Card cleared!</h1><p class="lead">Three clean fixes. “${esc(card.label)}” is yours now.</p>` : out.clean ? `<h1>Clean fix!</h1><p class="lead">${card.clean} of ${N.CLEAN_TO_CLEAR}. This card comes back ${esc(fmtDay(out.due))} to make sure it stays.</p>` : `<h1>Good try.</h1><p class="lead">The one you missed and the three like it all need to be right the first time. This card comes back tomorrow.</p>`;
 return bar('Fixed') + `<main class="round"><section class="card result"><div class="burst">${out.cleared ? '🏆' : out.clean ? '✨' : '📒'}</div>${msg}
 <ul class="skills">${V.results.map((r, i) => `<li>${r ? '✅' : '🌱'} ${i === 0 ? 'The one you missed' : i === V.results.length - 1 && V.results.length > 2 ? 'The twist' : `One like it (${i})`}</li>`).join('')}</ul>
 <p class="small muted">Today’s page: ${Math.min(pg.fixed, pg.target)} of ${pg.target} fixes${pg.done ? ' · done ✓' : ''}</p>
 <div class="row center">${more ? `<button class="primary" data-act="go" data-chain="${chain ? 1 : 0}">Next card ▸</button>` : `<a class="primary" href="../?today=next#/home">Next task ▸</a>`}<button class="btn" data-act="tohome">My Notebook</button></div></section></main>`;
}
function checkedView(){
 return bar('Check-up') + `<main class="round"><section class="card result"><div class="burst">${V.misses ? '📒' : '🎉'}</div><h1>${V.right} of ${V.n} right</h1><p class="lead">${V.misses ? `${V.misses} new card${V.misses > 1 ? 's' : ''} in your notebook. You’ll fix ${V.misses > 1 ? 'them' : 'it'} tomorrow.` : 'Your old mistakes are holding. Great work!'}</p>
 <div class="row center"><a class="primary" href="../?today=next#/home">Next task ▸</a><button class="btn" data-act="tohome">My Notebook</button></div></section></main>`;
}
function render(){ app.innerHTML = RUN ? runView() : V.screen === 'fixed' ? fixedView() : V.screen === 'checked' ? checkedView() : homeView(); setToday(); const sp = document.querySelector('#spell'); if (sp) { sp.focus(); sp.select(); } }
function setToday(){ const pg = N.page(B); B.today = { date: TODAY(), label: pg.done ? 'done' : pg.mode === 'fix' ? `${pg.target - pg.fixed} to fix` : pg.mode === 'checkup' ? 'check-up' : '' }; persist(); }
function speakScreen(){ const q = RUN?.qs[RUN.i]; if (!q || RUN.q.reading) { if (q?.lead) say(q.lead.text); return; } say(q.say); }

// ---------- events ----------
app.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'spell') { e.preventDefault(); onCheck(); } });
app.addEventListener('change', e => { if (e.target.dataset.act === 'read-box') { SET.read = e.target.checked; try { localStorage.setItem(SKEY, JSON.stringify(SET)); } catch {} } });
app.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled || b.tagName === 'INPUT') return; const a = b.dataset.act;
 if (a === 'say') { say(b.dataset.text, true); return; }
 if (a === 'readto') { SET.read = !SET.read; try { localStorage.setItem(SKEY, JSON.stringify(SET)); } catch {} if (!SET.read) speechSynthesis?.cancel?.(); render(); return; }
 if (a === 'home') { e.preventDefault(); RUN = null; V = { screen: 'home' }; render(); return; }
 if (a === 'tohome') { V = { screen: 'home' }; render(); return; }
 if (a === 'go') { const c = N.dueCards(B)[0]; if (c) startFix(c, true); return; }
 if (a === 'fix') { const c = B.cards.find(x => x.id === b.dataset.id); if (c) startFix(c, false); return; }
 if (a === 'checkup') { startCheckup(); return; }
 if (!RUN) return;
 if (a === 'pick') { onPick(+b.dataset.pos); return; }
 if (a === 'tap') { const i = +b.dataset.i; RUN.q.sel.has(i) ? RUN.q.sel.delete(i) : RUN.q.sel.add(i); render(); return; }
 if (a === 'check') { onCheck(); return; }
 if (a === 'order') { RUN.q.seq.push(+b.dataset.i); render(); return; }
 if (a === 'undo') { RUN.q.seq.pop(); render(); return; }
 if (a === 'next') { next(); return; }
 if (a === 'hide') { RUN.q.reading = false; render(); speakScreen(); return; }
 if (a === 'reveal') { RUN.q.looks++; RUN.q.reading = true; render(); return; }
});
if (QS.has('test')) window.__nb = { B: () => B, RUN: () => RUN, N, reload(){ B = N.load(P.id); render(); } };
render();
if (QS.has('today')) { const pg = N.page(B); if (pg.mode === 'fix') startFix(pg.due[0], true); else if (pg.mode === 'checkup') startCheckup(); }
