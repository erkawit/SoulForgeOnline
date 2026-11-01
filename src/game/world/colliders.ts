// Static collision for world props (trees, rocks, fences, statues). Pure data — used by walkable() for the player,
// monsters and NPC walkers, and by the game server later. Circles for round props, oriented boxes for walls.
export type Collider = { kind: 'circle'; x: number; z: number; r: number } | { kind: 'box'; x: number; z: number; hw: number; hd: number; rot?: number };
const registry = new Map<string, { list: Collider[]; grid: Map<number, Collider[]> }>();
const CELL = 4, key = (cx: number, cz: number) => (cx + 64) * 256 + (cz + 64);

/** Bounds are padded by the largest body radius we query with, so a point lookup in one cell never misses a neighbour. */
const MAX_BODY = 1.2;
function bounds(c: Collider) { const r = (c.kind === 'circle' ? c.r : Math.hypot(c.hw, c.hd)) + MAX_BODY; return [c.x - r, c.z - r, c.x + r, c.z + r]; }
export function setColliders(city: string, list: Collider[]) {
  const grid = new Map<number, Collider[]>();
  for (const c of list) {
    const [x0, z0, x1, z1] = bounds(c);
    for (let cx = Math.floor(x0 / CELL); cx <= Math.floor(x1 / CELL); cx++) for (let cz = Math.floor(z0 / CELL); cz <= Math.floor(z1 / CELL); cz++) {
      const k = key(cx, cz); (grid.get(k) ?? grid.set(k, []).get(k)!).push(c);
    }
  }
  registry.set(city, { list, grid });
}
export const collidersOf = (city: string) => registry.get(city)?.list ?? [];
/** Lazily builds a city's colliders the first time it is queried (see world/registry.ts). */
let provider: ((city: string) => Collider[]) | null = null;
export function setColliderProvider(fn: (city: string) => Collider[]) { provider = fn; }

function hit(c: Collider, x: number, z: number, r: number) {
  // box: world → local is the inverse of three's rotation.y (x' = x·cos + z·sin, z' = −x·sin + z·cos)
  if (c.kind === 'circle') return (x - c.x) ** 2 + (z - c.z) ** 2 < (c.r + r) ** 2;
  const a = c.rot ?? 0, dx = x - c.x, dz = z - c.z, lx = dx * Math.cos(a) - dz * Math.sin(a), lz = dx * Math.sin(a) + dz * Math.cos(a);
  const qx = Math.max(Math.abs(lx) - c.hw, 0), qz = Math.max(Math.abs(lz) - c.hd, 0);
  return qx * qx + qz * qz < r * r;
}
/** Does a body of radius r at (x, z) overlap any registered prop? */
export function blockedByProps(city: string, x: number, z: number, r = 0.35) {
  if (!registry.has(city) && provider) setColliders(city, provider(city));
  const g = registry.get(city)?.grid; if (!g) return false;
  const cs = g.get(key(Math.floor(x / CELL), Math.floor(z / CELL))); if (!cs) return false;
  return cs.some(c => hit(c, x, z, r));
}
/** Move with sliding: full step, then each axis, then a nudge along the obstacle's tangent. */
export function slide(blocked: (x: number, z: number) => boolean, from: [number, number], to: [number, number]): [number, number] {
  if (!blocked(to[0], to[1])) return to;
  if (!blocked(to[0], from[1])) return [to[0], from[1]];
  if (!blocked(from[0], to[1])) return [from[0], to[1]];
  const dx = to[0] - from[0], dz = to[1] - from[1];
  for (const s of [1, -1]) { const tx = from[0] - dz * s * .7, tz = from[1] + dx * s * .7; if (!blocked(tx, tz)) return [tx, tz]; }
  return from;
}
