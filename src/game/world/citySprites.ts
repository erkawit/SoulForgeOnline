// The three capitals dressed with the painted free-texture city sheets (reference/compact-cast-v2/sprit-model/maps):
// buildings, gates, crystals, statues, lamps, market clutter, farms and ruins as 2.5D sprites, the plaza as a ground decal.
// Sprites turn around their vertical axis to face the camera (like the heroes) and sit on the camera-side edge of their
// footprint so they sort correctly against characters. The GLB keeps the town terrain, roads, canal and walls; its
// block-out houses / forge / towers / temple / sanctuary are hidden (hideGlb).
//
// Each city opens onto ±50 m of outskirts (content.WORLD_LIMIT):
//   Hollow Reach — the Sorrowlands (world/ruins.ts, world/zones.ts)
//   Dawnveil     — Lumen Fields (windmills, farms) W · pilgrim road + ruined chapel N · aqueduct + old mill E · pilgrim camp S
//   Thornwatch   — farmstead W · hunters' camp E · old mill + manor N · root arches and cottages S
// Safe ground near town, light low-level hunting at the outer edge (CITIES[city].hunt).
//
// Cut by blender/sprites/cut_city.py (Hollow) and cut_city_sheet.py + city_<city>.json (Dawnveil, Thornwatch);
// CITY_ART holds the exported pixel sizes (2x the sheet). Pure data up to the rendering section (the server uses colliders).
import {
  Color, DoubleSide, Float32BufferAttribute, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, SRGBColorSpace, TextureLoader,
  type Texture, type Vector3,
} from 'three';
import type { Collider } from './colliders';
import type { CityId, MainCityId } from '../content';

export const CITY_ART: Record<MainCityId, Record<string, [number, number]>> = {
  hollow: {
    'house-a': [344, 376], 'house-b': [332, 376], crystal: [152, 212], stall: [166, 150], brazier: [62, 60], 'statue-a': [76, 186], 'statue-b': [76, 184],
    lamp: [26, 134], crates: [108, 120], crates2: [102, 106], barrels: [102, 74], cart: [106, 90], lantern: [44, 84], gate: [498, 378], forge: [348, 364], plaza: [332, 332],
  },
  dawnveil: {
    cathedral: [780, 672], 'dome-hall': [274, 298], 'chapel-hall': [336, 300], 'house-a': [244, 246], 'house-b': [246, 256], 'bell-church': [292, 330], 'house-c': [292, 258],
    'house-d': [250, 258], 'house-e': [272, 262], 'house-f': [260, 240], 'house-g': [282, 256], windmill: [196, 296], aqueduct: [370, 248], 'ruin-tower': [130, 266],
    'ruin-wall': [170, 164], 'ruin-arch': [220, 260], 'ruin-chapel': [304, 262], 'house-ruined': [262, 270], 'mill-ruined': [316, 276], court: [298, 298],
    'bridge-arch': [400, 244], 'bridge-flat': [342, 242], dock: [322, 226], dock2: [322, 210], 'statue-a': [124, 256], 'statue-b': [126, 254], 'statue-c': [124, 258],
    crystal: [154, 236], boat: [142, 102], campfire: [138, 126], blossom: [204, 214], cypress: [72, 236], cypress2: [78, 250],
  },
  thornwatch: {
    plaza: [484, 484], lodge: [512, 348], crystal: [178, 230], obelisk: [126, 304], 'obelisk-torch': [124, 308], 'house-long': [330, 328], 'house-a': [262, 280],
    manor: [386, 362], 'great-hall': [362, 330], 'house-moss': [328, 358], 'house-tall': [350, 368], 'house-c': [312, 326], 'cabin-a': [244, 244], 'cabin-b': [246, 224],
    'root-wall-a': [392, 274], 'root-wall-b': [346, 260], 'root-wall-c': [248, 242], 'root-gate': [416, 284], watermill: [442, 324], 'house-d': [308, 248], shed: [218, 204],
    barn: [294, 244], campfire: [138, 124], crops: [294, 174], crops2: [202, 112], 'hay-crates': [198, 132], hay: [204, 124], crates: [88, 72], 'banner-red': [62, 212],
    'banner-blue': [64, 214], blossom: [216, 240], cypress: [90, 268], 'bridge-a': [396, 232], 'bridge-b': [466, 282], barrel: [70, 100], barrels: [150, 114], chest: [112, 100],
    torch: [40, 200], lantern: [42, 88], lamp: [38, 126], fence: [130, 110], cart: [162, 126], wagon: [116, 118],
  },
};

/** sprite placement: art (`name` from this city's sheet or `city/name`), footprint centre, world width, how far toward the
 *  camera the plane sits (negative = behind the centre, for bridges / docks you walk over), a round collider, a box footprint
 *  [w, d] for buildings, or extra round colliders [dx, dz, r] (gate legs) */
export type CityProp = { art: string; x: number; z: number; w: number; depth?: number; flip?: boolean; collide?: number; foot?: [number, number]; legs?: [number, number, number][];
  /** walked over (bridges, docks): drawn without depth writes so characters on it are never hidden */
  under?: boolean };

const H: CityProp[] = [
  { art: 'forge', x: -12, z: -9, w: 8.2, depth: 2.4 }, { art: 'house-b', x: 11, z: -9, w: 7.6, depth: 2.4 },
  { art: 'house-a', x: -12, z: 9, w: 7.6, depth: 2.4 }, { art: 'house-a', x: 12, z: 9, w: 7.6, depth: 2.4, flip: true },
  { art: 'gate', x: 0, z: -17.4, w: 15.5, depth: 0.6 }, { art: 'crystal', x: 0, z: 0, w: 2.3, depth: 0.5 },
  { art: 'statue-a', x: -3.4, z: -9.5, w: 0.95, collide: 0.4 }, { art: 'statue-b', x: 3.4, z: -9.5, w: 0.95, collide: 0.4 },
  ...[-20, -12.5, 12.5, 20].flatMap(v => [{ art: 'lamp', x: -3.3, z: v, w: 0.32, collide: 0.15 }, { art: 'lamp', x: v, z: 3.3, w: 0.32, collide: 0.15 }]),
  { art: 'brazier', x: -8.3, z: -6.2, w: 0.85, collide: 0.35 }, { art: 'brazier', x: -2.6, z: -15.4, w: 0.85, collide: 0.35 }, { art: 'brazier', x: 2.6, z: -15.4, w: 0.85, collide: 0.35 },
  { art: 'crates', x: -15.6, z: -5.6, w: 1.3, collide: 0.55 }, { art: 'barrels', x: -8.6, z: -11.8, w: 1.25, collide: 0.5 }, { art: 'crates2', x: 15.2, z: -5.4, w: 1.2, collide: 0.5 },
  { art: 'stall', x: 16.5, z: 5.4, w: 2.8, depth: 0.6, collide: 1.1 }, { art: 'cart', x: -15.8, z: 12.6, w: 1.8, collide: 0.75 },
  { art: 'lantern', x: -9.4, z: 11.7, w: 0.42 }, { art: 'lantern', x: 9.4, z: 11.7, w: 0.42 }, { art: 'lantern', x: 8.4, z: -6.4, w: 0.42 },
  // the outer houses on both side roads and a back row in the south (same row lines as the four original houses)
  { art: 'house-b', x: -19.6, z: -9, w: 6.2, depth: 2, foot: [4.6, 4], flip: true }, { art: 'house-a', x: 19.8, z: -9, w: 6.2, depth: 2, foot: [4.6, 4] },
  { art: 'house-b', x: -12, z: 18.6, w: 6.6, depth: 2, foot: [5, 4] }, { art: 'house-b', x: 12, z: 18.6, w: 6.6, depth: 2, foot: [5, 4], flip: true },
];

const tree = (art: string, x: number, z: number, w = 0.9, flip = false): CityProp => ({ art, x, z, w, collide: art.includes('blossom') ? 0.45 : 0.3, flip });
const house = (art: string, x: number, z: number, w = 5.6, flip = false, foot: [number, number] = [4, 4]): CityProp => ({ art, x, z, w, depth: foot[1] / 2, flip, foot });

// Town plan shared by Dawnveil and Thornwatch: the main cross roads (|x|, |z| < 2) split the town into four quadrants; each
// quadrant holds a front row facing the east-west road (|z| ≈ 9) and a back row (|z| ≈ 18.5), columns at |x| ≈ 10 / 19,
// one footprint size per row so the streets read as streets. Service buildings sit where their camera-near side faces a
// road (north rows, the south-west front), so the NPC in front of them is never hidden behind the building.
const lampRow = (art: string, skip: (x: number, z: number) => boolean = () => false) => [-21, -14, -7, 7, 14, 21].flatMap(v => [[-2.9, v], [v, 2.9]] as [number, number][])
  .filter(([x, z]) => !skip(x, z)).map(([x, z]) => ({ art, x, z, w: 0.34, collide: 0.15 }));
const D: CityProp[] = [
  // north axis: the cathedral closes the pilgrim road, statues flank its steps
  { art: 'cathedral', x: 0, z: -15.5, w: 13, depth: 3, foot: [10, 6] }, { art: 'statue-a', x: -4.8, z: -10.6, w: 0.95, collide: 0.4 }, { art: 'statue-c', x: 4.8, z: -10.6, w: 0.95, collide: 0.4, flip: true },
  // NW: dome market hall (Silas) + bell church behind, a house on the west road
  house('dome-hall', -11, -9, 7, false, [6, 4.4]), house('house-a', -19.5, -9, 5.8), house('bell-church', -11, -18.5, 6, false, [5, 4.4]), house('house-b', -19.5, -18.5, 5.6, true),
  // SW: the market house with the stall in front (Mira, Jessa), houses behind
  house('house-c', -11, 9.5, 7, false, [6, 4.4]), house('house-d', -19.5, 9.5, 5.6, true), house('house-g', -11, 18.5, 6.4, false, [5.4, 4.4]), house('house-f', -19.5, 18.5, 5.6),
  { art: 'hollow/stall', x: -6.4, z: 5.4, w: 2.8, depth: 0.6, collide: 1.1 }, { art: 'hollow/crates', x: -8.6, z: 4.4, w: 1.2, collide: 0.5 }, { art: 'hollow/barrels', x: -4.6, z: 4.2, w: 1.1, collide: 0.45 },
  // east of the canal: the canal-side smithy (Brannoc) with its fire, chapel hall behind; two houses on the south bank
  house('house-e', 16.5, -9, 7, true, [6, 4.4]), { art: 'campfire', x: 20.6, z: -5.6, w: 1.3, collide: 0.5 }, { art: 'hollow/barrels', x: 12.6, z: -5.6, w: 1.1, collide: 0.45 },
  house('chapel-hall', 16.5, -18.5, 7, false, [6, 4.4]), house('house-b', 16.5, 9.5, 6.2, false, [5.4, 4.4]), house('house-a', 16.5, 18.5, 6, true, [5.4, 4.4]),
  { art: 'crystal', x: 0, z: 0, w: 2.2, depth: 0.5 },
  // the canal: bridge on the cross road, a dock each side, boats moored
  { art: 'bridge-arch', x: 8, z: 0, w: 6.4, under: true }, { art: 'dock', x: 8, z: 12, w: 4.6, under: true }, { art: 'dock2', x: 8, z: -12, w: 4.4, under: true },
  { art: 'boat', x: 8, z: -18, w: 2 }, { art: 'boat', x: 8, z: 18, w: 2, flip: true },
  // lamps every 7 m along both roads, cypress rows on the canal banks, blossoms on the plaza corners, a garden by the cathedral
  ...lampRow('thornwatch/lamp', (x, z) => x > 4 && x < 12),
  ...[-20, -15, -6, 6, 15, 20].flatMap(z => [tree(z % 2 ? 'cypress' : 'cypress2', 4.9, z, 0.85), tree(z % 2 ? 'cypress2' : 'cypress', 11.1, z, 0.85)]),
  tree('blossom', -5.6, -5.6, 2.4), tree('blossom', -5.6, 13.6, 2.2, true), tree('blossom', 21.6, 14, 2.2),
  tree('cypress', -7.6, -13.5), tree('cypress2', 7.2, -13.5), tree('cypress', -7.6, -21.5), tree('cypress2', -15.2, -13.8, 0.8), tree('cypress', -15.2, 13.8, 0.8),
  // ---- outskirts W: Lumen Fields — windmills, farmhouse, crops, hay, fences
  house('windmill', -36, -8, 5, false, [2.6, 2.6]), house('windmill', -43, 4, 4.6, true, [2.4, 2.4]), house('house-f', -30, 9, 5.4, true),
  { art: 'thornwatch/crops', x: -36, z: 1, w: 5 }, { art: 'thornwatch/crops2', x: -29.5, z: -3, w: 3.8 }, { art: 'thornwatch/crops', x: -42, z: -14, w: 5, flip: true },
  { art: 'thornwatch/hay', x: -33, z: -13, w: 2.4, collide: 0.8 }, { art: 'thornwatch/fence', x: -27, z: 1, w: 1.8 }, { art: 'thornwatch/fence', x: -27, z: -7, w: 1.8, flip: true },
  { art: 'thornwatch/cart', x: -27, z: 14, w: 2, collide: 0.7 }, { art: 'thornwatch/hay-crates', x: -38, z: 10, w: 2.4, collide: 0.9 },
  // N: pilgrim road with statues, the ruined chapel of the first dawn at the edge (hunting)
  { art: 'statue-b', x: -3, z: -27, w: 0.95, collide: 0.4 }, { art: 'statue-a', x: 3, z: -27, w: 0.95, collide: 0.4, flip: true },
  { art: 'bridge-arch', x: 8, z: -30, w: 6.4, under: true }, { art: 'dock', x: 8, z: -38, w: 4.4, under: true, flip: true }, { art: 'boat', x: 8, z: -24, w: 2 },
  { art: 'ruin-chapel', x: 17, z: -43, w: 6, foot: [4.4, 1.4] }, { art: 'ruin-arch', x: -7, z: -38, w: 4.4, legs: [[-1.6, 0, 0.5], [1.6, 0, 0.5]] },
  { art: 'ruin-tower', x: -13, z: -43, w: 2.4, collide: 0.8 }, { art: 'ruin-wall', x: 21, z: -36, w: 3.4, foot: [3, 0.8] }, house('house-ruined', -18, -33, 5.4),
  // E (past the canal): aqueduct, old farmhouses, the ruined mill
  { art: 'aqueduct', x: 34, z: -16, w: 8, depth: 0.5, foot: [7.4, 1] }, house('house-b', 30, 7, 5.4), house('house-d', 36, -27, 5.4, true), house('bell-church', 24, -32, 5.6, true),
  house('mill-ruined', 40, 22, 6, false, [4.6, 4]), tree('blossom', 26, 16, 2.4), tree('cypress', 28, -4), tree('cypress2', 42, -16),
  // S: pilgrim camp — campfire, statue, cottage, the bridge downstream, blossoms and cypress rows
  { art: 'campfire', x: -6, z: 32, w: 1.4, collide: 0.55 }, { art: 'statue-c', x: 3.2, z: 30, w: 0.95, collide: 0.4 }, house('house-e', -15, 32, 5.6),
  { art: 'bridge-arch', x: 8, z: 28, w: 6.4, under: true }, { art: 'dock2', x: 8, z: 38, w: 4.4, under: true }, { art: 'boat', x: 8, z: 44, w: 2, flip: true },
  tree('blossom', -21, 27, 2.6), tree('blossom', 16, 31, 2.4, true), ...[30, 36, 42].flatMap(z => [tree('cypress', -3, z), tree('cypress2', 3, z + 2)]),
];

const T: CityProp[] = [
  // north axis: the wardens' long-house, the root gate out to the forest, root walls along the edge
  house('house-long', 0, -16, 6.8, false, [5, 4.4]), { art: 'banner-blue', x: -3.6, z: -12.6, w: 0.6, collide: 0.2 }, { art: 'banner-red', x: 3.6, z: -12.6, w: 0.6, collide: 0.2 },
  { art: 'obelisk-torch', x: -3.4, z: -8.4, w: 0.95, collide: 0.35 }, { art: 'obelisk-torch', x: 3.4, z: -8.4, w: 0.95, collide: 0.35, flip: true },
  { art: 'root-gate', x: 0, z: -24.6, w: 9, depth: 0.4, legs: [[-3.4, 0, 1], [3.4, 0, 1]] },
  { art: 'root-wall-a', x: -12, z: -25, w: 8, depth: 0.6, foot: [7, 1.2] }, { art: 'root-wall-b', x: 12, z: -25, w: 7, depth: 0.6, foot: [6, 1.2], flip: true },
  // NW: the wardens' hall (Ranger Kestrel) and the market corner (Mira, Jessa); cabins behind
  house('great-hall', -10.5, -9, 6.6, false, [5.6, 4.4]), house('house-d', -19.5, -9, 5.4, false, [4.4, 4]), house('cabin-a', -10.5, -18.5, 5.6, false, [4.6, 4]), house('shed', -19.5, -18.5, 4.4, true, [3.4, 3.2]),
  { art: 'hollow/stall', x: -5.8, z: -5.4, w: 2.8, depth: 0.6, collide: 1.1 }, { art: 'barrels', x: -8, z: -4.4, w: 1.2, collide: 0.45 }, { art: 'chest', x: -3.8, z: -6.6, w: 0.9, collide: 0.4 },
  // NE: the tall trading house (Silas), cabins behind
  house('house-tall', 10.5, -9, 7, false, [5.6, 4.4]), house('cabin-b', 19.5, -9, 5.4, true, [4.4, 4]), house('house-c', 10.5, -18.5, 6, true, [5, 4.4]), house('house-a', 19.5, -18.5, 5.4, false, [4.4, 4]),
  // SW: the smithy lodge with the chimney (Brannoc on its road side), hay yard; houses behind
  house('lodge', -10.5, 9.5, 8.4, false, [6.6, 4.4]), { art: 'hay-crates', x: -19.5, z: 9.5, w: 2.4, collide: 0.9 }, { art: 'wagon', x: -16.4, z: 6.2, w: 1.4, collide: 0.6 }, { art: 'barrel', x: -6, z: 12.6, w: 0.62, collide: 0.3 },
  house('house-a', -10.5, 18.5, 5.8, true, [4.8, 4]), house('barn', -19.5, 18.5, 5.4, false, [4.4, 3.6]),
  // SE: homes around a blossom garden
  house('house-moss', 10.5, 9.5, 7, false, [5.6, 4.4]), house('cabin-a', 19.5, 9.5, 5.2, true, [4.4, 4]), house('house-d', 10.5, 18.5, 5.4, true, [4.4, 4]), tree('blossom', 19.5, 18.5, 2.6),
  { art: 'crystal', x: 0, z: 0, w: 2.4, depth: 0.5 },
  ...lampRow('torch'),
  tree('blossom', -5.6, 5.6, 2.2), tree('blossom', 5.6, 5.6, 2.2, true), tree('cypress', 5.6, -5.6), tree('cypress', 15, 13.8, 0.85), tree('cypress', -15, 13.8, 0.85), tree('cypress', 15, -13.8, 0.85), tree('cypress', -15, -13.8, 0.85),
  // ---- outskirts W: farmstead — barn, crops, hay, fences, cart
  house('barn', -32, 4, 5.4, false, [4, 3.4]), { art: 'crops', x: -34, z: 12, w: 5 }, { art: 'crops2', x: -27.5, z: 13.5, w: 3.8 }, { art: 'crops', x: -40, z: -6, w: 5, flip: true },
  { art: 'hay', x: -38.5, z: 4, w: 2.4, collide: 0.8 }, { art: 'fence', x: -28, z: 8, w: 1.8 }, { art: 'fence', x: -30, z: 17, w: 1.8, flip: true }, { art: 'cart', x: -26, z: 4, w: 2, collide: 0.7 },
  // E: hunters' camp — shed, campfire, wagon, barrels, banner, torches, fence
  house('shed', 32, -12, 4.2, false, [3, 3]), { art: 'campfire', x: 34, z: -6, w: 1.4, collide: 0.55 }, { art: 'wagon', x: 30, z: -3.6, w: 1.5, collide: 0.6 },
  { art: 'barrels', x: 36.4, z: -10, w: 1.3, collide: 0.5 }, { art: 'banner-red', x: 28.6, z: -9, w: 0.6, collide: 0.2 }, { art: 'torch', x: 36.6, z: -3, w: 0.34, collide: 0.15 },
  { art: 'fence', x: 38.6, z: -13.4, w: 1.8 }, { art: 'chest', x: 31.4, z: -7.6, w: 1, collide: 0.45 },
  // N: the old water mill, the forest manor, obelisks along the road, root wall
  house('watermill', -30, -26, 7, false, [5, 4]), house('cabin-b', -22, -36, 5.2, true), house('manor', 15, -34, 7, false, [5.4, 4.4]),
  { art: 'obelisk', x: -3, z: -32, w: 1, collide: 0.4 }, { art: 'obelisk', x: 3, z: -32, w: 1, collide: 0.4, flip: true }, { art: 'root-wall-c', x: 30, z: -28, w: 5, foot: [4, 1.4] },
  // S: cottages, crops, an old root arch toward the south-west wood, blossoms
  house('house-a', 28, 26, 5.4, true), { art: 'crops', x: 33, z: 18, w: 4.6 }, tree('blossom', 22, 32, 2.4), house('house-d', -14, 32, 5.2, false, [4, 3.6]),
  { art: 'crops2', x: -6, z: 36, w: 3.8 }, { art: 'root-gate', x: -30, z: 28, w: 8, depth: 0.4, flip: true, legs: [[-3, 0, 0.9], [3, 0, 0.9]] },
  { art: 'root-wall-a', x: -38, z: 20, w: 7, depth: 0.6, foot: [6, 1.2] }, tree('blossom', 8, 30, 2.2, true),
  ...[[24, 6], [26, -20], [-24, -14], [-20, 24], [12, 22], [-8, -30], [40, -20], [-42, 16], [20, 40], [-34, 38]].map(([x, z], i) => tree('cypress', x, z, 0.95, i % 2 === 1)),
];

export const CITY_PROPS: Record<MainCityId, CityProp[]> = { hollow: H, dawnveil: D, thornwatch: T };
/** @deprecated use CITY_PROPS.hollow */
export const HOLLOW_PROPS = H;
/** the plaza decal under each crystal (art, world size) */
export const CITY_PLAZA: Record<MainCityId, [string, number]> = { hollow: ['plaza', 15.2], dawnveil: ['court', 10], thornwatch: ['plaza', 13] };
/** block-out GLB nodes replaced by sprites (Dawnveil / Thornwatch also drop their in-town hunting clearings and the old
 *  outskirts ring — hunting moved to the edge of the outskirts, and the outskirts are walkable now) */
export const HIDE_GLB = /^(house|tower|forge)_\d|^Sanctuary|^Monster_farming/;
const HIDE_OUT = /^(house|tower|forge|temple)_\d|^Sanctuary|^Monster_farming|^Outskirts_scenery/;
export function hideGlb(city: CityId, name: string) { return city === 'hollow' ? HIDE_GLB.test(name) : (city === 'dawnveil' || city === 'thornwatch') && HIDE_OUT.test(name); }
export const hasCitySprites = (city: CityId | undefined): city is MainCityId => city === 'hollow' || city === 'dawnveil' || city === 'thornwatch';

export function artSize(city: MainCityId, art: string): [number, number] {
  const [c, n] = art.includes('/') ? art.split('/') as [MainCityId, string] : [city, art];
  const s = CITY_ART[c]?.[n]; if (!s) throw new Error(`city art ${c}/${n} missing`); return s;
}
/** pure data for walkable() / the server: buildings block their footprint, small props a circle, gates their legs */
export function propColliders(city: MainCityId | CityProp[] = 'hollow'): Collider[] {
  const props = Array.isArray(city) ? city : CITY_PROPS[city], out: Collider[] = [];
  for (const p of props) {
    if (p.collide) out.push({ kind: 'circle', x: p.x, z: p.z, r: p.collide });
    if (p.foot) out.push({ kind: 'box', x: p.x, z: p.z, hw: p.foot[0] / 2, hd: p.foot[1] / 2 });
    for (const [dx, dz, r] of p.legs ?? []) out.push({ kind: 'circle', x: p.x + dx, z: p.z + dz, r });
  }
  return out;
}

// ---------------------------------------------------------------- rendering
let base = '/art/city/';
export function setCityArtBase(url: string) { base = (url.endsWith('/') ? url : url + '/').replace(/hollow\/$/, ''); }
const loader = new TextureLoader(), tex = new Map<string, Texture>();
function texture(path: string): Texture { const hit = tex.get(path); if (hit) return hit; const t = loader.load(base + path + '.webp'); t.colorSpace = SRGBColorSpace; t.anisotropy = 4; tex.set(path, t); return t; }
const artPath = (city: MainCityId, art: string) => art.includes('/') ? art : `${city}/${art}`;

const GROUND: Record<'dawnveil' | 'thornwatch', { a: string; b: string; road: string; hunt: string }> = {
  dawnveil: { a: '#55613f', b: '#6d7a4c', road: '#a49c84', hunt: '#4a4d3a' },
  thornwatch: { a: '#34422c', b: '#435636', road: '#635a46', hunt: '#2a3124' },
};
/** the outskirts ground around Dawnveil / Thornwatch (the town GLB covers ±23): vertex-coloured, roads to the four edges,
 *  darker ground where monsters roam, Dawnveil's canal running on to both map edges */
export function buildOutskirts(city: 'dawnveil' | 'thornwatch', hunt: [number, number][], water?: { x: number; w: number }) {
  const g0 = GROUND[city], S = 50 * 2 + 24, n = 72, g = new PlaneGeometry(S, S, n, n); g.rotateX(-Math.PI / 2);
  const pos = g.attributes.position, col: number[] = [], c = new Color(), a = new Color(g0.a), b = new Color(g0.b), road = new Color(g0.road), dark = new Color(g0.hunt);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i), inTown = Math.abs(x) < 23.5 && Math.abs(z) < 23.5;
    // under the town GLB terrain (which carries Dawnveil's canal at y≈-0.15) and dipped under the canal outside town
    const inCanal = !!water && Math.abs(x - water.x) < water.w / 2 + 0.9;
    pos.setY(i, inTown ? -0.5 : inCanal ? -0.45 : -0.02 + Math.sin(x * 0.29) * Math.cos(z * 0.23) * 0.07);
    c.copy(a).lerp(b, (Math.sin(x * 0.61 + z * 0.37) * 0.5 + 0.5) * 0.55 + (Math.sin(x * 2.3) * Math.cos(z * 1.9) * 0.5 + 0.5) * 0.25);
    if (!inTown && (Math.abs(x) < 2.2 || Math.abs(z) < 2.2)) c.lerp(road, 0.7);
    for (const [hx, hz] of hunt) { const d = Math.hypot(x - hx, z - hz); if (d < 9) c.lerp(dark, 0.55 * (1 - d / 9)); }
    if (Math.max(Math.abs(x), Math.abs(z)) > 50) c.lerp(dark, 0.6);
    col.push(c.r, c.g, c.b);
  }
  g.setAttribute('color', new Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  const group = new Group(); group.name = 'outskirts';
  const ground = new Mesh(g, new MeshStandardMaterial({ vertexColors: true, roughness: 1 })); ground.receiveShadow = true; ground.name = 'outskirts-ground'; group.add(ground);
  if (water) for (const s of [-1, 1]) {
    const len = 62 - 23.5, m = new Mesh(new PlaneGeometry(water.w, len), new MeshStandardMaterial({ color: '#2f5a66', roughness: 0.25, metalness: 0.1 }));
    m.rotation.x = -Math.PI / 2; m.position.set(water.x, -0.16, s * (23.5 + len / 2)); m.name = 'outskirts-canal'; group.add(m);
    const bank = new Mesh(new PlaneGeometry(water.w + 1.2, len), new MeshStandardMaterial({ color: '#8d8873', roughness: 1 }));
    bank.rotation.x = -Math.PI / 2; bank.position.set(water.x, -0.3, s * (23.5 + len / 2)); group.add(bank);
  }
  return group;
}

export function buildCitySprites(city: MainCityId = 'hollow') {
  const props = CITY_PROPS[city];
  const group = new Group(); group.name = 'city-sprites';
  const items: { mesh: Mesh; p: CityProp; pivot: Group }[] = [];
  // plaza decal (flat, under everything) — the painted iso ellipse / diamond was stretched back to a circle / square when cut
  const [plazaArt, size] = CITY_PLAZA[city];
  const plaza = new Mesh(new PlaneGeometry(size, size), new MeshBasicMaterial({ map: texture(artPath(city, plazaArt)), transparent: true, depthWrite: false, toneMapped: false }));
  plaza.rotation.x = -Math.PI / 2; if (city === 'dawnveil') plaza.rotation.z = Math.PI / 4; plaza.position.y = 0.025; plaza.renderOrder = -1; plaza.name = 'city-plaza'; group.add(plaza);
  for (const p of props) {
    const [pw, ph] = artSize(city, p.art), h = p.w * ph / pw;
    const geo = new PlaneGeometry(p.w, h); geo.translate(0, h / 2, 0); if (p.flip) geo.scale(-1, 1, 1);
    const mat = new MeshBasicMaterial({ map: texture(artPath(city, p.art)), transparent: true, alphaTest: 0.08, side: DoubleSide, toneMapped: false, depthWrite: !p.under });
    const mesh = new Mesh(geo, mat); if (p.under) mesh.renderOrder = -0.5; mesh.name = 'city-' + p.art.replace(/^.*\//, ''); mesh.castShadow = false; mesh.receiveShadow = false;
    const pivot = new Group(); pivot.position.set(p.x, 0, p.z); pivot.add(mesh); group.add(pivot); items.push({ mesh, p, pivot });
  }
  const colliders = propColliders(city);
  return {
    group, colliders, meshes: items.map(i => i.mesh),
    /** face the camera around Y and step each sprite to the camera-side edge of its footprint */
    update(v: Vector3) {
      for (const it of items) { const dx = v.x - it.p.x, dz = v.z - it.p.z, yaw = Math.atan2(dx, dz), d = it.p.depth ?? 0, l = Math.hypot(dx, dz) || 1;
        it.pivot.rotation.y = yaw; it.pivot.position.set(it.p.x + dx / l * d, 0, it.p.z + dz / l * d); }
    },
  };
}
