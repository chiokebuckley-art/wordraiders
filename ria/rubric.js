// Explicit-rubric scoring for written explanations (no AI): each rubric is a list of idea units; a unit is found when
// every word of one of its alternative word sets appears in the learner's text (simple stemming, any order, within
// one sentence of the learner's answer). The result names the words that matched for each unit, so a grown-up can
// see the evidence and correct the score. Shared by the Academy page and the content checker.
const STOP = new Set('a an the is are was were be been of to in on at by for and or but so it its this that these those with as from'.split(' '));
export const norm = s => String(s ?? '').toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
/** A light stemmer: plurals, -ing, -ed, -ly, -ies, -es; keeps 3+ letters. It keeps -er (water, flower), so a rubric lists "faster" next to "fast" when both should count. */
export function stem(w){
 w = norm(w).replace(/'s$/, '');
 const rules = [[/ies$/, 'y'], [/(ss)es$/, '$1'], [/([^s])es$/, '$1e'], [/ing$/, ''], [/ed$/, ''], [/ly$/, ''], [/s$/, '']];
 for (const [re, to] of rules) { if (re.test(w)) { const c = w.replace(re, to); if (c.length >= 3) return c.replace(/e$/, ''); } }
 return w.replace(/e$/, '');
}
const words = s => norm(s).split(' ').filter(Boolean);
/** Split the learner's text into sentences of stemmed words (a unit must match inside one sentence). */
function sentencesOf(text){ return String(text ?? '').split(/[.!?;\n]+/).map(s => ({ raw: s.trim(), stems: words(s).map(stem) })).filter(s => s.stems.length); }
/**
 * ideas: [{ id, label, any: [["word", "word"], ["other phrase"]], required?: boolean }]
 * A set entry may hold a multi-word phrase ("again and again"): all its words must appear, in order, next to each other.
 */
export function scoreExplanation(text, ideas){
 const S = sentencesOf(text), units = [];
 for (const idea of ideas) {
  let hit = null;
  for (const alt of idea.any) {
   for (const s of S) {
    const ok = alt.every(term => { const t = words(term).filter(w => !STOP.has(w) || words(term).length > 1).map(stem); if (!t.length) return true; for (let i = 0; i + t.length <= s.stems.length; i++) if (t.every((x, j) => s.stems[i + j] === x)) return true; return false; });
    if (ok) { hit = { sentence: s.raw, words: alt }; break; }
   }
   if (hit) break;
  }
  units.push({ id: idea.id, label: idea.label, required: idea.required !== false, found: !!hit, evidence: hit });
 }
 const req = units.filter(u => u.required), gotReq = req.filter(u => u.found).length, got = units.filter(u => u.found).length;
 const length = words(text).length;
 const verdict = !length ? 'blank' : req.length && gotReq === req.length ? 'correct' : got > 0 ? 'partial' : 'incorrect';
 return { verdict, score: units.length ? got / units.length : 0, found: got, of: units.length, requiredFound: gotReq, requiredOf: req.length, units, words: length };
}
export const VERDICT_TEXT = { correct: 'Correct: every key idea is there.', partial: 'Partly correct: some key ideas are there.', incorrect: 'Not yet: the key ideas are missing.', blank: 'Nothing written yet.' };
