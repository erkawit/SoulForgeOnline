/** Bake the game's native ground renderer to orthographic textures, not the concept paintings. */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import '../src/game/world/registry';
import {ZONE_IDS,DUNGEON_IDS,walkable} from '../src/game/content';
import {farmPlan} from '../src/game/world/farmLayout';
import {navigationSurface,navigationPlan} from '../src/game/world/terrainNavigation';
const root=path.resolve('../output/claude-map-ground-v1'),N=4096,C=480,T=1024;
await fs.mkdir(root,{recursive:true});
await fs.cp('public/art/farm/materials',path.join(root,'materials'),{recursive:true});
await fs.copyFile('public/art/farm/warp-gate.png',path.join(root,'warp-gate.png'));
const materials:Record<string,Buffer>={};
for(const f of await fs.readdir('public/art/farm/materials'))if(f.endsWith('.png'))materials[f.slice(5,-4)]=await sharp(`public/art/farm/materials/${f}`).removeAlpha().raw().toBuffer();
const manifest:any={version:1,worldSizeM:[240,240],textureSize:[N,N],pixelsPerMetre:N/240,coordinates:{topLeft:[-120,-120],bottomRight:[120,120],columnAxis:'+x',rowAxis:'+z',pixelCenter:'x=-120+(column+0.5)*240/width; z=-120+(row+0.5)*240/height',threePlaneUV:'u=(x+120)/240; v=(120-z)/240; TextureLoader flipY=true'},mask:{size:[480,480],cellSizeM:.5,surfaceChannels:'R road; G plaza; B terrain hazard; A 255. Linear data, no sRGB.',collision:'walkable-mask.png: white body center walkable; black blocked, includes props. NearestFilter, no mipmaps.'},maps:[]};
const previews:Buffer[]=[];
for(const id of [...ZONE_IDS,...DUNGEON_IDS]){
 const p=farmPlan(id)!,dir=path.join(root,id);await fs.mkdir(dir,{recursive:true});
 const names=[p.materials[0],p.materials.find(m=>m!==p.materials[0]&&m!=='dirt-road'&&m!=='flagstone')??'rocky','dirt-road','flagstone'];
 const tex=names.map(n=>materials[n]);if(tex.some(t=>!t||t.length!==T*T*3))throw Error(`${id}: invalid source material`);
 const control=Buffer.alloc(C*C*4),collision=Buffer.alloc(C*C);
 for(let z=0;z<C;z++)for(let x=0;x<C;x++){const s=navigationSurface(id,-120+(x+.5)*.5,-120+(z+.5)*.5),k=(z*C+x)*4;control[k]=s==='road'?255:0;control[k+1]=s==='plaza'?255:0;control[k+2]=s==='blocked'?255:0;control[k+3]=255;collision[z*C+x]=walkable(id,-120+(x+.5)*.5,-120+(z+.5)*.5)?255:0;}
 const pixels=Buffer.alloc(N*N*3),hazard=id==='wild2'||id==='wild6'?[23,62,57]:[25,23,29];
 // The same 8 metre material repeat and large-scale blend as FarmGround.tsx.
 // Precompute axis mapping; the control texture is bilinearly sampled at cell centres.
 const axis=Array.from({length:N},(_,i)=>{const w=-120+(i+.5)*240/N,g=(i+.5)*C/N-.5,a=Math.floor(g);return {w,t:Math.floor(((w/8%1+1)%1)*T)%T,a:Math.max(0,Math.min(C-1,a)),b:Math.max(0,Math.min(C-1,a+1)),f:g-a};});
 for(let y=0;y<N;y++){const z=axis[y];for(let x=0;x<N;x++){const a=axis[x],k=(y*N+x)*3,t=(z.t*T+a.t)*3;
  const weights=[0,1,2].map(c=>{const top=control[(z.a*C+a.a)*4+c]*(1-a.f)+control[(z.a*C+a.b)*4+c]*a.f,bottom=control[(z.b*C+a.a)*4+c]*(1-a.f)+control[(z.b*C+a.b)*4+c]*a.f;return (top*(1-z.f)+bottom*z.f)/255;});
  const detail=(.5+.5*Math.sin(a.w*.07)*Math.sin(z.w*.09))*.4;
  for(let c=0;c<3;c++){let v=tex[0][t+c]*(1-detail)+tex[1][t+c]*detail;v=v*(1-weights[0])+tex[2][t+c]*weights[0];v=v*(1-weights[1])+tex[3][t+c]*weights[1];pixels[k+c]=Math.round(v*(1-weights[2])+hazard[c]*weights[2]);}
 }}
 const raw={raw:{width:N,height:N,channels:3 as const}};
 await sharp(pixels,raw).png().toFile(path.join(dir,'ground-basecolor-4096.png'));
 await sharp(pixels,raw).webp({quality:94}).toFile(path.join(dir,'ground-basecolor-4096.webp'));
 const preview=await sharp(pixels,raw).resize(768).png().toBuffer();await fs.writeFile(path.join(dir,'preview.png'),preview);previews.push(preview);
 const tiles=[];
 for(let row=0;row<2;row++)for(let col=0;col<2;col++){const file=`ground-r${row}-c${col}-2048.png`;await sharp(pixels,raw).extract({left:col*2048,top:row*2048,width:2048,height:2048}).png().toFile(path.join(dir,file));tiles.push({file,rectPixels:[col*2048,row*2048,2048,2048],worldMin:[-120+col*120,-120+row*120],worldMax:[col*120,row*120]});}
 await sharp(control,{raw:{width:C,height:C,channels:4}}).png().toFile(path.join(dir,'surface-mask.png'));
 await sharp(collision,{raw:{width:C,height:C,channels:1}}).png().toFile(path.join(dir,'walkable-mask.png'));
 const runtime=JSON.parse(await fs.readFile(`../output/maps-round23/${id}/runtime-map.json`,'utf8'));
 await fs.writeFile(path.join(dir,'runtime-map.json'),JSON.stringify(runtime,null,2));
 const pt=(v:number)=>(v+120)/240*1024;
 const overlay=`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><image href="preview.png" width="1024" height="1024"/>${runtime.gates.map((g:any)=>`<circle cx="${pt(g.x)}" cy="${pt(g.z)}" r="10" fill="none" stroke="#00ffff" stroke-width="3"/>`).join('')}${runtime.spawns.map((s:any)=>`<circle cx="${pt(s.position[0])}" cy="${pt(s.position[1])}" r="2.5" fill="${s.boss?'red':'#ffe08a'}"/>`).join('')}</svg>`;
 await fs.writeFile(path.join(dir,'alignment-debug.svg'),overlay);
 const meta=await sharp(`../output/map-gallery/maps-v2/${id}/overview.png`).metadata();
 manifest.maps.push({id,name:p.nameTh,ground:'ground-basecolor-4096.png',web:'ground-basecolor-4096.webp',materials:names,repeatMetres:8,tiles,original:{size:[meta.width,meta.height],status:p.overviewArtStatus,use:'concept/minimap only; oblique painting, not a calibrated ground texture'},hazards:navigationPlan(id)!.forbidden.length});
 console.log(`Baked ${id}`);
}
await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2));
await sharp({create:{width:1536,height:1920,channels:3,background:'#10151a'}}).composite(await Promise.all(previews.map(async(p,i)=>({input:await sharp(p).resize(384).toBuffer(),left:i%4*384,top:Math.floor(i/4)*480+48})))).png().toFile(path.join(root,'ground-contact-sheet.png'));
await fs.writeFile(path.join(root,'index.html'),`<!doctype html><meta charset="utf-8"><title>Ground handoff — 13 maps</title><style>body{background:#111820;color:#ddd;font:16px system-ui;margin:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}img{width:100%}a{color:#9de1db}</style><h1>พื้นเกม 240 × 240 เมตร · 13 แผนที่</h1><p>ภาพมองตรงจากด้านบนจากข้อมูลเกม ไม่ใช่ภาพ concept มุมเอียง · ถนนและลานตรงกับ runtime · วัตถุ/เสาวาร์ปวางแยก</p><main>${manifest.maps.map((m:any)=>`<article><h2>${m.id} · ${m.name}</h2><a href="${m.id}/${m.ground}"><img src="${m.id}/preview.png"></a><p><a href="${m.id}/alignment-debug.svg">ตรวจจุดเกิด/วาร์ป</a></p></article>`).join('')}</main>`);
console.log(root);
