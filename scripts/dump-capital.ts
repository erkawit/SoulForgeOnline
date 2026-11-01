// Dump a capital's layout (pieces, roads, NPC spots, gates) to JSON for the Blender blockout (blender/city/blockout_city.py)
import { writeFileSync, mkdirSync } from 'node:fs';
import { CAPITAL_PIECES, CAPITAL_HALF, CAPITAL_WALK, GATE_POS, GATE_D, PLAZA_R, ROAD_W, CITY_SCALE, onRoad, gateArrival, GATE_DIRS, CAPITAL_SPAWNS, ISO_YAW } from '../src/game/world/capitalPlan';
import { npcsIn, npcPosition } from '../src/game/npcs';
const city = (process.argv[2] ?? 'hollow') as 'hollow' | 'dawnveil' | 'thornwatch';
const step = 0.5, lim = Math.ceil(CAPITAL_HALF + 4), n = Math.round((2 * lim) / step) + 1;
const road: number[] = [];
for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) road.push(onRoad(-lim + i * step, -lim + j * step) ? 1 : 0);
const out = {
  city, CAPITAL_HALF, CAPITAL_WALK, GATE_D, PLAZA_R, ROAD_W, CITY_SCALE, ISO_YAW,
  gates: GATE_DIRS.map(d => ({ dir: d, pos: GATE_POS[d], arrival: gateArrival(city, d) })),
  spawns: CAPITAL_SPAWNS,
  pieces: CAPITAL_PIECES[city],
  npcs: npcsIn(city).map(x => ({ id: x.id, pos: npcPosition(x, city) })),
  roadGrid: { lim, step, n, data: road.join('') },
};
mkdirSync('../output/city-blockout', { recursive: true });
writeFileSync(`../output/city-blockout/${city}.layout.json`, JSON.stringify(out));
console.log('pieces', out.pieces.length, 'npcs', out.npcs.length, 'grid', n);
