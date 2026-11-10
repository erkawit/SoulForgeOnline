import './world/registry';
import {farmPlan} from './world/farmLayout';
import {CITIES, FIELD_ART, portalsOf, walkable, homePoint, type CityId} from './content';
import {mapRoute} from './world/mapRoute';
import {ZONES} from './world/zones';

export type SpawnPoint = {
 id:string; index:number; position:[number,number]; name:string; level:number;
 elite:boolean; boss:boolean; respawnSeconds:number;
};

// Shared by the map and combat: each marker is one actual monster home.
export function spawnPoints(city:CityId):SpawnPoint[]{
 const c=CITIES[city],levels=c.monsterLevels??[1,5,10];
 const capitalSpecies = city==='dawnveil'?CITIES.wild2.species:city==='thornwatch'?CITIES.wild1.species:CITIES.wild0.species;
 const species=c.species??capitalSpecies!;
 const farm=farmPlan(city);
 if(farm){let index=0;return farm.huntingGroups.flatMap(g=>Array.from({length:g.monsterCount},(_,k)=>{
   const a=k*Math.PI*2/g.monsterCount,r=3;
   const position:[number,number]=[g.positionM.x+Math.cos(a)*r,g.positionM.y+Math.sin(a)*r];
   const n=index++,boss=(!!c.dungeon||city==='wild0')&&n===149;
   const legacyElite=city==='wild0'?[34,69,104,139].indexOf(n):-1;
   const veteran=legacyElite>=0?ZONES[legacyElite].spawns.find(s=>s.elite):undefined;
   return {id:`${city}-${g.groupId}-${k}`,index:n,position,name:veteran?.species??(city==='wild0'&&boss?'Grave Marshal':species[boss?2:n%(c.dungeon?2:3)]),level:veteran?.level??(boss?levels.at(-1)!:levels[n%levels.length]),elite:!!c.dungeon||boss||!!veteran,boss,respawnSeconds:boss?300:veteran?45:8};
 }));}
 const town:SpawnPoint[]=c.hunt.map(([x,z],index)=>{
  const boss=!!c.dungeon&&index===c.hunt.length-1;
  return {id:`${city}-${index}`,index,position:[x,z],name:species[boss?2:index%(c.dungeon?2:3)],
   level:boss?levels.at(-1)!:levels[index%levels.length],elite:!!c.dungeon,boss,respawnSeconds:boss?300:8};
 });
 // the Sorrowlands ruins lie in Ashen Outskirts, the field below Hollow Reach's south gate
 return city==='wild0'?[...town,...sorrowlandSpawns(town.length)]:town;
}
/** the ruined farming grounds of Ashen Outskirts (wild0, world/zones.ts): packs spread around each spawn, one elite per zone, the cathedral boss */
const clearSpawnCache = new Map<string,[number,number]>();
function clearRuinsSpawn(x:number,z:number):[number,number]{
 const key=x+','+z, cached=clearSpawnCache.get(key);
 if(cached)return cached;
 let point:[number,number]=[x,z];
 if(!walkable('wild0',x,z)){
  search: for(let radius=.5;radius<=12;radius+=.5) for(let i=0;i<24;i++){
   const angle=i*Math.PI/12,candidate:[number,number]=[+(x+Math.cos(angle)*radius).toFixed(2),+(z+Math.sin(angle)*radius).toFixed(2)];
   if(walkable('wild0',...candidate) && mapRoute('wild0',homePoint('wild0'),candidate,.1)){point=candidate;break search;}
  }
 }
 clearSpawnCache.set(key,point);
 return point;
}
export function sorrowlandSpawns(start=0):SpawnPoint[]{
 const out:SpawnPoint[]=[];let n=start;
 for(const z of ZONES)for(const s of z.spawns)for(let k=0;k<(s.count??1);k++){
  const a=k*2.399+n*.7,r=s.count?1.1+(k%3)*.9:0;
  out.push({id:`wild0-z-${z.id}-${n}`,index:n++,position:clearRuinsSpawn(+(s.x+Math.cos(a)*r).toFixed(2),+(s.z+Math.sin(a)*r).toFixed(2)),name:s.species,level:s.level+(k%2),elite:!!s.elite||!!s.boss,boss:!!s.boss,respawnSeconds:s.boss?300:s.elite?45:10});
 }
 return out;
}
const GATE_TH={top:'เหนือ',bottom:'ใต้',left:'ตะวันตก',right:'ตะวันออก'} as const;
/** Ranger Kestrel's hunting board. In a capital (no monsters inside the walls): the field behind each corner waygate with its
 *  level band. In a field: where the monsters roam, grouped by spot, with a compass direction. */
export function huntingGrounds(city:CityId){
 if(!CITIES[city].parent)return portalsOf(city).filter(p=>p.kind==='field').map(p=>{const t=CITIES[p.to],[a,b]=t.levels??[1,1];
  return {name:`${t.name} · ${FIELD_ART[p.to]?.th??''} · Lv ${a}${b>a?'–'+b:''}`,level:a,x:p.x,z:p.z,dir:'ประตู'+GATE_TH[p.dir],dist:Math.round(Math.hypot(p.x,p.z))};}).sort((a,b)=>a.level-b.level);
 const dir=(x:number,z:number)=>{const a=(Math.atan2(x,-z)*180/Math.PI+360)%360;return ['เหนือ','ตะวันออกเฉียงเหนือ','ตะวันออก','ตะวันออกเฉียงใต้','ใต้','ตะวันตกเฉียงใต้','ตะวันตก','ตะวันตกเฉียงเหนือ'][Math.round(a/45)%8];};
 return spawnPoints(city).filter(p=>!p.elite||city==='wild0').map(p=>({name:p.name,level:p.level,x:p.position[0],z:p.position[1],dir:dir(p.position[0],p.position[1]),dist:Math.round(Math.hypot(p.position[0],p.position[1]))})).sort((a,b)=>a.level-b.level||a.dist-b.dist);
}
