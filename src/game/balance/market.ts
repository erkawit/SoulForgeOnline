// Player market rules: a price floor per rarity (no ceiling), fees and tax that burn SoulGod, and anti-pump limits.
// Mirrored by SQL `market_min_price` / `market_list` / `market_buy` (authoritative).
import { DEFAULT_CONFIG, type GameConfig, type RarityKey } from './config';

/** Minimum listing price. Rises with enhancement and, once an item trades, with half its 7-day median sale price. */
export function marketFloor(rarity: RarityKey, enhance = 0, medianPrice7d: number | null = null, cfg: GameConfig = DEFAULT_CONFIG) {
  const m = cfg.market, base = Math.round(m.floor[rarity] * (1 + m.floorPerEnhance * enhance));
  return Math.max(base, medianPrice7d ? Math.round(medianPrice7d * m.medianFloorRatio) : 0);
}
export function listingFee(price: number, cfg: GameConfig = DEFAULT_CONFIG) {
  return Math.max(cfg.market.listingFeeMin, Math.round(price * cfg.market.listingFeePct));
}
/** What the seller receives; the tax is burned (removed from the economy). `taxRate` is the live rate (inflation control). */
export function saleSplit(price: number, cfg: GameConfig = DEFAULT_CONFIG, taxRate = cfg.market.salesTaxPct) {
  const tax = Math.round(price * taxRate); return { seller: price - tax, burned: tax };
}
/** One day of the SoulGod supply (all characters + unclaimed mail + market escrow is item-only, so not counted). */
export type SupplyDay = { day: string; supply: number };
/** Inflation control, run once a day by the realm. Compares the supply now with 7 days ago (scaled to a week when the
 *  history is shorter, needs ≥ 3 days) and steps the market tax toward the target weekly growth: faster growth → higher
 *  tax, shrinking supply → lower. The step is proportional to the miss and capped at maxDailyStep; the result stays in
 *  [taxMin, taxMax]. Returns the current rate unchanged when the control is off or there is not enough history. */
export function nextTax(current: number, history: SupplyDay[], cfg: GameConfig = DEFAULT_CONFIG): { rate: number; growth: number | null } {
  const m = cfg.market, clamp = (r: number) => Math.min(m.taxMax, Math.max(m.taxMin, r));
  const days = [...history].sort((a, b) => a.day.localeCompare(b.day)).filter(d => Number.isFinite(d.supply) && d.supply > 0);
  if (!m.inflation.enabled || days.length < 3) return { rate: clamp(current), growth: null };
  const last = days[days.length - 1], ref = days[Math.max(0, days.length - 8)];
  const span = Math.max(1, Math.round((Date.parse(last.day) - Date.parse(ref.day)) / 86_400_000));
  const growth = Math.pow(last.supply / ref.supply, 7 / span) - 1, miss = growth - m.inflation.targetWeeklyGrowth;
  const step = Math.max(-m.inflation.maxDailyStep, Math.min(m.inflation.maxDailyStep, miss * 0.25));
  return { rate: +clamp(current + step).toFixed(4), growth };
}
export function validateListing(price: number, rarity: RarityKey, enhance: number, median: number | null, activeListings: number, cfg: GameConfig = DEFAULT_CONFIG): string | null {
  if (!Number.isInteger(price) || price < 1) return 'ราคาต้องเป็นจำนวนเต็มบวก';
  const floor = marketFloor(rarity, enhance, median, cfg);
  if (price < floor) return `ราคาต่ำกว่าขั้นต่ำของตลาด (${floor.toLocaleString()} SoulGod)`;
  if (activeListings >= cfg.market.maxActiveListings) return `ลงขายได้สูงสุด ${cfg.market.maxActiveListings} รายการพร้อมกัน`;
  return null;
}
