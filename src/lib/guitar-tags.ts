import type { Guitar } from '@/domain/guitar';

/** Collects unique AI tags from guitars with ready analysis. */
export const collectTagsFromGuitars = (guitars: Guitar[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const guitar of guitars) {
    if (guitar.analysis?.status !== 'ready') continue;
    for (const tag of guitar.analysis.tags ?? []) {
      const normalized = tag.trim().toLowerCase();
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      out.push(tag.trim());
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
};

/** Returns a known tag when the user input clearly refers to one tag. */
export const matchTagFromInput = (input: string, knownTags: string[]): string | null => {
  const query = input.trim().toLowerCase();
  if (!query || knownTags.length === 0) return null;

  const exact = knownTags.find((tag) => tag.toLowerCase() === query);
  if (exact) return exact;

  const token = query.replace(/^#/, '');
  const hashExact = knownTags.find((tag) => tag.toLowerCase() === token);
  if (hashExact) return hashExact;

  const partial = knownTags.filter(
    (tag) => tag.toLowerCase().includes(query) || query.includes(tag.toLowerCase()),
  );
  if (partial.length === 1) return partial[0];

  const prefix = knownTags.filter((tag) => tag.toLowerCase().startsWith(query));
  if (prefix.length === 1) return prefix[0];

  return null;
};

export const guitarHasAnyTag = (guitar: Guitar, tags: string[]): boolean => {
  if (tags.length === 0) return true;
  const analysis = guitar.analysis;
  if (!analysis || analysis.status !== 'ready') return false;
  const guitarTags = (analysis.tags ?? []).map((t) => t.toLowerCase());
  return tags.some((selected) => guitarTags.includes(selected.trim().toLowerCase()));
};

export const filterGuitarsByTags = (guitars: Guitar[], tags: string[]): Guitar[] => {
  const active = tags.map((t) => t.trim()).filter(Boolean);
  if (active.length === 0) return guitars;
  return guitars.filter((guitar) => guitarHasAnyTag(guitar, active));
};

export const parseTagsParam = (raw: string | null): string[] => {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
};
