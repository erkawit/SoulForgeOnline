'use client';
import {useMemo} from 'react';
import {useGLTF} from '@react-three/drei';
import {Mesh} from 'three';
import type {CityId} from '@/game/content';
import {hideGlb} from '@/game/world/citySprites';

export default function CapitalEnvironment({id}:{id:CityId}){
 const {scene}=useGLTF(`/models/cities/${id}.glb`);
 const model=useMemo(()=>{
  const clone=scene.clone(true);
  clone.traverse(o=>{if(o instanceof Mesh){o.castShadow=!o.name.startsWith('Terrain');o.receiveShadow=true;}
   // block-out buildings give way to the painted city sprites (CitySpritesLayer)
   if(hideGlb(id,o.name))o.visible=false;});
  return clone;
 },[scene,id]);
 return <primitive object={model} dispose={null}/>;
}
