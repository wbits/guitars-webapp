import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSwipeNavigation } from './use-swipe-navigation';

describe('useSwipeNavigation', () => {
  it('calls navigation handlers for horizontal swipes when enabled', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    const { result } = renderHook(() =>
      useSwipeNavigation({ enabled: true, onSwipeLeft, onSwipeRight }),
    );

    const target = document.createElement('div');
    document.body.appendChild(target);

    result.current.onTouchStart({
      target,
      touches: [{ clientX: 220, clientY: 120 }],
    } as unknown as React.TouchEvent);
    result.current.onTouchEnd({
      changedTouches: [{ clientX: 100, clientY: 125 }],
    } as unknown as React.TouchEvent);
    expect(onSwipeLeft).toHaveBeenCalledTimes(1);
    expect(onSwipeRight).not.toHaveBeenCalled();

    result.current.onTouchStart({
      target,
      touches: [{ clientX: 100, clientY: 120 }],
    } as unknown as React.TouchEvent);
    result.current.onTouchEnd({
      changedTouches: [{ clientX: 220, clientY: 125 }],
    } as unknown as React.TouchEvent);
    expect(onSwipeRight).toHaveBeenCalledTimes(1);

    target.remove();
  });

  it('ignores swipes when disabled or starting on interactive elements', () => {
    const onSwipeLeft = vi.fn();
    const { result } = renderHook(() =>
      useSwipeNavigation({ enabled: false, onSwipeLeft }),
    );

    const target = document.createElement('div');
    document.body.appendChild(target);

    result.current.onTouchStart({
      target,
      touches: [{ clientX: 220, clientY: 120 }],
    } as unknown as React.TouchEvent);
    result.current.onTouchEnd({
      changedTouches: [{ clientX: 100, clientY: 125 }],
    } as unknown as React.TouchEvent);
    expect(onSwipeLeft).not.toHaveBeenCalled();

    const button = document.createElement('button');
    target.appendChild(button);
    result.current.onTouchStart({
      target: button,
      touches: [{ clientX: 220, clientY: 120 }],
    } as unknown as React.TouchEvent);
    result.current.onTouchEnd({
      changedTouches: [{ clientX: 100, clientY: 125 }],
    } as unknown as React.TouchEvent);
    expect(onSwipeLeft).not.toHaveBeenCalled();

    target.remove();
  });
});
