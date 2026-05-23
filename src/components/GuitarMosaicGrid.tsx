import { useMemo, useState } from 'react';
import type { Guitar } from '@/domain/guitar';
import {
  assignMosaicTileSizes,
  createMosaicLayoutSeed,
  mosaicTileClassName,
} from '@/lib/mosaic-tile';
import { GuitarMosaicTile } from './GuitarMosaicTile';

interface GuitarMosaicGridProps {
  guitars: Guitar[];
  collectionUserId?: string;
}

export const GuitarMosaicGrid = ({ guitars, collectionUserId }: GuitarMosaicGridProps) => {
  const [layoutSeed] = useState(createMosaicLayoutSeed);
  const tileSizes = useMemo(
    () => assignMosaicTileSizes(
      guitars.map((guitar) => guitar.id),
      layoutSeed,
    ),
    [guitars, layoutSeed],
  );

  return (
    <ul className="mosaic-grid">
      {guitars.map((guitar) => {
        const tileSize = tileSizes.get(guitar.id) ?? 'unit';

        return (
          <li key={guitar.id} className={`min-h-0 ${mosaicTileClassName(tileSize)}`}>
            <GuitarMosaicTile guitar={guitar} collectionUserId={collectionUserId} />
          </li>
        );
      })}
    </ul>
  );
};
