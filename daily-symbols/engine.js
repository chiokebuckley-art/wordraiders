// Daily Symbols rules (no DOM), from the "Symbols Daily Practice" dev handoff §4–§5.
// - Boxes 1–6 with the Daily Definitions rules: right first time (no hint) on a due day = up 1 box, wrong = down 2
//   (never below 1), gaps [0,1,2,4,7,14,30] days, at most one box move per mark per day.
// - "Mastered" = box 3+ and right on 3 different days (2 of them in choose/fix items); "Locked in" = box 6.
//   No credit on the day a mark is introduced, for hinted answers, or for the unscored read-aloud step.
// - Unlocks follow the Journey / First Steps / Sound Code stops in symbols.json; a new tier opens once 75% of the
//   tier before it is in box 3+. First Steps readers get Tier 1 only. Tier 4 needs the grown-up "older marks" switch.
export const GAPS = [0, 1, 2, 4, 7, 14, 30];
export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n, 12).getTime()); };
export const fresh = () => ({ v: 1, seed: Math.floor(Math.random() * 1e9), unlocked: {}, unlockOrder: [], deck: {}, seen: {}, events: [], days: {}, settings: { older: false, read: true }, active: null, today: null });

export function seeded(str){ let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h = h + 0x6d2b79f5 >>> 0; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffle(xs, rng){ const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const arr = x => Array.isArray(x) ? x : [], obj = x => x && typeof x === 'object' && !Array.isArray(x) ? x : {};

// ---------- where the reader is ----------
/** Stops reached, with the same sources Daily Definitions uses (journey passes/attempts, placement, orientation,
 *  First Steps stops) plus Sound Code progress for the long/short vowel marks. */
export function stopsReached(save, fs, sc){
 const out = new Set(), j = obj(save?.journey);
 [...Object.keys(obj(j.passes)), ...Object.keys(obj(j.notYet))].forEach(k => out.add(k));
 if (j.placement) for (const n of [0, 2, 3, 4, 5, 6, 7]) if (n < (j.start?.meaning || 0)) out.add(`P${n}`);
 if (j.seen?.orientation) out.add('P0');
 const f = obj(fs);
 [...arr(f.cleared), ...arr(f.skipped), ...arr(f.attempts).map(a => a?.stop)].filter(n => Number.isInteger(n) && n >= 1 && n <= 11).forEach(n => out.add(`F${n}`));
 if (f.graduatedAt) out.add('F11');
 const s = obj(sc), mods = obj(s.mods), mod = Number(s.module) || 0;
 if (s.placed) { if (mod >= 2 || mods[1]?.lessonDone) out.add('SC-short'); if (mod >= 5 || mods[4]?.lessonDone) out.add('SC-long'); }
 return out;
}
export const modeFor = fs => fs && typeof fs === 'object' && !fs.graduatedAt && (arr(fs.cleared).length || arr(fs.attempts).length) ? 'first-steps' : 'journey';
const STOP_ALIAS = { macron: 'SC-long', breve: 'SC-short' };
/** Why a mark is open for this reader, or null. */
export function opener(m, stops, older){
 if (m.tier === 4 && !older) return null;
 const st = STOP_ALIAS[m.id] || m.stop;
 if (stops.has(st)) return st;
 // Journey readers may never visit First Steps, so the first three marks also open once the Journey has started.
 if (st === 'F3') { const p = [...stops].find(s => /^P\d+$/.test(s)); if (p) return p; }
 if (m.tier === 4 && (st === '—' || !st)) return 'Older marks switched on';
 return null;
}
export function refreshUnlocks(S, MARKS, stops, mode, now = Date.now()){
 const add = [];
 for (const m of MARKS) { if (S.unlocked[m.id] || (mode === 'first-steps' && m.tier > 1)) continue; const why = opener(m, stops, S.settings.older); if (why) add.push([m, why]); }
 add.sort((a, b) => a[0].tier - b[0].tier || MARKS.indexOf(a[0]) - MARKS.indexOf(b[0]));
 for (const [m, why] of add) { S.unlocked[m.id] = { from: why, at: now }; S.unlockOrder.push(m.id); }
 return add.map(([m]) => m.id);
}
export function grownUpUnlock(S, id, now = Date.now()){ if (S.unlocked[id]) return; S.unlocked[id] = { from: 'Grown-up confirmed', at: now }; S.unlockOrder.push(id); }

// ---------- progress ----------
export function status(r){ if (!r) return 'new'; if (r.box >= 6) return 'locked'; if (r.firstMasteredOn) return 'mastered'; return 'learning'; }
/** A tier opens once 75% of the tier before it (marks this reader can get) is in box 3 or higher. */
export function tierOpen(S, MARKS, tier){
 if (tier <= 1) return true;
 const prev = MARKS.filter(m => m.tier === tier - 1 && (m.tier < 4 || S.settings.older));
 if (!prev.length) return true;
 return prev.filter(m => (S.deck[m.id]?.box || 0) >= 3).length >= Math.ceil(prev.length * 0.75);
}
export function nextNew(S, MARKS, mode){
 const by = Object.fromEntries(MARKS.map(m => [m.id, m]));
 const q = S.unlockOrder.filter(id => by[id] && !S.deck[id] && (mode !== 'first-steps' || by[id].tier === 1) && (by[id].tier < 4 || S.settings.older) && tierOpen(S, MARKS, by[id].tier));
 q.sort((a, b) => by[a].tier - by[b].tier || MARKS.indexOf(by[a]) - MARKS.indexOf(by[b]));
 if (!q.length) return [];
 const n = mode === 'first-steps' || by[q[0]].tier <= 2 ? 1 : 2;
 return q.slice(0, n).filter((id, i) => i === 0 || by[id].tier >= 3);
}
export function introduce(S, id, today){
 S.deck[id] = { termId: `sym:${id}`, box: 1, introducedOn: today, dueDate: addDays(today, 1), lastBoxMoveOn: today, lastSeen: today, correctDays: [], cfDays: [], hintedDays: [], timesCorrect: 0, timesWrong: 0, firstMasteredOn: null, lockedInOn: null, types: {} };
}
/** Record a scored answer. Only the first try counts; callers never send retries. */
export function answer(S, id, { correct, hinted, type }, today){
 const r = S.deck[id]; if (!r) return;
 r.lastSeen = today; r.types[type] = (r.types[type] || 0) + 1;
 if (correct) r.timesCorrect++; else r.timesWrong++;
 if (r.introducedOn === today) return;                      // no credit on the first day
 if (hinted) { if (!r.hintedDays.includes(today)) r.hintedDays.push(today); }
 else if (correct) { if (!r.correctDays.includes(today)) r.correctDays.push(today); if ((type === 'choose' || type === 'fix') && !r.cfDays.includes(today)) r.cfDays.push(today); }
 if (r.dueDate <= today && r.lastBoxMoveOn < today) {
  if (correct && !hinted) r.box = Math.min(6, r.box + 1);
  else if (!correct) r.box = Math.max(1, r.box - 2);
  r.dueDate = addDays(today, correct && !hinted ? GAPS[r.box] : 1); r.lastBoxMoveOn = today;
 }
 if (!r.firstMasteredOn && r.box >= 3 && r.correctDays.length >= 3 && r.cfDays.length >= 2) r.firstMasteredOn = today;
 if (!r.lockedInOn && r.box >= 6) r.lockedInOn = today;
}

// ---------- the day ----------
export const MAX_ITEMS = 8, MAX_REVIEW = 6, MIN_ITEMS = 5;
export const spotOK = (m, s) => m.kind !== 'accent' && otherMarks(m, s) >= 2;
let GLYPHS = null;
export function setGlyphs(g){ GLYPHS = g; }
function otherMarks(m, s){ const stem = s.s.replace(/\{[^{}]*\}/g, ' '); return new Set([...stem].filter(ch => GLYPHS && GLYPHS[ch] && GLYPHS[ch] !== m.id)).size; }
/** Pick a sentence for a mark: least recently used, never one used in the last 7 days if there is another choice. */
export function pickSentence(S, m, type, today, rng, strict){
 const pool = m.sentences.map((s, i) => ({ s, i })).filter(x => type !== 'spot' || spotOK(m, x.s));
 if (!pool.length) return null;
 const last = x => S.seen[`${m.id}#${x.i}`] || '0000-00-00';
 const fresh = pool.filter(x => last(x) <= addDays(today, -8) || last(x) === '0000-00-00'), from = fresh.length ? fresh : strict ? [] : pool;
 if (!from.length) return null;
 const oldest = from.map(last).sort()[0];
 const ties = from.filter(x => last(x) === oldest);
 return ties[Math.floor(rng() * ties.length)];
}
/** Which activity type to use for a mark: the one it has had least, so it gets choose, fix and spot in turn. */
export function pickType(S, m, rng, avoid){
 const types = m.kind === 'accent' ? ['choose'] : ['choose', 'fix', 'spot'].filter(t => t !== 'spot' || m.sentences.some(s => spotOK(m, s)));
 const used = S.deck[m.id]?.types || {};
 const sorted = shuffle(types, rng).sort((a, b) => (used[a] || 0) + (a === avoid ? 0.5 : 0) - ((used[b] || 0) + (b === avoid ? 0.5 : 0)));
 return sorted[0];
}
/** Today's plan: [{kind:'meet', id}] [{kind:'item', id, type, sent, practice}] then [{kind:'read'}] */
export function planDay(S, MARKS, today, mode){
 const by = Object.fromEntries(MARKS.map(m => [m.id, m])), rng = seeded(`${S.seed}:${today}`);
 const due = Object.values(S.deck).filter(r => by[r.termId.slice(4)] && r.dueDate <= today && r.lastBoxMoveOn < today && (by[r.termId.slice(4)].tier < 4 || S.settings.older))
  .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.box - b.box || a.termId.localeCompare(b.termId)).slice(0, MAX_REVIEW).map(r => r.termId.slice(4));
 const news = nextNew(S, MARKS, mode).slice(0, Math.max(1, MAX_ITEMS - due.length - 1));
 // New marks: meet it, a review in between, then one try (practice: no credit on its first day).
 const R = due.map(id => ({ kind: 'item', id, practice: false })), items = [];
 for (const id of news) { items.push({ kind: 'meet', id }); if (R.length) items.push(R.shift()); items.push({ kind: 'item', id, practice: true }); }
 items.push(...R);
 // Short days are topped up with extra practice on marks already in the deck (not due), most shaky first.
 const scored = () => items.filter(x => x.kind === 'item').length;
 const extra = Object.values(S.deck).map(r => r.termId.slice(4)).filter(id => by[id] && !due.includes(id) && !news.includes(id) && (by[id].tier < 4 || S.settings.older))
  .sort((a, b) => S.deck[a].box - S.deck[b].box || (S.deck[a].lastSeen || '').localeCompare(S.deck[b].lastSeen || ''));
 for (const id of extra) { if (scored() >= MIN_ITEMS) break; items.push({ kind: 'item', id, practice: true }); }
 // With very few marks, the same mark may come up twice (a different sentence and type).
 const pool = [...news, ...due, ...extra]; let k = 0;
 const per = id => items.filter(x => x.kind === 'item' && x.id === id).length;
 while (scored() < MIN_ITEMS && pool.length && k < pool.length * 2) { const id = pool[k % pool.length]; if (per(id) < 2) items.push({ kind: 'item', id, practice: true }); k++; }
 while (scored() > MAX_ITEMS) { const i = items.map(x => x.kind === 'item' && x.practice).lastIndexOf(true); if (i < 0) break; items.splice(i, 1); }
 // Types and sentences, so one mark never gets the same sentence twice in a day.
 const usedSent = new Set(), lastType = {};
 for (const it of items) {
  if (it.kind !== 'item') continue;
  const m = by[it.id], local = { ...S, seen: { ...S.seen } }; usedSent.forEach(k => { local.seen[k] = today; });
  it.type = pickType(S, m, rng, lastType[it.id]);
  // Prefer a sentence not seen in the last week (switching type if needed); only due and new marks may reuse one.
  const order = [it.type, ...['choose', 'fix', 'spot'].filter(t => t !== it.type && (m.kind !== 'accent' || t === 'choose') && (t !== 'spot' || m.sentences.some(x => spotOK(m, x))))];
  let pick = null;
  for (const t of order) { pick = pickSentence(local, m, t, today, rng, true); if (pick) { it.type = t; break; } }
  if (!pick && !(it.practice && !news.includes(it.id))) pick = pickSentence(local, m, it.type, today, rng, false);
  if (!pick) { it.skip = true; continue; }
  it.sent = pick.i; usedSent.add(`${m.id}#${pick.i}`); lastType[it.id] = it.type;
 }
 const out = items.filter(x => !x.skip);
 if (out.length) out.push({ kind: 'read' });
 return { date: today, items: out, news, due };
}
