'use client';
// With a frame cap a <Canvas frameloop="demand"> renders only when asked: this asks for a frame at the capped rate (the
// browser pauses requestAnimationFrame in a hidden tab, so nothing is drawn while the game is in the background).
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export default function FrameCap({ fps }: { fps: number }) {
  const invalidate = useThree(s => s.invalidate);
  useEffect(() => {
    if (!fps) return; let raf = 0, last = 0; const gap = 1000 / fps - 1;
    const tick = (t: number) => { raf = requestAnimationFrame(tick); if (t - last >= gap) { last = t; invalidate(); } };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [fps, invalidate]);
  return null;
}
