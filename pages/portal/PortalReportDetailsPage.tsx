import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { PortalContext } from '../../contexts/PortalContext';
import { AppContext } from '../../contexts/AppContext';
import { Report, Theme, ReportStatus, Comment, ReportHistory, User, ReportSeverity } from '../../types';
import { STATUS_COLORS, TILE_URLS } from '../../constants';
import { FaArrowLeft, FaArrowRight, FaCircleCheck, FaRegCommentDots, FaClockRotateLeft, FaMapLocationDot, FaCity, FaGlobe, FaPaperPlane, FaSpinner, FaLandmark, FaCamera, FaFlag } from 'react-icons/fa6';
import { ReportDetailsSkeleton } from '../../components/SkeletonLoader';
import { createCategoryIcon } from '../../utils/mapUtils';
import Lightbox from '../../components/Lightbox';
import ResolutionProofModal from '../../components/portal/ResolutionProofModal';

const SeverityIndicator: React.FC<{ severity: ReportSeverity; className?: string }> = ({ severity, className = '' }) => {
    const severityMap = {
        [ReportSeverity.High]: { text: '!!!', title: 'High' },
        [ReportSeverity.Medium]: { text: '!!', title: 'Medium' },
        [ReportSeverity.Low]: { text: '!', title: 'Low' },
    };
    const { text, title } = severityMap[severity] || severityMap.low;
    
    return (
        <span className={`font-black text-lg text-coral dark:text-coral-dark ${className}`} title={`Severity: ${title}`}>
            {text}
        </span>
    );
};

const StatusPill: React.FC<{ status: Report['status'] }> = ({ status }) => {
  const { t, theme } = React.useContext(AppContext);
  const colorClasses = theme === 'dark' ? STATUS_COLORS[status].dark : STATUS_COLORS[status].light;
  return (
    <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${colorClasses}`}>
      {t[status]}
    </span>
  );
};

const MediaGrid: React.FC<{ report: Report; onMediaClick: (index: number) => void }> = ({ report, onMediaClick }) => {
    const { t } = React.useContext(AppContext);
    const urls = report.photo_urls;
    if (!urls || urls.length === 0) return null;

    const renderMedia = (index: number, className: string = '') => {
        const url = urls[index];
        const isVideo = url.startsWith('data:video/');
        const isProofMedia = report.status === ReportStatus.Resolved && urls.length > 1 && index === urls.length - 1;

        return (
            <div key={index} className={`relative overflow-hidden rounded-lg group cursor-pointer ${className}`} onClick={() => onMediaClick(index)}>
                {isVideo ? (
                    <video src={url} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                ) : (
                    <img src={url} alt={`Report media ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                 {isProofMedia && (
                    <div className="absolute bottom-2 left-2 bg-teal text-white px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 z-10 shadow-lg">
                        <FaCircleCheck />
                        <span>{t.resolutionProof}</span>
                    </div>
                )}
            </div>
        );
    }

    const layoutClasses = "grid gap-2 h-96";

    switch (urls.length) {
        case 1: return <div className="h-96 rounded-xl overflow-hidden shadow-lg">{renderMedia(0)}</div>;
        case 2: return <div className={`${layoutClasses} grid-cols-2`}>{urls.map((_, i) => renderMedia(i))}</div>;
        case 3: return <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>{renderMedia(0, 'row-span-2')}{renderMedia(1)}{renderMedia(2)}</div>;
        case 4: return <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>{urls.map((_, i) => renderMedia(i))}</div>;
        default:
            return (
                <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>
                    {renderMedia(0)}{renderMedia(1)}{renderMedia(2)}
                    <div className="relative overflow-hidden rounded-lg group cursor-pointer" onClick={() => onMediaClick(3)}>
                        {urls[3].startsWith('data:video/') ? (
                             <video src={urls[3]} className="w-full h-full object-cover" muted loop playsInline autoPlay />
                        ) : (
                            <img src={urls[3]} alt={`Report media 4`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white text-4xl font-bold">+{urls.length - 3}</span></div>
                    </div>
                </div>
            );
    }
};

const StatusTimeline: React.FC = () => {
    const { t, language } = React.useContext(AppContext);
    const { reportHistory } = React.useContext(PortalContext);

    const getStatusIcon = (status: ReportStatus) => {
        switch (status) {
            case ReportStatus.New: return <FaFlag />;
            case ReportStatus.InProgress: return <FaSpinner className="animate-spin" />;
            case ReportStatus.Resolved: return <FaCircleCheck />;
            default: return <FaClockRotateLeft />;
        }
    };

    return (
        <div className="bg-muted dark:bg-bg-dark p-6 rounded-2xl h-full">
            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-4 flex items-center gap-2"><FaClockRotateLeft /> {t.statusTimeline}</h3>
            <div className="relative pl-6 border-l-2 border-border-light dark:border-border-dark">
                {reportHistory.map(item => {
                    const message = item.status === ReportStatus.New
                        ? t.reportCreated
                        : item.updated_by_name
                        ? t.statusChangedBy.replace('{newStatus}', `"${t[item.status]}"`).replace('{actorName}', item.updated_by_name)
                        : `${t.statusChangedTo} "${t[item.status]}"`;
                    
                    return (
                        <div key={item.id} className="mb-6 last:mb-0">
                            <div className="absolute -left-[11px] w-5 h-5 bg-teal dark:bg-teal-dark rounded-full flex items-center justify-center text-white">
                                {getStatusIcon(item.status)}
                            </div>
                            <p className="font-bold text-navy dark:text-text-primary-dark">{message}</p>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">{new Date(item.updated_at).toLocaleString(language === 'ar' ? 'ar-LB' : 'en-US')}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CommentsSection: React.FC<{ report: Report }> = ({ report }) => {
    const { t } = React.useContext(AppContext);
    const { comments, currentUser, addCommentForReport } = React.useContext(PortalContext);
    const [newComment, setNewComment] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;
        setIsPosting(true);
        try {
            await addCommentForReport(report.id, newComment);
            setNewComment('');
        } catch(error) {
            console.error("Failed to post comment", error);
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="bg-muted dark:bg-bg-dark p-6 rounded-2xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-4 flex items-center gap-2"><FaRegCommentDots/> {t.comments}</h3>
            <div className="flex-grow space-y-4 overflow-y-auto max-h-96 pr-2">
                {comments.length > 0 ? comments.map(comment => {
                    const isMunicipality = comment.user.role === 'municipality';
                    return (
                        <div key={comment.id} className="flex items-start gap-3">
                            <img src={comment.user.avatarUrl} alt={comment.user.display_name} className="w-10 h-10 rounded-full flex-shrink-0" />
                            <div className={`p-3 rounded-xl w-full ${isMunicipality ? 'bg-sky/10 dark:bg-cyan-dark/10 border border-sky/50 dark:border-cyan-dark/50' : 'bg-card dark:bg-surface-dark'}`}>
                                <div className="flex items-baseline justify-between">
                                    <p className="font-bold text-sm text-navy dark:text-text-primary-dark">{comment.user.display_name}</p>
                                    {isMunicipality && <span className="text-xs font-bold text-sky dark:text-cyan-dark bg-sky/20 dark:bg-cyan-dark/20 px-2 py-0.5 rounded-full flex items-center gap-1"><FaLandmark size={10}/> Municipality</span>}
                                </div>
                                <p className="text-sm text-text-primary dark:text-text-primary-dark mt-1">{comment.text}</p>
                                <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2 text-right">{new Date(comment.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )
                }) : <p className="text-center text-text-secondary dark:text-text-secondary-dark py-8">{t.noCommentsYet}</p>}
            </div>
            <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center gap-2 pt-4 border-t border-border-light dark:border-border-dark">
                <img src={currentUser?.avatarUrl} alt="Your avatar" className="w-10 h-10 rounded-full" />
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t.addComment}
                    rows={1}
                    className="flex-grow p-2 bg-card dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-full resize-none focus:ring-2 focus:ring-teal-dark"
                />
                <button type="submit" disabled={isPosting || !newComment.trim()} className="p-3 bg-teal-dark text-white rounded-full disabled:bg-gray-600">
                    {isPosting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                </button>
            </form>
        </div>
    );
};

const MiniMap: React.FC<{ report: Report }> = ({ report }) => {
    const { theme } = React.useContext(AppContext);
    const { categories } = React.useContext(PortalContext);
    const mapContainer = React.useRef<HTMLDivElement>(null);
    const mapRef = React.useRef<L.Map | null>(null);
    const tileLayerRef = React.useRef<L.TileLayer | null>(null);
    const markerRef = React.useRef<L.Marker | null>(null);

    React.useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;
        
        const map = L.map(mapContainer.current, {
            center: [report.lat, report.lng],
            zoom: 15,
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            touchZoom: false,
            doubleClickZoom: false,
            scrollWheelZoom: false,
            boxZoom: false,
            keyboard: false,
        });
        mapRef.current = map;

        tileLayerRef.current = L.tileLayer(TILE_URLS.light).addTo(map);
        markerRef.current = L.marker([report.lat, report.lng]).addTo(map);

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [report.lat, report.lng]);

    React.useEffect(() => {
        const tileLayer = tileLayerRef.current;
        if (tileLayer) {
            const tilePane = tileLayer.getContainer();
            if (tilePane) {
                if (theme === Theme.DARK) {
                    // Lighter land, more vibrant water
                    tilePane.style.filter = 'invert(100%) hue-rotate(180deg) brightness(110%) contrast(90%) saturate(150%)';
                } else {
                    // Darker land, richer colors
                    tilePane.style.filter = 'brightness(95%) contrast(105%) saturate(105%)';
                }
            }
        }
        
        const marker = markerRef.current;
        if (marker) {
            marker.setIcon(createCategoryIcon(report.category, theme, categories));
        }
    }, [theme, report.category, categories]);


    return <div ref={mapContainer} className="h-full w-full" />;
};


const PortalReportDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, language, flyToLocation, theme } = React.useContext(AppContext);
  const { reports, users, loading, fetchCommentsForReport, fetchHistoryForReport, updateReportStatus, resolveReportWithProof, categories } = React.useContext(PortalContext);
  const [lightboxState, setLightboxState] = React.useState<{ isOpen: boolean, startIndex: number }>({ isOpen: false, startIndex: 0 });
  const [isCopied, setIsCopied] = React.useState(false);
  const [resolvingReport, setResolvingReport] = React.useState<Report | null>(null);
  const navigate = useNavigate();

  const report = React.useMemo(() => reports.find(r => r.id === id), [reports, id]);
  
  const creator = React.useMemo(() => {
    if (!report || !users) return null;
    return users.find(u => u.id === report.created_by);
  }, [report, users]);
  
  React.useEffect(() => {
    if (id) {
      fetchCommentsForReport(id);
      fetchHistoryForReport(id);
    }
  }, [id, fetchCommentsForReport, fetchHistoryForReport]);

  const handleViewOnMap = () => {
    if (!report) return;
    flyToLocation([report.lat, report.lng], 16);
    navigate('/portal/map');
  };

  const handleCopyId = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.id).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  };

  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!report) return;
    if (newStatus === ReportStatus.Resolved) {
        setResolvingReport(report);
    } else {
        await updateReportStatus(report.id, newStatus);
    }
  };

  const handleResolutionSubmit = async (photoUrl: string) => {
      if (resolvingReport) {
          await resolveReportWithProof(resolvingReport.id, photoUrl);
          setResolvingReport(null);
      }
  };

  const getNextStatusAction = (): { label: string, action: () => void, status: ReportStatus } | null => {
      if (!report) return null;
      switch (report.status) {
          case ReportStatus.New:
              return { label: t.markAsReceived, action: () => handleStatusChange(ReportStatus.Received), status: ReportStatus.Received };
          case ReportStatus.Received:
              return { label: t.startInvestigation, action: () => handleStatusChange(ReportStatus.InProgress), status: ReportStatus.InProgress };
          case ReportStatus.InProgress:
              return { label: t.markAsResolved, action: () => handleStatusChange(ReportStatus.Resolved), status: ReportStatus.Resolved };
          default:
              return null;
      }
  };
  const nextAction = getNextStatusAction();

  if (loading) return <ReportDetailsSkeleton />;
  if (!report) return <div className="text-center text-text-secondary dark:text-text-secondary-dark py-10">Report not found.</div>;

  const categoryData = categories[report.category];
  const CategoryIcon = categoryData.icon;
  const categoryColor = theme === 'dark' ? categoryData.color.dark : categoryData.color.light;
  const backButtonDirection = language === 'ar' ? <FaArrowRight /> : <FaArrowLeft />;
  
  const categoryName = categoryData ? (language === 'ar' ? categoryData.name_ar : categoryData.name_en) : '';
  const subCategoryData = categoryData && report.sub_category ? categoryData.subCategories[report.sub_category] : null;
  const subCategoryName = subCategoryData ? (language === 'ar' ? subCategoryData.name_ar : subCategoryData.name_en) : '';

  const title = language === 'ar' ? report.title_ar : report.title_en;
  const note = language === 'ar' ? report.note_ar : report.note_en;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/portal/reports" className="inline-flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-cyan-dark mb-4">
        {backButtonDirection}
        <span>{t.reports}</span>
      </Link>
      {lightboxState.isOpen && <Lightbox mediaUrls={report.photo_urls} startIndex={lightboxState.startIndex} onClose={() => setLightboxState({isOpen: false, startIndex: 0})} />}
      {resolvingReport && (
          <ResolutionProofModal
              report={resolvingReport}
              onClose={() => setResolvingReport(null)}
              onSubmit={handleResolutionSubmit}
          />
      )}

      <div className="bg-card dark:bg-surface-dark p-4 sm:p-6 rounded-2xl shadow-md">
        <MediaGrid report={report} onMediaClick={(idx) => setLightboxState({isOpen: true, startIndex: idx})} />
        <div className="mt-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <div className="flex items-center gap-3 text-lg font-bold text-navy dark:text-text-primary-dark">
              <SeverityIndicator severity={report.severity} className="text-2xl" />
              <CategoryIcon className="w-6 h-6" style={{ color: categoryColor }}/>
              <div>
                <span>{categoryName}</span>
                {subCategoryName && <span className="text-sm font-normal text-text-secondary dark:text-text-secondary-dark block">{subCategoryName}</span>}
              </div>
            </div>
            <StatusPill status={report.status} />
          </div>
          
          <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark">{title}</h1>
          <button onClick={handleCopyId} className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-muted dark:bg-bg-dark text-text-secondary dark:text-text-secondary-dark rounded-full text-sm font-mono hover:bg-gray-200 dark:hover:bg-border-dark transition-colors">
            {t.ticketNumber}{report.id}
            <span className={`transition-opacity duration-300 ${isCopied ? 'opacity-100' : 'opacity-0'}`}>
                {isCopied ? ` - ${t.copied}` : ''}
            </span>
          </button>
          
          <p className="mt-4 text-text-primary dark:text-text-primary-dark text-base leading-relaxed">{note}</p>
          <div className="border-t border-border-light dark:border-border-dark my-6"></div>

          {creator && (
            <>
              <div className="flex items-center gap-3 p-3 bg-muted dark:bg-bg-dark rounded-xl">
                <img src={creator.avatarUrl} alt={creator.display_name} className="w-10 h-10 rounded-full"/>
                <div><p className="text-xs text-text-secondary dark:text-text-secondary-dark">Reported by</p><p className="font-bold text-navy dark:text-text-primary-dark">{creator.display_name}</p></div>
              </div>
              <div className="border-t border-border-light dark:border-border-dark my-6"></div>
            </>
          )}
          
          <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-4">{t.actions}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nextAction ? (
                  <button
                      onClick={nextAction.action}
                      className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-teal text-white text-md font-bold rounded-full shadow-lg hover:bg-opacity-90 transform hover:scale-105 transition-transform"
                  >
                      <FaArrowRight /> {nextAction.label}
                  </button>
              ) : (
                  <div className="flex items-center justify-center gap-2 p-3 bg-muted dark:bg-bg-dark rounded-full text-text-secondary dark:text-text-secondary-dark font-semibold">
                      <FaCircleCheck /> {t.reportIsResolved}
                  </div>
              )}
          </div>
          <div className="border-t border-border-light dark:border-border-dark my-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark">{t.location}</h3>
              <button onClick={handleViewOnMap} className="w-full text-left p-3 bg-muted dark:bg-bg-dark rounded-xl hover:shadow-md transition-shadow space-y-2">
                  <p className="text-text-secondary dark:text-text-secondary-dark">{report.area}</p>
                  <div className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2">
                      <FaCity className="flex-shrink-0 h-4 w-4 text-teal dark:text-teal-dark" />
                      <span className="capitalize">
                          <span className="font-bold text-navy dark:text-text-primary-dark">{t.municipality}: </span>{report.municipality}
                      </span>
                  </div>
                   <div className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2">
                      <FaGlobe className="flex-shrink-0 h-4 w-4 text-teal dark:text-teal-dark" />
                      <span className="font-mono">
                          Lat: {report.lat.toFixed(5)}, Lng: {report.lng.toFixed(5)}
                      </span>
                  </div>
              </button>
              <div className="h-64 rounded-xl overflow-hidden relative z-0 group cursor-pointer" onClick={handleViewOnMap}><MiniMap report={report} /><div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"><div className="p-4 bg-white/80 dark:bg-black/80 rounded-full text-navy dark:text-white backdrop-blur-sm"><FaMapLocationDot className="h-8 w-8" /></div></div></div>
            </div>
            <div className="flex flex-col items-center justify-center bg-muted dark:bg-bg-dark p-6 rounded-xl text-center"><FaCircleCheck className="text-5xl text-mango dark:text-mango-dark mb-3"/><p className="text-3xl font-bold text-navy dark:text-text-primary-dark">{report.confirmations_count}</p><p className="text-text-secondary dark:text-text-secondary-dark">{t.confirmations}</p></div>
          </div>
          <div className="border-t border-border-light dark:border-border-dark my-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StatusTimeline />
            <CommentsSection report={report} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalReportDetailsPage;