'use client';
// PCInventoryPanel (I) — 12 spec slots + costume around a stone portrait, 10×10 bag with item footprints and
// pointer drag & drop (move in the grid, drop on a slot to equip, drag worn gear back to unequip).
// MobileInventoryDrawer — the same data as a bottom sheet: equipment strip + 5-column list, tap = select,
// double-tap = equip / use, ≥ 48 px touch targets.
import { useMemo, useRef, useState } from 'react';
import ItemDetails, { ItemArt } from '../ItemDetails';
import { useGameStore, derivedOf } from '@/store/useGameStore';
import { usePlayerStatic } from '@/store/usePlayerStatic';
import { canEquip } from '@/game/items';
import { EQUIP_LAYOUT, type SlotInfo } from '@/game/ui/equipSlots';
import { GRID_W, GRID_H, layoutBag, fits, firstFit, moveItem, freeCells, itemSize } from '@/game/ui/bagGrid';
import { TIER_OF, tierColor } from '@/game/ui/layout';
import type { GearSlot, Item } from '@/lib/types';
import { CLASS_COLOR, CLASS_TH, fmt, portrait } from './common';
import { setSelectedItem } from './selection';
import type { ClassId } from '@/game/content';

const ok = (it: Item, cls: ClassId) => !it.slot || ((!it.classLock || it.classLock === cls) && canEquip(it, cls));
function Tier({ it }: { it: Item }) { const t = TIER_OF[it.rarity]; return t ? <b className={`tb ${t.code === 'T8' ? 't8' : ''}`} style={{ ['--tc' as string]: t.color }}>{t.code}</b> : null; }
function useBag() {
  const inventory = useGameStore(s => s.inventory), bagPos = useGameStore(s => s.bagPos);
  const items = useMemo(() => inventory.filter((x): x is Item => !!x), [inventory]);
  const lay = useMemo(() => layoutBag(items, bagPos), [items, bagPos]);
  return { inventory, items, bagPos, ...lay };
}
const act = (it: Item) => { const s = useGameStore.getState(), i = s.inventory.findIndex(x => x?.id === it.id); if (i < 0) { const slot = (Object.entries(s.equipment) as [GearSlot, Item | null][]).find(([, v]) => v?.id === it.id)?.[0]; if (slot) s.unequip(slot); return; } if (it.slot) s.equip(i); else s.useItem(i); };

export function PCInventoryPanel() {
  const equipment = useGameStore(s => s.equipment), player = usePlayerStatic(), buffs = useGameStore(s => s.buffs), skillLevels = useGameStore(s => s.skillLevels);
  const cls = (player.classId ?? 'Berserker') as ClassId, d = useMemo(() => derivedOf({ player, equipment, buffs, skillLevels }), [player, equipment, buffs, skillLevels]);
  const { items, placed, overflow, bagPos } = useBag(); const byId = new Map(items.map(i => [i.id, i]));
  const [category,setCategory]=useState('all'),[query,setQuery]=useState('');
  const matches=(it:Item)=>it.name.toLowerCase().includes(query.toLowerCase())&&(category==='all'||category==='weapon'&&it.slot==='weapon'||category==='armor'&&['armor','helmet','gloves','boots'].includes(it.slot??'')||category==='accessory'&&it.slot==='ring'||category==='consumable'&&it.family==='consumable'||category==='material'&&['material','crystal'].includes(it.family??''));
  const grid = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ id: string; from: 'bag' | 'slot'; x: number; y: number; ox: number; oy: number; moved: boolean } | null>(null);
  const [hl, setHl] = useState<{ x: number; y: number; w: number; h: number; ok: boolean } | null>(null), [over, setOver] = useState<{ gear: string; ok: boolean } | null>(null);
  const [sel, setSelLocal] = useState<string | null>(null); const setSel = (v: string | null) => { setSelLocal(v); setSelectedItem(v); }; const last = useRef({ id: '', t: 0 });
  const find = (id: string) => byId.get(id) ?? Object.values(equipment).find(x => x?.id === id) ?? null;
  const cell = () => (grid.current?.getBoundingClientRect().width ?? 640) / GRID_W;
  const target = (x: number, y: number, dr: NonNullable<typeof drag>) => {
    const it = find(dr.id); if (!it || !grid.current) return null; const r = grid.current.getBoundingClientRect(), c = cell();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) { const gx = Math.round((x - dr.ox - r.left) / c), gy = Math.round((y - dr.oy - r.top) / c); const others = layoutBag(items.filter(i => i.id !== it.id), bagPos).placed; return { kind: 'grid' as const, gx, gy, it, ok: fits(others, it, gx, gy) }; }
    const slot = (document.elementFromPoint(x, y) as HTMLElement | null)?.closest<HTMLElement>('[data-gear]'); if (slot) return { kind: 'slot' as const, gear: slot.dataset.gear!, it, ok: dr.from === 'bag' && it.slot === slot.dataset.gear && ok(it, cls) };
    return null;
  };
  const down = (e: React.PointerEvent, id: string, from: 'bag' | 'slot') => {
    if (e.button !== 0) return; e.preventDefault(); const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); let ox = e.clientX - r.left, oy = e.clientY - r.top;
    if (from === 'slot') { const it = find(id), sz = it ? itemSize(it) : { w: 1, h: 1 }, c = cell(); ox = Math.min(ox, c * sz.w / 2); oy = Math.min(oy, c * sz.h / 2); }
    const dr = { id, from, x: e.clientX, y: e.clientY, ox, oy, moved: false }; setDrag(dr); let cur = dr;
    const mv = (ev: PointerEvent) => { const moved = cur.moved || Math.abs(ev.clientX - dr.x) + Math.abs(ev.clientY - dr.y) > 5; cur = { ...cur, x: ev.clientX, y: ev.clientY, moved }; setDrag(cur); if (!moved) return;
      const t = target(ev.clientX, ev.clientY, cur); setHl(t?.kind === 'grid' ? { x: t.gx, y: t.gy, ...itemSize(t.it), ok: t.ok } : null); setOver(t?.kind === 'slot' ? { gear: t.gear, ok: t.ok } : null); };
    const up = (ev: PointerEvent) => {
      removeEventListener('pointermove', mv); removeEventListener('pointerup', up); setDrag(null); setHl(null); setOver(null);
      const it = find(id); if (!it) return; const s = useGameStore.getState();
      if (!cur.moved) { const t = performance.now(); if (last.current.id === id && t - last.current.t < 320) { act(it); setSel(null); } else { last.current = { id, t }; setSel(id); } return; }
      const t = target(ev.clientX, ev.clientY, cur); if (!t || !t.ok) return;
      if (t.kind === 'slot') { const i = s.inventory.findIndex(x => x?.id === id); if (i >= 0) s.equip(i); return; }
      if (from === 'slot') { s.unequip(it.slot as GearSlot); const others = layoutBag(items, bagPos).placed; const p = fits(others, it, t.gx, t.gy) ? { x: t.gx, y: t.gy } : firstFit(others, it); if (p) s.setBagPos({ ...bagPos, [id]: p }); return; }
      const next = moveItem(items, bagPos, id, t.gx, t.gy); if (next) s.setBagPos(next);
    };
    addEventListener('pointermove', mv); addEventListener('pointerup', up);
  };
  const slotEl = (si: SlotInfo, big = false) => {
    if (!si.gear) return <div key={si.id} className="eqs locked" title={`${si.th} · ${si.lockedNote ?? ''}`}><span className="lk">🔒</span><small>{si.th}</small></div>;
    const it = equipment[si.gear]; const o = over?.gear === si.gear ? (over.ok ? 'over' : 'bad') : '';
    if (!it) return <div key={si.id} className={`eqs empty ${o}`} data-gear={si.gear} title={`${si.th} (${si.en})`}><small>{si.th}</small></div>;
    return <div key={si.id} className={`eqs has ${o} ${sel === it.id ? 'selc' : ''}`} data-gear={si.gear} style={{ ['--tc' as string]: tierColor(it.rarity) }}>
      <ItemDetails item={it}><span className={`it ${drag?.id === it.id && drag.moved ? 'dragging' : ''}`} onPointerDown={e => down(e, it.id, 'slot')} onContextMenu={e => { e.preventDefault(); act(it); }}><ItemArt item={it} />{it.enhance ? <b className="e">+{it.enhance}</b> : null}<Tier it={it} /></span></ItemDetails>{big && <small>{si.th}</small>}</div>;
  };
  const dragged = drag?.moved ? find(drag.id) : null, c = cell();
  return <div className="h3 pcinv">
    <div className="eqdoll" style={{ ['--cc' as string]: CLASS_COLOR[cls] }}>
      <div className="eqcol">{EQUIP_LAYOUT.filter(x => x.side === 'left').map(x => slotEl(x))}</div>
      <div className="eqmid"><div className="eqtop">{slotEl(EQUIP_LAYOUT.find(x => x.side === 'top')!, true)}</div><div className="stone"><img src={portrait(cls, player.gender, 'full')} alt="" /></div>
        <div className="eqnm"><b>{player.name}</b><small>{CLASS_TH[cls]} · Lv.{player.level}</small></div>
        <div className="eqkv"><span>{d.damageKind === 'physical' ? 'ATK' : 'M.ATK'} <b>{fmt(d.attack)}</b></span><span>DEF <b>{fmt(d.defense)}</b></span><span>HP <b>{fmt(d.maxHp)}</b></span></div></div>
      <div className="eqcol">{EQUIP_LAYOUT.filter(x => x.side === 'right').map(x => slotEl(x))}</div>
    </div>
    <div className="bagside">
      <div className="baghead"><span>กระเป๋า {GRID_W}×{GRID_H}</span><span>ช่องว่าง <b>{freeCells(placed)}</b>/100 · {items.length}/24 ชิ้น</span><span className="sg">SoulGod <b>{fmt(player.gold)}</b></span></div>
      <div className="forge-bag-tools"><select aria-label="หมวดไอเทม" value={category} onChange={e=>setCategory(e.target.value)}>{[['all','ทั้งหมด'],['weapon','อาวุธ'],['armor','ชุดเกราะ'],['accessory','เครื่องประดับ'],['consumable','ของใช้'],['material','วัตถุดิบ']].map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><input aria-label="ค้นหาไอเทม" placeholder="ค้นหาไอเทม…" value={query} onChange={e=>setQuery(e.target.value)}/><button className="sf-btn ghost" onClick={()=>{setCategory('all');setQuery('');}}>ล้างตัวกรอง</button></div>
      <div className="bgrid" ref={grid} style={{ ['--gw' as string]: GRID_W, ['--gh' as string]: GRID_H }}>
        {placed.filter(p=>matches(byId.get(p.id)!)).map(p => { const it = byId.get(p.id)!; return <div key={p.id} className={`gi ${ok(it, cls) ? '' : 'cant'} ${sel === it.id ? 'selc' : ''} ${it.rarity === 'Arch' ? 't8' : ''} ${drag?.id === it.id && drag.moved ? 'dragging' : ''}`}
          style={{ ['--x' as string]: p.x, ['--y' as string]: p.y, ['--w' as string]: p.w, ['--h' as string]: p.h, ['--tc' as string]: tierColor(it.rarity) }} onPointerDown={e => down(e, it.id, 'bag')} onContextMenu={e => { e.preventDefault(); act(it); }}>
          <ItemDetails item={it} inventory><span className="gart"><ItemArt item={it} /></span></ItemDetails>{it.qty && it.qty > 1 ? <b className="q">{it.qty}</b> : null}{it.enhance ? <b className="e">+{it.enhance}</b> : null}{it.classLock && it.classLock !== cls ? <b className="lock">🔒</b> : null}<Tier it={it} /></div>; })}
        {hl && <div className={`ghl ${hl.ok ? '' : 'bad'}`} style={{ ['--x' as string]: hl.x, ['--y' as string]: hl.y, ['--w' as string]: hl.w, ['--h' as string]: hl.h }} />}
      </div>
      {overflow.length > 0 && <div className="overflow">ล้นตาราง {overflow.length} ชิ้น — จัดช่องให้ว่างแล้วจะลงตารางเอง</div>}
      <div className="pact hint">ชี้เมาส์ / แตะค้าง 3 วินาทีเพื่อดูรายละเอียด · ลากเพื่อจัดช่อง · ลากไปช่องอุปกรณ์เพื่อสวม · ลากของที่สวมกลับลงตารางเพื่อถอด · ดับเบิลคลิก / คลิกขวา = สวม / ใช้</div>
    </div>
    {dragged && drag && <div className={`dragghost ${dragged.rarity === 'Arch' ? 't8' : ''}`} style={{ width: itemSize(dragged).w * c, height: itemSize(dragged).h * c, transform: `translate(${drag.x - drag.ox}px, ${drag.y - drag.oy}px)`, ['--tc' as string]: tierColor(dragged.rarity) }}><ItemArt item={dragged} /></div>}
  </div>;
}

export function MobileInventoryDrawer() {
  const equipment = useGameStore(s => s.equipment), player = usePlayerStatic(), cls = (player.classId ?? 'Berserker') as ClassId;
  const { items } = useBag(); const [sel, setSelLocal] = useState<string | null>(null); const setSel = (v: string | null) => { setSelLocal(v); setSelectedItem(v); }; const last = useRef({ id: '', t: 0 });
  const all = [...items, ...Object.values(equipment).filter((x): x is Item => !!x)], it = all.find(i => i.id === sel) ?? null, worn = !!it && !items.includes(it);
  const tap = (x: Item) => { const t = performance.now(); if (last.current.id === x.id && t - last.current.t < 350) { last.current = { id: '', t: 0 }; act(x); setSel(null); return; } last.current = { id: x.id, t }; setSel(x.id); };
  const label = it && (worn ? 'ถอด' : it.slot ? (it.slot === 'costume' ? 'สวมชุด' : 'สวมใส่') : it.family === 'consumable' ? 'ใช้' : '');
  return <div className="h3 minv">
    <div className="meq">{EQUIP_LAYOUT.map(si => { const e = si.gear ? equipment[si.gear] : null;
      return <button key={si.id} className={`mslot ${si.gear ? '' : 'locked'} ${e ? 'has' : ''} ${e && sel === e.id ? 'selc' : ''}`} style={{ ['--tc' as string]: e ? tierColor(e.rarity) : 'transparent' }} onClick={() => e && tap(e)} disabled={!si.gear}>{e ? <><ItemArt item={e} /><Tier it={e} /></> : si.gear ? null : '🔒'}<small>{si.th}</small></button>; })}</div>
    <div className="mbaghead"><span>กระเป๋า {items.length}/24</span><span>SoulGod <b>{fmt(player.gold)}</b></span></div>
    <div className="mgrid">{Array.from({ length: Math.max(25, Math.ceil(items.length / 5) * 5) }, (_, i) => { const x = items[i]; if (!x) return <div key={i} className="mcell empty" />;
      return <div role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')tap(x);}} key={x.id} className={`mcell ${ok(x, cls) ? '' : 'cant'} ${sel === x.id ? 'selc' : ''} ${x.rarity === 'Arch' ? 't8' : ''}`} data-tap style={{ ['--tc' as string]: tierColor(x.rarity) }} onClick={() => tap(x)}><ItemDetails item={x} inventory><ItemArt item={x} /></ItemDetails>{x.qty && x.qty > 1 ? <b className="q">{x.qty}</b> : null}{x.enhance ? <b className="e">+{x.enhance}</b> : null}<Tier it={x} /></div>; })}</div>
    {it ? <div className="mact"><div><b style={{ color: tierColor(it.rarity) }}>{it.enhance ? `+${it.enhance} ` : ''}{it.name}</b><small>{TIER_OF[it.rarity]?.code} · {it.rarity}{it.qty ? ` · ×${it.qty}` : ''}</small></div>
      {label && <button className="sf-btn" onClick={() => { act(it); setSel(null); }}>{label}</button>}<ItemDetails item={it} inventory={!worn}><span className="sf-btn ghost">ข้อมูล</span></ItemDetails></div>
      : <div className="mact hint">แตะเพื่อเลือก · แตะสองครั้งเพื่อสวม / ใช้</div>}
  </div>;
}
