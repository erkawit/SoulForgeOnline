/** Authoritative terrain footprints, in world metres. Shared by client and realm.
 * Solid props/buildings are applied afterwards by content.walkable().
 * Nothing outside the listed paths/plazas is traversable on closed plans.
 */
import {farmPlan,farmHazards} from './farmLayout';
export type GroundPoint = [number,number];
export type Surface = 'blocked'|'ground'|'road'|'plaza';
export type LandArea = {name:string; points:GroundPoint[]} | {name:string; center:GroundPoint; radius:number};
export type WalkPath = {name:string; points:GroundPoint[]; width:number};
export type NavigationPlan = {
  id:string; openGround:boolean; blockedName:string; blockedColor:string;
  paths:WalkPath[]; plazas:LandArea[]; forbidden:LandArea[];
};
export const NAVIGATION_CELL=.5;
const plans = new Map<string,NavigationPlan>();
const cells = new Map<string,Map<number,Surface>>();
export const navigationPlan=(id:string)=>plans.get(id);
export function insideArea(area:LandArea,x:number,z:number){
  if('center' in area)return (x-area.center[0])**2+(z-area.center[1])**2<=area.radius**2;
  let inside=false;const p=area.points;
  for(let i=0,j=p.length-1;i<p.length;j=i++){
    const [ax,az]=p[i],[bx,bz]=p[j];
    if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;
  }
  return inside;
}
function onPath(p:WalkPath,x:number,z:number){
  for(let i=1;i<p.points.length;i++){
    const [ax,az]=p.points[i-1],[bx,bz]=p.points[i],dx=bx-ax,dz=bz-az;
    const t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz||1)));
    if((x-ax-t*dx)**2+(z-az-t*dz)**2<=(p.width/2)**2)return true;
  }
  return false;
}
/** Quantisation is deliberate: the physical floor and collision use identical .5 m cells. */
export function navigationSurface(id:string,x:number,z:number):Surface{
  const half=farmPlan(id)?120:70;
  if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>half||Math.abs(z)>half)return 'blocked';
  const plan=plans.get(id);if(!plan)return 'ground';
  const ix=Math.floor((x+half)/NAVIGATION_CELL),iz=Math.floor((z+half)/NAVIGATION_CELL),key=ix*481+iz;
  const cache=cells.get(id)!;const found=cache.get(key);if(found)return found;
  const cx=-half+(ix+.5)*NAVIGATION_CELL,cz=-half+(iz+.5)*NAVIGATION_CELL;
  const value:Surface=plan.forbidden.some(a=>insideArea(a,cx,cz))?'blocked':
    plan.plazas.some(a=>insideArea(a,cx,cz))?'plaza':plan.paths.some(p=>onPath(p,cx,cz))?'road':plan.openGround?'ground':'blocked';
  cache.set(key,value);return value;
}
// Calibration of the 1280 x 853 field paintings to the existing region-map diamond.
export function fieldImagePoint(u:number,v:number):GroundPoint{
  const a=(u/1280*1000-500)*70/232,b=(v/853*680-340)*70/136;
  return [(a+b)/2,(b-a)/2];
}
const imageArea=(name:string,points:GroundPoint[]):LandArea=>({name,points:points.map(([u,v])=>fieldImagePoint(u,v))});
const imagePath=(name:string,width:number,points:GroundPoint[]):WalkPath=>({name,width,points:points.map(([u,v])=>fieldImagePoint(u,v))});
/** Hand-authored dry courtyards and bridges of หนองวิญญาณ. Green water is blocked by default.
 * Polygons intentionally stop short of the chapel walls and shoreline, not colour-thresholded.
 */
function swampPlan():NavigationPlan{
  return {id:'wild2',openGround:false,blockedName:'หนองน้ำ / ริมตลิ่ง / สิ่งกีดขวาง',blockedColor:'#17473a',forbidden:[],
    plazas:[
      {name:'ลานทางแยก',center:fieldImagePoint(640,440),radius:4},
      imageArea('ลานตะวันตก',[[335,332],[403,293],[467,316],[495,354],[477,380],[408,372],[371,350]]),
      imageArea('ลานอารามเหนือ',[[596,181],[632,163],[683,172],[702,193],[665,215],[620,208]]),
      imageArea('ลานตะวันออก',[[917,416],[977,389],[1034,407],[1060,448],[1027,480],[963,467]]),
      imageArea('ลานใต้',[[562,590],[604,568],[658,562],[681,580],[730,570],[790,598],[778,624],[718,638],[639,629]]),
    ],
    paths:[
      imagePath('สะพานประตูตะวันตก',4.5,[[92,426],[120,426],[175,408],[261,407],[289,386],[305,361],[350,339]]),
      imagePath('ทางลานตะวันตกสู่ทางแยก',4,[[432,347],[468,378],[523,389],[567,396],[596,425],[638,449]]),
      imagePath('ทางเหนือและสะพานอาราม',4,[[638,449],[690,429],[721,403],[747,366],[748,335],[728,309],[658,279],[605,252],[589,229],[607,207],[632,187]]),
      imagePath('สะพานตะวันออก',4,[[747,366],[808,373],[859,377],[911,400],[966,435]]),
      imagePath('ทางลงลานใต้',4,[[638,449],[646,490],[656,536],[668,571],[694,605]]),
      imagePath('ทางวนริมหนองตะวันตก',3.5,[[289,386],[281,420],[316,456],[363,474],[409,497],[438,531],[447,564],[482,588],[533,601],[585,598]]),
    ]};
}
export const SWAMP_SPAWNS:GroundPoint[]=[
  [376,329],[427,337],[465,352],[626,186],[671,190],
  [966,425],[1017,443],[609,593],[683,608],[749,601],
].map(([u,v])=>fieldImagePoint(u,v));
const BIOMES:Record<string,[string,string,number]>={
  wild0:['หน้าผา / ซากกำแพง','#29262c',12],wild1:['พงรก / แนวหิน','#192b21',12],
  wild3:['รอยแยกเหมือง','#232c2b',11],wild4:['คูน้ำ / สวนปิด','#1a3840',13],
  wild5:['เหว / น้ำแข็งแตก','#344d60',11],wild6:['คลอง / กำแพงป้อม','#173e47',11],
  wild7:['คูน้ำ / พื้นดินยุบ','#293e35',14],wild8:['ป่าทึบ / รากไม้','#202f21',12],
  wild9:['หุบเหว / รากมังกร','#211d25',11],
  dungeon1:['ผนังถ้ำ / เหว','#151d21',10],dungeon2:['ผนังวิหาร / เหว','#252936',10],dungeon3:['ผนังถ้ำ / รากไม้','#25182e',10],
};
/** Explicit playable layout for expanded fields; gates and monster courts are graph nodes.
 * The original small paintings are concept art; these world-space footprints govern play.
 * wild0 retains its authored ruins and open graveyard (ruin walls are separate solid props).
 */
export function configureFieldNavigation(id:string,hunt:GroundPoint[],gates:GroundPoint[]){
  if(plans.has(id))return;
  const farm=farmPlan(id);
  if(farm){
    const plan:NavigationPlan={id,openGround:true,blockedName:'น้ำ / เหว / แนวหิน ห้ามเดิน',blockedColor:id==='wild2'||id==='wild6'?'#173e39':'#19171d',
      forbidden:farmHazards(id),
      plazas:farm.plazas.map(p=>({name:p.name,center:p.centerM as GroundPoint,radius:p.diameterM/2})),
      paths:farm.roads.map(p=>({name:p.name,points:p.pointsM as GroundPoint[],width:p.widthM}))};
    for(const [i,g] of gates.entries()){
      plan.paths.push({name:`gate-${i}`,points:[[0,0],g],width:10});
      plan.plazas.push({name:`gate-court-${i}`,center:g,radius:8});
    }
    plans.set(id,plan);cells.set(id,new Map());return;
  }
  let plan:NavigationPlan;
  if(id==='wild2')plan=swampPlan();
  else {
    const [blockedName,blockedColor,radius]=BIOMES[id]??['พื้นที่นอกทาง','#202128',11];
    const ring=[...hunt,hunt[0]].filter(Boolean),dungeon=id.startsWith('dungeon');
    plan={id,openGround:id==='wild0',blockedName,blockedColor,forbidden:[],
      plazas:[{name:dungeon?'โถงกลาง':'ลานกลาง',center:[0,0],radius:dungeon?12:16},
        ...hunt.map((center,i)=>({name:`ลานล่า ${i+1}`,center,radius}))],
      paths:[{name:dungeon?'ทางเชื่อมห้อง':'เส้นทางรอบพื้นที่',points:ring,width:dungeon?6:6.5},
        ...[2,4,7,9].filter(i=>hunt[i]).map(i=>({name:`ทางแยกลาน ${i+1}`,points:[[0,0] as GroundPoint,hunt[i]],width:6}))]};
    for(const [i,gate] of gates.entries()){
      const closest=hunt.reduce((best,p)=>Math.hypot(p[0]-gate[0],p[1]-gate[1])<Math.hypot(best[0]-gate[0],best[1]-gate[1])?p:best,[0,0] as GroundPoint);
      plan.paths.push({name:`ทางประตู ${i+1}`,points:[gate,closest],width:7});
      plan.plazas.push({name:`ลานประตู ${i+1}`,center:gate,radius:6});
    }
  }
  plans.set(id,plan);cells.set(id,new Map());
}
