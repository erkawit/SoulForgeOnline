// Raid bosses (world bosses and dungeon bosses): HP is sized from the damage the expected raid deals, so a fight lasts
// 15–30 minutes whether 8 or 200 players join. When more players join, the pool grows (current HP keeps its ratio);
// it never shrinks when people leave, so a stronger raid finishes sooner (down to the 15-minute floor).
import { DEFAULT_CONFIG, type GameConfig } from './config';

/** sustained damage per second of an average geared player at this level (basic combos + skills) */
export const expectedPlayerDps = (level: number, cfg: GameConfig = DEFAULT_CONFIG) => cfg.raid.dpsBase + cfg.raid.dpsPerLevel * level;
/** pool for `players` attackers so the expected kill time is the target (22 min by default) */
export function raidBossHp(level: number, players: number, cfg: GameConfig = DEFAULT_CONFIG) {
  const n = Math.max(cfg.raid.minPlayers, Math.ceil(players));
  return Math.round(expectedPlayerDps(level, cfg) * n * cfg.raid.targetMinutes * 60 * cfg.combat.bossHpMultiplier);
}
/** grow a live boss for a bigger raid (keeps the HP ratio); returns the new hp / maxHp */
export function scaleRaidBoss(boss: { hp: number; maxHp: number; level: number }, participants: number, cfg: GameConfig = DEFAULT_CONFIG) {
  const want = raidBossHp(boss.level, participants, cfg);
  if (want <= boss.maxHp) return { hp: boss.hp, maxHp: boss.maxHp };
  const ratio = boss.hp / Math.max(1, boss.maxHp);
  return { hp: Math.round(want * ratio), maxHp: want };
}
/** minutes left at the raid's current damage rate (for the boss banner) */
export function raidEta(hp: number, recentDps: number) { return recentDps > 0 ? hp / recentDps / 60 : Infinity; }
/** expected minutes for a given raid (wiki / admin preview) */
export const raidMinutes = (level: number, maxHp: number, players: number, cfg: GameConfig = DEFAULT_CONFIG) => maxHp / (expectedPlayerDps(level, cfg) * Math.max(1, players)) / 60;
