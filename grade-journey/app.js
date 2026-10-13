// Grade Journey: a grade layer on top of WordRaiders (handoff "Grade Journey 1–12" v2). Grade 1 is built:
// optional grade choice (or Skip → placement check → or Grade 1), 8 units fed by the existing modules, decodable
// passages with shuffled 3-choice questions, a grown-up-scored 1-minute oral reading, optional writing, the Grade 1
// gate + certificate, and a grown-up dashboard. Everything stays on this device.
import {GRADE1, PASSAGES} from './content.js?v=gj-1';
import * as E from './engine.js?v=gj-1';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=3';

const app = document.querySelector('#app');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);
const TODAY = () => E.dayKey();
const UNITS = GRADE1.units, PBY = Object.fromEntries(PASSAGES.map(p => [p.id, p]));
const pool = name => PASSAGES.filter(p => p.pool === name).sort((a, b) => a.id.localeCompare(b.id));

// ---------- player + saves ----------
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
function player(){ const r = read('wordraiders.players.v1'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Reader' }; }
const P = player(), KEY = `wr-grade.${P.id}`;
let S = { ...E.fresh(), ...(read(KEY) || {}) };
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const SC = () => read(`wr-soundcode.${P.id}`);
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }

// ---------- voice ----------
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); if (!el) return; el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 3500); }
function say(t, force){ if (!t) return; const why = voiceBlocked(); if (why) { if (force) flash(why); return; } speak(t); }
const hear = (t, label = 'Hear it') => `<button class="hear-btn" data-act="say" data-text="${esc(t)}" aria-label="${esc(label)}">🔊</button>`;

// ---------- view state ----------
let V = { screen: 'home' };   // screens: pick, pick-check, skip-check, place, placed, home, read, result, oral, writing, dash, cert
let RUN = null;               // a passage being read
const G = () => S.placedGrade || 1;
function go(screen, extra = {}){ V = { screen, ...extra }; render(); window.scrollTo(0, 0); }

// ---------- reading a passage (units, placement, challenge) ----------
function startPassage(p, kind, ctx){
 const listen = p.pool === 'listening' || p.pool === 'placement-listen';
 RUN = { p, kind, ctx, listen, qi: 0, answers: [], tts: false, seenBefore: !!S.seen[p.id], startedAt: Date.now(), q: null, showText: !listen };
 if (!p.questions.length) { go('read'); return; }
 makeQ(); go('read');
 if (listen) say(`${p.title}. ${p.text}`);
}
function makeQ(){
 const q = RUN.p.questions[RUN.qi], n = S.events.filter(e => e.itemId === `${RUN.p.id}-q${RUN.qi + 1}`).length;
 const rng = E.seeded(`${S.seed}:${RUN.p.id}:${RUN.qi}:${n}`);
 RUN.q = { q, order: E.shuffle([0, 1, 2], rng), picked: null, first: null, done: false, retry: false };
}
function onPick(pos){
 const Q = RUN.q; if (Q.done) return;
 const chosen = Q.order[pos], right = chosen === Q.q.answer;
 if (Q.first === null) { Q.first = right; RUN.answers.push({ correct: right, firstTry: true, shownOrder: Q.order, pos: Q.order.indexOf(Q.q.answer) }); }
 Q.picked = pos;
 if (right) { Q.done = true; render(); say(Q.first ? 'Yes!' : 'That’s it.'); return; }
 Q.retry = true; render(); say('Not quite. Look at the story again. Tap the green one.');
}
function nextQ(){
 if (RUN.qi < RUN.p.questions.length - 1) { RUN.qi++; makeQ(); render(); readQ(); return; }
 finishPassage();
}
function readQ(){ const q = RUN.q.q; say(`${q.q} ${RUN.q.order.map(i => q.options[i]).join('? ')}?`); }
function minutes(ms){ const d = TODAY(); S.days[d] ||= { done: false, minutes: 0 }; S.days[d].minutes = +(S.days[d].minutes + ms / 60000).toFixed(1); }
function finishPassage(){
 const { p, kind, ctx } = RUN; minutes(Date.now() - RUN.startedAt);
 if (kind === 'place') { placeAnswered(p, RUN.answers, RUN.tts); return; }
 const u = UNITS.find(x => x.id === ctx.unit);
 const res = E.recordPassage(S, G(), u, p, kind === 'challenge' ? 'challenge' : kind, RUN.answers, { ttsUsed: RUN.tts, seenBefore: RUN.seenBefore });
 if (kind === 'challenge') { V.challenge.results.push(res); persist(); if (V.challenge.results.length < V.challenge.list.length) { const nx = V.challenge.list[V.challenge.results.length]; const keep = V.challenge; startPassage(nx.p, 'challenge', { unit: nx.u }); V.challenge = keep; return; } const passed = E.challengeResult(S, G(), UNITS, V.challenge.results); dayDone(); persist(); go('result', { res, challenge: passed ? 'passed' : 'failed' }); return; }
 dayDone(); E.issueCertificate(S, G(), UNITS, SC()); persist(); addXp(5 + res.right);
 go('result', { res, kind, unit: u.id });
}
function dayDone(){ const d = TODAY(); S.days[d] ||= { done: false, minutes: 0 }; if (!S.days[d].done) { S.days[d].done = true; if (S.placementSkippedAt && !S.placement.length) S.sessionsSinceSkip++; } setTodayLabel(); }

// ---------- placement check ----------
const MAXPLACE = 2;
function startPlacement(start){
 S.activePlacement = { at: TODAY(), start, g: start, step: 'words-intro', marks: [], word: null, grades: {}, listened: false, done: [], listen: null, oral: null };
 persist(); go('place');
}
function placeQueue(g){ const A = S.activePlacement, at = g === 1 ? pool('placement-g1') : pool('placement-g2'), below = g === 1 ? pool('placement-k') : pool('placement-g1');
 const used = new Set(Object.values(A.grades).flatMap(x => x.passages)); const pick = (xs, n) => xs.filter(p => !used.has(p.id) && !S.hidden[p.id]).slice(0, n);
 return [...pick(below, A.grades[g - 1] ? 0 : 1).map(p => ({ p, below: true })), ...pick(at, 2).map(p => ({ p, below: false }))]; }
function placeNextPassage(){
 const A = S.activePlacement, g = A.g; A.grades[g] ||= { passages: [], right: 0, n: 0, belowRight: 0, belowN: 0, queue: placeQueue(g).map(x => ({ id: x.p.id, below: x.below })) };
 const item = A.grades[g].queue.find(x => !A.grades[g].passages.includes(x.id));
 if (!item) return placeDecide();
 persist(); startPassage(PBY[item.id], 'place', { below: item.below });
}
function placeAnswered(p, answers, tts){
 const A = S.activePlacement, R = A.grades[A.g], right = answers.filter(a => a.correct && a.firstTry).length;
 R.passages.push(p.id); if (tts) A.listened = true; S.seen[p.id] ||= TODAY();
 if (p.pool === 'placement-listen') { A.listen = { pid: p.id, pct: right / answers.length }; A.step = 'oral-ask'; persist(); go('place'); return; }
 const item = R.queue.find(x => x.id === p.id);
 if (item?.below) { R.belowRight += right; R.belowN += answers.length; } else { R.right += right; R.n += answers.length; }
 persist(); placeNextPassage();
}
function placeDecide(){
 const A = S.activePlacement, R = A.grades[A.g], comp = R.n ? R.right / R.n : 0, word = A.word ? E.wordPct(GRADE1.words, A.marks, A.g) : null;
 R.comp = comp; R.word = word;
 const st = E.placementStep(A.g, word, comp, A.start, MAXPLACE);
 if (st.passed) A.done.push(st.passed);
 if (st.next && !A.grades[st.next]) { A.g = st.next; persist(); placeNextPassage(); return; }
 A.result = Math.max(1, ...A.done, st.next && st.down ? st.next : 1);
 A.step = 'listen'; persist();
 const lp = pool('placement-listen').find(p => !S.seen[p.id] && !S.hidden[p.id]) || pool('placement-listen')[0];
 if (lp) startPassage(lp, 'place', { listen: true }); else { A.step = 'oral-ask'; go('place'); }
}
function finishPlacement(accept = true){
 const A = S.activePlacement, g = A.result || 1, R = A.grades[g] || {};
 const rec = { at: A.at, grade: g, wordReading: A.word === false ? null : { correct: A.marks.filter(Boolean).length, of: GRADE1.words.length, ceilingItem: GRADE1.words[A.marks.length - 1]?.w || null },
  comprehension: { pct: Math.round((R.comp ?? 0) * 100), passages: Object.values(A.grades).flatMap(x => x.passages), ttsUsed: A.listened }, listened: A.listened,
  listening: A.listen ? { pct: Math.round(A.listen.pct * 100) } : null, orf: A.oral, recommendation: g, accepted: accept, tested: Object.fromEntries(Object.entries(A.grades).map(([k, x]) => [k, { comp: x.comp != null ? Math.round(x.comp * 100) : null, word: x.word != null ? Math.round(x.word * 100) : null }])) };
 S.placement.push(rec);
 if (accept) { if (S.chosenGrade == null) S.chosenBy = 'auto'; E.setGrade(S, g, { by: 'placement-check', why: S.chosenGrade && S.chosenGrade !== g ? `placement check (chosen ${S.chosenGrade})` : 'auto-placement', placedBy: 'placement-check' }); }
 S.activePlacement = null; dayDone(); persist();
}

// ---------- oral reading (grown-up taps misreads) ----------
function startOral(p, ctx){ RUN = null; V = { screen: 'oral', p, ctx, phase: 'intro', errs: new Set(), last: null, t0: 0, left: 60 }; render(); }
let oralTimer = 0;
function oralStart(){ V.phase = 'run'; V.t0 = Date.now(); render(); clearInterval(oralTimer); oralTimer = setInterval(() => { V.left = Math.max(0, 60 - Math.floor((Date.now() - V.t0) / 1000)); const el = document.querySelector('.timer'); if (el) el.textContent = `${V.left}s`; if (V.left <= 0) { clearInterval(oralTimer); V.phase = 'last'; V.secs = 60; render(); } }, 250); }
function oralFinish(lastIdx){
 const words = V.p.text.split(/\s+/), read = lastIdx + 1, errors = [...V.errs].filter(i => i <= lastIdx).length, secs = V.secs || Math.max(5, Math.round((Date.now() - V.t0) / 1000));
 const rec = E.recordOral(S, G(), V.p, { wordsRead: read, errors, seconds: secs });
 if (V.ctx === 'place') { S.activePlacement.oral = { wcpm: rec.wcpm, accuracy: rec.accuracy, scoredBy: 'parent', pid: V.p.id }; S.activePlacement.step = 'result'; persist(); go('place'); return; }
 E.issueCertificate(S, G(), UNITS, SC()); dayDone(); persist(); go('oral', { p: V.p, phase: 'done', rec, words });
}

// ---------- screens ----------
function bar(title, back = 'home'){ const top = V.screen === 'home' || V.screen === 'pick'; return `<header class="bar"><a href="${top ? '../#/home' : '#'}" data-act="${top ? '' : 'nav'}" data-to="${back}" class="back">${top ? '← WordRaiders' : '← Grade Journey'}</a><span class="title">${esc(title)}</span><span class="count">${esc(P.name)}</span></header>`; }
function pickView(){
 return bar('Grade Journey') + `<main><p class="eyebrow">GRADE JOURNEY</p><h1>Which grade are you in? ${hear('Which grade are you in? You can skip this.')}</h1><p class="lead">You can skip this.</p>
 <div class="grades">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => `<button class="gbtn" data-act="pick" data-g="${g}">${g}</button>`).join('')}</div>
 <button class="primary big" data-act="skip">Skip, find my level for me</button>
 <p class="small muted">A grown-up can answer too. You can change the grade any time in the grown-up page.</p></main>`;
}
function pickCheckView(){
 const g = V.g;
 return bar(`Grade ${g}`, 'pick') + `<main><p class="eyebrow">GRADE ${g} ✓</p><h1>Want a quick check to make sure it’s the right start?</h1><p class="lead">About 10 minutes: read some words, then short stories.${g > MAXPLACE ? ` (The check goes up to Grade ${MAXPLACE} for now.)` : ''}</p>
 <div class="who"><span>Who chose the grade?</span><label><input type="radio" name="by" value="player" checked> I did</label><label><input type="radio" name="by" value="parent"> A grown-up</label></div>
 <button class="primary big" data-act="check-chosen">Check my starting point</button><button class="btn wide" data-act="not-now">Not now, start Grade ${g}</button></main>`;
}
function skipCheckView(){
 return bar('Find your level', 'pick') + `<main><p class="eyebrow">LET’S FIND YOUR LEVEL!</p><h1>Read some words, then a short story. ${hear('Let’s find your level! Read some words, then a short story.')}</h1><p class="lead">About 10 minutes. You can stop halfway and finish later.</p>
 <button class="primary big" data-act="check-skip">Start the check</button><button class="btn wide" data-act="skip-all">Skip, start at Grade 1</button><p class="small muted">You can do the check later in the grown-up page.</p></main>`;
}
function placeView(){
 const A = S.activePlacement; if (!A) return homeView();
 if (A.step === 'words-intro') return bar('Starting check') + `<main><p class="eyebrow">PART 1 · WORDS</p><h1>Grown-up: listen while your child reads each word.</h1><p class="lead">Tap ✓ if they read it right, ✗ if not. It stops after 4 misses in a row. Don’t help: this shows where to start.</p>
  <button class="primary big" data-act="words-go">Start the words</button><button class="btn wide" data-act="words-skip">No grown-up here: skip the words for now</button></main>`;
 if (A.step === 'words') { const i = A.marks.length, w = GRADE1.words[i]; return bar('Starting check') + `<main class="round"><section class="card center"><p class="eyebrow">WORD ${i + 1} OF ${GRADE1.words.length}</p><div class="bigword">${esc(w.w)}</div><p class="small muted">Child reads it out loud. (No sound here on purpose.)</p>
  <div class="row center"><button class="primary" data-act="mark" data-v="1">✓ Read it</button><button class="btn" data-act="mark" data-v="0">✗ Not yet</button></div></section></main>`; }
 if (A.step === 'comp-intro') return bar('Starting check') + `<main><p class="eyebrow">PART 2 · STORIES</p><h1>Now read some short stories.</h1><p class="lead">Read each story by yourself, then answer the questions. The 🔊 on a question reads the question. Try to read the story without “Read it to me”.</p><button class="primary big" data-act="comp-go">Start reading</button></main>`;
 if (A.step === 'oral-ask') return bar('Starting check') + `<main><p class="eyebrow">PART 3 · READ ALOUD (GROWN-UP)</p><h1>One minute of reading aloud?</h1><p class="lead">Your child reads a short story out loud for 1 minute while you tap any words they misread. It gives a speed and accuracy number, for information. If now isn’t good, do it later from the grown-up page.</p>
  <button class="primary big" data-act="oral-place">Do the 1-minute reading</button><button class="btn wide" data-act="oral-later">Later</button></main>`;
 if (A.step === 'result') { const g = A.result || 1, R = A.grades[g] || {}; return bar('Starting check') + `<main class="round"><section class="card result"><div class="burst">🎉</div><h1>You’re starting at Grade ${g}!</h1>
  <p>${A.word === false ? 'Words: skipped (no grown-up)' : `Words: ${A.marks.filter(Boolean).length}/${GRADE1.words.length}`} · Story questions: ${Math.round((R.comp ?? 0) * 100)}%${A.listen ? ` · Listening: ${Math.round(A.listen.pct * 100)}%` : ''}${A.oral ? ` · Read aloud: ${Math.round(A.oral.accuracy * 100)}% accurate, ${A.oral.wcpm} words a minute` : ''}</p>
  ${A.listened ? '<p class="small">“Read it to me” was used on a story, so this result is marked “listened”.</p>' : ''}${g > 1 ? `<p class="small muted">Grade ${g} units are still being built. Until then you’ll practise in Grade 1 and can take the Grade 1 challenge.</p>` : ''}
  <div class="row center"><button class="primary" data-act="place-accept">Let’s go</button><button class="btn" data-act="place-other">Pick a different grade</button></div></section></main>`; }
 return homeView();
}
function unitState(u){ const r = E.unitRec(S, 1, u.id); return r.status === 'passed' ? '✅ passed' : r.status === 'tested-out' ? '⏩ tested out' : r.status === 'locked' ? '🔒' : r.practiceDone ? `check ${r.passedDays.length}/2 days` : r.practice.length ? 'practising' : 'open'; }
function setTodayLabel(){
 const d = TODAY(); if (!S.placedGrade) { S.today = { date: d, label: 'pick your grade', done: false }; return; }
 const u = E.currentUnit(S, 1, UNITS); const done = !!S.days[d]?.done;
 S.today = { date: d, done, label: done ? 'done' : u ? `Grade 1 · ${u.id.slice(3).replace('U', 'Unit ')} · ${u.kid.toLowerCase()}` : 'Grade 1 · finish the gate' };
}
function homeView(){
 if (!S.placedGrade) return pickView();
 E.refreshUnits(S, 1, UNITS); setTodayLabel(); persist();
 const sc = SC(), g = G(), u = E.currentUnit(S, 1, UNITS), today = TODAY(), d = S.days[today], gate = E.gateStatus(S, 1, UNITS, sc), cert = E.gradeRec(S, 1).certificate;
 const nxt = u && E.nextPassage(S, 1, u, PASSAGES, today);
 const scMod = sc?.placed ? Number(sc.module) || 0 : -1, needSC = u?.sc != null && scMod < u.sc;
 const todayCard = !u ? `<h2>All Grade 1 units done!</h2><p class="lead">${gate.met ? 'Your Grade 1 certificate is ready.' : 'Finish the last pieces of the Grade 1 gate below.'}</p>`
  : `<p class="eyebrow">TODAY · ${esc(u.id)} · ${esc(u.title.toUpperCase())}</p><h1>${d?.done ? 'Done for today! 🎉' : esc(u.kid)}</h1><p class="lead">${esc(u.goal)}</p>
   ${needSC ? `<p class="tip">💡 These stories use Sound Code ${u.sc === 1 ? 'short vowels' : `module ${u.sc}`} spellings. ${scMod < 0 ? 'Start Sound Code' : 'Keep going in Sound Code'} too, so the words are easy to sound out. <a href="../sound-code/">Open Sound Code ▸</a></p>` : ''}
   ${E.needsReview(S, 1, u.id) ? `<p class="tip">🌱 This unit is tricky right now. Try a few stories from the unit before, then come back. <button class="linkish" data-act="review-prev">Practise the unit before</button></p>` : ''}
   ${d?.done ? `<div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a>${nxt?.p ? `<button class="btn" data-act="read-unit">Read one more</button>` : ''}</div>`
    : nxt?.p ? `<button class="primary big" data-act="read-unit">▶ ${nxt.kind === 'practice' ? (isL(u) ? 'Listen to a story' : 'Read a story') : 'Unit check (new story)'}</button>`
    : nxt?.kind === 'wait' ? `<p>Check passed today ✓. The second check day is tomorrow or later.</p>` : `<p>No new check stories left in this unit. A grown-up can unlock the next unit in the grown-up page.</p>`}
   <p class="small muted">Also good today: ${u.feeders.map(f => `<a href="${esc(f.href)}">${esc(f.name)}</a>`).join(' · ')}</p>`;
 const units = UNITS.map(x => `<li class="unit ${E.unitRec(S, 1, x.id).status}"><span class="uid">${esc(x.id.slice(3))}</span><span class="ut"><b>${esc(x.title)}</b><small>${esc(x.optional ? 'optional · ' : '')}${esc(unitState(x))}</small></span>${x.mode === 'writing' ? `<button class="btn sm" data-act="writing">Write</button>` : ''}</li>`).join('');
 const part = (k, label, extra = '') => { const p = gate.parts[k]; return `<li class="${p.ok ? 'ok' : ''}">${p.ok ? '✅' : '⬜'} ${label} <small class="muted">${p.done}/${p.of}</small>${extra}</li>`; };
 return bar('Grade Journey') + `<main><div class="ghead"><span class="gnum">${g}</span><span><b>Grade ${g}</b><small class="muted">${S.placedBy === 'placement-check' ? 'from the starting check' : S.placedBy === 'chosen' ? `chosen by ${S.chosenBy === 'parent' ? 'a grown-up' : 'you'}` : 'starting grade'}${g > 1 ? ` · Grade ${g} units are coming; practising Grade 1 for now` : ''}</small></span></div>
 ${E.offerPlacementAgain(S) ? `<p class="tip">Want to check your starting point now? <button class="linkish" data-act="check-skip">Take the starting check</button></p>` : ''}
 <section class="card">${todayCard}</section>
 <h2>Grade 1 units</h2><ol class="units">${units}</ol>
 <h2>Finish Grade 1</h2><ul class="gate">${part('units', 'Pass units 1–7 (new stories, on 2 different days)')}${part('comprehension', 'Read new stories by yourself, 80% or more, on 2 days')}${part('soundCode', 'Sound Code checks passed through module 7', ` <a href="../sound-code/">Sound Code ▸</a>`)}${part('oral', 'Read aloud to a grown-up: 95% of words right, twice', ` <button class="linkish" data-act="oral">Start ▸</button>`)}</ul>
 <p class="small muted">Writing is optional and never blocks a grade.</p>
 ${cert ? `<button class="primary big" data-act="cert">🏅 See your Grade 1 certificate</button>` : ''}
 ${!cert && g === 1 ? `<details class="about"><summary>Already a strong reader? Take the Grade 1 challenge</summary><p>Read 2 new stories by yourself (no “Read it to me”). Get 80% or more on both and the rest of the Grade 1 units are marked “tested out”. You can still practise them.</p><button class="btn" data-act="challenge">Start the challenge</button></details>` : ''}
 <button class="btn wide" data-act="dash">👪 Grown-up page</button></main>`;
}
const isL = u => u.mode === 'listening';
function passageHTML(p, { showText, listen }){
 const body = showText ? `<div class="ptext">${esc(p.text)}</div>` : `<div class="listen-box"><button class="primary" data-act="listen">▶ Listen to the story</button><button class="linkish" data-act="show-text">Show the words</button></div>`;
 return `<article class="passage"><h2 class="ptitle">${esc(p.title)}</h2>${p.caption ? `<figure class="cap"><span aria-hidden="true">🖼️</span><figcaption>${esc(p.caption)}</figcaption></figure>` : ''}${body}
 ${!listen && RUN.kind !== 'oral' ? `<button class="linkish small" data-act="tts">${RUN.tts ? '🔊 Read it to me (used)' : '🔊 Read it to me'}</button>` : ''}</article>`;
}
function readView(){
 const { p, q: Q } = RUN, n = p.questions.length;
 const label = RUN.kind === 'place' ? 'Starting check' : RUN.kind === 'challenge' ? 'Grade 1 challenge' : RUN.kind === 'check' ? 'Unit check' : 'Read a story';
 const qq = Q.q, rightPos = Q.order.indexOf(qq.answer);
 const cls = pos => { if (Q.picked === null) return ''; if (pos === rightPos && (Q.done || Q.retry)) return 'right'; if (pos === Q.picked && pos !== rightPos) return 'wrong'; return ''; };
 return bar(label) + `<main class="round">${passageHTML(p, { showText: RUN.showText, listen: RUN.listen })}
 <section class="card"><p class="eyebrow">QUESTION ${RUN.qi + 1} OF ${n}</p><p class="q">${esc(qq.q)} ${hear(`${qq.q} ${Q.order.map(i => qq.options[i]).join('? ')}?`, 'Hear the question')}</p>
 <div class="opts">${Q.order.map((i, pos) => `<button class="opt ${cls(pos)}" data-act="opt" data-pos="${pos}" ${Q.done ? 'disabled' : ''}><span class="tag">${cls(pos) === 'right' ? '✓' : cls(pos) === 'wrong' ? '✗' : ''}</span>${esc(qq.options[i])}</button>`).join('')}</div>
 ${Q.done ? `<p class="fb ok">${Q.first ? 'Yes! ' : ''}${qq.evidence ? `The story says: “${esc(qq.evidence)}”` : ''}</p><button class="primary big" data-act="nextq">${RUN.qi < n - 1 ? 'Next question ▸' : 'Finish ▸'}</button>` : Q.retry ? `<p class="fb try">Not quite. Look at the story again. <b>Tap the green one.</b></p>` : ''}
 </section>${RUN.kind !== 'place' ? `<p class="small muted center"><button class="linkish" data-act="report">⚑ Report this text (grown-up)</button></p>` : ''}</main>`;
}
function resultView(){
 const r = V.res;
 if (V.challenge) return bar('Grade 1 challenge') + `<main class="round"><section class="card result"><div class="burst">${V.challenge === 'passed' ? '🏆' : '🌱'}</div><h1>${V.challenge === 'passed' ? 'Challenge passed!' : 'Good try!'}</h1><p class="lead">${V.challenge === 'passed' ? 'The rest of the Grade 1 units are marked “tested out”. Finish the gate (Sound Code and the read-aloud) to earn the certificate.' : 'Nothing changes. Keep going with the units; they build the skills step by step.'}</p><div class="row center"><button class="primary" data-act="nav" data-to="home">Back to Grade Journey</button></div></section></main>`;
 const u = UNITS.find(x => x.id === V.unit);
 const msg = V.kind === 'practice' ? (r.practiceDone ? `Practice passed! The unit check is open${E.currentUnit(S, 1, UNITS)?.id !== u.id ? ' and the next unit is open' : ''}.` : r.pct >= E.PASS ? 'Great reading! One more good practice story opens the unit check.' : 'Good practice. Try another story next time.')
  : r.unitPassed ? `🎉 You passed ${u.title}!` : r.counted ? 'Check passed for today ✓. Pass one more on another day to finish the unit.' : RUN?.tts && !isL(u) ? 'This one was read to you, so it was practice. Next time try reading it yourself.' : 'Not this time. You’ll get a new story on another day.';
 return bar('Grade Journey') + `<main class="round"><section class="card result"><div class="burst">${r.pct >= E.PASS ? '🎉' : '📖'}</div><h1>${r.right} of ${r.n} on the first try</h1><p class="lead">${esc(msg)}</p>
 <div class="row center"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a><button class="btn" data-act="nav" data-to="home">Grade Journey</button></div></section></main>`;
}
function oralView(){
 const p = V.p, words = p.text.split(/\s+/);
 if (V.phase === 'intro') return bar('Read aloud') + `<main><p class="eyebrow">1-MINUTE READ-ALOUD · GROWN-UP SCORED</p><h1>Grown-up: here’s how</h1><ol class="steps"><li>Your child reads the story out loud. Don’t read it to them first.</li><li>Tap <b>Start</b>. Tap any word they misread or skip (tap again to undo). Self-corrections count as right.</li><li>After 1 minute, tap the last word they read.</li></ol><p class="small muted">This gives accuracy and words per minute, for information only. It is not a test score or a diagnosis. Nothing is recorded or sent anywhere.</p><button class="primary big" data-act="oral-start">Start</button></main>`;
 if (V.phase === 'done') { const r = V.rec; return bar('Read aloud') + `<main class="round"><section class="card result"><div class="burst">📖</div><h1>${Math.round(r.accuracy * 100)}% of words right</h1><p class="lead">${r.wcpm} words correct per minute (for information; grown-up scored).</p><p>${r.counts ? '✅ This counts toward finishing Grade 1.' : r.unseen ? 'Grade 1 needs 95% or more. Try another story another day.' : 'This story was seen before, so it is practice.'}</p><div class="row center"><button class="primary" data-act="nav" data-to="home">Back to Grade Journey</button></div></section></main>`; }
 const tap = V.phase === 'last' ? 'last' : 'err';
 return bar('Read aloud') + `<main class="round"><div class="oral-head"><span class="timer">${V.phase === 'run' ? `${V.left}s` : '⏱'}</span><span>${V.phase === 'run' ? 'Tap misread words' : 'Tap the last word they read'}</span>${V.phase === 'run' ? `<button class="btn sm" data-act="oral-stop">They finished</button>` : ''}</div>
 <article class="passage"><h2 class="ptitle">${esc(p.title)}</h2><p class="oral-text">${words.map((w, i) => `<button class="ow ${V.errs.has(i) ? 'err' : ''}" data-act="ow" data-i="${i}" data-mode="${tap}">${esc(w)}</button>`).join(' ')}</p></article></main>`;
}
function writingView(){
 const prompts = GRADE1.writing, k = (V.k ?? Object.keys(S.days).length) % prompts.length, pr = prompts[k];
 return bar('Write 3 sentences') + `<main><p class="eyebrow">OPTIONAL · WRITING</p><h1>${esc(pr)} ${hear(pr)}</h1><p class="lead">Write on paper, or type here. It stays on this device.</p><textarea id="wtext" rows="5" placeholder="My best day was…"></textarea>
 <details class="about" open><summary>Grown-up: score it (optional)</summary><p class="small">Tick what you see. Scoring is optional and never blocks a grade.</p>
 ${['3 sentences about one idea', 'Capital letters and end marks', 'Words you can read (spelling close enough)', 'At least one detail (who, where, why, or a feeling)'].map((t, i) => `<label class="tog"><input type="checkbox" class="rub" value="${i}"> ${esc(t)}</label>`).join('')}
 <div class="row"><button class="primary" data-act="w-save" data-k="${k}">Save score</button><button class="btn" data-act="w-skip">Done, no score</button><button class="btn" data-act="w-new" data-k="${k + 1}">Another idea</button></div></details></main>`;
}
function dashView(){
 const sc = SC(), t = E.tracks(S, 1, UNITS, sc), G1 = E.gradeRec(S, 1), week = Object.entries(S.days).filter(([d]) => d > E.addDays(TODAY(), -7)).reduce((a, [, x]) => a + (x.minutes || 0), 0);
 const checks = UNITS.flatMap(u => (E.unitRec(S, 1, u.id).checks || []).map(c => ({ ...c, unit: u.id }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);
 const alerts = []; const cu = E.currentUnit(S, 1, UNITS);
 if (cu) { const r = E.unitRec(S, 1, cu.id), first = [...r.practice, ...r.checks].map(x => x.at).sort()[0]; if (first && first <= E.addDays(TODAY(), -14)) alerts.push(`Working on ${cu.id} (${cu.title}) for 2 weeks or more.`); if (E.needsReview(S, 1, cu.id)) alerts.push(`Two unit checks missed on different days in ${cu.id}: a little review of the unit before may help.`); }
 if (t.listenPct != null && t.readPct != null && t.listenPct - t.readPct >= 0.25) alerts.push('Listening is much higher than reading by themselves. More decoding practice (Sound Code) may help.');
 const how = S.placedBy === 'placement-check' ? 'Placement check' : S.placedBy === 'chosen' ? `Chosen by ${S.chosenBy === 'parent' ? 'a grown-up' : 'the player'}` : 'Default Grade 1 (grade and check skipped)';
 return bar('Grown-up page') + `<main><p class="eyebrow">GROWN-UP PAGE · ${esc(P.name.toUpperCase())}</p><h1>Grade ${G()}</h1><p class="small muted">${esc(how)}. Everything here stays on this device.</p>
 <div class="tiles"><div class="tile"><b>${esc(t.decoding)}</b><small>Decoding (phonics)</small></div><div class="tile"><b>${esc(t.comprehension)}</b><small>Reading comprehension</small></div><div class="tile"><b>${t.listenPct != null ? Math.round(t.listenPct * 100) + '%' : '–'}</b><small>Listening (recent)</small></div><div class="tile"><b>${Math.round(week)} min</b><small>This week</small></div></div>
 ${alerts.length ? `<ul class="alerts">${alerts.map(a => `<li>⚠️ ${esc(a)}</li>`).join('')}</ul>` : ''}
 <h2>Units</h2><ul class="plain">${UNITS.map(u => `<li>${esc(u.id)} ${esc(u.title)}: ${esc(unitState(u))}</li>`).join('')}</ul>
 <h2>Recent checks</h2>${checks.length ? `<table><tr><th>Date</th><th>Unit</th><th>Story</th><th>First try</th><th>Read-aloud</th><th>Counts</th></tr>${checks.map(c => `<tr><td>${c.at}</td><td>${c.unit.slice(3)}</td><td>${esc(PBY[c.pid]?.title || c.pid)}</td><td>${Math.round(c.pct * 100)}%</td><td>${c.tts ? 'on' : 'off'}</td><td>${c.counted ? '✓' : '–'}</td></tr>`).join('')}</table>` : '<p class="small muted">No checks yet.</p>'}
 <h2>Read-aloud history <small class="muted">(grown-up scored, for information)</small></h2>${G1.gate.oral.length ? `<table><tr><th>Date</th><th>Story</th><th>Accuracy</th><th>WCPM</th><th>Counts</th></tr>${G1.gate.oral.map(o => `<tr><td>${o.at}</td><td>${esc(o.title)}</td><td>${Math.round(o.accuracy * 100)}%</td><td>${o.wcpm}</td><td>${o.counts ? '✓' : '–'}</td></tr>`).join('')}</table>` : '<p class="small muted">None yet.</p>'}
 <div class="row"><button class="btn" data-act="oral">Start a 1-minute read-aloud</button></div>
 ${G1.optionalWriting.length ? `<h2>Writing (optional)</h2><ul class="plain">${G1.optionalWriting.map(w => `<li>${w.at}: ${esc(w.prompt)} ${w.score != null ? `· ${w.score}/${w.of}` : '· not scored'}</li>`).join('')}</ul>` : ''}
 <h2>Settings</h2>
 <label class="tog">Grade: <select id="gsel">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => `<option ${g === G() ? 'selected' : ''}>${g}</option>`).join('')}</select> <button class="btn sm" data-act="set-grade">Change grade</button></label>
 <div class="row"><button class="btn" data-act="check-skip">Take the starting check again</button><button class="btn" data-act="unlock-unit">Unlock the next unit (grown-up choice)</button><button class="btn" data-act="export">Download a CSV</button></div>
 ${Object.keys(S.hidden).length ? `<p class="small">Hidden texts: ${Object.keys(S.hidden).map(id => esc(PBY[id]?.title || id)).join(', ')} <button class="linkish" data-act="unhide">Show them again</button></p>` : ''}
 <details class="about"><summary>How Grade Journey works</summary>
  <p>Grade 1 has 8 units. Each starts with practice stories and ends with a unit check on new stories the child hasn’t seen, read by themselves, 80% or more on the first try, on 2 different days. The next unit opens once the practice is passed. Stories use only the phonics patterns taught so far in Sound Code (at least 90% of the words), plus common heart words.</p>
  <p>Finishing Grade 1 also needs Sound Code checks through module 7 and two 1-minute read-alouds at 95% accuracy, scored by you. Writing is optional. Answers after a retry, with “Read it to me” on, or on a story seen before never count. The certificate lists the evidence.</p>
  <p class="small muted">Grounding: the Simple View of Reading (Gough &amp; Tunmer 1986) and Scarborough’s Reading Rope (decoding and language comprehension tracked separately); the National Reading Panel (2000) five areas; Common Core ELA Grade 1 goals in plain words. Reading-speed norms (Hasbrouck &amp; Tindal 2017) are approximate and shown for information only. Stories are original to the app and were checked automatically (reading level, decodability, one right answer, the answer never in the question, shuffled choices). Grade levels describe school expectations, not a child’s ability. If a child keeps struggling, talk with their school. This is not a diagnosis.</p></details></main>`;
}
function certView(){
 const c = E.gradeRec(S, 1).certificate; if (!c) return homeView();
 return bar('Certificate') + `<main class="round"><section class="card cert"><div class="burst">🏅</div><p class="eyebrow">WORDRAIDERS · GRADE JOURNEY</p><h1>${esc(P.name)} finished Grade ${c.grade}!</h1>
 <p class="lead">Read ${c.passages} new Grade 1 stories by themselves, ${c.compPct}% comprehension; read aloud ${c.oralAcc}% accurate (grown-up scored); Sound Code checks passed through module 7.${c.writing ? ` Writing scored ${esc(c.writing)} by a grown-up.` : ''}</p><p class="small">${c.at}</p>
 <p class="small muted">This shows practice in WordRaiders. It is not a school grade or a diagnosis.</p><div class="row center"><button class="btn" data-act="print">Print</button><button class="primary" data-act="nav" data-to="home">Back</button></div></section></main>`;
}
function render(){
 const s = V.screen;
 app.innerHTML = s === 'pick' ? pickView() : s === 'pick-check' ? pickCheckView() : s === 'skip-check' ? skipCheckView() : s === 'place' ? placeView() : s === 'read' && RUN ? readView() : s === 'result' ? resultView() : s === 'oral' ? oralView() : s === 'writing' ? writingView() : s === 'dash' ? dashView() : s === 'cert' ? certView() : homeView();
}

// ---------- events ----------
app.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; const a = b.dataset.act;
 if (a === 'say') { say(b.dataset.text, true); return; }
 if (a === 'nav') { e.preventDefault(); clearInterval(oralTimer); RUN = null; go(b.dataset.to || 'home'); return; }
 if (a === 'pick') { go('pick-check', { g: +b.dataset.g }); return; }
 if (a === 'skip') { go('skip-check'); return; }
 if (a === 'not-now') { const by = document.querySelector('input[name=by]:checked')?.value || 'player'; E.chooseGrade(S, V.g, by); persist(); go('home'); return; }
 if (a === 'check-chosen') { const by = document.querySelector('input[name=by]:checked')?.value || 'player'; E.chooseGrade(S, V.g, by); startPlacement(Math.min(V.g, MAXPLACE)); return; }
 if (a === 'check-skip') { if (S.chosenGrade == null) S.chosenBy = 'auto'; startPlacement(S.chosenGrade ? Math.min(S.chosenGrade, MAXPLACE) : 1); return; }
 if (a === 'skip-all') { E.skipAll(S); persist(); go('home'); return; }
 if (a === 'words-go') { S.activePlacement.step = 'words'; persist(); render(); return; }
 if (a === 'words-skip') { S.activePlacement.word = false; S.activePlacement.step = 'comp-intro'; persist(); render(); return; }
 if (a === 'mark') { const A = S.activePlacement; A.marks.push(b.dataset.v === '1'); if (E.ladderDone(A.marks) || A.marks.length >= GRADE1.words.length) { A.word = true; A.step = 'comp-intro'; } persist(); render(); return; }
 if (a === 'comp-go') { placeNextPassage(); return; }
 if (a === 'oral-place') { const p = pool('oral').find(x => !S.seen[x.id] && !S.hidden[x.id]) || pool('oral')[0]; startOral(p, 'place'); return; }
 if (a === 'oral-later') { S.activePlacement.step = 'result'; persist(); render(); return; }
 if (a === 'place-accept') { finishPlacement(true); go('home'); return; }
 if (a === 'place-other') { finishPlacement(false); go('pick'); return; }
 if (a === 'read-unit') { const u = E.currentUnit(S, 1, UNITS); const n = u && E.nextPassage(S, 1, u, PASSAGES, TODAY()); if (n?.p) startPassage(n.p, n.kind, { unit: u.id }); return; }
 if (a === 'review-prev') { const u = E.currentUnit(S, 1, UNITS), i = UNITS.indexOf(u), prev = UNITS[Math.max(0, i - 1)]; const ps = E.poolOf(PASSAGES, prev, 'practice'); if (ps.length) startPassage(ps[Math.floor(Math.random() * ps.length)], 'practice', { unit: prev.id }); return; }
 if (a === 'challenge') { const us = UNITS.filter(u => u.mode === 'reading').slice(-2); const list = us.map(u => ({ u: u.id, p: E.poolOf(PASSAGES, u, 'check').find(p => !S.seen[p.id] && !S.hidden[p.id]) })).filter(x => x.p); if (list.length < 2) { flash('No new challenge stories left.'); return; } const ch = { list, results: [] }; startPassage(list[0].p, 'challenge', { unit: list[0].u }); V.challenge = ch; return; }
 if (a === 'tts') { RUN.tts = true; say(`${RUN.p.title}. ${RUN.p.text}`, true); render(); return; }
 if (a === 'listen') { say(`${RUN.p.title}. ${RUN.p.text}`, true); return; }
 if (a === 'show-text') { RUN.showText = true; render(); return; }
 if (a === 'opt') { if (RUN) onPick(+b.dataset.pos); return; }
 if (a === 'nextq') { nextQ(); return; }
 if (a === 'report') { if (confirm('Hide this text on this device? (It will also be flagged for the next build.)')) { S.hidden[RUN.p.id] = { at: TODAY() }; persist(); RUN = null; go('home'); } return; }
 if (a === 'oral') { const p = pool('oral').find(x => !S.seen[x.id] && !S.hidden[x.id]) || pool('oral')[Math.floor(Math.random() * pool('oral').length)]; startOral(p, 'gate'); return; }
 if (a === 'oral-start') { oralStart(); return; }
 if (a === 'oral-stop') { clearInterval(oralTimer); V.secs = Math.max(5, Math.round((Date.now() - V.t0) / 1000)); V.phase = 'last'; render(); return; }
 if (a === 'ow') { const i = +b.dataset.i; if (b.dataset.mode === 'last') { oralFinish(i); return; } V.errs.has(i) ? V.errs.delete(i) : V.errs.add(i); b.classList.toggle('err'); return; }
 if (a === 'writing') { go('writing'); return; }
 if (a === 'w-new') { go('writing', { k: +b.dataset.k }); return; }
 if (a === 'w-save' || a === 'w-skip') { const k = +(b.dataset.k ?? 0), score = a === 'w-save' ? document.querySelectorAll('.rub:checked').length : null; E.gradeRec(S, 1).optionalWriting.push({ at: TODAY(), prompt: GRADE1.writing[k % GRADE1.writing.length], score, of: 4, scoredBy: score != null ? 'parent' : null }); const r = E.unitRec(S, 1, 'G1-U8'); r.status = 'passed'; dayDone(); persist(); flash('Saved. Nice writing!'); go('home'); return; }
 if (a === 'dash') { go('dash'); return; }
 if (a === 'cert') { go('cert'); return; }
 if (a === 'print') { window.print(); return; }
 if (a === 'set-grade') { const g = +document.querySelector('#gsel').value; if (g !== G()) { E.setGrade(S, g, { by: 'parent', why: 'changed in settings', placedBy: 'chosen' }); S.chosenGrade = g; S.chosenBy = 'parent'; persist(); flash(`Grade set to ${g}.`); render(); } return; }
 if (a === 'unlock-unit') { const u = E.currentUnit(S, 1, UNITS); if (!u) return; const r = E.unitRec(S, 1, u.id); r.practiceDone = true; E.refreshUnits(S, 1, UNITS); S.overrides.push({ at: TODAY(), by: 'parent', action: 'unlock-next-unit', unit: u.id, reason: 'grown-up choice' }); persist(); flash('Next unit unlocked (logged).'); render(); return; }
 if (a === 'unhide') { S.hidden = {}; persist(); render(); return; }
 if (a === 'export') { exportCSV(); return; }
});
function exportCSV(){
 const G1 = E.gradeRec(S, 1), rows = [['type', 'date', 'grade', 'unit', 'item', 'title', 'result', 'first_try', 'read_aloud_on', 'seen_before']];
 S.events.forEach(ev => rows.push(['answer', E.dayKey(ev.at), ev.grade, ev.unit, ev.itemId, PBY[ev.passageId]?.title || '', ev.correct ? 'right' : 'wrong', ev.firstTry, ev.ttsUsed, ev.seenBefore]));
 G1.gate.oral.forEach(o => rows.push(['oral', o.at, 1, '', o.pid, o.title, `${Math.round(o.accuracy * 100)}% · ${o.wcpm} wcpm`, '', '', !o.unseen]));
 G1.optionalWriting.forEach(w => rows.push(['writing', w.at, 1, 'G1-U8', '', w.prompt, w.score != null ? `${w.score}/${w.of}` : 'not scored', '', '', '']));
 S.gradeHistory.forEach(h => rows.push(['grade', h.at, h.grade, '', '', h.why, h.by, '', '', '']));
 const csv = rows.map(r => r.map(x => `"${String(x ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
 const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `wordraiders-grade-journey-${P.name}.csv`; document.body.appendChild(a); a.click(); a.remove();
}
if (QS.has('test')) window.__gj = { S: () => S, RUN: () => RUN, V: () => V, E, PASSAGES, UNITS };
setTodayLabel(); persist();
if (S.activePlacement) V = { screen: 'place' };
render();
if (QS.has('today') && S.placedGrade && !S.activePlacement && !S.days[TODAY()]?.done) { const u = E.currentUnit(S, 1, UNITS), n = u && E.nextPassage(S, 1, u, PASSAGES, TODAY()); if (n?.p) startPassage(n.p, n.kind, { unit: u.id }); }
