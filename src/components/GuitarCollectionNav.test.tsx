import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Guitar } from '@/domain/guitar';
import { GuitarCollectionNav } from './GuitarCollectionNav';

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

describe('<GuitarCollectionNav />', () => {
  it('renders previous and next links with guitar captions', () => {
    const previous = guitar({ id: 'prev', brand: 'Fender', typeName: 'Tele', buildYear: 1968 });
    const next = guitar({ id: 'next', brand: 'Gibson', typeName: 'Les Paul', buildYear: 1959 });

    render(
      <MemoryRouter>
        <GuitarCollectionNav previous={previous} next={next} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: /Previous/i })).toHaveAttribute('href', '/guitars/prev');
    expect(screen.getByRole('link', { name: /Next/i })).toHaveAttribute('href', '/guitars/next');
    expect(screen.getByText('Fender Tele (1968)')).toBeInTheDocument();
    expect(screen.getByText('Gibson Les Paul (1959)')).toBeInTheDocument();
  });

  it('renders nothing when there are no neighbors', () => {
    const { container } = render(
      <MemoryRouter>
        <GuitarCollectionNav previous={null} next={null} />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
