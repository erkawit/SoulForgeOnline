'use client';
// Round 26: guild window (Supabase: guilds / guild_members, migration 0016). Without a guild: create one or join from
// the list. In a guild: notice, roster with roles, leave; the leader / officers can edit the notice, promote and remove.
// Guild chat is the chat box's กิลด์ tab. Guest characters cannot join guilds (they are not on the server).
import { useCallback, useEffect, useState } from 'react';
import { getSupabaseBrowser } from '@/lib/supabase';
import { activeCharacter } from '@/game/eventLog';
import { setMyGuild } from '@/game/chat';
import { CLASS_TH } from './common';
import { useGameConfirm } from '../GameConfirm';

type G = { id: string; name: string; notice: string; leader_name: string; members: number; max_members: number };
type M = { char_id: string; name: string; class_id: string; role: 'leader' | 'officer' | 'member'; joined_at: string };
const ROLE: Record<M['role'], string> = { leader: 'หัวหน้า', officer: 'รองหัวหน้า', member: 'สมาชิก' };
const ERR: Record<string, string> = { ALREADY_IN_GUILD: 'อยู่ในกิลด์อยู่แล้ว', NAME_INVALID: 'ชื่อกิลด์ 3–16 ตัว (ไทย อังกฤษ ตัวเลข _ เว้นวรรค)', NAME_TAKEN: 'ชื่อนี้มีคนใช้แล้ว',
  GUILD_FULL: 'กิลด์เต็มแล้ว', NO_RIGHT: 'ไม่มีสิทธิ์ทำรายการนี้', NOT_IN_GUILD: 'ไม่ได้อยู่ในกิลด์นี้', NO_GUILD: 'ไม่พบกิลด์' };
const errText = (m: string) => ERR[Object.keys(ERR).find(k => m.includes(k)) ?? ''] ?? (/function|relation|does not exist/.test(m) ? 'ระบบกิลด์ยังไม่เปิดบนเซิร์ฟเวอร์ (รอรัน SQL 0016)' : 'ทำรายการไม่สำเร็จ');

export default function GuildPanel() {
  const sb = getSupabaseBrowser(), me = activeCharacter(); const { confirm, dialog } = useGameConfirm();
  const [mine, setMine] = useState<string | null | undefined>(undefined), [list, setList] = useState<G[]>([]), [roster, setRoster] = useState<M[]>([]);
  const [name, setName] = useState(''), [notice, setNotice] = useState(''), [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null), [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!sb || !me) return;
    const g = await sb.rpc('guild_of', { p_char: me.id });
    if (g.error) { setMsg({ ok: false, t: errText(g.error.message) }); setMine(null); return; }
    const id = (g.data as string | null) ?? null; setMine(id); setMyGuild(id);
    const l = await sb.rpc('guild_list'); setList((l.data ?? []) as G[]);
    if (id) { const r = await sb.rpc('guild_roster', { p_guild: id }); setRoster((r.data ?? []) as M[]); const cur = (l.data as G[] | null)?.find(x => x.id === id); setNotice(cur?.notice ?? ''); }
  }, [sb, me]);
  useEffect(() => { void load(); }, [load]);
  const run = async (fn: string, args: Record<string, unknown>, ok: string) => {
    if (!sb || !me || busy) return; setBusy(true);
    const { error } = await sb.rpc(fn, { p_char: me.id, ...args }); setBusy(false);
    setMsg(error ? { ok: false, t: errText(error.message) } : { ok: true, t: ok }); if (!error) await load();
  };

  if (!sb || !me) return <p className="mk-closed">ระบบกิลด์ใช้ได้กับตัวละครที่ล็อกอินด้วยบัญชี (ตัวละคร Guest อยู่ในเครื่องนี้เท่านั้น)</p>;
  if (mine === undefined) return <p className="mk-empty">กำลังโหลด…</p>;
  const g = list.find(x => x.id === mine), myRole = roster.find(r => r.char_id === me.id)?.role ?? 'member';
  return <div className="gd">{dialog}
    {msg && <p className={`mk-msg ${msg.ok ? 'ok' : 'bad'}`} role="status">{msg.t}</p>}
    {mine && g ? <>
      <div className="gd-head"><img src="/art/ui-kit/menu_27_guild_shield_royal.webp" alt="" /><div><h3>{g.name}</h3><small>หัวหน้า {g.leader_name} · สมาชิก {g.members}/{g.max_members}</small></div>
        <button className="mk-btn ghost" disabled={busy} onClick={async () => { if (await confirm(myRole === 'leader' && g.members > 1 ? `ออกจากกิลด์ ${g.name}?\nตำแหน่งหัวหน้าจะส่งต่อให้รองหัวหน้า/สมาชิกที่อยู่นานที่สุด` : myRole === 'leader' ? `ยุบกิลด์ ${g.name}?` : `ออกจากกิลด์ ${g.name}?`)) void run('leave_guild', {}, 'ออกจากกิลด์แล้ว'); }}>ออกจากกิลด์</button></div>
      <section className="gd-notice"><h4>ประกาศกิลด์</h4>
        {myRole === 'member' ? <p>{g.notice || 'ยังไม่มีประกาศ'}</p> : <form onSubmit={e => { e.preventDefault(); void run('set_guild_notice', { p_notice: notice }, 'บันทึกประกาศแล้ว'); }}>
          <textarea value={notice} maxLength={200} rows={2} onChange={e => setNotice(e.target.value)} placeholder="เช่น ลงดันเจี้ยน 2 ทุ่ม" /><button className="mk-btn" disabled={busy}>บันทึก</button></form>}</section>
      <section><h4>สมาชิก</h4><div className="mk-list solo">{roster.map(r => <div key={r.char_id} className="mk-row gd-row">
        <span className={`gd-role ${r.role}`}>{ROLE[r.role]}</span><span className="mk-item"><b>{r.name}</b></span><span className="mk-dim">{CLASS_TH[r.class_id as keyof typeof CLASS_TH] ?? r.class_id}</span>
        <span className="gd-acts">{myRole === 'leader' && r.char_id !== me.id && <>
          <button className="mk-btn ghost" disabled={busy} onClick={() => void run('set_guild_role', { p_target: r.char_id, p_role: r.role === 'officer' ? 'member' : 'officer' }, 'เปลี่ยนตำแหน่งแล้ว')}>{r.role === 'officer' ? 'ลดเป็นสมาชิก' : 'ตั้งรองหัวหน้า'}</button>
          <button className="mk-btn ghost" disabled={busy} onClick={async () => { if (await confirm(`มอบตำแหน่งหัวหน้าให้ ${r.name}?`)) void run('set_guild_role', { p_target: r.char_id, p_role: 'leader' }, `${r.name} เป็นหัวหน้ากิลด์แล้ว`); }}>มอบหัวหน้า</button></>}
          {(myRole === 'leader' || (myRole === 'officer' && r.role === 'member')) && r.char_id !== me.id &&
            <button className="mk-btn ghost" disabled={busy} onClick={async () => { if (await confirm(`นำ ${r.name} ออกจากกิลด์?`)) void run('kick_guild_member', { p_target: r.char_id }, `นำ ${r.name} ออกแล้ว`); }}>นำออก</button>}</span></div>)}</div></section>
      <p className="mk-note">คุยกับสมาชิกได้ที่แท็บ “กิลด์” ในกล่องแชท</p>
    </> : <>
      <section className="gd-create"><h4>สร้างกิลด์</h4><form onSubmit={e => { e.preventDefault(); void run('create_guild', { p_name: name.trim() }, `ก่อตั้งกิลด์ ${name.trim()} แล้ว`); }}>
        <input value={name} maxLength={16} onChange={e => setName(e.target.value)} placeholder="ชื่อกิลด์ 3–16 ตัว" /><button className="mk-btn" disabled={busy || name.trim().length < 3}>ก่อตั้ง</button></form></section>
      <section><h4>กิลด์ทั้งหมด</h4><div className="mk-list solo">{list.map(x => <div key={x.id} className="mk-row gd-row">
        <img className="gd-ico" src="/art/ui-kit/menu_26_guild_shield_plain.webp" alt="" /><span className="mk-item"><b>{x.name}</b></span>
        <span className="mk-dim">หัวหน้า {x.leader_name} · {x.members}/{x.max_members}</span>
        <button className="mk-btn" disabled={busy || x.members >= x.max_members} onClick={() => void run('join_guild', { p_guild: x.id }, `เข้าร่วมกิลด์ ${x.name} แล้ว`)}>เข้าร่วม</button></div>)}
        {!list.length && <p className="mk-empty">ยังไม่มีกิลด์ — ก่อตั้งกิลด์แรกได้เลย</p>}</div></section>
    </>}
  </div>;
}
