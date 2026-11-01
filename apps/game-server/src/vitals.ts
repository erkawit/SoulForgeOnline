// HP / MP that the browser reports with POS (round 13 fix). The field fight is still simulated in the browser, so the
// realm cannot know every hit the character took — but it no longer believes a client that says "I am at full HP".
//  · a LOWER value is always accepted (the client took damage from its own monsters)
//  · a HIGHER value is accepted only up to what the character could have healed since the last report:
//      maxHp × hpPctPerSec × seconds (natural regen, life steal, heal skills, party heals — deliberately generous)
//      + `credit` for heals the realm itself granted (a potion used through ACT, see index.ts)
//  · while the realm considers the character dead (the world boss killed it) nothing heals until the ACT 'respawn'
// Level-ups, respawn and login set full HP directly in index.ts, not here.
export type VitalsLimits = { hpPctPerSec: number; mpPctPerSec: number; maxGapSec: number };
export const VITALS: VitalsLimits = {
  hpPctPerSec: Number(process.env.HP_HEAL_PCT_PER_SEC ?? 0.08),
  mpPctPerSec: Number(process.env.MP_REGEN_PCT_PER_SEC ?? 0.25),
  maxGapSec: 5,
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** one stat: the value the realm keeps after a report */
export function acceptStat(current: number, reported: number | undefined, max: number, gainBudget: number): number {
  const cur = clamp(Number.isFinite(current) ? current : 0, 0, max);
  if (reported === undefined || !Number.isFinite(reported)) return cur;
  const rep = clamp(reported, 0, max);
  if (rep <= cur) return rep;
  return Math.min(rep, cur + Math.max(0, gainBudget));
}

/** HP and MP after one POS report. `dtMs` = time since the previous report; `credit` = HP the realm granted itself. */
export function acceptVitals(
  cur: { hp: number; mp: number }, rep: { hp?: number; mp?: number }, max: { hp: number; mp: number },
  dtMs: number, opts: { dead?: boolean; credit?: number } = {}, v: VitalsLimits = VITALS,
): { hp: number; mp: number; creditLeft: number } {
  const sec = clamp(dtMs / 1000, 0, v.maxGapSec), credit = Math.max(0, opts.credit ?? 0);
  if (opts.dead) return { hp: 0, mp: acceptStat(cur.mp, rep.mp, max.mp, max.mp * v.mpPctPerSec * sec), creditLeft: credit };
  const budget = max.hp * v.hpPctPerSec * sec + credit;
  const hp = acceptStat(cur.hp, rep.hp, max.hp, budget);
  const used = Math.max(0, hp - clamp(cur.hp, 0, max.hp) - max.hp * v.hpPctPerSec * sec);
  return { hp, mp: acceptStat(cur.mp, rep.mp, max.mp, max.mp * v.mpPctPerSec * sec), creditLeft: Math.max(0, credit - used) };
}
