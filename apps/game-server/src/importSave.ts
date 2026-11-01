// One-time import of a round-8 cloud save into a realm character. Those saves were written by the browser, so nothing
// in them is trusted: every value is clamped, every item is rebuilt from the item catalog (fresh options, enhancement
// capped at the safe level), skills must fit the character's skill points. IMPORT_MODE=fresh skips the import.
import * as eco from '@/game/economy/core';
import { ITEM_BY_ID, makeGear, migrateDefId } from '@/game/items';
import { SHOP_ITEMS } from '@/game/npcs';
import { CLASS_IDS, isCity, isClass, safePosition, type ClassId } from '@/game/content';
import { validPromotion } from '@/game/advancement';
import { freePoints, skillPointsAt } from '@/game/skills/engine';
import { QUEST_BY_ID, type QuestLog } from '@/game/quests';
import type { GearSlot, Item, Player } from '@/lib/types';

export type ImportOpts = { mode: 'sanitize' | 'fresh'; goldCap: number };
export type Profile = { name: string; cls: ClassId; gender: 'm' | 'f' };
const int = (v: unknown, lo: number, hi: number, dflt: number) => typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, Math.floor(v))) : dflt;
const STACK_CAP: Record<string, number> = { material: 999, consumable: 999, crystal: 2 };

/** an item from an untrusted save, rebuilt from the catalog, or null when it is not a real item */
export function rebuildItem(raw: unknown, cls: ClassId, ctx: eco.Ctx): Item | null {
  if (!raw || typeof raw !== 'object') return null;
  // round 13: items of the five retired classes come back as their Berserker counterparts (same tier)
  const it = raw as Partial<Item>, defId = typeof it.definitionId === 'string' ? migrateDefId(it.definitionId) : '';
  const shop = SHOP_ITEMS.find(s => s.id === defId);
  if (shop) return { id: ctx.uuid(), definitionId: defId, name: shop.name, rarity: 'Common', slot: null, family: 'consumable', bonuses: {}, description: shop.th, npcValue: Math.max(1, Math.floor(shop.price / 4)), qty: int(it.qty, 1, 999, 1) };
  const d = ITEM_BY_ID[defId]; if (!d) return null;
  if (!d.slot) { const fam = d.family ?? ''; return { ...eco.newItem(defId, ctx), ...(fam in STACK_CAP ? { qty: int(it.qty, 1, STACK_CAP[fam], 1) } : {}) }; }
  if (d.slot === 'costume') return eco.newItem(defId, ctx);
  const lock = isClass(it.classLock) ? it.classLock : cls, g = { ...makeGear(defId, lock, ctx.rng), id: ctx.uuid() };
  const enhance = int(it.enhance, 0, ctx.config.enhance.safeLevel, 0), base = g.name.replace(/^\+\d+ /, '');
  return { ...g, enhance, name: enhance ? `+${enhance} ${base}` : base };
}

export function importLegacy(raw: unknown, profile: Profile, ctx: eco.Ctx, starter: { player: Player; gear: Item }, opts: ImportOpts): { state: eco.CharState; notes: string[] } {
  const fresh = eco.freshCharacter(profile.name, profile.cls, profile.gender, ctx, starter), notes: string[] = [];
  if (opts.mode === 'fresh' || !raw || typeof raw !== 'object') return { state: fresh, notes: [raw ? 'import skipped (fresh mode)' : 'no previous save'] };
  const snap = raw as Record<string, any>, p = snap.player && typeof snap.player === 'object' ? snap.player : null;
  if (snap.version !== 1 || !p) return { state: fresh, notes: ['previous save unreadable'] };
  const cls = profile.cls, s: eco.CharState = structuredClone(fresh);
  s.player.level = int(p.level, 1, 100, 1); s.player.exp = int(p.exp, 0, eco.expRequired(s.player.level) - 1, 0);
  const gold = int(p.gold, 0, Number.MAX_SAFE_INTEGER, 0); s.player.gold = Math.min(gold, opts.goldCap); if (gold > opts.goldCap) notes.push(`gold capped ${gold} → ${opts.goldCap}`);
  s.soulShards = int(snap.soulShards, 0, 999, 0);
  if (Array.isArray(snap.inventory)) { const inv = snap.inventory.slice(0, eco.BAG_SIZE).map((x: unknown) => rebuildItem(x, cls, ctx)); while (inv.length < eco.BAG_SIZE) inv.push(null); s.inventory = inv;
    const lost = snap.inventory.filter(Boolean).length - inv.filter(Boolean).length; if (lost > 0) notes.push(`${lost} unknown bag items dropped`); }
  if (snap.equipment && typeof snap.equipment === 'object') for (const slot of Object.keys(s.equipment) as GearSlot[]) {
    const it = rebuildItem(snap.equipment[slot], cls, ctx); s.equipment[slot] = it && it.slot === slot ? it : null;
    // an old off-hand is a greataxe now: it goes to the bag instead of the (two-handed) off-hand slot
    if (slot === 'offhand' && it && it.slot === 'weapon') { const free = s.inventory.indexOf(null); if (free >= 0) s.inventory[free] = it; } }
  // skills: only this class's, within max level, within the points the level gives
  const lib = ctx.skills, levels: Record<string, number> = {};
  for (const [id, l] of Object.entries(snap.skills?.levels ?? {})) { const def = lib.defs.find(d => d.id === id); if (def?.cls === cls) levels[id] = int(l, 0, def.maxLevel, 0); }
  for (const k of Object.keys(levels)) if (!levels[k]) delete levels[k];
  const spent = Object.values(levels).reduce((a, b) => a + b, 0);
  if (spent && spent <= skillPointsAt(s.player.level) + freePoints(lib, cls)) s.skillLevels = { ...eco.freshSkills(lib, cls).skillLevels, ...levels };
  else if (Object.keys(levels).length) notes.push('skill tree reset (did not fit the level)');
  for (const slot of Object.keys(s.hotbar) as (keyof typeof s.hotbar)[]) { const id = snap.skills?.hotbar?.[slot]; if (typeof id === 'string') { const r = eco.setHotbar(s, slot, id, ctx); if (r.ok) s.hotbar = r.state.hotbar; } }
  // quests: known ids only (done quests stay done, their rewards were already paid)
  const quests: QuestLog = {};
  if (snap.quests && typeof snap.quests === 'object') for (const [id, q] of Object.entries(snap.quests as Record<string, any>)) {
    const def = QUEST_BY_ID[id]; if (!def || !q || !['active', 'ready', 'done'].includes(q.status)) continue;
    quests[id] = { id, status: q.status, progress: def.objectives.map((_, i) => int(q.progress?.[i], 0, 1e6, 0)), acceptedAt: int(q.acceptedAt, 0, ctx.now, ctx.now) };
  }
  s.quests = quests;
  s.starterKits = Array.isArray(snap.starterKits) ? snap.starterKits.filter((x: unknown) => CLASS_IDS.includes(x as ClassId)) : [];
  s.player.promotionId = validPromotion(cls, s.player.level, p.promotionId);
  const city = isCity(p.cityId) ? p.cityId : 'hollow'; s.player.cityId = city; s.player.position = safePosition(city, p.position);
  s.player.hp = 1; s.player.mp = 0; // filled to the maximum on login
  return { state: s, notes };
}
