// "ไฟเตาหลอม" (Forge Fire): the gauge between the two soul vessels. It shows combat momentum — every hit you land
// stokes the forge, it cools down a few seconds after you stop fighting. UI only for now: it changes no stats
// (a gameplay use is proposed in the group-B design doc).
export const FORGE = { hit: 2, skill: 3, crit: 4, max: 100, holdSec: 3, coolPerSec: 6 } as const;
export type ForgeKind = 'hit' | 'skill' | 'crit';
export class ForgeFire {
  value = 0; private sinceHit = Infinity;
  hit(kind: ForgeKind) { this.value = Math.min(FORGE.max, this.value + FORGE[kind]); this.sinceHit = 0; }
  update(dt: number) { this.sinceHit += dt; if (this.sinceHit > FORGE.holdSec) this.value = Math.max(0, this.value - FORGE.coolPerSec * dt); return this.value; }
  /** 0 cold · 1 warm · 2 hot · 3 white-hot (colour steps of the gauge) */
  get heat() { return this.value >= 90 ? 3 : this.value >= 60 ? 2 : this.value >= 25 ? 1 : 0; }
}
