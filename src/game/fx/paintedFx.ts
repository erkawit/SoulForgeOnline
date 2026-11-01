// Round 13: painted skill effects from Codex (output/skill-fx-codex) — played instead of the procedural effect of the
// same skill when registered (scripts/import-codex-fx.mjs → src/game/fx/fx8.json). Each effect is a stack of layers:
//   ground    — top-down flipbook lying on the ground, turned with the caster's facing (rings, cracks, spirals)
//   billboard — upright flipbook that always faces the camera (spikes, bursts, roars, auras)
//   dir8      — upright flipbook painted in 8 directions (S, SW, W, NW, N, NE, E, SE: a slash arc, a dash trail); the row
//               is picked from the caster's facing relative to the camera, exactly like the 8-way character sheets
// Times are seconds from the cast; a `loop` layer repeats until the action ends (Whirlwind, auras).
import { AdditiveBlending, DoubleSide, Group, Mesh, MeshBasicMaterial, NormalBlending, PlaneGeometry, SRGBColorSpace, TextureLoader, type Camera, type Object3D, type Texture, type Vector3 } from 'three';
import FX8 from './fx8.json';
import type { FxHandle } from './skillFx';

export type PaintedLayer = {
  sheet: string; mode: 'ground' | 'billboard' | 'dir8'; cw: number; ch: number; cols: number; frames: number; fps: number;
  /** width in metres */ size: number; /** [forward, up] metres from the caster (ground layers: forward only) */ offset?: [number, number];
  blend?: 'add' | 'normal'; start?: number; loop?: boolean;
};
export type PaintedFx = { id: string; skills: string[]; layers: PaintedLayer[]; hitAt: number; duration: number };
export const PAINTED_FX = FX8 as unknown as Record<string, PaintedFx>;
const BY_SKILL = new Map<string, PaintedFx>();
for (const fx of Object.values(PAINTED_FX)) for (const s of fx.skills) BY_SKILL.set(s, fx);
/** the painted effect for a skill id (basic attack steps are `basic-0`, `basic-1`, `basic-2`), if Codex made one */
export const paintedFor = (skillId: string | undefined) => (skillId ? BY_SKILL.get(skillId) ?? null : null);

/** 8-way row for a facing `yaw` seen from a camera at `camYaw` (both atan2(x, z)); same order as the character sheets */
const SECTOR_ROW = [0, 7, 6, 5, 4, 3, 2, 1];
export function dirRow(yaw: number, camYaw: number) { const rel = Math.atan2(Math.sin(yaw - camYaw), Math.cos(yaw - camYaw)); return SECTOR_ROW[((Math.round(rel / (Math.PI / 4)) % 8) + 8) % 8]; }
/** which frame of a layer shows at time t (null = not started / finished) */
export function layerFrame(l: PaintedLayer, t: number, until: number): number | null {
  const s = t - (l.start ?? 0); if (s < 0) return null; const i = Math.floor(s * l.fps);
  if (l.loop) return t < until ? i % l.frames : null; return i < l.frames ? i : null;
}

const loader = new TextureLoader(); const cache = new Map<string, Texture>();
function sheetTex(sheet: string) {
  let t = cache.get(sheet); if (!t) { t = loader.load(`/art/fx/${sheet}.webp`); t.colorSpace = SRGBColorSpace; cache.set(sheet, t); }
  const c = t.clone(); c.needsUpdate = true; return c;
}
export function spawnPaintedFx(scene: Object3D, fx: PaintedFx, o: { origin: Vector3; yaw: number; camera: () => Camera | null; durationSec?: number }): FxHandle {
  const root = new Group(); root.position.copy(o.origin); scene.add(root);
  const until = Math.max(fx.duration, o.durationSec ?? 0), end = Math.max(until, ...fx.layers.filter(l => !l.loop).map(l => (l.start ?? 0) + l.frames / l.fps));
  const parts = fx.layers.map(l => {
    const tex = sheetTex(l.sheet), rows = Math.ceil((l.mode === 'dir8' ? l.frames * 8 : l.frames) / l.cols); tex.repeat.set(1 / l.cols, 1 / rows);
    const mat = new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, side: DoubleSide, blending: l.blend === 'normal' ? NormalBlending : AdditiveBlending });
    const h = l.size * l.ch / l.cw, mesh = new Mesh(new PlaneGeometry(l.size, h), mat); mesh.visible = false; mesh.frustumCulled = false; mesh.renderOrder = 20;
    const [fwd, up] = l.offset ?? [0, 0], fx_ = Math.sin(o.yaw) * fwd, fz = Math.cos(o.yaw) * fwd;
    // ground: lies flat, the top edge of the picture points where the caster faces
    if (l.mode === 'ground') { mesh.rotation.order = 'YXZ'; mesh.rotation.set(-Math.PI / 2, o.yaw + Math.PI, 0); mesh.position.set(fx_, 0.03, fz); }
    else mesh.position.set(fx_, up + h / 2, fz);
    root.add(mesh); return { l, mesh, mat, tex, rows };
  });
  let t = 0;
  const handle: FxHandle = {
    object: root,
    update(dt: number) {
      t += dt; const cam = o.camera();
      for (const p of parts) {
        const f = layerFrame(p.l, t, until); p.mesh.visible = f !== null; if (f === null) continue;
        let idx = f;
        if (p.l.mode !== 'ground' && cam) { p.mesh.quaternion.copy(cam.quaternion); }
        if (p.l.mode === 'dir8' && cam) idx = dirRow(o.yaw, Math.atan2(cam.position.x - o.origin.x, cam.position.z - o.origin.z)) * p.l.frames + f;
        p.tex.offset.set((idx % p.l.cols) / p.l.cols, 1 - (Math.floor(idx / p.l.cols) + 1) / p.rows);
      }
      return t < end + 0.05;
    },
    dispose() { for (const p of parts) { p.mesh.geometry.dispose(); p.mat.dispose(); p.tex.dispose(); } root.removeFromParent(); },
  };
  return handle;
}
