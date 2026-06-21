import { Link } from 'react-router-dom';
import type { Guitar } from '@/domain/guitar';
import { guitarPath } from '@/lib/collection-routes';
import { coverPictureUrl, formatGuitarCaption } from '@/lib/guitar-cover';
import { NoImagePlaceholder } from './NoImagePlaceholder';

interface GuitarMosaicTileProps {
  guitar: Guitar;
  collectionUserId?: string;
  showHiddenBadge?: boolean;
}

export const GuitarMosaicTile = ({
  guitar,
  collectionUserId,
  showHiddenBadge = false,
}: GuitarMosaicTileProps) => {
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
      {showHiddenBadge && (guitar.hiddenInCollection ?? false) ? (
        <span className="absolute left-2 top-2 rounded bg-slate-900/75 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
          Hidden
        </span>
      ) : null}
    </Link>
  );
};
