import * as React from 'react';
import { useLocation } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import { SuperAdminContext } from '../../contexts/SuperAdminContext';
import { AppContext } from '../../contexts/AppContext';
import { PATHS } from '../../constants';

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

const SuperAdminLayout: React.FC<SuperAdminLayoutProps> = ({ children }) => {
  const { currentUser } = React.useContext(SuperAdminContext);
  const location = useLocation();
  const isReportFormPage = location.pathname === PATHS.SUPER_ADMIN_REPORT_NEW;
  
  // Special full-page layout for the Report Wizard to allow for full-screen steps.
  if (isReportFormPage) {
    return (
      <div className="h-screen w-screen bg-sand dark:bg-bg-dark">
          <main className="h-full w-full">{children}</main>
      </div>
    )
  }
  
  return (
    <div className="h-screen flex bg-sand dark:bg-bg-dark text-text-primary dark:text-text-primary-dark">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm shadow-sm h-16 flex items-center justify-end px-6 flex-shrink-0 z-10">
            {currentUser && (
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-text-primary dark:text-text-primary-dark">{currentUser.display_name}</span>
                    <img src={currentUser.avatarUrl} alt={currentUser.display_name} className="w-9 h-9 rounded-full ring-2 ring-coral dark:ring-coral-dark"/>
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

export default SuperAdminLayout;