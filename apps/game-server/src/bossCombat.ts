// The world boss fights back on the realm (round 13 fix). Before this the Titan never attacked, so the Sunder and
// hard-enrage rules of round 12 (src/game/balance/bossRules.ts) existed only on paper.
//  · every swing the boss picks the fighter with the most damage on it (threat) inside `reach`, nearest on a tie
//  · Sunder: hits on the same target stack (+12 %/stack, 10 max, falls off after 8 s) → tanks must swap / be supported
//  · Hard enrage at 30 min: ×5 damage. Below 30 % HP (phase 'enraged') the boss also swings faster.
//  · a hit is a flat part (boss attack) plus a share of the target's max HP, so it threatens level 20 and level 100
//    characters alike; defense, evasion and damage reduction then apply exactly like monster hits in the browser
//    (incomingDamage). Shields / guard skills simulated only in the browser do not reduce the realm's number.
// Pure (no sockets) so it can be tested on its own: apps/game-server/test/bossCombat.test.ts
import { BOSS_RULES, bossHitMul, nextSunder, type BossRules } from '@/game/balance/bossRules';

export type BossCombatConfig = { swingMs: number; enragedSwingMs: number; reach: number; hpShare: number };
export const BOSS_COMBAT: BossCombatConfig = {
  swingMs: Number(process.env.BOSS_SWING_MS ?? 2200),
  enragedSwingMs: Number(process.env.BOSS_ENRAGED_SWING_MS ?? 1600),
  reach: Number(process.env.BOSS_REACH ?? 9),
  hpShare: Number(process.env.BOSS_HP_SHARE ?? 0.05),
};

export type BossFighter = { id: string; x: number; z: number; city?: string; hp: number; maxHp: number; defense: number; evade?: number; dmgReduce?: number; immortal?: boolean };
export type BossBody = { id: string; x: number; z: number; attack: number; hp: number; spawnedAt: number; phase: 'active' | 'enraged'; contributions: Map<string, number> };
export type SwingState = { nextAt: number; sunder: Map<string, { stacks: number; last: number }> };
export type Strike = { type: 'BOSS_STRIKE'; boss: string; target: string; raw: number; damage: number; evaded: boolean; hp: number; maxHp: number; stacks: number; enraged: boolean; killed: boolean };

export const newSwingState = (now: number, firstDelayMs = 4000): SwingState => ({ nextAt: now + firstDelayMs, sunder: new Map() });

/** who the boss hits now, or null (nobody alive in reach) */
export function pickTarget(boss: BossBody, fighters: Iterable<BossFighter>, c: BossCombatConfig = BOSS_COMBAT): BossFighter | null {
  let best: BossFighter | null = null, bestThreat = -1, bestDist = Infinity;
  for (const f of fighters) {
    if ((f.city ?? 'hollow') !== 'hollow' || f.hp <= 0) continue;
    const dist = Math.hypot(f.x - boss.x, f.z - boss.z); if (dist > c.reach) continue;
    const threat = boss.contributions.get(f.id) ?? 0;
    if (threat > bestThreat || (threat === bestThreat && dist < bestDist)) { best = f; bestThreat = threat; bestDist = dist; }
  }
  return best;
}

/** one boss turn. Mutates `st` (timer, sunder stacks) and the target's hp; returns the strike to broadcast, or null. */
export function bossSwing(boss: BossBody, fighters: Iterable<BossFighter>, st: SwingState, now: number,
  rng: () => number = Math.random, rules: BossRules = BOSS_RULES, c: BossCombatConfig = BOSS_COMBAT): Strike | null {
  if (boss.hp <= 0 || now < st.nextAt) return null;
  const minutes = (now - boss.spawnedAt) / 60_000, enraged = boss.phase === 'enraged' || minutes >= rules.enrageMinutes;
  st.nextAt = now + (enraged ? c.enragedSwingMs : c.swingMs);
  const t = pickTarget(boss, fighters, c); if (!t) return null;
  // the stacks the target carries when struck raise this hit; the hit then adds one more (capped at sunderMax)
  const prev = st.sunder.get(t.id), carried = nextSunder(prev?.stacks ?? 0, prev?.last ?? -Infinity, now, rules) - 1;
  const stacks = Math.min(rules.sunderMax, carried + 1); st.sunder.set(t.id, { stacks, last: now });
  const raw = Math.round((boss.attack + t.maxHp * c.hpShare) * bossHitMul(carried, minutes, rules));
  const evaded = rng() < (t.evade ?? 0);
  const damage = evaded ? 0 : Math.max(1, Math.round((raw - t.defense * 0.18) * (1 - (t.dmgReduce ?? 0))));
  t.hp = t.immortal ? Math.max(1, t.hp - damage) : Math.max(0, t.hp - damage);
  return { type: 'BOSS_STRIKE', boss: boss.id, target: t.id, raw, damage, evaded, hp: t.hp, maxHp: t.maxHp, stacks, enraged, killed: t.hp <= 0 };
}
