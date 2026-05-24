import { notifyTokenChanged } from '@/lib/auth-events';
import { isCognitoEnabled } from '@/lib/cognito-config';
import { clearRuntimeToken } from '@/lib/token';

/** Clears the Cognito session (when enabled) and the runtime API token. */
export const logout = async (): Promise<void> => {
  if (isCognitoEnabled()) {
    const { signOut } = await import('@/lib/cognito-auth');
    await signOut();
  } else {
    clearRuntimeToken();
  }
  notifyTokenChanged();
};
