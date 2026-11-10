'use client';
import {Suspense,useState,useEffect} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {CITIES,ZONE_IDS,DUNGEON_IDS,portalsOf,type CityId} from '@/game/content';
import {farmPlan} from '@/game/world/farmLayout';
import {collidersFor} from '@/game/world/registry';
import {Waygates} from '@/components/StarterCity';
import FarmGround from '@/components/FarmGround';
import FarmScenery from '@/components/FarmScenery';
import NatureLayer from '@/components/NatureLayer';
function Camera({city,close}:{city:CityId;close:boolean}){
 const {camera}=useThree(),g=portalsOf(city)[0];
 const target:[number,number,number]=close?[g.x,2,g.z]:[0,0,0];
 useEffect(()=>{camera.position.set(target[0]+(close?16:180),close?18:220,target[2]+(close?22:180));camera.lookAt(...target);camera.updateProjectionMatrix();},[city,close,camera]);
 return <OrbitControls target={target} maxPolarAngle={Math.PI*.48}/>;
}
export default function Preview(){
 const [city,setCity]=useState<CityId>('wild0'),[close,setClose]=useState(false),[collision,setCollision]=useState(false);
 const p=farmPlan(city)!;
 return <main style={{height:'100vh',background:'#10151a',color:'#ddd',fontFamily:'sans-serif',display:'flex',flexDirection:'column'}}>
  <header style={{padding:16,display:'flex',gap:16,alignItems:'center',flexWrap:'wrap'}}><strong>ROUND 23 · แผนที่ฟาร์ม</strong>
   <select aria-label="แผนที่" value={city} onChange={e=>setCity(e.target.value as CityId)} style={{background:'#242e34',padding:8}}>{[...ZONE_IDS,...DUNGEON_IDS].map(id=><option key={id} value={id}>{id} · {CITIES[id].name}</option>)}</select>
   <button onClick={()=>setClose(!close)}>{close?'ดูทั้งแผนที่':'ดูเสาวาร์ปใกล้ ๆ'}</button>
   <label><input type="checkbox" checked={collision} onChange={e=>setCollision(e.target.checked)}/> แสดงสิ่งกีดขวางสีแดง</label>
   <span>240 × 240 ม. · 30 กลุ่ม · 150 ตัว</span>
  </header>
  <div style={{flex:1,minHeight:0}}><Canvas camera={{position:[180,220,180],fov:48,far:1200}}><color attach="background" args={['#10151a']}/><ambientLight intensity={1.2}/><directionalLight position={[-30,60,20]} intensity={2}/>
   <Suspense fallback={null}><FarmGround id={city}/><FarmScenery id={city}/><NatureLayer city={city}/><Waygates city={city} interactive={false}/>
    {p.huntingGroups.map(g=><mesh key={g.groupId} rotation={[-Math.PI/2,0,0]} position={[g.positionM.x,.14,g.positionM.y]}><ringGeometry args={[5.8,6,32]}/><meshBasicMaterial color="#cfac71"/></mesh>)}
    {collision&&collidersFor(city).map((c,i)=><mesh key={i} position={[c.x,.3,c.z]} rotation={[-Math.PI/2,0,0]}>{c.kind==='circle'?<circleGeometry args={[c.r+.35,16]}/>:<planeGeometry args={[c.hw*2+.7,c.hd*2+.7]}/>}<meshBasicMaterial color="#ff495c" transparent opacity={.8}/></mesh>)}
   </Suspense><Camera city={city} close={close}/></Canvas></div>
  <footer style={{padding:12}}>ลากเพื่อหมุน · ล้อเมาส์เพื่อซูม · วงสีทอง = พื้นที่เกิดมอนสเตอร์ · หลุมมืด/น้ำเดินไม่ได้ · ภาพและธีมบางส่วนยังเป็นต้นแบบ</footer>
 </main>;
}
