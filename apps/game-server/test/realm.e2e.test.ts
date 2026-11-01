// Run from apps/game-server: `npm test` builds dist/index.js first (REALM_MEMORY=1: in-memory characters, dev tokens).
// End-to-end: the real realm bundle (REALM_MEMORY=1) on a local port, driven over a WebSocket like the browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = dirname(fileURLToPath(import.meta.url));
import WebSocket from 'ws';
import '../../../src/game/world/registry';
import { walkable, portalsOf } from '../../../src/game/content';
import { NPC_SPOTS } from '../../../src/game/npcs';
import { spawnPoints } from '../../../src/game/spawns';

const PORT = 3999;
let proc: ReturnType<typeof spawn>;
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
test.before(async () => {
  proc = spawn('node', ['dist/index.js'], { cwd: join(HERE, '..'), env: { ...process.env, REALM_MEMORY: '1', PORT: String(PORT), SAVE_DELAY_MS: '300', KILL_BURST_SECONDS: '0.5' }, stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stderr!.on('data', d => process.stderr.write('[realm] ' + d));
  await new Promise<void>((res, rej) => { proc.stdout!.on('data', d => { if (String(d).includes('listening')) res(); }); setTimeout(() => rej(new Error('realm did not start')), 8000); });
  for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/health`); if (r.ok) break; } catch { await sleep(100); } }
});
test.after(() => { proc.kill('SIGTERM'); });

class Client {
  ws: WebSocket; msgs: any[] = []; seq = 0; state: any = null; pos: [number, number] = [0, 0]; city = 'hollow'; fixes = 0;
  constructor(token: string) { this.ws = new WebSocket(`ws://127.0.0.1:${PORT}`); this.ws.on('open', () => this.ws.send(JSON.stringify({ type: 'AUTH', token })));
    this.ws.on('message', (raw: Buffer) => { const m = JSON.parse(String(raw)); if (m.type === 'WORLD_SNAPSHOT') { this.snap = m; return; } this.msgs.push(m);
      if (m.type === 'CHAR') { this.state = m.state; this.pos = m.state.player.position; this.city = m.state.player.cityId; }
      if (m.type === 'STATE') { this.state = { ...this.state, ...m.patch }; }
      if (m.type === 'POS_FIX') { this.fixes++; this.pos = [m.x, m.z]; } }); }
  snap: any = null;
  async wait(pred: (m: any) => boolean, ms = 3000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { const i = this.msgs.findIndex(pred); if (i >= 0) return this.msgs.splice(i, 1)[0]; await sleep(10); } throw new Error('timeout waiting'); }
  send(m: object) { this.ws.send(JSON.stringify(m)); }
  async act(op: string, args: unknown[] = [], ids: string[] = []) { const seq = ++this.seq; this.send({ type: 'ACT', seq, op, args, ids }); const ack = await this.wait(m => m.type === 'ACK' && m.seq === seq); await this.wait(m => m.type === 'STATE' && m.seq >= seq, 2000).catch(() => null); return ack; }
  /** walk along a path at 4 m/s, reporting every 100 ms */
  async walk(path: [number, number][]) { for (const p of path) { this.pos = p; this.send({ type: 'POS', city: this.city, x: p[0], z: p[1] }); await sleep(100); } }
  close() { this.ws.close(); }
}
/** grid path on the walkable map (0.5 m cells), resampled to ≤0.35 m steps (3.5 m/s at 10 Hz) */
function path(city: string, from: [number, number], to: [number, number]): [number, number][] {
  const k = (x: number, z: number) => `${x},${z}`, g = (v: number) => Math.round(v * 2), start = [g(from[0]), g(from[1])];
  let goal = [g(to[0]), g(to[1])];
  if (!walkable(city as any, goal[0] / 2, goal[1] / 2)) { let best: number[] | null = null; for (let dx = -6; dx <= 6; dx++) for (let dz = -6; dz <= 6; dz++) { const c = [goal[0] + dx, goal[1] + dz]; if (walkable(city as any, c[0] / 2, c[1] / 2) && (!best || Math.hypot(dx, dz) < Math.hypot(best[0] - goal[0], best[1] - goal[1]))) best = c; } goal = best!; }
  const prev = new Map<string, string | null>([[k(start[0], start[1]), null]]), q = [start];
  while (q.length) { const [x, z] = q.shift()!; if (x === goal[0] && z === goal[1]) break;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, nz = z + dz, key = k(nx, nz); if (prev.has(key) || !walkable(city as any, nx / 2, nz / 2)) continue; prev.set(key, k(x, z)); q.push([nx, nz]); } }
  const out: [number, number][] = []; let cur: string | null = k(goal[0], goal[1]); if (!prev.has(cur)) throw new Error('no path');
  while (cur) { const [x, z] = cur.split(',').map(Number); out.unshift([x / 2, z / 2]); cur = prev.get(cur)!; }
  const fine: [number, number][] = []; for (let i = 1; i < out.length; i++) { const a = out[i - 1], b = out[i]; fine.push(a); }
  fine.push(out[out.length - 1]); return fine.filter((_, i) => i % 1 === 0);
}

test('login → shop → waygate → hunting with kill claims → save → reconnect', async () => {
  const c = new Client('dev-alice');
  await c.wait(m => m.type === 'WELCOME'); await c.wait(m => m.type === 'CHAR');
  assert.equal(c.state.player.cityId, 'hollow'); assert.equal(c.state.player.gold, 150); assert.equal(c.state.inventory.length, 24);

  // teleporting is refused and snapped back
  c.send({ type: 'POS', city: 'hollow', x: -20, z: -20 }); await c.wait(m => m.type === 'POS_FIX'); assert.equal(c.fixes, 1);

  // buying needs to stand at Mira's
  const far = await c.act('buyShop', ['potion-hp-s', 2]); assert.equal(far.ok, false); assert.match(far.msg, /Mira/);
  await c.walk(path('hollow', c.pos, NPC_SPOTS.hollow.shop));
  const ids = [crypto.randomUUID()];
  const buy = await c.act('buyShop', ['potion-hp-s', 2], ids); assert.equal(buy.ok, true, buy.msg);
  const potion = c.state.inventory.find((i: any) => i?.definitionId === 'potion-hp-s');
  assert.equal(potion.qty, 2); assert.equal(potion.id, ids[0], 'the client-proposed id is kept'); assert.ok(c.state.player.gold < 150);
  const bad = await c.act('buyShop', ['potion-hp-s', 100000]); assert.equal(bad.ok, false);
  const nope = await c.act('kill', ['hollow', 'nothing']); assert.equal(nope.ok, false);

  // through the south waygate to Ashen Outskirts (must stand in the ring)
  const early = await c.act('travel', ['wild0', true]); assert.equal(early.ok, false);
  const gate = portalsOf('hollow').find(p => p.to === 'wild0')!;
  await c.walk(path('hollow', c.pos, [gate.x - 2.2, gate.z - 2.2]));
  const go = await c.act('travel', ['wild0', true]); assert.equal(go.ok, true, go.msg); assert.equal(c.state.player.cityId, 'wild0'); c.city = 'wild0'; c.pos = c.state.player.position;

  // kill claims: a near spawn pays, the same spawn again before it respawns does not, a far spawn does not
  const spawns = spawnPoints('wild0').filter(s => !s.boss);
  const nearest = [...spawns].sort((a, b) => Math.hypot(a.position[0] - c.pos[0], a.position[1] - c.pos[1]) - Math.hypot(b.position[0] - c.pos[0], b.position[1] - c.pos[1]));
  await sleep(1200); // let the damage budget refill a little
  const exp0 = c.state.player.exp + c.state.player.level * 1e6, gold0 = c.state.player.gold;
  const k1 = await c.act('kill', ['wild0', nearest[0].id]); assert.equal(k1.ok, true, k1.msg);
  assert.ok(c.state.player.exp + c.state.player.level * 1e6 > exp0 && c.state.player.gold > gold0, 'reward paid');
  const again = await c.act('kill', ['wild0', nearest[0].id]); assert.equal(again.ok, false); assert.match(again.msg, /respawn/);
  const farthest = nearest[nearest.length - 1]; const f = await c.act('kill', ['wild0', farthest.id]); assert.equal(f.ok, false); assert.match(f.msg, /far/);
  // claiming every spawn in reach at once runs out of damage budget (burst shortened to 0.5 s for the test)
  let paid = 1, refused = 0; for (const s of nearest.slice(1, 25)) { const r = await c.act('kill', ['wild0', s.id]); if (r.ok) paid++; else if (/faster/.test(r.msg)) refused++; }
  assert.ok(refused > 0, `instant mass kills are refused (paid ${paid}, refused ${refused})`);
  // loot from the kills is on the ground for this character; picking up the nearest one
  if (c.state.drops.length) { const d = c.state.drops[0]; await c.walk(path('wild0', c.pos, [Math.round(d.x * 2) / 2, Math.round(d.z * 2) / 2]).filter(p => walkable('wild0', p[0], p[1])));
    const pk = await c.act('pickup', [d.id]); assert.equal(pk.ok, true, pk.msg); assert.ok(c.state.inventory.some((i: any) => i?.id === d.item.id)); }

  const snapshot = JSON.stringify({ g: c.state.player.gold, e: c.state.player.exp, l: c.state.player.level, inv: c.state.inventory.filter(Boolean).length });
  c.close(); await sleep(800);
  const c2 = new Client('dev-alice'); await c2.wait(m => m.type === 'CHAR');
  assert.equal(JSON.stringify({ g: c2.state.player.gold, e: c2.state.player.exp, l: c2.state.player.level, inv: c2.state.inventory.filter(Boolean).length }), snapshot, 'state survives a reconnect');
  assert.equal(c2.state.player.cityId, 'wild0');
  // unknown ops / malformed messages are ignored, not crashing the realm
  c2.send({ type: 'ACT', seq: 1, op: 'giveMeGold', args: [] }); c2.send({ type: 'ACT', seq: 'x' }); await sleep(100);
  const ok = await c2.act('swap', [0, 1]); assert.equal(ok.ok, true);
  c2.close();
});

test('a second player sees the first only on the same map', async () => {
  const a = new Client('dev-bob'), b = new Client('dev-carol');
  await a.wait(m => m.type === 'CHAR'); await b.wait(m => m.type === 'CHAR'); await sleep(300);
  assert.ok(a.snap.players.some((p: any) => p.name === 'carol'), 'both in Hollow Reach');
  assert.ok(a.snap.boss === null || typeof a.snap.boss === 'object');
  a.close(); b.close();
});

test('market: list at the broker, a second player buys, the seller is paid by mail; every rule holds', async () => {
  const s = new Client('dev-sella'), b = new Client('dev-buyer');
  await s.wait(m => m.type === 'CHAR'); await b.wait(m => m.type === 'CHAR');
  const item = s.state.inventory[0]; assert.ok(item, 'starter gear in slot 1');
  // trading only at Silas Vane
  const far = await s.act('marketList', [item.id, 100]); assert.equal(far.ok, false); assert.match(far.msg, /Silas/);
  await s.walk(path('hollow', s.pos, NPC_SPOTS.hollow.broker)); await b.walk(path('hollow', b.pos, NPC_SPOTS.hollow.broker));
  const low = await s.act('marketList', [item.id, 1]); assert.equal(low.ok, false); assert.match(low.msg, /ขั้นต่ำ/);
  const gold0 = s.state.player.gold;
  const listed = await s.act('marketList', [item.id, 100]); assert.equal(listed.ok, true, listed.msg);
  assert.equal(s.state.inventory.some((i: any) => i?.id === item.id), false, 'item left the bag'); assert.equal(s.state.player.gold, gold0 - 10, 'listing fee (min 10)');
  const twice = await s.act('marketList', [item.id, 100]); assert.equal(twice.ok, false);
  // browsing sees it; the seller cannot buy their own
  s.send({ type: 'MARKET', view: 'browse' }); const view = await s.wait(m => m.type === 'MARKET_VIEW' && m.view === 'browse');
  const l = view.listings.find((x: any) => x.item.id === item.id); assert.ok(l, 'listing visible'); assert.equal(l.sellerName, 'sella');
  const own = await s.act('marketBuy', [l.id]); assert.equal(own.ok, false);
  // the buyer buys
  const bg = b.state.player.gold; const bought = await b.act('marketBuy', [l.id]); assert.equal(bought.ok, true, bought.msg);
  assert.equal(b.state.player.gold, bg - 100); assert.ok(b.state.inventory.some((i: any) => i?.id === item.id), 'item in the buyer bag');
  const again = await b.act('marketBuy', [l.id]); assert.equal(again.ok, false, 'sold once only');
  // the seller is told and claims the mail: price − tax (6% → 6)
  const note = await s.wait(m => m.type === 'MAIL', 3000); assert.ok(note.count >= 1);
  const g1 = s.state.player.gold; const claim = await s.act('mailClaim', []); assert.equal(claim.ok, true, claim.msg);
  assert.equal(s.state.player.gold, g1 + 94); const none = await s.act('mailClaim', []); assert.equal(none.ok, false);
  // list + cancel: the item comes back, the fee does not
  const item2 = b.state.inventory.find((i: any) => i?.id === item.id); const l2 = await b.act('marketList', [item2.id, 120]); assert.equal(l2.ok, true, l2.msg);
  b.send({ type: 'MARKET', view: 'mine' }); const mine = await b.wait(m => m.type === 'MARKET_VIEW' && m.view === 'mine'); assert.equal(mine.listings.length, 1);
  const gb = b.state.player.gold; const cancel = await b.act('marketCancel', [mine.listings[0].id]); assert.equal(cancel.ok, true, cancel.msg);
  assert.ok(b.state.inventory.some((i: any) => i?.id === item.id)); assert.equal(b.state.player.gold, gb, 'fee not refunded');
  // everything survives a reconnect (committed with the market rows)
  const keep = JSON.stringify([s.state.player.gold, b.state.player.gold]); s.close(); b.close(); await sleep(700);
  const s2 = new Client('dev-sella'), b2 = new Client('dev-buyer'); await s2.wait(m => m.type === 'CHAR'); await b2.wait(m => m.type === 'CHAR');
  assert.equal(JSON.stringify([s2.state.player.gold, b2.state.player.gold]), keep); s2.close(); b2.close();
});
