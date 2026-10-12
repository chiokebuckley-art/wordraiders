import {aiReviewComplete,reviewedItem,reviewDigest} from './review-policy.js';
// Shared by the standalone lesson page and the hub. Free text stays device-local; participation and choice IDs may use existing linked sync.
export const validId=id=>typeof id==='string'&&/^CD-\d{4}$/.test(id)&&Number(id.slice(3))>=1&&Number(id.slice(3))<=248;
export const localDay=now=>{const d=new Date(now);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};
export const fresh=()=>({version:1,sessions:{},exposures:{},attempts:{},notes:{},responses:{},worksheets:{}});
export function formalTruth(id,p,q){
 if(typeof p!=='boolean'||typeof q!=='boolean')throw Error('Truth values must be Boolean.');
 const values={'CD-0233':p&&q,'CD-0234':p||q,'CD-0235':!p,'CD-0236':p!==q,'CD-0237':!p||q,'CD-0238':p===q};
 return values[id];
}
export function assetFormat(kind,mime){
 return ['scene','contrast-01','contrast-02','static-01','static-02','static-03'].includes(kind)?['image/png','image/jpeg','image/webp','image/svg+xml'].includes(mime):kind==='motion'?mime==='video/mp4':['audio-expression','audio-example'].includes(kind)&&['audio/mpeg','audio/wav'].includes(mime);
}
export function usableAsset(asset,sense){
 return !!asset&&assetFormat(asset.kind,asset.mime)&&asset.status==='reviewed'&&aiReviewComplete(asset,'asset')&&asset.human_review_required!==true&&['reviewer','reviewed_at','alt_text'].every(key=>typeof asset[key]==='string'&&asset[key].trim().length>0)&&asset.senseId===sense.id&&asset.content_version===sense.content_version&&asset.term===sense.term&&asset.meaning===sense.meaning&&asset.example===sense.example&&/^[a-f0-9]{64}$/.test(asset.sha256)&&/^assets\/[\w.-]+$/.test(asset.path)&&typeof asset.alt_text==='string'&&asset.alt_text.length>0;
}
const validKey=k=>/^[\w:.-]{1,160}$/.test(k)&&!['__proto__','constructor','prototype'].includes(k);
const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
const stamp=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0?x:0;
export function parse(raw){
 const x=obj(raw),out=fresh();
 for(const [id,v]of Object.entries(obj(x.exposures)))if(validId(id)&&stamp(v))out.exposures[id]=v;
 for(const [key,v]of Object.entries(obj(x.sessions))){
  const s=obj(v);if(!/^\d{4}-\d{2}-\d{2}$/.test(key)||!Array.isArray(s.ids)||s.ids.length<1||s.ids.length>3||!s.ids.every(validId)||new Set(s.ids).size!==s.ids.length)continue;
  out.sessions[key]={ids:s.ids,seen:s.ids.filter(id=>Array.isArray(s.seen)&&s.seen.includes(id)),at:stamp(s.at),completedAt:stamp(s.completedAt),completedDay:typeof s.completedDay==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s.completedDay)?s.completedDay:''};
  if(out.sessions[key].seen.length!==s.ids.length){out.sessions[key].completedAt=0;out.sessions[key].completedDay='';}
 }
 for(const [key,v]of Object.entries(obj(x.attempts))){const a=obj(v);if(validKey(key)&&validId(a.senseId)&&typeof a.exerciseId==='string'&&typeof a.answer==='string')out.attempts[key]={senseId:a.senseId,exerciseId:a.exerciseId.slice(0,100),answer:a.answer.slice(0,200),at:stamp(a.at),contentVersion:stamp(a.contentVersion),exerciseVersion:stamp(a.exerciseVersion),reviewedAtAttempt:a.reviewedAtAttempt===true,conflicted:a.conflicted===true,...(typeof a.senseSnapshot==='string'?{senseSnapshot:a.senseSnapshot}:{}),...(typeof a.reviewSnapshot==='string'?{reviewSnapshot:a.reviewSnapshot}:{}),...(typeof a.exerciseRevision==='number'?{exerciseRevision:stamp(a.exerciseRevision)}:{})};}
 for(const [id,v]of Object.entries(obj(x.notes))){const n=obj(v);if(validId(id)&&typeof n.text==='string')out.notes[id]={text:n.text.slice(0,1000),at:stamp(n.at),review:'pending'};}
 for(const [key,v]of Object.entries(obj(x.responses))){const r=obj(v);if(validKey(key)&&validId(r.senseId)&&typeof r.exerciseId==='string'&&typeof r.text==='string')out.responses[key]={senseId:r.senseId,exerciseId:r.exerciseId.slice(0,100),text:r.text.slice(0,2000),spoken:r.spoken===true,at:stamp(r.at),contentVersion:stamp(r.contentVersion),status:'human-feedback-pending',prompt:typeof r.prompt==='string'?r.prompt.slice(0,2000):'',context:typeof r.context==='string'?r.context.slice(0,4000):''};}
 for(const [key,v]of Object.entries(obj(x.worksheets))){const w=obj(v);if(!Object.hasOwn(out.responses,key))continue;const ratings=obj(w.ratings),allowed=['not-reviewed','needs-work','developing','clear'];out.worksheets[key]={responseAt:stamp(w.responseAt),responseText:typeof w.responseText==='string'?w.responseText.slice(0,2000):'',reviewerLabel:typeof w.reviewerLabel==='string'?w.reviewerLabel.slice(0,80):'',feedback:typeof w.feedback==='string'?w.feedback.slice(0,2000):'',ratings:Object.fromEntries(['grammar','relation','fluency'].map(k=>[k,allowed.includes(ratings[k])?ratings[k]:'not-reviewed'])),at:stamp(w.at),status:'unverified-human-annotation'};}
 return out;
}
function pick(a,b){return JSON.stringify(a)>=JSON.stringify(b)?a:b;}
export function merge(a,b){
 if(!a&&!b)return undefined;const x=parse(a),y=parse(b),o=fresh();
 for(const id of new Set([...Object.keys(x.exposures),...Object.keys(y.exposures)]))o.exposures[id]=Math.max(x.exposures[id]||0,y.exposures[id]||0);
 for(const day of new Set([...Object.keys(x.sessions),...Object.keys(y.sessions)])){
  const p=x.sessions[day],q=y.sessions[day];if(!p||!q){o.sessions[day]=p||q;continue;}
  const chosen=pick(p.ids,q.ids)===p.ids?p:q,ids=chosen.ids;
  const seen=ids.filter(id=>p.seen.includes(id)||q.seen.includes(id));
  const done=[p,q].filter(s=>s.completedAt&&s.ids.every(id=>ids.includes(id))).sort((a,b)=>a.completedAt-b.completedAt||a.completedDay.localeCompare(b.completedDay))[0];
  o.sessions[day]={ids,seen,at:Math.min(p.at,q.at),completedAt:seen.length===ids.length?done?.completedAt||0:0,completedDay:done?.completedDay||''};
 }
 for(const key of new Set([...Object.keys(x.attempts),...Object.keys(y.attempts)])){const p=x.attempts[key],q=y.attempts[key];if(!p||!q)o.attempts[key]=p||q;else if(p.at!==q.at)o.attempts[key]=!p.at?q:!q.at?p:p.at<q.at?p:q;else o.attempts[key]={...pick(p,q),conflicted:p.conflicted||q.conflicted||JSON.stringify(p)!==JSON.stringify(q)};}
 for(const key of new Set([...Object.keys(x.notes),...Object.keys(y.notes)])){const p=x.notes[key],q=y.notes[key];o.notes[key]=!p?q:!q?p:p.at>q.at?p:q.at>p.at?q:pick(p,q);}
 for(const field of ['responses','worksheets'])for(const key of new Set([...Object.keys(x[field]),...Object.keys(y[field])])){const p=x[field][key],q=y[field][key];o[field][key]=!p?q:!q?p:p.at>q.at?p:q.at>p.at?q:pick(p,q);}
 return parse(o);
}
export function status(raw,now){
 const d=parse(raw),day=localDay(now),sessions=Object.values(d.sessions);
 return {done:sessions.some(s=>s.completedDay===day&&s.completedAt>0),available:!sessions.some(s=>s.completedDay>=day&&s.completedAt>0),count:3};
}
export function begin(raw,now,catalog){
 const d=parse(raw),pending=Object.entries(d.sessions).filter(([,s])=>!s.completedAt).sort(([a],[b])=>a.localeCompare(b))[0];
 if(pending)return {state:d,day:pending[0]};
 const day=localDay(now);if(!status(d,now).available)return {state:d,day:Object.keys(d.sessions).sort().at(-1)||day};
 const literacy=catalog.filter(r=>Number(r.id.slice(3))<233).sort((a,b)=>a.level-b.level||a.id.localeCompare(b.id));
 const due=literacy.filter(r=>d.exposures[r.id]&&localDay(d.exposures[r.id])<day).sort((a,b)=>d.exposures[a.id]-d.exposures[b.id]);
 const unseen=literacy.filter(r=>!d.exposures[r.id]);
 // Two new senses and one later-day retrieval when available.
 const ids=[...due.slice(0,1),...unseen.slice(0,due.length?2:3),...due.slice(1)].slice(0,3).map(r=>r.id);
 if(!ids.length)return {state:d,day};
 d.sessions[day]={ids,seen:[],at:now,completedAt:0,completedDay:''};return {state:d,day};
}
export function acknowledge(raw,day,id,now){
 const d=parse(raw),s=d.sessions[day];if(!s||s.completedAt||!s.ids.includes(id)||s.seen.includes(id))return d;
 // Only the next card can complete: stale/repeated button handlers cannot skip ahead.
 if(s.ids.find(k=>!s.seen.includes(k))!==id)return d;
 s.seen.push(id);d.exposures[id]=Math.max(d.exposures[id]||0,now);
 if(s.seen.length===s.ids.length){s.completedAt=now;s.completedDay=localDay(now);}return d;
}
export function recordAttempt(raw,key,sense,exercise,answer,now){
 const d=parse(raw);if(!validKey(key)||Object.hasOwn(d.attempts,key)||exercise.senseId!==sense.id||!exercise.choices?.some(c=>c.id===answer))return d;
 d.attempts[key]={conflicted:false,senseId:sense.id,exerciseId:exercise.id,answer,at:now,contentVersion:sense.content_version,exerciseVersion:stamp(exercise.content_version),reviewedAtAttempt:now>=Date.parse(sense.reviewed_at)&&now>=Date.parse(exercise.reviewed_at)&&reviewedItem(sense,'sense')&&(!sense.editorial_finding_ids?.length||!!sense.editorial_resolved_at)&&reviewedItem(exercise,'exercise')&&exercise.content_version===sense.content_version&&exercise.mode==='assessment',...(exercise.exercise_revision!==undefined?{exerciseRevision:exercise.exercise_revision}:{}),...(exercise.reviewer_type==='ai'?{reviewSnapshot:reviewDigest(exercise,'exercise'),senseSnapshot:reviewDigest(sense,'sense')}: {})};return d;
}
export function recordResponse(raw,key,sense,exercise,text,spoken,now){
 const d=parse(raw);if(!validKey(key)||exercise.senseId!==sense.id||exercise.content_version!==sense.content_version||exercise.mode!=='guided'||Array.isArray(exercise.choices)||typeof text!=='string'||(!text.trim()&&!spoken))return d;
 d.responses[key]={senseId:sense.id,exerciseId:exercise.id,text:text.slice(0,2000),spoken:spoken===true,at:now,contentVersion:sense.content_version,status:'human-feedback-pending',prompt:typeof exercise.prompt==='string'?exercise.prompt.slice(0,2000):'',context:typeof exercise.context==='string'?exercise.context.slice(0,4000):''};return d;
}
export function recordWorksheet(raw,key,reviewerLabel,ratings,feedback,now,expectedAt,expectedText){
 const d=parse(raw),response=d.responses[key];if(!response||response.at!==expectedAt||response.text!==expectedText)throw Error('The response changed or is unavailable. Reopen the worksheet before recording feedback.');if(typeof reviewerLabel!=='string'||!reviewerLabel.trim()||typeof feedback!=='string')return d;
 d.worksheets[key]={responseAt:response.at,responseText:response.text,reviewerLabel:reviewerLabel.slice(0,80),ratings,feedback:feedback.slice(0,2000),at:now,status:'unverified-human-annotation'};return parse(d);
}
export function assessmentItems(sense,exercises){return exercises.filter(e=>e.mode==='assessment'&&e.senseId===sense.id&&reviewedItem(e,'exercise')&&e.content_version===sense.content_version&&Array.isArray(e.choices)&&e.choices.length>=2&&new Set(e.choices.map(c=>c.id)).size===e.choices.length&&e.choices.every(c=>typeof c.id==='string'&&typeof c.text==='string')&&Array.isArray(e.accepted_answers)&&e.accepted_answers.length>0&&e.accepted_answers.every(a=>e.choices.some(c=>c.id===a)));}
export function reviewEvidence(raw,sense,exercises,now){
 const reviewed=reviewedItem(sense,'sense')&&(!sense.editorial_finding_ids?.length||sense.editorial_resolved_at);
 const pool=assessmentItems(sense,exercises);
 const regular=pool.filter(e=>!e.new_context).slice(0,5),contexts=pool.filter(e=>e.new_context);
 if(!reviewed||regular.length<5||!contexts.length||new Set(pool.map(e=>e.id)).size!==pool.length)return {state:'review-pending',passed:false,retained:false};
 const allHistory=Object.values(parse(raw).attempts).filter(a=>a.senseId===sense.id&&a.at<=now);
 const history=allHistory.filter(a=>a.contentVersion===sense.content_version);
 const attempts=history.filter(a=>a.exerciseVersion===sense.content_version&&a.reviewedAtAttempt&&!a.conflicted&&a.at>0&&a.senseSnapshot===reviewDigest(sense,'sense')&&pool.some(e=>e.id===a.exerciseId&&(e.exercise_revision===undefined||a.exerciseRevision===e.exercise_revision)&&(e.reviewer_type!=='ai'||a.reviewSnapshot===reviewDigest(e,'exercise'))));
 const days=[...new Set(attempts.map(a=>localDay(a.at)))].sort(),passes=[];
 for(const day of days){const hits=[...regular,...contexts].filter(e=>{const first=attempts.filter(a=>localDay(a.at)===day&&a.exerciseId===e.id).sort((a,b)=>a.at-b.at||a.answer.localeCompare(b.answer))[0];return first&&e.accepted_answers?.includes(first.answer);});
  if(hits.filter(e=>!e.new_context).length>=4&&hits.some(e=>e.new_context))passes.push({day,contexts:hits.filter(e=>e.new_context).map(e=>e.id)});}
 const retained=passes.some(p=>p.day>passes[0].day&&p.contexts.some(id=>!allHistory.some(a=>a.exerciseId===id&&localDay(a.at)<p.day)));
 return {state:passes.length?'application-checked':'practice-needed',passed:passes.length>0,retained,due:passes.length>0&&localDay(now)>passes.at(-1).day};
}
export const privateKey=playerId=>'wr-connecting-private.'+playerId;
const privatePart=raw=>{const d=parse(raw);return {version:1,notes:d.notes,responses:d.responses,worksheets:d.worksheets};};
export function redactPlayer(player){if(!player||typeof player!=='object'||!player.connectingLanguage)return player;const d=parse(player.connectingLanguage);return {...player,connectingLanguage:{...d,notes:{},responses:{},worksheets:{}}};}
export function redactText(data){try{return JSON.stringify(redactPlayer(JSON.parse(data)));}catch{return data;}}
export function loadProgress(storage,playerId,raw){const value=storage.getItem(privateKey(playerId));if(!value)return parse(raw);const local=JSON.parse(value);if(!local||local.version!==1||typeof local!=='object'||Array.isArray(local))throw Error('Private response storage cannot be read. It has not been overwritten.');return merge(raw,local)||fresh();}
export function save(storage,playerId,fn,now,allowPrivateText=false){
 const registry=JSON.parse(storage.getItem('wordraiders.players.v1')||'null');if(!playerId||registry?.active!==playerId)throw Error('The active player changed. Return Home before continuing.');
 const key='wordraiders.save.'+playerId,player=JSON.parse(storage.getItem(key)||'null');
 if(!player||player.version!==2)throw Error('The player save cannot be read. It has not been overwritten.');
 const next=parse(fn(loadProgress(storage,playerId,player.connectingLanguage))),clean=redactPlayer({...player,connectingLanguage:next,savedAt:now});
 if(allowPrivateText){const privateData=JSON.stringify(privatePart(next));storage.setItem(privateKey(playerId),privateData);if(storage.getItem(privateKey(playerId))!==privateData)throw Error('Private responses could not be verified in device storage.');}
 else {const old=player.connectingLanguage||{};clean.connectingLanguage={...clean.connectingLanguage,notes:old.notes||{},responses:old.responses||{},worksheets:old.worksheets||{}};}
 storage.setItem(key,JSON.stringify(clean));return next;
}

export function clearDeviceData(storage,playerId){if(!playerId)return;for(const key of [privateKey(playerId),'wr-today-v2.'+playerId,'wr-today-visible-v2.'+playerId]){storage.removeItem(key);if(storage.getItem(key)!==null)throw Error('Device response storage could not be cleared.');}}

export function publicFingerprint(player){const sorted=x=>Array.isArray(x)?x.map(sorted):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,sorted(x[k])])):x;return JSON.stringify(sorted(redactPlayer(player)))||'null';}
