// Grade Journey rules (no DOM), from the Grade Journey 1–12 dev handoff v2 §6. Grade 1 is built; the data model
// already holds every grade so later grades slot in.
// - Choosing a grade is optional; Skip → placement check; Skip again → Grade 1 (the check is offered again after 3 sessions).
// - Placement: start at the chosen grade (or 1); word reading and comprehension both ≥80% → try the next grade
//   (at most 3 up); either <60% → one grade down (never below 1); place at the highest grade passed.
// - Units unlock in order: the next unit opens once this unit's practice is passed (2 practice passages ≥80%).
// - A unit is passed by unseen check passages ≥80% right on the first try, read-aloud off, on 2 different days.
// - The grade gate also needs: Sound Code checks passed through module 7, and 2 grown-up-scored oral readings at
//   ≥95% accuracy on unseen passages. Writing is optional and never blocks. No certificate without that evidence.
export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n, 12).getTime()); };
export function seeded(str){ let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h = h + 0x6d2b79f5 >>> 0; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffle(xs, rng){ const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export const PASS = 0.8, ORAL_PASS = 0.95, MAX_STEP_UP = 3, BUILT = [1];
export const fresh = () => ({ schema: 2, seed: Math.floor(Math.random() * 1e9), chosenGrade: null, chosenBy: null, chosenAt: null, placedGrade: null, placedBy: null, gradeHistory: [], placement: [], placementSkippedAt: null, sessionsSinceSkip: 0, activePlacement: null, tracks: { decoding: null, comprehension: null, listening: null }, grades: {}, events: [], overrides: [], seen: {}, hidden: {}, days: {}, today: null });
export function gradeRec(S, g){ return S.grades[g] ||= { status: 'in-progress', units: {}, gate: { oral: [], unseenComprehension: [], book: null }, optionalWriting: [], certificate: null, checkFails: [] }; }
export const current = S => S.placedGrade;

// ---------- choosing a grade ----------
export function setGrade(S, g, { by, why, placedBy }, now = Date.now()){
 S.placedGrade = g; S.placedBy = placedBy || by;
 S.gradeHistory.push({ at: dayKey(now), grade: g, why, by });
 gradeRec(S, g);
}
export function chooseGrade(S, g, by, now = Date.now()){ S.chosenGrade = g; S.chosenBy = by; S.chosenAt = dayKey(now); setGrade(S, g, { by, why: `chosen by ${by}`, placedBy: 'chosen' }, now); }
export function skipAll(S, now = Date.now()){ S.chosenGrade = null; S.chosenBy = 'auto'; S.placementSkippedAt = dayKey(now); S.sessionsSinceSkip = 0; setGrade(S, 1, { by: 'auto', why: 'default (grade and check skipped)', placedBy: 'default' }, now); }
export const offerPlacementAgain = S => !!S.placementSkippedAt && !S.placement.length && S.sessionsSinceSkip >= 3;

// ---------- placement ----------
/** Word-reading ladder: stop after 4 misses in a row. */
export function ladderDone(marks){ let run = 0; for (const m of marks) { run = m ? 0 : run + 1; if (run >= 4) return true; } return false; }
/** Share of the ladder words at or below grade g read correctly (unread words after a stop count as missed). */
export function wordPct(words, marks, g){ const idx = words.map((w, i) => [w, i]).filter(([w]) => w.g <= g); if (!idx.length) return null; return idx.filter(([, i]) => marks[i] === true).length / idx.length; }
/** Next step of the placement rule, given the grade just tested and its scores (word may be null = no grown-up). */
export function placementStep(g, word, comp, startGrade, maxGrade){
 const ok = comp >= PASS && (word == null || word >= PASS), low = comp < 0.6 || (word != null && word < 0.6);
 if (ok && g + 1 <= maxGrade && g + 1 <= startGrade + MAX_STEP_UP) return { next: g + 1, passed: g };
 if (ok) return { done: true, passed: g };
 if (low && g > 1) return { next: g - 1, down: true };
 return { done: true, passed: null };
}

// ---------- units ----------
export const isListen = u => u.mode === 'listening';
export function unitRec(S, g, id){ return gradeRec(S, g).units[id] ||= { status: 'locked', practice: [], practiceDone: false, passedDays: [], checks: [] }; }
export function refreshUnits(S, g, UNITS){
 let open = true;
 for (const u of UNITS) {
  const r = unitRec(S, g, u.id);
  if (u.optional) { if (r.status === 'locked') r.status = 'open'; continue; }
  if (open && r.status === 'locked') r.status = 'open';
  open = r.practiceDone || r.status === 'passed' || r.status === 'tested-out';
 }
}
export function currentUnit(S, g, UNITS){ refreshUnits(S, g, UNITS); return UNITS.find(u => !u.optional && !['passed', 'tested-out'].includes(unitRec(S, g, u.id).status)) || null; }
/** Passages for a unit: listening units use their first 2 passages as practice and the rest as checks. */
export function poolOf(PASSAGES, u, kind){
 if (isListen(u)) { const ls = PASSAGES.filter(p => p.unit === u.id && p.pool === 'listening').sort((a, b) => a.id.localeCompare(b.id)); return kind === 'practice' ? ls.slice(0, 2) : ls.slice(2); }
 return PASSAGES.filter(p => p.unit === u.id && p.pool === kind);
}
/** What to read next in a unit: practice until it is passed, then an unseen check (one check pass a day). */
export function nextPassage(S, g, u, PASSAGES, today){
 const r = unitRec(S, g, u.id), vis = p => !S.hidden[p.id];
 if (!r.practiceDone) { const ps = poolOf(PASSAGES, u, 'practice').filter(vis); if (!ps.length) return null; const sorted = ps.slice().sort((a, b) => (S.seen[a.id] || '').localeCompare(S.seen[b.id] || '') || a.id.localeCompare(b.id)); return { p: sorted[0], kind: 'practice' }; }
 if (r.passedDays.includes(today)) return { kind: 'wait' };
 const unseen = poolOf(PASSAGES, u, 'check').filter(p => vis(p) && !S.seen[p.id]);
 if (!unseen.length) return { kind: 'empty' };
 return { p: unseen[0], kind: 'check' };
}
/** Record one passage read (answers in question order: {correct, firstTry}). Returns the result summary. */
export function recordPassage(S, g, u, p, kind, answers, { ttsUsed, seenBefore }, now = Date.now()){
 const day = dayKey(now), right = answers.filter(a => a.correct && a.firstTry).length, n = answers.length, pct = n ? right / n : 0;
 answers.forEach((a, i) => S.events.push({ at: now, itemId: `${p.id}-q${i + 1}`, passageId: p.id, correct: a.correct, firstTry: a.firstTry, ttsUsed: !!ttsUsed, hint: false, seenBefore: !!seenBefore, track: isListen(u) ? 'listening' : 'comprehension', grade: g, unit: u.id, kind, shownOrder: a.shownOrder, pos: a.pos }));
 if (S.events.length > 1500) S.events.splice(0, S.events.length - 1500);
 const r = unitRec(S, g, u.id), out = { pct, right, n, counted: false, unitPassed: false, practiceDone: false };
 if (kind === 'practice') {
  r.practice.push({ at: day, pid: p.id, pct, tts: !!ttsUsed });
  const last = r.practice.slice(-2);
  if (!r.practiceDone && last.length === 2 && last.every(x => x.pct >= PASS)) { r.practiceDone = true; out.practiceDone = true; }
 } else if (kind === 'check' || kind === 'challenge') {
  // Listening checks are read aloud on purpose; reading checks only count with read-aloud off and on a new text.
  const counts = !seenBefore && pct >= PASS && (isListen(u) || !ttsUsed);
  r.checks.push({ at: day, pid: p.id, pct, tts: !!ttsUsed, counted: counts, kind });
  if (counts) { out.counted = true; if (!r.passedDays.includes(day)) r.passedDays.push(day); if (!isListen(u)) gradeRec(S, g).gate.unseenComprehension.push({ at: day, pid: p.id, pct }); }
  else if (!seenBefore) { const f = gradeRec(S, g).checkFails; f.push({ at: day, unit: u.id, pid: p.id, pct, tts: !!ttsUsed }); }
  if (r.passedDays.length >= 2 && r.status !== 'passed') { r.status = 'passed'; r.passedAt = day; out.unitPassed = true; }
 }
 S.seen[p.id] = S.seen[p.id] || day;
 return out;
}
/** Gentle "go back" suggestion: 2 failed checks on different days in the same unit. */
export function needsReview(S, g, uid){ const days = new Set(gradeRec(S, g).checkFails.filter(f => f.unit === uid).map(f => f.at)); return days.size >= 2 && unitRec(S, g, uid).status !== 'passed'; }
/** Skip-ahead challenge: 2 unseen check passages from the last two reading units, both ≥80% → the rest test out. */
export function challengeResult(S, g, UNITS, results, now = Date.now()){
 const passed = results.length >= 2 && results.every(r => r.counted);
 if (passed) for (const u of UNITS) { const r = unitRec(S, g, u.id); if (!u.optional && r.status !== 'passed') { r.status = 'tested-out'; r.testedOutAt = dayKey(now); r.practiceDone = true; } }
 return passed;
}

// ---------- oral reading (grown-up scored) ----------
export function recordOral(S, g, p, { wordsRead, errors, seconds, scoredBy = 'parent' }, now = Date.now()){
 const ok = Math.max(0, wordsRead - errors), acc = wordsRead ? ok / wordsRead : 0, wcpm = Math.round(ok / Math.max(1, seconds) * 60);
 const seenBefore = !!S.seen[p.id];
 const rec = { at: dayKey(now), pid: p.id, title: p.title, wordsRead, errors, seconds, accuracy: +acc.toFixed(3), wcpm, scoredBy, unseen: !seenBefore, counts: !seenBefore && acc >= ORAL_PASS };
 gradeRec(S, g).gate.oral.push(rec); S.seen[p.id] = S.seen[p.id] || rec.at;
 return rec;
}

// ---------- the grade gate + certificate ----------
export function soundCodeThrough(sc, n){ const mods = sc?.mods || {}; const out = []; for (let k = 1; k <= n; k++) { const st = mods[k]?.state; out.push({ n: k, ok: st === 'mastered' || st === 'keep', state: st || null, placedOut: !!mods[k]?.placedOut }); } return out; }
export function gateStatus(S, g, UNITS, sc){
 const G = gradeRec(S, g), req = UNITS.filter(u => !u.optional);
 const units = req.map(u => ({ id: u.id, title: u.title, status: unitRec(S, g, u.id).status }));
 const sound = soundCodeThrough(sc, 7);
 const oral = G.gate.oral.filter(o => o.counts);
 const compDays = [...new Set(G.gate.unseenComprehension.map(c => c.at))];
 const parts = {
  units: { ok: units.every(u => u.status === 'passed' || u.status === 'tested-out'), done: units.filter(u => u.status === 'passed' || u.status === 'tested-out').length, of: units.length },
  soundCode: { ok: sound.every(x => x.ok), done: sound.filter(x => x.ok).length, of: sound.length },
  oral: { ok: oral.length >= 2, done: Math.min(2, oral.length), of: 2 },
  comprehension: { ok: compDays.length >= 2, done: Math.min(2, compDays.length), of: 2 },
 };
 return { parts, met: Object.values(parts).every(p => p.ok), sound, units };
}
export function issueCertificate(S, g, UNITS, sc, now = Date.now()){
 const st = gateStatus(S, g, UNITS, sc), G = gradeRec(S, g); if (!st.met || G.certificate) return G.certificate;
 const comp = G.gate.unseenComprehension, oral = G.gate.oral.filter(o => o.counts), wr = G.optionalWriting.slice(-1)[0];
 G.certificate = { at: dayKey(now), grade: g, passages: comp.length, compPct: Math.round(comp.reduce((a, c) => a + c.pct, 0) / Math.max(1, comp.length) * 100), oralAcc: Math.round(Math.max(...oral.map(o => o.accuracy)) * 100), writing: wr ? `${wr.score}/${wr.of}` : null };
 G.status = 'complete';
 return G.certificate;
}

// ---------- tracks (decoding vs comprehension vs listening) ----------
export function tracks(S, g, UNITS, sc){
 const G = gradeRec(S, g), units = UNITS.filter(u => !u.optional && !isListen(u));
 const lastPassed = [...units].reverse().find(u => ['passed', 'tested-out'].includes(unitRec(S, g, u.id).status));
 const lis = UNITS.find(isListen), lisRec = lis && unitRec(S, g, lis.id);
 const recentListen = S.events.filter(e => e.track === 'listening').slice(-12), recentRead = S.events.filter(e => e.track === 'comprehension' && !e.ttsUsed).slice(-12);
 const pct = es => es.length ? es.filter(e => e.correct && e.firstTry).length / es.length : null;
 return {
  decoding: sc?.placed ? `Sound Code module ${sc.module ?? 0}` : 'Sound Code not started',
  comprehension: lastPassed ? `${lastPassed.id} passed` : 'starting Grade 1',
  listening: lisRec?.status === 'passed' ? 'Grade 1 listening passed' : 'in progress',
  listenPct: pct(recentListen), readPct: pct(recentRead),
  oralLast: G.gate.oral.slice(-1)[0] || null,
 };
}
