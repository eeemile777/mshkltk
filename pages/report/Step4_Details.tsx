import * as React from 'react';
import { AppContext } from '../../contexts/AppContext';
// FIX: `ReportData` is now imported from `../../types` to break a circular dependency.
import { ReportData, ReportCategory, Theme, ReportSeverity } from '../../types';
import { FaSpinner, FaCheck, FaWandMagicSparkles, FaArrowLeft, FaArrowRight, FaPhotoFilm, FaMicrophone, FaStop, FaCircleInfo, FaChevronRight, FaPen } from 'react-icons/fa6';
import CategorySelectionModal from '../../components/CategorySelectionModal';

interface Step4DetailsProps {
    reportData: ReportData;
    updateReportData: (updates: Partial<ReportData>) => void;
    onSubmit: () => void;
    prevStep: () => void;
    isSubmitting: boolean;
    isAiLoading: boolean;
    isRecording: boolean;
    isTranscribing: boolean;
    startRecording: () => void;
    stopRecording: () => void;
}

const Step4Details: React.FC<Step4DetailsProps> = ({ reportData, updateReportData, onSubmit, prevStep, isSubmitting, isAiLoading, isRecording, isTranscribing, startRecording, stopRecording }) => {
    const { t, language, theme, categories } = React.useContext(AppContext);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);

    const canSubmit = !isSubmitting && !isTranscribing && !isAiLoading && reportData.title.trim() && reportData.description.trim() && reportData.category && reportData.sub_category && reportData.severity;
    
    const BackIcon = language === 'ar' ? FaArrowRight : FaArrowLeft;

    const handleCategorySelect = (category: ReportCategory, subCategoryKey: string) => {
        updateReportData({ category, sub_category: subCategoryKey });
    };

    const getCategoryDisplay = () => {
        if (!reportData.category || !reportData.sub_category || !categories[reportData.category]) {
            return {
                Icon: FaCircleInfo,
                parentName: t.selectCategory,
                subName: "Tap to choose",
                color: theme === Theme.DARK ? '#B0B8C1' : '#4B5B67'
            };
        }
        const parentCat = categories[reportData.category];
        const subCat = parentCat.subCategories[reportData.sub_category];
        
        // Handle case where subcategory might be invalid after a config change
        if (!subCat) {
             return {
                Icon: parentCat.icon,
                parentName: language === 'ar' ? parentCat.name_ar : parentCat.name_en,
                subName: "Select sub-category",
                color: theme === 'dark' ? parentCat.color.dark : parentCat.color.light
            };
        }

        return {
            Icon: parentCat.icon,
            parentName: language === 'ar' ? parentCat.name_ar : parentCat.name_en,
            subName: language === 'ar' ? subCat.name_ar : subCat.name_en,
            color: theme === 'dark' ? parentCat.color.dark : parentCat.color.light
        };
    };
    
    const SeveritySelector = () => {
      const [isOpen, setIsOpen] = React.useState(false);
      const wrapperRef = React.useRef<HTMLDivElement>(null);

      const severities = [
        { level: ReportSeverity.High, text: '!!!', label: 'High' },
        { level: ReportSeverity.Medium, text: '!!', label: 'Medium' },
        { level: ReportSeverity.Low, text: '!', label: 'Low' },
      ];
      
      const currentSeverity = severities.find(s => s.level === reportData.severity) || { level: null, text: '?', label: 'Select' };

      React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsOpen(false);
          }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

      const handleSelect = (level: ReportSeverity) => {
        updateReportData({ severity: level });
        setIsOpen(false);
      };
      
      return (
        <div ref={wrapperRef} className="relative h-full">
            <button 
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full h-full bg-muted dark:bg-surface-dark p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-gray-200 dark:hover:bg-border-dark transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className={`font-black text-coral dark:text-coral-dark ${currentSeverity.level ? 'text-3xl' : 'text-2xl'}`}>{currentSeverity.text}</span>
                <label className="block text-sm font-bold text-navy dark:text-text-primary-dark mt-1">
                    {currentSeverity.level ? t.severity : 'Select'}
                </label>
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 bg-card dark:bg-surface-dark shadow-xl rounded-2xl p-2 z-10 w-48 border border-border-light dark:border-border-dark">
                   {severities.map(({ level, text, label }) => {
                       const isSelected = reportData.severity === level;
                       return (
                           <button
                               key={level}
                               type="button"
                               onClick={() => handleSelect(level)}
                               className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                                   isSelected ? 'bg-coral/10 dark:bg-coral-dark/10' : 'hover:bg-muted dark:hover:bg-bg-dark'
                               }`}
                           >
                               <span className={`text-2xl font-bold ${isSelected ? 'text-coral dark:text-coral-dark' : 'text-text-secondary dark:text-text-secondary-dark'}`}>{text}</span>
                               <span className={`text-sm font-semibold ${isSelected ? 'text-coral dark:text-coral-dark' : 'text-text-secondary dark:text-text-secondary-dark'}`}>{label}</span>
                           </button>
                       )
                   })}
                </div>
            )}
        </div>
      );
    };

    const { Icon: CategoryIcon, parentName, subName, color: categoryColor } = getCategoryDisplay();
    const validPreviews = reportData.previews.filter(p => p.status === 'valid');
    const hasMedia = validPreviews.length > 0;

    return (
        <div className="flex flex-col h-full w-full">
            {isCategoryModalOpen && (
                <CategorySelectionModal
                    onClose={() => setIsCategoryModalOpen(false)}
                    onSelect={handleCategorySelect}
                    currentCategory={reportData.category}
                    currentSubCategory={reportData.sub_category}
                />
            )}
            <div className="flex-shrink-0 text-center">
                 <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-4">{t.stepDetails}</h1>
            </div>
            
            <div className="flex-grow min-h-0 overflow-y-auto pb-4 pr-1">
                 <div className="space-y-4 text-start">
                    
                    {/* Photos Preview Banner */}
                    {hasMedia && (
                        <div className="relative w-full h-32 bg-muted dark:bg-surface-dark rounded-2xl overflow-hidden flex items-center p-4">
                            {validPreviews[0]?.type === 'video' ? (
                                <video src={validPreviews[0]?.url} className="absolute inset-0 w-full h-full object-cover" muted loop playsInline autoPlay />
                            ) : (
                                <img src={validPreviews[0]?.url} className="absolute inset-0 w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-black/50"></div>
                            <div className="relative flex items-center gap-4 text-white">
                                <div className="p-3 bg-white/20 rounded-full">
                                    <FaPhotoFilm size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{`${t.stepPhoto}s/${t.stepPhoto}s`} {validPreviews.length}</h3>
                                    <p className="text-sm opacity-80">Ready for submission</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Category & Severity Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1">
                            <SeveritySelector />
                        </div>
                        <div className="col-span-2">
                            <button onClick={() => setIsCategoryModalOpen(true)} className="w-full h-full bg-muted dark:bg-surface-dark p-4 rounded-2xl flex items-center justify-between gap-4 text-left hover:bg-gray-200 dark:hover:bg-border-dark transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-full" style={{ backgroundColor: `${categoryColor}20` }}>
                                        <CategoryIcon className="w-6 h-6" style={{ color: categoryColor }} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-navy dark:text-text-primary-dark">{parentName}</h3>
                                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{subName}</p>
                                    </div>
                                </div>
                                <FaChevronRight className="text-text-secondary dark:text-text-secondary-dark" />
                            </button>
                        </div>
                    </div>
                    
                    <div className={`p-4 rounded-2xl space-y-4 ${isAiLoading ? 'bg-sky/5 dark:bg-cyan-dark/10' : 'bg-muted dark:bg-surface-dark'}`}>
                         <p className="text-xs font-bold text-sky dark:text-cyan-dark flex items-center gap-2">
                            {isAiLoading ? <FaSpinner className="animate-spin"/> : (hasMedia ? <FaWandMagicSparkles /> : <FaPen />)} 
                            {isAiLoading ? t.aiAnalyzing : (hasMedia ? t.aiGeneratedContent : t.describeIssueManually)}
                        </p>
                        <div>
                            <label htmlFor="title" className="block text-lg font-bold text-navy dark:text-text-primary-dark mb-2">{t.title}</label>
                            <input id="title" value={reportData.title} onChange={e => updateReportData({ title: e.target.value })} required placeholder={isAiLoading ? t.aiTitlePlaceholder : t.titlePlaceholder}
                                className="mt-1 block w-full p-3 shadow-sm sm:text-sm border-border-light dark:border-border-dark bg-card dark:bg-surface-dark rounded-xl focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark disabled:opacity-70"
                                disabled={isTranscribing || isAiLoading}
                            />
                        </div>
                        <div>
                           <label htmlFor="description" className="block text-lg font-bold text-navy dark:text-text-primary-dark mb-2">{t.description}</label>
                            <textarea id="description" value={reportData.description} onChange={e => updateReportData({ description: e.target.value })} rows={4} maxLength={500} required placeholder={isAiLoading ? t.aiDescriptionPlaceholder : t.describeProblem}
                                className="mt-1 block w-full p-3 shadow-sm sm:text-sm border-border-light dark:border-border-dark bg-card dark:bg-surface-dark rounded-xl focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark disabled:opacity-70"
                                disabled={isTranscribing || isAiLoading}
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-center pt-4 pb-4">
                        <button
                            type="button"
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={isTranscribing}
                            className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4
                                ${isRecording ? 'bg-coral/20 dark:bg-coral-dark/20 focus:ring-coral/50' : 'bg-card dark:bg-surface-dark shadow-lg focus:ring-teal/50'}
                                ${isTranscribing ? 'bg-muted dark:bg-bg-dark cursor-not-allowed' : 'hover:scale-105'}
                            `}
                            aria-label={isRecording ? t.stop : (isTranscribing ? t.transcribing : t.record)}
                        >
                            {isTranscribing ? (
                                <FaSpinner className="animate-spin w-8 h-8 text-teal dark:text-teal-dark" />
                            ) : isRecording ? (
                                <div className="w-8 h-8 bg-coral rounded-md animate-pulse"></div>
                            ) : (
                                <FaMicrophone className="w-8 h-8 text-coral dark:text-coral-dark" />
                            )}
                            <span className="absolute -bottom-5 text-xs font-semibold text-text-secondary dark:text-text-secondary-dark">
                                {isTranscribing ? t.transcribing : (isRecording ? t.stop : t.record)}
                            </span>
                        </button>
                    </div>
                 </div>
            </div>

             <div className="flex-shrink-0 pt-4 w-full flex items-center justify-between">
                <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-text-secondary dark:text-text-secondary-dark bg-muted dark:bg-surface-dark rounded-full hover:bg-opacity-90"
                >
                    <BackIcon />
                    {t.backStep}
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!canSubmit}
                    className="flex items-center justify-center gap-2 w-36 px-6 py-3 text-lg font-bold text-white bg-teal rounded-full hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <><FaCheck /> {t.submit}</>}
                </button>
            </div>
        </div>
    );
};

export default Step4Details;