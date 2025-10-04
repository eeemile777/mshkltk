

import * as React from 'react';
import confetti from 'canvas-confetti';
import { AppContext } from '../contexts/AppContext';
import { Badge } from '../types';
import { BADGES } from '../constants';
import { FaXmark } from 'react-icons/fa6';

interface AchievementToastProps {
  badgeId: string;
  onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ badgeId, onClose }) => {
  const { t, language } = React.useContext(AppContext);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const toastRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const badge = BADGES[badgeId];

  // Animation and auto-close
  React.useEffect(() => {
    // Animate in
    const inTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto close after 6 seconds
    const outTimer = setTimeout(() => {
      handleClose();
    }, 6000);

    return () => {
        clearTimeout(inTimer);
        clearTimeout(outTimer);
    };
  }, []);

  // Confetti effect, tied to visibility
  React.useEffect(() => {
    const canvasElement = canvasRef.current;
    
    if (!isVisible || !canvasElement) {
      return;
    }

    const fireConfetti = () => {
      // Dimensions are now guaranteed to be > 0 by the caller.
      canvasElement.width = canvasElement.clientWidth;
      canvasElement.height = canvasElement.clientHeight;

      try {
        const myConfetti = confetti.create(canvasElement, {
          resize: true,
          useWorker: true,
        });

        myConfetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.7 },
          shapes: ['star'] as confetti.Shape[],
          colors: ['#FFA62B', '#FF5A5F', '#00BFA6', '#4BA3C3'],
        });
      } catch (error) {
        console.error("Confetti failed to execute:", error);
      }
    };

    const tryFiringWithRetry = (retriesLeft = 5) => {
      // Use rAF to ensure we check dimensions after the browser has painted.
      requestAnimationFrame(() => {
        if (!canvasElement) return;

        if (canvasElement.clientWidth > 0 && canvasElement.clientHeight > 0) {
          fireConfetti();
        } else if (retriesLeft > 0) {
          // If dimensions are not ready, wait a bit and try again.
          setTimeout(() => tryFiringWithRetry(retriesLeft - 1), 100);
        } else {
          console.warn("Confetti skipped: Canvas element has zero dimensions after transition and retries.");
        }
      });
    };

    // Wait for the CSS transition to finish before attempting to fire confetti.
    const confettiTimer = setTimeout(tryFiringWithRetry, 550); // 500ms transition + 50ms buffer

    return () => {
      clearTimeout(confettiTimer);
    };
  }, [isVisible]);


  const handleClose = () => {
    setIsVisible(false);
    // Allow animation to finish before calling parent onClose
    setTimeout(onClose, 300);
  };

  if (!badge) return null;

  const positionClasses = language === 'ar' ? 'left-4' : 'right-4';
  const transformClasses = isVisible
    ? 'translate-x-0 opacity-100'
    : language === 'ar'
    ? '-translate-x-full opacity-0'
    : 'translate-x-full opacity-0';

  return (
    <div
      ref={toastRef}
      className={`fixed top-20 ${positionClasses} w-full max-w-sm bg-card dark:bg-surface-dark rounded-2xl shadow-2xl p-4 z-[1000] transition-all duration-500 ease-in-out transform ${transformClasses} flex items-start gap-4 overflow-hidden`}
      role="alert"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      <div className="text-5xl flex-shrink-0 z-10">{badge.icon}</div>
      <div className="flex-grow z-10">
        <h3 className="font-bold text-lg text-mango dark:text-mango-dark">{t.achievements}</h3>
        <p className="font-semibold text-navy dark:text-text-primary-dark">
          {language === 'ar' ? badge.name_ar : badge.name_en}
        </p>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
          {language === 'ar' ? badge.description_ar : badge.description_en}
        </p>
      </div>
      <button onClick={handleClose} className="flex-shrink-0 text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-white z-10">
        <FaXmark />
      </button>
    </div>
  );
};

export default AchievementToast;