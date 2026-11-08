import './registry';
import {walkable,WORLD_LIMIT,CITIES,type CityId} from '../content';
import {navigationSurface,NAVIGATION_CELL,type Surface} from './terrainNavigation';
import {onRoad} from './capitalPlan';

export const NAVIGATION_COLORS:Record<Surface,string>={blocked:'#a34957',ground:'#41926d',road:'#ebc77b',plaza:'#50c9c4'};
const cache=new Map<CityId,Record<Surface,string>>();
/** Horizontal run-length encoding keeps a .5 metre collision overlay small enough for SVG. */
export function navigationOverlay(city:CityId){
 const previous=cache.get(city);if(previous)return previous;
 const result:Record<Surface,string>={blocked:'',ground:'',road:'',plaza:''},lim=WORLD_LIMIT[city]??70,s=NAVIGATION_CELL;
 const sample=(x:number,z:number):Surface=>!walkable(city,x,z)?'blocked':CITIES[city].parent?navigationSurface(city,x,z):Math.hypot(x,z)<10?'plaza':onRoad(x,z)?'road':'ground';
 for(let z=-lim;z<lim;z+=s){
  let start=-lim,kind=sample(-lim+s/2,z+s/2);
  for(let x=-lim+s;x<=lim;x+=s){
   const next=x<lim?sample(x+s/2,z+s/2):null;
   if(next!==kind){result[kind]+=`M${start} ${z}h${x-start}v${s}h${start-x}Z`;start=x;if(next)kind=next;}
  }
 }
 cache.set(city,result);return result;
}
