import {create} from 'zustand';
export type Remote={id:string;x:number;z:number;hp:number;maxHp:number;mp?:number;maxMp?:number;level:number;classId?:string;name?:string;gender?:string;title?:string;guild?:{name:string;emblem?:string|null}|null};
export type Boss={id:string;x:number;z:number;hp:number;maxHp:number;phase:string}|null;
export type GroundLoot={id:string;x:number;z:number;rarity:string;itemDefinitionId:string};
export type PartyMemberView={id:string;name:string;classId:string;online:boolean;graceLeft:number;hp?:number;maxHp?:number;mp?:number;maxMp?:number;level?:number;x?:number;z?:number};
export type PartyView={id:string;leader:string;members:PartyMemberView[]}|null;
export type BossResultRow={rank:number;id:string;name:string;classId:string;damage:number;share:number;soulGod:number;guaranteed:string|null;highTier:string|null};
export type BossResult={boss:string;minutes:number;players:number;ranked:BossResultRow[]}|null;
export type PartyInvite={from:string;name:string;classId:string;until:number}|null;
/** the realm's answer to an operation that rolls dice (enhance, craft…): the NPC windows show it when it arrives */
export type ActResult={op:string;ok:boolean;msg:string;seq:number}|null;
import type {Listing,Mail} from '@/game/economy/market';
/** the realm's market windows (round 10): the last page the player asked for, the live market tax, unclaimed mail */
/** round 26: a finished trade (my sale or my purchase) and an item's sale prices over the last week */
export type MarketTrade=Listing&{side:'sold'|'bought';closedAt:number};
export type MarketPrices={def:string;enhance:number;week:number|null;yesterday:number|null;last:number|null;sold7d:number};
export type MarketView={view:'browse'|'mine'|'mail'|'history'|'prices';listings:Listing[];mail:Mail[];trades:MarketTrade[];prices:MarketPrices|null;tax:number;page:number;error:string|null;at:number};
/** round 13: city channels — the one this character is in, and [channel, players] of its city when asked */
export type ChannelView={current:number;list:[number,number][];at:number;/** round 16: players per channel (realm REALM_CHANNEL_CAP) */cap?:number};
type NetState={channel:ChannelView;market:MarketView|null;mailCount:number;actResult:ActResult;connected:boolean;online:boolean;playerId:string|null;players:Remote[];boss:Boss;loot:GroundLoot[];status:string;party:PartyView;partyInvite:PartyInvite;reconnecting:boolean;bossResult:BossResult;setOnline:(b:boolean)=>void;setState:(p:Partial<NetState>)=>void};
export const useMultiplayerStore=create<NetState>(set=>({channel:{current:1,list:[],at:0},market:null,mailCount:0,actResult:null,connected:false,online:false,playerId:null,players:[],boss:null,loot:[],status:'Guest Demo',party:null,partyInvite:null,reconnecting:false,bossResult:null,setOnline:online=>set({online}),setState:p=>set(p)}));
