// Spec inventory grid: 10 columns, one row per 10 bag slots (200 slots = 20 rows, expandable to 300 = 30 rows).
// Round 25: every item takes ONE cell, so the bag holds exactly as many items as it has slots (the old 10 × 10 grid with
// 2 × 2 armour footprints held only a few dozen). Pure placement logic — no DOM — shared by the PC panel (drag & drop)
// and tests. The mobile drawer shows the same items as a 5-column list.
export const GRID_W = 10;
/** default number of rows (200 slots) */
export const GRID_H = 20;
export type GridPos = { x: number; y: number };
export type Sized = { id: string; slot?: string | null; family?: string | null };
export type Placement = GridPos & { id: string; w: number; h: number };

/** footprint in cells — one slot per item */
export function itemSize(_it: Sized): { w: number; h: number } { return { w: 1, h: 1 }; }
export const rowsFor = (slots: number) => Math.max(1, Math.ceil(slots / GRID_W));

function occupied(placed: Placement[], rows: number, skip?: string) {
  const g: (string | null)[][] = Array.from({ length: rows }, () => Array<string | null>(GRID_W).fill(null));
  for (const p of placed) if (p.id !== skip) for (let y = p.y; y < p.y + p.h; y++) for (let x = p.x; x < p.x + p.w; x++) if (y < rows && x < GRID_W) g[y][x] = p.id;
  return g;
}
export function fits(placed: Placement[], it: Sized, x: number, y: number, rows = GRID_H) {
  const { w, h } = itemSize(it); if (x < 0 || y < 0 || x + w > GRID_W || y + h > rows) return false;
  const g = occupied(placed, rows, it.id);
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) if (g[yy][xx]) return false;
  return true;
}
/** first free spot, scanning rows top → bottom */
export function firstFit(placed: Placement[], it: Sized, rows = GRID_H): GridPos | null {
  const g = occupied(placed, rows, it.id);
  for (let y = 0; y < rows; y++) for (let x = 0; x < GRID_W; x++) if (!g[y][x]) return { x, y };
  return null;
}
/** Lay the bag out: keep every saved position that is still valid, then drop the rest into the first free spot.
 *  Items that do not fit go to `overflow` and are listed under the grid. */
export function layoutBag(items: Sized[], saved: Record<string, GridPos> = {}, rows = GRID_H): { placed: Placement[]; overflow: string[]; positions: Record<string, GridPos> } {
  const placed: Placement[] = []; const rest: Sized[] = [];
  const g = occupied([], rows);
  const take = (it: Sized, x: number, y: number) => { placed.push({ id: it.id, x, y, w: 1, h: 1 }); g[y][x] = it.id; };
  for (const it of items) { const p = saved[it.id]; if (p && p.x >= 0 && p.y >= 0 && p.x < GRID_W && p.y < rows && !g[p.y][p.x]) take(it, p.x, p.y); else rest.push(it); }
  const overflow: string[] = []; let cur = 0;
  for (const it of rest) { while (cur < rows * GRID_W && g[Math.floor(cur / GRID_W)][cur % GRID_W]) cur++; if (cur >= rows * GRID_W) { overflow.push(it.id); continue; } take(it, cur % GRID_W, Math.floor(cur / GRID_W)); }
  const positions: Record<string, GridPos> = {}; for (const p of placed) positions[p.id] = { x: p.x, y: p.y };
  return { placed, overflow, positions };
}
/** move one item; returns the new saved positions or null when the target is blocked / outside the grid */
export function moveItem(items: Sized[], saved: Record<string, GridPos>, id: string, x: number, y: number, rows = GRID_H): Record<string, GridPos> | null {
  const it = items.find(i => i.id === id); if (!it) return null;
  const { placed } = layoutBag(items, saved, rows);
  if (!fits(placed, it, x, y, rows)) return null;
  const { positions } = layoutBag(items, { ...Object.fromEntries(placed.map(p => [p.id, { x: p.x, y: p.y }])), [id]: { x, y } }, rows);
  return positions;
}
/** free cells left (for the "ช่องว่าง" counter) */
export function freeCells(placed: Placement[], rows = GRID_H) { return GRID_W * rows - placed.reduce((a, p) => a + p.w * p.h, 0); }
