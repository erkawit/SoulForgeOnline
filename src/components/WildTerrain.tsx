'use client';
import {Sparkles} from '@react-three/drei';
import type {City} from '@/game/content';
export default function WildTerrain({city:c}:{city:City}){
 const forest=c.parent==='thornwatch',ice=c.biome==='ice',fire=['lava','fortress','eclipse'].includes(c.biome??'');
 return <group>
 {Array.from({length:36},(_,i)=>{const a=i/36*Math.PI*2,r=24+(i%3)*1.8,x=Math.cos(a)*r,z=Math.sin(a)*r,h=2+i%5;return <group key={i} position={[x,0,z]} rotation={[0,i,0]}>
 {forest?<><mesh position={[0,h/2,0]} castShadow><cylinderGeometry args={[.25,.6,h,7]}/><meshStandardMaterial color="#57443b"/></mesh><mesh position={[0,h,0]} castShadow>{c.biome==='poison'?<sphereGeometry args={[1.8,12,8,0,Math.PI*2,0,Math.PI/2]}/>:<coneGeometry args={[2,h,8]}/>}<meshStandardMaterial color={c.biome==='poison'?'#8656a1':c.biome==='grove'?'#547c86':'#385641'}/></mesh></>:<mesh position={[0,h/2,0]} castShadow>{ice||c.biome==='astral'?<coneGeometry args={[.8,h,5]}/>:<boxGeometry args={[1.3,h,1.3]}/>}<meshStandardMaterial color={ice?'#a3c9d8':c.stone} metalness={.4} roughness={.55}/></mesh>}
 </group>})}
 {[-1,1].flatMap(side=>[0,1,2,3].map(i=><group key={`${side}-${i}`} position={[side*(7+i*3),0,side*13]}>
 <mesh position={[0,.2,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[1.3,16]}/><meshStandardMaterial color={fire?'#a64222':forest?'#38452f':c.stone}/></mesh>
 <mesh position={[0,.6,0]} castShadow>{forest?<sphereGeometry args={[.7,8,6,0,Math.PI*2,0,Math.PI/2]}/>:<octahedronGeometry args={[.6]}/>}<meshStandardMaterial color={c.accent} emissive={c.accent} emissiveIntensity={fire?.9:.25}/></mesh>
 </group>))}
 {c.biome==='grave'&&[-1,1].flatMap(side=>[0,1,2,3].map(i=><mesh key={`${side}-${i}`} position={[side*(8+i*3),.6,-5]} rotation={[0,.2*side,.05]} castShadow><boxGeometry args={[.7,1.2,.22]}/><meshStandardMaterial color="#797878"/></mesh>))}
 {c.biome==='eclipse'&&<mesh position={[0,7,-23]}><torusGeometry args={[4,.35,12,64]}/><meshStandardMaterial color="#c9ac78" emissive="#9b429a" emissiveIntensity={.6}/></mesh>}
 <Sparkles count={60} scale={[44,5,44]} color={fire?'#f59154':c.accent} size={2} speed={.3}/>
 </group>
}
