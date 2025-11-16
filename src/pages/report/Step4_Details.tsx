import React from 'react';
import { AppContext } from '../../contexts/AppContext';
import { ReportData, ReportCategory, Theme, ReportSeverity, AIssue } from '../../types';
import { FaSpinner, FaCheck, FaWandMagicSparkles, FaArrowLeft, FaArrowRight, FaPhotoFilm, FaMicrophone, FaStop, FaCircleInfo, FaChevronDown, FaPen } from 'react-icons/fa6';
import CategorySelectionModal from '../../components/CategorySelectionModal';
import AiRejectionNotice from './AiRejectionNotice';
import Lightbox from '../../components/Lightbox';

interface Step4DetailsProps {
    reportData: ReportData;
    updateReportData: (updates: Partial<ReportData>) => void;
    onSubmit: () => void;
    prevStep: () => void;
    setWizardStep: (step: number | ((prevStep: number) => number)) => void;
    isSubmitting: boolean;
    isAiLoading: boolean;
    isRecording: boolean;
    isTranscribing: boolean;
    startRecording: () => void;
    stopRecording: () => void;
    visualizerData: Uint8Array | null;
}

const AudioVisualizer: React.FC<{ data: Uint8Array }> = ({ data }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);
        
        const barWidth = 3;
        const spacing = 2;
        const numBars = Math.floor(width / (barWidth + spacing));
        const step = Math.floor(data.length / numBars);
        
        ctx.fillStyle = '#00BFA6'; // Teal color for waves

        for (let i = 0; i < numBars; i++) {
            const dataIndex = i * step;
            const barHeight = Math.max(2, (data[dataIndex] / 255) * height * 0.8);
            const x = i * (barWidth + spacing);
            ctx.fillRect(x, (height - barHeight) / 2, barWidth, barHeight);
        }
    }, [data]);

    return <canvas ref={canvasRef} width="300" height="60" className="w-full h-16"/>;
};


const IssueEditorCard: React.FC<{
    issue: AIssue;
    issueIndex: number; // The original index in detectedIssues
    isOpen: boolean;
    onToggle: () => void;
    onUpdate: (index: number, updates: Partial<AIssue>) => void;
    categories: any;
    language: string;
    theme: string;
}> = ({ issue, issueIndex, isOpen, onToggle, onUpdate, categories, language, theme }) => {
    const { t } = React.useContext(AppContext);
    const categoryData = issue.category ? categories[issue.category] : null;
    const Icon = categoryData?.icon;
    const categoryColor = categoryData ? (theme === 'dark' ? categoryData.color.dark : categoryData.color.light) : '#9E9E9E';

    return (
        <div className="bg-muted dark:bg-surface-dark rounded-xl overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left"
            >
                <div className="flex items-center gap-3">
                    {Icon && <span className="w-6 h-6"><Icon style={{ color: categoryColor }} /></span>}
                    <span className="font-bold text-navy dark:text-text-primary-dark truncate">{issue.title}</span>
                </div>
                <span className={`transition-transform duration-200 inline-block ${isOpen ? 'rotate-180' : ''}`}><FaChevronDown /></span>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-border-light dark:border-border-dark space-y-3 animate-fade-in">
                    <div>
                        <label className="text-sm font-bold">{t.title}</label>
                        <input
                            value={issue.title}
                            onChange={e => onUpdate(issueIndex, { title: e.target.value })}
                            className="w-full p-2 bg-card dark:bg-bg-dark rounded-md border border-border-light dark:border-border-dark"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold">{t.description}</label>
                        <textarea
                            value={issue.description}
                            onChange={e => onUpdate(issueIndex, { description: e.target.value })}
                            rows={3}
                            className="w-full p-2 bg-card dark:bg-bg-dark rounded-md border border-border-light dark:border-border-dark"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};


const Step4Details: React.FC<Step4DetailsProps> = ({ reportData, updateReportData, onSubmit, prevStep, setWizardStep, isSubmitting, isAiLoading, isRecording, isTranscribing, startRecording, stopRecording, visualizerData }) => {
    const { t, language, theme, categories } = React.useContext(AppContext);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
    const [openIssueIndex, setOpenIssueIndex] = React.useState<number | null>(0);

    const issuesToSubmit = reportData.detectedIssues.length > 0
        ? reportData.detectedIssues.filter((_, index) => reportData.multiReportSelection[index])
        : [];
    
    const isMultiReport = issuesToSubmit.length > 1;

    const canSubmit = !isSubmitting && !isTranscribing && !isAiLoading && (
        isMultiReport
            ? issuesToSubmit.every(i => i.title && i.description && i.category && i.sub_category && i.severity)
            : (reportData.title.trim() && reportData.description.trim() && reportData.category && reportData.sub_category && reportData.severity)
    );
    
    const BackIcon = language === 'ar' ? FaArrowRight : FaArrowLeft;

    const handleCategorySelect = (category: ReportCategory, subCategoryKey: string) => {
        if (isMultiReport && openIssueIndex !== null) {
            const issueIndex = reportData.detectedIssues.findIndex(i => i === issuesToSubmit[openIssueIndex]);
            handleIssueUpdate(issueIndex, { category, sub_category: subCategoryKey });
        } else {
            updateReportData({ category, sub_category: subCategoryKey });
        }
    };
    
    const handleIssueUpdate = (originalIndex: number, updates: Partial<AIssue>) => {
        const newDetectedIssues = [...reportData.detectedIssues];
        newDetectedIssues[originalIndex] = { ...newDetectedIssues[originalIndex], ...updates };
        updateReportData({ detectedIssues: newDetectedIssues });
    };

    const getCategoryDisplay = (issue?: AIssue) => {
        const cat = issue?.category || reportData.category;
        const subCatKey = issue?.sub_category || reportData.sub_category;

        if (!cat || !subCatKey || !categories[cat]) {
            return { Icon: FaCircleInfo, parentName: t.selectCategory, subName: t.tapToChoose, color: theme === Theme.DARK ? '#B0B8C1' : '#4B5B67' };
        }
        const parentCat = categories[cat];
        const subCat = parentCat.subCategories[subCatKey];
        if (!subCat) return { Icon: parentCat.icon, parentName: language === 'ar' ? parentCat.name_ar : parentCat.name_en, subName: t.select, color: theme === 'dark' ? parentCat.color.dark : parentCat.color.light };

        return { Icon: parentCat.icon, parentName: language === 'ar' ? parentCat.name_ar : parentCat.name_en, subName: language === 'ar' ? subCat.name_ar : subCat.name_en, color: theme === 'dark' ? parentCat.color.dark : parentCat.color.light };
    };
    
    const SeveritySelector: React.FC<{ issue?: AIssue, issueIndex?: number }> = ({ issue, issueIndex }) => {
        const [isOpen, setIsOpen] = React.useState(false);
        const wrapperRef = React.useRef<HTMLDivElement>(null);
        const severity = issue?.severity || reportData.severity;
        const severities = [{ level: ReportSeverity.High, text: '!!!', label: 'High' }, { level: ReportSeverity.Medium, text: '!!', label: 'Medium' }, { level: ReportSeverity.Low, text: '!', label: 'Low' }];
        const currentSeverity = severities.find(s => s.level === severity) || { level: null, text: '?', label: t.select };

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => { if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false); };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }, []);

        const handleSelect = (level: ReportSeverity) => {
            if (isMultiReport && issueIndex !== undefined) {
                handleIssueUpdate(issueIndex, { severity: level });
            } else {
                updateReportData({ severity: level });
            }
            setIsOpen(false);
        };
        
        return <div ref={wrapperRef} className="relative h-full"><button type="button" onClick={() => setIsOpen(p => !p)} className="w-full h-full bg-muted dark:bg-surface-dark p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-gray-200 dark:hover:bg-border-dark transition-colors"><span className={`font-black text-coral dark:text-coral-dark ${currentSeverity.level ? 'text-3xl' : 'text-2xl'}`}>{currentSeverity.text}</span><label className="block text-sm font-bold text-navy dark:text-text-primary-dark mt-1">{currentSeverity.level ? t.severity : t.select}</label></button>{isOpen && <div className="absolute top-full mt-2 bg-card dark:bg-surface-dark shadow-xl rounded-2xl p-2 z-10 w-48 border border-border-light dark:border-border-dark">{severities.map(({ level, text, label }) => <button key={level} type="button" onClick={() => handleSelect(level)} className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${severity === level ? 'bg-coral/10' : 'hover:bg-muted'}`}><span className={`text-2xl font-bold ${severity === level ? 'text-coral' : 'text-secondary'}`}>{text}</span><span className={`text-sm font-semibold ${severity === level ? 'text-coral' : 'text-secondary'}`}>{label}</span></button>)}</div>}</div>;
    };
    
    const validPreviews = reportData.previews.filter(p => p.status === 'valid');
    const hasMedia = validPreviews.length > 0;
    
    const { Icon: CategoryIcon, parentName, subName, color: categoryColor } = getCategoryDisplay();

    return (
        <div className="flex flex-col h-full w-full">
            {isCategoryModalOpen && <CategorySelectionModal onClose={() => setIsCategoryModalOpen(false)} onSelect={handleCategorySelect} currentCategory={isMultiReport && openIssueIndex !== null ? issuesToSubmit[openIssueIndex].category : reportData.category} currentSubCategory={isMultiReport && openIssueIndex !== null ? issuesToSubmit[openIssueIndex].sub_category : reportData.sub_category}/>}
            {isLightboxOpen && <Lightbox mediaUrls={validPreviews.map(p => p.url)} startIndex={0} onClose={() => setIsLightboxOpen(false)}/>}
            <AiRejectionNotice reportData={reportData} onGoBack={() => setWizardStep(2)} />
            <div className="flex-shrink-0 text-center"><h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-4">{t.stepDetails}</h1></div>
            <div className="flex-grow min-h-0 overflow-y-auto pb-4 pr-1"><div className="space-y-4 text-start">
                {hasMedia && <button type="button" onClick={() => setIsLightboxOpen(true)} className="relative w-full h-32 bg-muted dark:bg-surface-dark rounded-2xl overflow-hidden flex items-center p-4 text-left group">{validPreviews.slice(0, 3).reverse().map((preview, index) => <div key={preview.url} className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-105" style={{transform: `translateX(${index * 8}px) scale(${1 - index * 0.05})`, zIndex: 10 - index,}}>{preview.type === 'video' ? <video src={preview.url} className="w-full h-full object-cover" muted loop playsInline autoPlay /> : <img src={preview.url} alt="" className="w-full h-full object-cover" />}</div>)}<div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition-colors"></div>{validPreviews.length > 3 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-16 h-16 bg-black/50 rounded-full border-2 border-white/50 text-white text-2xl font-bold">+{validPreviews.length - 3}</div>}<div className="relative flex items-center gap-4 text-white z-20"><div className="p-3 bg-white/20 rounded-full"><FaPhotoFilm size={24} /></div><div><h3 className="font-bold text-lg">{validPreviews.length > 1 ? t.photoPlural : t.photoSingular}</h3><p className="text-sm opacity-80">{t.mediaReadyForSubmission.replace('{count}', String(validPreviews.length))}</p></div></div></button>}
                {isMultiReport ? (
                    <div className="space-y-3">
                        {issuesToSubmit.map((issue, index) => {
                            const originalIndex = reportData.detectedIssues.findIndex(i => i === issue);
                            return <IssueEditorCard key={index} issue={issue} issueIndex={originalIndex} isOpen={openIssueIndex === index} onToggle={() => setOpenIssueIndex(openIssueIndex === index ? null : index)} onUpdate={handleIssueUpdate} categories={categories} language={language} theme={theme} />;
                        })}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1"><SeveritySelector /></div>
                            <div className="col-span-2">
                                <button onClick={() => setIsCategoryModalOpen(true)} className="w-full h-full bg-muted dark:bg-surface-dark p-4 rounded-2xl flex items-center justify-between gap-4 text-left hover:bg-gray-200 dark:hover:bg-border-dark transition-colors">
                                    <div className="flex items-center gap-4"><div className="p-3 rounded-full" style={{ backgroundColor: `${categoryColor}20` }}><CategoryIcon className="w-6 h-6" style={{ color: categoryColor }} /></div><div><h3 className="font-bold text-lg text-navy dark:text-text-primary-dark">{parentName}</h3><p className="text-sm text-text-secondary dark:text-text-secondary-dark">{subName}</p></div></div>
                                </button>
                            </div>
                        </div>
                        <div className={`p-4 rounded-2xl space-y-4 ${isAiLoading ? 'bg-sky/5' : 'bg-muted dark:bg-surface-dark'}`}>
                            <p className="text-xs font-bold text-sky dark:text-cyan-dark flex items-center gap-2">{isAiLoading ? <span className="animate-spin"><FaSpinner/></span> : (hasMedia ? <FaWandMagicSparkles /> : <FaPen />)} {isAiLoading ? t.aiAnalyzing : (hasMedia ? t.aiGeneratedContent : t.describeIssueManually)}</p>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <button 
                                        type="button" 
                                        onClick={isRecording ? stopRecording : startRecording} 
                                        disabled={isTranscribing} 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface-dark ${isRecording ? 'bg-red-500 text-white animate-pulse focus:ring-red-400' : 'bg-red-100 dark:bg-red-900/50 text-red-500 focus:ring-red-400'}`}
                                        aria-label={isRecording ? t.stop : (isTranscribing ? t.transcribing : t.record)}
                                    >
                                        {isTranscribing ? <span className="animate-spin"><FaSpinner/></span> : (isRecording ? <FaStop size={16} /> : <FaMicrophone size={16} />)}
                                    </button>
                                    <label htmlFor="title" className="block text-lg font-bold text-navy dark:text-text-primary-dark">{t.title}</label>
                                </div>
                                <input id="title" value={reportData.title} onChange={e => updateReportData({ title: e.target.value })} required placeholder={isAiLoading ? t.aiTitlePlaceholder : t.titlePlaceholder} className="mt-1 block w-full p-3 shadow-sm sm:text-sm border-border-light dark:border-border-dark bg-card dark:bg-surface-dark rounded-xl focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark disabled:opacity-70" disabled={isTranscribing || isAiLoading}/>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-lg font-bold text-navy dark:text-text-primary-dark mb-2">{t.description}</label>
                                {isRecording && visualizerData ? (
                                    <div className="mt-1 flex items-center justify-center w-full p-3 h-[118px] shadow-sm sm:text-sm border-border-light dark:border-border-dark bg-card dark:bg-surface-dark rounded-xl">
                                        <AudioVisualizer data={visualizerData} />
                                    </div>
                                ) : (
                                    <textarea id="description" value={reportData.description} onChange={e => updateReportData({ description: e.target.value })} rows={4} maxLength={500} required placeholder={isAiLoading ? t.aiDescriptionPlaceholder : (isTranscribing ? t.aiTranscriptionPlaceholder : t.describeProblem)} className="mt-1 block w-full p-3 shadow-sm sm:text-sm border-border-light dark:border-border-dark bg-card dark:bg-surface-dark rounded-xl focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark disabled:opacity-70" disabled={isTranscribing || isAiLoading}></textarea>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div></div>
             <div className="flex-shrink-0 pt-4 w-full flex items-center justify-between">
                <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-text-secondary dark:text-text-secondary-dark bg-muted dark:bg-surface-dark rounded-full hover:bg-opacity-90"><BackIcon />{t.backStep}</button>
                <button type="button" onClick={onSubmit} disabled={!canSubmit} className="flex items-center justify-center gap-2 w-36 px-6 py-3 text-lg font-bold text-white bg-teal rounded-full hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed">{isSubmitting ? <span className="animate-spin"><FaSpinner/></span> : <><FaCheck /> {t.submit}</>}</button>
            </div>
        </div>
    );
};

export default Step4Details;