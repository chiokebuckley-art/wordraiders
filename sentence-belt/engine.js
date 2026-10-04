// Sentence Belt rules (no DOM): which part orders a paragraph accepts, and where an order first goes wrong.
// An item's parts are in its teaching order; `free` lists groups of positions whose sentences may swap
// (two details that read well either way). Everything else must sit in its own place.

/** True when `placed` (part indices, one per slot) is an order the paragraph accepts. */
export function accepts(item,placed){
 const n=item.parts.length;if(!Array.isArray(placed)||placed.length!==n||new Set(placed).size!==n)return false;
 return firstWrong(item,placed)===-1;
}
/** The first slot holding a part that cannot go there, or -1 when every slot is fine. */
export function firstWrong(item,placed){
 for(let i=0;i<placed.length;i++){
  const group=(item.free||[]).find(g=>g.includes(i));
  if(group?!group.includes(placed[i]):placed[i]!==i)return i;
 }
 return -1;
}
/** A kid hint for the slot that is wrong. */
export function hintFor(item,lessonId,slot){
 const last=item.parts.length-1;
 if(slot===0)return 'Which sentence tells what the whole paragraph is about? It goes first.';
 if(slot===last)return 'Which sentence wraps it all up? It goes last.';
 if(lessonId==='order')return 'Check the order of the steps. Which one has to happen next?';
 return 'Each middle sentence should tell more about the topic. Try swapping them around.';
}
/** Shuffle a copy (Fisher–Yates) with the given random source. */
export function shuffled(xs,rng=Math.random){const a=[...xs];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
/** A tray order that is never already the answer, so there is always something to build. */
export function trayOrder(item,rng=Math.random){
 const idx=item.parts.map((_,i)=>i);
 for(let t=0;t<20;t++){const s=shuffled(idx,rng);if(!accepts(item,s))return s;}
 return [...idx].reverse();
}
/** The next items for a round: ones not yet passed first (in order); once all are passed, a random review. */
export function roundItems(items,passed,size=3,rng=Math.random){
 const fresh=items.filter(it=>!passed[it.id]);
 return fresh.length?fresh.slice(0,size):shuffled(items,rng).slice(0,size);
}
