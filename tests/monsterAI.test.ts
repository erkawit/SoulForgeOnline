import {test} from 'node:test';
import assert from 'node:assert/strict';
import {advanceMonster,lineClear} from '../src/game/monsterAI';
import type {Monster} from '../src/lib/types';
const mob=(form:string):Monster=>({id:'test',name:'Test',x:10,z:0,home:[10,0],hp:100,maxHp:100,level:20,lastAttack:0,respawnAt:null,form});
test('ranged attack warns first then hits once; walking out avoids damage',()=>{
 const warned=advanceMonster(mob('wraith'),[15,0],'wild0',3000,0);assert.equal(warned.damage,0);assert.equal(warned.monster.telegraph?.kind,'bolt');
 assert.ok(advanceMonster(warned.monster,[15,0],'wild0',4000,0).damage>0);
 assert.equal(advanceMonster(warned.monster,[18,0],'wild0',4000,0).damage,0);
 const impact=advanceMonster(warned.monster,[15,0],'wild0',4000,0);assert.equal(advanceMonster(impact.monster,[15,0],'wild0',4001,0).damage,0);
});
test('charge lands at locked target and can be dodged',()=>{
 const warned=advanceMonster(mob('wolf'),[14,0],'wild0',3000,0);
 const impact=advanceMonster(warned.monster,[16,2],'wild0',3800,0);assert.equal(impact.damage,0);assert.equal(impact.monster.x,14);
});
test('sanctuary cancels pending attacks and returns monsters home',()=>{
 const warned=advanceMonster(mob('wraith'),[15,0],'wild0',3000,0).monster;
 const retreat=advanceMonster({...warned,x:12},[0,0],'wild0',4000,0);assert.equal(retreat.damage,0);assert.equal(retreat.monster.telegraph,undefined);assert.ok(retreat.monster.x<12);
});
test('walls and water block line of sight, bridge permits it',()=>{
 assert.equal(lineClear('dawnveil',[4,8],[12,8]),false);assert.equal(lineClear('dawnveil',[4,0],[12,0]),true);
});
test('respawn restores original spawn and removes stale windup',()=>{
 const m=advanceMonster({...mob('golem'),x:15,hp:0,respawnAt:4000},[0,0],'wild0',4000,0).monster;assert.equal(m.x,10);assert.equal(m.hp,100);assert.equal(m.respawnAt,null);
});
