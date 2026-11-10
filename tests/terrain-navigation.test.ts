import test from 'node:test';
import assert from 'node:assert/strict';
import {CITIES,ZONE_IDS,DUNGEON_IDS,homePoint,walkable} from '../src/game/content';
import {fieldImagePoint,navigationPlan,navigationSurface} from '../src/game/world/terrainNavigation';
import {mapRoute} from '../src/game/world/mapRoute';
import {lineClear} from '../src/game/monsterAI';
import {useGameStore} from '../src/store/useGameStore';
import {CharacterSession,DEFAULT_LIMITS} from '../apps/game-server/src/session';
import {DEFAULT_CONFIG} from '../src/game/balance/config';
import {DEFAULT_SKILLS} from '../src/game/skills/defaults';

test('all expanded fields have named paths, courts and a terrain rule',()=>{
 for(const id of [...ZONE_IDS,...DUNGEON_IDS]){
  const plan=navigationPlan(id)!;
  assert.ok(plan.paths.length&&plan.plazas.length&&plan.blockedName,id);
  assert.equal(navigationSurface(id,121,0),'blocked');
  assert.equal(navigationSurface(id,NaN,0),'blocked');
  assert.ok(walkable(id,...homePoint(id)),id+' arrival');
 }
});
test('swamp water blocks pins, straight traversal and spawning; bridges and all dry courts connect',()=>{
 for(const pixel of [[-108,-108],[108,-108],[-108,108],[108,108]]){
  const p:[number,number]=[pixel[0],pixel[1]];
  assert.equal(walkable('wild2',...p),false,`water at ${pixel}`);
  assert.equal(mapRoute('wild2',homePoint('wild2'),p),null);
 }
 for(const pixel of [[0,-100],[0,100],[-100,0],[100,0]]){
  const p:[number,number]=[pixel[0],pixel[1]];assert.ok(walkable('wild2',...p),`road at ${pixel}`);
 }
 for(const p of CITIES.wild2.hunt)assert.ok(mapRoute('wild2',homePoint('wild2'),p),`court ${p}`);
 const a:[number,number]=[-118,-108],b:[number,number]=[-98,-108],distance=20;
 assert.ok(!lineClear('wild2',a,b),'cannot cut across water between two dry points');
 assert.equal(mapRoute('wild2',a,b,0,distance+.2),null,'shortcut budget cannot cover real detour');
 assert.ok(mapRoute('wild2',a,b),'the longer bridge route exists');
});
test('actual client movement and realm reports cannot jump across swamp water',()=>{
 const a:[number,number]=[-118,-108],b:[number,number]=[-98,-108];
 const before=useGameStore.getState();
 try {
  useGameStore.setState({player:{...before.player,cityId:'wild2',position:a},journal:false,pending:null,charge:null,deadUntil:0});
  const live={config:DEFAULT_CONFIG,skills:DEFAULT_SKILLS,limits:{...DEFAULT_LIMITS,dashBudget:21}};
  const session=new CharacterSession('navigation-test',useGameStore.getState() as any,0,()=>live,1000);
  assert.equal(session.move('wild2',...b,1000).ok,false,'dry endpoint across water is rejected');
  assert.deepEqual(session.position,a);
  const route=mapRoute('wild2',a,b)!;
  assert.equal(session.move('wild2',...route[0],1100).ok,true,'legitimate first step is accepted');
  const speed=session.derived().speed;
  useGameStore.getState().move((b[0]-a[0])/speed,(b[1]-a[1])/speed,1);
  const end=useGameStore.getState().player.position;
  assert.ok(walkable('wild2',...end));
  assert.ok(lineClear('wild2',a,[end[0],a[1]])&&lineClear('wild2',[end[0],a[1]],end));
  assert.notDeepEqual(end,b,'large frame time cannot tunnel across the water');
 } finally {useGameStore.setState(before);}
});
