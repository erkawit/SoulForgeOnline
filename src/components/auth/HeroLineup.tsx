'use client';
// Login / sign-up backdrop (round 16): the Berserker in the Thai attire, male + female (3D-rendered rigs, grey A06 hair),
// as 2.5D sprites on rune pedestals. Wide column → all four, each showing off a move in turn. Narrow column (< 760 px,
// phones) → one hero at a time: swipe left / right, click either side, use the arrows, dots or ← → keys.
import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { type ClassId } from '@/game/content';
import { type PromotionId } from '@/game/advancement';
import type { CharacterClip } from '@/game/characterModels';
import AnimatedCharacter from '../AnimatedCharacter';
import { CLASS_GLOW, type Gender } from '@/game/sprites/catalog';

type Pick = { key: string; cls: ClassId; g: Gender; promotion?: PromotionId; th: string; role: string; glow: string; costume?: string; hair?: string; hairColor?: string };
// round 16: one class on show — the 3D-rendered Berserker in the Thai attire, male and female, plain grey hair (A06)
const HAIR = 'A06', GREY = '#a9a9ad';
const LINEUP: Pick[] = [
  { key: 'bm', cls: 'Berserker', g: 'm', th: 'เบอร์เซิร์กเกอร์', role: 'ชุดไทย · อาวุธสองมือ', glow: CLASS_GLOW.Berserker, costume: 'thai', hair: HAIR, hairColor: GREY },
  { key: 'bf', cls: 'Berserker', g: 'f', th: 'เบอร์เซิร์กเกอร์', role: 'ชุดไทย · อาวุธสองมือ', glow: CLASS_GLOW.Berserker, costume: 'thai', hair: HAIR, hairColor: GREY },
];
const N = LINEUP.length, MID = (N - 1) / 2;
const X = LINEUP.map((_, i) => (i - MID) * 1.9);

function Hero({ p, i, active, turn, solo }: { p: Pick; i: number; active: boolean; turn: number; solo: boolean }) {
  const [clip, setClip] = useState<CharacterClip>('Idle'); const [stamp, setStamp] = useState(0);
  useEffect(() => { if (!active) return; const list: CharacterClip[] = ['Skill', 'Attack', 'Special']; setClip(list[Math.floor(turn / N) % list.length]); setStamp(Date.now()); const t = setTimeout(() => setClip('Idle'), 2000); return () => clearTimeout(t); }, [turn, active]);
  if (solo && !active) return null;
  return <group position={solo ? [0, 0, 0] : [X[i], 0, Math.abs(i - MID) * -0.35]}>
    <mesh position={[0, -.06, 0]}><cylinderGeometry args={[.6, .68, .12, 10]} /><meshBasicMaterial color="#17131c" /></mesh>
    <mesh position={[0, .005, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.42, .56, 40]} /><meshBasicMaterial color={p.glow} transparent opacity={active ? .9 : .35} /></mesh>
    <group rotation={[0, solo ? 0 : -(i - MID) * 0.25, 0]}><AnimatedCharacter job={p.cls} clip={clip} replay={stamp} gender={p.g} promotion={p.promotion} costume={p.costume} hair={p.hair} hairColor={p.hairColor} lite /></group>
  </group>;
}
function Rig({ solo }: { solo: boolean }) {
  useFrame(({ camera, clock }) => { const t = clock.elapsedTime; if (solo) { camera.position.set(Math.sin(t * .2) * .15, 1.35, 4.6); camera.lookAt(0, .85, 0); } else { camera.position.set(Math.sin(t * .12) * .35, 1.5, 6.6); camera.lookAt(0, .82, 0); } });
  return null;
}

export default function HeroLineup({ compact = false }: { compact?: boolean }) {
  const [turn, setTurn] = useState(0); const n = useRef(0);
  const box = useRef<HTMLDivElement>(null); const [solo, setSolo] = useState(false); const [idx, setIdx] = useState(0);
  useEffect(() => { const el = box.current; if (!el) return; const ro = new ResizeObserver(([e]) => setSolo(e.contentRect.width < 760)); ro.observe(el); return () => ro.disconnect(); }, []);
  useEffect(() => { const t = setInterval(() => { n.current++; setTurn(n.current); }, solo ? 6000 : 3500); return () => clearInterval(t); }, [solo]);
  const step = (d: number) => setIdx(i => (i + d + N) % N);
  useEffect(() => { if (!solo) return; const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.closest?.('input,textarea')) return; if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }; addEventListener('keydown', k); return () => removeEventListener('keydown', k); }, [solo]);
  const start = useRef<[number, number] | null>(null);
  const down = (e: React.PointerEvent) => { if (solo) start.current = [e.clientX, e.clientY]; };
  const up = (e: React.PointerEvent) => {
    const s = start.current; start.current = null; if (!s || !solo) return; const dx = e.clientX - s[0], dy = e.clientY - s[1];
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (Math.abs(dx) < 8 && Math.abs(dy) < 8) { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); step(e.clientX < r.left + r.width / 2 - 40 ? -1 : 1); }
  };
  const active = (i: number) => solo ? i === idx : turn % N === i;
  return <div ref={box} className={`sf-lineup${compact ? ' compact' : ''}${solo ? ' solo' : ''}`} onPointerDown={down} onPointerUp={up} aria-label={solo ? `${LINEUP[idx].th} — ปัดหรือคลิกเพื่อดูแบบอื่น` : undefined}>
    <Canvas camera={{ fov: 30, position: [0, 1.75, 9.2] }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
      {LINEUP.map((p, i) => <Hero key={p.key} p={p} i={i} active={active(i)} turn={turn} solo={solo} />)}<Rig solo={solo} />
    </Canvas>
    {solo && <div className="sf-lineup-nav" onPointerDown={e => e.stopPropagation()} onPointerUp={e => e.stopPropagation()}>
      <button aria-label="ก่อนหน้า" onClick={() => step(-1)}>‹</button>
      <span>{LINEUP.map((p, i) => <button key={p.key} className={i === idx ? 'on' : ''} style={{ ['--cc' as string]: p.glow }} aria-label={p.th} onClick={() => setIdx(i)} />)}</span>
      <button aria-label="ถัดไป" onClick={() => step(1)}>›</button></div>}
    <ol className="sf-lineup-names">{LINEUP.map((p, i) => (!solo || i === idx) && <li key={p.key} className={active(i) ? 'on' : ''} style={{ ['--cc' as string]: p.glow }}><b>{p.th}</b><small>{p.cls} · {p.g === 'm' ? 'ชาย' : 'หญิง'} · {p.role}</small></li>)}</ol>
  </div>;
}
