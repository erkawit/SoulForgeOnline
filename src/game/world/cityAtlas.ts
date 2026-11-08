import { CAPITAL_HALF } from './capitalPlan';

// A single orthographic frame around the entire walled city, including its spires.
export const ATLAS_WIDTH = 1000;
export const ATLAS_HEIGHT = 680;
const scale = ATLAS_WIDTH / (2 * (CAPITAL_HALF + 6));
export function cityToAtlas(x: number, z: number): [number, number] {
  return [500 + (x - z) * scale / 2, 350 + (x + z) * scale / (2 * Math.sqrt(3))];
}
export function atlasToCity(u: number, v: number): [number, number] {
  const a = (u - 500) / scale, b = (v - 350) * Math.sqrt(3) / scale;
  return [b + a, b - a];
}
