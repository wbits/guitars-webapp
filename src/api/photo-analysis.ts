import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiFetch } from './client';
import { guitarQueryKeys } from './guitars';

export const reanalyzeCollectionResultSchema = z.object({
  total: z.number().int(),
  queued: z.number().int(),
  skipped: z.number().int(),
});

export type ReanalyzeCollectionResult = z.infer<typeof reanalyzeCollectionResultSchema>;

export type ReanalyzeProgress = {
  current: number;
  total: number;
};

export const reanalyzeCollection = async (
  onProgress?: (progress: ReanalyzeProgress) => void,
  signal?: AbortSignal,
): Promise<ReanalyzeCollectionResult> => {
  onProgress?.({ current: 0, total: 0 });
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
    mutationFn: ({
      onProgress,
      signal,
    }: {
      onProgress?: (progress: ReanalyzeProgress) => void;
      signal?: AbortSignal;
    } = {}) => reanalyzeCollection(onProgress, signal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: guitarQueryKeys.all });
    },
  });
};
