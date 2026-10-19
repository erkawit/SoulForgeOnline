import type { Item, Monster, Player } from './types';

export const starterPlayer: Player = {
  name: 'The Wanderer', level: 1, exp: 0, hp: 240, mp: 95, gold: 150,
  position: [0, 0], stats: { str: 10, agi: 8, int: 5, vit: 10 }
};

export const starterGear: Item = {
  id: 'starter-blade', name: 'Worn Eclipse Saber', rarity: 'Common', slot: 'weapon',
  bonuses: { atk: 7, str: 1 }, description: 'An old blade glowing with forgotten magic.'
};

export const monsterSpawns: Monster[] = [
  [-6, -5], [5, -7], [8, 2], [-8, 3], [2, 9], [-5, 8], [10, -9]
].map(([x, z], i) => ({
  id: `mob-${i}`, name: i % 3 === 0 ? 'Void Stalker' : i % 3 === 1 ? 'Ash Revenant' : 'Crypt Wraith',
  x, z, hp: 68 + i * 8, maxHp: 68 + i * 8, level: 1 + Math.floor(i / 2),
  lastAttack: 0, respawnAt: null
}));
