type TagCloudProps = {
  tags: string[];
  selected: string[];
  onToggle: (tag: string) => void;
};

export const TagCloud = ({ tags, selected, onToggle }: TagCloudProps) => {
  if (tags.length === 0) return null;

  const selectedSet = new Set(selected.map((t) => t.toLowerCase()));

  return (
    <div className="flex flex-wrap gap-2" role="list" aria-label="Visual tags">
      {tags.map((tag) => {
        const active = selectedSet.has(tag.toLowerCase());
        return (
          <button
            key={tag}
            type="button"
            role="listitem"
            aria-pressed={active}
            className={
              active
                ? 'rounded-full bg-slate-800 px-3 py-1 text-sm font-medium text-white'
                : 'rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:border-slate-400'
            }
            onClick={() => onToggle(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};
