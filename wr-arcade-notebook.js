// Arcade misses → My Notebook. The main app calls window.wrArcadeMiss({...}) when an answer is wrong in the Word Arcade
// (word parts), the Sentence Arcade games (tap the part), the Syntax Arcade (build and repair sentences) or Spelling (Spelling Bee, Picture Spell, Word Builder and the
// spelling lessons). The game's own data is only reachable here, in the main app, so each card is saved with its
// questions already made: the one missed, up to 8 of the same kind (same word part / sentence part / spelling pattern)
// and up to 4 twists. The Notebook page (notebook/sources.js, src 'arcade') picks 3 + 1 of them for each fix.
(function(){
 var base = (document.currentScript && document.currentScript.src) || location.href;
 var nbUrl = new URL('wr-notebook.js?v=nb-2', base).href, last = {};
 function shuffle(a){ a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
 function save(m){ import(nbUrl).then(function(N){ N.miss(m); }).catch(function(){}); }
 function once(key){ var now = Date.now(); if (last[key] && now - last[key] < 2500) return false; last[key] = now; return true; }

 // ---- Word Arcade (word parts): q = { morpheme, kind, prompt, options, answer, explanation }, draw(seed, index) ----
 function mcqOf(q){ return { type: 'mcq', prompt: q.prompt, opts: q.options.map(function(x){ return { x: x }; }), right: q.options.indexOf(q.answer), explain: q.explanation || '' }; }
 function word(a){
  var q = a.q, same = [], twist = [], seen = {}, n = 0; seen[q.prompt + '|' + q.answer] = 1;
  if (!once('w:' + q.prompt)) return;
  // A big selection has many word parts, so drawing more of the same one takes a few thousand draws: done in small
  // slices so the game never stutters.
  (function slice(){
   for (var k = 0; k < 150 && n < 5000 && (same.length < 8 || twist.length < 4); k++, n++) {
    var c; try { c = a.draw(Math.floor(Math.random() * 1e9), n % 40); } catch (e) { n = 5000; break; }
    var key = c.prompt + '|' + c.answer; if (seen[key]) continue; seen[key] = 1;
    if (c.morpheme === q.morpheme) { if (same.length < 8) same.push(mcqOf(c)); }
    else if (c.kind !== q.kind && twist.length < 4) twist.push(mcqOf(c));
   }
   if (n < 5000 && (same.length < 8 || twist.length < 4)) { setTimeout(slice, 0); return; }
   var form = (q.explanation || '').split(' means ')[0];
   save({ src: 'arcade', ref: 'word:' + q.morpheme, skill: 'word', label: form || q.morpheme, prompt: q.prompt, given: a.given, right: q.answer, extra: { game: 'word', orig: mcqOf(q), same: same, twist: twist } });
  })();
 }

 // ---- Sentence Arcade (tap the part): q = { sentenceId, part, answer:[i], prompt }, sentences = id → {tokens}, parts = key → {label, plural, group, hint} ----
 function hits(s, part){ var out = []; s.tokens.forEach(function(t, i){ if ((t.kinds || []).indexOf(part) >= 0 || (t.roles || []).indexOf(part) >= 0) out.push(i); }); return out; }
 function tapOf(s, part, P){
  var ans = hits(s, part), p = P[part], words = ans.map(function(i){ return s.tokens[i].text.replace(/[^\w'’ -]+$/, ''); });
  return { type: 'tap', prompt: ans.length > 1 ? 'Tap every ' + p.label + '.' : 'Tap the ' + p.label + '.', tokens: s.tokens.map(function(t){ return t.text; }), answer: ans,
   explain: words.map(function(w){ return '“' + w + '”'; }).join(ans.length > 1 ? ', ' : '') + (ans.length > 1 ? ' are the ' + p.plural : ' is the ' + p.label) + ' here. ' + (p.hint || '') };
 }
 function sentence(a){
  var q = a.q, S = a.sentences, P = a.parts, s = S[q.sentenceId], p = P[q.part]; if (!s || !p) return;
  if (!once('s:' + q.part + ':' + q.sentenceId)) return;
  var usable = function(x, part){ var n = hits(x, part).length; return n >= 1 && n <= 4; };
  var same = shuffle(Object.keys(S).map(function(k){ return S[k]; }).filter(function(x){ return x.id !== s.id && usable(x, q.part); })).slice(0, 8).map(function(x){ return tapOf(x, q.part, P); });
  var others = Object.keys(P).filter(function(k){ return k !== q.part && usable(s, k) && hits(s, k).join() !== hits(s, q.part).join(); });
  var near = others.filter(function(k){ return P[k].group === p.group; });
  var twist = shuffle(near.length ? near : others).slice(0, 4).map(function(k){ return tapOf(s, k, P); });
  var o = tapOf(s, q.part, P);
  save({ src: 'arcade', ref: 'part:' + q.part, skill: 'sentence', label: p.label, prompt: s.tokens.map(function(t){ return t.text; }).join(' ') + ' — ' + o.prompt, given: 'another word', right: o.answer.map(function(i){ return s.tokens[i].text; }).join(' '), extra: { game: 'sentence', orig: o, same: same, twist: twist } });
 }

 // ---- Spelling: word = { id, word, meaning, sentence, crystal }, crystals = the spelling crystals in order ----
 function spellOf(w){ return { type: 'spell', word: w.word, meaning: w.meaning || '', sentence: w.sentence || '' }; }
 function spell(a){
  var w = a.word, C = a.crystals || [], i = -1; for (var j = 0; j < C.length; j++) if (C[j].id === w.crystal) { i = j; break; }
  if (!once('w:' + w.id)) return;
  var c = C[i], taught = function(cr){ return ((cr && cr.words) || []).filter(function(x){ return !x.heldOut && x.id !== w.id; }); };
  var same = shuffle(taught(c)).slice(0, 8).map(spellOf), twist = shuffle(taught(C[i - 1]).concat(i > 0 ? [] : taught(C[i + 1]))).slice(0, 4).map(spellOf);
  var o = spellOf(w);
  save({ src: 'arcade', ref: 'spell:' + w.id, skill: 'spell', label: w.word + (c && c.pattern ? ' (' + c.pattern + ')' : ''), prompt: 'Spell the word you hear: ' + (w.sentence || w.word), given: a.attempt, right: w.word, lookalike: a.verdict && a.verdict.category === 'meaning', extra: { game: 'spell', orig: o, same: same, twist: twist } });
 }

 // ---- Syntax Arcade: q = { topic, kind: choose|repair|mark|build, sentence, prompt, options, answer, explain }, bank = the topic's questions ----
 function synOf(q){
  if (q.kind === 'mark') return { type: 'tap', prompt: q.prompt, tokens: q.options, answer: q.answer, explain: q.explain };
  if (q.kind === 'build') return { type: 'order', prompt: q.prompt, tokens: q.options, answer: q.answer, explain: q.explain };
  return { type: 'mcq', lead: q.sentence, prompt: q.prompt, opts: q.options.map(function(x){ return { x: x }; }), right: q.answer[0], explain: q.explain };
 }
 function syntax(a){
  var q = a.q, bank = a.bank || []; if (!once('x:' + q.id)) return;
  var same = shuffle(bank.filter(function(x){ return x.kind === q.kind && x.sentence !== q.sentence; })), seen = {}, pick = [];
  same.forEach(function(x){ if (!seen[x.sentence] && pick.length < 8) { seen[x.sentence] = 1; pick.push(synOf(x)); } });
  var twist = shuffle(bank.filter(function(x){ return x.kind !== q.kind; })).slice(0, 4).map(synOf);
  save({ src: 'arcade', ref: 'syntax:' + q.topic, skill: 'syntax', label: a.term || q.topic, prompt: q.prompt + ' ' + q.sentence, given: (a.picked || []).map(function(i){ return q.options[i]; }).join(' '), right: q.kind === 'build' ? q.sentence : q.answer.map(function(i){ return q.options[i]; }).join(' '), extra: { game: 'syntax', orig: synOf(q), same: pick, twist: twist } });
 }

 // ---- Sentence Arcade word forms (plurals, verb forms, tenses…): q = { id, topic, prompt, text, options, answer, explain, figure() } ----
 function formOf(q){ var fig = ''; try { fig = q.figure ? q.figure() : ''; } catch (e) {} return { type: 'mcq', lead: q.text || '', pic: fig && fig.length < 20000 ? fig : '', prompt: q.prompt, opts: q.options.map(function(x){ return { x: x }; }), right: q.answer, explain: q.explain }; }
 function forms(a){
  var q = a.q, bank = a.bank || []; if (!once('f:' + q.id)) return;
  var seen = {}, same = []; seen[q.prompt + (q.text || '')] = 1;
  shuffle(bank).forEach(function(x){ var k = x.prompt + (x.text || ''); if (!seen[k] && same.length < (q.figure ? 4 : 8)) { seen[k] = 1; same.push(x); } });
  var twist = same.splice(Math.max(1, same.length - 2)).slice(0, 2);
  save({ src: 'arcade', ref: 'forms:' + q.topic, skill: 'forms', label: a.title || q.topic, prompt: q.prompt + (q.text ? ' ' + q.text : ''), given: q.options[a.picked], right: q.options[q.answer], extra: { game: 'forms', orig: formOf(q), same: same.map(formOf), twist: twist.map(formOf) } });
 }

 window.wrArcadeMiss = function(a){ try { if (!a) return; if (a.game === 'word') word(a); else if (a.game === 'sentence') sentence(a); else if (a.game === 'spell') spell(a); else if (a.game === 'syntax') syntax(a); else if (a.game === 'forms') forms(a); } catch (e) {} };
})();
