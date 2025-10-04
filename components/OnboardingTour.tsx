import * as React from 'react';
import { AppContext } from '../contexts/AppContext';

interface OnboardingTourProps {
  onFinish: () => void;
  onSkip: () => void;
}

interface TooltipPosition {
    top?: string | number;
    bottom?: string | number;
    left?: string | number;
    right?: string | number;
    transform?: string;
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onFinish, onSkip }) => {
  const { t } = React.useContext(AppContext);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [targetRect, setTargetRect] = React.useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState<TooltipPosition>({});
  const [spotlightStyle, setSpotlightStyle] = React.useState({});

  const tourSteps = React.useMemo(() => [
    {
      title: t.tourStep1Title,
      text: t.tourStep1Text,
      selector: null,
      position: 'center',
    },
    {
      title: t.tourStep7Title,
      text: t.tourStep7Text,
      selector: '[data-tour-id="new-report"]',
      position: 'top-center',
    },
    {
      title: t.tourStep2Title,
      text: t.tourStep2Text,
      selector: '[data-tour-id="search"]',
      position: 'bottom-center',
    },
    {
      title: t.tourStep3Title,
      text: t.tourStep3Text,
      selector: '[data-tour-id="notifications"]',
      position: 'bottom-right',
    },
    {
      title: t.tourStep4Title,
      text: t.tourStep4Text,
      selector: '[data-tour-id="profile"]',
      position: 'bottom-right',
    },
    {
      title: t.tourStep5Title,
      text: t.tourStep5Text,
      selector: '[data-tour-id="filters"]',
      position: 'bottom-right',
    },
    {
      title: t.tourStep6Title,
      text: t.tourStep6Text,
      selector: '[data-tour-id="trending"]',
      position: 'top-left',
    },
  ], [t]);

  const updateTarget = React.useCallback(() => {
    const step = tourSteps[currentStep];
    if (!step.selector) {
        setTargetRect(null);
        return;
    }
    
    const element = document.querySelector(step.selector) as HTMLElement;
    if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
    }
  }, [currentStep, tourSteps]);

  React.useEffect(() => {
    // A small delay to allow the UI to settle before the first measurement
    const timer = setTimeout(updateTarget, 100);
    window.addEventListener('resize', updateTarget);
    window.addEventListener('scroll', updateTarget, true);
    
    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateTarget);
        window.removeEventListener('scroll', updateTarget, true);
    };
  }, [updateTarget]);

  React.useEffect(() => {
      const step = tourSteps[currentStep];
      const tooltipWidth = 320; // From Tailwind's w-80 class
      const viewportMargin = 16; // 1rem padding from screen edge

      if (!targetRect || !step.selector) {
          // Style for the centered welcome message (no spotlight)
          setSpotlightStyle({
              position: 'fixed',
              left: '50%',
              top: '50%',
              width: 0,
              height: 0,
              boxShadow: '0 0 0 9999px rgba(18, 18, 18, 0.7)',
              borderRadius: '50%',
              transition: 'all 0.3s ease-in-out',
          });

          setTooltipPosition({
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
          });
          return;
      }
      
      const padding = 10;
      setSpotlightStyle({
          position: 'fixed',
          left: targetRect.left - padding,
          top: targetRect.top - padding,
          width: targetRect.width + padding * 2,
          height: targetRect.height + padding * 2,
          boxShadow: '0 0 0 9999px rgba(18, 18, 18, 0.7)',
          borderRadius: '1.5rem', // A generous radius works for most elements
          transition: 'all 0.3s ease-in-out',
      });
      
      const pos: TooltipPosition = {};
      const tooltipOffset = 15;
      let idealLeft = 0;

      switch(step.position) {
          case 'top-center':
              pos.bottom = window.innerHeight - targetRect.top + tooltipOffset;
              idealLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
              break;
          case 'top-right':
              pos.bottom = window.innerHeight - targetRect.top + tooltipOffset;
              idealLeft = targetRect.right - tooltipWidth;
              break;
          case 'top-left':
              pos.bottom = window.innerHeight - targetRect.top + tooltipOffset;
              idealLeft = targetRect.left;
              break;
          case 'bottom-center':
              pos.top = targetRect.bottom + tooltipOffset;
              idealLeft = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
              break;
          case 'bottom-right':
              pos.top = targetRect.bottom + tooltipOffset;
              idealLeft = targetRect.right - tooltipWidth;
              break;
          case 'bottom-left':
              pos.top = targetRect.bottom + tooltipOffset;
              idealLeft = targetRect.left;
              break;
          default: // center
               pos.top = '50%';
               idealLeft = window.innerWidth / 2 - tooltipWidth / 2;
               break;
      }

      // Clamp the horizontal position to ensure it stays within the viewport
      let finalLeft = idealLeft;
      if (finalLeft < viewportMargin) {
        finalLeft = viewportMargin;
      } else if (finalLeft + tooltipWidth > window.innerWidth - viewportMargin) {
        finalLeft = window.innerWidth - tooltipWidth - viewportMargin;
      }

      pos.left = finalLeft;
      // We are calculating left directly, so no transform is needed for positioning.
      pos.transform = '';

      setTooltipPosition(pos);

  }, [targetRect, currentStep, tourSteps]);

  const handleNext = () => currentStep < tourSteps.length - 1 ? setCurrentStep(currentStep + 1) : onFinish();
  const handlePrev = () => currentStep > 0 && setCurrentStep(currentStep - 1);
  
  const step = tourSteps[currentStep];
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[1000]" aria-live="polite">
        <div style={spotlightStyle} className="pointer-events-none"></div>

        <div
            style={tooltipPosition}
            className="absolute w-80 max-w-[90vw] bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-2xl transition-all duration-300 ease-in-out"
            role="dialog" aria-labelledby="tour-title"
        >
            <h3 id="tour-title" className="text-xl font-bold text-teal dark:text-teal-dark mb-2">{step.title}</h3>
            <p className="text-text-secondary dark:text-text-secondary-dark">{step.text}</p>
            
            <div className="flex justify-between items-center mt-6">
                <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
                    {currentStep + 1} / {tourSteps.length}
                </div>
                <div className="flex gap-2">
                    {!isFirstStep && (
                        <button onClick={handlePrev} className="px-4 py-2 text-sm font-semibold rounded-full bg-muted dark:bg-bg-dark text-text-secondary dark:text-text-secondary-dark">
                            {t.previous}
                        </button>
                    )}
                    <button onClick={handleNext} className="px-4 py-2 text-sm font-semibold rounded-full bg-teal text-white">
                        {currentStep === tourSteps.length - 1 ? t.finish : t.next}
                    </button>
                </div>
            </div>
            
            <button onClick={onSkip} className="absolute -top-3 -right-3 text-sm font-semibold text-white bg-coral rounded-full px-3 py-1">
                {t.skip}
            </button>
        </div>
    </div>
  );
};

export default OnboardingTour;