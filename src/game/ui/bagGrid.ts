// Spec inventory: a 10 × 10 grid where items occupy footprints (1×1, 2×1, 2×2, weapons 1×3).
// Pure placement logic — no DOM — shared by the PC panel (drag & drop) and tests. The mobile drawer shows the
// same items as a 5-column list, so the grid positions only matter on PC.
export const GRID_W = 10, GRID_H = 10;
export type GridPos = { x: number; y: number };
export type Sized = { id: string; slot?: string | null; family?: string | null };
export type Placement = GridPos & { id: string; w: number; h: number };

/** footprint in cells: weapon 1×3 · body armour / helmet / gloves / boots / costume 2×2 · ring + stackables 1×1 */
export function itemSize(it: Sized): { w: number; h: number } {
  switch (it.slot) {
    case 'weapon': return { w: 1, h: 3 };
    case 'armor': case 'costume': return { w: 2, h: 2 };
    case 'helmet': case 'gloves': case 'boots': return { w: 2, h: 2 };
    case 'ring': return { w: 1, h: 1 };
    default: return it.family === 'trophy' ? { w: 2, h: 1 } : { w: 1, h: 1 };
  }
}
function occupied(placed: Placement[], skip?: string) {
  const g: (string | null)[][] = Array.from({ length: GRID_H }, () => Array<string | null>(GRID_W).fill(null));
  for (const p of placed) if (p.id !== skip) for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) if (y < GRID_H && x < GRID_W) g[y][x] = p.id;
  return g;
}
export function fits(placed: Placement[], it: Sized, x: number, y: number) {
  const { w, h } = itemSize(it); if (x < 0 || y < 0 || x + w > GRID_W || y + h > GRID_H) return false;
  const g = occupied(placed, it.id);
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (g[yy][xx]) return false;
  return true;
}
/** first free spot, scanning rows top → bottom */
export function firstFit(placed: Placement[], it: Sized): GridPos | null {
  for (let y = 0; y < GRID_H; y++) for (let x = 0; x < GRID_W; x++) if (fits(placed, it, x, y)) return { x, y };
  return null;
}
/**
 * Lay the bag out: keep every saved position that is still valid, then drop the rest into the first free spot
 * (big items first so they still find room). Items that do not fit go to `overflow` and are listed under the grid.
 */
export function layoutBag(items: Sized[], saved: Record<string, GridPos> = {}): { placed: Placement[]; overflow: string[]; positions: Record<string, GridPos> } {
  const placed: Placement[] = []; const rest: Sized[] = [];
  for (const it of items) { const p = saved[it.id]; if (p && fits(placed, it, p.x, p.y)) placed.push({ id: it.id, ...p, ...itemSize(it) }); else rest.push(it); }
  rest.sort((a, b) => { const A = itemSize(a), B = itemSize(b); return B.w * B.h - A.w * A.h; });
  const overflow: string[] = [];
  for (const it of rest) { const p = firstFit(placed, it); if (p) placed.push({ id: it.id, ...p, ...itemSize(it) }); else overflow.push(it.id); }
  const positions: Record<string, GridPos> = {}; for (const p of placed) positions[p.id] = { x: p.x, y: p.y };
  return { placed, overflow, positions };
}
/** move one item; returns the new saved positions or null when the target is blocked / outside the grid */
export function moveItem(items: Sized[], saved: Record<string, GridPos>, id: string, x: number, y: number): Record<string, GridPos> | null {
  const it = items.find(i => i.id === id); if (!it) return null;
  const { placed } = layoutBag(items, saved);
  if (!fits(placed, it, x, y)) return null;
  const { positions } = layoutBag(items, { ...Object.fromEntries(placed.map(p => [p.id, { x: p.x, y: p.y }])), [id]: { x, y } });
  return positions;
}
/** free cells left (for the "ช่องว่าง" counter) */
export function freeCells(placed: Placement[]) { return GRID_W * GRID_H - placed.reduce((a, p) => a + p.w * p.h, 0); }
