import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useGameStore, cityMonsters } from '../src/store/useGameStore';
import { walkable } from '../src/game/content';
import { natureLayout } from '../src/game/world/layout';
import { characterClip } from '../src/game/characterModels';
const S = () => useGameStore.getState();
// the capitals have no monsters: borrow Ashen Outskirts' first pack for the combat checks
const near = () => { if (!S().monsters.length) useGameStore.setState({ monsters: cityMonsters('wild0') }); const [px, pz] = S().player.position; useGameStore.setState(s => ({ monsters: s.monsters.map((m, i) => i === 0 ? { ...m, x: px, z: pz + 1.5, hp: 99999, maxHp: 99999 } : m), selectedMonster: s.monsters[0].id })); return S().monsters[0].id; };

test('Berserker basic attack chains Attack → Attack2 → Attack, emits floating numbers and builds Rage', () => {
  S().setJournal(false); useGameStore.setState(s => ({ rage: 0, player: { ...s.player, position: [0, -20] } })); const id = near();
  const clips: string[] = [], combos: number[] = [];
  for (let i = 0; i < 3; i++) { useGameStore.setState({ cooldowns: {} }); assert.equal(S().attack(id).hit, true); clips.push(S().action.clip!); combos.push(S().action.combo!); }
  assert.deepEqual(clips, ['Attack', 'Attack2', 'Attack']); assert.deepEqual(combos, [0, 1, 2]);
  const ev = S().combat.filter(e => e.on === 'monster'); assert.equal(ev.length, 3); assert.ok(ev.every(e => typeof e.value === 'number' && e.delay === 340));
  assert.equal(Math.round(S().rage), 24, '+8 Rage per landed basic attack');
});
test('skills cost Rage; the Whirlwind channel blocks other attacks and slows movement; locomotion is run-only', () => {
  useGameStore.setState({ rage: 0, cooldowns: {}, channel: null, pending: null }); const id = near();
  S().cast('skill'); assert.match(S().log[0], /Rage ไม่พอ/); assert.equal(S().rage, 0);
  useGameStore.setState({ rage: 10 }); S().cast('skill'); assert.equal(S().rage, 2, 'Rending Rush spends 8'); assert.ok((S().cooldowns['b-rending-rush'] ?? 0) > Date.now());
  useGameStore.setState(s => ({ rage: 100, cooldowns: {}, skillLevels: { ...s.skillLevels, 'b-whirlwind': 1 }, hotbar: { ...s.hotbar, special: 'b-whirlwind' } }));
  S().cast('special'); assert.ok(S().channel && S().channel!.until > Date.now(), 'channelling'); assert.equal(S().rage, 0);
  useGameStore.setState({ cooldowns: {} }); assert.equal(S().attack(id).hit, false, 'no basic attack while spinning');
  // an open stretch of the plaza so neither step is blocked
  const spot = ([[0, 2.2], [2, 2.2], [-4, 4], [6, -6], [0, -6]] as [number, number][]).find(([x, z]) => walkable('hollow', x, z) && walkable('hollow', x + 1, z))!;
  useGameStore.setState(s => ({ player: { ...s.player, cityId: 'hollow', position: spot } }));
  const x0 = S().player.position[0]; S().move(1, 0, .1); const slow = S().player.position[0] - x0;
  useGameStore.setState({ channel: null }); const x1 = S().player.position[0]; S().move(1, 0, .1); const normal = S().player.position[0] - x1;
  assert.ok(slow > 0 && Math.abs(slow / normal - 0.6) < 0.05, `moves at 60 % (${slow} vs ${normal})`);
  assert.equal(characterClip('idle', false, false, true, .5), 'Run');
});
test('Rage fades 5 per second after 5 s without gaining or spending', () => {
  useGameStore.setState({ rage: 50, rageAt: Date.now() - 6000, monsters: [], deadUntil: 0, pending: null, journal: false }); S().tick();
  assert.ok(S().rage < 50 && S().rage >= 48, String(S().rage));
  useGameStore.setState({ rage: 50, rageAt: Date.now() }); S().tick(); assert.equal(S().rage, 50, 'no decay right after combat');
});
test('trees, rocks and NPCs block movement (prop colliders registered for walkable)', () => {
  const t = natureLayout('wild1').trees[0]; assert.equal(walkable('wild1', t.x, t.z), false);
  assert.equal(walkable('hollow', 0, 0), false, 'compass dais at the plaza centre'); assert.equal(walkable('hollow', 0, 2.2), true, 'plaza walkway');
});
