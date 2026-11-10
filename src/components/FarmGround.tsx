'use client';
import {useMemo,useEffect} from 'react';
import {useTexture} from '@react-three/drei';
import {BufferGeometry,Float32BufferAttribute,RepeatWrapping,DataTexture,RGBAFormat,LinearFilter,UniformsLib,UniformsUtils} from 'three';
import {navigationSurface,NAVIGATION_CELL} from '@/game/world/terrainNavigation';
import {farmPlan} from '@/game/world/farmLayout';
/** Repeated 8 m materials, blended in world space; holes share the collision grid. */
export default function FarmGround({id}:{id:string}){
 const plan=farmPlan(id)!;
 const mats=[plan.materials[0],plan.materials.find(m=>m!==plan.materials[0]&&m!=='dirt-road'&&m!=='flagstone')??'rocky','dirt-road','flagstone'];
 const textures=useTexture(mats.map(m=>`/art/farm/materials/tile-${m}.webp`));
 textures.forEach(t=>{t.wrapS=t.wrapT=RepeatWrapping;t.anisotropy=4;});
 const geometry=useMemo(()=>{
  const vertices:number[]=[],step=NAVIGATION_CELL;
  // Merge consecutive open cells into strips: same collision edge, far fewer triangles.
  for(let z=-120;z<120;z+=step){let start:number|null=null;
   for(let x=-120;x<=120;x+=step){
    const open=x<120&&navigationSurface(id,x+step/2,z+step/2)!=='blocked';
    if(open&&start===null)start=x;
    if(!open&&start!==null){
     for(const [px,pz] of [[start,z],[start,z+step],[x,z],[x,z],[start,z+step],[x,z+step]])vertices.push(px,.115,pz);
     start=null;
    }
   }
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));return g;
 },[id]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 const control=useMemo(()=>{const bytes=new Uint8Array(480*480*4);for(let z=0;z<480;z++)for(let x=0;x<480;x++){const s=navigationSurface(id,-120+(x+.5)*.5,-120+(z+.5)*.5),k=(z*480+x)*4;bytes[k]=s==='road'?255:0;bytes[k+1]=s==='plaza'?255:0;bytes[k+3]=255;}const map=new DataTexture(bytes,480,480,RGBAFormat);map.magFilter=map.minFilter=LinearFilter;map.needsUpdate=true;return map;},[id]);
 useEffect(()=>()=>control.dispose(),[control]);
 const uniforms=useMemo(()=>({...UniformsUtils.merge([UniformsLib.fog]),base:{value:textures[0]},detail:{value:textures[1]},road:{value:textures[2]},plaza:{value:textures[3]},control:{value:control}}),[textures[0],textures[1],textures[2],textures[3],control]);
 return <>
  {/* Unwalkable perimeter ground supports the distant tree silhouettes. */}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.08,0]}><ringGeometry args={[120*Math.SQRT2,142*Math.SQRT2,4,1,Math.PI/4]}/><meshStandardMaterial color="#292d2b" roughness={1}/></mesh>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.02,0]}><planeGeometry args={[240,240]}/><meshStandardMaterial color={id==='wild2'||id==='wild6'?'#163c35':'#16151b'} roughness={.65}/></mesh>
  <mesh geometry={geometry}><shaderMaterial fog uniforms={uniforms} vertexShader={`varying vec2 world;
   #include <fog_pars_vertex>
   void main(){world=position.xz;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
   #include <fog_vertex>
   }`} fragmentShader={`
   uniform sampler2D base,detail,road,plaza,control;varying vec2 world;
   #include <fog_pars_fragment>
   void main(){vec2 uv=world/8.;float noise=.5+.5*sin(world.x*.07)*sin(world.y*.09);
    vec3 c=mix(texture2D(base,uv).rgb,texture2D(detail,uv).rgb,noise*.4);
    vec2 weights=texture2D(control,(world+120.)/240.).rg;
    c=mix(c,texture2D(road,uv).rgb,weights.r);
    c=mix(c,texture2D(plaza,uv).rgb,weights.g);gl_FragColor=vec4(c*.78,1.);
    #include <fog_fragment>
   }`}/></mesh>
 </>;
}
