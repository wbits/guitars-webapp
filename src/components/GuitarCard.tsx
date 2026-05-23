import { Link } from 'react-router-dom';
import type { Guitar } from '@/domain/guitar';
import { coverPictureUrl, formatGuitarCaption } from '@/lib/guitar-cover';
import { NoImagePlaceholder } from './NoImagePlaceholder';

interface GuitarCardProps {
  guitar: Guitar;
}

export const GuitarCard = ({ guitar }: GuitarCardProps) => {
  const imageUrl = coverPictureUrl(guitar);
  const caption = formatGuitarCaption(guitar);

  return (
    <Link
      to={`/guitars/${guitar.id}`}
      className="group block overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500"
    >
      <div className="aspect-square overflow-hidden bg-white">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={caption}
            className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <NoImagePlaceholder />
        )}
      </div>
      <p className="border-t border-slate-100 px-3 py-2.5 text-sm font-medium leading-snug text-slate-900 sm:text-sm">
        <span className="line-clamp-2">{caption}</span>
      </p>
    </Link>
  );
};
