// WordRaiders Notebook (the wrong-answer notebook, 错题本), the same habit as Engineering Quest's Notebook.
// Every first-try miss in a daily page (Little Words, Daily Symbols, Daily Comprehension, Grade Journey practice)
// becomes a card: what was asked, what the child answered, and what kind of mistake it was. Fixing a card means the
// original again, three questions of the same kind, then one twist. A fix is clean when the original and the three
// are right the first time (the twist may be wrong). Three clean fixes, spaced (today, 3 days, 7 days), clear it.
// A repeat miss on an open card is a lapse, not a new card. Each day the Notebook page asks for up to 3 due fixes;
// with nothing due it offers a 5-question check-up from the child's own old mistakes. No DOM here.
// Saved per player: wr-notebook.<player> = { v, cards: [], days: { 'YYYY-MM-DD': { fixes, checkups, pageDone } } }.
export const CLEAN_TO_CLEAR = 3, LADDER = [0, 3, 7], MAX_ACTIVE = 60, PAGE_SIZE = 3, CHECKUP_SIZE = 5;

export const ERRORS = {
 lookalike: { label: 'Look-alike mix-up', advice: 'Two of these look or sound alike. Say what each one means, then choose.' },
 meaning: { label: 'Meaning mix-up', advice: 'Read the whole sentence again and picture it. Which meaning makes the picture true?' },
 detail: { label: 'Missed a detail', advice: 'Look back at the text. The answer is in the words, so find them first.' },
 memory: { label: 'Forgot after hiding', advice: 'Before you hide it, say it in your own words: who did what?' },
 guess: { label: 'Fact or guess mix-up', advice: 'Ask: are these words in the text? If not, is there a clue that makes it a fair guess?' },
 bigidea: { label: 'Missed the big idea', advice: 'Ask: what is it mostly about? What does the writer want us to know?' },
 mark: { label: 'Wrong mark', advice: 'Say the sentence out loud. Is it telling, asking or showing a feeling? What does the mark do?' },
 unknown: { label: 'Off track', advice: 'Read it slowly once more, then try the ones like it.' },
};
const BIG = ['main', 'theme', 'author', 'claim', 'craft', 'compare', 'inference', 'feature'];
/** What kind of mistake: `skill` is the question kind, `lookalike` says the pick was the item's known confusion. */
export function classify(src, skill, lookalike){
 if (lookalike) return 'lookalike';
 if (src === 'sym') return 'mark';
 if (src === 'lw') return 'meaning';
 if (skill === 'retrieve' || skill === 'review') return 'memory';
 if (skill === 'm5') return 'guess';
 if (skill === 'meaning' || skill === 'vocab') return 'meaning';
 if (BIG.includes(skill)) return 'bigidea';
 if (['literal', 'sequence', 'why', 'evidence', 'pq'].includes(skill)) return 'detail';
 return 'unknown';
}

export const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return dayKey(new Date(y, m - 1, d + n, 12).getTime()); };
export const fresh = () => ({ v: 1, cards: [], days: {} });
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } };
export function activePlayer(){ const r = read('wordraiders.players.v1'); const p = r && Array.isArray(r.profiles) ? r.profiles.find(x => x.id === r.active) : null; return p ? { id: p.id, name: p.name } : { id: 'guest', name: 'Reader' }; }
export const KEY = pid => `wr-notebook.${pid}`;
export function load(pid){ const N = { ...fresh(), ...(read(KEY(pid)) || {}) }; if (!Array.isArray(N.cards)) N.cards = []; if (!N.days || typeof N.days !== 'object') N.days = {}; return N; }
export function save(pid, N){ try { localStorage.setItem(KEY(pid), JSON.stringify(N)); } catch {} }

// A Little Words card is the word (any question type); other cards are one item and one kind of question.
const cardKey = c => c.src === 'lw' ? `lw|${c.ref}` : `${c.src}|${c.ref}|${c.skill}`;
/** Record a miss: m = { src, ref, skill, label, prompt, given, right, lookalike, extra }. Returns the card. */
export function addMiss(N, m, now = Date.now()){
 const today = dayKey(now), kind = classify(m.src, m.skill, m.lookalike);
 const old = N.cards.find(c => !c.clearedAt && cardKey(c) === cardKey(m));
 if (old) { Object.assign(old, { skill: m.skill, given: m.given, right: m.right ?? old.right, prompt: m.prompt || old.prompt, extra: m.extra ?? old.extra, kind, clean: 0, lapses: old.lapses + 1, due: today, lastAt: now }); return old; }
 const card = { id: `nb-${now.toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`, src: m.src, ref: m.ref, skill: m.skill, label: m.label || '', prompt: m.prompt || '', given: m.given ?? '', right: m.right ?? '', extra: m.extra ?? null, kind, createdAt: now, clean: 0, fixes: 0, lapses: 0, due: today, lastAt: now };
 const active = N.cards.filter(c => !c.clearedAt).sort((a, b) => a.lastAt - b.lastAt).slice(-(MAX_ACTIVE - 1)), cleared = N.cards.filter(c => c.clearedAt).slice(-40);
 N.cards = [...active, ...cleared, card];
 return card;
}
/** For the daily pages: record a miss for the active player in one call (never throws). */
export function miss(m){ try { const P = activePlayer(), N = load(P.id); addMiss(N, m); save(P.id, N); } catch {} }

export const activeCards = N => N.cards.filter(c => !c.clearedAt).sort((a, b) => a.due.localeCompare(b.due) || a.lastAt - b.lastAt);
export const dueCards = (N, today = dayKey()) => activeCards(N).filter(c => c.due <= today);

/** A finished fix: results = first-try right/wrong for [original, …variations, twist]. */
export function applyFix(N, id, results, now = Date.now()){
 const c = N.cards.find(x => x.id === id), today = dayKey(now);
 const core = results.slice(0, Math.max(1, results.length - 1)), clean = core.length > 0 && core.every(Boolean);
 const d = N.days[today] ||= { fixes: 0, checkups: 0 }; d.fixes++;
 if (!c) return { clean, cleared: false, due: null };
 c.fixes++; c.lastAt = now;
 if (!clean) { c.clean = 0; c.lapses++; c.due = addDays(today, 1); }
 else { c.clean++; if (c.clean >= CLEAN_TO_CLEAR) c.clearedAt = now; else c.due = addDays(today, LADDER[Math.min(LADDER.length - 1, c.clean)]); }
 pageCheck(N, today);
 return { clean, cleared: !!c.clearedAt, due: c.clearedAt ? null : c.due };
}
export function applyCheckup(N, now = Date.now()){ const today = dayKey(now), d = N.days[today] ||= { fixes: 0, checkups: 0 }; d.checkups++; d.pageDone = true; }
function pageCheck(N, today){ const d = N.days[today]; if (d.fixes >= PAGE_SIZE || !dueCards(N, today).length) d.pageDone = true; }

const dayDone = d => !!d && (d.fixes || 0) + (d.checkups || 0) > 0;
export function streak(N, today = dayKey()){ let k = dayDone(N.days[today]) ? today : addDays(today, -1), n = 0; while (n < 400 && dayDone(N.days[k])) { n++; k = addDays(k, -1); } return n; }
export function week(N, today = dayKey()){ return Array.from({ length: 7 }, (_, j) => { const k = addDays(today, j - 6), [y, m, d] = k.split('-').map(Number); return { key: k, label: 'SMTWTFS'[new Date(y, m - 1, d, 12).getDay()], done: dayDone(N.days[k]), today: j === 6 }; }); }
/** Today's page: 'fix' (cards due), 'checkup' (nothing due, old mistakes to check), 'done', or 'empty' (no cards yet). */
export function page(N, today = dayKey()){
 const d = N.days[today] || {}, due = dueCards(N, today), fixed = d.fixes || 0;
 const mode = d.pageDone ? 'done' : due.length && fixed < PAGE_SIZE ? 'fix' : fixed + (d.checkups || 0) > 0 ? 'done' : N.cards.length ? 'checkup' : 'empty';
 return { mode, due, fixed, target: Math.min(PAGE_SIZE, fixed + due.length), done: mode === 'done', streak: streak(N, today), week: week(N, today) };
}
