// Boss damage dashboard: rank everyone who hit the boss, reward the top 10 on a falling scale.
// Rank 1 has a 50% chance of a high-tier item (Legendary → Arch, weighted), rank 2 25%, rank 3 15% … rank 6-10 3%.
import type { Rarity } from '@/lib/types';

export type DamageEntry = { id: string; name: string; cls: string; damage: number };
export type RankedEntry = DamageEntry & { rank: number; share: number };
export function rankBossDamage(damage: Iterable<DamageEntry>, top = 10): RankedEntry[] {
  const all = [...damage].filter(d => d.damage > 0).sort((a, b) => b.damage - a.damage);
  const total = all.reduce((a, b) => a + b.damage, 0) || 1;
  return all.slice(0, top).map((d, i) => ({ ...d, rank: i + 1, share: d.damage / total }));
}
export type RankReward = { soulGodPct: number; highTierChance: number; guaranteed: Rarity | null; materials: [string, number][] };
/** rewards by rank (index 0 = rank 1); `soulGodPct` is a share of the boss's SoulGod purse */
export const RANK_REWARDS: RankReward[] = [
  { soulGodPct: 0.20, highTierChance: 0.50, guaranteed: 'Epic', materials: [['material-6', 2], ['material-4', 3]] },
  { soulGodPct: 0.15, highTierChance: 0.25, guaranteed: 'Epic', materials: [['material-6', 1], ['material-4', 2]] },
  { soulGodPct: 0.12, highTierChance: 0.15, guaranteed: 'Epic', materials: [['material-4', 2]] },
  { soulGodPct: 0.09, highTierChance: 0.08, guaranteed: 'Rare', materials: [['material-4', 1], ['material-3', 3]] },
  { soulGodPct: 0.08, highTierChance: 0.08, guaranteed: 'Rare', materials: [['material-3', 3]] },
  ...Array.from({ length: 5 }, (): RankReward => ({ soulGodPct: 0.05, highTierChance: 0.03, guaranteed: 'Rare', materials: [['material-3', 2]] })),
];
/** everyone outside the top 10 who still dealt ≥ 1% of the damage */
export const PARTICIPATION: RankReward = { soulGodPct: 0, highTierChance: 0, guaranteed: null, materials: [['material-ore', 10], ['material-3', 1]] };
export const HIGH_TIERS: [Rarity, number][] = [['Legendary', 60], ['God', 28], ['Pre-arch', 9], ['Arch', 3]];
export function rollHighTier(rng: () => number = Math.random): Rarity {
  let r = rng() * HIGH_TIERS.reduce((a, b) => a + b[1], 0);
  for (const [k, w] of HIGH_TIERS) { if ((r -= w) < 0) return k; }
  return 'Legendary';
}
export type BossPayout = { rank: number; id: string; name: string; cls: string; damage: number; share: number; soulGod: number; highTier: Rarity | null; guaranteed: Rarity | null; materials: [string, number][] };
/** roll every top-10 reward. `purse` = total SoulGod the boss pays out to the top 10 */
export function rollBossRewards(ranked: RankedEntry[], purse: number, rng: () => number = Math.random): BossPayout[] {
  return ranked.map(r => {
    const rw = RANK_REWARDS[r.rank - 1] ?? PARTICIPATION;
    return { rank: r.rank, id: r.id, name: r.name, cls: r.cls, damage: r.damage, share: r.share, soulGod: Math.round(purse * rw.soulGodPct),
      highTier: rng() < rw.highTierChance ? rollHighTier(rng) : null, guaranteed: rw.guaranteed, materials: rw.materials };
  });
}
