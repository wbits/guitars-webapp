import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGuitars } from '@/api/guitars';
import { useCurrentUser } from '@/api/me';
import { CollectionAssistantChat } from '@/components/CollectionAssistantChat';
import { ErrorBanner } from '@/components/ErrorBanner';
import { GuitarMosaicGrid } from '@/components/GuitarMosaicGrid';
import { filterGuitars, type GuitarCollectionFilter } from '@/lib/filter-guitars';
import { collectTagsFromGuitars } from '@/lib/guitar-tags';
import { sortGuitarsForCollection } from '@/lib/guitar-collection';

export const GuitarList = () => {
  const [showHidden, setShowHidden] = useState(false);
  const { data, isLoading, isError, error, refetch, isFetching } = useGuitars({
    includeHidden: showHidden,
  });
  const me = useCurrentUser();
  const [activeFilter, setActiveFilter] = useState<GuitarCollectionFilter | null>(null);

  const sorted = useMemo(() => sortGuitarsForCollection(data ?? []), [data]);
  const knownTags = useMemo(() => collectTagsFromGuitars(sorted), [sorted]);
  const visible = useMemo(
    () => (activeFilter ? filterGuitars(sorted, activeFilter) : sorted),
    [activeFilter, sorted],
  );
  const hiddenCount = useMemo(
    () => sorted.filter((guitar) => guitar.hiddenInCollection ?? false).length,
    [sorted],
  );
  const collectionUserId = me.data?.userId;

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Collection</h1>
          <p className="text-sm text-slate-600">
            {isFetching ? 'Refreshing…' : `${visible.length} guitar${visible.length === 1 ? '' : 's'}`}
            {activeFilter && sorted.length !== visible.length ? (
              <span className="text-slate-500"> (filtered from {sorted.length})</span>
            ) : null}
            {showHidden && hiddenCount > 0 ? (
              <span className="text-slate-500"> · {hiddenCount} hidden</span>
            ) : null}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={showHidden}
              onChange={(event) => setShowHidden(event.target.checked)}
              className="rounded border-slate-300"
            />
            Show hidden
          </label>
          <Link to="/guitars/new" className="btn-primary w-full sm:w-auto">
            Add guitar
          </Link>
        </div>
      </header>

      {isLoading ? <p className="text-sm text-slate-600">Loading guitars…</p> : null}

      {isError ? (
        <div className="space-y-2">
          <ErrorBanner error={error} title="Could not load guitars" />
          <button type="button" onClick={() => refetch()} className="btn-secondary">
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && sorted.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="text-slate-700">
              {showHidden
                ? 'No guitars in your collection yet.'
                : 'No visible guitars in your collection.'}
            </p>
            {!showHidden ? (
              <p className="mt-2 text-sm text-slate-500">
                Hidden guitars are omitted from this view. Turn on “Show hidden” to include them.
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Get started by adding your first one.
              </p>
            )}
            <Link to="/guitars/new" className="btn-primary mt-4 inline-flex">
              Add guitar
            </Link>
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium text-slate-900">Had guitars here before?</p>
            <p className="mt-1 text-slate-600">
              Older records without an owner are hidden from this list. Open a saved
              link to the guitar, choose Edit, and save once to add it to your
              collection.
            </p>
          </div>
        </div>
      ) : null}

      {sorted.length > 0 && visible.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-slate-700">No guitars match the current filter.</p>
          <button type="button" className="btn-secondary mt-3" onClick={() => setActiveFilter(null)}>
            Show all
          </button>
        </div>
      ) : null}

      {visible.length > 0 ? (
        <div className="-mx-4 overflow-hidden bg-white sm:mx-0 sm:rounded-md">
          <GuitarMosaicGrid
            guitars={visible}
            showHiddenBadge={showHidden}
          />
        </div>
      ) : null}

      {collectionUserId && (isLoading || sorted.length > 0) ? (
        <CollectionAssistantChat
          key={collectionUserId}
          collectionUserId={collectionUserId}
          knownTags={knownTags}
          onFilterChange={setActiveFilter}
        />
      ) : null}
    </section>
  );
};
