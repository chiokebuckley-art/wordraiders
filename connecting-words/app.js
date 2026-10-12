// Connecting Words: the kid-friendly Connecting Language (dev handoff "Connecting Language: making it simpler").
// Per word, about 6 short screens: picture story → meet the word → two worked examples → three quick tries with
// instant visible feedback and one retry. A day = 2 new words mixed with up to 4 reviews from earlier days.
// Everything can be read aloud. Questions are practice until an educator approves them (none are yet).
import {WORDS} from './content.js?v=cw-1';
import {fresh, planDay, itemOf, learned, reviewed, seeded, shuffle, status, dayKey, addDays} from './engine.js?v=cw-1';
import {panel} from '../sentence-decoder/art.js?v=fs-1';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=3';

const app = document.querySelector('#app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);
const TODAY = () => dayKey();

// ---------- player + save ----------
function player(){ try { const r = JSON.parse(localStorage.getItem('wordraiders.players.v1') || 'null'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Reader' }; } catch { return { id: 'guest', name: 'Reader' }; } }
const P = player(), KEY = `wr-connwords.${P.id}`;
let S; try { S = { ...fresh(), ...(JSON.parse(localStorage.getItem(KEY) || 'null') || {}) }; } catch { S = fresh(); }
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }
// Tell the main app's Today list that today's joining-words task is done (same record Connecting Language writes).
function markTodayDone(senseIds){
 if (P.id === 'guest' || !senseIds.length) return;
 try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || 'null'); if (!raw || raw.version !== 2) return;
  const cl = raw.connectingLanguage && typeof raw.connectingLanguage === 'object' ? raw.connectingLanguage : {}, now = Date.now(), day = TODAY(), ids = [...new Set(senseIds)].slice(0, 3);
  cl.sessions = { ...(cl.sessions || {}), [day]: { ids, seen: ids, at: now, completedAt: now, completedDay: day } };
  cl.exposures = { ...(cl.exposures || {}) }; ids.forEach(id => { if (!cl.exposures[id]) cl.exposures[id] = now; });
  raw.connectingLanguage = cl; raw.savedAt = now; localStorage.setItem(k, JSON.stringify(raw)); } catch {}
}

// ---------- read aloud ----------
const readTo = () => { try { return localStorage.getItem('wr-connwords-readto') !== '0'; } catch { return true; } };
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); if (!el) return; el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 3500); }
function say(t, force){ if (!t) return; if (!force && !readTo()) return; const why = voiceBlocked(); if (why) { if (force) flash(why); return; } speak(t.replace(/___/g, ', blank, ')); }
const hear = (t, label = 'Hear it') => `<button class="hear-btn" data-act="say" data-text="${esc(t)}" aria-label="${esc(label)}">🔊</button>`;

// ---------- helpers ----------
const W = w => WORDS.find(x => x.word === w);
function mark(text, word){ const re = new RegExp(`\\b(${word.replace(/ /g, '\\s+')})\\b`, 'i'); return esc(text).replace(re, '<mark>$1</mark>').replace(/___/g, '<span class="blank">___</span>'); }
const fmtDay = key => { const [y, m, d] = key.split('-').map(Number); const dt = new Date(y, m - 1, d, 12), now = new Date(); const diff = Math.round((dt - new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)) / 864e5); return diff === 1 ? 'tomorrow' : diff < 7 ? dt.toLocaleDateString('en-US', { weekday: 'long' }) : dt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }); };

// ---------- the day's run ----------
let RUN = null;   // { plan, i, sub, item state, newWords, reviewed, firsts }
function startDay(){
 const plan = planDay(S, WORDS, TODAY());
 if (!plan.length) { flash('Nothing to do right now — come back tomorrow!'); return; }
 RUN = { plan, i: 0, sub: 0, newWords: [], reviewedWords: [], lessonFirsts: {}, results: [] }; enter();
}
function cur(){ return RUN.plan[RUN.i]; }
const LESSON = ['story', 'meet', 'examples', 'try', 'try', 'try'];
function enter(){
 const p = cur(); RUN.q = null;
 if (p.kind === 'review') RUN.q = makeQ(W(p.word), itemOf(W(p.word), p.item), `${p.word}:${p.item.src}${p.item.i}`, 'review');
 else if (LESSON[RUN.sub] === 'try') { const w = W(p.word), k = RUN.sub - 3; RUN.q = makeQ(w, w.tries[k], `${p.word}:try${k}`, 'lesson'); }
 render(); readScreen(); window.scrollTo(0, 0);
}
function next(){
 const p = cur();
 if (p.kind === 'lesson' && RUN.sub < LESSON.length - 1) { RUN.sub++; enter(); return; }
 if (p.kind === 'lesson') { learned(S, p.word, RUN.lessonFirsts[p.word] || [], TODAY()); RUN.newWords.push(p.word); }
 RUN.i++; RUN.sub = 0; persist();
 if (RUN.i >= RUN.plan.length) return finishDay();
 enter();
}
function makeQ(w, it, key, mode){
 const n = S.log.filter(l => l.item === key).length, rng = seeded(`${S.seed}:${key}:${n}`);
 const order = shuffle(it.options, rng);   // [{x, i}] — i = the authored index
 return { w, it, key, mode, order, picked: null, first: null, retry: false, done: false };
}
function onPick(pos){
 const q = RUN.q; if (q.done) return;
 const chosen = q.order[pos].i, right = chosen === q.it.answer;
 if (q.first === null) {
  q.first = right; const p = cur();
  S.log.push({ day: TODAY(), word: q.w.word, item: q.key, mode: q.mode, shown: q.order.map(o => o.i), pos: q.order.findIndex(o => o.i === q.it.answer), pick: chosen, ok: right });
  if (S.log.length > 400) S.log.splice(0, S.log.length - 400);
  RUN.results.push({ word: q.w.word, ok: right, mode: q.mode });
  if (q.mode === 'lesson') (RUN.lessonFirsts[p.word] ||= []).push(right);
  else { reviewed(S, q.w.word, right, TODAY()); RUN.reviewedWords.push(q.w.word); }
  persist();
 }
 q.picked = pos;
 if (right) { q.done = true; render(); say(q.first ? `Yes! ${q.it.feedback}` : q.it.feedback); return; }
 q.retry = true; render(); say(`Not quite. ${q.it.feedback} Tap the green one.`);
}
function finishDay(){
 const today = TODAY();
 S.days[today] = { done: true, newWords: RUN.newWords, reviewed: RUN.reviewedWords };
 persist(); addXp(10 + 5 * RUN.newWords.length);
 const senses = [...RUN.newWords, ...RUN.reviewedWords].map(w => W(w)?.sense).filter(Boolean);
 markTodayDone(senses);
 RUN.finished = true; render(); readScreen();
}

// ---------- screens ----------
function bar(title){ return `<header class="bar"><a href="${RUN ? '#' : '../#/home'}" data-act="${RUN ? 'home' : ''}" class="back">${RUN ? '← Joining words' : '← WordRaiders'}</a><span class="title">${esc(title)}</span><button class="readto ${readTo() ? 'on' : ''}" data-act="readto" aria-pressed="${readTo()}" aria-label="Read to me">${readTo() ? '🔊' : '🔇'}</button></header>`; }
function progress(){ const total = RUN.plan.reduce((a, p) => a + (p.kind === 'lesson' ? LESSON.length : 1), 0); const done = RUN.plan.slice(0, RUN.i).reduce((a, p) => a + (p.kind === 'lesson' ? LESSON.length : 1), 0) + RUN.sub; return `<div class="prog" aria-hidden="true"><span style="width:${Math.round(done / total * 100)}%"></span></div>`; }
function homeView(){
 const today = TODAY(), d = S.days[today], plan = planDay(S, WORDS, today), newN = plan.filter(p => p.kind === 'lesson').length, revN = plan.filter(p => p.kind === 'review').length;
 const groups = [1, 2, 3, 4, 5].map(g => { const ws = WORDS.filter(w => w.group === g); if (!ws.length) return ''; return `<li><div class="chips">${ws.map(w => { const st = status(S.words[w.word]); return `<span class="chip ${st}">${st === 'got' ? '⭐ ' : st === 'learning' ? '🌱 ' : ''}${esc(w.word)}</span>`; }).join('')}</div></li>`; }).join('');
 const got = WORDS.filter(w => S.words[w.word]?.gotIt).length, learning = WORDS.filter(w => S.words[w.word] && !S.words[w.word].gotIt).length;
 const lead = d?.done ? `<h1>Done for today! 🎉</h1><p class="lead">${d.newWords?.length ? `You learned <b>${d.newWords.map(esc).join('</b> and <b>')}</b>.` : 'You practised your joining words.'}</p>`
  : `<h1>${newN ? `Learn ${newN} joining word${newN > 1 ? 's' : ''} today.` : revN ? 'Practise your joining words.' : 'All caught up!'}</h1><p class="lead">${newN && revN ? `Plus ${revN} quick review${revN > 1 ? 's' : ''}. ` : ''}About ${Math.max(2, newN * 2 + revN)} minutes. No timer.</p>`;
 return bar('Joining words') + `<main><p class="eyebrow">CONNECTING WORDS</p>${lead}
 ${d?.done ? `<div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a>${plan.length ? `<button class="btn" data-act="start">Practise more</button>` : ''}</div>` : plan.length ? `<button class="primary big" data-act="start">▶ Start</button>` : `<a class="btn" href="../#/home">Back to Home</a>`}
 <h2>Your words</h2><p class="small muted">🌱 learning · ⭐ got it (right on two different days)${got + learning ? ` · ${got} got it, ${learning} learning` : ''}</p><ol class="groups">${groups}</ol>
 <p class="note">Practice mode: a teacher hasn’t checked these questions yet.</p>
 <details class="about"><summary>For grown-ups</summary>
  <p>Each new word takes about 6 short screens: a picture story, a kid-sized meaning, two worked examples, then three quick tries. Every try has 3 short options in a shuffled order, shows the right answer straight away, and gives one retry; only the first answer counts. Words come back after 2, 7 and 21 days, and a missed word comes back the next day. “Got it” needs right first answers on two different days.</p>
  <p>Words start with the most common, concrete ones (and, but, or, because, so; time words; place words) and save harder ones (although, however, unless, instead) for later. Older readers can use the full <a href="../connecting-language/">Connecting Language</a> module, with all 248 words and the optional logic strand.</p>
  <p>Say it: after each lesson, invite your child to finish a sentence out loud (for example “I wore a coat because…”). It isn’t scored.</p>
  <p class="small muted">Design based on: Mayer’s multimedia principles (short segments, highlighting, narration with pictures); worked examples (Sweller); retrieval practice (Roediger &amp; Karpicke 2006; Agarwal et al. 2021); spacing (Cepeda et al. 2006); student-friendly explanations (Beck, McKeown &amp; Kucan); multiple-choice item writing (Haladyna et al. 2002). These are design principles, not proof that this lesson works; questions are practice until an educator reviews them.</p>
  <label class="tog"><input type="checkbox" data-act="readto-box" ${readTo() ? 'checked' : ''}> Read every question and answer aloud</label>
 </details></main>`;
}
function lessonView(){
 const p = cur(), w = W(p.word), step = LESSON[RUN.sub];
 let body = '';
 if (step === 'story') body = `<p class="eyebrow">NEW WORD</p><figure class="scene"><img src="${esc(w.scene)}" alt="${esc(w.sceneAlt)}" width="1200" height="900"></figure><p class="sent">${mark(w.story, w.word)} ${hear(w.story)}</p>`;
 else if (step === 'meet') body = `<p class="eyebrow">MEET THE WORD</p><div class="big-word">${esc(w.word)}</div><p class="meaning">${mark(w.meaning, w.word)} ${hear(w.meaning)}</p><div class="pic">${panel(w.examples[0].panel, { size: 300, label: w.examples[0].panel.alt })}</div><p class="sent"><span>${mark(w.examples[0].text, w.word)}</span></p>`;
 else if (step === 'examples') body = `<p class="eyebrow">SEE HOW</p>${w.examples.map(e => `<div class="ex"><div class="pic sm">${panel(e.panel, { size: 300, label: e.panel.alt })}</div><div><p class="sent">${mark(e.text, w.word)} ${hear(e.text + ' ' + e.seeHow)}</p><p class="seehow">${mark(e.seeHow, w.word)}</p></div></div>`).join('')}`;
 else return qView();
 return bar(w.word) + `<main class="round">${progress()}<section class="card">${body}<button class="primary big" data-act="next">Next ▸</button></section></main>`;
}
function qView(){
 const q = RUN.q, it = q.it, p = cur(), w = q.w, lastTry = p.kind === 'lesson' && RUN.sub === LESSON.length - 1;
 const ans = it.answer, rightPos = q.order.findIndex(o => o.i === ans);
 const cls = pos => { if (q.picked === null) return ''; if (pos === rightPos && (q.done || q.retry)) return 'right'; if (pos === q.picked && q.order[pos].i !== ans) return 'wrong'; return ''; };
 const opt = (o, pos) => it.type === 'picture'
  ? `<button class="opt pic-opt ${cls(pos)}" data-act="pick" data-pos="${pos}" ${q.done ? 'disabled' : ''} aria-label="${esc(o.x.alt)}">${panel(o.x, { size: 300, label: o.x.alt })}<span class="tag">${cls(pos) === 'right' ? '✓' : cls(pos) === 'wrong' ? '✗' : pos + 1}</span></button>`
  : `<button class="opt ${cls(pos)}" data-act="pick" data-pos="${pos}" ${q.done ? 'disabled' : ''}><span class="tag">${cls(pos) === 'right' ? '✓' : cls(pos) === 'wrong' ? '✗' : ''}</span>${esc(o.x)}</button>`;
 const fb = q.done ? `<p class="fb ok">${q.first ? 'Yes! ' : ''}${esc(it.feedback)}</p>` : q.retry ? `<p class="fb try">Not quite. ${esc(it.feedback)}<br><b>Tap the green one.</b></p>` : '';
 const wrap = q.done && lastTry ? `<div class="wrap">You learned <b>${esc(w.word)}</b> 🎉 You’ll see it again ${esc(fmtDay(addDays(TODAY(), 2)))}.${w.sayIt ? `<br><span class="small">Say it out loud: “${esc(w.sayIt)}” ${hear(w.sayIt)}</span>` : ''}</div>` : '';
 return bar(p.kind === 'review' ? 'Quick review' : w.word) + `<main class="round">${progress()}<section class="card">
 <p class="eyebrow">${p.kind === 'review' ? 'REMEMBER?' : `TRY ${RUN.sub - 2} OF 3`}</p>
 ${it.picture ? `<div class="pic">${panel(it.picture, { size: 240, label: it.picture.alt })}</div>` : ''}
 <p class="sent">${mark(it.text, it.type === 'cloze' ? '\u0000' : w.word)} ${hear(readQ(q), 'Hear the question')}</p>${it.q ? `<p class="q">${esc(it.q)}</p>` : ''}
 <div class="opts ${it.type === 'picture' ? 'pics' : ''}">${q.order.map(opt).join('')}</div>${fb}${wrap}
 ${q.done ? `<button class="primary big" data-act="next">Next ▸</button>` : ''}</section></main>`;
}
function readQ(q){ const it = q.it; const opts = it.type === 'picture' ? q.order.map((o, k) => `Picture ${k + 1}: ${o.x.alt}.`).join(' ') : q.order.map(o => o.x).join('? ') + '?'; return `${it.text} ${it.q || ''} ${opts}`; }
function doneView(){
 const nw = RUN.newWords, firsts = RUN.results.filter(r => r.ok).length;
 const nextRev = WORDS.map(w => S.words[w.word]).filter(r => r && !r.gotIt).map(r => r.due).sort()[0];
 const msg = nw.length ? `You learned <b>${nw.map(esc).join('</b> and <b>')}</b>!` : 'You practised your joining words!';
 return bar('Joining words') + `<main class="round"><section class="card result"><div class="burst">🎉</div><h1>Great work!</h1><p class="lead">${msg}</p>
 <p>${firsts} of ${RUN.results.length} right on the first try.${nextRev ? ` We’ll practise again ${esc(fmtDay(nextRev))}.` : ''}</p>
 <div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a></div></section></main>`;
}
function render(){ app.innerHTML = !RUN ? homeView() : RUN.finished ? doneView() : cur().kind === 'review' ? qView() : lessonView(); }
function readScreen(){
 if (!RUN) return;
 if (RUN.finished) { say(`Great work! ${RUN.newWords.length ? 'You learned ' + RUN.newWords.join(' and ') + '!' : ''}`); return; }
 const p = cur(), w = W(p.word), step = p.kind === 'lesson' ? LESSON[RUN.sub] : 'try';
 if (step === 'story') say(w.story); else if (step === 'meet') say(`${w.word}. ${w.meaning} ${w.examples[0].text}`); else if (step === 'examples') say(w.examples.map(e => `${e.text} ${e.seeHow}`).join(' ')); else say(readQ(RUN.q));
}

// ---------- events ----------
app.addEventListener('change', e => { if (e.target.dataset.act === 'readto-box') { try { localStorage.setItem('wr-connwords-readto', e.target.checked ? '1' : '0'); } catch {} render(); } });
app.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled || b.tagName === 'INPUT') return; const a = b.dataset.act;
 if (a === 'say') { say(b.dataset.text, true); return; }
 if (a === 'readto') { try { localStorage.setItem('wr-connwords-readto', readTo() ? '0' : '1'); } catch {} if (!readTo()) speechSynthesis?.cancel?.(); render(); return; }
 if (a === 'home') { e.preventDefault(); RUN = null; render(); return; }
 if (a === 'start') { startDay(); return; }
 if (!RUN) return;
 if (a === 'next') { next(); return; }
 if (a === 'pick') onPick(Number(b.dataset.pos));
});
if (QS.has('test')) window.__cw = { S: () => S, RUN: () => RUN, W };
render();
if (QS.has('today') && !S.days[TODAY()]?.done && planDay(S, WORDS, TODAY()).length) startDay();
