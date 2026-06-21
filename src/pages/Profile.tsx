import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { useCurrentUser, useUpdateProfile } from '@/api/me';
import { ErrorBanner } from '@/components/ErrorBanner';
import { AssistantBYOKSettings } from '@/components/AssistantBYOKSettings';
import { PhotoAnalysisSettings } from '@/components/PhotoAnalysisSettings';
import { isCognitoEnabled } from '@/lib/cognito-config';
import { logout } from '@/lib/logout';

export const Profile = () => {
  const navigate = useNavigate();
  const cognito = isCognitoEnabled();
  const me = useCurrentUser();
  const update = useUpdateProfile();
  const [username, setUsername] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (me.data?.username) {
      setUsername(me.data.username);
    }
  }, [me.data?.username]);

  if (me.isLoading) {
    return <p className="text-sm text-slate-600">Loading profile…</p>;
  }
  if (me.isError || !me.data) {
    return <ErrorBanner error={me.error ?? 'Could not load profile'} title="Profile unavailable" />;
  }

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError(null);
    setSaved(false);
    try {
      await update.mutateAsync({ username: username.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      if (err instanceof ApiError) setServerError(err.message);
      else if (err instanceof Error) setServerError(err.message);
      else setServerError('Unknown error');
    }
  };

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-600">
          Choose a username for your collection. If you leave it empty, your email address is shown instead.
        </p>
      </header>

      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-slate-500">Email</dt>
            <dd className="mt-1 text-slate-900">{me.data.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-500">Display name</dt>
            <dd className="mt-1 text-slate-900">{me.data.displayName}</dd>
          </div>
        </dl>
      </div>

      <form onSubmit={save} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <label htmlFor="username" className="label">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          className="input"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder={me.data.email ?? 'your-username'}
        />
        <p className="help">
          3–30 characters. Letters, numbers, underscores, and hyphens only.
        </p>

        {serverError ? (
          <div className="mt-3">
            <ErrorBanner error={serverError} title="Could not save profile" />
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save username'}
          </button>
          {saved ? <span className="text-sm text-green-700">Saved.</span> : null}
          <Link to="/guitars" className="btn-secondary">
            Back to collection
          </Link>
        </div>
      </form>

      <AssistantBYOKSettings me={me.data} />
      <PhotoAnalysisSettings me={me.data} />

      {cognito ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Sign out</h2>
          <p className="mt-1 text-sm text-slate-600">
            End your session on this device and return to the sign-in page.
          </p>
          <button
            type="button"
            className="btn-secondary mt-4"
            onClick={() => {
              void logout().then(() => navigate('/login', { replace: true }));
            }}
          >
            Sign out
          </button>
        </div>
      ) : null}
    </section>
  );
};
