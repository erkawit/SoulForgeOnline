import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CITIES,CITY_IDS,ZONE_IDS,DUNGEON_IDS,walkable} from '../src/game/content';
import {spawnPoints} from '../src/game/spawns';
import {cityMonsters} from '../src/store/useGameStore';
import {advanceMonster,RESPAWN_SPREAD} from '../src/game/monsterAI';

test('map markers match actual monster homes and remain outside the sanctuary',()=>{
 for(const id of [...CITY_IDS,...ZONE_IDS,...DUNGEON_IDS]){
  const points=spawnPoints(id),monsters=cityMonsters(id);
  assert.equal(new Set(points.map(p=>p.position.join(','))).size,points.length);
  for(const p of points){
   const m=monsters.find(m=>m.id===p.id)!;
   assert.ok(walkable(id,...p.position));assert.ok(Math.hypot(...p.position)>6);
   assert.deepEqual(m.home,p.position);assert.equal(m.name,p.name);assert.equal(m.level,p.level);
   assert.equal(m.boss,p.boss);assert.equal(m.elite,p.elite);
   const dead={...m,x:0,z:7,hp:0,respawnAt:9000};
   const revived=advanceMonster(dead,[0,0],id,9000,0).monster;
   assert.ok(Math.hypot(revived.x-p.position[0],revived.z-p.position[1])<=RESPAWN_SPREAD+1e-9,'respawns inside its area');assert.ok(walkable(id,revived.x,revived.z));assert.equal(revived.hp,m.maxHp);
  }
 }
});
test('regions follow Expansion and bosses occupy the last dungeon marker',()=>{
 const expected={hollow:[1,5,10,20,25,30,35,40],dawnveil:[45,60,75,79,82],thornwatch:[85,90]};
 for(const [region,levels] of Object.entries(expected)){
  const actual=ZONE_IDS.filter(id=>CITIES[id].parent===region).flatMap(id=>spawnPoints(id).map(p=>p.level));
  assert.deepEqual([...new Set(actual)].sort((a,b)=>a-b),levels);
 }
 for(const id of DUNGEON_IDS){const points=spawnPoints(id);assert.equal(points.filter(p=>p.boss).length,1);assert.equal(points.at(-1)!.name,CITIES[id].species![2]);assert.equal(points.at(-1)!.respawnSeconds,300);}
 assert.equal(spawnPoints('dawnveil')[0].name,'Reed Stalker');
 assert.equal(spawnPoints('thornwatch')[0].name,'Briar Wolf');
});
