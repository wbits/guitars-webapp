import { describe, expect, it } from 'vitest';
import type { Guitar } from '@/domain/guitar';
import { filterGuitars } from './filter-guitars';

const sample: Guitar[] = [
  {
    id: '1',
    brand: 'Fender',
    typeName: 'Stratocaster',
    buildYear: 1996,
    priceAmount: 150_000,
    priceCurrency: 'EUR',
    pictures: [],
    coverPictureIndex: 0,
    color: 'Sunburst',
  },
  {
    id: '2',
    brand: 'Gibson',
    typeName: 'Les Paul',
    buildYear: 2017,
    priceAmount: 80_000,
    priceCurrency: 'EUR',
    pictures: [],
    coverPictureIndex: 0,
    color: 'Cherry Red',
  },
];

describe('filterGuitars', () => {
  it('filters by brand and max price', () => {
    const out = filterGuitars(sample, { brand: 'Fender', maxPriceMajor: 2000 });
    expect(out.map((g) => g.id)).toEqual(['1']);
  });

  it('filters by color substring', () => {
    const out = filterGuitars(sample, { color: 'red' });
    expect(out.map((g) => g.id)).toEqual(['2']);
  });
});
