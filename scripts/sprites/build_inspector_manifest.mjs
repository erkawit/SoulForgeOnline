// Builds public/inspector/manifest.json for the sprite inspector (public/inspector/sprites.html).
// Reads the game's own registries, so the page always shows exactly what the game loads.
//   node --experimental-strip-types --no-warnings scripts/sprites/build_inspector_manifest.mjs
import { register } from 'node:module';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
register(pathToFileURL(path.join(ROOT, 'scripts/sprites/ts-hooks.mjs')).href, import.meta.url);
const src = (p) => import(pathToFileURL(path.join(ROOT, 'src', p)).href);

const catalog = await src('game/sprites/catalog.ts');
const { SPRITE_ANIMS, ANIM_ALIAS, animFor } = await src('game/sprites/anims.ts');
const { SPRITE_FRAMES } = await src('game/sprites/frames.ts');
const content = await src('game/content.ts');
const spawns = await src('game/spawns.ts');
const { NPCS } = await src('game/npcs.ts');
const { ZONES } = await src('game/world/zones.ts');

/** webp / png pixel size from the file header (no image library needed) */
function imageSize(file) {
  if (!existsSync(file)) return null;
  const b = readFileSync(file);
  if (b.toString('ascii', 0, 4) === 'RIFF') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (chunk === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
    if (chunk === 'VP8L') { const n = b.readUInt32LE(21); return [1 + (n & 0x3fff), 1 + ((n >> 14) & 0x3fff)]; }
  }
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  return null;
}

// ---------------------------------------------------------------- flipbook sheets
const sheets = {};
for (const [key, a] of Object.entries(SPRITE_ANIMS)) {
  const file = path.join(ROOT, 'public/art/anim', key + '.webp');
  sheets[key] = { ...a, url: `../art/anim/${key}.webp`, size: imageSize(file), exists: existsSync(file) };
}
// ---------------------------------------------------------------- single painted frames (still + shader rig actors)
const stills = {};
for (const [id, f] of Object.entries(SPRITE_FRAMES)) {
  const file = path.join(ROOT, 'public/art/sprites', id + '.webp');
  stills[id] = { ...f, url: `../art/sprites/${id}.webp`, exists: existsSync(file) };
}

function describe(id, role, extra = {}) {
  const def = catalog.actorDef(id), an = animFor(def.id);
  const clips = {};
  for (const [name, c] of Object.entries(def.clips ?? {})) if (c) clips[name] = { dur: c.dur, loop: !!c.loop, frames: [...new Set(c.keys.map(k => k.f).filter(Boolean))] };
  return { id, role, sheet: an?.key ?? null, base: def.base, kind: def.kind, facesLeft: !!def.facesLeft, stillClips: clips, ...extra };
}

const actors = [];
// classes (+ Reaver promotion uses Berserker art)
for (const cls of content.CLASS_IDS) actors.push(describe(catalog.heroId(cls, 'm'), 'class', { name: content.CLASS_NAME[cls], cls }));

// monsters: every species that can spawn anywhere, with the strongest role it appears in
const mobs = new Map();
const note = (name, level, elite, boss, where) => {
  const clean = name.replace(/\s*[—-]\s*elite$/i, '');
  const m = mobs.get(clean) ?? { name: clean, levels: [], elite: false, boss: false, normal: false, where: new Set() };
  m.levels.push(level); m.where.add(where);
  if (boss) m.boss = true; else if (elite) m.elite = true; else m.normal = true;
  mobs.set(clean, m);
};
for (const city of Object.keys(content.CITIES)) {
  try { for (const p of spawns.spawnPoints(city)) note(p.name, p.level, p.elite, p.boss, city); } catch (e) { console.warn("spawn", city, e.message); }
}
try { for (const p of spawns.sorrowlandSpawns()) note(p.name, p.level, p.elite, p.boss, 'sorrowland'); } catch {}
for (const z of ZONES) for (const s of z.spawns) note(s.species, s.level, !!s.elite, !!s.boss, 'wild0:' + z.id);
for (const m of mobs.values()) {
  const id = catalog.monsterSpriteId(m.name);
  const role = m.boss ? 'boss' : m.elite && !m.normal ? 'elite' : 'monster';
  actors.push(describe(id, role, { name: m.name, levels: [Math.min(...m.levels), Math.max(...m.levels)], where: [...m.where].slice(0, 6),
    alsoElite: m.elite && m.normal, fallback: catalog.slug(m.name) !== id }));
}
// NPCs
for (const n of NPCS) {
  const id = catalog.npcSpriteId(n.name);
  actors.push(id ? describe(id, 'npc', { name: n.name }) : { id: 'npc-' + catalog.slug(n.name), role: 'npc', name: n.name, sheet: null, base: null, missing: true });
}

const out = { built: new Date().toISOString(), sheets, stills, actors, alias: ANIM_ALIAS };
mkdirSync(path.join(ROOT, 'public/inspector'), { recursive: true });
writeFileSync(path.join(ROOT, 'public/inspector/manifest.json'), JSON.stringify(out));
const by = actors.reduce((m, a) => (m[a.role] = (m[a.role] ?? 0) + 1, m), {});
console.log('actors', by, 'sheets', Object.keys(sheets).length, 'stills', Object.keys(stills).length);
