import test from 'node:test';
import assert from 'node:assert/strict';
import {Mesh,Material} from 'three';
import {buildFarmScenery} from '../src/components/FarmScenery';
import {ZONE_IDS,DUNGEON_IDS} from '../src/game/content';
test('all 13 scenery themes batch into valid drawable geometry',()=>{
 for(const id of [...ZONE_IDS,...DUNGEON_IDS]){
  const group=buildFarmScenery(id);
  assert.ok(group.children.length>0&&group.children.length<=7,id);
  group.traverse(o=>{if(o instanceof Mesh){
   assert.ok(o.geometry?.attributes.position.count>0,`${id} missing geometry`);
   o.geometry.computeBoundingBox();
   assert.ok(Number.isFinite(o.geometry.boundingBox!.max.y),id);
   o.geometry.dispose();(o.material as Material).dispose();
  }});
 }
});
