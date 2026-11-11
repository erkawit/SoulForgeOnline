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
