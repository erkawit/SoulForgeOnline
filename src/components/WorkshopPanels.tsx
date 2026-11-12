'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { useGameStore, countOf } from '@/store/useGameStore';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { SHOP_ITEMS } from '@/game/npcs';
import { FOOD_ITEMS } from '@/game/items';
import { POTION_RECIPES, SOUL_STONES } from '@/game/ui/forgeCatalog';
import { ForgeArt, MenuArt } from './ForgeArt';

const tabs = [ ['all', 'ทั้งหมด'], ['potions', 'ยาฟื้นพลัง'], ['materials', 'วัตถุดิบ'], ['food', 'เสบียง'] ];
function Quantity({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <div className="forge-quantity"><button aria-label="ลดจำนวน" disabled={value <= 1} onClick={() => onChange(value-1)}>−</button><input aria-label="จำนวน" type="number" min={1} max={99} value={value} onChange={e => onChange(Math.max(1, Math.min(99, Math.trunc(Number(e.target.value)) || 1)))} /><button aria-label="เพิ่มจำนวน" disabled={value >= 99} onClick={() => onChange(value+1)}>+</button></div>;
}
export function ShopPanel() {
  const s = useGameStore(), [tab, setTab] = useState('all'), [quantities, setQuantities] = useState<Record<string,number>>({}), [message, setMessage] = useState('');
  const serverResult = useMultiplayerStore(s => s.actResult);
  useEffect(() => { if (serverResult && ['buyShop','buyCatalog'].includes(serverResult.op)) setMessage(serverResult.msg); }, [serverResult]);
  const items = [
    ...SHOP_ITEMS.map(i => ({id:i.id,name:i.th,description:i.effect.hp ? `ฟื้น HP ${i.effect.hp}` : i.effect.hpPct ? `ฟื้น HP ${i.effect.hpPct}%` : i.effect.mp ? `ฟื้น MP ${i.effect.mp}` : i.effect.mpPct ? `ฟื้น MP ${i.effect.mpPct}%` : i.effect.revive ? 'ฟื้นคืนชีพ ณ จุดที่ล้ม (HP/MP 50%)' : 'กลับเมือง',price:i.price,category:'potions',shop:true})),
    ...SOUL_STONES.map(i => ({...i,description:'ใช้ 1 ก้อนต่อการตีบวก',category:'materials',shop:false})),
    ...FOOD_ITEMS.map(i => ({id:i.id,name:i.th,description:`บัฟ ${i.minutes} นาที`,price:i.price,category:'food',shop:false})),
  ].filter(i => tab === 'all' || i.category === tab);
  return <div className="forge-workshop"><div className="forge-title"><MenuArt name="shop"/><div><h2>SHOP <small>ร้านค้า</small></h2><p>เตรียมเสบียง ก่อนออกเดินทาง</p></div><b className="forge-wallet">◉ {s.player.gold.toLocaleString()} SG</b></div>
    <nav className="forge-tabs" aria-label="หมวดสินค้า">{tabs.map(([id,label]) => <button key={id} aria-pressed={tab===id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    <div className="forge-products">{items.map(i => { const qty=i.shop ? quantities[i.id]??1 : 1; return <article className="forge-card" key={i.id}><ForgeArt id={i.id} name={i.name}/><h3>{i.name}</h3><p>{i.description}</p><strong>◉ {(i.price*qty).toLocaleString()} SG</strong>{i.shop&&<Quantity value={qty} onChange={v=>setQuantities(q=>({...q,[i.id]:v}))}/>}<button className="forge-primary" disabled={s.player.gold<i.price*qty} onClick={()=>{const error=i.shop?s.buyShop(i.id,qty):s.buyCatalog(i.id);setMessage(error??(useMultiplayerStore.getState().online?'กำลังรอผลจากเซิร์ฟเวอร์…':`ซื้อ ${i.name} ×${qty} สำเร็จ`));}}>ซื้อ{qty>1?` ×${qty}`:''}</button></article>; })}</div>
    <p className="forge-feedback" role="status">{message || 'เลือกจำนวน แล้วกดซื้อ · ไอเทมจะส่งเข้ากระเป๋า'}</p></div>;
}
const categories = [ ['weapons','craft','อาวุธ'], ['armor','armor','ชุดเกราะ'], ['accessories','gem','เครื่องประดับ'], ['potions','alchemy','ปรุงยา'], ['materials','craft','วัตถุดิบ'], ['future','craft','การคราฟอื่น ๆ'] ];
export function CraftPanel({ gear }: { gear: (category: string) => ReactNode }) {
  const [category,setCategory]=useState('potions');
  return <div className="forge-workshop"><div className="forge-title"><MenuArt name="craft"/><div><h2>CRAFT <small>โรงคราฟ</small></h2><p>หลอมวัตถุดิบ สู่พลังครั้งใหม่</p></div></div><div className="forge-layout"><nav className="forge-sidebar" aria-label="หมวดการคราฟ">{categories.map(([id,icon,label])=><button key={id} aria-pressed={category===id} onClick={()=>setCategory(id)}><MenuArt name={icon}/>{label}</button>)}</nav><div className="forge-content">{category==='potions'?<AlchemyPanel/>:['materials','future'].includes(category)?<div className="forge-coming" role="status"><MenuArt name="craft"/><h3>รอการอัปเดตต่อไป</h3><p>การคราฟหมวดนี้จะเปิดให้ใช้งานในอนาคต</p></div>:gear(category)}</div></div></div>;
}
function AlchemyPanel() {
  const s=useGameStore(), [kind,setKind]=useState('hp'),[pick,setPick]=useState('potion-hp-s'),[qty,setQty]=useState(1),[message,setMessage]=useState('');
  const result=useMultiplayerStore(s=>s.actResult);
  useEffect(()=>{if(result?.op==='brewPotion')setMessage(result.msg);},[result]);
  const recipe=POTION_RECIPES.find(r=>r.id===pick)!, potion=SHOP_ITEMS.find(i=>i.id===pick)!;
  const canCraft=s.player.gold>=recipe.fee*qty&&recipe.materials.every(m=>countOf(s.inventory,m.id)>=m.qty*qty);
  return <><nav className="forge-tabs"><button aria-pressed={kind==='hp'} onClick={()=>{setKind('hp');setPick('potion-hp-s');}}>ยาฟื้น HP</button><button aria-pressed={kind==='mp'} onClick={()=>{setKind('mp');setPick('potion-mp-s');}}>ยาฟื้น MP</button></nav><div className="forge-products alchemy-products">{POTION_RECIPES.filter(r=>r.id.includes(`-${kind}-`)).map(r=><button className="forge-card" key={r.id} aria-pressed={pick===r.id} onClick={()=>{setPick(r.id);setMessage('');}}><ForgeArt id={r.id}/><h3>{SHOP_ITEMS.find(i=>i.id===r.id)?.th}</h3><small>เลือกสูตร</small></button>)}</div>
    <section className="forge-recipe"><div><h3>{potion.th}</h3><ForgeArt id={pick}/><Quantity value={qty} onChange={setQty}/></div><div><h4>วัตถุดิบที่ต้องใช้</h4><div className="forge-materials">{recipe.materials.map(m=>{const have=countOf(s.inventory,m.id);return <div className="forge-card" key={m.id}><ForgeArt id={m.id}/><small>{SHOP_ITEMS.find(i=>i.id===m.id)?.th??'แร่หลอมวิญญาณ'}</small><b className={have>=m.qty*qty?'forge-good':'forge-bad'}>{have} / {m.qty*qty}</b></div>;})}</div><p>ค่าปรุง ◉ {(recipe.fee*qty).toLocaleString()} SG · สำเร็จ 100%</p><button className="forge-primary" disabled={!canCraft} onClick={()=>setMessage(s.brewPotion(pick,qty).message)}>ปรุงยา ×{qty}</button></div><div><h4>ผลลัพธ์</h4><ForgeArt id={pick}/><p>{potion.th} ×{qty}</p></div></section><p className="forge-feedback" role="status">{message||(!canCraft?'SoulGod หรือวัตถุดิบไม่พอ':'พร้อมปรุงยา')}</p></>;
}
