import { useState } from 'react';
import type { Guitar } from '@/domain/guitar';
import { createMosaicLayoutSeed, getMosaicTileSize, mosaicTileClassName } from '@/lib/mosaic-tile';
import { GuitarMosaicTile } from './GuitarMosaicTile';

interface GuitarMosaicGridProps {
  guitars: Guitar[];
}

export const GuitarMosaicGrid = ({ guitars }: GuitarMosaicGridProps) => {
  const [layoutSeed] = useState(createMosaicLayoutSeed);

  return (
    <ul className="mosaic-grid">
      {guitars.map((guitar) => {
        const tileSize = getMosaicTileSize(guitar.id, layoutSeed);

        return (
          <li key={guitar.id} className={`min-h-0 ${mosaicTileClassName(tileSize)}`}>
            <GuitarMosaicTile guitar={guitar} />
          </li>
        );
      })}
    </ul>
  );
};
