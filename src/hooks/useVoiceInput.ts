import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../services/aiService';

export interface VoiceInputState {
  isListening: boolean;
  isTranscribing: boolean;
  transcript: string;
  isSupported: boolean;
  error: string | null;
}

export interface VoiceInputActions {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceInput(): VoiceInputState & VoiceInputActions {
  const isSupported = typeof window !== 'undefined'
    && (typeof window.MediaRecorder !== 'undefined' || !!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  const [isListening, setIsListening]       = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript]         = useState('');
  const [error, setError]                   = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef        = useRef<Blob[]>([]);

  // ── MediaRecorder path (preferred — uses Azure STT) ──────────────────────
  const startListening = useCallback(() => {
    if (isListening || isTranscribing) return;
    setError(null);
    setTranscript('');
    chunksRef.current = [];

    if (typeof window.MediaRecorder === 'undefined') {
      setError('माइक्रोफोन समर्थित छैन।');
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Prefer webm/opus for best browser support
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '';
        const options = mimeType ? { mimeType } : {};
        const recorder = new MediaRecorder(stream, options);

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          // Stop all tracks to release mic
          stream.getTracks().forEach((t) => t.stop());
          setIsListening(false);

          if (chunksRef.current.length === 0) return;

          const mtype = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: mtype });

          setIsTranscribing(true);
          try {
            const text = await transcribeAudio(blob);
            setTranscript(text);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Transcription failed');
          } finally {
            setIsTranscribing(false);
          }
        };

        recorder.onerror = () => {
          setError('रेकर्डिङ त्रुटि भयो।');
          setIsListening(false);
          stream.getTracks().forEach((t) => t.stop());
        };

        recorder.start(250); // collect chunks every 250ms
        mediaRecorderRef.current = recorder;
        setIsListening(true);
      })
      .catch(() => {
        setError('माइक्रोफोन अनुमति दिनुहोस्।');
      });
  }, [isListening, isTranscribing]);

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => setTranscript(''), []);

  return { isListening, isTranscribing, transcript, isSupported, error, startListening, stopListening, resetTranscript };
}

// Extend Window type for Web Speech API (kept for reference)
declare global {
  interface Window {
    SpeechRecognition: new () => unknown;
    webkitSpeechRecognition: new () => unknown;
  }
}
