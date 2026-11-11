// Round 9: the economy core. Every change to a character's money, items, level, quests or skills is a pure reducer here,
// shared by the game client (offline play, optimistic online play) and the realm server (apps/game-server), which is the
// authority online: the same code runs on both sides, the server with its own RNG. Nothing in this file touches the
// browser, audio or React; the store adds sounds, tips and log lines around the results.
//
//   reducer(state, args…, ctx) → { ok: true, state, log, events } | { ok: false, msg }
//
// `log` lines are in the order they happen (the store prepends them to its 6-line log), `events` are quest events
// (questEvent in src/game/quests.ts) the caller feeds back through `applyEvents`.
import { POTION_RECIPES, SOUL_STONES, stoneFor } from '../ui/forgeCatalog';
import type { GearSlot, Item, Loot, Monster, Player, Rarity } from '@/lib/types';
import { CITIES, CLASS_IDS, isClass, homePoint, arrivalPoint, isCity, nearPortal, portalsOf, statClass, type ClassId, type CityId } from '../content';
import { spawnPoints } from '../spawns';
import { monsterStats, type ActiveBuff, type Derived } from '../balance/stats';
import { deriveFor, rollLoot } from '@/lib/combat';
import { monsterExp, monsterSoulGod, bossDrops } from '../rewards';
import { EMPTY_GEAR, ITEM_BY_ID, FOOD_ITEMS, COSTUMES, canEquipItem, isConsumable, makeGear, makeItem, migrateClassItem, npcPrice, type WeaponKind } from '../items';
import { SHOP_ITEMS, STARTER_KITS, nearNpc, type NpcService } from '../npcs';
import { canPromote, validPromotion, type PromotionId } from '../advancement';
import { newbieBuff, refreshNewbie } from '../balance/buffs';
import { resolveEnhance } from '../balance/enhance';
import { craftBlocker, craftCost, crystalCraft as crystalRoll, crystalId, rollCraft, type CraftSlot, type CrystalTier } from '../balance/craft';
import { learn, resetCost, starterLevels, type Hotbar, type SkillLevels, type SkillLibrary } from '../skills/engine';
import { CLASS_EXTRA, DEFAULT_HOTBAR, REAVER_SKILLS } from '../skills/defaults';
import { acceptQuest as acceptQ, questEvent, turnInQuest as turnInQ, QUEST_BY_ID, stageUnlocked, type QuestEvent, type QuestLog, type SkillReward } from '../quests';
import { zoneAt } from '../world/zones';
import type { GameConfig } from '../balance/config';
import { CODEX_SEAL, LOOT_OF_SPECIES, type Codex } from '../codex';
import { partyExpBonus } from '../balance/party';
import { FASHION, grant, takeOff, wear, type FashionItem, type FashionSlot, type Wardrobe } from '../fashion';

/** Everything about a character that has value: the server owns it online. Combat-only state (cooldowns, monsters,
 *  dots, the current action) stays in the client store. */
export type CharState = {
  player: Player;
  inventory: (Item | null)[];
  equipment: Record<GearSlot, Item | null>;
  soulShards: number;
  skillLevels: SkillLevels;
  hotbar: Hotbar;
  buffs: ActiveBuff[];
  starterKits: string[];
  quests: QuestLog;
  /** this character's loot on the ground of the current map (cleared on travel) */
  drops: Loot[];
  /** the monster codex (round 11): loot id → registered tiers. Optional so saves from before round 11 load as-is. */
  codex?: Codex;
  /** the wardrobe (round 12): fashion owned and worn — no stats */
  wardrobe?: Wardrobe;
};
/** `party`: party members on this map within config.codex.partyRange, the killer included (set by the realm for kills;
 *  offline play is always solo) */
export type Ctx = { config: GameConfig; skills: SkillLibrary; rng: () => number; now: number; uuid: () => string; party?: number };
export type Ok = { ok: true; state: CharState; log: string[]; events: QuestEvent[]; msg?: string; levelUps?: number; dropped?: Item[] };
export type Fail = { ok: false; msg: string };
export type Result = Ok | Fail;

export const BAG_SIZE = 24;
export const MAIN_CITIES: CityId[] = ['hollow', 'dawnveil', 'thornwatch'];
export const expRequired = (level: number) => level * 95;
const STACK = ['consumable', 'material', 'crystal'];
/** ground loot cap per character (older pieces vanish) — every piece is a mesh + label in the world */
export const MAX_GROUND_LOOT = 24;
const stacks = (i: Item | null) => !!i && STACK.includes(i.family ?? '');
const fail = (msg: string): Fail => ({ ok: false, msg });
const done = (state: CharState, log: string[] = [], events: QuestEvent[] = [], extra: Partial<Ok> = {}): Ok => ({ ok: true, state, log, events, ...extra });

// ------------------------------------------------------------------ bag helpers
export const countOf = (inv: (Item | null)[], id: string) => inv.reduce((a, i) => a + (i?.definitionId === id ? (i.qty ?? 1) : 0), 0);
/** a catalog item, with the id taken from ctx so client and server create the same instance */
export const newItem = (id: string, ctx: Ctx): Item => ({ ...makeItem(id), id: ctx.uuid() });
export function giveTo(inv: (Item | null)[], id: string, n: number, ctx: Ctx): (Item | null)[] | null {
  const out = [...inv], at = out.findIndex(i => i?.definitionId === id && STACK.includes(i.family ?? ''));
  if (at >= 0) { out[at] = { ...out[at]!, qty: (out[at]!.qty ?? 1) + n }; return out; }
  const free = out.indexOf(null); if (free < 0 || !ITEM_BY_ID[id]) return null;
  const it = newItem(id, ctx); out[free] = STACK.includes(it.family ?? '') ? { ...it, qty: n } : it; return out;
}
export function takeFrom(inv: (Item | null)[], id: string, n: number): (Item | null)[] | null {
  if (countOf(inv, id) < n) return null; const out = [...inv];
  for (let i = 0; i < out.length && n > 0; i++) { const it = out[i]; if (it?.definitionId !== id) continue; const q = it.qty ?? 1, use = Math.min(q, n); n -= use; out[i] = q - use > 0 ? { ...it, qty: q - use } : null; }
  return out;
}
/** a shop consumable stacked onto an existing stack or into a free slot (shop items are not in the item catalog) */
function giveShop(inv: (Item | null)[], id: string, qty: number, ctx: Ctx): (Item | null)[] | null {
  const shop = SHOP_ITEMS.find(x => x.id === id); if (!shop) return null;
  const out = [...inv], at = out.findIndex(i => i?.definitionId === id && isConsumable(i));
  if (at >= 0) { out[at] = { ...out[at]!, qty: (out[at]!.qty ?? 1) + qty }; return out; }
  const free = out.indexOf(null); if (free < 0) return null;
  out[free] = { id: ctx.uuid(), definitionId: id, name: shop.name, rarity: 'Common', slot: null, family: 'consumable', bonuses: {}, description: shop.th, npcValue: Math.max(1, Math.floor(shop.price / 4)), qty };
  return out;
}

// ------------------------------------------------------------------ derived numbers, monsters
export const derive = (s: Pick<CharState, 'player' | 'equipment' | 'buffs' | 'skillLevels'> & { codex?: Codex }, ctx: Pick<Ctx, 'config' | 'skills' | 'now'>): Derived =>
  deriveFor({ cls: statClass(s.player), level: s.player.level, equipment: s.equipment, buffs: s.buffs, skillLevels: s.skillLevels, skills: ctx.skills, config: ctx.config, now: ctx.now, codex: s.codex });
const formOf = (name: string) => /Spider|Crawler|Beetle|Crab|Weaver/.test(name) ? 'spider' : /Hound|Wolf|Beast/.test(name) ? 'wolf' : /Drake|Hydra|Serpent/.test(name) ? 'drake' : /Golem|Guardian|Treant|Colossus|Sentinel|Devourer/.test(name) ? 'golem' : /Moth|Seraph/.test(name) ? 'winged' : 'wraith';
/** the monsters of a map at full health (ids = spawn ids, so a kill can be checked against the spawn table) */
export function monstersFor(city: CityId, config: GameConfig): Monster[] {
  const c = CITIES[city];
  return spawnPoints(city).map(({ id, position: [x, z], name, level, elite, boss, respawnSeconds }) => {
    const maxHp = monsterStats(level, { elite, boss, dungeon: !!c.dungeon }, config).maxHp;
    return { id, name, x, z, home: [x, z], hp: maxHp, maxHp, level, form: formOf(name), tint: c.accent, elite, boss, respawnSeconds, dungeon: c.dungeon, damageMultiplier: c.dungeon ? 3 : 1, expMultiplier: c.dungeon ? 5 : 1, respawnAt: null, lastAttack: 0 };
  });
}
/** respawn delay after a kill (client monster AI and server kill checks use the same numbers) */
export const respawnMs = (m: Pick<Monster, 'boss'|'respawnSeconds'>) => (m.respawnSeconds ?? (m.boss ? 300 : 8)) * 1000;

function levelUps(state: CharState, ctx: Ctx, log: string[], events: QuestEvent[], heal: boolean): number {
  let n = 0; const p = state.player;
  while (p.level < 100 && p.exp >= expRequired(p.level)) {
    p.exp -= expRequired(p.level); p.level += 1; n++;
    if (heal) { state.buffs = refreshNewbie(state.buffs, p.level, ctx.config); p.hp = derive(state, ctx).maxHp; log.push(`LEVEL UP! เลเวล ${p.level} · ได้รับแต้มสกิล`); events.push({ type: 'level', level: p.level }); }
    else log.push(`LEVEL UP! เลเวล ${p.level}`);
  }
  return n;
}

// ------------------------------------------------------------------ kills and loot
/** SoulGod, EXP (+buff bonus), loot from the admin drop tables, materials, shards and level-ups for one kill.
 *  Ground loot lands next to the monster in `state.drops`. */
export function grantKill(s: CharState, m: Monster, ctx: Ctx): Ok {
  const state: CharState = { ...s, player: { ...s.player }, buffs: s.buffs }, log: string[] = [], events: QuestEvent[] = [], rng = ctx.rng;
  const d = derive(s, ctx);
  // round 12: party EXP (balance/party.ts) — ctx.party = members on this map within range, the killer included
  state.player.gold += monsterSoulGod(m, ctx.config); state.player.exp += Math.round(monsterExp(m) * (1 + d.expBonus) * (1 + partyExpBonus(ctx.party ?? 1)));
  const loot = [...(m.boss ? bossDrops(m).map(i => ({ ...i, id: ctx.uuid() })) : []), ...rollLoot(m, classOf(s), ctx.config, rng).map(i => ({ ...i, id: ctx.uuid() }))];
  // crafting materials: ore from everything (more in the Sorrowlands), shards / cores from elites, food now and then
  const zone = state.player.cityId === 'wild0' ? zoneAt(m.x, m.z) : null, mat = (id: string, q: number) => ({ ...newItem(id, ctx), qty: q });
  if (rng() < .35) loot.push(mat('material-ore', Math.max(1, Math.round((1 + rng() * 1.5) * (m.elite ? 3 : 1) * (zone ? 1.5 : 1)))));
  if (m.elite && rng() < .6) loot.push(mat('material-3', 1)); if (m.elite && rng() < .15) loot.push(mat('material-4', 1));
  if (rng() < .03) loot.push(mat(FOOD_ITEMS[Math.floor(rng() * FOOD_ITEMS.length)].id, 1));
  // the monster codex (round 11): this species' loot, and Codex Seals from elites and bosses — more with a party nearby
  const cx = ctx.config.codex;
  if (cx.enabled) {
    const lootId = LOOT_OF_SPECIES[m.name];
    if (lootId && !m.boss) {
      const far = state.player.level - m.level >= cx.outlevelBy ? cx.outlevelFactor : 1;
      if (m.elite) { const [lo, hi] = cx.eliteLoot, q = lo + Math.floor(rng() * (hi - lo + 1)); if (q > 0 && (far >= 1 || rng() < far)) loot.push(mat(lootId, q)); }
      else if (rng() < cx.lootChance * far) loot.push(mat(lootId, 1));
    }
    const party = Math.max(1, ctx.party ?? 1);
    if (m.boss) loot.push(mat(CODEX_SEAL, party >= 3 ? 2 : 1));
    else if (m.elite && rng() < (party >= 2 ? cx.sealChance.party : cx.sealChance.solo)) loot.push(mat(CODEX_SEAL, 1));
  }
  events.push({ type: 'kill', species: m.name, elite: !!m.elite && !m.boss, boss: !!m.boss, zone: zone?.id ?? null });
  // stackable loot (ore, codex materials, seals, food) goes straight into the bag — only gear lies on the ground, so the
  // field no longer fills up with loot meshes; a full bag still drops it on the ground
  let drops = s.drops; const inventory = [...s.inventory]; let bagged = false;
  for (const item of loot) {
    if (stacks(item)) {
      const at = inventory.findIndex(i => stacks(i) && i!.definitionId === item.definitionId), free = at < 0 ? inventory.indexOf(null) : -1;
      if (at >= 0) { inventory[at] = { ...inventory[at]!, qty: (inventory[at]!.qty ?? 1) + (item.qty ?? 1) }; bagged = true; continue; }
      if (free >= 0) { inventory[free] = item; bagged = true; continue; }
    }
    drops = [...drops, { id: ctx.uuid(), x: m.x + (rng() - .5), z: m.z + (rng() - .5), item }]; if (!m.boss) log.push(`${item.rarity.toUpperCase()} DROP · ${item.name}`);
  }
  if (bagged) state.inventory = inventory;
  // at most MAX_GROUND_LOOT pieces on the ground: the oldest vanish first
  state.drops = drops.length > MAX_GROUND_LOOT ? drops.slice(drops.length - MAX_GROUND_LOOT) : drops;
  if (rng() < .42) { state.soulShards = s.soulShards + 1; log.push('+1 Soul Shard'); }
  const ups = levelUps(state, ctx, log, events, true);
  return done(state, log, events, { levelUps: ups, dropped: loot });
}
export function pickup(s: CharState, dropId: string, reach = 4): Result {
  const drop = s.drops.find(d => d.id === dropId); if (!drop) return fail('Loot unavailable');
  if (Math.hypot(drop.x - s.player.position[0], drop.z - s.player.position[1]) > reach) return fail('Move closer to collect loot.');
  const inventory = [...s.inventory], at = stacks(drop.item) ? inventory.findIndex(i => stacks(i) && i!.definitionId === drop.item.definitionId) : -1;
  if (at >= 0) inventory[at] = { ...inventory[at]!, qty: (inventory[at]!.qty ?? 1) + (drop.item.qty ?? 1) };
  else { const index = inventory.indexOf(null); if (index < 0) return fail('Inventory full.'); inventory[index] = drop.item; }
  return done({ ...s, inventory, drops: s.drops.filter(d => d.id !== dropId) }, [`Collected ${drop.item.name}`]);
}

// ------------------------------------------------------------------ bag and equipment
export function swapInventory(s: CharState, from: number, to: number): Result {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || from >= s.inventory.length || to < 0 || to >= s.inventory.length) return fail('Invalid slot');
  const inventory = [...s.inventory]; [inventory[from], inventory[to]] = [inventory[to], inventory[from]];
  return done({ ...s, inventory });
}
export function equip(s: CharState, index: number, ctx: Ctx): Result {
  const item = s.inventory[index]; if (!item || !item.slot) return fail('Nothing to equip');
  if (!canEquipItem(item, classOf(s))) return fail(`${item.name} ใช้ได้เฉพาะอาชีพ ${item.slot === 'weapon' ? item.family : (item.classLock ?? 'อื่น')} เท่านั้น`);
  const inventory = [...s.inventory], old = s.equipment[item.slot]; inventory[index] = old;
  const equipment = { ...s.equipment, [item.slot]: item }, maxHp = derive({ ...s, equipment }, ctx).maxHp;
  return done({ ...s, inventory, equipment, player: { ...s.player, hp: Math.min(s.player.hp, maxHp) } }, [`Equipped ${item.name}`], [{ type: 'equip', slot: item.slot }]);
}
export function unequip(s: CharState, slot: GearSlot): Result {
  const old = s.equipment[slot]; if (!old) return fail('Empty slot');
  const index = s.inventory.indexOf(null); if (index === -1) return fail('Inventory full.');
  const inventory = [...s.inventory]; inventory[index] = old;
  return done({ ...s, inventory, equipment: { ...s.equipment, [slot]: null } }, [`Unequipped ${old.name}`]);
}

// ------------------------------------------------------------------ NPC services
const near = (s: CharState, service: NpcService) => nearNpc(s.player.cityId, s.player.position, service);
export function sellNpc(s: CharState, itemId: string, ctx: Ctx): Ok & { value: number } | Fail {
  const index = s.inventory.findIndex(i => i?.id === itemId); if (index < 0) return fail('Item not found');
  const item = s.inventory[index]!, inventory = [...s.inventory]; inventory[index] = null;
  const value = Math.max(1, Math.round(npcPrice(item) * (item.qty ?? 1) * ctx.config.economy.npcSellRate));
  return { ...done({ ...s, inventory, player: { ...s.player, gold: s.player.gold + value } }, [`Sold ${item.name} for ${value} SoulGod.`]), value };
}
export function buyShop(s: CharState, id: string, qty: number, ctx: Ctx): Result {
  const item = SHOP_ITEMS.find(x => x.id === id); if (!item || !Number.isInteger(qty) || qty < 1 || qty > 99) return fail('สินค้าไม่ถูกต้อง');
  if (!near(s, 'shop')) return fail('ต้องอยู่ใกล้ร้าน Mira Ashvale'); const cost = item.price * qty; if (s.player.gold < cost) return fail(`SoulGod ไม่พอ (ต้องใช้ ${cost.toLocaleString()})`);
  const inventory = giveShop(s.inventory, id, qty, ctx); if (!inventory) return fail('กระเป๋าเต็ม');
  return done({ ...s, inventory, player: { ...s.player, gold: s.player.gold - cost } }, [`ซื้อ ${item.th} ×${qty} (−${cost.toLocaleString()} SG)`], [{ type: 'buy', item: id }]);
}
export function buyCatalog(s: CharState, id: string, ctx: Ctx): Result {
  // round 12: costumes moved to the cash shop (wardrobe, paid in baht, granted by the realm after payment) — SoulGod buys food only
  const food = FOOD_ITEMS.find(f => f.id === id), stone = SOUL_STONES.find(x => x.id === id), price = food?.price ?? stone?.price; if (price === undefined) return fail(COSTUMES.some(c => c.id === id) ? 'ชุดแฟชั่นย้ายไปจำหน่ายใน Cash Shop แล้ว' : 'สินค้าไม่ถูกต้อง');
  if (!near(s, 'shop')) return fail('ต้องอยู่ใกล้ร้าน Mira Ashvale'); if (s.player.gold < price) return fail(`SoulGod ไม่พอ (ต้องใช้ ${price.toLocaleString()})`);
  const inventory = giveTo(s.inventory, id, 1, ctx); if (!inventory) return fail('กระเป๋าเต็ม');
  return done({ ...s, inventory, player: { ...s.player, gold: s.player.gold - price } }, [`ซื้อ ${food?.th ?? stone?.name}`], [{ type: 'buy', item: id }]);
}
/** potions (heal at once), food (15-minute buff), the Return Scroll (to the plaza of the region's capital) */
export function useItem(s: CharState, index: number, ctx: Ctx): Ok & { kind: 'food' | 'potion'; moved?: CityId } | Fail {
  const item = s.inventory[index]; if (!item || !isConsumable(item)) return fail('Not usable');
  const inventory = [...s.inventory], q = (item.qty ?? 1) - 1; inventory[index] = q > 0 ? { ...item, qty: q } : null;
  const food = FOOD_ITEMS.find(f => f.id === item.definitionId);
  if (food) return { ...done({ ...s, inventory, buffs: [...s.buffs.filter(b => !b.id.startsWith('food-')), { id: food.id, source: food.th, ...food.buff, until: ctx.now + food.minutes * 60000 }] }, [`กิน ${food.th} · บัฟ ${food.minutes} นาที`]), kind: 'food' };
  const shop = SHOP_ITEMS.find(x => x.id === item.definitionId); if (!shop) return fail('Not usable');
  const d = derive(s, ctx), e = shop.effect, player = { ...s.player };
  if (e.hp) player.hp = Math.min(d.maxHp, player.hp + e.hp); if (e.hpPct) player.hp = Math.min(d.maxHp, player.hp + d.maxHp * e.hpPct / 100);
  if (e.mp) player.mp = Math.min(d.maxMp, player.mp + e.mp); if (e.mpPct) player.mp = Math.min(d.maxMp, player.mp + d.maxMp * e.mpPct / 100);
  const home = CITIES[player.cityId ?? 'hollow'].parent ?? (player.cityId ?? 'hollow');
  let moved: CityId | undefined;
  if (e.returnHome) { if (home !== s.player.cityId) moved = home; player.cityId = home; player.position = homePoint(home); }
  return { ...done({ ...s, inventory, player, drops: moved ? [] : s.drops }, [`ใช้ ${shop.th}`]), kind: 'potion', moved };
}
/** Alchemy is atomic and uses the same reducer offline and on the realm. */
export function brewPotion(s: CharState, id: string, qty: number, ctx: Ctx): Result {
  const recipe = POTION_RECIPES.find(r => r.id === id);
  if (!recipe || !Number.isInteger(qty) || qty < 1 || qty > 99) return fail('สูตรหรือจำนวนไม่ถูกต้อง');
  if (!near(s, 'enhance')) return fail('ต้องอยู่ใกล้โรงคราฟ Brannoc');
  if (s.player.gold < recipe.fee * qty) return fail('SoulGod ไม่พอ');
  let inventory = s.inventory;
  for (const m of recipe.materials) {
    const next = takeFrom(inventory, m.id, m.qty * qty);
    if (!next) return fail('วัตถุดิบไม่พอ');
    inventory = next;
  }
  const result = giveShop(inventory, id, qty, ctx);
  if (!result) return fail('กระเป๋าเต็ม');
  return done({...s, inventory: result, player: {...s.player, gold: s.player.gold - recipe.fee * qty}}, [`ปรุงยา ×${qty}`], [], {msg: `ปรุงยาสำเร็จ ×${qty}`});
}
export type EnhanceRef = { inventory?: number; slot?: GearSlot };
export function enhance(s: CharState, ref: EnhanceRef, protection: boolean, ctx: Ctx): Ok & { result: string; success: boolean } | Fail {
  if (!near(s, 'enhance')) return fail('ตีบวกได้ที่ Brannoc Ironhand (NPC Merchant) ในเมืองเท่านั้น');
  const item = ref.slot ? s.equipment[ref.slot] : ref.inventory !== undefined ? s.inventory[ref.inventory] : null;
  if (!item || !item.slot) return fail('เลือกอุปกรณ์ที่จะตีบวก');
  if (item.slot === 'costume') return fail('ชุดแฟชั่นไม่สามารถตีบวกได้');
  const consumed = takeFrom(s.inventory, stoneFor(item.slot).id, 1);
  if (!consumed) return fail(`ต้องใช้ ${stoneFor(item.slot).name} 1 ก้อน`);
  const c = ctx.config, cur = item.enhance ?? 0, out = resolveEnhance(item.rarity as Rarity, cur, protection, ctx.rng, c);
  if (out.result === 'max') return fail(`ตีบวกสูงสุดแล้ว (+${c.enhance.maxLevel})`);
  if (s.player.gold < out.cost) return fail(`SoulGod ไม่พอ (ต้องใช้ ${out.cost.toLocaleString()})`);
  const base = item.name.replace(/^\+\d+ /, ''), next = { ...item, enhance: out.level, name: out.level ? `+${out.level} ${base}` : base };
  const patch = ref.slot ? { inventory: consumed, equipment: { ...s.equipment, [ref.slot]: next } } : { inventory: consumed.map((x, i) => i === ref.inventory ? next : x) };
  const message = out.result === 'success' ? `สำเร็จ! ${base} → +${out.level}` : out.result === 'fail-safe' ? 'ล้มเหลว (ยังอยู่ในระดับปลอดภัย ไม่ลดขั้น)' : out.result === 'fail-protected' ? 'ล้มเหลว แต่คัมภีร์ป้องกันไว้ ไม่ลดขั้น' : `ล้มเหลว ลดลงเหลือ +${out.level}`;
  return { ...done({ ...s, ...patch, player: { ...s.player, gold: s.player.gold - out.cost } }, [`ตีบวก: ${message} (−${out.cost.toLocaleString()} SG)`], [{ type: 'enhance' }], { msg: message }), result: out.result, success: out.ok };
}
/** crafted gear is locked to the class the player picked */
export function forged(defId: string, cls: ClassId, ctx: Ctx): Item {
  return { ...makeGear(defId, cls, ctx.rng), id: ctx.uuid(), classLock: cls };
}
export function craft(s: CharState, rarity: Rarity, cls: ClassId, slot: CraftSlot, ctx: Ctx): Ok & { success: boolean; crystal?: string } | Fail {
  if (!near(s, 'enhance')) return fail('คราฟได้ที่ Brannoc Ironhand (โรงตีเหล็ก) ในเมืองเท่านั้น');
  const block = craftBlocker(rarity, slot, { soulGod: s.player.gold, count: id => countOf(s.inventory, id) }, ctx.config); if (block) return fail(block);
  const cost = craftCost(rarity, slot, ctx.config); let inventory: (Item | null)[] | null = s.inventory;
  for (const m of cost.materials) inventory = takeFrom(inventory!, m.id, m.qty); if (!inventory) return fail('วัตถุดิบไม่พอ');
  const r = rollCraft(rarity, cls, slot, ctx.rng, ctx.config);
  let message: string;
  if (r.success) { const free = inventory.indexOf(null); if (free < 0) return fail('กระเป๋าเต็ม'); const it = forged(r.defId, cls, ctx); inventory = [...inventory]; inventory[free] = it; message = `สำเร็จ! ได้ ${it.name}`; }
  else { message = 'คราฟไม่สำเร็จ — วัตถุดิบสลาย'; if (r.crystal) { const next = giveTo(inventory, r.crystal, 1, ctx); if (next) inventory = next; message += ` · ได้ ${ITEM_BY_ID[r.crystal]?.name ?? r.crystal} 1 เม็ด (${countOf(inventory, r.crystal)}/3)`; } }
  return { ...done({ ...s, inventory, player: { ...s.player, gold: s.player.gold - cost.soulGod } }, [`คราฟ ${rarity}: ${message}`], [{ type: 'craft', rarity }], { msg: message }), success: r.success, crystal: r.success ? undefined : r.crystal ?? undefined };
}
export function crystalCraft(s: CharState, tier: CrystalTier, cls: ClassId, slot: CraftSlot, ctx: Ctx, kind: WeaponKind = 'greatsword'): Result {
  if (!near(s, 'enhance')) return fail('คราฟได้ที่ Brannoc Ironhand เท่านั้น');
  const r = crystalRoll(tier, cls, slot, countOf(s.inventory, crystalId(tier)), ctx.config, kind); if (!r.ok) return fail(r.reason);
  let inventory = takeFrom(s.inventory, crystalId(tier), r.spend)!; const free = inventory.indexOf(null); if (free < 0) return fail('กระเป๋าเต็ม');
  const it = forged(r.defId, cls, ctx); inventory = [...inventory]; inventory[free] = it;
  return done({ ...s, inventory }, [`คริสตัล ${r.spend} เม็ด → ${it.name} (100%)`], [{ type: 'craft', rarity: tier }], { msg: `คริสตัลหลอมเป็น ${it.name} สำเร็จ 100%` });
}
export function claimStarterKit(s: CharState, ctx: Ctx): Result {
  const cls: ClassId = classOf(s);
  if (!near(s, 'starter')) return fail('ต้องคุยกับ Quartermaster Hale'); if (s.starterKits.includes(cls)) return fail(`รับชุด ${cls} ไปแล้ว`);
  const ids = STARTER_KITS[cls] ?? STARTER_KITS.Berserker, free = s.inventory.filter(i => i === null).length; if (free < ids.length) return fail(`ต้องมีช่องว่างในกระเป๋า ${ids.length} ช่อง`);
  const inventory = [...s.inventory];
  for (const id of ids) inventory[inventory.indexOf(null)] = { ...makeGear(id, cls, ctx.rng), id: ctx.uuid(), ...(cls === 'Berserker' ? { classLock: cls } : {}) };
  return done({ ...s, inventory, starterKits: [...s.starterKits, cls] }, [`ได้รับชุดเริ่มต้น ${cls} (ดูในกระเป๋า I)`]);
}
export function receiveBlessing(s: CharState, ctx: Ctx): Result {
  if (!near(s, 'blessing')) return fail('ต้องคุยกับ Sister Lumen');
  const b = newbieBuff(s.player.level, ctx.now, ctx.config); if (!b) return fail(`พรนี้สำหรับเลเวล 1–${ctx.config.newbieBuff.maxLevel} เท่านั้น ลองกินอาหารบัฟจากร้านค้า`);
  return done({ ...s, buffs: [...s.buffs.filter(x => x.id !== 'newbie'), b] }, [`ได้รับ ${b.source}`], [{ type: 'blessing' }]);
}
export function forgeSoul(s: CharState): Result {
  const weapon = s.equipment.weapon; if (!weapon) return fail('Equip a weapon first.'); if (s.soulShards < 3) return fail('You need 3 Soul Shards.');
  const nextSoul = weapon.soul === 'Ember' ? 'Frost' : weapon.soul === 'Frost' ? 'Void' : 'Ember';
  return done({ ...s, soulShards: s.soulShards - 3, equipment: { ...s.equipment, weapon: { ...weapon, soul: nextSoul, name: weapon.name.replace(/ \[(Ember|Frost|Void)\]$/, '') + ` [${nextSoul}]` } } }, [`SOUL-FORGE! ${nextSoul} soul bound to your weapon.`]);
}

// ------------------------------------------------------------------ skills, class advancement
export const freshSkills = (lib: SkillLibrary, cls: ClassId = 'Berserker') => ({ skillLevels: starterLevels(lib, cls), hotbar: { ...DEFAULT_HOTBAR[cls] } as Hotbar });
export function learnSkill(s: CharState, id: string, ctx: Ctx): Result {
  const r = learn(ctx.skills, classOf(s), id, s.skillLevels, s.player.level, s.player.promotionId === 'Reaver');
  if (!r.ok) return fail(r.reason ?? 'เรียนไม่ได้'); const def = ctx.skills.defs.find(d => d.id === id)!;
  return done({ ...s, skillLevels: r.levels }, [`เรียน ${def.name} Lv.${r.levels[id]}`], [{ type: 'learn', skill: id }]);
}
export function resetSkills(s: CharState, ctx: Ctx): Result {
  const cls: ClassId = classOf(s);
  if (!near(s, 'skills')) return fail('ต้องคุยกับ Master Ysolde ในเมือง');
  const cost = resetCost(s.player.level, ctx.config.economy.skillResetBase, ctx.config.economy.skillResetPerLevel);
  if (s.player.gold < cost) return fail(`ต้องใช้ ${cost.toLocaleString()} SoulGod`);
  return done({ ...s, player: { ...s.player, gold: s.player.gold - cost }, ...freshSkills(ctx.skills, cls) }, [`รีเซ็ตต้นไม้สกิล (−${cost.toLocaleString()} SG)`]);
}
export function setHotbar(s: CharState, slot: keyof Hotbar, id: string, ctx: Ctx): Result {
  const def = ctx.skills.defs.find(d => d.id === id);
  if (!def || def.kind !== 'active' || def.cls !== classOf(s) || !(s.skillLevels[id] > 0) || !(slot in s.hotbar)) return fail('Invalid skill');
  const hotbar = { ...s.hotbar }; for (const k of Object.keys(hotbar) as (keyof Hotbar)[]) if (hotbar[k] === id) hotbar[k] = s.hotbar[slot]; hotbar[slot] = id;
  return done({ ...s, hotbar });
}
/** class advancement at the plaza (within 6 m of the centre of a capital) */
export function promote(s: CharState, id: PromotionId): Result {
  if (Math.hypot(...s.player.position) >= 6 || !canPromote(classOf(s), s.player.level, s.player.promotionId, id, stageUnlocked(s.quests))) return fail('ต้องผ่านเควสทดสอบสายอาชีพของ Master Ysolde ก่อน และยืนที่ลานกลางเมือง');
  // the six Reaver skills open at rank 1 and take over their Berserker slots (the Berserker ranks are kept)
  const skillLevels = { ...s.skillLevels }; for (const sid of REAVER_SKILLS) if (!(skillLevels[sid] > 0)) skillLevels[sid] = 1;
  return done({ ...s, skillLevels, player: { ...s.player, promotionId: id } }, [`เลื่อนขั้นเป็น ${id}! สกิลทั้ง 6 ช่องพัฒนาร่างแล้ว (ต้นไม้สกิล K)`]);
}

// ------------------------------------------------------------------ quests
/** the hotbar skill a quest teaches for this class (slots 4–6 are the class's extra skills) */
export const QUEST_EXTRA: Record<ClassId, [string, string, string]> = {
  ...(CLASS_EXTRA as Record<Exclude<ClassId, 'Berserker'>, [string, string, string]>),
  Berserker: ['b-carnage-cyclone', 'b-execution-frenzy', 'b-whirlwind'],
};
export function questSkill(cls: ClassId, slot: SkillReward): string | null {
  if (slot === 'buff' || slot === 'special') return DEFAULT_HOTBAR[cls][slot];
  return QUEST_EXTRA[cls][+slot.slice(5) - 1] ?? null;
}
export function applyEvents(s: CharState, events: QuestEvent[]): { state: CharState; ready: string[]; progressed: string[] } {
  let quests = s.quests; const ready: string[] = [], progressed: string[] = [];
  for (const e of events) { const r = questEvent(quests, e); if (!r.progressed.length) continue; quests = r.log; ready.push(...r.ready); progressed.push(...r.progressed); }
  return { state: quests === s.quests ? s : { ...s, quests }, ready, progressed };
}
export function acceptQuest(s: CharState, id: string, ctx: Ctx): Result {
  const quests = acceptQ(s.quests, id, ctx.now); if (quests === s.quests) return fail('Quest unavailable');
  return done({ ...s, quests }, [], [{ type: 'level', level: s.player.level }]);
}
export function turnInQuest(s: CharState, id: string, npc: string | null, ctx: Ctx): Result {
  if (!npc) return fail('ต้องคุยกับ NPC ที่รับเควส'); const r = turnInQ(s.quests, id, npc); if (!r) return fail('ยังส่งเควสนี้ไม่ได้');
  let inventory = s.inventory;
  for (const [it, n] of r.rewards.items ?? []) { const next = SHOP_ITEMS.some(x => x.id === it) ? giveShop(inventory, it, n, ctx) : giveTo(inventory, it, n, ctx); if (next) inventory = next; }
  const state: CharState = { ...s, quests: r.log, inventory, player: { ...s.player, gold: s.player.gold + r.rewards.soulGod, exp: s.player.exp + r.rewards.xp } }, log: string[] = [];
  // skills taught by the quest giver: at least level 1, no skill point spent
  for (const slot of r.rewards.skills ?? []) { const sid = questSkill(classOf(s), slot); if (sid && !(state.skillLevels[sid] > 0)) { state.skillLevels = { ...state.skillLevels, [sid]: 1 }; log.push(`เรียนสกิลใหม่จากภารกิจ: ${ctx.skills.defs.find(d => d.id === sid)?.name ?? sid}`); } }
  levelUps(state, ctx, log, [], false);
  return done(state, [`ส่งเควส ${QUEST_BY_ID[id].title} · EXP +${r.rewards.xp} · SoulGod +${r.rewards.soulGod}`, ...log]);
}

// ------------------------------------------------------------------ wardrobe (round 12)
export function wearFashion(s: CharState, id: string, list: FashionItem[] = FASHION): Result {
  const r = wear(s.wardrobe ?? { owned: [], worn: {} }, id, list); if (typeof r === 'string') return fail(r);
  return done({ ...s, wardrobe: r }, [`สวม ${list.find(f => f.id === id)?.th ?? id}`]);
}
export function takeOffFashion(s: CharState, slot: FashionSlot): Result { return done({ ...s, wardrobe: takeOff(s.wardrobe ?? { owned: [], worn: {} }, slot) }); }
/** realm only: fashion bought in the cash shop / from a coupon lands here (never from a client request) */
export function grantFashion(s: CharState, ids: string[]): CharState { let w = s.wardrobe ?? { owned: [], worn: {} }; for (const id of ids) w = grant(w, id); return { ...s, wardrobe: w }; }

// ------------------------------------------------------------------ travel
/** walking through a waygate (free, must stand in its ring) or Gatewarden Orrin's paid travel (fee for fields) */
export function travel(s: CharState, to: CityId, gate: boolean, ctx: Ctx, opts: { checkPosition?: boolean } = {}): Ok & { fee: number } | Fail {
  const from = s.player.cityId ?? 'hollow';
  if (!isCity(to)) return fail('Unknown map'); if (to === from) return fail('Already here');
  if (opts.checkPosition) {
    if (gate) { const p = portalsOf(from).find(q => q.to === to); if (!p || Math.hypot(p.x - s.player.position[0], p.z - s.player.position[1]) > 3.2) return fail('ต้องยืนในวงประตูวาร์ป'); }
    else if (!nearNpc(from, s.player.position, 'travel')) return fail('ต้องคุยกับ Gatewarden Orrin');
  }
  const fee = gate || MAIN_CITIES.includes(to) ? 0 : ctx.config.economy.travelFeePerZone;
  if (s.player.gold < fee) return fail(`ค่าเดินทาง ${fee} SoulGod ไม่พอ`);
  return { ...done({ ...s, drops: [], player: { ...s.player, gold: s.player.gold - fee, cityId: to, position: arrivalPoint(from, to) } }), fee };
}
export const safeHome = (city: CityId | undefined) => homePoint(city ?? 'hollow');
export { nearPortal };

// ------------------------------------------------------------------ fresh characters, import of old saves
/** Round 13: a character saved by the five-class game becomes a Berserker — same level, money, quests and codex. Items are
 *  converted (items.ts migrateClassItem, mirrors SQL migration 0012); a converted off-hand (now a greataxe) leaves the
 *  off-hand slot for the bag, or the ground under the character when the bag is full; skills of the old classes are
 *  dropped (their points return automatically: points come from the level); a Reaver advancement is kept at Lv60+.
 *  Idempotent — a migrated state comes back unchanged (same object). */
/** round 20: the character's own class (old saves without one are Berserkers) */
const classOf = (s: { player: { classId?: unknown } }): ClassId => isClass(s.player.classId) ? s.player.classId : 'Berserker';
export function migrateCharState(s: CharState, lib: SkillLibrary): CharState {
  // round 20: the eight current classes keep their class; only the five retired ones become Berserkers
  const cls: ClassId = CLASS_IDS.includes(s.player.classId as ClassId) ? s.player.classId as ClassId : 'Berserker';
  const known = new Set(lib.defs.filter(d => d.cls === cls).map(d => d.id));
  const oldSkills = Object.keys(s.skillLevels ?? {}).some(id => !known.has(id));
  const promo = validPromotion(cls, s.player.level, s.player.promotionId);
  const touched = (s.player.classId as string) !== cls || promo !== s.player.promotionId || oldSkills || !!s.equipment.offhand
    || [...s.inventory, ...Object.values(s.equipment), ...s.drops.map(d => d.item)].some(i => !!i && migrateClassItem(i) !== i);
  if (!touched) return s;
  const inventory = s.inventory.map(i => migrateClassItem(i));
  const equipment = Object.fromEntries(Object.entries(s.equipment).map(([k, v]) => [k, migrateClassItem(v)])) as CharState['equipment'];
  let drops = s.drops.map(d => ({ ...d, item: migrateClassItem(d.item) }));
  const off = equipment.offhand; equipment.offhand = null;
  if (off) { const free = inventory.indexOf(null); if (free >= 0) inventory[free] = off; else drops = [...drops, { id: `${off.id}-drop`, x: s.player.position[0], z: s.player.position[1], item: off }]; }
  const skillLevels = Object.fromEntries(Object.entries(s.skillLevels ?? {}).filter(([id]) => known.has(id)));
  const fresh = freshSkills(lib, cls);
  const hotbarOk = Object.values(s.hotbar ?? {}).every(id => !id || known.has(id));
  return { ...s, inventory, equipment, drops,
    player: { ...s.player, classId: cls, promotionId: promo },
    skillLevels: Object.keys(skillLevels).length ? { ...fresh.skillLevels, ...skillLevels } : fresh.skillLevels,
    hotbar: hotbarOk && Object.keys(skillLevels).length ? s.hotbar : fresh.hotbar };
}
export function freshCharacter(name: string, cls: ClassId, gender: 'm' | 'f', ctx: Ctx, starter: { player: Player; gear: Item }): CharState {
  const inventory: (Item | null)[] = Array.from({ length: BAG_SIZE }, (_, i) => i === 0 ? { ...starter.gear, id: ctx.uuid() } : null);
  return { player: { ...starter.player, name, classId: cls, gender, cityId: 'hollow', position: homePoint('hollow'), stats: { ...ctx.config.classes[cls].base }, gold: ctx.config.economy.startingSoulGod },
    inventory, equipment: { ...EMPTY_GEAR }, soulShards: 0, ...freshSkills(ctx.skills, cls), buffs: [], starterKits: [], quests: {}, drops: [], codex: {}, wardrobe: { owned: [], worn: {} } };
}
