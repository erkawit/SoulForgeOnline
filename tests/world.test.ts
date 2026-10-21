import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CITIES,ZONE_IDS,isCity,walkable} from '../src/game/content';
import {cityMonsters,useGameStore,createSnapshot} from '../src/store/useGameStore';
import {useMultiplayerStore} from '../src/store/useMultiplayerStore';
test('ten themed regions cover every monster level 1–100 exactly once',()=>{
 const levels:number[]=[];const names=new Set<string>(),forms=new Set<string>();
 for(const id of ZONE_IDS){const c=CITIES[id];assert.ok(isCity(id));assert.ok(c.parent);assert.equal(c.species?.length,3);assert.ok(walkable(id,0,0));
 const mobs=cityMonsters(id);assert.equal(mobs.length,10);assert.equal(mobs.filter(m=>m.elite).length,1);
 for(const m of mobs){assert.ok(walkable(id,m.x,m.z));assert.ok(m.hp>0);assert.equal(m.hp,m.maxHp);levels.push(m.level);names.add(m.name);forms.add(m.form!);}}
 assert.deepEqual(levels,Array.from({length:100},(_,i)=>i+1));assert.equal(names.size,30);assert.equal(forms.size,6);
});
test('every region supports travel and save restore without changing player progression',()=>{
 useMultiplayerStore.setState(useMultiplayerStore.getInitialState());useGameStore.setState(useGameStore.getInitialState());
 for(const id of ZONE_IDS){useGameStore.getState().travel(id);assert.equal(useGameStore.getState().player.cityId,id);assert.equal(useGameStore.getState().player.level,1);const save=createSnapshot();useGameStore.getState().travel('hollow');useGameStore.getState().hydrate(save);assert.equal(useGameStore.getState().player.cityId,id);assert.equal(useGameStore.getState().monsters[9].level,CITIES[id].levels![1]);}
});
test('invalid destinations leave state unchanged and level 100 never advances',()=>{
 const s=useGameStore.getState();s.travel('missing' as never);assert.equal(useGameStore.getState(),s);
 useGameStore.setState({...useGameStore.getInitialState(),journal:false,player:{...s.player,level:100,exp:999999,position:[0,0],mp:100},cooldowns:{},monsters:[{...cityMonsters('wild9')[0],x:1,z:0,hp:1}],deadUntil:0});
 useGameStore.getState().attack(useGameStore.getState().monsters[0].id);assert.equal(useGameStore.getState().player.level,100);
});
