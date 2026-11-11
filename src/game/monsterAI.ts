import type {Monster} from '@/lib/types';
import {walkable,inTown,nearPortal,type CityId} from './content';
import {monsterStats} from './balance/stats';
import {DEFAULT_CONFIG,type GameConfig} from './balance/config';
export const attackProfile=(m:Monster)=>m.form==='wraith'||m.form==='winged'?{kind:'bolt' as const,range:7,delay:1000,radius:1.2,multiplier:1}:m.form==='wolf'||m.form==='drake'?{kind:'charge' as const,range:5,delay:800,radius:1.6,multiplier:1.2}:m.form==='golem'?{kind:'slam' as const,range:2.6,delay:1250,radius:2.8,multiplier:1.5}:{kind:'bite' as const,range:1.8,delay:500,radius:1.5,multiplier:1};
export function lineClear(city:CityId,a:[number,number],b:[number,number]){
 const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.2);
 for(let i=1;i<=n;i++){const t=i/n;if(!walkable(city,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t))return false;}return true;
}
function step(m:Monster,target:[number,number],city:CityId,speed:number){
 const dx=target[0]-m.x,dz=target[1]-m.z,d=Math.hypot(dx,dz);if(d<.05)return m;
 const s=Math.min(speed,d),x=m.x+dx/d*s,z=m.z+dz/d*s;
 // monsters never cross into a capital's walls (town is safe ground; hunting happens outside)
 const ok=(px:number,pz:number)=>lineClear(city,[m.x,m.z],[px,pz])&&!inTown(city,px,pz);
 if(ok(x,z))return {...m,x,z};
 if(ok(x,m.z))return {...m,x};
 if(ok(m.x,z))return {...m,z};return m;
}
/** elite signature skills (wiki/data ELITE_SKILLS): telegraphed circle, windup, damage multiplier */
export const ELITE_SIGNATURE:Record<string,{name:string;radius:number;windup:number;mult:number;self?:boolean;charge?:boolean}>={
 'Crypt Crawler':{name:'Burrow Ambush · มุดดินซุ่มโจมตี',radius:2.5,windup:1200,mult:2.2},
 'Oathscar Aurochs':{name:'Oathbreaker Charge · พุ่งชนสาบานแตก',radius:2.2,windup:1400,mult:2.5,charge:true},
 'Tide Wraith':{name:'Drowning Tide · กระแสน้ำจมดิ่ง',radius:5,windup:1500,mult:1.8,self:true},
 'Root Reaper':{name:'Thorn Harvest · เก็บเกี่ยวหนาม',radius:4,windup:1100,mult:2.0,self:true},
};
export const RESPAWN_SPREAD=4;
function respawnSpot(city:CityId,home:[number,number]):[number,number]{
 for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2,d=Math.sqrt(Math.random())*RESPAWN_SPREAD,x=home[0]+Math.cos(a)*d,z=home[1]+Math.sin(a)*d;if(walkable(city,x,z)&&!inTown(city,x,z))return [x,z];}
 return home;
}
export function advanceMonster(m:Monster,player:[number,number],city:CityId,now:number,_defense:number,config:GameConfig=DEFAULT_CONFIG):{monster:Monster;damage:number}{
 const home=m.home??[m.x,m.z],base={...m,home};
 if(m.hp<=0){
  if(!(m.respawnAt&&now>=m.respawnAt))return {monster:base,damage:0};
  // round 24: comes back somewhere in its area (within RESPAWN_SPREAD m of home), not on the exact same spot
  const spot=respawnSpot(city,home);
  return {monster:{...base,x:spot[0],z:spot[1],hp:m.maxHp,respawnAt:null,lastAttack:now,telegraph:undefined},damage:0};
 }
 const distance=Math.hypot(player[0]-m.x,player[1]-m.z),safe=nearPortal(city,player[0],player[1],5.5)||inTown(city,player[0],player[1]); // by a waygate / in town
 if(safe||Math.hypot(player[0]-home[0],player[1]-home[1])>13){return {monster:step({...base,telegraph:undefined},home,city,.3),damage:0};}
 if(m.telegraph){
  if(now<m.telegraph.at)return {monster:base,damage:0};
  const t=m.telegraph,p=attackProfile(m),visible=lineClear(city,[m.x,m.z],t.target);
  let monster={...base,telegraph:undefined,lastAttack:now};
  if(t.kind==='charge'&&visible)monster={...monster,x:t.target[0],z:t.target[1]};
  if(t.kind==='skill'&&ELITE_SIGNATURE[m.name]?.charge&&visible)monster={...monster,x:t.target[0],z:t.target[1]};
  const hit=visible&&Math.hypot(player[0]-t.target[0],player[1]-t.target[1])<=t.radius;
  if(t.kind==='skill')return {monster,damage:hit?Math.round(monsterStats(m.level,{elite:true,boss:m.boss,dungeon:!!m.dungeon},config).damage*(t.mult??2)*(1-Math.min(.8,(m.weaken??0)/100))):0};
  // raw damage; the store applies the player's defense, evasion and damage reduction (balance/stats.incomingDamage)
  return {monster,damage:hit?Math.round(monsterStats(m.level,{elite:m.elite,boss:m.boss,dungeon:!!m.dungeon},config).damage*p.multiplier*(1-Math.min(.8,(m.weaken??0)/100))):0};
 }
 const sig=m.elite&&!m.boss?ELITE_SIGNATURE[m.name]:undefined;
 if(sig&&distance<=6&&now>=(m.skillAt??now+1)&&lineClear(city,[m.x,m.z],player)){
  const target:[number,number]=sig.self?[m.x,m.z]:[...player];
  return {monster:{...base,skillAt:now+9000+Math.random()*3000,telegraph:{kind:'skill',target,at:now+sig.windup,radius:sig.radius,name:sig.name,mult:sig.mult}},damage:0};
 }
 if(sig&&m.skillAt===undefined&&distance<10)return {monster:{...base,skillAt:now+2500},damage:0};
 const profile=attackProfile(m);
 if(distance<=profile.range&&now-m.lastAttack>1800&&lineClear(city,[m.x,m.z],player)){
  const target:[number,number]=profile.kind==='slam'?[m.x,m.z]:[...player];
  return {monster:{...base,telegraph:{kind:profile.kind,target,at:now+profile.delay,radius:profile.radius}},damage:0};
 }
 return {monster:distance<10&&distance>profile.range*.85?step(base,player,city,(m.form==='golem'?.13:.23)*((m.slow??0)>=100?0:1-Math.min(.8,(m.slow??0)/100))):base,damage:0};
}
