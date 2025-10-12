import * as React from 'react';
import { User, Report, ReportCategory } from '../../types';
import { FaSpinner, FaXmark } from 'react-icons/fa6';

interface AdminAccountEditModalProps {
    mode: 'add' | 'edit';
    user?: User;
    allUsers: User[];
    allReports: Report[];
    categories: any[];
    onClose: () => void;
    onSave: (data: Partial<User> & { newPassword?: string }, mode: 'add' | 'edit', userId?: string) => Promise<void>;
}

const AdminAccountEditModal: React.FC<AdminAccountEditModalProps> = ({ mode, user, allUsers, allReports, categories, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        displayName: user?.display_name || '',
        username: user?.username || '',
        newPassword: '',
        role: user?.role || 'municipality',
        municipalityId: user?.municipality_id || '',
        scopedMunicipalities: user?.scoped_municipalities || [],
        scopedSubCategories: user?.scoped_sub_categories || [],
        portalTitle: user?.portal_title || '',
        portalSubtitle: user?.portal_subtitle || '',
        isActive: user?.is_active ?? true,
    });
    const [isSaving, setIsSaving] = React.useState(false);
    
    const availableMunicipalities = React.useMemo(() => {
        const allMunicipalitiesInReports = new Set(allReports.map(r => r.municipality));
        const registeredMunicipalities = new Set(
            allUsers
                .filter(u => u.role === 'municipality' && u.municipality_id && u.id !== user?.id)
                .map(u => u.municipality_id)
        );
        return Array.from(allMunicipalitiesInReports)
            .filter(m => !registeredMunicipalities.has(m))
            .sort();
    }, [allReports, allUsers, user]);
    
    const handleMultiSelectChange = (field: 'scopedSubCategories' | 'scopedMunicipalities', value: string) => {
        setFormData(prev => {
            const currentSelection = prev[field] as string[];
            const newSelection = currentSelection.includes(value)
                ? currentSelection.filter(item => item !== value)
                : [...currentSelection, value];
            return { ...prev, [field]: newSelection };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const updates: Partial<User> & { newPassword?: string } = {
                role: formData.role as User['role'],
                display_name: formData.displayName,
                username: formData.username,
                portal_title: formData.portalTitle,
                portal_subtitle: formData.portalSubtitle,
                is_active: formData.isActive,
            };
            if (formData.newPassword) updates.newPassword = formData.newPassword;
            
            if (formData.role === 'municipality') {
                updates.municipality_id = formData.municipalityId;
            } else if (formData.role === 'utility' || formData.role === 'union_of_municipalities') {
                updates.scoped_municipalities = formData.scopedMunicipalities;
                
                if (formData.role === 'utility') {
                    updates.scoped_sub_categories = formData.scopedSubCategories;
                    // Derive parent categories for theming and high-level grouping
                    const parentCategories = new Set<ReportCategory>();
                    formData.scopedSubCategories.forEach(subId => {
                        for (const cat of categories) {
                            if (cat.subCategories.some((sc: any) => sc.id === subId)) {
                                parentCategories.add(cat.id);
                                break;
                            }
                        }
                    });
                    updates.scoped_categories = Array.from(parentCategories);
                }
            }
            
            await onSave(updates, mode, user?.id);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const isAddMode = mode === 'add';

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-xl m-4 flex flex-col relative max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark"><FaXmark /></button>
                <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-4">{isAddMode ? 'Add New Admin Account' : `Edit ${user?.display_name}`}</h2>
                <form onSubmit={handleSubmit} className="flex-grow min-h-0 flex flex-col gap-4 overflow-y-auto pr-2">
                    <div>
                        <label className="font-bold">Account Role</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as User['role']})} className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg">
                            <option value="municipality">Municipality</option>
                            <option value="union_of_municipalities">Union of Municipalities</option>
                            <option value="utility">Utility / Public Institution</option>
                        </select>
                    </div>
                    <div>
                        <label className="font-bold">Display Name</label>
                        <input type="text" value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} required className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg" />
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-bold">Portal Title (Optional)</label>
                            <input type="text" value={formData.portalTitle} onChange={e => setFormData({...formData, portalTitle: e.target.value})} placeholder="e.g., Tripoli Portal" className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg" />
                        </div>
                        <div>
                            <label className="font-bold">Portal Subtitle (Optional)</label>
                            <input type="text" value={formData.portalSubtitle} onChange={e => setFormData({...formData, portalSubtitle: e.target.value})} placeholder="e.g., Waste Management Dept." className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg" />
                        </div>
                    </div>
                    {formData.role === 'municipality' && (
                        <div>
                            <label className="font-bold">Municipality</label>
                            <select
                                value={formData.municipalityId}
                                onChange={e => setFormData({...formData, municipalityId: e.target.value})}
                                required
                                className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg capitalize"
                            >
                                <option value="" disabled>Select an unregistered municipality</option>
                                {availableMunicipalities.map(mun => (
                                    <option key={mun} value={mun}>{mun}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {(formData.role === 'utility' || formData.role === 'union_of_municipalities') && (
                        <div>
                            <label className="font-bold">Scoped Municipalities</label>
                            <div className="p-2 bg-muted dark:bg-bg-dark rounded-lg max-h-32 overflow-y-auto">
                                {[...new Set(allReports.map(r => r.municipality))].sort().map((mun: string) => (
                                    <label key={mun} className="flex items-center gap-2 p-1 capitalize">
                                        <input type="checkbox" checked={formData.scopedMunicipalities.includes(mun)} onChange={() => handleMultiSelectChange('scopedMunicipalities', mun)} />
                                        {mun}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {formData.role === 'utility' && (
                        <div>
                            <label className="font-bold">Scoped Categories & Sub-Categories</label>
                            <div className="p-2 bg-muted dark:bg-bg-dark rounded-lg max-h-40 overflow-y-auto">
                                {categories.map(cat => {
                                    const allSubIds = cat.subCategories.map((sc: any) => sc.id);
                                    const selectedSubs = allSubIds.filter((id: string) => formData.scopedSubCategories.includes(id));
                                    const isAllSelected = selectedSubs.length > 0 && selectedSubs.length === allSubIds.length;
                                    const isIndeterminate = selectedSubs.length > 0 && !isAllSelected;

                                    const handleParentChange = () => {
                                        const otherSubs = formData.scopedSubCategories.filter(id => !allSubIds.includes(id));
                                        if (isAllSelected) {
                                            setFormData(prev => ({ ...prev, scopedSubCategories: otherSubs }));
                                        } else {
                                            setFormData(prev => ({ ...prev, scopedSubCategories: [...otherSubs, ...allSubIds] }));
                                        }
                                    };
                                    
                                    return (
                                        <div key={cat.id} className="p-1">
                                            <label className="flex items-center gap-2 p-1 font-semibold">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    ref={el => { if (el) { el.indeterminate = isIndeterminate; } }}
                                                    onChange={handleParentChange}
                                                />
                                                {cat.name_en}
                                            </label>
                                            <div className="pl-6">
                                                {cat.subCategories.map((sub: any) => (
                                                    <label key={sub.id} className="flex items-center gap-2 p-1 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.scopedSubCategories.includes(sub.id)}
                                                            onChange={() => handleMultiSelectChange('scopedSubCategories', sub.id)}
                                                        />
                                                        {sub.name_en}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="font-bold">Username</label>
                        <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg" />
                    </div>
                    <div>
                        <label className="font-bold">{isAddMode ? 'Password' : 'New Password (optional)'}</label>
                        <input type="password" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} placeholder={isAddMode ? 'Default: password123' : 'Leave blank to keep current'} className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted dark:bg-bg-dark rounded-lg">
                        <label htmlFor="isActive" className="font-bold text-navy dark:text-text-primary-dark">Account Active</label>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" name="isActive" id="isActive" checked={formData.isActive} onChange={() => setFormData(prev => ({...prev, isActive: !prev.isActive}))} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                            <label htmlFor="isActive" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                        </div>
                        <style>{`.toggle-checkbox:checked { right: 0; border-color: #00BFA6; } .toggle-checkbox:checked + .toggle-label { background-color: #00BFA6; }`}</style>
                    </div>

                    <div className="flex justify-end gap-4 mt-auto pt-4">
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

export default AdminAccountEditModal;