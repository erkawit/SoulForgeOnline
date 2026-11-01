// Round 11: the codex rules — register loot, the permanent bonus, titles, and the shop's "sell junk" button. Pure
// reducers like the rest of the economy core: the client runs them offline (and to preview), the realm runs them online
// and is the authority (ACT 'codex' / 'sellJunk').
import type { Item } from '@/lib/types';
import type { GameConfig } from '../balance/config';
import { nearNpc } from '../npcs';
import { npcPrice } from '../items';
import { CATEGORY, CODEX_SEAL, CODEX_TIERS, GRAND_TITLE, LOOT, LOOT_BY_ID, STAT_LABEL, TIER_LABEL, codexBonus, isLoot, tierOf, type Codex, type LootCategory } from '../codex';
export { codexBonus, type Codex };
import { countOf, takeFrom, type CharState, type Ctx, type Result } from './core';

/** the largest bonus the codex can ever give (all entries at tier V, after caps) — shown so players see the ceiling */
export const codexMax = (cfg: GameConfig) => codexBonus(Object.fromEntries(LOOT.map(l => [l.id, CODEX_TIERS])), cfg);

/** what the next tier of an entry costs (null when finished) */
export function nextCost(codex: Codex | undefined, id: string, cfg: GameConfig): { tier: number; loot: number; seals: number } | null {
  const t = tierOf(codex, id); if (t >= CODEX_TIERS) return null;
  return { tier: t + 1, loot: cfg.codex.tierCost[t], seals: cfg.codex.sealCost[t] };
}
/** loot still needed to finish an entry (what "sell junk" keeps back) */
export function stillNeeded(codex: Codex | undefined, id: string, cfg: GameConfig) {
  let n = 0; for (let t = tierOf(codex, id); t < CODEX_TIERS; t++) n += cfg.codex.tierCost[t]; return n;
}

/** titles earned: a category's "collector" title at tier III on all its entries, its "master" title at tier V, and the
 *  grand title for the whole codex at tier V. Cosmetic only. */
export function codexTitles(codex: Codex | undefined): string[] {
  const out: string[] = []; if (!codex) return out;
  for (const [cat, info] of Object.entries(CATEGORY) as [LootCategory, typeof CATEGORY[LootCategory]][]) {
    const tiers = LOOT.filter(l => l.category === cat).map(l => tierOf(codex, l.id)), low = Math.min(...tiers);
    if (low >= CODEX_TIERS) out.push(info.master); else if (low >= 3) out.push(info.collector);
  }
  if (LOOT.every(l => tierOf(codex, l.id) >= CODEX_TIERS)) out.unshift(GRAND_TITLE);
  return out;
}
/** how far along a codex is: registered tiers out of all (for the board and the panel) */
export const codexProgress = (codex: Codex | undefined) => ({ tiers: LOOT.reduce((a, l) => a + tierOf(codex, l.id), 0), max: LOOT.length * CODEX_TIERS });

/** register the next tier of one entry: the loot (and seals) leave the bag for good */
export function registerCodex(s: CharState, id: string, ctx: Ctx): Result {
  const cfg = ctx.config; if (!cfg.codex.enabled) return { ok: false, msg: 'สมุดสะสมปิดอยู่ชั่วคราว' };
  const def = LOOT_BY_ID[id]; if (!def) return { ok: false, msg: 'ไม่มีรายการนี้ในสมุด' };
  const cost = nextCost(s.codex, id, cfg); if (!cost) return { ok: false, msg: `${def.th} ลงครบขั้น V แล้ว` };
  const have = countOf(s.inventory, id), seals = countOf(s.inventory, CODEX_SEAL);
  if (have < cost.loot) return { ok: false, msg: `${def.th} ไม่พอ (มี ${have}/${cost.loot})` };
  if (seals < cost.seals) return { ok: false, msg: `ตราสมุดสะสมไม่พอ (มี ${seals}/${cost.seals})` };
  let inventory = takeFrom(s.inventory, id, cost.loot)!; if (cost.seals) inventory = takeFrom(inventory, CODEX_SEAL, cost.seals)!;
  const codex = { ...(s.codex ?? {}), [id]: cost.tier }, before = codexTitles(s.codex), after = codexTitles(codex);
  const gain = cfg.codex.perTier[def.stat] ?? 0, label = STAT_LABEL[def.stat] ?? def.stat;
  const log = [`สมุดสะสม: ${def.th} ขั้น ${TIER_LABEL[cost.tier]} · ${label} +${gain}%`, ...after.filter(t => !before.includes(t)).map(t => `ได้รับฉายา「${t}」`)];
  return { ok: true, state: { ...s, inventory, codex }, log, events: [], msg: log.join(' · ') };
}

export type JunkLine = { index: number; id: string; name: string; qty: number; value: number };
/** what "sell junk" would sell: loot beyond what the codex still needs (seals and everything else are never touched) */
export function junkPlan(s: Pick<CharState, 'inventory' | 'codex'>, cfg: GameConfig): { lines: JunkLine[]; total: number } {
  const keep: Record<string, number> = {}; for (const l of LOOT) keep[l.id] = cfg.codex.enabled ? stillNeeded(s.codex, l.id, cfg) : 0;
  const lines: JunkLine[] = [];
  s.inventory.forEach((it: Item | null, index) => {
    if (!it || !isLoot(it.definitionId)) return; const id = it.definitionId!, q = it.qty ?? 1, held = Math.min(q, keep[id]);
    keep[id] -= held; const sell = q - held; if (sell <= 0) return;
    lines.push({ index, id, name: it.name, qty: sell, value: Math.max(1, Math.round(npcPrice(it) * sell * cfg.economy.npcSellRate)) });
  });
  return { lines, total: lines.reduce((a, l) => a + l.value, 0) };
}
/** sell the junk to Old Jessa (the buyer) in one go */
export function sellJunk(s: CharState, ctx: Ctx): Result {
  if (!nearNpc(s.player.cityId, s.player.position, 'buyer')) return { ok: false, msg: 'ต้องอยู่ใกล้ยายเจสซ่า (รับซื้อไอเทม)' };
  const plan = junkPlan(s, ctx.config); if (!plan.lines.length) return { ok: false, msg: 'ไม่มีของดรอปเกินจากที่สมุดสะสมยังต้องใช้' };
  const inventory = [...s.inventory];
  for (const l of plan.lines) { const it = inventory[l.index]!, left = (it.qty ?? 1) - l.qty; inventory[l.index] = left > 0 ? { ...it, qty: left } : null; }
  const n = plan.lines.reduce((a, l) => a + l.qty, 0), msg = `ขายของดรอป ${n} ชิ้น ได้ ${plan.total.toLocaleString()} SoulGod (เก็บส่วนที่สมุดสะสมยังต้องใช้ไว้)`;
  return { ok: true, state: { ...s, inventory, player: { ...s.player, gold: s.player.gold + plan.total } }, log: [msg], events: [], msg };
}
