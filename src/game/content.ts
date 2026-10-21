export const CLASS_IDS = ['Warrior','Mage','Priest','Archer','Enchanter'] as const;
export type ClassId = typeof CLASS_IDS[number];
export type MainCityId = 'hollow'|'dawnveil'|'thornwatch';
export type CityId = MainCityId | `wild${number}`;
export type ActionId = 'idle'|'walk'|'attack'|'skill'|'buff'|'special'|'death';
export const CLASSES: Record<ClassId,{role:string;cloth:string;metal:string;glow:string;range:number;skills:[string,string,string];special:string}> = {
 Warrior:{role:'Sword & shield · Frontline',cloth:'#632f3b',metal:'#69727a',glow:'#62d7cb',range:3,skills:['Crescent Cleave','Iron Vow','Bastion'],special:'Block incoming damage by 70% for 4 seconds.'},
 Mage:{role:'Two-handed staff · Arcane damage',cloth:'#322f59',metal:'#6c647a',glow:'#b685ff',range:9,skills:['Astral Lance','Arcane Attunement','Eclipse Nova'],special:'Channel 1.6 seconds, then strike nearby enemies.'},
 Priest:{role:'Mace & tome · Restoration',cloth:'#ded5b3',metal:'#a9945c',glow:'#ffdb86',range:7,skills:['Dawn Smite','Covenant','Renewal'],special:'Channel 1.3 seconds to restore 40% maximum health.'},
 Archer:{role:'Bow & quiver · Ranged damage',cloth:'#365346',metal:'#857462',glow:'#8bdb9a',range:11,skills:['Piercing Thread','Hunters Focus','Charged Shot'],special:'Draw for 1.5 seconds, then fire a powerful shot.'},
 Enchanter:{role:'Rune gauntlet & focus · Support',cloth:'#285357',metal:'#a58b5c',glow:'#62dfdf',range:8,skills:['Rune Fracture','Inscription','Concord Field'],special:'Channel 1.4 seconds; allies in the field gain protection.'}
};
export const TIER_COLORS=['#d9dce3','#69cf7b','#57b9f6','#ae79ed','#e35a64','#e6c36d','#fb9446','#c58aef'];
export const TIER_NAMES=['White','Green','Blue','Purple','Red','Gold','Orange','Violet-Gold'];
export const TIER_POWER=[1,1.15,1.35,1.6,1.9,2.25,2.65,3.1];
export type Building={x:number;z:number;w:number;d:number;h:number;kind:'house'|'tower'|'temple'|'forge'};
export type City={id:CityId;name:string;subtitle:string;ground:string;stone:string;roof:string;sky:string;accent:string;mapPath:string;buildings:Building[];water?:{x:number;w:number};hunt:[number,number][];description:string;parent?:MainCityId;levels?:[number,number];biome?:string;species?:string[]};
export const CITIES:Record<CityId,City>={
 hollow:{id:'hollow',name:'Hollow Reach',subtitle:'The iron sanctuary',ground:'#47464b',stone:'#66666c',roof:'#263843',sky:'#131c29',accent:'#62d7cb',mapPath:'M-23 0H23 M0 -23V23 M-18 -13H18',description:'เมืองป้อมกอธิก ลานหลอมวิญญาณกลางเมือง ย่านช่างตีเหล็กทางตะวันตก และประตูเหนือสู่สุสาน',buildings:[{x:-12,z:-9,w:6,d:5,h:4,kind:'forge'},{x:11,z:-9,w:6,d:5,h:4,kind:'house'},{x:-12,z:9,w:6,d:5,h:4,kind:'house'},{x:12,z:9,w:6,d:5,h:4,kind:'house'},{x:-6,z:-17,w:3,d:3,h:7,kind:'tower'},{x:6,z:-17,w:3,d:3,h:7,kind:'tower'}],hunt:[[-7,-22],[0,-22],[7,-22],[-21,8],[21,8],[0,22]]},
 dawnveil:{id:'dawnveil',name:'Dawnveil',subtitle:'Sanctum of the first light',ground:'#7b7970',stone:'#a5a394',roof:'#536477',sky:'#344456',accent:'#f4d793',mapPath:'M-23 0H23 M0 -23V23 M8 -23V23 M-16 -12H0',description:'เมืองวิหารหินงาช้างริมคลอง สะพานกลางเชื่อมย่านการค้า วิหารทางเหนือ และทางล่าตามตลิ่งใต้',water:{x:8,w:4},buildings:[{x:0,z:-13,w:7,d:6,h:6,kind:'temple'},{x:-13,z:-10,w:5,d:5,h:4,kind:'house'},{x:-12,z:10,w:6,d:5,h:4,kind:'house'},{x:16,z:-9,w:5,d:5,h:4,kind:'house'},{x:17,z:10,w:5,d:5,h:4,kind:'forge'}],hunt:[[-18,20],[-10,21],[0,22],[16,21],[21,3],[-22,-3]]},
 thornwatch:{id:'thornwatch',name:'Thornwatch',subtitle:'Wardens of the old forest',ground:'#454d3e',stone:'#6e6553',roof:'#344c43',sky:'#172b28',accent:'#a7d693',mapPath:'M-23 0H23 M0 -23V23 M-10 -10L10 10 M-10 10L10 -10',description:'เมืองชายป่าล้อมต้นไม้โบราณ ทางเดินวงแหวนรอบศิลาวิญญาณ กระท่อมพรานและหอเฝ้าระวัง ก่อนเข้าสู่ป่าด้านตะวันออก',buildings:[{x:-12,z:-9,w:5,d:5,h:3,kind:'house'},{x:11,z:-10,w:5,d:5,h:3,kind:'house'},{x:-12,z:10,w:5,d:5,h:3,kind:'forge'},{x:11,z:10,w:4,d:4,h:6,kind:'tower'},{x:0,z:-17,w:4,d:4,h:5,kind:'tower'}],hunt:[[21,-12],[22,0],[21,15],[0,22],[-21,10],[-21,-10]]}
};
export const CITY_IDS=Object.keys(CITIES) as CityId[];
export const ZONE_SPECS = [
 ['Ashen Outskirts','hollow','grave','สุสานนอกกำแพงและซุ้มประตูหิน','Grave Crawler','Ash Hound','Bone Sentinel'],
 ['Briarwood Trail','thornwatch','forest','ป่ารากไม้และเห็ดเรืองแสง','Briar Wolf','Thorn Spider','Bark Guardian'],
 ['Drowned Cloister','dawnveil','water','อารามริมคลองและสะพานหิน','Reed Stalker','Tide Crab','Drowned Acolyte'],
 ['Cinder Quarry','hollow','lava','เหมืองออบซิเดียนและรอยแยกไฟ','Cinder Beetle','Iron Golem','Slag Hound'],
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
export const isClass=(x:unknown):x is ClassId=>CLASS_IDS.includes(x as ClassId);
export const isCity=(x:unknown):x is CityId=>Object.prototype.hasOwnProperty.call(CITIES,x as string);
export function walkable(city:CityId,x:number,z:number){
 if(!Number.isFinite(x)||!Number.isFinite(z)||Math.abs(x)>23||Math.abs(z)>23)return false;
 const c=CITIES[city];
 if(c.water&&Math.abs(x-c.water.x)<c.water.w/2+.25&&Math.abs(z)>2.1)return false;
 return !c.buildings.some(b=>Math.abs(x-b.x)<b.w/2+.4&&Math.abs(z-b.z)<b.d/2+.4);
}
export function safePosition(city:CityId,p:unknown):[number,number]{return Array.isArray(p)&&p.length===2&&walkable(city,p[0],p[1])?[p[0],p[1]]:[0,0];}
