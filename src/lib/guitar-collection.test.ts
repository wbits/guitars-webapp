import { describe, expect, it } from 'vitest';
import type { Guitar } from '@/domain/guitar';
import { getGuitarNeighbors, sortGuitarsForCollection } from './guitar-collection';

const guitar = (overrides: Partial<Guitar> & Pick<Guitar, 'id' | 'brand'>): Guitar => ({
  typeName: 'Strat',
  buildYear: 2020,
  priceAmount: 100000,
  priceCurrency: 'EUR',
  serialNumber: undefined,
  description: undefined,
  pictures: [],
  coverPictureIndex: 0,
  ...overrides,
});

describe('guitar-collection', () => {
  it('sorts guitars by brand case-insensitively', () => {
    const sorted = sortGuitarsForCollection([
      guitar({ id: '2', brand: 'Gibson' }),
      guitar({ id: '1', brand: 'fender' }),
      guitar({ id: '3', brand: 'Epiphone' }),
    ]);

    expect(sorted.map((g) => g.id)).toEqual(['3', '1', '2']);
  });

  it('returns previous and next neighbors in collection order', () => {
    const guitars = [
      guitar({ id: 'a', brand: 'Epiphone' }),
      guitar({ id: 'b', brand: 'Fender' }),
      guitar({ id: 'c', brand: 'Gibson' }),
    ];

    expect(getGuitarNeighbors(guitars, 'b')).toEqual({
      previous: guitars[0],
      next: guitars[2],
    });
  });

  it('returns null neighbors at the collection edges', () => {
    const guitars = [
      guitar({ id: 'a', brand: 'Epiphone' }),
      guitar({ id: 'b', brand: 'Fender' }),
    ];

    expect(getGuitarNeighbors(guitars, 'a')).toEqual({
      previous: null,
      next: guitars[1],
    });
    expect(getGuitarNeighbors(guitars, 'b')).toEqual({
      previous: guitars[0],
      next: null,
    });
  });
});
