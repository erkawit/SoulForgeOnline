import type {Monster} from '@/lib/types';
import {walkable,type CityId} from './content';
export const attackProfile=(m:Monster)=>m.form==='wraith'||m.form==='winged'?{kind:'bolt' as const,range:7,delay:1000,radius:1.2,multiplier:1}:m.form==='wolf'||m.form==='drake'?{kind:'charge' as const,range:5,delay:800,radius:1.6,multiplier:1.2}:m.form==='golem'?{kind:'slam' as const,range:2.6,delay:1250,radius:2.8,multiplier:1.5}:{kind:'bite' as const,range:1.8,delay:500,radius:1.5,multiplier:1};
export function lineClear(city:CityId,a:[number,number],b:[number,number]){
 const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.2);
 for(let i=1;i<=n;i++){const t=i/n;if(!walkable(city,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t))return false;}return true;
}
function step(m:Monster,target:[number,number],city:CityId,speed:number){
 const dx=target[0]-m.x,dz=target[1]-m.z,d=Math.hypot(dx,dz);if(d<.05)return m;
 const s=Math.min(speed,d),x=m.x+dx/d*s,z=m.z+dz/d*s;
 if(walkable(city,x,z))return {...m,x,z};
 if(walkable(city,x,m.z))return {...m,x};
 if(walkable(city,m.x,z))return {...m,z};return m;
}
export function advanceMonster(m:Monster,player:[number,number],city:CityId,now:number,defense:number):{monster:Monster;damage:number}{
 const home=m.home??[m.x,m.z],base={...m,home};
 if(m.hp<=0)return {monster:m.respawnAt&&now>=m.respawnAt?{...base,x:home[0],z:home[1],hp:m.maxHp,respawnAt:null,lastAttack:now,telegraph:undefined}:base,damage:0};
 const distance=Math.hypot(player[0]-m.x,player[1]-m.z),safe=Math.hypot(...player)<6;
 if(safe||Math.hypot(player[0]-home[0],player[1]-home[1])>13){return {monster:step({...base,telegraph:undefined},home,city,.3),damage:0};}
 if(m.telegraph){
  if(now<m.telegraph.at)return {monster:base,damage:0};
  const t=m.telegraph,p=attackProfile(m),visible=lineClear(city,[m.x,m.z],t.target);
  let monster={...base,telegraph:undefined,lastAttack:now};
  if(t.kind==='charge'&&visible)monster={...monster,x:t.target[0],z:t.target[1]};
  const hit=visible&&Math.hypot(player[0]-t.target[0],player[1]-t.target[1])<=t.radius;
  return {monster,damage:hit?Math.max(1,Math.round((5+m.level*3)*(m.elite?1.25:1)*p.multiplier-defense*.18)):0};
 }
 const profile=attackProfile(m);
 if(distance<=profile.range&&now-m.lastAttack>1800&&lineClear(city,[m.x,m.z],player)){
  const target:[number,number]=profile.kind==='slam'?[m.x,m.z]:[...player];
  return {monster:{...base,telegraph:{kind:profile.kind,target,at:now+profile.delay,radius:profile.radius}},damage:0};
 }
 return {monster:distance<10&&distance>profile.range*.85?step(base,player,city,m.form==='golem'?.13:.23):base,damage:0};
}
