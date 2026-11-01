// Ink outline (inverted hull) for skinned chibi models: gives the low-poly characters a crisp, finished silhouette
// that reads clearly against busy ground and bright skill effects.
import { BackSide, MeshBasicMaterial, SkinnedMesh, type Object3D } from 'three';

export function addOutline(model: Object3D, color = '#0b0810', thickness = 0.012) {
  const meshes: SkinnedMesh[] = [];
  model.traverse(o => { if ((o as SkinnedMesh).isSkinnedMesh && !o.userData.outline) meshes.push(o as SkinnedMesh); });
  const mat = new MeshBasicMaterial({ color, side: BackSide });
  mat.onBeforeCompile = shader => {
    shader.uniforms.uThick = { value: thickness };
    shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nuniform float uThick;')
      .replace('#include <skinning_vertex>', '#include <skinning_vertex>\n  transformed += normalize(objectNormal) * uThick;');
  };
  mat.customProgramCacheKey = () => 'sf-outline';
  for (const m of meshes) {
    const o = new SkinnedMesh(m.geometry, mat); o.bind(m.skeleton, m.bindMatrix); o.userData.outline = true; o.frustumCulled = false; o.castShadow = false; o.renderOrder = -1;
    m.parent?.add(o); o.position.copy(m.position); o.quaternion.copy(m.quaternion); o.scale.copy(m.scale);
  }
  return () => { mat.dispose(); model.traverse(o => { if (o.userData.outline) o.removeFromParent(); }); };
}
