'use client';
// The wardrobe (ตู้เสื้อผ้า, round 12): six fashion slots — outfit, weapon skin, wings, cape, head, other. Fashion has no
// stats. Owned pieces come from the Cash Shop (paid in baht; the realm grants them after the payment provider confirms —
// never from a client request) or SoulGod items. The catalog is the built-in list merged with the back office's
// fashion_items rows (mergeFashion), so new pieces appear without a patch.
import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { FASHION_SLOTS, FASHION_SLOT_TH, mergeFashion, FASHION, type FashionItem } from '@/game/fashion';

function useCatalog() {
  const [list, setList] = useState<FashionItem[]>(FASHION);
  useEffect(() => { let off = false; fetch('/api/fashion').then(r => r.ok ? r.json() : null).then(j => { if (!off && j) setList(mergeFashion(j.items)); }).catch(() => {}); return () => { off = true; }; }, []);
  return list;
}
const price = (f: FashionItem) => f.priceTHB != null ? `฿${f.priceTHB.toLocaleString()}` : f.priceSG != null ? `${f.priceSG.toLocaleString()} SG` : '—';

export default function WardrobePanel() {
  const w = useGameStore(s => s.wardrobe), wear = useGameStore(s => s.wearFashion), off = useGameStore(s => s.takeOffFashion);
  const list = useCatalog(), by = Object.fromEntries(list.map(f => [f.id, f]));
  const [tab, setTab] = useState<'wardrobe' | 'shop'>('wardrobe'), [msg, setMsg] = useState<string | null>(null);
  return <div className="wardrobe">
    <div className="npc-chips" role="tablist">{(['wardrobe', 'shop'] as const).map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'wardrobe' ? 'ตู้เสื้อผ้า' : 'Cash Shop'}</button>)}</div>
    {msg && <p className="npc-result" role="status">{msg}</p>}
    {tab === 'wardrobe' ? <>
      <div className="npc-list">{FASHION_SLOTS.map(sl => { const id = w.worn[sl], f = id ? by[id] : undefined;
        return <div className="npc-row" key={sl}><span>{FASHION_SLOT_TH[sl]}<br /><small>{f ? f.th : 'ว่าง'}</small></span>{f && <button className="action-button ghost" onClick={() => off(sl)}>ถอด</button>}</div>; })}</div>
      <p className="npc-note">ของที่มี ({w.owned.length})</p>
      <div className="npc-list">{w.owned.length === 0 ? <p className="npc-note">ยังไม่มีชุดแฟชั่น — ดูได้ที่แท็บ Cash Shop</p> : w.owned.map(id => { const f = by[id]; if (!f) return null; const on = w.worn[f.slot] === id;
        return <div className="npc-row" key={id}><span>{f.th}<br /><small>{FASHION_SLOT_TH[f.slot]} · ไม่มีค่าสเตตัส</small></span>
          <button className="action-button ghost" disabled={on} onClick={() => setMsg(wear(id) ?? `สวม ${f.th} แล้ว`)}>{on ? 'สวมอยู่' : 'สวม'}</button></div>; })}</div>
    </> : <>
      <div className="npc-list">{list.filter(f => f.active).map(f => <div className="npc-row" key={f.id}><span>{f.tag && <em className="tag">{f.tag}</em>} {f.th}<br /><small>{FASHION_SLOT_TH[f.slot]} · {f.description ?? ''}</small></span><b>{price(f)}</b>
        {w.owned.includes(f.id) ? <small>มีแล้ว</small> : <a className="action-button ghost" href={`/shop/cash?item=${encodeURIComponent(f.id)}`}>ซื้อ</a>}</div>)}</div>
      <p className="npc-note">ชำระผ่าน PromptPay / TrueMoney / Razer Gold / บัตร หรือร้านพาร์ทเนอร์ — ไอเทมเข้าตู้เสื้อผ้าเมื่อระบบชำระเงินยืนยันแล้วเท่านั้น</p>
    </>}
  </div>;
}
