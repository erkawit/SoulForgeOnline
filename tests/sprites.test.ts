import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { SPRITE_FRAMES } from '../src/game/sprites/frames';
import { actorDef, heroId, monsterSpriteId, npcSpriteId } from '../src/game/sprites/catalog';
import { NPCS } from '../src/game/npcs';
import { CLASS_IDS } from '../src/game/content';

test('every hero clip (male + female) points at painted frames that ship in public/', () => {
  for (const cls of CLASS_IDS) for (const g of ['m', 'f'] as const) {
    const d = actorDef(heroId(cls, g)); assert.ok(SPRITE_FRAMES[d.base], d.base);
    for (const [name, c] of Object.entries(d.clips)) {
      assert.ok(c && c.dur > 0 && c.keys.length > 0, `${d.id} ${name}`);
      for (const k of c!.keys) if (k.f) assert.ok(SPRITE_FRAMES[k.f], `${d.id} ${name} → ${k.f}`);
      assert.ok(c!.keys.every((k, i, a) => i === 0 || k.t >= a[i - 1].t), `${d.id} ${name} keys sorted`);
    }
    for (const c of ['Attack', 'Attack2', 'Skill', 'Buff', 'Special', 'Channel']) assert.ok(d.clips[c], `${d.id} has ${c}`);
  }
  for (const f of Object.keys(SPRITE_FRAMES)) assert.ok(existsSync(`public/art/sprites/${f}.webp`), f);
});
test('monsters and town NPCs all resolve to art', () => {
  for (const n of ['Grave Crawler', 'Ash Hound', 'Bone Sentinel', 'Grave Marshal', 'Crypt Crawler — Elite', 'Abyssal Forge Titan', 'Unknown Thing'])
    assert.ok(SPRITE_FRAMES[monsterSpriteId(n)], n);
  for (const n of NPCS) assert.ok(npcSpriteId(n.name), n.name);
  assert.equal(monsterSpriteId('Crypt Crawler — Elite'), 'crypt-crawler');
});
test('sprite sizes stay in the compact 3-head range', () => {
  for (const cls of CLASS_IDS) { const f = SPRITE_FRAMES[actorDef(heroId(cls, 'm')).base]; assert.ok(f.h > 1.3 && f.h < 1.9, `${cls} ${f.h}`); assert.ok(f.fy < 0.05); }
});
