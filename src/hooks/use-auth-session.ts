import { useEffect, useState } from 'react';
import { hasToken } from '@/lib/token';

/** Tracks whether an API bearer token is available for the current tab. */
export const useAuthSession = (): boolean => {
  const [signedIn, setSignedIn] = useState(() => hasToken());

  useEffect(() => {
    const recheck = () => setSignedIn(hasToken());
    recheck();
    window.addEventListener('guitars:token-changed', recheck);
    window.addEventListener('storage', recheck);
    return () => {
      window.removeEventListener('guitars:token-changed', recheck);
      window.removeEventListener('storage', recheck);
    };
  }, []);

  return signedIn;
};
