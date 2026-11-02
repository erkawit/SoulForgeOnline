// Round 13: one class, one advancement. Every character is a Berserker (two-handed greatsword / greataxe / greathammer);
// at Lv60, after the trial quest "การเลื่อนขั้น" (stage 3), it advances to Reaver: +STR 8 / DEX 2 / AGI 2 / VIT 6
// (balance row 'Reaver' in balance/config.ts) and its six skills evolve slot for slot (skills/defaults.ts, evolvesFrom).
// The ten Class II / III paths of the five retired classes are gone; saves that carried one are read as "not promoted"
// unless it was Reaver (validPromotion).
import {CLASSES,REAVER_LEVEL,type ClassId} from './content';
export type PromotionId='Reaver';
/** weapon models of the procedural 3D actor (AdvancedWeapons.tsx); the sprite / Codex art follows the equipped kind */
export type WeaponKit='swordShield'|'greatsword'|'axe'|'staff'|'spellSword'|'maceBook'|'hammer'|'bow'|'daggers'|'rune'|'grimoire';
export type Promotion={id:PromotionId;base:ClassId;stage:2|3;level:number;previous?:PromotionId;kit:WeaponKit;cloth:string;metal:string;glow:string;role:string;range:number;style:'tank'|'burst'|'heal'|'shot'|'support'};
export const PROMOTIONS:Record<PromotionId,Promotion>={
 Reaver:{id:'Reaver',base:'Berserker',stage:3,level:REAVER_LEVEL,kit:'axe',cloth:'#3a1a1d',metal:'#2f2a2b',glow:'#ff5a3c',role:'Two-handed weapon · Reaper of the front line',range:2.8,style:'burst'},
};
export const PROMOTION_IDS=Object.keys(PROMOTIONS) as PromotionId[];
export function validPromotion(base:ClassId,level:number,id:unknown):PromotionId|undefined{
 if(typeof id!=='string'||!Object.prototype.hasOwnProperty.call(PROMOTIONS,id))return;
 const p=PROMOTIONS[id as PromotionId];return p.base===base&&level>=p.level?p.id:undefined;
}
/** `stage` = the highest advancement trial finished (quests stageUnlocked); omitted = no quest gate (old saves, tools) */
export function canPromote(base:ClassId,level:number,current:PromotionId|undefined,target:PromotionId,stage?:number){
 const p=PROMOTIONS[target];return !!p&&p.base===base&&level>=p.level&&(stage===undefined||stage>=p.stage)&&!current;
}
export const baseKit:Record<ClassId,WeaponKit>={Berserker:'greatsword',Paladin:'swordShield',Hawkeye:'bow',RuneMaster:'spellSword',Elementalist:'staff',Assassin:'daggers',HighPriest:'maceBook',Inquisitor:'hammer'};
export function classLook(base:ClassId,id?:PromotionId){
 const p=id&&PROMOTIONS[id]?.base===base?PROMOTIONS[id]:undefined;
 return {...CLASSES[base],...p,kit:p?.kit??baseKit[base],stage:p?3:1,name:p?.id??base,skills:p?['Savage Rend','Dread Howl','Reaping Cyclone'] as [string,string,string]:CLASSES[base].skills,
  special:p?'Cataclysm Descent: leap and slam — impact, then a blast twice as strong over twice the radius.':CLASSES[base].special};
}
