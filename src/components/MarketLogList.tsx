import type { MarketLog } from '@/domain/marketLog';
import { formatMoney } from '@/lib/money';

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

export const MarketLogList = ({ logs }: { logs: MarketLog[] }) => {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No marketplace observations yet. The weekly crawler will populate this section.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="py-2 pr-4 font-medium">Observed</th>
            <th className="py-2 pr-4 font-medium">Source</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Price</th>
            <th className="py-2 font-medium">Listing</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-slate-100 last:border-0">
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
  );
};
