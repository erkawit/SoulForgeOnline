import { FIELD_HALF, FIELD_GATE_INSET, fieldScale } from './world/fieldDimensions';
import {farmPlan} from './world/farmLayout';
import { configureFieldNavigation, navigationSurface, SWAMP_SPAWNS, fieldImagePoint } from './world/terrainNavigation';
import { blockedByProps } from './world/colliders';
import { CAPITAL_SPAWN, CAPITAL_SPAWNS, CAPITAL_WALK, GATE_POS, OPPOSITE, capitalBlocked, gateArrival, type GateDir } from './world/capitalPlan';
export const CLASS_IDS = ['Paladin', 'Berserker', 'Hawkeye', 'RuneMaster', 'Elementalist', 'Assassin', 'HighPriest', 'Inquisitor'] as const;
export type ClassId = typeof CLASS_IDS[number];
export type MainCityId = 'hollow'|'dawnveil'|'thornwatch';
export type CityId = MainCityId | `wild${number}` | `dungeon${number}`;
export type ActionId = 'idle'|'walk'|'attack'|'skill'|'buff'|'special'|'death';
/** display names (ids carry no spaces) */
export const CLASS_NAME: Record<ClassId,string> = { Paladin:'Paladin', Berserker:'Berserker', Hawkeye:'Hawkeye', RuneMaster:'Rune Master', Elementalist:'Elementalist', Assassin:'Assassin', HighPriest:'High Priest', Inquisitor:'Inquisitor' };
export const CLASSES: Record<ClassId,{role:string;cloth:string;metal:string;glow:string;range:number;skills:[string,string,string];special:string}> = {
 Paladin:{role:'One-hand sword · shield · Frontline tank',cloth:'#3d4a66',metal:'#c9ccd4',glow:'#ffe08a',range:2.2,skills:['Shield Bash','Sacred Vow','Judgement Blade'],special:'Bulwark of Dawn: a holy dome that halves the damage you take.'},
 Hawkeye:{role:'Longbow · Long-range marksman',cloth:'#33503a',metal:'#8a7552',glow:'#8bdb9a',range:9,skills:['Piercing Arrow','Eagle Eye','Arrow Rain'],special:'Storm of Talons: a long volley over the whole area.'},
 RuneMaster:{role:'Rune blade · rune pillars · Spellsword support',cloth:'#2d4652',metal:'#d9b45c',glow:'#62dfdf',range:5,skills:['Venom Rune Burst','Pillar of Valor','Binding Pillar'],special:'Pillar of Ruin: a giant rune pillar that blasts everything around it for 5 seconds.'},
 Elementalist:{role:'Two-hand staff · Fire, frost and storm',cloth:'#3b2a5e',metal:'#9a8fc2',glow:'#b685ff',range:8.5,skills:['Firebolt','Frost Nova','Chain Lightning'],special:'Cataclysm: fire, frost and lightning fall together.'},
 Assassin:{role:'Dual daggers · Shadow burst',cloth:'#24222c',metal:'#7c7f8c',glow:'#c97bff',range:2,skills:['Twin Fang','Shadow Step','Fan of Blades'],special:'Death Lotus: a blur of thirty cuts around you.'},
 HighPriest:{role:'Short staff · orb · Healing and blessings',cloth:'#e8e0cc',metal:'#d9b45c',glow:'#ffdb86',range:7,skills:['Holy Light','Blessing','Sanctuary'],special:'Divine Grace: a great heal and a shield for the whole party.'},
 Inquisitor:{role:'Hammer · shield · Lightning magic',cloth:'#4a2a2a',metal:'#a8a39a',glow:'#8fd3ff',range:2.4,skills:['Thunder Smite','Lightning Burst','Thunderstorm'],special:'Hammer of Thor: the god\'s hammer swings down from the sky and smashes the ground.'},
 Berserker:{role:'Two-handed greatsword · greataxe · greathammer · Frontline',cloth:'#552b32',metal:'#4d4547',glow:'#ff9368',range:2.6,skills:['Rending Rush','Blood Howl','Carnage Cyclone'],special:'Whirlwind: spin for 6 seconds — 36 strikes on everything around you.'}
};
/** round 13: the one advancement — Berserker → Reaver at this level (quest "การเลื่อนขั้น") */
export const REAVER_LEVEL = 60;
/** the balance row a character uses: 'Reaver' once promoted, else its class */
export const statClass = (p: { classId?: ClassId; promotionId?: string }): ClassId | 'Reaver' => p.promotionId === 'Reaver' && (p.classId ?? 'Berserker') === 'Berserker' ? 'Reaver' : (p.classId && CLASS_IDS.includes(p.classId) ? p.classId : 'Berserker');
/** classes that fight from range (basic attack is a projectile) */
export const RANGED: Record<ClassId, boolean> = { Paladin:false, Berserker:false, Hawkeye:true, RuneMaster:true, Elementalist:true, Assassin:false, HighPriest:true, Inquisitor:false };
export const TIER_COLORS=['#d9dce3','#69cf7b','#57b9f6','#ae79ed','#e35a64','#e6c36d','#fb9446','#c58aef'];
export const TIER_NAMES=['Common','Uncommon','Rare','Epic','Legendary','God','Pre-arch','Arch'];
export const TIER_POWER=[1,1.15,1.35,1.6,1.9,2.25,2.65,3.1];
export type Building={x:number;z:number;w:number;d:number;h:number;kind:'house'|'tower'|'temple'|'forge'};
export type City={id:CityId;name:string;subtitle:string;ground:string;stone:string;roof:string;sky:string;accent:string;mapPath:string;buildings:Building[];water?:{x:number;w:number;bridges?:number[]};hunt:[number,number][];description:string;parent?:MainCityId;levels?:[number,number];biome?:string;species?:string[];monsterLevels?:number[];dungeon?:number;entrance?:CityId};
export const CITIES:Record<CityId,City>={
 hollow:{id:'hollow',name:'Hollow Reach',subtitle:'The iron sanctuary',ground:'#47464b',stone:'#66666c',roof:'#263843',sky:'#131c29',accent:'#62d7cb',mapPath:'M-23 0H23 M0 -23V23 M-18 -13H18',description:'เมืองป้อมกอธิก ลานหลอมวิญญาณกลางเมือง ย่านช่างตีเหล็กทางตะวันตก และประตูเหนือสู่สุสาน',buildings:[{x:-12,z:-9,w:6,d:5,h:4,kind:'forge'},{x:11,z:-9,w:6,d:5,h:4,kind:'house'},{x:-12,z:9,w:6,d:5,h:4,kind:'house'},{x:12,z:9,w:6,d:5,h:4,kind:'house'},{x:-6,z:-17,w:3,d:3,h:7,kind:'tower'},{x:6,z:-17,w:3,d:3,h:7,kind:'tower'}],hunt:[[-30,-28],[-16,-30],[28,-28],[30,30],[15,31],[-29,29]]},
 dawnveil:{id:'dawnveil',name:'Dawnveil',subtitle:'Sanctum of the first light',ground:'#7b7970',stone:'#a5a394',roof:'#536477',sky:'#344456',accent:'#f4d793',mapPath:'M-23 0H23 M0 -23V23 M8 -23V23 M-16 -12H0',description:'เมืองวิหารหินงาช้างริมคลอง มหาวิหารทางเหนือ ย่านตลาดฝั่งตะวันตก ท่าเรือและโรงตีเหล็กริมคลอง นอกเมืองมีทุ่งกังหันลม ทางผู้แสวงบุญ และโบสถ์ร้างที่ขอบแผนที่',water:{x:8,w:4,bridges:[0,-30,28]},buildings:[{x:0,z:-15.5,w:10,d:6,h:6,kind:'temple'},{x:-11,z:-9,w:6,d:4.4,h:4,kind:'house'},{x:-11,z:9.5,w:6,d:4.4,h:4,kind:'house'},{x:16.5,z:-9,w:6,d:4.4,h:4,kind:'forge'},{x:16.5,z:9.5,w:5.4,d:4.4,h:4,kind:'house'}],hunt:[[-42,-34],[-44,12],[-24,42],[-2,-44],[30,-40],[44,-6],[40,34],[18,44]]},
 thornwatch:{id:'thornwatch',name:'Thornwatch',subtitle:'Wardens of the old forest',ground:'#454d3e',stone:'#6e6553',roof:'#344c43',sky:'#172b28',accent:'#a7d693',mapPath:'M-23 0H23 M0 -23V23 M-10 -10L10 10 M-10 10L10 -10',description:'เมืองชายป่าล้อมรากไม้โบราณ ลานเข็มทิศรอบศิลาวิญญาณ กระท่อมพรานและโถงผู้พิทักษ์ นอกเมืองมีไร่ชาวบ้าน ค่ายพราน โรงสีเก่า และขอบป่าที่มีสัตว์ป่าออกล่า',buildings:[{x:0,z:-16,w:5,d:4.4,h:5,kind:'tower'},{x:-10.5,z:-9,w:5.6,d:4.4,h:3,kind:'house'},{x:10.5,z:-9,w:5.6,d:4.4,h:3,kind:'house'},{x:-10.5,z:9.5,w:6.6,d:4.4,h:3,kind:'forge'},{x:10.5,z:9.5,w:5.6,d:4.4,h:3,kind:'house'}],hunt:[[-40,-38],[-44,6],[-30,40],[8,-44],[36,-36],[44,8],[38,38],[4,45]]}
};
export const CITY_IDS=Object.keys(CITIES) as CityId[];
// Shared visual/collision dimensions for the northern fortress walls.
export const CAPITAL_WALLS:Partial<Record<CityId,{x:number;z:number;w:number;d:number}[]>>={}; // the capitals' walls are their outer edge now (capitalPlan.ts)
export const ZONE_SPECS = [
 ['Ashen Outskirts','hollow','grave','สุสานนอกกำแพงและซุ้มประตูหิน','Grave Crawler','Ash Hound','Bone Sentinel'],
 ['Briarwood Trail','thornwatch','forest','ป่ารากไม้และเห็ดเรืองแสง','Briar Wolf','Thorn Spider','Bark Guardian'],
 ['Drowned Cloister','dawnveil','water','อารามริมคลองและสะพานหิน','Reed Stalker','Tide Crab','Fen Maw Otter'],
 ['Cinder Quarry','hollow','lava','เหมืองออบซิเดียนและรอยแยกไฟ','Cinder Beetle','Ironhide Rhino','Slag Hound'],
 ['Moonroot Grove','thornwatch','grove','พฤกษาเรืองแสงใต้แสงจันทร์','Moon Moth','Root Weaver','Ancient Treant'],
 ['Frostglass Abbey','dawnveil','ice','วิหารเยือกแข็งและผลึกน้ำแข็ง','Frost Wraith','Crystal Golem','Rime Serpent'],
 ['Black Anvil Bastion','hollow','fortress','ป้อมเหล็กดำและเสาหลอมวิญญาณ','Anvil Guard','Furnace Golem','Ember Drake'],
 ['Venomheart Wilds','thornwatch','poison','ป่าพิษและเห็ดขนาดยักษ์','Venom Spider','Spore Beast','Thorn Hydra'],
 ['Astral Basilica','dawnveil','astral','มหาวิหารดวงดาวและแท่นผลึก','Astral Wraith','Prism Sentinel','Halo Seraph'],
 ['Eclipse Crucible','hollow','eclipse','วงแหวนหลอมสุริยุปราคา ปลายทางทั้งสามอาณาเขต','Void Reaper','Eclipse Drake','Crown Colossus']
] as const;
export const ZONE_IDS:CityId[]=ZONE_SPECS.map((_,i)=>`wild${i}` as CityId);
ZONE_SPECS.forEach((spec,i)=>{
 const [name,parent,biome,description,...species]=spec,base=CITIES[parent],id=ZONE_IDS[i];
 const palette=['#363239','#273b2c','#3b5058','#352c2b','#293346','#718795','#282a31','#38452a','#343448','#211c30'];
 CITIES[id]={...base,id,name,parent,biome,description,species:[...species],levels:[i*10+1,i*10+10],ground:palette[i],sky:palette[i],water:biome==='water'?{x:8,w:4}:undefined,
 buildings:[{x:-12,z:-9,w:4,d:4,h:3+i*.25,kind:parent==='thornwatch'?'tower':'temple'},{x:13,z:11,w:4,d:4,h:4,kind:'tower'}],
 hunt:[[-19,-18],[-9,-19],[0,-20],[17,-18],[20,-7],[20,5],[18,20],[0,20],[-17,18],[-21,5]],mapPath:'M-23 0H23 M0 -23V23'};
});
// Exact level bands for the three city regions. Higher levels live in dungeons.
const bands=[ [1,5,10],[20,25],[30,35],[40],[45,60],[75],[79],[82],[85],[90] ];
ZONE_IDS.forEach((id,i)=>{const parent=i<4?'hollow':i<8?'dawnveil':'thornwatch';CITIES[id]={...CITIES[id],parent,levels:[bands[i][0],bands[i].at(-1)!],monsterLevels:bands[i]};});
export const DUNGEON_IDS:CityId[]=['dungeon1','dungeon2','dungeon3'];
const dungeonSpecs=[
 {name:'Sepulcher of the Iron Oath',parent:'hollow' as const,entrance:'wild3' as const,biome:'grave',levels:[25,30,35,40],species:['Crypt Crawler','Oathscar Aurochs','Grave Marshal'],color:'#62535e'},
 {name:'Cathedral of Broken Tides',parent:'dawnveil' as const,entrance:'wild5' as const,biome:'ice',levels:[60,75,79,82,85],species:['Tide Wraith','Prism Sentinel','Drowned Hierophant'],color:'#567688'},
 {name:'Heart of the Eclipse Root',parent:'thornwatch' as const,entrance:'wild9' as const,biome:'poison',levels:[90,92,94,96,98,100],species:['Root Reaper','Eclipse Drake','Worldroot Devourer'],color:'#51425f'}
];
dungeonSpecs.forEach((d,i)=>{const base=CITIES[d.parent],id=DUNGEON_IDS[i];CITIES[id]={...base,id,name:d.name,parent:d.parent,entrance:d.entrance,dungeon:i+1,biome:d.biome,ground:d.color,sky:'#13131b',water:undefined,description:'Elite ทั้งหมด · HP/พลังโจมตี ×3 · EXP ×5 · ปาร์ตี้ / FreePK ตามกติกาออนไลน์ที่วางไว้',subtitle:'Elite farm dungeon',levels:[d.levels[0],d.levels.at(-1)!],monsterLevels:d.levels,species:d.species,buildings:[{x:-10,z:-7,w:2,d:8,h:5,kind:'tower'},{x:10,z:-7,w:2,d:8,h:5,kind:'tower'},{x:-10,z:10,w:2,d:6,h:4,kind:'tower'},{x:10,z:10,w:2,d:6,h:4,kind:'tower'}],hunt:[[-19,-18],[-9,-19],[0,-20],[17,-18],[20,-7],[20,5],[18,20],[0,20],[-17,18],[-21,5]],mapPath:'M0 0V-20 M-20 -18H20 M-20 -18V20H20V-18'};});
export function pkAllowed(city:CityId,attackerStage:number,targetStage:number,inSanctuary=false){const c=CITIES[city];if(inSanctuary||!c.parent)return false;return c.parent!=='hollow'||(attackerStage>=2&&targetStage>=2);}
export const isClass=(x:unknown):x is ClassId=>CLASS_IDS.includes(x as ClassId);
export const isCity=(x:unknown):x is CityId=>Object.prototype.hasOwnProperty.call(CITIES,x as string);
/** The three capitals are walled squares (world/capitalPlan.ts, after mmorpg-world-assets/cities/<city>/maps/city.png) that open
 *  through a waygate in each corner onto their hunting fields (CAPITAL_GATES). Walkable square = ±limit; Ashen Outskirts
 *  (wild0, below Hollow Reach's south gate) carries the Sorrowlands ruins out to the shared field boundary. */
export const WORLD_LIMIT:Partial<Record<CityId,number>>={
 hollow:CAPITAL_WALK,dawnveil:CAPITAL_WALK,thornwatch:CAPITAL_WALK,
 ...Object.fromEntries([...ZONE_IDS,...DUNGEON_IDS].map(id=>[id,FIELD_HALF])),
};
// Reposition the authored landmarks without enlarging individual actors or buildings.
for(const id of [...ZONE_IDS,...DUNGEON_IDS]){
 const c=CITIES[id],s=fieldScale(id),round=(n:number)=>Math.round(n*100)/100;
 c.buildings=c.buildings.map(b=>({...b,x:round(b.x*s),z:round(b.z*s)}));
 c.hunt=c.hunt.map(([x,z])=>[round(x*s),round(z*s)]);
 if(c.water)c.water={...c.water,x:round(c.water.x*s),bridges:(c.water.bridges??[0]).map(z=>round(z*s))};
 c.mapPath=c.mapPath.replace(/-?\d+(?:\.\d+)?/g,n=>String(round(Number(n)*s)));
}
export function walkable(city:CityId,x:number,z:number){
 const lim=WORLD_LIMIT[city]??23;
 if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>lim||Math.abs(z)>lim)return false;
 const c=CITIES[city];
 if(c.parent&&navigationSurface(city,x,z)==='blocked')return false;
 if(!c.parent&&capitalBlocked(city,x,z))return false; // walls, Dawnveil's canal
 if(c.water&&Math.abs(x-c.water.x)<c.water.w/2+.25&&!(c.water.bridges??[0]).some(b=>Math.abs(z-b)<=2.1))return false;
 if(c.buildings.some(b=>Math.abs(x-b.x)<b.w/2+.4&&Math.abs(z-b.z)<b.d/2+.4))return false;
 // painted buildings, trees, rocks, tombstones, NPCs… registered by world/registry.ts → setColliders
 return !blockedByProps(city,x,z);
}
/** inside a capital's walls: safe ground, monsters never step in (the capitals have no monsters at all) */
export const inTown=(city:CityId,x:number,z:number)=>!CITIES[city].parent&&Math.abs(x)<=CAPITAL_WALK+1&&Math.abs(z)<=CAPITAL_WALK+1;
export function safePosition(city:CityId,p:unknown):[number,number]{return Array.isArray(p)&&p.length===2&&walkable(city,p[0],p[1])?[p[0],p[1]]:homePoint(city);}

// ---------------------------------------------------------------- the capitals and how the maps link up
// mmorpg-world-assets docs/README-TH.md: every capital has a waygate in each corner of its walls; each gate opens onto one
// hunting field, and you arrive in that field on its far side (leave a capital by its top gate → enter the field from the
// field's bottom). The dungeon of each region is reached from the field above its capital. Which field hangs off which gate
// follows the field paintings and the level bands (docs/WORLD_LINKS_TH.md has the full table and the reasons).
for(const id of ['hollow','dawnveil','thornwatch'] as MainCityId[]){const c=CITIES[id];c.buildings=[];c.hunt=[];c.water=undefined;}
CITIES.hollow.description='ปราการนครสุสาน กำแพงหินดำสี่ด้าน ลานเข็มทิศกลางเมือง วิหารทางเหนือ ป้อมยามทางใต้ และอาคารบริการครบ 9 หลัง · ประตูวาร์ปทั้งสี่มุมออกสู่ทุ่งล่าของภูมิภาค';
CITIES.dawnveil.description='นครอรุณศักดิ์สิทธิ์ หินงาช้างหลังคาน้ำเงิน คลองเลียบกำแพง รูปปั้นเทวทูตกลางลาน มหาวิหารทางเหนือ และอาคารบริการครบ 9 หลัง · ประตูวาร์ปทั้งสี่มุมออกสู่ทุ่งล่าของภูมิภาค';
CITIES.thornwatch.description='นครพิทักษ์พงไพรในรากไม้โบราณ ปราการรากไม้และหอเฝ้าระวัง ลานเข็มทิศ ศาลาพรทางเหนือ และอาคารบริการครบ 9 หลัง · ประตูวาร์ปทางเหนือและตะวันออกออกสู่ทุ่งล่า อีกสองประตูเป็นทางลัดกลับ Dawnveil และ Hollow Reach';

/** what each corner waygate of a capital opens onto */
export const CAPITAL_GATES:Record<MainCityId,Record<GateDir,CityId>>={
 hollow:{bottom:'wild0',left:'wild1',right:'wild2',top:'wild3'},
 dawnveil:{left:'wild4',top:'wild5',right:'wild6',bottom:'wild7'},
 thornwatch:{top:'wild9',right:'wild8',left:'dawnveil',bottom:'hollow'},
};
/** the painting of each field (mmorpg-world-assets/cities/<city>/maps/field-<dir>.png) and its name on the map pack */
export const FIELD_ART:Partial<Record<CityId,{city:MainCityId;map:string;th:string}>>={
 wild0:{city:'hollow',map:'field-bottom',th:'สุสานเถ้าถ่าน'},wild1:{city:'hollow',map:'field-left',th:'ทุ่งกระดูกเงียบ'},
 wild2:{city:'hollow',map:'field-right',th:'หนองวิญญาณ'},wild3:{city:'hollow',map:'field-top',th:'เหมืองมรกตต้องสาป'},
 wild4:{city:'dawnveil',map:'field-left',th:'สวนคำสาบาน'},wild5:{city:'dawnveil',map:'field-top',th:'บันไดแห่งคำพิพากษา'},
 wild6:{city:'dawnveil',map:'field-right',th:'คลองแสงดับ'},wild7:{city:'dawnveil',map:'field-bottom',th:'ทุ่งอรุณร้าง'},
 wild8:{city:'thornwatch',map:'field-right',th:'ป่าหนามอสูร'},wild9:{city:'thornwatch',map:'field-top',th:'ช่องเขารากมังกร'},
 dungeon1:{city:'hollow',map:'dungeon',th:'ถ้ำมรกตแห่งความตาย'},dungeon2:{city:'dawnveil',map:'dungeon',th:'มหาวิหารพิพากษา'},dungeon3:{city:'thornwatch',map:'dungeon',th:'ถ้ำมังกรแห่งหายนะ'},
};
/** Thornwatch's west and south gate paintings (หุบธารหมอก, ป่ารากพันธนาการ) have no level band of their own yet: those gates
 *  are shortcuts back to the other two capitals until a field is designed for them */
export const UNUSED_FIELD_ART=[{city:'thornwatch' as MainCityId,map:'field-left',th:'หุบธารหมอก'},{city:'thornwatch' as MainCityId,map:'field-bottom',th:'ป่ารากพันธนาการ'}];

/** the capital gate that leads to `to` (null if none) */
export function gateTo(city:CityId,to:CityId):GateDir|null{const g=(CAPITAL_GATES as Record<string,Record<GateDir,CityId>>)[city];if(!g)return null;return (Object.keys(g) as GateDir[]).find(d=>g[d]===to)??null;}
/** the capital and gate a field hangs off */
export function fieldGate(id:CityId):{city:MainCityId;dir:GateDir}|null{
 for(const city of ['hollow','dawnveil','thornwatch'] as MainCityId[]){const d=gateTo(city,id);if(d)return {city,dir:d};}return null;}

/** waygates inside the fields and dungeons sit in the corners too, (±FIELD_GATE_D, ±FIELD_GATE_D) */
export const FIELD_GATE_D=FIELD_HALF-FIELD_GATE_INSET;
const CORNER:Record<GateDir,[number,number]>={top:[-1,-1],bottom:[1,1],left:[-1,1],right:[1,-1]};
export type Portal={to:CityId;x:number;z:number;dir:GateDir;kind:'city'|'field'|'dungeon'};
/** Every waygate of a map: the four corners of a capital, and in a field the way back (on the side facing its capital) plus
 *  the dungeon door at the far end of the field above each capital. Dungeons lead back to their entrance field. */
export function portalsOf(id:CityId):Portal[]{
 const c=CITIES[id];if(!c)return [];
 if(!c.parent)return (Object.entries(CAPITAL_GATES[id as MainCityId]) as [GateDir,CityId][]).map(([dir,to])=>{const [x,z]=GATE_POS[dir];return {to,dir,x,z,kind:CITIES[to].parent?'field':'city'};});
 const out:Portal[]=[];const at=(dir:GateDir,to:CityId,kind:Portal['kind'])=>{const [x,z]=CORNER[dir];const entry=farmPlan(id)?.entryGatePositionM;const sign=kind==='dungeon'?-1:1;out.push({to,dir,x:entry?entry[0]*sign:x*FIELD_GATE_D,z:entry?entry[1]*sign:z*FIELD_GATE_D,kind});};
 if(c.dungeon){at('bottom',c.entrance!,'field');return out;}
 const g=fieldGate(id);if(g)at(OPPOSITE[g.dir],g.city,'city');else at('bottom',c.parent,'city');
 for(const d of DUNGEON_IDS)if(CITIES[d].entrance===id)at(g?g.dir:'top',d,'dungeon');
 return out;
}
/** where you appear in `to` coming from `from`: just inside the waygate that leads back, else the map's home point */
export function arrivalPoint(from:CityId|undefined,to:CityId):[number,number]{
 if(!CITIES[to].parent){const d=from?gateTo(to,from):null;return d?gateArrival(to as MainCityId,d):CAPITAL_SPAWN;}
 const back=from?portalsOf(to).find(p=>p.to===from):undefined,p=back??portalsOf(to)[0];if(!p)return [0,0];
 const k=(Math.hypot(p.x,p.z)-4.2)/Math.hypot(p.x,p.z);return [Math.round(p.x*k*100)/100,Math.round(p.z*k*100)/100];
}
/** where a map puts you when nothing else says (respawn, a bad save): the capital plaza steps, a field's way home */
export const homePoint=(city:CityId):[number,number]=>arrivalPoint(undefined,city);
/** round 13: where a character respawns — in a capital one of the eight plaza arrival points, picked from the name so the
 *  browser and the realm agree and a crowd of revivals spreads out; elsewhere the area's home point */
export function respawnPoint(city:CityId,name:string):[number,number]{if(CITIES[city].parent)return homePoint(city);let h=0;for(const ch of name)h=(h*31+ch.charCodeAt(0))>>>0;const p=CAPITAL_SPAWNS[h%CAPITAL_SPAWNS.length];return walkable(city,p[0],p[1])?[p[0],p[1]]:homePoint(city);}
/** near a waygate: monsters do not follow you there (fields and dungeons) */
export const nearPortal=(city:CityId,x:number,z:number,r=6)=>portalsOf(city).some(p=>Math.hypot(p.x-x,p.z-z)<r);

// The fields reuse one ring of hunting points; any point within 8 m of one of the field's waygates is turned round the
// centre (22.5° at a time) until it is clear of them, so nobody arrives next to a pack.
for(const id of [...ZONE_IDS,...DUNGEON_IDS]){
 const ps=portalsOf(id),c=CITIES[id],taken:[number,number][]=[];
 c.hunt=c.hunt.map(([x,z])=>{let a=Math.atan2(z,x);const r=Math.hypot(x,z);
  for(let i=0;i<16;i++){const px=Math.cos(a)*r,pz=Math.sin(a)*r;if(ps.every(p=>Math.hypot(p.x-px,p.z-pz)>=8)&&taken.every(([tx,tz])=>Math.hypot(tx-px,tz-pz)>=4.5)){taken.push([px,pz]);return [Math.round(px*10)/10,Math.round(pz*10)/10] as [number,number];}a+=Math.PI/8;}
  taken.push([x,z]);return [x,z] as [number,number];});
}
// The swamp uses only its traced dry courtyards and bridges, not the old generic canal strip.
CITIES.wild2.water=undefined;
CITIES.wild2.hunt=SWAMP_SPAWNS;
CITIES.wild2.buildings=[[550,350],[880,460]].map(([u,v],i)=>{
 const [x,z]=fieldImagePoint(u,v);return {x,z,w:5,d:5,h:5,kind:i?'tower':'temple'};
});
for(const id of [...ZONE_IDS,...DUNGEON_IDS]){
 // round 23: measured 240 m farm layouts replace the old 140 m hunting spots, water and ruins
 const p=farmPlan(id);
 if(p){CITIES[id].hunt=p.huntingGroups.map(g=>[g.positionM.x,g.positionM.y]);CITIES[id].water=undefined;CITIES[id].buildings=[];CITIES[id].name=p.nameTh;}
 configureFieldNavigation(id,CITIES[id].hunt,portalsOf(id).map(p=>[p.x,p.z]));
}
