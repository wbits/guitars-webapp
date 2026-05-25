import { describe, expect, it } from 'vitest';
import { isTruncated, truncateAtWordBoundary } from './truncate-text';

describe('truncateAtWordBoundary', () => {
  it('returns the original text when within the limit', () => {
    expect(truncateAtWordBoundary('Short description', 800)).toBe('Short description');
  });

  it('truncates at the last word boundary before the limit', () => {
    const words = Array.from({ length: 200 }, (_, index) => `word${index}`).join(' ');
    const truncated = truncateAtWordBoundary(words, 800);

    expect(truncated.length).toBeLessThanOrEqual(800);
    expect(words.slice(truncated.length)).toMatch(/^(\s|$)/);
    expect(isTruncated(words, 800)).toBe(true);
    expect(words.startsWith(truncated)).toBe(true);
  });

  it('preserves line breaks as word boundaries', () => {
    const text = `${'a'.repeat(700)}\n${'b'.repeat(200)}`;
    expect(truncateAtWordBoundary(text, 800)).toBe('a'.repeat(700));
  });
});
