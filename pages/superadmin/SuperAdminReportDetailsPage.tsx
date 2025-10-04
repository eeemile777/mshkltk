import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { Report, Theme, ReportStatus, Comment, ReportHistory, User, ReportSeverity } from '../../types';
import { CATEGORIES, STATUS_COLORS, TILE_URLS } from '../../constants';
import { FaArrowLeft, FaArrowRight, FaCircleCheck, FaRegCommentDots, FaClockRotateLeft, FaMapLocationDot, FaCity, FaGlobe, FaLandmark, FaTrash } from 'react-icons/fa6';
import { ReportDetailsSkeleton } from '../../components/SkeletonLoader';
import { createCategoryIcon } from '../../utils/mapUtils';
import Lightbox from '../../components/Lightbox';

const SeverityIndicator: React.FC<{ severity: ReportSeverity; className?: string }> = ({ severity, className = '' }) => {
    const severityMap = {
        [ReportSeverity.High]: { text: '!!!', title: 'High' },
        [ReportSeverity.Medium]: { text: '!!', title: 'Medium' },
        [ReportSeverity.Low]: { text: '!', title: 'Low' },
    };
    const { text, title } = severityMap[severity] || severityMap.low;
    return <span className={`font-black text-lg text-coral dark:text-coral-dark ${className}`} title={`Severity: ${title}`}>{text}</span>;
};

const StatusPill: React.FC<{ status: Report['status'] }> = ({ status }) => {
  const { t, theme } = React.useContext(AppContext);
  const colorClasses = theme === 'dark' ? STATUS_COLORS[status].dark : STATUS_COLORS[status].light;
  return <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${colorClasses}`}>{t[status]}</span>;
};

const ImageGrid: React.FC<{ report: Report; onImageClick: (index: number) => void }> = ({ report, onImageClick }) => {
    const { t } = React.useContext(AppContext);
    const urls = report.photo_urls;
    if (!urls || urls.length === 0) return null;
    const renderImage = (index: number, className: string = '') => {
        const isProofPhoto = report.status === ReportStatus.Resolved && urls.length > 1 && index === urls.length - 1;
        return (
            <div key={index} className={`relative overflow-hidden rounded-lg group cursor-pointer ${className}`} onClick={() => onImageClick(index)}>
                <img src={urls[index]} alt={`Report photo ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isProofPhoto && <div className="absolute bottom-2 left-2 bg-teal text-white px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 z-10 shadow-lg"><FaCircleCheck /><span>{t.resolved}</span></div>}
            </div>
        );
    }
    const layoutClasses = "grid gap-2 h-96";
    switch (urls.length) {
        case 1: return <div className="h-96 rounded-xl overflow-hidden shadow-lg">{renderImage(0)}</div>;
        case 2: return <div className={`${layoutClasses} grid-cols-2`}>{urls.map((_, i) => renderImage(i))}</div>;
        case 3: return <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>{renderImage(0, 'row-span-2')}{renderImage(1)}{renderImage(2)}</div>;
        case 4: return <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>{urls.map((_, i) => renderImage(i))}</div>;
        default: return <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>{renderImage(0)}{renderImage(1)}{renderImage(2)}<div className="relative overflow-hidden rounded-lg group cursor-pointer" onClick={() => onImageClick(3)}><img src={urls[3]} alt={`Report photo 4`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" /><div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white text-4xl font-bold">+{urls.length - 3}</span></div></div></div>;
    }
};

const StatusTimeline: React.FC = () => {
    const { t } = React.useContext(AppContext);
    const { reportHistory } = React.useContext(SuperAdminContext);
    return (
        <div className="bg-muted dark:bg-bg-dark p-6 rounded-2xl h-full">
            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-4 flex items-center gap-2"><FaClockRotateLeft /> {t.statusTimeline}</h3>
            <div className="relative pl-6 border-l-2 border-border-light dark:border-border-dark">
                {reportHistory.map(item => <div key={item.id} className="mb-6 last:mb-0"><div className="absolute -left-[11px] w-5 h-5 bg-teal dark:bg-teal-dark rounded-full"></div><p className="font-bold text-navy dark:text-text-primary-dark">{item.status === ReportStatus.New ? t.reportCreated : `${t.statusChangedTo} "${t[item.status]}"`}</p><p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">{new Date(item.updated_at).toLocaleString(t.language === 'ar' ? 'ar-LB' : 'en-US')}</p></div>)}
            </div>
        </div>
    );
};

const CommentsSection: React.FC = () => {
    const { t } = React.useContext(AppContext);
    const { comments } = React.useContext(SuperAdminContext);
    return (
        <div className="bg-muted dark:bg-bg-dark p-6 rounded-2xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-4 flex items-center gap-2"><FaRegCommentDots/> {t.comments}</h3>
            <div className="flex-grow space-y-4 overflow-y-auto max-h-96 pr-2">
                {comments.length > 0 ? comments.map(comment => {
                    const isMunicipality = comment.user.role === 'municipality';
                    return (
                        <div key={comment.id} className="flex items-start gap-3">
                            <img src={comment.user.avatarUrl} alt={comment.user.display_name} className="w-10 h-10 rounded-full flex-shrink-0" />
                            <div className={`p-3 rounded-xl w-full ${isMunicipality ? 'bg-sky/10 dark:bg-cyan-dark/10 border border-sky/50 dark:border-cyan-dark/50' : 'bg-card dark:bg-surface-dark'}`}><div className="flex items-baseline justify-between"><p className="font-bold text-sm text-navy dark:text-text-primary-dark">{comment.user.display_name}</p>{isMunicipality && <span className="text-xs font-bold text-sky dark:text-cyan-dark bg-sky/20 dark:bg-cyan-dark/20 px-2 py-0.5 rounded-full flex items-center gap-1"><FaLandmark size={10}/> Municipality</span>}</div><p className="text-sm text-text-primary dark:text-text-primary-dark mt-1">{comment.text}</p><p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2 text-right">{new Date(comment.created_at).toLocaleDateString()}</p></div>
                        </div>
                    )
                }) : <p className="text-center text-text-secondary dark:text-text-secondary-dark py-8">{t.noCommentsYet}</p>}
            </div>
        </div>
    );
};

const MiniMap: React.FC<{ report: Report }> = ({ report }) => {
    const { theme } = React.useContext(AppContext);
    const mapContainer = React.useRef<HTMLDivElement>(null);
    const mapRef = React.useRef<L.Map | null>(null);
    React.useEffect(() => {
        if (mapRef.current || !mapContainer.current) return;
        const map = L.map(mapContainer.current, {center: [report.lat, report.lng], zoom: 15, zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false});
        L.tileLayer(TILE_URLS.light).addTo(map);
        L.marker([report.lat, report.lng], { icon: createCategoryIcon(report.category, theme) }).addTo(map);
        mapRef.current = map;
        return () => { map.remove(); mapRef.current = null; };
    }, [report.lat, report.lng, report.category, theme]);
    return <div ref={mapContainer} className="h-full w-full" />;
};

const SuperAdminReportDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, language, flyToLocation, theme } = React.useContext(AppContext);
    const { allReports, allUsers, loading, fetchCommentsForReport, fetchHistoryForReport, deleteReport } = React.useContext(SuperAdminContext);
    const [lightboxState, setLightboxState] = React.useState<{ isOpen: boolean, startIndex: number }>({ isOpen: false, startIndex: 0 });
    const navigate = useNavigate();

    const report = React.useMemo(() => allReports.find(r => r.id === id), [allReports, id]);
    const creator = React.useMemo(() => report ? allUsers.find(u => u.id === report.created_by) : null, [report, allUsers]);

    React.useEffect(() => {
        if (id) {
            fetchCommentsForReport(id);
            fetchHistoryForReport(id);
        }
    }, [id, fetchCommentsForReport, fetchHistoryForReport]);
    
    const handleDelete = async () => {
        if (!report) return;
        if (window.confirm(`Are you sure you want to permanently delete report "${title}"? This action cannot be undone.`)) {
            await deleteReport(report.id);
            navigate('/superadmin/reports');
        }
    };

    if (loading) return <ReportDetailsSkeleton />;
    if (!report) return <div className="text-center text-text-secondary dark:text-text-secondary-dark py-10">Report not found.</div>;

    const categoryData = CATEGORIES[report.category];
    const CategoryIcon = categoryData.icon;
    const categoryColor = theme === 'dark' ? categoryData.color.dark : categoryData.color.light;
    const backButtonDirection = language === 'ar' ? <FaArrowRight /> : <FaArrowLeft />;
    const categoryName = t[report.category];
    const subCategoryName = report.sub_category ? t[report.sub_category] : '';
    const title = language === 'ar' ? report.title_ar : report.title_en;
    const note = language === 'ar' ? report.note_ar : report.note_en;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/superadmin/reports" className="inline-flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-cyan-dark mb-4">
                {backButtonDirection}<span>Back to All Reports</span>
            </Link>
            {lightboxState.isOpen && <Lightbox images={report.photo_urls} startIndex={lightboxState.startIndex} onClose={() => setLightboxState({isOpen: false, startIndex: 0})} />}

            <div className="bg-card dark:bg-surface-dark p-4 sm:p-6 rounded-2xl shadow-md">
                <ImageGrid report={report} onImageClick={(idx) => setLightboxState({isOpen: true, startIndex: idx})} />
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
                    <p className="mt-2 text-sm font-mono text-text-secondary dark:text-text-secondary-dark">ID: {report.id}</p>
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
                    
                    <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-full shadow-md transition-colors bg-coral/20 text-coral-dark hover:bg-coral/30">
                        <FaTrash /> Delete Report Permanently
                    </button>
                    
                    <div className="border-t border-border-light dark:border-border-dark my-6"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark">{t.location}</h3>
                            <div className="p-3 bg-muted dark:bg-bg-dark rounded-xl space-y-2">
                                <p className="text-text-secondary dark:text-text-secondary-dark">{report.area}</p>
                                <div className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2"><FaCity className="flex-shrink-0 h-4 w-4 text-teal dark:text-teal-dark" /><span className="capitalize"><span className="font-bold text-navy dark:text-text-primary-dark">{t.municipality}: </span>{report.municipality}</span></div>
                                <div className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2"><FaGlobe className="flex-shrink-0 h-4 w-4 text-teal dark:text-teal-dark" /><span className="font-mono">Lat: {report.lat.toFixed(5)}, Lng: {report.lng.toFixed(5)}</span></div>
                            </div>
                            <div className="h-64 rounded-xl overflow-hidden relative z-0 group cursor-pointer" onClick={() => navigate('/superadmin/map')}><MiniMap report={report} /><div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"><div className="p-4 bg-white/80 dark:bg-black/80 rounded-full text-navy dark:text-white backdrop-blur-sm"><FaMapLocationDot className="h-8 w-8" /></div></div></div>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-muted dark:bg-bg-dark p-6 rounded-xl text-center"><FaCircleCheck className="text-5xl text-mango dark:text-mango-dark mb-3"/><p className="text-3xl font-bold text-navy dark:text-text-primary-dark">{report.confirmations_count}</p><p className="text-text-secondary dark:text-text-secondary-dark">{t.confirmations}</p></div>
                    </div>
                    <div className="border-t border-border-light dark:border-border-dark my-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <StatusTimeline />
                        <CommentsSection />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminReportDetailsPage;
