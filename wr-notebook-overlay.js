// My Notebook inside the main app: window.wrNotebook.open() shows the Notebook over the main app (the address stays
// the main app's). The Today row and the Library tile call it; the old ./notebook/ address sends players back here
// with a one-time flag (sessionStorage wr-nb-open) and the Notebook opens. Closing it (← WordRaiders, Escape, or the
// phone's Back) returns to the main app and refreshes Home so the Today row shows the new state.
(function(){
 var base = (document.currentScript && document.currentScript.src) || location.href;
 var page = new URL('notebook/', base).href, box = null, pushed = false;
 function refresh(){ try { window.dispatchEvent(new HashChangeEvent('hashchange')); } catch (e) {} }
 function close(fromPop){
  if (!box) return; box.remove(); box = null; document.documentElement.style.overflow = '';
  if (pushed && !fromPop) { pushed = false; history.back(); } else pushed = false;
  setTimeout(refresh, 0);
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
 function boot(){ var m = null; try { m = sessionStorage.getItem('wr-nb-open'); sessionStorage.removeItem('wr-nb-open'); } catch (e) {} if (m) setTimeout(function(){ open(m); }, 600); }
 if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
