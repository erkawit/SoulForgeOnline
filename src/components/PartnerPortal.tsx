'use client';
// Top-up partner portal (round 12): a shop applies (status pending → the admin approves and sets the revenue share),
// then posts promotions and top-up instructions. Every promotion waits for admin approval before players see it.
import '@/styles/soulforge-beta.css';
import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase';

type Partner = { id: string; slug: string; name: string; status: string; revenue_share: number };
type Promo = { id: string; partner_id: string; title: string; body: string; topup_steps: string; approved: boolean };
export default function PartnerPortal() {
  const sb = getSupabaseBrowser(); const [session, setSession] = useState<Session | null>(null);
  const [mine, setMine] = useState<Partner[]>([]), [promos, setPromos] = useState<Promo[]>([]), [msg, setMsg] = useState('');
  const [f, setF] = useState({ slug: '', name: '', contact: '' }), [p, setP] = useState({ title: '', body: '', steps: '' });
  useEffect(() => { if (!sb) return; void sb.auth.getSession().then(({ data }) => setSession(data.session)); }, [sb]);
  const load = useCallback(async () => { if (!sb || !session) return; const { data } = await sb.from('partners').select('id,slug,name,status,revenue_share').eq('owner_id', session.user.id); setMine((data ?? []) as Partner[]);
    const ids = (data ?? []).map(x => x.id); if (ids.length) { const r = await sb.from('partner_promos').select('id,partner_id,title,body,topup_steps,approved').in('partner_id', ids); setPromos((r.data ?? []) as Promo[]); } }, [sb, session]);
  useEffect(() => { void load(); }, [load]);
  if (!sb) return <main className="sf-page"><p>ยังไม่ได้ตั้งค่า Supabase</p></main>;
  if (!session) return <main className="sf-page" style={{ padding: 24 }}><h1>พาร์ทเนอร์เติมเกม</h1><p>กรุณาเข้าสู่ระบบที่หน้า <a href="/play">เล่นเกม</a> ก่อน แล้วกลับมาที่หน้านี้</p></main>;
  async function apply() { const { error } = await sb!.rpc('partner_apply', { p_slug: f.slug, p_name: f.name, p_contact: f.contact }); setMsg(error ? error.message : 'ส่งใบสมัครแล้ว รอแอดมินอนุมัติ'); void load(); }
  async function post(pid: string) { const { error } = await sb!.from('partner_promos').insert({ partner_id: pid, title: p.title, body: p.body, topup_steps: p.steps }); setMsg(error ? error.message : 'ส่งโปรโมชันแล้ว รอแอดมินอนุมัติ'); void load(); }
  return <main className="sf-page" style={{ maxWidth: 820, margin: '0 auto', padding: '24px 16px' }}>
    <h1>พาร์ทเนอร์เติมเกม</h1>
    {mine.map(m => <section key={m.id} className="npc-list"><h2>{m.name} <small>({m.slug}) · {m.status === 'approved' ? `อนุมัติแล้ว · ส่วนแบ่ง ${(m.revenue_share * 100).toFixed(1)}%` : m.status === 'pending' ? 'รออนุมัติ' : 'ระงับ'}</small></h2>
      {promos.filter(x => x.partner_id === m.id).map(x => <div key={x.id} className="npc-row"><span><b>{x.title}</b><br /><small>{x.approved ? 'แสดงอยู่' : 'รออนุมัติ'}</small></span></div>)}
      {m.status === 'approved' && <div><input placeholder="หัวข้อโปรโมชัน" value={p.title} onChange={e => setP({ ...p, title: e.target.value })} /><br />
        <textarea placeholder="รายละเอียด" value={p.body} onChange={e => setP({ ...p, body: e.target.value })} /><br />
        <textarea placeholder="ขั้นตอนการเติม" value={p.steps} onChange={e => setP({ ...p, steps: e.target.value })} /><br />
        <button className="sf-btn" onClick={() => void post(m.id)}>ส่งโปรโมชัน</button></div>}</section>)}
    <h2>สมัครเป็นร้านพาร์ทเนอร์</h2>
    <p><input placeholder="รหัสร้าน (a-z 0-9 -)" value={f.slug} onChange={e => setF({ ...f, slug: e.target.value.toLowerCase() })} /> <input placeholder="ชื่อร้าน" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /> <input placeholder="ช่องทางติดต่อ" value={f.contact} onChange={e => setF({ ...f, contact: e.target.value })} /> <button className="sf-btn" onClick={() => void apply()}>สมัคร</button></p>
    {msg && <p role="status">{msg}</p>}
  </main>;
}
