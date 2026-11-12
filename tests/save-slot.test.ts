import { test } from 'node:test';
import assert from 'node:assert/strict';
const mem = new Map<string, string>();
(globalThis as Record<string, unknown>).window = { localStorage: { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) } };

test('each account has its own save; the old guest save moves over only for the same character', async () => {
  const s = await import('../src/game/saveSlot');
  assert.notEqual(s.accountSave('a'), s.accountSave('b'));
  assert.notEqual(s.accountSave('a'), s.GUEST_SAVE);
  mem.set(s.GUEST_SAVE, JSON.stringify({ player: { name: 'Hero', classId: 'Paladin', level: 7 } }));
  s.adoptGuestSave(s.accountSave('b'), 'Someone');
  assert.equal(mem.get(s.accountSave('b')), undefined);
  s.adoptGuestSave(s.accountSave('a'), 'Hero');
  assert.deepEqual(s.readSaveSummary(s.accountSave('a')), { name: 'Hero', classId: 'Paladin', level: 7 });
  assert.equal(s.readSaveSummary(s.accountSave('b')), null);
});

test('four guest slots and one save per account character', async () => {
  const s = await import('../src/game/saveSlot');
  assert.equal(s.guestSlotKey(1), s.GUEST_SAVE);
  assert.deepEqual([2, 3, 4].map(s.guestSlotKey), ['soulforge_guest_v1_s2', 'soulforge_guest_v1_s3', 'soulforge_guest_v1_s4']);
  assert.ok([1, 2, 3, 4].every(i => s.isGuestKey(s.guestSlotKey(i))));
  assert.ok(!s.isGuestKey(s.characterSave('u', 'c1')));
  assert.notEqual(s.characterSave('u', 'c1'), s.characterSave('u', 'c2'));
  mem.set(s.accountSave('u'), JSON.stringify({ player: { name: 'Old', classId: 'Paladin', level: 9 } }));
  s.adoptGuestSave(s.characterSave('u', 'c1'), 'Old', [s.accountSave('u'), s.GUEST_SAVE]);
  assert.equal(s.readSaveSummary(s.characterSave('u', 'c1'))?.level, 9);
});
