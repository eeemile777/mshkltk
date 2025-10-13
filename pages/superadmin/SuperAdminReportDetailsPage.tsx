import * as React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { Report, Theme, ReportStatus, Comment, ReportHistory, User, ReportSeverity, ReportCategory } from '../../types';
import { STATUS_COLORS, TILE_URLS, ICON_MAP, CATEGORIES } from '../../constants';
import { FaArrowLeft, FaArrowRight, FaCircleCheck, FaRegCommentDots, FaClockRotateLeft, FaMapLocationDot, FaCity, FaGlobe, FaLandmark, FaTrash, FaPenToSquare, FaFloppyDisk, FaXmark, FaFlag, FaSpinner } from 'react-icons/fa6';
import { ReportDetailsSkeleton } from '../../components/SkeletonLoader';
import { createCategoryIcon } from '../../utils/mapUtils';
import Lightbox from '../../components/Lightbox';
import InteractiveMap from '../../components/InteractiveMap';
import CategorySelectionModal from '../../components/superadmin/CategorySelectionModal';

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
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {isProofMedia && <div className="absolute bottom-2 left-2 bg-teal text-white px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1.5 z-10 shadow-lg"><FaCircleCheck /><span>{t.resolved}</span></div>}
            </div>
        );
    }
    const layoutClasses = "grid gap-2 h-96";
    switch (urls.length) {
        case 1: return <div className="h-96 rounded-xl overflow-hidden shadow-lg">{renderMedia(0)}</div>;
        case 2: return <div className={`${layoutClasses} grid-cols-2`}>{urls.map((_, i) => renderMedia(i))}</div>;
        case 3: return <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>{renderMedia(0, 'row-span-2')}{renderMedia(1)}{renderMedia(2)}</div>;
        case 4: return <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>{urls.map((_, i) => renderMedia(i))}</div>;
        default: return <div className={`${layoutClasses} grid-cols-2 grid-rows-2`}>{renderMedia(0)}{renderMedia(1)}{renderMedia(2)}<div className="relative overflow-hidden rounded-lg group cursor-pointer" onClick={() => onMediaClick(3)}>{urls[3].startsWith('data:video/') ? (<video src={urls[3]} className="w-full h-full object-cover" muted loop playsInline autoPlay />) : (<img src={urls[3]} alt={`Report media 4`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />)}<div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white text-4xl font-bold">+{urls.length - 3}</span></div></div></div>;
    }
};

const StatusTimeline: React.FC = () => {
    const { t, language } = React.useContext(AppContext);
    const { reportHistory } = React.useContext(SuperAdminContext);

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

const CommentsSection: React.FC = () => {
    const { t } = React.useContext(AppContext);
    const { comments, deleteComment } = React.useContext(SuperAdminContext);

    const handleDeleteComment = async (commentId: string) => {
        if (window.confirm(t.deleteReportConfirm.replace('{title}', 'this comment'))) {
            await deleteComment(commentId);
        }
    };

    return (
        <div className="bg-muted dark:bg-bg-dark p-6 rounded-2xl h-full flex flex-col">
            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark mb-4 flex items-center gap-2"><FaRegCommentDots/> {t.comments}</h3>
            <div className="flex-grow space-y-4 overflow-y-auto max-h-96 pr-2">
                {comments.length > 0 ? comments.map(comment => {
                    const isMunicipality = comment.user.role === 'municipality';
                    return (
                        <div key={comment.id} className="group flex items-start gap-3">
                            <img src={comment.user.avatarUrl} alt={comment.user.display_name} className="w-10 h-10 rounded-full flex-shrink-0" />
                            <div className={`p-3 rounded-xl w-full ${isMunicipality ? 'bg-sky/10 dark:bg-cyan-dark/10 border border-sky/50 dark:border-cyan-dark/50' : 'bg-card dark:bg-surface-dark'}`}><div className="flex items-baseline justify-between"><p className="font-bold text-sm text-navy dark:text-text-primary-dark">{comment.user.display_name}</p>{isMunicipality && <span className="text-xs font-bold text-sky dark:text-cyan-dark bg-sky/20 dark:bg-cyan-dark/20 px-2 py-0.5 rounded-full flex items-center gap-1"><FaLandmark size={10}/> Municipality</span>}</div><p className="text-sm text-text-primary dark:text-text-primary-dark mt-1">{comment.text}</p><p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-2 text-right">{new Date(comment.created_at).toLocaleDateString()}</p></div>
                            <button onClick={() => handleDeleteComment(comment.id)} className="p-2 text-text-secondary dark:text-text-secondary-dark hover:text-coral dark:hover:text-coral-dark opacity-0 group-hover:opacity-100 transition-opacity"><FaTrash /></button>
                        </div>
                    )
                }) : <p className="text-center text-text-secondary dark:text-text-secondary-dark py-8">{t.noCommentsYet}</p>}
            </div>
        </div>
    );
};

const SuperAdminReportDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, language, flyToLocation, theme } = React.useContext(AppContext);
    const { allReports, allUsers, loading, fetchCommentsForReport, fetchHistoryForReport, deleteReport, updateReport, categories: dynamicCategories } = React.useContext(SuperAdminContext);
    
    const [isEditing, setIsEditing] = React.useState(false);
    const [editedReport, setEditedReport] = React.useState<Report | null>(null);
    const [lightboxState, setLightboxState] = React.useState<{ isOpen: boolean, startIndex: number }>({ isOpen: false, startIndex: 0 });
    const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
    
    const navigate = useNavigate();

    const report = React.useMemo(() => allReports.find(r => r.id === id), [allReports, id]);
    const creator = React.useMemo(() => report ? allUsers.find(u => u.id === report.created_by) : null, [report, allUsers]);

    const categoriesObject = React.useMemo(() => {
        // FIX: Changed reduce to start with a copy of the static CATEGORIES object.
        // This ensures a fully-typed object is always returned, satisfying the 'categoriesOverride' prop type.
        // Dynamic categories will overwrite the static defaults.
        return (dynamicCategories || []).reduce((acc, cat) => {
            (acc as any)[cat.id] = {
                icon: ICON_MAP[cat.icon] || ICON_MAP['FaQuestion'],
                color: { light: cat.color_light, dark: cat.color_dark },
                name_en: cat.name_en,
                name_ar: cat.name_ar,
                subCategories: cat.subCategories.reduce((subAcc, sub) => {
                    (subAcc as any)[sub.id] = { name_en: sub.name_en, name_ar: sub.name_ar };
                    return subAcc;
                }, {})
            };
            return acc;
        }, { ...CATEGORIES });
    }, [dynamicCategories]);

    React.useEffect(() => {
        if (id) {
            fetchCommentsForReport(id);
            fetchHistoryForReport(id);
        }
    }, [id, fetchCommentsForReport, fetchHistoryForReport]);
    
    const titleForConfirmation = language === 'ar' ? report?.title_ar : report?.title_en;

    const handleDelete = async () => {
        if (!report) return;
        if (window.confirm(t.deleteReportConfirm.replace('{title}', titleForConfirmation || report.id))) {
            await deleteReport(report.id);
            navigate('/superadmin/reports');
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            setIsEditing(false);
            setEditedReport(null);
        } else {
            setEditedReport(report || null);
            setIsEditing(true);
        }
    };
    
    const handleSave = async () => {
        if (!editedReport) return;
        await updateReport(editedReport.id, editedReport);
        setIsEditing(false);
    };

    const handleFieldChange = (field: keyof Report, value: any) => {
        setEditedReport(prev => prev ? { ...prev, [field]: value } : null);
    };

    if (loading) return <ReportDetailsSkeleton />;
    if (!report) return <div className="text-center text-text-secondary dark:text-text-secondary-dark py-10">Report not found.</div>;

    const currentReportData = isEditing ? editedReport! : report;
    const categoryData = categoriesObject[currentReportData.category];
    
    if (!categoryData) {
        return <div className="text-center py-10 text-coral-dark">Error: Category data for "{currentReportData.category}" not found. The configuration might be out of sync.</div>;
    }
    
    const CategoryIcon = categoryData.icon;
    const categoryColor = theme === 'dark' ? categoryData.color.dark : categoryData.color.light;
    const backButtonDirection = language === 'ar' ? <FaArrowRight /> : <FaArrowLeft />;
    
    const categoryName = language === 'ar' ? categoryData.name_ar : categoryData.name_en;
    const subCategoryData = currentReportData.sub_category ? categoryData.subCategories[currentReportData.sub_category] : null;
    const subCategoryName = subCategoryData ? (language === 'ar' ? subCategoryData.name_ar : subCategoryData.name_en) : '';

    const title = language === 'ar' ? currentReportData.title_ar : currentReportData.title_en;
    const note = language === 'ar' ? currentReportData.note_ar : currentReportData.note_en;

    return (
        <div className="max-w-4xl mx-auto">
            {isCategoryModalOpen && (
                <CategorySelectionModal
                    onClose={() => setIsCategoryModalOpen(false)}
                    onSelect={(cat, subCat) => {
                        handleFieldChange('category', cat);
                        handleFieldChange('sub_category', subCat);
                    }}
                    currentCategory={editedReport?.category}
                    currentSubCategory={editedReport?.sub_category}
                />
            )}
            <div className="flex justify-between items-center mb-4">
                <Link to="/superadmin/reports" className="inline-flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-cyan-dark">
                    {backButtonDirection}<span>{t.superAdminAllReports}</span>
                </Link>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-muted dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark"><FaXmark /> {t.cancel}</button>
                            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-teal text-white"><FaFloppyDisk /> {t.save}</button>
                        </>
                    ) : (
                        <>
                            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-coral/20 text-coral-dark hover:bg-coral/30 transition-colors"><FaTrash /> {t.deleteReport}</button>
                            <button onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-navy dark:bg-sand text-sand dark:text-navy"><FaPenToSquare /> Edit Report</button>
                        </>
                    )}
                </div>
            </div>
            {lightboxState.isOpen && <Lightbox mediaUrls={report.photo_urls} startIndex={lightboxState.startIndex} onClose={() => setLightboxState({isOpen: false, startIndex: 0})} />}

            <div className="bg-card dark:bg-surface-dark p-4 sm:p-6 rounded-2xl shadow-md">
                <MediaGrid report={report} onMediaClick={(idx) => setLightboxState({isOpen: true, startIndex: idx})} />
                <div className="mt-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        {isEditing ? (
                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center gap-3 p-3 text-lg font-bold text-navy dark:text-text-primary-dark bg-muted dark:bg-bg-dark rounded-lg">
                                    <CategoryIcon className="w-6 h-6" style={{ color: categoryColor }}/>
                                    <div><span>{categoryName}</span><span className="text-sm font-normal text-text-secondary dark:text-text-secondary-dark block">{subCategoryName}</span></div>
                                </button>
                                <select value={editedReport?.severity} onChange={e => handleFieldChange('severity', e.target.value)} className="p-3 bg-muted dark:bg-bg-dark rounded-lg font-bold">
                                    {Object.values(ReportSeverity).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 text-lg font-bold text-navy dark:text-text-primary-dark">
                                <SeverityIndicator severity={currentReportData.severity} className="text-2xl" />
                                <CategoryIcon className="w-6 h-6" style={{ color: categoryColor }}/>
                                <div><span>{categoryName}</span>{subCategoryName && <span className="text-sm font-normal text-text-secondary dark:text-text-secondary-dark block">{subCategoryName}</span>}</div>
                            </div>
                        )}
                        {isEditing ? (
                            <div className="flex-shrink-0">
                                <label htmlFor="status-select" className="block text-center text-xs text-text-secondary dark:text-text-secondary-dark">Status</label>
                                <select
                                    id="status-select"
                                    value={editedReport?.status}
                                    onChange={e => handleFieldChange('status', e.target.value as ReportStatus)}
                                    className="appearance-none px-4 py-1.5 text-sm font-bold rounded-full bg-muted dark:bg-surface-dark border-border-light dark:border-border-dark border focus:ring-2 focus:ring-coral-dark"
                                >
                                    {Object.values(ReportStatus).map(s => (
                                        <option key={s} value={s}>{t[s]}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <StatusPill status={currentReportData.status} />
                        )}
                    </div>
                    
                    {isEditing ? (
                        <div className="space-y-4">
                            <input type="text" value={editedReport?.title_en} onChange={e => handleFieldChange('title_en', e.target.value)} placeholder="Title (EN)" className="text-3xl font-bold w-full p-2 bg-muted dark:bg-bg-dark rounded-lg" />
                            <input type="text" value={editedReport?.title_ar} onChange={e => handleFieldChange('title_ar', e.target.value)} placeholder="Title (AR)" className="text-3xl font-bold w-full p-2 bg-muted dark:bg-bg-dark rounded-lg" dir="rtl" />
                        </div>
                    ) : (
                        <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark">{title}</h1>
                    )}
                    
                    <p className="mt-2 text-sm font-mono text-text-secondary dark:text-text-secondary-dark">ID: {report.id}</p>
                    
                    {isEditing ? (
                         <div className="space-y-4 mt-4">
                            <textarea value={editedReport?.note_en} onChange={e => handleFieldChange('note_en', e.target.value)} rows={3} placeholder="Description (EN)" className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg" />
                            <textarea value={editedReport?.note_ar} onChange={e => handleFieldChange('note_ar', e.target.value)} rows={3} placeholder="Description (AR)" className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg" dir="rtl" />
                        </div>
                    ) : (
                        <p className="mt-4 text-text-primary dark:text-text-primary-dark text-base leading-relaxed">{note}</p>
                    )}
                    
                    <div className="border-t border-border-light dark:border-border-dark my-6"></div>
                    {creator && <div className="flex items-center gap-3 p-3 bg-muted dark:bg-bg-dark rounded-xl mb-6"><img src={creator.avatarUrl} alt={creator.display_name} className="w-10 h-10 rounded-full"/><div><p className="text-xs text-text-secondary dark:text-text-secondary-dark">{t.reportedBy}</p><p className="font-bold text-navy dark:text-text-primary-dark">{creator.display_name}</p></div></div>}
                    
                    <div className="border-t border-border-light dark:border-border-dark my-6"></div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-navy dark:text-text-primary-dark">{t.location}</h3>
                            <div className="p-3 bg-muted dark:bg-bg-dark rounded-xl space-y-2"><p className="text-text-secondary dark:text-text-secondary-dark">{currentReportData.area}</p><div className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2"><FaCity className="flex-shrink-0 h-4 w-4 text-teal dark:text-teal-dark" /><span className="capitalize"><span className="font-bold text-navy dark:text-text-primary-dark">{t.municipality}: </span>{currentReportData.municipality}</span></div><div className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-center gap-2"><FaGlobe className="flex-shrink-0 h-4 w-4 text-teal dark:text-teal-dark" /><span className="font-mono">Lat: {currentReportData.lat.toFixed(5)}, Lng: {currentReportData.lng.toFixed(5)}</span></div></div>
                            <div className="h-64 rounded-xl overflow-hidden relative z-0">
                                <InteractiveMap
                                    reports={isEditing ? [] : [currentReportData]}
                                    initialCenter={[currentReportData.lat, currentReportData.lng]}
                                    initialZoom={16}
                                    isDraggablePinVisible={isEditing}
                                    draggablePinPosition={isEditing ? [editedReport!.lat, editedReport!.lng] : null}
                                    onDraggablePinMove={(pos) => {
                                        handleFieldChange('lat', pos[0]);
                                        handleFieldChange('lng', pos[1]);
                                    }}
                                    hideUserLocationMarker={true}
                                    hideControls={true}
                                    categoriesOverride={categoriesObject}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-muted dark:bg-bg-dark p-6 rounded-xl text-center"><FaCircleCheck className="text-5xl text-mango dark:text-mango-dark mb-3"/><p className="text-3xl font-bold text-navy dark:text-text-primary-dark">{currentReportData.confirmations_count}</p><p className="text-text-secondary dark:text-text-secondary-dark">{t.confirmations}</p></div>
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