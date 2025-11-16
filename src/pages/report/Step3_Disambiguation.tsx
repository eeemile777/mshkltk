import React from 'react';
import { AppContext } from '../../contexts/AppContext';
import { ReportData, AIssue } from '../../types';
import { FaArrowLeft, FaArrowRight, FaWandMagicSparkles, FaCircleInfo, FaSquareCheck, FaSquare } from 'react-icons/fa6';

interface Step3_DisambiguationProps {
    reportData: ReportData;
    updateReportData: (updates: Partial<ReportData>) => void;
    nextStep: () => void;
    prevStep: () => void;
}

const IssueCard: React.FC<{ issue: AIssue, isSelected: boolean, onToggle: () => void, categories: any, language: string, theme: string }> = ({ issue, isSelected, onToggle, categories, language, theme }) => {
    const categoryData = issue.category ? categories[issue.category] : null;
    const subCategoryData = categoryData && issue.sub_category ? categoryData.subCategories[issue.sub_category] : null;
    const Icon = categoryData?.icon;
    const categoryColor = categoryData ? (theme === 'dark' ? categoryData.color.dark : categoryData.color.light) : '#9E9E9E';

    return (
        <button
            onClick={onToggle}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-teal dark:border-teal-dark bg-teal/5 dark:bg-teal-dark/10' : 'border-border-light dark:border-border-dark bg-muted dark:bg-surface-dark'}`}
        >
            <div className="flex items-start gap-4">
                <div className="mt-1 text-teal dark:text-teal-dark">
                    {isSelected ? <FaSquareCheck size={20} /> : <span className="text-gray-300 dark:text-gray-600"><FaSquare size={20}/></span>}
                </div>
                <div className="flex-1">
                    <p className="font-bold text-lg text-navy dark:text-text-primary-dark">{issue.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
                        {Icon && <Icon style={{ color: categoryColor }} />}
                        <span>{language === 'ar' ? categoryData?.name_ar : categoryData?.name_en}</span>
                        {subCategoryData && <span>&bull;</span>}
                        <span>{language === 'ar' ? subCategoryData?.name_ar : subCategoryData?.name_en}</span>
                    </div>
                </div>
            </div>
        </button>
    );
};

const Step3_Disambiguation: React.FC<Step3_DisambiguationProps> = ({ reportData, updateReportData, nextStep, prevStep }) => {
    const { t, language, theme, categories } = React.useContext(AppContext);
    const [locationChoice, setLocationChoice] = React.useState<'same' | 'different' | null>('same');

    const handleToggleIssue = (index: number) => {
        updateReportData({
            multiReportSelection: {
                ...reportData.multiReportSelection,
                [index]: !reportData.multiReportSelection[index],
            },
        });
    };

    const selectedCount = Object.values(reportData.multiReportSelection).filter(Boolean).length;
    const canProceed = (locationChoice === 'same' && selectedCount > 0) || (locationChoice === 'different' && selectedCount === 1);

    const BackIcon = language === 'ar' ? FaArrowRight : FaArrowLeft;
    const NextIcon = language === 'ar' ? FaArrowLeft : FaArrowRight;
    
    return (
        <div className="flex flex-col h-full w-full">
            <div className="text-center flex-shrink-0">
                <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-2 flex items-center justify-center gap-2">
                    <span className="text-teal"><FaWandMagicSparkles/></span> {t.aiFoundMultipleIssues}
                </h1>
                <p className="text-lg text-text-secondary dark:text-text-secondary-dark mb-4">{t.aiFoundMultipleIssuesDesc}</p>
            </div>
            
            <div className="flex-grow min-h-0 overflow-y-auto space-y-3 pr-2">
                {reportData.detectedIssues.map((issue, index) => (
                    <IssueCard
                        key={index}
                        issue={issue}
                        isSelected={reportData.multiReportSelection[index]}
                        onToggle={() => handleToggleIssue(index)}
                        categories={categories}
                        language={language}
                        theme={theme}
                    />
                ))}
            </div>

            <div className="flex-shrink-0 pt-6">
                <div className="p-4 bg-muted dark:bg-surface-dark rounded-xl">
                    <p className="font-bold text-navy dark:text-text-primary-dark mb-3">{t.aiLocationQuestion}</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => setLocationChoice('same')}
                            className={`p-3 font-semibold rounded-lg border-2 ${locationChoice === 'same' ? 'bg-teal/10 border-teal' : 'bg-card dark:bg-bg-dark border-transparent'}`}
                        >
                            {t.sameLocation}
                        </button>
                        <button 
                            onClick={() => setLocationChoice('different')}
                            className={`p-3 font-semibold rounded-lg border-2 ${locationChoice === 'different' ? 'bg-teal/10 border-teal' : 'bg-card dark:bg-bg-dark border-transparent'}`}
                        >
                            {t.differentLocations}
                        </button>
                    </div>
                    {locationChoice === 'different' && (
                        <div className="mt-3 p-3 bg-mango/10 text-mango-dark text-sm rounded-lg flex items-start gap-2">
                            <span className="mt-1 flex-shrink-0"><FaCircleInfo/></span>
                            <p>{selectedCount > 1 ? t.pleaseSelectOneIssue : t.differentLocationsHint}</p>
                        </div>
                    )}
                </div>

                <div className="pt-6 w-full flex items-center justify-between">
                    <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-text-secondary dark:text-text-secondary-dark bg-muted dark:bg-surface-dark rounded-full hover:bg-opacity-90">
                        <BackIcon /> {t.backStep}
                    </button>
                    <button type="button" onClick={nextStep} disabled={!canProceed} className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-white bg-teal rounded-full hover:bg-opacity-90 disabled:bg-gray-400">
                        {t.nextStep} <NextIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Step3_Disambiguation;