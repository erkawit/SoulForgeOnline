// Secondary motion ("physics") for chibi rigs: capes, skirts, braids, plumes and hat tips lag behind the body,
// swing when the character accelerates or turns, flutter while running and settle with a damped spring.
// Apply AFTER the animation mixer each frame — it adds a small rotation on top of the clip pose.
import { Euler, Quaternion, Vector3, type Bone, type Object3D } from 'three';

type Spring = { bone: Bone; px: number; pz: number; vx: number; vz: number; stiff: number; damp: number; gain: number; lift: number; parent?: Spring };
const PRESET: Record<string, Partial<Spring>> = {
  Cape: { stiff: 38, damp: 7, gain: 0.55, lift: 0.18 }, CapeLow: { stiff: 30, damp: 5.5, gain: 0.8, lift: 0.22 },
  SkirtR: { stiff: 55, damp: 9, gain: 0.35, lift: 0.08 }, SkirtL: { stiff: 55, damp: 9, gain: 0.35, lift: 0.08 },
  HairTail: { stiff: 42, damp: 6, gain: 0.65, lift: 0.2 },
};
export type SpringRig = { update: (dt: number) => void; impulse: (forward: number, side: number) => void };

/** `root` is the object that moves through the world (its world position/rotation drive the springs). */
export function createSpringRig(model: Object3D, root: Object3D, names: string[] = Object.keys(PRESET)): SpringRig {
  const springs: Spring[] = [];
  for (const n of names) { const b = model.getObjectByName(n) as Bone | undefined; if (b) springs.push({ bone: b, px: 0, pz: 0, vx: 0, vz: 0, stiff: 40, damp: 7, gain: 0.5, lift: 0.1, ...PRESET[n] }); }
  for (const s of springs) if (s.bone.name === 'CapeLow') s.parent = springs.find(p => p.bone.name === 'Cape');
  const last = new Vector3(), vel = new Vector3(), prevVel = new Vector3(), tmp = new Vector3(), q = new Quaternion(), e = new Euler();
  let lastYaw = 0, first = true, kick = { f: 0, s: 0 };
  return {
    impulse: (f, s) => { kick.f += f; kick.s += s; },
    update: dt => {
      if (!springs.length || dt <= 0) return; dt = Math.min(dt, 1 / 30);
      root.getWorldPosition(tmp); if (first) { last.copy(tmp); first = false; }
      vel.subVectors(tmp, last).divideScalar(dt); last.copy(tmp);
      const acc = vel.clone().sub(prevVel).divideScalar(dt); prevVel.copy(vel);
      // world yaw (works when `root` is the model inside a rotating parent group, as in the R3F actors)
      root.updateWorldMatrix(true, false); const me = root.matrixWorld.elements, yaw = Math.atan2(me[8], me[10]), yawRate = Math.atan2(Math.sin(yaw - lastYaw), Math.cos(yaw - lastYaw)) / dt; lastYaw = yaw;
      // into the character's local frame (+Z forward)
      const c = Math.cos(yaw), sn = Math.sin(yaw), fwdSpeed = vel.x * sn + vel.z * c, fwdAcc = acc.x * sn + acc.z * c, sideAcc = acc.x * c - acc.z * sn;
      const speed = Math.hypot(vel.x, vel.z), t = performance.now() / 1000;
      for (const s of springs) {
        // target: lifted back by drag while running, swung by acceleration and turning, plus a running flutter
        const flutter = speed > 0.5 ? Math.sin(t * 13 + s.stiff) * 0.06 * Math.min(1, speed / 3) : 0;
        let tx = Math.min(0.9, s.lift * fwdSpeed) + (-fwdAcc * 0.012 + kick.f) * s.gain + flutter;
        let tz = (sideAcc * 0.01 + yawRate * 0.05 + kick.s) * s.gain;
        if (s.parent) { tx += s.parent.px * 0.6; tz += s.parent.pz * 0.6; }
        s.vx += (-(s.px - tx) * s.stiff - s.vx * s.damp) * dt; s.vz += (-(s.pz - tz) * s.stiff - s.vz * s.damp) * dt;
        s.px = Math.max(-0.4, Math.min(1.3, s.px + s.vx * dt)); s.pz = Math.max(-0.6, Math.min(0.6, s.pz + s.vz * dt));
        q.setFromEuler(e.set(s.px, 0, s.pz)); s.bone.quaternion.multiply(q);
      }
      kick.f *= Math.exp(-dt * 10); kick.s *= Math.exp(-dt * 10);
    },
  };
}
