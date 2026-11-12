import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wantsLoot, defaultAuto } from '../src/game/auto';

test('AUTO loot filter: materials always, gear by ticked grade and + level', () => {
  const a = { ...defaultAuto('Paladin'), lootRarities: ['Rare', 'Epic'], lootMinEnhance: 2 };
  assert.equal(wantsLoot(a, { slot: null, rarity: 'Common' }), true, 'ore / potions / food');
  assert.equal(wantsLoot(a, { slot: 'weapon', rarity: 'Common', enhance: 5 }), false, 'grade not ticked');
  assert.equal(wantsLoot(a, { slot: 'weapon', rarity: 'Rare', enhance: 1 }), false, 'below +2');
  assert.equal(wantsLoot(a, { slot: 'weapon', rarity: 'Epic', enhance: 3 }), true);
  assert.equal(wantsLoot(defaultAuto('Paladin'), { slot: 'armor', rarity: 'Arch' }), true, 'default takes every grade');
});

test('the loot magnet collects a drop several metres away; the default reach does not', async () => {
  const eco = await import('../src/game/economy/core');
  const base = { player: { position: [0, 0] as [number, number] }, inventory: [null, null], drops: [{ id: 'd1', x: 8, z: 0, item: { id: 'i1', definitionId: 'ore', name: 'Ore', rarity: 'Common', stackable: true, qty: 1 } }] } as never;
  assert.equal(eco.pickup(base, 'd1').ok, false);
  const r = eco.pickup(base, 'd1', 9) as { ok: boolean; state?: { drops: unknown[] } };
  assert.equal(r.ok, true);
});
