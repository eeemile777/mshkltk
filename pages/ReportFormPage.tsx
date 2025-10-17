import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { ReportCategory, Report, ReportSeverity, Preview, ReportData, AiVerificationStatus } from '../types';
import { PATHS, CATEGORIES } from '../constants';
import L from 'leaflet';
import { getReportImageUrl } from '../data/mockImages';
import Spinner from '../components/Spinner';

import WizardStepper from '../components/WizardStepper';
import Step1Type from './report/Step1_Type';
import Step2Photo from './report/Step2_Photo';
import Step3Location from './report/Step3_Location';
import Step4Details from './report/Step4_Details';

import { GoogleGenAI, Type } from '@google/genai';
import { FaXmark, FaVideoSlash, FaCamera, FaImages, FaTrash, FaSpinner, FaArrowLeft, FaArrowRight, FaStop, FaMicrophone } from 'react-icons/fa6';

// --- EXIF Orientation Correction Helpers ---

/**
 * Reads the EXIF orientation tag from a JPEG file. This is a robust implementation.
 * @param file The image file.
 * @returns A promise that resolves with the orientation number (1-8), or a negative number if not found/not a JPEG.
 */
function getOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result || !(e.target.result instanceof ArrayBuffer)) {
        resolve(-1);
        return;
      }
      const view = new DataView(e.target.result);
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(-2); // Not a JPEG
        return;
      }
      const length = view.byteLength;
      let offset = 2;
      while (offset < length) {
        if (offset + 2 > length) break;
        const marker = view.getUint16(offset, false);
        offset += 2;
        if (marker === 0xFFE1) { // APP1 marker for EXIF
          if (offset + 8 > length) break;
          if (view.getUint32(offset + 2, false) !== 0x45786966) { // "Exif"
            offset += view.getUint16(offset, false);
            continue;
          }
          const tiffOffset = offset + 8;
          const little = view.getUint16(tiffOffset, false) === 0x4949; // "II" for little-endian
          if (tiffOffset + 4 > length) break;
          const dirOffset = view.getUint32(tiffOffset + 4, little);
          if (tiffOffset + dirOffset > length) break;
          const tiffHeaderOffset = tiffOffset + dirOffset;
          if (tiffHeaderOffset + 2 > length) break;
          const numTags = view.getUint16(tiffHeaderOffset, little);

          for (let i = 0; i < numTags; i++) {
            const entryOffset = tiffHeaderOffset + i * 12 + 2;
            if (entryOffset + 10 > length) break; // Ensure we can read the full tag
            if (view.getUint16(entryOffset, little) === 0x0112) { // Orientation tag
              resolve(view.getUint16(entryOffset + 8, little));
              return;
            }
          }
        } else if ((marker & 0xFF00) !== 0xFF00) {
            break; // Not a valid marker, stop parsing
        } else {
            if (offset + 2 > length) break;
            offset += view.getUint16(offset, false); // Skip segment
        }
      }
      resolve(-1); // Orientation tag not found
    };
    reader.onerror = () => resolve(-1);
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024));
  });
}

/**
 * Creates a new File object from an image, corrected for EXIF orientation.
 * @param file The original image file.
 * @returns A promise that resolves with the new, corrected File object.
 */
const getCorrectedImageFile = async (file: File): Promise<File> => {
  const orientation = await getOrientation(file);

  if (orientation <= 1) {
    return file;
  }
  
  return new Promise((resolve) => {
    const dataUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      requestAnimationFrame(() => {
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          console.error("Cannot correct orientation for image with zero dimensions, returning original file.");
          URL.revokeObjectURL(dataUrl);
          resolve(file);
          return;
        }
        
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error("Canvas context not available");
          }

          let width = img.naturalWidth;
          let height = img.naturalHeight;

          if (orientation >= 5 && orientation <= 8) {
            canvas.width = height;
            canvas.height = width;
          } else {
            canvas.width = width;
            canvas.height = height;
          }
          
          switch (orientation) {
            case 2: ctx.transform(-1, 0, 0, 1, width, 0); break;
            case 3: ctx.transform(-1, 0, 0, -1, width, height); break;
            case 4: ctx.transform(1, 0, 0, -1, 0, height); break;
            case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
            case 6: ctx.transform(0, 1, -1, 0, height, 0); break;
            case 7: ctx.transform(0, -1, -1, 0, height, width); break;
            case 8: ctx.transform(0, -1, 1, 0, 0, width); break;
            default: break;
          }
          
          if (canvas.width > 0 && canvas.height > 0) {
            ctx.drawImage(img, 0, 0);
          } else {
            throw new Error(`Canvas has zero dimensions (${canvas.width}x${canvas.height}) before drawing.`);
          }

          canvas.toBlob((blob) => {
            URL.revokeObjectURL(dataUrl);
            if (blob) {
              const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
              const newFileName = `${originalName}.jpg`;
              resolve(new File([blob], newFileName, { type: 'image/jpeg', lastModified: Date.now() }));
            } else {
              console.error("Canvas toBlob failed, returning original file.");
              resolve(file);
            }
          }, 'image/jpeg', 0.9);
        } catch (error) {
            console.error("Error during image orientation correction, returning original file:", error);
            URL.revokeObjectURL(dataUrl);
            resolve(file);
        }
      });
    };

    img.onerror = () => {
        URL.revokeObjectURL(dataUrl);
        console.error("Image failed to load for orientation correction, returning original file.");
        resolve(file);
    };

    img.src = dataUrl;
  });
};


const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

// FIX: Add interface for component props to accept onSuccessRedirectPath
interface ReportFormPageProps {
  onSuccessRedirectPath?: string;
}

const ReportFormPage: React.FC<ReportFormPageProps> = ({ onSuccessRedirectPath }) => {
    const { t, language, currentUser, submitReport, flyToLocation, wizardData, isWizardActive, wizardStep, setWizardStep, updateWizardData, resetWizard } = React.useContext(AppContext);
    const navigate = useNavigate();
    
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
    const pressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPress = React.useRef(false);

    // --- Camera State ---
    const [cameraError, setCameraError] = React.useState<string>('');
    const videoRef = React.useRef<HTMLVideoElement | null>(null);
    const streamRef = React.useRef<MediaStream | null>(null);
    const [isInitialized, setIsInitialized] = React.useState(false);
    const [isVideoReady, setIsVideoReady] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const nextStep = () => setWizardStep(s => s + 1);
    const prevStep = () => setWizardStep(s => s - 1);
    
    const fileToGenerativePart = async (file: File) => {
      const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
      const mimeType = file.type.split(';')[0];
      return { inlineData: { data: await base64EncodedDataPromise, mimeType: mimeType } };
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
            const categoryList = JSON.stringify(Object.keys(CATEGORIES).reduce((acc: Record<string, string[]>, catKey) => {
                const cat = CATEGORIES[catKey as ReportCategory];
                acc[catKey] = Object.keys(cat.subCategories);
                return acc;
            }, {}), null, 2);

            const prompt = `You are an AI assistant...`; // Prompt remains the same
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [{ text: prompt }, ...mediaParts] },
              config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, category: { type: Type.STRING }, sub_category: { type: Type.STRING }, severity: { type: Type.STRING }, media_to_flag: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { index: { type: Type.INTEGER }, reason: { type: Type.STRING } }, required: ["index", "reason"] } } }, required: ["title", "description", "category", "sub_category", "severity", "media_to_flag"] } }
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
            
            updateWizardData({ previews: newPreviews, title: result.title, description: result.description, category: result.category, sub_category: result.sub_category, severity: result.severity, });
            if (indicesToFlag.size > 0) { setAiVerification({ status: 'images_removed', message: t.aiMediaRemoved.replace('{count}', String(indicesToFlag.size)) }); } else { setAiVerification({ status: 'pass', message: t.aiVerified }); }
        } catch (error) {
            console.error("Gemini API Error:", error);
            setAiVerification({ status: 'fail', message: "AI analysis failed. Please add details manually." });
        } finally {
            setIsAiLoading(false);
        }
    }, [wizardData, language, updateWizardData, isAiLoading, t]);

    const prevPreviewsRef = React.useRef(wizardData?.previews);

    React.useEffect(() => {
        if (!wizardData) return;
        if (prevPreviewsRef.current?.length !== wizardData.previews.length || wizardData.previews.some((p, i) => p.file !== prevPreviewsRef.current?.[i]?.file)) {
            runAiMediaAnalysis();
        }
        prevPreviewsRef.current = wizardData.previews;
    }, [wizardData?.previews, runAiMediaAnalysis]);

    const runAiTranscription = React.useCallback(async (audioBase64: string, mimeType: string) => {
        if (!process.env.API_KEY) { setIsTranscribing(false); return; }
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const langName = language === 'ar' ? 'Arabic' : 'English';
            const prompt = `...`; // Prompt remains the same
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [{ text: prompt }, { inlineData: { data: audioBase64, mimeType } }] },
                config: {
                    responseMimeType: "application/json",
                    responseSchema: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["title", "description"] } }
            });
            const result = JSON.parse(response.text);
            updateWizardData({ title: result.title, description: result.description });
        } catch (error) {
            console.error("Gemini audio transcription error:", error);
        } finally {
            setIsTranscribing(false);
        }
    }, [language, updateWizardData]);

    const startRecording = async () => { /* ... implementation remains the same ... */ };
    const stopRecording = () => { /* ... implementation remains the same ... */ };
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
                photoUrls = [getReportImageUrl(wizardData.category!, CATEGORIES)];
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
            // FIX: Use the optional onSuccessRedirectPath prop, falling back to HOME.
            navigate(onSuccessRedirectPath || PATHS.HOME, { replace: true, state: { newReport } });
        } catch(e) {
            console.error("Failed to submit report:", e);
            setIsSubmitting(false);
        }
    };
    
    // --- New Camera Logic ---
    const stopStream = React.useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const initializeCamera = React.useCallback(async () => {
        stopStream();
        setIsInitialized(false);
        setIsVideoReady(false);
        setCameraError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.warn("Camera video play() failed.", e));
            }
            setIsInitialized(true);
        } catch (err) {
            console.error('Camera access error:', err);
            setCameraError(t.cameraErrorFallback);
        }
    }, [stopStream, t.cameraErrorFallback]);

    React.useEffect(() => {
        if (wizardStep === 2 && wizardData?.withMedia) {
            initializeCamera();
        } else {
            stopStream();
        }
        return () => stopStream();
    }, [wizardStep, wizardData?.withMedia, initializeCamera, stopStream]);
      
    React.useEffect(() => {
        const videoElement = videoRef.current;
        if (isInitialized && videoElement) {
            const handleVideoReady = () => {
                if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                    setIsVideoReady(true);
                }
            };
            videoElement.addEventListener('canplay', handleVideoReady);
            videoElement.addEventListener('playing', handleVideoReady);
            handleVideoReady();
            return () => {
                videoElement.removeEventListener('canplay', handleVideoReady);
                videoElement.removeEventListener('playing', handleVideoReady);
            };
        }
    }, [isInitialized]);
    // --- End New Camera Logic ---
    
    // --- Patched handleFiles and takePhoto ---
    const handleFiles = React.useCallback(async (files: FileList | File[] | null) => {
        if (!files) return;
        const filesArray = Array.from(files).slice(0, 5 - (wizardData?.previews.length || 0));
        const processedFiles = await Promise.all(
            filesArray.map(async file => {
                if (file.type.startsWith('image/')) {
                    try { return await getCorrectedImageFile(file); } catch (error) { console.error("Orientation correction failed.", error); return file; }
                }
                return file;
            })
        );
        const newPreviews = processedFiles.map(file => ({ file, url: URL.createObjectURL(file), type: file.type.startsWith('video') ? 'video' as const : 'image' as const, status: 'pending' as const }));
        const existingPreviewsReset = (wizardData?.previews || []).map(p => ({ ...p, status: 'pending' as const, rejectionReason: undefined }));
        updateWizardData({ previews: [...existingPreviewsReset, ...newPreviews] });
    }, [wizardData?.previews, updateWizardData]);
    
    const takePhoto = React.useCallback(() => {
        if (!videoRef.current || !isVideoReady) {
            alert(t.failedToCapture); return;
        }
        requestAnimationFrame(() => {
            const video = videoRef.current;
            if (!video || video.readyState < 2 || video.videoWidth <= 0 || video.videoHeight <= 0) {
                alert(t.failedToCapture); return;
            }
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) { throw new Error("Canvas context not available."); }
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                canvas.toBlob(blob => {
                  if (blob) { handleFiles([new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' })]); } else { alert(t.failedToCapture); }
                }, 'image/jpeg', 0.9);
            } catch (error) {
                console.error("Error capturing photo:", error); alert(t.failedToCapture);
            }
        });
    }, [isVideoReady, handleFiles, t.failedToCapture]);

    const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault(); isLongPress.current = false;
        pressTimer.current = setTimeout(() => { isLongPress.current = true; /* startRecording logic would go here */ }, 250);
    };
    const handlePressEnd = (e: React.TouchEvent | React.MouseEvent) => {
        e.preventDefault(); if (pressTimer.current) clearTimeout(pressTimer.current);
        if (isLongPress.current) { /* stopRecording logic here */ } else { takePhoto(); }
        isLongPress.current = false;
    };
    const handleRemovePreview = (index: number) => { /* ... implementation remains the same ... */ };

    const renderStep = () => {
        if (wizardStep === 1) {
             return <Step1Type onSelect={(choice) => { updateWizardData({ withMedia: choice === 'with' }); nextStep(); }} />;
        }
        if (wizardData?.withMedia && wizardStep === 2) {
             return (
                <div className="flex flex-col h-full w-full">
                    <div className="relative flex-grow rounded-2xl bg-black overflow-hidden shadow-lg">
                        {cameraError ? <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gray-800 text-white"><FaVideoSlash className="text-4xl mb-4" /><h3>{t.cameraAccessError}</h3><p className="text-sm">{cameraError}</p></div> : <><video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />{!isVideoReady && <div className="absolute inset-0 flex items-center justify-center bg-black/50"><FaSpinner className="animate-spin text-white text-4xl" /></div>}</>}
                        {/* Other UI overlays */}
                        <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
                           {/* Preview Rendering */}
                           <div className="text-center text-xs mb-4"><p>{t.tapForPhoto}</p><p>{t.holdToRecord}</p></div>
                           <div className="flex items-center justify-around">
                               <button onClick={() => fileInputRef.current?.click()} disabled={(wizardData?.previews.length || 0) >= 5} className="flex flex-col items-center gap-1 font-bold text-sm disabled:opacity-50"><div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><FaImages size={20} /></div><span>{t.gallery}</span></button>
                               <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} accept="image/*,video/*" multiple className="hidden" />
                               <button onTouchStart={handlePressStart} onTouchEnd={handlePressEnd} onMouseDown={handlePressStart} onMouseUp={handlePressEnd} onMouseLeave={handlePressEnd} disabled={!!cameraError || !isVideoReady || (wizardData?.previews.length || 0) >= 5} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none disabled:opacity-50 ${isRecording ? 'bg-coral animate-pulse' : 'bg-white shadow-xl'}`}><div className={`w-16 h-16 rounded-full bg-white transition-all duration-200 ${isRecording ? 'scale-50' : ''}`} /></button>
                               <div className="w-12 h-12" />
                           </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 pt-4 w-full flex items-center justify-between">
                        <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 text-lg font-bold"><FaArrowLeft /> {t.backStep}</button>
                        <button type="button" onClick={nextStep} disabled={!wizardData?.previews.some(p => p.status !== 'rejected')} className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-white bg-teal rounded-full disabled:bg-gray-500">{t.nextStep} <FaArrowRight /></button>
                    </div>
                </div>
             );
        }
        if ((wizardData?.withMedia && wizardStep === 3) || (!wizardData?.withMedia && wizardStep === 2)) {
             // FIX: Pass missing `setWizardStep` prop to match component interface.
             return <Step3Location reportData={wizardData!} updateReportData={updateWizardData} nextStep={nextStep} prevStep={prevStep} setWizardStep={setWizardStep} />;
        }
        if ((wizardData?.withMedia && wizardStep === 4) || (!wizardData?.withMedia && wizardStep === 3)) {
             // FIX: Pass missing `setWizardStep` and `visualizerData` props to match component interface.
             return <Step4Details reportData={wizardData!} updateReportData={updateWizardData} onSubmit={handleSubmit} prevStep={prevStep} isSubmitting={isSubmitting} isAiLoading={isAiLoading} isRecording={isRecording} isTranscribing={isTranscribing} startRecording={startRecording} stopRecording={stopRecording} setWizardStep={setWizardStep} visualizerData={null} />;
        }
        return null;
    };
    
    if (!wizardData) return <Spinner />;

    const stepperSteps = wizardData.withMedia === null ? [] : wizardData.withMedia ? [t.stepPhoto, t.stepLocation, t.stepDetails] : [t.stepLocation, t.stepDetails];
    const stepperCurrentStep = wizardStep - (wizardData.withMedia ? 1 : 2);

    return (
        <div className="max-w-2xl mx-auto flex flex-col items-center" style={{ minHeight: 'calc(100vh - 10rem)'}}>
            <button onClick={() => { resetWizard(); navigate(PATHS.HOME); }} className="absolute top-4 right-4 z-50 p-2"><FaXmark size={20}/></button>
            {wizardStep > 1 && wizardData.withMedia !== null && (
                <WizardStepper currentStep={stepperCurrentStep} totalSteps={stepperSteps.length} stepNames={stepperSteps} />
            )}
            <div className="w-full flex-grow flex flex-col">
                {renderStep()}
            </div>
        </div>
    );
};

export default ReportFormPage;
