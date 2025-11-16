import React from 'react';
import { AppContext } from '../contexts/AppContext';
import { FaCamera, FaWandMagicSparkles, FaMapLocationDot, FaCheck, FaSitemap, FaPen, FaXmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { CATEGORIES } from '../constants';

interface TutorialModalProps {
  type: 'with' | 'without';
  isOpen: boolean;
  onClose: () => void;
}

const TutorialStepCard: React.FC<{ icon: React.ReactNode; title: string; description: string; step: number; total: number }> = ({ icon, title, description, step, total }) => {
    const { t } = React.useContext(AppContext);
    return (
        <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="w-20 h-20 bg-muted dark:bg-bg-dark rounded-full flex items-center justify-center text-teal dark:text-teal-dark mb-4">
                {icon}
            </div>
            <div className="text-xs font-bold text-text-secondary dark:text-text-secondary-dark mb-2">
                {t.tutorialStep.replace('{step}', `${step}/${total}`)}
            </div>
            <h4 className="font-bold text-xl text-navy dark:text-text-primary-dark mb-2">{title}</h4>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{description}</p>
        </div>
    );
};


const TutorialModal: React.FC<TutorialModalProps> = ({ type, isOpen, onClose }) => {
    const { t, language } = React.useContext(AppContext);
    const [isClosing, setIsClosing] = React.useState(false);
    const [currentStepIndex, setCurrentStepIndex] = React.useState(0);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setCurrentStepIndex(0); // Reset for next time
        }, 300); // Match animation duration
    };

    const steps = {
        with: [
            { icon: <FaCamera size={32} />, title: t.tutorialWithMediaStep1Title, description: t.tutorialWithMediaStep1Desc },
            { icon: <FaWandMagicSparkles size={32} />, title: t.tutorialWithMediaStep2Title, description: t.tutorialWithMediaStep2Desc },
            { icon: <FaMapLocationDot size={32} />, title: t.tutorialWithMediaStep3Title, description: t.tutorialWithMediaStep3Desc },
            { icon: <FaCheck size={32} />, title: t.tutorialWithMediaStep4Title, description: t.tutorialWithMediaStep4Desc },
        ],
        without: [
            { icon: <FaSitemap size={32} />, title: t.tutorialWithoutMediaStep1Title, description: t.tutorialWithoutMediaStep1Desc },
            { icon: <FaMapLocationDot size={32} />, title: t.tutorialWithoutMediaStep2Title, description: t.tutorialWithoutMediaStep2Desc },
            { icon: <FaPen size={32} />, title: t.tutorialWithoutMediaStep3Title, description: t.tutorialWithoutMediaStep3Desc },
            { icon: <FaCheck size={32} />, title: t.tutorialWithoutMediaStep4Title, description: t.tutorialWithoutMediaStep4Desc },
        ]
    };

    const currentSteps = steps[type];
    const totalSteps = currentSteps.length;
    const currentStepData = currentSteps[currentStepIndex];
    const isLastStep = currentStepIndex === totalSteps - 1;

    const title = type === 'with' ? t.tutorialTitleWithMedia : t.tutorialTitleWithoutMedia;
    
    const nextStep = () => setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps - 1));
    const prevStep = () => setCurrentStepIndex(prev => Math.max(prev - 1, 0));

    const handleMainAction = () => {
        if (isLastStep) {
            handleClose();
        } else {
            nextStep();
        }
    };

    const PrevIcon = language === 'ar' ? FaChevronRight : FaChevronLeft;
    const NextIcon = language === 'ar' ? FaChevronLeft : FaChevronRight;

    if (!isOpen) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
            onClick={handleClose}
        >
            <div 
                className={`bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-sm m-4 flex flex-col relative transition-transform duration-300 ${isClosing ? 'scale-95' : 'scale-100'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button onClick={handleClose} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark">
                    <FaXmark size={20} />
                </button>
                <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-6 text-center">{title}</h2>
                
                <div className="flex-grow flex items-center justify-center min-h-[250px]">
                   {currentStepData && (
                       <TutorialStepCard 
                           key={currentStepIndex} // Re-trigger animation on change
                           {...currentStepData} 
                           step={currentStepIndex + 1}
                           total={totalSteps}
                       />
                   )}
                </div>

                <div className="flex items-center justify-between mt-6">
                    <button 
                        onClick={prevStep}
                        className={`p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-muted dark:hover:bg-bg-dark transition-opacity ${currentStepIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <PrevIcon size={20} />
                    </button>
                    <div className="flex gap-2">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                             <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentStepIndex ? 'bg-teal' : 'bg-gray-300 dark:bg-gray-600'}`} />
                        ))}
                    </div>
                     <button 
                        onClick={nextStep}
                        className={`p-2 rounded-full text-text-secondary dark:text-text-secondary-dark hover:bg-muted dark:hover:bg-bg-dark transition-opacity ${isLastStep ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <NextIcon size={20} />
                    </button>
                </div>
                
                <button 
                    onClick={handleMainAction}
                    className="mt-6 w-full bg-teal text-white font-bold py-3 rounded-full hover:bg-opacity-90 transition-transform hover:scale-105"
                >
                    {isLastStep ? t.okGotIt : t.next}
                </button>
            </div>
        </div>
    );
};

export default TutorialModal;