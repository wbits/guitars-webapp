import { coverPictureUrl, formatGuitarCaption } from '@/lib/guitar-cover';
import type { Guitar } from '@/domain/guitar';
import { describe, expect, it } from 'vitest';

describe('guitar-cover helpers', () => {
  const guitar = (overrides: Partial<Guitar>): Guitar => ({
    id: 'g-1',
    brand: 'Fender',
    typeName: 'Stratocaster',
    buildYear: 1996,
    priceAmount: 100000,
    priceCurrency: 'EUR',
    pictures: [],
    coverPictureIndex: 0,
    ...overrides,
  });

  it('formatGuitarCaption combines brand, type, and year', () => {
    expect(formatGuitarCaption(guitar({}))).toBe('Fender Stratocaster (1996)');
  });

  it('coverPictureUrl returns null when there are no pictures', () => {
    expect(coverPictureUrl(guitar({ pictures: [] }))).toBeNull();
  });

  it('coverPictureUrl uses the first picture by default', () => {
    expect(
      coverPictureUrl(
        guitar({
          pictures: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
          coverPictureIndex: 0,
        }),
      ),
    ).toBe('https://example.com/a.jpg');
  });

  it('coverPictureUrl respects coverPictureIndex', () => {
    expect(
      coverPictureUrl(
        guitar({
          pictures: ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
          coverPictureIndex: 1,
        }),
      ),
    ).toBe('https://example.com/b.jpg');
  });

  it('coverPictureUrl falls back to the first picture when index is invalid', () => {
    expect(
      coverPictureUrl(
        guitar({
          pictures: ['https://example.com/a.jpg'],
          coverPictureIndex: 3,
        }),
      ),
    ).toBe('https://example.com/a.jpg');
  });
});
