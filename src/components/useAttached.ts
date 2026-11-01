'use client';
// Attach a three.js object made outside React (SpriteActor.root …) under a <group> — instead of <primitive object>.
// In React 19 StrictMode (next dev) a component that mounts later (a monster respawning, an NPC entering view) runs its
// effects twice; <primitive> then loses the object and the sprite stays invisible until a reload. An effect that adds
// the object on mount and removes it on cleanup survives the double run.
import { useLayoutEffect, useRef } from 'react';
import type { Group, Object3D } from 'three';
export function useAttached(obj: Object3D) {
  const ref = useRef<Group>(null);
  useLayoutEffect(() => { const g = ref.current; if (!g) return; g.add(obj); return () => { g.remove(obj); }; }, [obj]);
  return ref;
}
