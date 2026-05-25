import { describe, expect, it } from 'vitest';
import { hasDisplayValue } from './guitar-display';

describe('hasDisplayValue', () => {
  it('returns false for empty or whitespace values', () => {
    expect(hasDisplayValue()).toBe(false);
    expect(hasDisplayValue('')).toBe(false);
    expect(hasDisplayValue('   ')).toBe(false);
  });

  it('returns true when a trimmed value is present', () => {
    expect(hasDisplayValue(' Sunburst ')).toBe(true);
  });
});
