import { useState } from 'react';
import { ApiError } from '@/api/client';
import { useReanalyzeCollection } from '@/api/photo-analysis';
import { useUpdateProfile, type CurrentUser } from '@/api/me';
import { ErrorBanner } from '@/components/ErrorBanner';

type PhotoAnalysisSettingsProps = {
  me: CurrentUser;
};

export const PhotoAnalysisSettings = ({ me }: PhotoAnalysisSettingsProps) => {
  const update = useUpdateProfile();
  const reanalyze = useReanalyzeCollection();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const enabled = me.photoAnalysisEnabled;

  const onReanalyzeCollection = async () => {
    setError(null);
    setResult(null);
    setProgress(null);
    try {
      const summary = await reanalyze.mutateAsync({
        onProgress: () => {
          setProgress('Queueing collection for analysis…');
        },
      });
      setProgress(null);
      setResult(
        `Queued ${summary.queued} of ${summary.total} guitars for analysis` +
          (summary.skipped > 0 ? ` (${summary.skipped} skipped)` : '') +
          '. Results will appear as each guitar finishes.',
      );
    } catch (err) {
      setProgress(null);
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError('Could not re-analyze collection');
    }
  };

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

  if (!me.assistantByokConfigured && !me.assistantByokNeedsResave) {
    return null;
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Photo analysis (AI metadata)</h2>
      {me.assistantByokNeedsResave ? (
        <p className="mt-2 text-sm text-amber-800">
          Your saved assistant API key cannot be read by the server. Re-save it in assistant settings,
          then try re-analyzing again.
        </p>
      ) : null}
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

      <div className="mt-6 border-t border-slate-200 pt-4">
        <h3 className="text-sm font-semibold text-slate-900">Re-analyze collection</h3>
        <p className="mt-1 text-sm text-slate-600">
          Run photo analysis again for every guitar in your collection that has a cover photo.
          Jobs run in the background; refresh guitar pages to see results.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void onReanalyzeCollection()}
            disabled={reanalyze.isPending || me.assistantByokNeedsResave}
          >
            {reanalyze.isPending ? 'Queueing…' : 'Re-analyze collection'}
          </button>
          {progress ? <span className="text-sm text-slate-600">{progress}</span> : null}
          {result ? <span className="text-sm text-green-700">{result}</span> : null}
        </div>
      </div>
    </section>
  );
};
