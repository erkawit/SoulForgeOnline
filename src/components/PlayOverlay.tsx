'use client';
// In-game overlay added for the playable beta: cast bar + Archer charge gauge, party frames with class portraits,
// and the Party (P), World Map (M), Settings (O) windows plus the Codex guide link (G → /guide in a new tab).
import { useEffect, useRef, useState } from 'react';
import { useGameStore, CHARGE_MAX_MS } from '@/store/useGameStore';
import { useMultiplayerStore, type PartyMemberView } from '@/store/useMultiplayerStore';
import { useSettingsStore, type Quality } from '@/store/useSettingsStore';
import { gameConnection } from '@/lib/multiplayer/socket';
import { skillLib } from '@/store/useConfigStore';
import { CITIES, ZONE_IDS, type CityId } from '@/game/content';
import { natureLayout } from '@/game/world/layout';
import { npcsIn, npcPosition } from '@/game/npcs';

const CLASS_COLOR: Record<string, string> = { Berserker: '#ff4a3a', Reaver: '#c03cff' };
const CLASS_TH: Record<string, string> = { Berserker: 'เบอร์เซิร์กเกอร์', Reaver: 'รีเวอร์' };
const portrait = (cls: string, kind: 'face' | 'full' = 'face') => `/art/portraits/${cls.toLowerCase()}-${kind}.png`;
type Win = 'party' | 'map' | 'settings' | null;

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
  const self = useGameStore(s => s.player);
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

function WorldMap() {
  const city = useGameStore(s => s.player.cityId ?? 'hollow') as CityId; const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0; const c = ref.current!.getContext('2d')!, S = 720, k = S / 50, X = (x: number) => S / 2 + x * k, Z = (z: number) => S / 2 + z * k, info = CITIES[city], layout = natureLayout(city);
    const draw = () => {
      raf = requestAnimationFrame(draw); const s = useGameStore.getState();
      c.fillStyle = '#0c0d12'; c.fillRect(0, 0, S, S); c.fillStyle = '#1d1f26'; c.fillRect(X(-23), Z(-23), 46 * k, 46 * k);
      if (!info.parent) { c.fillStyle = '#2b2b31'; c.fillRect(X(-2.8), Z(-23), 5.6 * k, 46 * k); c.fillRect(X(-23), Z(-2.5), 46 * k, 5 * k); c.strokeStyle = '#62d7cb'; c.setLineDash([6, 6]); c.beginPath(); c.arc(X(0), Z(0), 7.4 * k, 0, 6.28); c.stroke(); c.setLineDash([]); }
      c.fillStyle = '#26382a'; for (const t of layout.trees) { c.beginPath(); c.arc(X(t.x), Z(t.z), .9 * t.s * k, 0, 6.28); c.fill(); }
      c.fillStyle = '#4b4752'; for (const b of info.buildings) c.fillRect(X(b.x - b.w / 2), Z(b.z - b.d / 2), b.w * k, b.d * k);
      if (!info.parent) { c.font = '700 16px Georgia'; c.textAlign = 'center'; for (const n of npcsIn(info.id)) { const [x, z] = npcPosition(n, info.id); c.fillStyle = n.color; c.fillText(n.icon, X(x), Z(z) + 5); } }
      for (const m of s.monsters) if (m.hp > 0) { c.fillStyle = m.boss ? '#ff9a3c' : '#e0453a'; c.beginPath(); c.arc(X(m.x), Z(m.z), m.boss ? 6 : 3.5, 0, 6.28); c.fill(); }
      for (const p of useMultiplayerStore.getState().party?.members ?? []) if (p.x != null) { c.fillStyle = '#7fd69a'; c.beginPath(); c.arc(X(p.x), Z(p.z!), 5, 0, 6.28); c.fill(); }
      const [px, pz] = s.player.position; c.fillStyle = '#f2d58a'; c.beginPath(); c.arc(X(px), Z(pz), 7, 0, 6.28); c.fill(); c.strokeStyle = '#000'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#f2e3bf'; c.font = '700 22px Cinzel, Georgia'; c.textAlign = 'left'; c.fillText(info.name.toUpperCase(), 18, 36);
    }; draw(); return () => cancelAnimationFrame(raf);
  }, [city]);
  const caps: CityId[] = ['hollow', 'dawnveil', 'thornwatch'];
  return <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 240px', gap: 14 }}>
    <canvas ref={ref} width={720} height={720} style={{ width: '100%', aspectRatio: '1', border: '1px solid var(--sf-line)', borderRadius: 4 }} />
    <div style={{ maxHeight: '64dvh', overflow: 'auto' }}>{caps.map(c => <div key={c}><b>{CITIES[c].name}</b><p className="sf-muted">{CITIES[c].subtitle}</p>
      {ZONE_IDS.filter(z => CITIES[z].parent === c).map(z => <p key={z} className="sf-muted" style={{ paddingLeft: 10 }}>{CITIES[z].name} · Lv.{CITIES[z].levels?.[0]}–{CITIES[z].levels?.[1]}</p>)}</div>)}</div>
  </div>;
}

function SettingsWindow() {
  const s = useSettingsStore(); const seg = (v: Quality, t: string) => <button aria-pressed={s.quality === v} onClick={() => s.set({ quality: v })}>{t}</button>;
  const sw = (k: 'shadows' | 'damageNumbers', t: string) => <label className="row"><span>{t}</span><input type="checkbox" checked={s[k]} onChange={e => s.set({ [k]: e.target.checked })} /></label>;
  return <>
    <div className="row"><span>คุณภาพกราฟิก<small>จำนวนหญ้า ใบไม้ เงา</small></span><span className="sf-seg">{seg('low', 'ต่ำ')}{seg('medium', 'กลาง')}{seg('high', 'สูง')}</span></div>
    {sw('shadows', 'เงาแบบเรียลไทม์')}{sw('damageNumbers', 'ตัวเลขดาเมจ')}
    <label className="row"><span>แรงลม<small>ต้นไม้และหญ้าไหวตามลม</small></span><input type="range" min={0} max={1.2} step={.05} value={s.wind} onChange={e => s.set({ wind: +e.target.value })} /></label>
    <label className="row"><span>ทิศลม</span><input type="range" min={0} max={360} step={5} value={s.windDir} onChange={e => s.set({ windDir: +e.target.value })} /></label>
    <button className="sf-btn ghost" onClick={() => s.reset()}>คืนค่าเริ่มต้น</button>
  </>;
}

// touch controls (joystick + attack wheel) now belong to MobileHUDLayout (components/hud)

export default function PlayOverlay() {
  const [win, setWin] = useState<Win>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.closest('input,textarea,select') || e.target.isContentEditable)) return;
      const k = e.key.toLowerCase();
      if (k === 'p') setWin(w => w === 'party' ? null : 'party'); if (k === 'm') setWin(w => w === 'map' ? null : 'map'); if (k === 'o') setWin(w => w === 'settings' ? null : 'settings');
      if (k === 'g') window.open('/wiki', '_blank', 'noopener'); if (e.key === 'Escape') setWin(null);
    };
    // the main menu (GameHUD) opens these windows too — the separate button row was removed from the game screen
    const open = (e: Event) => { const w = (e as CustomEvent<string>).detail; if (w === 'party' || w === 'map' || w === 'settings') setWin(v => v === w ? null : w); };
    window.addEventListener('keydown', key); window.addEventListener('sf-open-win', open);
    return () => { window.removeEventListener('keydown', key); window.removeEventListener('sf-open-win', open); };
  }, []);
  return <>
    <CombatBars /><PartyFrames />
    {win && <section className="sf-win" style={{ ['--w' as string]: win === 'map' ? '980px' : win === 'party' ? '860px' : '620px' }} role="dialog" aria-label={win}>
      <header><h2>{win === 'party' ? 'ปาร์ตี้' : win === 'map' ? 'แผนที่โลก' : 'ตั้งค่า'}</h2><button className="sf-close" aria-label="ปิด" title="ปิด" onClick={() => setWin(null)} /></header>
      {win === 'party' && <PartyWindow />}{win === 'map' && <WorldMap />}{win === 'settings' && <SettingsWindow />}
    </section>}
  </>;
}
