import type {PromotionId} from '@/game/advancement';
import type { ClassId, CityId } from '@/game/content';
import type { AttributeBlock } from '@/game/balance/config';
import type { ItemOption, ActiveBuff } from '@/game/balance/stats';
import type { SkillLevels, Hotbar } from '@/game/skills/engine';
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary' | 'God' | 'Pre-arch' | 'Arch';
export type GearSlot = 'weapon' | 'offhand' | 'armor' | 'ring' | 'helmet' | 'gloves' | 'boots' | 'costume';
/** slots that carry combat stats (costume is cosmetic only) */
export type StatSlot = Exclude<GearSlot, 'costume'>;
/** STR INT DEX AGI WIS VIT — fixed per class; gear options add on top. */
export type Attributes = AttributeBlock;
export type Bonuses = Partial<Attributes> & { atk?: number; def?: number };
export type Item = {
  id: string;
  name: string;
  rarity: Rarity;
  slot: GearSlot | null;
  bonuses: Bonuses;
  description: string;
  definitionId?: string;
  family?: string;
  npcValue?: number;
  tier?: number;
  soul?: 'Ember' | 'Frost' | 'Void';
  /** only this class can equip it (rolled at drop time for shared catalog families) */
  classLock?: ClassId;
  /** Rare+ random options: attribute lines and God+ special lines */
  options?: ItemOption[];
  /** +0 … +15, done at the NPC Merchant */
  enhance?: number;
  /** stack size for consumables */
  qty?: number;
};
export type Monster = {
  respawnSeconds?: number;
  boss?: boolean;
  dungeon?: number;
  damageMultiplier?: number;
  expMultiplier?: number;
  home?: [number,number];
  telegraph?: {kind: 'bolt'|'charge'|'slam'|'bite'|'skill';target:[number,number];at:number;radius:number;name?:string;mult?:number};
  /** elites: next time the signature skill may fire */
  skillAt?: number;
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
  /** active skill debuffs (percent) and their expiry */
  slow?: number; weaken?: number; armorBreak?: number; debuffUntil?: number;
};
export type Loot = { id: string; x: number; z: number; item: Item };
export type Player = {
  promotionId?: PromotionId;
  classId?: ClassId;
  /** appearance from the character screen (compact-cast male / female sheet) */
  gender?: 'm' | 'f';
  /** layered hero look: hair style id (public/art/anim/hair/<id>.webp) and hair colour (#rrggbb) */
  hair?: string;
  hairColor?: string;
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
  economyVersion?: 2 | 3;
  player: Player;
  inventory: (Item | null)[];
  equipment: Record<GearSlot, Item | null>;
  soulShards: number;
  skills?: { levels: SkillLevels; hotbar: Hotbar };
  buffs?: ActiveBuff[];
  starterKits?: string[];
  /** round 11: the monster codex (loot id → tier) */
  codex?: Record<string, number>;
  /** round 12: the wardrobe */
  wardrobe?: { owned: string[]; worn: Record<string, string> };
  /** round 2: quests, one-time tips already shown, AUTO settings, hotbar slots 4–6 */
  quests?: Record<string, { id: string; status: 'active' | 'ready' | 'done'; progress: number[]; acceptedAt: number }>;
  tips?: string[];
  auto?: Record<string, unknown>;
  extraHotbar?: (string | null)[];
  bagPos?: Record<string, { x: number; y: number }>;
};
/** UX spec tier colours T1–T8 (src/game/ui/layout.ts TIERS) */
export const RARITY_COLOR: Record<Rarity, string> = {
  Common: '#FFFFFF', Uncommon: '#4CAF50', Rare: '#2196F3', Epic: '#9C27B0', Legendary: '#F44336', God: '#FFD700', 'Pre-arch': '#FF9800', Arch: '#E040FB'
};
