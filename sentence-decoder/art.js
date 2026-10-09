// Sentence Decoder picture panels: square, no text, flat 2D in the WordRaiders academy style (cream frame, dark-teal
// outline). A panel is data: a place, a cast of characters with a pose, and props. The same characters appear across an
// item's panels, so order and "who did what" are visible. Props reuse the Uncountable Nouns symbol drawings.
import {sym, SYMBOLS} from '../uncountable-nouns/art.js';
export {SYMBOLS};
const INK = '#214b47';

// Characters, drawn facing right around (0,0), feet at about y=30. ~70 units wide at scale 1.
const C = {
 dog: (c = '#c98b5a') => `<path d="M-30 4Q-30-12-12-12H14L22-22Q30-26 34-18L36-6Q38 4 28 6H18V28M-22 6V28M-12 8V28M10 8V28" fill="${c}"/><path d="M-30 0Q-42-8-40-18" fill="none" stroke-width="4"/><path d="M22-22 14-30 12-18Z" fill="#8a5a36"/><circle cx="28" cy="-14" r="2.5" fill="${INK}"/><circle cx="37" cy="-8" r="3" fill="${INK}"/>`,
 cat: (c = '#9aa5a8') => `<path d="M-26 4Q-26-10-10-10H12V-18L16-28 20-20 26-28 28-16Q32-8 26-2H18V28M-20 6V28M-10 8V28M8 8V28" fill="${c}"/><path d="M-26 0Q-40 2-40-16Q-40-26-32-24" fill="none" stroke-width="4"/><circle cx="22" cy="-12" r="2.3" fill="${INK}"/><path d="M26-6l8-1M26-4l8 2" stroke-width="1.2"/>`,
 bat: (c = '#5d5470') => `<path d="M-8-6Q0-16 8-6Q12 6 0 12Q-12 6-8-6Z" fill="${c}"/><path d="M-6-12-10-20-2-14M6-12 10-20 2-14" fill="${c}"/><path d="M-8-2Q-26-18-40-4Q-32-6-30 2Q-24-4-20 4Q-14-2-8 4ZM8-2Q26-18 40-4Q32-6 30 2Q24-4 20 4Q14-2 8 4Z" fill="${c}"/><circle cx="-3" cy="-6" r="1.8" fill="#fff"/><circle cx="3" cy="-6" r="1.8" fill="#fff"/>`,
 bird: (c = '#4c8fd6') => `<path d="M-22 2Q-10-16 8-10Q20-8 22 2Q14 14-4 12Q-18 12-22 2Z" fill="${c}"/><path d="M22-2 32 0 22 4Z" fill="#f2c94c"/><path d="M-6-4Q4-20 12-6" fill="#8fbfe8"/><circle cx="14" cy="-3" r="2" fill="${INK}"/><path d="M-2 12V24M6 12V24" stroke-width="2.5"/>`,
 rabbit: (c = '#e8e2d6') => `<ellipse cx="-4" cy="8" rx="22" ry="16" fill="${c}"/><circle cx="16" cy="-6" r="12" fill="${c}"/><path d="M10-16Q4-40 12-40Q18-36 16-16M18-16Q22-40 28-36Q30-30 22-14" fill="${c}"/><circle cx="20" cy="-8" r="2" fill="${INK}"/><circle cx="-26" cy="6" r="5" fill="#fff"/><path d="M-12 22V28M6 22V28" stroke-width="4"/>`,
 frog: (c = '#6cc070') => `<path d="M-24 18Q-28-6 0-8Q28-6 24 18Z" fill="${c}"/><circle cx="-10" cy="-10" r="8" fill="${c}"/><circle cx="10" cy="-10" r="8" fill="${c}"/><circle cx="-10" cy="-11" r="3" fill="${INK}"/><circle cx="10" cy="-11" r="3" fill="${INK}"/><path d="M-10 6Q0 12 10 6" fill="none"/><path d="M-26 18-34 28H-16M26 18 34 28H16" fill="${c}"/>`,
 fish: (c = '#f2994a') => `<path d="M-24 0Q-8-18 14-6L28-16V16L14 6Q-8 18-24 0Z" fill="${c}"/><circle cx="-12" cy="-2" r="2.5" fill="${INK}"/>`,
 mouse: (c = '#b9b2a8') => `<path d="M-20 12Q-22-6 0-8Q16-8 22 6L30 10 22 14H-20Z" fill="${c}"/><circle cx="4" cy="-8" r="7" fill="#f6c3cf"/><circle cx="20" cy="6" r="1.8" fill="${INK}"/><path d="M-20 10Q-36 10-38 0" fill="none" stroke-width="2.5"/>`,
 duck: (c = '#f2e27a') => `<path d="M-22 6Q-24-10-4-8Q2-24 14-20Q22-16 18-8L30-6 18-2Q20 16 0 18Q-20 18-22 6Z" fill="${c}"/><circle cx="12" cy="-15" r="2" fill="${INK}"/><path d="M18-8 30-6 18-2" fill="#f2994a"/><path d="M-4 18V26M6 18V26" stroke="#f2994a" stroke-width="3"/>`,
 bear: (c = '#8a5a36') => `<ellipse cx="-4" cy="6" rx="26" ry="22" fill="${c}"/><circle cx="18" cy="-14" r="14" fill="${c}"/><circle cx="10" cy="-26" r="5" fill="${c}"/><circle cx="26" cy="-26" r="5" fill="${c}"/><circle cx="22" cy="-16" r="2" fill="${INK}"/><circle cx="31" cy="-10" r="2.5" fill="${INK}"/><path d="M-20 26V30M-6 26V30M8 26V30" stroke-width="5"/>`,
 girl: (c = '#f28b82') => `<circle cy="-22" r="13" fill="#e0a560"/><path d="M-13-24Q-14-40 0-38Q14-40 13-24Q8-32 0-30Q-8-32-13-24Z" fill="#5a3a22"/><path d="M-14 16-8-8H8L14 16Z" fill="${c}"/><path d="M-5 16V30M5 16V30M-8-4-16 8M8-4 16 8" fill="none" stroke-width="3.5"/><circle cx="5" cy="-23" r="1.8" fill="${INK}"/>`,
 boy: (c = '#8fb5c0') => `<circle cy="-22" r="13" fill="#b97d53"/><path d="M-13-26Q-12-38 0-37Q12-38 13-26Q6-31 0-29Q-6-31-13-26Z" fill="#2f2f2f"/><path d="M-11 12V-8H11V12Z" fill="${c}"/><path d="M-6 12V30M6 12V30M-9-4-17 8M9-4 17 8" fill="none" stroke-width="3.5"/><circle cx="5" cy="-23" r="1.8" fill="${INK}"/>`,
 grownup: (c = '#3b4f8a') => `<circle cy="-30" r="13" fill="#e8b48a"/><path d="M-13-34Q-10-46 0-45Q12-46 13-34Z" fill="#9aa5a8"/><path d="M-13 12V-16H13V12Z" fill="${c}"/><path d="M-7 12V32M7 12V32M-11-12-19 4M11-12 19 4" fill="none" stroke-width="3.5"/><circle cx="5" cy="-31" r="1.8" fill="${INK}"/>`
};
export const CAST = Object.keys(C);
export const POSES = ['stand','run','jump','sit','sleep','fly','hang','swim','climb','fall','happy','sad','scared','eat','hide'];
export const PLACES = ['grass','park','cave','inside','night','pond','beach','snow','rain','road','kitchen','sky','forest','hill','school'];

function actor(a){
 const s = Math.max(.75, (a.s || 1) * 1.35), x = a.x, y = a.y, flip = a.flip ? -1 : 1;   // drawn larger than authored so they read on a phone
 let rot = 0, extra = '', body = (C[a.c] || C.dog)(a.color);
 const pose = a.pose || 'stand';
 if (pose === 'hang') rot = 180;
 if (pose === 'climb') rot = -60;
 if (pose === 'fall') rot = 35;
 if (pose === 'sit') body = `<g transform="translate(0 6) scale(1 .85)">${body}</g>`;
 if (pose === 'sleep') { rot = a.c === 'bat' ? 180 : 0; extra += `<text x="${18 * flip}" y="-34" font-family="system-ui" font-size="16" font-weight="700" fill="${INK}" stroke="none" transform="scale(${flip} 1)">z z</text>`; }
 let g = `<g transform="translate(${x} ${y}) scale(${s * flip} ${s}) rotate(${rot})" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;
 const fx = (dx) => x - dx * s * flip;
 if (pose === 'run') g += [0, 1, 2].map(i => `<path d="M${fx(40 + i * 2)} ${y - 8 + i * 10}h${-16 * flip}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join('');
 if (pose === 'jump') g += `<path d="M${fx(30)} ${y + 34 * s}q${12 * flip} -14 ${26 * flip} 0" fill="none" stroke="${INK}" stroke-width="2.5" stroke-dasharray="4 4"/>`;
 if (pose === 'fly') g += `<path d="M${fx(46)} ${y - 4}q${-10 * flip} -8 ${-20 * flip} 0M${fx(46)} ${y + 8}q${-10 * flip} -8 ${-20 * flip} 0" fill="none" stroke="${INK}" stroke-width="2.5"/>`;
 if (pose === 'swim') g += `<path d="M${x - 40 * s} ${y + 18 * s}q10 -6 20 0t20 0t20 0t20 0" fill="none" stroke="#4c8fd6" stroke-width="3"/>`;
 if (pose === 'happy') g += sym('heart', x + 26 * s * flip, y - 40 * s, .35 * s);
 if (pose === 'sad') g += sym('drop', x + 22 * s * flip, y - 30 * s, .25 * s);
 if (pose === 'scared') g += `<path d="M${x - 14 * s} ${y - 46 * s}l-4 -10M${x} ${y - 50 * s}v-11M${x + 14 * s} ${y - 46 * s}l4 -10" stroke="${INK}" stroke-width="2.5"/>`;
 if (pose === 'eat') g += sym('apple', x + 40 * s * flip, y - 4 * s, .35 * s);
 if (pose === 'hide') g = `<g opacity=".55">${g}</g>`;
 return g + extra;
}

function place(name){
 const sky = { night: '#2c3e5c', cave: '#3a3340', inside: '#f3e6cf', kitchen: '#f3e6cf', school: '#f3e6cf', rain: '#c8d3d8', snow: '#dfeaf1' }[name] || '#d6ecf7';
 let o = `<rect width="300" height="300" fill="${sky}"/>`;
 switch (name) {
  case 'cave': o += `<path d="M0 300V120Q20 30 150 20Q280 30 300 120V300Z" fill="#6d6170"/><path d="M60 300V170Q70 90 150 85Q230 90 240 170V300Z" fill="#1f1a24"/><rect y="270" width="300" height="30" fill="#55495a"/>`; break;
  case 'inside': case 'kitchen': case 'school': o += `<rect y="220" width="300" height="80" fill="#d9b071"/><rect x="190" y="50" width="80" height="70" fill="#d6ecf7" stroke="${INK}" stroke-width="3"/><path d="M230 50V120M190 85H270" stroke="${INK}" stroke-width="2"/>` + (name === 'kitchen' ? sym('pot', 70, 205, .9) + `<rect x="20" y="210" width="110" height="12" fill="#9aa5a8" stroke="${INK}" stroke-width="2"/>` : name === 'school' ? `<rect x="20" y="60" width="140" height="80" fill="#3f6b55" stroke="${INK}" stroke-width="3"/><path d="M40 90h70M40 110h50" stroke="#fff" stroke-width="3"/>` : ''); break;
  case 'night': o += moon(240, 60, .9) + `<rect y="230" width="300" height="70" fill="#3e5a3e"/>` + [[40, 40], [120, 70], [180, 30], [70, 110]].map(([x, y]) => sym('star', x, y, .25, '#f2e9a6')).join(''); break;
  case 'pond': o += `<rect y="210" width="300" height="90" fill="#9ccc65"/><ellipse cx="160" cy="250" rx="120" ry="34" fill="#7cc4e8" stroke="${INK}" stroke-width="2.5"/>`; break;
  case 'beach': o += `<rect y="200" width="300" height="40" fill="#7cc4e8"/><rect y="235" width="300" height="65" fill="#ecd08e"/>` + sym('sun', 250, 55, .8); break;
  case 'snow': o += `<rect y="220" width="300" height="80" fill="#f8fbfd"/>` + [[50, 60], [140, 40], [230, 90], [90, 150], [200, 160]].map(([x, y]) => sym('flake', x, y, .25, 'none')).join(''); break;
  case 'rain': o += sym('cloud', 90, 50, 1.4, '#b0bec5') + sym('cloud', 220, 60, 1.2, '#b0bec5') + `<rect y="230" width="300" height="70" fill="#9ccc65"/>` + Array.from({ length: 14 }, (_, i) => `<path d="M${20 + (i * 41) % 270} ${90 + (i * 23) % 110}l-6 14" stroke="#4c8fd6" stroke-width="3" stroke-linecap="round"/>`).join(''); break;
  case 'road': o += `<rect y="220" width="300" height="80" fill="#9aa5a8"/><path d="M0 260H300" stroke="#fff" stroke-width="4" stroke-dasharray="20 14"/>`; break;
  case 'sky': o += sym('cloud', 70, 70, 1.1) + sym('cloud', 230, 130, 1.2); break;
  case 'forest': o += `<rect y="230" width="300" height="70" fill="#6cc070"/>` + [[40, 190], [260, 185], [150, 175]].map(([x, y]) => sym('tree', x, y, 2.2)).join(''); break;
  case 'hill': o += `<path d="M0 300V200Q150 90 300 200V300Z" fill="#9ccc65" stroke="${INK}" stroke-width="2"/>`; break;
  case 'park': o += `<rect y="230" width="300" height="70" fill="#9ccc65"/>` + sym('tree', 250, 180, 2.4) + sym('flower', 40, 225, .7); break;
  default: o += `<rect y="230" width="300" height="70" fill="#9ccc65"/>` + sym('sun', 250, 55, .7);
 }
 return o;
}

// A big tree that characters can climb or sit in (a prop with its own shape).
function bigtree(x = 220, y = 230, s = 1){ return `<g transform="translate(${x} ${y}) scale(${s})" stroke="${INK}" stroke-width="2.5"><rect x="-14" y="-130" width="28" height="130" fill="#a57148"/><path d="M-14-90-50-120M14-100 40-126" stroke-width="10" stroke="#a57148"/><circle cy="-160" r="62" fill="#6cc070"/><circle cx="-46" cy="-126" r="30" fill="#6cc070"/><circle cx="46" cy="-130" r="30" fill="#6cc070"/></g>`; }

// A full, glowing moon: the shared crescent is too thin to read on a small night panel.
const moon = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><circle r="30" fill="#f2e9a6" opacity=".25"/><circle r="22" fill="#f7efb8" stroke="${INK}" stroke-width="2.5"/><circle cx="-7" cy="-5" r="4" fill="#e2d68a"/><circle cx="6" cy="7" r="3" fill="#e2d68a"/></g>`;
export function panel(spec, { size = 300, label = '' } = {}){
 const props = (spec.props || []).map(p => p.sym === 'bigtree' ? bigtree(p.x, p.y, p.s || 1) : p.sym === 'moon' ? moon(p.x, p.y, Math.max(.6, (p.s || 1) * 1.3)) : sym(p.sym, p.x, p.y, Math.max(.6, (p.s || 1) * 1.3), p.color)).join('');
 const arrows = (spec.arrows || []).map(([x1, y1, x2, y2]) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="#d65b3e" stroke-width="5" stroke-linecap="round" marker-end="url(#sd-tip)"/>`).join('');
 const cast = (spec.cast || []).map(actor).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${size}" height="${size}" role="img" aria-label="${(label || spec.alt || 'picture panel').replace(/"/g, '&quot;')}"><defs><marker id="sd-tip" markerWidth="10" markerHeight="10" refX="7" refY="5" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L10 5L0 10Z" fill="#d65b3e"/></marker><clipPath id="sd-clip"><rect width="300" height="300" rx="18"/></clipPath></defs><g clip-path="url(#sd-clip)">${place(spec.place || 'grass')}${props}${cast}${arrows}</g><rect x="1.5" y="1.5" width="297" height="297" rx="18" fill="none" stroke="${INK}" stroke-width="3"/></svg>`;
}
