// Round 20: eight playable classes — every class has a balance row, a valid skill tree, a full hotbar, keeps its class
// through a save, and its basic attack reaches its own range.
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {CLASS_IDS,CLASSES,RANGED,statClass} from '../src/game/content';
import {DEFAULT_CONFIG} from '../src/game/balance/config';
import {deriveCharacter} from '../src/game/balance/stats';
import {DEFAULT_SKILLS,DEFAULT_HOTBAR} from '../src/game/skills/defaults';
import {validateTree,validateSkill} from '../src/game/skills/engine';
import {useGameStore,createSnapshot,EXTRA_SLOTS} from '../src/store/useGameStore';
import {useMultiplayerStore} from '../src/store/useMultiplayerStore';
import {skillIconIndex} from '../src/game/skills/icons';
beforeEach(()=>{useMultiplayerStore.setState(useMultiplayerStore.getInitialState());useGameStore.setState(useGameStore.getInitialState());});

test('every class has a balance row and sane level-1 numbers',()=>{
 for(const c of CLASS_IDS){const row=DEFAULT_CONFIG.classes[c];assert.ok(row,c);assert.equal(Object.values(row.base).reduce((a,b)=>a+b,0),60,c);
  const d=deriveCharacter(c,1,[]);assert.ok(d.attack>40&&d.attack<200,`${c} attack ${d.attack}`);assert.ok(d.maxHp>200,c);assert.ok(d.maxMp>40,c);}
 assert.equal(deriveCharacter('Elementalist',1,[]).damageKind,'magic');assert.equal(deriveCharacter('Berserker',1,[]).damageKind,'physical');
});
test('every class: valid tree, six actives on the hotbar, real icons',()=>{
 for(const c of CLASS_IDS){assert.deepEqual(validateTree(DEFAULT_SKILLS,c),[],c);
  const slots=[...Object.values(DEFAULT_HOTBAR[c]),...EXTRA_SLOTS[c]];assert.equal(new Set(slots).size,6,c);
  for(const id of slots){const d=DEFAULT_SKILLS.defs.find(x=>x.id===id);assert.ok(d&&d.kind==='active'&&d.cls===c,`${c}:${String(id)}`);assert.deepEqual(validateSkill(d!),[],String(id));assert.ok(skillIconIndex(id)>=0,String(id));}}
});
test('a new character keeps its class through a save and reload',()=>{
 for(const c of CLASS_IDS){useGameStore.setState(useGameStore.getInitialState());useGameStore.getState().applyProfile('Tester',c,'f');
  const snap=JSON.parse(JSON.stringify(createSnapshot()));useGameStore.setState(useGameStore.getInitialState());useGameStore.getState().hydrate(snap);
  const s=useGameStore.getState();assert.equal(s.player.classId,c);assert.equal(statClass(s.player),c);assert.equal(s.hotbar.skill,DEFAULT_HOTBAR[c].skill,c);}
});
test('ranged classes attack from their own range, melee classes do not',()=>{
 for(const c of CLASS_IDS){useGameStore.setState(useGameStore.getInitialState());useGameStore.getState().applyProfile('Tester',c,'m');useGameStore.getState().travel('wild0');
  const s=useGameStore.getState(),m=s.monsters.find(x=>x.hp>0)!,far=CLASSES[c].range-0.3;
  useGameStore.setState({journal:false,player:{...s.player,position:[m.x+far,m.z]},cooldowns:{}});
  const r=useGameStore.getState().attack(m.id);assert.equal(r.hit,true,`${c} at ${far.toFixed(1)} m: ${r.reason}`);
  assert.equal(RANGED[c],CLASSES[c].range>4,c);}
});
