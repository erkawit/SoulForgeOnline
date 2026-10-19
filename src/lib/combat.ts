import type { Attributes, GearSlot, Item, Monster, Rarity } from './types';

export function deriveStats(stats: Attributes, gear: Record<GearSlot, Item | null>) {
  const total = { ...stats, atk: 0, def: 0 };
  Object.values(gear).forEach(item => {
    if (!item) return;
    total.str += item.bonuses.str ?? 0;
    total.agi += item.bonuses.agi ?? 0;
    total.int += item.bonuses.int ?? 0;
    total.vit += item.bonuses.vit ?? 0;
    total.atk += item.bonuses.atk ?? 0;
    total.def += item.bonuses.def ?? 0;
    if (item.soul) total.atk += 6;
  });
  return {
    ...total,
    maxHp: 120 + total.vit * 12,
    maxMp: 55 + total.int * 8,
    attack: Math.round(10 + total.str * 2.8 + total.int * 0.5 + total.atk),
    defense: Math.round(3 + total.vit * 1.5 + total.agi * 0.45 + total.def),
    crit: Math.min(0.55, 0.05 + total.agi * 0.006),
    speed: Math.min(8, 3.6 + total.agi * 0.045)
  };
}

export function calculateDamage(attack: number, defense: number, criticalChance: number, skill = false) {
  const crit = Math.random() < criticalChance;
  const rolled = attack * (0.88 + Math.random() * 0.24);
  return { damage: Math.max(1, Math.round((rolled * (skill ? 1.9 : 1) * (crit ? 1.65 : 1)) - defense * 0.35)), crit };
}

const table: { rarity: Rarity; probability: number }[] = [
  { rarity: 'Common', probability: 0.56 },
  { rarity: 'Rare', probability: 0.28 },
  { rarity: 'Epic', probability: 0.13 },
  { rarity: 'Legendary', probability: 0.03 }
];

export function rollRarity(): Rarity {
  const value = Math.random();
  let cumulative = 0;
  for (const tier of table) {
    cumulative += tier.probability;
    if (value < cumulative) return tier.rarity;
  }
  return 'Common';
}

export function rollItem(monster: Monster): Item {
  const rarity = rollRarity();
  const boost: Record<Rarity, number> = { Common: 1, Rare: 2, Epic: 4, Legendary: 7 };
  const power = boost[rarity] + Math.ceil(monster.level * 0.7);
  const pool = [
    { name: 'Eclipse Blade', slot: 'weapon' as const, bonuses: { atk: power * 3, str: power } },
    { name: 'Hollowguard Plate', slot: 'armor' as const, bonuses: { def: power * 2, vit: power } },
    { name: 'Astral Seal', slot: 'ring' as const, bonuses: { int: power, agi: power } }
  ];
  const item = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: crypto.randomUUID(),
    name: `${rarity} ${item.name}`,
    rarity,
    slot: item.slot,
    bonuses: item.bonuses,
    description: `Recovered from ${monster.name}. Forged under the black eclipse.`
  };
}
