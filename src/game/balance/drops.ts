// Loot tables. Each source (field / elite / boss / offline farm) has its own rarity weights;
// rarities are gated by monster level and get slowly easier with level, so high tiers stay hard.
import { DEFAULT_CONFIG, RARITY_KEYS, type DropSource, type GameConfig, type RarityKey } from './config';

export function effectiveWeights(source: DropSource, monsterLevel: number, cfg: GameConfig = DEFAULT_CONFIG): Record<RarityKey, number> {
  const d = cfg.drops, t = d.tables[source];
  return Object.fromEntries(RARITY_KEYS.map((r, i) => {
    if (monsterLevel < d.levelGate[r] && source !== 'boss') return [r, 0];
    const w = t.weights[r] * (1 + d.levelBonus[r] * monsterLevel / 100) * Math.pow(d.tierHardness, i);
    return [r, Math.max(0, w)];
  })) as Record<RarityKey, number>;
}
/** Percent chance per kill of each rarity (for the admin preview table). */
export function dropOdds(source: DropSource, monsterLevel: number, cfg: GameConfig = DEFAULT_CONFIG): Record<RarityKey, number> {
  const w = effectiveWeights(source, monsterLevel, cfg), total = Object.values(w).reduce((a, b) => a + b, 0), t = cfg.drops.tables[source];
  const chance = Math.min(1, t.chance * cfg.drops.globalRate);
  return Object.fromEntries(RARITY_KEYS.map(r => [r, total ? (1 - Math.pow(1 - chance * w[r] / total, t.rolls)) * 100 : 0])) as Record<RarityKey, number>;
}
export function rollDrops(source: DropSource, monsterLevel: number, rng: () => number = Math.random, cfg: GameConfig = DEFAULT_CONFIG): RarityKey[] {
  const t = cfg.drops.tables[source], w = effectiveWeights(source, monsterLevel, cfg), total = Object.values(w).reduce((a, b) => a + b, 0), out: RarityKey[] = [];
  if (!total) return out;
  for (let i = 0; i < t.rolls; i++) {
    if (rng() >= Math.min(1, t.chance * cfg.drops.globalRate)) continue;
    let r = rng() * total;
    for (const k of RARITY_KEYS) { r -= w[k]; if (r <= 0) { out.push(k); break; } }
  }
  return out;
}
export const dropSourceFor = (m: { boss?: boolean; elite?: boolean }): DropSource => (m.boss ? 'boss' : m.elite ? 'elite' : 'field');
