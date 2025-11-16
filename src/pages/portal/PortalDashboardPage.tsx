import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PortalContext } from '../../contexts/PortalContext';
import { AppContext } from '../../contexts/AppContext';
import { Report, ReportStatus, ReportCategory } from '../../types';
import { CATEGORIES } from '../../constants';
import Spinner from '../../components/Spinner';
import { FaFolder, FaRegClock, FaChartLine, FaTriangleExclamation, FaCheck, FaList, FaHourglassHalf, FaArrowRight } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import ResolutionProofModal from '../../components/portal/ResolutionProofModal';

// Stat Card component
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg flex items-center gap-4 transition-transform hover:scale-105">
        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-md text-text-secondary dark:text-text-secondary-dark font-bold">{title}</p>
            <p className="text-4xl font-bold text-navy dark:text-text-primary-dark">{value}</p>
        </div>
    </div>
);

const PortalDashboardPage: React.FC = () => {
    const { reports, loading, allReportHistory, updateReportStatus, resolveReportWithProof, currentUser } = React.useContext(PortalContext);
    const { t, theme, language } = React.useContext(AppContext);
    const navigate = useNavigate();
    const [resolvingReport, setResolvingReport] = React.useState<Report | null>(null);
    
    const canWrite = currentUser?.portal_access_level === 'read_write' || currentUser?.role === 'super_admin';

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

    const ReportItem: React.FC<{ report: Report }> = ({ report }) => {
        const title = language === 'ar' ? report.title_ar : report.title_en;
    
        const getNextAction = (): { label: string; status: ReportStatus } | null => {
            switch (report.status) {
                case ReportStatus.New: return { label: t.markAsReceived, status: ReportStatus.Received };
                case ReportStatus.Received: return { label: t.startInvestigation, status: ReportStatus.InProgress };
                case ReportStatus.InProgress: return { label: t.markAsResolved, status: ReportStatus.Resolved };
                default: return null;
            }
        };
        const nextAction = getNextAction();
    
        return (
            <div className="p-2 bg-muted dark:bg-bg-dark rounded-lg flex flex-col gap-2 hover:shadow-md transition-shadow">
                <div onClick={() => navigate(`/portal/reports/${report.id}`)} className="flex items-center gap-3 cursor-pointer">
                    <img src={report.photo_urls[0]} alt={title} className="w-10 h-10 object-cover rounded-md flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-navy dark:text-text-primary-dark truncate">{title}</p>
                        <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{new Date(report.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="text-text-secondary/50 dark:text-text-secondary-dark/50 flex-shrink-0"><FaArrowRight/></span>
                </div>
                {canWrite && nextAction && (
                    <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(report, nextAction.status); }}
                        className="w-full text-xs font-bold py-1.5 rounded-md bg-teal/20 text-teal dark:bg-teal-dark/20 dark:text-teal-dark hover:bg-teal/30 dark:hover:bg-teal-dark/30 transition-colors"
                    >
                        {nextAction.label}
                    </button>
                )}
            </div>
        );
    };

    const StatusSummaryCard: React.FC<{
        title: string;
        value: number;
        icon: React.ReactNode;
        color: string;
        reportsList: Report[];
        status: ReportStatus;
    }> = ({ title, value, icon, color, reportsList, status }) => {
        const handleSeeMore = () => {
            navigate(`/portal/reports?status=${status}`);
        };

        return (
            <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg flex flex-col h-full">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${color}`}>
                            {icon}
                        </div>
                        <div>
                            <p className="text-md text-text-secondary dark:text-text-secondary-dark font-bold">{title}</p>
                            <p className="text-4xl font-bold text-navy dark:text-text-primary-dark">{value}</p>
                        </div>
                    </div>
                </div>
                <div className="my-4 border-t border-border-light dark:border-border-dark" />
                <div className="space-y-2 flex-grow">
                    {reportsList.length > 0 ? (
                        reportsList.map(report => <ReportItem key={report.id} report={report} />)
                    ) : (
                        <div className="flex items-center justify-center h-full text-center text-sm text-text-secondary dark:text-text-secondary-dark">
                            <p>{t.noRecentReportsInStatus}</p>
                        </div>
                    )}
                </div>
                {value > 0 && (
                    <button onClick={handleSeeMore} className="mt-4 w-full text-center py-2 bg-muted dark:bg-bg-dark rounded-lg font-bold text-teal dark:text-teal-dark hover:bg-gray-200 dark:hover:bg-border-dark transition-colors">
                        {t.seeAll.replace('{count}', String(value))}
                    </button>
                )}
            </div>
        );
    };

    const stats = React.useMemo(() => {
        const now = new Date();
        const openReports = reports.filter(r => r.status !== ReportStatus.Resolved);
        const totalAgeInDays = openReports.reduce((acc, report) => {
            const reportDate = new Date(report.created_at);
            const ageInMillis = now.getTime() - reportDate.getTime();
            return acc + (ageInMillis / (1000 * 3600 * 24));
        }, 0);

        return {
            total: reports.length,
            new: reports.filter(r => r.status === ReportStatus.New).length,
            received: reports.filter(r => r.status === ReportStatus.Received).length,
            inProgress: reports.filter(r => r.status === ReportStatus.InProgress).length,
            resolved: reports.filter(r => r.status === ReportStatus.Resolved).length,
            avgAge: openReports.length > 0 ? (totalAgeInDays / openReports.length).toFixed(1) : '0',
        };
    }, [reports]);

    const getTopReportsForStatus = React.useCallback((status: ReportStatus, count: number): Report[] => {
        const reportsInStatus = reports.filter(r => r.status === status);
        const reportsWithTimestamp = reportsInStatus.map(report => {
            const historyEntriesForStatus = allReportHistory
                .filter(h => h.report_id === report.id && h.status === status)
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            
            const timestamp = historyEntriesForStatus.length > 0 
                ? historyEntriesForStatus[0].updated_at 
                : report.created_at;
            
            return { ...report, status_timestamp: timestamp };
        });

        reportsWithTimestamp.sort((a, b) => new Date(b.status_timestamp).getTime() - new Date(a.status_timestamp).getTime());
        return reportsWithTimestamp.slice(0, count);
    }, [reports, allReportHistory]);

    const topNewReports = React.useMemo(() => getTopReportsForStatus(ReportStatus.New, 3), [getTopReportsForStatus]);
    const topReceivedReports = React.useMemo(() => getTopReportsForStatus(ReportStatus.Received, 3), [getTopReportsForStatus]);
    const topInProgressReports = React.useMemo(() => getTopReportsForStatus(ReportStatus.InProgress, 3), [getTopReportsForStatus]);
    const topResolvedReports = React.useMemo(() => getTopReportsForStatus(ReportStatus.Resolved, 3), [getTopReportsForStatus]);

    const timeData = React.useMemo(() => {
        const sortedReports = [...reports].sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const countsByDay: { [date: string]: number } = {};
        
        sortedReports.forEach(report => {
            const date = new Date(report.created_at).toISOString().split('T')[0];
            countsByDay[date] = (countsByDay[date] || 0) + 1;
        });

        return Object.keys(countsByDay).map(date => ({
            date: new Date(date).toLocaleDateString(language === 'ar' ? 'ar-LB' : 'en-US', { month: 'short', day: 'numeric' }),
            count: countsByDay[date],
        }));
    }, [reports, language]);
    
    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner />
            </div>
        );
    }
    
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
          return (
            <div className="bg-card dark:bg-surface-dark p-2 border border-border-light dark:border-border-dark rounded-lg shadow-lg">
              <p className="font-bold text-navy dark:text-text-primary-dark">{`${label} : ${payload[0].value}`}</p>
            </div>
          );
        }
        return null;
    };

    const statusCardsData = [
        { title: t.newReports, value: stats.new, icon: <span className="text-white"><FaTriangleExclamation size={24}/></span>, color: "bg-coral dark:bg-coral-dark", reportsList: topNewReports, status: ReportStatus.New },
        { title: t.receivedReports, value: stats.received, icon: <span className="text-white"><FaList size={24}/></span>, color: "bg-sky dark:bg-cyan-dark", reportsList: topReceivedReports, status: ReportStatus.Received },
        { title: t.inProgressReports, value: stats.inProgress, icon: <span className="text-white"><FaHourglassHalf size={24}/></span>, color: "bg-teal dark:bg-teal-dark", reportsList: topInProgressReports, status: ReportStatus.InProgress },
        { title: t.resolvedReports, value: stats.resolved, icon: <span className="text-white"><FaCheck size={24}/></span>, color: "bg-mango dark:bg-mango-dark", reportsList: topResolvedReports, status: ReportStatus.Resolved },
    ];


    return (
        <div>
            {resolvingReport && (
                <ResolutionProofModal
                    report={resolvingReport}
                    onClose={() => setResolvingReport(null)}
                    onSubmit={handleResolutionSubmit}
                />
            )}
            <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-6">{t.dashboard}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <StatCard title={t.totalReports} value={stats.total} icon={<span className="text-white"><FaFolder size={28}/></span>} color="bg-sky dark:bg-cyan-dark" />
                <StatCard title={t.avgAgeOpenReports} value={`${stats.avgAge} ${t.days}`} icon={<span className="text-white"><FaRegClock size={28}/></span>} color="bg-navy dark:bg-sand text-sand dark:text-navy" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {statusCardsData.map(data => <StatusSummaryCard key={data.title} {...data} />)}
            </div>

            <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-navy dark:text-text-primary-dark mb-4 flex items-center gap-2"><FaChartLine /> {t.reportsOverTime}</h2>
                <div className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={timeData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00BFA6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#00BFA6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#B0B8C1' : '#4B5B67', fontSize: 12 }} />
                            <YAxis tick={{ fill: theme === 'dark' ? '#B0B8C1' : '#4B5B67', fontSize: 12 }} />
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#273445' : '#E6E0DC'} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area type="monotone" dataKey="count" stroke="#00BFA6" fillOpacity={1} fill="url(#colorUv)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default PortalDashboardPage;