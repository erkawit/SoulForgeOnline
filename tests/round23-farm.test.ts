import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONE_IDS,DUNGEON_IDS,WORLD_LIMIT,walkable,portalsOf,homePoint,arrivalPoint} from '../src/game/content';
import {spawnPoints} from '../src/game/spawns';
import {farmPlan,farmHazards,gatePillars} from '../src/game/world/farmLayout';
import {mapRoute} from '../src/game/world/mapRoute';
import {lineClear} from '../src/game/monsterAI';
import {collidersOf} from '../src/game/world/colliders';

test('Round 23: all fields have 30 groups, 150 safe spawns, open floors and accessible solid waygates',()=>{
 for(const id of [...ZONE_IDS,...DUNGEON_IDS]){
  const plan=farmPlan(id)!;
  assert.equal(WORLD_LIMIT[id],120);assert.equal(plan.huntingGroups.length,30);
  assert.equal(plan.plazas[0].diameterM,40);
  const spawns=spawnPoints(id);assert.equal(spawns.length,150);
  assert.equal(new Set(spawns.map(p=>p.id)).size,150);
  for(const p of spawns)assert.ok(walkable(id,...p.position),`${p.id} spawn blocked`);
  let open=0;const size=240,seen=new Uint8Array(size*size),pass=new Uint8Array(size*size);
  for(let z=0;z<size;z++)for(let x=0;x<size;x++)if(walkable(id,x-119.5,z-119.5)){pass[z*size+x]=1;open++;}
  assert.ok(open/(size*size)>=.6,`${id} less than 60% walkable`);
  const start=homePoint(id),index=(p:number[])=>Math.floor(p[1]+120)*size+Math.floor(p[0]+120);
  const q=[index(start)];seen[q[0]]=1;
  for(let head=0;head<q.length;head++){
   const k=q[head],x=k%size,z=Math.floor(k/size);
   for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,nz=z+dz,n=nz*size+nx;if(nx<0||nz<0||nx>=size||nz>=size||seen[n]||!pass[n])continue;
    if(!lineClear(id,[x-119.5,z-119.5],[nx-119.5,nz-119.5]))continue;
    seen[n]=1;q.push(n);
   }
  }
  for(const p of spawns)assert.ok(seen[index(p.position)],`${p.id} isolated`);
  for(const gate of portalsOf(id)){
   assert.ok(walkable(id,gate.x,gate.z));assert.ok(walkable(id,...arrivalPoint(gate.to,id)));
   assert.ok(mapRoute(id,start,[gate.x,gate.z],.1),`${id} unreachable gate`);
   for(const pillar of gatePillars(gate.x,gate.z))assert.equal(walkable(id,pillar.x,pillar.z),false,'pillar must be solid');
  }
  for(const hazard of farmHazards(id)){
   assert.equal(walkable(id,...hazard.center),false);
   const [x,z]=hazard.center,r=hazard.radius+2;
   assert.equal(lineClear(id,[x-r,z],[x+r,z]),false,'cannot cross water/abyss');
  }
  for(const prop of collidersOf(id))assert.equal(walkable(id,prop.x,prop.z),false,'prop center solid');
  console.log(`${id}: ${(open/576).toFixed(2)}% walkable, 150 reachable spawns, ${collidersOf(id).length} solid props`);
 }
});
