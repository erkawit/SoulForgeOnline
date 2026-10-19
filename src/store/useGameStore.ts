import { create } from 'zustand';
import { calculateDamage, deriveStats, rollItem } from '@/lib/combat';
import { monsterSpawns, starterGear, starterPlayer } from '@/lib/seed';
import type { GearSlot, Item, Loot, Monster, Player, Snapshot } from '@/lib/types';

type AttackResult = { hit: boolean; reason?: string; damage?: number; crit?: boolean };
type GameState = {
  player: Player;
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
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));

export const useGameStore = create<GameState>((set, get) => ({
  player: { ...starterPlayer }, monsters: monsterSpawns.map(m => ({ ...m })), drops: [],
  inventory: Array.from({ length: 24 }, (_, i) => i === 0 ? starterGear : null),
  equipment: { weapon: null, armor: null, ring: null }, soulShards: 0,
  selectedMonster: null, attackFx: null,
  log: ['Enter the Hollow Reach. The hunt begins.'],
  move: (x, z, dt) => set(s => {
    const speed = deriveStats(s.player.stats, s.equipment).speed;
    return { player: { ...s.player, position: [
      clamp(s.player.position[0] + x * speed * dt, -23, 23),
      clamp(s.player.position[1] + z * speed * dt, -23, 23)
    ] } };
  }),
  selectMonster: id => set({ selectedMonster: id }),
  attack: (id, skill = false) => {
    const s = get();
    const target = s.monsters.find(m => m.id === id && m.hp > 0);
    if (!target) return { hit: false, reason: 'No target' };
    const distance = Math.hypot(target.x - s.player.position[0], target.z - s.player.position[1]);
    if (distance > (skill ? 4.0 : 3.0)) return { hit: false, reason: 'Out of range' };
    if (skill && s.player.mp < 20) return { hit: false, reason: 'Not enough mana' };
    const derived = deriveStats(s.player.stats, s.equipment);
    const roll = calculateDamage(derived.attack, target.level * 3, derived.crit, skill);
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
        if (player.exp >= expRequired(player.level)) {
          player.exp -= expRequired(player.level);
          player.level += 1;
          player.stats = { ...player.stats, str: player.stats.str + 2, agi: player.stats.agi + 1, vit: player.stats.vit + 1 };
          player.hp = deriveStats(player.stats, current.equipment).maxHp;
          log = addLog(log, `LEVEL UP! You reached level ${player.level}.`);
        }
      }
      return { monsters: nextMonsters, player, drops, soulShards: shards,
        log, selectedMonster: dead ? null : id,
        attackFx: { stamp: Date.now(), skill } };
    });
    return result;
  },
  castNearest: () => {
    const s = get();
    const nearby = s.monsters.filter(m => m.hp > 0)
      .map(m => ({ m, d: Math.hypot(m.x - s.player.position[0], m.z - s.player.position[1]) }))
      .sort((a, b) => a.d - b.d)[0];
    if (nearby && nearby.d <= 4) get().attack(nearby.m.id, true);
  },
  tick: () => set(s => {
    const now = Date.now();
    const [px, pz] = s.player.position;
    let dmg = 0;
    const monsters = s.monsters.map(m => {
      if (m.hp <= 0) {
        return m.respawnAt && now >= m.respawnAt
          ? { ...m, hp: m.maxHp, respawnAt: null, lastAttack: 0 } : m;
      }
      const distance = Math.hypot(px - m.x, pz - m.z);
      if (distance <= 1.8 && now - m.lastAttack > 1400) {
        dmg += Math.max(1, Math.round(5 + m.level * 3 - deriveStats(s.player.stats, s.equipment).defense * 0.18));
        return { ...m, lastAttack: now };
      }
      if (distance < 6 && distance > 1.7) {
        return { ...m, x: m.x + ((px - m.x) / distance) * 0.08,
          z: m.z + ((pz - m.z) / distance) * 0.08 };
      }
      return m;
    });
    const d = deriveStats(s.player.stats, s.equipment);
    const hp = s.player.hp - dmg;
    const fainted = hp <= 0;
    const player = { ...s.player,
      hp: fainted ? d.maxHp : Math.min(d.maxHp, hp + (dmg === 0 ? 0.3 : 0)),
      mp: Math.min(d.maxMp, s.player.mp + 0.5),
      position: fainted ? [0, 0] as [number, number] : s.player.position
    };
    return { monsters, player, ...(fainted ? {
      log: addLog(s.log, 'You were defeated and revived at the sanctuary.'), selectedMonster: null
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
    set({ player: data.player, inventory: data.inventory, equipment: data.equipment,
      soulShards: data.soulShards, log: ['Save loaded successfully.'] });
  }
}));

export function createSnapshot(): Snapshot {
  const s = useGameStore.getState();
  return { version: 1, player: s.player, inventory: s.inventory,
    equipment: s.equipment, soulShards: s.soulShards };
}
