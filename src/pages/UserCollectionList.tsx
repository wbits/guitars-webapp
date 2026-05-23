import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCollectionOwners, useUserGuitars } from '@/api/collections';
import { ErrorBanner } from '@/components/ErrorBanner';
import { GuitarMosaicGrid } from '@/components/GuitarMosaicGrid';
import { formatCollectionHeading } from '@/lib/collection-routes';
import { sortGuitarsForCollection } from '@/lib/guitar-collection';

export const UserCollectionList = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const { data, isLoading, isError, error, refetch, isFetching } = useUserGuitars(userId);
  const owners = useCollectionOwners();

  const sorted = useMemo(() => sortGuitarsForCollection(data ?? []), [data]);
  const owner = owners.data?.find((entry) => entry.userId === userId);
  const heading = formatCollectionHeading(userId, owner?.displayName);

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{heading}</h1>
          <p className="text-sm text-slate-600">
            {isFetching ? 'Refreshing…' : `${sorted.length} guitar${sorted.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </header>

      {isLoading ? <p className="text-sm text-slate-600">Loading guitars…</p> : null}

      {isError ? (
        <div className="space-y-2">
          <ErrorBanner error={error} title="Could not load collection" />
          <button type="button" onClick={() => refetch()} className="btn-secondary">
            Retry
          </button>
        </div>
      ) : null}

      {!isLoading && !isError && sorted.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-700">No guitars in this collection yet.</p>
        </div>
      ) : null}

      {sorted.length > 0 ? (
        <div className="-mx-4 overflow-hidden bg-white sm:mx-0 sm:rounded-md">
          <GuitarMosaicGrid guitars={sorted} collectionUserId={userId} />
        </div>
      ) : null}
    </section>
  );
};
