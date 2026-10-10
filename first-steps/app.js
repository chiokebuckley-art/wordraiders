// First Steps Journey: the 1st-grade on-ramp to Sentence Decoder (handoff "WordRaiders First Steps Journey").
// Eleven stops, each adding one skill: F1 Picture Words · F2 Doing Words · F3 Who Did What? · F4 Describing Words ·
// F5 First, Then · F6 Which One? · F7 Word Endings · F8 Where Words · F9 Word Builders · F10 Tiny Story · F11 Graduation
// (= real Sentence Decoder level-1 rounds). F0 Starting Gate places a kid. Untimed, no fail states: a wrong answer gets
// Echo's hint and one retry, then the answer is shown and play goes on. Sessions are 4 items; "One more!" keeps going.
import {ITEMS} from './items.js?v=fs-1';
import {NOUNS, VERBS, pic} from './words.js?v=fs-1';
import {nextItem, shuffled} from '../sentence-decoder/engine.js?v=sd-2';
import {panel} from '../sentence-decoder/art.js?v=fs-1';
import {speak, blocked as voiceBlocked} from '../wr-voice.js?v=3';

const app = document.querySelector('#app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const QS = new URLSearchParams(location.search);

// ---------- player + save (own key per player: the main app rewrites its save with only the fields it knows) ----------
function player(){ try { const r = JSON.parse(localStorage.getItem('wordraiders.players.v1') || 'null'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Explorer' }; } catch { return { id: 'guest', name: 'Explorer' }; } }
const P = player(), KEY = `wr-firststeps.${P.id}`;
const fresh = () => ({ v: 1, gradeBand: '1', placement: null, stop: 1, cleared: [], skipped: [], bags: {}, seen: {}, review: [], attempts: [], skillAcc: {}, graduatedAt: null, f11Since: null, grown: { readAloud: false, autoplay: false }, badges: [] });
let S; try { S = { ...fresh(), ...(JSON.parse(localStorage.getItem(KEY) || 'null') || {}) }; } catch { S = fresh(); }
S.grown = { readAloud: false, autoplay: false, ...(S.grown || {}) };
function persist(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }

// ---------- the stops ----------
const STOPS = [
 null,
 { n: 1, name: 'Picture Words', skill: 'Naming words', icon: '🧸' },
 { n: 2, name: 'Doing Words', skill: 'Doing words', icon: '🏃' },
 { n: 3, name: 'Who Did What?', skill: 'What a sentence means', icon: '👀' },
 { n: 4, name: 'Describing Words', skill: 'Describing words', icon: '🎨' },
 { n: 5, name: 'First, Then', skill: 'Pictures in order', icon: '➡️' },
 { n: 6, name: 'Which One?', skill: 'Word meaning in a sentence', icon: '🤔' },
 { n: 7, name: 'Word Endings', skill: 'Endings -s, -ed, -ing', icon: '✂️' },
 { n: 8, name: 'Where Words', skill: 'Where words', icon: '📍' },
 { n: 9, name: 'Word Builders', skill: 'un-, re-, -er, -est, -ful', icon: '🧱' },
 { n: 10, name: 'Tiny Story', skill: 'A 2–3 sentence story', icon: '📖' },
 { n: 11, name: 'Graduation', skill: 'A real Sentence Decoder round', icon: '🎓' },
];
const JOB = {
 naming: { label: 'Naming word', icon: '🧸', color: '#2f6fc4', term: 'noun', say: 'A naming word names a person, animal, place or thing.' },
 doing: { label: 'Doing word', icon: '🏃', color: '#c8641c', term: 'verb', say: 'A doing word is something you can do.' },
 describing: { label: 'Describing word', icon: '🎨', color: '#2e8a52', term: 'adjective', say: 'A describing word tells more about a naming word: what kind, what color, how many.' },
 where: { label: 'Where word', icon: '📍', color: '#7e57c2', term: 'preposition', say: 'A where word tells where: in, on, under, up.' },
 how: { label: 'How word', icon: '⚡', color: '#14868f', term: 'adverb', say: 'A how word tells how something happens: fast, slowly. Bonus!' },
 helper: { label: 'Helper word', icon: '🔗', color: '#7a8a93', term: '', say: 'A helper word helps the sentence. It is already done for you.' },
};
const jobsAt = n => ['naming', 'doing', ...(n >= 4 ? ['describing'] : []), ...(n >= 8 ? ['where'] : [])];
const ADDS = { '-s': ['more than one'], '-ed': ['already happened'], '-ing': ['happening now'], '-er': ['more'], '-est': ['the most'], '-ful': ['full of'], 'un-': ['not', 'undo'], 're-': ['again'] };
const ADD_ICON = { 'more than one': '🐱🐱', 'already happened': '✅', 'happening now': '▶️', more: '⬆️', 'the most': '🏆', 'full of': '🫙', not: '🚫', undo: '↩️', again: '🔁' };
const SESSION = 4;

// Items: F1/F2 single words built from the word lists; F3–F10 authored sentence items (validated offline).
const WORD_ITEMS = [...NOUNS.map(w => ({ id: 'w1-' + w, level: 1, word: w, job: 'naming' })), ...NOUNS.map(w => ({ id: 'w2n-' + w, level: 2, word: w, job: 'naming' })), ...VERBS.map(w => ({ id: 'w2v-' + w, level: 2, word: w, job: 'doing' }))];
const POOL = [...WORD_ITEMS, ...ITEMS.map(i => ({ ...i, level: i.stop }))];
const countAt = n => POOL.filter(i => i.level === n).length;

// ---------- speech: Hear it (honours the app's mute), words light up as they are read ----------
const muted = () => !!voiceBlocked();
let lightT = [];
function say(text, light){
 lightT.forEach(clearTimeout); lightT = []; document.querySelectorAll('.lit').forEach(e => e.classList.remove('lit'));
 if (muted()) { flash(voiceBlocked() + ' A grown-up can read it aloud.'); return; }
 const u = { };   // handlers are attached below, then handed to the shared voice
 if (light && light.length) {
  // Light each word as it is read: boundary events when the voice sends them, a steady timer otherwise.
  let got = false; const starts = []; let at = 0; light.forEach(w => { const i = text.indexOf(w.t, at); starts.push(i); at = i + w.t.length; });
  const on = k => { document.querySelectorAll('.lit').forEach(e => e.classList.remove('lit')); const el = document.querySelector(`[data-key="${light[k]?.key}"]`); if (el) el.classList.add('lit'); };
  u.onboundary = e => { if (e.name && e.name !== 'word') return; got = true; let k = 0; starts.forEach((s, i) => { if (s <= e.charIndex) k = i; }); on(k); };
  u.onstart = () => { lightT.push(setTimeout(() => { if (!got) light.forEach((_, k) => lightT.push(setTimeout(() => on(k), k * 420))); }, 250)); };
  u.onend = () => setTimeout(() => document.querySelectorAll('.lit').forEach(e => e.classList.remove('lit')), 300);
 }
 speak(text, { onboundary: u.onboundary, onstart: u.onstart, onend: u.onend });
}
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); if (!el) return; el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 4000); }
const hearBtn = (text, label = 'Hear it') => `<button class="hear-btn" data-act="say" data-text="${esc(text)}" aria-label="${esc(label)}">🔊</button>`;
// Grown-up read-aloud line: shown in grown-up mode, or whenever sound is off.
const aloud = text => (S.grown.readAloud || muted()) ? `<p class="aloud">📣 Read this aloud: “${esc(text)}”</p>` : '';
const echo = (text, hear = true) => `<div class="echo"><span class="echo-face" aria-hidden="true">✨</span><p><b>Echo:</b> ${esc(text)}</p>${hear ? hearBtn(text, 'Hear Echo') : ''}</div>`;

// ---------- round state ----------
let R = null;      // the current round
let SES = null;    // { stop, done, gate? }
const allTokens = it => (it.sentences || []).flatMap((s, si) => s.tokens.map((t, ti) => ({ ...t, key: si + ':' + ti, si })));
const sentenceText = it => it.sentences.map(s => s.text).join(' ');

function startSession(stop){ SES = { stop, done: 0 }; nextRound(); }
function nextRound(){
 if (SES.stop === 11) { R = null; render(); return; }
 const item = SES.gate ? SES.gate.queue[SES.gate.i] : nextItem(S, POOL, SES.stop);
 const stop = SES.gate ? item?.level : SES.stop;   // warm-up rounds play by the rules of the stop they come from
 persist();
 if (!item) { R = null; SES = null; render(); return; }
 const word = !!item.word, toks = word ? [] : allTokens(item);
 const steps = word ? ['pick', 'sort'] : ['jobs', ...(item.sense && stop >= 6 ? ['sense'] : []), ...(stop >= 7 ? ['endings'] : []), 'meaning', ...((item.panels || []).length ? ['order'] : [])];
 R = { item, stop, toks, steps, si: 0, first: {}, tries: {}, msg: '', reveal: false, tagged: {}, focus: null, picked: null, ends: toks.filter(t => t.ending).map(t => t.key), endI: 0, endStep: 'find', mark: null, choices: null, placed: {}, sel: null, tiles: null, gateMode: !!SES.gate };
 if (SES.gate) { R.steps = SES.gate.steps[SES.gate.i]; }
 R.focus = toks.find(t => t.job !== 'helper' && t.job !== 'how')?.key || null;
 render();
 if (autoPlay()) setTimeout(() => playItem(), 350);
}
const autoPlay = () => R && (R.stop <= 5 || S.grown.autoplay);
function playItem(){ if (!R) return; if (R.item.word) say(R.item.word); else say(sentenceText(R.item), R.toks); }
const step = () => R.steps[R.si];
// First-try bookkeeping: the first answer at each step decides the "first try" mark used for mastery.
function firstTry(stepKey, ok){ if (!(stepKey in R.first)) R.first[stepKey] = ok; else if (!ok) R.first[stepKey] = false; }
function miss(where){ R.tries[where] = (R.tries[where] || 0) + 1; return R.tries[where]; }
function tally(skill, ok){ const r = S.skillAcc[skill] || (S.skillAcc[skill] = { right: 0, tries: 0 }); r.tries++; if (ok) r.right++; }
function nextStep(){ R.si++; R.msg = ''; R.reveal = false; R.picked = null; R.choices = null; if (R.si >= R.steps.length) finishRound(); }

// ---------- what counts for mastery at each stop (handoff §7) ----------
function keyOk(r){
 const f = r.first, n = r.stop;
 if (n === 1) return f.pick !== false;
 if (n === 2) return f.sort !== false;
 if (n === 3) return f.meaning !== false;
 if (n === 4) return f.describing !== false && f.meaning !== false;
 if (n === 5) return f.order !== false;
 if (n === 6) return f.sense !== false;
 if (n === 7) return r.ends.length ? f.endings !== false : f.endings !== false;
 if (n === 8) return f.where !== false && f.order !== false;
 if (n === 9) return f.endings !== false;
 if (n === 10) return f.meaning !== false && f.order !== false;
 return true;
}
function finishRound(){
 const ok = keyOk(R), stop = R.stop;
 if (R.gateMode) { SES.gate.results.push(ok); SES.gate.i++; R.result = { ok }; if (SES.gate.i >= SES.gate.queue.length) { endGate(); return; } nextRound(); return; }
 S.attempts.push({ id: R.item.id, stop, at: Date.now(), first: R.first, ok });
 if (S.attempts.length > 80) S.attempts.splice(0, S.attempts.length - 80);
 S.review = S.review.filter(id => id !== R.item.id); if (!ok) S.review.push(R.item.id);
 addXp(ok ? 6 : 3);
 // Mastery: first try right in 4 of the last 5 at this stop (F2 also needs 2 doing words among them).
 const recent = S.attempts.filter(a => a.stop === stop).slice(-5);
 let cleared = null;
 const okCount = recent.filter(a => a.ok).length, verbs = recent.filter(a => /^w2v-/.test(a.id)).length;
 if (!S.cleared.includes(stop) && recent.length >= 5 && okCount >= 4 && (stop !== 2 || verbs >= 2)) {
  S.cleared.push(stop); S.skipped = S.skipped.filter(x => x !== stop); cleared = stop; addXp(20);
  if (S.stop === stop) S.stop = Math.min(11, stop + 1);
 }
 const struggling = recent.length >= 3 && recent.slice(-3).every(a => !a.ok) && stop > 1;
 SES.done++; R.result = { ok, cleared, struggling }; R.si = R.steps.length; persist(); render();
}

// ---------- Starting Gate (F0) ----------
function startGate(){
 const pickFrom = (n, k, f = () => true) => shuffled(POOL.filter(i => i.level === n && f(i))).slice(0, k);
 const groups = [
  { stop: 2, items: [...pickFrom(2, 1, i => i.job === 'naming'), ...pickFrom(2, 1, i => i.job === 'doing')], steps: () => ['pick', 'sort'] },
  { stop: 4, items: pickFrom(4, 2), steps: () => ['jobs', 'meaning'] },
  { stop: 5, items: pickFrom(5, 2), steps: () => ['order'] },
  { stop: 7, items: pickFrom(7, 1, i => i.sentences.some(s => s.tokens.some(t => t.ending))), steps: () => ['endings'] },
 ].filter(g => g.items.length);
 const queue = [], steps = [], groupOf = [];
 groups.forEach((g, gi) => g.items.forEach(it => { queue.push(it); steps.push(g.steps()); groupOf.push(gi); }));
 SES = { stop: 0, done: 0, gate: { queue, steps, groupOf, groups, i: 0, results: [] } };
 nextRound();
}
function endGate(){
 const g = SES.gate; let start = 6;
 for (let gi = 0; gi < g.groups.length; gi++) { const res = g.results.filter((_, i) => g.groupOf[i] === gi); if (res.length && res.every(x => !x)) { start = g.groups[gi].stop === 2 ? 1 : g.groups[gi].stop; break; } }
 S.placement = { doneAt: new Date().toISOString(), startStop: start, skipped: Array.from({ length: start - 1 }, (_, i) => i + 1) };
 S.skipped = [...new Set([...S.skipped, ...S.placement.skipped.filter(n => !S.cleared.includes(n))])];
 S.stop = Math.max(S.stop, start); persist();
 SES = null; R = null; GATE_DONE = start; render();
}
let GATE_DONE = 0;

// ---------- views ----------
function bar(title){ return `<div class="bar"><a href="${R || SES ? '#' : '../?journey'}" data-act="${R || SES ? 'map' : ''}" class="back">${R || SES ? '← Map' : '← WordRaiders'}</a><span class="title">${esc(title)}</span><span class="count">${esc(P.name)}</span></div>`; }
function stopState(n){ return S.cleared.includes(n) ? 'cleared' : n === S.stop ? 'current' : S.skipped.includes(n) ? 'skipped' : n < S.stop ? 'open' : 'locked'; }

function mapView(){
 const gate = !S.placement && !S.attempts.length && !S.cleared.length;
 const stops = STOPS.slice(1).map(s => { const st = stopState(s.n), open = st !== 'locked'; const badge = { cleared: '✅', current: '⭐', skipped: '⤼', open: '', locked: '🔒' }[st];
  return `<li class="stop ${st}"><button data-act="stop" data-n="${s.n}" ${open ? '' : 'disabled'}><span class="sicon" aria-hidden="true">${s.icon}</span><span class="stext"><b>F${s.n} · ${esc(s.name)}</b><small>${esc(s.skill)}${st === 'skipped' ? ' · skipped (open for practice)' : st === 'cleared' ? ' · cleared — play again for practice' : ''}</small></span><span class="sbadge">${badge}</span></button></li>`; }).join('');
 const grad = S.graduatedAt ? `<div class="grad-done">🎓 Graduated! <a href="../sentence-decoder/">Sentence Decoder</a> is open.</div>` : '';
 return bar('First Steps') + `<main>
 <p class="eyebrow">YOUR FIRST STEPS JOURNEY</p><h1>First Steps</h1>
 ${echo(GATE_DONE ? `Great warm-up! Let’s start at F${GATE_DONE}: ${STOPS[GATE_DONE].name}.` : gate ? 'Hi! I’m Echo. Let’s play a quick warm-up game, so we know where to start.' : `Next stop: F${S.stop} · ${STOPS[S.stop].name}. Tap it to play!`)}
 ${gate ? `<div class="gate"><button class="primary big" data-act="gate">▶ Warm-up game</button><button class="btn" data-act="skipgate">Start at F1 instead</button></div>` : `<button class="primary big" data-act="stop" data-n="${S.stop}">▶ Play F${S.stop} · ${esc(STOPS[S.stop].name)}</button>`}
 ${grad}
 <ol class="path">${stops}</ol>
 ${grownView()}
 </main>`;
}
function grownView(){
 const opts = STOPS.slice(1).map(s => `<option value="${s.n}" ${s.n === S.stop ? 'selected' : ''}>F${s.n} · ${esc(s.name)}</option>`).join('');
 return `<details class="about"><summary>For grown-ups</summary>
 <label class="tog"><input type="checkbox" data-act="g-read" ${S.grown.readAloud ? 'checked' : ''}> Show “Read this aloud” lines (for reading together or when sound is off)</label>
 <label class="tog"><input type="checkbox" data-act="g-auto" ${S.grown.autoplay ? 'checked' : ''}> Auto-play sentences at every stop (normally only F1–F5)</label>
 <label class="tog">Choose a stop: <select data-act="g-stop">${opts}</select></label>
 <p class="small muted">Earlier stops you skip stay open for practice. ${S.placement ? `Warm-up placed this player at F${S.placement.startStop}.` : ''} <button class="linkish" data-act="gate">Run the warm-up again</button></p>
 <p class="small">First Steps teaches the same five skills as Sentence Decoder, scaled down for about age 6–7: word jobs with kid labels first (Naming, Doing, Describing, then Where), word meaning in context with two pictures, endings (-s, -ed, -ing) before the front parts un- and re-, “what does it mean?” with pictures, and pictures in order. Every word, sentence and choice can be heard. Each stop adds one new skill; a stop is cleared after getting it right first time in 4 of the last 5. No timer and no fail screens: a wrong answer gets a hint and one retry, then the answer is shown. F11 is a real Sentence Decoder level-1 round.</p>
 <p class="small muted">Based on: Common Core ELA Grade 1 (L.1.1, L.1.4, L.1.5, RF.1, RL.1); the Simple View of Reading (listening comprehension runs ahead of decoding at this age); decodable-text guidance (pictures show meaning, not a way to guess words); and the IES Foundational Skills practice guide (word parts like -s, -ed, -ing, -est; “listen to a sentence and choose the picture”).</p>
 </details>`;
}

function sentenceCard(mark, opts = {}){
 const it = R.item;
 return `<section class="sentence-card ${opts.big ? 'big' : ''}">${it.sentences.map((s, si) => `<p class="sc-text">${s.tokens.map((t, ti) => mark(R.toks.find(x => x.key === si + ':' + ti))).join(' ')}</p>`).join('')}<button class="hear" data-act="play" aria-label="Hear the sentence">🔊</button></section>`;
}
const plainWord = t => `<span class="w plain" data-key="${t.key}">${esc(t.t)}</span>`;
function stepsBar(){
 const names = { pick: 'Picture', sort: 'Sort', jobs: 'Word jobs', sense: 'Which one?', endings: 'Endings', meaning: 'What it means', order: 'In order' };
 return `<ol class="stages">${R.steps.map((s, i) => `<li class="${i === R.si ? 'on' : i < R.si ? 'past' : ''}">${names[s]}</li>`).join('')}</ol>`;
}

// F1/F2: hear a word, tap its picture, then sort it into a job basket.
function pickView(){
 const it = R.item;
 if (!R.choices) { const pool = it.job === 'naming' ? NOUNS : VERBS; const other = shuffled(pool.filter(w => w !== it.word))[0]; R.choices = shuffled([it.word, other]); }
 return stepsBar() + `<section class="ask"><div class="wordbox"><button class="hear-big" data-act="play" aria-label="Hear the word">🔊</button><span class="the-word">${esc(it.word)}</span></div>
 ${aloud(`Say the word “${it.word}”. Which picture shows ${it.word}?`)}<p class="q">Which picture shows <b>${esc(it.word)}</b>?</p>
 <div class="pics two">${R.choices.map((w, i) => `<button class="pic ${R.reveal && w === it.word ? 'right' : ''}" data-act="pickw" data-i="${i}" ${R.picked?.includes(i) ? 'disabled' : ''}><img src="${pic(w, it.job)}" alt="${R.reveal || S.grown.readAloud ? esc(w) : 'a picture'}" width="200" height="200" loading="eager"></button>`).join('')}</div>
 ${R.msg ? echo(R.msg) : ''}${R.reveal ? `<button class="primary" data-act="next">Next ▸</button>` : ''}</section>`;
}
function onPickW(i){
 const it = R.item, ok = R.choices[i] === it.word; firstTry('pick', ok); tally('pictures', ok);
 if (ok) { R.reveal = true; R.msg = `Yes! That’s ${it.word}.`; say(it.word); return; }
 R.picked = [...(R.picked || []), i];
 if (miss('pick') === 1) { R.msg = `That’s ${R.choices[i]}. Listen again: ${it.word}.`; say(it.word); return; }
 R.reveal = true; R.msg = `This one is ${it.word}.`;
}
function sortView(){
 const it = R.item, jobs = R.stop === 1 ? ['naming'] : ['naming', 'doing'];
 return stepsBar() + `<section class="ask"><div class="wordcard"><img src="${pic(it.word, it.job)}" alt="" width="120" height="120"><span class="the-word">${esc(it.word)}</span>${hearBtn(it.word)}</div>
 ${aloud(R.stop === 1 ? `Put “${it.word}” in the Naming word basket.` : `Is “${it.word}” a naming word or a doing word?`)}<p class="q">${R.stop === 1 ? 'Put it in the Naming word basket.' : 'Which basket does it go in?'}</p>
 <div class="baskets">${jobs.map(j => `<button class="basket ${R.reveal && j === it.job ? 'right' : ''} ${R.hintJob === j ? 'pulse' : ''}" data-act="sortw" data-j="${j}" style="--c:${JOB[j].color}" ${R.reveal ? 'disabled' : ''}><span aria-hidden="true">🧺${JOB[j].icon}</span><b>${JOB[j].label}</b></button>`).join('')}</div>
 ${R.msg ? echo(R.msg) : ''}${R.reveal ? `<button class="primary" data-act="next">Next ▸</button>` : ''}</section>`;
}
function onSortW(j){
 const it = R.item, ok = j === it.job; firstTry('sort', ok); tally(it.job, ok);
 if (ok) { R.reveal = true; R.hintJob = null; R.msg = it.job === 'naming' ? `Yes! ${JOB.naming.say}` : `Yes! Can you ${it.word}? Then it’s a doing word!`; return; }
 R.hintJob = it.job;
 if (miss('sort') === 1) { R.msg = it.job === 'doing' ? `Can you ${it.word}? Then it’s a doing word!` : `Can you point to a ${it.word}? ${JOB.naming.say}`; return; }
 R.reveal = true; R.msg = `“${it.word}” is a ${JOB[it.job].label.toLowerCase()}.`;
}

// Word jobs: tap each key word, pick its job (kid label; real term small from F7). Helper words are done for you.
function jobChip(t){
 const j = R.tagged[t.key];
 if (t.job === 'helper') return `<button class="w small" data-act="helper" data-key="${t.key}">${esc(t.t)}</button>`;
 if (t.job === 'how') return `<button class="w tag how" data-act="helper" data-key="${t.key}" style="--c:${JOB.how.color}">${esc(t.t)}<small>${JOB.how.icon} how · bonus</small></button>`;
 const term = R.stop >= 7 && j ? `<i>${JOB[j].term}</i>` : '';
 return `<button class="w key ${j ? 'done tag' : ''} ${R.focus === t.key ? 'focus' : ''}" data-act="word" data-key="${t.key}" ${j ? `style="--c:${JOB[j].color}"` : ''}>${esc(t.t)}${j ? `<small>${JOB[j].icon} ${JOB[j].label.replace(' word', '')}</small>${term}` : ''}</button>`;
}
function jobsView(){
 const left = R.toks.filter(t => !['helper', 'how'].includes(t.job) && !R.tagged[t.key]), f = R.toks.find(t => t.key === R.focus);
 const jobs = jobsAt(R.stop);
 const btns = f && !R.tagged[f.key] ? `<p class="q">What job does <b>${esc(f.t)}</b> do?</p><div class="jobs">${jobs.map(j => `<button class="job ${R.hintJob === j ? 'pulse' : ''}" data-act="job" data-j="${j}" style="--c:${JOB[j].color}" ${(R.wrongJobs || []).includes(j) ? 'disabled' : ''}><span aria-hidden="true">${JOB[j].icon}</span>${JOB[j].label}${R.stop >= 7 ? `<small>${JOB[j].term}</small>` : ''}</button>`).join('')}</div>` : '';
 return stepsBar() + sentenceCard(jobChip, { big: true }) + `<section class="ask">${aloud(f && !R.tagged[f.key] ? `What job does “${f.t}” do in “${sentenceText(R.item)}”?` : sentenceText(R.item))}
 ${left.length ? `<p class="muted small">Tap a word with a solid box. Grey words are helper words, already done. ${left.length} to go.</p>` : ''}${btns}
 ${R.msg ? echo(R.msg) : ''}${!left.length ? `<button class="primary" data-act="next">Next ▸</button>` : ''}</section>`;
}
function setFocus(key){ R.focus = key; R.msg = ''; R.hintJob = null; R.wrongJobs = []; const t = R.toks.find(x => x.key === key); if (t) say(t.t); }
function onJob(j){
 const t = R.toks.find(x => x.key === R.focus); if (!t) return; const ok = j === t.job; const sk = 'job:' + t.key;
 tally(t.job, !(sk in R.tries) && ok); if (!ok || !(sk in R.tries)) firstTry('jobs', ok);
 if (t.job === 'describing') firstTry('describing', ok || (sk in R.tries) ? ok && !(sk in R.tries) : false);
 if (t.job === 'where') firstTry('where', ok && !(sk in R.tries));
 if (ok) { R.tagged[t.key] = j; R.msg = ''; R.hintJob = null; R.wrongJobs = []; advanceFocus(); return; }
 R.wrongJobs = [...(R.wrongJobs || []), j];
 if (miss(sk) === 1) { R.hintJob = t.job; R.msg = jobHint(t); if (t.job === 'describing') R.first.describing = false; if (t.job === 'where') R.first.where = false; return; }
 R.tagged[t.key] = t.job; R.msg = `“${t.t}” is a ${JOB[t.job].label.toLowerCase()}. ${JOB[t.job].say}`; R.hintJob = null; R.wrongJobs = []; advanceFocus(true);
}
function jobHint(t){ const w = t.t.toLowerCase();
 return t.job === 'doing' ? `Can you ${w.replace(/(s|ed|ing)$/, '')}? Then it’s a doing word!` : t.job === 'naming' ? `Can you point to it? ${JOB.naming.say}` : t.job === 'describing' ? `Does “${w}” tell us more about a naming word? Then it’s a describing word.` : `Does “${w}” tell where? Then it’s a where word.`; }
function advanceFocus(keepMsg){ const nx = R.toks.find(t => !['helper', 'how'].includes(t.job) && !R.tagged[t.key]); R.focus = nx ? nx.key : null; if (!keepMsg) R.msg = ''; }
function onHelper(key){ const t = R.toks.find(x => x.key === key); if (!t) return; say(t.t);
 if (t.job === 'how') { flash(`“${t.t}” is a how word: it tells how. Bonus!`); return; }
 const pro = /^(it|he|she|they|him|her|them)$/i.test(t.t); const back = pro && t.si > 0 ? R.toks.find(x => x.si < t.si && x.job === 'naming') : null;
 flash(pro ? `“${t.t}” is a helper word. ${back ? `Here it means the ${back.t}.` : 'It stands for someone.'}` : `“${t.t}” is a helper word. It helps the sentence.`); }

// F6+: which meaning fits this sentence (2 pictures).
function senseView(){
 const s = R.item.sense; if (!R.choices) R.choices = shuffled([{ right: true, panel: s.right, label: s.rightLabel }, { right: false, panel: s.foil, label: s.foilLabel }]);
 const glow = t => t.t.toLowerCase().replace(/[^a-z]/g, '') === s.word.toLowerCase() ? `<span class="w glow" data-key="${t.key}">${esc(t.t)}</span>` : plainWord(t);
 return stepsBar() + sentenceCard(glow) + `<section class="ask">${aloud(`Which ${s.word} is in this sentence: ${s.rightLabel}, or ${s.foilLabel}?`)}<p class="q">Which <b>${esc(s.word)}</b> fits this sentence?</p>
 <div class="pics two">${R.choices.map((c, i) => `<div class="pchoice"><button class="pic ${R.reveal && c.right ? 'right' : ''}" data-act="sense" data-i="${i}" ${R.picked?.includes(i) || R.reveal ? 'disabled' : ''} aria-label="${esc(c.label)}">${panel(c.panel, { size: 200, label: c.panel.alt })}</button><span class="plabel">${esc(c.label)} ${hearBtn(`${s.word}: ${c.label}`)}</span></div>`).join('')}</div>
 ${R.msg ? echo(R.msg) : ''}${R.reveal ? `<button class="primary" data-act="next">Next ▸</button>` : ''}</section>`;
}
function onSense(i){ const c = R.choices[i], s = R.item.sense; firstTry('sense', c.right); tally('sense', c.right && !R.tries.sense);
 if (c.right) { R.reveal = true; R.msg = `Yes! Here ${s.word} means ${s.rightLabel}.`; return; }
 R.picked = [...(R.picked || []), i];
 if (miss('sense') === 1) { R.msg = s.hint; return; }
 R.reveal = true; R.msg = `Here ${s.word} means ${s.rightLabel}. ${s.hint}`; }

// F7+: endings. Find the word with an ending (or say there is none), tap where it splits, pick what it adds; the picture changes.
function endingsView(){
 const ends = R.ends, t = ends.length ? R.toks.find(x => x.key === ends[R.endI]) : null;
 if (R.endStep === 'find') {
  const found = new Set(ends.slice(0, R.endI));
  const chip = x => `<button class="w key ${found.has(x.key) ? 'done tag' : ''}" data-act="endword" data-key="${x.key}" style="--c:#7e57c2">${esc(x.t)}</button>`;
  return stepsBar() + sentenceCard(chip) + `<section class="ask">${aloud('Does a word have an ending? Tap it.')}<p class="q">${R.endI ? 'Is there another word with an ending or a front part?' : 'Does a word have an ending? Tap it.'}</p>
  <p class="muted small">Endings: -s, -ed, -ing${R.stop >= 9 ? ', -er, -est, -ful. Front parts: un-, re-' : ''}.</p><button class="btn" data-act="noend">${R.endI ? 'No more' : 'No ending'}</button>${R.msg ? echo(R.msg) : ''}${R.reveal ? `<button class="primary" data-act="next">Next ▸</button>` : ''}</section>`;
 }
 const e = t.ending, letters = [...t.t];
 if (R.endStep === 'split') {
  return stepsBar() + sentenceCard(plainWord) + `<section class="ask">${aloud(`Where does “${t.t}” split? Tap the gap.`)}<p class="q">Where does <b>${esc(t.t)}</b> split? Tap the gap.</p>
  <div class="split">${letters.map((c, i) => `<span class="ltr">${esc(c)}</span>${i < letters.length - 1 ? `<button class="gap ${R.mark === i + 1 ? 'on' : ''}" data-act="gap" data-i="${i + 1}" aria-label="split after ${esc(letters.slice(0, i + 1).join(''))}">${R.mark === i + 1 ? '|' : ''}</button>` : ''}`).join('')}</div>
  ${R.msg ? echo(R.msg) : ''}</section>`;
 }
 // what it adds
 if (!R.choices) { const right = e.adds; const others = Object.values(ADDS).flat().filter(a => a !== right); const foil = (e.part === 'un-' ? (right === 'not' ? 'undo' : 'not') : e.part === '-ing' ? 'already happened' : e.part === '-ed' ? 'happening now' : shuffled(others)[0]); R.choices = shuffled([right, foil]); }
 const piece = e.part.replace('-', ''), base = e.part.endsWith('-') ? e.split[1] : e.split[0];
 const change = R.reveal ? `<div class="change">${panel(t.pic, { size: 140, label: t.pic.alt })}<span class="arr">→</span>${panel(t.picEnd, { size: 140, label: t.picEnd.alt })}</div><p class="center"><b>${esc(base)}</b> → <b>${esc(t.t)}</b> ${hearBtn(`${base}. ${t.t}.`)}</p>` : `<div class="change">${panel(t.pic, { size: 140, label: t.pic.alt })}<span class="arr">→</span><span class="qbox">?</span></div>`;
 return stepsBar() + sentenceCard(plainWord) + `<section class="ask"><div class="split done">${e.part.endsWith('-') ? `<b class="pc">${esc(e.split[0])}</b>|${esc(e.split[1])}` : `${esc(e.split[0])}|<b class="pc">${esc(e.split[1])}</b>`}</div>
 ${aloud(`What does ${piece} add to ${base}?`)}<p class="q">What does <b>${esc(e.part)}</b> add?</p>${change}
 <div class="choices">${R.choices.map((c, i) => `<button class="${R.reveal && c === e.adds ? 'right' : ''}" data-act="adds" data-i="${i}" ${R.picked?.includes(i) || R.reveal ? 'disabled' : ''}><span aria-hidden="true">${ADD_ICON[c] || ''}</span> ${esc(c)}</button>`).join('')}</div>
 ${R.msg ? echo(R.msg) : ''}${R.reveal ? `<button class="primary" data-act="nextend">Next ▸</button>` : ''}</section>`;
}
function onEndWord(key){
 const t = R.toks.find(x => x.key === key), want = R.ends[R.endI];
 if (R.ends.slice(0, R.endI).includes(key)) { flash('You found that one already.'); return; }
 if (key === want || (R.ends.includes(key) && !R.ends.slice(0, R.endI).includes(key))) { firstTry('endings', true); if (key !== want) { const i = R.ends.indexOf(key); R.ends.splice(i, 1); R.ends.splice(R.endI, 0, key); } R.endStep = 'split'; R.mark = null; R.msg = ''; say(t.t); return; }
 firstTry('endings', false); say(t.t);
 const special = /^(ran|sat|saw|got|hid|ate|fed|dug|met|hit|cut|put|ran|swam|sang|rang|fell|went|came|said|was|were|had|did|made|took|gave|sank|slid|spun|led|fled|bit|shut|set|let|won|sold|told|held|stood|drank|slept|kept|felt|left|lost|fit)$/i.test(t.t);
 R.msg = special ? `“${t.t}” is a special “already happened” word. No ending to split!` : R.ends.length ? `“${t.t}” has no ending to split. Look again!` : `“${t.t}” has no ending. Is there any word with an ending?`;
 if (miss('endfind') >= 2 && R.ends.length) { const w = R.toks.find(x => x.key === R.ends[R.endI]); R.msg += ` Try “${w.t}”.`; }
}
function onNoEnd(){
 if (R.endI >= R.ends.length) { if (!R.ends.length) firstTry('endings', true); R.msg = R.ends.length ? 'All done!' : 'Right! No word here has an ending to split.'; R.reveal = true; return; }
 firstTry('endings', false); R.msg = miss('noend') === 1 ? 'Look again. One word has an ending!' : `“${R.toks.find(x => x.key === R.ends[R.endI]).t}” has one. Tap it!`;
}
function onGap(i){
 const t = R.toks.find(x => x.key === R.ends[R.endI]), right = t.ending.split[0].length; R.mark = i;
 if (i === right) { if (!R.tries['split' + R.endI]) firstTry('endings', true); R.endStep = 'adds'; R.msg = ''; R.choices = null; R.picked = null; return; }
 firstTry('endings', false);
 if (miss('split' + R.endI) === 1) { R.msg = t.ending.part.endsWith('-') ? `Find the front part ${t.ending.part}. Where does it stop?` : `Find the base word ${t.ending.split[0]}. Where does it stop?`; return; }
 R.mark = right; R.msg = `It splits here: ${t.ending.split.join(' | ')}.`; R.endStep = 'adds'; R.choices = null;
}
function onAdds(i){
 const t = R.toks.find(x => x.key === R.ends[R.endI]), e = t.ending, c = R.choices[i], ok = c === e.adds;
 firstTry('endings', ok); tally('end' + e.part, ok && !R.tries['adds' + R.endI]);
 if (ok) { R.reveal = true; R.msg = `Yes! ${e.part} means ${e.adds}.`; say(`${e.part.endsWith('-') ? e.split[1] : e.split[0]}. ${t.t}.`); return; }
 R.picked = [...(R.picked || []), i];
 if (miss('adds' + R.endI) === 1) { R.msg = e.part === '-s' ? 'Look at the picture. How many are there?' : e.part === '-ing' ? 'Is it happening right now?' : e.part === '-ed' ? 'Is it done already?' : 'Look at how the picture changes.'; return; }
 R.reveal = true; R.msg = `${e.part} means ${e.adds}.`;
}
function nextEnd(){ R.endI++; R.endStep = 'find'; R.mark = null; R.reveal = false; R.msg = ''; R.choices = null; R.picked = null; if (R.endI >= R.ends.length) { nextStep(); } }

// What does it mean? Pictures (F3–F9) or short text choices with a picture (F10).
function meaningView(){
 const m = R.item.meaning, text = R.stop === 10;
 if (!R.choices) R.choices = shuffled([{ right: true, panel: text ? m.correct.panel : m.correct, text: text ? m.correct.text : '' }, ...m.traps.map(t => ({ right: false, panel: t.panel, text: t.text || '', hint: t.hint }))]);
 const n = R.choices.length;
 return stepsBar() + sentenceCard(plainWord) + `<section class="ask">${aloud(text ? 'What happened? Pick the best one.' : 'Which picture shows the sentence?')}<p class="q">${text ? 'What happened?' : R.stop === 3 ? 'Who did what? Which picture shows it?' : 'Which picture shows it?'}</p>
 <div class="pics ${n === 2 ? 'two' : 'three'} ${text ? 'text' : ''}">${R.choices.map((c, i) => `<div class="pchoice"><button class="pic ${R.reveal && c.right ? 'right' : ''}" data-act="mean" data-i="${i}" ${R.picked?.includes(i) || R.reveal ? 'disabled' : ''} aria-label="${esc(text ? c.text : c.panel.alt)}">${panel(c.panel, { size: text ? 120 : n === 2 ? 200 : 150, label: c.panel.alt })}${text ? `<span class="ctext">${esc(c.text)}</span>` : ''}</button>${text ? hearBtn(c.text) : ''}</div>`).join('')}</div>
 ${R.msg ? echo(R.msg) : ''}${R.reveal ? `<button class="primary" data-act="next">Next ▸</button>` : ''}</section>`;
}
function onMean(i){ const c = R.choices[i]; firstTry('meaning', c.right); tally('meaning', c.right && !R.tries.meaning);
 if (c.right) { R.reveal = true; R.msg = 'Yes! That’s what it means.'; return; }
 R.picked = [...(R.picked || []), i];
 if (miss('meaning') === 1) { R.msg = c.hint || 'Look again at the sentence.'; return; }
 R.reveal = true; R.msg = 'This one shows it. ' + (c.hint || ''); }

// Pictures in order (F5+): First / Then (/ Last); F10 also throws one wrong panel out.
function orderView(){
 const it = R.item, n = it.panels.length, bin = !!it.distractor && R.stop === 10;
 if (!R.tiles) R.tiles = shuffled([...it.panels.map((p, i) => ({ id: 'p' + i, spec: p })), ...(bin ? [{ id: 'x', spec: it.distractor }] : [])]);
 const names = n === 2 ? ['First', 'Then'] : n === 3 ? ['First', 'Next', 'Last'] : ['1', '2', '3', '4'];
 const at = Object.fromEntries(Object.entries(R.placed).map(([s, id]) => [id, s]));
 const tile = t => `<button class="tile ${R.sel === t.id ? 'sel' : ''}" data-act="tile" data-id="${t.id}" aria-label="${esc(t.spec.alt || 'picture')}">${panel(t.spec, { size: 140, label: t.spec.alt })}</button>`;
 const slot = (s, label) => { const id = R.placed[s], t = R.tiles.find(x => x.id === id); return `<button class="slot ${s === 'bin' ? 'bin' : ''} ${R.sel && !id ? 'ready' : ''}" data-act="slot" data-slot="${s}">${t ? `<i class="num">${s === 'bin' ? '🗑' : label}</i>` + panel(t.spec, { size: 110, label: t.spec.alt }) : `<span>${label}</span>`}</button>`; };
 const total = n + (bin ? 1 : 0);
 return stepsBar() + sentenceCard(plainWord) + `<section class="ask">${aloud(bin ? 'Put the pictures in order. One picture is wrong: throw it out.' : 'Put the pictures in order. What happens first?')}<p class="q">${bin ? 'Put the pictures in order. One is wrong: throw it out!' : 'What happens first? Put the pictures in order.'}</p><p class="muted small">Tap a picture, then tap where it goes.</p>
 <div class="slots">${names.slice(0, n).map((l, i) => slot(String(i + 1), l)).join('')}${bin ? slot('bin', '🗑 Throw out') : ''}</div><div class="tray">${R.tiles.filter(t => !at[t.id]).map(tile).join('')}</div>
 ${Object.keys(R.placed).length === total && !R.reveal ? `<button class="primary" data-act="checkorder">Check ▸</button>` : ''}${R.msg ? echo(R.msg) : ''}${R.reveal ? `<button class="primary" data-act="next">Next ▸</button>` : ''}</section>`;
}
function onTile(id){ R.sel = R.sel === id ? null : id; R.msg = ''; const t = R.tiles.find(x => x.id === id); if (R.sel && t && (S.grown.readAloud || R.stop <= 5)) say(t.spec.alt); }
function onSlot(s){ if (R.reveal) return; if (R.placed[s] && !R.sel) { delete R.placed[s]; return; } if (!R.sel) return; for (const k in R.placed) if (R.placed[k] === R.sel) delete R.placed[k]; R.placed[s] = R.sel; R.sel = null; }
function onCheckOrder(){
 const it = R.item, n = it.panels.length, bin = !!it.distractor && R.stop === 10;
 const okBin = !bin || R.placed.bin === 'x', okOrder = Array.from({ length: n }, (_, i) => R.placed[String(i + 1)] === 'p' + i).every(Boolean), ok = okBin && okOrder;
 firstTry('order', ok); tally(bin ? 'story' : 'order', ok && !R.tries.order);
 if (ok) { R.reveal = true; R.msg = bin ? `Yes! ${it.distractor.why}` : 'Yes! That’s the right order.'; return; }
 if (miss('order') === 1) { R.msg = !okBin ? `Look again at the picture you threw out. ${it.distractor.why}` : 'Look again: what happens first?'; R.placed = {}; return; }
 R.placed = Object.fromEntries(it.panels.map((_, i) => [String(i + 1), 'p' + i]).concat(bin ? [['bin', 'x']] : [])); R.reveal = true; R.msg = 'Here is the order.' + (bin ? ' ' + it.distractor.why : '');
}

function resultView(){
 const r = R.result, f = R.first;
 const stars = [['pick', 'Picture'], ['sort', 'Sort'], ['jobs', 'Word jobs'], ['sense', 'Which one?'], ['endings', 'Endings'], ['meaning', 'Meaning'], ['order', 'In order']].filter(([k]) => R.steps.includes(k));
 const sesDone = SES.done >= SESSION;
 const cleared = r.cleared ? `<div class="badge-pop">🏅 <b>F${r.cleared} ${esc(STOPS[r.cleared].name)}</b> cleared!${r.cleared < 11 ? ` <br>Next: F${r.cleared + 1} · ${esc(STOPS[r.cleared + 1].name)}` : ''}</div>` : '';
 const warm = r.struggling ? `<p class="hint">Echo: Want a quick warm-up first? <button class="linkish" data-act="stop" data-n="${R.stop - 1}">Play F${R.stop - 1} · ${esc(STOPS[R.stop - 1].name)}</button></p>` : '';
 return `<section class="result"><div class="burst">${r.ok ? '⭐' : '👍'}</div><h1>${r.ok ? 'Great raiding!' : 'Good work!'}</h1>
 ${R.item.word ? `<p class="sc-text center">${esc(R.item.word)}</p>` : `<p class="sc-text center">${esc(sentenceText(R.item))}</p>`}
 <div class="stars">${stars.map(([k, l]) => `<span class="${f[k] !== false ? 'on' : ''}">${f[k] !== false ? '★' : '☆'} ${l}</span>`).join('')}</div>${cleared}${warm}
 ${sesDone ? `${echo('Great raiding! Come back for more.')}<div class="actions"><button class="primary" data-act="onemore">One more!</button><button class="btn" data-act="map">Back to the map</button><a class="btn" href="../?journey">Back to Home</a></div>`
  : `<div class="actions"><button class="primary" data-act="nextround">Next ▸</button><button class="btn" data-act="map">Map</button></div>`}</section>`;
}

// F11 Graduation: real Sentence Decoder level-1 rounds (3 of the last 4 fully decoded).
function gradStatus(){
 try { const d = JSON.parse(localStorage.getItem(`wr-decoder.${P.id}`) || 'null'); const at = (d?.attempts || []).filter(a => a.level === 1 && a.at >= (S.f11Since || 0)); return at.slice(-4); } catch { return []; }
}
function checkGraduation(){
 if (S.graduatedAt || S.stop !== 11) return;
 const last = gradStatus(); if (last.length >= 3 && last.filter(a => a.mastered).length >= 3) { S.graduatedAt = new Date().toISOString(); if (!S.cleared.includes(11)) S.cleared.push(11); addXp(50); persist(); }
}
function gradView(){
 checkGraduation(); const last = gradStatus(), m = last.filter(a => a.mastered).length;
 return bar('F11 · Graduation') + `<main><p class="eyebrow">F11 · GRADUATION</p><h1>🎓 Graduation</h1>
 ${S.graduatedAt ? `<div class="badge-pop">🎓 <b>You graduated First Steps!</b><br>Sentence Decoder is open, and so is the main Journey.</div>${echo('You did it! You can decode real sentences now.')}<div class="actions"><a class="primary" href="../sentence-decoder/">Sentence Decoder ▸</a><a class="btn" href="../?journey">Main Journey</a><button class="btn" data-act="map">Map</button></div>`
  : `${echo('Now play the real game: Sentence Decoder level 1! Decode 3 of your next 4 sentences to graduate.')}
 <p class="lead">Tag every word with its real name (noun, verb, adjective…), pick each word’s meaning, say what the sentence means, then put the pictures in order and throw one out.</p>
 <div class="dots">${[0, 1, 2, 3].map(i => `<span class="${last[i] ? (last[i].mastered ? 'on' : 'off') : ''}">${last[i] ? (last[i].mastered ? '★' : '☆') : '·'}</span>`).join('')}</div><p class="muted small center">${last.length ? `${m} of your last ${last.length} decoded.` : 'No graduation rounds yet.'}</p>
 <div class="actions"><a class="primary big" href="../sentence-decoder/?from=first-steps&level=1" data-act="gradgo">Play a graduation round ▸</a><button class="btn" data-act="map">Map</button></div>`}</main>`;
}

function roundView(){
 const s = R.si >= R.steps.length ? 'result' : step();
 const body = s === 'result' ? resultView() : s === 'pick' ? pickView() : s === 'sort' ? sortView() : s === 'jobs' ? jobsView() : s === 'sense' ? senseView() : s === 'endings' ? endingsView() : s === 'meaning' ? meaningView() : orderView();
 const title = R.gateMode ? `Warm-up · ${SES.gate.i + 1} of ${SES.gate.queue.length}` : `F${R.stop} · ${STOPS[R.stop].name}`;
 return bar(title) + `<main class="round">${body}</main>`;
}
function render(){
 if (SES && SES.stop === 11) app.innerHTML = gradView();
 else if (R) app.innerHTML = roundView();
 else app.innerHTML = mapView();
}

app.addEventListener('change', e => { const a = e.target.dataset.act;
 if (a === 'g-read') S.grown.readAloud = e.target.checked;
 if (a === 'g-auto') S.grown.autoplay = e.target.checked;
 if (a === 'g-stop') { const n = Number(e.target.value); for (let k = 1; k < n; k++) if (!S.cleared.includes(k) && !S.skipped.includes(k)) S.skipped.push(k); S.stop = n; if (n === 11 && !S.f11Since) S.f11Since = Date.now(); }
 persist(); render();
});
app.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled || b.tagName === 'INPUT' || b.tagName === 'SELECT') return; const a = b.dataset.act;
 if (a === 'say') { say(b.dataset.text); return; }
 if (a === 'play') { playItem(); return; }
 if (a === 'gradgo') { if (!S.f11Since) { S.f11Since = Date.now(); persist(); } return; }
 if (a === 'map') { e.preventDefault(); R = null; SES = null; GATE_DONE = 0; render(); window.scrollTo(0, 0); return; }
 if (a === 'stop') { const n = Number(b.dataset.n); GATE_DONE = 0; if (n === 11 && !S.f11Since) { S.f11Since = Date.now(); persist(); } startSession(n); window.scrollTo(0, 0); return; }
 if (a === 'gate') { GATE_DONE = 0; startGate(); window.scrollTo(0, 0); return; }
 if (a === 'skipgate') { S.placement = { doneAt: new Date().toISOString(), startStop: 1, skipped: [] }; persist(); startSession(1); return; }
 if (!R) return;
 if (a === 'nextround') { nextRound(); window.scrollTo(0, 0); return; }
 if (a === 'onemore') { SES.done = SESSION - 1; nextRound(); window.scrollTo(0, 0); return; }
 if (a === 'next') { nextStep(); if (R && R.si < R.steps.length && step() === 'jobs') {} }
 else if (a === 'pickw') onPickW(Number(b.dataset.i));
 else if (a === 'sortw') onSortW(b.dataset.j);
 else if (a === 'word') setFocus(b.dataset.key);
 else if (a === 'job') onJob(b.dataset.j);
 else if (a === 'helper') onHelper(b.dataset.key);
 else if (a === 'sense') onSense(Number(b.dataset.i));
 else if (a === 'endword') onEndWord(b.dataset.key);
 else if (a === 'noend') onNoEnd();
 else if (a === 'gap') onGap(Number(b.dataset.i));
 else if (a === 'adds') onAdds(Number(b.dataset.i));
 else if (a === 'nextend') nextEnd();
 else if (a === 'mean') onMean(Number(b.dataset.i));
 else if (a === 'tile') onTile(b.dataset.id);
 else if (a === 'slot') onSlot(b.dataset.slot);
 else if (a === 'checkorder') onCheckOrder();
 persist(); if (R) render();
});
if (QS.has('test')) window.__fs = { R: () => R, S: () => S };   // playtest hook (automated checks only)
// Coming back from a graduation round: show F11 straight away.
if (S.stop === 11 && (QS.has('grad') || document.referrer.includes('sentence-decoder'))) SES = { stop: 11, done: 0 };
render();
