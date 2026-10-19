import { z } from 'zod';
export const Intent = z.discriminatedUnion('type', [
 z.object({type:z.literal('MOVE'),dx:z.number().finite().min(-1).max(1),dz:z.number().finite().min(-1).max(1)}),
 z.object({type:z.literal('ATTACK'),targetId:z.string().min(1).max(100),skillId:z.enum(['basic','soul_burst'])}),
 z.object({type:z.literal('PICKUP'),lootId:z.string().uuid()}),
 z.object({type:z.literal('PING')})
]);
export type IntentType = z.infer<typeof Intent>;
export type Actor = {id:string;x:number;z:number;hp:number;maxHp:number;attack:number;defense:number;crit:number;mp:number;speed:number;level:number;lastBasic:number;lastSkill:number};
export type Loot = {id:string;x:number;z:number;rarity:'Common'|'Rare'|'Epic'|'Legendary';itemDefinitionId:string;expiresAt:number;bossInstanceId:string};
