'use client';
import { useAttached } from './useAttached';
import Label3D from './Label3D';
import {classLook} from '@/game/advancement';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Sparkles } from '@react-three/drei';
import { Vector3, Group, MathUtils } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useMultiplayerStore, type Remote } from '@/store/useMultiplayerStore';
import AnimatedCharacter from './AnimatedCharacter';
import { SpriteActor, spriteView } from '@/game/sprites/spriteActor';
import type { CharacterClip } from '@/game/characterModels';
import type { ClassId } from '@/game/content';
import { gameConnection, titanInReach } from '@/lib/multiplayer/socket';
import { RARITY_COLOR } from '@/lib/types';
import type { Item, Loot, Monster } from '@/lib/types';
import { lootTexture, LOOT_CARD_ASPECT } from '@/game/fx/lootIcon';
import { ITEM_BY_ID } from '@/game/items';

import ClassActor from './ClassActor';
import StarterCity from './StarterCity';
import MonsterModel,{hasMonsterModel,useDeathLinger} from './MonsterModel';
import SkillFxLayer from './SkillFxLayer';
import NpcLayer from './NpcLayer';
import RuinsLayer from './RuinsLayer';
import CitySpritesLayer from './CitySpritesLayer';
import NatureLayer from './NatureLayer';
import { paintedFieldUrl } from './PaintedFieldGround';
import FrameCap from './FrameCap';
import DamageLayer from './DamageLayer';
import { useSettingsStore } from '@/store/useSettingsStore';
import { touchMove } from '@/store/touchInput';
import { CLASSES,CITIES,CLASS_IDS } from '@/game/content';

const UP = new Vector3(0, 1, 0);
const tempForward = new Vector3();
const tempRight = new Vector3();
const tempMove = new Vector3();
/** left-click on the ground: walk there (cleared by WASD, arrival, a wall, or clicking a monster) */
const clickTarget: { x: number; z: number; set: boolean } = { x: 0, z: 0, set: false };
const clickCity = { v: '' };
let remainingRoute: [number, number][] = [];

/** invisible ground under the player that catches left-clicks for click-to-move */
function ClickGround() {
  const ref = useRef<Group>(null);
  useFrame(() => { const g = ref.current; if (!g) return; const [x, z] = useGameStore.getState().player.position; g.position.set(x, 0, z); });
  return <group ref={ref}><mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={-20} onClick={e => {
    if (e.button !== 0 || e.delta > 6) return; const s = useGameStore.getState(); if (s.journal || s.deadUntil) return;
    remainingRoute = []; clickTarget.x = e.point.x; clickTarget.z = e.point.z; clickTarget.set = true; s.selectMonster(null);
  }}><planeGeometry args={[240, 240]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} /></mesh></group>;
}

function InputAndChase() {
  const { camera } = useThree();
  const pressed = useRef<Set<string>>(new Set());
  const lastAttack = useRef(0);
  useEffect(() => {
    const followMapRoute = (event: Event) => {
      const {city, points} = (event as CustomEvent<{city: string; points: [number, number][]}>).detail;
      const state = useGameStore.getState();
      if (city !== (state.player.cityId ?? 'hollow') || state.deadUntil || !points.length) return;
      state.selectMonster(null);
      clickCity.v = city;
      remainingRoute = points.slice(1);
      [clickTarget.x, clickTarget.z] = points[0];
      clickTarget.set = true;
    };
    window.addEventListener('sf-map-route', followMapRoute);
    const keyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.closest('input,textarea,select') || e.target.isContentEditable)) return;
      if(useGameStore.getState().journal)return;
      if(e.key===' '&&e.target instanceof HTMLElement&&e.target.closest('button'))return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();
      // 1 = basic attack chain (each hit builds Rage)
      if (key === '1' && !e.repeat) { const g = useGameStore.getState(); if (titanInReach()) gameConnection.attack(); else { const t = g.monsters.find(m => m.id === g.selectedMonster && m.hp > 0) ?? g.monsters.filter(m => m.hp > 0).sort((a, b) => Math.hypot(a.x - g.player.position[0], a.z - g.player.position[1]) - Math.hypot(b.x - g.player.position[0], b.z - g.player.position[1]))[0]; if (t) { g.selectMonster(t.id); g.attack(t.id); } } }
      // skills accept a press every 250 ms; the store's cooldowns and cast lock decide what actually fires
      if (key === ' ' && !e.repeat && Date.now() - lastAttack.current > 250) {
        if (titanInReach()) gameConnection.attack('abyssal-forge-titan','soul_burst'); else useGameStore.getState().castNearest();
        lastAttack.current = Date.now();
      }
      if(!e.repeat&&(key==='q'||key==='e'))useGameStore.getState().cast(key==='q'?'buff':'special');
      pressed.current.add(key);
    };
    const keyUp = (e: KeyboardEvent) => { const k = e.key.toLowerCase(); pressed.current.delete(k); if (k === '1') useGameStore.getState().releaseCharge(); };
    const blur = () => pressed.current.clear();
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('sf-map-route', followMapRoute);
      window.removeEventListener('blur', blur);
    };
  }, []);
  useFrame((_, delta) => {
    // move every rendered frame (it used to step only every 40 ms: the character jumped forward in steps and, on the
    // frames in between, the animation thought it had stopped and flipped back to the idle pose)
    const step = Math.min(delta, 0.05);
    const p = pressed.current;
    const forwards = (Number(p.has('w') || p.has('arrowup')) - Number(p.has('s') || p.has('arrowdown'))) || -touchMove.y;
    const strafe = (Number(p.has('d') || p.has('arrowright')) - Number(p.has('a') || p.has('arrowleft'))) || touchMove.x;
    const state = useGameStore.getState();
    if ((state.player.cityId ?? 'hollow') !== clickCity.v) { clickCity.v = state.player.cityId ?? 'hollow'; clickTarget.set = false; } // a warp drops the old click target
    if(state.journal||state.deadUntil){pressed.current.clear(); if (state.deadUntil) clickTarget.set = false; return;}
    if (forwards || strafe) clickTarget.set = false;
    if (!forwards && !strafe && clickTarget.set && !state.pending) {
      const [px, pz] = state.player.position, dx = clickTarget.x - px, dz = clickTarget.z - pz, d = Math.hypot(dx, dz);
      if (d < 0.2) {
        const next = remainingRoute.shift();
        if (next) [clickTarget.x, clickTarget.z] = next;
        else clickTarget.set = false;
      }
      else { state.move(dx / d, dz / d, step); const [nx, nz] = useGameStore.getState().player.position; if (Math.hypot(nx - px, nz - pz) < 1e-4) clickTarget.set = false; }
      return;
    }
    if (forwards || strafe) {
      camera.getWorldDirection(tempForward).setY(0).normalize();
      tempRight.crossVectors(tempForward, UP).normalize();
      tempMove.copy(tempForward).multiplyScalar(forwards).addScaledVector(tempRight, strafe); if (tempMove.lengthSq() > 1) tempMove.normalize();
      state.selectMonster(null);
      state.move(tempMove.x, tempMove.z, step);
    } else if (state.selectedMonster && !state.pending && !state.charge) {
      const mob = state.monsters.find(m => m.id === state.selectedMonster && m.hp > 0);
      if (!mob) { state.selectMonster(null); return; }
      const [px, pz] = state.player.position;
      const dist = Math.hypot(mob.x - px, mob.z - pz);
      if (dist > classLook(state.player.classId??'Berserker',state.player.promotionId).range-.3) state.move((mob.x - px) / dist, (mob.z - pz) / dist, step);
      else if (Date.now() - lastAttack.current > 700) {
        state.attack(mob.id);
        lastAttack.current = Date.now();
      }
    }
  });
  return null;
}

const ISO_POLAR = Math.acos(1 / Math.sqrt(3)); // 54.74° from vertical

function FollowCamera({ painted }: { painted: boolean }) {
  const controls = useRef<ComponentRef<typeof OrbitControls> | null>(null);
  const target = useMemo(() => new Vector3(), []);
  const shift = useMemo(() => new Vector3(), []);
  useFrame((_, delta) => {
    const [x, z] = useGameStore.getState().player.position;
    const control = controls.current;
    if (control) {
      target.set(x, 0.5, z);
      shift.copy(target).sub(control.target).multiplyScalar(1 - Math.exp(-6 * delta));
      control.object.position.add(shift);
      control.target.add(shift);
      control.update();
    }
  });
  return (
    <>
      {/* true isometric 2.5D: 45° yaw, 35.26° down; the pitch is locked so painted sprites always read from the angle they were drawn for */}
      {/* 104 units back (was 26) so nothing on screen falls behind the near plane; the view is orthographic, so only the direction matters */}
      <OrthographicCamera makeDefault position={[60, 60, 60]} zoom={46} near={0.1} far={420} />
      <OrbitControls ref={controls} enablePan={false} enableDamping dampingFactor={0.09}
        minZoom={28} maxZoom={painted ? 60 : 96} minPolarAngle={ISO_POLAR} maxPolarAngle={ISO_POLAR}
        minAzimuthAngle={painted ? Math.PI / 4 : -Infinity} maxAzimuthAngle={painted ? Math.PI / 4 : Infinity}
        mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }} />
    </>
  );
}

function Creature({ mob }: { mob: Monster }) {
  const selected = useGameStore(s => s.selectedMonster === mob.id);
  const root = useRef<Group>(null);
  const rigged = hasMonsterModel(mob.name);
  const visible = useDeathLinger(mob);
  useFrame((state) => {
    if (root.current && !rigged) root.current.children[0].position.y = Math.sin(state.clock.elapsedTime * 1.9 + mob.x) * 0.17;
  });
  if (!visible) return null;
  const alive = mob.hp > 0, bar = mob.boss ? 4.3 : 2.69;
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation(); clickTarget.set = false;
    useGameStore.getState().selectMonster(mob.id);
  };
  return <group ref={root} position={[mob.x, 0.17, mob.z]} onClick={handleClick}>
    <MonsterModel mob={mob}/>
    {mob.telegraph&&<group position={[mob.telegraph.target[0]-mob.x,.1,mob.telegraph.target[1]-mob.z]}>
      <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[mob.telegraph.radius-.09,mob.telegraph.radius,48]}/><meshBasicMaterial color={mob.telegraph.kind==='bolt'?'#b98cff':'#ff8a51'} transparent opacity={.9} side={2}/></mesh>
      {mob.telegraph.kind==='skill'&&<mesh rotation={[-Math.PI/2,0,0]} position={[0,.01,0]}><circleGeometry args={[mob.telegraph.radius,48]}/><meshBasicMaterial color="#ffae3a" transparent opacity={.28} depthWrite={false}/></mesh>}
      <Label3D position={[0,.3,0]} text={`${mob.telegraph.kind==='skill'?`★ ${mob.telegraph.name ?? 'SKILL'}`:mob.telegraph.kind.toUpperCase()} · หลบ!`}/>
    </group>}
    {alive&&<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
      <ringGeometry args={[0.82, 0.92, 40]} />
      <meshBasicMaterial color={selected ? '#ff8b77' : '#9c59d8'} side={2} transparent opacity={selected ? 1 : 0.42} />
    </mesh>}
    {alive&&<><Label3D z={30} position={[0, bar + 0.37, 0]} className="actor-label monster-label" text={`${mob.elite?'ELITE · ':''}${mob.name} · Lv. ${mob.level}`}/>
    <mesh position={[0, bar, 0]}>
      <planeGeometry args={[1.65, 0.13]} />
      <meshBasicMaterial color="#351d27" depthTest={false} />
    </mesh>
    <mesh position={[-0.825 * (1 - mob.hp / mob.maxHp), bar + 0.005, 0.008]}>
      <planeGeometry args={[1.65 * mob.hp / mob.maxHp, 0.085]} />
      <meshBasicMaterial color="#f07e89" depthTest={false} />
    </mesh></>}
  </group>;
}

/** Round 16: ground loot = the item's own framed icon card (game/fx/lootIcon.ts), floating a little above the ground and
 *  spinning on its vertical axis, with a soft light column and a ground glow in the rarity colour. */
export function LootCard({ item, gender = 'm' }: { item: Item; gender?: 'm' | 'f' }) {
  const spin = useRef<Group>(null), seed = useMemo(() => Math.random() * 6.28, []);
  const tex = useMemo(() => lootTexture(item, gender), [item.definitionId, item.rarity, item.slot, gender]); // eslint-disable-line react-hooks/exhaustive-deps
  const c = RARITY_COLOR[item.rarity] ?? '#e8d7aa', h = 0.95, w = h * LOOT_CARD_ASPECT;
  useFrame(({ clock }) => { const t = clock.elapsedTime + seed; if (spin.current) { spin.current.rotation.y = t * 1.6; spin.current.position.y = 0.8 + Math.sin(t * 2.2) * 0.06; } });
  return <>
    <group ref={spin}>
      <mesh><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} fog={false} /></mesh>
      <mesh rotation={[0, Math.PI, 0]}><planeGeometry args={[w, h]} /><meshBasicMaterial map={tex} transparent alphaTest={0.02} toneMapped={false} fog={false} /></mesh>
    </group>
    <mesh position={[0, 1.9, 0]}><cylinderGeometry args={[0.04, 0.2, 3.6, 10, 1, true]} /><meshBasicMaterial color={c} transparent opacity={0.16} depthWrite={false} side={2} /></mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><circleGeometry args={[0.5, 32]} /><meshBasicMaterial color={c} transparent opacity={0.28} depthWrite={false} /></mesh>
    <pointLight color={c} intensity={1} distance={2.6} position={[0, 0.8, 0]} />
  </>;
}

/** dev builds only: window.__sfThree = { scene, camera, gl } for in-browser inspection (stripped from production) */
function DevExpose() { const t = useThree(); useEffect(() => { if (process.env.NODE_ENV !== 'production') (window as unknown as Record<string, unknown>).__sfThree = t; }, [t]); return null; }

function LootObject({ loot }: { loot: Loot }) {
  const gender = useGameStore(s => s.player.gender === 'f' ? 'f' : 'm');
  const pickup = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); useGameStore.getState().pickup(loot.id); };
  return <group position={[loot.x, 0, loot.z]} onClick={pickup}>
    <LootCard item={loot.item} gender={gender} />
    <Label3D z={30} position={[0, 1.55, 0]} className="actor-label loot-label" color={RARITY_COLOR[loot.item.rarity]} text={loot.item.name}/>
  </group>;
}

/** Other players: their class sprite, running while their snapshot position moves. */
function RemoteHero({ p }: { p: Remote }) {
  const root = useRef<Group>(null), last = useRef<[number, number]>([p.x, p.z]), moving = useRef(0);
  const cls = (CLASS_IDS as readonly string[]).includes(p.classId ?? '') ? p.classId as ClassId : 'Berserker';
  const [clip, setClip] = useState<CharacterClip>('Idle');
  useFrame((_, dt) => { if (!root.current) return; const dx = p.x - last.current[0], dz = p.z - last.current[1]; const d = Math.hypot(dx, dz);
    if (d > .002 && d < 3) { root.current.rotation.y = Math.atan2(dx, dz); moving.current = .25; } else moving.current = Math.max(0, moving.current - dt);
    last.current = [p.x, p.z]; root.current.position.lerp(tmpRemote.set(p.x, 0, p.z), 1 - Math.exp(-14 * dt));
    const want = moving.current > 0 ? 'Run' : 'Idle'; if (want !== clip) setClip(want); });
  return <group ref={root} position={[p.x, 0, p.z]}><AnimatedCharacter job={cls} clip={clip} gender={p.gender === 'f' ? 'f' : 'm'} />
    <Label3D z={30} position={[0, 2.05, 0]} color="#9fe9ff" text={p.name ?? `Player ${p.id.slice(0, 6)}`} sub={p.title ? `「${p.title}」` : null} subColor="#e9c46a"/></group>;
}
const tmpRemote = new Vector3();
function BossSprite({ hp }: { hp: number }) {
  const actor = useMemo(() => new SpriteActor('abyssal-forge-titan'), []); const last = useRef(hp);
  useEffect(() => () => actor.dispose(), [actor]); const holder = useAttached(actor.root);
  useFrame(({ camera }, dt) => { spriteView.camera = camera; if (hp < last.current) { actor.flash('#ffffff', .8); if (!actor.busy && Math.random() < .08) actor.play('Skill'); } last.current = hp; actor.update(dt); });
  return <group ref={holder} />;
}

function MultiplayerActors() {
 const {players,playerId,boss,loot,connected} = useMultiplayerStore();
 if(!connected)return null;
 return <group>
 {players.filter(p=>p.id!==playerId).map(p=><RemoteHero key={p.id} p={p}/>)}
 {boss&&<group position={[boss.x,0,boss.z]} onClick={e=>{e.stopPropagation();gameConnection.attack()}}>
   <BossSprite hp={boss.hp}/>
   <Label3D z={30} position={[0,5.6,0]} color="#ffd0dc" text={`ABYSSAL FORGE TITAN ${Math.ceil(boss.hp/boss.maxHp*100)}%`}/>
 </group>}
 {loot.map(l=><group key={l.id} position={[l.x,0,l.z]} onClick={e=>{e.stopPropagation();gameConnection.pickup(l.id)}}>
   <LootCard item={{ id: l.id, definitionId: l.itemDefinitionId, name: ITEM_BY_ID[l.itemDefinitionId]?.name ?? l.itemDefinitionId, rarity: l.rarity as Item['rarity'] } as Item}/>
   <Label3D z={30} position={[0,1.45,0]} className="actor-label loot-label" color={RARITY_COLOR[l.rarity as Item['rarity']] ?? '#fff3ad'} text={ITEM_BY_ID[l.itemDefinitionId]?.name ?? l.itemDefinitionId}/>
 </group>)}
 </group>;
}

function WorldContent() {
  const cityId = useGameStore(s => s.player.cityId??'hollow');
  const city=CITIES[cityId];
  const monsters = useGameStore(s => s.monsters);
  const drops = useGameStore(s => s.drops);
  return <>
    <color attach="background" args={[city.sky]} />
    <fog attach="fog" args={[city.sky, 123, 198]} />
    <ambientLight intensity={1.8} color="#c0c8d1" />
    <hemisphereLight args={['#a9c2ed', '#403c38', 1.7]} />
    <directionalLight castShadow position={[9, 17, 6]} intensity={2.2} color="#cfe2ff"
      shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-28}
      shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} />
    <pointLight position={[-7, 8, -2]} intensity={35} distance={35} color="#632f9c" />
    <StarterCity />
    {cityId === 'wild0' && !paintedFieldUrl(cityId) && <RuinsLayer />}{/* the Sorrowlands lie in Ashen Outskirts, below Hollow Reach */}
    {!city.parent && <CitySpritesLayer city={cityId} />}
    <ClassActor />
    {monsters.map(m => <Creature key={m.id} mob={m} />)}
    {drops.map(d => <LootObject key={d.id} loot={d} />)}
    {/* round 22: painted fields already show their trees and rocks */}
    {!(city.parent && paintedFieldUrl(cityId)) && <NatureLayer city={cityId} />}
    <SkillFxLayer />
    <DamageLayer />
    <DevExpose />
    <NpcLayer />
    <MultiplayerActors />
    <ClickGround />
    <InputAndChase />
    <FollowCamera painted={cityId === 'hollow' || (!!city.parent && !!paintedFieldUrl(cityId))} />
  </>;
}

export default function GameWorld() {
  const shadows = useSettingsStore(s => s.shadows), quality = useSettingsStore(s => s.quality);
  const renderScale = useSettingsStore(s => s.renderScale), fpsCap = useSettingsStore(s => s.fpsCap);
  // pixel density: the quality ceiling × the player's render scale (never below 0.5 of a CSS pixel)
  const top = (quality === 'high' ? 2 : quality === 'low' ? 1 : 1.65) * renderScale;
  return <Canvas shadows={shadows} dpr={[Math.max(0.5, Math.min(1, top)), Math.max(0.5, top)]} frameloop={fpsCap ? 'demand' : 'always'} gl={{ antialias: renderScale >= 0.8, alpha: false, powerPreference: renderScale < 0.8 ? 'low-power' : 'high-performance' }}
    fallback={<div className="flex items-center justify-center h-full text-slate-300">WebGL is unavailable on this device.</div>}>
    <FrameCap fps={fpsCap} /><WorldContent />
  </Canvas>;
}
