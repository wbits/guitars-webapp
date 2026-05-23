import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGuitars } from '@/api/guitars';
import { ErrorBanner } from '@/components/ErrorBanner';
import { GuitarCard } from '@/components/GuitarCard';

export const GuitarList = () => {
  const { data, isLoading, isError, error, refetch, isFetching } = useGuitars();

  const sorted = useMemo(
    () =>
      [...(data ?? [])].sort((a, b) =>
        a.brand.localeCompare(b.brand, undefined, { sensitivity: 'base' }),
      ),
    [data],
  );

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Guitars</h1>
          <p className="text-sm text-slate-600">
            {isFetching ? 'Refreshing…' : `${sorted.length} guitar${sorted.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <Link to="/guitars/new" className="btn-primary">
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
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-700">No guitars in the collection yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Get started by adding your first one.
          </p>
          <Link to="/guitars/new" className="btn-primary mt-4 inline-flex">
            Add guitar
          </Link>
        </div>
      ) : null}

      {sorted.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((guitar) => (
            <li key={guitar.id}>
              <GuitarCard guitar={guitar} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};
