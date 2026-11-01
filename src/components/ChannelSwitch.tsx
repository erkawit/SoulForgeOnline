'use client';
// Round 16 — map channels. A button under the minimap shows the channel you are in (and how full it is); it opens a
// window in the middle of the screen listing every channel of this map (CH1…CH5) with a 10-tick density gauge (green →
// red) and its player count. Pick one, confirm, and the realm moves you there. Full channels and the one you are in
// cannot be picked; Confirm stays disabled until a channel is picked. The realm (apps/game-server/src/channels.ts)
// owns the rule: 100 players per channel, 5 channels per map, one move per 10 s.
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CITIES, type CityId } from '@/game/content';
import { gameConnection } from '@/lib/multiplayer/socket';
import { useGameStore } from '@/store/useGameStore';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';

export const CHANNELS_PER_MAP = 5;
export const CHANNEL_CAP = 100;
const TICKS = 10;
/** lit ticks for a channel: 0 when empty, at least 1 when anyone is there, 10 when full */
export const litTicks = (n: number, cap: number) => n <= 0 ? 0 : Math.min(TICKS, Math.max(1, Math.ceil(n / Math.max(1, cap) * TICKS)));
const tickColor = (i: number) => `hsl(${Math.round(120 - i * 120 / (TICKS - 1))} 78% 47%)`;
const loadText = (n: number, cap: number) => n >= cap ? 'เต็ม' : n / cap >= .8 ? 'หนาแน่น' : n / cap >= .4 ? 'ปานกลาง' : 'ว่าง';
const REASON: Record<string, string> = { CHANNEL_FULL: 'แชแนลนี้เต็มแล้ว ลองเลือกแชแนลอื่น', CHANNEL_COOLDOWN: 'เปลี่ยนแชแนลได้ครั้งละ 10 วินาที รอสักครู่แล้วลองใหม่', CHANNEL_UNAVAILABLE: 'เปลี่ยนแชแนลไม่ได้ในตอนนี้' };

function useChannelRows() {
  const ch = useMultiplayerStore(s => s.channel), cap = ch.cap ?? CHANNEL_CAP;
  const rows: [number, number][] = Array.from({ length: Math.max(CHANNELS_PER_MAP, ...ch.list.map(([c]) => c)) }, (_, i) => [i + 1, ch.list.find(([c]) => c === i + 1)?.[1] ?? 0]);
  return { ch, cap, rows };
}

export function DensityTicks({ n, cap, small = false }: { n: number; cap: number; small?: boolean }) {
  const lit = litTicks(n, cap);
  return <span className={`sf-ticks${small ? ' sm' : ''}`} role="meter" aria-label={`ความหนาแน่น ${lit}/${TICKS}`} aria-valuenow={n} aria-valuemax={cap}>
    {Array.from({ length: TICKS }, (_, i) => <i key={i} className={i < lit ? 'on' : ''} style={{ ['--c' as string]: tickColor(i) }} />)}</span>;
}

/** the button under the minimap */
export function ChannelButton() {
  const connected = useMultiplayerStore(s => s.connected), city = useGameStore(s => s.player.cityId ?? 'hollow');
  const { ch, cap, rows } = useChannelRows(), [open, setOpen] = useState(false);
  useEffect(() => { if (!connected) return; gameConnection.channels(); const t = setInterval(() => gameConnection.channels(), 15000); return () => clearInterval(t); }, [connected, city]);
  const here = rows.find(([c]) => c === ch.current)?.[1] ?? 0;
  return <>
    <button className="sf-ch-btn pointer-events-auto" onClick={() => setOpen(true)} title="เปลี่ยนแชแนล" aria-haspopup="dialog">
      <img src="/art/icons/menu/portal.webp" alt="" />
      <b>CH {ch.current}</b>
      {connected ? <><DensityTicks n={here} cap={cap} small /><small>{here}/{cap}</small></> : <small>ออฟไลน์</small>}
    </button>
    {open && <ChannelDialog onClose={() => setOpen(false)} />}
  </>;
}

/** the window in the middle of the screen */
export function ChannelDialog({ onClose }: { onClose: () => void }) {
  const connected = useMultiplayerStore(s => s.connected), status = useMultiplayerStore(s => s.status);
  const city = useGameStore(s => s.player.cityId ?? 'hollow') as CityId;
  const { ch, cap, rows } = useChannelRows();
  const [pick, setPick] = useState<number | null>(null), [going, setGoing] = useState<{ to: number; at: number } | null>(null), [err, setErr] = useState('');
  useEffect(() => { if (!connected) return; gameConnection.channels(); const t = setInterval(() => gameConnection.channels(), 5000); return () => clearInterval(t); }, [connected]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape' && !going) { e.stopPropagation(); onClose(); } }; window.addEventListener('keydown', k, true); return () => window.removeEventListener('keydown', k, true); }, [onClose, going]);
  // arrived: the realm reports the new channel → close; refused: show why
  useEffect(() => { if (going && ch.current === going.to) { const t = setTimeout(() => { setGoing(null); onClose(); }, 450); return () => clearTimeout(t); } }, [ch.current, going, onClose]);
  useEffect(() => { if (!going) return; const r = Object.keys(REASON).find(k => status === k); if (r) { setErr(REASON[r]); setGoing(null); setPick(null); } }, [status, going]);
  useEffect(() => { if (!going) return; const t = setTimeout(() => { setGoing(null); setErr('เซิร์ฟเวอร์ไม่ตอบกลับ ลองใหม่อีกครั้ง'); }, 6000); return () => clearTimeout(t); }, [going]);
  // a picked channel that filled up meanwhile is dropped
  useEffect(() => { if (pick && (rows.find(([c]) => c === pick)?.[1] ?? 0) >= cap) setPick(null); }, [rows, pick, cap]);
  const confirm = () => { if (!pick || !connected) return; setErr(''); useMultiplayerStore.getState().setState({ status: '' }); setGoing({ to: pick, at: Date.now() }); gameConnection.switchChannel(pick); };
  const mapName = CITIES[city]?.name ?? city;
  return createPortal(<div className="sf-ch-backdrop" onPointerDown={e => { if (e.target === e.currentTarget && !going) onClose(); }}>
    <section className="sf-ch-dialog" role="dialog" aria-modal="true" aria-labelledby="sf-ch-title">
      <header>
        <img className="sf-win-ico" src="/art/icons/menu/portal.webp" alt="" />
        <div><h2 id="sf-ch-title">เลือกแชแนล</h2><p>{mapName} · แชแนลละ {cap} คน</p></div>
        <button className="sf-close" aria-label="ปิด" title="ปิด (Esc)" onClick={onClose} disabled={!!going} />
      </header>
      {!connected && <p className="sf-ch-note">โหมดออฟไลน์ — เชื่อมต่อเซิร์ฟเวอร์ (Online Realm) ก่อนจึงจะเปลี่ยนแชแนลได้</p>}
      <div className="sf-ch-list" role="radiogroup" aria-label="แชแนล">
        {rows.map(([c, n]) => {
          const here = c === ch.current, full = n >= cap, off = !connected || here || full || !!going;
          return <button key={c} role="radio" aria-checked={pick === c} className={`sf-ch-row${pick === c ? ' picked' : ''}${here ? ' here' : ''}${full ? ' full' : ''}`} disabled={off} onClick={() => { setPick(c); setErr(''); }}>
            <span className="name">CH {c}{here && <em>อยู่ที่นี่</em>}</span>
            <DensityTicks n={n} cap={cap} />
            <span className="count"><b>{connected ? n : '–'}</b>/{cap}<small>{connected ? loadText(n, cap) : ''}</small></span>
          </button>;
        })}
      </div>
      {err && <p className="sf-ch-err" role="alert">{err}</p>}
      <footer>
        <button className="sf-btn ghost" onClick={onClose} disabled={!!going}>ยกเลิก</button>
        <button className="sf-btn" onClick={confirm} disabled={!pick || !connected || !!going}>{pick ? `ยืนยัน · ไป CH ${pick}` : 'ยืนยัน'}</button>
      </footer>
    </section>
    {going && <div className="sf-ch-loading" role="status"><img src="/art/icons/menu/portal.webp" alt="" /><b>กำลังโหลดเข้าสู่ CH {going.to}…</b><small>{mapName}</small></div>}
  </div>, document.body);
}
