import * as React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { User } from '../../types';
import Spinner from '../../components/Spinner';
import { FaPenToSquare, FaSpinner, FaXmark, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa6';

const EditUserModal: React.FC<{
    user: User;
    onClose: () => void;
    onSave: (userId: string, updates: { username?: string; newPassword?: string }) => Promise<void>;
}> = ({ user, onClose, onSave }) => {
    const [username, setUsername] = React.useState(user.username);
    const [password, setPassword] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updates: { username?: string; newPassword?: string } = {};
            if (username !== user.username) {
                updates.username = username;
            }
            if (password) {
                updates.newPassword = password;
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
            <div className="bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-md m-4 flex flex-col relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark"><FaXmark /></button>
                <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-4">Edit {user.display_name}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-lg"/>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">Current Password</label>
                        <input type="text" value={user.password_plain || 'Not Set'} readOnly className="w-full p-2 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-lg font-mono text-gray-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary dark:text-text-secondary-dark mb-2">New Password (optional)</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full p-2 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-lg"/>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal text-white font-bold rounded-lg disabled:bg-gray-400">
                            {isSaving ? <FaSpinner className="animate-spin"/> : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

type MunicipalityUser = User & { reportsCount: number };
type SortKey = 'display_name' | 'username' | 'reportsCount';
interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

const SuperAdminMunicipalitiesPage: React.FC = () => {
    const { allUsers, allReports, loading, updateUser, createMunicipalityUser } = React.useContext(SuperAdminContext);
    const [editingUser, setEditingUser] = React.useState<User | null>(null);
    const [creatingMunicipality, setCreatingMunicipality] = React.useState<string | null>(null);
    const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'reportsCount', direction: 'descending' });

    const sortedMunicipalityUsers = React.useMemo(() => {
        const municipalityUsers = allUsers.filter(u => u.role === 'municipality');
        const reportsByMunicipality = allReports.reduce((acc, report) => {
            acc[report.municipality] = (acc[report.municipality] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const usersWithCount: MunicipalityUser[] = municipalityUsers.map(user => ({
            ...user,
            reportsCount: reportsByMunicipality[user.municipality_id || ''] || 0
        }));
        
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;

        usersWithCount.sort((a, b) => {
            if (a[key] < b[key]) return -1 * direction;
            if (a[key] > b[key]) return 1 * direction;
            return 0;
        });

        return usersWithCount;
    }, [allUsers, allReports, sortConfig]);

    const unregisteredMunicipalities = React.useMemo(() => {
        if (loading) return [];
        const reportedMunicipalities = new Set(allReports.map(r => r.municipality).filter(Boolean));
        const registeredMunicipalities = new Set(allUsers.filter(u => u.role === 'municipality').map(u => u.municipality_id).filter(Boolean));
        return [...reportedMunicipalities].filter(m => !registeredMunicipalities.has(m));
    }, [allReports, allUsers, loading]);


    const handleSave = async (userId: string, updates: { username?: string; newPassword?: string }) => {
        await updateUser(userId, updates);
    };
    
    const handleCreateAccount = async (municipalityId: string) => {
        setCreatingMunicipality(municipalityId);
        try {
            await createMunicipalityUser(municipalityId);
        } catch (e) {
            console.error(e);
            alert(`Failed to create account for ${municipalityId}. It might already exist.`);
        } finally {
            setCreatingMunicipality(null);
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


    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    
    return (
        <div>
            {editingUser && <EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSave} />}
            <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark mb-6">Municipalities</h1>
            
            <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                    <thead className="bg-muted dark:bg-border-dark/20">
                        <tr>
                            <SortableHeader sortKey="display_name">Municipality</SortableHeader>
                            <SortableHeader sortKey="username">Username</SortableHeader>
                            <SortableHeader sortKey="reportsCount">Reports Count</SortableHeader>
                            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedMunicipalityUsers.map((user) => (
                           <tr key={user.id} className="border-b border-border-light dark:border-border-dark">
                              <td className="p-4 flex items-center gap-3">
                                  <img src={user.avatarUrl} alt={user.display_name} className="w-10 h-10 rounded-full" />
                                  <span className="font-bold text-navy dark:text-text-primary-dark">{user.display_name}</span>
                              </td>
                              <td className="p-4 text-text-secondary dark:text-text-secondary-dark font-mono">{user.username}</td>
                              <td className="p-4 text-text-secondary dark:text-text-secondary-dark font-bold text-center">{user.reportsCount}</td>
                              <td className="p-4">
                                 <button 
                                    onClick={() => setEditingUser(user)}
                                    className="p-2 text-teal dark:text-teal-dark hover:bg-teal/10 rounded-full"
                                    title="Edit Credentials"
                                >
                                    <FaPenToSquare />
                                 </button>
                              </td>
                           </tr>
                        ))}
                    </tbody>
                </table>
                {sortedMunicipalityUsers.length === 0 && (
                    <div className="p-16 text-center text-text-secondary dark:text-text-secondary-dark">
                        <p>No municipality accounts found.</p>
                    </div>
                )}
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-4">Unregistered Municipalities</h2>
                {unregisteredMunicipalities.length > 0 ? (
                    <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg p-4 space-y-3">
                        {unregisteredMunicipalities.map(mun => (
                            <div key={mun} className="flex items-center justify-between p-3 bg-muted dark:bg-bg-dark rounded-lg">
                                <span className="font-semibold capitalize">{mun}</span>
                                <button
                                    onClick={() => handleCreateAccount(mun)}
                                    disabled={creatingMunicipality === mun}
                                    className="px-4 py-2 text-sm font-bold text-white bg-teal rounded-lg disabled:bg-gray-400 flex items-center gap-2"
                                >
                                    {creatingMunicipality === mun ? <FaSpinner className="animate-spin"/> : 'Create Account'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary dark:text-text-secondary-dark">All municipalities found in reports have accounts.</p>
                )}
            </div>
        </div>
    );
};

export default SuperAdminMunicipalitiesPage;