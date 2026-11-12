import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Group, Mesh, Scene, Vector3 } from 'three';
// skillFx paints small canvas glows on first use: a no-op 2D canvas is enough here
const noop: unknown = new Proxy(function () {}, { get: (_t, k) => (k === 'canvas' ? {} : noop), apply: () => noop });
(globalThis as Record<string, unknown>).document ??= { createElement: () => ({ width: 0, height: 0, getContext: () => noop }), createElementNS: () => ({ width: 0, height: 0, style: {}, getContext: () => noop, addEventListener() {}, removeEventListener() {} }) };

// every slash of a basic-attack combo must sit in front of the caster (toward the target), never behind it
test('basic-attack slashes appear on the facing side for every combo step', async () => {
  const { spawnSkillFx } = await import('../src/game/fx/skillFx');
  for (const cls of ['RuneMaster', 'Berserker', 'Paladin', 'Assassin', 'Inquisitor', 'HighPriest', 'Hawkeye', 'Elementalist'] as const) for (const combo of [0, 1, 2]) for (const yaw of [0, Math.PI / 2, -Math.PI * 0.75]) {
    const scene = new Scene(), fwd = new Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    const fx = spawnSkillFx(scene, { cls, kind: 'attack', origin: new Vector3(), yaw, target: fwd.clone().multiplyScalar(4), combo } as never);
    fx.update(0.25); scene.updateMatrixWorld(true);
    const rings: number[] = [];
    scene.traverse(o => { if (o instanceof Mesh && o.geometry.type === 'RingGeometry' && o.parent instanceof Group && o.parent.parent) {
      o.geometry.computeBoundingSphere(); const c = o.geometry.boundingSphere!.center.clone().applyMatrix4(o.matrixWorld); rings.push(c.setY(0).dot(fwd)); } });
    assert.ok(rings.length > 0, `${cls} combo ${combo} has a slash`);
    assert.ok(Math.max(...rings) > 0, `${cls} combo ${combo} yaw ${yaw.toFixed(2)}: slash in front (${rings.map(r => r.toFixed(2))})`);
  }
});
