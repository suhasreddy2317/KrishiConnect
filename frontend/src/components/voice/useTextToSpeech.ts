import { useCallback, useEffect, useState } from 'react';

const LANG_VOICE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
  te: 'te-IN',
};

const findVoice = (voices: SpeechSynthesisVoice[], langCode: string): SpeechSynthesisVoice | undefined => {
  const targetLang = LANG_VOICE_MAP[langCode] || 'en-IN';
  return (
    voices.find((v) => v.lang === targetLang) ||
    voices.find((v) => v.lang.startsWith(targetLang.split('-')[0]))
  );
};

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [canSpeak, setCanSpeak] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setCanSpeak(false);
      return;
    }

    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      setVoices(v);
      setCanSpeak(v.length > 0);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  const hasVoiceFor = useCallback(
    (langCode: string) => {
      return voices.length > 0 && findVoice(voices, langCode) !== undefined;
    },
    [voices]
  );

  const speak = useCallback(
    (text: string, langCode: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }

      if (!canSpeak) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = findVoice(voices, langCode);
      const targetLang = LANG_VOICE_MAP[langCode] || 'en-IN';

      if (voice) {
        utterance.voice = voice;
      }
      utterance.lang = targetLang;
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [voices, canSpeak]
  );

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking, canSpeak, hasVoiceFor };
};
