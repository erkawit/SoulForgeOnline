// Round 13 fixes: the realm no longer trusts reported HP, and the world boss fights back (Sunder, enrage, real-DPS HP).
import test from 'node:test';
import assert from 'node:assert/strict';
import { acceptVitals, acceptStat } from '../src/vitals.js';
import { bossSwing, newSwingState, pickTarget, BOSS_COMBAT, type BossBody, type BossFighter } from '../src/bossCombat.js';
import { raidHp, raidHpFor, RAID } from '../src/raid.js';
import { Room } from '../src/world.js';
import { BOSS_RULES } from '../../../src/game/balance/bossRules';

const MAX = { hp: 1000, mp: 200 };

test('vitals: damage is always accepted, a jump to full HP is not', () => {
  assert.equal(acceptVitals({ hp: 800, mp: 100 }, { hp: 300 }, MAX, 100).hp, 300, 'a lower value is the browser taking hits');
  const v = acceptVitals({ hp: 100, mp: 100 }, { hp: 1000, mp: 200 }, MAX, 100);
  assert.ok(v.hp < 120, `100 ms can heal only a little, got ${v.hp}`);
  assert.equal(acceptVitals({ hp: 100, mp: 0 }, { hp: 1000 }, MAX, 60_000).hp, 100 + MAX.hp * 0.08 * 5, 'a long silence still only counts 5 s');
  assert.equal(acceptStat(50, 9999, 100, 1000), 100, 'never above max');
  assert.equal(acceptStat(50, undefined, 100, 10), 50, 'no report keeps the value');
  assert.equal(acceptStat(50, Number.NaN, 100, 10), 50);
});
test('vitals: dead stays dead until respawn; potion credit lets the heal through once', () => {
  assert.equal(acceptVitals({ hp: 0, mp: 10 }, { hp: 1000 }, MAX, 1000, { dead: true }).hp, 0);
  const a = acceptVitals({ hp: 200, mp: 0 }, { hp: 700 }, MAX, 0, { credit: 500 });
  assert.equal(a.hp, 700); assert.equal(a.creditLeft, 0);
  const b = acceptVitals({ hp: 200, mp: 0 }, { hp: 400 }, MAX, 0, { credit: 500 });
  assert.equal(b.hp, 400); assert.equal(b.creditLeft, 300, 'unused credit stays for the next report');
});

const boss = (over: Partial<BossBody> = {}): BossBody => ({ id: 'titan', x: 0, z: 0, attack: 95, hp: 1e6, spawnedAt: 0, phase: 'active', contributions: new Map(), ...over });
const fighter = (id: string, over: Partial<BossFighter> = {}): BossFighter => ({ id, x: 1, z: 0, hp: 5000, maxHp: 5000, defense: 100, ...over });

test('boss picks the top-threat fighter in reach, ignores the dead, the far and other maps', () => {
  const b = boss({ contributions: new Map([['tank', 50], ['dps', 900], ['far', 99999]]) });
  const list = [fighter('tank'), fighter('dps', { x: 3 }), fighter('far', { x: 50 }), fighter('dead', { hp: 0 }), fighter('away', { city: 'thornwatch' })];
  assert.equal(pickTarget(b, list)?.id, 'dps');
  assert.equal(pickTarget(b, [fighter('a', { x: 4 }), fighter('b', { x: 2 })])?.id, 'b', 'no threat yet → nearest');
  assert.equal(pickTarget(b, [fighter('far', { x: BOSS_COMBAT.reach + 1 })]), null);
});
test('boss swings on its timer, Sunder stacks on one target and resets on a swap', () => {
  const b = boss(), st = newSwingState(0, 0), t = fighter('tank', { hp: 1e9, maxHp: 5000 }), never = () => 1;
  const hits: number[] = [];
  for (let i = 0; i < 12; i++) { const s = bossSwing(b, [t], st, i * BOSS_COMBAT.swingMs, never); assert.ok(s); hits.push(s!.raw); }
  assert.equal(bossSwing(b, [t], st, 11 * BOSS_COMBAT.swingMs + 10, never), null, 'not before the next swing');
  assert.ok(hits[1] > hits[0] && hits[5] > hits[1], 'repeated hits on one target grow');
  const cap = Math.round((95 + 5000 * BOSS_COMBAT.hpShare) * (1 + BOSS_RULES.sunderMax * BOSS_RULES.sunderPerStack));
  assert.equal(hits[11], cap, 'growth stops at sunderMax');
  // a fresh target starts from zero stacks
  const s2 = bossSwing(b, [fighter('offtank', { hp: 1e9 })], st, 12 * BOSS_COMBAT.swingMs, never)!;
  assert.equal(s2.stacks, 1); assert.equal(s2.raw, hits[0]);
});
test('hard enrage ×5 after 30 minutes, kills, evasion and immortal GM', () => {
  const never = () => 1, late = BOSS_RULES.enrageMinutes * 60_000;
  const calm = bossSwing(boss(), [fighter('a', { hp: 1e9 })], newSwingState(0, 0), late - 1, never)!;
  const mad = bossSwing(boss(), [fighter('a', { hp: 1e9 })], newSwingState(0, 0), late, never)!;
  assert.equal(mad.raw, calm.raw * BOSS_RULES.enrageMul); assert.equal(mad.enraged, true);
  const weak = fighter('weak', { hp: 10 }); const k = bossSwing(boss(), [weak], newSwingState(0, 0), 0, never)!;
  assert.equal(k.killed, true); assert.equal(weak.hp, 0);
  const dodge = bossSwing(boss(), [fighter('agile', { evade: 0.35 })], newSwingState(0, 0), 0, () => 0)!;
  assert.equal(dodge.evaded, true); assert.equal(dodge.damage, 0);
  const gm = fighter('gm', { hp: 10, immortal: true }); bossSwing(boss(), [gm], newSwingState(0, 0), 0, never);
  assert.equal(gm.hp, 1, 'the GM test character survives but is not exempt from being hit');
});
test('a hit threatens low and high level characters alike (share of max HP)', () => {
  const lvl20 = bossSwing(boss(), [fighter('a', { maxHp: 900, hp: 1e9, defense: 40 })], newSwingState(0, 0), 0, () => 1)!;
  const lvl100 = bossSwing(boss(), [fighter('b', { maxHp: 30000, hp: 1e9, defense: 1500 })], newSwingState(0, 0), 0, () => 1)!;
  assert.ok(lvl20.damage > 1 && lvl100.damage > 1);
  assert.ok(lvl100.damage / 30000 > 0.01, 'still at least 1 % of a level-100 pool per hit before Sunder');
});

test('boss HP follows the real DPS of the challengers, never below the old floor', () => {
  assert.equal(raidHpFor([]), raidHp(0), 'no data → old sizing');
  assert.equal(raidHpFor([10, 10, 10]), raidHp(3), 'weak fighters → old floor (70 DPS each, padded to 8)');
  const strong = raidHpFor(Array(8).fill(2000));
  assert.equal(strong, Math.round(8 * 2000 * 0.5 * RAID.targetMinutes * 60));
  assert.ok(raidHpFor([5000, 5000, 5000]) > raidHp(3) * 10, 'three level-100 players do not melt it in seconds');
});
test('Room: the Titan scales to fighters once a second and strikes the top-threat player in reach', () => {
  const room = new Room(), t0 = 1_000_000; room.spawnBoss(t0); const b = room.boss!; b.x = 0; b.z = 0;
  const base = b.maxHp;
  for (const id of ['a', 'b', 'c']) room.players.set(id, { id, x: 1, z: 0, city: 'hollow', hp: 4000, maxHp: 4000, attack: 500, defense: 80, crit: 0, mp: 100, speed: 4, level: 80, lastBasic: 0, lastSkill: 0 });
  room.tick(0.05, t0 + 1000, () => 20_000);
  assert.ok(room.boss!.maxHp > base, 'grew with real DPS');
  room.damageBoss('b', 1000, t0 + 1000);
  const s = room.bossAttack(t0 + 10_000, () => 1);
  assert.ok(s); assert.equal(s!.target, 'b'); assert.ok(room.players.get('b')!.hp < 4000);
});
