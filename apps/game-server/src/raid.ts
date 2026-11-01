// World-boss raid rules on the server — mirror of src/game/balance/raid.ts + bossRewards.ts (kept dependency-free so
// the realm runs standalone). HP is sized for the crowd: expected per-player DPS × max(8, challengers) × 22 minutes,
// re-scaled upward (never down, HP ratio kept) as more players join, so a kill takes ~15–30 minutes.
export const RAID = { targetMinutes: 22, minPlayers: 8, maxMinutes: 40 };
/** what one server-side character deals per second on average (basic 0.7 s + soul burst every 4 s at MVP stats) */
export const SERVER_PLAYER_DPS = 70;
export const raidHp = (players: number) => Math.round(SERVER_PLAYER_DPS * Math.max(RAID.minPlayers, players) * RAID.targetMinutes * 60);
/** round 13 fix: size the boss from the real fighters, not a fixed 70 DPS each. `dps` = each challenger's single-target
 *  upper bound (CharacterSession.singleTargetDps); a real player deals about EXPECTED_DPS_SHARE of it over a long fight.
 *  Fewer than RAID.minPlayers challengers are padded with their average, so the fight still lasts ~targetMinutes. */
export const EXPECTED_DPS_SHARE = Number(process.env.BOSS_EXPECTED_DPS_SHARE ?? 0.5);
export function raidHpFor(dps: number[]): number {
  const per = dps.map(d => Math.max(SERVER_PLAYER_DPS, (Number.isFinite(d) ? d : 0) * EXPECTED_DPS_SHARE));
  const sum = per.reduce((a, b) => a + b, 0), avg = per.length ? sum / per.length : SERVER_PLAYER_DPS;
  return Math.round((sum + avg * Math.max(0, RAID.minPlayers - per.length)) * RAID.targetMinutes * 60);
}
export type Ranked = { rank: number; id: string; name: string; classId: string; damage: number; share: number };
export function rankDamage(contrib: Map<string, number>, who: (id: string) => { name?: string; classId?: string } | undefined, top = 10): Ranked[] {
  const total = [...contrib.values()].reduce((a, b) => a + b, 0) || 1;
  return [...contrib.entries()].sort((a, b) => b[1] - a[1]).slice(0, top).map(([id, damage], i) => ({ rank: i + 1, id, name: who(id)?.name ?? 'ผู้กล้า', classId: who(id)?.classId ?? 'Berserker', damage, share: damage / total }));
}
const RANK = [
  { soulGodPct: 0.20, highTier: 0.50, guaranteed: 'Epic' }, { soulGodPct: 0.15, highTier: 0.25, guaranteed: 'Epic' }, { soulGodPct: 0.12, highTier: 0.15, guaranteed: 'Epic' },
  { soulGodPct: 0.09, highTier: 0.08, guaranteed: 'Rare' }, { soulGodPct: 0.08, highTier: 0.08, guaranteed: 'Rare' },
  ...Array.from({ length: 5 }, () => ({ soulGodPct: 0.05, highTier: 0.03, guaranteed: 'Rare' })),
];
const HIGH: [string, number][] = [['Legendary', 60], ['God', 28], ['Pre-arch', 9], ['Arch', 3]];
function highTier(rng: () => number) { let r = rng() * 100; for (const [t, w] of HIGH) { if ((r -= w) < 0) return t; } return 'Legendary'; }
export function rewards(ranked: Ranked[], purse: number, rng: () => number = Math.random) {
  return ranked.map(r => { const rw = RANK[r.rank - 1]; return { ...r, soulGod: Math.round(purse * rw.soulGodPct), guaranteed: rw.guaranteed, highTier: rng() < rw.highTier ? highTier(rng) : null }; });
}
