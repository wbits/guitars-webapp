import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useClearCollectionMarketLogs, useCollectionOwners, useUserGuitars } from '@/api/collections';
import { useCurrentUser } from '@/api/me';
import { CollectionAssistantChat } from '@/components/CollectionAssistantChat';
import { ErrorBanner } from '@/components/ErrorBanner';
import { GuitarMosaicGrid } from '@/components/GuitarMosaicGrid';
import { formatCollectionHeading } from '@/lib/collection-routes';
import { filterGuitars, type GuitarCollectionFilter } from '@/lib/filter-guitars';
import { sortGuitarsForCollection } from '@/lib/guitar-collection';

export const UserCollectionList = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const { data, isLoading, isError, error, refetch, isFetching } = useUserGuitars(userId);
  const owners = useCollectionOwners();
  const me = useCurrentUser();
  const clearMarketLogs = useClearCollectionMarketLogs(userId);
  const [confirmClear, setConfirmClear] = useState(false);
  const [activeFilter, setActiveFilter] = useState<GuitarCollectionFilter | null>(null);

  const sorted = useMemo(() => sortGuitarsForCollection(data ?? []), [data]);
  const visible = useMemo(
    () => (activeFilter ? filterGuitars(sorted, activeFilter) : sorted),
    [activeFilter, sorted],
  );
  const owner = owners.data?.find((entry) => entry.userId === userId);
  const heading = formatCollectionHeading(userId, owner?.displayName);
  const isAdmin = me.data?.isAdmin ?? false;

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{heading}</h1>
          <p className="text-sm text-slate-600">
            {isFetching ? 'Refreshing…' : `${visible.length} guitar${visible.length === 1 ? '' : 's'}`}
            {activeFilter && sorted.length !== visible.length ? (
              <span className="text-slate-500"> (filtered from {sorted.length})</span>
            ) : null}
          </p>
        </div>
        {isAdmin ? (
          <button
            type="button"
            className="btn-secondary w-full sm:w-auto"
            onClick={() => setConfirmClear(true)}
            disabled={clearMarketLogs.isPending}
          >
            Clear market logs
          </button>
        ) : null}
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

      {!isLoading && !isError && sorted.length > 0 && visible.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-center">
          <p className="text-slate-700">No guitars match the current filter.</p>
          <button type="button" className="btn-secondary mt-3" onClick={() => setActiveFilter(null)}>
            Show all
          </button>
        </div>
      ) : null}

      {visible.length > 0 ? (
        <div className="-mx-4 overflow-hidden bg-white sm:mx-0 sm:rounded-md">
          <GuitarMosaicGrid guitars={visible} collectionUserId={userId} />
        </div>
      ) : null}

      {userId && (isLoading || sorted.length > 0) ? (
        <CollectionAssistantChat key={userId} collectionUserId={userId} onFilterChange={setActiveFilter} />
      ) : null}

      {confirmClear ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm clear market logs"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-md bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Clear market logs?</h3>
            <p className="mt-2 text-sm text-slate-600">
              This removes every marketplace price observation for all guitars in{' '}
              <strong>{heading}</strong>. The next crawl will repopulate them from scratch.
            </p>
            {clearMarketLogs.isError ? (
              <div className="mt-3">
                <ErrorBanner error={clearMarketLogs.error} title="Could not clear market logs" />
              </div>
            ) : null}
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() => {
                  setConfirmClear(false);
                  clearMarketLogs.reset();
                }}
                disabled={clearMarketLogs.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger w-full sm:w-auto"
                onClick={() => {
                  clearMarketLogs.mutate(undefined, {
                    onSuccess: () => setConfirmClear(false),
                  });
                }}
                disabled={clearMarketLogs.isPending}
              >
                {clearMarketLogs.isPending ? 'Clearing…' : 'Clear all market logs'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
