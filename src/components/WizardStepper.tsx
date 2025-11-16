import React from 'react';
import { FaCheck } from 'react-icons/fa6';
import { AppContext } from '../contexts/AppContext';

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, totalSteps, stepNames }) => {
    const { language } = React.useContext(AppContext);
    
    return (
        <div className="w-full px-4 sm:px-8 mb-8">
            <div className="relative flex items-center justify-between">
                <div className="absolute left-0 top-1/2 w-full h-0.5 bg-border-light dark:bg-border-dark" />
                <div 
                    className={`absolute top-1/2 h-0.5 bg-teal dark:bg-teal-dark transition-all duration-500 ${language === 'ar' ? 'right-0' : 'left-0'}`}
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />
                
                {stepNames.map((name, index) => {
                    const stepNumber = index + 1;
                    const isCompleted = stepNumber < currentStep;
                    const isCurrent = stepNumber === currentStep;

                    return (
                        <div key={stepNumber} className="relative z-10 flex flex-col items-center">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                transition-all duration-300
                                ${isCompleted ? 'bg-teal dark:bg-teal-dark text-white' : ''}
                                ${isCurrent ? 'bg-teal dark:bg-teal-dark text-white ring-4 ring-sand dark:ring-bg-dark' : ''}
                                ${!isCompleted && !isCurrent ? 'bg-card dark:bg-surface-dark border-2 border-border-light dark:border-border-dark text-text-secondary dark:text-text-secondary-dark' : ''}
                            `}>
                                {isCompleted ? <FaCheck /> : stepNumber}
                            </div>
                            <span className={`
                                absolute top-full mt-2 text-xs font-semibold text-center w-14 sm:w-20
                                ${isCurrent ? 'text-navy dark:text-text-primary-dark' : 'text-text-secondary dark:text-text-secondary-dark'}
                            `}>{name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WizardStepper;