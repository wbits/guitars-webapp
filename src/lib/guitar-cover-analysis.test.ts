import { describe, expect, it } from 'vitest';
import { coverPictureChanged, coverPictureKey } from './guitar-cover-analysis';

describe('guitar-cover-analysis', () => {
  it('changes when cover index changes', () => {
    const before = { pictures: ['https://example.com/a.jpg', 'https://example.com/b.jpg'], coverPictureIndex: 0 };
    const after = { pictures: before.pictures, coverPictureIndex: 1 };
    expect(coverPictureKey(before)).not.toBe(coverPictureKey(after));
    expect(coverPictureChanged(before, after)).toBe(true);
  });

  it('ignores non-cover picture changes', () => {
    const before = { pictures: ['https://example.com/a.jpg', 'https://example.com/b.jpg'], coverPictureIndex: 0 };
    const after = { pictures: ['https://example.com/a.jpg', 'https://example.com/c.jpg'], coverPictureIndex: 0 };
    expect(coverPictureChanged(before, after)).toBe(false);
  });
});
