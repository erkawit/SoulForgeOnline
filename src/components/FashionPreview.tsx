'use client';
// Round 17: the try-on stage (ตู้เสื้อผ้า / Cash Shop). The same layered hero the game draws — body, hair, weapon (or the
// weapon skin) and the fashion overlays — on a small pedestal, so what you see here is exactly what the field shows.
// Turn it with the arrows (8 directions) or by dragging, and switch between standing, walking and attacking.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import AnimatedCharacter from './AnimatedCharacter';
import { CLASS_ANIMS } from '@/game/sprites/classAnims';
import { Suspense } from 'react';
import type { CharacterClip } from '@/game/characterModels';
import type { ClassId } from '@/game/content';
import type { Gender } from '@/game/sprites/catalog';
import { FASHION, FASHION_BY_ID, outfitSprite, overlays, type FashionItem, type Wardrobe } from '@/game/fashion';

export type PreviewLook = {
  job: ClassId; gender: Gender; promotion?: string | null; hair?: string; hairColor?: string;
  weapon?: { definitionId?: string; tier?: number } | null; wardrobe: Wardrobe; catalog?: FashionItem[];
};
const CLIPS: [CharacterClip, string][] = [['Idle', 'ยืน'], ['Walk', 'เดิน'], ['Attack', 'โจมตี'], ['Skill', 'สกิล']];
const STEP = Math.PI / 4;

function Turntable({ yaw, children }: { yaw: number; children: React.ReactNode }) {
  const g = useRef<Group>(null);
  useFrame((_, dt) => { const o = g.current; if (!o) return; o.rotation.y += (yaw - o.rotation.y) * (1 - Math.exp(-12 * Math.min(dt, .05))); });
  return <group ref={g}>{children}</group>;
}

export default function FashionPreview({ look, glow = '#d9b45c' }: { look: PreviewLook; glow?: string }) {
  const list = look.catalog ?? FASHION;
  const [dir, setDir] = useState(0), [clip, setClip] = useState<CharacterClip>('Idle'), [stamp, setStamp] = useState(0);
  const costume = outfitSprite(look.wardrobe, list) ?? (CLASS_ANIMS[`${look.gender}-${look.job}`] ? null : 'thai'); // same rule as the field (ClassActor)
  const fashion = useMemo(() => overlays(look.wardrobe, list), [look.wardrobe, list]);
  const skinId = look.wardrobe.worn.weapon, weaponSkin = skinId ? FASHION_BY_ID(list)[skinId]?.weaponSheet ?? null : null;
  // one-shot clips replay every 1.6 s so the move keeps showing
  useEffect(() => { if (clip === 'Idle' || clip === 'Walk') return; setStamp(Date.now()); const t = setInterval(() => setStamp(Date.now()), 1600); return () => clearInterval(t); }, [clip]);
  const drag = useRef<number | null>(null);
  const turn = (d: number) => setDir(v => v + d);
  return <div className="fp-stage" onPointerDown={e => { drag.current = e.clientX; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
    onPointerMove={e => { if (drag.current == null) return; const dx = e.clientX - drag.current; if (Math.abs(dx) > 34) { turn(dx > 0 ? -1 : 1); drag.current = e.clientX; } }}
    onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
    <Canvas camera={{ fov: 28, position: [0, 1.35, 5.6] }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }} onCreated={({ camera }) => camera.lookAt(0, 1.0, 0)}>
      <ambientLight intensity={1.4} /><directionalLight position={[-3, 5, 4]} intensity={2.2} />
      <mesh position={[0, -.06, 0]}><cylinderGeometry args={[.62, .7, .12, 12]} /><meshBasicMaterial color="#17131c" /></mesh>
      <mesh position={[0, .005, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.44, .58, 48]} /><meshBasicMaterial color={glow} transparent opacity={.75} /></mesh>
      <Turntable yaw={dir * STEP}>
        <AnimatedCharacter job={look.job} gender={look.gender} promotion={look.promotion} costume={costume} weapon={look.weapon} weaponSkin={weaponSkin}
          fashion={fashion} hair={look.hair} hairColor={look.hairColor} clip={clip} replay={stamp} glow={glow} />
      </Turntable>
    </Canvas>
    <div className="fp-turn" onPointerDown={e => e.stopPropagation()}>
      <button type="button" aria-label="หมุนซ้าย" onClick={() => turn(1)}>‹</button>
      <button type="button" aria-label="หมุนขวา" onClick={() => turn(-1)}>›</button>
    </div>
    <div className="fp-clips" role="group" aria-label="ท่าทาง" onPointerDown={e => e.stopPropagation()}>
      {CLIPS.map(([c, th]) => <button type="button" key={c} className={clip === c ? 'on' : ''} aria-pressed={clip === c} onClick={() => setClip(c)}>{th}</button>)}
    </div>
  </div>;
}
