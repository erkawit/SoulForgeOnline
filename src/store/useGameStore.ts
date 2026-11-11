import {isColKey} from '@/game/collection';
import {spawnPoints} from '@/game/spawns';
import {monsterExp,monsterSoulGod,bossDrops} from '@/game/rewards';
import {EMPTY_GEAR,canEquipItem,migrateItem,npcPrice,makeGear,isConsumable,type WeaponKind} from '@/game/items';
import {canPromote,validPromotion,classLook,type PromotionId} from '@/game/advancement';
import {advanceMonster,lineClear} from '@/game/monsterAI';
import { CITIES, isClass, isCity, walkable, safePosition, WORLD_LIMIT, arrivalPoint, homePoint, respawnPoint, statClass, RANGED, type ClassId, type CityId, type ActionId } from '@/game/content';
import { useMultiplayerStore } from './useMultiplayerStore';
import { cfg, skillLib } from './useConfigStore';
import { create } from 'zustand';
import { deriveFor, rollLoot } from '@/lib/combat';
import { incomingDamage, monsterStats, rollDamage, type ActiveBuff, type Derived } from '@/game/balance/stats';
import { newbieBuff, refreshNewbie } from '@/game/balance/buffs';
import { resolveEnhance } from '@/game/balance/enhance';
import { CLASS_EXTRA, DEFAULT_HOTBAR, evolvedSkill } from '@/game/skills/defaults';
import { learn, needsTarget, resetCost, resolveSkill, starterLevels, type FxRef, type Hotbar, type Outcome, type SkillDef, type SkillLevels } from '@/game/skills/engine';
import { NPC_BY_ID, SHOP_ITEMS, STARTER_KITS, nearNpc, type NpcService } from '@/game/npcs';
import { starterGear, starterPlayer } from '@/lib/seed';
import '@/game/world/registry'; // registers tree/rock/NPC colliders so walkable() blocks them
import type { DamageKind } from '@/game/fx/damageText';
import type { CharacterClip } from '@/game/characterModels';
import type { GearSlot, Item, Loot, Monster, Player, Rarity, Snapshot } from '@/lib/types';
import { FOOD_ITEMS, COSTUMES, ITEM_BY_ID, makeItem as makeCatalogItem } from '@/game/items';
import { acceptQuest as acceptQ, questEvent, turnInQuest as turnInQ, QUEST_BY_ID, type QuestEvent, type QuestLog } from '@/game/quests';
import { tipFor, markSeen, type Tip, type TipTrigger } from '@/game/tutorial';
import { defaultAuto, type AutoSettings } from '@/game/auto';
import { craftBlocker, craftCost, crystalCraft as crystalRoll, crystalId, rollCraft, type CraftSlot, type CrystalTier } from '@/game/balance/craft';
import { zoneAt } from '@/game/world/zones';
import { audio, BASIC_SFX, MONSTER_SFX, sfxForElement, SKILL_SFX, tierOf, monsterPitch } from '@/game/audio/engine';
import { skillRoles } from '@/game/auto';
import * as eco from '@/game/economy/core';
import * as cdx from '@/game/economy/codex';
import { LOOT_BY_ID } from '@/game/codex';
import { FASHION_SLOTS, type FashionSlot, type Wardrobe } from '@/game/fashion';
/** a saved wardrobe from storage: only string ids, only known slots, worn ⊆ owned */
function cleanWardrobe(w:unknown):Wardrobe{const o=(w??{}) as {owned?:unknown;worn?:unknown};const owned=Array.isArray(o.owned)?[...new Set(o.owned.filter((x):x is string=>typeof x==='string'))]:[];
  const worn:Wardrobe['worn']={};if(o.worn&&typeof o.worn==='object')for(const[k,v]of Object.entries(o.worn))if(FASHION_SLOTS.includes(k as FashionSlot)&&typeof v==='string'&&owned.includes(v))worn[k as FashionSlot]=v;return{owned,worn};}
import { authority, newIds, RNG_OPS, type ActOp } from './authority';

type AttackResult = { hit: boolean; reason?: string; damage?: number; crit?: boolean };
/** One floating combat number for DamageLayer (delay = when the effect visibly connects). */
export type CombatEvent = { seq: number; kind: DamageKind; value: number | string; x: number; z: number; on: 'monster' | 'player'; id?: string; delay?: number; accent?: string };
let combatSeq = 0;
const pushCombat = (list: CombatEvent[], ...evs: Omit<CombatEvent, 'seq'>[]) => [...list, ...evs.map(e => ({ ...e, seq: ++combatSeq }))].slice(-48);
/** basic-attack chain: clip per step and damage multiplier (3rd hit is the finisher) */
const COMBO_MULT: Record<ClassId, number[]> = { Berserker: [1, 1.1, 1.6], Paladin: [1, 1.1, 1.5], Assassin: [0.9, 1, 1.7], Hawkeye: [1, 1, 1.4], RuneMaster: [1, 1.1, 1.5], Elementalist: [1, 1, 1.5], HighPriest: [1, 1, 1.3], Inquisitor: [1, 1.1, 1.6] };
const comboClip = (cls: ClassId, step: number): CharacterClip => { void cls; return step === 1 ? 'Attack2' : 'Attack'; };
/** ms from the swing to the visible hit (matches the class attack effect) */
export const HIT_MS: Record<ClassId, number> = { Berserker: 340, Paladin: 340, Assassin: 330, Hawkeye: 480, RuneMaster: 460, Elementalist: 480, HighPriest: 440, Inquisitor: 340 };
/** round 13: Rage (Berserker / Reaver resource, balance proposal berserker-v2 secondary_defaults) */
export const RAGE = { max: 100, basicHit: 8, whenHit: 3, hitIcdMs: 600, decayDelayMs: 5000, decayPerSec: 5 };
export const CHARGE_MAX_MS = 1600;
export type HotbarSlot = keyof Hotbar;
type Dot = { id: string; perTick: number; ticks: number; next: number; interval: number };
type GameState = {
  player: Player;
  journal: boolean;
  action: { kind: ActionId; stamp: number; duration: number; fx?: FxRef; /** the skill being cast (round 13: picks its painted effect) */ skillId?: string; clip?: CharacterClip; combo?: number; power?: number; channel?: boolean; released?: boolean };
  combat: CombatEvent[];
  combo: { step: number; until: number };
  charge: { start: number } | null;
  /** (retired Archer draw — kept as a no-op so old key bindings do nothing) */
  beginCharge: () => void;
  releaseCharge: () => void;
  buffUntil: number;
  guardUntil: number;
  guardReduce: number;
  shield: { hp: number; until: number };
  deadUntil: number;
  /** round 13: Rage 0–100; rageAt = last time it was gained or spent (decay starts 5 s later); rageHitAt = last gain from being hit */
  rage: number; rageAt: number; rageHitAt: number;
  /** a channelled skill in progress (Whirlwind): no other attack until `until`, movement × `move` */
  channel: { until: number; move: number; skillId: string } | null;
  cooldowns: Record<string,number>;
  pending: {at:number; target:string|null; skillId:string; kind:HotbarSlot} | null;
  buffs: ActiveBuff[];
  skillLevels: SkillLevels;
  hotbar: Hotbar;
  dots: Dot[];
  starterKits: string[];
  /** the monster codex (round 11): loot id → registered tiers */
  codex: cdx.Codex;
  /** round 12: the wardrobe */
  wardrobe: Wardrobe;
  lockedClass: ClassId | null;
  npc: string | null;
  setJournal: (open:boolean)=>void;
  promote: (id:PromotionId)=>void;
  chooseClass: (id:ClassId)=>void;
  applyProfile:(name:string,cls:ClassId,gender?:'m'|'f')=>void;
  /** hair style + colour picked on the character screen (saved with the player) */
  setLook:(hair:string,hairColor:string)=>void;
  /** move to another map; `gate` = walked through a waygate (free), otherwise Gatewarden Orrin's travel (fee for fields) */
  travel: (id:CityId,opts?:{gate?:boolean})=>void;
  /** round 22: world-map warp inside the current map — costs SoulGod, only for long hops; returns an error message or null */
  mapWarp: (x:number,z:number)=>string|null;
  cast: (kind:'skill'|'buff'|'special')=>void;
  preview: (kind:ActionId)=>void;
  respawn: ()=>void;
  monsters: Monster[];
  drops: Loot[];
  inventory: (Item | null)[];
  equipment: Record<GearSlot, Item | null>;
  soulShards: number;
  selectedMonster: string | null;
  attackFx: { stamp: number; skill: boolean } | null;
  log: string[];
  move: (x: number, z: number, dt: number) => void;
  selectMonster: (id: string | null) => void;
  attack: (id: string, skill?: boolean) => AttackResult;
  castNearest: () => void;
  tick: () => void;
  pickup: (id: string) => void;
  swapInventory: (from: number, to: number) => void;
  equip: (index: number) => void;
  unequip: (slot: GearSlot) => void;
  forge: () => void;
  sellNPC: (id:string,confirmed:boolean)=>boolean;
  /** round 11: register the next codex tier of a loot entry / sell loot the codex no longer needs (returns an error or null) */
  registerCodex: (id:string)=>string|null;
  /** round 17: put one bag item into a collection slot (it is used up) */
  registerCollection: (setId:string,index:number)=>string|null;
  sellJunk: ()=>string|null;
  wearFashion: (id:string)=>string|null;
  takeOffFashion: (slot:FashionSlot)=>void;
  hydrate: (snapshot: Snapshot) => void;
  // closed beta systems
  openNpc: (id: string | null) => void;
  learnSkill: (id: string) => string | null;
  resetSkills: () => string | null;
  setHotbar: (slot: HotbarSlot, id: string) => void;
  buyShop: (id: string, qty: number) => string | null;
  useItem: (index: number) => void;
  enhance: (ref: { inventory?: number; slot?: GearSlot }, protection: boolean) => { ok: boolean; message: string };
  claimStarterKit: () => string | null;
  receiveBlessing: () => string | null;
  // round 2: 6-skill wheel, quests + one-time tips, AUTO, crafting, food, costume shop
  extraHotbar: (string | null)[];
  /** UX spec 10×10 bag: saved top-left cell per item id (layout rules in src/game/ui/bagGrid.ts) */
  bagPos: Record<string, { x: number; y: number }>; setBagPos: (p: Record<string, { x: number; y: number }>) => void;
  castSlot: (slot: number) => void;
  setExtraSlot: (i: number, id: string) => void;
  quests: QuestLog; seenTips: string[]; tips: Tip[];
  emit: (e: QuestEvent) => void; acceptQuest: (id: string) => void; turnInQuest: (id: string) => string | null;
  tip: (t: TipTrigger) => void; dismissTip: () => void;
  auto: AutoSettings; autoPauseUntil: number; setAuto: (on: boolean) => void; patchAuto: (p: Partial<AutoSettings>) => void;
  brewPotion: (id: string, qty: number) => { ok: boolean; message: string };
  craft: (rarity: Rarity, cls: ClassId, slot: CraftSlot) => { ok: boolean; message: string };
  crystalCraft: (tier: CrystalTier, cls: ClassId, slot: CraftSlot, kind?: WeaponKind) => { ok: boolean; message: string };
  buyCatalog: (id: string) => string | null;
  usePotion: (kind: 'hp' | 'mp') => boolean;
  eatFood: () => boolean;
};
/** stacks in the 24-slot bag (consumables, food, materials, crystals) — the helpers live in the economy core */
export const countOf = eco.countOf;
/** kills recorded inside pure reducers; flushed into quest events right after the store updates */
const killQueue: QuestEvent[] = [];
/** online: kills to claim from the realm (it checks the spawn and pays the reward) */
const killClaims: { city: CityId; id: string }[] = [];
/** hotbar slots 4–6 per class (slots 1–3 are DEFAULT_HOTBAR skill / buff / special) */
export const EXTRA_SLOTS: Record<ClassId, (string | null)[]> = {
  ...CLASS_EXTRA,
  Berserker: ['b-carnage-cyclone', 'b-execution-frenzy', 'b-whirlwind'],
};


function addLog(log: string[], line: string) { return [line, ...log].slice(0, 6); }
export const expRequired = eco.expRequired;
const MOTION_ACTION:Record<SkillDef['motion'],ActionId>={Attack:'attack',Skill:'skill',Buff:'buff',Special:'special'};
/** hero rig clips for skills: the 3D-rendered heroes (sprites/rigs) have one slash (attack) and one spin (skill). The
 *  three spinning skills use the spin — Whirlwind loops it for its whole channel — every other skill uses the slash. */
const SPIN_SKILLS=new Set(['b-whirlwind','b-carnage-cyclone','r-reaping-cyclone']);
const skillClip=(def:SkillDef):CharacterClip=>def.effects.some(e=>e.type==='guard')?'Guard':SPIN_SKILLS.has(def.id)?(def.channelMs?'Channel':'Skill'):'Attack';
const ACTION_MS:Record<SkillDef['motion'],number>={Attack:650,Skill:1000,Buff:1100,Special:2000};

export function cityMonsters(city:CityId):Monster[]{return eco.monstersFor(city,cfg());}
const activeClass=()=>classLook(getClass(),useGameStore.getState().player.promotionId);
function getClass():ClassId{const c=useGameStore.getState().player.classId;return isClass(c)?c:'Berserker';}
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));
/** Everything a character's numbers depend on: class base, level, gear options, buffs, passive skills, live admin config. */
export function derivedOf(s:Pick<GameState,'player'|'equipment'|'buffs'|'skillLevels'>&{codex?:cdx.Codex},now=Date.now()):Derived{
 return deriveFor({cls:statClass(s.player),level:s.player.level,equipment:s.equipment,buffs:s.buffs,skillLevels:s.skillLevels,skills:skillLib(),config:cfg(),now,codex:s.codex});
}
const classBase=(cls:ClassId)=>({...cfg().classes[cls].base});
const freshSkills=(cls:ClassId)=>eco.freshSkills(skillLib(),cls);
const monsterDefense=(m:Monster)=>m.level*3*(1-Math.min(.8,(m.armorBreak??0)/100));
/** inventory: set when a kill put stackable loot straight into the bag (economy grantKill) */
type Acc={player:Player;drops:Loot[];soulShards:number;log:string[];buffs:ActiveBuff[];inventory?:(Item|null)[]};

const plainCtx=():eco.Ctx=>({config:cfg(),skills:skillLib(),rng:Math.random,now:Date.now(),uuid:()=>crypto.randomUUID()});
/** Rewards for a kill (economy core grantKill). Online the realm pays it: the kill is queued as a claim instead. */
function grantKill(state:Acc,m:Monster,_d:Derived,equipment:Record<GearSlot,Item|null>,skillLevels:SkillLevels):Acc{
 audio.play(MONSTER_SFX[tierOf(m)].die,{vol:.6,rate:monsterPitch(m.name),at:{x:m.x,z:m.z}});
 if(authority.online()){killClaims.push({city:state.player.cityId??'hollow',id:m.id});return state;}
 const cur=useGameStore.getState();
 const r=eco.grantKill({player:state.player,inventory:state.inventory??cur.inventory,equipment,soulShards:state.soulShards,skillLevels,hotbar:cur.hotbar,buffs:state.buffs,starterKits:cur.starterKits,quests:cur.quests,drops:state.drops,codex:cur.codex,wardrobe:cur.wardrobe},m,plainCtx());
 killQueue.push(...r.events);for(let i=0;i<(r.levelUps??0);i++)audio.play('level_up',{vol:.8});
 let log=state.log;for(const l of r.log)log=addLog(log,l);
 return {player:r.state.player,drops:r.state.drops,soulShards:r.state.soulShards,log,buffs:r.state.buffs,...(r.state.inventory!==(state.inventory??cur.inventory)?{inventory:r.state.inventory}:state.inventory?{inventory:state.inventory}:{})};
}
type Pending={ok:true;pending:true};
const PENDING_MSG='กำลังส่งคำขอไปยังเซิร์ฟเวอร์…';

/** round 22: map warp — at least 30 m away; 20 SG + 2 SG per metre */
export const MAP_WARP={min:30,base:20,perMetre:2};
export const mapWarpCost=(d:number)=>MAP_WARP.base+Math.ceil(d)*MAP_WARP.perMetre;
export const useGameStore = create<GameState>((set, get) => {
  const ctx=(ids?:string[]):eco.Ctx=>{const q=ids?[...ids]:null;return {config:cfg(),skills:skillLib(),rng:Math.random,now:Date.now(),uuid:()=>q&&q.length?q.shift()!:crypto.randomUUID()};};
  const charOf=(s:GameState):eco.CharState=>({player:s.player,inventory:s.inventory,equipment:s.equipment,soulShards:s.soulShards,skillLevels:s.skillLevels,hotbar:s.hotbar,buffs:s.buffs,starterKits:s.starterKits,quests:s.quests,drops:s.drops,codex:s.codex,wardrobe:s.wardrobe});
  /** write a reducer result into the store (log lines in order, quest events through emit) */
  const commit=(r:eco.Ok,extra:Partial<GameState>={})=>{set(cur=>{let log=cur.log;for(const l of r.log)log=addLog(log,l);const x=r.state;
    return {player:x.player,inventory:x.inventory,equipment:x.equipment,soulShards:x.soulShards,skillLevels:x.skillLevels,hotbar:x.hotbar,buffs:x.buffs,starterKits:x.starterKits,quests:x.quests,drops:x.drops,codex:x.codex??{},wardrobe:x.wardrobe??{owned:[],worn:{}},log,...extra};});
    for(const e of r.events)get().emit(e);};
  /** offline: run the reducer. Online: deterministic ops run locally too (same ids) and go to the realm; dice rolls only go to the realm. */
  const act=<R extends eco.Result>(op:ActOp,args:unknown[],local:(c:eco.Ctx)=>R):R|Pending=>{
    const ids=newIds(),online=authority.online();
    if(online&&RNG_OPS.includes(op)){authority.send(op,args,ids);return {ok:true,pending:true};}
    const r=local(ctx(ids));if(r.ok&&online)authority.send(op,args,ids);return r;};
  const isPending=(r:unknown):r is Pending=>!!r&&(r as Pending).pending===true;
  return ({
  player: { ...starterPlayer, classId:'Berserker', cityId:'hollow', position:homePoint('hollow') }, monsters: cityMonsters('hollow'), drops: [],
  journal:false, action:{kind:'idle',stamp:0,duration:0}, buffUntil:0, guardUntil:0, guardReduce:.7, shield:{hp:0,until:0}, deadUntil:0, cooldowns:{}, pending:null, rage:0, rageAt:0, rageHitAt:0, channel:null,
  buffs:[], ...freshSkills('Berserker'), dots:[], starterKits:[], codex:{}, wardrobe:{owned:[],worn:{}}, lockedClass:null, npc:null, combat:[], combo:{step:0,until:0}, charge:null,
  extraHotbar:[...EXTRA_SLOTS.Berserker], quests:{}, seenTips:[], tips:[], auto:defaultAuto('Berserker'), autoPauseUntil:0,
  bagPos:{}, setBagPos:bagPos=>set({bagPos}),
  setJournal:journal=>set({journal}),
  promote:id=>{const s=get();if(s.deadUntil||s.pending)return;
    const r=act('promote',[id],c=>eco.promote(charOf(s),id));if(isPending(r)||!r.ok)return;
    commit(r,{selectedMonster:null,action:{kind:'idle',stamp:0,duration:0}});},
  chooseClass:id=>{const s=get();if(s.lockedClass||s.player.promotionId||!isClass(id)||s.deadUntil||s.pending||authority.online())return;
    if(id===s.player.classId)return;
    set({player:{...s.player,classId:id,stats:classBase(id)},...freshSkills(id),action:{kind:'idle',stamp:0,duration:0},pending:null,selectedMonster:null});},
  setLook:(hair,hairColor)=>set(s=>({player:{...s.player,hair,hairColor}})),
  applyProfile:(name,cls,gender)=>{const s=get();const same=s.player.classId===cls;
    const keep=same&&Object.keys(s.skillLevels).some(k=>skillLib().defs.find(d=>d.id===k)?.cls===cls);
    set({lockedClass:cls,player:{...s.player,name,classId:cls,gender:gender??s.player.gender,promotionId:same?s.player.promotionId:undefined,stats:classBase(cls)},...(keep?{}:freshSkills(cls)),journal:false,...(same?{}:{extraHotbar:[...EXTRA_SLOTS[cls]],auto:defaultAuto(cls)})});},
  mapWarp:(x,z)=>{const s=get(),city=s.player.cityId??'hollow';
    if(s.deadUntil||s.pending)return 'ทำไม่ได้ในตอนนี้';if(authority.online())return 'วาร์ปบนแผนที่ยังไม่เปิดในโหมดออนไลน์';
    const d=Math.hypot(x-s.player.position[0],z-s.player.position[1]);if(d<MAP_WARP.min)return `ใกล้เกินไป · วาร์ปได้เมื่อห่างอย่างน้อย ${MAP_WARP.min} ม.`;
    if(!walkable(city,x,z))return 'จุดนี้วาร์ปไปไม่ได้';const cost=mapWarpCost(d);if(s.player.gold<cost)return `โกลด์ไม่พอ · ต้องใช้ ${cost} SG`;
    set({player:{...s.player,gold:s.player.gold-cost,position:[x,z]},selectedMonster:null,pending:null,log:addLog(s.log,`วาร์ป ${Math.round(d)} ม. · ${cost} SG`)});return null;},
  travel:(id,opts)=>{const s=get();if(!isCity(id)||s.deadUntil)return;
    if(id===s.player.cityId){set({journal:false});return;}
    const r=act('travel',[id,!!opts?.gate],c=>eco.travel(charOf(s),id,!!opts?.gate,c));if(isPending(r))return;
    if(!r.ok){set({log:addLog(s.log,r.msg)});return;}
    commit(r,{monsters:cityMonsters(id),dots:[],selectedMonster:null,pending:null,npc:null,action:{kind:'idle',stamp:0,duration:0},journal:false,
      log:addLog(s.log,`Arrived at ${CITIES[id].name}${r.fee?` · ค่าเดินทาง ${r.fee} SG`:''}. Ground loot in the previous zone was left behind.`)});},
  preview:kind=>{if(get().deadUntil)return;set({selectedMonster:null,action:{kind,stamp:Date.now(),duration:kind==='death'?2400:kind==='walk'?3200:1800}});},
  respawn:()=>{const s=get();if(!s.deadUntil||Date.now()<s.deadUntil)return;const d=derivedOf(s);authority.send('respawn',[]);set({deadUntil:0,dots:[],rage:0,channel:null,player:{...s.player,hp:d.maxHp,mp:d.maxMp,position:respawnPoint(s.player.cityId??'hollow',s.player.name)},action:{kind:'idle',stamp:Date.now(),duration:0},log:addLog(s.log,'Revived at the sanctuary.')});},
  cast:kind=>{const s=get(),now=Date.now();if(s.deadUntil||s.pending)return;
    if(s.channel&&now<s.channel.until){set({log:addLog(s.log,'กำลังใช้ท่าไม้ตายอยู่')});return;}
    // a Reaver plays the evolved version of the skill bound to the slot
    const id=evolvedSkill(skillLib(),s.hotbar[kind],s.skillLevels),def=skillLib().defs.find(d=>d.id===id),level=id?s.skillLevels[id]??0:0;
    if(!def||def.kind!=='active'||level<1){set({log:addLog(s.log,'ปุ่มนี้ยังไม่มีสกิลที่เรียนแล้ว (กด K เปิดต้นไม้สกิล)')});return;}
    if((s.cooldowns[def.id]??0)>now){set({log:addLog(s.log,`${def.name} ยังติดคูลดาวน์`)});return;}
    const d=derivedOf(s,now),[px,pz]=s.player.position;
    const targets=s.monsters.map(m=>({id:m.id,x:m.x,z:m.z,defense:monsterDefense(m),boss:m.boss,hp:m.hp,maxHp:m.maxHp}));
    const sel=s.monsters.find(m=>m.id===s.selectedMonster&&m.hp>0);
    const inRange=s.monsters.filter(m=>m.hp>0&&Math.hypot(m.x-px,m.z-pz)<=def.range+.5).sort((a,b)=>Math.hypot(a.x-px,a.z-pz)-Math.hypot(b.x-px,b.z-pz));
    const target=sel&&inRange.includes(sel)?sel:inRange[0];
    if(needsTarget(def)&&!target){set({log:addLog(s.log,`ไม่มีเป้าหมายในระยะ ${def.range} ม.`)});return;}
    const yaw=target?Math.atan2(target.x-px,target.z-pz):0;
    const probe=resolveSkill(def,level,{caster:d,x:px,z:pz,yaw,targetId:target?.id??null,targets:[],maxHp:d.maxHp,now});
    if(s.player.mp<probe.mpCost){set({log:addLog(s.log,'MP ไม่พอ')});return;}
    if(s.rage<probe.rageCost){set({log:addLog(s.log,`Rage ไม่พอ (${Math.floor(s.rage)}/${probe.rageCost})`)});return;}
    const rage=Math.min(RAGE.max,s.rage-probe.rageCost+probe.rage*(1+d.rageGain));
    const channel=def.channelMs?{until:now+def.channelMs,move:def.channelMove??0.6,skillId:def.id}:null;
    const base={rage,rageAt:now,channel,player:{...s.player,mp:s.player.mp-probe.mpCost},cooldowns:{...s.cooldowns,[def.id]:now+probe.cooldownMs,[kind]:now+probe.cooldownMs},
      action:def.castMs>0?{kind:MOTION_ACTION[def.motion],stamp:now,duration:def.castMs,fx:def.fx,skillId:def.id,clip:'Channel' as CharacterClip,channel:true}:{kind:MOTION_ACTION[def.motion],stamp:now,duration:def.channelMs??ACTION_MS[def.motion],fx:def.fx,skillId:def.id,clip:skillClip(def)},selectedMonster:target?.id??null,attackFx:{stamp:now,skill:true},log:addLog(s.log,`${def.name} Lv.${level}`)};
    { const roles=skillRoles(def),el=(def.effects.find(e=>e.type==='damage'||e.type==='dot') as {element?:string}|undefined)?.element;
      const name=SKILL_SFX[def.id]??(roles.includes('damage')?sfxForElement(el):roles.includes('heal')?'heal':roles.includes('shield')?'shield':'buff');
      if(def.castMs>0){audio.play('cast_loop',{vol:.35});setTimeout(()=>audio.play(name,{vol:.7}),def.castMs);}else audio.play(name,{vol:.7}); }
    if(def.castMs>0){set({...base,pending:{at:now+def.castMs,target:target?.id??null,skillId:def.id,kind}});return;}
    const out=resolveSkill(def,level,{caster:d,x:px,z:pz,yaw,targetId:target?.id??null,targets,maxHp:d.maxHp,now,hp:s.player.hp});
    set(cur=>({...base,...applyOutcome({...cur,...base},def,out,d,yaw,now)}));
  },
  inventory: Array.from({ length: 24 }, (_, i) => i === 0 ? starterGear : null),
  equipment: {...EMPTY_GEAR}, soulShards: 0,
  selectedMonster: null, attackFx: null,
  log: ['Enter the Hollow Reach. The hunt begins.'],
  move: (x, z, dt) => set(s => {
    if((s.pending||s.charge)&&(x||z)&&!s.deadUntil)return {pending:null,charge:null,action:{kind:'idle',stamp:Date.now(),duration:0},log:addLog(s.log,s.pending?'เคลื่อนที่ — ยกเลิกการร่าย':'ปล่อยสายธนู')};
    if(s.deadUntil||s.pending||s.journal)return {};
    const speed = derivedOf(s).speed*(s.channel&&Date.now()<s.channel.until?s.channel.move:1);
    const city=s.player.cityId??'hollow';
    const lim=WORLD_LIMIT[city]??23,nx=clamp(s.player.position[0]+x*speed*dt,-lim,lim),nz=clamp(s.player.position[1]+z*speed*dt,-lim,lim);
    const px=lineClear(city,s.player.position,[nx,s.player.position[1]])?nx:s.player.position[0];
    const pz=lineClear(city,[px,s.player.position[1]],[px,nz])?nz:s.player.position[1];
    return {player:{...s.player,position:[px,pz]}};
  }),
  selectMonster: id => set({ selectedMonster: id }),
  attack: (id, skill = false) => {
    if(skill){get().cast('skill');return {hit:true};}
    const s = get();
    const now=Date.now();
    if(s.deadUntil||s.pending||(s.channel&&now<s.channel.until))return {hit:false,reason:'Unavailable'};
    if((s.cooldowns.attack??0)>now)return {hit:false,reason:'Cooldown'};
    const target = s.monsters.find(m => m.id === id && m.hp > 0);
    if (!target) return { hit: false, reason: 'No target' };
    const distance = Math.hypot(target.x - s.player.position[0], target.z - s.player.position[1]);
    if (distance > activeClass().range) return { hit: false, reason: 'Out of range' };
    const derived = derivedOf(s,now), cls:ClassId=getClass(), step=now<s.combo.until?(s.combo.step+1)%3:0;
    const lowHp=s.player.hp/Math.max(1,derived.maxHp)<=0.4?1+derived.lowHpDmg:1;
    const roll = rollDamage(derived, monsterDefense(target), COMBO_MULT[cls][step]*lowHp, { boss: target.boss });
    const result = { hit: true, damage: roll.damage, crit: roll.crit };
    { const sfx=BASIC_SFX[cls]; audio.play(step===2&&!RANGED[cls]?'swing_heavy':sfx.swing,{vol:.55}); setTimeout(()=>audio.play(roll.crit?'crit':sfx.hit,{vol:.5}),HIT_MS[cls]); }
    get().tip('combat');
    set(current => {
      const monster = current.monsters.find(m => m.id === id);
      if (!monster || monster.hp <= 0) return {};
      const dead = monster.hp <= roll.damage;
      const monsters = current.monsters.map(m => m.id === id ? { ...m, hp: Math.max(0, m.hp - roll.damage), respawnAt: dead ? Date.now() + eco.respawnMs(monster) : null } : m);
      let next:Acc={player:{...current.player,hp:Math.min(derived.maxHp,current.player.hp+roll.damage*derived.lifesteal)},drops:current.drops,soulShards:current.soulShards,buffs:current.buffs,
        log:addLog(current.log, `${roll.crit ? 'CRITICAL! ' : ''}${roll.damage} damage → ${monster.name}`)};
      if (dead) next=grantKill(next,monster,derived,current.equipment,current.skillLevels);
      // round 13: every basic attack that lands builds Rage (+8, Rage Conduit / Abyssal Rage add their %)
      return { monsters, ...next, selectedMonster: dead ? null : id, ...(cls==='Berserker'?{rage: Math.min(RAGE.max, current.rage + RAGE.basicHit * (1 + derived.rageGain)), rageAt: now}:{}),
        cooldowns:{...current.cooldowns,attack:now+Math.round(700/derived.attackSpeed)},
        action:{kind:'attack',stamp:now,duration:650,clip:comboClip(cls,step),combo:step}, combo:{step,until:now+1600}, attackFx: { stamp: now, skill:false },
        combat: pushCombat(current.combat,{kind:roll.crit?'crit':step===2?'skill':'hit',value:roll.damage,x:monster.x,z:monster.z,on:'monster',id,delay:HIT_MS[cls]}) };
    });
    return result;
  },
  castNearest: () => get().cast('skill'),
  beginCharge: () => { const s=get(),now=Date.now(); if(s.deadUntil||s.pending||s.charge||true)return; // no class draws a bow any more
    set({charge:{start:now},action:{kind:'attack',stamp:now,duration:60000,clip:'Channel',channel:false}}); },
  releaseCharge: () => { const s=get(),now=Date.now(); if(!s.charge)return; const held=now-s.charge.start; set({charge:null});
    const target=s.monsters.find(m=>m.id===s.selectedMonster&&m.hp>0)??s.monsters.filter(m=>m.hp>0).sort((a,b)=>Math.hypot(a.x-s.player.position[0],a.z-s.player.position[1])-Math.hypot(b.x-s.player.position[0],b.z-s.player.position[1]))[0];
    if(!target||Math.hypot(target.x-s.player.position[0],target.z-s.player.position[1])>activeClass().range){set({action:{kind:'idle',stamp:now,duration:0}});return;}
    if(held<160){get().attack(target.id);return;}
    const power=Math.min(1,held/CHARGE_MAX_MS),d=derivedOf(s,now),roll=rollDamage(d,monsterDefense(target),1+2*power,{boss:target.boss,rng:power>=1?()=>0:Math.random});
    set(cur=>{const m=cur.monsters.find(x=>x.id===target.id);if(!m||m.hp<=0)return {};const dead=m.hp<=roll.damage;
      const monsters=cur.monsters.map(x=>x.id===m.id?{...x,hp:Math.max(0,x.hp-roll.damage),respawnAt:dead?now+eco.respawnMs(m):null}:x);
      let next:Acc={player:cur.player,drops:cur.drops,soulShards:cur.soulShards,buffs:cur.buffs,log:addLog(cur.log,`ศรง้าง ×${(1+2*power).toFixed(1)} · ${roll.damage} → ${m.name}`)};if(dead)next=grantKill(next,m,d,cur.equipment,cur.skillLevels);
      return {monsters,...next,selectedMonster:dead?null:m.id,cooldowns:{...cur.cooldowns,attack:now+500},action:{kind:'attack',stamp:now,duration:650,clip:'Attack2',fx:{cls:getClass(),kind:'special'},power},attackFx:{stamp:now,skill:true},
        combat:pushCombat(cur.combat,{kind:roll.crit?'crit':'skill',value:roll.damage,x:m.x,z:m.z,on:'monster',id:m.id,delay:180})};}); },
  tick: () => set(s => {
    const now = Date.now();
    if(s.journal)return {};
    if(s.deadUntil)return {};
    if(s.pending&&now>=s.pending.at){
      const def=skillLib().defs.find(d=>d.id===s.pending!.skillId),level=s.skillLevels[s.pending.skillId]??1;
      if(!def)return {pending:null};
      const d=derivedOf(s,now),[px,pz]=s.player.position,t=s.monsters.find(m=>m.id===s.pending!.target);
      const yaw=t?Math.atan2(t.x-px,t.z-pz):0;
      const out=resolveSkill(def,level,{caster:d,x:px,z:pz,yaw,targetId:s.pending.target,targets:s.monsters.map(m=>({id:m.id,x:m.x,z:m.z,defense:monsterDefense(m),boss:m.boss,hp:m.hp,maxHp:m.maxHp})),maxHp:d.maxHp,now,hp:s.player.hp});
      return {pending:null,...applyOutcome(s,def,out,d,yaw,now),action:{kind:MOTION_ACTION[def.motion],stamp:now,duration:ACTION_MS[def.motion],fx:def.fx,skillId:def.id,released:true,clip:skillClip(def)}};
    }
    const d = derivedOf(s,now);
    // damage over time on monsters
    let monsters=s.monsters,dots=s.dots,acc:Acc={player:s.player,drops:s.drops,soulShards:s.soulShards,log:s.log,buffs:s.buffs},combat=s.combat;
    if(dots.some(x=>x.next<=now)){
      for(const x of dots.filter(x=>x.next<=now)){const m=monsters.find(mm=>mm.id===x.id);if(!m||m.hp<=0)continue;combat=pushCombat(combat,{kind:'skill',value:x.perTick,x:m.x,z:m.z,on:'monster',id:m.id});const hp=Math.max(0,m.hp-x.perTick);monsters=monsters.map(mm=>mm.id===m.id?{...mm,hp,respawnAt:hp===0?now+eco.respawnMs(m):null}:mm);if(hp===0)acc=grantKill(acc,m,d,s.equipment,s.skillLevels);}
      dots=dots.map(x=>x.next<=now?{...x,ticks:x.ticks-1,next:x.next+x.interval}:x).filter(x=>x.ticks>0&&monsters.some(m=>m.id===x.id&&m.hp>0));
    }
    monsters=monsters.map(m=>m.debuffUntil&&m.debuffUntil<now?{...m,slow:0,weaken:0,armorBreak:0,debuffUntil:undefined}:m);
    const [px, pz] = s.player.position;
    let raw = 0;
    monsters=monsters.map(m=>{const next=advanceMonster(m,[px,pz],s.player.cityId??'hollow',now,d.defense,cfg());raw+=next.damage;return next.monster;});
    let taken=raw?incomingDamage(d,raw):0;
    if(taken&&now<s.guardUntil)taken=Math.round(taken*(1-s.guardReduce));
    let shield=s.shield;
    if(taken&&shield.hp>0&&now<shield.until){const absorbed=Math.min(shield.hp,taken);taken-=absorbed;shield={...shield,hp:shield.hp-absorbed};}
    if(raw>0)audio.play('mon_attack',{vol:.45});
    for(const m of monsters)if(m.telegraph&&m.telegraph.kind==='skill'&&!s.monsters.find(x=>x.id===m.id)?.telegraph)audio.play(m.boss?'boss_cast':'elite_cast',{vol:.8,at:{x:m.x,z:m.z}});
    if(raw>0)combat=pushCombat(combat,taken>0?{kind:'taken',value:taken,x:px,z:pz,on:'player'}:{kind:'evade',value:'EVADE',x:px,z:pz,on:'player'});
    const hp = acc.player.hp - taken;
    const fainted = hp <= 0;
    const player = { ...acc.player,
      hp: fainted ? 0 : Math.min(d.maxHp, hp + d.hpRegen*.25),
      mp: Math.min(d.maxMp, acc.player.mp + d.mpRegen*.25),
    };
    const buffs=acc.buffs.some(b=>b.until<=now)?acc.buffs.filter(b=>b.until>now):acc.buffs;
    // Rage: +3 when struck (at most once per 0.6 s), fades 5/s after 5 s without gaining or spending any
    let rage=s.rage,rageAt=s.rageAt,rageHitAt=s.rageHitAt;
    if(taken>0&&now-rageHitAt>=RAGE.hitIcdMs){rage=Math.min(RAGE.max,rage+RAGE.whenHit*(1+d.rageGain));rageAt=now;rageHitAt=now;}
    else if(rage>0&&now-rageAt>RAGE.decayDelayMs)rage=Math.max(0,rage-RAGE.decayPerSec*.25);
    const channel=s.channel&&now>=s.channel.until?null:s.channel;
    return { monsters, dots, drops:acc.drops, soulShards:acc.soulShards, ...(acc.inventory?{inventory:acc.inventory}:{}), buffs, shield, player, log:acc.log, combat, rage, rageAt, rageHitAt, channel, ...(fainted ? {
      deadUntil:now+2400,pending:null,dots:[],channel:null,action:{kind:'death' as ActionId,stamp:now,duration:2400},log:addLog(acc.log,'Defeated. Return to the sanctuary when ready.'), selectedMonster:null
    } : {}) };
  }),
  pickup: id => { const s=get(); const r=act('pickup',[id],()=>eco.pickup(charOf(s),id)); if(isPending(r))return;
    if(!r.ok){set({log:addLog(s.log,r.msg)});return;} commit(r); },
  swapInventory: (from, to) => { const s=get(); const r=act('swap',[from,to],()=>eco.swapInventory(charOf(s),from,to)); if(!isPending(r)&&r.ok)commit(r); },
  equip: index => {
    const s=get(),item = s.inventory[index];
    if (isConsumable(item)) { get().useItem(index); return; }
    if (!item || !item.slot) return;
    const r=act('equip',[index],c=>eco.equip(charOf(s),index,c)); if(isPending(r))return;
    if(!r.ok){set({log:addLog(s.log,r.msg)});return;}
    commit(r);audio.play(item.slot==='weapon'?'hit_metal':'ui_click',{vol:.5});get().tip(item.slot==='costume'?'costume':'equip');
  },
  unequip: slot => { const s=get(); if(!s.equipment[slot])return; const r=act('unequip',[slot],()=>eco.unequip(charOf(s),slot)); if(isPending(r))return;
    if(!r.ok){set({log:addLog(s.log,r.msg)});return;} commit(r); },
  registerCodex:id=>{const s=get();const r=act('codex',[id],c=>cdx.registerCodex(charOf(s),id,c));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);audio.play('coin',{vol:.5});return null;},
  registerCollection:(setId,index)=>{const s=get();const r=act('collect',[setId,index],()=>cdx.registerCollection(charOf(s),setId,index));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);audio.play('coin',{vol:.5});return null;},
  sellJunk:()=>{const s=get();const r=act('sellJunk',[],c=>cdx.sellJunk(charOf(s),c));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);audio.play('coin',{vol:.5});return null;},
  wearFashion:id=>{const s=get();const r=act('wear',[id],()=>eco.wearFashion(charOf(s),id));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);return null;},
  takeOffFashion:slot=>{const s=get();const r=act('takeOff',[slot],()=>eco.takeOffFashion(charOf(s),slot));if(!isPending(r)&&r.ok)commit(r);},
  sellNPC:(id,confirmed)=>{const s=get();if(!confirmed)return false;const r=act('sell',[id],c=>eco.sellNpc(charOf(s),id,c));if(isPending(r)||!r.ok)return false;commit(r);return true;},
  forge: () => { const s=get(); const r=act('forge',[],()=>eco.forgeSoul(charOf(s))); if(isPending(r))return; if(!r.ok){set({log:addLog(s.log,r.msg)});return;} commit(r); },
  hydrate: data => {
    if (data?.version !== 1 || !data.player || !Array.isArray(data.inventory) || data.inventory.length !== 24) return;
    const city=isCity(data.player.cityId)?data.player.cityId:'hollow';
    const locked=get().lockedClass;
    const cls:ClassId=locked??(isClass(data.player.classId)?data.player.classId:'Berserker'); // round 20: the save's own class
    const lib=skillLib(),now=Date.now();
    const levels=Object.fromEntries(Object.entries(data.skills?.levels??{}).filter(([id,l])=>lib.defs.find(d=>d.id===id)?.cls===cls&&Number.isInteger(l)&&l>0));
    const skills=Object.keys(levels).length?{skillLevels:levels,hotbar:{...DEFAULT_HOTBAR[cls],...(data.skills?.hotbar??{})} as Hotbar}:freshSkills(cls);
    const modern=(data.economyVersion??0)>=2;
    set({deadUntil:0,pending:null,selectedMonster:null,buffUntil:0,guardUntil:0,shield:{hp:0,until:0},dots:[],cooldowns:{},action:{kind:'idle',stamp:0,duration:0},monsters:cityMonsters(city),drops:[],
      player: {...data.player,name:locked?get().player.name:data.player.name,classId:cls,stats:classBase(cls),promotionId:validPromotion(cls,data.player.level,data.player.promotionId),cityId:city,position:safePosition(city,data.player.position),hp:Math.max(1,data.player.hp)},
      inventory: data.inventory.map(i=>migrateItem(i,modern)), equipment: {...EMPTY_GEAR,...Object.fromEntries(Object.entries(data.equipment??{}).map(([k,v])=>[k,migrateItem(v,modern)]))},
      ...skills, buffs:(data.buffs??[]).filter(b=>b&&b.until>now), starterKits:Array.isArray(data.starterKits)?data.starterKits.filter(isClass):[], codex:cleanCodex(data.codex), wardrobe:cleanWardrobe(data.wardrobe),
      soulShards: data.soulShards, log: ['Save loaded successfully.'],
      quests:data.quests&&typeof data.quests==='object'?data.quests as QuestLog:{}, seenTips:Array.isArray(data.tips)?data.tips.filter(x=>typeof x==='string'):[],
      auto:{...defaultAuto(cls),...(data.auto??{}),enabled:false} as AutoSettings, extraHotbar:Array.isArray(data.extraHotbar)&&data.extraHotbar.length===3?data.extraHotbar:[...EXTRA_SLOTS[cls]],
      bagPos:data.bagPos&&typeof data.bagPos==='object'?Object.fromEntries(Object.entries(data.bagPos).filter(([,v])=>v&&Number.isInteger(v.x)&&Number.isInteger(v.y))):{} });
    // items of the retired classes become Berserker gear (same tier, options and enhancement)
    const c=charOf(get()),m=eco.migrateCharState(c,lib);if(m!==c)set({player:m.player,inventory:m.inventory,equipment:m.equipment,drops:m.drops,skillLevels:m.skillLevels,hotbar:m.hotbar,log:['Save loaded · ไอเทมอาชีพเดิมถูกแปลงเป็นของ Berserker แล้ว']});
  },
  // ------------------------------------------------------------------ closed beta systems
  openNpc:id=>{set(s=>{if(id&&!NPC_BY_ID[id])return {};return {npc:id,selectedMonster:id?null:s.selectedMonster};});if(id&&NPC_BY_ID[id]){audio.play('ui_open',{vol:.4});get().emit({type:'talk',npc:id});get().tip('npc-near');}},
  learnSkill:id=>{const s=get();const r=act('learn',[id],c=>eco.learnSkill(charOf(s),id,c));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);return null;},
  resetSkills:()=>{const s=get();const r=act('resetSkills',[],c=>eco.resetSkills(charOf(s),c));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);return null;},
  setHotbar:(slot,id)=>{const s=get();const r=act('hotbar',[slot,id],c=>eco.setHotbar(charOf(s),slot,id,c));if(!isPending(r)&&r.ok)commit(r);},
  buyShop:(id,qty)=>{const s=get();const r=act('buyShop',[id,qty],c=>eco.buyShop(charOf(s),id,qty,c));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);audio.play('coin',{vol:.5});return null;},
  useItem:index=>{const s=get();const r=act('use',[index],c=>eco.useItem(charOf(s),index,c));if(isPending(r)||!r.ok)return;
    audio.play(r.kind==='food'?'eat':'potion',{vol:.6});
    commit(r,r.moved?{monsters:cityMonsters(r.moved),dots:[],selectedMonster:null,pending:null,npc:null}:{});},
  enhance:(ref,protection)=>{const s=get();const r=act('enhance',[ref,protection],c=>eco.enhance(charOf(s),ref,protection,c));
    if(isPending(r)){audio.play('craft_hammer',{vol:.8});return {ok:true,message:PENDING_MSG};}
    if(!r.ok)return {ok:false,message:r.msg};
    commit(r);audio.play('craft_hammer',{vol:.8});setTimeout(()=>audio.play(r.result==='success'?'craft_success':'craft_fail',{vol:.7}),350);return {ok:r.success,message:r.msg!};},
  claimStarterKit:()=>{const s=get();const r=act('starter',[],c=>eco.claimStarterKit(charOf(s),c));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);return null;},
  receiveBlessing:()=>{const s=get();const r=act('blessing',[],c=>eco.receiveBlessing(charOf(s),c));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);audio.play('holy',{vol:.7});return null;},
  // ------------------------------------------------------------------ round 2
  castSlot:slot=>{const s=get();if(slot<=3){s.cast((['skill','buff','special'] as const)[slot-1]);return;}
    const id=s.extraHotbar[slot-4];if(!id){set({log:addLog(s.log,'ช่องนี้ยังว่าง — ตั้งสกิลได้ที่ต้นไม้สกิล (K)')});return;}
    // slots 4–6 reuse the cast pipeline through a temporary hotbar binding (same cooldowns, cast bars and outcomes)
    const keep=s.hotbar.skill,keepCd=s.cooldowns.skill;set({hotbar:{...s.hotbar,skill:id}});get().cast('skill');set(c=>({hotbar:{...c.hotbar,skill:keep},cooldowns:{...c.cooldowns,skill:keepCd??0}}));},
  setExtraSlot:(i,id)=>set(s=>{const def=skillLib().defs.find(d=>d.id===id);if(!def||def.kind!=='active'||def.cls!==getClass()||def.evolvesFrom)return {};const extra=[...s.extraHotbar];extra[i]=id;return {extraHotbar:extra};}),
  emit:e=>{if(e.type==='talk'||e.type==='visit'||e.type==='auto')authority.send('event',[e]);const s=get(),r=questEvent(s.quests,e);if(!r.progressed.length)return;set({quests:r.log});
    for(const id of r.ready){set(c=>({log:addLog(c.log,`เควสพร้อมส่ง · ${QUEST_BY_ID[id].title}`)}));audio.play('quest_done',{vol:.6});get().tip('quest-ready');}
    if(!r.ready.length)get().tip('quest-progress');},
  acceptQuest:id=>{const s=get();const r=act('acceptQuest',[id],c=>eco.acceptQuest(charOf(s),id,c));if(isPending(r)||!r.ok)return;
    set({log:addLog(s.log,`รับเควส: ${QUEST_BY_ID[id]?.title??id}`)});commit(r);audio.play('quest_accept',{vol:.7});get().tip('quest-accepted');},
  turnInQuest:id=>{const s=get();const r=act('turnIn',[id,s.npc],c=>eco.turnInQuest(charOf(s),id,s.npc,c));if(isPending(r))return null;if(!r.ok)return r.msg;
    commit(r);audio.play('quest_done',{vol:.8});get().tip('quest-done');return null;},
  tip:t=>{const s=get(),x=tipFor(t,s.seenTips);if(!x)return;set({seenTips:markSeen(s.seenTips,x.id),tips:[...s.tips,x]});},
  dismissTip:()=>set(s=>({tips:s.tips.slice(1)})),
  setAuto:on=>{set(s=>({auto:{...s.auto,enabled:on},autoPauseUntil:0,log:addLog(s.log,on?'AUTO · เริ่มล่าอัตโนมัติ':'AUTO ปิด')}));if(on)get().emit({type:'auto'});},
  patchAuto:p=>set(s=>({auto:{...s.auto,...p}})),
  brewPotion:(id,qty)=>{const s=get();const r=act('brewPotion',[id,qty],c=>eco.brewPotion(charOf(s),id,qty,c));if(isPending(r))return {ok:true,message:PENDING_MSG};if(!r.ok)return {ok:false,message:r.msg};commit(r);audio.play('craft_success',{vol:.6});return {ok:true,message:r.msg??'ปรุงยาสำเร็จ'};},
  craft:(rarity,cls,slot)=>{const s=get();const r=act('craft',[rarity,cls,slot],c=>eco.craft(charOf(s),rarity,cls,slot,c));
    if(isPending(r)){audio.play('craft_hammer',{vol:.8});return {ok:true,message:PENDING_MSG};}
    if(!r.ok)return {ok:false,message:r.msg};audio.play('craft_hammer',{vol:.8});setTimeout(()=>audio.play(r.success?'craft_success':'craft_fail',{vol:.8}),350);
    commit(r);if(!r.success&&r.crystal)get().tip('craft-fail');return {ok:r.success,message:r.msg!};},
  crystalCraft:(tier,cls,slot,kind='greatsword')=>{const s=get();const r=act('crystalCraft',[tier,cls,slot,kind],c=>eco.crystalCraft(charOf(s),tier,cls,slot,c,kind));
    if(isPending(r))return {ok:true,message:PENDING_MSG};if(!r.ok)return {ok:false,message:r.msg};commit(r);audio.play('crystal',{vol:.8});return {ok:true,message:r.msg!};},
  buyCatalog:id=>{const s=get();const r=act('buyCatalog',[id],c=>eco.buyCatalog(charOf(s),id,c));if(isPending(r))return null;if(!r.ok)return r.msg;commit(r);audio.play('coin',{vol:.5});return null;},
  usePotion:kind=>{const s=get(),ids=kind==='hp'?['potion-hp-l','potion-hp-m','potion-hp-s']:['potion-mp-m','potion-mp-s'];
    for(const id of ids){const i=s.inventory.findIndex(x=>x?.definitionId===id&&(x.qty??1)>0);if(i>=0){s.useItem(i);return true;}}return false;},
  eatFood:()=>{const s=get(),i=s.inventory.findIndex(x=>!!x&&FOOD_ITEMS.some(f=>f.id===x.definitionId));if(i<0)return false;s.useItem(i);return true;},
});});


/** Apply a resolved skill to the world: damage + kills, heals, self buffs, shields, guards, DoTs, debuffs, knockback, dash. */
function applyOutcome(s:GameState,def:SkillDef,out:Outcome,d:Derived,yaw:number,now:number):Partial<GameState>{
  let monsters=s.monsters,acc:Acc={player:{...s.player},drops:s.drops,soulShards:s.soulShards,log:s.log,buffs:s.buffs};
  const byId=new Map<string,number>();for(const h of out.hits)byId.set(h.id,(byId.get(h.id)??0)+h.damage);
  let total=0;
  for(const [id,dmg] of byId){const m=monsters.find(x=>x.id===id);if(!m||m.hp<=0)continue;const hp=Math.max(0,m.hp-dmg);total+=Math.min(dmg,m.hp);
    monsters=monsters.map(x=>x.id===id?{...x,hp,respawnAt:hp===0?now+eco.respawnMs(m):null}:x);if(hp===0)acc=grantKill(acc,m,d,s.equipment,s.skillLevels);}
  let combat=s.combat;for(const [id,dmg] of byId){const m=s.monsters.find(x=>x.id===id);if(m)combat=pushCombat(combat,{kind:out.hits.some(h=>h.id===id&&h.crit)?'crit':'skill',value:dmg,x:m.x,z:m.z,on:'monster',id,delay:def.castMs>0?220:450});}
  if(out.heal>0)combat=pushCombat(combat,{kind:'heal',value:Math.round(out.heal),x:s.player.position[0],z:s.player.position[1],on:'player',delay:250});
  if(out.hits.length)acc.log=addLog(acc.log,`${def.name}: ${total.toLocaleString()} damage${byId.size>1?` · ${byId.size} targets`:''}${out.hits.some(h=>h.crit)?' · CRIT':''}`);
  for(const x of out.debuffs)monsters=monsters.map(m=>m.id!==x.id?m:{...m,debuffUntil:Math.max(m.debuffUntil??0,x.until),...(x.stat==='slow'?{slow:Math.max(m.slow??0,x.value)}:x.stat==='atkPct'?{weaken:Math.max(m.weaken??0,x.value)}:{armorBreak:Math.max(m.armorBreak??0,x.value)})});
  if(out.knockback){const[px,pz]=acc.player.position;monsters=monsters.map(m=>{if(!byId.has(m.id)||m.hp<=0||m.boss)return m;const dx=m.x-px,dz=m.z-pz,l=Math.hypot(dx,dz)||1,nx=m.x+dx/l*out.knockback,nz=m.z+dz/l*out.knockback;return lineClear(s.player.cityId??'hollow',[m.x,m.z],[nx,nz])?{...m,x:nx,z:nz}:m;});}
  if(out.dash){const[px,pz]=acc.player.position,lim=WORLD_LIMIT[s.player.cityId??'hollow']??23,nx=clamp(px+Math.sin(yaw)*out.dash,-lim,lim),nz=clamp(pz+Math.cos(yaw)*out.dash,-lim,lim);if(lineClear(s.player.cityId??'hollow',[px,pz],[nx,nz]))acc.player.position=[nx,nz];}
  const heal=out.heal+total*d.lifesteal;if(heal>0){acc.player.hp=Math.min(d.maxHp,acc.player.hp+heal);if(out.heal)acc.log=addLog(acc.log,`${def.name}: +${Math.round(out.heal).toLocaleString()} HP`);}
  let buffs=acc.buffs;for(const b of out.buffs)buffs=[...buffs.filter(x=>x.id!==b.id),b];
  const dots=[...s.dots,...out.dots.map(x=>({id:x.id,perTick:x.perTick,ticks:x.ticks,next:now+x.intervalMs,interval:x.intervalMs}))];
  return {monsters,dots,...acc,buffs,combat,
    ...(out.buffs.length?{buffUntil:Math.max(s.buffUntil,...out.buffs.map(b=>b.until))}:{}),
    ...(out.guard?{guardUntil:out.guard.until,guardReduce:out.guard.reduce}:{}),
    ...(out.shield?{shield:{hp:Math.max(s.shield.until>now?s.shield.hp:0,out.shield),until:now+10000}}:{})};
}

/** a codex from a local save: known entries, whole tiers 1–5 (offline saves only; online the realm owns it) */
function cleanCodex(raw:unknown):cdx.Codex{const out:cdx.Codex={};if(raw&&typeof raw==='object')for(const [id,t] of Object.entries(raw as Record<string,unknown>)){if(LOOT_BY_ID[id]&&Number.isInteger(t)&&(t as number)>=1&&(t as number)<=5)out[id]=t as number;else if(isColKey(id)&&t===1)out[id]=1;}return out;}
export function createSnapshot(): Snapshot {
  const s = useGameStore.getState();
  return { version: 1, economyVersion:3, player: s.player, inventory: s.inventory,
    equipment: s.equipment, soulShards: s.soulShards, skills:{levels:s.skillLevels,hotbar:s.hotbar}, buffs:s.buffs, starterKits:s.starterKits, codex:s.codex, wardrobe:s.wardrobe,
    quests:s.quests, tips:s.seenTips, auto:{...s.auto,enabled:false} as unknown as Record<string,unknown>, extraHotbar:s.extraHotbar, bagPos:s.bagPos };
}

// kills / level-ups recorded inside reducers become quest events right after each update
useGameStore.subscribe(() => {
  if (killClaims.length) { const q = killClaims.splice(0); for (const k of q) authority.send('kill', [k.city, k.id]); }
  if (!killQueue.length) return; const q = killQueue.splice(0); for (const e of q) useGameStore.getState().emit(e);
});

/** Round 13: the world boss hit this character on the realm. The realm's HP wins if it is lower (the browser cannot
 *  shrug the hit off); 0 = defeated, same flow as a field death (respawn sends ACT 'respawn', which refills the realm). */
export function applyServerHit(hit: { damage: number; hp: number; evaded?: boolean; stacks?: number }) {
  const s = useGameStore.getState(); if (s.deadUntil || !Number.isFinite(hit.hp)) return;
  const now = Date.now(), [px, pz] = s.player.position, hp = Math.max(0, Math.min(s.player.hp, hit.hp));
  const combat = pushCombat(s.combat, hit.evaded ? { kind: 'evade', value: 'EVADE', x: px, z: pz, on: 'player' } : { kind: 'taken', value: Math.round(hit.damage), x: px, z: pz, on: 'player' });
  if (!hit.evaded) audio.play('mon_attack', { vol: .6 });
  if (hp > 0) { useGameStore.setState({ combat, player: { ...s.player, hp }, ...(hit.stacks && hit.stacks >= 5 ? { log: addLog(s.log, `ทุบเกราะ ×${hit.stacks} — สลับแทงก์!`) } : {}) }); return; }
  useGameStore.setState({ combat, player: { ...s.player, hp: 0 }, deadUntil: now + 2400, pending: null, dots: [], selectedMonster: null,
    action: { kind: 'death' as ActionId, stamp: now, duration: 2400 }, log: addLog(s.log, 'Defeated by the Abyssal Forge Titan. Return to the sanctuary when ready.') });
}

/** The realm's word on this character (WELCOME and every ACK). Money, items, level, skills, quests and ground loot are
 *  replaced; combat state (HP/MP/cooldowns/monsters) stays local. A level gained on the server heals like a local
 *  level-up; a different map (a refused or server-side move) reloads the monsters there. */
export function applyServerState(c: eco.CharState, opts: { first?: boolean; message?: string } = {}) {
  const s = useGameStore.getState(), city = c.player.cityId ?? 'hollow', moved = opts.first || city !== (s.player.cityId ?? 'hollow');
  const lib = skillLib(), cls: ClassId = isClass(c.player.classId) ? c.player.classId : 'Berserker';
  const levels = Object.fromEntries(Object.entries(c.skillLevels ?? {}).filter(([id, l]) => lib.defs.find(d => d.id === id)?.cls === cls && Number.isInteger(l) && l > 0));
  const player = { ...c.player, hp: s.player.hp, mp: s.player.mp, position: moved ? c.player.position : s.player.position };
  const next = { player, inventory: c.inventory, equipment: { ...EMPTY_GEAR, ...c.equipment }, soulShards: c.soulShards, skillLevels: Object.keys(levels).length ? levels : freshSkills(cls).skillLevels,
    hotbar: { ...DEFAULT_HOTBAR[cls], ...c.hotbar } as Hotbar, buffs: c.buffs, starterKits: c.starterKits, quests: c.quests, drops: c.drops, codex: c.codex ?? {}, wardrobe: c.wardrobe ?? { owned: [], worn: {} } };
  const d = derivedOf({ ...next, player }), healed = opts.first || c.player.level > s.player.level;
  useGameStore.setState({ ...next, player: { ...player, hp: healed ? d.maxHp : Math.min(player.hp, d.maxHp), mp: healed ? d.maxMp : Math.min(player.mp, d.maxMp) },
    lockedClass: cls, ...(moved ? { monsters: cityMonsters(city), dots: [], selectedMonster: null, pending: null, npc: null, action: { kind: 'idle' as ActionId, stamp: 0, duration: 0 } } : {}),
    ...(opts.first ? { deadUntil: 0, cooldowns: {}, journal: false, extraHotbar: s.extraHotbar, auto: { ...defaultAuto(cls), ...s.auto, enabled: false } } : {}),
    ...(opts.message ? { log: addLog(s.log, opts.message) } : {}) });
}
