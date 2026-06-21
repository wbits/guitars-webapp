import { describe, expect, it } from 'vitest';
import { readTranscript, speechRecognitionErrorMessage } from './speech-recognition';

describe('speech-recognition helpers', () => {
  it('reads final and interim transcript chunks', () => {
    const event = {
      results: [
        { isFinal: false, 0: { transcript: 'show ' } },
        { isFinal: true, 0: { transcript: 'red guitars' } },
      ],
    };

    expect(readTranscript(event)).toEqual({
      finalText: 'red guitars',
      interimText: 'show',
    });
  });

  it('maps permission errors to friendly text', () => {
    expect(speechRecognitionErrorMessage('not-allowed')).toMatch(/Microphone access/i);
  });
});
