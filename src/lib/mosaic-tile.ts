export type MosaicTileSize = 'unit' | 'double' | 'wide' | 'feature';

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

/** Tile size from guitar id and a per-load layout seed. */
export const getMosaicTileSize = (id: string, layoutSeed = 0): MosaicTileSize => {
  const bucket = (hashId(id) ^ layoutSeed) % 25;

  if (bucket === 0) return 'feature';
  if (bucket <= 2) return 'wide';
  if (bucket <= 8) return 'double';
  return 'unit';
};

export const mosaicTileClassName = (size: MosaicTileSize): string => {
  switch (size) {
    case 'feature':
      return 'col-span-3 row-span-3 sm:col-span-4 sm:row-span-4 lg:col-span-4 lg:row-span-4';
    case 'wide':
      return 'col-span-3 row-span-2 sm:col-span-4 sm:row-span-2 lg:col-span-4 lg:row-span-2';
    case 'double':
      return 'col-span-2 row-span-2';
    default:
      return 'col-span-1 row-span-1';
  }
};
