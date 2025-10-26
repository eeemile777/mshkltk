import * as React from 'react';
import { DynamicCategory, DynamicSubCategory } from '../../types';
import { FaSpinner, FaXmark, FaPlus, FaTrash } from 'react-icons/fa6';
import { ICON_MAP } from '../../constants';

interface CategoryEditModalProps {
    mode: 'add' | 'edit';
    category?: DynamicCategory;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
}

const CategoryEditModal: React.FC<CategoryEditModalProps> = ({ mode, category, onClose, onSave }) => {
    const [formData, setFormData] = React.useState({
        name_en: category?.name_en || '',
        name_ar: category?.name_ar || '',
        icon: category?.icon || 'FaQuestion',
        color_light: category?.color_light || '#4A90E2',
        is_active: category?.is_active ?? true,
    });
    const [subCategories, setSubCategories] = React.useState<DynamicSubCategory[]>(category?.subCategories || []);
    const [isSaving, setIsSaving] = React.useState(false);

    const handleSubCategoryChange = (index: number, field: 'name_en' | 'name_ar', value: string) => {
        const newSubs = [...subCategories];
        newSubs[index] = { ...newSubs[index], [field]: value };
        setSubCategories(newSubs);
    };

    const handleAddSubCategory = () => {
        setSubCategories([...subCategories, { id: `new-${Date.now()}`, name_en: '', name_ar: '' }]);
    };
    
    const handleRemoveSubCategory = (id: string) => {
        setSubCategories(subCategories.filter(sub => sub.id !== id));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const dataToSave = { 
            ...formData, 
            subCategories: subCategories
        };
        if (mode === 'edit' && category) {
            await onSave({ id: category.id, ...dataToSave });
        } else {
            await onSave(dataToSave);
        }
    };
    
    const IconSelect: React.FC<{ value: string, onChange: (val: string) => void }> = ({ value, onChange }) => (
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-2 bg-muted dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-lg">
            {Object.keys(ICON_MAP).map(iconName => (
                <option key={iconName} value={iconName}>{iconName}</option>
            ))}
        </select>
    );

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] backdrop-blur-sm" onClick={onClose}>
            <div className="bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-2xl m-4 flex flex-col relative max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark"><FaXmark /></button>
                <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-6">{mode === 'add' ? 'Add New' : 'Edit'} Category</h2>
                <form onSubmit={handleSubmit} className="flex-grow min-h-0 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-bold">Name (EN)</label><input type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} required className="w-full p-2 bg-muted dark:bg-bg-dark border rounded-lg"/></div>
                        <div><label className="block text-sm font-bold">Name (AR)</label><input type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} required className="w-full p-2 bg-muted dark:bg-bg-dark border rounded-lg"/></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><label className="block text-sm font-bold">Icon</label><IconSelect value={formData.icon} onChange={val => setFormData({...formData, icon: val})} /></div>
                        <div><label className="block text-sm font-bold">Color</label><input type="color" value={formData.color_light} onChange={e => setFormData({...formData, color_light: e.target.value})} className="w-full h-10 p-1 bg-muted dark:bg-bg-dark border rounded-lg"/></div>
                    </div>
                     <div className="flex-grow min-h-0 overflow-y-auto pr-2">
                        <h3 className="font-bold my-2">Sub-Categories</h3>
                        <div className="space-y-2">
                            {subCategories.map((sub, index) => (
                                <div key={sub.id} className="flex items-center gap-2 p-2 bg-muted dark:bg-bg-dark rounded-lg">
                                    <input type="text" placeholder="Name (EN)" value={sub.name_en} onChange={e => handleSubCategoryChange(index, 'name_en', e.target.value)} className="flex-1 p-1 bg-card dark:bg-surface-dark border rounded"/>
                                    <input type="text" placeholder="Name (AR)" value={sub.name_ar} onChange={e => handleSubCategoryChange(index, 'name_ar', e.target.value)} className="flex-1 p-1 bg-card dark:bg-surface-dark border rounded"/>
                                    <button type="button" onClick={() => handleRemoveSubCategory(sub.id)} className="p-2 text-coral"><FaTrash /></button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={handleAddSubCategory} className="mt-2 w-full flex items-center justify-center gap-2 p-2 text-sm font-semibold text-teal border-2 border-dashed border-teal/50 rounded-lg hover:bg-teal/10"><FaPlus /> Add Sub-Category</button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted dark:bg-bg-dark rounded-lg mt-auto">
                        <label className="font-bold text-navy dark:text-text-primary-dark">Is Active</label>
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="h-6 w-6 rounded text-teal"/>
                    </div>

                    <div className="flex justify-end gap-4">
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

export default CategoryEditModal;
