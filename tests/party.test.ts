import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PartyManager} from '../apps/game-server/src/party';
const P=(id:string,classId='Warrior')=>({id,name:id.toUpperCase(),classId});
test('party: invite → accept forms a party led by the inviter',()=>{
 const pm=new PartyManager();assert.equal(pm.invite(P('a'),P('b'),0),null);const p=pm.accept(P('b','Priest'),P('a'),1);
 assert.ok(typeof p!=='string');assert.equal(p.leader,'a');assert.deepEqual(p.members.map(m=>m.id),['a','b']);
 assert.equal(pm.invite(P('b'),P('c'),2),'NOT_LEADER');assert.equal(pm.invite(P('a'),P('a'),2),'SELF');
});
test('party: a dropped member keeps the seat through the grace and rejoins in the same slot',()=>{
 const pm=new PartyManager({max:6,graceMs:120_000,inviteMs:30_000});pm.invite(P('a'),P('b'),0);pm.accept(P('b'),P('a'),0);pm.invite(P('a'),P('c'),0);pm.accept(P('c'),P('a'),0);
 pm.disconnect('b',1000);assert.equal(pm.tick(60_000).length,0);assert.equal(pm.of('b')?.members[1].online,false);
 const back=pm.reconnect('b');assert.equal(back?.members[1].id,'b');assert.equal(back?.members[1].online,true);
 pm.disconnect('b',200_000);pm.tick(320_001);assert.equal(pm.of('b'),null);assert.deepEqual(pm.of('a')?.members.map(m=>m.id),['a','c']);
});
test('party: leader moves only after the leader grace expires; a 2-person party disbands when one leaves for good',()=>{
 const pm=new PartyManager();pm.invite(P('a'),P('b'),0);pm.accept(P('b'),P('a'),0);pm.invite(P('a'),P('c'),0);pm.accept(P('c'),P('a'),0);
 pm.disconnect('a',0);pm.tick(119_000);assert.equal(pm.of('b')?.leader,'a');pm.tick(120_001);assert.equal(pm.of('b')?.leader,'b');
 const r=pm.leave('c');assert.ok(typeof r!=='string');assert.equal(pm.of('b'),null,'disbanded');
});
test('party: invites expire, full parties refuse, restore() rebuilds after a server restart',()=>{
 const pm=new PartyManager({max:2,graceMs:1000,inviteMs:500});pm.invite(P('a'),P('b'),0);assert.equal(pm.accept(P('b'),P('a'),600),'EXPIRED');
 pm.invite(P('a'),P('b'),1000);pm.accept(P('b'),P('a'),1001);assert.equal(pm.invite(P('a'),P('c'),1002),'FULL');
 const pm2=new PartyManager();pm2.restore([{partyId:'x',leader:'a',members:[P('a'),P('b')]}],0);assert.equal(pm2.of('b')?.id,'x');assert.equal(pm2.reconnect('a')?.members[0].online,true);
});
