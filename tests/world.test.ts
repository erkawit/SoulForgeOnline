import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CITIES,ZONE_IDS,DUNGEON_IDS,isCity,walkable} from '../src/game/content';
import {cityMonsters,useGameStore,createSnapshot} from '../src/store/useGameStore';
import {useMultiplayerStore} from '../src/store/useMultiplayerStore';
test('regions and elite dungeons cover the requested exact monster levels',()=>{
 const levels:number[]=[];const names=new Set<string>(),forms=new Set<string>();
 for(const id of [...ZONE_IDS,...DUNGEON_IDS]){const c=CITIES[id];assert.ok(isCity(id));assert.ok(c.parent);assert.equal(c.species?.length,3);assert.ok(walkable(id,0,0));
 const mobs=cityMonsters(id);assert.equal(mobs.length,10);assert.equal(mobs.filter(m=>m.elite).length,c.dungeon?10:0);
 for(const m of mobs){assert.ok(walkable(id,m.x,m.z));assert.ok(m.hp>0);assert.equal(m.hp,m.maxHp);levels.push(m.level);names.add(m.name);forms.add(m.form!);}}
 assert.deepEqual([...new Set(levels)].sort((a,b)=>a-b),[1,5,10,20,25,30,35,40,45,60,75,79,82,85,90,92,94,96,98,100]);assert.ok(names.size>=30);assert.equal(forms.size,6);
});
test('every region supports travel and save restore without changing player progression',()=>{
 useMultiplayerStore.setState(useMultiplayerStore.getInitialState());useGameStore.setState(useGameStore.getInitialState());
 for(const id of [...ZONE_IDS,...DUNGEON_IDS]){useGameStore.getState().travel(id);assert.equal(useGameStore.getState().player.cityId,id);assert.equal(useGameStore.getState().player.level,1);const save=createSnapshot();useGameStore.getState().travel('hollow');useGameStore.getState().hydrate(save);assert.equal(useGameStore.getState().player.cityId,id);assert.deepEqual(useGameStore.getState().monsters,cityMonsters(id));}
});
test('invalid destinations leave state unchanged and level 100 never advances',()=>{
 const s=useGameStore.getState();s.travel('missing' as never);assert.equal(useGameStore.getState(),s);
 useGameStore.setState({...useGameStore.getInitialState(),journal:false,player:{...s.player,level:100,exp:999999,position:[0,0],mp:100},cooldowns:{},monsters:[{...cityMonsters('wild9')[0],x:1,z:0,hp:1}],deadUntil:0});
 useGameStore.getState().attack(useGameStore.getState().monsters[0].id);assert.equal(useGameStore.getState().player.level,100);
});
