// WordRaiders Unified Journey: the shared active-time clock and the journey merge (docs/unified-journey.md §4, §5).
// Plain ES module with no imports. public/journey-shared.js is loaded by Common Words and StoryForge as
// '../journey-shared.js'; src/game/journeyShared.js is a byte-identical copy for the React app (a test checks it),
// typed by src/game/journeyShared.d.ts. Edit both copies together.

/** Seconds credited per active slice. */
export const CLOCK_SLICE=15;
/** A slice counts only with input (or speech) within this many ms. */
export const IDLE_MS=90000;
const DAY_SECONDS=86400,MAX_DAYS=120,MAX_DEVICES=8,ROLLOVER_HOURS=3;
const DEVICE_KEY='wordraiders.device.v1',CLOCK_PREFIX='wordraiders.clock.';
const DAY_RE=/^\d{4}-\d{2}-\d{2}$/,DEVICE_RE=/^[A-Za-z0-9_-]{1,64}$/;
const INPUTS=['pointerdown','keydown','input','change','wheel'];

const isObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const rec=x=>isObj(x)?x:{};
const num=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0?x:0;
const pad2=n=>String(n).padStart(2,'0');

/** The Journey day of epoch ms t: the local calendar date of (t - 3 h), so a day runs 03:00 to 03:00. */
export function journeyDay(t){const d=new Date(t-ROLLOVER_HOURS*3600000);return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;}

// ---------------------------------------------------------------- canonical helpers
/** Deep copy with object keys sorted (arrays keep their order). */
function sorted(x){
 if(Array.isArray(x))return x.map(sorted);
 if(!isObj(x))return x;
 const out={};for(const k of Object.keys(x).sort())if(x[k]!==undefined)out[k]=sorted(x[k]);return out;
}
const canon=x=>JSON.stringify(sorted(x))??'';
/** Deterministic tie-break between two values: the one whose canonical JSON sorts last. Commutative. */
const tie=(a,b)=>canon(a)>=canon(b)?a:b;
/** Pick by a numeric stamp: larger wins (newer), ties broken deterministically. */
function newer(a,b,stamp){if(a===undefined)return b;if(b===undefined)return a;const x=stamp(a),y=stamp(b);return x>y?a:y>x?b:tie(a,b);}
/** Pick by a numeric stamp: the smallest non-zero wins (earliest), ties broken deterministically. */
function earliest(a,b,stamp){if(a===undefined)return b;if(b===undefined)return a;const x=stamp(a)||Infinity,y=stamp(b)||Infinity;return x<y?a:y<x?b:tie(a,b);}
const minNonZero=(a,b)=>{const x=num(a),y=num(b);return x&&y?Math.min(x,y):x||y;};
/** Merge two records key by key with pick(a[k],b[k]) (either may be undefined). */
function byKey(a,b,pick){
 const x=rec(a),y=rec(b),out={};
 for(const k of new Set([...Object.keys(x),...Object.keys(y)])){const v=pick(x[k],y[k]);if(v!==undefined)out[k]=v;}
 return out;
}
const atOf=r=>num(rec(r).at);
/**
 * One not-yet record: the newer `at` wins. On equal `at` (the same failed check on two devices) the steps re-done on
 * either copy all count (redone: union, latest time per step), the retry stays open if either copy opened it (max
 * fixedAt: re-doing adds redone/fixedAt and keeps `at`) and the day's count is the larger (max today). The rest is a
 * deterministic pick made without those fields, so merging again changes nothing.
 */
function notYetPick(a,b){
 if(a===undefined&&b===undefined)return undefined;
 // One side, or different failures: the newer record, in the same normal form as a same-failure merge.
 if(a===undefined||b===undefined||atOf(a)!==atOf(b)){const r=a===undefined?b:b===undefined?a:atOf(a)>atOf(b)?a:b;return notYetPick(r,r);}
 const strip=r=>{const o={...r};delete o.fixedAt;delete o.today;delete o.redone;return o;};
 const base=tie(strip(a),strip(b)),fixedAt=Math.max(num(a.fixedAt),num(b.fixedAt)),today=Math.max(num(a.today),num(b.today));
 const redone=byKey(a.redone,b.redone,(p,q)=>Math.max(num(p),num(q))||undefined);
 const out={...base};if(today)out.today=today;if(fixedAt)out.fixedAt=fixedAt;if(Object.keys(redone).length)out.redone=redone;return out;
}
/**
 * One pass record: the earliest `at` wins (a pass is latched). Its later-day retention (retainedAt with retainedScore)
 * travels separately: the earliest non-zero retainedAt of either copy, with its own score.
 */
function passPick(a,b){
 if(a===undefined&&b===undefined)return undefined;if(a===undefined)a=b;if(b===undefined)b=a;
 const strip=r=>{const o={...r};delete o.retainedAt;delete o.retainedScore;return o;};
 const ret=r=>num(r.retainedAt)?{retainedAt:r.retainedAt,...(r.retainedScore!==undefined?{retainedScore:r.retainedScore}:{})}:undefined;
 const base=earliest(strip(a),strip(b),atOf),kept=earliest(ret(a),ret(b),r=>num(r.retainedAt));
 return kept?{...base,...kept}:base;
}

/** Keep the MAX_DAYS latest valid days and, per day, the MAX_DEVICES devices with the most seconds (clamped). */
function pruneTime(time){
 const t=rec(time),out={};
 for(const d of Object.keys(t).filter(k=>DAY_RE.test(k)).sort().slice(-MAX_DAYS)){
  const devs=Object.entries(rec(t[d])).filter(([k,v])=>DEVICE_RE.test(k)&&typeof v==='number'&&Number.isFinite(v)&&v>=1)
   .map(([k,v])=>[k,Math.min(DAY_SECONDS,Math.floor(v))]).sort((p,q)=>q[1]-p[1]||(p[0]<q[0]?-1:1)).slice(0,MAX_DEVICES);
  if(devs.length)out[d]=Object.fromEntries(devs);
 }
 return out;
}
function maxTime(a,b){
 const x=rec(a),y=rec(b),out={};
 for(const d of new Set([...Object.keys(x),...Object.keys(y)])){
  const dx=rec(x[d]),dy=rec(y[d]),day={};
  for(const dev of new Set([...Object.keys(dx),...Object.keys(dy)]))day[dev]=Math.max(num(dx[dev]),num(dy[dev]));
  out[d]=day;
 }
 return pruneTime(out);
}

// ---------------------------------------------------------------- mergeJourney
const KNOWN=new Set(['v','startedAt','start','startAt','placement','passes','demoted','notYet','attempts','electives','electivesAt',
 'electivePasses','den','denAt','budget','budgetAt','timedChecks','timedChecksAt','time','seen','explain','paragraph','storyforgeName','storyforge','studied','certAt','last']);

const objOr=x=>isObj(x)?x:undefined;
const objects=x=>{const out={};for(const [k,v] of Object.entries(rec(x)))if(isObj(v))out[k]=v;return out;};
const stamps=x=>{const out={};for(const [k,v] of Object.entries(rec(x)))if(num(v))out[k]=v;return out;};
/** Type-normalise one side before the field rules, so every rule picks between well-typed values. */
function norm(j){
 const sf=objOr(j.storyforge);
 return {...j,passes:objects(j.passes),electivePasses:objects(j.electivePasses),notYet:objects(j.notYet),demoted:stamps(j.demoted),
  attempts:stamps(j.attempts),seen:stamps(j.seen),studied:stamps(j.studied),
  start:{start:isObj(j.start)?j.start:{spell:0,meaning:0},startAt:num(j.startAt),placement:objOr(j.placement)},
  budget:{budget:num(j.budget),budgetAt:num(j.budgetAt)},
  electives:{electives:Array.isArray(j.electives)?j.electives.filter(e=>typeof e==='string'):[],electivesAt:num(j.electivesAt)},
  den:{den:j.den===true,denAt:num(j.denAt)},
  timedChecks:{timedChecks:j.timedChecks!==false,timedChecksAt:num(j.timedChecksAt)},
  explain:objOr(j.explain),paragraph:objOr(j.paragraph),last:objOr(j.last),
  storyforge:sf&&{done:num(sf.done),finisherAt:num(sf.finisherAt),at:num(sf.at)},
  storyforgeName:typeof j.storyforgeName==='string'?j.storyforgeName:undefined};
}

/**
 * Merge two saved journeys (§5). Idempotent and commutative; the result has sorted keys. (undefined, undefined) gives
 * undefined; a malformed side (not a plain object) is ignored in favour of the other side. Every field rule is a
 * selection under a total order (stamp, then canonical JSON) or a max/min, so merging again changes nothing.
 */
export function mergeJourney(a,b){
 const okA=isObj(a),okB=isObj(b);
 if(!okA&&!okB)return undefined;
 const x=norm(okA?a:b),y=norm(okB?b:a),out={};
 // Unknown (future) fields survive: one side's value, or a deterministic pick when both differ.
 for(const k of new Set([...Object.keys(x),...Object.keys(y)]))if(!KNOWN.has(k)){const v=x[k]===undefined?y[k]:y[k]===undefined?x[k]:tie(x[k],y[k]);if(v!==undefined)out[k]=v;}
 out.v=1;
 const minPick=(p,q)=>minNonZero(p,q);
 out.passes=byKey(x.passes,y.passes,passPick);
 out.electivePasses=byKey(x.electivePasses,y.electivePasses,passPick);
 out.demoted=byKey(x.demoted,y.demoted,minPick);
 out.notYet=byKey(x.notYet,y.notYet,notYetPick);
 out.attempts=byKey(x.attempts,y.attempts,(p,q)=>Math.max(num(p),num(q)));
 out.time=maxTime(x.time,y.time);
 out.seen=byKey(x.seen,y.seen,minPick);
 out.studied=byKey(x.studied,y.studied,minPick);
 out.startedAt=minNonZero(x.startedAt,y.startedAt);
 // start and placement travel together with startAt; budget, electives and den with their own stamps.
 const st=newer(x.start,y.start,s=>s.startAt);out.start=st.start;out.startAt=st.startAt;if(st.placement)out.placement=st.placement;
 const bu=newer(x.budget,y.budget,s=>s.budgetAt);out.budget=bu.budget;out.budgetAt=bu.budgetAt;
 const el=newer(x.electives,y.electives,s=>s.electivesAt);out.electives=el.electives;out.electivesAt=el.electivesAt;
 const dn=newer(x.den,y.den,s=>s.denAt);out.den=dn.den;out.denAt=dn.denAt;
 const tc=newer(x.timedChecks,y.timedChecks,s=>s.timedChecksAt);out.timedChecks=tc.timedChecks;out.timedChecksAt=tc.timedChecksAt;
 for(const k of ['explain','paragraph','last']){const v=newer(x[k],y[k],atOf);if(v!==undefined)out[k]=v;}
 const sx=x.storyforge,sy=y.storyforge;
 if(sx||sy){const p=sx||{},q=sy||{};out.storyforge={done:Math.max(num(p.done),num(q.done)),finisherAt:minNonZero(p.finisherAt,q.finisherAt),at:Math.max(num(p.at),num(q.at))};}
 const nx=x.storyforgeName,ny=y.storyforgeName;
 if(nx!==undefined||ny!==undefined){
  const tx=num(sx&&sx.at),ty=num(sy&&sy.at);
  out.storyforgeName=nx===undefined?ny:ny===undefined?nx:tx>ty?nx:ty>tx?ny:(nx>=ny?nx:ny);
 }
 const cert=minNonZero(x.certAt,y.certAt);if(cert)out.certAt=cert;
 return sorted(out);
}

// ---------------------------------------------------------------- device id and clock storage
let memoryDevice='';
function randomId(){
 const abc='abcdefghijklmnopqrstuvwxyz0123456789';let s='';
 const c=globalThis.crypto;
 if(c&&typeof c.getRandomValues==='function'){for(const n of c.getRandomValues(new Uint8Array(6)))s+=abc[n%36];}
 else for(let i=0;i<6;i++)s+=abc[Math.floor(Math.random()*36)];
 return 'd-'+s;
}
/** This device's stable id ('d-xxxxxx'), created once in 'wordraiders.device.v1'. */
export function deviceId(storage){
 try{const v=storage.getItem(DEVICE_KEY);if(typeof v==='string'&&DEVICE_RE.test(v))return v;}catch{/* storage blocked */}
 const id=memoryDevice||randomId();memoryDevice=id;
 try{storage.setItem(DEVICE_KEY,id);}catch{/* keep the in-memory id */}
 return id;
}
function cleanClock(raw,device){
 const x=rec(raw),days={};
 for(const d of Object.keys(rec(x.days)).filter(k=>DAY_RE.test(k)).sort().slice(-MAX_DAYS)){const s=Math.min(DAY_SECONDS,Math.floor(num(x.days[d])));if(s)days[d]=s;}
 const out={v:1,device:typeof x.device==='string'&&DEVICE_RE.test(x.device)?x.device:device,days};
 const l=rec(x.last);if(num(l.at))out.last={at:num(l.at),surface:String(l.surface||'').slice(0,40),href:String(l.href||'').slice(0,500)};
 return out;
}
/** This device's clock for a player ('wordraiders.clock.<playerId>'), or null when there is none or it cannot be read. */
export function readClock(storage,playerId){
 if(!playerId)return null;
 try{const raw=storage.getItem(CLOCK_PREFIX+playerId);if(!raw)return null;const x=JSON.parse(raw);if(!isObj(x))return null;return cleanClock(x,deviceId(storage));}
 catch{return null;}
}

/**
 * Fold a clock snapshot into journey.time (max per day and device). Pure and idempotent: returns a new journey, never
 * creates one (undefined stays undefined), and returns an unchanged copy when the clock is missing or malformed.
 */
export function foldClock(journey,clock){
 if(!isObj(journey))return journey===undefined?undefined:journey;
 const c=isObj(clock)?clock:null;
 if(!c||typeof c.device!=='string'||!DEVICE_RE.test(c.device))return {...journey};
 const add={};for(const [d,s] of Object.entries(rec(c.days)))if(DAY_RE.test(d)&&num(s))add[d]={[c.device]:Math.min(DAY_SECONDS,Math.floor(num(s)))};
 return {...journey,time:maxTime(journey.time,add)};
}

// ---------------------------------------------------------------- startClock
/**
 * Count active time for a WordRaiders player on this device. Every CLOCK_SLICE seconds a slice of exactly CLOCK_SLICE
 * seconds is credited to today's Journey day when the page is visible and there was input within IDLE_MS (or speech is
 * playing). Hidden, pagehide and blur stop counting; after that only fresh input starts it again. Writes only
 * 'wordraiders.clock.<playerId>'. onBudget(day, seconds) fires once per Journey day when the day's seconds reach
 * budgetSeconds (a number, or a function of the day for budgets that subtract other devices' time).
 */
export function startClock(opts={}){
 const g=globalThis;
 const {playerId,surface='',storage=g.localStorage,doc=g.document,win=g.window,now=()=>Date.now(),onBudget,budgetSeconds}=opts;
 const isSpeaking=opts.isSpeaking||(()=>!!(win&&win.speechSynthesis&&win.speechSynthesis.speaking));
 const noop={stop(){},read(){return null;}};
 if(!playerId||!storage||!doc||!win)return noop;
 const key=CLOCK_PREFIX+playerId,device=deviceId(storage);
 let armed=false,lastInput=-Infinity,firedDay='',timer=null,stopped=false;
 const visible=()=>doc.visibilityState==='visible';
 const href=()=>{try{return String(win.location&&win.location.href||'');}catch{return '';}};
 const budgetFor=day=>{const b=typeof budgetSeconds==='function'?budgetSeconds(day):budgetSeconds;return typeof b==='number'&&Number.isFinite(b)?b:Infinity;};
 function load(){let x=null;try{const raw=storage.getItem(key);x=raw?JSON.parse(raw):null;}catch{x=null;}return cleanClock(x,device);}
 function write(c){try{storage.setItem(key,JSON.stringify(c));}catch{/* storage full or blocked: the clock is best effort */}}
 function credit(t){
  // Read-modify-write so two tabs of the same player add up instead of overwriting each other.
  const c=load(),day=journeyDay(t),before=c.days[day]||0,after=Math.min(DAY_SECONDS,before+CLOCK_SLICE);
  c.days[day]=after;c.last={at:t,surface,href:href()};write(cleanClock(c,device));
  const budget=budgetFor(day);
  if(typeof onBudget==='function'&&firedDay!==day&&before<budget&&after>=budget){firedDay=day;try{onBudget(day,after);}catch{/* never break the clock */}}
 }
 function tick(){
  if(stopped)return;const t=now();
  if(!visible()){armed=false;return;}
  if(armed&&(t-lastInput<=IDLE_MS||isSpeaking()))credit(t);
 }
 const onInput=()=>{if(stopped||!visible())return;armed=true;lastInput=now();};
 const halt=()=>{armed=false;lastInput=-Infinity;};
 const onVisibility=()=>{if(!visible())halt();};
 const onBlur=e=>{if(!e||e.target===win||e.target===undefined)halt();};
 // Synchronous final write of the resume pointer; never re-creates a clock that was removed (player deleted, data reset).
 const onPageHide=()=>{halt();let exists=false;try{exists=!!storage.getItem(key);}catch{exists=false;}if(!exists)return;const c=load();c.last={at:now(),surface,href:href()};write(cleanClock(c,device));};
 const cap={capture:true,passive:true};
 for(const type of INPUTS)doc.addEventListener(type,onInput,cap);
 doc.addEventListener('visibilitychange',onVisibility);
 win.addEventListener('pagehide',onPageHide);
 win.addEventListener('blur',onBlur);
 timer=win.setInterval(tick,CLOCK_SLICE*1000);
 return {
  stop(){if(stopped)return;stopped=true;halt();if(timer!==null)win.clearInterval(timer);
   for(const type of INPUTS)doc.removeEventListener(type,onInput,cap);
   doc.removeEventListener('visibilitychange',onVisibility);win.removeEventListener('pagehide',onPageHide);win.removeEventListener('blur',onBlur);},
  read(){return readClock(storage,playerId);},
 };
}
