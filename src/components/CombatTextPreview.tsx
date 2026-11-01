'use client';
// /ui-review → "Combat text": the floating combat numbers exactly as the game draws them (game/fx/damageText.ts),
// cycling through every kind — normal hit, skill hit, painted CRITICAL, heal, damage taken, evade — over a dummy target.
import { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { createDamageText, type DamageKind, type DamageText } from '@/game/fx/damageText';

const SEQ: [DamageKind, number | string][] = [['hit', 93], ['hit', 104], ['skill', 268], ['crit', 412], ['hit', 99], ['taken', 37], ['crit', 1288], ['heal', 120], ['evade', 'EVADE'], ['skill', 531]];

function Numbers() {
  const { scene } = useThree(); const dt = useRef<DamageText | null>(null), i = useRef(0), next = useRef(0);
  useEffect(() => { const d = createDamageText(scene, 32); dt.current = d; return () => d.dispose(); }, [scene]);
  useFrame(({ clock }, delta) => {
    const d = dt.current; if (!d) return;
    if (clock.elapsedTime > next.current) { const [k, v] = SEQ[i.current++ % SEQ.length]; d.spawn(new Vector3(k === 'taken' || k === 'heal' ? -1.3 : 0.4, 1.7, 0), v, k, '#ff4a3a'); next.current = clock.elapsedTime + (k === 'crit' ? 1.1 : 0.55); }
    d.update(Math.min(delta, .1));
  });
  return null;
}

export default function CombatTextPreview() {
  return <div style={{ height: 460, background: 'radial-gradient(ellipse at 50% 60%,#2b2a33,#0b0b10)', border: '1px solid #5a4a2e' }}>
    <Canvas orthographic camera={{ position: [6, 6, 6], zoom: 90 }} dpr={[1, 2]}>
      <ambientLight intensity={1} />
      <mesh position={[0.4, 0.6, 0]}><capsuleGeometry args={[.35, .6, 6, 12]} /><meshStandardMaterial color="#6b5a7a" /></mesh>
      <mesh position={[-1.3, 0.6, 0]}><capsuleGeometry args={[.3, .55, 6, 12]} /><meshStandardMaterial color="#b89a72" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[3.2, 48]} /><meshStandardMaterial color="#1b1a22" /></mesh>
      <Numbers />
    </Canvas>
    <p style={{ margin: '6px 10px', fontSize: 12, color: '#a89d87' }}>ตัวม่วง = มอนสเตอร์ (ดาเมจปกติ · สกิล · CRITICAL · หลบ) · ตัวทอง = ผู้เล่น (โดนตี · ฮีล)</p>
  </div>;
}
