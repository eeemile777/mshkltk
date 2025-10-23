import * as React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import Spinner from '../../components/Spinner';
import { FaUsers, FaListCheck, FaBuilding, FaRegClock, FaPen, FaTrash, FaPlus, FaUser, FaSitemap } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import { PATHS } from '../../constants';
// FIX: Import 'ReportCategory' type to resolve 'Cannot find name' error.
import { AuditLog, ReportStatus, User, ReportCategory } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, Legend);

// --- New Components for Dashboard ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${color}`}>{icon}</div>
        <div>
            <p className="text-md text-text-secondary dark:text-text-secondary-dark font-bold">{title}</p>
            <p className="text-4xl font-bold text-navy dark:text-text-primary-dark">{value}</p>
        </div>
    </div>
);

const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const RoleBadge: React.FC<{ role: User['role'] }> = ({ role }) => {
    const roleStyles: { [key in User['role']]: string } = {
        citizen: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        municipality: 'bg-sky/20 text-sky dark:bg-cyan-dark/20 dark:text-cyan-dark',
        utility: 'bg-sky/20 text-sky dark:bg-cyan-dark/20 dark:text-cyan-dark',
        union_of_municipalities: 'bg-sky/20 text-sky dark:bg-cyan-dark/20 dark:text-cyan-dark',
        super_admin: 'bg-coral/20 text-coral dark:bg-coral-dark/20 dark:text-coral-dark',
    };
    const roleName = role.replace(/_/g, ' ');
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${roleStyles[role]}`}>{roleName}</span>;
};

const RecentActivity: React.FC = () => {
    const { auditLogs } = React.useContext(SuperAdminContext);
    const recentLogs = React.useMemo(() => {
        return (auditLogs || [])
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 15);
    }, [auditLogs]);

    return (
        <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg h-full flex flex-col">
            <h2 className="text-xl font-bold text-navy dark:text-text-primary-dark mb-4">Recent Activity</h2>
            <div className="flex-grow space-y-2 overflow-y-auto pr-2">
                {recentLogs.map(log => (
                    <div key={log.id} className="p-2 flex items-start gap-3 hover:bg-muted dark:hover:bg-surface-dark/50 rounded-lg">
                        <div className="mt-1">
                            <RoleBadge role={log.actorRole} />
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-text-primary dark:text-text-primary-dark">
                                <span className="font-bold">{log.actorName}</span> {log.message}
                            </p>
                            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">{timeAgo(new Date(log.timestamp))}</p>
                        </div>
                    </div>
                ))}
            </div>
            <Link to={PATHS.SUPER_ADMIN_AUDIT_TRAIL} className="mt-4 text-center block font-bold text-teal dark:text-teal-dark hover:underline">View All</Link>
        </div>
    );
};

// --- Main Dashboard Page ---

const SuperAdminDashboardPage: React.FC = () => {
    const { allUsers, allReports, allReportHistory, categories, loading, currentUser } = React.useContext(SuperAdminContext);
    const { t, theme } = React.useContext(AppContext);

    const stats = React.useMemo(() => {
        // Main Scorecards
        const citizenUsers = allUsers.filter(u => u.role === 'citizen' && !u.is_anonymous);
        const municipalityUsers = allUsers.filter(u => u.role === 'municipality');

        // Avg Resolution Time
        const reportTimestamps: { [key: string]: { new?: Date, resolved?: Date } } = {};
        allReportHistory.forEach(h => {
            if (!reportTimestamps[h.report_id]) reportTimestamps[h.report_id] = {};
            if (h.status === ReportStatus.New) reportTimestamps[h.report_id].new = new Date(h.updated_at);
            if (h.status === ReportStatus.Resolved) reportTimestamps[h.report_id].resolved = new Date(h.updated_at);
        });

        const durations: number[] = [];
        Object.values(reportTimestamps).forEach(times => {
            if (times.new && times.resolved) {
                durations.push(times.resolved.getTime() - times.new.getTime());
            }
        });
        const avgDurationMs = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
        const avgResolutionDays = (avgDurationMs / (1000 * 3600 * 24)).toFixed(1);

        return {
            totalUsers: citizenUsers.length,
            totalReports: allReports.length,
            totalMunicipalities: municipalityUsers.length,
            avgResolutionDays: avgResolutionDays,
        };
    }, [allUsers, allReports, allReportHistory]);

    const municipalityPerformance = React.useMemo(() => {
        const stats: { [key: string]: { name: string, total: number, resolved: number } } = {};
        allReports.forEach(report => {
            if (!stats[report.municipality]) stats[report.municipality] = { name: report.municipality, total: 0, resolved: 0 };
            stats[report.municipality].total++;
            if (report.status === ReportStatus.Resolved) stats[report.municipality].resolved++;
        });
        return Object.values(stats).sort((a, b) => b.resolved - a.resolved).slice(0, 5);
    }, [allReports]);

    const reportsByCategoryData = React.useMemo(() => {
        const counts = allReports.reduce((acc, report) => {
            acc[report.category] = (acc[report.category] || 0) + 1;
            return acc;
        }, {} as { [key in ReportCategory]?: number });

        const labels = Object.keys(counts).map(catKey => {
            const categoryInfo = categories.find(c => c.id === catKey);
            return categoryInfo ? categoryInfo.name_en : catKey;
        });
        const data = Object.values(counts);
        const backgroundColors = Object.keys(counts).map(catKey => {
            const categoryInfo = categories.find(c => c.id === catKey);
            return categoryInfo ? categoryInfo.color_light : '#9E9E9E';
        });

        return {
            labels,
            datasets: [{ data, backgroundColor: backgroundColors, borderColor: theme === 'dark' ? '#1E2A38' : '#FFFFFF', borderWidth: 2 }]
        };
    }, [allReports, categories, theme]);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark">{t.superAdminDashboardTitle}</h1>
                <p className="text-text-secondary dark:text-text-secondary-dark">{t.superAdminWelcomeMsg}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title={t.totalUsers} value={stats.totalUsers} icon={<span className="text-white"><FaUsers size={28}/></span>} color="bg-teal dark:bg-teal-dark" />
                <StatCard title={t.totalReportsSA} value={stats.totalReports} icon={<span className="text-white"><FaListCheck size={28}/></span>} color="bg-sky dark:bg-cyan-dark" />
                <StatCard title={t.totalMunicipalities} value={stats.totalMunicipalities} icon={<span className="text-white"><FaBuilding size={28}/></span>} color="bg-mango dark:bg-mango-dark" />
                <StatCard title={t.avgAgeOpenReports} value={`${stats.avgResolutionDays} ${t.days}`} icon={<span className="text-white"><FaRegClock size={28}/></span>} color="bg-navy dark:bg-sand text-sand dark:text-navy" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold text-navy dark:text-text-primary-dark mb-4">Municipality Leaderboard (by Resolved Reports)</h2>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={municipalityPerformance} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#273445' : '#E6E0DC'}/>
                                    <XAxis type="number" tick={{ fill: theme === 'dark' ? '#B0B8C1' : '#4B5B67' }} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fill: theme === 'dark' ? '#B0B8C1' : '#4B5B67', fontSize: 12 }} className="capitalize" />
                                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ backgroundColor: theme === 'dark' ? '#121212' : '#FFFFFF', border: 'none', borderRadius: '1rem' }}/>
                                    <Bar dataKey="resolved" fill="#00BFA6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg">
                        <h2 className="text-xl font-bold text-navy dark:text-text-primary-dark mb-4">Reports by Category</h2>
                        <div className="max-w-xs mx-auto">
                            <Doughnut data={reportsByCategoryData} options={{ plugins: { legend: { display: false } } }} />
                        </div>
                    </div>
                </div>

                {/* Sidebar with Recent Activity */}
                <div className="lg:col-span-1">
                    <RecentActivity />
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboardPage;
