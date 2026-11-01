'use client';
import {Suspense,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls,OrthographicCamera,Html} from '@react-three/drei';
import CapitalEnvironment from './CapitalEnvironment';
import {CITIES,type MainCityId} from '@/game/content';
import {spawnPoints} from '@/game/spawns';

export default function CityStudio(){
 const [id,setId]=useState<MainCityId>('hollow'),[markers,setMarkers]=useState(true);
 const c=CITIES[id];
 return <main className="city-studio">
  <header><span className="eyebrow">SOULFORGE · ENVIRONMENT WORKSHOP</span><h1>เมืองและจุดฟาร์ม · 2.5D</h1><p>โมเดล GLB ต้นแบบที่ใช้ในเกม · ลากเพื่อหมุน / เลื่อนเพื่อซูม · 1 หน่วย = 1 เมตร</p><a href="/play">กลับเข้าเกม</a></header>
  <nav aria-label="เลือกโมเดลเมือง">{(['hollow','dawnveil','thornwatch'] as const).map(city=><button key={city} aria-pressed={city===id} onClick={()=>setId(city)}>{CITIES[city].name}</button>)}<button aria-pressed={markers} onClick={()=>setMarkers(!markers)}>จุดฟาร์ม {markers?'ON':'OFF'}</button><a href={`/models/cities/${id}.glb`} download>ดาวน์โหลด {c.name} .glb</a></nav>
  <div className="city-studio-view"><Canvas shadows dpr={[1,1.5]} fallback={<div className="city-studio-fallback"><h2>ภาพเรนเดอร์จากโมเดลจริง · {c.name}</h2><img src={`/art/cities/${id}-model-preview.png`} alt={`Blender render of ${c.name} GLB`}/><p>อุปกรณ์นี้เปิด WebGL ไม่ได้ — แสดงภาพเรนเดอร์แทนการหมุนโมเดล ดาวน์โหลด GLB ด้านบนเพื่อเปิดใน Blender ได้</p></div>}>
   <color attach="background" args={['#172027']}/><ambientLight intensity={.8}/><hemisphereLight args={['#c5d3e0','#494337',1]}/>
   <directionalLight position={[-15,35,12]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-38} shadow-camera-right={38} shadow-camera-top={38} shadow-camera-bottom={-38} shadow-camera-far={110} shadow-bias={-.0005}/>
   <OrthographicCamera makeDefault position={[40,50,40]} zoom={10} near={.1} far={250}/><OrbitControls target={[0,0,0]} minZoom={5} maxZoom={45} maxPolarAngle={Math.PI/2.4}/>
   <Suspense fallback={<Html center>กำลังโหลดโมเดล…</Html>}><CapitalEnvironment id={id}/></Suspense>
   {markers&&spawnPoints(id).map(p=><Html key={p.id} center position={[p.position[0],1,p.position[1]]}><span className="city-studio-marker">{p.index+1} · {p.name} · Lv.{p.level}</span></Html>)}
  </Canvas></div>
  <section><h2>{c.name}</h2><p>{c.description}</p><p>วงแดง: จุดเกิดมอนสเตอร์ · วงกลาง: Sanctuary · ผลึกม่วง: Waygate</p><p>ไฟล์แยกกลุ่ม Terrain, อาคาร, Sanctuary, Waygate และ Spawn เพื่อแก้ไขต่อใน Blender — รายละเอียดเป็น geometry และสีวัสดุ ยังไม่มี texture แบบภาพคอนเซ็ปต์</p></section>
 </main>;
}
