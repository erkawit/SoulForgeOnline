// Crafting at Brannoc Ironhand. Pure rules shared by the client, the preview and SQL (craft_item / craft_with_crystals).
// • Cost grows with the tier: SoulGod × slot multiplier + Soulforged Ore, Eclipse Shards, Regent Cores, Solar Hearts.
// • Common…Epic always succeed. Legendary 75% · God 70% · Pre-arch 60% · Arch 45% (admin-tunable).
// • A failed high-tier craft consumes everything but leaves 1 crystal of that tier. 3 crystals of one tier = a guaranteed
//   craft of that tier: the player picks the item type (and the weapon kind); the crystals vanish and the item is created.
// Round 13: one class — heavy armour, physical seals, two-handed weapons (greatsword / greataxe / greathammer), no off-hand.
import type { ClassId } from '../content';
import { weaponId, type WeaponKind } from '../items';
import type { GearSlot, Rarity } from '@/lib/types';
import { DEFAULT_CONFIG, RARITY_KEYS, type GameConfig } from './config';

export const CRAFT_SLOTS = ['weapon', 'armor', 'helmet', 'gloves', 'boots', 'ring'] as const satisfies readonly GearSlot[];
export type CraftSlot = typeof CRAFT_SLOTS[number];
export const CRAFT_SLOT_TH: Record<CraftSlot, string> = { weapon: 'อาวุธสองมือ', armor: 'เกราะ', helmet: 'หมวก', gloves: 'ถุงมือ', boots: 'รองเท้า', ring: 'แหวน/ตรา' };
export const CRYSTAL_TIERS = ['Legendary', 'God', 'Pre-arch', 'Arch'] as const;
export type CrystalTier = typeof CRYSTAL_TIERS[number];
export const isCrystalTier = (r: Rarity): r is CrystalTier => (CRYSTAL_TIERS as readonly string[]).includes(r);
export const crystalId = (r: CrystalTier) => `crystal-${r}`;
export const MATERIAL_IDS = { ore: 'material-ore', shard: 'material-3', core: 'material-4', heart: 'material-6' } as const;
export const MATERIAL_TH: Record<string, string> = { 'material-ore': 'แร่หลอมวิญญาณ', 'material-3': 'Eclipse Shard', 'material-4': 'Regent Core', 'material-6': 'Solar Heart' };

export type CraftCost = { soulGod: number; materials: { id: string; qty: number }[] };
export function craftCost(rarity: Rarity, slot: CraftSlot, cfg: GameConfig = DEFAULT_CONFIG): CraftCost {
  const c = cfg.craft, m = slot === 'weapon' ? c.slotMultiplier.weapon : slot === 'armor' ? c.slotMultiplier.armor : c.slotMultiplier.other;
  const materials = ([['ore', c.ore], ['shard', c.shard], ['core', c.core], ['heart', c.heart]] as const)
    .map(([k, t]) => ({ id: MATERIAL_IDS[k], qty: Math.ceil(t[rarity] * (slot === 'weapon' ? 1.5 : 1)) })).filter(x => x.qty > 0);
  return { soulGod: Math.round(c.soulGod[rarity] * m), materials };
}
export const craftChance = (rarity: Rarity, cfg: GameConfig = DEFAULT_CONFIG) => cfg.craft.successRate[rarity];
export const WEAPON_KINDS_LIST: WeaponKind[] = ['greatsword', 'greataxe', 'greathammer'];
/** catalog definition crafted at a rarity for an item type (weapons: the chosen kind; the random craft rolls one) */
export function craftDefId(rarity: Rarity, cls: ClassId, slot: CraftSlot, kind: WeaponKind = 'greatsword') {
  void cls; const tier = RARITY_KEYS.indexOf(rarity);
  if (slot === 'weapon') return weaponId(kind, tier);
  if (slot === 'ring') return `accessory-physical-${tier}`;
  return `heavy-${slot}-${tier}`;
}

export type Wallet = { soulGod: number; count: (id: string) => number };
/** why a craft can't start (null = can craft) */
export function craftBlocker(rarity: Rarity, slot: CraftSlot, w: Wallet, cfg: GameConfig = DEFAULT_CONFIG): string | null {
  const cost = craftCost(rarity, slot, cfg);
  if (w.soulGod < cost.soulGod) return `SoulGod ไม่พอ (ต้องการ ${cost.soulGod.toLocaleString()})`;
  for (const m of cost.materials) if (w.count(m.id) < m.qty) return `${MATERIAL_TH[m.id] ?? m.id} ไม่พอ (${w.count(m.id)}/${m.qty})`;
  return null;
}
export type CraftRoll = { success: true; defId: string } | { success: false; crystal: string | null };
/** roll one craft. Costs are always paid; on a Legendary+ failure the player receives one crystal of that tier. */
export function rollCraft(rarity: Rarity, cls: ClassId, slot: CraftSlot, rng: () => number = Math.random, cfg: GameConfig = DEFAULT_CONFIG): CraftRoll {
  if (rng() < craftChance(rarity, cfg)) return { success: true, defId: craftDefId(rarity, cls, slot, WEAPON_KINDS_LIST[Math.floor(rng() * 3) % 3]) };
  return { success: false, crystal: isCrystalTier(rarity) ? crystalId(rarity) : null };
}
/** 3 crystals of one tier → that tier, guaranteed, for the item type (and weapon kind) the player picks */
export function crystalCraft(tier: CrystalTier, cls: ClassId, slot: CraftSlot, have: number, cfg: GameConfig = DEFAULT_CONFIG, kind: WeaponKind = 'greatsword'): { ok: true; defId: string; spend: number } | { ok: false; reason: string } {
  const need = cfg.craft.crystalsForGuarantee;
  if (have < need) return { ok: false, reason: `ต้องมี${tier} Forge Crystal ${need} เม็ด (มี ${have})` };
  return { ok: true, defId: craftDefId(tier, cls, slot, kind), spend: need };
}
/** expected attempts and SoulGod until the first success, counting the crystal pity (for the craft window / wiki) */
export function expectedCraft(rarity: Rarity, slot: CraftSlot, cfg: GameConfig = DEFAULT_CONFIG) {
  const p = craftChance(rarity, cfg), cost = craftCost(rarity, slot, cfg).soulGod, need = cfg.craft.crystalsForGuarantee;
  if (p >= 1 || !isCrystalTier(rarity)) return { attempts: 1, soulGod: cost };
  // attempts until success or `need` failures (then the crystal craft is free)
  let e = 0; for (let k = 0; k < need; k++) e += Math.pow(1 - p, k);
  return { attempts: Math.round(e * 100) / 100, soulGod: Math.round(e * cost) };
}
