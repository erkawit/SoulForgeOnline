'use client';
// Town NPCs: painted compact-cast-v2 sprites (2.5D) idling around the plaza; click to walk over and talk.
import { useAttached } from './useAttached';
import Label3D from './Label3D';
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { SpriteActor, spriteView } from '@/game/sprites/spriteActor';
import { npcSpriteId } from '@/game/sprites/catalog';
import type { ThreeEvent } from '@react-three/fiber';
import { TALK_RANGE, npcPosition, npcsIn, type Npc } from '@/game/npcs';
import { CITIES, type CityId, type MainCityId } from '@/game/content';
import { buildingOf, type Role } from '@/game/world/capitalPlan';
import { useGameStore } from '@/store/useGameStore';
import { approach } from '@/game/npcApproach';

class Quiet extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> { state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; } render() { return this.state.failed ? this.props.fallback : this.props.children; } }

function Model({ npc, talking, at, yaw }: { npc: Npc; talking: boolean; at: [number, number]; yaw: number }) {
  const id = npcSpriteId(npc.name) ?? 'npc-elder-corvin';
  // round 17: painted 8-way sheets — a slow breathing idle, and the talk gestures while the dialog is open
  const actor = useMemo(() => new SpriteActor(id, { pace: 0.72 }), [id]);
  useEffect(() => () => actor.dispose(), [actor]);
  const holder = useAttached(actor.root);
  useEffect(() => { if (talking) actor.play('Talk', { loop: true }); else actor.endShot(); }, [actor, talking]);
  const turn = useRef(0);
  useFrame(({ camera }, dt) => {
    spriteView.camera = camera;
    // look at the player when they come close (and always while talking); otherwise face out of the door again
    const [px, pz] = useGameStore.getState().player.position, dx = px - at[0], dz = pz - at[1], near = Math.hypot(dx, dz) < (talking ? 99 : 6.5);
    const want = near ? Math.atan2(dx, dz) - yaw : 0, cur = turn.current, diff = Math.atan2(Math.sin(want - cur), Math.cos(want - cur));
    turn.current = cur + diff * (1 - Math.exp(-6 * Math.min(dt, .05))); actor.root.rotation.y = turn.current;
    actor.update(dt);
  });
  const wave = () => { if (!talking && !actor.busy) actor.play('Talk'); };
  return <group ref={holder} onPointerOver={wave} />;
}

function Placeholder({ npc }: { npc: Npc }) {
  return <group><mesh position={[0, .7, 0]} castShadow><capsuleGeometry args={[.3, .6, 4, 10]} /><meshStandardMaterial color={npc.color} /></mesh><mesh position={[0, 1.45, 0]} castShadow><sphereGeometry args={[.36, 16, 12]} /><meshStandardMaterial color="#e9cdb8" /></mesh></group>;
}

function NpcActor({ npc, city }: { npc: Npc; city: CityId }) {
  const talking = useGameStore(s => s.npc === npc.id);
  const [x, z] = npcPosition(npc, city);
  // face out of the door the way the building does (toward the camera side, capitalPlan facing)
  const yaw = CITIES[city]?.parent ? 0 : buildingOf(city as MainCityId, (npc.id === 'ranger' ? 'warden' : npc.id) as Role).facing;
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); approach.current = npc; };
  return <group position={[x, 0, z]} rotation={[0, yaw, 0]} onClick={click}>
    <Quiet fallback={<Placeholder npc={npc} />}><Suspense fallback={<Placeholder npc={npc} />}><Model npc={npc} talking={talking} at={[x, z]} yaw={yaw} /></Suspense></Quiet>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, .03, 0]}><ringGeometry args={[.55, .62, 36]} /><meshBasicMaterial color={npc.color} transparent opacity={talking ? .95 : .45} /></mesh>
    <Label3D position={[0, npc.id === 'warden' ? 2.6 : 2.0, 0]} color={npc.color} text={`${npc.icon} ${npc.th}`} sub={npc.title}/>
  </group>;
}


function Walker() {
  useFrame((_, dt) => {
    const n = approach.current; if (!n) return;
    const s = useGameStore.getState(), [px, pz] = s.player.position, [nx, nz] = npcPosition(n, s.player.cityId), d = Math.hypot(nx - px, nz - pz);
    if (d <= TALK_RANGE) { approach.current = null; s.selectMonster(null); s.openNpc(n.id); return; }
    if (s.deadUntil || s.journal) { approach.current = null; return; }
    s.move((nx - px) / d, (nz - pz) / d, Math.min(dt, .08));
    if (Math.hypot(useGameStore.getState().player.position[0] - px, useGameStore.getState().player.position[1] - pz) < 1e-4) approach.current = null; // blocked
  });
  useEffect(() => { const stop = (e: KeyboardEvent) => { if (/^(w|a|s|d|arrow)/i.test(e.key)) approach.current = null; }; window.addEventListener('keydown', stop); return () => window.removeEventListener('keydown', stop); }, []);
  return null;
}

export default function NpcLayer() {
  const here = useGameStore(s => s.player.cityId ?? 'hollow');
  const list = npcsIn(here); if (!list.length) return null;
  return <group key={here}>{list.map(n => <NpcActor key={n.id} npc={n} city={here} />)}<Walker /></group>;
}
