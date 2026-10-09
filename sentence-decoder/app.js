// Sentence Decoder: one round = one sentence (or a two-sentence passage at L4), decoded in four stages:
// 1 Word jobs & meanings · 2 Word parts · 3 What does it mean? · 4 Show it (order the panels, throw one out).
// Wrong answers get a one-line hint and one retry, then the answer is shown and the round goes on. Untimed.
import {ITEMS} from './items.js?v=sd-2';
import {PARTS} from './parts.js?v=sd-1';
import {fresh, nextItem, record, tally, partFoils, splitPoints, sameSplit, shuffled, mastered} from './engine.js?v=sd-2';
import {panel} from './art.js?v=sd-2';

const app = document.querySelector('#app');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// ---------- player + save ----------
function player(){ try { const r = JSON.parse(localStorage.getItem('wordraiders.players.v1') || 'null'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Explorer' }; } catch { return { id: 'guest', name: 'Explorer' }; } }
const P = player(), KEY = `wr-decoder.${P.id}`;
// Opened from First Steps F11 (Graduation): play level-1 rounds and offer the way back.
const FROM_FS = new URLSearchParams(location.search).get('from') === 'first-steps';
let S; try { S = { ...fresh(), ...(JSON.parse(localStorage.getItem(KEY) || 'null') || {}) }; } catch { S = fresh(); }
function persist(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
function addXp(n){ if (P.id === 'guest') return; try { const k = `wordraiders.save.${P.id}`, raw = JSON.parse(localStorage.getItem(k) || '{}'); raw.xp = (Number(raw.xp) || 0) + n; raw.savedAt = Date.now(); localStorage.setItem(k, JSON.stringify(raw)); } catch {} }
// ---------- speech ----------
function voice(){ try { const vs = speechSynthesis.getVoices().filter(v => /^en/i.test(v.lang)); const q = v => { const t = v.name + ' ' + (v.voiceURI || ''); return /premium/i.test(t) ? 8 : /enhanced|natural|neural/i.test(t) ? 6 : /compact/i.test(t) ? -4 : 0; }; return vs.sort((a, b) => q(b) - q(a))[0] || null; } catch { return null; } }
function muted(){ try { return !!JSON.parse(localStorage.getItem(`wordraiders.save.${P.id}`) || '{}')?.settings?.mute; } catch { return false; } }
function say(t){ if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); const v = voice(); if (v) u.voice = v; u.rate = .9; speechSynthesis.speak(u); }

// ---------- words and their jobs ----------
const POS = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'pronoun', 'determiner', 'conjunction'];
const POS_SAY = { noun: 'a person, animal, place or thing', verb: 'an action word (or is/was)', adjective: 'tells more about a noun: what kind or which one', adverb: 'tells how, when or where something happens', preposition: 'shows where or which way', pronoun: 'takes the place of a noun', determiner: 'points to a noun: the, a, this', conjunction: 'joins words or ideas' };
const POS_COLOR = { noun: '#4c8fd6', verb: '#d65b3e', adjective: '#7e57c2', adverb: '#2e9d6a', preposition: '#c2860a', pronoun: '#4c8fd6', determiner: '#7a8a93', conjunction: '#7a8a93' };
const POS_MAIN = ['noun', 'verb', 'adjective', 'adverb', 'preposition'];

// ---------- round state ----------
let R = null;
const allTokens = item => item.sentences.flatMap((s, si) => s.tokens.map((t, ti) => ({ ...t, key: si + ':' + ti, si })));
function startRound(level){
 const item = nextItem(S, ITEMS, level); persist();
 if (!item) { home(); return; }
 const toks = allTokens(item), partWords = toks.filter(t => t.parts);
 R = { item, toks, stage: 'words', stars: { words: true, parts: true, meaning: true, pictures: true }, tries: {}, done: {}, focus: null, step: null, msg: '', found: new Set(), partQueue: [], partStep: null, marks: [], meaningOrder: null, picked: null, placed: {}, sel: null };
 R.hasParts = partWords.length > 0 && (item.level >= 2 || partWords.length > 0);
 R.focus = toks.find(t => t.req)?.key || null; R.step = 'pos';
 render();
}
const tok = key => R.toks.find(t => t.key === key);
function miss(where){ R.tries[where] = (R.tries[where] || 0) + 1; return R.tries[where]; }

// ---------- views ----------
function sentenceCard(mark){
 return `<section class="sentence-card"><div class="sc-row">${R.item.sentences.map(s => `<p class="sc-text">${s.tokens.map((t, ti) => { const key = R.item.sentences.indexOf(s) + ':' + ti, T = tok(key); return mark(T); }).join(' ')}</p>`).join('')}</div><button class="hear" data-act="hear" aria-label="Hear the sentence">🔊</button></section>`;
}
function wordChip(t){
 const done = R.done[t.key], cls = ['w', t.req ? 'key' : 'small', done ? 'done' : '', R.focus === t.key ? 'focus' : ''].join(' ');
 const tag = done ? `<small style="color:${POS_COLOR[t.pos]}">${t.pos}</small>` : !t.req ? `<small>${t.pos}</small>` : '';
 return `<button class="${cls}" data-act="word" data-key="${t.key}">${esc(t.t)}${tag}</button>`;
}
function stageBar(){ const st = ['words', 'parts', 'meaning', 'pictures'].filter(s => s !== 'parts' || R.hasParts); const names = { words: 'Words', parts: 'Parts', meaning: 'Meaning', pictures: 'Show it' }; return `<ol class="stages">${st.map((s, i) => `<li class="${R.stage === s ? 'on' : st.indexOf(R.stage) > i || R.stage === 'result' ? 'past' : ''}">${i + 1}. ${names[s]}</li>`).join('')}</ol>`; }
function bar(){ return `<div class="bar"><a href="${FROM_FS ? '../first-steps/?grad=1' : '../?journey'}" class="back">${FROM_FS ? '← First Steps' : '← WordRaiders'}</a><span class="title">Sentence Decoder · L${R ? R.item.level : S.level}</span><span class="count">${esc(P.name)}</span></div>`; }

function home(){
 R = null;
 const lv = [1, 2, 3, 4].map(L => { const n = ITEMS.filter(i => i.level === L).length, seen = (S.seen[L] || []).length, open = L <= Math.max(S.best || 1, S.level); return `<button class="lv ${L === S.level ? 'cur' : ''}" data-act="start" data-level="${L}" ${open ? '' : 'disabled'}><b>Level ${L}</b><small>${['Short sentence', 'Longer sentence + a word part', 'Two ideas joined', 'Two-sentence story'][L - 1]}</small><small>${open ? `${seen}/${n} seen` : '🔒 move up to open'}</small></button>`; }).join('');
 const recent = S.attempts.slice(-10), m = recent.filter(a => a.mastered).length;
 app.innerHTML = bar() + `<main><p class="eyebrow">CRACK THE CODE OF A SENTENCE</p><h1>Sentence Decoder</h1><p class="lead">Find what each word does and means, split words into parts, say what the sentence means, then show it in pictures.</p>
 <button class="primary big" data-act="start" data-level="${S.level}">Decode a sentence ▸</button>
 <p class="muted small">You’re on level ${S.level}. ${recent.length ? `${m} of your last ${recent.length} sentences fully decoded.` : 'Get most of your last 5 right to move up a level.'}</p>
 <h2>Levels</h2><div class="levels">${lv}</div>
 <p class="small">New reader? <a href="../first-steps/" style="color:var(--lime)">Start with First Steps</a>: picture words and tiny sentences for 1st grade.</p><details class="about"><summary>How it works (for grown-ups)</summary><p>Each round: tag the key words (part of speech, then the meaning in this sentence), find and split words with prefixes or suffixes from WordRaiders’ 45 word parts, choose the right meaning of the whole sentence, and order picture panels while throwing out the one that gets it wrong. Wrong answers get a one-line hint and one retry. Sentences don’t repeat until a level’s pool is used up; then missed ones come back first. Moving up needs 4 of the last 5 fully decoded; struggling with meaning or pictures moves back a level. Untimed.</p><p>Why these steps: knowing the right meaning of a many-meaning word in context predicts reading comprehension; word-part teaching helps most alongside other reading work; and “who did what” traps (including sentences like “The cat was chased by the dog”) catch the common habit of treating the first noun as the doer.</p></details></main>`;
}

function wordsView(){
 const t = R.focus ? tok(R.focus) : null; let panelHtml = '';
 if (t && R.step === 'pos') panelHtml = `<section class="ask"><p class="q">What job does <b>“${esc(t.t)}”</b> do here?</p><div class="choices pos">${(POS_MAIN.includes(t.pos) ? POS_MAIN : POS).map(p => `<button data-act="pos" data-pos="${p}">${p}</button>`).join('')}</div>${R.msg ? `<p class="hint">${esc(R.msg)}</p>` : ''}</section>`;
 else if (t && R.step === 'sense') { const ch = R.senseOrder; panelHtml = `<section class="ask"><p class="q">What does <b>“${esc(t.t)}”</b> mean <u>in this sentence</u>?</p><div class="choices">${ch.map((c, i) => `<button data-act="sense" data-i="${i}" ${c.off ? 'disabled' : ''}>${esc(c.text)}</button>`).join('')}</div>${R.msg ? `<p class="hint">${R.msg}</p>` : ''}</section>`; }
 else if (t && R.step === 'shown') panelHtml = `<section class="ask"><p class="hint">${R.msg}</p><button class="primary" data-act="nextword">Next word ▸</button></section>`;
 const left = R.toks.filter(x => x.req && !R.done[x.key]).length;
 return stageBar() + sentenceCard(wordChip) + `<p class="muted small">Tap a word with a solid box. Grey words are already done for you.${left ? ` ${left} to go.` : ''}</p>` + panelHtml;
}
function setFocus(key){ const t = tok(key); if (!t) return; if (!t.req) { R.msg = ''; flash(`“${t.t}” is a ${t.pos}: ${POS_SAY[t.pos]}.`); return; } if (R.done[key]) return; R.focus = key; R.step = 'pos'; R.msg = ''; }
function senseChoices(t){ return shuffled([{ text: t.sense.right, right: true }, ...(t.sense.foils || []).map(f => ({ text: f.text, ex: f.ex }))]); }
function finishWord(t){ R.done[t.key] = true; const next = R.toks.find(x => x.req && !R.done[x.key]); if (next) { R.focus = next.key; R.step = 'pos'; R.msg = ''; } else { R.focus = null; goStage(R.hasParts ? 'parts' : 'check'); } }
function onPos(p){ const t = tok(R.focus), key = 'pos:' + t.key; if (p === t.pos) { tally(S.posAcc, t.pos, !R.tries[key]); R.msg = ''; if ((t.sense?.foils || []).length) { R.step = 'sense'; R.senseOrder = senseChoices(t); } else finishWord(t); return; }
 const n = miss(key); if (n === 1) { R.msg = `Not quite. A ${t.pos === 'verb' ? 'verb' : p} is ${POS_SAY[p]}. Try again.`; return; }
 tally(S.posAcc, t.pos, false); R.stars.words = false; R.step = 'shown'; R.msg = `<b>${esc(t.t)}</b> is a <b>${t.pos}</b>: ${POS_SAY[t.pos]}.`; }
function onSense(i){ const t = tok(R.focus), c = R.senseOrder[i], key = 'sense:' + t.key; if (c.right) { tally(S.senseAcc, t.t.toLowerCase() + ':' + t.sense.right, !R.tries[key]); finishWord(t); return; }
 const n = miss(key); c.off = true;
 if (n === 1) { R.msg = `That meaning is real, but it is used like this: <i>“${esc(c.ex)}”</i> Look at the other words in this sentence. Try again.`; return; }
 tally(S.senseAcc, t.t.toLowerCase() + ':' + t.sense.right, false); R.stars.words = false; R.step = 'shown'; R.msg = `Here <b>${esc(t.t)}</b> means: <b>${esc(t.sense.right)}</b>.`; }

// ---------- stage 2: word parts ----------
function partsView(){
 const ps = R.partStep;
 if (!ps) return stageBar() + sentenceCard(t => `<button class="w part ${R.found.has(t.key) ? 'found' : ''}" data-act="find" data-key="${t.key}">${esc(t.t)}</button>`) + `<section class="ask"><p class="q">Which words have a <b>word part</b> (a prefix like <b>un-</b> or a suffix like <b>-ful</b>)? Tap each one.</p><button class="primary" data-act="nomore">No more parts ▸</button>${R.msg ? `<p class="hint">${R.msg}</p>` : ''}</section>`;
 const t = tok(ps.key), letters = [...t.t];
 if (ps.step === 'split') return stageBar() + `<section class="ask"><p class="q">Split <b>${esc(t.t)}</b>: tap between letters to put a mark where the part joins.</p><div class="split">${letters.map((ch, i) => `<span class="ltr">${esc(ch)}</span>${i < letters.length - 1 ? `<button class="gap ${R.marks.includes(i + 1) ? 'on' : ''}" data-act="gap" data-i="${i + 1}" aria-label="mark after ${esc(ch)}">${R.marks.includes(i + 1) ? '|' : ''}</button>` : ''}`).join('')}</div><button class="primary" data-act="checksplit" ${R.marks.length ? '' : 'disabled'}>Check ▸</button>${R.msg ? `<p class="hint">${R.msg}</p>` : ''}</section>`;
 if (ps.step === 'meaning') return stageBar() + `<section class="ask"><p class="q"><b>${esc(t.parts.split.join(' | '))}</b> — what does <b>${esc(t.parts.part)}</b> mean?</p><div class="choices">${ps.choices.map((c, i) => `<button data-act="partm" data-i="${i}" ${c.off ? 'disabled' : ''}>${esc(c.text)}</button>`).join('')}</div>${R.msg ? `<p class="hint">${R.msg}</p>` : ''}</section>`;
 return stageBar() + `<section class="ask"><p class="hint">${R.msg}</p><button class="primary" data-act="nextpart">Next ▸</button></section>`;
}
function onFind(key){ const t = tok(key); if (t.parts) { R.found.has(key) ? R.found.delete(key) : R.found.add(key); R.msg = ''; return; }
 if (t.trap) { if (!R.tries['trap:' + key]) { miss('trap:' + key); R.stars.parts = false; } R.msg = `Careful: ${esc(t.trap)}`; return; }
 R.msg = `“${esc(t.t)}” has no word part from our list.${/(ed|s|ing)$/.test(t.t) ? ' Endings like -ed, -s and -ing are not counted here.' : ''}`; }
function onNoMore(){ const all = R.toks.filter(t => t.parts), missing = all.filter(t => !R.found.has(t.key));
 if (missing.length && miss('find') === 1) { R.msg = `There ${missing.length === 1 ? 'is' : 'are'} ${missing.length} more. Look for a beginning or ending you know.`; return; }
 if (missing.length) { R.stars.parts = false; missing.forEach(t => R.found.add(t.key)); }
 R.partQueue = all.map(t => t.key); nextPart(); }
function nextPart(){ const key = R.partQueue.shift(); if (!key) { R.partStep = null; goStage('check'); return; } R.partStep = { key, step: 'split' }; R.marks = []; R.msg = ''; }
function onSplit(){ const t = tok(R.partStep.key), want = splitPoints(t.parts.split);
 if (sameSplit(R.marks, want)) { tally(S.affixAcc, t.parts.part, !R.tries['split:' + t.key]); toPartMeaning(t); return; }
 if (miss('split:' + t.key) === 1) { const bad = R.marks.map(i => t.t.slice(0, i)).find(x => !t.parts.split.includes(x.toLowerCase()) && !t.parts.split.includes(t.t.slice(x.length).toLowerCase())); R.msg = `Is ${bad ? `“${esc(bad)}”` : 'that'} a part? Find the piece that means <b>${esc(t.parts.meaning)}</b>. Try again.`; R.marks = []; return; }
 R.stars.parts = false; R.marks = want; toPartMeaning(t); R.msg = `It splits <b>${esc(t.parts.split.join(' | '))}</b>.`; }
function toPartMeaning(t){ R.partStep.step = 'meaning'; R.partStep.choices = shuffled([{ text: t.parts.meaning, right: true }, ...partFoils(t.parts.part, t.parts.meaning, PARTS).map(text => ({ text }))]); }
function onPartMeaning(i){ const t = tok(R.partStep.key), c = R.partStep.choices[i];
 if (c.right) { R.partStep.step = 'shown'; R.msg = `<b>${esc(t.parts.part)}</b> means <b>${esc(t.parts.meaning)}</b>, so <b>${esc(t.t)}</b> = ${esc(t.parts.split.join(' + '))}.`; return; }
 c.off = true; if (miss('pm:' + t.key) === 1) { R.msg = `“${esc(c.text)}” is what a different part means. Try again.`; return; }
 R.stars.parts = false; R.partStep.step = 'shown'; R.msg = `<b>${esc(t.parts.part)}</b> means <b>${esc(t.parts.meaning)}</b>.`; }

// ---------- checkpoint, stage 3, stage 4 ----------
function checkView(){ return stageBar() + sentenceCard(t => `<span class="w tag" style="--c:${POS_COLOR[t.pos]}">${esc(t.t)}<small>${t.pos}</small></span>`) + `<section class="ask"><p class="q">Here is every word’s job. Now: what does it all mean?</p><button class="primary" data-act="tomeaning">Next ▸</button></section>`; }
function meaningView(){ const m = R.item.meaning; if (!R.meaningOrder) R.meaningOrder = shuffled([{ text: m.correct, right: true }, { text: m.literal.text, hint: m.literal.hint }, { text: m.role.text, hint: m.role.hint }]);
 const q = R.item.level >= 4 ? 'What is this story mostly about?' : 'What does the sentence mean?';
 return stageBar() + sentenceCard(t => `<span class="w plain">${esc(t.t)}</span>`) + `<section class="ask"><p class="q">${q}</p><div class="choices">${R.meaningOrder.map((c, i) => `<button data-act="mean" data-i="${i}" ${c.off ? 'disabled' : ''} class="${R.picked === i ? 'right' : ''}">${esc(c.text)}</button>`).join('')}</div>${R.msg ? `<p class="hint">${R.msg}</p>` : ''}${R.picked !== null && R.picked !== undefined ? `<button class="primary" data-act="topics">Show it ▸</button>` : ''}</section>`; }
function onMean(i){ const c = R.meaningOrder[i]; if (R.picked !== null && R.picked !== undefined) return;
 if (c.right) { R.picked = i; R.msg = R.tries.mean ? '' : 'Yes!'; return; }
 c.off = true; if (miss('mean') === 1) { R.msg = esc(c.hint) + ' Try again.'; return; }
 R.stars.meaning = false; R.picked = R.meaningOrder.findIndex(x => x.right); R.msg = `It means: <b>${esc(R.item.meaning.correct)}</b>`; }
function picsView(){
 const it = R.item, n = it.panels.length;
 if (!R.tiles) R.tiles = shuffled([...it.panels.map((p, i) => ({ id: 'p' + i, spec: p, order: i })), { id: 'x', spec: it.distractor, order: -1 }]);
 const at = Object.fromEntries(Object.entries(R.placed).map(([slot, id]) => [id, slot]));
 const tile = t => `<button class="tile ${R.sel === t.id ? 'sel' : ''}" data-act="tile" data-id="${t.id}" aria-label="${esc(t.spec.alt || 'picture')}">${panel(t.spec, { size: 150, label: t.spec.alt })}</button>`;
 const slot = (s, label) => { const id = R.placed[s], t = R.tiles.find(x => x.id === id); return `<button class="slot ${s === 'bin' ? 'bin' : ''} ${R.sel && !id ? 'ready' : ''}" data-act="slot" data-slot="${s}">${t ? `<i class="num">${s === 'bin' ? '🗑' : label}</i>` + panel(t.spec, { size: 110, label: t.spec.alt }) : `<span>${label}</span>`}</button>`; };
 const tray = R.tiles.filter(t => !at[t.id]);
 return stageBar() + sentenceCard(t => `<span class="w plain">${esc(t.t)}</span>`) + `<section class="ask"><p class="q">Put the pictures in order. One picture gets it wrong: throw it out.</p><p class="muted small">Tap a picture, then tap where it goes.</p>
 <div class="slots">${Array.from({ length: n }, (_, i) => slot(String(i + 1), i + 1)).join('')}${slot('bin', '🗑 Doesn’t fit')}</div><div class="tray">${tray.map(tile).join('') || ''}</div>
 ${Object.keys(R.placed).length === n + 1 ? `<button class="primary" data-act="checkpics">Check ▸</button>` : ''}${R.msg ? `<p class="hint">${R.msg}</p>` : ''}</section>`;
}
function onTile(id){ R.sel = R.sel === id ? null : id; R.msg = ''; }
function onSlot(s){ if (R.placed[s]) { if (!R.sel) { delete R.placed[s]; return; } } if (!R.sel) return; for (const k in R.placed) if (R.placed[k] === R.sel) delete R.placed[k]; R.placed[s] = R.sel; R.sel = null; }
function onCheckPics(){ const it = R.item, n = it.panels.length, okBin = R.placed.bin === 'x', okOrder = Array.from({ length: n }, (_, i) => R.placed[String(i + 1)] === 'p' + i).every(Boolean);
 if (okBin && okOrder) { finish(); return; }
 if (miss('pics') === 1) { R.msg = !okBin ? `Look again at the picture you threw out. ${R.placed.bin && R.placed.bin !== 'x' ? 'That one fits the sentence.' : ''}` : 'The right pictures, but check the order: what happens first?'; if (!okBin) { R.msg += ` Hint: ${esc(it.distractor.why)}`; } R.placed = {}; return; }
 R.stars.pictures = false; R.placed = Object.fromEntries(it.panels.map((_, i) => [String(i + 1), 'p' + i]).concat([['bin', 'x']])); R.msg = `Here is the order. The one that doesn’t fit: ${esc(it.distractor.why)}`; R.reveal = true; }
function finish(){ const res = record(S, R.item, R.stars); persist(); const m = res.mastered; addXp(m ? 10 : 5); R.result = res; goStage('result'); }
function resultView(){ const st = R.stars, list = [['words', 'Words'], ...(R.hasParts ? [['parts', 'Parts']] : []), ['meaning', 'Meaning'], ['pictures', 'Pictures']];
 const res = R.result; return stageBar() + `<section class="result"><div class="burst">${res.mastered ? '🔓' : '🔑'}</div><h1>${res.mastered ? 'Decoded!' : 'Good work!'}</h1><p class="sc-text">${esc(R.item.sentences.map(s => s.text).join(' '))}</p><div class="stars">${list.map(([k, l]) => `<span class="${st[k] ? 'on' : ''}">${st[k] ? '★' : '☆'} ${l}</span>`).join('')}</div>
 ${res.moved === 'up' ? `<p class="move up">⬆ Level up! You’re on level ${S.level} now.</p>` : res.moved === 'down' ? `<p class="move">Let’s practise level ${S.level} a bit more.</p>` : ''}<p class="muted">+${res.mastered ? 10 : 5} XP</p>
 <div class="actions"><button class="primary" data-act="start" data-level="${FROM_FS ? 1 : S.level}">Next sentence ▸</button>${FROM_FS ? `<a class="btn" href="../first-steps/?grad=1">Back to First Steps</a>` : `<a class="btn" href="../?journey">Back to Home</a>`}</div></section>`; }
function goStage(s){ R.stage = s; R.msg = ''; R.picked = null; }
let flashT = 0; function flash(t){ const el = document.querySelector('#status'); el.textContent = t; clearTimeout(flashT); flashT = setTimeout(() => { el.textContent = ''; }, 3500); }

function render(){
 if (!R) { home(); return; }
 const body = R.stage === 'words' ? wordsView() : R.stage === 'parts' ? partsView() : R.stage === 'check' ? checkView() : R.stage === 'meaning' ? meaningView() : R.stage === 'pictures' ? picsView() : resultView();
 app.innerHTML = bar() + `<main class="round">${body}</main>`;
}
app.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b || b.disabled) return; const a = b.dataset.act;
 if (a === 'start') { startRound(Number(b.dataset.level) || S.level); window.scrollTo(0, 0); return; }
 if (a === 'hear') { if (muted()) flash('Sound is off in WordRaiders settings.'); else say(R.item.sentences.map(s => s.text).join(' ')); return; }
 if (!R) return;
 if (a === 'word') setFocus(b.dataset.key);
 else if (a === 'pos') onPos(b.dataset.pos);
 else if (a === 'sense') onSense(Number(b.dataset.i));
 else if (a === 'nextword') finishWord(tok(R.focus));
 else if (a === 'find') onFind(b.dataset.key);
 else if (a === 'nomore') onNoMore();
 else if (a === 'gap') { const i = Number(b.dataset.i); R.marks = R.marks.includes(i) ? R.marks.filter(x => x !== i) : [...R.marks, i]; }
 else if (a === 'checksplit') onSplit();
 else if (a === 'partm') onPartMeaning(Number(b.dataset.i));
 else if (a === 'nextpart') nextPart();
 else if (a === 'tomeaning') goStage('meaning');
 else if (a === 'mean') onMean(Number(b.dataset.i));
 else if (a === 'topics') { goStage('pictures'); R.tiles = null; R.placed = {}; R.sel = null; }
 else if (a === 'tile') onTile(b.dataset.id);
 else if (a === 'slot') onSlot(b.dataset.slot);
 else if (a === 'checkpics') { if (R.reveal) { R.reveal = false; finish(); } else onCheckPics(); }
 persist(); render();
});
if (FROM_FS) startRound(1); else home();
