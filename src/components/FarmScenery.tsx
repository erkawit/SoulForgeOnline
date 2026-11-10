'use client';
import {useMemo,useEffect} from 'react';
import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {farmScenery} from '@/game/world/farmScenery';
/** Batch gothic props by material; the footprint is a visible solid stone/debris island. */
export function buildFarmScenery(id:string){
  const buckets:Array<T.BufferGeometry[]> = Array.from({length:7},()=>[]),root=new T.Group();
  const colors=['#4b484d','#252126','#594539','#8b8270','#346452','#7a3037','#b98846'];
  for(const p of farmScenery(id)){
   const transform=new T.Matrix4().compose(new T.Vector3(p.x,0,p.z),new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),p.rotation),new T.Vector3(1,1,1));
   const put=(g:T.BufferGeometry,mat:number,x:number,y:number,z:number,rx=0,ry=0,rz=0)=>{g.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(1,1,1))).applyMatrix4(transform);const normalized=g.index?g.toNonIndexed():g;if(normalized!==g)g.dispose();buckets[mat].push(normalized);};
   const box=(m:number,x:number,y:number,z:number,w:number,h:number,d:number)=>put(new T.BoxGeometry(w,h,d),m,x,y,z);
   const rod=(m:number,a:number[],b:number[],r:number)=>{const av=new T.Vector3(...a as [number,number,number]),bv=new T.Vector3(...b as [number,number,number]),delta=bv.clone().sub(av);const g=new T.CylinderGeometry(r*.65,r,delta.length(),6);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize()));const c=av.add(bv).multiplyScalar(.5);put(g,m,c.x,c.y,c.z);};
   put(new T.CylinderGeometry(1.85,2,.5,8),0,0,.3,0);
   switch(p.kind){
    case 'grave':box(0,0,.8,0,1.6,1.1,.8);box(3,0,1.9,-.5,1,1.8,.3);box(3,0,2.2,-.5,1.5,.25,.35);break;
    case 'chapel':case 'warehouse':box(0,-1.2,2,0,.6,3.4,2.4);box(0,1.2,1.7,0,.6,2.8,2.4);box(0,0,3.8,-.8,3,.6,.5);put(new T.ConeGeometry(1.1,2,4),1,-1.2,4.5,0);break;
    case 'ribs':for(let i=0;i<4;i++){put(new T.TorusGeometry(1.15,.17,5,10,Math.PI),3,0,1,.9-i*.6,0,Math.PI/2); }rod(3,[0,.8,-1.5],[0,.8,1.5],.25);put(new T.DodecahedronGeometry(.65,0),3,0,1,1.4);break;
    case 'crystal':case 'stalagmite':case 'lava':for(let i=0;i<5;i++){const a=i*2.4,r=.65;put(new T.ConeGeometry(.45,2.5+(i%3)*.8,5),p.kind==='crystal'?4:p.kind==='lava'?5:0,Math.cos(a)*r,1.5,Math.sin(a)*r,.12,0,.12);}break;
    case 'cart':box(2,0,1.1,0,1.8,.9,2.3);box(1,0,1.6,0,1.4,.3,1.9);for(const x of [-1,1])for(const z of [-.7,.7])put(new T.CylinderGeometry(.35,.35,.2,8),1,x,.6,z,0,0,Math.PI/2);put(new T.OctahedronGeometry(.8),4,0,1.8,0);break;
    case 'statue':box(0,0,.8,0,1.6,.7,1.6);box(3,0,1.9,0,.7,1.8,.6);put(new T.IcosahedronGeometry(.4,0),3,0,3.2,0);rod(3,[-1.3,2.8,0],[1.3,2.8,0],.16);put(new T.ConeGeometry(.8,1.5,6),1,0,2,0);break;
    case 'column':put(new T.CylinderGeometry(.48,.65,4.5,8),0,0,2.6,0);box(3,0,4.9,0,1.5,.4,1.5);box(3,0,.7,0,1.5,.4,1.5);break;
    case 'windmill':put(new T.CylinderGeometry(.65,1.2,4,8),0,0,2.4,0);put(new T.ConeGeometry(1.1,1.5,8),1,0,4.9,0);for(const a of [Math.PI/4,-Math.PI/4])put(new T.BoxGeometry(.3,4.3,.2),2,0,4,1,0,0,a);break;
    case 'fence':for(const x of [-1.3,0,1.3])box(2,x,1.2,0,.25,1.7,.25);box(2,0,1.4,0,3,.2,.2);box(2,0,.9,0,3,.2,.2);break;
    case 'reeds':case 'hedge':for(let i=0;i<8;i++){const a=i*2.4;rod(4,[Math.cos(a),.5,Math.sin(a)],[Math.cos(a)*1.2,1.5+i%3*.5,Math.sin(a)*1.2],.14);}break;
    case 'totem':box(2,0,1.9,0,.7,3,.7);for(let i=0;i<3;i++)put(new T.DodecahedronGeometry(.5,0),3,0,1.3+i*.8,.35);break;
    default: {const thorn=p.kind==='thorn';rod(2,[0,.4,0],[.4,3.7,0],.5);for(let i=0;i<5;i++){const a=i*2.4,x=Math.cos(a)*1.7,z=Math.sin(a)*1.7;rod(thorn?5:2,[0,1.2+i*.4,0],[x,2.5+i*.3,z],.22);if(thorn)put(new T.ConeGeometry(.3,.9,4),3,x,3+i*.3,z);}break;}
   }
   // A small visible ember on each island; no per-prop point lights.
   put(new T.OctahedronGeometry(.13),6,1,.7,1);
  }
  buckets.forEach((parts,i)=>{if(!parts.length)return;const merged=mergeGeometries(parts);parts.forEach(p=>p.dispose());const material=new T.MeshStandardMaterial({color:colors[i],roughness:.9,emissive:i>=4?colors[i]:'#000000',emissiveIntensity:i>=4?.25:0});const mesh=new T.Mesh(merged,material);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);});
  return root;
}
export default function FarmScenery({id}:{id:string}){
 const group=useMemo(()=>buildFarmScenery(id),[id]);
 useEffect(()=>()=>group.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();(o.material as T.Material).dispose();}}),[group]);
 return <primitive object={group}/>;
}
