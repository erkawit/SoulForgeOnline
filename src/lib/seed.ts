import type { Item, Monster, Player } from './types';
import { DEFAULT_CONFIG } from '@/game/balance/config';

// Attributes are the class's fixed base (see src/game/balance/config.ts) — replaced on class choice / profile load.
export const starterPlayer: Player = {
  name: 'The Wanderer', level: 1, exp: 0, hp: 520, mp: 95, gold: DEFAULT_CONFIG.economy.startingSoulGod,
  position: [4.6, 4.6], stats: { ...DEFAULT_CONFIG.classes.Berserker.base }
};

export const starterGear: Item = {
  id: 'starter-blade', name: 'Worn Ironcleaver', rarity: 'Common', slot: 'weapon', definitionId: 'weapon-Berserker-0', family: 'Berserker', tier: 0,
  bonuses: { atk: 7 }, description: 'Berserker · ดาบใหญ่สองมือเก่า ๆ ที่ยังคมอยู่'
};

export const monsterSpawns: Monster[] = [
  [-6, -5], [5, -7], [8, 2], [-8, 3], [2, 9], [-5, 8], [10, -9]
].map(([x, z], i) => ({
  id: `mob-${i}`, name: i % 3 === 0 ? 'Void Stalker' : i % 3 === 1 ? 'Ash Revenant' : 'Crypt Wraith',
  x, z, hp: 68 + i * 8, maxHp: 68 + i * 8, level: 1 + Math.floor(i / 2),
  lastAttack: 0, respawnAt: null
}));
