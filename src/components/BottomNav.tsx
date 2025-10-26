import * as React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { PATHS } from '../constants';
import { FaLocationDot, FaPlus, FaFire } from 'react-icons/fa6';

const BottomNav: React.FC = () => {
  const { t, startWizard } = React.useContext(AppContext);
  const navigate = useNavigate();

  const navItems = [
    { path: PATHS.HOME, label: t.navMap, icon: FaLocationDot },
    { path: PATHS.TRENDING, label: t.navTrending, icon: FaFire, tourId: 'trending' },
  ];
  
  const handleFabClick = () => {
    startWizard();
    navigate(PATHS.REPORT_FORM);
  }

  const navLinkClasses = "flex flex-col items-center justify-center w-full text-text-secondary dark:text-text-secondary-dark hover:text-teal dark:hover:text-teal-dark transition-colors";
  const activeNavLinkClasses = "text-teal dark:text-teal-dark";
  
  const MapIcon = navItems[0].icon;
  const TrendingIcon = navItems[1].icon;

  return (
    <>
      <nav className="h-20 bg-card/80 dark:bg-surface-dark/80 backdrop-blur-lg border-t border-border-light dark:border-border-dark fixed bottom-0 inset-x-0 z-50">
        <div className="grid grid-cols-3 items-center h-full max-w-lg mx-auto">
            <NavLink
              key={navItems[0].path}
              to={navItems[0].path}
              end={true}
              className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
            >
              <span className="h-6 w-6 mb-1 flex items-center justify-center"><MapIcon /></span>
              <span className="text-xs">{navItems[0].label}</span>
            </NavLink>

            <div className="relative flex justify-center">
                <button 
                  onClick={handleFabClick} 
                  className="w-20 h-20 bg-teal text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-xl hover:shadow-2xl active:scale-95 transform -translate-y-6 ring-4 ring-sand dark:ring-bg-dark"
                  aria-label={t.navReport}
                  data-tour-id="new-report"
                >
                    <span className="w-8 h-8"><FaPlus/></span>
                </button>
            </div>
            
            <NavLink
              key={navItems[1].path}
              to={navItems[1].path}
              className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
              data-tour-id={navItems[1].tourId}
            >
              <span className="h-6 w-6 mb-1 flex items-center justify-center"><TrendingIcon /></span>
              <span className="text-xs">{navItems[1].label}</span>
            </NavLink>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;