'use client';
// Login / sign-up backdrop (round 16): the Berserker in the Thai attire, male + female (3D-rendered rigs, grey A06 hair),
// as 2.5D sprites on rune pedestals. Wide column → all eight in one row; pointing at one plays a move, clicking brings it to the front. Narrow column (< 768 px,
// phones) → one hero at a time: swipe left / right, click either side, use the arrows, dots or ← → keys.
import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { type ClassId } from '@/game/content';
import { type PromotionId } from '@/game/advancement';
import type { CharacterClip } from '@/game/characterModels';
import AnimatedCharacter from '../AnimatedCharacter';
import { CLASS_GLOW, type Gender } from '@/game/sprites/catalog';
import { useSettingsStore } from '@/store/useSettingsStore';
import FrameCap from '../FrameCap';

type Pick = { key: string; cls: ClassId; g: Gender; promotion?: PromotionId; th: string; role: string; glow: string; costume?: string; hair?: string; hairColor?: string };
// round 22: every class (male, painted 8-way sheets), all facing the camera
const ROSTER: [ClassId, string, string][] = [['Paladin', 'พาลาดิน', 'ดาบ · โล่'], ['Berserker', 'เบอร์เซิร์กเกอร์', 'ดาบใหญ่สองมือ'], ['Hawkeye', 'ฮอว์คอาย', 'ธนูยาว'],
  ['RuneMaster', 'รูนมาสเตอร์', 'ดาบเวท · เสาอักขระ'], ['Elementalist', 'เอเลเมนทัลลิสต์', 'ไฟ · น้ำแข็ง · สายฟ้า'], ['Assassin', 'แอสซาซิน', 'มีดคู่'],
  ['HighPriest', 'ไฮพรีสต์', 'ฮีล · บัฟ'], ['Inquisitor', 'อินควิซิเตอร์', 'ค้อน · สายฟ้า']];
const LINEUP: Pick[] = ROSTER.map(([cls, th, role]) => ({ key: cls, cls, g: 'm', th, role, glow: CLASS_GLOW[cls] }));
const N = LINEUP.length, MID = (N - 1) / 2;
const X = LINEUP.map((_, i) => (i - MID) * 1.08), FRONT_Z = 2.6;

/** one hero on its pedestal: hover / touch → plays a move; selected → steps forward (bigger) and swings once */
function Hero({ p, i, selected, solo, onPick }: { p: Pick; i: number; selected: boolean; solo: boolean; onPick: (i: number) => void }) {
  const [clip, setClip] = useState<CharacterClip>('Idle'); const [stamp, setStamp] = useState(0); const [hover, setHover] = useState(false);
  const body = useRef<Group>(null);
  const act = (c: CharacterClip, ms: number) => { setClip(c); setStamp(Date.now()); const t = setTimeout(() => setClip('Idle'), ms); return () => clearTimeout(t); };
  useEffect(() => { if (hover && !selected) return act('Attack', 1400); }, [hover, selected]);
  useEffect(() => { if (selected) return act('Skill', 1800); }, [selected]);
  // glide toward the front slot (and back) instead of jumping
  useFrame((_, dt) => { const g = body.current; if (!g) return; const front = selected && !solo;
    const tx = solo ? 0 : X[i] * (front ? 0 : 1), tz = front ? FRONT_Z : 0, ts = front ? 1.35 : 1, k = 1 - Math.exp(-dt * 6);
    g.position.x += (tx - g.position.x) * k; g.position.z += (tz - g.position.z) * k; g.scale.setScalar(g.scale.x + (ts - g.scale.x) * k); });
  if (solo && !selected) return null;
  return <group ref={body} position={solo ? [0, 0, 0] : [X[i], 0, 0]}>
    <mesh position={[0, -.06, 0]}><cylinderGeometry args={[.5, .56, .12, 24]} /><meshBasicMaterial color="#17131c" /></mesh>
    <mesh position={[0, .005, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.36, .47, 40]} /><meshBasicMaterial color={p.glow} transparent opacity={selected || hover ? .95 : .35} /></mesh>
    {/* invisible hit box over the whole figure for mouse / touch */}
    <mesh position={[0, .8, 0]} onPointerOver={e => { e.stopPropagation(); setHover(true); }} onPointerOut={() => setHover(false)}
      onClick={e => { e.stopPropagation(); onPick(i); }}><boxGeometry args={[.9, 1.7, .4]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
    <group><AnimatedCharacter job={p.cls} clip={clip} replay={stamp} gender={p.g} promotion={p.promotion} costume={p.costume} hair={p.hair} hairColor={p.hairColor} lite /></group>
  </group>;
}
function Rig({ solo }: { solo: boolean }) {
  useFrame(({ camera }) => { if (solo) { camera.position.set(0, 1.25, 6.4); camera.lookAt(0, .8, 0); } else { camera.position.set(0, 1.9, 14.5); camera.lookAt(0, .9, 0); } });
  return null;
}

export default function HeroLineup({ compact = false, onPick }: { compact?: boolean; /** reports the picked class (null when un-picked) */ onPick?: (c: ClassId | null) => void }) {
  // a backdrop, not the game: drawn at 30 fps and at most 1.25× pixel density (scaled by the player's render setting)
  const renderScale = useSettingsStore(s => s.renderScale), dpr = Math.max(0.6, 1.25 * renderScale);
  const box = useRef<HTMLDivElement>(null); const [solo, setSolo] = useState(false); const [idx, setIdx] = useState(0);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(() => setSolo(window.innerWidth < 768)); /* round 23: the screen rule (< 768 px = phone), not the column width */ ro.observe(el); return () => ro.disconnect(); }, []);
  // nothing moves on its own: a hero animates when pointed at / touched, and the picked one steps to the front
  const [pick, setPick] = useState<number | null>(null);
  useEffect(() => { onPick?.(pick == null ? null : LINEUP[pick].cls); }, [pick]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (solo) onPick?.(LINEUP[idx].cls); }, [solo, idx]); // eslint-disable-line react-hooks/exhaustive-deps
  const step = (d: number) => setIdx(i => (i + d + N) % N);
  useEffect(() => { if (!solo) return; const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.closest?.('input,textarea')) return; if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [solo]);
  const start = useRef<[number, number] | null>(null);
  const down = (e: React.PointerEvent) => { if (solo) start.current = [e.clientX, e.clientY]; };
  const up = (e: React.PointerEvent) => {
    const s = start.current; start.current = null; if (!s || !solo) return; const dx = e.clientX - s[0], dy = e.clientY - s[1];
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); step(e.clientX < r.left + r.width / 2 - 40 ? -1 : 1); }
  };
  const active = (i: number) => solo ? i === idx : pick === i;
  return <div ref={box} className={`sf-lineup${compact ? ' compact' : ''}${solo ? ' solo' : ''}`} onPointerDown={down} onPointerUp={up} aria-label={solo ? `${LINEUP[idx].th} — ปัดหรือคลิกเพื่อดูแบบอื่น` : undefined}>
    <Canvas camera={{ fov: 30, position: [0, 1.75, 9.2] }} dpr={[Math.min(1, dpr), dpr]} frameloop="demand" gl={{ antialias: renderScale >= 0.8, alpha: true, powerPreference: 'low-power' }}>
      <FrameCap fps={30} />
      <ambientLight intensity={1.4} /><directionalLight position={[-3, 5, 4]} intensity={2.2} />
      {LINEUP.map((p, i) => <Hero key={p.key} p={p} i={i} selected={active(i)} solo={solo} onPick={j => setPick(k => k === j ? null : j)} />)}<Rig solo={solo} />
    </Canvas>
    {solo && <div className="sf-lineup-nav" onPointerDown={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()}>
      <button aria-label="ก่อนหน้า" onClick={() => step(-1)}>‹</button>
      <span>{LINEUP.map((p, i) => <button key={p.key} className={i === idx ? 'on' : ''} style={{ ['--cc' as string]: p.glow }} aria-label={p.th} onClick={() => setIdx(i)} />)}</span>
      <button aria-label="ถัดไป" onClick={() => step(1)}>›</button></div>}
    <ol className="sf-lineup-names">{LINEUP.map((p, i) => (!solo || i === idx) && <li key={p.key} className={active(i) ? 'on' : ''} onClick={() => solo ? setIdx(i) : setPick(k => k === i ? null : i)} style={{ ['--cc' as string]: p.glow }}><b>{p.th}</b><small>{p.cls} · {p.g === 'm' ? 'ชาย' : 'หญิง'} · {p.role}</small></li>)}</ol>
  </div>;
}
