import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const Step = ({ n, title, children }: { n: number; title: string; children: ReactNode }) => (
  <li className="flex gap-3">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
      {n}
    </span>
    <div className="min-w-0 pt-0.5">
      <h3 className="font-medium text-slate-900">{title}</h3>
      <div className="mt-1 space-y-2 text-sm text-slate-600">{children}</div>
    </div>
  </li>
);

export const AssistantApiKeyHelp = () => (
  <article className="space-y-8">
    <header className="space-y-2">
      <p className="text-sm text-slate-500">
        <Link to="/profile" className="font-medium text-slate-700 underline">
          ← Back to Profile
        </Link>
      </p>
      <h1 className="text-2xl font-semibold text-slate-900">Connect your AI assistant API key</h1>
      <p className="text-sm text-slate-600">
        Optional tier 2 (BYOK): use your own OpenAI-compatible key for assistant chat on{' '}
        <strong>your collection</strong>. Visitors browsing your gallery still use the hosted assistant.
      </p>
    </header>

    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">How we keep your key safe</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-600">
        <li>
          Your key is sent over <strong>HTTPS</strong> and stored <strong>encrypted</strong> on the server
          (AES-256-GCM). We never save it in plain text.
        </li>
        <li>
          After you save, the key is <strong>never shown again</strong> in the browser — only a
          “Connected” status.
        </li>
        <li>
          We use it only when <strong>you</strong> chat with the assistant on <strong>your own</strong>{' '}
          collection (and for future owner-only features you opt into, such as photo analysis).
        </li>
        <li>
          You can <strong>remove the key anytime</strong> on your Profile page; stored credentials are deleted.
        </li>
      </ul>
      <p className="mt-4 text-sm text-slate-600">
        Recommended: create a <strong>dedicated key</strong> for this site and set a{' '}
        <strong>monthly spending limit</strong> in your provider&apos;s dashboard — not your only production
        key.
      </p>
    </section>

    <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">Get an OpenAI API key</h2>
      <p className="mt-1 text-sm text-slate-600">
        OpenAI is the simplest option. The assistant expects an OpenAI-compatible{' '}
        <code className="rounded bg-slate-100 px-1">/chat/completions</code> API.
      </p>
      <ol className="mt-5 space-y-6">
        <Step n={1} title="Create an OpenAI account">
          <p>
            Go to{' '}
            <a
              href="https://platform.openai.com/signup"
              className="font-medium text-slate-900 underline"
              target="_blank"
              rel="noreferrer"
            >
              platform.openai.com
            </a>{' '}
            and sign up or sign in.
          </p>
        </Step>
        <Step n={2} title="Add billing and a usage limit">
          <p>
            Open <strong>Settings → Billing</strong> and add a payment method. API usage is pay-as-you-go.
          </p>
          <p>
            Under <strong>Usage limits</strong>, set a monthly budget (for example €5–10) so costs stay
            predictable.
          </p>
        </Step>
        <Step n={3} title="Create a secret key">
          <p>
            Open{' '}
            <a
              href="https://platform.openai.com/api-keys"
              className="font-medium text-slate-900 underline"
              target="_blank"
              rel="noreferrer"
            >
              API keys
            </a>{' '}
            → <strong>Create new secret key</strong>. Name it something like{' '}
            <em>guitars-collection</em>.
          </p>
          <p>
            Copy the key immediately (it starts with <code className="rounded bg-slate-100 px-1">sk-</code>
            ). You will not be able to see it again.
          </p>
        </Step>
        <Step n={4} title="Paste it on your Profile">
          <p>
            On{' '}
            <Link to="/profile" className="font-medium text-slate-900 underline">
              Profile → AI assistant
            </Link>
            , paste the key and save.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>API base URL</strong> — leave empty (defaults to OpenAI).
            </li>
            <li>
              <strong>Model</strong> — e.g. <code className="rounded bg-slate-100 px-1">gpt-4o-mini</code>{' '}
              (low cost) or <code className="rounded bg-slate-100 px-1">gpt-4o</code>.
            </li>
          </ul>
        </Step>
        <Step n={5} title="Try the assistant">
          <p>
            Open <Link to="/guitars" className="font-medium text-slate-900 underline">your collection</Link>,
            click <strong>Ask about this collection</strong>, and ask something like “show Fenders under
            €1000”.
          </p>
        </Step>
      </ol>
    </section>

    <section className="rounded-md border border-slate-200 bg-slate-50 p-6">
      <h2 className="text-base font-semibold text-slate-900">Other OpenAI-compatible providers</h2>
      <p className="mt-2 text-sm text-slate-600">
        Providers such as{' '}
        <a
          href="https://openrouter.ai"
          className="font-medium text-slate-900 underline"
          target="_blank"
          rel="noreferrer"
        >
          OpenRouter
        </a>{' '}
        or{' '}
        <a
          href="https://console.groq.com"
          className="font-medium text-slate-900 underline"
          target="_blank"
          rel="noreferrer"
        >
          Groq
        </a>{' '}
        also work if they expose an OpenAI-compatible API. Check their docs for the correct{' '}
        <strong>base URL</strong> and <strong>model</strong> name, then enter all three fields on Profile.
      </p>
      <p className="mt-3 text-sm text-slate-600">
        Example (OpenRouter): base URL{' '}
        <code className="rounded bg-white px-1">https://openrouter.ai/api/v1</code>, model{' '}
        <code className="rounded bg-white px-1">openai/gpt-4o-mini</code>.
      </p>
    </section>

    <p className="text-sm text-slate-600">
      Questions or want to revoke access? Remove the key on{' '}
      <Link to="/profile" className="font-medium text-slate-900 underline">
        Profile
      </Link>{' '}
      or delete the key in your provider&apos;s dashboard.
    </p>
  </article>
);
