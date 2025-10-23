import * as React from 'react';
import { useLocation } from 'react-router-dom';
import PortalSidebar from './PortalSidebar';
import { PortalContext } from '../../contexts/PortalContext';
import { AppContext } from '../../contexts/AppContext';

interface PortalLayoutProps {
  children: React.ReactNode;
}

const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  const { currentUser, refreshData, portalThemeColor } = React.useContext(PortalContext);
  const { language } = React.useContext(AppContext);
  const location = useLocation();

  React.useEffect(() => {
    refreshData();
  }, [location.pathname, refreshData]);

  return (
    <div 
      className="h-screen flex bg-sand dark:bg-bg-dark text-text-primary dark:text-text-primary-dark"
      style={{ '--portal-theme-color': portalThemeColor } as React.CSSProperties}
    >
      <PortalSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm shadow-sm h-16 flex items-center justify-end px-6 flex-shrink-0 z-10">
            {currentUser && (
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{currentUser.display_name}</span>
                    <img src={currentUser.avatarUrl} alt={currentUser.display_name} className="w-9 h-9 rounded-full ring-2 ring-[var(--portal-theme-color)]"/>
                </div>
            )}
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;