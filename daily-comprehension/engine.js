// Daily Comprehension rules (no DOM), from the "Daily Comprehension" dev handoff, Phase 1.
// One text a day (a Sentence Decoder sentence or a short Grade Journey practice/listening story):
// read → understand (meaning + show it) → hide & answer → fact / fair guess / not in the text → finish.
// - A text counts as independent only if it is new to the player (or not seen in 14 days), every answer is the
//   first try with no hint, and read-aloud was off. Read-aloud tags the text "audioAssisted" (listening track).
// - "Show again" during hide & answer is allowed and counted; the score is the first answer after hiding.
// - Stages S1–S3. Advance after 8 independent texts on 2+ different days with meaning ≥80% and hide & answer ≥80%;
//   below 70% over the last 8 texts → drop a stage. Yesterday's text comes back as a quick hidden question.
export const ADVANCE_N = 8, ADVANCE_PCT = 0.8, DROP_PCT = 0.7, FRESH_DAYS = 14;
export const STAGES = ['S1', 'S2', 'S3'];
export const BOX_GAP = [1, 1, 2, 4, 7];
export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n, 12).getTime()); };
export const fresh = () => ({ schema: 1, seed: Math.floor(Math.random() * 1e9), stage: 'S1', stageSet: false, stageHistory: [], seen: {}, deck: {}, attempts: [], history: [], days: {}, hidden: {}, settings: { read: true }, today: null });
export function seeded(str){ let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h = h + 0x6d2b79f5 >>> 0; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffle(xs, rng){ const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/** Unlock: Grade Journey started, First Steps stop 3 reached, or Sound Code placed. */
export function unlocked(gj, fs, sc){
 if (gj && gj.placedGrade) return true;
 const stops = [...(fs?.cleared || []), ...(fs?.skipped || []), ...(fs?.attempts || []).map(a => a?.stop)];
 if (stops.some(n => n >= 3)) return true;
 return !!sc?.placed;
}
/** Starting stage from where the player already is (only once; afterwards the advance/drop rules move it). */
export function startStage(S, gj){
 if (S.stageSet) return;
 const g = gj?.placedGrade || 0, u2 = gj?.grades?.[1]?.units?.['G1-U2']?.status;
 S.stage = g >= 2 ? 'S3' : g === 1 && (u2 === 'passed' || u2 === 'tested-out') ? 'S2' : 'S1';
 S.stageSet = true; S.stageHistory.push({ at: dayKey(), stage: S.stage, why: 'start' });
}
/** Today's text for the stage: never seen first, then not seen in 14 days, then the longest ago. */
export function pickText(S, ids, today){
 const ok = ids.filter(id => !S.hidden[id]);
 const never = ok.filter(id => !S.seen[id]); if (never.length) return never[0];
 const old = ok.filter(id => S.seen[id] <= addDays(today, -FRESH_DAYS)).sort((a, b) => S.seen[a].localeCompare(S.seen[b]));
 if (old.length) return old[0];
 return ok.slice().sort((a, b) => S.seen[a].localeCompare(S.seen[b]))[0] || null;
}
export const isFresh = (S, id, today) => !S.seen[id] || S.seen[id] <= addDays(today, -FRESH_DAYS);
/** A review due today (a text from an earlier day whose hide & answer comes back). */
export function dueReview(S, today, exclude){ return Object.entries(S.deck).filter(([id, r]) => id !== exclude && r.nextReview <= today).sort((a, b) => a[1].nextReview.localeCompare(b[1].nextReview))[0]?.[0] || null; }

/** Record one finished text. r = { id, stage, kind, fresh, audio, meaning:[bool], show:bool|null, retrieve:bool, retrieveReplays, inference:bool, confidence } */
export function recordText(S, r, today){
 const independent = r.fresh && !r.audio && !r.hinted;
 const meaningPct = r.meaning.length ? r.meaning.filter(Boolean).length / r.meaning.length : null;
 const h = { at: today, id: r.id, stage: r.stage, kind: r.kind, independent, audio: !!r.audio, meaning: meaningPct, show: r.show, retrieve: r.retrieve, inference: r.inference, replays: r.retrieveReplays || 0, confidence: r.confidence || null };
 S.history.push(h); if (S.history.length > 500) S.history.splice(0, S.history.length - 500);
 S.seen[r.id] = today;
 const d = S.deck[r.id] ||= { box: 0, correctDays: [], nextReview: null, lastAudio: false };
 d.lastAudio = !!r.audio; d.box = r.retrieve ? Math.min(BOX_GAP.length - 1, d.box + 1) : 0; d.nextReview = addDays(today, BOX_GAP[d.box]);
 if (independent && r.retrieve && meaningPct === 1 && !d.correctDays.includes(today)) d.correctDays.push(today);
 return { ...h, moved: checkStage(S, today) };
}
/** A due review answered (yesterday's text, hidden). */
export function recordReview(S, id, correct, today){
 const d = S.deck[id]; if (!d) return;
 d.box = correct ? Math.min(BOX_GAP.length - 1, d.box + 1) : 0; d.nextReview = addDays(today, BOX_GAP[d.box]);
 S.history.push({ at: today, id, stage: S.stage, kind: 'review', review: true, retrieve: correct, independent: false });
}
/** Advance / drop the stage (handoff §3.6). Returns 'up', 'down' or null. */
export function checkStage(S, today){
 const at = S.history.filter(h => !h.review && h.stage === S.stage);
 const ind = at.filter(h => h.independent).slice(-ADVANCE_N);
 const i = STAGES.indexOf(S.stage);
 if (ind.length >= ADVANCE_N && new Set(ind.map(h => h.at)).size >= 2) {
  const m = ind.reduce((a, h) => a + (h.meaning ?? 0), 0) / ind.length, rt = ind.filter(h => h.retrieve).length / ind.length;
  if (m >= ADVANCE_PCT && rt >= ADVANCE_PCT && i < STAGES.length - 1) { S.stage = STAGES[i + 1]; S.stageHistory.push({ at: today, stage: S.stage, why: 'advanced' }); return 'up'; }
 }
 const last = at.slice(-ADVANCE_N);
 if (last.length >= ADVANCE_N) {
  const acc = last.reduce((a, h) => a + ((h.meaning ?? 0) + (h.retrieve ? 1 : 0)) / 2, 0) / last.length;
  if (acc < DROP_PCT && i > 0) { S.stage = STAGES[i - 1]; S.stageHistory.push({ at: today, stage: S.stage, why: 'dropped to re-teach' }); return 'down'; }
 }
 return null;
}
export function logAttempt(S, a){ S.attempts.push({ eventId: `${new Date(a.at).toISOString()}:${S.attempts.length}`, ...a }); if (S.attempts.length > 800) S.attempts.splice(0, S.attempts.length - 800); }
