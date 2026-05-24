import { useCallback, useRef } from 'react';
import { getHorizontalSwipeDirection } from '@/lib/swipe';

const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, label, [role="dialog"]';

const isInteractiveTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest(INTERACTIVE_SELECTOR));
};

interface UseSwipeNavigationOptions {
  enabled: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const useSwipeNavigation = ({
  enabled,
  onSwipeLeft,
  onSwipeRight,
}: UseSwipeNavigationOptions) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled || isInteractiveTarget(event.target)) {
        touchStart.current = null;
        return;
      }

      const touch = event.touches[0];
      if (!touch) {
        return;
      }

      touchStart.current = { x: touch.clientX, y: touch.clientY };
    },
    [enabled],
  );

  const onTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!enabled || touchStart.current === null) {
        return;
      }

      const touch = event.changedTouches[0];
      const start = touchStart.current;
      touchStart.current = null;

      if (!touch) {
        return;
      }

      const direction = getHorizontalSwipeDirection(start, {
        x: touch.clientX,
        y: touch.clientY,
      });

      if (direction === 'left') {
        onSwipeLeft?.();
      } else if (direction === 'right') {
        onSwipeRight?.();
      }
    },
    [enabled, onSwipeLeft, onSwipeRight],
  );

  return { onTouchStart, onTouchEnd };
};
