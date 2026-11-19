// Imports evidence the daily pages already record into the shared schema (idempotent: each event keeps its source id).
// Sources: Daily Comprehension, Grade Journey (answers + grown-up-scored oral reading), Little Words, Daily Symbols,
// Sound Code and First Steps. What a source never recorded stays unknown (null), e.g. help in First Steps.
// Also summarises (without importing) the main app's daily answer totals and Engineering Quest's learning evidence.
import {SKILLS} from './model.js';
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const noon = day => { const [y, m, d] = String(day).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1, 12).getTime(); };
const varsOf = skill => SKILLS[skill]?.vars || [];
const phaseOf = skill => SKILLS[skill]?.phase ?? null;
const ev = (o) => ({ app: 'wordraiders', purpose: 'imported', ...o, vars: o.vars || varsOf(o.skill), phase: o.phase ?? phaseOf(o.skill) });
const GJ_TYPE = { literal: 'literal-detail', evidence: 'literal-detail', feature: 'literal-detail', sequence: 'sequence-q', why: 'reason-cause', main: 'main-idea', theme: 'main-idea', vocab: 'vocab-context', inference: 'inference-q', author: 'author-claim', claim: 'author-claim', craft: 'author-claim', compare: 'author-claim' };

function dailyComprehension(pid){
 const S = read(`wr-dailycomp.${pid}`); if (!S?.attempts) return [];
 const first = {}; for (const a of S.attempts) if (!first[a.contentId] || a.at < first[a.contentId]) first[a.contentId] = a.at;
 const MAP = { meaning: 'sentence-meaning', pq: 'literal-detail', show: 'picture-meaning', retrieve: 'literal-detail', review: 'recall', 'fact-guess-not': 'fact-guess' };
 return S.attempts.filter(a => MAP[a.promptType]).map(a => {
  const skill = MAP[a.promptType], help = [...(a.audioAssisted ? ['tts'] : []), ...(a.hinted ? ['hint'] : []), ...(a.replayCount > 0 ? ['showagain'] : [])];
  const isReview = a.promptType === 'review', fam = isReview ? true : a.at > first[a.contentId] + 6 * 36e5;
  return ev({ id: `dc:${a.eventId}`, src: 'dc', at: a.at, item: `${a.contentId}:${a.promptType}`, content: a.contentId, skill, purpose: isReview ? 'retention' : 'imported',
   familiar: fam, band: /^sd-/.test(a.contentId) ? 1 : /^g2-/.test(a.contentId) ? 2 : 1, correct: !!a.correct, firstTry: a.firstTry !== false, assisted: help.length > 0, help,
   rtMs: a.latencyMs ?? null, confidence: a.confidence === 'sure' ? 'sure' : a.confidence === 'not sure' ? 'unsure' : null,
   delayDays: isReview ? Math.max(1, Math.round((a.at - first[a.contentId]) / 864e5)) : null,
   cond: { mode: 'daily-comprehension', hidden: a.promptType === 'retrieve' || isReview ? true : a.promptType === 'meaning' || a.promptType === 'pq' ? false : undefined } });
 });
}
async function gradeJourney(pid){
 const S = read(`wr-grade.${pid}`); if (!S) return [];
 const grades = [...new Set((S.events || []).map(e => e.grade).filter(Boolean))], content = {};
 for (const g of grades) { try { const m = await import(`../grade-journey/content-g${g}.js?v=gj-2`); m.PASSAGES.forEach(p => { content[p.id] = p; }); } catch {} }
 const out = (S.events || []).map((e, i) => {
  const qi = Number((/-q(\d+)$/.exec(e.itemId) || [])[1]) - 1, q = content[e.passageId]?.questions?.[qi], skill = GJ_TYPE[q?.type] || 'literal-detail';
  return ev({ id: `gj:${e.at}:${e.itemId}:${i}`, src: 'gj', at: e.at, item: e.itemId, content: e.passageId, skill, familiar: !!e.seenBefore, band: e.grade, correct: !!e.correct, firstTry: e.firstTry !== false,
   assisted: !!e.ttsUsed, help: e.ttsUsed ? ['tts'] : [], cond: { mode: `grade-journey:${e.kind}`, hidden: e.track === 'listening' ? undefined : false, unit: e.unit } });
 });
 for (const [g, R] of Object.entries(S.grades || {})) for (const o of R.gate?.oral || []) {
  out.push(ev({ id: `gj-oral:${g}:${o.pid}:${o.at}`, src: 'gj', at: noon(o.at), item: o.pid, content: o.pid, skill: 'oral-reading', vars: ['decoding'], phase: 1, familiar: !o.unseen, band: Number(g), correct: null, score: o.accuracy, assisted: false,
   cond: { mode: 'oral reading (grown-up scored)', wordsRead: o.wordsRead, errors: o.errors, seconds: o.seconds, wcpm: o.wcpm, scoredBy: o.scoredBy } }));
 }
 return out;
}
function littleWords(pid){
 const S = read(`wr-littlewords.${pid}`); if (!S?.log) return [];
 const seen = new Set();
 return S.log.map((l, i) => { const fam = seen.has(l.id); seen.add(l.id); return ev({ id: `lw:${l.day}:${l.id}:${l.type}:${i}`, src: 'lw', at: noon(l.day) + i, item: `${l.id}:${l.type}`, content: `lw:${l.id}`, skill: 'vocab-context', familiar: fam, band: 1, correct: !!l.ok, assisted: false, cond: { mode: 'little-words', type: l.type } }); });
}
function dailySymbols(pid){
 const S = read(`wr-symbols.${pid}`); if (!S?.events) return [];
 const seen = new Set();
 return S.events.map(e => { const fam = seen.has(e.itemId); seen.add(e.itemId); return ev({ id: `ds:${e.eventId}`, src: 'ds', at: noon(e.date), item: e.itemId, content: e.termId, skill: 'punctuation', familiar: fam, band: null, correct: !!e.correct, assisted: !!e.hinted, help: e.hinted ? ['hint'] : [], cond: { mode: e.practice ? 'daily-symbols:try' : 'daily-symbols', type: e.type } }); });
}
function soundCode(pid){
 const S = read(`wr-soundcode.${pid}`); if (!S?.attempts) return [];
 return S.attempts.map((a, i) => ev({ id: `sc:${a.day}:${a.m}:${a.w || a.i}:${i}`, src: 'sc', at: noon(a.day) + i, item: `${a.m}:${a.w || a.i}`, content: `sc:${a.m}`, skill: 'decode', familiar: a.tag !== 'unseen', band: 1, correct: !!a.ok, assisted: a.prompt > 0, help: a.prompt > 0 ? ['prompt' + a.prompt] : [], cond: { mode: 'sound-code', task: a.task } }));
}
function firstSteps(pid){
 const S = read(`wr-firststeps.${pid}`); if (!S?.attempts) return [];
 const seen = new Set();
 return S.attempts.map((a, i) => { const fam = seen.has(a.id); seen.add(a.id); const skill = /^fs-f\d/.test(a.id) ? 'picture-meaning' : 'decode'; return ev({ id: `fs:${a.at}:${a.id}:${i}`, src: 'fs', at: a.at, item: a.id, content: a.id, skill, familiar: fam, band: 1, correct: !!a.ok, firstTry: a.first !== false, assisted: null, cond: { mode: 'first-steps', stop: a.stop } }); });
}
/** Every importable event for this learner (fast; call before showing the dashboard). */
export async function importAll(pid){
 const lists = [dailyComprehension(pid), await gradeJourney(pid), littleWords(pid), dailySymbols(pid), soundCode(pid), firstSteps(pid)];
 return lists.flat();
}
/** The main app's daily answer totals (not item-level, so summarised only). */
export function mainAppTotals(pid){
 const s = read(`wordraiders.save.${pid}`), T = s?.activity?.tries || {}; let answered = 0, first = 0, right = 0; const days = new Set();
 for (const [day, devs] of Object.entries(T)) for (const areas of Object.values(devs || {})) for (const v of Object.values(areas || {})) { if (Array.isArray(v)) { answered += v[0] || 0; first += v[1] || 0; right += v[2] || 0; if (v[0]) days.add(day); } }
 const repairs = Object.values(s?.errorBook || {}).filter(e => e && !e.resolvedAt).length;
 return { answered, firstTryRight: first, right, days: days.size, repairs };
}
/** Engineering Quest (same web address, separate app): each of its profiles' learning evidence, summarised read-only.
 *  Its saves are { schemaVersion, savedAt, data: { learning: { skills: { id: { daily: { day: counts } } } } } }. */
export function engineeringQuest(){
 const idx = read('engineering-quest.profiles'), out = [];
 const list = idx?.profiles?.length ? idx.profiles.map(p => ({ id: p.id, name: p.name || p.id, key: p.id === 'p1' ? 'engineering-quest.save' : `engineering-quest.save.${p.id}` })) : [{ id: 'legacy', name: 'Engineering Quest player', key: 'engineering-quest.save' }];
 for (const p of list) {
  const raw = read(p.key), L = raw?.data?.learning || raw?.learning; if (!L?.skills) continue;
  let ind = 0, ok = 0, sup = 0, transfer = 0, transferOk = 0, recall = 0, recallOk = 0; const days = new Set();
  for (const s of Object.values(L.skills)) for (const [day, d] of Object.entries(s.daily || {})) { ind += d.independent || 0; ok += d.correct || 0; sup += d.supported || 0; transfer += d.transfer || 0; transferOk += d.transferCorrect || 0; recall += d.recall || 0; recallOk += d.recallCorrect || 0; days.add(day); }
  out.push({ id: p.id, name: p.name, skills: Object.keys(L.skills).length, days: days.size, independent: ind, correct: ok, supported: sup, transfer, transferOk, recall, recallOk });
 }
 return out;
}
