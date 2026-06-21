import { useState } from 'react';
import { ApiError } from '@/api/client';
import { postAssistantChat, toCollectionFilter } from '@/api/assistant';
import { ErrorBanner } from '@/components/ErrorBanner';
import type { GuitarCollectionFilter } from '@/lib/filter-guitars';

export type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

type CollectionAssistantChatProps = {
  collectionUserId: string;
  onFilterChange: (filter: GuitarCollectionFilter | null) => void;
  defaultOpen?: boolean;
};

export const CollectionAssistantChat = ({
  collectionUserId,
  onFilterChange,
  defaultOpen = false,
}: CollectionAssistantChatProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const send = async () => {
    const message = input.trim();
    if (!message || pending) return;
    setInput('');
    setError(null);
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setPending(true);
    try {
      const res = await postAssistantChat({ collectionUserId, message });
      setMessages((prev) => [...prev, { role: 'assistant', text: res.message }]);
      onFilterChange(toCollectionFilter(res.filter));
    } catch (err) {
      setError(err);
      if (err instanceof ApiError && err.status === 429) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Daily assistant limit reached. Try again tomorrow or browse the gallery manually.',
          },
        ]);
      }
    } finally {
      setPending(false);
    }
  };

  const clearFilter = () => {
    onFilterChange(null);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', text: 'Showing the full collection again.' },
    ]);
  };

  if (!open) {
    return (
      <button
        type="button"
        className="btn-secondary fixed bottom-4 right-4 z-40 shadow-lg sm:bottom-6 sm:right-6"
        onClick={() => setOpen(true)}
      >
        Ask about this collection
      </button>
    );
  }

  return (
    <aside
      className="fixed bottom-4 right-4 z-40 flex w-[min(100vw-2rem,22rem)] flex-col rounded-md border border-slate-200 bg-white shadow-xl sm:bottom-6 sm:right-6"
      aria-label="Collection assistant"
    >
      <header className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-900">Collection assistant</h2>
        <div className="flex gap-2">
          <button type="button" className="text-xs text-slate-600 hover:text-slate-900" onClick={clearFilter}>
            Show all
          </button>
          <button type="button" className="text-xs text-slate-600 hover:text-slate-900" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      </header>

      <div className="max-h-64 space-y-2 overflow-y-auto px-3 py-2 text-sm">
        {messages.length === 0 ? (
          <p className="text-slate-600">
            Try &quot;Show Fenders under €1000&quot; or &quot;red guitars&quot;.
          </p>
        ) : null}
        {messages.map((msg, index) => (
          <p
            key={`${msg.role}-${index}`}
            className={msg.role === 'user' ? 'text-right text-slate-900' : 'text-slate-700'}
          >
            {msg.text}
          </p>
        ))}
      </div>

      {error && !(error instanceof ApiError && error.status === 429) ? (
        <div className="px-3 pb-2">
          <ErrorBanner error={error} title="Assistant unavailable" />
        </div>
      ) : null}

      <form
        className="flex gap-2 border-t border-slate-200 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          type="text"
          className="min-w-0 flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm"
          placeholder="Ask a question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={pending}
          aria-label="Message to collection assistant"
        />
        <button type="submit" className="btn-primary shrink-0 px-3 py-1.5 text-sm" disabled={pending || !input.trim()}>
          {pending ? '…' : 'Send'}
        </button>
      </form>
    </aside>
  );
};
