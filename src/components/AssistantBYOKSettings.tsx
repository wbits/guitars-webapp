import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '@/api/client';
import { useClearAssistantBYOK, useSaveAssistantBYOK } from '@/api/assistant-byok';
import type { CurrentUser } from '@/api/me';
import { ErrorBanner } from '@/components/ErrorBanner';

type AssistantBYOKSettingsProps = {
  me: CurrentUser;
};

export const AssistantBYOKSettings = ({ me }: AssistantBYOKSettingsProps) => {
  const save = useSaveAssistantBYOK();
  const clear = useClearAssistantBYOK();
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(me.assistantLlmBaseUrl ?? '');
  const [model, setModel] = useState(me.assistantLlmModel ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const onSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await save.mutateAsync({
        apiKey: apiKey.trim(),
        baseUrl: baseUrl.trim() || undefined,
        model: model.trim() || undefined,
      });
      setApiKey('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError('Could not save assistant settings');
    }
  };

  const onClear = async () => {
    setError(null);
    try {
      await clear.mutateAsync();
      setApiKey('');
      setBaseUrl('');
      setModel('');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else if (err instanceof Error) setError(err.message);
      else setError('Could not remove assistant key');
    }
  };

  return (
    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">AI assistant (your API key)</h2>
      <p className="mt-1 text-sm text-slate-600">
        Connect an OpenAI-compatible API key for tier 2 BYOK. When configured, assistant chat on{' '}
        <strong>your own collection</strong> uses your key and a higher daily limit. Visitors browsing
        your collection still use the hosted assistant.
      </p>

      <p className="mt-3 text-sm text-slate-700">
        Status:{' '}
        {me.assistantByokConfigured ? (
          <span className="font-medium text-green-700">Connected</span>
        ) : (
          <span className="text-slate-600">Not configured</span>
        )}
        {me.assistantByokConfigured && me.assistantLlmModel ? (
          <span className="text-slate-500"> · model {me.assistantLlmModel}</span>
        ) : null}
      </p>

      <form onSubmit={onSave} className="mt-4 space-y-3">
        <div>
          <label htmlFor="assistant-api-key" className="label">
            API key
          </label>
          <input
            id="assistant-api-key"
            type="password"
            autoComplete="off"
            className="input"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder={me.assistantByokConfigured ? 'Paste a new key to replace' : 'sk-…'}
          />
        </div>
        <div>
          <label htmlFor="assistant-base-url" className="label">
            API base URL (optional)
          </label>
          <input
            id="assistant-base-url"
            type="url"
            className="input"
            value={baseUrl}
            onChange={(event) => setBaseUrl(event.target.value)}
            placeholder="https://api.openai.com/v1"
          />
        </div>
        <div>
          <label htmlFor="assistant-model" className="label">
            Model (optional)
          </label>
          <input
            id="assistant-model"
            type="text"
            className="input"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="gpt-4o-mini"
          />
        </div>

        {error ? (
          <ErrorBanner error={error} title="Assistant settings" />
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={save.isPending || apiKey.trim() === ''}>
            {save.isPending ? 'Saving…' : me.assistantByokConfigured ? 'Replace key' : 'Save key'}
          </button>
          {me.assistantByokConfigured ? (
            <button type="button" className="btn-secondary" onClick={() => void onClear()} disabled={clear.isPending}>
              {clear.isPending ? 'Removing…' : 'Remove key'}
            </button>
          ) : null}
          {saved ? <span className="text-sm text-green-700">Saved.</span> : null}
        </div>
      </form>

      <p className="mt-3 text-xs text-slate-500">
        Your key is encrypted on the server and never returned to the browser after save.{' '}
        <Link to="/help/assistant-api-key" className="font-medium text-slate-700 underline">
          How to get a key &amp; how we protect it
        </Link>
      </p>
    </section>
  );
};
