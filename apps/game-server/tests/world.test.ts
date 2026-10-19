import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Room } from '../src/world.js';
test('HUD snapshot exposes authoritative health and mana', () => {
 const room=new Room();
 room.players.set('test',{id:'test',x:2,z:3,hp:80,maxHp:150,mp:60,attack:40,defense:15,crit:.08,speed:4,level:1,lastBasic:0,lastSkill:0});
 const p=room.snapshot().players[0];
 assert.deepEqual([p.hp,p.maxHp,p.mp,p.maxMp,p.x,p.z],[80,150,60,100,2,3]);
 assert.equal('attack' in p,false);
});
test('boss phases, public drops and expiry remain intact', () => {
 const room=new Room(), now=Date.now();room.spawnBoss(now);
 assert.equal(room.snapshot().boss?.phase,'active');
 room.damageBoss('test',7100,now);
 assert.equal(room.snapshot().boss?.phase,'enraged');
 assert.equal(room.snapshot().boss?.hp,2900);
 const result=room.damageBoss('test',10000,now);
 assert.equal(result.dealt,2900);assert.equal(result.killed,true);
 assert.equal(room.snapshot().boss,null);assert.equal(room.snapshot().loot.length,4);
 room.tick(.05,now+300001);assert.equal(room.snapshot().loot.length,0);
});
