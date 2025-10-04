import * as React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { User } from '../../types';
import Spinner from '../../components/Spinner';
import { FaKey, FaSpinner, FaXmark, FaSort, FaSortUp, FaSortDown, FaPenToSquare } from 'react-icons/fa6';

const EditUserPasswordModal: React.FC<{
    user: User;
    onClose: () => void;
    onSave: (userId: string, updates: { newPassword: string }) => Promise<void>;
}> = ({ user, onClose, onSave }) => {
    const [password, setPassword] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            alert("Password cannot be empty.");
            return;
        }
        setIsSaving(true);
        try {
            await onSave(user.id, { newPassword: password });
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
            <div className="bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-md m-4 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark"><FaXmark /></button>
                <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-4">Set Password for {user.display_name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">New Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-lg"/>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal text-white font-bold rounded-lg disabled:bg-gray-400">
                            {isSaving ? <FaSpinner className="animate-spin"/> : 'Set Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


type SortKey = 'display_name' | 'username' | 'points' | 'reports_count';
interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

const SuperAdminUsersPage: React.FC = () => {
    const { allUsers, loading, updateUser } = React.useContext(SuperAdminContext);
    const [editingUser, setEditingUser] = React.useState<User | null>(null);
    const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'points', direction: 'descending' });

    const sortedUsers = React.useMemo(() => {
        const citizenUsers = allUsers.filter(u => u.role === 'citizen' && !u.is_anonymous);
        
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;

        citizenUsers.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];
            let comparison = 0;

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                comparison = aVal.localeCompare(bVal);
            } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                comparison = aVal - bVal;
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

    const handleSavePassword = async (userId: string, updates: { newPassword: string }) => {
        await updateUser(userId, updates);
        alert(`Password has been updated successfully.`);
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    
    return (
        <div>
            {editingUser && <EditUserPasswordModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSavePassword} />}
            <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-6">Citizen Users</h1>
            
            <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-left min-w-[768px]">
                    <thead className="bg-muted dark:bg-border-dark/20">
                        <tr>
                            <SortableHeader sortKey="display_name">Display Name</SortableHeader>
                            <SortableHeader sortKey="username">Username</SortableHeader>
                            <SortableHeader sortKey="points">Points</SortableHeader>
                            <SortableHeader sortKey="reports_count">Reports</SortableHeader>
                            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map((user) => (
                           <tr key={user.id} className="border-b border-border-light dark:border-border-dark">
                              <td className="p-4 flex items-center gap-3">
                                  <img src={user.avatarUrl} alt={user.display_name} className="w-10 h-10 rounded-full" />
                                  <span className="font-bold text-navy dark:text-text-primary-dark">{user.display_name}</span>
                              </td>
                              <td className="p-4 text-text-secondary dark:text-text-secondary-dark font-mono">{user.username}</td>
                              <td className="p-4 font-bold text-mango dark:text-mango-dark">{user.points}</td>
                              <td className="p-4 text-text-secondary dark:text-text-secondary-dark">{user.reports_count}</td>
                              <td className="p-4">
                                 <button 
                                    onClick={() => setEditingUser(user)}
                                    className="p-2 text-sky dark:text-cyan-dark hover:bg-sky/10 rounded-full"
                                    title="Set Password"
                                >
                                    <FaKey />
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
