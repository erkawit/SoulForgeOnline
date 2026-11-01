// Combat glue between the game store and the pure balance modules (src/game/balance).
import { makeGear, pickGearId, weaponKindOf, WEAPON_KINDS } from '@/game/items';
import type { ClassId } from '@/game/content';
import { DEFAULT_CONFIG, SPECIAL_KEYS, type ClassKey, type GameConfig, type SpecialKey } from '@/game/balance/config';
import { deriveCharacter, type ActiveBuff, type Derived, type GearLike, type ItemOption } from '@/game/balance/stats';
import { dropSourceFor, rollDrops } from '@/game/balance/drops';
import { passiveTotals, type SkillLevels, type SkillLibrary } from '@/game/skills/engine';
import type { GearSlot, Item, Monster } from './types';
import { codexBonus, type Codex } from '@/game/codex';
import { collectionBonus } from '@/game/collection';

/** cls: the balance row — 'Reaver' once promoted (content.ts statClass), else 'Berserker' */
export type DeriveInput = { cls: ClassKey; level: number; equipment: Record<GearSlot, Item | null>; buffs?: ActiveBuff[]; skillLevels?: SkillLevels; skills?: SkillLibrary; config?: GameConfig; now?: number; codex?: Codex };
/** Gear contributes base ATK/DEF, enhancement and its options. Catalog attribute bonuses are ignored: attributes come only from Rare+ options. */
export function gearOf(equipment: Record<GearSlot, Item | null>): GearLike[] {
  return Object.values(equipment).map(i => i ? { bonuses: { atk: i.bonuses.atk, def: i.bonuses.def }, options: i.options, enhance: i.enhance, soul: i.soul } : null);
}
export function deriveFor(x: DeriveInput): Derived {
  const gear = gearOf(x.equipment);
  let extra = { lowHpDmg: 0, rageGain: 0, slowResist: 0 };
  if (x.skills && x.skillLevels) {
    const p = passiveTotals(x.skills, x.skillLevels);
    // gear-like specials go through the usual sum; the Berserker-only passives (low-HP damage, Rage gain, slow resist) aside
    gear.push({ options: Object.entries(p).filter(([stat]) => (SPECIAL_KEYS as readonly string[]).includes(stat)).map(([stat, value]) => ({ kind: 'special', stat: stat as SpecialKey, value: value ?? 0 }) as ItemOption) });
    extra = { lowHpDmg: (p.lowHpDmg ?? 0) / 100, rageGain: (p.rageGain ?? 0) / 100, slowResist: Math.min(0.5, (p.slowResist ?? 0) / 100) };
  }
  // the monster codex (round 11): capped permanent specials, added like one more piece of gear
  const cb = codexBonus(x.codex, x.config ?? DEFAULT_CONFIG);
  if (Object.keys(cb).length) gear.push({ options: Object.entries(cb).map(([stat, value]) => ({ kind: 'special', stat: stat as SpecialKey, value: value ?? 0 }) as ItemOption) });
  // round 17: finished collection sets (permanent, small)
  const colb = collectionBonus(x.codex);
  if (Object.keys(colb).length) gear.push({ options: Object.entries(colb).map(([stat, value]) => ({ kind: 'special', stat: stat as SpecialKey, value: value ?? 0 }) as ItemOption) });
  const d = deriveCharacter(x.cls, x.level, gear, x.buffs ?? [], x.now ?? Date.now(), x.config ?? DEFAULT_CONFIG);
  // round 13: the two-handed weapon kind sets the swing speed (greataxe / greathammer hit harder but slower)
  const kind = weaponKindOf(x.equipment.weapon);
  return { ...d, ...extra, attackSpeed: d.attackSpeed * (kind ? WEAPON_KINDS[kind].speed : 1) };
}

/** Loot for one kill, rolled from the admin drop tables; gear prefers the killer's class. */
export function rollLoot(monster: Monster, cls: ClassId, config: GameConfig = DEFAULT_CONFIG, rng: () => number = Math.random): Item[] {
  return rollDrops(dropSourceFor(monster), monster.level, rng, config).map(r => makeGear(pickGearId(r, cls, rng), cls, rng));
}
