'use client';
// Round 18: the hero as a real 3D model (public/models/hero/hero-base-<m|f>.glb — the Meshy base body rigged in Mixamo
// with the Great Sword pack, built by blender/base3d/assemble_hero.py). Same props as AnimatedCharacter, so ClassActor,
// the wardrobe stage and the login lineup can swap one for the other.
//  • clips: crossfaded AnimationMixer actions (Idle / Walk / Run loop; attacks and skills play once, fitted to the
//    action's duration; Death holds the last frame)
//  • weapon: a rigid GLB (public/models/weapons/greatsword-t<1..8>.glb, the same Meshy swords as the item icons) parented
//    to the right-hand bone; the left hand follows the mocap (the Great Sword pack already closes both hands on the grip)
//  • look: the texture shaded by a fixed painted matcap (top-left light), so it matches the 2.5D world in any scene
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { AnimationMixer, DoubleSide, Box3, Matrix4, Vector3, type Quaternion, LoopOnce, LoopRepeat, Mesh, MeshMatcapMaterial, CanvasTexture, SRGBColorSpace, Group,
  type AnimationAction, type Bone, type SkinnedMesh, type Material, type Object3D, type Texture, type MeshStandardMaterial } from 'three';
import type { CharacterClip } from '@/game/characterModels';

/** body model: the bare base, or a whole outfit body (same Mixamo skeleton and clips), e.g. 'thai' */
/** whole dressed bodies (Meshy outfit on the same T-pose mannequin, skinned with the base body's weights, same skeleton
 *  and clips). The class outfit is what a hero wears with no fashion outfit on; 'base' is the bare mannequin. */
export const OUTFIT3D = new Set<string>(['base', 'berserker']);
// the Berserker outfit body is on hold (not checked in every clip yet): every hero wears the bare base body
export const CLASS_OUTFIT3D = 'base';
export const HERO3D_URL = (g: 'm' | 'f', outfit?: string | null) => `/models/hero/hero-${outfit && OUTFIT3D.has(outfit) ? outfit : CLASS_OUTFIT3D}-${g}.glb`;
export const HAIR3D_STYLES = ['A06', 'A03', 'B01', 'B04'];
export const WEAPON3D_URL = (tier: number, skin?: string | null) => skin === 'thai-greatsword' ? '/models/weapons/greatsword-thai.glb' : `/models/weapons/greatsword-t${Math.max(1, Math.min(8, tier + 1))}.glb`;
const LOOPS = new Set(['Idle', 'Walk', 'Run', 'Guard', 'Channel']);
const HEIGHT = 1.75;       // world units, the 2.5D hero's height
const WEAPON_LEN = 1.2;    // greatsword length in world units (about 70 % of the hero; the grip must take both fists)
const GRIP_CURL = 1.2;     // radians added to every finger joint (both hands) while a weapon is held: a closed fist
const FADE = 0.18;

// painted look that does not depend on the scene lights (the field is lit much brighter than the try-on stage): a matcap
// lit from the upper left, soft falloff to a warm shadow, a slightly darker rim
let matcap: CanvasTexture | null = null;
function paintedMatcap() {
  if (matcap || typeof document === 'undefined') return matcap;
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  const gr = g.createRadialGradient(100, 92, 8, 128, 128, 132);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#f1ebe6'); gr.addColorStop(0.78, '#b9aca6'); gr.addColorStop(1, '#6d625f');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
  matcap = new CanvasTexture(c); matcap.colorSpace = SRGBColorSpace; return matcap;
}
function toon(m: Material): Material {
  const s = m as MeshStandardMaterial;
  return new MeshMatcapMaterial({ map: (s.map as Texture | null) ?? null, color: s.map ? 0xffffff : s.color, matcap: paintedMatcap(), transparent: s.transparent, alphaTest: s.alphaTest });
}
function paint(root: Object3D) {
  root.traverse(o => { const m = o as Mesh; if (!m.isMesh) return; m.castShadow = true; m.frustumCulled = false;
    m.material = Array.isArray(m.material) ? m.material.map(toon) : toon(m.material); });
}
const findBone = (root: Object3D, part: string) => { let b: Bone | null = null; root.traverse(o => { if (!b && (o as Bone).isBone && o.name.replace(/[^a-z]/gi, '').toLowerCase().endsWith(part.toLowerCase())) b = o as Bone; }); return b as Bone | null; };

// hair: every style is fitted to THIS body's head at load, in the head bone's own space — the head is found from the
// skinned vertices that follow the head bone (bind pose), so any body (base, outfit, other proportions) wears the same
// hair files. Width = head width × 1.16 (measured on the top third of the hair), top just above the skull.
/** hair width as a share of the head's width, per body (tuned in /dev-hero) */
export const HAIR_FIT: Record<'m' | 'f', { w: number; top: number; back: number }> = { m: { w: 1.08, top: 0.025, back: 0.04 }, f: { w: 1.06, top: 0.02, back: 0.04 } };
function fitHair(model: Object3D, fit = HAIR_FIT.m) {
  let body: SkinnedMesh | null = null; model.traverse(o => { const s = o as SkinnedMesh; if (s.isSkinnedMesh && (!body || s.geometry.attributes.position.count > body.geometry.attributes.position.count)) body = s; });
  const head = findBone(model, 'Head'); if (!body || !head) return;
  const b = body as SkinnedMesh; model.updateMatrixWorld(true); b.skeleton.update();
  const bi = b.skeleton.bones.indexOf(head); if (bi < 0) return;
  const pos = b.geometry.attributes.position, si = b.geometry.attributes.skinIndex, sw = b.geometry.attributes.skinWeight;
  const toHead = new Matrix4().copy(head.matrixWorld).invert(), v = new Vector3();
  const lo = new Vector3(Infinity, Infinity, Infinity), hi = new Vector3(-Infinity, -Infinity, -Infinity);
  for (let i = 0; i < pos.count; i++) {
    let w = 0; for (let k = 0; k < 4; k++) if (si.getComponent(i, k) === bi) w += sw.getComponent(i, k);
    if (w < 0.5) continue;
    v.fromBufferAttribute(pos, i); b.applyBoneTransform(i, v); v.applyMatrix4(b.matrixWorld).applyMatrix4(toHead); lo.min(v); hi.max(v);
  }
  if (!isFinite(lo.x)) return;
  model.traverse(o => {
    if (!/^Hair_[A-Z]\d\d/.test(o.name) || o.parent !== head) return;
    const meshes: Mesh[] = []; o.traverse(c => { if ((c as Mesh).isMesh) meshes.push(c as Mesh); });
    // hair points in the hair node's own (unscaled) space
    const P: Vector3[] = []; o.updateMatrixWorld(true); const inv = new Matrix4().copy(o.matrixWorld).invert();
    for (const m of meshes) { const pa = m.geometry.attributes.position, mw = new Matrix4().multiplyMatrices(inv, m.matrixWorld);
      for (let i = 0; i < pa.count; i += 3) P.push(new Vector3().fromBufferAttribute(pa, i).applyMatrix4(mw)); }
    if (!P.length) return;
    let yt = -Infinity, yb = Infinity; for (const p of P) { yt = Math.max(yt, p.y); yb = Math.min(yb, p.y); }
    const top = P.filter(p => p.y > yt - 0.35 * (yt - yb)); let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const p of top) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
    const k = (hi.x - lo.x) * fit.w / Math.max(1e-9, x1 - x0);
    o.rotation.set(0, 0, 0); o.scale.setScalar(k);
    o.position.set((lo.x + hi.x) / 2 - (x0 + x1) / 2 * k, hi.y + fit.top * (hi.y - lo.y) - yt * k, (lo.z + hi.z) / 2 - (z0 + z1) / 2 * k - fit.back * (hi.z - lo.z));
  });
}

// per body (its hands sit differently in the same clip): position in metres from the right-hand bone, rotation (XYZ)
type Grip = { pos: [number, number, number]; rot: [number, number, number] };
/** where the greatsword sits in the right hand, per body (each Mixamo rig puts the hands a little differently): position
 *  in metres from the right-hand bone, rotation XYZ. Measured in /dev-hero: the handle runs through both closed fists. */
const GRIP: Record<string, Record<'m' | 'f', Grip>> = {
  base: { m: { pos: [-0.1531, 0.0208, 0.0074], rot: [1.627, -0.932, -2.568] }, f: { pos: [-0.1261, -0.017, -0.0455], rot: [1.981, -0.714, -2.12] } },
  berserker: { m: { pos: [-0.1308, 0.0125, 0.0986], rot: [0.657, -0.914, 2.481] }, f: { pos: [-0.1596, 0.033, 0.0436], rot: [-0.06, -1.411, 1.962] } },
};
function Weapon({ hand, url, grip }: { hand: Bone; url: string; grip: Grip }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => { const g = new Group(); const s = scene.clone(true); paint(s); s.scale.setScalar(WEAPON_LEN); g.add(s); return g; }, [scene]);
  useEffect(() => {
    // the hand bone's world scale includes the armature's import scale: undo it so the sword keeps its world size
    hand.updateWorldMatrix(true, false); const ws = hand.getWorldScale(obj.scale.clone()); obj.scale.set(1 / ws.x, 1 / ws.y, 1 / ws.z);
    // grip measured on the base body in the Great Sword idle with GRIP_CURL: the handle runs through the middle of both
    // closed fists (the right fist just under the guard, the left one at the pommel end of the handle), and the blade is
    // rolled so its edges face where the hero faces (the flat to the sides). Weapon GLBs: blade along -Z, edges along X.
    const gp = grip; obj.position.set(gp.pos[0] / ws.x, gp.pos[1] / ws.y, gp.pos[2] / ws.z); obj.rotation.set(...gp.rot);
    hand.add(obj);
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __heroWeapon?: Object3D }).__heroWeapon = obj; // dev: tune the grip live
    return () => { hand.remove(obj); };
  }, [hand, obj, grip]);
  return null;
}

export default function Hero3D({ gender = 'm', clip = 'Idle', replay = 0, duration, speedRef, weaponTier = 0, weaponSkin, noWeapon, outfit, hair = 'A06', hairColor = '#a9a9ad', hideHair }: {
  gender?: 'm' | 'f'; clip?: CharacterClip | 'Attack3' | 'Dash' | 'Draw'; replay?: number; duration?: number; speedRef?: { current: number };
  weaponTier?: number; weaponSkin?: string | null; noWeapon?: boolean;
  /** whole-body outfit model ('thai') or the bare base */ outfit?: string | null;
  /** 3D hair style (Hair_<style> meshes on the head bone, tinted) — the other styles stay hidden */ hair?: string; hairColor?: string; hideHair?: boolean;
}) {
  const body = outfit && OUTFIT3D.has(outfit) ? outfit : CLASS_OUTFIT3D;
  const { scene, animations } = useGLTF(HERO3D_URL(gender, outfit));
  const model = useMemo(() => {
    const m = cloneSkinned(scene); paint(m); return m;
  }, [scene]);
  const root = useRef<Group>(null);
  const mixer = useMemo(() => new AnimationMixer(model), [model]);
  const actions = useMemo(() => Object.fromEntries(animations.map(a => [a.name, mixer.clipAction(a)])) as Record<string, AnimationAction>, [animations, mixer]);
  const hand = useMemo(() => findBone(model, 'RightHand'), [model]);
  const current = useRef<AnimationAction | null>(null);
  const fingers = useMemo(() => { const out: Bone[] = []; model.traverse(o => { if ((o as Bone).isBone && /(Left|Right)Hand(Index|Middle|Ring|Pinky)[123]$/.test(o.name)) out.push(o as Bone); }); return out; }, [model]);
  // fit to HEIGHT once, from the skinned bounds in the rest pose
  useEffect(() => {
    const g = root.current; if (!g) return; g.add(model);
    // normalise the height (the Mixamo export keeps its own units) and stand on the ground — measured in the parent's space
    model.position.set(0, 0, 0); model.scale.setScalar(1); g.updateMatrixWorld(true);
    // measured from the skinned body only: the hair meshes and any extras must not change the body's size
    const inv = g.matrixWorld.clone().invert(), box = new Box3();
    model.traverse(o => { if ((o as SkinnedMesh).isSkinnedMesh) box.expandByObject(o, true); });
    if (box.isEmpty()) box.setFromObject(model, true);
    box.applyMatrix4(inv); const h = box.max.y - box.min.y;
    if (h > 1e-6) { const k = HEIGHT / h; model.scale.setScalar(k); model.position.y = -box.min.y * k; }
    fitHair(model, HAIR_FIT[gender]);
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __refitHair?: (f: typeof HAIR_FIT.m) => void }).__refitHair = f => fitHair(model, f);
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __hero?: Object3D }).__hero = model;
    return () => { g.remove(model); };
  }, [model, gender]);
  useEffect(() => () => { mixer.stopAllAction(); }, [mixer]);
  const three = useThree();
  useEffect(() => { if (process.env.NODE_ENV !== 'production') Object.assign(window, { __heroMixer: mixer, __heroActions: actions, __heroThree: three }); }, [mixer, actions, three]);
  // hair: one style visible, tinted (the Meshy hair textures are neutral silver)
  useEffect(() => {
    const style = HAIR3D_STYLES.includes(hair) ? hair : 'A06';
    model.traverse(o => { const m = o.name.match(/^Hair_([A-Z]\d\d)/); if (!m) return; o.visible = !hideHair && m[1] === style;
      o.traverse(c => { const me = c as Mesh; if (!me.isMesh) return; const mm = me.material as MeshMatcapMaterial; mm.color?.set(hairColor); mm.side = DoubleSide; }); }); // both sides: no scalp through the strands
  }, [model, hair, hairColor, hideHair]);
  useEffect(() => {
    const name = actions[clip] ? clip : 'Idle', next = actions[name]; if (!next) return;
    const loop = LOOPS.has(name);
    next.reset(); next.setLoop(loop ? LoopRepeat : LoopOnce, loop ? Infinity : 1); next.clampWhenFinished = !loop;
    next.timeScale = !loop && duration && duration > 0.05 ? Math.max(0.6, Math.min(2.5, next.getClip().duration / duration)) : 1;
    const prev = current.current;
    if (prev && prev !== next) next.crossFadeFrom(prev, FADE, false); else next.fadeIn(FADE);
    next.play(); current.current = next;
    // a one-shot (attack, skill, hit) returns to idle by itself when it ends — unless it is Death
    if (!loop && name !== 'Death') {
      const done = (e: { action: AnimationAction }) => { if (e.action !== next) return; mixer.removeEventListener('finished', done as never);
        const idle = actions.Idle; if (idle && current.current === next) { idle.reset().play(); idle.crossFadeFrom(next, FADE, false); current.current = idle; } };
      mixer.addEventListener('finished', done as never); return () => mixer.removeEventListener('finished', done as never);
    }
  }, [actions, clip, replay, duration, mixer]);
  useFrame((_, dt) => {
    const a = current.current;
    if (a && speedRef && (a === actions.Run || a === actions.Walk)) a.timeScale = Math.max(0.7, Math.min(1.8, speedRef.current / (a === actions.Run ? 4.2 : 2.2)));
    mixer.update(Math.min(dt, 0.1));
    // close the fingers around the grip (the Mixamo pack leaves them half open)
    // (only on a fresh pose: if the mixer did not write this bone this frame, it still holds last frame's curl)
    if (!noWeapon) for (const b of fingers) { const last = b.userData.curled as Quaternion | undefined; if (last && b.quaternion.equals(last)) continue;
      b.rotation.x += GRIP_CURL; b.userData.curled = b.quaternion.clone(); }
  });
  return <group ref={root}>{hand && !noWeapon && <Weapon hand={hand} grip={(GRIP[body] ?? GRIP.base)[gender]} url={WEAPON3D_URL(weaponTier, weaponSkin)} />}</group>;
}
useGLTF.preload(HERO3D_URL('m'));
