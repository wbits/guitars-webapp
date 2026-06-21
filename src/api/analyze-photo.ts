import { z } from 'zod';
import { apiFetch } from './client';

const catalogSuggestionsSchema = z.object({
  brand: z.string().optional(),
  typeName: z.string().optional(),
  color: z.string().optional(),
  buildYear: z.number().int().optional(),
  description: z.string().optional(),
});

export const analyzePhotoResultSchema = z.object({
  pictureUrl: z.string(),
  visualSummary: z.string(),
  tags: z.array(z.string()).optional(),
  confidence: z.number().optional(),
  suggestions: catalogSuggestionsSchema,
});

export type AnalyzePhotoResult = z.infer<typeof analyzePhotoResultSchema>;

export type AnalysisSeed = {
  visualSummary: string;
  tags?: string[];
  confidence?: number;
};

export const analyzePhotoForCatalog = async (
  pictureUrl: string,
  signal?: AbortSignal,
): Promise<AnalyzePhotoResult> => {
  const raw = await apiFetch<unknown>({
    method: 'POST',
    path: '/me/analyze-photo',
    body: { pictureUrl },
    signal,
  });
  return analyzePhotoResultSchema.parse(raw);
};
