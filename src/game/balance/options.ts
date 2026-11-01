// Random equipment options. Rare 1 attribute · Epic 2 · Legendary 3 · God 4 + 1 special · Pre-arch 4 + 2 special · Arch 4 + 3 special.
// Special values double per tier (God ×1, Pre-arch ×2, Arch ×4). No stat appears twice on one item.
import { ATTRIBUTES, DEFAULT_CONFIG, SPECIAL_KEYS, type AttributeId, type ClassKey, type GameConfig, type RarityKey, type SpecialKey } from './config';
import type { ItemOption } from './stats';

/** Specials that make sense per class (a Berserker never rolls Healing power). */
export const CLASS_SPECIALS: Record<ClassKey, SpecialKey[]> = {
  Berserker: ['atkPct', 'defPct', 'hpPct', 'critRate', 'critDmg', 'atkSpeed', 'skillDmg', 'bossDmg', 'lifesteal', 'dmgReduce', 'moveSpeed', 'cdr'],
  Reaver: ['atkPct', 'defPct', 'hpPct', 'critRate', 'critDmg', 'atkSpeed', 'skillDmg', 'bossDmg', 'lifesteal', 'dmgReduce', 'moveSpeed', 'cdr'],
};

function pickWeighted<T>(items: T[], weight: (t: T) => number, rng: () => number) {
  const total = items.reduce((s, t) => s + weight(t), 0); let r = rng() * total;
  for (const t of items) { r -= weight(t); if (r <= 0) return t; }
  return items[items.length - 1];
}

export function rollOptions(rarity: RarityKey, cls: ClassKey | null, rng: () => number = Math.random, cfg: GameConfig = DEFAULT_CONFIG): ItemOption[] {
  const o = cfg.options, out: ItemOption[] = [];
  const primary = new Set<AttributeId>(cls ? cfg.classes[cls].primary : []);
  const attrs = [...ATTRIBUTES];
  for (let i = 0; i < o.attributeLines[rarity] && attrs.length; i++) {
    const stat = pickWeighted(attrs, a => (primary.has(a) ? o.primaryWeight : 1), rng); attrs.splice(attrs.indexOf(stat), 1);
    const [lo, hi] = o.attributeRange[rarity]; out.push({ kind: 'attr', stat, value: lo + Math.floor(rng() * (hi - lo + 1)) });
  }
  const pool = [...(cls ? CLASS_SPECIALS[cls] : SPECIAL_KEYS)];
  for (let i = 0; i < o.specialLines[rarity] && pool.length; i++) {
    const stat = pool.splice(Math.floor(rng() * pool.length), 1)[0];
    const base = o.specialGodValue[stat] * o.specialTierMultiplier[rarity];
    // ±25% spread around the tier value, never below the tier's floor of 75%
    out.push({ kind: 'special', stat, value: Math.round(base * (0.75 + rng() * 0.5) * 10) / 10 });
  }
  return out;
}

/** Does this options list respect the rarity rules? Used by tests and by server validation of client-shown items. */
export function optionsValid(rarity: RarityKey, options: ItemOption[], cfg: GameConfig = DEFAULT_CONFIG) {
  const a = options.filter(x => x.kind === 'attr'), s = options.filter(x => x.kind === 'special');
  const unique = new Set(options.map(x => x.kind + x.stat)).size === options.length;
  return unique && a.length === cfg.options.attributeLines[rarity] && s.length === cfg.options.specialLines[rarity];
}
