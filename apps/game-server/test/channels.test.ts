// Round 16: 5 channels per map, 100 players each — fill the lowest channel with room, keep parties together when there
// is room, switch only into another channel with room, list every channel (empty ones too).
import test from 'node:test';
import assert from 'node:assert/strict';
import { pickChannel, canSwitch, channelList, CHANNEL_CAP, MAX_CHANNELS } from '../src/channels';
const A = (id: string, city = 'hollow', channel?: number) => ({ id, city, channel, x: 0, z: 0, hp: 1, maxHp: 1, attack: 1, defense: 1, crit: 0, mp: 0, speed: 1, level: 1, lastBasic: 0, lastSkill: 0 }) as never as import('../src/protocol').Actor;
const fill = (n: number, ch: number, city = 'wild0') => Array.from({ length: n }, (_, i) => A(`${city}-${ch}-${i}`, city, ch));
test('defaults: 5 channels of 100 players', () => { assert.equal(CHANNEL_CAP, 100); assert.equal(MAX_CHANNELS, 5); });
test('the 101st player of a map goes to CH2; other maps do not count', () => {
  const all = [...fill(100, 1), ...fill(100, 1, 'wild1')];
  assert.equal(pickChannel(all, A('me', 'wild0')), 2);
  assert.equal(pickChannel(all, A('me', 'wild2')), 1);
  assert.equal(pickChannel([...fill(99, 1)], A('me', 'wild0')), 1);
});
test('always the lowest channel that has room', () => {
  assert.equal(pickChannel([...fill(100, 1), ...fill(100, 2), ...fill(3, 3), ...fill(0, 4)], A('me', 'wild0')), 3);
  assert.equal(pickChannel([...fill(100, 1), ...fill(5, 2)], A('me', 'wild0')), 2);
});
test('a party member pulls you into their channel only while it has room', () => {
  assert.equal(pickChannel([A('x', 'wild0', 1), A('mate', 'wild0', 4)], A('me', 'wild0'), new Set(['mate'])), 4);
  const full = [...fill(99, 4), A('mate', 'wild0', 4)];
  assert.equal(pickChannel(full, A('me', 'wild0'), new Set(['mate'])), 1, 'CH4 is full (100) — go to the lowest with room');
});
test('every channel full: the least crowded takes the overflow', () => {
  const all = [...fill(100, 1), ...fill(100, 2), ...fill(100, 3), ...fill(100, 4), ...fill(100, 5)];
  all.pop(); // CH5 = 99 → has room
  assert.equal(pickChannel(all, A('me', 'wild0')), 5);
  all.push(A('x', 'wild0', 5), A('y', 'wild0', 1)); // CH1 = 101, CH5 = 100
  assert.equal(pickChannel(all, A('me', 'wild0')), 2);
});
test('switching: any other channel 1–5 with room', () => {
  const me = A('me', 'wild0', 1), all = [me, ...fill(100, 2), ...fill(10, 3)];
  assert.equal(canSwitch(all, me, 3), true); assert.equal(canSwitch(all, me, 5), true, 'an empty channel is open');
  assert.equal(canSwitch(all, me, 2), false, 'full'); assert.equal(canSwitch(all, me, 1), false, 'already there');
  assert.equal(canSwitch(all, me, 6), false, 'only 5 channels'); assert.equal(canSwitch(all, me, 0), false);
});
test('the list shows all 5 channels, empty ones as 0', () => {
  const all = [A('a', 'wild0', 1), A('b', 'wild0', 3), A('c', 'wild0', 3), A('d', 'hollow', 2)];
  assert.deepEqual(channelList(all, 'wild0'), [[1, 1], [2, 0], [3, 2], [4, 0], [5, 0]]);
});
