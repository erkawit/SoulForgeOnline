import test from 'node:test';
import assert from 'node:assert/strict';
import { lootDiff } from '../src/game/eventLog';
import type { Item, Loot } from '../src/lib/types';

const it = (id: string, qty?: number): Item => ({ id, name: id, rarity: 'Common', slot: null, bonuses: {}, description: '', ...(qty ? { qty } : {}) } as Item);
const drop = (id: string, item: Item): Loot => ({ id, x: 0, z: 0, item });

test('loot diff: new ground drops and bag gains count, old drops and pickups do not', () => {
  const potion = it('pot', 2), sword = it('sw');
  const before = { drops: [drop('d1', sword)], inventory: [potion, null] };
  const after = { drops: [drop('d1', sword), drop('d2', it('ring'))], inventory: [{ ...potion, qty: 5 }, it('shard', 3)] };
  const got = lootDiff(before, after).map(x => `${x.item.id}×${x.qty}`).sort();
  assert.deepEqual(got, ['pot×3', 'ring×1', 'shard×3']);
  assert.deepEqual(lootDiff(before, { ...before, drops: [] }), []);
});
