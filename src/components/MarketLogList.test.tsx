import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { MarketLog } from '@/domain/marketLog';
import { MARKET_LOG_PAGE_SIZE, MarketLogList } from './MarketLogList';

const log = (index: number): MarketLog => ({
  id: `log-${index}`,
  guitarId: 'guitar-1',
  observedAt: `2024-01-${String((index % 28) + 1).padStart(2, '0')}T12:00:00.000Z`,
  source: 'reverb',
  action: 'for_sale',
  priceAmount: 100000 + index,
  priceCurrency: 'EUR',
});

describe('<MarketLogList />', () => {
  it('shows the first page and loads more on demand', async () => {
    const user = userEvent.setup();
    const logs = Array.from({ length: 45 }, (_, index) => log(index));

    render(<MarketLogList logs={logs} />);

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(MARKET_LOG_PAGE_SIZE + 1);
    expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
    expect(screen.getByText(`Showing ${MARKET_LOG_PAGE_SIZE} of 45`)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show more' }));

    expect(within(table).getAllByRole('row')).toHaveLength(41);
    expect(screen.getByText('Showing 40 of 45')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show more' }));

    expect(within(table).getAllByRole('row')).toHaveLength(46);
    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
    expect(screen.getByText('Showing all 45 observations')).toBeInTheDocument();
  });

  it('renders listing thumbnails when present', () => {
    const logs: MarketLog[] = [
      {
        ...log(0),
        listingImageUrl: 'https://cdn.example/images/market-logs/thumb.jpg',
        listingUrl: 'https://reverb.com/item/1',
      },
    ];

    render(<MarketLogList logs={logs} />);

    const images = document.querySelectorAll('img[src="https://cdn.example/images/market-logs/thumb.jpg"]');
    expect(images).toHaveLength(2);
  });

  it('does not show pagination controls for short lists', () => {
    render(<MarketLogList logs={Array.from({ length: 5 }, (_, index) => log(index))} />);

    const table = screen.getByRole('table');
    expect(within(table).getAllByRole('row')).toHaveLength(6);
    expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Showing/i)).not.toBeInTheDocument();
  });
});
