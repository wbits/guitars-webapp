import type { Guitar } from '@/domain/guitar';

/** Gallery filter spec (prices in major units, e.g. euros). */
export type GuitarCollectionFilter = {
  brand?: string;
  typeName?: string;
  color?: string;
  minPriceMajor?: number;
  maxPriceMajor?: number;
  minYear?: number;
  maxYear?: number;
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

    return true;
  });
};

export const filterToMatchingIds = (guitars: Guitar[], filter: GuitarCollectionFilter): string[] =>
  filterGuitars(guitars, filter).map((g) => g.id);
