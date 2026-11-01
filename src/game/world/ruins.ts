// Procedural 3D ruins for the Sorrowlands (world/zones.ts): abandoned village, burnt castle, collapsed cathedral and a
// crystal cave, plus the ashen ground and roads that connect them to Hollow Reach. Plain three.js (works in R3F via
// <primitive> and in the preview). Every zone is merged into a few meshes per material, and returns its colliders.
import {
  BoxGeometry, BufferGeometry, CircleGeometry, Color, ConeGeometry, CylinderGeometry, DodecahedronGeometry, Float32BufferAttribute, Group, IcosahedronGeometry,
  Matrix4, Mesh, MeshStandardMaterial, PlaneGeometry, PointLight, Quaternion, TorusGeometry, Vector3, Euler, DoubleSide, type Material,
} from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Collider } from './colliders';
import { WORLD_HALF, ZONES, type Zone } from './zones';

function rng(seed: number) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
type MatKey = 'stone' | 'stoneDark' | 'wood' | 'roof' | 'moss' | 'iron' | 'bone' | 'crystal' | 'soil' | 'cloth' | 'rock';
const MAT_DEF: Record<MatKey, { color: string; rough: number; metal?: number; emissive?: string; ei?: number; flat?: boolean }> = {
  stone: { color: '#6d6870', rough: 0.92, flat: true }, stoneDark: { color: '#3f3c45', rough: 0.95, flat: true }, wood: { color: '#4a3a2c', rough: 0.9, flat: true },
  roof: { color: '#2f3038', rough: 0.85, flat: true }, moss: { color: '#3c4a33', rough: 1, flat: true }, iron: { color: '#3a3836', rough: 0.55, metal: 0.7 },
  bone: { color: '#cfc4ad', rough: 0.8, flat: true }, crystal: { color: '#4fc8d8', rough: 0.25, metal: 0.1, emissive: '#2fb4c8', ei: 1.4, flat: true },
  soil: { color: '#2b2622', rough: 1 }, cloth: { color: '#5a1f24', rough: 0.95 }, rock: { color: '#4c4a4c', rough: 0.95, flat: true },
};
let MATS: Record<MatKey, MeshStandardMaterial> | null = null;
/** camera → hero segment: walls, roofs and rocks in between dissolve (screen-door dither) so the isometric view never hides you */
const view = { uCam: { value: new Vector3(0, 60, 0) }, uFocus: { value: new Vector3() } };
export function setRuinsView(cam: Vector3, focus: Vector3) { view.uCam.value.copy(cam); view.uFocus.value.copy(focus); }
function cutout(m: MeshStandardMaterial) {
  m.onBeforeCompile = shader => {
    shader.uniforms.uCam = view.uCam; shader.uniforms.uFocus = view.uFocus;
    shader.vertexShader = 'varying vec3 vRuinWorld;\n' + shader.vertexShader.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\n  vRuinWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    shader.fragmentShader = 'varying vec3 vRuinWorld; uniform vec3 uCam; uniform vec3 uFocus;\n' + shader.fragmentShader.replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
      { vec3 seg = uFocus - uCam; float L = max(length(seg), 1e-3); vec3 dir = seg / L; float t = dot(vRuinWorld - uCam, dir);
        if (t > 0.0 && t < L - 0.8 && vRuinWorld.y > 0.35) { float d = length(vRuinWorld - (uCam + dir * t)); float k = 1.0 - smoothstep(1.6, 3.2, d);
          float dither = fract(dot(floor(gl_FragCoord.xy), vec2(0.5, 0.25)) + fract(gl_FragCoord.y * 0.5) * 0.5);
          if (k * 0.9 > dither) discard; } }`);
  };
  m.customProgramCacheKey = () => 'ruin-cutout';
}
function mats() {
  if (MATS) return MATS;
  MATS = Object.fromEntries(Object.entries(MAT_DEF).map(([k, d]) => { const m = new MeshStandardMaterial({ color: d.color, roughness: d.rough, metalness: d.metal ?? 0, flatShading: !!d.flat, emissive: d.emissive ?? '#000', emissiveIntensity: d.ei ?? 0 }); if (k === 'cloth') m.side = DoubleSide; if (k !== 'soil') cutout(m); return [k, m]; })) as Record<MatKey, MeshStandardMaterial>;
  return MATS;
}

/** accumulates transformed geometry per material, merged at the end */
class Kit {
  parts = new Map<MatKey, BufferGeometry[]>(); colliders: Collider[] = []; lights: { x: number; y: number; z: number; color: string; i: number }[] = [];
  private m = new Matrix4(); private q = new Quaternion(); private e = new Euler(); private v = new Vector3(); private s = new Vector3();
  constructor(public r: () => number) {}
  add(mat: MatKey, g: BufferGeometry, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    this.m.compose(this.v.set(x, y, z), this.q.setFromEuler(this.e.set(rx, ry, rz)), this.s.set(sx, sy, sz));
    const gg = g.index ? g.toNonIndexed() : g.clone(); gg.applyMatrix4(this.m); for (const k of Object.keys(gg.attributes)) if (k !== 'position' && k !== 'normal') gg.deleteAttribute(k);
    (this.parts.get(mat) ?? this.parts.set(mat, []).get(mat)!).push(gg);
  }
  box(mat: MatKey, w: number, h: number, d: number, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0) { this.add(mat, new BoxGeometry(w, h, d), x, y + h / 2, z, rx, ry, rz); }
  cyl(mat: MatKey, rt: number, rb: number, h: number, x: number, y: number, z: number, seg = 8, rx = 0, rz = 0) { this.add(mat, new CylinderGeometry(rt, rb, h, seg), x, y + h / 2, z, rx, 0, rz); }
  rock(mat: MatKey, r: number, x: number, z: number, y = 0, sy = 0.7) { this.add(mat, new DodecahedronGeometry(r, 0), x, y + r * sy * 0.5, z, this.r() * 3, this.r() * 3, this.r() * 3, 1, sy, 1 + this.r() * 0.3); }
  wallBox(x: number, z: number, hw: number, hd: number, rot = 0) { this.colliders.push({ kind: 'box', x, z, hw, hd, rot }); }
  circle(x: number, z: number, r: number) { this.colliders.push({ kind: 'circle', x, z, r }); }
  /** a stone wall from (x0,z0) to (x1,z1) built of blocks, broken on top and with random gaps */
  wall(x0: number, z0: number, x1: number, z1: number, h: number, t = 0.6, mat: MatKey = 'stone', gapChance = 0.12, collide = true) {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 1.2)), ry = -Math.atan2(z1 - z0, x1 - x0);
    for (let i = 0; i < n; i++) {
      if (this.r() < gapChance && i > 0 && i < n - 1) continue;
      const k = (i + 0.5) / n, x = x0 + (x1 - x0) * k, z = z0 + (z1 - z0) * k, seg = len / n;
      const hh = h * (0.45 + this.r() * 0.55) * (i % 3 === 1 ? 0.8 : 1);
      this.box(this.r() < 0.2 ? 'stoneDark' : mat, seg * 1.02, hh, t, x, 0, z, ry, 0, (this.r() - 0.5) * 0.04);
      if (collide) this.wallBox(x, z, seg / 2, t / 2 + 0.05, -ry);
    }
  }
  rubble(x: number, z: number, n: number, spread: number, mat: MatKey = 'stone') { for (let i = 0; i < n; i++) { const a = this.r() * 6.28, d = this.r() * spread; this.rock(mat, 0.15 + this.r() * 0.35, x + Math.cos(a) * d, z + Math.sin(a) * d, 0, 0.6); } }
  deadTree(x: number, z: number, s = 1) {
    const h = (2.2 + this.r() * 1.6) * s; this.cyl('wood', 0.07 * s, 0.22 * s, h, x, 0, z, 6, (this.r() - 0.5) * 0.15, (this.r() - 0.5) * 0.15);
    for (let i = 0; i < 4; i++) { const a = this.r() * 6.28, y = h * (0.45 + this.r() * 0.45), l = (0.6 + this.r() * 0.9) * s;
      this.add('wood', new CylinderGeometry(0.02 * s, 0.07 * s, l, 5), x + Math.cos(a) * l * 0.35, y + l * 0.3, z + Math.sin(a) * l * 0.35, Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); }
    this.circle(x, z, 0.35 * s);
  }
  grave(x: number, z: number, ry = 0) {
    if (this.r() < 0.5) { this.box('stone', 0.55, 0.75 + this.r() * 0.3, 0.14, x, 0, z, ry, (this.r() - 0.5) * 0.3, (this.r() - 0.5) * 0.25); this.add('stone', new CylinderGeometry(0.275, 0.275, 0.14, 10, 1, false, 0, Math.PI), x, 0.85, z, Math.PI / 2, ry, Math.PI / 2); }
    else { this.box('stoneDark', 0.12, 0.95, 0.12, x, 0, z, ry, (this.r() - 0.5) * 0.3); this.box('stoneDark', 0.55, 0.12, 0.12, x, 0.62, z, ry); }
    this.box('soil', 0.7, 0.08, 1.3, x, 0, z + 0.75, ry); this.circle(x, z, 0.3);
  }
  lantern(x: number, z: number, color = '#ffb35a', i = 2.2) { this.cyl('iron', 0.04, 0.05, 1.6, x, 0, z, 6); this.box('iron', 0.22, 0.28, 0.22, x, 1.6, z); this.lights.push({ x, y: 1.8, z, color, i }); this.circle(x, z, 0.15); }
  fence(x0: number, z0: number, x1: number, z1: number) {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 0.9), ry = -Math.atan2(z1 - z0, x1 - x0);
    for (let i = 0; i <= n; i++) { if (this.r() < 0.2) continue; const k = i / n; this.box('wood', 0.1, 0.8 + this.r() * 0.3, 0.1, x0 + (x1 - x0) * k, 0, z0 + (z1 - z0) * k, ry, (this.r() - 0.5) * 0.35, (this.r() - 0.5) * 0.3); }
    if (this.r() < 0.8) this.box('wood', len, 0.07, 0.06, (x0 + x1) / 2, 0.55, (z0 + z1) / 2, ry, 0, (this.r() - 0.5) * 0.08);
    this.wallBox((x0 + x1) / 2, (z0 + z1) / 2, len / 2, 0.12, -ry);
  }
  build(name: string) {
    const g = new Group(); g.name = name; const M = mats();
    for (const [k, list] of this.parts) { const geo = mergeGeometries(list, false); if (!geo) continue; geo.computeBoundingSphere(); const mesh = new Mesh(geo, M[k] as Material); mesh.castShadow = k !== 'soil'; mesh.receiveShadow = true; g.add(mesh); }
    for (const l of this.lights) { const p = new PointLight(l.color, l.i, 7, 2); p.position.set(l.x, l.y, l.z); g.add(p); }
    return g;
  }
}

// ---------------------------------------------------------------- the four zones
function house(k: Kit, x: number, z: number, ry: number, w = 4, d = 3.4) {
  const c = Math.cos(ry), s = Math.sin(ry), P = (lx: number, lz: number) => [x + lx * c + lz * s, z - lx * s + lz * c] as const, h = 2.2;
  const corners = [P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(-w / 2, d / 2)];
  for (let i = 0; i < 4; i++) { const [a, b] = [corners[i], corners[(i + 1) % 4]]; if (i === 2) { const [m0, m1] = [P(-0.7, d / 2), P(0.7, d / 2)]; k.wall(b[0], b[1], m1[0], m1[1], h, 0.35, 'stone', 0.05); k.wall(m0[0], m0[1], a[0], a[1], h, 0.35, 'stone', 0.05); k.box('wood', 1.5, 0.18, 0.4, (m0[0] + m1[0]) / 2, 2.0, (m0[1] + m1[1]) / 2, ry); } else k.wall(a[0], a[1], b[0], b[1], h, 0.35, 'stone', 0.18); }
  // gable roof, partly fallen in
  const rh = 1.3; const slope = Math.atan2(rh, d / 2), len = Math.hypot(rh, d / 2);
  for (const side of [-1, 1]) {
    const broken = k.r() < 0.55; const [cx, cz] = P(0, side * d / 4);
    if (!broken) k.add('roof', new BoxGeometry(w + 0.4, 0.12, len + 0.2), cx, h + rh / 2, cz, side * slope, -ry + Math.PI * 0, 0);
    else { for (let i = 0; i < 3; i++) if (k.r() < 0.6) { const [px, pz] = P(-w / 2 + (i + 0.5) * w / 3, side * d / 4); k.add('roof', new BoxGeometry(w / 3 - 0.1, 0.1, len * (0.4 + k.r() * 0.5)), px, h + rh / 2 + 0.1, pz, side * slope * (0.6 + k.r() * 0.6), -ry, (k.r() - 0.5) * 0.3); } }
  }
  const [ch, cz2] = P(w / 2 - 0.6, -0.4); k.box('stoneDark', 0.55, 3.8, 0.55, ch, 0, cz2, ry);
  for (const [lx, lz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]]) { const [px, pz] = P(lx, lz); k.box('wood', 0.25, h + 0.2, 0.25, px, 0, pz, ry); }
  k.rubble(...P(0, 0), 6, 1.4, 'wood'); k.rubble(...P(w / 2 + 0.8, 0.5), 4, 0.8);
}
function village(z: Zone, k: Kit) {
  const spots: [number, number, number][] = [[-6, -6, 0.3], [5, -7, -0.2], [-8, 4, 1.5], [6, 5, 1.8], [-1, 9, 0.1], [9, -1, 2.6]];
  for (const [x, zz, ry] of spots) house(k, z.x + x, z.z + zz, ry, 3.6 + k.r(), 3 + k.r() * 0.8);
  // the dry well
  k.cyl('stone', 0.9, 1, 0.8, z.x, 0, z.z, 12); k.cyl('stoneDark', 0.7, 0.7, 0.82, z.x, 0, z.z, 12); k.box('wood', 0.12, 2, 0.12, z.x - 0.8, 0, z.z); k.box('wood', 0.12, 2, 0.12, z.x + 0.8, 0, z.z); k.box('roof', 2.1, 0.1, 1.2, z.x, 2, z.z, 0, 0.4); k.circle(z.x, z.z, 1.1);
  k.fence(z.x - 11, z.z - 10, z.x - 3, z.z - 12); k.fence(z.x + 3, z.z + 12, z.x + 11, z.z + 9); k.fence(z.x - 12, z.z + 8, z.x - 10, z.z - 2);
  for (let i = 0; i < 12; i++) { const a = k.r() * 6.28, d = 8 + k.r() * 5; k.deadTree(z.x + Math.cos(a) * d, z.z + Math.sin(a) * d, 0.9 + k.r() * 0.5); }
  for (let i = 0; i < 7; i++) k.grave(z.x + 2 + (i % 4) * 1.4, z.z - 11 - Math.floor(i / 4) * 1.6, 0.1);
  // broken cart
  k.box('wood', 2, 0.15, 1.1, z.x + 3, 0.5, z.z + 1.5, 0.4, 0, 0.25); k.add('wood', new TorusGeometry(0.42, 0.06, 5, 10), z.x + 2.4, 0.42, z.z + 2.1, 0, 0.4, 0); k.circle(z.x + 3, z.z + 1.5, 1);
  k.lantern(z.x + 2, z.z - 2, '#ff9b4a', 1.6); k.lantern(z.x - 4, z.z + 6, '#ff9b4a', 1.4);
}
function tower(k: Kit, x: number, z: number, r: number, h: number) {
  k.cyl('stone', r, r * 1.08, h, x, 0, z, 12); k.circle(x, z, r + 0.1);
  for (let i = 0; i < 10; i++) { if (k.r() < 0.35) continue; const a = i / 10 * 6.28; k.box('stoneDark', 0.55, 0.6 + k.r() * 0.5, 0.45, x + Math.cos(a) * r * 0.85, h, z + Math.sin(a) * r * 0.85, -a); }
  k.box('roof', 0.2, 0.6, 0.5, x + r, h * 0.6, z, 0); // arrow slit frame
}
function castle(z: Zone, k: Kit) {
  const W = 9, D = 7, cx = z.x, cz = z.z;
  const C: [number, number][] = [[cx - W, cz - D], [cx + W, cz - D], [cx + W, cz + D], [cx - W, cz + D]];
  for (let i = 0; i < 4; i++) {
    const [a, b] = [C[i], C[(i + 1) % 4]];
    if (i === 3) { k.wall(a[0], a[1], a[0] + (b[0] - a[0]) * 0.3, a[1], 4.2, 1, 'stone', 0.15); k.wall(a[0] + (b[0] - a[0]) * 0.62, a[1], b[0], b[1], 3.8, 1, 'stone', 0.25); }
    else if (i === 1) { k.wall(a[0], a[1], a[0], a[1] + (b[1] - a[1]) * 0.4, 3.6, 1, 'stone', 0.2); k.wall(a[0], a[1] + (b[1] - a[1]) * 0.6, b[0], b[1], 3.4, 1, 'stone', 0.3); }
    else k.wall(a[0], a[1], b[0], b[1], 4.4, 1, 'stone', 0.18);
  }
  for (const [x, zz] of C) tower(k, x, zz, 1.7, 6 + k.r() * 2.5);
  // gatehouse arch on the west side (facing the city)
  const gx = cx - W * 0.08, gz = cz + D; k.box('stoneDark', 1.2, 5.2, 1.6, gx - 2.2, 0, gz); k.box('stoneDark', 1.2, 4.8, 1.6, gx + 2.2, 0, gz); k.box('stone', 5.6, 1, 1.6, gx, 4.4, gz);
  k.wallBox(gx - 2.2, gz, 0.6, 0.8); k.wallBox(gx + 2.2, gz, 0.6, 0.8);
  // the burnt keep and its fallen roof beams
  k.box('stoneDark', 5, 7.5, 4.4, cx + 3, 0, cz - 2.5, 0.05); k.wallBox(cx + 3, cz - 2.5, 2.5, 2.2, -0.05);
  for (let i = 0; i < 5; i++) k.box('wood', 0.25, 0.25, 3.4, cx - 1.6 + k.r() * 2, 0.1, cz - 0.5 + i * 0.5, k.r() * 3, 0, (k.r() - 0.5) * 0.3);
  // torn banners and rubble
  for (const [x, zz] of [[gx - 2.2, gz + 0.85], [gx + 2.2, gz + 0.85]]) k.add('cloth', new PlaneGeometry(0.9, 2.2, 1, 3), x, 3, zz, 0, 0, 0.04);
  k.rubble(cx - 4, cz - 3, 14, 2.5); k.rubble(cx + W - 1, cz + 2, 10, 2); k.rubble(cx - 2, cz + D - 1.5, 8, 2, 'stoneDark');
  for (let i = 0; i < 8; i++) { const a = k.r() * 6.28, d = 12 + k.r() * 3; k.deadTree(cx + Math.cos(a) * d, cz + Math.sin(a) * d, 1 + k.r() * 0.4); }
  k.lantern(cx - 5, cz + D - 2, '#ff6a3a', 2); k.lantern(cx + 5, cz + 1, '#ff6a3a', 1.6);
}
function cathedral(z: Zone, k: Kit) {
  const cx = z.x, cz = z.z, L = 16, Wn = 7; // nave along z, entrance faces the city (south, +z)
  for (const side of [-1, 1]) {
    const x = cx + side * Wn / 2;
    for (let i = 0; i < 7; i++) {
      const z0 = cz + L / 2 - i * (L / 7), z1 = z0 - L / 7 + 0.5;
      if (i === 3 && side === 1) continue; // collapsed bay
      k.wall(x, z0, x, z1, 6.5 - (i % 2) * 1.2 - k.r() * 1.5, 0.8, 'stone', 0.05);
      k.box('stoneDark', 1, 7.5 - k.r() * 2, 1, x + side * 0.6, 0, z1 - 0.25); k.wallBox(x + side * 0.6, z1 - 0.25, 0.5, 0.5); // buttress
      // pointed window frame
      k.add('stoneDark', new ConeGeometry(0.75, 1.3, 4, 1, true), x, 5.1, (z0 + z1) / 2, 0, Math.PI / 4, 0, 0.3, 1, 1);
    }
  }
  // columns inside, some fallen
  for (let i = 0; i < 6; i++) for (const side of [-1, 1]) {
    const x = cx + side * 1.8, zz = cz + L / 2 - 2 - i * 2.4;
    if (k.r() < 0.3) { k.add('stone', new CylinderGeometry(0.35, 0.35, 4.5, 10), x + side * 1.2, 0.35, zz, Math.PI / 2, k.r() * 2, 0); k.circle(x + side * 1.2, zz, 0.6); }
    else { const h = 3 + k.r() * 3; k.cyl('stone', 0.32, 0.38, h, x, 0, zz, 10); k.circle(x, zz, 0.4); }
  }
  // front facade with the rose window ring, apse at the back
  const fz = cz + L / 2; k.wall(cx - Wn / 2, fz, cx - 1.4, fz, 9, 1, 'stone', 0); k.wall(cx + 1.4, fz, cx + Wn / 2, fz, 8, 1, 'stone', 0.1);
  k.add('stoneDark', new TorusGeometry(1.4, 0.22, 6, 16), cx, 7.6, fz, 0, 0, 0); k.box('stoneDark', 3.2, 1, 1, cx, 9, fz);
  for (let i = 0; i <= 6; i++) { const a = Math.PI + i / 6 * Math.PI, x = cx + Math.cos(a) * Wn / 2, zz = cz - L / 2 + Math.sin(a) * 3.5; if (i % 3 === 1) continue; k.box('stone', 1.6, 5 + k.r() * 2, 0.8, x, 0, zz, -a + Math.PI / 2); k.wallBox(x, zz, 0.8, 0.4, a - Math.PI / 2); }
  k.box('bone', 2.2, 1, 1, cx, 0, cz - L / 2 + 1); k.wallBox(cx, cz - L / 2 + 1, 1.1, 0.5); // altar
  // broken bell tower
  tower(k, cx + Wn / 2 + 2, fz - 1, 1.5, 11);
  // graves of the knights and candles
  for (let i = 0; i < 16; i++) { const side = i % 2 ? 1 : -1; k.grave(cx + side * (Wn / 2 + 3 + (i % 3) * 1.3), cz - 5 + Math.floor(i / 2) * 1.7, side * 0.15); }
  for (let i = 0; i < 6; i++) k.deadTree(cx + (k.r() - 0.5) * 26, cz - 12 - k.r() * 3, 1.1);
  k.rubble(cx + 2.5, cz + 1, 16, 2.5); k.rubble(cx - 2, cz - 4, 10, 2, 'stoneDark');
  k.lantern(cx - 1.2, cz - L / 2 + 2.5, '#9fd1ff', 1.8); k.lantern(cx + 1.2, cz - L / 2 + 2.5, '#9fd1ff', 1.8); k.lantern(cx, fz + 2, '#ffb35a', 1.6);
}
function cave(z: Zone, k: Kit) {
  const cx = z.x, cz = z.z;
  // cliff ring with an opening toward the city (north, −z)
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) < 0.42) continue;
    const r = 10.5 + k.r() * 1.5, s = 1.6 + k.r() * 1.4, x = cx + Math.cos(a) * r, zz = cz + Math.sin(a) * r;
    // the half that faces the isometric camera (+x, +z) stays low so the inside is never hidden
    const front = Math.cos(a) + Math.sin(a) > 0.2; k.rock('rock', front ? s * 0.7 : s, x, zz, 0, front ? 0.5 : 1.6 + k.r()); k.circle(x, zz, s * 0.75);
  }
  // cave mouth: arch of boulders at the back with a dark pit
  const mx = cx, mz = cz + 8; k.rock('rock', 2.6, mx - 2.8, mz, 0, 1.8); k.rock('rock', 2.6, mx + 2.8, mz, 0, 1.8); k.add('rock', new IcosahedronGeometry(2.4, 0), mx, 4.2, mz, 0, 0, 0, 2, 0.7, 1.2);
  k.add('soil', new CircleGeometry(2.4, 12), mx, 0.03, mz - 0.4, -Math.PI / 2, 0, 0); k.circle(mx - 2.8, mz, 2); k.circle(mx + 2.8, mz, 2); k.wallBox(mx, mz + 1, 2, 0.8);
  // stalagmites, tear crystals, bones
  for (let i = 0; i < 22; i++) { const a = k.r() * 6.28, d = 2 + k.r() * 7.5, x = cx + Math.cos(a) * d, zz = cz + Math.sin(a) * d; const h = 0.6 + k.r() * 1.8; k.add('rock', new ConeGeometry(0.25 + k.r() * 0.3, h, 6), x, h / 2, zz, (k.r() - 0.5) * 0.2, 0, (k.r() - 0.5) * 0.2); if (h > 1.4) k.circle(x, zz, 0.3); }
  for (let i = 0; i < 14; i++) { const a = k.r() * 6.28, d = 3 + k.r() * 7, x = cx + Math.cos(a) * d, zz = cz + Math.sin(a) * d, h = 0.4 + k.r() * 1.1; k.add('crystal', new ConeGeometry(0.16, h, 5), x, h / 2, zz, (k.r() - 0.5) * 0.6, k.r() * 3, (k.r() - 0.5) * 0.6); }
  for (let i = 0; i < 10; i++) k.add('bone', new CylinderGeometry(0.04, 0.05, 0.6, 5), cx + (k.r() - 0.5) * 12, 0.05, cz + (k.r() - 0.5) * 12, Math.PI / 2, k.r() * 6, 0);
  k.add('crystal', new CircleGeometry(2.2, 14), cx - 3, 0.04, cz - 1, -Math.PI / 2, 0, 0, 1, 1.4, 1); // glowing tear pool
  k.lights.push({ x: cx - 3, y: 1, z: cz - 1, color: '#4fd6e8', i: 3 }, { x: mx, y: 1.5, z: mz - 1.5, color: '#4fd6e8', i: 2.4 });
}

// ---------------------------------------------------------------- ground + roads
function ground(k: Kit) {
  // big ashen ground around the 46 × 46 city terrain, with vertex-colour noise and roads to the four zones
  const S = WORLD_HALF * 2 + 20, n = 64, g = new PlaneGeometry(S, S, n, n); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, col: number[] = [], c = new Color(), a = new Color('#2c2723'), b = new Color('#3b342c'), road = new Color('#4a4136');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), inCity = Math.abs(x) < 23.5 && Math.abs(z) < 23.5;
    pos.setY(i, inCity ? -0.06 : -0.02 + Math.sin(x * 0.31) * Math.cos(z * 0.27) * 0.08);
    c.copy(a).lerp(b, (Math.sin(x * 0.7 + z * 0.3) * 0.5 + 0.5) * 0.6 + k.r() * 0.25);
    const onRoad = (Math.abs(z - 2) < 2.2 && Math.abs(x) > 22) || (Math.abs(x - (z < 0 ? 2 : 0)) < 2.2 && Math.abs(z) > 22);
    if (onRoad) c.lerp(road, 0.75);
    for (const zz of ZONES) { const d = Math.hypot(x - zz.x, z - zz.z); if (d < zz.radius) c.lerp(new Color(zz.tint), 0.25 * (1 - d / zz.radius)); }
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const m = new Mesh(g, new MeshStandardMaterial({ vertexColors: true, roughness: 1 })); m.receiveShadow = true; m.name = 'sorrowlands-ground';
  return m;
}
/** builds every ruined zone; add the group to the scene and register the colliders with world/colliders.ts */
export function buildRuins(seed = 7): { group: Group; colliders: Collider[] } {
  const root = new Group(); root.name = 'sorrowlands'; const colliders: Collider[] = [];
  root.add(ground(new Kit(rng(seed))));
  ZONES.forEach((z, i) => {
    const k = new Kit(rng(seed * 31 + i * 977));
    if (z.kind === 'village') village(z, k); else if (z.kind === 'castle') castle(z, k); else if (z.kind === 'cathedral') cathedral(z, k); else cave(z, k);
    root.add(k.build(z.id)); colliders.push(...k.colliders);
  });
  // wandering edge of the world: rock ridge just inside the bounds
  const edge = new Kit(rng(seed + 99));
  for (let i = 0; i < 80; i++) { const t = i / 80 * Math.PI * 2, R = WORLD_HALF + 4, x = Math.max(-R, Math.min(R, Math.cos(t) * R * 1.42)), z = Math.max(-R, Math.min(R, Math.sin(t) * R * 1.42)); edge.rock('rock', 2 + edge.r() * 2.5, x, z, 0, 1.2 + edge.r()); }
  root.add(edge.build('edge'));
  return { group: root, colliders };
}
let cached: ReturnType<typeof buildRuins> | null = null;
/** the one shared instance (the 3D layer and the collision registry use the same build) */
export function sorrowlands() { return cached ??= buildRuins(); }
