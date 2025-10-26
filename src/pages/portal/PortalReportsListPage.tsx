import * as React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PortalContext } from '../../contexts/PortalContext';
import { AppContext } from '../../contexts/AppContext';
import { Report, ReportStatus, ReportCategory, ReportSeverity } from '../../types';
import Spinner from '../../components/Spinner';
import Lightbox from '../../components/Lightbox';
import ResolutionProofModal from '../../components/portal/ResolutionProofModal';
import PortalReportFilters from '../../components/portal/PortalReportFilters';
import { FaMapLocationDot, FaArrowRight, FaFileCsv, FaSort, FaSortUp, FaSortDown, FaMagnifyingGlass } from 'react-icons/fa6';
import { STATUS_COLORS } from '../../constants';

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
      <span className={`w-full text-center px-4 py-1.5 text-sm font-bold rounded-full block ${colorClasses}`}>
        {t[status]}
      </span>
    );
};

const PortalReportsListPage: React.FC = () => {
    const { reports, loading, updateReportStatus, resolveReportWithProof, categories, currentUser } = React.useContext(PortalContext);
    const { t, flyToLocation, language, theme } = React.useContext(AppContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    type SortKey = keyof Pick<Report, 'category' | 'confirmations_count' | 'status' | 'created_at' | 'severity'> | 'title';
    interface SortConfig {
      key: SortKey;
      direction: 'ascending' | 'descending';
    }
    
    const [lightboxState, setLightboxState] = React.useState<{ isOpen: boolean, images: string[], startIndex: number }>({ isOpen: false, images: [], startIndex: 0 });
    const [resolvingReport, setResolvingReport] = React.useState<Report | null>(null);
    
    const [activeCategories, setActiveCategories] = React.useState<Set<ReportCategory>>(new Set());
    const [activeStatuses, setActiveStatuses] = React.useState<Set<ReportStatus>>(new Set());
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'created_at', direction: 'descending' });
    
    const canWrite = currentUser?.portal_access_level === 'read_write' || currentUser?.role === 'super_admin';

    React.useEffect(() => {
        const statusFromUrl = searchParams.get('status');
        if (statusFromUrl && Object.values(ReportStatus).includes(statusFromUrl as ReportStatus)) {
            setActiveStatuses(new Set([statusFromUrl as ReportStatus]));
        }
    }, [searchParams]);


    const sortedAndFilteredReports = React.useMemo(() => {
        let filtered = reports.filter(report => {
            const categoryMatch = activeCategories.size === 0 || activeCategories.has(report.category);
            const statusMatch = activeStatuses.size === 0 || activeStatuses.has(report.status);
            const normalizedQuery = searchQuery.toLowerCase().trim();
            const searchMatch = !normalizedQuery ||
                report.id.toLowerCase().includes(normalizedQuery) ||
                report.title_en.toLowerCase().includes(normalizedQuery) ||
                report.title_ar.includes(searchQuery.trim());
            return categoryMatch && statusMatch && searchMatch;
        });

        if (sortConfig !== null) {
            const severityOrder = { [ReportSeverity.Low]: 1, [ReportSeverity.Medium]: 2, [ReportSeverity.High]: 3 };
            filtered.sort((a, b) => {
                if (sortConfig.key === 'severity') {
                    const comparison = (severityOrder[a.severity] || 0) - (severityOrder[b.severity] || 0);
                    return sortConfig.direction === 'ascending' ? comparison : -comparison;
                }
                
                if(sortConfig.key === 'title') {
                    const aVal = language === 'ar' ? a.title_ar : a.title_en;
                    const bVal = language === 'ar' ? b.title_ar : b.title_en;
                    const comparison = aVal.localeCompare(bVal);
                    return sortConfig.direction === 'ascending' ? comparison : -comparison;
                }

                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                let comparison = 0;

                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    comparison = aVal.localeCompare(bVal);
                } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                    comparison = aVal - bVal;
                } else {
                    if (aVal < bVal) comparison = -1;
                    if (aVal > bVal) comparison = 1;
                }
                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }
        return filtered;
    }, [reports, activeCategories, activeStatuses, searchQuery, sortConfig, language]);

    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };
    
    const SortableHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode; className?: string }> = ({ sortKey, children, className = '' }) => {
        const isSorted = sortConfig?.key === sortKey;
        
        return (
            <th className={`p-4 font-bold text-text-secondary dark:text-text-secondary-dark ${className}`}>
                <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 hover:text-navy dark:hover:text-text-primary-dark transition-colors">
                    <span>{children}</span>
                    <span className={isSorted ? 'text-teal dark:text-teal-dark' : 'opacity-30'}>
                        {isSorted ? (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </span>
                </button>
            </th>
        );
    };

    const handleViewOnMap = (e: React.MouseEvent, report: Report) => {
        e.stopPropagation();
        flyToLocation([report.lat, report.lng], 16);
        navigate('/portal/map');
    };

    const openLightbox = (e: React.MouseEvent, imageUrls: string[], startIndex: number = 0) => {
        e.stopPropagation();
        setLightboxState({ isOpen: true, images: imageUrls, startIndex });
    };

    const closeLightbox = () => {
        setLightboxState({ isOpen: false, images: [], startIndex: 0 });
    };
    
    const handleStatusChange = async (report: Report, newStatus: ReportStatus) => {
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
    
    const handleNavigateDetails = (e: React.MouseEvent, reportId: string) => {
        e.stopPropagation();
        navigate(`/portal/reports/${reportId}`);
    };
    
    const handleExportCsv = () => {
        if (sortedAndFilteredReports.length === 0) return;

        const escapeCsvCell = (cellData: any): string => {
            let cell = cellData === null || cellData === undefined ? '' : String(cellData);
            if (/[",\n]/.test(cell)) {
                cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        };

        const headers = ['ID', 'Title (EN)', 'Title (AR)', 'Description (EN)', 'Description (AR)', 'Category', 'Sub-Category', 'Severity', 'Status', 'Confirmations', 'Created At', 'Area', 'Municipality', 'Latitude', 'Longitude', 'Report URL'];
        
        const rows = sortedAndFilteredReports.map(report => {
            const categoryData = categories[report.category];
            const subCategoryData = categoryData && report.sub_category ? categoryData.subCategories[report.sub_category] : null;

            const reportUrl = `${window.location.origin}${window.location.pathname}#/portal/reports/${report.id}`;
            return [
                report.id, report.title_en, report.title_ar, report.note_en, report.note_ar, 
                categoryData ? categoryData.name_en : report.category, 
                subCategoryData ? subCategoryData.name_en : (report.sub_category || ''), 
                report.severity, report.status,
                report.confirmations_count, report.created_at, report.area, report.municipality,
                report.lat, report.lng, reportUrl
            ].map(escapeCsvCell);
        });

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `mshkltk_reports_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    
    return (
        <div>
            {lightboxState.isOpen && <Lightbox mediaUrls={lightboxState.images} startIndex={lightboxState.startIndex} onClose={closeLightbox} />}
            {resolvingReport && (
                <ResolutionProofModal
                    report={resolvingReport}
                    onClose={() => setResolvingReport(null)}
                    onSubmit={handleResolutionSubmit}
                />
            )}
            <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-6">{t.manageReports}</h1>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                <PortalReportFilters 
                    activeCategories={activeCategories}
                    setActiveCategories={setActiveCategories}
                    activeStatuses={activeStatuses}
                    setActiveStatuses={setActiveStatuses}
                />
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-grow">
                        <span className="absolute top-1/2 -translate-y-1/2 left-3 text-text-secondary dark:text-text-secondary-dark"><FaMagnifyingGlass/></span>
                        <input
                            type="search"
                            placeholder={t.searchReports}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg bg-card dark:bg-surface-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-teal dark:focus:ring-teal-dark"
                        />
                    </div>
                    <button 
                        onClick={handleExportCsv}
                        className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-navy dark:bg-sand text-sand dark:text-navy hover:opacity-90 transition-opacity"
                    >
                        <FaFileCsv />
                        {t.downloadCSV}
                    </button>
                </div>
            </div>
            
            <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-left min-w-[1280px]">
                    <thead className="bg-muted dark:bg-border-dark/20">
                        <tr>
                            <SortableHeader sortKey="created_at">{t.date}</SortableHeader>
                            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark w-24">{t.image}</th>
                            <SortableHeader sortKey="title">{t.reportDetails}</SortableHeader>
                            <SortableHeader sortKey="category">{t.category}</SortableHeader>
                            <SortableHeader sortKey="severity">{t.severity}</SortableHeader>
                            <SortableHeader sortKey="confirmations_count">{t.confirmations}</SortableHeader>
                            <SortableHeader sortKey="status" className="w-48">Status & Actions</SortableHeader>
                            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark w-24">{t.resolutionProof}</th>
                            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark">{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredReports.map((report) => {
                           const proofUrl = report.status === ReportStatus.Resolved && report.photo_urls.length > 1
                               ? report.photo_urls[report.photo_urls.length - 1]
                               : null;
                           const title = language === 'ar' ? report.title_ar : report.title_en;
                           const note = language === 'ar' ? report.note_ar : report.note_en;
                           const firstMediaUrl = report.photo_urls[0];
                           const isVideo = firstMediaUrl && firstMediaUrl.startsWith('data:video/');
                           return (
                               <tr 
                                 key={report.id} 
                                 className="border-b border-border-light dark:border-border-dark hover:bg-muted dark:hover:bg-border-dark/30"
                               >
                                  <td className="p-4 text-text-secondary dark:text-text-secondary-dark align-top">{new Date(report.created_at).toLocaleDateString(language === 'ar' ? 'ar-LB' : 'en-US')}</td>
                                  <td className="p-4">
                                    <button onClick={(e) => openLightbox(e, report.photo_urls)}>
                                        {isVideo ? (
                                            <video src={firstMediaUrl} className="w-16 h-16 object-cover rounded-lg" playsInline />
                                        ) : (
                                            <img src={firstMediaUrl} alt={title} className="w-16 h-16 object-cover rounded-lg"/>
                                        )}
                                    </button>
                                  </td>
                                  <td className="p-4 align-top">
                                    <p className="text-navy dark:text-text-primary-dark font-bold">{title}</p>
                                    <p className="text-xs font-mono text-text-secondary/70 dark:text-text-secondary-dark/70 mt-1">ID: {report.id}</p>
                                    <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1 line-clamp-2">{note}</p>
                                    <button onClick={(e) => handleViewOnMap(e, report)} className="mt-2 text-xs flex items-center gap-2 text-sky dark:text-cyan-dark hover:underline">
                                      <FaMapLocationDot />
                                      <span>{report.area}</span>
                                    </button>
                                  </td>
                                   <td className="p-4 align-top">
                                    {(() => {
                                        const categoryData = categories[report.category];
                                        if (!categoryData) {
                                            return (
                                                <div>
                                                    <p className="font-semibold text-navy dark:text-text-primary-dark">{report.category}</p>
                                                    <p className="block text-xs text-text-secondary dark:text-text-secondary-dark">{report.sub_category || ''}</p>
                                                </div>
                                            );
                                        }
                                        const subCategoryData = report.sub_category ? categoryData.subCategories[report.sub_category] : null;
                                        const CategoryIcon = categoryData.icon;
                                        const categoryColor = theme === 'dark' ? categoryData.color.dark : categoryData.color.light;
                                        const categoryName = language === 'ar' ? categoryData.name_ar : categoryData.name_en;
                                        const subCategoryName = subCategoryData ? (language === 'ar' ? subCategoryData.name_ar : subCategoryData.name_en) : '';

                                        return (
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${categoryColor}20` }}>
                                                    <CategoryIcon style={{ color: categoryColor }} size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-navy dark:text-text-primary-dark">{categoryName}</p>
                                                    <p className="block text-xs text-text-secondary dark:text-text-secondary-dark">{subCategoryName}</p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                  </td>
                                  <td className="p-4 text-center align-top"><SeverityIndicator severity={report.severity} /></td>
                                  <td className="p-4 text-text-secondary dark:text-text-secondary-dark font-bold text-center align-top">{report.confirmations_count}</td>
                                  <td className="p-4 w-48 align-top">
                                    {(() => {
                                        const getNextAction = (): { label: string; action: () => void; className: string } | null => {
                                            if (!canWrite) return null;
                                            switch (report.status) {
                                                case ReportStatus.New:
                                                    return { label: `Mark ${t.received}`, action: () => handleStatusChange(report, ReportStatus.Received), className: 'bg-sky/20 text-sky dark:bg-cyan-dark/20 dark:text-cyan-dark hover:bg-sky/30 dark:hover:bg-cyan-dark/30' };
                                                case ReportStatus.Received:
                                                    return { label: `Mark ${t.in_progress}`, action: () => handleStatusChange(report, ReportStatus.InProgress), className: 'bg-teal/20 text-teal dark:bg-teal-dark/20 dark:text-teal-dark hover:bg-teal/30 dark:hover:bg-teal-dark/30' };
                                                case ReportStatus.InProgress:
                                                    return { label: `Mark ${t.resolved}`, action: () => handleStatusChange(report, ReportStatus.Resolved), className: 'bg-mango/20 text-mango-dark dark:bg-mango-dark/20 dark:text-mango hover:bg-mango/30 dark:hover:bg-mango-dark/30' };
                                                default:
                                                    return null;
                                            }
                                        };
                                        const nextAction = getNextAction();

                                        return (
                                            <div className="flex flex-col gap-2">
                                                <StatusPill status={report.status} />
                                                {nextAction && (
                                                    <button onClick={(e) => { e.stopPropagation(); nextAction.action(); }} className={`w-full text-xs font-bold p-2 rounded-lg flex items-center justify-center gap-1 transition-transform hover:scale-105 ${nextAction.className}`}>
                                                        <FaArrowRight size={10} /> {nextAction.label}
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })()}
                                  </td>
                                  <td className="p-4">
                                     {proofUrl ? (
                                        <button onClick={(e) => openLightbox(e, report.photo_urls, report.photo_urls.length - 1)}>
                                          <img src={proofUrl} alt="Resolution Proof" className="w-16 h-16 object-cover rounded-lg"/>
                                        </button>
                                      ) : (
                                        <span className="text-text-secondary/50 dark:text-text-secondary-dark/50">-</span>
                                      )}
                                  </td>
                                  <td className="p-4 align-top">
                                     <button 
                                        onClick={(e) => handleNavigateDetails(e, report.id)} 
                                        className="p-2 text-text-secondary dark:text-text-secondary-dark hover:text-navy dark:hover:text-text-primary-dark rounded-full hover:bg-gray-200 dark:hover:bg-border-dark"
                                        title={t.viewFullReport}
                                    >
                                        <FaArrowRight />
                                     </button>
                                  </td>
                               </tr>
                           );
                        })}
                    </tbody>
                </table>
                 {sortedAndFilteredReports.length === 0 && (
                    <div className="p-16 text-center text-text-secondary dark:text-text-secondary-dark">
                        <p>{t.noReportsFoundPortal}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PortalReportsListPage;