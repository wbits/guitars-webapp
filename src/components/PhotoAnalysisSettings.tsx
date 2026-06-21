import { useState } from 'react';
import { ApiError } from '@/api/client';
import { useUpdateProfile, type CurrentUser } from '@/api/me';
import { ErrorBanner } from '@/components/ErrorBanner';

type PhotoAnalysisSettingsProps = {
  me: CurrentUser;
};

export const PhotoAnalysisSettings = ({ me }: PhotoAnalysisSettingsProps) => {
  const update = useUpdateProfile();
  const [error, setError] = useState<string | null>(null);
  const enabled = me.photoAnalysisEnabled;

  const onToggle = async () => {
    setError(null);
    try {
      await update.mutateAsync({
        username: me.username ?? '',
        photoAnalysisEnabled: !enabled,
      });
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError('Could not update photo analysis setting');
    }
  };

  if (!me.assistantByokConfigured) {
    return null;
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Photo analysis (AI metadata)</h2>
      <p className="mt-1 text-sm text-slate-600">
        When enabled, new or updated guitar photos are analyzed with your API key to extract visual
        tags and a short summary. Results are stored and used for collection search. Your entered
        guitar details stay authoritative; AI metadata is advisory and labeled as such.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={enabled ? 'btn-secondary' : 'btn-primary'}
          onClick={() => void onToggle()}
          disabled={update.isPending}
        >
          {update.isPending ? 'Saving…' : enabled ? 'Disable photo analysis' : 'Enable photo analysis'}
        </button>
        <span className="text-sm text-slate-600">
          Status:{' '}
          {enabled ? (
            <span className="font-medium text-green-700">Enabled</span>
          ) : (
            <span>Disabled</span>
          )}
        </span>
      </div>

      {error ? (
        <div className="mt-3">
          <ErrorBanner error={error} title="Photo analysis" />
        </div>
      ) : null}
    </section>
  );
};
