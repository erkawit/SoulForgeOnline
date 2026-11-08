'use client';
import {useMemo,useEffect} from 'react';
import {BufferGeometry,Float32BufferAttribute,Color} from 'three';
import {navigationSurface,navigationPlan,NAVIGATION_CELL} from '@/game/world/terrainNavigation';
import type {City} from '@/game/content';

/** One merged mesh, not thousands of React objects. Exact same cell edges as collision. */
export default function NavigationGround({city}:{city:City}){
 const geometry=useMemo(()=>{
  const positions:number[]=[],colors:number[]=[],step=NAVIGATION_CELL;
  const palette={ground:new Color(city.ground),road:new Color('#84745c'),plaza:new Color('#615747')};
  for(let x=-70;x<70;x+=step)for(let z=-70;z<70;z+=step){
   const surface=navigationSurface(city.id,x+step/2,z+step/2);if(surface==='blocked')continue;
   const color=palette[surface];
   for(const [dx,dz] of [[0,0],[0,step],[step,0],[step,0],[0,step],[step,step]]){
    positions.push(x+dx,.115,z+dz);colors.push(color.r,color.g,color.b);
   }
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(positions,3));
  g.setAttribute('color',new Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
 },[city]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 const plan=navigationPlan(city.id);
 return <>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.02,0]} receiveShadow>
   <planeGeometry args={[140,140]}/><meshStandardMaterial color={plan?.blockedColor??city.ground} roughness={city.id==='wild2'?.28:.9} metalness={city.id==='wild2'?.25:0}/>
  </mesh>
  <mesh geometry={geometry} receiveShadow><meshStandardMaterial vertexColors roughness={.94}/></mesh>
 </>;
}
