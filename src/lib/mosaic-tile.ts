export type MosaicTileSize = 'unit' | 'double' | 'feature';

export const MOSAIC_TILE_AREA: Record<MosaicTileSize, number> = {
  unit: 1,
  double: 4,
  feature: 12,
};

export type MosaicTileCounts = Record<MosaicTileSize, number>;

const hashId = (id: string): number => {
  let hash = 2166136261;

  for (let index = 0; index < id.length; index += 1) {
    hash ^= id.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

/** New seed per overview visit; layout only, guitar data and images stay cached. */
export const createMosaicLayoutSeed = (): number =>
  Math.floor(Math.random() * 0x1_0000_0000) >>> 0;

/**
 * Targets ~equal grid area per size tier (12L ≈ 4M ≈ S), capped to:
 * 1–3 large, 3–5 medium, rest small.
 */
export const computeMosaicTileCounts = (itemCount: number): MosaicTileCounts => {
  if (itemCount <= 0) {
    return { unit: 0, double: 0, feature: 0 };
  }

  if (itemCount === 1) {
    return { unit: 0, double: 0, feature: 1 };
  }

  if (itemCount === 2) {
    return { unit: 1, double: 0, feature: 1 };
  }

  if (itemCount <= 5) {
    return { unit: itemCount - 2, double: 1, feature: 1 };
  }

  if (itemCount <= 8) {
    return { unit: itemCount - 3, double: 2, feature: 1 };
  }

  let feature = Math.min(3, Math.max(1, Math.round(itemCount / 16)));
  let double = Math.min(5, Math.max(3, Math.round((itemCount * 3) / 16)));
  let unit = itemCount - feature - double;

  while (unit < 0 && double > 3) {
    double -= 1;
    unit = itemCount - feature - double;
  }

  while (unit < 0 && feature > 1) {
    feature -= 1;
    unit = itemCount - feature - double;
  }

  return { unit, double, feature };
};

export const totalMosaicArea = (counts: MosaicTileCounts): number =>
  counts.unit * MOSAIC_TILE_AREA.unit +
  counts.double * MOSAIC_TILE_AREA.double +
  counts.feature * MOSAIC_TILE_AREA.feature;

const rankKey = (id: string, layoutSeed: number): number => hashId(`${id}:${layoutSeed}`);

/** Randomly assigns size tiers while keeping collection-level counts balanced. */
export const assignMosaicTileSizes = (
  ids: string[],
  layoutSeed: number,
): Map<string, MosaicTileSize> => {
  const counts = computeMosaicTileCounts(ids.length);
  const ranked = [...ids].sort(
    (left, right) => rankKey(left, layoutSeed) - rankKey(right, layoutSeed),
  );

  const assignments = new Map<string, MosaicTileSize>();
  ranked.slice(0, counts.feature).forEach((id) => assignments.set(id, 'feature'));
  ranked.slice(counts.feature, counts.feature + counts.double).forEach((id) => {
    assignments.set(id, 'double');
  });
  ranked.slice(counts.feature + counts.double).forEach((id) => assignments.set(id, 'unit'));

  return assignments;
};

export const mosaicTileClassName = (size: MosaicTileSize): string => {
  switch (size) {
    case 'feature':
      return 'col-span-3 row-span-2 sm:col-span-4 sm:row-span-3 lg:col-span-4 lg:row-span-3';
    case 'double':
      return 'col-span-2 row-span-2';
    default:
      return 'col-span-1 row-span-1';
  }
};
