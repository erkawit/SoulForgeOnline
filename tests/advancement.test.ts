// Round 13: one class (Berserker) and one advancement (Reaver at Lv60).
import {test,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import {PROMOTIONS,PROMOTION_IDS,canPromote,validPromotion,classLook} from '../src/game/advancement';
import {CLASS_IDS} from '../src/game/content';
import {useGameStore,createSnapshot} from '../src/store/useGameStore';
import {useMultiplayerStore} from '../src/store/useMultiplayerStore';
import {DEFAULT_SKILLS,REAVER_SKILLS,evolvedSkill} from '../src/game/skills/defaults';
import {passiveTotals} from '../src/game/skills/engine';
import type {QuestLog} from '../src/game/quests';
beforeEach(()=>{useMultiplayerStore.setState(useMultiplayerStore.getInitialState());useGameStore.setState(useGameStore.getInitialState());});
const trials:QuestLog={'q-path':{id:'q-path',status:'done',progress:[],acceptedAt:0},'q-ascension':{id:'q-ascension',status:'done',progress:[],acceptedAt:0}};
test('one class, one advancement: Berserker → Reaver at Lv60',()=>{
 assert.deepEqual([...CLASS_IDS],['Berserker']);assert.deepEqual(PROMOTION_IDS,['Reaver']);
 const p=PROMOTIONS.Reaver;assert.equal(p.base,'Berserker');assert.equal(p.level,60);
 assert.equal(canPromote('Berserker',59,undefined,'Reaver'),false);assert.equal(canPromote('Berserker',60,undefined,'Reaver'),true);
 assert.equal(canPromote('Berserker',60,'Reaver','Reaver'),false,'only once');assert.equal(canPromote('Berserker',60,undefined,'Reaver',2),false,'needs the stage-3 trial');
 assert.equal(validPromotion('Berserker',100,'Paladin'),undefined);assert.equal(validPromotion('Berserker',59,'Reaver'),undefined);assert.equal(validPromotion('Berserker',60,'Reaver'),'Reaver');
});
test('the advancement needs the level, the trial and the plaza, and evolves the six skills',()=>{
 const s=()=>useGameStore.getState();
 useGameStore.setState({player:{...s().player,level:60,position:[0,0]}});s().promote('Reaver');assert.equal(s().player.promotionId,undefined,'no trial yet');
 useGameStore.setState({quests:trials,player:{...s().player,position:[0,10]}});s().promote('Reaver');assert.equal(s().player.promotionId,undefined,'away from the plaza');
 useGameStore.setState({player:{...s().player,position:[0,0]}});s().promote('Reaver');assert.equal(s().player.promotionId,'Reaver');
 for(const id of REAVER_SKILLS)assert.equal(s().skillLevels[id],1,id);
 assert.equal(evolvedSkill(DEFAULT_SKILLS,s().hotbar.skill,s().skillLevels),'r-savage-rend','Space now casts the Reaver version');
 assert.equal(s().skillLevels['b-rending-rush']>0,true,'the Berserker rank is kept');
});
test('an evolved passive replaces its original — they never stack',()=>{
 const t=passiveTotals(DEFAULT_SKILLS,{'b-greatweapon-mastery':5});assert.equal(t.atkPct,10);
 const r=passiveTotals(DEFAULT_SKILLS,{'b-greatweapon-mastery':5,'r-dreadweapon-mastery':5});assert.equal(Math.round(r.atkPct!*10)/10,16);
});
test('the Reaver advancement survives saves; old five-class promotions are dropped',()=>{
 useGameStore.setState({player:{...useGameStore.getInitialState().player,level:60,promotionId:'Reaver'}});const save=createSnapshot();useGameStore.getState().hydrate(save);assert.equal(useGameStore.getState().player.promotionId,'Reaver');
 const bad=createSnapshot() as unknown as {player:Record<string,unknown>};bad.player.classId='Warrior';bad.player.promotionId='Archmage';useGameStore.getState().hydrate(bad as never);
 assert.equal(useGameStore.getState().player.promotionId,undefined);assert.equal(useGameStore.getState().player.classId,'Berserker');
});
test('dead and channeling actors cannot promote',()=>{
 useGameStore.setState(s=>({quests:trials,player:{...s.player,level:60,position:[0,0]}}));
 useGameStore.setState({deadUntil:999});useGameStore.getState().promote('Reaver');assert.equal(useGameStore.getState().player.promotionId,undefined);
 useGameStore.setState({deadUntil:0,pending:{at:999,target:null,skillId:'x',kind:'skill'}});useGameStore.getState().promote('Reaver');assert.equal(useGameStore.getState().player.promotionId,undefined);
});
test('the look follows the advancement',()=>{
 assert.equal(classLook('Berserker').kit,'greatsword');assert.equal(classLook('Berserker').stage,1);
 assert.equal(classLook('Berserker','Reaver').kit,'axe');assert.equal(classLook('Berserker','Reaver').stage,3);assert.ok(classLook('Berserker','Reaver').range<4);
});
