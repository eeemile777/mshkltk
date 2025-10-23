import * as React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { Report, ReportCategory, ReportStatus, ReportSeverity } from '../../types';
import Spinner from '../../components/Spinner';
import { FaTrash, FaMagnifyingGlass, FaSort, FaSortUp, FaSortDown, FaXmark, FaSpinner } from 'react-icons/fa6';
import PortalReportFilters from '../../components/portal/PortalReportFilters';

type SortKey = keyof Pick<Report, 'municipality' | 'status' | 'created_at'> | 'title';
interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

const SuperAdminReportsPage: React.FC = () => {
    const { allReports, allUsers, loading, deleteReport, addReport } = React.useContext(SuperAdminContext);
    const { t, language } = React.useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const [activeCategories, setActiveCategories] = React.useState<Set<ReportCategory>>(new Set());
    const [activeStatuses, setActiveStatuses] = React.useState<Set<ReportStatus>>(new Set());
    const [searchQuery, setSearchQuery] = React.useState('');
    const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'created_at', direction: 'descending' });
    const [deletingReportId, setDeletingReportId] = React.useState<string | null>(null);
    
    const userIdFilter = searchParams.get('userId');

    // Effect to handle the new report passed via navigation state
    React.useEffect(() => {
        if (location.state?.newReport) {
            addReport(location.state.newReport);
            // Clear state to prevent re-adding on refresh/navigation
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, addReport, navigate, location.pathname]);

    const filteredUser = React.useMemo(() => {
        if (!userIdFilter) return null;
        return allUsers.find(u => u.id === userIdFilter);
    }, [userIdFilter, allUsers]);

    const handleClearUserFilter = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('userId');
        setSearchParams(newParams);
    };

    const sortedAndFilteredReports = React.useMemo(() => {
        let filtered = allReports.filter(report => {
            const categoryMatch = activeCategories.size === 0 || activeCategories.has(report.category);
            const statusMatch = activeStatuses.size === 0 || activeStatuses.has(report.status);
            const normalizedQuery = searchQuery.toLowerCase().trim();
            const searchMatch = !normalizedQuery ||
                report.id.toLowerCase().includes(normalizedQuery) ||
                report.title_en.toLowerCase().includes(normalizedQuery) ||
                report.title_ar.includes(searchQuery.trim()) ||
                report.municipality.toLowerCase().includes(normalizedQuery);
            const userMatch = !userIdFilter || report.created_by === userIdFilter;
            return categoryMatch && statusMatch && searchMatch && userMatch;
        });
        
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;
        
        filtered.sort((a, b) => {
            let aVal, bVal;
            if (key === 'title') {
                aVal = language === 'ar' ? a.title_ar : a.title_en;
                bVal = language === 'ar' ? b.title_ar : b.title_en;
            } else {
                aVal = a[key];
                bVal = b[key];
            }

            if (aVal < bVal) return -1 * direction;
            if (aVal > bVal) return 1 * direction;
            return 0;
        });

        return filtered;
    }, [allReports, activeCategories, activeStatuses, searchQuery, sortConfig, language, userIdFilter]);


    const handleDelete = async (reportId: string, reportTitle: string) => {
        if (window.confirm(t.deleteReportConfirm.replace('{title}', reportTitle || reportId))) {
            setDeletingReportId(reportId);
            try {
                await deleteReport(reportId);
            } catch (error) {
                console.error("Failed to delete report:", error);
                alert("Error: Could not delete the report. Please check the console for details.");
            } finally {
                setDeletingReportId(null);
            }
        }
    };
    
    const requestSort = (key: SortKey) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const SortableHeader: React.FC<{ sortKey: SortKey; children: React.ReactNode; }> = ({ sortKey, children }) => {
        const isSorted = sortConfig.key === sortKey;
        const Icon = isSorted ? (sortConfig.direction === 'ascending' ? FaSortUp : FaSortDown) : FaSort;
        return (
            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark">
                <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 hover:text-navy dark:hover:text-text-primary-dark transition-colors">
                    <span>{children}</span>
                    <Icon className={isSorted ? 'text-coral dark:text-coral-dark' : 'opacity-30'} />
                </button>
            </th>
        );
    };


    if (loading && allReports.length === 0) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-6">All Reports ({allReports.length})</h1>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                 <div className="flex items-center gap-4 flex-wrap">
                    <PortalReportFilters 
                        activeCategories={activeCategories}
                        setActiveCategories={setActiveCategories}
                        activeStatuses={activeStatuses}
                        setActiveStatuses={setActiveStatuses}
                    />
                    {userIdFilter && filteredUser && (
                        <div className="flex items-center gap-2 p-2 bg-coral/10 dark:bg-coral-dark/20 rounded-lg text-sm animate-fade-in">
                            <span className="font-semibold text-coral dark:text-coral-dark">
                                Filtering by user: <span className="font-bold">{filteredUser.display_name}</span>
                            </span>
                            <button 
                                onClick={handleClearUserFilter} 
                                className="text-coral dark:text-coral-dark hover:opacity-70" 
                                title="Clear user filter"
                            >
                                <FaXmark />
                            </button>
                        </div>
                    )}
                </div>
                <div className="relative w-full md:w-auto">
                    <span className="absolute top-1/2 -translate-y-1/2 left-3 text-text-secondary-dark"><FaMagnifyingGlass/></span>
                    <input
                        type="search"
                        placeholder="Search by ID, title, municipality..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full md:w-72 pl-10 pr-4 py-2 rounded-lg bg-card dark:bg-surface-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-coral-dark"
                    />
                </div>
            </div>

            <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-left min-w-[1024px]">
                    <thead className="bg-muted dark:bg-border-dark/20">
                        <tr>
                            <SortableHeader sortKey="created_at">Date</SortableHeader>
                            <SortableHeader sortKey="title">Report Title</SortableHeader>
                            <SortableHeader sortKey="municipality">Municipality</SortableHeader>
                            <SortableHeader sortKey="status">Status</SortableHeader>
                            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredReports.map((report) => {
                           const title = language === 'ar' ? report.title_ar : report.title_en;
                           return (
                               <tr 
                                 key={report.id} 
                                 onClick={() => navigate(`/superadmin/reports/${report.id}`)}
                                 className="border-b border-border-light dark:border-border-dark hover:bg-muted dark:hover:bg-border-dark/30 cursor-pointer"
                               >
                                  <td className="p-4 text-text-secondary dark:text-text-secondary-dark">{new Date(report.created_at).toLocaleDateString()}</td>
                                  <td className="p-4">
                                      <p className="font-bold text-navy dark:text-text-primary-dark">{title}</p>
                                      <p className="text-xs font-mono text-text-secondary/70 dark:text-text-secondary-dark/70">{report.id}</p>
                                  </td>
                                  <td className="p-4 text-text-secondary dark:text-text-secondary-dark capitalize">{report.municipality}</td>
                                  <td className="p-4 text-text-secondary dark:text-text-secondary-dark">{t[report.status]}</td>
                                  <td className="p-4">
                                      {deletingReportId === report.id ? (
                                        <div className="flex justify-center items-center">
                                            <span className="animate-spin text-coral"><FaSpinner/></span>
                                        </div>
                                      ) : (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(report.id, title);
                                            }}
                                            className="p-2 text-coral dark:text-coral-dark hover:bg-coral/10 rounded-full"
                                            title="Delete Report"
                                        >
                                            <FaTrash />
                                        </button>
                                      )}
                                  </td>
                               </tr>
                           );
                        })}
                    </tbody>
                </table>
                {sortedAndFilteredReports.length === 0 && (
                    <div className="p-16 text-center text-text-secondary dark:text-text-secondary-dark">
                        <p>{allReports.length > 0 ? 'No reports match the current filters.' : 'No reports found in the database.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminReportsPage;