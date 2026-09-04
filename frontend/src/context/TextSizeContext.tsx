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
    return localStorage.getItem('kc_large_text') === 'true';
  });

  useEffect(() => {
    if (isLargeText) {
      document.documentElement.classList.add('text-size-lg');
    } else {
      document.documentElement.classList.remove('text-size-lg');
    }
    localStorage.setItem('kc_large_text', String(isLargeText));
  }, [isLargeText]);

  const toggleLargeText = () => setIsLargeText((prev) => !prev);

  return (
    <TextSizeContext.Provider value={{ isLargeText, toggleLargeText }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => useContext(TextSizeContext);
