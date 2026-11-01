'use client';
// Round 17: every HUD window follows the screen size. The windows fit a 1040 × 800 area (the bag is 1000 px wide); on a smaller
// screen (or a short browser window) this sets --ui-s on <html> and src/styles/responsive.css zooms each window by it, so
// the whole window — frame, slots, text — shrinks together instead of being cut off. Phones keep their own layout
// (drawers / full-width windows), so the scale stays 1 there.
import { useEffect } from 'react';

const DESIGN_W = 1040, DESIGN_H = 800, MIN = 0.6;

export function uiScaleFor(w: number, h: number, coarse: boolean) {
  if (coarse || w <= 760) return 1;
  return Math.max(MIN, Math.min(1, w / DESIGN_W, h / DESIGN_H));
}

export default function UiScale() {
  useEffect(() => {
    const coarse = matchMedia('(pointer: coarse)');
    const apply = () => {
      const s = uiScaleFor(innerWidth, innerHeight, coarse.matches);
      document.documentElement.style.setProperty('--ui-s', s.toFixed(3));
    };
    apply();
    addEventListener('resize', apply); coarse.addEventListener('change', apply);
    return () => { removeEventListener('resize', apply); coarse.removeEventListener('change', apply); document.documentElement.style.removeProperty('--ui-s'); };
  }, []);
  return null;
}
