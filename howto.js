// WordRaiders "Show me" how-tos (from the How-To Videos handoff). Each one teaches ONE move on the real,
// live screen: dim the rest, spotlight the control, a 2–4 word label beside it, a finger (or Echo in
// Spelling) moves in, holds, taps, the result is shown, then "Now you try" hands the screen back.
// Captions carry the meaning (sound is off until "Hear it" is tapped). Skip is always there and counts
// as seen. Seen flags are per player (wr-howto.<player id>). Reduce Motion: no gliding, no moving
// ghosts; the steps still advance and can be stepped with Next. Offers never autoplay a guide.
(function(){
 'use strict';
 if (window.__wrHowto) return;
 var SRC = (document.currentScript && document.currentScript.src) || location.href;
 var ROOT = new URL('./', SRC).href;                  // the WordRaiders folder, also from common-words/
 var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
 var COOL = 'wr-howto-cool', PLAY = 'wr-howto-play';

 // ---------- storage ----------
 function pid(){ try { var r = JSON.parse(localStorage.getItem('wordraiders.players.v1') || 'null'); return (r && r.active) || 'guest'; } catch (e) { return 'guest'; } }
 function gameSave(){ try { return JSON.parse(localStorage.getItem('wordraiders.save.' + pid()) || 'null') || {}; } catch (e) { return {}; } }
 function store(){ try { return JSON.parse(localStorage.getItem('wr-howto.' + pid()) || '{}') || {}; } catch (e) { return {}; } }
 function keep(s){ try { localStorage.setItem('wr-howto.' + pid(), JSON.stringify(s)); } catch (e) {} }
 function seen(id){ return !!store()[id]; }
 function markSeen(id){ var s = store(); if (!s[id]) { s[id] = Date.now(); keep(s); } }
 function unsee(id){ var s = store(); delete s[id]; delete s['offer:' + id]; keep(s); }
 function ss(k, v){ try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) {} return null; }

 // ---------- DOM helpers ----------
 function $(sel, root){ return (root || document).querySelector(sel); }
 function $$(sel, root){ return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
 function vis(el){ if (!el || !el.isConnected) return null; var r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return null; var cs = getComputedStyle(el); return cs.visibility === 'hidden' || cs.display === 'none' ? null : el; }
 function withText(sel, text){ text = text.toLowerCase(); return $$(sel).filter(function(e){ return (e.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase().indexOf(text) >= 0 && vis(e); })[0] || null; }
 function ownText(e){ var t = ''; e.childNodes.forEach(function(n){ if (!(n.classList && n.classList.contains('hw-chip'))) t += n.textContent; }); return t.trim(); }
 function exactText(sel, text){ return $$(sel).filter(function(e){ return ownText(e) === text && vis(e); })[0] || null; }
 function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
 function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
 function nav(hash){ try { if (location.hash === hash) history.replaceState(null, '', location.pathname + location.search + '#/'); location.hash = hash; } catch (e) { location.href = ROOT + hash; } }
 function clickWhen(find, ms){ var t0 = Date.now(); (function tick(){ var el = find(); if (el) { el.click(); return; } if (Date.now() - t0 < (ms || 4000)) setTimeout(tick, 150); })(); }
 function onCommonWords(){ return /\/common-words\//.test(location.pathname); }

 // ---------- the guides ----------
 var finger = 'finger', echo = 'echo';
 var GUIDES = [
  { id: 'V1-Journey', title: 'The Journey: one stop at a time', place: 'Home, before the Journey starts', kid: true, offer: 'How the Journey works · 30 sec',
    where: function(){ return vis($('.jr-start .jr-next')); }, go: function(){ nav('#/home'); },
    steps: [
     { t: function(){ return $('.jr-start .jr-next'); }, label: 'Start here', cap: 'The Journey goes one stop at a time.' },
     { t: function(){ return $('.jr-start .jr-next'); }, label: 'Learn, then check', cap: 'Each stop: learn it, then a quick check.' },
     { t: function(){ return $('.jr-start .jr-next'); }, label: 'Locks in ✓', cap: 'Pass the check and the stop locks in.' },
     { t: function(){ return withText('.jr-start .jr-link', 'place me'); }, label: 'Optional', cap: 'Know some already? Place me can skip ahead. You don’t have to.' },
     { t: function(){ return $('.jr-start .jr-next'); }, now: true, cap: 'Now you try: Begin at the start.' } ] },

  { id: 'V0-Home', title: 'Home: go down today’s list', place: 'Home', kid: true, offer: 'How Home works · 20 sec', chip: 'home',
    where: function(){ return vis($('.sl-list .sl-step.current')) && !vis($('.jr-start')); }, go: function(){ nav('#/home'); },
    steps: [
     { t: function(){ return $('.sl-step.current') && $('.sl-step.current').parentElement; }, label: 'Today', cap: 'Let’s keep your journey going.' },
     { t: function(){ return $('.sl-step.current'); }, label: 'Tap this one', cap: 'Your next task glows.', tap: true },
     { t: function(){ return $('.sl-step.current'); }, label: 'Tap this one', cap: 'Tap it to start. When it’s done, you can go to the next one.' },
     { t: function(){ return $('.sl-step.done'); }, label: 'Done ✓', cap: 'Done tasks get a tick.', hold: 2600 },
     { t: function(){ return $('.sl-step.current'); }, now: true, cap: 'Now you try.' } ] },

  { id: 'V0-Snap', title: 'Word Quest: snap word parts together', place: 'Quest → Word Quest tutorial', kid: true, offer: 'Watch how to snap · 20 sec', chip: 'snap',
    where: function(){ return vis($('section.quest-card.intro .pieces')); }, offerOk: function(){ return !gameSave().tutorialDone; },
    go: function(){ nav('#/quest/word'); clickWhen(function(){ return withText('.sl-row', 'word quest tutorial'); }); },
    steps: [
     { t: function(){ return $('section.quest-card.intro .slots'); }, label: 'Make a word', cap: 'Make a new word.' },
     { t: function(){ return exactText('section.quest-card.intro .pieces button', 're'); }, label: 'Snap them', cap: 'Tap re first.', tap: true,
       ghost: { from: function(){ return exactText('section.quest-card.intro .pieces button', 're'); }, to: function(){ return $$('section.quest-card.intro .slots .slot')[0]; } } },
     { t: function(){ return exactText('section.quest-card.intro .pieces button', 'play'); }, label: 'Then this', cap: 'Then tap play.', tap: true,
       ghost: { from: function(){ return exactText('section.quest-card.intro .pieces button', 'play'); }, to: function(){ return $$('section.quest-card.intro .slots .slot')[1]; } } },
     { t: function(){ return $('section.quest-card.intro .slots'); }, bubble: 're + play = REPLAY', cap: 're + play = REPLAY', hold: 3000 },
     { t: function(){ return exactText('section.quest-card.intro .pieces button', 're'); }, now: true, cap: 'Now snap yours.' } ] },

  { id: 'V0-Boxes', title: 'Spelling: one sound in each box', place: 'Spelling Quest, at the first sound-box step', kid: true, pointer: echo, offer: 'Echo shows the sound boxes · 30 sec', chip: 'boxes',
    where: function(){ return vis($('.sq-buildstep .sq-boxes')); },
    steps: [
     { t: function(){ return $('.sq-buildstep .sq-boxes'); }, label: 'One sound here', cap: 'This is a sound box. Each box holds one sound.', hold: 3200 },
     { t: function(){ return $('.sq-buildstep .sq-big-say'); }, label: 'Hear it', cap: 'Tap Hear the word to listen.', tap: true },
     { t: function(){ return $('.sq-buildstep .sq-box.next') || $('.sq-buildstep .sq-box'); }, label: 'First sound', cap: 'The first sound goes here.' },
     { t: function(){ return $('.sq-buildstep .sq-tiles'); }, label: 'Pick its letter', cap: 'Tap the letter for that sound. The box lights up.' },
     { t: function(){ return $('.sq-buildstep .sq-big-say'); }, now: true, cap: 'Now you fill the boxes, one sound each.' } ] },

  { id: 'V1-Library', title: 'Library: four kinds of things', place: 'Library', kid: true, offer: 'What’s in the Library · 20 sec', chip: 'library',
    where: function(){ return vis($('.sl-seg')) && exactText('h1.sl-title', 'Library'); }, go: function(){ nav('#/library'); },
    steps: [
     { t: function(){ return $('.sl-seg'); }, label: 'Four kinds', cap: 'The Library has four kinds of things.' },
     { t: function(){ return exactText('.sl-seg button', 'Learn'); }, label: 'Learn', cap: 'Learn: lessons that teach you something new.' },
     { t: function(){ return exactText('.sl-seg button', 'Drill'); }, label: 'Drill', cap: 'Drill: quick practice.' },
     { t: function(){ return exactText('.sl-seg button', 'Play'); }, label: 'Play', cap: 'Play: word games.' },
     { t: function(){ return exactText('.sl-seg button', 'Friends'); }, label: 'Friends', cap: 'Friends: play together.' },
     { t: function(){ return $('.sl-seg'); }, now: true, cap: 'Now you try: pick a kind.' } ] },

  { id: 'V1-Sentence', title: 'Sentence Academy: one step at a time', place: 'Library → Sentence Academy', kid: true, offer: 'How Sentence Academy works · 20 sec',
    where: function(){ return vis($('.unified-academy .sl-cta')); },
    go: function(){ nav('#/library'); clickWhen(function(){ return withText('.sl-card', 'sentence academy'); }); },
    steps: [
     { t: function(){ return $('.unified-academy .sl-row.current') || $('.unified-academy .sl-cta'); }, label: 'Your next topic', cap: 'Your next topic glows.' },
     { t: function(){ return $('.unified-academy .sl-cta'); }, label: 'Tap CONTINUE', cap: 'CONTINUE opens your next step.', tap: true },
     { t: function(){ return $('.unified-academy .sl-cta'); }, label: 'Read, then check', cap: 'Each step: read a card, then answer a check.' },
     { t: function(){ return $('.unified-academy .sl-cta'); }, now: true, cap: 'Now you try.' } ] },

  { id: 'V1-IGA', title: 'Illustrated Grammar: follow the path', place: 'Library → Illustrated Grammar', kid: true, offer: 'How Illustrated Grammar works · 20 sec',
    where: function(){ return vis($('section.vg .vg-intro .vg-primary')); },
    go: function(){ nav('#/library'); clickWhen(function(){ return withText('.sl-card', 'illustrated grammar'); }); },
    steps: [
     { t: function(){ return $('section.vg .vg-intro .vg-primary'); }, label: 'Your path', cap: 'Follow the path: one idea at a time.' },
     { t: function(){ return $('section.vg .vg-intro .vg-primary'); }, label: 'Picture, then check', cap: 'Look at the picture, then check what it shows.', tap: true },
     { t: function(){ return withText('section.vg .vg-tabs button', 'browse'); }, label: 'Just looking', cap: 'Browse is for looking around. It doesn’t move your path.' },
     { t: function(){ return $('section.vg .vg-intro .vg-primary'); }, now: true, cap: 'Now you try: start your path.' } ] },

  { id: 'V1-SmallWords', title: 'Small words: two pictures show the difference', place: 'Small Common Words, first scene', kid: true, offer: 'How the pictures work · 20 sec',
    where: function(){ return onCommonWords() && vis($('.lesson-grid .scene-card [data-action="compare"]')); },
    go: function(){ location.href = ROOT + 'common-words/'; },
    steps: [
     { t: function(){ return $('.lesson-grid .scene-card'); }, label: 'This picture', cap: 'The picture shows what the word means here.' },
     { t: function(){ return $('.lesson-grid [data-action="compare"]'); }, label: 'Compare', cap: 'Tap Compare to see a different picture.', tap: true },
     { t: function(){ return $('.lesson-grid .scene-card'); }, label: 'What changed?', cap: 'What changed? That is the difference the small word makes.', hold: 3000 },
     { t: function(){ return $('.lesson-grid [data-action="compare"]'); }, now: true, cap: 'Now you try: tap Compare.' } ] }
 ];
 function guide(id){ return GUIDES.filter(function(g){ return g.id === id; })[0]; }

 // ---------- speech (off until the kid taps Hear it; never unmutes the app) ----------
 var voice = null;
 function pickVoice(){
  if (!('speechSynthesis' in window)) return null;
  var vs = speechSynthesis.getVoices().filter(function(v){ return /^en/i.test(v.lang); });
  function score(v){ var s = (v.name + ' ' + v.voiceURI).toLowerCase(); return (/premium/.test(s) ? 4 : /enhanced|natural|neural/.test(s) ? 3 : /google/.test(s) ? 2 : 0) + (/en-us/i.test(v.lang) ? 1 : 0) - (/compact/.test(s) ? 2 : 0); }
  vs.sort(function(a, b){ return score(b) - score(a); });
  return vs[0] || null;
 }
 function say(text){ try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(text.replace(/[✓▸→]/g, '')); voice = voice || pickVoice(); if (voice) u.voice = voice; u.rate = 0.95; speechSynthesis.speak(u); } catch (e) {} }
 function hush(){ try { if ('speechSynthesis' in window) speechSynthesis.cancel(); } catch (e) {} }

 // ---------- the overlay ----------
 var cur = null;
 var FINGER = '<svg viewBox="0 0 64 64" width="54" height="54" aria-hidden="true"><path d="M27 6c3 0 5 2 5 5v20l3-1c3-1 6 1 6 4l1-1c3-1 6 1 6 4l1 0c3 0 5 2 5 5v8c0 8-6 14-14 14h-6c-6 0-10-3-13-8l-8-13c-2-3 0-6 3-6 2 0 3 1 4 2l2 3V11c0-3 2-5 5-5z" fill="#fff4dc" stroke="#13230a" stroke-width="3" stroke-linejoin="round"/></svg>';

 function build(g, film){
  var root = document.createElement('div'); root.id = 'wr-howto'; if (film) root.className = 'film';
  root.setAttribute('role', 'dialog'); root.setAttribute('aria-label', 'How-to: ' + g.title);
  root.innerHTML = '<div class="hw-block"></div><div class="hw-spot" hidden></div><div class="hw-label" hidden></div><div class="hw-bubble" hidden></div>' +
   '<div class="hw-finger" hidden>' + FINGER + '</div>' +
   '<div class="hw-cap"><div class="hw-cap-row"><span class="hw-echo" hidden></span><p class="hw-text" aria-live="polite"></p></div>' +
   '<div class="hw-ctl"><button type="button" class="hw-hear" aria-pressed="false">🔊 Hear it</button><button type="button" class="hw-next">Next ›</button><button type="button" class="hw-skip">Skip</button></div></div>';
  document.body.appendChild(root);
  if (g.pointer === echo) { var e = $('.sq-echo'); if (e) { var c = e.cloneNode(true); c.removeAttribute('id'); var slot = root.querySelector('.hw-echo'); slot.appendChild(c); slot.hidden = false; } }
  return root;
 }

 function rectOf(el){ var r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; }
 function inView(r){ return r.y >= 60 && r.y + r.h <= innerHeight - 20; }

 function place(st, el, step){
  var root = st.root, spot = root.querySelector('.hw-spot'), label = root.querySelector('.hw-label'), cap = root.querySelector('.hw-cap');
  if (!el) { spot.hidden = true; label.hidden = true; cap.classList.remove('top'); return; }
  var r = rectOf(el), pad = 8;
  spot.hidden = false;
  spot.style.left = (r.x - pad) + 'px'; spot.style.top = (r.y - pad) + 'px'; spot.style.width = (r.w + pad * 2) + 'px'; spot.style.height = (r.h + pad * 2) + 'px';
  if (step && step.label) {
   label.textContent = step.label; label.hidden = false;
   var lw = label.offsetWidth, lh = label.offsetHeight;
   var above = r.y - pad - lh - 10 > 70, ly = above ? r.y - pad - lh - 10 : r.y + r.h + pad + 10;
   label.style.top = Math.max(8, Math.min(innerHeight - lh - 8, ly)) + 'px';
   label.style.left = Math.max(8, Math.min(innerWidth - lw - 8, r.x)) + 'px';
  } else label.hidden = true;
  cap.classList.toggle('top', r.cy > innerHeight * 0.6);       // never cover the target
 }

 function waitStep(st, ms){
  return new Promise(function(res){ var done = false; function fin(){ if (!done) { done = true; clearTimeout(t); st.advance = null; res(); } } var t = setTimeout(fin, ms); st.advance = fin; });
 }

 async function show(st, step){
  var el = step.t ? vis(step.t()) : null;
  if (step.t && !el) return false;
  if (el && !inView(rectOf(el))) { el.scrollIntoView({ block: 'center', behavior: RM.matches ? 'auto' : 'smooth' }); await sleep(RM.matches ? 60 : 420); }
  if (st.stop) return true;
  var root = st.root, text = root.querySelector('.hw-text'), fing = root.querySelector('.hw-finger'), bub = root.querySelector('.hw-bubble');
  text.textContent = step.cap || ''; st.log && st.log(step);
  place(st, el, step); st.el = el; st.step = step;
  if (st.hear) say(step.cap || '');
  bub.hidden = true;
  if (step.tap && el) {
   var r = rectOf(el);
   fing.hidden = false;
   if (!RM.matches && !st.fingerShown) { fing.style.transition = 'none'; fing.style.left = (innerWidth - 40) + 'px'; fing.style.top = (innerHeight + 20) + 'px'; fing.offsetWidth; fing.style.transition = ''; }
   st.fingerShown = true;
   fing.style.left = (r.cx - 15) + 'px'; fing.style.top = (r.cy - 4) + 'px';
   await sleep(RM.matches ? 200 : 750);                        // glide in
   await sleep(700);                                          // hold on the target
   if (st.stop) return true;
   fing.classList.add('tap'); root.querySelector('.hw-spot').classList.add('tapped');
   await sleep(260); fing.classList.remove('tap'); root.querySelector('.hw-spot').classList.remove('tapped');
   if (step.ghost) ghost(st, step.ghost.from(), step.ghost.to());
   await sleep(RM.matches ? 300 : 700);
  } else if (!st.fingerShown) fing.hidden = true;
  if (step.bubble && el) {
   var rb = rectOf(el); bub.textContent = step.bubble; bub.hidden = false;
   var bw = bub.offsetWidth, bh = bub.offsetHeight;
   bub.style.left = Math.max(8, Math.min(innerWidth - bw - 8, rb.cx - bw / 2)) + 'px';
   bub.style.top = Math.max(8, rb.y - bh - 18) + 'px';
  }
  var words = (step.cap || '').split(/\s+/).length;
  await waitStep(st, step.hold || Math.max(2200, 900 + words * 330));
  return true;
 }

 function ghost(st, from, to){
  if (!from || !to) return;
  var a = rectOf(from), b = rectOf(to), c = from.cloneNode(true);
  c.className += ' hw-ghost'; c.removeAttribute('id'); c.setAttribute('aria-hidden', 'true'); c.tabIndex = -1;
  c.style.left = a.x + 'px'; c.style.top = a.y + 'px'; c.style.width = a.w + 'px'; c.style.height = a.h + 'px';
  st.root.appendChild(c); st.ghosts.push(c);
  var dx = b.cx - a.cx, dy = b.cy - a.cy;
  if (RM.matches) c.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
  else requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.style.transform = 'translate(' + dx + 'px,' + dy + 'px)'; }); });
 }

 function handBack(st, step){
  // "Now you try": the dim and the demo go; a ring stays on the real control until the kid taps.
  var root = st.root, el = step.t ? vis(step.t()) : null;
  root.classList.add('handback'); root.querySelector('.hw-skip').textContent = 'OK';
  st.ghosts.forEach(function(g){ g.remove(); }); st.ghosts = [];
  root.querySelector('.hw-finger').hidden = true; root.querySelector('.hw-bubble').hidden = true; root.querySelector('.hw-label').hidden = true;
  root.querySelector('.hw-text').textContent = step.cap || 'Now you try.';
  if (st.hear) say(step.cap || 'Now you try.');
  if (el) { if (!inView(rectOf(el))) el.scrollIntoView({ block: 'center' }); place(st, el, null); st.el = el; } else root.querySelector('.hw-spot').hidden = true;
  var t = setTimeout(function(){ end(st); }, 9000);
  function tapAnywhere(){ clearTimeout(t); document.removeEventListener('pointerdown', tapAnywhere, true); setTimeout(function(){ end(st); }, 0); }
  setTimeout(function(){ if (!st.ended) document.addEventListener('pointerdown', tapAnywhere, true); }, 500);   // the tap that got us here must not close it
  st.onEnd.push(function(){ clearTimeout(t); document.removeEventListener('pointerdown', tapAnywhere, true); });
 }

 function end(st){
  if (!st || st.ended) return; st.ended = true; st.stop = true;
  st.onEnd.forEach(function(f){ try { f(); } catch (e) {} });
  hush(); if (st.root) st.root.remove();
  window.removeEventListener('resize', st.reflow); window.removeEventListener('scroll', st.reflow, true);
  if (cur === st) cur = null;
  ss(COOL, String(Date.now()));
  if (st.done) st.done();
 }

 async function run(g, opts){
  opts = opts || {};
  if (cur) end(cur);
  closeOffer();
  if (g.id) markSeen(g.id);                                    // watching or skipping both count as seen
  var st = { g: g, root: build(g, opts.film), ghosts: [], onEnd: [], hear: !!opts.hear, log: opts.log, done: opts.done };
  cur = st;
  st.reflow = function(){ if (st.el && !st.root.classList.contains('film-off')) place(st, vis(st.el), st.root.classList.contains('handback') ? null : st.step); };
  window.addEventListener('resize', st.reflow); window.addEventListener('scroll', st.reflow, true);
  var root = st.root;
  root.querySelector('.hw-skip').onclick = function(){ end(st); };
  root.querySelector('.hw-next').onclick = function(){ if (st.advance) st.advance(); };
  var hear = root.querySelector('.hw-hear');
  hear.onclick = function(){ st.hear = !st.hear; hear.setAttribute('aria-pressed', String(st.hear)); hear.textContent = st.hear ? '🔇 Quiet' : '🔊 Hear it'; if (st.hear) say(root.querySelector('.hw-text').textContent); else hush(); };
  root.querySelector('.hw-block').addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); });
  var steps = g.steps, shown = 0;
  for (var i = 0; i < steps.length && !st.stop; i++) {
   var s = steps[i];
   if (s.now) { if (opts.film) break; handBack(st, s); return st; }
   if (await show(st, s)) shown++;
  }
  if (!st.stop) end(st);
  return st;
 }

 // ---------- offers (never autoplay) ----------
 var offerEl = null;
 function closeOffer(){ if (offerEl) { offerEl.remove(); offerEl = null; } }
 function offer(g){
  closeOffer();
  var s = store(), k = 'offer:' + g.id; s[k] = (s[k] || 0) + 1; keep(s);
  var el = document.createElement('div'); el.id = 'wr-howto-offer'; el.setAttribute('role', 'region'); el.setAttribute('aria-label', 'Show me how');
  el.innerHTML = '<span class="hwo-eyes" aria-hidden="true">👀</span><span class="hwo-text"><b>Want to see how?</b><small>' + esc(g.offer || g.title) + '</small></span>' +
   '<button type="button" class="hwo-go">Show me ▸</button><button type="button" class="hwo-no" aria-label="Not now">Not now</button>';
  document.body.appendChild(el); offerEl = el;
  el.querySelector('.hwo-go').onclick = function(){ run(g); };
  el.querySelector('.hwo-no').onclick = function(){ markSeen(g.id); closeOffer(); ss(COOL, String(Date.now())); };
  var t = setTimeout(function(){ if (offerEl === el) { closeOffer(); if ((store()[k] || 0) >= 2) markSeen(g.id); } }, 20000);
  el.addEventListener('pointerdown', function(){ clearTimeout(t); }, { once: true });
 }

 // ---------- "?" and "Watch how" buttons on the real screens ----------
 function chip(id, host, text, cls, before){
  if (!host || host.querySelector('.hw-chip[data-g="' + id + '"]')) return;
  var b = document.createElement('button'); b.type = 'button'; b.className = 'hw-chip ' + (cls || ''); b.dataset.g = id;
  b.textContent = text; b.setAttribute('aria-label', 'Show me how: ' + guide(id).title);
  b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); run(guide(id)); });
  if (before) host.insertBefore(b, before); else host.appendChild(b);
 }
 function chips(){
  var head = $('.sl-section-head'); if (head && vis($('.sl-step.current'))) chip('V0-Home', head, '?', 'q');
  var lib = exactText('h1.sl-title', 'Library'); if (lib && $('.sl-seg')) chip('V1-Library', lib, '?', 'q');
  var snap = $('section.quest-card.intro .pieces'); if (snap && vis(snap)) chip('V0-Snap', snap.parentElement, '▶ Watch how', 'watch', snap.nextSibling);
  var nudge = $('.sq-buildstep .sq-nudge'); if (nudge && vis(nudge)) chip('V0-Boxes', nudge.parentElement, '▶ Watch how', 'watch', nudge.nextSibling);
 }

 // ---------- grown-ups: video, replay list, daily time (Me → Grown-ups) ----------
 function grownupsRows(){
  var title = exactText('h1.sl-title', 'Grown-ups'); if (!title) return;
  var teach = withText('.sl-list .sl-row', 'how the game teaches'); if (!teach || teach.parentElement.querySelector('.hw-row')) return;
  var rows = [['🎬', 'How the game works', '1-minute video for grown-ups', openVideo], ['👀', 'Show-me guides', 'replay any how-to', openReplay], ['⏱️', 'Daily time', 'minutes per day for the Journey', openDailyTime]];
  var after = teach;
  rows.forEach(function(r){
   var b = document.createElement('button'); b.type = 'button'; b.className = 'sl-row hw-row';
   b.innerHTML = '<span class="sl-tile">' + r[0] + '</span><span class="sl-row-text"><b>' + r[1] + '</b><small>' + r[2] + '</small></span><span class="sl-row-right">›</span>';
   b.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); r[3](); });
   after.parentElement.insertBefore(b, after.nextSibling); after = b;
  });
 }
 function modal(title, html){
  var old = $('#wr-howto-modal'); if (old) old.remove();
  var m = document.createElement('div'); m.id = 'wr-howto-modal'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', title);
  m.innerHTML = '<div class="hwm-card"><div class="hwm-head"><h2>' + esc(title) + '</h2><button type="button" class="hwm-x" aria-label="Close">×</button></div>' + html + '</div>';
  document.body.appendChild(m);
  function close(){ hush(); var v = m.querySelector('video'); if (v) v.pause(); m.remove(); document.removeEventListener('keydown', key); }
  function key(e){ if (e.key === 'Escape') close(); }
  m.querySelector('.hwm-x').onclick = close; m.addEventListener('click', function(e){ if (e.target === m) close(); }); document.addEventListener('keydown', key);
  m.querySelector('.hwm-x').focus();
  return { el: m, close: close };
 }
 function openVideo(){
  var base = ROOT + 'howto/V0-Grownups';
  var muted = !!(gameSave().settings || {}).mute;
  var md = modal('How the game works', '<video class="hwm-video" controls playsinline preload="metadata" poster="' + base + '.jpg"' + (muted ? ' muted' : '') + '><source src="' + base + '.mp4" type="video/mp4"><track kind="captions" srclang="en" label="English" src="' + base + '.vtt" default></video>' +
   '<label class="hwm-read"><input type="checkbox"> Read the captions aloud</label>' +
   '<details class="hwm-transcript"><summary>Transcript</summary><div class="hwm-lines">Loading…</div></details>');
  var v = md.el.querySelector('video'), read = md.el.querySelector('.hwm-read input');
  try { v.textTracks[0].mode = 'showing'; } catch (e) {}
  v.addEventListener('loadedmetadata', function(){ try { var tr = v.textTracks[0]; tr.mode = 'showing'; tr.addEventListener('cuechange', function(){ if (!read.checked || v.paused) return; var c = tr.activeCues && tr.activeCues[0]; if (c) say(c.text); }); } catch (e) {} });
  read.onchange = function(){ if (!read.checked) hush(); };
  v.addEventListener('pause', hush);
  fetch(base + '.vtt').then(function(r){ return r.text(); }).then(function(t){
   var lines = t.split(/\n\n+/).map(function(b){ return b.split('\n').filter(function(l){ return l && !/-->/.test(l) && !/^WEBVTT/.test(l) && !/^\d+$/.test(l); }).join(' '); }).filter(Boolean);
   md.el.querySelector('.hwm-lines').innerHTML = lines.map(function(l){ return '<p>' + esc(l) + '</p>'; }).join('');
  }).catch(function(){ md.el.querySelector('.hwm-lines').textContent = 'The transcript could not load. Check the connection and try again.'; });
 }
 function openReplay(){
  var kid = GUIDES.filter(function(g){ return g.kid; });
  var md = modal('Show-me guides', '<p class="hwm-sub">Each guide shows one move on the real screen, then hands it back. Tap one to see it again.</p><div class="hwm-list">' +
   kid.map(function(g){ return '<button type="button" class="hwm-item" data-id="' + g.id + '"><b>' + esc(g.title) + '</b><small>' + esc(g.place) + (seen(g.id) ? ' · seen' : '') + '</small></button>'; }).join('') + '</div><p class="hwm-note" aria-live="polite"></p>');
  $$('.hwm-item', md.el).forEach(function(b){
   b.onclick = function(){
    var g = guide(b.dataset.id); unsee(g.id); ss(PLAY, g.id);
    if (g.go) { md.close(); g.go(); }
    else md.el.querySelector('.hwm-note').textContent = 'It will play the next time you open: ' + g.place + '.';
   };
  });
 }
 function openDailyTime(){
  document.documentElement.classList.add('wr-journey-open');
  nav('#/home');
  var t0 = Date.now();
  (function find(){
   var d = $('.jr-grown'), j = $('.sl-journey');
   if (d) { d.open = true; d.scrollIntoView({ block: 'center' }); return; }
   if (j && Date.now() - t0 > 1500) { j.scrollIntoView({ block: 'start' }); return; }
   if (Date.now() - t0 < 4000) setTimeout(find, 150);
  })();
 }
 window.addEventListener('hashchange', function(){ if (!/^#\/home/.test(location.hash)) document.documentElement.classList.remove('wr-journey-open'); });

 // ---------- watcher ----------
 function blocked(){ return document.hidden || vis($('#wr-intro-overlay')) || $('#wr-today-sheet') || $('#wr-howto-modal') || cur; }
 var pending = 0;
 function scan(){
  pending = 0;
  try { chips(); grownupsRows(); } catch (e) {}
  if (blocked()) return;
  var forced = ss(PLAY);
  for (var i = 0; i < GUIDES.length; i++) {
   var g = GUIDES[i];
   if (!g.where()) continue;
   if (forced === g.id) { ss(PLAY, null); setTimeout(function(gg){ return function(){ run(gg); }; }(g), 400); return; }
  }
  if (offerEl) { var still = GUIDES.filter(function(g){ return g.id === offerEl.dataset.g; })[0]; if (still && !still.where()) closeOffer(); return; }
  var cool = +ss(COOL) || 0; if (Date.now() - cool < 120000) return;
  for (var j = 0; j < GUIDES.length; j++) {
   var h = GUIDES[j];
   if (seen(h.id) || !h.where() || (h.offerOk && !h.offerOk())) continue;
   offer(h); offerEl.dataset.g = h.id; return;
  }
 }
 function soon(){ if (!pending) pending = setTimeout(scan, 500); }
 function start(){
  new MutationObserver(soon).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', soon); document.addEventListener('visibilitychange', soon);
  soon();
 }
 if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

 // ---------- styles (one accent colour for every signal: lime) ----------
 var css = '' +
 '#wr-howto{position:fixed;inset:0;z-index:9990;font-family:Andika,Arial,sans-serif}' +
 '#wr-howto [hidden]{display:none!important}#wr-howto .hw-block{position:absolute;inset:0}' +
 '#wr-howto.handback,#wr-howto.handback .hw-block,#wr-howto.film,#wr-howto.film .hw-block{pointer-events:none}' +
 '#wr-howto.handback .hw-cap{pointer-events:auto}' +
 '#wr-howto .hw-spot{position:fixed;border-radius:16px;box-shadow:0 0 0 3px #bfff73,0 0 0 200vmax rgba(4,10,20,.6);transition:left .45s ease,top .45s ease,width .45s ease,height .45s ease;pointer-events:none}' +
 '#wr-howto .hw-spot.tapped{box-shadow:0 0 0 6px #bfff73,0 0 0 200vmax rgba(4,10,20,.6)}' +
 '#wr-howto.handback .hw-spot{box-shadow:0 0 0 4px #bfff73,0 0 26px 6px #bfff7388;animation:hw-pulse 1.2s ease-in-out infinite}' +
 '@keyframes hw-pulse{50%{box-shadow:0 0 0 7px #bfff73,0 0 34px 10px #bfff7366}}' +
 '#wr-howto .hw-label{position:fixed;background:#bfff73;color:#13230a;font-weight:900;font-size:17px;padding:6px 12px;border-radius:999px;box-shadow:0 4px 14px #0007;white-space:nowrap;pointer-events:none}' +
 '#wr-howto .hw-bubble{position:fixed;background:#fff8e6;color:#1c2b3a;font-weight:900;font-size:22px;padding:10px 16px;border-radius:16px;border:3px solid #bfff73;box-shadow:0 6px 18px #0008;pointer-events:none;animation:hw-in .3s ease-out}' +
 '#wr-howto .hw-finger{position:fixed;left:0;top:0;width:54px;height:54px;transition:left .75s cubic-bezier(.3,.7,.3,1),top .75s cubic-bezier(.3,.7,.3,1),transform .2s;filter:drop-shadow(0 4px 6px #0008);pointer-events:none;transform-origin:30% 10%}' +
 '#wr-howto .hw-finger.tap{transform:scale(.86) translateY(3px)}' +
 '#wr-howto .hw-ghost{position:fixed;margin:0;z-index:2;pointer-events:none;transition:transform .7s cubic-bezier(.3,.7,.3,1);box-shadow:0 0 0 3px #bfff73,0 8px 18px #0008}' +
 '#wr-howto .hw-cap{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(14px + env(safe-area-inset-bottom,0px));width:min(620px,calc(100vw - 24px));background:#0b1b2bf2;color:#f4f7fb;border:2px solid #2b4966;border-radius:18px;padding:12px 14px;box-shadow:0 10px 30px #000a;pointer-events:auto}' +
 '#wr-howto .hw-cap.top{bottom:auto;top:calc(14px + env(safe-area-inset-top,0px))}' +
 '#wr-howto .hw-cap-row{display:flex;gap:10px;align-items:center}' +
 '#wr-howto .hw-echo{flex:none;width:52px;height:52px;display:grid;place-items:center;overflow:hidden}' +
 '#wr-howto .hw-echo>*{transform:scale(.9)}' +
 '#wr-howto .hw-text{margin:0;font-size:20px;font-weight:800;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}' +
 '#wr-howto .hw-ctl{display:flex;gap:8px;margin-top:10px}' +
 '#wr-howto .hw-ctl button{font:inherit;min-height:44px;padding:0 14px;border-radius:12px;border:1px solid #2b4966;background:#1a3654;color:#f4f7fb;font-weight:800;cursor:pointer;touch-action:manipulation}' +
 '#wr-howto .hw-ctl .hw-skip{margin-left:auto}' +
 '#wr-howto.handback .hw-next,#wr-howto.handback .hw-hear{display:none}' +
 '#wr-howto.film .hw-cap{display:none}' +
 '@keyframes hw-in{from{transform:scale(.7);opacity:0}}' +
 '#wr-howto-offer{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:9980;display:flex;align-items:center;gap:10px;flex-wrap:wrap;width:min(560px,calc(100vw - 24px));background:#132a40;color:#f4f7fb;border:2px solid #bfff73;border-radius:18px;padding:10px 12px;box-shadow:0 10px 28px #000a;font-family:Andika,Arial,sans-serif;animation:hw-up .25s ease-out}' +
 '@keyframes hw-up{from{transform:translate(-50%,20px);opacity:0}}' +
 '#wr-howto-offer .hwo-eyes{font-size:26px}#wr-howto-offer .hwo-text{flex:1 1 160px;display:flex;flex-direction:column}#wr-howto-offer small{color:#b8c7da}' +
 '#wr-howto-offer button{font:inherit;min-height:44px;padding:0 14px;border-radius:12px;font-weight:900;cursor:pointer;border:1px solid #2b4966;background:#1a3654;color:#f4f7fb;touch-action:manipulation}' +
 '#wr-howto-offer .hwo-go{background:#bfff73;color:#13230a;border-color:#bfff73}' +
 '.hw-chip{font:inherit;font-weight:900;cursor:pointer;touch-action:manipulation;border-radius:999px;border:2px solid #bfff73;background:transparent;color:#bfff73}' +
 '.hw-chip.q{width:30px;height:30px;padding:0;margin-left:8px;font-size:16px;line-height:1;vertical-align:middle}' +
 'h1 .hw-chip.q{font-size:16px}' +
 '.hw-chip.watch{display:inline-flex;align-items:center;min-height:40px;padding:0 14px;margin:8px auto;font-size:15px}' +
 '#wr-howto-modal{position:fixed;inset:0;z-index:9995;background:rgba(4,10,20,.72);display:flex;align-items:center;justify-content:center;padding:12px;font-family:Andika,Arial,sans-serif}' +
 '#wr-howto-modal .hwm-card{width:min(640px,100%);max-height:calc(100vh - 24px);overflow:auto;background:#132a40;color:#f4f7fb;border:2px solid #2b4966;border-radius:20px;padding:14px 16px 18px}' +
 '#wr-howto-modal .hwm-head{display:flex;align-items:center;gap:8px}#wr-howto-modal h2{margin:0;flex:1;font-size:21px}' +
 '#wr-howto-modal .hwm-x{font:inherit;width:44px;height:44px;border:0;background:none;color:#b8c7da;font-size:28px;cursor:pointer}' +
 '#wr-howto-modal .hwm-video{display:block;width:100%;max-height:70vh;margin-top:10px;border-radius:14px;background:#000}' +
 '#wr-howto-modal .hwm-read{display:flex;gap:8px;align-items:center;margin-top:10px;font-weight:700}#wr-howto-modal .hwm-read input{width:22px;height:22px}' +
 '#wr-howto-modal details{margin-top:10px}#wr-howto-modal summary{cursor:pointer;font-weight:800;min-height:40px;display:flex;align-items:center}' +
 '#wr-howto-modal .hwm-lines p{margin:6px 0;color:#d6e2ef}' +
 '#wr-howto-modal .hwm-sub{color:#b8c7da;margin:6px 0 10px}#wr-howto-modal .hwm-list{display:grid;gap:8px}' +
 '#wr-howto-modal .hwm-item{font:inherit;text-align:left;display:flex;flex-direction:column;gap:2px;padding:12px 14px;border-radius:14px;border:1px solid #2b4966;background:#1a3654;color:#f4f7fb;cursor:pointer;min-height:52px}' +
 '#wr-howto-modal .hwm-item small{color:#b8c7da}#wr-howto-modal .hwm-note{color:#bfff73;font-weight:800;min-height:1.4em}' +
 'html.wr-journey-open .sl-journey{display:block!important}' +
 '@media (prefers-reduced-motion:reduce){#wr-howto *,#wr-howto-offer{transition:none!important;animation:none!important}}';
 var st = document.createElement('style'); st.id = 'wr-howto-style'; st.textContent = css; (document.head || document.documentElement).appendChild(st);

 window.__wrHowto = { guides: GUIDES, run: function(id, o){ var g = typeof id === 'string' ? guide(id) : id; return g ? run(g, o) : null; }, end: function(){ if (cur) end(cur); }, seen: seen, unsee: unsee, openVideo: openVideo, openReplay: openReplay, openDailyTime: openDailyTime };
})();
