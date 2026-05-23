import { describe, expect, it } from 'vitest';
import {
  MOSAIC_TILE_AREA,
  assignMosaicTileSizes,
  computeMosaicTileCounts,
  mosaicTileClassName,
  totalMosaicArea,
} from './mosaic-tile';

const tierArea = (counts: ReturnType<typeof computeMosaicTileCounts>, tier: keyof typeof MOSAIC_TILE_AREA) =>
  counts[tier] * MOSAIC_TILE_AREA[tier];

describe('mosaic-tile', () => {
  it('targets 1 large, 4 medium, and 15 small tiles for 20 items', () => {
    expect(computeMosaicTileCounts(20)).toEqual({
      feature: 1,
      double: 4,
      unit: 15,
    });
  });

  it('keeps large and medium counts within requested ranges', () => {
    for (const itemCount of [12, 20, 30, 50]) {
      const counts = computeMosaicTileCounts(itemCount);

      expect(counts.feature).toBeGreaterThanOrEqual(1);
      expect(counts.feature).toBeLessThanOrEqual(3);
      expect(counts.double).toBeGreaterThanOrEqual(3);
      expect(counts.double).toBeLessThanOrEqual(5);
      expect(counts.unit).toBe(itemCount - counts.feature - counts.double);
    }
  });

  it('allocates similar total area to each tile tier for 20 items', () => {
    const counts = computeMosaicTileCounts(20);
    const largeArea = tierArea(counts, 'feature');
    const mediumArea = tierArea(counts, 'double');
    const smallArea = tierArea(counts, 'unit');

    expect(largeArea).toBeGreaterThanOrEqual(12);
    expect(largeArea).toBeLessThanOrEqual(18);
    expect(mediumArea).toBeGreaterThanOrEqual(14);
    expect(mediumArea).toBeLessThanOrEqual(18);
    expect(smallArea).toBeGreaterThanOrEqual(14);
    expect(smallArea).toBeLessThanOrEqual(18);
  });

  it('assigns the expected number of each tile size', () => {
    const ids = Array.from({ length: 20 }, (_, index) => `guitar-${index}`);
    const assignments = assignMosaicTileSizes(ids, 42);
    const counts = {
      feature: 0,
      double: 0,
      unit: 0,
    };

    assignments.forEach((size) => {
      counts[size] += 1;
    });

    expect(counts).toEqual(computeMosaicTileCounts(20));
  });

  it('varies assignments when the layout seed changes', () => {
    const ids = Array.from({ length: 20 }, (_, index) => `guitar-${index}`);
    const assignments = Array.from({ length: 20 }, (_, seed) => assignMosaicTileSizes(ids, seed + 1));
    const signatures = new Set(
      assignments.map((layout) =>
        ids.map((id) => layout.get(id)).join(','),
      ),
    );

    expect(signatures.size).toBeGreaterThan(1);
  });

  it('maps tile sizes to responsive grid span classes', () => {
    expect(mosaicTileClassName('unit')).toBe('col-span-1 row-span-1');
    expect(mosaicTileClassName('double')).toBe('col-span-2 row-span-2');
    expect(mosaicTileClassName('feature')).toContain('lg:col-span-4 lg:row-span-3');
  });

  it('covers the full collection area without dropping items', () => {
    const counts = computeMosaicTileCounts(20);
    expect(counts.feature + counts.double + counts.unit).toBe(20);
    expect(totalMosaicArea(counts)).toBe(43);
  });
});
