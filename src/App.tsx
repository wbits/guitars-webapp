import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { notifyTokenChanged } from '@/lib/auth-events';
import { isCognitoEnabled } from '@/lib/cognito-config';
import { clearRuntimeToken, hasToken } from '@/lib/token';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-700 hover:bg-slate-200'
  }`;

export const App = () => {
  const navigate = useNavigate();
  const cognito = isCognitoEnabled();
  const [signedIn, setSignedIn] = useState(() => hasToken());

  useEffect(() => {
    const recheck = () => setSignedIn(hasToken());
    window.addEventListener('guitars:token-changed', recheck);
    window.addEventListener('storage', recheck);
    return () => {
      window.removeEventListener('guitars:token-changed', recheck);
      window.removeEventListener('storage', recheck);
    };
  }, []);

  const logout = () => {
    if (cognito) {
      void import('@/lib/cognito-auth').then(({ signOut }) => signOut());
    } else {
      clearRuntimeToken();
    }
    notifyTokenChanged();
    navigate(cognito ? '/login' : '/settings', { replace: true });
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <NavLink to="/guitars" className="text-lg font-semibold tracking-tight text-slate-900">
              Guitars
            </NavLink>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/guitars" className={navLinkClass} end>
              Collection
            </NavLink>
            {cognito ? (
              signedIn ? (
                <button type="button" onClick={logout} className="btn-secondary">
                  Sign out
                </button>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass}>
                    Sign in
                  </NavLink>
                  <NavLink to="/register" className={navLinkClass}>
                    Register
                  </NavLink>
                </>
              )
            ) : (
              <NavLink to="/settings" className={navLinkClass}>
                Settings
              </NavLink>
            )}
            {cognito ? (
              <NavLink to="/settings" className={navLinkClass}>
                Settings
              </NavLink>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
