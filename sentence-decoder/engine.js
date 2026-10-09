// Sentence Decoder rules (no DOM), from the dev handoff §11–§12:
// - a shuffle bag per level: no item repeats until that level's pool is used up; then missed items come back first
//   (never back-to-back), then the rest at random;
// - stars per stage (Words, Parts, Meaning, Pictures); a sentence is mastered when Words, Meaning and Pictures are
//   right (and Parts from L2 up); a stage still earns its star after its one retry;
// - promotion after consistent success in recent rounds; drop back a level when the meaning or pictures keep being missed.
export const LEVELS = [1, 2, 3, 4];
export const MAX_LEVEL = 4;
export const fresh = () => ({ v: 1, level: 1, best: 1, bags: {}, seen: {}, attempts: [], posAcc: {}, senseAcc: {}, affixAcc: {}, review: [], since: 0 });

export function rngFrom(seed){ let t = seed >>> 0; return () => { t = t + 0x6d2b79f5 >>> 0; let e = Math.imul(t ^ t >>> 15, t | 1); e ^= e + Math.imul(e ^ e >>> 7, e | 61); return ((e ^ e >>> 14) >>> 0) / 4294967296; }; }
export function shuffled(xs, rng = Math.random){ const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/** The next item for this level. Mutates state (bag position, seen set). */
export function nextItem(state, items, level = state.level, rng = Math.random){
 const pool = items.filter(i => i.level === level).map(i => i.id);
 if (!pool.length) return null;
 const last = state.attempts.length ? state.attempts[state.attempts.length - 1].id : null;
 const seen = new Set(state.seen[level] || []);
 let bag = state.bags[level];
 const valid = b => b && Array.isArray(b.order) && b.pos < b.order.length && b.order.every(id => pool.includes(id));
 if (!valid(bag)) {
  const unseen = pool.filter(id => !seen.has(id));
  if (unseen.length) bag = { order: shuffled(unseen, rng), pos: 0 };
  else {
   // Pool used up: missed items first (spaced so the same one never comes twice in a row), then the rest.
   const missed = state.review.filter(id => pool.includes(id)), rest = shuffled(pool.filter(id => !missed.includes(id)), rng);
   let order = [...missed, ...rest];
   if (order.length > 1 && order[0] === last) order = [order[1], order[0], ...order.slice(2)];
   bag = { order, pos: 0 };
   state.seen[level] = [];
  }
  state.bags[level] = bag;
 }
 let id = bag.order[bag.pos];
 if (id === last && bag.order.length - bag.pos > 1) { [bag.order[bag.pos], bag.order[bag.pos + 1]] = [bag.order[bag.pos + 1], bag.order[bag.pos]]; id = bag.order[bag.pos]; }
 bag.pos++;
 (state.seen[level] ||= []).includes(id) || state.seen[level].push(id);
 return items.find(i => i.id === id);
}

export const mastered = (level, stars) => !!(stars.words && stars.meaning && stars.pictures && (level < 2 || stars.parts));

/** Record a finished round. Returns { mastered, moved: 'up' | 'down' | null }. */
export function record(state, item, stars, now = Date.now()){
 const m = mastered(item.level, stars);
 state.attempts.push({ id: item.id, level: item.level, at: now, stars, mastered: m });
 if (state.attempts.length > 50) state.attempts.splice(0, state.attempts.length - 50);
 state.review = state.review.filter(id => id !== item.id);
 if (!m) state.review.push(item.id);
 let moved = null;
 if (item.level === state.level) {
  const recent = state.attempts.filter(a => a.level === state.level && a.at >= state.since).slice(-5);
  if (recent.length >= 5 && recent.filter(a => a.mastered).length >= 4 && state.level < MAX_LEVEL) { state.level++; moved = 'up'; }
  else {
   const last3 = recent.slice(-3);
   if (last3.length === 3 && last3.filter(a => !a.stars.meaning || !a.stars.pictures).length >= 2 && state.level > 1) { state.level--; moved = 'down'; }
  }
  if (moved) { state.since = now + 1; state.best = Math.max(state.best || 1, state.level); }
 }
 return { mastered: m, moved };
}
export function tally(table, key, right){ const r = table[key] || (table[key] = { right: 0, tries: 0 }); r.tries++; if (right) r.right++; }

/** Wrong answers for a word part: meanings of other real parts of the same kind (prefix / suffix / root). */
export function partKind(form){ return /^-/.test(form) ? 'suffix' : /-$/.test(form) ? 'prefix' : 'root'; }
export function partFoils(part, meaning, parts, rng = Math.random){
 const kind = partKind(part), same = parts.filter(p => partKind(p.form) === kind && p.meaning !== meaning && !p.meaning.includes(meaning) && !meaning.includes(p.meaning));
 const pool = same.length >= 2 ? same : parts.filter(p => p.meaning !== meaning);
 return [...new Set(shuffled(pool, rng).map(p => p.meaning))].slice(0, 2);
}

/** Where the split marks go: character positions between letters, e.g. ['un','happy'] -> [2]. */
export function splitPoints(split){ const out = []; let n = 0; for (let i = 0; i < split.length - 1; i++) { n += split[i].length; out.push(n); } return out; }
export const sameSplit = (a, b) => a.length === b.length && [...a].sort((x, y) => x - y).every((v, i) => v === [...b].sort((x, y) => x - y)[i]);
