// Renders a capital from world/capitalPlan.ts with the painted mmorpg-world-assets pieces (art/kit/<city>/<piece>.webp, 8-view atlases):
//  • buildings, gates, lamps, trees, crates and the plaza are billboards that turn to the camera and swap to the painted
//    view (one of eight) that matches the camera's angle on them — the camera keeps its iso pitch but can orbit
//  • the walls are fixed vertical panels along the four sides (their straight front view), so they always join up;
//    the walls and gates between the camera and the player fade out when the player comes near them
//  • the ground (roads, plaza paving, yards, Dawnveil's canal, soil) is painted once into a canvas texture
// Textures load on first use, so only the views the camera has actually seen are fetched.
import {
  CanvasTexture, Color, DoubleSide, Group, LinearMipmapLinearFilter, Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry,
  SRGBColorSpace, TextureLoader, type Texture, type Vector3,
} from 'three';
import type { MainCityId } from '../content';
import { KIT_ART, KIT_CELL, KIT_PAD } from './kitArt';
import { CAPITAL_HALF, CANAL_IN, GATE_D, ISO_YAW, PLAZA_R, drawnPieces, inCanal, onRoad, viewIndex, type KitPiece } from './capitalPlan';
/** the ground square (town + a margin beyond the walls) */
const GROUND_W = Math.ceil(2 * CAPITAL_HALF + 6);

let base = '/art/kit/';
export function setKitBase(url: string) { base = url.endsWith('/') ? url : url + '/'; }
const loader = new TextureLoader(), cache = new Map<string, Texture>(), clones = new Map<string, Texture[]>();
/** each piece is one atlas (art/kit/<city>/<piece>.webp, 4 x 2 cells of KIT_CELL, see cut_world_kit.py); every billboard
 *  gets its own clone of the piece's texture (same image, own offset/repeat) cropped to the view it shows */
function atlas(city: MainCityId, piece: string): Texture {
  const k = `${city}/${piece}`; const hit = cache.get(k); if (hit) return hit;
  // clones share the image but keep their own version: flag every clone once the image is in, or they never upload
  const t = loader.load(base + k + '.webp', () => { for (const c of clones.get(k) ?? []) c.needsUpdate = true; });
  t.colorSpace = SRGBColorSpace; t.anisotropy = 4; t.minFilter = LinearMipmapLinearFilter; cache.set(k, t); clones.set(k, []); return t;
}
function tex(city: MainCityId, piece: string, v: number, into?: Texture): Texture {
  const src = atlas(city, piece), [w, h] = kitSize(city, piece, v), cell = KIT_CELL[city]?.[piece];
  if (!cell) throw new Error(`kit atlas ${city}/${piece} missing`);
  let t: Texture; if (into) t = into; else { t = src.clone(); if (!src.image) t.version = 0; /* clone() flags an upload; wait for the image (onLoad above) */ clones.get(`${city}/${piece}`)!.push(t); }
  const [cw, ch] = cell, W = 4 * cw, H = 2 * ch, col = v % 4, row = Math.floor(v / 4);
  t.repeat.set(w / W, h / H); t.offset.set((col * cw + Math.floor((cw - w) / 2)) / W, 1 - (row * ch + ch - KIT_PAD) / H);
  return t;
}
export const kitSize = (city: MainCityId, piece: string, v: number): [number, number] => {
  const s = KIT_ART[city]?.[piece]?.[v]; if (!s) throw new Error(`kit art ${city}/${piece}-${v} missing`); return s;
};

type Palette = { soil: string; soil2: string; road: string; road2: string; yard: string; edge: string; water?: string; void: string };
const PAL: Record<MainCityId, Palette> = {
  hollow: { soil: '#2f2b2b', soil2: '#3d3634', road: '#9c8f84', road2: '#6c625c', yard: '#4f4844', edge: '#2a2524', void: '#07060a' },
  dawnveil: { soil: '#4f5d3b', soil2: '#62724a', road: '#d6c3a7', road2: '#ab9a83', yard: '#bcaa90', edge: '#d9cdb6', water: '#2fa6a6', void: '#0b0a0c' },
  thornwatch: { soil: '#2f3b24', soil2: '#3f4c2c', road: '#c2a181', road2: '#8f7359', yard: '#6e5a42', edge: '#3b3022', void: '#080907' },
};

function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
/** the ground: soil with mottling, cobbled roads and plaza ring, paved yards under the buildings, Dawnveil's canal */
function groundTexture(city: MainCityId, pieces: KitPiece[]) {
  // round 13: the town doubled; a 4096 px ground keeps ~32 px/m on desktops, phones stay at 2048
  const big = typeof navigator !== 'undefined' && !/Mobi|Android/i.test(navigator.userAgent) && (navigator.hardwareConcurrency ?? 4) >= 6;
  const S = big ? 4096 : 2048, W = GROUND_W, k = S / W, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d')!, p = PAL[city], r = rng(city.length * 977);
  const X = (x: number) => (x + W / 2) * k;
  g.fillStyle = p.soil; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 1400 * (W / 64) ** 2; i++) { // soft mottling (radial blobs, no hard edges)
    const x = r() * S, y = r() * S, rad = 10 + r() * 46, gr = g.createRadialGradient(x, y, 0, x, y, rad), c0 = r() < 0.7 ? p.soil2 : p.edge;
    gr.addColorStop(0, c0); gr.addColorStop(1, c0 + '00'); g.globalAlpha = 0.1 + r() * 0.14; g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  g.globalAlpha = 1;
  // yards under each building / monument, a little wider than its footprint
  for (const q of pieces) if (q.role || q.landmark || q.piece === 'tree') { g.fillStyle = p.yard; g.beginPath(); g.arc(X(q.x), X(q.z), (q.r + 1.3) * k, 0, 7); g.fill(); }
  // cobbles wherever the plan has road: running-bond rows of stones of mixed length, each a rounded block with a
  // lit top edge and a dark joint, the tone drifting between the two road colours
  const rr = (x: number, y: number, w: number, h: number, rad: number) => { g.beginPath(); g.moveTo(x + rad, y); g.arcTo(x + w, y, x + w, y + h, rad); g.arcTo(x + w, y + h, x, y + h, rad); g.arcTo(x, y + h, x, y, rad); g.arcTo(x, y, x + w, y, rad); g.closePath(); };
  const ca = new Color(p.road), cb = new Color(p.road2), cc = new Color();
  for (let z = -W / 2, row = 0; z < W / 2; z += 0.34, row++) for (let x = -W / 2 - (row % 2) * 0.22; x < W / 2;) {
    const sw = 0.3 + r() * 0.32, cx = x + sw / 2, cz = z + 0.17; x += sw;
    if (Math.max(Math.abs(cx), Math.abs(cz)) > CAPITAL_HALF || !onRoad(cx, cz) || inCanal(city, cx, cz)) continue;
    cc.copy(ca).lerp(cb, Math.min(1, r() * 0.55 + (Math.sin(cx * 0.21) * Math.cos(cz * 0.17) * 0.5 + 0.5) * 0.35));
    g.fillStyle = '#' + cc.getHexString(); g.globalAlpha = 1; rr(X(cx - sw / 2) + 1.5, X(z) + 1.5, sw * k - 3, 0.34 * k - 3, 4); g.fill();
    g.fillStyle = 'rgba(255,240,210,.10)'; g.fillRect(X(cx - sw / 2) + 3, X(z) + 2, sw * k - 6, 2);
  }
  g.globalAlpha = 1;
  // plaza rings (the plaza sprite sits on top; this keeps its edge from floating)
  g.strokeStyle = p.road2; g.lineWidth = 0.35 * k; g.beginPath(); g.arc(X(0), X(0), PLAZA_R * k, 0, 7); g.stroke();
  if (p.water) { // the canal band just inside the walls
    for (let z = -W / 2; z < W / 2; z += 0.25) for (let x = -W / 2; x < W / 2; x += 0.25) if (inCanal(city, x, z)) { g.fillStyle = p.water; g.fillRect(X(x), X(z), 0.25 * k + 1, 0.25 * k + 1); }
    g.strokeStyle = p.edge; g.lineWidth = 0.5 * k; g.strokeRect(X(-CANAL_IN), X(-CANAL_IN), 2 * CANAL_IN * k, 2 * CANAL_IN * k);
  }
  // the wall footing
  g.strokeStyle = '#000'; g.globalAlpha = 0.5; g.lineWidth = 1.2 * k; g.strokeRect(X(-CAPITAL_HALF), X(-CAPITAL_HALF), 2 * CAPITAL_HALF * k, 2 * CAPITAL_HALF * k); g.globalAlpha = 1;
  const t = new CanvasTexture(c); t.colorSpace = SRGBColorSpace; t.anisotropy = 8; return t;
}

type Item = { p: KitPiece; pivot: Group; mesh: Mesh; mat: MeshBasicMaterial; scale: number; view: number; fade: number };
type Wall = { mesh: Mesh; mat: MeshBasicMaterial; nx: number; nz: number; line: number; axis: 'x' | 'z'; fade: number };

export function buildCapital(city: MainCityId) {
  const pieces = drawnPieces(city), group = new Group(); group.name = 'capital-' + city;
  // ground: the town square plus the dark beyond the walls
  const pal = PAL[city];
  const ground = new Mesh(new PlaneGeometry(GROUND_W, GROUND_W), new MeshStandardMaterial({ map: groundTexture(city, pieces), roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.name = 'capital-ground'; group.add(ground);
  const beyond = new Mesh(new PlaneGeometry(420, 420), new MeshBasicMaterial({ color: new Color(pal.void) })); beyond.rotation.x = -Math.PI / 2; beyond.position.y = -0.05; group.add(beyond);
  if (pal.water) { // a faint sheen over the canal
    const sheen = new Mesh(new PlaneGeometry(GROUND_W, GROUND_W), new MeshBasicMaterial({ color: '#9ff3ef', transparent: true, opacity: 0.06, depthWrite: false })); sheen.rotation.x = -Math.PI / 2; sheen.position.y = 0.02; group.add(sheen);
  }

  const unit = new PlaneGeometry(1, 1); unit.translate(0, 0.5, 0);
  const items: Item[] = pieces.map(p => {
    const v0 = viewIndex(ISO_YAW, p.facing), [pw] = kitSize(city, p.piece, v0), scale = p.w / pw;
    const mat = new MeshBasicMaterial({ map: tex(city, p.piece, v0), transparent: true, alphaTest: p.under ? 0.02 : 0.12, side: DoubleSide, toneMapped: false, depthWrite: !p.under });
    const mesh = new Mesh(unit, mat); mesh.name = 'kit-' + p.piece; if (p.under) mesh.renderOrder = -0.5;
    const pivot = new Group(); pivot.add(mesh); group.add(pivot);
    const it: Item = { p, pivot, mesh, mat, scale, view: -1, fade: 1 }; setView(it, v0); return it;
  });
  function setView(it: Item, v: number) {
    if (it.view === v) return; it.view = v; const [w, h] = kitSize(city, it.p.piece, v);
    tex(city, it.p.piece, v, it.mat.map!); it.mesh.scale.set(w * it.scale, h * it.scale, 1);
  }

  // walls: straight panels along each side, leaving the corners to the waygates
  const walls: Wall[] = [];
  const [ww, wh] = kitSize(city, 'wall', 0), segLen = city === 'thornwatch' ? 8.5 : 9, segH = segLen * wh / ww;
  const wallMat = () => new MeshBasicMaterial({ map: tex(city, 'wall', 0), transparent: true, alphaTest: 0.12, side: DoubleSide, toneMapped: false });
  const keep = GATE_D * 1.06 - 6.2, n = Math.max(1, Math.round((2 * keep) / segLen)), span = (2 * keep) / n;
  for (const [axis, sign] of [['z', -1], ['x', 1], ['z', 1], ['x', -1]] as ['x' | 'z', number][]) for (let i = 0; i < n; i++) {
    const t = -keep + span * (i + 0.5), mat = wallMat(), mesh = new Mesh(new PlaneGeometry(span * 1.1, segH * span / segLen), mat);
    mesh.geometry.translate(0, segH * span / segLen / 2, 0);
    if (axis === 'z') { mesh.position.set(t, 0, sign * CAPITAL_HALF); } else { mesh.position.set(sign * CAPITAL_HALF, 0, t); mesh.rotation.y = Math.PI / 2; }
    mesh.name = 'kit-wall'; group.add(mesh);
    walls.push({ mesh, mat, nx: axis === 'x' ? sign : 0, nz: axis === 'z' ? sign : 0, line: sign * CAPITAL_HALF, axis, fade: 1 });
  }

  let lastYaw = NaN;
  return {
    group, meshes: [...items.map(i => i.mesh), ...walls.map(w => w.mesh)],
    /** call every frame: camera position + the point it looks at, and the player (for fading walls in the way) */
    update(cam: Vector3, target: Vector3, player?: { x: number; z: number }, dt = 0.016) {
      const dx = cam.x - target.x, dz = cam.z - target.z, yaw = Math.atan2(dx, dz), l = Math.hypot(dx, dz) || 1, ux = dx / l, uz = dz / l;
      if (yaw !== lastYaw) { lastYaw = yaw; // the orthographic camera sees everything from the same angle
        for (const it of items) { setView(it, viewIndex(yaw, it.p.facing)); it.pivot.rotation.y = yaw; it.pivot.position.set(it.p.x + ux * it.p.depth, 0, it.p.z + uz * it.p.depth); }
      }
      const k = Math.min(1, dt * 8);
      for (const w of walls) { // a wall on the camera's side that the player is close to fades
        const near = w.nx * ux + w.nz * uz > 0.25, d = player ? Math.abs((w.axis === 'x' ? player.x : player.z) - w.line) : 99;
        const want = near && d < 11 ? 0.22 : 1; w.fade += (want - w.fade) * k; w.mat.opacity = w.fade; w.mat.depthWrite = w.fade > 0.6;
      }
      for (const it of items) if (it.p.fade || it.p.role || it.p.landmark) {
        const dx = it.p.x - (player?.x ?? 0), dz = it.p.z - (player?.z ?? 0);
        const depth = dx * ux + dz * uz, side = Math.abs(dx * uz - dz * ux);
        const obscures = player && depth >= 0 && depth < it.p.w && side < it.p.w * .45;
        const want = obscures ? 0.3 : 1; it.fade += (want - it.fade) * k; it.mat.opacity = it.fade; it.mat.depthWrite = it.fade > 0.6;
      }
    },
    dispose() { ground.geometry.dispose(); (ground.material as MeshStandardMaterial).map?.dispose(); },
  };
}
export type Capital = ReturnType<typeof buildCapital>;
