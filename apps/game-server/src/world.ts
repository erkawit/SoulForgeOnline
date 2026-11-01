import { randomUUID } from 'node:crypto';
import { activeFighters, bossRegen, bossTakes, unyielding } from '@/game/balance/bossRules';
import type { Actor, Loot } from './protocol.js';
import { RAID, raidHp, raidHpFor, rankDamage, rewards } from './raid.js';
import { bossSwing, newSwingState, type BossFighter, type Strike, type SwingState } from './bossCombat.js';
/** cap on the SoulGod purse of one world-boss kill (it used to grow with the boss HP, i.e. with the crowd) */
export const BOSS_PURSE_MAX=Number(process.env.BOSS_PURSE_MAX??3_000_000);
export type Boss = Actor & {instanceId:string;phase:'active'|'enraged';spawnedAt:number;contributions:Map<string,number>;unyielding?:boolean};
/** most other players one client is sent (and draws) at once */
export const VIEW_CAP = Math.max(10, Number(process.env.REALM_VIEW_CAP ?? 60) || 60);
export class Room {
 readonly id='hollow-reach-01';
 players=new Map<string,Actor>();
 loot=new Map<string,Loot>();
 boss:Boss|null=null;
 /** who hit the boss and when (no-solo rule) */ bossHits=new Map<string,number>();
 nextBossSpawn=Date.now()+30000;
 /** round 13: the boss's own attack timer and Sunder stacks */ swing:SwingState=newSwingState(Date.now());
 private lastScaleAt=0;
 /** dpsOf (optional): a challenger's single-target DPS upper bound — sizes the boss from the real fighters (round 13) */
 tick(dt:number,now:number,dpsOf?:(id:string)=>number){
  if(!this.boss && now>=this.nextBossSpawn) this.spawnBoss(now);
  // raid sizing: more challengers in range → more HP (ratio kept, never shrinks); the fight may run up to 40 minutes
  if(this.boss&&now-this.lastScaleAt>=1000){this.lastScaleAt=now;const near=[...this.players.values()].filter(p=>(p.city??'hollow')==='hollow'&&Math.hypot(p.x-this.boss!.x,p.z-this.boss!.z)<40);const want=dpsOf?raidHpFor(near.map(p=>dpsOf(p.id))):raidHp(near.length);
   if(want>this.boss.maxHp){const k=this.boss.hp/this.boss.maxHp;this.boss.maxHp=want;this.boss.hp=Math.round(want*k);}}
  // round 12: no solo — while fewer than 3 players are fighting, the boss is Unyielding (takes 10 %, regenerates 2 %/s)
  if(this.boss){const b=this.boss,f=activeFighters(this.bossHits,now);b.hp=Math.min(b.maxHp,b.hp+bossRegen(b.maxHp,f,dt));b.unyielding=unyielding(f);}
  if(this.boss && now-this.boss.spawnedAt>RAID.maxMinutes*60_000){this.boss=null;this.nextBossSpawn=now+3*60*60_000;}
  for(const [id,l] of this.loot) if(l.expiresAt<now)this.loot.delete(id);
 }
 /** the Titan rises on the cathedral road of Hollow Reach, between the compass plaza and the blessing hall (open paving) */
 spawnBoss(now:number){const id=randomUUID();this.bossHits.clear();this.swing=newSwingState(now);this.boss={id:'abyssal-forge-titan',instanceId:id,x:-9,z:-9,hp:raidHp(this.players.size),maxHp:raidHp(this.players.size),attack:95,defense:80,crit:0,mp:0,speed:0,level:50,lastBasic:0,lastSkill:0,phase:'active',spawnedAt:now,contributions:new Map()};}
 /** round 13: the boss attacks the top-threat fighter in reach (Sunder, enrage). Lowers that actor's hp; null = no swing now */
 bossAttack(now:number,rng:()=>number=Math.random):Strike|null{const b=this.boss;if(!b)return null;return bossSwing(b,this.players.values() as Iterable<BossFighter>,this.swing,now,rng);}
 damageBoss(playerId:string,damage:number,now:number){
  const b=this.boss;if(!b)return {dealt:0,killed:false};
  this.bossHits.set(playerId,now);const dealt=Math.min(b.hp,bossTakes(damage,activeFighters(this.bossHits,now)));
  b.hp-=dealt;b.contributions.set(playerId,(b.contributions.get(playerId)??0)+dealt);
  if(b.hp<=b.maxHp*.3)b.phase='enraged';
  if(b.hp>0)return {dealt,killed:false};
  // top-10 damage dashboard: SoulGod share of the purse, a guaranteed piece, and a high-tier roll (rank 1 = 50 %)
  const ranked=rankDamage(b.contributions,id=>this.players.get(id)),result={type:'BOSS_RESULT',boss:'Abyssal Forge Titan',minutes:+((now-b.spawnedAt)/60000).toFixed(1),players:b.contributions.size,ranked:rewards(ranked,Math.min(BOSS_PURSE_MAX,Math.round(b.maxHp*.5)))};
  this.boss=null;this.nextBossSpawn=now+3*60*60_000;
  return {dealt,killed:true,result,at:[b.x,b.z] as [number,number]};
 }
 /** Interest management: each client only receives players within `radius` m (500 testers × 20 Hz would otherwise be ~5M entries/s). */
 /** round 13 (crowds): a viewer gets itself + at most `cap` other players in its city within `radius`, nearest first,
  *  so a packed plaza costs every client the same bandwidth and draw calls (REALM_VIEW_CAP, default 60). `keep` = ids that
  *  are always included when in range (party members, current target). */
 snapshotFor(viewer:Actor,radius=32,cap=VIEW_CAP,keep?:ReadonlySet<string>){const now=Date.now(),city=viewer.city??'hollow',here=city==='hollow';
  const near=[...this.players.values()].filter(p=>p!==viewer&&(p.city??'hollow')===city&&(p.channel??1)===(viewer.channel??1)).map(p=>({p,d:Math.hypot(p.x-viewer.x,p.z-viewer.z)})).filter(o=>o.d<=radius)
   .sort((a,b)=>(keep?.has(b.p.id)?1:0)-(keep?.has(a.p.id)?1:0)||a.d-b.d).slice(0,Math.max(0,cap)).map(o=>o.p);
  return {type:'WORLD_SNAPSHOT',roomId:this.id,city,channel:viewer.channel??1,serverTime:now,players:[viewer,...near].map(({id,x,z,hp,maxHp,mp,level,classId,name,gender,buffs,title})=>({id,x,z,hp,maxHp,mp,maxMp:100,level,classId,name,gender,title,buffs:(buffs??[]).filter(b=>b.until>now).map(b=>({id:b.id,until:b.until}))})),boss:here&&this.boss?{id:this.boss.id,x:this.boss.x,z:this.boss.z,hp:this.boss.hp,maxHp:this.boss.maxHp,phase:this.boss.phase,unyielding:!!this.boss.unyielding}:null,loot:here?[...this.loot.values()]:[]};}
 snapshot(){return {type:'WORLD_SNAPSHOT',roomId:this.id,serverTime:Date.now(),players:[...this.players.values()].map(({id,x,z,hp,maxHp,mp,level})=>({id,x,z,hp,maxHp,mp,maxMp:100,level})),boss:this.boss?{id:this.boss.id,x:this.boss.x,z:this.boss.z,hp:this.boss.hp,maxHp:this.boss.maxHp,phase:this.boss.phase,unyielding:!!this.boss.unyielding}:null,loot:[...this.loot.values()]};}
}
