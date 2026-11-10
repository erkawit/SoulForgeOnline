import {farmPlan} from './farmLayout';
import type {Collider} from './colliders';
export type FarmScenery = {x:number;z:number;radius:number;kind:string;variant:number;rotation:number};
const themes:Record<string,string[]>={wild0:['grave','chapel'],wild1:['ribs','grave'],wild2:['mangrove','reeds'],wild3:['crystal','cart'],wild4:['statue','hedge'],wild5:['column','statue'],wild6:['warehouse','column'],wild7:['windmill','fence'],wild8:['thorn','totem'],wild9:['root','ribs'],dungeon1:['crystal','stalagmite'],dungeon2:['column','chapel'],dungeon3:['ribs','lava']};
const cache=new Map<string,FarmScenery[]>();
/** Solid islands between hunting courts, never on a road, plaza, entrance or monster leash area. */
export function farmScenery(id:string):FarmScenery[]{
 const old=cache.get(id);if(old)return old;
 const plan=farmPlan(id);if(!plan)return [];
 const items:FarmScenery[]=[];const kinds=themes[id];
 for(let x=-108;x<=108;x+=18)for(let z=-108;z<=108;z+=18){
  const n=(x+108)/18*13+(z+108)/18;
  if(Math.abs(x)<10||Math.abs(z)<10||Math.hypot(x,z)<25||Math.max(Math.abs(x),Math.abs(z))>106&&Math.min(Math.abs(x),Math.abs(z))>100)continue;
  if(plan.plazas.some(p=>Math.hypot(x-p.centerM[0],z-p.centerM[1])<p.diameterM/2+5))continue;
  if(plan.huntingGroups.some(g=>Math.hypot(x-g.positionM.x,z-g.positionM.y)<15))continue;
  items.push({x,z,radius:2,kind:kinds[n%kinds.length],variant:n%3,rotation:(n%8)*Math.PI/4});
 }
 cache.set(id,items);return items;
}
export const sceneryColliders=(id:string):Collider[]=>farmScenery(id).map(p=>({kind:'circle',x:p.x,z:p.z,r:p.radius}));
