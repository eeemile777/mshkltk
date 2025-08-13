import * as React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { PATHS, CATEGORY_ICONS } from '../constants';
import { FaMapMarkerAlt, FaPlus, FaFire } from 'react-icons/fa';
import { ReportCategory } from '../types';

const BottomNav: React.FC = () => {
  const { t } = React.useContext(AppContext);
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = React.useState(false);

  const navItems = [
    { path: PATHS.HOME, label: t.navMap, icon: FaMapMarkerAlt },
    { path: PATHS.TRENDING, label: t.navTrending, icon: FaFire },
  ];

  const quickActions = [
      { category: ReportCategory.Roads, icon: CATEGORY_ICONS[ReportCategory.Roads] },
      { category: ReportCategory.Waste, icon: CATEGORY_ICONS[ReportCategory.Waste] },
      { category: ReportCategory.Lighting, icon: CATEGORY_ICONS[ReportCategory.Lighting] },
      { category: ReportCategory.Other, icon: CATEGORY_ICONS[ReportCategory.Other] },
  ];

  const handleFabClick = () => {
    setFabOpen(prev => !prev);
  };
  
  const handleQuickActionClick = (category: ReportCategory) => {
    setFabOpen(false);
    navigate(PATHS.REPORT_FORM, { state: { category } });
  }

  const navLinkClasses = "flex flex-col items-center justify-center w-full text-text-secondary dark:text-text-secondary-dark hover:text-teal dark:hover:text-teal-dark transition-colors";
  const activeNavLinkClasses = "text-teal dark:text-teal-dark";
  
  const MapIcon = navItems[0].icon;
  const TrendingIcon = navItems[1].icon;

  return (
    <>
      {/* Backdrop for open FAB */}
      {fabOpen && <div onClick={() => setFabOpen(false)} className="fixed inset-0 bg-black/30 z-40"></div>}
      
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/80 dark:bg-surface-dark/80 backdrop-blur-lg border-t border-border-light dark:border-border-dark z-50">
        <div className="grid grid-cols-3 items-center h-full max-w-lg mx-auto">
            <NavLink
              key={navItems[0].path}
              to={navItems[0].path}
              end={true}
              className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
            >
              <MapIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">{navItems[0].label}</span>
            </NavLink>

            <div className="relative flex justify-center">
                {/* Quick Action Buttons */}
                <div className={`absolute bottom-full flex flex-col items-center gap-4 mb-5 transition-all duration-300 ease-in-out ${fabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {quickActions.map(({category, icon: Icon}) => (
                        <div key={category} className="flex items-center gap-3">
                            <span className="bg-card dark:bg-surface-dark text-sm px-3 py-1 rounded-full shadow-md">{t[category]}</span>
                            <button onClick={() => handleQuickActionClick(category)} className="w-14 h-14 bg-card dark:bg-surface-dark rounded-full shadow-lg flex items-center justify-center text-teal dark:text-teal-dark hover:scale-110 transition-transform">
                                <Icon className="w-6 h-6"/>
                            </button>
                        </div>
                    ))}
                </div>
                 {/* FAB Button */}
                <button 
                  onClick={handleFabClick} 
                  className={`w-20 h-20 bg-teal text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-xl hover:shadow-2xl active:scale-95 transform -translate-y-6 ring-4 ring-sand dark:ring-bg-dark ${fabOpen ? 'rotate-45' : ''}`}
                  aria-label={t.navReport}
                >
                    <FaPlus className="w-8 h-8" />
                </button>
            </div>
            
            <NavLink
              key={navItems[1].path}
              to={navItems[1].path}
              className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
            >
              <TrendingIcon className="h-6 w-6 mb-1" />
              <span className="text-xs">{navItems[1].label}</span>
            </NavLink>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;