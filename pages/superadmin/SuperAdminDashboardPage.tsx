import * as React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import Spinner from '../../components/Spinner';
import { FaUsers, FaListCheck, FaBuilding } from 'react-icons/fa6';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-md text-text-secondary dark:text-text-secondary-dark font-bold">{title}</p>
            <p className="text-4xl font-bold text-navy dark:text-text-primary-dark">{value}</p>
        </div>
    </div>
);


const SuperAdminDashboardPage: React.FC = () => {
    const { allUsers, allReports, loading } = React.useContext(SuperAdminContext);

    const stats = React.useMemo(() => {
        const citizenUsers = allUsers.filter(u => u.role === 'citizen' && !u.is_anonymous);
        const municipalityUsers = allUsers.filter(u => u.role === 'municipality');
        return {
            totalUsers: citizenUsers.length,
            totalReports: allReports.length,
            totalMunicipalities: municipalityUsers.length,
        }
    }, [allUsers, allReports]);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner />
            </div>
        );
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-6">Super Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} icon={<FaUsers size={28} className="text-white"/>} color="bg-teal dark:bg-teal-dark" />
                <StatCard title="Total Reports" value={stats.totalReports} icon={<FaListCheck size={28} className="text-white"/>} color="bg-sky dark:bg-cyan-dark" />
                <StatCard title="Total Municipalities" value={stats.totalMunicipalities} icon={<FaBuilding size={28} className="text-white"/>} color="bg-mango dark:bg-mango-dark" />
            </div>

            <div className="mt-8 bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-navy dark:text-text-primary-dark mb-4">Welcome, Milo!</h2>
                <p className="text-text-secondary dark:text-text-secondary-dark">
                    This is the central control panel for the Mshkltk application. From here, you can monitor all activity, manage users, and oversee all submitted reports across all municipalities.
                </p>
            </div>
        </div>
    );
};

export default SuperAdminDashboardPage;
