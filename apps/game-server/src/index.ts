import 'dotenv/config';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import { Intent, type Actor } from './protocol.js';
import { Room } from './world.js';
import { pickChannel, canSwitch, channelList, CHANNEL_CAP } from './channels.js';
import { PartyManager, PARTY_DEFAULTS, type Party } from './party.js';
import { CharacterSession, DEFAULT_LIMITS, type Live } from './session.js';
import { MemoryRepo, RevisionConflict, SupabaseRepo, type CharacterRepo } from './characters.js';
import { importLegacy } from './importSave.js';
import { diffState } from './stateDiff.js';
import { acceptVitals } from './vitals.js';
import { MemoryMarket, SupabaseMarket, type MarketRepo } from './market.js';
import * as mkt from '@/game/economy/market';
import { codexTitles } from '@/game/economy/codex';
import { nextTax } from '@/game/balance/market';
import type * as eco from '@/game/economy/core';
import { migrateCharState } from '@/game/economy/core';
import { DEFAULT_CONFIG, mergeConfig } from '@/game/balance/config';
import { DEFAULT_SKILLS } from '@/game/skills/defaults';
import { mergeLibrary, type SkillLibrary } from '@/game/skills/engine';
import { makeGear, pickGearId } from '@/game/items';
import { starterGear, starterPlayer } from '@/lib/seed';
import '@/game/world/registry'; // trees, rocks, buildings and NPC bodies block walkable() for POS checks
import type { Rarity } from '@/lib/types';

// ---------------------------------------------------------------- configuration
// REALM_MEMORY=1 runs without Supabase (in-memory characters, tokens "dev-<name>") — local testing only, never in production.
const MEMORY = process.env.REALM_MEMORY === '1';
const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_PUBLISHABLE_KEY, secret = process.env.SUPABASE_SECRET_KEY;
if (!MEMORY && (!url || !key || !secret)) throw new Error('Set SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY');
const auth = MEMORY ? null : createClient(url!, key!, { auth: { persistSession: false } });
const db = MEMORY ? null : createClient(url!, secret!, { auth: { persistSession: false } });
const repo: CharacterRepo = MEMORY ? new MemoryRepo() : new SupabaseRepo(db!);
const market: MarketRepo = MEMORY ? new MemoryMarket(repo as MemoryRepo) : new SupabaseMarket(db!);
const MAX_PLAYERS = Number(process.env.MAX_PLAYERS ?? 500);
const CLOSED_BETA = process.env.CLOSED_BETA !== 'false';
const SAVE_DELAY_MS = Number(process.env.SAVE_DELAY_MS ?? 2000);
const IMPORT = { mode: (process.env.IMPORT_MODE === 'fresh' ? 'fresh' : 'sanitize') as 'fresh' | 'sanitize', goldCap: Number(process.env.IMPORT_GOLD_CAP ?? 50000) };
const limits = { ...DEFAULT_LIMITS, ...(process.env.KILL_DPS_SLACK ? { killDpsSlack: Number(process.env.KILL_DPS_SLACK) } : {}), ...(process.env.KILL_BURST_SECONDS ? { killBurstSeconds: Number(process.env.KILL_BURST_SECONDS) } : {}) };
/** the admin-edited balance and skills (game_config), refreshed every minute: the same numbers the clients use */
let live: Live = { config: DEFAULT_CONFIG, skills: DEFAULT_SKILLS, limits };
let ops = { loginOpen: true, message: '' }; const admins = new Set<string>();
async function loadConfig() {
  if (!db) return;
  const { data, error } = await db.from('game_config').select('key,value').in('key', ['balance', 'skills', 'ops']);
  if (error) { console.warn('config load failed:', error.message); return; }
  const by = Object.fromEntries((data ?? []).map((r: { key: string; value: unknown }) => [r.key, r.value]));
  // round 12: the maintenance switch (back office → game_config.ops). Turning it off closes non-admin sessions.
  const o = (by.ops ?? {}) as { loginOpen?: boolean; message?: string }, wasOpen = ops.loginOpen;
  ops = { loginOpen: o.loginOpen !== false, message: typeof o.message === 'string' ? o.message : '' };
  if (wasOpen && !ops.loginOpen) for (const [uid, sock] of clients) if (!admins.has(uid)) { send(sock, { type: 'NOTICE', message: `ปิดปรับปรุงเซิร์ฟเวอร์: ${ops.message || 'กรุณากลับมาใหม่ภายหลัง'}` }); sock.close(1013, 'Maintenance'); }
  live = { config: mergeConfig(DEFAULT_CONFIG, by.balance), skills: mergeLibrary(DEFAULT_SKILLS, (by.skills ?? null) as Partial<SkillLibrary> | null), limits };
}
void loadConfig(); setInterval(() => void loadConfig(), 60_000).unref();

const room = new Room(); const clients = new Map<string, WebSocket>(); const sessions = new Map<string, CharacterSession>();
// ---------------------------------------------------------------- parties: roster on the server + Supabase (save_party), 120 s reconnect grace
const parties = new PartyManager({ ...PARTY_DEFAULTS, graceMs: Number(process.env.PARTY_GRACE_SECONDS ?? 120) * 1000 });
const partyView = (p: Party, now = Date.now()) => ({ type: 'PARTY', party: parties.view(p, id => { const a = room.players.get(id); return a ? { ...a, maxMp: a.maxMp ?? 100 } : undefined; }, now) });
const pushParty = (p: Party, disbanded = false) => { for (const m of p.members) { const s = clients.get(m.id); if (s) send(s, disbanded ? { type: 'PARTY', party: null } : partyView(p)); } };
parties.onChange = (p, disbanded) => { pushParty(p, disbanded); if (db) void db.rpc('save_party', { p_party: p.id, p_leader: p.leader, p_members: disbanded ? [] : p.members.map(m => m.id) }).then(({ error }: { error: { message: string } | null }) => { if (error) console.warn('save_party', error.message); }); };
if (db) void (async () => {
  const { data, error } = await db.from('party_members').select('party_id,player_id,slot,parties(leader_id)').order('slot');
  if (error) { console.warn('party restore skipped:', error.message); return; } const rows = (data ?? []) as unknown as { party_id: string; player_id: string; parties: { leader_id: string } | null }[];
  const { data: profs } = await db.from('player_profiles').select('user_id,display_name,class_id').in('user_id', rows.map(r => r.player_id)); const prof = new Map(((profs ?? []) as { user_id: string; display_name: string | null; class_id: string | null }[]).map(p => [p.user_id, p]));
  const by = new Map<string, { partyId: string; leader: string; members: { id: string; name: string; classId: string }[] }>();
  for (const r of rows) { const e = by.get(r.party_id) ?? { partyId: r.party_id, leader: r.parties?.leader_id ?? r.player_id, members: [] }; const pp = prof.get(r.player_id); e.members.push({ id: r.player_id, name: pp?.display_name ?? '?', classId: 'Berserker' }); by.set(r.party_id, e); }
  parties.restore([...by.values()], Date.now()); console.log(`restored ${by.size} parties`);
})();

// ---------------------------------------------------------------- persistence: a save shortly after each change, at once on logout
async function persist(s: CharacterSession) {
  while (s.saving) await s.saving;
  if (!s.dirty) return;
  const snapshot = s.state; s.dirty = false; s.dirtyAt = 0;
  s.saving = repo.save(s.user, snapshot, s.rev).then(rev => { s.rev = rev; }).catch(err => {
    if (err instanceof RevisionConflict) { console.error(err.message, '— another process wrote this character; closing the session'); clients.get(s.user)?.close(4002, 'Character opened elsewhere'); sessions.delete(s.user); return; }
    console.error('save failed', s.user, err); s.dirty = true; s.dirtyAt = Date.now();
  }).finally(() => { s.saving = null; });
  await s.saving;
}
/** a save that waits its turn behind whatever the character is doing (use this everywhere outside the session queue) */
const persistQueued = (s: CharacterSession) => s.enqueue(() => persist(s));
setInterval(() => { const now = Date.now(); for (const s of sessions.values()) if (s.dirty && !s.saving && now - s.dirtyAt >= SAVE_DELAY_MS) void persistQueued(s); }, 500).unref();

const ctxNow = (now: number): eco.Ctx => ({ config: live.config, skills: live.skills, rng: Math.random, now, uuid: () => crypto.randomUUID() });
const STARTER = { player: starterPlayer, gear: starterGear };
/** a character for a verified account: the realm copy, else a one-time import of the old cloud save, else a new one */
async function openCharacter(user: string, profile: { display_name?: string | null; class_id?: string | null; gender?: string | null } | null): Promise<CharacterSession> {
  const now = Date.now(), cls = 'Berserker' as const, name = profile?.display_name ?? 'The Wanderer', gender: 'm' | 'f' = profile?.gender === 'f' ? 'f' : 'm';
  let stored = await repo.load(user);
  if (!stored) {
    const { state, notes } = importLegacy(await repo.legacySnapshot(user), { name, cls, gender }, ctxNow(now), STARTER, IMPORT);
    const rev = await repo.save(user, state, 0); stored = { state, rev }; console.log(`character created for ${user}: ${notes.join('; ')}`);
  }
  // round 13: a character of the five retired classes becomes a Berserker (items converted, see economy/core migrateCharState)
  const migrated = migrateCharState(stored.state, live.skills);
  // the profile (character screen) is the source of name, class and look
  const st = migrated; st.player = { ...st.player, name, classId: cls, gender };
  const session = new CharacterSession(user, st, stored.rev, () => live, now);
  if (migrated !== stored.state) { session.dirty = true; session.dirtyAt = now; console.log(`character ${user} converted to Berserker`); }
  return session;
}

// ---------------------------------------------------------------- HTTP + WebSocket
const PORT = Number(process.env.PORT ?? 3001);
/** comma-separated list, e.g. https://soulforge.example.com,https://web-production-xxxx.up.railway.app */
const ALLOWED = (process.env.ALLOWED_ORIGIN ?? '').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
// round 13: fail closed — an empty list used to accept a WebSocket from ANY web page. Production must name its web origin(s);
// ALLOW_ANY_ORIGIN=1 restores the old behaviour on purpose (local LAN tests only). REALM_MEMORY test mode is exempt.
if (!MEMORY && !ALLOWED.length && process.env.ALLOW_ANY_ORIGIN !== '1') throw new Error('Set ALLOWED_ORIGIN to the web origin(s), e.g. https://soulforge.example.com (or ALLOW_ANY_ORIGIN=1 for a local test)');
const http = createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') { res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify({ ok: true, room: room.id, players: clients.size, characters: sessions.size, boss: room.boss ? { hp: room.boss.hp, maxHp: room.boss.maxHp } : null })); return; }
  res.writeHead(404); res.end();
});
const wss = new WebSocketServer({ server: http, maxPayload: 4096, perMessageDeflate: false });
http.listen(PORT, '0.0.0.0');
// Railway sends SIGTERM on redeploy: save every character first, then close sockets so clients reconnect into the party grace window
const shutdown = async () => { await Promise.allSettled([...sessions.values()].map(s => persistQueued(s))); for (const s of clients.values()) s.close(1012, 'Server restarting'); http.close(); setTimeout(() => process.exit(0), 1500).unref(); };
process.on('SIGTERM', () => void shutdown()); process.on('SIGINT', () => void shutdown());
const send = (s: WebSocket, p: unknown) => { if (s.readyState === WebSocket.OPEN) s.send(JSON.stringify(p)); };
const broadcast = (p: unknown) => { for (const s of clients.values()) send(s, p); };
const distance = (a: { x: number; z: number }, b: { x: number; z: number }) => Math.hypot(a.x - b.x, a.z - b.z);
/** the realm's actor for a character: position and combat numbers from the authoritative state (gear, level, skills) */
function syncActor(a: Actor, s: CharacterSession) {
  const d = s.derived(), [x, z] = s.position, moved = a.city !== s.city; a.x = x; a.z = z; a.city = s.city;
  // round 13: entering a city (or joining) puts the character in a channel — a party member's, else the lowest with room
  if (moved || !a.channel) { const pt = parties.of(a.id); a.channel = pickChannel(room.players.values(), a, new Set(pt?.members.map(m => m.id) ?? [])); } a.level = s.state.player.level; a.maxHp = d.maxHp; a.maxMp = d.maxMp;
  a.attack = d.attack; a.defense = d.defense; a.crit = d.crit; a.speed = d.speed; a.hp = Math.min(a.hp, d.maxHp); a.mp = Math.min(a.mp, d.maxMp);
  a.evade = d.evade; a.dmgReduce = d.dmgReduce; a.immortal = admins.has(a.id); // round 13: the world boss hits with these
  a.title = codexTitles(s.state.codex)[0]; // the codex title other players see over the name (round 11)
}
// state pushes: only the parts that changed since the last push, at most ~7 per second per player
const lastPushed = new Map<string, eco.CharState>(), lastSeq = new Map<string, number>(), needPush = new Set<string>();
setInterval(() => {
  for (const id of needPush) { const sock = clients.get(id), s = sessions.get(id); if (!sock || !s) continue;
    send(sock, { type: 'STATE', seq: lastSeq.get(id) ?? 0, patch: diffState(lastPushed.get(id), s.state) }); lastPushed.set(id, s.state); }
  needPush.clear();
}, 150).unref();

wss.on('connection', (socket, request) => {
  const origin = request.headers.origin;
  if (ALLOWED.length && !ALLOWED.includes(origin ?? '')) { socket.close(1008, 'Origin rejected'); return; }
  let player: Actor | null = null; let session: CharacterSession | null = null; let id: string | null = null; let strikes = 0; let received = 0; let lastSecond = Date.now(); let authing = false;
  const authTimeout = setTimeout(() => { if (!player) socket.close(1008, 'Auth timeout'); }, 8000);
  socket.on('message', async (raw) => {
    const bytes = Array.isArray(raw) ? Buffer.concat(raw) : raw instanceof ArrayBuffer ? Buffer.from(raw) : raw;
    if (bytes.length > 4096) { socket.close(1009); return; }
    const now = Date.now(); if (now - lastSecond >= 1000) { lastSecond = now; received = 0; } if (++received > 60) { socket.close(1008, 'Rate limit'); return; }
    let msg: unknown; try { msg = JSON.parse(bytes.toString()); } catch { return; }
    if (!player) {
      if (authing || !msg || typeof msg !== 'object' || !('type' in msg) || msg.type !== 'AUTH' || !('token' in msg) || typeof msg.token !== 'string') return;
      authing = true;
      let verifiedId: string, profile: { display_name?: string | null; class_id?: string | null; gender?: string | null; banned?: boolean } | null;
      if (MEMORY) { if (!/^dev-[a-z0-9]{1,12}$/.test(msg.token)) { socket.close(1008, 'Invalid JWT'); return; } verifiedId = `00000000-0000-4000-8000-${Buffer.from(msg.token.slice(4)).toString('hex').padEnd(12, '0').slice(0, 12)}`; profile = { display_name: msg.token.slice(4), class_id: 'Berserker', gender: 'm' }; }
      else {
        const result = await auth!.auth.getUser(msg.token); if (result.error || !result.data.user) { socket.close(1008, 'Invalid JWT'); return; }
        verifiedId = result.data.user.id;
        // closed beta: only accounts that redeemed an invite code (player_profiles) and are not banned may enter
        const { data } = await db!.from('player_profiles').select('display_name,class_id,gender,banned').eq('user_id', verifiedId).maybeSingle(); profile = data;
        if (CLOSED_BETA && (!profile || profile.banned)) { socket.close(1008, profile ? 'Account suspended' : 'Invite required'); return; }
        if (CLOSED_BETA && !profile?.class_id) { socket.close(1008, 'Create your character first'); return; }
        const { data: adm } = await db!.from('admin_users').select('user_id').eq('user_id', verifiedId).maybeSingle(); if (adm) admins.add(verifiedId); else admins.delete(verifiedId);
        if (!ops.loginOpen && !adm) { socket.close(1013, `Maintenance${ops.message ? `: ${ops.message.slice(0, 80)}` : ''}`); return; }
      }
      if (!clients.has(verifiedId) && clients.size >= MAX_PLAYERS) { socket.close(1013, 'Realm full'); return; }
      const previous = clients.get(verifiedId); if (previous) previous.close(4001, 'Session replaced');
      try { const open = sessions.get(verifiedId); if (open) { await open.enqueue(() => undefined); while (open.saving) await open.saving; } session = open ?? await openCharacter(verifiedId, profile); }
      catch (err) { console.error('character load failed', verifiedId, err); socket.close(1011, 'Character unavailable'); return; }
      if (socket.readyState !== WebSocket.OPEN) return;
      id = verifiedId; sessions.set(id, session);
      // Codex Seals drop more often with party members nearby: count them from the realm's own positions (round 11)
      { const me = session; me.partyNear = range => { const p = parties.of(me.user); if (!p) return 1;
        return p.members.filter(m => { const o = m.id === me.user ? me : sessions.get(m.id); return !!o && clients.has(m.id) && o.city === me.city && Math.hypot(o.position[0] - me.position[0], o.position[1] - me.position[1]) <= range; }).length || 1; }; }
      const st = session.state.player, d = session.derived();
      player = { id, x: st.position[0], z: st.position[1], city: session.city, hp: d.maxHp, maxHp: d.maxHp, attack: d.attack, defense: d.defense, crit: d.crit, mp: d.maxMp, maxMp: d.maxMp, speed: d.speed, level: st.level, lastBasic: 0, lastSkill: 0, classId: st.classId, name: st.name, gender: st.gender === 'f' ? 'f' : 'm', buffs: [] };
      { const pt = parties.of(id); player.channel = pickChannel(room.players.values(), player, new Set(pt?.members.map(m => m.id) ?? [])); }
      room.players.set(id, player); clients.set(id, socket); clearTimeout(authTimeout); lastPushed.set(id, session.state); lastSeq.set(id, 0);
      send(socket, { type: 'WELCOME', playerId: id, roomId: room.id }); send(socket, { type: 'CHAR', state: session.state, rev: session.rev }); send(socket, room.snapshotFor(player)); broadcast({ type: 'PLAYER_JOINED', playerId: id });
      void market.mail(id).then(m => { if (m.length) send(socket, { type: 'MAIL', count: m.length }); }).catch(() => undefined);
      const back = parties.reconnect(id, st.name, st.classId); if (back) send(socket, { type: 'NOTICE', message: 'กลับเข้าปาร์ตี้เดิมแล้ว' }); return;
    }
    const r = Intent.safeParse(msg); if (!r.success) { if (++strikes > 15) socket.close(1008, 'Invalid intents'); return; }
    const intent = r.data; const a: Actor = player, s = session!;
    if (intent.type === 'PING') { send(socket, { type: 'PONG', serverTime: now }); return; }
    if (intent.type === 'MOVE') return; // round 9: positions come from POS (validated); the realm no longer integrates MOVE
    if (intent.type === 'POS') {
      void s.enqueue(() => {
        const m = s.move(intent.city, intent.x, intent.z, Date.now());
        if (!m.ok) send(socket, { type: 'POS_FIX', city: m.city, x: m.fix[0], z: m.fix[1] });
        syncActor(a, s);
        // round 13: a reported HP/MP may go down freely but only rise as fast as the character can heal (vitals.ts) —
        // the browser can no longer declare itself at full health in the middle of a boss fight
        const t = Date.now(), v = acceptVitals({ hp: a.hp, mp: a.mp }, { hp: intent.hp, mp: intent.mp }, { hp: a.maxHp, mp: a.maxMp ?? 100 }, t - (a.vitalsAt ?? t), { dead: a.hp <= 0, credit: a.healCredit });
        a.hp = v.hp; a.mp = v.mp; a.healCredit = v.creditLeft; a.vitalsAt = t;
      }); return;
    }
    if (intent.type === 'ACT') {
      void s.enqueue(async () => {
        // a potion heals from the HP the realm believes, so its heal can be credited exactly (round 13)
        if (intent.op === 'use') s.state = { ...s.state, player: { ...s.state.player, hp: a.hp, mp: a.mp } };
        const levelBefore = s.state.player.level, hpBefore = s.state.player.hp;
        const res = MARKET_OPS.has(intent.op) ? await marketAct(s, intent.op, intent.args, Date.now()) : s.act(intent.op, intent.args, intent.ids, Date.now());
        lastSeq.set(a.id, intent.seq);
        send(socket, { type: 'ACK', seq: intent.seq, op: intent.op, ok: res.ok, msg: res.msg ?? null, ...(res.extra ?? {}) });
        needPush.add(a.id); // pushed even when refused: the client may have applied it optimistically and must roll back
        if (res.changed) syncActor(a, s);
        // round 13: heals the realm granted itself — respawn and level-up refill, a potion adds what it healed
        if (res.ok && (intent.op === 'respawn' || s.state.player.level > levelBefore)) { a.hp = a.maxHp; a.mp = a.maxMp ?? a.mp; a.healCredit = 0; }
        else if (res.ok && intent.op === 'use' && a.hp > 0) { a.hp = Math.min(a.maxHp, a.hp + Math.max(0, s.state.player.hp - hpBefore)); a.mp = Math.min(a.maxMp ?? a.mp, s.state.player.mp); }
      }).catch(err => { console.error('act failed', a.id, intent.op, err); send(socket, { type: 'ACK', seq: intent.seq, op: intent.op, ok: false, msg: 'เซิร์ฟเวอร์ทำรายการไม่สำเร็จ ลองใหม่อีกครั้ง' }); });
      return;
    }
    if (intent.type === 'MARKET') {
      const view = intent.view, q = intent;
      void (async () => {
        try {
          if (view === 'mail') send(socket, { type: 'MARKET_VIEW', view, mail: await market.mail(a.id), tax: marketTax });
          else if (view === 'mine') send(socket, { type: 'MARKET_VIEW', view, listings: await market.mine(a.id), tax: marketTax });
          else if (view === 'history') send(socket, { type: 'MARKET_VIEW', view, trades: await market.history(a.id), tax: marketTax });
          else if (view === 'prices') send(socket, { type: 'MARKET_VIEW', view, def: q.def ?? '', enhance: q.enhance ?? 0, prices: await market.prices(q.def ?? '', q.enhance ?? 0, Date.now()), tax: marketTax });
          else send(socket, { type: 'MARKET_VIEW', view, page: q.page, listings: await market.browse({ text: q.text, rarity: (q.rarity ?? '') as never, page: q.page, cat: q.cat ?? '', sort: q.sort ?? 'new', enhMin: q.enhMin ?? 0 }, Date.now()), tax: marketTax });
        } catch (err) { console.error('market view', err); send(socket, { type: 'MARKET_VIEW', view, error: 'โหลดตลาดไม่ได้ ลองใหม่อีกครั้ง', tax: marketTax }); }
      })(); return;
    }
    if (intent.type === 'PARTY_INVITE') { const t = room.players.get(intent.targetId); const err = parties.invite(a, t, now); if (err) { send(socket, { type: 'REJECTED', reason: `PARTY_${err}` }); return; }
      const ts = clients.get(intent.targetId); if (ts) send(ts, { type: 'PARTY_INVITE', from: a.id, name: a.name ?? '?', classId: a.classId ?? 'Berserker', expiresIn: PARTY_DEFAULTS.inviteMs / 1000 }); return; }
    if (intent.type === 'PARTY_ACCEPT') { const inv = parties.invites.get(a.id); const inviter = inv ? room.players.get(inv.from) : undefined;
      const pr = parties.accept({ id: a.id, name: a.name ?? '?', classId: a.classId ?? 'Berserker' }, inviter ? { id: inviter.id, name: inviter.name ?? '?', classId: inviter.classId ?? 'Berserker' } : undefined, now); if (typeof pr === 'string') send(socket, { type: 'REJECTED', reason: `PARTY_${pr}` }); return; }
    if (intent.type === 'PARTY_DECLINE') { parties.decline(a.id); return; }
    if (intent.type === 'PARTY_LEAVE') { const p = parties.of(a.id); const pr = parties.leave(a.id); if (typeof pr === 'string') send(socket, { type: 'REJECTED', reason: `PARTY_${pr}` }); else { send(socket, { type: 'PARTY', party: null }); if (p && parties.parties.has(p.id)) pushParty(p); } return; }
    if (intent.type === 'PARTY_KICK') { const pr = parties.kick(a.id, intent.targetId); if (typeof pr === 'string') send(socket, { type: 'REJECTED', reason: `PARTY_${pr}` }); else { const ks = clients.get(intent.targetId); if (ks) send(ks, { type: 'PARTY', party: null }); } return; }
    // round 13: city channels
    if (intent.type === 'CHANNELS') { send(socket, { type: 'CHANNELS', city: a.city ?? 'hollow', current: a.channel ?? 1, cap: CHANNEL_CAP, list: channelList(room.players.values(), a.city ?? 'hollow') }); return; }
    if (intent.type === 'CHANNEL') {
      const now = Date.now();
      if (now - (a.channelAt ?? 0) < 10_000) { send(socket, { type: 'REJECTED', reason: 'CHANNEL_COOLDOWN' }); return; }
      if (!canSwitch(room.players.values(), a, intent.channel)) { send(socket, { type: 'REJECTED', reason: 'CHANNEL_FULL' }); send(socket, { type: 'CHANNELS', city: a.city ?? 'hollow', current: a.channel ?? 1, cap: CHANNEL_CAP, list: channelList(room.players.values(), a.city ?? 'hollow') }); return; }
      a.channel = intent.channel; a.channelAt = now; send(socket, room.snapshotFor(a));
      send(socket, { type: 'CHANNELS', city: a.city ?? 'hollow', current: a.channel, cap: CHANNEL_CAP, list: channelList(room.players.values(), a.city ?? 'hollow') }); return;
    }
    // round 13: there are no Enchanters any more (one class) — the old inscription intent is refused
    if (intent.type === 'BUFF') { send(socket, { type: 'REJECTED', reason: 'No class can inscribe other players' }); return; }
    if (intent.type === 'ATTACK') {
      const boss = room.boss; if (!boss || intent.targetId !== boss.id || a.city !== 'hollow') { send(socket, { type: 'REJECTED', reason: 'Unknown target' }); return; }
      const skill = intent.skillId === 'soul_burst'; const cooldown = skill ? 4000 : 700; const last = skill ? a.lastSkill : a.lastBasic; const range = skill ? 5 : 3;
      if (distance(a, boss) > range || now - last < cooldown || a.hp <= 0 || (skill && a.mp < 20)) { send(socket, { type: 'REJECTED', reason: 'Range, MP or cooldown' }); return; }
      if (skill) { a.lastSkill = now; a.mp -= 20; } else a.lastBasic = now;
      const might = 1 + Math.max(0, ...(a.buffs ?? []).filter(b => b.until > now).map(b => b.atkPct ?? 0)) / 100; const critical = Math.random() < a.crit; const dealt = Math.max(1, Math.floor(a.attack * might * (skill ? 1.9 : 1) * (critical ? 1.65 : 1) * (0.9 + Math.random() * .2) - boss.defense * .12));
      const outcome = room.damageBoss(a.id, dealt, now); broadcast({ type: 'COMBAT_RESULT', playerId: a.id, targetId: boss.id, damage: outcome.dealt, critical });
      if (outcome.killed && outcome.result) { payBoss(outcome.result.ranked, outcome.at!, now); broadcast({ type: 'BOSS_DEFEATED', playerId: a.id }); broadcast(outcome.result); }
      return;
    }
    if (intent.type === 'PICKUP') { send(socket, { type: 'REJECTED', reason: 'Boss loot now goes to each fighter’s own drops' }); return; }
  });
  socket.on('close', () => {
    clearTimeout(authTimeout);
    if (id && clients.get(id) === socket) {
      clients.delete(id); room.players.delete(id); broadcast({ type: 'PLAYER_LEFT', playerId: id }); parties.disconnect(id, Date.now());
      const s = sessions.get(id), uid = id; lastPushed.delete(uid); lastSeq.delete(uid); needPush.delete(uid);
      // the session stays until it is saved; a quick reconnect picks the same object up again
      if (s) void persistQueued(s).then(() => { if (!clients.has(uid) && sessions.get(uid) === s) sessions.delete(uid); });
    }
  });
});

/** World boss rewards (the top-10 board): the SoulGod share and gear of the promised rarity, into each fighter's own
 *  loot at the boss (so a full bag never loses it). The purse itself is capped in world.ts (BOSS_PURSE_MAX). */
function payBoss(ranked: { id: string; soulGod: number; guaranteed: string | null; highTier: string | null }[], at: [number, number], now: number) {
  for (const r of ranked) {
    const s = sessions.get(r.id); if (!s) continue;
    void s.enqueue(() => { const ctx = s.ctx([], now), cls = 'Berserker' as const;
    const items = [r.guaranteed, r.highTier].filter((x): x is string => !!x).map(rar => ({ ...makeGear(pickGearId(rar as Rarity, cls, ctx.rng), cls, ctx.rng), id: ctx.uuid() }));
    s.state = { ...s.state, player: { ...s.state.player, gold: s.state.player.gold + Math.max(0, Math.floor(r.soulGod)) }, drops: [...s.state.drops, ...items.map((item, i) => ({ id: ctx.uuid(), x: at[0] + Math.cos(i * 2.1) * 1.5, z: at[1] + Math.sin(i * 2.1) * 1.5, item }))] };
    s.dirty = true; s.dirtyAt = s.dirtyAt || now; needPush.add(r.id); });
  }
}

// ---------------------------------------------------------------- the player market and the mailbox (round 10)
const MARKET_OPS = new Set(['marketList', 'marketBuy', 'marketCancel', 'mailClaim']);
let marketTax = DEFAULT_CONFIG.market.salesTaxPct;
/** readable refusals for the database's own guards */
const marketMsg = (e: unknown) => { const m = e instanceof Error ? e.message : String(e);
  if (/one_per_item|already listed/.test(m)) return 'ไอเทมนี้อยู่ในตลาดแล้ว'; if (/Too many active/.test(m)) return `ลงขายได้พร้อมกันสูงสุด ${live.config.market.maxActiveListings} รายการ`;
  if (/suspended/i.test(m)) return 'บัญชีถูกระงับ'; return m.length < 80 ? m : 'ทำรายการไม่สำเร็จ'; };
/** one market / mail operation, inside the character's queue: flush the character, run the pure reducer, then commit the
 *  new character together with the market row in one transaction at the stored revision */
async function marketAct(s: CharacterSession, op: string, args: unknown[], now: number): Promise<{ ok: boolean; msg?: string; changed: boolean; extra?: Record<string, unknown> }> {
  const ctx = s.ctx([], now), str = (i: number) => typeof args[i] === 'string' ? args[i] as string : '';
  // round 26: the exchange opens from the menu anywhere (Night Crows / Vampir style); Silas Vane still offers it in town
  await persist(s); if (s.dirty) return { ok: false, msg: 'กำลังบันทึกตัวละคร ลองอีกครั้ง', changed: false };
  try {
    let r: eco.Ok, rev: number, extra: Record<string, unknown> = {};
    if (op === 'marketList') {
      const price = Number(args[1]), item = s.state.inventory.find(i => i?.id === str(0));
      if (!item) return { ok: false, msg: 'ไม่พบไอเทมในกระเป๋า (ของที่สวมอยู่ต้องถอดก่อน)', changed: false };
      const info = await market.listInfo(s.user, item.definitionId ?? '', item.enhance ?? 0, now);
      const p = mkt.prepareList(s.state, item.id, price, info, ctx, { id: s.user, name: s.state.player.name ?? '' }); if (!p.ok) return { ok: false, msg: p.msg, changed: false };
      rev = await market.list(s.user, s.rev, p.state, p.listing); r = p; extra = { listing: p.listing.id };
    } else if (op === 'marketBuy') {
      const l = await market.get(str(0)); if (!l) return { ok: false, msg: 'รายการนี้ปิดไปแล้ว', changed: false };
      const p = mkt.prepareBuy(s.state, l, s.user, marketTax, ctx); if (!p.ok) return { ok: false, msg: p.msg, changed: false };
      rev = await market.buy(s.user, s.rev, p.state, l.id, l.price, p.seller, p.burned, now); r = p;
      const seller = clients.get(l.seller); if (seller) void market.mail(l.seller).then(m => send(seller, { type: 'MAIL', count: m.length, note: `${l.item.name} ขายได้แล้ว` })).catch(() => undefined);
    } else if (op === 'marketCancel') {
      const l = await market.get(str(0)); if (!l) return { ok: false, msg: 'รายการนี้ปิดไปแล้ว', changed: false };
      const info = await market.listInfo(s.user, l.definitionId, l.enhance, now);
      const p = mkt.prepareCancel(s.state, l, s.user, info.cancelsLastHour, ctx); if (!p.ok) return { ok: false, msg: p.msg, changed: false };
      rev = await market.cancel(s.user, s.rev, p.state, l.id); r = p;
    } else {
      const p = mkt.prepareClaim(s.state, await market.mail(s.user)); if (!p.ok) return { ok: false, msg: p.msg, changed: false };
      rev = await market.claim(s.user, s.rev, p.state, p.claimed); r = p; extra = { claimed: p.claimed.length };
    }
    s.state = r.state; s.rev = rev; s.dirty = false; s.dirtyAt = 0;
    return { ok: true, msg: r.log[0], changed: true, extra };
  } catch (err) {
    if (err instanceof RevisionConflict) { console.error(err.message, '— closing the session'); clients.get(s.user)?.close(4002, 'Character opened elsewhere'); sessions.delete(s.user); return { ok: false, msg: 'ตัวละครถูกเปิดจากที่อื่น', changed: false }; }
    return { ok: false, msg: marketMsg(err), changed: false };
  }
}
/** listings past their time go back by mail (every minute) */
setInterval(() => { void market.expire(Date.now()).then(sellers => { for (const u of new Set(sellers)) { const c = clients.get(u); if (c) void market.mail(u).then(m => send(c, { type: 'MAIL', count: m.length, note: 'ของที่ลงขายหมดเวลา ส่งคืนทางจดหมาย' })); } }).catch(err => console.warn('market expire:', err instanceof Error ? err.message : err)); }, 60_000).unref();
/** inflation control: once per Thai day record the SoulGod supply and step the market tax toward the target growth */
const thaiDay = (t = Date.now()) => new Date(t + 7 * 3_600_000).toISOString().slice(0, 10);
async function economyDay() {
  try {
    const stored = await market.getTax(), today = thaiDay();
    if (stored) marketTax = stored.rate;
    const history = await market.supplyDay(today, marketTax);
    if (stored?.day === today) return; // already adjusted today (e.g. after a restart)
    const { rate, growth } = nextTax(stored?.rate ?? live.config.market.salesTaxPct, history, live.config);
    marketTax = rate; await market.setTax(rate, growth, today);
    console.log(`economy ${today}: supply ${history.at(-1)?.supply ?? '?'} · weekly growth ${growth === null ? 'n/a' : (growth * 100).toFixed(2) + '%'} · market tax ${(rate * 100).toFixed(2)}%`);
  } catch (err) { console.warn('economy day:', err instanceof Error ? err.message : err); }
}
setTimeout(() => void economyDay(), 5_000).unref(); setInterval(() => void economyDay(), 10 * 60_000).unref();

setInterval(() => {
  const now = Date.now(); room.tick(0.05, now, id => sessions.get(id)?.singleTargetDps(now) ?? 0);
  // round 13: the world boss swings back; the struck player learns its new HP (its browser shows the hit / the defeat)
  const strike = room.bossAttack(now);
  if (strike) for (const [pid, sock] of clients) { const p = room.players.get(pid); if (p && (p.city ?? 'hollow') === 'hollow') send(sock, strike); }
  for (const [pid, sock] of clients) { const viewer = room.players.get(pid); if (!viewer) continue; const pt = parties.of(pid); send(sock, room.snapshotFor(viewer, 32, undefined, pt ? new Set(pt.members.map(m => m.id)) : undefined)); }
}, 50);
// party frames (HP/MP/position of every member, wherever they are) twice a second; expire reconnect graces
setInterval(() => { const now = Date.now(); parties.tick(now); for (const p of parties.parties.values()) pushParty(p); }, 500);
console.log(`SOULFORGE realm listening on ${PORT}${MEMORY ? ' (in-memory characters, dev tokens)' : ''}`);
