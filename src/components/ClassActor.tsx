'use client';
import ClassRegalia from './ClassRegalia';
import {useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,Vector3,Quaternion,MathUtils} from 'three';
import {Line,Html} from '@react-three/drei';
import {useGameStore} from '@/store/useGameStore';
import {CLASSES,TIER_COLORS,type ClassId} from '@/game/content';

function Part({at,size,color,metal=.45}:{at:[number,number,number];size:[number,number,number];color:string;metal?:number}){
 return <mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal} roughness={.48}/></mesh>;
}
function Gem({at,color,size=.12}:{at:[number,number,number];color:string;size?:number}){return <mesh position={at}><octahedronGeometry args={[size]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} metalness={.6} roughness={.2}/></mesh>;}
function Sword({color,tier}:{color:string;tier:number}){return <group>
 <Part at={[0,-.12,0]} size={[.09,.34,.09]} color="#39272a"/>
 <Part at={[0,.08,0]} size={[.48+tier*.02,.08,.13]} color="#b8a171"/>
 <mesh position={[0,.72,0]} scale={[.11,1,.055]} castShadow><octahedronGeometry args={[.65]}/><meshStandardMaterial color={tier>4?'#bba573':'#c1c8cd'} metalness={.85} roughness={.28}/></mesh>
 {tier>0&&<Part at={[0,.66,.06]} size={[.025,.95,.012]} color={color}/>}
 <Gem at={[0,.09,.08]} color={color} size={.08}/>
 </group>;}
function Shield({color,tier}:{color:string;tier:number}){return <group rotation={[0,0,0]}>
 <mesh scale={[.4,.63,.09]} castShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color="#474851" metalness={.8} roughness={.4}/></mesh>
 <mesh position={[0,0,.08]} scale={[.32,.53,.04]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color="#6b3541" metalness={.4}/></mesh>
 <Part at={[0,0,.14]} size={[.04,1.02,.025]} color="#ad9762"/>
 <Gem at={[0,.08,.17]} color={color} size={.09+tier*.01}/>
 </group>;}
function Staff({color,tier}:{color:string;tier:number}){return <group>
 <mesh position={[0,1.15,0]} castShadow><cylinderGeometry args={[.045,.055,2.3,10]}/><meshStandardMaterial color="#443632" roughness={.65}/></mesh>
 <mesh position={[0,2.45,0]} rotation={[0,0,.5]}><torusGeometry args={[.27,.035,8,32,Math.PI*1.65]}/><meshStandardMaterial color="#c3a36c" metalness={.85}/></mesh>
 <Gem at={[0,2.44,0]} size={.16+tier*.008} color={color}/>
 {tier>4&&<mesh position={[0,2.45,0]} rotation={[.6,0,0]}><torusGeometry args={[.34,.018,6,32]}/><meshStandardMaterial color="#cfb571" metalness={.9}/></mesh>}
 </group>;}
function Focus({color,tier}:{color:string;tier:number}){return <group>
 <Part at={[0,-.2,0]} size={[.07,.35,.07]} color="#90764b"/>
 <mesh><torusGeometry args={[.27+tier*.008,.027,8,40]}/><meshStandardMaterial color="#bca164" metalness={.85}/></mesh>
 {[0,1,2].map(i=><Gem key={i} at={[Math.cos(i*2.094)*.15,Math.sin(i*2.094)*.15,0]} size={.06} color={color}/>)}
 </group>;}
export default function ClassActor(){
 const cls=useGameStore(s=>s.player.classId??'Warrior');
 const weapon=useGameStore(s=>s.equipment.weapon);
 const tier=Math.max(0,Math.min(7,weapon?.tier??({Common:0,Uncommon:1,Rare:2,Epic:3,Crimson:4,Legendary:5,Ascendant:6,Eclipse:7}[weapon?.rarity??'Common'])));
 const def=CLASSES[cls], glow=tier===0?def.glow:TIER_COLORS[tier];
 const root=useRef<Group>(null), body=useRef<Group>(null), head=useRef<Group>(null), cloak=useRef<Group>(null);
 const legs=useRef<(Group|null)[]>([]),knees=useRef<(Group|null)[]>([]);
 const upper=useRef<(Group|null)[]>([]),lower=useRef<(Group|null)[]>([]),hands=useRef<(Group|null)[]>([]);
 const staff=useRef<Group>(null),fx=useRef<Group>(null);
 const last=useRef(new Vector3()),phase=useRef(0),speed=useRef(0),facing=useRef(0);
 const v=useMemo(()=>({a:new Vector3(),b:new Vector3(),d:new Vector3(),up:new Vector3(0,1,0),q:new Quaternion()}),[]);
 const bow=useMemo(()=>Array.from({length:25},(_,i)=>{const a=i/24*Math.PI;return [0,Math.cos(a)*.85,-Math.sin(a)*.25] as [number,number,number];}),[]);
 useFrame((state,delta)=>{
  if(!root.current||!body.current)return;
  const s=useGameStore.getState(),dt=Math.min(delta,.05),now=Date.now(),p=s.player.position;
  const dx=p[0]-last.current.x,dz=p[1]-last.current.z,moved=Math.hypot(dx,dz);
  if(moved>.002&&moved<2)facing.current=Math.atan2(dx,dz);
  last.current.set(p[0],0,p[1]);root.current.position.set(p[0],0,p[1]);
  const target=s.monsters.find(m=>m.id===s.selectedMonster&&m.hp>0);
  if(target)facing.current=Math.atan2(target.x-p[0],target.z-p[1]);
  root.current.rotation.y+=(MathUtils.euclideanModulo(facing.current-root.current.rotation.y+Math.PI,Math.PI*2)-Math.PI)*(1-Math.exp(-14*dt));
  const age=s.action.duration>0?(now-s.action.stamp)/s.action.duration:2;
  const kind=s.deadUntil?'death':age<1?s.action.kind:'idle';
  const walking=kind==='walk'||moved>.001;
  speed.current=MathUtils.damp(speed.current,walking?1:0,10,dt);phase.current+=dt*(cls==='Warrior'?7.5:9);
  const wave=Math.sin(phase.current),bend=Math.sin(Math.PI*Math.min(1,Math.max(0,age)));
  const dead=kind==='death'?Math.min(1,(now-s.action.stamp)/1700):0;
  body.current.position.y=dead?.14*dead:Math.abs(wave)*.045*speed.current;
  body.current.rotation.z=dead?-1.48*dead:wave*.025*speed.current;
  body.current.rotation.x=dead?.15:kind==='special'?bend*.15:0;
  body.current.rotation.y=(kind==='attack'||kind==='skill')&&cls==='Warrior'?Math.sin(Math.min(age,1)*Math.PI*2)*.4:0;
  if(head.current)head.current.rotation.x=kind==='buff'?bend*.18:0;
  if(cloak.current)cloak.current.rotation.x=.1+speed.current*.12+Math.sin(phase.current-1)*.04;
  for(let i=0;i<2;i++){
   const gait=Math.sin(phase.current+i*Math.PI)*speed.current;
   if(legs.current[i])legs.current[i]!.rotation.x=dead?.15:gait*.5;
   if(knees.current[i])knees.current[i]!.rotation.x=dead?.65:Math.max(0,-gait)*.65;
  }
  const right=new Vector3(.55,1.12,.1),left=new Vector3(-.55,1.12,.1);
  right.z-=wave*.16*speed.current;left.z+=wave*.16*speed.current;
  const striking=kind==='attack'||kind==='skill';
  if(cls==='Warrior'){
   if(striking)right.set(.5-bend*.7,1.25+bend*.7,.2+bend*.65);
   if(kind==='buff')right.set(.35,1.1+bend*1.25,.25);
   if(kind==='special')left.set(-.15,1.5,.65);
  }else if(cls==='Mage'){
   const lift=kind==='special'?bend*.55:0;
   right.set(.15,1.02+lift,.5+(striking?bend*.25:0));left.set(.15,1.53+lift,.5+(striking?bend*.25:0));
   if(staff.current)staff.current.position.set(.15,lift-.03,.5+(striking?bend*.25:0));
  }else if(cls==='Archer'){
   left.set(-.28,1.55,.65);right.set(.28,1.5,striking||kind==='special'?-.05-bend*.22:.25);
  }else{
   left.set(-.45,1.4,.45);if(striking)right.set(.35,1.5,.25+bend*.6);
   if(kind==='buff'||kind==='special'){right.set(.5,1.35+bend*.5,.5);left.set(-.5,1.4+bend*.3,.5);}
  }
  if(dead){right.set(.65,1,.25);left.set(-.7,1,.25);}
  [right,left].forEach((w,i)=>{
   const shoulder=new Vector3(i===0?.4:-.4,1.73,0);
   const axis=w.clone().sub(shoulder);const length=Math.min(.99,Math.max(.05,axis.length()));axis.normalize();w.copy(shoulder).addScaledVector(axis,length);
   const outward=new Vector3(i===0?1:-1,0,-.8);outward.addScaledVector(axis,-outward.dot(axis)).normalize();
   const elbow=shoulder.clone().addScaledVector(axis,length/2).addScaledVector(outward,Math.sqrt(.52*.52-length*length/4));
   [[shoulder,elbow,upper.current[i]],[elbow,w,lower.current[i]]].forEach(([a,b,g])=>{if(!g)return;const start=a as Vector3,end=b as Vector3,joint=g as Group;joint.position.copy(start).add(end).multiplyScalar(.5);v.d.copy(end).sub(start);joint.quaternion.setFromUnitVectors(v.up,v.d.clone().normalize());joint.scale.y=v.d.length();});
   if(hands.current[i]){hands.current[i]!.position.copy(w);hands.current[i]!.rotation.x=cls==='Warrior'&&i===0&&striking?bend*1.6:0;}
  });
  if(fx.current){const active=kind==='skill'||kind==='buff'||kind==='special';fx.current.visible=active;fx.current.scale.setScalar(.7+bend*(kind==='special'?3:1.5));fx.current.rotation.y=state.clock.elapsedTime*.5;}
 });
 return <group ref={root}>
  <group ref={body}>
   <ClassRegalia cls={cls}/>
   <Part at={[0,1.05,0]} size={[.55,.22,.3]} color="#403b38"/>
   <mesh position={[0,1.48,0]} scale={[.43,.46,.24]} castShadow><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color={cls==='Warrior'?def.metal:def.cloth} roughness={.65} metalness={cls==='Warrior'?.75:.15}/></mesh>
   <Part at={[0,1.22,.25]} size={[.62,.09,.08]} color="#9f875d"/>
   <Part at={[0,1.5,.25]} size={[.045,.6,.025]} color="#baa176"/>
   <Gem at={[0,1.64,.27]} color={glow} size={.09}/>
   <group ref={head} position={[0,2,0]}>
    <mesh scale={[.23,.29,.22]} castShadow><sphereGeometry args={[1,16,12]}/><meshStandardMaterial color={cls==='Warrior'?def.metal:'#c4a68e'} metalness={cls==='Warrior'?.75:0} roughness={.6}/></mesh>
    {cls==='Warrior'?<><Part at={[0,.03,.2]} size={[.32,.04,.04]} color={glow}/><Part at={[0,.13,.22]} size={[.035,.33,.035]} color="#baa176"/></>:<mesh position={[0,.13,-.04]} scale={[.24,.2,.22]}><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color={cls==='Enchanter'?'#b3b4b7':cls==='Archer'?'#663827':'#28252b'}/></mesh>}
    {cls!=='Warrior'&&<>{[-1,1].map(side=><mesh key={side} position={[side*.085,.015,.205]}><sphereGeometry args={[.022,8,6]}/><meshStandardMaterial color="#364144"/></mesh>)}<mesh position={[0,-.04,.22]}><coneGeometry args={[.035,.09,5]}/><meshStandardMaterial color="#c4a68e"/></mesh></>}
    {(cls==='Archer'||cls==='Priest')&&Array.from({length:8},(_,i)=><mesh key={i} position={[cls==='Archer'?.2:0,-.05-i*.07,-.19]} scale={[.05,.065,.05]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={cls==='Archer'?'#663827':'#28252b'}/></mesh>)}
    {cls==='Warrior'&&<mesh position={[0,.28,0]} scale={[.04,.2,.2]}><octahedronGeometry args={[1]}/><meshStandardMaterial color="#aa8c59" metalness={.8}/></mesh>}
   </group>
   <group ref={cloak} position={[0,1.75,-.2]}><mesh position={[0,-.55,-.12]} scale={[.5,.75,.09]} castShadow><coneGeometry args={[1,1.6,8]}/><meshStandardMaterial color={def.cloth} roughness={1}/></mesh></group>
   {[0,1].map(i=><group key={i}>
    <mesh position={[i===0?.44:-.44,1.76,0]} scale={[.23,.17,.28]} castShadow><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={def.metal} metalness={.8} roughness={.4}/></mesh>
    <group ref={g=>{upper.current[i]=g;}}><mesh castShadow><cylinderGeometry args={[.105,.11,1,10]}/><meshStandardMaterial color={def.cloth}/></mesh></group>
    <group ref={g=>{lower.current[i]=g;}}><mesh castShadow><cylinderGeometry args={[.09,.12,1,10]}/><meshStandardMaterial color={def.metal} metalness={.7} roughness={.4}/></mesh></group>
    <group ref={g=>{hands.current[i]=g;}}>
     <Part at={[0,0,0]} size={[.15,.18,.15]} color="#4b3d37"/>
     {cls==='Warrior'&&(i===0?<Sword color={glow} tier={tier}/>:<Shield color={glow} tier={tier}/>)}
     {cls==='Priest'&&(i===0?<group><Part at={[0,.15,0]} size={[.07,.7,.07]} color="#9d8357"/><Gem at={[0,.55,0]} size={.22} color={glow}/></group>:<group rotation={[-.6,0,0]}><Part at={[0,0,0]} size={[.42,.12,.52]} color="#7e533e"/><Part at={[0,.07,0]} size={[.36,.025,.45]} color="#d8c8a0"/><Part at={[0,.09,0]} size={[.02,.02,.45]} color="#9c7842"/></group>)}
     {cls==='Enchanter'&&(i===0?<Gem at={[0,0,.12]} color={glow}/>:<Focus color={glow} tier={tier}/>)}
     {cls==='Archer'&&i===1&&<group><Line points={bow} color={tier>4?'#d8b16e':'#a28660'} lineWidth={5}/><Line points={[[0,-.85,0],[0,0,.18],[0,.85,0]]} color={glow} lineWidth={1}/></group>}
    </group>
    <group ref={g=>{legs.current[i]=g;}} position={[i===0?.18:-.18,1.03,0]}>
     <Part at={[0,-.23,0]} size={[.23,.47,.27]} color={cls==='Warrior'?def.metal:'#403d3a'}/>
     <group ref={g=>{knees.current[i]=g;}} position={[0,-.47,0]}><Part at={[0,-.21,0]} size={[.21,.42,.24]} color={def.metal}/><Part at={[0,-.45,.12]} size={[.24,.15,.45]} color="#3f3430"/></group>
    </group>
   </group>)}
   {cls==='Mage'&&<group ref={staff}><Staff color={glow} tier={tier}/></group>}
   {cls==='Archer'&&<group position={[.18,1.5,-.4]} rotation={[0,0,-.3]}><mesh><cylinderGeometry args={[.15,.12,.8,10]}/><meshStandardMaterial color="#57402d"/></mesh>{[-.07,0,.07].map(x=><Part key={x} at={[x,.6,0]} size={[.018,.55,.018]} color="#d8c7a0"/>)}</group>}
  </group>
  <group ref={fx} position={[0,.08,0]}><mesh rotation={[-Math.PI/2,0,0]}><torusGeometry args={[1,.025,6,64]}/><meshBasicMaterial color={def.glow} transparent opacity={.7}/></mesh></group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.025,0]}><ringGeometry args={[.6,.63,40]}/><meshBasicMaterial color={def.glow}/></mesh>
  <Html center position={[0,2.6,0]} zIndexRange={[20,0]} style={{pointerEvents:'none'}}><span className="actor-label">{cls.toUpperCase()}</span></Html>
 </group>;
}
