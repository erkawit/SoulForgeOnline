// Round 13 (crowds): a packed area costs each client at most VIEW_CAP other players, nearest first, party always kept.
import test from 'node:test';
import assert from 'node:assert/strict';
import { Room } from '../src/world';
const actor = (id: string, x: number, z = 0, city = 'hollow') => ({ id, name: id, x, z, hp: 100, maxHp: 100, mp: 10, level: 1, classId: 'Berserker', city }) as never;
test('crowd snapshot: self + nearest `cap` in range and city, party members first', () => {
  const r = new (Room as unknown as new () => object)() as unknown as { players: Map<string, unknown>; snapshotFor: (v: unknown, radius?: number, cap?: number, keep?: Set<string>) => { players: { id: string }[] } };
  const me = actor('me', 0); r.players.set('me', me);
  for (let i = 1; i <= 200; i++) r.players.set(`p${i}`, actor(`p${i}`, i * 0.1));
  r.players.set('far', actor('far', 100)); r.players.set('other-city', actor('other-city', 0, 0, 'dawnveil'));
  const s = r.snapshotFor(me, 32, 60); assert.equal(s.players.length, 61); assert.equal(s.players[0].id, 'me');
  assert.deepEqual(s.players.slice(1, 4).map(p => p.id), ['p1', 'p2', 'p3'], 'nearest first');
  assert.ok(!s.players.some(p => p.id === 'far' || p.id === 'other-city'));
  const k = r.snapshotFor(me, 32, 60, new Set(['p199'])); assert.equal(k.players[1].id, 'p199', 'party member kept even at the back of the crowd');
});
