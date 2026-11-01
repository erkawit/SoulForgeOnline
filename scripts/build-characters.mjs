/** Original procedural character source. Y-up, +Z forward; metres; no external assets. */
import * as T from 'three';
import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {mkdir,writeFile} from 'node:fs/promises';
// GLTFExporter uses FileReader for binary buffers, even without image textures.
globalThis.FileReader=class {readAsArrayBuffer(blob){blob.arrayBuffer().then(b=>{this.result=b;this.onloadend?.();});}readAsDataURL(blob){blob.arrayBuffer().then(b=>{this.result=`data:${blob.type};base64,${Buffer.from(b).toString('base64')}`;this.onloadend?.();});}};
const configurations={
 Warrior:{cloth:'#54262f',metal:'#48525d',trim:'#b59a61',glow:'#74d5dd',skin:'#bca18d',hair:'#302923'},
 Mage:{cloth:'#292846',metal:'#59536a',trim:'#b8a16d',glow:'#aa89ff',skin:'#c6aa96',hair:'#25212d'},
 Priest:{cloth:'#ded3b5',metal:'#9e8d62',trim:'#cfb266',glow:'#ffe3a0',skin:'#c6a38c',hair:'#49342e'},
 Archer:{cloth:'#314c3c',metal:'#5a6655',trim:'#ac9060',glow:'#a3d598',skin:'#c8a08a',hair:'#683a2a'},
 Enchanter:{cloth:'#23454b',metal:'#414c55',trim:'#b79a66',glow:'#62dbdf',skin:'#bfa394',hair:'#b8b5ae'}
};
const manifest={version:1,style:'Original low-poly articulated characters',units:'metres',forward:'+Z',models:[]};
for(const [job,c] of Object.entries(configurations)){
 const scene=new T.Scene();const actor=new T.Group();actor.name=job;scene.add(actor);
 const mat=(name,color,metalness=0,roughness=.7)=>{const m=new T.MeshStandardMaterial({name,color,metalness,roughness});return m;};
 const m={cloth:mat('Cloth',c.cloth),metal:mat('Steel',c.metal,.75,.38),trim:mat('AntiqueGold',c.trim,.78,.35),skin:mat('Skin',c.skin),hair:mat('Hair',c.hair),leather:mat('Leather','#302b2b',0,.85),silver:mat('Blade','#a9bdc4',.9,.25),dark:mat('Recess','#11171d'),paper:mat('Parchment','#d5c4a0'),gem:mat('SoulGlow',c.glow,.35,.25)};
 m.gem.emissive.set(c.glow);m.gem.emissiveIntensity=.7;
 const bones=[];const bone=(name,parent,pos)=>{const b=new T.Bone();b.name=name;b.position.set(...pos);parent.add(b);bones.push(b);return b;};
 const root=bone('Root',actor,[0,0,0]),hips=bone('Hips',root,[0,1.02,0]),spine=bone('Spine',hips,[0,.22,0]),chest=bone('Chest',spine,[0,.3,0]),neck=bone('Neck',chest,[0,.22,0]),head=bone('Head',neck,[0,.12,0]);
 const arms={},legs={};
 for(const [side,sign] of [['R',1],['L',-1]]){const a=bone(`UpperArm${side}`,chest,[sign*.37,.12,0]);const f=bone(`Forearm${side}`,a,[0,-.34,0]);const h=bone(`Hand${side}`,f,[0,-.32,0]);arms[side]={a,f,h};const t=bone(`Thigh${side}`,hips,[sign*.16,-.04,0]);const k=bone(`Shin${side}`,t,[0,-.43,0]);const foot=bone(`Foot${side}`,k,[0,-.43,0]);legs[side]={t,k,foot};}
 const cape=bone('Cape',chest,[0,.11,-.17]);
 const mesh=(parent,g,material,pos=[0,0,0],scale=[1,1,1],name='Detail')=>{const o=new T.Mesh(g,material);o.name=name;o.position.set(...pos);o.scale.set(...scale);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const ell=(p,pos,s,ma)=>mesh(p,new T.SphereGeometry(1,12,8),ma,pos,s);
 const box=(p,pos,s,ma)=>mesh(p,new T.BoxGeometry(...s),ma,pos);
 const rod=(p,a,b,r,ma)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),d=bv.clone().sub(av);const o=mesh(p,new T.CylinderGeometry(r,r,d.length(),8),ma,av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;};
 const gem=(p,pos,s=.07)=>mesh(p,new T.OctahedronGeometry(s),m.gem,pos,[1,1.35,.6],'SoulGem');
 const ring=(p,pos,r,ma=m.trim)=>mesh(p,new T.TorusGeometry(r,.012,5,20),ma,pos);
 const plate=(p,points,depth,ma,pos=[0,0,0])=>{const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();return mesh(p,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.012,bevelThickness:.008}),ma,pos);};
 const torsoGeo=new T.CylinderGeometry(.3,.23,.56,12,6);torsoGeo.scale(1,1,.65);torsoGeo.translate(0,1.35,0);
 const indices=[],weights=[];for(let i=0;i<torsoGeo.attributes.position.count;i++){const y=torsoGeo.attributes.position.getY(i);const w=T.MathUtils.clamp((y-1.24)/.3,0,1);indices.push(bones.indexOf(spine),bones.indexOf(chest),0,0);weights.push(1-w,w,0,0);}torsoGeo.setAttribute('skinIndex',new T.Uint16BufferAttribute(indices,4));torsoGeo.setAttribute('skinWeight',new T.Float32BufferAttribute(weights,4));
 const skin=new T.SkinnedMesh(torsoGeo,m.cloth);skin.name='SkinnedTunic';actor.add(skin);actor.updateMatrixWorld(true);skin.castShadow=true;
 ell(hips,[0,.02,0],[.25,.16,.17],m.leather);
 // Fitted cuirass with raised central keel, border and rivets.
 const cuirass=[[-.29,.1],[-.23,.2],[.23,.2],[.29,.1],[.24,-.21],[0,-.29],[-.24,-.21]];
 plate(chest,cuirass,.045,job==='Mage'||job==='Priest'?m.cloth:m.metal,[0,-.1,.15]);
 for(const x of [-.22,.22]){rod(chest,[x,.03,.21],[x*.7,-.3,.21],.012,m.trim);for(let n=0;n<3;n++)ell(chest,[x,-n*.1,.224],[.018,.018,.012],m.trim);}
 rod(chest,[0,.08,.23],[0,-.31,.23],.014,m.trim);gem(chest,[0,.035,.255],.065);
 const belt=mesh(hips,new T.CylinderGeometry(.265,.265,.09,12),m.leather,[0,.1,0],[1,1,.75]);ring(hips,[0,.1,.208],.06);gem(hips,[0,.1,.22],.032);
 for(const s of [-1,1]){box(hips,[s*.255,.02,.05],[.095,.15,.11],m.leather);box(hips,[s*.255,.055,.115],[.055,.035,.014],m.trim);}
 ell(neck,[0,.025,0],[.09,.12,.09],m.skin);
 ell(head,[0,.08,0],[.16,.21,.145],job==='Warrior'?m.metal:m.skin);
 if(job==='Warrior'){
  plate(head,[[-.16,.16],[0,.26],[.16,.16],[.12,-.13],[0,-.18],[-.12,-.13]],.025,m.metal,[0,.03,.115]);
  for(const s of [-1,1]){rod(head,[s*.015,.12,.155],[s*.12,.13,.155],.018,m.dark);rod(head,[s*.024,.12,.17],[s*.106,.13,.17],.008,m.gem);rod(head,[s*.12,.05,.16],[s*.07,-.1,.16],.009,m.trim);}
  rod(head,[0,-.13,.165],[0,.26,.165],.012,m.trim);
  plate(head,[[-.02,0],[0,.13],[.02,0]],.15,m.trim,[0,.29,-.08]);
 }else{
  ell(head,[0,.2,-.035],[.17,.13,.15],m.hair);
  for(const s of [-1,1]){ell(head,[s*.16,.08,0],[.03,.065,.03],m.skin);ell(head,[s*.061,.09,.135],[.032,.015,.014],m.dark);ell(head,[s*.061,.09,.147],[.011,.012,.004],m.gem);rod(head,[s*.035,.127,.14],[s*.09,.13,.132],.009,m.hair);}
  ell(head,[0,.035,.145],[.026,.045,.04],m.skin);rod(head,[-.035,-.04,.131],[.035,-.04,.131],.005,m.leather);
  for(let i=0;i<7;i++){const o=ell(head,[(i-3)*.045,.23,-.005],[.035,.09,.15],m.hair);o.rotation.z=(i-3)*-.13;}
  if(job==='Archer'||job==='Priest')for(let i=0;i<7;i++)ell(head,[.12,-.02-i*.065,-.12],[.045,.05,.045],m.hair);
  if(job==='Mage'||job==='Priest'||job==='Enchanter'){ring(head,[0,.2,.14],.1);gem(head,[0,.205,.16],.035);}
 }
 // Layered shoulder shells, elbow articulation, segmented greaves and gauntlets.
 for(const [side,sign] of [['R',1],['L',-1]]){const {a,f,h}=arms[side],{t,k,foot}=legs[side];
  ell(a,[0,-.16,0],[.105,.205,.105],m.cloth);ell(f,[0,-.15,0],[.085,.18,.09],m.leather);
  const layers=job==='Warrior'?3:2;
  for(let i=0;i<layers;i++){ell(a,[sign*.025,-.015-i*.065,0],[.16-i*.015,.1,.18-i*.01],m.metal);rod(a,[-.1,-.07-i*.065,.13],[.1,-.07-i*.065,.13],.01,m.trim);}
  if(job==='Enchanter'||job==='Mage')gem(a,[sign*.04,.055,.05],.055);
  ell(f,[0,0,0],[.105,.1,.11],m.metal);
  plate(f,[[-.075,.04],[.075,.04],[.09,-.23],[0,-.3],[-.09,-.23]],.03,m.metal,[0,-.015,.075]);rod(f,[0,0,.12],[0,-.25,.12],.009,m.trim);
  ell(h,[0,-.045,0],[.075,.09,.055],m.leather);
  for(let j=0;j<4;j++)box(h,[(j-1.5)*.032,-.09,.035],[.026,.07,.035],m.metal);
  ell(t,[0,-.2,0],[.12,.23,.12],job==='Warrior'?m.metal:m.leather);
  ell(k,[0,0,.035],[.135,.11,.12],m.metal);
  plate(k,[[-.09,-.06],[.09,-.06],[.07,-.36],[-.07,-.36]],.03,m.metal,[0,0,.075]);rod(k,[0,-.08,.12],[0,-.33,.12],.009,m.trim);
  ell(foot,[0,-.035,.075],[.115,.08,.21],m.leather);
  for(let i=0;i<3;i++)box(foot,[0,-.005,.08+i*.045],[.19,.035,.045],m.metal);
 }
 // Hanging panels are separate articulated cloth bones, allowing walk and death clips.
 const clothBones=[];
 for(const s of [-1,1]){const b=bone(s===1?'SkirtR':'SkirtL',hips,[s*.16,.06,0]);clothBones.push(b);const len=job==='Warrior'?.54:job==='Archer'?.45:.85;
  plate(b,[[-.12,0],[.12,0],[.19,-len+.08],[0,-len],[-.13,-len+.04]],.012,m.cloth,[0,0,.18]);rod(b,[s*.08,-.08,.205],[s*.11,-len+.1,.205],.009,m.trim);
  if(job!=='Archer')gem(b,[0,-len+.16,.205],.027);
 }
 plate(cape,[[-.24,0],[.24,0],[.38,-1.1],[.16,-1.04],[0,-1.15],[-.35,-1.1]],.012,m.cloth,[0,0,-.04]);cape.rotation.x=.1;
 for(const s of [-1,1])rod(cape,[s*.23,-.04,-.058],[s*.32,-1.05,-.058],.009,m.trim);
 if(job==='Mage'||job==='Priest'){for(const s of [-1,1]){const collar=plate(chest,[[-.04,0],[.04,.16],[.08,-.1]],.025,m.trim,[s*.13,.18,0]);collar.rotation.y=s*.8;}}
 const socketR=bone('WeaponR',arms.R.h,[0,-.03,.12]),gripL=bone('WeaponL',arms.L.h,[0,-.03,.12]);
 const gripR=new T.Group();socketR.add(gripR);gripR.name='WeaponGeometryR';
 if(job==='Warrior'){gripR.rotation.x=Math.PI;gripR.scale.setScalar(.78);}
 if(job==='Mage')gripR.position.x=0;
 if(job==='Priest'){gripR.rotation.x=Math.PI;gripR.rotation.z=-.25;}
 if(job==='Warrior'){
  rod(gripR,[0,-.12,0],[0,.13,0],.035,m.leather);rod(gripR,[-.18,.14,0],[.18,.14,0],.025,m.trim);
  plate(gripR,[[-.055,.17],[.055,.17],[.045,.92],[0,1.13],[-.045,.92]],.025,m.silver,[0,0,-.012]);rod(gripR,[0,.2,.025],[0,.9,.025],.008,m.trim);gem(gripR,[0,.14,.035],.035);
  const outline=[[-.26,.34],[0,.43],[.26,.34],[.24,-.18],[0,-.43],[-.24,-.18]];
  plate(gripL,outline,.055,m.trim,[0,0,.02]);plate(gripL,outline.map(([x,y])=>[x*.9,y*.9]),.06,m.metal,[0,0,.055]);rod(gripL,[0,-.31,.13],[0,.3,.13],.018,m.trim);gem(gripL,[0,.06,.15],.095);
 }else if(job==='Mage'){
  rod(gripR,[0,-.91,0],[0,1.13,0],.028,m.leather);for(const y of [-.65,-.1,.4,.9])ring(gripR,[0,y,0],.045).rotation.x=Math.PI/2;
  ring(gripR,[0,1.25,0],.2);gem(gripR,[0,1.25,0],.12);for(const s of [-1,1])rod(gripR,[s*.06,1,0],[s*.2,1.32,0],.025,m.trim);
 }else if(job==='Priest'){
  rod(gripR,[0,-.1,0],[0,.5,0],.027,m.leather);ell(gripR,[0,.53,0],[.12,.15,.12],m.trim);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(gripR,[Math.cos(a)*.1,.53,Math.sin(a)*.1],[.05,.22,.05],m.silver);}gem(gripR,[0,.69,0],.06);
  box(gripL,[0,.04,.04],[.28,.08,.35],m.paper);for(const y of [-.01,.09])box(gripL,[0,y,.04],[.31,.025,.38],m.leather);box(gripL,[0,.11,.04],[.025,.01,.28],m.trim);gem(gripL,[0,.12,.04],.035);
 }else if(job==='Archer'){
  const curve=new T.CatmullRomCurve3(Array.from({length:17},(_,i)=>{const y=(i/16-.5)*1.3;return new T.Vector3(0,y,.22*Math.sin(i/16*Math.PI)-.22);}));mesh(gripL,new T.TubeGeometry(curve,24,.025,6,false),m.trim);
  rod(gripL,[0,-.65,-.22],[0,.65,-.22],.004,m.paper);rod(gripR,[0,0,-.3],[0,0,.4],.008,m.leather);mesh(gripR,new T.ConeGeometry(.025,.09,4),m.silver,[0,0,.44]).rotation.x=Math.PI/2;
  mesh(chest,new T.CylinderGeometry(.09,.075,.52,10),m.leather,[.18,-.02,-.27]);for(let i=0;i<4;i++){const x=.13+i*.032;rod(chest,[x,-.18,-.27],[x,.48,-.27],.008,m.trim);plate(chest,[[-.02,0],[.02,.07],[.02,-.06]],.005,m.cloth,[x,.4,-.27]);}
 }else{
  ring(gripL,[0,.16,0],.23);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;gem(gripL,[Math.cos(a)*.14,.16+Math.sin(a)*.14,0],.045);}gem(gripR,[0,.15,.03],.09);ring(gripR,[0,.15,.03],.16);
  for(const s of [-1,1]){rod(hips,[s*.24,.08,.1],[s*.25,-.24,.15],.009,m.trim);mesh(hips,new T.CylinderGeometry(.025,.025,.14,8),m.gem,[s*.28,-.16,.13]);}
 }
 actor.updateMatrixWorld(true);skin.bind(new T.Skeleton(bones));
 // Shared skeleton plus class-specific motion tracks. All clips have neutral recovery except Death.
 const pose=(kind,u)=>{
  const p={};const set=(n,x=0,y=0,z=0)=>p[n]=[x,y,z];const cyc=Math.sin(u*Math.PI*2),hit=Math.sin(Math.PI*u),pulse=Math.sin(Math.PI*u)**2;
  set('Spine',.015*cyc);set('Chest',0,.012*cyc);set('Head',.015*cyc);set('Cape',.1+.025*cyc);set('UpperArmR',-.08,0,-.08);set('UpperArmL',-.08,0,.08);set('ForearmR',-.15);set('ForearmL',-.15);
  if(job==='Mage'){set('ForearmR',-.3);set('UpperArmL',-.13);}
  if(job==='Priest'||job==='Enchanter'){set('ForearmL',-1);set('ForearmR',-.3);}
  if(kind==='Walk'||kind==='Run'){
   const run=kind==='Run',amp=run?.75:.48;set('ThighR',cyc*amp);set('ThighL',-cyc*amp);set('ShinR',Math.max(0,-cyc)*(run?1.05:.65));set('ShinL',Math.max(0,cyc)*(run?1.05:.65));set('FootR',-.15*cyc);set('FootL',.15*cyc);set('Spine',run?.12:.04,0,.025*cyc);set('UpperArmR',-cyc*.25,0,-.08);set('UpperArmL',cyc*.2,0,.08);set('SkirtR',cyc*.2);set('SkirtL',-cyc*.2);set('Cape',.18+(run?.1:0)+.05*cyc);
  }
  if(kind==='Attack'||kind==='Skill'){
   if(job==='Warrior'){set('UpperArmR',-2.2*hit,0,-.08-.5*hit);set('ForearmR',-.15-.7*hit);set('Chest',0,-.65*cyc);set('ForearmL',-.8*hit);set('ThighL',-.16*hit);}
   else if(job==='Archer'){set('UpperArmL',-1.45*hit,0,.15*hit);set('ForearmL',-.1);set('UpperArmR',-1.1*hit,-.8*hit,-.8*hit);set('ForearmR',-1.2*hit);set('Chest',0,.4*hit);}
   else{set('UpperArmR',-1.2*hit,0,-.1-.25*hit);set('ForearmR',-.2-.5*hit);set('UpperArmL',-.65*hit,0,.3*hit);set('ForearmL',-.6);set('Chest',-.1*hit,.25*cyc);}
  }
  if(kind==='Buff'||kind==='Special'){
   if(job==='Warrior'&&kind==='Special'){set('UpperArmL',-1.1*hit,0,-.4*hit);set('ForearmL',-.55*hit);set('Spine',.18*hit);set('ThighR',-.18*hit);set('ShinR',.28*hit);}
   else if(job==='Archer'&&kind==='Special'){set('UpperArmL',-1.5*hit,0,.1);set('UpperArmR',-1.3*hit,-.65*hit,-.8*hit);set('ForearmR',-1.4*hit);set('Chest',0,.45*hit);}
   else{set('UpperArmR',-.45*hit,0,-1.8*hit);set('UpperArmL',-.45*hit,0,1.8*hit);set('ForearmR',-.55*hit);set('ForearmL',-.55*hit);set('Head',-.17*hit);set('Chest',-.08*hit);set('Cape',.1+.18*pulse);}
  }
  // Two hands remain on the Mage staff; solve the arm chain against shared grip targets.
  if(job==='Mage'&&kind!=='Death'){
   const lift=['Buff','Special'].includes(kind)?hit*.35:0,reach=['Attack','Skill'].includes(kind)?hit*.18:0;
   for(const [side,tx,ty] of [['R',.15,-.32],['L',.15,.04]]){
    const shoulder=new T.Vector3(side==='R'?.37:-.37,.12,0),target=new T.Vector3(tx,ty+lift,.35+reach);
    const axis=target.clone().sub(shoulder),distance=Math.min(.655,axis.length());axis.normalize();
    const bend=new T.Vector3(side==='R'?1:-1,-.25,-.7);bend.addScaledVector(axis,-bend.dot(axis)).normalize();
    const along=(.34*.34-.32*.32+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,.34*.34-along*along));
    const elbow=shoulder.clone().addScaledVector(axis,along).addScaledVector(bend,height),wrist=shoulder.clone().addScaledVector(axis,distance);
    const qa=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,-1,0),elbow.clone().sub(shoulder).normalize());
    const qf=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,-1,0),wrist.clone().sub(elbow).normalize());
    const local=qa.clone().invert().multiply(qf),hand=qf.clone().invert();
    for(const [name,q] of [[`UpperArm${side}`,qa],[`Forearm${side}`,local],[`Hand${side}`,hand]]){const e=new T.Euler().setFromQuaternion(q);set(name,e.x,e.y,e.z);}
   }
  }
  if(kind==='Hit'){set('Spine',-.25*hit);set('Head',-.2*hit);set('UpperArmR',.25*hit,0,-.1);}
  if(kind==='Death'){const d=T.MathUtils.smoothstep(u,0,.8);set('Root',-Math.PI/2*d);set('ThighR',-.25*d);set('ThighL',-.18*d);set('ShinR',.35*d);set('ShinL',.25*d);set('UpperArmR',0,0,-.5*d);set('UpperArmL',0,0,.65*d);set('Cape',0);}
  return p;
 };
 const durations={Idle:3,Walk:1,Run:.68,Attack:.65,Skill:1,Buff:1.1,Special:2,Hit:.4,Death:1.5};const clips=[];
 for(const [kind,duration] of Object.entries(durations)){const times=Array.from({length:25},(_,i)=>duration*i/24),tracks=[];for(const b of bones){const values=[];for(let i=0;i<times.length;i++){const e=pose(kind,i/24)[b.name]||[0,0,0];const q=new T.Quaternion().setFromEuler(new T.Euler(...e));values.push(...q.toArray());}tracks.push(new T.QuaternionKeyframeTrack(`${b.name}.quaternion`,times,values));}
  const pos=[];for(let i=0;i<25;i++){const u=i/24;const y=kind==='Death'?.23*T.MathUtils.smoothstep(u,0,.8):(kind==='Walk'||kind==='Run')?.018*(1-Math.cos(u*4*Math.PI)):0;pos.push(0,y,0);}tracks.push(new T.VectorKeyframeTrack('Root.position',times,pos));clips.push(new T.AnimationClip(kind,duration,tracks));}
 actor.userData={class:job,license:'Original project asset',style:'Low-poly',weaponSockets:['WeaponR','WeaponL'],animationPolicy:'In-place; gameplay owns world position'};
 const exporter=new GLTFExporter();const binary=await exporter.parseAsync(scene,{binary:true,animations:clips,onlyVisible:true});
 const path=`public/models/characters/${job.toLowerCase()}.glb`;await mkdir('public/models/characters',{recursive:true});await writeFile(path,Buffer.from(binary));
 let triangles=0,meshes=0;actor.traverse(o=>{if(o.isMesh){meshes++;triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});manifest.models.push({class:job,path:`/models/characters/${job.toLowerCase()}.glb`,bytes:binary.byteLength,triangles,meshes,bones:bones.length,clips:Object.keys(durations)});console.log(job,binary.byteLength,'bytes',triangles,'triangles');
}
await writeFile('public/models/characters/manifest.json',JSON.stringify(manifest,null,2));
