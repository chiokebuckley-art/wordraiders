import {LESSONS} from './content.js?v=belt-2';
import {accepts,firstWrong,hintFor,shuffled,trayOrder,roundItems} from './engine.js?v=belt-1';

// Sentence Belt (inside WordRaiders): put a paragraph's sentences in order on the belt, run the line, then show what
// the paragraph means. A paragraph passes only when the order is accepted AND the meaning answer is right the first
// time; anything missed goes on the repair list. Progress is kept per WordRaiders player (wr-belt.<player id>).
const app=document.querySelector('#app');
const REGISTRY='wordraiders.players.v1',ROUND=3,XP=10;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const calm=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const byId=Object.fromEntries(LESSONS.flatMap(l=>l.items.map(it=>[it.id,{item:it,lesson:l}])));
const ICON={topic:'🎯',details:'🧩',order:'🪜',conclusion:'🎀'};

// ---------------------------------------------------------------- player and progress
function player(){try{const r=JSON.parse(localStorage.getItem(REGISTRY)||'null');const p=r?.profiles?.find(x=>x&&x.id===r.active);return p?{id:p.id,name:p.name}:null;}catch{return null;}}
const me=player(),KEY=`wr-belt.${me?me.id:'guest'}`;
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return {v:1,passed:x?.passed&&typeof x.passed==='object'?x.passed:{},repair:Array.isArray(x?.repair)?x.repair.filter(id=>byId[id]):[]};}catch{return {v:1,passed:{},repair:[]};}}
let prog=load();
function persist(){try{localStorage.setItem(KEY,JSON.stringify(prog));}catch{announce('Saving is unavailable in this browser.');}}
function addXp(n){if(!me)return;try{const k=`wordraiders.save.${me.id}`,raw=JSON.parse(localStorage.getItem(k)||'null');if(!raw||typeof raw!=='object')return;raw.xp=(Number(raw.xp)||0)+n;raw.savedAt=Date.now();localStorage.setItem(k,JSON.stringify(raw));}catch{}}
let announceTimer=0;function announce(s){const el=document.querySelector('#status');el.textContent=s;clearTimeout(announceTimer);if(s)announceTimer=setTimeout(()=>{if(el.textContent===s)el.textContent='';},3500);}

// The voice chosen in WordRaiders Settings, else the best English voice (Premium/Enhanced first, from the voice id).
function voice(){try{const all=speechSynthesis.getVoices().filter(v=>/^en/i.test(v.lang));let name='';try{name=me?JSON.parse(localStorage.getItem(`wordraiders.save.${me.id}`)||'{}')?.settings?.voice||'':'';}catch{}
 const q=v=>{const t=v.name+' '+(v.voiceURI||'');return /premium/i.test(t)?8:/enhanced|natural|neural|online/i.test(t)?6:/compact/i.test(t)?-4:0;};
 return all.filter(v=>v.name===name).sort((a,b)=>q(b)-q(a))[0]||all.sort((a,b)=>q(b)-q(a))[0]||null;}catch{return null;}}
function say(t){if(!('speechSynthesis'in window)){announce('Read-aloud is not available here.');return;}speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);const v=voice();u.lang=v?.lang||'en-US';if(v)u.voice=v;u.rate=.9;speechSynthesis.speak(u);}

// ---------------------------------------------------------------- state
const params=new URLSearchParams(location.search);
let S=null;// the current round: {lesson, items, i, tray, placed, stage, missed, note, choices, picked, firstPass}
function startRound(lessonId,repair=false){
 const lesson=LESSONS.find(l=>l.id===lessonId)||LESSONS[0];
 const items=repair?prog.repair.slice(0,ROUND).map(id=>byId[id].item):roundItems(lesson.items,prog.passed,ROUND);
 S={lesson,repair,items,i:0,passes:0};openItem();
}
function openItem(){const it=S.items[S.i];S.lessonOf=byId[it.id].lesson;S.tray=trayOrder(it);S.placed=[];S.stage='build';S.missed=false;S.note=null;S.choices=shuffled(it.choices.map((c,k)=>({c,ok:k===it.answer})));S.picked=[];render();}

// ---------------------------------------------------------------- screens
function bar(title,right=''){return `<div class="bar"><a href="../?journey" aria-label="Back to WordRaiders">← WordRaiders</a><span class="title">${title}</span><span class="count">${right}</span></div>`;}
function picker(){
 const nextLesson=LESSONS.find(l=>l.items.some(it=>!prog.passed[it.id]));
 app.innerHTML=bar('Sentence Belt')+`<main><p class="eyebrow">BUILD A PARAGRAPH</p><h1>Put the sentences in order, then show what it means.</h1>
 <div class="lessons">${prog.repair.length?`<button class="lesson repair-card" data-act="repair"><span class="ico">🔧</span><span><b>Repair list</b><small>${prog.repair.length} paragraph${prog.repair.length>1?'s':''} to fix</small></span><span class="go">Fix ▸</span></button>`:''}
 ${LESSONS.map(l=>{const done=l.items.filter(it=>prog.passed[it.id]).length,all=done===l.items.length;return `<button class="lesson ${l===nextLesson?'next':''} ${all?'done':''}" data-act="lesson" data-id="${l.id}"><span class="ico">${ICON[l.id]||'🏭'}</span><span><b>${esc(l.title)}</b><small>${done} / ${l.items.length} built</small></span><span class="go">${all?'Practice':'Build'} ▸</span></button>`;}).join('')}</div></main>`;
}
function render(){
 if(!S){picker();return;}
 const it=S.items[S.i],n=it.parts.length,title=`${ICON[S.lessonOf.id]||''} ${esc(S.lessonOf.title)}`;
 const count=`${S.i+1} / ${S.items.length}`;
 if(S.stage==='done')return roundDone();
 const slots=Array.from({length:n},(_,k)=>{const p=S.placed[k];const locked=S.stage!=='build';
  return `<div class="slot ${p!==undefined?'filled':''} ${p===undefined&&k===S.placed.length?'next':''}"><span class="n">${String(k+1).padStart(2,'0')}</span>${p!==undefined?`<button class="tile ${locked?'locked':''}" data-act="unplace" data-slot="${k}" data-part="${p}" ${locked?'disabled':''} aria-label="Slot ${k+1}: ${esc(it.parts[p])}. Tap to send it back to the tray.">${esc(it.parts[p])}</button>`:''}</div>`;}).join('');
 const left=S.tray.filter(p=>!S.placed.includes(p));
 let body=`<div class="order"><p class="eyebrow">BUILD ORDER</p><p>${esc(S.lessonOf.job)}</p></div>
 <div class="belt ${S.running?'running':''}" aria-label="The belt">${slots}</div>`;
 if(S.stage==='build'){
  body+=`${left.length?`<div class="tray"><p class="tray-label">PARTS TRAY · TAP TO PLACE</p>${left.map(p=>`<button class="tile" data-act="place" data-part="${p}">${esc(it.parts[p])}</button>`).join('')}</div>`:''}
  ${S.note?`<p class="note ${S.note.kind}" role="status">${esc(S.note.text)}</p>`:''}
  <div class="controls"><button class="btn" data-act="undo" ${S.placed.length?'':'disabled'}>↶ Undo</button><button class="btn" data-act="clear" ${S.placed.length?'':'disabled'}>Clear</button><button class="btn" data-act="hint">💡 Hint</button>
  <button class="run" data-act="run" ${S.placed.length===n?'':'disabled'}>RUN THE LINE ▸</button></div>`;
 }else if(S.stage==='check'){
  body+=`<section class="check" aria-labelledby="q"><p class="eyebrow" style="color:var(--violet)">NOW SHOW WHAT IT MEANS</p><h2 id="q">${esc(it.question)} <button class="btn" data-act="say" aria-label="Read the paragraph and question aloud">🔊</button></h2>
  <div class="choices">${S.choices.map((c,k)=>{const picked=S.picked.includes(k);return `<button class="choice ${picked?(c.ok?'right':'no'):''}" data-act="choose" data-k="${k}" ${picked||S.picked.some(j=>S.choices[j].ok)?'disabled':''}>${esc(c.c)}</button>`;}).join('')}</div>
  ${S.picked.length&&!S.choices[S.picked.at(-1)].ok?`<p class="note miss" role="status">Not quite. Read the paragraph again and try another answer.</p>`:''}</section>`;
 }else if(S.stage==='pass'){
  const clean=!S.missed;
  body+=`<section class="pass" role="status"><div class="burst">${clean?'⚙️✨':'🔧'}</div><h2>${clean?'Paragraph built!':'Fixed it!'}</h2><p class="why">${esc(it.why)}</p>
  <p class="muted">${clean?`+${XP} XP`:'This one goes on your repair list to build again later.'}</p>
  <div class="actions"><button class="primary" data-act="next">${S.i+1<S.items.length?'Next paragraph ▸':'Finish ▸'}</button></div></section>`;
 }
 app.innerHTML=bar(title,count)+`<main>${body}</main>`;
}
function roundDone(){
 const left=S.lessonOf?S.lessonOf.items.filter(it=>!prog.passed[it.id]).length:0;
 app.innerHTML=bar('Sentence Belt')+`<main><section class="pass"><div class="burst">🏭</div><h1>Line complete!</h1><p class="muted">${S.passes} of ${S.items.length} built on the first try.${prog.repair.length?` ${prog.repair.length} on your repair list.`:''}</p>
 <div class="actions"><a class="primary" href="../?journey">Back to Home ▸</a>${S.repair?(prog.repair.length?`<button data-act="repair">Fix more</button>`:''):`<button data-act="lesson" data-id="${S.lesson.id}">${left?'Build 3 more':'Practice 3 more'}</button>`}<button data-act="menu">All belts</button></div></section></main>`;
}

// ---------------------------------------------------------------- motion: a tile slides from where it was to where it lands
function slide(part,from){if(calm()||!from)return;const el=app.querySelector(`.tile[data-part="${part}"]`);if(!el)return;const to=el.getBoundingClientRect();
 el.animate([{transform:`translate(${from.left-to.left}px,${from.top-to.top}px)`},{transform:'none'}],{duration:300,easing:'cubic-bezier(.2,.8,.2,1)'});}
const rectOf=part=>app.querySelector(`.tile[data-part="${part}"]`)?.getBoundingClientRect();

// ---------------------------------------------------------------- actions
function missItem(it){if(!S.missed){S.missed=true;if(!prog.repair.includes(it.id))prog.repair.push(it.id);persist();}}
app.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;const act=b.dataset.act;
 if(act==='lesson'){startRound(b.dataset.id);scrollTo(0,0);return;}
 if(act==='repair'){startRound(prog.repair[0]?byId[prog.repair[0]].lesson.id:LESSONS[0].id,true);scrollTo(0,0);return;}
 if(act==='menu'){S=null;render();scrollTo(0,0);return;}
 const it=S.items[S.i];
 if(act==='place'){const p=Number(b.dataset.part),from=rectOf(p);S.placed.push(p);S.note=null;render();slide(p,from);return;}
 if(act==='unplace'){const k=Number(b.dataset.slot),p=S.placed[k],from=rectOf(p);S.placed.splice(k,1);S.note=null;render();slide(p,from);return;}
 if(act==='undo'){const p=S.placed.pop(),from=rectOf(p);S.note=null;render();slide(p,from);return;}
 if(act==='clear'){S.placed=[];S.note=null;render();return;}
 if(act==='hint'){const k=S.placed.length?Math.max(0,firstWrong(it,S.placed)):0;S.note={kind:'hint',text:hintFor(it,S.lessonOf.id,k===-1?0:k)};render();return;}
 if(act==='say'){say(it.parts.join(' ')+' '+it.question+' '+S.choices.map(c=>c.c).join('. '));return;}
 if(act==='run'){S.running=true;render();const ok=accepts(it,S.placed);
  setTimeout(()=>{S.running=false;
   if(ok){S.stage='check';S.note=null;render();announce('The line runs! Now show what it means.');}
   else{missItem(it);const k=firstWrong(it,S.placed);S.note={kind:'miss',text:'Not yet. '+hintFor(it,S.lessonOf.id,k)};render();
    const el=app.querySelectorAll('.belt .tile')[k];if(el&&!calm())el.classList.add('wrong');}
  },calm()?0:600);return;}
 if(act==='choose'){const k=Number(b.dataset.k),c=S.choices[k];S.picked.push(k);
  if(c.ok){const clean=!S.missed;if(clean){if(!prog.passed[it.id]){prog.passed[it.id]=Date.now();addXp(XP);}prog.repair=prog.repair.filter(id=>id!==it.id);S.passes++;persist();}
   render();setTimeout(()=>{S.stage='pass';render();scrollTo(0,0);},calm()?0:500);}
  else{missItem(it);render();}return;}
 if(act==='next'){if(S.i+1<S.items.length){S.i++;openItem();}else{S.stage='done';render();}scrollTo(0,0);return;}
});

// Start: ?lesson=topic|details|order|conclusion opens that belt straight away (from the Paragraph Power lessons).
const start=params.get('lesson');
if(start&&LESSONS.some(l=>l.id===start))startRound(start);else render();
