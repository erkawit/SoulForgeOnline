// SoulForge balance configuration — every number a game master may tune lives here.
// Defaults ship with the client; admins override any part through the `game_config` table (Admin → Balance).
// Pure module: no React, no Supabase, safe for tests, the game server and SQL documentation.

export const ATTRIBUTES = ['str', 'int', 'dex', 'agi', 'wis', 'vit'] as const;
export type AttributeId = typeof ATTRIBUTES[number];
export type AttributeBlock = Record<AttributeId, number>;
export const ATTRIBUTE_LABEL: Record<AttributeId, string> = { str: 'STR', int: 'INT', dex: 'DEX', agi: 'AGI', wis: 'WIS', vit: 'VIT' };

// Round 13: one class. Every character is a Berserker; at Lv60 it advances to Reaver (player.promotionId), which uses the
// Reaver row below (STR+8 DEX+2 AGI+2 VIT+6 on top of the Berserker base — output/berserker-reaver-review/…/reaver/data/balance.json).
export const CLASS_KEYS = ['Paladin', 'Berserker', 'Hawkeye', 'RuneMaster', 'Elementalist', 'Assassin', 'HighPriest', 'Inquisitor', 'Reaver'] as const;
export type ClassKey = typeof CLASS_KEYS[number];
export const RARITY_KEYS = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'God', 'Pre-arch', 'Arch'] as const;
export type RarityKey = typeof RARITY_KEYS[number];

/** Special (percentage) options that only God / Pre-arch / Arch gear can roll. Values below are the God value; each tier above doubles it. */
export const SPECIAL_KEYS = ['atkPct', 'defPct', 'hpPct', 'mpPct', 'critRate', 'critDmg', 'atkSpeed', 'skillDmg', 'cdr', 'bossDmg', 'lifesteal', 'healPower', 'dmgReduce', 'moveSpeed'] as const;
export type SpecialKey = typeof SPECIAL_KEYS[number];
export const SPECIAL_LABEL: Record<SpecialKey, string> = {
  atkPct: 'Attack', defPct: 'Defense', hpPct: 'Max HP', mpPct: 'Max MP', critRate: 'Critical rate', critDmg: 'Critical damage', atkSpeed: 'Attack speed',
  skillDmg: 'Skill damage', cdr: 'Cooldown reduction', bossDmg: 'Damage to bosses', lifesteal: 'Life steal', healPower: 'Healing power', dmgReduce: 'Damage reduction', moveSpeed: 'Move speed',
};

export type DropSource = 'field' | 'elite' | 'boss' | 'farm';
export type DropTable = { chance: number; rolls: number; weights: Record<RarityKey, number> };

export type GameConfig = {
  version: number;
  classes: Record<ClassKey, { base: AttributeBlock; primary: AttributeId[]; hpPerLevel: number; mpPerLevel: number; atkPerLevel: number; defPerLevel: number; damageMultiplier: number; healingMultiplier: number }>;
  /** What one point of each attribute is worth. One point should be felt, so values are deliberately large. */
  attributeValue: {
    strAtk: number; strDef: number; intMatk: number; intMp: number; dexAtk: number; dexCritDmg: number; dexHit: number;
    agiSpeed: number; agiAtkSpeed: number; agiCrit: number; agiEvade: number; wisMp: number; wisMpRegen: number; wisHeal: number; wisBuff: number; wisCdr: number;
    vitHp: number; vitDef: number; vitRegen: number;
  };
  combat: { monsterDamageMultiplier: number; bossDamageMultiplier: number; bossHpMultiplier: number; eliteDamageMultiplier: number; pvpDamageMultiplier: number; critBase: number; critCap: number; critDamageBase: number };
  drops: {
    tables: Record<DropSource, DropTable>;
    /** a rarity can't drop from monsters below this level */
    levelGate: Record<RarityKey, number>;
    /** each rarity's weight multiplies by (1 + levelBonus × monsterLevel/100) — higher tiers get easier slowly, never cheap */
    levelBonus: Record<RarityKey, number>;
    /** global hardness: weight × hardness^tierIndex — raise to make high tiers rarer everywhere */
    tierHardness: number;
    globalRate: number;
  };
  options: {
    /** number of attribute lines per rarity (Rare 1, Epic 2, Legendary 3, God+ 4) */
    attributeLines: Record<RarityKey, number>;
    /** number of special lines per rarity (God 1, Pre-arch 2, Arch 3) */
    specialLines: Record<RarityKey, number>;
    attributeRange: Record<RarityKey, [number, number]>;
    /** God values; Pre-arch ×2, Arch ×4 */
    specialGodValue: Record<SpecialKey, number>;
    specialTierMultiplier: Record<RarityKey, number>;
    primaryWeight: number;
  };
  enhance: { maxLevel: number; successRate: number[]; baseCost: Record<RarityKey, number>; costExponent: number; safeLevel: number; downgradeOnFail: number; bonusPerLevel: number; bonusPerLevelAfter10: number; protectionScrollPrice: number };
  /** Player market (realm-run, round 10). The listing fee is never refunded and, like the sales tax, leaves the economy
   *  (burned). salesTaxPct is the starting tax; with `inflation` on, the realm moves the live tax between taxMin and
   *  taxMax once a day so the SoulGod in circulation grows by about targetWeeklyGrowth a week. */
  market: { floor: Record<RarityKey, number>; floorPerEnhance: number; medianFloorRatio: number; listingFeePct: number; listingFeeMin: number; salesTaxPct: number; maxActiveListings: number; relistCooldownMinutes: number; listingHours: number;
    cancelsPerHour: number; taxMin: number; taxMax: number; inflation: { enabled: boolean; targetWeeklyGrowth: number; maxDailyStep: number } };
  newbieBuff: { enabled: boolean; maxLevel: number; tiers: { from: number; to: number; buffLevel: number }[]; effects: Record<string, { atkPct: number; defPct: number; expPct: number; hpRegen: number; moveSpeed: number }>; durationMinutes: number };
  enchanterBuff: { range: number; durationMinutes: number; requiresParty: boolean };
  economy: { startingSoulGod: number; travelFeePerZone: number; skillResetBase: number; skillResetPerLevel: number; npcSellRate: number;
    /** SoulGod a boss pays per kill: the field boss, and dungeon 1 / 2 / 3 (loot comes on top) */
    bossSoulGod: { field: number; dungeon: number[] } };
  beta: { inviteOnly: boolean; maxPlayers: number; codeLength: 4; codeGroups: 4 };
  /** The monster codex (round 11, src/game/codex.ts). Each loot entry has five tiers; tier n costs tierCost[n] of that
   *  loot plus sealCost[n] Codex Seals and adds perTier[stat] once. Costs grow every tier while the gain stays the same,
   *  and the total per stat is capped (caps, in %) so a full codex is a small edge, never a requirement. */
  codex: { enabled: boolean; tierCost: number[]; sealCost: number[]; perTier: Partial<Record<SpecialKey, number>>; caps: Partial<Record<SpecialKey, number>>;
    /** loot chance per normal kill; elites always drop 1–2 */
    lootChance: number; eliteLoot: [number, number];
    /** a character this many levels above the monster gets only outlevelFactor of the loot chance (buy it from newer players instead) */
    outlevelBy: number; outlevelFactor: number;
    /** Codex Seals: from elites (solo / with a party member nearby) and every boss (one more with 3+ party members nearby) */
    sealChance: { solo: number; party: number }; partyRange: number };
  /** Crafting at Brannoc: SoulGod + materials grow with the tier; Legendary+ can fail and then leave a crystal (3 = guaranteed craft). */
  craft: {
    soulGod: Record<RarityKey, number>; slotMultiplier: { weapon: number; armor: number; other: number };
    ore: Record<RarityKey, number>; shard: Record<RarityKey, number>; core: Record<RarityKey, number>; heart: Record<RarityKey, number>;
    successRate: Record<RarityKey, number>; crystalsForGuarantee: number;
  };
  /** World / dungeon bosses: HP is sized so the expected raid kills it in `targetMinutes` (15–30 min window). */
  raid: { targetMinutes: number; minMinutes: number; maxMinutes: number; minPlayers: number; dpsPerLevel: number; dpsBase: number };
};

const rarity = <T,>(values: T[]): Record<RarityKey, T> => Object.fromEntries(RARITY_KEYS.map((k, i) => [k, values[i]])) as Record<RarityKey, T>;

export const DEFAULT_CONFIG: GameConfig = {
  version: 1,
  classes: {
    // base attributes from the Berserker v2 / Reaver v1 balance proposal (fixed, no stat points)
    // round 20 (balance proposal, not play-tested): every base block sums to 60 like the Berserker; primary[0] is the attack stat
    Paladin:      { base: { str: 16, int: 2,  dex: 6,  agi: 6,  wis: 8,  vit: 22 }, primary: ['str', 'vit'], hpPerLevel: 30, mpPerLevel: 4, atkPerLevel: 2.0, defPerLevel: 2.0, damageMultiplier: 1, healingMultiplier: 1 },
    Hawkeye:      { base: { str: 4,  int: 2,  dex: 22, agi: 16, wis: 4,  vit: 12 }, primary: ['dex', 'agi'], hpPerLevel: 20, mpPerLevel: 4, atkPerLevel: 2.4, defPerLevel: 1.2, damageMultiplier: 1, healingMultiplier: 1 },
    RuneMaster:   { base: { str: 6,  int: 18, dex: 6,  agi: 8,  wis: 8,  vit: 14 }, primary: ['int', 'str'], hpPerLevel: 24, mpPerLevel: 5, atkPerLevel: 2.3, defPerLevel: 1.5, damageMultiplier: 1, healingMultiplier: 1 },
    Elementalist: { base: { str: 2,  int: 24, dex: 6,  agi: 8,  wis: 10, vit: 10 }, primary: ['int', 'wis'], hpPerLevel: 18, mpPerLevel: 7, atkPerLevel: 2.6, defPerLevel: 1.1, damageMultiplier: 1, healingMultiplier: 1 },
    Assassin:     { base: { str: 8,  int: 2,  dex: 16, agi: 22, wis: 2,  vit: 10 }, primary: ['agi', 'dex'], hpPerLevel: 21, mpPerLevel: 4, atkPerLevel: 2.5, defPerLevel: 1.2, damageMultiplier: 1, healingMultiplier: 1 },
    HighPriest:   { base: { str: 2,  int: 10, dex: 4,  agi: 6,  wis: 24, vit: 14 }, primary: ['wis', 'int'], hpPerLevel: 22, mpPerLevel: 8, atkPerLevel: 1.8, defPerLevel: 1.4, damageMultiplier: 1, healingMultiplier: 1.2 },
    Inquisitor:   { base: { str: 16, int: 2,  dex: 8,  agi: 6,  wis: 10, vit: 18 }, primary: ['str', 'wis'], hpPerLevel: 28, mpPerLevel: 4, atkPerLevel: 2.2, defPerLevel: 1.8, damageMultiplier: 1, healingMultiplier: 1 },
    Berserker: { base: { str: 20, int: 2, dex: 8,  agi: 10, wis: 4, vit: 16 }, primary: ['str', 'vit'], hpPerLevel: 26, mpPerLevel: 3, atkPerLevel: 2.4, defPerLevel: 1.6, damageMultiplier: 1, healingMultiplier: 1 },
    Reaver:    { base: { str: 28, int: 2, dex: 10, agi: 12, wis: 4, vit: 22 }, primary: ['str', 'vit'], hpPerLevel: 28, mpPerLevel: 3, atkPerLevel: 2.6, defPerLevel: 1.7, damageMultiplier: 1, healingMultiplier: 1 },
  },
  attributeValue: {
    strAtk: 4, strDef: 0.5, intMatk: 4, intMp: 6, dexAtk: 3.5, dexCritDmg: 0.012, dexHit: 0.004,
    agiSpeed: 0.05, agiAtkSpeed: 0.008, agiCrit: 0.003, agiEvade: 0.0035, wisMp: 10, wisMpRegen: 0.18, wisHeal: 0.03, wisBuff: 0.006, wisCdr: 0.003,
    vitHp: 18, vitDef: 1.2, vitRegen: 0.06,
  },
  combat: { monsterDamageMultiplier: 1, bossDamageMultiplier: 1, bossHpMultiplier: 1, eliteDamageMultiplier: 1.25, pvpDamageMultiplier: 0.6, critBase: 0.05, critCap: 0.6, critDamageBase: 1.5 },
  drops: {
    tables: {
      field: { chance: 0.38, rolls: 1, weights: rarity([5500, 2800, 1100, 450, 120, 25, 4, 1]) },
      elite: { chance: 0.7, rolls: 1, weights: rarity([3000, 3000, 2200, 1100, 450, 120, 25, 5]) },
      boss:  { chance: 1, rolls: 3, weights: rarity([0, 0, 4000, 3000, 1800, 800, 300, 100]) },
      farm:  { chance: 0.25, rolls: 1, weights: rarity([6500, 2700, 700, 100, 0, 0, 0, 0]) },
    },
    levelGate: rarity([1, 1, 5, 15, 30, 45, 65, 85]),
    levelBonus: rarity([0, 0, 0.5, 0.8, 1, 1.2, 1.4, 1.6]),
    tierHardness: 1,
    globalRate: 1,
  },
  options: {
    attributeLines: rarity([0, 0, 1, 2, 3, 4, 4, 4]),
    specialLines: rarity([0, 0, 0, 0, 0, 1, 2, 3]),
    attributeRange: rarity<[number, number]>([[0, 0], [0, 0], [1, 2], [1, 3], [2, 3], [2, 4], [3, 4], [3, 5]]),
    specialGodValue: { atkPct: 4, defPct: 4, hpPct: 4, mpPct: 5, critRate: 2, critDmg: 6, atkSpeed: 3, skillDmg: 4, cdr: 2, bossDmg: 5, lifesteal: 1, healPower: 4, dmgReduce: 2, moveSpeed: 2 },
    specialTierMultiplier: rarity([0, 0, 0, 0, 0, 1, 2, 4]),
    primaryWeight: 2,
  },
  enhance: {
    maxLevel: 15,
    successRate: [1, 1, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.22, 0.15, 0.1, 0.06, 0.03],
    baseCost: rarity([40, 80, 200, 600, 2000, 8000, 30000, 120000]),
    costExponent: 1.6, safeLevel: 6, downgradeOnFail: 1, bonusPerLevel: 0.04, bonusPerLevelAfter10: 0.08, protectionScrollPrice: 25000,
  },
  market: {
    floor: rarity([50, 150, 1000, 5000, 25000, 150000, 600000, 2500000]),
    floorPerEnhance: 0.15, medianFloorRatio: 0.5, listingFeePct: 0.02, listingFeeMin: 10, salesTaxPct: 0.06, maxActiveListings: 20, relistCooldownMinutes: 30, listingHours: 72,
    cancelsPerHour: 6, taxMin: 0.04, taxMax: 0.12, inflation: { enabled: true, targetWeeklyGrowth: 0.01, maxDailyStep: 0.005 },
  },
  newbieBuff: {
    enabled: true, maxLevel: 30,
    tiers: [{ from: 1, to: 10, buffLevel: 1 }, { from: 11, to: 20, buffLevel: 2 }, { from: 21, to: 30, buffLevel: 3 }],
    effects: {
      '1': { atkPct: 5, defPct: 5, expPct: 10, hpRegen: 1, moveSpeed: 3 },
      '2': { atkPct: 8, defPct: 8, expPct: 15, hpRegen: 2, moveSpeed: 4 },
      '3': { atkPct: 12, defPct: 12, expPct: 20, hpRegen: 3, moveSpeed: 5 },
    },
    durationMinutes: 60,
  },
  enchanterBuff: { range: 10, durationMinutes: 30, requiresParty: false },
  economy: { startingSoulGod: 150, travelFeePerZone: 60, skillResetBase: 2000, skillResetPerLevel: 150, npcSellRate: 1, bossSoulGod: { field: 15000, dungeon: [50000, 150000, 300000] } },
  beta: { inviteOnly: true, maxPlayers: 500, codeLength: 4, codeGroups: 4 },
  codex: {
    enabled: true, tierCost: [10, 25, 50, 100, 200], sealCost: [0, 0, 0, 2, 5],
    perTier: { atkPct: 0.2, hpPct: 0.25, defPct: 0.2, critDmg: 0.5, moveSpeed: 0.2, critRate: 0.1, mpPct: 0.3, bossDmg: 0.3 },
    caps: { atkPct: 3, hpPct: 4, defPct: 4, critDmg: 4, moveSpeed: 2, critRate: 1.5, mpPct: 4, bossDmg: 3 },
    lootChance: 0.35, eliteLoot: [1, 2], outlevelBy: 10, outlevelFactor: 0.3,
    sealChance: { solo: 0.02, party: 0.06 }, partyRange: 30, // the same range as balance/party PARTY_EXP_RANGE
  },
  craft: {
    soulGod: rarity([200, 800, 3000, 12000, 60000, 300000, 1500000, 7500000]), slotMultiplier: { weapon: 1.5, armor: 1.25, other: 1 },
    ore: rarity([2, 4, 8, 12, 20, 30, 45, 60]), shard: rarity([0, 0, 0, 2, 5, 10, 20, 40]), core: rarity([0, 0, 0, 0, 1, 3, 6, 12]), heart: rarity([0, 0, 0, 0, 0, 0, 1, 3]),
    successRate: rarity([1, 1, 1, 1, 0.75, 0.70, 0.60, 0.45]), crystalsForGuarantee: 3,
  },
  raid: { targetMinutes: 22, minMinutes: 15, maxMinutes: 30, minPlayers: 8, dpsPerLevel: 9, dpsBase: 60 },
};

type Deep<T> = { [K in keyof T]?: T[K] extends (infer U)[] ? U[] : T[K] extends object ? Deep<T[K]> : T[K] };
export type ConfigPatch = Deep<GameConfig>;

/** Deep-merge an admin patch over the defaults. Arrays replace; unknown keys are ignored; non-finite numbers are dropped. */
export function mergeConfig(base: GameConfig, patch: unknown): GameConfig {
  const walk = (b: unknown, p: unknown): unknown => {
    if (p === undefined || p === null) return b;
    if (Array.isArray(b)) return Array.isArray(p) ? p : b;
    if (typeof b === 'number') return typeof p === 'number' && Number.isFinite(p) ? p : b;
    if (typeof b === 'boolean') return typeof p === 'boolean' ? p : b;
    if (typeof b === 'string') return typeof p === 'string' ? p : b;
    if (b && typeof b === 'object') {
      if (typeof p !== 'object') return b;
      const out: Record<string, unknown> = { ...(b as Record<string, unknown>) };
      for (const k of Object.keys(out)) out[k] = walk(out[k], (p as Record<string, unknown>)[k]);
      // records keyed by data (e.g. newbie effects) accept new keys too
      for (const k of Object.keys(p as object)) if (!(k in out) && isOpenRecord(b)) out[k] = (p as Record<string, unknown>)[k];
      return out;
    }
    return b;
  };
  return walk(base, patch) as GameConfig;
}
const isOpenRecord = (b: object) => Object.keys(b).every(k => /^\d+$/.test(k));

/** Sanity checks an admin save must pass (also enforced server-side in admin_set_config). */
export function validateConfig(c: GameConfig): string[] {
  const errors: string[] = [];
  for (const cls of CLASS_KEYS) for (const a of ATTRIBUTES) { const v = c.classes[cls].base[a]; if (!(v >= 1 && v <= 99)) errors.push(`${cls} ${ATTRIBUTE_LABEL[a]} must be 1–99`); }
  for (const [src, t] of Object.entries(c.drops.tables)) { if (!(t.chance >= 0 && t.chance <= 1)) errors.push(`${src} drop chance must be 0–1`); if (!(t.rolls >= 1 && t.rolls <= 10)) errors.push(`${src} rolls must be 1–10`); if (Object.values(t.weights).some(w => !(w >= 0))) errors.push(`${src} weights must be ≥ 0`); }
  if (c.enhance.successRate.length !== c.enhance.maxLevel) errors.push('Enhance success rates need one value per level');
  if (c.enhance.successRate.some(r => !(r >= 0 && r <= 1))) errors.push('Enhance success rates must be 0–1');
  for (const r of RARITY_KEYS) if (!(c.market.floor[r] >= 1)) errors.push(`${r} market floor must be ≥ 1`);
  if (!(c.market.salesTaxPct >= 0 && c.market.salesTaxPct <= 0.5)) errors.push('Sales tax must be 0–50%');
  if (!(c.economy.bossSoulGod.field >= 0) || c.economy.bossSoulGod.dungeon.length !== 3 || c.economy.bossSoulGod.dungeon.some(v => !(v >= 0))) errors.push('Boss SoulGod: field and three dungeon values, all ≥ 0');
  if (!(c.market.taxMin >= 0 && c.market.taxMin <= c.market.taxMax && c.market.taxMax <= 0.5)) errors.push('Market tax range must be 0 ≤ min ≤ max ≤ 50%');
  if (!(c.market.listingFeePct >= 0 && c.market.listingFeePct <= 0.2)) errors.push('Listing fee must be 0–20%');
  if (!(c.market.cancelsPerHour >= 1 && c.market.cancelsPerHour <= 100)) errors.push('Cancels per hour must be 1–100');
  if (!(c.market.inflation.maxDailyStep >= 0 && c.market.inflation.maxDailyStep <= 0.05)) errors.push('Daily tax step must be 0–5%');
  const t = [...c.newbieBuff.tiers].sort((a, b) => a.from - b.from);
  t.forEach((x, i) => { if (x.from > x.to) errors.push(`Newbie tier ${i + 1}: from > to`); if (i && x.from <= t[i - 1].to) errors.push(`Newbie tiers ${i} and ${i + 1} overlap`); if (!c.newbieBuff.effects[String(x.buffLevel)]) errors.push(`Newbie buff level ${x.buffLevel} has no effect values`); });
  if (!(c.beta.maxPlayers >= 1 && c.beta.maxPlayers <= 100000)) errors.push('Max players must be 1–100000');
  for (const r of RARITY_KEYS) { const v = c.craft.successRate[r]; if (!(v > 0 && v <= 1)) errors.push(`${r} craft success must be 0–1`); if (!(c.craft.soulGod[r] >= 0)) errors.push(`${r} craft cost must be ≥ 0`); }
  if (!(c.craft.crystalsForGuarantee >= 1 && c.craft.crystalsForGuarantee <= 10)) errors.push('Crystals for a guaranteed craft must be 1–10');
  const cx = c.codex;
  if (cx.tierCost.length !== 5 || cx.sealCost.length !== 5 || cx.tierCost.some(v => !(Number.isInteger(v) && v >= 1)) || cx.sealCost.some(v => !(Number.isInteger(v) && v >= 0))) errors.push('Codex: five whole tier costs (≥ 1) and five seal costs (≥ 0)');
  if (cx.tierCost.some((v, i) => i > 0 && v < cx.tierCost[i - 1])) errors.push('Codex: each tier must cost at least as much as the one before');
  for (const [k, v] of Object.entries(cx.perTier)) if (!(v! >= 0 && v! <= 5)) errors.push(`Codex ${k} per tier must be 0–5`);
  for (const [k, v] of Object.entries(cx.caps)) if (!(v! >= 0 && v! <= 20)) errors.push(`Codex ${k} cap must be 0–20%`);
  if (!(cx.lootChance >= 0 && cx.lootChance <= 1) || !(cx.sealChance.solo >= 0 && cx.sealChance.solo <= cx.sealChance.party && cx.sealChance.party <= 1)) errors.push('Codex: loot chance 0–1, seal chance 0 ≤ solo ≤ party ≤ 1');
  if (!(cx.eliteLoot[0] >= 0 && cx.eliteLoot[0] <= cx.eliteLoot[1] && cx.eliteLoot[1] <= 10)) errors.push('Codex: elite loot range 0 ≤ min ≤ max ≤ 10');
  if (!(cx.outlevelFactor >= 0 && cx.outlevelFactor <= 1) || !(cx.outlevelBy >= 1)) errors.push('Codex: out-level factor 0–1, levels ≥ 1');
  if (!(c.raid.minMinutes <= c.raid.targetMinutes && c.raid.targetMinutes <= c.raid.maxMinutes)) errors.push('Raid minutes: min ≤ target ≤ max');
  return errors;
}
