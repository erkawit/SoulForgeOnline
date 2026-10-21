'use client';
import {useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group} from 'three';
import type {Monster} from '@/lib/types';
function Orb({p,s,c}:{p:[number,number,number];s:[number,number,number];c:string}){return <mesh position={p} scale={s} castShadow><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color={c} roughness={.68} metalness={.3}/></mesh>}
function Spike({p,s,c,angle=0}:{p:[number,number,number];s:[number,number,number];c:string;angle?:number}){return <mesh position={p} scale={s} rotation={[0,0,angle]} castShadow><coneGeometry args={[1,1,6]}/><meshStandardMaterial color={c}/></mesh>}
export default function MonsterBody({mob}:{mob:Monster}){
 const root=useRef<Group>(null),limbs=useRef<(Group|null)[]>([]),previous=useRef([mob.x,mob.z]);
 useFrame(({clock},dt)=>{if(!root.current)return;const dx=mob.x-previous.current[0],dz=mob.z-previous.current[1];if(Math.hypot(dx,dz)>.001)root.current.rotation.y=Math.atan2(dx,dz);previous.current=[mob.x,mob.z];const t=clock.elapsedTime;root.current.position.y=(mob.form==='wraith'||mob.form==='winged')?.18+Math.sin(t*2)*.12:Math.abs(Math.sin(t*4))*.035;limbs.current.forEach((l,i)=>{if(l)l.rotation.z=Math.sin(t*5+i)*.18;});});
 const c=mob.tint??'#9065ad',dark=mob.form==='wolf'?'#514b47':'#45404b',scale=mob.elite?1.3:1;
 return <group ref={root} scale={scale}>
 {mob.form==='spider'?<><Orb p={[0,.65,-.25]} s={[.7,.45,.8]} c={dark}/><Orb p={[0,.7,.6]} s={[.38,.3,.35]} c={c}/>{[-1,1].flatMap(side=>[0,1,2,3].map(i=><group key={`${side}-${i}`} ref={g=>{limbs.current[(side+1)*2+i]=g;}} position={[side*.4,.55,-.65+i*.4]}><Spike p={[side*.45,0,0]} s={[.1,1.3,.12]} angle={side*1.15} c={dark}/><Spike p={[side*.95,-.25,0]} s={[.08,.9,.1]} angle={side*-.4} c={c}/></group>))}</>:
 mob.form==='wolf'||mob.form==='drake'?<><Orb p={[0,.85,0]} s={[.48,.5,.95]} c={dark}/><Orb p={[0,1.15,.85]} s={[.35,.4,.48]} c={c}/><Orb p={[0,1.02,1.2]} s={[.23,.2,.35]} c={dark}/>{[-1,1].flatMap(side=>[-1,1].map((z,i)=><group key={`${side}-${z}`} ref={g=>{limbs.current[(side+1)+i]=g;}} position={[side*.4,.55,z*.6]}><Spike p={[0,-.2,0]} s={[.15,.8,.2]} c={dark}/></group>))}<Spike p={[0,.8,-1.1]} s={[.15,1,.2]} angle={1} c={c}/>{[-1,1].map(side=><Spike key={side} p={[side*.25,1.65,.8]} s={[.14,.55,.16]} angle={side*.3} c="#b9ad8d"/>)}{mob.form==='drake'&&[-1,1].map(side=><group key={side} ref={g=>{limbs.current[side+6]=g;}}><Spike p={[side*.95,1.3,-.2]} s={[.8,1.6,.09]} angle={side*-.8} c={c}/></group>)}</>:
 <><Orb p={[0,1.25,0]} s={mob.form==='golem'?[.8,.85,.5]:[.45,.65,.3]} c={dark}/><Orb p={[0,2.1,0]} s={[.3,.35,.3]} c={c}/>{[-1,1].map((side,i)=><group key={side}><group ref={g=>{limbs.current[i]=g;}} position={[side*.6,1.5,0]}><Orb p={[side*.1,-.3,0]} s={[mob.form==='golem'?.3:.13,.6,.2]} c={c}/></group>{mob.form==='golem'?<Orb p={[side*.35,.4,0]} s={[.28,.5,.3]} c={dark}/>:<Spike p={[side*.15,.55,0]} s={[.35,1.2,.3]} angle={Math.PI} c={dark}/>}<Spike p={[side*.45,2,0]} s={[.15,.7,.16]} angle={side*-.6} c="#bbad8c"/>{mob.form==='winged'&&<Spike p={[side*1.1,1.6,-.15]} s={[.85,1.8,.06]} angle={side*-.6} c={c}/>}</group>)}</>}
 {[-1,1].map(side=><mesh key={side} position={[side*.13,mob.form==='spider'?.8:mob.form==='wolf'||mob.form==='drake'?1.25:2.16,mob.form==='spider'?.9:mob.form==='wolf'||mob.form==='drake'?1.18:.28]}><sphereGeometry args={[.055,8,6]}/><meshBasicMaterial color={mob.elite?'#ffcf59':'#ff665c'}/></mesh>)}
 </group>
}
