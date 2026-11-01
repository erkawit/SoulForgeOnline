'use client';
// Cash Shop + coupons + top-up partners (round 12). Fashion only — nothing sold for money changes stats.
// Flow: choose a piece → payment method (PromptPay, TrueMoney, Razer Gold, card, or a partner shop) → /api/cash/order
// creates a pending order → the provider's webhook marks it paid → the piece arrives by in-game mail → wardrobe (U).
import '@/styles/soulforge-beta.css';
import { useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';
import { FASHION, FASHION_SLOT_TH, mergeFashion, type FashionItem } from '@/game/fashion';

type Partner = { id: string; slug: string; name: string; logo_url: string | null };
type Promo = { id: string; partner_id: string; title: string; body: string; image_url: string | null; topup_steps: string };
const METHODS = [['promptpay', 'PromptPay QR'], ['truemoney', 'TrueMoney Wallet'], ['razergold', 'Razer Gold'], ['card', 'บัตรเครดิต/เดบิต'], ['partner', 'ร้านพาร์ทเนอร์']] as const;

export default function CashShop() {
  const sb = getSupabaseBrowser();
  const [list, setList] = useState<FashionItem[]>(FASHION), [partners, setPartners] = useState<Partner[]>([]), [promos, setPromos] = useState<Promo[]>([]);
  const [pick, setPick] = useState<string>(''), [method, setMethod] = useState<string>('promptpay'), [partner, setPartner] = useState(''), [msg, setMsg] = useState(''), [code, setCode] = useState('');
  useEffect(() => {
    void fetch('/api/fashion').then(r => r.json()).then(j => setList(mergeFashion(j.items))).catch(() => {});
    const q = new URLSearchParams(location.search).get('item'); if (q) setPick(q);
    if (sb) { void sb.from('partners').select('id,slug,name,logo_url').eq('status', 'approved').then(({ data }) => setPartners((data ?? []) as Partner[]));
      void sb.from('partner_promos').select('id,partner_id,title,body,image_url,topup_steps').then(({ data }) => setPromos((data ?? []) as Promo[])); }
  }, [sb]);
  async function token() { return (await sb?.auth.getSession())?.data.session?.access_token ?? null; }
  async function buy() {
    const t = await token(); if (!t) { setMsg('กรุณาเข้าสู่ระบบที่หน้าเล่นเกมก่อน'); return; }
    const r = await fetch('/api/cash/order', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${t}` }, body: JSON.stringify({ item: pick, method, partner: method === 'partner' ? partner : null }) });
    const j = await r.json(); setMsg(j.error ?? j.message);
  }
  async function redeem() {
    const t = await token(); if (!t) { setMsg('กรุณาเข้าสู่ระบบที่หน้าเล่นเกมก่อน'); return; }
    const r = await fetch('/api/coupon', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${t}` }, body: JSON.stringify({ code }) });
    const j = await r.json(); setMsg(j.error ?? j.message);
  }
  const sel = list.find(f => f.id === pick), forSale = list.filter(f => f.active && f.priceTHB != null);
  return <main className="sf-page" style={{ maxWidth: 880, margin: '0 auto', padding: '24px 16px' }}>
    <h1>Cash Shop</h1>
    <p>ของในร้านนี้เป็นแฟชั่นทั้งหมด ไม่มีค่าสเตตัส ไอเทมจะเข้าจดหมายในเกมเมื่อระบบชำระเงินยืนยันแล้ว แล้วสวมได้ที่ตู้เสื้อผ้า (ปุ่ม U)</p>
    <section className="npc-list">{forSale.map(f => <label key={f.id} className="npc-row" style={{ cursor: 'pointer' }}>
      <input type="radio" name="item" checked={pick === f.id} onChange={() => setPick(f.id)} />
      <span>{f.th}<br /><small>{FASHION_SLOT_TH[f.slot]} · {f.description}</small></span><b>฿{f.priceTHB}</b></label>)}</section>
    <h2>วิธีชำระเงิน</h2>
    <div className="npc-chips">{METHODS.map(([id, th]) => <button key={id} className={method === id ? 'on' : ''} aria-pressed={method === id} onClick={() => setMethod(id)}>{th}</button>)}</div>
    {method === 'partner' && <div className="npc-list">{partners.length === 0 ? <p>ยังไม่มีร้านพาร์ทเนอร์ที่เปิดให้บริการ</p> : partners.map(p => <div key={p.id} className="npc-row">
      <label><input type="radio" name="partner" checked={partner === p.slug} onChange={() => setPartner(p.slug)} /> <b>{p.name}</b></label>
      {promos.filter(x => x.partner_id === p.id).map(x => <div key={x.id}><b>{x.title}</b><p>{x.body}</p>{x.topup_steps && <pre style={{ whiteSpace: 'pre-wrap' }}>{x.topup_steps}</pre>}</div>)}</div>)}</div>}
    <p><button className="sf-btn" disabled={!sel} onClick={() => void buy()}>สั่งซื้อ {sel ? `${sel.th} ฿${sel.priceTHB}` : ''}</button></p>
    <h2>ใช้คูปอง</h2>
    <p><input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="เช่น SFWELCOME" maxLength={20} /> <button className="sf-btn ghost" onClick={() => void redeem()}>ใช้คูปอง</button></p>
    {msg && <p role="status" className="npc-result">{msg}</p>}
    <p><small>ร้านค้าที่ต้องการเป็นพาร์ทเนอร์เติมเกม: เข้าสู่ระบบแล้วสมัครที่ <a href="/partner">/partner</a></small></p>
  </main>;
}
