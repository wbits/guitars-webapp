import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { z } from 'zod';
import { apiFetch } from './client';
import { meSchema, type CurrentUser } from './me';

const assistantBYOKInputSchema = z.object({
  apiKey: z.string().min(1),
  baseUrl: z.string().optional(),
  model: z.string().optional(),
});

export type AssistantBYOKInput = z.infer<typeof assistantBYOKInputSchema>;

export const saveAssistantBYOK = async (input: AssistantBYOKInput): Promise<CurrentUser> => {
  const body = assistantBYOKInputSchema.parse(input);
  const raw = await apiFetch<unknown>({
    method: 'PUT',
    path: '/me/assistant-byok',
    body: {
      apiKey: body.apiKey,
      baseUrl: body.baseUrl?.trim() || undefined,
      model: body.model?.trim() || undefined,
    },
  });
  return meSchema.parse(raw);
};

export const clearAssistantBYOK = async (): Promise<CurrentUser> => {
  const raw = await apiFetch<unknown>({
    method: 'DELETE',
    path: '/me/assistant-byok',
  });
  return meSchema.parse(raw);
};

export const useSaveAssistantBYOK = (): UseMutationResult<CurrentUser, Error, AssistantBYOKInput> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: saveAssistantBYOK,
    onSuccess: (updated) => {
      qc.setQueryData(['me'], updated);
    },
  });
};

export const useClearAssistantBYOK = (): UseMutationResult<CurrentUser, Error, void> => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearAssistantBYOK,
    onSuccess: (updated) => {
      qc.setQueryData(['me'], updated);
    },
  });
};
