// Round 12: no boss can be soloed, even by a level-100 character in full max-tier +12 gear; three players can.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOSS_RULES, activeFighters, bossHitMul, bossRegen, bossTakes, nextSunder, unyielding } from '../src/game/balance/bossRules';
import { raidBossHp } from '../src/game/balance/raid';
import { deriveFor } from '../src/lib/combat';
import { makeGear, EMPTY_GEAR } from '../src/game/items';

/** simulate `players` attackers each dealing `dps` for `minutes`; returns the boss HP left as a fraction */
function fight(players: number, dps: number, minutes: number, maxHp: number) {
  let hp = maxHp; const hits = new Map<string, number>(); const dt = 0.5;
  for (let t = 0; t < minutes * 60; t += dt) {
    const now = t * 1000; for (let p = 0; p < players; p++) { hits.set(`p${p}`, now); hp -= bossTakes(dps * dt, activeFighters(hits, now)); }
    hp = Math.min(maxHp, hp + bossRegen(maxHp, activeFighters(hits, now), dt)); if (hp <= 0) return 0;
  }
  return hp / maxHp;
}
test('a lone player never brings a boss down — any damage below 20 % max HP per second is out-healed', () => {
  const maxHp = raidBossHp(60, 8);
  // even a fantasy DPS of 10 % of the boss per second (impossible in game) is out-healed while alone
  for (const dps of [5_000, 50_000, maxHp * 0.1]) assert.equal(fight(1, dps, 40, maxHp), 1, `dps ${dps}`);
  assert.equal(fight(2, maxHp * 0.05, 40, maxHp) > 0.5, true, 'two players are still not enough');
});
test('the real max-gear GM build (Lv100, Arch +12) is still stopped by the rule', () => {
  const ids: Record<string, string> = { weapon: 'weapon-greathammer-7', armor: 'heavy-armor-7', helmet: 'heavy-helmet-7', gloves: 'heavy-gloves-7', boots: 'heavy-boots-7', ring: 'accessory-physical-7' };
  const eq = { ...EMPTY_GEAR } as Record<string, unknown>; for (const [slot, id] of Object.entries(ids)) eq[slot] = { ...makeGear(id, 'Berserker', () => 0.99), enhance: 12 };
  const d = deriveFor({ cls: 'Reaver', level: 100, equipment: eq as never });
  assert.ok(d.attack > 0);
  const dps = Math.max(1, d.attack) * 4; // ~4 hits/s with skills, very generous
  assert.equal(fight(1, dps, 40, raidBossHp(100, 8)), 1);
});
test('three players or more fight normally and can win', () => {
  const maxHp = raidBossHp(50, 8);
  assert.equal(unyielding(3), false); assert.equal(bossTakes(1000, 3), 1000);
  assert.equal(fight(8, 60 + 9 * 50, 30, maxHp), 0, 'the expected raid of 8 kills it inside 30 minutes');
});
test('sunder forces tank swaps / support, and the hard enrage ends long fights', () => {
  let st = 0, last = 0; for (let i = 0; i < 12; i++) { st = nextSunder(st, last, i * 1000); last = i * 1000; }
  assert.equal(st, 12); assert.ok(Math.abs(bossHitMul(st, 1) - (1 + BOSS_RULES.sunderMax * BOSS_RULES.sunderPerStack)) < 1e-9);
  assert.equal(nextSunder(st, last, last + BOSS_RULES.sunderDecay * 1000 + 1), 1, 'stacks fall off when another player takes the boss');
  assert.equal(bossHitMul(0, BOSS_RULES.enrageMinutes), BOSS_RULES.enrageMul);
});
