export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type GearSlot = 'weapon' | 'armor' | 'ring';
export type Attributes = { str: number; agi: number; int: number; vit: number };
export type Bonuses = Partial<Attributes> & { atk?: number; def?: number };
export type Item = {
  id: string;
  name: string;
  rarity: Rarity;
  slot: GearSlot | null;
  bonuses: Bonuses;
  description: string;
  soul?: 'Ember' | 'Frost' | 'Void';
};
export type Monster = {
  id: string;
  name: string;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  level: number;
  lastAttack: number;
  respawnAt: number | null;
};
export type Loot = { id: string; x: number; z: number; item: Item };
export type Player = {
  name: string;
  level: number;
  exp: number;
  hp: number;
  mp: number;
  gold: number;
  position: [number, number];
  stats: Attributes;
};
export type Snapshot = {
  version: 1;
  player: Player;
  inventory: (Item | null)[];
  equipment: Record<GearSlot, Item | null>;
  soulShards: number;
};
export const RARITY_COLOR: Record<Rarity, string> = {
  Common: '#b9c6d2', Rare: '#4db7ff', Epic: '#b477ff', Legendary: '#ffd36e'
};
