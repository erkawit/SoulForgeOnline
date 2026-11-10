import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {ZONE_IDS,DUNGEON_IDS,portalsOf,walkable,homePoint} from '../src/game/content';
import {farmPlan} from '../src/game/world/farmLayout';
import {navigationPlan} from '../src/game/world/terrainNavigation';
import {collidersOf} from '../src/game/world/colliders';
import {spawnPoints} from '../src/game/spawns';
import {farmScenery} from '../src/game/world/farmScenery';
import {natureLayout} from '../src/game/world/layout';
const out=path.resolve('../output/maps-round23');await fs.mkdir(out,{recursive:true});
const warp=(await fs.readFile('public/art/farm/warp-gate.png')).toString('base64');
const links:string[]=[],results=[];
for(const id of [...ZONE_IDS,...DUNGEON_IDS]){
 const p=farmPlan(id)!,nav=navigationPlan(id)!,spawns=spawnPoints(id),gates=portalsOf(id),nature=natureLayout(id);
 walkable(id,0,0);const colliders=collidersOf(id),size=480,mask=Buffer.alloc(size*size);let open=0;
 for(let z=0;z<size;z++)for(let x=0;x<size;x++)if(walkable(id,-120+(x+.5)*.5,-120+(z+.5)*.5)){mask[z*size+x]=255;open++;}
 const dir=path.join(out,id);await fs.mkdir(dir,{recursive:true});
 await sharp(mask,{raw:{width:size,height:size,channels:1}}).png().toFile(path.join(dir,'walkable-mask.png'));
 const texture=(await fs.readFile(`public/art/farm/materials/tile-${p.materials[0]}.png`)).toString('base64');
 const project=(x:number,z:number)=>[500+(x-z)*232/120,340+(x+z)*136/120];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1024" viewBox="0 0 1000 680"><rect width="1000" height="680" fill="#090c10"/><defs><pattern id="floor" width="8" height="8" patternUnits="userSpaceOnUse"><image href="data:image/png;base64,${texture}" width="8" height="8"/></pattern></defs><g transform="matrix(${232/120} ${136/120} ${-232/120} ${136/120} 500 340)"><rect x="-120" y="-120" width="240" height="240" fill="url(#floor)"/>
 ${nav.paths.map(r=>`<polyline points="${r.points.map(p=>p.join(',')).join(' ')}" stroke="#72634e" stroke-width="${r.width}" fill="none"/>`).join('')}
 ${nav.plazas.map(a=>'center' in a?`<circle cx="${a.center[0]}" cy="${a.center[1]}" r="${a.radius}" fill="#4c4b49" stroke="#6c6759" stroke-width=".4"/>`:'').join('')}
 ${nav.forbidden.map(a=>'center'in a?`<circle cx="${a.center[0]}" cy="${a.center[1]}" r="${a.radius}" fill="${nav.blockedColor}" stroke="#53635d" stroke-width=".7"/>`:'').join('')}
 ${nature.trees.map(t=>`<circle cx="${t.x}" cy="${t.z}" r="${t.s*1.4}" fill="#1c2825" stroke="#586051" stroke-width=".4"/>`).join('')}
 ${colliders.map(c=>c.kind==='circle'?`<circle cx="${c.x}" cy="${c.z}" r="${c.r}" fill="#756c66"/>`:`<rect x="${c.x-c.hw}" y="${c.z-c.hd}" width="${c.hw*2}" height="${c.hd*2}" fill="#756c66" transform="rotate(${-(c.rot??0)*180/Math.PI} ${c.x} ${c.z})"/>`).join('')}
 ${p.huntingGroups.map(g=>`<circle cx="${g.positionM.x}" cy="${g.positionM.y}" r="6" fill="none" stroke="#c2a573" stroke-width=".35"/>`).join('')}
 ${spawns.map(s=>`<circle cx="${s.position[0]}" cy="${s.position[1]}" r=".65" fill="${s.boss?'#ff8069':'#d3b688'}"/>`).join('')}
 </g>${gates.map(g=>{const [x,y]=project(g.x,g.z);return `<image href="data:image/png;base64,${warp}" x="${x-23}" y="${y-43}" width="46" height="46"/>`}).join('')}</svg>`;
 await fs.writeFile(path.join(dir,'overview-runtime.svg'),svg);
 await sharp(Buffer.from(svg)).png().toFile(path.join(dir,'overview-runtime.png'));
 const publicDir=`public/art/farm/${id}`;await fs.mkdir(publicDir,{recursive:true});
 await sharp(Buffer.from(svg)).webp({quality:85}).toFile(`${publicDir}/overview-runtime.webp`);
 const stats={id,name:p.nameTh,worldSizeM:[240,240],groups:30,monsters:spawns.length,walkableFraction:open/(size*size),solidProps:colliders.length,artStatus:p.overviewArtStatus};results.push(stats);
 await fs.writeFile(path.join(dir,'runtime-map.json'),JSON.stringify({...stats,coordinates:'x east, z south, metres; origin center',mask:{file:'walkable-mask.png',origin:[-120,-120],cellSizeM:.5,size:[480,480],white:'walkable body center',black:'blocked'},home:homePoint(id),navigation:nav,gates,colliders,scenery:farmScenery(id),spawns,sourcePlan:p},null,2));
 links.push(`<article><h2>${id} · ${p.nameTh}</h2><a href="${id}/overview-runtime.png"><img src="${id}/overview-runtime.png"></a><p>เดินได้ ${(stats.walkableFraction*100).toFixed(2)}% · สิ่งกีดขวาง ${colliders.length} ชิ้น · <a href="${id}/runtime-map.json">พิกัดเกม</a> · <a href="${id}/walkable-mask.png">หน้ากากการชน</a></p></article>`);
}
await fs.writeFile(path.join(out,'validation.json'),JSON.stringify(results,null,2));
await fs.writeFile(path.join(out,'index.html'),`<!doctype html><html lang="th"><meta charset="utf-8"><title>Round 23 — แผนที่และการชน</title><style>body{background:#10151a;color:#d9d7ce;font:16px system-ui;margin:30px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:20px}article{background:#1c2429;padding:18px;border-radius:10px}img{width:100%}a{color:#84dfce}h2{font-size:20px}</style><h1>ROUND 23 · 13 แผนที่</h1><p>ผังเชิงเทคนิคจากข้อมูลเกมจริง 240 × 240 เมตร · 30 กลุ่ม / 150 ตัว · วงทอง = จุดล่า · เสาวาร์ป = ทางเข้าออก</p><p>ภาพนี้แสดงตำแหน่งจริง ไม่ใช่ภาพวาดสำเร็จ · ภาพเก่าบางธีมยังเป็น placeholder · ทดสอบการเชื่อมต่อ/วาร์ป 100 clients แล้ว (ยังไม่ได้วัด GPU และการต่อสู้พร้อมกัน)</p><p><a href="http://localhost:3002/farm-preview">เปิดพรีวิว 3D (ต้องเปิดเซิร์ฟเวอร์เกม)</a></p><main>${links.join('')}</main></html>`);
console.log(`Exported 13 maps to ${out}`);
