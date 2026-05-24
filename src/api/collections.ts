import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { z } from 'zod';
import { guitarListSchema, type Guitar } from '@/domain/guitar';
import { apiFetch } from './client';
import { marketLogQueryKeys } from './marketLogs';

const collectionOwnerSchema = z.object({
  userId: z.string(),
  username: z.string().optional(),
  email: z.string().optional(),
  displayName: z.string(),
  guitarCount: z.number().int().nonnegative(),
  marketCrawlEnabled: z.boolean().optional().default(false),
});

const clearCollectionMarketLogsResponseSchema = z.object({
  deletedCount: z.number().int().nonnegative(),
});

const collectionOwnerListSchema = z.array(collectionOwnerSchema);

export type CollectionOwner = z.infer<typeof collectionOwnerSchema>;

const QUERY_KEYS = {
  all: ['collections'] as const,
  owners: () => [...QUERY_KEYS.all, 'owners'] as const,
  userGuitars: (userId: string) => [...QUERY_KEYS.all, 'guitars', userId] as const,
};

export const listCollectionOwners = async (signal?: AbortSignal): Promise<CollectionOwner[]> => {
  const raw = await apiFetch<unknown>({ path: '/collections', signal });
  return collectionOwnerListSchema.parse(raw);
};

export const listUserGuitars = async (userId: string, signal?: AbortSignal): Promise<Guitar[]> => {
  const raw = await apiFetch<unknown>({
    path: `/collections/${encodeURIComponent(userId)}/guitar`,
    signal,
  });
  return guitarListSchema.parse(raw);
};

export const useCollectionOwners = (options?: { enabled?: boolean }): UseQueryResult<CollectionOwner[]> =>
  useQuery({
    queryKey: QUERY_KEYS.owners(),
    queryFn: ({ signal }) => listCollectionOwners(signal),
    enabled: options?.enabled ?? true,
  });

export const useUserGuitars = (
  userId: string | undefined,
  options?: { enabled?: boolean },
): UseQueryResult<Guitar[]> =>
  useQuery({
    queryKey: QUERY_KEYS.userGuitars(userId ?? ''),
    queryFn: ({ signal }) => listUserGuitars(userId as string, signal),
    enabled: Boolean(userId) && (options?.enabled ?? true),
  });

export const clearCollectionMarketLogs = async (userId: string): Promise<number> => {
  const raw = await apiFetch<unknown>({
    method: 'DELETE',
    path: `/collections/${encodeURIComponent(userId)}/market-log`,
  });
  return clearCollectionMarketLogsResponseSchema.parse(raw).deletedCount;
};

export const useClearCollectionMarketLogs = (userId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => clearCollectionMarketLogs(userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: marketLogQueryKeys.all });
    },
  });
};

export const collectionQueryKeys = QUERY_KEYS;
