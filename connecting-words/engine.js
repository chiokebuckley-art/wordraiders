// Connecting Words rules (no DOM), from the "Simplify" dev handoff §5:
// - a day = 2 new words (in the gentle order: and, but, or, because, so → time words → place words → if/also/too →
//   although/however/unless/instead) plus up to 4 review items from earlier days, mixed together;
// - spaced review: a word comes back 2, 7 and 21 days after its lesson; a miss brings it back the next day;
// - "Got it" needs right first answers on 2 different review days (and 2 of 3 lesson tries right first time);
//   only the first answer to an item counts; no self-rating.
export const LADDER = [2, 7, 21];
export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n, 12).getTime()); };
export const fresh = () => ({ v: 1, words: {}, days: {}, log: [], seed: Math.floor(Math.random() * 1e9) });

// Seeded shuffle so a shown order can be reproduced from the log (handoff §5.3).
export function seeded(str){ let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h = h + 0x6d2b79f5 >>> 0; let t = h; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function shuffle(xs, rng){ const a = xs.map((x, i) => ({ x, i })); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function status(r){ if (!r) return 'new'; return r.gotIt ? 'got' : 'learning'; }

/** Today's plan: [{kind:'review', word, item}] mixed with [{kind:'lesson', word}] */
export function planDay(S, WORDS, today){
 const due = WORDS.filter(w => S.words[w.word] && !S.words[w.word].gotIt && S.words[w.word].due <= today)
  .sort((a, b) => S.words[a.word].due.localeCompare(S.words[b.word].due));
 const cap = due.length > 4 ? 6 : 4;          // a backlog (missed days) gets a couple of extra reviews
 const reviews = due.slice(0, cap).map(w => ({ kind: 'review', word: w.word, item: reviewItem(S.words[w.word], w) }));
 // Old "got it" words still come back now and then (every 21 days) as a light top-up, if there is room.
 const keep = WORDS.filter(w => S.words[w.word]?.gotIt && S.words[w.word].due <= today).slice(0, Math.max(0, cap - reviews.length));
 keep.forEach(w => reviews.push({ kind: 'review', word: w.word, item: reviewItem(S.words[w.word], w) }));
 const nNew = due.length > 3 ? 1 : 2;           // reviews waiting: learn one new word, never none, so the path keeps moving
 const fresh = WORDS.filter(w => !S.words[w.word]).slice(0, nNew).map(w => ({ kind: 'lesson', word: w.word }));
 // interleave: review, lesson, review, review, lesson, review
 const out = [], R = [...reviews], L = [...fresh];
 if (R.length) out.push(R.shift()); if (L.length) out.push(L.shift());
 while (R.length || L.length) { if (R.length) out.push(R.shift()); if (R.length) out.push(R.shift()); if (L.length) out.push(L.shift()); }
 return out;
}
// Which item a review uses: the word's checks in turn, then its 2 spare tries.
export function reviewItem(r, w){
 const pool = [...w.checks.map((x, i) => ({ src: 'check', i })), ...w.tries.slice(3).map((x, i) => ({ src: 'try', i: i + 3 }))];
 const n = (r.reviews || 0) % pool.length; return pool[n];
}
export const itemOf = (w, ref) => ref.src === 'check' ? w.checks[ref.i] : w.tries[ref.i];

export function learned(S, word, firstTries, today){
 const ok = firstTries.filter(Boolean).length;
 S.words[word] = { introDay: today, step: 0, due: addDays(today, LADDER[0]), reviews: 0, rightDays: [], lessonRight: ok, misses: 0, gotIt: false };
}
export function reviewed(S, word, ok, today){
 const r = S.words[word]; if (!r) return;
 r.reviews = (r.reviews || 0) + 1;
 if (ok) {
  if (!r.rightDays.includes(today)) r.rightDays.push(today);
  if (!r.gotIt && r.rightDays.length >= (r.lessonRight >= 2 ? 2 : 3)) r.gotIt = true;   // a shaky lesson needs one more good day
  r.step = Math.min(LADDER.length - 1, r.step + (r.missedLast ? 0 : 1)); r.missedLast = false;
  r.due = addDays(today, r.gotIt ? 21 : LADDER[r.step]);
 } else { r.misses++; r.missedLast = true; r.due = addDays(today, 1); }
}
