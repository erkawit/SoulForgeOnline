'use client';
import WildTerrain from './WildTerrain';
import {Instances,Instance,Html,Sparkles} from '@react-three/drei';
import {CITIES,type Building} from '@/game/content';
import {useGameStore} from '@/store/useGameStore';
import {useMultiplayerStore} from '@/store/useMultiplayerStore';
function Box({p,s,c}:{p:[number,number,number];s:[number,number,number];c:string}){return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.85}/></mesh>;}
function Structure({b,stone,roof,accent}:{b:Building;stone:string;roof:string;accent:string}){
 return <group position={[b.x,0,b.z]}>
  <Box p={[0,.22,0]} s={[b.w+.3,.44,b.d+.3]} c="#69645c"/>
  <Box p={[0,b.h/2,0]} s={[b.w,b.h,b.d]} c={stone}/>
  <mesh position={[0,b.h+1,0]} rotation={[0,Math.PI/4,0]} castShadow><coneGeometry args={[b.w*.82,2.5,4]}/><meshStandardMaterial color={roof} roughness={.75}/></mesh>
  {[-1,1].map(side=><group key={side}>
   <Box p={[side*(b.w/2-.18),b.h/2,b.d/2+.1]} s={[.25,b.h,.3]} c="#b1a48c"/>
   <Box p={[side*b.w*.25,b.h*.58,b.d/2+.03]} s={[.43,.9,.07]} c={accent}/>
   <mesh position={[side*b.w*.25,b.h*.58+.54,b.d/2+.08]} rotation={[Math.PI/2,0,0]}><circleGeometry args={[.22,3]}/><meshBasicMaterial color={accent} side={2}/></mesh>
  </group>)}
  <Box p={[0,.9,b.d/2+.06]} s={[1.1,1.8,.15]} c="#342e2e"/>
  <mesh position={[0,1.9,b.d/2+.12]} rotation={[0,0,Math.PI/4]}><boxGeometry args={[.78,.78,.15]}/><meshStandardMaterial color="#342e2e"/></mesh>
  {b.kind==='temple'&&<group><mesh position={[0,b.h+.4,b.d/2+.1]}><torusGeometry args={[.8,.09,8,48]}/><meshStandardMaterial color="#d5b568" metalness={.8}/></mesh><mesh position={[0,b.h+.4,b.d/2+.08]}><circleGeometry args={[.7,32]}/><meshBasicMaterial color="#98c3d5"/></mesh></group>}
  {b.kind==='forge'&&<><Box p={[b.w*.3,b.h+1,0]} s={[.8,3,.8]} c="#454146"/><Sparkles count={15} size={2} scale={[.7,2,.7]} position={[b.w*.3,b.h+3,0]} color="#e89d56" speed={.7}/></>}
 </group>;
}
export default function StarterCity(){
 const online=useMultiplayerStore(s=>s.online);
 const selected=useGameStore(s=>s.player.cityId??'hollow');
 const c=CITIES[online?'hollow':selected];
 const tiles=Array.from({length:576},(_,i)=>({x:(i%24-11.5)*2,z:(Math.floor(i/24)-11.5)*2}));
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[80,80]}/><meshStandardMaterial color={c.ground} roughness={1}/></mesh>
  {c.biome&&<WildTerrain city={c}/>}
  <Instances limit={576} receiveShadow><boxGeometry args={[1.94,.1,1.94]}/><meshStandardMaterial roughness={.9}/>{tiles.filter(t=>(!c.biome||Math.abs(t.x)<3||Math.abs(t.z)<3)&&(!c.water||Math.abs(t.x-c.water.x)>c.water.w/2)).map((t,i)=><Instance key={i} position={[t.x,.015,t.z]} color={i%4===0?c.stone:c.ground}/>)}</Instances>
  <Box p={[0,.05,0]} s={[5,.08,47]} c={c.id==='dawnveil'?'#9a998f':'#696658'}/>
  <Box p={[0,.06,0]} s={[47,.08,4.5]} c={c.id==='dawnveil'?'#9a998f':'#696658'}/>
  {c.water&&<><mesh rotation={[-Math.PI/2,0,0]} position={[c.water.x,.08,0]}><planeGeometry args={[c.water.w,49]}/><meshStandardMaterial color="#3b808e" metalness={.65} roughness={.15} transparent opacity={.8}/></mesh><Box p={[8,.17,0]} s={[5,.2,4.5]} c="#acaa94"/>{[-1,1].map(side=><Box key={side} p={[8,.6,side*2.3]} s={[5,.6,.17]} c="#9b9785"/>)}</>}
  {c.buildings.map((b,i)=><Structure key={i} b={b} stone={c.stone} roof={c.roof} accent={c.accent}/>)}
  {c.id==='hollow'&&[-1,1].map(side=><group key={side}><Box p={[side*15,1.4,-18]} s={[12,2.8,.7]} c={c.stone}/>{Array.from({length:9},(_,i)=><Box key={i} p={[side*15-5+i*1.3,3,-18]} s={[.6,.65,.8]} c={c.stone}/>)}</group>)}
  {c.id==='thornwatch'&&Array.from({length:28},(_,i)=>{const a=i/28*Math.PI*2,x=Math.cos(a)*26,z=Math.sin(a)*26;return <group key={i} position={[x,0,z]}><mesh position={[0,2.2,0]} castShadow><cylinderGeometry args={[.3,.6,4.4,7]}/><meshStandardMaterial color="#554433"/></mesh>{[0,1,2].map(j=><mesh key={j} position={[0,4+j*1.2,0]} castShadow><coneGeometry args={[2.5-j*.5,3.5,8]}/><meshStandardMaterial color={j%2?'#3c5a43':'#2c4837'}/></mesh>)}</group>;})}
  <mesh position={[0,.18,0]} receiveShadow><cylinderGeometry args={[2.6,2.8,.35,16]}/><meshStandardMaterial color={c.stone} roughness={.8}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.37,0]}><torusGeometry args={[2.1,.04,6,64]}/><meshBasicMaterial color={c.accent}/></mesh>
  <mesh position={[0,1.15,0]}><octahedronGeometry args={[.6]}/><meshStandardMaterial color={c.accent} emissive={c.accent} emissiveIntensity={.8} metalness={.65}/></mesh>
  <Html center position={[0,2.3,0]} zIndexRange={[12,0]} style={{pointerEvents:'none'}}><span className="city-label">SANCTUARY · SAFE AREA</span></Html>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.04,0]}><ringGeometry args={[5.9,6,96]}/><meshBasicMaterial color={c.accent} transparent opacity={.2}/></mesh>
  {[-1,1].flatMap(x=>[-8,7,16].map(z=><group key={`${x}-${z}`} position={[x*4,0,z]}><Box p={[0,.7,0]} s={[.22,1.4,.22]} c="#47413a"/><mesh position={[0,1.6,0]}><sphereGeometry args={[.16,8,8]}/><meshBasicMaterial color="#ffc785"/></mesh><pointLight position={[0,1.8,0]} color="#ffc785" intensity={4} distance={4}/></group>))}
  <group position={[0,0,7]} onClick={()=>useGameStore.getState().setJournal(true)}><mesh position={[0,.8,0]}><torusGeometry args={[.65,.08,8,32]}/><meshStandardMaterial color="#d1b873" emissive={c.accent} emissiveIntensity={.35}/></mesh><Html center position={[0,1.9,0]} zIndexRange={[12,0]}><button className="portal-label" onClick={()=>useGameStore.getState().setJournal(true)}>WAYGATE · TRAVEL</button></Html></group>
  <Sparkles count={65} scale={[46,7,46]} color={c.accent} size={1.5} speed={.15}/>
 </group>;
}
