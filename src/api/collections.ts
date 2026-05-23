import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { z } from 'zod';
import { guitarListSchema, type Guitar } from '@/domain/guitar';
import { apiFetch } from './client';

const collectionOwnerSchema = z.object({
  userId: z.string(),
  username: z.string().optional(),
  email: z.string().optional(),
  displayName: z.string(),
  guitarCount: z.number().int().nonnegative(),
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

export const collectionQueryKeys = QUERY_KEYS;
