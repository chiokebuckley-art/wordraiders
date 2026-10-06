//#region engine.ts
var e = [
	"meaning",
	"details",
	"inspect",
	"phrases",
	"sentences",
	"order",
	"rotation"
], t = () => ({
	version: 1,
	events: []
});
function n(e) {
	let t = new Date(e);
	return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
}
function r(t) {
	if (!t || typeof t != "object" || t.version !== 1 || !Array.isArray(t.events)) return;
	let n = /* @__PURE__ */ new Map();
	for (let r of t.events.slice(-1e4)) {
		if (!r || typeof r != "object" || typeof r.id != "string" || !/^[\w-]{1,100}$/.test(r.id) || typeof r.session != "string" || r.session.length > 100 || !e.includes(r.mode) || !["study", "answer"].includes(r.kind) || typeof r.item != "string" || !/^[\w-]{1,80}$/.test(r.item) || !Number.isFinite(r.at) || r.at < 0 || typeof r.day != "string" || !/^\d{4}-\d{2}-\d{2}$/.test(r.day)) continue;
		let t = {
			id: r.id,
			session: r.session,
			at: r.at,
			day: r.day,
			mode: r.mode,
			item: r.item,
			kind: r.kind,
			ok: r.ok === !0,
			retry: r.retry === !0,
			choices: Math.max(0, Math.min(8, Number(r.choices) || 0)),
			level: Math.max(0, Math.min(4, Math.floor(Number(r.level) || 0))),
			variant: typeof r.variant == "string" ? r.variant.slice(0, 80) : "original"
		}, i = n.get(t.id);
		(!i || JSON.stringify(t) > JSON.stringify(i)) && n.set(t.id, t);
	}
	return {
		version: 1,
		events: [...n.values()].sort((e, t) => e.at - t.at || e.id.localeCompare(t.id)).slice(-5e3)
	};
}
function i(e, t) {
	if (!(!e && !t)) return r({
		version: 1,
		events: [...e?.events ?? [], ...t?.events ?? []]
	});
}
function a(e, t) {
	return i(e, {
		version: 1,
		events: [t]
	});
}
function o(e, t, n) {
	return (e?.events ?? []).filter((e) => e.mode === t && (!n || e.item === n));
}
function s(e, t) {
	let n = /* @__PURE__ */ new Map();
	return o(e, t).filter((e) => {
		if (e.kind !== "answer" || e.retry) return !1;
		let t = n.get(e.item);
		return n.set(e.item, e.at), t === void 0 || e.at - t >= 18e4;
	});
}
function c(e, t) {
	let n = 0, r = s(e, t);
	for (let e = 5; e < r.length; e += 6) {
		let t = r.slice(e - 5, e + 1).filter((e) => e.ok).length;
		t >= 5 ? n = Math.min(4, n + 1) : t <= 3 && (n = Math.max(0, n - 1));
	}
	return n;
}
function l(e, t, r = Date.now()) {
	let i = o(e, "meaning", t), a = i.filter((e) => e.kind === "study"), s = a[0], c = [], l = /* @__PURE__ */ new Set();
	for (let e of i) {
		if (e.kind !== "answer" || !e.ok || e.retry || e.choices < 4 || !s || e.day <= s.day || e.at - s.at < 20 * 36e5 || l.has(e.day) || i.some((t) => t.kind === "study" && t.day === e.day && t.at <= e.at) || i.some((t) => t.kind === "answer" && t.day === e.day && t.at < e.at)) continue;
		let t = c.at(-1), n = c.length === 1 ? 2 : c.length >= 2 ? 4 : 1;
		t && e.at - t.at < n * 20 * 36e5 || (c.push(e), l.add(e.day));
	}
	let u = i.at(-1), d = c.at(-1), f = c.length >= 3, p = c.length === 0 ? 1 : c.length === 1 ? 2 : 4, m = Math.max(d?.at ?? 0, a.at(-1)?.at ?? 0, u?.at ?? 0), h = !!s && !f && n(r) !== u?.day && r - m >= p * 20 * 36e5;
	return {
		seen: !!s,
		mastered: f,
		checks: Math.min(3, c.length),
		due: h,
		nextAt: m + p * 24 * 36e5
	};
}
function u(e, t = Date.now()) {
	return new Set((e?.events ?? []).filter((e) => e.day === n(t) && e.kind === "answer" && !e.retry).map((e) => e.mode + ":" + e.item)).size >= 6;
}
function d(e) {
	return {
		...e,
		id: globalThis.crypto?.randomUUID?.() ?? `pt-${Date.now()}-${Math.random().toString(36).slice(2)}`,
		day: n(e.at)
	};
}
var f = (e, t = Math.random) => {
	let n = [...e];
	for (let e = n.length - 1; e > 0; e--) {
		let r = Math.floor(t() * (e + 1));
		[n[e], n[r]] = [n[r], n[e]];
	}
	return n;
};
//#endregion
export { e as MODES, a as append, n as dayKey, o as evidence, t as fresh, s as independent, c as level, d as makeEvent, i as mergePictureThinking, r as parsePictureThinking, f as shuffle, u as taskDone, l as wordState };
