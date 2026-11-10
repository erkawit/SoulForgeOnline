import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const root=path.resolve('../output/claude-map-ground-v1'),manifest=JSON.parse(await fs.readFile(path.join(root,'manifest.json'),'utf8')),checks=[];
for(const map of manifest.maps){
 const dir=path.join(root,map.id),master=await sharp(path.join(dir,map.ground)).raw().toBuffer({resolveWithObject:true});
 assert.equal(master.info.width,4096);assert.equal(master.info.height,4096);assert.equal(master.info.channels,3);
 const merged=await sharp({create:{width:4096,height:4096,channels:3,background:'#000'}}).composite(map.tiles.map((t:any)=>({input:path.join(dir,t.file),left:t.rectPixels[0],top:t.rectPixels[1]}))).removeAlpha().raw().toBuffer();
 assert.ok(master.data.equals(merged),`${map.id} tile reconstruction differs`);
 const current=await sharp(path.join(dir,'walkable-mask.png')).removeAlpha().greyscale().raw().toBuffer();
 const original=await sharp(`../output/maps-round23/${map.id}/walkable-mask.png`).removeAlpha().greyscale().raw().toBuffer();assert.ok(current.equals(original),`${map.id} collision mismatch`);
 const surface=await sharp(path.join(dir,'surface-mask.png')).raw().toBuffer();
 let illegal=0;for(let i=0;i<surface.length;i+=4)if(surface[i]+surface[i+1]+surface[i+2]>255)illegal++;
 assert.equal(illegal,0);
 const webp=await sharp(path.join(dir,map.web)).metadata();assert.equal(webp.width,4096);assert.equal(webp.height,4096);
 checks.push({id:map.id,dimensions:[4096,4096],tileReconstructionExact:true,collisionIdenticalToGameExport:true,exclusiveSurfaceClasses:true,masterBytes:(await fs.stat(path.join(dir,map.ground))).size,webBytes:(await fs.stat(path.join(dir,map.web))).size});
}
await fs.writeFile(path.join(root,'validation.json'),JSON.stringify({checkedAt:new Date().toISOString(),maps:checks.length,checks,notes:'File/data verification. Example component is supplied for Claude integration; the current game renderer was not changed by this package.'},null,2));
console.log(`PASS ${checks.length} maps: dimensions, exact tile reconstruction, collision parity, surface channels, WebP dimensions`);
