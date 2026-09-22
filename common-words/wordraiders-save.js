// Progress lives in the active WordRaiders player's save (wordraiders.save.<id>, field commonWords), so it
// follows the player across devices with cloud sync. Without a player (opened on its own) a guest save is used.
const REGISTRY='wordraiders.players.v1';
export const GUEST_KEY='wordraiders.commonwords.guest';
const record=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const profileFrom=(id,name,raw)=>{const cw=record(raw.commonWords);return {id,name:String(name||'Explorer').slice(0,30),xp:Number.isFinite(raw.xp)?raw.xp:0,records:record(cw.records),academy:{version:1,completed:record(cw.completed),checkpoint:cw.checkpoint&&typeof cw.checkpoint==='object'?cw.checkpoint:null}};};
/** The save the academy expects: one profile, the WordRaiders player, plus the key to write back to. */
export function loadSave(storage){
 try{const reg=JSON.parse(storage.getItem(REGISTRY)||'null');const active=reg&&typeof reg==='object'?reg.active:null;const prof=Array.isArray(reg?.profiles)?reg.profiles.find(p=>p&&p.id===active):null;
  if(prof){const key=`wordraiders.save.${active}`;const raw=record(JSON.parse(storage.getItem(key)||'{}'));return {save:{profiles:[profileFrom(active,prof.name,raw)],active,key,player:true},error:null};}
  const raw=record(JSON.parse(storage.getItem(GUEST_KEY)||'{}'));return {save:{profiles:[profileFrom('guest','Explorer',raw)],active:'guest',key:GUEST_KEY,player:false},error:null};
 }catch{return {save:{profiles:[profileFrom('guest','Explorer',{})],active:'guest',key:GUEST_KEY,player:false},error:'Your saved data could not be read. It has not been overwritten.'};}
}
/** Write the profile back into the WordRaiders save (or the guest save) and stamp it so cloud sync pushes it. */
export function saveBack(storage,save){
 const p=save.profiles[0];const raw=record(JSON.parse(storage.getItem(save.key)||'{}'));
 raw.commonWords={version:1,completed:p.academy.completed,checkpoint:p.academy.checkpoint,records:p.records};
 if(save.player){raw.xp=p.xp;raw.savedAt=Date.now();}
 storage.setItem(save.key,JSON.stringify(raw));
}
