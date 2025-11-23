import React from 'react';
import ReactDOM from 'react-dom';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import { AppContext } from '../contexts/AppContext';
import { Report, Theme, ReportStatus, Comment, ReportHistory, User, ReportSeverity } from '../types';
import { STATUS_COLORS, PATHS, TILE_URLS } from '../constants';
import { FaArrowLeft, FaArrowRight, FaCircleCheck, FaChevronLeft, FaChevronRight, FaRegCommentDots, FaClockRotateLeft, FaPaperPlane, FaSpinner, FaFlag, FaShareNodes, FaMapLocationDot, FaBell, FaBellSlash, FaCity, FaGlobe, FaUserPen, FaLandmark } from 'react-icons/fa6';
import ShareModal from '../components/ShareModal';
import { ReportDetailsSkeleton, Shimmer } from '../components/SkeletonLoader';
import { createCategoryIcon } from '../utils/mapUtils';
import Lightbox from '../components/Lightbox';
import * as api from '../services/api';

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
                    <video src={url} className="w-full h-full object-cover" playsInline />
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
        case 1:
            return (
                <div className="h-96 rounded-xl overflow-hidden shadow-lg">
                    {renderMedia(0)}
                </div>
            );
        case 2:
            return (
                <div className={`${layoutClasses} grid-cols-2`}>
                    {renderMedia(0)}
                    {renderMedia(1)}
                </div>
            );
        case 3:
            return (
                <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>
                    {renderMedia(0, 'row-span-2')}
                    {renderMedia(1)}
                    {renderMedia(2)}
                </div>
            );
        case 4:
            return (
                <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>
                    {renderMedia(0)}
                    {renderMedia(1)}
                    {renderMedia(2)}
                    {renderMedia(3)}
                </div>
            );
        default: // 5+ media
            return (
                <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>
                    {renderMedia(0)}
                    {renderMedia(1)}
                    {renderMedia(2)}
                    <div className="relative overflow-hidden rounded-lg group cursor-pointer" onClick={() => onMediaClick(3)}>
                        {urls[3].startsWith('data:video/') ? (
                            <video src={urls[3]} className="w-full h-full object-cover" playsInline />
                        ) : (
                            <img src={urls[3]} alt={`Report media 4`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                        )}
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white text-4xl font-bold">+{urls.length - 3}</span>
                        </div>
                    </div>
                </div>
            );
    }
};

const StatusTimeline: React.FC<{ report: Report }> = ({ report }) => {
    const { t, reportHistory, language } = React.useContext(AppContext);

    const getStatusIcon = (status: ReportStatus) => {
        switch (status) {
            case ReportStatus.New: return <FaFlag />;
            case ReportStatus.InProgress: return <FaSpinner {...({ className: "animate-spin" } as any)} />;
            case ReportStatus.Resolved: return <FaCircleCheck />;
            default: return <FaClockRotateLeft />;
        }
    };

    if (report.isPending) {
        return (
            <div className="bg-muted dark:bg-bg-dark p-6 rounded-2xl h-full flex flex-col items-center justify-center text-center">
                <FaClockRotateLeft {...({ className: "text-4xl text-text-secondary dark:text-text-secondary-dark mb-4" } as any)} />
                <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-2">{t.statusTimeline}</h3>
                <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t.pending_sync_message}</p>
            </div>
        );
    }

    return (
        <div className="bg-muted dark:bg-bg-dark p-6 rounded-2xl h-full">
            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-4 flex items-center gap-2">
                <FaClockRotateLeft /> {t.statusTimeline}
            </h3>
            <div className="relative pl-6 border-l-2 border-border-light dark:border-border-dark">
                {reportHistory.map((item, index) => {
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
                            <p className="font-bold text-navy dark:text-text-primary-dark">
                                {message}
                            </p>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
                                {new Date(item.updated_at).toLocaleString(language === 'ar' ? 'ar-LB' : 'en-US')}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const CommentsSection: React.FC<{ report: Report }> = ({ report }) => {
    const { t, comments, currentUser, addComment } = React.useContext(AppContext);
    const [newComment, setNewComment] = React.useState('');
    const [isPosting, setIsPosting] = React.useState(false);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;
        setIsPosting(true);
        try {
            await addComment(report.id, newComment);
            setNewComment('');
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setIsPosting(false);
        }
    }

    const canComment = !report.isPending;
    const isAnonymous = !currentUser || !!currentUser.is_anonymous;

    return (
        <div className="bg-muted dark:bg-bg-dark p-6 rounded-2xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-4 flex items-center gap-2">
                <FaRegCommentDots /> {t.comments}
            </h3>
            <div className="flex-grow space-y-4 pr-2">
                {comments.length > 0 ? comments.map(comment => {
                    const isMunicipality = comment.user?.role === 'municipality';
                    return (
                        <div key={comment.id} className="flex items-start gap-3">
                            <img src={comment.user?.avatarUrl} alt={comment.user?.display_name} className="w-10 h-10 rounded-full flex-shrink-0" />
                            <div className={`p-3 rounded-xl w-full ${isMunicipality ? 'bg-sky/10 dark:bg-cyan-dark/10 border border-sky/50 dark:border-cyan-dark/50' : 'bg-card dark:bg-surface-dark'}`}>
                                <div className="flex items-baseline justify-between">
                                    <p className="font-bold text-sm text-navy dark:text-text-primary-dark">{comment.user?.display_name}</p>
                                    {isMunicipality && <span className="text-xs font-bold text-sky dark:text-cyan-dark bg-sky/20 dark:bg-cyan-dark/20 px-2 py-0.5 rounded-full flex items-center gap-1"><FaLandmark size={10} /> Municipality</span>}
                                </div>
                                <p className="text-sm text-text-primary dark:text-text-primary-dark mt-1">{comment.text}</p>
                                <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2 text-right">{new Date(comment.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    );
                }) : <p className="text-center text-text-secondary dark:text-text-secondary-dark py-8">{t.noCommentsYet}</p>}
            </div>
            {canComment && !isAnonymous && (
                <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center gap-2 pt-4 border-t border-border-light dark:border-border-dark">
                    <img src={currentUser?.avatarUrl} alt="Your avatar" className="w-10 h-10 rounded-full" />
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t.addComment}
                        rows={1}
                        className="flex-grow p-2 bg-card dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full resize-none focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark"
                    />
                    <button type="submit" disabled={isPosting || !newComment.trim()} className="p-3 bg-teal text-white rounded-full disabled:bg-gray-400">
                        {isPosting ? <FaSpinner {...({ className: "animate-spin" } as any)} /> : <FaPaperPlane />}
                    </button>
                </form>
            )}
            {canComment && isAnonymous && (
                <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                    <div className="flex flex-col items-center gap-3 p-4 bg-teal/10 dark:bg-teal-dark/10 rounded-xl border-2 border-dashed border-teal dark:border-teal-dark">
                        <FaUserPen {...({ className: "text-3xl text-teal dark:text-teal-dark" } as any)} />
                        <p className="text-center font-semibold text-navy dark:text-text-primary-dark">
                            {t.signUpToComment || "Sign up to leave a comment"}
                        </p>
                        <Link
                            to={PATHS.AUTH_LOGIN}
                            className="px-6 py-2 bg-teal text-white font-bold rounded-full hover:bg-opacity-90 transition-all"
                        >
                            {t.signUp || "Sign Up"}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

const MiniMap: React.FC<{ report: Report }> = ({ report }) => {
    const { theme, categories } = React.useContext(AppContext);
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

const CreatorInfo: React.FC<{ report: Report }> = ({ report }) => {
    const { currentUser } = React.useContext(AppContext);
    const [creator, setCreator] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        setLoading(true);
        api.getUserById(report.created_by)
            .then(user => setCreator(user || null))
            .finally(() => setLoading(false));
    }, [report.created_by]);

    if (loading) {
        return (
            <div className="flex items-center gap-3 p-3 bg-muted dark:bg-bg-dark rounded-xl">
                <Shimmer className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Shimmer className="h-4 w-1/3" />
                    <Shimmer className="h-4 w-1/2" />
                </div>
            </div>
        );
    }

    if (!creator) return null;

    const isCurrentUser = creator.id === currentUser?.id;

    return (
        <div className="flex items-center gap-3 p-3 bg-muted dark:bg-bg-dark rounded-xl">
            <img src={creator.avatarUrl} alt={creator.display_name} className="w-10 h-10 rounded-full" />
            <div>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">Reported by</p>
                <p className="font-bold text-navy dark:text-text-primary-dark">
                    {creator.display_name} {isCurrentUser && '(You)'}
                </p>
            </div>
        </div>
    )
}


const ReportDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, language, reports, loading, currentUser, confirmReport, fetchComments, fetchReportHistory, flyToLocation, toggleReportSubscription, theme, categories } = React.useContext(AppContext);
    const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
    const [lightboxState, setLightboxState] = React.useState<{ isOpen: boolean, startIndex: number }>({ isOpen: false, startIndex: 0 });
    const [isCopied, setIsCopied] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Local state for deep-linked report fallback
    const [localReport, setLocalReport] = React.useState<Report | null>(null);

    const openLightbox = (index: number) => setLightboxState({ isOpen: true, startIndex: index });
    const closeLightbox = () => setLightboxState({ isOpen: false, startIndex: 0 });

    React.useEffect(() => {
        if (id && !id.startsWith('pending-')) {
            fetchComments(id);
            fetchReportHistory(id);

            // DEEP LINKING FIX: If report is not in the loaded list, fetch it individually
            if (!reports.find(r => r.id === id)) {
                api.getReportById(id)
                    .then(data => setLocalReport(data))
                    .catch(err => console.error("Deep link fetch failed", err));
            }
        }
    }, [id, fetchComments, fetchReportHistory, reports]);

    const report = React.useMemo(() => reports.find(r => r.id === id) || localReport, [reports, id, localReport]);

    const handleConfirm = () => {
        if (report && !report.isPending) {
            confirmReport(report.id);
        }
    };

    const handleViewOnMap = () => {
        if (!report) return;
        flyToLocation([report.lat, report.lng], 16);
        navigate(PATHS.HOME);
    };

    const handleCopyId = () => {
        if (!report) return;
        navigator.clipboard.writeText(report.id).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const handleBackClick = () => {
        if (location.state?.from === 'reportWizard') {
            navigate(PATHS.REPORT_FORM);
        } else {
            navigate(PATHS.HOME); // Default navigation
        }
    };

    const handleToggleSubscription = async () => {
        if (!currentUser || !report) return;
        const isCurrentlySubscribed = currentUser.subscribedReportIds?.includes(report.id);

        setToastMessage(isCurrentlySubscribed ? t.updatesStopped : t.youWillGetUpdates);
        const timer = setTimeout(() => setToastMessage(null), 3000);

        try {
            await toggleReportSubscription(report.id);
        } catch (error) {
            console.error("Failed to toggle subscription, reverting toast", error);
            clearTimeout(timer);
            setToastMessage("Action failed. Please try again.");
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    if (loading) return <ReportDetailsSkeleton />;
    if (!report) return <div className="text-center text-text-secondary dark:text-text-secondary-dark py-10">Report not found.</div>;

    const categoryData = report.category ? categories[report.category] : null;

    if (!categoryData) {
        return (
            <div className="text-center text-text-secondary dark:text-text-secondary-dark py-10">
                <p>Error: Invalid or missing category for this report.</p>
                <Link to={PATHS.HOME} className="text-teal dark:text-teal-dark underline mt-4 inline-block">Go back to map</Link>
            </div>
        );
    }

    const CategoryIcon = categoryData.icon;
    const backButtonDirection = language === 'ar' ? <FaArrowRight /> : <FaArrowLeft />;

    const isSubscribed = currentUser?.subscribedReportIds?.includes(report.id);

    const categoryName = categoryData ? (language === 'ar' ? categoryData.name_ar : categoryData.name_en) : '';
    const subCategoryData = categoryData && report.sub_category ? categoryData.subCategories[report.sub_category] : null;
    const subCategoryName = subCategoryData ? (language === 'ar' ? subCategoryData.name_ar : subCategoryData.name_en) : '';
    const categoryColor = theme === 'dark' ? categoryData.color.dark : categoryData.color.light;

    const title = language === 'ar' ? report.title_ar : report.title_en;
    const note = language === 'ar' ? report.note_ar : report.note_en;

    return (
        <div className="max-w-4xl mx-auto pb-20 md:pb-0">
            <button onClick={handleBackClick} className="inline-flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-cyan-dark mb-4">
                {backButtonDirection}
                <span>{t.back}</span>
            </button>
            {report.isPending && (
                <div className="bg-mango/20 dark:bg-mango-dark/20 text-mango-dark dark:text-mango-dark p-4 rounded-xl mb-4 flex items-center gap-3 animate-pulse">
                    <FaClockRotateLeft {...({ className: "h-5 w-5" } as any)} />
                    <p className="font-semibold">{t.pending_sync_message}</p>
                </div>
            )}
            {isShareModalOpen && report && <ShareModal report={report} onClose={() => setIsShareModalOpen(false)} />}
            {lightboxState.isOpen && <Lightbox mediaUrls={report.photo_urls} startIndex={lightboxState.startIndex} onClose={closeLightbox} />}
            {toastMessage && (
                <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-navy dark:bg-sand text-sand dark:text-navy px-4 py-2 rounded-full shadow-lg animate-fade-in z-50">
                    {toastMessage}
                </div>
            )}

            <div className="bg-card dark:bg-surface-dark p-4 sm:p-6 rounded-2xl shadow-md">
                <MediaGrid report={report} onMediaClick={openLightbox} />

                <div className="mt-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div className="flex items-center gap-3 text-lg font-bold text-navy dark:text-text-primary-dark">
                            <SeverityIndicator severity={report.severity} className="text-2xl" />
                            <CategoryIcon className="w-6 h-6" style={{ color: categoryColor }} />
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark">{t.location}</h3>
                            <button onClick={handleViewOnMap} className="w-full text-left p-3 bg-muted dark:bg-bg-dark rounded-xl hover:shadow-md transition-shadow space-y-2">
                                <p className="text-text-secondary dark:text-text-secondary-dark">{report.area}</p>
                                <div className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2">
                                    <FaCity {...({ className: "flex-shrink-0 h-4 w-4 text-teal dark:text-teal-dark" } as any)} />
                                    <span className="capitalize">
                                        <span className="font-bold text-navy dark:text-text-primary-dark">{t.municipality}: </span>{report.municipality}
                                    </span>
                                </div>
                                <div className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2">
                                    <FaGlobe {...({ className: "flex-shrink-0 h-4 w-4 text-teal dark:text-teal-dark" } as any)} />
                                    <span className="font-mono">
                                        Lat: {parseFloat(report.lat).toFixed(5)}, Lng: {parseFloat(report.lng).toFixed(5)}
                                    </span>
                                </div>
                            </button>
                            <div className="h-64 rounded-xl overflow-hidden relative z-0 group cursor-pointer" onClick={handleViewOnMap}>
                                <MiniMap report={report} />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="p-4 bg-white/80 dark:bg-black/80 rounded-full text-navy dark:text-white backdrop-blur-sm">
                                        <FaMapLocationDot {...({ className: "h-8 w-8" } as any)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CreatorInfo report={report} />
                    </div>

                    <div className="border-t border-border-light dark:border-border-dark my-6"></div>

                    <div className="space-y-4">
                        <button
                            disabled={report.isPending}
                            onClick={handleConfirm}
                            className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-mango text-white text-lg font-bold rounded-full shadow-lg hover:bg-opacity-90 disabled:bg-gray-400 transform hover:scale-105 transition-transform"
                        >
                            <FaCircleCheck />
                            {t.confirmSawThisToo} ({report.confirmations_count})
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                disabled={report.isPending}
                                onClick={handleToggleSubscription}
                                className={`flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-full shadow-md transition-colors disabled:bg-gray-400/50 disabled:text-gray-500 ${isSubscribed
                                    ? 'bg-teal/20 text-teal dark:bg-teal-dark/20 dark:text-teal-dark'
                                    : 'bg-muted text-text-secondary dark:bg-bg-dark dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-border-dark'
                                    }`}
                            >
                                {isSubscribed ? <FaBellSlash /> : <FaBell />}
                                {isSubscribed ? t.following : t.follow}
                            </button>
                            <button
                                onClick={() => setIsShareModalOpen(true)}
                                className="flex items-center justify-center gap-2 py-3 px-4 bg-muted text-text-secondary dark:bg-bg-dark dark:text-text-secondary-dark font-semibold rounded-full shadow-md transition-colors hover:bg-gray-200 dark:hover:bg-border-dark"
                            >
                                <FaShareNodes />
                                {t.share}
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-border-light dark:border-border-dark my-6"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StatusTimeline report={report} />
                        <CommentsSection report={report} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportDetailsPage;
