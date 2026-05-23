import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGuitars } from '@/api/guitars';
import { ErrorBanner } from '@/components/ErrorBanner';
import { GuitarMosaicGrid } from '@/components/GuitarMosaicGrid';
import { sortGuitarsForCollection } from '@/lib/guitar-collection';

export const GuitarList = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useGuitars();

  const sorted = useMemo(() => sortGuitarsForCollection(data ?? []), [data]);

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Collection</h1>
          <p className="text-sm text-slate-600">
            {isFetching ? 'Refreshing…' : `${sorted.length} guitar${sorted.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link to="/guitars/new" className="btn-primary w-full sm:w-auto">
          Add guitar
        </Link>
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
            <p className="text-slate-700">No guitars in your collection yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Get started by adding your first one.
            </p>
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

      {sorted.length > 0 ? (
        <div className="-mx-4 overflow-hidden bg-white sm:mx-0 sm:rounded-md">
          <GuitarMosaicGrid guitars={sorted} />
        </div>
      ) : null}
    </section>
  );
};
