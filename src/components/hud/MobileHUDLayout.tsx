'use client';
// Round 22 touch controller — one component set for phones and tablets, laid out for the way the device is held
// (styles: src/styles/touch-controls.css, scoped under .h2.touch.portrait / .h2.touch.landscape on the HUD root).
//   · status frame top-left (tap → status), EXP line along the bottom edge
//   · floating joystick: touch anywhere in the lower-left zone and the stick appears under the thumb; let go and it
//     returns to its resting spot. A small dead zone stops drift; it keeps tracking the same finger (multi-touch safe)
//   · action cluster bottom-right: big attack button, skills on an arc around it — portrait shows 4 + a page chip for
//     5–6, landscape has the room for all 6 at once. Cooldown sweep, MP warning and a short vibration on press
//   · quick row above the joystick: HP potion, MP potion, AUTO, next target, menu
import { lockOrientation } from '@/game/ui/orientation';
import { skillIconStyle } from '@/game/skills/icons';
import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Swords } from 'lucide-react';
import { useGameStore, countOf, expRequired } from '@/store/useGameStore';
import { usePlayerStatic } from '@/store/usePlayerStatic';
import { touchMove } from '@/store/touchInput';
import { KEYS, CLASS_COLOR, basicDown, basicUp, castSlot, fmt, useSkillSlots, useOrientation, crest } from './common';

/** [radius px, angle°] from the attack button's centre (0° = right, 90° = up) */
const ARC: Record<'portrait' | 'landscape', [number, number][]> = {
  portrait: [[108, 180], [108, 148], [108, 116], [108, 84]],
  landscape: [[100, 180], [100, 150], [100, 120], [100, 90], [166, 166], [166, 132]],
};
const PAGE_CHIP: [number, number] = [168, 95];
const at = ([r, a]: [number, number]) => ({ ['--x' as string]: `${Math.cos(a * Math.PI / 180) * r}px`, ['--y' as string]: `${-Math.sin(a * Math.PI / 180) * r}px` });
const buzz = (ms = 12) => { try { navigator.vibrate?.(ms); } catch { /* not supported (iOS) */ } };

const STICK_R = 54, DEAD = 0.12;
function FloatingStick() {
  const base = useRef<HTMLSpanElement>(null), knob = useRef<HTMLElement>(null), finger = useRef<number | null>(null), centre = useRef<[number, number]>([0, 0]);
  const place = (x: number, y: number) => { const b = base.current; if (b) { b.style.left = `${x}px`; b.style.top = `${y}px`; b.classList.add('live'); } };
  const steer = (cx: number, cy: number) => {
    let dx = (cx - centre.current[0]) / STICK_R, dy = (cy - centre.current[1]) / STICK_R; const l = Math.hypot(dx, dy);
    if (l > 1) { dx /= l; dy /= l; }
    const on = l > DEAD; touchMove.x = on ? dx : 0; touchMove.y = on ? dy : 0;
    if (knob.current) knob.current.style.transform = `translate(${dx * STICK_R * .72}px, ${dy * STICK_R * .72}px)`;
  };
  const release = () => {
    finger.current = null; touchMove.x = 0; touchMove.y = 0; if (knob.current) knob.current.style.transform = '';
    const b = base.current; if (b) { b.style.left = ''; b.style.top = ''; b.classList.remove('live'); }
  };
  return <div className="tc-stickzone pointer-events-auto" aria-label="จอยสติ๊กเดิน — แตะค้างตรงไหนก็ได้ในโซนล่างซ้าย"
    onPointerDown={e => {
      if (finger.current !== null) return; finger.current = e.pointerId; try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      const r = e.currentTarget.getBoundingClientRect(), m = STICK_R + 6;
      const x = Math.min(r.width - m, Math.max(m, e.clientX - r.left)), y = Math.min(r.height - m, Math.max(m, e.clientY - r.top));
      centre.current = [r.left + x, r.top + y]; place(x, y); steer(e.clientX, e.clientY);
    }}
    onPointerMove={e => { if (e.pointerId === finger.current) steer(e.clientX, e.clientY); }}
    onPointerUp={e => { if (e.pointerId === finger.current) release(); }} onPointerCancel={e => { if (e.pointerId === finger.current) release(); }}
    onLostPointerCapture={e => { if (e.pointerId === finger.current) release(); }}>
    <span ref={base} className="tc-stick"><i ref={knob} /></span>
  </div>;
}

/** next living monster by distance (within 22 m), after the one already selected */
function nextTarget() {
  const st = useGameStore.getState(), [px, pz] = st.player.position;
  const near = st.monsters.filter(m => m.hp > 0).map(m => ({ m, d: Math.hypot(m.x - px, m.z - pz) })).filter(x => x.d < 22).sort((a, b) => a.d - b.d);
  if (!near.length) { st.selectMonster(null); return; }
  const i = near.findIndex(x => x.m.id === st.selectedMonster); st.selectMonster(near[(i + 1) % near.length].m.id);
}

export default function MobileHUDLayout({ hp, maxHp, mp, maxMp, now, menuOpen, onMenu, onStatus }: { hp: number; maxHp: number; mp: number; maxMp: number; now: number; menuOpen: boolean; onMenu: () => void; onStatus: () => void }) {
  const player = usePlayerStatic(), inventory = useGameStore(s => s.inventory), auto = useGameStore(s => s.auto), target = useGameStore(s => s.selectedMonster);
  const o = useOrientation(); const [page, setPage] = useState(0); const cls = player.classId ?? 'Berserker';
  const slots = useSkillSlots(now, mp), shown = o === 'landscape' ? slots.slice(0, 6) : page ? slots.slice(4, 6) : slots.slice(0, 4);
  const hpCount = ['potion-hp-l', 'potion-hp-m', 'potion-hp-s'].reduce((a, id) => a + countOf(inventory, id), 0);
  const mpCount = ['potion-mp-m', 'potion-mp-s'].reduce((a, id) => a + countOf(inventory, id), 0);
  const k = (v: number, m: number) => Math.max(0, Math.min(1, v / Math.max(1, m)));
  // portrait ⇄ landscape: lock where the browser allows it, otherwise ask the player to turn the phone
  const [rotHint, setRotHint] = useState('');
  useEffect(() => { const h = () => void rotate(); window.addEventListener('sf-rotate', h); return () => window.removeEventListener('sf-rotate', h); });
  const rotate = async () => {
    const want = o === 'portrait' ? 'landscape' : 'portrait';
    const r = await lockOrientation(want);
    if (r === 'unsupported') { setRotHint(`หมุนเครื่องเป็น${want === 'landscape' ? 'แนวนอน' : 'แนวตั้ง'} (ปิดล็อกการหมุนจอก่อน) — เกมจะจัดปุ่มให้เอง`); setTimeout(() => setRotHint(''), 3500); }
  };
  const tap = (fn: () => void) => (e: RPointerEvent) => { e.preventDefault(); e.stopPropagation(); buzz(); fn(); };
  return <>
    <section className={`h3-mframe tc-frame pointer-events-auto ${k(hp, maxHp) < .3 ? 'low' : ''}`} onClick={onStatus} aria-label="สถานะตัวละคร">
      <span className="kit-pt" style={{ backgroundImage: `url(${crest(cls)})` }} title={cls}><span className="lv">{player.level}</span></span>
      <div className="col"><div className="nm">{player.name}</div>
        <div className="mbar hp"><i style={{ transform: `scaleX(${k(hp, maxHp)})` }} /><span>{fmt(hp)}/{fmt(maxHp)}</span></div>
        <div className="mbar mp"><i style={{ transform: `scaleX(${k(mp, maxMp)})` }} /><span>{fmt(mp)}/{fmt(maxMp)}</span></div></div>
    </section>
    <div className="h3-mxp"><i style={{ transform: `scaleX(${Math.min(1, player.exp / expRequired(player.level))})` }} /></div>
    <FloatingStick />
    <div className="tc-quick pointer-events-auto">
      <button className={`tq ${hpCount ? '' : 'empty'}`} onPointerDown={tap(() => useGameStore.getState().usePotion('hp'))} aria-label="ยา HP"><span className="ico hp" /><b className="q">{hpCount}</b></button>
      <button className={`tq ${mpCount ? '' : 'empty'}`} onPointerDown={tap(() => useGameStore.getState().usePotion('mp'))} aria-label="ยา MP"><span className="ico mp" /><b className="q">{mpCount}</b></button>
      <button className={`tq auto ${auto.enabled ? 'on' : ''}`} onPointerDown={tap(() => useGameStore.getState().setAuto(!auto.enabled))} aria-pressed={auto.enabled} aria-label="ล่าอัตโนมัติ"><b className="atx">AUTO</b><small>{auto.enabled ? 'เปิด' : 'ปิด'}</small></button>
      <button className={`tq ${target ? 'on' : ''}`} onPointerDown={tap(nextTarget)} aria-label="เปลี่ยนเป้าหมาย"><span className="ico tgt" /><small>เป้า</small></button>
      <button className={`tq ${menuOpen ? 'on' : ''}`} onClick={onMenu} aria-label="เมนู" aria-expanded={menuOpen}><span className="ico menu" /><small>เมนู</small></button>
    </div>
    {rotHint && <div className="tc-rot-hint" role="status">{rotHint}</div>}
    <div className="tc-act pointer-events-auto" style={{ ['--cc' as string]: CLASS_COLOR[cls] ?? '#c89b3c' }}>
      <button className="basic" onPointerDown={e => { e.preventDefault(); buzz(8); basicDown(); }} onPointerUp={basicUp} onPointerCancel={basicUp} aria-label="โจมตี"><Swords size={32} className="sw" /><span>โจมตี</span></button>
      {shown.map((s, j) => <button key={s.i} className={`sk ${s.off ? 'off' : ''} ${s.nomp ? 'nomp' : ''}`} style={at(ARC[o][j])} title={s.title} aria-label={s.name}
        onPointerDown={tap(() => castSlot(s.i))}>
        <span className="g">{s.glyph}</span><i className="ic" aria-hidden style={skillIconStyle(s.shows)} /><b className="k">{s.i}</b>
        {s.left > 0 && <span className="cd" style={{ ['--p' as string]: `${Math.min(100, s.left / s.total * 100)}%` }}><b>{Math.ceil(s.left / 1000)}</b></span>}</button>)}
      {o === 'portrait' && <button className="page" style={at(PAGE_CHIP)} onPointerDown={tap(() => setPage(p => p ^ 1))} aria-label="สลับหน้าสกิล"><b>{page ? '1–4' : '5–6'}</b></button>}
    </div>
  </>;
}
