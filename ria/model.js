// Reading Intelligence model (no DOM): the 12 variables and their indicators, the skills of the five learning phases,
// mastery rules, diagnosis (observed evidence kept apart from hypotheses), scheduling and the next recommendation.
import * as St from './stats.js';
const DAY = 864e5;
export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDays = (k, n) => { const [y, m, d] = k.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n, 12).getTime()); };

export const PHASES = [
 { n: 1, name: 'Language Foundations', short: 'Foundations', blurb: 'Read the words, know what they mean, see how a sentence is built.' },
 { n: 2, name: 'Meaning Construction', short: 'Meaning', blurb: 'Who did what, what each sentence says, what the passage is mostly about.' },
 { n: 3, name: 'Relationship Discovery', short: 'Relationships', blurb: 'Causes, contrasts, conditions, sequences, evidence and what is assumed.' },
 { n: 4, name: 'Mental-Model Construction', short: 'Mental models', blurb: 'Rebuild what the passage describes: parts, steps, inputs, outputs and feedback.' },
 { n: 5, name: 'Independent Reasoning & Transfer', short: 'Transfer', blurb: 'Explain it without looking, use it somewhere new, and still know it days later.' },
];
/** The 12 variables. Indicators: kind 'direct' (scored responses that are the ability) or 'inferred' (a pattern; a hypothesis). */
export const VARIABLES = [
 { id: 'decoding', n: 1, name: 'Decoding', note: 'Reading the words themselves.', direct: ['decode'], inferred: ['read-aloud reliance'] },
 { id: 'vocabulary', n: 2, name: 'Vocabulary', note: 'Word meanings in context.', direct: ['vocab-context'], inferred: ['words flagged as unknown'] },
 { id: 'syntax', n: 3, name: 'Syntax', note: 'How a sentence is built: chunks, the main action, punctuation.', direct: ['sentence-structure', 'who-did-what', 'punctuation'] },
 { id: 'semantic', n: 4, name: 'Semantic integration', note: 'Putting words and sentences together into meaning.', direct: ['sentence-meaning', 'pronoun', 'literal-detail', 'picture-meaning'] },
 { id: 'wm', n: 5, name: 'Working memory (inferred)', note: 'Only inferred: holding ideas in mind while reading. Not a capacity measurement.', direct: [], inferred: ['hidden vs visible accuracy', 'look-backs while hidden', 'retell completeness'] },
 { id: 'attention', n: 6, name: 'Attention (inferred)', note: 'Only inferred from response patterns. Not a measure of attention.', direct: [], inferred: ['very fast wrong answers', 'accuracy late vs early in a session'] },
 { id: 'background', n: 7, name: 'Background knowledge', note: 'What the reader already knew (self-report) and how much it seems to matter.', direct: ['familiarity self-report'], inferred: ['accuracy on familiar vs new topics'] },
 { id: 'inference', n: 8, name: 'Inference', note: 'Working out what the text does not say directly.', direct: ['fact-guess', 'reason-assumption', 'reason-consequence', 'reason-missing', 'predict', 'inference-q'] },
 { id: 'discourse', n: 9, name: 'Discourse comprehension', note: 'Following the whole passage: main idea, links between sentences.', direct: ['main-idea', 'big-idea-written', 'relation', 'sequence-q'] },
 { id: 'model', n: 10, name: 'Mental-model construction', note: 'Rebuilding the process or system the text describes.', direct: ['model-order', 'model-parts', 'predict'] },
 { id: 'metacog', n: 11, name: 'Metacognitive monitoring', note: 'Knowing when you understand: confidence vs correctness.', direct: ['calibration'], inferred: ['flagged words vs vocabulary results'] },
 { id: 'retention', n: 12, name: 'Retention & transfer', note: 'Still knowing it later; using it somewhere new.', direct: ['recall', 'transfer'] },
];
export const VAR = Object.fromEntries(VARIABLES.map(v => [v.id, v]));
export const REL_LABEL = { 'cause-effect': 'cause and effect', contrast: 'contrast', comparison: 'comparison', condition: 'condition and consequence', sequence: 'sequence', 'problem-solution': 'problem and solution', example: 'example', 'evidence-conclusion': 'evidence and conclusion', contradiction: 'contradiction' };
/** Skills: id → { label, phase, vars }. */
export const SKILLS = {
 decode: { label: 'Decoding words', phase: 1, vars: ['decoding'] },
 'vocab-context': { label: 'Word meaning in context', phase: 1, vars: ['vocabulary'] },
 'sentence-structure': { label: 'Sentence chunks and the main action', phase: 1, vars: ['syntax'] },
 punctuation: { label: 'Punctuation marks', phase: 1, vars: ['syntax'] },
 'who-did-what': { label: 'Who or what does the action', phase: 2, vars: ['syntax', 'semantic'] },
 'sentence-meaning': { label: 'Explaining a sentence', phase: 2, vars: ['semantic'] },
 'picture-meaning': { label: 'Showing what a sentence means', phase: 2, vars: ['semantic'] },
 pronoun: { label: 'What a pronoun refers to', phase: 2, vars: ['semantic'] },
 'literal-detail': { label: 'Finding stated details', phase: 2, vars: ['semantic'] },
 'main-idea': { label: 'Main idea', phase: 2, vars: ['discourse'] },
 'big-idea-written': { label: 'Writing the big idea', phase: 2, vars: ['discourse'] },
 relation: { label: 'Links between sentences', phase: 3, vars: ['discourse', 'semantic'] },
 'sequence-q': { label: 'Sequence and order of events', phase: 3, vars: ['discourse'] },
 'reason-cause': { label: 'Causes', phase: 3, vars: ['discourse'] },
 'reason-condition': { label: 'Conditions and consequences', phase: 3, vars: ['discourse'] },
 'reason-consequence': { label: 'Consequences and implications', phase: 3, vars: ['inference'] },
 'reason-assumption': { label: 'Assumptions', phase: 3, vars: ['inference'] },
 'reason-evidence': { label: 'Evidence and conclusions', phase: 3, vars: ['discourse', 'inference'] },
 'reason-contradiction': { label: 'Contradictions', phase: 3, vars: ['discourse', 'inference'] },
 'fact-guess': { label: 'Fact, fair guess or not in the text', phase: 3, vars: ['inference'] },
 'inference-q': { label: 'Reading between the lines', phase: 3, vars: ['inference'] },
 'model-order': { label: 'Rebuilding the steps', phase: 4, vars: ['model'] },
 'model-parts': { label: 'Inputs, process, outputs, feedback', phase: 4, vars: ['model'] },
 predict: { label: 'Evidence-based prediction', phase: 4, vars: ['model', 'inference'] },
 'reason-missing': { label: 'Noticing missing information', phase: 5, vars: ['inference'] },
 retell: { label: 'Explaining without looking', phase: 5, vars: ['discourse'] },
 'author-claim': { label: 'Claims, purpose and evaluation', phase: 5, vars: ['discourse', 'inference'] },
 recall: { label: 'Remembering days later', phase: 5, vars: ['retention'] },
 transfer: { label: 'Using it in a new situation', phase: 5, vars: ['retention'] },
};
export const skillOfRelation = t => 'relation';

const scored = e => e.correct === true || e.correct === false;
const independent = e => scored(e) && e.assisted === false && e.firstTry !== false && !St.piExcluded(e);
export const forSkill = (events, skill) => events.filter(e => e.skill === skill || (skill === 'relation' && e.skill?.startsWith('relation')));
export const forVar = (events, v) => events.filter(e => (e.vars || []).includes(v));

/**
 * Mastery (A6): independent, unfamiliar, first-try evidence on ≥3 distinct passages and ≥2 days, the last 5 such
 * answers ≥80% right, plus at least one correct delayed (retention) or transfer answer → 'mastered'; without the
 * delayed/transfer answer → 'secure (needs a later check)'. A later slip (2 of the last 3 wrong) → 'needs review'.
 * Familiar repeats and help never count.
 */
export function mastery(events, review = true){
 const ind = events.filter(e => independent(e)), fresh = ind.filter(e => e.familiar === false || e.purpose === 'retention' || e.purpose === 'transfer');
 const ok = fresh.filter(e => e.correct), passages = new Set(ok.map(e => e.content).filter(Boolean)).size, days = new Set(ok.map(e => dayKey(e.at))).size;
 const last5 = fresh.slice(-5), acc5 = last5.length ? last5.filter(e => e.correct).length / last5.length : null;
 const later = ind.filter(e => (e.purpose === 'retention' && (e.delayDays ?? 0) >= 1) || e.purpose === 'transfer');
 const laterOk = later.some(e => e.correct), last3 = ind.slice(-3);
 const evidence = { independent: ind.length, unfamiliar: fresh.length, passages, days, last5: last5.length, acc5, laterChecks: later.length, laterOk, assistedOrUnknown: events.filter(scored).length - ind.length };
 let status = !events.length ? 'not started' : 'practising';
 const secure = passages >= 3 && days >= 2 && last5.length >= 5 && acc5 >= 0.8;
 if (secure) status = laterOk ? 'mastered' : 'secure';
 // Needs review: it was mastered at some earlier point, and 2 of the latest 3 independent answers are wrong.
 if (review && status !== 'mastered' && last3.length === 3 && last3.filter(e => !e.correct).length >= 2) { for (let k = events.length - 1; k >= 3; k--) if (mastery(events.slice(0, k), false).status === 'mastered') { status = 'needs review'; break; } }
 else if (review && status === 'mastered' && last3.length === 3 && last3.filter(e => !e.correct).length >= 2) status = 'needs review';
 return { status, evidence };
}
export const STATUS_TEXT = { 'not started': 'Not started', practising: 'Practising', secure: 'Secure (needs a later check)', mastered: 'Mastered', 'needs review': 'Needs review' };

/** A variable's estimate: independent accuracy on its direct indicators, plus inferred patterns (hypotheses). */
export function variableReport(events, v, { now = Date.now() } = {}){
 const V = VAR[v], direct = events.filter(e => (e.vars || []).includes(v));
 const im = St.independentMastery(direct), acc = St.accuracy(direct), recent = direct.filter(e => e.at >= now - 30 * DAY), older = direct.filter(e => e.at < now - 30 * DAY);
 const out = { id: v, name: V.name, note: V.note, independent: im, accuracy: acc, n: direct.length, recent: St.independentMastery(recent), older: St.independentMastery(older), inferred: [] };
 if (v === 'decoding') { const t = events.filter(e => (e.vars || []).includes('decoding') || e.src === 'gj' || e.src === 'dc'), known = t.filter(e => e.assisted !== null); const tts = known.filter(e => (e.help || []).includes('tts')).length; out.inferred.push({ label: 'Read-aloud used', value: known.length ? St.rate(tts, known.length) : null, meaning: 'Often choosing read-aloud can mean decoding is effortful; it can also be a preference.' }); const oral = events.filter(e => e.skill === 'oral-reading'); if (oral.length) out.oral = oral; }
 if (v === 'wm') {
  const hid = events.filter(e => e.cond?.hidden && independent(e)), vis = events.filter(e => e.cond?.hidden === false && independent(e) && ['sentence-meaning', 'who-did-what', 'literal-detail'].includes(e.skill));
  const H = St.rate(hid.filter(e => e.correct).length, hid.length), Vv = St.rate(vis.filter(e => e.correct).length, vis.length);
  out.inferred.push({ label: 'Text hidden vs visible', value: H.n >= 5 && Vv.n >= 5 ? { hidden: H, visible: Vv, gap: Vv.value - H.value } : null, meaning: 'A large drop when the text is hidden is consistent with holding less in mind, but also with not reading closely the first time.' });
  const looks = events.filter(e => e.cond?.hidden), lb = looks.filter(e => (e.help || []).includes('showagain')).length;
  out.inferred.push({ label: 'Looked back while the text was hidden', value: looks.length ? St.rate(lb, looks.length) : null, meaning: 'Looking back is a good strategy; frequent look-backs suggest the ideas were not yet held together.' });
  const rt = events.filter(e => e.skill === 'retell' && e.explain); out.inferred.push({ label: 'Retell completeness (idea units recalled)', value: rt.length ? { mean: 100 * St.mean(rt.map(e => e.explain.found / Math.max(1, e.explain.of))), n: rt.length } : null, meaning: 'How many key ideas came back without looking. Also depends on writing.' });
 }
 if (v === 'attention') {
  const t = events.filter(e => independent(e) && Number.isFinite(e.rtMs)), fast = t.filter(e => e.rtMs < 1500 && !e.correct);
  out.inferred.push({ label: 'Very fast wrong answers (< 1.5 s)', value: t.length ? St.rate(fast.length, t.length) : null, meaning: 'Answers given too fast to have read the options may mean rushing or guessing.' });
  const S = {}; for (const e of events.filter(independent)) if (e.session) (S[e.session] ||= []).push(e);
  const long = Object.values(S).filter(a => a.length >= 9); let first = 0, firstN = 0, last = 0, lastN = 0;
  for (const a of long) { const k = Math.floor(a.length / 3); a.slice(0, k).forEach(e => { firstN++; first += e.correct; }); a.slice(-k).forEach(e => { lastN++; last += e.correct; }); }
  out.inferred.push({ label: 'Early vs late in long sessions', value: long.length ? { early: St.rate(first, firstN), late: St.rate(last, lastN), sessions: long.length } : null, meaning: 'A drop late in a session is consistent with tiredness or wandering attention; harder items late can also cause it.' });
 }
 if (v === 'background') {
  const f = events.filter(e => independent(e) && e.cond?.knew === 'a lot'), u = events.filter(e => independent(e) && (e.cond?.knew === 'nothing' || e.cond?.knew === 'a little'));
  const reports = events.filter(e => e.skill === 'familiarity');
  out.inferred.push({ label: 'Accuracy when the topic was familiar vs new', value: f.length >= 5 && u.length >= 5 ? { familiar: St.rate(f.filter(e => e.correct).length, f.length), unfamiliar: St.rate(u.filter(e => e.correct).length, u.length) } : null, meaning: 'Uses the reader’s own rating before reading. A big gap suggests knowledge is doing a lot of the work.' });
  out.selfReports = reports.length;
 }
 if (v === 'metacog') {
  out.calibration = St.calibration(events);
  const fl = events.filter(e => e.skill === 'vocab-context' && e.cond?.flagged != null && independent(e));
  const a = fl.filter(e => e.cond.flagged), b = fl.filter(e => !e.cond.flagged);
  out.inferred.push({ label: 'Words flagged as unknown vs vocabulary answers', value: fl.length >= 6 ? { flaggedRight: St.rate(a.filter(e => e.correct).length, a.length), unflaggedRight: St.rate(b.filter(e => e.correct).length, b.length) } : null, meaning: 'Good monitoring: unflagged words are usually answered right; flagged words are the ones that cause trouble.' });
 }
 if (v === 'retention') { out.retention = St.retention(events); out.transfer = St.transfer(events); }
 return out;
}

// ---------- diagnosis ----------
/**
 * After a missed item in a lab session: what we observed (facts from this session) and what might explain it
 * (hypotheses to test). `ctx.results` = this passage's events so far; `item` = { skill, s (sentence), passage, ... }.
 */
export function diagnose(item, ctx){
 const P = ctx.passage, R = ctx.results || [], observed = [], hyp = [];
 const missed = (skill, pred = () => true) => R.filter(e => e.skill === skill && e.correct === false && pred(e));
 const sents = [item.s, item.from, item.to].filter(Boolean);
 const vocabMiss = missed('vocab-context', e => sents.includes(e.cond?.s));
 const flagged = (ctx.flagged || []).filter(f => sents.includes(f.s));
 if (vocabMiss.length) observed.push(`Missed the meaning of “${vocabMiss.map(e => e.cond.word).join('”, “')}” in the same sentence.`);
 if (flagged.length) observed.push(`Marked “${flagged.map(f => f.word).join('”, “')}” as unknown in that sentence.`);
 if (vocabMiss.length || flagged.length) hyp.push({ factor: 'vocabulary', why: 'An unknown word in the key sentence can block its meaning.', next: 'vocab-context' });
 const roleMiss = missed('who-did-what', e => sents.includes(e.cond?.s)).concat(missed('sentence-structure', e => sents.includes(e.cond?.s)));
 if (roleMiss.length) { observed.push('Missed who or what does the action in that sentence.'); hyp.push({ factor: 'grammar', why: 'If the doer and the action are mixed up, the sentence’s meaning shifts.', next: 'who-did-what' }); }
 const proMiss = missed('pronoun', e => sents.includes(e.cond?.s)); if (proMiss.length) { observed.push('Missed what a pronoun refers to in that sentence.'); hyp.push({ factor: 'reference', why: 'Losing track of “it/they” breaks the link between sentences.', next: 'pronoun' }); }
 const meanMiss = missed('sentence-meaning', e => sents.includes(e.cond?.s)); if (meanMiss.length && item.skill !== 'sentence-meaning') { observed.push('Missed the meaning of one of the sentences involved.'); hyp.push({ factor: 'integration', why: 'Each sentence must make sense before the link between them can.', next: 'sentence-meaning' }); }
 if (ctx.knew === 'nothing') { observed.push('Said they knew nothing about this topic before reading.'); hyp.push({ factor: 'background knowledge', why: 'New topics are harder; the passage has to supply everything.', next: null }); }
 if (Number.isFinite(item.rtMs) && item.rtMs < 1500) { observed.push(`Answered in ${(item.rtMs / 1000).toFixed(1)} s.`); hyp.push({ factor: 'rushing (possible)', why: 'Very fast answers may not have been read fully. Only a hypothesis.', next: null }); }
 if (item.hidden) { observed.push('The text was hidden for this question.'); if (!R.some(e => e.cond?.hidden === false && e.correct === false)) hyp.push({ factor: 'holding it in mind (possible)', why: 'Questions with the text visible went well, so remembering it may be the hard part.', next: null }); }
 if (!hyp.length) hyp.push({ factor: SKILLS[item.skill]?.label?.toLowerCase() || 'this skill', why: 'No other skill in this passage explains the miss, so the skill itself needs teaching.', next: item.skill });
 return { observed, hypotheses: hyp, target: hyp.find(h => h.next)?.next || item.skill };
}

// ---------- worked explanations (one per skill family) ----------
export const TEACH = {
 'vocab-context': { title: 'Working out a word from its sentence', steps: ['Read the whole sentence again, not just the word.', 'Ask what job the word does: is it a thing, an action or a describing word?', 'Try each choice in place of the word. The right meaning keeps the sentence true.', 'Look for a clue nearby: “which means”, “like”, or an example.'] },
 'sentence-structure': { title: 'Finding the main action', steps: ['Split the sentence into chunks at the commas and little linking words.', 'Find the chunk that says what happens (the verb).', 'Ask “who or what does it?” — that is the doer.'] },
 'who-did-what': { title: 'Who did what', steps: ['Find the action word.', 'Ask “who or what did this?” The answer usually comes just before the action.', 'Watch for “by”: in “The ball was kicked by Sam”, Sam is still the doer.'] },
 'sentence-meaning': { title: 'Saying a sentence in your own words', steps: ['Find who, does what, and to what.', 'Keep every important detail: when, where, how much.', 'Check your version: would the writer agree it says the same thing?'] },
 pronoun: { title: 'What does “it” mean?', steps: ['Look back at the sentence before.', 'Find the nouns there (things or people).', 'Put each one in place of the pronoun; the right one makes sense.'] },
 'main-idea': { title: 'The main idea', steps: ['Ask what most sentences are about.', 'A detail is true but small; the main idea covers the whole passage.', 'Test it: could this be the title?'] },
 'big-idea-written': { title: 'Writing the big idea', steps: ['Name the topic.', 'Say what happens to it or what the writer says about it.', 'Use one or two sentences, in your own words.'] },
 relation: { title: 'How sentences connect', steps: ['Look for link words: because, so (cause and effect); but, however (contrast); if, when (condition); first, then (sequence).', 'With no link word, ask: does the second sentence explain why, show what happened next, or disagree?', 'Name the link, then check it with the words in the text.'] },
 'reason-cause': { title: 'Finding causes', steps: ['Find the result: what happened?', 'Ask “why did it happen?” and look for because, since, so, as a result.', 'Check that the cause comes from the text, not from a guess.'] },
 'reason-condition': { title: 'Conditions', steps: ['A condition says “only if” or “when”.', 'Find the if/when part and the then part.', 'Ask: if the condition were not true, would the result still happen?'] },
 'reason-consequence': { title: 'Consequences', steps: ['Find an event in the text.', 'Ask what it leads to next.', 'Choose the result the text supports, not one you only imagine.'] },
 'reason-assumption': { title: 'Assumptions', steps: ['An assumption is something the writer takes for granted without saying it.', 'Ask: what must be true for this sentence to make sense?', 'It is not written, but the text depends on it.'] },
 'reason-evidence': { title: 'Evidence and conclusions', steps: ['Find the claim: what the writer wants you to believe.', 'Find the facts given as support.', 'Ask whether those facts really lead to the claim.'] },
 'reason-contradiction': { title: 'Spotting contradictions', steps: ['Find two statements about the same thing.', 'Ask: can both be true at the same time?', 'Look for however, but, actually — writers often flag a correction.'] },
 'reason-missing': { title: 'What the text does not tell us', steps: ['List what the text does say.', 'Check each choice against that list.', 'The missing one is a question the passage leaves open.'] },
 'model-order': { title: 'Rebuilding the steps', steps: ['Find the start: what comes first?', 'Use time words (first, then, after, finally) and causes (this makes that happen).', 'Read your order back as a story. Does each step lead to the next?'] },
 'model-parts': { title: 'Inputs, process, outputs and feedback', steps: ['Inputs: what goes in or starts it.', 'Process: what happens to it.', 'Outputs: what comes out.', 'Feedback: does an output change the start again?'] },
 predict: { title: 'Predicting with evidence', steps: ['Find the rule or pattern the text gives.', 'Apply it to the new case.', 'Choose the outcome the rule supports.'] },
 retell: { title: 'Explaining without looking', steps: ['Start with the big idea.', 'Add the main steps or reasons in order.', 'End with the result. Short, in your own words.'] },
 recall: { title: 'Remembering later', steps: ['Retrieve first, then check: trying to remember is what makes it stick.', 'Picture the process or story.', 'Explain it to someone else.'] },
 transfer: { title: 'Using an idea somewhere new', steps: ['Name the rule from the passage in one sentence.', 'Find the same parts in the new situation.', 'Apply the rule to them.'] },
};

// ---------- scheduling and recommendation ----------
/** Add follow-ups after a lab session: reassess weak skills on a different passage, retention checks, transfer. */
export function scheduleAfter(M, { passage, weak, today, band }){
 const add = x => { if (!M.schedule.some(s => s.kind === x.kind && s.skill === x.skill && s.from === x.from && (s.delay ?? 0) === (x.delay ?? 0) && !s.doneAt)) M.schedule.push({ id: `${x.kind}:${x.skill}:${x.from}:${x.delay ?? 0}:${today}`, created: today, ...x }); };
 for (const skill of weak) add({ kind: 'reassess', skill, from: passage, due: today, band });
 add({ kind: 'retention', skill: 'recall', from: passage, due: addDays(today, 1), band, delay: 1 });
 add({ kind: 'retention', skill: 'recall', from: passage, due: addDays(today, 7), band, delay: 7 });
 add({ kind: 'transfer', skill: 'transfer', from: passage, due: addDays(today, 2), band });
}
export const dueItems = (M, today) => M.schedule.filter(s => !s.doneAt && s.due <= today).sort((a, b) => a.due.localeCompare(b.due));

/** Band (reading level): up only after independent success on 3 unfamiliar passages at this band; down after 2 weak. */
export function bandDecision(passageResults, band){
 const at = passageResults.filter(r => r.band === band && r.unfamiliar);
 const last3 = at.slice(-3), last2 = at.slice(-2);
 if (last3.length === 3 && last3.every(r => r.indAcc >= 0.8)) return { move: 'up', why: 'Independent accuracy of 80%+ on the last 3 new passages at this level.' };
 if (last2.length === 2 && last2.every(r => r.indAcc < 0.5)) return { move: 'down', why: 'Under 50% on the last 2 new passages at this level.' };
 return { move: null, why: `${last3.filter(r => r.indAcc >= 0.8).length} of the last ${last3.length} new passages at this level were 80%+ independently (3 needed).` };
}
export const BANDS = [2, 3, 4, 5, 6, 8];
export const bandStep = (b, d) => BANDS[Math.max(0, Math.min(BANDS.length - 1, BANDS.indexOf(b) + d))];
export const bandFromGrade = g => !g ? 3 : g <= 2 ? 2 : g >= 7 ? 8 : g;

/** The current phase: the lowest phase with a skill that has evidence but is not yet secure; else the next phase with no evidence. */
export function currentPhase(events){
 for (const ph of PHASES) {
  const skills = Object.entries(SKILLS).filter(([, s]) => s.phase === ph.n).map(([k]) => k);
  const st = skills.map(k => mastery(forSkill(events, k)).status);
  const tried = st.filter(s => s !== 'not started');
  if (!tried.length || tried.some(s => s === 'practising' || s === 'needs review')) return ph.n;
 }
 return 5;
}
/** Recommend the next activity, with the reason. */
export function recommend(M, events, { today, passages, band }){
 const due = dueItems(M, today);
 const ret = due.find(d => d.kind === 'retention'); if (ret) return { kind: 'retention', item: ret, why: `A ${ret.delay}-day memory check on a passage you studied is due.` };
 const re = due.find(d => d.kind === 'reassess'); if (re) return { kind: 'reassess', item: re, why: `Re-check “${SKILLS[re.skill]?.label || re.skill}” on a different passage after the lesson.` };
 const tr = due.find(d => d.kind === 'transfer'); if (tr) return { kind: 'transfer', item: tr, why: 'Try the idea from a passage you studied in a new situation.' };
 if (!M.baseline) return { kind: 'baseline', why: 'Start with a short check, so later progress can be measured against it.' };
 const seen = new Set(events.filter(e => e.src === 'ria').map(e => e.content));
 const fresh = passages.filter(p => p.form === 'lab' && p.band === band && !seen.has(p.id));
 if (fresh.length) return { kind: 'lab', passage: fresh[0].id, why: `A new passage at level ${band}: new passages are what show real progress.` };
 const any = passages.filter(p => p.form === 'lab' && !seen.has(p.id)).sort((a, b) => Math.abs(a.band - band) - Math.abs(b.band - band));
 if (any.length) return { kind: 'lab', passage: any[0].id, why: `All level-${band} passages are done; this is the nearest new one.` };
 return { kind: 'posttest', why: 'Every practice passage is done: take the comparison check.' };
}
