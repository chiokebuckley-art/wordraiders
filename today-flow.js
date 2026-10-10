// Today flow: one list to go down. Builds Home's TODAY rows (word box, Journey, Word Quest, Spelling Quest,
// Daily Raid), notices when one of them gets done, and offers "Next task ▸" or "Back to Home".
// The app calls in through three hooks it looks for: __wrTodayItems (Home render), __wrTick (every save
// change, old and new player) and __wrK (its helpers). If this file fails, Home falls back to its old list.
(function(){
 var BASE='wr-today-base',SHOWN='wr-today-shown',NEXT='wr-today-next';
 function get(k,d){try{var v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}}
 function put(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
 function sum2(stars){var n=0;for(var k in stars||{})n+=Math.min(2,stars[k]||0);return n}
 function questPoints(e){return sum2(e.quest&&e.quest.stars)}
 function spellPoints(e){var s=e.spelling;return s?sum2(s.stars):0}  // meeting Echo is not a task done

 // Points at the start of the day, per player: today's quest rows tick once these go up.
 function base(e,day,from){
  var all=get(BASE,{}),b=all[e.name];
  if(!b||b.day!==day){from=from||e;b={day:day,q:questPoints(from),s:spellPoints(from)};all[e.name]=b;put(BASE,all)}
  return b;
 }

 function spellNext(e,K){
  var s=e.spelling,ch=K.ey();
  if(!s||!s.intro)return{label:'Spelling Quest · meet Echo',done:false};
  if(s.chapter>=ch.length)return{label:'Spelling Quest · every boss beaten',done:true};
  var c=ch[s.chapter],open=c.crystals.some(function(id){return(s.stars[id]||0)<1});
  return{label:open?'Spelling Quest · '+c.name:'Spelling Quest · Boss: '+c.boss.name,done:false};
 }

 // Sound Code (a standalone page): today's decoding session, read from its own per-player save.
 function soundRow(now){
  var id=null;try{var r=JSON.parse(localStorage.getItem('wordraiders.players.v1')||'null');id=r&&r.active}catch(e){}
  if(!id)return null;
  var s=get('wr-soundcode.'+id,null),d=new Date(now),day=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  if(!s||!s.placed)return{key:'sound',label:'Sound Code · find your starting point',done:false,later:false,meta:'5 min'};
  var m=s.mods&&s.mods[s.module]||{},lab=m.state==='checkA'||m.state==='checkB'?'Sound Code · mastery check':'Sound Code · module '+s.module;
  return{key:'sound',label:lab,done:!!(s.days&&s.days[day]&&s.days[day].done),later:false,meta:'7 min'};
 }

 // The rows without their buttons: also used to spot a row going from not done to done.
 function rows(e,now,K,jr,jtitle,from){
  var day=K.Sy(now),b=base(e,day,from),box=K.tL(e,now),raidDone=e.quest.raidDay===day,raidReady=K.Ry(e,now).length>0;
  var q=K.Oy(e),vm=K.vm(),u=K.$u(),out=[];
  out.push({key:'box',label:box.due?'Study '+box.due+' word'+(box.due>1?'s':'')+' in the box':'Word box is clear',done:box.due===0,later:false,meta:box.due?'~'+Math.max(1,Math.ceil(box.due*.6))+' min':'done'});
  if(jr){var s=get('wr-today-session',null);out.push({key:'journey',label:jtitle,done:!!s&&s.day===day&&s.name===e.name,later:false,meta:'5 min'})}
  var ql=q.kind==='learn'?'Word Quest · '+u[q.id].form:q.kind==='boss'?'Word Quest · Boss: '+vm[q.chapter].boss.name:'Word Quest · every boss beaten';
  var qd=questPoints(e)>b.q;out.push({key:'quest',label:qd&&q.kind!=='done'?'Word Quest · done for today':ql,done:q.kind==='done'||qd,later:false,meta:'3 min'});
  var sp=spellNext(e,K);
  var sd=spellPoints(e)>b.s;out.push({key:'spell',label:sd&&!sp.done?'Spelling Quest · done for today':sp.label,done:sp.done||sd,later:false,meta:'3 min'});
  var sc=soundRow(now);if(sc)out.push(sc);
  out.push({key:'picture',label:'Picture Thinking',done:K.ptDone?K.ptDone(e.pictureThinking,now):false,later:false,meta:'3 min'});
  out.push({key:'raid',label:raidReady||raidDone?'Daily Raid':'Daily Raid · after your first boss',done:raidDone,later:!raidDone&&!raidReady,meta:raidDone?'done':raidReady?'4 min':'later'});
  return out;
 }

 var last={jr:false,jtitle:''};
 window.__wrTodayItems=function(a){
  var K=window.__wrK;if(!K)return null;
  var jr=!!a.jr;last={jr:jr,jtitle:a.journey.title};
  var list=rows(a.player,a.now,K,jr,a.journey.title);
  var go={sound:function(){location.href='./sound-code/?today=1'},box:a.onBox,journey:a.journey.go,quest:a.onQuest,spell:a.onSpell,picture:a.onPicture,raid:a.onRaid};
  list.forEach(function(r){r.go=go[r.key]});
  var nxt=null;try{nxt=sessionStorage.getItem(NEXT)}catch(e){}
  if(nxt){try{sessionStorage.removeItem(NEXT)}catch(e){}
   var first=list.find(function(r){return!r.done&&!r.later});
   if(first&&first.go)setTimeout(first.go,150);
  }
  return list;
 };

 window.__wrTick=function(prev,next){
  var K=window.__wrK;if(!K||!prev||!next||prev.name!==next.name||!next.quest)return;
  var now=Date.now(),day=K.Sy(now);base(next,day,prev);
  var before=rows(prev,now,K,last.jr,last.jtitle),after=rows(next,now,K,last.jr,last.jtitle);
  var flipped=after.find(function(r,i){return r.key!=='journey'&&r.done&&before[i]&&before[i].key===r.key&&!before[i].done});
  if(!flipped)return;
  var shown=get(SHOWN,{});if(shown.day!==day||shown.name!==next.name)shown={day:day,name:next.name,keys:[]};
  if(shown.keys.indexOf(flipped.key)>=0)return;
  shown.keys.push(flipped.key);put(SHOWN,shown);
  var up=after.find(function(r){return!r.done&&!r.later});
  whenResting(function(){sheet(flipped,up)});
 };

 // Wait until the lesson is over (the tab bar is back and no how-to is running) so the card never covers the lesson's own buttons.
 function whenResting(fn){var t0=Date.now();(function check(){if(document.querySelector('nav.sl-tabs')&&!document.getElementById('wr-howto')){setTimeout(fn,700);return}if(Date.now()-t0<15*60*1000)setTimeout(check,600)})()}
 function goHome(){
  try{if(location.hash==='#/home')history.replaceState(null,'',location.pathname+location.search+'#/');location.hash='#/home'}
  catch(e){location.href='./#/home'}
 }
 var NAMES={sound:'Sound Code',picture:'Picture Thinking',box:'Word box',quest:'Word Quest',spell:'Spelling Quest',raid:'Daily Raid',journey:'Journey'};
 function sheet(done,up){
  var old=document.getElementById('wr-today-sheet');if(old)old.remove();
  var el=document.createElement('div');el.id='wr-today-sheet';el.setAttribute('role','dialog');el.setAttribute('aria-label','Task done');
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  el.innerHTML='<div class="wts-card"><button class="wts-x" aria-label="Keep going here">×</button>'+
   '<p class="wts-done">✓ '+esc(NAMES[done.key]||'Task')+' done for today!</p>'+
   (up?'<p class="wts-up">Next: <b>'+esc(up.label)+'</b></p>':'<p class="wts-up">🎉 That’s everything on today’s list!</p>')+
   '<div class="wts-row">'+(up?'<button class="wts-next">Next task ▸</button>':'')+'<button class="wts-home">Back to Home</button></div></div>';
  document.body.appendChild(el);
  el.querySelector('.wts-x').onclick=function(){el.remove()};
  el.querySelector('.wts-home').onclick=function(){el.remove();goHome()};
  var n=el.querySelector('.wts-next');if(n)n.onclick=function(){el.remove();try{sessionStorage.setItem(NEXT,'1')}catch(e){}goHome()};
  (n||el.querySelector('.wts-home')).focus();
 }

 var css='#wr-today-sheet{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;justify-content:center;padding:0 12px calc(12px + env(safe-area-inset-bottom,0px));pointer-events:none}'+
  '#wr-today-sheet .wts-card{pointer-events:auto;position:relative;width:min(560px,100%);background:#132a40;color:#f4f7fb;border:2px solid #bfff73;border-radius:20px;padding:16px 16px 14px;box-shadow:0 -8px 30px #0009;font-family:Andika,Arial,sans-serif;animation:wts-in .25s ease-out}'+
  '#wr-today-sheet .wts-done{margin:0 28px 4px 0;font-weight:900;font-size:20px;color:#bfff73}'+
  '#wr-today-sheet .wts-up{margin:0 0 12px;font-size:16px;color:#d6e2ef}'+
  '#wr-today-sheet .wts-row{display:flex;gap:10px;flex-wrap:wrap}'+
  '#wr-today-sheet button{font:inherit;cursor:pointer;touch-action:manipulation}'+
  '#wr-today-sheet .wts-next,#wr-today-sheet .wts-home{flex:1 1 160px;min-height:52px;border-radius:14px;font-weight:900;font-size:17px;border:1px solid #2b4966;background:#1a3654;color:#f4f7fb}'+
  '#wr-today-sheet .wts-next{background:#bfff73;color:#13230a;border-color:#bfff73}'+
  '#wr-today-sheet .wts-x{position:absolute;top:6px;right:6px;width:44px;height:44px;border:0;background:none;color:#b8c7da;font-size:26px}'+
  '@keyframes wts-in{from{transform:translateY(30px);opacity:0}}@media (prefers-reduced-motion:reduce){#wr-today-sheet .wts-card{animation:none}}';
 var st=document.createElement('style');st.id='wr-today-flow';st.textContent=css;(document.head||document.documentElement).appendChild(st);

 // ?today=next (from a page outside the app, like the Small Common Words academy): start the next task.
 try{var q=new URLSearchParams(location.search);if(q.get('today')==='next'){sessionStorage.setItem(NEXT,'1');q.delete('today');var rest=q.toString();history.replaceState(null,'',location.pathname+(rest?'?'+rest:'')+(location.hash||'#/home'))}}catch(e){}
})();

