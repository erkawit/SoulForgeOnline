// Painted capitals (approach A): one painted picture of the whole city, framed exactly like the Blender blockout
// (blender/city/blockout_city.py: orthographic, camera at +x +z, 35.264° up) + a depth map from the same blockout so
// characters walk behind buildings, + a 0.5-unit walk grid from the same footprints (1 = walkable, run-length coded).
export interface PaintedCity { color: string; depth: string; width: number; aspect: number; walk: { origin: number; step: number; n: number; first: number; runs: number[] } }
const HALF = 59; // CAPITAL_HALF used for the render framing (blockout: ortho_scale = 2 * (HALF + 4) * sqrt2 * 1.02)
export const PAINTED: Partial<Record<string, PaintedCity>> = {
  hollow: { color: '/art/city/hollow-painted.webp', depth: '/art/city/hollow-depth.png', width: 2 * (HALF + 4) * Math.SQRT2 * 1.02, aspect: 1902 / 2851,
    walk: { origin: -56, step: 0.5, n: 225, first: 1, runs: [3913,22,203,22,203,22,203,22,65,1,137,22,64,3,136,22,65,1,87,1,49,22,152,3,48,22,151,5,47,22,150,7,46,22,149,9,45,22,148,11,44,22,147,13,43,22,146,15,42,22,145,17,41,22,144,19,40,22,143,21,39,22,142,23,38,22,141,25,199,25,199,25,199,25,201,23,203,21,205,19,207,17,209,15,211,13,213,11,215,9,217,7,219,5,221,3,223,1,344,2,222,4,220,6,218,8,216,10,214,12,212,14,210,16,208,18,206,20,204,22,202,24,200,26,198,27,101,1,95,27,101,2,94,27,198,26,200,24,202,22,204,20,206,18,208,16,210,14,212,12,214,10,216,8,218,6,220,4,222,2,3007,18,207,18,207,18,207,18,164,1,42,18,163,3,41,18,162,5,40,18,161,7,39,18,160,9,38,18,159,11,37,18,158,13,36,18,157,15,35,18,156,17,8,1,25,18,155,19,6,3,24,18,154,21,6,1,25,18,153,23,31,18,152,25,30,18,151,27,29,18,81,5,64,27,30,18,81,5,63,27,31,18,81,5,62,27,32,18,81,5,61,27,33,18,81,5,62,25,34,18,149,23,203,21,205,19,207,17,209,15,211,13,213,11,215,9,217,7,219,5,221,3,223,1,3027,2,118,2,102,4,220,6,218,8,216,10,214,12,212,14,210,16,208,18,206,20,204,20,204,20,204,20,206,18,208,16,210,14,212,12,214,10,216,8,218,6,220,4,222,2,337,1,223,3,221,5,219,7,217,9,215,11,213,13,211,15,209,17,207,19,205,21,203,23,201,25,199,26,198,26,142,2,54,26,142,4,52,26,142,6,52,24,142,8,52,22,72,2,68,10,52,20,72,4,66,12,52,18,72,6,64,14,52,16,72,8,62,16,33,1,18,14,72,10,60,18,31,3,18,12,72,12,58,20,31,1,20,10,72,14,56,22,52,8,72,16,54,24,52,6,72,18,52,26,52,4,72,20,50,26,54,2,72,21,49,26,128,21,49,26,128,21,51,24,129,20,53,22,131,18,55,20,133,16,57,18,135,14,59,16,137,12,61,14,139,10,63,12,53,1,87,8,65,10,54,1,88,6,67,8,145,4,69,6,147,2,71,4,222,2,1336,2,223,1,11,2,223,2,2819] } },
};
const grids = new Map<string, Uint8Array>();
function grid(city: string): Uint8Array | null {
  const p = PAINTED[city]; if (!p) return null;
  let g = grids.get(city);
  if (!g) {
    g = new Uint8Array(p.walk.n * p.walk.n); let i = 0, v = p.walk.first;
    for (const r of p.walk.runs) { if (v) g.fill(1, i, i + r); i += r; v = 1 - v; }
    grids.set(city, g);
  }
  return g;
}
export const isPainted = (city: string) => !!PAINTED[city];
/** true when (x, z) is off the painted city's walk grid or on a blocked cell (buildings, gate towers, crates, the dais) */
export function paintedBlocked(city: string, x: number, z: number): boolean {
  const p = PAINTED[city], g = grid(city); if (!p || !g) return false;
  const { origin, step, n } = p.walk, i = Math.round((x - origin) / step), j = Math.round((z - origin) / step);
  if (i < 0 || j < 0 || i >= n || j >= n) return true;
  return g[j * n + i] === 0;
}
