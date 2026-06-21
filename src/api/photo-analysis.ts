import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiFetch } from './client';
import { guitarQueryKeys } from './guitars';

export const reanalyzeCollectionResultSchema = z.object({
  total: z.number().int(),
  analyzed: z.number().int(),
  skipped: z.number().int(),
  failed: z.number().int(),
});

export type ReanalyzeCollectionResult = z.infer<typeof reanalyzeCollectionResultSchema>;

export const reanalyzeCollection = async (signal?: AbortSignal): Promise<ReanalyzeCollectionResult> => {
  const raw = await apiFetch<unknown>({
    method: 'POST',
    path: '/me/reanalyze-collection',
    signal,
  });
  return reanalyzeCollectionResultSchema.parse(raw);
};

export const useReanalyzeCollection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => reanalyzeCollection(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guitarQueryKeys.all });
    },
  });
};
