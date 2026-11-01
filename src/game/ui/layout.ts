// UX/UI spec v1 — shared by the React game (src/components/hud/*) and the preview build.
// Screen-scale rule, the theme palette and the T1–T8 tier colours live here so both layouts agree.
import type { Rarity } from '@/lib/types';

export type Layout = 'pc' | 'mobile';
/**
 * Spec rule: width < 768 px → Mobile set (MobileHUDLayout / MobileInventoryDrawer / MobileStatusPanel),
 * otherwise the PC set. Phones held sideways are wider than 768 but only ~390 px tall and driven by touch,
 * so a coarse pointer on a screen shorter than 500 px also gets the Mobile set.
 */
export function layoutFor(width: number, height: number, coarsePointer: boolean): Layout {
  if (width < 768) return 'mobile';
  if (coarsePointer && height < 500) return 'mobile';
  return 'pc';
}
export function currentLayout(): Layout {
  if (typeof window === 'undefined') return 'pc';
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  return layoutFor(window.innerWidth, window.innerHeight, coarse);
}

/** theme palette (spec §1) */
export const PALETTE = {
  bg: '#121316', metal: '#2A2725', gold: '#C89B3C',
  hp: '#990000', hpGlow: '#ff7a1a', mp1: '#1A237E', mp2: '#4A148C',
} as const;

/** spec tier scale T1…T8 mapped onto the game's eight rarities (Common … Arch) */
export const TIERS: { tier: number; code: string; rarity: Rarity; color: string; label: string }[] = [
  { tier: 1, code: 'T1', rarity: 'Common', color: '#FFFFFF', label: 'ธรรมดา' },
  { tier: 2, code: 'T2', rarity: 'Uncommon', color: '#4CAF50', label: 'ไม่ธรรมดา' },
  { tier: 3, code: 'T3', rarity: 'Rare', color: '#2196F3', label: 'หายาก' },
  { tier: 4, code: 'T4', rarity: 'Epic', color: '#9C27B0', label: 'มหากาพย์' },
  { tier: 5, code: 'T5', rarity: 'Legendary', color: '#F44336', label: 'ตำนาน' },
  { tier: 6, code: 'T6', rarity: 'God', color: '#FFD700', label: 'เทพ' },
  { tier: 7, code: 'T7', rarity: 'Pre-arch', color: '#FF9800', label: 'ก่อนอาร์ค' },
  { tier: 8, code: 'T8', rarity: 'Arch', color: '#E040FB', label: 'อาร์ค (Violet-Gold)' },
];
export const TIER_OF: Record<string, (typeof TIERS)[number]> = Object.fromEntries(TIERS.map(t => [t.rarity, t]));
export const tierColor = (r: string) => TIER_OF[r]?.color ?? '#FFFFFF';
/** T8 is drawn as a violet → gold gradient (spec "Violet-Gold") */
export const T8_GRADIENT = 'linear-gradient(135deg, #E040FB 0%, #b05cff 45%, #FFD700 100%)';

/** ฉายา shown on the status panel — earned by level until titles become a real progression system */
export const LEVEL_TITLES: [number, string][] = [
  [1, 'ผู้มาเยือนแดนโศก'], [10, 'ผู้พิทักษ์ซากปรักหักพัง'], [20, 'นักล่าแห่งอาสนวิหาร'], [35, 'ผู้หลอมวิญญาณ'], [50, 'ตำนานแห่ง SoulForge'],
];
export function levelTitle(level: number) { let t = LEVEL_TITLES[0][1]; for (const [lv, name] of LEVEL_TITLES) if (level >= lv) t = name; return t; }
