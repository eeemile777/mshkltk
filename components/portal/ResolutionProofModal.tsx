
import * as React from 'react';
import { AppContext } from '../../contexts/AppContext';
import { Report } from '../../types';
import { FaXmark, FaCamera, FaUpload, FaSpinner, FaCheck } from 'react-icons/fa6';

interface ResolutionProofModalProps {
    report: Report;
    onClose: () => void;
    onSubmit: (photoUrl: string) => void;
}

const ResolutionProofModal: React.FC<ResolutionProofModalProps> = ({ report, onClose, onSubmit }) => {
    const { t } = React.useContext(AppContext);
    const [photo, setPhoto] = React.useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [view, setView] = React.useState<'select' | 'camera'>('select');
    const [isVideoReady, setIsVideoReady] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const streamRef = React.useRef<MediaStream | null>(null);

    const cleanupStream = React.useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);
    
    React.useEffect(() => {
        return () => cleanupStream();
    }, [cleanupStream]);
    
    // Effect to handle video stream readiness
    React.useEffect(() => {
        const videoElement = videoRef.current;
        if (view === 'camera' && videoElement) {
            const handleVideoReady = () => {
                if (videoElement.readyState >= videoElement.HAVE_METADATA && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                    setIsVideoReady(true);
                }
            };
            
            videoElement.addEventListener('playing', handleVideoReady);
            videoElement.addEventListener('loadeddata', handleVideoReady);
            videoElement.addEventListener('loadedmetadata', handleVideoReady);
            
            handleVideoReady(); // Initial check

            return () => {
                videoElement.removeEventListener('playing', handleVideoReady);
                videoElement.removeEventListener('loadeddata', handleVideoReady);
                videoElement.removeEventListener('loadedmetadata', handleVideoReady);
            };
        }
    }, [view]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setPhoto(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleOpenCamera = async () => {
        setIsVideoReady(false); // Reset readiness state
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.warn("Camera video play() failed, this is often benign.", e));
            }
            setView('camera');
        } catch (error) {
            console.error("Error accessing camera", error);
            alert(t.errorAccessingCamera);
        }
    };

    const handleTakePhoto = () => {
        if (!videoRef.current || !isVideoReady) {
            alert(t.failedToCapture);
            return;
        }
        
        requestAnimationFrame(() => {
            const video = videoRef.current;
            // Re-check video element and its properties inside rAF callback for maximum safety
            if (!video || video.readyState < 2 /* HAVE_CURRENT_DATA */ || video.videoWidth <= 0 || video.videoHeight <= 0) {
                console.error("Take photo failed inside rAF: Video not ready or dimensions are zero.");
                alert(t.failedToCapture);
                cleanupStream();
                setView('select');
                return;
            }
    
            try {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    throw new Error("Could not get canvas context.");
                }
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                setPhoto(canvas.toDataURL('image/jpeg'));
            } catch (error) {
                console.error("Error capturing proof photo from video stream:", error);
                alert(t.failedToCapture);
            } finally {
                cleanupStream();
                setView('select');
            }
        });
    };

    const handleSubmit = async () => {
        if (!photo) return;
        setIsSubmitting(true);
        await onSubmit(photo);
        // The parent component will handle closing the modal on success
    };
    
    const renderContent = () => {
        if (view === 'camera') {
            return (
                <div className="w-full">
                    <div className="relative w-full rounded-lg bg-black overflow-hidden">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full" />
                        {!isVideoReady && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                <FaSpinner className="animate-spin text-white text-4xl" />
                            </div>
                        )}
                    </div>
                    <button 
                        onClick={handleTakePhoto}
                        disabled={!isVideoReady}
                        className="mt-4 w-full bg-teal text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 disabled:bg-gray-500"
                    >
                        <FaCamera /> 
                        {isVideoReady ? t.takePhoto : t.initializing}
                    </button>
                </div>
            )
        }
        
        return (
            <>
                {photo ? (
                    <div className="w-full text-center">
                        <img src={photo} alt="Resolution proof" className="rounded-lg mb-4 max-h-64 mx-auto" />
                        <button onClick={() => setPhoto(null)} className="text-sm text-coral dark:text-coral-dark">{t.retakeReupload}</button>
                    </div>
                ) : (
                    <div className="w-full grid grid-cols-2 gap-4">
                        <button onClick={handleOpenCamera} className="flex flex-col items-center justify-center p-6 bg-muted dark:bg-bg-dark rounded-xl hover:bg-gray-200 dark:hover:bg-border-dark">
                            <FaCamera className="text-3xl text-sky dark:text-cyan-dark mb-2" />
                            <span className="font-bold">{t.takePhoto}</span>
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center p-6 bg-muted dark:bg-bg-dark rounded-xl hover:bg-gray-200 dark:hover:bg-border-dark">
                            <FaUpload className="text-3xl text-sky dark:text-cyan-dark mb-2" />
                            <span className="font-bold">{t.upload}</span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!photo || isSubmitting}
                    className="w-full mt-6 bg-teal text-white font-bold py-3 rounded-full flex items-center justify-center gap-2 disabled:bg-gray-400"
                >
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    {t.confirmResolution}
                </button>
            </>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-lg m-4 flex flex-col items-center relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} disabled={isSubmitting} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark">
                    <FaXmark size={20} />
                </button>
                <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-2">{t.addProofTitle}</h2>
                <p className="text-text-secondary dark:text-text-secondary-dark mb-6 text-center">{t.addProofDesc}</p>
                {renderContent()}
            </div>
        </div>
    );
};

export default ResolutionProofModal;
