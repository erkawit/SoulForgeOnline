import { test } from 'node:test';
import assert from 'node:assert/strict';
import { samePlayerIgnoringPosition } from '../src/store/usePlayerStatic';
import { groundY } from '../src/game/content';

const base = { name: 'a', level: 3, hp: 10, mp: 5, exp: 1, gold: 9, classId: 'Paladin', position: [0, 0] } as never as Parameters<typeof samePlayerIgnoringPosition>[0];

test('walking alone does not count as a player change for the HUD', () => {
  assert.equal(samePlayerIgnoringPosition(base, { ...base, position: [3, 4] } as typeof base), true);
});
test('any other field change is still seen', () => {
  assert.equal(samePlayerIgnoringPosition(base, { ...base, hp: 9 } as typeof base), false);
  assert.equal(samePlayerIgnoringPosition(base, { ...base, gold: 10, position: [1, 1] } as typeof base), false);
});
test('actors stand on the field floor (0.115 m) in fields and on 0 in capitals', () => {
  assert.equal(groundY('hollow'), 0);
  assert.ok(groundY('wild0') >= 0.115 && groundY('wild0') < 0.2);
});

test('a Rune Master never keeps another class on the hotbar (R / T / X showed Assassin skills)', async () => {
  const { classExtraHotbar, classHotbar, EXTRA_SLOTS } = await import('../src/store/useGameStore');
  assert.deepEqual(classExtraHotbar('RuneMaster', ['s-fan-of-blades', 's-cripple', 's-death-lotus']), EXTRA_SLOTS.RuneMaster);
  assert.deepEqual(classExtraHotbar('RuneMaster', ['r2-ruin-pillar', null, 'nope']), ['r2-ruin-pillar', EXTRA_SLOTS.RuneMaster[1], EXTRA_SLOTS.RuneMaster[2]]);
  assert.equal((classHotbar('RuneMaster', { skill: 's-twin-fang' }).skill ?? '').startsWith('r2-'), true);
});
