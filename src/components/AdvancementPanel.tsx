'use client';
import {useState} from 'react';
import {PROMOTIONS,PROMOTION_IDS,canPromote,classLook} from '@/game/advancement';
import {CLASS_IDS,type ClassId} from '@/game/content';
import {useGameStore} from '@/store/useGameStore';
import {useMultiplayerStore} from '@/store/useMultiplayerStore';
import {stageUnlocked} from '@/game/quests';
export default function AdvancementPanel(){
 const player=useGameStore(s=>s.player),stage=useGameStore(s=>stageUnlocked(s.quests)),dead=useGameStore(s=>s.deadUntil),pending=useGameStore(s=>s.pending),online=useMultiplayerStore(s=>s.online);
 const base=player.classId??'Berserker',[view,setView]=useState<ClassId>(base),current=classLook(base,player.promotionId),safe=Math.hypot(...player.position)<6;
 return <section className="advancement-panel"><h2>Class advancement · {current.name} · Class {current.stage}</h2>
 <p>Lv.10 เลือกหนึ่งสาย → Lv.60 พัฒนาสายเดิม · ยังไม่เปิด Class 4</p>
 <p>เปลี่ยนคลาสที่วง Sanctuary เท่านั้น เมื่อเลือกสายแล้วจะเปลี่ยนข้ามสายหรืออาชีพหลักไม่ได้ในรุ่นนี้</p>
 <label>ดูแบบชุด <select value={view} onChange={e=>setView(e.target.value as ClassId)}>{CLASS_IDS.map(id=><option key={id}>{id}</option>)}</select></label>
 <div className="advancement-grid">{PROMOTION_IDS.filter(id=>PROMOTIONS[id].base===view).map(id=>{const p=PROMOTIONS[id],eligible=canPromote(base,player.level,player.promotionId,id,stage);return <article key={id}><h3>{id}</h3><b>Class {p.stage} · Lv.{p.level}</b><p>{p.role}</p><small>{p.previous?`${p.previous} → ${id}`:`${p.base} → ${id}`}</small><button className="action-button" disabled={!eligible||!safe||!!dead||!!pending} onClick={()=>useGameStore.getState().promote(id)}>{player.promotionId===id?'CURRENT CLASS':base!==view?'OTHER LINEAGE':player.level<p.level?`REQUIRES LV.${p.level}`:stage<p.stage?(p.stage===2?'ผ่านเควส ทางแยกแห่งสายเลือด ก่อน':'ผ่านเควส ยอดเขาแห่งปรมาจารย์ ก่อน'):!safe?'RETURN TO SANCTUARY':eligible?'ADVANCE CLASS':'PATH LOCKED'}</button></article>})}</div>
 <img className="study-image" src={`/art/${view.toLowerCase()}-advancement.png`} alt={`${view} Class 2 and Class 3 outfit concepts, two branches`} loading="lazy"/>
 <p className="journal-note">ภาพชุดเป็นคอนเซ็ปต์ โมเดลเล่นจริงใช้ชิ้นส่วน 3D แบบเรียบง่าย สี อาวุธ และรายละเอียดเปลี่ยนตามคลาส สกิลต้นแบบยังไม่ใช่ชุดสกิลเต็มที่ออกแบบไว้</p>
 </section>
}
