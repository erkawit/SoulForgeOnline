'use client';
// Closed-beta gate. With NEXT_PUBLIC_CLOSED_BETA=true the world opens only for signed-in accounts that redeemed an invite code.
// Without it the game keeps the old guest mode, so local development needs no Supabase project.
import '@/styles/soulforge-beta.css';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useConfigStore } from '@/store/useConfigStore';
import { normalizeInvite, isInviteFormat } from '@/game/balance/invite';
import type { ClassKey } from '@/game/balance/config';
import CharacterCreate from './CharacterCreate';
import HeroLineup from './HeroLineup';
import { loginEmail } from '@/lib/loginName';

/** display_name / class_id stay null until the character is created (account-first sign-up, migration 0006) */
export type BetaProfile = { user_id: string; display_name: string | null; class_id: ClassKey | null; gender?: 'm' | 'f' | null; banned: boolean; ban_reason: string | null };
const CREATE_ERRORS: Record<string, string> = { NAME_TAKEN: 'ชื่อนี้มีคนใช้แล้ว', NAME_INVALID: 'ชื่อ 3–16 ตัว ใช้ไทย อังกฤษ ตัวเลข หรือ _ (ห้ามชื่อสงวน)', CHARACTER_EXISTS: 'บัญชีนี้มีตัวละครแล้ว', CLASS_INVALID: 'อาชีพไม่ถูกต้อง', GENDER_INVALID: 'รูปลักษณ์ไม่ถูกต้อง', BANNED: 'บัญชีถูกระงับ' };

/** Formats as the player types: abcd1234 → ABCD-1234 … */
export function formatInviteInput(v: string) {
  const raw = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16); return raw.match(/.{1,4}/g)?.join('-') ?? '';
}

export default function AuthGate({ children, onProfile }: { children: ReactNode; onProfile?: (p: BetaProfile) => void }) {
  const closed = process.env.NEXT_PUBLIC_CLOSED_BETA === 'true';
  const supabase = getSupabaseBrowser();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<BetaProfile | null | undefined>(undefined);
  const [ready, setReady] = useState(!closed); const [made, setMade] = useState(0);
  // round 16: without the closed beta (local / guest play) the login page still comes first — website → เข้าเกม → this
  // page with the hero lineup → เข้าเกม. Shown every time the game page opens.
  const [guestIn, setGuestIn] = useState(false);
  const enterGuest = () => setGuestIn(true);
  useEffect(() => { void useConfigStore.getState().load(); }, []);
  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [supabase]);
  useEffect(() => {
    if (!supabase || !session) { setProfile(undefined); return; }
    void supabase.from('player_profiles').select('user_id,display_name,class_id,gender,banned,ban_reason').eq('user_id', session.user.id).maybeSingle()
      .then(({ data }) => { setProfile((data as BetaProfile | null) ?? null); if (data && !data.banned && data.class_id) onProfile?.(data as BetaProfile); });
  }, [supabase, session, onProfile, made]);

  if (!closed) return guestIn ? <>{children}</> : <Shell showcase><GuestEntry onEnter={enterGuest} /></Shell>;
  if (!supabase) return <Shell><h2 className="sf-h2">ยังไม่ได้เชื่อมเซิร์ฟเวอร์</h2><p className="sf-muted">ตั้งค่า NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ก่อนเปิดโหมดทดสอบปิด</p></Shell>;
  if (!ready || (session && profile === undefined)) return <Shell><p className="sf-muted">กำลังตรวจสอบสิทธิ์…</p></Shell>;
  if (!session) return <Shell showcase><AuthForms /></Shell>;
  if (profile === null) return <Shell><RedeemForm token={session.access_token} onDone={() => setSession({ ...session })} /></Shell>;
  if (profile && !profile.banned && !profile.class_id) return <CharacterCreate onCreate={async (name, cls, gender) => {
    const { error } = await supabase.rpc('create_character', { p_name: name, p_class: cls, p_gender: gender });
    if (error) return CREATE_ERRORS[Object.keys(CREATE_ERRORS).find(k => error.message.includes(k)) ?? ''] ?? 'สร้างตัวละครไม่สำเร็จ';
    setMade(m => m + 1); return null; }} />;
  if (profile?.banned) return <Shell><h2 className="sf-h2">บัญชีถูกระงับ</h2><p className="sf-muted">{profile.ban_reason ?? 'ติดต่อทีมงาน'}</p><button className="sf-btn ghost" onClick={() => void supabase.auth.signOut()}>ออกจากระบบ</button></Shell>;
  return <>{children}</>;
}

function Shell({ children, showcase }: { children: ReactNode; showcase?: boolean }) {
  return <main className={`sf-gate${showcase ? ' show' : ''}`}>{showcase ? <HeroLineup /> : <div className="sf-gate-veil" />}<section className="sf-gate-card">
    <div className="sf-brand"><span className="sf-sigil">✦</span><div><b>SOUL<span>FORGE</span></b><small>CLOSED BETA · ECLIPSE FRONTIER</small></div></div>
    {children}
  </section></main>;
}

function GuestEntry({ onEnter }: { onEnter: () => void }) {
  return <div className="sf-guest">
    <h2 className="sf-h2">เข้าสู่ดินแดนต้องสาป</h2>
    <p className="sf-muted">โหมดทดลองเล่น — ยังไม่ได้เชื่อมเซิร์ฟเวอร์ ตัวละครจะถูกบันทึกในเบราว์เซอร์นี้</p>
    <button className="sf-btn sf-guest-go" autoFocus onClick={onEnter}>เข้าเกม</button>
    <a className="sf-guest-back" href="/">← กลับหน้าเว็บไซต์</a>
  </div>;
}

function AuthForms() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  return <>
    <div className="sf-tabs" role="tablist">
      <button role="tab" aria-selected={tab === 'login'} onClick={() => setTab('login')}>เข้าสู่ระบบ</button>
      <button role="tab" aria-selected={tab === 'register'} onClick={() => setTab('register')}>สมัครด้วยโค้ดเชิญ</button>
    </div>
    {tab === 'login' ? <LoginForm /> : <RegisterForm />}
  </>;
}

function LoginForm() {
  const supabase = getSupabaseBrowser()!; const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail(email), password });
    if (error) setMsg('อีเมล/ชื่อผู้ใช้ หรือรหัสผ่านไม่ถูกต้อง'); setBusy(false);
  }
  return <form className="sf-form" onSubmit={submit}>
    <label className="sf-field"><span>อีเมล (แอดมินใช้ชื่อผู้ใช้ได้)</span><input id="login-email" autoComplete="username" inputMode="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
    <label className="sf-field"><span>รหัสผ่าน</span><input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></label>
    <button className="sf-btn" disabled={busy}>{busy ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่โลก SoulForge'}</button>
    {msg && <p className="sf-error" role="alert">{msg}</p>}
  </form>;
}

/** Two steps: (1) only the invite-code box is shown; the code is checked on the server without being used up.
 *  (2) once it passes, the account form appears (e-mail, password, rules). The code is consumed at step 2. */
function RegisterForm() {
  const supabase = getSupabaseBrowser()!;
  const [code, setCode] = useState(''); const [verified, setVerified] = useState<string | null>(null);
  const [f, setF] = useState({ email: '', password: '', confirm: '', rules: false });
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const codeOk = useMemo(() => isInviteFormat(normalizeInvite(code)), [code]);
  async function check(e: FormEvent) {
    e.preventDefault(); setMsg(''); if (!codeOk) { setMsg('รูปแบบโค้ดเชิญต้องเป็น XXXX-XXXX-XXXX-XXXX'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/auth/check-invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteCode: code }) });
      const data = await r.json().catch(() => ({})); if (!r.ok) throw new Error(data.error ?? 'โค้ดเชิญใช้ไม่ได้');
      setVerified(data.code ?? normalizeInvite(code));
    } catch (err) { setMsg(err instanceof Error ? err.message : 'ตรวจโค้ดไม่สำเร็จ'); } finally { setBusy(false); }
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); setMsg('');
    if (f.password !== f.confirm) { setMsg('รหัสผ่านยืนยันไม่ตรงกัน'); return; }
    if (!f.rules) { setMsg('กรุณายอมรับกติกา Closed Beta'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ inviteCode: verified, email: f.email, password: f.password }) });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) { if (r.status === 400 && /โค้ด/.test(data.error ?? '')) setVerified(null); throw new Error(data.error ?? 'สมัครไม่สำเร็จ'); }
      const { error } = await supabase.auth.signInWithPassword({ email: f.email.trim(), password: f.password });
      if (error) throw new Error('สมัครสำเร็จแล้ว กรุณาเข้าสู่ระบบ');
    } catch (err) { setMsg(err instanceof Error ? err.message : 'สมัครไม่สำเร็จ'); } finally { setBusy(false); }
  }
  if (!verified) return <form className="sf-form" onSubmit={check}>
    <div className="sf-step"><i>1</i><b>กรอกโค้ดเชิญ</b><span>· ขั้นต่อไปจึงจะสร้างบัญชีได้</span></div>
    <label className="sf-field"><span>โค้ดเชิญ</span><input id="reg-invite" className="sf-code" inputMode="text" autoComplete="off" spellCheck={false} placeholder="XXXX-XXXX-XXXX-XXXX" required value={code} onChange={e => { setCode(formatInviteInput(e.target.value)); setMsg(''); }} aria-invalid={code.length === 19 && !codeOk} /></label>
    <button className="sf-btn" disabled={busy || !codeOk}>{busy ? 'กำลังตรวจโค้ด…' : 'ตรวจสอบโค้ดเชิญ'}</button>
    {msg && <p className="sf-error" role="alert">{msg}</p>}
    <p className="sf-muted">ยังไม่มีโค้ด? รอรับจากทีมงาน SoulForge · 1 โค้ดต่อ 1 บัญชี</p>
  </form>;
  return <form className="sf-form" onSubmit={submit}>
    <div className="sf-step"><i className="ok">✓</i><b>{verified}</b><span>ใช้ได้</span><button type="button" className="sf-btn ghost small" style={{ marginLeft: 'auto' }} onClick={() => { setVerified(null); setMsg(''); }}>เปลี่ยนโค้ด</button></div>
    <div className="sf-step"><i>2</i><b>สร้างบัญชีผู้ใช้</b></div>
    <label className="sf-field"><span>อีเมล</span><input id="reg-email" type="email" autoComplete="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} /></label>
    <div className="sf-row">
      <label className="sf-field"><span>รหัสผ่าน (8 ตัวขึ้นไป)</span><input id="reg-password" type="password" autoComplete="new-password" minLength={8} required value={f.password} onChange={e => setF({ ...f, password: e.target.value })} /></label>
      <label className="sf-field"><span>ยืนยันรหัสผ่าน</span><input id="reg-confirm" type="password" autoComplete="new-password" minLength={8} required value={f.confirm} onChange={e => setF({ ...f, confirm: e.target.value })} /></label>
    </div>
    <label className="sf-check"><input id="reg-rules" type="checkbox" checked={f.rules} onChange={e => setF({ ...f, rules: e.target.checked })} /> ยอมรับกติกา Closed Beta: 1 โค้ดต่อ 1 บัญชี · ห้ามซื้อขายโค้ด · ข้อมูลอาจถูกรีเซ็ตเมื่อจบเบต้า</label>
    <button className="sf-btn" disabled={busy}>{busy ? 'กำลังสร้างบัญชี…' : 'สร้างบัญชี'}</button>
    {msg && <p className="sf-error" role="alert">{msg}</p>}
    <p className="sf-muted">สร้างบัญชีแล้วจะไปหน้าสร้าง Berserker (เลือกชาย/หญิง) และตั้งชื่อตัวละคร</p>
  </form>;
}

function RedeemForm({ token, onDone }: { token: string; onDone: () => void }) {
  const supabase = getSupabaseBrowser()!; const [code, setCode] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    const r = await fetch('/api/auth/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ inviteCode: code }) });
    const data = await r.json().catch(() => ({})); setBusy(false);
    if (!r.ok) { setMsg(data.error ?? 'ใช้โค้ดไม่สำเร็จ'); return; } onDone();
  }
  return <form className="sf-form" onSubmit={submit}>
    <h2 className="sf-h2">บัญชีนี้ยังไม่มีสิทธิ์ทดสอบ</h2><p className="sf-muted">กรอกโค้ดเชิญเพื่อเปิดสิทธิ์ แล้วไปสร้างตัวละคร</p>
    <label className="sf-field"><span>โค้ดเชิญ</span><input id="redeem-invite" className="sf-code" placeholder="XXXX-XXXX-XXXX-XXXX" value={code} onChange={e => setCode(formatInviteInput(e.target.value))} /></label>
    <button className="sf-btn" disabled={busy}>ยืนยันโค้ด</button>{msg && <p className="sf-error" role="alert">{msg}</p>}
    <button type="button" className="sf-btn ghost" onClick={() => void supabase.auth.signOut()}>ออกจากระบบ</button>
  </form>;
}
