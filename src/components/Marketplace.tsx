'use client';
// The player market at Silas Vane (round 10). Everything here is run by the realm: the window only asks for pages
// (gameConnection.market) and sends market operations (authority ACT), then shows the realm's answer. Offline (guest
// play) the market is closed — there is nothing safe to trade with.
import {useEffect,useMemo,useState} from 'react';
import {useGameConfirm} from './GameConfirm';
import {useGameStore} from '@/store/useGameStore';
import {useMultiplayerStore} from '@/store/useMultiplayerStore';
import {gameConnection} from '@/lib/multiplayer/socket';
import {authority} from '@/store/authority';
import {useConfigStore} from '@/store/useConfigStore';
import {listingFee,marketFloor,saleSplit} from '@/game/balance/market';
import type {RarityKey} from '@/game/balance/config';
import {RARITIES} from '@/game/items';
import type {Listing} from '@/game/economy/market';
import ItemDetails,{ItemArt} from './ItemDetails';

type Tab='browse'|'sell'|'mine'|'mail';
const TABS:[Tab,string][]=[['browse','ตลาด'],['sell','ลงขาย'],['mine','รายการของฉัน'],['mail','จดหมาย']];
const MARKET_OPS=['marketList','marketBuy','marketCancel','mailClaim'];
const sg=(n:number)=>`${Math.round(n).toLocaleString()} SG`;
const pct=(r:number)=>`${+(r*100).toFixed(1)}%`;

export default function Marketplace(){
 const {confirm,dialog}=useGameConfirm();
 const online=useMultiplayerStore(n=>n.connected&&authority.online()),market=useMultiplayerStore(n=>n.market),mailCount=useMultiplayerStore(n=>n.mailCount),result=useMultiplayerStore(n=>n.actResult),me=useMultiplayerStore(n=>n.playerId);
 const gold=useGameStore(s=>s.player.gold),inventory=useGameStore(s=>s.inventory);
 const config=useConfigStore(c=>c.config);
 const [tab,setTab]=useState<Tab>('browse'),[text,setText]=useState(''),[rarity,setRarity]=useState(''),[page,setPage]=useState(0),[busy,setBusy]=useState<number|null>(null),[prices,setPrices]=useState<Record<string,string>>({});
 const tax=market?.tax||config.market.salesTaxPct;
 const load=(t:Tab=tab,p=page)=>{if(!online)return;if(t==='browse')gameConnection.market('browse',{text:text.trim()||undefined,rarity:rarity||undefined,page:p});else if(t==='mine')gameConnection.market('mine');else gameConnection.market('mail');};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(()=>{load();},[online,tab,page,rarity]);
 // the realm answered our operation: stop waiting and refresh what is on screen
 // eslint-disable-next-line react-hooks/exhaustive-deps
 useEffect(()=>{if(result&&busy!==null&&result.seq===busy){setBusy(null);load();}},[result]);
 const act=(op:'marketList'|'marketBuy'|'marketCancel'|'mailClaim',args:unknown[])=>{const seq=authority.send(op,args);if(seq)setBusy(seq);};
 const sellable=useMemo(()=>inventory.filter((i):i is NonNullable<typeof i>=>!!i),[inventory]);
 const lastMsg=result&&MARKET_OPS.includes(result.op)?result:null;

 if(!online)return <div><h3>ตลาดผู้เล่น · Silas Vane</h3><p className="npc-note">ตลาดผู้เล่นและจดหมายใช้ได้เมื่อเชื่อมต่อเซิร์ฟเวอร์เท่านั้น — ตัวละครออนไลน์ถูกบันทึกที่เซิร์ฟเวอร์ ทุกการซื้อขายจึงตรวจสอบได้และไม่มีของซ้ำหรือหาย</p></div>;
 const buy=async(l:Listing)=>{if(await confirm(`ซื้อ ${l.item.name}${l.qty>1?` ×${l.qty}`:''} จาก ${l.sellerName||'ผู้เล่น'}\nราคา ${sg(l.price)}`))act('marketBuy',[l.id]);};
 const list=async(id:string,name:string,rar:string,enh:number)=>{
  const price=Math.floor(Number(prices[id])),floor=marketFloor(rar as RarityKey,enh,null,config);if(!Number.isSafeInteger(price)||price<1)return;
  const fee=listingFee(price,config),get=saleSplit(price,config,tax).seller;
  if(await confirm(`ลงขาย ${name} ราคา ${sg(price)}\nค่าลงขาย ${sg(fee)} (จ่ายทันที ไม่คืนแม้ยกเลิก)\nขายได้แล้วรับ ${sg(get)} ทางจดหมาย (ภาษี ${pct(tax)})${price<floor?`\n⚠ ต่ำกว่าราคาขั้นต่ำ ${sg(floor)} — เซิร์ฟเวอร์จะไม่รับ`:''}`))act('marketList',[id,price]);};

 return <div>{dialog}
  <h3>ตลาดผู้เล่น · Silas Vane</h3>
  <p className="npc-note">มี {sg(gold)} · ภาษีการขายตอนนี้ {pct(tax)} · ค่าลงขาย {pct(config.market.listingFeePct)} (ขั้นต่ำ {sg(config.market.listingFeeMin)}) · ภาษีและค่าลงขายถูกเผาทิ้งเพื่อรักษามูลค่า SoulGod</p>
  <div className="npc-chips" role="tablist">{TABS.map(([t,l])=><button key={t} role="tab" className={tab===t?'on':''} aria-selected={tab===t} onClick={()=>{setTab(t);setPage(0);}}>{l}{t==='mail'&&mailCount?` (${mailCount})`:''}</button>)}</div>
  {lastMsg&&<p className={`npc-result ${lastMsg.ok?'ok':'bad'}`} role="status">{lastMsg.msg}</p>}
  {market?.error&&<p className="npc-result bad">{market.error}</p>}

  {tab==='browse'&&<>
   <div className="npc-actions"><input aria-label="ค้นหาไอเทม" placeholder="ชื่อไอเทม" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){setPage(0);load('browse',0);}}}/>
    <select aria-label="ระดับ" value={rarity} onChange={e=>{setRarity(e.target.value);setPage(0);}}><option value="">ทุกระดับ</option>{RARITIES.map(r=><option key={r} value={r}>{r}</option>)}</select>
    <button onClick={()=>{setPage(0);load('browse',0);}}>ค้นหา</button></div>
   <div className="npc-list">{(market?.view==='browse'?market.listings:[]).map(l=><div className="npc-row" key={l.id}>
    <ItemDetails item={l.item}><button className="catalog-card" aria-label={l.item.name}><ItemArt item={l.item}/></button></ItemDetails>
    <span><b>{l.item.name}{l.qty>1?` ×${l.qty}`:''}</b><small> · {l.rarity}{l.enhance?` · +${l.enhance}`:''} · {l.sellerName||'ผู้เล่น'}</small></span>
    {l.seller===me?<small>ของคุณ</small>:<button disabled={busy!==null||gold<l.price} onClick={()=>void buy(l)}>ซื้อ {sg(l.price)}</button>}</div>)}
    {market?.view==='browse'&&!market.listings.length&&<p className="npc-note">ยังไม่มีรายการที่ตรงกับการค้นหา</p>}</div>
   <div className="npc-actions"><button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))}>‹ ก่อนหน้า</button><small>หน้า {page+1}</small><button disabled={(market?.view==='browse'?market.listings.length:0)<40} onClick={()=>setPage(p=>p+1)}>ถัดไป ›</button></div>
  </>}

  {tab==='sell'&&<>
   <p className="npc-note">ลงขายทั้งช่อง (ทั้งกอง) · ของที่สวมอยู่ต้องถอดก่อน · ประกาศอยู่ {config.market.listingHours} ชม. แล้วของกลับมาทางจดหมาย · ยกเลิกได้ไม่เกิน {config.market.cancelsPerHour} ครั้งต่อชั่วโมง · ราคาขั้นต่ำอาจสูงกว่านี้ถ้ามีราคาซื้อขายจริงใน 7 วัน</p>
   <div className="npc-list">{sellable.map(i=>{const floor=marketFloor(i.rarity as RarityKey,i.enhance??0,null,config);return <div className="npc-row" key={i.id}>
    <ItemDetails item={i} inventory><button className="catalog-card" aria-label={i.name}><ItemArt item={i}/></button></ItemDetails>
    <span><b>{i.name}{(i.qty??1)>1?` ×${i.qty}`:''}</b><small> · ขั้นต่ำ {sg(floor)}</small></span>
    <input type="number" min={floor} step={1} aria-label={`ราคา ${i.name}`} style={{width:110}} placeholder={String(floor)} value={prices[i.id]??''} onChange={e=>setPrices(p=>({...p,[i.id]:e.target.value}))}/>
    <button disabled={busy!==null||!prices[i.id]} onClick={()=>void list(i.id,i.name,i.rarity,i.enhance??0)}>ลงขาย</button></div>;})}
    {!sellable.length&&<p className="npc-note">กระเป๋าว่าง</p>}</div>
  </>}

  {tab==='mine'&&<div className="npc-list">{(market?.view==='mine'?market.listings:[]).map(l=><div className="npc-row" key={l.id}>
    <ItemArt item={l.item}/><span><b>{l.item.name}{l.qty>1?` ×${l.qty}`:''}</b><small> · {sg(l.price)} · หมดเวลา {new Date(l.expiresAt).toLocaleString('th-TH',{dateStyle:'short',timeStyle:'short'})}</small></span>
    <button disabled={busy!==null} onClick={async()=>{if(await confirm(`ถอน ${l.item.name} ออกจากตลาด?\nค่าลงขาย ${sg(l.fee)} จะไม่ได้คืน`))act('marketCancel',[l.id]);}}>ถอน</button></div>)}
    {market?.view==='mine'&&!market.listings.length&&<p className="npc-note">ยังไม่มีของที่ลงขาย</p>}</div>}

  {tab==='mail'&&<>
   <div className="npc-list">{(market?.view==='mail'?market.mail:[]).map(m=><div className="npc-row" key={m.id}>{m.item?<ItemArt item={m.item}/>:<span aria-hidden>🪙</span>}<span><b>{m.item?m.item.name:sg(m.gold)}</b><small> · {m.note}</small></span></div>)}
    {market?.view==='mail'&&!market.mail.length&&<p className="npc-note">ไม่มีจดหมาย</p>}</div>
   <div className="npc-actions"><button disabled={busy!==null||!(market?.view==='mail'&&market.mail.length)} onClick={()=>act('mailClaim',[])}>รับทั้งหมด</button></div>
  </>}
 </div>;
}
