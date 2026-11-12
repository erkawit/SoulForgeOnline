import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutFor, orientationFor, TIERS, tierColor, levelTitle } from '../src/game/ui/layout';
import { GRID_W, GRID_H, itemSize, fits, layoutBag, moveItem, freeCells, rowsFor } from '../src/game/ui/bagGrid';
import { EQUIP_LAYOUT, SLOT_FOR_GEAR } from '../src/game/ui/equipSlots';
import { buildStatus, formatStat } from '../src/game/ui/statusSchema';
import { deriveCharacter } from '../src/game/balance/stats';
import { DEFAULT_CONFIG } from '../src/game/balance/config';
import { RARITIES } from '../src/game/items';

test('screen scale: < 768 px is mobile, phones held sideways too, desktops stay PC', () => {
  assert.equal(layoutFor(390, 844, true), 'mobile'); assert.equal(layoutFor(767, 900, false), 'mobile');
  assert.equal(layoutFor(844, 390, true), 'mobile'); assert.equal(layoutFor(1024, 768, true), 'pc');
  assert.equal(layoutFor(1280, 720, false), 'pc'); assert.equal(layoutFor(900, 420, false), 'pc');
  // round 22: the control setting overrides the screen rule; orientation picks the touch layout
  assert.equal(layoutFor(1280, 720, false, 'touch'), 'mobile'); assert.equal(layoutFor(980, 1800, true, 'auto', true), 'mobile'); assert.equal(layoutFor(390, 844, true, 'pc'), 'pc');
  assert.equal(orientationFor(390, 844), 'portrait'); assert.equal(orientationFor(844, 390), 'landscape');
});
test('tiers: T1–T8 follow the spec colours and cover every rarity in order', () => {
  assert.deepEqual(TIERS.map(t => t.rarity), [...RARITIES]);
  assert.deepEqual(TIERS.map(t => t.color), ['#FFFFFF', '#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#FFD700', '#FF9800', '#E040FB']);
  assert.equal(tierColor('God'), '#FFD700'); assert.equal(levelTitle(1), 'ผู้มาเยือนแดนโศก'); assert.equal(levelTitle(22), 'นักล่าแห่งอาสนวิหาร');
});
test('equipment: 12 spec slots + costume, every game gear slot has a home', () => {
  assert.equal(EQUIP_LAYOUT.filter(s => s.id !== 'costume').length, 12);
  for (const g of ['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring', 'costume'] as const) assert.ok(SLOT_FOR_GEAR[g], g);
});
test('bag grid: one cell per item, 10 columns × rows for the bag size, moves and overflow', () => {
  const sword = { id: 'w', slot: 'weapon' }, armor = { id: 'a', slot: 'armor' }, pot = { id: 'p', slot: null, family: 'consumable' };
  for (const it of [sword, armor, pot]) assert.deepEqual(itemSize(it), { w: 1, h: 1 });
  assert.equal(rowsFor(200), 20); assert.equal(rowsFor(300), 30); assert.equal(GRID_H, 20);
  const { placed, positions } = layoutBag([pot, sword, armor]);
  assert.equal(placed.length, 3); assert.equal(freeCells(placed), 200 - 3);
  assert.deepEqual(positions.p, { x: 0, y: 0 }); assert.deepEqual(positions.w, { x: 1, y: 0 });
  assert.equal(fits(placed, sword, 0, 0), false); assert.equal(fits(placed, pot, 9, 19), true); assert.equal(fits(placed, pot, 9, 20), false);
  const moved = moveItem([pot, sword, armor], positions, 'w', 9, 19)!; assert.deepEqual(moved.w, { x: 9, y: 19 });
  assert.equal(moveItem([pot, sword, armor], positions, 'w', 0, 0), null);
  const again = layoutBag([pot, sword, armor], moved); assert.deepEqual(again.positions.w, { x: 9, y: 19 });
  const many = Array.from({ length: 205 }, (_, i) => ({ id: 'x' + i, slot: 'armor' })); const full = layoutBag(many);
  assert.equal(full.placed.length, GRID_W * GRID_H); assert.equal(full.overflow.length, 5);
  assert.equal(layoutBag(many, {}, rowsFor(210)).overflow.length, 0);
});
test('status schema: every derived number is shown once, gear bonuses are visible', () => {
  const d = deriveCharacter('Berserker', 10, []); const base = DEFAULT_CONFIG.classes.Berserker.base;
  const cats = buildStatus(d, base); assert.deepEqual(cats.map(c => c.id), ['core', 'offense', 'defense', 'speed', 'recovery', 'support']);
  assert.equal(cats[0].rows.length, 6); assert.ok(cats.every(c => c.rows.every(r => Number.isFinite(r.value))));
  assert.equal(formatStat({ value: 0.125, format: 'pct' }), '12.5%'); assert.equal(formatStat({ value: 1.5, format: 'mult' }), '×1.50');
});
