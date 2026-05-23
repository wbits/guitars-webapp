import { Link } from 'react-router-dom';
import type { Guitar } from '@/domain/guitar';
import { guitarPath } from '@/lib/collection-routes';
import { formatGuitarCaption } from '@/lib/guitar-cover';

interface GuitarCollectionNavProps {
  previous: Guitar | null;
  next: Guitar | null;
  collectionUserId?: string;
}

export const GuitarCollectionNav = ({
  previous,
  next,
  collectionUserId,
}: GuitarCollectionNavProps) => {
  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Collection navigation"
      className="grid gap-3 border-y border-slate-200 py-3 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          to={guitarPath(previous.id, collectionUserId)}
          className="group min-h-11 touch-manipulation rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
            ← Previous
          </span>
          <span className="mt-0.5 block font-medium text-slate-900 group-hover:underline">
            {formatGuitarCaption(previous)}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}

      {next ? (
        <Link
          to={guitarPath(next.id, collectionUserId)}
          className="group min-h-11 touch-manipulation rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-slate-300 hover:bg-slate-50 sm:text-right"
        >
          <span className="block text-xs font-medium uppercase tracking-wide text-slate-500">
            Next →
          </span>
          <span className="mt-0.5 block font-medium text-slate-900 group-hover:underline">
            {formatGuitarCaption(next)}
          </span>
        </Link>
      ) : null}
    </nav>
  );
};
