import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { z } from 'zod';
import { apiFetch } from './client';

const meSchema = z.object({
  userId: z.string(),
  username: z.string().optional(),
  email: z.string().optional(),
  displayName: z.string(),
  isAdmin: z.boolean().optional().default(false),
  assistantByokConfigured: z.boolean().optional().default(false),
  assistantLlmBaseUrl: z.string().optional(),
  assistantLlmModel: z.string().optional(),
});

export type CurrentUser = z.infer<typeof meSchema>;

export const getCurrentUser = async (signal?: AbortSignal): Promise<CurrentUser> => {
  const raw = await apiFetch<unknown>({ path: '/me', signal });
  return meSchema.parse(raw);
};

export const updateProfile = async (input: { username: string }): Promise<CurrentUser> => {
  const raw = await apiFetch<unknown>({
    method: 'PATCH',
    path: '/me',
    body: input,
  });
  return meSchema.parse(raw);
};

export const useCurrentUser = (options?: { enabled?: boolean }): UseQueryResult<CurrentUser> =>
  useQuery({
    queryKey: ['me'],
    queryFn: ({ signal }) => getCurrentUser(signal),
    enabled: options?.enabled ?? true,
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { username: string }) => updateProfile(input),
    onSuccess: (updated) => {
      qc.setQueryData(['me'], updated);
      qc.invalidateQueries({ queryKey: ['collections'] });
    },
  });
};
