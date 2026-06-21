export type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

export type SpeechRecognitionEventLike = {
  results: SpeechRecognitionResultListLike;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: {
    isFinal: boolean;
    [index: number]: { transcript: string };
  };
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null =>
  window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;

export const isSpeechRecognitionSupported = (): boolean =>
  getSpeechRecognitionConstructor() !== null;

export const readTranscript = (event: SpeechRecognitionEventLike): { finalText: string; interimText: string } => {
  let finalText = '';
  let interimText = '';
  for (let i = 0; i < event.results.length; i += 1) {
    const result = event.results[i];
    const chunk = result[0]?.transcript ?? '';
    if (result.isFinal) {
      finalText += chunk;
    } else {
      interimText += chunk;
    }
  }
  return {
    finalText: finalText.trim(),
    interimText: interimText.trim(),
  };
};

export const speechRecognitionErrorMessage = (code: string): string => {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access was blocked. Allow microphone permission in your browser settings.';
    case 'no-speech':
      return 'No speech detected. Try again.';
    case 'audio-capture':
      return 'No microphone was found.';
    case 'network':
      return 'Speech recognition needs a network connection.';
    default:
      return 'Speech recognition failed. Try typing instead.';
  }
};
