import { MODES as e, append as t, evidence as n, fresh as r, independent as i, level as a, makeEvent as o, shuffle as s, taskDone as c, wordState as l } from "./picture-thinking-engine.js";
import { useEffect as u, useRef as d, useState as f } from "./picture-thinking-react.js";
import { Fragment as p, jsx as m, jsxs as h } from "./picture-thinking-react.js";
var g = [
	[
		"apple",
		"A crisp fruit with thin edible skin and a core, often red or green.",
		"fruit"
	],
	[
		"mug",
		"A drinking container with a handle, often used for warm drinks.",
		"drink"
	],
	[
		"pen",
		"A tool that writes with ink.",
		"writing"
	],
	[
		"pencil",
		"A tool that writes with a graphite tip and can be erased.",
		"writing"
	],
	[
		"lamp",
		"An object that gives light.",
		"home"
	],
	[
		"ball",
		"A round object used in games.",
		"toy"
	],
	[
		"key",
		"A shaped piece that opens a matching lock.",
		"tool"
	],
	[
		"book",
		"Pages joined together for reading.",
		"home"
	],
	[
		"chair",
		"A seat with a back, usually for one person.",
		"furniture"
	],
	[
		"fish",
		"An animal with fins that lives in water.",
		"animal"
	],
	[
		"fork",
		"A tool with pointed prongs used for eating.",
		"tool"
	],
	[
		"umbrella",
		"A cover you hold above you to keep off rain.",
		"clothing"
	],
	[
		"shoe",
		"Something you wear on your foot.",
		"clothing"
	],
	[
		"hat",
		"Something you wear on your head.",
		"clothing"
	],
	[
		"dog",
		"A pet that barks.",
		"animal"
	],
	[
		"cat",
		"A pet that meows.",
		"animal"
	],
	[
		"tree",
		"A tall plant with a woody trunk and branches.",
		"plant"
	],
	[
		"flower",
		"The colorful part of a plant that can make seeds.",
		"plant"
	],
	[
		"banana",
		"A long fruit with a peel, often yellow.",
		"fruit"
	],
	[
		"orange",
		"A round citrus fruit with a thick peel.",
		"fruit"
	],
	[
		"car",
		"A road vehicle that usually carries a few people.",
		"vehicle"
	],
	[
		"bus",
		"A large road vehicle that carries many passengers.",
		"vehicle"
	],
	[
		"boat",
		"A vehicle that travels on water.",
		"vehicle"
	],
	[
		"clock",
		"An object that shows the time.",
		"home"
	]
].map(([e, t, n]) => ({
	id: e,
	definition: t,
	group: n,
	file: `${e}-noun.webp`
})), _ = Object.fromEntries(g.map((e) => [e.id, e])), v = [
	{
		id: "apple-color",
		word: "apple",
		feature: "color",
		original: "apple-noun.webp",
		variant: "pt-foil-apple-green.webp",
		wrong: "green",
		answer: "red",
		options: [
			"red",
			"green",
			"blue",
			"yellow"
		]
	},
	{
		id: "apple-leaf",
		word: "apple",
		feature: "leaf",
		original: "apple-noun.webp",
		variant: "pt-foil-apple-no-leaf.webp",
		wrong: "without a leaf",
		answer: "with a leaf",
		options: ["with a leaf", "without a leaf"]
	},
	{
		id: "mug-color",
		word: "mug",
		feature: "color",
		original: "mug-noun.webp",
		variant: "pt-foil-mug-red.webp",
		wrong: "red",
		answer: "blue",
		options: [
			"blue",
			"red",
			"green",
			"yellow"
		]
	},
	{
		id: "mug-handle",
		word: "mug",
		feature: "handle",
		original: "mug-noun.webp",
		variant: "pt-foil-mug-handle-left.webp",
		wrong: "on your left",
		answer: "on your right",
		options: ["on your right", "on your left"]
	},
	{
		id: "pen-color",
		word: "pen",
		feature: "color",
		original: "pen-noun.webp",
		variant: "pt-foil-pen-red.webp",
		wrong: "red",
		answer: "blue",
		options: [
			"blue",
			"red",
			"green",
			"yellow"
		]
	},
	{
		id: "lamp-light",
		word: "lamp",
		feature: "light",
		original: "lamp-noun.webp",
		variant: "pt-foil-lamp-off.webp",
		wrong: "off",
		answer: "on",
		options: ["on", "off"]
	},
	{
		id: "lamp-shade",
		word: "lamp",
		feature: "shade color",
		original: "lamp-noun.webp",
		variant: "pt-foil-lamp-red-shade.webp",
		wrong: "red",
		answer: "yellow",
		options: [
			"yellow",
			"red",
			"blue",
			"green"
		]
	}
], y = [
	"above",
	"below",
	"inside",
	"beside",
	"behind",
	"in front of"
], b = [
	"chasing",
	"following",
	"feeding",
	"pulling"
], ee = {
	meaning: "Word meanings",
	details: "Remember the picture",
	inspect: "Notice one detail",
	phrases: "Picture phrases",
	sentences: "Picture sentences",
	order: "Picture order",
	rotation: "Turn the block"
}, x = (e) => new URL(e.startsWith("pt-") ? `../picture-thinking/${e}` : `../word-pics/${e}`, import.meta.url).href;
//#endregion
//#region Visuals.tsx
function S({ relation: e }) {
	let t = (e, t) => /* @__PURE__ */ h("g", { children: [
		/* @__PURE__ */ m("ellipse", {
			cx: e,
			cy: t + 22,
			rx: "29",
			ry: "7",
			fill: "#172d4920"
		}),
		/* @__PURE__ */ m("circle", {
			cx: e,
			cy: t,
			r: "23",
			fill: "#f1694e",
			stroke: "#963927",
			strokeWidth: "3"
		}),
		/* @__PURE__ */ m("path", {
			d: `M${e - 14},${t - 8}q8,-12 20,-9`,
			stroke: "#ffd8c6",
			strokeWidth: "5",
			fill: "none",
			strokeLinecap: "round"
		})
	] }), n = /* @__PURE__ */ h("g", { children: [
		/* @__PURE__ */ m("path", {
			d: "M98 101 L197 101 L208 126 L88 126Z",
			fill: "#e5ad63"
		}),
		/* @__PURE__ */ m("rect", {
			x: "91",
			y: "122",
			width: "113",
			height: "68",
			rx: "5",
			fill: "#be8143",
			stroke: "#83582e",
			strokeWidth: "3"
		}),
		/* @__PURE__ */ m("path", {
			d: "M91 142H204",
			stroke: "#e4b77b",
			strokeWidth: "4"
		})
	] });
	return /* @__PURE__ */ h("svg", {
		viewBox: "0 0 300 260",
		role: "img",
		"aria-label": `A ball ${e} a box`,
		children: [
			/* @__PURE__ */ m("rect", {
				width: "300",
				height: "260",
				rx: "20",
				fill: "#f2eee3"
			}),
			/* @__PURE__ */ m("path", {
				d: "M20 210H280",
				stroke: "#d9cdb6",
				strokeWidth: "3"
			}),
			e === "behind" && t(157, 117),
			n,
			e === "above" && t(148, 50),
			e === "below" && t(148, 226),
			e === "inside" && /* @__PURE__ */ h(p, { children: [t(148, 130), /* @__PURE__ */ m("path", {
				d: "M91 145H204V190H91Z",
				fill: "#be8143",
				stroke: "#83582e",
				strokeWidth: "3"
			})] }),
			e === "beside" && t(249, 166),
			e === "in front of" && t(151, 180)
		]
	});
}
function C({ x: e, color: t, facing: n = 1 }) {
	return /* @__PURE__ */ h("g", {
		transform: `translate(${e},0) scale(${n},1)`,
		children: [
			/* @__PURE__ */ m("circle", {
				cy: "91",
				r: "17",
				fill: "#aa6943"
			}),
			/* @__PURE__ */ m("path", {
				d: "M-16 81q4-18 26-9l6 16",
				fill: "#3e2a25"
			}),
			/* @__PURE__ */ m("path", {
				d: "M-9 110H10L20 162H-20Z",
				fill: t
			}),
			/* @__PURE__ */ m("path", {
				d: "M-6 163L-20 194M7 163L27 190M-12 124L-31 148M12 124L36 135",
				stroke: "#aa6943",
				strokeWidth: "9",
				strokeLinecap: "round"
			}),
			/* @__PURE__ */ m("circle", {
				cx: "8",
				cy: "90",
				r: "2.5",
				fill: "#222"
			})
		]
	});
}
function te({ action: e, reversed: t }) {
	let n = t ? "#ed8658" : "#4d92d3", r = t ? "#4d92d3" : "#ed8658";
	return /* @__PURE__ */ h("svg", {
		viewBox: "0 0 340 240",
		role: "img",
		"aria-label": `The ${t ? "orange" : "blue"} person is ${e} the ${t ? "blue" : "orange"} person`,
		children: [
			/* @__PURE__ */ m("rect", {
				width: "340",
				height: "240",
				rx: "20",
				fill: "#eef2df"
			}),
			/* @__PURE__ */ m("path", {
				d: "M20 205H320",
				stroke: "#bdd3a0",
				strokeWidth: "4"
			}),
			e === "feeding" ? /* @__PURE__ */ h(p, { children: [
				/* @__PURE__ */ m(C, {
					x: 100,
					color: n
				}),
				/* @__PURE__ */ m(C, {
					x: 240,
					color: r,
					facing: -1
				}),
				/* @__PURE__ */ m("path", {
					d: "M138 135H207",
					stroke: "#737b89",
					strokeWidth: "5"
				}),
				/* @__PURE__ */ m("ellipse", {
					cx: "211",
					cy: "134",
					rx: "11",
					ry: "5",
					fill: "#e7aa4e"
				})
			] }) : e === "pulling" ? /* @__PURE__ */ h(p, { children: [
				/* @__PURE__ */ m(C, {
					x: 225,
					color: n
				}),
				/* @__PURE__ */ m(C, {
					x: 85,
					color: r
				}),
				/* @__PURE__ */ m("path", {
					d: "M122 136Q160 151 195 145",
					stroke: "#977645",
					strokeWidth: "5"
				}),
				/* @__PURE__ */ m("path", {
					d: "M264 72H308l-10-9m10 9-10 9",
					stroke: "#445c71",
					strokeWidth: "4",
					fill: "none"
				})
			] }) : /* @__PURE__ */ h(p, { children: [
				/* @__PURE__ */ m(C, {
					x: 95,
					color: n
				}),
				/* @__PURE__ */ m(C, {
					x: 240,
					color: r
				}),
				e === "chasing" && /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ m("path", {
					d: "M35 135H58M28 151H56M178 135H200M169 151H198",
					stroke: "#809aa4",
					strokeWidth: "4",
					strokeLinecap: "round"
				}), /* @__PURE__ */ m("path", {
					d: "M120 47Q177 24 225 47l-11-1m11 1-7-10",
					stroke: "#445c71",
					strokeWidth: "4",
					fill: "none"
				})] })
			] })
		]
	});
}
function w({ angle: e = 0, mirror: t = !1 }) {
	let n = [
		[
			0,
			0,
			0
		],
		[
			1,
			0,
			0
		],
		[
			2,
			0,
			0
		],
		[
			3,
			0,
			0
		],
		[
			0,
			1,
			0
		],
		[
			0,
			2,
			0
		],
		[
			0,
			0,
			1
		]
	], r = e * Math.PI / 180, i = ([e, n, i]) => {
		e = t ? 1 - e : e - 1, n -= .6;
		let a = e * Math.cos(r) - n * Math.sin(r), o = e * Math.sin(r) + n * Math.cos(r);
		return [150 + (a - o) * 29, 165 + (a + o) * 15 - i * 43];
	}, a = [];
	for (let [e, o, s] of n) {
		let n = [
			{
				v: [
					[
						e,
						o,
						s + 1
					],
					[
						e + 1,
						o,
						s + 1
					],
					[
						e + 1,
						o + 1,
						s + 1
					],
					[
						e,
						o + 1,
						s + 1
					]
				],
				c: "#e8bb78"
			},
			{
				v: [
					[
						e,
						o,
						s
					],
					[
						e + 1,
						o,
						s
					],
					[
						e + 1,
						o,
						s + 1
					],
					[
						e,
						o,
						s + 1
					]
				],
				c: "#b27b44"
			},
			{
				v: [
					[
						e + 1,
						o,
						s
					],
					[
						e + 1,
						o + 1,
						s
					],
					[
						e + 1,
						o + 1,
						s + 1
					],
					[
						e + 1,
						o,
						s + 1
					]
				],
				c: "#ca965b"
			},
			{
				v: [
					[
						e,
						o + 1,
						s
					],
					[
						e,
						o,
						s
					],
					[
						e,
						o,
						s + 1
					],
					[
						e,
						o + 1,
						s + 1
					]
				],
				c: "#ba864c"
			},
			{
				v: [
					[
						e + 1,
						o + 1,
						s
					],
					[
						e,
						o + 1,
						s
					],
					[
						e,
						o + 1,
						s + 1
					],
					[
						e + 1,
						o + 1,
						s + 1
					]
				],
				c: "#d4a365"
			}
		];
		for (let e of n) {
			let n = e.v.reduce((e, t) => e.map((e, n) => e + t[n] / 4), [
				0,
				0,
				0
			]), o = (t ? -n[0] : n[0]) * (Math.sin(r) + Math.cos(r)) + n[1] * (Math.cos(r) - Math.sin(r)) + n[2] * .2;
			a.push({
				p: e.v.map(i),
				depth: o,
				fill: e.c
			});
		}
	}
	return /* @__PURE__ */ h("svg", {
		viewBox: "0 0 300 280",
		role: "img",
		"aria-label": "A wooden shape viewed from an angle",
		children: [/* @__PURE__ */ m("rect", {
			width: "300",
			height: "280",
			rx: "20",
			fill: "#f2eee3"
		}), a.sort((e, t) => e.depth - t.depth).map((e, t) => /* @__PURE__ */ m("polygon", {
			points: e.p.map((e) => e.join(",")).join(" "),
			fill: e.fill,
			stroke: "#765430",
			strokeWidth: "1.5",
			strokeLinejoin: "round"
		}, t))]
	});
}
function T({ words: e, hidden: t = !1 }) {
	return /* @__PURE__ */ m("div", {
		className: "pt-board",
		"aria-label": "Three fixed places, from left to right",
		children: [
			"Bed",
			"Window",
			"Door"
		].map((n, r) => /* @__PURE__ */ h("div", {
			className: "pt-spot",
			children: [
				/* @__PURE__ */ m("span", { children: n }),
				/* @__PURE__ */ m("div", {
					className: "pt-room-icon pt-room-" + n.toLowerCase(),
					"aria-hidden": "true"
				}),
				!t && e[r] && /* @__PURE__ */ m("img", {
					src: x(`${e[r]}-noun.webp`),
					alt: e[r]
				})
			]
		}, n))
	});
}
//#endregion
//#region PictureThinking.tsx
var ne = {
	meaning: "Hear a word. Learn its meaning. Remember it on later days.",
	details: "Look, hide, then find the exact picture you saw.",
	inspect: "Remember one feature, such as color or a handle.",
	phrases: "See what words such as above and behind mean.",
	sentences: "Find who is doing the action and who receives it.",
	order: "Remember three learned pictures in order.",
	rotation: "Compare a wooden shape from different angles."
};
function E(e, t, r, i) {
	let o = a(t, e), c = (e) => s(e.filter((e) => !r.includes(e.id)))[0];
	if (e === "meaning") {
		let e = g.filter((e) => l(t, e.id).due && !r.includes(e.id)), n = c(e.length ? e : g.some((e) => !l(t, e.id).mastered) ? g.filter((e) => !l(t, e.id).mastered) : g);
		if (!n) return null;
		let i = l(t, n.id), a = i.due, u = i.seen, d = a && i.checks >= 1, f = d ? v.find((e) => e.word === n.id)?.variant ?? n.file : n.file, p = a || u || o > 0 ? 4 : 2, m = s(g.filter((e) => e.id !== n.id && !(e.group === "drink" && n.group === "drink"))).slice(0, p - 1);
		return {
			item: n.id,
			prompt: d ? `Which picture fits? ${n.definition}` : `Tap the ${n.id}.`,
			teach: `${n.id}. ${n.definition}`,
			explain: `This is ${n.id === "apple" || n.id === "orange" || n.id === "umbrella" ? "an" : "a"} ${n.id}. ${n.definition}`,
			answer: n.id,
			options: s([{
				id: n.id,
				file: f
			}, ...m.map((e) => ({
				id: e.id,
				file: e.file
			}))]),
			preview: {
				id: n.id,
				file: n.file
			},
			delay: u || o === 0 ? 0 : 2e3,
			review: a || u,
			variant: d ? "transfer" : "original",
			level: o
		};
	}
	if (e === "details" || e === "inspect") {
		let t = c(v);
		if (!t) return null;
		let n = Math.random() < .5, r = n ? t.variant : t.original, i = n ? t.wrong : t.answer, a = s(e === "inspect" ? t.options.map((e) => ({
			id: e,
			text: e
		})) : [...o === 0 ? [{
			id: n ? "variant" : "original",
			file: r
		}, {
			id: "other",
			file: s(g.filter((e) => e.id !== t.word && e.group !== "drink"))[0].file
		}] : [{
			id: "original",
			file: t.original
		}, {
			id: "variant",
			file: t.variant
		}], ...o > 1 ? s(g.filter((e) => e.id !== t.word)).slice(0, 2).map((e) => ({
			id: e.id,
			file: e.file
		})) : []]);
		return {
			item: t.id,
			prompt: e === "inspect" ? `Which ${t.feature} did the ${t.word} have?` : `Tap the ${t.word} you saw.`,
			teach: `Look at this ${t.word}. Notice its ${t.feature}.`,
			explain: `The ${t.word} you saw had ${t.feature === "color" || t.feature === "shade color" ? `${i} ${t.feature}` : t.feature === "leaf" ? i : t.feature === "light" ? `its light ${i}` : `its handle ${i}`}. Both versions are still a ${t.word}; this round checks the detail.`,
			answer: e === "inspect" ? i : n ? "variant" : "original",
			options: a,
			preview: {
				id: t.word,
				file: r
			},
			delay: o >= 2 ? 5e3 : 2e3,
			review: !1,
			variant: n ? "variant" : "original",
			level: o
		};
	}
	if (e === "phrases") {
		let r = c(y.map((e, t) => ({
			id: `relation-${t}`,
			r: e
		})));
		if (!r) return null;
		let i = n(t, e, r.id).some((e) => e.kind === "answer" && e.ok);
		return {
			item: r.id,
			prompt: `Tap the picture: the ball is ${r.r} the box.`,
			teach: `The ball is ${r.r} the box. Look at where the ball is.`,
			explain: `${r.r === "behind" ? "Behind means the box is in front of part of the ball." : r.r === "inside" ? "Inside means the ball is within the box." : r.r === "above" ? "Above means higher than the box." : r.r === "below" ? "Below means lower than the box." : r.r === "beside" ? "Beside means next to the box." : "In front of means the ball covers part of the box."}`,
			answer: r.r,
			options: s([r.r, ...s(y.filter((e) => e !== r.r)).slice(0, 3)]).map((e) => ({
				id: e,
				relation: e
			})),
			preview: {
				id: r.r,
				relation: r.r
			},
			delay: 0,
			review: i,
			variant: "scene",
			level: o
		};
	}
	if (e === "sentences") {
		let r = c(b.flatMap((e) => [!1, !0].map((t) => ({
			id: `${e}-${t ? "orange" : "blue"}`,
			action: e,
			reversed: t
		}))));
		if (!r) return null;
		let { action: i, reversed: a } = r, l = a ? "orange" : "blue", u = a ? "blue" : "orange";
		return {
			item: r.id,
			prompt: `The ${l} person is ${i} the ${u} person.`,
			teach: `The ${l} person does the action: ${i}. The ${u} person receives it.`,
			explain: `Who does it? The ${l} person. What happens? ${i}. Who receives it? The ${u} person. Switching the people changes the sentence.`,
			answer: String(a),
			options: s([!1, !0].map((e) => ({
				id: String(e),
				action: i,
				reversed: e
			}))),
			preview: {
				id: String(a),
				action: i,
				reversed: a
			},
			delay: 0,
			review: n(t, e, r.id).some((e) => e.kind === "answer" && e.ok),
			variant: "scene",
			level: o
		};
	}
	if (e === "order") {
		let e = g.filter((e) => i || l(t, e.id).mastered);
		if (e.length < 3) return null;
		let n = s(e).slice(0, 3).map((e) => e.id);
		return {
			item: `order-${n.join("-")}`,
			prompt: "Tap the pictures in the order you saw: bed, window, door.",
			teach: "Look from left to right: bed, window, door. Remember which picture is in each place.",
			explain: `The order was ${n.join(", then ")}.`,
			answer: n.join(","),
			options: s(n.map((e) => ({
				id: e,
				file: _[e].file
			}))),
			words: n,
			delay: o >= 2 ? 5e3 : 2e3,
			review: !1,
			variant: "board",
			level: o
		};
	}
	let u = s([
		0,
		90,
		180,
		270
	])[0], d = s([
		90,
		180,
		270
	])[0];
	return {
		item: `rotation-${u}-${d}`,
		prompt: "Which is the same wooden shape turned around?",
		teach: "Compare the long arm, the short arm and the raised cube. Turning keeps the shape; a mirror reverses it.",
		explain: "The matching shape keeps the same arrangement of its arms and raised cube after a turn. The other is reflected.",
		answer: "same",
		preview: {
			id: "target",
			angle: u,
			mirror: !1
		},
		options: s([{
			id: "same",
			angle: u + d,
			mirror: !1
		}, {
			id: "mirror",
			angle: u + d,
			mirror: !0
		}]),
		delay: 0,
		review: !1,
		variant: "solid",
		level: o
	};
}
function D({ option: e, alt: t = "Picture choice" }) {
	return e.file ? /* @__PURE__ */ m("img", {
		src: x(e.file),
		alt: t,
		draggable: !1
	}) : e.relation ? /* @__PURE__ */ m(S, { relation: e.relation }) : e.action ? /* @__PURE__ */ m(te, {
		action: e.action,
		reversed: !!e.reversed
	}) : e.angle === void 0 ? /* @__PURE__ */ m("span", {
		className: "pt-text-option",
		children: e.text
	}) : /* @__PURE__ */ m(w, {
		angle: e.angle,
		mirror: e.mirror
	});
}
function O({ player: n, update: a, audio: s, onExit: _ }) {
	let [v, y] = f("meaning"), [b, S] = f("menu"), [C, te] = f(null), [w, O] = f([]), [k, re] = f(!1), [A, j] = f(!1), [ie, M] = f(!1), [N, ae] = f(!1), [P, F] = f(""), [I, L] = f(!1), [R, z] = f(0), [oe, B] = f(0), [V, H] = f(!1), U = d(""), W = d([]), G = d(!1), K = d(0), q = d(n.pictureThinking ?? r());
	u(() => {
		q.current = n.pictureThinking ?? r();
	}, [n.pictureThinking]);
	let J = (e) => {
		s.activate(), s.speak(e);
	};
	u(() => () => s.cancelSpeech(), [s]), u(() => {
		let e = () => {
			document.hidden && b !== "menu" && b !== "summary" && (s.cancelSpeech(), L(!0));
		};
		return document.addEventListener("visibilitychange", e), () => document.removeEventListener("visibilitychange", e);
	}, [b, s]), u(() => {
		if (b !== "wait" || I || !C) return;
		let e = setTimeout(() => {
			G.current = !1, S("choose");
		}, A ? Math.min(1e3, C.delay) : C.delay);
		return () => clearTimeout(e);
	}, [
		b,
		I,
		C,
		A
	]), u(() => {
		if (H(!1), !C) return;
		let e = !0, t = [
			C.preview?.file,
			...C.options.map((e) => e.file),
			...(C.words ?? []).map((e) => `${e}-noun.webp`)
		].filter(Boolean);
		return Promise.all(t.map((e) => new Promise((t, n) => {
			let r = new Image();
			r.onload = () => t(), r.onerror = () => n(Error(e)), r.src = x(e);
		}))).then(() => {
			e && H(!0);
		}, () => {
			e && F("A picture did not load. Please reconnect and reopen this round. No answer was scored.");
		}), () => {
			e = !1;
		};
	}, [C]);
	let Y = (e, n = !1, r = A, i = C, s = v) => {
		if (!i) return;
		let c = o({
			at: Date.now(),
			session: U.current,
			mode: s,
			item: i.item,
			kind: e,
			ok: n,
			retry: r,
			choices: i.options.length,
			level: i.level,
			variant: i.variant
		});
		q.current = t(q.current, c), a((e) => ({
			...e,
			pictureThinking: t(e.pictureThinking, c)
		}));
	}, se = (e = v) => {
		s.cancelSpeech(), F("");
		let t = E(e, q.current, W.current, N);
		if (!t) {
			e === "order" && !N ? (F("First learn three words in Word meanings, or turn on Practice new words for this optional game."), S("menu")) : S("summary");
			return;
		}
		te(t), O([]), j(!1), G.current = !1, S(t.review ? "choose" : "study"), t.review || Y("study", !1, !1, t, e), J(t.review ? t.prompt : t.teach);
	}, X = (e) => {
		U.current = globalThis.crypto?.randomUUID?.() ?? String(Date.now()), K.current = Date.now(), W.current = [], y(e), z(0), B(0), L(!1), M(!1), se(e);
	}, ce = () => {
		s.cancelSpeech(), O([]), S(C.delay ? "wait" : "choose");
	}, le = (e) => {
		if (G.current || !C || !V || b !== "choose") return;
		let t = v === "order" ? [...w, e] : [e];
		if (v === "order" && w.includes(e) || (O(t), v === "order" && t.length < 3)) return;
		G.current = !0;
		let n = t.join(",") === C.answer;
		re(n), Y("answer", n), A || (z((e) => e + 1), n && B((e) => e + 1), W.current.push(C.item)), S("feedback"), J(n ? `Yes. ${C.explain}` : `Let's look together. ${C.explain}`), n || Y("study", !1, !0);
	}, ue = () => {
		O([]), j(!0), G.current = !1, S("study"), J(C.teach);
	}, de = () => {
		R >= 8 || Date.now() - K.current >= 18e4 ? S("summary") : se();
	}, Z = () => {
		s.cancelSpeech(), _();
	}, Q = n.pictureThinking, fe = g.filter((e) => l(Q, e.id).mastered).length, $ = g.filter((e) => l(Q, e.id).due).length;
	return /* @__PURE__ */ h("section", {
		className: `pt-app ${b === "wait" ? "pt-waiting" : ""}`,
		"aria-label": "Picture Thinking",
		children: [/* @__PURE__ */ h("div", {
			className: "pt-wrap",
			children: [
				/* @__PURE__ */ h("header", {
					className: "pt-header",
					children: [
						/* @__PURE__ */ m("button", {
							onClick: Z,
							children: "‹ WordRaiders"
						}),
						/* @__PURE__ */ m("span", { children: "PICTURE THINKING" }),
						/* @__PURE__ */ m("button", {
							onClick: () => {
								s.cancelSpeech(), S("menu"), L(!1);
							},
							children: "My progress"
						})
					]
				}),
				b === "menu" ? /* @__PURE__ */ h(p, { children: [
					/* @__PURE__ */ h("div", {
						className: "pt-hero",
						children: [/* @__PURE__ */ h("div", { children: [
							/* @__PURE__ */ m("p", {
								className: "pt-eyebrow",
								children: "SEE IT · KNOW IT · REMEMBER IT"
							}),
							/* @__PURE__ */ h("h1", { children: [
								"Give words",
								/* @__PURE__ */ m("br", {}),
								"a picture."
							] }),
							/* @__PURE__ */ m("p", { children: "Small rounds. Clear explanations. Learning that lasts." }),
							/* @__PURE__ */ h("button", {
								className: "pt-primary",
								onClick: () => X("meaning"),
								children: [
									$ ? `Review ${$} due words` : "Start a 3-minute round",
									" ",
									/* @__PURE__ */ m("span", { children: "↗" })
								]
							})
						] }), /* @__PURE__ */ m("div", {
							className: "pt-hero-art",
							"aria-hidden": "true",
							children: [
								"apple",
								"mug",
								"lamp"
							].map((e) => /* @__PURE__ */ m("img", {
								src: x(e + "-noun.webp"),
								alt: ""
							}, e))
						})]
					}),
					/* @__PURE__ */ h("div", {
						className: "pt-stats",
						children: [
							/* @__PURE__ */ h("div", { children: [/* @__PURE__ */ h("strong", { children: [fe, /* @__PURE__ */ h("small", { children: [" / ", g.length] })] }), /* @__PURE__ */ m("span", { children: "Words remembered on later days" })] }),
							/* @__PURE__ */ h("div", { children: [/* @__PURE__ */ m("strong", { children: $ }), /* @__PURE__ */ m("span", { children: "Words ready for a review" })] }),
							/* @__PURE__ */ h("div", { children: [/* @__PURE__ */ m("strong", { children: c(Q) ? "✓" : "6" }), /* @__PURE__ */ m("span", { children: c(Q) ? "Today’s task complete" : "Answers for today’s task" })] })
						]
					}),
					/* @__PURE__ */ m("h2", { children: "Choose your practice" }),
					/* @__PURE__ */ m("p", { children: "Word meanings and picture memory have separate progress." }),
					/* @__PURE__ */ m("div", {
						className: "pt-modes",
						children: e.map((e, t) => {
							let n = i(Q, e);
							return /* @__PURE__ */ h("button", {
								onClick: () => X(e),
								children: [
									/* @__PURE__ */ h("span", {
										className: "pt-mode-no",
										children: ["0", t + 1]
									}),
									/* @__PURE__ */ h("div", { children: [
										/* @__PURE__ */ m("h3", { children: ee[e] }),
										/* @__PURE__ */ m("p", { children: ne[e] }),
										/* @__PURE__ */ h("small", { children: [e === "order" || e === "rotation" ? "Optional · " : "", n.length ? `${n.filter((e) => e.ok).length} / ${n.length} independent answers correct` : "Ready to explore"] })
									] }),
									/* @__PURE__ */ m("b", { children: "↗" })
								]
							}, e);
						})
					}),
					/* @__PURE__ */ h("label", {
						className: "pt-toggle",
						children: [/* @__PURE__ */ m("input", {
							type: "checkbox",
							checked: N,
							onChange: (e) => ae(e.target.checked)
						}), "Practice new words in Picture order (normally uses mastered words)"]
					}),
					P && /* @__PURE__ */ m("p", {
						role: "alert",
						className: "pt-error",
						children: P
					}),
					/* @__PURE__ */ h("details", {
						className: "pt-progress",
						children: [
							/* @__PURE__ */ m("summary", { children: "My words · later-day checks" }),
							/* @__PURE__ */ m("p", { children: "A word becomes mastered after three clean checks on separate later days, with increasing gaps. A retry helps you learn but does not count as a clean check." }),
							/* @__PURE__ */ m("div", {
								className: "pt-word-list",
								children: g.map((e) => {
									let t = l(Q, e.id);
									return /* @__PURE__ */ h("div", { children: [/* @__PURE__ */ m("span", { children: e.id }), /* @__PURE__ */ m("span", { children: t.mastered ? "Mastered ✓" : t.due ? "Review ready" : t.seen ? `${t.checks} / 3 later-day checks` : "New" })] }, e.id);
								})
							})
						]
					})
				] }) : b === "summary" ? /* @__PURE__ */ h("div", {
					className: "pt-summary",
					children: [
						/* @__PURE__ */ m("p", {
							className: "pt-eyebrow",
							children: "ROUND COMPLETE"
						}),
						/* @__PURE__ */ h("h1", { children: [
							"A little practice.",
							/* @__PURE__ */ m("br", {}),
							"A stronger connection."
						] }),
						/* @__PURE__ */ h("p", { children: [
							oe,
							" of ",
							R,
							" first answers correct. Every completed answer is saved with ",
							n.name,
							"’s progress."
						] }),
						/* @__PURE__ */ m("p", { children: "Today’s practice builds familiarity. Clean reviews on later days show what you remember." }),
						/* @__PURE__ */ m("button", {
							className: "pt-primary",
							onClick: () => X(v),
							children: "Another round"
						}),
						/* @__PURE__ */ m("button", {
							onClick: () => S("menu"),
							children: "See my progress"
						}),
						/* @__PURE__ */ m("button", {
							onClick: Z,
							children: "Back to WordRaiders"
						})
					]
				}) : C && /* @__PURE__ */ h(p, { children: [
					/* @__PURE__ */ h("div", {
						className: "pt-round-top",
						children: [
							/* @__PURE__ */ m("span", { children: ee[v] }),
							/* @__PURE__ */ h("span", { children: [Math.min(R + (b === "feedback" ? 0 : 1), 8), " / 8"] }),
							/* @__PURE__ */ m("button", {
								onClick: () => {
									s.cancelSpeech(), S("summary");
								},
								children: "Finish round"
							})
						]
					}),
					/* @__PURE__ */ m("main", {
						className: "pt-trial",
						"aria-live": "polite",
						children: b === "wait" ? /* @__PURE__ */ h("div", {
							className: "pt-hold",
							children: [
								/* @__PURE__ */ m("span", {
									className: "pt-eyebrow",
									children: "REMEMBER"
								}),
								/* @__PURE__ */ m("h2", { children: v === "meaning" ? C.item : "Keep what you noticed." }),
								/* @__PURE__ */ m("p", { children: "The pictures will return shortly." })
							]
						}) : /* @__PURE__ */ h(p, { children: [
							/* @__PURE__ */ m("p", {
								className: "pt-eyebrow",
								children: b === "study" ? "LOOK & LEARN" : b === "feedback" ? "LET’S CHECK" : C.review && v === "meaning" ? "REMEMBER THE MEANING" : "YOUR TURN"
							}),
							/* @__PURE__ */ m("h2", { children: b === "study" ? C.teach : b === "feedback" ? k ? "You got it." : "Let’s look together." : C.prompt }),
							b !== "feedback" && /* @__PURE__ */ m("button", {
								className: "pt-hear",
								onClick: () => J(b === "study" ? C.teach : C.prompt),
								children: "Hear it again"
							}),
							P ? /* @__PURE__ */ m("p", {
								role: "alert",
								className: "pt-error",
								children: P
							}) : V ? /* @__PURE__ */ h(p, { children: [
								b === "study" && /* @__PURE__ */ h(p, { children: [C.words ? /* @__PURE__ */ m(T, { words: C.words }) : C.preview && /* @__PURE__ */ m("div", {
									className: "pt-preview",
									children: /* @__PURE__ */ m(D, {
										option: C.preview,
										alt: v === "meaning" ? C.item : "Look closely at this picture"
									})
								}), /* @__PURE__ */ m("button", {
									className: "pt-primary",
									onClick: ce,
									children: C.delay ? "I’m ready · hide the picture" : "I’m ready · let me choose"
								})] }),
								b === "choose" && /* @__PURE__ */ h(p, { children: [
									v === "order" && /* @__PURE__ */ h(p, { children: [/* @__PURE__ */ m(T, {
										words: [],
										hidden: !0
									}), /* @__PURE__ */ h("p", { children: [
										"Picked ",
										w.length,
										" of 3 · ",
										w.length > 0 && /* @__PURE__ */ m("button", {
											onClick: () => O([]),
											children: "Start the order again"
										})
									] })] }),
									(v === "rotation" || v === "meaning" && !C.review && C.level === 0) && C.preview && /* @__PURE__ */ h("div", {
										className: "pt-preview pt-small-preview",
										children: [/* @__PURE__ */ m(D, { option: C.preview }), /* @__PURE__ */ m("small", { children: v === "rotation" ? "Original shape" : C.item })]
									}),
									/* @__PURE__ */ m("div", {
										className: `pt-options pt-options-${C.options.length}`,
										children: C.options.map((e, t) => /* @__PURE__ */ h("button", {
											"aria-label": e.text ?? `Picture choice ${t + 1}`,
											disabled: w.includes(e.id),
											onClick: () => le(e.id),
											children: [/* @__PURE__ */ m(D, { option: e }), /* @__PURE__ */ m("span", {
												className: "pt-option-number",
												children: w.includes(e.id) ? w.indexOf(e.id) + 1 : t + 1
											})]
										}, e.id))
									})
								] }),
								b === "feedback" && /* @__PURE__ */ h("div", {
									className: "pt-feedback " + (k ? "is-right" : ""),
									children: [
										/* @__PURE__ */ m("p", { children: C.explain }),
										C.words ? /* @__PURE__ */ m(T, { words: C.words }) : C.preview && /* @__PURE__ */ m("div", {
											className: "pt-preview pt-small-preview",
											children: /* @__PURE__ */ m(D, {
												option: C.preview,
												alt: C.item
											})
										}),
										!k && /* @__PURE__ */ m("button", {
											className: "pt-primary",
											onClick: ue,
											children: "Try again with help"
										}),
										/* @__PURE__ */ h("button", {
											className: k ? "pt-primary" : "",
											onClick: de,
											children: [R >= 8 ? "Finish round" : "Next picture", " →"]
										}),
										A && /* @__PURE__ */ m("small", { children: "This was practice. It does not count as a mastery check." })
									]
								})
							] }) : /* @__PURE__ */ m("p", { children: "Preparing your pictures…" })
						] })
					}),
					b !== "wait" && /* @__PURE__ */ h("div", {
						className: "pt-support",
						children: [/* @__PURE__ */ m("button", {
							onClick: () => M((e) => !e),
							children: "I don’t see a picture in my head"
						}), ie && /* @__PURE__ */ m("p", { children: "That’s okay. Lots of people remember words without a picture in their head. The picture on the screen is there to help." })]
					})
				] }),
				/* @__PURE__ */ h("footer", {
					className: "pt-footer",
					children: [n.name, "’s progress · saved with your WordRaiders player"]
				})
			]
		}), I && /* @__PURE__ */ m("div", {
			className: "pt-pause",
			children: /* @__PURE__ */ h("div", { children: [
				/* @__PURE__ */ m("h2", { children: "Paused" }),
				/* @__PURE__ */ m("p", { children: "Take your time. We’ll show the picture again when you’re ready." }),
				/* @__PURE__ */ m("button", {
					className: "pt-primary",
					onClick: () => {
						L(!1), C && (Y("study", !1, !0), j(!0), S("study"));
					},
					children: "Continue"
				}),
				/* @__PURE__ */ m("button", {
					onClick: Z,
					children: "Back to WordRaiders"
				})
			] })
		})]
	});
}
//#endregion
export { O as default, E as makeTrial };
