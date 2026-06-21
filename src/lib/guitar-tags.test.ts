import { describe, expect, it } from 'vitest';
import type { Guitar } from '@/domain/guitar';
import {
  collectTagsFromGuitars,
  filterGuitarsByTags,
  matchTagFromInput,
  parseTagsParam,
} from './guitar-tags';

const guitar = (id: string, tags: string[]): Guitar => ({
  id,
  brand: 'Fender',
  typeName: 'Strat',
  buildYear: 1990,
  priceAmount: 100000,
  priceCurrency: 'EUR',
  pictures: [],
  coverPictureIndex: 0,
  analysis: { status: 'ready', tags },
});

describe('guitar-tags', () => {
  it('collects unique tags from ready analysis', () => {
    expect(
      collectTagsFromGuitars([
        guitar('1', ['sunburst', 'maple-neck']),
        guitar('2', ['sunburst', 'humbucker']),
      ]),
    ).toEqual(['humbucker', 'maple-neck', 'sunburst']);
  });

  it('matches exact and unique partial tag input', () => {
    const known = ['sunburst', 'humbucker'];
    expect(matchTagFromInput('sunburst', known)).toBe('sunburst');
    expect(matchTagFromInput('sun', known)).toBe('sunburst');
    expect(matchTagFromInput('hum', known)).toBe('humbucker');
  });

  it('filters guitars that share any selected tag', () => {
    const guitars = [
      guitar('1', ['sunburst']),
      guitar('2', ['humbucker']),
      guitar('3', ['maple-neck']),
    ];
    expect(filterGuitarsByTags(guitars, ['sunburst', 'humbucker']).map((g) => g.id)).toEqual([
      '1',
      '2',
    ]);
  });

  it('parses tags query param', () => {
    expect(parseTagsParam('sunburst,humbucker')).toEqual(['sunburst', 'humbucker']);
  });
});
