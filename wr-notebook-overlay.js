// My Notebook inside the main app: window.wrNotebook.open() shows the Notebook over the main app (the address stays
// the main app's). The Today row and the Library tile call it; the old ./notebook/ address sends players back here
// with a one-time flag (sessionStorage wr-nb-open) and the Notebook opens. Closing it (← WordRaiders, Escape, or the
// phone's Back) returns to the main app and refreshes Home so the Today row shows the new state. Home also gets a
// "📒 My Notebook" bar above Today.
(function(){
 var base = (document.currentScript && document.currentScript.src) || location.href;
 var page = new URL('notebook/', base).href, box = null, pushed = false;
 function refresh(){ try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch (e) {} }
 function close(fromPop){
  if (!box) return; box.remove(); box = null; document.documentElement.style.overflow = '';
  if (pushed && !fromPop) { pushed = false; history.back(); } else pushed = false;
  setTimeout(refresh, 0); setTimeout(homeBar, 300);
 }
 function open(mode){
  if (box) return;
  box = document.createElement('div'); box.id = 'wr-notebook-layer';
  box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'My Notebook');
  box.style.cssText = 'position:fixed;inset:0;z-index:2147483000;background:#0b1b2b;';
  var f = document.createElement('iframe');
  f.src = page + '?embed=1' + (mode === 'today' ? '&today=1' : '');
  f.title = 'My Notebook'; f.allow = 'autoplay';
  f.style.cssText = 'border:0;width:100%;height:100%;display:block;background:#0b1b2b;';
  box.appendChild(f); document.body.appendChild(box); document.documentElement.style.overflow = 'hidden';
  try { history.pushState({ wrNotebook: 1 }, '', location.href); pushed = true; } catch (e) {}
  setTimeout(function(){ try { f.focus(); } catch (e) {} }, 50);
 }
 window.wrNotebook = { open: open, close: function(skipBack){ close(!!skipBack); }, isOpen: function(){ return !!box; } };
 window.addEventListener('popstate', function(){ if (box) close(true); });
 window.addEventListener('keydown', function(e){ if (e.key === 'Escape' && box) close(false); });
 // A link inside the Notebook that moves the main app (Next task, Progress) closes the Notebook first.
 window.addEventListener('hashchange', function(e){ if (box && e.isTrusted) { box.remove(); box = null; pushed = false; document.documentElement.style.overflow = ''; } });
 // "📒 My Notebook" bar on Home, just above Today: always there (even before the first mistake), with today's count.
 // It is added by this file, not the app's own code, so it shows as soon as this small file is fresh.
 function pid(){ try { var r = JSON.parse(localStorage.getItem('wordraiders.players.v1') || 'null'); return r && r.active; } catch (e) { return null; } }
 function day(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
 function status(){
  var N = null; try { N = JSON.parse(localStorage.getItem('wr-notebook.' + pid()) || 'null'); } catch (e) {}
  var cards = (N && N.cards) || [], k = day(), y = (N && N.days && N.days[k]) || {}, f = y.fixes || 0;
  var due = cards.filter(function(c){ return !c.clearedAt && c.due <= k; }).length, open = cards.filter(function(c){ return !c.clearedAt; }).length;
  if (!cards.length) return { text: 'Mistakes land here', hot: false };
  if (y.pageDone || (f + (y.checkups || 0) > 0 && !(due && f < 3))) return { text: 'Done today ✓', hot: false };
  if (due && f < 3) return { text: (Math.min(3, f + due) - f) + ' to fix', hot: true };
  return { text: open ? 'Check-up' : 'All cleared ✓', hot: !!open };
 }
 var bar = null;
 function homeBar(){
  if (!/^#\/home/.test(location.hash || '#/home') || box || !pid()) { if (bar && bar.parentNode) bar.remove(); return; }
  var head = [].slice.call(document.querySelectorAll('.sl-section-head')).find(function(e){ return /TODAY ·/.test(e.textContent || ''); });
  if (!head || !head.parentNode) return;
  if (!bar) {
   bar = document.createElement('button'); bar.type = 'button'; bar.id = 'wr-nb-home';
   bar.style.cssText = 'display:flex;align-items:center;gap:10px;width:100%;box-sizing:border-box;min-height:56px;margin:12px 0 4px;padding:10px 16px;border-radius:16px;border:2px solid #ff9f4366;background:#16304a;color:#f4f7fb;font:800 16px/1.2 "Trebuchet MS",system-ui,sans-serif;text-align:left;cursor:pointer';
   bar.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); var st = status(); open(st.hot ? 'today' : 'home'); });
  }
  var st = status();
  bar.innerHTML = '<span style="font-size:22px" aria-hidden="true">📒</span><span style="flex:1">My Notebook</span><span style="font-size:14px;padding:4px 10px;border-radius:999px;background:' + (st.hot ? '#ff9f43;color:#2a1600' : '#ffffff14;color:#cfe0f0') + '">' + st.text + ' ▸</span>';
  bar.setAttribute('aria-label', 'My Notebook: ' + st.text);
  if (bar.nextSibling !== head || bar.parentNode !== head.parentNode) head.parentNode.insertBefore(bar, head);
 }
 setInterval(homeBar, 800); window.addEventListener('hashchange', function(){ setTimeout(homeBar, 50); });

 function boot(){ var m = null; try { m = sessionStorage.getItem('wr-nb-open'); sessionStorage.removeItem('wr-nb-open'); } catch (e) {} if (m) setTimeout(function(){ open(m); }, 600); }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
