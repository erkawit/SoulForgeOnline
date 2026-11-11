// 2.5D isometric sprite actors built from the compact-cast-v2 painted sheets.
// Each actor is one painted frame on a subdivided quad that always faces the camera (constant depth = depth of the
// feet, so it sorts like a classic iso sprite against the 3D world). The quad is deformed in the vertex shader every
// frame — breathing, run bob/lean/stride, cloth and hair springs that lag behind real velocity, weapon-arm swings,
// squash & stretch — and key-pose frames from the motion sheets (anticipate → impact → recover, draw → release …)
// cross-fade on top, so nothing ever snaps or stands rigid. Same public API as the old GLB `Unit`.
import {
  CanvasTexture, Color, LinearFilter, DoubleSide, GreaterDepth, Group, Mesh, MeshBasicMaterial, PlaneGeometry, Quaternion, ShaderMaterial, SRGBColorSpace, Texture,
  TextureLoader, UniformsLib, UniformsUtils, Vector2, Vector3, Vector4, type Camera,
} from 'three';
import { SPRITE_FRAMES, type SpriteFrame } from './frames';
import { actorDef, type ActorDef, type SpriteClip, type SpriteKey } from './catalog';
import { animFor, ANIM_ALIAS, SPRITE_ANIMS, type SpriteAnim } from './anims';
import { BREATH_ANIMS, BREATH_PERIOD } from './breath';
import { placeLayers, rigFrame, weaponSheet, type LayeredRig } from './layered';
import { HERO_RIGS } from './rigs';
import { artUrl } from '../artVersion';
// layered heroes register their body sheets as ordinary 8-way flipbooks
// round 20: a class's own painted sheet (sprites/classAnims.ts, registered by the catalog) wins over the layered rig
for (const [key, { rig, ids }] of Object.entries(HERO_RIGS)) { SPRITE_ANIMS[key] = rig.anim; for (const id of ids) ANIM_ALIAS[id] ??= key; }

// ------------------------------------------------------------------ fashion textures (round 12)
const fashionCache = new Map<string, Texture>();
function fashionTexture(path: string): Texture { const k = BASE.replace(/sprites\/$/, '') + path, hit = fashionCache.get(k); if (hit) return hit; const t: Texture = loader.load(k); t.colorSpace = SRGBColorSpace; fashionCache.set(k, t); return t; }
/** built-in drawn fashion until painted art exists: golden light wings, an ember aura ring */
function proceduralTexture(kind: string): Texture | null {
  const hit = fashionCache.get('proc:' + kind); if (hit) return hit; if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = 512; c.height = 360; const g = c.getContext('2d')!;
  if (kind === 'dawn-wings') {
    for (const side of [-1, 1]) for (let i = 0; i < 9; i++) {
      const a = (-0.25 + i * 0.13) * Math.PI, len = 150 + Math.sin(i * 0.7) * 40 + (8 - i) * 6;
      const x0 = 256 + side * 18, y0 = 190, x1 = x0 + side * Math.cos(a) * len, y1 = y0 - Math.sin(a) * len;
      const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, 'rgba(255,244,200,1)'); gr.addColorStop(0.55, 'rgba(255,205,100,0.92)'); gr.addColorStop(1, 'rgba(255,160,50,0.15)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + side * 10, (y0 + y1) / 2 - 22, x1, y1); g.quadraticCurveTo((x0 + x1) / 2 - side * 4, (y0 + y1) / 2 + 14, x0, y0 + 10); g.fill(); g.strokeStyle = 'rgba(150,90,20,0.55)'; g.lineWidth = 2; g.stroke();
    }
    g.globalCompositeOperation = 'lighter'; const r = g.createRadialGradient(256, 190, 0, 256, 190, 120); r.addColorStop(0, 'rgba(255,230,150,0.45)'); r.addColorStop(1, 'rgba(255,200,100,0)'); g.fillStyle = r; g.fillRect(0, 0, 512, 360);
  } else if (kind === 'ember-aura') {
    c.width = c.height = 256; g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 60; i++) { const a = Math.random() * Math.PI * 2, rr = 70 + Math.random() * 45, x = 128 + Math.cos(a) * rr, y = 128 + Math.sin(a) * rr * 0.55, s = 3 + Math.random() * 6;
      const gr = g.createRadialGradient(x, y, 0, x, y, s * 2); gr.addColorStop(0, 'rgba(255,200,120,1)'); gr.addColorStop(1, 'rgba(255,80,20,0)'); g.fillStyle = gr; g.fillRect(x - s * 2, y - s * 2, s * 4, s * 4); }
  } else return null;
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; fashionCache.set('proc:' + kind, t); return t;
}

// ------------------------------------------------------------------ shared state
let BASE = '/art/sprites/';
/** Where the .webp frames are served from (the preview artifact ships them next to the page). */
export function setSpriteBase(url: string) { BASE = url.endsWith('/') ? url : url + '/'; }
/** The camera every sprite faces. R3F wrappers set it per frame; the preview sets it once. */
export const spriteView: { camera: Camera | null } = { camera: null };
const loader = new TextureLoader(); const texCache = new Map<string, Texture>(); const geoCache = new Map<string, PlaneGeometry>();
export function spriteTexture(name: string) {
  const hit = texCache.get(name); if (hit) return hit;
  const t: Texture = loader.load(BASE + name + '.webp'); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; texCache.set(name, t);
  return t;
}
/** Start downloading every frame of the given actors so the first attack never shows a blank pose. */
export function preloadSprites(ids: string[]) { for (const id of ids) { const d = actorDef(id); const an = animFor(d.id); if (an) { animTexture(an.key); continue; } for (const f of framesOf(d)) spriteTexture(f); if (BREATH_ANIMS[d.base]) animTexture('breath/' + d.base); } }
function framesOf(d: ActorDef) { const s = new Set<string>([d.base]); if (d.run) s.add(d.run); for (const c of Object.values(d.clips)) for (const k of c?.keys ?? []) if (k.f) s.add(k.f); return [...s].filter(f => SPRITE_FRAMES[f]); }
function geometry(name: string) {
  let g = geoCache.get(name); if (g) return g; const f = SPRITE_FRAMES[name];
  g = new PlaneGeometry(f.w, f.h, 10, 14); g.translate(f.w * (0.5 - f.fx), f.h * (0.5 - f.fy), 0); geoCache.set(name, g); return g;
}
const animTexCache = new Map<string, Texture>(); const animGeoCache = new Map<string, PlaneGeometry>();
/** flipbook atlas: no mipmaps so neighbouring cells never bleed into each other */
function animTexture(key: string) {
  const hit = animTexCache.get(key); if (hit) return hit;
  const t: Texture = loader.load(artUrl(ANIM_BASE() + key + '.webp')); t.colorSpace = SRGBColorSpace; t.generateMipmaps = false; t.minFilter = LinearFilter; t.anisotropy = 1;
  animTexCache.set(key, t); return t;
}
const ANIM_BASE = () => BASE.replace(/sprites\/$/, 'anim/');
/** one cell in world units: the idle body maps onto the painted key-pose height so sizes match the old sprites */
function animGeometry(key: string, a: SpriteAnim, worldH: number) {
  const id = key + ':' + worldH; let g = animGeoCache.get(id); if (g) return g;
  const wpp = worldH / a.bodyPx, w = a.cw * wpp, h = a.ch * wpp;
  g = new PlaneGeometry(w, h, 10, 14); g.translate(w * (0.5 - a.fx), h * (0.5 - a.fy), 0); animGeoCache.set(id, g); return g;
}
let shadowTex: Texture | null = null;
function blobTexture() {
  if (shadowTex) return shadowTex;
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d')!;
  const r = g.createRadialGradient(32, 32, 2, 32, 32, 31); r.addColorStop(0, 'rgba(0,0,0,0.62)'); r.addColorStop(0.55, 'rgba(0,0,0,0.32)'); r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); shadowTex = new CanvasTexture(c); return shadowTex;
}

// ------------------------------------------------------------------ shader
const VERT = /* glsl */`
uniform float uTime, uBreath, uLean, uSq, uRot, uArm, uStride, uFlip, uWave, uH;
uniform vec2 uCloth, uHair, uOff, uArmPivotL; uniform vec4 uArmRect;
varying vec2 vUv;
#include <fog_pars_vertex>
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,s,-s,c); }
void main(){
  vUv = uv; vec2 p = position.xy; float v = uv.y, u = uv.x, side = abs(u-0.5);
  // weapon / casting arm: soft rectangle rotated about the shoulder
  float am = smoothstep(uArmRect.x-.16,uArmRect.x+.06,u)*(1.-smoothstep(uArmRect.z-.06,uArmRect.z+.16,u))
           * smoothstep(uArmRect.y-.16,uArmRect.y+.06,v)*(1.-smoothstep(uArmRect.w-.06,uArmRect.w+.16,v));
  p = rot(clamp(uArm,-.6,.6)*.32*am)*(p-uArmPivotL)+uArmPivotL;
  // breathing: chest swells sideways, shoulders rise a touch
  float chest = smoothstep(.34,.52,v)*(1.-smoothstep(.74,.9,v));
  p.x += p.x*uBreath*chest; p.y += uBreath*.45*smoothstep(.3,1.,v)*uH;
  // cloth hem lags behind motion and flutters; feet (v<.05) stay planted
  float hem = smoothstep(.03,.16,v)*(1.-smoothstep(.3,.56,v));
  p.x += (uCloth.x*(.55+side*1.3) + sin(uTime*7.3+v*11.+u*6.)*uWave*(.4+side))*hem; p.y += uCloth.y*hem*.35;
  // hair / cape top follows the head with a delay
  p += uHair*smoothstep(.7,1.,v);
  // run stride: knees and hem swing alternately, feet pinned
  p.x += uStride*smoothstep(.0,.08,v)*(1.-smoothstep(.1,.3,v));
  // lean (shear from the feet), squash & stretch, whole-body rock, root offset, facing
  p.x += uLean*p.y; p.y *= 1.+uSq; p.x *= 1.-uSq*.55;
  p = rot(uRot)*p; p += uOff; p.x *= uFlip;
  vec4 mvPosition = modelViewMatrix*vec4(p, 0.0, 1.0);
  gl_Position = projectionMatrix*mvPosition;
  #include <fog_vertex>
}`;
const FRAG = /* glsl */`
uniform sampler2D map; uniform vec3 uTint; uniform vec4 uFlash, uGlow, uCell; uniform float uOpacity;
varying vec2 vUv;
#include <fog_pars_fragment>
void main(){
  vec4 t = texture2D(map, uCell.xy + clamp(vUv, .002, .998)*uCell.zw); float a = t.a*uOpacity; if(a < .02) discard;
  vec3 c = t.rgb*uTint;
  float lum = dot(t.rgb, vec3(.3,.59,.11));
  c += uGlow.rgb*uGlow.a*(.35+lum*.9);
  c = mix(c, uFlash.rgb, uFlash.a);
  gl_FragColor = vec4(c, a);
  #include <colorspace_fragment>
  #ifdef USE_FOG
    // painted sprites keep their colours: only 45% of the scene fog reaches them
    #ifdef FOG_EXP2
      float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
    #else
      float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
    #endif
    gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor * 0.45 );
  #endif
}`;
/** x-ray: only where the sprite is hidden behind a wall, tree or rock — a dim class-coloured silhouette, so the player
 *  never disappears behind scenery (drawn with depthFunc GREATER, after everything else) */
const XRAY_FRAG = /* glsl */`
uniform sampler2D map; uniform vec4 uCell, uGlow; uniform float uOpacity;
varying vec2 vUv;
void main(){
  vec4 t = texture2D(map, uCell.xy + clamp(vUv, .002, .998)*uCell.zw); if(t.a < .35) discard;
  float lum = dot(t.rgb, vec3(.3,.59,.11));
  gl_FragColor = vec4(mix(vec3(.55,.6,.75), uGlow.rgb, .55)*(.55+lum*.6), .42*uOpacity);
}`;
type U = Record<string, { value: any }>;
function makeMaterial(map: Texture) {
  const uniforms: U = UniformsUtils.merge([UniformsLib.fog, {
    map: { value: map }, uTime: { value: 0 }, uBreath: { value: 0 }, uLean: { value: 0 }, uSq: { value: 0 }, uRot: { value: 0 }, uArm: { value: 0 }, uStride: { value: 0 },
    uFlip: { value: 1 }, uWave: { value: 0 }, uH: { value: 1 }, uCloth: { value: new Vector2() }, uHair: { value: new Vector2() }, uOff: { value: new Vector2() },
    uArmPivot: { value: new Vector2(.5, .6) }, uArmPivotL: { value: new Vector2() }, uArmRect: { value: new Vector4(2, 2, 2, 2) },
    uTint: { value: new Color(1, 1, 1) }, uFlash: { value: new Vector4(1, 1, 1, 0) }, uGlow: { value: new Vector4(1, 1, 1, 0) }, uOpacity: { value: 1 }, uCell: { value: new Vector4(0, 0, 1, 1) },
  }]);
  uniforms.map.value = map;
  return new ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: true, side: DoubleSide, fog: true, toneMapped: false });
}

// ------------------------------------------------------------------ actor
type PlayOpts = { fade?: number; speed?: number; loop?: boolean; hold?: boolean; restart?: boolean };
type Layer = { mesh: Mesh; mat: ShaderMaterial; frame: string; alpha: number; breath: boolean };
const ease = (x: number) => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const damp = (k: number, dt: number) => 1 - Math.exp(-k * dt);
const _q = new Quaternion(), _q2 = new Quaternion(), _v = new Vector3(), _v2 = new Vector3(), _right = new Vector3(), _fwd = new Vector3();
/** 8-way sheets list their rows S, SW, W, NW, N, NE, E, SE; screen sectors count from S toward E */
const SECTOR_ROW = [0, 7, 6, 5, 4, 3, 2, 1];

/** anim: use this flipbook instead of the actor's own (e.g. 'm-Warrior-lite' on the login screen) · pace: playback speed (1 = normal) */
export type SpriteActorOpts = { scale?: number; tint?: string; shadow?: boolean; glow?: string; anim?: string; pace?: number };
export class SpriteActor {
  readonly isSprite = true;
  root = new Group(); /** faces the camera; root itself keeps the game's yaw */ pivot = new Group();
  def: ActorDef; height: number; dead = false; loco = 'Idle'; locoSpeed = 1; timeScale = 1; hitStop = 0;
  private layers: Layer[] = []; private shadow: Mesh | null = null; private scale: number;
  private t = Math.random() * 10; private shot: { name: string; def: SpriteClip; t: number; dur: number; loop: boolean; hold: boolean } | null = null;
  private runW = 0; private phase = 0; private flip = 1; private flipTarget = 1; private flipLock = 0;
  /** 8-way flipbooks: the sheet row for where the actor faces on screen (0 = S, toward the camera) */
  private dirRow = 0; private dirAngle = 0;
  private cloth = new Vector2(); private clothV = new Vector2(); private hair = new Vector2(); private hairV = new Vector2();
  private lastPos = new Vector3(); private hasLast = false; private vel = 0; private speedSmooth = 0;
  private flashT = 0; private flashMax = 0.16; private flashColor = new Color('#ff3b30'); private opacity = 1;
  private deathT = -1; private hitT = -1; private glowColor = new Color('#ffffff'); private tint = new Color(1, 1, 1);
  private frameNow: string; private popT = 0;
  /** flipbook mode: a real frame-by-frame sheet exists for this actor (public/art/anim) */
  private anim: { key: string; anim: SpriteAnim } | null; private animT = 0; private animF = 0; private animClip = ''; private shotU = -1;
  /** layered hero (round 13): hair + rigid weapon meshes placed per frame from the Codex rig */
  private rig: LayeredRig | null = null; private hairMesh: Mesh | null = null; private weaponMesh: Mesh | null = null;
  /** hands drawn over the weapon (rig.hands): a copy of the body flipbook plane sampling <key>-hands.webp */
  private handsMesh: Mesh | null = null; private handsOn = false; private hairColor = new Color(1, 1, 1);
  /** 3D-rendered hair (rig.hair3d): a copy of the body flipbook plane sampling <key>-hair-<style>.webp, tinted by hairColor */
  private hair3dMesh: Mesh | null = null; private hair3dStyle = '';
  /** 3D-rendered weapon tiers (rig.weapon3d): a copy of the body flipbook plane sampling <key>-gs-t<n>.webp */
  private weapon3dMesh: Mesh | null = null; private weapon3dSheet = '';
  private hairStyle = ''; private weaponKey = ''; private offNow = new Vector2();

  constructor(id: string, opts: SpriteActorOpts = {}) {
    this.def = actorDef(id); this.scale = (opts.scale ?? 1) * (this.def.scale ?? 1);
    if (opts.tint) this.tint.set(opts.tint); if (opts.glow) this.glowColor.set(opts.glow); else if (this.def.glow) this.glowColor.set(this.def.glow);
    this.anim = opts.anim && SPRITE_ANIMS[opts.anim] ? { key: opts.anim, anim: SPRITE_ANIMS[opts.anim] } : animFor(this.def.id);
    if (opts.pace) this.timeScale = opts.pace;
    const f = SPRITE_FRAMES[this.def.base]; this.height = f.h * this.scale * (this.def.headRatio ?? 0.94);
    this.root.add(this.pivot); this.pivot.scale.setScalar(this.scale);
    this.frameNow = this.def.base; this.pushLayer(this.def.base, 1);
    if (opts.shadow !== false) {
      const s = new Mesh(new PlaneGeometry(1, 1), new MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, toneMapped: false }));
      s.rotation.x = -Math.PI / 2; s.position.y = 0.02; s.renderOrder = -1; const w = Math.min(f.w * 0.62, (this.def.shadowW ?? f.w * 0.62)) * this.scale;
      s.scale.set(w, w * 0.42, 1); this.root.add(s); this.shadow = s;
    }
    if (!opts.anim) preloadSprites([id]); // round 22: an actor given its own flipbook (login lineup) never needs the full atlas
    const r = this.anim ? HERO_RIGS[this.anim.key] : undefined;
    if (r) { this.rig = r.rig; this.setHair(r.rig.hair3d?.[0] ?? r.rig.hair.styles[0] ?? ''); }  // default = the finished 3D hair
  }
  /** layered heroes: hair style id (public/art/anim/hair/<id>.webp); unknown ids fall back to the first painted style */
  setHair(style: string): void {
    const rig = this.rig; if (!rig) return;
    if (rig.hair3d?.includes(style)) {
      // rendered with the body (fits the skull in every direction and frame): drop the 2D cell, rebuild the 3D layer
      if (style === this.hair3dStyle) return;
      this.hair3dStyle = style; this.hairStyle = ''; this.hairMesh = this.swapLayerMesh(this.hairMesh, null, 0, 0, 1, 0);
      if (this.hair3dMesh) { this.hair3dMesh.removeFromParent(); (this.hair3dMesh.material as ShaderMaterial).dispose(); this.hair3dMesh = null; }
      return;
    }
    if (rig.hair3d?.length) return this.setHair(rig.hair3d[0]);  // the rig has finished 3D hair: never fall back to the old floating 2D cells
    if (this.hair3dMesh) { this.hair3dMesh.removeFromParent(); (this.hair3dMesh.material as ShaderMaterial).dispose(); this.hair3dMesh = null; }
    this.hair3dStyle = '';
    const id = rig.hair.styles.includes(style) ? style : rig.hair.styles[0]; if (!id || id === this.hairStyle) return;
    this.hairStyle = id; this.hairMesh = this.swapLayerMesh(this.hairMesh, 'hair/' + id, rig.hair.cw, rig.hair.ch, 8, 6);
    if (this.hairMesh) (this.hairMesh.material as MeshBasicMaterial).color.copy(this.hairColor);
  }
  /** layered heroes: hair colour — the hair sheets are painted in neutral grey and multiplied by this colour */
  setHairColor(color: string) { this.hairColor.set(color); if (this.hairMesh) (this.hairMesh.material as MeshBasicMaterial).color.copy(this.hairColor); }
  /** layered heroes: the equipped weapon (kind from items.weaponKindOf, tier 0..7); a fashion weapon skin (its sheet name) wins when painted */
  setWeapon(kind: string | null, tier = 0, skin?: string | null) {
    const rig = this.rig; if (!rig) return;
    // 3D-rendered weapon layer: a fashion skin rendered for this rig wins, else the tier sheet
    const w3 = rig.weapon3d, s3 = !w3 || kind !== w3.kind ? '' : skin && w3.skins?.includes(skin) ? `gs-${skin}` : `gs-t${Math.max(0, Math.min(w3.tiers - 1, tier)) + 1}`;
    if (s3 !== this.weapon3dSheet) {
      this.weapon3dSheet = s3;
      if (this.weapon3dMesh) { this.weapon3dMesh.removeFromParent(); (this.weapon3dMesh.material as ShaderMaterial).dispose(); this.weapon3dMesh = null; }
    }
    if (s3) { this.weaponKey = ''; this.weaponMesh = this.swapLayerMesh(this.weaponMesh, null, 0, 0, 1, 0); return; }  // rendered with the body, nothing to place
    const sheet = skin && rig.weapon.sheets.includes(skin) ? skin : kind ? weaponSheet(rig, kind, tier) : null; if ((sheet ?? '') === this.weaponKey) return;
    this.weaponKey = sheet ?? ''; this.weaponMesh = sheet ? this.swapLayerMesh(this.weaponMesh, 'weapon/' + sheet, rig.weapon.cw, rig.weapon.ch, 3, 7) : this.swapLayerMesh(this.weaponMesh, null, 0, 0, 1, 0);
  }
  private swapLayerMesh(old: Mesh | null, sheet: string | null, cw: number, ch: number, cells: number, order: number) {
    if (old) { old.removeFromParent(); (old.material as MeshBasicMaterial).map?.dispose(); (old.material as MeshBasicMaterial).dispose(); }
    if (!sheet || !this.anim) return null;
    const wpp = SPRITE_FRAMES[this.def.base].h / this.anim.anim.bodyPx, tex = animTexture(sheet).clone(); tex.repeat.set(1 / cells, 1); tex.needsUpdate = true;
    const m = new Mesh(new PlaneGeometry(cw * wpp, ch * wpp), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, side: DoubleSide }));
    m.renderOrder = order; m.frustumCulled = false; m.visible = false; this.pivot.add(m); return m;
  }
  private placeRig(clip: string, local: number) {
    const rig = this.rig!; const f = rigFrame(rig, clip, this.dirRow, local); const hm = this.hairMesh, wm = this.weaponMesh;
    if (!f) { if (hm) hm.visible = false; if (wm) wm.visible = false; this.handsOn = false; return; }
    const p = placeLayers(rig, f, this.dirRow, SPRITE_FRAMES[this.def.base].h), ox = this.offNow.x, oy = this.offNow.y, a = this.opacity;
    this.handsOn = !!(rig.hands && f.hands && p.weapon?.front);
    if (p.hair) this.headNow = { x: p.hair.x + ox, y: p.hair.y + oy, rot: p.hair.rot };
    if (hm && p.hair) { hm.visible = a > 0.01 && !this.hideHair; hm.position.set(p.hair.x + ox + this.hair.x * 0.05, p.hair.y + oy, 0.012); hm.rotation.z = p.hair.rot; (hm.material as MeshBasicMaterial).map!.offset.set(p.hair.cell / 8, 0); (hm.material as MeshBasicMaterial).opacity = a; }
    if (wm) {
      if (!p.weapon) wm.visible = false;
      else { const w = p.weapon; wm.visible = a > 0.01; wm.position.set(w.x + ox, w.y + oy, w.front ? 0.02 : -0.02); wm.rotation.z = w.rot; wm.scale.x = w.flipX ? -1 : 1;
        wm.renderOrder = w.front ? 7 : 1; (wm.material as MeshBasicMaterial).map!.offset.set(w.cell / 3, 0); (wm.material as MeshBasicMaterial).opacity = a; }
    }
  }
  // ---------------------------------------------------------------- Unit-compatible API
  has(name: string) { return !!this.def.clips[name] || ['Idle', 'Run', 'Walk', 'Hit', 'Death'].includes(name); }
  duration(name: string) { return this.clipOf(name).dur; }
  setLoco(name: string, speed = 1) { this.loco = name === 'Walk' && !this.def.walks ? 'Run' : name; this.locoSpeed = speed; }
  play(name: string, o: PlayOpts = {}) {
    if (this.dead && name !== 'Death') return 0;
    if (name === 'Death') { this.die(); return 1.1; }
    if (name === 'Idle' || name === 'Run' || name === 'Walk') { this.setLoco(name, o.speed ?? 1); this.endShot(); return 0; }
    const def = this.clipOf(name); const speed = o.speed ?? 1; const dur = def.dur / speed;
    if (this.shot && this.shot.name === name && o.restart === false) return dur;
    this.shot = { name, def, t: 0, dur, loop: !!o.loop || !!def.loop, hold: !!o.hold || !!o.loop };
    if (name === 'Hit') this.hitT = 0;
    return dur;
  }
  /** play a one-shot so it lasts exactly `seconds` (R3F wrapper: action.duration) */
  playFor(name: string, seconds?: number) { const d = this.clipOf(name).dur; return this.play(name, { speed: seconds && seconds > 0.05 ? d / seconds : 1 }); }
  endShot(_fade = 0.16) { if (this.dead) return; this.shot = null; }
  get busy() { return !!this.shot; }
  get shotName() { return this.shot?.name ?? null; }
  flash(color = '#ff3b30', strength = 1) { this.flashMax = 0.16 * strength; this.flashT = this.flashMax; this.flashColor.set(color); if (color === '#ff3b30' || color === '#ffffff') this.hitT = 0; }
  die() { this.dead = true; this.shot = null; this.deathT = 0; }
  revive() { this.dead = false; this.deathT = -1; this.shot = null; this.setOpacity(1); }
  setOpacity(v: number) { this.opacity = v; }
  setGlow(color: string) { this.glowColor.set(color); }
  get position() { return this.root.position; }
  // ---------------------------------------------------------------- fashion overlays (round 12: wings, capes, head pieces, auras)
  private overlays: { mesh: Mesh; behind: boolean; kind?: string; base: number; views: number; frames: number; fps: number; cols: number; rows: number; head: boolean; tex: Texture | null; baseX: number }[] = [];
  private hideHair = false;
  /** fashion layers drawn on the hero: art = texture URL (or a built-in procedural piece), anchor = [x, y] as a fraction of the
   *  sprite (0..1 from the feet), scale = × hero height, behind = drawn behind the body.
   *  Round 13: views 8 = one cell per direction (S…SE, picked like the 8-way body; a "behind" piece such as wings comes to
   *  the front when the hero shows its back), frames/fps = animated cells (rows = views, cols = frames),
   *  attach 'head' = follows the layered hero's head anchor every frame, hidesHair = a helm that replaces the hair layer. */
  setOverlays(list: { art?: string; procedural?: string; anchor?: [number, number]; scale?: number; behind?: boolean; views?: number; frames?: number; fps?: number; attach?: 'head'; hidesHair?: boolean }[]) {
    for (const o of this.overlays) { o.mesh.removeFromParent(); (o.mesh.material as MeshBasicMaterial).dispose(); o.tex?.dispose(); } this.overlays = [];
    const f = SPRITE_FRAMES[this.def.base]; this.hideHair = list.some(it => it.hidesHair);
    if (this.hairMesh) this.hairMesh.visible = !this.hideHair && this.hairMesh.visible;
    for (const it of list) {
      const src = it.procedural ? proceduralTexture(it.procedural) : it.art ? fashionTexture(it.art) : null; if (!src) continue;
      const views = it.views === 8 ? 8 : 1, frames = Math.max(1, it.frames ?? 1), cols = frames, rows = views;
      const tex = views > 1 || frames > 1 ? src.clone() : null; if (tex) { tex.repeat.set(1 / cols, 1 / rows); tex.needsUpdate = true; }
      const img = src.image as { width?: number; height?: number } | undefined, aspect = img?.width && img.height ? (img.width / cols) / (img.height / rows) : 1.4;
      // a head piece on a layered hero uses the hair cell (same canvas and skull anchor as the hair sheets)
      const hairCell = it.attach === 'head' && this.rig && this.anim ? this.rig.hair : null, wpp = this.anim ? f.h / this.anim.anim.bodyPx : 0;
      const h = hairCell ? hairCell.ch * wpp : f.h * (it.scale ?? 1), w = hairCell ? hairCell.cw * wpp : h * aspect;
      const m = new Mesh(new PlaneGeometry(w, h), new MeshBasicMaterial({ map: tex ?? src, transparent: true, depthWrite: false, toneMapped: false, side: DoubleSide, blending: it.procedural === 'ember-aura' ? 2 : 1 }));
      const [ax, ay] = it.anchor ?? [0.5, 0.5]; m.position.set((ax - f.fx) * f.w, ay * f.h, it.behind ? -0.02 : 0.02); m.renderOrder = it.behind ? 1 : 9; m.frustumCulled = false;
      this.pivot.add(m); this.overlays.push({ mesh: m, behind: !!it.behind, kind: it.procedural, base: ay * f.h, views, frames, fps: it.fps ?? 10, cols, rows, head: it.attach === 'head', tex, baseX: (ax - f.fx) * f.w });
    }
  }
  private stepOverlays() {
    for (const o of this.overlays) {
      if (o.kind === 'dawn-wings') { const k = 1 + Math.sin(this.t * 3.2) * 0.06; o.mesh.scale.set(k * (this.flip >= 0 ? 1 : -1), 1 + Math.sin(this.t * 3.2 + 1) * 0.02, 1); o.mesh.position.y = o.base + Math.sin(this.t * 3.2) * 0.02; }
      else if (o.kind === 'ember-aura') o.mesh.rotation.z = this.t * 0.6;
      else o.mesh.scale.x = o.views > 1 ? 1 : this.flip >= 0 ? 1 : -1;
      if (o.tex) {
        const row = o.views > 1 ? this.dirRow : 0, col = o.frames > 1 ? Math.floor(this.t * o.fps) % o.frames : 0;
        o.tex.offset.set(col / o.cols, 1 - (row + 1) / o.rows);
        // a back piece (wings, cape) is in front of the body when the hero shows its back (NW, N, NE)
        if (o.views > 1 && o.behind) { const back = row >= 3 && row <= 5; o.mesh.position.z = back ? 0.025 : -0.02; o.mesh.renderOrder = back ? 8 : 1; }
      }
      if (o.head && this.headNow) { o.mesh.position.x = this.headNow.x; o.mesh.position.y = this.headNow.y; o.mesh.rotation.z = this.headNow.rot; }
      (o.mesh.material as MeshBasicMaterial).opacity = (o.kind === 'ember-aura' ? 0.7 + Math.sin(this.t * 4) * 0.2 : 1) * this.opacity;
    }
  }
  /** layered heroes: where the head is this frame (body-plane units), for head-attached fashion */
  private headNow: { x: number; y: number; rot: number } | null = null;
  worldHead(out = new Vector3()) { return out.copy(this.root.position).setY(this.root.position.y + this.height + 0.15); }

  // ---------------------------------------------------------------- internals
  private clipOf(name: string): SpriteClip {
    const c = this.def.clips[name] ?? this.def.clips[FALLBACK[name] ?? ''];
    if (c) return c;
    return name === 'Hit' ? HIT : name === 'Channel' || name === 'Guard' ? { dur: 1, loop: true, keys: [{ t: 0, lean: -0.04, glow: 0.25 }] } : GENERIC;
  }
  get flipbook() { return !!this.anim; }
  private xrayMesh: Mesh | null = null; private xrayOn = false;
  /** show a silhouette of this actor through anything that hides it (the local player) */
  setXray(on: boolean) { this.xrayOn = on; if (this.xrayMesh) this.xrayMesh.visible = on; }
  private pushLayer(frame: string, alpha: number) {
    const an = this.anim;
    // a still with a baked breathing loop (sprite-gen Breathe) samples its atlas cell by cell, same canvas as the still
    const breath = !an && !!BREATH_ANIMS[frame];
    const mat = makeMaterial(an ? animTexture(an.key) : breath ? animTexture('breath/' + frame) : spriteTexture(frame));
    const mesh = new Mesh(an ? animGeometry(an.key, an.anim, SPRITE_FRAMES[this.def.base].h) : geometry(frame), mat); mesh.frustumCulled = false; mesh.renderOrder = 2 + this.layers.length;
    this.pivot.add(mesh); const l = { mesh, mat, frame, alpha, breath }; this.layers.push(l); return l;
  }
  private setFrame(frame: string) {
    if (frame === this.frameNow || !SPRITE_FRAMES[frame]) return; this.frameNow = frame;
    // keep the most visible pose underneath, drop the rest; the new pose cuts in over ~3 frames (no long ghosting)
    const keep = this.layers.reduce((m, l) => l.alpha > m.alpha ? l : m, this.layers[0]);
    for (const l of this.layers) if (l !== keep) { this.pivot.remove(l.mesh); l.mat.dispose(); }
    keep.alpha = 1; this.layers = [keep];
    this.pushLayer(frame, 0); this.popT = 0.09;
  }
  /** sample the active clip: interpolated numbers + the pose frame that is current at time t */
  private sample(c: SpriteClip, u: number) {
    const ks = c.keys; let a: SpriteKey = ks[0], b: SpriteKey = ks[ks.length - 1]; let frame = this.def.base;
    for (const k of ks) { if (k.t <= u && k.f !== undefined) frame = k.f; }
    for (let i = 0; i < ks.length; i++) { if (ks[i].t <= u) a = ks[i]; if (ks[i].t >= u) { b = ks[i]; break; } }
    const span = Math.max(1e-4, b.t - a.t), w = a === b ? 0 : ease(Math.min(1, Math.max(0, (u - a.t) / span)));
    const L = (key: keyof SpriteKey) => ((a[key] as number | undefined) ?? 0) * (1 - w) + ((b[key] as number | undefined) ?? 0) * w;
    return { frame, arm: L('arm'), lean: L('lean'), sq: L('sq'), dx: L('dx'), dy: L('dy'), rot: L('rot'), glow: L('glow'), shake: L('shake') };
  }

  update(dt: number) {
    let k = this.timeScale; if (this.hitStop > 0) { this.hitStop -= dt; k *= 0.08; }
    const d = Math.min(0.1, dt) * k; this.t += d; const def = this.def; const kind = def.kind;
    // ---------------- facing: billboard to the camera, mirror when the game's yaw points screen-left
    const cam = spriteView.camera; this.root.updateWorldMatrix(true, false);
    const me = this.root.matrixWorld.elements; const yaw = Math.atan2(me[8], me[10]);
    if (cam) {
      cam.getWorldQuaternion(_q); this.root.getWorldQuaternion(_q2); this.pivot.quaternion.copy(_q2.invert().multiply(_q));
      _right.set(1, 0, 0).applyQuaternion(_q); const fx = Math.sin(yaw) * _right.x + Math.cos(yaw) * _right.z;
      if (this.anim?.anim.dirs) {
        // directional sheet: pick the painted row for the screen-space facing (hysteresis so it never flickers on a sector edge)
        _fwd.set(0, 0, -1).applyQuaternion(_q); _fwd.y = 0; _fwd.normalize(); const rx = _right.x, rz = _right.z, rl = Math.hypot(rx, rz) || 1;
        const sx = (Math.sin(yaw) * rx + Math.cos(yaw) * rz) / rl, sz = Math.sin(yaw) * _fwd.x + Math.cos(yaw) * _fwd.z;
        const a = Math.atan2(sx, -sz), diff = Math.atan2(Math.sin(a - this.dirAngle), Math.cos(a - this.dirAngle));
        if (Math.abs(diff) > Math.PI / 8 + 0.12) { const sector = ((Math.round(a / (Math.PI / 4)) % 8) + 8) % 8; this.dirAngle = sector * Math.PI / 4; this.dirRow = SECTOR_ROW[sector]; }
        this.flipTarget = 1;
      } else {
      this.flipLock -= d; const want = Math.abs(fx) < 0.18 ? this.flipTarget : (fx >= 0 ? 1 : -1) * ((this.anim ? this.anim.anim.facesLeft : def.facesLeft) ? -1 : 1);
      if (want !== this.flipTarget && this.flipLock <= 0) { this.flipTarget = want; this.flipLock = 0.18; }
      }
    }
    // a turn reads as a quick squash through the edge instead of an instant mirror
    this.flip += (this.flipTarget - this.flip) * damp(22, d); const flipMag = Math.max(0.12, Math.abs(this.flip));
    // ---------------- velocity (world) -> screen-space x speed for cloth/hair springs
    this.root.getWorldPosition(_v);
    if (this.hasLast && d > 0) { _v2.subVectors(_v, this.lastPos); const sp = _v2.length() / Math.max(1e-4, dt); this.speedSmooth += ((sp < 30 ? sp : 0) - this.speedSmooth) * damp(10, d); if (cam) this.vel = sp < 30 ? _v2.dot(_right) / Math.max(1e-4, dt) : 0; }
    this.lastPos.copy(_v); this.hasLast = true;
    // ---------------- locomotion layer
    const moving = !this.dead && (this.loco === 'Run' || this.loco === 'Walk') && !this.shot;
    this.runW += ((moving ? 1 : 0) - this.runW) * damp(moving ? 10 : 7, d);
    const cadence = (kind === 'beast' ? 7.5 : 8.8) * Math.min(2.2, Math.max(0.7, this.locoSpeed));
    this.phase += d * cadence * (0.25 + this.runW);
    const s = Math.sin(this.phase), bounce = Math.abs(s);
    let breath = Math.sin(this.t * (kind === 'beast' ? 2.6 : 2.0)) * (def.breath ?? 0.016) * (1 - this.runW * 0.7);
    let lean = Math.sin(this.t * 0.9) * 0.008 + this.runW * (kind === 'beast' ? 0.05 : 0.13);
    let sq = this.runW * (Math.cos(this.phase * 2) * 0.035) + breath * 0.4;
    let offY = this.runW * bounce * (kind === 'beast' ? 0.035 : 0.06) * (def.bob ?? 1);
    let offX = 0, rotZ = this.runW * s * (kind === 'beast' ? 0.02 : 0.035), arm = Math.sin(this.t * 1.7) * 0.02, stride = this.runW * s * 0.045, glow = 0;
    if (kind === 'flyer') { offY += 0.12 + Math.sin(this.t * 2.2) * 0.07; rotZ += Math.sin(this.t * 1.3) * 0.03; }
    let frame = this.runW > 0.5 && def.run ? def.run : def.base;
    // ---------------- one-shot / channel layer
    if (this.shot && !this.dead) {
      const sh = this.shot; sh.t += d; let u = sh.t / sh.dur;
      if (u >= 1) { if (sh.loop) { sh.t %= sh.dur; u = sh.t / sh.dur; } else if (sh.hold) u = 1; else { this.shot = null; u = -1; } }
      this.shotU = u;
      if (u >= 0) {
        const c = this.sample(sh.def, u); frame = c.frame;
        arm += c.arm; lean += c.lean; sq += c.sq; offX += c.dx; offY += c.dy; rotZ += c.rot; glow = c.glow;
        if (c.shake) offX += Math.sin(this.t * 60) * c.shake * 0.02;
        if (sh.loop) { breath *= 1.6; glow += Math.sin(this.t * 5) * 0.08; }
      }
    }
    // hit reaction: snap back and settle (springs pick up the jolt)
    if (this.hitT >= 0) { this.hitT += d; const h = Math.max(0, 1 - this.hitT / 0.32); offX -= 0.08 * h * h; sq -= 0.05 * h; lean -= 0.09 * h; if (this.hitT > 0.32) this.hitT = -1; }
    // death: topple away from the facing direction, sink a little
    // flipbook frames already carry the motion: no body deform at all, only root moves (hover / bob / hit / dash)
    if (this.anim) { rotZ = 0; lean *= 0.25; offY *= kind === 'flyer' ? 0.6 : 0.35; stride = 0; breath = 0; arm = 0; sq *= 0.3;
      // 8-way class sheets: the painted walk frames barely move the legs, so add a step bounce locked to the
      // flipbook (two steps per cycle: down on each foot plant) plus a slight side-to-side weight shift
      const a = this.anim.anim, wc = a.clips[this.animClip];
      if (a.dirs && wc && (this.animClip === 'walk' || this.animClip === 'run') && kind !== 'flyer' && !this.shot) {
        const p = (this.animF % wc[1]) / wc[1] * Math.PI * 4;
        offY = this.runW * (0.025 + 0.045 * Math.abs(Math.sin(p / 2 + Math.PI / 2)));
        rotZ = this.runW * Math.sin(p / 2) * 0.03; sq = this.runW * Math.cos(p) * 0.025; lean = this.runW * 0.04;
      } }
    else { breath *= 0.6; } // painted key poses: calmer breathing than before (less "flowing")
    let death = 0;
    if (this.deathT >= 0) { this.deathT += d; death = ease(Math.min(1, this.deathT / 0.55)); frame = def.base; }
    const topple = this.anim?.anim.clips.death ? 0 : 1; rotZ += death * 1.4 * (def.kind === 'flyer' ? 0.5 : 1) * topple; offY -= death * (kind === 'flyer' ? 0.25 : 0.04); sq -= death * 0.08;
    this.offNow.set(offX, offY);
    if (this.anim) this.stepFlipbook(d); else this.setFrame(frame);
    if (this.overlays.length) this.stepOverlays();
    if (this.popT > 0) { this.popT = Math.max(0, this.popT - d); sq += Math.sin((1 - this.popT / 0.09) * Math.PI) * 0.035; }
    // ---------------- springs: cloth hem trails the screen-space velocity, overshoots when stopping
    const vx = Math.max(-6, Math.min(6, this.vel)) * (this.flip >= 0 ? 1 : -1);
    const clothTarget = -vx * 0.03 * (def.cloth ?? 1) - lean * 0.25;
    this.clothV.x += ((clothTarget - this.cloth.x) * 90 - this.clothV.x * 9) * d; this.cloth.x += this.clothV.x * d;
    this.clothV.y += ((-offY * 0.5 - this.cloth.y) * 70 - this.clothV.y * 8) * d; this.cloth.y += this.clothV.y * d;
    const hairTarget = -vx * 0.014 * (def.hair ?? 1) - offY * 0.0;
    this.hairV.x += ((hairTarget - this.hair.x) * 55 - this.hairV.x * 6) * d; this.hair.x += this.hairV.x * d;
    this.hairV.y += ((-offY * 0.6 - this.hair.y) * 60 - this.hairV.y * 6) * d; this.hair.y += this.hairV.y * d;
    // ---------------- flash
    let flash = 0; if (this.flashT > 0) { this.flashT = Math.max(0, this.flashT - dt); flash = Math.min(1, this.flashT / Math.max(0.01, this.flashMax * 0.6)) * 0.55; }
    // ---------------- push uniforms to every layer; fade layers
    const top = this.layers[this.layers.length - 1];
    for (const l of this.layers) {
      if (l === top) l.alpha = Math.min(1, l.alpha + dt / 0.045); else l.alpha = top.alpha >= 1 ? 0 : 1;
      const f: SpriteFrame = SPRITE_FRAMES[l.frame]; const uu = l.mat.uniforms; const rig = def.arm;
      uu.uTime.value = this.t; uu.uBreath.value = l.breath ? 0 : breath; uu.uLean.value = lean; uu.uSq.value = sq; uu.uRot.value = rotZ;
      uu.uStride.value = stride * f.h; uu.uFlip.value = this.flip >= 0 ? flipMag : -flipMag; uu.uWave.value = this.anim ? 0 : (0.004 + this.runW * 0.008) * (def.cloth ?? 1) * f.h; uu.uH.value = f.h;
      const sp = this.anim ? 0 : 0.45; (uu.uCloth.value as Vector2).set(this.cloth.x * f.h * sp, this.cloth.y * f.h * sp); (uu.uHair.value as Vector2).set(this.hair.x * f.h * sp, this.hair.y * f.h * sp); (uu.uOff.value as Vector2).set(offX, offY);
      if (this.anim) (uu.uCell.value as Vector4).copy(this.cell);
      else if (l.breath) { const b = BREATH_ANIMS[l.frame], rows = Math.ceil(b.n / b.cols), i = Math.floor(((this.t / BREATH_PERIOD) % 1) * b.n) % b.n;
        (uu.uCell.value as Vector4).set((i % b.cols) / b.cols, 1 - (Math.floor(i / b.cols) + 1) / rows, 1 / b.cols, 1 / rows); }
      if (rig && l.frame === def.base && !this.anim) { uu.uArm.value = arm * (rig.dir ?? 1); (uu.uArmRect.value as Vector4).set(rig.rect[0], rig.rect[1], rig.rect[2], rig.rect[3]); (uu.uArmPivotL.value as Vector2).set(f.w * (rig.pivot[0] - f.fx), f.h * (rig.pivot[1] - f.fy)); }
      else { uu.uArm.value = 0; (uu.uArmRect.value as Vector4).set(2, 2, 2, 2); }
      (uu.uTint.value as Color).copy(this.tint); (uu.uFlash.value as Vector4).set(this.flashColor.r, this.flashColor.g, this.flashColor.b, flash);
      (uu.uGlow.value as Vector4).set(this.glowColor.r, this.glowColor.g, this.glowColor.b, Math.max(0, glow) * (this.anim ? 0.12 : 0.5)); // painted effects already glow in flipbook frames
      uu.uOpacity.value = this.opacity * l.alpha; l.mesh.visible = this.opacity * l.alpha > 0.01;
    }
    if (this.rig?.hands && this.anim) {
      if (!this.handsMesh) { const m = makeMaterial(animTexture(this.anim.key + '-hands')); this.handsMesh = new Mesh(top.mesh.geometry, m); this.handsMesh.frustumCulled = false; this.handsMesh.renderOrder = 8; this.pivot.add(this.handsMesh); }
      const hm = this.handsMesh, hu = (hm.material as ShaderMaterial).uniforms, tu = top.mat.uniforms;
      for (const k in tu) { if (k === 'map' || !hu[k]) continue; const v = tu[k].value; if (v && typeof v.copy === 'function') hu[k].value.copy(v); else hu[k].value = v; }
      hm.position.copy(top.mesh.position); hm.position.z += 0.03; hm.rotation.copy(top.mesh.rotation); hm.scale.copy(top.mesh.scale);
      hm.visible = this.handsOn && top.mesh.visible;
    }
    if (this.weapon3dSheet && this.anim) {
      if (!this.weapon3dMesh) { const m = makeMaterial(animTexture(`${this.anim.key}-${this.weapon3dSheet}`)); this.weapon3dMesh = new Mesh(top.mesh.geometry, m); this.weapon3dMesh.frustumCulled = false; this.weapon3dMesh.renderOrder = 7; this.pivot.add(this.weapon3dMesh); }
      const wm = this.weapon3dMesh, wu = (wm.material as ShaderMaterial).uniforms, tu = top.mat.uniforms;
      for (const k in tu) { if (k === 'map' || !wu[k]) continue; const v = tu[k].value; if (v && typeof v.copy === 'function') wu[k].value.copy(v); else wu[k].value = v; }
      wm.position.copy(top.mesh.position); wm.position.z += 0.02; wm.rotation.copy(top.mesh.rotation); wm.scale.copy(top.mesh.scale);
      wm.visible = top.mesh.visible;
    }
    if (this.hair3dStyle && this.anim) {
      if (!this.hair3dMesh) { const m = makeMaterial(animTexture(this.anim.key + '-hair-' + this.hair3dStyle)); this.hair3dMesh = new Mesh(top.mesh.geometry, m); this.hair3dMesh.frustumCulled = false; this.hair3dMesh.renderOrder = 6; this.pivot.add(this.hair3dMesh); }
      const hm = this.hair3dMesh, hu = (hm.material as ShaderMaterial).uniforms, tu = top.mat.uniforms;
      for (const k in tu) { if (k === 'map' || !hu[k]) continue; const v = tu[k].value; if (v && typeof v.copy === 'function') hu[k].value.copy(v); else hu[k].value = v; }
      (hu.uTint.value as Color).multiply(this.hairColor);
      hm.position.copy(top.mesh.position); hm.position.z += 0.012; hm.rotation.copy(top.mesh.rotation); hm.scale.copy(top.mesh.scale);
      hm.visible = top.mesh.visible && !this.hideHair;
    }
    if (this.xrayOn) {
      if (!this.xrayMesh) {
        const m = new ShaderMaterial({ uniforms: UniformsUtils.clone(top.mat.uniforms), vertexShader: VERT, fragmentShader: XRAY_FRAG, transparent: true, depthWrite: false, depthFunc: GreaterDepth, side: DoubleSide, toneMapped: false });
        this.xrayMesh = new Mesh(top.mesh.geometry, m); this.xrayMesh.frustumCulled = false; this.xrayMesh.renderOrder = 50; this.pivot.add(this.xrayMesh);
      }
      const xm = this.xrayMesh, xu = (xm.material as ShaderMaterial).uniforms, tu = top.mat.uniforms;
      for (const k in tu) { if (!xu[k]) continue; const v = tu[k].value; if (k !== 'map' && v && typeof v.copy === 'function') xu[k].value.copy(v); else xu[k].value = v; }
      if (this.glowColor) (xu.uGlow.value as Vector4).set(this.glowColor.r, this.glowColor.g, this.glowColor.b, 1);
      if (xm.geometry !== top.mesh.geometry) xm.geometry = top.mesh.geometry;
      xm.position.copy(top.mesh.position); xm.rotation.copy(top.mesh.rotation); xm.scale.copy(top.mesh.scale);
      xm.visible = top.mesh.visible && !this.dead;
    }
    if (this.layers.length > 1 && top.alpha >= 1) { for (const l of this.layers.slice(0, -1)) { this.pivot.remove(l.mesh); l.mat.dispose(); } this.layers = [top]; }
    if (this.shadow) { (this.shadow.material as MeshBasicMaterial).opacity = this.opacity * (1 - death * 0.4) * (kind === 'flyer' ? 0.6 : 1); this.shadow.scale.x = Math.abs(this.shadow.scale.x) * 1; }
  }
  private cell = new Vector4(0, 0, 1, 1);
  /** pick the flipbook clip (shot → attack/skill…, moving → walk/run, else idle) and the current cell */
  private stepFlipbook(d: number) {
    const a = this.anim!.anim; let name = 'idle', fps = IDLE_FPS, idx = 0;
    const shot = this.shot && !this.dead && this.shotU >= 0 ? this.shot : null;
    if (shot) name = (SHOT_CLIPS[shot.name] ?? ['attack']).find(c => a.clips[c]) ?? 'idle';
    else if (!this.dead && this.runW > 0.5) {
      // walk ↔ run with a dead band (1.15 … 1.4) so a speed hovering near the switch point never flickers between them
      const wasRun = this.animClip === 'run', wantRun = wasRun ? this.locoSpeed > 1.15 : this.locoSpeed > 1.4;
      name = wantRun && a.clips.run ? 'run' : a.clips.walk ? 'walk' : 'run'; fps = (name === 'run' ? RUN_FPS : WALK_FPS) * Math.min(1.6, Math.max(0.7, this.locoSpeed));
    }
    const c = a.clips[name] ?? a.clips.idle ?? [0, 1];
    if (name !== this.animClip) {
      // walk ↔ run keeps the step phase (same foot forward), everything else starts from its first frame
      const loco = (n: string) => n === 'walk' || n === 'run', from = a.clips[this.animClip], to = a.clips[name];
      this.animF = loco(name) && loco(this.animClip) && from && to ? (this.animF % from[1]) / from[1] * to[1] : 0;
      this.animClip = name; this.animT = 0;
    } else { this.animT += d; this.animF += d * fps; } // animF: frames played — the rate can change with ground speed without the cycle jumping
    const dc = a.clips.death;
    if (this.dead && dc) idx = dc[0] + Math.min(dc[1] - 1, Math.floor(Math.max(0, this.deathT) * 8));
    else if (this.dead) idx = c[0];
    else if (shot && name === 'talk' && c[1] > 2) { const k = Math.floor(this.animT * TALK_FPS) % (c[1] * 2 - 2); idx = c[0] + (k < c[1] ? k : c[1] * 2 - 2 - k); } // NPC gestures: ping-pong, never a jump
    else if (shot) idx = c[0] + Math.min(c[1] - 1, Math.floor(this.shotU * c[1]));
    else if (name === 'idle' && c[1] > 2) { const k = Math.floor(this.animT * fps) % (c[1] * 2 - 2); idx = c[0] + (k < c[1] ? k : c[1] * 2 - 2 - k); } // ping-pong: no jump at the loop
    else idx = c[0] + Math.floor(this.animF) % c[1];
    if (this.rig) this.placeRig(this.dead && dc ? 'death' : name, idx - (this.dead && dc ? dc[0] : c[0]));
    if (a.dirs) idx += this.dirRow * (this.dead && dc ? dc[1] : c[1]); // 8-way: each clip is 8 runs of `count` frames, one per facing
    const rows = Math.ceil(a.n / a.cols), col = idx % a.cols, row = Math.floor(idx / a.cols);
    this.cell.set(col / a.cols, 1 - (row + 1) / rows, 1 / a.cols, 1 / rows);
  }
  dispose() { for (const l of this.layers) l.mat.dispose(); if (this.xrayMesh) (this.xrayMesh.material as ShaderMaterial).dispose(); if (this.handsMesh) (this.handsMesh.material as ShaderMaterial).dispose(); if (this.hair3dMesh) (this.hair3dMesh.material as ShaderMaterial).dispose(); if (this.weapon3dMesh) (this.weapon3dMesh.material as ShaderMaterial).dispose(); this.swapLayerMesh(this.hairMesh, null, 0, 0, 1, 0); this.swapLayerMesh(this.weaponMesh, null, 0, 0, 1, 0); this.root.removeFromParent(); }
}
const GENERIC: SpriteClip = { dur: 0.6, keys: [{ t: 0 }, { t: 0.3, lean: -0.08, sq: 0.03 }, { t: 0.45, lean: 0.14, dx: 0.12, sq: -0.04 }, { t: 1 }] };
const HIT: SpriteClip = { dur: 0.32, keys: [{ t: 0 }, { t: 1 }] };
/** game clip → flipbook clip names, first one the sheet has wins */
const SHOT_CLIPS: Record<string, string[]> = {
  Attack: ['attack', 'cast'], Attack2: ['attack2', 'attack', 'cast'], Skill: ['skill', 'dash', 'attack', 'cast'], Special: ['special', 'ultimate', 'skill', 'attack', 'cast'],
  Buff: ['buff', 'skill', 'cast', 'idle'], Channel: ['skill', 'buff', 'cast', 'idle'], Guard: ['guard', 'armor', 'idle'], Hit: ['hurt', 'idle'], Talk: ['talk', 'idle'],
};
/** flipbook playback rates — painted sheets have few frames, so slower reads as smoother (was 8 / 10 / 12) */
const IDLE_FPS = 5, WALK_FPS = 8, RUN_FPS = 10, TALK_FPS = 3.2;
const FALLBACK: Record<string, string> = { Attack2: 'Attack', Skill: 'Attack', Special: 'Skill', Buff: 'Channel', Guard: 'Channel' };
