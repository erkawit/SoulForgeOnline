import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ATTRIBUTES, CLASS_KEYS, DEFAULT_CONFIG, RARITY_KEYS, mergeConfig, validateConfig } from '../src/game/balance/config';
import { deriveCharacter, monsterStats, incomingDamage } from '../src/game/balance/stats';
import { rollOptions, optionsValid } from '../src/game/balance/options';
import { dropOdds, rollDrops } from '../src/game/balance/drops';
import { enhanceCost, enhanceMultiplier, resolveEnhance } from '../src/game/balance/enhance';
import { listingFee, marketFloor, saleSplit, validateListing } from '../src/game/balance/market';
import { newbieBuff, newbieBuffLevel, inscribe } from '../src/game/balance/buffs';
import { generateInvites, isInviteFormat, normalizeInvite, INVITE_ALPHABET } from '../src/game/balance/invite';
import { DEFAULT_SKILLS, DEFAULT_HOTBAR } from '../src/game/skills/defaults';
import { availablePoints, canLearn, learn, resolveSkill, starterLevels, validateSkill, validateTree, type SkillDef } from '../src/game/skills/engine';

const seq = (vals: number[]) => { let i = 0; return () => vals[i++ % vals.length]; };
const lcg = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

test('default config is valid: Berserker has 60 attribute points, Reaver 78 (+8 STR +2 DEX +2 AGI +6 VIT), STR on top', () => {
  assert.deepEqual(validateConfig(DEFAULT_CONFIG), []);
  for (const c of CLASS_KEYS) {
    const b = DEFAULT_CONFIG.classes[c].base; assert.equal(ATTRIBUTES.reduce((s, a) => s + b[a], 0), c === 'Reaver' ? 78 : 60, c);
    const top = Math.max(...ATTRIBUTES.map(a => b[a])); assert.ok(DEFAULT_CONFIG.classes[c].primary.some(a => b[a] === top), `${c} primary is its highest stat`);
  }
});
test('one attribute point is felt: +1 STR gives a Berserker +4 attack, +1 VIT +18 HP', () => {
  const base = deriveCharacter('Berserker', 10, []), plus = deriveCharacter('Berserker', 10, [{ options: [{ kind: 'attr', stat: 'str', value: 1 }] }]);
  assert.equal(plus.attack - base.attack, 4);
  const vit = deriveCharacter('Berserker', 10, [{ options: [{ kind: 'attr', stat: 'vit', value: 1 }] }]); assert.equal(vit.maxHp - base.maxHp, 18);
  const reaver = deriveCharacter('Reaver', 60, []), b60 = deriveCharacter('Berserker', 60, []); assert.ok(reaver.attack > b60.attack && reaver.maxHp > b60.maxHp, 'the advancement is felt');
});
test('level 1 fights take a few hits each way', () => {
  for (const c of CLASS_KEYS) {
    const d = deriveCharacter(c, 1, [{ bonuses: { atk: 7 } }]), m = monsterStats(1);
    const hits = Math.ceil(m.maxHp / Math.max(1, d.attack - m.defense * 0.35)); assert.ok(hits >= 1 && hits <= 4, `${c} kills a Lv1 monster in ${hits}`);
    const taken = incomingDamage(d, m.damage, () => 0.99); assert.ok(d.maxHp / taken >= 10, `${c} survives 10+ hits`);
  }
});
test('options follow the rarity rules: Rare 1 · Epic 2 · Legendary 3 · God 4+1 · Pre-arch 4+2 · Arch 4+3, no duplicates', () => {
  const expect: Record<string, [number, number]> = { Common: [0, 0], Uncommon: [0, 0], Rare: [1, 0], Epic: [2, 0], Legendary: [3, 0], God: [4, 1], 'Pre-arch': [4, 2], Arch: [4, 3] };
  const rng = lcg(7);
  for (const r of RARITY_KEYS) for (let i = 0; i < 200; i++) {
    const o = rollOptions(r, CLASS_KEYS[i % 5], rng); assert.ok(optionsValid(r, o), r);
    assert.equal(o.filter(x => x.kind === 'attr').length, expect[r][0]); assert.equal(o.filter(x => x.kind === 'special').length, expect[r][1]);
  }
});
test('special option values double per tier above God', () => {
  const mid = () => 0.5; // deterministic middle roll → exactly the tier value
  const god = rollOptions('God', null, mid).find(o => o.kind === 'special')!, pre = rollOptions('Pre-arch', null, mid).find(o => o.kind === 'special' && o.stat === god.stat), arch = rollOptions('Arch', null, mid).find(o => o.kind === 'special' && o.stat === god.stat);
  assert.ok(pre && arch); assert.equal(pre!.value, god.value * 2); assert.equal(arch!.value, god.value * 4);
});
test('drops: higher tiers are rarer, level gates hold, bosses always drop Rare+', () => {
  const odds = dropOdds('field', 50); for (let i = 1; i < RARITY_KEYS.length; i++) assert.ok(odds[RARITY_KEYS[i]] <= odds[RARITY_KEYS[i - 1]] + 1e-9, RARITY_KEYS[i]);
  assert.equal(dropOdds('field', 10).Legendary, 0); assert.equal(dropOdds('field', 40).Arch, 0);
  const rng = lcg(3); for (let i = 0; i < 100; i++) { const d = rollDrops('boss', 40, rng); assert.equal(d.length, 3); assert.ok(d.every(r => RARITY_KEYS.indexOf(r) >= 2)); }
  const harder = mergeConfig(DEFAULT_CONFIG, { drops: { tierHardness: 0.5 } }); assert.ok(dropOdds('field', 90, harder).Arch < dropOdds('field', 90).Arch);
});
test('enhancement: safe below +6, downgrades after, protection holds, cost grows, +10 doubles the step', () => {
  assert.equal(resolveEnhance('Epic', 3, false, () => 0.99).result, 'fail-safe');
  assert.deepEqual([resolveEnhance('Epic', 8, false, () => 0.99).level, resolveEnhance('Epic', 8, true, () => 0.99).level], [7, 8]);
  assert.equal(resolveEnhance('Epic', 15, false).result, 'max');
  assert.ok(enhanceCost('Epic', 9) > enhanceCost('Epic', 1) * 10);
  assert.ok(Math.abs(enhanceMultiplier(12) - (1 + 10 * 0.04 + 2 * 0.08)) < 1e-9);
});
test('market: floor per rarity, no ceiling, fees and tax are burned', () => {
  assert.equal(marketFloor('Epic'), 5000); assert.equal(marketFloor('Epic', 2), 6500); assert.equal(marketFloor('Epic', 0, 40000), 20000);
  assert.match(validateListing(4000, 'Epic', 0, null, 0)!, /ขั้นต่ำ/); assert.equal(validateListing(9_000_000_000, 'Epic', 0, null, 0), null);
  assert.equal(listingFee(100), 10); assert.equal(listingFee(10000), 200); // round 10: 2 % listing fee, 6 % starting sales tax
  assert.deepEqual(saleSplit(10000), { seller: 9400, burned: 600 }); assert.deepEqual(saleSplit(10000, DEFAULT_CONFIG, 0.12), { seller: 8800, burned: 1200 });
});
test('newbie blessing follows level tiers 1–10 / 11–20 / 21–30 and admins can move them', () => {
  assert.deepEqual([1, 10, 11, 20, 21, 30, 31].map(l => newbieBuffLevel(l)), [1, 1, 2, 2, 3, 3, 0]);
  const custom = mergeConfig(DEFAULT_CONFIG, { newbieBuff: { maxLevel: 45, tiers: [{ from: 1, to: 15, buffLevel: 1 }, { from: 16, to: 30, buffLevel: 2 }, { from: 31, to: 45, buffLevel: 3 }] } });
  assert.deepEqual([15, 16, 40, 46].map(l => newbieBuffLevel(l, custom)), [1, 2, 3, 0]);
  assert.equal(newbieBuff(5, 0)!.atkPct, 5);
  assert.ok(inscribe('might', 1.1, 5, 4, 0).buff!.atkPct! > 18 - 1); assert.equal(inscribe('might', 1, 1, 30, 0).buff, null);
});
test('invite codes are XXXX-XXXX-XXXX-XXXX, unique, unambiguous', () => {
  const codes = generateInvites(500); assert.equal(new Set(codes).size, 500);
  for (const c of codes) { assert.ok(isInviteFormat(c), c); assert.ok(!/[IO01]/.test(c)); }
  assert.equal(INVITE_ALPHABET.length, 32); assert.equal(normalizeInvite(' abcd efgh-jkmn pqrs '), 'ABCD-EFGH-JKMN-PQRS');
});
test('skill trees are consistent and every hotbar default exists', () => {
  for (const c of ['Berserker'] as const) {
    assert.deepEqual(validateTree(DEFAULT_SKILLS, c), [], c); assert.equal(DEFAULT_SKILLS.trees[c].length, 24, 'Berserker 6+6 and Reaver 6+6');
    for (const id of Object.values(DEFAULT_HOTBAR[c])) assert.ok(DEFAULT_SKILLS.defs.some(d => d.id === id && d.cls === c), id);
  }
  for (const d of DEFAULT_SKILLS.defs) assert.deepEqual(validateSkill(d, DEFAULT_SKILLS.defs), [], d.id);
});
test('skill points: the first skill is free, level gates and the Reaver advancement apply', () => {
  let lv = starterLevels(DEFAULT_SKILLS, 'Berserker'); assert.deepEqual(Object.keys(lv), ['b-rending-rush']);
  assert.equal(DEFAULT_HOTBAR.Berserker.skill, 'b-rending-rush');
  assert.equal(availablePoints(DEFAULT_SKILLS, 'Berserker', lv, 1), 0);
  assert.equal(canLearn(DEFAULT_SKILLS, 'Berserker', 'b-blood-howl', lv, 2).ok, false, 'Blood Howl opens at Lv3');
  assert.equal(canLearn(DEFAULT_SKILLS, 'Berserker', 'b-blood-howl', lv, 3).ok, true);
  lv = learn(DEFAULT_SKILLS, 'Berserker', 'b-rending-rush', lv, 3).levels; assert.equal(lv['b-rending-rush'], 2);
  assert.equal(canLearn(DEFAULT_SKILLS, 'Berserker', 'b-rending-rush', lv, 4).ok, false, 'rank 3 needs Lv5 (2 levels per rank)');
  assert.match(canLearn(DEFAULT_SKILLS, 'Berserker', 'r-savage-rend', lv, 70).reason!, /Reaver/);
  assert.equal(canLearn(DEFAULT_SKILLS, 'Berserker', 'r-savage-rend', { ...lv, 'r-savage-rend': 1 }, 64, true).ok, false, 'Reaver rank 2 at Lv65');
  assert.equal(canLearn(DEFAULT_SKILLS, 'Berserker', 'r-savage-rend', { ...lv, 'r-savage-rend': 1 }, 65, true).ok, true);
});
test('skill engine: multi-hit timing, max targets, execute, Rage, the howl and the two-phase ultimate', () => {
  const d = deriveCharacter('Berserker', 10, []); const get = (id: string) => DEFAULT_SKILLS.defs.find(x => x.id === id)!;
  const ring = Array.from({ length: 10 }, (_, i) => ({ id: `r${i}`, x: Math.sin(i) * 2, z: Math.cos(i) * 2, defense: 0, hp: 100, maxHp: 100 }));
  const ctx = (targets = ring) => ({ caster: d, x: 0, z: 0, yaw: 0, targetId: null, targets, maxHp: d.maxHp, now: 0, rng: () => 0.5 });
  const rush = resolveSkill(get('b-rending-rush'), 1, ctx());
  assert.equal(rush.hits.length, 4); assert.equal(new Set(rush.hits.map(h => h.id)).size, 1); assert.deepEqual(rush.hits.map(h => h.delayMs), [0, 180, 360, 540]);
  assert.equal(rush.dots.length, 1); assert.equal(rush.rageCost, 8);
  const cyclone = resolveSkill(get('b-carnage-cyclone'), 1, ctx()); assert.equal(new Set(cyclone.hits.map(h => h.id)).size, 5, 'at most 5 targets'); assert.equal(cyclone.hits.length, 60);
  const ww = resolveSkill(get('b-whirlwind'), 1, ctx()); assert.equal(new Set(ww.hits.map(h => h.id)).size, 8); assert.equal(ww.hits.length, 36 * 8);
  assert.ok(Math.abs(Math.max(...ww.hits.map(h => h.delayMs)) - 35 * 167) < 1, '36 pulses over ~6 s'); assert.equal(ww.rageCost, 100); assert.equal(get('b-whirlwind').channelMs, 6000);
  const weak = [{ id: 'w', x: 0, z: 1, defense: 0, hp: 20, maxHp: 100 }], full = [{ id: 'w', x: 0, z: 1, defense: 0, hp: 100, maxHp: 100 }];
  const ex = resolveSkill(get('b-execution-frenzy'), 1, ctx(weak)), no = resolveSkill(get('b-execution-frenzy'), 1, ctx(full));
  assert.ok(ex.hits[2].damage > no.hits[2].damage * 1.3, 'execute on a target at ≤ 30 % HP');
  const howl = resolveSkill(get('b-blood-howl'), 1, ctx()); assert.equal(howl.buffs.length, 3); assert.equal(howl.rage, 20); assert.equal(howl.mpCost, 12);
  const cat = resolveSkill(get('r-cataclysm-descent'), 1, ctx([{ id: 't', x: 0, z: 2, defense: 0, hp: 1e6, maxHp: 1e6 }]));
  assert.deepEqual(cat.hits.map(h => h.delayMs), [900, 1500]); assert.ok(Math.abs(cat.hits[1].damage / cat.hits[0].damage - 2) < 0.01, 'the blast is twice the impact');
  const bad: SkillDef = { ...get('b-whirlwind'), id: 'x', effects: [{ type: 'damage', shape: 'single', radius: 0, coefficient: 99, perLevel: 0, element: 'fire' }] };
  assert.ok(validateSkill(bad).length > 0);
});
