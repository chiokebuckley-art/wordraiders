// Sound Code rules (no DOM). From the decoding blueprint, sections D (placement), G (mastery and review), H (app):
// - a daily session mixes ~6 current words, ~4 older words due for review, 2 new transfer words, a sentence and
//   2 spellings (G "cumulative review plan"); a lesson comes first on a module's first day;
// - each word is reviewed on a 1, 3, 7, 14, 30-day ladder; a miss sends it back to the bottom;
// - a module is checked with two different 20-item forms on different days, each with 10 unseen items: pass =
//   19/20, 9/10 on the unseen half, and no pattern family missed twice (G1); then a delayed 10-item check after
//   7 days (9/10). Only the first, unprompted answer counts in a check. These thresholds are the blueprint's
//   stated design choices (D), not research cutoffs.
import {UNITS, MODULES, spell} from './inventory.js?v=sc-1';
export const LADDER = [1, 3, 7, 14, 30];
export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n, 12).getTime()); };
export const fresh = () => ({ v: 1, learner: null, helper: false, placed: null, module: 0, mods: {}, words: {}, exposed: {}, days: {}, oral: { reads: 0, prompts: [0, 0, 0, 0, 0] }, attempts: [] });
export const modState = (S, n) => S.mods[n] || (S.mods[n] = { state: 'practice', lessonDone: false, sessions: 0, recent: [], fragile: {}, checkA: null, checkB: null, keepDue: null, keep: null });
export function shuffled(xs, rng = Math.random){ const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---- module 0: letters and sounds (built here: every single-letter unit with its anchor word) ----
export function module0(){
 const L = UNITS[1], letters = Object.keys(L);
 const words = letters.map(l => ({ w: l, role: 'practice', fam: 'letter', letter: true, anchorWord: L[l] }));
 return { module: 0, lesson: { idea: 'Each letter has a name and a sound. For reading, the sound is what matters: m says mmm, as at the start of map. We match each letter to the first sound of a word we know.', limit: 'Some letters have more than one sound (c in cat and city); we start with the most common one.', kid: 'Letters make sounds. m says mmm, like at the start of map.', models: [{ w: 'm', think: 'This is m. Its sound is the first sound in map: mmm… map.' }, { w: 's', think: 'This is s. Its sound starts sun: sss… sun.' }], guided: ['a', 't', 'p', 'i'] }, words, sentences: [], passages: [] };
}

// ---- task types per word ----
export function letterPositions(units){
 // positions of each unit's letters in the spelled word (a_e covers the vowel and the final e)
 const us = units.split('.'), pos = []; let i = 0; const full = spell(units);
 const ends = us.filter(u => u.startsWith('+')).map(u => u.slice(1).replace(/:.*$/, '')).join('');
 us.forEach(u => { const g = u.replace(/^\+/, '').replace(/:.*$/, '');
  if (/^[aeiou]_e$/.test(g)) { const eAt = /^[ei]/.test(ends) ? -1 : full.length - ends.length - 1; pos.push({ u, at: [i, ...(eAt >= 0 ? [eAt] : [])] }); i += 1; }
  else { pos.push({ u, at: Array.from({ length: g.length }, (_, k) => i + k) }); i += g.length; } });
 return pos;
}
export function tasksFor(w, n){
 if (w.letter) return ['letter', 'case'];
 if (w.invented) return w.units ? ['anchor', 'mark'] : ['anchor'];
 const t = ['read', 'hear'];
 if (w.units && n >= 2 && n <= 9 && w.fam && !/cluster/.test(w.fam)) t.push('mark');
 if (w.units && n <= 7) t.push('spell');
 if (n === 7 && /\+ed:/.test(w.units || '')) t.push('edsort');
 if (w.beats) t.push('beats');
 if (n === 12 && w.beats) t.push('stress');
 if (n === 10 && Array.isArray(w.parts)) t.push('parts');
 if (n === 13 && w.tricky) t.push('tricky');
 return t;
}
const pick = (xs, rng) => xs[Math.floor(rng() * xs.length)];

// ---- word memory: ladder per word ----
export function seeWord(S, key, ok, today){
 const r = S.words[key] || (S.words[key] = { step: -1, due: today, right: 0, tries: 0, last: null });
 r.tries++; if (ok) r.right++;
 r.step = ok ? Math.min(LADDER.length - 1, r.step + 1) : 0; r.due = addDays(today, LADDER[Math.max(0, r.step)]); r.last = today;
}

// ---- building today's session ----
export function buildSession(S, C, today, rng = Math.random){
 const n = S.module, M = n === 0 ? module0() : C[n]; if (!M) return null;
 const ms = modState(S, n);
 // a delayed check that has come due takes the day (short practice after it)
 const keepMod = Object.entries(S.mods).find(([k, m]) => m.state === 'keep' && m.keepDue && m.keepDue <= today);
 if (keepMod) return checkSession(S, C, +keepMod[0], 'keep', rng);
 if (ms.state === 'checkA' || (ms.state === 'checkB' && ms.checkA && ms.checkA.day !== today)) return checkSession(S, C, n, ms.state === 'checkA' ? 'A' : 'B', rng);
 const items = [];
 const lesson = !ms.lessonDone ? M.lesson : null;
 const pw = M.words.filter(w => w.role === 'practice');
 const keyOf = (m, w) => `${m}:${w.w}`;
 const rec = w => S.words[keyOf(n, w)];
 // current module: new words first on early days, then due or weak ones
 const fresh = shuffled(pw.filter(w => !rec(w)), rng), due = shuffled(pw.filter(w => rec(w) && rec(w).due <= today), rng), weak = pw.filter(w => rec(w) && rec(w).right / rec(w).tries < .8);
 const fragile = Object.keys(ms.fragile || {});
 const current = [...new Set([...(lesson ? lesson.guided.map(g => pw.find(w => w.w === g)).filter(Boolean) : []), ...pw.filter(w => fragile.includes(w.fam) && rec(w)?.due <= today), ...weak, ...due, ...fresh])].slice(0, lesson ? 8 : 6);
 const transfer = fresh.filter(w => !current.includes(w)).slice(0, 2);
 // older modules: words due for review
 const older = [];
 for (const [k, m] of Object.entries(S.mods)) { if (+k >= n) continue; const MM = +k === 0 ? module0() : C[k]; if (!MM) continue; MM.words.filter(w => w.role === 'practice' && S.words[keyOf(k, w)]?.due <= today).forEach(w => older.push([+k, w])); }
 const olderPick = shuffled(older, rng).slice(0, 4);
 const add = (m, w, tag) => { const ts = tasksFor(w, m); const t = tag === 'transfer' ? ts[0] : pick(ts, rng); items.push({ m, w: w.w, task: t, tag }); };
 olderPick.slice(0, 2).forEach(([m, w]) => add(m, w, 'warm'));
 current.forEach(w => add(n, w, 'current'));
 olderPick.slice(2).forEach(([m, w]) => add(m, w, 'older'));
 if (current.length < 6) shuffled(pw.filter(w => !current.includes(w) && !transfer.includes(w)), rng).slice(0, 6 - current.length).forEach(w => add(n, w, 'current'));
 transfer.forEach(w => add(n, w, 'transfer'));
 const spellable = current.filter(w => tasksFor(w, n).includes('spell')).slice(0, 2);
 spellable.forEach(w => items.push({ m: n, w: w.w, task: 'spell', tag: 'spell' }));
 if (M.sentences.length) { const done = new Set(S.attempts.filter(a => a.kind === 'sentence' && a.m === n).map(a => a.i)); const left = M.sentences.map((_, i) => i).filter(i => !done.has(i)); const i = left.length ? pick(left, rng) : pick(M.sentences.map((_, i) => i), rng); items.push({ m: n, sentence: i, task: 'sentence', tag: 'text' }); }
 if (ms.sessions >= 3 && M.passages.length && ms.sessions % 3 === 0) items.push({ m: n, passage: ms.sessions / 3 % M.passages.length, task: 'passage', tag: 'text' });
 return { kind: 'practice', m: n, lesson, items, day: today };
}

export function checkSession(S, C, n, form, rng = Math.random){
 const M = n === 0 ? module0() : C[n], ms = modState(S, n);
 const pw = M.words.filter(w => w.role === 'practice'), un = M.words.filter(w => w.role === 'unseen');
 const firstHalf = un.slice(0, 10), secondHalf = un.slice(10, 20), rest = un.slice(20);
 if (n === 0) { const items = shuffled(pw, rng).slice(0, form === 'keep' ? 10 : 20).map(w => ({ m: 0, w: w.w, task: pick(['letter', 'case'], rng), tag: 'check' })); return { kind: 'check', form, m: n, items, day: null }; }
 const unseen = form === 'A' ? firstHalf : form === 'B' ? secondHalf : rest.length >= 5 ? rest.slice(0, 5) : shuffled(un, rng).slice(0, 5);
 const known = shuffled(pw, rng).slice(0, form === 'keep' ? 5 : 10);
 const items = shuffled([...known.map(w => ({ m: n, w: w.w, task: tasksFor(w, n)[0], tag: 'check' })), ...unseen.map(w => ({ m: n, w: w.w, task: tasksFor(w, n)[0], tag: 'unseen' }))], rng);
 return { kind: 'check', form, m: n, items, day: null };
}

// ---- after a session ----
// results: [{m, w, task, tag, ok, prompt}] (prompt: 0 = no help … 4 = supplied)
export function finishSession(S, C, ses, results, today){
 const n = ses.m, ms = modState(S, n);
 S.days[today] = { done: true, kind: ses.kind === 'check' ? 'check' + ses.form : 'practice', m: n };
 results.forEach(r => { if (r.w && r.tag !== 'unseen') seeWord(S, `${r.m}:${r.w}`, r.ok && !r.prompt, today); if (r.tag === 'unseen') S.exposed[`${r.m}:${r.w}`] = today; });
 S.attempts.push(...results.filter(r => r.kind).map(r => ({ ...r, day: today })));
 if (S.attempts.length > 400) S.attempts.splice(0, S.attempts.length - 400);
 const out = { moved: null };
 if (ses.kind === 'practice') {
  ms.sessions++; if (ses.lesson) ms.lessonDone = true;
  results.filter(r => r.m === n && r.w && r.tag !== 'unseen').forEach(r => ms.recent.push(r.ok && !r.prompt ? 1 : 0));
  ms.recent = ms.recent.slice(-24);
  const last = ms.recent.slice(-20);
  if (ms.state === 'practice' && ms.sessions >= 2 && last.length >= 20 && last.filter(Boolean).length >= 18) { ms.state = 'checkA'; out.ready = true; }
  return out;
 }
 // a check
 const M = n === 0 ? module0() : C[n];
 const fam = w => (M.words.find(x => x.w === w) || {}).fam;
 const total = results.length, right = results.filter(r => r.ok).length, unseen = results.filter(r => r.tag === 'unseen'), unseenRight = unseen.filter(r => r.ok).length;
 const famMiss = {}; results.filter(r => !r.ok).forEach(r => { const f = fam(r.w) || '?'; famMiss[f] = (famMiss[f] || 0) + 1; });
 const repeated = Object.entries(famMiss).filter(([, c]) => c >= 2).map(([f]) => f);
 const score = { day: today, right, total, unseenRight, unseen: unseen.length, repeated };
 if (ses.form === 'keep') {
  ms.keep = score; const pass = right >= total - 1;
  if (pass) { ms.state = 'mastered'; out.moved = 'mastered'; } else { ms.keepDue = addDays(today, 3); Object.keys(famMiss).forEach(f => ms.fragile[f] = today); out.moved = 'keep-again'; }
  out.score = score; out.pass = pass; return out;
 }
 const need = Math.ceil(total * .95), pass = right >= need && unseenRight >= Math.ceil(unseen.length * .9) && !repeated.length;
 out.score = score; out.pass = pass;
 if (ses.form === 'A') { ms.checkA = score; if (pass) ms.state = 'checkB'; else { ms.state = 'practice'; ms.recent = []; Object.keys(famMiss).forEach(f => ms.fragile[f] = today); } }
 else { ms.checkB = score; if (pass) { ms.state = 'keep'; ms.keepDue = addDays(today, 7); out.moved = 'secure'; if (S.module === n) S.module = Math.min(15, n + 1); } else { ms.state = 'practice'; ms.recent = []; Object.keys(famMiss).forEach(f => ms.fragile[f] = today); } }
 return out;
}

// ---- placement (blueprint D, routed): one probe per module while answers hold; a miss opens all 4 probes of that
// module; fewer than 3 of 4 = start there. Module 0 (letters) is probed with 3 letter items.
export function probeItems(C, n, rng = Math.random){
 if (n === 0) return shuffled(module0().words, rng).slice(0, 3).map(w => ({ m: 0, w: w.w, task: 'letter', tag: 'probe' }));
 const M = C[n]; if (!M) return [];
 return M.words.filter(w => w.role === 'probe').slice(0, 4).map(w => ({ m: n, w: w.w, task: tasksFor(w, n)[0], tag: 'probe' }));
}
export const MODS = MODULES;
