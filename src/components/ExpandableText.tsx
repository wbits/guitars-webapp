import { useState } from 'react';
import { DESCRIPTION_PREVIEW_LIMIT, isTruncated, truncateAtWordBoundary } from '@/lib/truncate-text';

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const ExpandableText = ({
  text,
  maxLength = DESCRIPTION_PREVIEW_LIMIT,
  className = 'whitespace-pre-wrap text-sm text-slate-800',
}: ExpandableTextProps) => {
  const [expanded, setExpanded] = useState(false);
  const canExpand = isTruncated(text, maxLength);
  const preview = truncateAtWordBoundary(text, maxLength);

  if (!canExpand) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div>
      <p className={className}>{expanded ? text : preview}</p>
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
