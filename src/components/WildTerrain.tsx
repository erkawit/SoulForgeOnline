'use client';
import {Sparkles} from '@react-three/drei';
import type {City} from '@/game/content';

export default function WildTerrain({city:c}:{city:City}){
 const forest=c.parent==='thornwatch',ice=c.biome==='ice',fire=['lava','fortress','eclipse'].includes(c.biome??'');
 return <group>
 {Array.from({length:36},(_,i)=>{
  const jitter = Math.sin(i * 1.7) * 2.8 + Math.cos(i * 3.1) * 2.1;
  const r = 21 + (i % 5) * 1.2 + jitter;
  const a = (i / 36) * Math.PI * 2 + Math.sin(i * 2.4) * 0.15;
  const x = Math.cos(a) * r, z = Math.sin(a) * r, h = 2.4 + (i % 4) * 0.6;
  const leafColor = c.biome==='poison'?'#7a458f':c.biome==='grove'?'#44727d':c.biome==='lava'?'#3a2822':'#2e4d35';
  return <group key={i} position={[x,0,z]} rotation={[0,i*0.4,0]}>
  {forest || c.biome==='forest' || c.biome==='grove' || c.biome==='poison' ? (
   <>
    {/* Tree Trunk */}
    <mesh position={[0,h/2,0]} castShadow>
     <cylinderGeometry args={[.22,.45,h,7]}/>
     <meshStandardMaterial color="#4a362b" roughness={0.9}/>
    </mesh>
    {/* Tiered Foliage Cones */}
    <mesh position={[0,h*0.8,0]} castShadow>
     <coneGeometry args={[1.9,h*0.7,7]}/>
     <meshStandardMaterial color={leafColor} roughness={0.8}/>
    </mesh>
    <mesh position={[0,h*1.2,0]} castShadow>
     <coneGeometry args={[1.4,h*0.6,7]}/>
     <meshStandardMaterial color={leafColor} roughness={0.8}/>
    </mesh>
    {/* Mossy Rock at Base */}
    {i % 2 === 0 && (
     <mesh position={[0.5,0.2,0.3]} castShadow>
      <dodecahedronGeometry args={[0.35, 0]}/>
      <meshStandardMaterial color="#52544e" roughness={0.9}/>
     </mesh>
    )}
   </>
  ) : (
   <group>
    {/* Jagged Rock Crag / Ice Spire */}
    <mesh position={[0,h/2,0]} castShadow>
     {ice||c.biome==='astral'?<coneGeometry args={[.85,h,5]}/>:<cylinderGeometry args={[.5,1.1,h,6]}/>}
     <meshStandardMaterial color={ice?'#9ec2d2':c.stone} metalness={ice?0.5:0.2} roughness={0.6}/>
    </mesh>
   </group>
  )}
  </group>;
 })}
 {[-1,1].flatMap(side=>[0,1,2,3].map(i=><group key={`${side}-${i}`} position={[side*(7+i*3),0,side*13]}>
 <mesh position={[0,.2,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[1.3,16]}/><meshStandardMaterial color={fire?'#a64222':forest?'#38452f':c.stone}/></mesh>
 <mesh position={[0,.6,0]} castShadow>{forest?<sphereGeometry args={[.7,8,6,0,Math.PI*2,0,Math.PI/2]}/>:<octahedronGeometry args={[.6]}/>}<meshStandardMaterial color={c.accent} emissive={c.accent} emissiveIntensity={fire?.9:.25}/></mesh>
 </group>))}
 {c.biome==='grave'&&[-1,1].flatMap(side=>[0,1,2,3].map(i=><mesh key={`${side}-${i}`} position={[side*(8+i*3),.6,-5]} rotation={[0,.2*side,.05]} castShadow><boxGeometry args={[.7,1.2,.22]}/><meshStandardMaterial color="#797878"/></mesh>))}
 {c.biome==='eclipse'&&<mesh position={[0,7,-23]}><torusGeometry args={[4,.35,12,64]}/><meshStandardMaterial color="#c9ac78" emissive="#9b429a" emissiveIntensity={.6}/></mesh>}
 <Sparkles count={60} scale={[44,5,44]} color={fire?'#f59154':c.accent} size={2} speed={.3}/>
 </group>
}
