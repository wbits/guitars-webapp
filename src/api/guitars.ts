import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import {
  guitarListSchema,
  guitarSchema,
  type Guitar,
  type GuitarInput,
} from '@/domain/guitar';
import type { AnalysisSeed } from './analyze-photo';
import { apiFetch } from './client';

const QUERY_KEYS = {
  all: ['guitars'] as const,
  list: (includeHidden?: boolean) => [...QUERY_KEYS.all, 'list', includeHidden ? 'all' : 'visible'] as const,
  detail: (id: string) => [...QUERY_KEYS.all, 'detail', id] as const,
};

export const listGuitars = async (
  options?: { includeHidden?: boolean; signal?: AbortSignal },
): Promise<Guitar[]> => {
  const params = new URLSearchParams();
  if (options?.includeHidden) {
    params.set('includeHidden', 'true');
  }
  const query = params.toString();
  const path = query ? `/guitar?${query}` : '/guitar';
  const raw = await apiFetch<unknown>({ path, signal: options?.signal });
  return guitarListSchema.parse(raw);
};

export const getGuitar = async (id: string, signal?: AbortSignal): Promise<Guitar> => {
  const raw = await apiFetch<unknown>({ path: `/guitar/${encodeURIComponent(id)}`, signal });
  return guitarSchema.parse(raw);
};

export const createGuitar = async (
  input: GuitarInput,
  options?: { seedAnalysis?: AnalysisSeed },
): Promise<Guitar> => {
  const raw = await apiFetch<unknown>({
    method: 'POST',
    path: '/guitar',
    body: options?.seedAnalysis ? { ...input, seedAnalysis: options.seedAnalysis } : input,
  });
  return guitarSchema.parse(raw);
};

export const updateGuitar = async (id: string, input: GuitarInput): Promise<Guitar> => {
  const raw = await apiFetch<unknown>({
    method: 'PUT',
    path: `/guitar/${encodeURIComponent(id)}`,
    body: input,
  });
  return guitarSchema.parse(raw);
};

export const deleteGuitar = async (id: string): Promise<void> => {
  await apiFetch<void>({ method: 'DELETE', path: `/guitar/${encodeURIComponent(id)}` });
};

export const hideGuitarInCollection = async (id: string): Promise<Guitar> => {
  const raw = await apiFetch<unknown>({
    method: 'POST',
    path: `/guitar/${encodeURIComponent(id)}/hide`,
  });
  return guitarSchema.parse(raw);
};

export const showGuitarInCollection = async (id: string): Promise<Guitar> => {
  const raw = await apiFetch<unknown>({
    method: 'POST',
    path: `/guitar/${encodeURIComponent(id)}/show`,
  });
  return guitarSchema.parse(raw);
};

export const analyzeGuitar = async (id: string, signal?: AbortSignal): Promise<Guitar> => {
  const raw = await apiFetch<unknown>({
    method: 'POST',
    path: `/guitar/${encodeURIComponent(id)}/analyze`,
    signal,
  });
  return guitarSchema.parse(raw);
};

export const useGuitars = (options?: {
  enabled?: boolean;
  includeHidden?: boolean;
}): UseQueryResult<Guitar[]> =>
  useQuery({
    queryKey: QUERY_KEYS.list(options?.includeHidden),
    queryFn: ({ signal }) =>
      listGuitars({ includeHidden: options?.includeHidden, signal }),
    enabled: options?.enabled ?? true,
  });

export const useGuitar = (
  id: string | undefined,
  options?: { pollWhileAnalysisPending?: boolean },
): UseQueryResult<Guitar> =>
  useQuery({
    queryKey: QUERY_KEYS.detail(id ?? ''),
    queryFn: ({ signal }) => getGuitar(id as string, signal),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      if (!options?.pollWhileAnalysisPending) {
        return false;
      }
      return query.state.data?.analysis?.status === 'pending' ? 5000 : false;
    },
  });

export const useAnalyzeGuitar = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => analyzeGuitar(id),
    onSuccess: (updated) => {
      qc.setQueryData(QUERY_KEYS.detail(id), updated);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
};

export const useSetGuitarCollectionVisibility = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hidden: boolean) =>
      hidden ? hideGuitarInCollection(id) : showGuitarInCollection(id),
    onSuccess: (updated) => {
      qc.setQueryData(QUERY_KEYS.detail(id), updated);
      qc.invalidateQueries({ queryKey: QUERY_KEYS.all });
    },
  });
};

export const useCreateGuitar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { values: GuitarInput; seedAnalysis?: AnalysisSeed }) =>
      createGuitar(input.values, { seedAnalysis: input.seedAnalysis }),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.all });
      qc.setQueryData(QUERY_KEYS.detail(created.id), created);
    },
  });
};

export const useUpdateGuitar = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: GuitarInput) => updateGuitar(id, input),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.all });
      qc.setQueryData(QUERY_KEYS.detail(updated.id), updated);
    },
  });
};

export const useDeleteGuitar = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteGuitar(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: QUERY_KEYS.all });
      const previousEntries = qc.getQueriesData<Guitar[]>({
        queryKey: QUERY_KEYS.all,
        predicate: (query) => query.queryKey[1] === 'list' && Array.isArray(query.state.data),
      });
      for (const [key, previous] of previousEntries) {
        if (Array.isArray(previous)) {
          qc.setQueryData(
            key,
            previous.filter((g) => g.id !== id),
          );
        }
      }
      return { previousEntries };
    },
    onError: (_err, _id, context) => {
      context?.previousEntries.forEach(([key, previous]) => {
        if (previous) {
          qc.setQueryData(key, previous);
        }
      });
    },
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.all });
      qc.removeQueries({ queryKey: QUERY_KEYS.detail(id) });
    },
  });
};

export const guitarQueryKeys = QUERY_KEYS;
