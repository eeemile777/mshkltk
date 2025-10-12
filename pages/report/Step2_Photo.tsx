
import * as React from 'react';
import { AppContext } from '../../contexts/AppContext';
import { ReportData, AiVerificationStatus, Preview } from '../../types';
import { FaArrowLeft, FaArrowRight, FaImages, FaTrash, FaVideoSlash, FaSpinner, FaCircleCheck, FaTriangleExclamation, FaCircleInfo } from 'react-icons/fa6';

interface Step2PhotoProps {
  reportData: ReportData;
  updateReportData: (updates: Partial<ReportData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isAiLoading: boolean;
  aiVerification: { status: AiVerificationStatus; message: string };
}

const MAX_FILES = 5;

const getPinchDistance = (touches: React.TouchList) => {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

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

  // No correction needed for orientation 1 (normal) or if not found/applicable.
  if (orientation <= 1) {
    return file;
  }
  
  // The entire logic is wrapped in a Promise that resolves from within the img.onload handler.
  // This is the most robust way to ensure all image data is ready before canvas operations.
  return new Promise((resolve) => {
    const dataUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(dataUrl); // Clean up the object URL as soon as it's loaded.
      try {
        // img.decode() is a good practice to ensure the image is fully decompressed.
        await img.decode();
      } catch (error) {
        console.error("Image decoding failed during orientation correction, returning original file.", error);
        resolve(file); // Return original file on decode error
        return;
      }
      
      // A critical guard clause to prevent drawing an image with no dimensions.
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        console.error("Cannot correct orientation for image with zero dimensions, returning original file.");
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

        // Swap dimensions for 90/270 degree rotations
        if (orientation >= 5 && orientation <= 8) {
          canvas.width = height;
          canvas.height = width;
        } else {
          canvas.width = width;
          canvas.height = height;
        }
        
        // Apply transformations based on orientation
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
        
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFileName = `${originalName}.jpg`;
            resolve(new File([blob], newFileName, { type: 'image/jpeg', lastModified: Date.now() }));
          } else {
            throw new Error("Canvas toBlob failed");
          }
        }, 'image/jpeg', 0.9);
      } catch (error) {
          console.error("Error during image orientation correction, returning original file:", error);
          resolve(file);
      }
    };

    img.onerror = () => {
        URL.revokeObjectURL(dataUrl);
        console.error("Image failed to load for orientation correction, returning original file.");
        resolve(file);
    };

    img.src = dataUrl;
  });
};


const Step2Photo: React.FC<Step2PhotoProps> = ({ reportData, updateReportData, nextStep, prevStep, isAiLoading, aiVerification }) => {
  const { t, language } = React.useContext(AppContext);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const [cameraError, setCameraError] = React.useState<string>('');
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const [isVideoReady, setIsVideoReady] = React.useState(false);

  const [isRecording, setIsRecording] = React.useState(false);
  const pressTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = React.useRef(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const recordedChunksRef = React.useRef<Blob[]>([]);

  // Zoom state
  const [zoom, setZoom] = React.useState(1);
  const [zoomCapabilities, setZoomCapabilities] = React.useState<any | null>(null);
  const initialPinchDistance = React.useRef(0);
  const currentZoomLevelOnPinchStart = React.useRef(1);


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
    setZoomCapabilities(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true, // Enable audio capture for video reports to send to Gemini.
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn("Camera video play() failed, benign in many cases.", e));
      }
      
      const tracks = stream.getVideoTracks();
      if (tracks.length > 0) {
        const track = tracks[0];
        const capabilities = track.getCapabilities();
        if ((capabilities as any).zoom) {
            setZoomCapabilities((capabilities as any).zoom);
            const currentSettings = track.getSettings();
            setZoom((currentSettings as any).zoom || 1);
        }
      }

      setIsInitialized(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError(t.cameraErrorFallback);
    }
  }, [stopStream, t.cameraErrorFallback]);

  React.useEffect(() => {
    initializeCamera();
    return () => stopStream();
  }, [initializeCamera, stopStream]);
  
  React.useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleVideoReady = () => {
      if (videoElement.readyState >= videoElement.HAVE_METADATA && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        setIsVideoReady(true);
      }
    };
    
    videoElement.addEventListener('playing', handleVideoReady);
    videoElement.addEventListener('loadeddata', handleVideoReady);
    videoElement.addEventListener('loadedmetadata', handleVideoReady);

    handleVideoReady();

    return () => {
      videoElement.removeEventListener('playing', handleVideoReady);
      videoElement.removeEventListener('loadeddata', handleVideoReady);
      videoElement.removeEventListener('loadedmetadata', handleVideoReady);
    };
  }, [isInitialized]);
  
  React.useEffect(() => {
      if(streamRef.current && zoomCapabilities) {
          const track = streamRef.current.getVideoTracks()[0];
          track.applyConstraints({ advanced: [{ zoom }] } as any);
      }
  }, [zoom, zoomCapabilities]);
  
  React.useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const preventZoom = (e: TouchEvent) => {
      // Prevent browser from zooming the page when user is pinching
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    element.addEventListener('touchmove', preventZoom, { passive: false });
    return () => {
      element.removeEventListener('touchmove', preventZoom);
    };
  }, []);


  const handleFiles = React.useCallback(async (files: FileList | File[] | null) => {
    if (!files) return;
    const filesArray = Array.from(files)
      .slice(0, MAX_FILES - reportData.previews.length);
      
    const processedFiles = await Promise.all(
        filesArray.map(async file => {
            if (file.type.startsWith('image/')) {
                try {
                    return await getCorrectedImageFile(file);
                } catch (error) {
                    console.error("Failed to correct image orientation, using original.", error);
                    return file;
                }
            }
            return file;
        })
    );
      
    const newPreviews = processedFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
        status: 'pending' as const,
      }));
    updateReportData({ previews: [...reportData.previews, ...newPreviews] });
  }, [reportData.previews, updateReportData]);
  
  const handleRemovePreview = (index: number) => {
    const previewToRemove = reportData.previews[index];
    if (previewToRemove) {
      URL.revokeObjectURL(previewToRemove.url);
    }
    const newPreviews = reportData.previews.filter((_, i) => i !== index);
    updateReportData({ previews: newPreviews });
  };

  const takePhoto = React.useCallback(() => {
    if (!videoRef.current || !isVideoReady) {
        console.error("Take photo failed: Video element or stream not ready.");
        return;
    }

    requestAnimationFrame(() => {
        const video = videoRef.current;
        // The main check is now inside the animation frame for maximum safety
        if (!video || video.readyState < 2 /* HAVE_CURRENT_DATA */) {
            console.error("Take photo failed inside rAF: Video not ready.");
            alert(t.failedToCapture);
            return;
        }

        // Capture dimensions in variables to prevent race conditions
        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width <= 0 || height <= 0) {
            console.error("Take photo failed inside rAF: Video dimensions are zero.");
            alert(t.failedToCapture);
            return;
        }
        
        try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error("Could not get canvas context.");
            }
            ctx.drawImage(video, 0, 0, width, height);
            canvas.toBlob(blob => {
              if (blob) {
                const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
                handleFiles([file]);
              } else {
                  console.error("Canvas toBlob failed, returned null.");
                  alert(t.failedToCapture);
              }
            }, 'image/jpeg', 0.9);
        } catch (error) {
            console.error("Error capturing photo from video stream:", error);
            alert(t.failedToCapture);
        }
    });
  }, [isVideoReady, handleFiles, t.failedToCapture]);

  const startRecording = React.useCallback(() => {
    if (!streamRef.current || isRecording) return;
    setIsRecording(true);
    recordedChunksRef.current = [];
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'];
    const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
    mediaRecorderRef.current = new MediaRecorder(streamRef.current, { mimeType: supportedMimeType });
    mediaRecorderRef.current.ondataavailable = event => {
      if (event.data.size > 0) recordedChunksRef.current.push(event.data);
    };
    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: supportedMimeType || 'video/webm' });
      if (blob.size === 0) {
        console.warn("Recording resulted in an empty video file. Discarding.");
        return;
      }
      const file = new File([blob], `video-${Date.now()}.webm`, { type: blob.type });
      handleFiles([file]);
    };
    mediaRecorderRef.current.start();
  }, [isRecording, handleFiles]);

  const stopRecording = React.useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, [isRecording]);

  const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isLongPress.current = false;
    pressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      startRecording();
    }, 250);
  };
  
  const handlePressEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (isLongPress.current) stopRecording();
    else takePhoto();
    isLongPress.current = false;
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLVideoElement>) => {
    if (e.touches.length === 2) {
        initialPinchDistance.current = getPinchDistance(e.touches);
        currentZoomLevelOnPinchStart.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLVideoElement>) => {
    if (e.touches.length === 2 && zoomCapabilities) {
        const newPinchDistance = getPinchDistance(e.touches);
        const pinchRatio = newPinchDistance / initialPinchDistance.current;
        const { min, max } = zoomCapabilities;
        let newZoom = currentZoomLevelOnPinchStart.current * pinchRatio;
        if (newZoom < min) newZoom = min;
        if (newZoom > max) newZoom = max;
        setZoom(newZoom);
    }
  };
  
  const BackIcon = language === 'ar' ? FaArrowRight : FaArrowLeft;
  const NextIcon = language === 'ar' ? FaArrowLeft : FaArrowRight;
  
  const AiStatusIcon = () => {
    if (aiVerification.status === 'pending') return <FaSpinner className="animate-spin" />;
    if (aiVerification.status === 'pass') return <FaCircleCheck className="text-teal" />;
    if (aiVerification.status === 'fail' || aiVerification.status === 'images_removed') return <FaTriangleExclamation className="text-mango" />;
    return <FaCircleInfo />;
  };

  const hasValidMedia = reportData.previews.some(p => p.status !== 'rejected');
  
  return (
    <div ref={containerRef} className="flex flex-col h-full w-full">
      <div className="relative flex-grow rounded-2xl bg-black overflow-hidden shadow-lg">
        {cameraError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gray-800 text-white">
            <FaVideoSlash className="text-4xl mb-4" />
            <h3 className="font-bold mb-2">{t.cameraAccessError}</h3>
            <p className="text-sm">{cameraError}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} />
            {!isVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <FaSpinner className="animate-spin text-white text-4xl" />
              </div>
            )}
          </>
        )}

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>

        <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
          {reportData.previews.length > 0 && (
            <div className="mb-4 space-y-2">
              <div className={`text-sm p-2 rounded-lg flex items-center gap-2 backdrop-blur-sm ${
                aiVerification.status === 'fail' || aiVerification.status === 'images_removed' ? 'bg-mango/20 text-white' : 'bg-black/20 text-white/90'
              }`}>
                <AiStatusIcon />
                <span className="font-semibold">{isAiLoading ? t.aiAnalyzing : aiVerification.message}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {reportData.previews.map((preview, index) => (
                  <div key={preview.url} className="relative w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 border-white/50">
                    {preview.type === 'video' ? (
                      <video src={preview.url} className="w-full h-full object-cover" muted loop playsInline />
                    ) : (
                      <img src={preview.url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    )}
                    {preview.status === 'rejected' && (
                        <div className="absolute inset-0 bg-coral/80 flex flex-col items-center justify-center text-white text-center p-1" title={preview.rejectionReason}>
                          <FaTriangleExclamation size={16}/>
                          <span className="text-[10px] font-bold mt-1 leading-tight">{t.aiRejectedShort}</span>
                        </div>
                    )}
                    <button onClick={() => handleRemovePreview(index)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5">
                      <FaTrash size={8} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center text-xs mb-4">
            <p>{t.tapForPhoto}</p>
            <p>{t.holdToRecord}</p>
          </div>

          <div className="flex items-center justify-around">
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={reportData.previews.length >= MAX_FILES}
                className="flex flex-col items-center gap-1 font-bold text-sm disabled:opacity-50"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><FaImages size={20} /></div>
              <span>{t.gallery}</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} accept="image/*,video/*" multiple className="hidden" />

            <button
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              disabled={!!cameraError || !isVideoReady || reportData.previews.length >= MAX_FILES}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed
                ${isRecording ? 'bg-coral animate-pulse ring-4 ring-coral/50' : 'bg-white shadow-xl ring-4 ring-white/50'}
              `}
            >
              <div className={`w-16 h-16 rounded-full bg-white transition-all duration-200 ${isRecording ? 'scale-50' : ''}`} />
            </button>

             <div className="w-12 h-12" />{/* Spacer */}
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 pt-4 w-full flex items-center justify-between">
            <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-text-secondary dark:text-text-secondary-dark bg-muted dark:bg-surface-dark rounded-full hover:bg-opacity-90">
              <BackIcon /> {t.backStep}
            </button>
            <button type="button" onClick={nextStep} disabled={!hasValidMedia} className="flex items-center gap-2 px-6 py-3 text-lg font-bold text-white bg-teal rounded-full hover:bg-opacity-90 disabled:bg-gray-500 disabled:cursor-not-allowed">
              {t.nextStep} <NextIcon />
            </button>
      </div>
    </div>
  );
};

export default Step2Photo;
