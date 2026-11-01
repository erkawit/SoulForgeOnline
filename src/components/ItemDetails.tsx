'use client';
import { ForgeArt } from './ForgeArt';
import {useGameConfirm} from './GameConfirm';
import {useState,useRef,useEffect,type ReactNode} from 'react';
import type {Item} from '@/lib/types';
import {RARITY_COLOR} from '@/lib/types';
import {ITEM_BY_ID,ITEM_ICONS,npcPrice} from '@/game/items';
import {useGameStore} from '@/store/useGameStore';
import {ATTRIBUTE_LABEL,SPECIAL_LABEL} from '@/game/balance/config';
import {enhanceMultiplier} from '@/game/balance/enhance';
import {optionRange,rollQuality,qualityLabel,compareDerived,formatDelta} from '@/game/ui/itemInfo';
import {TIER_OF} from '@/game/ui/layout';
import {derivedOf} from '@/store/useGameStore';
/** true while Alt is held (layer 2 of the tooltip) */
function useAlt(){const [alt,setAlt]=useState(false);useEffect(()=>{const d=(e:KeyboardEvent)=>{if(e.key==='Alt'){e.preventDefault();setAlt(true);}},u=(e:KeyboardEvent)=>{if(e.key==='Alt')setAlt(false);},b=()=>setAlt(false);addEventListener('keydown',d);addEventListener('keyup',u);addEventListener('blur',b);return()=>{removeEventListener('keydown',d);removeEventListener('keyup',u);removeEventListener('blur',b);};},[]);return alt;}
/** "if you wear this" rows against whatever is in that slot now */
function Compare({item}:{item:Item}){
 const s=useGameStore.getState();if(!item.slot||item.slot==='costume'||!s.inventory.some(x=>x?.id===item.id))return null;
 const worn=s.equipment[item.slot],before=derivedOf(s),after=derivedOf({...s,equipment:{...s.equipment,[item.slot]:item}}),rows=compareDerived(before,after);
 return <div className="cmp"><div className="cmp-h">ถ้าสวมแทน {worn?<b style={{color:RARITY_COLOR[worn.rarity]}}>{worn.name}</b>:'ช่องว่าง'}</div>{rows.length?rows.map(r=><div key={r.key} className={`line ${r.delta>0?'up':'down'}`}><span>{r.label}</span><b>{formatDelta(r)}</b></div>):<div className="line"><span>ค่าไม่เปลี่ยน</span><b>—</b></div>}</div>;
}
const CRYSTAL_COLOR:Record<string,string>={Legendary:'#e35a64',God:'#ffd36e','Pre-arch':'#fb9446',Arch:'#c58aef'};
export function ItemArt({item}:{item:Item}){if(item.definitionId?.startsWith('soul-stone-')||item.definitionId?.startsWith('potion-')||item.definitionId==='material-ore')return <ForgeArt id={item.definitionId} name={item.name}/>;const d=ITEM_BY_ID[item.definitionId??''];
 // round-2 items have no atlas sheet: costume shows its sprite, crystals glow in their tier colour, ore / food get glyphs
 if(d?.atlas==='materials'){const g=useGameStore.getState().player.gender==='f'?'f':'m';
  if(item.slot==='costume')return <span role="img" aria-label={item.name} className="atlas-icon r2-icon" style={{backgroundImage:`url(/art/sprites/costume-thai-${g}.webp)`,backgroundSize:'contain',backgroundRepeat:'no-repeat',backgroundPosition:'center'}}/>;
  const glyph=item.definitionId==='codex-seal'?'✦':item.family==='crystal'?'◆':item.definitionId?.startsWith('food')?'🍲':'⛏';
  return <span role="img" aria-label={item.name} className="atlas-icon fallback r2-icon" style={{color:item.family==='crystal'?CRYSTAL_COLOR[item.rarity]:'#9fd8cf',textShadow:`0 0 10px ${item.family==='crystal'?CRYSTAL_COLOR[item.rarity]:'#62d7cb'}`}}>{glyph}</span>;}
// monster loot: one 6 × 4 sheet (round 11)
 if(ITEM_ICONS.has(item.definitionId??''))return <span role="img" aria-label={item.name} className="atlas-icon" style={{backgroundImage:`url(/art/icons/items/${item.definitionId}.webp)`,backgroundSize:'contain',backgroundRepeat:'no-repeat',backgroundPosition:'center'}}/>;
 if(d?.atlas==='arms')return <span role="img" aria-label={item.name} className="atlas-icon" style={{backgroundImage:'url(/art/items-arms.webp)',backgroundSize:'1000% 800%',backgroundPosition:`${d.column/9*100}% ${d.row/7*100}%`}}/>;
 if(d?.atlas==='loot')return <span role="img" aria-label={item.name} className="atlas-icon" style={{backgroundImage:'url(/art/items-loot.webp)',backgroundSize:'600% 400%',backgroundPosition:`${d.column/5*100}% ${d.row/3*100}%`}}/>;
 return d?<span role="img" aria-label={item.name} className="atlas-icon" style={{backgroundImage:`url(/art/items-${d.atlas}.png)`,backgroundSize:`${d.columns*100}% 800%`,backgroundPosition:`${d.column/(d.columns-1)*100}% ${d.row/7*100}%`}}/>:<span className="atlas-icon fallback">{item.slot==='weapon'?'⚔':'◆'}</span>;}
export default function ItemDetails({item,children,inventory=false}:{item:Item;children:ReactNode;inventory?:boolean}){
 const {confirm,dialog}=useGameConfirm();
 const [open,setOpen]=useState(false),[pinned,setPinned]=useState(false),[deep,setDeep]=useState(false);const alt=useAlt(),detail=alt||deep;const timer=useRef<ReturnType<typeof setTimeout>|null>(null);const start=useRef<[number,number]>([0,0]);const touch=useRef(false);
 const clear=()=>{if(timer.current)clearTimeout(timer.current);};
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{if(!open)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setOpen(false);setPinned(false);}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[open]);
 const sell=async()=>{if(await confirm(`ขาย ${item.name} ให้ NPC จริงหรือไม่?\nได้รับเพียง ${npcPrice(item).toLocaleString()} SoulGod\nการขายนี้นำไอเทมออกจากกระเป๋า`)){useGameStore.getState().sellNPC(item.id,true);setOpen(false);setPinned(false);}};
 return <span className="item-detail-host" onPointerEnter={e=>{if(e.pointerType==='mouse')setOpen(true);}} onMouseLeave={()=>{if(!pinned)setOpen(false);}} onFocus={()=>{if(!touch.current)setOpen(true);}} onBlur={e=>{if(!pinned&&!e.currentTarget.contains(e.relatedTarget))setOpen(false);}} onPointerDown={e=>{touch.current=e.pointerType==='touch';start.current=[e.clientX,e.clientY];clear();timer.current=setTimeout(()=>{setOpen(true);setPinned(true);if(e.pointerType==='touch')setDeep(true);},e.pointerType==='touch'?3000:450);}} onPointerMove={e=>{if(Math.hypot(e.clientX-start.current[0],e.clientY-start.current[1])>10)clear();}} onPointerUp={clear} onPointerCancel={clear} onContextMenu={e=>e.preventDefault()}>
 <span onClick={()=>{if(!touch.current){setPinned(true);setOpen(true);}}}>{children}</span>
 {open&&<aside onPointerDown={e=>e.stopPropagation()} onClick={e=>e.stopPropagation()} className="item-tooltip" aria-label={`${item.name} details`}><button className="detail-close" aria-label="Close item details" onClick={e=>{e.stopPropagation();setPinned(false);setOpen(false);setDeep(false);}}>×</button><ItemArt item={item}/><h3 style={{color:RARITY_COLOR[item.rarity]}}>{item.name}</h3><p>{TIER_OF[item.rarity]?.code} · {item.rarity} · {item.slot??'Material / treasure'}{item.enhance?` · +${item.enhance}`:''}{item.qty?` · ×${item.qty}`:''}</p>{item.classLock&&<p className="item-class-lock">เฉพาะอาชีพ {item.classLock}</p>}<p>{item.description}</p><ul>{(['atk','def'] as const).filter(k=>item.bonuses[k]).map(k=><li key={k}>{k.toUpperCase()} +{Math.round((item.bonuses[k]??0)*enhanceMultiplier(item.enhance??0))}</li>)}{(item.options??[]).map((o,i)=>{const [lo,hi]=optionRange(item.rarity,o),q=rollQuality(item.rarity,o),u=o.kind==='attr'?'':'%';return <li key={i} style={{color:o.kind==='special'?'#ffd36e':'#7fd69a'}}>{o.kind==='attr'?`${ATTRIBUTE_LABEL[o.stat]} +${o.value}`:`${SPECIAL_LABEL[o.stat]} +${o.value}%`}{detail&&<div className="rng"><span>{TIER_OF[item.rarity]?.code} · ช่วง {lo}{u}–{hi}{u} · {qualityLabel(q)}</span><i><b style={{width:`${Math.round(q*100)}%`}}/></i></div>}</li>;})}</ul>
 {inventory&&<Compare item={item}/>}{(item.options??[]).length>0&&!detail&&<div className="hint2">กด <kbd>Alt</kbd> ค้าง หรือแตะค้าง เพื่อดูช่วงค่าออปชัน</div>}<small>NPC: {npcPrice(item).toLocaleString()} SoulGod · ซื้อขายตลาดได้</small>{inventory&&<div className="detail-actions"><button onClick={()=>{const s=useGameStore.getState(),i=s.inventory.findIndex(x=>x?.id===item.id);if(i>=0){if(item.family==='consumable')s.useItem(i);else s.equip(i);}setOpen(false);}} disabled={!item.slot&&item.family!=='consumable'}>{item.family==='consumable'?'ใช้':'สวมใส่'}</button><button onClick={sell}>ขาย NPC…</button></div>}</aside>}
 {dialog}</span>;
}
