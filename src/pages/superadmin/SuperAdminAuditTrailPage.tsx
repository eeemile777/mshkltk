import React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { AuditLog, User } from '../../types';
import Spinner from '../../components/Spinner';
import { FaPen, FaTrash, FaPlus, FaUser, FaListCheck, FaSitemap } from 'react-icons/fa6';

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

const getActionIcon = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('delete')) return <span className="text-coral"><FaTrash/></span>;
    if (lowerMessage.includes('create') || lowerMessage.includes('submitted')) return <span className="text-teal"><FaPlus/></span>;
    if (lowerMessage.includes('update') || lowerMessage.includes('change')) return <span className="text-sky"><FaPen/></span>;
    if (lowerMessage.includes('user')) return <FaUser />;
    if (lowerMessage.includes('report')) return <FaListCheck />;
    if (lowerMessage.includes('category')) return <FaSitemap />;
    return <FaListCheck />;
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
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${roleStyles[role]}`}>
            {roleName}
        </span>
    );
};


const SuperAdminAuditTrailPage: React.FC = () => {
    const { auditLogs, loading } = React.useContext(SuperAdminContext);
    const [searchQuery, setSearchQuery] = React.useState('');

    const filteredLogs = React.useMemo(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        return (auditLogs || [])
            .filter(log => 
                log.actorName.toLowerCase().includes(lowerCaseQuery) ||
                log.message.toLowerCase().includes(lowerCaseQuery)
            )
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [auditLogs, searchQuery]);

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark">Audit Trail</h1>
                <input
                    type="search"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-64 pl-4 pr-4 py-2 rounded-lg bg-card dark:bg-surface-dark border border-border-light dark:border-border-dark focus:ring-2 focus:ring-coral-dark"
                />
            </div>

            <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg">
                <div className="space-y-2 p-4">
                    {filteredLogs.length > 0 ? filteredLogs.map(log => (
                        <div key={log.id} className="p-3 flex items-start gap-4 hover:bg-muted dark:hover:bg-surface-dark/50 rounded-lg">
                            <div className="mt-1 w-8 h-8 flex-shrink-0 flex items-center justify-center bg-muted dark:bg-bg-dark rounded-full">
                                {getActionIcon(log.message)}
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm text-text-primary dark:text-text-primary-dark">
                                    <span className="font-bold">{log.actorName}</span>
                                    <RoleBadge role={log.actorRole} />
                                    {' '}{log.message}
                                </p>
                                <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
                                    {timeAgo(new Date(log.timestamp))} ({new Date(log.timestamp).toLocaleString()})
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center p-16 text-text-secondary dark:text-text-secondary-dark">
                            <p>No audit logs found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminAuditTrailPage;