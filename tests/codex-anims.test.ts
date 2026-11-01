// Round 13: Codex's 8-direction monster / boss sheets (scripts/import-codex-anims.mjs → src/game/sprites/anims8.json).
import test from 'node:test';
import assert from 'node:assert/strict';
import { CODEX_ANIMS, animHitFraction } from '../src/game/sprites/codexAnims';
import { animFor } from '../src/game/sprites/anims';
import { actorDef, monsterSpriteId } from '../src/game/sprites/catalog';

test('every imported sheet is a complete 8-way flipbook that the game plays for its species and aliases', () => {
  for (const [id, e] of Object.entries(CODEX_ANIMS)) {
    assert.equal(e.anim.dirs, 8, id);
    const total = Object.values(e.anim.clips).reduce((n, c) => n + c[1] * 8, 0); assert.equal(total, e.anim.n, `${id} frame count`);
    for (const c of ['idle', 'walk', 'attack']) assert.ok(e.anim.clips[c], `${id} ${c}`);
    assert.ok(e.hits.attack !== undefined && e.hits.attack < e.anim.clips.attack[1], `${id} hit frame`);
    assert.equal(animFor(id)?.key, id); assert.equal(actorDef(id).base, id);
    for (const a of e.aliases) { assert.equal(animFor(a)?.key, id, `${a} → ${id}`); assert.equal(monsterSpriteId(a.replace(/-/g, ' ')), a); }
    const hf = animHitFraction(id, 'attack'); assert.ok(hf !== null && hf >= 0 && hf < 1);
  }
});
