/**
 * Bearer-token resolution for the GuitarCollection API.
 *
 * When Cognito is configured, only the runtime session token (set after
 * sign-in) is used. Otherwise two legacy sources are supported:
 *
 *   1. A build-time value injected via `VITE_GUITARS_BEARER_TOKEN`.
 *   2. A runtime value pasted on /settings, stored in `sessionStorage`.
 */

import { isCognitoEnabled } from '@/lib/cognito-config';

export const RUNTIME_TOKEN_KEY = 'guitars:bearerToken';

const buildTimeToken = (): string | null => {
  const value = import.meta.env.VITE_GUITARS_BEARER_TOKEN;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

const safeSessionStorage = (): Storage | null => {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const getRuntimeToken = (): string | null => {
  const store = safeSessionStorage();
  if (!store) return null;
  const raw = store.getItem(RUNTIME_TOKEN_KEY);
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  return trimmed === '' ? null : trimmed;
};

export const setRuntimeToken = (token: string): void => {
  const store = safeSessionStorage();
  if (!store) return;
  const trimmed = token.trim();
  if (trimmed === '') {
    store.removeItem(RUNTIME_TOKEN_KEY);
    return;
  }
  store.setItem(RUNTIME_TOKEN_KEY, trimmed);
};

export const clearRuntimeToken = (): void => {
  const store = safeSessionStorage();
  if (!store) return;
  store.removeItem(RUNTIME_TOKEN_KEY);
};

export const getToken = (): string | null => {
  const runtime = getRuntimeToken();
  if (runtime) return runtime;
  if (isCognitoEnabled()) return null;
  return buildTimeToken();
};

export const hasToken = (): boolean => getToken() !== null;
