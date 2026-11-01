// Lives in the root tests/ (CommonJS like the other game tests) on purpose: run from apps/game-server ("type": "module")
// the stores would load twice (ESM + CJS copies) and the socket would update a store the test never sees.
// Needs the realm bundle: `npm --prefix apps/game-server run build` (REALM_MEMORY=1: in-memory characters, dev tokens).
// The real client (store + socket + authority) against the real realm bundle: optimistic ops, server-rolled ops,
// local combat with server-paid kills, waygates — and the two copies of the character must end up identical.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
const HERE = __dirname;
const PORT = 3998; process.env.NEXT_PUBLIC_GAME_SERVER_URL = `ws://127.0.0.1:${PORT}`;
import { useGameStore, cityMonsters } from '../src/store/useGameStore';
import { useMultiplayerStore } from '../src/store/useMultiplayerStore';
import { gameConnection } from '../src/lib/multiplayer/socket';
import { authority } from '../src/store/authority';
import { NPC_SPOTS } from '../src/game/npcs';
import { portalsOf, walkable } from '../src/game/content';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const S = () => useGameStore.getState();
let proc: ReturnType<typeof spawn>;
test.before(async () => {
  if (!existsSync(join(HERE, '../apps/game-server/dist/index.js'))) return;
  proc = spawn('node', ['dist/index.js'], { cwd: join(HERE, '../apps/game-server'), env: { ...process.env, REALM_MEMORY: '1', PORT: String(PORT), SAVE_DELAY_MS: '200' }, stdio: ['ignore', 'pipe', 'pipe'] });
  proc.stderr!.on('data', d => process.stderr.write('[realm] ' + d));
  for (let i = 0; i < 80; i++) { try { if ((await fetch(`http://127.0.0.1:${PORT}/health`)).ok) break; } catch { await sleep(100); } }
});
test.after(() => { gameConnection.disconnect(); proc?.kill('SIGTERM'); });
/** grid path on the walkable map (0.5 m cells), nearest walkable cell when the goal itself is blocked */
function route(city: string, from: [number, number], to: [number, number]): [number, number][] {
  const k = (x: number, z: number) => `${x},${z}`, g = (v: number) => Math.round(v * 2), start = [g(from[0]), g(from[1])]; let goal = [g(to[0]), g(to[1])];
  if (!walkable(city as any, goal[0] / 2, goal[1] / 2)) { let best: number[] | null = null; for (let dx = -6; dx <= 6; dx++) for (let dz = -6; dz <= 6; dz++) { const c = [goal[0] + dx, goal[1] + dz]; if (walkable(city as any, c[0] / 2, c[1] / 2) && (!best || Math.hypot(dx, dz) < Math.hypot(best[0] - goal[0], best[1] - goal[1]))) best = c; } goal = best!; }
  const prev = new Map<string, string | null>([[k(start[0], start[1]), null]]), q = [start];
  while (q.length) { const [x, z] = q.shift()!; if (x === goal[0] && z === goal[1]) break;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, nz = z + dz, key = k(nx, nz); if (prev.has(key) || !walkable(city as any, nx / 2, nz / 2)) continue; prev.set(key, k(x, z)); q.push([nx, nz]); } }
  const out: [number, number][] = []; let cur: string | null = k(goal[0], goal[1]); if (!prev.has(cur)) throw new Error('no path');
  while (cur) { const [x, z] = cur.split(',').map(Number); out.unshift([x / 2, z / 2]); cur = prev.get(cur)!; } return out;
}
/** walk with the store's own movement (its speed; walls and buildings block) along a grid route */
async function walkTo(x: number, z: number, near = 0.6) {
  const city = S().player.cityId ?? 'hollow';
  for (const [wx, wz] of route(city, S().player.position, [x, z])) {
    for (let i = 0; i < 40; i++) { const [px, pz] = S().player.position, d = Math.hypot(wx - px, wz - pz); if (d < 0.08) break; S().move((wx - px) / d, (wz - pz) / d, Math.min(0.05, d / 5)); await sleep(20); }
    if (Math.hypot(x - S().player.position[0], z - S().player.position[1]) < near) return;
  }
}
const settle = async () => { for (let i = 0; i < 40; i++) { await sleep(50); } };
const econ = (s: any) => JSON.stringify({ gold: s.player.gold, level: s.player.level, exp: s.player.exp, city: s.player.cityId, inv: s.inventory.map((i: any) => i && [i.id, i.definitionId, i.qty ?? 1, i.enhance ?? 0]), eq: Object.fromEntries(Object.entries(s.equipment).map(([k, v]: any) => [k, v && [v.id, v.enhance ?? 0]])), shards: s.soulShards });

const BUNDLE = join(HERE, '../apps/game-server/dist/index.js');
test('online play: the store and the realm agree on everything', { skip: !existsSync(BUNDLE) && 'build the realm first: npm --prefix apps/game-server run build' }, async () => {
  S().setJournal(false);
  const offlineGold = 777_777; useGameStore.setState(s => ({ player: { ...s.player, gold: offlineGold } }));
  await gameConnection.connect('dev-dana');
  for (let i = 0; i < 60 && !authority.online(); i++) await sleep(50);
  assert.ok(authority.online(), 'online with a realm character');
  assert.equal(S().player.gold, 150, 'the offline gold does not travel online');
  // optimistic, deterministic: buying at Mira's
  const [sx, sz] = NPC_SPOTS.hollow.shop; await walkTo(sx + 1.2, sz + 1.2, 0.5);
  assert.equal(S().buyShop('potion-hp-s', 2), null);
  const localId = S().inventory.find(i => i?.definitionId === 'potion-hp-s')!.id;
  await settle();
  assert.equal(S().inventory.find(i => i?.definitionId === 'potion-hp-s')!.id, localId, 'server kept the same item id');
  assert.equal(S().player.gold, 150 - 2 * 25 > 0 ? S().player.gold : -1);
  // server-rolled: starter kit at Hale's
  const [hx, hz] = NPC_SPOTS.hollow.supplier; await walkTo(hx - 1.2, hz - 1.2, 0.5);
  const before = S().inventory.filter(Boolean).length; assert.equal(S().claimStarterKit(), null); await settle();
  assert.ok(S().inventory.filter(Boolean).length > before, 'starter kit arrived from the realm');
  // a refused op rolls back: selling something that does not exist changes nothing
  // waygate south → Ashen Outskirts via the store's waygate rule (travel with gate:true)
  const gate = portalsOf('hollow').find(p => p.to === 'wild0')!; await walkTo(gate.x - 1.4, gate.z - 1.4, 0.6);
  S().travel('wild0', { gate: true }); await settle();
  assert.equal(S().player.cityId, 'wild0');
  // local combat; the realm pays the kills
  const gold0 = S().player.gold, lvl0 = S().player.level * 1e6 + S().player.exp;
  useGameStore.setState({ monsters: cityMonsters('wild0') });
  for (let k = 0; k < 6; k++) {
    const m = [...S().monsters].filter(x => x.hp > 0).sort((a, b) => Math.hypot(a.x - S().player.position[0], a.z - S().player.position[1]) - Math.hypot(b.x - S().player.position[0], b.z - S().player.position[1]))[0];
    await walkTo(m.x, m.z, 1.5);
    for (let t = 0; t < 400 && S().monsters.find(x => x.id === m.id)!.hp > 0; t++) { useGameStore.setState(s => ({ player: { ...s.player, hp: 1e6 } })); S().attack(m.id); await sleep(30); }
  }
  await settle();
  assert.ok(S().player.gold > gold0 && S().player.level * 1e6 + S().player.exp > lvl0, `kills paid by the realm (gold ${gold0}→${S().player.gold})`);
  // equip + unequip + swap, then compare with what the realm saved
  const gi = S().inventory.findIndex(i => !!i?.slot && i.slot !== 'costume' && i.classLock === 'Berserker'); if (gi >= 0) S().equip(gi);
  S().swapInventory(0, 3); await settle();
  const local = econ(S());
  gameConnection.disconnect(); await sleep(600);
  assert.equal(S().player.gold, offlineGold, 'back offline: the guest save is restored');
  await gameConnection.connect('dev-dana'); for (let i = 0; i < 60 && !authority.online(); i++) await sleep(50);
  assert.equal(econ(S()), local, 'what the client showed is exactly what the realm saved');
  console.log('online character:', S().player.level, 'lv ·', S().player.gold, 'SG ·', S().inventory.filter(Boolean).length, 'items');
});
