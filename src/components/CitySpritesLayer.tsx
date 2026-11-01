'use client';
// The capitals built from the painted mmorpg-world-assets kit (game/world/capitalKit.ts, layout in capitalPlan.ts):
// ground, walls, the four corner waygates, the compass plaza and the nine service buildings as billboards that swap to the
// painted view matching the camera's angle. Walls / gates between the camera and the player fade when the player is near.
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { CITIES, type CityId, type MainCityId } from '@/game/content';
import { buildCapital } from '@/game/world/capitalKit';
import { useGameStore } from '@/store/useGameStore';

export default function CitySpritesLayer({ city = 'hollow' }: { city?: CityId }) {
  const id = (CITIES[city]?.parent ? 'hollow' : city) as MainCityId;
  const kit = useMemo(() => buildCapital(id), [id]);
  useEffect(() => () => kit.dispose(), [kit]);
  const target = useMemo(() => new Vector3(), []);
  useFrame(({ camera }, dt) => { const [x, z] = useGameStore.getState().player.position; target.set(x, 0, z); kit.update(camera.position, target, { x, z }, dt); });
  return <primitive object={kit.group} dispose={null} />;
}
