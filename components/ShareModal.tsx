import * as React from 'react';
import ReactDOMServer from 'react-dom/server';
import { AppContext } from '../contexts/AppContext';
import { Report, Theme } from '../types';
import { PATHS, translations } from '../constants';
import { buildReportUrl } from '../lib/urls';
import {
  FaDownload,
  FaLink,
  FaSpinner,
  FaCheck,
  FaXmark,
  FaMapLocationDot,
  FaShareNodes,
  FaMobileScreenButton,
} from 'react-icons/fa6';

interface ShareModalProps {
  report: Report;
  onClose: () => void;
}

// --- Helpers ---
async function copyText(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* ignore and try fallback */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.top = '0';
    ta.style.left = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File | null> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error('Error converting data URL to file:', error);
    return null;
  }
}

// --- Canvas Generation Logic ---

const generateShareImage = async (
  report: Report,
  translations: any,
  language: string,
  categories: any, // Pass the whole dynamic categories object
  canvasFonts: { sans: string; arabic: string }
): Promise<string> => {
  try {
    await Promise.all([
      document.fonts?.load?.(`bold 48px ${canvasFonts.arabic}`),
      document.fonts?.load?.(`bold 48px ${canvasFonts.sans}`),
      document.fonts?.load?.(`500 38px ${language === 'ar' ? canvasFonts.arabic : canvasFonts.sans}`),
      document.fonts?.load?.(`400 38px ${language === 'ar' ? canvasFonts.arabic : canvasFonts.sans}`),
      document.fonts?.load?.(`bold 72px ${language === 'ar' ? canvasFonts.arabic : canvasFonts.sans}`),
    ]);
  } catch (error) {
    console.warn('Could not load custom fonts for canvas; using fallback fonts.', error);
  }

  const title = language === 'ar' ? report.title_ar : report.title_en;
  const note = language === 'ar' ? report.note_ar : report.note_en;
  const categoryData = categories[report.category];
  const CategoryIconComponent = categoryData.icon;
  const categoryName = language === 'ar' ? categoryData.name_ar : categoryData.name_en;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject('Canvas context not available');

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = async () => {
      try {
        await img.decode();
      } catch (error) {
        reject(new Error(`Image decoding failed: ${error}`));
        return;
      }
      
      requestAnimationFrame(async () => {
        try {
          if (img.naturalHeight === 0 || img.naturalWidth === 0) {
            throw new Error('Image decoded but has zero dimensions.');
          }

          // 1) Background cover
          const hRatio = width / img.naturalWidth;
          const vRatio = height / img.naturalHeight;
          const ratio = Math.max(hRatio, vRatio);
          const cx = (width - img.naturalWidth * ratio) / 2;
          const cy = (height - img.naturalHeight * ratio) / 2;
          ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, cx, cy, img.naturalWidth * ratio, img.naturalHeight * ratio);

          // 2) Gradient overlay
          const grad = ctx.createLinearGradient(0, height, 0, 0);
          grad.addColorStop(0, 'rgba(0,0,0,0.75)');
          grad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          const padding = 60;
          
          // 3) Logo
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          const englishLogoText = translations.en.appTitle;
          ctx.font = `bold 48px ${canvasFonts.sans}`;
          const englishMetrics = ctx.measureText(englishLogoText);
          ctx.fillText(englishLogoText, padding, padding);
          
          const arabicLogoText = translations.ar.appTitle;
          ctx.font = `bold 48px ${canvasFonts.arabic}`;
          ctx.fillText(arabicLogoText, padding + englishMetrics.width + 10, padding);


          // 4) Icon Drawing Helper
          const drawIcon = async (iconComponent: React.ElementType, x: number, y: number, size: number, color: string) => {
              const iconSvgString = ReactDOMServer.renderToString(React.createElement(iconComponent, { color, size }));
              const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(iconSvgString)))}`;
              const iconImg = new Image();
              await new Promise<void>((resolve, reject) => {
                  iconImg.onload = () => { ctx.drawImage(iconImg, x, y); resolve(); };
                  iconImg.onerror = reject;
                  iconImg.src = dataUrl;
              });
          };

          // Draw bottom-up
          let currentY = height - padding;
          ctx.textBaseline = 'bottom';
          const iconSize = 38;
          const iconTextSpacing = 12;
          const metadataSpacing = 24;

          // 5) Metadata Line (Category • Area)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.font = `500 ${iconSize}px ${language === 'ar' ? canvasFonts.arabic : canvasFonts.sans}`;
          ctx.textAlign = 'left';

          let currentX = padding;
          await drawIcon(CategoryIconComponent, currentX, currentY - iconSize, iconSize, '#fff');
          currentX += iconSize + iconTextSpacing;
          
          ctx.fillText(categoryName, currentX, currentY);
          currentX += ctx.measureText(categoryName).width + metadataSpacing;

          ctx.fillText('•', currentX, currentY);
          currentX += ctx.measureText('•').width + metadataSpacing;

          await drawIcon(FaMapLocationDot, currentX, currentY - iconSize, iconSize, '#fff');
          currentX += iconSize + iconTextSpacing;

          ctx.fillText(report.area, currentX, currentY);
          
          currentY -= (iconSize + 40);

          // 6) Description (max 3 lines)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = `400 38px ${language === 'ar' ? canvasFonts.arabic : canvasFonts.sans}`;
          const descriptionLines = wrapText(ctx, note, width - padding * 2).slice(0, 3);
          for (let i = descriptionLines.length - 1; i >= 0; i--) {
            ctx.fillText(descriptionLines[i], padding, currentY);
            currentY -= 48;
          }
          currentY -= 30;

          // 7) Title
          ctx.fillStyle = '#FFFFFF';
          ctx.font = `bold 72px ${language === 'ar' ? canvasFonts.arabic : canvasFonts.sans}`;
          const titleLines = wrapText(ctx, title, width - padding * 2);
          for (let i = titleLines.length - 1; i >= 0; i--) {
            ctx.fillText(titleLines[i], padding, currentY);
            currentY -= 82;
          }

          resolve(canvas.toDataURL('image/png'));
        } catch (err) {
          console.error("Canvas drawing failed:", err);
          reject(new Error('Failed to draw image on canvas.'));
        }
      });
    };
    img.onerror = () => reject(new Error('Failed to load image for canvas'));
    img.src = report.photo_urls[0];
  });
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
  const words = (text || '').split(' ');
  const lines: string[] = [];
  let line = words[0] ?? '';
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const w = ctx.measureText(line + ' ' + word).width;
    if (w < maxWidth) line += ' ' + word;
    else { lines.push(line); line = word; }
  }
  lines.push(line);
  return lines;
};

// ---- Component ----

const ShareModal: React.FC<ShareModalProps> = ({ report, onClose }) => {
  const { t, language, theme, categories } = React.useContext(AppContext);
  const [isCopied, setIsCopied] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showFallbackMessage, setShowFallbackMessage] = React.useState(false);
  const categoryData = categories[report.category];
  const CategoryIcon = categoryData.icon;
  const categoryColor = theme === 'dark' ? categoryData.color.dark : categoryData.color.light;
  const categoryName = categoryData ? (language === 'ar' ? categoryData.name_ar : categoryData.name_en) : '';

  const title = language === 'ar' ? report.title_ar : report.title_en;
  const note = language === 'ar' ? report.note_ar : report.note_en;

  const downloadGeneratedImage = async () => {
    const canvasFonts = { sans: '"Inter", "Rubik", sans-serif', arabic: '"Cairo", sans-serif' };
    const dataUrl = await generateShareImage(report, translations, language, categories, canvasFonts);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `mshkltk-report-${report.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try { await downloadGeneratedImage(); }
    catch (err) { console.error('Failed to generate or download image:', err); }
    finally { setIsGenerating(false); }
  };

  const handleShare = async () => {
    const reportUrl = buildReportUrl(PATHS.REPORT_DETAILS, report.id);
    setIsGenerating(true);

    let shareFile: File | null = null;
    try {
      const canvasFonts = { sans: '"Inter", "Rubik", sans-serif', arabic: '"Cairo", sans-serif' };
      const dataUrl = await generateShareImage(report, translations, language, categories, canvasFonts);
      shareFile = await dataUrlToFile(dataUrl, `mshkltk-report-${report.id}.png`);
    } catch (error) {
      console.error('Failed to generate image for sharing:', error);
      setIsGenerating(false);
      return;
    }

    if (!shareFile) { setIsGenerating(false); return; }

    const shareData: any = {
      title: `Mshkltk Report: ${title}`,
      text: `${note}\n\nView the report on Mshkltk: ${reportUrl}`,
      files: [shareFile],
    };

    const nav: any = navigator;
    const canWebShareFiles = typeof nav.share === 'function' &&
      (typeof nav.canShare === 'function' ? nav.canShare({ files: [shareFile] }) : true);

    if (canWebShareFiles) {
      setIsGenerating(false);
      try { await nav.share(shareData); }
      catch (err: any) {
        if (err?.name !== 'AbortError') console.error('Web Share failed:', err);
      }
    } else {
      try {
        await downloadGeneratedImage();
        setShowFallbackMessage(true);
      } catch (error) {
        console.error('Download fallback failed', error);
      } finally {
        setIsGenerating(false);
      }
    }
  };

  const handleCopy = async () => {
    const ok = await copyText(buildReportUrl(PATHS.REPORT_DETAILS, report.id));
    if (ok) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (showFallbackMessage) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm" onClick={onClose}>
        <div className="bg-card dark:bg-surface-dark rounded-2xl p-8 w-full max-w-md m-4 flex flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
          <FaMobileScreenButton className="text-5xl text-teal dark:text-teal-dark mb-4" />
          <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-2">Image Saved!</h2>
          <p className="text-text-secondary dark:text-text-secondary-dark mb-6">
            The shareable image has been saved. You can now open your favorite app and share it from your gallery or downloads.
          </p>
          <button onClick={onClose} className="w-full px-4 py-3 bg-teal text-white font-bold rounded-full hover:bg-opacity-90">OK</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-md m-4 flex flex-col items-center relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark">
          <FaXmark size={20} />
        </button>
        <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-4">{t.share}</h2>

        {/* Preview */}
        <div className="w-full aspect-square rounded-xl overflow-hidden shadow-lg mb-6 relative bg-muted dark:bg-bg-dark">
          <img src={report.photo_urls[0]} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute top-4 left-4 text-white font-bold text-2xl drop-shadow-lg flex items-center gap-2">
            <span className="font-display">Mshkltk</span>
            <span className="font-arabic">مشكلتك</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white drop-shadow-lg">
            <h3 className="font-bold text-2xl line-clamp-2 mb-1">{title}</h3>
            <p className="text-xs opacity-90 line-clamp-2 mb-2">{note}</p>
            <div className="flex items-center gap-2 text-sm opacity-80">
              <CategoryIcon style={{ color: categoryColor }} /><span>{categoryName}</span><span className="mx-1">&bull;</span><FaMapLocationDot /><span>{report.area}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full grid grid-cols-3 gap-4">
          <button onClick={handleDownload} disabled={isGenerating} className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 bg-navy/10 dark:bg-sand/10 text-navy dark:text-sand font-bold rounded-xl hover:bg-opacity-80 disabled:opacity-50">
            {isGenerating ? <FaSpinner className="animate-spin h-5 w-5" /> : <FaDownload className="h-5 w-5" />}
            <span className="text-xs">{t.downloadImage}</span>
          </button>

          <button onClick={handleShare} disabled={isGenerating} className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 bg-teal text-white font-bold rounded-xl hover:bg-opacity-90 disabled:opacity-50">
            {isGenerating ? <FaSpinner className="animate-spin h-5 w-5" /> : <FaShareNodes className="h-5 w-5" />}
            <span className="text-xs">{t.share}</span>
          </button>

          <button onClick={handleCopy} className="flex flex-col items-center justify-center gap-1.5 px-2 py-3 bg-navy/10 dark:bg-sand/10 text-navy dark:text-sand font-bold rounded-xl hover:bg-opacity-80">
            {isCopied ? <FaCheck className="h-5 w-5" /> : <FaLink className="h-5 w-5" />}
            <span className="text-xs">{isCopied ? t.linkCopied : t.copyLink}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;