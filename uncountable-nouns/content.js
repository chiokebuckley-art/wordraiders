// Uncountable Nouns: 420 nouns in the reference's seven categories, three illustrated scenes each.
// Scene 1 — meaning: the noun's picture against another noun's picture from the same category.
// Scene 2 — a lot of: a big amount against a small amount.
// Scene 3 — counting units (three pieces/glasses/loaves against one) when the noun has a natural unit; else a little.
// Definitions follow the Common Uncountable Nouns reference (plain-English, original); kid meanings and sentences are original.
import {NOUN_DATA} from './nouns-data.js';
export const SOURCES = [
 ['Cambridge: Nouns, countable and uncountable', 'https://dictionary.cambridge.org/us/grammar/british-grammar/nouns-countable-and-uncountable'],
 ['British Council: Uncount nouns', 'https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/uncount-nouns'],
 ['British Council: Nouns, countable and uncountable', 'https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/nouns-countable-uncountable'],
 ['British Council: Common problems with count and uncount nouns', 'https://learnenglish.britishcouncil.org/free-resources/grammar/english-grammar-reference/common-problems-count-uncount-nouns']
];
export const UNITS = [
 ['Information & learning', 'News, advice, homework and more.', '📚'],
 ['Work, money & technology', 'Money, software, help and work.', '💼'],
 ['Food & drink', 'Water, rice, bread, cheese…', '🍞'],
 ['Materials & substances', 'Wood, glass, paper, sand…', '🧱'],
 ['Nature & weather', 'Rain, snow, sunshine, wind…', '🌦️'],
 ['Feelings & ideas', 'Happiness, courage, fun…', '💛'],
 ['Activities & everyday things', 'Furniture, luggage, music, sleep…', '🎒']
];
export const PER = 3;
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const an = w => /^[aeiou]/i.test(w) && !/^(uni|use|eu)/i.test(w) ? 'an' : 'a';
export const NOUNS = NOUN_DATA.map((n, i) => ({ ...n, index: i, id: n.word.replace(/[^a-z]+/gi, '-').toLowerCase(), unitIndex: n.cat }));
// The picture to compare a noun's meaning picture with: another noun from the same category whose picture looks different.
const sig = p => [p.t, p.sym, p.face, p.el, p.holder, p.fill, (p.syms || []).join()].join('|');
NOUNS.forEach((n, i) => {
 // Prefer a clearly different picture (another kind of picture, no shared symbols) so near-twins such as
 // trash/garbage or salt/pepper are never the two choices.
 const syms = q => new Set([q.sym, q.sym2, ...(q.syms || [])].filter(Boolean));
 const apart = m => m.pic.t !== n.pic.t && ![...syms(m.pic)].some(x => syms(n.pic).has(x));
 const same = NOUNS.filter(m => m.cat === n.cat && m !== n && apart(m));
 const pool = same.length ? same : NOUNS.filter(m => m.cat === n.cat && m !== n && sig(m.pic) !== sig(n.pic));
 n.other = pool[(i * 7 + 3) % pool.length];
});
export const TOTAL = NOUNS.length * PER;
export function grammarNote(n){
 const plural = /s$/.test(n.word) ? '' : ` or “${n.word}s”`;
 return `${cap(n.word)} is uncountable: we say “some ${n.word}”, not “${an(n.word)} ${n.word}”${plural}.`;
}
export function sceneAt(index){
 if (!Number.isInteger(index) || index < 0 || index >= TOTAL) throw Error('Unknown noun scene');
 const noun = NOUNS[Math.floor(index / PER)], k = index % PER, w = noun.word, u = noun.unit;
 const units = k === 2 && !!u;
 const kind = k === 0 ? 'meaning' : k === 1 ? 'lot' : units ? 'units' : 'little';
 const wrong = { meaning: 'other', lot: 'little', little: 'lot', units: 'unit' }[kind];
 const unitWord = u ? u.three.replace(/^three\s+/, '').replace(/\s+of\s+.*$/, '') : '';
 const sentence = kind === 'meaning' ? noun.say : kind === 'lot' ? noun.lot : kind === 'little' ? noun.little : `Here are ${u.three}.`;
 const use = {
  id: noun.id, word: w, kind, scene: kind, wrong,
  heading: kind === 'meaning' ? noun.kid : kind === 'lot' ? `a lot of ${w}` : kind === 'little' ? `a little ${w}` : `counting ${unitWord}`,
  meaning: kind === 'meaning' ? `${cap(noun.kid)}. ${noun.def}` : kind === 'lot' ? `A lot of means a big amount. ${grammarNote(noun)}` : kind === 'little' ? `A little means a small amount. ${grammarNote(noun)}` : `To count ${w}, count the ${unitWord}: ${u.one}, ${u.three}.`,
  contrast: kind === 'meaning' ? (noun.usage ? `${grammarNote(noun)} ${noun.usage}` : grammarNote(noun)) : kind === 'lot' ? `A little ${w} would be a small amount.` : kind === 'little' ? `A lot of ${w} would be a big amount.` : `Not “three ${w}s”: the number counts the ${unitWord}, not the ${w}.`,
  ask: kind === 'meaning' ? `What does “${w}” mean?` : kind === 'units' ? `How much ${w} is in the picture?` : `How much ${w} is it?`,
  right: kind === 'meaning' ? noun.kid : kind === 'lot' ? `a big amount of ${w}` : kind === 'little' ? `a small amount of ${w}` : u.three,
  incorrect: kind === 'meaning' ? noun.other.kid : kind === 'lot' ? `a small amount of ${w}` : kind === 'little' ? `a big amount of ${w}` : u.one
 };
 return { id: `n${index}`, index, k, kind, noun, other: noun.other, use, sentence };
}
export function nextIndex(completed){ for (let i = 0; i < TOTAL; i++) if (!completed[`n${i}`]) return i; return null; }
export function stateFor(p){ return p.academy || (p.academy = { version: 1, completed: {}, checkpoint: null }); }
export function checkpoint(index){ return { index, phase: 'learn', feedback: null }; }
export function canOpen(p, index){ const s = stateFor(p); return Number.isInteger(index) && index >= 0 && index < TOTAL && (Boolean(s.completed[`n${index}`]) || nextIndex(s.completed) === index); }
export function complete(p, index, now = Date.now()){ const s = stateFor(p); if (!canOpen(p, index) || s.checkpoint?.index !== index || s.checkpoint.phase !== 'done') return false; if (!s.completed[`n${index}`]) { s.completed[`n${index}`] = now; p.xp += 10; } s.checkpoint = null; return true; }
// Sets of ten nouns inside each category (what My journey lists).
export const SETS = UNITS.map((_, c) => { const ns = NOUNS.filter(n => n.cat === c), out = []; for (let i = 0; i < ns.length; i += 10) out.push(ns.slice(i, i + 10)); return out; });
