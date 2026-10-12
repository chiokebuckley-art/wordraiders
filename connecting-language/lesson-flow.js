import {reviewDigest} from './review-policy.js';
// Resume only presentation position, in this browser tab; no responses or learner text.
export const cursorKey=playerId=>'wr-connecting-screen.'+playerId;
export const lessonRevision=(sense,bank)=>reviewDigest(sense,'sense')+':'+bank.map(e=>reviewDigest(e,'exercise')).join('|');
export function readCursor(raw,playerId,day,catalog,exercises){
 try{const c=JSON.parse(raw);if(!c||c.playerId!==playerId||typeof c.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(c.day)||c.day>day||!['lesson','assessment'].includes(c.view))return null;
 const sense=catalog.find(r=>r.id===c.senseId);if(!sense)return null;const guided=exercises.filter(e=>e.senseId===sense.id&&e.mode==='guided');if(c.revision!==lessonRevision(sense,exercises.filter(e=>e.senseId===sense.id))||typeof c.daily!=='boolean'||typeof c.sessionDay!=='string')return null;
 if(c.view==='lesson'&&(!Number.isInteger(c.phase)||c.phase<0||c.phase>4||!Number.isInteger(c.questionIndex)||c.questionIndex<0||c.questionIndex>=Math.max(1,guided.length)))return null;
 if(c.view==='assessment'&&(c.day!==day||c.attemptDay!==day||!Number.isInteger(c.questionIndex)||c.questionIndex<0||c.questionIndex>=6||!Array.isArray(c.bankIds)||c.bankIds.length!==6||new Set(c.bankIds).size!==6||!c.bankIds.every(id=>exercises.some(e=>e.id===id&&e.mode==='assessment'&&e.senseId===sense.id))))return null;
 return {playerId,day,view:c.view,senseId:sense.id,revision:c.revision,daily:c.daily,sessionDay:c.sessionDay,phase:c.phase,questionIndex:c.questionIndex,...(c.view==='assessment'?{attemptDay:c.attemptDay,bankIds:c.bankIds}: {})};
 }catch{return null;}
}
export function learnerPrompt(prompt){return prompt==='Which description does the draft catalog assign to this sense?'?'What does this expression mean here?':prompt==='Which example belongs to this draft sense record?'?'Which example uses this expression in the same way?':prompt;}
