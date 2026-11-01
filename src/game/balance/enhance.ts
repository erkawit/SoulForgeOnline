// Equipment enhancement (+1 … +15). Only the NPC Merchant (blacksmith) in a city performs it; every cost is burned.
import { DEFAULT_CONFIG, type GameConfig, type RarityKey } from './config';

/** Multiplier applied to an item's base ATK/DEF at a given enhance level. */
export function enhanceMultiplier(level: number, cfg: GameConfig = DEFAULT_CONFIG) {
  const e = cfg.enhance, l = Math.max(0, Math.min(e.maxLevel, Math.floor(level)));
  return 1 + Math.min(l, 10) * e.bonusPerLevel + Math.max(0, l - 10) * e.bonusPerLevelAfter10;
}
/** SoulGod to attempt current → current+1. */
export function enhanceCost(rarity: RarityKey, current: number, cfg: GameConfig = DEFAULT_CONFIG) {
  return Math.round(cfg.enhance.baseCost[rarity] * Math.pow(current + 1, cfg.enhance.costExponent));
}
export function enhanceChance(current: number, cfg: GameConfig = DEFAULT_CONFIG) {
  return cfg.enhance.successRate[current] ?? 0;
}
export type EnhanceOutcome = { ok: boolean; level: number; cost: number; chance: number; result: 'success' | 'fail-safe' | 'fail-downgrade' | 'fail-protected' | 'max' };
/** Pure resolution, mirrored by the SQL function `enhance_item` (which is authoritative online). */
export function resolveEnhance(rarity: RarityKey, current: number, protection: boolean, rng: () => number = Math.random, cfg: GameConfig = DEFAULT_CONFIG): EnhanceOutcome {
  const e = cfg.enhance;
  if (current >= e.maxLevel) return { ok: false, level: current, cost: 0, chance: 0, result: 'max' };
  const cost = enhanceCost(rarity, current, cfg) + (protection ? e.protectionScrollPrice : 0), chance = enhanceChance(current, cfg);
  if (rng() < chance) return { ok: true, level: current + 1, cost, chance, result: 'success' };
  if (current < e.safeLevel) return { ok: false, level: current, cost, chance, result: 'fail-safe' };
  if (protection) return { ok: false, level: current, cost, chance, result: 'fail-protected' };
  return { ok: false, level: Math.max(0, current - e.downgradeOnFail), cost, chance, result: 'fail-downgrade' };
}
