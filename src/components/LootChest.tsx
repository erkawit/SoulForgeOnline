'use client';
// Round 26: ground loot is a treasure chest in the item's rarity tier (8 painted chests, Common → Arch) with that tier's
// sparkle loop on top (10-frame strips cut from the tier GIFs, 90 ms a frame). Both face the camera. Nothing is drawn
// until its picture has loaded, so a chest never shows up as a white square.
import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { SRGBColorSpace, TextureLoader, type Group, type Texture } from 'three';
import { RARITY_COLOR, type Item } from '@/lib/types';
import { chestTier, chestUrl, sparkleUrl } from '@/game/fx/lootChest';

const FRAMES = 10, FRAME_MS = 90;

const loaded = new Map<string, Texture>(), waiting = new Map<string, ((t: Texture) => void)[]>();
let loader: TextureLoader | null = null;
function useTexture(url: string, strip = false): Texture | null {
  const [t, setT] = useState<Texture | null>(() => loaded.get(url) ?? null);
  useEffect(() => {
    const have = loaded.get(url); if (have) { setT(have); return; }
    let live = true; const done = (x: Texture) => { if (live) setT(x); };
    const q = waiting.get(url); if (q) { q.push(done); return () => { live = false; }; }
    waiting.set(url, [done]);
    (loader ??= new TextureLoader()).load(url, x => {
      x.colorSpace = SRGBColorSpace; if (strip) x.repeat.set(1 / FRAMES, 1);
      loaded.set(url, x); for (const f of waiting.get(url) ?? []) f(x); waiting.delete(url);
    }, undefined, () => waiting.delete(url));
    return () => { live = false; };
  }, [url, strip]);
  return t;
}

export default function LootChest({ item }: { item: Pick<Item, 'rarity'> }) {
  const tier = chestTier(item.rarity), chest = useTexture(chestUrl(tier)), sparkle = useTexture(sparkleUrl(tier), true);
  const bob = useRef<Group>(null), seed = useRef(Math.random() * 6.28);
  const size = 0.95 + (tier - 1) * 0.05; // rarer chests are a little bigger
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed.current;
    if (bob.current) bob.current.position.y = size * 0.5 + 0.05 + Math.sin(t * 2.2) * 0.04;
    if (sparkle) sparkle.offset.x = (Math.floor(clock.elapsedTime * 1000 / FRAME_MS) % FRAMES) / FRAMES; // all chests of a tier share the loop
  });
  return <>
    <group ref={bob}>
      {chest && <sprite scale={[size, size, 1]}><spriteMaterial map={chest} transparent alphaTest={0.02} toneMapped={false} fog={false} depthWrite={false} /></sprite>}
      {sparkle && <sprite scale={[size * 1.55, size * 1.55, 1]} renderOrder={2}><spriteMaterial map={sparkle} transparent depthWrite={false} toneMapped={false} fog={false} /></sprite>}
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><circleGeometry args={[0.55, 32]} /><meshBasicMaterial color={RARITY_COLOR[item.rarity] ?? '#e8d7aa'} transparent opacity={0.3} depthWrite={false} /></mesh>
  </>;
}
