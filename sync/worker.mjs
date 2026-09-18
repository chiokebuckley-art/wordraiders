/**
 * WORDRAIDERS cloud sync: a Cloudflare Worker with a D1 table that keeps one save per sync code.
 *
 *   GET  /v1/save/:code            → 200 {rev, savedAt, data} | 404
 *   PUT  /v1/save/:code            → body {data, baseRev, savedAt}
 *   POST /v1/save/:code              200 {rev, savedAt} | 409 {conflict:true, rev, savedAt, data}
 *   GET  /                         → 200 {ok:true}
 *
 * A sync code is a 12-character secret the game generates; whoever knows it owns that save.
 * `rev` counts server writes, so a device that pushes with a stale `baseRev` gets the newer save
 * back instead of overwriting it. Bodies are capped at 400 KB. No accounts, no cookies.
 */
const CODE=/^[A-Z2-9]{12}$/;
const MAX_BYTES=400*1024;
const CORS={'access-control-allow-origin':'*','access-control-allow-methods':'GET,PUT,POST,OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'86400'};
const json=(status,body)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store',...CORS}});
let ready=null;
const ensure=(db)=>ready||(ready=db.prepare('CREATE TABLE IF NOT EXISTS saves (code TEXT PRIMARY KEY, rev INTEGER NOT NULL, saved_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, data TEXT NOT NULL)').run().catch(e=>{ready=null;throw e;}));

const worker={
 async fetch(request,env){
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:CORS});
  const url=new URL(request.url);
  if(url.pathname==='/'||url.pathname==='/healthz')return json(200,{ok:true,service:'wordraiders-sync'});
  const m=/^\/v1\/save\/([A-Za-z0-9-]+)\/?$/.exec(url.pathname);
  if(!m)return json(404,{error:'Not found'});
  const code=m[1].toUpperCase().replace(/-/g,'');
  if(!CODE.test(code))return json(400,{error:'That is not a sync code.'});
  if(!env.DB)return json(503,{error:'The sync database is not attached yet.'});
  try{await ensure(env.DB);}catch(e){return json(503,{error:'Sync storage is unavailable: '+(e&&e.message||e)});}
  const now=Date.now();
  try{
  if(request.method==='GET'){
   const row=await env.DB.prepare('SELECT rev, saved_at, data FROM saves WHERE code=?1').bind(code).first();
   if(!row)return json(404,{error:'No save for that code yet.'});
   return json(200,{rev:row.rev,savedAt:row.saved_at,data:row.data});
  }
  if(request.method==='PUT'||request.method==='POST'){
   let body;
   try{const text=await request.text();if(text.length>MAX_BYTES)return json(413,{error:'That save is too large.'});body=JSON.parse(text);}catch{return json(400,{error:'Send JSON.'});}
   if(!body||typeof body.data!=='string'||!body.data||body.data.length>MAX_BYTES)return json(400,{error:'Missing save data.'});
   const baseRev=Number.isInteger(body.baseRev)?body.baseRev:0;
   const savedAt=Number.isFinite(body.savedAt)&&body.savedAt>0?Math.min(body.savedAt,now+60000):now;
   const row=await env.DB.prepare('SELECT rev, saved_at, data FROM saves WHERE code=?1').bind(code).first();
   const current=row?row.rev:0;
   if(current!==baseRev)return json(409,{conflict:true,rev:current,savedAt:row?row.saved_at:0,data:row?row.data:''});
   const rev=current+1;
   const res=row
    ?await env.DB.prepare('UPDATE saves SET rev=?2, saved_at=?3, updated_at=?4, data=?5 WHERE code=?1 AND rev=?6').bind(code,rev,savedAt,now,body.data,current).run()
    :await env.DB.prepare('INSERT OR IGNORE INTO saves (code, rev, saved_at, updated_at, data) VALUES (?1, ?2, ?3, ?4, ?5)').bind(code,rev,savedAt,now,body.data).run();
   const changed=res&&res.meta&&typeof res.meta.changes==='number'?res.meta.changes:1;
   if(!changed){const latest=await env.DB.prepare('SELECT rev, saved_at, data FROM saves WHERE code=?1').bind(code).first();return json(409,{conflict:true,rev:latest?latest.rev:0,savedAt:latest?latest.saved_at:0,data:latest?latest.data:''});}
   return json(200,{rev,savedAt});
  }
  }catch(e){return json(503,{error:'Sync storage is unavailable: '+(e&&e.message||e)});}
  return json(405,{error:'Method not allowed'});
 }
};
export default worker;
