import { useRef } from 'react';
import { useGameStore } from './useGameStore';

type Player = ReturnType<typeof useGameStore.getState>['player'];

/** same player apart from position (position changes every frame while walking) */
export const samePlayerIgnoringPosition = (a: Player, b: Player) => {
  if (a === b) return true;
  const ka = Object.keys(a) as (keyof Player)[];
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every(k => k === 'position' || a[k] === b[k]);
};

/** The player for HUD panels: keeps the previous object while only the position moved, so walking no longer
 *  redraws every panel each frame. Components that need the position read it with their own selector. */
export function usePlayerStatic(): Player {
  const prev = useRef<Player | null>(null);
  return useGameStore(s => {
    const p = s.player;
    if (prev.current && samePlayerIgnoringPosition(prev.current, p)) return prev.current;
    prev.current = p;
    return p;
  });
}

/** the player position rounded to `step` metres, as primitives — re-renders only when the rounded value changes */
export function usePlayerCell(step = 1): [number, number] {
  const x = useGameStore(s => Math.round(s.player.position[0] / step) * step);
  const z = useGameStore(s => Math.round(s.player.position[1] / step) * step);
  return [x, z];
}
