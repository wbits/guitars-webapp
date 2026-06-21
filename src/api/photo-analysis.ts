import { useMutation, useQueryClient } from '@tanstack/react-query';
import { analyzeGuitar, guitarQueryKeys, listGuitars } from './guitars';

export type ReanalyzeCollectionResult = {
  total: number;
  analyzed: number;
  skipped: number;
  failed: number;
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

  for (let i = 0; i < targets.length; i++) {
    const guitar = targets[i];
    onProgress?.({ current: i + 1, total: targets.length, guitarId: guitar.id });
    try {
      await analyzeGuitar(guitar.id, signal);
      analyzed++;
    } catch {
      failed++;
    }
  }

  return {
    total: guitars.length,
    analyzed,
    skipped: guitars.length - targets.length,
    failed,
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
