import { z } from 'zod';
import { apiFetch } from './client';
import type { GuitarCollectionFilter } from '@/lib/filter-guitars';

const assistantFilterSchema = z.object({
  brand: z.string().optional(),
  typeName: z.string().optional(),
  color: z.string().optional(),
  minPriceMajor: z.number().optional(),
  maxPriceMajor: z.number().optional(),
  minYear: z.number().int().optional(),
  maxYear: z.number().int().optional(),
  tag: z.string().optional(),
  searchText: z.string().optional(),
});

export const assistantChatResponseSchema = z.object({
  message: z.string(),
  matchingIds: z.array(z.string()),
  filter: assistantFilterSchema.optional(),
});

export type AssistantChatResponse = z.infer<typeof assistantChatResponseSchema>;

export type AssistantChatRequest = {
  collectionUserId: string;
  message: string;
};

export const postAssistantChat = async (
  body: AssistantChatRequest,
  signal?: AbortSignal,
): Promise<AssistantChatResponse> => {
  const raw = await apiFetch<unknown>({
    method: 'POST',
    path: '/assistant/chat',
    body,
    signal,
  });
  return assistantChatResponseSchema.parse(raw);
};

export const toCollectionFilter = (
  filter: AssistantChatResponse['filter'],
): GuitarCollectionFilter | null => {
  if (!filter) return null;
  const hasCriteria = Object.values(filter).some((v) => v !== undefined && v !== '');
  return hasCriteria ? filter : null;
};
