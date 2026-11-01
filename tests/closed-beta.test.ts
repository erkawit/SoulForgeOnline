import { test } from 'node:test';
import assert from 'node:assert/strict';
import { useGameStore, derivedOf, createSnapshot, cityMonsters } from '../src/store/useGameStore';
import { npcPosition, NPC_BY_ID } from '../src/game/npcs';
const S = () => useGameStore.getState();
const at = (id: string) => { const [x, z] = npcPosition(NPC_BY_ID[id]); useGameStore.setState(s => ({ player: { ...s.player, position: [x, z + 1] } })); };
test('store: class bases, skills, casting, npc services, snapshot roundtrip', () => {
  S().setJournal(false);
  assert.deepEqual(S().player.stats, { str: 20, int: 2, dex: 8, agi: 10, wis: 4, vit: 16 });
  assert.equal(S().hotbar.skill, 'b-rending-rush'); assert.equal(S().skillLevels['b-rending-rush'], 1);
  S().applyProfile('Tester', 'Berserker'); assert.equal(S().lockedClass, 'Berserker'); assert.equal(S().player.classId, 'Berserker');
  // starter kit only near Quartermaster
  assert.match(S().claimStarterKit()!, /Quartermaster/); at('supplier'); assert.equal(S().claimStarterKit(), null); assert.match(S().claimStarterKit()!, /ไปแล้ว/);
  const weapon = S().inventory.findIndex(i => i?.definitionId === 'weapon-Berserker-0'); S().equip(weapon); assert.equal(S().equipment.weapon?.definitionId, 'weapon-Berserker-0');
  assert.ok(!S().inventory.some(i => i?.slot === 'offhand'), 'two-handed: the kit has no off-hand');
  const armor = S().inventory.findIndex(i => i?.definitionId === 'heavy-armor-0'); S().equip(armor); assert.ok(S().equipment.armor);
  // blessing
  at('blessing'); assert.equal(S().receiveBlessing(), null); assert.equal(S().buffs[0].source, 'Newbie Blessing Lv.1');
  const d = derivedOf(S()); assert.ok(d.attack > 100 && d.maxHp > 400, `atk ${d.attack} hp ${d.maxHp}`); // Berserker: more STR, less VIT than the old Warrior
  // shop & potion
  useGameStore.setState(s => ({ player: { ...s.player, gold: 100000 } })); at('shop'); assert.equal(S().buyShop('potion-hp-s', 3), null);
  const pot = S().inventory.findIndex(i => i?.definitionId === 'potion-hp-s'); assert.equal(S().inventory[pot]!.qty, 3);
  useGameStore.setState(s => ({ player: { ...s.player, hp: 10 } })); S().equip(pot); assert.ok(S().player.hp > 100); assert.equal(S().inventory[pot]!.qty, 2);
  for(let i=0;i<3;i++) assert.equal(S().buyCatalog('soul-stone-weapon'),null);
  // enhance only at the merchant
  useGameStore.setState(s => ({ player: { ...s.player, position: [0, 0] } })); assert.equal(S().enhance({ slot: 'weapon' }, false).ok, false); at('merchant');
  for (let i = 0; i < 3; i++) assert.equal(S().enhance({ slot: 'weapon' }, false).ok, true);
  assert.equal(S().equipment.weapon!.enhance, 3); assert.match(S().equipment.weapon!.name, /^\+3 /);
  // combat: put a monster next to the player and cast the cleave
  // (the capitals have no monsters: borrow Ashen Outskirts' first pack)
  if (!S().monsters.length) useGameStore.setState({ monsters: cityMonsters('wild0') });
  const [px, pz] = S().player.position; useGameStore.setState(s => ({ monsters: s.monsters.map((m, i) => i === 0 ? { ...m, x: px, z: pz + 1.5, hp: 99999, maxHp: 99999 } : m) }));
  useGameStore.setState({ rage: 40 }); const before = S().monsters[0].hp; S().cast('skill'); assert.ok(S().monsters[0].hp < before, 'Rending Rush hit'); assert.equal(S().action.kind, 'attack');
  S().cast('skill'); assert.match(S().log[0], /คูลดาวน์/);
  // learning: need levels/points
  assert.match(S().learnSkill('b-bloodquake')!, /เลเวล|แต้ม/);
  useGameStore.setState(s => ({ player: { ...s.player, level: 12 } })); assert.equal(S().learnSkill('b-rending-rush'), null); assert.equal(S().learnSkill('b-bloodquake'), null);
  S().setHotbar('special', 'b-bloodquake'); assert.equal(S().hotbar.special, 'b-bloodquake');
  // tick works and regen happens
  for (let i = 0; i < 5; i++) S().tick();
  const snap = createSnapshot(); assert.equal(snap.economyVersion, 3); assert.equal(snap.skills!.levels['b-bloodquake'], 1);
  S().hydrate(JSON.parse(JSON.stringify(snap))); assert.equal(S().equipment.weapon!.enhance, 3); assert.equal(S().skillLevels['b-bloodquake'], 1); assert.equal(S().player.classId, 'Berserker');
  // travel fee
  const g = S().player.gold; S().travel('wild0' as never); assert.equal(S().player.gold, g - 60); assert.equal(S().player.cityId, 'wild0');
  // kills drop class-locked items with options at the right counts
  useGameStore.setState(s => ({ player: { ...s.player, position: [0, 0] }, monsters: s.monsters.map((m, i) => i === 0 ? { ...m, x: 0, z: 1, hp: 1 } : m) }));
  const id = S().monsters[0].id; let kills = 0; for (let k = 0; k < 200; k++) { useGameStore.setState(s => ({ cooldowns: {}, monsters: s.monsters.map(m => m.id === id ? { ...m, hp: 1, respawnAt: null } : m) })); S().attack(id); kills++; }
  const drops = S().drops; assert.ok(drops.length > 20, `drops ${drops.length}/${kills}`);
  for (const dr of drops) { const it = dr.item; if (!it.slot) continue; assert.ok(it.classLock, it.name); const n = { Common: 0, Uncommon: 0, Rare: 1, Epic: 2, Legendary: 3, God: 4, 'Pre-arch': 4, Arch: 4 }[it.rarity]; assert.equal((it.options ?? []).filter(o => o.kind === 'attr').length, n, it.rarity); }
});
