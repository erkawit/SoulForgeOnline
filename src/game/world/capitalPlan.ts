// The three capitals laid out after the painted city maps in reference/compact-cast-v2/mmorpg-world-assets
// (cities/<city>/maps/city.png): a walled square seen corner-on, a waygate in each corner, the compass plaza in the middle
// and the nine service buildings (each with its sign) in the same places as on the map. Pure data — the renderer is
// world/capitalKit.ts, the server and walkable() only need the colliders, the gates and the NPC spots below.
//
// Map ↔ world: the default camera looks from +x +z (yaw 45°), so the square's corners are the map's top / left / right /
// bottom tips. Each map is calibrated by its plaza centre (u, v) and the four waygates (a = ±1 left / right,
// b = ±1 top / bottom), and a waygate sits at (±GATE_D, ±GATE_D):  x = GATE_D·(a + b),  z = GATE_D·(b − a).
// Positions were read off the maps (footprint centre of each building, its width on the map and which way its sign faces
// on the map); docs/WORLD_LINKS_TH.md lists them.
import type { CityId, MainCityId } from '../content';
import type { Collider } from './colliders';

export type GateDir = 'top' | 'bottom' | 'left' | 'right';
export const GATE_DIRS: GateDir[] = ['top', 'right', 'bottom', 'left'];
export const OPPOSITE: Record<GateDir, GateDir> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
/** where a building's front faces on the map (screen directions at the default camera) */
export type ScreenFace = 'S' | 'SW' | 'W' | 'NW' | 'N' | 'NE' | 'E' | 'SE';
const VIEW_OF: Record<ScreenFace, number> = { S: 0, SW: 1, W: 2, NW: 3, N: 4, NE: 5, E: 6, SE: 7 };
/** camera yaw of the default view (camera at +x +z, atan2(x, z)) */
export const ISO_YAW = Math.PI / 4;
/** world yaw (atan2 convention) of a piece whose front faces `f` on screen at the default camera */
export const faceYaw = (f: ScreenFace) => ISO_YAW - VIEW_OF[f] * Math.PI / 4;
/** Which of the eight painted views to show. The sheets turn the piece so its front faces screen S, SW, W, NW, N, NE, E, SE
 *  (view 0…7); a piece facing yaw F seen by a camera at yaw C shows its front turned by C − F. */
export function viewIndex(camYaw: number, facing: number) { const d = Math.round((camYaw - facing) / (Math.PI / 4)); return ((d % 8) + 8) % 8; }

/** Round 13: the capitals are laid out at a larger scale so crowds fit (output/city-maps-codex/CITY_PLAN_TH.md):
 *  the buildings keep their size, the blocks spread out, the plaza and the roads widen and the new space
 *  between the blocks is dressed with the city's own trees, lamps and crates (districts) until the filler houses ship. */
export const CITY_SCALE = 2.5;
const BASE_GATE_D = 27;
/** the wall line, the inner face of the walls (walkable limit) and the waygate points */
export const CAPITAL_HALF = 29.5 * CITY_SCALE, CAPITAL_WALK = 28 * CITY_SCALE, GATE_D = BASE_GATE_D * CITY_SCALE;
/** plaza radius, road half-widths (the old values × 1.6) */
export const PLAZA_R = 7.2 * 1.6, ROAD_W = 1.6;
export const GATE_POS: Record<GateDir, [number, number]> = { top: [-GATE_D, -GATE_D], bottom: [GATE_D, GATE_D], left: [-GATE_D, GATE_D], right: [GATE_D, -GATE_D] };
/** stepping this close to a waygate point warps */
export const GATE_TRIGGER = 2.2;

type Cal = { u: number; v: number; hw: number; hh: number };
/** plaza centre and half-distance between opposite waygates, in map units (0…1 of the map width / height) */
const CAL: Record<MainCityId, Cal> = {
  hollow: { u: 0.5, v: 0.49, hw: 0.46, hh: 0.43 },
  dawnveil: { u: 0.5, v: 0.475, hw: 0.445, hh: 0.435 },
  thornwatch: { u: 0.5, v: 0.465, hw: 0.44, hh: 0.425 },
};
export function mapToWorld(city: MainCityId, u: number, v: number): [number, number] {
  const c = CAL[city], a = (u - c.u) / c.hw, b = (v - c.v) / c.hh; return [GATE_D * (a + b), GATE_D * (b - a)];
}
export function worldToMap(city: MainCityId, x: number, z: number): [number, number] {
  const c = CAL[city], a = (x - z) / (2 * GATE_D), b = (x + z) / (2 * GATE_D); return [c.u + a * c.hw, c.v + b * c.hh];
}
/** a width measured on the map (fraction of the map width) as a world width on screen at the default camera */
const mapWidth = (city: MainCityId, du: number) => du / CAL[city].hw * Math.SQRT2 * BASE_GATE_D; // building sizes do not scale

export type Role = 'guide' | 'mentor' | 'merchant' | 'shop' | 'supplier' | 'buyer' | 'broker' | 'blessing' | 'warden';
export const ROLES: Role[] = ['guide', 'mentor', 'merchant', 'shop', 'supplier', 'buyer', 'broker', 'blessing', 'warden'];
/** the building of each role (sign on the map) — mmorpg-world-assets docs/README-TH.md */
export const ROLE_BUILDING: Record<Role, string> = {
  guide: 'สำนักนำทาง', mentor: 'สำนักฝึกและลานซ้อม', merchant: 'ร้านอาวุธและเกราะ', shop: 'ร้านขายของทั่วไป', supplier: 'คลังเสบียง',
  buyer: 'จุดรับซื้อและคัดแยก', broker: 'หอการค้า', blessing: 'วิหาร / ศาลาพร', warden: 'ป้อมยาม',
};

/** One painted piece in the world. `w` = its width on screen in the default view (world units), `r` = round collider,
 *  `depth` = how far toward the camera its billboard stands (the near edge of its footprint, so actors sort right),
 *  `under` = walked over (plaza, bridges): drawn below the actors without depth writes. */
export type KitPiece = { piece: string; x: number; z: number; facing: number; w: number; r: number; depth: number; under?: boolean; landmark?: string; description?: string; role?: Role; fade?: boolean };

type B = [Role, number, number, number, ScreenFace];
/** [role, u, v, map width, sign facing] read off cities/<city>/maps/city.png */
const BUILDINGS: Record<MainCityId, B[]> = {
  hollow: [
    ['blessing', 0.5, 0.19, 0.16, 'S'], ['merchant', 0.32, 0.29, 0.17, 'SE'], ['mentor', 0.655, 0.29, 0.16, 'SW'],
    ['guide', 0.32, 0.475, 0.13, 'S'], ['broker', 0.69, 0.48, 0.17, 'S'], ['buyer', 0.16, 0.49, 0.14, 'S'],
    ['shop', 0.32, 0.635, 0.17, 'S'], ['supplier', 0.67, 0.645, 0.18, 'S'], ['warden', 0.5, 0.745, 0.17, 'S'],
  ],
  dawnveil: [
    // the book sign (top-left) is the training hall, crossed sword and arrow (top-right) the arms dealer
    ['blessing', 0.5, 0.18, 0.16, 'S'], ['mentor', 0.32, 0.29, 0.16, 'SE'], ['merchant', 0.69, 0.28, 0.15, 'SW'],
    ['guide', 0.345, 0.46, 0.11, 'S'], ['broker', 0.65, 0.46, 0.14, 'S'], ['buyer', 0.175, 0.47, 0.13, 'S'],
    ['shop', 0.335, 0.62, 0.14, 'S'], ['supplier', 0.665, 0.63, 0.15, 'S'], ['warden', 0.5, 0.73, 0.15, 'S'],
  ],
  thornwatch: [
    ['blessing', 0.5, 0.18, 0.11, 'S'], ['merchant', 0.35, 0.29, 0.16, 'SE'], ['mentor', 0.68, 0.28, 0.16, 'SW'],
    ['guide', 0.37, 0.465, 0.12, 'S'], ['broker', 0.635, 0.46, 0.13, 'S'], ['buyer', 0.19, 0.46, 0.15, 'S'],
    ['shop', 0.32, 0.61, 0.17, 'S'], ['supplier', 0.68, 0.61, 0.2, 'S'], ['warden', 0.5, 0.73, 0.15, 'S'],
  ],
};
/** Which painted sheet shows each role's building. Thornwatch's sheets carry another role's sign (its "shop" sheet is the
 *  portal shrine, "blessing" has the scales…), so they are matched by the sign they show to the sign on the city map. */
export const ART_OF: Record<MainCityId, Partial<Record<Role, string>>> = {
  hollow: {}, dawnveil: {},
  thornwatch: { blessing: 'shop', shop: 'supplier', supplier: 'buyer', broker: 'blessing', buyer: 'broker' },
};
/** footprint radius / billboard depth as a share of the on-screen width */
const FOOT = 0.33, DEPTH = 0.3;

function building(city: MainCityId, [role, u, v, du, face]: B): KitPiece {
  const [x, z] = mapToWorld(city, u, v), w = mapWidth(city, du);
  return { piece: ART_OF[city][role] ?? role, role, x: round(x), z: round(z), facing: faceYaw(face), w: round(w), r: round(w * FOOT), depth: round(w * DEPTH) };
}
const round = (n: number) => Math.round(n * 100) / 100;
const piece = (p: string, x: number, z: number, facing: number, w: number, r = 0, extra: Partial<KitPiece> = {}): KitPiece => ({ piece: p, x, z, facing, w, r, depth: r || w * 0.2, ...extra });
const yawTo = (x: number, z: number, tx: number, tz: number) => Math.atan2(tx - x, tz - z);

/** everything except the walls (capitalKit.ts builds those along CAPITAL_HALF) */
function plan(city: MainCityId): KitPiece[] {
  const out: KitPiece[] = BUILDINGS[city].map(b => building(city, b));
  // the compass plaza (walked over); Dawnveil's has the angel statue in the middle
  { const w = (city === 'dawnveil' ? 12.5 : 11.5) * 1.6; out.push(piece('plaza', 0, 0, ISO_YAW, w, 0, { under: true, depth: w * 0.42 })); }
  // waygates: Hollow and Dawnveil have the gate arch, Thornwatch closes each corner with the root wall and its watch huts
  for (const d of GATE_DIRS) {
    const [gx, gz] = GATE_POS[d], s = 1.06, x = gx * s, z = gz * s, inward = yawTo(x, z, 0, 0);
    out.push(city === 'thornwatch' ? piece('corner', x * 1.02, z * 1.02, inward + Math.PI, 11, 0, { depth: 1.5, fade: true }) : piece('gate', x, z, inward, 9.5, 0, { depth: 1.2, fade: true }));
  }
  // lamps along the four roads to the gates, both sides, between the plaza and the gate (clear of the ring road)
  for (const d of GATE_DIRS) {
    const [gx, gz] = GATE_POS[d], ux = gx / GATE_D / Math.SQRT2, uz = gz / GATE_D / Math.SQRT2; // unit along the road
    for (let t = PLAZA_R + 3; t < GATE_D * Math.SQRT2 - 8; t += 9.5) for (const s of [-1, 1]) {
      const x = ux * t - uz * s * 3.1 * ROAD_W, z = uz * t + ux * s * 3.1 * ROAD_W;
      if (out.some(o => o.role && Math.hypot(o.x - x, o.z - z) < o.r + 1.2)) continue; // not inside a building's yard
      out.push(piece('lamp', round(x), round(z), ISO_YAW, city === 'hollow' ? 1.25 : 1.1, 0.3));
    }
  }
  // the city's great tree / monument stands where each map has its tenth, sign-less building (right of the broker)
  { const [x, z] = mapToWorld(city, 0.85, CAL[city].v); out.push(piece('tree', round(x), round(z), ISO_YAW, city === 'thornwatch' ? 7.5 : 6.5, 1.7)); }
  // crates in the supplier's and the shop's yards
  const sup = out.find(p => p.role === 'supplier')!, shop = out.find(p => p.role === 'shop')!;
  out.push(piece('crate', round(sup.x - sup.r - 1.2), round(sup.z + 1.6), ISO_YAW, 1.7, 0.75), piece('crate', round(shop.x + 1.6), round(shop.z - shop.r - 1.2), ISO_YAW + Math.PI / 2, 1.5, 0.65));
  // Dawnveil's gate arch stands on the canal with its own bridge (gate views), so the road needs no extra bridge piece
  // the plaza's centre piece (Dawnveil's angel statue, the compass dais of the other two) is part of the plaza sprite
  out.push({ piece: '', x: 0, z: 0, facing: 0, w: 0, r: (city === 'dawnveil' ? 1.6 : 0.9) * 1.6, depth: 0 });
  // Civic annexes in the outer blocks share the capital's architectural kit.
  const annexes: [string, string, Role, number, number, ScreenFace][] = [
    ['เรือนพักผู้เดินทาง','ที่พักของกองคาราวานก่อนออกจากเมือง','guide',-48,-23,'SE'], ['โรงเก็บเกวียน','ลานพักเกวียนและขนถ่ายเสบียง','supplier',-25,52,'S'],
    ['โรงช่างฝึกหัด','อาคารฝึกงานของช่างอาวุธและช่างเกราะ','merchant',23,-50,'SW'], ['หอจดหมายเหตุ','ที่เก็บบันทึกเมืองและแผนผังเส้นทางเก่า','mentor',49,22,'SW'],
    ['คลังสินค้าตลาด','โกดังพักสินค้าของพ่อค้าประจำเมือง','broker',25,54,'NW'], ['เรือนพักเวรยาม','อาคารผลัดเวรของทหารลาดตระเวนกำแพง','warden',-52,22,'SE'],
  ];
  for (const [landmark, description, role, x, z, face] of annexes) {
    out.push(piece(ART_OF[city][role] ?? role, x, z, faceYaw(face), 7, 2.35, {landmark, description}));
  }
  return [...out, ...districts(city, out)];
}

/** the blocks between the roads: groves of the city's tree, lamps and crate stacks on a jittered grid, leaving open
 *  courtyards (about half the cells stay empty for people to gather), every yard, door, gate and road clear */
function districts(city: MainCityId, fixed: KitPiece[]): KitPiece[] {
  let seed = city.length * 7919 + 17; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const out: KitPiece[] = [], step = 6, lim = CAPITAL_WALK - 3.5, treeShare = city === 'thornwatch' ? 0.42 : city === 'dawnveil' ? 0.3 : 0.26;
  const clearOfRoad = (x: number, z: number) => ![[0, 0], [2.2, 0], [-2.2, 0], [0, 2.2], [0, -2.2]].some(([a, b]) => onRoad(x + a, z + b) || inCanal(city, x + a, z + b));
  for (let gx = -lim; gx <= lim; gx += step) for (let gz = -lim; gz <= lim; gz += step) {
    const x = round(gx + (rnd() - 0.5) * 2.4), z = round(gz + (rnd() - 0.5) * 2.4), roll = rnd();
    if (Math.abs(x) > lim || Math.abs(z) > lim || Math.hypot(x, z) < PLAZA_R + 4 || !clearOfRoad(x, z)) continue;
    if (city === 'dawnveil' && Math.max(Math.abs(x), Math.abs(z)) > CANAL_IN - 4) continue; // leave a walking strip along the canal bank
    if ([...fixed, ...out].some(p => (p.r > 0 || p.piece) && Math.hypot(p.x - x, p.z - z) < (p.role ? p.r + 5 : p.piece === 'gate' || p.piece === 'corner' ? 11 : Math.max(p.r, 1) + 2.6))) continue;
    if (roll < treeShare) out.push(piece('tree', x, z, ISO_YAW + Math.floor(rnd() * 8) * Math.PI / 4, round(3.8 + rnd() * 1.8), 1.0));
    else if (roll < treeShare + 0.08) out.push(piece('lamp', x, z, ISO_YAW, city === 'hollow' ? 1.25 : 1.1, 0.3));
    else if (roll < treeShare + 0.15) out.push(piece('crate', x, z, ISO_YAW + Math.floor(rnd() * 4) * Math.PI / 2, round(1.4 + rnd() * 0.4), 0.65));
  }
  return out;
}

/** Dawnveil's canal: a band of water just inside the walls, crossed at each gate (the gate art carries the bridge) */
export const CANAL_IN = 25 * CITY_SCALE;
export function inCanal(city: CityId, x: number, z: number) {
  if (city !== 'dawnveil') return false;
  const ax = Math.abs(x), az = Math.abs(z);
  if (Math.max(ax, az) < CANAL_IN || Math.max(ax, az) > CAPITAL_WALK + 1) return false;
  // the bridged road: within 2.3 of the diagonal toward that corner
  return !(Math.abs(ax - az) < 2.6 * ROAD_W * Math.SQRT2 && ax > CANAL_IN - 3 && az > CANAL_IN - 3);
}

export const CAPITAL_PIECES: Record<MainCityId, KitPiece[]> = { hollow: plan('hollow'), dawnveil: plan('dawnveil'), thornwatch: plan('thornwatch') };
/** the pieces that are drawn (the Dawnveil statue collider has no art of its own: it is part of the plaza sprite) */
export const drawnPieces = (city: MainCityId) => CAPITAL_PIECES[city].filter(p => p.piece);
export const buildingOf = (city: MainCityId, role: Role) => CAPITAL_PIECES[city].find(p => p.role === role)!;

/** In front of the door: just past the footprint along the way the building faces (camera side, never hidden). */
export function doorSpot(city: MainCityId, role: Role): [number, number] {
  const b = buildingOf(city, role), d = b.r + 0.9; return [round(b.x + Math.sin(b.facing) * d), round(b.z + Math.cos(b.facing) * d)];
}
/** where a traveller appears: just inside the waygate they came through, on the first clear spot (the buyer's yard and the
 *  guardhouse stand on the gate roads, as on the maps) */
export function gateArrival(city: MainCityId, dir: GateDir): [number, number] {
  const [gx, gz] = GATE_POS[dir], ux = -gx / GATE_D / Math.SQRT2, uz = -gz / GATE_D / Math.SQRT2;
  for (const t of [4.2, 5, 6, 7, 8]) for (const s of [0, 1.6, -1.6, 3, -3]) {
    const x = round(gx + ux * t - uz * s), z = round(gz + uz * t + ux * s);
    if (!capitalBlocked(city, x, z) && CAPITAL_PIECES[city].every(p => p.r <= 0 || Math.hypot(p.x - x, p.z - z) > p.r + 0.8)) return [x, z];
  }
  return CAPITAL_SPAWN;
}
export const CAPITAL_SPAWN: [number, number] = [4.6 * 1.6, 4.6 * 1.6];
/** eight arrival points around the plaza: respawns and recalls spread out instead of stacking on one spot */
export const CAPITAL_SPAWNS: [number, number][] = Array.from({ length: 8 }, (_, i) => { const a = Math.PI / 4 + i * Math.PI / 4; return [round(Math.sin(a) * 6.5 * 1.6), round(Math.cos(a) * 6.5 * 1.6)] as [number, number]; });

export function capitalColliders(city: MainCityId): Collider[] {
  return CAPITAL_PIECES[city].filter(p => p.r > 0).map(p => ({ kind: 'circle', x: p.x, z: p.z, r: p.r }) as Collider);
}
/** walls + canal (the colliders cover buildings and props) */
export function capitalBlocked(city: CityId, x: number, z: number) {
  return Math.abs(x) > CAPITAL_WALK || Math.abs(z) > CAPITAL_WALK || inCanal(city, x, z);
}
/** paved ground for the renderer and the grass: plaza, the four gate roads (around the blessing hall and the guardhouse),
 *  the two cross axes and the ring road */
export function onRoad(x: number, z: number) {
  const r = Math.hypot(x, z);
  if (r < PLAZA_R) return true;
  if (Math.abs(r - 13.6 * CITY_SCALE) < 1.7 * ROAD_W) return true;
  if (Math.abs(x - z) / Math.SQRT2 < 2.6 * ROAD_W || Math.abs(x + z) / Math.SQRT2 < 2.6 * ROAD_W) return true;
  if ((Math.abs(x) < 1.6 * ROAD_W || Math.abs(z) < 1.6 * ROAD_W) && r < 24 * CITY_SCALE) return true;
  return false;
}
