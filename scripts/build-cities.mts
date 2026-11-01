import {mkdir,writeFile} from 'node:fs/promises';
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {CITIES,CAPITAL_WALLS,type MainCityId,type Building} from '../src/game/content';
import {spawnPoints} from '../src/game/spawns';

// Node's exporter needs FileReader even for untextured binary geometry.
Object.assign(globalThis,{FileReader:class {
 result:unknown; onloadend?:()=>void;
 readAsArrayBuffer(blob:Blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.();});}
 readAsDataURL(blob:Blob){blob.arrayBuffer().then(b=>{this.result=`data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;this.onloadend?.();});}
}});

type V=[number,number,number];
const output=new URL('../public/models/cities/',import.meta.url);
await mkdir(output,{recursive:true});
const manifest=[];
for(const id of ['hollow','dawnveil','thornwatch'] as MainCityId[]){
 const c=CITIES[id],forest=id==='thornwatch',ivory=id==='dawnveil';
 const root=new T.Group();root.name=c.name.replaceAll(' ','_');
 root.userData={cityId:id,units:'meters',playableBounds:[-23,23],upAxis:'Y',north:'-Z',sanctuaryRadius:6};
 const materials=new Map<string,T.MeshStandardMaterial>();
 function material(color:string,glow=false){const key=color+glow;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.88,emissive:glow?color:'#000000',emissiveIntensity:glow?1.6:0}));return materials.get(key)!;}
 function part(parent:T.Group,geometry:T.BufferGeometry,pos:V,color:string,rot:V=[0,0,0],glow=false){
  const mesh=new T.Mesh(geometry,material(color,glow));mesh.position.set(...pos);mesh.rotation.set(...rot);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function box(p:T.Group,pos:V,size:V,color:string,rot:V=[0,0,0],glow=false){return part(p,new T.BoxGeometry(...size),pos,color,rot,glow);}
 function cyl(p:T.Group,pos:V,r:number,h:number,color:string,top=r,n=12){return part(p,new T.CylinderGeometry(top,r,h,n),pos,color);}
 function ring(p:T.Group,pos:V,r:number,color:string,width=.045){return part(p,new T.TorusGeometry(r,width,5,64),pos,color,[-Math.PI/2,0,0],true);}
 function group(name:string,pos:V=[0,0,0]){const g=new T.Group();g.name=name;g.position.set(...pos);root.add(g);return g;}
 const stone=ivory?'#aaa28b':forest?'#6c6651':'#5c6067',trim=ivory?'#d5c8a4':'#919080',wood='#48392c',roof=c.roof;
 const terrain=group('Terrain_and_paths');
 box(terrain,[0,-.8,0],[64,1.2,64],forest?'#29342b':ivory?'#464b47':'#303137');
 // All walkable surfaces stay at y=0; elevation belongs to building plinths and scenery.
 for(let x=-23;x<24;x+=2)for(let z=-23;z<24;z+=2){
  if(c.water&&Math.abs(x-c.water.x)<3&&Math.abs(z)>2)continue;
  const road=Math.abs(x)<3||Math.abs(z)<3;
  const shade=(Math.abs(x*17+z*31)%5)/40;
  const col=new T.Color(road?(ivory?'#938d7a':forest?'#655e49':'#77736b'):c.ground).multiplyScalar(.85+shade);
  box(terrain,[x,-.06,z],[1.96,.12,1.96],`#${col.getHexString()}`);
 }
 for(let i=-22;i<=22;i+=2){
  if(Math.abs(i)>6){box(terrain,[-2.8,.015,i],[.22,.1,1.85],trim);box(terrain,[2.8,.015,i],[.22,.1,1.85],trim);}
 }
 // Sanctuary and waypoint are also present in the exported modeling asset.
 const safe=group('Sanctuary');cyl(safe,[0,-.02,0],5.8,.08,stone,5.8,64);
 ring(safe,[0,.045,0],5.8,c.accent,.035);ring(safe,[0,.045,0],2.5,c.accent);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;box(safe,[Math.cos(a)*3,.025,Math.sin(a)*3],[.65,.04,.14],trim,[0,-a,0]);}
 cyl(safe,[0,.13,0],1,.26,trim,1,12);part(safe,new T.OctahedronGeometry(.5),[0,1.1,0],c.accent,[0,0,0],true);
 const waypoint=group('Waygate',[6,0,0]);cyl(waypoint,[0,.08,0],.8,.16,stone);part(waypoint,new T.OctahedronGeometry(.55),[0,1.4,0],'#9569dc',[0,0,0],true);

 function building(b:Building,index:number){
  const g=group(`${b.kind}_${index}`,[b.x,0,b.z]);g.userData={footprint:[b.w,b.d],height:b.h,collision:'building'};
  const h=b.h;
  box(g,[0,.18,0],[b.w+.2,.36,b.d+.2],stone);
  box(g,[0,h/2,0],[b.w,h,b.d],forest?'#62513e':stone);
  for(const y of [.45,h*.5,h-.15])box(g,[0,y,0],[b.w+.16,.16,b.d+.16],forest?wood:trim);
  // Pitched roofs, layered eaves, ridge beam and individual roof ribs.
  const rise=b.kind==='temple'?2.5:1.5,angle=Math.atan2(rise,b.w/2),length=Math.hypot(rise,b.w/2);
  for(const side of [-1,1]){
   box(g,[side*b.w/4,h+rise/2,0],[length+.25,.2,b.d+.45],roof,[0,0,-side*angle]);
   for(let k=0;k<6;k++)box(g,[side*b.w/4,h+rise/2+.12,-b.d/2+k*b.d/5],[length+.26,.045,.045],forest?'#53614b':'#6c7276',[0,0,-side*angle]);
   for(const z of [-b.d/2,b.d/2])box(g,[side*(b.w/2-.12),h*.48,z],[.25,h,.27],forest?wood:trim);
  }
  box(g,[0,h+rise+.1,0],[.16,.2,b.d+.6],forest?wood:trim);
  // Doors and tall pointed windows face the clear south approach.
  box(g,[0,1,b.d/2+.025],[1,2,.08],'#211f23');
  part(g,new T.ConeGeometry(.72,.65,4),[0,2.1,b.d/2+.03],trim,[0,Math.PI/4,0]);
  for(const side of [-1,1])for(const y of [h*.4,h*.75]){
   box(g,[side*b.w*.3,y,b.d/2+.04],[.42,.8,.06],'#e2ac61',[0,0,0],true);
   box(g,[side*b.w*.3,y,b.d/2+.09],[.04,.85,.05],wood);
   box(g,[side*b.w*.3,y,b.d/2+.09],[.46,.045,.05],wood);
  }
  if(forest){
   for(const side of [-1,1])box(g,[side*b.w*.25,h*.48,b.d/2+.1],[.16,h*.9,.16],wood,[0,0,side*.35]);
   if(b.kind==='tower'){
    box(g,[0,h*.75,0],[b.w+.35,.2,b.d+.35],wood);
    for(let j=0;j<6;j++)for(const side of [-1,1])box(g,[-b.w/2+j*b.w/5,h*.85,side*b.d/2],[.1,h*.23,.1],wood);
   }
  }else{
   // Narrow buttresses remain inside the collision clearance.
   for(const side of [-1,1])for(const z of [-b.d*.3,b.d*.3])box(g,[side*(b.w/2+.08),h*.32,z],[.22,h*.64,.5],stone);
  }
  if(b.kind==='temple'||(!forest&&b.kind==='tower')){
   const r=b.kind==='temple'?.65:b.w*.35;
   for(const side of b.kind==='temple'?[-1,1]:[0]){
    cyl(g,[side*b.w*.38,h+.7,0],r,1.6,stone,r,8);
    part(g,new T.ConeGeometry(r*1.2,2.1,8),[side*b.w*.38,h+2.5,0],roof);
    cyl(g,[side*b.w*.38,h+3.7,0],.045,.7,trim,.045,6);
   }
   if(b.kind==='temple'){
    part(g,new T.TorusGeometry(.7,.11,6,24),[0,h*.72,b.d/2+.16],'#c4a365');
    part(g,new T.CircleGeometry(.58,24),[0,h*.72,b.d/2+.12],'#75a8b8',[0,0,0],true);
   }
  }
  if(b.kind==='forge'){
   box(g,[b.w*.3,h+1,0],[.85,3,.85],'#414145');
   box(g,[b.w*.3,h+2.55,0],[1.05,.18,1.05],trim);
   box(g,[-b.w*.25,.85,b.d/2+.08],[1.3,1.4,.12],'#f57e32',[0,0,0],true);
   for(let i=0;i<5;i++)box(g,[-b.w*.25-.55+i*.27,.85,b.d/2+.18],[.07,1.4,.08],'#292b30');
  }
 }
 c.buildings.forEach(building);
 if(id==='hollow'){
  const wall=group('Northern_gate_walls');
  for(const b of CAPITAL_WALLS[id]!){
   box(wall,[b.x,1.4,b.z],[b.w,2.8,b.d],stone);
   for(let j=0;j<10;j++)box(wall,[b.x-5.5+j*1.22,3,b.z],[.6,.55,.85],trim);
   // Horizontal masonry courses.
   for(let j=0;j<4;j++)box(wall,[b.x,.35+j*.65,b.z+.38],[b.w,.045,.04],'#33373c');
  }
 }
 if(c.water){
  const canal=group('Canal_and_bridge');
  box(canal,[8,-.15,0],[4,.05,52],'#28565d');
  // The deck matches walkable's |z| <= 2.1 bridge crossing.
  box(canal,[8,-.04,0],[5,.08,4.2],trim);
  for(const side of [-1,1]){
   box(canal,[8,.55,side*2.3],[5,.22,.2],stone);
   for(let i=0;i<8;i++)box(canal,[5.65+i*.67,.25,side*2.3],[.14,.55,.14],trim);
   for(const z of [-13,13])box(canal,[8+side*2.15,-.2,z],[.25,.8,21],stone);
  }
  for(let i=0;i<28;i++)box(canal,[6.5+(i%3),-.115,-24+i*1.8],[.6,.01,.035],'#507b7d');
 }
 const props=group('Outskirts_scenery');
 for(let i=0;i<56;i++){
  const a=i/56*Math.PI*2,r=26+(i%4)*1.2,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(forest){
   cyl(props,[x,2,z],.55,4,wood,.28,7);
   for(let j=0;j<3;j++)part(props,new T.ConeGeometry(2.1-j*.35,3.4,7),[x,3+j*1.25,z],j%2?'#344a35':'#243e30');
   for(let j=0;j<3;j++)box(props,[x+Math.cos(j*2)*.45,.4,z+Math.sin(j*2)*.45],[.25,1.6,.25],wood,[.5,0,j*2]);
  }else{const rock=part(props,new T.DodecahedronGeometry(.8+(i%3)*.3),[x,.2,z],ivory?'#6d746c':'#484b52',[i,.4*i,0]);rock.scale.set(1,1+i%3,1);}
 }
 const farms=group('Monster_farming_clearings');
 for(const p of spawnPoints(id)){
  const [x,z]=p.position;
  const anchor=new T.Group();anchor.name=`Spawn_${p.index+1}_${p.name.replaceAll(' ','_')}`;anchor.position.set(x,0,z);anchor.userData={...p,respawnSeconds:p.respawnSeconds};root.add(anchor);
  cyl(farms,[x,.012,z],1.65,.015,forest?'#4b4d36':ivory?'#6a7060':'#55504b',1.65,24);
  ring(farms,[x,.045,z],1.5,'#b75445',.025);
  // Small scenery stays behind the clearing, away from the monster home.
  for(let j=0;j<3;j++){
   const a=(j+1)*Math.PI/4,px=x+Math.cos(a)*2.3,pz=z+Math.sin(a)*2.3;
   if(Math.abs(px)<3||Math.abs(pz)<3||c.buildings.some(b=>Math.abs(px-b.x)<b.w/2+1&&Math.abs(pz-b.z)<b.d/2+1))continue;
   if(id==='hollow'){box(farms,[px,.4,pz],[.45,.8,.18],stone,[0,j*.4,0]);box(farms,[px,.65,pz],[.7,.14,.18],stone);}
   else if(forest){cyl(farms,[px,.15,pz],.12,.3,wood);part(farms,new T.SphereGeometry(.3,8,6,0,Math.PI*2,0,Math.PI/2),[px,.3,pz],'#8c7755');}
   else for(let k=0;k<3;k++)box(farms,[px+k*.15,.35,pz],[.035,.7,.035],'#777c4f',[.1*k,0,.15]);
  }
 }
 // Merge static pieces by material inside named modules to keep rendering inexpensive.
 root.updateMatrixWorld(true);
 for(const child of [...root.children]){
  if(!(child instanceof T.Group)||!child.children.length)continue;
  const batches=new Map<T.Material,T.BufferGeometry[]>();
  for(const object of [...child.children])if(object instanceof T.Mesh){
   object.updateMatrix();const source=object.geometry.clone().applyMatrix4(object.matrix);
   const geometry=source.index?source.toNonIndexed():source;if(source!==geometry)source.dispose();
   const mat=object.material as T.Material;if(!batches.has(mat))batches.set(mat,[]);batches.get(mat)!.push(geometry);
   object.geometry.dispose();child.remove(object);
  }
  for(const [mat,geometries] of batches){const merged=mergeGeometries(geometries,false)!;geometries.forEach(g=>g.dispose());const mesh=new T.Mesh(merged,mat);mesh.name=`${child.name}_surface`;mesh.castShadow=child.name!=='Terrain_and_paths';mesh.receiveShadow=true;child.add(mesh);}
 }
 const binary=await new GLTFExporter().parseAsync(root,{binary:true});
 await writeFile(new URL(`${id}.glb`,output),Buffer.from(binary as ArrayBuffer));
 let triangles=0,meshes=0;root.traverse(o=>{if(o instanceof T.Mesh){meshes++;triangles+=o.geometry.attributes.position.count/3;}});
 manifest.push({id,name:c.name,file:`${id}.glb`,meshes,triangles,spawns:spawnPoints(id)});
 root.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());
 console.log(`${id}: ${meshes} meshes, ${triangles} triangles`);
}
await writeFile(new URL('manifest.json',output),JSON.stringify(manifest,null,2));
