import fs from 'node:fs';
import path from 'node:path';
const source=path.resolve('../output/map-gallery/maps-v2');
const plans={};
for(const id of fs.readdirSync(source).filter(s=>/^(wild\d+|dungeon\d+)$/.test(s))){
  plans[id]=JSON.parse(fs.readFileSync(path.join(source,id,'map-plan.json'),'utf8'));
}
fs.writeFileSync('src/game/world/farmPlans.json',JSON.stringify(plans,null,2));
fs.mkdirSync('public/art/farm/materials',{recursive:true});
for(const file of fs.readdirSync(path.join(source,'materials')))if(file.endsWith('.png'))fs.copyFileSync(path.join(source,'materials',file),path.join('public/art/farm/materials',file));
fs.copyFileSync('../Warp-Gate.png','public/art/farm/warp-gate.png');
console.log('Installed 13 numerical plans, shared seamless materials and original warp gate.');
