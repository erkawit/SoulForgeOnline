'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

/** Optional asset bridge. Only mount this when a real GLB exists in public/models.
 * For animated/skinned characters use SkeletonUtils.clone + useAnimations instead.
 */
export function GLBActor({ url, scale = 1 }: { url: string; scale?: number }) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={cloned} scale={scale} />;
}
