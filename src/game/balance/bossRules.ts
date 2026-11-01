// Round 12: bosses can never be soloed — not even at level 100 in full max-tier +12 gear. The HP pool alone cannot
// promise that (gear keeps growing), so the rule is a mechanic that does not depend on numbers:
//  1. Unyielding (ใจอสูรไม่ยอมแพ้): while fewer than `minFighters` different players have hit the boss in the last
//     `window` seconds, it takes only `loneTakenMul` of the damage and regenerates `loneRegenPct` of its max HP per
//     second. A lone player's damage is always smaller than the regen, so HP never goes down.
//  2. Sunder (ทุบเกราะ): every boss hit on the same target adds a stack (+`sunderPerStack` damage taken, up to
//     `sunderMax`); stacks fall off after `sunderDecay` s without a hit. One target cannot hold the boss for long —
//     a tank swap, a priest's shield / heal or an enchanter's ward is needed (classes support each other).
//  3. Hard enrage at `enrageMinutes`: boss damage ×`enrageMul` until it wipes the raid or dies.
// The GM test character is immortal (separate flag), not an exception to these rules.
export type BossRules = { minFighters: number; window: number; loneTakenMul: number; loneRegenPct: number; sunderPerStack: number; sunderMax: number; sunderDecay: number; enrageMinutes: number; enrageMul: number };
export const BOSS_RULES: BossRules = { minFighters: 3, window: 30, loneTakenMul: 0.1, loneRegenPct: 0.02, sunderPerStack: 0.12, sunderMax: 10, sunderDecay: 8, enrageMinutes: 30, enrageMul: 5 };

/** players who hit the boss in the last `window` seconds (lastHit: player → ms) */
export const activeFighters = (lastHit: Map<string, number>, now: number, r: BossRules = BOSS_RULES) => { let n = 0; for (const t of lastHit.values()) if (now - t <= r.window * 1000) n++; return n; };
export const unyielding = (fighters: number, r: BossRules = BOSS_RULES) => fighters < r.minFighters;
/** damage the boss actually takes from one hit */
export const bossTakes = (damage: number, fighters: number, r: BossRules = BOSS_RULES) => Math.floor(Math.max(0, damage) * (unyielding(fighters, r) ? r.loneTakenMul : 1));
/** HP the boss regains over `dt` seconds (only while Unyielding) */
export const bossRegen = (maxHp: number, fighters: number, dt: number, r: BossRules = BOSS_RULES) => unyielding(fighters, r) ? Math.ceil(maxHp * r.loneRegenPct * dt) : 0;
/** multiplier on boss damage to a target with `stacks` Sunder stacks, after the enrage timer too */
export const bossHitMul = (stacks: number, minutes: number, r: BossRules = BOSS_RULES) => (1 + Math.min(r.sunderMax, stacks) * r.sunderPerStack) * (minutes >= r.enrageMinutes ? r.enrageMul : 1);
/** stacks after one more boss hit at `now` on a target last hit at `last` */
export const nextSunder = (stacks: number, last: number, now: number, r: BossRules = BOSS_RULES) => (now - last > r.sunderDecay * 1000 ? 0 : stacks) + 1;
