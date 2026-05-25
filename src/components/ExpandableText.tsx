import { useState } from 'react';
import { DESCRIPTION_PREVIEW_LIMIT, isTruncated, truncateAtWordBoundary } from '@/lib/truncate-text';
import { looksLikeHtml, sanitizeRichTextHtml, stripHtml } from '@/lib/rich-text';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

const plainTextClassName = 'whitespace-pre-wrap text-sm text-slate-800';
const richTextClassName = 'rich-text-content text-sm text-slate-800';

export const ExpandableText = ({
  text,
  maxLength = DESCRIPTION_PREVIEW_LIMIT,
  className,
}: ExpandableTextProps) => {
  const [expanded, setExpanded] = useState(false);

  if (looksLikeHtml(text)) {
    const plainText = stripHtml(text);
    const canExpand = isTruncated(plainText, maxLength);
    const preview = truncateAtWordBoundary(plainText, maxLength);

    if (!canExpand) {
      return (
        <div
          className={className ?? richTextClassName}
          dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(text) }}
        />
      );
    }

    return (
      <div>
        {expanded ? (
          <div
            className={className ?? richTextClassName}
            dangerouslySetInnerHTML={{ __html: sanitizeRichTextHtml(text) }}
          />
        ) : (
          <p className={className ?? plainTextClassName}>{preview}</p>
        )}
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-2 text-sm font-medium text-slate-700 underline hover:text-slate-900"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      </div>
    );
  }

  const canExpand = isTruncated(text, maxLength);
  const preview = truncateAtWordBoundary(text, maxLength);
  const resolvedClassName = className ?? plainTextClassName;

  if (!canExpand) {
    return <p className={resolvedClassName}>{text}</p>;
  }

  return (
    <div>
      <p className={resolvedClassName}>{expanded ? text : preview}</p>
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="mt-2 text-sm font-medium text-slate-700 underline hover:text-slate-900"
      >
        {expanded ? 'Show less' : 'Show more'}
      </button>
    </div>
  );
};
