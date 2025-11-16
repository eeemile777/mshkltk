import React from 'react';
import { AppContext } from '../../contexts/AppContext';
import { PortalContext } from '../../contexts/PortalContext';
import { ReportCategory, ReportStatus } from '../../types';
import { STATUS_COLORS } from '../../constants';
import { FaFilter, FaListCheck, FaXmark } from 'react-icons/fa6';

interface PortalReportFiltersProps {
    activeCategories: Set<ReportCategory>;
    setActiveCategories: React.Dispatch<React.SetStateAction<Set<ReportCategory>>>;
    activeStatuses: Set<ReportStatus>;
    setActiveStatuses: React.Dispatch<React.SetStateAction<Set<ReportStatus>>>;
}

const FilterDropdown: React.FC<{
    type: 'category' | 'status';
    activeSet: Set<string>;
    onToggle: (value: any) => void;
}> = ({ type, activeSet, onToggle }) => {
    // FIX: Destructure `language` from AppContext to correctly determine which category name to display.
    const { t, theme, language } = React.useContext(AppContext);
    const { categories } = React.useContext(PortalContext);
    const [isOpen, setIsOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isCategory = type === 'category';
    const label = isCategory ? t.filterByCategory : t.filterByStatus;
    const Icon = isCategory ? FaFilter : FaListCheck;
    const options = isCategory ? (Object.keys(categories) as ReportCategory[]) : Object.values(ReportStatus);

    const buttonClasses = `flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-surface-dark focus:ring-teal dark:focus:ring-teal-dark ${
        activeSet.size > 0
            ? 'bg-teal/20 dark:bg-teal-dark/20 text-navy dark:text-text-primary-dark'
            : 'bg-muted dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark'
    }`;

    return (
        <div className="relative" ref={dropdownRef}>
            <button className={buttonClasses} onClick={() => setIsOpen(v => !v)}>
                <Icon /> {label} {activeSet.size > 0 && `(${activeSet.size})`}
            </button>
            {isOpen && (
                <div className="absolute top-full mt-2 w-56 bg-card dark:bg-surface-dark rounded-xl shadow-lg p-2 z-20 border border-border-light dark:border-border-dark">
                    {options.map(opt => {
                        const checked = activeSet.has(opt);
                        const categoryData = isCategory ? categories[opt as ReportCategory] : null;
                        const ItemIcon = categoryData?.icon;
                        const colorClass = !isCategory ? (STATUS_COLORS[opt as ReportStatus][theme === 'dark' ? 'dark' : 'light'].split(' ').find(c => c.startsWith('bg-'))) || '' : '';
                        // FIX: Compare against `language` instead of `theme` for correct translation.
                        const name = isCategory && categoryData ? (language === 'ar' ? categoryData.name_ar : categoryData.name_en) : t[opt];
                        return (
                            <label key={opt} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-muted dark:hover:bg-bg-dark cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => onToggle(opt)}
                                    className="h-4 w-4 rounded text-teal dark:text-teal-dark focus:ring-teal dark:focus:ring-teal-dark bg-muted dark:bg-bg-dark border-border-light dark:border-border-dark"
                                />
                                {ItemIcon && <ItemIcon className="text-text-secondary dark:text-text-secondary-dark" />}
                                {!isCategory && <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>}
                                <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">{name}</span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const PortalReportFilters: React.FC<PortalReportFiltersProps> = ({
    activeCategories,
    setActiveCategories,
    activeStatuses,
    setActiveStatuses
}) => {
    const { t } = React.useContext(AppContext);

    const toggleCategory = (category: ReportCategory) => {
        setActiveCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) newSet.delete(category);
            else newSet.add(category);
            return newSet;
        });
    };
    
    const toggleStatus = (status: ReportStatus) => {
        setActiveStatuses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(status)) newSet.delete(status);
            else newSet.add(status);
            return newSet;
        });
    };
    
    const clearFilters = () => {
        setActiveCategories(new Set());
        setActiveStatuses(new Set());
    };

    const hasActiveFilters = activeCategories.size > 0 || activeStatuses.size > 0;

    return (
        <div className="bg-card dark:bg-surface-dark p-4 rounded-2xl shadow-lg flex items-center gap-4">
            <FilterDropdown type="category" activeSet={activeCategories} onToggle={toggleCategory} />
            <FilterDropdown type="status" activeSet={activeStatuses} onToggle={toggleStatus} />
            {hasActiveFilters && (
                 <button onClick={clearFilters} className="flex items-center gap-2 text-sm font-semibold text-coral dark:text-coral-dark hover:underline">
                    <FaXmark />
                    {t.clearFilters}
                 </button>
            )}
        </div>
    );
};

export default PortalReportFilters;