'use client';
// dev only: one 3D hero on a plain stage with a camera the console can move (window.__cam = { pos, look, fov }),
// used to tune the weapon grip and the fitted hair. Renders nothing in a production build.
import { Suspense, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import Hero3D from '@/components/Hero3D';

type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number };
function Rig() {
  useFrame(({ camera }) => { const c = (window as unknown as { __cam?: Cam }).__cam; if (!c) return; camera.position.set(...c.pos); camera.lookAt(...c.look);
    const pc = camera as unknown as { fov: number; updateProjectionMatrix(): void }; if (pc.fov !== c.fov) { pc.fov = c.fov; pc.updateProjectionMatrix(); } });
  return null;
}
/** dev: save `n` frames of the canvas every `ms` to soulforge-transfer/output/tpose-ref/<tag>_NNN.png */
async function capture(tag: string, n = 24, ms = 50) {
  const c = document.querySelector('canvas') as HTMLCanvasElement;
  for (let i = 0; i < n; i++) {
    await new Promise(r => setTimeout(r, ms));
    await fetch('/api/dev-save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${tag}_${String(i).padStart(3, '0')}.png`, data: c.toDataURL('image/png') }) });
  }
  return 'ok';
}
export default function DevHero() {
  const q = typeof window !== 'undefined' ? new URLSearchParams(location.search) : null;
  const [g, setG] = useState<'m' | 'f'>(q?.get('g') === 'f' ? 'f' : 'm'), [clip, setClip] = useState(q?.get('clip') ?? 'Idle'), [hair, setHair] = useState(q?.get('hair') ?? 'A06');
  if (process.env.NODE_ENV === 'production') return null;
  if (typeof window !== 'undefined') Object.assign(window, { __setG: setG, __setClip: setClip, __setHair: setHair, __capture: capture }), (window as unknown as { __cam?: Cam }).__cam ??= { pos: [0, 1.2, 4.2], look: [0, 0.9, 0], fov: 30 };
  return <div style={{ position: 'fixed', inset: 0, background: '#2a2433' }}>
    <Canvas camera={{ fov: 30, position: [0, 1.2, 4.2] }} dpr={1} gl={{ preserveDrawingBuffer: true, alpha: true }}>
      <ambientLight intensity={1.4} /><directionalLight position={[-3, 5, 4]} intensity={2.2} /><Rig />
      <Suspense fallback={null}><Hero3D key={g} gender={g} clip={clip as never} hair={hair} hairColor="#a9a9ad" weaponTier={0} /></Suspense>
    </Canvas>
  </div>;
}
