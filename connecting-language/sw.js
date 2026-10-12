// Scope is this module only: never replace the application's routes or cache learner data.
const CACHE='wr-connecting-language-v7';
const FILES=['./','./index.html','./style.css','./app.js','./engine.js','./review-policy.js','./review-digest.js','./interactions.js','./scene-contexts.js','./catalog.json','./editorial.json','./comparisons.json','./rubrics.json','./privacy.json','./exercises.json','./assets.json','../journey-shared.js'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin||(!url.pathname.startsWith(new URL('./',self.location).pathname)&&url.pathname!==new URL('../journey-shared.js',self.location).pathname))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.open(CACHE).then(cache=>cache.match(event.request)).then(hit=>hit||new Response('Reconnect to download this lesson.',{status:503}))));
});
