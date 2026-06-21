import type { Guitar } from '@/domain/guitar';
import { guitarHasAnyTag } from '@/lib/guitar-tags';

/** Gallery filter spec (prices in major units, e.g. euros). */
export type GuitarCollectionFilter = {
  brand?: string;
  typeName?: string;
  color?: string;
  minPriceMajor?: number;
  maxPriceMajor?: number;
  minYear?: number;
  maxYear?: number;
  tag?: string;
  tags?: string[];
  searchText?: string;
};

const containsFold = (haystack: string | undefined, needle: string): boolean => {
  if (!needle.trim()) return true;
  return (haystack ?? '').toLowerCase().includes(needle.trim().toLowerCase());
};

export const filterGuitars = (guitars: Guitar[], filter: GuitarCollectionFilter): Guitar[] => {
  const hasCriteria =
    Boolean(filter.brand?.trim()) ||
    Boolean(filter.typeName?.trim()) ||
    Boolean(filter.color?.trim()) ||
    Boolean(filter.tag?.trim()) ||
    Boolean(filter.tags?.some((t) => t.trim())) ||
    Boolean(filter.searchText?.trim()) ||
    filter.minPriceMajor !== undefined ||
    filter.maxPriceMajor !== undefined ||
    filter.minYear !== undefined ||
    filter.maxYear !== undefined;

  if (!hasCriteria) {
    return guitars;
  }

  return guitars.filter((guitar) => {
    if (filter.brand && !containsFold(guitar.brand, filter.brand)) return false;
    if (filter.typeName && !containsFold(guitar.typeName, filter.typeName)) return false;
    if (filter.color && !containsFold(guitar.color, filter.color)) return false;
    if (filter.minYear !== undefined && guitar.buildYear < filter.minYear) return false;
    if (filter.maxYear !== undefined && guitar.buildYear > filter.maxYear) return false;

    const priceMajor = guitar.priceAmount / 100;
    if (filter.minPriceMajor !== undefined && priceMajor < filter.minPriceMajor) return false;
    if (filter.maxPriceMajor !== undefined && priceMajor > filter.maxPriceMajor) return false;

    if (filter.tag && !tagMatches(guitar, filter.tag)) return false;
    if (filter.tags && filter.tags.length > 0 && !guitarHasAnyTag(guitar, filter.tags)) return false;
    if (filter.searchText && !searchMatches(guitar, filter.searchText)) return false;

    return true;
  });
};

const tagMatches = (guitar: Guitar, tag: string): boolean => {
  const needle = tag.trim().toLowerCase();
  if (!needle) return true;
  const analysis = guitar.analysis;
  if (!analysis || analysis.status !== 'ready') return false;
  const tags = analysis.tags ?? [];
  if (tags.some((t) => {
    const lower = t.toLowerCase();
    return lower === needle || lower.includes(needle);
  })) {
    return true;
  }
  return (analysis.visualSummary ?? '').toLowerCase().includes(needle);
};

const searchMatches = (guitar: Guitar, query: string): boolean => {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  let blob = [guitar.brand, guitar.typeName, guitar.color, guitar.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const analysis = guitar.analysis;
  if (analysis?.status === 'ready') {
    blob += ` ${analysis.visualSummary ?? ''} ${(analysis.tags ?? []).join(' ')}`;
  }
  return blob.includes(needle);
};

export const filterToMatchingIds = (guitars: Guitar[], filter: GuitarCollectionFilter): string[] =>
  filterGuitars(guitars, filter).map((g) => g.id);
