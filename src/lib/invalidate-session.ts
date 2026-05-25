import { notifyTokenChanged } from '@/lib/auth-events';
import { isCognitoEnabled } from '@/lib/cognito-config';
import { clearRuntimeToken } from '@/lib/token';

let inProgress = false;

const isAuthPage = (): boolean => {
  const path = window.location.pathname;
  return path === '/login' || path === '/register';
};

/** Clears local session state after the API rejects the bearer token. */
export const invalidateSession = async (): Promise<void> => {
  if (inProgress || typeof window === 'undefined') {
    return;
  }

  inProgress = true;
  try {
    clearRuntimeToken();
    notifyTokenChanged();

    if (isCognitoEnabled()) {
      try {
        const { signOut } = await import('@/lib/cognito-auth');
        await signOut();
      } catch {
        clearRuntimeToken();
      }
      notifyTokenChanged();
    }

    if (!isAuthPage()) {
      window.dispatchEvent(new Event('guitars:session-invalidated'));
    }
  } finally {
    inProgress = false;
  }
};

export const isUnauthorizedStatus = (status: number): boolean => status === 401;
