import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { isCognitoEnabled } from '@/lib/cognito-config';
import { hasToken, RUNTIME_TOKEN_KEY } from '@/lib/token';

interface AuthGateProps {
  children: ReactNode;
}

/**
 * Renders children only when a bearer token is configured. With Cognito
 * enabled, restores the session from the user pool on load. Otherwise falls
 * back to the manual token flow via /settings.
 */
export const AuthGate = ({ children }: AuthGateProps) => {
  const cognito = isCognitoEnabled();
  const [checking, setChecking] = useState(cognito);
  const [tokenPresent, setTokenPresent] = useState<boolean>(() => hasToken());

  useEffect(() => {
    let cancelled = false;

    const recheck = () => setTokenPresent(hasToken());

    const finishChecking = () => {
      if (cancelled) return;
      setTokenPresent(hasToken());
      setChecking(false);
    };

    const bootstrap = async () => {
      if (!cognito || hasToken()) {
        finishChecking();
        return;
      }

      const safety = window.setTimeout(finishChecking, 8000);

      try {
        const { refreshSessionToken } = await import('@/lib/cognito-auth');
        await refreshSessionToken();
      } catch {
        // Treat failed session restore as signed out.
      } finally {
        window.clearTimeout(safety);
        finishChecking();
      }
    };

    void bootstrap();

    window.addEventListener('storage', recheck);
    window.addEventListener('guitars:token-changed', recheck);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', recheck);
      window.removeEventListener('guitars:token-changed', recheck);
    };
  }, [cognito]);

  if (checking) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center text-sm text-slate-600">
        Checking sign-in status…
      </div>
    );
  }

  if (tokenPresent) return <>{children}</>;

  if (cognito) {
    return (
      <div className="mx-auto max-w-xl p-8">
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-amber-900">Sign in required</h2>
          <p className="mt-2 text-sm text-amber-900">
            Sign in with your Cognito account to access the guitar collection.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/login" className="btn-primary">
              Sign in
            </Link>
            <Link to="/register" className="btn-secondary">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-6">
        <h2 className="text-lg font-semibold text-amber-900">No bearer token configured</h2>
        <p className="mt-2 text-sm text-amber-900">
          The GuitarCollection API requires a bearer token on every request. This build does not
          have one baked in, and the runtime override (
          <code className="rounded bg-amber-100 px-1">sessionStorage</code> key{' '}
          <code className="rounded bg-amber-100 px-1">{RUNTIME_TOKEN_KEY}</code>) is empty.
        </p>
        <p className="mt-4">
          <Link to="/settings" className="btn-primary">
            Configure token
          </Link>
        </p>
      </div>
    </div>
  );
};
