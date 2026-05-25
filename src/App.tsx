import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CollectionPicker } from '@/components/CollectionPicker';
import { useAuthSession } from '@/hooks/use-auth-session';
import { isCognitoEnabled } from '@/lib/cognito-config';
import { logout } from '@/lib/logout';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 touch-manipulation items-center rounded-md px-3 py-2 text-sm font-medium ${
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-700 hover:bg-slate-200'
  }`;

export const App = () => {
  const navigate = useNavigate();
  const cognito = isCognitoEnabled();
  const signedIn = useAuthSession();

  const signOut = () => {
    void logout().then(() => {
      navigate(cognito ? '/login' : '/settings', { replace: true });
    });
  };

  useEffect(() => {
    const redirectToSignIn = () => {
      navigate(cognito ? '/login' : '/settings', { replace: true });
    };
    window.addEventListener('guitars:session-invalidated', redirectToSignIn);
    return () => window.removeEventListener('guitars:session-invalidated', redirectToSignIn);
  }, [cognito, navigate]);

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:flex-row sm:items-center sm:justify-between">
          <NavLink
            to="/guitars"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Guitars
          </NavLink>
          <nav className="flex flex-wrap items-center gap-1 sm:justify-end">
            <NavLink to="/guitars" className={navLinkClass} end>
              Collection
            </NavLink>
            <CollectionPicker />
            {signedIn ? (
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
            ) : null}
            {cognito ? (
              signedIn ? (
                <button type="button" onClick={signOut} className="btn-secondary">
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
            ) : null}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:py-6">
        <Outlet />
      </main>
    </div>
  );
};
