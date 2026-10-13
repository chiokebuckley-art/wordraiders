// Grade picker inside the main app (Grade Journey handoff §6.1): on Home, a player with no grade yet is asked
// "Which grade are you in?" (1–12, or Skip → starting check, or Grade 1). The choice is saved to wr-grade.<player>,
// the same record the Grade Journey page uses, and is logged in gradeHistory. "Not now" hides it until next visit.
(function(){
 var BASE = (location.pathname.match(/^(.*?\/wordraiders\/)/) || [, '/'])[1];
 var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
 function read(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
 function player(){ var r = read('wordraiders.players.v1'); if (!r || !Array.isArray(r.profiles)) return null; for (var i = 0; i < r.profiles.length; i++) if (r.profiles[i].id === r.active) return r.profiles[i]; return null; }
 function day(){ var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
 function save(p, fn){
  var k = 'wr-grade.' + p.id, s = read(k) || { schema: 2, seed: Math.floor(Math.random() * 1e9), chosenGrade: null, chosenBy: null, chosenAt: null, placedGrade: null, placedBy: null, gradeHistory: [], placement: [], placementSkippedAt: null, sessionsSinceSkip: 0, activePlacement: null, tracks: {}, grades: {}, events: [], overrides: [], seen: {}, hidden: {}, days: {}, today: null };
  fn(s);
  var g = s.placedGrade; if (g && !s.grades[g]) s.grades[g] = { status: 'in-progress', units: {}, gate: { oral: [], unseenComprehension: [], book: null }, optionalWriting: [], certificate: null, checkFails: [] };
  try { localStorage.setItem(k, JSON.stringify(s)); } catch (e) {}
 }
 function speak(t){ try { import(BASE + 'wr-voice.js?v=3').then(function(m){ m.speak(t); }); } catch (e) {} }
 var CSS = '#wr-gp{position:fixed;inset:0;z-index:2147483000;background:#0b1b2bd9;display:flex;align-items:flex-end;justify-content:center;padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px));font-family:"Trebuchet MS",system-ui,-apple-system,sans-serif}' +
  '#wr-gp .c{width:100%;max-width:520px;max-height:92vh;overflow:auto;background:#132a40;color:#f4f7fb;border:2px solid #2b4966;border-radius:22px;padding:18px 16px 16px;box-shadow:0 -8px 30px #0008}' +
  '#wr-gp .e{font-size:12px;letter-spacing:.16em;font-weight:800;color:#bfff73;margin:0 0 4px}#wr-gp h2{font-size:26px;margin:0 0 4px;line-height:1.15;display:flex;gap:8px;align-items:center}#wr-gp p{margin:4px 0 10px;color:#dbe6f2;font-size:17px}' +
  '#wr-gp .g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:10px 0}#wr-gp .g button{min-height:58px;border-radius:14px;border:2px solid #2b4966;background:#1a3654;color:#f4f7fb;font-size:24px;font-weight:900}' +
  '#wr-gp .p,#wr-gp .b{display:flex;width:100%;align-items:center;justify-content:center;min-height:52px;border-radius:14px;font-weight:900;font-size:18px;margin:6px 0;border:0;cursor:pointer;text-decoration:none}' +
  '#wr-gp .p{background:#bfff73;color:#13230a}#wr-gp .b{background:#1a3654;color:#f4f7fb;border:1px solid #2b4966}#wr-gp .x{background:none;border:0;color:#b8c7da;font-weight:800;min-height:44px;width:100%;font-size:15px}' +
  '#wr-gp .h{width:40px;height:40px;border-radius:12px;border:0;background:#1c2b3a;color:#fff;font-size:18px;flex:none}#wr-gp .w{display:flex;gap:14px;flex-wrap:wrap;margin:6px 0 4px;font-weight:700}#wr-gp .w label{display:flex;gap:6px;align-items:center;min-height:44px}';
 var el = null, step = 'pick', G = null, mode = 'first';
 function close(reload){ if (el) { el.remove(); el = null; } if (reload) location.reload(); }
 function go(path){ location.href = BASE + path; }
 function render(){
  var p = player(); if (!p) return close();
  var h = '';
  var cur = (read('wr-grade.' + p.id) || {}).placedGrade;
  if (step === 'pick') h = (mode === 'change' ? '<p class="e">GRADE JOURNEY · NOW GRADE ' + cur + '</p><h2>Change your grade</h2><p>Pick a new grade. Progress in each grade is kept.</p>' : '<p class="e">GRADE JOURNEY</p><h2>Which grade are you in? <button class="h" data-a="hear" aria-label="Hear it">🔊</button></h2><p>Pick your grade, or skip and we’ll find your level.</p>') + '<div class="g">' +
   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function(g){ return '<button data-a="g" data-g="' + g + '"' + (g === cur && mode === 'change' ? ' style="border-color:#bfff73;color:#bfff73"' : '') + '>' + g + '</button>'; }).join('') + '</div>' +
   (mode === 'change' ? '<button class="b" data-a="place">Take the starting check instead</button><button class="x" data-a="cancel">Cancel</button>' : '<button class="p" data-a="skip">Skip, find my level for me</button><button class="x" data-a="later">Not now</button>');
  else if (step === 'chosen') h = '<p class="e">GRADE ' + G + ' ✓</p><h2>Grade ' + G + '</h2><div class="w"><span>Who chose?</span><label><input type="radio" name="wrgp-by" value="player" checked> I did</label><label><input type="radio" name="wrgp-by" value="parent"> A grown-up</label></div>' +
   '<p>Want a quick check to make sure it’s the right start? (about 10 minutes)</p><button class="p" data-a="start">' + (mode === 'change' ? 'Switch to Grade ' : 'Start Grade ') + G + '</button><button class="b" data-a="check">Check my starting point first</button><button class="x" data-a="back">‹ Pick a different grade</button>';
  else if (step === 'skip') h = '<p class="e">SKIPPED · STARTING AT GRADE 1</p><h2>Want us to find your level?</h2><p>A quick check (about 10 minutes): read some words, then a short story. Or just start at Grade 1. You can change the grade any time with the 🎒 button on Home.</p><button class="p" data-a="place">Start the check</button><button class="b" data-a="g1">Start at Grade 1</button>';
  else if (step === 'done') h = '<p class="e">YOU’RE ALL SET</p><h2>🎒 Grade ' + G + '!</h2><p>Your grade reading is on today’s list. You can change the grade any time in Grade Journey’s grown-up page.</p><button class="p" data-a="read">Start today’s reading</button><button class="b" data-a="home">Back to Home</button>';
  if (!el) { el = document.createElement('div'); el.id = 'wr-gp'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Choose your grade'); el.innerHTML = '<style>' + CSS + '</style><div class="c"></div>'; document.body.appendChild(el); el.addEventListener('click', click); }
  el.querySelector('.c').innerHTML = h;
 }
 function click(e){
  var b = e.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a, p = player(); if (!p) return close();
  if (a === 'hear') return speak('Which grade are you in? Pick your grade, or skip and we will find your level.');
  if (a === 'cancel') return close();
  if (a === 'later') { try { sessionStorage.setItem('wr-gp-later', '1'); } catch (x) {} return close(); }
  if (a === 'g') { G = +b.dataset.g; step = 'chosen'; return render(); }
  if (a === 'back') { step = 'pick'; return render(); }
  // Skip means "don't ask me": save Grade 1 right away, so the question never comes back for this player.
  if (a === 'skip') { save(p, function(s){ s.chosenGrade = null; s.chosenBy = 'auto'; s.placementSkippedAt = day(); s.sessionsSinceSkip = 0; s.placedGrade = 1; s.placedBy = 'default'; s.pickerSkipped = true; s.gradeHistory.push({ at: day(), grade: 1, why: 'default (grade picker skipped)', by: 'auto' }); }); step = 'skip'; return render(); }
  var by = (el.querySelector('input[name=wrgp-by]:checked') || {}).value || 'player';
  if (a === 'start' || a === 'check') save(p, function(s){ if (s.placedGrade === G && mode === 'change') return; s.chosenGrade = G; s.chosenBy = by; s.chosenAt = day(); s.placedGrade = G; s.placedBy = 'chosen'; s.gradeHistory.push({ at: day(), grade: G, why: (mode === 'change' ? 'changed on Home by ' : 'chosen by ') + by, by: by }); });
  if (a === 'check' || a === 'place') { if (a === 'place') save(p, function(s){ s.chosenBy = 'auto'; }); return go('grade-journey/?place=1'); }
  if (a === 'g1') { G = 1; step = 'done'; return render(); }
  if (a === 'start' && mode === 'change') return close(true);
  if (a === 'start') { step = 'done'; return render(); }
  if (a === 'read') return go('grade-journey/?today=1');
  if (a === 'home') return close(true);
 }
 function check(){
  if (el) return;
  var h = location.hash || '';
  if (!/^#\/home/.test(h) || /[?&]today=/.test(location.search)) return;
  var p = player(); if (!p) return;
  try { if (sessionStorage.getItem('wr-gp-later')) return; } catch (x) {}
  var s = read('wr-grade.' + p.id); if (s && (s.placedGrade || s.activePlacement || s.pickerSkipped)) return;
  step = 'pick'; G = null; mode = 'first'; render();
 }
 // "🎒 Grade N" chip on the Grade Journey row in Today: tap to change the grade. It floats over the row (outside
 // the app's own markup) and follows it as the page scrolls.
 var chipEl = null;
 function findRow(){
  var c = [].slice.call(document.querySelectorAll('button, a, [role=button], li')).filter(function(e){ var t = (e.textContent || '').trim(); return t.indexOf('Grade Journey ·') === 0 && e.getBoundingClientRect().height < 90 && e.getBoundingClientRect().height > 20; });
  return c.sort(function(a, b){ return a.getBoundingClientRect().height - b.getBoundingClientRect().height; })[0] || null;
 }
 function chip(){
  var p = player(), s = p && read('wr-grade.' + p.id), row = /^#\/home/.test(location.hash || '') && s && s.placedGrade && !el ? findRow() : null;
  if (!row) { if (chipEl) chipEl.style.display = 'none'; return; }
  if (!chipEl) { chipEl = document.createElement('button'); chipEl.id = 'wr-gp-chip'; chipEl.type = 'button'; chipEl.setAttribute('aria-label', 'Change grade');
   chipEl.style.cssText = 'position:absolute;z-index:50;min-height:34px;padding:0 10px;border-radius:999px;border:1px solid #bfff7388;background:#16304a;color:#f4f7fb;font:800 13px/1 "Trebuchet MS",system-ui,sans-serif;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap';
   chipEl.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); window.wrGradePick('change'); }); document.body.appendChild(chipEl); }
  chipEl.textContent = '🎒 Grade ' + s.placedGrade + ' ✎';
  var r = row.getBoundingClientRect(); chipEl.style.display = 'flex';
  chipEl.style.top = (r.top + window.scrollY + (r.height - chipEl.offsetHeight) / 2) + 'px'; chipEl.style.left = (r.right + window.scrollX - chipEl.offsetWidth - 8) + 'px';
 }
 window.wrGradePick = function(m){ try { sessionStorage.removeItem('wr-gp-later'); } catch (x) {} if (el) close(); var p = player(); if (!p) return; mode = m === 'change' ? 'change' : 'first'; step = 'pick'; if (chipEl) chipEl.style.display = 'none'; render(); };
 window.addEventListener('hashchange', function(){ setTimeout(check, 400); });
 document.addEventListener('visibilitychange', function(){ if (!document.hidden) setTimeout(check, 400); });
 setTimeout(check, 1200); setInterval(check, 3000); setInterval(chip, 700);
 window.addEventListener('scroll', chip, { passive: true }); window.addEventListener('resize', chip);
})();
