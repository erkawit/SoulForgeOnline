'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { ComponentRef } from 'react';
import { Canvas, ThreeEvent, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera, Html, Sparkles } from '@react-three/drei';
import { Vector3, Group, MathUtils } from 'three';
import { useGameStore } from '@/store/useGameStore';
import { useMultiplayerStore } from '@/store/useMultiplayerStore';
import { gameConnection } from '@/lib/multiplayer/socket';
import { RARITY_COLOR } from '@/lib/types';
import type { Loot, Monster } from '@/lib/types';

import { Armor } from './Citadel';
import ClassActor from './ClassActor';
import StarterCity from './StarterCity';
import MonsterBody from './MonsterBody';
import { CLASSES,CITIES } from '@/game/content';

const UP = new Vector3(0, 1, 0);
const tempForward = new Vector3();
const tempRight = new Vector3();
const tempMove = new Vector3();

function InputAndChase() {
  const { camera } = useThree();
  const pressed = useRef<Set<string>>(new Set());
  const previous = useRef(0);
  const lastAttack = useRef(0);
  useEffect(() => {
    const keyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.closest('input,textarea,select') || e.target.isContentEditable)) return;
      if(useGameStore.getState().journal)return;
      if(e.key===' '&&e.target instanceof HTMLElement&&e.target.closest('button'))return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();
      if (key === ' ' && !e.repeat && Date.now() - lastAttack.current > 700) {
        if (useMultiplayerStore.getState().connected) gameConnection.attack('abyssal-forge-titan','soul_burst'); else useGameStore.getState().castNearest();
        lastAttack.current = Date.now();
      }
      if(!e.repeat&&(key==='q'||key==='e')&&!useMultiplayerStore.getState().online)useGameStore.getState().cast(key==='q'?'buff':'special');
      pressed.current.add(key);
    };
    const keyUp = (e: KeyboardEvent) => pressed.current.delete(e.key.toLowerCase());
    const blur = () => pressed.current.clear();
    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      window.removeEventListener('blur', blur);
    };
  }, []);
  useFrame((_, delta) => {
    previous.current += delta;
    if (previous.current < 0.04) return;
    const step = Math.min(previous.current, 0.08);
    previous.current = 0;
    const p = pressed.current;
    const forwards = Number(p.has('w') || p.has('arrowup')) - Number(p.has('s') || p.has('arrowdown'));
    const strafe = Number(p.has('d') || p.has('arrowright')) - Number(p.has('a') || p.has('arrowleft'));
    const state = useGameStore.getState();
    if(state.journal||state.deadUntil){pressed.current.clear();if(useMultiplayerStore.getState().connected)gameConnection.move(0,0);return;}
    if (forwards || strafe) {
      camera.getWorldDirection(tempForward).setY(0).normalize();
      tempRight.crossVectors(tempForward, UP).normalize();
      tempMove.copy(tempForward).multiplyScalar(forwards).addScaledVector(tempRight, strafe).normalize();
      state.selectMonster(null);
      if (useMultiplayerStore.getState().connected) gameConnection.move(tempMove.x, tempMove.z); else state.move(tempMove.x, tempMove.z, step);
    } else if (useMultiplayerStore.getState().connected) { gameConnection.move(0, 0); } else if (state.selectedMonster) {
      const mob = state.monsters.find(m => m.id === state.selectedMonster && m.hp > 0);
      if (!mob) { state.selectMonster(null); return; }
      const [px, pz] = state.player.position;
      const dist = Math.hypot(mob.x - px, mob.z - pz);
      if (dist > CLASSES[state.player.classId??'Warrior'].range-.3) state.move((mob.x - px) / dist, (mob.z - pz) / dist, step);
      else if (Date.now() - lastAttack.current > 700) {
        state.attack(mob.id);
        lastAttack.current = Date.now();
      }
    }
  });
  return null;
}

function FollowCamera() {
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
      <OrthographicCamera makeDefault position={[15, 19, 15]} zoom={33} near={0.1} far={250} />
      <OrbitControls ref={controls} enablePan={false} enableDamping dampingFactor={0.09}
        minZoom={23} maxZoom={72} minPolarAngle={0.32} maxPolarAngle={1.42}
        mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }} />
    </>
  );
}

function Creature({ mob }: { mob: Monster }) {
  const selected = useGameStore(s => s.selectedMonster === mob.id);
  const root = useRef<Group>(null);
  useFrame((state) => {
    if (root.current) root.current.children[0].position.y = Math.sin(state.clock.elapsedTime * 1.9 + mob.x) * 0.17;
  });
  if (mob.hp <= 0) return null;
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    useGameStore.getState().selectMonster(mob.id);
  };
  return <group ref={root} position={[mob.x, 0.17, mob.z]} onClick={handleClick}>
    <MonsterBody mob={mob}/>
    {mob.telegraph&&<group position={[mob.telegraph.target[0]-mob.x,.1,mob.telegraph.target[1]-mob.z]}>
      <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[mob.telegraph.radius-.09,mob.telegraph.radius,48]}/><meshBasicMaterial color={mob.telegraph.kind==='bolt'?'#b98cff':'#ff8a51'} transparent opacity={.9} side={2}/></mesh>
      <Html center position={[0,.3,0]} style={{pointerEvents:'none'}}><span className="actor-label">{mob.telegraph.kind.toUpperCase()} · DODGE</span></Html>
    </group>}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
      <ringGeometry args={[0.82, 0.92, 40]} />
      <meshBasicMaterial color={selected ? '#ff8b77' : '#9c59d8'} side={2} transparent opacity={selected ? 1 : 0.42} />
    </mesh>
    <Html zIndexRange={[30, 0]} position={[0, 3.06, 0]} center style={{ pointerEvents: 'none' }}><span className="actor-label monster-label">{mob.elite?'ELITE · ':''}{mob.name} · Lv. {mob.level}</span></Html>
    <mesh position={[0, 2.69, 0]}>
      <planeGeometry args={[1.65, 0.13]} />
      <meshBasicMaterial color="#351d27" depthTest={false} />
    </mesh>
    <mesh position={[-0.825 * (1 - mob.hp / mob.maxHp), 2.695, 0.008]}>
      <planeGeometry args={[1.65 * mob.hp / mob.maxHp, 0.085]} />
      <meshBasicMaterial color="#f07e89" depthTest={false} />
    </mesh>
  </group>;
}

function LootObject({ loot }: { loot: Loot }) {
  const group = useRef<Group>(null);
  const c = RARITY_COLOR[loot.item.rarity];
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y += 0.013;
      group.current.position.y = 0.6 + Math.sin(state.clock.elapsedTime * 2.5 + loot.x) * 0.16;
    }
  });
  const pickup = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    useGameStore.getState().pickup(loot.id);
  };
  return <group position={[loot.x, 0.6, loot.z]} ref={group} onClick={pickup}>
    <mesh>
      <octahedronGeometry args={[0.28]} />
      <meshStandardMaterial color={c} emissive={c} emissiveIntensity={1.2} metalness={0.5} />
    </mesh>
    <mesh position={[0, 2, 0]}>
      <cylinderGeometry args={[0.045, 0.22, 4.5, 8, 1, true]} />
      <meshBasicMaterial color={c} transparent opacity={0.2} depthWrite={false} side={2} />
    </mesh>
    <pointLight color={c} intensity={1.2} distance={3} />
    <Html zIndexRange={[30, 0]} position={[0, 1.6, 0]} center style={{ pointerEvents: 'none' }}><span className="actor-label loot-label" style={{ color: c }}>{loot.item.name}</span></Html>
  </group>;
}

function AttackEffect() {
  const fx = useGameStore(s => s.attackFx);
  const player = useGameStore(s => s.player);
  const ring = useRef<Group>(null);
  useFrame(() => {
    if (ring.current && fx) {
      const age = (Date.now() - fx.stamp) / 1000;
      ring.current.visible = age < 0.6;
      const scale = 0.7 + age * (fx.skill ? 9 : 5);
      ring.current.scale.setScalar(scale);
    }
  });
  if (!fx) return null;
  return <group key={fx.stamp} ref={ring} position={[player.position[0], 0.13, player.position[1]]} rotation={[-Math.PI / 2, 0, 0]}>
    <mesh><torusGeometry args={[0.4, fx.skill ? 0.095 : 0.055, 8, 48]} />
      <meshBasicMaterial color={fx.skill ? '#a47cff' : '#41ffdf'} transparent opacity={0.68} depthWrite={false} />
    </mesh>
  </group>;
}

function MultiplayerActors() {
 const {players,playerId,boss,loot,connected} = useMultiplayerStore();
 if(!connected)return null;
 return <group>
 {players.filter(p=>p.id!==playerId).map(p=><group key={p.id} position={[p.x,0,p.z]}>
   <mesh position={[0,1,0]} castShadow><capsuleGeometry args={[.35,1,6,10]}/><meshStandardMaterial color="#49d1ff" emissive="#075c7e"/></mesh>
   <Html zIndexRange={[30, 0]} position={[0,2.3,0]} center><span style={{color:'#9fe9ff',fontSize:12}}>Player {p.id.slice(0,6)}</span></Html>
 </group>)}
 {boss&&<group position={[boss.x,0,boss.z]} onClick={e=>{e.stopPropagation();gameConnection.attack()}}>
   <group scale={2.3}><Armor color="#593b40" glow="#ff7545" /></group><mesh position={[0,2.1,0]} castShadow><dodecahedronGeometry args={[2,1]}/><meshStandardMaterial color="#7a314b" emissive="#9c1f61" emissiveIntensity={.8}/></mesh>
   <Html zIndexRange={[30, 0]} position={[0,4.8,0]} center><div style={{color:'#ffd0dc',whiteSpace:'nowrap',fontWeight:900}}>ABYSSAL FORGE TITAN {Math.ceil(boss.hp/boss.maxHp*100)}%</div></Html>
 </group>}
 {loot.map(l=><group key={l.id} position={[l.x,.6,l.z]} onClick={e=>{e.stopPropagation();gameConnection.pickup(l.id)}}>
   <mesh position={[0,2,0]}><cylinderGeometry args={[.035,.2,4,8,1,true]}/><meshBasicMaterial color={l.rarity==='Legendary'?'#ffd36e':'#b477ff'} transparent opacity={.3} depthWrite={false} side={2}/></mesh><mesh><octahedronGeometry args={[.45]}/><meshStandardMaterial color={l.rarity==='Legendary'?'#ffd36e':l.rarity==='Epic'?'#b477ff':'#4db7ff'} emissive="#a15ee3" emissiveIntensity={1}/></mesh>
   <Html zIndexRange={[30, 0]} position={[0,1.1,0]} center><span style={{whiteSpace:'nowrap',color:'#fff3ad',fontSize:11}}>{l.itemDefinitionId}</span></Html>
 </group>)}
 </group>;
}

function WorldContent() {
  const connected = useMultiplayerStore(s => s.connected);
  const cityId = useGameStore(s => s.player.cityId??'hollow');
  const city=CITIES[connected?'hollow':cityId];
  const monsters = useGameStore(s => s.monsters);
  const drops = useGameStore(s => s.drops);
  return <>
    <color attach="background" args={[city.sky]} />
    <fog attach="fog" args={[city.sky, 35, 90]} />
    <ambientLight intensity={1.8} color="#c0c8d1" />
    <hemisphereLight args={['#a9c2ed', '#403c38', 1.7]} />
    <directionalLight castShadow position={[9, 17, 6]} intensity={2.2} color="#cfe2ff"
      shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-28}
      shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} />
    <pointLight position={[-7, 8, -2]} intensity={35} distance={35} color="#632f9c" />
    <StarterCity />
    <ClassActor />
    {!connected && monsters.map(m => <Creature key={m.id} mob={m} />)}
    {!connected && drops.map(d => <LootObject key={d.id} loot={d} />)}
    <AttackEffect />
    <MultiplayerActors />
    <InputAndChase />
    <FollowCamera />
  </>;
}

export default function GameWorld() {
  return <Canvas shadows dpr={[1, 1.65]} gl={{ antialias: true, alpha: false }}
    fallback={<div className="flex items-center justify-center h-full text-slate-300">WebGL is unavailable on this device.</div>}>
    <WorldContent />
  </Canvas>;
}
