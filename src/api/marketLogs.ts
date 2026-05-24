import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { marketLogListSchema, type MarketLog } from '@/domain/marketLog';
import { guitarQueryKeys } from './guitars';
import { apiFetch } from './client';

const QUERY_KEYS = {
  all: [...guitarQueryKeys.all, 'market-logs'] as const,
  list: (guitarId: string) => [...QUERY_KEYS.all, guitarId] as const,
};

export const listMarketLogs = async (
  guitarId: string,
  signal?: AbortSignal,
): Promise<MarketLog[]> => {
  const raw = await apiFetch<unknown>({
    path: `/guitar/${encodeURIComponent(guitarId)}/market-log`,
    signal,
  });
  return marketLogListSchema.parse(raw);
};

export const useMarketLogs = (guitarId: string | undefined): UseQueryResult<MarketLog[]> =>
  useQuery({
    queryKey: QUERY_KEYS.list(guitarId ?? ''),
    queryFn: ({ signal }) => listMarketLogs(guitarId as string, signal),
    enabled: Boolean(guitarId),
  });

export const marketLogQueryKeys = QUERY_KEYS;
