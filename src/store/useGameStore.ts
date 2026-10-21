import {advanceMonster} from '@/game/monsterAI';
import { CITIES, CLASSES, isClass, isCity, walkable, safePosition, type ClassId, type CityId, type ActionId } from '@/game/content';
import { useMultiplayerStore } from './useMultiplayerStore';
import { create } from 'zustand';
import { calculateDamage, deriveStats, rollItem } from '@/lib/combat';
import { monsterSpawns, starterGear, starterPlayer } from '@/lib/seed';
import type { GearSlot, Item, Loot, Monster, Player, Snapshot } from '@/lib/types';

type AttackResult = { hit: boolean; reason?: string; damage?: number; crit?: boolean };
type GameState = {
  player: Player;
  journal: boolean;
  action: { kind: ActionId; stamp: number; duration: number };
  buffUntil: number;
  guardUntil: number;
  deadUntil: number;
  cooldowns: Record<string,number>;
  pending: {at:number; target:string|null} | null;
  setJournal: (open:boolean)=>void;
  chooseClass: (id:ClassId)=>void;
  travel: (id:CityId)=>void;
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
  hydrate: (snapshot: Snapshot) => void;
};

function addLog(log: string[], line: string) { return [line, ...log].slice(0, 6); }
export const expRequired = (level: number) => level * 95;
export function cityMonsters(city:CityId):Monster[]{
 const c=CITIES[city],low=c.levels?.[0]??1;
 return c.hunt.map(([x,z],i)=>{const level=c.levels?low+i:1+Math.floor(i/2),name=c.species?.[i===9?2:i%3]??monsterSpawns[i%monsterSpawns.length].name;
 const elite=!!c.levels&&i===9,maxHp=Math.round((65+level*18)*(elite?1.7:1));
 const form=/Spider|Crawler|Beetle|Crab|Weaver/.test(name)?'spider':/Hound|Wolf|Beast/.test(name)?'wolf':/Drake|Hydra|Serpent/.test(name)?'drake':/Golem|Guardian|Treant|Colossus|Sentinel/.test(name)?'golem':/Moth|Seraph/.test(name)?'winged':'wraith';
 return {id:`${city}-${i}`,name,x,z,home:[x,z],hp:maxHp,maxHp,level,form,tint:c.accent,elite,respawnAt:null,lastAttack:0};});
}
const activeClass=()=>CLASSES[getClass()];
function getClass():ClassId{return useGameStore.getState().player.classId??'Warrior';}
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));

export const useGameStore = create<GameState>((set, get) => ({
  player: { ...starterPlayer, classId:'Warrior', cityId:'hollow' }, monsters: cityMonsters('hollow'), drops: [],
  journal:true, action:{kind:'idle',stamp:0,duration:0}, buffUntil:0, guardUntil:0, deadUntil:0, cooldowns:{}, pending:null,
  setJournal:journal=>set({journal}),
  chooseClass:id=>{if(!isClass(id)||get().deadUntil||get().pending||useMultiplayerStore.getState().online)return;set({player:{...get().player,classId:id},action:{kind:'idle',stamp:0,duration:0},pending:null,selectedMonster:null});},
  travel:id=>{const s=get();if(!isCity(id)||s.deadUntil||useMultiplayerStore.getState().online)return;
    if(id===s.player.cityId){set({journal:false});return;}
    set({player:{...s.player,cityId:id,position:[0,0]},monsters:cityMonsters(id),drops:[],selectedMonster:null,pending:null,action:{kind:'idle',stamp:0,duration:0},log:addLog(s.log,`Arrived at ${CITIES[id].name}. Ground loot in the previous zone was left behind.`),journal:false});},
  preview:kind=>{if(useMultiplayerStore.getState().online||get().deadUntil)return;set({selectedMonster:null,action:{kind,stamp:Date.now(),duration:kind==='death'?2400:kind==='walk'?3200:1800}});},
  respawn:()=>{const s=get();if(!s.deadUntil||Date.now()<s.deadUntil)return;const d=deriveStats(s.player.stats,s.equipment);set({deadUntil:0,player:{...s.player,hp:d.maxHp,mp:d.maxMp,position:[0,0]},action:{kind:'idle',stamp:Date.now(),duration:0},log:addLog(s.log,'Revived at the sanctuary.')});},
  cast:kind=>{const s=get(),now=Date.now();if(s.deadUntil||s.pending||useMultiplayerStore.getState().online)return;
    if((s.cooldowns[kind]??0)>now){set({log:addLog(s.log,'Skill is cooling down.')});return;}
    const cost=kind==='skill'?20:kind==='buff'?15:30;
    if(s.player.mp<cost){set({log:addLog(s.log,'Not enough mana.')});return;}
    const cls=s.player.classId??'Warrior',def=CLASSES[cls];
    if(kind==='skill'){const target=s.monsters.filter(m=>m.hp>0&&Math.hypot(m.x-s.player.position[0],m.z-s.player.position[1])<=def.range+2).sort((a,b)=>Math.hypot(a.x-s.player.position[0],a.z-s.player.position[1])-Math.hypot(b.x-s.player.position[0],b.z-s.player.position[1]))[0];if(!target){set({log:addLog(s.log,'No target in skill range.')});return;}get().attack(target.id,true);return;}
    const target=s.monsters.filter(m=>m.hp>0&&Math.hypot(m.x-s.player.position[0],m.z-s.player.position[1])<=def.range+2)[0];
    if(kind==='special'&&cls==='Archer'&&!target){set({log:addLog(s.log,'No target in charged-shot range.')});return;}
    set({player:{...s.player,mp:s.player.mp-cost},selectedMonster:null,cooldowns:{...s.cooldowns,[kind]:now+(kind==='buff'?12000:10000)},action:{kind,stamp:now,duration:kind==='buff'?1100:2000},log:addLog(s.log,def.skills[kind==='buff'?1:2]),
      ...(kind==='buff'?{buffUntil:now+8000}:cls==='Warrior'?{guardUntil:now+4000}:{pending:{at:now+(cls==='Mage'?1600:cls==='Archer'?1500:cls==='Priest'?1300:1400),target:target?.id??null}})});
  },
  inventory: Array.from({ length: 24 }, (_, i) => i === 0 ? starterGear : null),
  equipment: { weapon: null, armor: null, ring: null }, soulShards: 0,
  selectedMonster: null, attackFx: null,
  log: ['Enter the Hollow Reach. The hunt begins.'],
  move: (x, z, dt) => set(s => {
    if(s.deadUntil||s.pending||s.journal||useMultiplayerStore.getState().online)return {};
    const speed = deriveStats(s.player.stats, s.equipment).speed;
    const city=s.player.cityId??'hollow';
    const nx=clamp(s.player.position[0]+x*speed*dt,-23,23),nz=clamp(s.player.position[1]+z*speed*dt,-23,23);
    const px=walkable(city,nx,s.player.position[1])?nx:s.player.position[0];
    const pz=walkable(city,px,nz)?nz:s.player.position[1];
    return {player:{...s.player,position:[px,pz]}};
  }),
  selectMonster: id => set({ selectedMonster: id }),
  attack: (id, skill = false) => {
    const s = get();
    const now=Date.now();
    if(s.deadUntil||s.pending||useMultiplayerStore.getState().online)return {hit:false,reason:'Unavailable'};
    if((s.cooldowns[skill?'skill':'attack']??0)>now)return {hit:false,reason:'Cooldown'};
    const target = s.monsters.find(m => m.id === id && m.hp > 0);
    if (!target) return { hit: false, reason: 'No target' };
    const distance = Math.hypot(target.x - s.player.position[0], target.z - s.player.position[1]);
    if (distance > (activeClass().range+(skill?2:0))) return { hit: false, reason: 'Out of range' };
    if (skill && s.player.mp < 20) return { hit: false, reason: 'Not enough mana' };
    const derived = deriveStats(s.player.stats, s.equipment);
    const roll = calculateDamage(derived.attack*(Date.now()<s.buffUntil?1.2:1), target.level * 3, derived.crit, skill);
    const killed = target.hp <= roll.damage;
    const result = { hit: true, damage: roll.damage, crit: roll.crit };
    set(current => {
      const monster = current.monsters.find(m => m.id === id);
      if (!monster || monster.hp <= 0) return {};
      const dead = monster.hp <= roll.damage;
      const nextMonsters = current.monsters.map(m => m.id === id ? {
        ...m, hp: Math.max(0, m.hp - roll.damage), respawnAt: dead ? Date.now() + 8000 : null
      } : m);
      let player = { ...current.player, mp: skill ? current.player.mp - 20 : current.player.mp };
      let drops = current.drops;
      let shards = current.soulShards;
      let log = addLog(current.log, `${roll.crit ? 'CRITICAL! ' : ''}${roll.damage} damage → ${monster.name}`);
      if (dead) {
        player.gold += 12 + monster.level * 3;
        player.exp += 30 + monster.level * 13;
        if (Math.random() < 0.84) {
          const item = rollItem(monster);
          drops = [...current.drops, { id: crypto.randomUUID(), x: monster.x, z: monster.z, item }];
          log = addLog(log, `${item.rarity.toUpperCase()} DROP · ${item.name}`);
        }
        if (Math.random() < 0.42) { shards += 1; log = addLog(log, '+1 Soul Shard'); }
        while (player.level<100 && player.exp >= expRequired(player.level)) {
          player.exp -= expRequired(player.level);
          player.level += 1;
          player.stats = { ...player.stats, str: player.stats.str + 2, agi: player.stats.agi + 1, vit: player.stats.vit + 1 };
          player.hp = deriveStats(player.stats, current.equipment).maxHp;
          log = addLog(log, `LEVEL UP! You reached level ${player.level}.`);
        }
      }
      return { monsters: nextMonsters, player, drops, soulShards: shards,
        log, selectedMonster: dead ? null : id,
        cooldowns:{...current.cooldowns,[skill?'skill':'attack']:now+(skill?4000:700)},
        action:{kind:skill?'skill':'attack',stamp:now,duration:skill?1000:650},
        attackFx: { stamp: now, skill } };
    });
    return result;
  },
  castNearest: () => get().cast('skill'),
  tick: () => set(s => {
    const now = Date.now();
    if(s.journal||useMultiplayerStore.getState().online)return {};
    if(s.deadUntil)return {};
    if(s.pending&&now>=s.pending.at){
      const cls=s.player.classId??'Warrior',d=deriveStats(s.player.stats,s.equipment);
      if(cls==='Priest')return {pending:null,player:{...s.player,hp:Math.min(d.maxHp,s.player.hp+d.maxHp*.4)}};
      if(cls==='Enchanter')return {pending:null,guardUntil:now+5000,log:addLog(s.log,'Concord Field: protection active (solo self).')};
      let player={...s.player},drops=[...s.drops],shards=s.soulShards,log=s.log;
      const monsters=s.monsters.map(m=>{
        const inRange=Math.hypot(m.x-player.position[0],m.z-player.position[1])<=(cls==='Mage'?7:13);
        if(m.hp<=0||!inRange||(cls==='Archer'&&m.id!==s.pending!.target))return m;
        const hp=Math.max(0,m.hp-Math.round(d.attack*(cls==='Mage'?2:2.6)));
        if(hp===0){player.gold+=12+m.level*3;player.exp+=30+m.level*13;shards+=1;
          const item=rollItem(m);drops.push({id:crypto.randomUUID(),x:m.x,z:m.z,item});
          log=addLog(log,`${m.name} defeated by ${CLASSES[cls].skills[2]}.`);
        }
        return {...m,hp,respawnAt:hp===0?now+8000:null};
      });
      while(player.level<100&&player.exp>=expRequired(player.level)){player.exp-=expRequired(player.level);player.level++;player.stats={...player.stats,str:player.stats.str+2,agi:player.stats.agi+1,vit:player.stats.vit+1};player.hp=deriveStats(player.stats,s.equipment).maxHp;}
      return {pending:null,monsters,player,drops,soulShards:shards,log:addLog(log,'Spell impact!')};
    }
    const [px, pz] = s.player.position;
    let dmg = 0;
    const defense=deriveStats(s.player.stats,s.equipment).defense;
    const monsters=s.monsters.map(m=>{const next=advanceMonster(m,[px,pz],s.player.cityId??'hollow',now,defense);dmg+=next.damage;return next.monster;});
    const d = deriveStats(s.player.stats, s.equipment);
    const hp = s.player.hp - dmg*(now < s.guardUntil ? .3 : 1);
    const fainted = hp <= 0;
    const player = { ...s.player,
      hp: fainted ? 0 : Math.min(d.maxHp, hp + (dmg === 0 ? 0.3 : 0)),
      mp: Math.min(d.maxMp, s.player.mp + 0.5),
      position: s.player.position
    };
    return { monsters, player, ...(fainted ? {
      deadUntil:now+2400,pending:null,action:{kind:'death',stamp:now,duration:2400},log:addLog(s.log,'Defeated. Return to the sanctuary when ready.'), selectedMonster:null
    } : {}) };
  }),
  pickup: id => set(s => {
    const drop = s.drops.find(d => d.id === id);
    if (!drop) return {};
    const distance = Math.hypot(drop.x - s.player.position[0], drop.z - s.player.position[1]);
    if (distance > 4) return { log: addLog(s.log, 'Move closer to collect loot.') };
    const index = s.inventory.findIndex(i => i === null);
    if (index < 0) return { log: addLog(s.log, 'Inventory full.') };
    const inventory = [...s.inventory]; inventory[index] = drop.item;
    return { inventory, drops: s.drops.filter(d => d.id !== id),
      log: addLog(s.log, `Collected ${drop.item.name}`) };
  }),
  swapInventory: (from, to) => set(s => {
    if (from < 0 || from >= s.inventory.length || to < 0 || to >= s.inventory.length) return {};
    const inventory = [...s.inventory];
    [inventory[from], inventory[to]] = [inventory[to], inventory[from]];
    return { inventory };
  }),
  equip: index => set(s => {
    const item = s.inventory[index];
    if (!item || !item.slot) return {};
    const inventory = [...s.inventory];
    const old = s.equipment[item.slot]; inventory[index] = old;
    const equipment = { ...s.equipment, [item.slot]: item };
    const maxHp = deriveStats(s.player.stats, equipment).maxHp;
    return { inventory, equipment, player: { ...s.player, hp: Math.min(s.player.hp, maxHp) },
      log: addLog(s.log, `Equipped ${item.name}`) };
  }),
  unequip: slot => set(s => {
    const old = s.equipment[slot];
    if (!old) return {};
    const index = s.inventory.indexOf(null);
    if (index === -1) return { log: addLog(s.log, 'Inventory full.') };
    const inventory = [...s.inventory]; inventory[index] = old;
    return { inventory, equipment: { ...s.equipment, [slot]: null },
      log: addLog(s.log, `Unequipped ${old.name}`) };
  }),
  forge: () => set(s => {
    const weapon = s.equipment.weapon;
    if (!weapon) return { log: addLog(s.log, 'Equip a weapon first.') };
    if (s.soulShards < 3) return { log: addLog(s.log, 'You need 3 Soul Shards.') };
    const nextSoul = weapon.soul === 'Ember' ? 'Frost' : weapon.soul === 'Frost' ? 'Void' : 'Ember';
    return { soulShards: s.soulShards - 3,
      equipment: { ...s.equipment, weapon: { ...weapon, soul: nextSoul, name: weapon.name.replace(/ \[(Ember|Frost|Void)\]$/, '') + ` [${nextSoul}]` } },
      log: addLog(s.log, `SOUL-FORGE! ${nextSoul} soul bound to your weapon.`) };
  }),
  hydrate: data => {
    if (data?.version !== 1 || !data.player || !Array.isArray(data.inventory) || data.inventory.length !== 24) return;
    const city=isCity(data.player.cityId)?data.player.cityId:'hollow';
    const cls=isClass(data.player.classId)?data.player.classId:'Warrior';
    set({deadUntil:0,pending:null,selectedMonster:null,buffUntil:0,guardUntil:0,cooldowns:{},action:{kind:'idle',stamp:0,duration:0},monsters:cityMonsters(city),drops:[], player: {...data.player,classId:cls,cityId:city,position:safePosition(city,data.player.position),hp:Math.max(1,data.player.hp)}, inventory: data.inventory, equipment: data.equipment,
      soulShards: data.soulShards, log: ['Save loaded successfully.'] });
  }
}));

export function createSnapshot(): Snapshot {
  const s = useGameStore.getState();
  return { version: 1, player: s.player, inventory: s.inventory,
    equipment: s.equipment, soulShards: s.soulShards };
}
