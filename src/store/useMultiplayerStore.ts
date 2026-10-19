import {create} from 'zustand';
export type Remote={id:string;x:number;z:number;hp:number;maxHp:number;level:number};
export type Boss={id:string;x:number;z:number;hp:number;maxHp:number;phase:string}|null;
export type GroundLoot={id:string;x:number;z:number;rarity:string;itemDefinitionId:string};
type NetState={connected:boolean;online:boolean;playerId:string|null;players:Remote[];boss:Boss;loot:GroundLoot[];status:string;setOnline:(b:boolean)=>void;setState:(p:Partial<NetState>)=>void};
export const useMultiplayerStore=create<NetState>(set=>({connected:false,online:false,playerId:null,players:[],boss:null,loot:[],status:'Guest Demo',setOnline:online=>set({online}),setState:p=>set(p)}));
