import React, { useEffect, useRef, useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

type VoiceState = 'idle' | 'listening' | 'processing' | 'error' | 'unsupported';

interface VoiceInputProps {
  language: string;
  onResult: (text: string) => void;
  disabled?: boolean;
  className?: string;
  externalListening?: boolean;
  onExternalListeningChange?: (active: boolean) => void;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  language,
  onResult,
  disabled = false,
  className = '',
  externalListening = false,
  onExternalListeningChange,
}) => {
  const { t } = useLanguage();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [interimText, setInterimText] = useState('');
  const [textInput, setTextInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);

  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const cleanupRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore cleanup errors
      }
      recognitionRef.current = null;
    }
    isListeningRef.current = false;
  }, []);

  const startListening = useCallback(() => {
    if (!isSpeechRecognitionSupported) {
      setVoiceState('unsupported');
      return;
    }

    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setVoiceState('unsupported');
      return;
    }

    cleanupRecognition();

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setVoiceState('listening');
      setErrorMessage(null);
      setInterimText('');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setInterimText(interimTranscript);

      if (finalTranscript) {
        onResult(finalTranscript.trim());
        isListeningRef.current = false;
        setVoiceState('idle');
        setInterimText('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      isListeningRef.current = false;
      if (event.error === 'not-allowed') {
        setErrorMessage(t('voiceAssistant.permissionDenied'));
      } else if (event.error === 'no-speech') {
        setErrorMessage(t('voiceAssistant.error'));
      } else {
        setErrorMessage(t('voiceAssistant.error'));
      }
      setVoiceState('error');
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      setInterimText('');
      if (voiceState === 'listening') {
        setVoiceState('idle');
      }
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      isListeningRef.current = false;
      setVoiceState('error');
      setErrorMessage(t('voiceAssistant.error'));
    }
  }, [isSpeechRecognitionSupported, language, onResult, t, cleanupRecognition, voiceState]);

  const triggerExternalListening = useCallback(() => {
    if (disabled) return;
    if (voiceState === 'listening' || voiceState === 'processing') return;
    if (!isSpeechRecognitionSupported) return;
    startListening();
  }, [disabled, voiceState, isSpeechRecognitionSupported, startListening]);

  useEffect(() => {
    if (externalListening) {
      triggerExternalListening();
      onExternalListeningChange?.(false);
    }
  }, [externalListening, triggerExternalListening, onExternalListeningChange]);

  const stopListening = useCallback(() => {
    cleanupRecognition();
    setVoiceState('idle');
    setInterimText('');
  }, [cleanupRecognition]);

  useEffect(() => {
    return () => {
      cleanupRecognition();
    };
  }, [cleanupRecognition]);

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      onResult(textInput.trim());
      setTextInput('');
    }
  };

  const getMicLabel = () => {
    switch (voiceState) {
      case 'listening':
        return t('voiceAssistant.listening');
      case 'processing':
        return t('voiceAssistant.processing');
      case 'error':
        return t('voiceAssistant.error');
      case 'unsupported':
        return t('voiceAssistant.unsupported');
      default:
        return t('voiceAssistant.tapToSpeak');
    }
  };

  if (!isSpeechRecognitionSupported) {
    return (
      <div className={className}>
        <p className="text-xs text-status-warning mb-2" role="alert">
          {t('voiceAssistant.unsupported')}
        </p>
        <form onSubmit={handleTextSubmit} className="flex gap-2">
          <Input
            id="voice-text-fallback"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={t('voiceAssistant.typePlaceholder')}
            disabled={disabled}
            className="flex-1"
          />
          <Button type="submit" variant="primary" disabled={disabled || !textInput.trim()}>
            {t('voiceAssistant.submit')}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-3">
        <Button
          id="voice-mic-button"
          variant={voiceState === 'listening' ? 'destructive' : 'primary'}
          size="lg"
          onClick={voiceState === 'listening' ? stopListening : startListening}
          disabled={disabled}
          aria-label={getMicLabel()}
          className={cn(
            'min-h-[48px] min-w-[48px] rounded-full',
            voiceState === 'listening' && 'animate-pulse'
          )}
          leftIcon={
            voiceState === 'listening' ? (
              <MicOff className="w-5 h-5" />
            ) : voiceState === 'processing' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mic className="w-5 h-5" />
            )
          }
        >
          {getMicLabel()}
        </Button>

        {interimText && (
          <p className="text-xs text-text-muted italic" aria-live="polite">
            {interimText}
          </p>
        )}

        {errorMessage && (
          <p className="text-xs text-status-error" role="alert">
            {errorMessage}
          </p>
        )}
      </div>

      <form onSubmit={handleTextSubmit} className="mt-3 flex gap-2">
        <Input
          id="voice-text-input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={t('voiceAssistant.typePlaceholder')}
          disabled={disabled}
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={disabled || !textInput.trim()}>
          {t('voiceAssistant.submit')}
        </Button>
      </form>
    </div>
  );
};
