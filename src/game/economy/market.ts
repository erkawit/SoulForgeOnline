// Round 10: the player market and the mailbox as pure reducers over a character (src/game/economy/core.ts CharState).
// The realm runs them with the live config and commits each result together with the market row in ONE database
// transaction (supabase/migrations/202610250010_realm_market.sql), so an item is either in a bag, in the market, or in
// someone's mail — never in two places and never lost. The client never applies these itself; it waits for the realm.
//
// Rules (adapted from what works in other browser MMOs, tuned for SoulForge):
//   · listing fee (market.listingFeePct, min listingFeeMin) is paid up front and never refunded — it is burned
//   · sales tax (the live rate, see balance/market.ts nextTax) is burned from the price; the seller gets the rest by mail
//   · a price floor per rarity / enhancement / 7-day median (marketFloor) stops dumping and value-moving between alts
//   · you cannot buy your own listing; at most maxActiveListings at once; at most cancelsPerHour cancels an hour
//   · equipped gear must be taken off first; a listing lives listingHours, then the item comes back by mail
import type { Item, Rarity } from '@/lib/types';
import { listingFee, marketFloor, saleSplit } from '../balance/market';
import type { RarityKey } from '../balance/config';
import type { CharState, Ctx, Fail, Ok } from './core';

export type Listing = {
  id: string; seller: string; sellerName: string; item: Item; definitionId: string; rarity: Rarity; enhance: number; qty: number;
  price: number; fee: number; createdAt: number; expiresAt: number; status: 'active' | 'sold' | 'cancelled' | 'expired';
};
import { FASHION, grant } from '../fashion';
export type Mail = { id: string; kind: 'sale' | 'return' | 'boss' | 'admin' | 'shop' | 'coupon'; gold: number; item: Item | null; note: string; createdAt: number;
  /** round 12: a wardrobe piece (cash shop order or coupon) — lands in the wardrobe, takes no bag slot */ fashion?: string | null };
/** what the realm knows about the seller's market activity when they list (from the database) */
export type ListInfo = { active: number; median: number | null; cancelsLastHour: number };

const STACKS = ['consumable', 'material', 'crystal'];
const fail = (msg: string): Fail => ({ ok: false, msg });
const ok = (state: CharState, log: string[] = []): Ok => ({ ok: true, state, log, events: [] });
const sg = (n: number) => `${Math.round(n).toLocaleString()} SoulGod`;

/** put an item into a bag: stackables join a stack of the same kind, anything else takes a free slot (null = bag full) */
export function placeItem(inv: (Item | null)[], item: Item): (Item | null)[] | null {
  const out = [...inv];
  if (STACKS.includes(item.family ?? '')) {
    const at = out.findIndex(i => i?.definitionId === item.definitionId && STACKS.includes(i?.family ?? ''));
    if (at >= 0) { out[at] = { ...out[at]!, qty: (out[at]!.qty ?? 1) + (item.qty ?? 1) }; return out; }
  }
  const free = out.indexOf(null); if (free < 0) return null; out[free] = item; return out;
}
const rarityKey = (r: Rarity) => r as RarityKey;

/** list a whole bag slot for `price`: pays the fee, the item leaves the bag into the listing */
export function prepareList(s: CharState, itemId: string, price: number, info: ListInfo, ctx: Ctx, seller: { id: string; name: string }): (Ok & { listing: Listing }) | Fail {
  const m = ctx.config.market;
  if (!Number.isSafeInteger(price) || price < 1 || price > 1e12) return fail('ราคาต้องเป็นจำนวนเต็ม 1 – 1,000,000,000,000');
  const index = s.inventory.findIndex(i => i?.id === itemId); if (index < 0) return fail('ไม่พบไอเทมในกระเป๋า (ของที่สวมอยู่ต้องถอดก่อน)');
  const item = s.inventory[index]!;
  if (info.active >= m.maxActiveListings) return fail(`ลงขายได้พร้อมกันสูงสุด ${m.maxActiveListings} รายการ`);
  const floor = marketFloor(rarityKey(item.rarity), item.enhance ?? 0, info.median, ctx.config);
  if (price < floor) return fail(`ราคาต่ำกว่าขั้นต่ำของตลาด (${sg(floor)})`);
  const fee = listingFee(price, ctx.config);
  if (s.player.gold < fee) return fail(`ค่าลงขาย ${sg(fee)} ไม่พอ`);
  const inventory = [...s.inventory]; inventory[index] = null;
  const listing: Listing = { id: ctx.uuid(), seller: seller.id, sellerName: seller.name, item, definitionId: item.definitionId ?? '', rarity: item.rarity, enhance: item.enhance ?? 0, qty: item.qty ?? 1,
    price, fee, createdAt: ctx.now, expiresAt: ctx.now + m.listingHours * 3_600_000, status: 'active' };
  return { ...ok({ ...s, inventory, player: { ...s.player, gold: s.player.gold - fee } }, [`ลงขาย ${item.name}${listing.qty > 1 ? ` ×${listing.qty}` : ''} ราคา ${sg(price)} (ค่าลงขาย −${sg(fee)} ไม่คืน)`]), listing };
}

/** buy a listing: the price leaves the buyer, the item joins the bag; the seller's share (price − burned tax) goes by mail */
export function prepareBuy(s: CharState, l: Listing, buyer: string, taxRate: number, ctx: Ctx): (Ok & { seller: number; burned: number }) | Fail {
  if (l.status !== 'active' || l.expiresAt <= ctx.now) return fail('รายการนี้ปิดไปแล้ว');
  if (l.seller === buyer) return fail('ซื้อรายการของตัวเองไม่ได้');
  if (s.player.gold < l.price) return fail(`SoulGod ไม่พอ (ต้องใช้ ${sg(l.price)})`);
  const inventory = placeItem(s.inventory, l.item); if (!inventory) return fail('กระเป๋าเต็ม');
  const split = saleSplit(l.price, ctx.config, taxRate);
  return { ...ok({ ...s, inventory, player: { ...s.player, gold: s.player.gold - l.price } }, [`ซื้อ ${l.item.name}${l.qty > 1 ? ` ×${l.qty}` : ''} (−${sg(l.price)})`]), seller: split.seller, burned: split.burned };
}

/** take a listing back: the item returns to the bag, the fee does not */
export function prepareCancel(s: CharState, l: Listing, user: string, cancelsLastHour: number, ctx: Ctx): Ok | Fail {
  if (l.seller !== user) return fail('ไม่ใช่รายการของคุณ');
  if (l.status !== 'active') return fail('รายการนี้ปิดไปแล้ว');
  if (cancelsLastHour >= ctx.config.market.cancelsPerHour) return fail(`ยกเลิกได้ไม่เกิน ${ctx.config.market.cancelsPerHour} ครั้งต่อชั่วโมง`);
  const inventory = placeItem(s.inventory, l.item); if (!inventory) return fail('กระเป๋าเต็ม');
  return ok({ ...s, inventory }, [`ถอน ${l.item.name} ออกจากตลาด (ค่าลงขายไม่คืน)`]);
}

/** claim mail: all the SoulGod, and the items that fit (the rest stays in the mailbox) */
export function prepareClaim(s: CharState, mails: Mail[]): (Ok & { claimed: string[] }) | Fail {
  let inventory = s.inventory, gold = s.player.gold, wardrobe = s.wardrobe ?? { owned: [], worn: {} }; const claimed: string[] = [], log: string[] = [];
  for (const m of mails) {
    if (m.item) { const next = placeItem(inventory, m.item); if (!next) continue; inventory = next; }
    // built-in or back-office ids (fashion_items); the row was written by the service role only
    if (m.fashion && /^[a-z0-9-]{3,48}$/.test(m.fashion)) { wardrobe = grant(wardrobe, m.fashion); log.push(`ได้รับแฟชั่นเข้าตู้เสื้อผ้า: ${FASHION.find(f => f.id === m.fashion)?.th ?? m.fashion}`); }
    gold += Math.max(0, Math.floor(m.gold)); claimed.push(m.id);
    if (m.item || m.gold > 0) log.push(m.item ? `รับ ${m.item.name}${(m.item.qty ?? 1) > 1 ? ` ×${m.item.qty}` : ''} จากจดหมาย` : `รับ ${sg(m.gold)} จากจดหมาย`);
  }
  if (!claimed.length) return fail(mails.length ? 'กระเป๋าเต็ม — เคลียร์ช่องก่อนรับของ' : 'ไม่มีจดหมาย');
  return { ...ok({ ...s, inventory, wardrobe, player: { ...s.player, gold } }, log), claimed };
}
