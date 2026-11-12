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

import { catOf, priceStats, MemoryMarket } from '../apps/game-server/src/market';
import { MemoryRepo } from '../apps/game-server/src/characters';
import { chestTier } from '../src/game/fx/lootChest';

test('exchange: categories, unit-price stats, filtered and sorted browse', async () => {
  assert.equal(catOf({ slot: 'weapon' }), 'weapon'); assert.equal(catOf({ slot: 'boots' }), 'armor'); assert.equal(catOf({ slot: 'ring' }), 'accessory');
  assert.equal(catOf({ slot: null, family: 'consumable' }), 'consumable'); assert.equal(catOf({ slot: null, family: 'material' }), 'material');
  const now = 10 * 86_400_000, day = 86_400_000;
  const st = priceStats([{ price: 100, qty: 1, closedAt: now - 2 * day }, { price: 300, qty: 1, closedAt: now - 3600_000 }, { price: 999, qty: 1, closedAt: now - 9 * day }], now);
  assert.deepEqual(st, { week: 200, yesterday: 300, last: 300, sold7d: 2 });
  const m = new MemoryMarket(new MemoryRepo());
  const mk = (id: string, slot: string | null, price: number, enhance = 0) => m.listings.set(id, { id, seller: 's', sellerName: 'S', item: { id, name: id, rarity: 'Rare', slot, bonuses: {}, description: '' } as never,
    definitionId: id, rarity: 'Rare', enhance, qty: 1, price, fee: 0, createdAt: price, expiresAt: now + day, status: 'active' });
  mk('sword', 'weapon', 500, 7); mk('axe', 'weapon', 200); mk('boots', 'boots', 50);
  assert.deepEqual((await m.browse({ page: 0, cat: 'weapon', sort: 'price' }, now)).map(l => l.id), ['axe', 'sword']);
  assert.deepEqual((await m.browse({ page: 0, enhMin: 5 }, now)).map(l => l.id), ['sword']);
});

test('loot chests: rarity → tier 1–8', () => {
  assert.equal(chestTier('Common'), 1); assert.equal(chestTier('Legendary'), 5); assert.equal(chestTier('Pre-arch'), 7); assert.equal(chestTier('Arch'), 8); assert.equal(chestTier('??'), 1);
});
