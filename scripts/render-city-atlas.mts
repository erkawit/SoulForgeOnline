// Run from project with node --import tsx scripts/render-city-atlas.mts.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { CAPITAL_HALF, GATE_D, ISO_YAW, drawnPieces, inCanal, onRoad, viewIndex } from '../src/game/world/capitalPlan';
import { ATLAS_WIDTH, ATLAS_HEIGHT, cityToAtlas, atlasToCity } from '../src/game/world/cityAtlas';
import type { MainCityId } from '../src/game/content';

const width = 5000, ratio = width / ATLAS_WIDTH, height = ratio * ATLAS_HEIGHT;
const pixelScale = (cityToAtlas(1, -1)[0] - 500) * ratio / Math.SQRT2;
const colors = {
  hollow: [[51,47,48],[108,102,100]],
  dawnveil: [[72,77,57],[155,145,117]],
  thornwatch: [[49,61,48],[118,106,82]],
};
const ground = (city: MainCityId) => {
  const pixels = Buffer.alloc(width * height * 3);
  const [earth, road] = colors[city];
  let seed = 17;
  for (let y=0; y<height; y++) for (let u=0; u<width; u++) {
    const [x,z] = atlasToCity(u/ratio,y/ratio);
    const i = (y*width+u)*3;
    const edge = Math.max(Math.abs(x),Math.abs(z));
    if (edge > CAPITAL_HALF + 1) { pixels[i]=17; pixels[i+1]=16; pixels[i+2]=20; continue; }
    seed = (Math.imul(seed,1664525)+1013904223)>>>0;
    const paved = onRoad(x,z), canal = inCanal(city,x,z);
    const base = canal ? [44,79,80] : paved ? road : earth;
    const row = Math.floor(z/.55), a = (x/.88+(row&1)*.5+200)%1, b = (z/.55+200)%1;
    const joints = paved && !canal ? (a<.065||b<.085?-18:b<.17?7:0) : 0;
    const light = Math.sin(x*.37+Math.cos(z*.45)*2)*Math.cos(z*.42)*3 + Math.sin(x*1.8-z*.61)*Math.cos(x*.28+z*.83)*2 + (seed/4294967296-.5)*10 + joints;
    for(let ch=0;ch<3;ch++) pixels[i+ch]=base[ch]+light;
  }
  return pixels;
};
async function render(city: MainCityId) {
  const layers: {depth:number; input:Buffer; left:number; top:number}[] = [];
  const pieces = drawnPieces(city);
  for(const p of pieces) {
    const view = viewIndex(ISO_YAW,p.facing);
    const w = Math.max(2,Math.round(p.w*pixelScale));
    const {data,info} = await sharp(join('public/art/kit',city,p.piece+'-'+view+'.webp')).resize({width:w}).png().toBuffer({resolveWithObject:true});
    const [u,v] = cityToAtlas(p.x,p.z);
    const baseline = v*ratio + p.depth*pixelScale/Math.sqrt(3);
    if (p.role || p.landmark) {
      const rx=Math.round(w*.65), ry=Math.round(rx*.54);
      const yard=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${rx*2+2}" height="${ry*2+2}"><defs><pattern id="p" width="16" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-26)"><rect width="16" height="9" fill="#504a48"/><path d="M0 0H16M0 0V4.5H16M8 4.5V9" stroke="#383535" fill="none"/></pattern></defs><ellipse cx="${rx+1}" cy="${ry+1}" rx="${rx}" ry="${ry}" fill="url(#p)" stroke="#72685d" stroke-width="2"/></svg>`);
      layers.push({depth:-900,input:yard,left:Math.round(u*ratio-rx),top:Math.round(v*ratio-ry)});
    }
    layers.push({depth:p.under?-1000:p.x+p.z,input:data,left:Math.round(u*ratio-w/2),top:Math.round(baseline-info.height)});
  }
  // Single masonry perimeter. The four openings coincide with the world's corner gates.
  for(const side of [-1,1]) for(const axis of [0,1]) {
    const stop = GATE_D*1.06-5;
    for(let t=-stop;t<stop;t+=3) {
      const end=Math.min(stop,t+3);
      const pt=(a:number,b:number)=>axis===0?cityToAtlas(a,b):cityToAtlas(b,a);
      const [x1,y1]=pt(t,side*CAPITAL_HALF),[x2,y2]=pt(end,side*CAPITAL_HALF);
      const x=Math.floor(Math.min(x1,x2)*ratio)-2, y=Math.floor((Math.min(y1,y2)-9)*ratio)-2;
      const ax=x1*ratio-x, bx=x2*ratio-x, ay=y1*ratio-y, by=y2*ratio-y;
      const wall=city==='dawnveil'?'#827a6c':city==='thornwatch'?'#514b3e':'#55515b';
      const tile=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(Math.max(ax,bx))+3}" height="${Math.ceil(Math.max(ay,by))+3}"><path d="M${ax} ${ay} L${bx} ${by} v-32 L${ax} ${ay-32}Z" fill="${wall}" stroke="#353137" stroke-width="2"/><path d="M${ax} ${ay-32} L${bx} ${by-32}" stroke="#a0998b" stroke-width="4"/><path d="M${ax} ${ay-15} L${bx} ${by-15}" stroke="#302e30" stroke-width="2"/></svg>`);
      layers.push({depth:(t+end)/2+side*CAPITAL_HALF,input:tile,left:x,top:y});
    }
  }
  await mkdir('public/art/atlas',{recursive:true});
  await sharp(ground(city),{raw:{width,height,channels:3}}).composite(layers.sort((a,b)=>a.depth-b.depth).map(({input,left,top})=>({input,left,top}))).webp({quality:91}).toFile('public/art/atlas/'+city+'.webp');
}
for(const city of ['hollow','dawnveil','thornwatch'] as const) await render(city);
