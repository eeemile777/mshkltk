import * as React from 'react';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { DynamicCategory, ReportCategory } from '../../types';
import Spinner from '../../components/Spinner';
import { FaPenToSquare, FaTrash, FaPlus, FaToggleOn, FaToggleOff, FaChevronDown, FaSpinner } from 'react-icons/fa6';
import { ICON_MAP } from '../../constants';
import CategoryEditModal from '../../components/superadmin/CategoryEditModal';


const SuperAdminCategoriesPage: React.FC = () => {
    const { categories, loading, addCategory, updateCategory, deleteCategory } = React.useContext(SuperAdminContext);
    const [modalState, setModalState] = React.useState<{ mode: 'add' | 'edit'; category?: DynamicCategory } | null>(null);
    const [expandedCategory, setExpandedCategory] = React.useState<string | null>(null);
    const [updatingCategoryId, setUpdatingCategoryId] = React.useState<string | null>(null);

    const handleSave = async (categoryData: DynamicCategory | Omit<DynamicCategory, 'id'>) => {
        if (modalState?.mode === 'edit' && 'id' in categoryData) {
            await updateCategory(categoryData as DynamicCategory);
        } else if (modalState?.mode === 'add') {
            await addCategory(categoryData as Omit<DynamicCategory, 'id'>);
        }
        setModalState(null);
    };

    const handleDelete = async (category: DynamicCategory) => {
        if (window.confirm(`Are you sure you want to delete the category "${category.name_en}"?`)) {
            await deleteCategory(category);
        }
    };
    
    const toggleExpand = (categoryId: string) => {
        setExpandedCategory(prev => prev === categoryId ? null : categoryId);
    };

    const handleToggleActive = async (e: React.MouseEvent, category: DynamicCategory) => {
        e.stopPropagation(); // Prevent row expand/collapse
        setUpdatingCategoryId(category.id);
        try {
            await updateCategory({ ...category, is_active: !category.is_active });
        } catch (error) {
            console.error("Failed to toggle category status:", error);
            alert("Failed to update status.");
        } finally {
            setUpdatingCategoryId(null);
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Spinner /></div>;
    
    return (
        <div>
            {modalState && <CategoryEditModal mode={modalState.mode} category={modalState.category} onClose={() => setModalState(null)} onSave={handleSave} />}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-navy dark:text-text-primary-dark">Manage Categories</h1>
                <button 
                    onClick={() => setModalState({ mode: 'add' })}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-teal text-white"
                >
                    <FaPlus /> Add Category
                </button>
            </div>
            
            <div className="bg-card dark:bg-surface-dark rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 grid grid-cols-6 font-bold text-text-secondary dark:text-text-secondary-dark bg-muted dark:bg-border-dark/20">
                    <div className="col-span-2">Category Name</div>
                    <div>Sub-Categories</div>
                    <div>Color</div>
                    <div>Status</div>
                    <div>Actions</div>
                </div>
                <div className="divide-y divide-border-light dark:divide-border-dark">
                    {categories.map((category) => {
                       const Icon = ICON_MAP[category.icon] || ICON_MAP['FaQuestion'];
                       const isExpanded = expandedCategory === category.id;
                       return (
                           <div key={category.id}>
                                <div className="p-4 grid grid-cols-6 items-center hover:bg-muted/50 dark:hover:bg-surface-dark/50 cursor-pointer" onClick={() => toggleExpand(category.id)}>
                                    <div className="col-span-2 flex items-center gap-3">
                                       <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${category.color_light}20` }}>
                                           <Icon style={{ color: category.color_light }} size={20} />
                                       </div>
                                       <span className="font-bold text-navy dark:text-text-primary-dark">{category.name_en} / {category.name_ar}</span>
                                    </div>
                                    <div className="flex items-center gap-2">{category.subCategories.length} <FaChevronDown className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} /></div>
                                    <div className="flex items-center gap-2">
                                       <div className="w-6 h-6 rounded-full border border-border-light dark:border-border-dark" style={{ backgroundColor: category.color_light }}></div>
                                       <div className="w-6 h-6 rounded-full border border-border-light dark:border-border-dark" style={{ backgroundColor: category.color_dark }}></div>
                                    </div>
                                    <div>
                                       {updatingCategoryId === category.id ? (
                                           <FaSpinner className="animate-spin text-teal" />
                                       ) : (
                                           <button onClick={(e) => handleToggleActive(e, category)} className="w-full text-left">
                                               {category.is_active ? 
                                                   <span className="flex items-center gap-2 text-teal dark:text-teal-dark"><FaToggleOn /> Active</span> :
                                                   <span className="flex items-center gap-2 text-text-secondary dark:text-text-secondary-dark"><FaToggleOff /> Disabled</span>
                                               }
                                           </button>
                                       )}
                                    </div>
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                      <button onClick={() => setModalState({ mode: 'edit', category })} className="p-2 text-sky dark:text-cyan-dark hover:bg-sky/10 rounded-full" title="Edit Category"><FaPenToSquare /></button>
                                      <button onClick={() => handleDelete(category)} className="p-2 text-coral dark:text-coral-dark hover:bg-coral/10 rounded-full" title="Delete Category"><FaTrash /></button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="p-4 pl-16 bg-muted/50 dark:bg-surface-dark/50 animate-fade-in">
                                        <h4 className="font-bold text-sm mb-2">Sub-Categories:</h4>
                                        <ul className="list-disc list-inside text-text-secondary dark:text-text-secondary-dark space-y-1">
                                            {category.subCategories.map(sub => (
                                                <li key={sub.id}>{sub.name_en} / {sub.name_ar}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                           </div>
                       );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SuperAdminCategoriesPage;