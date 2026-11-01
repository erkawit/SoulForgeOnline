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
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { AnimationMixer, Box3, LoopOnce, LoopRepeat, Mesh, MeshMatcapMaterial, CanvasTexture, SRGBColorSpace, Group,
  type AnimationAction, type Bone, type Material, type Object3D, type Texture, type MeshStandardMaterial } from 'three';
import type { CharacterClip } from '@/game/characterModels';

export const HERO3D_URL = (g: 'm' | 'f') => `/models/hero/hero-base-${g}.glb`;
export const WEAPON3D_URL = (tier: number, skin?: string | null) => skin === 'thai-greatsword' ? '/models/weapons/greatsword-thai.glb' : `/models/weapons/greatsword-t${Math.max(1, Math.min(8, tier + 1))}.glb`;
const LOOPS = new Set(['Idle', 'Walk', 'Run', 'Guard', 'Channel']);
const HEIGHT = 1.75;       // world units, the 2.5D hero's height
const WEAPON_LEN = 1.3;    // greatsword length in world units (chibi scale: about 75 % of the hero)
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

function Weapon({ hand, url }: { hand: Bone; url: string }) {
  const { scene } = useGLTF(url);
  const obj = useMemo(() => { const g = new Group(); const s = scene.clone(true); paint(s); s.scale.setScalar(WEAPON_LEN); g.add(s); return g; }, [scene]);
  useEffect(() => {
    // the hand bone's world scale includes the armature's import scale: undo it so the sword keeps its world size
    hand.updateWorldMatrix(true, false); const ws = hand.getWorldScale(obj.scale.clone()); obj.scale.set(1 / ws.x, 1 / ws.y, 1 / ws.z);
    // weapon GLBs: blade along glTF -Z (Blender +Y), origin at the grip. Mixamo right hand: +X is the axis the fist closes
    // around (it points up in the Great Sword idle), so the blade goes along the hand's +X (tuned in the try-on stage)
    obj.position.set(0, 0.075 / ws.y, 0.02 / ws.z); obj.rotation.set(0, -Math.PI / 2, 0);
    hand.add(obj);
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __heroWeapon?: Object3D }).__heroWeapon = obj; // dev: tune the grip live
    return () => { hand.remove(obj); };
  }, [hand, obj]);
  return null;
}

export default function Hero3D({ gender = 'm', clip = 'Idle', replay = 0, duration, speedRef, weaponTier = 0, weaponSkin, noWeapon }: {
  gender?: 'm' | 'f'; clip?: CharacterClip | 'Attack3' | 'Dash' | 'Draw'; replay?: number; duration?: number; speedRef?: { current: number };
  weaponTier?: number; weaponSkin?: string | null; noWeapon?: boolean;
}) {
  const { scene, animations } = useGLTF(HERO3D_URL(gender));
  const model = useMemo(() => {
    const m = cloneSkinned(scene); paint(m); return m;
  }, [scene]);
  const root = useRef<Group>(null);
  const mixer = useMemo(() => new AnimationMixer(model), [model]);
  const actions = useMemo(() => Object.fromEntries(animations.map(a => [a.name, mixer.clipAction(a)])) as Record<string, AnimationAction>, [animations, mixer]);
  const hand = useMemo(() => findBone(model, 'RightHand'), [model]);
  const current = useRef<AnimationAction | null>(null);
  // fit to HEIGHT once, from the skinned bounds in the rest pose
  useEffect(() => {
    const g = root.current; if (!g) return; g.add(model);
    // normalise the height (the Mixamo export keeps its own units) and stand on the ground — measured in the parent's space
    model.position.set(0, 0, 0); model.scale.setScalar(1); g.updateMatrixWorld(true);
    const inv = g.matrixWorld.clone().invert(), box = new Box3().setFromObject(model, true).applyMatrix4(inv), h = box.max.y - box.min.y;
    if (h > 1e-6) { const k = HEIGHT / h; model.scale.setScalar(k); model.position.y = -box.min.y * k; }
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __hero?: Object3D }).__hero = model;
    return () => { g.remove(model); };
  }, [model]);
  useEffect(() => () => { mixer.stopAllAction(); }, [mixer]);
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
  });
  return <group ref={root}>{hand && !noWeapon && <Weapon hand={hand} url={WEAPON3D_URL(weaponTier, weaponSkin)} />}</group>;
}
useGLTF.preload(HERO3D_URL('m'));
