 'use client';
import { useMemo } from 'react';
import { Instances, Instance, Sparkles } from '@react-three/drei';

// Original procedural architecture: no downloaded models or textures.
function Tower({ x, z }: { x:number; z:number }) {
 return <group position={[x,0,z]}>
  <mesh castShadow receiveShadow position={[0,2.4,0]}><cylinderGeometry args={[1.15,1.45,4.8,8]}/><meshStandardMaterial color="#33383c" roughness={.92}/></mesh>
  {[1,3.6,4.8].map(y=><mesh key={y} position={[0,y,0]} castShadow><cylinderGeometry args={[1.4,1.4,.22,8]}/><meshStandardMaterial color="#696354" metalness={.4}/></mesh>)}
  <mesh castShadow position={[0,6.1,0]}><coneGeometry args={[1.6,2.7,8]}/><meshStandardMaterial color="#202d35" metalness={.55} roughness={.55}/></mesh>
  <mesh position={[0,7.7,0]}><octahedronGeometry args={[.25]}/><meshStandardMaterial color="#d6ae65" emissive="#a96921" emissiveIntensity={.6}/></mesh>
  {[-1,1].map(s=><mesh key={s} position={[s*.55,3,1.04]}><boxGeometry args={[.19,1.2,.08]}/><meshBasicMaterial color="#e8a658"/></mesh>)}
 </group>;
}
export default function Citadel() {
 const stones=useMemo(()=>Array.from({length:625},(_,i)=>({x:(i%25-12)*2.15,z:(Math.floor(i/25)-12)*2.15,h:.06+(Math.sin(i*73.1)+1)*.025})),[]);
 return <group>
  <Instances limit={625} receiveShadow><boxGeometry args={[2.08,.13,2.08]}/><meshStandardMaterial color="#424344" roughness={.95}/>{stones.map((s,i)=><Instance key={i} position={[s.x,s.h-.11,s.z]} color={i%5===0?'#898175':'#686969'}/>)}</Instances>
  {[-18,-9,9,18].map(x=><Tower key={x} x={x} z={-18}/>)}
  {[-18,18].map(x=><Tower key={x} x={x} z={10}/>)}
  {[-13.5,13.5].map(x=><group key={x} position={[x,0,-18]}>
   <mesh castShadow receiveShadow position={[0,1.7,0]}><boxGeometry args={[7,3.4,1.1]}/><meshStandardMaterial color="#393d3e" roughness={1}/></mesh>
   {[-2.8,-1.4,0,1.4,2.8].map(t=><mesh key={t} castShadow position={[t,3.7,0]}><boxGeometry args={[.7,.8,1.3]}/><meshStandardMaterial color="#55534a"/></mesh>)}
  </group>)}
  <group position={[0,0,-19]}>
   {[-4,4].map(x=><mesh key={x} position={[x,3.3,0]} castShadow><boxGeometry args={[1.1,6.6,1.4]}/><meshStandardMaterial color="#59554c"/></mesh>)}
   {[-1,1].map(s=><mesh key={s} position={[s*2,7,0]} rotation={[0,0,s*.72]} castShadow><boxGeometry args={[1,5.8,1.4]}/><meshStandardMaterial color="#59554c"/></mesh>)}
   <mesh position={[0,4.5,.1]}><torusGeometry args={[1.35,.11,8,48]}/><meshStandardMaterial color="#ac905b" metalness={.8} roughness={.35}/></mesh>
   <mesh position={[0,4.5,.1]}><octahedronGeometry args={[.65]}/><meshStandardMaterial color="#66cbbc" emissive="#26a89b" emissiveIntensity={2}/></mesh>
  </group>
  {[-1,1].flatMap(s=>[-12,-5,5,13].map(z=><group key={`${s}-${z}`} position={[s*7,0,z]}>
   <mesh castShadow position={[0,.65,0]}><cylinderGeometry args={[.25,.5,1.3,6]}/><meshStandardMaterial color="#55504a"/></mesh>
   <mesh position={[0,1.35,0]}><coneGeometry args={[.3,.75,7]}/><meshStandardMaterial color="#ffbf61" emissive="#ff751b" emissiveIntensity={3}/></mesh>
   <pointLight position={[0,1.8,0]} color="#ffaf59" intensity={5} distance={5}/>
  </group>))}
  {[-1,1].map(s=><group key={s} position={[s*11,0,-12]}>
   <mesh castShadow position={[0,3,0]}><cylinderGeometry args={[.08,.12,6,8]}/><meshStandardMaterial color="#aa8b57" metalness={.7}/></mesh>
   <mesh position={[.7,4.5,0]}><boxGeometry args={[1.35,2.1,.05]}/><meshStandardMaterial color="#602837" roughness={1}/></mesh>
   <mesh position={[.7,4.5,.04]} rotation={[0,0,Math.PI/4]}><boxGeometry args={[.45,.45,.05]}/><meshStandardMaterial color="#c29d61" metalness={.7}/></mesh>
  </group>)}
  <Sparkles count={90} scale={[45,6,45]} position={[0,2,0]} color="#d5b47b" size={1.5} speed={.15} opacity={.45}/>
 </group>;
}
export function Armor({ color='#56616b', glow='#72e6d0' }: {color?:string;glow?:string}) {
 return <group>
  <mesh position={[0,1.25,.15]} scale={[.48,.65,.3]} castShadow><octahedronGeometry args={[1]}/><meshStandardMaterial color={color} metalness={.8} roughness={.3}/></mesh>
  {[-1,1].map(s=><group key={s}>
   <mesh position={[s*.5,1.7,0]} scale={[.4,.25,.4]} castShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color="#93836a" metalness={.85} roughness={.38}/></mesh>
   <mesh position={[s*.6,1.95,-.05]} rotation={[0,0,-s*.4]} castShadow><coneGeometry args={[.13,.55,4]}/><meshStandardMaterial color="#c6b99b" metalness={.7}/></mesh>
   <mesh position={[s*.55,1.15,.05]} castShadow><boxGeometry args={[.22,.65,.25]}/><meshStandardMaterial color={color} metalness={.7}/></mesh>
  </group>)}
  <mesh position={[0,2.15,0]} scale={[.33,.42,.34]} castShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color={color} metalness={.85} roughness={.3}/></mesh>
  <mesh position={[0,2.18,.3]}><boxGeometry args={[.4,.055,.05]}/><meshBasicMaterial color={glow}/></mesh>
  <mesh position={[0,1.5,.43]}><octahedronGeometry args={[.12]}/><meshBasicMaterial color={glow}/></mesh>
 </group>;
}
