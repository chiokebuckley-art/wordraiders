// WordRaiders reading voice for the standalone pages (Sound Code, First Steps, Sentence Decoder).
// Same choice as the main app: the player's own voice from Settings if it is set, otherwise the best English voice
// on the device (Google US English first, then premium / enhanced / natural voices; novelty voices last), at the
// player's speech rate and volume. Honours Mute and "voice reading" off. Voices load late on some phones, so the
// list is re-read when the device announces them.
const save = () => { try { const r = JSON.parse(localStorage.getItem('wordraiders.players.v1') || 'null'); const id = r && r.active; return id ? JSON.parse(localStorage.getItem(`wordraiders.save.${id}`) || '{}') || {} : {}; } catch { return {}; } };
export function settings(){ const s = save().settings || {}; const num = (v, d) => Number.isFinite(+v) ? +v : d;
 return { mute: s.mute === true, speech: s.speech !== false, voice: typeof s.voice === 'string' ? s.voice.trim() : '', speechVolume: Math.min(1, num(s.speechVolume, .85)), speechRate: Math.max(.75, Math.min(1.1, num(s.speechRate, .9))) }; }
function score(v){
 const t = v.name; let n = 0;
 if (/^en/i.test(v.lang)) n += 4; if (/en[-_]US/i.test(v.lang)) n += 3;
 if (/google us english/i.test(t)) n += 35; else if (/google (uk|australia|india) english/i.test(t)) n += 20; else if (/google/i.test(t)) n += 15;
 if (/ava|allison|zoe|karen|moira|daniel|serena|aria|jenny|ana|michelle|libby|sonia|guy|davis/i.test(t)) n += 8;
 const r = `${v.name} ${v.voiceURI ?? ''}`.toLowerCase();
 if (/premium/i.test(r)) n += 14; else if (/enhanced|natural|neural|online/i.test(r)) n += 10; else if (/compact/i.test(r)) n -= 12;
 if (/samantha/i.test(t)) n += 2;
 if (/compact|eloquence|fred|zarvox|albert|bad news|bells|boing|bubbles|cellos|deranged|good news|jester|organ|superstar|trinoids|whisper|wobble|junior|kathy|ralph|grandma|grandpa|rocko|shelley|eddy|flo|reed|sandy/i.test(t)) n -= 20;
 return n;
}
let cache = [];
function voices(){ try { const v = speechSynthesis.getVoices().filter(x => /^en/i.test(x.lang)).sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name)); if (v.length) cache = v; } catch {} return cache; }
if (typeof window !== 'undefined' && 'speechSynthesis' in window) { voices(); try { speechSynthesis.addEventListener('voiceschanged', voices); } catch {} }
export function pickVoice(){ const vs = voices(); if (!vs.length) return null; const want = settings().voice;
 if (want) { const w = want.toLowerCase(); const hit = vs.find(v => v.name === want || v.voiceURI === want || v.name.toLowerCase() === w || (v.voiceURI && v.voiceURI.toLowerCase() === w)); if (hit) return hit; }
 return vs[0] || null; }
/** Why speech can't play right now (a short message), or '' when it can. */
export function blocked(){ const s = settings();
 if (s.mute || !s.speech) return 'Reading is off. Turn on voice reading in WordRaiders settings to listen.';
 if (s.speechVolume <= 0) return 'Voice volume is zero. Raise Voice volume in Settings.';
 if (typeof window === 'undefined' || !('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') return 'This browser has no reading voice. Try your device browser.';
 return ''; }
/** Speak text with the app's voice. opts: { rate (multiplier on the player's rate), onboundary, onstart, onend }. */
export function speak(text, opts = {}){
 if (blocked() || !text) return null;
 const s = settings(); speechSynthesis.cancel();
 const u = new SpeechSynthesisUtterance(text), v = pickVoice();
 if (v) u.voice = v; u.lang = (v?.lang || 'en-US').replace('_', '-');
 u.rate = Math.max(.6, Math.min(1.1, s.speechRate * (opts.rate || 1))); u.pitch = 1; u.volume = s.speechVolume;
 if (opts.onboundary) u.onboundary = opts.onboundary; if (opts.onstart) u.onstart = opts.onstart; if (opts.onend) u.onend = opts.onend;
 speechSynthesis.speak(u); return u;
}
