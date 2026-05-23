import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Guitar } from '@/domain/guitar';
import { GuitarMosaicGrid } from './GuitarMosaicGrid';

const guitar = (overrides: Partial<Guitar> & Pick<Guitar, 'id' | 'brand'>): Guitar => ({
  typeName: 'Strat',
  buildYear: 2020,
  priceAmount: 100000,
  priceCurrency: 'EUR',
  serialNumber: undefined,
  description: undefined,
  pictures: ['https://example.com/guitar.jpg'],
  coverPictureIndex: 0,
  ...overrides,
});

describe('<GuitarMosaicGrid />', () => {
  it('renders mosaic links for each guitar', () => {
    const guitars = [
      guitar({ id: 'one', brand: 'Fender' }),
      guitar({ id: 'two', brand: 'Gibson' }),
    ];

    render(
      <MemoryRouter>
        <GuitarMosaicGrid guitars={guitars} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Fender Strat (2020)' })).toHaveAttribute(
      'href',
      '/guitars/one',
    );
    expect(screen.getByRole('link', { name: 'Gibson Strat (2020)' })).toHaveAttribute(
      'href',
      '/guitars/two',
    );
  });
});
