import * as React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { User } from '../../types';
import Spinner from '../../components/Spinner';
import { FaSpinner, FaXmark, FaSort, FaSortUp, FaSortDown, FaPenToSquare, FaUserSecret } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import { PATHS } from '../../constants';

const EditUserModal: React.FC<{
    user: User;
    onClose: () => void;
    onSave: (userId: string, updates: Partial<User> & { newPassword?: string, pointAdjustment?: number }) => Promise<void>;
}> = ({ user, onClose, onSave }) => {
    const [displayName, setDisplayName] = React.useState(user.display_name);
    const [pointAdjustment, setPointAdjustment] = React.useState('0');
    const [isActive, setIsActive] = React.useState(user.is_active ?? true);
    const [newPassword, setNewPassword] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updates: Partial<User> & { newPassword?: string; pointAdjustment?: number } = {};
            if (displayName !== user.display_name) updates.display_name = displayName;
            if (isActive !== (user.is_active ?? true)) updates.is_active = isActive;
            if (newPassword) updates.newPassword = newPassword;
            
            const points = parseInt(pointAdjustment, 10);
            if (!isNaN(points) && points !== 0) {
                updates.pointAdjustment = points;
            }

            await onSave(user.id, updates);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-lg m-4 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark"><FaXmark /></button>
                <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-6">Edit User: {user.display_name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">Display Name</label>
                        <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full p-2 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-lg"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">Points (Current: {user.points})</label>
                            <input type="number" value={pointAdjustment} onChange={e => setPointAdjustment(e.target.value)} placeholder="e.g., 50 or -25" className="w-full p-2 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-lg"/>
                        </div>
                        <div>
                             <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">New Password</label>
                            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep" className="w-full p-2 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-lg"/>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted dark:bg-bg-dark rounded-lg">
                        <label htmlFor="isActive" className="font-bold text-navy dark:text-text-primary-dark">Account Active</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="isActive" id="isActive" checked={isActive} onChange={() => setIsActive(!isActive)} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                            <label htmlFor="isActive" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                        </div>
                        <style>{`.toggle-checkbox:checked { right: 0; border-color: #00BFA6; } .toggle-checkbox:checked + .toggle-label { background-color: #00BFA6; }`}</style>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal text-white font-bold rounded-lg disabled:bg-gray-400">
                            {isSaving ? <span className="animate-spin"><FaSpinner/></span> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


type SortKey = 'display_name' | 'username' | 'points' | 'reports_count' | 'is_active';
interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

const SuperAdminUsersPage: React.FC = () => {
    const { allUsers, loading, updateUser, currentUser: superAdminUser } = React.useContext(SuperAdminContext);
    const { setTempUserOverride } = React.useContext(AppContext);
    const [editingUser, setEditingUser] = React.useState<User | null>(null);
    const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'points', direction: 'descending' });

    const sortedUsers = React.useMemo(() => {
        const citizenUsers = allUsers.filter(u => u.role === 'citizen' && !u.is_anonymous);
        
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;

        citizenUsers.sort((a, b) => {
            const aVal = a[key] ?? true; // Default is_active to true if undefined
            const bVal = b[key] ?? true;
            let comparison = 0;

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                comparison = aVal.localeCompare(bVal);
            } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
            } else if (typeof aVal === 'boolean' && typeof bVal === 'boolean') {
                comparison = aVal === bVal ? 0 : (aVal ? -1 : 1);
            }

            return comparison * direction;
        });

        return citizenUsers;
    }, [allUsers, sortConfig]);
    
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

    const handleSave = async (userId: string, updates: Partial<User> & { newPassword?: string, pointAdjustment?: number }) => {
        await updateUser(userId, updates);
    };
    
    const handleImpersonate = (e: React.MouseEvent, userToImpersonate: User) => {
        e.stopPropagation();
        if (!superAdminUser) {
            console.error("Super admin user context is not available.");
            return;
        }
        if (window.confirm(`Are you sure you want to view the app as ${userToImpersonate.display_name}?`)) {
            setTempUserOverride(userToImpersonate, superAdminUser, PATHS.HOME);
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    
    return (
        <div>
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSave} />}
            <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-6">Citizen Users</h1>
            
            <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-left min-w-[768px]">
                    <thead className="bg-muted dark:bg-border-dark/20">
                        <tr>
                            <SortableHeader sortKey="display_name">Display Name</SortableHeader>
                            <SortableHeader sortKey="username">Username</SortableHeader>
                            <SortableHeader sortKey="is_active">Status</SortableHeader>
                            <SortableHeader sortKey="points">Points</SortableHeader>
                            <SortableHeader sortKey="reports_count">Reports</SortableHeader>
                            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((user) => (
                           <tr 
                             key={user.id} 
                             onClick={() => setEditingUser(user)}
                             className="border-b border-border-light dark:border-border-dark hover:bg-muted dark:hover:bg-border-dark/30 cursor-pointer"
                           >
                              <td className="p-4 flex items-center gap-3">
                                  <img src={user.avatarUrl} alt={user.display_name} className="w-10 h-10 rounded-full" />
                                  <span className="font-bold text-navy dark:text-text-primary-dark">{user.display_name}</span>
                              </td>
                              <td className="p-4 text-text-secondary dark:text-text-secondary-dark font-mono">{user.username}</td>
                              <td className="p-4">
                                {user.is_active ?? true ? 
                                    <span className="flex items-center gap-2 text-teal dark:text-teal-dark"><div className="w-2 h-2 rounded-full bg-teal dark:bg-teal-dark"></div> Active</span> : 
                                    <span className="flex items-center gap-2 text-coral dark:text-coral-dark"><div className="w-2 h-2 rounded-full bg-coral dark:bg-coral-dark"></div> Suspended</span>
                                }
                              </td>
                              <td className="p-4 font-bold text-mango dark:text-mango-dark">{user.points}</td>
                              <td className="p-4 text-text-secondary dark:text-text-secondary-dark">
                                {user.reports_count > 0 ? (
                                    <Link 
                                        to={`/superadmin/reports?userId=${user.id}`} 
                                        className="text-sky dark:text-cyan-dark hover:underline font-bold"
                                        title={`View reports by ${user.display_name}`}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {user.reports_count}
                                    </Link>
                                ) : (
                                    user.reports_count
                                )}
                              </td>
                              <td className="p-4 flex items-center gap-1">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); setEditingUser(user); }}
                                    className="p-2 text-sky dark:text-cyan-dark hover:bg-sky/10 rounded-full"
                                    title="Edit User"
                                >
                                    <FaPenToSquare />
                                 </button>
                                 <button
                                    onClick={(e) => handleImpersonate(e, user)}
                                    className="p-2 text-mango dark:text-mango-dark hover:bg-mango/10 rounded-full"
                                    title={`View as ${user.display_name}`}
                                 >
                                    <FaUserSecret />
                                 </button>
                              </td>
                           </tr>
                        ))}
                    </tbody>
                </table>
                {sortedUsers.length === 0 && (
                    <div className="p-16 text-center text-text-secondary dark:text-text-secondary-dark">
                        <p>No citizen users have signed up yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminUsersPage;