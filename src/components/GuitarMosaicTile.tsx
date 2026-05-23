import { Link } from 'react-router-dom';
import type { Guitar } from '@/domain/guitar';
import { guitarPath } from '@/lib/collection-routes';
import { coverPictureUrl, formatGuitarCaption } from '@/lib/guitar-cover';
import { NoImagePlaceholder } from './NoImagePlaceholder';

interface GuitarMosaicTileProps {
  guitar: Guitar;
  collectionUserId?: string;
}

export const GuitarMosaicTile = ({ guitar, collectionUserId }: GuitarMosaicTileProps) => {
  const imageUrl = coverPictureUrl(guitar);
  const caption = formatGuitarCaption(guitar);

  return (
    <Link
      to={guitarPath(guitar.id, collectionUserId)}
      title={caption}
      className="group relative block h-full w-full overflow-hidden bg-slate-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/80"
      aria-label={caption}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        <NoImagePlaceholder />
      )}
    </Link>
  );
};
