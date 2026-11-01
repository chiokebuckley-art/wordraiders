import {wordById, spellCrystals} from './spelling-bank.js?v=nb-spell-1';

export const validSpell = q => q?.type === 'spell' && typeof q.word === 'string' && !!q.word.trim() && q.word !== 'undefined';
const spellOf = w => ({type:'spell', id:w.id, word:w.word, meaning:w.meaning || '', sentence:w.sentence || ''});
function shuffle(list, rng){
 const out = list.slice();
 for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
 return out;
}
/** Resolve Crystal.words IDs before reading word fields. Held-out words stay out of practice. */
export function spellingExtra(id, rng = Math.random){
 const w = Object.hasOwn(wordById, id) ? wordById[id] : null;
 if (!w) return null;
 const i = spellCrystals.findIndex(c => c.id === w.crystal);
 if (i < 0) return null;
 const taught = c => (c?.words || []).map(id => Object.hasOwn(wordById, id) ? wordById[id] : null)
  .filter(x => x && !x.heldOut && x.id !== w.id && typeof x.word === 'string' && x.word.trim());
 return {game:'spell', spellBank:1, orig:spellOf(w),
  same:shuffle(taught(spellCrystals[i]), rng).slice(0, 8).map(spellOf),
  twist:shuffle(taught(spellCrystals[i - 1]).concat(i === 0 ? taught(spellCrystals[i + 1]) : []), rng).slice(0, 4).map(spellOf)};
}
/** Only replace a card's question payload; identity, history and spacing stay intact. */
export function repairSpellingCard(card, rng){
 const extra = card.extra;
 if (extra?.spellBank === 1 && validSpell(extra.orig) && Array.isArray(extra.same) && extra.same.length && extra.same.every(validSpell) && Array.isArray(extra.twist) && extra.twist.every(validSpell)) return extra;
 const id = card.ref?.startsWith('spell:') ? card.ref.slice(6) : extra?.orig?.id;
 const repaired = spellingExtra(id, rng);
 if (!repaired || !repaired.same.length) throw new Error('Spelling practice unavailable');
 card.extra = repaired;
 return repaired;
}
