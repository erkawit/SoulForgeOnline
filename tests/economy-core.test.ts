// Round 9: the economy core is the one rulebook for the browser and the realm. Same input + same dice = same result,
// bad input is refused without touching the state, and old untrusted saves are rebuilt safely.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/game/world/registry';
import * as eco from '../src/game/economy/core';
import { DEFAULT_CONFIG } from '../src/game/balance/config';
import { DEFAULT_SKILLS } from '../src/game/skills/defaults';
import { NPC_SPOTS } from '../src/game/npcs';
import { portalsOf } from '../src/game/content';
import { starterGear, starterPlayer } from '../src/lib/seed';
import { importLegacy, rebuildItem } from '../apps/game-server/src/importSave';
import { legitDps, DEFAULT_LIMITS, CharacterSession } from '../apps/game-server/src/session';
import { diffState } from '../apps/game-server/src/stateDiff';
import { spawnPoints } from '../src/game/spawns';

const seeded = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
let n = 0; const ctx = (seed = 1, now = 1_800_000_000_000): eco.Ctx => ({ config: DEFAULT_CONFIG, skills: DEFAULT_SKILLS, rng: seeded(seed), now, uuid: () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}` });
const STARTER = { player: starterPlayer, gear: starterGear };
const fresh = () => eco.freshCharacter('Tester', 'Berserker', 'm', ctx(), STARTER);
const at = (s: eco.CharState, role: string): eco.CharState => ({ ...s, player: { ...s.player, position: NPC_SPOTS.hollow[role] } });
const rich = (s: eco.CharState, gold = 1e7): eco.CharState => ({ ...s, player: { ...s.player, gold } });

test('a fresh character: Hollow Reach plaza, starting SoulGod, starter blade, starter skills', () => {
  const s = fresh();
  assert.equal(s.player.cityId, 'hollow'); assert.equal(s.player.gold, DEFAULT_CONFIG.economy.startingSoulGod);
  assert.equal(s.inventory.length, eco.BAG_SIZE); assert.ok(s.inventory[0]); assert.ok(Object.keys(s.skillLevels).length > 0);
});

test('same state + same dice → identical result (client and realm compute the same thing)', () => {
  const base = at(rich(fresh()), 'merchant');
  n = 0; const a = eco.enhance(base, { inventory: 0 }, false, ctx(42)); n = 0; const b = eco.enhance(base, { inventory: 0 }, false, ctx(42));
  assert.deepEqual(a, b);
  const m = eco.monstersFor('wild0', DEFAULT_CONFIG)[0];
  n = 0; const k1 = eco.grantKill({ ...base, player: { ...base.player, cityId: 'wild0' } }, m, ctx(7)); n = 0; const k2 = eco.grantKill({ ...base, player: { ...base.player, cityId: 'wild0' } }, m, ctx(7));
  assert.deepEqual(k1, k2);
});

test('reducers never mutate their input, and refused operations leave nothing behind', () => {
  const s = at(rich(fresh(), 10), 'shop'), frozen = JSON.stringify(s);
  const r = eco.buyShop(s, 'potion-hp-s', 99, ctx()); assert.equal(r.ok, false); assert.equal(JSON.stringify(s), frozen);
  const ok = eco.buyShop(rich(s), 'potion-hp-s', 3, ctx()); assert.equal(ok.ok, true); assert.equal(JSON.stringify(s), frozen);
  for (const bad of [-1, 0, 1.5, 100, NaN]) assert.equal(eco.buyShop(rich(s), 'potion-hp-s', bad, ctx()).ok, false, `qty ${bad}`);
  assert.equal(eco.buyShop(rich(s), 'not-an-item', 1, ctx()).ok, false);
  assert.equal(eco.swapInventory(s, -1, 2).ok, false); assert.equal(eco.swapInventory(s, 0, s.inventory.length).ok, false);
});

test('NPC services need the NPC: shop, forge, starter kit, skills reset, blessing', () => {
  const s = rich(fresh()); // standing at the plaza, nobody near
  assert.equal(eco.buyShop(s, 'potion-hp-s', 1, ctx()).ok, false);
  assert.equal(eco.enhance(s, { inventory: 0 }, false, ctx()).ok, false);
  assert.equal(eco.claimStarterKit(s, ctx()).ok, false);
  assert.equal(eco.resetSkills(s, ctx()).ok, false);
  assert.equal(eco.receiveBlessing(s, ctx()).ok, false);
  assert.equal(eco.buyShop(at(s, 'shop'), 'potion-hp-s', 1, ctx()).ok, true);
  assert.equal(eco.claimStarterKit(at(s, 'supplier'), ctx()).ok, true);
  const once = eco.claimStarterKit(at(s, 'supplier'), ctx()) as eco.Ok; assert.equal(eco.claimStarterKit(once.state, ctx()).ok, false, 'one kit per class');
});

test('travel: waygates are free but need the ring (when checked), Orrin charges for fields', () => {
  const s = fresh(), gate = portalsOf('hollow').find(p => p.to === 'wild0')!;
  assert.equal(eco.travel(s, 'wild0', true, ctx(), { checkPosition: true }).ok, false, 'not in the ring');
  const inRing = { ...s, player: { ...s.player, position: [gate.x - 1, gate.z - 1] as [number, number] } };
  const g = eco.travel(inRing, 'wild0', true, ctx(), { checkPosition: true }); assert.equal(g.ok, true); assert.equal((g as eco.Ok).state.player.gold, s.player.gold);
  const paid = eco.travel(at(s, 'warden'), 'wild3', false, ctx(), { checkPosition: true }); assert.equal(paid.ok, true);
  assert.equal((paid as eco.Ok).state.player.gold, s.player.gold - DEFAULT_CONFIG.economy.travelFeePerZone);
  assert.equal(eco.travel(s, 'wild3', false, ctx(), { checkPosition: true }).ok, false, 'Orrin is not here');
});

test('kill rewards: SoulGod, EXP, level-ups, loot on the ground next to the monster', () => {
  let s: eco.CharState = { ...fresh(), player: { ...fresh().player, cityId: 'wild0' } };
  const m = eco.monstersFor('wild0', DEFAULT_CONFIG)[0], g0 = s.player.gold;
  const r = eco.grantKill(s, m, ctx(3)); s = r.state;
  assert.ok(s.player.gold > g0); assert.ok(s.player.level > 1 || s.player.exp > 0);
  for (const d of s.drops) assert.ok(Math.hypot(d.x - m.x, d.z - m.z) < 1);
  assert.ok(r.events.some(e => e.type === 'kill'));
});

test('state patches carry only what changed', () => {
  const s = at(rich(fresh()), 'shop'), r = eco.buyShop(s, 'potion-hp-s', 1, ctx()) as eco.Ok, patch = diffState(s, r.state);
  assert.deepEqual(Object.keys(patch).sort(), ['inventory', 'player']);
  assert.deepEqual(diffState(r.state, r.state), {});
});

test('old cloud saves are rebuilt, not trusted', () => {
  const evil = { version: 1, player: { ...starterPlayer, level: 9999, exp: -5, gold: 9e15, cityId: 'nowhere', position: [999, 999], promotionId: 'NotAClass' },
    inventory: [{ id: 'x', definitionId: 'weapon-Warrior-7', name: 'GOD BLADE', rarity: 'Arch', slot: 'weapon', bonuses: { atk: 999999 }, options: [{ kind: 'attr', stat: 'str', value: 9999 }], enhance: 15 },
      { id: 'y', definitionId: 'fake-item', name: 'x', rarity: 'Arch', slot: null, bonuses: {} }, { id: 'z', definitionId: 'material-ore', name: 'ore', rarity: 'Common', slot: null, family: 'material', bonuses: {}, qty: 1e9 },
      ...Array(21).fill(null)],
    equipment: { weapon: { definitionId: 'heavy-armor-1', slot: 'armor' } }, soulShards: 1e9, skills: { levels: { 'w-cleave': 99 } }, quests: { 'not-a-quest': { status: 'done' } }, starterKits: ['Warrior', 'Hacker'] };
  const { state: s, notes } = importLegacy(evil, { name: 'Neo', cls: 'Berserker', gender: 'm' }, ctx(), STARTER, { mode: 'sanitize', goldCap: 50_000 });
  assert.equal(s.player.level, 100); assert.equal(s.player.exp, 0); assert.equal(s.player.gold, 50_000); assert.ok(notes.some(x => x.includes('gold capped')));
  assert.equal(s.player.cityId, 'hollow'); assert.equal(s.player.promotionId, undefined);
  const blade = s.inventory[0]!; assert.ok(blade, 'a real catalog weapon is kept');
  assert.ok((blade.bonuses.atk ?? 0) < 999999, 'its stats come from the catalog'); assert.ok((blade.enhance ?? 0) <= DEFAULT_CONFIG.enhance.safeLevel, 'enhancement capped at the safe level');
  assert.ok(!(blade.options ?? []).some(o => o.value === 9999), 'options re-rolled');
  assert.equal(s.inventory[1], null, 'unknown items are dropped'); assert.equal(s.inventory[2]!.qty, 999, 'stacks capped');
  assert.equal(s.equipment.weapon, null, 'an armor in the weapon slot is dropped');
  assert.equal(s.soulShards, 999); assert.deepEqual(s.quests, {}); assert.deepEqual(s.starterKits, [], 'old class kits do not count: the Berserker kit can still be claimed');
  assert.equal(blade.definitionId, 'weapon-Berserker-7', 'an old class weapon comes back as the greatsword of its tier');
  assert.equal(importLegacy(evil, { name: 'Neo', cls: 'Berserker', gender: 'm' }, ctx(), STARTER, { mode: 'fresh', goldCap: 50_000 }).state.player.level, 1);
  assert.equal(rebuildItem({ definitionId: 'potion-hp-s', qty: 5 }, 'Berserker', ctx())!.qty, 5);
});

test('realm kill checks: wrong map, unknown spawn, respawn timer, reach, damage budget', () => {
  const live = { config: DEFAULT_CONFIG, skills: DEFAULT_SKILLS, limits: { ...DEFAULT_LIMITS, killBurstSeconds: 2 } };
  const base = fresh(), sp = spawnPoints('wild0').filter(s => !s.boss);
  const state: eco.CharState = { ...base, player: { ...base.player, cityId: 'wild0', position: sp[0].position } };
  let t = 1_900_000_000_000; const s = new CharacterSession('u', state, 1, () => live, t);
  assert.equal(s.act('kill', ['hollow', sp[0].id], [], t).ok, false, 'wrong map');
  assert.equal(s.act('kill', ['wild0', 'nope'], [], t).ok, false, 'unknown spawn');
  assert.equal(s.act('kill', ['wild0', sp[0].id], [], t).ok, true);
  assert.equal(s.act('kill', ['wild0', sp[0].id], [], t + 1000).ok, false, 'not respawned');
  t += 9000; assert.equal(s.act('kill', ['wild0', sp[0].id], [], t).ok, true, 'respawned');
  const far = [...sp].sort((a, b) => Math.hypot(b.position[0] - sp[0].position[0], b.position[1] - sp[0].position[1]) - Math.hypot(a.position[0] - sp[0].position[0], a.position[1] - sp[0].position[1]))[0];
  assert.match(s.act('kill', ['wild0', far.id], [], t).msg ?? '', /far/);
  const near = sp.filter(p => Math.hypot(p.position[0] - sp[0].position[0], p.position[1] - sp[0].position[1]) < 30).slice(1);
  const outcomes = near.map(p => s.act('kill', ['wild0', p.id], [], t).msg ?? 'ok');
  assert.ok(outcomes.some(m => /faster/.test(m)), 'a burst of instant kills runs out of budget');
  assert.ok(legitDps(s.state, live, t) > 0);
});

test('realm movement checks: walkable, no faster than the character', () => {
  const live = { config: DEFAULT_CONFIG, skills: DEFAULT_SKILLS, limits: DEFAULT_LIMITS };
  let t = 1_900_000_000_000; const s = new CharacterSession('u', fresh(), 1, () => live, t);
  const [x, z] = s.position;
  assert.equal(s.move('hollow', x + 30, z, t + 100).ok, false, 'teleport');
  assert.equal(s.move('dawnveil', x, z, t + 100).ok, false, 'other map');
  t += 1000; assert.equal(s.move('hollow', x + 0.5, z + 0.5, t).ok, true, 'a normal step');
  assert.equal(s.move('hollow', 29.9, 29.9, t + 50).ok, false, 'into the wall');
});
