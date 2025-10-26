import * as React from 'react';
import { AppContext } from '../../contexts/AppContext';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { DynamicCategory, ReportCategory } from '../../types';
import { FaChevronDown, FaXmark } from 'react-icons/fa6';
import { ICON_MAP } from '../../constants';

interface CategorySelectionModalProps {
  onClose: () => void;
  onSelect: (category: ReportCategory, subCategoryKey: string) => void;
  currentCategory?: ReportCategory | null;
  currentSubCategory?: string | null;
}

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({ onClose, onSelect, currentCategory, currentSubCategory }) => {
  const { t, language, theme } = React.useContext(AppContext);
  const { categories } = React.useContext(SuperAdminContext);
  const [openCategory, setOpenCategory] = React.useState<ReportCategory | null>(currentCategory || null);

  const handleSelect = (categoryKey: ReportCategory, subCategoryKey: string) => {
    onSelect(categoryKey, subCategoryKey);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card dark:bg-surface-dark rounded-2xl p-6 w-full max-w-lg m-4 flex flex-col relative max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark">
          <FaXmark size={20} />
        </button>
        <h2 className="text-2xl font-bold text-navy dark:text-text-primary-dark mb-6 text-center">{t.selectCategory}</h2>
        <div className="overflow-y-auto space-y-2 pr-2">
          {categories.map(category => {
            const categoryKey = category.id;
            const Icon = ICON_MAP[category.icon] || ICON_MAP['FaQuestion'];
            const isOpen = openCategory === categoryKey;
            const categoryColor = theme === 'dark' ? category.color_dark : category.color_light;

            return (
              <div key={categoryKey} className="border border-border-light dark:border-border-dark rounded-xl">
                <button
                  onClick={() => setOpenCategory(isOpen ? null : categoryKey)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6"><Icon style={{ color: categoryColor }} /></span>
                    <span className="font-bold text-lg text-navy dark:text-text-primary-dark">
                      {language === 'ar' ? category.name_ar : category.name_en}
                    </span>
                  </div>
                  <span className={`transition-transform duration-300 inline-block ${isOpen ? 'rotate-180' : ''}`}><FaChevronDown /></span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 space-y-1">
                    {category.subCategories.map(subCategory => {
                      const isSelected = currentCategory === categoryKey && currentSubCategory === subCategory.id;
                      return (
                        <button
                          key={subCategory.id}
                          onClick={() => handleSelect(categoryKey, subCategory.id)}
                          className={`w-full text-left p-3 rounded-lg text-navy dark:text-text-primary-dark hover:bg-muted dark:hover:bg-bg-dark ${isSelected ? 'bg-teal/10 font-semibold' : ''}`}
                        >
                          {language === 'ar' ? subCategory.name_ar : subCategory.name_en}
                        </button>
                      );
                    })}
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

export default CategorySelectionModal;
