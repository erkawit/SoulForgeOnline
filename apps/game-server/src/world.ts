import { randomUUID } from 'node:crypto';
import type { Actor, Loot } from './protocol.js';
export type Boss = Actor & {instanceId:string;phase:'active'|'enraged';spawnedAt:number;contributions:Map<string,number>};
export class Room {
 readonly id='hollow-reach-01';
 players=new Map<string,Actor>();
 loot=new Map<string,Loot>();
 boss:Boss|null=null;
 nextBossSpawn=Date.now()+30000;
 tick(dt:number,now:number){
  if(!this.boss && now>=this.nextBossSpawn) this.spawnBoss(now);
  if(this.boss && now-this.boss.spawnedAt>15*60_000){this.boss=null;this.nextBossSpawn=now+3*60*60_000;}
  for(const [id,l] of this.loot) if(l.expiresAt<now)this.loot.delete(id);
 }
 spawnBoss(now:number){const id=randomUUID();this.boss={id:'abyssal-forge-titan',instanceId:id,x:8,z:7,hp:10000,maxHp:10000,attack:95,defense:80,crit:0,mp:0,speed:0,level:50,lastBasic:0,lastSkill:0,phase:'active',spawnedAt:now,contributions:new Map()};}
 damageBoss(playerId:string,damage:number,now:number){
  const b=this.boss;if(!b)return {dealt:0,killed:false};
  const dealt=Math.min(b.hp,Math.max(0,Math.floor(damage)));
  b.hp-=dealt;b.contributions.set(playerId,(b.contributions.get(playerId)??0)+dealt);
  if(b.hp<=b.maxHp*.3)b.phase='enraged';
  if(b.hp>0)return {dealt,killed:false};
  const drops=(['Common','Rare','Epic','Legendary'] as const).map((rarity,i):Loot=>({id:randomUUID(),x:b.x+Math.cos(i*1.57)*2,z:b.z+Math.sin(i*1.57)*2,rarity,itemDefinitionId:`forge_titan_${rarity.toLowerCase()}`,expiresAt:now+5*60_000,bossInstanceId:b.instanceId}));
  for(const l of drops)this.loot.set(l.id,l);
  this.boss=null;this.nextBossSpawn=now+3*60*60_000;
  return {dealt,killed:true,drops};
 }
 snapshot(){return {type:'WORLD_SNAPSHOT',roomId:this.id,serverTime:Date.now(),players:[...this.players.values()].map(({id,x,z,hp,maxHp,mp,level})=>({id,x,z,hp,maxHp,mp,maxMp:100,level})),boss:this.boss?{id:this.boss.id,x:this.boss.x,z:this.boss.z,hp:this.boss.hp,maxHp:this.boss.maxHp,phase:this.boss.phase}:null,loot:[...this.loot.values()]};}
}
