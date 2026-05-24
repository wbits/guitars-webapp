import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { PictureGallery } from './PictureGallery';

describe('<PictureGallery />', () => {
  const pictures = [
    'https://example.com/a.jpg',
    'https://example.com/b.jpg',
    'https://example.com/c.jpg',
  ];

  it('opens preview and navigates with arrow buttons', async () => {
    const user = userEvent.setup();
    render(<PictureGallery pictures={pictures} />);

    await user.click(screen.getByRole('button', { name: 'Preview picture 2' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByAltText('Preview 2 of 3')).toHaveAttribute('src', pictures[1]);

    await user.click(screen.getByRole('button', { name: 'Next picture' }));
    expect(screen.getByAltText('Preview 3 of 3')).toHaveAttribute('src', pictures[2]);

    await user.click(screen.getByRole('button', { name: 'Previous picture' }));
    expect(screen.getByAltText('Preview 2 of 3')).toHaveAttribute('src', pictures[1]);
  });

  it('wraps from last to first and first to last', async () => {
    const user = userEvent.setup();
    render(<PictureGallery pictures={pictures} />);

    await user.click(screen.getByRole('button', { name: 'Preview picture 1' }));
    await user.click(screen.getByRole('button', { name: 'Previous picture' }));
    expect(screen.getByAltText('Preview 3 of 3')).toHaveAttribute('src', pictures[2]);

    await user.click(screen.getByRole('button', { name: 'Next picture' }));
    expect(screen.getByAltText('Preview 1 of 3')).toHaveAttribute('src', pictures[0]);
  });

  it('does not show navigation when only one picture', async () => {
    const user = userEvent.setup();
    render(<PictureGallery pictures={[pictures[0]]} />);

    await user.click(screen.getByRole('button', { name: 'Preview picture 1' }));

    expect(screen.queryByRole('button', { name: 'Next picture' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous picture' })).not.toBeInTheDocument();
  });

  it('navigates with horizontal swipe gestures', async () => {
    const user = userEvent.setup();
    render(<PictureGallery pictures={pictures} />);

    await user.click(screen.getByRole('button', { name: 'Preview picture 2' }));

    const preview = screen.getByAltText('Preview 2 of 3');

    fireEvent.touchStart(preview, { changedTouches: [{ clientX: 220, clientY: 120 }] });
    fireEvent.touchEnd(preview, { changedTouches: [{ clientX: 100, clientY: 125 }] });
    expect(screen.getByAltText('Preview 3 of 3')).toHaveAttribute('src', pictures[2]);

    const previewAfterNext = screen.getByAltText('Preview 3 of 3');
    fireEvent.touchStart(previewAfterNext, { changedTouches: [{ clientX: 100, clientY: 120 }] });
    fireEvent.touchEnd(previewAfterNext, { changedTouches: [{ clientX: 220, clientY: 125 }] });
    expect(screen.getByAltText('Preview 2 of 3')).toHaveAttribute('src', pictures[1]);
  });
});
