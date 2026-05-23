import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDeleteGuitar, useGuitar, useGuitars } from '@/api/guitars';
import { useMarketLogs } from '@/api/marketLogs';
import { ErrorBanner } from '@/components/ErrorBanner';
import { GuitarCollectionNav } from '@/components/GuitarCollectionNav';
import { MarketLogList } from '@/components/MarketLogList';
import { PictureGallery } from '@/components/PictureGallery';
import { getGuitarNeighbors } from '@/lib/guitar-collection';
import { formatMoney } from '@/lib/money';

export const GuitarView = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const guitar = useGuitar(id);
  const guitars = useGuitars();
  const marketLogs = useMarketLogs(id);
  const del = useDeleteGuitar();
  const [confirming, setConfirming] = useState(false);
  const [deleteError, setDeleteError] = useState<unknown>(null);

  if (guitar.isLoading) return <p className="text-sm text-slate-600">Loading…</p>;
  if (guitar.isError || !guitar.data) {
    return <ErrorBanner error={guitar.error ?? 'Guitar not found'} title="Could not load guitar" />;
  }

  const g = guitar.data;
  const neighbors = getGuitarNeighbors(guitars.data ?? [], g.id);

  const confirmDelete = async () => {
    setDeleteError(null);
    try {
      await del.mutateAsync(g.id);
      navigate('/guitars');
    } catch (err) {
      setDeleteError(err);
      setConfirming(false);
    }
  };

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">
            <Link to="/guitars" className="hover:underline">
              ← Back to all guitars
            </Link>
          </p>
          <h1 className="text-2xl font-semibold break-words">
            {g.brand} <span className="text-slate-500">{g.typeName}</span>
          </h1>
          <p className="text-sm text-slate-600">
            Built {g.buildYear} · {formatMoney(g.priceAmount, g.priceCurrency)}
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link to={`/guitars/${g.id}/edit`} className="btn-secondary w-full sm:w-auto">
            Edit
          </Link>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="btn-danger w-full sm:w-auto"
          >
            Delete
          </button>
        </div>
      </header>

      <GuitarCollectionNav previous={neighbors.previous} next={neighbors.next} />

      {deleteError ? <ErrorBanner error={deleteError} title="Could not delete guitar" /> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <dl className="rounded-md border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <Row label="Brand" value={g.brand} />
          <Row label="Type" value={g.typeName} />
          <Row label="Build year" value={String(g.buildYear)} />
          <Row label="Price" value={formatMoney(g.priceAmount, g.priceCurrency)} />
          <Row label="Serial number" value={g.serialNumber ?? '—'} />
          <Row label="ID" value={<code className="text-xs">{g.id}</code>} />
        </dl>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Description</h2>
          {g.description ? (
            <p className="whitespace-pre-wrap text-sm text-slate-800">{g.description}</p>
          ) : (
            <p className="text-sm text-slate-500">No description provided.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Pictures</h2>
        <PictureGallery pictures={g.pictures} />
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Marketplace prices</h2>
        {marketLogs.isLoading ? (
          <p className="text-sm text-slate-600">Loading market observations…</p>
        ) : marketLogs.isError ? (
          <ErrorBanner error={marketLogs.error} title="Could not load market prices" />
        ) : (
          <MarketLogList logs={marketLogs.data ?? []} />
        )}
      </div>

      {confirming ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-md bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Delete guitar?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Are you sure you want to delete <strong>{g.brand} {g.typeName}</strong>?
              This cannot be undone.
            </p>
            <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="btn-secondary w-full sm:w-auto"
                onClick={() => setConfirming(false)}
                disabled={del.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger w-full sm:w-auto"
                onClick={confirmDelete}
                disabled={del.isPending}
              >
                {del.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="grid gap-1 border-b border-slate-100 py-3 first:pt-0 last:border-b-0 last:pb-0 sm:grid-cols-3 sm:gap-2 sm:py-1.5 sm:border-b-0">
    <dt className="text-sm font-medium text-slate-500 sm:font-normal">{label}</dt>
    <dd className="text-sm text-slate-900 break-words sm:col-span-2">{value}</dd>
  </div>
);
