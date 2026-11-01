'use client';
// The Sorrowlands around Hollow Reach (world/ruins.ts): ruined village, burnt keep, collapsed cathedral and crystal cave.
// Walls between the camera and the hero dissolve (screen-door cut-out), so the isometric view never hides you.
import { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { sorrowlands, setRuinsView } from '@/game/world/ruins';
import { useGameStore } from '@/store/useGameStore';

const focus = new Vector3();
export default function RuinsLayer() {
  const ruins = sorrowlands();
  useEffect(() => { ruins.group.traverse(o => { const m = o as Mesh; if (m.isMesh) { m.castShadow = m.name !== 'sorrowlands-ground'; m.receiveShadow = true; } }); }, [ruins]);
  useFrame(({ camera }) => { const [x, z] = useGameStore.getState().player.position; focus.set(x, 1, z); setRuinsView(camera.position, focus); });
  return <primitive object={ruins.group} dispose={null} />;
}
