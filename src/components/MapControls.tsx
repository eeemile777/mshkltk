import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { ReportCategory, ReportStatus, TimeFilter } from '../types';
import { STATUS_COLORS } from '../constants';
import { FaLayerGroup, FaSliders, FaClock } from 'react-icons/fa6';

const FilterPill: React.FC<{
    type: 'category' | 'status';
}> = ({ type }) => {
    const {
        t, theme, language, categories,
        activeCategories, toggleCategory, clearCategories,
        activeStatuses, toggleStatus, clearStatuses,
    } = React.useContext(AppContext);

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
    const activeSet = isCategory ? activeCategories : activeStatuses;
    const label = isCategory ? t.filters : t.status;
    const Icon = isCategory ? FaLayerGroup : FaSliders;
    const handleClear = isCategory ? clearCategories : clearStatuses;

    const isActive = activeSet.size > 0;
    const pillClasses = `relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-teal dark:focus:ring-teal-dark ${isActive
        ? 'bg-teal dark:bg-teal-dark text-white'
        : 'bg-navy dark:bg-sand text-sand dark:text-navy'
        }`;

    const dropdownPositionClasses = 'top-full mt-2 right-0 origin-top-right';

    const dropdownClasses = `absolute ${dropdownPositionClasses} w-56 bg-card dark:bg-surface-dark rounded-2xl shadow-xl p-2 z-10 flex flex-col gap-1 transition-all duration-200 custom-scrollbar max-h-[60vh] overflow-y-auto ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`;
    
    const baseItemClasses = "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-start transition-colors hover:bg-muted dark:hover:bg-bg-dark focus:outline-none focus:bg-muted dark:focus:bg-bg-dark";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className={pillClasses}
                onClick={() => setIsOpen(v => !v)}
                aria-pressed={isActive}
                aria-expanded={isOpen}
                aria-controls={`${type}-dropdown`}
            >
                <Icon />
                <span>{label}</span>
                {isActive && <span className="bg-white/20 text-white text-xs font-bold rounded-full px-2">{activeSet.size}</span>}
            </button>
            <div id={`${type}-dropdown`} role="menu" className={dropdownClasses}>
                {isCategory
                    ? (Object.keys(categories) as ReportCategory[]).map(catKey => {
                        const checked = activeCategories.has(catKey);
                        const category = categories[catKey];
                        if (!category) return null; // Safeguard if category object is not ready
                        const ItemIcon = category.icon;
                        return (
                             <button
                                key={catKey}
                                role="menuitemcheckbox"
                                aria-checked={checked}
                                className={`${baseItemClasses} ${checked ? 'bg-teal/10 dark:bg-teal-dark/20' : ''}`}
                                onClick={() => toggleCategory(catKey)}
                            >
                                <ItemIcon className={checked ? "text-teal dark:text-teal-dark" : "text-text-secondary dark:text-text-secondary-dark"} />
                                <span className={`text-base ${checked ? 'font-bold text-navy dark:text-text-primary-dark' : 'font-medium text-text-secondary dark:text-text-secondary-dark'}`}>
                                    {language === 'ar' ? category.name_ar : category.name_en}
                                </span>
                            </button>
                        );
                    })
                    : Object.values(ReportStatus).map(stat => {
                        const checked = activeStatuses.has(stat);
                        const colorClass = (STATUS_COLORS[stat][theme === 'dark' ? 'dark' : 'light'].split(' ').find(c => c.startsWith('bg-'))) || '';
                        return (
                             <button
                                key={stat}
                                role="menuitemcheckbox"
                                aria-checked={checked}
                                className={`${baseItemClasses} ${checked ? 'bg-teal/10 dark:bg-teal-dark/20' : ''}`}
                                onClick={() => toggleStatus(stat)}
                            >
                                <span className={`w-3 h-3 rounded-full ${colorClass}`}></span>
                                <span className={`text-base ${checked ? 'font-bold text-navy dark:text-text-primary-dark' : 'font-medium text-text-secondary dark:text-text-secondary-dark'}`}>
                                    {t[stat]}
                                </span>
                            </button>
                        );
                    })
                }
                <div className="border-t border-border-light dark:border-border-dark my-1"></div>
                <div className="p-1">
                    <button onClick={handleClear} className="w-full text-center px-3 py-1.5 text-sm font-semibold rounded-lg text-coral dark:text-coral-dark hover:bg-coral/10">
                        {t.reset}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TimeFilterPill: React.FC = () => {
    const { t, activeTimeFilter, setTimeFilter } = React.useContext(AppContext);
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

    const timeOptions = [
        { id: TimeFilter.All, label: t.time_all },
        { id: TimeFilter.Day, label: t.time_day },
        { id: TimeFilter.Week, label: t.time_week },
        { id: TimeFilter.Month, label: t.time_month },
    ];

    const isActive = activeTimeFilter !== TimeFilter.All;
    const currentLabel = timeOptions.find(o => o.id === activeTimeFilter)?.label || t.timeFilter;

    const pillClasses = `relative flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-full shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-teal dark:focus:ring-teal-dark ${isActive
        ? 'bg-teal dark:bg-teal-dark text-white'
        : 'bg-navy dark:bg-sand text-sand dark:text-navy'
        }`;
    
    const dropdownPositionClasses = 'top-full mt-2 right-0 origin-top-right';
    const dropdownClasses = `absolute ${dropdownPositionClasses} w-56 bg-card dark:bg-surface-dark rounded-2xl shadow-xl p-2 z-10 flex flex-col gap-1 transition-all duration-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`;
    const baseItemClasses = "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-start transition-colors hover:bg-muted dark:hover:bg-bg-dark focus:outline-none focus:bg-muted dark:focus:bg-bg-dark";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                className={pillClasses}
                onClick={() => setIsOpen(v => !v)}
                aria-pressed={isActive}
                aria-expanded={isOpen}
                aria-controls="time-dropdown"
            >
                <FaClock />
                <span>{currentLabel}</span>
            </button>
            <div id="time-dropdown" role="menu" className={dropdownClasses}>
                {timeOptions.map(option => {
                    const checked = activeTimeFilter === option.id;
                    return (
                        <button
                            key={option.id}
                            role="menuitemradio"
                            aria-checked={checked}
                            className={`${baseItemClasses} ${checked ? 'bg-teal/10 dark:bg-teal-dark/20' : ''}`}
                            onClick={() => { setTimeFilter(option.id); setIsOpen(false); }}
                        >
                             <span className={`text-base ${checked ? 'font-bold text-navy dark:text-text-primary-dark' : 'font-medium text-text-secondary dark:text-text-secondary-dark'}`}>
                                {option.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const MapControls: React.FC = () => {
    const { activeCategories, setCategories, activeStatuses, setStatuses, categories } = React.useContext(AppContext);
    const [searchParams, setSearchParams] = useSearchParams();

    // Effect to synchronize URL query params to context state on initial load
    React.useEffect(() => {
        // Only run if categories have been loaded
        if (Object.keys(categories).length === 0) return;

        const catsFromUrl = searchParams.get('cat')?.split(',') ?? [];
        const statsFromUrl = searchParams.get('status')?.split(',') ?? [];

        const validCats = catsFromUrl.filter(c => Object.keys(categories).includes(c as ReportCategory));
        const validStatuses = statsFromUrl.filter(s => Object.values(ReportStatus).includes(s as ReportStatus));

        setCategories(new Set(validCats as ReportCategory[]));
        setStatuses(new Set(validStatuses as ReportStatus[]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categories]); // Re-run if categories are loaded after initial mount

    // Effect to synchronize context state to URL query params (debounced)
    React.useEffect(() => {
        const handler = setTimeout(() => {
            const newParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
            if (activeCategories.size > 0) {
                newParams.set('cat', Array.from(activeCategories).join(','));
            } else {
                newParams.delete('cat');
            }
            if (activeStatuses.size > 0) {
                newParams.set('status', Array.from(activeStatuses).join(','));
            } else {
                newParams.delete('status');
            }
            const newSearch = newParams.toString();
            // Use replace to avoid polluting browser history
            setSearchParams(newSearch ? new URLSearchParams(newSearch) : undefined, { replace: true });

        }, 150);

        return () => clearTimeout(handler);
    }, [activeCategories, activeStatuses, setSearchParams]);


    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-2" data-tour-id="filters">
            <TimeFilterPill />
            <FilterPill type="status" />
            <FilterPill type="category" />
        </div>
    );
};

export default MapControls;