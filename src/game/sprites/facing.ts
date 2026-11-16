// Left / right only (Nov 2026): every actor shows one painted facing (screen right) and is mirrored for screen left.
// The camera yaw is locked to the iso default (GameWorld FollowCamera), so "screen right" is one fixed world direction.
// The sprite (spriteActor) and the attack / skill effects (skillFx, paintedFx) both take their side from screenSide(),
// so a slash can never fly one way while the body faces the other.

/** camera at +x +z looking at the player: screen right on the ground is (1, 0, -1) / √2 */
export const SCREEN_RIGHT: readonly [number, number] = [Math.SQRT1_2, -Math.SQRT1_2];
/** world yaw (atan2(x, z) convention) of "facing screen right" / "facing screen left" */
export const YAW_RIGHT = Math.atan2(SCREEN_RIGHT[0], SCREEN_RIGHT[1]);
export const YAW_LEFT = YAW_RIGHT - Math.PI;
/** 8-way sheets keep only this row (E = painted facing screen right); scripts/sprites/extract_2dir.py cuts it out */
export const TWO_DIR_ROW = 6;
/** +1 when a facing `yaw` points to the right half of the screen, -1 for the left half (ties go right) */
export function screenSide(yaw: number): 1 | -1 {
  return Math.sin(yaw) * SCREEN_RIGHT[0] + Math.cos(yaw) * SCREEN_RIGHT[1] >= 0 ? 1 : -1;
}
/** how far `yaw` points sideways on screen, -1 (left) … +1 (right); near 0 = straight up / down the screen */
export const screenX = (yaw: number) => Math.sin(yaw) * SCREEN_RIGHT[0] + Math.cos(yaw) * SCREEN_RIGHT[1];
/** the facing snapped to screen right / left — use for slashes, arcs and anything that leaves the body */
export const sideYaw = (yaw: number) => (screenSide(yaw) > 0 ? YAW_RIGHT : YAW_LEFT);
