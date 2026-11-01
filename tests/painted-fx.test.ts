// Round 13: painted (Codex) skill effects — 8-way row choice, frame timing and the registry.
import test from 'node:test';
import assert from 'node:assert/strict';
import { dirRow, layerFrame, PAINTED_FX, paintedFor, type PaintedLayer } from '../src/game/fx/paintedFx';
import { DEFAULT_SKILLS } from '../src/game/skills/defaults';

test('a dir8 effect shows the row the caster faces on screen (same order as the hero sheets)', () => {
  const C = 0.7;
  assert.equal(dirRow(C, C), 0, 'toward the camera = S');
  assert.equal(dirRow(C + Math.PI, C), 4, 'away = N');
  assert.equal(dirRow(C + Math.PI / 2, C), 6, 'screen right = E');
  assert.equal(dirRow(C - Math.PI / 2, C), 2, 'screen left = W');
  assert.equal(dirRow(C + Math.PI / 4, C), 7, 'SE'); assert.equal(dirRow(C - 3 * Math.PI / 4, C), 3, 'NW');
});
test('layer frames start on time, stop at the end, and loops run until the action ends', () => {
  const l: PaintedLayer = { sheet: 'x', mode: 'ground', cw: 8, ch: 8, cols: 4, frames: 10, fps: 20, size: 1, start: 0.1 };
  assert.equal(layerFrame(l, 0.05, 1), null); assert.equal(layerFrame(l, 0.1, 1), 0); assert.equal(layerFrame(l, 0.55, 1), 9); assert.equal(layerFrame(l, 0.65, 1), null);
  const loop = { ...l, loop: true }; assert.equal(layerFrame(loop, 0.65, 1), 1); assert.equal(layerFrame(loop, 1.2, 1), null);
});
test('every registered effect belongs to a real skill (empty until Codex delivers)', () => {
  const ids = new Set([...DEFAULT_SKILLS.defs.map(d => d.id), 'basic-0', 'basic-1', 'basic-2']);
  for (const fx of Object.values(PAINTED_FX)) { assert.ok(fx.layers.length > 0, fx.id); for (const s of fx.skills) { assert.ok(ids.has(s), `${fx.id} → ${s}`); assert.equal(paintedFor(s), fx); } }
  assert.equal(paintedFor(undefined), null);
});
