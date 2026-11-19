// Reading Intelligence statistics (no DOM). Every result carries its sample size (n), what was left out (missing /
// excluded) and a 95% interval where one is defensible. Nothing here invents precision: a measure with too little data
// returns value null and a reason. Events follow the shared schema in ../wr-learning.js.
export const Z = 1.959964;
const T95 = [0, 12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.160, 2.145, 2.131, 2.120, 2.110, 2.101, 2.093, 2.086, 2.080, 2.074, 2.069, 2.064, 2.060, 2.056, 2.052, 2.048, 2.045, 2.042];
export const tCrit = df => df <= 0 ? Infinity : df < T95.length ? T95[df] : df < 60 ? 2.0 + 0.042 * 30 / df : 1.96 + 2.4 / df;
const DAY = 864e5;

/** Wilson score interval for k successes in n trials (proportions 0–1). */
export function wilson(k, n, z = Z){
 if (!n) return null;
 const p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
 return [Math.max(0, c - h), Math.min(1, c + h)];
}
/** A percentage with its interval: { value, k, n, ci:[lo,hi] } in percent; value null when n = 0. */
export function rate(k, n){ const w = wilson(k, n); return { value: n ? 100 * k / n : null, k, n, ci: w ? [100 * w[0], 100 * w[1]] : null }; }
const isScored = e => e && (e.correct === true || e.correct === false);
// Items a checker could answer without the passage (cond.pi) are scored but do not count as independent reading
// evidence, except where using what you already know is the skill: word knowledge, transfer and prediction.
export const PI_COUNTS = new Set(['vocab-context', 'transfer', 'predict']);
export const piExcluded = e => !!e?.cond?.pi && !PI_COUNTS.has(e.skill);
const isIndependent = e => isScored(e) && e.assisted === false && e.firstTry !== false && !piExcluded(e);

/** 1. Accuracy = correct / scored × 100. Unscored events (e.g. unrated writing) are reported as missing. */
export function accuracy(events){ const s = events.filter(isScored); return { ...rate(s.filter(e => e.correct).length, s.length), missing: events.length - s.length }; }
/** 2. Independent mastery = correct unassisted first tries / eligible unassisted first tries × 100. Unknown help is excluded. */
export function independentMastery(events){
 const s = events.filter(isScored), elig = s.filter(isIndependent);
 return { ...rate(elig.filter(e => e.correct).length, elig.length), excludedAssisted: s.filter(e => e.assisted === true).length, excludedUnknownHelp: s.filter(e => e.assisted == null).length, excludedRetries: s.filter(e => e.assisted === false && e.firstTry === false).length };
}
/** 3. Learning gain = post − pre (percentage points), Newcombe's hybrid-score interval for a difference of proportions. */
export function learningGain(preEvents, postEvents){
 const a = preEvents.filter(isIndependent), b = postEvents.filter(isIndependent);
 const k1 = a.filter(e => e.correct).length, n1 = a.length, k2 = b.filter(e => e.correct).length, n2 = b.length;
 const pre = rate(k1, n1), post = rate(k2, n2);
 if (!n1 || !n2) return { pre, post, gain: null, ci: null, reason: !n1 ? 'no pre-assessment yet' : 'no post-assessment yet' };
 const p1 = k1 / n1, p2 = k2 / n2, [l1, u1] = wilson(k1, n1), [l2, u2] = wilson(k2, n2), d = p2 - p1;
 const lo = d - Math.sqrt((p2 - l2) ** 2 + (u1 - p1) ** 2), hi = d + Math.sqrt((u2 - p2) ** 2 + (p1 - l1) ** 2);
 return { pre, post, gain: 100 * d, ci: [100 * lo, 100 * hi], significant: lo > 0 || hi < 0 };
}
/** 4. Retention = correct delayed recall / delayed recall × 100 (only checks taken ≥ minDays after learning). */
export function retention(events, minDays = 1){
 const r = events.filter(e => e.purpose === 'retention' && isScored(e)), ok = r.filter(e => (e.delayDays ?? 0) >= minDays);
 return { ...rate(ok.filter(e => e.correct).length, ok.length), tooSoon: r.length - ok.length, medianDelayDays: median(ok.map(e => e.delayDays)) };
}
/** 5. Transfer = correct unfamiliar application tasks / transfer tasks × 100. */
export function transfer(events){ const t = events.filter(e => e.purpose === 'transfer' && isScored(e)), u = t.filter(e => e.familiar === false); return { ...rate(u.filter(e => e.correct).length, u.length), excludedFamiliar: t.length - u.length }; }
/** 6. Error rate = incorrect / scored × 100. */
export function errorRate(events){ const s = events.filter(isScored); return { ...rate(s.filter(e => !e.correct).length, s.length), byType: countBy(s.filter(e => !e.correct), e => e.error || 'unclassified') }; }
/** 7. Assistance dependency = tasks with help / tasks attempted × 100 (unknown help is reported, not guessed). */
export function assistanceDependency(events){ const known = events.filter(e => e.assisted === true || e.assisted === false); return { ...rate(known.filter(e => e.assisted).length, known.length), unknownHelp: events.length - known.length, byHelp: countBy(events.flatMap(e => e.help || []), h => h) }; }

/** Monday-start UTC week key. */
export function weekKey(t){ const d = new Date(t), day = (d.getUTCDay() + 6) % 7; return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day)).toISOString().slice(0, 10); }
/** Weekly independent accuracy points (only weeks with ≥ minN independent items). */
export function weekly(events, minN = 5){
 const by = {}; for (const e of events.filter(isIndependent)) (by[weekKey(e.at)] ||= []).push(e);
 const keys = Object.keys(by).sort(), first = keys.length ? Date.parse(keys[0]) : 0;
 return keys.map(k => ({ week: k, x: Math.round((Date.parse(k) - first) / (7 * DAY)), ...rate(by[k].filter(e => e.correct).length, by[k].length) })).filter(p => p.n >= minN);
}
/** Ordinary least squares y = a + b·x with the slope's 95% interval. */
export function regression(points){
 const n = points.length; if (n < 3) return null;
 const mx = points.reduce((a, p) => a + p.x, 0) / n, my = points.reduce((a, p) => a + p.y, 0) / n;
 const sxx = points.reduce((a, p) => a + (p.x - mx) ** 2, 0); if (!sxx) return null;
 const b = points.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / sxx, a0 = my - b * mx;
 const sse = points.reduce((s, p) => s + (p.y - a0 - b * p.x) ** 2, 0), se = Math.sqrt(sse / (n - 2) / sxx), t = tCrit(n - 2);
 return { slope: b, intercept: a0, se, ci: [b - t * se, b + t * se], n, df: n - 2 };
}
/** 8. Skill growth per week: slope of weekly independent accuracy (percentage points per week) with its interval. */
export function growthRate(events, { minWeeks = 3, minN = 5 } = {}){
 const pts = weekly(events, minN), r = regression(pts.map(p => ({ x: p.x, y: p.value })));
 if (pts.length < minWeeks || !r) return { value: null, weeks: pts.length, points: pts, reason: `needs ${minWeeks}+ weeks with ${minN}+ independent items (has ${pts.length})` };
 return { value: r.slope, ci: r.ci, weeks: pts.length, points: pts, uncertain: r.ci[0] < 0 && r.ci[1] > 0 };
}
/** 9. Learning efficiency: measured gain (percentage points) per hour of active practice. Null without a measured gain. */
export function learningEfficiency(gain, activeMs){
 if (!gain || gain.gain == null) return { value: null, reason: 'no measured gain yet' };
 if (!activeMs || activeMs < 10 * 60e3) return { value: null, reason: 'less than 10 minutes of recorded practice' };
 const h = activeMs / 36e5; return { value: gain.gain / h, ci: gain.ci ? gain.ci.map(x => x / h) : null, hours: +h.toFixed(2) };
}
/** 10. Mastery stability: independent success across distinct passages, days and delayed checks, plus spread across sessions. */
export function masteryStability(events){
 const ind = events.filter(isIndependent), ok = ind.filter(e => e.correct);
 const distinct = f => new Set(ok.map(f).filter(Boolean)).size, sessions = {};
 for (const e of ind) (sessions[e.session || new Date(e.at).toISOString().slice(0, 10)] ||= []).push(e.correct ? 1 : 0);
 const accs = Object.values(sessions).filter(a => a.length >= 3).map(a => a.reduce((x, y) => x + y, 0) / a.length);
 const delayed = ind.filter(e => e.purpose === 'retention' || e.purpose === 'transfer');
 return { passages: distinct(e => e.content), days: distinct(e => new Date(e.at).toISOString().slice(0, 10)), delayedCorrect: delayed.filter(e => e.correct).length, delayedTotal: delayed.length,
  sessions: accs.length, sessionSD: accs.length >= 2 ? 100 * sd(accs) : null, sessionMean: accs.length ? 100 * mean(accs) : null };
}
/** 11. Calibration: accuracy when the learner said "sure" vs "not sure". */
export function calibration(events){
 const s = events.filter(e => isScored(e) && (e.confidence === 'sure' || e.confidence === 'unsure'));
 const sure = s.filter(e => e.confidence === 'sure'), uns = s.filter(e => e.confidence === 'unsure');
 const A = rate(sure.filter(e => e.correct).length, sure.length), B = rate(uns.filter(e => e.correct).length, uns.length);
 const over = rate(sure.filter(e => !e.correct).length, sure.length), under = rate(uns.filter(e => e.correct).length, uns.length);
 let label = 'not enough data';
 if (sure.length >= 5 && uns.length >= 5) label = A.value - B.value >= 15 ? 'well calibrated' : over.value > 30 ? 'often overconfident' : under.value > 70 ? 'often underconfident' : 'confidence and accuracy only loosely linked';
 else if (sure.length >= 8) label = over.value > 30 ? 'often overconfident' : 'sure answers are mostly right';
 return { whenSure: A, whenUnsure: B, overconfidence: over, underconfidence: under, label, rated: s.length, unrated: events.filter(isScored).length - s.length };
}
/** 12. Reading Transfer Index: independent accuracy on unfamiliar material vs practised material (ratio and difference). */
export function transferIndex(events, minN = 5){
 const ind = events.filter(isIndependent), u = ind.filter(e => e.familiar === false), f = ind.filter(e => e.familiar === true);
 const U = rate(u.filter(e => e.correct).length, u.length), F = rate(f.filter(e => e.correct).length, f.length);
 if (u.length < minN || f.length < minN || !F.value) return { unfamiliar: U, practised: F, index: null, reason: `needs ${minN}+ independent items of each kind` };
 return { unfamiliar: U, practised: F, index: U.value / F.value, difference: U.value - F.value };
}
/** Accuracy by difficulty band (for the accuracy-versus-difficulty graph). */
export function byBand(events){ const g = {}; for (const e of events.filter(isIndependent)) (g[e.band ?? '?'] ||= []).push(e); return Object.keys(g).sort((a, b) => a - b).map(b => ({ band: b, ...rate(g[b].filter(e => e.correct).length, g[b].length) })); }
/** Compare two periods (e.g. 30 days ago vs now) for one event set: change with a Newcombe interval. */
export function comparePeriods(events, [a0, a1], [b0, b1]){ return learningGain(events.filter(e => e.at >= a0 && e.at < a1), events.filter(e => e.at >= b0 && e.at < b1)); }
/** A trend label with its evidence: improved / declined / plateau / not enough data. */
export function trendLabel(cmp, minN = 8){
 if (!cmp || cmp.gain == null || cmp.pre.n < minN || cmp.post.n < minN) return 'not enough data';
 if (cmp.ci[0] > 0) return 'improved'; if (cmp.ci[1] < 0) return 'declined'; return Math.abs(cmp.gain) < 5 ? 'plateau' : 'unclear';
}

export const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
export const sd = a => { if (a.length < 2) return null; const m = mean(a); return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1)); };
export function median(a){ const v = a.filter(x => Number.isFinite(x)).sort((x, y) => x - y); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; }
export function countBy(a, f){ const o = {}; for (const x of a) { const k = f(x); o[k] = (o[k] || 0) + 1; } return o; }
