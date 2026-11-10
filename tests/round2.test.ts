import test from 'node:test';
import assert from 'node:assert/strict';
import { sorrowlandSpawns, spawnPoints } from '../src/game/spawns';
import { advanceMonster, ELITE_SIGNATURE } from '../src/game/monsterAI';
import { walkable, WORLD_LIMIT } from '../src/game/content';
import { buildHomeHtml, buildWikiHtml } from '../src/game/wiki/site';
import { VOICE_LINES } from '../src/game/audio/engine';
import { ZONES } from '../src/game/world/zones';
import type { Monster } from '../src/lib/types';

test('Sorrowlands (Ashen Outskirts, below Hollow Reach): every zone spawns a pack and an elite; the cathedral holds the boss; walkable to ±50', () => {
  const s = sorrowlandSpawns();
  for (const z of ZONES) assert.ok(s.some(p => p.elite && Math.hypot(p.position[0] - z.x, p.position[1] - z.z) < z.radius + 4), z.id);
  assert.equal(s.filter(p => p.boss).length, 1);
  assert.ok(spawnPoints('wild0').length > s.length);
  assert.equal(new Set(spawnPoints('wild0').map(p => p.id)).size, spawnPoints('wild0').length);
  assert.ok(walkable('wild0', 0, 38) || walkable('wild0', 3, 30)); // the road south leads to Shadowtear Cave
  assert.equal(walkable('wild0', 0, WORLD_LIMIT.wild0!+1), false); assert.equal(walkable('dawnveil', 0, WORLD_LIMIT.dawnveil!+1), false);
});

test('elites telegraph their signature skill, then it lands with the skill multiplier', () => {
  const m: Monster = { id: 'e', name: 'Crypt Crawler', x: 0, z: 30, home: [0, 30], hp: 900, maxHp: 900, level: 6, elite: true, respawnAt: null, lastAttack: 0 } as Monster;
  const t0 = 1_000_000; const a = advanceMonster(m, [1, 30], 'wild0', t0, 0).monster; // first sighting arms the timer
  const b = advanceMonster(a, [1, 30], 'wild0', t0 + 3000, 0).monster;
  assert.equal(b.telegraph?.kind, 'skill'); assert.equal(b.telegraph?.name, ELITE_SIGNATURE['Crypt Crawler'].name);
  const hit = advanceMonster(b, [1, 30], 'wild0', t0 + 3000 + ELITE_SIGNATURE['Crypt Crawler'].windup + 1, 0);
  assert.ok(hit.damage > 0); assert.equal(hit.monster.telegraph, undefined);
});

test('website: home has the central play button; the wiki has monsters with stats, elite skills and boss lore', () => {
  const home = buildHomeHtml({ gameUrl: '/play' }), wiki = buildWikiHtml({ gameUrl: '/play' });
  assert.match(home, /class="big-play" href="\/play"/); assert.doesNotMatch(home, /class="play-btn"/); assert.match(home, /เข้าเกม/);
  for (const line of Object.values(VOICE_LINES)) assert.ok(home.includes(line));
  for (const id of ['guide', 'quests', 'map', 'monsters', 'elites', 'bosses', 'dashboard', 'craft', 'auto']) assert.ok(wiki.includes(`id="${id}"`), id);
  assert.match(wiki, /HP<b>/); assert.match(wiki, /ATK<b>/); assert.match(wiki, /DEF<b>/); assert.match(wiki, /MP<b>/);
  assert.match(wiki, /สกิล: Burrow Ambush/); assert.match(wiki, /ไม่เปิดเผยค่าพลัง/); assert.match(wiki, /50%/);
});
