import assert from 'node:assert/strict';
import {test,beforeEach,after} from 'node:test';
import {useGameStore,createSnapshot,cityMonsters} from '../src/store/useGameStore';
import {useMultiplayerStore} from '../src/store/useMultiplayerStore';
import {CITIES,CITY_IDS,walkable,CLASS_IDS} from '../src/game/content';
let now=100000;
const realNow=Date.now;Date.now=()=>now;
after(()=>{Date.now=realNow;});
beforeEach(()=>{now=100000;useMultiplayerStore.setState(useMultiplayerStore.getInitialState());useGameStore.setState({...useGameStore.getInitialState(),journal:false});});
test('all city sanctuaries and spawns are walkable; buildings and canal block movement',()=>{
 for(const id of CITY_IDS){assert.ok(walkable(id,0,0));for(const [x,z] of CITIES[id].hunt)assert.ok(walkable(id,x,z),`${id} spawn ${x},${z}`);for(const b of CITIES[id].buildings)assert.equal(walkable(id,b.x,b.z),false);}
 assert.equal(walkable('dawnveil',8,8),false);assert.equal(walkable('dawnveil',8,0),true);
});
test('travel switches spawns and preserves inventory and class',()=>{
 useGameStore.getState().chooseClass('Archer');const before=useGameStore.getState().inventory;
 useGameStore.getState().travel('dawnveil');const s=useGameStore.getState();
 assert.equal(s.player.cityId,'dawnveil');assert.equal(s.player.classId,'Archer');assert.equal(s.inventory,before);assert.ok(s.monsters.every(m=>m.id.startsWith('dawnveil')));
});
test('version 1 saves migrate and invalid city coordinates reset safely',()=>{
 const snapshot=createSnapshot();delete snapshot.player.classId;delete snapshot.player.cityId;
 useGameStore.getState().hydrate(snapshot);assert.equal(useGameStore.getState().player.classId,'Warrior');
 const next=createSnapshot();next.player.cityId='dawnveil';next.player.classId='Priest';next.player.position=[8,10];
 useGameStore.getState().hydrate(next);assert.deepEqual(useGameStore.getState().player.position,[0,0]);assert.equal(useGameStore.getState().player.classId,'Priest');
});
test('class skills charge mana once and honor cooldown',()=>{
 for(const cls of CLASS_IDS){useGameStore.setState({...useGameStore.getInitialState(),journal:false});useGameStore.getState().chooseClass(cls);useGameStore.getState().cast('buff');const mp=useGameStore.getState().player.mp;assert.equal(mp,80);useGameStore.getState().cast('buff');assert.equal(useGameStore.getState().player.mp,mp);}
});
test('priest healing applies after channel, not before',()=>{
 useGameStore.getState().chooseClass('Priest');useGameStore.setState(s=>({player:{...s.player,hp:50}}));
 useGameStore.getState().cast('special');assert.equal(useGameStore.getState().player.hp,50);
 now+=1400;useGameStore.getState().tick();assert.ok(useGameStore.getState().player.hp>50);assert.equal(useGameStore.getState().pending,null);
});
test('charged shot can kill and awards loot and experience exactly once',()=>{
 useGameStore.getState().chooseClass('Archer');const mob={...cityMonsters('hollow')[0],x:0,z:9,hp:1};useGameStore.setState({monsters:[mob]});
 useGameStore.getState().cast('special');now+=1600;useGameStore.getState().tick();const s=useGameStore.getState();assert.equal(s.monsters[0].hp,0);assert.ok(s.player.exp>0);assert.equal(s.drops.length,1);
 const exp=s.player.exp;now+=250;useGameStore.getState().tick();assert.equal(useGameStore.getState().player.exp,exp);assert.equal(useGameStore.getState().drops.length,1);
});
test('death persists until explicit revive; walking is blocked while dead',()=>{
 const mob={...cityMonsters('hollow')[0],x:0,z:10,home:[0,10] as [number,number]};useGameStore.setState(s=>({player:{...s.player,hp:1,position:[0,10]},monsters:[mob]}));
 useGameStore.getState().tick();assert.ok(useGameStore.getState().monsters[0].telegraph);now+=1500;useGameStore.getState().tick();assert.ok(useGameStore.getState().deadUntil>0);const p=useGameStore.getState().player.position;useGameStore.getState().move(1,0,.1);assert.deepEqual(useGameStore.getState().player.position,p);
 useGameStore.getState().respawn();assert.equal(useGameStore.getState().player.hp,0);now+=2500;useGameStore.getState().respawn();assert.ok(useGameStore.getState().player.hp>0);assert.deepEqual(useGameStore.getState().player.position,[0,0]);
});
test('online session blocks local skill, class, travel and combat mutations',()=>{
 useMultiplayerStore.setState({online:true,connected:true});const before=createSnapshot();useGameStore.getState().cast('buff');useGameStore.getState().chooseClass('Mage');useGameStore.getState().travel('thornwatch');useGameStore.getState().attack('hollow-0');assert.deepEqual(createSnapshot(),before);
});
