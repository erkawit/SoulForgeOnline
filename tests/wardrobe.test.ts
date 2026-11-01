// Round 12: wardrobe reducers, cash-shop / coupon delivery by realm mail, and the SG shop no longer selling costumes.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as eco from '../src/game/economy/core';
import { prepareClaim, type Mail } from '../src/game/economy/market';
import { FASHION, mergeFashion, outfitSprite, overlays } from '../src/game/fashion';
import { partyExpBonus, partyStatus } from '../src/game/balance/party';
import { coverage, tr } from '../src/game/i18n';

test('wearing needs ownership; outfit swaps the sprite, wings become an overlay', () => {
  const s0 = { player: { gold: 0 }, inventory: [], wardrobe: { owned: [], worn: {} } } as unknown as eco.CharState;
  assert.equal(eco.wearFashion(s0, 'costume-thai-white-gold').ok, false);
  const s1 = eco.grantFashion(s0, ['costume-thai-white-gold', 'wings-dawn']);
  const r = eco.wearFashion(s1, 'costume-thai-white-gold'); assert.ok(r.ok); const s2 = (r as { state: eco.CharState }).state;
  const r2 = eco.wearFashion(s2, 'wings-dawn'); assert.ok(r2.ok); const s3 = (r2 as { state: eco.CharState }).state;
  assert.equal(outfitSprite(s3.wardrobe), 'thai'); assert.deepEqual(overlays(s3.wardrobe).map(f => f.id), ['wings-dawn']);
  const off = eco.takeOffFashion(s3, 'outfit'); assert.equal(outfitSprite((off as { state: eco.CharState }).state.wardrobe), null);
});
test('the Thai outfit is a 349-baht cash item; the SoulGod shop refuses it', () => {
  assert.equal(FASHION.find(f => f.id === 'costume-thai-white-gold')?.priceTHB, 349);
  const s = { player: { gold: 9e9, cityId: 'hollow', position: [0, 0] }, inventory: Array(40).fill(null) } as unknown as eco.CharState;
  const r = eco.buyCatalog(s, 'costume-thai-white-gold', { now: 0 } as never); assert.equal(r.ok, false);
});
test('back-office fashion rows merge over the built-in list; bad rows are dropped', () => {
  const list = mergeFashion([{ id: 'cape-night', slot: 'cape', name: 'Night Cape', priceTHB: 129 }, { id: 'x', slot: 'nope', name: 'bad' }]);
  assert.ok(list.find(f => f.id === 'cape-night')); assert.ok(!list.find(f => f.id === 'x')); assert.ok(list.find(f => f.id === 'costume-thai-white-gold'));
});
test('a cash order / coupon mail puts the piece in the wardrobe without using a bag slot', () => {
  const s = { player: { gold: 10 }, inventory: Array(4).fill({ id: 'x', definitionId: 'hp-potion', name: 'x', rarity: 'Common' }), wardrobe: { owned: [], worn: {} } } as unknown as eco.CharState;
  const mail: Mail[] = [{ id: 'm1', kind: 'shop', gold: 0, item: null, note: '', createdAt: 0, fashion: 'costume-thai-white-gold' }, { id: 'm2', kind: 'coupon', gold: 500, item: null, note: '', createdAt: 0, fashion: null }];
  const r = prepareClaim(s, mail); assert.ok(r.ok); const st = (r as { state: eco.CharState }).state;
  assert.deepEqual(st.wardrobe?.owned, ['costume-thai-white-gold']); assert.equal(st.player.gold, 510);
});
test('party EXP: 2→+25 % … 5→+100 %; far / other-map members do not count', () => {
  assert.deepEqual([1, 2, 3, 4, 5].map(partyExpBonus), [0, 0.25, 0.5, 0.75, 1]);
  const v = partyStatus([{ id: 'a', self: true, sameMap: true, dist: 0 }, { id: 'b', sameMap: true, dist: 10 }, { id: 'c', sameMap: true, dist: 80 }, { id: 'd', sameMap: false, dist: 0 }] as never);
  assert.equal(v.near, 2); assert.equal(v.bonus, 0.25); assert.equal(v.otherMap, 1); assert.equal(v.tooFar, 1);
});
test('i18n: English and Chinese cover the whole UI chrome, missing keys fall back to Thai', () => {
  assert.equal(coverage('th'), 1); assert.ok(coverage('en') > 0.95); assert.ok(coverage('zh') > 0.95);
  assert.equal(tr('menu.wardrobe', 'en'), 'Wardrobe'); assert.equal(tr('hud.auto', 'zh'), 'AUTO');
});
