// Little Words Daily rules (no DOM). 60 little words (the Small Common Word Academy's word uses); 50 a day in
// 5 rounds of 10. Each day takes the 50 weakest words: not yet known first, then the fewest right days, then the
// longest since last seen. A word is "known" after a right first answer on 3 different days; a miss brings it back
// tomorrow. Words met for the first time get a short "meet the word" card before their question.
export const PER_DAY = 50, ROUND = 10, KNOWN_DAYS = 3;
export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n, 12).getTime()); };
export const fresh = () => ({ v: 1, seed: Math.floor(Math.random() * 1e9), words: {}, days: {}, log: [], settings: { read: true }, today: null });
export function seeded(str){ let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h = h + 0x6d2b79f5 >>> 0; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffle(xs, rng){ const a = xs.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export const known = r => !!r && r.correctDays.length >= KNOWN_DAYS;
export const rec = (S, id) => S.words[id] ||= { met: null, correctDays: [], wrongDays: [], lastSeen: null, seen: 0 };
/** Units whose pictures show the meaning on their own (place, movement, amounts, time). */
export const PICTURE_UNITS = [0, 1, 4, 5];
/** Today's 50: weakest first; ties keep the academy's order so related words (in, on, under…) arrive together. */
export function pickWords(S, USES, today, n = PER_DAY){
 const yday = addDays(today, -1);
 const score = (u, i) => { const r = S.words[u.id]; return [known(r) ? 1 : 0, r?.wrongDays.includes(yday) ? 0 : 1, r ? r.correctDays.length : -1, r?.lastSeen || '', i]; };
 const cmp = (a, b) => { for (let k = 0; k < a.length; k++) { if (a[k] < b[k]) return -1; if (a[k] > b[k]) return 1; } return 0; };
 return USES.map((u, i) => ({ u, s: score(u, i) })).sort((a, b) => cmp(a.s, b.s)).slice(0, n).map(x => x.u.id);
}
/** Question type for a word: rotate meaning → picture → gap. Picture and gap questions only for place, movement,
 *  amount and time words, where the picture settles the answer; pointing and joining words (a/the, and/or…) get
 *  meaning questions, since two of them can sound right in the same gap. */
export function typeFor(S, u, hasGap){
 const types = ['meaning', ...(PICTURE_UNITS.includes(u.unit) ? ['picture'] : []), ...(hasGap && PICTURE_UNITS.includes(u.unit) ? ['gap'] : [])];
 return types[(S.words[u.id]?.seen || 0) % types.length];
}
export function planDay(S, USES, today, hasGap){
 const by = Object.fromEntries(USES.map(u => [u.id, u]));
 const ids = pickWords(S, USES, today);
 return { date: today, items: ids.map(id => ({ id, type: typeFor(S, by[id], hasGap(by[id])), teach: !S.words[id]?.met })), i: 0, results: [], done: false, startedAt: Date.now() };
}
/** Record the first answer to a word's question (retries never count). */
export function answer(S, id, correct, today){
 const r = rec(S, id); r.seen++; r.lastSeen = today; if (!r.met) r.met = today;
 if (correct) { if (!r.correctDays.includes(today)) r.correctDays.push(today); r.wrongDays = r.wrongDays.filter(d => d !== today); }
 else if (!r.wrongDays.includes(today)) r.wrongDays.push(today);
}
export const roundOf = i => Math.floor(i / ROUND) + 1;
export const ROUNDS = PER_DAY / ROUND;
