// Project-owned writing and visual planning. No server or image API.
export const newId=()=>crypto.randomUUID();
export const sizes=['WS','MS','CU','ECU'];
export const angles=['Eye level','High','Low'];
export const perspectives=['Objective','OTS','POV','Insert'];
export const moves=['Static','Push in','Track'];
export const tactics=['Ask','Charm','Stall','Accuse','Bargain','Deflect','Silence'];
export function frame(sceneId,shotSize='WS'){return {id:newId(),sceneId,shotSize,angle:'Eye level',perspective:'Objective',move:'Static',duration:3,transition:'Cut',imageRef:'',caption:'',dialogueBeat:'',characterId:'',aiPrompt:''};}
export function migrateProject(p){
 p.characters??=[];p.coachNotes??={};p.storyDraft??='';p.storyVersions??=[];p.noteClips??=[];p.cameraProgress??={};
 for(const s of p.scenes){s.id??=newId();s.frames??=[];s.beats??=[];s.sourceNotes??=[];}
 return p;
}
const strings=(obj,keys)=>keys.every(k=>typeof obj[k]==='string');
export function validateStudio(p){
 migrateProject(p);
 if(!Array.isArray(p.characters)||!p.characters.every(c=>strings(c,['id','name','want','lexicon','rhythm','taboo','silhouette'])))throw Error('Invalid character roster.');
 if(typeof p.storyDraft!=='string'||!Array.isArray(p.noteClips)||!p.noteClips.every(n=>strings(n,['id','source','label','text']))||!Array.isArray(p.storyVersions)||!p.storyVersions.every(v=>strings(v,['text','date']))||!p.coachNotes||typeof p.coachNotes!=='object'||Array.isArray(p.coachNotes)||Object.values(p.coachNotes).some(v=>typeof v!=='string'))throw Error('Invalid story notes.');
 if(!p.cameraProgress||typeof p.cameraProgress!=='object'||Array.isArray(p.cameraProgress)||Object.values(p.cameraProgress).some(v=>typeof v!=='boolean'))throw Error('Invalid camera progress.');
 const ids=new Set();
 for(const s of p.scenes){if(ids.has(s.id))throw Error('Duplicate scene identifier.');ids.add(s.id);
 if(!Array.isArray(s.sourceNotes)||!s.sourceNotes.every(n=>strings(n,['source','text']))||!Array.isArray(s.beats)||!s.beats.every(b=>strings(b,['id','characterId','want','tactic','subtext','original','rewrite','silentAction'])))throw Error('Invalid scene notes or dialogue.');
 if(!Array.isArray(s.frames)||s.frames.length>100||!s.frames.every(f=>strings(f,['id','sceneId','shotSize','angle','perspective','move','transition','imageRef','caption','dialogueBeat','characterId','aiPrompt'])&&f.sceneId===s.id&&sizes.includes(f.shotSize)&&angles.includes(f.angle)&&perspectives.includes(f.perspective)&&moves.includes(f.move)&&Number.isFinite(f.duration)&&f.duration>=1&&f.duration<=120&&(!f.imageRef||/^assets\/[a-z0-9-]+\.svg$/.test(f.imageRef)||/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(f.imageRef))))throw Error('Invalid storyboard frame.');
 }
 return p;
}
export function seedFrames(s){if(s.frames.length)return false;s.frames=['WS','MS','CU'].map(size=>frame(s.id,size));return true;}
export function collectNotes(p,lessons,drills={},drillNames=[]){return [...lessons.filter(l=>p.fields[l.field]?.trim()).map(l=>({source:'mission:'+l.field,label:`Mission ${l.id+1}: ${l.title}`,text:p.fields[l.field]})),...Object.entries(p.coachNotes).filter(([,t])=>t.trim()).map(([key,text])=>({source:'coach:'+key,label:'Coach: '+key,text})),...Object.entries(drills).filter(([,d])=>d.text?.trim()).map(([key,d])=>({source:'drill:'+key,label:'Practice: '+(drillNames[key]?.name||key),text:d.text}))];}
export function clipNote(p,n){const clip={id:newId(),...n};p.noteClips.push(clip);return clip;}
export function appendDraft(p,text){if(!text.trim())return;p.storyVersions.push({date:new Date().toISOString(),text:p.storyDraft});p.storyDraft=[p.storyDraft.trim(),text.trim()].filter(Boolean).join('\n\n');}
export function useInScene(scene,text,source,target='notes'){scene.sourceNotes.push({source,text});if(target==='action')scene.action=[scene.action.trim(),text.trim()].filter(Boolean).join('\n\n');}
const cell=v=>String(v??'').replace(/\|/g,'\\|').replace(/\r?\n/g,'<br>');
export function shotList(p){return `# ${p.title} — Shot list\n\n| Scene | Frame | Size | Angle | Perspective | Move | Seconds | Transition | Image | Action | Line |\n|---|---|---|---|---|---|---|---|---|---|---|\n`+p.scenes.flatMap((s,i)=>s.frames.map((f,j)=>`| ${cell(s.heading||i+1)} | ${j+1} | ${f.shotSize} | ${f.angle} | ${f.perspective} | ${f.move} | ${f.duration} | ${cell(f.transition)} | ${f.imageRef.startsWith('data:')?'Local image (in backup)':cell(f.imageRef)} | ${cell(f.caption)} | ${cell(f.dialogueBeat)} |`)).join('\n');}
export function promptSheet(p){return `# ${p.title} — Image prompts\n\n`+p.scenes.flatMap((s,i)=>s.frames.map((f,j)=>`## Scene ${i+1}, frame ${j+1}\n${f.aiPrompt||`${f.shotSize}, ${f.angle}, ${f.perspective}. ${f.caption}`}\n`)).join('\n');}
export function studioReport(p){return '\n\n## Story draft\n'+p.storyDraft+'\n\n## Collected notes\n'+p.noteClips.map(n=>`### ${n.label}\n${n.text}`).join('\n\n')+'\n\n## Coach answers\n'+Object.entries(p.coachNotes).map(([k,v])=>`### ${k}\n${v}`).join('\n\n')+'\n\n'+shotList(p);}

// The production board reads the original mission fields; it never copies them into notes.
export const productionGroups=[
 {title:'The slate',fields:[['sparks','Idea cards'],['logline','Logline'],['scope','Call-sheet promise'],['feeling','Tone'],['pitch','Pitch']]},
 {title:'The character',fields:[['character','Who they are'],['wantNeed','Want / need']]},
 {title:'The story spine',fields:[['obstacle','Obstacle'],['stakes','Stakes'],['causality','Because / therefore / but'],['spine','Five story beats'],['attempts','Costlier attempts'],['ending','Choice / after'],['theme','The choice tests this question']]},
 {title:'The scene strip',fields:[['silentScene','Visible action'],['imageSound','Object / sound motif'],['information','What we know'],['scenePlan','Scene turns'],['dialogue','Dialogue'],['treatment','Ordered story pass'],['draftNotes','Draft observations']]},
 {title:'The editing bay',fields:[['diagnosis','Pin the weak scene'],['readNotes','Table-read notes'],['revision','Before / after revision']]}
];
export function productionSlots(p){return productionGroups.map(g=>({...g,fields:g.fields.map(([key,label])=>({key,label,text:p.fields[key]||''}))}));}
export function fiveBeats(text=''){
 const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
 return lines.length===5?{beats:['Before','Disruption','Attempts','Choice','After'].map((label,i)=>({label,text:lines[i]})),raw:''}:{beats:[],raw:text};
}
export function labeledParts(text='',labels=[]){
 const entries=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const found=labels.map(label=>({label,text:entries.find(x=>x.toLowerCase().startsWith(label.toLowerCase()+':'))||''}));
 return found.every(x=>x.text)?found:null;
}
export function livingPageText(p){
 return `${p.title}\n\n`+productionSlots(p).map(g=>g.title+'\n'+g.fields.map(f=>f.label+'\n'+(f.text||'(not written yet)')).join('\n\n')).join('\n\n')+'\n\nScenes\n'+p.scenes.map((s,i)=>`Scene ${i+1}: ${s.heading}\n${s.action}\n${s.dialogue}\n${s.frames.map((f,j)=>`Frame ${j+1}: ${f.shotSize} · ${f.angle}\n${f.caption}`).join('\n')}`).join('\n\n');
}
export const currentScene=p=>p.scenes.find(s=>s.id===p.activeSceneId)||p.scenes[0];
function ownedWrite(object,key,value,source,allowEmpty=true){
 object.missionLinks??={};const prior=object.missionLinks[key];
 if((prior?.source===source&&object[key]===prior.text)||(!prior&&allowEmpty&&!object[key])){object[key]=value;object.missionLinks[key]={source,text:value};return true;}return false;
}
export function missionFrame(p,create=false){
 migrateProject(p);let s=p.scenes.find(s=>s.id===p.pictureSceneId)||currentScene(p);
 let f=s.frames.find(f=>f.missionField==='silentScene');
 if(!f&&create){f=frame(s.id);f.missionField='silentScene';s.frames.push(f);p.pictureSceneId=s.id;}
 return {scene:s,frame:f};
}
export function landMissionField(p,key){
 migrateProject(p);const text=p.fields[key]||'';
 if(key==='silentScene'){
  const {scene:s,frame:f}=missionFrame(p,!!text.trim());if(!f)return;
  // Only adopt the original blank starter. Ownership permits later mission edits,
  // but a manual edit breaks the equality check and is never silently replaced.
  const blank=p.scenes.length===1&&!s.heading&&!s.action;
  ownedWrite(s,'action',text,'silentScene',blank);
  ownedWrite(f,'caption',text,'silentScene');
 }
 if(key==='scenePlan'&&text.trim()){
  const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,100);
  lines.forEach((line,i)=>{
   let s=p.scenes.find(s=>s.missionPlanIndex===i);
   if(!s){const candidate=i===0?p.scenes[0]:null;
    if(candidate&&(!candidate.heading&&!candidate.action||candidate.missionLinks?.action?.source==='silentScene'))s=candidate;
    else {s={id:newId(),heading:'',action:'',dialogue:'',turn:'',frames:[],beats:[],sourceNotes:[]};p.scenes.push(s);}
    s.missionPlanIndex=i;
   }
   s.plan=line;
   // Only promote an explicit place label; never guess a location from story prose.
   const explicit=line.match(/(?:^|\s)((?:INT\.?|EXT\.?|INT\.?\/EXT\.?)\s+[^|/\n]+)(?:\||\/|$)/i);
   const place=line.match(/^(?:scene\s*\d+\s*[:.\-]\s*)?([^:|/]+)\s*[:|/]\s*/i);
   const heading=explicit?.[1]?.trim()||place?.[1]?.trim();
   if(heading&&!/^(purpose|tactic|resistance|turn|new situation)$/i.test(heading))ownedWrite(s,'heading',heading,'scenePlan');
   const turn=line.match(/(?:^|[|/])\s*turn\s*:\s*([^|/]+)/i);if(turn)ownedWrite(s,'turn',turn[1].trim(),'scenePlan');
   let f=s.frames.find(f=>f.missionField==='scenePlan');
   if(!f&&!s.frames.length){f=frame(s.id);f.missionField='scenePlan';s.frames.push(f);}
   if(f)ownedWrite(f,'caption',line,'scenePlan');
  });
 }
 if(key==='imageSound'){const {frame:f}=missionFrame(p,!!p.fields.silentScene?.trim());if(f)f.motif=text;}
 if(key==='information')currentScene(p).information=text;
 if(key==='dialogue'&&text.trim()){
  const s=p.scenes.find(s=>s.id===p.dialogueSceneId)||p.scenes.find(s=>s.missionPlanIndex===0)||currentScene(p);p.dialogueSceneId=s.id;
  ownedWrite(s,'dialogue',text,'dialogue');s.dialogueSuggestion=text;
 }
 if(key==='diagnosis'||key==='revision'){
  const n=text.match(/\bscene\s+(\d+)\b/i);const s=n&&p.scenes[Number(n[1])-1]||currentScene(p);s[key]=text;
 }
}
export function applyExistingMissionFields(p){for(const key of ['silentScene','scenePlan','imageSound','information','dialogue','diagnosis','revision'])if(p.fields[key])landMissionField(p,key);}
