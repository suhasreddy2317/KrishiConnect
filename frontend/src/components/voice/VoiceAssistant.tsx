import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LanguageSelector } from '@/components/voice/LanguageSelector';
import { VoiceInput } from '@/components/voice/VoiceInput';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useTextToSpeech } from '@/components/voice/useTextToSpeech';
import { processVoiceQuery, VoiceContext, type VoiceResponse, INTENT_ACTION_MAP, type VoiceIntent } from '@/lib/voiceService';
import { useAuth } from '@/context/AuthContext';

export interface VoiceAssistantHandle {
  startListening: () => void;
}

export interface VoiceAssistantProps {
  onAction?: (intent: VoiceIntent, actionHint: string | null) => void;
}

export const VoiceAssistant = forwardRef<VoiceAssistantHandle, VoiceAssistantProps>(
  ({ onAction }, ref) => {
    const { language, t } = useLanguage();
    const { token } = useAuth();
    const [recognizedText, setRecognizedText] = useState('');
    const [response, setResponse] = useState<VoiceResponse | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const { speak, stop, isSpeaking, canSpeak } = useTextToSpeech();

    const [isListeningActive, setIsListeningActive] = useState(false);

    const voiceContext: VoiceContext = {
      token: token ?? null,
      lots: [],
      language,
      crops: [],
    };

    const handleVoiceResult = useCallback((text: string) => {
      setRecognizedText(text);
      setResponse(null);
      setErrorMessage(null);
      stop();
      setIsListeningActive(false);
    }, [stop]);

    const handleSubmit = useCallback(async () => {
      if (!recognizedText.trim()) return;
      if (!token) {
        setErrorMessage('Please log in to use the voice assistant.');
        return;
      }
      setIsProcessing(true);
      setResponse(null);
      setErrorMessage(null);
      try {
        const result = await processVoiceQuery(recognizedText, voiceContext);
        setResponse(result);
        onAction?.(result.intent, result.action_hint);
        if (result.data && (result.data as { error?: string }).error) {
          setErrorMessage(null);
        }
      } catch {
        setErrorMessage('Something went wrong. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }, [recognizedText, voiceContext, token, onAction]);

    const handleListen = useCallback(() => {
      if (!response) return;
      if (isSpeaking) {
        stop();
      } else {
        speak(response.text, language);
      }
    }, [response, language, speak, stop, isSpeaking]);

    const handleClear = useCallback(() => {
      setRecognizedText('');
      setResponse(null);
      setErrorMessage(null);
      stop();
      setIsListeningActive(false);
    }, [stop]);

    const startListening = useCallback(() => {
      setRecognizedText('');
      setResponse(null);
      setErrorMessage(null);
      stop();
      setIsListeningActive(true);
    }, [stop]);

    useImperativeHandle(ref, () => ({
      startListening,
    }), [startListening]);

    return (
      <Card
        variant="raised"
        title={t('voiceAssistant.title')}
        subtitle={t('voiceAssistant.description')}
        className="mb-6"
      >
        <div className="space-y-4">
          <LanguageSelector />

          <VoiceInput
            language={language}
            onResult={handleVoiceResult}
            disabled={isProcessing}
            externalListening={isListeningActive}
            onExternalListeningChange={setIsListeningActive}
          />

          {recognizedText && !response && (
            <div className="p-3 rounded-lg bg-surface-raised border border-border space-y-2">
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                {t('voiceAssistant.recognizedText')}
              </p>
              <p className="text-sm text-text-main">{recognizedText}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  {isProcessing ? t('voiceAssistant.processing') : t('voiceAssistant.submit')}
                </Button>
                <Button size="sm" variant="ghost" onClick={handleClear}>
                  {t('voiceAssistant.clear')}
                </Button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {t('voiceAssistant.processing')}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/30">
              <p className="text-xs text-status-warning" role="alert">{errorMessage}</p>
            </div>
          )}

          {response && (
            <div className="p-3 rounded-lg bg-accent-soft border border-accent/30 space-y-2">
              <p className="text-xs font-medium text-accent uppercase tracking-wider">
                {t('voiceAssistant.response')}
              </p>
              {(() => {
                const lines = response.text.split('\n').filter((l) => l.trim());
                const mainLine = lines[0] || '';
                const supportLines = lines.slice(1, 4);
                return (
                  <>
                    <p className="text-sm font-semibold text-text-main">{mainLine}</p>
                    {supportLines.length > 0 && (
                      <ul className="space-y-0.5 pl-3">
                        {supportLines.map((line, i) => (
                          <li key={i} className="text-xs text-text-muted list-disc">{line.trim()}</li>
                        ))}
                      </ul>
                    )}
                  </>
                );
              })()}
              {response.action_hint && (() => {
                const action = INTENT_ACTION_MAP[response.intent];
                if (action?.label && onAction) {
                  return (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onAction(response.intent, response.action_hint)}
                    >
                      {action.label}
                    </Button>
                  );
                }
                return (
                  <p className="text-xs text-text-muted italic">
                    Tip: {response.action_hint}
                  </p>
                );
              })()}
              {canSpeak && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleListen}
                  leftIcon={isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                >
                  {isSpeaking ? t('voiceAssistant.stopListening') : t('voiceAssistant.listen')}
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    );
  }
);

VoiceAssistant.displayName = 'VoiceAssistant';
