import * as React from 'react';
import { DynamicBadge, DynamicCategory, BadgeCriteriaType } from '../../types';
import { FaSpinner, FaXmark } from 'react-icons/fa6';
import { ICON_MAP } from '../../constants';

interface BadgeEditModalProps {
    mode: 'add' | 'edit';
    badge?: DynamicBadge;
    categories: DynamicCategory[];
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

const BadgeEditModal: React.FC<BadgeEditModalProps> = ({ mode, badge, categories, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        name_en: badge?.name_en || '',
        name_ar: badge?.name_ar || '',
        description_en: badge?.description_en || '',
        description_ar: badge?.description_ar || '',
        icon: badge?.icon || 'FaTrophy',
        is_active: badge?.is_active ?? true,
        criteria: badge?.criteria || { type: 'report_count', value: 1 },
    });
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (mode === 'edit' && badge) {
            await onSave({ id: badge.id, ...formData });
        } else {
            await onSave(formData);
        }
    };
    
    const handleCriteriaChange = (field: keyof DynamicBadge['criteria'], value: any) => {
        const newCriteria = { ...formData.criteria, [field]: value };
        if (field === 'type' && value !== 'report_count') {
            delete newCriteria.category_filter;
        }
        setFormData({ ...formData, criteria: newCriteria });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-lg m-4 flex flex-col relative max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark"><FaXmark /></button>
                <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-6">{mode === 'add' ? 'Add New' : 'Edit'} Badge</h2>
                <form onSubmit={handleSubmit} className="flex-grow min-h-0 flex flex-col gap-4 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="font-bold">Name (EN)</label><input type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} required className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg"/></div>
                        <div><label className="font-bold">Name (AR)</label><input type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} required className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg"/></div>
                    </div>
                     <div><label className="font-bold">Description (EN)</label><input type="text" value={formData.description_en} onChange={e => setFormData({...formData, description_en: e.target.value})} required className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg"/></div>
                     <div><label className="font-bold">Description (AR)</label><input type="text" value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} required className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg"/></div>
                    <div>
                        <label className="font-bold">Icon</label>
                        <select value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full p-2 bg-muted dark:bg-bg-dark rounded-lg">
                            {Object.keys(ICON_MAP).map(iconName => <option key={iconName} value={iconName}>{iconName}</option>)}
                        </select>
                    </div>
                    <div>
                        <h3 className="font-bold mb-2">Criteria</h3>
                        <div className="p-3 bg-muted dark:bg-bg-dark rounded-lg grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-semibold">Type</label>
                                <select value={formData.criteria.type} onChange={e => handleCriteriaChange('type', e.target.value as BadgeCriteriaType)} className="w-full p-1 bg-card dark:bg-surface-dark rounded">
                                    <option value="report_count">Report Count</option>
                                    <option value="confirmation_count">Confirmation Count</option>
                                    <option value="point_threshold">Point Threshold</option>
                                </select>
                            </div>
                             <div>
                                <label className="text-sm font-semibold">Value</label>
                                <input type="number" value={formData.criteria.value} onChange={e => handleCriteriaChange('value', parseInt(e.target.value, 10) || 0)} className="w-full p-1 bg-card dark:bg-surface-dark rounded"/>
                            </div>
                            {formData.criteria.type === 'report_count' && (
                                <div className="col-span-2">
                                    <label className="text-sm font-semibold">Category Filter (Optional)</label>
                                    <select value={formData.criteria.category_filter || ''} onChange={e => handleCriteriaChange('category_filter', e.target.value || undefined)} className="w-full p-1 bg-card dark:bg-surface-dark rounded">
                                        <option value="">Any Category</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name_en}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted dark:bg-bg-dark rounded-lg">
                        <label className="font-bold text-navy dark:text-text-primary-dark">Is Active</label>
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="h-6 w-6 rounded text-teal"/>
                    </div>
                    <div className="flex justify-end gap-4 mt-auto pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-bold rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-teal text-white font-bold rounded-lg disabled:bg-gray-400">
                            {isSaving ? <span className="animate-spin"><FaSpinner/></span> : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BadgeEditModal;
