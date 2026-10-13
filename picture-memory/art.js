// Picture Memory drawings: simple flat objects in the WordRaiders style (teal outline, solid fills). Every object is made
// of named colourable parts, and each can change exactly ONE detail for "spot the change": a part's colour, which way
// it faces, a stripe/dot pattern, how many of something, a missing part, or (lamp) light on/off and (clock) the time.
export const INK = '#214b47';
export const PALETTE = [
 { id: 'red', hex: '#e53935' }, { id: 'orange', hex: '#fb8c00' }, { id: 'yellow', hex: '#fdd835' }, { id: 'green', hex: '#43a047' },
 { id: 'blue', hex: '#1e88e5' }, { id: 'purple', hex: '#8e24aa' }, { id: 'pink', hex: '#f48fb1' }, { id: 'brown', hex: '#8d6e63' },
 { id: 'black', hex: '#37474f' }, { id: 'white', hex: '#ffffff' },
];
export const HEX = Object.fromEntries(PALETTE.map(p => [p.id, p.hex]));
const S = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
// fill for a part: colour plus optional pattern overlay
const F = (o, part) => { const c = HEX[o.colors[part]] || o.colors[part] || '#fff'; return `fill="${c}"`; };
const PAT = (o, part, shape) => o.pattern && o.pattern.part === part ? shape.replace(/fill="[^"]*"/, `fill="url(#pm-${o.pattern.kind}-${o.uid})"`) : '';
let UID = 0;   // pattern ids must be unique per picture when several are on screen
const part = (o, name, shape) => { const base = shape.replace('FILL', F(o, name)); return `<g data-r="${name}">${base}${PAT(o, name, shape.replace('FILL', 'fill="x"'))}</g>`; };

// Each object: name, parts (default colours), and what it can change.
export const OBJECTS = {
 mug: { name: 'mug', parts: { cup: 'blue' }, flip: 'handle', missing: ['handle'], pattern: ['cup'],
  draw: o => `${o.missing.has('handle') ? '' : `<path d="M140 80q34 0 34 30t-34 30" fill="none" ${S} stroke-width="12"/><path d="M140 80q34 0 34 30t-34 30" fill="none" stroke="${HEX[o.colors.cup] || o.colors.cup}" stroke-width="5"/>`}${part(o, 'cup', `<path d="M50 60h92v84q0 22-22 22H72q-22 0-22-22Z" FILL ${S}/>`)}<ellipse cx="96" cy="62" rx="44" ry="8" fill="#6d4c41" ${S} stroke-width="3"/>` },
 apple: { name: 'apple', parts: { fruit: 'red' }, missing: ['leaf'], flip: 'leaf',
  draw: o => `${part(o, 'fruit', `<path d="M100 70c-30-20-70 0-62 45 6 38 34 60 62 48 28 12 56-10 62-48 8-45-32-65-62-45Z" FILL ${S}/>`)}<path d="M100 72q2-22 12-32" fill="none" ${S} stroke="#5d4037" stroke-width="6"/>${o.missing.has('leaf') ? '' : `<path d="M110 46q24-18 40-6q-18 22-40 6Z" fill="#43a047" ${S}/>`}` },
 house: { name: 'house', parts: { walls: 'yellow', roof: 'red', door: 'brown' }, count: { what: 'windows', values: [1, 2] }, pattern: ['walls'], flip: 'door',
  draw: o => `${part(o, 'walls', `<rect x="45" y="90" width="110" height="80" FILL ${S}/>`)}${part(o, 'roof', `<path d="M30 95 100 35l70 60Z" FILL ${S}/>`)}${part(o, 'door', `<rect x="60" y="120" width="28" height="50" rx="3" FILL ${S}/>`)}${[0, 1].slice(0, o.count ?? 2).map(k => `<rect x="${104 + k * 0}" y="${k ? 140 : 104}" width="34" height="${k ? 22 : 26}" fill="#bbdefb" ${S} stroke-width="3"/>`).join('')}` },
 car: { name: 'car', parts: { body: 'red', top: 'blue' }, flip: 'front', count: { what: 'windows', values: [1, 2] },
  draw: o => `${part(o, 'top', `<path d="M60 92l18-30h46l22 30Z" FILL ${S}/>`)}${(o.count ?? 2) === 2 ? `<path d="M80 88l8-18h14v18Z M110 88v-18h12l12 18Z" fill="#e3f2fd" ${S} stroke-width="3"/>` : `<path d="M82 88l8-18h32l12 18Z" fill="#e3f2fd" ${S} stroke-width="3"/>`}${part(o, 'body', `<path d="M30 92h130q14 0 14 14v20H26v-22q0-12 4-12Z" FILL ${S}/>`)}<circle cx="62" cy="130" r="16" fill="#37474f" ${S}/><circle cx="140" cy="130" r="16" fill="#37474f" ${S}/><circle cx="168" cy="104" r="5" fill="#fff59d" ${S} stroke-width="2"/>` },
 fish: { name: 'fish', parts: { body: 'orange', tail: 'yellow' }, flip: 'head', pattern: ['body'],
  draw: o => `${part(o, 'tail', `<path d="M48 100 18 72v56Z" FILL ${S}/>`)}${part(o, 'body', `<ellipse cx="100" cy="100" rx="58" ry="36" FILL ${S}/>`)}<circle cx="132" cy="92" r="6" fill="${INK}"/><path d="M150 108q-6 6-12 2" fill="none" ${S} stroke-width="3"/>` },
 kite: { name: 'kite', parts: { top: 'red', bottom: 'yellow' }, count: { what: 'bows on the tail', values: [2, 3] },
  draw: o => `<path d="M100 150q-10 20 0 30t0 18" fill="none" ${S} stroke-width="3"/>${[0, 1, 2].slice(0, o.count ?? 3).map(k => `<path d="M${92 + (k % 2) * 6} ${162 + k * 12}l8 4-8 4Z" fill="#e53935" ${S} stroke-width="2"/>`).join('')}${part(o, 'top', `<path d="M100 20 150 80H50Z" FILL ${S}/>`)}${part(o, 'bottom', `<path d="M50 80h100l-50 70Z" FILL ${S}/>`)}<path d="M100 20v130M50 80h100" ${S} stroke-width="3"/>` },
 balloon: { name: 'balloon', parts: { balloon: 'pink' }, count: { what: 'balloons', values: [1, 2, 3] },
  draw: o => { const n = o.count ?? 1, xs = n === 1 ? [100] : n === 2 ? [76, 124] : [60, 100, 140]; return xs.map((x, k) => `<path d="M${x} ${132 - (k % 2) * 10}q-8 30 ${100 - x} 50" fill="none" ${S} stroke-width="2"/>${part(o, 'balloon', `<ellipse cx="${x}" cy="${92 - (k % 2) * 10}" rx="${n === 1 ? 40 : 26}" ry="${n === 1 ? 48 : 34}" FILL ${S}/>`)}`).join(''); } },
 umbrella: { name: 'umbrella', parts: { top: 'purple' }, flip: 'handle', pattern: ['top'],
  draw: o => `<path d="M100 60v90q0 16 16 16t16-16" fill="none" ${S} stroke-width="6"/>${part(o, 'top', `<path d="M24 100q0-62 76-62t76 62q-12-12-25 0-13-12-25 0-13-12-26 0-13-12-25 0-13-12-25 0-13-12-26 0Z" FILL ${S}/>`)}` },
 cupcake: { name: 'cupcake', parts: { cup: 'blue', icing: 'pink' }, missing: ['cherry'], pattern: ['cup'],
  draw: o => `${part(o, 'cup', `<path d="M56 110h88l-12 60H68Z" FILL ${S}/>`)}${part(o, 'icing', `<path d="M50 112q-8-30 22-34q4-26 28-26t28 26q30 4 22 34Z" FILL ${S}/>`)}${o.missing.has('cherry') ? '' : `<circle cx="100" cy="46" r="11" fill="#e53935" ${S}/>`}` },
 hat: { name: 'hat', parts: { hat: 'green', band: 'yellow' }, pattern: ['hat'],
  draw: o => `${part(o, 'hat', `<path d="M60 130V70q40-22 80 0v60Z" FILL ${S}/>`)}${part(o, 'band', `<rect x="60" y="108" width="80" height="18" FILL ${S}/>`)}<ellipse cx="100" cy="134" rx="70" ry="14" fill="${HEX[o.colors.hat] || o.colors.hat}" ${S}/>` },
 shirt: { name: 'shirt', parts: { shirt: 'blue' }, missing: ['pocket'], pattern: ['shirt'],
  draw: o => `${part(o, 'shirt', `<path d="M70 40l-44 26 16 30 18-10v80h80V86l18 10 16-30-44-26q-10 14-30 14t-30-14Z" FILL ${S}/>`)}${o.missing.has('pocket') ? '' : `<rect x="110" y="96" width="26" height="24" rx="3" fill="#ffffff66" ${S} stroke-width="3"/>`}` },
 sock: { name: 'sock', parts: { sock: 'red', heel: 'white' }, flip: 'toe', pattern: ['sock'],
  draw: o => `${part(o, 'sock', `<path d="M76 30h48v90q0 14 14 22l12 6q16 10 6 28t-30 8l-44-24q-14-8-6-30Z" FILL ${S}/>`)}${part(o, 'heel', `<path d="M76 116q4 22 24 22v-16q-12 0-18-12Z" FILL ${S} stroke-width="3"/>`)}<rect x="76" y="30" width="48" height="16" fill="#fff" ${S} stroke-width="3"/>` },
 flower: { name: 'flower', parts: { petals: 'pink', middle: 'yellow' }, count: { what: 'petals', values: [5, 6, 8] },
  draw: o => { const n = o.count ?? 6; return `<path d="M100 120v60" ${S} stroke="#43a047" stroke-width="7"/><path d="M100 160q-24-14-30 6 18 6 30-6Z" fill="#43a047" ${S} stroke-width="3"/>${Array.from({ length: n }, (_, k) => { const a = k / n * Math.PI * 2, x = 100 + Math.cos(a) * 30, y = 84 + Math.sin(a) * 30; return part(o, 'petals', `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="18" ry="18" FILL ${S} stroke-width="3"/>`); }).join('')}${part(o, 'middle', `<circle cx="100" cy="84" r="20" FILL ${S}/>`)}`; } },
 butterfly: { name: 'butterfly', parts: { top: 'orange', bottom: 'purple' }, pattern: ['top'],
  draw: o => `${part(o, 'top', `<path d="M100 96q-30-60-66-40-14 36 66 50ZM100 96q30-60 66-40 14 36-66 50Z" FILL ${S}/>`)}${part(o, 'bottom', `<path d="M100 100q-56 4-50 38 24 14 50-28ZM100 100q56 4 50 38-24 14-50-28Z" FILL ${S}/>`)}<rect x="94" y="62" width="12" height="80" rx="6" fill="#37474f" ${S} stroke-width="3"/><path d="M98 64q-8-18-16-22M102 64q8-18 16-22" fill="none" ${S} stroke-width="3"/>` },
 rocket: { name: 'rocket', parts: { body: 'white', nose: 'red', fins: 'blue' }, missing: ['window'],
  draw: o => `${part(o, 'fins', `<path d="M76 130 52 160l30-6ZM124 130l24 30-30-6Z" FILL ${S}/>`)}${part(o, 'body', `<path d="M76 70h48v84H76Z" FILL ${S}/>`)}${part(o, 'nose', `<path d="M76 72q24-60 48 0Z" FILL ${S}/>`)}${o.missing.has('window') ? '' : `<circle cx="100" cy="100" r="13" fill="#bbdefb" ${S}/>`}<path d="M86 156q14 30 28 0" fill="#fb8c00" ${S} stroke-width="3"/>` },
 lamp: { name: 'lamp', parts: { shade: 'yellow', base: 'blue' }, light: true,
  draw: o => `${o.light === false ? '' : `<path d="M60 92 30 150h140l-30-58" fill="#fff59d" opacity=".55"/>`}<path d="M100 92v56" ${S} stroke-width="6"/>${part(o, 'base', `<path d="M70 168q0-20 30-20t30 20Z" FILL ${S}/>`)}${part(o, 'shade', `<path d="M70 40h60l18 52H52Z" FILL ${S}/>`)}` },
 gift: { name: 'present', parts: { box: 'green', ribbon: 'red' }, pattern: ['box'],
  draw: o => `${part(o, 'box', `<rect x="44" y="80" width="112" height="90" FILL ${S}/>`)}${part(o, 'ribbon', `<path d="M90 80h20v90H90Z M44 116h112v18H44Z" FILL ${S} stroke-width="3"/>`)}${part(o, 'ribbon', `<path d="M100 80q-30-30-40-10t40 10Zm0 0q30-30 40-10t-40 10Z" FILL ${S}/>`)}` },
 icecream: { name: 'ice cream', parts: { scoop: 'pink', cone: 'orange' }, count: { what: 'scoops', values: [1, 2, 3] },
  draw: o => { const n = o.count ?? 2; return `${part(o, 'cone', `<path d="M70 104h60l-30 80Z" FILL ${S}/>`)}<path d="M80 120l30 24M92 112l26 20M120 120l-28 30" ${S} stroke-width="2"/>${Array.from({ length: n }, (_, k) => part(o, 'scoop', `<circle cx="100" cy="${92 - k * 30}" r="${30 - k * 2}" FILL ${S}/>`)).reverse().join('')}`; } },
 bus: { name: 'bus', parts: { bus: 'yellow' }, flip: 'front', count: { what: 'windows', values: [3, 4] },
  draw: o => { const n = o.count ?? 4; return `${part(o, 'bus', `<rect x="20" y="60" width="160" height="72" rx="12" FILL ${S}/>`)}${Array.from({ length: n }, (_, k) => `<rect x="${30 + k * (124 / n)}" y="72" width="${124 / n - 8}" height="26" rx="3" fill="#e3f2fd" ${S} stroke-width="3"/>`).join('')}<rect x="158" y="72" width="16" height="44" rx="3" fill="#e3f2fd" ${S} stroke-width="3"/><circle cx="56" cy="136" r="15" fill="#37474f" ${S}/><circle cx="146" cy="136" r="15" fill="#37474f" ${S}/>`; } },
 bird: { name: 'bird', parts: { body: 'blue', wing: 'yellow' }, flip: 'beak',
  draw: o => `${part(o, 'body', `<path d="M40 110q10-50 70-46 40 2 46 30l20 6-20 8q-10 36-66 34-40-2-50-32Z" FILL ${S}/>`)}${part(o, 'wing', `<path d="M70 104q30-24 56 0-26 22-56 0Z" FILL ${S} stroke-width="3"/>`)}<circle cx="140" cy="90" r="5" fill="${INK}"/><path d="M90 140v20M104 140v20" ${S} stroke-width="3"/>` },
 teapot: { name: 'teapot', parts: { pot: 'pink', lid: 'purple' }, flip: 'spout', pattern: ['pot'],
  draw: o => `<path d="M150 100q26-6 30-30" fill="none" ${S} stroke-width="10"/><path d="M52 92q-30 4-24 34 4 16 26 18" fill="none" ${S} stroke-width="9"/>${part(o, 'pot', `<path d="M50 90q0-26 50-26t50 26v40q0 30-50 30t-50-30Z" FILL ${S}/>`)}${part(o, 'lid', `<path d="M66 66q34-24 68 0Z" FILL ${S}/>`)}<circle cx="100" cy="46" r="7" fill="${INK}"/>` },
 backpack: { name: 'backpack', parts: { bag: 'red', pocket: 'yellow' }, missing: ['pocket'],
  draw: o => `<path d="M76 54q0-24 24-24t24 24" fill="none" ${S} stroke-width="7"/>${part(o, 'bag', `<rect x="52" y="50" width="96" height="124" rx="24" FILL ${S}/>`)}${o.missing.has('pocket') ? '' : part(o, 'pocket', `<rect x="68" y="118" width="64" height="40" rx="10" FILL ${S}/>`)}` },
 clock: { name: 'clock', parts: { frame: 'green' }, time: true,
  draw: o => { const h = o.time || 3, a = (h / 12) * Math.PI * 2 - Math.PI / 2; return `${part(o, 'frame', `<circle cx="100" cy="100" r="74" FILL ${S}/>`)}<circle cx="100" cy="100" r="58" fill="#fff" ${S}/><path d="M100 100V56" ${S} stroke-width="5"/><path d="M100 100L${(100 + Math.cos(a) * 34).toFixed(1)} ${(100 + Math.sin(a) * 34).toFixed(1)}" ${S} stroke-width="7"/><circle cx="100" cy="100" r="5" fill="${INK}"/>`; } },
 boat: { name: 'boat', parts: { hull: 'brown', sail: 'white' }, flip: 'sail', count: { what: 'sails', values: [1, 2] },
  draw: o => `<path d="M100 40v100" ${S} stroke-width="5"/>${part(o, 'sail', `<path d="M104 44v80h50Z" FILL ${S}/>`)}${(o.count ?? 1) === 2 ? part(o, 'sail', `<path d="M96 60v64H58Z" FILL ${S}/>`) : ''}${part(o, 'hull', `<path d="M36 136h128l-20 30H56Z" FILL ${S}/>`)}<path d="M20 176q20-10 40 0t40 0 40 0 40 0" fill="none" stroke="#1e88e5" stroke-width="5" stroke-linecap="round"/>` },
};
export const OBJECT_IDS = Object.keys(OBJECTS);

/** spec: { obj, colors:{part:colorId}, flip, pattern:{part,kind}, count, missing:[], light, time } → SVG string */
export function draw(spec, { size = 220, label = '', blank = false, paint = null } = {}){
 const D = OBJECTS[spec.obj], colors = { ...D.parts, ...(spec.colors || {}) };
 if (blank) for (const k of Object.keys(colors)) colors[k] = paint?.[k] ? paint[k] : '#ffffff';
 const uid = ++UID, o = { uid, colors, pattern: blank ? null : spec.pattern, count: spec.count, missing: new Set(spec.missing || []), light: spec.light, time: spec.time };
 const body = D.draw(o), flip = spec.flip ? `transform="translate(200 0) scale(-1 1)"` : '';
 const defs = `<defs><pattern id="pm-stripes-${uid}" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="${HEX[colors[spec.pattern?.part]] || '#fff'}"/><rect width="7" height="16" fill="#ffffff"/></pattern><pattern id="pm-dots-${uid}" width="18" height="18" patternUnits="userSpaceOnUse"><rect width="18" height="18" fill="${HEX[colors[spec.pattern?.part]] || '#fff'}"/><circle cx="9" cy="9" r="4" fill="#ffffff"/></pattern></defs>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="${size}" height="${size}" role="img" aria-label="${(label || D.name).replace(/"/g, '&quot;')}">${defs}<rect width="200" height="200" rx="18" fill="#fff8e9"/><g ${flip}>${body}</g></svg>`;
}
