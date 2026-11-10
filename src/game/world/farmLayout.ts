import data from './farmPlans.json';
import type {Collider} from './colliders';
export type FarmPlan = typeof data.wild0;
export const farmPlan=(id:string):FarmPlan|undefined=>(data as Record<string,FarmPlan>)[id];
// The painting is a reference only. These measured layouts govern both rendering and physics.
export function farmHazards(id:string){
 const p=farmPlan(id);if(!p)return [];
 return [[-40,-40],[40,-40],[-40,40],[40,40],[-108,-108],[108,-108],[-108,108],[108,108]]
  .filter(([x,z])=>p.huntingGroups.every(g=>Math.hypot(x-g.positionM.x,z-g.positionM.y)>g.spawnRadiusM+10))
  .map(([x,z],i)=>({name:`${id}-hazard-${i}`,center:[x,z] as [number,number],radius:i<4?7:8}));
}
export function gatePillars(x:number,z:number):Collider[]{
 const angle=Math.atan2(-x,-z),dx=Math.cos(angle)*3.2,dz=-Math.sin(angle)*3.2;
 return [-1,1].map(s=>({kind:'circle',x:x+s*dx,z:z+s*dz,r:.65}));
}
