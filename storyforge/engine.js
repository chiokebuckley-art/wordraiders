import {migrateProject,validateStudio} from './studio-model.js';
import {lessons,reviewItems} from './curriculum.js';
export const STORAGE_KEY='storyforge.v1';
export const uid=()=>globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const blankScene=()=>({id:uid(),heading:'',action:'',dialogue:'',turn:'',frames:[],beats:[],sourceNotes:[]});
export const blankProject=(title='My first short')=>migrateProject({id:uid(),title,fields:{},scenes:[blankScene()],snapshots:[],review:{},reviewedAt:null,updated:Date.now()});
export const blankProfile=(name='Writer')=>({id:uid(),name,progress:{},drills:{},arcade:{best:{},seen:[]},projects:[blankProject()],project:0});
export const initialState=()=>({version:2,active:0,profiles:[blankProfile()]});
export const countWords=t=>(t?.trim().match(/\S+/g)||[]).length;
export const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};
export function lessonReady(lesson,progress,project){return lesson.questions.every((_,i)=>progress?.answers?.[i]===true)&&countWords(project.fields[lesson.field])>=8&&lesson.checks.every((_,i)=>progress?.checks?.[i]===true)&&(lesson.id!==19||hasDraft(project))&&(lesson.id!==23||reviewReady(project));}
export const hasDraft=p=>p.scenes.length>0&&p.scenes.every(s=>s.heading.trim()&&s.action.trim())&&p.scenes.some(s=>s.action.trim().length>0);
export const reviewReady=p=>hasDraft(p)&&p.snapshots.length>0&&['readNotes','revision','pitch'].every(k=>countWords(p.fields[k])>=8)&&reviewItems.every(([k])=>countWords(p.review[k])>=6);
export function fountain(p,author=''){
 return `Title: ${p.title.replace(/[\r\n]/g,' ')}\nCredit: Written by\nAuthor: ${author.replace(/[\r\n]/g,' ')}\n\n`+p.scenes.map(s=>`${s.heading.trim().toUpperCase()}\n\n${s.action.trim()}${s.dialogue.trim()?'\n\n'+s.dialogue.trim():''}`).join('\n\n')+'\n';
}
export function projectReport(p,author=''){
 return `# ${p.title}\nBy ${author}\n\n`+lessons.map(l=>`## ${l.title}\n${p.fields[l.field]||'(not written yet)'}\n`).join('\n')+'\n## Screening review\n'+reviewItems.map(([k,t])=>`### ${t}\n${p.review[k]||'(not reviewed yet)'}\n`).join('\n')+'\n## Screenplay\n\n'+fountain(p,author);
}
export function validateState(s){
 if(!s||![1,2].includes(s.version)||!Array.isArray(s.profiles)||!s.profiles.length||s.profiles.length>100||!Number.isInteger(s.active)||s.active<0||s.active>=s.profiles.length)throw Error('This is not a valid StoryForge backup.');
 for(const p of s.profiles){
  if(typeof p.name!=='string'||!Array.isArray(p.projects)||!p.projects.length||!Number.isInteger(p.project)||p.project<0||p.project>=p.projects.length||!p.progress||!p.drills||!p.arcade?.best||!Array.isArray(p.arcade.seen))throw Error('The backup has an incomplete writer profile.');
  for(const [key,v] of Object.entries(p.progress)){if(!/^\d+$/.test(key)||Number(key)>=lessons.length||!v||!Array.isArray(v.answers)||!Array.isArray(v.checks)||v.answers.some(x=>typeof x!=='boolean'&&x!==null)||v.checks.some(x=>typeof x!=='boolean'&&x!==null))throw Error('The backup has invalid learning progress.');}
  for(const d of Object.values(p.drills)){if(!d||typeof d.text!=='string'||!Array.isArray(d.checks))throw Error('The backup has an invalid drill.');}
  for(const j of p.projects){validateStudio(j);if(typeof j.title!=='string'||!j.fields||typeof j.fields!=='object'||Array.isArray(j.fields)||Object.values(j.fields).some(x=>typeof x!=='string')||!Array.isArray(j.scenes)||!j.scenes.length||j.scenes.length>300||!Array.isArray(j.snapshots)||!j.review||Object.values(j.review).some(x=>typeof x!=='string'))throw Error('The backup has an incomplete film project.');for(const x of j.scenes){if(['heading','action','dialogue','turn'].some(k=>typeof x[k]!=='string'))throw Error('The backup contains a damaged scene.');}for(const x of j.snapshots){if(typeof x.script!=='string'||typeof x.date!=='string')throw Error('The backup has an invalid snapshot.');}}
 }
 s.version=2;return s;
}
export function formatWarnings(p){
 const list=[];p.scenes.forEach((s,i)=>{if(!/^(INT\.?|EXT\.?|INT\.?\/EXT\.?|I\/E)\s+/i.test(s.heading))list.push(`Scene ${i+1}: use a heading such as INT. KITCHEN - DAY.`);if(!s.action.trim())list.push(`Scene ${i+1}: add visible or audible action.`);if(s.dialogue.trim()&&!/^[A-Z][A-Z\s.'()\-0-9]+$/m.test(s.dialogue))list.push(`Scene ${i+1}: put an uppercase speaker name on its own line before speech.`);});return list;
}
