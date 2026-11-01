// Round 13: layered 8-way heroes (the chibi Berserker / Reaver from output/berserker-chibi-codex).
// Codex paints the body+outfit frames WITHOUT hair and weapon, and writes per-frame data (frames.json): the head anchor,
// both grip points, the weapon view / angle / flip / z-order and the hit event. The game stacks three layers per frame:
//   weapon (z: back) → body+outfit (the flipbook) → hair (placed on the head anchor) → weapon (z: front)
// The weapon is one rigid picture: it is only rotated and moved so its two grip marks sit on the frame's two hands —
// never stretched, bent or mirrored per frame (the user's grip rules: left hand near the head, right hand toward the
// pommel; a mirrored axe frame would swap the hands). scripts/import-codex-hero.mjs turns Codex's frames.json into
// src/game/sprites/rigs/*.json + rigs/index.ts; nothing here needs editing when the art lands.
import type { SpriteAnim } from './anims';

export const DIRS = ['S', 'SW', 'W', 'NW', 'N', 'NE', 'E', 'SE'] as const;
export type Dir = typeof DIRS[number];
export type WeaponView = 'broad' | 'edge' | 'three_quarter';
export const WEAPON_VIEWS: WeaponView[] = ['broad', 'edge', 'three_quarter'];
type P = { x: number; y: number };
/** one painted frame — coordinates are pixels inside the GAME cell (cw × ch), origin top-left, y down */
export type RigFrame = {
  clip: string; dir: Dir; frame: number; durationMs?: number;
  head: P & { rot?: number }; gripL: P; gripR: P;
  weapon: { view: WeaponView; angle?: number; flipX?: boolean; z: 'front' | 'back' } | null;
  event?: 'hit' | string;
  /** the fists are drawn again over the weapon on this frame (public/art/anim/<key>-hands.webp, same cell) so the
   *  fingers close over the shaft: body → weapon → hands */
  hands?: boolean;
};
export type LayeredRig = {
  /** the body sheet (public/art/anim/<key>.webp) and its SPRITE_ANIMS entry */
  key: string; anim: SpriteAnim;
  /** hair sheets: public/art/anim/hair/<style>.webp — one row of 8 cells (S … SE); anchor = the skull point inside a cell */
  hair: { cw: number; ch: number; anchor: [number, number]; styles: string[] };
  /** weapon sheets: public/art/anim/weapon/<kind>-t<1..8>.webp — one row of 3 cells (broad, edge, three_quarter) drawn at
   *  the same pixel scale as the body cells; gripL / gripR = where the left / right hand closes on the shaft in that view */
  weapon: { cw: number; ch: number; views: Record<WeaponView, { gripL: [number, number]; gripR: [number, number] }>; sheets: string[] };
  /** frames[clip][dirIndex][frame] */
  frames: Record<string, RigFrame[][]>;
  /** a hands sheet exists (<key>-hands.webp, same grid as the body sheet) */
  hands?: boolean;
  /** hair styles rendered in 3D with the body: <key>-hair-<style>.webp, same grid as the body sheet (neutral grey, tinted) */
  hair3d?: string[];
  /** weapon tiers rendered in 3D with the body: <key>-gs-t<1..tiers>.webp and fashion skins <key>-gs-<skin>.webp (same grid as the body sheet) */
  weapon3d?: { kind: string; tiers: number; skins?: string[] };
};

/** game cell px → body-plane local units (the flipbook plane puts the foot pivot fx/fy at the origin, y up) */
export function cellToLocal(a: SpriteAnim, worldH: number, x: number, y: number) {
  const wpp = worldH / a.bodyPx; return { x: (x - a.fx * a.cw) * wpp, y: ((a.ch - y) - a.fy * a.ch) * wpp };
}
export function rigFrame(rig: LayeredRig, clip: string, dir: number, frame: number): RigFrame | null {
  const runs = rig.frames[clip] ?? rig.frames.idle; if (!runs) return null;
  const run = runs[dir] ?? runs[0]; if (!run?.length) return null;
  return run[Math.max(0, Math.min(run.length - 1, frame))] ?? null;
}
export type Placement = {
  hair: { x: number; y: number; rot: number; cell: number } | null;
  weapon: { x: number; y: number; rot: number; cell: number; flipX: boolean; front: boolean; stretch: number } | null;
};
/**
 * where the hair and the weapon go on this frame, in body-plane local units (rot in radians, counter-clockwise).
 * The weapon rotation comes from the two hands (so the shaft always passes through both), its position puts the
 * midpoint of the picture's grip marks on the midpoint of the hands; `stretch` reports how far the hands are from the
 * picture's grip spacing (1 = exact) — the picture itself is never scaled.
 */
export function placeLayers(rig: LayeredRig, f: RigFrame, dir: number, worldH: number): Placement {
  const a = rig.anim, wpp = worldH / a.bodyPx;
  const head = cellToLocal(a, worldH, f.head.x, f.head.y);
  const [hax, hay] = rig.hair.anchor;
  // the hair cell is centred on its mesh: move it so the anchor lands on the head point, then tilt with the head
  const hr = -((f.head.rot ?? 0) * Math.PI) / 180, hdx = (rig.hair.cw / 2 - hax) * wpp, hdy = (hay - rig.hair.ch / 2) * wpp;
  const hair = { x: head.x + hdx * Math.cos(hr) - hdy * Math.sin(hr), y: head.y + hdx * Math.sin(hr) + hdy * Math.cos(hr), rot: hr, cell: dir };
  if (!f.weapon) return { hair, weapon: null };
  const v = rig.weapon.views[f.weapon.view] ?? rig.weapon.views.broad, flip = !!f.weapon.flipX, W = rig.weapon.cw, H = rig.weapon.ch;
  // picture grip marks in picture-local units (centre origin, y up); a flipped picture mirrors its marks too
  const pic = (p: [number, number]) => ({ x: ((flip ? W - p[0] : p[0]) - W / 2) * wpp, y: (H / 2 - p[1]) * wpp });
  const pl = pic(v.gripL), pr = pic(v.gripR);
  const hl = cellToLocal(a, worldH, f.gripL.x, f.gripL.y), hrp = cellToLocal(a, worldH, f.gripR.x, f.gripR.y);
  const rot = Math.atan2(hrp.y - hl.y, hrp.x - hl.x) - Math.atan2(pr.y - pl.y, pr.x - pl.x);
  const mx = (pl.x + pr.x) / 2, my = (pl.y + pr.y) / 2, c = Math.cos(rot), s = Math.sin(rot);
  const hx = (hl.x + hrp.x) / 2, hy = (hl.y + hrp.y) / 2;
  const handGap = Math.hypot(hrp.x - hl.x, hrp.y - hl.y), picGap = Math.hypot(pr.x - pl.x, pr.y - pl.y) || 1;
  return { hair, weapon: { x: hx - (mx * c - my * s), y: hy - (mx * s + my * c), rot, cell: Math.max(0, WEAPON_VIEWS.indexOf(f.weapon.view)), flipX: flip, front: f.weapon.z !== 'back', stretch: handGap / picGap } };
}
/** fraction (0..1) of a clip where its `hit` event lands (for syncing damage numbers / VFX), or null */
export function hitFraction(rig: LayeredRig, clip: string): number | null {
  const run = rig.frames[clip]?.[0]; if (!run?.length) return null;
  const i = run.findIndex(f => f.event === 'hit'); if (i < 0) return null;
  const total = run.reduce((t, f) => t + (f.durationMs ?? 0), 0);
  return total > 0 ? run.slice(0, i).reduce((t, f) => t + (f.durationMs ?? 0), 0) / total : i / run.length;
}
/** weapon sheet for an equipped weapon: its own kind first, then the closest painted kind, so no hero is ever empty-handed */
export function weaponSheet(rig: LayeredRig, kind: string, tier: number): string | null {
  const t = Math.max(1, Math.min(8, tier + 1));
  for (const k of [kind, 'greataxe', 'greatsword', 'greathammer']) {
    if (rig.weapon.sheets.includes(`${k}-t${t}`)) return `${k}-t${t}`;
    const any = rig.weapon.sheets.filter(s => s.startsWith(k + '-t')).sort((x, y) => Math.abs(+x.split('-t')[1] - t) - Math.abs(+y.split('-t')[1] - t))[0];
    if (any) return any;
  }
  return null;
}
