import React from 'react';
import ReactDOM from 'react-dom';
import { FaXmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { AppContext } from '../contexts/AppContext';

interface LightboxProps {
  mediaUrls: string[];
  startIndex?: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ mediaUrls, startIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = React.useState(startIndex);
  const { language } = React.useContext(AppContext);

  const prevMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
  };
  
  const nextMedia = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(prev => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevMedia();
      if (e.key === 'ArrowRight') nextMedia();
    };
    
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  const lightboxRoot = document.getElementById('lightbox-root');
  if (!lightboxRoot) return null;
  
  const PrevIcon = language === 'ar' ? FaChevronRight : FaChevronLeft;
  const NextIcon = language === 'ar' ? FaChevronLeft : FaChevronRight;

  const currentUrl = mediaUrls[currentIndex];
  const isVideo = currentUrl.startsWith('data:video/');

  return ReactDOM.createPortal(
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2000] backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <FaXmark size={32} />
      </button>
      
      {mediaUrls.length > 1 && (
        <button 
          onClick={prevMedia}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white rounded-full transition-colors"
          aria-label="Previous media"
        >
          <PrevIcon size={24} />
        </button>
      )}

      <div className="relative w-full h-full flex items-center justify-center p-16" onClick={(e) => e.stopPropagation()}>
          {isVideo ? (
              <video
                  key={currentUrl} // Add key to force re-render on source change
                  src={currentUrl} 
                  controls
                  autoPlay
                  className="max-w-full max-h-full object-contain"
              />
          ) : (
              <img 
                  src={currentUrl} 
                  alt={`Report media ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
              />
          )}
      </div>

      {mediaUrls.length > 1 && (
        <button 
          onClick={nextMedia}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white rounded-full transition-colors"
          aria-label="Next media"
        >
          <NextIcon size={24} />
        </button>
      )}

      {mediaUrls.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 bg-black/30 px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {mediaUrls.length}
          </div>
      )}
    </div>,
    lightboxRoot
  );
};

export default Lightbox;