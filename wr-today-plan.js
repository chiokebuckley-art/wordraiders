// Today time budget (Daily Comprehension handoff, option b): the main app's Today list calls window.wrTodayPlan(rows,
// playerId) as it builds the list. Rows are kept in their order; the most useful ones for this player are planned
// until about the budget (default 30 minutes, set on Daily Comprehension's grown-up page: wr-today-budget.<player>),
// and the rest are marked "extra" (still tappable, but skipped by "Next task"). Finished rows still count toward the
// day's minutes, so finishing early doesn't keep adding more.
(function(){
 var MIN = { box: 3, journey: 5, grade: 5, 'daily-comprehension': 5, quest: 3, spell: 3, definitions: 5, symbols: 4, littlewords: 12, sound: 7, connecting: 4, picture: 5, raid: 4 };
 // Young readers (Grades 1–2 or no grade yet): reading and phonics first. Older readers: grade work and vocabulary.
 var YOUNG = ['grade', 'daily-comprehension', 'sound', 'littlewords', 'box', 'symbols', 'definitions', 'quest', 'spell', 'connecting', 'picture', 'journey', 'raid'];
 var OLDER = ['grade', 'definitions', 'symbols', 'box', 'quest', 'spell', 'connecting', 'daily-comprehension', 'journey', 'littlewords', 'picture', 'sound', 'raid'];
 function read(k){ try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
 function minutes(r){ if (MIN[r.key] != null) return MIN[r.key]; var m = /(\d+)\s*min/.exec(r.meta || ''); return m ? +m[1] : 5; }
 window.wrTodayPlan = function(rows, pid){
  try {
   if (!Array.isArray(rows) || !pid) return rows;
   var raw = localStorage.getItem('wr-today-budget.' + pid), budget = raw == null ? 30 : Number(raw);
   if (!budget) return rows;
   var g = (read('wr-grade.' + pid) || {}).placedGrade || 0, order = g >= 3 ? OLDER : YOUNG;
   var rank = function(r){ var i = order.indexOf(r.key); return i < 0 ? 99 : i; };
   var byRank = rows.map(function(r, i){ return { r: r, i: i }; }).filter(function(x){ return !x.r.later; }).sort(function(a, b){ return rank(a.r) - rank(b.r) || a.i - b.i; });
   var total = 0, planned = {}, n = 0;
   byRank.forEach(function(x){ var m = minutes(x.r); if (n < 3 || total + m <= budget + 3) { planned[x.i] = true; total += m; n++; } });
   return rows.map(function(r, i){ if (r.done || r.later || planned[i]) return r; var c = {}; for (var k in r) c[k] = r[k]; c.later = true; c.meta = 'extra'; return c; });
  } catch (e) { return rows; }
 };
})();
