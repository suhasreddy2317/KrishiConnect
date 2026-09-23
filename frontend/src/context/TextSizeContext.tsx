import React, { createContext, useContext, useEffect, useState } from 'react';

interface TextSizeContextType {
  isLargeText: boolean;
  toggleLargeText: () => void;
}

const TextSizeContext = createContext<TextSizeContextType>({
  isLargeText: false,
  toggleLargeText: () => {},
});

export const TextSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLargeText, setIsLargeText] = useState<boolean>(() => {
    try {
      const sessionVal = sessionStorage.getItem('kc_large_text');
      if (sessionVal !== null) {
        return sessionVal === 'true';
      }
      return localStorage.getItem('kc_large_text') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isLargeText) {
      document.documentElement.classList.add('text-size-lg');
    } else {
      document.documentElement.classList.remove('text-size-lg');
    }
    try {
      sessionStorage.setItem('kc_large_text', String(isLargeText));
      localStorage.setItem('kc_large_text', String(isLargeText));
    } catch {
      // Storage unavailable or disabled
    }
  }, [isLargeText]);

  const toggleLargeText = () => setIsLargeText((prev) => !prev);

  return (
    <TextSizeContext.Provider value={{ isLargeText, toggleLargeText }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => useContext(TextSizeContext);
