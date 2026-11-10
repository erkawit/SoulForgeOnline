'use client';
// Round 22: the field / dungeon floor is the painted map itself (public/art/world/<city>/<map>.webp, 1280 × 853) laid
// flat on the ±70 m square. The painting is an isometric diamond; terrainNavigation.fieldImagePoint maps image pixels to
// world metres, so this uses its inverse for the four corner UVs (the mapping is affine, four vertices are exact).
// Paths, trees, ruins and buildings are part of the painting; collision comes from the navigation plan traced on it.
import { useEffect, useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute, SRGBColorSpace, TextureLoader, LinearFilter } from 'three';
import { FIELD_ART, type CityId } from '@/game/content';
import { FIELD_HALF } from '@/game/world/fieldDimensions';
import { farmPlan } from '@/game/world/farmLayout';

const IMG_W = 1280, IMG_H = 853;
/** world (x, z) → texture (u, v) — the inverse of fieldImagePoint */
export function fieldUv(x: number, z: number): [number, number] {
  const a = x - z, b = x + z;
  const u = (a * 232 / 70 + 500) * IMG_W / 1000, v = (b * 136 / 70 + 340) * IMG_H / 680;
  return [u / IMG_W, 1 - v / IMG_H];
}
// round 23: fields with a measured 240 m farm layout use FarmGround; the old 140 m paintings no longer line up with them
export const paintedFieldUrl = (id: CityId) => { const a = FIELD_ART[id]; return a && !farmPlan(id) ? `/art/world/${a.city}/${a.map}.webp` : null; };

export default function PaintedFieldGround({ city }: { city: CityId }) {
  const url = paintedFieldUrl(city);
  const texture = useMemo(() => {
    if (!url) return null;
    const t = new TextureLoader().load(url); t.colorSpace = SRGBColorSpace; t.minFilter = LinearFilter; t.anisotropy = 4; return t;
  }, [url]);
  const geometry = useMemo(() => {
    const L = FIELD_HALF, corners: [number, number][] = [[-L, -L], [L, -L], [L, L], [-L, L]];
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(corners.flatMap(([x, z]) => [x, 0.11, z]), 3));
    g.setAttribute('uv', new Float32BufferAttribute(corners.flatMap(([x, z]) => fieldUv(x, z)), 2));
    g.setIndex([0, 2, 1, 0, 3, 2]); g.computeVertexNormals(); return g;
  }, []);
  useEffect(() => () => { geometry.dispose(); texture?.dispose(); }, [geometry, texture]);
  if (!texture) return null;
  return <mesh geometry={geometry} receiveShadow><meshBasicMaterial map={texture} toneMapped={false} /></mesh>;
}
