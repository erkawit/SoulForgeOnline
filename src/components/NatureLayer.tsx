'use client';
// Living foliage for the current zone: wind-swayed trees, grass that bends away from everyone walking through it,
// bushes, rocks and drifting leaves (src/game/world/nature.ts). Colliders for the same props are registered in
// src/game/world/registry.ts, so what you see is exactly what blocks you.
import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import type {CityId} from '@/game/content';
import {natureLayout} from '@/game/world/layout';
import {createNature,type Actor,type Nature} from '@/game/world/nature';
import {useGameStore} from '@/store/useGameStore';
import {useMultiplayerStore} from '@/store/useMultiplayerStore';
import {useSettingsStore} from '@/store/useSettingsStore';

export default function NatureLayer({city}:{city:CityId}){
 const {scene,camera}=useThree();const nature=useRef<Nature|null>(null);const focus=useRef(new Vector3());
 const quality=useSettingsStore(s=>s.quality),wind=useSettingsStore(s=>s.wind),windDir=useSettingsStore(s=>s.windDir);
 useEffect(()=>{const n=createNature(natureLayout(city),quality);scene.add(n.group);nature.current=n;return()=>{n.dispose();nature.current=null;};},[scene,city,quality]);
 useEffect(()=>{const a=windDir*Math.PI/180;nature.current?.setWind(Math.cos(a),Math.sin(a),wind);},[wind,windDir,city,quality]);
 useFrame(state=>{
  const n=nature.current;if(!n)return;const s=useGameStore.getState(),[px,pz]=s.player.position;
  const actors:Actor[]=[{x:px,z:pz,r:.75}];
  for(const m of s.monsters)if(m.hp>0&&Math.hypot(m.x-px,m.z-pz)<18)actors.push({x:m.x,z:m.z,r:.6});
  for(const o of useMultiplayerStore.getState().players)if(Math.hypot(o.x-px,o.z-pz)<18)actors.push({x:o.x,z:o.z,r:.75});
  actors.sort((a,b)=>Math.hypot(a.x-px,a.z-pz)-Math.hypot(b.x-px,b.z-pz));
  n.update(state.clock.elapsedTime,actors.slice(0,16));n.setView(camera.position,focus.current.set(px,1,pz));
 });
 return null;
}
