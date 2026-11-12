// Round 25: game events the chat's system tab and the per-character history (Supabase loot_history / combat_log) need,
// published by the store without the store knowing who listens.
import type { Item, Loot } from '@/lib/types';

/** the character playing now: an account character row (player_characters.id), or null for guest / legacy play */
export type ActiveCharacter = { id: string; userId: string; name: string };
let active: ActiveCharacter | null = null;
export const setActiveCharacter = (c: ActiveCharacter | null) => { active = c; };
export const activeCharacter = () => active;

export type LootEvent = { item: Item; qty: number; monster?: string; city?: string; at: number };
const lootSubs = new Set<(e: LootEvent) => void>();
export const onLoot = (fn: (e: LootEvent) => void) => { lootSubs.add(fn); return () => { lootSubs.delete(fn); }; };
export const emitLoot = (e: LootEvent) => { for (const fn of lootSubs) { try { fn(e); } catch { /* a listener must not break a kill */ } } };

/** what a kill gave: new ground drops, plus items that went straight into the bag (new stacks or a bigger stack) */
export function lootDiff(before: { drops: Loot[]; inventory: (Item | null)[] }, after: { drops: Loot[]; inventory: (Item | null)[] }): { item: Item; qty: number }[] {
  const out: { item: Item; qty: number }[] = [];
  const had = new Set(before.drops.map(d => d.id));
  for (const d of after.drops) if (!had.has(d.id)) out.push({ item: d.item, qty: Math.max(1, d.item.qty ?? 1) });
  if (after.inventory !== before.inventory) {
    const old = new Map<string, number>();
    for (const it of before.inventory) if (it) old.set(it.id, (old.get(it.id) ?? 0) + Math.max(1, it.qty ?? 1));
    for (const it of after.inventory) {
      if (!it) continue; const q = Math.max(1, it.qty ?? 1), was = old.get(it.id) ?? 0;
      if (q > was) out.push({ item: it, qty: q - was });
      old.set(it.id, Math.max(0, was - q));
    }
  }
  return out;
}
