import data from './farmPlans.json';
import type {Collider} from './colliders';
export type FarmPlan = typeof data.wild0;
export const farmPlan=(id:string):FarmPlan|undefined=>(data as Record<string,FarmPlan>)[id];
// The painting is a reference only. These measured layouts govern both rendering and physics.
/** round 26: how far (m) a point is from the edge of the nearest road or plaza of a field (negative = on it) */
export function clearance(p:FarmPlan,x:number,z:number,extra:[number,number][][]=[]){
 let best=Infinity;
 const seg=(pts:number[][],w:number)=>{for(let i=1;i<pts.length;i++){const [ax,az]=pts[i-1],[bx,bz]=pts[i],dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));best=Math.min(best,Math.hypot(x-ax-t*dx,z-az-t*dz)-w/2);}};
 for(const r of p.roads)seg(r.pointsM,r.widthM);for(const e of extra)seg(e,10);
 for(const q of p.plazas)best=Math.min(best,Math.hypot(x-q.centerM[0],z-q.centerM[1])-q.diameterM/2);
 return best;
}
export function farmHazards(id:string){
 const p=farmPlan(id);if(!p)return [];
 return [[-40,-40],[40,-40],[-40,40],[40,40],[-108,-108],[108,-108],[-108,108],[108,108]]
  .filter(([x,z])=>p.huntingGroups.every(g=>Math.hypot(x-g.positionM.x,z-g.positionM.y)>g.spawnRadiusM+10))
  // round 26: never a hole across a road or a plaza
  .filter(([x,z],i)=>clearance(p,x,z)>(i<4?7:8)+2)
  .map(([x,z],i)=>({name:`${id}-hazard-${i}`,center:[x,z] as [number,number],radius:i<4?7:8}));
}
export function gatePillars(x:number,z:number):Collider[]{
 const angle=Math.atan2(-x,-z),dx=Math.cos(angle)*3.2,dz=-Math.sin(angle)*3.2;
 return [-1,1].map(s=>({kind:'circle',x:x+s*dx,z:z+s*dz,r:.65}));
}
