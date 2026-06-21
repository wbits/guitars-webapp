import { describe, expect, it } from 'vitest';
import type { Guitar } from '@/domain/guitar';
import { canTriggerGuitarAnalysis, showGuitarAnalysisPanel } from './guitar-analysis-ui';

const baseGuitar: Guitar = {
  id: 'g1',
  brand: 'Fender',
  typeName: 'Strat',
  buildYear: 1996,
  priceAmount: 100000,
  priceCurrency: 'EUR',
  pictures: ['https://example.com/a.jpg'],
  coverPictureIndex: 0,
};

const me = {
  assistantByokConfigured: true,
  assistantByokNeedsResave: false,
};

describe('guitar-analysis-ui', () => {
  it('shows analyze for owner with cover and no analysis', () => {
    expect(canTriggerGuitarAnalysis(baseGuitar, true, me)).toBe(true);
    expect(showGuitarAnalysisPanel(baseGuitar, true, me)).toBe(true);
  });

  it('shows retry when analysis failed', () => {
    const guitar = {
      ...baseGuitar,
      analysis: { status: 'failed' as const, failureReason: 'quota exceeded' },
    };
    expect(canTriggerGuitarAnalysis(guitar, true, me)).toBe(true);
    expect(showGuitarAnalysisPanel(guitar, true, me)).toBe(true);
  });

  it('hides analyze when pending or ready', () => {
    const pending = { ...baseGuitar, analysis: { status: 'pending' as const } };
    const ready = {
      ...baseGuitar,
      analysis: { status: 'ready' as const, visualSummary: 'Sunburst', tags: ['sunburst'] },
    };
    expect(canTriggerGuitarAnalysis(pending, true, me)).toBe(false);
    expect(canTriggerGuitarAnalysis(ready, true, me)).toBe(false);
    expect(showGuitarAnalysisPanel(ready, false, me)).toBe(true);
  });
});
