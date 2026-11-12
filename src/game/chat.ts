// Round 25: in-game chat (near · world · party · guild · whisper · system) and the per-character history.
//   · near / world / whisper go through Supabase (public.chat_messages, realtime) for account characters
//   · system lines are local: item drops, damage dealt, damage taken, the game log
//   · every account character's drops are written to public.loot_history (kept forever) and its damage to
//     public.combat_log (the server keeps only the last 5 minutes), in small batches
// Guests play offline: their chat stays on this screen and nothing is written to the database.
import { create } from 'zustand';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabase';
import { useGameStore } from '@/store/useGameStore';
import { activeCharacter, onLoot } from './eventLog';

export type ChatChannel = 'near' | 'world' | 'party' | 'guild' | 'whisper' | 'system';
export const CHAT_TABS: { id: ChatChannel; label: string }[] = [
  { id: 'near', label: 'ใกล้' }, { id: 'world', label: 'โลก' }, { id: 'party', label: 'ปาร์ตี้' },
  { id: 'guild', label: 'กิลด์' }, { id: 'whisper', label: 'กระซิบ' }, { id: 'system', label: 'ระบบ' }];
export type LineKind = 'chat' | 'loot' | 'dealt' | 'taken' | 'info' | 'error';
export type ChatLine = { key: string; ch: ChatChannel; kind: LineKind; text: string; from?: string; to?: string; mine?: boolean; rarity?: string; at: number };

const MAX_LINES = 160;
let n = 0;
type ChatState = {
  lines: Record<ChatChannel, ChatLine[]>;
  unread: Record<ChatChannel, number>;
  tab: ChatChannel;
  whisperTo: string;
  open: boolean;
  setTab: (t: ChatChannel) => void;
  setOpen: (v: boolean) => void;
  setWhisperTo: (name: string) => void;
  add: (l: Omit<ChatLine, 'key' | 'at'> & { at?: number; key?: string }) => void;
};
const empty = <T,>(v: () => T) => ({ near: v(), world: v(), party: v(), guild: v(), whisper: v(), system: v() });
export const useChatStore = create<ChatState>((set, get) => ({
  lines: empty<ChatLine[]>(() => []), unread: empty(() => 0), tab: 'near', whisperTo: '', open: false,
  setTab: tab => set(s => ({ tab, unread: { ...s.unread, [tab]: 0 } })),
  setOpen: open => set(s => ({ open, unread: open ? { ...s.unread, [s.tab]: 0 } : s.unread })),
  setWhisperTo: whisperTo => set({ whisperTo }),
  add: l => {
    const s = get(), key = l.key ?? `l${++n}`;
    if (s.lines[l.ch].some(x => x.key === key)) return;
    const line: ChatLine = { ...l, key, at: l.at ?? Date.now() };
    const seen = s.tab === l.ch && (s.open || typeof window === 'undefined' || window.innerWidth > 768);
    set({ lines: { ...s.lines, [l.ch]: [...s.lines[l.ch], line].slice(-MAX_LINES) }, unread: seen || l.mine ? s.unread : { ...s.unread, [l.ch]: s.unread[l.ch] + 1 } });
  },
}));
const sys = (text: string, kind: LineKind = 'info', rarity?: string) => useChatStore.getState().add({ ch: 'system', kind, text, rarity });

// ---------- the character's guild (round 26: guild chat) ----------
let myGuild: string | null = null;
export const setMyGuild = (id: string | null) => { myGuild = id; };

// ---------- sending ----------
const ERR: Record<string, string> = { CHAT_FLOOD: 'พิมพ์เร็วเกินไป รอสักครู่', WHISPER_TARGET: 'ไม่พบผู้เล่นชื่อนี้' };
const cityNow = () => useGameStore.getState().player.cityId ?? 'hollow';

/** returns an error to show under the input, or null when sent */
export async function sendChat(ch: ChatChannel, raw: string, whisperTo?: string): Promise<string | null> {
  let text = raw.trim().slice(0, 200), to = whisperTo?.trim() ?? '';
  // "/w name message" whispers from any tab
  const w = /^\/(?:w|whisper|กซ)\s+(\S+)\s+([\s\S]+)$/i.exec(text);
  if (w) { ch = 'whisper'; to = w[1]; text = w[2].trim(); useChatStore.getState().setWhisperTo(to); }
  if (!text) return null;
  if (ch === 'system') return 'ช่องระบบใช้แสดงข้อมูลเท่านั้น';
  if (ch === 'party') return 'แชทปาร์ตี้เปิดพร้อมเซิร์ฟเวอร์ Realm';
  if (ch === 'guild' && !myGuild) return 'ยังไม่มีกิลด์ — เปิดเมนู กิลด์ เพื่อสร้างหรือเข้าร่วม';
  if (ch === 'whisper' && !to) return 'ใส่ชื่อผู้รับก่อน หรือพิมพ์ /w ชื่อ ข้อความ';
  const me = activeCharacter(), sb = getSupabaseBrowser(), name = useGameStore.getState().player.name;
  if (!me || !sb) { // guest: on this screen only
    if (ch === 'whisper') return 'กระซิบต้องล็อกอินด้วยบัญชี';
    useChatStore.getState().add({ ch, kind: 'chat', from: name, text, mine: true });
    return null;
  }
  let target: string | null = null;
  if (ch === 'whisper') {
    const { data, error } = await sb.rpc('character_by_name', { p_name: to });
    if (error || !data) return 'ไม่พบผู้เล่นชื่อนี้';
    target = String(data);
  }
  const { data, error } = await sb.from('chat_messages').insert({ channel: ch, char_id: me.id, sender_name: me.name, city_id: ch === 'near' ? cityNow() : null, target_char: target, group_id: ch === 'guild' ? myGuild : null, body: text })
    .select('id, created_at, target_name').single();
  if (error) return ERR[Object.keys(ERR).find(k => error.message.includes(k)) ?? ''] ?? 'ส่งข้อความไม่สำเร็จ';
  useChatStore.getState().add({ key: `db${data.id}`, ch, kind: 'chat', from: me.name, to: data.target_name ?? to, text, mine: true, at: Date.parse(data.created_at) || Date.now() });
  return null;
}

// ---------- receiving ----------
type Row = { id: number; channel: ChatChannel; char_id: string; sender_name: string; city_id: string | null; target_char: string | null; target_name: string | null; group_id?: string | null; body: string; created_at: string };
function addRow(r: Row) {
  const me = activeCharacter(); if (!me) return;
  if (r.channel === 'near' && r.city_id !== cityNow()) return; // near = the same map only
  if (r.channel === 'whisper' && r.char_id !== me.id && r.target_char !== me.id) return; // another character of this account
  if (r.channel === 'guild' && (r as Row & { group_id?: string | null }).group_id !== myGuild) return; // the account's other character's guild
  useChatStore.getState().add({ key: `db${r.id}`, ch: r.channel, kind: 'chat', from: r.sender_name, to: r.target_name ?? undefined, text: r.body, mine: r.char_id === me.id, at: Date.parse(r.created_at) || Date.now() });
}

// ---------- recording (system tab + database) ----------
const DEALT = new Set(['hit', 'crit', 'skill']);
type CombatRow = { char_id: string; dir: 'dealt' | 'taken'; amount: number; crit: boolean; other: string | null; city_id: string; at: string };
type LootRow = { char_id: string; item_def: string; item_name: string; rarity: string; qty: number; enhance: number; monster: string | null; city_id: string | null; at: string };

/** started once when the world opens; returns the stop function */
export function startChat(): () => void {
  const sb = getSupabaseBrowser(), me = activeCharacter();
  const combatQ: CombatRow[] = [], lootQ: LootRow[] = [];
  let stopped = false;
  const flush = async () => {
    if (!sb || !me) { combatQ.length = 0; lootQ.length = 0; return; }
    const c = combatQ.splice(0), l = lootQ.splice(0);
    try { if (c.length) await sb.from('combat_log').insert(c); } catch { /* offline: damage history is best effort */ }
    try { if (l.length) { const { error } = await sb.from('loot_history').insert(l); if (error && !stopped) lootQ.unshift(...l.slice(0, 200)); } }
    catch { lootQ.unshift(...l.slice(0, 200)); } // drops are kept: retry with the next batch
  };

  // damage: the store's floating-number events (seq increases); one line per hit in the system tab
  let lastSeq = Math.max(0, ...useGameStore.getState().combat.map(e => e.seq));
  let lastLog = useGameStore.getState().log;
  const unsub = useGameStore.subscribe(s => {
    if (s.combat.length && s.combat[s.combat.length - 1].seq > lastSeq) {
      for (const e of s.combat) {
        if (e.seq <= lastSeq) continue;
        const v = typeof e.value === 'number' ? Math.round(e.value) : 0;
        if (e.on === 'monster' && DEALT.has(e.kind) && v > 0) {
          const m = s.monsters.find(x => x.id === e.id)?.name ?? null;
          sys(`ทำดาเมจ ${v.toLocaleString()}${e.kind === 'crit' ? ' (คริ!)' : ''}${m ? ` → ${m}` : ''}`, 'dealt');
          if (me) combatQ.push({ char_id: me.id, dir: 'dealt', amount: v, crit: e.kind === 'crit', other: m, city_id: s.player.cityId ?? 'hollow', at: new Date().toISOString() });
        } else if (e.on === 'player' && e.kind === 'taken' && v > 0) {
          const [px, pz] = s.player.position;
          const by = s.monsters.filter(x => x.hp > 0).sort((a, b) => Math.hypot(a.x - px, a.z - pz) - Math.hypot(b.x - px, b.z - pz))[0];
          const m = by && Math.hypot(by.x - px, by.z - pz) < 12 ? by.name : null;
          sys(`ได้รับดาเมจ ${v.toLocaleString()}${m ? ` จาก ${m}` : ''}`, 'taken');
          if (me) combatQ.push({ char_id: me.id, dir: 'taken', amount: v, crit: false, other: m, city_id: s.player.cityId ?? 'hollow', at: new Date().toISOString() });
        }
      }
      lastSeq = s.combat[s.combat.length - 1].seq;
    }
    // the game log (quests, level up, errors) goes to the system tab too — it replaces the old log corner on PC
    if (s.log !== lastLog) {
      const prev = lastLog; lastLog = s.log;
      let k = s.log.findIndex((l, i) => l === prev[0] && (prev.length < 2 || s.log[i + 1] === undefined || s.log[i + 1] === prev[1]));
      if (k < 0) k = s.log.length;
      for (const l of s.log.slice(0, k).reverse()) sys(l);
    }
  });
  const unLoot = onLoot(e => {
    const it = e.item, plus = it.enhance ? ` +${it.enhance}` : '';
    sys(`ได้รับ ${it.name}${plus}${e.qty > 1 ? ` ×${e.qty}` : ''}${e.monster ? ` จาก ${e.monster}` : ''}`, 'loot', it.rarity);
    if (me) lootQ.push({ char_id: me.id, item_def: it.definitionId ?? it.family ?? it.id, item_name: it.name, rarity: it.rarity, qty: e.qty, enhance: it.enhance ?? 0, monster: e.monster ?? null, city_id: e.city ?? null, at: new Date(e.at).toISOString() });
  });
  const timer = setInterval(() => void flush(), 8000);
  const onHide = () => void flush();
  window.addEventListener('pagehide', onHide); window.addEventListener('sf-exit', onHide);

  // chat: the last hour of near / world / whispers, then live rows
  let rt: RealtimeChannel | null = null;
  if (sb && me) {
    void sb.rpc('guild_of', { p_char: me.id }).then(({ data }) => { if (!stopped) setMyGuild((data as string | null) ?? null); });
    void sb.from('chat_messages').select('id, channel, char_id, sender_name, city_id, target_char, target_name, group_id, body, created_at')
      .in('channel', ['near', 'world', 'whisper', 'guild']).gte('created_at', new Date(Date.now() - 3600_000).toISOString())
      .order('created_at', { ascending: false }).limit(80)
      .then(({ data }) => { if (!stopped) for (const r of (data ?? []).reverse()) addRow(r as Row); });
    rt = sb.channel('sf-chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, p => addRow(p.new as Row)).subscribe();
  } else sys('โหมด Guest: แชทแสดงเฉพาะบนเครื่องนี้ · ล็อกอินเพื่อคุยกับผู้เล่นอื่นและเก็บประวัติ');

  return () => {
    stopped = true; void flush(); clearInterval(timer); unsub(); unLoot();
    window.removeEventListener('pagehide', onHide); window.removeEventListener('sf-exit', onHide);
    if (rt && sb) void sb.removeChannel(rt);
  };
}

/** a character's own drop history, newest first (account characters only) */
export async function lootHistory(limit = 100) {
  const sb = getSupabaseBrowser(), me = activeCharacter(); if (!sb || !me) return null;
  const { data } = await sb.from('loot_history').select('item_name, rarity, qty, enhance, monster, at').eq('char_id', me.id).order('at', { ascending: false }).limit(limit);
  return data ?? [];
}
