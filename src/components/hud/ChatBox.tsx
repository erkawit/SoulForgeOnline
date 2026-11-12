'use client';
// Round 25: chat box. PC: always in the bottom-left corner (Enter focuses it, Esc leaves it). Phones: a chat button
// that opens the chat full screen.
import { useEffect, useRef, useState } from 'react';
import { CHAT_TABS, sendChat, useChatStore, type ChatChannel, type ChatLine } from '@/game/chat';
import { RARITY_COLOR, type Rarity } from '@/lib/types';

const TAG: Record<ChatChannel, string> = { near: 'ใกล้', world: 'โลก', party: 'ปาร์ตี้', guild: 'กิลด์', whisper: 'กระซิบ', system: 'ระบบ' };
const HINT: Partial<Record<ChatChannel, string>> = {
  party: 'แชทปาร์ตี้เปิดพร้อมเซิร์ฟเวอร์ Realm', guild: 'คุยกับสมาชิกกิลด์ · ยังไม่มีกิลด์? เปิดเมนู กิลด์',
  system: 'ไอเทมดรอป · ดาเมจที่ทำ · ดาเมจที่ได้รับ', whisper: 'คลิกชื่อผู้เล่นเพื่อกระซิบ หรือพิมพ์ /w ชื่อ ข้อความ' };
const time = (t: number) => new Date(t).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

function Line({ l }: { l: ChatLine }) {
  const pick = () => { if (!l.from || l.mine) return; const c = useChatStore.getState(); c.setWhisperTo(l.from); c.setTab('whisper'); };
  if (l.ch === 'system') return <p className={`cb-l sys ${l.kind}`}><time>{time(l.at)}</time>
    <span style={l.kind === 'loot' && l.rarity ? { color: RARITY_COLOR[l.rarity as Rarity] } : undefined}>{l.text}</span></p>;
  return <p className={`cb-l ${l.ch} ${l.mine ? 'mine' : ''}`}><time>{time(l.at)}</time>
    {l.ch === 'whisper' ? <b className="who" onClick={pick}>{l.mine ? `ถึง ${l.to ?? ''}` : `${l.from} กระซิบ`}</b> : <b className="who" onClick={pick}>{l.from}</b>}
    <span>{l.text}</span></p>;
}

export default function ChatBox({ mobile }: { mobile: boolean }) {
  const { lines, unread, tab, open, whisperTo, setTab, setOpen, setWhisperTo } = useChatStore();
  const [text, setText] = useState(''), [err, setErr] = useState<string | null>(null), [busy, setBusy] = useState(false);
  const list = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null);
  const shown = lines[tab];
  // stay at the newest line unless the player scrolled up to read
  const stick = useRef(true);
  useEffect(() => { const el = list.current; if (el && stick.current) el.scrollTop = el.scrollHeight; }, [shown.length, tab, open]);
  // PC: Enter opens the input from the game, Esc goes back to the game
  useEffect(() => {
    if (mobile) return;
    const k = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || (e.target instanceof HTMLElement && e.target.closest('input,textarea,select'))) return;
      e.preventDefault(); input.current?.focus();
    };
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k);
  }, [mobile]);
  useEffect(() => { setErr(null); }, [tab]);
  // PC: bottom-left beside the potion row when the screen is wide enough, otherwise lifted just above it
  const box = useRef<HTMLElement>(null), [lift, setLift] = useState(0);
  useEffect(() => {
    if (mobile) return;
    const fit = () => {
      const el = box.current, d = document.querySelector('.pc-belt')?.getBoundingClientRect(); if (!el || !d) return;
      const s = parseFloat(getComputedStyle(el).zoom) || 1, right = el.getBoundingClientRect().right;
      setLift(d.left < right + 8 ? Math.ceil((window.innerHeight - d.top + 8) / s) : 0);
    };
    fit(); const t = setTimeout(fit, 600); window.addEventListener('resize', fit);
    return () => { clearTimeout(t); window.removeEventListener('resize', fit); };
  }, [mobile, open]);

  const send = async () => {
    if (busy || !text.trim()) return;
    setBusy(true); const r = await sendChat(tab, text, whisperTo); setBusy(false);
    setErr(r); if (!r) setText('');
  };
  const total = Object.entries(unread).reduce((a, [k, v]) => a + (k === 'system' ? 0 : v), 0);
  if (mobile && !open) return <button className="cb-fab pointer-events-auto" onClick={() => setOpen(true)} aria-label="เปิดแชท">
    <svg viewBox="0 0 24 24" aria-hidden><path d="M4 5h16v10H9l-4 4v-4H4z" /></svg>{total > 0 && <b>{total > 99 ? '99+' : total}</b>}</button>;

  return <section ref={box} className={`cb pointer-events-auto ${mobile ? 'full' : 'pc'}`} style={lift ? { bottom: lift } : undefined} role="log" aria-label="แชท">
    <header>
      <nav>{CHAT_TABS.map(t => <button key={t.id} className={`${t.id} ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
        {t.label}{unread[t.id] > 0 && tab !== t.id && <i>{unread[t.id] > 9 ? '9+' : unread[t.id]}</i>}</button>)}</nav>
      {mobile && <button className="sf-close" onClick={() => setOpen(false)} aria-label="ปิดแชท" />}
    </header>
    <div className="cb-list" ref={list} onScroll={e => { const el = e.currentTarget; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 24; }}>
      {!shown.length && <p className="cb-empty">{HINT[tab] ?? `ยังไม่มีข้อความใน ${TAG[tab]}`}</p>}
      {shown.map(l => <Line key={l.key} l={l} />)}
    </div>
    {tab !== 'system' && <form className="cb-in" onSubmit={e => { e.preventDefault(); void send(); }}>
      {tab === 'whisper' && <input className="to" value={whisperTo} onChange={e => setWhisperTo(e.target.value)} placeholder="ถึง…" maxLength={16} aria-label="ชื่อผู้รับ" />}
      <input ref={input} value={text} onChange={e => { setText(e.target.value); if (err) setErr(null); }} maxLength={200} enterKeyHint="send"
        placeholder={tab === 'party' ? HINT[tab] : `พิมพ์ใน ${TAG[tab]}…`} aria-label="ข้อความ"
        onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); e.currentTarget.blur(); } }} />
      <button type="submit" disabled={busy || !text.trim()}>ส่ง</button>
    </form>}
    {err && <p className="cb-err">{err}</p>}
  </section>;
}
