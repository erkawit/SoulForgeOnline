// Round 8: the capitals follow the mmorpg-world-assets city maps; four corner waygates link each capital to its fields,
// every NPC stands at the door of their building, and every door, gate and arrival point can be walked to.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/game/world/registry';
import { CITIES, CAPITAL_GATES, DUNGEON_IDS, FIELD_ART, ZONE_IDS, arrivalPoint, fieldGate, gateTo, homePoint, inTown, nearPortal, portalsOf, walkable, WORLD_LIMIT, type CityId, type MainCityId } from '../src/game/content';
import { CAPITAL_HALF, CAPITAL_PIECES, CAPITAL_SPAWN, GATE_POS, GATE_TRIGGER, OPPOSITE, ROLES, buildingOf, doorSpot, mapToWorld, viewIndex, worldToMap, ISO_YAW, faceYaw, type GateDir } from '../src/game/world/capitalPlan';
import { KIT_ART, KIT_CELL, KIT_PAD } from '../src/game/world/kitArt';
import { NPC_SPOTS, npcsIn, npcPosition, nearNpc } from '../src/game/npcs';
import { spawnPoints, huntingGrounds } from '../src/game/spawns';

const MAIN: MainCityId[] = ['hollow', 'dawnveil', 'thornwatch'];

/** flood fill on a 0.5 m grid from `from` with a 0.35 m body: the set of reachable cells */
function reach(city: CityId, from: [number, number]) {
  const seen = new Set<string>(), q: [number, number][] = [[Math.round(from[0] * 2), Math.round(from[1] * 2)]], lim = (WORLD_LIMIT[city] ?? 23) * 2;
  while (q.length) {
    const [a, b] = q.pop()!, k = a + ',' + b; if (seen.has(k) || Math.abs(a) > lim || Math.abs(b) > lim || !walkable(city, a / 2, b / 2)) continue;
    seen.add(k); q.push([a + 1, b], [a - 1, b], [a, b + 1], [a, b - 1]);
  }
  return (x: number, z: number, r = 1) => { for (let a = Math.round((x - r) * 2); a <= Math.round((x + r) * 2); a++) for (let b = Math.round((z - r) * 2); b <= Math.round((z + r) * 2); b++) if (seen.has(a + ',' + b)) return true; return false; };
}

test('map ↔ world calibration: the four waygates of each painted map land on the corners', () => {
  for (const c of MAIN) for (const d of Object.keys(GATE_POS) as GateDir[]) {
    const [x, z] = GATE_POS[d], [u, v] = worldToMap(c, x, z), [x2, z2] = mapToWorld(c, u, v);
    assert.ok(Math.hypot(x - x2, z - z2) < 1e-9, `${c} ${d} round trip`);
  }
  const [u, v] = worldToMap('hollow', ...GATE_POS.top); assert.ok(Math.abs(u - 0.5) < 1e-9 && v < 0.1, 'top gate at the top of the map');
  const [u2] = worldToMap('hollow', ...GATE_POS.left); assert.ok(u2 < 0.1, 'left gate on the left');
});

test('the eight painted views: front at the default camera for a south-facing building, turning one view per 45°', () => {
  assert.equal(viewIndex(ISO_YAW, faceYaw('S')), 0); assert.equal(viewIndex(ISO_YAW, faceYaw('SW')), 1); assert.equal(viewIndex(ISO_YAW, faceYaw('SE')), 7);
  assert.equal(viewIndex(ISO_YAW + Math.PI, faceYaw('S')), 4);
  for (const c of MAIN) for (const p of CAPITAL_PIECES[c]) if (p.piece) {
    assert.equal(KIT_ART[c][p.piece]?.length, 8, `${c}/${p.piece} has eight views`);
    for (const [w, h] of KIT_ART[c][p.piece]) assert.ok(w > 20 && h > 20, `${c}/${p.piece} view size`);
    const [cw, ch] = KIT_CELL[c][p.piece]; // the atlas cell holds every view with the gutter around it
    for (const [w, h] of KIT_ART[c][p.piece]) assert.ok(w + 2 * KIT_PAD <= cw && h + 2 * KIT_PAD <= ch, `${c}/${p.piece} fits its atlas cell`);
  }
});

test('nine service buildings per capital, one per role, inside the walls and apart from each other', () => {
  for (const c of MAIN) {
    const b = CAPITAL_PIECES[c].filter(p => p.role); assert.deepEqual(b.map(p => p.role).sort(), [...ROLES].sort());
    for (const p of b) assert.ok(Math.max(Math.abs(p.x), Math.abs(p.z)) + p.r < CAPITAL_HALF - 0.5, `${c} ${p.role} inside the walls`);
    for (const p of b) for (const q of b) if (p !== q) assert.ok(Math.hypot(p.x - q.x, p.z - q.z) > p.r + q.r + 2, `${c}: ${p.role} / ${q.role} leave a street`);
    assert.equal(walkable(c, buildingOf(c, 'blessing').x, buildingOf(c, 'blessing').z), false, 'buildings block');
  }
});

test('every NPC waits at the door of their own building, on the camera side, and can be reached and talked to', () => {
  for (const c of MAIN) {
    const ok = reach(c, CAPITAL_SPAWN);
    assert.ok(npcsIn(c).length >= 9, `${c}: all nine services`);
    for (const r of ROLES) {
      const n = npcsIn(c).find(x => x.id === r)!, [x, z] = npcPosition(n, c), b = buildingOf(c, r);
      assert.deepEqual([x, z], doorSpot(c, r)); assert.deepEqual(NPC_SPOTS[c][r], [x, z]);
      assert.ok(Math.hypot(x - b.x, z - b.z) < b.r + 2.2, `${c} ${r} by the building`);
      assert.ok((x - b.x) * Math.sin(b.facing) + (z - b.z) * Math.cos(b.facing) > 0, `${c} ${r} in front of the door`);
      assert.ok(ok(x, z, 1.4), `${c}: ${r} reachable from the plaza`);
      assert.ok(nearNpc(c, [x + 1, z + 1], n.service) || nearNpc(c, [x - 1, z + 1], n.service), `${c}: ${r} talkable`);
    }
  }
  assert.ok(NPC_SPOTS.thornwatch.ranger && npcsIn('thornwatch').some(n => n.id === 'ranger'));
  assert.equal(npcsIn('wild0').length, 0);
});

test('capital waygates: one field per gate, reachable, triggers inside the walls; nobody arrives inside a wall or a yard', () => {
  for (const c of MAIN) {
    const ok = reach(c, CAPITAL_SPAWN);
    assert.ok(walkable(c, ...CAPITAL_SPAWN), `${c} spawn`);
    for (const p of portalsOf(c)) {
      assert.ok(ok(p.x, p.z, GATE_TRIGGER - 0.4), `${c} → ${p.to} gate reachable`);
      const a = arrivalPoint(p.to, c); assert.ok(walkable(c, ...a), `${c}: arrival from ${p.to} walkable`);
      assert.ok(Math.hypot(a[0] - p.x, a[1] - p.z) > GATE_TRIGGER + 0.5, `${c}: arriving from ${p.to} does not warp straight back`);
      assert.ok(ok(a[0], a[1], 0.5), `${c}: arrival from ${p.to} connected to the plaza`);
    }
  }
  // every field hangs off exactly one gate
  for (const z of ZONE_IDS) { const g = fieldGate(z); assert.ok(g, `${z} has a gate`); assert.equal(CITIES[z].parent, g!.city, `${z} gate in its own region`); }
  const targets = MAIN.flatMap(c => Object.values(CAPITAL_GATES[c])); assert.equal(new Set(targets).size, targets.length, 'no two gates lead to the same map');
});

test('fields: the way home faces the capital, the dungeon door is at the far end of the field above each capital', () => {
  for (const z of ZONE_IDS) {
    const g = fieldGate(z)!, ps = portalsOf(z), home = ps.find(p => p.to === g.city)!;
    assert.ok(home, `${z} leads home`); assert.equal(home.dir, OPPOSITE[g.dir], `${z}: left by the ${g.dir} gate, enter from the ${OPPOSITE[g.dir]}`);
    const ok = reach(z, arrivalPoint(g.city, z));
    for (const p of ps) { assert.ok(ok(p.x, p.z, 1.6), `${z}: waygate to ${p.to} reachable`); assert.ok(walkable(z, ...arrivalPoint(p.to, z)), `${z}: arrival from ${p.to}`); }
    for (const s of spawnPoints(z)) for (const p of ps) assert.ok(Math.hypot(s.position[0] - p.x, s.position[1] - p.z) >= 7.5, `${z}: ${s.id} not camping the waygate`);
    assert.ok(nearPortal(z, ...arrivalPoint(g.city, z)), `${z}: arrival is a safe spot`);
  }
  for (const d of DUNGEON_IDS) {
    const e = CITIES[d].entrance!, g = fieldGate(e)!; assert.equal(g.dir, 'top', `${d} is reached from the field above its capital`);
    const door = portalsOf(e).find(p => p.to === d)!; assert.equal(door.dir, 'top', `${d} door at the far end`);
    assert.ok(portalsOf(d).some(p => p.to === e), `${d} leads back`);
  }
  assert.equal(CITIES.dungeon2.entrance, 'wild5');
});

test('round trips: out through a gate and back lands you at that same gate', () => {
  for (const c of MAIN) for (const [d, to] of Object.entries(CAPITAL_GATES[c]) as [GateDir, CityId][]) {
    if (!CITIES[to].parent) continue;
    const back = arrivalPoint(to, c), [gx, gz] = GATE_POS[d]; assert.ok(Math.hypot(back[0] - gx, back[1] - gz) < 9, `${c} ${d}: back at the ${d} gate`);
    assert.equal(gateTo(c, to), d);
  }
  assert.deepEqual(homePoint('hollow'), CAPITAL_SPAWN);
});

test('no monsters in the capitals; the Sorrowlands live in Ashen Outskirts below Hollow Reach', () => {
  for (const c of MAIN) { assert.equal(spawnPoints(c).length, 0, c); assert.ok(inTown(c, 20, -20)); }
  const s = spawnPoints('wild0'); assert.ok(s.some(p => p.id.includes('-z-')), 'Sorrowlands spawns'); assert.equal(WORLD_LIMIT.wild0, 70);
  assert.ok(s.every(p => walkable('wild0', ...p.position) || p.id.includes('-z-')));
  for (const c of MAIN) assert.equal(huntingGrounds(c).length, portalsOf(c).filter(p => p.kind === 'field').length, `${c}: the ranger lists the fields`);
  for (const id of [...ZONE_IDS, ...DUNGEON_IDS]) assert.ok(FIELD_ART[id], `${id} has its painting`);
});
test('round 13: the capitals are doubled — room for crowds, districts dressed, every door and gate still reachable', () => {
  for (const c of MAIN) {
    const fill = CAPITAL_PIECES[c].filter(p => !p.role && (p.piece === 'tree' || p.piece === 'crate'));
    assert.ok(fill.length >= 20, `${c} districts dressed (${fill.length})`);
    for (const p of fill) assert.ok(walkable(c, p.x + p.r + 2.5, p.z) || walkable(c, p.x - p.r - 2.5, p.z), `${c} ${p.piece} at ${p.x},${p.z} leaves a way past`);
    const roles = CAPITAL_PIECES[c].filter(p => p.role);
    for (const a of roles) for (const b of roles) if (a !== b) assert.ok(Math.hypot(a.x - b.x, a.z - b.z) > a.r + b.r + 6, `${c}: ${a.role} / ${b.role} wide streets`);
    assert.ok(CAPITAL_HALF > 55, 'twice the old 29.5 m');
  }
});
