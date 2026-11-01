// The three capitals (round 8 layout, world/capitalPlan.ts): walled squares with nothing to hunt inside, every service in
// every city, Dawnveil's canal crossed at its gates. world-links.test.ts covers the waygates, doors and reachability.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/game/world/registry';
import { walkable, inTown, WORLD_LIMIT, type MainCityId } from '../src/game/content';
import { advanceMonster } from '../src/game/monsterAI';
import { NPCS, NPC_SPOTS, npcsIn, npcPosition, nearNpc, npcHomes } from '../src/game/npcs';
import { CAPITAL_WALK, CANAL_IN, inCanal } from '../src/game/world/capitalPlan';
import { spawnPoints } from '../src/game/spawns';
import { npcSpriteId } from '../src/game/sprites/catalog';

const MAIN: MainCityId[] = ['hollow', 'dawnveil', 'thornwatch'];

test('every capital is walled at ±28; Dawnveil keeps a canal inside its walls, crossed on the way to each gate', () => {
  for (const c of MAIN) { assert.equal(WORLD_LIMIT[c], CAPITAL_WALK); assert.equal(walkable(c, 0, CAPITAL_WALK + 0.5), false); assert.equal(walkable(c, CAPITAL_WALK + 1, 0), false); }
  assert.ok(inCanal('dawnveil', 0, -(CANAL_IN + 1)) && !inCanal('hollow', 0, -(CANAL_IN + 1)));
  assert.equal(walkable('dawnveil', 0, -(CANAL_IN + 1.5)), false, 'canal');
  for (const [x, z] of [[25.8, 25.8], [-25.8, -25.8], [25.8, -25.8], [-25.8, 25.8]]) assert.equal(inCanal('dawnveil', x, z), false, `gate crossing ${x},${z}`);
});

test('NPC rosters: all nine services in every capital, Kestrel in Thornwatch, all with art and talkable', () => {
  const all = ['guide', 'mentor', 'merchant', 'shop', 'supplier', 'buyer', 'broker', 'blessing', 'warden'];
  for (const c of MAIN) assert.deepEqual(npcsIn(c).map(n => n.id).filter(id => all.includes(id)).sort(), [...all].sort(), c);
  assert.ok(NPC_SPOTS.thornwatch.ranger && !NPC_SPOTS.hollow.ranger && !NPC_SPOTS.dawnveil.ranger);
  assert.equal(npcsIn('wild0').length, 0);
  for (const n of NPCS) { assert.ok(npcHomes(n).length >= 1, n.id); assert.ok(npcSpriteId(n.name), `${n.name} has art`); }
  for (const c of MAIN) for (const n of npcsIn(c)) {
    const [x, z] = npcPosition(n, c);
    assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7]].some(([dx, dz]) => walkable(c, x + dx * 1.2, z + dz * 1.2)), `${c}: ${n.id} can be reached`);
    assert.ok(nearNpc(c, [x + 0.8, z + 0.8], n.service), `${c}: ${n.id} talkable`);
  }
});

test('no monster lives in a capital, and none steps over a capital wall', () => {
  for (const c of MAIN) assert.equal(spawnPoints(c).length, 0, c);
  const m = { id: 'x', name: 'Ash Hound', level: 3, x: 24.5, z: 0, hp: 10, maxHp: 10, home: [26, 0] as [number, number], lastAttack: 0 } as never;
  const r = advanceMonster(m, [26.5, 0], 'wild0', 1e9, 0); const mm = r.monster as unknown as { x: number; z: number };
  assert.equal(inTown('wild0', mm.x, mm.z), false, 'fields have no town');
});
