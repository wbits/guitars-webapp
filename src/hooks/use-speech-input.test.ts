import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useSpeechInput } from './use-speech-input';

class MockRecognition {
  lang = '';
  continuous = false;
  interimResults = false;
  onresult: ((event: unknown) => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;
  start = vi.fn(() => {
    this.onresult?.({
      results: [
        { isFinal: true, 0: { transcript: ' red guitars ' } },
      ],
    });
    this.onend?.();
  });
  stop = vi.fn();
  abort = vi.fn();
}

describe('useSpeechInput', () => {
  afterEach(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
  });

  it('reports unsupported when SpeechRecognition is missing', () => {
    const onFinalTranscript = vi.fn();
    const { result } = renderHook(() => useSpeechInput({ onFinalTranscript }));
    expect(result.current.supported).toBe(false);
  });

  it('starts recognition and forwards final transcript', () => {
    window.SpeechRecognition = MockRecognition as never;
    const onFinalTranscript = vi.fn();
    const { result } = renderHook(() => useSpeechInput({ onFinalTranscript, lang: 'nl-NL' }));

    expect(result.current.supported).toBe(true);

    act(() => {
      result.current.toggleListening();
    });

    expect(onFinalTranscript).toHaveBeenCalledWith('red guitars');
    expect(result.current.listening).toBe(false);
  });
});
