import type { ClassId, CityId } from '@/game/content';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Crimson' | 'Legendary' | 'Ascendant' | 'Eclipse';
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
  tier?: number;
  soul?: 'Ember' | 'Frost' | 'Void';
};
export type Monster = {
  home?: [number,number];
  telegraph?: {kind: 'bolt'|'charge'|'slam'|'bite';target:[number,number];at:number;radius:number};
  form?: string;
  tint?: string;
  elite?: boolean;
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
  classId?: ClassId;
  cityId?: CityId;
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
  Common: '#b9c6d2', Uncommon:'#69cf7b', Crimson:'#e35a64', Ascendant:'#fb9446', Eclipse:'#c58aef', Rare: '#4db7ff', Epic: '#b477ff', Legendary: '#ffd36e'
};
