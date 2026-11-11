'use client';
import Label3D from './Label3D';
import WildTerrain from './WildTerrain';
import NavigationGround from './NavigationGround';
import PaintedFieldGround, { paintedFieldUrl } from './PaintedFieldGround';
import FarmGround from './FarmGround';
import FarmScenery from './FarmScenery';
import {farmPlan} from '@/game/world/farmLayout';
import {navigationPlan} from '@/game/world/terrainNavigation';
import {useEffect,useMemo,useRef} from 'react';
import {useFrame} from '@react-three/fiber';
import {Instances,Instance,Sparkles,useTexture,Billboard} from '@react-three/drei';
import {CITIES,FIELD_ART,WORLD_LIMIT,portalsOf,type Building,type CityId} from '@/game/content';
import {onFieldRoad} from '@/game/world/fieldDimensions';
import {GATE_TRIGGER} from '@/game/world/capitalPlan';
import {useGameStore} from '@/store/useGameStore';
function Box({p,s,c}:{p:[number,number,number];s:[number,number,number];c:string}){return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={.82} metalness={.1}/></mesh>;}
function Structure({b,stone,roof,accent}:{b:Building;stone:string;roof:string;accent:string}){
 const isTower = b.kind === 'tower';
 return <group position={[b.x,0,b.z]}>
  {/* Stepped Stone Plinth */}
  <Box p={[0,.2,0]} s={[b.w+.6,.4,b.d+.6]} c="#363234"/>
  <Box p={[0,.42,0]} s={[b.w+.2,.15,b.d+.2]} c="#4a464c"/>
  {/* Main Masonry Walls */}
  <Box p={[0,b.h/2+.2,0]} s={[b.w,b.h,b.d]} c={stone}/>
  {/* Corner Stone Quoins / Buttresses */}
  {[-1,1].map(sx => [-1,1].map(sz => (
   <Box key={`${sx}-${sz}`} p={[sx*(b.w/2-.15),b.h/2+.2,sz*(b.d/2-.15)]} s={[.45,b.h+.05,.45]} c="#3a373d"/>
  )))}
  {/* Layered Pitched Roof with Overhang */}
  <mesh position={[0,b.h+.9,0]} rotation={[0,Math.PI/4,0]} castShadow>
   <coneGeometry args={[b.w*.78, isTower ? 3.2 : 2.2, 4]}/>
   <meshStandardMaterial color={roof} roughness={.68} metalness={.2}/>
  </mesh>
  {/* Roof Eaves Trim */}
  <Box p={[0,b.h+.25,0]} s={[b.w+.4,.18,b.d+.4]} c="#28262b"/>
  {/* Arched Entrance Door with Iron Studs */}
  <Box p={[0,.9,b.d/2+.06]} s={[1.1,1.8,.15]} c="#221e1d"/>
  <mesh position={[0,1.82,b.d/2+.12]} rotation={[0,0,Math.PI/4]}>
   <boxGeometry args={[.78,.78,.15]}/>
   <meshStandardMaterial color="#221e1d"/>
  </mesh>
  {/* Wall Lantern */}
  <mesh position={[b.w*.32, 1.6, b.d/2+.15]}>
   <boxGeometry args={[.18,.28,.18]}/>
   <meshStandardMaterial color="#ffa34d" emissive="#ff7a1a" emissiveIntensity={1.8}/>
  </mesh>
  <pointLight position={[b.w*.32, 1.6, b.d/2+.4]} color="#ff953b" intensity={2.5} distance={4}/>
  {b.kind==='temple'&&<group>
   <mesh position={[0,b.h+.5,b.d/2+.1]}>
    <torusGeometry args={[.85,.1,8,48]}/>
    <meshStandardMaterial color="#d5b568" metalness={.8} roughness={.3}/>
   </mesh>
   <mesh position={[0,b.h+.5,b.d/2+.08]}>
    <circleGeometry args={[.75,32]}/>
    <meshBasicMaterial color="#70e5d9"/>
   </mesh>
   <pointLight position={[0,b.h+.5,b.d/2+.5]} color="#70e5d9" intensity={3} distance={6}/>
  </group>}
  {b.kind==='forge'&&<>
   <Box p={[b.w*.3,b.h+1,0]} s={[.9,3,.9]} c="#2a282c"/>
   <Sparkles count={18} size={2.2} scale={[.8,2.2,.8]} position={[b.w*.3,b.h+2.8,0]} color="#ff8533" speed={.8}/>
  </>}
 </group>;
}
/** Every waygate of the current map (content.portalsOf): a glowing ring in the gate arch / field corner with where it
 *  leads; walking into it warps the party (free — Orrin's long-distance travel is the paid one). */
export function Waygates({city,interactive=true}:{city:CityId;interactive?:boolean}){
 const gateTexture=useTexture('/art/farm/warp-gate.webp');
 const gates=useMemo(()=>portalsOf(city),[city]);const cool=useRef(0);
 useEffect(()=>{cool.current=performance.now()+1200;},[city]);
 useFrame(()=>{if(!interactive||performance.now()<cool.current)return;const s=useGameStore.getState();if(s.deadUntil)return;const [x,z]=s.player.position;
  const g=gates.find(p=>Math.hypot(p.x-x,p.z-z)<GATE_TRIGGER);if(g){cool.current=performance.now()+3000;s.travel(g.to,{gate:true});}});
 const color=GATE_COLOR[CITIES[city].parent??city]??'#b685ff';
 return <>{gates.map(g=>{const t=CITIES[g.to],lv=t.levels?`Lv ${t.levels[0]}${t.levels[1]>t.levels[0]?'–'+t.levels[1]:''}`:'เมืองหลวง',col=g.kind==='dungeon'?'#c98aff':color;
  return <group key={g.dir+g.to} position={[g.x,0,g.z]} rotation={[0,Math.atan2(-g.x,-g.z),0]}>
   {/* round 24: every gate (capitals, fields, dungeons) is the painted warp gate with two solid pillars — no extra rings
       (their colliders are in registry) */}
   {<>
    <Billboard position={[0,4.1,0]}><mesh><planeGeometry args={[8.5,8.5]}/><meshBasicMaterial map={gateTexture} transparent alphaTest={.05} side={2}/></mesh></Billboard>
    {[-1,1].map(s=><group key={s} position={[s*3.2,0,0]}>
      <mesh position={[0,1.4,0]} castShadow><cylinderGeometry args={[.45,.65,2.8,6]}/><meshStandardMaterial color="#3c3544"/></mesh>
      <mesh position={[0,3,0]}><octahedronGeometry args={[.4]}/><meshStandardMaterial color={col} emissive={col} emissiveIntensity={1}/></mesh>
    </group>)}
   </>}
   <Label3D z={12} position={[0,8.8,0]} className="portal-label" text={`${g.kind==='dungeon'?'ดันเจี้ยน · ':g.kind==='city'?'กลับ · ':''}${t.name}`} sub={`${FIELD_ART[g.to]?.th?FIELD_ART[g.to]!.th+' · ':''}${lv}`}/>
  </group>;})}</>;
}
const GATE_COLOR:Record<string,string>={hollow:'#62e6d2',dawnveil:'#7fe8ff',thornwatch:'#7f9cff'};
export default function StarterCity(){
 const selected=useGameStore(s=>s.player.cityId??'hollow');
 const c=CITIES[selected];
 // the capitals are drawn by CitySpritesLayer (the painted kit); fields and dungeons get their ground, terrain and props here
 const lim=WORLD_LIMIT[c.id]??23, painted=!!c.parent&&!!paintedFieldUrl(c.id);
 const steps=Math.ceil(lim),tiles=Array.from({length:steps*steps},(_,i)=>({x:-lim+1+(i%steps)*2,z:-lim+1+Math.floor(i/steps)*2}))
  .filter(t=>onFieldRoad(c.id,t.x,t.z)&&(!c.water||Math.abs(t.x-c.water.x)>c.water.w/2+.1||(c.water.bridges??[0]).some(z=>Math.abs(t.z-z)<2.1)));
 return <group>
  {c.parent&&<>
  <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[lim*2+40,lim*2+40]}/><meshStandardMaterial color={c.ground} roughness={1}/></mesh>
  {/* round 22: a field with a painting is drawn by its painting (paths, trees, ruins included); the rest keep the built terrain */}
  {/* round 23: measured 240 m farm layout — tiled material ground + solid scenery islands */}
  {farmPlan(c.id)?<><FarmGround id={c.id}/><FarmScenery id={c.id}/></>:painted?<PaintedFieldGround city={c.id}/>:<>{navigationPlan(c.id)&&<NavigationGround city={c}/>}{c.biome&&<WildTerrain city={c}/>}</>}  
  {!painted&&!navigationPlan(c.id)&&<Instances key={c.id} limit={Math.max(1,tiles.length)} receiveShadow><boxGeometry args={[1.94,.1,1.94]}/><meshStandardMaterial roughness={.9}/>{tiles.map((t,i)=><Instance key={i} position={[t.x,c.water&&Math.abs(t.x-c.water.x)<c.water.w/2+.1?.18:.015,t.z]} color={i%4===0?c.stone:c.ground}/>)}</Instances>}
  {!painted&&c.water&&<mesh rotation={[-Math.PI/2,0,0]} position={[c.water.x,.08,0]}><planeGeometry args={[c.water.w,lim*2]}/><meshStandardMaterial color="#3b808e" metalness={.65} roughness={.15} transparent opacity={.8}/></mesh>}
  {!painted&&c.buildings.map((b,i)=><Structure key={i} b={b} stone={c.stone} roof={c.roof} accent={c.accent}/>)}
  </>}
  <Waygates city={c.id}/>
  <Sparkles count={65} scale={[lim*2,7,lim*2]} color={c.accent} size={1.5} speed={.15}/>
 </group>;
}
