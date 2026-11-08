// World units shared by the renderer, collision, travel and server.
import { navigationPlan, navigationSurface } from './terrainNavigation';
export const FIELD_HALF = 70;
export const FIELD_GATE_INSET = 5.5;
export const SORROWLANDS_SCALE = FIELD_HALF / 50;
export const fieldScale = (id: string) => id === 'wild0' ? SORROWLANDS_SCALE : FIELD_HALF / 23;

/** Roads stay human-sized as the distances between landmarks grow. */
export function onFieldRoad(id: string, x: number, z: number): boolean {
  if(navigationPlan(id)){const s=navigationSurface(id,x,z);return s==='road'||s==='plaza';}
  if (!id.startsWith('dungeon')) return Math.abs(x) < 2.6 || Math.abs(z) < 2.6;
  const s = fieldScale(id);
  return (Math.abs(x) < 2.6 && z <= 2.6) ||
    (Math.abs(Math.abs(x) - 20*s) < 2.6 && z >= -18*s-2.6 && z <= 20*s+2.6) ||
    (Math.abs(z+18*s) < 2.6 && Math.abs(x) <= 20*s+2.6) ||
    (Math.abs(z-20*s) < 2.6 && Math.abs(x) <= 20*s+2.6);
}
