// Notebook question builders, one per daily page. Each card names its page (src), item (ref) and question kind
// (skill); build(card, rng) gives { original, variations: [3], twist }: the same question again, three of the
// same kind (same word or mark in a new sentence, same question type on another text), and one twist that changes
// the kind (the look-alike word, the mark it was mixed up with, another question type on the same text).
// A question: { meta: {src, ref, skill, label, extra}, lead: null | {title, text, hide}, prompt, opts: [{x} | {pic, alt}],
//   right, explain, say }.
import {USES, sceneAt} from '../common-words/content.js?v=lw-1';
import {illustration} from '../common-words/art.js?v=lw-1';
import {KID} from '../little-words/words.js?v=lw-1';
import {PICTURE_UNITS} from '../little-words/engine.js?v=lw-1';
import {MARKS, SLOT, ACCENT} from '../daily-symbols/content.js?v=ds-1';
import {STAGES, EXTRAS} from '../daily-comprehension/content.js?v=dc-1';
import {ITEMS} from '../sentence-decoder/items.js?v=dc-1';
import {PASSAGES as G1} from '../grade-journey/content-g1.js?v=gj-2';
import {PASSAGES as G2} from '../grade-journey/content-g2.js?v=gj-2';

export function seeded(str){ let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h = h + 0x6d2b79f5 >>> 0; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffle(xs, rng){ const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const mcq = (meta, lead, prompt, choices, rng, explain, say) => { const order = shuffle(choices, rng); return { meta, lead, prompt, opts: order, right: order.findIndex(o => o.ok), explain: explain || '', say: say ?? `${prompt} ${order.filter(o => o.x).map(o => o.x).join('? ')}?` }; };
const pad = (list, n, more) => { const out = list.filter(Boolean).slice(0, n); for (const q of more) { if (out.length >= n) break; if (q) out.push(q); } return out; };

// ---------- Little Words ----------
const LW = Object.fromEntries(USES.map((u, i) => [u.id, { ...u, idx: i }]));
const wordRe = u => new RegExp(`\\b${u.word.replace(/ /g, '\\s+')}\\b`, 'i');
const lwScene = (u, k = 0) => sceneAt(LW[u.id].idx * 5 + k);
const lwTypes = (u, k) => ['meaning', ...(PICTURE_UNITS.includes(u.unit) ? ['picture'] : []), ...(PICTURE_UNITS.includes(u.unit) && wordRe(u).test(lwScene(u, k).sentence) ? ['gap'] : [])];
function lwQ(u, type, k, rng){
 const meta = { src: 'lw', ref: u.id, skill: type, label: u.word }, sc = lwScene(u, k), w = LW[u.wrong] || USES.find(x => x.scene === u.wrong) || null;
 const others = shuffle(USES.filter(x => x.unit === u.unit && x.id !== u.id), rng);
 const lead = { text: sc.sentence.replace(wordRe(u), m => `«${m}»`) };
 if (type === 'picture') {
  const kinds = [u.wrong, ...others.map(x => x.scene)].filter((x, i, a) => x && x !== u.scene && a.indexOf(x) === i).slice(0, 2);
  return mcq(meta, lead, `Which picture shows “${u.word}”?`, [{ pic: illustration(sc, u.scene, { caption: false, legend: false }), alt: 'Picture', ok: true }, ...kinds.map(kd => ({ pic: illustration(sc, kd, { caption: false, legend: false }), alt: 'Picture' }))], rng, KID[u.id], `Which picture shows ${u.word}? ${sc.sentence}`);
 }
 if (type === 'gap') {
  const pool = [w, ...others].filter(Boolean).filter((x, i, a) => x.word.toLowerCase() !== u.word.toLowerCase() && a.findIndex(y => y.word.toLowerCase() === x.word.toLowerCase()) === i).slice(0, 2);
  return mcq(meta, { text: sc.sentence.replace(wordRe(u), '___') }, 'Which word fits?', [{ x: u.word, ok: true }, ...pool.map(x => ({ x: x.word }))], rng, KID[u.id], `Which word fits? ${sc.sentence.replace(wordRe(u), 'blank')}`);
 }
 const pool = [w && w.use !== u.use ? w : null, ...others].filter(Boolean).filter((x, i, a) => x.use !== u.use && a.findIndex(y => y.use === x.use) === i).slice(0, 2);
 return mcq(meta, lead, `What does “${u.word}” mean here?`, [{ x: u.use, ok: true }, ...pool.map(x => ({ x: x.use }))], rng, KID[u.id]);
}
const lw = {
 build(c, rng){
  const u = LW[c.ref]; if (!u) return null;
  const original = lwQ(u, lwTypes(u, 0).includes(c.skill) ? c.skill : 'meaning', 0, rng);
  const variations = [1, 2, 3].map(k => { const ts = lwTypes(u, k); return lwQ(u, ts[(ts.indexOf(c.skill) + k) % ts.length] || 'meaning', k, rng); });
  const look = LW[u.wrong] || USES.find(x => x.scene === u.wrong && x.id !== u.id) || shuffle(USES.filter(x => x.unit === u.unit && x.id !== u.id), rng)[0];
  return { original, variations, twist: lwQ(look, 'meaning', 1, rng) };
 },
 where: c => `${c.extra?.from === 'cw' ? 'Common Word Arcade' : 'Little Words'} · ${LW[c.ref]?.word || c.ref}`,
};

// ---------- Daily Symbols (asked as "which mark goes here?") ----------
const SY = Object.fromEntries(MARKS.map(m => [m.id, m]));
const ACC_NAME = { acute: 'Up-Slant Accent', grave: 'Down-Slant Accent', none: 'No mark', macron: SY.macron?.name, breve: SY.breve?.name, diaeresis: SY.diaeresis?.name, circumflex: SY.circumflex?.name, cedilla: SY.cedilla?.name };
const targetOpt = (m, s) => { if (m.kind !== 'accent') return m.id; const t = s.s.match(/\{([^{}:]*):/)[1]; return t === 'acute-grave' ? 'acute' : t; };
function optLabel(m, s, id){ if (m.kind === 'accent') { const letter = s.s.match(/\{[^{}:]*:([a-zA-Z])\}/)[1]; return (letter + (ACCENT[id] || '')).normalize('NFC'); } const g = SLOT[id]; return Array.isArray(g) ? g.join(' ') : g; }
const optName = (m, id) => m.kind === 'accent' ? ACC_NAME[id] || id : SY[id]?.name || id;
const gapText = (m, s) => s.s.replace(/\{([^{}]*)\}/g, (_, x) => m.kind === 'accent' ? `${x.split(':')[1]}_` : '___');
function symQ(m, sent, rng){
 const s = m.sentences[sent], target = targetOpt(m, s);
 const wrong = shuffle(s.wrong.filter(x => x !== target), rng).slice(0, 2);
 const ch = [target, ...wrong].map(id => ({ x: `${optLabel(m, s, id)}  ${optName(m, id)}`, ok: id === target, id }));
 return mcq({ src: 'sym', ref: m.id, skill: 'mark', label: `${m.name} ${m.glyph}`, extra: { sent } }, { text: gapText(m, s) }, 'Which mark goes in the gap?', ch, rng, `${m.name}: ${m.meaning}`, `Which mark goes in the gap? ${ch.map(o => optName(m, o.id)).join('? ')}?`);
}
const sym = {
 build(c, rng){
  const m = SY[c.ref]; if (!m || !m.sentences?.length) return null;
  const sent = Math.min(c.extra?.sent ?? 0, m.sentences.length - 1);
  const others = shuffle(m.sentences.map((_, i) => i).filter(i => i !== sent), rng).slice(0, 3);
  const picked = SY[c.extra?.picked]?.sentences?.length && c.extra.picked !== m.id ? SY[c.extra.picked] : SY[m.sentences[sent].wrong.find(x => SY[x]?.sentences?.length && x !== m.id)] || MARKS.find(x => x.tier === m.tier && x.id !== m.id && x.kind === m.kind);
  return { original: symQ(m, sent, rng), variations: others.map(i => symQ(m, i, rng)), twist: picked ? symQ(picked, Math.floor(rng() * picked.sentences.length), rng) : null };
 },
 where: c => `Daily Symbols · ${SY[c.ref]?.name || c.ref}`,
};

// ---------- Daily Comprehension ----------
const SD = Object.fromEntries(ITEMS.map(x => [x.id, x])), DCP = Object.fromEntries([...G1, ...G2].map(p => [p.id, p]));
const STAGE_OF = {}; for (const [st, ids] of Object.entries(STAGES)) ids.forEach(id => { STAGE_OF[id] = st; });
function textOf(id){ if (SD[id]) return { id, kind: 'sentence', title: '', text: SD[id].sentences.map(s => s.text).join(' ') }; const p = DCP[id]; return p ? { id, kind: 'passage', title: p.title, text: p.text, p } : null; }
function passageQs(p){ const qs = p.questions.map((q, i) => ({ ...q, i })); const r = qs.find(q => ['literal', 'sequence', 'why'].includes(q.type) && q.evidence) || qs[qs.length - 1]; return { construct: qs.filter(q => q !== r && q.type !== 'feature').slice(0, 2), retrieve: r }; }
const M5 = { fact: 'The text says it', guess: 'Fair guess', notThere: 'Not in the text' };
function dcQ(id, skill, rng, extra = {}){
 const t = textOf(id); if (!t || !EXTRAS[id]) return null;
 const meta = { src: 'dc', ref: id, skill, label: t.title || t.text.slice(0, 40), extra }, lead = { title: t.title, text: t.text };
 if (skill === 'meaning') { const m = SD[id]?.meaning; if (!m) return null; return mcq(meta, lead, 'What does it mean?', [{ x: m.correct, ok: true }, { x: m.literal.text }, { x: m.role.text }], rng, m.literal.hint || ''); }
 if (skill === 'retrieve') {
  const r = t.kind === 'sentence' ? EXTRAS[id].retrieve : passageQs(t.p).retrieve; if (!r) return null;
  return mcq(meta, { ...lead, hide: true }, r.q, r.options.map((x, j) => ({ x, ok: j === r.answer })), rng, r.span || r.evidence ? `It says: “${r.span || r.evidence}”` : '');
 }
 if (skill === 'pq') { const q = t.p?.questions[extra.qi ?? 0]; if (!q) return null; meta.extra = { qi: extra.qi ?? 0, type: q.type }; return mcq(meta, lead, q.q, q.options.map((x, j) => ({ x, ok: j === q.answer })), rng, q.evidence ? `It says: “${q.evidence}”` : ''); }
 if (skill === 'm5') {
  const m = EXTRAS[id].m5, k = extra.kind || 'guess', why = { fact: `The text says: “${m.factSpan}”`, guess: `Clue: “${m.guessSpan}”. The text doesn’t say it, but you can work it out.`, notThere: 'The text never says that.' };
  meta.extra = { kind: k };
  return { meta, lead, prompt: `“${m[k]}” Does the text say it, is it a fair guess, or is it not in the text?`, opts: ['fact', 'guess', 'notThere'].map(x => ({ x: M5[x] })), right: ['fact', 'guess', 'notThere'].indexOf(k), explain: why[k], say: `${m[k]}. Does the text say it, is it a fair guess, or is it not in the text?` };
 }
 return null;
}
const sameStage = (id, f) => (STAGES[STAGE_OF[id]] || Object.values(STAGES).flat()).filter(x => x !== id && EXTRAS[x] && f(x));
const dc = {
 build(c, rng){
  const id = c.ref, t = textOf(id); if (!t) return null;
  const extra = c.extra || {}, original = dcQ(id, c.skill, rng, extra); if (!original) return null;
  let pool;
  if (c.skill === 'meaning') pool = sameStage(id, x => !!SD[x]?.meaning).map(x => () => dcQ(x, 'meaning', rng));
  else if (c.skill === 'retrieve') pool = sameStage(id, x => !!SD[x] === !!SD[id]).map(x => () => dcQ(x, 'retrieve', rng));
  else if (c.skill === 'm5') pool = sameStage(id, () => true).map(x => () => dcQ(x, 'm5', rng, { kind: extra.kind || 'guess' }));
  else { const type = t.p.questions[extra.qi ?? 0]?.type; pool = sameStage(id, x => !!DCP[x]).flatMap(x => DCP[x].questions.map((q, qi) => q.type === type ? () => dcQ(x, 'pq', rng, { qi }) : null).filter(Boolean)); }
  const variations = shuffle(pool, rng).slice(0, 3).map(f => f()).filter(Boolean);
  const twist = c.skill === 'm5' ? dcQ(id, 'm5', rng, { kind: shuffle(['fact', 'guess', 'notThere'].filter(k => k !== (extra.kind || 'guess')), rng)[0] }) : c.skill === 'retrieve' ? dcQ(id, 'm5', rng, { kind: 'fact' }) : dcQ(id, 'retrieve', rng);
  return { original, variations, twist };
 },
 where: c => `Daily Comprehension · ${textOf(c.ref)?.title || 'a sentence'}`,
};

// ---------- Grade Journey practice texts ----------
const GJ_POOLS = ['practice', 'book', 'listening'];
const gjCache = {};
async function gjGrade(g){ if (!gjCache[g]) { try { gjCache[g] = (await import(`../grade-journey/content-g${g}.js?v=gj-2`)).PASSAGES; } catch { gjCache[g] = []; } } return gjCache[g]; }
function gjQ(p, qi, g, rng){
 const q = p.questions[qi]; if (!q) return null;
 return mcq({ src: 'gj', ref: p.id, skill: q.type, label: p.title, extra: { qi, grade: g } }, { title: p.title, text: p.text }, q.q, q.options.map((x, j) => ({ x, ok: j === q.answer })), rng, q.evidence ? `The text says: “${q.evidence}”` : '');
}
const gj = {
 async prep(c){ await gjGrade(c.extra?.grade || 1); },
 build(c, rng){
  const g = c.extra?.grade || 1, all = gjCache[g] || [], p = all.find(x => x.id === c.ref); if (!p) return null;
  const qi = c.extra?.qi ?? p.questions.findIndex(q => q.type === c.skill), original = gjQ(p, qi, g, rng); if (!original) return null;
  const others = all.filter(x => x.id !== p.id && GJ_POOLS.includes(x.pool)).sort((a, b) => (a.words || a.text.length / 5) - (b.words || b.text.length / 5));
  const same = others.flatMap(x => x.questions.map((q, j) => q.type === c.skill ? [x, j] : null).filter(Boolean));
  const variations = shuffle(same.slice(0, 9), rng).slice(0, 3).map(([x, j]) => gjQ(x, j, g, rng));
  const tw = shuffle(p.questions.map((q, j) => q.type !== c.skill ? j : -1).filter(j => j >= 0), rng)[0];
  return { original, variations, twist: tw != null ? gjQ(p, tw, g, rng) : null };
 },
 where: c => `Grade ${c.extra?.grade || 1} · ${c.label}`,
};

// ---------- Arcades (cards made in the main app by wr-arcade-notebook.js, with their questions inside) ----------
const GAME = { word: 'Word Arcade', sentence: 'Sentence Arcade', syntax: 'Sentence Arcade', forms: 'Sentence Arcade', spell: 'Spelling' };
function arcadeQ(c, g){
 const meta = { src: 'arcade', ref: c.ref, skill: c.skill, label: c.label, extra: c.extra };
 if (g.type === 'tap') return { ...g, meta, lead: null, say: `${g.prompt} ${g.tokens.join(' ')}` };
 if (g.type === 'order') return { ...g, meta, lead: null, say: `${g.prompt} ${g.tokens.join(', ')}` };
 if (g.type === 'spell') return { ...g, meta, lead: null, prompt: 'Spell the word you hear.', explain: g.explain || (g.meaning ? `${g.word}: ${g.meaning}` : ''), say: `${g.word}. ${g.sentence || ''} ${g.word}.` };
 const order = g.opts.map((o, i) => ({ ...o, ok: i === g.right }));
 return { meta, lead: g.lead ? { text: g.lead } : null, pic: g.pic || '', prompt: g.prompt, opts: order.map(({ x }) => ({ x })), right: order.findIndex(o => o.ok), explain: g.explain || '', say: `${g.prompt} ${order.map(o => o.x).join('? ')}?` };
}
const arcade = {
 build(c, rng){
  const X = c.extra; if (!X?.orig) return null;
  const mix = q => { if (q.type || !q.opts) return q; const o = shuffle(q.opts.map((x, i) => ({ ...x, ok: i === q.right })), rng); return { ...q, opts: o.map(({ x }) => ({ x })), right: o.findIndex(x => x.ok) }; };
  return { original: arcadeQ(c, mix(X.orig)), variations: shuffle(X.same || [], rng).slice(0, 3).map(q => arcadeQ(c, mix(q))), twist: (X.twist || []).length ? arcadeQ(c, mix(shuffle(X.twist, rng)[0])) : null };
 },
 where: c => `${GAME[c.skill] || 'Arcade'} · ${c.label}`,
};

export const SOURCES = { lw, sym, dc, gj, arcade };
/** Build a fix: original + up to 3 variations + twist (missing pieces are skipped). */
export async function buildFix(card, seed){
 const S = SOURCES[card.src]; if (!S) return null;
 if (S.prep) await S.prep(card);
 const rng = seeded(`${seed}:${card.id}:${card.fixes}`), b = S.build(card, rng); if (!b) return null;
 return [b.original, ...pad(b.variations, 3, []), b.twist].filter(Boolean);
}
/** One "cousin" of a card for a check-up (a question of the same kind, not the same question). */
export async function cousin(card, seed, n = 0){
 const S = SOURCES[card.src]; if (!S) return null;
 if (S.prep) await S.prep(card);
 const b = S.build(card, seeded(`${seed}:cu:${card.id}:${n}`)); return b ? b.variations[n % Math.max(1, b.variations.length)] || b.twist : null;
}
export const whereOf = c => SOURCES[c.src]?.where(c) || c.label;
