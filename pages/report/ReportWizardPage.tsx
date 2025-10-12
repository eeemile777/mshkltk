import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
// FIX: Removed local type definitions and imported them from the central types file to break a circular dependency.
import { ReportCategory, Report, ReportSeverity, Preview, ReportData, AiVerificationStatus } from '../../types';
import { PATHS } from '../../constants';
import L from 'leaflet';
import { getReportImageUrl } from '../../data/mockImages';
import Spinner from '../../components/Spinner';

import WizardStepper from '../../components/WizardStepper';
import Step1Type from './Step1_Type';
import Step2Photo from './Step2_Photo';
import Step3Location from './Step3_Location';
import Step4Details from './Step4_Details';

import { GoogleGenAI, Type } from '@google/genai';
import { FaXmark } from 'react-icons/fa6';

const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

interface ReportWizardPageProps {
  onSuccessRedirectPath?: string;
}

const ReportWizardPage: React.FC<ReportWizardPageProps> = ({ onSuccessRedirectPath }) => {
    const { t, language, currentUser, submitReport, flyToLocation, wizardData, isWizardActive, wizardStep, setWizardStep, updateWizardData, resetWizard, categories } = React.useContext(AppContext);
    const navigate = useNavigate();
    
    // Redirect if wizard hasn't been started properly
    React.useEffect(() => {
        if (!isWizardActive) {
            navigate(PATHS.HOME, { replace: true });
        }
    }, [isWizardActive, navigate]);

    const [isAiLoading, setIsAiLoading] = React.useState(false);
    const [aiVerification, setAiVerification] = React.useState<{ status: AiVerificationStatus, message: string }>({ status: 'idle', message: '' });
    
    const [isRecording, setIsRecording] = React.useState(false);
    const [isTranscribing, setIsTranscribing] = React.useState(false);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const audioChunksRef = React.useRef<Blob[]>([]);

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const nextStep = () => setWizardStep(s => s + 1);
    const prevStep = () => setWizardStep(s => s - 1);
    
    const fileToGenerativePart = async (file: File) => {
      const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
      // Sanitize the MIME type to remove codec information, which can cause API errors.
      const mimeType = file.type.split(';')[0];
      return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: mimeType },
      };
    };

    const runAiMediaAnalysis = React.useCallback(async () => {
        if (isAiLoading || !wizardData || wizardData.previews.length === 0 || !process.env.API_KEY) {
            setAiVerification({ status: 'idle', message: '' });
            return;
        }
        
        setIsAiLoading(true);
        setAiVerification({ status: 'pending', message: t.aiAnalyzing });

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const mediaParts = await Promise.all(wizardData.previews.map(p => fileToGenerativePart(p.file)));
            const langName = language === 'ar' ? 'Arabic' : 'English';
            
            const categoryList = JSON.stringify(Object.keys(categories).reduce((acc: Record<string, string[]>, catKey) => {
                const cat = categories[catKey as ReportCategory];
                if (cat && cat.subCategories) {
                    acc[catKey] = Object.keys(cat.subCategories);
                }
                return acc;
            }, {}), null, 2);

            const prompt = `You are an AI assistant for a civic issue reporting app. Your task is to analyze media (images AND videos) to identify issues and check for policy violations. Your response MUST be a single, valid JSON object.

Follow these steps with ZERO DEVIATION:

1.  **Policy/Safety Analysis (Per Media Part):** For EACH media part provided, determine if it violates our safety policies. A violation occurs if the media clearly shows:
    -   A human face (especially selfies or close-ups).
    -   A readable vehicle license plate.
    -   Identifiable military or law enforcement personnel or vehicles.
    -   Content that is not related to a potential civic issue (e.g., a picture of a pet, a document).

2.  **Filtering Decision:** Create a list in \`media_to_flag\` containing the \`index\` and a brief \`reason\` (in ${langName}) for EVERY media part that violates the policies. If no violations are found, this list MUST be an empty array [].

3.  **Holistic Content Analysis:** Analyze ALL media parts together, even those flagged for removal, to understand the user's intent. The content might be a clear problem (pothole), a potential issue (a leaning tree), or informational (an empty lot).

4.  **Content Generation (Mandatory):** Based on your holistic analysis, you MUST generate the following details. ALWAYS provide a value for each field.
    -   **Categorization:** Select the MOST LIKELY parent \`category\` and child \`sub_category\` from this list: ${categoryList}. If no clear issue is present, use 'other_unknown' or an appropriate category (e.g., 'public_spaces' for a park).
    -   **Severity Assessment:** Assess the severity. The value for \`severity\` MUST be one of these exact lowercase strings: 'high', 'medium', 'low'.
    -   Generate a concise, descriptive \`title\` (max 10 words, in ${langName}).
    -   Generate a clear \`description\` (20-40 words, in ${langName}), written from the citizen's first-person perspective (e.g., "I noticed that...").

Your JSON output must strictly adhere to the schema. Your primary job is the policy check, but the content generation is equally critical for assisting the user.`;
            
            const parts = [{ text: prompt }, ...mediaParts];
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: parts },
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING },
                    sub_category: { type: Type.STRING },
                    severity: { type: Type.STRING },
                    media_to_flag: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          index: { type: Type.INTEGER },
                          reason: { type: Type.STRING }
                        },
                        required: ["index", "reason"]
                      }
                    }
                  },
                  required: ["title", "description", "category", "sub_category", "severity", "media_to_flag"]
                }
              }
            });

            const result = JSON.parse(response.text);
            const indicesToFlag = new Set(result.media_to_flag?.map((item: any) => item.index) || []);
            
            const newPreviews = wizardData.previews.map((preview, index) => {
                if (indicesToFlag.has(index)) {
                    const reasonItem = result.media_to_flag.find((item: any) => item.index === index);
                    return { ...preview, status: 'rejected' as const, rejectionReason: reasonItem?.reason };
                }
                return { ...preview, status: 'valid' as const };
            });
            
            // ALWAYS update with the new AI-generated content, overwriting previous values.
            updateWizardData({
                previews: newPreviews,
                title: result.title,
                description: result.description,
                category: result.category,
                sub_category: result.sub_category,
                severity: result.severity,
            });

            if (indicesToFlag.size > 0) {
                 setAiVerification({ status: 'images_removed', message: t.aiMediaRemoved.replace('{count}', String(indicesToFlag.size)) });
            } else {
                setAiVerification({ status: 'pass', message: t.aiVerified });
            }

        } catch (error) {
            console.error("Gemini API Error:", error);
            setAiVerification({ status: 'fail', message: "AI analysis failed. Please add details manually." });
        } finally {
            setIsAiLoading(false);
        }
    }, [wizardData, language, updateWizardData, isAiLoading, t, categories]);

    const prevPreviewsRef = React.useRef(wizardData?.previews);

    React.useEffect(() => {
        if (!wizardData) return;
        // Trigger analysis if the number of previews changes or if the file references are different.
        if (prevPreviewsRef.current?.length !== wizardData.previews.length || 
            wizardData.previews.some((p, i) => p.file !== prevPreviewsRef.current?.[i]?.file)) {
            
            runAiMediaAnalysis();
        }
        
        prevPreviewsRef.current = wizardData.previews;
    }, [wizardData?.previews, runAiMediaAnalysis]);


    // --- Voice Recording ---
    const runAiTranscription = React.useCallback(async (audioBase64: string, mimeType: string) => {
        if (!process.env.API_KEY) {
            setIsTranscribing(false);
            return;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const langName = language === 'ar' ? 'Arabic' : 'English';
            const prompt = `You are a helpful assistant. A citizen is reporting a civic issue via audio. Your task is to process their recording.
1.  First, transcribe the audio. The user might speak in ${langName} or a mix of languages.
2.  From the transcription, craft a 'title' (max 10 words) and a 'description' (20-50 words).
3.  CRITICAL: The tone must be a first-person narrative, as if you are the citizen reporting the issue. Use "I saw...", "There is a...", etc. Do NOT say "The user reported..." or describe it from a third-person perspective.
4.  The final output must be in ${langName}.
Your response MUST be a single, valid JSON object with "title" and "description" keys.`;
            
            const audioPart = { inlineData: { data: audioBase64, mimeType } };
            const textPart = { text: prompt };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [textPart, audioPart] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING }
                        },
                        required: ["title", "description"]
                    }
                }
            });

            const result = JSON.parse(response.text);
            updateWizardData({
                title: result.title,
                description: result.description,
            });

        } catch (error) {
            console.error("Gemini audio transcription error:", error);
            // Optionally show an error toast to the user here
        } finally {
            setIsTranscribing(false);
        }
    }, [language, updateWizardData]);


    const startRecording = async () => {
        if (isRecording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const mimeTypes = [
                'audio/webm;codecs=opus',
                'audio/ogg;codecs=opus',
                'audio/webm',
                'audio/ogg',
            ];
            const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

            if (!supportedMimeType) {
                console.error("No supported audio MIME type found for MediaRecorder.");
                // You could set an error state here to show in the UI
                return;
            }

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: supportedMimeType });
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const finalMimeType = supportedMimeType?.split(';')[0] || 'audio/webm';
                const audioBlob = new Blob(audioChunksRef.current, { type: finalMimeType });
                stream.getTracks().forEach(track => track.stop()); // Stop microphone access
                
                if (audioBlob.size === 0) {
                    console.warn("Audio recording resulted in an empty file. Discarding.");
                    setIsTranscribing(false);
                    return;
                }

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    if (reader.result) {
                        const base64Audio = (reader.result as string).split(',')[1];
                        runAiTranscription(base64Audio, audioBlob.type);
                    } else {
                         setIsTranscribing(false);
                    }
                };
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            // You could set an error state here to show in the UI
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsTranscribing(true);
        }
    };


    const handleSubmit = async () => {
        if (!wizardData) return;
        const previewsToSubmit = wizardData.previews.filter(p => p.status !== 'rejected');
        if (wizardData.withMedia === null || !currentUser || !wizardData.category || !wizardData.severity) return;
        if (wizardData.withMedia === true && previewsToSubmit.length === 0) return;
        
        setIsSubmitting(true);
        
        try {
            let photoUrls: string[];
            if (wizardData.withMedia && previewsToSubmit.length > 0) {
                 photoUrls = await Promise.all(
                    previewsToSubmit.map(preview => fileToDataURL(preview.file))
                );
            } else {
                // FIX: Pass the 'categories' object from context as the second argument to 'getReportImageUrl' to resolve argument count mismatch.
                photoUrls = [getReportImageUrl(wizardData.category!, categories)];
            }

            const submissionData = {
                created_by: currentUser.id,
                category: wizardData.category,
                sub_category: wizardData.sub_category || undefined,
                title: wizardData.title,
                note: wizardData.description,
                severity: wizardData.severity,
                lat: wizardData.location![0],
                lng: wizardData.location![1],
                area: wizardData.address || "Unknown Location",
                municipality: wizardData.municipality || 'unknown',
                photo_urls: photoUrls,
            };

            const newReport = await submitReport(submissionData);
            flyToLocation(wizardData.location!, 16);
            resetWizard();
            navigate(onSuccessRedirectPath || PATHS.HOME, { replace: true, state: { newReport } });
        } catch(e) {
            console.error("Failed to submit report:", e);
            setIsSubmitting(false);
        }
    };
    
    if (!wizardData) {
        return <Spinner />;
    }

    const stepperSteps = wizardData.withMedia === null ? [] : wizardData.withMedia ? [t.stepPhoto, t.stepLocation, t.stepDetails] : [t.stepLocation, t.stepDetails];
    const stepperCurrentStep = wizardStep - (wizardData.withMedia ? 1 : 2);


    const renderStep = () => {
        if (wizardStep === 1) {
            return <Step1Type onSelect={(choice) => {
                const isWithMedia = choice === 'with';
                updateWizardData({ 
                    withMedia: isWithMedia,
                    previews: isWithMedia ? wizardData.previews : []
                });
                if (!isWithMedia) {
                    setAiVerification({ status: 'idle', message: '' });
                }
                nextStep();
            }} />;
        }

        if (wizardData.withMedia) { // Reporting WITH media
            switch (wizardStep) {
                case 2:
                    return <Step2Photo reportData={wizardData} updateReportData={updateWizardData} nextStep={nextStep} prevStep={prevStep} isAiLoading={isAiLoading} aiVerification={aiVerification} />;
                case 3:
                    return <Step3Location reportData={wizardData} updateReportData={updateWizardData} nextStep={nextStep} prevStep={prevStep} />;
                case 4:
                    return <Step4Details reportData={wizardData} updateReportData={updateWizardData} onSubmit={handleSubmit} prevStep={prevStep} isSubmitting={isSubmitting} isAiLoading={isAiLoading} isRecording={isRecording} isTranscribing={isTranscribing} startRecording={startRecording} stopRecording={stopRecording} />;
                default:
                    return null;
            }
        } else { // Reporting WITHOUT media
             switch (wizardStep) {
                case 2:
                    return <Step3Location reportData={wizardData} updateReportData={updateWizardData} nextStep={nextStep} prevStep={prevStep} />;
                case 3:
                    return <Step4Details reportData={wizardData} updateReportData={updateWizardData} onSubmit={handleSubmit} prevStep={prevStep} isSubmitting={isSubmitting} isAiLoading={false} isRecording={isRecording} isTranscribing={isTranscribing} startRecording={startRecording} stopRecording={stopRecording} />;
                default:
                    return null;
            }
        }
    };
    
    const isPhotoStep = wizardData?.withMedia === true && wizardStep === 2;

    return (
        <div className="h-full flex flex-col relative">
             <button
                onClick={() => { resetWizard(); navigate(onSuccessRedirectPath || PATHS.HOME); }}
                className="absolute top-4 right-4 z-50 p-2 bg-black/20 text-white rounded-full backdrop-blur-sm hover:bg-black/40 transition-colors"
                aria-label="Close report form"
            >
                <FaXmark size={20}/>
            </button>

            {wizardStep > 1 && wizardData.withMedia !== null && (
                <div className="w-full pt-8 px-4 flex-shrink-0">
                    <WizardStepper currentStep={stepperCurrentStep} totalSteps={stepperSteps.length} stepNames={stepperSteps} />
                </div>
            )}
            <div className={`flex-grow min-h-0 p-4 flex justify-center ${wizardStep === 1 ? 'pt-16' : ''}`}>
                <div className={`w-full flex flex-col ${isPhotoStep ? '' : 'max-w-2xl'}`}>
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

export default ReportWizardPage;
