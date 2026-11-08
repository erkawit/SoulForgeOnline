// Living foliage for SoulForge: wind-swayed trees (their shadows sway too), grass and flowers that bend away from
// anything walking through them, bushes that part around players, mossy rocks and drifting leaves.
// Pure three.js so the game (R3F) and the standalone web preview share it.
import {
  BufferAttribute, BufferGeometry, Color, ConeGeometry, CylinderGeometry, DoubleSide, DynamicDrawUsage, Group, IcosahedronGeometry, InstancedMesh,
  Material, Matrix4, MeshDepthMaterial, MeshStandardMaterial, Object3D, OctahedronGeometry, Points, PointsMaterial, Quaternion, RGBADepthPacking, SphereGeometry, Vector3, Vector4,
  CanvasTexture,
} from 'three';
import { WORLD_LIMIT } from '../content';
import type { NatureLayout, Prop, TreeKind } from './layout';

export type Quality = 'low' | 'medium' | 'high';
export type Actor = { x: number; z: number; r: number };
const MAX_ACTORS = 16;
const uniforms = { uTime: { value: 0 }, uWind: { value: new Vector3(0.8, 0.35, 0.55) }, uActors: { value: Array.from({ length: MAX_ACTORS }, () => new Vector4(9999, 9999, 0.01, 0)) }, uCam: { value: new Vector3(0, 50, 0) }, uFocus: { value: new Vector3() }, uActorCount: { value: 0 } };

// ---------------------------------------------------------------- shader patch: wind sway, leaf flutter, trampling
function windPatch(mat: Material, o: { sway: number; flutter: number; trample?: number; down?: number; noFlip?: boolean; cutout?: boolean }, tag: string) {
  const defs = `#define SWAY ${o.sway.toFixed(3)}\n#define FLUTTER ${o.flutter.toFixed(3)}\n${o.trample ? `#define TRAMPLE\n#define TRAMPLE_K ${o.trample.toFixed(3)}\n#define TRAMPLE_DOWN ${(o.down ?? 0.15).toFixed(3)}\n` : ''}`;
  mat.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = defs + shader.vertexShader
      .replace('#include <common>', `#include <common>\nuniform float uTime; uniform vec3 uWind; uniform vec4 uActors[${MAX_ACTORS}]; uniform int uActorCount; attribute float aSway;`)
      .replace('#include <project_vertex>', `
        vec4 mvPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          mvPosition = instanceMatrix * mvPosition;
          vec3 orig = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        #else
          vec3 orig = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
        #endif
        vec4 wp = modelMatrix * mvPosition;
        float s = aSway;
        float ph = dot(orig.xz, vec2(0.37, 0.21));
        float gust = 0.55 + 0.45 * sin(uTime * 0.45 + orig.x * 0.05 + orig.z * 0.03);
        vec2 wdir = normalize(uWind.xy + 1e-4);
        float w = uWind.z * gust;
        wp.xz += wdir * (sin(uTime * 1.7 + ph) * 0.45 + 0.55) * w * SWAY * s * s;
        wp.xz += vec2(sin(uTime * 7.3 + ph * 3.1 + wp.y * 3.0), cos(uTime * 6.1 + ph * 2.3 + wp.y * 2.0)) * FLUTTER * s * w;
        #ifdef TRAMPLE
          for (int i = 0; i < ${MAX_ACTORS}; i++) {
            if (i >= uActorCount) break;
            vec2 d = orig.xz - uActors[i].xy; float dist = length(d); float rad = uActors[i].z;
            float f = clamp(1.0 - dist / rad, 0.0, 1.0);
            if (f > 0.0) { vec2 n = d / max(dist, 1e-3); wp.xz += n * f * TRAMPLE_K * s; wp.y -= f * f * TRAMPLE_DOWN * s; }
          }
        #endif
        mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        vSfWorld = wp.xyz;`);
    shader.vertexShader = 'varying vec3 vSfWorld;\n' + shader.vertexShader;
    // camera cut-out: foliage between the camera and the hero dissolves with a screen-door dither, so trees never hide you
    if (o.cutout) shader.fragmentShader = 'varying vec3 vSfWorld; uniform vec3 uCam; uniform vec3 uFocus;\n' + shader.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      { vec3 seg = uFocus - uCam; float L = max(length(seg), 1e-3); vec3 dir = seg / L; float t = dot(vSfWorld - uCam, dir);
        if (t > 0.0 && t < L - 0.6) { float d = length(vSfWorld - (uCam + dir * t)); float k = 1.0 - smoothstep(0.9, 2.0, d);
          float dither = fract(dot(floor(gl_FragCoord.xy), vec2(0.5, 0.25)) + fract(gl_FragCoord.y * 0.5) * 0.5);
          if (k * 0.82 > dither) discard; } }`);
    // thin double-sided cards (grass, flowers): keep the baked up-facing normal on the back side too, otherwise
    // half the blades turn black when three flips normals for back faces
    if (o.noFlip) shader.fragmentShader = shader.fragmentShader.replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n#ifdef DOUBLE_SIDED\n  normal *= faceDirection;\n#endif');
  };
  mat.customProgramCacheKey = () => 'sfwind-' + tag;
  return mat;
}
function windDepth(o: Parameters<typeof windPatch>[1], tag: string) { return windPatch(new MeshDepthMaterial({ depthPacking: RGBADepthPacking }), o, tag + '-depth'); }

// ---------------------------------------------------------------- geometry helpers
type Part = { g: BufferGeometry; color: (y: number, i: number) => Color; sway: (y: number) => number };
function bake(parts: Part[]) {
  const pos: number[] = [], nor: number[] = [], col: number[] = [], sw: number[] = [];
  for (const p of parts) {
    const g = p.g.index ? p.g.toNonIndexed() : p.g; g.computeVertexNormals();
    const P = g.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P.count; i++) { const y = P.getY(i); pos.push(P.getX(i), y, P.getZ(i)); nor.push(N.getX(i), N.getY(i), N.getZ(i)); const c = p.color(y, i); col.push(c.r, c.g, c.b); sw.push(p.sway(y)); }
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3)); g.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3));
  g.setAttribute('color', new BufferAttribute(new Float32Array(col), 3)); g.setAttribute('aSway', new BufferAttribute(new Float32Array(sw), 1));
  g.computeBoundingSphere(); return g;
}
const noisy = (g: BufferGeometry, amt: number, seed: number) => {
  const P = g.attributes.position;
  for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i), z = P.getZ(i); const n = Math.sin(x * 5.1 + seed) * Math.cos(y * 4.3 + seed * 1.7) * Math.sin(z * 4.7 + seed * 0.3); const k = 1 + n * amt; P.setXYZ(i, x * k, y * k, z * k); }
  return g;
};
const at = (g: BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { g.scale(sx, sy, sz); g.rotateX(rx); g.rotateY(ry); g.rotateZ(rz); g.translate(x, y, z); return g; };
const mix = (a: string, b: string, t: number) => new Color(a).lerp(new Color(b), Math.max(0, Math.min(1, t)));

function treeGeometry(kind: TreeKind, pal: NatureLayout['palette']) {
  const bark = pal.bark, leaf = pal.leaf, L0 = leaf[0], L1 = leaf[1] ?? leaf[0], L2 = leaf[2] ?? L1;
  const barkCol = (y: number) => mix('#120e0c', bark, 0.55 + y * 0.25), trunkSway = (y: number) => Math.min(0.5, Math.max(0, y / 4));
  const parts: Part[] = [];
  if (kind === 'oak') {
    parts.push({ g: at(new CylinderGeometry(0.13, 0.24, 1.9, 7, 4), 0, 0.95, 0, 0.04, 0, 0.05), color: barkCol, sway: trunkSway });
    for (const [a, l] of [[0.6, 0.8], [2.6, 0.7], [4.4, 0.75]] as const) parts.push({ g: at(new CylinderGeometry(0.04, 0.08, l, 5), Math.sin(a) * 0.25, 1.65, Math.cos(a) * 0.25, Math.cos(a) * 0.7, 0, -Math.sin(a) * 0.7), color: barkCol, sway: y => Math.min(0.6, y / 3.6) });
    const blobs: [number, number, number, number][] = [[0, 2.55, 0, 0.95], [0.6, 2.25, 0.25, 0.7], [-0.55, 2.3, -0.2, 0.72], [0.15, 2.3, -0.62, 0.66], [-0.2, 2.15, 0.6, 0.62], [0.05, 3.05, 0.05, 0.6]];
    blobs.forEach(([x, y, z, r], i) => parts.push({ g: at(noisy(new IcosahedronGeometry(r, 1), 0.16, i * 1.7), x, y, z), color: (yy, k) => mix(L0, k % 5 ? L1 : L2, (yy - 1.7) / 1.6).multiplyScalar(0.85 + ((k * 37) % 11) / 40), sway: yy => 0.55 + Math.min(0.45, (yy - 1.5) / 3) }));
  } else if (kind === 'pine') {
    parts.push({ g: at(new CylinderGeometry(0.08, 0.17, 2.8, 6, 4), 0, 1.4, 0), color: barkCol, sway: trunkSway });
    for (let i = 0; i < 5; i++) { const r = 1.15 - i * 0.2, y = 1.1 + i * 0.55; parts.push({ g: at(noisy(new ConeGeometry(r, 0.95, 9, 2), 0.08, i), 0, y, 0, 0, i * 0.7), color: (yy, k) => mix(L0, L2, (yy - 0.8) / 2.8).multiplyScalar(0.8 + ((k * 13) % 9) / 30), sway: yy => 0.3 + Math.min(0.7, yy / 3.6) }); }
  } else if (kind === 'dead') {
    parts.push({ g: at(noisy(new CylinderGeometry(0.1, 0.22, 2.2, 6, 5), 0.12, 2), 0, 1.1, 0, 0.06, 0, -0.08), color: barkCol, sway: trunkSway });
    for (let i = 0; i < 6; i++) { const a = i * 1.1, h = 1.2 + i * 0.18, l = 0.9 - i * 0.07; parts.push({ g: at(new CylinderGeometry(0.02, 0.06, l, 4), Math.sin(a) * 0.3, h + 0.3, Math.cos(a) * 0.3, Math.cos(a) * 0.9, 0, -Math.sin(a) * 0.9), color: barkCol, sway: y => Math.min(0.8, y / 2.8) }); }
    for (let i = 0; i < 3; i++) parts.push({ g: at(noisy(new IcosahedronGeometry(0.32, 0), 0.2, i), Math.sin(i * 2.1) * 0.5, 2.1 + i * 0.2, Math.cos(i * 2.1) * 0.5), color: () => mix(L0, L1, 0.5), sway: () => 0.9 });
  } else if (kind === 'cypress') {
    parts.push({ g: at(new CylinderGeometry(0.08, 0.15, 1.0, 6), 0, 0.5, 0), color: barkCol, sway: trunkSway });
    parts.push({ g: at(noisy(new SphereGeometry(0.62, 10, 12), 0.12, 4), 0, 2.2, 0, 0, 0, 0, 1, 2.3, 1), color: (y, k) => mix(L0, L2, (y - 0.8) / 3).multiplyScalar(0.82 + ((k * 7) % 9) / 30), sway: y => 0.35 + Math.min(0.65, (y - 0.6) / 3.5) });
  } else if (kind === 'mushroom') {
    parts.push({ g: at(new CylinderGeometry(0.16, 0.24, 1.5, 8), 0, 0.75, 0), color: () => new Color('#d8d0c4').multiplyScalar(0.8), sway: y => y / 6 });
    parts.push({ g: at(noisy(new SphereGeometry(0.95, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0.06, 1), 0, 1.45, 0, 0, 0, 0, 1, 0.55, 1), color: (y, k) => mix(L0, L2, (y - 1.4) / 0.6).multiplyScalar(0.9 + (k % 5) / 25), sway: () => 0.3 });
  } else {
    for (let i = 0; i < 5; i++) { const a = i * 1.3, tilt = i ? 0.45 : 0, h = i ? 1.1 : 1.9; parts.push({ g: at(new OctahedronGeometry(0.32, 0), Math.sin(a) * 0.35 * (i ? 1 : 0), h / 2 + 0.1, Math.cos(a) * 0.35 * (i ? 1 : 0), Math.cos(a) * tilt, a, -Math.sin(a) * tilt, 0.7, h * 1.6, 0.7), color: y => mix('#14101a', pal.glow ?? '#9fe6ff', 0.25 + y / 3), sway: () => 0 }); }
  }
  return bake(parts);
}

// ---------------------------------------------------------------- the nature object
export type Nature = { group: Group; update: (time: number, actors: Actor[]) => void; dispose: () => void; setWind: (x: number, z: number, strength: number) => void;
  /** where the camera is and what it looks at (the hero) — foliage in between dissolves */ setView: (cam: Vector3, focus: Vector3) => void };
const QUALITY = { low: { grass: 2600, leaves: 40, shadows: false }, medium: { grass: 6500, leaves: 90, shadows: true }, high: { grass: 12000, leaves: 160, shadows: true } };

export function createNature(layout: NatureLayout, quality: Quality = 'medium'): Nature {
  const q = QUALITY[quality], group = new Group(); group.name = 'SoulForgeNature';
  const disposables: { dispose(): void }[] = [];
  const m4 = new Matrix4(), quat = new Quaternion(), up = new Vector3(0, 1, 0), v = new Vector3(), sc = new Vector3();
  const place = (mesh: InstancedMesh, i: number, x: number, z: number, rot: number, s: number, sy = s) => { quat.setFromAxisAngle(up, rot); m4.compose(v.set(x, 0, z), quat, sc.set(s, sy, s)); mesh.setMatrixAt(i, m4); };

  // trees (instanced per kind)
  const all: Prop[] = [...layout.trees, ...layout.backdrop];
  const kinds = [...new Set(all.map(t => t.kind))];
  for (const kind of kinds) {
    const list = all.filter(t => t.kind === kind), geo = treeGeometry(kind, layout.palette);
    const glow = kind === 'crystal' || kind === 'mushroom';
    const sway = kind === 'crystal' ? 0 : kind === 'mushroom' ? 0.08 : kind === 'pine' ? 0.22 : 0.3, flutter = kind === 'crystal' ? 0 : kind === 'pine' ? 0.015 : 0.03;
    const mat = windPatch(new MeshStandardMaterial({ vertexColors: true, roughness: 0.85, metalness: kind === 'crystal' ? 0.3 : 0, flatShading: kind !== 'cypress', emissive: glow ? new Color(layout.palette.glow ?? '#ffffff') : new Color(0), emissiveIntensity: kind === 'crystal' ? 0.9 : kind === 'mushroom' ? 0.18 : 0 }), { sway, flutter, cutout: true }, 'tree-' + kind);
    const mesh = new InstancedMesh(geo, mat, list.length); mesh.castShadow = q.shadows; mesh.receiveShadow = true;
    mesh.customDepthMaterial = windDepth({ sway, flutter }, 'tree-' + kind);
    list.forEach((t, i) => { place(mesh, i, t.x, t.z, t.rot, t.s); mesh.setColorAt(i, new Color(1, 1, 1).multiplyScalar(0.82 + t.tint * 0.3)); });
    mesh.instanceMatrix.needsUpdate = true; group.add(mesh); disposables.push(geo, mat);
  }

  // rocks & tombstones
  if (layout.rocks.length) {
    const rockGeo = bake([{ g: noisy(new IcosahedronGeometry(1, 1), 0.22, 7), color: (y, k) => mix(layout.palette.rock, y > 0.45 ? (layout.palette.leaf[0]) : layout.palette.rock, y > 0.45 ? 0.6 : 0).multiplyScalar(0.75 + (k % 7) / 25), sway: () => 0 }]);
    rockGeo.translate(0, 0.35, 0);
    const tombGeo = bake([{ g: at(new CylinderGeometry(0.32, 0.32, 0.12, 12, 1, false, 0, Math.PI), 0, 0.62, 0, Math.PI / 2, 0, Math.PI / 2), color: () => new Color(layout.palette.rock), sway: () => 0 }, { g: at(new CylinderGeometry(0.32, 0.34, 0.62, 4, 1), 0, 0.31, 0, 0, Math.PI / 4, 0, 1, 1, 0.27), color: (y) => mix('#2a282c', layout.palette.rock, y * 1.5), sway: () => 0 }]);
    const rmat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true });
    const low = layout.rocks.filter(r => !r.tall), tall = layout.rocks.filter(r => r.tall);
    for (const [geo, list] of [[rockGeo, low], [tombGeo, tall]] as const) {
      if (!list.length) continue; const mesh = new InstancedMesh(geo, rmat, list.length); mesh.castShadow = q.shadows; mesh.receiveShadow = true;
      list.forEach((r, i) => { place(mesh, i, r.x, r.z, r.rot, r.tall ? r.s * 1.6 : r.s, r.tall ? r.s * 1.6 : r.s * 0.7); });
      group.add(mesh); disposables.push(geo);
    }
    disposables.push(rmat);
  }

  // bushes (sway + part around walkers)
  if (layout.bushes.length) {
    const bgeo = bake([[0, 0.32, 0, 0.42], [0.32, 0.24, 0.1, 0.3], [-0.28, 0.25, -0.12, 0.32], [0.05, 0.22, -0.3, 0.28]].map(([x, y, z, r], i) => ({ g: at(noisy(new IcosahedronGeometry(r, 1), 0.18, i * 3), x, y, z), color: (yy: number, k: number) => mix(layout.palette.leaf[0], layout.palette.leaf.at(-1)!, yy / 0.6).multiplyScalar(0.8 + (k % 6) / 25), sway: (yy: number) => Math.min(1, yy / 0.7) })));
    const bm = windPatch(new MeshStandardMaterial({ vertexColors: true, roughness: 0.9, flatShading: true }), { sway: 0.06, flutter: 0.02, trample: 0.28, down: 0.18, cutout: true }, 'bush');
    const mesh = new InstancedMesh(bgeo, bm, layout.bushes.length); mesh.castShadow = q.shadows; mesh.receiveShadow = true; mesh.customDepthMaterial = windDepth({ sway: 0.06, flutter: 0.02, trample: 0.28 }, 'bush');
    layout.bushes.forEach((b, i) => { place(mesh, i, b.x, b.z, b.tint * 6.28, b.s); mesh.setColorAt(i, new Color(1, 1, 1).multiplyScalar(0.85 + b.tint * 0.3)); });
    group.add(mesh); disposables.push(bgeo, bm);
  }

  // grass: 3-blade clumps; trample radius per actor, bends and flattens where something walks
  const gs = layout.grass, count = Math.round(q.grass * gs.density);
  if (count > 0) {
    const blade = (rot: number, lean: number) => {
      const w = 0.05, pts = [[-w, 0], [w, 0], [-w * 0.7, 0.4], [w * 0.7, 0.4], [-w * 0.35, 0.75], [w * 0.35, 0.75], [0, 1]];
      const tri = [0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6], pos: number[] = [];
      for (const i of tri) { const [x, y] = pts[i]; const z = y * y * lean; pos.push(x * Math.cos(rot) - z * Math.sin(rot), y, x * Math.sin(rot) + z * Math.cos(rot)); }
      const g = new BufferGeometry(); g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3)); return g;
    };
    const parts: Part[] = [0, 2.1, 4.2].map((r, i) => ({ g: at(blade(r, 0.18 + i * 0.05), Math.sin(r) * 0.04, 0, Math.cos(r) * 0.04), color: (y: number) => mix(gs.colorA, gs.colorB, y), sway: (y: number) => y }));
    const geo = bake(parts); const n = geo.attributes.normal as BufferAttribute; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
    const mat = windPatch(new MeshStandardMaterial({ vertexColors: true, roughness: 1, side: DoubleSide }), { sway: 0.12, flutter: 0.04, trample: 0.42, down: 0.25, noFlip: true }, 'grass');
    const mesh = new InstancedMesh(geo, mat, count); mesh.receiveShadow = q.shadows; mesh.frustumCulled = false;
    let made = 0, tries = 0; const col = new Color();
    const patch = (x: number, z: number) => 0.5 + 0.5 * Math.sin(x * 0.31 + Math.sin(z * 0.17) * 2) * Math.cos(z * 0.27 + Math.cos(x * 0.13) * 2);
    const flowerSpots: [number, number, number][] = [];
    while (made < count && tries++ < count * 8) {
      const x = (Math.random() * 2 - 1) * ((WORLD_LIMIT[layout.city]??23)-.4), z = (Math.random() * 2 - 1) * ((WORLD_LIMIT[layout.city]??23)-.4);
      if (!layout.allowGrass(x, z) || Math.random() > 0.25 + 0.75 * patch(x, z)) continue;
      const h = gs.height * (0.6 + Math.random() * 0.8) * (0.7 + patch(x, z) * 0.6);
      place(mesh, made, x, z, Math.random() * 6.28, 0.9 + Math.random() * 0.5, h);
      mesh.setColorAt(made, col.setRGB(1, 1, 1).multiplyScalar(0.75 + Math.random() * 0.45)); made++;
      if (gs.flowers.length && Math.random() < 0.035) flowerSpots.push([x + 0.1, z + 0.08, Math.floor(Math.random() * gs.flowers.length)]);
    }
    mesh.count = made; group.add(mesh); disposables.push(geo, mat);
    if (flowerSpots.length) {
      const fgeo = bake([{ g: at(new CylinderGeometry(0.008, 0.01, 0.32, 3), 0, 0.16, 0), color: () => new Color(gs.colorA), sway: y => y / 0.4 }, { g: at(new OctahedronGeometry(0.045, 0), 0, 0.34, 0), color: () => new Color(1, 1, 1), sway: () => 0.9 }]);
      const fmat = windPatch(new MeshStandardMaterial({ vertexColors: true, roughness: 0.6, emissive: new Color(0.08, 0.08, 0.08) }), { sway: 0.1, flutter: 0.05, trample: 0.35, down: 0.12 }, 'flower');
      const fm = new InstancedMesh(fgeo, fmat, flowerSpots.length);
      flowerSpots.forEach(([x, z, c], i) => { place(fm, i, x, z, i, 0.9 + Math.random() * 0.4); fm.setColorAt(i, new Color(gs.flowers[c])); });
      group.add(fm); disposables.push(fgeo, fmat);
    }
  }

  // drifting leaves around trees
  let leafPts: Points | null = null; const leafState: { x: number; y: number; z: number; ox: number; oz: number; t: number; sp: number }[] = [];
  const canopy = layout.trees.filter(t => t.kind !== 'crystal');
  if (canopy.length && q.leaves) {
    const tex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d')!; g.fillStyle = '#fff'; g.beginPath(); g.ellipse(16, 16, 13, 6, 0.6, 0, Math.PI * 2); g.fill(); return new CanvasTexture(c); })();
    const pos = new Float32Array(q.leaves * 3), geo = new BufferGeometry(); geo.setAttribute('position', new BufferAttribute(pos, 3).setUsage(DynamicDrawUsage));
    for (let i = 0; i < q.leaves; i++) { const t = canopy[i % canopy.length]; leafState.push({ x: t.x, y: 2 + Math.random() * 1.5, z: t.z, ox: t.x, oz: t.z, t: Math.random() * 6, sp: 0.4 + Math.random() * 0.5 }); }
    const lm = new PointsMaterial({ map: tex, color: layout.palette.leaf.at(-1), size: 0.16, transparent: true, alphaTest: 0.3, depthWrite: false });
    leafPts = new Points(geo, lm); leafPts.frustumCulled = false; group.add(leafPts); disposables.push(geo, lm, tex);
  }

  let lastT = 0;
  return {
    group,
    setWind: (x, z, s) => { uniforms.uWind.value.set(x, z, s); },
    setView: (cam, focus) => { uniforms.uCam.value.copy(cam); uniforms.uFocus.value.copy(focus); },
    update: (time, actors) => {
      const dt = Math.min(0.05, Math.max(0, time - (lastT || time))) * 60; lastT = time; // leaf drift in 60 fps units, frame-rate independent
      uniforms.uTime.value = time; const n = Math.min(MAX_ACTORS, actors.length); uniforms.uActorCount.value = n;
      for (let i = 0; i < n; i++) uniforms.uActors.value[i].set(actors[i].x, actors[i].z, actors[i].r, 0);
      if (leafPts) {
        const p = leafPts.geometry.attributes.position as BufferAttribute, w = uniforms.uWind.value;
        leafState.forEach((l, i) => {
          l.t += 0.016 * dt; l.y -= 0.004 * l.sp * dt; l.x += (w.x * w.z * 0.01 + Math.sin(l.t * 2 + i) * 0.006) * dt; l.z += (w.y * w.z * 0.01 + Math.cos(l.t * 1.7 + i) * 0.006) * dt;
          if (l.y < 0.03) { l.y = 2 + Math.random() * 1.6; l.x = l.ox + (Math.random() - 0.5) * 1.6; l.z = l.oz + (Math.random() - 0.5) * 1.6; }
          p.setXYZ(i, l.x, l.y, l.z);
        });
        p.needsUpdate = true;
      }
    },
    dispose: () => { group.removeFromParent(); disposables.forEach(d => d.dispose()); group.traverse((o: Object3D) => { const m = o as InstancedMesh; if (m.isInstancedMesh) m.dispose(); }); },
  };
}
