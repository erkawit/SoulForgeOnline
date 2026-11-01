import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { SPRITE_ANIMS, ANIM_ALIAS, animFor } from '../src/game/sprites/anims';
import { SPRITE_FRAMES } from '../src/game/sprites/frames';

test('flipbooks: every atlas exists, matches its cell grid, and every clip stays inside the frame count', () => {
  for (const [id, a] of Object.entries(SPRITE_ANIMS)) {
    assert.ok(SPRITE_FRAMES[id.replace(/-lite$/, '')], `${id} needs a key-pose frame for its world size`);
    const file = `public/art/anim/${id}.webp`; assert.ok(existsSync(file), file);
    // webp VP8X header: canvas width/height minus one, 24-bit little endian at bytes 24..29
    const b = readFileSync(file); const w = 1 + b.readUIntLE(24, 3), h = 1 + b.readUIntLE(27, 3);
    assert.equal(w, a.cols * a.cw, `${id} atlas width`); assert.equal(h, Math.ceil(a.n / a.cols) * a.ch, `${id} atlas height`);
    assert.ok(w <= 4096 && h <= 4096, `${id} fits a 4096 texture`);
    assert.ok(a.clips.idle, `${id} has idle`); assert.ok(a.clips.attack || a.clips.cast, `${id} has attack or cast`);
    for (const [name, [s, n]] of Object.entries(a.clips)) assert.ok(s >= 0 && n > 0 && s + n <= a.n, `${id}.${name}`);
  }
  for (const [id, to] of Object.entries(ANIM_ALIAS)) assert.equal(animFor(id)?.key, to);
  assert.equal(animFor('hero:m:Warrior')?.key, 'm-Warrior'); assert.equal(animFor('hero:f:Warrior')?.key, 'f-Warrior'); assert.equal(SPRITE_ANIMS['m-Mage'].dirs, 8); assert.equal(animFor('hero:m:Warrior:thai'), null);
});
