// Round 11: the monster codex — loot from every monster, tiers that cost more for the same gain, capped bonuses, seals
// that favour parties, the sell-junk button, and the realm running the same rules.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/game/world/registry';
import * as eco from '../src/game/economy/core';
import * as cdx from '../src/game/economy/codex';
import { CODEX_SEAL, CODEX_TIERS, LOOT, LOOT_BY_ID, LOOT_OF_SPECIES, codexBonus } from '../src/game/codex';
import { DEFAULT_CONFIG, mergeConfig, validateConfig } from '../src/game/balance/config';
import { DEFAULT_SKILLS } from '../src/game/skills/defaults';
import { NPC_SPOTS } from '../src/game/npcs';
import { CITIES, type CityId } from '../src/game/content';
import { spawnPoints } from '../src/game/spawns';
import { ITEM_BY_ID } from '../src/game/items';
import { starterGear, starterPlayer } from '../src/lib/seed';
import { CharacterSession, DEFAULT_LIMITS } from '../apps/game-server/src/session';
import { STATE_KEYS } from '../apps/game-server/src/stateDiff';
import type { Item } from '../src/lib/types';

const seeded = (seed: number) => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
let n = 0; const ctx = (seed = 1, cfg = DEFAULT_CONFIG): eco.Ctx => ({ config: cfg, skills: DEFAULT_SKILLS, rng: seeded(seed), now: 1_800_000_000_000, uuid: () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}` });
const fresh = () => eco.freshCharacter('Tester', 'Berserker', 'm', ctx(), { player: starterPlayer, gear: starterGear });
const stack = (id: string, qty: number): Item => ({ ...eco.newItem(id, ctx()), qty });
const withBag = (items: Item[], s = fresh()): eco.CharState => ({ ...s, inventory: [...items, ...Array(eco.BAG_SIZE - items.length).fill(null)] });

test('every monster that is not a boss drops a codex loot, and every loot entry drops somewhere', () => {
  const spawns = (Object.keys(CITIES) as CityId[]).flatMap(c => spawnPoints(c));
  const normal = new Set(spawns.filter(p => !p.boss).map(p => p.name)), bosses = new Set(spawns.filter(p => p.boss).map(p => p.name));
  for (const sp of normal) assert.ok(LOOT_OF_SPECIES[sp], `${sp} has no codex loot`);
  for (const l of LOOT) { assert.ok(l.monsters.some(m => normal.has(m)), `${l.en} drops from no spawned monster`); assert.ok(ITEM_BY_ID[l.id], `${l.id} is an item`); assert.equal(ITEM_BY_ID[l.id].family, 'material', 'loot stacks'); }
  for (const b of bosses) assert.ok(!LOOT_OF_SPECIES[b] || normal.has(b), `boss ${b} drops seals, not loot`);
  assert.equal(LOOT.length, 24); assert.ok(ITEM_BY_ID[CODEX_SEAL]);
});

test('each tier costs more loot than the last for the same gain; seals from tier IV; the loot is gone for good', () => {
  const c = DEFAULT_CONFIG.codex, id = 'loot-01';
  for (let i = 1; i < CODEX_TIERS; i++) assert.ok(c.tierCost[i] > c.tierCost[i - 1], 'escalating cost');
  let s = withBag([stack(id, 1000), stack(CODEX_SEAL, 20)]);
  for (let t = 1; t <= CODEX_TIERS; t++) {
    const before = eco.countOf(s.inventory, id), seals = eco.countOf(s.inventory, CODEX_SEAL);
    const r = cdx.registerCodex(s, id, ctx()); assert.ok(r.ok, `tier ${t}`); if (!r.ok) return;
    assert.equal(r.state.codex![id], t); assert.equal(before - eco.countOf(r.state.inventory, id), c.tierCost[t - 1]); assert.equal(seals - eco.countOf(r.state.inventory, CODEX_SEAL), c.sealCost[t - 1]);
    assert.equal(codexBonus(r.state.codex, DEFAULT_CONFIG).atkPct, +(t * c.perTier.atkPct!).toFixed(2), 'same gain every tier');
    s = r.state;
  }
  assert.equal(cdx.registerCodex(s, id, ctx()).ok, false, 'tier V is the end');
  assert.equal(cdx.registerCodex(withBag([stack(id, 9)]), id, ctx()).ok, false, 'not enough loot');
  const atIII = { ...withBag([stack(id, 500)]), codex: { [id]: 3 } };
  assert.equal(cdx.registerCodex(atIII, id, ctx()).ok, false, 'tier IV needs seals');
  assert.equal(cdx.registerCodex(fresh(), 'loot-99', ctx()).ok, false, 'unknown entry');
  const off = mergeConfig(DEFAULT_CONFIG, { codex: { enabled: false } });
  assert.equal(cdx.registerCodex(withBag([stack(id, 50)]), id, ctx(1, off)).ok, false, 'switched off');
});

test('bonuses are capped and small: a full codex stays within the caps and adds to the character like gear', () => {
  const full = Object.fromEntries(LOOT.map(l => [l.id, CODEX_TIERS])), b = codexBonus(full, DEFAULT_CONFIG);
  for (const [k, v] of Object.entries(b)) assert.ok(v! <= DEFAULT_CONFIG.codex.caps[k as keyof typeof b]!, `${k} ${v} over its cap`);
  assert.ok(Object.values(b).every(v => v! <= 5), 'no stat above 5%');
  const s = fresh(), plain = eco.derive(s, ctx()), boosted = eco.derive({ ...s, codex: full }, ctx());
  assert.ok(boosted.maxHp > plain.maxHp && boosted.maxHp <= Math.ceil(plain.maxHp * 1.05), `HP ${plain.maxHp} → ${boosted.maxHp}`);
  assert.ok(boosted.attack > plain.attack && boosted.attack <= Math.ceil(plain.attack * 1.04));
  assert.deepEqual(codexBonus(full, mergeConfig(DEFAULT_CONFIG, { codex: { enabled: false } })), {}, 'off = no bonus');
  assert.deepEqual(codexBonus({ 'loot-01': 99 }, DEFAULT_CONFIG), codexBonus({ 'loot-01': 5 }, DEFAULT_CONFIG), 'tiers clamp to V');
});

test('titles: a category at tier III gives its collector title, at V its master title; the whole codex the grand title', () => {
  const beasts = LOOT.filter(l => l.category === 'beast').map(l => l.id);
  assert.deepEqual(cdx.codexTitles(Object.fromEntries(beasts.map(id => [id, 2]))), []);
  assert.equal(cdx.codexTitles(Object.fromEntries(beasts.map(id => [id, 3]))).length, 1);
  const all = cdx.codexTitles(Object.fromEntries(LOOT.map(l => [l.id, CODEX_TIERS])));
  assert.equal(all.length, 7);
});

test('kills: species loot, less for far-outlevelled monsters, seals three times as likely with a party, every boss pays seals', () => {
  const m = eco.monstersFor('wild0', DEFAULT_CONFIG).find(x => x.name === 'Ash Hound' && !x.elite)!;
  const low = { ...fresh(), player: { ...fresh().player, cityId: 'wild0' as const, level: m.level } }, high = { ...low, player: { ...low.player, level: m.level + 30 } };
  const count = (s: eco.CharState, mon: typeof m, id: string, party = 1, k = 4000) => { let got = 0; for (let i = 0; i < k; i++) { const r = eco.grantKill(s, mon, { ...ctx(i + 1), party }); got += r.dropped!.filter(d => d.definitionId === id).reduce((a, d) => a + (d.qty ?? 1), 0); } return got / k; };
  const near = count(low, m, 'loot-01'), far = count(high, m, 'loot-01');
  assert.ok(Math.abs(near - DEFAULT_CONFIG.codex.lootChance) < 0.03, `loot rate ${near}`);
  assert.ok(far < near * 0.45, `out-levelled ${far} vs ${near}`);
  const elite = { ...m, elite: true };
  const solo = count(low, elite, CODEX_SEAL, 1, 6000), party = count(low, elite, CODEX_SEAL, 2, 6000);
  assert.ok(party > solo * 2, `party seals ${party} vs solo ${solo}`);
  const boss = eco.monstersFor('wild0', DEFAULT_CONFIG).find(x => x.boss)!;
  const seals = (p: number) => eco.grantKill(low, boss, { ...ctx(3), party: p }).dropped!.filter(d => d.definitionId === CODEX_SEAL).reduce((a, d) => a + (d.qty ?? 1), 0);
  assert.equal(seals(1), 1); assert.equal(seals(3), 2);
});

test('loot picked up joins its stack (one bag slot per kind)', () => {
  let s: eco.CharState = { ...fresh(), drops: [] };
  for (let i = 0; i < 5; i++) s = { ...s, drops: [...s.drops, { id: `d${i}`, x: s.player.position[0], z: s.player.position[1], item: stack('loot-01', 1) }] };
  for (let i = 0; i < 5; i++) { const r = eco.pickup(s, `d${i}`); assert.ok(r.ok); if (r.ok) s = r.state; }
  assert.equal(s.inventory.filter(i => i?.definitionId === 'loot-01').length, 1); assert.equal(eco.countOf(s.inventory, 'loot-01'), 5);
});

test('sell junk: only loot beyond what the codex still needs, never seals or gear, only at the buyer', () => {
  const need = cdx.stillNeeded({}, 'loot-01', DEFAULT_CONFIG);
  assert.equal(need, DEFAULT_CONFIG.codex.tierCost.reduce((a, b) => a + b, 0));
  const s = { ...withBag([stack('loot-01', need + 30), stack('loot-02', 10), stack(CODEX_SEAL, 4), { ...starterGear, id: 'gear-x' }]), codex: { 'loot-02': CODEX_TIERS } };
  const plan = cdx.junkPlan(s, DEFAULT_CONFIG);
  assert.deepEqual(plan.lines.map(l => [l.id, l.qty]), [['loot-01', 30], ['loot-02', 10]]);
  assert.equal(plan.total, 30 * LOOT_BY_ID['loot-01'].sell + 10 * LOOT_BY_ID['loot-02'].sell);
  assert.equal(cdx.sellJunk(s, ctx()).ok, false, 'away from the shop');
  const atShop = { ...s, player: { ...s.player, position: NPC_SPOTS.hollow.buyer } }, r = cdx.sellJunk(atShop, ctx());
  assert.ok(r.ok); if (!r.ok) return;
  assert.equal(eco.countOf(r.state.inventory, 'loot-01'), need); assert.equal(eco.countOf(r.state.inventory, 'loot-02'), 0);
  assert.equal(eco.countOf(r.state.inventory, CODEX_SEAL), 4); assert.ok(r.state.inventory.some(i => i?.slot), 'gear untouched');
  assert.equal(r.state.player.gold, atShop.player.gold + plan.total);
  assert.equal(cdx.sellJunk(r.state, ctx()).ok, false, 'nothing left to sell');
});

test('the realm runs the codex: ACT codex / sellJunk, kills pay seals by the party it counts, the codex is pushed to the client', () => {
  const live = { config: DEFAULT_CONFIG, skills: DEFAULT_SKILLS, limits: DEFAULT_LIMITS }, t = 1_900_000_000_000;
  const s = new CharacterSession('u', withBag([stack('loot-03', 12)]), 1, () => live, t);
  const r = s.act('codex', ['loot-03'], [], t); assert.ok(r.ok, r.msg);
  assert.equal(s.state.codex!['loot-03'], 1); assert.equal(eco.countOf(s.state.inventory, 'loot-03'), 2);
  assert.equal(s.act('codex', ['loot-03'], [], t).ok, false, 'not enough for tier II');
  assert.equal(s.act('sellJunk', [], [], t).ok, false, 'not at the buyer');
  assert.ok((STATE_KEYS as readonly string[]).includes('codex'));
  let asked = 0; s.partyNear = range => { asked = range; return 3; };
  s.state = { ...s.state, player: { ...s.state.player, cityId: 'wild0', position: [2, -45], level: 60 } };
  const boss = spawnPoints('wild0').find(p => p.boss)!;
  s.budget = 1e12; const k = s.act('kill', ['wild0', boss.id], [], t + 1);
  assert.ok(k.ok, k.msg); assert.equal(asked, DEFAULT_CONFIG.codex.partyRange);
  assert.equal(s.state.drops.filter(d => d.item.definitionId === CODEX_SEAL).reduce((a, d) => a + (d.item.qty ?? 1), 0), 2, 'boss with a party of 3: two seals');
});

test('codex config: defaults valid, bad admin values caught', () => {
  assert.deepEqual(validateConfig(DEFAULT_CONFIG), []);
  assert.ok(validateConfig(mergeConfig(DEFAULT_CONFIG, { codex: { tierCost: [10, 5, 50, 100, 200] } })).length > 0, 'cheaper tier');
  assert.ok(validateConfig(mergeConfig(DEFAULT_CONFIG, { codex: { caps: { atkPct: 50 } } })).length > 0, 'huge cap');
  assert.ok(validateConfig(mergeConfig(DEFAULT_CONFIG, { codex: { sealChance: { solo: 0.5, party: 0.1 } } })).length > 0, 'solo above party');
});
