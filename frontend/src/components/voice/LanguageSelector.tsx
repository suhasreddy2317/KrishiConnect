import React from 'react';
import { Select } from '@/components/ui/Select';
import { useLanguage } from '@/i18n/LanguageContext';
import { languages } from '@/i18n';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Select
      id="voice-language-selector"
      label={t('common.selectLanguage')}
      options={languages.map((lang) => ({
        value: lang.code,
        label: lang.nativeName,
      }))}
      value={language}
      onChange={(e) => setLanguage(e.target.value as typeof language)}
      className="w-full"
    />
  );
};
