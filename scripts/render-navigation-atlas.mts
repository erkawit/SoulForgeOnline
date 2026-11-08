import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {CITIES,FIELD_ART,WORLD_LIMIT,portalsOf,walkable,type CityId,type MainCityId} from '../src/game/content.ts';
import {CAPITAL_PIECES} from '../src/game/world/capitalPlan.ts';
import {spawnPoints} from '../src/game/spawns.ts';
import {navigationOverlay,NAVIGATION_COLORS} from '../src/game/world/navigationOverlay.ts';
import {navigationPlan,NAVIGATION_CELL} from '../src/game/world/terrainNavigation.ts';
import {collidersOf} from '../src/game/world/colliders.ts';
import {cityToAtlas} from '../src/game/world/cityAtlas.ts';

const out=path.resolve('output/navigation');await fs.mkdir(out,{recursive:true});
const links:string[]=[];
for(const city of Object.keys(CITIES) as CityId[]){
 const c=CITIES[city],plan=navigationPlan(city),paths=navigationOverlay(city),lim=WORLD_LIMIT[city]??70;
 const project=(x:number,z:number)=>!c.parent?cityToAtlas(x,z):[500+(x-z)*232/lim,340+(x+z)*136/lim];
 const o=project(0,0),a=project(1,0),b=project(0,1),matrix=`matrix(${a[0]-o[0]} ${a[1]-o[1]} ${b[0]-o[0]} ${b[1]-o[1]} ${o[0]} ${o[1]})`;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="680"><g transform="${matrix}" opacity="${city==='wild2'?.52:.92}">${Object.entries(paths).map(([s,d])=>`<path fill="${NAVIGATION_COLORS[s as keyof typeof NAVIGATION_COLORS]}" d="${d}"/>`).join('')}</g>${portalsOf(city).map(g=>{const [x,y]=project(g.x,g.z);return `<circle cx="${x}" cy="${y}" r="6" fill="#96cfff" stroke="white"/>`}).join('')}${spawnPoints(city).map(p=>{const [x,y]=project(...p.position);return `<circle cx="${x}" cy="${y}" r="3" fill="#ffefce" stroke="#38272a"/>`}).join('')}</svg>`;
 let base=sharp({create:{width:1000,height:680,channels:4,background:'#11161c'}});
 if(city==='wild2')base=sharp('public/art/world/hollow/field-right.webp').resize(1000,680);
 await base.composite([{input:Buffer.from(svg)}]).png().toFile(path.join(out,city+'-navigation.png'));
 const size=Math.round(lim*2/NAVIGATION_CELL),mask=Buffer.alloc(size*size),rows:string[]=[];
 for(let z=0;z<size;z++){let row='';for(let x=0;x<size;x++){const ok=walkable(city,-lim+(x+.5)*NAVIGATION_CELL,-lim+(z+.5)*NAVIGATION_CELL);mask[z*size+x]=ok?255:0;row+=ok?'1':'0';}rows.push(row);}
 await sharp(mask,{raw:{width:size,height:size,channels:1}}).png().toFile(path.join(out,city+'-walkable-mask.png'));
 await fs.writeFile(path.join(out,city+'-navigation.json'),JSON.stringify({id:city,name:FIELD_ART[city]?.th??c.name,coordinates:{axes:'x right, z down (top-down), metres; image is isometric',origin:[-lim,-lim],cellSize:NAVIGATION_CELL,width:size,height:size,mask:'1 = walkable, 0 = blocked; cell centres; rows increase z, columns increase x'},plan:plan??{id:city,source:'capitalPlan.ts'},colliders:collidersOf(city),buildings:c.parent?c.buildings:CAPITAL_PIECES[city as MainCityId],gates:portalsOf(city),spawns:spawnPoints(city),walkableRows:rows},null,2));
 links.push(`<article><h2>${FIELD_ART[city]?.th??c.name} <small>${city}</small></h2><a href="${city}-navigation.png"><img src="${city}-navigation.png"></a><p><a href="${city}-navigation.json">ข้อมูลพื้นที่และพิกัด JSON</a> · <a href="${city}-walkable-mask.png">หน้ากากเดินได้ 280 × 280</a></p></article>`);
}
await fs.writeFile(path.join(out,'index.html'),`<!doctype html><meta charset="utf-8"><title>SoulForge — พื้นที่เดินได้</title><style>body{background:#10151b;color:#e4ddd0;font:16px system-ui;margin:24px}header{max-width:1000px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(440px,1fr));gap:20px}article{background:#202630;padding:16px;border-radius:12px}img{width:100%}h2{font-size:20px}small{color:#929fa8}a{color:#9bdccf}p{line-height:1.7}</style><header><h1>ผังพื้นที่เดินได้ — 16 แผนที่</h1><p>เหลือง = ทางเดิน/สะพาน · ฟ้าเขียว = ลาน · เขียว = พื้นเดินได้ · แดง = ห้ามเดิน<br>จุดฟ้า = วาร์ป · จุดขาว = จุดเกิดมอนสเตอร์</p><p>ทุกแผนที่ 140 × 140 เมตร ช่องละ 0.5 เมตร หน้ากาก PNG สีขาวเดินได้ สีดำห้ามเดิน รวมตัวอาคาร ต้นไม้ และหินแล้ว ใช้ JSON ดูพิกัดเพื่อจัดวาง Asset</p><p>หนองวิญญาณอ้างอิงแนวสะพานและลานในภาพต้นแบบ ส่วนพื้นที่ขยายอื่นแสดงผังที่ใช้ในเกมจริง ภาพภูมิภาคเก่าของพื้นที่เหล่านั้นยังไม่ใช่ผังชนที่ตรงกันทุกจุด</p></header><main>${links.join('')}</main>`);
console.log(`Exported ${links.length} navigation plans, collision masks and JSON files to ${out}`);
