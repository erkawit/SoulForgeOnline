'use client';
// Round 12 back-office tabs: coupons (with the invite-code shortcut beside it), fashion catalog, top-up partners,
// cash orders, and operations (maintenance switch, backup download, patches with rollback).
import { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';
import { FASHION_SLOTS, FASHION_SLOT_TH } from '@/game/fashion';
import { GAME_VERSION, PATCHES } from '@/game/patches';
import { Section } from './fields';

type Say = (m: string) => void;
const db = () => getSupabaseBrowser()!;
function download(name: string, text: string, type = 'application/json') { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href); }

// ---------------------------------------------------------------- coupons
type Coupon = { code: string; batch: string; reward: Record<string, unknown>; max_uses: number; used_count: number; expires_at: string | null; active: boolean };
export function Coupons({ say, toInvites }: { say: Say; toInvites: () => void }) {
  const [rows, setRows] = useState<Coupon[]>([]), [fresh, setFresh] = useState<string[]>([]);
  const [f, setF] = useState({ count: 10, len: 8, prefix: 'SF', code: '', gold: 1000, fashion: '', items: 'hp-potion:10', maxUses: 1, expires: '', batch: 'event' });
  const load = useCallback(async () => { const { data } = await db().from('coupons').select('*').order('created_at', { ascending: false }).limit(2000); setRows((data ?? []) as Coupon[]); }, []);
  useEffect(() => { void load(); }, [load]);
  async function create() {
    const items = f.items.split(',').map(s => s.trim()).filter(Boolean).map(s => { const [d, q] = s.split(':'); return { definitionId: d, qty: Number(q) || 1 }; });
    const reward = { gold: f.gold, ...(f.fashion ? { fashion: f.fashion } : {}), items };
    const { data, error } = await db().rpc('admin_create_coupons', { p_count: f.count, p_len: f.len, p_prefix: f.prefix, p_reward: reward, p_max_uses: f.maxUses, p_expires: f.expires ? new Date(f.expires).toISOString() : null, p_batch: f.batch, p_code: f.code || null });
    if (error) { say(error.message); return; } setFresh((data ?? []) as string[]); say(`สร้างคูปอง ${(data ?? []).length} โค้ด`); void load();
  }
  async function toggle(c: Coupon) { const { error } = await db().rpc('admin_set_coupon', { p_code: c.code, p_active: !c.active }); if (error) say(error.message); else void load(); }
  const n = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: typeof f[k] === 'number' ? Number(e.target.value) : e.target.value });
  return <>
    <Section title="สร้างคูปอง" hint="สร้างได้เฉพาะแอดมิน · โค้ดสั้น ตัวอักษร+ตัวเลข (ไม่มี I O 0 1) · ของรางวัลส่งเข้าจดหมายในเกม · บัญชีละ 1 ครั้งต่อโค้ด">
      <div className="ad-inline">
        <label className="ad-num"><span>จำนวน</span><span className="ad-num-input"><input type="number" min={1} max={5000} value={f.count} onChange={n('count')} /></span></label>
        <label className="ad-num"><span>ความยาว</span><span className="ad-num-input"><input type="number" min={4} max={12} value={f.len} onChange={n('len')} /></span></label>
        <label className="ad-num"><span>คำนำหน้า</span><span className="ad-num-input"><input value={f.prefix} onChange={n('prefix')} /></span></label>
        <label className="ad-num"><span>หรือโค้ดเดียวกำหนดเอง</span><span className="ad-num-input"><input value={f.code} placeholder="เช่น SFWELCOME" onChange={n('code')} /></span></label>
        <label className="ad-num"><span>ใช้ได้กี่ครั้ง/โค้ด</span><span className="ad-num-input"><input type="number" min={1} value={f.maxUses} onChange={n('maxUses')} /></span></label>
      </div>
      <div className="ad-inline">
        <label className="ad-num"><span>SoulGod</span><span className="ad-num-input"><input type="number" min={0} value={f.gold} onChange={n('gold')} /></span></label>
        <label className="ad-num"><span>ไอเทม (id:จำนวน, …)</span><span className="ad-num-input"><input value={f.items} onChange={n('items')} /></span></label>
        <label className="ad-num"><span>แฟชั่น (id)</span><span className="ad-num-input"><input value={f.fashion} onChange={n('fashion')} /></span></label>
        <label className="ad-num"><span>หมดอายุ</span><span className="ad-num-input"><input type="datetime-local" value={f.expires} onChange={n('expires')} /></span></label>
        <label className="ad-num"><span>ชื่อชุด</span><span className="ad-num-input"><input value={f.batch} onChange={n('batch')} /></span></label>
        <button className="sf-btn small" onClick={() => void create()}>สร้างคูปอง</button>
        <button className="sf-btn ghost small" onClick={toInvites}>สร้างโค้ดเชิญ (Invite) →</button>
      </div>
      {fresh.length > 0 && <div className="ad-fresh"><pre>{fresh.join('\n')}</pre><button className="sf-btn ghost small" onClick={() => download('coupons.txt', fresh.join('\n'), 'text/plain')}>ดาวน์โหลด</button></div>}
    </Section>
    <Section title={`คูปองทั้งหมด (${rows.length})`}>
      <div className="ad-scroll"><table className="ad-table"><thead><tr><th>โค้ด</th><th>ชุด</th><th>รางวัล</th><th className="num">ใช้</th><th>หมดอายุ</th><th /></tr></thead>
        <tbody>{rows.slice(0, 500).map(c => <tr key={c.code}><td className="mono">{c.code}</td><td>{c.batch}</td><td><small>{JSON.stringify(c.reward)}</small></td><td className="num">{c.used_count}/{c.max_uses}</td>
          <td>{c.expires_at ? new Date(c.expires_at).toLocaleDateString('th-TH') : '—'}</td><td><button className="ad-link" onClick={() => void toggle(c)}>{c.active ? 'ปิดโค้ด' : 'เปิดโค้ด'}</button></td></tr>)}</tbody></table></div>
    </Section>
  </>;
}

// ---------------------------------------------------------------- fashion catalog
type FRow = { id: string; slot: string; name: string; th: string; description: string | null; price_thb: number | null; price_sg: number | null; sprite: string | null; art: unknown; active: boolean; tag: string | null; sort: number };
export function Fashion({ say }: { say: Say }) {
  const [rows, setRows] = useState<FRow[]>([]); const blank = { id: '', slot: 'outfit', name: '', th: '', description: '', priceTHB: '', priceSG: '', sprite: '', art: '', tag: '', active: true, sort: 100 };
  const [f, setF] = useState(blank);
  const load = useCallback(async () => { const { data } = await db().from('fashion_items').select('*').order('sort'); setRows((data ?? []) as FRow[]); }, []);
  useEffect(() => { void load(); }, [load]);
  async function save() { const { error } = await db().rpc('admin_upsert_fashion', { p_row: { ...f, art: f.art ? f.art : null } }); if (error) say(error.message); else { say(`บันทึก ${f.id}`); setF(blank); void load(); } }
  const edit = (r: FRow) => setF({ id: r.id, slot: r.slot, name: r.name, th: r.th, description: r.description ?? '', priceTHB: r.price_thb?.toString() ?? '', priceSG: r.price_sg?.toString() ?? '', sprite: r.sprite ?? '', art: typeof r.art === 'string' ? r.art : '', tag: r.tag ?? '', active: r.active, sort: r.sort });
  const t = (k: keyof typeof blank) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return <>
    <Section title="เพิ่ม / แก้ไขชุดแฟชั่น" hint="ไม่มีค่าสเตตัส · ชุด (outfit) ใช้ sprite ตัวละครทั้งตัว · ช่องอื่นเป็นภาพซ้อน (art = path ใน /art เช่น fashion/wings-x.webp) · เพิ่มได้โดยไม่ต้องออกแพตช์">
      <div className="ad-inline">
        <label className="ad-num"><span>id</span><span className="ad-num-input"><input value={f.id} onChange={t('id')} /></span></label>
        <label className="ad-num"><span>ช่อง</span><span className="ad-num-input"><select value={f.slot} onChange={t('slot')}>{FASHION_SLOTS.map(s => <option key={s} value={s}>{FASHION_SLOT_TH[s]}</option>)}</select></span></label>
        <label className="ad-num"><span>ชื่อ (EN)</span><span className="ad-num-input"><input value={f.name} onChange={t('name')} /></span></label>
        <label className="ad-num"><span>ชื่อ (TH)</span><span className="ad-num-input"><input value={f.th} onChange={t('th')} /></span></label>
        <label className="ad-num"><span>ราคา ฿</span><span className="ad-num-input"><input value={f.priceTHB} onChange={t('priceTHB')} /></span></label>
        <label className="ad-num"><span>ราคา SG</span><span className="ad-num-input"><input value={f.priceSG} onChange={t('priceSG')} /></span></label>
      </div>
      <div className="ad-inline">
        <label className="ad-num"><span>sprite (ชุด)</span><span className="ad-num-input"><input value={f.sprite} onChange={t('sprite')} /></span></label>
        <label className="ad-num"><span>art (ภาพซ้อน)</span><span className="ad-num-input"><input value={f.art} onChange={t('art')} /></span></label>
        <label className="ad-num"><span>ป้าย</span><span className="ad-num-input"><input value={f.tag} onChange={t('tag')} /></span></label>
        <label className="ad-num"><span>คำอธิบาย</span><span className="ad-num-input"><input value={f.description} onChange={t('description')} /></span></label>
        <label><input type="checkbox" checked={f.active} onChange={e => setF({ ...f, active: e.target.checked })} /> วางขาย</label>
        <button className="sf-btn small" onClick={() => void save()} disabled={!/^[a-z0-9-]{3,48}$/.test(f.id) || !f.name}>บันทึก</button>
      </div>
    </Section>
    <Section title="แคตตาล็อก"><table className="ad-table"><thead><tr><th>id</th><th>ช่อง</th><th>ชื่อ</th><th className="num">฿</th><th className="num">SG</th><th>สถานะ</th><th /></tr></thead>
      <tbody>{rows.map(r => <tr key={r.id}><td className="mono">{r.id}</td><td>{FASHION_SLOT_TH[r.slot as never]}</td><td>{r.th}</td><td className="num">{r.price_thb ?? '—'}</td><td className="num">{r.price_sg ?? '—'}</td><td>{r.active ? 'ขายอยู่' : 'ซ่อน'}</td><td><button className="ad-link" onClick={() => edit(r)}>แก้ไข</button></td></tr>)}</tbody></table></Section>
  </>;
}

// ---------------------------------------------------------------- partners + orders
type P = { id: string; slug: string; name: string; contact: string; status: string; revenue_share: number };
type Pr = { id: string; partner_id: string; title: string; body: string; approved: boolean };
type O = { id: string; user_id: string; item_id: string; amount_thb: number; method: string; partner_id: string | null; status: string; created_at: string };
export function Partners({ say }: { say: Say }) {
  const [rows, setRows] = useState<P[]>([]), [promos, setPromos] = useState<Pr[]>([]), [orders, setOrders] = useState<O[]>([]);
  const load = useCallback(async () => {
    const [a, b, c] = await Promise.all([db().from('partners').select('*').order('created_at'), db().from('partner_promos').select('id,partner_id,title,body,approved').order('created_at', { ascending: false }), db().from('cash_orders').select('*').order('created_at', { ascending: false }).limit(500)]);
    setRows((a.data ?? []) as P[]); setPromos((b.data ?? []) as Pr[]); setOrders((c.data ?? []) as O[]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function set(p: P, status: string, share?: number) { const { error } = await db().rpc('admin_set_partner', { p_id: p.id, p_status: status, p_share: share ?? null }); if (error) say(error.message); else void load(); }
  async function promo(x: Pr, ok: boolean) { const { error } = await db().rpc('admin_approve_promo', { p_id: x.id, p_ok: ok }); if (error) say(error.message); else void load(); }
  const paid = orders.filter(o => o.status === 'paid'), byPartner = (id: string) => paid.filter(o => o.partner_id === id).reduce((s, o) => s + o.amount_thb, 0);
  return <>
    <Section title="ร้านพาร์ทเนอร์เติมเกม" hint="อนุมัติร้าน ตั้งส่วนแบ่งรายได้ (0–50%) · ยอดขายนับเฉพาะคำสั่งซื้อที่ชำระแล้ว">
      <table className="ad-table"><thead><tr><th>ร้าน</th><th>ติดต่อ</th><th>สถานะ</th><th className="num">ส่วนแบ่ง</th><th className="num">ยอดขาย ฿</th><th /></tr></thead>
        <tbody>{rows.map(p => <tr key={p.id}><td>{p.name} <small className="mono">{p.slug}</small></td><td>{p.contact}</td><td>{p.status}</td>
          <td className="num"><input type="number" step={0.5} min={0} max={50} defaultValue={p.revenue_share * 100} style={{ width: 60 }} onBlur={e => void set(p, p.status, Number(e.target.value) / 100)} />%</td>
          <td className="num">{byPartner(p.id).toLocaleString()}</td>
          <td>{p.status !== 'approved' && <button className="ad-link" onClick={() => void set(p, 'approved')}>อนุมัติ</button>} {p.status !== 'suspended' && <button className="ad-link" onClick={() => void set(p, 'suspended')}>ระงับ</button>}</td></tr>)}</tbody></table>
    </Section>
    <Section title="โปรโมชันจากพาร์ทเนอร์"><table className="ad-table"><tbody>{promos.map(x => <tr key={x.id}><td>{rows.find(p => p.id === x.partner_id)?.name}</td><td><b>{x.title}</b><br /><small>{x.body.slice(0, 160)}</small></td><td>{x.approved ? 'แสดงอยู่' : 'รออนุมัติ'}</td>
      <td><button className="ad-link" onClick={() => void promo(x, !x.approved)}>{x.approved ? 'ซ่อน' : 'อนุมัติ'}</button></td></tr>)}</tbody></table></Section>
    <Section title={`คำสั่งซื้อ Cash Shop (${orders.length}) · ชำระแล้ว ฿${paid.reduce((s, o) => s + o.amount_thb, 0).toLocaleString()}`}>
      <div className="ad-scroll"><table className="ad-table"><thead><tr><th>เวลา</th><th>ไอเทม</th><th className="num">฿</th><th>ช่องทาง</th><th>สถานะ</th></tr></thead>
        <tbody>{orders.map(o => <tr key={o.id}><td>{new Date(o.created_at).toLocaleString('th-TH')}</td><td className="mono">{o.item_id}</td><td className="num">{o.amount_thb}</td><td>{o.method}</td><td>{o.status}</td></tr>)}</tbody></table></div>
    </Section>
  </>;
}

// ---------------------------------------------------------------- operations
type Patch = { version: string; title: string; status: string; min_client: string; published_at: string | null };
export function Ops({ say }: { say: Say }) {
  const [ops, setOps] = useState({ loginOpen: true, message: '', minClient: GAME_VERSION }), [patches, setPatches] = useState<Patch[]>([]);
  const cur = PATCHES.find(p => p.version === GAME_VERSION);
  const [np, setNp] = useState({ version: GAME_VERSION, title: cur?.title ?? '', notes: (cur?.notes ?? []).join('\n'), minClient: GAME_VERSION });
  const load = useCallback(async () => {
    const { data } = await db().from('game_config').select('value').eq('key', 'ops').maybeSingle(); if (data?.value) setOps(o => ({ ...o, ...(data.value as object) }));
    const r = await db().from('patches').select('version,title,status,min_client,published_at').order('created_at', { ascending: false }); setPatches((r.data ?? []) as Patch[]);
  }, []);
  useEffect(() => { void load(); }, [load]);
  async function saveOps(next: typeof ops) { const { error } = await db().rpc('admin_set_config', { p_key: 'ops', p_value: next }); if (error) say(error.message); else { setOps(next); say(next.loginOpen ? 'เปิดให้เข้าเกมแล้ว' : 'ปิดการเข้าเกมแล้ว (แอดมินยังเข้าได้) — ผู้เล่นที่ออนไลน์จะถูกตัดภายใน 1 นาที'); } }
  async function backup() { const { data, error } = await db().rpc('admin_backup'); if (error) { say(error.message); return; } download(`soulforge-backup-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`, JSON.stringify(data)); say('ดาวน์โหลดไฟล์สำรองแล้ว'); }
  async function publish() { const { error } = await db().rpc('admin_publish_patch', { p_version: np.version, p_title: np.title, p_notes: np.notes.split('\n').filter(Boolean), p_min_client: np.minClient }); if (error) say(error.message); else { say(`เผยแพร่แพตช์ ${np.version}`); void load(); } }
  async function rollback(v: string) { if (!confirm(`ย้อนค่าเกมกลับไปก่อนแพตช์ ${v}?`)) return; const { error } = await db().rpc('admin_rollback_patch', { p_version: v }); if (error) say(error.message); else { say(`ย้อนแพตช์ ${v} แล้ว`); void load(); } }
  return <>
    <Section title="เปิด / ปิดการเข้าเกม (ปิดปรับปรุง)" hint="ปิดแล้วผู้เล่นทั่วไปเข้าเกมไม่ได้และคนที่ออนไลน์จะถูกตัดออก (เซฟก่อนตัด) · แอดมินยังเข้าได้เพื่อทดสอบ">
      <div className="ad-inline"><b className={ops.loginOpen ? 'ad-good' : 'ad-bad'}>{ops.loginOpen ? '● เปิดให้เข้าเกม' : '● ปิดปรับปรุงอยู่'}</b>
        <label className="ad-num"><span>ข้อความถึงผู้เล่น</span><span className="ad-num-input"><input value={ops.message} onChange={e => setOps({ ...ops, message: e.target.value })} /></span></label>
        <button className="sf-btn small" onClick={() => void saveOps({ ...ops, loginOpen: !ops.loginOpen })}>{ops.loginOpen ? 'ปิดการเข้าเกม' : 'เปิดการเข้าเกม'}</button></div>
    </Section>
    <Section title="สำรองฐานข้อมูล" hint="ดาวน์โหลด JSON ของค่าเกม ตัวละคร แฟชั่น คูปอง พาร์ทเนอร์ แพตช์ และจดหมายที่ยังไม่รับ · การสำรองเต็มรูปแบบรายวันให้เปิด Point-in-time / Daily backups ใน Supabase">
      <button className="sf-btn small" onClick={() => void backup()}>ดาวน์โหลดไฟล์สำรองตอนนี้</button>
    </Section>
    <Section title="แพตช์" hint={`ไคลเอนต์รุ่นนี้ ${GAME_VERSION} · เผยแพร่แพตช์จะเก็บสำเนาค่าเกมปัจจุบันไว้ ย้อนกลับได้ · minClient = รุ่นต่ำสุดที่เข้าเกมได้ (ตรวจความเข้ากันได้)`}>
      <div className="ad-inline">
        <label className="ad-num"><span>เวอร์ชัน</span><span className="ad-num-input"><input value={np.version} onChange={e => setNp({ ...np, version: e.target.value })} /></span></label>
        <label className="ad-num"><span>ชื่อแพตช์</span><span className="ad-num-input"><input value={np.title} onChange={e => setNp({ ...np, title: e.target.value })} /></span></label>
        <label className="ad-num"><span>รุ่นไคลเอนต์ต่ำสุด</span><span className="ad-num-input"><input value={np.minClient} onChange={e => setNp({ ...np, minClient: e.target.value })} /></span></label>
      </div>
      <textarea style={{ width: '100%', minHeight: 120 }} value={np.notes} onChange={e => setNp({ ...np, notes: e.target.value })} aria-label="บันทึกแพตช์ (บรรทัดละรายการ)" />
      <button className="sf-btn small" onClick={() => void publish()} disabled={!/^\d+\.\d+\.\d+$/.test(np.version)}>เผยแพร่แพตช์</button>
      <table className="ad-table"><thead><tr><th>เวอร์ชัน</th><th>ชื่อ</th><th>รุ่นต่ำสุด</th><th>สถานะ</th><th /></tr></thead>
        <tbody>{patches.map(p => <tr key={p.version}><td className="mono">{p.version}</td><td>{p.title}</td><td className="mono">{p.min_client}</td><td>{p.status}</td><td>{p.status === 'live' && <button className="ad-link" onClick={() => void rollback(p.version)}>ย้อนกลับ</button>}</td></tr>)}</tbody></table>
    </Section>
  </>;
}
