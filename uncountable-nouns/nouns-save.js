// Progress lives in its own key per WordRaiders player (wr-nouns.<player id>): the main app rewrites the player save
// with only the fields it knows, so this academy keeps scenes, checkpoint and records beside it. XP goes into the
// player's save like every other academy. Without a player (opened on its own) a guest key is used.
const REGISTRY = 'wordraiders.players.v1';
const record = v => v && typeof v === 'object' && !Array.isArray(v) ? v : {};
const keyFor = id => `wr-nouns.${id}`;
function profileFrom(id, name, mine, xp){
 return { id, name: String(name || 'Explorer').slice(0, 30), xp: Number.isFinite(xp) ? xp : 0, records: record(mine.records), academy: { version: 1, completed: record(mine.completed), checkpoint: mine.checkpoint && typeof mine.checkpoint === 'object' ? mine.checkpoint : null } };
}
export function loadSave(storage){
 try {
  const reg = JSON.parse(storage.getItem(REGISTRY) || 'null'), active = reg && typeof reg === 'object' ? reg.active : null;
  const prof = Array.isArray(reg?.profiles) ? reg.profiles.find(p => p && p.id === active) : null;
  if (prof) {
   const wr = record(JSON.parse(storage.getItem(`wordraiders.save.${active}`) || '{}')), mine = record(JSON.parse(storage.getItem(keyFor(active)) || '{}'));
   return { save: { profiles: [profileFrom(active, prof.name, mine, wr.xp)], active, key: `wordraiders.save.${active}`, mineKey: keyFor(active), player: true }, error: null };
  }
  const mine = record(JSON.parse(storage.getItem(keyFor('guest')) || '{}'));
  return { save: { profiles: [profileFrom('guest', 'Explorer', mine, mine.xp)], active: 'guest', key: keyFor('guest'), mineKey: keyFor('guest'), player: false }, error: null };
 } catch {
  return { save: { profiles: [profileFrom('guest', 'Explorer', {}, 0)], active: 'guest', key: keyFor('guest'), mineKey: keyFor('guest'), player: false }, error: 'Your saved data could not be read. It has not been overwritten.' };
 }
}
export function saveBack(storage, save){
 const p = save.profiles[0], old = record(JSON.parse(storage.getItem(save.mineKey) || '{}'));
 const mine = { version: 1, completed: { ...record(old.completed), ...p.academy.completed }, checkpoint: p.academy.checkpoint, records: { ...record(old.records), ...p.records }, savedAt: Date.now() };
 if (!save.player) mine.xp = p.xp;
 storage.setItem(save.mineKey, JSON.stringify(mine));
 if (save.player) {
  const raw = record(JSON.parse(storage.getItem(save.key) || '{}'));
  if (Number.isFinite(p.xp) && p.xp > (Number(raw.xp) || 0)) { raw.xp = p.xp; raw.savedAt = Date.now(); storage.setItem(save.key, JSON.stringify(raw)); }
 }
}
