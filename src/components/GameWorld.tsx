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
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) e.preventDefault();
      if (key === ' ' && !e.repeat && Date.now() - lastAttack.current > 700) {
        if (useMultiplayerStore.getState().connected) gameConnection.attack('abyssal-forge-titan','soul_burst'); else useGameStore.getState().castNearest();
        lastAttack.current = Date.now();
      }
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
      if (dist > 2.65) state.move((mob.x - px) / dist, (mob.z - pz) / dist, step);
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
  useFrame(() => {
    const [x, z] = useGameStore.getState().player.position;
    const control = controls.current;
    if (control) {
      control.target.lerp(new Vector3(x, 0.5, z), 0.095);
      control.update();
    }
  });
  return (
    <>
      <OrthographicCamera makeDefault position={[15, 19, 15]} zoom={39} near={0.1} far={250} />
      <OrbitControls ref={controls} enablePan={false} enableDamping dampingFactor={0.09}
        minZoom={23} maxZoom={72} minPolarAngle={0.32} maxPolarAngle={1.42}
        mouseButtons={{ LEFT: 0, MIDDLE: 1, RIGHT: 2 }} />
    </>
  );
}

function RuneFloor() {
  const runePositions = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 2;
    return [Math.cos(angle) * 11.5, Math.sin(angle) * 11.5] as const;
  }), []);
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#0e171b" roughness={0.95} metalness={0.15} />
      </mesh>
      <gridHelper args={[68, 68, '#25383e', '#1b292e']} position={[0, 0.018, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.027, 0]}>
        <ringGeometry args={[10.9, 11.03, 80]} />
        <meshBasicMaterial color="#50646e" transparent opacity={0.47} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026, 0]}>
        <ringGeometry args={[2.6, 2.68, 64]} />
        <meshBasicMaterial color="#31d7bb" transparent opacity={0.27} />
      </mesh>
      {runePositions.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.035, z]} rotation={[-Math.PI / 2, 0, i * Math.PI / 15]}>
          <planeGeometry args={[0.34, 0.12]} />
          <meshBasicMaterial color={i % 3 === 0 ? '#9b70de' : '#3f7d83'} transparent opacity={0.7} />
        </mesh>
      ))}
      <Sanctuary />
      <AncientPillars />
      <Sparkles count={70} scale={[40, 9, 40]} size={1.2} speed={0.2} color="#7bb8da" opacity={0.4} />
    </>
  );
}

function Sanctuary() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[2.05, 2.2, 0.23, 10]} />
        <meshStandardMaterial color="#2c343f" metalness={0.6} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.035, 6, 64]} />
        <meshBasicMaterial color="#39d7c5" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[0.85, 0.9, 0.44, 8]} />
        <meshStandardMaterial color="#314450" metalness={0.65} />
      </mesh>
    </group>
  );
}

function AncientPillars() {
  const positions: [number, number, number][] = [[-14, -13, 2.3], [14, -12, 2.8], [-14, 13, 3.6], [14, 13, 2.1], [-2, -17, 1.8], [4, 17, 2.9]];
  return <>
    {positions.map(([x, z, h], i) => <group key={i} position={[x, 0, z]}>
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.15, 0.48, 6]} />
        <meshStandardMaterial color="#34424a" roughness={0.8} />
      </mesh>
      <mesh position={[0, h / 2 + 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.67, h, 6]} />
        <meshStandardMaterial color="#34404b" roughness={0.8} metalness={0.22} />
      </mesh>
      <mesh position={[0, h + 0.55, 0]}>
        <octahedronGeometry args={[0.43]} />
        <meshStandardMaterial color={i % 2 ? '#855dc0' : '#3e9b9f'} emissive={i % 2 ? '#502277' : '#167c83'} emissiveIntensity={0.75} />
      </mesh>
      <pointLight position={[0, h + 0.55, 0]} distance={5} intensity={1.7} color={i % 2 ? '#9e62ff' : '#43e2d3'} />
    </group>)}
  </>;
}

function Hero() {
  const player = useGameStore(s => s.player);
  const weaponSoul = useGameStore(s => s.equipment.weapon?.soul);
  const group = useRef<Group>(null);
  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    g.position.x = MathUtils.damp(g.position.x, player.position[0], 16, dt);
    g.position.z = MathUtils.damp(g.position.z, player.position[1], 16, dt);
    g.children[0].rotation.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
  });
  const auraColor = weaponSoul === 'Frost' ? '#4bbdff' : weaponSoul === 'Void' ? '#a665ff' : weaponSoul === 'Ember' ? '#ff8d4f' : '#54e6ce';
  return <group ref={group} position={[player.position[0], 0.4, player.position[1]]}>
    <group>
      <mesh castShadow position={[0, 1.28, 0]}>
        <capsuleGeometry args={[0.39, 0.84, 6, 10]} />
        <meshStandardMaterial color="#d2d9de" metalness={0.83} roughness={0.24} />
      </mesh>
      <mesh castShadow position={[0, 2.13, 0]}>
        <sphereGeometry args={[0.31, 16, 12]} />
        <meshStandardMaterial color="#e0c7b4" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.3, -0.13]}>
        <sphereGeometry args={[0.32, 16, 12]} />
        <meshStandardMaterial color="#eef2f7" metalness={0.38} />
      </mesh>
      <mesh position={[0, 1.15, -0.4]} rotation={[0.12, 0, 0]}>
        <coneGeometry args={[0.75, 1.75, 5]} />
        <meshStandardMaterial color="#283549" side={2} metalness={0.18} />
      </mesh>
      <mesh position={[-0.2, 0.52, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.65, 4, 6]} />
        <meshStandardMaterial color="#565f76" metalness={0.72} />
      </mesh>
      <mesh position={[0.2, 0.52, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.65, 4, 6]} />
        <meshStandardMaterial color="#565f76" metalness={0.72} />
      </mesh>
      <mesh position={[0.63, 1.12, 0.17]} rotation={[0, 0, -0.33]} castShadow>
        <boxGeometry args={[0.15, 1.95, 0.14]} />
        <meshStandardMaterial color={auraColor} emissive={auraColor} emissiveIntensity={0.7} metalness={0.8} />
      </mesh>
      <mesh position={[0.57, 0.44, 0.17]}>
        <boxGeometry args={[0.47, 0.12, 0.18]} />
        <meshStandardMaterial color="#d1b36c" metalness={0.9} />
      </mesh>
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.23, 0]}>
      <torusGeometry args={[0.82, 0.058, 7, 64]} />
      <meshBasicMaterial color={auraColor} transparent opacity={0.95} />
    </mesh>
    <pointLight position={[0, 1.4, 0]} color={auraColor} intensity={2.4} distance={4} />
    <Html position={[0, 2.77, 0]} center distanceFactor={18} style={{ pointerEvents: 'none' }}><span className="actor-label">THE WANDERER</span></Html>
  </group>;
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
    <group>
      <mesh position={[0, 1.35, 0]} castShadow>
        <dodecahedronGeometry args={[0.64, 0]} />
        <meshStandardMaterial color="#303045" emissive="#521a81" emissiveIntensity={0.8} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 2.03, 0]} castShadow>
        <icosahedronGeometry args={[0.43, 0]} />
        <meshStandardMaterial color="#53385f" emissive="#681b9a" emissiveIntensity={0.4} />
      </mesh>
      {[-0.16, 0.16].map(x => <mesh key={x} position={[x, 2.09, 0.39]}>
        <sphereGeometry args={[0.065, 8, 6]} />
        <meshBasicMaterial color="#ff7979" />
      </mesh>)}
      <mesh position={[-0.58, 1.28, 0]} rotation={[0, 0, -0.7]}>
        <coneGeometry args={[0.14, 0.9, 6]} />
        <meshStandardMaterial color="#5f4472" />
      </mesh>
      <mesh position={[0.58, 1.28, 0]} rotation={[0, 0, 0.7]}>
        <coneGeometry args={[0.14, 0.9, 6]} />
        <meshStandardMaterial color="#5f4472" />
      </mesh>
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
      <ringGeometry args={[0.82, 0.92, 40]} />
      <meshBasicMaterial color={selected ? '#ff8b77' : '#9c59d8'} side={2} transparent opacity={selected ? 1 : 0.42} />
    </mesh>
    <Html position={[0, 3.06, 0]} center distanceFactor={18} style={{ pointerEvents: 'none' }}><span className="actor-label monster-label">{mob.name}</span></Html>
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
    <mesh position={[0, 0.95, 0]}>
      <cylinderGeometry args={[0.06, 0.3, 1.7, 8, 1, true]} />
      <meshBasicMaterial color={c} transparent opacity={0.2} depthWrite={false} side={2} />
    </mesh>
    <pointLight color={c} intensity={1.2} distance={3} />
    <Html position={[0, 1.6, 0]} center distanceFactor={18} style={{ pointerEvents: 'none' }}><span className="actor-label loot-label" style={{ color: c }}>{loot.item.name}</span></Html>
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
   <Html position={[0,2.3,0]} center><span style={{color:'#9fe9ff',fontSize:12}}>Player {p.id.slice(0,6)}</span></Html>
 </group>)}
 {boss&&<group position={[boss.x,0,boss.z]} onClick={e=>{e.stopPropagation();gameConnection.attack()}}>
   <mesh position={[0,2.1,0]} castShadow><dodecahedronGeometry args={[2,1]}/><meshStandardMaterial color="#7a314b" emissive="#9c1f61" emissiveIntensity={.8}/></mesh>
   <Html position={[0,4.8,0]} center><div style={{color:'#ffd0dc',whiteSpace:'nowrap',fontWeight:900}}>ABYSSAL FORGE TITAN {Math.ceil(boss.hp/boss.maxHp*100)}%</div></Html>
 </group>}
 {loot.map(l=><group key={l.id} position={[l.x,.6,l.z]} onClick={e=>{e.stopPropagation();gameConnection.pickup(l.id)}}>
   <mesh><octahedronGeometry args={[.45]}/><meshStandardMaterial color={l.rarity==='Legendary'?'#ffd36e':l.rarity==='Epic'?'#b477ff':'#4db7ff'} emissive="#a15ee3" emissiveIntensity={1}/></mesh>
   <Html position={[0,1.1,0]} center><span style={{whiteSpace:'nowrap',color:'#fff3ad',fontSize:11}}>{l.itemDefinitionId}</span></Html>
 </group>)}
 </group>;
}

function WorldContent() {
  const connected = useMultiplayerStore(s => s.connected);
  const monsters = useGameStore(s => s.monsters);
  const drops = useGameStore(s => s.drops);
  return <>
    <color attach="background" args={['#080e17']} />
    <fog attach="fog" args={['#080e17', 23, 76]} />
    <ambientLight intensity={0.75} color="#869bca" />
    <hemisphereLight args={['#a9c2ed', '#151923', 1.2]} />
    <directionalLight castShadow position={[9, 17, 6]} intensity={2.2} color="#cfe2ff"
      shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-28}
      shadow-camera-right={28} shadow-camera-top={28} shadow-camera-bottom={-28} />
    <pointLight position={[-7, 8, -2]} intensity={35} distance={35} color="#632f9c" />
    <RuneFloor />
    <Hero />
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
