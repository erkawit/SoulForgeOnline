// Character statistics: fixed class attributes (no stat points) + equipment options + buffs.
import { ATTRIBUTES, DEFAULT_CONFIG, SPECIAL_KEYS, type AttributeBlock, type AttributeId, type ClassKey, type GameConfig, type SpecialKey } from './config';
import { enhanceMultiplier } from './enhance';

export type ItemOption = { kind: 'attr'; stat: AttributeId; value: number } | { kind: 'special'; stat: SpecialKey; value: number };
/** The parts of an equipped item that feed stats. Matches the game's Item type (extra fields ignored). */
export type GearLike = { bonuses?: { atk?: number; def?: number; str?: number; int?: number; dex?: number; agi?: number; wis?: number; vit?: number }; options?: ItemOption[]; enhance?: number; soul?: string } | null;
export type ActiveBuff = { id: string; source: string; atkPct?: number; defPct?: number; expPct?: number; hpRegen?: number; moveSpeed?: number; critRate?: number;
  /** round 13 (Blood / Dread Howl): attack speed %, and extra damage TAKEN % (the price of the howl) */ atkSpeed?: number; dmgTaken?: number; until: number };

export type Derived = {
  attrs: AttributeBlock; special: Record<SpecialKey, number>;
  maxHp: number; maxMp: number; attack: number; defense: number; crit: number; critDamage: number; speed: number; attackSpeed: number; evade: number; hit: number;
  healPower: number; buffPotency: number; cdr: number; hpRegen: number; mpRegen: number; skillDmg: number; bossDmg: number; lifesteal: number; dmgReduce: number; expBonus: number;
  damageKind: 'physical' | 'magic';
  /** round 13 Berserker passives (0 without them): damage dealt while HP ≤ 40 %, Rage gain multiplier bonus, slow duration
   *  reduction — all ratios (0.15 = 15 %). dmgTaken = extra damage taken from an active howl. */
  lowHpDmg: number; rageGain: number; slowResist: number; dmgTaken: number;
};

const emptySpecial = () => Object.fromEntries(SPECIAL_KEYS.map(k => [k, 0])) as Record<SpecialKey, number>;

/** Sum gear: attribute options + legacy flat bonuses, enhancement scales the item's base ATK/DEF. */
export function gearTotals(gear: GearLike[], cfg: GameConfig = DEFAULT_CONFIG) {
  const attrs = Object.fromEntries(ATTRIBUTES.map(a => [a, 0])) as AttributeBlock; const special = emptySpecial(); let atk = 0, def = 0;
  for (const item of gear) {
    if (!item) continue;
    const mult = enhanceMultiplier(item.enhance ?? 0, cfg);
    atk += (item.bonuses?.atk ?? 0) * mult + (item.soul ? 6 : 0); def += (item.bonuses?.def ?? 0) * mult;
    for (const a of ATTRIBUTES) attrs[a] += item.bonuses?.[a] ?? 0;
    for (const o of item.options ?? []) { if (o.kind === 'attr') attrs[o.stat] += o.value; else special[o.stat] += o.value; }
  }
  return { attrs, special, atk, def };
}

export function deriveCharacter(cls: ClassKey, level: number, gear: GearLike[], buffs: ActiveBuff[] = [], now = Date.now(), cfg: GameConfig = DEFAULT_CONFIG): Derived {
  const c = cfg.classes[cls], v = cfg.attributeValue, g = gearTotals(gear, cfg);
  const attrs = Object.fromEntries(ATTRIBUTES.map(a => [a, c.base[a] + g.attrs[a]])) as AttributeBlock;
  const s = g.special, live = buffs.filter(b => b.until > now);
  // Same-type buffs never stack: the strongest source wins (newbie buff vs a howl vs food).
  const best = (k: 'atkPct' | 'defPct' | 'expPct' | 'hpRegen' | 'moveSpeed' | 'critRate' | 'atkSpeed' | 'dmgTaken') => Math.max(0, ...live.map(b => b[k] ?? 0));
  const L = Math.max(1, level);
  // round 13: Berserker and Reaver are both physical two-handed fighters (STR main, DEX for precision)
  // round 20: primary[0] is the attack stat (STR keeps the Berserker formula); INT / WIS casters deal magic damage
  const main = c.primary[0] ?? 'str', second = c.primary[1] ?? 'dex';
  const physical = main !== 'int' && main !== 'wis';
  const mainAtk = main === 'str' ? attrs.str * v.strAtk + attrs.dex
    : main === 'int' ? attrs.int * v.intMatk + attrs[second] * 0.5
    : main === 'wis' ? attrs.wis * v.intMatk * 0.8 + attrs[second] * 0.5
    : attrs[main] * v.dexAtk + attrs[second];
  const attack = (10 + L * c.atkPerLevel + mainAtk + g.atk) * (1 + (s.atkPct + best('atkPct')) / 100) * c.damageMultiplier;
  const defense = (3 + L * c.defPerLevel + attrs.vit * v.vitDef + attrs.str * v.strDef + g.def) * (1 + (s.defPct + best('defPct')) / 100);
  const maxHp = (100 + L * c.hpPerLevel + attrs.vit * v.vitHp) * (1 + s.hpPct / 100);
  const maxMp = (40 + L * c.mpPerLevel + attrs.int * v.intMp + attrs.wis * v.wisMp) * (1 + s.mpPct / 100);
  return {
    attrs, special: s, damageKind: physical ? 'physical' : 'magic',
    maxHp: Math.round(maxHp), maxMp: Math.round(maxMp), attack: Math.round(attack), defense: Math.round(defense),
    crit: Math.min(cfg.combat.critCap, cfg.combat.critBase + attrs.agi * v.agiCrit + (s.critRate + best('critRate')) / 100),
    critDamage: cfg.combat.critDamageBase + attrs.dex * v.dexCritDmg + s.critDmg / 100,
    speed: Math.min(8, 3.6 + attrs.agi * v.agiSpeed) * (1 + (s.moveSpeed + best('moveSpeed')) / 100),
    attackSpeed: 1 + attrs.agi * v.agiAtkSpeed + (s.atkSpeed + best('atkSpeed')) / 100,
    evade: Math.min(0.35, attrs.agi * v.agiEvade), hit: Math.min(1, 0.9 + attrs.dex * v.dexHit),
    healPower: (1 + attrs.wis * v.wisHeal + s.healPower / 100) * c.healingMultiplier,
    buffPotency: 1 + attrs.wis * v.wisBuff,
    cdr: Math.min(0.4, attrs.wis * v.wisCdr + s.cdr / 100),
    hpRegen: attrs.vit * v.vitRegen + best('hpRegen'), mpRegen: 1 + attrs.wis * v.wisMpRegen,
    skillDmg: s.skillDmg / 100, bossDmg: s.bossDmg / 100, lifesteal: s.lifesteal / 100, dmgReduce: Math.min(0.5, s.dmgReduce / 100), expBonus: best('expPct') / 100,
    lowHpDmg: 0, rageGain: 0, slowResist: 0, dmgTaken: best('dmgTaken') / 100,
  };
}

/** Monster numbers, tuned against the class bases above (a Lv1 Berserker two-shots a Lv1 monster). */
export function monsterStats(level: number, opts: { elite?: boolean; boss?: boolean; dungeon?: boolean } = {}, cfg: GameConfig = DEFAULT_CONFIG) {
  const k = cfg.combat;
  const hp = (140 + level * 34) * (opts.dungeon ? 3 : 1) * (opts.boss ? 6 * k.bossHpMultiplier : 1) * (opts.elite && !opts.boss ? 1.5 : 1);
  const damage = (12 + level * 6) * k.monsterDamageMultiplier * (opts.boss ? k.bossDamageMultiplier * 1.8 : 1) * (opts.elite && !opts.boss ? k.eliteDamageMultiplier : 1) * (opts.dungeon ? 2 : 1);
  return { maxHp: Math.round(hp), damage, defense: level * 3 };
}

/** One hit. `skillMultiplier` comes from the skill definition; boss bonus and skill damage options apply here. */
export function rollDamage(d: Derived, targetDefense: number, skillMultiplier = 1, opts: { boss?: boolean; skill?: boolean; rng?: () => number } = {}) {
  const rng = opts.rng ?? Math.random; const crit = rng() < d.crit;
  const raw = d.attack * (0.9 + rng() * 0.2) * skillMultiplier * (opts.skill ? 1 + d.skillDmg : 1) * (opts.boss ? 1 + d.bossDmg : 1) * (crit ? d.critDamage : 1);
  return { damage: Math.max(1, Math.round(raw - targetDefense * 0.35)), crit };
}
/** Damage a monster deals to a character after defense, evasion and damage reduction. */
export function incomingDamage(d: Derived, raw: number, rng: () => number = Math.random) {
  if (rng() < d.evade) return 0;
  return Math.max(1, Math.round((raw - d.defense * 0.18) * (1 - d.dmgReduce) * (1 + (d.dmgTaken ?? 0))));
}

export const ATTRIBUTE_HELP: Record<AttributeId, string> = {
  str: 'พลังโจมตีกายภาพ (+4/แต้ม) และป้องกันเล็กน้อย',
  int: 'MP (Berserker ไม่ใช้พลังเวท)',
  dex: 'พลังโจมตี +1/แต้ม ความแม่นยำ และแรงคริติคอล',
  agi: 'ความเร็ววิ่ง ความเร็วโจมตี โอกาสคริติคอล และหลบหลีก',
  wis: 'MP, ฟื้น MP, พลังรักษา, ความแรงบัฟ และลดคูลดาวน์',
  vit: 'HP (+18/แต้ม), ป้องกัน และฟื้น HP',
};
