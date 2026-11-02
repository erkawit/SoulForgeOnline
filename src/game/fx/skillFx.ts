// SoulForge skill effects — one look per class: a dark smoke base under an additive soul glow.
// Pure three.js so the game (R3F) and the standalone preview viewer share the same code.
import {
  AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, ConeGeometry, CylinderGeometry, DoubleSide, Group,
  IcosahedronGeometry, BoxGeometry, Material, Mesh, MeshBasicMaterial, NormalBlending, Object3D, PlaneGeometry, Points, PointsMaterial,
  RingGeometry, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial, Texture, TorusGeometry, Vector3, Color,
} from 'three';

type FxBase = 'Warrior' | 'Mage' | 'Priest' | 'Archer' | 'Enchanter';
export type FxClass = 'Berserker' | FxBase | 'Paladin' | 'Hawkeye' | 'RuneMaster' | 'Elementalist' | 'Assassin' | 'HighPriest' | 'Inquisitor';
/** round 20: each playable class borrows one of the five effect designs (own colours from FX_COLORS) */
const FX_BASE: Record<FxClass, FxBase> = { Berserker: 'Warrior', Warrior: 'Warrior', Mage: 'Mage', Priest: 'Priest', Archer: 'Archer', Enchanter: 'Enchanter',
  Paladin: 'Warrior', Assassin: 'Warrior', Hawkeye: 'Archer', Inquisitor: 'Mage', RuneMaster: 'Enchanter', Elementalist: 'Mage', HighPriest: 'Priest' };
export type FxKind = 'attack' | 'skill' | 'buff' | 'special';
export interface FxSpec { cls: FxClass; kind: FxKind; origin: Vector3; yaw: number; target?: Vector3 | null; color?: string;
  /** combo step 0,1,2… — alternates slash direction, the 3rd hit is a finisher */ combo?: number; /** 0..1 charge (Archer charged shot / long casts) scales the effect */ power?: number; }
export interface FxHandle { update(dt: number): boolean; dispose(): void; readonly object: Object3D; }

export const FX_COLORS: Record<FxClass, [string, string]> = {
  Berserker: ['#ff9368', '#8a1c1c'], Warrior: ['#62d7cb', '#b3263a'], Mage: ['#b685ff', '#3b1a6e'], Priest: ['#ffdb86', '#ff9a3c'], Archer: ['#8bdb9a', '#e8f5c8'], Enchanter: ['#62dfdf', '#d9b45c'],
  Paladin: ['#ffe08a', '#5b7bd6'], Assassin: ['#c97bff', '#2a1838'], Hawkeye: ['#8bdb9a', '#e8f5c8'], Inquisitor: ['#8fd3ff', '#ffffff'], RuneMaster: ['#62dfdf', '#d9b45c'], Elementalist: ['#ff8a4a', '#6fc8ff'], HighPriest: ['#ffdb86', '#ffffff'],
};
/** when (0..1 of the action) the hit lands — matches the chibi clip timing */
export const FX_DURATION: Record<FxKind, number> = { attack: 0.65, skill: 1.0, buff: 1.1, special: 2.0 };

// ---------------------------------------------------------------- shared textures
const texCache = new Map<string, Texture>();
function canvasTex(key: string, size: number, draw: (g: CanvasRenderingContext2D, s: number) => void): Texture {
  const hit = texCache.get(key); if (hit) return hit;
  const c = document.createElement('canvas'); c.width = c.height = size; const g = c.getContext('2d')!; draw(g, size);
  const t = new CanvasTexture(c); texCache.set(key, t); return t;
}
const dotTex = () => canvasTex('dot', 64, (g, s) => {
  const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, s, s);
});
const smokeTex = () => canvasTex('smoke', 64, (g, s) => {
  for (let i = 0; i < 9; i++) {
    const x = s * (0.3 + Math.random() * 0.4), y = s * (0.3 + Math.random() * 0.4), rr = s * (0.18 + Math.random() * 0.15);
    const r = g.createRadialGradient(x, y, 0, x, y, rr); r.addColorStop(0, 'rgba(255,255,255,.35)'); r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r; g.fillRect(0, 0, s, s);
  }
});
const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];
const runeCircleTex = (style: 'circle' | 'hex' | 'sun' | 'cross' | 'tri') => canvasTex('rc-' + style, 512, (g, s) => {
  const c = s / 2; g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 6;
  g.beginPath(); g.arc(c, c, s * 0.47, 0, Math.PI * 2); g.stroke(); g.lineWidth = 3;
  g.beginPath(); g.arc(c, c, s * 0.38, 0, Math.PI * 2); g.stroke();
  g.font = `${Math.round(s * 0.06)}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2; g.save(); g.translate(c + Math.cos(a) * s * 0.425, c + Math.sin(a) * s * 0.425); g.rotate(a + Math.PI / 2); g.fillText(RUNES[i % RUNES.length], 0, 0); g.restore();
  }
  g.lineWidth = 4; g.beginPath();
  const n = style === 'hex' ? 6 : style === 'tri' ? 3 : style === 'cross' ? 4 : 5;
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 2, p = [c + Math.cos(a) * s * 0.36, c + Math.sin(a) * s * 0.36]; if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }
  g.stroke();
  if (style === 'circle' || style === 'tri') { g.beginPath(); for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2 + Math.PI / 2, p = [c + Math.cos(a) * s * 0.36, c + Math.sin(a) * s * 0.36]; if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); } g.stroke(); }
  if (style === 'sun') for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * s * 0.12, c + Math.sin(a) * s * 0.12); g.lineTo(c + Math.cos(a) * s * 0.3, c + Math.sin(a) * s * 0.3); g.stroke(); }
  if (style === 'cross') { g.lineWidth = 14; g.beginPath(); g.moveTo(c, c - s * 0.26); g.lineTo(c, c + s * 0.26); g.moveTo(c - s * 0.16, c - s * 0.08); g.lineTo(c + s * 0.16, c - s * 0.08); g.stroke(); }
  g.lineWidth = 3; g.beginPath(); g.arc(c, c, s * 0.12, 0, Math.PI * 2); g.stroke();
});
const glyphTex = (i: number) => canvasTex('glyph' + i, 128, (g, s) => {
  g.fillStyle = '#fff'; g.font = `${Math.round(s * 0.72)}px serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(RUNES[i % RUNES.length], s / 2, s / 2 + 4);
});

// ---------------------------------------------------------------- building blocks
type Part = { obj: Object3D; mats: Material[]; tick: (t: number, el: number) => void };
const glowMat = (color: string, opacity = 1, map?: Texture) => new MeshBasicMaterial({ color, transparent: true, opacity, blending: AdditiveBlending, depthWrite: false, side: DoubleSide, map: map ?? null });
const darkMat = (opacity = 0.6, map?: Texture) => new MeshBasicMaterial({ color: '#07050a', transparent: true, opacity, blending: NormalBlending, depthWrite: false, side: DoubleSide, map: map ?? null });
/** Edge-only glow: bright at silhouettes, clear in the middle, fading upward — the caster inside stays visible. */
function fresnelMat(color: string, opacity = 1, power = 2.2, height = 1) {
  const m = new ShaderMaterial({
    transparent: true, depthWrite: false, blending: AdditiveBlending, side: DoubleSide,
    uniforms: { uColor: { value: new Color(color) }, uOpacity: { value: opacity }, uPow: { value: power }, uH: { value: height }, uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vY = position.y; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform float uPow; uniform float uH; uniform float uTime; varying vec3 vN; varying vec3 vV; varying float vY;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), uPow); float h = clamp(vY / uH, 0.0, 1.0);
        float band = 0.75 + 0.25 * sin(vY * 9.0 - uTime * 6.0); float a = uOpacity * f * (1.0 - h * h) * band; if (a < 0.003) discard; gl_FragColor = vec4(uColor * a, a); }`,
  });
  Object.defineProperty(m, 'opacity', { get: () => m.uniforms.uOpacity.value, set: (v: number) => { if (m.uniforms) m.uniforms.uOpacity.value = v; } });
  m.onBeforeRender = () => { m.uniforms.uTime.value = performance.now() / 1000; };
  return m;
}
const ph = (t: number, a: number, b: number) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const ease = (x: number) => 1 - Math.pow(1 - x, 3);
const bell = (x: number) => (x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x));

class Fx implements FxHandle {
  object = new Group(); parts: Part[] = []; elapsed = 0; dead = false;
  constructor(public duration: number) {}
  add(obj: Object3D, mats: Material | Material[], tick: Part['tick'], parent: Object3D = this.object) {
    parent.add(obj); const part = { obj, mats: Array.isArray(mats) ? mats : [mats], tick }; this.parts.push(part); return part;
  }
  update(dt: number) {
    this.elapsed += dt; const t = Math.min(1, this.elapsed / this.duration);
    for (const p of this.parts) p.tick(t, this.elapsed);
    return t < 1;
  }
  dispose() {
    this.object.removeFromParent();
    this.object.traverse((o: Object3D) => { const m = o as Mesh; if (m.geometry) m.geometry.dispose(); });
    for (const p of this.parts) for (const m of p.mats) m.dispose();
  }
}

function groundRing(fx: Fx, at: Vector3, color: string, r0: number, r1: number, a: number, b: number, width = 0.12, opacity = 1) {
  const m = glowMat(color, 0); const mesh = new Mesh(new RingGeometry(1 - width, 1, 64), m); mesh.rotation.x = -Math.PI / 2; mesh.position.copy(at).setY(at.y + 0.05);
  fx.add(mesh, m, t => { const k = ph(t, a, b); mesh.scale.setScalar(r0 + (r1 - r0) * ease(k)); m.opacity = opacity * bell(Math.min(1, k * 1.1 + 0.001)) * (k < 1 ? 1 : 0); mesh.visible = k > 0 && k < 1; });
}
function runeCircle(fx: Fx, at: Vector3, color: string, radius: number, a: number, b: number, style: Parameters<typeof runeCircleTex>[0], spin = 0.6, opacity = 0.95) {
  const m = glowMat(color, 0, runeCircleTex(style)); const mesh = new Mesh(new PlaneGeometry(2, 2), m); mesh.rotation.x = -Math.PI / 2; mesh.position.copy(at).setY(at.y + 0.04);
  const d = darkMat(0, dotTex()); const shade = new Mesh(new PlaneGeometry(2.4, 2.4), d); shade.rotation.x = -Math.PI / 2; shade.position.copy(at).setY(at.y + 0.03);
  fx.add(shade, d, t => { const k = ph(t, a, b); shade.scale.setScalar(radius); d.opacity = 0.55 * Math.min(1, k * 5) * Math.min(1, (1 - k) * 4); shade.visible = k > 0 && k < 1; });
  fx.add(mesh, m, (t, el) => { const k = ph(t, a, b); mesh.scale.setScalar(radius * (0.6 + 0.4 * ease(Math.min(1, k * 3)))); mesh.rotation.z = el * spin; m.opacity = opacity * Math.min(1, k * 4) * Math.min(1, (1 - k) * 4); mesh.visible = k > 0 && k < 1; });
}
function pillar(fx: Fx, at: Vector3, color: string, radius: number, height: number, a: number, b: number, opacity = 0.55) {
  const m = fresnelMat(color, 0, 1.6, height); const geo = new CylinderGeometry(radius, radius * 1.15, height, 40, 8, true); geo.translate(0, height / 2, 0);
  const mesh = new Mesh(geo, m); mesh.position.copy(at);
  fx.add(mesh, m, t => { const k = ph(t, a, b); mesh.scale.set(1 - 0.3 * k, ease(Math.min(1, k * 3)), 1 - 0.3 * k); m.opacity = opacity * Math.min(1, k * 4) * Math.min(1, (1 - k) * 3); mesh.visible = k > 0 && k < 1; });
}
function sparks(fx: Fx, at: Vector3, color: string, count: number, speed: number, a: number, b: number, opts: { up?: number; gravity?: number; size?: number; spread?: number; dir?: Vector3 } = {}) {
  const pos = new Float32Array(count * 3), vel: Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const v = new Vector3(Math.random() - 0.5, Math.random() * (opts.up ?? 0.6), Math.random() - 0.5).normalize().multiplyScalar(speed * (0.4 + Math.random() * 0.8));
    if (opts.dir) v.addScaledVector(opts.dir, speed * (0.5 + Math.random()));
    vel.push(v);
  }
  const geo = new BufferGeometry(); geo.setAttribute('position', new BufferAttribute(pos, 3));
  const m = new PointsMaterial({ color, size: opts.size ?? 0.22, map: dotTex(), transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 });
  const pts = new Points(geo, m); pts.position.copy(at); pts.frustumCulled = false;
  const spread = opts.spread ?? 0.15; const seed = vel.map(() => new Vector3((Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread));
  fx.add(pts, m, t => {
    const k = ph(t, a, b); const time = k * (b - a) * fx.duration; pts.visible = k > 0 && k < 1;
    for (let i = 0; i < count; i++) { pos[i * 3] = seed[i].x + vel[i].x * time; pos[i * 3 + 1] = seed[i].y + vel[i].y * time - 0.5 * (opts.gravity ?? 3) * time * time; pos[i * 3 + 2] = seed[i].z + vel[i].z * time; }
    geo.attributes.position.needsUpdate = true; m.opacity = 1 - k;
  });
}
function smoke(fx: Fx, at: Vector3, count: number, radius: number, a: number, b: number, rise = 0.6) {
  for (let i = 0; i < count; i++) {
    const m = new SpriteMaterial({ map: smokeTex(), color: '#0a0710', transparent: true, depthWrite: false, opacity: 0 }); const s = new Sprite(m);
    const ang = (i / count) * Math.PI * 2 + Math.random(), r = Math.max(1.1, radius * (0.6 + Math.random() * 0.6)), sz = 0.7 + Math.random() * 0.7;
    fx.add(s, m, t => { const k = ph(t, a, b); s.visible = k > 0 && k < 1; s.position.set(at.x + Math.cos(ang) * r * (0.6 + k * 0.6), at.y + 0.3 + k * rise, at.z + Math.sin(ang) * r * (0.6 + k * 0.6)); s.scale.setScalar(sz * (0.6 + k)); m.opacity = 0.6 * bell(k); m.rotation = ang + k; });
  }
}
function flare(fx: Fx, at: Vector3, color: string, size: number, a: number, b: number, pulse = 0) {
  const m = new SpriteMaterial({ map: dotTex(), color, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 }); const s = new Sprite(m); s.position.copy(at);
  fx.add(s, m, (t, el) => { const k = ph(t, a, b); s.visible = k > 0 && k < 1; s.scale.setScalar(size * (0.4 + 0.8 * ease(Math.min(1, k * 2.5))) * (1 + pulse * Math.sin(el * 25))); m.opacity = bell(Math.min(0.999, k * 0.8 + 0.2 * (k > 0 ? 1 : 0))); });
  return s;
}
/** a crescent slash: flat arc ribbon that sweeps open, then fades */
function crescent(fx: Fx, at: Vector3, yaw: number, color: string, radius: number, arc: number, a: number, b: number, tilt = 0, height = 1.0, dark = true) {
  const holder = new Group(); holder.position.copy(at).setY(at.y + height); holder.rotation.set(0, yaw, 0); fx.object.add(holder);
  const inner = new Group(); inner.rotation.set(-Math.PI / 2 + tilt, 0, 0); holder.add(inner);
  const make = (mat: MeshBasicMaterial, w: number) => { const mesh = new Mesh(new RingGeometry(radius * (1 - w), radius, 48, 1, -arc / 2 + Math.PI / 2, arc), mat); inner.add(mesh); return mesh; };
  if (dark) { const d = darkMat(0); const dm = make(d, 0.4); dm.position.z = -0.02; fx.add(dm, d, t => { const k = ph(t, a, b); dm.visible = k > 0 && k < 1; d.opacity = 0.5 * bell(k); dm.rotation.z = (1 - ease(k)) * arc * 0.6; }, inner); }
  const m = glowMat(color, 0); const mesh = make(m, 0.22);
  const core = glowMat('#ffffff', 0); const cm = make(core, 0.06);
  fx.add(mesh, m, t => { const k = ph(t, a, b); mesh.visible = k > 0 && k < 1; m.opacity = bell(Math.min(1, k * 1.2)); mesh.rotation.z = (1 - ease(k)) * arc * 0.6; mesh.scale.setScalar(0.85 + 0.25 * k); }, inner);
  fx.add(cm, core, t => { const k = ph(t, a, b); cm.visible = k > 0 && k < 0.7; core.opacity = 0.9 * bell(Math.min(1, k * 1.6)); cm.rotation.z = (1 - ease(k)) * arc * 0.6; cm.scale.setScalar(0.85 + 0.25 * k); }, inner);
}
function beam(fx: Fx, from: Vector3, to: Vector3, color: string, width: number, a: number, b: number) {
  const len = from.distanceTo(to); const mid = from.clone().add(to).multiplyScalar(0.5); const dir = to.clone().sub(from).normalize();
  const mk = (w: number, col: string, op: number) => {
    const m = glowMat(col, 0, dotTex()); const geo = new CylinderGeometry(w, w, len, 16, 1, true); const mesh = new Mesh(geo, m); mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir);
    fx.add(mesh, m, (t, el) => { const k = ph(t, a, b); mesh.visible = k > 0 && k < 1; const open = ease(Math.min(1, k * 5)); mesh.scale.set(open * (1 - k * 0.7) * (1 + 0.15 * Math.sin(el * 40)), 1, open * (1 - k * 0.7)); m.opacity = op * Math.min(1, (1 - k) * 3); });
  };
  mk(width, color, 0.9); mk(width * 0.35, '#ffffff', 1);
}
/** something that flies from -> to, with a sparkle trail; returns the arrival phase */
function projectile(fx: Fx, from: Vector3, to: Vector3, a: number, b: number, build: (g: Group) => void, color: string, trail = 14, spin = 0) {
  const g = new Group(); build(g); fx.object.add(g); const dir = to.clone().sub(from); const yaw = Math.atan2(dir.x, dir.z), pitch = -Math.atan2(dir.y, Math.hypot(dir.x, dir.z));
  const tpos = new Float32Array(trail * 3); const tg = new BufferGeometry(); tg.setAttribute('position', new BufferAttribute(tpos, 3));
  const tm = new PointsMaterial({ color, size: 0.25, map: dotTex(), transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 }); const tp = new Points(tg, tm); tp.frustumCulled = false;
  fx.add(tp, tm, () => {});
  const mats: Material[] = []; g.traverse((o: Object3D) => { const mm = (o as Mesh).material as Material | undefined; if (mm) mats.push(mm); });
  fx.add(g, mats, (t, el) => {
    const k = ph(t, a, b); g.visible = k > 0 && k < 1; tp.visible = g.visible; tm.opacity = 0.9;
    const p = from.clone().lerp(to, ease(k)); g.position.copy(p); g.rotation.set(pitch, yaw, spin * el);
    for (let i = 0; i < trail; i++) { const q = from.clone().lerp(to, ease(Math.max(0, k - i * 0.025))); tpos[i * 3] = q.x + (Math.random() - 0.5) * 0.05; tpos[i * 3 + 1] = q.y + (Math.random() - 0.5) * 0.05; tpos[i * 3 + 2] = q.z + (Math.random() - 0.5) * 0.05; }
    tg.attributes.position.needsUpdate = true;
  });
}
function impact(fx: Fx, at: Vector3, color: string, t0: number, big = 1) {
  const hit = at.clone().setY(at.y + 0.9);
  flare(fx, hit, color, 1.6 * big, t0, Math.min(1, t0 + 0.25));
  sparks(fx, hit, color, Math.round(18 * big), 3.2 * big, t0, Math.min(1, t0 + 0.35), { up: 0.8 });
  groundRing(fx, at, color, 0.3, 1.4 * big, t0, Math.min(1, t0 + 0.3), 0.18);
}


/** Caster aura: a thin ground ring + rising motes hugging the feet — reads as "power" without covering the body. */
function casterAura(fx: Fx, o: Vector3, c: string, a = 0, b = 1, r = 0.7) {
  const m = glowMat(c, 0, runeCircleTex('circle')); const disc = new Mesh(new PlaneGeometry(2, 2), m); disc.rotation.x = -Math.PI / 2; disc.position.copy(o).setY(o.y + 0.025);
  fx.add(disc, m, (t, el) => { const k = ph(t, a, b); disc.visible = k > 0 && k < 1; disc.scale.setScalar(r * (0.8 + 0.2 * ease(Math.min(1, k * 4)))); disc.rotation.z = el * 1.4; m.opacity = 0.55 * Math.min(1, k * 6) * Math.min(1, (1 - k) * 4); });
  const fm = fresnelMat(c, 0, 1.4, 1.1); const geo = new CylinderGeometry(r * 0.95, r, 1.1, 32, 6, true); geo.translate(0, 0.55, 0); const wall = new Mesh(geo, fm); wall.position.copy(o);
  fx.add(wall, fm, t => { const k = ph(t, a, b); wall.visible = k > 0 && k < 1; fm.opacity = 0.7 * Math.min(1, k * 6) * Math.min(1, (1 - k) * 3); });
  sparks(fx, o.clone().setY(o.y + 0.05), c, 16, 0.4, a, b, { up: 6, gravity: -1.6, spread: r * 1.6, size: 0.1 });
}

// ---------------------------------------------------------------- per-class designs
type Ctx = { fx: Fx; o: Vector3; yaw: number; fwd: Vector3; tgt: Vector3; hand: Vector3; c: string; c2: string; combo: number; power: number };
const DESIGNS_BASE: Record<FxBase, Record<FxKind, (x: Ctx) => void>> = {
  Warrior: {
    attack: ({ fx, o, yaw, tgt, c, c2, combo }) => {   // 3-hit chain: right→left, left→right, overhead finisher
      const step = combo % 3, fin = step === 2;
      crescent(fx, o, yaw + (step === 1 ? Math.PI : 0), c, fin ? 1.8 : 1.5, fin ? 2.0 : 2.4, 0.38, 0.75, fin ? Math.PI / 2 - 0.15 : step === 1 ? -0.35 : 0.35, fin ? 1.2 : 1.0);
      sparks(fx, tgt.clone().setY(1), c2, fin ? 22 : 10, fin ? 3.4 : 2.4, 0.5, 0.85); if (fin) { groundRing(fx, tgt, c, 0.3, 1.8, 0.55, 0.85, 0.2); smoke(fx, tgt, 5, 0.8, 0.55, 1, 0.4); }
    },
    skill: ({ fx, o, yaw, c, c2 }) => {   // Crescent Cleave — 360° shock wave
      crescent(fx, o, yaw + Math.PI * 0.3, c, 1.8, 5.4, 0.3, 0.65, 0.05, 0.8);
      groundRing(fx, o, c, 0.5, 3.6, 0.42, 0.8, 0.2); groundRing(fx, o, c2, 0.4, 3.0, 0.46, 0.85, 0.08, 0.8);
      smoke(fx, o, 10, 2.0, 0.42, 1); sparks(fx, o.clone().setY(0.3), c, 30, 4, 0.42, 0.9, { up: 0.25 });
    },
    buff: ({ fx, o, c }) => {             // Iron Vow — vow pillar + rune circle
      runeCircle(fx, o, '#ffcf6a', 1.4, 0.05, 1, 'circle', 0.8); pillar(fx, o, '#ffcf6a', 0.6, 3.2, 0.2, 0.95);
      sparks(fx, o.clone().setY(0.2), c, 26, 1.0, 0.25, 1, { up: 4, gravity: -1.5, spread: 1.0, size: 0.16 });
      flare(fx, o.clone().setY(2.3), '#ffe6a0', 1.4, 0.3, 0.7);
    },
    special: ({ fx, o, c }) => {          // Bastion — hex shield dome
      const geo = new IcosahedronGeometry(1.6, 1); const wm = new MeshBasicMaterial({ color: c, wireframe: true, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false });
      const shell = fresnelMat(c, 0, 2.6, 1.6); const w = new Mesh(geo, wm), s = new Mesh(new SphereGeometry(1.58, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), shell);
      w.position.copy(o).setY(o.y + 0.05); s.position.copy(o);
      fx.add(w, wm, (t, el) => { const k = ph(t, 0.12, 1); w.visible = k > 0 && k < 1; w.scale.setScalar(ease(Math.min(1, k * 5))); w.scale.y *= 0.75; w.rotation.y = el * 0.4; wm.opacity = 0.32 * Math.min(1, (1 - k) * 5) * (0.8 + 0.2 * Math.sin(el * 8)); });
      fx.add(s, shell, t => { const k = ph(t, 0.12, 1); s.visible = k > 0 && k < 1; s.scale.setScalar(ease(Math.min(1, k * 5))); s.scale.y *= 0.75; shell.opacity = 0.9 * Math.min(1, (1 - k) * 5); });
      runeCircle(fx, o, c, 1.8, 0.1, 1, 'hex', 0.3); groundRing(fx, o, c, 0.6, 2.4, 0.12, 0.3, 0.15);
    },
  },
  Mage: {
    attack: ({ fx, hand, tgt, c, c2 }) => {
      const to = tgt.clone().setY(0.9);
      projectile(fx, hand, to, 0.35, 0.72, g => { g.add(new Mesh(new SphereGeometry(0.16, 16, 10), glowMat(c, 1))); g.add(new Mesh(new SphereGeometry(0.09, 12, 8), glowMat('#ffffff', 1))); const d = new Mesh(new SphereGeometry(0.22, 12, 8), darkMat(0.35)); g.add(d); }, c);
      impact(fx, tgt, c, 0.72, 0.8); smoke(fx, tgt, 4, 0.5, 0.72, 1, 0.4);
    },
    skill: ({ fx, hand, tgt, c }) => {    // Astral Lance — piercing beam
      const far = tgt.clone().sub(hand).setY(0).normalize().multiplyScalar(2).add(tgt).setY(0.9);
      flare(fx, hand, c, 1.0, 0.1, 0.55, 0.15); sparks(fx, hand, c, 16, -1.5, 0.1, 0.5, { spread: 1.2, gravity: 0, size: 0.14 });
      beam(fx, hand, far, c, 0.22, 0.5, 0.95); impact(fx, tgt, c, 0.52, 1.1);
    },
    buff: ({ fx, o, c, c2 }) => {         // Attunement — orbiting runes + three pillars
      runeCircle(fx, o, c, 1.3, 0, 1, 'tri', -0.7);
      for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; pillar(fx, o.clone().add(new Vector3(Math.cos(a) * 1.1, 0, Math.sin(a) * 1.1)), c, 0.12, 1.8, 0.15 + i * 0.08, 1, 0.7); }
      for (let i = 0; i < 5; i++) {
        const m = glowMat(c, 0, glyphTex(i * 3)); const p = new Mesh(new PlaneGeometry(0.4, 0.4), m);
        fx.add(p, m, (t, el) => { const k = ph(t, 0.15, 1); p.visible = k > 0 && k < 1; const a = el * 2.2 + (i / 5) * Math.PI * 2; p.position.set(o.x + Math.cos(a) * 0.95, o.y + 1.0 + 0.25 * Math.sin(el * 3 + i), o.z + Math.sin(a) * 0.95); p.rotation.y = -a + Math.PI / 2; m.opacity = Math.min(1, k * 4) * Math.min(1, (1 - k) * 4); });
      }
    },
    special: ({ fx, o, fwd, tgt, c, c2 }) => {   // Eclipse Nova — black sun, corona, shockwave
      const at = tgt.clone(); const core = at.clone().setY(at.y + 1.5);
      const dm = new MeshBasicMaterial({ color: '#050208', transparent: true, opacity: 0, depthWrite: false }); const ds = new Mesh(new SphereGeometry(1, 32, 16), dm); ds.position.copy(core);
      fx.add(ds, dm, t => { const k = ph(t, 0.15, 0.82); ds.visible = k > 0 && k < 1; ds.scale.setScalar(0.1 + 0.75 * ease(k)); dm.opacity = 0.95 * Math.min(1, k * 4); });
      const cm = glowMat(c, 0); const corona = new Mesh(new TorusGeometry(1, 0.06, 8, 64), cm); corona.position.copy(core);
      fx.add(corona, cm, (t, el) => { const k = ph(t, 0.15, 0.85); corona.visible = k > 0 && k < 1; corona.scale.setScalar(0.15 + 0.85 * ease(k)); corona.lookAt(core.clone().add(new Vector3(15, 19, 15))); cm.opacity = 0.9 * (0.7 + 0.3 * Math.sin(el * 30)); });
      flare(fx, core, c, 3.5, 0.15, 0.85, 0.08);
      sparks(fx, core, c, 30, -1.8, 0.15, 0.75, { spread: 3.5, gravity: 0, size: 0.18 });
      flare(fx, core, '#ffffff', 5, 0.8, 0.95); groundRing(fx, at, c, 0.6, 5.2, 0.8, 1, 0.12); groundRing(fx, at, c2, 0.5, 4.2, 0.82, 1, 0.3, 0.9);
      sparks(fx, core, c, 50, 6, 0.8, 1, { up: 0.5 }); smoke(fx, at, 14, 3, 0.8, 1, 1);
      runeCircle(fx, at, c, 3.0, 0.1, 0.95, 'circle', 0.5, 0.8);
    },
  },
  Priest: {
    attack: ({ fx, o, yaw, tgt, c }) => { crescent(fx, o, yaw, c, 1.3, 1.6, 0.38, 0.72, Math.PI / 2 - 0.1, 1.3, false); impact(fx, tgt, c, 0.56, 0.7); },
    skill: ({ fx, tgt, c, c2 }) => {     // Dawn Smite — light column from the sky
      const top = tgt.clone().setY(9), bot = tgt.clone().setY(0);
      runeCircle(fx, tgt, c, 1.4, 0.05, 0.9, 'sun', 1.2); flare(fx, tgt.clone().setY(4), c2, 2, 0.35, 0.6);
      beam(fx, top, bot, c, 0.55, 0.5, 0.95); impact(fx, tgt, c, 0.55, 1.2); sparks(fx, tgt.clone().setY(0.2), c, 24, 2, 0.55, 1, { up: 3, gravity: 1 });
    },
    buff: ({ fx, o, c }) => {             // Covenant — light pillar and halo crown
      pillar(fx, o, c, 0.7, 4, 0.1, 1, 0.5); runeCircle(fx, o, c, 1.5, 0.05, 1, 'sun', 0.4);
      const hm = glowMat(c, 0); const halo = new Mesh(new TorusGeometry(0.42, 0.035, 8, 48), hm); halo.rotation.x = Math.PI / 2;
      fx.add(halo, hm, (t, el) => { const k = ph(t, 0.15, 1); halo.visible = k > 0 && k < 1; halo.position.set(o.x, o.y + 2.25 + 0.05 * Math.sin(el * 4), o.z); halo.scale.setScalar(ease(Math.min(1, k * 3)) * 1.2); hm.opacity = Math.min(1, (1 - k) * 4); });
      sparks(fx, o.clone().setY(0.1), '#fff3c6', 30, 0.6, 0.15, 1, { up: 5, gravity: -1.2, spread: 1.2, size: 0.14 });
    },
    special: ({ fx, o, c, c2 }) => {      // Renewal — rising rings + cross glyph
      runeCircle(fx, o, c, 2.6, 0.05, 1, 'cross', 0.25);
      for (let i = 0; i < 4; i++) {
        const m = glowMat(i % 2 ? c2 : c, 0); const r = new Mesh(new TorusGeometry(1.5, 0.04, 6, 64), m); r.rotation.x = Math.PI / 2;
        fx.add(r, m, t => { const k = ph(t, 0.15 + i * 0.15, 0.6 + i * 0.12); r.visible = k > 0 && k < 1; r.position.set(o.x, o.y + 0.1 + 2.6 * ease(k), o.z); r.scale.setScalar(1.3 - 0.6 * k); m.opacity = bell(k); });
      }
      sparks(fx, o.clone().setY(0.1), c, 50, 0.8, 0.15, 1, { up: 6, gravity: -1, spread: 3.5, size: 0.16 }); flare(fx, o.clone().setY(1.2), c, 3, 0.2, 0.9);
    },
  },
  Archer: {
    attack: ({ fx, hand, tgt, c }) => { projectile(fx, hand, tgt.clone().setY(0.9), 0.62, 0.8, arrow(c), c, 10); impact(fx, tgt, c, 0.8, 0.6); },
    skill: ({ fx, hand, tgt, c, c2 }) => {     // piercing thread
      const far = tgt.clone().sub(hand).setY(0).normalize().multiplyScalar(4).add(tgt).setY(0.9);
      projectile(fx, hand, far, 0.68, 0.86, arrow(c2), c, 26); beam(fx, hand, far, c, 0.04, 0.7, 1); impact(fx, tgt, c, 0.76, 0.9);
    },
    buff: ({ fx, o, fwd, c }) => {        // Focus — hunter's reticle
      const at = o.clone().addScaledVector(fwd, 3);
      for (let i = 0; i < 3; i++) { const m = glowMat(c, 0); const ring = new Mesh(new RingGeometry(0.9 - i * 0.25, 0.95 - i * 0.25, 4 + i * 2, 1, 0, Math.PI * (i === 1 ? 1.5 : 2)), m); ring.rotation.x = -Math.PI / 2;
        ring.position.copy(at).setY(0.08 + i * 0.01); fx.add(ring, m, (t, el) => { const k = ph(t, 0.1, 1); ring.visible = k > 0 && k < 1; ring.rotation.z = el * (i % 2 ? -1.6 : 1.1); ring.scale.setScalar(1.6 - 0.6 * ease(Math.min(1, k * 2))); m.opacity = Math.min(1, k * 4) * Math.min(1, (1 - k) * 4); }); }
      flare(fx, o.clone().setY(1.75).addScaledVector(fwd, 0.25), c, 0.7, 0.2, 0.7, 0.2); sparks(fx, o.clone().setY(0.2), c, 14, 0.8, 0.2, 1, { up: 3, gravity: -1, spread: 0.8, size: 0.12 });
    },
    special: ({ fx, hand, tgt, c, c2, power }) => {     // Charged shot — the longer the draw, the bigger the streak
      const p = 0.6 + Math.max(0, Math.min(1, power || 1)) * 0.8;
      flare(fx, hand, c, 1.2 * p, 0.1, 0.78, 0.2); sparks(fx, hand, c, Math.round(40 * p), -1.2, 0.1, 0.75, { spread: 2.2, gravity: 0, size: 0.15 });
      runeCircle(fx, tgt, c, 1.2 * p, 0.1, 0.8, 'circle', 1.4, 0.7);
      const far = tgt.clone().setY(0.9); projectile(fx, hand, far, 0.78, 0.86, arrow(c2, 1.2 * p), c, 30); beam(fx, hand, far, c, 0.08 * p, 0.78, 1);
      impact(fx, tgt, c, 0.86, 1.0 * p); smoke(fx, tgt, 8, 1.2, 0.86, 1, 0.6);
    },
  },
  Enchanter: {
    attack: ({ fx, hand, tgt, c }) => {
      projectile(fx, hand, tgt.clone().setY(0.9), 0.35, 0.7, g => { const m = glowMat(c, 1, glyphTex(5)); g.add(new Mesh(new PlaneGeometry(0.5, 0.5), m)); g.add(new Mesh(new RingGeometry(0.22, 0.26, 3), glowMat(c, 1))); }, c, 12, 8);
      impact(fx, tgt, c, 0.7, 0.7);
    },
    skill: ({ fx, tgt, c, c2 }) => {       // Rune Fracture — glyph seal shatters
      const at = tgt.clone().setY(1.0); const m = glowMat(c, 0, runeCircleTex('tri')); const seal = new Mesh(new PlaneGeometry(2, 2), m); seal.position.copy(at);
      fx.add(seal, m, (t, el) => { const k = ph(t, 0.2, 0.6); seal.visible = k > 0 && k < 1; seal.lookAt(at.clone().add(new Vector3(15, 19, 15))); seal.rotateZ(el * 3); seal.scale.setScalar(0.4 + 0.5 * ease(k)); m.opacity = Math.min(1, k * 4); });
      for (let i = 0; i < 12; i++) {
        const sm = glowMat(i % 3 ? c : c2, 0); const g = new ConeGeometry(0.12, 0.3, 3); const sh = new Mesh(g, sm); const dir = new Vector3(Math.random() - 0.5, Math.random() * 0.8, Math.random() - 0.5).normalize();
        fx.add(sh, sm, (t, el) => { const k = ph(t, 0.6, 1); sh.visible = k > 0 && k < 1; sh.position.copy(at).addScaledVector(dir, 2.2 * ease(k)); sh.rotation.set(el * 9 + i, el * 7, 0); sm.opacity = 1 - k; });
      }
      flare(fx, at, '#ffffff', 2.4, 0.58, 0.8); groundRing(fx, tgt, c, 0.4, 2.2, 0.6, 0.9, 0.15);
    },
    buff: ({ fx, o, c, c2 }) => {          // Inscription — orbiting rune belt
      for (let i = 0; i < 8; i++) {
        const m = glowMat(i % 2 ? c2 : c, 0, glyphTex(i * 2 + 1)); const p = new Mesh(new PlaneGeometry(0.36, 0.36), m);
        fx.add(p, m, (t, el) => { const k = ph(t, 0.1, 1); p.visible = k > 0 && k < 1; const a = -el * 1.6 + (i / 8) * Math.PI * 2, r = 0.8 + 0.25 * ease(Math.min(1, k * 3)); p.position.set(o.x + Math.cos(a) * r, o.y + 0.9 + 0.12 * Math.sin(a * 2), o.z + Math.sin(a) * r); p.rotation.y = -a + Math.PI / 2; m.opacity = Math.min(1, k * 5) * Math.min(1, (1 - k) * 4); });
      }
      const bm = glowMat(c, 0); const belt = new Mesh(new TorusGeometry(0.95, 0.02, 6, 64), bm); belt.rotation.x = Math.PI / 2;
      fx.add(belt, bm, (t, el) => { const k = ph(t, 0.1, 1); belt.visible = k > 0 && k < 1; belt.position.set(o.x, o.y + 0.9, o.z); bm.opacity = 0.7 * Math.min(1, k * 5) * Math.min(1, (1 - k) * 4); });
      runeCircle(fx, o, c, 1.1, 0.05, 1, 'tri', 0.9, 0.7);
    },
    special: ({ fx, o, c, c2 }) => {       // Concord Field — ground glyph + dome
      runeCircle(fx, o, c, 3.4, 0.05, 1, 'hex', 0.2); runeCircle(fx, o, c2, 2.2, 0.15, 1, 'tri', -0.5, 0.7);
      const dm = fresnelMat(c, 0, 2.4, 3.2); const dome = new Mesh(new SphereGeometry(3.2, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2), dm); dome.position.copy(o);
      fx.add(dome, dm, t => { const k = ph(t, 0.42, 1); dome.visible = k > 0 && k < 1; dome.scale.set(ease(Math.min(1, k * 4)), 0.55 * ease(Math.min(1, k * 4)), ease(Math.min(1, k * 4))); dm.opacity = 0.85 * Math.min(1, (1 - k) * 4); });
      groundRing(fx, o, c, 0.6, 3.4, 0.42, 0.6, 0.12); sparks(fx, o.clone().setY(0.1), c, 40, 0.5, 0.42, 1, { up: 4, gravity: -0.8, spread: 5, size: 0.14 });
    },
  },
};
/** round 13: the Berserker / Reaver swing with the Warrior's heavy-blade designs, in ember red (FX_COLORS.Berserker) */
const DESIGNS = (cls: FxClass) => DESIGNS_BASE[FX_BASE[cls] ?? 'Warrior'];
function arrow(color: string, scale = 1) {
  return (g: Group) => {
    const shaft = new Mesh(new CylinderGeometry(0.018 * scale, 0.018 * scale, 0.7 * scale, 6), glowMat(color, 1)); shaft.rotation.x = Math.PI / 2; g.add(shaft);
    const head = new Mesh(new ConeGeometry(0.05 * scale, 0.16 * scale, 6), glowMat('#ffffff', 1)); head.rotation.x = Math.PI / 2; head.position.z = 0.42 * scale; g.add(head);
  };
}

// ---------------------------------------------------------------- round 20: per-skill effects (Rune Master pillars, Inquisitor lightning)
/** a jagged lightning bolt from -> to that flickers between a and b (re-rolls its zig-zag every few frames) */
function lightning(fx: Fx, from: Vector3, to: Vector3, color: string, a: number, b: number, width = 0.05, segs = 9) {
  const g = new Group(); fx.object.add(g); const mats: MeshBasicMaterial[] = []; const parts: Mesh[] = [];
  for (let i = 0; i < segs; i++) for (const [w, col] of [[width, color], [width * 0.35, '#ffffff']] as const) {
    const m = glowMat(col, 0); mats.push(m); const mesh = new Mesh(new CylinderGeometry(w, w, 1, 5, 1, true), m); g.add(mesh); parts.push(mesh);
  }
  let seed = -1; const pts: Vector3[] = [];
  const roll = () => { pts.length = 0; const len = from.distanceTo(to); for (let i = 0; i <= segs; i++) { const p = from.clone().lerp(to, i / segs); if (i > 0 && i < segs) p.add(new Vector3((Math.random() - 0.5) * len * 0.12, (Math.random() - 0.5) * len * 0.05, (Math.random() - 0.5) * len * 0.12)); pts.push(p); } };
  fx.add(g, mats, (t, el) => {
    const k = ph(t, a, b); g.visible = k > 0 && k < 1; if (!g.visible) return;
    const r = Math.floor(el * 30); if (r !== seed) { seed = r; roll(); }
    for (let i = 0; i < segs; i++) for (let j = 0; j < 2; j++) {
      const mesh = parts[i * 2 + j], p0 = pts[i], p1 = pts[i + 1], d = p1.clone().sub(p0);
      mesh.position.copy(p0).addScaledVector(d, 0.5); mesh.scale.set(1, d.length(), 1); mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), d.normalize());
    }
    const flick = 0.6 + 0.4 * Math.sin(el * 70); for (const m of mats) m.opacity = flick * Math.min(1, (1 - k) * 4);
  });
}
/** a rune pillar planted at `at`: a four-sided stone obelisk with glowing runes, a rune circle and an aura band, alive a..b */
function runePillar(fx: Fx, at: Vector3, color: string, a: number, b: number, height = 1.9, style: Parameters<typeof runeCircleTex>[0] = 'hex', radius = 1.4) {
  const stone = new MeshBasicMaterial({ color: '#2a2f38', transparent: true, opacity: 0 });
  const geo = new CylinderGeometry(0.16, 0.3, height, 4, 1); geo.translate(0, height / 2, 0); const body = new Mesh(geo, stone); body.position.copy(at); body.rotation.y = Math.PI / 4;
  const rm = glowMat(color, 0, glyphTex(3)); const rgeo = new CylinderGeometry(0.165, 0.305, height * 0.9, 4, 1, true); rgeo.translate(0, height * 0.48, 0); const runes = new Mesh(rgeo, rm); runes.position.copy(at); runes.rotation.y = Math.PI / 4;
  const cap = flare(fx, at.clone().setY(at.y + height + 0.15), color, 0.9, a, b, 0.25);
  const rise = (k: number) => ease(Math.min(1, k * 8)); void cap;
  fx.add(body, stone, t => { const k = ph(t, a, b); body.visible = k > 0 && k < 1; body.scale.set(1, rise(k), 1); stone.opacity = Math.min(1, k * 10) * Math.min(1, (1 - k) * 8); });
  fx.add(runes, rm, (t, el) => { const k = ph(t, a, b); runes.visible = k > 0 && k < 1; runes.scale.set(1, rise(k), 1); rm.opacity = (0.65 + 0.35 * Math.sin(el * 6)) * Math.min(1, k * 8) * Math.min(1, (1 - k) * 8); });
  runeCircle(fx, at, color, radius, a, b, style, 0.8, 0.9);
  sparks(fx, at.clone().setY(at.y + 0.1), color, 14, 0.5, a, b, { up: 6, gravity: -1.2, spread: radius, size: 0.12 });
}
/** a dark storm cloud hanging over `at` (a..b) */
function stormCloud(fx: Fx, at: Vector3, radius: number, a: number, b: number, color: string) {
  for (let i = 0; i < 14; i++) {
    const m = new SpriteMaterial({ map: smokeTex(), color: i % 3 ? '#1c2230' : '#2c3550', transparent: true, depthWrite: false, opacity: 0 }); const sp = new Sprite(m);
    const ang = Math.random() * Math.PI * 2, r = Math.random() * radius, y = 4.2 + Math.random() * 0.6, sz = 1.6 + Math.random() * 1.4;
    fx.add(sp, m, (t, el) => { const k = ph(t, a, b); sp.visible = k > 0 && k < 1; sp.position.set(at.x + Math.cos(ang + el * 0.15) * r, y, at.z + Math.sin(ang + el * 0.15) * r); sp.scale.setScalar(sz * (0.7 + 0.3 * ease(Math.min(1, k * 5)))); m.opacity = 0.85 * Math.min(1, k * 6) * Math.min(1, (1 - k) * 5); });
  }
  const glow = flare(fx, at.clone().setY(4.4), color, radius * 1.6, a, b, 0.5); void glow;
}
/** Thor's hammer: appears up in the sky on a 45° line behind the target and swings down head-first into the ground */
function thorHammer(fx: Fx, at: Vector3, yaw: number, color: string, hitAt: number) {
  const back = new Vector3(-Math.sin(yaw), 0, -Math.cos(yaw)); const pivot = at.clone().addScaledVector(back, 3.2).setY(3.2); // 45°: as far back as it is high
  const holder = new Group(); holder.position.copy(pivot); holder.rotation.y = yaw; fx.object.add(holder);
  const arm = new Group(); holder.add(arm); // rotates about the local X axis: the swing
  const metal = new MeshBasicMaterial({ color: '#9aa3ad', transparent: true, opacity: 0 }), dark = new MeshBasicMaterial({ color: '#4a5058', transparent: true, opacity: 0 });
  const wood = new MeshBasicMaterial({ color: '#5b3b22', transparent: true, opacity: 0 }), rim = glowMat(color, 0);
  const L = 4.53; // pivot -> hammer head centre = the 45° diagonal to the target
  const handle = new Mesh(new CylinderGeometry(0.07, 0.08, L - 0.3, 8), wood); handle.position.y = -(L - 0.3) / 2; arm.add(handle);
  const head = new Mesh(new BoxGeometry(1.2, 0.7, 0.7), metal); head.position.y = -L; arm.add(head);
  const faceA = new Mesh(new BoxGeometry(0.14, 0.78, 0.78), dark); faceA.position.set(0.62, -L, 0); arm.add(faceA);
  const faceB = faceA.clone(); faceB.position.x = -0.62; arm.add(faceB);
  const glowShell = new Mesh(new BoxGeometry(1.36, 0.86, 0.86), rim); glowShell.position.y = -L; arm.add(glowShell);
  const mats = [metal, dark, wood, rim];
  // start raised behind (head up, pointing back), swing forward-down until the head meets the ground at the target
  const start = -Math.PI * 0.95, end = -Math.PI / 4;
  fx.add(holder, mats, (t, el) => {
    const appear = Math.min(1, t / (hitAt * 0.35)), k = ph(t, hitAt * 0.35, hitAt), fade = ph(t, hitAt + 0.25, 1);
    holder.visible = t < 1 && fade < 1; const sw = k < 1 ? start + (end - start) * (k * k) : end; // accelerates into the blow
    arm.rotation.x = sw + (k >= 1 ? Math.sin(el * 40) * 0.015 * (1 - fade) : 0);
    for (const m of [metal, dark, wood]) m.opacity = appear * (1 - fade); rim.opacity = (0.35 + 0.35 * Math.sin(el * 30)) * appear * (1 - fade);
  });
  // charged bolts crackle onto the hammer while it rises, then the impact
  for (let i = 0; i < 3; i++) lightning(fx, pivot.clone().add(new Vector3((Math.random() - 0.5) * 3, 3, (Math.random() - 0.5) * 3)), pivot, color, i * 0.08, hitAt * 0.5 + i * 0.06, 0.04, 6);
  impact(fx, at, color, hitAt, 2.4); groundRing(fx, at, '#ffffff', 0.4, 4.2, hitAt, Math.min(1, hitAt + 0.25), 0.08);
  groundRing(fx, at, color, 0.5, 4.6, hitAt, Math.min(1, hitAt + 0.35), 0.22); smoke(fx, at, 12, 2.4, hitAt, 1, 0.8);
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; lightning(fx, at.clone().setY(0.2), at.clone().add(new Vector3(Math.cos(a) * 3.6, 0.1, Math.sin(a) * 3.6)), color, hitAt, Math.min(1, hitAt + 0.3), 0.04, 6); }
  sparks(fx, at.clone().setY(0.4), color, 50, 6, hitAt, Math.min(1, hitAt + 0.5), { up: 0.6, gravity: 2 });
}
type SkillFxSpec = { origin: Vector3; yaw: number; target: Vector3 | null };
/** effects built for one skill: [duration s, builder] */
const SKILL_FX: Record<string, [number, (fx: Fx, o: Vector3, tgt: Vector3, yaw: number) => void]> = {
  // ---- Rune Master
  'r2-venom-burst': [1.4, (fx, o, tgt) => { runeCircle(fx, tgt, '#7dff6a', 2.8, 0, 0.5, 'tri', 1.6); flare(fx, tgt.clone().setY(0.6), '#9dff7a', 3.2, 0.18, 0.5); sparks(fx, tgt.clone().setY(0.5), '#7dff6a', 46, 4.5, 0.18, 0.7, { up: 0.7 }); groundRing(fx, tgt, '#5cff8a', 0.4, 3, 0.18, 0.5, 0.2);
    for (let i = 0; i < 12; i++) { const m = new SpriteMaterial({ map: smokeTex(), color: '#3f8a2a', transparent: true, depthWrite: false, opacity: 0 }); const sp = new Sprite(m); const ang = Math.random() * 6.28, r = Math.random() * 2.4;
      fx.add(sp, m, t => { const k = ph(t, 0.2, 1); sp.visible = k > 0 && k < 1; sp.position.set(tgt.x + Math.cos(ang) * r * (0.5 + k), 0.4 + k * 0.8, tgt.z + Math.sin(ang) * r * (0.5 + k)); sp.scale.setScalar(1.2 + k); m.opacity = 0.55 * bell(k); }); } }],
  'r2-valor-pillar': [15, (fx, o) => { runePillar(fx, o.clone().add(new Vector3(0.9, 0, 0.6)), '#ffd36a', 0, 1, 2, 'sun', 8); pillar(fx, o, '#ffd36a', 1.1, 2.4, 0, 0.08); }],
  'r2-binding-pillar': [3.2, (fx, o, tgt) => { runePillar(fx, tgt, '#b685ff', 0, 1, 1.9, 'hex', 3);
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; lightning(fx, tgt.clone().setY(1.5), tgt.clone().add(new Vector3(Math.cos(a) * 2.6, 0.2, Math.sin(a) * 2.6)), '#b685ff', 0.05, 0.95, 0.03, 5); } }],
  'r2-renewal-pillar': [10, (fx, o) => { const at = o.clone().add(new Vector3(-0.9, 0, 0.6)); runePillar(fx, at, '#6dffa8', 0, 1, 2, 'circle', 8);
    for (let i = 0; i < 6; i++) sparks(fx, at.clone().setY(0.1), '#9dffc2', 16, 0.6, i / 6, Math.min(1, i / 6 + 0.25), { up: 8, gravity: -1.5, spread: 3, size: 0.16 }); }],
  'r2-hex-pillar': [10, (fx, o, tgt) => { runePillar(fx, tgt, '#ff4d6a', 0, 1, 1.8, 'cross', 3.5); smoke(fx, tgt, 8, 2.2, 0, 0.3, 0.5); }],
  'r2-ruin-pillar': [5.2, (fx, o, tgt) => { runePillar(fx, tgt, '#62dfdf', 0, 1, 3.2, 'hex', 3.6);
    for (let i = 0; i < 10; i++) { const a = Math.random() * 6.28, r = 0.8 + Math.random() * 2.6, t0 = 0.06 + i * 0.09; const hit = tgt.clone().add(new Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      beam(fx, tgt.clone().setY(3.1), hit.clone().setY(0.2), '#62dfdf', 0.08, t0, t0 + 0.05); impact(fx, hit, '#62dfdf', t0 + 0.02, 0.6); } }],
  // ---- Inquisitor
  'i-thunder-smite': [0.9, (fx, o, tgt) => { lightning(fx, tgt.clone().setY(5), tgt.clone().setY(0.1), '#8fd3ff', 0.3, 0.6, 0.07); impact(fx, tgt, '#8fd3ff', 0.35, 1); }],
  'i-lightning-burst': [1.1, (fx, o) => { flare(fx, o.clone().setY(1), '#cfefff', 3, 0.1, 0.5); groundRing(fx, o, '#8fd3ff', 0.4, 3.2, 0.12, 0.55, 0.2);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; lightning(fx, o.clone().setY(1), o.clone().add(new Vector3(Math.cos(a) * 3, 0.3, Math.sin(a) * 3)), '#8fd3ff', 0.12, 0.6, 0.04, 6); }
    sparks(fx, o.clone().setY(1), '#cfefff', 40, 5, 0.12, 0.6, { up: 0.4 }); }],
  'i-storm-cloud': [4.4, (fx, o, tgt) => { stormCloud(fx, tgt, 3.2, 0, 1, '#4a7dff');
    for (let i = 0; i < 8; i++) { const t0 = 0.1 + i * 0.1, a = Math.random() * 6.28, r = Math.random() * 3; const hit = tgt.clone().add(new Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      lightning(fx, hit.clone().setY(4.2), hit.clone().setY(0.05), '#9fdcff', t0, t0 + 0.05, 0.07); impact(fx, hit, '#8fd3ff', t0, 0.7); } }],
  'i-shock-pillar': [4.4, (fx, o, tgt) => { runePillar(fx, tgt, '#8fd3ff', 0, 1, 2.1, 'cross', 3);
    for (let i = 0; i < 6; i++) { const t0 = 0.06 + i * 0.15; for (let j = 0; j < 3; j++) { const a = Math.random() * 6.28, r = 1 + Math.random() * 2; lightning(fx, tgt.clone().setY(2), tgt.clone().add(new Vector3(Math.cos(a) * r, 0.5, Math.sin(a) * r)), '#8fd3ff', t0, t0 + 0.06, 0.035, 6); } } }],
  'i-blast-pillar': [2.3, (fx, o, tgt) => { runePillar(fx, tgt, '#8fd3ff', 0, 0.64, 2.1, 'cross', 2.2); flare(fx, tgt.clone().setY(2.2), '#cfefff', 1.4, 0.1, 0.62, 1.2);
    impact(fx, tgt, '#8fd3ff', 0.62, 2); groundRing(fx, tgt, '#ffffff', 0.4, 3.2, 0.62, 0.85, 0.1);
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; lightning(fx, tgt.clone().setY(1.2), tgt.clone().add(new Vector3(Math.cos(a) * 3, 0.2, Math.sin(a) * 3)), '#8fd3ff', 0.62, 0.85, 0.05, 6); } }],
  'i-mjolnir': [2.4, (fx, o, tgt, yaw) => { stormCloud(fx, tgt, 2.6, 0, 0.8, '#4a7dff'); thorHammer(fx, tgt, yaw, '#8fd3ff', 0.38); }],
};
/** the skill's own effect, if it has one (round 20) */
export function spawnCustomSkillFx(scene: Object3D, skillId: string | undefined, spec: SkillFxSpec): FxHandle | null {
  const def = skillId ? SKILL_FX[skillId] : undefined; if (!def) return null;
  const fx = new Fx(def[0]); const o = spec.origin.clone(), fwd = new Vector3(Math.sin(spec.yaw), 0, Math.cos(spec.yaw));
  const tgt = spec.target ? spec.target.clone().setY(o.y) : o.clone().addScaledVector(fwd, 3);
  def[1](fx, o, tgt, spec.yaw); scene.add(fx.object); fx.update(0); return fx;
}
/** Rune Master basic attack: the slash, then a crescent of rune light flies to the target */
function runeSwordWave(x: Ctx) {
  const { fx, o, yaw, tgt, c, c2, combo } = x, step = combo % 3, fin = step === 2;
  crescent(fx, o, yaw + (step === 1 ? Math.PI : 0), c, 1.3, 2.2, 0.3, 0.55, step === 1 ? -0.35 : 0.35, 1.0);
  const from = o.clone().addScaledVector(x.fwd, 0.8).setY(1), to = tgt.clone().setY(0.9);
  projectile(fx, from, to, 0.38, 0.72, g => { for (const [w, col, op] of [[0.25, c, 0.9], [0.08, '#ffffff', 1]] as const) {
    const m = glowMat(col, op); const r = fin ? 0.9 : 0.65; const mesh = new Mesh(new RingGeometry(r * (1 - w), r, 32, 1, Math.PI * 0.15, Math.PI * 0.7), m); mesh.rotation.y = Math.PI / 2; mesh.rotation.z = Math.PI / 2; g.add(mesh); } }, c2, 10);
  impact(fx, tgt, c, 0.72, fin ? 1.2 : 0.8);
}

/** Spawn one class effect. `origin` is the caster's feet, `yaw` its facing (atan2(dx,dz)). */
export function spawnSkillFx(scene: Object3D, spec: FxSpec): FxHandle {
  const [c0, c2] = FX_COLORS[spec.cls] ?? FX_COLORS.Warrior; const c = spec.color ?? c0;
  const fx = new Fx(FX_DURATION[spec.kind] * (spec.kind === 'attack' && FX_BASE[spec.cls] === 'Archer' ? 1.15 : 1));
  const fwd = new Vector3(Math.sin(spec.yaw), 0, Math.cos(spec.yaw));
  const tgt = spec.target ? spec.target.clone().setY(spec.origin.y) : spec.origin.clone().addScaledVector(fwd, 4);
  const hand = spec.origin.clone().addScaledVector(fwd, 0.45).setY(spec.origin.y + 1.05);
  const ctx: Ctx = { fx, o: spec.origin.clone(), yaw: spec.yaw, fwd, tgt, hand, c, c2, combo: spec.combo ?? 0, power: spec.power ?? 0 };
  if (spec.kind !== 'attack') casterAura(fx, ctx.o, c, 0, spec.kind === 'special' ? 0.7 : 0.85, spec.kind === 'buff' ? 0.85 : 0.7);
  if (spec.cls === 'RuneMaster' && spec.kind === 'attack') runeSwordWave(ctx); else DESIGNS(spec.cls)[spec.kind](ctx);
  scene.add(fx.object); fx.update(0);
  return fx;
}

/** Casting / channelling aura for skills with a cast time: a class rune circle at the feet, motes gathering into the
 *  casting hand and a pulsing hand glow. Lives exactly `durationSec`; never covers the caster (edge glow only). */
export function spawnChannelFx(scene: Object3D, spec: { cls: FxClass; origin: Vector3; yaw: number; durationSec: number; color?: string }): FxHandle {
  const [c0, c2] = FX_COLORS[spec.cls] ?? FX_COLORS.Warrior; const c = spec.color ?? c0, d = Math.max(0.25, spec.durationSec);
  const fx = new Fx(d), o = spec.origin.clone(), fwd = new Vector3(Math.sin(spec.yaw), 0, Math.cos(spec.yaw));
  const base = FX_BASE[spec.cls] ?? 'Warrior';
  const style = ({ Warrior: 'hex', Mage: 'tri', Priest: 'sun', Archer: 'circle', Enchanter: 'hex' } as const)[base];
  const hand = base === 'Priest' ? o.clone().setY(o.y + 1.0).addScaledVector(fwd, 0.25) : base === 'Enchanter' ? o.clone().setY(o.y + 1.35).addScaledVector(fwd, 0.35) : o.clone().setY(o.y + 1.05).addScaledVector(fwd, 0.45);
  runeCircle(fx, o, c, 1.05, 0, 1, style, base === 'Enchanter' ? -1.2 : 0.9, 0.85);
  casterAura(fx, o, c, 0, 1, 0.62);
  // motes converge into the hand: negative speed pulls them inward from a wide spread
  for (let i = 0; i < 3; i++) sparks(fx, hand, i % 2 ? c2 : c, 14, -1.1, i / 3 * 0.8, Math.min(1, i / 3 * 0.8 + 0.4), { spread: 1.6, gravity: 0, size: 0.12 });
  flare(fx, hand, c, 0.55, 0, 1, 0.12);
  if (base === 'Priest') { // a halo forms above the bowed head while praying
    const hm = glowMat(c, 0); const halo = new Mesh(new TorusGeometry(0.3, 0.025, 8, 40), hm); halo.rotation.x = Math.PI / 2;
    fx.add(halo, hm, (t, el) => { halo.position.set(o.x, o.y + 1.75 + 0.03 * Math.sin(el * 4), o.z); halo.scale.setScalar(0.6 + 0.4 * ease(t)); hm.opacity = Math.min(1, t * 3) * (1 - Math.max(0, t - 0.92) / 0.08); });
  }
  if (base === 'Enchanter') { // the arm draws a ring of glyphs in the air
    for (let i = 0; i < 6; i++) {
      const m = glowMat(i % 2 ? c2 : c, 0, glyphTex(i * 4 + 2)); const p = new Mesh(new PlaneGeometry(0.22, 0.22), m);
      fx.add(p, m, (t, el) => { const show = t > i / 6 * 0.7; p.visible = show; const a = (i / 6) * Math.PI * 2 + el * 0.8; p.position.set(o.x + Math.cos(a) * 0.55 + fwd.x * 0.35, o.y + 1.25 + Math.sin(a) * 0.45, o.z + Math.sin(a) * 0.12 + fwd.z * 0.35); p.lookAt(p.position.clone().add(fwd)); m.opacity = show ? Math.min(1, (t - i / 6 * 0.7) * 8) : 0; });
    }
  }
  scene.add(fx.object); fx.update(0); return fx;
}
/** Advance an effect so its release/impact plays right away (used after a cast bar completes). */
export function prerollFx(h: FxHandle, seconds: number) { if (seconds > 0) h.update(seconds); return h; }
export const FX_NAMES: Partial<Record<FxClass, Record<FxKind, string>>> = {
  Berserker: { attack: 'Ember cleave', skill: 'Carnage spin · blood wave', buff: 'Blood Howl · rage pillar', special: 'Bloodquake · ground burst' },
  Warrior: { attack: 'Crescent slash', skill: 'Crescent Cleave · 360° wave', buff: 'Iron Vow · vow pillar', special: 'Bastion · hex shield dome' },
  Mage: { attack: 'Soul orb', skill: 'Astral Lance · beam', buff: 'Attunement · orbit runes', special: 'Eclipse Nova · black sun' },
  Priest: { attack: 'Dawn strike arc', skill: 'Dawn Smite · sky beam', buff: 'Covenant · halo pillar', special: 'Renewal · rising rings' },
  Archer: { attack: 'Soul arrow', skill: 'Piercing Thread', buff: 'Focus · reticle', special: 'Charged Shot' },
  Enchanter: { attack: 'Rune bolt', skill: 'Rune Fracture · shatter', buff: 'Inscription · rune belt', special: 'Concord Field · dome' },
};
