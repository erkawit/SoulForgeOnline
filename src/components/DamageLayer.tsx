'use client';
// Floating combat numbers in the game's gothic style (src/game/fx/damageText.ts). Reads the store's combat events and
// shows each one when its effect visibly connects (event.delay), above the monster or the player it belongs to.
import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {createDamageText,type DamageText} from '@/game/fx/damageText';
import {FX_COLORS} from '@/game/fx/skillFx';
import {useGameStore,type CombatEvent} from '@/store/useGameStore';
import {useSettingsStore} from '@/store/useSettingsStore';

export default function DamageLayer(){
 const {scene}=useThree();const dt=useRef<DamageText|null>(null);const seen=useRef(0);const queue=useRef<{at:number;ev:CombatEvent}[]>([]);const v=useRef(new Vector3());
 const enabled=useSettingsStore(s=>s.damageNumbers);
 useEffect(()=>{const d=createDamageText(scene,72);dt.current=d;seen.current=Math.max(0,...useGameStore.getState().combat.map(e=>e.seq));return()=>{d.dispose();dt.current=null;};},[scene]);
 useEffect(()=>{if(dt.current)dt.current.enabled=enabled;},[enabled]);
 useFrame((_,delta)=>{
  const d=dt.current;if(!d)return;const s=useGameStore.getState(),now=performance.now();
  for(const ev of s.combat)if(ev.seq>seen.current){seen.current=ev.seq;queue.current.push({at:now+(ev.delay??0),ev});}
  if(queue.current.length){const due=queue.current.filter(q=>q.at<=now);queue.current=queue.current.filter(q=>q.at>now);
   const accent=FX_COLORS[s.player.classId??'Berserker'][0];
   for(const {ev} of due){let x=ev.x,z=ev.z,h=1.9;
    if(ev.on==='monster'){const m=s.monsters.find(mm=>mm.id===ev.id);if(m){x=m.x;z=m.z;}h=m?.boss?3.4:1.6;}else{[x,z]=s.player.position;}
    d.spawn(v.current.set(x,h,z),ev.value,ev.kind,accent);}}
  d.update(Math.min(delta,.1));
 });
 return null;
}
