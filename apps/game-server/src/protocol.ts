import { z } from 'zod';
import type { CityId } from '@/game/content';
// round 9: ACT = one economy operation (src/store/authority.ts ActOp), POS = where the browser's simulation put the character
const OPS = ['swap','equip','unequip','sell','buyShop','buyCatalog','use','enhance','craft','crystalCraft','brewPotion','starter','blessing','forge','learn','resetSkills','hotbar','promote','acceptQuest','turnIn','travel','pickup','event','kill','respawn','marketList','marketBuy','marketCancel','mailClaim','codex','sellJunk','wear','takeOff'] as const;
export const Intent = z.discriminatedUnion('type', [
 z.object({type:z.literal('MOVE'),dx:z.number().finite().min(-1).max(1),dz:z.number().finite().min(-1).max(1)}),
 z.object({type:z.literal('POS'),city:z.string().max(20),x:z.number().finite(),z:z.number().finite(),hp:z.number().finite().min(0).optional(),mp:z.number().finite().min(0).optional()}),
 z.object({type:z.literal('ACT'),seq:z.number().int().min(1),op:z.enum(OPS),args:z.array(z.unknown()).max(4),ids:z.array(z.string().max(40)).max(8).default([])}),
 z.object({type:z.literal('ATTACK'),targetId:z.string().min(1).max(100),skillId:z.enum(['basic','soul_burst'])}),
 z.object({type:z.literal('PICKUP'),lootId:z.string().uuid()}),
 z.object({type:z.literal('PING')}),
 // round 10: read the market (browse / my listings / my mail); changes go through ACT market* ops
 z.object({type:z.literal('MARKET'),view:z.enum(['browse','mine','mail']),text:z.string().max(40).optional(),rarity:z.string().max(12).optional(),page:z.number().int().min(0).max(50).default(0)}),
 // Enchanter inscription on ANY player in range — no party needed (closed beta rule)
 z.object({type:z.literal('BUFF'),targetId:z.string().uuid(),buff:z.enum(['might','ward','haste','focus'])}),
 // parties are server-owned (party.ts): invite / answer / leave / kick
 z.object({type:z.literal('PARTY_INVITE'),targetId:z.string().uuid()}),
 z.object({type:z.literal('PARTY_ACCEPT')}),
 z.object({type:z.literal('PARTY_DECLINE')}),
 z.object({type:z.literal('PARTY_LEAVE')}),
 z.object({type:z.literal('PARTY_KICK'),targetId:z.string().uuid()}),
 // round 13: city channels (channels.ts) — list them, or move to another one
 z.object({type:z.literal('CHANNELS')}),
 z.object({type:z.literal('CHANNEL'),channel:z.number().int().min(1).max(20)})
]);
export type IntentType = z.infer<typeof Intent>;
export type ServerBuff = {id:string;from:string;atkPct?:number;defPct?:number;moveSpeed?:number;critRate?:number;until:number};
export type Actor = {id:string;city?:CityId;maxMp?:number;x:number;z:number;hp:number;maxHp:number;attack:number;defense:number;crit:number;mp:number;speed:number;level:number;lastBasic:number;lastSkill:number;classId?:string;name?:string;gender?:'m'|'f';buffs?:ServerBuff[];lastBuff?:number;title?:string;
 // round 13: what the world boss needs to hit this character, and the HP/MP report limiter (vitals.ts)
 evade?:number;dmgReduce?:number;immortal?:boolean;vitalsAt?:number;healCredit?:number;
 /** round 13: city channel (1…) — players only see their own city + channel */ channel?:number;channelAt?:number};
export type Loot = {id:string;x:number;z:number;rarity:'Common'|'Rare'|'Epic'|'Legendary';itemDefinitionId:string;expiresAt:number;bossInstanceId:string};
