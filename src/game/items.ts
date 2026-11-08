import { SOUL_STONES } from './ui/forgeCatalog';
import type {Item,GearSlot,Rarity} from '@/lib/types';
import {type ClassId} from './content';
import {rollOptions} from './balance/options';
import {LOOT,CODEX_SEAL} from './codex';
export const RARITIES = ['Common','Uncommon','Rare','Epic','Legendary','God','Pre-arch','Arch'] as const;
export const GEAR_SLOTS:GearSlot[]=['weapon','offhand','armor','helmet','gloves','boots','ring'];
/** cosmetic outfit slot: changes the 2.5D sprite, no stats */
export const COSTUME_SLOT:GearSlot='costume';
export const EMPTY_GEAR={weapon:null,offhand:null,armor:null,helmet:null,gloves:null,boots:null,ring:null,costume:null};
export type ItemDefinition={id:string;name:string;rarity:Rarity;slot:GearSlot|null;family:string;tier:number;description:string;npcValue:number;bonuses:Item['bonuses'];atlas:string;column:number;columns:number;row:number};
// round 13: one class (Berserker → Reaver) — heavy armour only, physical / defense seals, two-handed weapons (no off-hand).
// Old light / robes / magic / elemental / off-hand items are converted by migrateClassItem (and SQL migration 0012).
const sets={heavy:['Ironbound','Mossguard','Azure Bastion','Duskwarden','Blood Regent','Sun Sentinel','Solar Sovereign','Astral Bulwark']};
export const ITEM_DEFINITIONS:ItemDefinition[]=SOUL_STONES.map(s => ({id:s.id,name:s.name,rarity:'Rare',slot:null,family:'material',tier:2,npcValue:Math.floor(s.price/4),description:'หินวิญญาณมืด · ใช้ 1 ก้อนต่อการตีบวกหนึ่งครั้ง ซื้อได้ที่ร้าน Mira',bonuses:{},atlas:'soul-stones',column:s.cell,columns:3,row:0}));
for(const [family,names] of Object.entries(sets))for(let tier=0;tier<8;tier++)for(const [column,slot] of (['armor','helmet','gloves','boots'] as const).entries()){
 const power=[1,2,4,7,11,16,23,32][tier],factor=slot==='armor'?3:1;
 ITEM_DEFINITIONS.push({id:`${family}-${slot}-${tier}`,name:`${names[tier]} ${slot==='armor'?'Vestment':slot}`,rarity:RARITIES[tier],slot,family,tier,npcValue:Math.max(1,Math.floor((tier+1)*factor)),description:'ทุกอาชีพ · เกราะหนัก ป้องกันและพลังชีวิต',bonuses:{def:power*factor,vit:power},atlas:family,column,columns:4,row:tier});
}
for(let tier=0;tier<8;tier++)for(const [column,family] of ['defense','physical'].entries()){
 const power=[1,2,4,7,11,16,23,32][tier];ITEM_DEFINITIONS.push({id:`accessory-${family}-${tier}`,name:`${RARITIES[tier]} ${family} Seal`,rarity:RARITIES[tier],slot:'ring',family,tier,npcValue:tier+1,description:family==='defense'?'เกราะป้องกัน + พลังชีวิต':'เพิ่มพลังโจมตีกายภาพ',bonuses:family==='defense'?{def:power*2,vit:power}:{atk:power*3,str:power},atlas:'accessories',column,columns:4,row:tier});
}
/** Two-handed weapon kinds (balance proposal berserker-v2): heavier heads hit harder and swing slower, so DPS stays close.
 *  atk = multiplier on the tier's base ATK, speed = multiplier on attack speed (greatsword 1.25 s → axe 1.40 s → hammer 1.55 s). */
export const WEAPON_KINDS={greatsword:{th:'ดาบใหญ่',atk:1,speed:1},greataxe:{th:'ขวานใหญ่',atk:1.15,speed:1.25/1.4},greathammer:{th:'ค้อนใหญ่',atk:1.3,speed:1.25/1.55}} as const;
export type WeaponKind=keyof typeof WEAPON_KINDS;
const WEAPON_NAMES:Record<WeaponKind,string[]>={
 greatsword:['Ironcleaver','Bloodedge','Ruinbrand','Dread Fang','Ember Ruin','Cinder Monarch','Abyss Reaper','Worldsunder'],
 greataxe:['Hewer','Bloodbite','Ravager','Gorefang','Ember Reaver','Cinder Maw','Abyss Ravager','Worldrend'],
 greathammer:['Ironmaul','Bloodmaul','Worldbreaker','Dread Anvil','Ember Maul','Cinder Titan','Abyss Hammer','Worldshatter']};
/** catalog id of a weapon (the greatsword keeps the old class id pattern, as in SQL migration 0012) */
export const weaponId=(kind:WeaponKind,tier:number)=>kind==='greatsword'?`weapon-Berserker-${tier}`:`weapon-${kind}-${tier}`;
export function weaponKindOf(item:{definitionId?:string}|null|undefined):WeaponKind|null{const id=item?.definitionId??'';return id.startsWith('weapon-greataxe-')?'greataxe':id.startsWith('weapon-greathammer-')?'greathammer':id.startsWith('weapon-Berserker-')?'greatsword':null;}
for(let tier=0;tier<8;tier++)for(const [column,kind] of (['greatsword','greataxe','greathammer'] as WeaponKind[]).entries()){
 const power=[2,4,7,11,16,23,32,44][tier],k=WEAPON_KINDS[kind];
 ITEM_DEFINITIONS.push({id:weaponId(kind,tier),name:`${WEAPON_NAMES[kind][tier]} ${kind==='greatsword'?'Greatsword':kind==='greataxe'?'Greataxe':'Greathammer'}`,rarity:RARITIES[tier],slot:'weapon',family:'Berserker',tier,npcValue:(tier+1)*2,
  description:`Berserker · ${k.th}สองมือ · ATK ×${k.atk} · ความเร็วโจมตี ×${k.speed.toFixed(2)}`,bonuses:{atk:Math.round(power*3*k.atk),str:power},atlas:'berserker-arms',column,columns:3,row:tier});
}
/** Round 22: one weapon line per class (8 tiers), class-locked. Icons: public/art/items-arms.webp (10 cols × 8 tiers):
 *  0 sword · 2 staff · 4 mace · 6 bow · 8 sceptre. The Berserker keeps the three two-handed kinds above. */
export const CLASS_WEAPONS:Record<string,{col:number;th:string;stat:'str'|'dex'|'agi'|'int'|'wis';names:string[];kind:string}>={
 Paladin:{col:0,th:'ดาบยาว',stat:'str',kind:'Longsword',names:['Squire','Oathkeeper','Dawnbrand','Lionheart','Sunforged','Radiant','Seraph','Aurora']},
 Hawkeye:{col:6,th:'ธนูยาว',stat:'dex',kind:'Longbow',names:['Hunter','Falconer','Windstring','Galeshot','Stormwing','Skypiercer','Tempest','Zenith']},
 RuneMaster:{col:0,th:'ดาบอักขระ',stat:'int',kind:'Runeblade',names:['Etched','Glyphbound','Sigil','Runecarver','Spellsteel','Arcblade','Aeon','Worldrune']},
 Elementalist:{col:2,th:'คทาธาตุ',stat:'int',kind:'Staff',names:['Ember','Frostbloom','Stormcall','Prism','Tri-Element','Cataclysm','Primordial','Genesis']},
 Assassin:{col:0,th:'มีดคู่',stat:'agi',kind:'Twin Daggers',names:['Cutthroat','Nightfang','Shadeedge','Viper','Duskreaper','Umbral','Voidkiss','Eclipse']},
 HighPriest:{col:8,th:'คทาศักดิ์สิทธิ์',stat:'wis',kind:'Sceptre',names:['Acolyte','Blessed','Hallowed','Sanctum','Divine','Celestial','Seraphic','Empyrean']},
 Inquisitor:{col:4,th:'ค้อนศึก',stat:'int',kind:'Warhammer',names:['Zealot','Verdict','Thunder','Judgement','Stormbrand','Tribunal','Mjolnir','Heavensfall']},
};
for(const [cls,w] of Object.entries(CLASS_WEAPONS))for(let tier=0;tier<8;tier++){
 const power=[2,4,7,11,16,23,32,44][tier];
 ITEM_DEFINITIONS.push({id:`weapon-${cls}-${tier}`,name:`${w.names[tier]} ${w.kind}`,rarity:RARITIES[tier],slot:'weapon',family:cls,tier,npcValue:(tier+1)*2,
  description:`${cls} · ${w.th} · ใช้ได้เฉพาะอาชีพ ${cls}`,bonuses:{atk:power*3,[w.stat]:power},atlas:'arms',column:w.col,columns:10,row:tier});
}
// the Reaver advancement trial item (SQL migration 0012: quest-reaver-sigil)
ITEM_DEFINITIONS.push({id:'quest-reaver-sigil',name:'Reaver Sigil',rarity:'Legendary',slot:null,family:'quest',tier:4,npcValue:1,description:'ตราผู้เก็บเกี่ยว · ของเควสเลื่อนขั้น Reaver',bonuses:{},atlas:'materials',column:3,columns:4,row:0});
for(const [tier,label] of [[3,'Eclipse Shard'],[4,'Regent Core'],[6,'Solar Heart']] as const)for(const kind of ['material','trophy'])ITEM_DEFINITIONS.push({id:`${kind}-${tier}`,name:`${RARITIES[tier]} ${kind==='material'?label:'Dungeon Relic'}`,rarity:RARITIES[tier],slot:null,family:kind,tier,npcValue:kind==='trophy'?[1000,5000,10000][[3,4,6].indexOf(tier)]:1,description:kind==='material'?'วัตถุดิบสำหรับคราฟอุปกรณ์ระดับเดียวกัน · ขายหรือซื้อขายตลาดได้':'ของสะสมจากบอส · แลก SoulGod กับ NPC',bonuses:{},atlas:'accessories',column:0,columns:4,row:tier});
// crafting ore (every monster), failure crystals (Legendary+), food buffs and the Thai white-and-gold costume
ITEM_DEFINITIONS.push({id:'material-ore',name:'Soulforged Ore',rarity:'Common',slot:null,family:'material',tier:0,npcValue:1,description:'แร่หลอมวิญญาณ · วัตถุดิบพื้นฐานของการคราฟทุกระดับ ดรอปจากมอนสเตอร์ทุกชนิด',bonuses:{},atlas:'materials',column:0,columns:4,row:0});
export const CRYSTAL_INFO:Record<'Legendary'|'God'|'Pre-arch'|'Arch',{th:string;color:string}>={Legendary:{th:'คริสตัลโลหิต',color:'#e35a64'},God:{th:'คริสตัลสุริยะ',color:'#ffd36e'},'Pre-arch':{th:'คริสตัลอัคคี',color:'#fb9446'},Arch:{th:'คริสตัลอัสดง',color:'#c58aef'}};
for(const [r,info] of Object.entries(CRYSTAL_INFO))ITEM_DEFINITIONS.push({id:`crystal-${r}`,name:`${r} Forge Crystal`,rarity:r as Rarity,slot:null,family:'crystal',tier:RARITIES.indexOf(r as Rarity),npcValue:1,description:`${info.th} · ได้จากการคราฟระดับ ${r} ที่ไม่สำเร็จ สะสม 3 เม็ดเพื่อคราฟ ${r} สำเร็จ 100% เลือกอาชีพและประเภทได้`,bonuses:{},atlas:'materials',column:1,columns:4,row:0});
export const FOOD_ITEMS:{id:string;name:string;th:string;price:number;buff:{atkPct?:number;defPct?:number;hpRegen?:number;critRate?:number;moveSpeed?:number};minutes:number}[]=[
 {id:'food-hunter-stew',name:"Hunter's Stew",th:'สตูว์นักล่า',price:90,buff:{atkPct:8},minutes:15},
 {id:'food-iron-bread',name:'Ironbark Bread',th:'ขนมปังเปลือกเหล็ก',price:90,buff:{defPct:8},minutes:15},
 {id:'food-ember-tea',name:'Ember Tea',th:'ชาถ่านอุ่น',price:120,buff:{hpRegen:4,critRate:2},minutes:15},
];
for(const f of FOOD_ITEMS)ITEM_DEFINITIONS.push({id:f.id,name:f.name,rarity:'Common',slot:null,family:'consumable',tier:0,npcValue:Math.floor(f.price/4),description:`${f.th} · อาหารบัฟ ${f.minutes} นาที`,bonuses:{},atlas:'materials',column:2,columns:4,row:0});
export const COSTUMES:{id:string;name:string;th:string;sprite:'thai';price:number}[]=[{id:'costume-thai-white-gold',name:'Thai White & Gold Attire',th:'ชุดไทยขาวทอง',sprite:'thai',price:20000}];
for(const c of COSTUMES)ITEM_DEFINITIONS.push({id:c.id,name:c.name,rarity:'God',slot:'costume',family:'costume',tier:0,npcValue:Math.floor(c.price/10),description:`${c.th} · ชุดแฟชั่น (ไม่มีค่าสเตตัส) สวมแล้วตัวละครเปลี่ยนเป็นชุดนี้ ใส่ได้ทั้ง Berserker และ Reaver ชาย/หญิง`,bonuses:{},atlas:'materials',column:3,columns:4,row:0});
// monster loot (round 11): stackable, sells to the shop, tradeable, registered in the codex (src/game/codex.ts)
for(const l of LOOT)ITEM_DEFINITIONS.push({id:l.id,name:l.en,rarity:'Common',slot:null,family:'material',tier:0,npcValue:l.sell,description:`${l.th} · ของดรอปจาก ${l.monsters.join(', ')} · ลงสมุดสะสมเพื่อรับค่าสถานะถาวร หรือขาย / ซื้อขายในตลาด`,bonuses:{},atlas:'loot',column:l.index%6,columns:6,row:Math.floor(l.index/6)});
ITEM_DEFINITIONS.push({id:CODEX_SEAL,name:'Codex Seal',rarity:'Rare',slot:null,family:'material',tier:2,npcValue:5,description:'ตราสมุดสะสม · ใช้ลงสมุดขั้น IV–V · ดรอปจาก Elite (มีโอกาสสูงขึ้นเมื่อมีเพื่อนในปาร์ตี้อยู่ใกล้) และบอสทุกตัว',bonuses:{},atlas:'materials',column:1,columns:4,row:0});
/** round 12: painted single icons (public/art/icons/items/<id>.webp) for shop goods and crafting materials */
export const ITEM_ICONS=new Set(['potion-hp-s','potion-hp-m','potion-hp-l','potion-mp-s','potion-mp-m','scroll-return','scroll-protect','material-ore','material-3','material-4','material-6','codex-seal']);
export const ITEM_BY_ID=Object.fromEntries(ITEM_DEFINITIONS.map(x=>[x.id,x]));
export function makeItem(id:string):Item {const d=ITEM_BY_ID[id];if(!d)throw new Error('Unknown item definition');return {id:crypto.randomUUID(),definitionId:d.id,name:d.name,rarity:d.rarity,slot:d.slot,family:d.family,tier:d.tier,bonuses:{...d.bonuses},description:d.description,npcValue:d.npcValue};}
/** Round 22: weapons are class-locked (the Reaver uses the Berserker's); armour, rings and costumes are shared */
export function canEquip(item:Item,base:ClassId){if(item.slot==='weapon')return item.family===((base as string)==='Reaver'?'Berserker':base);return !item.family||item.slot==='costume'||item.slot==='ring'||item.family==='heavy';}
export function npcPrice(item:Item){return ITEM_BY_ID[item.definitionId??'']?.npcValue??1;}
export function migrateItem(item:Item|null,modern:boolean):Item|null{if(!item)return null;if(modern)return item;const old=['Common','Uncommon','Rare','Epic','Crimson','Legendary','Ascendant','Eclipse'];const tier=old.indexOf(item.rarity);return {...item,rarity:RARITIES[tier<0?0:tier],tier:tier<0?0:tier};}

// ---------------------------------------------------------------- closed beta: class-locked instances with random options
/** Who may wear an instance of this catalog item — round 13: every piece of gear is Berserker gear. */
export function classLockFor(d:ItemDefinition,preferred?:ClassId,rng:()=>number=Math.random):ClassId|undefined{void preferred;void rng;return d.slot&&d.slot!=='costume'?'Berserker':undefined;}
/** Equipment as it drops: class lock, options by rarity (Rare 1 … Arch 4+3), base ATK/DEF only (attributes come from options). */
export function makeGear(id:string,preferred?:ClassId,rng:()=>number=Math.random):Item{
 const base=makeItem(id),d=ITEM_BY_ID[id];if(!d?.slot)return base;
 const classLock=classLockFor(d,preferred,rng);
 return {...base,classLock,name:base.name,bonuses:{atk:base.bonuses.atk,def:base.bonuses.def},options:rollOptions(d.rarity,classLock??null,rng),enhance:0};
}
/** round 20: until each class has its own weapons, the (Berserker) gear is shared — a Berserker lock binds no one */
export function canEquipItem(item:Item,base:ClassId){if(item.slot==='costume')return true;return item.classLock&&item.classLock!=='Berserker'?item.classLock===base:canEquip(item,base);}
/** Gear dropped for a player (one class: any wearable piece of that rarity). */
export function pickGearId(rarity:Item['rarity'],cls:ClassId,rng:()=>number=Math.random){
 const own=(cls as string)==='Reaver'?'Berserker':cls;const pool=ITEM_DEFINITIONS.filter(i=>i.rarity===rarity&&i.slot&&i.slot!=='costume'&&(i.slot!=='weapon'||i.family===own));return pool[Math.floor(rng()*pool.length)].id;
}
/** Round 13: the catalog id an item of the five retired classes maps to (same tier) — the id itself when unchanged */
export function migrateDefId(id:string):string{let m:RegExpMatchArray|null;
 if((m=id.match(/^weapon-(Warrior|Mage|Priest|Archer|Enchanter)-([0-9])$/)))return `weapon-Berserker-${m[2]}`;
 if((m=id.match(/^offhand-[A-Za-z]+-([0-9])$/)))return `weapon-greataxe-${m[1]}`;
 if((m=id.match(/^(light|robes)-(armor|helmet|gloves|boots)-([0-9])$/)))return `heavy-${m[2]}-${m[3]}`;
 if((m=id.match(/^accessory-(magic|elemental)-([0-9])$/)))return `accessory-${m[1]==='magic'?'physical':'defense'}-${m[2]}`;
 return id;
}
/** Round 13: turn an item of the five retired classes into its Berserker counterpart (same tier, same instance, options
 *  and enhancement kept) — mirrors SQL migration 0012. Main-hand weapons → greatsword, off-hands → greataxe, light /
 *  robes armour → heavy, magic / elemental seals → physical / defense. Returns the item unchanged when nothing applies. */
export function migrateClassItem<T extends Item|null>(item:T):T{
 if(!item)return item;const id=item.definitionId??'',next=migrateDefId(id),to=next!==id?next:null;
 const lockOld=item.classLock&&(item.classLock as string)!=='Berserker';
 if(!to&&!lockOld)return item;
 const d=to?ITEM_BY_ID[to]:null;
 const options=(item.options??[]).map(o=>o.kind==='attr'&&o.stat==='int'?{...o,stat:'str' as const}:o);
 return {...item,...(d?{definitionId:d.id,name:d.name,slot:d.slot,family:d.family,tier:d.tier,description:d.description,npcValue:d.npcValue,bonuses:{atk:d.bonuses.atk,def:d.bonuses.def}}:{}),...(item.slot&&item.slot!=='costume'?{classLock:'Berserker'}:{}),options} as T;
}
export const isConsumable=(item:Item|null)=>!!item&&item.family==='consumable';
export const isStackable=(item:Item|null)=>!!item&&['consumable','material','crystal'].includes(item.family??'');
/** costume sprite key for the equipped costume (null = class outfit) */
export const costumeSprite=(item:Item|null|undefined)=>item?.slot==='costume'?COSTUMES.find(c=>c.id===item.definitionId)?.sprite??null:null;
