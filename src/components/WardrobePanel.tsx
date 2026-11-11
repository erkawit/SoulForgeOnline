'use client';
// The wardrobe (ตู้เสื้อผ้า, round 12 · try-on stage round 17): six fashion slots — outfit, weapon skin, wings, cape, head,
// other. Fashion has no stats. Owned pieces come from the Cash Shop (paid in baht; the realm grants them after the payment
// provider confirms — never from a client request) or SoulGod items. The catalog is the built-in list merged with the back
// office's fashion_items rows (mergeFashion), so new pieces appear without a patch.
//
// Round 17: the left side is a try-on stage (FashionPreview) with the hero as the field draws it. Clicking any card —
// owned or in the shop — puts it on the stage only; "สวม" wears an owned piece for real, "ซื้อ" opens the Cash Shop.
import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { usePlayerStatic } from '@/store/usePlayerStatic';
import { FASHION_SLOTS, FASHION_SLOT_TH, FASHION_SLOT_ICON, fashionIcon, mergeFashion, FASHION, type FashionItem, type FashionSlot, type Wardrobe } from '@/game/fashion';
import FashionPreview from './FashionPreview';

export function useFashionCatalog() {
  const [list, setList] = useState<FashionItem[]>(FASHION);
  useEffect(() => { let off = false; fetch('/api/fashion').then(r => r.ok ? r.json() : null).then(j => { if (!off && j) setList(mergeFashion(j.items)); }).catch(() => {}); return () => { off = true; }; }, []);
  return list;
}
export const fashionPrice = (f: FashionItem) => f.priceTHB != null ? `฿${f.priceTHB.toLocaleString()}` : f.priceSG != null ? `${f.priceSG.toLocaleString()} SG` : '—';

/** one card: icon, name, slot and a status line */
export function FashionCard({ f, g, on, status, onClick }: { f: FashionItem; g: 'm' | 'f'; on: boolean; status: React.ReactNode; onClick: () => void }) {
  const icon = fashionIcon(f, g);
  return <button type="button" className={`fw-card${on ? ' on' : ''}`} onClick={onClick} aria-pressed={on} title={f.description ?? f.th}>
    <span className="fw-ico">{icon ? <img src={icon} alt="" loading="lazy" /> : <i aria-hidden>{FASHION_SLOT_ICON[f.slot]}</i>}{f.tag && <em className="fw-tag">{f.tag}</em>}</span>
    <b>{f.th}</b><small>{FASHION_SLOT_TH[f.slot]}</small><span className="fw-status">{status}</span>
  </button>;
}

type Tab = 'wardrobe' | 'shop';
export default function WardrobePanel() {
  const w = useGameStore(s => s.wardrobe), wear = useGameStore(s => s.wearFashion), takeOff = useGameStore(s => s.takeOffFashion);
  const player = usePlayerStatic(), weapon = useGameStore(s => s.equipment.weapon);
  const list = useFashionCatalog(), by = useMemo(() => Object.fromEntries(list.map(f => [f.id, f])) as Record<string, FashionItem>, [list]);
  const g: 'm' | 'f' = player.gender === 'f' ? 'f' : 'm';
  const [tab, setTab] = useState<Tab>('wardrobe'), [slot, setSlot] = useState<FashionSlot | 'all'>('all'), [msg, setMsg] = useState<string | null>(null);
  // the stage: what is worn, with tried-on pieces swapped in (null = tried "nothing" in that slot)
  const [trial, setTrial] = useState<Partial<Record<FashionSlot, string | null>>>({}), [sel, setSel] = useState<string | null>(null);
  const stage: Wardrobe = useMemo(() => {
    const worn: Wardrobe['worn'] = { ...w.worn };
    for (const [k, v] of Object.entries(trial) as [FashionSlot, string | null][]) { if (v) worn[k] = v; else delete worn[k]; }
    return { owned: w.owned, worn };
  }, [w, trial]);
  const trying = (Object.keys(trial) as FashionSlot[]).some(k => (trial[k] ?? undefined) !== w.worn[k]);
  const pick = (f: FashionItem) => { setSel(f.id); setMsg(null); setTrial(t => ({ ...t, [f.slot]: stage.worn[f.slot] === f.id ? null : f.id })); };
  const items = (tab === 'wardrobe' ? w.owned.map(id => by[id]).filter(Boolean) : list.filter(f => f.active && (f.priceTHB != null || f.priceSG != null)))
    .filter(f => slot === 'all' || f.slot === slot);
  const cur = sel ? by[sel] : undefined, owned = cur ? w.owned.includes(cur.id) : false, worn = cur ? w.worn[cur.slot] === cur.id : false;
  return <div className="fw">
    <section className="fw-left">
      <FashionPreview look={{ job: player.classId ?? 'Berserker', gender: g, promotion: player.promotionId, hair: player.hair, hairColor: player.hairColor, weapon, wardrobe: stage, catalog: list }} />
      <ul className="fw-worn" aria-label="ที่สวมบนเวที">{FASHION_SLOTS.map(s => { const id = stage.worn[s], f = id ? by[id] : undefined, icon = f && fashionIcon(f, g);
        return <li key={s} className={f ? 'has' : ''} title={`${FASHION_SLOT_TH[s]}: ${f ? f.th : 'ว่าง'}`}>{icon ? <img src={icon} alt="" /> : <i aria-hidden>{FASHION_SLOT_ICON[s]}</i>}</li>; })}</ul>
      <p className="fw-hint">{trying ? 'กำลังลองชุด — ตัวละครในเกมยังไม่เปลี่ยนจนกว่าจะกด "สวม"' : 'คลิกไอเทมเพื่อลองบนตัวละคร · ลากหรือกดลูกศรเพื่อหมุน'}</p>
      {trying && <button type="button" className="action-button ghost" onClick={() => setTrial({})}>เลิกลอง · กลับชุดที่สวมอยู่</button>}
    </section>
    <section className="fw-right">
      <div className="npc-chips" role="tablist">{(['wardrobe', 'shop'] as const).map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t === 'wardrobe' ? `ตู้เสื้อผ้า (${w.owned.length})` : 'Cash Shop'}</button>)}</div>
      <div className="fw-slots" role="group" aria-label="หมวด">{(['all', ...FASHION_SLOTS] as const).map(s => <button type="button" key={s} className={slot === s ? 'on' : ''} onClick={() => setSlot(s)}>{s === 'all' ? 'ทั้งหมด' : FASHION_SLOT_TH[s]}</button>)}</div>
      <div className="fw-grid">{items.length === 0
        ? <p className="npc-note">{tab === 'wardrobe' ? 'ยังไม่มีชุดแฟชั่นในหมวดนี้ — ดูและลองชุดได้ที่แท็บ Cash Shop' : 'ยังไม่มีสินค้าในหมวดนี้'}</p>
        : items.map(f => <FashionCard key={f.id} f={f} g={g} on={stage.worn[f.slot] === f.id} onClick={() => pick(f)}
            status={w.worn[f.slot] === f.id ? <em className="ok">สวมอยู่</em> : w.owned.includes(f.id) ? <em>มีแล้ว</em> : <b>{fashionPrice(f)}</b>} />)}</div>
      {cur && <div className="fw-detail">
        <div><b>{cur.th}</b> <small>{FASHION_SLOT_TH[cur.slot]} · ไม่มีค่าสเตตัส</small>{cur.description && <p>{cur.description}</p>}</div>
        <div className="fw-actions">
          {owned ? (worn ? <button type="button" className="action-button ghost" onClick={() => { takeOff(cur.slot); setTrial(t => { const n = { ...t }; delete n[cur.slot]; return n; }); setMsg(`ถอด ${cur.th} แล้ว`); }}>ถอด</button>
            : <button type="button" className="action-button" onClick={() => { const e = wear(cur.id); setMsg(e ?? `สวม ${cur.th} แล้ว`); if (!e) setTrial(t => { const n = { ...t }; delete n[cur.slot]; return n; }); }}>สวม</button>)
            : cur.priceTHB != null ? <a className="action-button" href={`/shop/cash?item=${encodeURIComponent(cur.id)}`}>ซื้อ {fashionPrice(cur)}</a>
            : <span className="npc-note">ซื้อด้วย {fashionPrice(cur)} ที่ร้าน SoulGod</span>}
        </div>
      </div>}
      {msg && <p className="npc-result" role="status">{msg}</p>}
      {tab === 'shop' && <p className="npc-note">ชำระผ่าน PromptPay / TrueMoney / Razer Gold / บัตร หรือร้านพาร์ทเนอร์ — ไอเทมเข้าตู้เสื้อผ้าเมื่อระบบชำระเงินยืนยันแล้วเท่านั้น</p>}
    </section>
  </div>;
}
