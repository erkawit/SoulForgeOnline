import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/game/world/registry';
import * as eco from '../src/game/economy/core';
import { DEFAULT_CONFIG } from '../src/game/balance/config';
import { DEFAULT_SKILLS } from '../src/game/skills/defaults';
import { NPC_SPOTS } from '../src/game/npcs';
import { starterPlayer, starterGear } from '../src/lib/seed';
import { makeGear } from '../src/game/items';
import { SOUL_STONES, stoneFor } from '../src/game/ui/forgeCatalog';
import { CharacterSession, DEFAULT_LIMITS } from '../apps/game-server/src/session';
let seq=0;
const ctx:eco.Ctx={config:DEFAULT_CONFIG,skills:DEFAULT_SKILLS,rng:()=>0,now:1800000000000,uuid:()=>`00000000-0000-4000-8000-${String(++seq).padStart(12,'0')}`};
function state(role='merchant'): eco.CharState { const s=eco.freshCharacter('UITester','Berserker','m',ctx,{player:starterPlayer,gear:starterGear});return {...s,player:{...s.player,gold:10000,cityId:'hollow' as const,position:NPC_SPOTS.hollow[role]},inventory:Array(24).fill(null)}; }
test('alchemy atomically consumes materials and gold, gives potions, refuses invalid requests',()=>{
  const s=state();s.inventory=eco.giveTo(s.inventory,'material-ore',8,ctx)!;const before=JSON.stringify(s);
  const r=eco.brewPotion(s,'potion-hp-s',3,ctx);assert.ok(r.ok);assert.equal(eco.countOf(r.state.inventory,'material-ore'),5);assert.equal(eco.countOf(r.state.inventory,'potion-hp-s'),3);assert.equal(r.state.player.gold,9970);assert.equal(JSON.stringify(s),before);
  for(const qty of [0,-1,1.5,100,NaN])assert.equal(eco.brewPotion(s,'potion-hp-s',qty,ctx).ok,false);
  assert.equal(eco.brewPotion(s,'fake',1,ctx).ok,false);
  assert.equal(eco.brewPotion(state('shop'),'potion-hp-s',1,ctx).ok,false);
  assert.equal(eco.brewPotion(s,'potion-hp-l',1,ctx).ok,false);assert.equal(JSON.stringify(s),before);
});
test('alchemy refuses a full bag without spending resources',()=>{
  const s=state();s.inventory=Array.from({length:24},()=>makeGear('weapon-Berserker-0','Berserker'));s.inventory[0]={...eco.newItem('material-ore',ctx),qty:2};const before=JSON.stringify(s);
  assert.equal(eco.brewPotion(s,'potion-hp-s',1,ctx).ok,false);assert.equal(JSON.stringify(s),before);
});
test('three soul stones are purchasable, category-specific and consumed once',()=>{
  let s=state('shop');for(const stone of SOUL_STONES){const r=eco.buyCatalog(s,stone.id,ctx);assert.ok(r.ok);s=r.state;}
  s={...s,player:{...s.player,position:NPC_SPOTS.hollow.merchant},equipment:{...s.equipment,weapon:makeGear('weapon-Berserker-0','Berserker')}};
  const r=eco.enhance(s,{slot:'weapon'},false,ctx);assert.ok(r.ok);assert.equal(eco.countOf(r.state.inventory,'soul-stone-weapon'),0);assert.equal(eco.countOf(r.state.inventory,'soul-stone-armor'),1);assert.equal(r.state.equipment.weapon?.enhance,1);assert.equal(eco.enhance(r.state,{slot:'weapon'},false,ctx).ok,false);
  assert.equal(stoneFor('ring').id,'soul-stone-accessory');assert.equal(stoneFor('helmet').id,'soul-stone-armor');
});
test('realm accepts alchemy and enforces its material requirements',()=>{
  const s=state();s.inventory=eco.giveTo(s.inventory,'material-ore',2,ctx)!;
  const session=new CharacterSession('ui-test',s,1,()=>({config:DEFAULT_CONFIG,skills:DEFAULT_SKILLS,limits:DEFAULT_LIMITS}),ctx.now);
  assert.equal(session.act('brewPotion',['potion-hp-s',1],[ctx.uuid()],ctx.now+1000).ok,true);
  assert.equal(session.act('brewPotion',['potion-hp-s',99],[ctx.uuid()],ctx.now+2000).ok,false);
});
