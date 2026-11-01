// Round 10: where the realm keeps the player market, the mailbox and the economy's daily numbers.
// Every write that touches a character goes through ONE transaction together with its market / mail row, guarded by
// the character's revision (the same `rev` the character saves use): Supabase does it in the realm_* SQL functions
// (supabase/migrations/202610250010_realm_market.sql), the in-memory version below does the same checks for tests and
// local runs. The caller (index.ts) always flushes the character first, so `rev` is the stored revision.
import type { CharState } from '@/game/economy/core';
import type { Listing, Mail, ListInfo } from '@/game/economy/market';
import type { SupplyDay } from '@/game/balance/market';
import type { Rarity } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';
import { MemoryRepo, RevisionConflict } from './characters.js';
import { ITEM_BY_ID, makeItem } from '@/game/items';

/** coupon rows carry {definitionId, qty}; the realm makes the real item here (unknown ids are dropped) */
function hydrate(item: unknown): Mail['item'] {
  if (!item || typeof item !== 'object') return null; const it = item as { id?: unknown; definitionId?: unknown; qty?: unknown };
  if (typeof it.id === 'string') return item as Mail['item'];
  if (typeof it.definitionId !== 'string' || !ITEM_BY_ID[it.definitionId]) return null;
  const made = makeItem(it.definitionId), q = Math.max(1, Math.min(999, Math.floor(Number(it.qty) || 1))); return made.slot ? made : { ...made, qty: q };
}
export type Browse = { text?: string; rarity?: Rarity | ''; page: number };
export const PAGE = 40;
export interface MarketRepo {
  listInfo(user: string, def: string, enhance: number, now: number): Promise<ListInfo>;
  get(id: string): Promise<Listing | null>;
  browse(q: Browse, now: number): Promise<Listing[]>;
  mine(user: string): Promise<Listing[]>;
  mail(user: string): Promise<Mail[]>;
  /** each resolves to the character's new revision; RevisionConflict when `rev` is stale, Error(message) when refused */
  list(user: string, rev: number, state: CharState, l: Listing): Promise<number>;
  buy(user: string, rev: number, state: CharState, listingId: string, price: number, sellerGets: number, burned: number, now: number): Promise<number>;
  cancel(user: string, rev: number, state: CharState, listingId: string): Promise<number>;
  claim(user: string, rev: number, state: CharState, mailIds: string[]): Promise<number>;
  /** listings past their time: closed, items mailed back to their sellers; returns the sellers to notify */
  expire(now: number): Promise<string[]>;
  /** mail from the realm itself (boss rewards that did not fit, admin grants) — no character write */
  send(user: string, m: Omit<Mail, 'id' | 'createdAt'>): Promise<void>;
  /** SoulGod in circulation (characters + unclaimed mail), stored as today's figure; returns the last 8 days */
  supplyDay(day: string, tax: number): Promise<SupplyDay[]>;
  /** the live market tax and the Thai day it was last adjusted */
  getTax(): Promise<{ rate: number; day: string | null } | null>;
  setTax(rate: number, growth: number | null, day: string): Promise<void>;
}

/** in-memory market sharing the in-memory characters (tests, REALM_MEMORY=1) */
export class MemoryMarket implements MarketRepo {
  listings = new Map<string, Listing & { buyer?: string; closedAt?: number }>(); mails = new Map<string, Mail & { user: string; claimedAt?: number }>();
  cancels: { user: string; at: number }[] = []; days = new Map<string, number>(); tax: { rate: number; day: string | null } | null = null; burned = 0;
  constructor(private chars: MemoryRepo) {}
  private write(user: string, rev: number, state: CharState) { const cur = this.chars.rows.get(user); if ((cur?.rev ?? 0) !== rev) throw new RevisionConflict(user); this.chars.rows.set(user, { state: structuredClone(state), rev: rev + 1 }); return rev + 1; }
  async listInfo(user: string, def: string, enhance: number, now: number): Promise<ListInfo> {
    const sold = [...this.listings.values()].filter(l => l.status === 'sold' && l.definitionId === def && l.enhance === enhance && (l.closedAt ?? 0) > now - 7 * 86_400_000).map(l => l.price).sort((a, b) => a - b);
    return { active: [...this.listings.values()].filter(l => l.seller === user && l.status === 'active').length, median: sold.length ? sold[Math.floor(sold.length / 2)] : null,
      cancelsLastHour: this.cancels.filter(c => c.user === user && c.at > now - 3_600_000).length };
  }
  async get(id: string) { const l = this.listings.get(id); return l ? structuredClone(l) : null; }
  async browse(q: Browse, now: number) { const t = (q.text ?? '').toLowerCase();
    return [...this.listings.values()].filter(l => l.status === 'active' && l.expiresAt > now && (!q.rarity || l.rarity === q.rarity) && (!t || l.item.name.toLowerCase().includes(t)))
      .sort((a, b) => b.createdAt - a.createdAt).slice(q.page * PAGE, q.page * PAGE + PAGE).map(l => structuredClone(l)); }
  async mine(user: string) { return [...this.listings.values()].filter(l => l.seller === user && l.status === 'active').map(l => structuredClone(l)); }
  async mail(user: string) { return [...this.mails.values()].filter(m => m.user === user && !m.claimedAt).sort((a, b) => a.createdAt - b.createdAt).map(({ user: _u, claimedAt: _c, ...m }) => structuredClone(m)); }
  async list(user: string, rev: number, state: CharState, l: Listing) {
    if ([...this.listings.values()].some(x => x.item.id === l.item.id && x.status === 'active')) throw new Error('item already listed');
    const r = this.write(user, rev, state); this.listings.set(l.id, structuredClone(l)); this.burned += l.fee; return r;
  }
  async buy(user: string, rev: number, state: CharState, id: string, price: number, sellerGets: number, burned: number, now: number) {
    const l = this.listings.get(id); if (!l || l.status !== 'active' || l.expiresAt <= now || l.price !== price) throw new Error('รายการนี้ปิดไปแล้ว'); if (l.seller === user) throw new Error('ซื้อรายการของตัวเองไม่ได้');
    const r = this.write(user, rev, state); l.status = 'sold'; l.buyer = user; l.closedAt = now; this.burned += burned;
    await this.send(l.seller, { kind: 'sale', gold: sellerGets, item: null, note: `ขาย ${l.item.name} ได้ ${price.toLocaleString()} SG (ภาษี ${burned.toLocaleString()})` }); return r;
  }
  async cancel(user: string, rev: number, state: CharState, id: string) {
    const l = this.listings.get(id); if (!l || l.status !== 'active' || l.seller !== user) throw new Error('รายการนี้ปิดไปแล้ว');
    const r = this.write(user, rev, state); l.status = 'cancelled'; l.closedAt = Date.now(); this.cancels.push({ user, at: Date.now() }); return r;
  }
  async claim(user: string, rev: number, state: CharState, ids: string[]) {
    for (const id of ids) { const m = this.mails.get(id); if (!m || m.user !== user || m.claimedAt) throw new Error('จดหมายถูกรับไปแล้ว'); }
    const r = this.write(user, rev, state); for (const id of ids) this.mails.get(id)!.claimedAt = Date.now(); return r;
  }
  async expire(now: number) { const out: string[] = [];
    for (const l of this.listings.values()) if (l.status === 'active' && l.expiresAt <= now) { l.status = 'expired'; l.closedAt = now; out.push(l.seller); await this.send(l.seller, { kind: 'return', gold: 0, item: l.item, note: `${l.item.name} หมดเวลาขาย ส่งคืน` }); }
    return out; }
  async send(user: string, m: Omit<Mail, 'id' | 'createdAt'>) { const id = crypto.randomUUID(); this.mails.set(id, { ...structuredClone(m), id, createdAt: Date.now(), user }); }
  async supplyDay(day: string, _tax: number) {
    let supply = 0; for (const r of this.chars.rows.values()) supply += r.state.player.gold;
    for (const m of this.mails.values()) if (!m.claimedAt) supply += m.gold;
    this.days.set(day, supply); return [...this.days].sort((a, b) => a[0].localeCompare(b[0])).slice(-8).map(([d, s]) => ({ day: d, supply: s }));
  }
  async getTax() { return this.tax; }
  async setTax(rate: number, _growth: number | null, day: string) { this.tax = { rate, day }; }
}

type Row = { id: string; seller_id: string; seller_name: string; item: Listing['item']; definition_id: string; rarity: Rarity; enhance: number; qty: number; price: number; fee: number; status: Listing['status']; created_at: string; expires_at: string };
const fromRow = (r: Row): Listing => ({ id: r.id, seller: r.seller_id, sellerName: r.seller_name, item: r.item, definitionId: r.definition_id, rarity: r.rarity, enhance: r.enhance, qty: r.qty, price: Number(r.price), fee: Number(r.fee), status: r.status, createdAt: Date.parse(r.created_at), expiresAt: Date.parse(r.expires_at) });
/** refusals from the SQL functions: "revision conflict" is a stale character, anything else a rule the player broke */
function rpcError(user: string, e: { message: string }): never { if (/revision conflict/i.test(e.message)) throw new RevisionConflict(user); throw new Error(e.message); }

export class SupabaseMarket implements MarketRepo {
  constructor(private db: SupabaseClient) {}
  async listInfo(user: string, def: string, enhance: number) {
    const { data, error } = await this.db.rpc('realm_list_info', { p_user: user, p_def: def, p_enhance: enhance }); if (error) throw new Error(error.message);
    const d = data as { active: number; median: number | null; cancels: number }; return { active: Number(d.active), median: d.median === null ? null : Number(d.median), cancelsLastHour: Number(d.cancels) };
  }
  async get(id: string) { const { data, error } = await this.db.from('realm_listings').select('*').eq('id', id).maybeSingle(); if (error) throw new Error(error.message); return data ? fromRow(data as Row) : null; }
  async browse(q: Browse) {
    let req = this.db.from('realm_listings').select('*').eq('status', 'active').gt('expires_at', new Date().toISOString());
    if (q.rarity) req = req.eq('rarity', q.rarity); if (q.text) req = req.ilike('item->>name', `%${q.text.replace(/[%_\\]/g, '')}%`);
    const { data, error } = await req.order('created_at', { ascending: false }).range(q.page * PAGE, q.page * PAGE + PAGE - 1); if (error) throw new Error(error.message);
    return (data as Row[]).map(fromRow);
  }
  async mine(user: string) { const { data, error } = await this.db.from('realm_listings').select('*').eq('seller_id', user).eq('status', 'active'); if (error) throw new Error(error.message); return (data as Row[]).map(fromRow); }
  async mail(user: string) {
    const { data, error } = await this.db.from('realm_mail').select('id,kind,gold,item,note,fashion,created_at').eq('user_id', user).is('claimed_at', null).order('created_at').limit(100); if (error) throw new Error(error.message);
    return (data as { id: string; kind: Mail['kind']; gold: number; item: Mail['item']; note: string; fashion: string | null; created_at: string }[]).map(m => ({ id: m.id, kind: m.kind, gold: Number(m.gold), item: hydrate(m.item), note: m.note, fashion: m.fashion, createdAt: Date.parse(m.created_at) }));
  }
  async list(user: string, rev: number, state: CharState, l: Listing) {
    const { data, error } = await this.db.rpc('realm_market_list', { p_user: user, p_rev: rev, p_state: state, p_listing: { id: l.id, seller_name: l.sellerName, item: l.item, definition_id: l.definitionId, rarity: l.rarity, enhance: l.enhance, qty: l.qty, price: l.price, fee: l.fee, expires_at: new Date(l.expiresAt).toISOString() } });
    if (error) rpcError(user, error); return Number(data);
  }
  async buy(user: string, rev: number, state: CharState, id: string, price: number, sellerGets: number, burned: number) {
    const { data, error } = await this.db.rpc('realm_market_buy', { p_user: user, p_rev: rev, p_state: state, p_listing: id, p_price: price, p_seller_gets: sellerGets, p_burned: burned });
    if (error) rpcError(user, error); return Number(data);
  }
  async cancel(user: string, rev: number, state: CharState, id: string) { const { data, error } = await this.db.rpc('realm_market_cancel', { p_user: user, p_rev: rev, p_state: state, p_listing: id }); if (error) rpcError(user, error); return Number(data); }
  async claim(user: string, rev: number, state: CharState, ids: string[]) { const { data, error } = await this.db.rpc('realm_mail_claim', { p_user: user, p_rev: rev, p_state: state, p_ids: ids }); if (error) rpcError(user, error); return Number(data); }
  async expire() { const { data, error } = await this.db.rpc('realm_market_expire'); if (error) throw new Error(error.message); return ((data ?? []) as string[]); }
  async send(user: string, m: Omit<Mail, 'id' | 'createdAt'>) { const { error } = await this.db.from('realm_mail').insert({ user_id: user, kind: m.kind, gold: m.gold, item: m.item, note: m.note, fashion: m.fashion ?? null }); if (error) throw new Error(error.message); }
  async supplyDay(day: string, tax: number) {
    const { data, error } = await this.db.rpc('realm_supply_day', { p_day: day, p_tax: tax }); if (error) throw new Error(error.message);
    return ((data ?? []) as { o_day: string; o_supply: number }[]).map(d => ({ day: String(d.o_day), supply: Number(d.o_supply) })).sort((a, b) => a.day.localeCompare(b.day));
  }
  async getTax() { const { data } = await this.db.from('economy_state').select('value').eq('key', 'market_tax').maybeSingle(); const v = data?.value as { rate?: number; day?: string } | null;
    return v && Number.isFinite(Number(v.rate)) ? { rate: Number(v.rate), day: typeof v.day === 'string' ? v.day : null } : null; }
  async setTax(rate: number, growth: number | null, day: string) { const { error } = await this.db.from('economy_state').upsert({ key: 'market_tax', value: { rate, growth, day }, updated_at: new Date().toISOString() }); if (error) throw new Error(error.message); }
}
