import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from './client';
import { analyzeGuitar, guitarQueryKeys, listGuitars } from './guitars';

export type ReanalyzeCollectionResult = {
  total: number;
  analyzed: number;
  skipped: number;
  failed: number;
  firstError?: string;
};

export type ReanalyzeProgress = {
  current: number;
  total: number;
  guitarId: string;
};

export const reanalyzeCollection = async (
  onProgress?: (progress: ReanalyzeProgress) => void,
  signal?: AbortSignal,
): Promise<ReanalyzeCollectionResult> => {
  const guitars = await listGuitars(signal);
  const targets = guitars.filter((guitar) => guitar.pictures.length > 0);
  let analyzed = 0;
  let failed = 0;
  let firstError: string | undefined;

  for (let i = 0; i < targets.length; i++) {
    const guitar = targets[i];
    onProgress?.({ current: i + 1, total: targets.length, guitarId: guitar.id });
    try {
      const updated = await analyzeGuitar(guitar.id, signal);
      if (updated.analysis?.status === 'ready') {
        analyzed++;
      } else {
        failed++;
        if (!firstError) {
          firstError =
            updated.analysis?.failureReason ??
            (updated.analysis?.status === 'pending'
              ? 'Analysis is still pending'
              : 'Photo analysis did not complete');
        }
      }
    } catch (err) {
      failed++;
      if (!firstError) {
        if (err instanceof ApiError) firstError = err.message;
        else if (err instanceof Error) firstError = err.message;
        else firstError = 'Photo analysis request failed';
      }
    }
  }

  return {
    total: guitars.length,
    analyzed,
    skipped: guitars.length - targets.length,
    failed,
    firstError,
  };
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
