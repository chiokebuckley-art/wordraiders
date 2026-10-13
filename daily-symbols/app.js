// Daily Symbols: punctuation and reading marks, a few minutes a day (dev handoff "Symbols Daily Practice").
// A day = meet 1 new mark (2 for older tiers) + up to 6 reviews, then one unscored "read it with the right voice".
// Item types: choose the mark (3 shuffled choices), fix the sentence (tap the wrong mark, then pick), spot the mark.
// Content is DRAFT (not educator-reviewed); everything can be read aloud with the device's best voice.
import {MARKS, SLOT, ACCENT} from './content.js?v=ds-1';
import {fresh, dayKey, addDays, seeded, shuffle, stopsReached, modeFor, refreshUnlocks, grownUpUnlock, status, tierOpen, planDay, introduce, answer, setGlyphs, opener} from './engine.js?v=ds-1';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=3';

const app = document.querySelector('#app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);
const TODAY = () => dayKey();
const BY = Object.fromEntries(MARKS.map(m => [m.id, m]));
// Every mark character → its mark id (for "tap the mark" and for counting marks in a sentence).
const GLY = {}; for (const [id, g] of Object.entries(SLOT)) [g].flat().forEach(ch => { if (!GLY[ch]) GLY[ch] = id; });
GLY['‡'] = 'dagger'; GLY["'"] = 'apostrophe'; setGlyphs(GLY);
const ACC_NAME = { acute: 'Up-Slant Accent', grave: 'Down-Slant Accent', none: 'No mark', macron: BY.macron?.name, breve: BY.breve?.name, diaeresis: BY.diaeresis?.name, circumflex: BY.circumflex?.name, cedilla: BY.cedilla?.name };
const SHOW = { macron: 'ā', breve: 'ă', diaeresis: 'ë', 'acute-grave': 'é è', circumflex: 'ê', cedilla: 'ç' };
const ICON = { period: '⏹️', 'question-mark': '⤴️', exclamation: '⚡', comma: '💨', apostrophe: '🧩', 'double-quotes': '💬', colon: '👀', hyphen: '🔗', ellipsis: '👣', parentheses: '🤫', ampersand: '➕', 'number-sign': '🔢', slash: '🔀', asterisk: '⭐', semicolon: '😉', 'em-dash': '🛝', 'en-dash': '🌉', 'single-quotes': '🗨️', 'square-brackets': '🤖', macron: '➖', breve: '🙂', interrobang: '😲', braces: '🖍️', 'angle-brackets': '🔺', 'section-sign': '📘', pilcrow: '📄', dagger: '🪧', diaeresis: '✌️', 'acute-grave': '🎩', circumflex: '🥳', cedilla: '🪝' };

// ---------- player + saves ----------
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
function player(){ const r = read('wordraiders.players.v1'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Reader' }; }
const P = player(), KEY = `wr-symbols.${P.id}`;
let S = { ...fresh(), ...(read(KEY) || {}) }; S.settings = { ...fresh().settings, ...(S.settings || {}) };
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const FS = read(`wr-firststeps.${P.id}`), MODE = modeFor(FS);
function syncUnlocks(){ refreshUnlocks(S, MARKS, stopsReached(read(`wordraiders.save.${P.id}`), FS, read(`wr-soundcode.${P.id}`)), MODE); }
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }

// ---------- read aloud ----------
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); if (!el) return; el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 3500); }
function say(t, force){ if (!t) return; if (!force && !S.settings.read) return; const why = voiceBlocked(); if (why) { if (force) flash(why); return; } speak(t); }
const hear = (t, label = 'Hear it') => `<button class="hear-btn" data-act="say" data-text="${esc(t)}" aria-label="${esc(label)}">🔊</button>`;

// ---------- sentences ----------
const SLOT_RE = /(\{[^{}]*\})/;
function slotText(m, body, fillId, k){
 const [t, letter] = body.split(':');
 if (letter != null) { const acc = fillId ? ACCENT[fillId] : ACCENT[t === 'acute-grave' ? 'acute' : t]; return (letter + (acc || '')).normalize('NFC'); }
 const g = SLOT[fillId || m.id]; return Array.isArray(g) ? g[k % 2] : g;
}
/** The target's own option id: the mark id, or for accent marks the accent written in the slot (acute / grave). */
function targetOpt(m, s){ if (m.kind !== 'accent') return m.id; const t = s.s.match(/\{([^{}:]*):/)[1]; return t === 'acute-grave' ? 'acute' : t; }
/** Split a sentence into tokens: {slot, txt} | {w} | {mk} | {sp}. fillId = what to show in the slot (null = target). */
function tokens(m, s, fillId){
 const out = []; let k = 0;
 for (const part of s.s.split(SLOT_RE)) {
  if (!part) continue;
  if (SLOT_RE.test(part) && /^\{[^{}]*\}$/.test(part)) { out.push({ slot: true, txt: slotText(m, part.slice(1, -1), fillId, k++) }); continue; }
  for (const piece of part.split(/(\s+)/)) {
   if (!piece) continue; if (/^\s+$/.test(piece)) { out.push({ sp: piece }); continue; }
   let buf = ''; for (const ch of piece) { if (GLY[ch]) { if (buf) out.push({ w: buf }); buf = ''; out.push({ mk: ch }); } else buf += ch; } if (buf) out.push({ w: buf });
  }
 }
 return out;
}
const plain = (m, s, fillId) => tokens(m, s, fillId).map(t => t.slot ? t.txt : t.w ?? t.mk ?? t.sp).join('');
const spoken = (m, s) => tokens(m, s).map(t => t.slot ? ', blank, ' : t.w ?? t.mk ?? t.sp).join('').replace(/\s+,/g, ',');
function optLabel(m, s, id){
 if (m.kind === 'accent') { const letter = s.s.match(/\{[^{}:]*:([a-zA-Z])\}/)[1]; return (letter + (ACCENT[id] || '')).normalize('NFC'); }
 const g = SLOT[id]; return Array.isArray(g) ? g.join(' ') : g;
}
const optName = (m, id) => m.kind === 'accent' ? ACC_NAME[id] || id : BY[id]?.name || id;
const optSay = (m, id) => m.kind === 'accent' ? ACC_NAME[id] : `${BY[id]?.name}, ${BY[id]?.pdfName.split(' (')[0].split(' / ')[0]}`;
const showGlyph = m => SHOW[m.id] || m.glyph;
const nameOf = m => `${m.name} ${showGlyph(m)}`;

// ---------- the day's run ----------
let RUN = null;
function startDay(){
 syncUnlocks();
 const today = TODAY();
 if (!(S.active && S.active.date === today && !S.active.finished)) {
  const plan = planDay(S, MARKS, today, MODE);
  if (!plan.items.length) { flash('Nothing to practise right now. Come back tomorrow!'); return; }
  plan.news.forEach(id => introduce(S, id, today));
  S.active = { date: today, items: plan.items, i: 0, results: [], news: plan.news, startedAt: Date.now(), n: 0 };
  persist();
 }
 RUN = { q: null }; enter();
}
const cur = () => S.active.items[S.active.i];
function enter(){
 const it = cur(); RUN.q = null; RUN.meetTapped = false;
 if (it.kind === 'item') RUN.q = makeQ(it);
 if (it.kind === 'read') RUN.read = pickRead();
 render(); readScreen(); window.scrollTo(0, 0);
}
function next(){
 const A = S.active;
 // Session ends after about 5 minutes: jump to the read-aloud step once a few items are done.
 if (Date.now() - A.startedAt > 5 * 60e3 && A.results.length >= 4 && cur().kind !== 'read') A.i = A.items.findIndex(x => x.kind === 'read') - 1;
 A.i++; persist();
 if (A.i >= A.items.length) return finishDay();
 enter();
}
function makeQ(it){
 const m = BY[it.id], s = m.sentences[it.sent], A = S.active, rng = seeded(`${S.seed}:${A.date}:${A.i}`);
 const target = targetOpt(m, s), wrong = shuffle(s.wrong, rng);
 S.seen[`${m.id}#${it.sent}`] = A.date; persist();
 const q = { m, s, it, type: it.type, target, picked: null, first: null, hinted: false, done: false, retry: false, step: 1, tapWrong: null };
 if (it.type === 'choose') q.opts = shuffle([target, ...wrong.slice(0, 2)], rng);
 if (it.type === 'fix') {
  q.shown = wrong[0];
  const conf = [...new Set(m.sentences.flatMap(x => x.wrong))].filter(x => x !== q.shown && x !== target && (m.kind !== 'accent'));
  // Top up to 3 choices with marks that can't fit: never another end mark when the gap ends a sentence.
  const END = ['period', 'question-mark', 'exclamation', 'interrobang'];
  const spare = m.kind === 'accent' ? ['none', 'macron', 'breve', 'acute', 'circumflex', 'diaeresis'] : MARKS.filter(x => x.kind === m.kind && x.tier <= Math.max(2, m.tier + 1) && !END.includes(x.id)).map(x => x.id);
  const others = [...new Set([...wrong.slice(1), ...shuffle(conf.filter(x => !wrong.includes(x)), rng), ...shuffle(spare, rng)])].filter(x => x !== q.shown && x !== target).slice(0, 2);
  q.opts = shuffle([target, ...others], rng);
 }
 return q;
}
function logAnswer(q, response, correct){
 const A = S.active, id = q.m.id;
 S.events.push({ eventId: `${A.date}:${A.n++}`, termId: `sym:${id}`, itemId: `${id}#${q.it.sent}:${q.type}`, type: q.type, shownOrder: q.opts ? q.opts.map(o => optLabel(q.m, q.s, o)) : null, pos: q.opts ? q.opts.indexOf(q.target) : null, response, correct, hinted: q.hinted, firstTry: true, date: A.date, practice: !!q.it.practice });
 if (S.events.length > 400) S.events.splice(0, S.events.length - 400);
 answer(S, id, { correct, hinted: q.hinted, type: q.type }, A.date);
 A.results.push({ id, ok: correct, hinted: q.hinted, type: q.type });
 persist();
}
function onPick(pos){
 const q = RUN.q; if (q.done) return;
 const chosen = q.opts[pos], right = chosen === q.target;
 if (q.first === null) { q.first = right && q.tapWrong !== false; logAnswer(q, optLabel(q.m, q.s, chosen), q.first); }
 q.picked = pos;
 if (right) { q.done = true; render(); say(`${q.first ? 'Yes! ' : ''}${feedback(q)}`); return; }
 q.retry = true; render(); say(`Not quite. ${feedback(q)} Tap the green one.`);
}
function onTap(idx){
 const q = RUN.q; if (q.done) return;
 const toks = tokens(q.m, q.s, q.type === 'fix' ? q.shown : null), t = toks[idx], right = !!t?.slot;
 if (q.type === 'spot') {
  if (q.first === null) { q.first = right; logAnswer(q, t?.txt ?? t?.mk ?? t?.w, right); }
  q.picked = idx;
  if (right) { q.done = true; render(); say(`${q.first ? 'Yes! ' : ''}${feedback(q)}`); return; }
  q.retry = true; render(); say(`That one is the ${BY[GLY[t?.mk]]?.name || 'word'}. Find the ${q.m.name}. It's the green one.`); return;
 }
 if (q.type === 'fix' && q.step === 1) {
  q.tapWrong = right; q.tapped = idx;
  if (right) { q.step = 2; render(); say(`Yes, that mark is wrong. Which mark goes there? ${q.opts.map(o => optSay(q.m, o)).join(', ')}.`); return; }
  // Missed the spot: no credit for this item, but show where it was and carry on to pick the mark.
  q.first = false; logAnswer(q, t?.mk ?? t?.w ?? '', false); q.step = 2; render(); say(`The wrong mark was here, in green. Which mark goes there?`);
 }
}
function onHint(){ const q = RUN.q; if (!q || q.done || q.hinted) return; q.hinted = true; render(); say(hintText(q)); }
function hintText(q){
 if (q.type === 'spot') return `Hint: the ${q.m.name} looks like ${showGlyph(q.m)}. ${q.m.meaning}`;
 return 'Hint: ' + q.opts.map(o => q.m.kind === 'accent' ? `${optLabel(q.m, q.s, o)} is ${ACC_NAME[o]}.` : `${BY[o].name}: ${BY[o].voice}`).join(' ');
}
const feedback = q => q.m.kind === 'accent' ? `${q.m.name}: ${q.m.meaning}` : `This one needs the ${q.m.name}. ${q.m.meaning}`;
function pickRead(){
 const A = S.active, done = A.items.filter(x => x.kind === 'item');
 const pref = [...done.filter(x => A.news.includes(x.id)), ...done].find(x => BY[x.id].kind !== 'accent' && BY[x.id].tier <= 3) || done[0];
 if (!pref) return null; const m = BY[pref.id]; return { m, text: plain(m, m.sentences[pref.sent]) };
}
function finishDay(){
 const A = S.active, today = A.date, practised = [...new Set(A.items.filter(x => x.kind === 'item').map(x => x.id))];
 S.days[today] = { done: true, practised, news: A.news, right: A.results.filter(r => r.ok).length, of: A.results.length };
 A.finished = true; S.today = { date: today, label: 'done' }; persist(); addXp(10 + 5 * A.news.length);
 RUN = { finished: true }; render(); say(`Great work! You practised ${practised.length} mark${practised.length > 1 ? 's' : ''} today.`);
}

// ---------- screens ----------
function bar(title){ const inside = RUN && !RUN.finished; return `<header class="bar"><a href="${inside ? '#' : '../#/home'}" data-act="${inside ? 'home' : ''}" class="back">${inside ? '← Daily Symbols' : '← WordRaiders'}</a><span class="title">${esc(title)}</span><button class="readto ${S.settings.read ? 'on' : ''}" data-act="readto" aria-pressed="${S.settings.read}" aria-label="Read to me">${S.settings.read ? '🔊' : '🔇'}</button></header>`; }
function progress(){ const A = S.active, n = A.items.length; return `<div class="prog-row"><div class="prog" aria-hidden="true"><span style="width:${Math.round(A.i / n * 100)}%"></span></div><span class="small muted">${A.i + 1} of ${n}</span></div>`; }
const fmtDay = key => { const [y, m, d] = key.split('-').map(Number); const dt = new Date(y, m - 1, d, 12), now = new Date(); const diff = Math.round((dt - new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)) / 864e5); return diff <= 0 ? 'today' : diff === 1 ? 'tomorrow' : diff < 7 ? dt.toLocaleDateString('en-US', { weekday: 'long' }) : dt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }); };
const glyphSpan = m => `<span class="gl" role="img" aria-label="${esc(m.pdfName.split(' (')[0])}">${esc(showGlyph(m))}</span>`;
function chip(m){ const st = status(S.deck[m.id]), un = !!S.unlocked[m.id]; return `<li class="mk ${st === 'locked' ? 'lockedin' : st} ${un ? '' : 'notyet'}">${glyphSpan(m)}<span><b>${esc(m.name)}</b><small>${st === 'locked' ? '🏆 locked in' : st === 'mastered' ? '⭐ mastered' : st === 'learning' ? '🌱 learning' : un ? 'coming up' : '🔒 not yet'}</small></span></li>`; }
function planLabel(plan){ const n = plan.news.length, r = plan.due.length; return n && r ? `${n} new + ${r} review` : n ? `${n} new mark${n > 1 ? 's' : ''}` : r ? `${r} review${r > 1 ? 's' : ''}` : 'practice'; }
function homeView(){
 syncUnlocks();
 const today = TODAY(), d = S.days[today], A = S.active && S.active.date === today && !S.active.finished ? S.active : null;
 const plan = planDay(S, MARKS, today, MODE), unlocked = S.unlockOrder.length;
 S.today = { date: today, label: d?.done ? 'done' : A ? 'keep going' : unlocked ? planLabel(plan) : '' }; persist();
 const tiers = [1, 2, 3, 4].filter(t => t < 4 || S.settings.older).map(t => { const ms = MARKS.filter(m => m.tier === t), got = ms.filter(m => ['mastered', 'locked'].includes(status(S.deck[m.id]))).length; return `<h3>${['', 'Starter marks', 'Growing marks', 'Strong-reader marks', 'Older marks'][t]} <small class="muted">${got} of ${ms.length} mastered${t > 1 && !tierOpen(S, MARKS, t) ? ' · opens when most of the marks above are going well' : ''}</small></h3><ul class="marks">${ms.map(chip).join('')}</ul>`; }).join('');
 const lead = d?.done ? `<h1>Done for today! 🎉</h1><p class="lead">You practised these marks today:</p><p class="gbs">${d.practised.map(id => `<span class="gb">${esc(showGlyph(BY[id]))}<small>${esc(BY[id].name)}</small></span>`).join('')}</p>`
  : !unlocked ? `<h1>Your first marks are on the way.</h1><p class="lead">Daily Symbols starts once you reach <b>Who Did What?</b> in First Steps or begin the Journey.</p>`
  : A ? `<h1>Keep going!</h1><p class="lead">You’re on step ${A.i + 1} of ${A.items.length}.</p>`
  : plan.items.length ? `<h1>${plan.news.length ? `Meet ${plan.news.length === 1 ? 'a new mark' : '2 new marks'} today.` : 'Practise your marks.'}</h1><p class="lead">${planLabel(plan)} · about 4 minutes. No timer.</p>` : `<h1>All caught up!</h1>`;
 const locked = MARKS.filter(m => !S.unlocked[m.id] && (m.tier < 4 || S.settings.older));
 return bar('Daily Symbols') + `<main><p class="eyebrow">DAILY SYMBOLS</p>${lead}
 ${d?.done ? `<div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a></div>` : (A || plan.items.length) && unlocked ? `<button class="primary big" data-act="start">▶ ${A ? 'Continue' : 'Start'}</button>` : `<a class="btn" href="../#/home">Back to Home</a>`}
 <h2>Your marks</h2>${tiers}
 <p class="note">Practice mode: a teacher hasn’t checked these marks and sentences yet.</p>
 <details class="about"><summary>For grown-ups</summary>
  <p>Each day: meet 1 new mark (2 for the harder marks), then up to 6 quick reviews and one read-aloud. Reviews use three kinds of question: choose the mark for the gap, fix a sentence (tap the wrong mark, then pick the right one), and spot a mark in a sentence. Every question has 3 choices in a shuffled order. The answer never shows in the sentence, and the meet-the-mark example is never used as a question.</p>
  <p>Marks move through 6 boxes, the same rules as Daily Definitions: a right first answer on a due day moves a mark up a box, a wrong one moves it down 2, and reviews come back after 1, 2, 4, 7, 14 and 30 days. ⭐ <b>Mastered</b> means box 3 or higher and right on 3 different days, at least 2 of them on choose or fix questions. 🏆 <b>Locked in</b> means box 6. No credit comes from hints, the day a mark is introduced, or the read-aloud step (self-check only, nothing is recorded).</p>
  <p>Marks unlock with the Journey and First Steps stops that teach them, and the long- and short-vowel marks unlock with Sound Code. A new group of marks opens when 75% of the group before it is in box 3 or higher. ${MODE === 'first-steps' ? '<b>First Steps readers get the starter marks only, one new mark a day.</b>' : ''}</p>
  <label class="tog"><input type="checkbox" data-act="older-box" ${S.settings.older ? 'checked' : ''}> Older / optional marks (‽ { } ⟨ ⟩ § ¶ † ‡ and accent marks)</label>
  <label class="tog"><input type="checkbox" data-act="read-box" ${S.settings.read ? 'checked' : ''}> Read every screen aloud</label>
  ${locked.length ? `<p class="small">Already taught a mark at home or school? Unlock it here:</p><div class="unlocks">${locked.map(m => `<button class="btn sm" data-act="unlock" data-id="${m.id}">${esc(showGlyph(m))} ${esc(m.name)}</button>`).join('')}</div>` : ''}
  <p class="small muted">Design based on: reading prosody research (Schwanenflugel and colleagues; Kuhn &amp; Stahl), retrieval practice (Roediger &amp; Karpicke 2006; Agarwal et al. 2021), spacing (Cepeda et al. 2006), Mayer’s multimedia principles, and item-writing guidance (Haladyna et al. 2002). These are design principles, not proof that this task works. The voice cues are rules of thumb (many “wh-” questions fall at the end). Proofreading marks are left for StoryForge.</p>
 </details></main>`;
}
function meetView(it){
 const m = BY[it.id], ex = exampleTokens(m);
 return bar('New mark') + `<main class="round">${progress()}<section class="card meet"><p class="eyebrow">NEW MARK!</p>
 <div class="hero"><span class="hero-gl" role="img" aria-label="${esc(m.pdfName.split(' (')[0])}">${esc(showGlyph(m))}</span><span class="hero-ic" aria-hidden="true">${ICON[m.id] || ''}</span></div>
 <h1 class="mname">${esc(m.name)} ${hear(`${m.name}. ${m.meaning} ${m.voice} ${m.example}`, 'Hear about this mark')}</h1><p class="muted center">${esc(m.pdfName)}</p>
 <p class="meaning">${esc(m.meaning)}</p><p class="voice">🗣️ ${esc(m.voice)}</p>
 <p class="sent ex">${ex}</p><p class="q center">${RUN.meetTapped ? '✓ You found it!' : `Tap the ${esc(m.name)} in the sentence.`}</p>
 <button class="primary big" data-act="next" ${RUN.meetTapped ? '' : 'disabled'}>Next ▸</button></section></main>`;
}
function exampleTokens(m){
 // The example has no slot: make each mark (or, for accent marks, each letter) tappable.
 const nfd = m.example.normalize('NFC'); let html = '', k = 0;
 const isT = ch => m.kind === 'accent' ? /[̀-ͯ]/.test(ch.normalize('NFD')) || ch === 'ç' : [SLOT[m.id]].flat().includes(ch) || (m.id === 'dagger' && ch === '‡');
 for (const ch of nfd) { const tap = m.kind === 'accent' ? /\p{L}/u.test(ch) : !!GLY[ch]; if (!tap) { html += esc(ch); continue; } const t = isT(ch); html += `<button class="tok tm ${RUN.meetTapped && t ? 'right' : ''}" data-act="meet-tap" data-t="${t ? 1 : 0}" aria-label="${esc(ch)}">${esc(ch)}</button>`; k++; }
 return html;
}
function itemView(){
 const q = RUN.q, m = q.m, it = q.it;
 const fixToks = q.type === 'fix' ? tokens(m, q.s, q.done ? null : q.shown) : null;
 let sent = '', prompt = '';
 if (q.type === 'choose') {
  prompt = m.kind === 'accent' ? 'Which one goes in the gap?' : 'Which mark goes in the gap?';
  sent = tokens(m, q.s).map(t => t.slot ? (q.done ? `<span class="filled">${esc(t.txt)}</span>` : `<span class="blank${m.kind === 'accent' ? ' in' : ''}" aria-label="blank">␣</span>`) : esc(t.w ?? t.mk ?? t.sp)).join('');
 } else if (q.type === 'spot') {
  prompt = `Tap the ${m.name}.`;
  sent = tokens(m, q.s).map((t, i) => t.slot || t.mk ? `<button class="tok tm ${q.done && t.slot || (q.retry && t.slot) ? 'right' : q.picked === i && !t.slot ? 'wrong' : ''}" data-act="tap" data-i="${i}" ${q.done ? 'disabled' : ''} aria-label="${esc(t.slot ? t.txt : t.mk)}">${esc(t.slot ? t.txt : t.mk)}</button>` : esc(t.w ?? t.sp)).join('');
 } else {
  prompt = q.step === 1 ? 'Fix it! One mark is wrong. Tap it.' : 'Which mark goes there?';
  sent = fixToks.map((t, i) => t.sp ? t.sp : `<button class="tok ${t.w ? 'wd' : 'tm'} ${(q.step === 2 && t.slot) ? (q.done ? 'right' : 'here') : q.tapped === i && !t.slot ? 'wrong' : ''}" data-act="tap" data-i="${i}" ${q.step === 2 ? 'disabled' : ''}>${esc(t.slot ? t.txt : t.w ?? t.mk)}</button>`).join('');
 }
 const rightPos = q.opts ? q.opts.indexOf(q.target) : -1;
 const cls = pos => { if (q.picked === null) return ''; if (pos === rightPos && (q.done || q.retry)) return 'right'; if (pos === q.picked && pos !== rightPos) return 'wrong'; return ''; };
 const showOpts = q.type === 'choose' || (q.type === 'fix' && q.step === 2);
 const opts = showOpts ? `<div class="opts gl-opts">${q.opts.map((o, pos) => `<button class="opt ${cls(pos)}" data-act="pick" data-pos="${pos}" ${q.done ? 'disabled' : ''} aria-label="${esc(optName(m, o))}"><span class="og">${esc(optLabel(m, q.s, o))}</span><span class="on">${esc(optName(m, o))}</span><span class="tag">${cls(pos) === 'right' ? '✓' : cls(pos) === 'wrong' ? '✗' : ''}</span></button>`).join('')}</div>` : '';
 const fb = q.done ? `<p class="fb ok">${q.first ? 'Yes! ' : ''}${esc(feedback(q))}${q.hinted ? ' <span class="small">(You used a hint, so this one is practice.)</span>' : ''}</p>` : q.retry ? `<p class="fb try">Not quite. ${esc(feedback(q))}<br><b>Tap the green one.</b></p>` : q.tapWrong === false && q.step === 2 ? `<p class="fb try">The wrong mark was in the green box. Now pick the right one.</p>` : '';
 const hint = q.hinted && !q.done ? `<p class="hint">💡 ${esc(hintText(q))}</p>` : '';
 const sayQ = q.type === 'choose' ? `${prompt} ${spoken(m, q.s)} ${q.opts.map(o => optSay(m, o)).join(', ')}.` : q.type === 'spot' ? `${prompt} ${plain(m, q.s)}` : prompt;
 return bar(it.practice && S.deck[m.id]?.introducedOn === S.active.date ? 'Try the new mark' : 'Quick review') + `<main class="round">${progress()}<section class="card">
 <p class="q">${esc(prompt)} ${hear(sayQ, 'Hear the question')}</p>
 <p class="sent">${sent}</p>${opts}${fb}${hint}
 <div class="row">${q.done ? `<button class="primary big" data-act="next">Next ▸</button>` : !q.hinted && q.first === null ? `<button class="btn sm" data-act="hint">💡 Hint</button>` : ''}</div></section></main>`;
}
function readView(){
 const r = RUN.read; if (!r) { next(); return ''; }
 return bar('Read it') + `<main class="round">${progress()}<section class="card"><p class="eyebrow">READ IT WITH THE RIGHT VOICE 🎙️</p>
 <p class="sent big-sent">${esc(r.text)}</p>
 <ol class="steps"><li>Read it out loud.</li><li>Tap 🔊 to hear it. ${hear(r.text, 'Hear it read')}</li><li>${esc(r.m.name)} ${esc(showGlyph(r.m))}: ${esc(r.m.voice)} Did your voice do that?</li></ol>
 <div class="row"><button class="primary" data-act="next">👍 Yes</button><button class="btn" data-act="say" data-text="${esc(r.text)}">🔁 Try again</button></div>
 <p class="small muted">Practice only, not scored, nothing recorded.</p></section></main>`;
}
function doneView(){
 const d = S.days[TODAY()] || S.days[S.active?.date] || { practised: [], right: 0, of: 0 };
 const nextDue = Object.values(S.deck).map(r => r.dueDate).filter(x => x > TODAY()).sort()[0];
 const top = Math.max(1, ...Object.keys(S.deck).map(id => BY[id]?.tier || 1)), ms = MARKS.filter(m => m.tier === top), got = ms.filter(m => ['mastered', 'locked'].includes(status(S.deck[m.id]))).length;
 return bar('Daily Symbols') + `<main class="round"><section class="card result"><div class="burst">🎉</div><h1>Done for today!</h1><p class="lead">You practised these marks today:</p><p class="gbs">${d.practised.map(id => `<span class="gb" title="${esc(BY[id].name)}">${esc(showGlyph(BY[id]))}<small>${esc(BY[id].name)}</small></span>`).join('')}</p>
 <p>${d.right} of ${d.of} right on the first try.${nextDue ? ` Next review: ${esc(fmtDay(nextDue))}.` : ''}</p><p class="small muted">Mastered so far: ${got} of ${ms.length} ${['', 'starter', 'growing', 'strong-reader', 'older'][top]} marks</p>
 <div class="row"><a class="primary" href="../?today=next#/home">Next task ▸</a><a class="btn" href="../#/home">Back to Home</a></div></section></main>`;
}
function render(){
 if (!RUN) { app.innerHTML = homeView(); return; }
 if (RUN.finished) { app.innerHTML = doneView(); return; }
 const it = cur(); app.innerHTML = it.kind === 'meet' ? meetView(it) : it.kind === 'read' ? readView() : itemView();
}
function readScreen(){
 const it = cur(); if (!it) return;
 if (it.kind === 'meet') { const m = BY[it.id]; say(`New mark! ${m.name}. ${m.meaning} ${m.voice} ${m.example} Tap the ${m.name} in the sentence.`); return; }
 if (it.kind === 'read') { if (RUN.read) say(`Read it with the right voice. ${RUN.read.text}`); return; }
 const q = RUN.q; if (!q) return;
 if (q.type === 'choose') say(`${q.m.kind === 'accent' ? 'Which one goes in the gap?' : 'Which mark goes in the gap?'} ${spoken(q.m, q.s)}`);
 else if (q.type === 'spot') say(`Tap the ${q.m.name}.`);
 else say('Fix it! One mark is wrong. Tap it.');
}

// ---------- events ----------
app.addEventListener('change', e => { const a = e.target.dataset.act;
 if (a === 'older-box') { S.settings.older = e.target.checked; persist(); render(); }
 if (a === 'read-box') { S.settings.read = e.target.checked; persist(); render(); } });
app.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled || b.tagName === 'INPUT') return; const a = b.dataset.act;
 if (a === 'say') { say(b.dataset.text, true); return; }
 if (a === 'readto') { S.settings.read = !S.settings.read; persist(); if (!S.settings.read) speechSynthesis?.cancel?.(); render(); return; }
 if (a === 'home') { e.preventDefault(); RUN = null; render(); return; }
 if (a === 'unlock') { grownUpUnlock(S, b.dataset.id); persist(); render(); return; }
 if (a === 'start') { startDay(); return; }
 if (!RUN) return;
 if (a === 'next') { next(); return; }
 if (a === 'meet-tap') { if (b.dataset.t === '1') { RUN.meetTapped = true; render(); say('Yes! You found it.'); } else { b.classList.add('wrong'); say(`That’s a different mark. Find the ${BY[cur().id].name}.`); } return; }
 if (a === 'pick') onPick(Number(b.dataset.pos));
 if (a === 'tap') onTap(Number(b.dataset.i));
 if (a === 'hint') onHint();
});
if (QS.has('test')) window.__ds = { S: () => S, RUN: () => RUN, BY, plain, tokens, opener, preview(id, sent, type){ S.active = { date: TODAY(), items: [{ kind: type === 'meet' ? 'meet' : 'item', id, sent, type, practice: true }, { kind: 'read' }], i: 0, results: [], news: [], startedAt: Date.now(), n: 0 }; RUN = { q: null }; enter(); return RUN.q && { opts: RUN.q.opts, target: RUN.q.target, shown: RUN.q.shown }; } };
syncUnlocks(); persist();
render();
if (QS.has('today') && !S.days[TODAY()]?.done && S.unlockOrder.length && (S.active?.date === TODAY() || planDay(S, MARKS, TODAY(), MODE).items.length)) startDay();
