'use client';
// dev only: renders the base body as the outfit-design mannequin — bind T-pose, bald, no weapon, lit with a key / fill /
// rim light so the form reads (the female texture is nearly flat colour), 4 orthographic views on a transparent
// background, saved through /api/dev-save to soulforge-transfer/output/tpose-ref. Open /dev-mannequin?g=f and wait.
import { Suspense, useEffect, useMemo } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3, type Mesh, type Object3D, type OrthographicCamera, type SkinnedMesh } from 'three';

function Shoot({ g }: { g: 'm' | 'f' }) {
  const { scene } = useGLTF(`/models/hero/hero-base-${g}.glb`);
  const { gl, camera, scene: world } = useThree();
  const model = useMemo(() => scene, [scene]);
  useEffect(() => {
    model.traverse((o: Object3D) => { if (/^Hair_/.test(o.name)) o.visible = false; const s = o as SkinnedMesh; if (s.isSkinnedMesh) { s.skeleton.pose(); s.castShadow = true; s.receiveShadow = true; } const m = o as Mesh; if (m.isMesh) m.frustumCulled = false; });
    world.add(model); model.updateMatrixWorld(true);
    const box = new Box3(); model.traverse(o => { if ((o as SkinnedMesh).isSkinnedMesh && o.visible) box.expandByObject(o, true); });
    const c = box.getCenter(new Vector3()), size = box.getSize(new Vector3()), half = Math.max(size.x, size.y, size.z) * 0.53;
    const cam = camera as OrthographicCamera; cam.left = -half; cam.right = half; cam.top = half; cam.bottom = -half; cam.near = 0.01; cam.far = 100; cam.updateProjectionMatrix();
    const views: [string, Vector3][] = [['1_front', new Vector3(0, 0, 1)], ['2_left', new Vector3(1, 0, 0)], ['3_back', new Vector3(0, 0, -1)], ['4_right', new Vector3(-1, 0, 0)]];
    let cancel = false;
    (async () => {
      await new Promise(r => setTimeout(r, 800));
      for (const [tag, d] of views) {
        if (cancel) return;
        cam.position.copy(c).addScaledVector(d, 10); cam.lookAt(c);
        // the lights turn with the camera, so every view gets the same front-left key light
        const key = world.getObjectByName('key'), rim = world.getObjectByName('rim'), fill = world.getObjectByName('fill');
        const right = new Vector3().crossVectors(d, new Vector3(0, 1, 0)).negate();
        key?.position.copy(c).addScaledVector(d, 4).addScaledVector(right, -2.5).add(new Vector3(0, 3, 0));
        fill?.position.copy(c).addScaledVector(d, 4).addScaledVector(right, 3).add(new Vector3(0, 0.5, 0));
        rim?.position.copy(c).addScaledVector(d, -4).add(new Vector3(0, 2.5, 0));
        gl.render(world, cam);
        const url = gl.domElement.toDataURL('image/png');
        await fetch('/api/dev-save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `base_${g}_${tag}.png`, data: url }) });
      }
      document.title = 'DONE ' + g;
    })();
    return () => { cancel = true; world.remove(model); };
  }, [model, gl, camera, world, g]);
  return null;
}

export default function DevMannequin() {
  if (process.env.NODE_ENV === 'production') return null;
  const g = (typeof window !== 'undefined' && new URLSearchParams(location.search).get('g') === 'm') ? 'm' : 'f';
  return <div style={{ width: 1024, height: 1024, background: 'transparent' }}>
    <Canvas orthographic frameloop="demand" dpr={1} style={{ width: 1024, height: 1024 }} gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} camera={{ position: [0, 1, 10], zoom: 1 }}>
      <hemisphereLight args={['#ffffff', '#6b5a52', 0.9]} />
      <directionalLight name="key" intensity={2.4} />
      <directionalLight name="fill" intensity={0.7} color="#dfe6ff" />
      <directionalLight name="rim" intensity={1.1} color="#fff1dc" />
      <Suspense fallback={null}><Shoot g={g} /></Suspense>
    </Canvas>
  </div>;
}
