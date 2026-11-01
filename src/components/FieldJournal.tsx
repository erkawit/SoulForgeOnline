'use client';
import {classLook} from '@/game/advancement';
import BestiaryPanel from './BestiaryPanel';
import HuntingMap from './HuntingMap';
import ExpansionJournal from './ExpansionJournal';
import AdvancementPanel from './AdvancementPanel';
import {useState,useEffect,useRef} from 'react';
import {CLASS_IDS,CLASSES,CITIES,TIER_COLORS,TIER_NAMES,type ClassId,type ActionId} from '@/game/content';
import {useGameStore} from '@/store/useGameStore';
import {useMultiplayerStore} from '@/store/useMultiplayerStore';
export default function FieldJournal(){
 const open=useGameStore(s=>s.journal),cls=useGameStore(s=>s.player.classId??'Warrior'),city=useGameStore(s=>s.player.cityId??'hollow');
 const promotion=useGameStore(s=>s.player.promotionId),activeDef=classLook(cls,promotion);
 const online=useMultiplayerStore(s=>s.online);
 const [tab,setTab]=useState<'classes'|'world'|'weapons'|'motion'|'expansion'|'bestiary'>('classes');
 const [viewClass,setViewClass]=useState<ClassId>(cls),[tier,setTier]=useState(0);
 const dialog=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!open)return;const previous=document.activeElement as HTMLElement|null;dialog.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')useGameStore.getState().setJournal(false);if(e.key==='Tab'){const nodes=Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled),select,a[href]')??[]);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};window.addEventListener('keydown',key);return()=>{window.removeEventListener('keydown',key);previous?.focus();};},[open]);
 if(!open)return null;
 const preview=(action:ActionId)=>{useGameStore.getState().preview(action);useGameStore.getState().setJournal(false);};
 return <div className="journal-backdrop"><div className="field-journal" role="dialog" aria-modal="true" aria-label="Field journal" tabIndex={-1} ref={dialog}>
  <header><div><span className="eyebrow">SOULFORGE · ECLIPSE FRONTIER</span><h1>Choose your path</h1><p>Five callings. Three sanctuaries. One fractured world.</p></div><button className="sf-close" aria-label="Close field journal" title="ปิด" onClick={()=>useGameStore.getState().setJournal(false)} /></header>
  <p className="journal-note"><a href="/characters" target="_blank" rel="noopener noreferrer">เปิดห้องดูโมเดล 3D · หมุนดู 5 อาชีพ / ทดลองแอนิเมชัน / ดาวน์โหลด GLB</a></p><nav aria-label="Journal sections">{(['classes','world','weapons','motion','expansion','bestiary'] as const).map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{t==='classes'?'CLASSES':t==='world'?'THREE CITIES':t==='weapons'?'ARMORY · 8 TIERS':t==='motion'?'MOTION STUDIES':t==='expansion'?'ITEMS / SKILLS / MARKET':'BESTIARY'}</button>)}</nav>
  {online&&<p className="journal-notice">Online realm uses the existing server rules. Class changes, travel and pose previews are available after disconnecting.</p>}
  <div className="journal-content">
  {tab==='expansion'&&<ExpansionJournal/>}
  {tab==='bestiary'&&<BestiaryPanel/>}
  {tab==='classes'&&<><AdvancementPanel/><div className="class-cards">{CLASS_IDS.map(id=><button key={id} className={cls===id?'chosen':''} disabled={online||!!promotion} aria-pressed={cls===id} onClick={()=>{useGameStore.getState().chooseClass(id);setViewClass(id);}}><img src={`/art/${id.toLowerCase()}-character.png`} alt={`${id} original character concept`} loading="lazy"/><div><h2>{id}</h2><p>{CLASSES[id].role}</p><small>{cls===id?'SELECTED':'CHOOSE CLASS'}</small></div></button>)}</div><div className="journal-detail"><h2>{activeDef.name} · {activeDef.skills.join(' / ')}</h2><p>{activeDef.special}</p><p>Space: attack skill · Q: self buff · E: special skill. Concept portraits guide the simplified articulated 3D characters in the world.</p><button className="action-button" onClick={()=>useGameStore.getState().setJournal(false)}>ENTER {CITIES[city].name.toUpperCase()}</button></div></>}
  {tab==='world'&&<HuntingMap/>}
  {(tab==='weapons'||tab==='motion')&&<><div className="journal-select"><label>Class <select value={viewClass} onChange={e=>setViewClass(e.target.value as ClassId)}>{CLASS_IDS.map(id=><option key={id}>{id}</option>)}</select></label>{tab==='weapons'&&<label>Tier <select value={tier} onChange={e=>setTier(Number(e.target.value))}>{TIER_NAMES.map((n,i)=><option key={n} value={i}>T{i+1} · {n}</option>)}</select></label>}</div>
   {tab==='weapons'?<><p style={{color:TIER_COLORS[tier]}}>T{tier+1} · {TIER_NAMES[tier]} · {CLASSES[viewClass].role}</p><p className="journal-note">แผ่นแบบอาวุธ 8 Tier — โมเดล GLB คลาสเริ่มต้นเปลี่ยนสีอัญมณีตาม Tier ส่วนรูปทรงอาวุธทั้ง 8 ระดับยังใช้ภาพแบบประกอบ พลังเฉพาะไอเทมในเอกสารออกแบบยังไม่ถูกเปิดใช้ทั้งหมด</p><img className="study-image" src={`/art/${viewClass.toLowerCase()}-tiers.png`} alt={`${viewClass} eight weapon tiers`}/></>:<><p className="journal-note">คีย์โพสอ้างอิง · เดิน / โจมตี / ตาย / สกิลโจมตี / บัฟ / สกิลเฉพาะ อาวุธต้องอยู่ในมือเดิมตลอดการเคลื่อนไหว</p><div className="pose-buttons">{(['walk','attack','death','skill','buff','special'] as ActionId[]).map(a=><button key={a} disabled={online||(!!promotion&&viewClass!==cls)} onClick={()=>{useGameStore.getState().chooseClass(viewClass);preview(a);}}>Preview {a}</button>)}</div><img className="study-image motion-study" src={`/art/${viewClass.toLowerCase()}-motion.png`} alt={`${viewClass} six movement studies with sequential key poses`}/></>}
  </>}
  </div>
  <footer><button className="action-button" onClick={()=>useGameStore.getState().setJournal(false)}>ENTER WORLD</button> &nbsp; WASD · Move &nbsp; Space / Q / E · Skills &nbsp; I · Inventory &nbsp; F · Forge &nbsp; J · Journal &nbsp; Escape · Close</footer>
 </div></div>;
}



