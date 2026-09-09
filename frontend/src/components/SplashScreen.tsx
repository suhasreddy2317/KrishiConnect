import React, { useState, useEffect } from 'react';

export const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeStart = 1800;
    const fadeDuration = 400;
    const totalDuration = fadeStart + fadeDuration + 50;

    const fadeTimer = setTimeout(() => {
      setVisible(false);
    }, totalDuration);

    return () => clearTimeout(fadeTimer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F0FDF4]"
      style={{
        animation: 'splashFadeOut 0.4s ease-out 1.8s forwards',
        pointerEvents: 'none',
      }}
    >
      <img
        src="/KC.jpeg"
        alt="KrishiConnect"
        className="max-w-[80vw] max-h-[60vh] object-contain"
        draggable={false}
      />
      <style>{`
        @keyframes splashFadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
