import fs from 'node:fs/promises';
import sharp from 'sharp';
const root='../output/map-gallery/maps-v2',results=[];
for(const id of (await fs.readdir(root)).filter(s=>/^(wild\d+|dungeon\d+)$/.test(s))){
 const p=JSON.parse(await fs.readFile(`${root}/${id}/map-plan.json`,'utf8'));
 const meta=await sharp(`${root}/${id}/overview.png`).metadata();
 results.push({id,overview:[meta.width,meta.height],artStatus:p.overviewArtStatus,groups:p.huntingGroups.length,monsters:p.huntingGroups.reduce((n,g)=>n+g.monsterCount,0),size:p.worldSizeM,props:'vector placeholder; numerical collision absent in original package'});
}
const tiles=[];
for(const name of await fs.readdir(`${root}/materials`))if(name.endsWith('.png')){
 const {data,info}=await sharp(`${root}/materials/${name}`).raw().toBuffer({resolveWithObject:true});
 let delta=0;for(let y=0;y<info.height;y++)for(let c=0;c<info.channels;c++)delta+=Math.abs(data[(y*info.width)*info.channels+c]-data[(y*info.width+info.width-1)*info.channels+c]);
 for(let x=0;x<info.width;x++)for(let c=0;c<info.channels;c++)delta+=Math.abs(data[x*info.channels+c]-data[((info.height-1)*info.width+x)*info.channels+c]);
 tiles.push({name,size:[info.width,info.height],meanOppositeEdgeDifference:delta/((info.width+info.height)*info.channels)});
}
await fs.writeFile('../output/maps-round23/source-asset-audit.json',JSON.stringify({maps:results,tiles},null,2));
console.log(JSON.stringify({maps:results.length,tiles},null,2));
