'use client';
// SoulForge game-master console: invite codes, players, every balance number, drop odds, enhancement, market, buffs, Skill Forge.
import '@/styles/soulforge-beta.css';
import { loginEmail } from '@/lib/loginName';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase';
import { ATTRIBUTES, ATTRIBUTE_LABEL, CLASS_KEYS, DEFAULT_CONFIG, RARITY_KEYS, SPECIAL_KEYS, SPECIAL_LABEL, mergeConfig, validateConfig, type ClassKey, type DropSource, type GameConfig } from '@/game/balance/config';
import { deriveCharacter, monsterStats } from '@/game/balance/stats';
import { dropOdds } from '@/game/balance/drops';
import { enhanceCost, enhanceMultiplier } from '@/game/balance/enhance';
import { marketFloor } from '@/game/balance/market';
import { RARITY_COLOR } from '@/lib/types';
import { Num, Section, Toggle, getPath, setPath, type Draft } from './fields';
import SkillForge from './SkillForge';
import { Coupons, Fashion, Ops, Partners } from './OpsConsole';

type Tab = 'overview' | 'invites' | 'coupons' | 'fashion' | 'partners' | 'ops' | 'players' | 'classes' | 'combat' | 'drops' | 'options' | 'enhance' | 'market' | 'buffs' | 'skills';
const TABS: [Tab, string][] = [['overview', 'ภาพรวม'], ['invites', 'โค้ดเชิญ'], ['coupons', 'คูปอง'], ['fashion', 'แฟชั่น / Cash'], ['partners', 'พาร์ทเนอร์ · คำสั่งซื้อ'], ['ops', 'ระบบ · แพตช์ · สำรอง'], ['players', 'ผู้เล่น'], ['classes', 'ค่าพื้นฐานอาชีพ'], ['combat', 'ดาเมจ'], ['drops', 'อัตราดรอป'], ['options', 'ออปชันไอเทม'], ['enhance', 'ตีบวก'], ['market', 'ตลาด & เศรษฐกิจ'], ['buffs', 'บัฟ'], ['skills', 'Skill Forge']];
type Invite = { code: string; batch: string; note: string | null; max_uses: number; used_count: number; expires_at: string | null; revoked_at: string | null; created_at: string; last_used_at: string | null };
type Profile = { user_id: string; display_name: string; class_id: string; invite_code: string | null; banned: boolean; ban_reason: string | null; created_at: string };

export default function AdminConsole({ initialTab = 'overview' }: { initialTab?: Tab } = {}) {
  const supabase = getSupabaseBrowser();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s)); return () => data.subscription.unsubscribe();
  }, [supabase]);
  useEffect(() => { if (supabase && session) void supabase.rpc('is_admin').then(({ data }) => setIsAdmin(Boolean(data))); else setIsAdmin(null); }, [supabase, session]);
  if (!supabase) return <div className="ad-root"><p className="ad-empty">ตั้งค่า Supabase (NEXT_PUBLIC_SUPABASE_URL / PUBLISHABLE_KEY) ก่อนใช้หน้าแอดมิน</p></div>;
  if (!session) return <div className="ad-root"><AdminLogin /></div>;
  if (isAdmin === null) return <div className="ad-root"><p className="ad-empty">กำลังตรวจสอบสิทธิ์…</p></div>;
  if (!isAdmin) return <div className="ad-root"><p className="ad-empty">บัญชีนี้ไม่ใช่แอดมิน <button className="sf-btn ghost" onClick={() => void supabase.auth.signOut()}>ออกจากระบบ</button></p></div>;
  return <Console email={session.user.email ?? ''} initialTab={initialTab} />;
}

function ChangePassword({ say }: { say: (m: string) => void }) {
  const supabase = getSupabaseBrowser()!; const [open, setOpen] = useState(false); const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); if (pw.length < 12) { say('รหัสผ่านใหม่ต้องยาวอย่างน้อย 12 ตัว'); return; } if (pw !== pw2) { say('รหัสผ่านยืนยันไม่ตรงกัน'); return; }
    const { error } = await supabase.auth.updateUser({ password: pw }); if (error) say('เปลี่ยนรหัสผ่านไม่สำเร็จ: ' + error.message); else { say('เปลี่ยนรหัสผ่านแล้ว'); setOpen(false); setPw(''); setPw2(''); }
  }
  if (!open) return <button className="sf-btn ghost small" onClick={() => setOpen(true)}>เปลี่ยนรหัสผ่าน</button>;
  return <form className="ad-pw" onSubmit={submit}><input type="password" autoComplete="new-password" placeholder="รหัสผ่านใหม่ (12+)" value={pw} onChange={e => setPw(e.target.value)} />
    <input type="password" autoComplete="new-password" placeholder="ยืนยัน" value={pw2} onChange={e => setPw2(e.target.value)} /><button className="sf-btn small">บันทึก</button>
    <button type="button" className="sf-btn ghost small" onClick={() => setOpen(false)}>ยกเลิก</button></form>;
}

function AdminLogin() {
  const supabase = getSupabaseBrowser()!; const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [msg, setMsg] = useState('');
  async function submit(e: FormEvent) { e.preventDefault(); const { error } = await supabase.auth.signInWithPassword({ email: loginEmail(email), password }); if (error) setMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'); }
  return <form className="ad-login" onSubmit={submit}><h1>SoulForge · Game Master</h1>
    <label className="sf-field"><span>ชื่อผู้ใช้แอดมิน (เช่น admin) หรืออีเมล</span><input id="ad-email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required /></label>
    <label className="sf-field"><span>รหัสผ่าน</span><input id="ad-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required /></label>
    <button className="sf-btn">เข้าสู่ระบบ</button>{msg && <p className="sf-error">{msg}</p>}</form>;
}

function Console({ email, initialTab }: { email: string; initialTab: Tab }) {
  const supabase = getSupabaseBrowser()!;
  const [tab, setTab] = useState<Tab>(initialTab);
  const [saved, setSaved] = useState<GameConfig>(DEFAULT_CONFIG);
  const [draft, setDraft] = useState<Draft>(DEFAULT_CONFIG as unknown as Draft);
  const [skillsRaw, setSkillsRaw] = useState<unknown>({});
  const [toast, setToast] = useState('');
  const load = useCallback(async () => {
    const { data } = await supabase.from('game_config').select('key,value,updated_at');
    const by = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
    const merged = mergeConfig(DEFAULT_CONFIG, by.balance); setSaved(merged); setDraft(merged as unknown as Draft); setSkillsRaw(by.skills ?? {});
  }, [supabase]);
  useEffect(() => { void load(); }, [load]);
  const config = draft as unknown as GameConfig;
  const dirty = useMemo(() => JSON.stringify(saved) !== JSON.stringify(draft), [saved, draft]);
  const errors = useMemo(() => validateConfig(config), [config]);
  const say = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3500); };
  async function save() {
    if (errors.length) { say('แก้ข้อผิดพลาดก่อนบันทึก'); return; }
    const { error } = await supabase.rpc('admin_set_config', { p_key: 'balance', p_value: draft });
    if (error) say('บันทึกไม่สำเร็จ: ' + error.message); else { setSaved(config); say('บันทึกแล้ว ผู้เล่นจะได้ค่าใหม่เมื่อโหลดเกมครั้งถัดไป'); }
  }
  const balanceTab = !['overview', 'invites', 'players', 'skills'].includes(tab);
  return <div className="ad-root">
    <header className="ad-top"><div className="sf-brand"><span className="sf-sigil">✦</span><div><b>SOUL<span>FORGE</span></b><small>GAME MASTER CONSOLE</small></div></div>
      <span className="ad-who">{email.replace('@soulforge.local', '')}</span><ChangePassword say={say} /><button className="sf-btn ghost small" onClick={() => void supabase.auth.signOut()}>ออกจากระบบ</button></header>
    <nav className="ad-tabs" aria-label="หมวดการจัดการ">{TABS.map(([id, label]) => <button key={id} aria-current={tab === id} onClick={() => setTab(id)}>{label}</button>)}</nav>
    <main className="ad-main">
      {tab === 'overview' && <Overview />}
      {tab === 'invites' && <Invites say={say} />}
      {tab === 'coupons' && <Coupons say={say} toInvites={() => setTab('invites')} />}
      {tab === 'fashion' && <Fashion say={say} />}
      {tab === 'partners' && <Partners say={say} />}
      {tab === 'ops' && <Ops say={say} />}
      {tab === 'players' && <Players say={say} />}
      {tab === 'classes' && <Classes draft={draft} set={setDraft} />}
      {tab === 'combat' && <Combat draft={draft} set={setDraft} />}
      {tab === 'drops' && <Drops draft={draft} set={setDraft} />}
      {tab === 'options' && <Options draft={draft} set={setDraft} />}
      {tab === 'enhance' && <Enhance draft={draft} set={setDraft} />}
      {tab === 'market' && <Market draft={draft} set={setDraft} />}
      {tab === 'buffs' && <Buffs draft={draft} set={setDraft} />}
      {tab === 'skills' && <SkillForge raw={skillsRaw} onSaved={v => { setSkillsRaw(v); say('บันทึกสกิลแล้ว'); }} onError={say} />}
    </main>
    {balanceTab && <footer className="ad-savebar">
      {errors.length ? <span className="ad-bad">{errors[0]}{errors.length > 1 ? ` (+${errors.length - 1})` : ''}</span> : <span>{dirty ? 'มีการแก้ไขที่ยังไม่บันทึก' : 'ค่าตรงกับที่บันทึกไว้'}</span>}
      <button className="sf-btn ghost small" onClick={() => setDraft(saved as unknown as Draft)} disabled={!dirty}>ยกเลิกการแก้ไข</button>
      <button className="sf-btn ghost small" onClick={() => setDraft(DEFAULT_CONFIG as unknown as Draft)}>คืนค่าเริ่มต้น</button>
      <button className="sf-btn small" onClick={() => void save()} disabled={!dirty || errors.length > 0}>บันทึกค่าเกม</button>
    </footer>}
    {toast && <div className="ad-toast" role="status">{toast}</div>}
  </div>;
}

// ---------------------------------------------------------------- overview
function Overview() {
  const supabase = getSupabaseBrowser()!; const [o, setO] = useState<Record<string, unknown> | null>(null);
  // round 10: characters, SoulGod and the market live on the realm (characters / realm_listings / realm_mail)
  const [r, setR] = useState<Record<string, unknown> | null>(null);
  useEffect(() => { void supabase.rpc('admin_overview').then(({ data }) => setO(data as Record<string, unknown>)); void supabase.rpc('admin_character_stats').then(({ data }) => setR((data ?? {}) as Record<string, unknown>)); }, [supabase]);
  if (!o) return <p className="ad-empty">กำลังโหลด…</p>;
  const n = (k: string) => Number(o[k] ?? 0).toLocaleString(), rn = (k: string) => Number(r?.[k] ?? 0).toLocaleString();
  const tax = (r?.market_tax ?? null) as { rate?: number; growth?: number | null; day?: string } | null, days = (r?.supply_days ?? []) as { day: string; supply: number; tax: number }[];
  const burn = (o.burn_by_kind ?? {}) as Record<string, number>;
  return <>
    <div className="ad-kpis">
      <div><span>ผู้ทดสอบ</span><b>{n('players')}</b><small>ระงับ {n('banned')}</small></div>
      <div><span>โค้ดเชิญคงเหลือ</span><b>{n('invites_left')}</b><small>ใช้แล้ว {n('invites_used')} / {n('invites_total')}</small></div>
      <div><span>ตัวละครบนเซิร์ฟเวอร์</span><b>{rn('characters')}</b><small>เล่นใน 24 ชม. {rn('active_24h')} · เลเวลเฉลี่ย {String(r?.level_avg ?? '–')}</small></div>
      <div><span>SoulGod หมุนเวียน</span><b>{(Number(r?.soulgod_total ?? 0) + Number(r?.mail_gold ?? 0)).toLocaleString()}</b><small>ในตัวละคร {rn('soulgod_total')} · รอในจดหมาย {rn('mail_gold')}</small></div>
      <div><span>SoulGod ถูกเบิร์น 7 วัน</span><b>{rn('burned_7d')}</b><small>24 ชม. {n('burned_24h')}</small></div>
      <div><span>ตลาดผู้เล่น</span><b>{rn('listings_active')}</b><small>ภาษีตอนนี้ {tax?.rate !== undefined ? `${+(tax.rate * 100).toFixed(2)}%` : 'ค่าเริ่มต้น'}{tax?.growth !== undefined && tax?.growth !== null ? ` · โต ${(tax.growth * 100).toFixed(1)}%/สัปดาห์` : ''}</small></div>
    </div>
    {days.length > 0 && <Section title="SoulGod หมุนเวียนรายวัน (ตัวควบคุมเงินเฟ้อ)" hint="เซิร์ฟเวอร์บันทึกยอดทุกวัน (เวลาไทย) แล้วปรับภาษีตลาดเข้าหาเป้าการเติบโตต่อสัปดาห์ที่ตั้งไว้ในแท็บตลาด & เศรษฐกิจ">
      <table className="ad-table"><thead><tr><th>วัน</th><th className="num">SoulGod</th><th className="num">ภาษีตลาด</th></tr></thead>
        <tbody>{days.map(d => <tr key={d.day}><td>{d.day}</td><td className="num">{Number(d.supply).toLocaleString()}</td><td className="num">{(Number(d.tax) * 100).toFixed(2)}%</td></tr>)}</tbody></table>
    </Section>}
    <Section title="ช่องทางเบิร์นเงิน 7 วันล่าสุด" hint="ค่าธรรมเนียมลงขาย ภาษีการขาย ค่าตีบวก ร้าน NPC และค่าเดินทาง จะถูกนำออกจากระบบทั้งหมด">
      <table className="ad-table"><thead><tr><th>ประเภท</th><th className="num">SoulGod</th></tr></thead>
        <tbody>{Object.entries(burn).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => <tr key={k}><td>{k}</td><td className="num">{v.toLocaleString()}</td></tr>)}</tbody></table>
    </Section>
  </>;
}

// ---------------------------------------------------------------- invites
function Invites({ say }: { say: (m: string) => void }) {
  const supabase = getSupabaseBrowser()!;
  const [rows, setRows] = useState<Invite[]>([]); const [filter, setFilter] = useState<'all' | 'unused' | 'used' | 'revoked'>('unused'); const [q, setQ] = useState('');
  const [count, setCount] = useState(50); const [batch, setBatch] = useState('closed-beta-2'); const [expires, setExpires] = useState(''); const [fresh, setFresh] = useState<string[]>([]);
  const load = useCallback(async () => { const { data } = await supabase.from('invite_codes').select('*').order('created_at', { ascending: false }).limit(5000); setRows((data ?? []) as Invite[]); }, [supabase]);
  useEffect(() => { void load(); }, [load]);
  const shown = rows.filter(r => (filter === 'all' || (filter === 'unused' ? !r.revoked_at && r.used_count < r.max_uses : filter === 'used' ? r.used_count > 0 : !!r.revoked_at)) && (!q || r.code.includes(q.toUpperCase()) || r.batch.includes(q)));
  async function generate() {
    const { data, error } = await supabase.rpc('admin_generate_invites', { p_count: count, p_batch: batch, p_expires: expires ? new Date(expires).toISOString() : null, p_note: null });
    if (error) { say(error.message); return; } setFresh((data ?? []) as string[]); say(`สร้าง ${(data ?? []).length} โค้ดแล้ว`); void load();
  }
  async function revoke(code: string) { const { error } = await supabase.rpc('admin_revoke_invite', { p_code: code }); if (error) say(error.message); else void load(); }
  function exportCsv() {
    const csv = ['code,batch,used,max,expires,revoked'].concat(shown.map(r => [r.code, r.batch, r.used_count, r.max_uses, r.expires_at ?? '', r.revoked_at ?? ''].join(','))).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = `soulforge-invites-${filter}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }
  async function copy(list: string[]) { try { await navigator.clipboard.writeText(list.join('\n')); say(`คัดลอก ${list.length} โค้ด`); } catch { say('คัดลอกไม่ได้ ใช้ Export CSV แทน'); } }
  return <>
    <Section title="สร้างโค้ดเชิญ" hint="รูปแบบ XXXX-XXXX-XXXX-XXXX สุ่มด้วย pgcrypto ไม่มีตัว I O 0 1 ที่สับสน · ชุดแรก 500 โค้ดถูกสร้างตอนติดตั้งฐานข้อมูล">
      <div className="ad-inline">
        <label className="ad-num"><span>จำนวน</span><span className="ad-num-input"><input id="inv-count" type="number" min={1} max={2000} value={count} onChange={e => setCount(Number(e.target.value))} /></span></label>
        <label className="ad-num"><span>ชื่อชุด</span><span className="ad-num-input"><input id="inv-batch" value={batch} onChange={e => setBatch(e.target.value)} /></span></label>
        <label className="ad-num"><span>หมดอายุ (ไม่บังคับ)</span><span className="ad-num-input"><input id="inv-exp" type="datetime-local" value={expires} onChange={e => setExpires(e.target.value)} /></span></label>
        <button className="sf-btn small" onClick={() => void generate()}>สร้างโค้ด</button>
      </div>
      {fresh.length > 0 && <div className="ad-fresh"><pre>{fresh.join('\n')}</pre><button className="sf-btn ghost small" onClick={() => void copy(fresh)}>คัดลอกทั้งหมด</button></div>}
    </Section>
    <Section title={`รายการโค้ด (${shown.length.toLocaleString()})`}>
      <div className="ad-inline">
        {(['unused', 'used', 'revoked', 'all'] as const).map(f => <button key={f} className={`ad-chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>{({ unused: 'ยังไม่ใช้', used: 'ใช้แล้ว', revoked: 'ยกเลิก', all: 'ทั้งหมด' })[f]}</button>)}
        <input id="inv-search" className="ad-search" placeholder="ค้นหาโค้ด / ชุด" value={q} onChange={e => setQ(e.target.value)} />
        <button className="sf-btn ghost small" onClick={() => void copy(shown.map(r => r.code))}>คัดลอก</button><button className="sf-btn ghost small" onClick={exportCsv}>Export CSV</button>
      </div>
      <div className="ad-scroll"><table className="ad-table"><thead><tr><th>โค้ด</th><th>ชุด</th><th className="num">ใช้</th><th>หมดอายุ</th><th>สถานะ</th><th /></tr></thead>
        <tbody>{shown.slice(0, 500).map(r => <tr key={r.code}><td className="mono">{r.code}</td><td>{r.batch}</td><td className="num">{r.used_count}/{r.max_uses}</td><td>{r.expires_at ? new Date(r.expires_at).toLocaleDateString('th-TH') : '—'}</td>
          <td>{r.revoked_at ? <span className="ad-pill bad">ยกเลิก</span> : r.used_count >= r.max_uses ? <span className="ad-pill">ใช้แล้ว</span> : <span className="ad-pill good">พร้อมใช้</span>}</td>
          <td>{!r.revoked_at && r.used_count < r.max_uses && <button className="ad-link" onClick={() => void revoke(r.code)}>ยกเลิกโค้ด</button>}</td></tr>)}</tbody></table>
        {shown.length > 500 && <p className="ad-empty">แสดง 500 รายการแรก ใช้ค้นหาหรือ Export CSV เพื่อดูทั้งหมด</p>}</div>
    </Section>
  </>;
}

// ---------------------------------------------------------------- players
function Players({ say }: { say: (m: string) => void }) {
  const supabase = getSupabaseBrowser()!; const [rows, setRows] = useState<Profile[]>([]); const [q, setQ] = useState('');
  const load = useCallback(async () => { const { data } = await supabase.from('player_profiles').select('*').order('created_at', { ascending: false }).limit(2000); setRows((data ?? []) as Profile[]); }, [supabase]);
  useEffect(() => { void load(); }, [load]);
  async function ban(p: Profile) { const { error } = await supabase.rpc('admin_set_ban', { p_user: p.user_id, p_banned: !p.banned, p_reason: p.banned ? null : 'ระงับโดยแอดมิน' }); if (error) say(error.message); else void load(); }
  const shown = rows.filter(r => !q || r.display_name.toLowerCase().includes(q.toLowerCase()));
  const byClass = CLASS_KEYS.map(c => [c, rows.filter(r => r.class_id === c).length] as const);
  return <Section title={`ผู้ทดสอบ ${rows.length.toLocaleString()} คน`} hint={byClass.map(([c, n]) => `${c} ${n}`).join(' · ')}>
    <input id="pl-search" className="ad-search" placeholder="ค้นหาชื่อตัวละคร" value={q} onChange={e => setQ(e.target.value)} />
    <div className="ad-scroll"><table className="ad-table"><thead><tr><th>ตัวละคร</th><th>อาชีพ</th><th>โค้ด</th><th>สมัคร</th><th>สถานะ</th><th /></tr></thead>
      <tbody>{shown.map(p => <tr key={p.user_id}><td>{p.display_name}</td><td>{p.class_id}</td><td className="mono">{p.invite_code}</td><td>{new Date(p.created_at).toLocaleString('th-TH')}</td>
        <td>{p.banned ? <span className="ad-pill bad">ระงับ</span> : <span className="ad-pill good">ปกติ</span>}</td><td><button className="ad-link" onClick={() => void ban(p)}>{p.banned ? 'ปลดระงับ' : 'ระงับ'}</button></td></tr>)}</tbody></table></div>
  </Section>;
}

// ---------------------------------------------------------------- balance tabs
type T = { draft: Draft; set: (d: Draft) => void };
function Classes({ draft, set }: T) {
  const [level, setLevel] = useState(30); const c = draft as unknown as GameConfig;
  return <>
    <Section title="ค่าพื้นฐาน 6 สเตตัส (ผู้เล่นปรับเองไม่ได้)" hint="1 แต้มมีผลชัดเจน: STR +4 พลังโจมตี, DEX +1 พลังโจมตี, VIT +18 HP · เพิ่มได้เฉพาะจากออปชันอุปกรณ์ Rare ขึ้นไป">
      <div className="ad-scroll"><table className="ad-table ad-grid"><thead><tr><th>อาชีพ</th>{ATTRIBUTES.map(a => <th key={a}>{ATTRIBUTE_LABEL[a]}</th>)}<th className="num">รวม</th><th>HP/เลเวล</th><th>MP/เลเวล</th><th>ATK/เลเวล</th><th>DEF/เลเวล</th><th>ดาเมจ ×</th><th>รักษา ×</th></tr></thead>
        <tbody>{CLASS_KEYS.map(k => <tr key={k}><th>{k}</th>
          {ATTRIBUTES.map(a => <td key={a} className={c.classes[k].primary.includes(a) ? 'hi' : ''}><Num draft={draft} path={['classes', k, 'base', a]} onChange={set} min={1} max={99} width={64} /></td>)}
          <td className="num">{ATTRIBUTES.reduce((s, a) => s + c.classes[k].base[a], 0)}</td>
          {(['hpPerLevel', 'mpPerLevel', 'atkPerLevel', 'defPerLevel', 'damageMultiplier', 'healingMultiplier'] as const).map(f => <td key={f}><Num draft={draft} path={['classes', k, f]} onChange={set} step={f.endsWith('Multiplier') ? 0.05 : 0.1} width={72} /></td>)}</tr>)}</tbody></table></div>
    </Section>
    <Section title={`ตัวอย่างค่าต่อสู้ที่เลเวล ${level} (ไม่สวมอุปกรณ์)`}>
      <input id="cls-level" type="range" min={1} max={100} value={level} onChange={e => setLevel(Number(e.target.value))} aria-label="เลเวลตัวอย่าง" />
      <table className="ad-table"><thead><tr><th>อาชีพ</th><th className="num">HP</th><th className="num">MP</th><th className="num">ATK</th><th className="num">DEF</th><th className="num">คริ</th><th className="num">ความเร็ว</th><th className="num">ตีมอนเลเวลเดียวกันตาย (ครั้ง)</th></tr></thead>
        <tbody>{CLASS_KEYS.map(k => { const d = deriveCharacter(k, level, [], [], 0, c), m = monsterStats(level, {}, c); return <tr key={k}><th>{k}</th><td className="num">{d.maxHp}</td><td className="num">{d.maxMp}</td><td className="num">{d.attack}</td><td className="num">{d.defense}</td><td className="num">{(d.crit * 100).toFixed(1)}%</td><td className="num">{d.speed.toFixed(2)}</td><td className="num">{Math.ceil(m.maxHp / Math.max(1, d.attack - m.defense * 0.35))}</td></tr>; })}</tbody></table>
    </Section>
    <Section title="มูลค่าต่อ 1 แต้ม"><div className="ad-wrap">{Object.keys(c.attributeValue).map(k => <Num key={k} draft={draft} path={['attributeValue', k]} onChange={set} step={0.001} label={k} width={130} />)}</div></Section>
  </>;
}
function Combat({ draft, set }: T) {
  const c = draft as unknown as GameConfig;
  return <Section title="ตัวคูณดาเมจ" hint="ตัวคูณดาเมจรายอาชีพอยู่ในหมวดค่าพื้นฐานอาชีพ">
    <div className="ad-wrap">
      <Num draft={draft} path={['combat', 'monsterDamageMultiplier']} onChange={set} step={0.05} label="ดาเมจมอนสเตอร์ ×" />
      <Num draft={draft} path={['combat', 'eliteDamageMultiplier']} onChange={set} step={0.05} label="ดาเมจ Elite ×" />
      <Num draft={draft} path={['combat', 'bossDamageMultiplier']} onChange={set} step={0.05} label="ดาเมจบอส ×" />
      <Num draft={draft} path={['combat', 'bossHpMultiplier']} onChange={set} step={0.05} label="HP บอส ×" />
      <Num draft={draft} path={['combat', 'pvpDamageMultiplier']} onChange={set} step={0.05} label="ดาเมจ PvP ×" />
      <Num draft={draft} path={['combat', 'critBase']} onChange={set} pct step={0.5} label="คริพื้นฐาน" />
      <Num draft={draft} path={['combat', 'critCap']} onChange={set} pct step={1} label="คริสูงสุด" />
      <Num draft={draft} path={['combat', 'critDamageBase']} onChange={set} step={0.05} label="แรงคริพื้นฐาน ×" />
    </div>
    <table className="ad-table"><thead><tr><th>เลเวลมอนสเตอร์</th><th className="num">HP</th><th className="num">ดาเมจต่อครั้ง</th><th className="num">HP บอส</th><th className="num">ดาเมจบอส</th></tr></thead>
      <tbody>{[1, 10, 25, 40, 60, 85, 100].map(l => { const m = monsterStats(l, {}, c), b = monsterStats(l, { boss: true }, c); return <tr key={l}><td>Lv {l}</td><td className="num">{m.maxHp.toLocaleString()}</td><td className="num">{Math.round(m.damage)}</td><td className="num">{b.maxHp.toLocaleString()}</td><td className="num">{Math.round(b.damage)}</td></tr>; })}</tbody></table>
  </Section>;
}
const SOURCES: [DropSource, string][] = [['field', 'มอนสเตอร์ทั่วไป'], ['elite', 'Elite / ดันเจี้ยน'], ['boss', 'บอส'], ['farm', 'ฟาร์มออฟไลน์']];
function Drops({ draft, set }: T) {
  const c = draft as unknown as GameConfig; const [level, setLevel] = useState(40);
  return <>
    <Section title="ตารางดรอปแต่ละแหล่ง" hint="น้ำหนัก (weight) เทียบกันภายในแถว · โอกาสดรอปต่อ 1 การสุ่ม × จำนวนครั้งที่สุ่ม">
      <div className="ad-scroll"><table className="ad-table ad-grid"><thead><tr><th>แหล่ง</th><th>โอกาส</th><th>สุ่ม</th>{RARITY_KEYS.map(r => <th key={r} style={{ color: RARITY_COLOR[r] }}>{r}</th>)}</tr></thead>
        <tbody>{SOURCES.map(([s, label]) => <tr key={s}><th>{label}</th><td><Num draft={draft} path={['drops', 'tables', s, 'chance']} onChange={set} pct step={1} width={84} /></td><td><Num draft={draft} path={['drops', 'tables', s, 'rolls']} onChange={set} min={1} max={10} width={56} /></td>
          {RARITY_KEYS.map(r => <td key={r}><Num draft={draft} path={['drops', 'tables', s, 'weights', r]} onChange={set} min={0} width={80} /></td>)}</tr>)}
          <tr><th>เลเวลขั้นต่ำ</th><td /><td />{RARITY_KEYS.map(r => <td key={r}><Num draft={draft} path={['drops', 'levelGate', r]} onChange={set} min={1} max={100} width={64} /></td>)}</tr>
          <tr><th>โบนัสตามเลเวล</th><td /><td />{RARITY_KEYS.map(r => <td key={r}><Num draft={draft} path={['drops', 'levelBonus', r]} onChange={set} step={0.1} width={64} /></td>)}</tr></tbody></table></div>
      <div className="ad-wrap"><Num draft={draft} path={['drops', 'tierHardness']} onChange={set} step={0.05} label="ความยากต่อระดับ (×ทุกขั้น)" /><Num draft={draft} path={['drops', 'globalRate']} onChange={set} step={0.1} label="อัตราดรอปรวม × (อีเวนต์)" /></div>
    </Section>
    <Section title={`โอกาสได้รับต่อการฆ่า 1 ตัว ที่มอนสเตอร์เลเวล ${level}`}>
      <input id="drop-level" type="range" min={1} max={100} value={level} onChange={e => setLevel(Number(e.target.value))} aria-label="เลเวลมอนสเตอร์" />
      <table className="ad-table"><thead><tr><th>แหล่ง</th>{RARITY_KEYS.map(r => <th key={r} className="num" style={{ color: RARITY_COLOR[r] }}>{r}</th>)}</tr></thead>
        <tbody>{SOURCES.map(([s, label]) => { const o = dropOdds(s, level, c); return <tr key={s}><th>{label}</th>{RARITY_KEYS.map(r => <td key={r} className="num">{o[r] === 0 ? '—' : o[r] < 0.01 ? `1/${Math.round(100 / o[r]).toLocaleString()}` : `${o[r].toFixed(2)}%`}</td>)}</tr>; })}</tbody></table>
    </Section>
  </>;
}
function Options({ draft, set }: T) {
  return <>
    <Section title="จำนวนออปชันตามระดับ" hint="กติกา: Rare 1 · Epic 2 · Legendary 3 · God/Pre-arch/Arch 4 สเตตัส + พิเศษ 1/2/3 ค่า">
      <table className="ad-table ad-grid"><thead><tr><th /> {RARITY_KEYS.map(r => <th key={r} style={{ color: RARITY_COLOR[r] }}>{r}</th>)}</tr></thead><tbody>
        <tr><th>ออปชันสเตตัส</th>{RARITY_KEYS.map(r => <td key={r}><Num draft={draft} path={['options', 'attributeLines', r]} onChange={set} min={0} max={6} width={56} /></td>)}</tr>
        <tr><th>ออปชันพิเศษ</th>{RARITY_KEYS.map(r => <td key={r}><Num draft={draft} path={['options', 'specialLines', r]} onChange={set} min={0} max={6} width={56} /></td>)}</tr>
        <tr><th>ค่าสเตตัสต่ำสุด</th>{RARITY_KEYS.map(r => <td key={r}><Num draft={draft} path={['options', 'attributeRange', r, 0]} onChange={set} min={0} width={56} /></td>)}</tr>
        <tr><th>ค่าสเตตัสสูงสุด</th>{RARITY_KEYS.map(r => <td key={r}><Num draft={draft} path={['options', 'attributeRange', r, 1]} onChange={set} min={0} width={56} /></td>)}</tr>
        <tr><th>ตัวคูณพิเศษ</th>{RARITY_KEYS.map(r => <td key={r}><Num draft={draft} path={['options', 'specialTierMultiplier', r]} onChange={set} step={0.5} width={56} /></td>)}</tr></tbody></table>
      <Num draft={draft} path={['options', 'primaryWeight']} onChange={set} step={0.5} label="น้ำหนักสเตตัสหลักของอาชีพ" />
    </Section>
    <Section title="ค่าพิเศษ (ค่าระดับ God · Pre-arch ×2 · Arch ×4)">
      <table className="ad-table"><thead><tr><th>ออปชัน</th><th>God</th><th className="num">Pre-arch</th><th className="num">Arch</th></tr></thead>
        <tbody>{SPECIAL_KEYS.map(k => { const v = Number(getPath(draft, ['options', 'specialGodValue', k])); const m = draft.options as GameConfig['options']; return <tr key={k}><td>{SPECIAL_LABEL[k]} %</td><td><Num draft={draft} path={['options', 'specialGodValue', k]} onChange={set} step={0.5} width={72} /></td><td className="num">{(v * m.specialTierMultiplier['Pre-arch']).toFixed(1)}%</td><td className="num">{(v * m.specialTierMultiplier.Arch).toFixed(1)}%</td></tr>; })}</tbody></table>
    </Section>
  </>;
}
function Enhance({ draft, set }: T) {
  const c = draft as unknown as GameConfig;
  return <>
    <Section title="การตีบวก (ทำได้ที่ NPC Merchant ในเมืองเท่านั้น)" hint="ค่าตีบวกทั้งหมดถูกเบิร์นออกจากระบบ · ต่ำกว่าระดับปลอดภัยตีพลาดไม่ลดขั้น">
      <div className="ad-wrap">
        <Num draft={draft} path={['enhance', 'safeLevel']} onChange={set} min={0} max={15} label="ระดับปลอดภัย (+)" />
        <Num draft={draft} path={['enhance', 'downgradeOnFail']} onChange={set} min={0} max={5} label="ลดขั้นเมื่อพลาด" />
        <Num draft={draft} path={['enhance', 'costExponent']} onChange={set} step={0.05} label="ค่าใช้จ่ายโตแบบยกกำลัง" />
        <Num draft={draft} path={['enhance', 'bonusPerLevel']} onChange={set} pct step={0.5} label="โบนัส ATK/DEF ต่อขั้น (+1–+10)" />
        <Num draft={draft} path={['enhance', 'bonusPerLevelAfter10']} onChange={set} pct step={0.5} label="โบนัสต่อขั้น (+11–+15)" />
        <Num draft={draft} path={['enhance', 'protectionScrollPrice']} onChange={set} step={1000} label="ราคาคัมภีร์ป้องกัน" suffix="SG" />
      </div>
      <div className="ad-scroll"><table className="ad-table"><thead><tr><th>ขั้น</th><th>โอกาสสำเร็จ</th><th className="num">ATK/DEF ×</th>{RARITY_KEYS.slice(2).map(r => <th key={r} className="num" style={{ color: RARITY_COLOR[r] }}>ค่าใช้จ่าย {r}</th>)}</tr></thead>
        <tbody>{c.enhance.successRate.map((_, i) => <tr key={i}><td>+{i} → +{i + 1}</td><td><Num draft={draft} path={['enhance', 'successRate', i]} onChange={set} pct step={1} width={84} /></td><td className="num">{enhanceMultiplier(i + 1, c).toFixed(2)}</td>{RARITY_KEYS.slice(2).map(r => <td key={r} className="num">{enhanceCost(r, i, c).toLocaleString()}</td>)}</tr>)}</tbody></table></div>
    </Section>
    <Section title="ค่าตีบวกพื้นฐาน"><div className="ad-wrap">{RARITY_KEYS.map(r => <Num key={r} draft={draft} path={['enhance', 'baseCost', r]} onChange={set} label={r} suffix="SG" />)}</div></Section>
  </>;
}
function Market({ draft, set }: T) {
  const c = draft as unknown as GameConfig;
  return <>
    <Section title="ราคาขั้นต่ำในตลาด (ไม่มีเพดานราคา)" hint="ราคาขั้นต่ำจริง = ค่าตามระดับ × (1 + ต่อขั้นตีบวก) และไม่ต่ำกว่าครึ่งหนึ่งของราคาขายกลาง 7 วันของไอเทมนั้น เพื่อกันการทุ่มราคา/ปั่นตลาด">
      <div className="ad-wrap">{RARITY_KEYS.map(r => <Num key={r} draft={draft} path={['market', 'floor', r]} onChange={set} label={<span style={{ color: RARITY_COLOR[r] }}>{r}</span>} suffix="SG" />)}</div>
      <div className="ad-wrap">
        <Num draft={draft} path={['market', 'floorPerEnhance']} onChange={set} pct step={1} label="ขั้นต่ำเพิ่มต่อ +1" />
        <Num draft={draft} path={['market', 'medianFloorRatio']} onChange={set} pct step={5} label="ขั้นต่ำจากราคากลาง 7 วัน" />
        <Num draft={draft} path={['market', 'listingFeePct']} onChange={set} pct step={0.5} label="ค่าลงขาย (เบิร์น ไม่คืน)" />
        <Num draft={draft} path={['market', 'listingFeeMin']} onChange={set} label="ค่าลงขายขั้นต่ำ" suffix="SG" />
        <Num draft={draft} path={['market', 'salesTaxPct']} onChange={set} pct step={0.5} label="ภาษีการขาย (เบิร์น)" />
        <Num draft={draft} path={['market', 'maxActiveListings']} onChange={set} label="ลงขายพร้อมกันสูงสุด" />
        <Num draft={draft} path={['market', 'relistCooldownMinutes']} onChange={set} label="รอก่อนลงขายใหม่หลังยกเลิก" suffix="นาที" />
        <Num draft={draft} path={['market', 'listingHours']} onChange={set} label="อายุประกาศ" suffix="ชม." />
        <Num draft={draft} path={['market', 'cancelsPerHour']} onChange={set} label="ยกเลิกได้ต่อชั่วโมง" suffix="ครั้ง" />
      </div>
      <div className="ad-wrap">
        <Toggle draft={draft} path={['market', 'inflation', 'enabled']} onChange={set} label="ปรับภาษีตลาดอัตโนมัติตามเงินหมุนเวียน" />
        <Num draft={draft} path={['market', 'taxMin']} onChange={set} pct step={0.5} label="ภาษีต่ำสุด (ตัวควบคุมเงินเฟ้อ)" />
        <Num draft={draft} path={['market', 'taxMax']} onChange={set} pct step={0.5} label="ภาษีสูงสุด" />
        <Num draft={draft} path={['market', 'inflation', 'targetWeeklyGrowth']} onChange={set} pct step={0.5} label="เป้าเงินหมุนเวียนโตต่อสัปดาห์" />
        <Num draft={draft} path={['market', 'inflation', 'maxDailyStep']} onChange={set} pct step={0.1} label="ปรับภาษีได้สูงสุดต่อวัน" />
      </div>
      <p className="ad-note">ตัวอย่าง: Epic +5 ขั้นต่ำ {marketFloor('Epic', 5, null, c).toLocaleString()} SG · Legendary +10 ขั้นต่ำ {marketFloor('Legendary', 10, null, c).toLocaleString()} SG</p>
    </Section>
    <Section title="เศรษฐกิจ SoulGod"><div className="ad-wrap">
      <Num draft={draft} path={['economy', 'startingSoulGod']} onChange={set} label="เงินเริ่มต้น" suffix="SG" />
      <Num draft={draft} path={['economy', 'travelFeePerZone']} onChange={set} label="ค่าเดินทางต่อโซน (เบิร์น)" suffix="SG" />
      <Num draft={draft} path={['economy', 'skillResetBase']} onChange={set} label="ค่ารีเซ็ตสกิลพื้นฐาน" suffix="SG" />
      <Num draft={draft} path={['economy', 'skillResetPerLevel']} onChange={set} label="ค่ารีเซ็ตต่อเลเวล" suffix="SG" />
      <Num draft={draft} path={['economy', 'npcSellRate']} onChange={set} step={0.05} label="อัตรารับซื้อของ NPC ×" />
      <Num draft={draft} path={['economy', 'bossSoulGod', 'field']} onChange={set} label="SoulGod บอสภาคสนาม (Grave Marshal)" suffix="SG" />
      <Num draft={draft} path={['economy', 'bossSoulGod', 'dungeon', 0]} onChange={set} label="SoulGod บอสดันเจี้ยน 1" suffix="SG" />
      <Num draft={draft} path={['economy', 'bossSoulGod', 'dungeon', 1]} onChange={set} label="SoulGod บอสดันเจี้ยน 2" suffix="SG" />
      <Num draft={draft} path={['economy', 'bossSoulGod', 'dungeon', 2]} onChange={set} label="SoulGod บอสดันเจี้ยน 3" suffix="SG" />
      <Num draft={draft} path={['beta', 'maxPlayers']} onChange={set} label="จำนวนผู้ทดสอบสูงสุด" />
      <Toggle draft={draft} path={['beta', 'inviteOnly']} onChange={set} label="เปิดเฉพาะผู้มีโค้ดเชิญ" />
    </div></Section>
    <Section title="สมุดสะสมอสูร (Codex)"><div className="ad-wrap">
      <Toggle draft={draft} path={['codex', 'enabled']} onChange={set} label="เปิดสมุดสะสม (ปิด = โบนัสหยุดทำงานชั่วคราว ข้อมูลไม่หาย)" />
      {[0, 1, 2, 3, 4].map(i => <Num key={`t${i}`} draft={draft} path={['codex', 'tierCost', i]} onChange={set} label={`ของดรอปที่ใช้ ขั้น ${['I', 'II', 'III', 'IV', 'V'][i]}`} suffix="ชิ้น" />)}
      {[3, 4].map(i => <Num key={`s${i}`} draft={draft} path={['codex', 'sealCost', i]} onChange={set} label={`ตราสมุดสะสม ขั้น ${['I', 'II', 'III', 'IV', 'V'][i]}`} suffix="ตรา" />)}
      <Num draft={draft} path={['codex', 'lootChance']} onChange={set} pct step={1} label="โอกาสดรอปของสะสม (มอนปกติ)" />
      <Num draft={draft} path={['codex', 'sealChance', 'solo']} onChange={set} pct step={0.5} label="โอกาสตรา จาก Elite (เล่นคนเดียว)" />
      <Num draft={draft} path={['codex', 'sealChance', 'party']} onChange={set} pct step={0.5} label="โอกาสตรา จาก Elite (มีเพื่อนปาร์ตี้ใกล้)" />
      <Num draft={draft} path={['codex', 'outlevelBy']} onChange={set} label="เลเวลสูงกว่ามอนเกินนี้ ดรอปลดลง" suffix="เลเวล" />
      <Num draft={draft} path={['codex', 'outlevelFactor']} onChange={set} pct step={5} label="ดรอปที่เหลือเมื่อเลเวลสูงเกิน" />
      {(['atkPct', 'hpPct', 'defPct', 'critRate', 'critDmg', 'mpPct', 'moveSpeed', 'bossDmg'] as const).map(k => <Num key={k} draft={draft} path={['codex', 'caps', k]} onChange={set} step={0.5} label={`เพดานรวม ${k}`} suffix="%" />)}
    </div><p className="ad-note">ทุกขั้นให้ค่าเท่ากัน แต่ใช้ของมากขึ้น · เพดานรวมกันไม่ให้สมุดสะสมกลายเป็นเงื่อนไขบังคับ</p></Section>
  </>;
}
function Buffs({ draft, set }: T) {
  const c = draft as unknown as GameConfig; const tiers = c.newbieBuff.tiers;
  const levels = [...new Set(tiers.map(t => String(t.buffLevel)))];
  return <>
    <Section title="บัฟมือใหม่ (NPC Sister Lumen)" hint="แอดมินกำหนดช่วงเลเวลเองได้ · บัฟต้องตรงกับเลเวลตัวละคร หากเลเวลเลยช่วง บัฟจะหายเมื่อรับใหม่">
      <div className="ad-wrap"><Toggle draft={draft} path={['newbieBuff', 'enabled']} onChange={set} label="เปิดใช้บัฟมือใหม่" />
        <Num draft={draft} path={['newbieBuff', 'maxLevel']} onChange={set} min={1} max={100} label="ใช้ได้ถึงเลเวล" />
        <Num draft={draft} path={['newbieBuff', 'durationMinutes']} onChange={set} min={1} label="ระยะเวลา" suffix="นาที" /></div>
      <table className="ad-table"><thead><tr><th>ช่วง</th><th>จากเลเวล</th><th>ถึงเลเวล</th><th>ได้บัฟระดับ</th><th /></tr></thead>
        <tbody>{tiers.map((t, i) => <tr key={i}><td>{i + 1}</td><td><Num draft={draft} path={['newbieBuff', 'tiers', i, 'from']} onChange={set} min={1} width={72} /></td><td><Num draft={draft} path={['newbieBuff', 'tiers', i, 'to']} onChange={set} min={1} width={72} /></td><td><Num draft={draft} path={['newbieBuff', 'tiers', i, 'buffLevel']} onChange={set} min={1} max={9} width={72} /></td>
          <td><button className="ad-link" onClick={() => set(setPath(draft, ['newbieBuff', 'tiers'], tiers.filter((_, j) => j !== i)))}>ลบ</button></td></tr>)}</tbody></table>
      <button className="sf-btn ghost small" onClick={() => { const last = tiers.at(-1); const from = (last?.to ?? 0) + 1, lvl = (last?.buffLevel ?? 0) + 1; let d = setPath(draft, ['newbieBuff', 'tiers'], [...tiers, { from, to: from + 9, buffLevel: lvl }]); if (!c.newbieBuff.effects[String(lvl)]) d = setPath(d, ['newbieBuff', 'effects', String(lvl)], { atkPct: 15, defPct: 15, expPct: 25, hpRegen: 4, moveSpeed: 6 }); set(setPath(d, ['newbieBuff', 'maxLevel'], from + 9)); }}>เพิ่มช่วงเลเวล</button>
      <table className="ad-table"><thead><tr><th>บัฟระดับ</th><th>ATK %</th><th>DEF %</th><th>EXP %</th><th>ฟื้น HP/วิ</th><th>ความเร็ว %</th></tr></thead>
        <tbody>{levels.map(l => <tr key={l}><td>Lv.{l}</td>{(['atkPct', 'defPct', 'expPct', 'hpRegen', 'moveSpeed'] as const).map(k => <td key={k}><Num draft={draft} path={['newbieBuff', 'effects', l, k]} onChange={set} step={0.5} width={72} /></td>)}</tr>)}</tbody></table>
    </Section>
    <Section title="บัฟผู้เล่นต่อผู้เล่น (ปิดอยู่ — เหลืออาชีพเดียว)" hint="ค่าเดิมของระบบบัฟ Enchanter เก็บไว้เผื่อเพิ่มอาชีพซัพพอร์ตภายหลัง ตอนนี้เซิร์ฟเวอร์ปฏิเสธคำสั่งนี้">
      <div className="ad-wrap"><Num draft={draft} path={['enchanterBuff', 'range']} onChange={set} label="ระยะร่าย" suffix="ม." /><Num draft={draft} path={['enchanterBuff', 'durationMinutes']} onChange={set} label="ระยะเวลา" suffix="นาที" /><Toggle draft={draft} path={['enchanterBuff', 'requiresParty']} onChange={set} label="ต้องอยู่ปาร์ตี้เดียวกัน" /></div>
    </Section>
  </>;
}
export type { ClassKey };
