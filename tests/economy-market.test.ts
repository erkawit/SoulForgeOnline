// Round 10: the player market, the mailbox and the inflation control, as pure rules (the realm commits them in one
// database transaction; see apps/game-server/test/market.e2e.test.ts and the SQL checks in docs/ROUND10_TH.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/game/world/registry';
import * as eco from '../src/game/economy/core';
import * as mkt from '../src/game/economy/market';
import { DEFAULT_CONFIG, mergeConfig, validateConfig } from '../src/game/balance/config';
import { listingFee, marketFloor, nextTax, saleSplit } from '../src/game/balance/market';
import { DEFAULT_SKILLS } from '../src/game/skills/defaults';
import { starterGear, starterPlayer } from '../src/lib/seed';
import type { Item } from '../src/lib/types';

let n = 0; const NOW = 1_800_000_000_000;
const ctx = (now = NOW): eco.Ctx => ({ config: DEFAULT_CONFIG, skills: DEFAULT_SKILLS, rng: Math.random, now, uuid: () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}` });
const fresh = (gold = 10_000) => { const s = eco.freshCharacter('Seller', 'Berserker', 'm', ctx(), { player: starterPlayer, gear: starterGear }); return { ...s, player: { ...s.player, gold } }; };
const info = (o: Partial<mkt.ListInfo> = {}): mkt.ListInfo => ({ active: 0, median: null, cancelsLastHour: 0, ...o });
const ore = (qty: number): Item => ({ id: `ore-${++n}`, definitionId: 'mat-ore', name: 'Soul Ore', rarity: 'Common', slot: null, family: 'material', bonuses: {}, description: '', qty });

test('listing: pays the fee up front, the item leaves the bag, the floor and the listing cap hold', () => {
  const s = fresh(), item = s.inventory[0]!, floor = marketFloor(item.rarity as never, item.enhance ?? 0, null, DEFAULT_CONFIG);
  const r = mkt.prepareList(s, item.id, floor + 100, info(), ctx(), { id: 'u1', name: 'Seller' });
  assert.ok(r.ok); if (!r.ok) return;
  assert.equal(r.state.inventory[0], null); assert.equal(r.listing.item.id, item.id);
  assert.equal(r.state.player.gold, s.player.gold - listingFee(floor + 100, DEFAULT_CONFIG));
  assert.equal(r.listing.expiresAt - NOW, DEFAULT_CONFIG.market.listingHours * 3_600_000);
  assert.equal(JSON.stringify(s.inventory[0]), JSON.stringify(item), 'input untouched');
  assert.equal(mkt.prepareList(s, item.id, floor - 1, info(), ctx(), { id: 'u1', name: '' }).ok, false, 'below the floor');
  assert.equal(mkt.prepareList(s, item.id, floor * 10, info({ median: floor * 100 }), ctx(), { id: 'u1', name: '' }).ok, false, 'below half the 7-day median');
  assert.equal(mkt.prepareList(s, item.id, floor, info({ active: DEFAULT_CONFIG.market.maxActiveListings }), ctx(), { id: 'u1', name: '' }).ok, false, 'listing cap');
  assert.equal(mkt.prepareList(fresh(0), item.id, floor, info(), ctx(), { id: 'u1', name: '' }).ok, false, 'cannot pay the fee');
  assert.equal(mkt.prepareList(s, 'nope', floor, info(), ctx(), { id: 'u1', name: '' }).ok, false, 'not in the bag (equipped gear is not listable)');
  assert.equal(mkt.prepareList(s, item.id, 1.5, info(), ctx(), { id: 'u1', name: '' }).ok, false, 'whole SoulGod only');
});

test('buying: not your own, not closed or expired, enough SoulGod, room in the bag; the tax is burned', () => {
  const seller = fresh(), item = seller.inventory[0]!;
  const lr = mkt.prepareList(seller, item.id, 1000, info(), ctx(), { id: 'u1', name: 'Seller' }); assert.ok(lr.ok); if (!lr.ok) return; const l = lr.listing;
  const buyer = { ...fresh(5000), inventory: Array(eco.BAG_SIZE).fill(null) };
  const r = mkt.prepareBuy(buyer, l, 'u2', 0.06, ctx());
  assert.ok(r.ok); if (!r.ok) return;
  assert.equal(r.state.player.gold, 4000); assert.equal(r.seller + r.burned, 1000); assert.equal(r.burned, 60);
  assert.equal(r.state.inventory.find(i => i?.id === item.id)?.id, item.id);
  assert.equal(mkt.prepareBuy(buyer, l, 'u1', 0.06, ctx()).ok, false, 'own listing');
  assert.equal(mkt.prepareBuy(buyer, { ...l, status: 'sold' }, 'u2', 0.06, ctx()).ok, false, 'sold');
  assert.equal(mkt.prepareBuy(buyer, l, 'u2', 0.06, ctx(l.expiresAt)).ok, false, 'expired');
  assert.equal(mkt.prepareBuy({ ...buyer, player: { ...buyer.player, gold: 999 } }, l, 'u2', 0.06, ctx()).ok, false, 'not enough SoulGod');
  const full = { ...buyer, inventory: Array.from({ length: eco.BAG_SIZE }, () => ore(1)) };
  assert.equal(mkt.prepareBuy(full, l, 'u2', 0.06, ctx()).ok, false, 'bag full');
  assert.deepEqual(saleSplit(1000, DEFAULT_CONFIG, 0.12), { seller: 880, burned: 120 });
});

test('stackables join a stack; cancelling returns the item, keeps the fee, and is rate limited', () => {
  const inv: (Item | null)[] = Array(eco.BAG_SIZE).fill(null); inv[3] = ore(5);
  const placed = mkt.placeItem(inv, ore(7))!; assert.equal(placed[3]!.qty, 12); assert.equal(placed.filter(Boolean).length, 1);
  const seller = fresh(), item = seller.inventory[0]!, lr = mkt.prepareList(seller, item.id, 500, info(), ctx(), { id: 'u1', name: '' });
  assert.ok(lr.ok); if (!lr.ok) return;
  const c = mkt.prepareCancel(lr.state, lr.listing, 'u1', 0, ctx()); assert.ok(c.ok); if (!c.ok) return;
  assert.ok(c.state.inventory.some(i => i?.id === item.id)); assert.equal(c.state.player.gold, lr.state.player.gold, 'fee not refunded');
  assert.equal(mkt.prepareCancel(lr.state, lr.listing, 'u2', 0, ctx()).ok, false, 'not yours');
  assert.equal(mkt.prepareCancel(lr.state, lr.listing, 'u1', DEFAULT_CONFIG.market.cancelsPerHour, ctx()).ok, false, 'cancel limit');
});

test('mail: all the SoulGod, the items that fit; nothing to claim is refused', () => {
  const s = { ...fresh(100), inventory: [...Array.from({ length: eco.BAG_SIZE - 1 }, () => ore(1)), null] as (Item | null)[] };
  s.inventory[0] = { ...s.inventory[0]!, definitionId: 'mat-other', family: 'material' };
  const sword = { ...starterGear, id: 'gear-1' }, shield = { ...starterGear, id: 'gear-2' };
  const mails: mkt.Mail[] = [{ id: 'm1', kind: 'sale', gold: 940, item: null, note: '', createdAt: 1 }, { id: 'm2', kind: 'return', gold: 0, item: sword, note: '', createdAt: 2 }, { id: 'm3', kind: 'return', gold: 0, item: shield, note: '', createdAt: 3 }];
  const r = mkt.prepareClaim(s, mails); assert.ok(r.ok); if (!r.ok) return;
  assert.deepEqual(r.claimed, ['m1', 'm2'], 'the second item waits for a free slot'); assert.equal(r.state.player.gold, 1040);
  assert.equal(mkt.prepareClaim(s, []).ok, false);
});

test('inflation control: tax rises when SoulGod grows too fast, falls when it shrinks, stays in range, needs history', () => {
  const days = (start: number, k: number, count = 8) => Array.from({ length: count }, (_, i) => ({ day: new Date(Date.UTC(2026, 9, 1 + i)).toISOString().slice(0, 10), supply: start * Math.pow(k, i) }));
  const base = DEFAULT_CONFIG.market.salesTaxPct;
  assert.equal(nextTax(base, days(1e6, 1.0, 2)).growth, null, 'not enough days');
  const hot = nextTax(base, days(1e6, 1.05)); assert.ok(hot.rate > base && hot.rate - base <= DEFAULT_CONFIG.market.inflation.maxDailyStep + 1e-9, `hot economy → higher tax (${hot.rate})`);
  const cold = nextTax(base, days(1e6, 0.98)); assert.ok(cold.rate < base, 'shrinking supply → lower tax');
  const calm = nextTax(base, days(1e6, Math.pow(1.01, 1 / 7))); assert.ok(Math.abs(calm.rate - base) < 1e-3, 'on target → about the same');
  let r = base; for (let i = 0; i < 100; i++) r = nextTax(r, days(1e6, 1.2)).rate; assert.equal(r, DEFAULT_CONFIG.market.taxMax);
  for (let i = 0; i < 100; i++) r = nextTax(r, days(1e6, 0.8)).rate; assert.equal(r, DEFAULT_CONFIG.market.taxMin);
  const off = mergeConfig(DEFAULT_CONFIG, { market: { inflation: { enabled: false } } }); assert.equal(nextTax(0.07, days(1e6, 1.5), off).rate, 0.07);
});

test('market config: defaults are valid and bad admin values are caught', () => {
  assert.deepEqual(validateConfig(DEFAULT_CONFIG), []);
  assert.ok(validateConfig(mergeConfig(DEFAULT_CONFIG, { market: { taxMin: 0.2, taxMax: 0.1 } })).length > 0);
  assert.ok(validateConfig(mergeConfig(DEFAULT_CONFIG, { market: { listingFeePct: 0.5 } })).length > 0);
});
