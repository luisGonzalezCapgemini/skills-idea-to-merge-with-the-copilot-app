export const STORAGE_KEY = 'mona-bookmarks';

const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_PATTERN = /^mona-[0-9a-zA-Z]{4}$/;

export function normalizeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Enter a URL to save.');
  }

  const trimmed = value.trim();
  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed.replace(/^\/\//, '')}`;

  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('Enter a valid web address.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error('Enter a valid web address.');
  }

  return parsed.href;
}

export function parseStoredBookmarks(rawValue) {
  if (typeof rawValue !== 'string' || !rawValue.trim()) {
    return [];
  }

  let value;
  try {
    value = JSON.parse(rawValue);
  } catch {
    return [];
  }

  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (
      !entry ||
      typeof entry !== 'object' ||
      typeof entry.url !== 'string' ||
      typeof entry.slug !== 'string' ||
      !SLUG_PATTERN.test(entry.slug)
    ) {
      return [];
    }

    try {
      return [{ url: normalizeUrl(entry.url), slug: entry.slug }];
    } catch {
      return [];
    }
  });
}

export function formatBookmark({ url, slug }) {
  return `${url} :: ${slug}`;
}

export function createSlug(existingSlugs = [], random = Math.random) {
  const used = new Set(existingSlugs);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const suffix = Array.from({ length: 4 }, () =>
      BASE62[Math.floor(random() * BASE62.length)],
    ).join('');
    const slug = `mona-${suffix}`;
    if (!used.has(slug)) {
      return slug;
    }
  }

  throw new Error('Could not generate a unique bookmark slug. Please try again.');
}
