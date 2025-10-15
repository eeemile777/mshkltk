import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { ReportCategory, Report, ReportSeverity, Preview, ReportData, AiVerificationStatus } from '../types';
import { PATHS } from '../constants';
import L from 'leaflet';
import { getReportImageUrl } from '../data/mockImages';
import Spinner from '../components/Spinner';

import WizardStepper from '../components/WizardStepper';
import Step1Type from './report/Step1_Type';
import Step2Photo from './report/Step2_Photo';
import Step3Disambiguation from './report/Step3_Disambiguation';
import Step3Location from './report/Step3_Location';
import Step4Details from './report/Step4_Details';

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

interface ReportFormPageProps {
  onSuccessRedirectPath?: string;
}

const ReportFormPage: React.FC<ReportFormPageProps> = ({ onSuccessRedirectPath }) => {
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

    // --- New Audio Visualizer State & Refs ---
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const sourceRef = React.useRef<MediaStreamAudioSourceNode | null>(null);
    const animationFrameRef = React.useRef<number | null>(null);
    const [visualizerData, setVisualizerData] = React.useState<Uint8Array | null>(null);
    // --- End New Audio Visualizer State ---

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
            const isSingleMedia = wizardData.previews.length === 1;
            
            const categoryList = JSON.stringify(Object.keys(categories).reduce((acc: Record<string, string[]>, catKey) => {
                const cat = categories[catKey as ReportCategory];
                if (cat && cat.subCategories) {
                    acc[catKey] = Object.keys(cat.subCategories);
                }
                return acc;
            }, {}), null, 2);

            let prompt = `You are an AI assistant for a civic issue reporting app. Your task is to analyze media (images AND videos) to identify issues and check for policy violations. Your response MUST be a single, valid JSON object.

Follow these steps with ZERO DEVIATION:

1.  **Policy/Safety Analysis (Per Media Part):** For EACH media part provided, determine if it violates our safety policies. A violation occurs if the media clearly shows: a human face, a readable vehicle license plate, identifiable military/police personnel or vehicles, or content unrelated to a civic issue. Create a list in \`media_to_flag\` containing the \`index\` and a brief, user-friendly \`reason\` (in ${langName}, phrased politely) for EVERY media part that violates the policies. If no violations are found, this list MUST be an empty array [].
`;

            if (isSingleMedia) {
                prompt += `
2.  **Single Issue Analysis:** Analyze the single media part provided to identify the ONE MOST SIGNIFICANT civic issue present. Even if multiple minor issues exist, focus on the primary problem.

3.  **Issue Generation:** Create an array called \`issues\` containing EXACTLY ONE object representing the most significant issue you identified. This object MUST contain:
    -   **Categorization:** The MOST LIKELY parent \`category\` and child \`sub_category\` from this list: ${categoryList}.
    -   **Severity Assessment:** The \`severity\` which MUST be one of these exact lowercase strings: 'high', 'medium', 'low'.
    -   A concise, descriptive \`title\` (max 10 words, in ${langName}).
    -   A clear \`description\` (20-40 words, in ${langName}), written from the citizen's first-person perspective (e.g., "I noticed that...").

4.  **Final JSON:** The \`issues\` array MUST contain exactly one object. If no clear issue is found, still provide your best guess.`;
            } else { // Multiple media
                prompt += `
2.  **Holistic Content Analysis:** Analyze ALL media parts together to identify every distinct civic issue. For example, if one photo shows a large crack in the road and another shows an overflowing dumpster, you must identify BOTH as separate issues.

3.  **Issue Generation:** Create an array called \`issues\`. For each distinct issue you identified, add an object to this array. Each object MUST contain:
    -   **Categorization:** The MOST LIKELY parent \`category\` and child \`sub_category\` from this list: ${categoryList}.
    -   **Severity Assessment:** The \`severity\` which MUST be one of these exact lowercase strings: 'high', 'medium', 'low'.
    -   A concise, descriptive \`title\` (max 10 words, in ${langName}).
    -   A clear \`description\` (20-40 words, in ${langName}), written from the citizen's first-person perspective (e.g., "I noticed that...").

4.  **Final JSON:** If you found one issue, the \`issues\` array will have one object. If you found two, it will have two. If you found no clear issues, the \`issues\` array MUST be empty.`;
            }

            const parts = [{ text: prompt }, ...mediaParts];
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: parts },
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    issues: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          description: { type: Type.STRING },
                          category: { type: Type.STRING },
                          sub_category: { type: Type.STRING },
                          severity: { type: Type.STRING },
                        },
                        required: ["title", "description", "category", "sub_category", "severity"]
                      }
                    },
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
                  required: ["issues", "media_to_flag"]
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
            
            if (result.issues && result.issues.length > 0) {
                updateWizardData({
                    previews: newPreviews,
                    detectedIssues: result.issues,
                    multiReportSelection: result.issues.reduce((acc: any, _: any, index: number) => {
                        acc[index] = true; // Pre-select all issues
                        return acc;
                    }, {}),
                });
                if (indicesToFlag.size > 0) {
                    setAiVerification({ status: 'images_removed', message: t.aiMediaRemoved.replace('{count}', String(indicesToFlag.size)) });
                } else {
                    setAiVerification({ status: 'pass', message: t.aiVerified });
                }
            } else {
                updateWizardData({
                    previews: newPreviews,
                    detectedIssues: [],
                    title: '', description: '', category: null, sub_category: null, severity: null,
                });
                setAiVerification({ status: 'fail', message: t.aiRejected });
            }

        } catch (error) {
            console.error("Gemini API Error:", JSON.stringify(error));
            setAiVerification({ status: 'fail', message: "AI analysis failed. Please add details manually." });
        } finally {
            setIsAiLoading(false);
        }
    }, [wizardData, language, updateWizardData, isAiLoading, t, categories]);

    const prevPreviewsRef = React.useRef(wizardData?.previews);

    React.useEffect(() => {
        if (!wizardData) return;
        if (prevPreviewsRef.current?.length !== wizardData.previews.length || 
            wizardData.previews.some((p, i) => p.file !== prevPreviewsRef.current?.[i]?.file)) {
            runAiMediaAnalysis();
        }
        prevPreviewsRef.current = wizardData.previews;
    }, [wizardData?.previews, runAiMediaAnalysis]);


    // --- Voice Recording & Visualization ---
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
        } finally {
            setIsTranscribing(false);
        }
    }, [language, updateWizardData]);


    const startRecording = async () => {
        if (isRecording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // --- Setup Audio Visualizer ---
            const audioContext = new (window.AudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            audioContextRef.current = audioContext;
            sourceRef.current = source;
            analyserRef.current = analyser;

            const draw = () => {
                if (analyserRef.current) {
                    const bufferLength = analyserRef.current.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);
                    analyserRef.current.getByteFrequencyData(dataArray);
                    setVisualizerData(dataArray);
                    animationFrameRef.current = requestAnimationFrame(draw);
                }
            };
            draw();
            // --- End Visualizer Setup ---

            const mimeTypes = ['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/webm','audio/ogg'];
            const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

            if (!supportedMimeType) {
                console.error("No supported audio MIME type found for MediaRecorder.");
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
                stream.getTracks().forEach(track => track.stop());
                
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
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();

            // --- Cleanup Audio Visualizer ---
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
            setVisualizerData(null);
            audioContextRef.current?.close().catch(e => console.error("Error closing AudioContext", e));
            sourceRef.current?.disconnect();
            audioContextRef.current = null;
            sourceRef.current = null;
            analyserRef.current = null;
            // --- End Visualizer Cleanup ---

            setIsRecording(false);
            setIsTranscribing(true);
        }
    };


    const handleSubmit = async () => {
        if (!wizardData || !currentUser) return;
        
        setIsSubmitting(true);
        
        try {
            const previewsToSubmit = wizardData.previews.filter(p => p.status !== 'rejected');
            let photoUrls: string[] = [];
            if (wizardData.withMedia && previewsToSubmit.length > 0) {
                 photoUrls = await Promise.all(previewsToSubmit.map(preview => fileToDataURL(preview.file)));
            } else if (!wizardData.withMedia && wizardData.category) {
                photoUrls = [getReportImageUrl(wizardData.category!, categories)];
            }

            const issuesToSubmit = wizardData.detectedIssues.length > 0
                ? wizardData.detectedIssues.filter((_, index) => wizardData.multiReportSelection[index])
                : [{ title: wizardData.title, description: wizardData.description, category: wizardData.category, sub_category: wizardData.sub_category, severity: wizardData.severity }];

            const submittedReports: Report[] = [];
            for (const issue of issuesToSubmit) {
                if (!issue.category || !issue.severity) continue;

                const submissionData = {
                    created_by: currentUser.id,
                    category: issue.category,
                    sub_category: issue.sub_category || undefined,
                    title: issue.title,
                    note: issue.description,
                    severity: issue.severity,
                    lat: wizardData.location![0],
                    lng: wizardData.location![1],
                    area: wizardData.address || "Unknown Location",
                    municipality: wizardData.municipality || 'unknown',
                    photo_urls: photoUrls,
                };
                const newReport = await submitReport(submissionData);
                if (newReport) submittedReports.push(newReport);
            }

            flyToLocation(wizardData.location!, 16);
            resetWizard();
            navigate(onSuccessRedirectPath || PATHS.HOME, { replace: true, state: { newReport: submittedReports[0] } });
        } catch(e) {
            console.error("Failed to submit report:", e);
            setIsSubmitting(false);
        }
    };
    
    // --- Wizard Flow Logic ---
    const steps = React.useMemo(() => {
        if (!wizardData || wizardData.withMedia === null) return [];
        
        const flow: { name: string; component: React.FC<any> }[] = [];
        if (wizardData.withMedia) {
            flow.push({ name: t.stepPhoto, component: Step2Photo });
            // Only show disambiguation if there are MULTIPLE photos AND MULTIPLE issues were detected.
            if (wizardData.previews.length > 1 && wizardData.detectedIssues.length > 1) {
                flow.push({ name: t.stepDisambiguation, component: Step3Disambiguation });
            }
            flow.push({ name: t.stepLocation, component: Step3Location });
            flow.push({ name: t.stepDetails, component: Step4Details });
        } else {
            flow.push({ name: t.stepLocation, component: Step3Location });
            flow.push({ name: t.stepDetails, component: Step4Details });
        }
        return flow;
    }, [wizardData?.withMedia, wizardData?.previews.length, wizardData?.detectedIssues.length, t]);

    const handleNextAfterPhoto = () => {
        // If we have only one issue (which will always be the case for a single photo),
        // we can pre-populate the main wizard data fields for the details step.
        if (wizardData?.detectedIssues.length === 1) {
            const issue = wizardData.detectedIssues[0];
            updateWizardData({
                title: issue.title,
                description: issue.description,
                category: issue.category,
                sub_category: issue.sub_category,
                severity: issue.severity,
            });
        }
        // The `steps` array is reactive, so just calling nextStep() will go to the correct next step
        // (either Disambiguation or Location).
        nextStep();
    };

    if (!wizardData) return <Spinner />;

    const stepperSteps = React.useMemo(() => {
        if (!wizardData || wizardData.withMedia === null) return [];
        if (!wizardData.withMedia) return [t.stepLocation, t.stepDetails];
        
        const steps = [t.stepPhoto];
        if (wizardData.previews.length > 1 && wizardData.detectedIssues.length > 1) {
            steps.push(t.stepDisambiguation);
        }
        steps.push(t.stepLocation);
        steps.push(t.stepDetails);
        return steps;
    }, [wizardData, t]);
    
    const renderStep = () => {
        if (wizardStep === 1) {
            return <Step1Type onSelect={(choice) => {
                updateWizardData({ withMedia: choice === 'with' });
                nextStep();
            }} />;
        }

        const CurrentStepComponent = steps[wizardStep - 2]?.component;
        if (!CurrentStepComponent) return null;

        const isLastStep = wizardStep - 2 === steps.length - 1;

        const commonProps = {
            reportData: wizardData,
            updateReportData: updateWizardData,
            prevStep,
            setWizardStep,
            isSubmitting,
        };

        return <CurrentStepComponent 
            {...commonProps}
            nextStep={CurrentStepComponent === Step2Photo ? handleNextAfterPhoto : (isLastStep ? handleSubmit : nextStep)}
            onSubmit={handleSubmit}
            isAiLoading={isAiLoading}
            aiVerification={aiVerification}
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            startRecording={startRecording}
            stopRecording={stopRecording}
            visualizerData={visualizerData}
        />;
    };
    
    const isPhotoStep = wizardData?.withMedia === true && wizardStep === 2;
    const currentStepperSteps = stepperSteps;
    const stepperCurrentStep = wizardStep - 1;


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
                    <WizardStepper currentStep={stepperCurrentStep} totalSteps={currentStepperSteps.length} stepNames={currentStepperSteps} />
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

export default ReportFormPage;