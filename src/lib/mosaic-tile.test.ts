import { describe, expect, it } from 'vitest';
import { getMosaicTileSize, mosaicTileClassName } from './mosaic-tile';

describe('mosaic-tile', () => {
  it('returns a stable tile size for a guitar id and layout seed', () => {
    expect(getMosaicTileSize('abc-123', 42)).toBe(getMosaicTileSize('abc-123', 42));
  });

  it('can vary tile size for the same guitar when the layout seed changes', () => {
    const sizes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((seed) => getMosaicTileSize('abc-123', seed));
    expect(new Set(sizes).size).toBeGreaterThan(1);
  });

  it('mixes all tile sizes across ids', () => {
    const sizes = Array.from({ length: 100 }, (_, index) =>
      getMosaicTileSize(`guitar-${index}`, 99),
    );
    const unique = new Set(sizes);

    expect(unique.has('unit')).toBe(true);
    expect(unique.has('double')).toBe(true);
    expect(unique.has('wide')).toBe(true);
    expect(unique.has('feature')).toBe(true);
  });

  it('maps tile sizes to responsive grid span classes', () => {
    expect(mosaicTileClassName('unit')).toBe('col-span-1 row-span-1');
    expect(mosaicTileClassName('double')).toBe('col-span-2 row-span-2');
    expect(mosaicTileClassName('wide')).toContain('lg:col-span-4');
    expect(mosaicTileClassName('feature')).toContain('lg:row-span-4');
  });
});
