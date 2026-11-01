import test from 'node:test';
import assert from 'node:assert/strict';
import { ForgeFire, FORGE } from '../src/game/ui/forgeFire';
import { optionRange, rollQuality, compareDerived } from '../src/game/ui/itemInfo';
import { layoutConstellation } from '../src/game/ui/constellation';
import { buildStatus, diffStatus } from '../src/game/ui/statusSchema';
import { deriveCharacter } from '../src/game/balance/stats';
import { DEFAULT_CONFIG } from '../src/game/balance/config';
import { DEFAULT_SKILLS } from '../src/game/skills/defaults';

test('forge fire: hits stoke it, it holds, then cools to zero', () => {
  const f = new ForgeFire(); f.hit('hit'); f.hit('crit'); f.hit('skill'); assert.equal(f.value, FORGE.hit + FORGE.crit + FORGE.skill);
  f.update(FORGE.holdSec - 0.1); assert.equal(f.value, 9); f.update(1); assert.ok(f.value < 9); f.update(60); assert.equal(f.value, 0);
  for (let i = 0; i < 80; i++) f.hit('crit'); assert.equal(f.value, FORGE.max); assert.equal(f.heat, 3);
});
test('tooltip layer 2: option ranges and roll quality follow the rarity rules', () => {
  assert.deepEqual(optionRange('Rare', { kind: 'attr', stat: 'str', value: 2 }), [1, 2]);
  assert.equal(rollQuality('Rare', { kind: 'attr', stat: 'str', value: 2 }), 1);
  const [lo, hi] = optionRange('God', { kind: 'special', stat: 'atkPct', value: 4 }); assert.deepEqual([lo, hi], [3, 5]);
  assert.equal(rollQuality('God', { kind: 'special', stat: 'atkPct', value: 4 }), 0.5);
  const a = deriveCharacter('Berserker', 10, []), b = deriveCharacter('Berserker', 10, [{ bonuses: { atk: 40 } }]);
  const rows = compareDerived(a, b); assert.ok(rows.find(r => r.key === 'attack' && r.delta > 0)); assert.ok(!rows.find(r => r.key === 'maxMp'));
});
test('constellation: every tree node gets a star and a link back toward the core', () => {
  for (const cls of ['Berserker'] as const) {
    const tree = DEFAULT_SKILLS.trees[cls], m = layoutConstellation(tree);
    assert.equal(m.nodes.length, tree.length); for (const n of tree) assert.ok(m.links.some(([, b]) => b === n.skillId), `${cls} ${n.skillId} linked`);
    assert.ok(m.links.some(([a]) => a === 'core'));
  }
});
test('status compare: equipping more ATK shows a positive attack delta only where it changes', () => {
  const base = DEFAULT_CONFIG.classes.Berserker.base, now = buildStatus(deriveCharacter('Berserker', 10, []), base), after = buildStatus(deriveCharacter('Berserker', 10, [{ bonuses: { atk: 40 } }]), base);
  const d = diffStatus(now, after); assert.ok((d.get('offense:attack') ?? 0) > 0); assert.equal(d.has('defense:maxHp'), false);
});
