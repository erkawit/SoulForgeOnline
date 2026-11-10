// Deterministic nature layout per city / zone: trees, rocks, bushes and where grass may grow.
// The same seed gives the same world on every client and on the server, so colliders always agree.
import { onFieldRoad } from './fieldDimensions';
import {farmScenery} from './farmScenery';
import { navigationSurface } from './terrainNavigation';
import { ZONES } from './zones';
import { CITIES, CAPITAL_WALLS, WORLD_LIMIT, portalsOf, type CityId } from '../content';
import type { Collider } from './colliders';
import { CAPITAL_PIECES, CAPITAL_WALK, inCanal, onRoad } from './capitalPlan';

export type TreeKind = 'oak' | 'pine' | 'dead' | 'cypress' | 'mushroom' | 'crystal';
export type Prop = { x: number; z: number; s: number; rot: number; kind: TreeKind; tint: number };
export type Rock = { x: number; z: number; s: number; rot: number; tall: boolean };
export type Bush = { x: number; z: number; s: number; tint: number };
export type GrassSpec = { density: number; colorA: string; colorB: string; height: number; flowers: string[] };
export type NatureLayout = { city: CityId; trees: Prop[]; backdrop: Prop[]; rocks: Rock[]; bushes: Bush[]; grass: GrassSpec; colliders: Collider[]; allowGrass: (x: number, z: number) => boolean; palette: { leaf: string[]; bark: string; rock: string; glow?: string } };

function rng(seed: string) { let h = 1779033703 ^ seed.length; for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; }; }

type BiomeDef = { kinds: TreeKind[]; trees: number; rocks: number; bushes: number; grass: GrassSpec; leaf: string[]; bark: string; rock: string; glow?: string };
const G = (density: number, colorA: string, colorB: string, height = 0.32, flowers: string[] = []): GrassSpec => ({ density, colorA, colorB, height, flowers });
const BIOMES: Record<string, BiomeDef> = {
  hollow:     { kinds: ['dead', 'oak'], trees: 14, rocks: 10, bushes: 16, grass: G(0.6, '#3d4d34', '#94a55e', 0.32, ['#9b7fd6', '#d9d2c0']), leaf: ['#3d4a33', '#2f3d2c', '#55603d'], bark: '#3b3029', rock: '#5d5a5f' },
  dawnveil:   { kinds: ['cypress', 'oak'], trees: 16, rocks: 6, bushes: 20, grass: G(0.7, '#3d5a35', '#9cb36a', 0.3, ['#f2d27a', '#e8e1d0', '#d98aa0']), leaf: ['#3f6b45', '#2f5a3c', '#5d8a4f'], bark: '#5a4636', rock: '#9e9a8c' },
  thornwatch: { kinds: ['oak', 'pine'], trees: 26, rocks: 10, bushes: 24, grass: G(0.9, '#2c4a2c', '#7ea152', 0.36, ['#e8c35a', '#b9d6f0']), leaf: ['#2f5537', '#3d6b3d', '#24442e'], bark: '#4a3a2c', rock: '#6e6553' },
  grave:      { kinds: ['dead'], trees: 22, rocks: 26, bushes: 10, grass: G(0.6, '#45452f', '#8f8a5c', 0.3, ['#7b66b0']), leaf: ['#3b3a2e', '#2c2b25'], bark: '#2e2824', rock: '#6f6d72' },
  forest:     { kinds: ['pine', 'oak'], trees: 38, rocks: 14, bushes: 30, grass: G(1, '#244028', '#79a04e', 0.4, ['#e8c35a', '#f2f2e0']), leaf: ['#25472e', '#2f5a35', '#3e6e3a'], bark: '#47372a', rock: '#61614f' },
  water:      { kinds: ['oak', 'cypress'], trees: 20, rocks: 12, bushes: 18, grass: G(0.85, '#2a4a40', '#7fa07a', 0.45, ['#cfe8ff']), leaf: ['#2f5a4f', '#3e6e5c'], bark: '#4a4034', rock: '#6f7a78' },
  lava:       { kinds: ['dead', 'crystal'], trees: 18, rocks: 30, bushes: 0, grass: G(0.12, '#3a2a22', '#6b4a32', 0.2), leaf: ['#3a2a22'], bark: '#1e1714', rock: '#2f2826', glow: '#ff6a2a' },
  grove:      { kinds: ['mushroom', 'oak'], trees: 30, rocks: 10, bushes: 26, grass: G(0.9, '#1f3a44', '#5f9aa0', 0.38, ['#9fe6ff', '#c9a8ff']), leaf: ['#2a4e5c', '#3a6b72', '#4f8a8a'], bark: '#3a3340', rock: '#4f5866', glow: '#7fe6ff' },
  ice:        { kinds: ['pine', 'crystal'], trees: 22, rocks: 18, bushes: 6, grass: G(0.3, '#8fa8b8', '#e6f2f8', 0.22), leaf: ['#5f7f88', '#8fb2bb', '#c9dde3'], bark: '#4a4a52', rock: '#9fb4c0', glow: '#9fe6ff' },
  fortress:   { kinds: ['dead'], trees: 8, rocks: 26, bushes: 4, grass: G(0.2, '#2e2a26', '#5a5040', 0.22), leaf: ['#2e2a26'], bark: '#211b18', rock: '#3a3638', glow: '#ff8a3a' },
  poison:     { kinds: ['mushroom', 'dead'], trees: 28, rocks: 12, bushes: 24, grass: G(0.8, '#2a3a1e', '#7a9a2e', 0.34, ['#b6ff5a', '#c78aff']), leaf: ['#4a3a5a', '#6a4a7a', '#3a5a2a'], bark: '#2e2630', rock: '#4a4450', glow: '#b6ff5a' },
  astral:     { kinds: ['crystal', 'cypress'], trees: 20, rocks: 14, bushes: 10, grass: G(0.4, '#2a2a4a', '#7a7ab8', 0.3, ['#e8d8ff']), leaf: ['#3a3a6a', '#5a5a9a'], bark: '#3a3448', rock: '#5a5a78', glow: '#c9a8ff' },
  eclipse:    { kinds: ['crystal', 'dead'], trees: 16, rocks: 24, bushes: 0, grass: G(0.15, '#2a1e2e', '#5a3a5e', 0.22), leaf: ['#3a2440'], bark: '#1a141e', rock: '#2e2434', glow: '#c94aff' },
};

export function natureLayout(city: CityId): NatureLayout {
  const c = CITIES[city], capital = !c.parent, biome = capital ? city : c.biome ?? 'forest';
  const base = BIOMES[biome] ?? BIOMES.forest;
  const themes:Record<string,Partial<BiomeDef>>={
    wild1:{kinds:['dead'],leaf:['#4b4541'],rock:'#a09880'},
    wild2:{kinds:['dead','cypress'],leaf:['#253d35'],rock:'#53635a'},
    wild3:{kinds:['crystal','dead'],leaf:['#285746'],glow:'#479d70',rock:'#414941'},
    wild4:{kinds:['dead','cypress'],leaf:['#384032'],glow:'#648779'},
    wild5:{kinds:['dead'],leaf:['#45424c'],rock:'#69646d',glow:'#9990b1'},
    wild6:{kinds:['dead'],rock:'#4a5758',glow:'#547f79'},
    wild7:{kinds:['dead'],leaf:['#463d33'],rock:'#62594c',glow:'#76634c'},
    wild8:{kinds:['dead'],leaf:['#482d35'],rock:'#4c3541',glow:'#9a3e50'},
    wild9:{kinds:['dead'],leaf:['#3d3431'],rock:'#5b5049',glow:'#6d5249'},
    dungeon1:{kinds:['crystal'],leaf:['#285746'],glow:'#479d70'},
    dungeon2:{kinds:['dead'],leaf:['#464150'],rock:'#69616c',glow:'#8e82b0'},
    dungeon3:{kinds:['dead','crystal'],leaf:['#442b25'],rock:'#3a2928',glow:'#b55132'},
  };
  const def={...base,...themes[city]},r = rng('soulforge:' + city);
  if (capital) { // the capitals are dressed by their painted kit (world/capitalPlan.ts): grass only where the map has soil
    const pieces = CAPITAL_PIECES[city as 'hollow' | 'dawnveil' | 'thornwatch'];
    const allowGrass = (x: number, z: number) => Math.abs(x) < CAPITAL_WALK - 0.8 && Math.abs(z) < CAPITAL_WALK - 0.8 && !onRoad(x, z) && !inCanal(city, x, z)
      && pieces.every(p => Math.hypot(x - p.x, z - p.z) > p.r + 1.3);
    return { city, trees: [], backdrop: [], rocks: [], bushes: [], colliders: [], grass: { ...def.grass, density: def.grass.density * (city === 'thornwatch' ? 0.9 : 0.45) }, allowGrass,
      palette: { leaf: def.leaf, bark: def.bark, rock: def.rock, glow: def.glow } };
  }
  const lim = WORLD_LIMIT[city] ?? 23;
  const density = Math.min(4, (lim / 23) ** 2);
  const hunt = c.hunt, walls = CAPITAL_WALLS[city] ?? [];
  const portals: [number, number][] = portalsOf(city).map(p => [p.x, p.z]);
  const onPath = (x: number, z: number) => onFieldRoad(city,x,z);
  const props: { x: number; z: number; hw: number; hd: number }[] = [];
  const onProp = (x: number, z: number, m: number) => props.some(b => Math.abs(x - b.x) < b.hw + m && Math.abs(z - b.z) < b.hd + m);
  const free = (x: number, z: number, m: number) => !onProp(x, z, m) && !(!!c.water && Math.abs(x - c.water.x) < c.water.w / 2 + 0.8 + m) && !hunt.some(([hx, hz]) => Math.hypot(x - hx, z - hz) < 4 + m);
  const excluded = (x: number, z: number, m: number) =>
    farmScenery(city).some(p=>Math.hypot(x-p.x,z-p.z)<p.radius+1+m)||
    Math.abs(x) > lim-.6 || Math.abs(z) > lim-.6 || Math.hypot(x, z) < 4 + m || onProp(x, z, m) ||
    navigationSurface(city,x,z)==='blocked' ||
    c.buildings.some(b => Math.abs(x - b.x) < b.w / 2 + 1 + m && Math.abs(z - b.z) < b.d / 2 + 1 + m) ||
    walls.some(b => Math.abs(x - b.x) < b.w / 2 + 0.8 + m && Math.abs(z - b.z) < b.d / 2 + 0.8 + m) ||
    (!!c.water && Math.abs(x - c.water.x) < c.water.w / 2 + 0.8 + m) ||
    hunt.some(([hx, hz]) => Math.hypot(x - hx, z - hz) < 8 + m) || portals.some(([px, pz]) => Math.hypot(x - px, z - pz) < 8 + m);
  const trees: Prop[] = [], rocks: Rock[] = [], bushes: Bush[] = [], colliders: Collider[] = [];
  const place = (n: number, minGap: number, ok: (x: number, z: number) => boolean, put: (x: number, z: number) => void) => {
    let tries = 0, made = 0; const pts: [number, number][] = [];
    while (made < n && tries++ < n * 60) {
      const x = (r() * 2 - 1) * (lim-1), z = (r() * 2 - 1) * (lim-1);
      if (!ok(x, z) || pts.some(([a, b]) => Math.hypot(a - x, b - z) < minGap)) continue;
      pts.push([x, z]); put(x, z); made++;
    }
  };
  place(Math.round(def.trees*density), 2.6, (x, z) => !excluded(x, z, 0.4) && !onPath(x, z), (x, z) => {
    const kind = def.kinds[Math.floor(r() * def.kinds.length)], s = 0.85 + r() * 0.5;
    trees.push({ x, z, s, rot: r() * Math.PI * 2, kind, tint: r() });
    colliders.push({ kind: 'circle', x, z, r: kind === 'crystal' ? 0.5 * s : kind === 'mushroom' ? 0.35 * s : 0.32 * s });
  });
  place(Math.round(def.rocks*density), 1.4, (x, z) => !excluded(x, z, 0) && !onPath(x, z), (x, z) => {
    const s = 0.3 + r() * (biome === 'grave' ? 0.4 : 0.7), tall = biome === 'grave' && r() < 0.55;
    rocks.push({ x, z, s, rot: r() * Math.PI * 2, tall });
    colliders.push(tall ? { kind: 'box', x, z, hw: 0.32 * s * 1.6, hd: 0.12 * s * 1.6, rot: rocks.at(-1)!.rot } : { kind: 'circle', x, z, r: s * 0.75 });
  });
  place(Math.round(def.bushes*density), 1.2, (x, z) => !excluded(x, z, -0.6) && !onPath(x, z), (x, z) => bushes.push({ x, z, s: 0.45 + r() * 0.45, tint: r() }));
  // outskirts of Dawnveil / Thornwatch (±50, see citySprites.ts): woods and boulders off the roads, clear of farms, camps and
  // the hunting grounds; Hollow's outskirts are the Sorrowlands (world/ruins.ts)
  const outskirts = capital && lim > 23 && city !== 'hollow';
  if (outskirts) {
    const ring = (n: number, gap: number, put: (x: number, z: number) => void) => { let tries = 0, made = 0; const pts: [number, number][] = [];
      while (made < n && tries++ < n * 80) { const x = (r() * 2 - 1) * (lim - 1.5), z = (r() * 2 - 1) * (lim - 1.5);
        if (Math.max(Math.abs(x), Math.abs(z)) < 26 || Math.abs(x) < 3.4 || Math.abs(z) < 3.4 || !free(x, z, 0.4) || pts.some(([a, b]) => Math.hypot(a - x, b - z) < gap)) continue;
        pts.push([x, z]); put(x, z); made++; } };
    ring(def.trees * 3, 3.6, (x, z) => { const kind = def.kinds[Math.floor(r() * def.kinds.length)], s = 0.95 + r() * 0.6;
      trees.push({ x, z, s, rot: r() * Math.PI * 2, kind, tint: r() }); colliders.push({ kind: 'circle', x, z, r: 0.34 * s }); });
    ring(def.rocks * 2, 2.4, (x, z) => { const s = 0.35 + r() * 0.8; rocks.push({ x, z, s, rot: r() * Math.PI * 2, tall: false }); if (s > 0.45) colliders.push({ kind: 'circle', x, z, r: s * 0.75 }); });
    ring(def.bushes * 2, 1.6, (x, z) => bushes.push({ x, z, s: 0.5 + r() * 0.5, tint: r() }));
  }
  const backdrop: Prop[] = [];
  if (outskirts) for (let i = 0; i < 120; i++) { // a wood just past the edge of the map, all the way round
    const t = (i / 120) * 4, side = Math.floor(t), f = (t - side) * 2 - 1, d = lim + 3 + r() * 7, along = f * (lim + 8);
    const [x, z] = side === 0 ? [along, -d] : side === 1 ? [d, along] : side === 2 ? [-along, d] : [-d, -along];
    backdrop.push({ x, z, s: 1.3 + r() * 0.9, rot: r() * 6.28, kind: def.kinds[i % def.kinds.length], tint: r() });
  } else for (let i = 0; i < 46; i++) {
    const a = (i / 46) * Math.PI * 2 + r() * 0.1;
    const d = (lim+3+r()*6)/Math.max(Math.abs(Math.cos(a)),Math.abs(Math.sin(a)));
    backdrop.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, s: 1.1 + r() * 0.8, rot: r() * 6.28, kind: def.kinds[i % def.kinds.length], tint: r() });
  }
  return { city, trees, backdrop, rocks, bushes, colliders, grass: def.grass, palette: { leaf: def.leaf, bark: def.bark, rock: def.rock, glow: def.glow },
    allowGrass: (x, z) => navigationSurface(city,x,z)!=='blocked' && !excluded(x, z, -1.4) && !(capital && onPath(x, z)) && !onPath(x,z) };
}
