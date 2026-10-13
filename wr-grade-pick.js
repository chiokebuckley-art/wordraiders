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
 var el = null, step = 'pick', G = null;
 function close(reload){ if (el) { el.remove(); el = null; } if (reload) location.reload(); }
 function go(path){ location.href = BASE + path; }
 function render(){
  var p = player(); if (!p) return close();
  var h = '';
  if (step === 'pick') h = '<p class="e">GRADE JOURNEY</p><h2>Which grade are you in? <button class="h" data-a="hear" aria-label="Hear it">🔊</button></h2><p>Pick your grade, or skip and we’ll find your level.</p><div class="g">' +
   [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(function(g){ return '<button data-a="g" data-g="' + g + '">' + g + '</button>'; }).join('') + '</div><button class="p" data-a="skip">Skip, find my level for me</button><button class="x" data-a="later">Not now</button>';
  else if (step === 'chosen') h = '<p class="e">GRADE ' + G + ' ✓</p><h2>Grade ' + G + '</h2><div class="w"><span>Who chose?</span><label><input type="radio" name="wrgp-by" value="player" checked> I did</label><label><input type="radio" name="wrgp-by" value="parent"> A grown-up</label></div>' +
   '<p>Want a quick check to make sure it’s the right start? (about 10 minutes)</p><button class="p" data-a="start">Start Grade ' + G + '</button><button class="b" data-a="check">Check my starting point first</button><button class="x" data-a="back">‹ Pick a different grade</button>';
  else if (step === 'skip') h = '<p class="e">LET’S FIND YOUR LEVEL!</p><h2>Read some words, then a short story.</h2><p>About 10 minutes. You can stop halfway and finish later.</p><button class="p" data-a="place">Start the check</button><button class="b" data-a="g1">Skip, start at Grade 1</button><button class="x" data-a="back">‹ Back</button>';
  else if (step === 'done') h = '<p class="e">YOU’RE ALL SET</p><h2>🎒 Grade ' + G + '!</h2><p>Your grade reading is on today’s list. You can change the grade any time in Grade Journey’s grown-up page.</p><button class="p" data-a="read">Start today’s reading</button><button class="b" data-a="home">Back to Home</button>';
  if (!el) { el = document.createElement('div'); el.id = 'wr-gp'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Choose your grade'); el.innerHTML = '<style>' + CSS + '</style><div class="c"></div>'; document.body.appendChild(el); el.addEventListener('click', click); }
  el.querySelector('.c').innerHTML = h;
 }
 function click(e){
  var b = e.target.closest('[data-a]'); if (!b) return; var a = b.dataset.a, p = player(); if (!p) return close();
  if (a === 'hear') return speak('Which grade are you in? Pick your grade, or skip and we will find your level.');
  if (a === 'later') { try { sessionStorage.setItem('wr-gp-later', '1'); } catch (x) {} return close(); }
  if (a === 'g') { G = +b.dataset.g; step = 'chosen'; return render(); }
  if (a === 'back') { step = 'pick'; return render(); }
  if (a === 'skip') { step = 'skip'; return render(); }
  var by = (el.querySelector('input[name=wrgp-by]:checked') || {}).value || 'player';
  if (a === 'start' || a === 'check') save(p, function(s){ s.chosenGrade = G; s.chosenBy = by; s.chosenAt = day(); s.placedGrade = G; s.placedBy = 'chosen'; s.gradeHistory.push({ at: day(), grade: G, why: 'chosen by ' + by + ' (Home)', by: by }); });
  if (a === 'check' || a === 'place') { if (a === 'place') save(p, function(s){ s.chosenBy = 'auto'; }); return go('grade-journey/?place=1'); }
  if (a === 'g1') { save(p, function(s){ s.chosenGrade = null; s.chosenBy = 'auto'; s.placementSkippedAt = day(); s.sessionsSinceSkip = 0; s.placedGrade = 1; s.placedBy = 'default'; s.gradeHistory.push({ at: day(), grade: 1, why: 'default (grade and check skipped)', by: 'auto' }); }); G = 1; step = 'done'; return render(); }
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
  var s = read('wr-grade.' + p.id); if (s && (s.placedGrade || s.activePlacement)) return;
  step = 'pick'; G = null; render();
 }
 window.wrGradePick = function(){ try { sessionStorage.removeItem('wr-gp-later'); } catch (x) {} if (el) close(); var p = player(); if (!p) return; step = 'pick'; render(); };
 window.addEventListener('hashchange', function(){ setTimeout(check, 400); });
 document.addEventListener('visibilitychange', function(){ if (!document.hidden) setTimeout(check, 400); });
 setTimeout(check, 1200); setInterval(check, 3000);
})();
