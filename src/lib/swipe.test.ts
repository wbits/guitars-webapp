import { describe, expect, it } from 'vitest';
import { getHorizontalSwipeDirection } from './swipe';

describe('getHorizontalSwipeDirection', () => {
  it('returns left for a horizontal swipe to the left', () => {
    expect(getHorizontalSwipeDirection({ x: 220, y: 120 }, { x: 100, y: 125 })).toBe('left');
  });

  it('returns right for a horizontal swipe to the right', () => {
    expect(getHorizontalSwipeDirection({ x: 100, y: 120 }, { x: 220, y: 125 })).toBe('right');
  });

  it('returns null when movement is too small or mostly vertical', () => {
    expect(getHorizontalSwipeDirection({ x: 100, y: 100 }, { x: 130, y: 100 })).toBeNull();
    expect(getHorizontalSwipeDirection({ x: 100, y: 100 }, { x: 180, y: 200 })).toBeNull();
  });
});
