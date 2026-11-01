// Round 13: layered chibi heroes — the rigid weapon always sits on both hands, the hair on the head anchor.
import test from 'node:test';
import assert from 'node:assert/strict';
import { placeLayers, rigFrame, cellToLocal, hitFraction, weaponSheet, DIRS, type LayeredRig, type RigFrame } from '../src/game/sprites/layered';
import { HERO_RIGS } from '../src/game/sprites/rigs';

const anim = { cw: 256, ch: 320, cols: 16, n: 16, fx: 0.5, fy: 0.06, bodyPx: 200, dirs: 8, clips: { idle: [0, 1] as [number, number], attack: [8, 1] as [number, number] } };
const frame = (o: Partial<RigFrame>): RigFrame => ({ clip: 'idle', dir: 'S', frame: 0, head: { x: 128, y: 90 }, gripL: { x: 150, y: 150 }, gripR: { x: 130, y: 190 }, weapon: { view: 'broad', z: 'front' }, ...o });
const rig: LayeredRig = {
  key: 'hero-m-berserker', anim,
  hair: { cw: 120, ch: 120, anchor: [60, 70], styles: ['A01', 'A02'] },
  weapon: { cw: 96, ch: 300, views: { broad: { gripL: [48, 120], gripR: [48, 164.72] }, edge: { gripL: [48, 120], gripR: [48, 164.72] }, three_quarter: { gripL: [48, 120], gripR: [48, 164.72] } }, sheets: ['greataxe-t1', 'greataxe-t2', 'greatsword-t1'] },
  frames: { idle: DIRS.map(d => [frame({ dir: d })]), attack: DIRS.map(d => [frame({ clip: 'attack', dir: d, event: 'hit', gripL: { x: 100, y: 120 }, gripR: { x: 140, y: 140 }, weapon: { view: 'edge', z: 'back' } })]) },
};
const H = 1.6, wpp = H / anim.bodyPx;
/** where a picture grip mark ends up in body space after the placement */
function picToBody(p: [number, number], w: NonNullable<ReturnType<typeof placeLayers>['weapon']>, flip = false) {
  const x = ((flip ? rig.weapon.cw - p[0] : p[0]) - rig.weapon.cw / 2) * wpp, y = (rig.weapon.ch / 2 - p[1]) * wpp, c = Math.cos(w.rot), s = Math.sin(w.rot);
  return { x: w.x + x * c - y * s, y: w.y + x * s + y * c };
}
const close = (a: { x: number; y: number }, b: { x: number; y: number }, eps = 1e-6) => Math.hypot(a.x - b.x, a.y - b.y) < eps;

test('the weapon picture is moved and turned so both of its grip marks land on the hands — never scaled', () => {
  for (const name of ['idle', 'attack']) for (let d = 0; d < 8; d++) {
    const f = rigFrame(rig, name, d, 0)!; const p = placeLayers(rig, f, d, H); const w = p.weapon!;
    const v = rig.weapon.views[f.weapon!.view];
    assert.ok(close(picToBody(v.gripL, w), cellToLocal(anim, H, f.gripL.x, f.gripL.y), 1e-3), `${name} ${DIRS[d]} left hand`);
    assert.ok(close(picToBody(v.gripR, w), cellToLocal(anim, H, f.gripR.x, f.gripR.y), 1e-3), `${name} ${DIRS[d]} right hand`);
    assert.ok(Math.abs(w.stretch - 1) < 0.02, `grip spacing matches the picture (${w.stretch})`);
  }
  const back = placeLayers(rig, rigFrame(rig, 'attack', 0, 0)!, 0, H).weapon!; assert.equal(back.front, false); assert.equal(back.cell, 1, 'edge view = second cell');
});
test('a flipped weapon picture mirrors its grip marks too, so the hands still hold the shaft', () => {
  const f = frame({ weapon: { view: 'broad', z: 'front', flipX: true } }); const w = placeLayers(rig, f, 0, H).weapon!;
  assert.equal(w.flipX, true);
  assert.ok(close(picToBody(rig.weapon.views.broad.gripL, w, true), cellToLocal(anim, H, f.gripL.x, f.gripL.y), 1e-3));
});
test('the hair cell sits on the head anchor and tilts with the head', () => {
  const f = frame({ head: { x: 120, y: 80, rot: 0 } }); const h = placeLayers(rig, f, 3, H).hair!; const head = cellToLocal(anim, H, 120, 80);
  // anchor (60,70) inside a 120×120 cell → the cell centre is 10 px above the anchor
  assert.ok(close({ x: h.x, y: h.y }, { x: head.x, y: head.y + 10 * wpp })); assert.equal(h.cell, 3);
  const t = placeLayers(rig, frame({ head: { x: 120, y: 80, rot: 90 } }), 0, H).hair!; assert.ok(Math.abs(t.rot + Math.PI / 2) < 1e-9, 'clockwise head tilt (image space) turns the hair clockwise');
  assert.ok(close({ x: t.x, y: t.y }, { x: head.x + 10 * wpp, y: head.y }), 'the anchor stays on the head while the hair rotates about it');
});
test('frame lookup clamps, hit timing comes from the event frame, weapon sheets fall back to the nearest painted one', () => {
  assert.equal(rigFrame(rig, 'attack', 9, 5)?.clip, 'attack'); assert.equal(rigFrame(rig, 'nope', 0, 0)?.clip, 'idle');
  assert.equal(hitFraction(rig, 'attack'), 0); assert.equal(hitFraction(rig, 'idle'), null);
  assert.equal(weaponSheet(rig, 'greataxe', 1), 'greataxe-t2'); assert.equal(weaponSheet(rig, 'greataxe', 6), 'greataxe-t2', 'nearest tier');
  assert.equal(weaponSheet(rig, 'greathammer', 0), 'greataxe-t1', 'unpainted kind → closest painted weapon'); assert.equal(weaponSheet(rig, 'greatsword', 0), 'greatsword-t1');
});
test('every imported rig is a complete 8-way sheet (empty until the Codex art ships)', () => {
  for (const [key, { rig: r, ids }] of Object.entries(HERO_RIGS)) {
    assert.equal(r.anim.dirs, 8, key); assert.ok(ids.length > 0);
    for (const [name, runs] of Object.entries(r.frames)) { assert.equal(runs.length, 8, `${key} ${name}`); assert.ok(runs.every(x => x.length === runs[0].length), `${key} ${name} same count in every direction`); }
  }
});
test('fashion: Thai set is wearable by the Berserker, weapon skins carry a sheet, overlays are directional', async () => {
  const { FASHION, overlays } = await import('../src/game/fashion');
  const thai = FASHION.filter(f => f.tag === 'thai');
  assert.ok(thai.some(f => f.slot === 'weapon' && f.weaponSheet === 'thai-greataxe'));
  for (const f of thai.filter(f => f.slot === 'wings' || f.slot === 'head')) assert.equal(f.views, 8, f.id);
  const w = overlays({ owned: ['wings-thai-garuda', 'skin-thai-garuda-greataxe'], worn: { wings: 'wings-thai-garuda', weapon: 'skin-thai-garuda-greataxe' } });
  assert.deepEqual(w.map(f => f.id), ['wings-thai-garuda'], 'a weapon skin is not an overlay, it replaces the weapon picture');
  const { actorDef, heroId } = await import('../src/game/sprites/catalog');
  assert.ok(actorDef(heroId('Berserker', 'm', 'thai')).base.startsWith('costume-thai'), 'the Thai outfit shows its painted look until the 8-way sheet ships');
});
