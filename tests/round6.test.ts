// Round 6: sprite-gen Breathe idles for painted stills, the painted UI kit pieces.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { BREATH_ANIMS } from '../src/game/sprites/breath';
import { SPRITE_FRAMES } from '../src/game/sprites/frames';
import { SPRITE_ANIMS, animFor } from '../src/game/sprites/anims';
import { NPCS } from '../src/game/npcs';
import { npcSpriteId, heroId, actorDef } from '../src/game/sprites/catalog';

test('every painted still without a flipbook breathes (female heroes, costumes, NPCs, sheetless monsters)', () => {
  for (const [id, b] of Object.entries(BREATH_ANIMS)) {
    assert.ok(SPRITE_FRAMES[id], id); assert.ok(!SPRITE_ANIMS[id], `${id} already has a flipbook`); assert.equal(b.n % b.cols, 0);
    assert.ok(existsSync(`public/art/anim/breath/${id}.webp`), `${id} atlas`);
  }
  // round 13: the Berserker / Reaver looks are rig-animated painted poses until the Codex 8-way frames ship
  for (const g of ['m', 'f'] as const) for (const p of [null, 'Reaver']) { const id = heroId('Berserker', g, null, p), base = actorDef(id).base; assert.ok(BREATH_ANIMS[base] || animFor(id) || /-look-/.test(base), id); }
  for (const n of NPCS) assert.ok(BREATH_ANIMS[npcSpriteId(n.name)!], n.name);
});

test('the UI kit ships every piece the stylesheets reference', () => {
  for (const css of ['src/styles/uikit.css', '../preview/src/uikit.css'].filter(existsSync)) {
    const refs = [...readFileSync(css, 'utf8').matchAll(/url\((?:\/|)art\/ui\/([\w-]+\.(?:webp|png))\)/g)].map(m => m[1]);
    assert.ok(refs.length > 20, css);
    for (const f of new Set(refs)) assert.ok(existsSync(`public/art/ui/${f}`), `${css}: ${f}`);
  }
});
