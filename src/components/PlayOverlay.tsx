'use client';
import WorldMap from './WorldMap';
// In-game overlay added for the playable beta: cast bar + Archer charge gauge, party frames with class portraits,
// and the Party (P) and World Map (M) windows plus the Codex guide link (G → /guide in a new tab).
import { useEffect, useRef, useState } from 'react';
import { useGameStore, CHARGE_MAX_MS } from '@/store/useGameStore';
import { usePlayerStatic } from '@/store/usePlayerStatic';
import { useMultiplayerStore, type PartyMemberView } from '@/store/useMultiplayerStore';
import { gameConnection } from '@/lib/multiplayer/socket';
import { skillLib } from '@/store/useConfigStore';
import { CITIES, ZONE_IDS, type CityId } from '@/game/content';
import { natureLayout } from '@/game/world/layout';
import { npcsIn, npcPosition } from '@/game/npcs';

const CLASS_COLOR: Record<string, string> = { Berserker: '#ff4a3a', Reaver: '#c03cff' };
const CLASS_TH: Record<string, string> = { Berserker: 'เบอร์เซิร์กเกอร์', Reaver: 'รีเวอร์' };
const portrait = (cls: string, kind: 'face' | 'full' = 'face') => `/art/portraits/${cls.toLowerCase()}-${kind}.png`;
type Win = 'party' | 'map' | null; // settings live in the HUD window (SettingsPanel)

/** Cast bar (skills with a cast time) and the Archer's draw gauge, animated every frame without React re-renders. */
function CombatBars() {
  const cast = useRef<HTMLDivElement>(null), fill = useRef<HTMLElement>(null), label = useRef<HTMLSpanElement>(null), time = useRef<HTMLSpanElement>(null), tier = useRef<HTMLElement>(null);
  useEffect(() => {
    let raf = 0; const loop = () => {
      raf = requestAnimationFrame(loop); const s = useGameStore.getState(), el = cast.current; if (!el) return; const now = Date.now();
      const cls = s.player.classId ?? 'Berserker'; el.style.setProperty('--cc', CLASS_COLOR[cls]);
      if (s.pending) {
        const def = skillLib().defs.find(d => d.id === s.pending!.skillId), total = def?.castMs || 1, k = Math.min(1, 1 - (s.pending.at - now) / total);
        el.hidden = false; fill.current!.style.transform = `scaleX(${k})`; label.current!.textContent = `${def?.name ?? ''} · ${def?.th ?? ''}`;
        time.current!.textContent = `${Math.max(0, (s.pending.at - now) / 1000).toFixed(1)}s`; tier.current!.textContent = 'เดินเพื่อยกเลิก';
      } else if (s.charge) {
        const k = Math.min(1, (now - s.charge.start) / CHARGE_MAX_MS); el.hidden = now - s.charge.start < 160;
        fill.current!.style.transform = `scaleX(${k})`; label.current!.textContent = 'ง้างสายธนู'; time.current!.textContent = `×${(1 + 2 * k).toFixed(1)}`;
        tier.current!.textContent = k >= 1 ? 'เต็มกำลัง! ปล่อยเพื่อคริติคอลแน่นอน' : k > .66 ? 'ง้างสุด…' : k > .33 ? 'ง้างลึก' : 'เริ่มง้าง';
      } else el.hidden = true;
    }; raf = requestAnimationFrame(loop); return () => cancelAnimationFrame(raf);
  }, []);
  return <div ref={cast} className="sf-cast" hidden><div className="lbl"><span ref={label} /><span ref={time} /></div><div className="t"><i ref={fill} /><div className="ticks"><b /><b /><b /></div></div><small ref={tier} /></div>;
}

function PartyFrames() {
  const party = useMultiplayerStore(s => s.party), me = useMultiplayerStore(s => s.playerId);
  if (!party) return null;
  return <div className="sf-party">{party.members.filter(m => m.id !== me).map(m => <Member key={m.id} m={m} leader={party.leader === m.id} />)}</div>;
}
function Member({ m, leader }: { m: PartyMemberView; leader: boolean }) {
  const hp = m.maxHp ? m.hp! / m.maxHp : 1, mp = m.maxMp ? m.mp! / m.maxMp : 1;
  return <div className={`sf-pm${m.online ? '' : ' off'}`} style={{ borderColor: CLASS_COLOR[m.classId] }}><img src={portrait(m.classId)} alt="" />
    <div><b>{leader ? '♛ ' : ''}{m.name}</b> <small style={{ color: CLASS_COLOR[m.classId] }}>{CLASS_TH[m.classId]}{m.level ? ` · Lv.${m.level}` : ''}</small>
      {m.online ? <><div className="bar hp"><i style={{ width: `${hp * 100}%` }} /></div><div className="bar mp"><i style={{ width: `${mp * 100}%` }} /></div></> : <div className="wait">⟳ กำลังเชื่อมต่อใหม่ · จองที่ไว้ {m.graceLeft} วิ</div>}</div></div>;
}

/** round 13: city channels — this character's channel, the others in its city, and a move (the realm allows one per 10 s) */
function ChannelPicker() {
  const ch = useMultiplayerStore(s => s.channel);
  useEffect(() => { gameConnection.channels(); const t = setInterval(() => gameConnection.channels(), 15000); return () => clearInterval(t); }, []);
  const open = ch.list.length ? Math.max(...ch.list.map(([c]) => c)) : 1, rows: [number, number][] = [...ch.list, ...(ch.list.some(([c]) => c === open + 1) ? [] : [[open + 1, 0] as [number, number]])];
  return <div style={{ marginTop: 12 }}><h3 className="sf-h2" style={{ fontSize: 14, margin: '0 0 6px' }}>แชนแนลของเมือง · อยู่ที่ CH{ch.current}</h3>
    <div className="npc-chips">{rows.map(([c, n]) => <button key={c} className={c === ch.current ? 'on' : ''} disabled={c === ch.current} onClick={() => gameConnection.switchChannel(c)}>CH{c} <small>{n ? `${n} คน` : 'ว่าง'}</small></button>)}</div>
    <p className="sf-muted">เห็นเฉพาะผู้เล่นในแชนแนลเดียวกัน · ปาร์ตี้จะถูกพาเข้าแชนแนลเดียวกันเมื่อเข้าเมือง · บอสโลกและตลาดใช้ร่วมกันทุกแชนแนล</p></div>;
}

function PartyWindow() {
  const party = useMultiplayerStore(s => s.party), me = useMultiplayerStore(s => s.playerId), connected = useMultiplayerStore(s => s.connected), players = useMultiplayerStore(s => s.players), invite = useMultiplayerStore(s => s.partyInvite);
  const self = usePlayerStatic();
  const members: PartyMemberView[] = party?.members ?? [{ id: me ?? 'me', name: self.name, classId: self.classId ?? 'Berserker', online: true, graceLeft: 0, level: self.level }];
  return <>
    <div className="sf-cards">{members.map(m => <div key={m.id} className="sf-card" style={{ ['--cc' as string]: CLASS_COLOR[m.classId] }}>
      <img src={portrait(m.classId, 'full')} alt={m.classId} style={m.online ? undefined : { filter: 'grayscale(1) brightness(.6)' }} />
      <h3>{party?.leader === m.id ? '♛ ' : ''}{m.name}{m.id === me ? ' (คุณ)' : ''}</h3><div className="cls">{CLASS_TH[m.classId]} · {m.classId}{m.level ? ` · Lv.${m.level}` : ''}</div>
      <div className="st" style={{ color: m.online ? '#7fd69a' : '#ffb15a' }}>{m.online ? '● ออนไลน์' : `⟳ หลุดการเชื่อมต่อ · จองที่ไว้ ${m.graceLeft} วิ`}</div>
      {party && party.leader === me && m.id !== me && <button className="sf-btn ghost" onClick={() => gameConnection.party.kick(m.id)}>นำออก</button>}
    </div>)}</div>
    {invite && <p className="sf-muted">คำเชิญจาก <b>{invite.name}</b> ({CLASS_TH[invite.classId]}) <button className="sf-btn" onClick={() => gameConnection.party.accept()}>เข้าร่วม</button> <button className="sf-btn ghost" onClick={() => gameConnection.party.decline()}>ปฏิเสธ</button></p>}
    {connected ? <div style={{ marginTop: 12 }}>
      <ChannelPicker />
      {party && <button className="sf-btn ghost" onClick={() => gameConnection.party.leave()}>ออกจากปาร์ตี้</button>}
      <h3 className="sf-h2" style={{ fontSize: 14, margin: '14px 0 6px' }}>ผู้เล่นใกล้เคียง</h3>
      {players.filter(p => p.id !== me && !members.some(m => m.id === p.id)).slice(0, 8).map(p => <div key={p.id} className="row"><span>ผู้เล่น {p.id.slice(0, 6)} · Lv.{p.level}</span><button className="sf-btn" onClick={() => gameConnection.party.invite(p.id)}>เชิญเข้าปาร์ตี้</button></div>)}
    </div> : <p className="sf-muted" style={{ marginTop: 12 }}>ปาร์ตี้ใช้ได้ในโลกออนไลน์ — เชื่อมต่อจากเมนู Online ก่อน</p>}
    <p className="sf-muted" style={{ marginTop: 12 }}><b>กันปาร์ตี้หลุด:</b> ปาร์ตี้เก็บที่เซิร์ฟเวอร์และฐานข้อมูล · เน็ตหลุด/รีเฟรช ระบบเชื่อมต่อใหม่อัตโนมัติและจองที่ไว้ 120 วินาที · หัวหน้าหลุดจะโอนหัวหน้าหลังพ้นเวลาจองเท่านั้น · เซิร์ฟเวอร์รีสตาร์ทก็กู้ปาร์ตี้คืน</p>
  </>;
}

export default function PlayOverlay() {
  const [win, setWin] = useState<Win>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.closest('input,textarea,select') || e.target.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (k === 'p') setWin(w => w === 'party' ? null : 'party'); if (k === 'm') setWin(w => w === 'map' ? null : 'map');
      if (k === 'g') window.open('/wiki', '_blank', 'noopener'); if (e.key === 'Escape') setWin(null);
    };
    // the main menu (GameHUD) opens these windows too — the separate button row was removed from the game screen
    const open = (e: Event) => { const w = (e as CustomEvent<string>).detail; if (w === 'party' || w === 'map') setWin(v => v === w ? null : w); };
    window.addEventListener('keydown', key); window.addEventListener('sf-open-win', open);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('sf-open-win', open); };
  }, []);
  return <>
    <CombatBars /><PartyFrames />
    {win && <section className={win === 'map' ? 'sf-win sf-atlas' : 'sf-win'} style={{ ['--w' as string]: win === 'map' ? '980px' : '860px' }} role="dialog" aria-label={win}>
      <header><h2>{win === 'party' ? 'ปาร์ตี้' : 'แผนที่โลก'}</h2><button className="sf-close" aria-label="ปิด" title="ปิด" onClick={() => setWin(null)} /></header>
      {win === 'party' && <PartyWindow />}{win === 'map' && <WorldMap onWalk={() => setWin(null)} />}
    </section>}
  </>;
}
