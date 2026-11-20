import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSlug,
  formatBookmark,
  normalizeUrl,
  parseStoredBookmarks,
} from '../src/lib/bookmarks.js';

test('normalizes URLs with and without https:// to the same saved value', () => {
  assert.equal(
    normalizeUrl('www.example.com'),
    normalizeUrl('https://www.example.com'),
  );
  assert.equal(normalizeUrl('www.example.com'), 'https://www.example.com/');
});

test('recovers gracefully from empty, corrupted, legacy, and non-array storage', () => {
  for (const storedValue of [
    null,
    '',
    '   ',
    '{not json',
    JSON.stringify({ url: 'https://example.com', slug: 'mona-7fk2' }),
    JSON.stringify('https://example.com'),
    JSON.stringify([null, 'legacy bookmark', { url: 'https://example.com' }]),
  ]) {
    assert.doesNotThrow(() => parseStoredBookmarks(storedValue));
    assert.deepEqual(parseStoredBookmarks(storedValue), []);
  }
});

test('keeps only valid bookmark records when loading an array', () => {
  assert.deepEqual(
    parseStoredBookmarks(
      JSON.stringify([
        { url: 'www.example.com', slug: 'mona-7fk2' },
        { url: 'javascript:alert(1)', slug: 'mona-abcd' },
        { url: 'https://example.com', slug: 'legacy-slug' },
      ]),
    ),
    [{ url: 'https://www.example.com/', slug: 'mona-7fk2' }],
  );
});

test('generates unique four-character base62 slugs with the mona- prefix', () => {
  const values = [0, 0, 0, 0, 1 / 62, 0, 0, 0];
  const slug = createSlug(['mona-0000'], () => values.shift());
  assert.equal(slug, 'mona-1000');
  assert.match(slug, /^mona-[0-9a-zA-Z]{4}$/);
});

test('formats a saved bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com/', slug: 'mona-7fk2' }),
    'https://www.example.com/ :: mona-7fk2',
  );
});
