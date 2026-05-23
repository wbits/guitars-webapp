import type { Guitar } from '@/domain/guitar';
import { getMosaicTileSize, mosaicTileClassName } from '@/lib/mosaic-tile';
import { GuitarMosaicTile } from './GuitarMosaicTile';

interface GuitarMosaicGridProps {
  guitars: Guitar[];
}

export const GuitarMosaicGrid = ({ guitars }: GuitarMosaicGridProps) => (
  <ul className="mosaic-grid">
    {guitars.map((guitar) => {
      const tileSize = getMosaicTileSize(guitar.id);

      return (
        <li key={guitar.id} className={`min-h-0 ${mosaicTileClassName(tileSize)}`}>
          <GuitarMosaicTile guitar={guitar} />
        </li>
      );
    })}
  </ul>
);
