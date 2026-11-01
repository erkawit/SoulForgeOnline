'use client';
import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {useGameStore} from '@/store/useGameStore';
import {FX_DURATION,prerollFx,spawnChannelFx,spawnSkillFx,type FxHandle,type FxKind} from '@/game/fx/skillFx';
import {paintedFor,spawnPaintedFx} from '@/game/fx/paintedFx';

const KINDS:readonly string[]=['attack','skill','buff','special'];
/** fraction of each effect before it visibly connects — a skill released after a cast bar skips its wind-up */
const RELEASE_AT:Record<FxKind,number>={attack:.25,skill:.3,buff:0,special:.62};
/** Watches the player's action and spawns the class effect (see src/game/fx/skillFx.ts):
 *  casting → channel aura, release / instant → skill effect, basic chain → combo-aware swings, Archer draw → charged shot. */
export default function SkillFxLayer(){
 const {scene,camera}=useThree();const live=useRef<FxHandle[]>([]);const stamp=useRef(useGameStore.getState().action.stamp);const last=useRef<[number,number]|null>(null);const yaw=useRef(0);const channel=useRef<FxHandle|null>(null);
 useEffect(()=>()=>{live.current.forEach(f=>f.dispose());live.current=[];},[]);
 useFrame((_,dt)=>{
  const s=useGameStore.getState(),[px,pz]=s.player.position;
  if(last.current){const dx=px-last.current[0],dz=pz-last.current[1],d=Math.hypot(dx,dz);if(d>.001&&d<2)yaw.current=Math.atan2(dx,dz);}last.current=[px,pz];
  const a=s.action;
  // a cast that ended early (moved / interrupted) drops its channel aura
  if(channel.current&&!s.pending){const c=channel.current;c.dispose();live.current=live.current.filter(f=>f!==c);channel.current=null;}
  if(a.stamp!==stamp.current){stamp.current=a.stamp;
   if(KINDS.includes(a.kind)&&!s.deadUntil){
    const alive=s.monsters.filter(m=>m.hp>0);let target=alive.find(m=>m.id===s.selectedMonster);
    if(!target&&a.kind!=='buff'){let best=9;for(const m of alive){const d=Math.hypot(m.x-px,m.z-pz);if(d<best){best=d;target=m;}}}
    if(target&&a.kind!=='buff')yaw.current=Math.atan2(target.x-px,target.z-pz);
    const cls=a.fx?.cls??s.player.classId??'Berserker',kind=(a.fx?.kind??a.kind) as FxKind,origin=new Vector3(px,0,pz);
    if(a.clip==='Channel'){
     if(a.channel){channel.current=spawnChannelFx(scene,{cls,origin,yaw:yaw.current,durationSec:a.duration/1000});live.current.push(channel.current);}
    }else{
     // round 13: a painted (Codex) effect for this skill / combo step wins over the procedural one
     const painted=paintedFor(a.skillId??(a.kind==='attack'&&a.combo!=null?`basic-${a.combo%3}`:undefined));
     const fx=painted?spawnPaintedFx(scene,painted,{origin,yaw:yaw.current,camera:()=>camera,durationSec:a.duration/1000})
      :spawnSkillFx(scene,{cls,kind,origin,yaw:yaw.current,target:target&&a.kind!=='buff'?new Vector3(target.x,0,target.z):null,combo:a.combo,power:a.power});
     // released casts and charged shots start at their release so the hit lands right after the bar / draw
     if(a.released||a.power!=null)prerollFx(fx,painted?painted.hitAt*.8:RELEASE_AT[kind]*FX_DURATION[kind]);
     live.current.push(fx);
    }
   }}
  const step=Math.min(dt,.1);live.current=live.current.filter(f=>{if(f.update(step))return true;f.dispose();if(f===channel.current)channel.current=null;return false;});
 });
 return null;
}
