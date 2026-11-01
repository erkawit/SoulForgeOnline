import test from 'node:test';
import assert from 'node:assert/strict';
import { craftCost, craftChance, rollCraft, crystalCraft, craftDefId, expectedCraft } from '../src/game/balance/craft';
import { ITEM_BY_ID } from '../src/game/items';
import { QUESTS, acceptQuest, questEvent, turnInQuest, npcMarker, questsOffered } from '../src/game/quests';
import { tipFor, markSeen } from '../src/game/tutorial';
import { decideAuto, defaultAuto, type AutoView } from '../src/game/auto';
import { raidBossHp, scaleRaidBoss, raidMinutes, expectedPlayerDps } from '../src/game/balance/raid';
import { rankBossDamage, rollBossRewards } from '../src/game/balance/bossRewards';
import { DEFAULT_SKILLS } from '../src/game/skills/defaults';
import { monsterEntries, BOSSES, ELITE_SKILLS } from '../src/game/wiki/data';
import { ZONES, zoneAt } from '../src/game/world/zones';
import { CLASS_IDS } from '../src/game/content';

test('craft: success rates, rising cost, crystal on Legendary+ failure, 3 crystals = guaranteed', () => {
  assert.equal(craftChance('Legendary'), 0.75); assert.equal(craftChance('God'), 0.7); assert.equal(craftChance('Pre-arch'), 0.6); assert.equal(craftChance('Arch'), 0.45); assert.equal(craftChance('Epic'), 1);
  const order = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'God', 'Pre-arch', 'Arch'] as const;
  for (let i = 1; i < order.length; i++) { assert.ok(craftCost(order[i], 'weapon').soulGod > craftCost(order[i - 1], 'weapon').soulGod); }
  assert.ok(craftCost('Arch', 'weapon').materials.length >= 4);
  const fail = rollCraft('God', 'Berserker', 'weapon', () => 0.99); assert.deepEqual(fail, { success: false, crystal: 'crystal-God' });
  assert.deepEqual(rollCraft('Rare', 'Berserker', 'weapon', () => 0.99), { success: true, defId: 'weapon-greathammer-2' }, 'the random craft rolls the weapon kind');
  assert.deepEqual(rollCraft('Rare', 'Berserker', 'weapon', () => 0.1), { success: true, defId: 'weapon-Berserker-2' });
  assert.equal(crystalCraft('Arch', 'Berserker', 'armor', 2).ok, false);
  const ok = crystalCraft('Arch', 'Berserker', 'armor', 3); assert.ok(ok.ok && ok.defId === 'heavy-armor-7');
  const axe = crystalCraft('Arch', 'Berserker', 'weapon', 3, undefined, 'greataxe'); assert.ok(axe.ok && axe.defId === 'weapon-greataxe-7', 'the player picks the kind');
  for (const cls of CLASS_IDS) for (const slot of ['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring'] as const) for (const r of order) assert.ok(ITEM_BY_ID[craftDefId(r, cls, slot)], `${cls} ${slot} ${r}`);
  for (const r of ['Legendary', 'God', 'Pre-arch', 'Arch']) assert.ok(ITEM_BY_ID[`crystal-${r}`]);
  assert.ok(expectedCraft('Arch', 'weapon').attempts < 3);
});
test('quests: offer → accept → progress → ready → turn in; markers', () => {
  let log = {}; assert.equal(npcMarker('guide', 1, log), '!');
  log = acceptQuest(log, 'q-awakening'); assert.equal(npcMarker('supplier', 1, log), '…');
  let r = questEvent(log, { type: 'talk', npc: 'supplier' }); assert.deepEqual(r.ready, ['q-awakening']); assert.equal(npcMarker('supplier', 1, r.log), '?');
  const t = turnInQuest(r.log, 'q-awakening', 'supplier'); assert.ok(t && t.rewards.xp > 0); log = t!.log;
  assert.ok(questsOffered('supplier', 1, log).some(q => q.id === 'q-first-blood'));
  log = acceptQuest(log, 'q-first-blood'); for (let i = 0; i < 5; i++) log = questEvent(log, { type: 'kill', species: 'Ash Hound' }).log;
  assert.equal((log as Record<string, { status: string }>)['q-first-blood'].status, 'ready');
  for (const q of QUESTS) if (q.requires) assert.ok(QUESTS.some(x => x.id === q.requires), q.id);
});
test('tutorial tips fire once', () => {
  const a = tipFor('start', []); assert.ok(a); assert.equal(tipFor('start', markSeen([], a!.id)), null);
});
test('auto: drinks below threshold, attack mode uses ready skills then the basic attack', () => {
  const lib = DEFAULT_SKILLS.defs, def = (id: string) => lib.find(d => d.id === id)!;
  const base: AutoView = { hpPct: 1, mpPct: 1, mp: 500, busy: false, inCombat: true, hasTarget: true, targetInRange: true, enemyNear: true, targetIsBoss: false, enemiesNear: 1, allies: [{ id: 'me', hpPct: 1, dist: 0, alive: true, buffs: [], self: true }],
    slots: [{ slot: 1, def: def('b-rending-rush'), ready: true, mpCost: 0 }], hpPotions: 3, mpPotions: 3, foodCount: 0, foodActive: true, potionReady: true, lootNear: false, cls: 'Berserker' };
  const s = { ...defaultAuto('Berserker'), enabled: true };
  assert.equal(s.focus, 'attack');
  const low = decideAuto({ ...base, hpPct: 0.2 }, s); assert.deepEqual(low[0], { type: 'potion', kind: 'hp' });
  const war = decideAuto(base, s); assert.ok(war.some(a => a.type === 'skill' && a.slot === 1)); assert.equal(war.at(-1)!.type, 'attack');
  const noRage = decideAuto({ ...base, slots: [{ ...base.slots[0], ready: false }] }, s); assert.ok(!noRage.some(a => a.type === 'skill'), 'a skill without Rage is not ready');
  assert.deepEqual(decideAuto(base, { ...s, enabled: false }), []);
});
test('raid bosses last 15–30 minutes and grow with the raid; dashboard ranks top 10', () => {
  const hp = raidBossHp(50, 20); const m = raidMinutes(50, hp, 20); assert.ok(m >= 15 && m <= 30, String(m));
  const g = scaleRaidBoss({ hp: hp / 2, maxHp: hp, level: 50 }, 40); assert.ok(g.maxHp > hp && Math.abs(g.hp / g.maxHp - 0.5) < 0.01);
  assert.equal(scaleRaidBoss({ hp: 10, maxHp: hp, level: 50 }, 5).maxHp, hp);
  const dmg = Array.from({ length: 14 }, (_, i) => ({ id: 'p' + i, name: 'P' + i, cls: 'Berserker', damage: (i + 1) * 1000 }));
  const ranked = rankBossDamage(dmg); assert.equal(ranked.length, 10); assert.equal(ranked[0].id, 'p13'); assert.equal(ranked[0].rank, 1);
  let hits = 0; for (let k = 0; k < 2000; k++) if (rollBossRewards(ranked.slice(0, 1), 1e6, Math.random)[0].highTier) hits++;
  assert.ok(hits > 850 && hits < 1150, String(hits));
  const pay = rollBossRewards(ranked, 1_000_000, () => 0.99); assert.ok(pay[0].soulGod > pay[9].soulGod);
  assert.ok(expectedPlayerDps(10) > 0);
});
test('wiki: every monster has stats, elites one skill, bosses lore without numbers; zones resolve', () => {
  const m = monsterEntries(); assert.ok(m.length >= 30);
  for (const e of m) { assert.ok(e.hp > 0 && e.attack > 0 && e.defense >= 0 && e.mp > 0, e.name); if (e.elite) assert.ok(e.skill, `${e.name} needs an elite skill`); }
  assert.equal(Object.keys(ELITE_SKILLS).length, 4); for (const b of BOSSES) assert.ok(b.skills.length >= 3 && b.origin && b.story);
  for (const z of ZONES) assert.equal(zoneAt(z.x, z.z)?.id, z.id); assert.equal(zoneAt(0, 0), null);
});
