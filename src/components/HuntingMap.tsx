'use client';
import {useState} from 'react';
import {CITIES,CITY_IDS,ZONE_IDS,DUNGEON_IDS,WORLD_LIMIT,portalsOf,type CityId} from '@/game/content';
import {spawnPoints} from '@/game/spawns';
import {useGameStore} from '@/store/useGameStore';
import {useMultiplayerStore} from '@/store/useMultiplayerStore';

export default function HuntingMap(){
 const current=useGameStore(s=>s.player.cityId??'hollow');
 const level=useGameStore(s=>s.player.level);
 const online=useMultiplayerStore(s=>s.online);
 const [area,setArea]=useState<CityId>(current),[point,setPoint]=useState(0);
 const lim=WORLD_LIMIT[area]??23;
 const c=CITIES[area],region=c.parent??c.id,points=spawnPoints(area),selected=points[point]??points[0];
 const selectArea=(id:CityId)=>{setArea(id);setPoint(0);};
 return <section className="hunting-atlas" aria-label="แผนที่จุดเกิดมอนสเตอร์">
  <h2>แผนที่ล่ามอนสเตอร์ · สามเมืองหลัก</h2>
  <p><a href="/cities" target="_blank" rel="noopener noreferrer">เปิดห้องดูโมเดลเมือง 2.5D / ดาวน์โหลด GLB สำหรับ Blender ↗</a></p>
  <p>เลือกเมืองและพื้นที่ แล้วเลือกหมายเลขเพื่อดูมอนสเตอร์ประจำจุด · ทิศเหนืออยู่ด้านบน</p>
  <div className="atlas-regions">{CITY_IDS.map(id=><button key={id} aria-pressed={region===id} onClick={()=>selectArea(id)}><strong>{CITIES[id].name}</strong><small>{id==='hollow'?'ป้อมกอธิก / โรงหลอม · รอบเมือง Lv.1–40':id==='dawnveil'?'วิหารริมคลอง · รอบเมือง Lv.45–82':'เมืองชายป่า / หอเฝ้าระวัง · รอบเมือง Lv.85–90'}</small></button>)}</div>
  <div className="atlas-layout"><div className="atlas-areas" aria-label="พื้นที่ในอาณาเขต">{[region,...ZONE_IDS.filter(id=>CITIES[id].parent===region),...DUNGEON_IDS.filter(id=>CITIES[id].parent===region)].map(id=><button key={id} aria-pressed={area===id} onClick={()=>selectArea(id)}><strong>{CITIES[id].name}</strong><small>{CITIES[id].levels?`Lv. ${CITIES[id].levels!.join('–')} · ${CITIES[id].dungeon?'ดันเจี้ยน':'พื้นที่ล่า'}`:'เมืองหลัก · จุดฝึกรอบนอก Lv.1 / 5 / 10'}</small></button>)}</div>
  <div><h3>{c.name} · {lim*2} × {lim*2} ม.</h3><p>{c.description}</p>
   <svg className="atlas-map" viewBox={`${-lim-5} ${-lim-5} ${2*lim+10} ${2*lim+10}`} role="img" aria-label={`แผนที่ ${c.name}: จุดเกิด ${points.length} จุด เลือกผ่านรายการหมายเลขด้านล่าง`}>
    <rect x={-lim} y={-lim} width={lim*2} height={lim*2} rx="1" fill={c.ground}/>
    {c.water&&<rect x={c.water.x-c.water.w/2} y={-lim} width={c.water.w} height={lim*2} fill="#397b94"/>}
    <path d={c.mapPath} stroke="#c4b99d" strokeWidth="2" fill="none" opacity=".6"/>
    {c.water&&<rect x={c.water.x-c.water.w/2-.5} y="-2" width={c.water.w+1} height="4" fill="#c4b99d"/>}
    {c.buildings.map((b,i)=><rect key={i} x={b.x-b.w/2} y={b.z-b.d/2} width={b.w} height={b.d} fill={c.roof} stroke={c.accent} strokeWidth=".3"/>)}
    {!c.parent && <g><circle r="6" fill={c.accent} fillOpacity=".18" stroke={c.accent} strokeWidth=".25"/>
    <text y="1" textAnchor="middle" fill="#fff" fontSize="1.8">SAFE</text></g>}
    {portalsOf(area).map(p=><circle key={p.to} cx={p.x} cy={p.z} r="2.2" fill="#bf99ff"><title>{CITIES[p.to].name}</title></circle>)}
    <text x={lim-4} y={-lim-2} fill="#eee" fontSize="2.2">N ↑</text>
    {points.map(p=><g key={p.id} onClick={()=>setPoint(p.index)} style={{cursor:'pointer'}}><title>{`${p.index+1}. ${p.name} Lv.${p.level} (${p.position.join(', ')})`}</title><circle cx={p.position[0]} cy={p.position[1]} r={p.index===point?2:1.6} fill={p.boss?'#dca94f':p.elite?'#be84e8':'#a7483f'} stroke={p.index===point?'#fff':'#edc8a0'} strokeWidth=".25"/><text x={p.position[0]} y={p.position[1]+.65} textAnchor="middle" fontSize="1.8" fill="#fff">{p.index+1}</text></g>)}
   </svg>
   <p className="atlas-legend">แดง: ทั่วไป · ม่วง: Elite · ทอง: Boss · วงกลาง: เขตปลอดภัย · ◆ Waygate</p>
  </div><div className="atlas-detail" aria-live="polite"><span>จุดเกิด {selected.index+1} / {points.length}</span><h3>{selected.name}</h3><p>Lv. {selected.level} · {selected.boss?'BOSS':selected.elite?'ELITE':'NORMAL'}</p><p>พิกัด X {selected.position[0]} / Z {selected.position[1]}<br/>เกิดใหม่ {selected.respawnSeconds===300?'5 นาที':'8 วินาที'} หลังถูกกำจัด</p><p>{c.dungeon?`ทางเข้า: ${CITIES[c.entrance!].name}`:`เมืองหลัก: ${CITIES[region].name}`}</p><p>จุดเกิดคงที่ มอนสเตอร์จะเคลื่อนที่ระหว่างต่อสู้และกลับมาเกิดที่จุดเดิม</p><button className="action-button" disabled={online} onClick={()=>useGameStore.getState().travel(area)}>{level<(c.levels?.[0]??1)?'เดินทาง · อันตราย (เลเวลสูงกว่า)':'เดินทางไปพื้นที่นี้'}</button></div></div>
  <div className="atlas-points" aria-label="เลือกจุดเกิด">{points.map(p=><button key={p.id} aria-pressed={point===p.index} onClick={()=>setPoint(p.index)}><strong>{p.index+1}. {p.name}</strong><small>Lv.{p.level} · {p.boss?'Boss':p.elite?'Elite':'ทั่วไป'} · ({p.position.join(', ')})</small></button>)}</div>
  <p className="journal-note">เมืองหลักมีจุดฝึกบริเวณรอบนอก โดยวง Sanctuary กลางเมืองปลอดภัย · การเดินทางทิ้งไอเทมบนพื้นและสร้างมอนสเตอร์ในพื้นที่ใหม่ · แผนที่นี้ใช้กับ Local</p>
 </section>;
}
