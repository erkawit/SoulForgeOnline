'use client';
import {useMemo,useEffect,useState} from 'react';
import {useTexture} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {BufferGeometry,Float32BufferAttribute,RepeatWrapping,ClampToEdgeWrapping,DataTexture,RGBAFormat,LinearFilter,LinearMipmapLinearFilter,NoColorSpace,TextureLoader,UniformsLib,UniformsUtils,type Texture} from 'three';
import {navigationSurface,NAVIGATION_CELL} from '@/game/world/terrainNavigation';
import {farmPlan} from '@/game/world/farmLayout';
import {bakedGroundUrl} from '@/game/world/groundBake';

/** Load only the current field's 4K bake and free it when the field changes — never all 13 at once. */
function useBakedGround(id:string):Texture|null{
 const gl=useThree(s=>s.gl);
 const [tex,setTex]=useState<Texture|null>(null);
 useEffect(()=>{
  let alive=true,loaded:Texture|null=null;
  setTex(null);
  new TextureLoader().load(bakedGroundUrl(id),t=>{
   if(!alive){t.dispose();return;}
   // raw sampling, like the 8 m tiles in the same shader (it writes gl_FragColor without colour-space conversion)
   t.colorSpace=NoColorSpace;t.flipY=true;t.wrapS=t.wrapT=ClampToEdgeWrapping;
   t.generateMipmaps=true;t.minFilter=LinearMipmapLinearFilter;t.magFilter=LinearFilter;
   t.anisotropy=Math.min(8,gl.capabilities.getMaxAnisotropy());t.needsUpdate=true;
   loaded=t;setTex(t);
  },undefined,()=>{/* missing bake: the tiled detail below still draws the whole field */});
  return()=>{alive=false;loaded?.dispose();};
 },[id,gl]);
 return tex;
}

/** Field ground: the baked 4K map carries the layout at range, the 1024 materials repeat every 8 m up close.
 *  Holes (water / chasm) come from the collision grid, so the floor never covers a blocked cell. */
export default function FarmGround({id}:{id:string}){
 const plan=farmPlan(id)!;
 const mats=[plan.materials[0],plan.materials.find(m=>m!==plan.materials[0]&&m!=='dirt-road'&&m!=='flagstone')??'rocky','dirt-road','flagstone'];
 const textures=useTexture(mats.map(m=>`/art/farm/materials/tile-${m}.webp`));
 textures.forEach(t=>{t.wrapS=t.wrapT=RepeatWrapping;t.anisotropy=4;});
 const baked=useBakedGround(id);
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
 // Surface classes per 0.5 m cell (R road, G plaza) — identical to the handoff's surface-mask.png, built from the same grid.
 const control=useMemo(()=>{const bytes=new Uint8Array(480*480*4);for(let z=0;z<480;z++)for(let x=0;x<480;x++){const s=navigationSurface(id,-120+(x+.5)*.5,-120+(z+.5)*.5),k=(z*480+x)*4;bytes[k]=s==='road'?255:0;bytes[k+1]=s==='plaza'?255:0;bytes[k+3]=255;}const map=new DataTexture(bytes,480,480,RGBAFormat);map.magFilter=map.minFilter=LinearFilter;map.needsUpdate=true;return map;},[id]);
 useEffect(()=>()=>control.dispose(),[control]);
 const uniforms=useMemo(()=>({...UniformsUtils.merge([UniformsLib.fog]),base:{value:textures[0]},detail:{value:textures[1]},road:{value:textures[2]},plaza:{value:textures[3]},control:{value:control},baked:{value:baked},hasBaked:{value:baked?1:0}}),[textures[0],textures[1],textures[2],textures[3],control,baked]);
 const water=id==='wild2'||id==='wild6';
 return <>
  {/* Unwalkable perimeter ground supports the distant tree silhouettes. */}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.08,0]}><ringGeometry args={[120*Math.SQRT2,142*Math.SQRT2,4,1,Math.PI/4]}/><meshStandardMaterial color="#292d2b" roughness={1}/></mesh>
  {/* Below the holes: dark still water for the swamp and canals, a black chasm elsewhere. */}
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.02,0]}><planeGeometry args={[240,240]}/><meshStandardMaterial color={water?'#163c35':'#16151b'} roughness={water?.25:.65} metalness={water?.2:0} emissive={water?'#0d2a2a':'#120c18'} emissiveIntensity={.35}/></mesh>
  <mesh geometry={geometry}><shaderMaterial key={baked?'baked':'tiles'} fog uniforms={uniforms} vertexShader={`varying vec2 world;
   #include <fog_pars_vertex>
   void main(){world=position.xz;vec4 mvPosition=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mvPosition;
   #include <fog_vertex>
   }`} fragmentShader={`
   uniform sampler2D base,detail,road,plaza,control,baked;uniform float hasBaked;varying vec2 world;
   #include <fog_pars_fragment>
   void main(){vec2 uv=world/8.;float noise=.5+.5*sin(world.x*.07)*sin(world.y*.09);
    vec3 c=mix(texture2D(base,uv).rgb,texture2D(detail,uv).rgb,noise*.4);
    vec2 weights=texture2D(control,(world+120.)/240.).rg;
    c=mix(c,texture2D(road,uv).rgb,weights.r);
    c=mix(c,texture2D(plaza,uv).rgb,weights.g);
    if(hasBaked>.5){
     // handoff UV: u=(x+120)/240, v=(120-z)/240 with flipY=true
     vec3 b=texture2D(baked,vec2((world.x+120.)/240.,(120.-world.y)/240.)).rgb;
     // near the camera the 8 m tiles keep the grain; further out the bake keeps the field readable without tiling
     float near=1.-smoothstep(28.,70.,distance(cameraPosition.xz,world));
     c=mix(b,c,near*.75);
    }
    gl_FragColor=vec4(c*.78,1.);
    #include <fog_fragment>
   }`}/></mesh>
 </>;
}
