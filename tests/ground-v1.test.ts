import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {bakedGroundUv} from '../src/game/world/groundBake';
import {portalsOf} from '../src/game/content';
import {farmPlan} from '../src/game/world/farmLayout';

const FIELDS=['wild0','wild1','wild2','wild3','wild4','wild5','wild6','wild7','wild8','wild9','dungeon1','dungeon2','dungeon3'];

test('ground-v1: every farm field ships its 4K bake', () => {
  for (const id of FIELDS) { assert.ok(farmPlan(id), id); assert.ok(fs.existsSync(`public/art/ground-v1/${id}/ground-basecolor-4096.webp`), id); }
});

test('ground-v1: UV follows the handoff (top-left pixel = x -120, z -120; flipY)', () => {
  assert.deepEqual(bakedGroundUv(-120, -120), [0, 1]);
  assert.deepEqual(bakedGroundUv(120, 120), [1, 0]);
  assert.deepEqual(bakedGroundUv(0, 0), [.5, .5]);
  // wild0 gate is north (top of the image), wild1 gate is east (right side): different image edges
  const g0 = portalsOf('wild0')[0], g1 = portalsOf('wild1')[0];
  const [u0, v0] = bakedGroundUv(g0.x, g0.z), [u1, v1] = bakedGroundUv(g1.x, g1.z);
  assert.ok(Math.abs(u0 - .5) < .01 && v0 > .95, `wild0 gate uv ${u0},${v0}`);
  assert.ok(u1 > .95 && Math.abs(v1 - .5) < .01, `wild1 gate uv ${u1},${v1}`);
});
