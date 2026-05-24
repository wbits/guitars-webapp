import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cognitoErrorMessage } from '@/lib/cognito-errors';
import { signIn } from '@/lib/cognito-auth';
import { isCognitoEnabled } from '@/lib/cognito-config';
import { useAuthSession } from '@/hooks/use-auth-session';
import { logout } from '@/lib/logout';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const signedIn = useAuthSession();
  const registered = (location.state as { registered?: boolean } | null)?.registered === true;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isCognitoEnabled()) {
    return (
      <section className="mx-auto max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-600">
          Cognito is not configured for this build. Paste a bearer token on the{' '}
          <Link to="/settings" className="font-medium text-slate-900 underline">
            Settings
          </Link>{' '}
          page instead.
        </p>
      </section>
    );
  }

  if (signedIn) {
    return (
      <section className="mx-auto max-w-md space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Already signed in</h1>
        <p className="text-sm text-slate-600">
          You are already signed in to this device. Open your collection or sign out to use a
          different account.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/guitars" className="btn-primary">
            Go to collection
          </Link>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              void logout().then(() => navigate('/login', { replace: true }));
            }}
          >
            Sign out
          </button>
        </div>
      </section>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/guitars', { replace: true });
    } catch (err) {
      setError(cognitoErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-md space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="text-sm text-slate-600">
          Sign in with your Cognito account to access the guitar collection.
        </p>
      </header>

      {registered ? (
        <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-900">
          Account created. Sign in with your email and password.
        </div>
      ) : null}

      <form
        onSubmit={submit}
        className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="login-email" className="label">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="login-password" className="label">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? <p className="error-text">{error}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-600">
        No account yet?{' '}
        <Link to="/register" className="font-medium text-slate-900 underline">
          Register
        </Link>
      </p>
    </section>
  );
};
