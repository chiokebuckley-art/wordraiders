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
