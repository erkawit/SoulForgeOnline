'use client';
import Label3D from './Label3D';
import {Component,Suspense,useRef,useState,type ReactNode} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,MathUtils} from 'three';
import {useGameStore} from '@/store/useGameStore';
import {CLASSES,TIER_COLORS} from '@/game/content';
import {characterClip,type CharacterClip} from '@/game/characterModels';
import AnimatedCharacter from './AnimatedCharacter';
import Hero3D from './Hero3D';
import {HERO_3D} from '@/game/hero3d';
import {CLASS_ANIMS} from '@/game/sprites/classAnims';
import LegacyClassActor from './LegacyClassActor';
import {costumeSprite} from '@/game/items';
import {useMemo} from 'react';
import {FASHION_BY_ID,outfitSprite,overlays} from '@/game/fashion';
class ModelBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<LegacyClassActor/>:this.props.children;}}
function BaseClassActor(){
 const job=useGameStore(s=>s.player.classId??'Berserker'),promotion=useGameStore(s=>s.player.promotionId),weapon=useGameStore(s=>s.equipment.weapon),equipCostume=useGameStore(s=>costumeSprite(s.equipment.costume)),wardrobe=useGameStore(s=>s.wardrobe),gender=useGameStore(s=>s.player.gender==='f'?'f':'m' as const),hair=useGameStore(s=>s.player.hair),hairColor=useGameStore(s=>s.player.hairColor),action=useGameStore(s=>s.action);
 // round 13: the wardrobe drives the look — outfit sprite, overlays (wings / head / aura) and the weapon skin
 const costume=outfitSprite(wardrobe)??equipCostume??(CLASS_ANIMS[`${gender}-${job}`]?null:'thai'),/* round 20: a class with its own painted sheet wears it *//* the Thai white-gold attire is the only finished outfit so far: worn until others exist */fashion=useMemo(()=>overlays(wardrobe),[wardrobe]),weaponSkin=wardrobe?.worn.weapon?FASHION_BY_ID()[wardrobe.worn.weapon]?.weaponSheet??null:null;
 const root=useRef<Group>(null),last=useRef<[number,number]|null>(null),facing=useRef(0),current=useRef<CharacterClip>('Idle'),speed=useRef(0),movedAt=useRef(-1e9);
 const [clip,setClip]=useState<CharacterClip>('Idle');const glow=weapon?.tier?TIER_COLORS[Math.min(7,weapon.tier)]:CLASSES[job].glow;
 useFrame((_,delta)=>{if(!root.current)return;const s=useGameStore.getState(),p=s.player.position;const distance=last.current?Math.hypot(p[0]-last.current[0],p[1]-last.current[1]):0;
  const step=distance<2&&delta>0?distance/Math.min(delta,.1):0;speed.current+=(step-speed.current)*(1-Math.exp(-10*Math.min(delta,.05))); // smoothed m/s
  if(last.current&&distance>.001&&distance<2)facing.current=Math.atan2(p[0]-last.current[0],p[1]-last.current[1]);last.current=[...p];root.current.position.set(p[0],0,p[1]);
  const target=s.monsters.find(m=>m.id===s.selectedMonster&&m.hp>0);if(target)facing.current=Math.atan2(target.x-p[0],target.z-p[1]);
  root.current.rotation.y+=(MathUtils.euclideanModulo(facing.current-root.current.rotation.y+Math.PI,Math.PI*2)-Math.PI)*(1-Math.exp(-14*Math.min(delta,.05))); // Facing belongs to game, never root-motion clips.
  const active=Date.now()-s.action.stamp<s.action.duration;if(distance>.001&&distance<2)movedAt.current=performance.now();const moving=performance.now()-movedAt.current<120,base=characterClip(s.action.kind,active,!!s.deadUntil,moving,speed.current,current.current==='Run');
  // combo swings, cast/draw channels and shield guard come from the store's action.clip
  const next=!s.deadUntil&&active&&s.action.clip&&!(moving&&!s.charge&&!s.pending&&!s.channel)?s.action.clip:base; // a spin (Whirlwind) keeps spinning while you walk
  if(current.current!==next){current.current=next;setClip(next);}
 });
 return <group ref={root}>{HERO_3D?<Suspense fallback={null}><Hero3D gender={gender} outfit={costume==='thai'?'thai':null} hair={hair} hairColor={hairColor} hideHair={fashion.some(f=>f.hidesHair)} clip={clip} replay={action.stamp} duration={clip==='Death'?undefined:action.duration/1000} speedRef={speed} weaponTier={weapon?.tier??0} weaponSkin={weaponSkin}/></Suspense>:<AnimatedCharacter job={job} costume={costume} promotion={promotion} weapon={weapon} fashion={fashion} weaponSkin={weaponSkin} hair={hair} hairColor={hairColor} clip={clip} replay={action.stamp} duration={clip==='Death'?undefined:action.duration/1000} glow={glow} speedRef={speed}/>}<mesh rotation={[-Math.PI/2,0,0]} position={[0,.025,0]}><ringGeometry args={[.55,.575,40]}/><meshBasicMaterial color={glow}/></mesh><Label3D position={[0,2.05,0]} text={job.toUpperCase()}/></group>;
}
export default function ClassActor(){const job=useGameStore(s=>s.player.classId??'Berserker');// round 12: promoted characters show their painted advancement look (sprite) instead of the old procedural model
 return <ModelBoundary key={job}><Suspense fallback={<LegacyClassActor/>}><BaseClassActor/></Suspense></ModelBoundary>;}
