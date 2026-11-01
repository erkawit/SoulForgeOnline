// Round 16 — ground loot drawn as the item's own icon inside a rarity card frame (the same art the bag shows,
// components/ItemDetails.tsx ItemArt), painted once into a canvas texture per item kind. GameWorld LootObject puts it
// on a small upright card that floats above the ground and spins around its vertical axis — no 3D models needed.
import { CanvasTexture, LinearFilter, SRGBColorSpace } from 'three';
import type { Item } from '@/lib/types';
import { RARITY_COLOR } from '@/lib/types';
import { ITEM_BY_ID, ITEM_ICONS } from '@/game/items';

const W = 192, H = 252;
/** rarity → card frame (public/art/ui/card-*.webp) */
const FRAME: Record<string, string> = { Common: 'common', Uncommon: 'uncommon', Rare: 'rare', Epic: 'epic' };
const frameOf = (r: string) => `/art/ui/card-${FRAME[r] ?? 'legend'}.webp`;
/** cells of public/art/ui-forge/items.png used by ForgeArt (x, y, w, h in px of the 1086 × 1448 sheet) */
const FORGE_CELLS: Record<string, [number, number, number, number]> = {
  'potion-hp-s': [20, 30, 155, 178], 'potion-hp-m': [191, 20, 165, 191], 'potion-hp-l': [366, 10, 175, 200],
  'potion-mp-s': [20, 237, 154, 177], 'potion-mp-m': [190, 227, 167, 187], 'material-ore': [5, 610, 172, 137],
};
const STONES = ['soul-stone-weapon', 'soul-stone-armor', 'soul-stone-accessory'];

type Src = { url: string; crop?: { col: number; cols: number; row: number; rows: number } | { px: [number, number, number, number] } } | { glyph: string; color: string };
/** where the item's picture comes from — mirrors ItemArt so the ground shows exactly what the bag shows */
export function iconSource(item: Item, gender: 'm' | 'f' = 'm'): Src {
  const id = item.definitionId ?? '', d = ITEM_BY_ID[id] as undefined | { atlas?: string; column: number; row: number; columns: number };
  const si = STONES.indexOf(id); if (si >= 0) return { url: '/art/ui-forge/soul-stones.png', crop: { col: si, cols: 3, row: 0, rows: 1 } };
  if (FORGE_CELLS[id]) return { url: '/art/ui-forge/items.png', crop: { px: FORGE_CELLS[id] } };
  if (d?.atlas === 'materials') {
    if (item.slot === 'costume') return { url: `/art/sprites/costume-thai-${gender}.webp` };
    return { glyph: id === 'codex-seal' ? '✦' : item.family === 'crystal' ? '◆' : id.startsWith('food') ? '🍲' : '⛏', color: RARITY_COLOR[item.rarity] ?? '#9fd8cf' };
  }
  if (ITEM_ICONS.has(id)) return { url: `/art/icons/items/${id}.webp` };
  if (d?.atlas === 'arms') return { url: '/art/items-arms.webp', crop: { col: d.column, cols: 10, row: d.row, rows: 8 } };
  if (d?.atlas === 'loot') return { url: '/art/items-loot.webp', crop: { col: d.column, cols: 6, row: d.row, rows: 4 } };
  if (d?.atlas) return { url: `/art/items-${d.atlas}.png`, crop: { col: d.column, cols: d.columns, row: d.row, rows: 8 } };
  return { glyph: item.slot === 'weapon' ? '⚔' : '◆', color: RARITY_COLOR[item.rarity] ?? '#e8d7aa' };
}

const images = new Map<string, Promise<HTMLImageElement>>();
const load = (url: string) => { let p = images.get(url); if (!p) { p = new Promise((ok, bad) => { const i = new Image(); i.decoding = 'async'; i.onload = () => ok(i); i.onerror = bad; i.src = url; }); images.set(url, p); } return p; };
const cache = new Map<string, CanvasTexture>();

/** the framed icon texture for this item (cached per kind + rarity); it fills in as soon as the pictures arrive */
export function lootTexture(item: Item, gender: 'm' | 'f' = 'm'): CanvasTexture {
  const key = `${item.definitionId}|${item.rarity}|${item.slot === 'costume' ? gender : ''}`;
  const hit = cache.get(key); if (hit) return hit;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const tex = new CanvasTexture(c); tex.colorSpace = SRGBColorSpace; tex.minFilter = LinearFilter; tex.generateMipmaps = false;
  cache.set(key, tex);
  const g = c.getContext('2d')!, src = iconSource(item, gender), glow = RARITY_COLOR[item.rarity] ?? '#e8d7aa';
  const paint = (frame: HTMLImageElement | null, icon: HTMLImageElement | null) => {
    g.clearRect(0, 0, W, H);
    // the card art has its own dark inside: frame first, then a rarity glow, then the picture on top
    if (frame) g.drawImage(frame, 0, 0, W, H);
    else { g.fillStyle = '#120e0c'; g.fillRect(6, 6, W - 12, H - 12); g.strokeStyle = '#b59558'; g.lineWidth = 6; g.strokeRect(6, 6, W - 12, H - 12); }
    const rg = g.createRadialGradient(W / 2, H / 2, 6, W / 2, H / 2, W * .5); rg.addColorStop(0, glow + '88'); rg.addColorStop(1, glow + '00');
    g.fillStyle = rg; g.fillRect(16, 18, W - 32, H - 36);
    const bw = W - 52, bh = H - 64; // picture box inside the frame
    if (icon && 'url' in src) {
      let sx = 0, sy = 0, sw = icon.naturalWidth, sh = icon.naturalHeight; const cr = src.crop;
      if (cr && 'px' in cr) [sx, sy, sw, sh] = cr.px;
      else if (cr) { sw = icon.naturalWidth / cr.cols; sh = icon.naturalHeight / cr.rows; sx = cr.col * sw; sy = cr.row * sh; }
      const k = Math.min(bw / sw, bh / sh), dw = sw * k, dh = sh * k;
      g.shadowColor = '#000c'; g.shadowBlur = 10; g.drawImage(icon, sx, sy, sw, sh, (W - dw) / 2, (H - dh) / 2, dw, dh); g.shadowBlur = 0;
    } else if ('glyph' in src) {
      g.font = `900 ${Math.round(bw * .7)}px Georgia, serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = src.color; g.shadowBlur = 22; g.fillStyle = src.color; g.fillText(src.glyph, W / 2, H / 2 + 6); g.shadowBlur = 0;
    }
    tex.needsUpdate = true;
  };
  paint(null, null);
  Promise.allSettled([load(frameOf(item.rarity)), 'url' in src ? load(src.url) : Promise.reject()]).then(([f, i]) =>
    paint(f.status === 'fulfilled' ? f.value : null, i.status === 'fulfilled' ? i.value : null));
  return tex;
}
export const LOOT_CARD_ASPECT = W / H;
