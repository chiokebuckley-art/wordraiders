// "Done for today" card for pages outside the main app (same look as today-flow.js's card).
// Use: <script src="../wr-today-done.js?v=1" data-name="Daily Definitions" data-done-text="Your daily session is complete" defer></script>
// It watches the page; when a heading with data-done-text appears it offers "Next task ▸" (the next unfinished row
// on Today, via ../?today=next) or "Back to Home". Pages can also call window.wrTodayDone('Name') themselves.
(function(){
 var me = document.currentScript, NAME = (me && me.dataset.name) || 'Task', DONE = me && me.dataset.doneText, shown = false, dismissed = false;
 var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
 function card(name){
  if (dismissed || document.getElementById('wr-today-sheet')) return; shown = true;
  var el = document.createElement('div'); el.id = 'wr-today-sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Task done');
  el.innerHTML = '<div class="wts-card"><button class="wts-x" aria-label="Stay here">×</button><p class="wts-done">✓ ' + esc(name || NAME) + ' done for today!</p>' +
   '<p class="wts-up">Keep going down today’s list, or head home.</p><div class="wts-row"><a class="wts-next" href="../?today=next#/home">Next task ▸</a><a class="wts-home" href="../#/home">Back to Home</a></div></div>';
  document.body.appendChild(el);
  el.querySelector('.wts-x').onclick = function(){ el.remove(); dismissed = true; };
  el.querySelector('.wts-next').focus();
 }
 window.wrTodayDone = card;
 var css = '#wr-today-sheet{position:fixed;left:0;right:0;bottom:0;z-index:9999;display:flex;justify-content:center;padding:0 12px calc(12px + env(safe-area-inset-bottom,0px));pointer-events:none}' +
  '#wr-today-sheet .wts-card{pointer-events:auto;position:relative;width:min(560px,100%);background:#132a40;color:#f4f7fb;border:2px solid #bfff73;border-radius:20px;padding:16px 16px 14px;box-shadow:0 -8px 30px #0009;font-family:Andika,"Trebuchet MS",system-ui,sans-serif;animation:wts-in .25s ease-out}' +
  '#wr-today-sheet .wts-done{margin:0 28px 4px 0;font-weight:900;font-size:20px;color:#bfff73}#wr-today-sheet .wts-up{margin:0 0 12px;font-size:16px;color:#d6e2ef}' +
  '#wr-today-sheet .wts-row{display:flex;gap:10px;flex-wrap:wrap}' +
  '#wr-today-sheet .wts-next,#wr-today-sheet .wts-home{flex:1 1 160px;min-height:52px;border-radius:14px;font-weight:900;font-size:17px;border:1px solid #2b4966;background:#1a3654;color:#f4f7fb;display:flex;align-items:center;justify-content:center;text-decoration:none;padding:0 14px}' +
  '#wr-today-sheet .wts-next{background:#bfff73;color:#13230a;border-color:#bfff73}' +
  '#wr-today-sheet .wts-x{position:absolute;top:6px;right:6px;width:44px;height:44px;min-height:0;border:0;background:none;color:#b8c7da;font-size:26px;padding:0}' +
  '@keyframes wts-in{from{transform:translateY(30px);opacity:0}}@media (prefers-reduced-motion:reduce){#wr-today-sheet .wts-card{animation:none}}';
 var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
 if (!DONE) return;
 function check(){ if (shown || dismissed) return; var hs = document.querySelectorAll('h1,h2,h3'); for (var i = 0; i < hs.length; i++) if (hs[i].textContent.trim() === DONE) { card(); return; } }
 new MutationObserver(check).observe(document.body, { childList: true, subtree: true, characterData: true }); check();
})();
