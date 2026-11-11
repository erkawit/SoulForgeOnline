import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanKey } from '../src/lib/server/envKey';
test('a pasted secret key loses newlines, spaces and quotes', () => {
  assert.equal(cleanKey(' sb_secret_abc123\n'), 'sb_secret_abc123');
  assert.equal(cleanKey('"sb_secret_abc123"'), 'sb_secret_abc123');
  assert.equal(cleanKey('sb_secret_ab c123\r\n'), 'sb_secret_abc123');
  assert.equal(cleanKey(''), '');
  assert.equal(cleanKey(undefined), undefined);
});
