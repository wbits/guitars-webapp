import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
  readTranscript,
  speechRecognitionErrorMessage,
  type SpeechRecognitionLike,
} from '@/lib/speech-recognition';

type UseSpeechInputOptions = {
  onFinalTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  lang?: string;
};

export const useSpeechInput = ({
  onFinalTranscript,
  onInterimTranscript,
  lang,
}: UseSpeechInputOptions) => {
  const supported = isSpeechRecognitionSupported();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinalTranscript);
  const onInterimRef = useRef(onInterimTranscript);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  onFinalRef.current = onFinalTranscript;
  onInterimRef.current = onInterimTranscript;

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      setError('Speech input is not supported in this browser.');
      return;
    }

    setError(null);
    recognitionRef.current?.abort();

    const recognition = new Ctor();
    recognition.lang = lang ?? navigator.language ?? 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const { finalText, interimText } = readTranscript(event);
      if (interimText) {
        onInterimRef.current?.(interimText);
      }
      if (finalText) {
        onFinalRef.current(finalText);
      }
    };

    recognition.onerror = (event) => {
      setError(speechRecognitionErrorMessage(event.error));
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, [lang]);

  const toggleListening = useCallback(() => {
    if (listening) {
      stopListening();
      return;
    }
    startListening();
  }, [listening, startListening, stopListening]);

  useEffect(
    () => () => {
      recognitionRef.current?.abort();
    },
    [],
  );

  return {
    supported,
    listening,
    error,
    toggleListening,
    stopListening,
    clearError: () => setError(null),
  };
};
