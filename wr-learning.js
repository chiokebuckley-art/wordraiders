// WordRaiders learning-evidence store (shared schema v1). One event per scored response, kept per learner on this device:
//   wr-li.<player>      { v, events: [...] }  (newest MAX kept)
//   wr-li-meta.<player> { v, imported: {source: watermark}, baseline, schedule, interventions, overrides, conditions, band, ... }
// Event: { v, id, at, app, src, item, content, skill, vars, phase, purpose, familiar, band, difficulty, correct, score,
//          firstTry, attempts, assisted (true/false/null = unknown), help, rtMs, confidence, error, explain, cond, session,
//          delayDays }
// `assisted: null` (help unknown, e.g. older imported answers) never counts as independent evidence. Engineering Quest's
// evidence (independent / purpose / difficulty / family) maps onto the same fields; see docs/reading-intelligence/PLAN.md.
export const SCHEMA = 1, MAX = 6000;
export const PURPOSES = ['baseline', 'practice', 'intervention', 'reassess', 'retention', 'transfer', 'posttest', 'imported'];
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } };
export function activePlayer(){ const r = read('wordraiders.players.v1'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Reader' }; }
export function players(){ const r = read('wordraiders.players.v1'); return r && Array.isArray(r.profiles) ? r.profiles.map(p => ({ id: p.id, name: p.name })) : []; }
export const KEY = pid => `wr-li.${pid}`, META = pid => `wr-li-meta.${pid}`;
export function load(pid){ const s = read(KEY(pid)); return s && Array.isArray(s.events) ? s : { v: SCHEMA, events: [] }; }
export function meta(pid){ return { v: SCHEMA, imported: {}, schedule: [], interventions: [], overrides: {}, conditions: [], sessions: [], ...(read(META(pid)) || {}) }; }
export function saveMeta(pid, M){ return write(META(pid), M); }
export function save(pid, S){ if (S.events.length > MAX) S.events.splice(0, S.events.length - MAX); return write(KEY(pid), S); }
let seq = 0;
/** Normalise one event (fills id, time, schema version; clamps fields). */
export function make(e){
 const at = Number.isFinite(e.at) ? e.at : Date.now();
 return { v: SCHEMA, id: e.id || `${e.src || 'x'}:${at.toString(36)}:${(seq++).toString(36)}:${Math.floor(Math.random() * 1e6).toString(36)}`, at, app: e.app || 'wordraiders', src: e.src || 'ria',
  item: e.item ?? null, content: e.content ?? null, skill: e.skill || 'unknown', vars: e.vars || [], phase: e.phase ?? null, purpose: PURPOSES.includes(e.purpose) ? e.purpose : 'practice',
  familiar: e.familiar ?? null, band: e.band ?? null, difficulty: e.difficulty ?? null, correct: e.correct === true || e.correct === false ? e.correct : null, score: Number.isFinite(e.score) ? e.score : null,
  firstTry: e.firstTry !== false, attempts: e.attempts ?? 1, assisted: e.assisted === true || e.assisted === false ? e.assisted : null, help: e.help || [], rtMs: Number.isFinite(e.rtMs) ? Math.round(e.rtMs) : null,
  confidence: e.confidence ?? null, error: e.error ?? null, explain: e.explain ?? null, cond: e.cond ?? null, session: e.session ?? null, delayDays: e.delayDays ?? null };
}
/** Add events (deduplicated by id). Returns the stored events. */
export function record(pid, events){
 const S = load(pid), ids = new Set(S.events.map(e => e.id));
 for (const e of [].concat(events)) { const x = make(e); if (!ids.has(x.id)) { S.events.push(x); ids.add(x.id); } }
 S.events.sort((a, b) => a.at - b.at); save(pid, S); return S.events;
}
/** Every key this learner's evidence lives in (for export and deletion). */
export function evidenceKeys(pid){ return [KEY(pid), META(pid)]; }
export function exportJSON(pid){ return JSON.stringify({ schema: SCHEMA, exportedAt: new Date().toISOString(), learner: pid, events: load(pid).events, meta: meta(pid) }, null, 1); }
/** CSV of every event. A grown-up's correction of a written answer is its own column; the original verdict is kept. */
export function exportCSV(pid){
 const cols = ['id', 'date', 'src', 'purpose', 'skill', 'vars', 'content', 'item', 'band', 'familiar', 'correct', 'score', 'firstTry', 'assisted', 'help', 'rtMs', 'confidence', 'error', 'rubric', 'grownup_correction', 'delayDays'];
 const cell = v => `"${String(v ?? '').replace(/"/g, '""')}"`, O = meta(pid).overrides || {};
 const val = (e, c) => c === 'date' ? new Date(e.at).toISOString() : c === 'vars' || c === 'help' ? (e[c] || []).join(' ') : c === 'rubric' ? (e.explain ? `${e.explain.verdict} ${e.explain.found}/${e.explain.of}` : '') : c === 'grownup_correction' ? (O[e.id]?.verdict || '') : e[c];
 return [cols.join(','), ...load(pid).events.map(e => cols.map(c => cell(val(e, c))).join(','))].join('\n');
}
/** Delete this learner's Academy evidence (not their game progress in other pages). */
export function deleteEvidence(pid){ for (const k of evidenceKeys(pid)) try { localStorage.removeItem(k); } catch {} }
