import * as React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { User } from '../../types';
import Spinner from '../../components/Spinner';
import { FaPenToSquare, FaSpinner, FaSort, FaSortUp, FaSortDown, FaPlus, FaUserSecret, FaTrash } from 'react-icons/fa6';
import AdminAccountEditModal from '../../components/superadmin/AdminAccountEditModal';
import { useNavigate } from 'react-router-dom';

type AdminUser = User & { reportsCount: number };
type SortKey = 'display_name' | 'username' | 'reportsCount' | 'role' | 'is_active';
interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

const SuperAdminAdminAccountsPage: React.FC = () => {
    const { allUsers, allReports, loading, updateUser, createAdminUser, categories, currentUser: superAdminUser, deleteUser } = React.useContext(SuperAdminContext);
    const { setTempUserOverride } = React.useContext(AppContext);
    const [modalState, setModalState] = React.useState<{ mode: 'add' | 'edit'; user?: AdminUser } | null>(null);
    const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'reportsCount', direction: 'descending' });

    const sortedAdminUsers = React.useMemo(() => {
        const adminUsers = allUsers.filter(u => u.role === 'municipality' || u.role === 'utility' || u.role === 'union_of_municipalities');
        const reportsByMunicipality = allReports.reduce((acc, report) => {
            acc[report.municipality] = (acc[report.municipality] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const usersWithCount: AdminUser[] = adminUsers.map(user => ({
            ...user,
            reportsCount: reportsByMunicipality[user.municipality_id || ''] || 0
        }));
        
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;

        usersWithCount.sort((a, b) => {
            const aVal = (a as any)[key] ?? true; // Default is_active to true
            const bVal = (b as any)[key] ?? true;
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

        return usersWithCount;
    }, [allUsers, allReports, sortConfig]);
    
    const handleSave = async (data: Partial<User> & { newPassword?: string }, mode: 'add' | 'edit', userId?: string) => {
        try {
            if (mode === 'add') {
                // @ts-ignore
                await createAdminUser({
                    role: data.role!,
                    full_name: data.display_name!,  // Backend expects full_name
                    username: data.username!,
                    password: data.newPassword || 'password123',
                    municipality: data.municipality_id,  // Backend expects municipality, not municipality_id
                    portal_title: data.portal_title,
                    portal_subtitle: data.portal_subtitle,
                    portal_access_level: data.portal_access_level,
                });
            } else if (mode === 'edit' && userId) {
                await updateUser(userId, data);
            }
        } catch (error: any) {
            console.error('❌ handleSave error:', error);
            throw error;  // Re-throw so the modal can catch and display it
        }
    };
    
    const handleImpersonate = (e: React.MouseEvent, userToImpersonate: User) => {
        e.stopPropagation();
        if (!superAdminUser) {
            console.error("Super admin user context is not available.");
            return;
        }
        if (window.confirm(`Are you sure you want to view the PORTAL as ${userToImpersonate.display_name}?`)) {
            setTempUserOverride(userToImpersonate, superAdminUser, '/portal/dashboard');
        }
    };

    const handleDelete = async (e: React.MouseEvent, user: User) => {
        e.stopPropagation();
        if (window.confirm(`Are you absolutely sure you want to DELETE ${user.display_name}? This cannot be undone.`)) {
            try {
                await deleteUser(user.id);
                alert(`${user.display_name} has been deleted.`);
            } catch (error: any) {
                console.error('❌ Delete error:', error);
                alert(`Failed to delete user: ${error?.message || 'Unknown error'}`);
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
        return (
            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark">
                <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 hover:text-navy dark:hover:text-text-primary-dark transition-colors">
                    <span>{children}</span>
                    <span className={isSorted ? 'text-coral dark:text-coral-dark' : 'opacity-30'}>
                        {isSorted ? (sortConfig.direction === 'ascending' ? <FaSortUp /> : <FaSortDown />) : <FaSort />}
                    </span>
                </button>
            </th>
        );
    };


    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    
    return (
        <div>
            {modalState && <AdminAccountEditModal mode={modalState.mode} user={modalState.user} allUsers={allUsers} allReports={allReports} categories={categories} onClose={() => setModalState(null)} onSave={handleSave} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark">Admin Accounts</h1>
                <button 
                    onClick={() => setModalState({ mode: 'add' })}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-teal text-white"
                >
                    <FaPlus /> Add New Account
                </button>
            </div>
            
            <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-left min-w-[768px]">
                    <thead className="bg-muted dark:bg-border-dark/20">
                        <tr>
                            <SortableHeader sortKey="display_name">Display Name</SortableHeader>
                            <SortableHeader sortKey="role">Role</SortableHeader>
                            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark">Scope</th>
                            <SortableHeader sortKey="username">Username</SortableHeader>
                            <SortableHeader sortKey="is_active">Status</SortableHeader>
                            <th className="p-4 font-bold text-text-secondary dark:text-text-secondary-dark">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAdminUsers.map((user) => (
                           <tr 
                            key={user.id} 
                            onClick={(e) => { e.stopPropagation(); setModalState({ mode: 'edit', user: user }); }}
                            className="border-b border-border-light dark:border-border-dark hover:bg-muted dark:hover:bg-border-dark/30 cursor-pointer"
                           >
                              <td className="p-4 flex items-center gap-3">
                                  <img src={user.avatarUrl} alt={user.display_name} className="w-10 h-10 rounded-full" />
                                  <span className="font-bold text-navy dark:text-text-primary-dark">{user.display_name}</span>
                              </td>
                              <td className="p-4 capitalize">{user.role.replace(/_/g, ' ')}</td>
                              <td className="p-4 text-sm">
                                {user.role === 'municipality' && <span className="font-semibold capitalize">{user.municipality_id}</span>}
                                {user.role === 'union_of_municipalities' && (
                                     <div className="flex flex-wrap gap-1">
                                        {(user.scoped_municipalities || []).map(m => <span key={m} className="text-xs bg-mango/20 text-mango-dark font-semibold px-2 py-0.5 rounded-full capitalize">{m}</span>)}
                                    </div>
                                )}
                                {user.role === 'utility' && (
                                    <div className="flex flex-col gap-1">
                                        <div className="flex flex-wrap gap-1">
                                            {(user.scoped_categories || []).map(c => <span key={c} className="text-xs bg-sky/20 text-sky-dark font-semibold px-2 py-0.5 rounded-full">{c}</span>)}
                                        </div>
                                         <div className="flex flex-wrap gap-1">
                                            {(user.scoped_municipalities || []).map(m => <span key={m} className="text-xs bg-mango/20 text-mango-dark font-semibold px-2 py-0.5 rounded-full capitalize">{m}</span>)}
                                        </div>
                                    </div>
                                )}
                              </td>
                              <td className="p-4 text-text-secondary dark:text-text-secondary-dark font-mono">{user.username}</td>
                               <td className="p-4">
                                {user.is_active ?? true ? 
                                    <span className="flex items-center gap-2 text-teal dark:text-teal-dark"><div className="w-2 h-2 rounded-full bg-teal dark:bg-teal-dark"></div> Active</span> : 
                                    <span className="flex items-center gap-2 text-coral dark:text-coral-dark"><div className="w-2 h-2 rounded-full bg-coral dark:bg-coral-dark"></div> Suspended</span>
                                }
                              </td>
                              <td className="p-4 flex items-center gap-1">
                                 <button 
                                    onClick={(e) => { e.stopPropagation(); setModalState({ mode: 'edit', user: user }); }}
                                    className="p-2 text-sky dark:text-cyan-dark hover:bg-sky/10 rounded-full"
                                    title="Edit Account"
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
                                 <button
                                    onClick={(e) => handleDelete(e, user)}
                                    className="p-2 text-coral dark:text-coral-dark hover:bg-coral/10 rounded-full"
                                    title="Delete Account"
                                 >
                                    <FaTrash />
                                 </button>
                              </td>
                           </tr>
                        ))}
                    </tbody>
                </table>
                {sortedAdminUsers.length === 0 && (
                    <div className="p-16 text-center text-text-secondary dark:text-text-secondary-dark">
                        <p>No admin accounts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminAdminAccountsPage;