import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as eco from '../src/game/economy/core';
import type { Item } from '../src/lib/types';

const bag = (n: number, items: (Item | null)[] = []) => eco.sizedBag(items, n);
const st = (gold: number, slots?: number) => ({ player: { gold, bagSlots: slots, level: 1, position: [0, 0] }, inventory: bag(slots ?? 200), drops: [] }) as never;

test('bag: 200 slots to start, +10 per 100,000 SG, never past 300', () => {
  assert.equal(eco.BAG_START, 200); assert.equal(eco.bagSlotsOf({ player: {} }), 200);
  const r = eco.expandBag(st(250_000)); assert.ok(r.ok);
  const s1 = (r as { state: { inventory: unknown[]; player: { gold: number; bagSlots: number } } }).state;
  assert.equal(s1.player.bagSlots, 210); assert.equal(s1.inventory.length, 210); assert.equal(s1.player.gold, 150_000);
  assert.equal(eco.expandBag(st(99_999)).ok, false);
  assert.equal(eco.expandBag(st(1e9, 300)).ok, false);
  assert.equal(eco.sizedBag(new Array(24).fill(null), 200).length, 200);
});
test('weight: gear and stacks add up; over the limit loot stays on the ground', () => {
  const armor = { id: 'a', slot: 'armor' } as Item, pots = { id: 'p', family: 'consumable', qty: 10 } as Item;
  assert.equal(eco.bagWeight([armor, pots, null]), 14);
  const heavy = Array.from({ length: 40 }, (_, i) => ({ id: 'h' + i, slot: 'armor' }) as Item); // 480 > 410 at Lv 1
  const s = { player: { level: 1, position: [0, 0] }, inventory: bag(200, heavy), drops: [{ id: 'd', x: 0, z: 0, item: { id: 'x', slot: 'boots' } }] } as never;
  const r = eco.pickup(s, 'd'); assert.equal(r.ok, false);
});
