import { useEffect, useState } from 'react';
import type { MarketLog } from '@/domain/marketLog';
import { formatMoney } from '@/lib/money';

const PAGE_SIZE = 20;

const sourceLabel: Record<MarketLog['source'], string> = {
  reverb: 'Reverb',
  ebay: 'eBay',
  marktplaats: 'Marktplaats',
};

const actionLabel: Record<MarketLog['action'], string> = {
  for_sale: 'For sale',
  sold: 'Sold',
};

const formatObservedAt = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const ListingThumbnail = ({ log }: { log: MarketLog }) => {
  const image = log.listingImageUrl?.trim();
  if (!image) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-slate-200 text-xs text-slate-500">
        No photo
      </div>
    );
  }
  const img = (
    <img
      src={image}
      alt=""
      loading="lazy"
      className="h-14 w-14 shrink-0 rounded-md object-cover"
    />
  );
  if (log.listingUrl) {
    return (
      <a href={log.listingUrl} target="_blank" rel="noreferrer" className="shrink-0">
        {img}
      </a>
    );
  }
  return img;
};

export const MarketLogList = ({ logs }: { logs: MarketLog[] }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [logs]);

  if (logs.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No marketplace observations yet. The weekly crawler will populate this section.
      </p>
    );
  }

  const visibleLogs = logs.slice(0, visibleCount);
  const hasMore = visibleCount < logs.length;

  return (
    <div className="space-y-4">
      <ul className="space-y-3 md:hidden">
        {visibleLogs.map((log) => (
          <li
            key={log.id}
            className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
          >
            <div className="flex gap-3">
              <ListingThumbnail log={log} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-900">
                    {formatMoney(log.priceAmount, log.priceCurrency)}
                  </p>
                  <p className="text-right text-slate-500">{actionLabel[log.action]}</p>
                </div>
                <p className="mt-1 text-slate-700">
                  {sourceLabel[log.source]} · {formatObservedAt(log.observedAt)}
                </p>
                {log.listingUrl ? (
                  <a
                    href={log.listingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-slate-900 underline decoration-slate-300 hover:decoration-slate-600"
                  >
                    {log.listingTitle?.trim() || 'View listing'}
                  </a>
                ) : log.listingTitle?.trim() ? (
                  <p className="mt-2 text-slate-700">{log.listingTitle.trim()}</p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500">
              <th className="py-2 pr-4 font-medium">Photo</th>
              <th className="py-2 pr-4 font-medium">Observed</th>
              <th className="py-2 pr-4 font-medium">Source</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 pr-4 font-medium">Price</th>
              <th className="py-2 font-medium">Listing</th>
            </tr>
          </thead>
          <tbody>
            {visibleLogs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-4">
                  <ListingThumbnail log={log} />
                </td>
                <td className="py-2 pr-4 whitespace-nowrap text-slate-700">
                  {formatObservedAt(log.observedAt)}
                </td>
                <td className="py-2 pr-4 text-slate-700">{sourceLabel[log.source]}</td>
                <td className="py-2 pr-4 text-slate-700">{actionLabel[log.action]}</td>
                <td className="py-2 pr-4 whitespace-nowrap font-medium text-slate-900">
                  {formatMoney(log.priceAmount, log.priceCurrency)}
                </td>
                <td className="py-2 text-slate-700">
                  {log.listingUrl ? (
                    <a
                      href={log.listingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-900 underline decoration-slate-300 hover:decoration-slate-600"
                    >
                      {log.listingTitle?.trim() || 'View listing'}
                    </a>
                  ) : (
                    log.listingTitle?.trim() || '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore ? (
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, logs.length))}
            className="btn-secondary w-full sm:w-auto"
          >
            Show more
          </button>
          <p className="text-xs text-slate-500">
            Showing {visibleLogs.length} of {logs.length}
          </p>
        </div>
      ) : logs.length > PAGE_SIZE ? (
        <p className="text-center text-xs text-slate-500">Showing all {logs.length} observations</p>
      ) : null}
    </div>
  );
};

export { PAGE_SIZE as MARKET_LOG_PAGE_SIZE };
