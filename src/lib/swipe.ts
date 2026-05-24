export const SWIPE_THRESHOLD_PX = 50;

export type SwipeDirection = 'left' | 'right';

export const getHorizontalSwipeDirection = (
  start: { x: number; y: number },
  end: { x: number; y: number },
  threshold = SWIPE_THRESHOLD_PX,
): SwipeDirection | null => {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  if (Math.abs(deltaX) < threshold || Math.abs(deltaX) <= Math.abs(deltaY)) {
    return null;
  }

  return deltaX < 0 ? 'left' : 'right';
};
