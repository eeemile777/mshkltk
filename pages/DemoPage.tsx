import * as React from 'react';
import { FaCamera, FaWandMagicSparkles, FaSpinner, FaMapLocationDot, FaCheck, FaPen } from 'react-icons/fa6';
import { AppContext } from '../contexts/AppContext';
import { ReportCategory, ReportSeverity } from '../types';
import { CATEGORIES } from '../constants';
import { Link } from 'react-router-dom';

const DEMO_IMAGE_URL = 'https://storage.googleapis.com/maker-suite-guides/mshkltk-demo-img/demo-trash-image.jpg';

const MOCK_AI_RESPONSE_EN = {
    title: "Overflowing Garbage Bins",
    description: "I noticed a large accumulation of garbage on the street. The dumpsters are completely full and overflowing onto the sidewalk, creating a health hazard.",
    category: 'waste_environment' as ReportCategory,
    sub_category: 'garbage_accumulation',
    severity: 'high' as ReportSeverity,
};

const MOCK_AI_RESPONSE_AR = {
    title: "حاويات قمامة فائضة",
    description: "لاحظت تراكمًا كبيرًا للقمامة في الشارع. الحاويات ممتلئة تمامًا وتفيض على الرصيف، مما يشكل خطرًا على الصحة العامة.",
    category: 'waste_environment' as ReportCategory,
    sub_category: 'garbage_accumulation',
    severity: 'high' as ReportSeverity,
};

const DemoPage: React.FC = () => {
    const { t, language } = React.useContext(AppContext);
    const [step, setStep] = React.useState(0);
    const [aiData, setAiData] = React.useState(MOCK_AI_RESPONSE_EN);
    const [isAiLoading, setIsAiLoading] = React.useState(false);
    
    React.useEffect(() => {
        setAiData(language === 'ar' ? MOCK_AI_RESPONSE_AR : MOCK_AI_RESPONSE_EN);
    }, [language]);

    const handleSimulateCapture = () => {
        setStep(1);
        setIsAiLoading(true);
        setTimeout(() => {
            setIsAiLoading(false);
            setStep(2);
        }, 2500); // Simulate network and AI processing time
    };

    const CategoryDisplay = () => {
        const catData = CATEGORIES[aiData.category];
        const subCatData = catData.subCategories[aiData.sub_category];
        const Icon = catData.icon;
        return (
            <div className="flex items-center gap-3">
                <Icon className="w-6 h-6 text-teal dark:text-teal-dark" />
                <div>
                    <p className="font-bold text-navy dark:text-text-primary-dark">{language === 'ar' ? catData.name_ar : catData.name_en}</p>
                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{language === 'ar' ? subCatData.name_ar : subCatData.name_en}</p>
                </div>
            </div>
        )
    }

    const SeverityDisplay = () => {
        const severityMap = { high: '!!!', medium: '!!', low: '!' };
        return <span className="font-black text-2xl text-coral dark:text-coral-dark">{severityMap[aiData.severity]}</span>
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-sand dark:bg-bg-dark p-4">
            <div className="w-full max-w-lg mx-auto bg-card dark:bg-surface-dark rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6">
                    <div className="text-center mb-4">
                        <Link to="/" className="text-2xl font-bold text-teal dark:text-teal-dark font-display">Mshkltk Demo</Link>
                        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Live Demo Golden Path</p>
                    </div>

                    {/* Step 0: Initial State */}
                    {step === 0 && (
                        <div className="text-center animate-fade-in">
                            <img src={DEMO_IMAGE_URL} alt="Overflowing garbage bins" className="w-full rounded-xl mb-4 shadow-md"/>
                            <p className="text-text-secondary dark:text-text-secondary-dark mb-4">This is the photo a citizen wants to report.</p>
                            <button onClick={handleSimulateCapture} className="w-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-bold text-white bg-teal rounded-full shadow-lg hover:bg-opacity-90">
                                <FaCamera /> Simulate Photo Capture
                            </button>
                        </div>
                    )}
                    
                    {/* Step 1 & 2: Loading and Details */}
                    {step > 0 && (
                         <div className="animate-fade-in">
                            <img src={DEMO_IMAGE_URL} alt="Overflowing garbage bins" className="w-full h-48 object-cover rounded-xl mb-4 shadow-md"/>
                            
                            <div className={`p-4 rounded-2xl space-y-4 ${isAiLoading ? 'bg-sky/5 dark:bg-cyan-dark/10' : 'bg-muted dark:bg-surface-dark'}`}>
                                <p className="text-xs font-bold text-sky dark:text-cyan-dark flex items-center gap-2">
                                    {isAiLoading ? <FaSpinner className="animate-spin"/> : <FaWandMagicSparkles />} 
                                    {isAiLoading ? 'AI is analyzing...' : 'AI Generated Content (Editable)'}
                                </p>
                                
                                {isAiLoading ? (
                                    <div className="space-y-4">
                                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse"></div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-1">Title</label>
                                            <input value={aiData.title} onChange={e => setAiData({...aiData, title: e.target.value})} className="w-full p-2 bg-card dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg"/>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-1">Description</label>
                                            <textarea value={aiData.description} onChange={e => setAiData({...aiData, description: e.target.value})} rows={3} className="w-full p-2 bg-card dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg"/>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-1">Category</label>
                                                <CategoryDisplay />
                                            </div>
                                             <div>
                                                <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-1">Severity</label>
                                                <SeverityDisplay />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-4 rounded-2xl bg-muted dark:bg-surface-dark mt-4">
                                 <p className="text-xs font-bold text-sky dark:text-cyan-dark flex items-center gap-2 mb-2">
                                    <FaMapLocationDot /> Location Data (Auto-detected)
                                 </p>
                                 <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Address: Mar Mikhael, Beirut</p>
                                 <p className="text-sm text-text-secondary dark:text-text-secondary-dark">Municipality: beirut</p>
                            </div>

                            <button className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3 text-lg font-bold text-white bg-navy dark:bg-sand dark:text-navy rounded-full shadow-lg">
                                <FaCheck /> Submit Report
                            </button>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DemoPage;