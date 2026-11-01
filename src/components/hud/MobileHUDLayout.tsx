'use client';
// MobileHUDLayout (< 768 px, or a phone held sideways): mini HP / MP bars + level tag top-left, joystick bottom-left,
// touch wheel bottom-right (big attack + 4 skills, a page toggle for 5–6), compact potion / AUTO / menu buttons.
import { skillIconStyle } from '@/game/skills/icons';
import { useRef, useState } from 'react';
import { Swords } from 'lucide-react';
import { useGameStore, countOf, expRequired } from '@/store/useGameStore';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { touchMove } from '@/store/touchInput';
import { KEYS, CLASS_COLOR, basicDown, basicUp, castSlot, fmt, useSkillSlots, ForgeGauge } from './common';

const RING4: [number, number][] = [[104, 180], [104, 148], [104, 116], [104, 86]];
const at = ([r, a]: [number, number]) => ({ ['--x' as string]: `${Math.cos(a * Math.PI / 180) * r}px`, ['--y' as string]: `${-Math.sin(a * Math.PI / 180) * r}px` });

function Joystick() {
  const knob = useRef<HTMLElement>(null);
  const move = (e: React.PointerEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } touchMove.x = x; touchMove.y = y; if (knob.current) knob.current.style.transform = `translate(${x * 38}px, ${y * 38}px)`; };
  const end = () => { touchMove.x = 0; touchMove.y = 0; if (knob.current) knob.current.style.transform = ''; };
  return <div className="h3-stick pointer-events-auto" onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); move(e); }} onPointerMove={e => { if (e.buttons || e.pointerType === 'touch') move(e); }} onPointerUp={end} onPointerCancel={end} aria-label="จอยสติ๊กเดิน"><i ref={knob} /></div>;
}
export default function MobileHUDLayout({ hp, maxHp, mp, maxMp, now, menuOpen, onMenu, onStatus }: { hp: number; maxHp: number; mp: number; maxMp: number; now: number; menuOpen: boolean; onMenu: () => void; onStatus: () => void }) {
  const player = useGameStore(s => s.player), inventory = useGameStore(s => s.inventory), auto = useGameStore(s => s.auto), online = useMultiplayerStore(s => s.online);
  const [page, setPage] = useState(0); const cls = player.classId ?? 'Berserker';
  const slots = useSkillSlots(now, mp), shown = page ? slots.slice(4, 6) : slots.slice(0, 4);
  const hpCount = ['potion-hp-l', 'potion-hp-m', 'potion-hp-s'].reduce((a, id) => a + countOf(inventory, id), 0);
  const k = (v: number, m: number) => Math.max(0, Math.min(1, v / Math.max(1, m)));
  return <>
    <section className={`h3-mframe pointer-events-auto ${k(hp, maxHp) < .3 ? 'low' : ''}`} onClick={onStatus}>
      <span className="lv">{player.level}</span>
      <div className="col"><div className="nm">{player.name}</div>
        <div className="mbar hp"><i style={{ transform: `scaleX(${k(hp, maxHp)})` }} /><span>{fmt(hp)}/{fmt(maxHp)}</span></div>
        <div className="mbar mp"><i style={{ transform: `scaleX(${k(mp, maxMp)})` }} /><span>{fmt(mp)}/{fmt(maxMp)}</span></div><ForgeGauge mini /></div>
    </section>
    <div className="h3-mxp"><i style={{ transform: `scaleX(${Math.min(1, player.exp / expRequired(player.level))})` }} /></div>
    <Joystick />
    <div className="h3-mbtns pointer-events-auto">
      <button className={`mb ${hpCount ? '' : 'empty'}`} onPointerDown={e => { e.preventDefault(); useGameStore.getState().usePotion('hp'); }} aria-label="ยา HP">🧪<b className="q">{hpCount}</b></button>
      <button className={`mb auto ${auto.enabled ? 'on' : ''}`} onClick={() => useGameStore.getState().setAuto(!auto.enabled)}><b>AUTO</b><small>{auto.enabled ? 'เปิด' : 'ปิด'}</small></button>
      <button className={`mb ${menuOpen ? 'on' : ''}`} onClick={onMenu} aria-label="เมนู">☰</button>
    </div>
    <div className="h3-wheel pointer-events-auto" style={{ ['--cc' as string]: CLASS_COLOR[cls] }}>
      <button className="basic" onPointerDown={e => { e.preventDefault(); basicDown(); }} onPointerUp={basicUp} onPointerCancel={basicUp} aria-label="โจมตี"><Swords size={34} /><span>โจมตี</span></button>
      {shown.map((s, j) => <button key={s.i} className={`sk ${s.off ? 'off' : ''} ${s.nomp ? 'nomp' : ''}`} style={at(RING4[j])} title={s.title} onPointerDown={e => { e.preventDefault(); castSlot(s.i); }}>
        <span className="g">{s.glyph}</span><i className="ic" aria-hidden style={skillIconStyle(s.shows)} /><b className="k">{KEYS[s.i]}</b>{s.left > 0 && <span className="cd" style={{ ['--p' as string]: `${Math.min(100, s.left / s.total * 100)}%` }}><b>{Math.ceil(s.left / 1000)}</b></span>}</button>)}
      <button className="page" style={at([172, 134])} onPointerDown={e => { e.preventDefault(); setPage(p => p ^ 1); }} aria-label="สลับหน้าสกิล"><b>{page ? '1–4' : '5–6'}</b><small>สกิล</small></button>
    </div>
  </>;
}
