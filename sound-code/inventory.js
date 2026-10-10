// Sound Code spelling units, the module that teaches each, and an anchor word that carries the sound.
// Notation inside a word's "units": dot-separated, in spoken order: "sh.i.p", "m.a_e.k" (a_e = a…e across k),
// "r.ai.n", "s.ea:EE" (a tag picks one of a spelling's sounds), "j.u.m.p.+ed:t" (+ = grammar ending).
export const UNITS = {
 1: { a: 'map', e: 'bed', i: 'sit', o: 'hot', u: 'cup', b: 'bat', c: 'cat', d: 'dog', f: 'fan', g: 'got', h: 'hat', j: 'jam', k: 'kit', l: 'lip', m: 'map', n: 'net', p: 'pan', r: 'red', s: 'sun', t: 'top', v: 'van', w: 'wet', x: 'box', y: 'yes', z: 'zip' },
 2: { sh: 'ship', ch: 'chin', th: 'thin', ng: 'ring', ck: 'back', wh: 'when', ss: 'miss', ll: 'bell', ff: 'off', zz: 'buzz' },
 3: { qu: 'quit' },
 4: { a_e: 'make', e_e: 'theme', i_e: 'time', o_e: 'home', u_e: 'cube' },
 5: { ai: 'rain', ay: 'day', ee: 'see', 'ea:EE': 'team', oa: 'boat', 'ow:OH': 'snow', igh: 'night', 'ie:EYE': 'pie', 'y:EYE': 'fly' },
 6: { ar: 'car', or: 'fork', er: 'her', ir: 'bird', ur: 'turn' },
 7: { '+s': 'cats', '+es': 'dishes', '+ed:t': 'jumped', '+ed:d': 'filled', '+ed:id': 'rested', '+ing': 'jumping' },
 8: { le: 'table' },
 9: { 'ea:e': 'head', 'oo:OO': 'moon', 'oo:u': 'book', 'ow:OW': 'cow', oi: 'coin', oy: 'toy', 'ou:OW': 'out', 'c:s': 'city', 'g:j': 'giant', 'y:EE': 'happy' },
 14: { ph: 'phone', 'ch:k': 'school' },
};
export const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'a_e', 'e_e', 'i_e', 'o_e', 'u_e', 'ai', 'ay', 'ee', 'ea:EE', 'oa', 'ow:OH', 'igh', 'ie:EYE', 'y:EYE', 'ar', 'or', 'er', 'ir', 'ur', 'ea:e', 'oo:OO', 'oo:u', 'ow:OW', 'oi', 'oy', 'ou:OW', 'y:EE']);
export function taughtBy(m){ const out = {}; for (const k of Object.keys(UNITS)) if (+k <= m) Object.assign(out, UNITS[k]); return out; }
export function unitOf(u){ for (const k of Object.keys(UNITS)) if (u in UNITS[k]) return +k; return null; }
// Spelling of a unit string: drop tags, '+' and turn V_e into V plus a final e.
export function spell(units){
 const us = units.split('.'); let out = '', tailE = false;
 for (const u of us) { let g = u.replace(/^\+/, '').replace(/:.*$/, ''); if (/^[aeiou]_e$/.test(g)) { tailE = true; g = g[0]; } out += g; }
 // final e of V_e comes after the consonant(s) that follow the vowel, before any + ending
 if (tailE) { const ends = us.filter(u => u.startsWith('+')).map(u => u.slice(1).replace(/:.*$/, '')).join(''); out = !ends ? out + 'e' : /^[ei]/.test(ends) ? out : out.slice(0, out.length - ends.length) + 'e' + ends; }   // hope+ed = hoped, hope+ing = hoping
 return out;
}
export const MODULES = [
 { n: 0, title: 'Letters and their sounds', short: 'letter sounds' },
 { n: 1, title: 'Short vowels: three-sound words', short: 'map, sit, hot' },
 { n: 2, title: 'Letter teams: sh, ch, th, ng, ck', short: 'ship, chat, ring' },
 { n: 3, title: 'Keep every sound: st, pl, mp…', short: 'stop, lamp, flag' },
 { n: 4, title: 'Silent e: make, time, home', short: 'make, time, home' },
 { n: 5, title: 'Vowel teams: ai, ay, ee, oa, igh…', short: 'rain, see, boat' },
 { n: 6, title: 'Vowel + r: ar, or, er, ir, ur', short: 'car, fork, bird' },
 { n: 7, title: 'Endings: -s, -es, -ed, -ing', short: 'cats, jumped' },
 { n: 8, title: 'Two-beat words', short: 'rabbit, robot, table' },
 { n: 9, title: 'More vowel sounds: head, book, cow, coin', short: 'head, book, cow' },
 { n: 10, title: 'Word parts: re-, un-, -er, -ful…', short: 'replay, hopeful' },
 { n: 11, title: 'Long words: -ic, -tion', short: 'fantastic, location' },
 { n: 12, title: 'The strong beat and weak vowels', short: 'about, machine' },
 { n: 13, title: 'Words with a tricky part', short: 'said, have, one' },
 { n: 14, title: 'Science words: ph, ch = k, bio-, -logy', short: 'photo, biology' },
 { n: 15, title: 'Reading it all in sentences', short: 'sentences and passages' },
];
